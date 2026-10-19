# AGENTS.md

Static one-page website for a dental clinic (Spanish, `lang="es"`). Three files only: `index.html`, `style.css`, `script.js`. No build, no package manager, no tests, no lint config.

## Running / verifying
- Open `index.html` directly in a browser, or serve the folder (e.g. `python -m http.server`) for correct relative paths.
- There is no build/lint/typecheck/test command. Verify changes visually in a browser.
- GSAP + ScrollTrigger are loaded from a CDN in `index.html` (bottom, `defer`). `script.js` bails out of all animations if `window.gsap`/`window.ScrollTrigger` are missing — the page still works without them.

## Templates are tokenized (intentional)
This is a reusable template. `generator/build.mjs` fills these `{{...}}` tokens per business; do not hardcode client data:
- **Business (from the CSV row):** `{{negocio}}`, `{{negocio_url}}`, `{{negocio_mark}}`, `{{ciudad}}`, `{{direccion}}`, `{{direccion_url}}`, `{{horarios}}`, `{{email}}`, `{{instagram_user}}`, `{{instagram_url}}`, `{{facebook_url}}`.
- **Contact / NAP:** `{{telefono}}` (display), `{{telefono_tel}}` (with `+`, for `tel:`), `{{whatsapp}}` (digits, for `wa.me`). These come from the **business's own phone** and are used in hero, footer, float button, form and JSON-LD.
- **Seller:** `{{vendedor_nombre}}` and `{{vendedor_whatsapp}}`. The vendor's number appears **only** in the sales CTAs ("¿Es su negocio?" / "Activar mi página"); never as the business's phone.
- Team names/specialties, testimonials and stats are **placeholder content**: replace or remove them per client before publishing (do not ship invented testimonials/stats as if real).
- `canonical` is empty on purpose (demos are `noindex`).
- `<!-- REEMPLAZAR: ... -->` marks images to swap. A photo list is in the comment at the top of `<body>`.

## Images
- Scene photos come from Pexels (`images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=...`) — free to use, hotlinkable. IDs in use: hero `3845627`, gallery `3845626`/`6473194`/`12917374`, nosotros `7803056`, team `37458147`/`37458044`/`32205053`, CTA `3845810`.
- Testimonial avatars use `randomuser.me/api/portraits/...`.
- Unsplash (`images.unsplash.com`) is **not** used here because its photo URLs are blocked/unreliable in some networks; prefer Pexels or local files when adding images.

## Conventions
- CSS uses design tokens in `:root` (`--primary` teal `#0d6273`, `--accent` coral `#ea6a4b`, spacing `--sp-*`, type `--fs-*`). Reuse tokens; do not hardcode colors/spacing.
- BEM-ish class names (`.service-card__title`, `.team-card__role`, `.nav-toggle__bar`).
- Animations are gated by `gsap.matchMedia()` on `min-width: 1024px` / `max-width: 1023px` and `prefers-reduced-motion`. Keep new animation code inside the existing `init*()` functions and follow this pattern.
- `refreshOnImages()` calls `ScrollTrigger.refresh()` after all images settle; it temporarily forces `scroll-behavior: auto` around the refresh on purpose (a refresh mid-scroll corrupts trigger positions). Do not remove that guard. Keep it in mind when adding images.
- `id="inicio"` lives on `<body>`, not the fixed `<header>`: anchor navigation to a `position: fixed` element is a no-op, so the logo would not scroll back to top otherwise.
- `.gallery__img` is intentionally oversized (`height: 140%; margin-top: -20%`) so the gallery parallax translate never exposes the card's background. Keep the overscan if you retune that animation.
- The reservation form (`#form-reserva`) has no backend: `initForm()` validates the required fields and opens WhatsApp (`wa.me`) with the data pre-written. The clinic number lives in one `wa` constant inside `initForm()`. The integration point for a real backend is the comment there (`fetch("/api/reservas", ...)`).
- Theme is light/dark via `data-tema="oscuro"` on `<html>`, toggled by `#tema-toggle` and persisted in `localStorage["tema"]`. An inline script in `<head>` applies the saved theme before paint to avoid a flash; `initTema()` handles the toggle and button state.
- `.barra-dueno` (sales bar) is `position: fixed` at the top; the header is offset by `--barra-h`. Keep that variable in sync with the bar's real height.
- The services grid holds 9 cards (3×3) and numbers itself via the `svc` CSS counter (`.service-card::after`). Adding/removing cards renumbers automatically.
- No comments in code unless they explain non-obvious intent (existing comments are in Spanish).

## Sector notes (dentistry) — what this demo covers
- Services: consulta/diagnóstico, limpieza, implantes, ortodoncia, estética (blanqueamiento/carillas), endodoncia, periodoncia, odontopediatría, prótesis/rehabilitación.
- Trust content: proceso claro (diagnóstico → plan → presupuesto → seguimiento), equipo de especialistas, estadísticas, testimonios y FAQ (dolor, precios, seguros/reembolsos, financiamiento en cuotas, urgencias, frecuencia de limpieza).
