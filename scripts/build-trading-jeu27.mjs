import {rolldown} from 'rolldown';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {relative,resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
const [destination,mode='verify']=process.argv.slice(2);
assert.ok(destination&&relative(process.cwd(),resolve(destination)).startsWith('../'),'Private bundle destination required');
const bundle=await rolldown({input:'trading/lab/jeu27-diagnostic.mjs',plugins:[{name:'strip-browser-version',resolveId(id,importer){if(id.includes('?')&&importer)return resolve(dirname(importer),id.split('?')[0]);}}]});
const {output}=await bundle.generate({format:'iife',name:'Game27',minify:true});
const hash=b=>createHash('sha256').update(b).digest('hex'),files={};
for(const path of [...Object.keys(output[0].modules).map(p=>relative(process.cwd(),p)),'trading/lab/JEU27_PROTOCOL.md','scripts/test-trading-filter-diagnostic.mjs','scripts/run-trading-jeu27.mjs','scripts/build-trading-jeu27.mjs','trading/lab/jeu26-source.json'])files[path]=hash(await readFile(path));
const path='trading/lab/jeu27-freeze.json';
if(mode==='freeze')await writeFile(path,JSON.stringify({version:'jeu27-filter-diagnostic-v1',createdAt:new Date().toISOString(),files},null,2)+'\n',{flag:'wx'});
else{assert.equal(mode,'verify');const frozen=JSON.parse(await readFile(path));assert.deepEqual(files,frozen.files,'Frozen dependency changed');}
await writeFile(destination,output[0].code);
console.log(JSON.stringify({dependencies:Object.keys(files).length,bundleBytes:output[0].code.length,bundleSha256:hash(output[0].code)}));
await bundle.close();
