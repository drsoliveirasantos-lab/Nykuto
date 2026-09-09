import test from 'node:test';
import assert from 'node:assert/strict';
import { historyCalendar } from '../trading/lab/jeu14-policy.mjs';
import { JEU19_SEGMENTS } from '../trading/lab/jeu19-policy.mjs';
import { JEU21_PRODUCTS } from '../trading/lab/jeu21-policy.mjs';
import { inspectMultimarket } from '../trading/lab/jeu19-history.mjs';
import { inspectNativePreparation, nativeSignals } from '../trading/lab/jeu21-history.mjs';
const product=JEU21_PRODUCTS[0];
function fixture(){
  const scheduleEvents=new Map(),segments=JEU19_SEGMENTS.filter(d=>d.symbol==='MES').map(d=>{
    const bars=[],native30=[];let index=0;
    for(const s of historyCalendar(d.prep,d.end)){
      scheduleEvents.set(s.date,[{product_code:'MES',trading_venue:'XCME',session_end_date:s.date,event:'open',timestamp:s.date+'T00:00:00Z'},{product_code:'MES',trading_venue:'XCME',session_end_date:s.date,event:'close',timestamp:s.date+'T23:00:00Z'}]);
      const start=Date.parse(s.date+(s.date>='2026-03-08'?'T13:30:00Z':'T14:30:00Z'))/1000;
      const count=s.close.includes('13:00:00')?42:78,day=[];
      for(let i=0;i<count;i++){const price=50000+index++;if(d.ticker==='MESM6'&&s.date==='2026-03-03'&&i===0)continue;day.push([start+i*300,price,price+4,price-8,price+2,10]);}
      bars.push(...day);
      for(let i=0;i<count;i+=6){const block=day.filter(b=>b[0]>=start+i*300&&b[0]<start+(i+6)*300);native30.push([start+i*300,block[0][1],Math.max(...block.map(b=>b[2])),Math.min(...block.map(b=>b[3])),block.at(-1)[4],block.reduce((n,b)=>n+b[5],0)]);}
    }
    return {ticker:d.ticker,paginationComplete:true,nativePaginationComplete:true,metadata:{ticker:d.ticker,product_code:'MES',trading_venue:'XCME',trade_tick_size:.25,first_trade_date:'2024-01-01',last_trade_date:'2026-12-31'},bars,native30};
  });
  return {symbol:'MES',segments,scheduleEvents:[...scheduleEvents.values()].flat()};
}
test('native reconciliation restores preparation without inventing missing 5-minute bars',()=>{
  const data=fixture(),before=data.segments[1].bars.length;
  const old=inspectMultimarket(data,product),updated=inspectNativePreparation(data,product);
  assert.ok(old.unavailable.length>0);assert.equal(updated.unavailable.length,0);assert.equal(updated.eligible.length,166);
  assert.equal(data.segments[1].bars.length,before);
  assert.ok(updated.quality.every(q=>q.nativeMismatchDays.length===0));
});
test('a discrepant native volume blocks the day and resets preparation',()=>{
  const data=fixture(),row=data.segments[1].native30.find(b=>b[0]===Date.parse('2026-03-03T14:30:00Z')/1000);
  row[5]++;
  const checked=inspectNativePreparation(data,product);
  assert.ok(checked.quality[1].nativeMismatchDays.includes('2026-03-03'));
  assert.ok(checked.unavailable.some(d=>d.date==='2026-03-16'));
  data.segments[1].nativePaginationComplete=false;
  assert.throws(()=>inspectNativePreparation(data,product),/pagination/);
});
test('native trend signals remain identical when every future bar is removed',()=>{
  const checked=inspectNativePreparation(fixture(),product),g=checked.groups.find(g=>g.ticker==='MESM6');
  const all=nativeSignals(g.candles,g.thirty),cut=g.candles.find(b=>b.day==='2026-04-01'&&b.minute===955).time+300;
  const prefix=nativeSignals(g.candles.filter(b=>b.time<cut),g.thirty.filter(b=>b.closedAt<=cut));
  assert.ok(prefix.size>0);
  assert.deepEqual([...prefix],[...all].filter(([t])=>t<=cut));
  for(const [time,s] of prefix)assert.ok(s.trendClosedAt<=time);
});

test("native Cross uses a separately prepared trend and rejects unknown modes",()=>{const g=inspectNativePreparation(fixture(),product).groups[0];const all=nativeSignals(g.candles,g.thirty,"cross");for(const [t,s]of all)assert.ok(s.trendClosedAt<=t);assert.throws(()=>nativeSignals(g.candles,g.thirty,"invented"),/Unregistered/);});
