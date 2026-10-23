import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {build,root} from './build.mjs';
import {analyticsConfig} from './analytics.mjs';
const tracking=analyticsConfig(build());
const out=path.join(root,'dist');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const files=walk(out), htmlFiles=files.filter(f=>f.endsWith('.html'));
let count=0;
for(const f of htmlFiles){
 const html=fs.readFileSync(f,'utf8');
 const head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
 assert.ok(head,`Missing head: ${f}`);
 for(const name of ['favicon.ico','favicon-16x16.png','favicon-32x32.png','apple-touch-icon.png']){
  assert.ok(head.includes(`href="/${name}?v=`),`Missing favicon ${name}: ${f}`);
 }
 const analyticsEnabled=Boolean(tracking.cloudflareToken || tracking.ga4MeasurementId);
 const redirect=/http-equiv=["']refresh["']/i.test(html);
 const trackingConfig=html.match(/<script id="jardi-analytics-config" type="application\/json">([\s\S]*?)<\/script>/);
 assert.equal(Boolean(trackingConfig),analyticsEnabled&&!redirect,`Analytics inclusion mismatch: ${f}`);
 if(trackingConfig){
  assert.deepEqual(JSON.parse(trackingConfig[1]),tracking,`Analytics config mismatch: ${f}`);
  assert.equal((html.match(/src="\/assets\/analytics.js\?v=/g)||[]).length,1,`Duplicate analytics module: ${f}`);
  const appIndex=html.indexOf('src="../../assets/app.js');
  if(appIndex!==-1)assert.ok(html.indexOf('src="/assets/analytics.js')<appIndex,`Analytics must register before router startup: ${f}`);
 }
 const pageURL=new URL('/'+path.relative(out,f),'https://jardi.cc');
 const baseURL=new URL(html.match(/<base href="([^"]+)"/)?.[1] || pageURL.href,pageURL);
 const resolveLink=link=>{
  const url=new URL(link,baseURL);
  let target=path.join(out,decodeURIComponent(url.pathname));
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(url.hash && html.includes('<base ')){
   const slug=url.pathname.replace(/^\/|\/$/g,'')||'index';
   const localized=path.join(out,baseURL.pathname,slug+'.html');
   if(fs.existsSync(localized))target=localized;
  }
  return {target,hash:url.hash.slice(1)};
 };
 assert.ok(!/<!--\s*#?\s*TODO/i.test(html), `尚未完成 TODO: ${f}`);
 assert.ok(!/\{\{(?:download|version-status|update-status|report-form)\}\}/.test(html), `未處理標記: ${f}`);
 if(/[/\\](zh|en)[/\\][^/\\]+\.html$/.test(f)) {
  assert.ok(!/value="[^"\n]*\/ko\//.test(html),`Unexpected language option: ${f}`);
  assert.equal((html.match(/<details class="more/g)||[]).length,2,`Expected Guide and More dropdowns: ${f}`);
  if(f.endsWith('problem.html')) {
   assert.ok(html.includes(`name="language" value="${f.includes('/en/')?'en':'zh-TW'}"`),`Missing feedback language: ${f}`);
   assert.ok(!html.includes('name="consent"'),`Obsolete consent field: ${f}`);
  }
 }
 if(/[/\\](zh|en)[/\\][^/\\]+\.html$/.test(f)) {
  for(const [,link] of html.matchAll(/<option[^>]*value="([^"\n]+\.html)"/g))assert.ok(fs.existsSync(resolveLink(link).target),`Missing language route: ${link}`);
  assert.ok(!/(?:src|srcset|href)="http:\/\//.test(html),`Insecure resource: ${f}`);
 }
 if(html.includes('class="layout"')){
  assert.ok(html.includes('<base href="/'),`Missing content base: ${f}`);
  for(const [,href] of html.matchAll(/<a[^>]*href="([^"]+)"/g)){
   if(href.startsWith('/')&&!href.startsWith('//'))assert.ok(!/\.html|\/(?:zh|en)\/|\d+\.\d+\.\d+/.test(href),`Noncanonical document link: ${href}`);
  }
  if(html.includes('data-page="install"')){
   const download=html.match(/<a[^>]*class="button"[^>]*href="([^"]+\.dmg)"[^>]*>/)?.[0];
   assert.ok(download?.includes(' download')&&!download.includes('target='),`Download must stay in the current tab: ${f}`);
  }
 }
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,`重複 ID: ${f}`);
 for(const [,link] of html.matchAll(/(?:href|src|srcset|poster|data-url)="([^"]+)"/g)){
  if(/^(https?:|mailto:|data:)/.test(link))continue;
  if(link===html.match(/<base href="([^"]+)"/)?.[1])continue;
  const {target,hash}=resolveLink(link);
  assert.ok(fs.existsSync(target),`缺少檔案: ${link} (${f})`);
  if(hash){assert.ok(fs.readFileSync(target,'utf8').includes(`id="${decodeURIComponent(hash)}"`),`缺少錨點: ${link} (${f})`)}
  count++;
 }
 if(/[/\\](zh|en)[/\\]/.test(f) && !f.includes(`${path.sep}_Animation${path.sep}`))assert.equal((html.match(/<h1\b/g)||[]).length,1,`H1 必須只有一個: ${f}`);
}
// CSS resources resolve relative to the stylesheet, including on project Pages URLs.
for(const f of files.filter(f=>f.endsWith('.css'))){
 const css=fs.readFileSync(f,'utf8');
 for(const [,resource] of css.matchAll(/url\(["']?([^\s"')]+)["']?\)/g)){
  if(/^(https?:|data:|#)/.test(resource))continue;
  assert.ok(!resource.startsWith('/'),`CSS 資源需使用相對路徑: ${resource}`);
  assert.ok(fs.existsSync(path.resolve(path.dirname(f),resource)),`缺少 CSS 資源: ${resource} (${f})`);
  count++;
 }
}
for(const f of files.filter(f=>f.endsWith('search.json'))){const docs=JSON.parse(fs.readFileSync(f));assert.ok(docs.length);for(const doc of docs){assert.ok(doc.title&&doc.text);assert.ok(fs.existsSync(path.join(out,doc.url==='/'?'index.html':doc.url+'/index.html')))}}
console.log(`Passed: ${htmlFiles.length} HTML pages, ${count} local asset/link/anchor references, search indexes.`);
