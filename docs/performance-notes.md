# AURELLE performance pass

Changes were chosen from the supplied Lighthouse report (Performance 24, Accessibility 97, Best Practices 100, SEO 100):

- LCP was 7.4s and image delivery savings were estimated at 1,863 KiB, so image URLs now request smaller responsive candidates, the hero is preloaded, and all image decoding is asynchronous.
- Render-blocking savings were estimated at 1,890ms, so Google Fonts now loads asynchronously with `display=optional`. The primary stylesheet remains render-blocking intentionally to avoid a flash of unstyled content and a potentially worse CLS score.
- CLS was 0.407, so image dimensions are declared and late font swapping is reduced. The actual CLS breakdown still needs a fresh Lighthouse trace; dimensions/font changes are mitigations, not proof of the specific culprit.
- TBT was 1,270ms, so the hero animation no longer animates filters/clip-path and the rain canvas renders at a lower pixel ratio and lower maximum frame rate.
- Contrast warnings were reported; small-label colours on light surfaces were darkened. Re-run Lighthouse to determine if any individual text node still fails.

No Lighthouse result is included because this environment has not run a valid full Lighthouse audit on this package.


The attempted browser session in this environment was blocked by the browser policy (`ERR_BLOCKED_BY_ADMINISTRATOR`), so no new Lighthouse score or visual-browser pass is claimed.


## Final video-background performance notes
The 2160×3840 / 60fps Pexels clip is high-bitrate and portrait-oriented. The site now does not request it until the main page has loaded and the browser reaches idle, and skips it for phones/tablets, reduced-motion preference, data-saver mode, slow network, low memory, or low CPU count. The bundled SVG logo does not require another external request. Static photography uses responsive candidates through 1920w for high-density screens. These are source-level optimizations; verify real LCP/CLS/TBT and actual media transfer on the deployed origin.


## Click-triggered dolphin animation
The dolphin is bundled as a local transparent WebP asset (~190 KB), so it does not add a third-party request. It animates only after a click/tap rather than continuously; the JavaScript alternates travel direction, ignores interactive controls, and provides a reduced-motion fallback. CSS uses transform/opacity for movement; validate frame pacing on target devices after deployment.
