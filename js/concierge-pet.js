(() => {
  const pet=document.getElementById('conciergePet'); if(!pet)return;
  let drag=false,moved=false,offsetX=0,offsetY=0,startX=0,startY=0;
  pet.addEventListener('click',()=>{ if(moved){moved=false;return} const launcher=document.getElementById('assistantLauncher'); if(launcher){ launcher.click(); pet.classList.remove('is-talking'); void pet.offsetWidth; pet.classList.add('is-talking'); setTimeout(()=>pet.classList.remove('is-talking'),2400); } });
  pet.addEventListener('pointerdown',e=>{drag=true;moved=false;startX=e.clientX;startY=e.clientY;pet.classList.add('is-dragging');const r=pet.getBoundingClientRect();offsetX=e.clientX-r.left;offsetY=e.clientY-r.top;pet.setPointerCapture?.(e.pointerId);e.preventDefault()});
  pet.addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-startX,e.clientY-startY)>6)moved=true;const x=Math.max(8,Math.min(innerWidth-106,e.clientX-offsetX));const y=Math.max(8,Math.min(innerHeight-150,e.clientY-offsetY));pet.style.left=x+'px';pet.style.top=y+'px';pet.style.bottom='auto'});
  const stop=()=>{drag=false;pet.classList.remove('is-dragging')}; pet.addEventListener('pointerup',stop);pet.addEventListener('pointercancel',stop);pet.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();document.getElementById('assistantLauncher')?.click();pet.classList.add('is-talking');setTimeout(()=>pet.classList.remove('is-talking'),2400)}});
})();



