import { sessionFor } from './session-comparison.mjs';
import { historyCalendar } from './jeu14-policy.mjs';
import { inspectMultimarket, scheduleCovers } from './jeu19-history.mjs';
import { JEU19_SEGMENTS } from './jeu19-policy.mjs';
import { JEU20_POLICY as P } from './jeu20-policy.mjs';
import { signalsFor } from './jeu12-engine.mjs';
import { contextFor, RULES } from './validation-engine.mjs';

export function nativeSignals(candles, thirty, mode='pullback') {
  if(mode!=='pullback')throw new Error('Unregistered native-preparation method');
  const ctx=contextFor(thirty), result=new Map();let j=-1;
  for(const [time,signal] of signalsFor(candles,5,'pullback')){
    while(j+1<thirty.length&&thirty[j+1].closedAt<=time)j++;
    if(j<0||thirty[j].day!==signal.day||![ctx.fast[j],ctx.slow[j],ctx.adx[j]].every(Number.isFinite)||ctx.adx[j]<RULES.adxMin)continue;
    const side=ctx.fast[j]>ctx.slow[j]?'Long':ctx.fast[j]<ctx.slow[j]?'Short':null;
    if(side===signal.side)result.set(time,{...signal,trendClosedAt:thirty[j].closedAt});
  }
  return result;
}

export function inspectNativePreparation(bundle,product){
  if(product.symbol!=='MYM')throw new Error('Unregistered market');
  inspectMultimarket(bundle,product); // Preserve the earlier metadata and 5-minute validation.
  const groups=[],eligible=[],unavailable=[],quality=[];
  for(const [index,d] of JEU19_SEGMENTS.filter(d=>d.symbol==='MYM').entries()){
    const raw=bundle.segments[index],calendar=historyCalendar(d.prep,d.end),lookup=new Map(calendar.map(s=>[s.date,s]));
    if(raw.nativePaginationComplete!==true||!Array.isArray(raw.native30))throw new Error('Native pagination incomplete');
    const five=new Map(calendar.map(s=>[s.date,[]])),thirty=new Map(calendar.map(s=>[s.date,[]])),fiveByTime=new Map();
    for(const values of raw.bars){
      const [time,open,high,low,close,volume]=values,local=sessionFor(time),s=lookup.get(local.day);if(!s)continue;
      const closeMinute=Number(s.close.slice(11,13))*60+Number(s.close.slice(14,16));if(local.minute<570||local.minute>=closeMinute)continue;
      const b={time,open,high,low,close,volume,...local,closeMinute,ticker:d.ticker};five.get(local.day).push(b);fiveByTime.set(time,b);
    }
    const seen=new Set(),badNative=new Set();let compared=0;
    for(const row of raw.native30){
      if(!Array.isArray(row)||row.length!==6||!row.every(Number.isFinite))throw new Error('Invalid native row');
      const [time,open,high,low,close,volume]=row,local=sessionFor(time),s=lookup.get(local.day);
      if(!Number.isInteger(time)||time%1800||seen.has(time)||low<=0||low>Math.min(open,close)||high<Math.max(open,close,low)||volume<0||[open,high,low,close].some(p=>Math.abs(p/product.tick-Math.round(p/product.tick))>1e-7))throw new Error('Invalid native price, tick or timestamp');
      seen.add(time);if(!s)continue;
      const closeMinute=Number(s.close.slice(11,13))*60+Number(s.close.slice(14,16));if(local.minute<570||local.minute>=closeMinute)continue;
      const parts=Array.from({length:6},(_,i)=>fiveByTime.get(time+i*300)).filter(Boolean);
      const summed=parts.length?[parts[0].open,Math.max(...parts.map(b=>b.high)),Math.min(...parts.map(b=>b.low)),parts.at(-1).close,parts.reduce((n,b)=>n+b.volume,0)]:[];
      if(summed.length!==5||summed.some((v,i)=>Math.abs(v-row[i+1])>1e-7))badNative.add(local.day);else compared++;
      thirty.get(local.day).push({time,open,high,low,close,volume,...local,closeMinute,closedAt:time+1800});
    }
    const runs5=[],runs30=[],days=[];let active5=null,active30=null;
    for(const s of calendar){
      const closeMinute=Number(s.close.slice(11,13))*60+Number(s.close.slice(14,16)), a=five.get(s.date).sort((a,b)=>a.time-b.time),b=thirty.get(s.date).sort((a,b)=>a.time-b.time);
      const scheduled=scheduleCovers(bundle.scheduleEvents,product,s.date,closeMinute);
      const good5=scheduled&&a.length===(closeMinute-570)/5&&a.every((x,i)=>x.minute===570+i*5);
      const good30=scheduled&&!badNative.has(s.date)&&b.length===(closeMinute-570)/30&&b.every((x,i)=>x.minute===570+i*30);
      if(!good5)active5=null;else if(active5===null){active5=runs5.length;runs5.push({bars:[],days:[]});}
      if(!good30)active30=null;else if(active30===null){active30=runs30.length;runs30.push({bars:[],days:[]});}
      const warm5=active5===null?0:runs5[active5].bars.length,warm30=active30===null?0:runs30[active30].bars.length;
      days.push({date:s.date,run5:active5,run30:active30,good5,good30,warm5,warm30});
      if(active5!==null){runs5[active5].bars.push(...a);runs5[active5].days.push(s.date);}
      if(active30!==null){runs30[active30].bars.push(...b);runs30[active30].days.push(s.date);}
    }
    const byPair=new Map();
    for(const day of days.filter(s=>s.date>=d.start)){
      if(!day.good5||!day.good30||day.warm5<P.warmup5||day.warm30<P.warmup30){unavailable.push({ticker:d.ticker,...day,reason:!day.good5||!day.good30?'missing-data':'warmup'});continue;}
      eligible.push({ticker:d.ticker,date:day.date});const key=day.run5+'/'+day.run30;
      if(!byPair.has(key))byPair.set(key,[]);byPair.get(key).push(day);
    }
    for(const part of byPair.values()){
      const first=part[0],last=part.at(-1),end=new Date(Date.parse(last.date+'T00:00:00Z')+86400000).toISOString().slice(0,10);
      groups.push({ticker:d.ticker,start:first.date,end,candles:runs5[first.run5].bars.filter(b=>b.day<end),thirty:runs30[first.run30].bars.filter(b=>b.day<end)});
    }
    quality.push({ticker:d.ticker,nativeReconciled:compared,nativeMismatchDays:[...badNative],days});
  }
  const expected=historyCalendar(P.from,P.end),all=[...eligible,...unavailable];
  if(all.length!==expected.length||new Set(all.map(d=>d.date)).size!==expected.length||expected.some(s=>!all.some(d=>d.date===s.date)))throw new Error('Native coverage omission or duplicate');
  return {groups,eligible,unavailable,quality,expectedSessions:expected.length};
}
