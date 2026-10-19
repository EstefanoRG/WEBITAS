# WEBITAS — Guía de uso y setup

## 1) Las columnas del CSV / Google Sheet

Una fila por negocio, **una sola pestaña**. Orden exacto (**25 columnas**):

| # | Columna | ¿Obligatorio? | Para qué sirve |
|---|---|---|---|
| 1 | `negocio` | Sí | Nombre. De aquí sale el enlace: `/demo/<nombre>/` |
| 2 | `rubro` | Sí | `veterinaria` · `dental` · `taller` · `interiores` (elige la plantilla) |
| 3 | `categoria` | No | Categoría de Google (texto libre, para el panel) |
| 4 | `direccion` | No | Dirección completa |
| 5 | `zona` | No | Distrito/zona |
| 6 | `ciudad` | No | Ciudad |
| 7 | `maps_url` | No | Enlace a su ficha de Google Maps (el panel lo muestra como "Maps") |
| 8 | `telefono` | **Sí** | Teléfono del negocio: NAP, WhatsApp de la demo y **dedupe** |
| 9 | `email` | No | Correo |
| 10 | `horarios` | No | Horario |
| 11 | `instagram` | No | Usuario |
| 12 | `instagram_url` | No | URL |
| 13 | `facebook` | No | URL |
| 14 | `web_actual` | No | Web actual (si hay → "con web") |
| 15 | `rating` | No | Ej. `4.7` |
| 16 | `resenas` | No | Nº de reseñas |
| 17 | `tiene_web` | No | `si`/`no` (si no llenas `web_actual`) |
| 18 | `estado` | No | `Nuevo` · `Contactado` · `Interesado` · `Vendido` · `Descartado` |
| 19 | `vendedor` | No | `estefano` o `luigui` |
| 20 | `prioridad_manual` | No | Si lo pones, manda sobre la prioridad automática |
| 21 | `proximo_contacto` | No | Fecha del próximo contacto |
| 22 | `ultimo_contacto` | No | Fecha del último contacto |
| 23 | `canal` | No | `WhatsApp` · `Llamada` · `Visita` |
| 24 | `generar` | No | **Vacío = crea demo** · `no` = no crea |
| 25 | `notas` | No | Notas internas (el panel las muestra) |

> Se quitaron `contacto`, `tiktok` y `publicar`: el sistema no las usaba. Si tu hoja las tiene, no pasa nada (se ignoran).

**Importante:** en las **demos solo se reemplaza el TEXTO**. Entran por token los datos del negocio
(nombre, dirección, **teléfono**, horario, correo, redes…); el **diseño no se toca**. El teléfono y el
WhatsApp que se ven en la demo son **del negocio**; el número del **vendedor** aparece **solo** en el
botón "Activar mi página".

**Reglas automáticas**
- **Dedupe** por `telefono`: filas con el mismo número se unen (se conserva lo ya trabajado).
- **Prioridad** (orden automático, salvo `prioridad_manual`): sin web +3 · reseñas ≥50 +3 / ≥20 +2 / ≥10 +1 · rating ≥4.5 +2 / ≥4.0 +1.
- **Enlace** generado de `negocio` (ej. `Clínica Dental Sonrisa` → `clinica-dental-sonrisa`).

## 2) Fuente de datos (Supabase · CSV local)

El generador y el panel leen, en orden: **Supabase** → `DATA_CSV` → `prospectos_consolidado.csv`
(local, no versionado) → `data/empresas.csv` (muestra).
Puesta en marcha de Supabase: guía paso a paso en **`supabase/README.md`**. Detalle: **`GUIA-DATOS.md`**.

### Supabase (principal)

La base de datos del sistema. El **panel** lee en vivo y edita al instante. Ver `supabase/README.md`.

### CSV local (desarrollo / respaldo)

Guarda tus prospectos reales en `prospectos_consolidado.csv` (mismas 25 columnas). Está en `.gitignore`
(contiene datos personales) y el build lo detecta solo. Para forzar otro archivo: `DATA_CSV=ruta.csv`.

## 3) Publicar en GitHub Pages

1. Repo **`EstefanoRG/WEBITAS`** → público.
2. *Settings → Pages → Source* = **GitHub Actions**.
3. Cada push (o *Run workflow*) regenera y publica.

URLs:
- Panel (solo con el código): `…/WEBITAS/x7q2k9p4/`
- Cada demo: `…/WEBITAS/demo/<nombre>/`

> Repo = **`EstefanoRG/WEBITAS`**; la URL de Pages lo sirve en minúsculas (`estefanorg.github.io`). Es normal.

## 4) El panel

- **Métricas** arriba: prospectos · sin web · con demo · contactados · interesados · vendidos · descartados · tasa respuesta · tasa cierre (se calculan en vivo).
- Lista ordenada por prioridad, con estado, vendedor, canal y próximo contacto.
- **abrir demo →**: abre la página del negocio.
- **Escribir por WhatsApp**: abre el WhatsApp del negocio con un mensaje listo (rota entre 6, sin emojis, natural) que usa su **nombre** si lo tienes y el enlace de su demo.
- **👀 visitas**: solo si defines un `counter` propio en `config.json` (viene desactivado; ver `GUIA-DATOS.md`).

## 5) Comandos

```bash
node generator/build.mjs     # genera docs/ (consolidado local, DATA_CSV o el Sheet)
node tools/panel.mjs         # tablero local (opcional) en http://localhost:5173
node tools/new-rubro.mjs     # crea un rubro nuevo copiando una plantilla
```
