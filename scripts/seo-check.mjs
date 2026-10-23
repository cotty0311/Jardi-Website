import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pageURL, languageTag } from './seo.mjs';

export function checkSEO(out, config) {
 const files = folder => fs.readdirSync(folder,{withFileTypes:true}).flatMap(e => e.isDirectory() ? files(path.join(folder,e.name)) : [path.join(folder,e.name)]);
 const htmlFiles = files(out).filter(file => file.endsWith('.html'));
 const docs = htmlFiles.filter(file => fs.readFileSync(file,'utf8').includes('class="layout"'));
 const canonicalURLs = new Set();
 const latest = config.versions.filter(v=>v.status==='stable').sort((a,b)=>b.version.localeCompare(a.version,undefined,{numeric:true}))[0] || config.versions.find(v=>v.version===config.current) || config.versions[0];
 const readURL = url => {
  const parsed = new URL(url);
  assert.equal(parsed.origin,`https://${config.domain}`);
  let file = path.join(out,parsed.pathname);
  if(fs.existsSync(file) && fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  assert.ok(fs.existsSync(file),`Missing SEO URL: ${url}`);
  const html = fs.readFileSync(file,'utf8');
  assert.ok(!/http-equiv="refresh"|name="robots" content="noindex/i.test(html),`SEO URL redirects or excludes indexing: ${url}`);
  return html;
 };
 for (const file of docs) {
  const html=fs.readFileSync(file,'utf8'), head=html.match(/<head>(.*?)<\/head>/s)[1];
  const version=html.match(/data-version="([^"]+)"/)[1];
  const language=html.match(/<html lang="([^"]+)"/)[1];
  const code=config.languages.find(l=>languageTag(l)===language).code;
  const slug=html.match(/data-page="([^"]+)"/)[1];
  const canonical=pageURL(config,version,code,slug,latest.version);
  canonicalURLs.add(canonical);
  assert.equal((head.match(/<title>/g)||[]).length,1,`Duplicate title: ${file}`);
  assert.ok(head.match(/<title>([^<]+)<\/title>/)[1].includes('Jardi'));
  const descriptions=[...head.matchAll(/name="description" content="([^"]+)"/g)];
  assert.equal(descriptions.length,1,`Missing/duplicate description: ${file}`);
  assert.ok(!/[<>]|\{\{/.test(descriptions[0][1]),`Unrendered description: ${file}`);
  if(code==='en')assert.ok(!/[\u3400-\u9fff]/u.test(descriptions[0][1]),`Chinese English description: ${file}`);
  assert.ok(head.includes('name="robots" content="index, follow"'));
  assert.equal((head.match(/rel="canonical"/g)||[]).length,1);
  assert.ok(head.includes(`rel="canonical" href="${canonical}"`),`Canonical mismatch: ${file}`);
  assert.ok(readURL(canonical).includes(`rel="canonical" href="${canonical}"`));
  for(const lang of config.languages.filter(l=>l.enabled)){
   const alternate=pageURL(config,version,lang.code,slug,latest.version);
   const link=`rel="alternate" hreflang="${languageTag(lang)}" href="${alternate}"`;
   assert.ok(head.includes(link),`Missing alternate: ${file}`);
   assert.ok(readURL(alternate).includes(`hreflang="${languageTag(config.languages.find(l=>l.code===code))}" href="${canonical}"`),`Missing reciprocal hreflang: ${alternate}`);
  }
  assert.ok(head.includes('hreflang="x-default"'));
  const schemas=[...head.matchAll(/type="application\/ld\+json">(.*?)<\/script>/gs)];
  assert.equal(schemas.length,['index','install'].includes(slug)?1:0);
  for(const [,data] of schemas){const app=JSON.parse(data);assert.equal(app['@type'],'SoftwareApplication');assert.equal(app.softwareVersion,version);assert.ok(app.name&&app.operatingSystem&&app.description);}
 }
 const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');
 assert.ok(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
 assert.ok(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
 assert.equal(urls.length,new Set(urls).size,'Duplicate sitemap URL');
 assert.deepEqual(new Set(urls),canonicalURLs,'Every public document canonical must appear in sitemap');
 for(const url of urls)readURL(url);
 const robots=fs.readFileSync(path.join(out,'robots.txt'),'utf8');
 assert.ok(robots.includes('User-agent: *\nAllow: /'));
 assert.ok(!/^Disallow:\s*\S/m.test(robots));
 assert.ok(robots.includes(`Sitemap: https://${config.domain}/sitemap.xml`));
 console.log(`SEO passed: ${docs.length} document renders, ${urls.length} canonical sitemap URLs, reciprocal hreflang, metadata, structured data and robots.txt.`);
}
