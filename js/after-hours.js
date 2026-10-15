(() => {
  'use strict';
  const trigger = document.getElementById('afterHoursTrigger');
  const dialog = document.getElementById('afterHoursDialog');
  const close = document.getElementById('afterHoursClose');
  const explore = document.getElementById('afterHoursExplore');
  if (!trigger || !dialog || !close) return;

  let taps = 0;
  let resetTimer = 0;
  let typed = '';

  function reveal() {
    window.clearTimeout(resetTimer);
    taps = 0;
    trigger.title = 'Tap five times for a small secret';
    if (!dialog.open) dialog.showModal();
    close.focus({ preventScroll: true });
  }

  trigger.addEventListener('click', () => {
    taps += 1;
    window.clearTimeout(resetTimer);
    if (taps >= 5) {
      reveal();
      return;
    }
    trigger.title = `Tap ${5 - taps} more time${5 - taps === 1 ? '' : 's'} for after hours`;
    resetTimer = window.setTimeout(() => {
      taps = 0;
      trigger.title = 'Tap five times for a small secret';
    }, 2400);
  });

  close.addEventListener('click', () => dialog.close());
  explore?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.key.length !== 1) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    typed = (typed + event.key.toUpperCase()).slice(-7);
    if (typed === 'AURELLE') reveal();
  });
})();
