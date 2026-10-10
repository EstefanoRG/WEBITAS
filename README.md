# WEBITAS — Generador de demos + seguimiento

Genera, a partir de plantillas por rubro y de un CSV/Google Sheet, una **página de muestra por negocio** y la publica en **GitHub Pages**. Incluye tablero de prospectos local y contador de visitas por demo.

## Estructura

```
templates/           4 plantillas: veterinaria · dental · taller · interiores
generator/
  build.mjs          CSV/Sheet -> docs/demos/<slug>/
  config.json        vendedores (Estefano/Luigui), rubros, URL base
data/empresas.csv    maestro de negocios + seguimiento
tools/
  tokenize.mjs       (una vez) pone los tokens {{...}} en las plantillas
  panel.mjs          tablero local con los 2 botones de vendedor
docs/                salida que sirve GitHub Pages (generada)
```

## Uso rápido

```bash
node generator/build.mjs     # genera docs/ desde data/empresas.csv
node tools/panel.mjs         # abre el tablero en http://localhost:5173
```

En el navegador: `docs/index.html` (portafolio) y `docs/demos/<slug>/` (cada demo).

## El CSV (seguimiento)

Una fila por negocio. Columnas:

`slug, negocio, rubro, ciudad, zona, direccion, email, horarios, instagram, instagram_url, facebook, web_actual, rating, resenas, prioridad, estado, vendedor, generar, publicar, proximo_contacto, ultimo_contacto, notas`

- **generar** = `x` para que se cree el demo (destildar → desaparece al regenerar).
- **vendedor** = `estefano` o `luigui` (uno solo por negocio). Todos los WhatsApp del demo (contacto y “Activar mi página”) usan el número de ese vendedor.
- **publicar** = `x` para publicar; vacío/`no` = borrador.
- **estado** = Nuevo → Contactado → Interesado → Vendido / Descartado.

## Vendedores

Definidos en `generator/config.json`:
- **Estefano** → +51 935 634 896 (`51935634896`)
- **Luigui** → +51 981 202 879 (`51981202879`)

En el **tablero** cada negocio tiene 2 botones; el activo queda fijo y el otro deshabilitado.

## Publicar en GitHub Pages

Repo: **`EstefanoRG/WEBITAS`**.

1. En *Settings → Pages*, elige **Source: GitHub Actions**.
2. Cada push a `main` (o el botón **Run workflow**) genera y publica.
3. URL: `https://estefanorg.github.io/WEBITAS/`

## Google Sheets (opcional)

1. Publica la hoja: *Archivo → Compartir → Publicar en la web → CSV*.
2. Copia la URL y guárdala como **secreto** `SHEET_CSV_URL` en el repo
   (*Settings → Secrets and variables → Actions*).
3. Si el secreto existe, el robot usa el Sheet; si no, usa `data/empresas.csv`.
4. En el tablero local usa *Generar / Publicar* para refrescar.

## Añadir un rubro nuevo

1. Crea `templates/<rubro>/` (index.html, style.css, script.js) con tokens `{{...}}`.
2. Agrégalo a `generator/config.json` en `rubros`.
