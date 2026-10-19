# WEBITAS — Generador de demos + seguimiento

Genera, a partir de plantillas por rubro y de tus prospectos (Supabase, Google Sheet o CSV), una **página de muestra por negocio**, un **panel compartido** (con código secreto y métricas) y las publica en **GitHub Pages**.

> Guía completa de columnas y setup: **[SETUP.md](./SETUP.md)**

## Estructura

```
templates/            una carpeta por rubro (tokens {{...}}) · ver templates/README.md
generator/
  build.mjs           Supabase/Sheet/CSV -> docs/demo/<slug>/ + panel + portada neutra
  config.json         vendedores (Estefano/Luigui), rubros, código del panel, Supabase
data/empresas.csv     muestra versionada (25 columnas) — fallback sin datos reales
tools/
  panel.mjs           tablero local (lee/escribe en Supabase o CSV)
  supabase-import.mjs importa un CSV a Supabase
  supabase-setup.mjs  aplica el esquema y guarda la clave anon
  new-rubro.mjs       crea un rubro nuevo copiando una plantilla
supabase/             schema.sql + guía paso a paso (README.md)
docs/                 salida que sirve GitHub Pages
  index.html          portada neutra (no revela nada)
  <codigo>/index.html PANEL compartido (solo con el código)
  demo/<slug>/        cada demo
```

**Fuente de datos**: **Supabase** (lee con la clave anon; en local escribe con la service_role) →
`DATA_CSV` → `prospectos_consolidado.csv` (local, no versionado) → `data/empresas.csv` (muestra).
Puesta en marcha: **[supabase/README.md](./supabase/README.md)**. Detalle: **[GUIA-DATOS.md](./GUIA-DATOS.md)**.

## Uso rápido

```bash
node generator/build.mjs                          # genera docs/ (Supabase, consolidado o Sheet)
node tools/panel.mjs                              # tablero local en http://localhost:5173
node tools/supabase-import.mjs "csv" --replace    # sube prospectos a Supabase
node tools/new-rubro.mjs                          # crea un rubro nuevo (lista los existentes)
```

## Reglas del generador
- **Dedupe** por teléfono (une filas del mismo negocio).
- **Prioridad automática** (sin web +3 · reseñas y rating suman) y orden por prioridad.
- **`generar`**: vacío = crea demo · `no` = no crea.
- **Teléfonos**: el del **negocio** (`telefono`) va en todo el sitio (NAP, `tel:`, WhatsApp, JSON-LD); el del **vendedor** aparece **solo** en el botón "Activar mi página".
- **Vendedor por negocio**: `estefano` o `luigui` eligen a quién le llega cuando el dueño pulsa "Activar".

## Publicar
1. Repo **`EstefanoRG/WEBITAS`** → público.
2. *Settings → Pages → Source* = **GitHub Actions**.
3. Push (o *Run workflow*) publica.

- Panel: `https://estefanorg.github.io/WEBITAS/<codigo>/`
- Gestor (editar): `https://estefanorg.github.io/WEBITAS/<codigo>/editar/`
- Demos: `https://estefanorg.github.io/WEBITAS/demo/<slug>/`

> El usuario de GitHub es **`EstefanoRG`**; la URL de Pages lo sirve en minúsculas
> (`estefanorg.github.io`). Es normal (el dominio no distingue mayúsculas).
