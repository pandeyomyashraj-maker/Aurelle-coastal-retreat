# AURELLE performance optimization guide

This site is currently a static HTML/CSS/vanilla-JavaScript deployment, not a Next.js/React/Tailwind app. The changes below use the code that is actually shipped. Next.js equivalents are included where the migration path matters. No Lighthouse score can be guaranteed: the result changes with the test device, network, browser, and third-party image CDN.

## Step 1 — Share one frame scheduler for scroll work

**Problem:** independent scroll callbacks can run more often than paint, interleave geometry reads with style writes, and animate offscreen sections.

**Before**

```js
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelectorAll('.reveal').forEach(el => {
    const top = el.getBoundingClientRect().top; // read for every element
    el.style.transform = `translateY(${Math.max(0, top - y)}px)`; // write
  });
});
```

**After (implemented in `js/scroll-scheduler.js`)**

```js
const jobs = new Set();
let frame = 0;
function flush() {
  frame = 0;
  const snapshots = [...jobs].map(job => [job, job.read()]); // all reads first
  snapshots.forEach(([job, value]) => job.write(value));    // then writes
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(flush);
}
window.addEventListener('scroll', schedule, { passive: true });
window.aurelleScroll.subscribe(read, write);
```

Reveal sections use `IntersectionObserver`; transform/opacity transitions run only when a section enters view. Continuous parallax and cursor work is skipped on small/low-memory or save-data devices. For a generic throttled callback, prefer one pending `requestAnimationFrame` over a timer-based debounce: a debounce waits until scrolling stops and makes progress indicators feel delayed.

**Why:** a single scheduled frame caps work at paint cadence, passive input handlers do not block scrolling, and read-then-write batching avoids forced synchronous layout. This reduces the opportunity for long tasks; measure TBT and dropped frames after.

## Step 2 — Keep drag-reveal geometry out of pointer handlers

**Problem:** reading `getBoundingClientRect()` and writing a mask on every `pointermove` can force layout repeatedly.

**Before**

```js
frame.addEventListener('pointermove', e => {
  const r = frame.getBoundingClientRect();
  frame.style.setProperty('--x', `${(e.clientX - r.left) / r.width * 100}%`);
});
```

**After (implemented in `js/glass-reveal.js`)**

```js
let rectDirty = true, rect, pointer, raf = 0;
function onMove(e) {
  pointer = { x: e.clientX, y: e.clientY };
  if (!raf) raf = requestAnimationFrame(paint);
}
function paint() {
  raf = 0;
  if (rectDirty) { rect = frame.getBoundingClientRect(); rectDirty = false; }
  if (!pointer) return;
  const x = Math.max(8, Math.min(92, (pointer.x - rect.left) / rect.width * 100));
  frame.style.setProperty('--lens-x', `${x}%`);
  frame.style.setProperty('--lens-shift-x', `${rect.width * (x / 100 - .5)}px`);
}
frame.addEventListener('pointermove', onMove, { passive: true });
new ResizeObserver(() => { rectDirty = true; }).observe(frame);
```

Pointer callbacks now only retain the latest coordinates; geometry is cached and invalidated on resize/scroll, and one frame paints the reveal. The lens uses `translate3d`; `will-change` is scoped to the moving lens, not the whole page. Keep the range input for keyboard/touch access and do not use `pointer-events:none` on the control itself.

**Why:** coalescing many pointer events into one paint reduces script and style recalculation. Transform and mask updates avoid changing layout dimensions. Verify that the reveal still tracks smoothly and that the keyboard range remains operable.

## Step 3 — Load concierge and section modules only when needed

**Problem:** loading assistant, pet, and interaction code at page start costs parse/compile time before a guest uses them.

**Before**

```html
<script src="js/aurelle-assistant.js" defer></script>
<script src="js/concierge-pet.js" defer></script>
```

**After (implemented in `js/concierge-loader.js`)**

```js
let load;
function warmConcierge() {
  return load ||= Promise.all([
    import('./aurelle-assistant.js'),
    import('./concierge-pet.js'),
    import('./concierge-interactions.js')
  ]);
}
launcher.addEventListener('pointerenter', warmConcierge, { once: true, passive: true });
launcher.addEventListener('focusin', warmConcierge, { once: true });
```

The click path loads the code on first activation and opens the widget when ready. The `IntersectionObserver` in `js/feature-loader.js` imports image, reveal, enquiry, and after-hours modules when their section is within a 480px margin. Its fallback imports modules on browsers without `IntersectionObserver`.

**Why:** less JS is parsed on initial load, reducing startup work and helping TBT. Do not preload every section module: that defeats the split. A Next.js migration could use `dynamic(() => import('./Concierge'), { ssr: false })` and render only after user intent.

## Step 4 — Prioritize the real hero image and right-size all others

**Problem:** an oversized or late hero competes with noncritical images for bandwidth and delays LCP.

**Before**

```html
<img src="https://images.unsplash.com/...?...&w=2400" loading="lazy">
```

**After:** the page now has viewport-specific responsive image preloads in `index.html`; the actual hero poster uses matching `srcset`/`sizes`, `fetchpriority="high"`, `loading="eager"`, dimensions, and async decoding. Keep those preload candidates aligned with the image source to avoid downloading two variants. Below-the-fold images should use `loading="lazy"` and suitable widths.

For images you host yourself:

```html
<picture>
  <source type="image/avif" srcset="/images/coast-640.avif 640w, /images/coast-1280.avif 1280w" sizes="100vw">
  <source type="image/webp" srcset="/images/coast-640.webp 640w, /images/coast-1280.webp 1280w" sizes="100vw">
  <img src="/images/coast-1280.jpg" width="1600" height="900" alt="Coastline at dusk" loading="lazy" decoding="async">
</picture>
```

Convert source originals offline with `npx sharp-cli -i public/images/*.jpg -o public/images/avif -f avif` or `cwebp -q 78 input.jpg -o output.webp`; review visual quality and file size before replacing assets. Unsplash's `auto=format` can negotiate a modern format, but external CDN behavior and cache are outside this repo's control. Next.js migration: use `<Image src="/hero.avif" alt="..." fill priority sizes="100vw" />`; do not lazy-load the LCP image.

**Why:** responsive candidates avoid sending a 2,400px image to a phone; high-priority preload starts the likely LCP request early. The reported user LCP was 1.3s; a local mobile run measured 4.47s, so mobile LCP needs repeated verification under the same emulation.

## Step 5 — Preserve critical CSS and reduce animation paint cost

**Problem:** deferring all styles can cause an unstyled flash, while broad `will-change` creates excess compositor layers.

**Before**

```css
* { will-change: transform, opacity; }
```

**After:** keep `css/style.css` render-blocking because it defines the first viewport. Fonts already load optionally. Scroll progress uses `transform: scaleX()` rather than changing width, and motion classes add `will-change` only while visible. The site has a strict CSP (`style-src 'self'`), so inline critical CSS would require an approved nonce/hash or CSP update; do not weaken the policy or inject inline style attributes. If you later split styles, extract only demonstrably noncritical CSS and retain a no-flash fallback.

If a React version uses Framer Motion, prefer `transform`/`opacity`, avoid animating `layout` across large trees, and apply `will-change` only immediately before a transition. GSAP is not used here; if introduced, dynamically import only the plugin/feature that needs it rather than adding it to the initial page bundle.

**Why:** transform/opacity generally avoid layout and limit repaint; selective layer promotion prevents memory and compositing overhead.

## Step 6 — Keep enquiry validation native and lazy

**Problem:** a large validation package adds startup JS for a form below the fold.

**Before**

```html
<script src="/js/validation-library.js" defer></script>
```

**After:** `js/form-enhancements.js` is dynamically imported when `#stayForm` approaches the viewport. The form uses native inputs and small submit-time checks; no validation library or per-keystroke handler is needed. If live feedback is added, debounce expensive remote checks (never basic required/email validation), cancel stale requests, and announce errors accessibly.

```js
const observer = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    observer.disconnect();
    import('./form-enhancements.js');
  }
}, { rootMargin: '480px' });
observer.observe(document.querySelector('#stayForm'));
```

**Why:** the enquiry module doesn't compete with hero rendering and avoids shipping a dependency for a few local checks.

## Step 7 — Audit the real bundle and deployment

This repository has no `package.json` or React build; there are no npm dependencies to tree-shake. Lenis is vendored in `js/vendor/lenis.min.js`. Its RAF is now demand-driven and stops after the scroll settles. The remote Pexels video was removed from the initial page request after Lighthouse detected third-party Cloudflare cookies; the local responsive ocean still remains as the background. Vercel serves static assets and applies transport compression; adding a build/minifier step is not automatically beneficial. Check browser Network transfer sizes and remove only files confirmed unused by page references. Keep secrets such as `.env.local` out of uploads and Git.

## Step 8 — Repeatable measurement

Run Lighthouse against the production URL from a clean browser state (one mobile and one desktop run, then repeat to understand variance). The production audits in this guide used Lighthouse 13.5.0 and the same Chrome runner for the before/after pair:

```powershell
npx lighthouse https://aurelle-coastal-retreat.vercel.app/ --only-categories=performance --output=json --output-path=./mobile-report.json
npx lighthouse https://aurelle-coastal-retreat.vercel.app/ --preset=desktop --only-categories=performance --output=json --output-path=./desktop-report.json
```

For readable output add `--view`; for comparable local CLI runs use the same Lighthouse version, Chrome, flags, network, CPU throttling, and device profile before and after. Open DevTools Performance, record a page load and a scroll/drag interaction, and inspect Long Tasks, scripting, forced reflow, frames, and image requests. Use Network throttling (Slow 4G) and CPU slowdown on a real phone; Chrome's desktop mobile emulation is not a substitute for field data. Scroll jank is best checked in the Performance frame track and with dropped-frame indicators, not inferred from TBT alone. TBT measures blocking during load; it is not a 60fps score.

### Baseline and interpretation

| Source | Mobile Performance / LCP / TBT | Desktop Performance / LCP / TBT |
|---|---|---|
| User-reported baseline | 90 / 1.3s / 180ms | 86 / 1.3s / 270ms |
| Lighthouse before change (single CLI run) | 75 / 4.47s / 6ms | 94 / 1.27s / 0ms |
| Production after change (one sequential run) | 79 / 4.30s / 0ms | 93 / 1.31s / 0ms |
| Final all-category audit after deployment | 76 / 4.31s / 0ms | 85 / 1.69s / 0ms |

The user-reported baseline (90 mobile, 86 desktop; TBT 180/270ms) is separate from the CLI runner's baseline. On the sequential performance-only pair, mobile moved 75→79 with LCP 4.47→4.30s and TBT 6→0ms; desktop moved 94→93 with LCP 1.27→1.31s and TBT 0→0ms. The final all-category audits scored mobile A11y/BP/SEO at 100/100/100 and desktop at 100/100/100. Performance was 76 mobile and 85 desktop on those full audits. The runner varies: a concurrent run scored mobile 56/TBT 603ms, and the final mobile LCP breakdown named the small concierge label as its LCP element with 2.2s render delay. So a repeated Lighthouse run and field data are still needed. Scores remain below 100 and the mobile LCP is far above the 1s aspiration in this runner. The CLI baseline did not reproduce the user-reported 270ms desktop TBT; do not present a promised 100 as achieved.

## Ship checklist

- [ ] Check JS syntax and load each lazy module by visiting/activating its section.
- [ ] Run mobile and desktop Lighthouse with matching browser/profile settings; record score, LCP, TBT, CLS.
- [ ] Confirm the hero is the LCP request, the preload matches its selected `srcset`, and below-fold images are lazy.
- [ ] In DevTools Performance, verify scroll and pointer interactions do not cause long tasks or forced layouts; inspect frame drops.
- [ ] Test Slow 4G/CPU throttling and a physical phone; verify reduced-motion and keyboard-accessible slider/chat behavior.
- [ ] Run all Lighthouse categories and confirm Accessibility, Best Practices, and SEO remain at 100 before claiming that result.
