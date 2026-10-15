(() => {
  const $=s=>document.querySelector(s);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=4))document.documentElement.dataset.liteMotion='true';

  // Local guided concierge: helpful preset answers, no network request or personal-data transmission.
  const reply=$('#conciergeReply');
  const assistant=$('#assistantPanel');
  const pet=$('#conciergePet');
  const paths={
    match:{text:'For quiet mornings, try Garden Suite. For open sea views, choose Cliff Suite. For more room, Horizon Residence is the concept pick.',target:null},
    stay:{text:'Choose your dates and guest count in the enquiry form. Your details stay in this demo; nothing is sent or booked.',target:'#enquire'},
    suites:{text:'Three imagined spaces await: garden calm, cliffside views, or a private horizon residence.',target:'#suites'},
    rituals:{text:'Picture a slow breakfast, a restorative hour, and a last-light walk by the coast.',target:'#rituals'}
  };
  document.querySelectorAll('[data-concierge]').forEach(button=>button.addEventListener('click',()=>{
    const item=paths[button.dataset.concierge]; if(!item)return;
    if(reply)reply.textContent=item.text;
    pet?.classList.add('is-talking'); window.setTimeout(()=>pet?.classList.remove('is-talking'),1800);
    if(item.target){assistant.hidden=true;$('#assistantLauncher')?.setAttribute('aria-expanded','false');document.querySelector(item.target)?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});}
  }));

  // Mood + group-size based suite suggestion, with an explicit user choice before applying it.
  const matchText=$('#suiteMatchText');
  const guestSelect=$('#guests');
  const suiteSelect=$('#formSuite');
  const applyMatch=$('#applySuiteMatch');
  let suggestion='Garden Suite';
  function updateMatch(){
    const mood=document.querySelector('.mood-choice.is-active')?.dataset.mood||'stillness';
    const count=guestSelect?.value||'2';
    suggestion=count==='5+'||Number(count)>=4?'Horizon Residence':mood==='discovery'?'Cliff Suite':mood==='restore'&&Number(count)>=2?'Horizon Residence':'Garden Suite';
    const descriptions={
      'Garden Suite':'For a slower pace, Garden Suite is a lovely fit.',
      'Cliff Suite':'For open views and a curious spirit, Cliff Suite is a lovely fit.',
      'Horizon Residence':'For extra room to unwind, Horizon Residence is a lovely fit.'
    };
    if(matchText)matchText.textContent=descriptions[suggestion];
  }
  guestSelect?.addEventListener('change',updateMatch);
  document.querySelectorAll('.mood-choice').forEach(choice=>choice.addEventListener('click',()=>requestAnimationFrame(updateMatch)));
  applyMatch?.addEventListener('click',()=>{if(suiteSelect)suiteSelect.value=suggestion;suiteSelect?.dispatchEvent(new Event('change',{bubbles:true}));applyMatch.textContent='Added to your enquiry';setTimeout(()=>{applyMatch.textContent='Use suggestion'},1800)});
  updateMatch();

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

