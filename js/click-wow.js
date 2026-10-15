(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const field = document.getElementById('clickSparkField');
  const buttons = document.querySelectorAll('.click-wow');
  if (!reduce) buttons.forEach(el => {
    el.addEventListener('pointerdown', () => el.classList.add('is-pressed'));
    ['pointerup','pointerleave','blur'].forEach(type => el.addEventListener(type, () => el.classList.remove('is-pressed')));
  });
  if (!reduce && field) document.addEventListener('click', event => {
    if (event.target.closest('a,button')) {
      for (let i=0;i<7;i++) { const dot=document.createElement('i'); dot.className='click-spark'; const angle=(Math.PI*2*i/7)+Math.random()*.3; const distance=24+Math.random()*28; dot.style.left=event.clientX+'px'; dot.style.top=event.clientY+'px'; dot.style.setProperty('--sx',Math.cos(angle)*distance+'px'); dot.style.setProperty('--sy',Math.sin(angle)*distance+'px'); field.appendChild(dot); dot.addEventListener('animationend',()=>dot.remove(),{once:true}); }
    }
    const anchor=event.target.closest('a[href="#enquire"]');
    if(anchor){ const section=document.getElementById('enquire'); section?.classList.add('booking-focus'); setTimeout(()=>section?.classList.remove('booking-focus'),1200); }
  });
})();

