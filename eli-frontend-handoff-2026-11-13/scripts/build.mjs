import {copyFile, mkdir, readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const base=new URL('../',import.meta.url);
for(const group of ['src/design/styles/','src/design/scripts/','src/preview/']){
  for(const name of await readdir(new URL(group,base))){
    await mkdir(new URL('public/assets/',base),{recursive:true});
    await copyFile(new URL(group+name,base),new URL('public/assets/'+name,base));
  }
}
console.log('Design layer copied to public/assets. Core React bundle is unchanged.');
