import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

// Root-relative paths stay valid across clean routes, languages and versions.
export function installFavicons(root, out) {
 const icons=[
  ['favicon.ico','image/x-icon','16x16 32x32'],
  ['favicon-16x16.png','image/png','16x16'],
  ['favicon-32x32.png','image/png','32x32'],
  ['apple-touch-icon.png','image/png','180x180']
 ];
 const links=icons.map(([name,type,sizes])=>{
  const source=path.join(root,'favicon',name);
  fs.copyFileSync(source,path.join(out,name));
  const revision=createHash('sha256').update(fs.readFileSync(source)).digest('hex').slice(0,12);
  return `<link rel="${name==='apple-touch-icon.png'?'apple-touch-icon':'icon'}" type="${type}" sizes="${sizes}" href="/${name}?v=${revision}">`;
 }).join('');
 const visit=folder=>{
  for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
   const file=path.join(folder,entry.name);
   if(entry.isDirectory())visit(file);
   else if(entry.name.endsWith('.html')){
    const html=fs.readFileSync(file,'utf8').replace(/<link\b[^>]*\brel=["'](?:shortcut )?icon["'][^>]*>/gi,'');
    if(!/<\/head>/i.test(html))throw Error(`Missing head for favicon: ${file}`);
    fs.writeFileSync(file,html.replace(/<\/head>/i,links+'</head>'));
   }
  }
 };
 visit(out);
}
