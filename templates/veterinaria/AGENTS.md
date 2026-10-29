# AGENTS.md

Static one-page website for a veterinary clinic (Spanish, `lang="es"`). Three files only: `index.html`, `style.css`, `script.js`. No build, no package manager, no tests, no lint config.

## Running / verifying
- Open `index.html` directly in a browser, or serve the folder (e.g. `python -m http.server`) for correct relative paths.
- There is no build/lint/typecheck/test command. Verify changes visually in a browser.
- GSAP + ScrollTrigger are loaded from a CDN in `index.html` (bottom, `defer`). `script.js` bails out of all animations if `window.gsap`/`window.ScrollTrigger` are missing — the page still works without them.

## This is a reusable template — tokens are intentional
Do not "fix" these; `generator/build.mjs` fills them per business:
- **Business (CSV row):** `{{negocio}}`, `{{negocio_url}}`, `{{negocio_mark}}`, `{{negocio_corto}}`, `{{ciudad}}`, `{{zona}}`, `{{ubicacion}}`, `{{direccion}}`, `{{direccion_url}}`, `{{horarios}}`, `{{email}}`, `{{instagram_user}}`, `{{instagram_url}}`, `{{facebook_url}}`, `{{maps_url}}`, `{{categoria}}`.
- **Trust data:** `{{rating}}`, `{{resenas}}`, `{{resenas_txt}}`. They come from the Sheet/CSV; if a business has no rating, the rating block is hidden with the conditional syntax instead of showing “0” or a fake review.
- **Conditionals:** `{{#rating}}…{{/rating}}` renders only when the token has a value; `{{^rating}}…{{/rating}}` renders only when it is empty. `fill()` in `generator/build.mjs` implements both. Do not nest conditionals (the regex is single-pass).
- **Contact / NAP:** `{{telefono}}` (display), `{{telefono_tel}}` (for `tel:`), `{{whatsapp}}` (digits, for `wa.me`). All come from the **business's own phone** and are used in hero, footer, float button, form and JSON-LD.
- **Seller:** `{{vendedor_nombre}}`, `{{vendedor_whatsapp}}`. The vendor number appears **only** in the sales CTAs ("¿Es su negocio?" / "Activar mi página").
- The old invented testimonials and stats were removed. The page now uses the real Google rating, review count, address, map and social links. Do not reintroduce fake reviews, “12+ años”, “4.800+ mascotas” or “98%” as if they were real.
- `canonical` empty on purpose (demos are `noindex`).
- `<!-- REEMPLAZAR: ... -->` comments mark images to swap. Images are from Pexels (a photo list is in the comment at the top of `<body>`), not Unsplash: Unsplash is blocked or unreliable on some networks.

## Conventions
- CSS uses design tokens in `:root` (`--primary`, `--accent`, spacing `--sp-*`, type `--fs-*`). Reuse tokens; do not hardcode colors/spacing.
- BEM-ish class names (`.service-card__title`, `.nav-toggle__bar`).
- Animations are gated by `gsap.matchMedia()` on `min-width: 1024px` / `max-width: 1023px` and `prefers-reduced-motion`. Keep new animation code inside the existing `init*()` functions and follow this pattern.
- `refreshOnImages()` calls `ScrollTrigger.refresh()` after all images settle; keep that in mind when adding images or the scroll positions can be wrong. It temporarily forces `scroll-behavior: auto` around the refresh on purpose: with CSS smooth scrolling, a refresh fired while the user is mid-scroll corrupts trigger positions and the hero copy stays hidden at `opacity: 0`. Do not remove that guard.
- `id="inicio"` lives on `<body>`, not the fixed `<header>`: anchor navigation to a `position: fixed` element is a no-op, so the logo would not scroll back to top otherwise.
- `.gallery__img` is intentionally oversized (`height: 140%; margin-top: -20%` on desktop, `112% / -6%` on mobile) so the gallery parallax translate never exposes the card's beige background. Keep the overscan if you retune that animation.
- On mobile the gallery is a 2-column mosaic (tall photo spans two rows; wide and square stack on the right). Do not turn it back into four full-width blocks: it adds ~700 px of scroll for no benefit.
- The hero uses `<picture>`: a landscape image on desktop and a portrait image under 768 px. A landscape photo cropped to 390×844 loses the pet’s face, so keep the mobile art direction. The mobile `object-position` is a fallback for browsers that ignore `<source>`.
- The header sits on the photo, so `.hero__overlay` has a dark top scrim and `.hero__content` text has a subtle shadow. Keep them: the logo was 1.15:1 against the light wall before.
- The reservation form (`#form-reserva`) has no backend: `initForm()` validates the required fields and opens WhatsApp (`wa.me`) with the data pre-written. It includes the pet’s name and preferred date; `fecha.min` is set to today. The clinic number lives in one `wa` constant inside `initForm()`. The integration point for a real backend is the comment there (`fetch("/api/reservas", ...)`).
- Theme is light/dark via `data-tema="oscuro"` on `<html>`, toggled by `#tema-toggle` and persisted in `localStorage["tema"]`. An inline script in `<head>` applies the saved theme before paint to avoid a flash; `initTema()` handles the toggle and button state. At ≤380 px the toggle is hidden so the full business name fits in the header.
- `.barra-dueno` (sales bar) is `position: fixed` at the top; the header is offset by `--barra-h`. The bar’s height is measured by the final IIFE in `script.js`; keep it in sync. At ≤420 px the vendor name is hidden (`.barra-dueno__vendor`) so the bar stays on one line.
- The mobile nav locks body scroll, closes on Escape, outside click, anchor click and resize >1151 px, and returns focus to the toggle. Keep that behavior; a panel that only closes with the hamburger feels stuck.
- `initFloat()` hides the WhatsApp float when `#reserva` or the footer is visible. That prevents it covering the submit button. Keep the `IntersectionObserver`.
- There are no animated counters: the stats are real strings from the sheet. If you ever add `data-count`, guard `animateCounters()` against elements without the attribute or it will overwrite the text with 0.
- New landing sections: `.trust` (real rating, zone/map, phone), `.emergency` (call/WhatsApp band) and `.confidence` (Google rating + visit details). They replaced the fake testimonial grid; do not bring invented quotes back.
- No comments in code unless they explain non-obvious intent (existing comments are in Spanish).
