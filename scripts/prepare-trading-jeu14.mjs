import { readFile,writeFile } from 'node:fs/promises';
import { resolve,relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { JEU14_POLICY,JEU14_SEGMENTS,historyCalendar } from '../trading/lab/jeu14-policy.mjs';
import { inspectHistory } from '../trading/lab/jeu14-history.mjs';
import { sessionFor } from '../trading/lab/session-comparison.mjs';
const dir=process.argv[2],root=fileURLToPath(new URL('../',import.meta.url));
if(!dir||!relative(root,resolve(dir)).startsWith('../'))throw new Error('Private output required.');
const hash=t=>createHash('sha256').update(t).digest('hex');
function parse(text){
 if(/truncated|Next page|Preview|Stored /.test(text))throw new Error('Incomplete CSV capture.');
 const lines=text.trim().split(/\r?\n/),headers=lines.shift().split(',');
 return lines.map(line=>{const v=line.split(',');if(v.length!==headers.length)throw new Error('Invalid CSV.');return Object.fromEntries(headers.map((h,i)=>[h,v[i]]));});
}
const scheduleSources=[],scheduleEvents=[];
for(const name of ['schedules_early','schedules_2025','schedules_2026']){
 const text=await readFile(resolve(dir,name+'.csv'),'utf8');scheduleSources.push({file:name+'.csv',sha256:hash(text)});
 scheduleEvents.push(...parse(text).filter(e=>e.session_end_date>=JEU14_POLICY.from&&e.session_end_date<JEU14_POLICY.end));
}
const segments=[];
for(const d of JEU14_SEGMENTS){
 const csv=await readFile(resolve(dir,d.ticker+'.csv'),'utf8'),reference=await readFile(resolve(dir,d.ticker+'-contract.csv'),'utf8'),contract=parse(reference);
 if(contract.length!==1||contract[0].ticker!==d.ticker||contract[0].last_trade_date!==d.expiry||Number(contract[0].trade_tick_size)!==.25||contract[0].trading_venue!=='XCME'||contract[0].active!=='true')throw new Error('Contract reference differs.');
 const sessions=new Map(historyCalendar(d.prep,d.end).map(s=>[s.date,s]));
 const bars=parse(csv).flatMap(row=>{
  if(row.ticker!==d.ticker)throw new Error('Wrong ticker.');
  const values=['time','open','high','low','close','volume'].map(k=>row[k]===''||row[k]===undefined?NaN:Number(row[k]));
  if(!values.every(Number.isFinite))throw new Error('Invalid prices.');
  const local=sessionFor(values[0]),s=sessions.get(local.day),close=s?Number(s.close.slice(11,13))*60+Number(s.close.slice(14,16)):null;
  return s&&local.minute>=570&&local.minute<close?[values]:[];
 });
 segments.push({ticker:d.ticker,expiry:d.expiry,paginationComplete:true,csvSha256:hash(csv),referenceSha256:hash(reference),bars});
}
const bundle={schema:'jeu14-data-v1',protocol:JEU14_POLICY.version,capturedAt:new Date().toISOString(),scheduleSources,scheduleEvents,segments};
const inspected=inspectHistory(bundle),text=JSON.stringify(bundle),metadata={sha256:hash(text),bytes:Buffer.byteLength(text),expectedSessions:inspected.expectedSessions,eligible:inspected.eligible,unavailable:inspected.unavailable,quality:inspected.quality};
await writeFile(resolve(dir,'dataset.json'),text);await writeFile(resolve(dir,'metadata.json'),JSON.stringify(metadata,null,2));
console.log(JSON.stringify({sha256:metadata.sha256,bytes:metadata.bytes,expectedSessions:metadata.expectedSessions,eligible:metadata.eligible.length,unavailable:metadata.unavailable,quality:metadata.quality}));
