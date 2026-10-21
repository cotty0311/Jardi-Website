// A sandboxed demo may have an opaque origin. Only accept messages from our exact frames.
const demoFrames = () => [...document.querySelectorAll('iframe.demo-frame')];
const currentTheme = () => document.documentElement.dataset.theme === 'dark' ||
 (document.documentElement.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
function sendTheme(frame) { frame.contentWindow?.postMessage({type:'jardi-theme',theme:currentTheme()}, '*'); }
window.addEventListener('message', event => {
 const frame=demoFrames().find(frame=>frame.contentWindow === event.source);
 if(!frame || event.data?.type !== 'jardi-demo-size') return;
 const height=Number(event.data.height);
 if(Number.isFinite(height) && height>=100 && height<=2400) frame.style.height=`${Math.ceil(height)}px`;
 sendTheme(frame);
});
new MutationObserver(()=>demoFrames().forEach(sendTheme)).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>demoFrames().forEach(sendTheme));
demoFrames().forEach(frame=>frame.addEventListener('load',()=>sendTheme(frame)));

document.addEventListener("jardi:navigate",()=>demoFrames().forEach(frame=>{frame.addEventListener("load",()=>sendTheme(frame));sendTheme(frame)}));

// <picture> handles automatic OS theme selection even without JavaScript.
// An explicit site theme overrides its media query; language is chosen at build.
function updateScreenshots() {
 const theme=document.documentElement.dataset.theme || 'auto';
 const media=theme==='dark'?'all':theme==='light'?'not all':'(prefers-color-scheme: dark)';
 document.querySelectorAll('source[data-theme-source="dark"]').forEach(source=>{
  if(source.media!==media)source.media=media;
 });
}
updateScreenshots();
new MutationObserver(updateScreenshots).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
document.addEventListener('jardi:navigate',updateScreenshots);
