import {sessionFor} from './session-comparison.mjs';
import {JEU29_PRODUCTS} from './jeu29-policy.mjs';
import {JEU41_POLICY as P,JEU41_VARIANTS} from './jeu41-policy.mjs';

const knownVariant=id=>JEU41_VARIANTS.some(v=>v.id===id);
const priceOnTick=(price,tick)=>Number.isFinite(price)&&price>0&&Math.abs(price/tick-Math.round(price/tick))<1e-7;
const exactCents=value=>{
 const cents=Math.round(value*100);
 if(!Number.isSafeInteger(cents)||Math.abs(value*100-cents)>1e-6)throw Error('Unsafe net-reward monetary precision');
 return cents;
};

// This decision reads the next entry open and the already closed signal only.
// A malformed or wrong-side stop is left to the existing execution validator.
// Quantities cannot change this ratio: both price risk and costs are linear.
export function assessNetReward41(symbol,time,signal,entryOpen,product,factor,variant){
 const source=JEU29_PRODUCTS.find(p=>p.symbol===symbol);
 if(!source||!product||product.symbol!==symbol||!['tick','multiplier','fees'].every(k=>product[k]===source[k])
  ||![1,2].includes(factor)||!knownVariant(variant))throw Error('Invalid net-reward policy or product');
 if(!Number.isSafeInteger(time)||time%300||!signal||signal.signalClose!==time||signal.signalOpen!==time-300
  ||!['Long','Short'].includes(signal.side)||!['orb-retest','orb-failure'].includes(signal.pattern)
  ||![signal.rangeClosedAt,signal.breakoutAt,signal.trendClosedAt].every(Number.isSafeInteger)
  ||signal.rangeClosedAt>signal.breakoutAt||signal.breakoutAt>signal.signalOpen||signal.trendClosedAt>time)
  throw Error('Invalid or noncausal net-reward signal');
 const local=sessionFor(time),opening=time-(local.minute-570)*60;
 if(local.day!==signal.day||local.minute<600||local.minute>720||signal.rangeClosedAt<opening
  ||![signal.rangeLow,signal.rangeHigh].every(n=>priceOnTick(n,product.tick))||signal.rangeLow>=signal.rangeHigh
  ||!priceOnTick(entryOpen,product.tick))throw Error('Invalid entry open or signal session');
 const unchanged={allowed:true,reason:variant==='baseline'?'baseline-unchanged':'other-market-unchanged',unitRiskUSD:null,unitCostUSD:null,netRewardRisk:null};
 if(variant==='baseline'||symbol!==P.targetSymbol)return unchanged;
 if(signal.pattern!=='orb-retest')throw Error('MES net-reward requires the unchanged retest profile');
 const sign=signal.side==='Long'?1:-1;
 if(!priceOnTick(signal.stopPrice,product.tick)||sign*(entryOpen-signal.stopPrice)<=0)
  return {...unchanged,reason:'engine-validates-stop'};
 const level=sign===1?signal.rangeHigh:signal.rangeLow;
 if(sign*(entryOpen-level)<=0)return {...unchanged,reason:'engine-validates-entry'};
 const ticks=Math.round(sign*(entryOpen-signal.stopPrice)/product.tick);
 const unitRiskCents=exactCents(ticks*product.tick*product.multiplier);
 const unitCostCents=exactCents((product.fees+2*product.tick*product.multiplier)*factor);
 if(P.targetR!==2||P.minimumNetRewardRisk!==1.5||P.minimumUnitRiskCostMultiple!==5)
  throw Error('Integer net-reward equivalence requires the frozen 2R / 1.5 policy');
 const allowed=unitRiskCents>=P.minimumUnitRiskCostMultiple*unitCostCents;
 return {allowed,reason:allowed?'mes-net-reward-passed':'mes-net-reward-below-1.5',
  unitRiskUSD:unitRiskCents/100,unitCostUSD:unitCostCents/100,
  netRewardRisk:(P.targetR*unitRiskCents-unitCostCents)/(unitRiskCents+unitCostCents)};
}

export function filterNetRewardStreams41(streams,factor,variant){
 if(!Array.isArray(streams)||![1,2].includes(factor)||!knownVariant(variant)
  ||new Set(streams.map(s=>s.symbol)).size!==streams.length)throw Error('Invalid net-reward streams');
 const decisions=[];
 const filtered=streams.map(stream=>{
  const product=JEU29_PRODUCTS.find(p=>p.symbol===stream.symbol);
  if(!product||!Array.isArray(stream.candles)||!(stream.signals instanceof Map))throw Error('Invalid net-reward stream');
  const bars=new Map();
  for(const b of stream.candles){
   if(!Number.isSafeInteger(b.time)||b.time%300||bars.has(b.time))throw Error('Invalid or duplicate entry bar');
   bars.set(b.time,b);
  }
  const signals=new Map();
  for(const[time,signal]of stream.signals){
   const bar=bars.get(time);
   if(!bar||bar.day!==signal.day||bar.minute!==sessionFor(time).minute||typeof bar.ticker!=='string'||!bar.ticker.startsWith(stream.symbol))
    throw Error('Missing or mismatched entry source');
   const decision=assessNetReward41(stream.symbol,time,signal,bar.open,product,factor,variant);
   decisions.push({symbol:stream.symbol,time,day:signal.day,side:signal.side,...decision});
   if(decision.allowed)signals.set(time,signal);
  }
  return variant==='baseline'||stream.symbol!==P.targetSymbol?stream:{...stream,signals};
 });
 return {streams:filtered,decisions};
}
