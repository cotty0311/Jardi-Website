import fs from 'node:fs';
import path from 'node:path';

const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
export const languageTag = language => language.code === 'zh' ? 'zh-Hant' : language.htmlLang || language.code;

// The default language retains the original clean routes. Language entry points
// are static HTML, so crawlers do not need storage, cookies, or JavaScript.
export function publicPath(version, language, slug, latest, defaultLanguage = 'zh') {
 if (version !== latest) return `/${version}/${language}/${slug}.html`;
 const prefix = language === defaultLanguage ? '' : `/${language}`;
 return `${prefix}${slug === 'index' ? '/' : '/' + slug + '/'}`;
}
export function pageURL(config, version, language, slug, latest) {
 return `https://${config.domain}${publicPath(version, language, slug, latest, config.languages.find(l => l.enabled).code)}`;
}

export function seoHead(config, version, language, page, latest) {
 const url = pageURL(config, version.version, language.code, page.slug, latest);
 const title = page.slug === 'index'
  ? (language.code === 'en' ? 'Jardi - Location Tool | iPhone location simulator for Mac' : 'Jardi - Location Tool | Mac 上的 iPhone 虛擬定位工具')
  : `${page.title} | Jardi - Location Tool ${version.version}`;
 const alternates = config.languages.filter(l => l.enabled).map(l => `<link data-jardi-seo rel="alternate" hreflang="${escape(languageTag(l))}" href="${escape(pageURL(config, version.version, l.code, page.slug, latest))}">`).join('');
 let schema = '';
 if (['index', 'install'].includes(page.slug)) {
  const app = {
   '@context': 'https://schema.org', '@type': 'SoftwareApplication',
   '@id': `https://${config.domain}/#software`, name: 'Jardi - Location Tool',
   url: `https://${config.domain}/`, applicationCategory: 'UtilitiesApplication',
   operatingSystem: 'macOS 14 or later (Apple Silicon)', softwareVersion: version.version,
   description: language.code === 'en'
    ? 'A Mac app for simulating your iPhone’s location, saving favorite places, and moving along custom routes.'
    : '在 Mac 上控制 iPhone 虛擬定位、收藏地點，並依自定路線移動的工具。',
   image: `https://${config.domain}/assets/jardi.png`,
   inLanguage: config.languages.filter(l => l.enabled).map(languageTag),
   author: {'@type': 'Person', name: 'jardiniere_pkm'},
   softwareHelp: {'@type': 'WebPage', url: pageURL(config, version.version, language.code, 'interface', latest)},
   ...(version.download ? {downloadUrl: version.download} : {})
  };
  schema = `<script data-jardi-seo type="application/ld+json">${json(app)}</script>`;
 }
 return `<title>${escape(title)}</title><meta data-jardi-seo name="description" content="${escape(page.description)}"><meta data-jardi-seo name="robots" content="index, follow"><link data-jardi-seo rel="canonical" href="${escape(url)}">${alternates}<link data-jardi-seo rel="alternate" hreflang="x-default" href="${escape(pageURL(config, version.version, config.languages.find(l => l.enabled).code, page.slug, latest))}">${schema}`;
}

export function writeCrawlFiles(out, config, latest) {
 const urls = [];
 for (const version of config.versions) for (const page of version.pages || config.pages) for (const language of config.languages.filter(l => l.enabled)) {
  urls.push(pageURL(config, version.version, language.code, page.slug, latest));
 }
 fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
 fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: https://${config.domain}/sitemap.xml\n`);
 // Embeds and the error document are crawlable resources, not search results.
 const visit = folder => {
  for (const entry of fs.readdirSync(folder, {withFileTypes: true})) {
   const file = path.join(folder, entry.name);
   if (entry.isDirectory()) visit(file);
   else if (entry.name.endsWith('.html') && (file.includes(`${path.sep}_Animation${path.sep}`) || entry.name === '404.html')) {
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('</head>', '<meta name="robots" content="noindex, follow"></head>'));
   }
  }
 };
 visit(out);
}
