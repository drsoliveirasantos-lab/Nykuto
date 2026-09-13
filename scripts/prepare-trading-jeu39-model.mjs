import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative,dirname} from 'node:path';
import assert from 'node:assert/strict';
import {prepareInputs39} from '../trading/lab/jeu39-inputs.mjs';
import {prepareForecastRequests39,JEU39_FORECAST_POLICY} from '../trading/lab/jeu39-forecast.mjs';

const [sourceDir,output,...extra]=process.argv.slice(2),root=process.cwd();
assert.ok(!extra.length&&[sourceDir,output].every(p=>p&&relative(root,resolve(p)).startsWith('../')),'Private paths outside checkout required');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
// Reuse the already frozen source identity; no new price collection or outcome.
const pinned=JSON.parse(await readFile('trading/lab/jeu38-source.json'));
async function readChecked(name,pin){const bytes=await readFile(resolve(sourceDir,name));assert.equal(bytes.length,pin.bytes);assert.equal(hash(bytes),pin.sha256);return JSON.parse(bytes);}
const bundle=await readChecked('dataset.json',pinned.inputs.prices),mnq=await readChecked('mnq-dataset.json',pinned.inputs.mnq);
const prepared=prepareInputs39(bundle,mnq),signals=new Map();
for(const item of prepared.months){
 const stream=item.baseline.find(s=>s.symbol==='MNQ');assert.ok(stream,'MNQ baseline required');
 for(const [time,signal]of stream.signals){assert.ok(!signals.has(time),'Duplicate monthly signal');signals.set(time,signal);}
}
const groups=prepared.markets.find(m=>m.symbol==='MNQ')?.data.groups;
const result=await prepareForecastRequests39(groups,signals);
const pack={schema:'jeu39-requests-v1',policy:JEU39_FORECAST_POLICY,sourceSha256:{prices:pinned.inputs.prices.sha256,mnq:pinned.inputs.mnq.sha256},...result,executionAllowed:false};
const bytes=JSON.stringify(pack)+'\n';await mkdir(dirname(resolve(output)),{recursive:true});await writeFile(output,bytes,{flag:'wx'});
console.log(JSON.stringify({requests:result.requests.length,signals:result.links.length,missing:result.links.filter(l=>l.requestId===null).length,bytes:Buffer.byteLength(bytes),sha256:hash(bytes)}));
