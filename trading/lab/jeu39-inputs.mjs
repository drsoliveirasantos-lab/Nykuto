import {inspectOpeningHistory} from './jeu22-history.mjs';
import {admissionSignals} from './jeu23-signals.mjs';
import {failedBreakoutSignals} from './jeu26-signals.mjs';
import {combinedContexts} from './jeu24-context.mjs';
import {filterMarketStreams} from './jeu31-filters.mjs';
import {JEU29_PRODUCTS,JEU29_PROFILES} from './jeu29-policy.mjs';
import {JEU37_POLICY as BASE} from './jeu37-policy.mjs';
import {JEU34_MONTHS} from './jeu34-policy.mjs';
import {historyCalendar} from './jeu14-policy.mjs';

// Same source validation and preparation as Games37/38. No performance here.
export function prepareInputs39(bundle,mnq){
 const markets=JEU29_PROFILES.map(profile=>{const product=JEU29_PRODUCTS.find(p=>p.symbol===profile.symbol);return {...profile,product,data:inspectOpeningHistory(profile.symbol==='MNQ'?mnq:bundle.products.find(p=>p.symbol===profile.symbol),product)};});
 const contexts=new Map();
 for(const m of markets){
  const bars=m.data.groups.filter(g=>g.start>=BASE.warmupFrom).flatMap(g=>g.candles),old=m.data.groups.filter(g=>g.start<'2026-05-01'||g.start>='2026-08-01').flatMap(g=>g.candles),current=combinedContexts(bars,m.product);
  for(const [t,c]of combinedContexts(old,m.product))if(c.day>='2026-08-01')current.set(t,c);
  contexts.set(m.symbol,current);
 }
 const months=JEU34_MONTHS.map(month=>{
  const period={start:month.start,end:month.end},expected=historyCalendar(period.start,period.end);
  if(!expected.every(d=>markets.every(m=>m.data.eligible.some(x=>x.date===d.date))))throw Error('Incomplete source month');
  const raw=markets.map(m=>{const groups=m.data.groups.filter(g=>g.start>=period.start&&g.start<period.end),signals=new Map();for(const g of groups)for(const [t,s]of(m.strategy==='failure'?failedBreakoutSignals:admissionSignals)(g.candles,m.product))signals.set(t,s);return {symbol:m.symbol,candles:groups.flatMap(g=>g.candles),signals};});
  const baseline=filterMarketStreams(raw,contexts,'combined').streams.map(s=>s.symbol==='MYM'?{...s,signals:new Map()}:s);
  return {month,period,expected,baseline};
 });
 return {markets,contexts,months};
}
