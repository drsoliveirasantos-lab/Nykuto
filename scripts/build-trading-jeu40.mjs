import {rolldown} from 'rolldown';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {relative,resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
import {verifyPolicy40Protocol} from '../trading/lab/jeu40-protocol-table.mjs';
const [destination,mode='verify',...extraArgs]=process.argv.slice(2);
assert.ok(!extraArgs.length&&destination&&relative(process.cwd(),resolve(destination)).startsWith('../'),'Private bundle destination required');
verifyPolicy40Protocol(await readFile('trading/lab/JEU40_PROTOCOL.md','utf8'));
const bundle=await rolldown({input:'trading/lab/jeu40-diagnostic.mjs',plugins:[{name:'strip-browser-version',resolveId(id,importer){if(id.includes('?')&&importer)return resolve(dirname(importer),id.split('?')[0]);}}]});
const {output}=await bundle.generate({format:'iife',name:'Game40',minify:true});
const hash=b=>createHash('sha256').update(b).digest('hex'),files={};
const extra=['trading/lab/JEU40_PROTOCOL.md','trading/lab/MODEL_METHODS_AND_SEASONS.md','trading/lab/jeu40-source.json','trading/lab/jeu40-protocol-table.mjs','trading/lab/jeu37-engine.mjs','scripts/test-trading-game37.mjs','scripts/test-trading-game40.mjs','scripts/test-trading-game40-protocol.mjs','scripts/run-trading-jeu40.mjs','scripts/build-trading-jeu40.mjs'];
for(const path of [...new Set([...Object.keys(output[0].modules).map(p=>relative(process.cwd(),p)),...extra])])files[path]=hash(await readFile(path));
const path='trading/lab/jeu40-freeze.json';
if(mode==='freeze')await writeFile(path,JSON.stringify({version:'jeu40-eight-months-v1',createdAt:new Date().toISOString(),files},null,2)+'\n',{flag:'wx'});
else{assert.equal(mode,'verify');const frozen=JSON.parse(await readFile(path));assert.deepEqual(files,frozen.files,'Frozen dependency changed');}
await writeFile(destination,output[0].code);console.log(JSON.stringify({dependencies:Object.keys(files).length,bundleBytes:output[0].code.length,bundleSha256:hash(output[0].code)}));await bundle.close();
