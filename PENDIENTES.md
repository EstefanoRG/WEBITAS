# WEBITAS — Pendientes para dejarlo listo para vender

Checklist de lo que **ya está** y **lo que falta** para usar el sistema como herramienta de captación y venta de páginas web.

---

## ✅ Ya está funcionando
- 4 plantillas por rubro: **veterinaria · dental · taller · interiores** (las demos solo reemplazan **texto**, el diseño no se toca).
- Generador `generator/build.mjs`: lee el CSV/Sheet → crea cada demo, el **panel** y la portada neutra.
- Reglas automáticas: **dedupe por teléfono**, **prioridad** (sin web +3; reseñas y rating suman) y orden por prioridad.
- **Panel secreto** compartido (para ti y tu socio): lista por prioridad, estado, vendedor, contador de visitas, **abrir demo →** y **Escribir por WhatsApp** (mensaje natural, sin emojis, con pregunta de dueño/encargado y el link de la demo).
- Dos **vendedores** (Estefano / Luigui): su número va en el WhatsApp de cada demo.
- Tablero local (`ABRIR-TABLERO.bat`) para generar/publicar.
- Robot de GitHub Actions que regenera y publica.
- Demo de prueba con 6 filas (5 negocios tras dedupe).

---

## 🔲 Falta hacer (para producirlo de verdad)

### 1. GitHub (una vez)
- [ ] Hacer el repo **`EstefanoRG/WEBITAS` público** (Settings → General → Danger zone → Change visibility).
- [ ] **Settings → Pages → Source = GitHub Actions**.
- [ ] Correr una vez *Actions → Build & Deploy demos → Run workflow* y confirmar que publica.
- [ ] Verificar que abre: `https://estefanorg.github.io/WEBITAS/x7q2k9p4/` (panel) y `…/demo/clinica-dental-sonrisa/`.
- [ ] (Opcional) Renombrar/cambiar el **código** del panel en `generator/config.json` → `codigo`.

### 2. Google Sheet (una vez)
- [ ] Crear la hoja con **las 28 columnas** (copiar `data/empresas.csv`).
- [ ] Compartir la hoja con tu socio.
- [ ] *Archivo → Compartir → Publicar en la web → CSV* → copiar la URL.
- [ ] GitHub → *Settings → Secrets and variables → Actions* → secreto **`SHEET_CSV_URL`** con esa URL.
- [ ] Borrar las filas de prueba del Sheet y cargar tus prospectos reales.

### 3. Probar el flujo completo (una vez)
- [ ] Pegar 2–3 prospectos nuevos en el Sheet.
- [ ] Correr *Run workflow* y ver que aparecen en el panel, ordenados por prioridad.
- [ ] Probar **Escribir por WhatsApp** desde el celular (que abra el chat con el número correcto y el mensaje).
- [ ] Probar **abrir demo →** desde el celular.

### 4. Separar quién contacta (opcional, recomendado)
- [ ] Dialogar con tu socio un criterio: por **zona** o por **rubro** para repartirse los prospectos (la columna `vendedor` ya lo permite).
- [ ] Usar `estado` (Nuevo → Contactado → Interesado → Vendido/Descartado) para no pisarse.

---

## 🔁 Flujo diario (cómo se usa)
1. Scrapeas negocios → pegas las filas nuevas en el Sheet (no importa el orden).
2. El robot fusiona, depura duplicados y ordena por prioridad.
3. En el **panel**, por cada negocio: **abrir demo** para revisarlo y **Escribir por WhatsApp** para contactarlo.
4. Si responde, cambias `estado` en el Sheet (y `canal`, `proximo_contacto`).
5. Cuando dice que sí → pasas a “Al vender” (abajo).

---

## 💰 Al vender una página (por cliente)
- [ ] Reemplazar las **fotos de stock** por las reales del negocio.
- [ ] (Si aplica) Personalizar textos que aún vienen de la plantilla (hero/servicios) — hoy solo se rellenan los datos marcados.
- [ ] Comprar/registrar el **dominio** a nombre del cliente.
- [ ] Publicar la web del cliente **fuera** de este repo (su propio hosting: GitHub Pages/Cloudflare/Vercel).
- [ ] Quitar el `noindex` de la versión del cliente (los demos van con `noindex`).
- [ ] Entregar accesos (dominio, hosting) al cliente.
- [ ] Ofrecer **mantenimiento / SEO local** (ingreso recurrente) + **Google Business**.

---

## 🧩 Mejoras futuras (cuando lo necesites)
- [ ] **Botones de vendedor dentro del panel** que guarden solos (requiere Apps Script; hoy se cambia `vendedor` en el Sheet).
- [ ] **Actualización instantánea** al editar el Sheet (hoy: por horario o al correr el workflow).
- [ ] **Miniaturas** de cada demo en el panel (screenshots automáticos).
- [ ] **Personalización por negocio** del hero/servicios (convertir esos textos en tokens).
- [ ] **Dominio propio** para el panel/demos (ej. `demos.tudominio.com`).
- [ ] **Candado real** con contraseña (Cloudflare Access) si quieres cerrar el acceso.

---

## ⚠️ Notas
- **Seguridad:** GitHub Pages gratis **no tiene contraseña**; el `codigo` del panel es “no listado”, no seguridad real. No metas datos sensibles que no quieras exponer.
- **Columnas:** quedan fijas en **28** (no agregar ni quitar sin decidirlo). Detalle en `SETUP.md`.
- **Demos:** solo se reemplaza **texto**; el diseño no se cambia.
- **Cuenta Git:** en tu equipo hay una credencial llamada `EstefanoARG`; el login real del repo es **`EstefanoRG`** — conviene revisarlo si algún día falla el push.
