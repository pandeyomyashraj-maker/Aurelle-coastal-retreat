(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  // Give dynamic image swaps responsive candidates too, including high-DPI / 4K displays.
  const responsiveSet = (url) => {
    const base = url.replace(/([?&])w=\d+/, '$1w=720');
    const medium = url.replace(/([?&])w=\d+/, '$1w=1200');
    const large = url.replace(/([?&])w=\d+/, '$1w=1920').replace(/([?&])q=\d+/, '$1q=76');
    return `${base} 720w, ${medium} 1200w, ${large} 1920w`;
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header and progress share one read/write-batched scroll frame.
  const header = $('.site-header');
  const progress = $('#progressBar');
  window.aurelleScroll?.subscribe(
    () => {
      const y = window.scrollY || 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return { scrolled: y > 26, progress: max > 0 ? (y / max) * 100 : 0 };
    },
    state => {
      header?.classList.toggle('is-scrolled', state.scrolled);
      if (progress) progress.style.transform = 'scaleX(' + (state.progress / 100) + ')';
    }
  );

  // Reveal sections only once. Reduced-motion users see the final state immediately.
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  // Mobile navigation stays accessible without relying on hover.
  const menuToggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  function closeMenu() {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    mobileMenu.hidden = true;
    document.body.classList.remove('menu-open');
  }
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  });
  $$('#mobileMenu a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // Suite selector updates a single image + content set; no duplicated page content.
  const suites = [
    { name: 'The Garden<br/><em>Suite</em>', kicker: 'A SOFTER MORNING', desc: 'A private garden, a sun-warmed stone terrace, and a bedroom that opens slowly to the day.', size: '52 m²', view: 'Garden & olive grove', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=70', alt: 'Warm minimalist suite with natural materials', number: '01 / 03', form: 'Garden Suite' },
    { name: 'The Cliff<br/><em>Suite</em>', kicker: 'ABOVE THE WATERLINE', desc: 'A quieter perch on the headland, with a wide horizon and a terrace made for the last light.', size: '68 m²', view: 'Open sea', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=70', alt: 'Airy architectural living space in neutral materials', number: '02 / 03', form: 'Cliff Suite' },
    { name: 'The Horizon<br/><em>Residence</em>', kicker: 'ROOM TO DISAPPEAR', desc: 'A private residence imagined for longer stays, slow lunches, and a view that keeps changing.', size: '118 m²', view: 'Sea & distant hills', image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=70', alt: 'Spacious modern villa with warm daylight', number: '03 / 03', form: 'Horizon Residence' }
  ];
  let activeSuite = 0;
  const suiteImage = $('#suiteImage');
  function setSuite(index) {
    activeSuite = (index + suites.length) % suites.length;
    const s = suites[activeSuite];
    if (suiteImage) {
      suiteImage.style.opacity = '0.25';
      window.setTimeout(() => {
        suiteImage.srcset = responsiveSet(s.image);
        suiteImage.sizes = '(max-width: 700px) 90vw, (max-width: 1100px) 48vw, 42vw';
        suiteImage.src = s.image;
        suiteImage.alt = s.alt;
        suiteImage.onload = () => { suiteImage.style.opacity = '1'; };
        // Avoid leaving the image dimmed if a remote asset is temporarily unavailable.
        window.setTimeout(() => { suiteImage.style.opacity = '1'; }, 350);
      }, reduceMotion ? 0 : 140);
    }
    $('#suiteNumber').textContent = s.number;
    $('#suiteKicker').textContent = s.kicker;
    $('#suiteTitle').innerHTML = s.name;
    $('#suiteDescription').textContent = s.desc;
    $('#suiteSize').innerHTML = `${s.size} <small>illustrative</small>`;
    $('#suiteView').textContent = s.view;
    $('#suiteCounter').textContent = `${String(activeSuite + 1).padStart(2, '0')} — 03`;
    $$('.suite-tab').forEach((tab, i) => {
      const chosen = i === activeSuite;
      tab.classList.toggle('is-active', chosen);
      tab.setAttribute('aria-selected', String(chosen));
      tab.tabIndex = chosen ? 0 : -1;
    });
    const formSuite = $('#formSuite');
    if (formSuite) formSuite.selectedIndex = activeSuite;
  }
  $$('.suite-tab').forEach(tab => tab.addEventListener('click', () => setSuite(Number(tab.dataset.suite))));
  $('#suitePrev')?.addEventListener('click', () => setSuite(activeSuite - 1));
  $('#suiteNext')?.addEventListener('click', () => setSuite(activeSuite + 1));
  $$('.suite-tab').forEach((tab, i, tabs) => tab.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus(); setSuite(next);
  }));

  // Personal stay composer: changes the proposed rhythm, never claims live availability.
  const stayPlans = {
    stillness: {
      label: 'Find stillness', kicker: 'THE QUIET EDIT', title: 'Let the day<br/><em>open slowly.</em>',
      description: 'A light-touch day shaped around the view, a few good rituals, and the luxury of leaving space between them.',
      foot: 'THREE MOMENTS · NO FIXED SCHEDULE',
      steps: [['09:00', 'Breakfast that takes its time'], ['12:30', 'A quiet cove walk, with nowhere to hurry'], ['18:45', 'The last light from your own terrace']]
    },
    discovery: {
      label: 'Follow curiosity', kicker: 'THE ISLAND EDIT', title: 'Let the coast<br/><em>lead the way.</em>',
      description: 'A little movement, local texture, and just enough direction to find a place you would not have discovered by rushing.',
      foot: 'THREE MOMENTS · ROOM TO WANDER',
      steps: [['08:30', 'Coffee and something warm from the table'], ['11:00', 'A self-guided walk through the old stone lanes'], ['19:30', 'A long, unhurried dinner as the light fades']]
    },
    restore: {
      label: 'Feel restored', kicker: 'THE RESET EDIT', title: 'Return to<br/><em>your own rhythm.</em>',
      description: 'A softer pace with room for movement, a restorative pause, and an afternoon that belongs to no one but you.',
      foot: 'THREE MOMENTS · GENTLE BY DESIGN',
      steps: [['07:45', 'An easy stretch in the morning light'], ['10:30', 'A quiet wellness pause, shaped around you'], ['15:00', 'Poolside reading and time away from the clock']]
    }
  };
  let selectedStayMood = 'stillness';
  const moodButtons = $$('.mood-choice');
  const timeline = $('#stayMoodTimeline');
  function setStayMood(key) {
    const plan = stayPlans[key];
    if (!plan) return;
    selectedStayMood = key;
    moodButtons.forEach(button => {
      const active = button.dataset.mood === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $('#stayMoodKicker').textContent = plan.kicker;
    $('#stayMoodTitle').innerHTML = plan.title;
    $('#stayMoodDescription').textContent = plan.description;
    $('#stayMoodFoot').textContent = plan.foot;
    if (timeline) {
      timeline.replaceChildren();
      plan.steps.forEach(([time, label]) => {
        const item = document.createElement('li');
        const timeNode = document.createElement('span');
        const textNode = document.createElement('p');
        timeNode.textContent = time;
        textNode.textContent = label;
        item.append(timeNode, textNode);
        timeline.append(item);
      });
    }
  }
  moodButtons.forEach(button => button.addEventListener('click', () => setStayMood(button.dataset.mood)));
  $('#useMoodPlan')?.addEventListener('click', () => {
    const plan = stayPlans[selectedStayMood];
    const textarea = $('#guestMessage');
    if (textarea && plan) {
      const detail = `I'd like to explore the "${plan.label}" rhythm (illustrative concept itinerary): ${plan.steps.map(([time, label]) => `${time} — ${label}`).join('; ')}.`;
      textarea.value = detail;
    }
    $('#enquire')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => textarea?.focus({ preventScroll: true }), reduceMotion ? 0 : 500);
  });

  // Cursor aura appears only on capable mouse devices and only over interactive imagery.
  const aura = $('#cursorAura');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (aura && canHover && !reduceMotion) {
    let ax = -100, ay = -100, raf = 0;
    document.addEventListener('pointermove', e => {
      ax = e.clientX; ay = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        aura.style.left = `${ax}px`; aura.style.top = `${ay}px`; raf = 0;
      });
    }, { passive: true });
    $$('.intro-image-wrap, .suite-image-frame, .ritual-photo, .architecture-image, .location-image, .full-image-section').forEach(target => {
      target.addEventListener('pointerenter', () => aura.classList.add('is-visible'));
      target.addEventListener('pointerleave', () => aura.classList.remove('is-visible'));
    });
  }

  // Small parallax on large images only. Disabled on touch and reduced-motion devices.
  if (canHover && !reduceMotion) {
    const parallaxImages = $$('.intro-image-wrap img, .location-image img, .full-image-section > img');
    window.aurelleScroll?.subscribe(
      () => {
        const vh = window.innerHeight || 1;
        return parallaxImages.map(img => {
          const rect = img.parentElement.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > vh) return null;
          const shift = ((rect.top + rect.height / 2 - vh / 2) / vh) * -9;
          return { img, shift };
        });
      },
      values => values.forEach(value => {
        if (value) value.img.style.transform = 'scale(1.035) translate3d(0, ' + value.shift + 'px, 0)';
      })
    );
  }


  // Hero arrival motion: restrained mouse parallax + scroll depth. No custom animation loop while idle.
  const heroSection = $('.hero');
  const heroImage = $('.hero-image');
  if (heroSection && heroImage && canHover && !reduceMotion) {
    let heroMouseX = 0;
    let heroMouseY = 0;
    let heroScrollY = 0;
    let heroFrame = 0;
    let heroBounds = heroSection.getBoundingClientRect();
    const renderHeroShift = () => {
      heroImage.style.setProperty('--hero-shift-x', `${heroMouseX}px`);
      heroImage.style.setProperty('--hero-shift-y', `${heroMouseY + heroScrollY}px`);
      heroFrame = 0;
    };
    const queueHeroShift = () => {
      if (!heroFrame) heroFrame = requestAnimationFrame(renderHeroShift);
    };
    heroSection.addEventListener('pointermove', event => {
      const nx = (event.clientX - heroBounds.left) / Math.max(1, heroBounds.width) - 0.5;
      const ny = (event.clientY - heroBounds.top) / Math.max(1, heroBounds.height) - 0.5;
      heroMouseX = nx * -10;
      heroMouseY = ny * -7;
      queueHeroShift();
    }, { passive: true });
    heroSection.addEventListener('pointerleave', () => {
      heroMouseX = 0;
      heroMouseY = 0;
      queueHeroShift();
    }, { passive: true });
    window.aurelleScroll?.subscribe(
      () => heroSection.getBoundingClientRect(),
      rect => {
        heroBounds = rect;
        const heroProgress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
        heroScrollY = heroProgress * -18;
        queueHeroShift();
      }
    );
  }

  // Editorial split gallery: every image, title, kicker, and caption moves as one story.
  const galleryStories = [
    { image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=70', alt: 'Warm architectural interior with natural materials and filtered daylight', count: '01', caption: 'A softer kind of arrival.', kicker: 'THE FIRST IMPRESSION', title: 'The art of<br/><em>arriving.</em>', desc: 'A place doesn’t need to announce itself. It only needs to feel right, from the first breath of salt air to the first quiet view.' },
    { image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=70', alt: 'Mediterranean coastal village along a dramatic shoreline', count: '02', caption: 'A little farther from everything.', kicker: 'THE LANDSCAPE', title: 'A coast of<br/><em>your own.</em>', desc: 'Stone paths, open horizons, and the kind of distance that gives ordinary thoughts room to settle.' },
    { image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=70', alt: 'Contemporary architecture using warm natural materials', count: '03', caption: 'Architecture that listens.', kicker: 'FORM & MATERIAL', title: 'Made to<br/><em>belong.</em>', desc: 'Local textures and quiet geometry follow the slope of the land, making room for light rather than asking for attention.' },
    { image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=70', alt: 'A calm private residence with warm interior light and outdoor views', count: '04', caption: 'Space to stay a little longer.', kicker: 'YOUR PRIVATE SPACE', title: 'Room to<br/><em>unfold.</em>', desc: 'A thoughtful retreat with tactile materials, soft daylight, and an easy connection between indoors and out.' },
    { image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=70', alt: 'A resort pool framed by architecture and landscape', count: '05', caption: 'Let the light do the talking.', kicker: 'WATER & STILLNESS', title: 'The quiet<br/><em>blue.</em>', desc: 'Reflections shift with the hour. There is no schedule here, only water, warmth, and the changing colour of the day.' }
  ];
  let activeGallery = 0;
  const gallerySection = $('#gallery');
  function setGallery(index) {
    index = Math.max(0, Math.min(galleryStories.length - 1, index));
    if (index === activeGallery) return;
    activeGallery = index;
    window.dispatchEvent(new CustomEvent('aurelle:gallery-sync', { detail: activeGallery }));
    const story = galleryStories[activeGallery];
    $('#galleryCount').textContent = story.count;
    $('#galleryScrollStep').textContent = `${story.count} / 05`;
    $('#galleryCaption').textContent = story.caption;
    $('#galleryKicker').textContent = story.kicker;
    $('#galleryTitle').innerHTML = story.title;
    $('#galleryDescription').textContent = story.desc;
    $$('.gallery-dot').forEach((dot, i) => dot.classList.toggle('is-active', i === activeGallery));
  }

  window.addEventListener('aurelle:gallery-select', event => {
    const index = Number(event.detail);
    if (Number.isInteger(index)) setGallery(index);
  });

  // Scroll drives the pinned five-scene journal. Arrow buttons are intentionally removed:
  // each story advances naturally as the visitor moves down the page.
  if (gallerySection) {
    window.aurelleScroll?.subscribe(
      () => {
      const rect = gallerySection.getBoundingClientRect();
      const travel = Math.max(1, gallerySection.offsetHeight - window.innerHeight);
        const progressValue = Math.max(0, Math.min(0.99999, -rect.top / travel));
        return {
          progress: progressValue,
          index: Math.min(galleryStories.length - 1, Math.floor(progressValue * galleryStories.length))
        };
      },
      state => {
        const fill = $('#galleryScrollProgress');
        if (fill) fill.style.transform = 'scaleX(' + Math.min(1, state.progress) + ')';
        if (state.index !== activeGallery) setGallery(state.index);
      }
    );
  }

  // Global click feedback: two soft rings and a warm point, never a strobe or blocking overlay.
  const pulse = $('#interactionPulse');
  let pulseLast = 0;
  if (pulse && !reduceMotion) {
    document.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const now = performance.now();
      if (now - pulseLast < 90) return;
      pulseLast = now;
      pulse.style.left = `${e.clientX}px`;
      pulse.style.top = `${e.clientY}px`;
      pulse.classList.remove('is-active');
      void pulse.offsetWidth;
      pulse.classList.add('is-active');
    }, { passive: true });
  }

  // Small magnetic response on the booking CTA; deliberately limited to a few pixels.
  if (canHover && !reduceMotion) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / Math.max(r.width / 2, 1);
        const dy = (e.clientY - (r.top + r.height / 2)) / Math.max(r.height / 2, 1);
        el.style.transform = `translate3d(${dx * 4}px, ${dy * 3}px, 0)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // Rain-on-glass atmosphere: lightweight canvas, only animated while the water scene is visible.
  const waterSection = $('#ritual-water');
  const weatherCanvas = $('#weatherCanvas');
  const weatherToggle = $('#weatherToggle');
  const weatherToggleLabel = $('#weatherToggleLabel');
  const wctx = weatherCanvas?.getContext('2d', { alpha: true });
  let weatherVisible = false;
  let weatherRunning = false;
  let weatherFrame = 0;
  let lastWeatherFrame = 0;
  let weatherWidth = 0, weatherHeight = 0, weatherDpr = 1;
  let rainFar = [], rainNear = [], waterRipples = [];
  const makeRain = (count, near) => Array.from({ length: count }, () => ({
    x: Math.random() * Math.max(weatherWidth, 1),
    y: Math.random() * Math.max(weatherHeight, 1),
    speed: (near ? 390 : 235) + Math.random() * (near ? 285 : 210),
    length: (near ? 18 : 10) + Math.random() * (near ? 24 : 15),
    alpha: (near ? .26 : .15) + Math.random() * (near ? .24 : .15),
    drift: (near ? 42 : 25) + Math.random() * 20
  }));
  function resizeWeather() {
    if (!weatherCanvas || !waterSection || !wctx) return;
    const rect = waterSection.getBoundingClientRect();
    weatherWidth = Math.max(1, Math.round(rect.width));
    weatherHeight = Math.max(1, Math.round(rect.height));
    weatherDpr = Math.min(window.devicePixelRatio || 1, window.matchMedia('(max-width:700px)').matches ? 1 : 1.15);
    weatherCanvas.width = Math.round(weatherWidth * weatherDpr);
    weatherCanvas.height = Math.round(weatherHeight * weatherDpr);
    weatherCanvas.style.width = `${weatherWidth}px`;
    weatherCanvas.style.height = `${weatherHeight}px`;
    wctx.setTransform(weatherDpr, 0, 0, weatherDpr, 0, 0);
    const small = window.matchMedia('(max-width:700px)').matches;
    rainFar = makeRain(small ? 145 : 285, false);
    rainNear = makeRain(small ? 58 : 132, true);
    waterRipples = [];
  }
  function addWaterRipple(x, y, size = 1) {
    if (!weatherWidth || !weatherHeight) return;
    waterRipples.push({ x: Math.max(0, Math.min(weatherWidth, x)), y: Math.max(0, Math.min(weatherHeight, y)), age: 0, max: 1.3 + Math.random() * .75, size });
    if (waterRipples.length > 18) waterRipples.shift();
  }
  function drawWeather(timestamp) {
    if (!weatherRunning || !wctx || !weatherCanvas || !waterSection?.classList.contains('is-rain-active') || document.hidden || !weatherVisible) {
      weatherRunning = false;
      weatherFrame = 0;
      return;
    }
    if (timestamp - lastWeatherFrame < 40) { weatherFrame = requestAnimationFrame(drawWeather); return; }
    const delta = Math.min((timestamp - (lastWeatherFrame || timestamp)) / 1000, .05);
    lastWeatherFrame = timestamp;
    wctx.clearRect(0, 0, weatherWidth, weatherHeight);
    const paintDrops = (drops, near) => {
      wctx.lineWidth = near ? 1.45 : .95;
      for (const d of drops) {
        d.y += d.speed * delta;
        d.x += d.drift * delta;
        if (d.y > weatherHeight + d.length || d.x > weatherWidth + 20) {
          d.y = -d.length - Math.random() * 100;
          d.x = Math.random() * weatherWidth - 30;
        }
        wctx.strokeStyle = near ? `rgba(246,242,231,${d.alpha})` : `rgba(232,235,225,${d.alpha})`;
        wctx.beginPath(); wctx.moveTo(d.x, d.y); wctx.lineTo(d.x - d.length * .14, d.y + d.length); wctx.stroke();
      }
    };
    paintDrops(rainFar, false);
    paintDrops(rainNear, true);
    for (let i = waterRipples.length - 1; i >= 0; i--) {
      const r = waterRipples[i]; r.age += delta;
      const t = Math.min(1, r.age / r.max);
      const radius = 4 + t * 36 * r.size;
      wctx.strokeStyle = `rgba(231,222,197,${(1 - t) * .36})`;
      wctx.lineWidth = .8 + (1 - t) * .7;
      wctx.beginPath(); wctx.ellipse(r.x, r.y, radius, radius * .24, 0, 0, Math.PI * 2); wctx.stroke();
      if (t > .7) { wctx.beginPath(); wctx.ellipse(r.x, r.y, radius * .58, radius * .15, 0, 0, Math.PI * 2); wctx.stroke(); }
      if (t >= 1) waterRipples.splice(i, 1);
    }
    if (Math.random() < delta * 4.2) addWaterRipple(Math.random() * weatherWidth, weatherHeight * (.50 + Math.random() * .45), .55 + Math.random() * .85);
    weatherFrame = requestAnimationFrame(drawWeather);
  }
  function syncWeather() {
    const shouldRun = !!(weatherVisible && waterSection?.classList.contains('is-rain-active') && !document.hidden && !reduceMotion && wctx);
    if (shouldRun && !weatherRunning) { weatherRunning = true; lastWeatherFrame = 0; weatherFrame = requestAnimationFrame(drawWeather); }
    if (!shouldRun && weatherRunning) { weatherRunning = false; if (weatherFrame) cancelAnimationFrame(weatherFrame); weatherFrame = 0; }
  }
  if (weatherCanvas && waterSection && wctx) {
    if (reduceMotion) {
      waterSection.classList.remove('is-rain-active');
      weatherToggle?.setAttribute('aria-pressed', 'false');
      if (weatherToggleLabel) weatherToggleLabel.textContent = 'Motion reduced';
    }
    // Defer canvas allocation until the rain section approaches the viewport.
    // This avoids allocating a large DPR-scaled backing store during the initial hero load.
    let weatherSized = false;
    if ('IntersectionObserver' in window) {
      const weatherObserver = new IntersectionObserver(entries => {
        weatherVisible = entries.some(entry => entry.isIntersecting);
        if (weatherVisible && !weatherSized && !reduceMotion) {
          resizeWeather();
          weatherSized = true;
        }
        syncWeather();
      }, { threshold: 0.01, rootMargin: '120px 0px' });
      weatherObserver.observe(waterSection);
    } else {
      weatherVisible = true;
      if (!reduceMotion) { resizeWeather(); weatherSized = true; }
    }
    window.addEventListener('resize', () => { if (weatherSized) resizeWeather(); syncWeather(); }, { passive: true });
    document.addEventListener('visibilitychange', syncWeather);
    weatherToggle?.addEventListener('click', () => {
      if (reduceMotion) {
        const toast = $('#toast');
        if (toast) { toast.textContent = 'Atmosphere animation is disabled by your motion preference.'; toast.classList.add('is-visible'); window.setTimeout(() => toast.classList.remove('is-visible'), 2400); }
        return;
      }
      const active = !waterSection.classList.contains('is-rain-active');
      waterSection.classList.toggle('is-rain-active', active);
      weatherToggle.setAttribute('aria-pressed', String(active));
      if (weatherToggleLabel) weatherToggleLabel.textContent = active ? 'Still the rain' : 'Invite the rain';
      if (active) addWaterRipple(weatherWidth * .5, weatherHeight * .75, 1.1);
      syncWeather();
    });
    waterSection.addEventListener('pointerdown', e => {
      if (!waterSection.classList.contains('is-rain-active')) return;
      const rect = waterSection.getBoundingClientRect();
      addWaterRipple(e.clientX - rect.left, e.clientY - rect.top, 1.15);
    }, { passive: true });
    syncWeather();
  }

  // Contextual cursor copy makes the existing aura respond to each type of surface.
  if (aura && canHover) {
    const auraLabel = $('span', aura);
    const cursorTargets = [
      ['.intro-image-wrap', 'DISCOVER'], ['.suite-image-frame', 'EXPLORE'], ['.ritual-photo', 'A MOMENT'],
      ['.architecture-image', 'MATERIAL'], ['.location-image', 'THE PLACE'], ['.full-image-section', 'FEEL THE WATER'], ['.gallery-media', 'DRAG / EXPLORE']
    ];
    cursorTargets.forEach(([selector, label]) => $$(selector).forEach(target => {
      target.addEventListener('pointerenter', () => { if (auraLabel) auraLabel.textContent = label; });
      target.addEventListener('pointerleave', () => { if (auraLabel) auraLabel.textContent = 'EXPLORE'; });
    }));
  }

  $('#year').textContent = String(new Date().getFullYear());
})();

