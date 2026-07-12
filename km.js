/* KM-Tools — gemeinsames Skript: Rad Mode (Lesesaal-Dunkelmodus) */
(function(){
  var KEY='km_tool_rad_mode';
  function sync(){
    var on=document.body.classList.contains('rad-mode');
    var btn=document.getElementById('radModeToggle');
    if(btn) btn.setAttribute('aria-pressed', on?'true':'false');
  }
  window.toggleRadMode=function(){
    var on=document.body.classList.toggle('rad-mode');
    try{localStorage.setItem(KEY,on?'1':'0');}catch(e){}
    sync();
  };
  try{
    if(localStorage.getItem(KEY)==='1'){document.body.classList.add('rad-mode');}
  }catch(e){}
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',sync);
  }else{sync();}
})();
