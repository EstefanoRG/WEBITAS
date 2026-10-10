// Generador WEBITAS.
// Fuente: data/empresas.csv  ó  Google Sheets (var SHEET_CSV_URL).
// Salida:
//   docs/index.html               -> página neutra (no revela nada)
//   docs/<codigo>/index.html      -> PANEL compartido (solo con el código)
//   docs/demo/<slug>/index.html   -> cada demo
// Reglas: dedupe por teléfono, prioridad automática, orden por prioridad.
import { readFile, writeFile, mkdir, rm, cp, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATES = join(ROOT, "templates");
const DOCS = join(ROOT, "docs");
const DEMO_DIR = join(DOCS, "demo");

const config = JSON.parse(await readFile(join(ROOT, "generator", "config.json"), "utf8"));
const CODIGO = config.codigo;
const SHEET = process.env.SHEET_CSV_URL || "";

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
  String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "negocio";
const digits = (s) => String(s || "").replace(/\D/g, "");
const enc = (s) => encodeURIComponent(s || "");

function priority(r) {
  let p = 0;
  const tieneWeb = r.tiene_web ? !isNo(r.tiene_web) && /^(si|sí|1|true|yes|✓|x)$/i.test(r.tiene_web) : !!r.web_actual;
  if (!tieneWeb) p += 3;
  const res = Number(digits(r.resenas)) || 0;
  if (res >= 50) p += 3; else if (res >= 20) p += 2; else if (res >= 10) p += 1;
  const rt = Number(String(r.rating || "").replace(",", ".")) || 0;
  if (rt >= 4.5) p += 2; else if (rt >= 4.0) p += 1;
  return p;
}

// Fusiona por teléfono (o slug si no hay teléfono). Conserva lo ya trabajado.
function mergeRows(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = digits(r.telefono) || slugify(r.negocio);
    if (!map.has(key)) {
      map.set(key, { ...r, _slug: slugify(r.negocio) });
    } else {
      const cur = map.get(key);
      for (const [k, v] of Object.entries(r)) {
        if (v && !cur[k]) cur[k] = v;
      }
    }
  }
  // Slugs únicos
  const usados = new Map();
  for (const r of map.values()) {
    let s = r._slug, n = usados.get(s) || 0;
    if (n) { r._slug = s + "-" + (n + 1); }
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
  return {
    slug: row._slug,
    negocio, negocio_url: enc(negocio), negocio_mark: mark(negocio),
    ciudad, zona: row.zona || ciudad,
    direccion, direccion_url: enc(direccion),
    telefono: v.telefono, telefono_tel: "+" + v.whatsapp, whatsapp: v.whatsapp,
    vendedor_nombre: v.nombre,
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

function panel(rows) {
  const snapshot = rows.map((r) => ({
    _slug: r._slug, negocio: r.negocio || "", rubro: r.rubro || "", ciudad: r.ciudad || "",
    telefono: r.telefono || "", rating: r.rating || "", resenas: r.resenas || "", web_actual: r.web_actual || "",
    estado: r.estado || "Nuevo", vendedor: (r.vendedor || config.vendedorDefault || "").toLowerCase(),
    generar: !isNo(r.generar), prioridad: priority(r),
  }));
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(config.siteName)} · Panel</title>
<meta name="robots" content="noindex, nofollow">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#0b1a1d;--card:#122b31;--line:#1d444c;--text:#eaf3f4;--muted:#9dc0c5;--accent:#ea6a4b;--ok:#2f9e6e}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#0b1a1d,#0a3238);color:var(--text);font:15px/1.5 Inter,system-ui,sans-serif}
header{position:sticky;top:0;background:#0a2328;border-bottom:1px solid var(--line);padding:14px 20px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;z-index:5}
h1{font:700 1.2rem Outfit;margin:0;flex:1}
.pill{display:inline-block;padding:4px 10px;border-radius:999px;border:1px solid var(--line);font-size:.78rem;color:var(--muted)}
.wrap{padding:18px;max-width:1250px;margin:0 auto}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
select,input,button{font:inherit;color:var(--text);background:#15343b;border:1px solid var(--line);border-radius:9px;padding:8px 12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;display:grid;grid-template-columns:1fr auto;gap:6px 16px}
.card+.card{margin-top:10px}
.card h3{margin:0;font:600 1.08rem Outfit}
.meta{color:var(--muted);font-size:.85rem}
.row2{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:6px}
.tag{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;padding:3px 9px;border-radius:999px;border:1px solid var(--line)}
.wa{background:#128c7e;border:1px solid #128c7e;color:#fff;border-radius:999px;padding:4px 12px;font-size:.8rem;cursor:pointer}
.wa:hover{filter:brightness(.95)}
.v{font-weight:600}
.v.estefano{color:#ffd0c4}.v.luigui{color:#8fd3c7}
a{color:var(--accent)}
.right{text-align:right;display:flex;flex-direction:column;gap:6px;align-items:flex-end}
.prio{font:700 1.6rem Outfit;color:var(--accent)}
.empty{color:var(--muted);padding:30px}
</style></head><body>
<header>
  <h1>🗂️ ${esc(config.siteName)} · Panel</h1>
  <span class="pill" id="cnt">…</span>
  <span class="pill">🔒 Compartido</span>
</header>
<div class="wrap">
  <div class="filters">
    <select id="fRubro"><option value="">Todos los rubros</option></select>
    <select id="fEstado"><option value="">Todos los estados</option></select>
    <select id="fVend"><option value="">Todos los vendedores</option></select>
    <input id="q" placeholder="Buscar negocio…" style="flex:1;min-width:160px">
  </div>
  <div id="list"></div>
</div>
<script>
var SHEET=${JSON.stringify(SHEET)};
var SNAP=${JSON.stringify(snapshot)};
var BASE=${JSON.stringify(config.baseUrl)};
var CNT=${JSON.stringify((config.counter && config.counter.get) || "")};
var NS=${JSON.stringify((config.counter && config.counter.namespace) || "")};
var RUBROS=${JSON.stringify(Object.fromEntries(Object.entries(config.rubros).map(([k, v]) => [k, v.etiqueta])))};
function isNo(v){return /^(no|0|false|f|n)$/i.test(String(v||"").trim())}
function slugify(s){return String(s||"").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"negocio"}
function digits(s){return String(s||"").replace(/\\D/g,"")}
function priority(r){
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
 "Hola, ¿cómo está? Le escribo porque vi su negocio en Google y le armé una página web de muestra con la información que ya tiene publicada. Puede verla aquí: {link}. Si le interesa, la dejo lista con sus propias fotos y su dominio, sin compromiso.",
 "Buenas tardes. Encontré {negocio} en Google y, como vi que tiene buena reputación, le preparé una página web de muestra para que vea cómo quedaría. Está aquí: {link}. Dígame si le gusta y conversamos.",
 "¿Cómo está? Soy {vendedor}. Le hice una muestra de página web para {negocio} con lo que aparece en Google. Puede abrirla desde el celular: {link}. Cualquier consulta me escribe, sin apuro.",
 "Hola. Vi que {negocio} tiene buenas reseñas, así que le preparé una página web de muestra con sus datos. La puede ver aquí: {link}. Si le convence, la activo con sus fotos y su propio dominio.",
 "Buenas. Le armé una página de muestra para {negocio} con la información pública de Google. Échele un ojo aquí: {link}. Si quiere, la dejamos lista en pocos días.",
 "Hola, le escribo por {negocio}. Preparé una página web de muestra para que vea cómo se vería la suya. Está aquí: {link}. Si le parece, la activamos con su dominio.",
 "¿Cómo está? Vi su negocio en Google y le preparé una muestra de página web, sin costo. Puede verla aquí: {link}. Me cuenta qué le parece.",
 "Buen día. Soy {vendedor}, y le preparé una página web de muestra para {negocio}. Se ve así: {link}. Si le gusta, la dejamos lista con sus fotos y su dominio propio."
];
function waNumber(t){var d=String(t||"").replace(/\\D/g,"");if(!d)return "";if(d.indexOf("51")===0&&d.length>=11)return d;if(d[0]==="0")d="51"+d.slice(1);else if(d.length<=9)d="51"+d;return d}
var lastMsg=-1;
function cap(s){s=String(s||"");return s.charAt(0).toUpperCase()+s.slice(1)}
function buildMsg(r){var i=Math.floor(Math.random()*MSGS.length);if(MSGS.length>1&&i===lastMsg)i=(i+1)%MSGS.length;lastMsg=i;var t=MSGS[i];return t.replace(/\{vendedor\}/g,cap(r.vendedor)).replace(/\{negocio\}/g,r.negocio||"").replace(/\{link\}/g,BASE+"/demo/"+r._slug+"/")}
var DATA=[];
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-act=wa]");if(!b)return;
  var r=(DATA||[]).filter(function(x){return x._slug===b.getAttribute("data-slug")})[0];if(!r)return;
  var num=waNumber(r.telefono);if(!num)return;
  window.open("https://wa.me/"+num+"?text="+encodeURIComponent(buildMsg(r)),"_blank");
});
function render(){
  var fr=document.getElementById("fRubro").value,fe=document.getElementById("fEstado").value,fv=document.getElementById("fVend").value,qq=document.getElementById("q").value.toLowerCase();
  var list=document.getElementById("list");list.innerHTML="";
  var items=DATA.filter(function(r){
    if(fr&&r.rubro!==fr)return false; if(fe&&(r.estado||"")!==fe)return false; if(fv&&(r.vendedor||"")!==fv)return false;
    if(qq&&String(r.negocio||"").toLowerCase().indexOf(qq)<0)return false; return true;
  });
  document.getElementById("cnt").textContent=items.length+" de "+DATA.length+" negocios";
  if(!items.length){list.innerHTML='<p class="empty">Sin resultados.</p>';return}
  items.forEach(function(r){
    var url=BASE+"/demo/"+r._slug+"/";
    var gen=r.generar!==false;
    var waN=!!String(r.telefono||"").replace(/\\D/g,"");
    var el=document.createElement("div");el.className="card";
    el.innerHTML=
      '<div><h3>'+esc(r.negocio)+'</h3>'+
      '<p class="meta">'+esc(RUBROS[r.rubro]||r.rubro||"")+' · '+esc(r.ciudad||"")+(r.rating?" · ⭐ "+esc(r.rating):"")+(r.resenas?" ("+esc(r.resenas)+")":"")+(r.web_actual?" · con web":" · sin web")+'</p>'+
      '<div class="row2"><span class="tag">'+esc(r.estado||"Nuevo")+'</span><span class="v '+esc(r.vendedor||"")+'">👤 '+esc(cap(r.vendedor)||"—")+'</span>'+
      (gen?'<a href="'+url+'" target="_blank">abrir demo →</a>':'<span class="meta">sin demo</span>')+
      (waN?'<button class="wa" data-act="wa" data-slug="'+esc(r._slug)+'">Escribir por WhatsApp</button>':'')+
      ' · <span class="meta">👀 <b class="seen" data-s="'+esc(r._slug)+'">…</b></span></div></div>'+
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
  if(SHEET){try{data=normalize(parseCSV(await (await fetch(SHEET)).text()))}catch(e){}}
  DATA=data; fillSelects(); render();
})();
</script></body></html>`;
}

/* ----------------------------------------------------- página neutra --- */
function neutral() {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">
<title>·</title><style>body{margin:0;height:100vh;display:grid;place-items:center;background:#0b1a1d;color:#3f5b60;font:16px system-ui}</style>
</head><body>Página no disponible.</body></html>`;
}

/* ----------------------------------------------------------------- main --- */
const csvPath = join(ROOT, "data", "empresas.csv");
let csvText;
if (SHEET) {
  console.log("Fuente: Google Sheets");
  const res = await fetch(SHEET);
  if (!res.ok) throw new Error("No se pudo leer el Sheet: " + res.status);
  csvText = await res.text();
} else {
  console.log("Fuente: data/empresas.csv");
  csvText = await readFile(csvPath, "utf8");
}

const raw = toObjects(parseCSV(csvText));
const merged = mergeRows(raw);
merged.sort((a, b) => priority(b) - priority(a) || (Number(digits(b.resenas)) || 0) - (Number(digits(a.resenas)) || 0));

// Limpia outputs
await rm(DEMO_DIR, { recursive: true, force: true });
for (const e of await readdir(DOCS).catch(() => [])) {
  if (e === "demo" || e === "index.html") continue;
  await rm(join(DOCS, e), { recursive: true, force: true });
}
await mkdir(DEMO_DIR, { recursive: true });

let n = 0;
const listos = [];
for (const row of merged) {
  if (isNo(row.generar)) continue;
  const g = await renderDemo(row);
  if (g) { g.prioridad = priority(row); listos.push(g); n++; console.log(`  ✓ ${g.emoji} ${g.slug} [p${g.prioridad}] (${row.vendedor || config.vendedorDefault})`); }
}

// Panel + neutra
const panelDir = join(DOCS, CODIGO);
await mkdir(panelDir, { recursive: true });
await writeFile(join(panelDir, "index.html"), panel(merged), "utf8");
await writeFile(join(DOCS, "index.html"), neutral(), "utf8");
await writeFile(join(DOCS, ".nojekyll"), "", "utf8");

console.log(`\nDemos generadas: ${n} / ${merged.length} (dedupe de ${raw.length})`);
console.log(`Panel secreto: ${config.baseUrl}/${CODIGO}/`);
console.log(`Demos: ${config.baseUrl}/demo/<slug>/`);
