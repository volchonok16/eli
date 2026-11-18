import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('../public/',import.meta.url)));
const index=process.argv.indexOf('--port');
const port=Number(index<0?8770:process.argv[index+1]);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid port');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json; charset=utf-8'};
http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Preview only');}
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const parts=name.split('/');
  if(parts.some(p=>p.startsWith('.')||p.includes('\\'))){res.writeHead(404);return res.end('Not found');}
  let target=path.resolve(root,'.'+name);
  if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(404);return res.end('Not found');}
  let info=await stat(target).catch(()=>null);
  if(info?.isDirectory()){target=path.join(target,'index.html');info=await stat(target).catch(()=>null);}
  let status=200;
  if(!info?.isFile()){
   if(/^\/product\/[^/]+\/?$/.test(name)){target=path.join(root,'index.html');}
   else{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Not found');}
  }
  const body=await readFile(target);
  res.writeHead(status,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(400);res.end('Invalid request');}
}).listen(port,'127.0.0.1',()=>console.log(`Eli preview: http://127.0.0.1:${port}`));
