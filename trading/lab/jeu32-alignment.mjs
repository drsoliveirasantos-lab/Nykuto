import {combinedContexts} from './jeu24-context.mjs';
import {historyCalendar} from './jeu14-policy.mjs';
import {JEU32_POLICY as P} from './jeu32-policy.mjs';
const direction=(close,fast,slow,ready)=>!ready?null:close>fast&&fast>slow?'Long':close<fast&&fast<slow?'Short':'Mixed';
// H1 CASH bars start at 09:30 New York. Only complete 12×M5 bars update H1.
// The final 30 minutes of a normal cash session never become an H1 candle.
export function alignmentContexts(candles,product){
 const m5=combinedContexts(candles,product),calendar=new Map(historyCalendar('2026-01-01',P.end).map((d,i)=>[d.date,i]));
 let previous=null,chunk=[],fast=null,slow=null,count=0,last=null;const result=new Map();
 for(const b of candles){
  if(previous?.day!==b.day){
   if(previous&&(calendar.get(b.day)!==calendar.get(previous.day)+1||b.ticker!==previous.ticker)){fast=null;slow=null;count=0;last=null;}
   chunk=[];
  }
  if((b.minute-P.hourAnchorMinute)%60===0)chunk=[];
  chunk.push(b);
  if(chunk.length===12){
   if(chunk.some((x,i)=>x.time!==chunk[0].time+i*300||x.ticker!==b.ticker||x.day!==b.day))throw Error('Incomplete H1');
   fast=fast===null?b.close:b.close*2/(P.emaFast+1)+fast*(1-2/(P.emaFast+1));
   slow=slow===null?b.close:b.close*2/(P.emaSlow+1)+slow*(1-2/(P.emaSlow+1));count++;
   last={closedAt:b.time+300,sourceTime:chunk[0].time,close:b.close,fast,slow,ready:count>=P.emaSlow,count,direction:direction(b.close,fast,slow,count>=P.emaSlow)};chunk=[];
  }
  const c=m5.get(b.time+300),five={close:b.close,fast:c.fast,slow:c.slow,ready:c.emaReady,direction:direction(b.close,c.fast,c.slow,c.emaReady)};
  result.set(b.time+300,{day:b.day,ticker:b.ticker,closedAt:b.time+300,sourceTime:b.time,m5:five,h1:last?{...last}:null});previous=b;
 }
 return result;
}
export function alignmentDecision(signal,context){
 if(!signal||!['Long','Short'].includes(signal.side)||signal.signalOpen!==signal.signalClose-300)throw Error('Invalid alignment signal');
 if(!context)return {allowed:false,reason:'alignment-unknown'};
 if(context.closedAt!==signal.signalClose||context.sourceTime!==signal.signalOpen||context.day!==signal.day
  ||context.h1&&(context.h1.closedAt>signal.signalClose||context.h1.sourceTime!==context.h1.closedAt-3600))throw Error('Noncausal alignment');
 if(!context.m5.ready||!context.h1?.ready)return {allowed:false,reason:'alignment-unknown'};
 return context.m5.direction===signal.side&&context.h1.direction===signal.side?{allowed:true,reason:'aligned'}:{allowed:false,reason:'alignment-mismatch'};
}
