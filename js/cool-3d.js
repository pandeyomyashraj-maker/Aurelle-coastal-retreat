/* ============================================================
   cool-3d.js — pointer tilt + hero/scroll 3D depth.
   Isolated module (safe to delete with its <script> tag + css/cool-3d.css).
   Does not read or write any state owned by main.js / motion-polish.js.
   ============================================================ */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 0) Curtain reveal — runs regardless of reduced-motion so it never gets
     stuck on screen; under reduced motion it's just removed instantly, no fade. ---- */
  const curtain = document.getElementById('curtainReveal');
  if (curtain) {
    if (reduceMotion) {
      curtain.remove();
    } else {
      // small fixed delay (not tied to network/image load, which can vary a lot)
      // so the reveal always feels snappy instead of occasionally hanging.
      setTimeout(() => {
        curtain.classList.add('is-hidden');
        curtain.addEventListener('transitionend', () => curtain.remove(), { once: true });
      }, 260);
    }
  }

  if (reduceMotion) return; // accessibility: skip all other JS-driven motion entirely

  const canHoverFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- 3) Scroll-linked cinematic zoom (.scroll-fade-scale) — runs on every device,
     touch included, since it's just an opacity-free scale and is cheap even on
     low-end phones. One shared rAF-throttled scroll listener for every tracked element. ---- */
  const fadeEls = document.querySelectorAll('.scroll-fade-scale');
  if (fadeEls.length) {
    let fadeTicking = false;
    const updateFade = () => {
      fadeTicking = false;
      const vh = window.innerHeight || 1;
      fadeEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return; // off-screen: skip the write
        const center = rect.top + rect.height / 2;
        const progress = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 2)));
        el.style.setProperty('--fade-scale', (1.07 - Math.abs(progress) * 0.07).toFixed(3));
      });
    };
    window.addEventListener('scroll', () => {
      if (!fadeTicking) { fadeTicking = true; requestAnimationFrame(updateFade); }
    }, { passive: true });
    updateFade();
  }

  if (!canHoverFine) return; // the rest (tilt, hero parallax, 3D rotateY depth) is mouse/desktop only

  const MAX_TILT = 8; // degrees — kept small so the effect reads as "premium", not gimmicky

  /* ---- 1) Pointer tilt on cards ---- */
  const tiltEls = document.querySelectorAll('.tilt-3d');
  tiltEls.forEach(el => {
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;  // 0..1
        const py = (e.clientY - rect.top) / rect.height;  // 0..1
        const rotY = (px - 0.5) * (MAX_TILT * 2);
        const rotX = (0.5 - py) * (MAX_TILT * 2);
        el.style.setProperty('--tilt-x', rotX.toFixed(2) + 'deg');
        el.style.setProperty('--tilt-y', rotY.toFixed(2) + 'deg');
        el.style.setProperty('--tilt-shine', (px * 100).toFixed(1) + '% ' + (py * 100).toFixed(1) + '%');
      });
    };
    el.addEventListener('pointerenter', () => el.classList.add('is-tilting'));
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', () => {
      el.classList.remove('is-tilting');
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    });
  });

  /* ---- 2) Hero mouse-parallax depth ---- */
  const hero = document.querySelector('.hero');
  if (hero) {
    let heroRaf = 0;
    hero.addEventListener('pointermove', (e) => {
      if (heroRaf) return;
      heroRaf = requestAnimationFrame(() => {
        heroRaf = 0;
        const rect = hero.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        hero.style.setProperty('--hero-tilt-x', (px * 18).toFixed(2) + 'px');
        hero.style.setProperty('--hero-tilt-y', (py * 12).toFixed(2) + 'px');
      });
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--hero-tilt-x', '0px');
      hero.style.setProperty('--hero-tilt-y', '0px');
    });
  }

  /* ---- 4) Scroll-linked 3D rotate on every .scroll-depth element (desktop/mouse only) ---- */
  const depthEls = document.querySelectorAll('.scroll-depth');
  if (depthEls.length && window.innerWidth > 700) {
    let depthTicking = false;
    const updateDepth = () => {
      depthTicking = false;
      const vh = window.innerHeight || 1;
      depthEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const center = rect.top + rect.height / 2;
        const progress = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 2)));
        el.style.setProperty('--depth-rotate', (progress * -6).toFixed(2) + 'deg');
        el.style.setProperty('--depth-scale', (1 - Math.abs(progress) * 0.03).toFixed(3));
      });
    };
    window.addEventListener('scroll', () => {
      if (!depthTicking) { depthTicking = true; requestAnimationFrame(updateDepth); }
    }, { passive: true });
    updateDepth();
  }
})();

