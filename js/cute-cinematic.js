(() => {
  const flare = document.getElementById('filmFlare');
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!flare || !fine || reduce) return;
  let frame=0,x=50,y=50;
  document.addEventListener('pointermove', e => { x=e.clientX/window.innerWidth*100; y=e.clientY/window.innerHeight*100; if(frame)return; frame=requestAnimationFrame(()=>{flare.style.setProperty('--flare-x',x+'%');flare.style.setProperty('--flare-y',y+'%');flare.classList.add('is-on');frame=0;}); }, {passive:true});
  document.addEventListener('pointerleave',()=>flare.classList.remove('is-on'));
})();

