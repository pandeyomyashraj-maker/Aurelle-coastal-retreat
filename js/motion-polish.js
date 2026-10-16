(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Section metadata + imagery animate only when approaching the viewport.
  const markedSections = $$('.section-meta');
  const motionImages = $$('.intro-image-wrap, .suite-image-frame, .ritual-card, .architecture-image, .security-visual');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('motion-drawn');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    markedSections.forEach(el => sectionObserver.observe(el));

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('motion-entered');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '100px 0px 100px 0px' });
    motionImages.forEach(el => imageObserver.observe(el));
  } else {
    markedSections.forEach(el => el.classList.add('motion-drawn'));
    motionImages.forEach(el => el.classList.add('motion-entered'));
  }

  // Discrete scroll spy: highlights the current chapter without a scroll-event loop.
  const chapterIds = ['story', 'manifesto', 'suites', 'essentials', 'security', 'ritual-water', 'gallery', 'rituals', 'stayComposer', 'location', 'guestbook', 'enquire'];
  const chapterAliases = { manifesto: 'story', essentials: 'security', 'ritual-water': 'rituals', gallery: 'rituals' };
  const chapters = chapterIds.map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = $$('.desktop-nav a[href^="#"], #mobileMenu a[href^="#"]');
  function setCurrentChapter(id) {
    const navId = chapterAliases[id] || id;
    navLinks.forEach(link => {
      const current = link.getAttribute('href') === `#${navId}`;
      link.classList.toggle('is-current', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window && chapters.length) {
    const chapterObserver = new IntersectionObserver(entries => {
      const center = window.innerHeight * 0.5;
      const candidates = entries.filter(entry => entry.isIntersecting).map(entry => {
        const section = entry.target;
        const rect = entry.boundingClientRect;
        const overlapsCenter = rect.top <= center && rect.bottom >= center;
        return { section, rect, overlapsCenter, distance: Math.abs((rect.top + rect.bottom) / 2 - center) };
      }).filter(item => item.overlapsCenter).sort((a, b) => a.distance - b.distance);
      if (candidates[0]) setCurrentChapter(candidates[0].section.id);
    }, { rootMargin: '-48% 0px -48% 0px', threshold: 0 });
    chapters.forEach(section => chapterObserver.observe(section));
  }

  // Content swaps for the suite and personalized-stay controls use a brief, single entrance.
  function addSwapAnimation(element) {
    if (!element || reduceMotion) return;
    element.classList.remove('motion-text-change');
    // A single layout read restarts the animation only on explicit content changes.
    void element.offsetWidth;
    element.classList.add('motion-text-change');
    window.clearTimeout(element._motionSwapTimer);
    element._motionSwapTimer = window.setTimeout(() => element.classList.remove('motion-text-change'), 560);
  }
  const observeSwap = (node, targets) => {
    if (!node || !('MutationObserver' in window)) return;
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        targets.forEach(addSwapAnimation);
      });
    });
    observer.observe(node, { childList: true, characterData: true, subtree: true });
  };
  const suiteCopy = $('.suite-copy');
  observeSwap(suiteCopy, [$('#suiteKicker'), $('#suiteTitle'), $('#suiteDescription')].filter(Boolean));
  const moodRoot = $('#stayComposer');
  observeSwap(moodRoot, [$('#stayMoodKicker'), $('#stayMoodTitle'), $('#stayMoodDescription'), $('#stayMoodTimeline')].filter(Boolean));

  // Keyboard users can still see an explicit current chapter; no hover-only information.
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const menuToggle = $('#menuToggle');
    if (menuToggle?.getAttribute('aria-expanded') === 'true') menuToggle.click();
  });
})();

