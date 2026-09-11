import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {runStudy41} from '../trading/lab/jeu41-diagnostic.mjs';
import {verifyPolicy41Protocol} from '../trading/lab/jeu41-protocol-table.mjs';
const[sourceDir,priorDir,outDir,...extra]=process.argv.slice(2),root=process.cwd();
assert.ok(!extra.length&&[sourceDir,priorDir,outDir].every(p=>p&&relative(root,resolve(p)).startsWith('../')),'Private paths required');
try{await access(outDir);throw Error('Output already exists: verify and reuse, never rerun');}catch(e){if(e.code!=='ENOENT')throw e;}
const hash=b=>createHash('sha256').update(b).digest('hex'),frozen=await readFile('trading/lab/jeu41-freeze.json'),freeze=JSON.parse(frozen);
for(const[path,pin]of Object.entries(freeze.files))assert.equal(hash(await readFile(path)),pin,path);
verifyPolicy41Protocol(await readFile('trading/lab/JEU41_PROTOCOL.md','utf8'));
const prePerformanceCommit=execFileSync('git',['log','-1','--format=%H','--','trading/lab/jeu41-freeze.json'],{encoding:'utf8'}).trim();
assert.equal(hash(execFileSync('git',['show',`${prePerformanceCommit}:trading/lab/jeu41-freeze.json`])),hash(frozen));
assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),prePerformanceCommit,'Execute from the published freeze checkout');
const src=JSON.parse(await readFile('trading/lab/jeu41-source.json'));
async function readChecked(path,pin){const b=await readFile(path);assert.equal(b.length,pin.bytes,path);assert.equal(hash(b),pin.sha256,path);return JSON.parse(b);}
const prices=await readChecked(resolve(sourceDir,'dataset.json'),src.inputs.prices),mnq=await readChecked(resolve(sourceDir,'mnq-dataset.json'),src.inputs.mnq),prior=await readChecked(resolve(priorDir,'runs-private.json'),src.inputs.prior),priorReport=await readChecked(resolve(priorDir,'report.json'),src.inputs.priorReport),entryAudit=await readChecked('trading/lab/jeu41-entry-audit.json',src.inputs.entryAudit);
assert.equal(priorReport.executionCount,16);assert.equal(priorReport.audit.passed,true);assert.equal(entryAudit.sourceRunsSha256,src.inputs.prior.sha256);assert.equal(entryAudit.sourceReportSha256,src.inputs.priorReport.sha256);assert.equal(entryAudit.newReplays,0);assert.equal(entryAudit.newInferences,0);
await mkdir(outDir);
const result=await runStudy41(prices,mnq,prior);
Object.assign(result.report,{prePerformanceCommit,freezeSha256:hash(frozen),entryAuditSha256:src.inputs.entryAudit.sha256,referenceReportSha256:src.inputs.priorReport.sha256,generatedAt:new Date().toISOString()});
for(const[name,data]of [['report.json',result.report],['runs-private.json',result.privateRuns]])await writeFile(resolve(outDir,name),JSON.stringify(data)+'\n',{flag:'wx'});
console.log(JSON.stringify({audit:result.report.audit,review:result.report.review,summaries:result.report.summaries}));
