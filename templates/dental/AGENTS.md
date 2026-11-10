# AGENTS.md

Static one-page website for a dental clinic (Spanish, `lang="es"`). Three files only: `index.html`, `style.css`, `script.js`. No build, no package manager, no tests, no lint config.

## Running / verifying
- Open `index.html` directly in a browser, or serve the folder (e.g. `python -m http.server`) for correct relative paths.
- There is no build/lint/typecheck/test command. Verify changes visually in a browser.
- No GSAP or external JS libraries. `script.js` uses native APIs only.
- Verify at 390, 768 and 1440 px. The page should not hide content behind scroll animations because there are none.

## Templates are tokenized (intentional)
This is a reusable template. `generator/build.mjs` fills these `{{...}}` tokens per business; do not hardcode client data:
- **Business (from the CSV row):** `{{negocio}}`, `{{negocio_url}}`, `{{negocio_mark}}`, `{{ciudad}}`, `{{direccion}}`, `{{direccion_url}}`, `{{horarios}}`, `{{email}}`, `{{instagram_user}}`, `{{instagram_url}}`, `{{facebook_url}}`, `{{maps_url}}`, `{{rating}}`, `{{resenas}}`, `{{resenas_txt}}`, `{{categoria}}`.
- **Contact / NAP:** `{{telefono}}` (display), `{{telefono_tel}}` (with `+`, for `tel:`), `{{whatsapp}}` (digits, for `wa.me`). These come from the **business's own phone** and are used in hero, form, footer, float button and JSON-LD.
- **Seller:** `{{vendedor_nombre}}` and `{{vendedor_whatsapp}}`. The vendor's number appears **only** in the sales CTAs ("¿Es su negocio?" / "Activar mi página"); never as the business's phone.
- `canonical` is empty on purpose (demos are `noindex`).
- `<!-- REEMPLAZAR: ... -->` marks images to swap.

### Conditionals
`fill()` in `generator/build.mjs` understands `{{#token}}…{{/token}}` and `{{^token}}…{{/token}}`.
- The Google rating block only renders when `{{rating}}` exists.
- Social links only render when `{{instagram_url}}` / `{{facebook_url}}` exist.
- The email line only renders when `{{email}}` exists.
- **Do not nest conditionals.** The JSON-LD deliberately omits `sameAs` to avoid nesting.

## Content rules (important)
This is a **mass demo**, not a personalized brand page. Do not invent doctors, testimonials, patient names, review counts or statistics. The template intentionally builds trust from the process:
- first visit → diagnosis → written plan and budget → follow-up.
- `{{rating}}` / `{{resenas_txt}}` are the only proof numbers and come from real data.
- If a business has no rating or social links, the corresponding blocks simply disappear.
- Do not add a team section with stock doctors or a testimonial section with fake reviews. If a client provides real people/reviews, add them outside this reusable template.

## Images
Scene photos come from Pexels (`images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=...`) — free to use, hotlinkable. IDs in use:
- Hero: `3845627` (patient smiling).
- Clinic large: `6473194` (clinic interior).
- Clinic small: `3845626` (consultation detail).
- OG: `3845627`.

No `randomuser.me` avatars. No doctor portraits with fake names. Replace with real photos when activating a client.

## Conventions
- CSS uses design tokens in `:root`:
  - Paper `#f2f4f1`, ink `#17221f`, wine `#5b1f2b`, sage `#a9b7a5`, peach `#e8c8ba`.
  - Type: `Newsreader` for display, `Manrope` for body/UI.
  - Spacing `--sp-*`, type `--fs-*`, max width `--max`, fixed chrome `--barra-h` / `--header-h`.
- BEM-ish class names (`.hero__copy`, `.treatment-group`, `.faq__q`).
- Buttons are rectangular with `--radius: 2px`; avoid pills and card-grid repetition.
- No theme toggle, no `data-tema`, no `localStorage` theme. Single light direction.
- **Fixed chrome:** the demo bar is fixed at the top (`--barra-h`) and the header is fixed below it (`--header-h`). The hero image starts at the top of the page and runs behind both.
  - Header over the hero: ink tint, light logo/nav/CTA.
  - `.is-scrolled` and `body.nav-open`: paper header, dark logo/nav/CTA.
  - Do not remove the fixed offsets: `html { scroll-padding-top: calc(var(--barra-h) + var(--header-h) + 16px); }` keeps anchors below the fixed chrome. Do not add a second `scroll-margin-top` on sections or the offset doubles.
- Mobile navigation: full-screen panel at `max-width: 620px`; the hamburger bars morph into an X (same button opens/closes). `Escape`, backdrop click and nav-link click close it. Nav links inside the paper panel are always ink, independent of the header state.
- Hero: full-bleed image + dark wine/ink overlay, no framed image. Text sits on the left; the "Primera visita" card is desktop-only.
- Treatments: four `<details>` groups (Salud, Estética, Función, Niños). Each item has a name + short explanation. JS opens all groups on desktop and closes them on mobile; on mobile they act as a "ver más".
- The map is a Google Maps iframe: `https://www.google.com/maps?q={{direccion_url}}&output=embed`. Keep the "Abrir en Google Maps" fallback link and the iframe `title`.
- The reservation form (`#form-reserva`) has no backend: `script.js` validates required fields and opens WhatsApp with the data pre-written.
  - Business number lives in `var WA = "{{whatsapp}}"` inside `script.js` (filled by the generator).
  - Business name lives in `var NEGOCIO = "{{negocio}}"`.
  - Fields: name, phone, treatment, optional message.
- `id="inicio"` lives on `<body>`; the logo links there.
- No comments in code unless they explain non-obvious intent.

## Sector notes (dentistry)
- Treatments are organized by outcome, not as cards: **Salud** (consulta, limpieza, endodoncia, periodoncia), **Estética** (blanqueamiento, carillas, diseño de sonrisa), **Función** (ortodoncia, implantes, prótesis/rehabilitación), **Niños** (odontopediatría).
- Trust is built through the first-visit process and written budget, not invented numbers.
- FAQ covers pain, first appointment, insurance, emergencies and cleaning frequency.
