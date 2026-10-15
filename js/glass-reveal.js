(() => {
  'use strict';
  const frame = document.getElementById('glassRevealFrame');
  const range = document.getElementById('glassRevealRange');
  if (!frame || !range) return;

  const positionLabel = document.getElementById('glassRevealPosition');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let targetX = 50;
  let targetY = 50;
  let currentX = 50;
  let currentY = 50;
  let frameId = 0;

  function paint() {
    frameId = 0;
    if (!reducedMotion) {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
    } else {
      currentX = targetX;
      currentY = targetY;
    }
    frame.style.setProperty('--lens-x', `${currentX.toFixed(2)}%`);
    frame.style.setProperty('--lens-y', `${currentY.toFixed(2)}%`);
    if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.1) frameId = requestAnimationFrame(paint);
  }

  function move(x, y) {
    targetX = Math.max(8, Math.min(92, x));
    targetY = Math.max(12, Math.min(88, y));
    range.value = String(Math.round(targetX));
    if (positionLabel) positionLabel.textContent = Math.abs(targetX - 50) < 5 ? 'CENTRE' : targetX < 50 ? 'LEFT' : 'RIGHT';
    if (!frameId) frameId = requestAnimationFrame(paint);
  }

  frame.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' && event.buttons === 0) return;
    const bounds = frame.getBoundingClientRect();
    move(((event.clientX - bounds.left) / bounds.width) * 100, ((event.clientY - bounds.top) / bounds.height) * 100);
  }, { passive: true });

  frame.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse') frame.setPointerCapture?.(event.pointerId);
    const bounds = frame.getBoundingClientRect();
    move(((event.clientX - bounds.left) / bounds.width) * 100, ((event.clientY - bounds.top) / bounds.height) * 100);
  }, { passive: true });


  range.addEventListener('input', () => move(Number(range.value), 50));
})();
