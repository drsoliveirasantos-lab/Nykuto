import {sessionFor} from './session-comparison.mjs';
import {assessMarketFilter} from './jeu31-filters.mjs';
import {entryProfile,JEU36_POLICY as P} from './jeu36-policy.mjs';

// The initial retest has already passed the existing market filters. Observe
// exactly one further CLOSED M5 bar, then enter at the following opening.
// No entry-bar high, low or close participates in this decision.
export function confirmMarketStreams(streams,contexts,variantId){
 const profile=entryProfile(variantId),decisions=[];
 const output=streams.map(stream=>{
  if(stream.symbol!==profile.symbol)return stream;
  const bars=new Map(stream.candles.map(b=>[b.time,b])),signals=new Map();
  if(bars.size!==stream.candles.length)throw Error('Duplicate confirmation bar');
  for(const [time,s]of stream.signals){
   const original=bars.get(time-300),confirmation=bars.get(time),nextTime=time+300;
   if(!s||s.signalClose!==time||s.signalOpen!==time-300||s.pattern!=='orb-retest'||!['Long','Short'].includes(s.side)
     ||!original||original.day!==s.day||!Number.isFinite(s.stopPrice))throw Error('Invalid original retest');
   let reason=null;
   if(!confirmation)reason='confirmation-unavailable';
   else if(confirmation.day!==s.day||confirmation.ticker!==original.ticker||confirmation.time!==original.time+300)throw Error('Noncausal confirmation bar');
   else if(sessionFor(nextTime).day!==s.day||sessionFor(nextTime).minute>P.latestEntryMinute)reason='confirmation-too-late';
   const sign=s.side==='Long'?1:-1,level=sign===1?s.rangeHigh:s.rangeLow;
   if(!reason){
    if(sign*(sign===1?confirmation.low-s.stopPrice:confirmation.high-s.stopPrice)<=0)reason='original-stop-touched';
    else if(sign*(confirmation.close-level)<=0)reason='range-not-held';
    else if(sign*(confirmation.close-confirmation.open)<=0||sign*(confirmation.close-original.close)<=0)reason='no-directional-follow-through';
   }
   const shifted={...s,originalSignalOpen:s.signalOpen,originalSignalClose:s.signalClose,signalOpen:time,signalClose:nextTime};
   if(!reason){const existing=assessMarketFilter(stream.symbol,nextTime,shifted,contexts.get(stream.symbol)?.get(nextTime),'combined');if(!existing.allowed)reason=existing.reason;}
   decisions.push({symbol:stream.symbol,day:s.day,originalTime:time,time:nextTime,side:s.side,allowed:!reason,reason:reason??'confirmed'});
   if(!reason)signals.set(nextTime,shifted);
  }
  return {...stream,signals};
 });
 return {streams:output,decisions};
}
