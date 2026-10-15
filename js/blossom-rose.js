(() => {
  const cursor = document.getElementById('roseCursor');
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!cursor || !fine || reduce) return;
  let frame=0,x=-100,y=-100;
  document.addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;if(frame)return;frame=requestAnimationFrame(()=>{cursor.style.transform=`translate3d(${x-32}px,${y-32}px,0) scale(1) rotate(0deg)`;cursor.classList.add('is-visible');frame=0})},{passive:true});
  document.addEventListener('pointerleave',()=>cursor.classList.remove('is-visible'));
})();

