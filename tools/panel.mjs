// Tablero local WEBITAS (privado, se abre solo en tu PC).
//   node tools/panel.mjs   →  http://localhost:5173
// Ver prospectos, asignar vendedor (Estefano / Luigui) por negocio,
// tildar "generar", ver veces visto y ejecutar generar / publicar.
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFile } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSV = join(ROOT, "data", "empresas.csv");
const PORT = process.env.PORT || 5173;

const config = JSON.parse(await readFile(join(ROOT, "generator", "config.json"), "utf8"));

/* ------------------------------------------------------------- CSV io --- */
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", q = false;
  text = text.replace(/\r\n/g, "\n");
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
  return rows.filter((r) => r.some((v) => v !== ""));
}
function toObj(rows) {
  const h = rows[0].map((x) => x.trim());
  return rows.slice(1).map((r) => { const o = {}; h.forEach((k, i) => (o[k] = (r[i] ?? "").trim())); return o; });
}
const quote = (v) => (/[",\n]/.test(v) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v));
function serialize(header, objs) {
  const lines = [header.join(",")];
  for (const o of objs) lines.push(header.map((k) => quote(o[k] ?? "")).join(","));
  return lines.join("\n") + "\n";
}
async function load() {
  const txt = await readFile(CSV, "utf8");
  const rows = parseCSV(txt);
  return { header: rows[0].map((x) => x.trim()), objs: toObj(rows) };
}
async function save(header, objs) { await writeFile(CSV, serialize(header, objs), "utf8"); }

function run(cmd, args) {
  return new Promise((res) => {
    execFile(cmd, args, { cwd: ROOT, shell: true }, (err, stdout, stderr) => {
      res({ ok: !err, log: (stdout || "") + (stderr || "") + (err ? "\nERROR: " + err.message : "") });
    });
  });
}

/* -------------------------------------------------------------- page --- */
function page() {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>WEBITAS · Tablero</title>
<style>
:root{--bg:#0b1a1d;--card:#122b31;--line:#1d444c;--text:#eaf3f4;--muted:#9dc0c5;--accent:#ea6a4b}
*{box-sizing:border-box}
body{margin:0;background:#0b1a1d;color:var(--text);font:15px/1.5 Inter,system-ui,sans-serif}
header{position:sticky;top:0;background:#0a2328;border-bottom:1px solid var(--line);padding:16px 22px;z-index:5;display:flex;flex-wrap:wrap;gap:12px;align-items:center}
h1{font-size:1.2rem;margin:0;flex:1}
button{cursor:pointer;border:1px solid var(--line);background:#15343b;color:var(--text);border-radius:9px;padding:8px 14px;font:inherit}
button:hover{border-color:var(--accent)}
button.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}
button:disabled{opacity:.45;cursor:not-allowed}
.wrap{padding:22px;max-width:1200px;margin:0 auto}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--line);font-size:.9rem;vertical-align:middle}
th{background:#0e262c;color:var(--muted);font-weight:600;text-transform:uppercase;font-size:.72rem;letter-spacing:.06em}
tr:last-child td{border-bottom:0}
.vend{display:flex;gap:6px}
.vend button{padding:6px 10px;font-size:.8rem}
.vend button.on{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700}
.pill{display:inline-block;padding:3px 9px;border-radius:999px;border:1px solid var(--line);font-size:.75rem;color:var(--muted)}
a{color:var(--accent)}
.muted{color:var(--muted)}
.seen{font-weight:700}
#log{white-space:pre-wrap;background:#08181c;border:1px solid var(--line);border-radius:12px;padding:14px;margin-top:18px;font:12px/1.5 ui-monospace,monospace;max-height:260px;overflow:auto;display:none}
.chk{width:20px;height:20px}
</style></head><body>
<header>
  <h1>🗂️ WEBITAS · Tablero</h1>
  <span class="muted" id="resumen"></span>
  <button class="primary" data-cmd="build">⚙️ Generar</button>
  <button data-cmd="deploy">🚀 Publicar en GitHub</button>
  <button data-cmd="refresh">↻ Refrescar</button>
</header>
<div class="wrap">
  <table>
    <thead><tr>
      <th>Negocio</th><th>Rubro</th><th>Ciudad</th><th>Estado</th>
      <th>Vendedor</th><th>Generar</th><th>Demo</th><th>👀 Visto</th>
    </tr></thead>
    <tbody id="tb"></tbody>
  </table>
  <pre id="log"></pre>
</div>
<script>
var BASE=${JSON.stringify(config.baseUrl)};
var CNT=${JSON.stringify((config.counter && config.counter.get) || "")};
var NS=${JSON.stringify((config.counter && config.counter.namespace) || "")};
var GEN=/^(x|si|sí|1|yes|✓)$/i;
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function api(ep,body){return fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body||{})}).then(function(r){return r.json()})}

async function load(){
  var d=await (await fetch("/api/rows")).json();
  var rows=d.objs;var tb=document.getElementById("tb");tb.innerHTML="";
  var marc=rows.filter(function(r){return GEN.test(r.generar||"")}).length;
  document.getElementById("resumen").textContent=marc+" de "+rows.length+" marcados";
  rows.forEach(function(r){
    var gen=GEN.test(r.generar||"");var slug=r.slug||"";var vend=(r.vendedor||"").toLowerCase();
    var tr=document.createElement("tr");
    tr.innerHTML=
      '<td><b>'+esc(r.negocio)+'</b><br><span class="muted" style="font-size:.78rem">'+esc(slug)+'</span></td>'+
      '<td><span class="pill">'+esc(r.rubro)+'</span></td>'+
      '<td>'+esc(r.ciudad||"")+'</td>'+
      '<td>'+esc(r.estado||"")+'</td>'+
      '<td><div class="vend">'+
        '<button data-act="vend" data-slug="'+esc(slug)+'" data-v="estefano"'+(vend==="estefano"?' class="on" disabled':'')+'>Estefano</button>'+
        '<button data-act="vend" data-slug="'+esc(slug)+'" data-v="luigui"'+(vend==="luigui"?' class="on" disabled':'')+'>Luigui</button>'+
      '</div></td>'+
      '<td><input class="chk" type="checkbox" data-act="gen" data-slug="'+esc(slug)+'"'+(gen?" checked":"")+'></td>'+
      '<td>'+(gen?'<a href="'+BASE+'/demos/'+slug+'/" target="_blank">abrir →</a>':'<span class="muted">—</span>')+'</td>'+
      '<td><span class="seen" data-s="'+esc(slug)+'">…</span></td>';
    tb.appendChild(tr);
  });
  document.querySelectorAll(".seen").forEach(function(el){
    if(!CNT||!NS){el.textContent="0";return;}
    fetch(CNT+"/"+NS+"/"+el.getAttribute("data-s")).then(function(r){return r.json()}).then(function(x){el.textContent=(x&&typeof x.value==="number")?x.value:"0"}).catch(function(){el.textContent="0"});
  });
}

document.getElementById("tb").addEventListener("click",function(e){
  var b=e.target.closest("button[data-act=vend]");if(!b)return;
  setV(b.getAttribute("data-slug"),b.getAttribute("data-v"));
});
document.getElementById("tb").addEventListener("change",function(e){
  var c=e.target.closest("input[data-act=gen]");if(!c)return;
  setF(c.getAttribute("data-slug"),"generar",c.checked?"x":"");
});
document.querySelector("header").addEventListener("click",function(e){
  var b=e.target.closest("button[data-cmd]");if(!b)return;
  var c=b.getAttribute("data-cmd");
  if(c==="build")doCmd("/api/build","⚙️ Generando…");
  else if(c==="deploy")doCmd("/api/deploy","🚀 Publicando…");
  else if(c==="refresh")load();
});

async function setV(slug,v){await api("/api/set",{slug:slug,fields:{vendedor:v,generar:"x"}});load()}
async function setF(slug,field,value){await api("/api/set",{slug:slug,fields:{[field]:value}});load()}
async function doCmd(ep,msg){
  var l=document.getElementById("log");l.style.display="block";l.textContent=msg;
  var r=await api(ep);l.textContent=r.log||"(sin salida)";load();
}
load();
</script></body></html>`;
}

/* ------------------------------------------------------------ server --- */
const server = createServer(async (req, res) => {
  const send = (code, type, body) => { res.writeHead(code, { "Content-Type": type }); res.end(body); };
  const readBody = () => new Promise((r) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => r(b ? JSON.parse(b) : {})); });

  try {
    if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/?"))) {
      return send(200, "text/html; charset=utf-8", page());
    }
    if (req.method === "GET" && req.url === "/api/rows") {
      const { header, objs } = await load();
      return send(200, "application/json", JSON.stringify({ header, objs }));
    }
    if (req.method === "POST" && req.url === "/api/set") {
      const { slug, fields } = await readBody();
      const { header, objs } = await load();
      const row = objs.find((o) => o.slug === slug);
      if (row) Object.assign(row, fields || {});
      await save(header, objs);
      return send(200, "application/json", JSON.stringify({ ok: true }));
    }
    if (req.method === "POST" && req.url === "/api/build") {
      return send(200, "application/json", JSON.stringify(await run("node", ["generator/build.mjs"])));
    }
    if (req.method === "POST" && req.url === "/api/deploy") {
      const a = await run("git", ["add", "-A"]);
      const c = await run("git", ["commit", "-m", "build: regenerar demos"]);
      const p = await run("git", ["push"]);
      return send(200, "application/json", JSON.stringify({ ok: a.ok && p.ok, log: a.log + "\n" + c.log + "\n" + p.log }));
    }
    send(404, "text/plain", "404");
  } catch (e) {
    send(500, "text/plain", String(e && e.stack ? e.stack : e));
  }
});

server.listen(PORT, () => {
  console.log(`\n  WEBITAS · Tablero: http://localhost:${PORT}`);
  console.log("  Ctrl+C para cerrar.\n");
});
