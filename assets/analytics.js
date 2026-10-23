(() => {
 // This optional module never blocks navigation, downloads or feedback.
 try {
  if(window.self!==window.top || window.__jardiAnalyticsInstalled)return;
  const node=document.getElementById('jardi-analytics-config');
  if(!node)return;
  const settings=JSON.parse(node.textContent);
  if(settings.hostname && ![settings.hostname,'www.'+settings.hostname].includes(location.hostname))return;
  window.__jardiAnalyticsInstalled=true;
  const safe=callback=>(...args)=>{try{return callback(...args)}catch{}};
  const cleanURL=value=>{
   try{const url=new URL(value,location.origin);return /^https?:$/.test(url.protocol)?url.origin+url.pathname:''}catch{return ''}
  };
  let lastView,started=false;
  function loadScript(id,src,attributes={}) {
   if(document.getElementById(id))return;
   const script=document.createElement('script');script.id=id;script.async=true;script.src=src;
   for(const [name,value] of Object.entries(attributes))script.setAttribute(name,value);
   document.head.append(script);
  }
  function start(view) {
   if(started)return;started=true;
   if(settings.ga4MeasurementId){
    window.dataLayer=window.dataLayer || [];
    window.gtag=window.gtag || function(){window.dataLayer.push(arguments)};
    window.gtag('js',new Date());
    window.gtag('config',settings.ga4MeasurementId,{send_page_view:false,page_location:view.page_location,page_referrer:cleanURL(document.referrer)});
    loadScript('jardi-ga4','https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(settings.ga4MeasurementId));
   }
   if(settings.cloudflareToken)loadScript('jardi-cloudflare','https://static.cloudflareinsights.com/beacon.min.js',{type:'module','data-cf-beacon':JSON.stringify({token:settings.cloudflareToken,spa:true})});
  }
  function context() {
   return {page_location:cleanURL(location.href),page_title:document.title,
    page_slug:document.body.dataset.page || 'standalone',
    content_language:document.documentElement.lang==='en'?'en':'zh-TW',
    jardi_version:document.documentElement.dataset.version || ''};
  }
  const emit=(name,parameters)=>{
   if(settings.ga4MeasurementId && typeof window.gtag==='function')window.gtag('event',name,{send_to:settings.ga4MeasurementId,...context(),...parameters});
  };
  const pageView=safe(()=>{
   const view=context(),key=JSON.stringify([view.page_slug,view.page_location,view.content_language,view.jardi_version]);
   if(lastView?.key===key)return;
   start(view);
   const previous=lastView;
   lastView={...view,key};
   if(settings.ga4MeasurementId){
    window.gtag('set',{page_location:view.page_location,page_title:view.page_title,page_referrer:previous?.page_location || cleanURL(document.referrer)});
    emit('page_view',{page_referrer:previous?.page_location || cleanURL(document.referrer)});
    if(previous && previous.content_language!==view.content_language)emit('language_switch',{previous_language:previous.content_language,selected_language:view.content_language});
    if(document.body.dataset.guide==='true')emit('guide_view',{guide_slug:view.page_slug});
   }
  });
  // The router announces committed content, after language restoration settles.
  // Do not observe pushState/replaceState: scrolling also writes history state.
  document.addEventListener('jardi:pageview',pageView);
  const standalone=()=>{if(!document.querySelector('.layout'))pageView()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',standalone,{once:true});else standalone();
  document.addEventListener('click',safe(event=>{
   if(event.button!==0 || !lastView)return;
   const target=event.target.closest('a[href],button');
   if(!target)return;
   const link=target.matches('a[href]')?new URL(target.href,location.href):null;
   if(link && /\.dmg$/i.test(link.pathname))emit('dmg_download',{file_name:decodeURIComponent(link.pathname.split('/').pop()),link_url:cleanURL(link.href)});
   else if(target.id==='report-open')emit('feedback_click',{action:'open_form'});
   else if(link && link.origin===location.origin && /\/problem(?:\.html)?\/?$/.test(link.pathname))emit('feedback_click',{action:'open_page'});
  }),{capture:true});
 } catch { /* Analytics is optional, including when a browser blocks scripts. */ }
})();
