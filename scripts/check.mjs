import {readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const data=JSON.parse(await readFile(path.join(dist,'content.json'),'utf8'));
const ids=new Set();let assets=0;
for(const p of [...data.projects,...data.prototypes]){if(ids.has(p.id)||!p.id||!p.title)throw new Error('Missing or duplicate project ID/title');ids.add(p.id);for(const asset of [p.image,p.video,p.download,...(p.sections||[]).map(s=>s.image),...(p.gallery||[])].filter(Boolean)){if(!/^https?:\/\//.test(asset)){await access(path.join(dist,asset));assets++;}}if(p.category!=='professional'&&!['level-design','game-design'].includes(p.category))throw new Error('Unknown category');}
execFileSync(process.execPath,['--check',path.join(dist,'app.js')]);execFileSync(process.execPath,['--check',path.join(root,'scripts/server.mjs')]);
console.log(`Passed: ${ids.size} unique projects, ${assets} local media references, valid content JSON and JavaScript.`);
