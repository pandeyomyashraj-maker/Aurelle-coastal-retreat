(() => {
  const frame = document.querySelector('.scroll-expand');
  if (!frame || matchMedia('(prefers-reduced-motion: reduce)').matches || !window.aurelleScroll) return;
  const lite = document.documentElement.dataset.liteMotion === 'true';

  window.aurelleScroll.subscribe(
    () => {
      const rect = frame.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (rect.bottom < -80 || rect.top > vh + 80) return null;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height * 0.25)));
      const low = window.matchMedia('(max-width: 700px)').matches || lite;
      const start = low ? 0.96 : 0.92;
      const end = low ? 1.035 : 1.105;
      return {
        scale: (start + (end - start) * progress).toFixed(3),
        corner: Math.max(0, (1 - progress) * (low ? 14 : 18)).toFixed(1)
      };
    },
    state => {
      if (!state) return;
      frame.style.setProperty('--scroll-expansion', state.scale);
      frame.style.setProperty('--scroll-corner', state.corner + 'px');
    }
  );
})();
