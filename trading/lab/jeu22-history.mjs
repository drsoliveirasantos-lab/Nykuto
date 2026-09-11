import { sessionFor } from './session-comparison.mjs';
import { inspectHistory } from './jeu14-history.mjs';
import { historyCalendar, JEU14_SEGMENTS } from './jeu14-policy.mjs';
import { inspectMultimarket, scheduleCovers } from './jeu19-history.mjs';
import { JEU19_SEGMENTS } from './jeu19-policy.mjs';
import { JEU22_POLICY as P } from './jeu22-policy.mjs';

export function inspectOpeningHistory(bundle,product){
  // Retain all existing source, metadata, OHLCV, tick and pagination checks.
  if(product.symbol==='MNQ')inspectHistory(bundle);else inspectMultimarket(bundle,product);
  const defs=product.symbol==='MNQ'?JEU14_SEGMENTS:JEU19_SEGMENTS.filter(d=>d.symbol===product.symbol);
  const groups=[],eligible=[],unavailable=[];
  for(const d of defs){
    if(d.start>=P.end||d.end<=P.from)continue;
    const raw=bundle.segments.find(x=>x.ticker===d.ticker),start=d.start>P.from?d.start:P.from,end=d.end<P.end?d.end:P.end;
    const calendar=historyCalendar(start,end),lookup=new Map(calendar.map(s=>[s.date,s])),daily=new Map(calendar.map(s=>[s.date,[]]));
    for(const [time,open,high,low,close,volume]of raw.bars){
      const local=sessionFor(time),s=lookup.get(local.day);if(!s)continue;
      const closeMinute=Number(s.close.slice(11,13))*60+Number(s.close.slice(14,16));
      if(local.minute<570||local.minute>=closeMinute)continue;
      daily.get(local.day).push({time,open,high,low,close,volume,...local,closeMinute,ticker:d.ticker});
    }
    for(const s of calendar){
      const closeMinute=Number(s.close.slice(11,13))*60+Number(s.close.slice(14,16)),candles=daily.get(s.date).sort((a,b)=>a.time-b.time);
      const missing=[];for(let m=570;m<closeMinute;m+=5)if(!candles.some(b=>b.minute===m))missing.push(m);
      const scheduled=scheduleCovers(bundle.scheduleEvents,product,s.date,closeMinute);
      if(missing.length||candles.length!==(closeMinute-570)/5||!scheduled){unavailable.push({ticker:d.ticker,date:s.date,reason:'missing-data',missingMinutes:missing,missingSchedule:!scheduled});continue;}
      const next=new Date(Date.parse(s.date+'T00:00:00Z')+86400000).toISOString().slice(0,10);
      groups.push({ticker:d.ticker,start:s.date,end:next,candles});eligible.push({ticker:d.ticker,date:s.date});
    }
  }
  const expected=historyCalendar(P.from,P.end),all=[...eligible,...unavailable];
  if(all.length!==expected.length||new Set(all.map(s=>s.date)).size!==expected.length||expected.some(s=>!all.some(d=>d.date===s.date)))throw new Error('Opening coverage omission or duplicate');
  return {groups,eligible,unavailable,quality:[{preparation:'same-day opening range, six complete 5-minute bars',sessions:expected.length}],expectedSessions:expected.length};
}
