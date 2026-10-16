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
  const lowMotion = document.documentElement.dataset.liteMotion === 'true' || window.matchMedia('(max-width: 700px)').matches;

  /* ---- 3/4) Scroll effects share a single rAF scheduler. Read geometry first,
     then write transforms. Touch and save-data devices keep the still image. ---- */
  const fadeEls = lowMotion ? [] : [...document.querySelectorAll('.scroll-fade-scale')];
  const depthEls = !lowMotion && canHoverFine && window.innerWidth > 700
    ? [...document.querySelectorAll('.scroll-depth')]
    : [];
  const scrollEls = [...new Set([...fadeEls, ...depthEls])];
  if (scrollEls.length && 'IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-motion-visible', entry.isIntersecting));
    }, { rootMargin: '120px 0px' });
    scrollEls.forEach(el => visibility.observe(el));
  }
  if (scrollEls.length && window.aurelleScroll) {
    window.aurelleScroll.subscribe(
      () => {
        const vh = window.innerHeight || 1;
        const read = elements => elements.filter(el => el.classList.contains('is-motion-visible')).map(el => {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const progress = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 2)));
          return { el, progress };
        });
        return { fades: read(fadeEls), depths: read(depthEls) };
      },
      state => {
        state.fades.forEach(({ el, progress }) => {
          el.style.setProperty('--fade-scale', (1.07 - Math.abs(progress) * 0.07).toFixed(3));
        });
        state.depths.forEach(({ el, progress }) => {
          el.style.setProperty('--depth-rotate', (progress * -6).toFixed(2) + 'deg');
          el.style.setProperty('--depth-scale', (1 - Math.abs(progress) * 0.03).toFixed(3));
        });
      }
    );
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

})();

