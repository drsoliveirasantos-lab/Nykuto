import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {relative,resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
import {verifyPolicy46Protocol} from '../trading/lab/jeu46-protocol-table.mjs';
const [mode='verify',...extra]=process.argv.slice(2);assert.ok(!extra.length&&['freeze','verify'].includes(mode));
const root=process.cwd(),hash=b=>createHash('sha256').update(b).digest('hex');
verifyPolicy46Protocol(await readFile('trading/lab/JEU46_PROTOCOL.md','utf8'));
const prior=JSON.parse(await readFile('trading/lab/jeu45-freeze.json'));
for(const [path,pin]of Object.entries(prior.files))assert.equal(hash(await readFile(path)),pin,'Historical freeze changed: '+path);
const files={...prior.files};
async function visit(path){
 if(files[path])return;
 const bytes=await readFile(path),text=bytes.toString();files[path]=hash(bytes);
 for(const m of text.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)){
  const dependency=relative(root,resolve(dirname(path),m[1].split('?')[0]));
  assert.ok(!dependency.startsWith('../'),'Dependency escaped repository');await visit(dependency);
 }
}
for(const path of ['trading/lab/jeu46-diagnostic.mjs','scripts/run-trading-jeu46.mjs','scripts/build-trading-jeu46.mjs','scripts/test-trading-game46.mjs','trading/lab/jeu46-protocol-table.mjs','trading/lab/JEU46_PROTOCOL.md','trading/lab/JEU46_RESEARCH.md','trading/lab/jeu46-source.json','trading/lab/jeu45-freeze.json'])await visit(path);
const path='trading/lab/jeu46-freeze.json';
if(mode==='freeze')await writeFile(path,JSON.stringify({version:'jeu46-closed-invalidation-v1',createdAt:new Date().toISOString(),files},null,2)+'\n',{flag:'wx'});
else assert.deepEqual(JSON.parse(await readFile(path)).files,files,'Frozen dependencies changed');
console.log(JSON.stringify({dependencies:Object.keys(files).length,mode}));
