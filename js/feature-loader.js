(() => {
  'use strict';

  const features = [
    ['.scroll-expand', './scroll-expand.js'],
    ['#momentumRing', './momentum-ring.js'],
    ['#glassRevealFrame', './glass-reveal.js'],
    ['#particleImage', './particle-image.js'],
    ['#stayForm', './form-enhancements.js'],
    ['#afterHoursTrigger', './after-hours.js']
  ];
  const load = new Map();
  function loadFeature(path) {
    if (!load.has(path)) {
      load.set(path, import(path).catch(error => {
        load.delete(path);
        console.error('AURELLE feature could not be loaded: ' + path, error);
      }));
    }
    return load.get(path);
  }

  if (!('IntersectionObserver' in window)) {
    features.forEach(([, path]) => { void loadFeature(path); });
    return;
  }

  const targets = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      (targets.get(entry.target) || []).forEach(path => { void loadFeature(path); });
    });
  }, { rootMargin: '480px 0px' });

  features.forEach(([selector, path]) => {
    document.querySelectorAll(selector).forEach(target => {
      const paths = targets.get(target) || [];
      paths.push(path);
      targets.set(target, paths);
      if (paths.length === 1) observer.observe(target);
    });
  });
})();
