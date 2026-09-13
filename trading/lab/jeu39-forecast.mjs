import {aggregateFive} from './jeu12-engine.mjs';
import {historyCalendar} from './jeu14-policy.mjs';
import {sessionFor} from './session-comparison.mjs';
import {createRequest} from '../models/bridge.mjs';

export const JEU39_FORECAST_POLICY=Object.freeze({contextBars:64,intervalSeconds:900,horizonBars:4,seed:42,temperature:1,topK:0,topP:.9,sampleCount:1,device:'cpu',threads:2,amountPolicy:'zero-unavailable'});
const ensure=(condition,message)=>{if(!condition)throw Error(message);};

// Pure preparation only: read completed M5 candles, never an entry candle's
// OHLCV. Calendar gaps and native-contract rolls restart the 64-M15 context.
export async function prepareForecastRequests39(groups,signals){
 ensure(Array.isArray(groups)&&signals instanceof Map,'Invalid forecast preparation inputs');
 const ordered=[...signals].sort(([a],[b])=>a-b),requests=[],links=[],known=new Map();
 if(!ordered.length)return {requests,links};
 const calendar=new Map(historyCalendar().map((s,i)=>[s.date,{...s,index:i}]));
 const bars=groups.flatMap(g=>{
  ensure(typeof g.ticker==='string'&&/^MNQ[FGHJKMNQUVXZ]\d{1,2}$/.test(g.ticker)&&Array.isArray(g.candles),'Invalid native MNQ group');
  return g.candles.map(bar=>({bar,ticker:g.ticker}));
 });
 let cursor=0,previous=null,context=[],block=[],warmupReason='insufficient-context';
 const reset=reason=>{context=[];block=[];warmupReason=reason;};
 for(const [time,signal]of ordered){
  ensure(Number.isSafeInteger(time)&&time%300===0&&signal?.signalClose===time&&signal.signalOpen===time-300&&sessionFor(time).day===signal.day,'Invalid forecast signal clock');
  while(cursor<bars.length&&bars[cursor].bar.time+300<=time){
   const {bar:b,ticker}=bars[cursor++],scheduled=calendar.get(b.day);
   ensure(scheduled&&Number.isSafeInteger(b.time)&&b.time%300===0&&b.ticker===ticker&&sessionFor(b.time).day===b.day&&sessionFor(b.time).minute===b.minute,'Invalid historical forecast clock');
   ensure(Number.isInteger(b.closeMinute)&&b.closeMinute===Number(scheduled.close.slice(11,13))*60+Number(scheduled.close.slice(14,16))&&b.minute>=570&&b.minute<b.closeMinute,'Invalid historical forecast session');
   ensure(!previous||b.time>previous.time,'Nonchronological forecast source');
   if(!previous||b.day!==previous.day){
    ensure(b.minute===570,'Forecast session must start at cash open');
    if(previous){
     if(ticker!==previous.ticker)reset('contract-roll-warmup');
     else if(previous.minute+5!==previous.closeMinute||scheduled.index!==calendar.get(previous.day).index+1)reset('missing-session-warmup');
    }
    block=[];
   }else ensure(b.time===previous.time+300&&b.ticker===previous.ticker&&b.closeMinute===previous.closeMinute,'Incomplete intraday forecast source');
   block.push(b);
   if(block.length===3){
    const completed=aggregateFive(block,15)[0];
    context.push({...completed,ticker});context=context.slice(-JEU39_FORECAST_POLICY.contextBars);block=[];
   }
   previous=b;
  }
  const latest=context.at(-1),scheduled=calendar.get(signal.day);
  let reason='ready';
  if(context.length<JEU39_FORECAST_POLICY.contextBars)reason=warmupReason;
  else if(!latest||latest.day!==signal.day||latest.closedAt>time||time-latest.closedAt>=900)reason='no-current-session-bar';
  else if(!scheduled||latest.minute+15+JEU39_FORECAST_POLICY.horizonBars*15>Number(scheduled.close.slice(11,13))*60+Number(scheduled.close.slice(14,16)))reason='outside-horizon';
  if(reason!=='ready'){links.push({signalClose:time,day:signal.day,requestId:null,reason});continue;}
  // createRequest receives only the completed window. Future times are built
  // arithmetically, with no read of any future observed price or volume.
  const request=await createRequest({symbol:'MNQ',contract:latest.ticker,intervalSeconds:900,candles:context,horizon:4});
  const id=request.inputSha256;
  if(!known.has(id)){known.set(id,true);requests.push({id,request});}
  links.push({signalClose:time,day:signal.day,requestId:id,reason});
 }
 return {requests,links};
}
