# Plantillas (`templates/`)

Una carpeta por **rubro**. Cada una es un sitio de una página (`index.html`, `style.css`, `script.js`)
con **tokens `{{...}}`**. El generador (`generator/build.mjs`) rellena los tokens con los datos de cada
negocio del CSV/Sheet y produce la demo. **El diseño no se toca; solo se reemplaza texto.**

## Contrato de tokens

El generador expone estos tokens (ver `tokensFor()` en `generator/build.mjs`):

| Token | Origen | Para qué |
|---|---|---|
| `{{negocio}}` | CSV `negocio` | Nombre del negocio (títulos, logo, footer, textos de WhatsApp) |
| `{{negocio_url}}` | derivado de `negocio` | Nombre en URL-encoded (textos de WhatsApp) |
| `{{negocio_mark}}` | derivado de `negocio` | Iniciales para el logo (ej. `CD`) |
| `{{ciudad}}` | CSV `ciudad` | Ciudad (SEO, textos) |
| `{{zona}}` | CSV `zona` o `ciudad` | Distrito/zona |
| `{{direccion}}` | CSV `direccion` | Dirección (NAP, footer, JSON-LD) |
| `{{direccion_url}}` | derivado de `direccion` | Dirección en URL-encoded (mapas) |
| `{{horarios}}` | CSV `horarios` | Horario |
| `{{email}}` | CSV `email` | Correo |
| `{{instagram_user}}` / `{{instagram_url}}` | CSV | Redes |
| `{{facebook_url}}` | CSV | Redes |
| `{{maps_url}}` | CSV `maps_url` (o búsqueda por nombre + dirección) | “Ver reseñas” / “Cómo llegar” |
| `{{rating}}` | CSV `rating` | Nota real de Google (ej. `4.7`) |
| `{{resenas}}` / `{{resenas_txt}}` | CSV `resenas` | Número de reseñas y texto (“58 reseñas”) |
| `{{categoria}}` | CSV `categoria` | Rubro visible en la demo |
| `{{redes}}` | derivado | `1` si hay Instagram o Facebook; para condicionales |
| **`{{telefono}}`** | CSV `telefono` **(negocio)** | Teléfono a mostrar (NAP, footer) |
| **`{{telefono_tel}}`** | CSV `telefono` **(negocio)** | Teléfono con `+` para `href="tel:"` y JSON-LD |
| **`{{whatsapp}}`** | CSV `telefono` **(negocio)** | Solo dígitos, para `wa.me` (botones del negocio) |
| **`{{vendedor_nombre}}`** | `config.json` | Nombre del vendedor (CTA "Activar") |
| **`{{vendedor_whatsapp}}`** | `config.json` | WhatsApp del vendedor (**solo** en el CTA "Activar") |
| `{{year}}` | año actual | Footer legal |

### Condicionales
`fill()` en `generator/build.mjs` también entiende bloques condicionales:
- `{{#rating}}…{{/rating}}` se muestra solo si el token tiene valor.
- `{{^rating}}…{{/rating}}` se muestra solo si está vacío.

Sirven para no publicar “0 reseñas”, redes sin enlace o un rating inventado. No anidar condicionales
(el reemplazo es de una sola pasada). Si un bloque necesita dos condiciones, se resuelve con un token
derivado (como `{{redes}}`) o en el generador.

### Regla de oro
- **El teléfono/WhatsApp del negocio** (`{{telefono}}`, `{{telefono_tel}}`, `{{whatsapp}}`) va en todo el
  sitio: hero, footer, botón flotante, formulario y JSON-LD.
- **El del vendedor** (`{{vendedor_whatsapp}}`) aparece **únicamente** en los CTA de venta
  ("¿Es su negocio?" → "Activar mi página"). Nunca como teléfono del negocio.

## Datos que NO son tokens (contenido de relleno)
- **Testimonios y estadísticas** de las plantillas son de ejemplo. Al vender, reemplázalos por datos
  reales del negocio o **elimínalos**; no publiques testimonios ni cifras inventadas como si fueran reales.
  La plantilla de veterinaria ya usa el rating/reseñas reales y una sección de confianza en lugar de
  testimonios inventados.
- Las imágenes son de stock (Unsplash/Pexels). Reemplázalas por fotos reales antes de publicar.
- Las demos van con `noindex` y `canonical` vacío a propósito.

## Cómo añadir un rubro nuevo (camino rápido)

1. **Crea la carpeta** copiando una plantilla existente (hereda el diseño y los tokens):
   ```bash
   node tools/new-rubro.mjs barberia --desde veterinaria --etiqueta "Barbería" --emoji "💈"
   ```
   Esto copia `templates/veterinaria` → `templates/barberia` y registra el rubro en `generator/config.json`.
2. **Ajusta** `templates/barberia/index.html` (textos, servicios, secciones) y `style.css` (tokens de diseño).
   Mantén los `{{...}}` del contrato; no hardcodees datos del negocio.
3. **Prueba** con el CSV de muestra:
   ```bash
   node generator/build.mjs
   ```
   Y añade una fila con `rubro = barberia` en el Sheet/CSV para verla en el panel.
4. **Publica** con el flujo normal (push o *Run workflow*).

> Consejo: mientras más reutilices una plantilla, más barata sale la siguiente venta del mismo giro.
> Especialízate en 1–2 rubros antes de abrir muchos.
