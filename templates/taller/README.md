# Rediseño — TK Motors (página de muestra)

Rediseño de **tkmotors.com.pe** conservando su **estructura real** y mejorando/arreglando lo que estaba mal. Pensado para presentárselo al dueño.

## Estructura (la misma de la web original)
1. **Barra promo** superior ("Consulta nuestros paquetes y promociones").
2. **Header**: logo + menú (Inicio, Nosotros, Tienda, Servicios, Contacto) + teléfono + botón Cotizar.
3. **Hero** con el lema "¡La mejor opción!" y botón **Ubícanos**, con **sus 2 videos reales en slider** dentro del marco (comprimidos), con **botones de play/pausa y sonido**.
4. **Marcas**: fila de autos (Toyota, Hyundai, BMW, Jeep, Audi, Honda, Peugeot, Bridgestone, Bosch) y fila de repuestos/lubricantes (Mopar, Valeo, Castrol, Denso, Mobil, Liqui Moly, Valvoline, STP, Würth, Sonax, Blue Chem…). Son **imágenes reales** de su web (carpeta `img/`), en banda azul de marca, y **se desplazan solas (marquesina infinita)**; se pausan al pasar el mouse.
5. **Nosotros**: "Acerca de nosotros" con el texto real de su página `/about/` (taller multimarca, afiliado a Bosch Car Service) y los datos: +10 años, +20 equipos, 100% profesionales, garantía.
6. **Nuestros productos**: los 4 aceites con sus precios (Mopar ATF +4, CVT +4, 5W20 Motorcraft, 5W30 Mopar) + "Ver catálogo".
7. **Servicios**: Mantenimiento de vehículos, Venta de piezas automotrices, Grúa TK Motors, Servicio de pintado de vehículos, Modificaciones Off Road, Alineamiento computarizado 3D.
8. **Contacto**: "¿Tienes dudas? Contáctanos" con formulario (Nombres, Correo, Cuéntanos tu caso) + datos reales + mapa.
9. **Footer**: columnas Servicios / Ubicación / Contacto.

## Qué se corrigió / mejoró
| Problema en la web original | Cómo queda |
|---|---|
| Hero con video de ~105 MB y carga ~8 s | **Sus videos se conservan** pero comprimidos: 103,5 MB → **~1,1 MB** y 12,8 MB → **~1,2 MB** (720p **con audio**), con **póster**, **botones de play/pausa y sonido**, y reproducción solo si el usuario no pidió menos movimiento. |
| Menú casi invisible | Header claro con menú siempre legible + menú móvil. |
| Servicios con **texto "lorem ipsum"** | Descripciones reales para los 6 servicios. |
| Producto "Read more" (agotado) confuso | Botón "Cotizar" claro en los 4 productos. |
| 43 de 45 imágenes sin `alt` | Todas con `alt`. |
| Sin `meta description` / `og` / H1 | Título con giro + zona, descripción, OG y 1 `h1`. |
| Sin datos de contacto claros ni botón llamar | WhatsApp (2 números), teléfono fijo, correo y mapa visibles; enlaces `tel:` y `wa.me`. |
| Sin Schema | JSON-LD `AutoRepair` con dirección, teléfono y correo reales. |
| Tema de otro rubro (carpeta `dentalup`) | Diseño propio de taller (tema **claro** + azul de marca). |

## Paleta de colores (extraída de tkmotors.com.pe — tema claro, sin negro)
- Azul de marca (principal): **`#0062ff`** · Azul oscuro (hover): **`#0040dd`**
- Verde secundario: **`#8bba34`**
- Texto: **`#444444`** · Títulos: **`#030303`** · Líneas: **`#ebebeb`**
- Fondos: **`#ffffff`** · Gris barra: **`#f3f3f3`** · Gris secciones: **`#eeeeee`**
- Banda de marcas: azul de marca **`#0062ff`** (los logos son blancos, como en su web).

## Datos reales usados
- WhatsApp: **+51 960 376 484** / **+51 960 376 671**
- Teléfono fijo: **01 359 6277**
- Correo: **tkmotorsst@gmail.com**
- Dirección: **Autopista Ramiro Prialé km 4.5, Lurigancho, Lima – Perú**

## Antes de publicar
- Reemplazar las **fotos** (Unsplash de muestra) por fotos reales del taller.
- Revisar/actualizar **precios**.
- Quitar `<meta name="robots" content="noindex, nofollow">` al publicar definitivo.
- Quitar el bloque "¿Es tu negocio? / Activar esta página" del footer cuando se active.
- El botón "Activar" apunta al WhatsApp del vendedor (**51941571821**); cámbialo si aplica.

## Archivos
- `index.html` — estructura y contenido.
- `style.css` — diseño, tema claro (+ toggle oscuro), responsive.
- `script.js` — menú, tema, formulario → WhatsApp, marquesina de marcas, revelado al scroll.
- `img/` — logos reales de las marcas + pósters de los videos (descargados de su web). Reemplazar solo si cambian.
- `video/` — los 2 videos del hero comprimidos y optimizados (`hero-1.mp4`, `hero-2.mp4`).

## Publicar
Sube la carpeta a **Cloudflare Pages / GitHub Pages / Vercel** (gratis, con SSL). Dominio propio: `.pe` o `.com.pe`.
