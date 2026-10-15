# Cool-3D + device + security update (15 October 2026)

## What was added
- `css/cool-3d.css` + `js/cool-3d.js` — new, isolated module (same pattern as
  `dolphin-interaction.*` / `motion-polish.*`): delete the two files and their
  two `<link>`/`<script>` tags in `index.html` to fully remove this update
  without touching anything else.
  - Pointer-reactive 3D tilt (`.tilt-3d`) on the three "Essentials" cards and
    the three ritual cards, desktop/mouse only (`hover: hover` + `pointer: fine`).
  - A 3D rotate-in scroll reveal (`.reveal-3d`) on every section's big display
    heading. It reuses the existing `.reveal` / `.is-in` toggle already driven
    by `js/main.js` — no new scroll listener was added for this part.
  - A small hero mouse-parallax depth layer, desktop only.
  - A cheap scroll-linked 3D rotate on the suite showcase image, one
    `requestAnimationFrame`-throttled scroll listener, desktop/tablet (>700px) only.
  - `content-visibility:auto` on three long below-the-fold sections on phones,
    to reduce paint cost on low-end devices.
  - Everything above is skipped entirely under `prefers-reduced-motion: reduce`
    and on touch/low-power devices (no `pointer:fine`), so it never fights the
    site's existing accessibility handling.

## Security hardening
- Added a `Content-Security-Policy` and `Referrer-Policy` via `<meta>` tags in
  `index.html` (restricts scripts/styles/images/media/video to this site plus
  the exact Google Fonts / Unsplash / Pexels hosts already in use; blocks
  framing, inline scripts, and plugins).
- Removed the one inline `onload="this.media='all'"` handler (it would have
  been silently blocked by the new CSP) and replaced it with
  `js/font-swap.js`, a tiny external script that does the same font-loading
  trick without any inline JavaScript.
- Added `maxlength` to the enquiry form's name/email/message fields as
  defense-in-depth (the form is still a local demo and sends nothing anywhere).
- Added `_headers` (Netlify's header-config file) so a few things a `<meta>`
  tag cannot set — `X-Frame-Options`, `X-Content-Type-Options`,
  `Strict-Transport-Security`, `Permissions-Policy` — are applied automatically
  **if you deploy on Netlify**. On another host you'd set the same headers in
  that host's own config (Vercel: `vercel.json` → `headers`; Apache:
  `.htaccess`; Nginx: `add_header` in the server block).

## What this does *not* cover
This is still a 100%-static, front-end-only concept site. The enquiry form has
no backend, so there is nothing server-side to secure yet. If/when it's wired
to a real backend: validate everything again server-side (never trust the
browser), add CSRF protection and rate limiting, and serve the whole site over
HTTPS only.

## Follow-up pass (dolphin tone-down + broader scroll motion)
- **Dolphin leap, toned down:** removed the dramatic ±25° rotation and the
  mid-flight scale "pop"; it's now a flatter, near-level glide (±3° rotation,
  ~9vh of vertical travel instead of ~60vh, peak opacity .58 instead of .96,
  smaller on-screen size). Click/tap trigger, direction alternation, local
  WebP asset, and the reduced-motion fallback are unchanged.
- **More scroll motion, still isolated to `css/cool-3d.css` + `js/cool-3d.js`:**
  - `.scroll-fade-scale` — a cheap, all-devices "the image breathes" scroll
    zoom, added to the architecture photo, the location photo, and the water
    section's full-bleed photo.
  - `.scroll-depth` — renamed/generalised from the old suite-only rule (same
    desktop-only 3D rotate, now reusable on any element).
  - `.cinematic-vignette` — a static CSS-only edge-darkening used on the
    location and water-section full-bleed photos for a more premium, cinematic
    read; adds no motion and no network request.
  - The section eyebrow/kicker line (`.section-meta`) now draws itself in with
    a thin brass underline the first time each section scrolls into view —
    reuses the existing reveal system, no new JS.
  - The 3D heading reveal (`.reveal-3d`) now settles in with a very slight
    scale alongside the rotate, for a touch more weight.
