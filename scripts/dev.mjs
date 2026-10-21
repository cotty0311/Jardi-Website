import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { root } from './build.mjs';
import { execFileSync } from 'node:child_process';
const build=()=>execFileSync(process.execPath,[path.join(root,'scripts/build.mjs')],{stdio:'inherit'});
build();
const out=path.join(root,'dist');
let revision=Date.now(),timer;
const reload=`<script>let v;setInterval(async()=>{try{const r=await fetch('/__revision');const n=await r.text();if(v&&n!==v)location.reload();v=n}catch{}},800)</script>`;
for(const name of ['content','assets','font','scripts','site.config.json','versions']){
 const p=path.join(root,name);if(!fs.existsSync(p))continue;
 fs.watch(p,{recursive:fs.statSync(p).isDirectory()},()=>{clearTimeout(timer);timer=setTimeout(()=>{try{build();revision=Date.now()}catch(e){console.error('Build failed:',e.message)}},150)});
}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.mov':'video/quicktime'};
const server=http.createServer((req,res)=>{
 if(req.url==='/__revision'){res.setHeader('Cache-Control','no-store');res.end(String(revision));return}
 try{
  const url=new URL(req.url,'http://localhost'); let file=path.resolve(out,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(out+path.sep)&&file!==out){res.writeHead(403);res.end();return}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(path.join(out,'404.html')));return}
  const ext=path.extname(file);res.setHeader('Content-Type',mime[ext]||'application/octet-stream');res.setHeader('Cache-Control','no-store');
  if(ext==='.html'){
   const html=fs.readFileSync(file,'utf8').replace('</html>',reload+'</html>');
   res.end(req.method==='HEAD'?undefined:html);return;
  }
  const size=fs.statSync(file).size;
  res.setHeader('Accept-Ranges','bytes');
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   let start=0,end=size-1;
   if(match){
    if(match[1]){start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),size-1);}
    else if(match[2])start=Math.max(0,size-Number(match[2]));
   }
   if(!match||(!match[1]&&!match[2])||start>=size||start>end||end<0){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
   res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});
   if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);
  }else{
   res.setHeader('Content-Length',size);
   if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
  }
 }catch{res.writeHead(400);res.end('Bad request')}
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log(`Jardi preview → http://localhost:${server.address().port} (Markdown changes reload automatically)`));
