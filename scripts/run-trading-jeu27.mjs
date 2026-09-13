import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {runDiagnostic,monthlyArchive} from '../trading/lab/jeu27-diagnostic.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),[sourceDir,outDir]=process.argv.slice(2);
const hash=b=>createHash('sha256').update(b).digest('hex');
assert.ok([sourceDir,outDir].every(p=>p&&relative(root,resolve(p)).startsWith('../')),'Paths must be outside repository');
const freezeRaw=await readFile(resolve(root,'trading/lab/jeu27-freeze.json')),freeze=JSON.parse(freezeRaw);
for(const [path,sha]of Object.entries(freeze.files))assert.equal(hash(await readFile(resolve(root,path))),sha,path);
const source=JSON.parse(await readFile(resolve(root,'trading/lab/jeu26-source.json')));
async function load(name,bytes,sha){const raw=await readFile(resolve(sourceDir,name));assert.equal(raw.length,bytes);assert.equal(hash(raw),sha);return JSON.parse(raw);}
const bundle=await load('dataset.json',source.bytes,source.sha256),mnq=await load('mnq-dataset.json',source.mnqBytes,source.mnqSha256);
const reference=await load('reference-train.json',source.reference.bytes,source.reference.sha256);
const value=runDiagnostic(bundle,mnq,reference);
const monthly=await load('jeu20-holdout-runs-private.json',472016,'18ba0e4c506dc7d7ca9c55e19207f258f03281cb8e1af90568e1a27e002ac2d9');
value.report.monthlyMYM=monthlyArchive(monthly);
value.report.freezeSha256=hash(freezeRaw);value.report.source=source;
await mkdir(outDir,{recursive:true});
for(const [name,data]of [['report.json',value.report],['train-runs-private.json',value.privateRuns]])
  await writeFile(resolve(outDir,name),JSON.stringify(data,(_,v)=>v===Infinity?'Infinity':v,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({configurations:value.report.results.length,audit:value.report.audit}));
