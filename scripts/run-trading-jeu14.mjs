import { readFile,writeFile } from 'node:fs/promises';
import { resolve,relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { inspectHistory } from '../trading/lab/jeu14-history.mjs';
import { JEU14_POLICY as policy,JEU14_WINDOWS,historyCalendar } from '../trading/lab/jeu14-policy.mjs';
import { JEU12_CONFIGS } from '../trading/lab/jeu12-policy.mjs';
import { signalsFor,simulateFive } from '../trading/lab/jeu12-engine.mjs';
import { metrics } from '../trading/lab/validation-engine.mjs';
import { JEU14_SOURCE as source } from '../trading/lab/jeu14-source.mjs';
const dir=process.argv[2],root=fileURLToPath(new URL('../',import.meta.url));
if(!dir||!relative(root,resolve(dir)).startsWith('../'))throw new Error('Private output required.');
const text=await readFile(resolve(dir,'dataset.json'),'utf8');
assert.equal(Buffer.byteLength(text),source.bytes);assert.equal(createHash('sha256').update(text).digest('hex'),source.sha256);
const {groups,quality,eligible,unavailable,expectedSessions}=inspectHistory(JSON.parse(text));
const config=JEU12_CONFIGS.find(c=>c.id===policy.candidateId),all=[[],[]];
let signalPrefixes=0,sessionComparisons=0,auditedTrades=0;
for(const g of groups){
 const signals=signalsFor(g.candles,30,'pullback'),trades=[1,2].map(f=>simulateFive(g.candles,signals,config,g,f));
 for(let cut=1;cut<=g.candles.length;cut++){
  const last=g.candles[cut-1];if(last.minute!==last.closeMinute-5)continue;
  const prefix=g.candles.slice(0,cut),partial=signalsFor(prefix,30,'pullback');
  assert.deepEqual([...partial],[...signals].filter(([t])=>t<=last.time+300));signalPrefixes++;
  if(last.day<g.start)continue;
  for(const factor of [1,2]){assert.deepEqual(simulateFive(prefix,partial,config,g,factor),trades[factor-1].filter(t=>t.exitTime<=last.time));sessionComparisons++;}
 }
 const lookup=new Map(g.candles.map(b=>[b.time,b]));
 for(const factor of [1,2]){
  let day='',count=0,realized=0,losses=0,previous=-Infinity;
  for(const t of trades[factor-1]){
   const entry=lookup.get(t.entryTime),exit=lookup.get(t.exitTime),signal=signals.get(t.entryTime);
   assert.ok(entry&&exit&&signal&&entry.day===exit.day&&t.entryTime>previous);previous=t.exitTime;
   assert.equal(t.entry,entry.open);assert.equal(t.signalClose,t.entryTime);assert.equal(t.signalClose-t.signalOpen,1800);
   assert.ok(entry.minute>=570&&entry.minute<entry.closeMinute-15&&exit.minute<=exit.closeMinute-15);
   if(t.day!==day){day=t.day;count=0;realized=0;losses=0;}
   assert.ok(count<3&&realized>-2&&losses<2);count++;
   const riskTicks=Math.ceil(signal.atr*1.25/.25-1e-9),sign=t.side==='Long'?1:-1;
   assert.equal(t.risk,riskTicks*.25);assert.equal(t.stop,t.entry-sign*t.risk);assert.equal(t.target,t.entry+sign*Math.floor(riskTicks*1.5+1e-9)*.25);assert.equal(t.costDollars,3.5*factor);
   for(const p of [t.entry,t.exit,t.stop,t.target])assert.ok(Math.abs(p/.25-Math.round(p/.25))<1e-7);
   const net=sign*(t.exit-t.entry)/t.risk-factor*3.5/(t.risk*2);assert.ok(Math.abs(net-t.resultR)<1e-12);
   realized+=net;losses=net<0?losses+1:0;auditedTrades++;
  }
  all[factor-1].push(...trades[factor-1]);
 }
}
for(const trades of all){trades.sort((a,b)=>a.entryTime-b.entryTime);assert.equal(new Set(trades.map(t=>t.entryTime)).size,trades.length);}
const between=(t,start,end)=>t.day>=start&&t.day<end;
function summarize(start,end){
 const expected=historyCalendar(start,end).map(s=>s.date),used=eligible.filter(s=>s.date>=start&&s.date<end),normal=metrics(all[0].filter(t=>between(t,start,end))),stress=metrics(all[1].filter(t=>between(t,start,end)));
 return {start,end,expectedSessions:expected.length,scoredSessions:used.length,complete:used.length===expected.length,normal,stress};
}
const months=[];for(let y=2025,m=3;y<2026||m<=9;m++){if(m===13){m=1;y++;}if(y===2026&&m>9)break;const start=`${y}-${String(m).padStart(2,'0')}-01`,next=new Date(start+'T00:00:00Z');next.setUTCMonth(next.getUTCMonth()+1);months.push(summarize(start,next.toISOString().slice(0,10)));}
const windows=JEU14_WINDOWS.map(w=>({...summarize(w.start,w.end),confirmation:w.confirmation})),primaryWindows=windows.filter(w=>w.confirmation),primary=summarize('2025-07-01','2026-01-01');
primary.windows=primaryWindows;
primary.checks=[
 {id:'coverage',label:'Trois fenêtres complètes',pass:primaryWindows.every(w=>w.complete)},
 {id:'count',label:'Au moins 40 trades au total',pass:primary.normal.count>=40},
 {id:'windowCount',label:'Au moins 12 trades par fenêtre',pass:primaryWindows.every(w=>w.normal.count>=12)},
 {id:'positive',label:'Chaque fenêtre positive',pass:primaryWindows.every(w=>w.normal.total>0)},
 {id:'pf',label:'Profit factor ≥ 1,10 avant arrondi',pass:primary.normal.pf!==null&&primary.normal.pf>=1.1},
 {id:'dd',label:'Drawdown réalisé ≤ 8 R',pass:primary.normal.dd<=8},
 {id:'stress',label:'Résultat positif avec coûts doublés',pass:primary.stress.total>0}
];primary.passed=primary.checks.every(c=>c.pass);
function robustness(start,end){
 const trades=all[0].filter(t=>between(t,start,end)),days=eligible.filter(s=>s.date>=start&&s.date<end).map(s=>s.date),daily=new Map(days.map(d=>[d,0]));for(const t of trades)daily.set(t.day,daily.get(t.day)+t.resultR);
 const weeks=new Map();for(const [day,total] of daily){const d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);const k=d.toISOString().slice(0,10),w=weeks.get(k)||{total:0,days:0};w.total+=total;w.days++;weeks.set(k,w);}
 const blocks=[...weeks.values()];let state=policy.bootstrapSeed;const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};const means=[];
 if(blocks.length)for(let i=0;i<policy.bootstrapDraws;i++){let net=0,n=0;for(let j=0;j<blocks.length;j++){const w=blocks[Math.floor(random()*blocks.length)];net+=w.total;n+=w.days;}means.push(net/n);}
 means.sort((a,b)=>a-b);const best=[...trades].sort((a,b)=>b.resultR-a.resultR).slice(0,5);
 return {days:days.length,weeks:blocks.length,draws:means.length,seed:policy.bootstrapSeed,meanDailyR:days.length?trades.reduce((n,t)=>n+t.resultR,0)/days.length:null,bootstrap95DailyR:means.length?[means[Math.floor(means.length*.025)],means[Math.floor(means.length*.975)]]:null,withoutFiveBestR:trades.reduce((n,t)=>n+t.resultR,0)-best.reduce((n,t)=>n+t.resultR,0),removedTrades:best.length,directions:['Long','Short'].map(side=>({side,...metrics(trades.filter(t=>t.side===side))}))};
}
const report={schema:'jeu14-report-v1',protocol:policy.version,generatedAt:new Date().toISOString(),source,candidateId:policy.candidateId,paperEnabled:false,coverage:{expectedSessions,scoredSessions:eligible.length,firstScored:eligible[0]?.date||null,lastScored:eligible.at(-1)?.date||null,unavailable,quality},overall:summarize(policy.from,policy.end),months,windows,primary,years:[summarize('2025-03-17','2026-01-01'),summarize('2026-01-01',policy.end)],robustness:{primary:robustness('2025-07-01','2026-01-01'),overall:robustness(policy.from,policy.end)},audit:{passed:true,signalPrefixes,sessionComparisons,auditedTrades}};
const serialize=(v,n)=>JSON.stringify(v,(_,v)=>v===Infinity?'Infinity':v,n);
await writeFile(resolve(dir,'trades-private.json'),serialize({normal:all[0],stress:all[1]}));await writeFile(resolve(dir,'report.json'),serialize(report,2)+'\n');
console.log(serialize({overall:report.overall,primary:report.primary,years:report.years,robustness:report.robustness,audit:report.audit,months:report.months}));
