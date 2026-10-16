(() => {
  const $=s=>document.querySelector(s);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=4))document.documentElement.dataset.liteMotion='true';

  // Judge showcase: four calm stops; any visitor input cancels the tour.
  const destinations=[['suites','01 / THE SUITES'],['rituals','02 / THE RITUALS'],['guestbook','03 / GUEST MOMENTS'],['enquire','04 / PLAN A STAY']];
  const status=$('#showcaseStatus'),message=$('#showcaseMessage'),stop=$('#stopShowcase');
  let tourTimers=[],tourIndex=0;
  const clearTour=()=>{tourTimers.forEach(clearTimeout);tourTimers=[];status.hidden=true;document.body.classList.remove('showcase-running')};
  function runStop(){if(tourIndex>=destinations.length){clearTour();return}const [id,label]=destinations[tourIndex++];message.textContent=label;document.getElementById(id)?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});tourTimers.push(setTimeout(runStop,4200));}
  $('#startShowcase')?.addEventListener('click',()=>{clearTour();tourIndex=0;status.hidden=false;document.body.classList.add('showcase-running');runStop()});
  stop?.addEventListener('click',clearTour);
  ['wheel','touchstart','pointerdown','keydown'].forEach(type=>document.addEventListener(type,event=>{if(!status.hidden&&event.target!==stop&&!event.target.closest?.('#startShowcase'))clearTour()},{passive:true}));
})();

