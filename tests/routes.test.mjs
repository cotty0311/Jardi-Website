import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
// Exercise the actual router URL parser without requiring vendor scripts or a DOM.
const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
const parser=app.slice(app.indexOf('function cleanPath('),app.indexOf('let displayedURL='));
function route(href,selection={version:'1.0.0',language:'zh'}){
 return vm.runInNewContext(parser+'\nrouteFor(href, selection)',{href,selection,URL,document:{baseURI:'https://jardi.cc/1.0.0/zh/'},location:{origin:'https://jardi.cc'}});
}

test('English search entry points map to the correct document without changing normal clean navigation',()=>{
 for(const [href,slug] of [['/en/','index'],['/en/location/','location'],['/en/location','location']]){
  const target=route(href);
  assert.equal(target.language,'en');assert.equal(target.source,`/1.0.0/en/${slug}.html`);
  assert.equal(target.url.pathname,slug==='index'?'/':'/'+slug);
 }
 const chinese=route('/location/');assert.equal(chinese.source,'/1.0.0/zh/location.html');
 const english=route('/location',{version:'1.0.0',language:'en'});assert.equal(english.source,'/1.0.0/en/location.html');
});

test('legacy routes and version/language choices retain queries and anchors',()=>{
 const old=route('/0.9.0/en/location.html?mode=example#clear-location');
 assert.equal(old.source,'/0.9.0/en/location.html');assert.equal(old.version,'0.9.0');
 assert.equal(old.url.href,'https://jardi.cc/location?mode=example#clear-location');
 const zh=route('/1.0.0/zh-Hant/location.html');assert.equal(zh.source,'/1.0.0/zh/location.html');
 const selected=route('/en/location/',{version:'2.0.0',language:'zh'});assert.equal(selected.source,'/2.0.0/en/location.html');
});
