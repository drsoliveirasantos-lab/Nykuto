// One predeclared entry filter. Account, sizing, stops and targets remain Jeu37 fixed100.
export const JEU38_POLICY=Object.freeze({id:'mnq-opposed-structure-obstacle-v1',symbol:'MNQ',targetR:2,maximumRiskUSD:100,dailyLossUSD:200,independent:false,executionAllowed:false});
export function obstacleDecision38(signal,entry,context){
 if(!['Long','Short'].includes(signal.side)||!Number.isFinite(entry)||entry<=0||!Number.isFinite(signal.stopPrice)||signal.signalOpen!==signal.signalClose-300)throw Error('Invalid obstacle signal');
 if(!context)return {accepted:true,reason:'unknown-context',obstacles:0};
 if(context.closedAt!==signal.signalClose||context.sourceTime!==signal.signalOpen||context.day!==signal.day)throw Error('Noncausal obstacle context');
 const points=signal.side==='Long'?context.highs:context.lows;
 if(!Array.isArray(points)||points.length>2)throw Error('Invalid pivot context');
 for(const p of points)if(!Number.isFinite(p.price)||p.price<=0||!Number.isSafeInteger(p.sourceTime)||!Number.isSafeInteger(p.confirmedAt)||p.sourceTime>=p.confirmedAt||p.confirmedAt>signal.signalClose)throw Error('Unconfirmed obstacle');
 const sign=signal.side==='Long'?1:-1,risk=sign*(entry-signal.stopPrice);
 if(risk<=0)return {accepted:true,reason:'engine-validates-stop',obstacles:0};
 const obstacles=points.filter(p=>sign*(p.price-entry)>0&&sign*(p.price-entry)<JEU38_POLICY.targetR*risk).length;
 const opposed=context.structure===(sign===1?'Short':'Long');
 return {accepted:!(opposed&&obstacles>0),reason:opposed&&obstacles>0?'opposed-structure-and-obstacle':context.structure===null?'unknown-structure':'no-joint-conflict',obstacles};
}
export function filterObstacleStreams38(streams,contexts){
 const decisions=[];
 const filtered=streams.map(stream=>{
  if(stream.symbol!==JEU38_POLICY.symbol)return stream;
  const bars=new Map(stream.candles.map(b=>[b.time,b])),signals=new Map();
  for(const [time,signal]of stream.signals){
   if(time!==signal.signalClose||!bars.has(time))throw Error('Missing entry open');
   const decision=obstacleDecision38(signal,bars.get(time).open,contexts.get(stream.symbol)?.get(time));
   decisions.push({day:signal.day,signalClose:time,...decision});if(decision.accepted)signals.set(time,signal);
  }
  return {...stream,signals};
 });
 return {streams:filtered,decisions};
}
