// Tablero local WEBITAS (opcional, para tu PC).
//   node tools/panel.mjs  →  http://localhost:5173
// Edita data/empresas.csv (vendedor por botones, generar, estado) y ejecuta build/publicar.
// El panel COMPARTIDO (para ti y tu socio) es el publicado: …/WEBITAS/<codigo>/
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, isAbsolute } from "node:path";
import { execFile } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
try { process.loadEnvFile?.(join(ROOT, ".env")); } catch {}

// Misma prioridad que el generador.
const CSV_CANDIDATES = [
  join(ROOT, "prospectos_consolidado.csv"),
  join(ROOT, "WEBITAS - prospectos_consolidado.csv"),
  join(ROOT, "data", "empresas.csv"),
];
const CSV = process.env.DATA_CSV
  ? (isAbsolute(process.env.DATA_CSV) ? process.env.DATA_CSV : join(ROOT, process.env.DATA_CSV))
  : (CSV_CANDIDATES.find((p) => existsSync(p)) || CSV_CANDIDATES[CSV_CANDIDATES.length - 1]);
const PORT = process.env.PORT || 5173;
const config = JSON.parse(await readFile(join(ROOT, "generator", "config.json"), "utf8"));

// Supabase: si hay URL + service key (en .env), el panel local lee y escribe ahí.
const SB_URL = (process.env.SUPABASE_URL || (config.supabase && config.supabase.url) || "").replace(/\/+$/, "");
const SB_KEY = process.env.SUPABASE_KEY || "";
const SB_TABLE = (config.supabase && config.supabase.tabla) || "prospectos";
const SB_ON = !!(SB_URL && SB_KEY);
const sbHeaders = { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" };
async function sbRows() {
  const res = await fetch(`${SB_URL}/rest/v1/${SB_TABLE}?select=*`, { headers: sbHeaders });
  if (!res.ok) throw new Error("Supabase " + res.status);
  const rows = await res.json();
  return rows.map((r) => { const o = {}; for (const [k, v] of Object.entries(r)) o[k] = v == null ? "" : String(v); return o; });
}
async function sbPatch(negocio, fields) {
  const url = `${SB_URL}/rest/v1/${SB_TABLE}?negocio=eq.${encodeURIComponent(negocio)}`;
  const res = await fetch(url, { method: "PATCH", headers: { ...sbHeaders, Prefer: "return=minimal" }, body: JSON.stringify(fields || {}) });
  return res.ok;
}

function parseCSV(text) {
  const rows = []; let row = [], f = "", q = false;
  text = text.replace(/\r\n/g, "\n");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows.filter((r) => r.some((v) => v !== ""));
}
const toObj = (rows) => { const h = rows[0].map((x) => x.trim()); return rows.slice(1).map((r) => { const o = {}; h.forEach((k, i) => (o[k] = (r[i] ?? "").trim())); return o; }); };
const quote = (v) => (/[",\n]/.test(v) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v));
const serialize = (h, objs) => [h.join(",")].concat(objs.map((o) => h.map((k) => quote(o[k] ?? "")).join(","))).join("\n") + "\n";
const slugify = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "negocio";
const isNo = (v) => /^(no|0|false|f|n)$/i.test(String(v || "").trim());
async function load() {
  if (SB_ON) { const objs = await sbRows(); return { header: objs[0] ? Object.keys(objs[0]) : [], objs }; }
  const rows = parseCSV(await readFile(CSV, "utf8"));
  return { header: rows[0].map((x) => x.trim()), objs: toObj(rows) };
}
const save = (h, o) => writeFile(CSV, serialize(h, o), "utf8");
const run = (cmd, args) => new Promise((res) => execFile(cmd, args, { cwd: ROOT, shell: true }, (e, so, se) => res({ ok: !e, log: (so || "") + (se || "") + (e ? "\nERROR: " + e.message : "") })));

function page() {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WEBITAS · Tablero local</title>
<style>
:root{--bg:#0b1a1d;--card:#122b31;--line:#1d444c;--text:#eaf3f4;--muted:#9dc0c5;--accent:#ea6a4b}
*{box-sizing:border-box}body{margin:0;background:#0b1a1d;color:var(--text);font:15px/1.5 Inter,system-ui,sans-serif}
header{position:sticky;top:0;background:#0a2328;border-bottom:1px solid var(--line);padding:14px 20px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;z-index:5}
h1{font:700 1.15rem Outfit;margin:0;flex:1}
button{cursor:pointer;border:1px solid var(--line);background:#15343b;color:var(--text);border-radius:9px;padding:8px 14px}
button:hover{border-color:var(--accent)}button.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}button:disabled{opacity:.45;cursor:not-allowed}
.wrap{padding:18px;max-width:1200px;margin:0 auto}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--line);font-size:.9rem}
th{background:#0e262c;color:var(--muted);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase}
tr:last-child td{border-bottom:0}
.vend{display:flex;gap:6px}.vend button{padding:6px 10px;font-size:.8rem}.vend button.on{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700}
.pill{display:inline-block;padding:3px 9px;border-radius:999px;border:1px solid var(--line);font-size:.75rem;color:var(--muted)}
a{color:var(--accent)}.muted{color:var(--muted)}.chk{width:20px;height:20px}
#log{white-space:pre-wrap;background:#08181c;border:1px solid var(--line);border-radius:12px;padding:14px;margin-top:16px;font:12px/1.5 ui-monospace,monospace;max-height:240px;overflow:auto;display:none}
</style></head><body>
<header><h1>🗂️ WEBITAS · local</h1><span class="muted" id="resumen"></span>
<button class="primary" data-cmd="build">⚙️ Generar</button><button data-cmd="deploy">🚀 Publicar</button><button data-cmd="refresh">↻</button></header>
<div class="wrap"><table><thead><tr>
<th>Negocio</th><th>Rubro</th><th>Ciudad</th><th>Prior.</th><th>Estado</th><th>Vendedor</th><th>Generar</th><th>Demo</th><th>👀</th>
</tr></thead><tbody id="tb"></tbody></table><pre id="log"></pre>
<div class="wrap" style="padding-left:0;color:var(--muted);font-size:.82rem">Panel compartido (con tu socio): <a href="#" id="panelUrl"></a></div></div>
<script>
var BASE=${JSON.stringify(config.baseUrl)},CODIGO=${JSON.stringify(config.codigo)};
var CNT=${JSON.stringify((config.counter && config.counter.get) || "")},NS=${JSON.stringify((config.counter && config.counter.namespace) || "")};
var GEN=/^(x|si|sí|1|yes|✓)$/i;
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function slugify(s){return String(s||"").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"negocio"}
function isNo(v){return /^(no|0|false|f|n)$/i.test(String(v||"").trim())}
function prio(r){var p=0;var web=r.web_actual||(r.tiene_web&&!isNo(r.tiene_web));if(!web)p+=3;var res=Number(String(r.resenas||"").replace(/\\D/g,""))||0;if(res>=50)p+=3;else if(res>=20)p+=2;else if(res>=10)p+=1;var rt=Number(String(r.rating||"").replace(",","."))||0;if(rt>=4.5)p+=2;else if(rt>=4.0)p+=1;return p}
function api(ep,b){return fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b||{})}).then(function(r){return r.json()})}
async function load(){
  var d=await (await fetch("/api/rows")).json();var rows=d.objs;
  document.getElementById("panelUrl").href=BASE+"/"+CODIGO+"/";document.getElementById("panelUrl").textContent=BASE+"/"+CODIGO+"/";
  rows.sort(function(a,b){return prio(b)-prio(a)});
  var tb=document.getElementById("tb");tb.innerHTML="";
  rows.forEach(function(r){
    var gen=!isNo(r.generar);var sl=slugify(r.negocio);var vend=(r.vendedor||"").toLowerCase();
    var tr=document.createElement("tr");
    tr.innerHTML='<td><b>'+esc(r.negocio)+'</b></td><td><span class="pill">'+esc(r.rubro)+'</span></td><td>'+esc(r.ciudad||"")+'</td><td><b>'+prio(r)+'</b></td>'+
      '<td>'+esc(r.estado||"Nuevo")+'</td>'+
      '<td><div class="vend"><button data-act="v" data-n="'+esc(r.negocio)+'" data-v="estefano"'+(vend==="estefano"?' class="on" disabled':'')+'>Estefano</button>'+
      '<button data-act="v" data-n="'+esc(r.negocio)+'" data-v="luigui"'+(vend==="luigui"?' class="on" disabled':'')+'>Luigui</button></div></td>'+
      '<td><input class="chk" type="checkbox" data-act="g" data-n="'+esc(r.negocio)+'"'+(gen?" checked":"")+'></td>'+
      '<td>'+(gen?'<a href="'+BASE+'/demo/'+sl+'/" target="_blank">abrir →</a>':'<span class="muted">—</span>')+'</td>'+
      '<td><span class="seen" data-s="'+sl+'">…</span></td>';
    tb.appendChild(tr);
  });
  var c={};rows.forEach(function(r){var e=r.estado||"Nuevo";c[e]=(c[e]||0)+1});
  var contactados=(c.Contactado||0)+(c.Interesado||0)+(c.Vendido||0);
  var vendidos=c.Vendido||0;
  var pct=function(a,b){return b?Math.round(a/b*100):0};
  document.getElementById("resumen").textContent=
    rows.length+" negocios · "+(c.Nuevo||0)+" nuevos · "+contactados+" contactados · "+(c.Interesado||0)+" interesados · "+vendidos+" vendidos · "+pct(vendidos,contactados)+"% cierre";
  document.querySelectorAll(".seen").forEach(function(el){if(!CNT||!NS){el.textContent="—";return}fetch(CNT+"/"+NS+"/"+el.getAttribute("data-s")).then(function(r){return r.json()}).then(function(x){el.textContent=(x&&typeof x.value==="number")?x.value:"—"}).catch(function(){el.textContent="—"})});
}
document.getElementById("tb").addEventListener("click",function(e){var b=e.target.closest("button[data-act=v]");if(b)setF(b.getAttribute("data-n"),{vendedor:b.getAttribute("data-v")})});
document.getElementById("tb").addEventListener("change",function(e){var c=e.target.closest("input[data-act=g]");if(c)setF(c.getAttribute("data-n"),{generar:c.checked?"":"no"})});
document.querySelector("header").addEventListener("click",function(e){var b=e.target.closest("button[data-cmd]");if(!b)return;var c=b.getAttribute("data-cmd");if(c==="build")cmd("/api/build","⚙️ Generando…");else if(c==="deploy")cmd("/api/deploy","🚀 Publicando…");else load()});
async function setF(negocio,fields){await api("/api/set",{negocio:negocio,fields:fields});load()}
async function cmd(ep,msg){var l=document.getElementById("log");l.style.display="block";l.textContent=msg;var r=await api(ep);l.textContent=r.log||"(sin salida)";load()}
load();
</script></body></html>`;
}

const server = createServer(async (req, res) => {
  const send = (c, t, b) => { res.writeHead(c, { "Content-Type": t }); res.end(b); };
  const body = () => new Promise((r) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => r(b ? JSON.parse(b) : {})); });
  try {
    if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/?"))) return send(200, "text/html; charset=utf-8", page());
    if (req.method === "GET" && req.url === "/api/rows") { const { header, objs } = await load(); return send(200, "application/json", JSON.stringify({ header, objs })); }
    if (req.method === "POST" && req.url === "/api/set") {
      const { negocio, fields } = await body();
      if (SB_ON) { const ok = await sbPatch(negocio, fields); return send(200, "application/json", JSON.stringify({ ok })); }
      const { header, objs } = await load();
      const row = objs.find((o) => o.negocio === negocio); if (row) Object.assign(row, fields || {});
      await save(header, objs); return send(200, "application/json", JSON.stringify({ ok: true }));
    }
    if (req.method === "POST" && req.url === "/api/build") return send(200, "application/json", JSON.stringify(await run("node", ["generator/build.mjs"])));
    if (req.method === "POST" && req.url === "/api/deploy") {
      const a = await run("git", ["add", "-A"]), c = await run("git", ["commit", "-m", "build: regenerar demos"]), p = await run("git", ["push"]);
      return send(200, "application/json", JSON.stringify({ ok: a.ok && p.ok, log: a.log + "\n" + c.log + "\n" + p.log }));
    }
    send(404, "text/plain", "404");
  } catch (e) { send(500, "text/plain", String(e?.stack || e)); }
});
server.listen(PORT, () => console.log(`\n  WEBITAS · Tablero local: http://localhost:${PORT}\n  Fuente: ${SB_ON ? "Supabase " + SB_URL : "CSV " + CSV.replace(ROOT + "\\", "")}\n  Panel compartido: ${config.baseUrl}/${config.codigo}/\n`));
