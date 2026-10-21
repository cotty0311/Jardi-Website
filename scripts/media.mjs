import fs from 'node:fs';
import path from 'node:path';

// Markdown paths stay relative to content/zh or content/en. Generated media
// are copied beside each language's HTML, so deployment needs no root URL.
export function renderMedia(html, language, outputFolder) {
 html=html.replace(/\b(src|href|poster)="\.\.\/(images|image|_Animation)\//g,'$1="$2/');
 return html.replace(/<img\b[^>]*>/g,tag=>{
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
}
