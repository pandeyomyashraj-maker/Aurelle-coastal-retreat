(() => {
  const launcher=document.getElementById('assistantLauncher');
  const panel=document.getElementById('assistantPanel');
  const close=document.getElementById('assistantClose');
  if(!launcher||!panel)return;
  const setOpen=open=>{panel.hidden=!open;launcher.setAttribute('aria-expanded',String(open));if(open) close?.focus()};
  launcher.addEventListener('click',()=>setOpen(panel.hidden));
  close?.addEventListener('click',()=>setOpen(false));
  panel.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setOpen(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)setOpen(false)});
})();

