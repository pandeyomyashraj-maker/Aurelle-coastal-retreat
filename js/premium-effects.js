(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Keep native touch scrolling; use Lenis inertia for desktop wheel and keyboard scrolling.
  if (!reduceMotion && finePointer && typeof window.Lenis === 'function') {
    const lenis = new window.Lenis({
      autoRaf: false,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.16,
      wheelMultiplier: 1.08,
      anchors: { offset: -90 },
      stopInertiaOnNavigate: true
    });
    window.aurelleLenis = lenis;
    let lenisFrame = 0;
    const wakeLenis = () => {
      if (lenisFrame) return;
      const tick = time => {
        lenisFrame = 0;
        lenis.raf(time);
        if (lenis.isScrolling === 'smooth' && !lenisFrame) lenisFrame = requestAnimationFrame(tick);
      };
      lenisFrame = requestAnimationFrame(tick);
    };
    lenis.on('scroll', () => {
      if (lenis.isScrolling === 'smooth') wakeLenis();
    });
    window.addEventListener('wheel', wakeLenis, { passive: true });
    window.addEventListener('touchmove', wakeLenis, { passive: true });
    window.addEventListener('keydown', event => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) wakeLenis();
    }, { passive: true });
    document.addEventListener('click', event => {
      if (event.target.closest?.('a[href^=\"#\"]')) wakeLenis();
    }, { passive: true });
  }

  // A quiet, fixed light source follows mouse input only; it never intercepts clicks.
  const spotlight = document.getElementById('cursorSpotlight');
  if (spotlight && finePointer && !reduceMotion) {
    let frame = 0;
    let x = -300;
    let y = -300;
    document.addEventListener('pointermove', event => {
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        spotlight.style.transform = `translate3d(${x - 210}px, ${y - 210}px, 0)`;
        spotlight.classList.add('is-active');
        frame = 0;
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => spotlight.classList.remove('is-active'));
  }

  // Tiny magnetic travel, limited to primary calls to action on precise pointers.
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(element => {
      let frame = 0;
      let x = 0;
      let y = 0;
      element.addEventListener('pointermove', event => {
        const rect = element.getBoundingClientRect();
        x = ((event.clientX - rect.left) / rect.width - .5) * 5;
        y = ((event.clientY - rect.top) / rect.height - .5) * 4;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          element.style.setProperty('--magnetic-x', `${x.toFixed(2)}px`);
          element.style.setProperty('--magnetic-y', `${y.toFixed(2)}px`);
          element.classList.add('is-magnetic');
          frame = 0;
        });
      });
      element.addEventListener('pointerleave', () => {
        element.classList.remove('is-magnetic');
        element.style.removeProperty('--magnetic-x');
        element.style.removeProperty('--magnetic-y');
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      });
    });
  }
})();

