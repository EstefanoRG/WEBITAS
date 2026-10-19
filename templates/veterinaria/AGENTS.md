# AGENTS.md

Static one-page website for a veterinary clinic (Spanish, `lang="es"`). Three files only: `index.html`, `style.css`, `script.js`. No build, no package manager, no tests, no lint config.

## Running / verifying
- Open `index.html` directly in a browser, or serve the folder (e.g. `python -m http.server`) for correct relative paths.
- There is no build/lint/typecheck/test command. Verify changes visually in a browser.
- GSAP + ScrollTrigger are loaded from a CDN in `index.html` (bottom, `defer`). `script.js` bails out of all animations if `window.gsap`/`window.ScrollTrigger` are missing — the page still works without them.

## This is a reusable template — tokens are intentional
Do not "fix" these; `generator/build.mjs` fills them per business:
- **Business (CSV row):** `{{negocio}}`, `{{negocio_url}}`, `{{negocio_mark}}`, `{{ciudad}}`, `{{direccion}}`, `{{direccion_url}}`, `{{horarios}}`, `{{email}}`, `{{instagram_user}}`, `{{instagram_url}}`, `{{facebook_url}}`.
- **Contact / NAP:** `{{telefono}}` (display), `{{telefono_tel}}` (for `tel:`), `{{whatsapp}}` (digits, for `wa.me`). All come from the **business's own phone** and are used in hero, footer, float button, form and JSON-LD.
- **Seller:** `{{vendedor_nombre}}`, `{{vendedor_whatsapp}}`. The vendor number appears **only** in the sales CTAs ("¿Es su negocio?" / "Activar mi página").
- Testimonials and stats are **placeholder content**: replace or remove per client before publishing.
- `canonical` empty on purpose (demos are `noindex`).
- `<!-- REEMPLAZAR: ... -->` comments mark images to swap. Images currently point at Unsplash URLs; a photo list is in the comment at the top of `<body>`.

## Conventions
- CSS uses design tokens in `:root` (`--primary`, `--accent`, spacing `--sp-*`, type `--fs-*`). Reuse tokens; do not hardcode colors/spacing.
- BEM-ish class names (`.service-card__title`, `.nav-toggle__bar`).
- Animations are gated by `gsap.matchMedia()` on `min-width: 1024px` / `max-width: 1023px` and `prefers-reduced-motion`. Keep new animation code inside the existing `init*()` functions and follow this pattern.
- `refreshOnImages()` calls `ScrollTrigger.refresh()` after all images settle; keep that in mind when adding images or the scroll positions can be wrong. It temporarily forces `scroll-behavior: auto` around the refresh on purpose: with CSS smooth scrolling, a refresh fired while the user is mid-scroll corrupts trigger positions and the hero copy stays hidden at `opacity: 0`. Do not remove that guard.
- `id="inicio"` lives on `<body>`, not the fixed `<header>`: anchor navigation to a `position: fixed` element is a no-op, so the logo would not scroll back to top otherwise.
- `.gallery__img` is intentionally oversized (`height: 140%; margin-top: -20%`) so the gallery parallax translate never exposes the card's beige background. Keep the overscan if you retune that animation.
- The reservation form (`#form-reserva`) has no backend: `initForm()` validates the required fields and opens WhatsApp (`wa.me`) with the data pre-written. The clinic number lives in one `wa` constant inside `initForm()`. The integration point for a real backend is the comment there (`fetch("/api/reservas", ...)`).
- Theme is light/dark via `data-tema="oscuro"` on `<html>`, toggled by `#tema-toggle` and persisted in `localStorage["tema"]`. An inline script in `<head>` applies the saved theme before paint to avoid a flash; `initTema()` handles the toggle and button state.
- `.barra-dueno` (sales bar) is `position: fixed` at the top; the header is offset by `--barra-h`. Keep that variable in sync with the bar's real height.
- No comments in code unless they explain non-obvious intent (existing comments are in Spanish).
