# AURELLE — A Private World Apart

> **15 Oct 2026 update:** the click-triggered dolphin animation described below
> (`## Click-triggered dolphin leap`) has been **removed** at the user's
> request — `css/dolphin-interaction.css`, `js/dolphin-interaction.js` and
> `assets/dolphin-leap.webp` are deleted, and the `<link>`/`<script>` tags and
> the "MAKE A SPLASH" button are gone from `index.html`. The section below is
> left as a historical record of what was built and removed.

A single-page luxury boutique-hotel website concept built with HTML, CSS, and vanilla JavaScript. No npm install or framework build is required.

## Run on Windows

1. Extract the project folder.
2. Install/confirm Python 3 if needed.
3. Double-click `run-local.bat`.
4. Your browser should open `http://127.0.0.1:5187/`.
5. Keep the terminal window open while browsing.

You can also open `index.html` directly in Chrome/Edge, although running a local server is recommended.

## What's included

- Premium editorial layout with warm ivory, forest, limestone and brass palette.
- Cinematic full-screen hero and scroll progress indicator.
- Responsive navigation and accessible mobile overlay.
- Scroll reveals, image parallax on mouse-capable desktops, and reduced-motion support.
- Polished hero entrance: masked photographic reveal, restrained warm light sweep, staggered headline word animation, and desktop pointer/scroll depth movement.
- Stronger site-wide typography: slightly larger body copy and interface labels, increased text weight, and clearer form controls.
- Suite selector with synchronized image, copy, size/view labels, previous/next controls, and keyboard navigation.
- New half-screen visual journal gallery: five scroll-synced stories, image/copy cross-fades, progress dots as indicators, keyboard-readable status, and mobile scroll support.
- Three essentials panels for connectivity, peace of mind, and arrival.
- Seamless looping SVG wave field made from a lightweight vector tile (no generated/raster background image).
- Optional rain-on-glass canvas atmosphere with two layers of rain streaks and water ripples; it only animates while the section is in view and the document is visible. Use “Still the rain” to pause it.
- Subtle click feedback rings, contextual cursor labels, and a small magnetic booking CTA effect on mouse devices.
- Enquiry form with date/name/email validation and an explicit local-demo confirmation (no data is sent/stored).
- Responsive adjustments for phones/tablets, accessible focus styles, and keyboard/touch alternatives for hover interactions.

## Important concept notes

AURELLE, Cap Nova, its location coordinates, the hotel, suite names, room sizes, and services are fictional concept content. Photos are remote Unsplash-hosted assets; internet access is required for them to load. The project references specific image URLs and does not redistribute photo files. Check the source page's current terms/licence before commercial launch or submission that requires locally bundled assets. The enquiry form is a front-end demo and does not send a real booking request.

## Useful files

- `index.html` — content and section structure
- `css/style.css` — design system, layout, responsive rules, animation
- `js/main.js` — suite/gallery controls, navigation, form validation, cursor/click/rain interactions
- `assets/wave-tile.svg` — seamless vector wave pattern
- `run-local.bat` — local preview launcher for Windows

## Verification completed in this environment

- JavaScript parse check (`node --check`).
- Static HTML ID/hash-target checks.
- Local static server HTTP response check.
- ZIP integrity check.

The sandbox browser runner blocked local preview navigation, so the screenshots and interactive browser session could not be inspected here. Full manual review on physical phones and an actual Lighthouse score were not available here. Do not claim a 100 Lighthouse score without running Lighthouse on the submitted build.


## Latest update — scroll-driven gallery and guest security
- The visual journal is now driven by vertical scroll through a sticky split-screen stage; the previous/next arrow buttons have been removed. Progress dots are indicators, not controls.
- A dedicated “Peace of mind” section describes concept security layers including bodyguard/close-protection arrangements on request, guest-access controls, private arrivals, and guest support. These are fictional illustrative features, not verified real-world hotel services.
- The security image is a Pexels stock photo and loads remotely; internet is required.


## Hero and typography polish
- The hero photo reveals with a short clip-path/scale animation and one soft warm light sweep.
- The main headline reveals one line at a time. A small mouse parallax is enabled only on hover-capable, non-reduced-motion devices.
- Paragraphs and interface labels are slightly larger and use a stronger weight for readability.
- `prefers-reduced-motion: reduce` disables the hero motion and exposes the final visual state.


## Guestbook / review preview
- Added a responsive three-card review section before the enquiry form and added a Guestbook anchor to desktop/mobile navigation.
- The names supplied for the layout (Mr. Anant Ambani, Yogi Adityanath, and Rounie) are shown as unverified placeholders. No testimonial wording is attributed to them. Replace with genuine, approved quotes only after verifying identity, guest status, and permission. The Yogi Adityanath designation was not asserted in the page; confirm any current title before use.
- Each card includes a visible “Quote pending” status and the page states that the listed names do not imply a stay or endorsement.


## Competition polish update (14 October 2026)
- Added the **Your Rhythm** personalised stay composer (Stillness / Discovery / Restore), with accessible selected states and a working action that pre-fills the local demo enquiry message.
- Rebuilt the guestbook with three original quote examples attributed to fictional personas. The large introductory disclosure block was removed from the visible section at the user's request; individual cards retain compact sample-copy / not-a-real-review labels. No fabricated statements are attributed to public figures.
- Added `docs/research.md` describing competitor patterns reviewed and why selected ideas were applied.
- Added `docs/identity-verification.md` to document what public identity checks do—and do not—confirm about names previously requested.
- Renumbered the later sections for a clearer narrative sequence.

## Competitive design research
See `docs/research.md` for official hotel-website award references and the interaction patterns used in this concept. The added personal itinerary composer gives visitors a useful way to preview a stay rhythm and can prefill the local enquiry demo.


## Lighthouse performance pass (14 October 2026)
- Resized remote photo URLs and added responsive image candidates for static photos.
- Added high-priority preload and responsive candidates for the hero image.
- Added intrinsic width/height attributes and async decoding to images.
- Changed Google Fonts to non-blocking loading with `font-display=optional` to reduce render blocking and layout shifts.
- Kept the main stylesheet render-blocking so the complete layout is styled before first paint; Google Fonts now loads asynchronously instead.
- Replaced the hero photo's clip-path/filter animation with transform/opacity motion and changed the light sweep to transform-based movement.
- Lowered the rain canvas backing-store pixel ratio and limited its refresh to about 25 FPS while retaining the effect.
- Darkened small secondary text colours on light surfaces to address the reported contrast warnings.

### Retest instructions
Run `run-local.bat`, open the site at `http://127.0.0.1:5185/`, then run Lighthouse again in a fresh incognito window or clear site data first. Compare the actual scores and the new LCP/TBT/CLS traces. Expected improvements are reductions in image transfer, render blocking, and font-related layout shift, but the exact score must be measured on the submission environment.


## Lighthouse follow-up optimization
- Hero photo: responsive `srcset` (720/1400px), high-priority preload, smaller requested source.
- Other hotel photos: responsive candidates for static sections and reduced pixel sizes/quality; dynamically selected suite/gallery assets are also smaller.
- All images now declare intrinsic width/height and async decoding.
- Google Fonts uses non-blocking `media=print` loading and `display=optional`; the main CSS remains render-blocking so the full layout is styled before first paint and avoids a flash/layout shift.
- The readable `css/style.css` remains the production stylesheet; no risky custom minification is applied.
- The full-viewport hero no longer animates `clip-path` or `filter`; light sweep uses transform/opacity.
- Rain canvas allocation is delayed until its section nears the viewport; rendering remains capped around 25 FPS with lower backing-store DPR.
- Muted text colours were darkened to address the contrast warning in the provided Lighthouse report.

After replacing the previous folder, stop the old local server and run `run-local.bat` from this folder. Then run a fresh mobile Lighthouse audit and compare LCP, TBT, CLS, and the contrast audit. Actual scores must be measured; no score is guaranteed by source changes alone.

## Motion polish update (14 October 2026)

- Added an active chapter underline to desktop/mobile navigation using `IntersectionObserver` rather than an additional scroll-event loop.
- Section metadata reveals a short brass rule; selected display headings draw a fine underline as they enter view.
- Added one restrained, transform-based light sweep on selected photographs for mouse-capable devices.
- Added subtle photo scale-settle motion when suite/ritual/architecture/security imagery approaches the viewport.
- Suite and “Your Rhythm” content changes now use short text transitions; the itinerary timeline items enter with a small stagger.
- Added subtle icon/card micro-interactions and a slow breathing status light.
- All new motion has `prefers-reduced-motion` handling and avoids adding an animation library.
- New CSS and JavaScript are isolated in `css/motion-polish.css` and `js/motion-polish.js` for easier auditing or removal.

The browser automation runner in this environment returned `ERR_BLOCKED_BY_ADMINISTRATOR` when trying to open localhost, so this update has not been visually browser-tested here. Syntax and static checks are run separately; a local real-browser and Lighthouse retest is still recommended before submission.

Run this version using `run-local.bat`, which opens `http://127.0.0.1:5187/` to avoid confusion with earlier versions.


## Ocean sunset + glass manifesto update

The full-site backdrop now uses a responsive sunset still from Pexels, with the supplied Pexels ocean-sunset video fading in over it on desktop when playback can start. The poster remains visible if the video is skipped or fails. The manifesto uses a translucent glass treatment; the decorative artificial SVG wave layers are disabled/removed from its visual output.

- Video source: https://www.pexels.com/video/stunning-ocean-sunset-with-vibrant-skies-29045880/ (vertical 2160×3840, 60 FPS source).
- Static fallback photo: “Waves of an Ocean During Sunset” by Kien Virak, Pexels: https://www.pexels.com/photo/waves-of-an-ocean-during-sunset-4826675/
- External photos, fonts and desktop video need internet access. The video is deferred and skipped on mobile/tablet, reduced-motion, data-saver, slow-network, low-memory and low-CPU conditions.
- The hero photo is removed so it does not download invisibly while the sunset backdrop is shown. Content photography remains separate and lazy-loaded where appropriate.

## Final polish edition (responsive + performance)
- Added a bespoke, local SVG AURELLE emblem used in the navigation, footer, and favicon. `assets/aurelle-logo.svg` is the standalone horizontal brand lockup.
- Removed the hidden hero photo preload that was downloading an image no longer displayed behind the video.
- The Pexels video is requested only after the page load / idle window on desktop screens, and only when reduced motion, data saver, slow-network, low-memory and low-CPU checks allow it. Phones/tablets keep the still poster instead of automatically downloading the 4K/60fps vertical source. The video pauses while the browser tab is hidden.
- Added 1920w image candidates for existing remote photo sets and responsive candidates for the changing suite/gallery images, supporting high-DPI and 4K logical viewports while keeping smaller candidates available.
- Removed large-area backdrop blur filters from scrolling content surfaces. The central manifesto retains a restrained glass effect; full-width sections rely on transparent fills for smoother scrolling.
- `prefers-reduced-motion` continues to disable background video and nonessential motion.

The page’s external photography and web fonts require internet access. The desktop video is optional and may be skipped for performance or accessibility reasons. Performance depends on the device, network and hosting target; run Lighthouse on the deployed version for measured scores.

- Added a responsive Pexels sunset still as the always-available background. It uses a smaller image candidate on phones and up to 2560px on larger displays; the cinematic video fades over it only when playback starts successfully.

## Local verification note
The final package passes JavaScript syntax checks, HTML parsing, CSS parsing, local-reference checks and ZIP integrity checks. Automated browser navigation was blocked by the environment policy in this workspace, so a visual Playwright/Lighthouse run was not confirmed here. Before public launch, open the site with `run-local.bat`, check mobile/tablet/desktop layouts and run Lighthouse in the target browser.


## Click-triggered dolphin leap
- A local, alpha-transparent WebP dolphin cutout is animated across the ocean background when the visitor clicks/taps a non-interactive page area. It alternates left-to-right and right-to-left on successive activations.
- The manifesto includes a small `MAKE A SPLASH` button for discoverability. Links, navigation, form controls, and other buttons are excluded from the page-wide click trigger, so existing controls still work normally.
- The animation is implemented in `css/dolphin-interaction.css` and `js/dolphin-interaction.js` without a third-party animation library or remote dolphin asset. The compact image is `assets/dolphin-leap.webp` (transparent WebP, about 190 KB).
- On `prefers-reduced-motion`, the dolphin appears briefly in a fixed position instead of travelling across the screen. Mobile/tablet layouts use a smaller dolphin; the animation is click/tap triggered rather than continuously running.

## Premium interaction pass (v14)

- Smooth desktop wheel scrolling uses a locally bundled Lenis build; touch scrolling stays native, and Lenis is skipped when reduced motion is enabled.
- A small CSS bokeh field adds low-key ambient motion. It is simplified on touch devices and removed for reduced-motion preferences.
- The existing contextual cursor aura is complemented by a subtle pointer spotlight on precise-pointer devices.
- Primary calls to action use a restrained magnetic response on mouse devices.
- Lenis is bundled locally under `js/vendor/` to remain compatible with the site's self-only Content Security Policy. Its license is included beside the bundle.

Motion effects are progressive enhancements. They do not guarantee a particular Lighthouse score; measure the deployed build on representative devices and network conditions.

## Version 15 click wow
Ripple press feedback, pearl sparkle particles, and booking focus glow added.

## Version 16 cinematic cute pass
Added playful hero sticker, coral accents, film grain, and soft pointer flare for a youthful editorial mood.

## Version 17 blossom rose pass
Removed hero sticker; added cherry blossom corner ornaments, rose cursor halo, and responsive petal styling.

## Version 18 Aurelle assistant
Added a pink floating Assistant of Aurelle with a hello message and quick suite/booking actions.

## Version 19 name update
Renamed the pink helper to Aurelle Concierge while preserving the same behavior and styling.

## Version 20 animated concierge pet
Added a pink animated character with blinking, bobbing, waving, glowing antenna, and pointer/touch drag movement.

## Version 21 character refinement
Refined the pet silhouette to match the supplied rounded visor robot reference while keeping the Aurelle pink palette.

## Version 22 antenna cleanup
Removed the small top antenna from the animated concierge character.

## Version 23 robot launcher
Removed the separate pink launcher pill. The animated robot opens the concierge panel and waves when clicked.

## Version 24 final experience
Added preset interactive concierge answers, mood/guest based suite recommendations, a four-stop judge tour, and low-memory/data-saver reduction for ambient effects. All assistant behavior is local; the concept enquiry form remains non-transmitting.

## Version 25 scroll-expand polish
Added a scroll-linked frame expansion to the main coastal image, based on the public React Bits Scroll Expand concept. It uses one requestAnimationFrame-throttled transform and disables itself for reduced-motion users.
