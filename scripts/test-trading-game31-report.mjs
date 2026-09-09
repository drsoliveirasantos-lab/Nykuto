import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyMarketFilters} from '../trading/lab/jeu31-report-validation.mjs';
const raw=await readFile(new URL('../trading/lab/jeu31-report.json',import.meta.url)),report=JSON.parse(raw);
test('40 frozen market-filter replays reconcile, preserve 67 prior trials and reveal the failed profitability criterion',async()=>{
  const r=await verifyMarketFilters(raw),freeze=JSON.parse(await readFile(new URL('../trading/lab/jeu31-freeze.json',import.meta.url)));
  for(const [path,sha]of Object.entries(freeze.files))assert.equal(createHash('sha256').update(await readFile(new URL('../'+path,import.meta.url))).digest('hex'),sha,path);
  const ledger=JSON.parse(await readFile(new URL('../trading/lab/research-ledger.json',import.meta.url)));
  assert.equal(ledger.configurationCount,70);assert.equal(ledger.entries.length,70);assert.equal(ledger.entries.filter(x=>x.game<=30).length,67);
  assert.equal(ledger.entries.filter(x=>x.game===31).length,3);assert.equal(new Set(ledger.entries.map(x=>x.executionKey)).size,70);
  assert.ok(ledger.entries.filter(x=>x.game===31).every(x=>!x.selected&&!x.confirmed&&!x.executionAllowed));
  assert.deepEqual(r.audit,{baselineRuns:10,rsiPrefixes:49,replayPrefixes:1616,executedTrades:1658,passed:true});
  assert.ok(r.evaluations.every(x=>!x.diagnosticImprovementPassed&&!x.checks.find(c=>c.id==='positive-windows').pass));
  const aug=r.views.find(v=>v.id==='august'&&v.mode==='account'),combined=aug.variants.find(v=>v.id==='combined');
  assert.equal(combined.costs.normal.net,-235.5);assert.equal(combined.costs.normal.drawdown,593);assert.equal(combined.costs.stress.net,-622);
  assert.equal(combined.costs.normal.comparison.removed.wins,1);assert.equal(combined.costs.normal.comparison.removed.losses,5);
  const inspect=x=>{if(!x||typeof x!=='object')return;for(const[k,v]of Object.entries(x)){
    assert.ok(!['entryTime','exitTime','entry','exit','open','high','low','close','candles','decisions','ticker','signalOpen','signalClose'].includes(k),'Private detail '+k);
    if(k==='trades')assert.ok(v===null||typeof v==='number');inspect(v);
  }};inspect(r);
  const damaged=Buffer.from(raw);damaged[damaged.indexOf('schema')]=88;
  await assert.rejects(verifyMarketFilters(damaged),/fingerprint/);await assert.rejects(verifyMarketFilters(raw.subarray(1)),/Unverifiable/);
});
const html=await readFile(new URL('../trading/lab/index.html',import.meta.url),'utf8'),ids=[...html.matchAll(/id="(filters[^"]*)"/g)].map(m=>m[1]);
class Element{constructor(){this.value='';this.textContent='';this.children=[];this.listeners={};}append(x){this.children.push(x);}replaceChildren(...x){this.children=x;}addEventListener(k,v){this.listeners[k]=v;}}
const money=n=>n===null?'—':`${n>0?'+':''}${new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)} $`;
async function fixture(key,fn){
 const original={document:globalThis.document,fetch:globalThis.fetch},elements=new Map(ids.map(id=>[id,new Element()])),ready=Promise.withResolvers(),el=id=>elements.get('filters'+id);
 try{
  el('View').value='august/account';el('Variant').value='combined';el('Costs').value='normal';
  Object.defineProperty(el('Retry'),'disabled',{set(v){if(!v)ready.resolve();}});
  globalThis.document={getElementById(id){assert.ok(elements.has(id),id);return elements.get(id);},createElement(){return new Element();}};
  globalThis.fetch=async url=>{assert.equal(url,'./jeu31-report.json');return new Response(raw,{headers:{'Content-Type':'application/json'}});};
  await import('../trading/lab/lab-market-filters.mjs?test='+key);await ready.promise;await fn(el);
 }finally{globalThis.document=original.document;globalThis.fetch=original.fetch;}
}
test('all 40 UI choices render exact daily, weekly, market and removed-winner results',async()=>fixture('all',async el=>{
 let n=0;for(const view of report.views)for(const variant of view.variants)for(const cost of ['normal','stress']){
  el('View').value=view.id+'/'+view.mode;el('Variant').value=variant.id;el('Costs').value=cost;el('View').listeners.change();const x=variant.costs[cost];n++;
  assert.equal(el('Results').hidden,false);assert.ok(el('Summary').textContent.includes(money(x.net)));assert.equal(el('Overview').children.length,4);
  assert.equal(el('Markets').children.length,4);assert.equal(el('Changes').children[0].children[2].textContent,String(x.comparison.removed.wins));
  assert.equal(el('Changes').children[0].children[3].textContent,String(x.comparison.removed.losses));
  assert.equal(el('Days').children.length,x.calendar.daily.length);assert.equal(el('Weeks').children.length,x.calendar.weeks.length);
  for(const[i,d]of x.calendar.daily.entries())assert.equal(el('Days').children[i].children[2].textContent,money(d.net));
  for(const[i,w]of x.calendar.weeks.entries())assert.equal(el('Weeks').children[i].children[3].textContent,money(w.net));
 }
 assert.equal(n,40);assert.match(el('Status').textContent,/non qualifié/);
}));
test('invalid refresh clears stale filter conclusions and calendars, recovery keeps all selected options',async()=>fixture('recovery',async el=>{
 el('View').value='mar-apr/diagnostic';el('Variant').value='mes-rsi';el('Costs').value='stress';el('Costs').listeners.change();
 globalThis.fetch=async()=>new Response('invalid',{headers:{'Content-Type':'application/json'}});await el('Retry').listeners.click();
 assert.equal(el('Results').hidden,true);assert.equal(el('Summary').textContent,'');assert.equal(el('Attribution').textContent,'');assert.equal(el('Variant').disabled,true);
 for(const id of ['Overview','Markets','Changes','Days','Weeks','Checks','Refusals'])assert.equal(el(id).children.length,0);
 globalThis.fetch=async()=>new Response(raw,{headers:{'Content-Type':'application/json'}});await el('Retry').listeners.click();
 assert.equal(el('View').value,'mar-apr/diagnostic');assert.equal(el('Variant').value,'mes-rsi');assert.equal(el('Costs').value,'stress');
 assert.equal(el('Results').hidden,false);assert.ok(el('Summary').textContent.includes(money(-27.25)));
}));
