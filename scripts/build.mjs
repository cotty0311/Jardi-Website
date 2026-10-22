import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';
import { reportForm } from './components.mjs';
import { translate } from './i18n.mjs';
import { renderMedia } from './media.mjs';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const slugify = s => s.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-');
const write = (file, content) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); };
export function build() {
 const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json')));
 const out = path.join(root, 'dist');
 const versions = config.versions;
 if (!versions.length || new Set(versions.map(v=>v.version)).size !== versions.length) throw Error('版本不可空白或重複');
 for (const v of versions) {
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(v.version) || !['stable','preview'].includes(v.status)) throw Error('無效版本或狀態');
  if (v.status === 'stable' && !/^https:\/\//.test(v.download || '')) throw Error('stable 必須提供 HTTPS 下載網址');
 }
 const latest = versions.filter(v=>v.status === 'stable').sort((a,b)=>b.version.localeCompare(a.version, undefined, {numeric:true}))[0] || versions.find(v=>v.version === config.current) || versions[0];
 const languages = config.languages.filter(l=>l.enabled);
 if (!languages.length) throw Error('至少需要一個語言');
 fs.rmSync(out, {recursive:true,force:true});
 fs.mkdirSync(out, { recursive: true });
 fs.cpSync(path.join(root,'assets'), path.join(out,'assets'), {recursive:true});
 fs.cpSync(path.join(root,'font'), path.join(out,'font'), {recursive:true});
 const label = v => `${v.version} · ${v.status === 'stable' ? 'stable' : '準備中'}`;
 for (const v of versions) for (const lang of languages) {
  const isEnglish = lang.code === 'en';
  const pages = (v.pages || config.pages).map(p=>isEnglish ? {...p,title:translate(p.title),group:translate(p.group),description:fs.readFileSync(path.join(root,v.content,'en',p.file),'utf8').split('\n').find(line=>line && !line.startsWith('#')) || translate(p.title)} : p);
  const folder = path.join(out, v.version, lang.code);
  // Keep Markdown-local images beside each version/language's generated pages.
  const contentRoot = path.join(root, v.content, lang.code);
  for (const name of ['image', 'images', '_Animation']) {
   const localSource = path.join(contentRoot, name);
   const source = fs.existsSync(localSource) ? localSource : path.join(root, v.content, name);
   if (fs.existsSync(source)) fs.cpSync(source, path.join(folder, name), {recursive:true, filter: file => !['.DS_Store', 'README.md'].includes(path.basename(file)) && !file.endsWith('.mov')});
  }
  // Isolate supplied animation styles; adapt height and color through a tiny bridge.
  const demos = path.join(folder, '_Animation');
  if (fs.existsSync(demos)) for (const name of fs.readdirSync(demos)) {
   const file = path.join(demos, name, 'index.html');
   if (!fs.existsSync(file)) continue;
   const html = fs.readFileSync(file, 'utf8')
    .replace('</head>', '<link rel="stylesheet" href="../../../../assets/embed.css"></head>')
    .replace('</body>', '<script src="../../../../assets/embed.js"></script></body>');
   fs.writeFileSync(file, isEnglish ? html.replace('lang="zh-Hant"','lang="en"').replace(/開始|暫停|停止|重置|路徑動畫展示|正方形螺旋路徑動畫|中心標記|移動角色|目前位置/g,t=>({'開始':'Start','暫停':'Pause','停止':'Stop','重置':'Reset','路徑動畫展示':'Route animation','正方形螺旋路徑動畫':'Square spiral animation','中心標記':'Center marker','移動角色':'Moving character','目前位置':'Current position'}[t])) : html);
   if(isEnglish){const js=path.join(demos,name,'script.js');fs.writeFileSync(js,fs.readFileSync(js,'utf8').replace(/暫停|繼續/g,t=>t==='暫停'?'Pause':'Resume'));}
  }
  const docs = pages.map(page => ({...page, raw: fs.readFileSync(path.join(contentRoot,page.file), 'utf8')}));
  const index = [];
  for (const [pageIndex, page] of docs.entries()) {
   const toc = [], counts = new Map();
   const marked = new Marked({gfm:true});
   marked.use({renderer: {
    heading({tokens,depth}) {
     const text = this.parser.parseInline(tokens), base = slugify(text), n = counts.get(base) || 0;
     counts.set(base,n+1); const id = base + (n ? `-${n}` : '');
     if (depth === 2) toc.push({text:text.replace(/<[^>]*>/g,''),id});
     return `<h${depth} id="${id}">${text}</h${depth}>`;
    },
    link({href,title,tokens}) {
     if (/\.md(?:#|$)/.test(href)) {
      const [file,hash] = href.split('#'); const target = pages.find(p=>p.file === file || (file === 'Examples.md' && p.file === 'Example.md'));
      if (!target) throw Error(`找不到文件連結: ${href}`);
      href = `${target.slug}.html${hash ? '#'+hash : ''}`;
     }
     if (/^(javascript|data):/i.test(href)) throw Error('不支援此連結協定');
     return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ''}>${this.parser.parseInline(tokens)}</a>`;
    }
   }});
   let raw = page.raw.replace('{{download}}', v.download ? `<a class="button" href="${esc(v.download)}" download>⬇︎ 下載 Jardi ${esc(v.version)} · macOS</a>` : '> **正式版準備中**：目前尚未提供此版本的公開安裝包。發佈後，這裡會提供對應版本的 DMG 下載。你可以先閱讀設定步驟。');
   raw = raw.replace('{{version-status}}', `這份指南對應 Jardi **${v.version}**（${v.status === 'stable' ? '正式版' : '準備中'}）。請以右上角所選版本的安裝與操作說明為準。`)
    .replace('{{update-status}}', v.status === 'stable' ? '確認 Mac 可以存取 GitHub 更新來源。若更新來源暫時無法下載，可稍後重試，或從本版本的[安裝頁](Install.md)取得安裝包。回報時請附上版本與完整錯誤訊息。' : '此版本正在準備中，先前測試版已撤下。正式版上線前，既有更新網址可能沒有 appcast，因而顯示下載失敗；正式發佈後請以安裝頁的資訊為準。');
   if(isEnglish) raw = page.raw.replace('{{download}}', v.download ? `<a class="button" href="${esc(v.download)}" download>↓ Download Jardi ${esc(v.version)} · macOS</a>` : '> **Release in preparation:** a public installer is not yet available for this version. Its DMG download will appear here when released. You can read the setup instructions now.')
    .replace('{{version-status}}', `This guide covers Jardi **${v.version}** (${v.status === 'stable' ? 'stable' : 'preview'}). Follow the instructions for the version selected in the header.`)
    .replace('{{update-status}}', v.status === 'stable' ? 'Check that your Mac can access the GitHub update source. Retry later or use the [installation page](Install.md). Include the version and complete error message in a report.' : 'This version is being prepared and previous test builds have been withdrawn. Existing update URLs may have no appcast until release. Check the installation page for release information.');
   let body = marked.parse(raw).replace('<p>{{report-form}}</p>', reportForm(config, v.version, lang.htmlLang || lang.code));
   body = renderMedia(body, lang.code, folder);
   let intro = '';
   if (page.slug === 'index') {
    const h1 = body.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1] || page.title;
    const p = body.match(/<p>(.*?)<\/p>/s)?.[1] || page.description;
    body = body.replace(/<h1[^>]*>.*?<\/h1>\s*<p>.*?<\/p>/s,'');
    intro = `<section class="hero"><div class="hero-copy"><span class="eyebrow"></span><h1>${h1}</h1><p>${p}</p><div class="hero-actions"><a class="button" href="install.html">開始使用 <span>↗</span></a><a class="text-link" href="interface.html">閱讀使用指南 →</a></div><span class="hero-note"> </span></div><div class="hero-art"><img src="../../assets/jardi.png" alt="粉色花朵與蝴蝶翅膀的 Jardi 花園插畫" width="420" height="420"><span class="art-caption"></span></div></section><div class="quick-facts"><span>⌘ &nbsp; macOS 14+</span><span>◉ &nbsp; Apple Silicon</span><span>⌁ &nbsp; USB 連接 iPhone</span><span>文 &nbsp; 繁體中文指南</span></div>`;
   }
   index.push({title:page.title,url:`${page.slug}.html`,text:raw.replace(/<!--.*?-->/gs,'').replace(/\{\{[^}]+\}\}/g,'').replace(/<[^>]*>/g,'').replace(/[#*`>|]/g,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')});
   const prev=docs[pageIndex-1],next=docs[pageIndex+1];
   const sidebar = [...new Set(pages.map(p=>p.group))].map(group=>`<div class="nav-group"><p>${esc(group)}</p>${pages.filter(p=>p.group===group).map(p=>`<a ${p.slug===page.slug ? 'class="active" aria-current="page"' : ''} href="${p.slug}.html"><span aria-hidden="true">${p.icon}</span>${esc(p.title)}</a>`).join('')}</div>`).join('');
   const versionOptions=versions.map(other=>`<option value="${other.version}" data-url="../../${other.version}/${lang.code}/${(other.pages || config.pages).some(p=>p.slug===page.slug) ? page.slug : 'index'}.html" ${other.version===v.version?'selected':''}>${esc(label(other))}</option>`).join('');
   const html=`<!doctype html>
<html lang="${lang.htmlLang || lang.code}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(page.description)}"><meta name="theme-color" content="#fffcf2"><title>${esc(page.title)} · Jardi ${v.version}</title><link rel="icon" href="../../assets/jardi.png"><link rel="stylesheet" href="../../assets/style.css"><script>try{document.documentElement.dataset.theme=localStorage.getItem('jardi-theme')||'auto'}catch{}</script><script src="../../assets/app.js" defer></script><script src="../../assets/media.js" defer></script><script src="../../assets/report.js" defer></script></head>
<body data-page="${page.slug}"><a class="skip-link" href="#main">跳到主要內容</a><header class="topbar"><div class="topbar-inner"><a class="brand" href="index.html"><img src="../../assets/jardi.png" width="36" height="36" alt=""><span>Jardi<span class="brand-dot">.</span></span></a><nav class="top-nav" aria-label="主要導覽"><a href="install.html" ${page.slug==='install'?'aria-current="page"':''}>Install</a><details class="more guide" ${['interface','location','movement','images','notifications','data'].includes(page.slug)?'aria-current="page"':''}><summary>User Guide <span>⌄</span></summary><div>${pages.filter(p=>['interface','location','movement','images','notifications','data'].includes(p.slug)).map(p=>`<a href="${p.slug}.html" ${p.slug===page.slug?'aria-current="page"':''}>${esc(p.title)}</a>`).join('')}</div></details><a href="examples.html" ${page.slug==='examples'?'aria-current="page"':''}>Example</a><details class="more"><summary>More <span>⌄</span></summary><div><a href="faq.html">FAQ · 常見問題</a><a href="about.html">About us · 關於</a><a href="problem.html">Problem · 回報問題</a><a href="support.html">Support · 贊助支持</a></div></details></nav><div class="toolbar"><select id="version" aria-label="Jardi 文件版本">${versionOptions}</select><button id="search-open" aria-label="搜尋文件"><span>⌕</span><span class="search-label">搜尋</span><kbd>⌘ K</kbd></button><button id="theme" title="切換色彩模式" aria-label="切換色彩模式">◐</button><select id="language" aria-label="文件語言">${config.languages.map(l=>`<option value="../${l.code}/${page.slug}.html" ${l.enabled?'':'disabled'} ${l.code===lang.code?'selected':''}>${esc(l.label)}</option>`).join('')}</select></div></div></header>
<div class="mobile-bar"><button id="menu" aria-expanded="false" aria-controls="sidebar">☰ &nbsp; 文件目錄</button><span>Jardi ${esc(v.version)}</span></div><div class="layout"><aside class="sidebar" id="sidebar" aria-label="文件目錄"><a href="index.html" class="sidebar-heading">THE JARDI HANDBOOK <span>✿</span></a>${sidebar}</aside><main id="main" tabindex="-1"><div class="breadcrumbs"><a href="index.html">文件</a><span>/</span><span>${esc(page.group)}</span><span class="version-tag">${esc(label(v))}</span></div>${intro}${toc.length ? `<details class="mobile-toc"><summary>在這一頁</summary>${toc.map(t=>`<a href="#${esc(t.id)}">${esc(t.text)}</a>`).join('')}</details>` : ''}<article class="prose">${body}</article><div class="page-nav">${prev?`<a href="${prev.slug}.html"><small>← 上一頁</small>${esc(prev.title)}</a>`:'<span></span>'}${next?`<a href="${next.slug}.html"><small>接著閱讀 →</small>${esc(next.title)}</a>`:''}</div><footer><span>Jardi <span class="pink">✿</span> &nbsp;</span><a href="problem.html">協助改善這一頁 ↗</a></footer></main><aside class="toc" aria-label="本頁目錄"><p>在這一頁</p><nav>${toc.map(t=>`<a href="#${esc(t.id)}">${esc(t.text)}</a>`).join('')}</nav</aside></div>
<dialog id="search-dialog" aria-labelledby="search-title"><div class="search-heading"><h2 id="search-title">搜尋 Jardi 指南</h2><button id="search-close" aria-label="關閉搜尋">✕</button></div><label class="sr-only" for="search-input">搜尋關鍵字</label><input id="search-input" type="search" placeholder="搜尋定位、安裝、Orbit…" autocomplete="off"><p id="search-status" role="status">輸入關鍵字，搜尋目前版本的文件。</p><div id="search-results"></div><small class="search-foot">目前版本 ${esc(v.version)} · Esc 關閉</small></dialog></body></html>`;
   write(path.join(folder,`${page.slug}.html`),isEnglish ? translate(html) : html);
  }
  write(path.join(folder,'search.json'),JSON.stringify(index));
  if(lang.code === 'zh') for(const page of pages){
   const target=`../zh/${page.slug}.html`;
   write(path.join(out,v.version,'zh-Hant',`${page.slug}.html`),`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><title>Jardi</title></head><body><a href="${target}">前往繁體中文文件</a><script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script></body></html>`);
  }
 }
 const dest = `${latest.version}/${languages[0].code}/index.html`;
 write(path.join(out,'index.html'),`<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${dest}"><title>Jardi 使用指南</title><a href="${dest}">閱讀 Jardi 使用指南</a></html>`);
 write(path.join(out,'404.html'),'<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>找不到頁面 · Jardi</title><body style="font:18px system-ui;background:#fffcf2;color:#4e4533;padding:10vw"><h1>這條小路還沒有頁面。</h1><p>請確認網址，或用瀏覽器返回上一頁，從文件目錄繼續探索。</p></body></html>');
 write(path.join(out,'.nojekyll'),'');
 if (config.domain) write(path.join(out,'CNAME'), config.domain+'\n');
 else fs.rmSync(path.join(out,'CNAME'),{force:true});
 console.log(`Built ${versions.length} version(s), ${languages.length} language(s) → Website/dist (default: ${latest.version})`);
 return config;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) build();
