import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {writeFileSync,appendFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {runStudy43} from '../trading/lab/jeu43-diagnostic.mjs';
import {verifyPolicy43Protocol} from '../trading/lab/jeu43-protocol-table.mjs';
const[sourceDir,priorDir,outDir,...extra]=process.argv.slice(2),root=process.cwd();
assert.ok(!extra.length&&[sourceDir,priorDir,outDir].every(p=>p&&relative(root,resolve(p)).startsWith('../')),'Private paths required');
try{await access(outDir);throw Error('Output already exists: inspect and reuse, never rerun');}catch(e){if(e.code!=='ENOENT')throw e;}
const hash=b=>createHash('sha256').update(b).digest('hex'),frozen=await readFile('trading/lab/jeu43-freeze.json'),freeze=JSON.parse(frozen);
for(const[path,pin]of Object.entries(freeze.files))assert.equal(hash(await readFile(path)),pin,path);
verifyPolicy43Protocol(await readFile('trading/lab/JEU43_PROTOCOL.md','utf8'));
const prePerformanceCommit=execFileSync('git',['log','-1','--format=%H','--','trading/lab/jeu43-freeze.json'],{encoding:'utf8'}).trim();
assert.equal(hash(execFileSync('git',['show',`${prePerformanceCommit}:trading/lab/jeu43-freeze.json`])),hash(frozen));
assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),prePerformanceCommit,'Execute from the published freeze checkout');
const src=JSON.parse(await readFile('trading/lab/jeu43-source.json'));
async function checked(path,pin){const b=await readFile(path);assert.equal(b.length,pin.bytes,path);assert.equal(hash(b),pin.sha256,path);return JSON.parse(b);}
const prices=await checked(resolve(sourceDir,'dataset.json'),src.inputs.prices),mnq=await checked(resolve(sourceDir,'mnq-dataset.json'),src.inputs.mnq),prior=await checked(resolve(priorDir,'runs-private.json'),src.inputs.prior);
await checked(resolve(priorDir,'report.json'),src.inputs.priorReport);
await mkdir(outDir);
const startedAt=new Date().toISOString(),statusPath=resolve(outDir,'status.json');
const checkpoint=data=>{const record={game:43,prePerformanceCommit,startedAt,updatedAt:new Date().toISOString(),...data};writeFileSync(statusPath,JSON.stringify(record,null,2)+'\n');appendFileSync(resolve(outDir,'progress.jsonl'),JSON.stringify(record)+'\n');};
checkpoint({status:'running',completed:0,total:48});
console.log(JSON.stringify({status:'running',game:43,startedAt,prePerformanceCommit,total:48,outDir}));
try{
 const result=runStudy43(prices,mnq,prior,progress=>checkpoint({status:'running',...progress}));
 Object.assign(result.report,{prePerformanceCommit,freezeSha256:hash(frozen),generatedAt:new Date().toISOString(),startedAt});
 const outputs={};
 for(const[name,data]of [['report.json',result.report],['runs-private.json',result.privateRuns]]){
  const bytes=Buffer.from(JSON.stringify(data)+'\n');await writeFile(resolve(outDir,name),bytes,{flag:'wx'});outputs[name]={bytes:bytes.length,sha256:hash(bytes)};
 }
 checkpoint({status:'completed',completed:48,total:48,outputs,audit:result.report.audit,selection:null,executionAllowed:false});
 console.log(JSON.stringify({status:'completed',outDir,outputs}));
}catch(error){checkpoint({status:'failed',message:error.message,stack:error.stack,executionAllowed:false});throw error;}
