import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { analyticsConfig, installAnalytics } from '../scripts/analytics.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const script=fs.readFileSync(path.join(root,'assets/analytics.js'),'utf8');
// Synthetic IDs are restricted to offline tests. No vendor script is executed.
const configured={cloudflareToken:'a'.repeat(32),ga4MeasurementId:'G-1234567890',hostname:'jardi.cc'};

test('configuration is disabled by default, validates IDs, and gates GA history tracking',()=>{
 assert.equal(analyticsConfig({},{}).ga4MeasurementId,'');
 assert.equal(analyticsConfig({},{}).cloudflareToken,'');
 assert.throws(()=>analyticsConfig({analytics:{ga4MeasurementId:configured.ga4MeasurementId}},{}),/history/);
 assert.throws(()=>analyticsConfig({analytics:{ga4MeasurementId:'not-an-id'}},{}),/Measurement ID/);
 assert.throws(()=>analyticsConfig({analytics:{cloudflareToken:'not-a-site-token'}},{}),/site token/);
 const config={domain:'jardi.cc',analytics:{...configured,ga4HistoryTrackingDisabled:true}};
 assert.equal(analyticsConfig(config,{}).ga4MeasurementId,configured.ga4MeasurementId);
 assert.equal(analyticsConfig(config,{JARDI_GA4_MEASUREMENT_ID:'',JARDI_GA4_HISTORY_TRACKING_DISABLED:''}).ga4MeasurementId,configured.ga4MeasurementId,'Empty Actions variables retain config-file settings');
 assert.equal(analyticsConfig(config,{JARDI_GA4_MEASUREMENT_ID:'G-0987654321'}).ga4MeasurementId,'G-0987654321');
});

test('shared build hook covers documents, standalone pages, and all versions, excluding redirects',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'jardi-analytics-'));
 try{
  for(const route of ['index.html','location/index.html','1.0.0/zh/location.html','2.0.0/en/location.html','404.html','demo/index.html']){
   const file=path.join(out,route);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'<html><head></head><body></body></html>');
  }
  fs.writeFileSync(path.join(out,'redirect.html'),'<html><head><meta http-equiv="refresh" content="0;url=/"></head></html>');
  installAnalytics(root,out,{cloudflareToken:'',ga4MeasurementId:''});
  assert.ok(!fs.readFileSync(path.join(out,'index.html'),'utf8').includes('analytics.js'));
  installAnalytics(root,out,configured);
  for(const route of ['index.html','location/index.html','1.0.0/zh/location.html','2.0.0/en/location.html','404.html','demo/index.html']){
   const html=fs.readFileSync(path.join(out,route),'utf8');
   assert.equal((html.match(/id="jardi-analytics-config"/g)||[]).length,1);
   assert.match(html,/<head><script id="jardi-analytics-config"/);
   assert.match(html,/defer src="\/assets\/analytics.js\?v=[a-f0-9]+"/);
  }
  assert.ok(!fs.readFileSync(path.join(out,'redirect.html'),'utf8').includes('analytics.js'));
 }finally{fs.rmSync(out,{recursive:true,force:true})}
});

function browser(settings=configured,{embedded=false,hostname='jardi.cc',blocked=false,layout=true}={}) {
 const handlers={},scripts=[],nodes=new Map();
 nodes.set('jardi-analytics-config',{textContent:JSON.stringify(settings)});
 const document={title:'虛擬定位 · Jardi',referrer:'https://example.org/link?email=private#secret',readyState:'loading',
  documentElement:{lang:'zh-Hant'},body:{dataset:{page:'location',guide:'true'}},
  getElementById:id=>nodes.get(id),querySelector:selector=>selector==='.layout'&&layout?{}:null,
  addEventListener:(type,callback)=>{(handlers[type] ||= []).push(callback)},
  createElement:()=>({setAttribute(name,value){this[name]=value}}),
  head:{append(node){if(blocked)throw Error('Blocked');scripts.push(node);nodes.set(node.id,node)}}};
 const window={};window.self=window;window.top=embedded?{}:window;
 const location={hostname,origin:'https://'+hostname,href:'https://'+hostname+'/location?private=value#anchor'};
 const context=vm.createContext({window,document,location,URL,Date,JSON,encodeURIComponent,decodeURIComponent});
 vm.runInContext(script,context);
 const dispatch=(type,event={})=>{for(const callback of handlers[type] || [])callback(event)};
 const calls=()=>Array.from(window.dataLayer || [],args=>Array.from(args));
 const events=name=>calls().filter(([type,event])=>type==='event'&&event===name);
 const view=(page,lang='zh-Hant',version='1.0.0',guide=true)=>{
  document.body.dataset={page,guide:String(guide)};document.documentElement.lang=lang;document.documentElement.dataset={version};
  location.href=location.origin+'/'+page;document.title=page+' · Jardi';dispatch('jardi:pageview');
 };
 const click=(href,id='')=>{const target={href,id,matches:()=>Boolean(href),closest:()=>target};const event={button:0,target,preventDefault(){throw Error('Analytics must not prevent clicks')}};dispatch('click',event)};
 document.documentElement.dataset={version:'1.0.0'};
 return {document,window,location,scripts,dispatch,calls,events,view,click,context};
}

test('manual page views track committed content exactly once and retain language/version dimensions',()=>{
 const b=browser();b.dispatch('DOMContentLoaded');assert.equal(b.events('page_view').length,0,'Wait for saved-language hydration');
 b.view('location','en');b.dispatch('jardi:pageview');
 assert.equal(b.events('page_view').length,1);assert.equal(b.events('guide_view').length,1);
 assert.equal(b.calls().find(c=>c[0]==='config')[2].send_page_view,false);
 assert.equal(b.scripts.length,2);assert.equal(JSON.parse(b.scripts.find(s=>s.id==='jardi-cloudflare')['data-cf-beacon']).spa,true);
 b.location.href+='?email=private#next';b.dispatch('jardi:pageview');assert.equal(b.events('page_view').length,1,'Queries and anchors do not duplicate views');
 b.view('location','zh-Hant');assert.equal(b.events('language_switch').length,1);assert.equal(b.events('page_view').length,2);
 b.view('location','zh-Hant','2.0.0');assert.equal(b.events('page_view').length,3,'Same route, different documentation version');
 b.view('install','zh-Hant','2.0.0',false);b.view('location','zh-Hant','2.0.0');
 assert.equal(b.events('page_view').length,5,'Revisiting a guide counts again');assert.equal(b.events('guide_view').length,4);
 assert.equal(b.events('language_switch').length,1);assert.equal(b.scripts.length,2,'Vendor scripts load only once');
 vm.runInContext(script,b.context);b.dispatch('jardi:pageview');assert.equal(b.events('page_view').length,5,'Duplicate script execution is harmless');
 assert.ok(!JSON.stringify(b.calls()).includes('private'),'Remove query/fragment data from analytics URLs');
});

test('DMG and feedback clicks emit metadata without consuming the browser action or report fields',()=>{
 const b=browser();b.view('install','en','1.0.0',false);
 b.click('https://github.com/cotty0311/Jardi-LocationTool/releases/download/v1.0.0/Jardi.dmg?private=token');
 b.click('https://jardi.cc/problem');b.click('', 'report-open');b.click('https://example.org/problem');b.click('https://jardi.cc/video.mp4');
 assert.equal(b.events('dmg_download').length,1);assert.equal(b.events('dmg_download')[0][2].file_name,'Jardi.dmg');
 assert.equal(b.events('feedback_click').length,2);assert.ok(!JSON.stringify(b.calls()).includes('token'));
});

test('independent providers, embedded frames, local previews, blocked scripts and disabled IDs are safe',()=>{
 for(const settings of [{...configured,ga4MeasurementId:''},{...configured,cloudflareToken:''}]){
  const b=browser(settings);b.view('location');assert.equal(b.scripts.length,1);
 }
 for(const options of [{embedded:true},{hostname:'localhost'},{blocked:true}]){
  const b=browser(configured,options);assert.doesNotThrow(()=>{b.view('location');b.view('install');b.click('https://jardi.cc/problem')});
  if(!options.blocked)assert.equal(b.scripts.length,0);
 }
 const disabled=browser({cloudflareToken:'',ga4MeasurementId:''});disabled.view('location');assert.equal(disabled.scripts.length,0);
 const standalone=browser(configured,{layout:false});standalone.dispatch('DOMContentLoaded');assert.equal(standalone.events('page_view').length,1);
});
