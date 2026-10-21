import fs from 'node:fs';
import path from 'node:path';
import { root, build } from './build.mjs';
const [version, download]=process.argv.slice(2);
if(!/^\d+\.\d+\.\d+$/.test(version||'')||!download||!/^https:\/\//.test(download)){
 console.error('用法：npm run version:release -- 1.0.0 https://github.com/OWNER/REPO/releases/download/v1.0.0/Jardi-Location-Tool-1.0.0.dmg');process.exit(1);
}
const configPath=path.join(root,'site.config.json');
const config=JSON.parse(fs.readFileSync(configPath));
const existing=config.versions.find(v=>v.version===version);
const destination=path.join(root,'versions',version);
if(existing?.status==='stable'||fs.existsSync(destination))throw Error('此版本已存在；不能覆蓋歷史文件，請使用新版本號。');
const source=config.versions.find(v=>v.version===config.current)?.content || 'content';
if(source!=='content')throw Error('發佈來源必須是 content；先在 site.config.json 設定目前工作版本。');
// Validate all pages before changing the release registry.
build();
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.cpSync(path.join(root,source),destination,{recursive:true});
const release={version,status:'stable',content:`versions/${version}`,download,pages:config.pages};
config.versions=config.versions.filter(v=>v.version!==version);
config.versions.unshift(release);config.current=version;
fs.writeFileSync(configPath,JSON.stringify(config,null,2)+'\n');
build();
console.log(`已保存 ${version} 文件快照。下次開發：在 versions 陣列新增 preview，content 設為 "content"，並更新 current。未上傳網站或 App。`);
