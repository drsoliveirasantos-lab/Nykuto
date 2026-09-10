import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHistoryLoader,initHistoryCalendar} from '../trading/lab/lab-calendar-history.mjs';
import {adaptHistoryReport,selectHistory,historyCells,historyDay,readHistoryPreferences,saveHistoryPreferences,HISTORY_STORAGE_KEY} from '../trading/lab/history-calendar-view.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url)),cents=n=>Math.round(n*100)/100;
const manifest=JSON.parse(await read('trading/lab/history-calendar-manifest.json'));
const raw=new Map(await Promise.all(manifest.games.map(async g=>[g.id,await read('trading/lab/'+g.report)])));
const fetcher=async url=>{const filename=new URL(url).pathname.split('/').at(-1);if(filename==='history-calendar-manifest.json')return Response.json(manifest);const id=manifest.games.find(g=>g.report===filename)?.id;return new Response(raw.get(id),{status:id?200:404});};
const load=createHistoryLoader(fetcher),models=new Map(await Promise.all(manifest.games.map(async g=>[g.id,await load(g)])));
const money=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(n);

test('shared history keeps all 168 monthly cost views exact, includes six games and excludes the continuous summer account',()=>{
 let count=0;
 for(const g of manifest.games){
  const source=JSON.parse(raw.get(g.id)),original=JSON.stringify(source),model=adaptHistoryReport(source,g);
  assert.equal(JSON.stringify(source),original,'adapter must not mutate archive');
  for(const variant of model.variants)for(const mode of model.modes)for(const cost of ['normal','stress']){
   const selection=selectHistory(model,{variant:variant.id,mode,cost,day:'2026-07-14'});assert.equal(selection.months.length,3);
   for(const month of selection.months){count++;const v=source.views.find(v=>(v.month??v.id)===month.month&&(v.variant??v.profileId)===variant.id&&(v.mode??(g.id==='33'?'evaluation':'funded'))===mode),c=v.costs[cost],d=month.result.calendar.daily;
    assert.equal(month.result.net,c.net);assert.equal(cents(d.reduce((n,r)=>n+(r.net??0),0)),c.net);assert.equal(cents(month.result.calendar.weeks.reduce((n,w)=>n+(w.net??0),0)),c.net);
    assert.deepEqual(d.map(r=>[r.day,r.net,r.trades,r.cumulative,r.balance]),c.calendar.daily.map(r=>[r.day,r.net,r.trades,r.cumulative,r.balance]));
    assert.equal(month.period.start,v.period.start);assert.equal(month.period.end,v.period.end);
   }
  }
 }
 assert.equal(count,168);assert.equal(models.get('33').views.length,12);assert.ok(models.get('33').views.every(v=>v.month!=='summer'));
 assert.equal(selectHistory(models.get('37'),{variant:'control'}).goalMode,'personal');assert.equal(selectHistory(models.get('37'),{variant:'fixed100'}).goalMode,'profit');
 assert.equal(selectHistory(models.get('35'),{mode:'evaluation'}).goalMode,'evaluation');
 assert.equal(selectHistory(models.get('33')).months[0].result.receiptEUR,null);
 for(const id of ['34','35','36','38'])assert.ok(selectHistory(models.get(id)).months.every(m=>m.result.calendar.daily.every(d=>d.markets===null&&d.averageRiskUSD===null)));
});

test('all calendar layouts retain exact date positions, non-studied dates, stopped nulls and truthful optional fields',()=>{
 for(const model of models.values())for(const variant of model.variants)for(const mode of model.modes)for(const cost of ['normal','stress']){
  const selection=selectHistory(model,{variant:variant.id,mode,cost}),all=[];
  for(const month of selection.months){const cells=historyCells(month);assert.equal(cells.length%7,0);for(const [i,d]of cells.entries())if(d.day){assert.equal((new Date(d.day+'T00:00:00Z').getUTCDay()+6)%7,i%7);all.push(d);}}
  assert.equal(all.length,92);assert.equal(all.filter(d=>d.state==='weekend').length,26);assert.deepEqual(all.filter(d=>d.state==='not-studied').map(d=>d.day),['2026-06-19','2026-07-03']);
  assert.ok(all.filter(d=>d.state==='no-trade').every(d=>d.net===0&&d.trades===0));assert.ok(all.filter(d=>d.state.startsWith('stopped-')).every(d=>d.net===null&&d.trades===null&&d.cumulative===null));
 }
 const stop=selectHistory(models.get('37'),{variant:'fixed500',day:'2026-06-29'});assert.equal(historyDay(stop).state,'stopped-profitTargetMet');assert.equal(historyDay(stop).net,null);
 const back=selectHistory(models.get('38'),{day:stop.day});assert.equal(historyDay(back).state,'no-trade');assert.equal(historyDay(back).net,0);
 const fallback=selectHistory(models.get('33'),{variant:'fixed500',mode:'funded',cost:'bad',day:'2026-06-31'});assert.equal(fallback.variant,'50k-reduced100');assert.equal(fallback.mode,'evaluation');assert.equal(fallback.day,'2026-06-01');
});

class Element{
 constructor(tag='div'){this.tagName=tag;this.value='';this.textContent='';this.children=[];this.listeners={};this.attributes={};this.hidden=false;this.disabled=false;}
 append(n){this.children.push(n);}replaceChildren(...v){this.children=v;}addEventListener(k,f){this.listeners[k]=f;}setAttribute(k,v){this.attributes[k]=v;}
 focus(){this.focused=true;}
}
async function fixture(options={}){
 const html=(await read('trading/lab/index.html')).toString(),ids=[...html.matchAll(/id="(historyCalendar[^"]*)"/g)].map(m=>m[1]),elements=new Map(ids.map(id=>[id,new Element()]));
 const el=id=>{assert.ok(elements.has(id),id);return elements.get(id);},data=new Map();
 const storage=options.storage??{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 const controller=await initHistoryCalendar({document:{getElementById:el,createElement:t=>new Element(t)},fetch:fetcher,storage,manifest,...options});
 const tiles=()=>el('historyCalendarCalendars').children.flatMap(card=>card.children[3].children[1].children).filter(d=>d.attributes['data-day']);
 return {el,tiles,controller,storage};
}

test('all 56 selectable histories render their own three calendars, retain selected dates and persist only display choices',async()=>{
 const {el,tiles,controller,storage}=await fixture();assert.equal(el('historyCalendarResults').hidden,false);
 tiles().find(t=>t.attributes['data-day']==='2026-07-14').listeners.click();let combinations=0;
 for(const g of manifest.games){
  el('historyCalendarGameSelect').value=g.id;await el('historyCalendarGameSelect').listeners.change();assert.equal(controller.getSelection().day,'2026-07-14');
  const model=models.get(g.id);
  for(const variant of model.variants)for(const mode of model.modes)for(const cost of ['normal','stress']){
   combinations++;el('historyCalendarVariant').value=variant.id;el('historyCalendarMode').value=mode;el('historyCalendarCost').value=cost;el('historyCalendarCost').listeners.change();
   const selection=controller.getSelection(),d=historyDay(selection);assert.equal(selection.game,g.id);assert.equal(selection.day,'2026-07-14');assert.equal(el('historyCalendarCalendars').children.length,3);assert.equal(tiles().length,92);
   assert.ok(el('historyCalendarSelection').textContent.includes(g.label));assert.ok(el('historyCalendarDaySummary').textContent.includes(money(d.net)));
   for(const [i,m]of selection.months.entries())assert.equal(el('historyCalendarCalendars').children[i].children[1].textContent,money(m.result.net));
   assert.equal(el('historyCalendarDayTable').hidden,!Array.isArray(d.markets));assert.equal(el('historyCalendarDayMarkets').children.length,d.markets?.length??0);
   assert.equal(el('historyCalendarWeeks').children.length,selection.months.reduce((n,m)=>n+m.result.calendar.weeks.length,0));
  }
 }
 assert.equal(combinations,56);
 await controller.chooseGame('37',{variant:'fixed500',day:'2026-06-29'});assert.equal(el('historyCalendarDayTable').hidden,true);assert.ok(el('historyCalendarDayTitle').textContent.includes('Arrêt'));
 await controller.chooseGame('38',{day:'2026-06-29'});assert.ok(el('historyCalendarDayTitle').textContent.includes('Sans trade'));assert.ok(el('historyCalendarDaySummary').textContent.includes(money(0)));
 tiles().find(t=>t.attributes['data-day']==='2026-06-19').listeners.click();assert.ok(el('historyCalendarDayTitle').textContent.includes('Non étudié'));assert.equal(el('historyCalendarDayTable').hidden,true);
 const persisted=JSON.parse(storage.getItem(HISTORY_STORAGE_KEY));assert.deepEqual(Object.keys(persisted).sort(),['cost','day','game','mode','variant','version']);assert.equal(persisted.day,'2026-06-19');
 const restored=await fixture({storage});assert.equal(restored.controller.getSelection().day,'2026-06-19');assert.equal(restored.controller.getSelection().game,'38');
 const blocked={getItem(){throw Error('Blocked');},setItem(){throw Error('Blocked');}};assert.deepEqual(readHistoryPreferences(blocked),{});assert.doesNotThrow(()=>saveHistoryPreferences(blocked,persisted));
});

test('failed or stale report loads never reuse another game, retry verifies bytes and out-of-order responses are ignored',async()=>{
 const game=manifest.games.find(g=>g.id==='37');let calls=0,valid=false;
 const loader=createHistoryLoader(async()=>{calls++;return new Response(valid?raw.get('37'):'<html>Login</html>');});
 await assert.rejects(()=>loader(game));valid=true;assert.equal((await loader(game)).game.id,'37');await loader(game);assert.equal(calls,2);
 let fail=true;const one=await fixture({loadReport:async g=>{if(g.id==='38'&&fail)throw Error('Unavailable');return models.get(g.id);}});
 assert.equal(one.el('historyCalendarResults').hidden,true);assert.equal(one.el('historyCalendarCalendars').children.length,0);assert.ok(one.el('historyCalendarMessage').textContent.includes('indisponible'));
 fail=false;await one.el('historyCalendarRetry').listeners.click();assert.equal(one.el('historyCalendarResults').hidden,false);
 let release;const delayed=new Promise(resolve=>{release=resolve;}),two=await fixture({loadReport:g=>g.id==='33'?delayed:Promise.resolve(models.get(g.id))});
 const slow=two.controller.chooseGame('33',{day:'2026-07-14'});assert.equal(two.el('historyCalendarResults').hidden,true);await two.controller.chooseGame('37',{variant:'fixed500',day:'2026-06-29'});
 release(models.get('33'));await slow;assert.equal(two.controller.getSelection().game,'37');assert.equal(two.el('historyCalendarGameSelect').value,'37');assert.ok(two.el('historyCalendarDayTitle').textContent.includes('Arrêt'));
});
