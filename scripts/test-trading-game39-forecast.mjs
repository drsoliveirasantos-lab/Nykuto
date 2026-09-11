import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareForecastRequests39} from '../trading/lab/jeu39-forecast.mjs';
import {historyCalendar} from '../trading/lab/jeu14-policy.mjs';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const group=(day,ticker='MNQM6')=>({ticker,start:day,end:day,candles:Array.from({length:78},(_,i)=>({time:Date.parse(day+'T13:30:00Z')/1000+i*300,day,minute:570+i*5,closeMinute:960,ticker,open:100+i*.25,high:101+i*.25,low:99+i*.25,close:100.5+i*.25,volume:100+i}))});
const signal=(day,hour='14:00')=>{const signalClose=Date.parse(day+'T'+hour+':00Z')/1000;return [signalClose,{day,side:'Long',signalOpen:signalClose-300,signalClose}];};
const fourDays=()=>['2026-06-01','2026-06-02','2026-06-03','2026-06-04'].map(d=>group(d));

test('Game39 forecasts use exactly64 closed native M15 bars, arithmetic4bar horizon and deduplicate the same quarter',async()=>{
 const sources=fourDays(),signals=new Map([signal('2026-06-03'),signal('2026-06-04'),signal('2026-06-04','14:05'),signal('2026-06-04','14:10')]);
 const prepared=await prepareForecastRequests39(sources,signals);
 assert.equal(prepared.links[0].reason,'insufficient-context');assert.equal(prepared.links[0].requestId,null);
 assert.equal(prepared.requests.length,1);assert.equal(prepared.links.slice(1).every(l=>l.requestId===prepared.requests[0].id),true);
 const r=prepared.requests[0].request,t=[...signals.keys()];
 assert.equal(r.contract,'MNQM6');assert.equal(r.candles.length,64);assert.equal(r.intervalSeconds,900);
 assert.deepEqual(r.futureTimes,[0,900,1800,2700].map(n=>t[1]+n));
 assert.equal(r.candles.at(-1).time+900,t[1]);assert.equal(r.candles.at(-1).volume,103+104+105);
});

test('Game39 request preparation is identical on chronological prefixes and never reads unclosed entry/future prices',async()=>{
 const sources=fourDays(),signals=new Map([signal('2026-06-03','16:30'),signal('2026-06-04')]);
 const complete=await prepareForecastRequests39(sources,signals);
 for(const [time,s]of signals){
  const prefix=sources.map(g=>({...g,candles:g.candles.filter(b=>b.time+300<=time)})).filter(g=>g.candles.length);
  const expected=await prepareForecastRequests39(prefix,new Map([[time,s]]));
  const link=complete.links.find(l=>l.signalClose===time);assert.deepEqual(expected.links,[link]);
  assert.deepEqual(expected.requests,complete.requests.filter(r=>r.id===link.requestId));
  const changed=sources.map(g=>({...g,candles:g.candles.map(b=>{
   if(b.time+300<=time)return b;
   const future={time:b.time};for(const key of ['open','high','low','close','volume'])Object.defineProperty(future,key,{get(){throw Error('Read future price');}});return future;
  })}));
  assert.deepEqual(await prepareForecastRequests39(changed,new Map([[time,s]])),expected);
 }
});

test('Game39 resets its model context at a contract roll or missing expected session, but carries through weekends',async()=>{
 const days=historyCalendar('2026-06-01','2026-06-16').map(s=>s.date),all=days.map(d=>group(d));
 const rolled=all.map(g=>g.start==='2026-06-15'?group(g.start,'MNQU6'):g);
 const roll=await prepareForecastRequests39(rolled,new Map([signal('2026-06-15')]));
 assert.equal(roll.links[0].reason,'contract-roll-warmup');assert.equal(roll.requests.length,0);
 const missing=await prepareForecastRequests39(all.filter(g=>g.start!=='2026-06-11'),new Map([signal('2026-06-12')]));
 assert.equal(missing.links[0].reason,'missing-session-warmup');assert.equal(missing.requests.length,0);
 const weekend=await prepareForecastRequests39(all,new Map([signal('2026-06-08')]));
 assert.equal(weekend.links[0].reason,'ready');assert.equal(weekend.requests.length,1);
 const late=await prepareForecastRequests39(all,new Map([signal('2026-06-08','19:15')]));
 assert.equal(late.links[0].reason,'outside-horizon');assert.equal(late.requests.length,0);
});

test('Game39 CPU wrapper refuses an existing result before loading assets or attempting inference',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'nykuto-game39-exclusive-')),output=join(directory,'result.json');
 await writeFile(output,'{"preserved":true}\n',{flag:'wx'});
 const run=spawnSync('python',['scripts/run-trading-jeu39-model.py','--input',join(directory,'absent-request.json'),'--output',output,'--assets-dir',join(directory,'absent-assets')],{encoding:'utf8'});
 assert.notEqual(run.status,0);assert.match(run.stderr,/Output already exists; no recalculation or overwrite/);
 assert.equal(await readFile(output,'utf8'),'{"preserved":true}\n');
});
