(() => {
  'use strict';
  const stage = document.getElementById('particleImage');
  const canvas = document.getElementById('particleImageCanvas');
  const wordmark = stage?.querySelector('.footer-big');
  const ctx = canvas?.getContext('2d', { alpha: true, desynchronized: true });
  if (!stage || !canvas || !wordmark || !ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sample = document.createElement('canvas');
  const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
  let particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let visible = false;
  let pointer = { x: -9999, y: -9999, vx: 0, vy: 0, active: false };
  let lastFrame = 0;

  function seedParticles() {
    const bounds = stage.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.35);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const scale = 1;
    sample.width = Math.max(1, Math.round(width * scale));
    sample.height = Math.max(1, Math.round(height * scale));
    sampleCtx.clearRect(0, 0, sample.width, sample.height);
    const style = getComputedStyle(wordmark);
    const fontSize = parseFloat(style.fontSize) || 100;
    sampleCtx.fillStyle = '#ffffff';
    sampleCtx.font = `${style.fontWeight} ${fontSize * scale}px ${style.fontFamily}`;
    sampleCtx.textBaseline = 'alphabetic';
    if ('letterSpacing' in sampleCtx) sampleCtx.letterSpacing = style.letterSpacing;
    const baseline = height * .5 + fontSize * .35;
    let cursorX = 0;
    const spacing = parseFloat(style.letterSpacing) || 0;
    for (const letter of wordmark.textContent.trim()) {
      sampleCtx.fillText(letter, cursorX, baseline);
      cursorX += sampleCtx.measureText(letter).width + spacing;
    }

    const pixels = sampleCtx.getImageData(0, 0, sample.width, sample.height).data;
    const step = Math.max(2, Math.round(sample.width > 900 ? 2.5 : 2));
    const targets = [];
    for (let y = 0; y < sample.height; y += step) {
      for (let x = 0; x < sample.width; x += step) {
        if (pixels[(y * sample.width + x) * 4 + 3] > 55) {
          targets.push({ x: x / scale, y: y / scale, alpha: pixels[(y * sample.width + x) * 4 + 3] / 255 });
        }
      }
    }

    const maximum = width < 600 ? 2600 : 9000;
    const stride = Math.max(1, Math.ceil(targets.length / maximum));
    particles = targets.filter((_, i) => i % stride === 0).map(point => {
      const scatter = reduceMotion ? 0 : (Math.random() - .5) * 18;
      return { tx: point.x, ty: point.y, x: point.x + scatter, y: point.y + scatter, vx: 0, vy: 0, size: .7 + point.alpha * 1.3, phase: Math.random() * Math.PI * 2 };
    });
    draw(0, true);
  }

  function draw(time, still = false) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ddc9a7';
    const radius = width < 600 ? 82 : 112;
    for (const particle of particles) {
      const drift = still || reduceMotion ? 0 : Math.sin(time * .00055 + particle.phase) * .28;
      const tx = particle.tx + drift;
      const ty = particle.ty + drift * .55;
      const dx = tx - particle.x;
      const dy = ty - particle.y;
      particle.vx += dx * .014;
      particle.vy += dy * .014;

      if (!still && !reduceMotion && pointer.active) {
        const px = particle.x - pointer.x;
        const py = particle.y - pointer.y;
        const distance = Math.hypot(px, py) || 1;
        if (distance < radius) {
          const falloff = 1 - distance / radius;
          const swirl = .035 * falloff;
          const push = .075 * falloff + Math.min(.22, (Math.abs(pointer.vx) + Math.abs(pointer.vy)) * .0015) * falloff;
          particle.vx += (px / distance + -py / distance * swirl) * push;
          particle.vy += (py / distance + px / distance * swirl) * push;
        }
      }

      particle.vx *= .88;
      particle.vy *= .88;
      particle.x += particle.vx;
      particle.y += particle.vy;
      ctx.globalAlpha = .52 + Math.min(.34, Math.hypot(particle.vx, particle.vy) * .18);
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
  }

  function tick(time) {
    raf = 0;
    if (!visible || document.hidden) return;
    if (time - lastFrame < 32) { raf = requestAnimationFrame(tick); return; }
    lastFrame = time;
    draw(time);
    if (!reduceMotion) raf = requestAnimationFrame(tick);
  }

  function wake() {
    if (visible && !document.hidden && !raf && !reduceMotion) raf = requestAnimationFrame(tick);
    else if (visible && reduceMotion) draw(0, true);
  }

  stage.addEventListener('pointermove', event => {
    const bounds = stage.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    pointer.vx = pointer.active ? x - pointer.x : 0;
    pointer.vy = pointer.active ? y - pointer.y : 0;
    pointer.x = x;
    pointer.y = y;
    pointer.active = !reduceMotion;
    if (!raf && !reduceMotion) raf = requestAnimationFrame(tick);
  }, { passive: true });

  stage.addEventListener('pointerleave', () => {
    pointer.active = false;
    pointer.vx = 0;
    pointer.vy = 0;
  }, { passive: true });

  document.addEventListener('visibilitychange', wake);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) wake();
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: '100px' }).observe(stage);
  } else {
    visible = true;
    wake();
  }

  if ('ResizeObserver' in window) new ResizeObserver(() => { seedParticles(); wake(); }).observe(stage);
  else window.addEventListener('resize', seedParticles, { passive: true });
  if (document.fonts?.ready) document.fonts.ready.then(seedParticles);
  seedParticles();
})();
