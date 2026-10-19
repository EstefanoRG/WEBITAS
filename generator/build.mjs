// Generador WEBITAS.
// Fuente: Supabase (REST) · CSV local · muestra.
// Salida:
//   docs/index.html               -> página neutra (no revela nada)
//   docs/<codigo>/index.html      -> PANEL compartido (solo con el código)
//   docs/demo/<slug>/index.html   -> cada demo
// Reglas: dedupe por teléfono, prioridad automática (o manual), orden por prioridad.
import { readFile, writeFile, mkdir, rm, cp, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, isAbsolute } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
try { process.loadEnvFile?.(join(ROOT, ".env")); } catch {}

const TEMPLATES = join(ROOT, "templates");
const DOCS = join(ROOT, "docs");
const DEMO_DIR = join(DOCS, "demo");

const config = JSON.parse(await readFile(join(ROOT, "generator", "config.json"), "utf8"));
const CODIGO = config.codigo;

// Supabase: URL pública + clave. La service_role (env) manda; si no hay, uso la
// anon pública (solo LEE) para que el build funcione sin secretos (p. ej. en CI).
const SB_URL = process.env.SUPABASE_URL || (config.supabase && config.supabase.url) || "";
const SB_KEY = process.env.SUPABASE_KEY || (config.supabase && config.supabase.anonKey) || "";
const SB_TABLE = (config.supabase && config.supabase.tabla) || "prospectos";
const SB_ON = !!(SB_URL && SB_KEY) && !process.env.DATA_CSV;

// Fuente de datos:
//   1) DATA_CSV  -> fuerza un CSV concreto (override; salta Supabase)
//   2) Supabase  -> si hay URL + clave
//   3) CSV local -> prospectos_consolidado.csv (o "WEBITAS - prospectos_consolidado.csv")
//   4) data/empresas.csv -> muestra versionada (fallback)
const CSV_CANDIDATES = [
  join(ROOT, "prospectos_consolidado.csv"),
  join(ROOT, "WEBITAS - prospectos_consolidado.csv"),
  join(ROOT, "data", "empresas.csv"),
];
function resolveDataCsv() {
  if (process.env.DATA_CSV)
    return isAbsolute(process.env.DATA_CSV) ? process.env.DATA_CSV : join(ROOT, process.env.DATA_CSV);
  return CSV_CANDIDATES.find((p) => existsSync(p)) || CSV_CANDIDATES[CSV_CANDIDATES.length - 1];
}
const relRoot = (p) => p.replace(ROOT + "\\", "").replace(ROOT + "/", "");

// Supabase REST -> mismas filas (todo a string) que el CSV, para reusar el resto.
async function supabaseRows() {
  const url = SB_URL.replace(/\/+$/, "") + "/rest/v1/" + SB_TABLE + "?select=*";
  const res = await fetch(url, {
    headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Supabase " + res.status + " · " + (await res.text()).slice(0, 200));
  const rows = await res.json();
  return rows.map((r) => {
    const o = {};
    for (const [k, v] of Object.entries(r)) o[k] = v == null ? "" : String(v);
    return o;
  });
}

/* ------------------------------------------------------------------ CSV --- */
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", q = false;
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => String(v).trim() !== ""));
}
function toObjects(rows) {
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o = {};
    header.forEach((h, i) => (o[h] = String(r[i] ?? "").trim()));
    return o;
  });
}

/* -------------------------------------------------------------- helpers --- */
const isNo = (v) => /^(no|0|false|f|n|✗)$/i.test(String(v).trim());
const slugify = (s) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "negocio";
const digits = (s) => String(s || "").replace(/\D/g, "");
const enc = (s) => encodeURIComponent(s || "");

function priority(r) {
  const man = String(r.prioridad_manual || "").trim();
  if (man !== "" && !isNaN(Number(man))) return Number(man);
  let p = 0;
  const tieneWeb = r.tiene_web ? !isNo(r.tiene_web) && /^(si|sí|1|true|yes|✓|x)$/i.test(r.tiene_web) : !!r.web_actual;
  if (!tieneWeb) p += 3;
  const res = Number(digits(r.resenas)) || 0;
  if (res >= 50) p += 3; else if (res >= 20) p += 2; else if (res >= 10) p += 1;
  const rt = Number(String(r.rating || "").replace(",", ".")) || 0;
  if (rt >= 4.5) p += 2; else if (rt >= 4.0) p += 1;
  return p;
}

// Fusiona por teléfono (o slug si no hay). Conserva lo ya trabajado.
function mergeRows(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = digits(r.telefono) || slugify(r.negocio);
    if (!map.has(key)) map.set(key, { ...r, _slug: slugify(r.negocio) });
    else {
      const cur = map.get(key);
      for (const [k, v] of Object.entries(r)) if (v && !cur[k]) cur[k] = v;
    }
  }
  const usados = new Map();
  for (const r of map.values()) {
    const s = r._slug, n = usados.get(s) || 0;
    if (n) r._slug = s + "-" + (n + 1);
    usados.set(s, n + 1);
  }
  return [...map.values()];
}

/* --------------------------------------------------------------- tokens --- */
function mark(name) {
  const parts = String(name).replace(/[^\p{L}\p{N} ]/gu, "").split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return String(name).replace(/\s+/g, "").slice(0, 3).toUpperCase();
}
function tokensFor(row) {
  const vk = (row.vendedor || config.vendedorDefault || "estefano").toLowerCase();
  const v = config.vendedores[vk] || config.vendedores[config.vendedorDefault];
  const negocio = row.negocio || "Mi Negocio";
  const ciudad = row.ciudad || "Lima";
  const direccion = row.direccion || ciudad + ", Perú";
  // Teléfono/WhatsApp del NEGOCIO (para NAP, tel:, WhatsApp y JSON-LD).
  // El número del VENDEDOR solo se usa en el botón "Activar mi página".
  const telDig = digits(row.telefono);
  const telTxt = String(row.telefono || "").trim();
  return {
    slug: row._slug,
    negocio, negocio_url: enc(negocio), negocio_mark: mark(negocio),
    ciudad, zona: row.zona || ciudad,
    direccion, direccion_url: enc(direccion),
    telefono: telTxt, telefono_tel: telDig ? "+" + telDig : "", whatsapp: telDig,
    vendedor_nombre: v.nombre, vendedor_whatsapp: v.whatsapp,
    email: row.email || "", horarios: row.horarios || "",
    instagram_user: row.instagram || "", instagram_url: row.instagram_url || "#",
    facebook_url: row.facebook || "#",
    year: String(new Date().getFullYear()),
  };
}
const fill = (t, tok) => t.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k) => (k in tok ? tok[k] : m));

/* --------------------------------------------------------------- render --- */
async function copyAssets(tplDir, outDir) {
  for (const d of ["img", "video", "assets", "fonts"]) {
    try { if ((await stat(join(tplDir, d))).isDirectory()) await cp(join(tplDir, d), join(outDir, d), { recursive: true }); }
    catch {}
  }
}
const counterTag = (slug) =>
  config.counter && config.counter.hit
    ? `\n  <script>(function(){try{fetch(${JSON.stringify(config.counter.hit + "/" + config.counter.namespace + "/" + slug)}).catch(function(){});}catch(e){}})();</script>\n`
    : "";

async function renderDemo(row) {
  const cfg = config.rubros[(row.rubro || "").toLowerCase()];
  if (!cfg) { console.warn(`  ! rubro "${row.rubro}" no existe (${row.negocio})`); return null; }
  const tplDir = join(TEMPLATES, cfg.plantilla);
  const outDir = join(DEMO_DIR, row._slug);
  const tok = tokensFor(row);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  let html = fill(await readFile(join(tplDir, "index.html"), "utf8"), tok);
  html = html.replace(/<\/body>/i, counterTag(row._slug) + "</body>");
  await writeFile(join(outDir, "index.html"), html, "utf8");

  for (const a of ["style.css", "script.js"]) {
    try { await writeFile(join(outDir, a), fill(await readFile(join(tplDir, a), "utf8"), tok), "utf8"); } catch {}
  }
  await copyAssets(tplDir, outDir);
  return { slug: row._slug, negocio: row.negocio, rubro: row.rubro, etiqueta: cfg.etiqueta, emoji: cfg.emoji };
}

/* ---------------------------------------------------------------- panel --- */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const cap = (s) => { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); };

function panel(rows) {
  const snapshot = rows.map((r) => ({
    id: r.id || "", _slug: r._slug, negocio: r.negocio || "", rubro: r.rubro || "",
    categoria: r.categoria || "", ciudad: r.ciudad || "",
    telefono: r.telefono || "", rating: r.rating || "", resenas: r.resenas || "",
    web_actual: r.web_actual || "", canal: r.canal || "", proximo_contacto: r.proximo_contacto || "",
    ultimo_contacto: r.ultimo_contacto || "", maps_url: r.maps_url || "", notas: r.notas || "",
    estado: r.estado || "Nuevo", vendedor: (r.vendedor || config.vendedorDefault || "").toLowerCase(),
    generar: !isNo(r.generar), prioridad: priority(r),
  }));
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(config.siteName)} · Panel</title>
<meta name="robots" content="noindex, nofollow">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#0b1a1d;--card:#122b31;--line:#1d444c;--text:#eaf3f4;--muted:#9dc0c5;--accent:#ea6a4b}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#0b1a1d,#0a3238);color:var(--text);font:15px/1.5 Inter,system-ui,sans-serif}
header{position:sticky;top:0;background:#0a2328;border-bottom:1px solid var(--line);padding:14px 20px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;z-index:5}
h1{font:700 1.2rem Outfit;margin:0;flex:1}
.pill{display:inline-block;padding:4px 10px;border-radius:999px;border:1px solid var(--line);font-size:.78rem;color:var(--muted);text-decoration:none}
.pill--edit{border-color:var(--accent);color:var(--accent);font-weight:600}
.estado{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.estado button{border-radius:999px;padding:4px 10px;font-size:.74rem;background:#15343b;border:1px solid var(--line);color:var(--text);cursor:pointer}
.estado button.on{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700}
.del{background:transparent;border:1px solid var(--line);color:var(--muted);border-radius:999px;padding:4px 10px;font-size:.74rem;cursor:pointer}
.del:hover{border-color:var(--accent);color:var(--accent)}
.wrap{padding:18px;max-width:1250px;margin:0 auto}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
select,input,button{font:inherit;color:var(--text);background:#15343b;border:1px solid var(--line);border-radius:9px;padding:8px 12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;display:grid;grid-template-columns:1fr auto;gap:6px 16px}
.card+.card{margin-top:10px}
.card h3{margin:0;font:600 1.08rem Outfit}
.meta{color:var(--muted);font-size:.85rem}
.row2{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px}
.tag{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;padding:3px 9px;border-radius:999px;border:1px solid var(--line)}
.v{font-weight:600}.v.estefano{color:#ffd0c4}.v.luigui{color:#8fd3c7}
a{color:var(--accent)}
.wa{background:#128c7e;border:1px solid #128c7e;color:#fff;border-radius:999px;padding:5px 12px;font-size:.8rem;cursor:pointer}
.wa:hover{filter:brightness(.95)}
.right{text-align:right;display:flex;flex-direction:column;gap:6px;align-items:flex-end}
.prio{font:700 1.6rem Outfit;color:var(--accent)}
.empty{color:var(--muted);padding:30px}
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:16px}
.metric{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 12px}
.metric b{display:block;font:700 1.5rem Outfit;color:var(--accent)}
.metric span{color:var(--muted);font-size:.72rem;text-transform:uppercase;letter-spacing:.05em}
</style></head><body>
<header>
  <h1>🗂️ ${esc(config.siteName)} · Panel</h1>
  <span class="pill" id="cnt">…</span>
  <span class="pill">🔒 Compartido</span>
  <a class="pill pill--edit" href="editar/">✏️ Gestor</a>
  <a class="pill" href="papelera/">🗑️ Papelera</a>
</header>
<div class="wrap">
  <div class="filters">
    <select id="fRubro"><option value="">Todos los rubros</option></select>
    <select id="fEstado"><option value="">Todos los estados</option></select>
    <select id="fVend"><option value="">Todos los vendedores</option><option value="__sin__">Sin vendedor</option></select>
    <input id="q" placeholder="Buscar negocio…" style="flex:1;min-width:160px">
  </div>
  <div class="metrics" id="metrics"></div>
  <div id="list"></div>
</div>
<script>
var SNAP=${JSON.stringify(snapshot)};
var SB={base:${JSON.stringify(((config.supabase && config.supabase.url) || "").replace(/\/+$/, ""))},tabla:${JSON.stringify((config.supabase && config.supabase.tabla) || "prospectos")},key:${JSON.stringify((config.supabase && config.supabase.anonKey) || "")}};
var BASE=${JSON.stringify(config.baseUrl)};
var CNT=${JSON.stringify((config.counter && config.counter.get) || "")};
var NS=${JSON.stringify((config.counter && config.counter.namespace) || "")};
var RUBROS=${JSON.stringify(Object.fromEntries(Object.entries(config.rubros).map(([k, v]) => [k, v.etiqueta])))};
var ESTADOS=["Nuevo","Contactado","Interesado","Vendido","Descartado"];
function esElim(v){return v===true||/^(true|si|sí|1|x)$/i.test(String(v==null?"":v).trim())}
function findById(id){for(var i=0;i<DATA.length;i++){if(String(DATA[i].id)===String(id))return DATA[i]}return null}
function patch(id,fields){
  if(!(SB.base&&SB.key))return Promise.resolve(false);
  return fetch(SB.base+"/rest/v1/"+SB.tabla+"?id=eq."+encodeURIComponent(id),{method:"PATCH",headers:{apikey:SB.key,Authorization:"Bearer "+SB.key,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(fields)}).then(function(r){return r.ok?r.json():[]}).then(function(a){return Array.isArray(a)&&a.length>0}).catch(function(){return false});
}
function isNo(v){return /^(no|0|false|f|n)$/i.test(String(v||"").trim())}
function slugify(s){return String(s||"").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"negocio"}
function digits(s){return String(s||"").replace(/\\D/g,"")}
function priority(r){
  var man=String(r.prioridad_manual||"").trim(); if(man!==""&&!isNaN(Number(man)))return Number(man);
  var p=0;var tieneWeb=r.web_actual||(r.tiene_web&&!/^(no|0|false)$/i.test(r.tiene_web));
  if(!tieneWeb)p+=3;
  var res=Number(digits(r.resenas))||0; if(res>=50)p+=3; else if(res>=20)p+=2; else if(res>=10)p+=1;
  var rt=Number(String(r.rating||"").replace(",","."))||0; if(rt>=4.5)p+=2; else if(rt>=4.0)p+=1;
  return p;
}
function parseCSV(text){
  var rows=[],row=[],f="",q=false;text=text.replace(/\\r\\n/g,"\\n").replace(/\\r/g,"\\n");
  for(var i=0;i<text.length;i++){var c=text[i];
    if(q){if(c=='"'){if(text[i+1]=='"'){f+='"';i++}else q=false}else f+=c}
    else if(c=='"')q=true;else if(c==","){row.push(f);f=""}else if(c=="\\n"){row.push(f);rows.push(row);row=[];f=""}else f+=c}
  if(f.length||row.length){row.push(f);rows.push(row)}
  return rows.filter(function(r){return r.some(function(v){return String(v).trim()!==""})});
}
function normalize(rows){
  var header=rows[0].map(function(h){return h.trim()});
  var objs=rows.slice(1).map(function(r){var o={};header.forEach(function(h,i){o[h]=String(r[i]||"").trim()});return o});
  var map={};
  objs.forEach(function(r){var k=digits(r.telefono)||slugify(r.negocio);if(!map[k])map[k]=Object.assign({},r,{_slug:slugify(r.negocio)});else{Object.keys(r).forEach(function(kk){if(r[kk]&&!map[k][kk])map[k][kk]=r[kk]})}});
  var arr=Object.keys(map).map(function(k){return map[k]});
  arr.forEach(function(r){r.prioridad=priority(r);r.estado=r.estado||"Nuevo";r.vendedor=(r.vendedor||"").toLowerCase();r.generar=!isNo(r.generar)});
  arr.sort(function(a,b){return b.prioridad-a.prioridad || (Number(digits(b.resenas))||0)-(Number(digits(a.resenas))||0)});
  return arr;
}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var MSGS=[
 "Hola, le escribo por {negocio}. Vi su {tipo} en Google y le preparé una página web de muestra con su información. ¿Usted es el dueño o alguien del equipo? Si no, ¿me podría pasar con el encargado? La puede ver aquí: {link}. Gracias.",
 "Buenas tardes. Le escribo por {negocio}. Preparé una página web de muestra para su {tipo}, sin costo, para que vean cómo se vería. ¿Es usted el dueño o trabaja ahí? Si no, ¿me podría comunicar con el encargado? Aquí puede verla: {link}. Gracias.",
 "Hola, ¿cómo está? Le escribo por {negocio}. Vi su {tipo} en Google y le armé una página web de muestra. ¿Sería usted el dueño o alguien del equipo? Si no, ¿me podría pasar con el encargado para mostrársela? Puede verla aquí: {link}. Gracias.",
 "Buenas. Soy {vendedor} y hago páginas web para negocios. Le escribo por {negocio}: le dejé una página web de muestra con lo que aparece en Google. ¿Usted es el dueño o una persona del equipo? Si no, ¿me podría comunicar con el encargado? Aquí está: {link}. Gracias, sin compromiso.",
 "Hola, buenas tardes. Le escribo por {negocio}. ¿Sería usted el dueño o alguien del equipo? Le preparé una página web de muestra para su {tipo}. Si no es usted, ¿me podría pasar con el encargado? La puede ver aquí: {link}. Gracias.",
 "Buenas. Le escribo por {negocio}. Vi su {tipo} en Google y le preparé una página web de muestra. ¿Es usted el dueño o alguien del equipo? Si no, ¿me podría comunicar con el encargado? Aquí puede verla: {link}. Gracias."
];
var TIPOS={veterinaria:"veterinaria",dental:"clínica",taller:"taller",interiores:"estudio"};
function waNumber(t){var d=String(t||"").replace(/\\D/g,"");if(!d)return "";if(d.indexOf("51")===0&&d.length>=11)return d;if(d[0]==="0")d="51"+d.slice(1);else if(d.length<=9)d="51"+d;return d}
function cap(s){s=String(s||"");return s.charAt(0).toUpperCase()+s.slice(1)}
var lastMsg=-1;
function buildMsg(r){var i=Math.floor(Math.random()*MSGS.length);if(MSGS.length>1&&i===lastMsg)i=(i+1)%MSGS.length;lastMsg=i;return MSGS[i].replace(/\{vendedor\}/g,cap(r.vendedor)).replace(/\{negocio\}/g,r.negocio||"").replace(/\{tipo\}/g,TIPOS[r.rubro]||"negocio").replace(/\{link\}/g,BASE+"/demo/"+r._slug+"/")}
var DATA=[];
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-act=wa]");
  if(b){var r=(DATA||[]).filter(function(x){return x._slug===b.getAttribute("data-slug")})[0];if(r){var num=waNumber(r.telefono);if(num)window.open("https://wa.me/"+num+"?text="+encodeURIComponent(buildMsg(r)),"_blank")}return}
  var es=e.target.closest("[data-act=est]");
  if(es){var re=findById(es.getAttribute("data-id"));if(re){re.estado=es.getAttribute("data-v");render();patch(re.id,{estado:re.estado})}return}
  var de=e.target.closest("[data-act=del]");
  if(de){var rd=findById(de.getAttribute("data-id"));if(rd&&window.confirm("¿Ocultar este prospecto? Queda en la Papelera y puedes restaurarlo.")){rd.eliminado=true;render();patch(rd.id,{eliminado:true})}return}
});
function renderMetrics(){
  var el=document.getElementById("metrics");if(!el)return;
  var D=DATA.filter(function(r){return !esElim(r.eliminado)});
  var total=D.length,c={};
  D.forEach(function(r){var e=r.estado||"Nuevo";c[e]=(c[e]||0)+1});
  var contactados=(c.Contactado||0)+(c.Interesado||0)+(c.Vendido||0);
  var interesados=(c.Interesado||0)+(c.Vendido||0);
  var vendidos=c.Vendido||0;
  var sinWeb=D.filter(function(r){return !(r.web_actual||(r.tiene_web&&!isNo(r.tiene_web)))}).length;
  var gen=D.filter(function(r){return r.generar!==false}).length;
  function pct(a,b){return b?Math.round(a/b*100):0}
  function box(n,l){return '<div class="metric"><b>'+n+'</b><span>'+l+'</span></div>'}
  el.innerHTML=
    box(total,"prospectos")+box(sinWeb,"sin web")+box(gen,"con demo")+
    box(contactados,"contactados")+box(interesados,"interesados")+box(vendidos,"vendidos")+
    box(c.Descartado||0,"descartados")+box(pct(interesados,contactados)+"%","tasa respuesta")+
    box(pct(vendidos,contactados)+"%","tasa cierre");
}
function render(){
  renderMetrics();
  var fr=document.getElementById("fRubro").value,fe=document.getElementById("fEstado").value,fv=document.getElementById("fVend").value,qq=document.getElementById("q").value.toLowerCase();
  var list=document.getElementById("list");list.innerHTML="";
  var items=DATA.filter(function(r){
    if(esElim(r.eliminado))return false;
    if(fr&&r.rubro!==fr)return false; if(fe&&(r.estado||"")!==fe)return false;
    if(fv==="__sin__"){ if(r.vendedor)return false } else if(fv&&(r.vendedor||"")!==fv)return false;
    if(qq&&String(r.negocio||"").toLowerCase().indexOf(qq)<0)return false; return true;
  });
  document.getElementById("cnt").textContent=items.length+" de "+DATA.filter(function(r){return !esElim(r.eliminado)}).length+" negocios";
  if(!items.length){list.innerHTML='<p class="empty">Sin resultados.</p>';return}
  items.forEach(function(r){
    var url=BASE+"/demo/"+r._slug+"/";
    var gen=r.generar!==false;
    var waN=!!String(r.telefono||"").replace(/\\D/g,"");
    var el=document.createElement("div");el.className="card";
    el.innerHTML=
      '<div><h3>'+esc(r.negocio)+'</h3>'+
      '<p class="meta">'+esc(r.categoria||RUBROS[r.rubro]||r.rubro||"")+' · '+esc(r.ciudad||"")+(r.rating?" · ⭐ "+esc(r.rating):"")+(r.resenas?" ("+esc(r.resenas)+")":"")+(r.web_actual?" · con web":" · sin web")+'</p>'+
      ((r.canal||r.proximo_contacto)?'<p class="meta">'+(r.canal?"📞 "+esc(r.canal)+" ":"")+(r.proximo_contacto?"· próximo: "+esc(r.proximo_contacto):"")+'</p>':'')+
      (r.notas?'<p class="meta">📝 '+esc(r.notas)+'</p>':'')+
      '<div class="row2"><span class="v '+esc(r.vendedor||"")+'">👤 '+esc(cap(r.vendedor)||"— sin vendedor")+'</span>'+
      (gen?'<a href="'+url+'" target="_blank">abrir demo →</a>':'<span class="meta">sin demo</span>')+
      (r.maps_url?' · <a href="'+esc(r.maps_url)+'" target="_blank" rel="noopener">Maps</a>':'')+
      (waN?'<button class="wa" data-act="wa" data-slug="'+esc(r._slug)+'">Escribir por WhatsApp</button>':'')+
      (CNT&&NS?' · <span class="meta">👀 <b class="seen" data-s="'+esc(r._slug)+'">…</b></span>':'')+'</div>'+
      '<div class="estado">'+ESTADOS.map(function(e){return '<button data-act="est" data-id="'+esc(r.id)+'" data-v="'+e+'"'+(r.estado===e?' class="on"':'')+'>'+e+'</button>'}).join("")+
      '<button class="del" data-act="del" data-id="'+esc(r.id)+'">🗑️ Eliminar</button></div></div>'+
      '<div class="right"><div class="prio" title="Prioridad">'+esc(r.prioridad)+'</div><span class="meta">prioridad</span></div>';
    list.appendChild(el);
  });
  document.querySelectorAll(".seen").forEach(function(el){
    if(!CNT||!NS){el.textContent="0";return}
    fetch(CNT+"/"+NS+"/"+el.getAttribute("data-s")).then(function(r){return r.json()}).then(function(x){el.textContent=(x&&typeof x.value==="number")?x.value:"0"}).catch(function(){el.textContent="0"});
  });
}
function fillSelects(){
  function opt(sel,val,txt){var o=document.createElement("option");o.value=val;o.textContent=txt;sel.appendChild(o)}
  Object.keys(RUBROS).forEach(function(k){opt(document.getElementById("fRubro"),k,RUBROS[k])});
  Array.from(new Set(DATA.map(function(r){return r.estado||"Nuevo"}))).sort().forEach(function(k){opt(document.getElementById("fEstado"),k,k)});
  Array.from(new Set(DATA.map(function(r){return r.vendedor||""}))).filter(Boolean).sort().forEach(function(k){opt(document.getElementById("fVend"),k,k)});
  ["fRubro","fEstado","fVend"].forEach(function(id){document.getElementById(id).addEventListener("change",render)});
  document.getElementById("q").addEventListener("input",render);
}
(async function(){
  var data=SNAP;
  if(SB&&SB.base&&SB.key){
    try{
      var res=await fetch(SB.base+"/rest/v1/"+SB.tabla+"?select=*",{headers:{apikey:SB.key,Authorization:"Bearer "+SB.key}});
      if(res.ok){var rows=await res.json();data=rows.map(function(r){var o={};Object.keys(r).forEach(function(k){o[k]=r[k]==null?"":String(r[k])});o._slug=slugify(o.negocio);o.prioridad=priority(o);o.estado=o.estado||"Nuevo";o.vendedor=(o.vendedor||"").toLowerCase();o.generar=!isNo(o.generar);return o});data.sort(function(a,b){return b.prioridad-a.prioridad||(Number(digits(b.resenas))||0)-(Number(digits(a.resenas))||0)})}
    }catch(e){}
  }
  DATA=data; fillSelects(); render();
})();
</script></body></html>`;
}

/* --------------------------------------------------------------- gestor --- */
// Página editable (otra pestaña) para asignar vendedor, cambiar estado/canal y
// agregar prospectos. Escribe directo a Supabase con la clave anon (sin login).
function gestor(rows) {
  const snap = rows.map((r) => ({
    id: r.id || "", negocio: r.negocio || "", rubro: r.rubro || "", categoria: r.categoria || "",
    direccion: r.direccion || "", zona: r.zona || "", ciudad: r.ciudad || "", maps_url: r.maps_url || "",
    telefono: r.telefono || "", email: r.email || "", horarios: r.horarios || "",
    instagram: r.instagram || "", instagram_url: r.instagram_url || "", facebook: r.facebook || "",
    web_actual: r.web_actual || "", rating: r.rating || "", resenas: r.resenas || "", tiene_web: r.tiene_web || "",
    estado: r.estado || "Nuevo", vendedor: (r.vendedor || "").toLowerCase(), canal: r.canal || "",
    proximo_contacto: r.proximo_contacto || "", ultimo_contacto: r.ultimo_contacto || "",
    generar: r.generar || "", notas: r.notas || "", prioridad: priority(r),
  }));
  return `<!DOCTYPE html><html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(config.siteName)} · Gestor</title>
<meta name="robots" content="noindex, nofollow">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#0b1a1d;--card:#122b31;--line:#1d444c;--text:#eaf3f4;--muted:#9dc0c5;--accent:#ea6a4b;--ok:#3ecf8e}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#0b1a1d,#0a3238);color:var(--text);font:15px/1.5 Inter,system-ui,sans-serif}
header{position:sticky;top:0;background:#0a2328;border-bottom:1px solid var(--line);padding:14px 20px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;z-index:5}
h1{font:700 1.2rem Outfit;margin:0;flex:1}
.wrap{padding:18px;max-width:1250px;margin:0 auto}
a{color:var(--accent)}
.pill{display:inline-block;padding:4px 10px;border-radius:999px;border:1px solid var(--line);font-size:.78rem;color:var(--muted);text-decoration:none}
.pill--edit{border-color:var(--accent);color:var(--accent);font-weight:600}
select,input,button,textarea{font:inherit;color:var(--text);background:#15343b;border:1px solid var(--line);border-radius:9px;padding:8px 10px}
button{cursor:pointer}
.btn{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}
.bar{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;align-items:center}
.bar input[type=search]{flex:1;min-width:160px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:10px}
.card__top{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:baseline}
.card h3{margin:0;font:600 1.05rem Outfit}
.meta{color:var(--muted);font-size:.85rem}
.prio{font:700 1.3rem Outfit;color:var(--accent);margin-left:auto}
.ctrl{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:10px}
.estado button{border-radius:999px;padding:5px 11px;font-size:.78rem;background:#15343b;border:1px solid var(--line);color:var(--text)}
.estado button.on{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700}
.vend button{border-radius:8px;padding:5px 10px;font-size:.78rem}
.vend button.on{background:var(--ok);border-color:var(--ok);color:#04231a;font-weight:700}
.mini{font-size:.78rem}
.det{margin-top:10px;border-top:1px dashed var(--line);padding-top:8px;display:none}
.det.open{display:block}
.det dl{display:grid;grid-template-columns:130px 1fr;gap:3px 12px;margin:0}
.det dt{color:var(--muted);font-size:.8rem}
.det dd{margin:0;font-size:.86rem;word-break:break-word}
#toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#0a2328;border:1px solid var(--line);border-radius:10px;padding:10px 16px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:20}
#toast.show{opacity:1}
#toast.err{border-color:var(--accent)}
dialog{background:var(--card);color:var(--text);border:1px solid var(--line);border-radius:16px;max-width:640px;width:92vw;padding:20px}
dialog::backdrop{background:rgba(0,0,0,.55)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.f{display:flex;flex-direction:column;gap:4px;margin-bottom:10px}
.f span{font-size:.8rem;color:var(--muted)}
@media(max-width:640px){.grid2{grid-template-columns:1fr}}
</style></head><body>
<header>
  <h1>✏️ ${esc(config.siteName)} · Gestor</h1>
  <span class="meta" id="cnt">…</span>
  <a class="pill" href="papelera/">🗑️ Papelera</a>
  <a class="pill" href="../">← Panel</a>
</header>
<div class="wrap">
  <div class="bar">
    <button class="btn" id="nuevo">＋ Agregar prospecto</button>
    <input type="search" id="q" placeholder="Buscar negocio, teléfono, dirección…">
    <select id="fEstado"><option value="">Estado: todos</option></select>
    <select id="fVendedor"><option value="">Vendedor: todos</option><option value="__sin__">Sin vendedor</option></select>
    <select id="fRubro"><option value="">Rubro: todos</option></select>
    <select id="fCanal"><option value="">Canal: todos</option></select>
    <select id="orden">
      <option value="prioridad">Orden: prioridad</option>
      <option value="resenas">Orden: reseñas</option>
      <option value="rating">Orden: rating</option>
      <option value="negocio">Orden: nombre</option>
    </select>
  </div>
  <div id="list"></div>
</div>

<dialog id="dlg">
  <h2 style="margin-top:0;font:600 1.1rem Outfit">Agregar prospecto</h2>
  <form id="formNuevo">
    <div class="grid2">
      <label class="f"><span>Negocio *</span><input name="negocio" required></label>
      <label class="f"><span>Rubro *</span>
        <select name="rubro" required><option value="">Elige…</option></select></label>
      <label class="f"><span>Teléfono *</span><input name="telefono" required placeholder="+51 999 111 222"></label>
      <label class="f"><span>Categoría</span><input name="categoria"></label>
      <label class="f"><span>Dirección</span><input name="direccion"></label>
      <label class="f"><span>Zona</span><input name="zona"></label>
      <label class="f"><span>Ciudad</span><input name="ciudad" placeholder="Lima"></label>
      <label class="f"><span>Rating</span><input name="rating" placeholder="4.7"></label>
      <label class="f"><span>Reseñas</span><input name="resenas" placeholder="58"></label>
      <label class="f"><span>¿Tiene web?</span><select name="tiene_web"><option value="">—</option><option value="si">Sí</option><option value="no">No</option></select></label>
      <label class="f"><span>Web actual</span><input name="web_actual" placeholder="https://…"></label>
      <label class="f"><span>Maps URL</span><input name="maps_url" placeholder="https://maps.google.com/…"></label>
      <label class="f"><span>Estado</span><select name="estado"><option>Nuevo</option><option>Contactado</option><option>Interesado</option><option>Vendido</option><option>Descartado</option></select></label>
      <label class="f"><span>Vendedor</span><select name="vendedor"><option value="">—</option><option value="estefano">Estefano</option><option value="luigui">Luigui</option></select></label>
    </div>
    <label class="f"><span>Notas</span><textarea name="notas" rows="2"></textarea></label>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button type="button" id="cancelar">Cancelar</button>
      <button type="submit" class="btn">Guardar</button>
    </div>
  </form>
</dialog>

<div id="toast"></div>
<script>
var SB=${JSON.stringify({ base: ((config.supabase && config.supabase.url) || "").replace(/\/+$/, ""), tabla: (config.supabase && config.supabase.tabla) || "prospectos", key: (config.supabase && config.supabase.anonKey) || "" })};
var SNAP=${JSON.stringify(snap)};
var RUBROS=${JSON.stringify(Object.fromEntries(Object.entries(config.rubros).map(([k, v]) => [k, v.etiqueta])))};
var VEND=${JSON.stringify(Object.fromEntries(Object.entries(config.vendedores).map(([k, v]) => [k, v.nombre])))};
var ESTADOS=["Nuevo","Contactado","Interesado","Vendido","Descartado"];
var CANALES=["WhatsApp","Llamada","Visita"];
var DATA=[];

function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function esElim(v){return v===true||/^(true|si|sí|1|x)$/i.test(String(v==null?"":v).trim())}
function hdr(extra){var h={apikey:SB.key,Authorization:"Bearer "+SB.key,"Content-Type":"application/json"};if(extra){for(var k in extra)h[k]=extra[k]}return h}
function norm(r){var o={};Object.keys(r).forEach(function(k){o[k]=r[k]==null?"":String(r[k])});o.id=r.id;return o}
function toast(msg,err){var t=document.getElementById("toast");t.textContent=msg;t.className="show"+(err?" err":"");clearTimeout(t._t);t._t=setTimeout(function(){t.className=""},2600)}
function find(id){for(var i=0;i<DATA.length;i++)if(String(DATA[i].id)===String(id))return DATA[i];return null}

async function cargar(){
  DATA=SNAP.slice();
  if(SB.base&&SB.key){
    try{
      var r=await fetch(SB.base+"/rest/v1/"+SB.tabla+"?select=*",{headers:{apikey:SB.key,Authorization:"Bearer "+SB.key}});
      if(r.ok){DATA=(await r.json()).map(norm);} else {toast("No pude leer Supabase ("+r.status+")",1);}
    }catch(e){toast("Sin conexión a Supabase",1);}
  } else {toast("Supabase no configurado",1);}
  llenar();render();
}

async function patch(id,fields){
  if(!(SB.base&&SB.key)){toast("Supabase no configurado",1);return false}
  try{
    var r=await fetch(SB.base+"/rest/v1/"+SB.tabla+"?id=eq."+encodeURIComponent(id),{method:"PATCH",headers:hdr({Prefer:"return=representation"}),body:JSON.stringify(fields)});
    var a=r.ok?await r.json():[];
    if(r.ok&&a.length){toast("Guardado ✓");return true}
    toast("No se guardó (revisa permisos RLS)",1);return false;
  }catch(e){toast("Error de red",1);return false}
}
async function insert(row){
  if(!(SB.base&&SB.key)){toast("Supabase no configurado",1);return false}
  try{
    var r=await fetch(SB.base+"/rest/v1/"+SB.tabla,{method:"POST",headers:hdr({Prefer:"return=representation"}),body:JSON.stringify(row)});
    var a=r.ok?await r.json():[];
    if(r.ok&&a.length){return true}
    toast("No se pudo agregar ("+r.status+")",1);return false;
  }catch(e){toast("Error de red",1);return false}
}

function setCampo(id,campo,val,btn){
  var r=find(id);if(!r)return;
  var prev=r[campo];r[campo]=val;render();
  patch(id,{[campo]:val}).then(function(ok){if(!ok){var rr=find(id);if(rr)rr[campo]=prev;render()}});
}

function filtrados(){
  var q=document.getElementById("q").value.toLowerCase();
  var fe=document.getElementById("fEstado").value,fv=document.getElementById("fVendedor").value;
  var fr=document.getElementById("fRubro").value,fc=document.getElementById("fCanal").value;
  var arr=DATA.filter(function(r){
    if(esElim(r.eliminado))return false;
    if(fe&&(r.estado||"Nuevo")!==fe)return false;
    if(fv==="__sin__"){if(r.vendedor)return false} else if(fv&&(r.vendedor||"")!==fv)return false;
    if(fr&&r.rubro!==fr)return false;
    if(fc&&(r.canal||"")!==fc)return false;
    if(q){var s=(r.negocio+" "+r.telefono+" "+r.direccion+" "+r.ciudad).toLowerCase();if(s.indexOf(q)<0)return false}
    return true;
  });
  var o=document.getElementById("orden").value;
  arr.sort(function(a,b){
    if(o==="negocio")return String(a.negocio).localeCompare(String(b.negocio));
    if(o==="resenas")return (Number(b.resenas)||0)-(Number(a.resenas)||0);
    if(o==="rating")return (Number(b.rating)||0)-(Number(a.rating)||0);
    return (b.prioridad||0)-(a.prioridad||0);
  });
  return arr;
}

function info(r){
  function row(k,v){return v?'<dt>'+k+'</dt><dd>'+esc(v)+'</dd>':''}
  var wa=String(r.telefono||"").replace(/\\D/g,"");
  return '<div class="det"><dl>'+
    row("Categoría",r.categoria)+row("Dirección",r.direccion)+row("Zona",r.zona)+row("Ciudad",r.ciudad)+
    row("Teléfono",r.telefono)+row("Email",r.email)+row("Horarios",r.horarios)+
    row("Instagram",r.instagram)+row("Facebook",r.facebook)+row("Web actual",r.web_actual)+
    row("Rating",(r.rating?r.rating+" ⭐ ":"")+(r.resenas?"("+r.resenas+" reseñas)":""))+
    row("Notas",r.notas)+row("Próximo contacto",r.proximo_contacto)+row("Último contacto",r.ultimo_contacto)+
    '</dl><div class="ctrl">'+
    (r.maps_url?'<a href="'+esc(r.maps_url)+'" target="_blank" rel="noopener">Ver en Maps →</a>':'')+
    (wa?' · <a href="https://wa.me/'+wa+'" target="_blank" rel="noopener">WhatsApp →</a>':'')+
    '</div></div>';
}

function render(){
  var list=document.getElementById("list");var items=filtrados();
  document.getElementById("cnt").textContent=items.length+" de "+DATA.filter(function(r){return !esElim(r.eliminado)}).length+" prospectos";
  if(!items.length){list.innerHTML='<p class="meta">Sin resultados.</p>';return}
  var html="";
  items.forEach(function(r){
    var id=esc(r.id);
    html+='<div class="card">'+
      '<div class="card__top"><h3>'+esc(r.negocio)+'</h3>'+
      '<span class="meta">'+esc(RUBROS[r.rubro]||r.rubro||"")+' · '+esc(r.ciudad||"")+(r.rating?' · ⭐ '+esc(r.rating):"")+(r.resenas?' ('+esc(r.resenas)+')':"")+'</span>'+
      '<span class="prio" title="Prioridad">'+esc(r.prioridad)+'</span></div>'+
      '<div class="ctrl estado">'+ESTADOS.map(function(e){return '<button data-act="estado" data-id="'+id+'" data-v="'+e+'"'+(r.estado===e?' class="on"':'')+'>'+e+'</button>'}).join("")+'</div>'+
      '<div class="ctrl"><span class="mini meta">Vendedor:</span><span class="vend">'+
        Object.keys(VEND).map(function(k){return '<button data-act="vendedor" data-id="'+id+'" data-v="'+k+'"'+(r.vendedor===k?' class="on"':'')+'>'+VEND[k]+'</button>'}).join("")+
      '</span><span class="mini meta" style="margin-left:8px">Canal:</span><select data-act="canal" data-id="'+id+'"><option value="">—</option>'+CANALES.map(function(c){return '<option'+(r.canal===c?' selected':'')+'>'+c+'</option>'}).join("")+'</select>'+
      '<button data-act="det" data-id="'+id+'" style="margin-left:auto">Ver todo ▾</button>'+
      '<button data-act="eliminar" data-id="'+id+'" style="border-color:var(--accent);color:var(--accent)">🗑️ Eliminar</button></div>'+
      info(r)+'</div>';
  });
  list.innerHTML=html;
}

function llenar(){
  function opt(sel,val,txt){var o=document.createElement("option");o.value=val;o.textContent=txt;sel.appendChild(o)}
  ESTADOS.forEach(function(e){opt(document.getElementById("fEstado"),e,e)});
  Object.keys(VEND).forEach(function(k){opt(document.getElementById("fVendedor"),k,VEND[k])});
  Object.keys(RUBROS).forEach(function(k){opt(document.getElementById("fRubro"),k,RUBROS[k])});
  CANALES.forEach(function(c){opt(document.getElementById("fCanal"),c,c)});
  var sel=document.querySelector('select[name=rubro]');Object.keys(RUBROS).forEach(function(k){opt(sel,k,RUBROS[k])});
  ["q","fEstado","fVendedor","fRubro","fCanal","orden"].forEach(function(id){var e=document.getElementById(id);e.addEventListener(id==="q"?"input":"change",render)});
}

document.getElementById("list").addEventListener("click",function(e){
  var b=e.target.closest("[data-act]");if(!b)return;
  var act=b.getAttribute("data-act"),id=b.getAttribute("data-id");
  if(act==="estado")setCampo(id,"estado",b.getAttribute("data-v"));
  else if(act==="vendedor")setCampo(id,"vendedor",b.getAttribute("data-v"));
  else if(act==="eliminar"){var re=find(id);if(re&&window.confirm("¿Ocultar este prospecto? Queda en la Papelera y puedes restaurarlo.")){re.eliminado=true;render();patch(id,{eliminado:true})}}
  else if(act==="det"){var d=b.closest(".card").querySelector(".det");d.classList.toggle("open");b.textContent=d.classList.contains("open")?"Ver menos ▴":"Ver todo ▾"}
});
document.getElementById("list").addEventListener("change",function(e){
  var s=e.target.closest("select[data-act=canal]");if(!s)return;
  setCampo(s.getAttribute("data-id"),"canal",s.value);
});

var dlg=document.getElementById("dlg");
document.getElementById("nuevo").addEventListener("click",function(){dlg.showModal()});
document.getElementById("cancelar").addEventListener("click",function(){dlg.close()});
document.getElementById("formNuevo").addEventListener("submit",async function(e){
  e.preventDefault();
  var f=e.target,row={};new FormData(f).forEach(function(v,k){row[k]=String(v).trim()||null});
  if(await insert(row)){toast("Prospecto agregado ✓");dlg.close();f.reset();await cargar()}
});

cargar();
</script></body></html>`;
}

/* ------------------------------------------------------------- papelera --- */
// Pestaña para ver los "eliminados" (borrado suave) y restaurarlos.
function papelera(rows) {
  const snap = rows.map((r) => ({
    id: r.id || "", negocio: r.negocio || "", rubro: r.rubro || "", ciudad: r.ciudad || "",
    telefono: r.telefono || "", estado: r.estado || "", vendedor: (r.vendedor || "").toLowerCase(), _slug: r._slug || "",
  }));
  return `<!DOCTYPE html><html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(config.siteName)} · Papelera</title>
<meta name="robots" content="noindex, nofollow">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#0b1a1d;--card:#122b31;--line:#1d444c;--text:#eaf3f4;--muted:#9dc0c5;--accent:#ea6a4b;--ok:#3ecf8e}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#0b1a1d,#0a3238);color:var(--text);font:15px/1.5 Inter,system-ui,sans-serif}
header{position:sticky;top:0;background:#0a2328;border-bottom:1px solid var(--line);padding:14px 20px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;z-index:5}
h1{font:700 1.2rem Outfit;margin:0;flex:1}
.wrap{padding:18px;max-width:1250px;margin:0 auto}
a{color:var(--accent)}
.pill{display:inline-block;padding:4px 10px;border-radius:999px;border:1px solid var(--line);font-size:.78rem;color:var(--muted);text-decoration:none}
.pill--edit{border-color:var(--accent);color:var(--accent);font-weight:600}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:10px;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center}
.card h3{margin:0;font:600 1.05rem Outfit}
.meta{color:var(--muted);font-size:.85rem}
.btn{background:var(--ok);border:1px solid var(--ok);color:#04231a;border-radius:8px;padding:6px 12px;font-weight:700;cursor:pointer;margin-left:auto}
.empty{color:var(--muted);padding:30px}
#toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#0a2328;border:1px solid var(--line);border-radius:10px;padding:10px 16px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:20}
#toast.show{opacity:1}#toast.err{border-color:var(--accent)}
</style></head><body>
<header>
  <h1>🗑️ ${esc(config.siteName)} · Papelera</h1>
  <span class="meta" id="cnt">…</span>
  <a class="pill pill--edit" href="../editar/">✏️ Gestor</a>
  <a class="pill" href="../">← Panel</a>
</header>
<div class="wrap">
  <p class="meta">Aquí están los prospectos "eliminados". No se borran de verdad: pulsa <b>Restaurar</b> y vuelven al panel.</p>
  <div id="list"></div>
</div>
<div id="toast"></div>
<script>
var SB=${JSON.stringify({ base: ((config.supabase && config.supabase.url) || "").replace(/\/+$/, ""), tabla: (config.supabase && config.supabase.tabla) || "prospectos", key: (config.supabase && config.supabase.anonKey) || "" })};
var SNAP=${JSON.stringify(snap)};
var DATA=[];
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function toast(m,e){var t=document.getElementById("toast");t.textContent=m;t.className="show"+(e?" err":"");clearTimeout(t._t);t._t=setTimeout(function(){t.className=""},2500)}
function esElim(v){return v===true||/^(true|si|sí|1|x)$/i.test(String(v==null?"":v).trim())}
async function cargar(){
  DATA=SNAP.slice();
  if(SB.base&&SB.key){
    try{var r=await fetch(SB.base+"/rest/v1/"+SB.tabla+"?select=*",{headers:{apikey:SB.key,Authorization:"Bearer "+SB.key}});
      if(r.ok){DATA=(await r.json()).filter(function(x){return esElim(x.eliminado)}).map(function(x){var o={};Object.keys(x).forEach(function(k){o[k]=x[k]==null?"":String(x[k])});return o})}
    }catch(e){}
  }
  render();
}
async function restaurar(id){
  if(!(SB.base&&SB.key)){toast("Supabase no configurado",1);return}
  try{
    var r=await fetch(SB.base+"/rest/v1/"+SB.tabla+"?id=eq."+encodeURIComponent(id),{method:"PATCH",headers:{apikey:SB.key,Authorization:"Bearer "+SB.key,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify({eliminado:false})});
    var a=r.ok?await r.json():[];
    if(r.ok&&a.length){DATA=DATA.filter(function(x){return String(x.id)!==String(id)});render();toast("Restaurado ✓")}
    else toast("No se pudo restaurar",1);
  }catch(e){toast("Error de red",1)}
}
function render(){
  var list=document.getElementById("list");
  document.getElementById("cnt").textContent=DATA.length+" eliminados";
  if(!DATA.length){list.innerHTML='<p class="empty">La papelera está vacía.</p>';return}
  var h="";
  DATA.forEach(function(r){
    h+='<div class="card"><div><h3>'+esc(r.negocio)+'</h3>'+
      '<span class="meta">'+esc(r.ciudad||"")+(r.estado?' · '+esc(r.estado):"")+(r.vendedor?' · '+esc(r.vendedor):"")+(r.telefono?' · '+esc(r.telefono):"")+'</span></div>'+
      '<button class="btn" data-id="'+esc(r.id)+'">Restaurar</button></div>';
  });
  list.innerHTML=h;
}
document.getElementById("list").addEventListener("click",function(e){var b=e.target.closest("button[data-id]");if(b)restaurar(b.getAttribute("data-id"))});
cargar();
</script></body></html>`;
}


/* ----------------------------------------------------- página neutra --- */
function neutral() {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">
<title>·</title><style>body{margin:0;height:100vh;display:grid;place-items:center;background:#0b1a1d;color:#3f5b60;font:16px system-ui}</style>
</head><body>Página no disponible.</body></html>`;
}

/* ----------------------------------------------------------------- main --- */
let raw;
if (SB_ON) {
  try {
    console.log("Fuente: Supabase " + SB_URL + " · " + SB_TABLE);
    raw = await supabaseRows();
  } catch (e) {
    console.warn("  ! Supabase falló (" + e.message + "). Uso CSV local.");
  }
}
if (!raw) {
  const src = resolveDataCsv();
  console.log("Fuente: " + relRoot(src));
  raw = toObjects(parseCSV(await readFile(src, "utf8")));
}

const merged = mergeRows(raw);
merged.sort((a, b) => priority(b) - priority(a) || (Number(digits(b.resenas)) || 0) - (Number(digits(a.resenas)) || 0));

// "Eliminar" es suave: la fila queda en Supabase con eliminado=true y se oculta.
const esElim = (v) => v === true || /^(true|si|sí|1|x|✓)$/i.test(String(v ?? "").trim());
const activos = merged.filter((r) => !esElim(r.eliminado));
const eliminados = merged.filter((r) => esElim(r.eliminado));

await rm(DEMO_DIR, { recursive: true, force: true });
for (const e of await readdir(DOCS).catch(() => [])) {
  if (e === "demo" || e === "index.html") continue;
  await rm(join(DOCS, e), { recursive: true, force: true });
}
await mkdir(DEMO_DIR, { recursive: true });

let n = 0;
for (const row of activos) {
  if (isNo(row.generar)) continue;
  const g = await renderDemo(row);
  if (g) { n++; console.log(`  ✓ ${g.emoji} ${g.slug} [p${priority(row)}] (${row.vendedor || config.vendedorDefault})`); }
}

const panelDir = join(DOCS, CODIGO);
await mkdir(panelDir, { recursive: true });
await writeFile(join(panelDir, "index.html"), panel(activos), "utf8");
await mkdir(join(panelDir, "editar"), { recursive: true });
await writeFile(join(panelDir, "editar", "index.html"), gestor(activos), "utf8");
await mkdir(join(panelDir, "papelera"), { recursive: true });
await writeFile(join(panelDir, "papelera", "index.html"), papelera(eliminados), "utf8");
await writeFile(join(DOCS, "index.html"), neutral(), "utf8");
await writeFile(join(DOCS, ".nojekyll"), "", "utf8");

console.log(`\nDemos generadas: ${n} / ${activos.length} activas (${eliminados.length} en papelera; dedupe de ${raw.length})`);
console.log(`Panel secreto: ${config.baseUrl}/${CODIGO}/`);
console.log(`Demos: ${config.baseUrl}/demo/<slug>/`);
