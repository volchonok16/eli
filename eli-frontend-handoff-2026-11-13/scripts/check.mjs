import {readdir,readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const base=fileURLToPath(new URL('../',import.meta.url)),pub=path.join(base,'public');
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);out.push(...e.isDirectory()?await walk(p):[p]);}return out;}
let count=0;
for(const file of await walk(pub)){
 if(file.endsWith('.html')){
  count++;
  for(const m of (await readFile(file,'utf8')).matchAll(/(?:src|href)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){
   const p=path.join(pub,m[1]);if(!await stat(p).catch(()=>false))throw new Error(`Missing asset: ${m[1]}`);
  }
 }
 if(file.endsWith('.js'))execFileSync(process.execPath,['--check',file]);
}
for(const file of await walk(path.join(base,'src')))if(file.endsWith('.js'))execFileSync(process.execPath,['--check',file]);
console.log(`OK: ${count} HTML entries, local references and JavaScript syntax.`);
