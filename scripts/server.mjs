import http from 'node:http';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const port=Number(process.env.PORT||4173);
const token=randomBytes(24).toString('hex');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm','.zip':'application/zip','.pdf':'application/pdf','.wasm':'application/wasm'};
const respond=(res,status,data,type='application/json')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(type==='application/json'?JSON.stringify(data):data);};
async function body(req,max){const chunks=[];let total=0;for await(const chunk of req){total+=chunk.length;if(total>max)throw Object.assign(new Error('File too large.'),{status:413});chunks.push(chunk);}return Buffer.concat(chunks);}
function validate(data){if(!data.profile||!Array.isArray(data.projects)||!Array.isArray(data.prototypes))throw new Error('Invalid content structure.');const ids=new Set();for(const p of data.prototypes){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id)||ids.has(p.id))throw new Error('Each prototype needs a unique lowercase URL slug.');ids.add(p.id);if(!p.title?.trim()||!['level-design','game-design'].includes(p.category))throw new Error('Each prototype needs a title and category.');for(const key of ['image','video','videoUrl','playableUrl','download']){if(p[key]){const u=new URL(p[key],`http://127.0.0.1:${port}`);if(!['http:','https:'].includes(u.protocol))throw new Error('Only HTTP, HTTPS, and local media paths are supported.');}}}return data;}
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,`http://127.0.0.1:${port}`);
 if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.host)){respond(res,403,{error:'Local access only.'});return;}
 if(url.pathname.startsWith('/api/')){
  if(req.headers['x-studio-token']!==token){respond(res,403,{error:'Open the local editor to continue.'});return;}
  const origin=req.headers.origin;if(origin&&!['http://localhost:'+port,'http://127.0.0.1:'+port].includes(origin)){respond(res,403,{error:'Local origin required.'});return;}
  if(url.pathname==='/api/content'&&req.method==='PUT'){const data=validate(JSON.parse((await body(req,2*1024*1024)).toString()));await writeFile(path.join(root,'content.backup.json'),await readFile(path.join(dist,'content.json')));await writeFile(path.join(dist,'content.json'),JSON.stringify(data,null,2)+'\n');respond(res,200,{saved:true});return;}
  if(url.pathname==='/api/upload'&&req.method==='POST'){const original=url.searchParams.get('name')||'';const ext=path.extname(original).toLowerCase();if(!['.webp','.jpg','.jpeg','.png','.mp4','.webm','.zip','.pdf'].includes(ext)){respond(res,400,{error:'Choose a JPG, PNG, WebP, MP4, WebM, ZIP, or PDF file.'});return;}const data=await body(req,200*1024*1024);const name=path.basename(original,ext).replace(/[^a-z0-9-]/gi,'-').slice(0,60)||'asset';await mkdir(path.join(dist,'uploads'),{recursive:true});const relative=`uploads/${name}-${randomBytes(4).toString('hex')}${ext}`;await writeFile(path.join(dist,relative),data);respond(res,201,{path:relative});return;}
  respond(res,404,{error:'Unknown editor action.'});return;
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){respond(res,405,{error:'Method not allowed.'});return;}
 if(url.pathname==='/studio'){const html=(await readFile(path.join(root,'scripts/studio.html'),'utf8')).replace('__STUDIO_TOKEN__',token);respond(res,200,html,'text/html; charset=utf-8');return;}
 const requested=decodeURIComponent(url.pathname);const file=path.resolve(dist,'.'+(requested==='/'?'/index.html':requested));if(!file.startsWith(dist+path.sep)){respond(res,403,{error:'Invalid path.'});return;}
 let data;try{const s=await stat(file);if(!s.isFile())throw new Error();data=await readFile(file);}catch{respond(res,404,'Not found','text/plain');return;}
 const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
 const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):data.length-1,data.length-1);if(start>end){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:data.subarray(start,end+1));return;}
 res.writeHead(200,{...headers,'Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);
 }catch(e){respond(res,e.status||400,{error:e.message});}
}).listen(port,'127.0.0.1',()=>console.log(`Portfolio: http://127.0.0.1:${port}\nContent editor: http://127.0.0.1:${port}/studio`));
