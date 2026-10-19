// Importa un CSV de prospectos a Supabase (tabla public.prospectos).
//
// Uso:
//   node tools/supabase-import.mjs "WEBITAS - prospectos_consolidado.csv" --replace
//   node tools/supabase-import.mjs                  (usa el CSV local automático)
//
// Requiere en .env: SUPABASE_URL y SUPABASE_KEY (service_role). Ver .env.example.
// Las columnas del CSV se mapean a las de la tabla; sobran contacto/tiktok/publicar (se ignoran).
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, isAbsolute } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
try { process.loadEnvFile?.(join(ROOT, ".env")); } catch {}

const args = process.argv.slice(2);
const replace = args.includes("--replace");
const pathArg = args.find((a) => !a.startsWith("--"));

const SB_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SB_KEY = process.env.SUPABASE_KEY || "";
const TABLE = process.env.SUPABASE_TABLE || "prospectos";
if (!SB_URL || !SB_KEY) {
  console.error("Faltan SUPABASE_URL y/o SUPABASE_KEY. Copia .env.example a .env y rellénalos (Settings → API → service_role).");
  process.exit(1);
}

const CSV_CANDIDATES = [
  join(ROOT, "prospectos_consolidado.csv"),
  join(ROOT, "WEBITAS - prospectos_consolidado.csv"),
  join(ROOT, "data", "empresas.csv"),
];
const csvPath = pathArg
  ? (isAbsolute(pathArg) ? pathArg : join(ROOT, pathArg))
  : CSV_CANDIDATES.find((p) => existsSync(p));
if (!csvPath || !existsSync(csvPath)) {
  console.error("No encuentro el CSV. Pásame la ruta como argumento.");
  process.exit(1);
}

function parseCSV(text) {
  const rows = []; let row = [], field = "", q = false;
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => String(v).trim() !== ""));
}
function toObjects(rows) {
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => { const o = {}; header.forEach((h, i) => (o[h] = String(r[i] ?? "").trim())); return o; });
}

// Columnas de la tabla (coinciden con el CSV). Se ignoran contacto/tiktok/publicar.
const COLS = ["negocio", "rubro", "categoria", "direccion", "zona", "ciudad", "maps_url", "telefono", "email",
  "horarios", "instagram", "instagram_url", "facebook", "web_actual", "rating", "resenas", "tiene_web",
  "estado", "vendedor", "prioridad_manual", "proximo_contacto", "ultimo_contacto", "canal", "generar", "notas"];
const NUM = new Set(["rating", "resenas", "prioridad_manual"]);

const objs = toObjects(parseCSV(await readFile(csvPath, "utf8")));
const payload = objs.map((o) => {
  const row = {};
  for (const c of COLS) {
    const raw = o[c] ?? "";
    if (NUM.has(c)) { const n = Number(String(raw).replace(",", ".")); row[c] = raw === "" || isNaN(n) ? null : n; }
    else row[c] = raw === "" ? null : raw;
  }
  return row;
}).filter((r) => r.negocio);

console.log("CSV: " + csvPath.replace(ROOT + "\\", ""));
console.log(`Filas a importar: ${payload.length}${replace ? " (reemplazando todo)" : ""}`);

const headers = { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json", Prefer: "return=minimal" };

if (replace) {
  const del = await fetch(`${SB_URL}/rest/v1/${TABLE}?id=gt.0`, { method: "DELETE", headers });
  if (!del.ok) { console.error("Error al vaciar la tabla:", del.status, (await del.text()).slice(0, 300)); process.exit(1); }
  console.log("Tabla vaciada.");
}

let ok = 0;
for (let i = 0; i < payload.length; i += 100) {
  const batch = payload.slice(i, i + 100);
  const res = await fetch(`${SB_URL}/rest/v1/${TABLE}`, { method: "POST", headers, body: JSON.stringify(batch) });
  if (!res.ok) { console.error(`Error en lote ${Math.floor(i / 100) + 1}:`, res.status, (await res.text()).slice(0, 300)); process.exit(1); }
  ok += batch.length;
  console.log(`  ✓ ${ok}/${payload.length}`);
}
console.log(`\nListo. ${ok} prospectos importados en ${SB_URL}/rest/v1/${TABLE}`);
