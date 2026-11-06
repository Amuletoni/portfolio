import {readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const data=JSON.parse(await readFile(path.join(dist,'content.json'),'utf8'));
const ids=new Set();let assets=0;
for(const p of [...data.projects,...data.prototypes]){if(ids.has(p.id)||!p.id||!p.title)throw new Error('Missing or duplicate project ID/title');if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id))throw new Error(`Project ID "${p.id}" must be lowercase letters, numbers and hyphens (it becomes the web address #project/<id>)`);ids.add(p.id);for(const asset of [p.image,p.coverImage,p.video,p.download,...(p.sections||[]).map(s=>s.image),...(p.gallery||[])].filter(Boolean)){if(!/^https?:\/\//.test(asset)){await access(path.join(dist,asset));assets++;}}if(p.category!=='professional'&&!['level-design','game-design'].includes(p.category))throw new Error('Unknown category');}
for(const s of data.studios||[]){if(s.logo&&!/^https?:\/\//.test(s.logo)){await access(path.join(dist,s.logo));assets++;}}

// Case-study layouts: bodies are text or lists of paragraphs, and dossier entries need unique URL-safe IDs.
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const keyOf=s=>String(s.id||s.title).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const isText=v=>typeof v==='string'||(Array.isArray(v)&&v.every(x=>typeof x==='string'));
const isUrl=v=>{try{return ['http:','https:'].includes(new URL(v).protocol);}catch{return false;}};
const filled=v=>typeof v==='string'&&v.trim()!=='';
const warnings=[];
for(const p of data.projects){
  if(p.layout&&!['default','dossier','pillars'].includes(p.layout))throw new Error(`Unknown layout "${p.layout}" in ${p.id}`);
  if(p.facts!==undefined&&!(Array.isArray(p.facts)&&p.facts.every(f=>Array.isArray(f)&&f.length===2&&f.every(filled))))throw new Error(`${p.id}: facts must be a list of [label, value] pairs of text`);
  const keys=new Set();
  for(const [i,s] of (p.sections||[]).entries()){
    const at=`Section ${i+1} of ${p.id}`;
    if(s.body!==undefined&&!isText(s.body))throw new Error(`${at}: body must be text or a list of paragraphs`);
    if(s.steps!==undefined&&!(Array.isArray(s.steps)&&s.steps.every(x=>typeof x==='string')))throw new Error(`${at}: steps must be a list of text`);
    if(s.tags!==undefined&&!(Array.isArray(s.tags)&&s.tags.every(t=>filled(t)||(filled(t?.label)&&(t.url===undefined||isUrl(t.url))))))throw new Error(`${at}: tags must be text or {label, url} with a web address`);
    if(s.videos!==undefined&&!(Array.isArray(s.videos)&&s.videos.every(v=>filled(v?.label)&&isUrl(v.url))))throw new Error(`${at}: videos must be a list of {label, url} with web addresses`);
    const hidden=(p.layout==='pillars'?['videos','steps','tags','tagsLabel','image']:p.layout==='dossier'?[]:['steps','tags','tagsLabel']).filter(k=>s[k]!==undefined);
    if(hidden.length)warnings.push(`${at} has ${hidden.join(', ')}, which the ${p.layout||'default'} layout does not show`);
    if(p.layout==='dossier'){const key=keyOf(s);if(!slug.test(key)||keys.has(key))throw new Error(`${at} needs a unique ID made of lowercase letters, numbers and hyphens`);keys.add(key);}
  }
  for(const k of keys)if(keys.has(`${k}-title`)||keys.has(`${k}-tags`))throw new Error(`${p.id}: entry ID "${k}" collides with "${k}-title"/"${k}-tags" (they share page anchors); rename one`);
}

// Workshop copy: related links must point at something that exists.
for(const [name,info] of Object.entries({all:data.workshop?.all,...(data.workshop?.categories||{})})){
  if(info?.related!==undefined&&!(Array.isArray(info.related)&&info.related.every(r=>typeof r?.label==='string'&&typeof r?.href==='string')))throw new Error(`Workshop "${name}": related must be a list of {label, href}`);
  for(const r of info?.related||[]){
    const m=/^#project\/([^/]+)(?:\/([^/]+))?$/.exec(r.href);
    if(m){const target=data.projects.find(p=>p.id===m[1]);if(!target)throw new Error(`Workshop link "${r.label}" (${name}) points at unknown project "${m[1]}"`);if(m[2]&&!(target.sections||[]).some(s=>keyOf(s)===m[2]))throw new Error(`Workshop link "${r.label}" (${name}) points at unknown entry "${m[2]}"`);}
    else if(!(/^#(home|work|lab|about|contact)$/.test(r.href)||/^#lab\/(all|level-design|game-design)$/.test(r.href)||isUrl(r.href)))throw new Error(`Workshop link "${r.label}" (${name}) needs a #project/…, #lab/… or web address`);
  }
}

// Placeholder text such as "[Your role]" is reported but does not fail the check. A [label](address) link that the page cannot turn into a link fails it.
const placeholders=[],brokenLinks=[];
const link=/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const scan=(value,where)=>{if(typeof value==='string'){if(/^\[[^\]]+\]$/.test(value.trim()))placeholders.push(where);if(value.replace(link,(m,label,url)=>url.includes('(')?'](':'').includes(']('))brokenLinks.push(where);}else if(Array.isArray(value))value.forEach((v,i)=>scan(v,`${where}[${i}]`));else if(value&&typeof value==='object')for(const [k,v] of Object.entries(value))scan(v,where?`${where}.${k}`:k);};
scan({projects:data.projects,studioWork:data.studioWork,workshop:data.workshop},'');
if(brokenLinks.length)throw new Error(`Broken [label](https://…) link in ${brokenLinks.slice(0,3).join(', ')}: links need a full https:// address with no ")" inside it`);

execFileSync(process.execPath,['--check',path.join(dist,'app.js')]);execFileSync(process.execPath,['--check',path.join(root,'scripts/server.mjs')]);
console.log(`Passed: ${ids.size} unique projects, ${assets} local media references, valid content JSON and JavaScript.`);
for(const w of warnings)console.warn(`Warning: ${w}.`);
if(placeholders.length)console.warn(`Warning: ${placeholders.length} placeholder text${placeholders.length===1?'':'s'} still in the content (e.g. ${placeholders.slice(0,3).join(', ')}). Replace them before publishing.`);
