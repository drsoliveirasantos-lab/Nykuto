import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyConfidenceReport} from '../trading/lab/jeu37-report-validation.mjs';
import {calendarCells37,gradeEvidence37} from '../trading/lab/jeu37-calendar-view.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url)),hash=b=>createHash('sha256').update(b).digest('hex'),cents=n=>Math.round(n*100)/100;
test('confidence report preserves pre-performance code and reconciles 36 monthly cashflows, score cohorts and unchanged controls',async()=>{
 const raw=await read('trading/lab/jeu37-report.json'),r=await verifyConfidenceReport(raw),f=await read('trading/lab/jeu37-freeze.json');
 assert.equal(hash(f),r.freezeSha256);for(const [p,sha]of Object.entries(JSON.parse(f).files))assert.equal(hash(await read(p)),sha,p);
 assert.deepEqual(r.audit,{controlReplays:6,newEngineParity:6,accountPrefixes:766,checkedTrades:563,passed:true});
 assert.equal(r.newConfigurations,5);assert.equal(r.newRiskPolicies,4);assert.ok(r.assessments.every(a=>a.objectivePassed===false));assert.equal(r.selection,null);
 const old=JSON.parse(await read('trading/lab/jeu36-report.json'));
 for(const v of r.views)for(const [cost,c]of Object.entries(v.costs)){
  assert.equal(cents(c.balance+c.withdrawnUSD-50000),c.net);
  assert.equal(cents(c.calendar.daily.reduce((n,d)=>n+(d.net??0),0)),c.net);
  assert.equal(cents(c.calendar.weeks.reduce((n,w)=>n+(w.net??0),0)),c.net);
  assert.equal(cents(c.contributions.reduce((n,m)=>n+m.net,0)),c.net);
  assert.equal(cents(c.calendar.daily.reduce((n,d)=>n+d.receiptEUR,0)),c.receiptEUR);
  assert.ok(c.calendar.daily.filter(d=>d.receiptEUR>0).length<=1);
  let net=0;for(const d of c.calendar.daily){if(d.net===null){assert.ok(d.state.startsWith('stopped-'));assert.ok(d.markets.every(m=>m.net===null&&m.trades===null));continue;}
   net=cents(net+d.net);assert.equal(d.cumulative,net);assert.equal(cents(d.markets.reduce((n,m)=>n+m.net,0)),d.net);assert.equal(d.markets.reduce((n,m)=>n+m.trades,0),d.trades);
  }
  for(const symbol of ['MNQ','MES'])assert.equal(c.quality.filter(q=>q.symbol===symbol).reduce((n,q)=>n+q.trades,0),c.contributions.find(m=>m.symbol===symbol).trades);
  if(v.variant==='control'||v.variant==='fixed100'){
   const b=old.views.find(x=>x.variant==='baseline'&&x.month===v.month&&x.mode==='funded').costs[cost];for(const key of ['net','trades','drawdown','contributions','balance'])assert.deepEqual(c[key],b[key]);
  }
 }
 assert.equal(r.views.filter(v=>v.costs.normal.profitGoalAchieved).length,1);assert.equal(r.views.filter(v=>v.costs.stress.profitGoalAchieved).length,0);
 assert.equal(/"(?:entryTime|exitTime|stopPrice|candles)"\s*:/.test(raw.toString()),false);
 const bad=Buffer.from(raw);bad[15]^=1;await assert.rejects(()=>verifyConfidenceReport(bad));
});
test('calendars align all 92 summer dates on Mondays and distinguish unstudied dates, stopped simulations and no-trade days',async()=>{
 const r=JSON.parse(await read('trading/lab/jeu37-report.json'));
 for(const variant of r.variants)for(const cost of ['normal','stress']){
  const views=r.views.filter(v=>v.variant===variant.id),all=[];
  for(const v of views){const cells=calendarCells37(v.period,v.costs[cost].calendar.daily);assert.equal(cells.length%7,0);
   for(const [i,d]of cells.entries())if(d.day){assert.equal((new Date(d.day+'T00:00:00Z').getUTCDay()+6)%7,i%7);all.push(d);}
  }
  assert.equal(all.length,92);assert.equal(all.filter(d=>d.state==='weekend').length,26);
  assert.deepEqual(all.filter(d=>d.state==='not-studied').map(d=>d.day),['2026-06-19','2026-07-03']);
  assert.ok(all.filter(d=>d.state==='no-trade').every(d=>d.net===0&&d.trades===0));
 }
 const stopped=r.views.find(v=>v.variant==='fixed500'&&v.month==='june').costs.normal.calendar.daily;
 assert.deepEqual(stopped.filter(d=>d.net===null).map(d=>d.day),['2026-06-29','2026-06-30']);
 for(const cost of ['normal','stress']){const grades=gradeEvidence37(r.views,cost);assert.equal(grades.length,6);assert.ok(grades.filter(q=>q.grade==='full').every(q=>q.trades===0&&q.meanNetR===null));}
});
class Element{
 constructor(tag='div'){this.tagName=tag;this.value='';this.textContent='';this.children=[];this.listeners={};this.attributes={};}
 append(n){this.children.push(n);}replaceChildren(...v){this.children=v;}addEventListener(k,f){this.listeners[k]=f;}setAttribute(k,v){this.attributes[k]=v;}
}
test('all 12 risk selectors render three calendars and exact day details, including missing days and stopped periods; invalid report stays hidden',async()=>{
 const html=(await read('trading/lab/index.html')).toString(),ids=[...html.matchAll(/id="(risk37[^"]*)"/g)].map(m=>m[1]),raw=await read('trading/lab/jeu37-report.json'),r=JSON.parse(raw),original={document:globalThis.document,fetch:globalThis.fetch};
 const money=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(n);
 try{for(const valid of [true,false]){
  const elements=new Map(ids.map(id=>[id,new Element()])),el=id=>elements.get(id),done=Promise.withResolvers();
  Object.defineProperty(el('risk37Results'),'hidden',{set(v){this.isHidden=v;done.resolve();}});
  el('risk37Variant').value='fixed100';el('risk37Cost').value='normal';
  globalThis.document={getElementById(id){assert.ok(elements.has(id),id);return el(id);},createElement(tag){return new Element(tag);}};
  globalThis.fetch=async()=>new Response(valid?raw:'<html>Login</html>');await import(`../trading/lab/lab-confidence.mjs?test=${valid}`);await done.promise;
  assert.equal(el('risk37Results').isHidden,!valid);if(!valid)continue;
  for(const v of r.variants)for(const cost of ['normal','stress']){
   el('risk37Variant').value=v.id;el('risk37Cost').value=cost;el('risk37Cost').listeners.change();
   const views=r.views.filter(x=>x.variant===v.id);
   assert.equal(el('risk37Calendars').children.length,3);assert.equal(el('risk37Comparison').children.length,5);assert.equal(el('risk37Grades').children.length,6);
   assert.equal(el('risk37Weeks').children.length,views.reduce((n,x)=>n+x.costs[cost].calendar.weeks.length,0));
   for(const [i,view]of views.entries()){
    const cells=calendarCells37(view.period,view.costs[cost].calendar.daily);
    for(const [j,d]of cells.entries())if(d.day){
     el('risk37Calendars').children[i].children[4].children[j].listeners.click();
     assert.ok(el('risk37DayTitle').textContent.startsWith(d.day.slice(8)+'/'+d.day.slice(5,7)));
     if(typeof d.net==='number'){
      assert.equal(el('risk37DayTable').hidden,false);assert.ok(el('risk37DaySummary').textContent.includes(money(d.net)));
      for(const [m,market]of d.markets.entries())assert.equal(el('risk37DayMarkets').children[m].children[2].textContent,money(market.net));
     }else{assert.equal(el('risk37DayTable').hidden,true);assert.equal(el('risk37DayMarkets').children.length,0);}
    }
   }
  }
 }}finally{globalThis.document=original.document;globalThis.fetch=original.fetch;}
});
