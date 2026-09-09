import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import{createHash}from'node:crypto';
import{verifySummerTrend}from'../trading/lab/jeu32-report-validation.mjs';
const raw=await readFile(new URL('../trading/lab/jeu32-report.json',import.meta.url)),report=JSON.parse(raw);
test('80 summer replays reconcile with frozen causal engine, protected ledger and weekly outcomes',async()=>{
 const r=await verifySummerTrend(raw),freeze=JSON.parse(await readFile(new URL('../trading/lab/jeu32-freeze.json',import.meta.url)));
 for(const[path,sha]of Object.entries(freeze.files))assert.equal(createHash('sha256').update(await readFile(new URL('../'+path,import.meta.url))).digest('hex'),sha,path);
 const ledger=JSON.parse(await readFile(new URL('../trading/lab/research-ledger.json',import.meta.url)));
 assert.equal(ledger.entries.length,74);assert.equal(ledger.configurationCount,74);assert.equal(new Set(ledger.entries.map(x=>x.executionKey)).size,74);
 assert.equal(ledger.entries.filter(x=>x.game<=31).length,70);assert.equal(createHash('sha256').update(JSON.stringify(ledger.entries.slice(0,70))).digest('hex'),'e5d17d338a8f2bf9a74ded6a2d87225cc6e90e340c53bb8e989adcf1f89c7fa5');assert.ok(ledger.entries.filter(x=>x.game===32).every(x=>!x.confirmed&&!x.selected&&!x.executionAllowed));
 const archive=JSON.parse(await readFile(new URL('../trading/lab/jeu32-archive.json',import.meta.url)));assert.equal(archive.files.find(f=>f.name==='report.json').sha256,createHash('sha256').update(raw).digest('hex'));
 assert.deepEqual(r.audit,{oldAugustReplays:16,alignmentPrefixes:169,rsiPrefixes:34,replayPrefixes:2514,executedRecords:1544,passed:true});
 const view=(id,mode)=>r.views.find(v=>v.id===id&&v.mode===mode),cost=(id,mode,a)=>view(id,mode).variants.find(v=>v.id===a).costs.normal;
 assert.equal(cost('august','diagnostic','aligned-500').net,-3222);assert.equal(cost('august','account','aligned-500').net,-785);
 assert.equal(cost('summer','account','aligned-500').net,223.5);assert.equal(cost('summer','account','aligned-500').weeklyObjective.targetWeeks,0);
 assert.equal(cost('summer','diagnostic','aligned-500').weeklyObjective.targetWeeks,1);assert.equal(cost('summer','diagnostic','aligned-500').weeklyObjective.evaluableFullWeeks,13);
 const stopped=cost('summer','account','rr2-150');assert.equal(stopped.terminalDay,'2026-07-29');assert.equal(stopped.net,1503);assert.equal(stopped.weeklyObjective.evaluableFullWeeks,8);
 assert.ok(stopped.weeklyObjective.weeks.some(w=>!w.complete&&w.targetMet===null));
 const walk=x=>{if(!x||typeof x!=='object')return;for(const[k,v]of Object.entries(x)){assert.ok(!['entryTime','exitTime','entry','exit','open','high','low','close','candles','decisions','ticker','signalOpen','signalClose'].includes(k),'Private detail '+k);if(k==='trades')assert.ok(v===null||typeof v==='number');walk(v);}};walk(r);
 const damaged=Buffer.from(raw);damaged[damaged.indexOf('schema')]=88;await assert.rejects(verifySummerTrend(damaged),/fingerprint/);await assert.rejects(verifySummerTrend(raw.subarray(1)),/Unverifiable/);
});
const html=await readFile(new URL('../trading/lab/index.html',import.meta.url),'utf8'),ids=[...html.matchAll(/id="(trend32[^"]*)"/g)].map(m=>m[1]);
class Element{constructor(){this.value='';this.textContent='';this.children=[];this.listeners={};}append(x){this.children.push(x);}replaceChildren(...x){this.children=x;}addEventListener(k,v){this.listeners[k]=v;}}
const money=n=>n===null?'—':`${n>0?'+':''}${new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)} $`;
async function fixture(key,fn){const original={document:globalThis.document,fetch:globalThis.fetch},elements=new Map(ids.map(id=>[id,new Element()])),ready=Promise.withResolvers(),el=id=>elements.get('trend32'+id);
 try{el('View').value='summer/account';el('Variant').value='aligned-500';el('Costs').value='normal';Object.defineProperty(el('Retry'),'disabled',{set(v){if(!v)ready.resolve();}});
 globalThis.document={getElementById(id){assert.ok(elements.has(id),id);return elements.get(id);},createElement(){return new Element();}};
 globalThis.fetch=async url=>{assert.equal(url,'./jeu32-report.json');return new Response(raw,{headers:{'Content-Type':'application/json'}});};
 await import('../trading/lab/lab-summer-trend.mjs?test='+key);await ready.promise;await fn(el);
 }finally{globalThis.document=original.document;globalThis.fetch=original.fetch;}}
test('all 80 UI selections render exact day, week, market and attribution results',async()=>fixture('all',async el=>{
 let n=0;for(const view of report.views)for(const variant of view.variants)for(const cost of ['normal','stress']){
 el('View').value=view.id+'/'+view.mode;el('Variant').value=variant.id;el('Costs').value=cost;el('View').listeners.change();const x=variant.costs[cost];n++;
 assert.equal(el('Results').hidden,false);assert.ok(el('Summary').textContent.includes(money(x.net)));assert.equal(el('Overview').children.length,5);assert.equal(el('Study').children.length,12);assert.equal(el('Markets').children.length,4);
 assert.equal(el('Days').children.length,x.calendar.daily.length);assert.equal(el('Weeks').children.length,x.weeklyObjective.weeks.length);
 for(const[i,d]of x.calendar.daily.entries())assert.equal(el('Days').children[i].children[2].textContent,money(d.net));
 for(const[i,w]of x.weeklyObjective.weeks.entries()){const row=el('Weeks').children[i];assert.equal(row.children[3].textContent,money(w.net));assert.equal(row.children[5].textContent,!w.complete?'Non évaluable':w.partialBoundary?'Semaine partielle':w.targetMet?'Atteint':'Non atteint');}
 const c=x.alignmentComparison??x.comparison;assert.equal(el('Changes').children[0].children[2].textContent,String(c.removed.wins));
 }assert.equal(n,80);assert.match(el('Status').textContent,/non qualifié/);
}));
test('failed summer refresh clears stale conclusions; recovery retains selected month, risk and costs',async()=>fixture('recovery',async el=>{
 el('View').value='august/diagnostic';el('Variant').value='aligned-150';el('Costs').value='stress';el('Costs').listeners.change();
 globalThis.fetch=async()=>new Response('invalid',{headers:{'Content-Type':'application/json'}});await el('Retry').listeners.click();assert.equal(el('Results').hidden,true);assert.equal(el('Summary').textContent,'');assert.equal(el('Risk').textContent,'');assert.equal(el('Variant').disabled,true);
 for(const id of ['Overview','Markets','Changes','Days','Weeks','Study','Refusals'])assert.equal(el(id).children.length,0);
 globalThis.fetch=async()=>new Response(raw,{headers:{'Content-Type':'application/json'}});await el('Retry').listeners.click();
 assert.equal(el('View').value,'august/diagnostic');assert.equal(el('Variant').value,'aligned-150');assert.equal(el('Costs').value,'stress');assert.ok(el('Summary').textContent.includes(money(-864)));
}));
