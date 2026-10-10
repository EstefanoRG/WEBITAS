# Guía completa: vender páginas web a negocios locales (Perú, 2026)

Guía operativa para conseguir clientes, cotizar, vender y entregar páginas web a negocios locales (restaurantes, veterinarias, talleres, dentistas, salones, etc.), incluyendo prospección por scraping, paquetes, costos reales, hosting, dominio, cierre, contrato y mantenimiento.

> Contexto de precios: soles peruanos (S/), mercado formal a 2026, referencias de agencias de Lima. Los rangos son de mercado; ajústalos a tu zona y a tu experiencia.

---

## Índice

1. [Modelo de negocio](#1-modelo-de-negocio)
2. [Elegir nicho y zona](#2-elegir-nicho-y-zona)
3. [Prospección: encontrar negocios sin web o con web deficiente](#3-prospección)
4. [Auditar una web deficiente (checklist)](#4-auditar-una-web-deficiente)
5. [La demo como arma de venta](#5-la-demo-como-arma-de-venta)
6. [Paquetes y qué incluye cada uno](#6-paquetes-y-qué-incluye-cada-uno)
7. [Precios recomendados (Perú 2026)](#7-precios-recomendados)
8. [Cómo poner precio (fórmulas)](#8-cómo-poner-precio)
9. [Costos reales: dominio, hosting, correo, pasarelas](#9-costos-reales)
10. [Márgenes y rentabilidad](#10-márgenes-y-rentabilidad)
11. [Guion de venta y mensajes](#11-guion-de-venta)
12. [Manejo de objeciones](#12-manejo-de-objeciones)
13. [Cierre, contrato y cobros](#13-cierre-contrato-y-cobros)
14. [Entrega e implementación técnica](#14-entrega-e-implementación)
15. [SEO local y Google Business Profile](#15-seo-local-y-google-business-profile)
16. [Mantenimiento e ingreso recurrente](#16-mantenimiento-e-ingreso-recurrente)
17. [Postventa, referidos y upsell](#17-postventa-referidos-y-upsell)
18. [Legal y ética](#18-legal-y-ética)
19. [Errores comunes](#19-errores-comunes)
20. [Plan de 30 días](#20-plan-de-30-días)
21. [Plantillas y anexos](#21-plantillas-y-anexos)

---

## 1. Modelo de negocio

Tres fuentes de ingreso, de menor a mayor estabilidad:

1. **Venta inicial (proyecto):** cobro único por diseñar y publicar la web. Es tu caja para vivir y reinvertir.
2. **Infraestructura anual:** dominio + hosting + correo. Compras al por mayor/año y revendes con margen, o lo facturas como parte del paquete.
3. **Mantenimiento / SEO mensual:** el ingreso recurrente. Es lo que hace el negocio sostenible: con 15–20 clientes de S/150/mes ya son S/2.250–3.000/mes fijos.

La meta no es "hacer webs", es **vender un resultado** (más clientes, más reservas, más llamadas) y quedarte cobrando por mantenerlo.

**Perfil del cliente ideal:**
- Negocio local con ficha en Google Maps, activo (buenas reseñas) pero **sin web** o con web **vieja/lenta/no responsive**.
- No muy grande (que no tenga agencia ni departamento de marketing).
- Con capacidad de pagar S/1.000–3.000.
- Dueño accesible (atiende el negocio, no un gerente remoto).

---

## 2. Elegir nicho y zona

No vendas "webs" en general. Elige **1–2 giros** y domínalos: reutilizas el diseño, el copy y el guion, y cada venta te cuesta menos.

**Giros recomendados (Lima Sur / Villa El Salvador y alrededores):**
- Veterinarias, peluquerías caninas, adiestramiento.
- Restaurantes, pollerías, cevicherías, cafés, pastelerías.
- Talleres mecánicos, lubricentros, frenos, planchado y pintura.
- Dentistas, ópticas, laboratorios, consultorios.
- Salones de belleza, barberías, spas, gimnasios.
- Ferreterías, distribuidoras, importadoras, carpinterías.
- Clínicas/consultorios, contadores, abogados.

**Zona:** empieza por tu distrito y los colindantes. Vender en persona gana más y más rápido. Un negocio a 10 minutos en moto vale más que uno a 2 horas.

---

## 3. Prospección

Objetivo: una **lista de negocios** con nombre, teléfono/WhatsApp, reseñas, rating, si tienen web y (si la tienen) qué tan mala es.

### 3.1 Señales de oportunidad (las mejores)
- **Sin web** + **muchas reseñas** (señal #1: negocio activo y con demanda, pero invisible fuera de Google Maps).
- **Sin web** + rating alto (4.0+) + 10–20+ reseñas + teléfono/WhatsApp público.
- **Con web deficiente** (no responsive, sin HTTPS, lenta, fea, sin CTA).
- **Ficha de Google Business sin reclamar** o mal configurada (sin horario, sin fotos).
- **Sin dominio propio**: web en `facebook.com/negocio`, `wa.me`, `wixsite.com`, `sites.google.com`, o un subdominio raro.

### 3.2 Herramientas de extracción (de lo simple a lo masivo)

| Método | Costo | Volumen | Enriquecido | Dificultad |
|---|---|---|---|---|
| Manual (copiar de Google Maps) | Gratis | 10–20 | Básico | Muy fácil |
| Extensiones Chrome (Instant Data Scraper, Maps Lead Extractor, "Google Maps email extractor") | Gratis / freemium | 50–100 | Variable | Fácil |
| **Scrap.io** (no-code) | desde ~US$49/mes | Alto | Sí (emails, tecnología web) | Muy fácil |
| Outscraper (pago por uso) | por crédito | Alto | Parcial | Media |
| **Apify** (actor "Google Maps No-Website Leads Scraper") | ~US$0,0036 por negocio | Alto | Parcial + lead score | Media |
| Google Places API (oficial) | ~US$32 / 1.000 | Medio | No trae email | Alta |
| Python/Node (Playwright/Puppeteer) + proxies | Gratis + tiempo | Muy alto | A tu medida | Muy alta |

Recomendación práctica:
- **Empezar:** extensiones Chrome gratis para 50–100 leads y validar el nicho. 0 costo.
- **Escalar:** **Scrap.io** (no-code, filtro "sin web", enriquece con emails y tecnología del sitio, exporta CSV/Excel y conecta con Make/CRM). Es el estándar para agencias.
- **Técnico:** **Apify** por actor, o **Python + Playwright** con proxies rotativos (Google bloquea rápido sin proxies).

### 3.3 Flujo de extracción (Scrap.io / Apify / extensión)
1. **Búsqueda:** "veterinarias en Villa El Salvador", "talleres mecánicos en San Juan de Miraflores", etc.
2. **Filtros (antes de pagar por los datos):**
   - Sitio web: **sin web** (o "con web" para el segundo caso).
   - Rating mínimo: 4.0.
   - Reseñas mínimas: 10–20 (filtra negocios fantasma).
   - Con teléfono (requisito para WhatsApp/llamada).
   - Solo verificados por Google (opcional).
   - Categoría exacta (evita ruido).
3. **Exportar** CSV/Excel y limpiar columnas.
4. **Enriquecer** (si tu herramienta lo permite): detectar la plataforma de su web (WordPress/Wix), si tiene SSL, pixel de Facebook, si corre anuncios → detecta webs deficientes.
5. **Cargar a un CRM** (Google Sheets, Notion, HubSpot free, Airtable).

### 3.4 Plantilla de hoja de prospección (columnas)
`Negocio | Categoría | Dirección | Teléfono/WhatsApp | Rating | Reseñas | ¿Web? | URL web | Problemas detectados | Estado | Próximo contacto | Notas`

### 3.5 Método gratis sin herramientas (para arrancar hoy)
1. Google Maps → busca el giro + zona.
2. Por cada negocio: abre la ficha; si **no** hay botón "Sitio web" → candidato ideal. Anota nombre, teléfono, reseñas.
3. Filtra: quédate con los de 4+ estrellas y 10+ reseñas.
4. Guarda 20–30 en Sheets. Con 20 contactos bien hechos suele salir 1–3 clientes.

### 3.6 Legalidad del scraping (importante)
- Scrapear Google Maps directamente **viola sus términos de uso** (aunque no sea delito penal, puede traer bloqueos de IP).
- Camino seguro: **Google Places API** (oficial) o herramientas que ya resuelven eso (Scrap.io, Outscraper, Apify).
- Los emails no están en la ficha: están en la web del negocio. Por eso muchas herramientas hacen el "segundo salto" (ficha → web → email).
- En LATAM, para negocios sin web, **WhatsApp y teléfono** son el canal real. No fuerces email donde no existe.

---

## 4. Auditar una web deficiente

Haz una auditoría rápida (2 minutos) para tener el "ángulo de venta" concreto.

**Checklist de web deficiente:**
- [ ] No es **responsive** (se ve mal/desordenada en el celular).
- [ ] **Sin HTTPS** (sin candado) → Google penaliza y asusta al visitante.
- [ ] **Lenta**: carga en más de 3 s / PageSpeed móvil < 50.
- [ ] **Sin CTA claro** (no hay botón de WhatsApp, llamar o reservar).
- [ ] No muestra **dirección, teléfono y horario** como texto (NAP).
- [ ] Diseño genérico de plantilla, sin fotos propias del negocio.
- [ ] **No aparece en Google** (sin SEO) o la ficha de Google Business está incompleta.
- [ ] Copyright/noticias viejas (ej. "© 2019").
- [ ] Sin dominio propio (usa `wixsite.com`, `facebook.com/…`).
- [ ] Links/menús rotos, imágenes que no cargan.

**Herramientas de auditoría (gratis):**
- **PageSpeed Insights** (Google) → velocidad y puntaje móvil.
- **GTmetrix** → rendimiento y peso.
- **Google Search Console** (si tienes acceso) → si indexa.
- Revisar la web **desde el celular** → ¿se ve bien? ¿hay botón de WhatsApp?
- Buscar `[giro] en [zona]` en Google → ¿aparece? ¿con ficha?

**Ángulo de venta que sale de la auditoría:**
> "Busqué 'veterinaria en Villa El Salvador' y aparecen 6 competidores antes que ustedes. Su web actual carga en 8 segundos y en el celular se descuadra; el 80% de la gente busca desde el celular. Están perdiendo clientes sin saberlo."

---

## 5. La demo como arma de venta

Lo más efectivo: **construir una demo real de su negocio y mostrarla**. Baja muchísimo la fricción ("ya la vi funcionando, solo hay que activarla").

**Flujo:**
1. Elige los 10 mejores leads de la lista.
2. A cada uno, ármale una **landing demo** con su nombre, rubro y textos (usa una plantilla como las demos que ya tienes).
3. Súbela a un subdominio de demo (ej. `tunombre.github.io/demos/negocio`).
4. Contacta: "Le hice una muestra de su página con la información de su negocio, mírela aquí: [link]. Si le gusta, la activo con sus fotos y precios reales y su dominio propio."
5. Cierra o agenda.

Ventajas: demuestra capacidad, personaliza y crea urgencia ("ya está hecha, solo falta activar").

> Cuidado: la demo debe ser claramente una **muestra** (aviso "página de muestra hecha para usted", `noindex`), sin inventar testimonios ni precios falsos como si fueran reales.

---

## 6. Paquetes y qué incluye cada uno

### Paquete 1 — Esencial / Presencia (landing)
Para negocios que no tienen nada y necesitan existir en internet.
- Diseño mobile-first, 1 página con secciones (inicio, servicios, galería, contacto).
- Botón de **WhatsApp** y formulario conectados al WhatsApp del negocio.
- Mapa/ubicación y horario.
- SEO técnico base (títulos, meta, `sitemap.xml`, Open Graph).
- Certificado **SSL**.
- **Dominio + hosting 1 año incluido**.
- Entrega en 1–2 semanas.

### Paquete 2 — Profesional (web corporativa)
Para negocios establecidos que quieren diferenciarse.
- Todo lo del Esencial + 4–8 secciones/páginas.
- Galería con fotos propias, testimonios, FAQ.
- Modo claro/oscuro (opcional).
- **Google Business Profile** optimizado + Google Analytics.
- SEO local (título con "giro + zona", Schema LocalBusiness).
- Capacitación breve para que actualice textos.
- Entrega en 2–4 semanas.

### Paquete 3 — Premium / Reservas
Para clínicas, veterinarias, restaurantes con reserva, salones.
- Todo lo del Profesional + **reservas/citas online** o menú digital.
- Panel para gestionar contenido/reservas.
- Blog o sección de noticias.
- Integración con redes y correo.
- Entrega en 3–6 semanas.

### Paquete 4 — Tienda / Ecommerce
- Catálogo, carrito, checkout, pagos (Culqi/Niubiz/Izipay/Mercado Pago/Yape).
- Envíos, correos transaccionales, panel de pedidos.
- Carga inicial de productos.
- Desde S/3.500 (básico) a S/8.000+ (avanzado).

### Add-ons (venta adicional)
- Sesión de fotos del negocio/platos/productos.
- Redacción de textos (copywriting) y corrección.
- Logo/identidad básica.
- Gestión de redes y campañas (Meta/Google Ads).
- SEO mensual.
- Ficha de Google Business + captación de reseñas.

---

## 7. Precios recomendados

### Rango de mercado en Perú 2026 (referencia)
| Tipo de proyecto | Rango agencias (PEN) |
|---|---|
| Landing page | S/1.000 – S/4.500 |
| Web corporativa pyme | S/1.500 – S/9.000 |
| Ecommerce básico | S/2.000 – S/12.000 |
| Ecommerce avanzado / a medida | S/8.000 – S/25.000+ |

### Precio sugerido para venta directa a pymes locales (tu posición de entrada)
| Paquete | Precio sugerido | Nota |
|---|---|---|
| Esencial (landing) | **S/700 – S/1.200** | Incluye dominio + hosting 1er año |
| Profesional | **S/1.500 – S/2.800** | 4–8 secciones + GBP + Analytics |
| Premium / Reservas | **S/2.800 – S/4.500** | Reservas / panel / blog |
| Tienda básica | **S/3.500 – S/8.000** | Con pagos locales |

### Recurrentes
| Servicio | Precio |
|---|---|
| Hosting + dominio (año) | S/150 – S/400 cobrado al cliente |
| Mantenimiento básico (mes) | S/80 – S/150 |
| Mantenimiento + cambios + soporte (mes) | S/150 – S/400 |
| Mantenimiento + SEO/contenido (mes) | S/400 – S/900 |
| SEO mensual | S/500 – S/1.500 |
| Hora de cambio extra | S/60 – S/150 |

> Regla: **nunca regales el primer año de dominio/hosting sin cobrarlo** dentro del precio del proyecto. Cóbralo incluido y explícalo, para que en el año 2 la renovación sea un ingreso tuyo y no una sorpresa.

---

## 8. Cómo poner precio

**Fórmula base:**
```
Precio = (Horas estimadas × tu tarifa/hora) + costos directos + margen + valor percibido
```
- Tarifa freelance en Perú: **S/40 – S/120/hora** según experiencia.
- Costos directos: dominio, hosting, licencias, fotos.
- Margen recomendado: **40% – 70%** sobre el costo.

**Estimación de horas:**
| Trabajo | Horas |
|---|---|
| Landing con plantilla probada | 6 – 12 h |
| Web corporativa 6 secciones | 20 – 40 h |
| Ecommerce básico | 50 – 90 h |
| Ajustes/iteraciones | 20% extra del total |

**Fórmula de valor (mejor para pymes):** ancla al retorno.
> "Si la web le trae 2 clientes nuevos al mes y su ticket promedio es S/100, son S/200/mes = S/2.400 al año. La inversión de S/1.500 se paga en menos de 8 meses."

**No compitas por precio.** Compite por: demo hecha, entrega rápida, todo incluido (dominio, hosting, SSL, WhatsApp, Google), y que el cliente es dueño de sus accesos.

---

## 9. Costos reales

### 9.1 Dominio (anual, referencia 2026)
| Extensión | Precio anual |
|---|---|
| .com | S/50 – S/80 |
| .com.pe | S/80 – S/170 |
| .pe | S/110 – S/200 (Punto.pe oficial: S/110/año, incluye IGV) |
| .net / .org | S/50 – S/90 |

- Para negocio local, **.com.pe o .pe** posicionan mejor en Perú; **.com** si el .pe está tomado.
- Ojo con el precio "promo" del primer año: la **renovación** es más cara.
- Registrar el dominio **a nombre del cliente** (permite que él sea dueño; tú gestionas).

### 9.2 Hosting (anual, referencia 2026)
| Tipo | Costo anual | Para |
|---|---|---|
| Landing estática en **GitHub Pages / Cloudflare Pages / Vercel** | **Gratis** | Sitios sin base de datos (tus landings) |
| Hosting compartido básico | S/120 – S/600 | Webs WordPress pequeñas |
| Hosting compartido profesional | S/350 – S/700 | Webs con tráfico |
| VPS / Cloud | S/400 – S/1.070 | Ecommerce, tráfico alto |
| SSL (Let's Encrypt) | S/0 | Todos |

**Truco de margen:** las landings estáticas (HTML/CSS/JS) se hostean **gratis** en Cloudflare Pages, GitHub Pages o Vercel con SSL gratis. Si cobras S/150–300/año de "hosting + dominio", casi todo es margen.

### 9.3 Correo corporativo
- Incluido en la mayoría de hostings cPanel (5–25 cuentas).
- **Google Workspace** / Microsoft 365: ~US$6–7 por usuario/mes (más profesional).

### 9.4 Pasarelas de pago (si hay ecommerce)
| Pasarela | Comisión por transacción | Afiliación |
|---|---|---|
| Culqi | ~3,44% + US$0,20 + IGV | Gratis |
| Niubiz | ~3,45% (Visa) / 3,98% (MC) + US$0,15 + IGV | S/300 |
| Izipay | ~3,44% + S/0,69 + IGV | S/300 |
| Mercado Pago | ~3,79% – 3,99% | Gratis |
| Yape para Empresas | ~3,45% + IGV | Cuenta BCP business |

### 9.5 Herramientas (mensual, opcional)
- Scrap.io ~US$49/mes · Apify/Outscraper por uso · Canva Pro ~US$12/mes · Google Analytics/PageSpeed/Search Console gratis · Cloudflare gratis.

### 9.6 Impuestos (Perú)
- Precios de venta + **IGV 18%** (si estás formalizado con RUC).
- Si tu cliente pide **factura**, necesitas RUC y ser responsable de IGV.
- Si compras hosting/dominio **en el extranjero**, la normativa SUNAT exige **retener el 30%** y declararlo; para evitarte líos, compra en proveedores peruanos que emiten comprobante local o asume el trámite.

### 9.7 Ejemplo de costo de un proyecto (landing)
| Concepto | Costo real |
|---|---|
| Dominio .com.pe (año) | S/100 |
| Hosting (Cloudflare Pages) | S/0 |
| SSL | S/0 |
| Correo (cPanel básico) | S/0 |
| Tiempo (10 h × S/60) | S/600 (tu trabajo) |
| **Costo total** | **S/700** |
| **Precio al cliente** | **S/1.200** |
| **Margen** | **S/500 + tu tiempo** |

---

## 10. Márgenes y rentabilidad

- **Proyectos:** margen 40–70%. Una landing puede dejarte S/400–800 limpios y hacerse en un día si reutilizas plantilla.
- **Recurrente (lo importante):**
  - Hosting+dominio: margen alto (hosting estático gratis o compartido barato).
  - Mantenimiento: S/80–400/mes × 15–20 clientes = S/1.200–8.000/mes fijos.
  - SEO: el de mayor precio y mayor valor para el cliente.
- **Escala:** estandariza con plantillas por rubro (veterinaria, restaurante, taller). La segunda web del mismo giro te cuesta 30% del tiempo de la primera.

**Meta realista:**
- Mes 1–3: 3–6 clientes (S/2.500–8.000).
- Mes 6: 10–15 clientes + recurrentes (S/4.000–10.000/mes).
- Año 1: cartera de 20–40 clientes con mantenimiento recurrente.

---

## 11. Guion de venta

### 11.1 Reglas
- Vende el **resultado**, no la web.
- Canal #1 en Perú: **WhatsApp**. Luego **llamada** y **presencial**.
- Personaliza **siempre**: nombre del negocio y algo de su ficha (reseñas, zona).
- La demo hace el 70% del trabajo.

### 11.2 Mensaje de WhatsApp (con demo ya hecha)
```
Hola [NOMBRE], buen día. Le escribo de [tu nombre/marca].

Vi que [NOMBRE DEL NEGOCIO] tiene muy buenas reseñas en Google ([X] opiniones),
pero no encontré su página web. Le armé una muestra con la info de su negocio
para que vea cómo se vería: [LINK]

Si le gusta, la activo con sus fotos y precios reales, con su propio dominio
(ej. tunegocio.com.pe), botón de WhatsApp y mapa. ¿Le comparto los detalles?
```

### 11.3 Mensaje para web deficiente
```
Hola [NOMBRE]. Entré a la web de [NEGOCIO] y en el celular se descuadra y tarda
en cargar; hoy el 80% busca por celular, así que está perdiendo clientes sin notarlo.

Le preparé una versión moderna y rápida de su página: [LINK]
Mírela desde el celular. Si le convence, la dejo lista con su dominio en pocos días.
```

### 11.4 Llamada (estructura de 60 segundos)
1. Saludo + quién eres + por qué llamas ("vi su ficha en Google").
2. Comentario específico (reseñas, zona).
3. Problema ("no tiene web / la actual carga lento").
4. Solución + demo.
5. Cierre de siguiente paso: "¿Le mando el link por WhatsApp ahora?".

### 11.5 Enfoque presencial (el que más cierra)
- Entra como cliente, observa, pide hablar con el dueño.
- Muestra la demo **en tu celular**.
- Deja algo: un flyer con QR a la demo y tu WhatsApp.
- Cierra en el momento o agenda.

### 11.6 Seguimiento (cadencia)
- Día 1: primer contacto + demo.
- Día 3: "¿Pudo ver la muestra?"
- Día 7: prueba social ("esta semana activé una para [negocio X] en [zona]").
- Día 14: oferta con tope ("tengo cupo para una web esta semana a este precio").
- Día 30: cierre o pasa a lista fría (reactivar en 3 meses).

---

## 12. Manejo de objeciones

| Objeción | Respuesta |
|---|---|
| "Ya tengo Facebook/Instagram" | "Perfecto, eso atrae seguidores. La web hace otra cosa: aparece en Google cuando buscan '[giro] en [zona]' y te da autoridad. No compites, se complementan. Yo le pongo el botón de WhatsApp y linkeo sus redes." |
| "No tengo presupuesto" | "Entiendo. Empezamos con el plan Esencial (landing) y lo pago en 2 partes: 50% al inicio, 50% al entregar. Se paga sola con 1–2 clientes." |
| "Un sobrino me la hace en S/300" | "Sí, y quedará bonita… pero esas plantillas no aparecen en Google, cargan lento y muchas veces él se queda con el dominio a su nombre. Aquí usted es dueño de todo y la web está hecha para traerle clientes, no solo para verse." |
| "No tengo tiempo" | "No necesita tiempo: yo hago todo. Usted solo aprueba y me manda fotos/precios por WhatsApp. En 1–2 semanas está lista." |
| "¿Y si no funciona?" | "Lo medimos: le dejo Google Analytics y le muestro las visitas y cuántos le escriben. Además optimizo su ficha de Google para que lo encuentren." |
| "Déjame pensarlo" | "Claro. Le dejo la muestra activa unos días. ¿Le parece si le escribo el [día] para ver qué decidió? Mientras, ¿qué le cambiaría a la muestra?" |
| "Está caro" | "Comparemos resultados, no precios: una web barata que no aparece en Google le cuesta más porque no le trae clientes. Esto es una inversión con retorno medible." |
| "Mándame por correo" | "Le mando la info por WhatsApp, que es más rápido, y si prefiere le llamo 5 minutos y le muestro la muestra en pantalla." |

**Regla de oro:** no discutas. Escucha, valida, y reencuadra hacia el **costo de no tener web** (clientes que se van a la competencia).

---

## 13. Cierre, contrato y cobros

### 13.1 Estructura de cobro
- **50% de adelanto** para empezar (cubre dominio/hosting y compromiso).
- **50% contra entrega** (o 25% intermedio en proyectos grandes).
- Proyectos > S/3.000: 40% / 30% / 30%.

### 13.2 Métodos de pago (Perú)
- **Yape / Plin** (lo más usado, inmediato).
- Transferencia BCP/Interbank/BBVA.
- Efectivo (con recibo).
- Emitir **boleta** (persona natural) o **factura** (empresa con RUC).

### 13.3 Contrato / acuerdo mínimo (1 página)
Incluye siempre:
- Partes (nombre, DNI/RUC, contacto).
- **Alcance**: número de secciones, funcionalidades, entregables.
- **Lo que NO incluye** (ej. fotos profesionales, textos si no los da, dominio extra, Ads).
- **Plazos** (fecha de entrega, dependiente de que el cliente envíe material).
- **Precio y forma de pago**.
- **Revisiones incluidas**: 2 rondas de cambios; extra se cobra por hora.
- **Propiedad**: dominio, hosting y accesos **a nombre del cliente**; código y diseño entregados.
- **Soporte incluido**: ej. 30 días de corrección de errores.
- **Mantenimiento**: qué incluye y cuánto, si contrata.
- Firma y fecha (puede ser digital/WhatsApp con "de acuerdo").

### 13.4 Entrega de accesos
Entrega al cliente (¡esto genera confianza y evita reclamos!):
- Acceso al **dominio** (panel del registrador).
- Acceso al **hosting** (cPanel / panel del proveedor).
- Correos creados.
- Google Analytics y Search Console (como administradores).
- Ficha de Google Business (transferida a su cuenta).
- Guía simple de uso.

---

## 14. Entrega e implementación

### 14.1 Stack recomendado
| Necesidad | Stack |
|---|---|
| Landing / web informativa | **HTML+CSS+JS estático** (tus demos) → Cloudflare Pages / GitHub Pages / Vercel (gratis, rápido) |
| Web con panel | **WordPress + hosting cPanel** (o Elementor) |
| Tienda | **Shopify, WooCommerce o Tiendanube** |
| Formularios/leads | Integrado a **WhatsApp** (`wa.me`) — casi todos los negocios lo prefieren |

### 14.2 Pasos de publicación
1. Registrar **dominio** (a nombre del cliente).
2. Publicar el sitio (deploy estático o subir a hosting).
3. Configurar **DNS** y apuntar el dominio.
4. Activar **SSL** (Cloudflare/Let's Encrypt).
5. Crear **correos** corporativos.
6. Configurar **WhatsApp** y formularios.
7. **Google Analytics 4** + **Search Console**.
8. `sitemap.xml` + `robots.txt`.
9. Reclamar/optimizar **Google Business Profile**.
10. Probar en **celular, tablet y desktop**; revisar velocidad (PageSpeed > 80 móvil).

### 14.3 Checklist de entrega
- [ ] Web publicada con el dominio del cliente.
- [ ] HTTPS activo (candado).
- [ ] Botón de WhatsApp y formulario probados.
- [ ] Datos de contacto (NAP) correctos: nombre, dirección, teléfono, horario.
- [ ] Google Analytics + Search Console.
- [ ] Ficha de Google Business con link a la web.
- [ ] Respaldos/backups configurados.
- [ ] Accesos entregados al cliente.
- [ ] Capacitación breve (15 min) o video.

---

## 15. SEO local y Google Business Profile

El 90% de los clientes nuevos de una pyme vienen de búsquedas locales tipo **"[giro] en [zona]"**. Prioriza:

1. **Ficha de Google Business Profile (GBP):**
   - Categoría correcta, horario, teléfono, dirección.
   - 10–20 fotos reales.
   - Descripción con "giro + zona".
   - Link a la web.
   - Pedir **reseñas** a los clientes (las reseñas suben rankings locales).
2. **Web:**
   - Título con "giro + zona" (ej. "Veterinaria en Villa El Salvador").
   - Schema **LocalBusiness** (JSON-LD).
   - NAP visible como texto.
   - Velocidad y móvil (PageSpeed).
3. **Reseñas:** automatiza el pedido (QR en el local, mensaje post-venta).
4. **Nap consistente** en web, GBP y redes.

Vende esto como **"SEO local"** (servicio recurrente de S/400–1.500/mes).

---

## 16. Mantenimiento e ingreso recurrente

Ofertas de mantenimiento (elige 2–3 y empaquétalas):

| Plan | Precio/mes | Incluye |
|---|---|---|
| Básico | S/80 – S/150 | Backups, actualizaciones, monitoreo, 1 cambio simple/mes |
| Estándar | S/150 – S/300 | Lo anterior + 3–5 cambios, soporte WhatsApp, reporte mensual |
| Pro | S/300 – S/900 | Lo anterior + gestión de contenido, SEO local, reseñas, campañas |

**Automatiza:**
- Backups automáticos.
- Página de "Mantenimiento" en tu web para vender el servicio.
- Recordatorios de renovación de dominio/hosting (30 días antes).
- Cobros recurrentes (link de pago / Yape programado).

---

## 17. Postventa, referidos y upsell

- **A los 7 días:** "¿cómo va la web? ¿algo para ajustar?".
- **A los 30 días:** pide **reseña de tu servicio** (para tu propio marketing) + referido.
- **Referidos:** ofrece S/100 de descuento (o un mes de mantenimiento) por cliente que traiga.
- **Upsell (a los 2–3 meses):**
  - Campañas de Google/Meta Ads.
  - Fotos profesionales del negocio.
  - Paquete de reseñas / SEO mensual.
  - Segunda web (si tiene 2 locales) o catálogo virtual.
- **Caso de éxito:** documenta "tal negocio recibió X consultas" (con permiso). Es tu mejor prueba social.

---

## 18. Legal y ética

- **Datos personales (Ley 29733, Perú):** si capturas datos con formularios, incluye **aviso de privacidad** y trata los datos con consentimiento.
- **Cookies:** si usas Analytics/Ads, aviso de cookies.
- **No inventes:** reseñas falsas, precios "reales" que no son, o estadísticas inventadas. Un testimonio falso te hunde la reputación y puede ser ilegal (competencia desleal).
- **Scraping:** usa Places API o herramientas que lo resuelven; evita scrapear Google directamente en volumen.
- **WhatsApp:** no hagas spam masivo (pueden banear tu número). Mensajes personalizados, pocos y con opción de no recibir más.
- **Propiedad del cliente:** dominio y hosting a su nombre. Nunca retengas accesos para "obligarlos" a pagar mantenimiento; eso destruye referidos.
- **Transparencia de precios:** explica qué está incluido el primer año y qué se renueva.

---

## 19. Errores comunes

1. **Vender "una web"** en vez de un resultado (más clientes).
2. **No mostrar demo** → el cliente no visualiza y no compra.
3. **Regalar el dominio a tu nombre** → si el cliente se va, pierde todo (o tú quedas mal).
4. **Cobrar barato** para ganar y no poder sostener el soporte.
5. **No cobrar hosting/dominio** → el año 2 pagas tú los errores.
6. **No poner CTA/WhatsApp** → la web no convierte.
7. **Ignorar el móvil** → la mayoría del tráfico local es celular.
8. **No pedir reseñas** ni trabajar el GBP → no aparecen en Google.
9. **Hacer spam** en WhatsApp → te bloquean.
10. **No hacer seguimiento** → el 80% de las ventas se cierran en el 2º–4º contacto.
11. **No medir** (sin Analytics) → no puedes demostrar valor ni renovar mantenimiento.
12. **No formalizarse** → pierdes clientes que piden factura y no puedes escalar.

---

## 20. Plan de 30 días

**Semana 1 — Preparación**
- Elige 1–2 giros y tu zona.
- Arma 2–3 plantillas reutilizables (landing, web, reservas).
- Define paquetes y precios.
- Publica tu propia web de servicios + WhatsApp + portafolio (tus demos).

**Semana 2 — Prospección**
- Saca 100–200 leads (Scrap.io / extensión / manual).
- Filtra: sin web o web deficiente, 4+ estrellas, 10+ reseñas.
- Prioriza 30 para demo.

**Semana 3 — Demos y contacto**
- Arma 10 demos de los mejores leads.
- Contacta por WhatsApp (+ llamada + presencial).
- Registra todo en Sheets/CRM.

**Semana 4 — Cierre**
- Seguimiento (2º y 3er toque).
- Cierra 3–5 clientes.
- Entrega, cobra el saldo, pide reseña y ofrece mantenimiento.
- Repite con los 20 leads restantes.

**KPIs a medir:**
- Leads contactados / día.
- Tasa de respuesta (meta 10–20%).
- Demos mostradas → reuniones.
- Tasa de cierre (meta 5–15%).
- Recurrente ganado (clientes de mantenimiento).

---

## 21. Plantillas y anexos

### Anexo A — Propuesta (plantilla de WhatsApp/Doc)
```
PROPUESTA — Página web para [NEGOCIO]

Qué incluye:
- Diseño moderno, adaptado a celular.
- Secciones: Inicio, Servicios, Galería, Contacto.
- Botón de WhatsApp y formulario.
- Mapa y horario.
- Dominio propio [tunegocio.com.pe] + hosting 1 año.
- Certificado de seguridad (SSL).
- Google Analytics + ficha de Google optimizada.

Precio: S/ [monto] (incluye dominio y hosting el primer año).
Forma de pago: 50% al inicio, 50% al entregar.
Plazo: [X] días hábiles desde que me envía fotos y textos.
Revisiones: 2 rondas incluidas.

Mantenimiento opcional desde el año 2: S/ [monto]/mes (backups, cambios, soporte).
```

### Anexo B — Contrato simple (esqueleto)
```
ACUERDO DE SERVICIO DE DISEÑO WEB

1. Partes: [Proveedor] y [Cliente].
2. Alcance: [detalle de secciones y funcionalidades].
3. No incluye: [fotos profesionales, textos no entregados, Ads, dominio adicional].
4. Plazo: [fecha], sujeto a entrega de material del cliente.
5. Precio: S/ [monto]. Pago 50% inicio / 50% entrega.
6. Revisiones: 2 rondas; adicionales a S/ [hora].
7. Propiedad: dominio, hosting y accesos a nombre del Cliente.
8. Soporte: 30 días para corrección de errores.
9. Mantenimiento (opcional): S/ [monto]/mes, renovable.
10. Firma: [Proveedor] / [Cliente] — Fecha.
```

### Anexo C — Flujo de trabajo (mi proceso)
```
1. Prospecto → demo
2. Contacto + demo (WhatsApp/llamada/presencial)
3. Cierre + 50%
4. Recibo material (logo, fotos, textos, precios)
5. Diseño y publicación
6. Revisiones (2 rondas)
7. Saldo 50% + entrega de accesos
8. Capacitación + reseña + oferta de mantenimiento
9. Seguimiento y upsell
```

### Anexo D — Herramientas
| Uso | Herramienta |
|---|---|
| Prospección | Google Maps, extensiones Chrome, Scrap.io, Apify, Outscraper |
| Auditoría | PageSpeed Insights, GTmetrix |
| Diseño | Figma, Canva |
| Desarrollo | HTML/CSS/JS, WordPress+Elementor, Shopify/WooCommerce |
| Hosting | Cloudflare Pages, GitHub Pages, Vercel (gratis) / Hostinger, HostGator (pago) |
| Dominios | Punto.pe, Namecheap, Hostinger, DominiosPeru |
| SEO/Analítica | Google Search Console, Analytics 4, GBP |
| Gestión | Google Sheets, Notion, Trello, HubSpot free |
| Pagos | Yape, Plin, Culqi, Niubiz, Mercado Pago |

### Anexo E — Script de auditoría rápida (qué mirar en 2 min)
1. Abrir la web en el **celular** → ¿responsive? ¿botón WhatsApp?
2. **PageSpeed móvil** → puntaje < 50 = argumento de venta.
3. ¿Tiene **HTTPS** (candado)?
4. Buscar `giro + zona` en Google → ¿aparece? ¿con ficha GBP?
5. ¿Muestra dirección/teléfono/horario?
6. ¿Fecha de copyright actualizada? ¿Diseño viejo?

### Anexo F — Frases de cierre
- "Ya la vi funcionando con lo de su negocio; activarla con su dominio es cosa de días."
- "¿Le reservo el cupo de esta semana para dejarla lista antes del [día]?"
- "El primer paso es el 50% y empezamos hoy. Yo me encargo de todo lo demás."

---

## 22. Archivos complementarios

- **`CALCULADORA-PRECIOS.md`** — fórmula, tablas de horas/tarifas, ejemplos resueltos y matriz de paquetes.
- **`calculadora-precios.html`** — calculadora interactiva (ábrela en el navegador): ajusta horas, tarifa, costos y margen, y te da el precio de venta con o sin IGV. Incluye botón "copiar resumen".
- **`PLANTILLA-LEADS.csv`** — hoja para tu lista de prospectos (negocio, contacto, reseñas, web, problemas, estado y próximo contacto). Ábrela en Excel o Google Sheets.

---

*Última actualización: 2026. Ajusta precios a tu zona, tu experiencia y el poder adquisitivo de tus clientes.*
