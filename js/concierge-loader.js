(() => {
  'use strict';
  const launcher = document.getElementById('assistantLauncher');
  const pet = document.getElementById('conciergePet');
  if (!launcher) return;

  let ready = false;
  let loading;
  function loadConcierge() {
    if (!loading) {
      loading = Promise.all([
        import('./aurelle-assistant.js'),
        import('./concierge-pet.js'),
        import('./concierge-interactions.js')
      ]).then(() => { ready = true; }).catch(error => {
        loading = undefined;
        console.error('AURELLE Concierge could not be loaded.', error);
      });
    }
    return loading;
  }

  function warm() { void loadConcierge(); }
  function activate(event) {
    if (ready) return;
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    const source = event.currentTarget;
    event.preventDefault();
    event.stopImmediatePropagation();
    loadConcierge().then(() => {
      if (!ready) return;
      if (source === pet) pet.classList.add('is-talking');
      launcher.click();
    });
  }

  [launcher, pet].filter(Boolean).forEach(control => {
    control.addEventListener('pointerenter', warm, { once: true, passive: true });
    control.addEventListener('focusin', warm, { once: true });
    control.addEventListener('click', activate, true);
    control.addEventListener('keydown', activate, true);
  });
})();
