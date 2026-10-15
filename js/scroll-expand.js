(() => {
  const frame=document.querySelector('.scroll-expand');
  if(!frame||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const lite=document.documentElement.dataset.liteMotion==='true';
  let raf=0;
  function update(){
    raf=0;
    const rect=frame.getBoundingClientRect();
    const vh=window.innerHeight||1;
    if(rect.bottom<-80||rect.top>vh+80)return;
    const progress=Math.max(0,Math.min(1,(vh-rect.top)/(vh+rect.height*.25)));
    const low=window.matchMedia('(max-width: 700px)').matches||lite;
    const start=low ? 0.96 : 0.92;
    const end=low?1.035:1.105;
    frame.style.setProperty('--scroll-expansion',(start+(end-start)*progress).toFixed(3));
    frame.style.setProperty('--scroll-corner',`${Math.max(0,(1-progress)*(low?14:18)).toFixed(1)}px`);
  }
  function queue(){if(!raf)raf=requestAnimationFrame(update)}
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue,{passive:true});
  update();
})();

