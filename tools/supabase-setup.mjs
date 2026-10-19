// Configura Supabase en un paso, leyendo las claves de .env (nunca se imprimen):
//   · Si hay SUPABASE_PAT -> aplica supabase/schema.sql (crea la tabla) vía Management API.
//   · Si hay SUPABASE_ANON_KEY -> la guarda en generator/config.json (supabase.anonKey).
//
// Uso:  node tools/supabase-setup.mjs
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
try { process.loadEnvFile?.(join(ROOT, ".env")); } catch {}

const cfgPath = join(ROOT, "generator", "config.json");
const cfg = JSON.parse(await readFile(cfgPath, "utf8"));
const SB_URL = (process.env.SUPABASE_URL || (cfg.supabase && cfg.supabase.url) || "").replace(/\/+$/, "");
const PAT = process.env.SUPABASE_PAT || "";
const ANON = process.env.SUPABASE_ANON_KEY || "";
const ref = (SB_URL.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i) || [])[1] || "";

if (!SB_URL) { console.error("Falta SUPABASE_URL (en .env o en config.json → supabase.url)."); process.exit(1); }

// 1) Aplicar el esquema (crear la tabla) si hay PAT.
if (PAT && ref) {
  const sql = await readFile(join(ROOT, "supabase", "schema.sql"), "utf8");
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: "Bearer " + PAT, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    console.error("No pude aplicar el schema (" + res.status + "):", (await res.text()).slice(0, 300));
    console.error("-> Alternativa: pega supabase/schema.sql en el SQL Editor de Supabase y Run.");
    process.exit(1);
  }
  console.log("✓ Schema aplicado (tabla `prospectos` + RLS).");
} else {
  console.log("· Sin SUPABASE_PAT. Aplica supabase/schema.sql a mano en el SQL Editor (o añade el PAT a .env).");
}

// 2) Guardar la anon key en config.json.
cfg.supabase = cfg.supabase || {};
cfg.supabase.url = SB_URL;
cfg.supabase.tabla = cfg.supabase.tabla || "prospectos";
if (ANON) {
  cfg.supabase.anonKey = ANON;
  await writeFile(cfgPath, JSON.stringify(cfg, null, 2) + "\n", "utf8");
  console.log("✓ anon key guardada en config.json → supabase.anonKey.");
} else {
  console.log("· Sin SUPABASE_ANON_KEY. Pega la anon en config.json → supabase.anonKey.");
}

console.log('\nSiguiente:  node tools/supabase-import.mjs "…csv" --replace');
