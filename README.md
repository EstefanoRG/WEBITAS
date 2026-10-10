# WEBITAS — Generador de demos + seguimiento

Genera, a partir de plantillas por rubro y de un CSV/Google Sheet, una **página de muestra por negocio**, un **panel compartido** (con código secreto) y las publica en **GitHub Pages**.

> Guía completa de columnas y setup: **[SETUP.md](./SETUP.md)**

## Estructura

```
templates/            4 plantillas: veterinaria · dental · taller · interiores
generator/
  build.mjs           CSV/Sheet -> docs/demo/<slug>/ + panel + portada neutra
  config.json         vendedores (Estefano/Luigui), rubros, código del panel
data/empresas.csv     plantilla del Sheet (una sola pestaña)
tools/
  panel.mjs           tablero local (opcional)
  refresh.gs          (opcional) auto-refresco al editar el Sheet (Apps Script)
docs/                 salida que sirve GitHub Pages
  index.html          portada neutra (no revela nada)
  <codigo>/index.html PANEL compartido (solo con el código)
  demo/<slug>/        cada demo
```

## Uso rápido

```bash
node generator/build.mjs     # genera docs/
node tools/panel.mjs         # tablero local en http://localhost:5173
```

## Reglas del generador
- **Dedupe** por teléfono (une filas del mismo negocio).
- **Prioridad automática** (sin web +3 · reseñas y rating suman) y orden por prioridad.
- **`generar`**: vacío = crea demo · `no` = no crea.
- **Vendedor por negocio**: `estefano` o `luigui` → su número de WhatsApp va en el demo.

## Publicar
1. Repo **`EstefanoRG/WEBITAS`** → público.
2. *Settings → Pages → Source* = **GitHub Actions**.
3. Push (o *Run workflow*) publica.

- Panel: `https://estefanorg.github.io/WEBITAS/<codigo>/`
- Demos: `https://estefanorg.github.io/WEBITAS/demo/<slug>/`
