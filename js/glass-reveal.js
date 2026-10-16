(() => {
  'use strict';
  const frame = document.getElementById('glassRevealFrame');
  const range = document.getElementById('glassRevealRange');
  if (!frame || !range) return;

  const positionLabel = document.getElementById('glassRevealPosition');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let bounds = { left: 0, top: 0, width: 0, height: 0 };
  let boundsDirty = true;
  let pendingPointer = null;
  let pendingRange = null;
  let targetX = 50, targetY = 50;
  let currentX = 50, currentY = 50;
  let frameId = 0;
  let lastRangeValue = 50;
  let lastLabel = 'CENTRE';

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function schedulePaint() {
    if (!frameId) frameId = requestAnimationFrame(paint);
  }

  function paint() {
    frameId = 0;
    if (boundsDirty) {
      // The only layout read: at most once per frame, and never in pointermove.
      bounds = frame.getBoundingClientRect();
      boundsDirty = false;
    }
    if (pendingPointer && bounds.width && bounds.height) {
      targetX = clamp(((pendingPointer.x - bounds.left) / bounds.width) * 100, 8, 92);
      targetY = clamp(((pendingPointer.y - bounds.top) / bounds.height) * 100, 12, 88);
      pendingPointer = null;
    }
    if (pendingRange !== null) {
      targetX = clamp(pendingRange, 8, 92);
      targetY = 50;
      pendingRange = null;
    }

    if (reducedMotion) {
      currentX = targetX;
      currentY = targetY;
    } else {
      currentX += (targetX - currentX) * 0.28;
      currentY += (targetY - currentY) * 0.28;
    }

    frame.style.setProperty('--lens-x', currentX.toFixed(2) + '%');
    frame.style.setProperty('--lens-y', currentY.toFixed(2) + '%');
    frame.style.setProperty('--lens-shift-x', (bounds.width * (currentX / 100 - 0.5)).toFixed(1) + 'px');
    frame.style.setProperty('--lens-shift-y', (bounds.height * (currentY / 100 - 0.5)).toFixed(1) + 'px');

    const nextRange = Math.round(targetX);
    if (nextRange !== lastRangeValue) {
      range.value = String(nextRange);
      lastRangeValue = nextRange;
    }
    const nextLabel = Math.abs(targetX - 50) < 5 ? 'CENTRE' : targetX < 50 ? 'LEFT' : 'RIGHT';
    if (positionLabel && nextLabel !== lastLabel) {
      positionLabel.textContent = nextLabel;
      lastLabel = nextLabel;
    }

    if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.08) schedulePaint();
  }

  function queuePointer(event) {
    if (event.pointerType === 'touch' && event.buttons === 0) return;
    pendingPointer = { x: event.clientX, y: event.clientY };
    schedulePaint();
  }

  frame.addEventListener('pointermove', queuePointer, { passive: true });
  frame.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse') frame.setPointerCapture?.(event.pointerId);
    pendingPointer = { x: event.clientX, y: event.clientY };
    schedulePaint();
  }, { passive: true });
  range.addEventListener('input', () => {
    pendingRange = Number(range.value);
    schedulePaint();
  }, { passive: true });

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { boundsDirty = true; }).observe(frame);
  }
  window.aurelleScroll?.subscribe(
    () => null,
    () => { boundsDirty = true; }
  );
  schedulePaint();
})();
