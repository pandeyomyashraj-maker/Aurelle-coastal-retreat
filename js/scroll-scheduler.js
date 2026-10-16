(() => {
  'use strict';

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory <= 4)) {
    document.documentElement.dataset.liteMotion = 'true';
  }

  const jobs = new Set();
  let frame = 0;

  function flush() {
    frame = 0;
    if (document.hidden) return;

    // Every subscriber reads first; writes only start after all geometry reads finish.
    const snapshots = [];
    jobs.forEach(job => {
      try { snapshots.push([job, job.read()]); }
      catch (error) { console.error('AURELLE scroll read failed.', error); }
    });
    snapshots.forEach(([job, value]) => {
      try { job.write(value); }
      catch (error) { console.error('AURELLE scroll write failed.', error); }
    });
  }

  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(flush);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('visibilitychange', schedule);

  window.aurelleScroll = {
    subscribe(read, write) {
      const job = { read, write };
      jobs.add(job);
      schedule();
      return () => jobs.delete(job);
    },
    schedule
  };
})();
