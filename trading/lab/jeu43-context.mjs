import {aggregateFive} from './jeu12-engine.mjs';
import {historyCalendar} from './jeu14-policy.mjs';
import {sessionFor} from './session-comparison.mjs';
import {JEU29_PRODUCTS} from './jeu29-policy.mjs';
import {pastWindowFeatures} from '../models/past-window-features.mjs';
import {JEU43_POLICY as P} from './jeu43-policy.mjs';
const ensure=(ok,m)=>{if(!ok)throw Error(m);};

// Generalized chronological preparation from Game39, without model requests.
// Windows reset at native rolls and missing sessions, never by realized PnL.
export function normalizedContexts43(groups,signals,symbol){
 ensure(Array.isArray(groups)&&signals instanceof Map&&JEU29_PRODUCTS.some(p=>p.symbol===symbol),'Invalid normalized context input');
 const calendar=new Map(historyCalendar(P.from,P.end).map((s,index)=>[s.date,{...s,index}]));
 const bars=groups.filter(g=>g.start>=P.from&&g.start<P.end).flatMap(g=>{
  ensure(typeof g.ticker==='string'&&g.ticker.startsWith(symbol)&&Array.isArray(g.candles),'Invalid native group');
  return g.candles.map(bar=>({bar,ticker:g.ticker}));
 });
 let cursor=0,previous=null,context=[],block=[],warmupReason='insufficient-context';
 const result=new Map(),reset=reason=>{context=[];block=[];warmupReason=reason;};
 for(const [time,signal]of [...signals].sort(([a],[b])=>a-b)){
  ensure(Number.isSafeInteger(time)&&time%300===0&&signal.signalClose===time&&signal.signalOpen===time-300&&sessionFor(time).day===signal.day,'Invalid normalization signal clock');
  while(cursor<bars.length&&bars[cursor].bar.time+300<=time){
   const {bar:b,ticker}=bars[cursor++],scheduled=calendar.get(b.day);
   ensure(scheduled&&Number.isSafeInteger(b.time)&&b.time%300===0&&b.ticker===ticker&&sessionFor(b.time).day===b.day&&sessionFor(b.time).minute===b.minute,'Invalid historical normalization clock');
   ensure(b.closeMinute===Number(scheduled.close.slice(11,13))*60+Number(scheduled.close.slice(14,16))&&b.minute>=570&&b.minute<b.closeMinute,'Invalid normalization session');
   ensure(!previous||b.time>previous.time,'Nonchronological normalization source');
   if(!previous||b.day!==previous.day){
    ensure(b.minute===570,'Normalization session must start at cash open');
    if(previous){
     if(ticker!==previous.ticker)reset('contract-roll-warmup');
     else if(previous.minute+5!==previous.closeMinute||scheduled.index!==calendar.get(previous.day).index+1)reset('missing-session-warmup');
    }
    block=[];
   }else ensure(b.time===previous.time+300&&b.ticker===previous.ticker&&b.closeMinute===previous.closeMinute,'Incomplete intraday normalization source');
   block.push(b);
   if(block.length===3){context.push({...aggregateFive(block,15)[0],ticker});context=context.slice(-P.contextBars);block=[];}
   previous=b;
  }
  const latest=context.at(-1);
  let status='ready';
  if(context.length<P.contextBars)status=warmupReason;
  else if(!latest||latest.day!==signal.day||latest.closedAt>time||time-latest.closedAt>=P.intervalSeconds)status='no-current-session-bar';
  const local=sessionFor(time),date=new Date(signal.day+'T00:00:00Z');
  result.set(time,{status,day:signal.day,time,symbol,availableBars:context.length,
   clock:{minuteOfDay:local.minute,weekday:date.getUTCDay(),dayOfMonth:date.getUTCDate(),month:date.getUTCMonth()+1,timeZone:'America/New_York'},
   features:status==='ready'?pastWindowFeatures(context,{asOf:time,contract:latest.ticker,expectedBars:P.contextBars,epsilon:P.epsilon}):null});
 }
 return result;
}

export function allNormalizedContexts43(markets,streams,through='2026-08-31'){
 return new Map(streams.map(s=>[s.symbol,normalizedContexts43(markets.find(m=>m.symbol===s.symbol).data.groups.filter(g=>g.start<=through),s.signals,s.symbol)]));
}
