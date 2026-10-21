const publishSize=()=>parent.postMessage({type:'jardi-demo-size',height:document.body.getBoundingClientRect().height},'*');
new ResizeObserver(publishSize).observe(document.body);
window.addEventListener('load',publishSize);
window.addEventListener('message',event=>{
 if(event.source!==parent || event.data?.type!=='jardi-theme' || !['light','dark'].includes(event.data.theme))return;
 document.documentElement.dataset.theme=event.data.theme;
});
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
function pauseForPreference(){const pause=document.getElementById('pause');if(reduce.matches && pause && !pause.disabled && ['暫停','Pause'].includes(pause.textContent))pause.click();}
pauseForPreference();reduce.addEventListener('change',pauseForPreference);
