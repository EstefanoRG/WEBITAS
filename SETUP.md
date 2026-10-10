# WEBITAS — Guía de uso y setup

## 1) Las columnas del CSV / Google Sheet

Una fila por negocio, **una sola pestaña**. Orden exacto:

| # | Columna | ¿Obligatorio? | Para qué sirve |
|---|---|---|---|
| 1 | `negocio` | Sí | Nombre del negocio. De aquí sale el enlace: `/demo/<nombre>/` |
| 2 | `rubro` | Sí | `veterinaria` · `dental` · `taller` · `interiores` (elige la plantilla) |
| 3 | `ciudad` | No | Ciudad (ej. `Lima`) |
| 4 | `zona` | No | Distrito/zona (ej. `Miraflores`) |
| 5 | `direccion` | No | Dirección completa |
| 6 | `telefono` | Recomendado | WhatsApp/teléfono. Se usa para **deduplicar** y para el botón **Escribir por WhatsApp** del panel |
| 7 | `email` | No | Correo |
| 8 | `horarios` | No | Horario (lo usan veterinaria/dental) |
| 9 | `instagram` | No | Usuario de Instagram |
| 10 | `instagram_url` | No | URL de Instagram |
| 11 | `facebook` | No | URL de Facebook |
| 12 | `web_actual` | No | Web actual. Si tiene, cuenta como “con web” |
| 13 | `rating` | No | Calificación (ej. `4.7`) |
| 14 | `resenas` | No | Número de reseñas |
| 15 | `tiene_web` | No | `si`/`no` (si no llenas `web_actual`) |
| 16 | `estado` | No | `Nuevo` · `Contactado` · `Interesado` · `Vendido` · `Descartado` |
| 17 | `vendedor` | No | `estefano` o `luigui` |
| 18 | `generar` | No | **Vacío = genera demo** · `no` = no genera |
| 19 | `publicar` | No | Vacío = público · `no` = borrador |
| 20 | `notas` | No | Notas internas |

**Reglas automáticas**
- **Dedupe:** si dos filas tienen el **mismo teléfono**, se unen en una (se conserva lo ya trabajado).
- **Prioridad** (orden automático, de mayor a menor): sin web +3 · reseñas ≥50 +3 / ≥20 +2 / ≥10 +1 · rating ≥4.5 +2 / ≥4.0 +1.
- **Slug/enlace:** se genera del `negocio` (ej. `Clínica Dental Sonrisa` → `clinica-dental-sonrisa`).

## 2) Google Sheet (fuente de datos)

1. Crea una hoja con la fila 1 = las 20 columnas de arriba (copia `data/empresas.csv` para empezar).
2. Compártela con tu socio.
3. *Archivo → Compartir → Publicar en la web → CSV*. Copia la URL.
4. En GitHub: *Settings → Secrets and variables → Actions* → nuevo secreto **`SHEET_CSV_URL`** con esa URL.
   - Si el secreto existe, el robot usa el Sheet. Si no, usa `data/empresas.csv`.

## 3) Publicar en GitHub Pages

1. Repo **`EstefanoRG/WEBITAS`** → *Settings → General → Change visibility → Public*.
2. *Settings → Pages → Source* = **GitHub Actions**.
3. Cada push (o *Run workflow*) regenera y publica.

URLs:
- Panel (privado, solo con el código): `…/WEBITAS/x7q2k9p4/`
- Cada demo: `…/WEBITAS/demo/<nombre>/`

## 4) El panel

- Lista ordenada por prioridad, con estado, vendedor, contador de visitas.
- **abrir demo →**: abre la página del negocio.
- **Escribir por WhatsApp**: abre el WhatsApp del negocio con un mensaje listo (varía solo, sin emojis) que incluye el enlace de su demo.

## 5) Comandos

```bash
node generator/build.mjs    # genera docs/ desde data/empresas.csv (o el Sheet)
node tools/panel.mjs        # tablero local (opcional) en http://localhost:5173
```
