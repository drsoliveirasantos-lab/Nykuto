// Reimplementation of past-window column scaling observed in KronosPredictor.
// No model weights, future observations, clipping or inferred trading probability.
const ensure=(ok,message)=>{if(!ok)throw Error(message);};
export function pastWindowFeatures(candles,{asOf,contract,expectedBars=64,epsilon=1e-5}={}){
 ensure(Array.isArray(candles)&&candles.length===expectedBars&&Number.isSafeInteger(asOf)&&typeof contract==='string','Invalid normalization window');
 ensure(Number.isFinite(epsilon)&&epsilon>0,'Invalid normalization epsilon');
 let previous=-Infinity;
 for(const b of candles){
  ensure(Number.isSafeInteger(b.time)&&b.time>previous&&b.closedAt===b.time+900&&b.closedAt<=asOf&&b.ticker===contract,'Noncausal normalization window');
  ensure(['open','high','low','close','volume'].every(k=>Number.isFinite(b[k]))&&b.low>0&&b.high>=Math.max(b.open,b.close,b.low)&&b.low<=Math.min(b.open,b.close)&&b.volume>=0,'Invalid normalization OHLCV');
  previous=b.time;
 }
 const columns={};
 for(const key of ['open','high','low','close','volume']){
  const mean=candles.reduce((sum,b)=>sum+b[key],0)/candles.length;
  const standardDeviation=Math.sqrt(candles.reduce((sum,b)=>sum+(b[key]-mean)**2,0)/candles.length);
  columns[key]={mean,standardDeviation,lastZ:(candles.at(-1)[key]-mean)/(standardDeviation+epsilon)};
 }
 return {bars:candles.length,contract,firstOpen:candles[0].time,lastClose:candles.at(-1).closedAt,asOf,epsilon,columns};
}

export function normalizedEntryDistance(features,{entryOpen,level,side}){
 ensure(features?.columns?.close&&['Long','Short'].includes(side)&&[entryOpen,level].every(n=>Number.isFinite(n)&&n>0),'Invalid normalized entry');
 const {mean,standardDeviation}=features.columns.close;
 // Flat history is unobservable, not a huge synthetic score from epsilon.
 if(standardDeviation===0)return {status:'flat-price-window',extensionZ:null,entryZ:null};
 const denominator=standardDeviation+features.epsilon,sign=side==='Long'?1:-1;
 return {status:'ready',extensionZ:sign*(entryOpen-level)/denominator,entryZ:(entryOpen-mean)/denominator};
}
