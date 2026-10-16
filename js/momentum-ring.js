(() => {
  'use strict';
  const ring=document.getElementById('momentumRing');
  const world=document.getElementById('momentumRingWorld');
  if(!ring||!world)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items=[
    {src:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=720&q=68',alt:'Warm architectural suite with natural textures',title:'The first impression',subtitle:'A softer kind of arrival.'},
    {src:'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=720&q=68',alt:'Mediterranean coastline and hillside village',title:'The landscape',subtitle:'A little farther from everything.'},
    {src:'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=720&q=68',alt:'Quiet modern architecture in warm natural materials',title:'Form & material',subtitle:'Architecture that listens.'},
    {src:'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=720&q=68',alt:'Private residence opening onto a calm outdoor view',title:'Your private space',subtitle:'Space to stay a little longer.'},
    {src:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=720&q=68',alt:'Resort pool framed by a softly lit landscape',title:'Water & stillness',subtitle:'Let the light do the talking.'}
  ];
  const cards=items.map(item=>{
    const card=document.createElement('button');
    card.type='button';card.className='momentum-card';card.setAttribute('aria-label',`${item.title}: ${item.subtitle}`);card.tabIndex=-1;
    const image=document.createElement('img');image.src=item.src;image.alt=item.alt;image.width=720;image.height=960;image.loading='lazy';image.fetchPriority='low';image.decoding='async';
    card.append(image);card.addEventListener('click',()=>snapTo(index));world.append(card);return card;
  });
  if('IntersectionObserver'in window){
    const imageWarmup=new IntersectionObserver(entries=>{
      if(!entries[0].isIntersecting)return;
      cards.forEach(card=>{const image=card.querySelector('img');if(image){image.loading='eager';image.decode?.().catch(()=>{});}});
      imageWarmup.disconnect();
    },{rootMargin:'420px 0px'});
    imageWarmup.observe(ring);
  }
  const step=360/items.length;
  let index=0,rotation=0,radius=230,dragging=false,pointerX=0,lastX=0,lastTime=0,velocity=0,raf=0,motionBlur=0;
  const count=document.getElementById('momentumRingCount');
  const title=document.getElementById('momentumRingTitle');
  const subtitle=document.getElementById('momentumRingSubtitle');
  const wrap=n=>(n%items.length+items.length)%items.length;
  function measure(){
    const w=ring.clientWidth||window.innerWidth;
    const cardWidth=matchMedia('(max-width: 700px)').matches?Math.min(188,w*.42):Math.min(258,w*.38);
    radius=Math.max(cardWidth*.66,Math.min(w*.48,cardWidth*1.12));
    world.style.setProperty('--ring-radius',`${radius}px`);
    render();
  }
  function render(){
    raf=0;
    cards.forEach((card,i)=>{
      const angle=i*step+rotation;
      const radians=angle*Math.PI/180;
      const front=Math.max(0,Math.cos(radians));
      const blur=reduced?0:Math.min(5,(1-front)*2.6+motionBlur);
      card.style.setProperty('--card-angle',`${angle}deg`);
      card.style.setProperty('--card-scale',(0.82+front*.18).toFixed(3));
      card.style.setProperty('--card-opacity',(0.25+front*.75).toFixed(3));
      card.style.setProperty('--card-blur',`${blur.toFixed(2)}px`);
      card.style.zIndex=String(10+Math.round(front*10));
      card.setAttribute('aria-hidden',String(i!==index));
    });
    if(count)count.textContent=`${String(index+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
    if(title)title.textContent=items[index].title;
    if(subtitle)subtitle.textContent=items[index].subtitle;
  }
  function queueRender(){if(!raf)raf=requestAnimationFrame(render)}
  function closestRotation(targetIndex){
    const base=-targetIndex*step;
    return base+360*Math.round((rotation-base)/360);
  }
  function snapTo(next,notify=true){
    index=wrap(next);rotation=closestRotation(index);motionBlur=0;ring.classList.remove('is-dragging');queueRender();
    if(notify)window.dispatchEvent(new CustomEvent('aurelle:ring-select',{detail:index}));
  }
  window.addEventListener('aurelle:gallery-sync',event=>{
    const value=Number(event.detail);if(Number.isInteger(value)&&value>=0&&value<items.length&&value!==index)snapTo(value,false);
  });
  ring.addEventListener('pointerdown',event=>{
    if(event.button!==undefined&&event.button!==0)return;
    dragging=true;pointerX=lastX=event.clientX;lastTime=performance.now();velocity=0;ring.classList.add('is-dragging');ring.setPointerCapture?.(event.pointerId);ring.focus({preventScroll:true});
  });
  ring.addEventListener('pointermove',event=>{
    if(!dragging)return;
    const delta=event.clientX-pointerX;pointerX=event.clientX;rotation+=delta*.42;
    const now=performance.now();velocity=delta/Math.max(1,now-lastTime);lastTime=now;lastX=event.clientX;motionBlur=reduced?0:Math.min(2.5,Math.abs(velocity)*.8);queueRender();
  });
  function release(){
    if(!dragging)return;dragging=false;
    if(Math.abs(velocity)>.12)rotation+=velocity*220;
    const next=wrap(Math.round(-rotation/step));snapTo(next,true);
  }
  ring.addEventListener('pointerup',release);ring.addEventListener('pointercancel',release);ring.addEventListener('lostpointercapture',release);
  ring.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'){event.preventDefault();snapTo(index+1)}
    else if(event.key==='ArrowLeft'){event.preventDefault();snapTo(index-1)}
    else if(event.key==='Home'){event.preventDefault();snapTo(0)}
    else if(event.key==='End'){event.preventDefault();snapTo(items.length-1)}
  });
  document.getElementById('momentumPrev')?.addEventListener('click',()=>snapTo(index-1));
  document.getElementById('momentumNext')?.addEventListener('click',()=>snapTo(index+1));
  window.addEventListener('aurelle:ring-select',event=>{
    const value=Number(event.detail);if(Number.isInteger(value))window.dispatchEvent(new CustomEvent('aurelle:gallery-select',{detail:value}));
  });
  if('ResizeObserver'in window)new ResizeObserver(measure).observe(ring);else window.addEventListener('resize',measure,{passive:true});
  measure();
})();
