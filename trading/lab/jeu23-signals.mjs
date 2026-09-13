import { JEU23_POLICY as P } from './jeu23-policy.mjs';

// Emit causal candidates independently of fees. Only execution consumes a side.
export function admissionSignals(candles, product) {
  const result=new Map();let day='',opening=[],range=null,pending=null,previous=null;
  for(const b of candles){
    if(previous&&b.time<=previous.time)throw new Error('Nonchronological opening bars');
    if(b.day!==day){day=b.day;opening=[];range=null;pending=null;previous=null;}
    if(previous&&b.time!==previous.time+300)throw new Error('Gap in opening session');
    previous=b;
    if(b.minute<600){
      if(b.minute!==570+opening.length*5)throw new Error('Incomplete opening range');
      opening.push(b);
      if(opening.length===P.openingMinutes/5)range={high:Math.max(...opening.map(x=>x.high)),low:Math.min(...opening.map(x=>x.low)),closedAt:b.time+300};
      continue;
    }
    if(!range)throw new Error('Opening range unavailable');
    if(b.minute+5>P.latestEntryMinute){pending=null;continue;}
    if(pending){
      const sign=pending.side==='Long'?1:-1,level=sign===1?range.high:range.low;
      const expired=b.time-pending.time>P.retestBars*300;
      const failed=sign*(b.close-level)<=0;
      if(expired||failed)pending=null;
      else if(b.time>pending.time&&(sign===1?b.low<=level:b.high>=level)&&sign*(b.close-b.open)>0){
        const stopPrice=Number(((sign===1?b.low:b.high)-sign*product.tick).toFixed(8));
        result.set(b.time+300,{side:pending.side,day,signalOpen:b.time,signalClose:b.time+300,trendClosedAt:range.closedAt,rangeClosedAt:range.closedAt,rangeHigh:range.high,rangeLow:range.low,breakoutAt:pending.time+300,stopPrice,pattern:'orb-retest'});
        pending=null;
      }
    }
    if(!pending){
      const side=b.close>=range.high+product.tick?'Long':b.close<=range.low-product.tick?'Short':null;
      if(side)pending={side,time:b.time};
    }
  }
  return result;
}
