import {JEU29_PRODUCTS} from './jeu29-policy.mjs';
import {sessionFor} from './session-comparison.mjs';
import {assessNetReward41} from './jeu41-net-reward.mjs';
import {normalizedEntryDistance} from '../models/past-window-features.mjs';
import {JEU43_POLICY as P,JEU43_VARIANTS} from './jeu43-policy.mjs';
const ensure=(ok,m)=>{if(!ok)throw Error(m);};
export function filterNormalizedStreams43(streams,normalizations,factor,variant){
 const profile=JEU43_VARIANTS.find(v=>v.id===variant);
 ensure(profile&&Array.isArray(streams)&&normalizations instanceof Map&&[1,2].includes(factor),'Invalid normalized filter inputs');
 const decisions=[];
 const filtered=streams.map(stream=>{
  const product=JEU29_PRODUCTS.find(p=>p.symbol===stream.symbol),bars=new Map(stream.candles.map(b=>[b.time,b])),signals=new Map();
  ensure(product&&bars.size===stream.candles.length&&stream.signals instanceof Map,'Invalid normalized stream');
  for(const [time,signal]of stream.signals){
   const entry=bars.get(time),context=normalizations.get(stream.symbol)?.get(time);
   ensure(entry&&entry.day===signal.day&&entry.minute===sessionFor(time).minute&&entry.ticker?.startsWith(stream.symbol),'Invalid normalized entry source');
   assessNetReward41(stream.symbol,time,signal,entry.open,product,factor,'baseline');
   ensure(context&&context.time===time&&context.day===signal.day&&context.symbol===stream.symbol,'Missing normalization decision');
   if(context.features)ensure(context.features.asOf===time&&context.features.lastClose<=time&&context.features.contract===entry.ticker,'Noncausal normalized features');
   const detail={status:context.status,clock:context.clock,availableBars:context.availableBars,extensionZ:null,entryZ:null};
   if(context.status==='ready')Object.assign(detail,normalizedEntryDistance(context.features,{entryOpen:entry.open,level:signal.side==='Long'?signal.rangeHigh:signal.rangeLow,side:signal.side}));
   const isTarget=stream.symbol===profile.targetSymbol;
   if(isTarget)ensure(signal.pattern==='orb-retest','Normalized candidate requires original retest');
   const allowed=!isTarget||detail.status!=='ready'||detail.extensionZ<=P.maximumExtensionZ;
   const reason=!isTarget?'reference-unchanged':detail.status!=='ready'?detail.status:allowed?'extension-within-one-sigma':'extension-above-one-sigma';
   decisions.push({symbol:stream.symbol,time,day:signal.day,side:signal.side,allowed,reason,detail});
   if(allowed)signals.set(time,signal);
  }
  return stream.symbol===profile.targetSymbol?{...stream,signals}:stream;
 });
 return {streams:filtered,decisions};
}
