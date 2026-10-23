import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pageURL, seoHead, writeCrawlFiles } from '../scripts/seo.mjs';
const config = {
 domain:'jardi.cc', languages:[{code:'zh',enabled:true},{code:'en',enabled:true},{code:'unused',enabled:false}],
 versions:[{version:'1.0.0'},{version:'0.9.0'}], pages:[{slug:'index'},{slug:'location'}]
};

test('canonical language URLs are distinct, stable for latest, and retain archived versions',()=>{
 assert.equal(pageURL(config,'1.0.0','zh','index','1.0.0'),'https://jardi.cc/');
 assert.equal(pageURL(config,'1.0.0','en','location','1.0.0'),'https://jardi.cc/en/location/');
 assert.equal(pageURL(config,'0.9.0','en','location','1.0.0'),'https://jardi.cc/0.9.0/en/location.html');
});

test('metadata escapes content, returns reciprocal languages, and describes only real app facts',()=>{
 const version={version:'1.0.0',download:'https://example.org/Jardi.dmg'};
 const page={slug:'install',title:'Download & setup',description:'Set up "Jardi" <safely>'};
 const head=seoHead(config,version,config.languages[1],page,'1.0.0');
 assert.match(head,/Download &amp; setup/);assert.match(head,/&quot;Jardi&quot; &lt;safely&gt;/);
 assert.match(head,/hreflang="zh-Hant" href="https:\/\/jardi.cc\/install\/"/);
 assert.match(head,/hreflang="en" href="https:\/\/jardi.cc\/en\/install\/"/);
 assert.match(head,/hreflang="x-default" href="https:\/\/jardi.cc\/install\/"/);
 const schema=JSON.parse(head.match(/type="application\/ld\+json">(.*?)<\/script>/)[1]);
 assert.equal(schema['@type'],'SoftwareApplication');assert.equal(schema.downloadUrl,version.download);
 assert.equal(schema.softwareVersion,version.version);assert.ok(!schema.aggregateRating && !schema.offers,'Do not invent ratings or pricing');
 assert.ok(!seoHead(config,version,config.languages[0],{...page,slug:'location'},'1.0.0').includes('application/ld+json'));
});

test('sitemap includes enabled document variants only, while demos and errors are excluded from search',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'jardi-seo-'));
 try {
  fs.mkdirSync(path.join(out,'1.0.0/zh/_Animation/demo'),{recursive:true});
  for(const file of ['404.html','index.html','1.0.0/zh/_Animation/demo/index.html'])fs.writeFileSync(path.join(out,file),'<head></head><body></body>');
  writeCrawlFiles(out,config,'1.0.0');
  const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');
  assert.equal((sitemap.match(/<loc>/g)||[]).length,8);
  assert.ok(!/404|Animation|unused/.test(sitemap));
  assert.match(fs.readFileSync(path.join(out,'robots.txt'),'utf8'),/Allow: \/\n\nSitemap: https:\/\/jardi.cc\/sitemap.xml/);
  assert.match(fs.readFileSync(path.join(out,'404.html'),'utf8'),/noindex, follow/);
  assert.match(fs.readFileSync(path.join(out,'1.0.0/zh/_Animation/demo/index.html'),'utf8'),/noindex, follow/);
  assert.ok(!fs.readFileSync(path.join(out,'index.html'),'utf8').includes('noindex'));
 } finally {fs.rmSync(out,{recursive:true,force:true})}
});
