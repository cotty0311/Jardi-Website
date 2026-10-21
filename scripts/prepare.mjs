import fs from 'node:fs';
import path from 'node:path';
import {root,build} from './build.mjs';
let version=process.argv[2];
if(!version){
 const plist=path.join(root,'../Scripts/Info.plist');
 if(fs.existsSync(plist))version=fs.readFileSync(plist,'utf8').match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/)?.[1];
}
if(!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version||''))throw Error('請指定版本：npm run version:prepare -- 1.1.0；在 App 專案內可省略版本，自動讀取 Info.plist。');
const file=path.join(root,'site.config.json');const config=JSON.parse(fs.readFileSync(file));
if(config.versions.some(v=>v.version===version&&v.status==='stable'))throw Error('此版本已有 stable 快照；請指定下一個版本號。');
config.versions=config.versions.filter(v=>v.status==='stable');
config.versions.unshift({version,status:'preview',content:'content',download:null});config.current=version;
fs.writeFileSync(file,JSON.stringify(config,null,2)+'\n');build();
