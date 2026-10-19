// Crea un rubro nuevo rápido: copia una plantilla existente (ya tokenizada) a
// templates/<clave> y registra el rubro en generator/config.json.
//
// Uso:
//   node tools/new-rubro.mjs <clave> [--desde <plantilla>] [--etiqueta "Texto"] [--emoji "🏷️"]
//   node tools/new-rubro.mjs --list
//
// Ejemplos:
//   node tools/new-rubro.mjs barberia --desde veterinaria --etiqueta "Barbería" --emoji "💈"
//   node tools/new-rubro.mjs restaurante --desde interiores --etiqueta "Restaurante" --emoji "🍽️"
//
// Después: edita templates/<clave>/index.html y style.css, y prueba con
//   node generator/build.mjs
import { readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATES = join(ROOT, "templates");
const CONFIG = join(ROOT, "generator", "config.json");

const argv = process.argv.slice(2);
const flag = (name, def = undefined) => {
  const i = argv.indexOf("--" + name);
  return i >= 0 ? argv[i + 1] : def;
};
const config = JSON.parse(await readFile(CONFIG, "utf8"));

if (argv.includes("--list") || argv.length === 0) {
  console.log("Rubros registrados:");
  for (const [k, v] of Object.entries(config.rubros)) {
    console.log(`  ${v.emoji || "•"}  ${k.padEnd(14)} -> plantilla "${v.plantilla}" (${v.etiqueta})`);
  }
  console.log("\nUso: node tools/new-rubro.mjs <clave> [--desde <plantilla>] [--etiqueta \"Texto\"] [--emoji \"🏷️\"]");
  process.exit(0);
}

const clave = String(argv[0] || "").toLowerCase().trim();
if (!/^[a-z][a-z0-9-]*$/.test(clave)) {
  console.error(`Clave inválida: "${clave}". Usa minúsculas, sin espacios (ej. "barberia").`);
  process.exit(1);
}
if (config.rubros[clave]) {
  console.error(`El rubro "${clave}" ya existe en config.json.`);
  process.exit(1);
}

const desde = flag("desde", "veterinaria");
if (!existsSync(join(TEMPLATES, desde))) {
  console.error(`La plantilla de origen "${desde}" no existe en templates/.`);
  process.exit(1);
}
const destino = join(TEMPLATES, clave);
if (existsSync(destino)) {
  console.error(`La carpeta templates/${clave} ya existe. Bórrala o usa otra clave.`);
  process.exit(1);
}

await mkdir(destino, { recursive: true });
await cp(join(TEMPLATES, desde), destino, { recursive: true });
// Quita el AGENTS.md de origen para no confundir (usa el "desde" como referencia).
await rm(join(destino, "AGENTS.md"), { force: true }).catch(() => {});

const etiqueta = flag("etiqueta", clave.charAt(0).toUpperCase() + clave.slice(1));
const emoji = flag("emoji", "🏷️");
config.rubros[clave] = { plantilla: clave, etiqueta, emoji };
await writeFile(CONFIG, JSON.stringify(config, null, 2) + "\n", "utf8");

console.log(`✓ Rubro "${clave}" creado a partir de "${desde}".`);
console.log(`  - templates/${clave}/  (edita index.html y style.css)`);
console.log(`  - config.json -> rubros.${clave} = { etiqueta: "${etiqueta}", emoji: "${emoji}" }`);
console.log(`\nSiguiente: edita los textos/servicios y prueba con  node generator/build.mjs`);
