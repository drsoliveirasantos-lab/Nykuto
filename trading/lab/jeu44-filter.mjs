import {JEU29_PRODUCTS} from './jeu29-policy.mjs';
import {sessionFor} from './session-comparison.mjs';
import {assessNetReward41} from './jeu41-net-reward.mjs';
import {JEU44_VARIANTS} from './jeu44-policy.mjs';
const ensure=(ok,m)=>{if(!ok)throw Error(m);};
export function filterVideoStreams44(streams,features,factor,variant){
 const profile=JEU44_VARIANTS.find(v=>v.id===variant);
 ensure(profile&&Array.isArray(streams)&&features instanceof Map&&[1,2].includes(factor),'Invalid video filter inputs');
 const decisions=[];
 const filtered=streams.map(stream=>{
  const product=JEU29_PRODUCTS.find(p=>p.symbol===stream.symbol),bars=new Map(stream.candles.map(b=>[b.time,b])),signals=new Map();
  ensure(product&&bars.size===stream.candles.length&&stream.signals instanceof Map,'Invalid video filter stream');
  for(const [time,signal]of stream.signals){
   const entry=bars.get(time),detail=features.get(stream.symbol)?.get(time);
   ensure(entry&&entry.day===signal.day&&entry.minute===sessionFor(time).minute&&entry.ticker?.startsWith(stream.symbol),'Invalid video entry source');
   assessNetReward41(stream.symbol,time,signal,entry.open,product,factor,'baseline');
   ensure(detail&&detail.time===time&&detail.day===signal.day&&detail.symbol===stream.symbol,'Missing video decision');
   if(detail.status==='ready')ensure(detail.closedAt===time&&detail.contract===entry.ticker,'Noncausal own video features');
   const target=stream.symbol===profile.targetSymbol,sign=signal.side==='Long'?1:-1;
   let reason='reference-unchanged',value=null,observable=false;
   if(target){
    ensure(signal.pattern==='orb-retest','Video candidate requires original retest');
    if(detail.status!=='ready')reason='own-'+detail.status;
    else if(profile.mechanism==='breakout-avwap'){
     if(detail.avwapStatus==='ready'){value=sign*(detail.signalClose-detail.avwap);observable=true;}
     else reason=detail.avwapStatus;
    }else if(detail.peerStatus!=='ready')reason='peer-'+detail.peerStatus;
    else{
     ensure(detail.peerClosedAt===time,'Stale peer video features');
     value=sign*(profile.mechanism==='peer-direction'?detail.peerReturn:detail.relativeReturn);observable=true;
    }
    if(observable){ensure(Number.isFinite(value),'Invalid video feature value');reason=value<0?profile.mechanism+'-opposed':profile.mechanism+'-compatible';}
   }
   const allowed=!target||!observable||value>=0;
   decisions.push({symbol:stream.symbol,time,day:signal.day,side:signal.side,allowed,reason,observable,value,detail});
   if(allowed)signals.set(time,signal);
  }
  return stream.symbol===profile.targetSymbol?{...stream,signals}:stream;
 });
 return {streams:filtered,decisions};
}
