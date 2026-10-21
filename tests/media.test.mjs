import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { renderMedia } from '../scripts/media.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const language of ['zh','en'])for(const name of ['block','open_edit_csv']){
 test(`${name} includes both ${language} variants and intrinsic dimensions`,()=>{
  const html=renderMedia(`<img src="../images/screenshot/${name}-light-${language}.png" alt="Guide image" style="width:3000px">`,language,path.join(root,'content'));
  assert.ok(html.includes(`src="images/screenshot/${name}-light-${language}.png"`));
  assert.ok(html.includes(`srcset="images/screenshot/${name}-dark-${language}.png"`));
  assert.match(html,/width="\d+" height="\d+"/);
  assert.ok(!html.includes('3000px'));
 });
}
test('theme override and new route images follow the site mode',()=>{
 let sources=[{media:'(prefers-color-scheme: dark)'}];
 const observers=[],events={};
 const document={documentElement:{dataset:{theme:'light'}},querySelectorAll:selector=>selector.startsWith('source')?sources:[],addEventListener:(event,fn)=>events[event]=fn};
 const context=vm.createContext({document,window:{addEventListener(){}},matchMedia:()=>({matches:true,addEventListener(){}}),MutationObserver:class{constructor(fn){observers.push(fn)}observe(){}}});
 vm.runInContext(fs.readFileSync(path.join(root,'assets/media.js'),'utf8'),context);
 assert.equal(sources[0].media,'not all');
 document.documentElement.dataset.theme='dark';observers.forEach(fn=>fn());assert.equal(sources[0].media,'all');
 sources=[{media:''}];events['jardi:navigate']();assert.equal(sources[0].media,'all');
 document.documentElement.dataset.theme='auto';observers.forEach(fn=>fn());assert.equal(sources[0].media,'(prefers-color-scheme: dark)');
});
test('English articles contain no Chinese supplementary prose',()=>{
 for(const file of fs.readdirSync(path.join(root,'content/en')).filter(f=>f.endsWith('.md'))){
  const raw=fs.readFileSync(path.join(root,'content/en',file),'utf8').replace(/<[^>]*>/g,'').replace(/\]\([^)]*\)/g,']');
  assert.ok(!/\p{Script=Han}/u.test(raw),file);
 }
});
