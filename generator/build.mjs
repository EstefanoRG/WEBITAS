// Generador de demos WEBITAS.
// Lee el CSV maestro (local o Google Sheets publicado) y por cada negocio con
// "generar" tildado escribe docs/demos/<slug>/ a partir de la plantilla de su rubro.
//
// Uso:
//   node generator/build.mjs                 (usa data/empresas.csv)
//   SHEET_CSV_URL="..." node generator/build.mjs   (usa Google Sheets)
import { readFile, writeFile, mkdir, rm, cp, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATES = join(ROOT, "templates");
const DOCS = join(ROOT, "docs");
const DEMOS = join(DOCS, "demos");

const config = JSON.parse(await readFile(join(ROOT, "generator", "config.json"), "utf8"));

/* ------------------------------------------------------------------ CSV --- */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => String(v).trim() !== ""));
}

function toObjects(rows) {
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o = {};
    header.forEach((h, i) => (o[h] = (r[i] ?? "").trim()));
    return o;
  });
}

const isTrue = (v) => /^(x|si|sí|1|true|yes|✓|✔|verdadero|si,)$/i.test(String(v).trim());

/* --------------------------------------------------------------- tokens --- */
const enc = (s) => encodeURIComponent(s || "");
function mark(name) {
  const parts = String(name).replace(/[^\p{L}\p{N} ]/gu, "").split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return String(name).replace(/\s+/g, "").slice(0, 3).toUpperCase();
}

function tokensFor(row) {
  const vendedorKey = (row.vendedor || config.vendedorDefault || "estefano").toLowerCase();
  const v = config.vendedores[vendedorKey] || config.vendedores[config.vendedorDefault];
  const negocio = row.negocio || "Mi Negocio";
  const ciudad = row.ciudad || "Lima";
  const direccion = row.direccion || ciudad + ", Perú";
  return {
    slug: row.slug,
    negocio,
    negocio_url: enc(negocio),
    negocio_mark: mark(negocio),
    ciudad,
    zona: row.zona || ciudad,
    direccion,
    direccion_url: enc(direccion),
    telefono: v.telefono,
    telefono_tel: "+" + v.whatsapp,
    whatsapp: v.whatsapp,
    vendedor_nombre: v.nombre,
    email: row.email || "",
    horarios: row.horarios || "",
    instagram_user: row.instagram || "",
    instagram_url: row.instagram_url || "#",
    facebook_url: row.facebook || "#",
    year: String(new Date().getFullYear()),
  };
}

function fill(text, tokens) {
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, key) => (key in tokens ? tokens[key] : m));
}

/* --------------------------------------------------------------- render --- */
async function copyAssets(tplDir, outDir) {
  const dirs = ["img", "video", "assets", "fonts"];
  for (const d of dirs) {
    const src = join(tplDir, d);
    try {
      if ((await stat(src)).isDirectory()) {
        await cp(src, join(outDir, d), { recursive: true });
      }
    } catch { /* no existe */ }
  }
}

function counterTag(tokens) {
  const c = config.counter;
  if (!c || !c.hit) return "";
  return `\n  <script>(function(){try{fetch(${JSON.stringify(c.hit + "/" + c.namespace + "/" + tokens.slug)}).catch(function(){});}catch(e){}})();</script>\n`;
}

async function renderDemo(row) {
  const rubro = (row.rubro || "").toLowerCase();
  const cfg = config.rubros[rubro];
  if (!cfg) { console.warn(`  ! rubro desconocido "${row.rubro}" en ${row.slug} — omitido`); return null; }
  const tplDir = join(TEMPLATES, cfg.plantilla);
  const outDir = join(DEMOS, row.slug);
  const tokens = tokensFor(row);

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  let html = await readFile(join(tplDir, "index.html"), "utf8");
  html = fill(html, tokens);
  const pub = row.publicar === "" ? true : isTrue(row.publicar);
  if (!pub) html = html.replace('<meta name="robots" content="noindex, nofollow">', '<meta name="robots" content="noindex, nofollow"><!-- borrador -->');
  html = html.replace(/<\/body>/i, counterTag(tokens) + "</body>");
  await writeFile(join(outDir, "index.html"), html, "utf8");

  for (const asset of ["style.css", "script.js"]) {
    try {
      const css = await readFile(join(tplDir, asset), "utf8");
      await writeFile(join(outDir, asset), fill(css, tokens), "utf8");
    } catch { /* no existe */ }
  }
  await copyAssets(tplDir, outDir);
  return { ...row, tokens, publicar: pub, etiqueta: cfg.etiqueta, emoji: cfg.emoji };
}

/* ------------------------------------------------------------------ hub --- */
function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function hub(generated) {
  const porRubro = {};
  for (const d of generated) {
    (porRubro[d.rubro] = porRubro[d.rubro] || []).push(d);
  }
  const orden = Object.keys(config.rubros);
  const grupos = orden
    .filter((r) => porRubro[r])
    .map((r) => {
      const cfg = config.rubros[r];
      const items = porRubro[r]
        .map((d) => {
          const url = `${config.baseUrl}/demos/${d.slug}/`;
          const estado = d.estado ? `<span class="tag">${esc(d.estado)}</span>` : "";
          const seen = `<span class="seen" data-slug="${esc(d.slug)}">—</span>`;
          return `<li class="card">
          <div class="card__top"><span class="emoji">${cfg.emoji}</span>${estado}</div>
          <h3>${esc(d.negocio)}</h3>
          <p class="meta">${esc(d.ciudad || "")}${d.vendedor ? " · " + esc(d.vendedor) : ""}</p>
          <p class="seen-line">👀 Veces visto: ${seen}</p>
          <a class="open" href="${url}" target="_blank" rel="noopener">Abrir demo →</a>
        </li>`;
        })
        .join("\n");
      return `<section class="grupo"><h2>${cfg.emoji} ${esc(cfg.etiqueta)}</h2><ul class="grid">${items}</ul></section>`;
    })
    .join("\n");

  const total = generated.length;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(config.siteName)}</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#0b1a1d;--card:#122b31;--line:#1d444c;--text:#eaf3f4;--muted:#9dc0c5;--accent:#ea6a4b}
*{box-sizing:border-box}
body{margin:0;background:linear-gradient(180deg,#0b1a1d,#0a3238);color:var(--text);font-family:Inter,system-ui,sans-serif;min-height:100vh}
.wrap{max-width:1100px;margin:0 auto;padding:clamp(24px,5vw,64px) clamp(16px,4vw,40px) 80px}
header h1{font-family:Outfit;font-size:clamp(1.8rem,1.2rem+2vw,2.8rem);margin:0 0 6px}
header p{color:var(--muted);margin:0 0 8px}
header .count{display:inline-block;margin-top:8px;padding:6px 12px;border:1px solid var(--line);border-radius:999px;font-size:.85rem;color:var(--muted)}
.grupo{margin-top:44px}
.grupo h2{font-family:Outfit;font-size:1.35rem;margin:0 0 16px}
.grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:6px;transition:transform .2s ease,border-color .2s ease}
.card:hover{transform:translateY(-3px);border-color:var(--accent)}
.card__top{display:flex;justify-content:space-between;align-items:center}
.emoji{font-size:1.5rem}
.tag{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#ffd0c4;border:1px solid var(--line);border-radius:999px;padding:3px 9px}
.card h3{margin:2px 0 0;font-family:Outfit;font-size:1.15rem}
.meta{margin:0;color:var(--muted);font-size:.85rem;text-transform:capitalize}
.seen-line{margin:6px 0 0;font-size:.85rem;color:var(--muted)}
.seen{color:var(--text);font-weight:600}
.open{margin-top:auto;padding-top:10px;color:var(--accent);font-weight:600;text-decoration:none}
.open:hover{text-decoration:underline}
footer{margin-top:64px;color:var(--muted);font-size:.85rem;text-align:center}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>${esc(config.siteName)}</h1>
    <p>Demos generados a partir de las plantillas por rubro.</p>
    <span class="count">${total} demo${total === 1 ? "" : "s"} publicado${total === 1 ? "" : "s"}</span>
  </header>
  ${grupos || '<p style="color:var(--muted);margin-top:40px">Aún no hay demos marcados con “generar”.</p>'}
  <footer>WEBITAS · GitHub Pages</footer>
</div>
<script>
(function(){
  var base=${JSON.stringify((config.counter && config.counter.get) || "")},ns=${JSON.stringify((config.counter && config.counter.namespace) || "")};
  if(!base||!ns)return;
  document.querySelectorAll(".seen").forEach(function(el){
    fetch(base+"/"+ns+"/"+el.getAttribute("data-slug")).then(function(r){return r.json()}).then(function(d){
      el.textContent=(d&&typeof d.value==="number")?d.value:"—";
    }).catch(function(){});
  });
})();
</script>
</body>
</html>
`;
}

/* ----------------------------------------------------------------- main --- */
const csvPath = join(ROOT, "data", "empresas.csv");
let csvText;
const sheetUrl = process.env.SHEET_CSV_URL;
if (sheetUrl) {
  console.log("Fuente: Google Sheets (SHEET_CSV_URL)");
  const res = await fetch(sheetUrl);
  if (!res.ok) throw new Error("No se pudo leer el Sheet: " + res.status);
  csvText = await res.text();
} else {
  console.log("Fuente: data/empresas.csv");
  csvText = await readFile(csvPath, "utf8");
}

const rows = toObjects(parseCSV(csvText));
const conGenerar = rows.filter((r) => r.slug && isTrue(r.generar));
console.log(`Negocios con "generar": ${conGenerar.length} / ${rows.length}`);

await mkdir(DEMOS, { recursive: true });
// Limpia demos anteriores para que lo destildado desaparezca.
for (const entry of await readdir(DEMOS).catch(() => [])) {
  await rm(join(DEMOS, entry), { recursive: true, force: true });
}

const generated = [];
for (const row of conGenerar) {
  const g = await renderDemo(row);
  if (g) { generated.push(g); console.log(`  ✓ ${g.emoji} ${g.slug} (${g.rubro}) ${g.publicar ? "" : "[borrador]"}`); }
}

await writeFile(join(DOCS, "index.html"), hub(generated), "utf8");
await writeFile(join(DOCS, ".nojekyll"), "", "utf8");

console.log(`\nHub: docs/index.html · Demos: ${generated.length}`);
console.log(`Local: docs/index.html · Público: ${config.baseUrl}/`);
