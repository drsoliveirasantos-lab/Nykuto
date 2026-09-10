import {JEU29_PRODUCTS} from './jeu29-policy.mjs';
import {sessionFor} from './session-comparison.mjs';
import {assessNetReward41} from './jeu41-net-reward.mjs';
import {JEU42_POLICY as P,JEU42_VARIANTS} from './jeu42-policy.mjs';
const ensure=(x,m)=>{if(!x)throw Error(m);};
const known=id=>JEU42_VARIANTS.some(v=>v.id===id);
const tickCount=(price,tick)=>{
 const ticks=Math.round(price/tick);
 ensure(Number.isSafeInteger(ticks)&&Math.abs(price/tick-ticks)<1e-7,'Invalid phase price precision');
 return ticks;
};
export function relativeVolumeUnits42(context,bar){
 if(!context)return null;
 ensure(context.closedAt===bar.time+300&&context.sourceTime===bar.time&&context.day===bar.day&&context.ticker===bar.ticker,'Noncausal phase volume context');
 if(context.volumeRatio===null||context.volumeRatio===undefined)return null;
 ensure(Number.isFinite(context.volumeRatio)&&context.volumeRatio>=0&&context.referenceSessions===P.referenceVolumeSessions,'Invalid phase volume context');
 const units=Math.round(context.volumeRatio*P.relativeVolumeScale);
 ensure(Number.isSafeInteger(units)&&units>=0,'Unsafe relative volume precision');
 return units;
}

// The existing generator's breakoutAt anchors the event. It is not replaced
// retrospectively with an earlier or more attractive breakout.
export function describeRetest42(signal,entryOpen,product,bars,contexts){
 const sign=signal.side==='Long'?1:-1,level=sign===1?signal.rangeHigh:signal.rangeLow;
 const entry=tickCount(entryOpen,product.tick),stop=tickCount(signal.stopPrice,product.tick),boundary=tickCount(level,product.tick);
 const info={phaseStatus:null,pullbackBars:0,breakoutAt:signal.breakoutAt,pullbackTimes:[],breakoutRvUnits:null,pullbackRvUnits:[],confirmationRvUnits:null,
  entryDistanceTicks:sign*(entry-boundary),stopDistanceTicks:sign*(entry-stop),rangeWidthTicks:tickCount(signal.rangeHigh-signal.rangeLow,product.tick),
  phaseVeto:false};
 const closed=[];
 for(let t=signal.breakoutAt-300;t<=signal.signalOpen;t+=300){
  const b=bars.get(t);
  ensure(b&&b.time===t&&t+300<=signal.signalClose&&b.day===signal.day&&b.minute===sessionFor(t).minute&&typeof b.ticker==='string'&&b.ticker.startsWith(product.symbol),'Missing or mismatched closed phase bar');
  ensure([b.open,b.high,b.low,b.close].every(v=>Number.isFinite(v)&&v>0)&&b.high>=Math.max(b.open,b.close,b.low)&&b.low<=Math.min(b.open,b.close)&&Number.isSafeInteger(b.volume)&&b.volume>=0,'Invalid closed phase bar');
  ensure(!closed.length||b.ticker===closed[0].ticker,'Contract changed within phase');
  closed.push(b);
 }
 ensure(closed.length>=2&&closed.length<=7,'Invalid closed retest phase duration');
 const breakout=closed[0],confirmation=closed.at(-1),pullback=closed.slice(1,-1).filter(b=>sign*(b.close-b.open)<0);
 info.pullbackBars=pullback.length;info.pullbackTimes=pullback.map(b=>b.time);
 info.breakoutRvUnits=relativeVolumeUnits42(contexts.get(breakout.time+300),breakout);
 info.confirmationRvUnits=relativeVolumeUnits42(contexts.get(confirmation.time+300),confirmation);
 info.pullbackRvUnits=pullback.map(b=>relativeVolumeUnits42(contexts.get(b.time+300),b));
 if(!pullback.length){info.phaseStatus='no-separate-counterdirectional-bar';return info;}
 if(info.breakoutRvUnits===null||info.breakoutRvUnits===0||info.pullbackRvUnits.some(v=>v===null)){
  info.phaseStatus='relative-volume-unavailable';return info;
 }
 const total=info.pullbackRvUnits.reduce((s,n)=>s+BigInt(n),0n),threshold=BigInt(info.breakoutRvUnits)*BigInt(pullback.length);
 info.phaseVeto=total>=threshold;info.phaseStatus=info.phaseVeto?'pullback-not-contracted':'pullback-contracted';
 return info;
}

export function filterPullbackStreams42(streams,contexts,factor,variant){
 ensure(Array.isArray(streams)&&contexts instanceof Map&&[1,2].includes(factor)&&known(variant)&&new Set(streams.map(s=>s.symbol)).size===streams.length,'Invalid phase streams');
 const decisions=[];
 const filtered=streams.map(stream=>{
  const product=JEU29_PRODUCTS.find(p=>p.symbol===stream.symbol);
  ensure(product&&Array.isArray(stream.candles)&&stream.signals instanceof Map,'Invalid phase stream');
  const bars=new Map();let previous=-Infinity;
  for(const b of stream.candles){ensure(Number.isSafeInteger(b.time)&&b.time%300===0&&b.time>previous,'Invalid phase chronology');bars.set(b.time,b);previous=b.time;}
  const signals=new Map();
  for(const[time,signal]of stream.signals){
   const entry=bars.get(time);
   ensure(entry&&entry.day===signal.day&&entry.minute===sessionFor(time).minute&&entry.ticker?.startsWith(stream.symbol),'Missing or mismatched phase entry');
   // Baseline validation only; no rejected Game41 rule is inherited.
   assessNetReward41(stream.symbol,time,signal,entry.open,product,factor,'baseline');
   let detail=null;
   if(stream.symbol===P.targetSymbol){
    ensure(signal.pattern==='orb-retest'&&contexts.get(stream.symbol) instanceof Map,'MES phase requires original retest and context map');
    detail=describeRetest42(signal,entry.open,product,bars,contexts.get(stream.symbol));
   }
   const allowed=variant==='baseline'||!detail?.phaseVeto;
   const reason=variant==='baseline'?'baseline-unchanged':!detail?'other-market-unchanged':detail.phaseStatus;
   decisions.push({symbol:stream.symbol,time,day:signal.day,side:signal.side,allowed,reason,detail});
   if(allowed)signals.set(time,signal);
  }
  return variant==='baseline'||stream.symbol!==P.targetSymbol?stream:{...stream,signals};
 });
 return {streams:filtered,decisions};
}
