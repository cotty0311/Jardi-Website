import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {build,root} from './build.mjs';
build();
const out=path.join(root,'dist');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const files=walk(out), htmlFiles=files.filter(f=>f.endsWith('.html'));
let count=0;
for(const f of htmlFiles){
 const html=fs.readFileSync(f,'utf8');
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
  for(const [,link] of html.matchAll(/<option[^>]*value="([^"\n]+\.html)"/g))assert.ok(fs.existsSync(path.resolve(path.dirname(f),link)),`Missing language route: ${link}`);
  assert.ok(!/(?:src|srcset|href)="http:\/\//.test(html),`Insecure resource: ${f}`);
 }
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,`重複 ID: ${f}`);
 for(const [,link] of html.matchAll(/(?:href|src|srcset|poster|data-url)="([^"]+)"/g)){
  if(/^(https?:|mailto:|data:)/.test(link))continue;
  const [pathname,hash]=link.split('#');const target=path.resolve(path.dirname(f),decodeURIComponent(pathname)||path.basename(f));
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
for(const f of files.filter(f=>f.endsWith('search.json'))){const docs=JSON.parse(fs.readFileSync(f));assert.ok(docs.length);for(const doc of docs){assert.ok(doc.title&&doc.text);assert.ok(fs.existsSync(path.join(path.dirname(f),doc.url)))}}
console.log(`Passed: ${htmlFiles.length} HTML pages, ${count} local asset/link/anchor references, search indexes.`);
