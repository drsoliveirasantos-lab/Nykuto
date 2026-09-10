import {JEU45_POLICY as P,variant45} from './jeu45-policy.mjs';
const london=new Intl.DateTimeFormat('en-GB',{timeZone:P.londonTimeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23',weekday:'short'});
const ny=new Intl.DateTimeFormat('en-GB',{timeZone:P.newYorkTimeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
const parts=(fmt,time)=>Object.fromEntries(fmt.formatToParts(new Date(time*1000)).map(p=>[p.type,p.value]));
const date=p=>`${p.year}-${p.month}-${p.day}`,minute=p=>Number(p.hour)*60+Number(p.minute);
export function session45(time){
 if(!Number.isSafeInteger(time)||time%300)throw Error('Invalid session clock');
 const a=parts(london,time),b=parts(ny,time),day=date(b),londonDay=date(a),londonMinute=minute(a),newYorkMinute=minute(b);
 if(day<P.from||day>=P.end)throw Error('Session outside frozen period');
 const holiday=P.londonClosedDates.includes(londonDay),weekend=['Sat','Sun'].includes(a.weekday);
 const overlap=!holiday&&!weekend&&londonMinute>=P.londonOpenMinute&&londonMinute<P.londonCloseMinuteExclusive;
 const category=holiday?'london-bank-holiday':weekend?'london-weekend':overlap?'london-overlap':londonMinute>=P.londonCloseMinuteExclusive?'after-london-cash':'before-london-cash';
 return {day,londonDay,londonMinute,newYorkMinute,overlap,category,nyHour:`${String(Math.floor(newYorkMinute/60)).padStart(2,'0')}:00`};
}
export function filterSessions45(streams,id){
 const variant=variant45(id),decisions=[];
 if(new Set(streams.map(s=>s.symbol)).size!==streams.length)throw Error('Duplicate markets');
 const result=streams.map(s=>{
  const signals=new Map();
  for(const[time,signal]of s.signals){
   const clock=session45(time);
   if(signal.day!==clock.day||signal.signalClose!==time||signal.signalOpen!==time-300)throw Error('Noncausal session signal');
   let allowed=true,reason='reference';
   if(s.symbol===variant.targetSymbol&&['london-overlap','outside-london'].includes(variant.mechanism)){
    allowed=variant.mechanism==='london-overlap'?clock.overlap:!clock.overlap;
    reason=allowed?'session-allowed':'session-veto';
   }
   decisions.push({symbol:s.symbol,time,side:signal.side,day:signal.day,allowed,reason,...clock});
   if(allowed)signals.set(time,signal);
  }
  return signals.size===s.signals.size?s:{...s,signals};
 });
 return {streams:result,decisions};
}
