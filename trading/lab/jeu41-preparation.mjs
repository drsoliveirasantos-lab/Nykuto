import {combinedContexts} from './jeu24-context.mjs';
import {admissionSignals} from './jeu23-signals.mjs';
import {failedBreakoutSignals} from './jeu26-signals.mjs';
import {filterMarketStreams} from './jeu31-filters.mjs';
// Exact preparation functions from frozen Game40; no strategy or warmup change.
export function contexts40(markets,month,through='2026-08-31'){
 const contexts=new Map(),summer=month.start>='2026-06-01';
 for(const m of markets){
  const groups=m.data.groups.filter(g=>g.start<=through),bars=groups.filter(g=>g.start>=(summer?'2026-05-01':'2026-01-01')).flatMap(g=>g.candles),current=combinedContexts(bars,m.product);
  if(summer){const old=groups.filter(g=>g.start<'2026-05-01'||g.start>='2026-08-01').flatMap(g=>g.candles);for(const[t,c]of combinedContexts(old,m.product))if(c.day>='2026-08-01')current.set(t,c);}
  contexts.set(m.symbol,current);
 }
 return contexts;
}
export function filtered40(markets,contexts,month,available,through='2026-08-31'){
 const dates=new Set(available.filter(d=>d.date<=through).map(d=>d.date));
 const raw=markets.map(m=>{const groups=m.data.groups.filter(g=>g.start>=month.start&&g.start<month.end&&dates.has(g.start)),signals=new Map();
  for(const g of groups)for(const[t,s]of(m.strategy==='failure'?failedBreakoutSignals:admissionSignals)(g.candles,m.product))signals.set(t,s);
  return {symbol:m.symbol,candles:groups.flatMap(g=>g.candles),signals};
 });
 const filtered=filterMarketStreams(raw,contexts,'combined');
 return {...filtered,streams:filtered.streams.map(s=>s.symbol==='MYM'?{...s,signals:new Map()}:s)};
}
