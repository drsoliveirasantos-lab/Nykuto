import {statistics,round} from './market-diagnostics.mjs';
import {JEU32_POLICY as P} from './jeu32-policy.mjs';
import {alignmentDecision} from './jeu32-alignment.mjs';
const avg=a=>a.length?a.reduce((n,v)=>n+v,0)/a.length:null;
const median=a=>{const s=[...a].sort((a,b)=>a-b),i=Math.floor(s.length/2);return s.length?(s.length%2?s[i]:(s[i-1]+s[i])/2):null;};
export function sessionMeasures(bars){
 if(bars.length<6)throw Error('Incomplete study session');
 const first=bars[0],last=bars.at(-1),hi=Math.max(...bars.map(b=>b.high)),lo=Math.min(...bars.map(b=>b.low));
 const returns=bars.map((b,i)=>Math.log(b.close/(i?bars[i-1].close:first.open))),path=bars.reduce((n,b,i)=>n+Math.abs(b.close-(i?bars[i-1].close:first.open)),0);
 const opening=bars.slice(0,6),top=Math.max(...opening.map(b=>b.high)),bottom=Math.min(...opening.map(b=>b.low));
 let attempts=0,failed=0,pending=null;
 for(let i=6;i<bars.length;i++){
  const b=bars[i];if(b.minute>=720)break;
  if(pending){if(i-pending.i>6)pending=null;else if(b.close>bottom&&b.close<top){failed++;pending=null;}}
  if(!pending&&(i===6||bars[i-1].close>=bottom&&bars[i-1].close<=top)&&(b.close>top||b.close<bottom)){attempts++;pending={i};}
 }
 return {day:first.day,rangeBps:round((hi-lo)/first.open*10000),cashReturnPct:round((last.close/first.open-1)*100),
  efficiency:round(path?Math.abs(last.close-first.open)/path:0),realizedVolPct:round(Math.sqrt(returns.reduce((n,v)=>n+v*v,0))*100),
  volumePerMinute:round(bars.reduce((n,b)=>n+b.volume,0)/(bars.length*5)),openingRangeBps:round((top-bottom)/first.open*10000),breakouts:attempts,failedBreakouts:failed};
}
export function marketStudy(markets,period,referenceRun,alignments,events){
 return markets.map(m=>{
  const daily=m.data.groups.filter(g=>g.start>=period.start&&g.start<period.end).map(g=>sessionMeasures(g.candles));
  const trades=referenceRun.trades.filter(t=>t.symbol===m.symbol),classified=trades.map(t=>({t,a:alignmentDecision(t,alignments.get(m.symbol).get(t.entryTime))}));
  const eventsDays=new Set(events.map(e=>e.day));
  return {symbol:m.symbol,sessions:daily.length,medianRangeBps:round(median(daily.map(d=>d.rangeBps))),meanEfficiency:round(avg(daily.map(d=>d.efficiency))),
   medianRealizedVolPct:round(median(daily.map(d=>d.realizedVolPct))),medianVolumePerMinute:round(median(daily.map(d=>d.volumePerMinute))),
   positiveCashSessions:daily.filter(d=>d.cashReturnPct>0).length,negativeCashSessions:daily.filter(d=>d.cashReturnPct<0).length,
   breakouts:daily.reduce((n,d)=>n+d.breakouts,0),failedBreakouts:daily.reduce((n,d)=>n+d.failedBreakouts,0),
   reference:statistics(trades),alignmentGroups:['aligned','alignment-mismatch','alignment-unknown'].map(reason=>({reason,...statistics(classified.filter(x=>x.a.reason===reason).map(x=>x.t))})),
   selectedEventDays:statistics(trades.filter(t=>eventsDays.has(t.day))),otherDays:statistics(trades.filter(t=>!eventsDays.has(t.day))),daily};
 });
}
export function weeklyObjective(calendar,period){
 const rows=calendar.weeks.map(w=>{
  const friday=new Date(Date.parse(w.week+'T00:00Z')+4*86400000).toISOString().slice(0,10),partialBoundary=w.week<period.start||friday>=period.end;
  const complete=w.simulatedSessions===w.expectedSessions&&!w.missingSessions&&!w.stoppedSessions;
  return {...w,partialBoundary,complete,targetUSD:P.weeklyTarget,targetMet:complete?w.net>=P.weeklyTarget:null};
 });
 const eligible=rows.filter(w=>!w.partialBoundary&&w.complete);
 return {targetUSD:P.weeklyTarget,weeks:rows,fullCalendarWeeks:rows.filter(w=>!w.partialBoundary).length,evaluableFullWeeks:eligible.length,
  targetWeeks:eligible.filter(w=>w.targetMet).length,positiveWeeks:eligible.filter(w=>w.net>0).length,negativeWeeks:eligible.filter(w=>w.net<0).length,
  meanNet:round(avg(eligible.map(w=>w.net)),2),worstNet:eligible.length?Math.min(...eligible.map(w=>w.net)):null,
  targetRate:eligible.length?round(eligible.filter(w=>w.targetMet).length/eligible.length):null};
}
