// Tokeniza (una sola vez) los 4 diseños que están en /templates, cambiando los
// datos de la marca de muestra por tokens {{...}}. El build luego rellena los
// tokens con los datos de cada empresa.
//
// Uso:  node tools/tokenize.mjs
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILES = ["index.html", "style.css", "script.js"];

const MAPS = {
  veterinaria: [
    ["VILLA%20MASCOTA", "{{negocio_url}}"],
    ["VILLA MASCOTA", "{{negocio}}"],
    ["%5BNOMBRE%20DE%20LA%20CL%C3%8DNICA%5D", "{{negocio_url}}"],
    ["[NOMBRE DE LA CLÍNICA]", "{{negocio}}"],
    ["[DIRECCIÓN]", "{{direccion}}"],
    ["[HORARIOS]", "{{horarios}}"],
    ["[TELÉFONO]", "{{telefono_tel}}"],
    ["51904691771", "{{whatsapp}}"],
    ["51941571821", "{{whatsapp}}"],
    ["+51 904 691 771", "{{telefono}}"],
    ["con Estefano", "con {{vendedor_nombre}}"],
  ],
  dental: [
    ["Cl%C3%ADnica%20Dental%20Aurea", "{{negocio_url}}"],
    ["Clínica Dental Aurea", "{{negocio}}"],
    ["Dental Aurea", "{{negocio}}"],
    ["51904691771", "{{whatsapp}}"],
    ["51941571821", "{{whatsapp}}"],
    ["+51 904 691 771", "{{telefono}}"],
    ["Av. Benavides 1234, Miraflores – Lima", "{{direccion}}"],
    ["hola@dentalaurea.pe", "{{email}}"],
    ["Lun a Vie 9:00–19:00 · Sáb 9:00–14:00", "{{horarios}}"],
    ["Odontología integral en Lima", "Odontología integral en {{ciudad}}"],
    ["con Estefano", "con {{vendedor_nombre}}"],
  ],
  interiores: [
    ["AZ%20Design%20Interior", "{{negocio_url}}"],
    ['<span class="logo__mark" aria-hidden="true">AZ</span>', '<span class="logo__mark" aria-hidden="true">{{negocio_mark}}</span>'],
    ['<span class="logo__text">AZ <span class="logo__text-thin">Design Interior</span></span>', '<span class="logo__text">{{negocio}}</span>'],
    ["AZ Design Interior", "{{negocio}}"],
    ["Estudio AZ · Lima", "{{negocio}} · {{ciudad}}"],
    ["51924642710", "{{whatsapp}}"],
    ["51941571821", "{{whatsapp}}"],
    ["+51 924 642 710", "{{telefono}}"],
    ["az.designinterior1@gmail.com", "{{email}}"],
    ["San Martín de Porres, Lima — Perú", "{{direccion}}"],
    ['"addressLocality": "San Martín de Porres"', '"addressLocality": "{{ciudad}}"'],
    ['"areaServed": "Lima, Perú"', '"areaServed": "{{ciudad}}, Perú"'],
    ["Estudio de diseño de interiores · Lima", "Estudio de diseño de interiores · {{ciudad}}"],
    ["Lima y Callao", "{{ciudad}} y Callao"],
    ["en Lima", "en {{ciudad}}"],
    ["@az_design_interior", "{{instagram_user}}"],
    ["https://www.instagram.com/az_design_interior/", "{{instagram_url}}"],
    ["https://facebook.com/103150718908039", "{{facebook_url}}"],
    ["con Estefano", "con {{vendedor_nombre}}"],
  ],
  taller: [
    ["TK%20Motors", "{{negocio_url}}"],
    ['<span class="brand__mark">TK</span>', '<span class="brand__mark">{{negocio_mark}}</span>'],
    ['<span class="brand__name">TK<b>MOTORS</b></span>', '<span class="brand__name">{{negocio}}</span>'],
    ["TK MOTORS S.A.C.", "{{negocio}}"],
    ["TK Motors", "{{negocio}}"],
    ["51960376484", "{{whatsapp}}"],
    ["51960376671", "{{whatsapp}}"],
    ["51941571821", "{{whatsapp}}"],
    ["+51 960 376 484", "{{telefono}}"],
    ["+51 960 376 671", "{{telefono}}"],
    ["960 376 484", "{{telefono}}"],
    ["+51960376484", "{{whatsapp}}"],
    ["https://www.google.com/maps/dir//TK+Motors+%26+Tukanes+CAR+WASH,+Au.+Ramiro+Prial%C3%A9+14,+Lurigancho-Chosica+15457/@-12.0583784,-77.0296656,13z", "https://www.google.com/maps?q={{direccion_url}}"],
    ["https://www.google.com/maps?q=TK%20Motors%20Tukanes%20CAR%20WASH%20Ramiro%20Prial%C3%A9%20Lurigancho&output=embed", "https://www.google.com/maps?q={{direccion_url}}&output=embed"],
    ["Autopista Ramiro Prialé km 4.5, Lurigancho, Lima – Perú", "{{direccion}}"],
    ["Autopista Ramiro Prialé km 4.5", "{{zona}}"],
    ["Autopista Ramiro Prialé", "{{zona}}"],
    ["Lurigancho-Chosica", "{{ciudad}}"],
    ["Lurigancho", "{{ciudad}}"],
    ["01 359 6277", "{{telefono}}"],
    ["tel:+5113596277", "tel:{{telefono_tel}}"],
    ["tkmotorsst@gmail.com", "{{email}}"],
    ["Activar esta página →", "Activar con {{vendedor_nombre}} →"],
    ["con Estefano", "con {{vendedor_nombre}}"],
  ],
};

function apply(text, pairs) {
  let out = text;
  for (const [from, to] of pairs) {
    if (!from) continue;
    out = out.split(from).join(to);
  }
  return out;
}

let touched = 0;
for (const [rubro, pairs] of Object.entries(MAPS)) {
  for (const file of FILES) {
    const p = join(ROOT, "templates", rubro, file);
    let txt;
    try {
      txt = await readFile(p, "utf8");
    } catch {
      continue;
    }
    const next = apply(txt, pairs);
    if (next !== txt) {
      await writeFile(p, next, "utf8");
      touched++;
      console.log("tokenizado:", `templates/${rubro}/${file}`);
    }
  }
}
console.log(`\nListo. Archivos modificados: ${touched}`);
