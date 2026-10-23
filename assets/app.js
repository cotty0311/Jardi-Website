const $ = selector => document.querySelector(selector);
let requestedRoute;
$('#version').addEventListener('change', e => {
 const target=routeFor(e.target.selectedOptions[0].dataset.url);
 navigate(target.source.replace(/\/(?:zh|en)\//,`/${requestedRoute?.language || target.language}/`));
});
$('#language').addEventListener('change', e => {
 const target=routeFor(e.target.value),current=requestedRoute || routeFor(location.href);
 navigate(current.source.replace(/\/(?:zh|en)\//,`/${target.language}/`));
});
const en = () => document.documentElement.lang === 'en';
const t = (zh, english) => en() ? english : zh;
const themeNames = {auto:'跟隨系統',light:'淺色',dark:'深色'};
function themeLabel(){const theme=document.documentElement.dataset.theme || 'auto'; $('#theme').title=t(`色彩模式：${themeNames[theme]}（點擊切換）`, `Color mode: ${theme} (click to change)`);$('#theme').setAttribute('aria-label',$('#theme').title);$('#theme').textContent={auto:'◐',light:'☼',dark:'☾'}[theme] || '◐';}
themeLabel();
$('#theme').addEventListener('click',()=>{const modes=['auto','light','dark'];const next=modes[(modes.indexOf(document.documentElement.dataset.theme || 'auto')+1)%3];document.documentElement.dataset.theme=next;try{localStorage.setItem('jardi-theme',next)}catch{}themeLabel()});
$('#menu').addEventListener('click',()=>{$('#menu').setAttribute('aria-expanded',String($('#sidebar').classList.toggle('open')))});
document.addEventListener('click',e=>{for(const menu of document.querySelectorAll('.more')) if(!menu.contains(e.target)) menu.removeAttribute('open')});
document.addEventListener('keydown',e=>{if(e.key==='Escape') document.querySelectorAll('.more').forEach(menu=>menu.removeAttribute('open'))});
const dialog=$('#search-dialog'),input=$('#search-input'),results=$('#search-results'),status=$('#search-status');
let searchData, searchRequest;
async function openSearch(){
 if(!dialog.open) dialog.showModal(); input.focus();
 if(!searchData){
  status.textContent=t('正在載入搜尋索引…','Loading search index…');
  try{const request = searchRequest ||= fetch(new URL(`/${document.documentElement.dataset.version}/${en()?'en':'zh'}/search.json`,location.origin)).then(r=>{if(!r.ok) throw Error();return r.json()}); const data=await request; if(request!==searchRequest)return; searchData=data;renderSearch()}
  catch{searchRequest=null;status.textContent=t('無法載入搜尋。請確認網路後關閉並重開搜尋；也可使用左側目錄。','Search could not load. Check your connection and reopen search, or use the sidebar.')}
 }
}
function renderSearch(){
 results.replaceChildren(); if(!searchData)return;
 const q=input.value.trim().toLocaleLowerCase();
 if(!q){status.textContent=t('輸入關鍵字，搜尋目前版本的文件。','Enter keywords to search this version of the guide.');return}
 const terms=q.split(/\s+/);
 const found=searchData.filter(d=>terms.every(t=>(d.title+' '+d.text).toLocaleLowerCase().includes(t))).sort((a,b)=>Number(b.title.toLocaleLowerCase().includes(q))-Number(a.title.toLocaleLowerCase().includes(q)));
 status.textContent=found.length?t(`找到 ${found.length} 篇文件`,`${found.length} results`):t('沒有找到結果，試試「連線」、「座標」或「通知」。','No results. Try connection, coordinates, or notifications.');
 for(const d of found){const link=document.createElement('a'),title=document.createElement('strong'),snippet=document.createElement('p');link.href=d.url;title.textContent=d.title;const start=Math.max(0,d.text.toLocaleLowerCase().indexOf(terms[0])-24);snippet.textContent=(start?'…':'')+d.text.slice(start,start+125).replace(/\s+/g,' ')+'…';link.append(title,snippet);results.append(link)}
}
$('#search-open').addEventListener('click',openSearch);$('#search-close').addEventListener('click',()=>dialog.close());input.addEventListener('input',renderSearch);
input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('a')?.focus()}});
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close()});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}});
let tocObserver;
function initPage(){
 tocObserver?.disconnect();
for(const pre of document.querySelectorAll('.prose pre')){const button=document.createElement('button');button.className='copy-code';button.textContent=t('複製','Copy');button.setAttribute('aria-label',t('複製範例內容','Copy example'));button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.querySelector('code').textContent);button.textContent=t('已複製','Copied')}catch{button.textContent=t('請手動選取','Select manually')}setTimeout(()=>button.textContent=t('複製','Copy'),2000)});pre.append(button)}
const tocLinks=[...document.querySelectorAll('.toc nav a')];
const headings=tocLinks.map(a=>document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean);
if(headings.length){const observer=tocObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting)for(const a of tocLinks)a.classList.toggle('active',decodeURIComponent(a.hash.slice(1))===entry.target.id)}},{rootMargin:'-100px 0px -60% 0px'});headings.forEach(h=>observer.observe(h));}

}
initPage();
document.addEventListener('jardi:navigate',initPage);

// Update the existing shell in place: header controls retain their DOM identity.
function syncNode(current, next) {
 if(current.nodeType!==next.nodeType || current.nodeName!==next.nodeName){current.replaceWith(next.cloneNode(true));return;}
 if(current.nodeType===Node.TEXT_NODE){if(current.textContent!==next.textContent)current.textContent=next.textContent;return;}
 if(current.nodeType!==Node.ELEMENT_NODE)return;
 for(const attr of [...current.attributes])if(!next.hasAttribute(attr.name))current.removeAttribute(attr.name);
 for(const attr of next.attributes)if(current.getAttribute(attr.name)!==attr.value)current.setAttribute(attr.name,attr.value);
 const oldChildren=[...current.childNodes],newChildren=[...next.childNodes];
 for(let i=0;i<Math.max(oldChildren.length,newChildren.length);i++){
  if(!newChildren[i])oldChildren[i].remove();
  else if(!oldChildren[i])current.append(newChildren[i].cloneNode(true));
  else syncNode(oldChildren[i],newChildren[i]);
 }
 if(current instanceof HTMLSelectElement)current.selectedIndex=next.selectedIndex;
}
let navigationController;
function variant(){return {version:document.documentElement.dataset.version,language:en()?'en':'zh'}}
function cleanPath(slug){return slug==='index'?'/':'/'+slug}
function routeFor(href, selection=variant()){
 const url=new URL(href,document.baseURI);
 const legacy=url.pathname.match(/^\/(\d+\.\d+\.\d+(?:-[\w.-]+)?)\/(zh|zh-Hant|en)\/([^/]+)\.html$/);
 const slug=legacy?legacy[3]:url.pathname.replace(/^\/|\/$/g,'').replace(/\.html$/,'')||'index';
 const chosen=legacy?{version:legacy[1],language:legacy[2]==='en'?'en':'zh'}:selection;
 return {url:new URL(cleanPath(slug)+url.search+url.hash,location.origin),source:`/${chosen.version}/${chosen.language}/${slug}.html`,...chosen};
}
let displayedURL=location.href;
history.scrollRestoration='manual';
history.replaceState({...history.state,scroll:[scrollX,scrollY]},'',location.href);
let scrollFrame;
addEventListener('scroll',()=>{
 cancelAnimationFrame(scrollFrame);
 scrollFrame=requestAnimationFrame(()=>{if(location.href===displayedURL)history.replaceState({...history.state,scroll:[scrollX,scrollY]},'',location.href)});
},{passive:true});
function positionPage(url, position) {
 if(position){scrollTo({left:position[0],top:position[1],behavior:"instant"});return;}
 if(url.hash){try{document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();}catch{} }
 else scrollTo({left:0,top:0,behavior:"instant"});
}
async function navigate(href,{pop=false,position,selection=variant(),replace=false}={}) {
 const route=routeFor(href,selection),url=route.url;
 requestedRoute=route;
 try{localStorage.setItem('jardi-language',route.language);localStorage.setItem('jardi-version',route.version)}catch{}
 navigationController?.abort();
 const controller=navigationController=new AbortController();
 try {
  const response=await fetch(route.source,{signal:controller.signal});
  if(!response.ok)throw Error('Navigation failed');
  const next=new DOMParser().parseFromString(await response.text(),'text/html');
  if(!next.querySelector('.layout') || !next.querySelector('.topbar'))throw Error('Not a documentation page');
  if(controller.signal.aborted)return;
  if(!pop)history.replaceState({...history.state,scroll:[scrollX,scrollY]},'',location.href);
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  // Set the address first so relative assets in the new content resolve correctly.
  if(!pop)history[replace?'replaceState':'pushState']({scroll:[0,0],version:route.version,language:route.language},'',url);
  displayedURL=url.href;
  document.title=next.title;
  document.documentElement.lang=next.documentElement.lang;
  document.documentElement.dataset.version=route.version;
  document.querySelector('base').href=next.querySelector('base').href;
  document.querySelector('link[rel="canonical"]').href=next.querySelector('link[rel="canonical"]').href;
  try{localStorage.setItem('jardi-language',route.language);localStorage.setItem('jardi-version',route.version)}catch{}
  document.body.dataset.page=next.body.dataset.page;
  document.body.dataset.guide=next.body.dataset.guide;
  $('meta[name="description"]').content=next.querySelector('meta[name="description"]').content;
  syncNode($('.topbar'),next.querySelector('.topbar'));
  syncNode($('.mobile-bar'),next.querySelector('.mobile-bar'));
  syncNode($('.skip-link'),next.querySelector('.skip-link'));
  // Keep search listeners attached while updating translated labels.
  syncNode(dialog,next.querySelector('#search-dialog'));
  $('.layout').replaceWith(next.querySelector('.layout'));
  searchData=searchRequest=null;input.value='';results.replaceChildren();
  themeLabel();
  document.dispatchEvent(new Event('jardi:navigate'));
  document.dispatchEvent(new Event('jardi:pageview'));
  $('#main').focus({preventScroll:true});
  positionPage(url,position);
 }catch(error){if(error.name!=='AbortError')location.assign(url.href);}
}
document.addEventListener('click',event=>{
 if(event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
 const link=event.target.closest('a[href]');
 if(!link || link.hasAttribute('download') || (link.target && link.target!=='_self'))return;
 const url=new URL(link.href,location.href);
 if(url.origin!==location.origin || !['/',...Array.from(document.querySelectorAll('.sidebar a'),a=>new URL(a.href).pathname)].includes(url.pathname))return;
 if(url.pathname===location.pathname && url.search===location.search && url.hash){
  navigationController?.abort();
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  return;
 }
 event.preventDefault();navigate(url);
});
addEventListener('popstate',event=>{
 const current=new URL(displayedURL),target=new URL(location.href);
 if(current.pathname===target.pathname && current.search===target.search && (!event.state?.language || event.state.language===variant().language) && (!event.state?.version || event.state.version===variant().version)){navigationController?.abort();displayedURL=target.href;positionPage(target,event.state?.scroll);return;}
 navigate(location.href,{pop:true,position:event.state?.scroll,selection:event.state?.version?event.state:variant()});
});
addEventListener('hashchange',()=>{displayedURL=location.href;});

// Clean public routes preserve the selected language/version across reloads.
let initial=variant();
try{
 const savedVersion=localStorage.getItem('jardi-version'),savedLanguage=localStorage.getItem('jardi-language');
 if([...$('#version').options].some(o=>o.value===savedVersion))initial.version=savedVersion;
 if(['zh','en'].includes(savedLanguage))initial.language=savedLanguage;
}catch{}
const legacyRoute=/^\/\d+\.\d+\.\d+[^/]*\/(?:zh|en)\//.test(location.pathname);
if(legacyRoute || initial.version!==variant().version || initial.language!==variant().language)navigate(location.href,{selection:initial,replace:true});
else {history.replaceState({...history.state,...initial},'',cleanPath(document.body.dataset.page)+location.search+location.hash);displayedURL=location.href;document.dispatchEvent(new Event('jardi:pageview'));}
