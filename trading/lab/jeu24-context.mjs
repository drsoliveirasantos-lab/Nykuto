import {candlePatterns} from '../analysis/structure-core.mjs';
import {historyCalendar} from './jeu14-policy.mjs';
import {JEU24_POLICY as P,JEU24_PRODUCTS,CONFLUENCE_CHECKS} from './jeu24-policy.mjs';

// Cash-session observations only. Carry EMA/RSI and confirmed swings between
// consecutive complete sessions of the same contract; reset at a gap or roll.
export function combinedContexts(candles,product){
  if(!JEU24_PRODUCTS.some(p=>p.symbol===product.symbol&&p.tick===product.tick))throw new Error('Invalid context product');
  const calendar=new Map(historyCalendar(P.from,P.end).map((d,i)=>[d.date,i]));
  const contexts=new Map();let previous=null,day='',sessionVolumes=new Map(),completed=[];
  let fast=null,slow=null,lastClose=null,count=0,gain=0,loss=0,changes=0,highs=[],lows=[],swingBars=[];
  let volume=0,weightedTicks=0;
  function reset(){fast=null;slow=null;lastClose=null;count=0;gain=0;loss=0;changes=0;highs=[];lows=[];completed=[];}
  const toTick=n=>{const t=Math.round(n/product.tick);if(!Number.isSafeInteger(t)||Math.abs(n/product.tick-t)>1e-7)throw new Error('Invalid context price precision');return t;};
  for(const b of candles){
    if(!calendar.has(b.day)||!Number.isSafeInteger(b.time)||b.time%300||!Number.isInteger(b.minute)||(b.minute-570)%5||b.minute<570||!Number.isInteger(b.closeMinute)||b.minute>=b.closeMinute||!Number.isSafeInteger(b.volume)||b.volume<0||!b.ticker||![b.open,b.high,b.low,b.close].every(n=>Number.isFinite(n)&&n>0)||b.low>Math.min(b.open,b.close)||b.high<Math.max(b.open,b.close,b.low)||(previous&&b.time<=previous.time))throw new Error('Invalid context bar');
    const ticks=[b.open,b.high,b.low,b.close].map(toTick);
    if(b.day!==day){
      if(b.minute!==570)throw new Error('Context session must start at opening');
      if(previous){
        if(previous.minute+5!==previous.closeMinute)throw new Error('Incomplete previous context session');
        const contiguous=calendar.get(b.day)===calendar.get(previous.day)+1&&b.ticker===previous.ticker;
        if(contiguous){completed.push(sessionVolumes);completed=completed.slice(-P.volumeSessions);}else reset();
      }
      day=b.day;sessionVolumes=new Map();swingBars=[];volume=0;weightedTicks=0;
    }else if(b.time!==previous.time+300||b.minute!==previous.minute+5||b.closeMinute!==previous.closeMinute||b.ticker!==previous.ticker)throw new Error('Gap within context session');
    const oldClose=lastClose;count++;fast=fast===null?b.close:b.close*2/(P.emaFast+1)+fast*(1-2/(P.emaFast+1));slow=slow===null?b.close:b.close*2/(P.emaSlow+1)+slow*(1-2/(P.emaSlow+1));
    if(oldClose!==null){
      const delta=b.close-oldClose,up=Math.max(delta,0),down=Math.max(-delta,0);changes++;
      if(changes<=P.rsiPeriod){gain+=up;loss+=down;if(changes===P.rsiPeriod){gain/=P.rsiPeriod;loss/=P.rsiPeriod;}}
      else{gain=(gain*(P.rsiPeriod-1)+up)/P.rsiPeriod;loss=(loss*(P.rsiPeriod-1)+down)/P.rsiPeriod;}
    }
    lastClose=b.close;
    const rsi=changes<P.rsiPeriod?null:gain+loss===0?50:100*gain/(gain+loss);
    swingBars.push(b);if(swingBars.length>5)swingBars.shift();
    if(swingBars.length===5){
      const pivot=swingBars[2],other=swingBars.filter((_,i)=>i!==2);
      if(other.every(x=>pivot.high>x.high)){highs.push({price:pivot.high,sourceTime:pivot.time,confirmedAt:b.time+300});highs=highs.slice(-2);}
      if(other.every(x=>pivot.low<x.low)){lows.push({price:pivot.low,sourceTime:pivot.time,confirmedAt:b.time+300});lows=lows.slice(-2);}
    }
    const structure=highs.length<2||lows.length<2?null:highs[1].price>highs[0].price&&lows[1].price>lows[0].price?'Long':highs[1].price<highs[0].price&&lows[1].price<lows[0].price?'Short':'Mixed';
    volume+=b.volume;weightedTicks+=(ticks[1]+ticks[2]+ticks[3])*b.volume;
    const closeWeight=ticks[3]*3*volume;if(![volume,weightedTicks,closeWeight].every(Number.isSafeInteger))throw new Error('Unsafe context VWAP precision');
    const priorVolumes=completed.map(s=>s.get(b.minute)),volumeReady=priorVolumes.length===P.volumeSessions&&priorVolumes.every(Number.isFinite),referenceVolume=volumeReady?priorVolumes.reduce((a,v)=>a+v,0)/P.volumeSessions:null;
    const volumeRatio=referenceVolume>0?b.volume/referenceVolume:null;
    const patterns=candlePatterns(previous?.day===day?previous:null,b,300),closedAt=b.time+300;
    contexts.set(closedAt,{day,ticker:b.ticker,closedAt,sourceTime:b.time,emaReady:count>=P.emaSlow,fast,slow,rsi,structure,highs:[...highs],lows:[...lows],vwapSide:volume>0?Math.sign(closeWeight-weightedTicks):null,volumeRatio,referenceSessions:completed.length,patterns});
    sessionVolumes.set(b.minute,b.volume);previous=b;
  }
  return contexts;
}

export function contextDecision(signal,context){
  const side=signal.side,sign=side==='Long'?1:-1;
  if(!['Long','Short'].includes(side)||signal.signalOpen!==signal.signalClose-300)throw new Error('Invalid confluence signal');
  if(context&&(context.closedAt!==signal.signalClose||context.sourceTime!==signal.signalOpen||context.day!==signal.day))throw new Error('Noncausal confluence context');
  const shapes=side==='Long'?['Englobante haussière','Forme de marteau','Corps haussier dominant']:['Englobante baissière','Longue mèche haute','Corps baissier dominant'];
  const checks={
    trend:!!context?.emaReady&&sign*(context.fast-context.slow)>0&&context.vwapSide===sign,
    structure:context?.structure===side,
    momentum:Number.isFinite(context?.rsi)&&sign*(context.rsi-50)>0,
    volume:Number.isFinite(context?.volumeRatio)&&context.volumeRatio>=P.volumeRatio,
    pattern:!!context?.patterns.some(p=>shapes.includes(p))&&!context.patterns.includes('Doji')
  };
  return {accepted:CONFLUENCE_CHECKS.every(k=>checks[k]),checks,missingContext:!context||!context.emaReady||context.structure===null||context.rsi===null||context.volumeRatio===null};
}

export function filterCombinedSignals(candles,signals,product){
  const contexts=combinedContexts(candles,product),accepted=new Map(),decisions=new Map();
  for(const [time,s]of signals){
    if(time!==s.signalClose)throw new Error('Signal key does not match its close');
    const context=contexts.get(time),decision=contextDecision(s,context);
    if(decision.accepted)accepted.set(time,s);
    decisions.set(time,{day:s.day,side:s.side,...decision,context:context??null});
  }
  return {signals:accepted,decisions,contexts};
}
