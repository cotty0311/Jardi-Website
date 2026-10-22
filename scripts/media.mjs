import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

// Markdown paths stay relative to content/zh or content/en. Generated media
// are copied beside each language's HTML, so deployment needs no root URL.
export function renderMedia(html, language, outputFolder) {
 html=html.replace(/\b(src|href|poster)="\.\.\/(images|image|_Animation)\//g,'$1="$2/');
 html=html.replace(/<img\b[^>]*>/g,tag=>{
  const src=tag.match(/\bsrc="([^"]+)"/)?.[1];
  if(!src)return tag;
  const shot=src.match(/^images\/screenshot\/(block|open_edit_csv)(?:-(?:light|dark)-(?:zh|en))?\.png$/);
  if(!shot)return tag;
  const name=shot[1],locale=language==='en'?'en':'zh';
  const light=`images/screenshot/${name}-light-${locale}.png`;
  const dark=`images/screenshot/${name}-dark-${locale}.png`;
  for(const file of [light,dark])if(!fs.existsSync(path.join(outputFolder,file)))throw Error(`Missing themed screenshot: ${file}`);
  // Intrinsic dimensions reserve the image's aspect ratio while CSS controls size.
  const png=fs.readFileSync(path.join(outputFolder,light));
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  tag=tag.replace(/\s(?:style|width|height)="[^"]*"/g,'').replace(`src="${src}"`,`src="${light}" width="${width}" height="${height}"`);
  return `<picture class="theme-picture ${name==='block'?'interface-shot':'editor-shot'}"><source data-theme-source="dark" media="(prefers-color-scheme: dark)" srcset="${dark}">${tag}</picture>`;
 });
 // Serve pre-generated WebP files; original Markdown/source assets stay editable.
 const manifestFile=path.join(outputFolder,'images/optimized.json');
 const manifest=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):{};
 html=html.replace(/\b(src|srcset|poster)="([^"?#]+)\.(png|jpg|jpeg)"/g,(match,attr,file,extension)=>{
  const original=`${file}.${extension}`,optimized=path.join(outputFolder,file+'.webp');
  const expected=manifest[original.replace(/^images\//,'')];
  const valid=expected&&fs.existsSync(optimized)&&createHash('sha256').update(fs.readFileSync(path.join(outputFolder,original))).digest('hex')===expected;
  return valid?`${attr}="${file}.webp"`:match;
 });
 return html.replace(/<img\b[^>]*>/g,tag=>tag.includes('loading=')?tag:tag.replace('<img','<img decoding="async"'+(tag.includes('connection-art')?' fetchpriority="high"':' loading="lazy"')));
}
