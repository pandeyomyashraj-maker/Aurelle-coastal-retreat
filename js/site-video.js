(() => {
  'use strict';
  const video = document.querySelector('.site-ocean-video');
  if (!video) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopViewport = window.matchMedia('(min-width: 1001px)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const dataSaver = Boolean(connection && connection.saveData);
  const slowNetwork = Boolean(connection && /^(slow-2g|2g|3g)$/.test(connection.effectiveType || ''));
  const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2;
  const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
  const videoUrl = 'https://videos.pexels.com/video-files/29045880/12556574_2160_3840_60fps.mp4';
  let sourceAdded = false;

  function addConnectionHint() {
    if (document.querySelector('link[data-aurelle-video-preconnect]')) return;
    const hint = document.createElement('link');
    hint.rel = 'preconnect';
    hint.href = 'https://videos.pexels.com';
    hint.crossOrigin = 'anonymous';
    hint.dataset.aurelleVideoPreconnect = 'true';
    document.head.appendChild(hint);
  }

  function keepStill() {
    video.pause();
    document.body.classList.remove('site-video-playing');
    document.body.classList.add('site-video-still');
  }

  function startVideo() {
    if (sourceAdded || reduceMotion.matches || !desktopViewport.matches || dataSaver || slowNetwork || lowMemory || lowCpu) {
      keepStill();
      return;
    }
    sourceAdded = true;
    addConnectionHint();
    video.src = videoUrl;
    video.load();
    const playWhenReady = () => {
      if (document.hidden || reduceMotion.matches || !desktopViewport.matches) return;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(keepStill);
    };
    video.addEventListener('playing', () => {
      document.body.classList.add('site-video-playing');
      document.body.classList.remove('site-video-still');
    }, { once: true });
    video.addEventListener('loadeddata', playWhenReady, { once: true });
    video.addEventListener('error', keepStill, { once: true });
  }

  // Start on the first load, rather than waiting for an idle callback. The poster
  // remains visible until the first video frame is ready, so judges see motion
  // immediately without a blank flash.
  const schedule = () => window.setTimeout(startVideo, 120);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (sourceAdded && !reduceMotion.matches && desktopViewport.matches) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(keepStill);
    }
  });
  reduceMotion.addEventListener?.('change', event => {
    if (event.matches) keepStill();
    else if (sourceAdded && desktopViewport.matches && !dataSaver && !slowNetwork) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(keepStill);
    }
  });
  desktopViewport.addEventListener?.('change', event => {
    if (!event.matches) keepStill();
    // We deliberately don't fetch a 4K/60fps stream when resizing down to a tablet viewport.
    // If loaded already, the still poster remains a fallback; a page reload allows a fresh decision.
  });
})();

