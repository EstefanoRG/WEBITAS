# Auditoría web — TK Motors (tkmotors.com.pe)

Informe técnico-comercial para justificar el contacto. Datos medidos en vivo (16/10/2026) con navegador headless real (Chromium) + capturas. Sirve como "prueba" para mostrarle al dueño por qué su web le está costando clientes.

- **Web:** https://tkmotors.com.pe/
- **Negocio:** Taller automotriz + venta de piezas + grúa + car wash (según su propio contenido).
- **Zona:** Lima (coordenadas del mapa embebido: ~12.019 S, 76.951 O → San Juan de Lurigancho).
- **Estado HTTP:** 200 (funciona), pero con problemas graves de rendimiento, SEO y diseño.

---

## 1. Resumen ejecutivo (semáforo)

| Área | Estado | Gravedad |
|---|---|---|
| Velocidad / rendimiento | Muy lento (LCP 6,3 s; carga 8,3 s; ~349 MB) | **Crítico** |
| SEO (título, descripción, H1) | Muy deficiente (sin meta description, sin H1, sin og) | **Crítico** |
| Diseño / experiencia | Menú casi invisible y hero en blanco | **Crítico** |
| Seguridad / técnico | Versiones expuestas, xmlrpc, debug en HTML | **Alto** |
| Conversión (WhatsApp/llamar) | Casi nulo (1 link WhatsApp, 0 teléfonos) | **Alto** |
| Contenido / tienda | Tienda vacía (4 productos, uno agotado) | Medio |
| Responsive | Correcto (no se desborda en móvil) | OK |

**Veredicto:** la web "existe", pero **tarda ~8 s en abrir, consume ~350 MB de datos, no aparece bien en Google (sin título correcto, sin descripción, sin H1) y su menú principal es casi invisible**. Para un taller que vive de que la gente lo encuentre y lo contacte, es una web que **espanta clientes**, no que los trae.

---

## 2. Ficha técnica detectada (evidencia)

| Dato | Valor detectado |
|---|---|
| Plataforma | **WordPress** (+ **WooCommerce**), servidor **nginx** |
| Versión WordPress | **7.1.3** (expuesta en `meta generator`) |
| WooCommerce | **8.2.5** (expuesta) |
| Tema | **Enfold 5.1.1** (tema pago) servido desde la carpeta **`themes/dentalup`** |
| Child theme | "TkMotors" |
| jQuery | 3.7.1 + **jquery-migrate** (código legado) |
| Scripts externos | 18 (jQuery, WooCommerce, medias, WPForms, Elfsight WhatsApp, Avia…) |
| Hojas de estilo | 5 (incl. `avia-merged-styles`) |
| Pixeles/analytics | No se detectó Google Analytics / Tag Manager en el HTML |
| XML-RPC | Presente (`/xmlrpc.php`) |
| REST API | Expuesta (`/wp-json/`) |
| Comentario de depuración | Visible en el HTML (versiones de tema/framework) |

> Punto llamativo: el tema activo se sirve desde la carpeta **`dentalup`** (un tema de **clínica dental** adaptado a un taller automotriz). Señal de plantilla reutilizada sin personalización real.

---

## 3. Problemas CRÍTICOS (con datos medidos)

### 3.1 Velocidad catastrófica
Medido en la primera carga:
- **TTFB: 5.563 ms** (lo normal es < 500 ms).
- **DOMContentLoaded: 6.098 ms**.
- **Carga completa (`load`): 8.344 ms** (Google recomienda < 2,5 s).
- **LCP: 6.296 s** (Google pide < 2,5 s → "mal").
- **CLS: 0,139** (Google pide < 0,1 → apenas por encima).

Impacto: **más de la mitad de los visitantes abandona** si una web tarda más de 3 s. Aquí tarda ~8 s.

### 3.2 Videos gigantes: ~349 MB de datos
Causa principal de la lentitud:
- `tk-motors-_modificadoulti.mp4` → **~105 MB por descarga** (se cargó 3 veces = ~316 MB).
- `tk-motors_video.mp4` → ~13 MB (×3).

Son los videos del hero. No están comprimidos ni adaptados a móvil. Un dato móvil promedio en Perú no aguanta esto: **el visitante paga los datos y abandona antes de ver nada**. Además, las peticiones de video fallaron con `ERR_ABORTED` (se cortan) y dispararon el error de consola `play()  request was interrupted`.

### 3.3 El hero aparece en blanco
En la captura (escritorio y móvil) el área principal es un **gran espacio blanco** con flechas de slider. El primer slide es ese video pesado; el poster es una imagen clara ("carro_degradado-portada"), así que la portada se ve **vacía / sin terminar** hasta que carga el video (que se corta). Resultado: la primera impresión es "web rota".

### 3.4 Menú principal casi invisible
En la captura de escritorio, del menú solo se ven **"Servicios"** (celeste) y el botón **"Mi Cuenta"**. Los demás ítems (**Inicio, Nosotros, Tienda, Contacto**) **no se ven**: aparente problema de **texto blanco sobre fondo blanco**. La navegación principal está, en la práctica, inservible.

### 3.5 SEO básico inexistente
- **Sin `<meta name="description">`** → Google muestra cualquier texto; baja el clic.
- **Sin `og:title` ni `og:image`** → al compartir por WhatsApp/Facebook, el enlace se ve feo/vacío.
- **Sin `<h1>`** en la portada (0 etiquetas H1) → pierde la señal principal de SEO.
- **Título mal escrito y sin zona:** "TkMotors – Taller **Automotríz**" (debería ser "Automotriz") y **no dice dónde está** (ni "SJL", ni "Lima", ni el giro "mecánica"). Nadie que busque "taller mecánico en San Juan de Lurigancho" lo encuentra con eso.
- **43 de 45 imágenes sin `alt`** → pierde SEO de imágenes y accesibilidad.

### 3.6 Conversión: casi imposible contactarlos
- **0 enlaces `tel:`** (no hay botón "Llamar").
- **Solo 1 enlace de WhatsApp**, escondido en un widget externo (Elfsight).
- No hay CTA claro de "Cotiza" / "Reserva tu cita" en el hero.
- La barra superior solo dice "CONSULTA NUESTROS PAQUETES COMPLETOS" en **gris muy claro** (bajo contraste) y apunta a /shop.

---

## 4. Problemas MEDIOS

### 4.1 Tienda (WooCommerce) medio vacía y con fricción
- Solo **4 productos** (aceites), todos "por página".
- Un producto figura como **"Read more"** (agotado / sin stock), lo que da impresión de tienda abandonada.
- El menú incluye **"Mi Cuenta"** y **carrito** → para un taller con 4 aceites, es complejidad que no aporta y **distrae** del objetivo real (que te escriban o te llamen).

### 4.2 Contenido y textos descuidados
- **"TALLER AUTOMOTRÍZ"** y **"!LA MEJOR OPCIÓN!"** (debería ser "¡LA MEJOR OPCIÓN!").
- Un **punto "." suelto** junto al logo (residuo de código).
- El name del theme y textos sugieren montaje rápido sin revisión.
- **Sin datos duros** (años, clientes, garantía) ni reseñas visibles en la portada.

### 4.3 Falta de señales de local
- No hay NAP (nombre-dirección-teléfono) como texto en la portada.
- El mapa está embebido, pero **sin horario ni botón de "Cómo llegar"** claros, y **sin Schema LocalBusiness**.
- No se detectó Google Analytics ni Search Console → **no miden nada** (no saben cuántos los visitan ni qué buscan).

---

## 5. Problemas TÉCNICOS / SEGURIDAD

- **Versiones expuestas** en el HTML (`WordPress 7.1.3`, `WooCommerce 8.2.5`, `Enfold 5.1.1`) → facilita ataques dirigidos.
- **`/xmlrpc.php` activo** → vector clásico de fuerza bruta / amplificación (conviene bloquearlo si no se usa).
- **`/wp-json/` expuesto** (normal, pero mal configurado filtra información).
- **Comentario de "Debugging Info"** con versiones de tema/framework **visible en el HTML** → filtra información del stack.
- **18 scripts** + **jQuery-migrate** y "CSS/JS merged" del tema → mucho peso y deuda técnica.
- **Sin Google Analytics / GTM** detectado.
- Clase **`rtl_columns`** en un sitio en español (configuración heredada del tema).
- **"Updates: disabled"** en el debug del theme → **no se actualiza** = riesgo de seguridad creciente.

---

## 6. Impacto en el negocio (traducido a clientes y soles)

1. **~8 s de carga y ~350 MB** → la mayoría cierra antes de ver nada. Cada consulta perdida es un cliente que se va a otro taller.
2. **Sin título/descripción/H1 con la zona** → **no aparece en Google** cuando buscan "taller mecánico en SJL/Lima". Depende 100% de quien ya los conoce.
3. **Menú invisible y hero en blanco** → el visitante que llega piensa que la web está **malograda** y desconfía del negocio.
4. **Sin botón de llamar ni WhatsApp claro** → aunque quieran, **no los contactan**.
5. **Sin analítica** → no saben cuánta gente entra ni de dónde; deciden a ciegas.

**Frase para el dueño:** *"Su web está trabajando en su contra: cuando alguien la abre desde el celular, tarda 8 segundos y gasta 350 MB; cuando por fin carga, el menú no se ve y la portada queda en blanco. Y en Google no aparece cuando buscan taller en su zona."*

---

## 7. Cómo usar esto para escribirles (ganchos reales)

Usa **1–2 datos concretos**, no todos, para no abrumar:

- "Revisé su web y **tarda 8 segundos en abrir y consume 350 MB** — desde el celular casi nadie la espera."
- "Su portada aparece **en blanco** y **el menú (Inicio, Nosotros, Tienda, Contacto) no se ve**."
- "En Google no aparece con 'taller en San Juan de Lurigancho' porque el título dice solo **'Taller Automotríz'** y no tiene descripción ni encabezado."
- "No hay un **botón de WhatsApp ni de llamar** a la vista; solo un widget escondido."
- "Además usa un tema de **clínica dental** (`dentalup`) adaptado al taller, por eso se ve desordenado."

### Guion de WhatsApp sugerido

```
Hola, buen día. Soy [tu nombre], hago páginas web para talleres y negocios locales.

Entré a tkmotors.com.pe desde el celular y encontré varios problemas que le pueden
estar costando clientes:
- Tarda ~8 segundos en abrir y gasta ~350 MB (el video de portada pesa 105 MB).
- La portada aparece en blanco y el menú (Inicio, Nosotros, Tienda, Contacto) casi no se ve.
- En Google no sale bien porque el título dice "Taller Automotríz" y no tiene descripción ni encabezado.
- No hay un botón de WhatsApp ni de llamar a la vista.

Le hice una muestra de cómo se vería una web rápida y clara de TK Motors, con sus
servicios, galería, WhatsApp y "Cómo llegar": [LINK]

¿Se la muestro? Si le gusta, la activo con sus fotos y precios reales y su dominio propio.
```

---

## 8. Propuesta sugerida (qué ofrecerle)

**Paquete Profesional** (s/) — reemplazo de la portada y estructura, manteniendo su dominio:
- Web rápida (menos de 2 s), sin videos de 100 MB (imagen optimizada o video ligero).
- Menú visible + portada con mensaje claro y CTA de WhatsApp/llamar.
- Secciones: Inicio, Servicios (mantenimiento, frenos, grúa, car wash…), Tienda (si la quiere), Galería, Nosotros, Contacto.
- SEO local: título "Taller mecánico en [zona] | TK Motors", meta descripción, H1, Schema LocalBusiness, `alt` en imágenes.
- Google Business Profile optimizado + Google Analytics.
- Botón de WhatsApp y "Llamar" siempre visibles.
- **Precio sugerido:** S/1.500 – S/2.800 (según alcance). Mantenimiento opcional S/150–300/mes.

**Alternativa de bajo riesgo:** empezar por una **optimización urgente** (comprimir/quitar los videos, arreglar el menú y el SEO básico) como servicio puntual, y luego vender la web nueva.

---

## 9. Checklist que usarías en la propuesta (lo que arreglarías)

- [ ] Quitar/comprimir los videos (105 MB → < 3 MB) o usar imagen.
- [ ] Arreglar color del menú (texto visible).
- [ ] Portada con H1, mensaje claro y CTA (WhatsApp + llamar).
- [ ] `<title>` y `<meta description>` con giro + zona.
- [ ] `og:title` / `og:image`.
- [ ] `alt` en las 43 imágenes que no lo tienen.
- [ ] NAP + horario + "Cómo llegar" visibles.
- [ ] Schema LocalBusiness.
- [ ] Google Analytics + Search Console.
- [ ] Botones `tel:` y WhatsApp fijos.
- [ ] Actualizar WordPress/tema y ocultar versiones (seguridad).

---

## 10. Anexo — datos crudos medidos

```
HTTP 200 · servidor nginx · WordPress + WooCommerce (Enfold)
TTFB 5.563 ms · DOM 6.098 ms · load 8.344 ms
LCP 6.296 s · CLS 0.139
Peso total aprox.: 349 MB (video 105 MB x3 + 13 MB x3)
Peticiones: 108 (200) · imágenes 57 · scripts 33 · media 8 · xhr 3
Errores: videos abortados (ERR_ABORTED) · "play() interrupted by pause()"
SEO: meta description = null · og:title = null · og:image = null · H1 = 0
Imágenes: 45 total · 43 sin alt · 0 rotas
Contacto: 1 link WhatsApp · 0 links tel · 2 formularios
Móvil: sin desborde (responsive OK) · tiene botón de menú
```

*Datos tomados el 16/10/2026. Los tiempos pueden variar, pero el orden de magnitud (8 s de carga, ~350 MB) es consistente.*
