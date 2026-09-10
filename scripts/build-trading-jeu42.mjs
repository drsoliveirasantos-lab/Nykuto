import {rolldown} from 'rolldown';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {relative,resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
import {verifyPolicy42Protocol} from '../trading/lab/jeu42-protocol-table.mjs';
const[destination,mode='verify',...extraArgs]=process.argv.slice(2);
assert.ok(!extraArgs.length&&destination&&relative(process.cwd(),resolve(destination)).startsWith('../'),'Private bundle destination required');
verifyPolicy42Protocol(await readFile('trading/lab/JEU42_PROTOCOL.md','utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex'),prior=JSON.parse(await readFile('trading/lab/jeu41-freeze.json'));
for(const[path,pin]of Object.entries(prior.files))assert.equal(hash(await readFile(path)),pin,'Game41 changed: '+path);
const bundle=await rolldown({input:'trading/lab/jeu42-diagnostic.mjs',plugins:[{name:'strip-browser-version',resolveId(id,importer){if(id.includes('?')&&importer)return resolve(dirname(importer),id.split('?')[0]);}}]});
const{output}=await bundle.generate({format:'iife',name:'Game42',minify:true}),files={};
const extra=['trading/lab/JEU42_PROTOCOL.md','trading/lab/JEU42_RESEARCH.md','trading/lab/jeu41-entry-audit.json','trading/lab/jeu42-source.json','trading/lab/jeu42-protocol-table.mjs','trading/lab/jeu41-freeze.json','scripts/test-trading-game42.mjs','scripts/test-trading-game42-protocol.mjs','scripts/run-trading-jeu42.mjs','scripts/build-trading-jeu42.mjs'];
for(const path of [...new Set([...Object.keys(output[0].modules).map(p=>relative(process.cwd(),p)),...Object.keys(prior.files),...extra])])files[path]=hash(await readFile(path));
const path='trading/lab/jeu42-freeze.json';
if(mode==='freeze')await writeFile(path,JSON.stringify({version:'jeu42-mes-pullback-volume-v1',createdAt:new Date().toISOString(),files},null,2)+'\n',{flag:'wx'});
else{assert.equal(mode,'verify');const frozen=JSON.parse(await readFile(path));assert.deepEqual(files,frozen.files,'Frozen dependency changed');}
await writeFile(destination,output[0].code);console.log(JSON.stringify({dependencies:Object.keys(files).length,bundleBytes:output[0].code.length,bundleSha256:hash(output[0].code)}));await bundle.close();
