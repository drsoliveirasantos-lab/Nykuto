import {JEU26_POLICY as P,JEU26_PRODUCTS} from './jeu26-policy.mjs';

// Closed breakout followed by the FIRST close strictly back inside the range.
// A sustained trend or a wick without a closed re-entry is never a reversal.
export function failedBreakoutSignals(candles,product){
  if(!JEU26_PRODUCTS.some(p=>p.symbol===product.symbol&&p.tick===product.tick&&p.multiplier===product.multiplier))throw new Error('Invalid product');
  const result=new Map();let day='',opening=[],range=null,pending=null,previous=null,exhausted=false;
  for(const b of candles){
    if(previous&&b.time<=previous.time)throw new Error('Nonchronological bars');
    if(b.day!==day){day=b.day;opening=[];range=null;pending=null;previous=null;exhausted=false;}
    if(previous&&(b.time!==previous.time+300||b.ticker!==previous.ticker))throw new Error('Gap or contract change in session');
    if(![b.open,b.high,b.low,b.close].every(n=>Number.isFinite(n)&&n>0&&Math.abs(n/product.tick-Math.round(n/product.tick))<1e-7)||b.low>Math.min(b.open,b.close)||b.high<Math.max(b.open,b.close)||b.low>b.high)throw new Error('Invalid prices');
    previous=b;
    if(b.minute<600){
      if(b.minute!==570+opening.length*5)throw new Error('Incomplete opening range');
      opening.push(b);
      if(opening.length===P.openingMinutes/5)range={high:Math.max(...opening.map(x=>x.high)),low:Math.min(...opening.map(x=>x.low)),closedAt:b.time+300};
      continue;
    }
    if(!range)throw new Error('Opening range unavailable');
    if(b.minute+5>P.latestEntryMinute){pending=null;continue;}
    const inside=b.close>range.low&&b.close<range.high;
    if(pending){
      pending.high=Math.max(pending.high,b.high);pending.low=Math.min(pending.low,b.low);
      const expired=b.time-pending.time>P.failureBars*300;
      if(expired){pending=null;exhausted=true;}
      else if(inside){
        const side=pending.direction==='up'?'Short':'Long',sign=side==='Long'?1:-1;
        if(sign*(b.close-b.open)>0){
          const excursionExtreme=sign===1?pending.low:pending.high;
          result.set(b.time+300,{side,day,signalOpen:b.time,signalClose:b.time+300,trendClosedAt:range.closedAt,rangeClosedAt:range.closedAt,rangeHigh:range.high,rangeLow:range.low,breakoutAt:pending.time+300,excursionExtreme,stopPrice:Number((excursionExtreme-sign*product.tick).toFixed(8)),pattern:'orb-failure'});
        }
        pending=null;exhausted=false;
      }
    }
    // An expired excursion must close back inside before it can re-arm.
    if(inside){exhausted=false;continue;}
    if(!pending&&!exhausted){
      const direction=b.close>=range.high+product.tick?'up':b.close<=range.low-product.tick?'down':null;
      if(direction)pending={direction,time:b.time,high:b.high,low:b.low};
    }
  }
  return result;
}
