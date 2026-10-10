# WEBITAS — Guía de uso y setup

## 1) Las columnas del CSV / Google Sheet

Una fila por negocio, **una sola pestaña**. Orden exacto (28 columnas):

| # | Columna | ¿Obligatorio? | Para qué sirve |
|---|---|---|---|
| 1 | `negocio` | Sí | Nombre. De aquí sale el enlace: `/demo/<nombre>/` |
| 2 | `rubro` | Sí | `veterinaria` · `dental` · `taller` · `interiores` (elige la plantilla) |
| 3 | `categoria` | No | Categoría de Google (texto libre, para el panel) |
| 4 | `contacto` | No | Nombre de la persona. **No se usa** en el mensaje (queda para tus notas) |
| 5 | `direccion` | No | Dirección completa |
| 6 | `zona` | No | Distrito/zona |
| 7 | `ciudad` | No | Ciudad |
| 8 | `maps_url` | No | Enlace a su ficha de Google Maps |
| 9 | `telefono` | **Sí** | Número al que se manda el WhatsApp (y **dedupe**) |
| 10 | `email` | No | Correo |
| 11 | `horarios` | No | Horario (lo usan veterinaria/dental); si vacío, no aparece |
| 12 | `instagram` | No | Usuario |
| 13 | `instagram_url` | No | URL |
| 14 | `facebook` | No | URL |
| 15 | `tiktok` | No | URL |
| 16 | `web_actual` | No | Web actual (si hay → “con web”) |
| 17 | `rating` | No | Ej. `4.7` |
| 18 | `resenas` | No | Nº de reseñas |
| 19 | `tiene_web` | No | `si`/`no` (si no llenas `web_actual`) |
| 20 | `estado` | No | `Nuevo` · `Contactado` · `Interesado` · `Vendido` · `Descartado` |
| 21 | `vendedor` | No | `estefano` o `luigui` |
| 22 | `prioridad_manual` | No | Si lo pones, manda sobre la prioridad automática |
| 23 | `proximo_contacto` | No | Fecha del próximo contacto |
| 24 | `ultimo_contacto` | No | Fecha del último contacto |
| 25 | `canal` | No | `WhatsApp` · `Llamada` · `Visita` |
| 26 | `generar` | No | **Vacío = crea demo** · `no` = no crea |
| 27 | `publicar` | No | Vacío = público · `no` = borrador |
| 28 | `notas` | No | Notas internas |

**Importante:** en las **demos solo se reemplaza el TEXTO** (nombre, dirección, teléfono, horario, correo, redes…). El **diseño no se toca**.

**Reglas automáticas**
- **Dedupe** por `telefono`: filas con el mismo número se unen (se conserva lo ya trabajado).
- **Prioridad** (orden automático, salvo `prioridad_manual`): sin web +3 · reseñas ≥50 +3 / ≥20 +2 / ≥10 +1 · rating ≥4.5 +2 / ≥4.0 +1.
- **Enlace** generado de `negocio` (ej. `Clínica Dental Sonrisa` → `clinica-dental-sonrisa`).

## 2) Google Sheet (fuente de datos)

1. Crea una hoja con la fila 1 = las 28 columnas (copia `data/empresas.csv`).
2. Compártela con tu socio.
3. *Archivo → Compartir → Publicar en la web → CSV*. Copia la URL.
4. GitHub → *Settings → Secrets and variables → Actions* → nuevo secreto **`SHEET_CSV_URL`**.
   - Si el secreto existe, el robot usa el Sheet; si no, usa `data/empresas.csv`.

## 3) Publicar en GitHub Pages

1. Repo **`EstefanoRG/WEBITAS`** → público.
2. *Settings → Pages → Source* = **GitHub Actions**.
3. Cada push (o *Run workflow*) regenera y publica.

URLs:
- Panel (solo con el código): `…/WEBITAS/x7q2k9p4/`
- Cada demo: `…/WEBITAS/demo/<nombre>/`

## 4) El panel

- Lista ordenada por prioridad, con estado, vendedor, contador de visitas, canal y próximo contacto.
- **abrir demo →**: abre la página del negocio.
- **Escribir por WhatsApp**: abre el WhatsApp del negocio con un mensaje listo (rota entre 8, sin emojis, natural) que usa su **nombre** si lo tienes y el enlace de su demo.

## 5) Comandos

```bash
node generator/build.mjs    # genera docs/ desde data/empresas.csv (o el Sheet)
node tools/panel.mjs        # tablero local (opcional) en http://localhost:5173
```
