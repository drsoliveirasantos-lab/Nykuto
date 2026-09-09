import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyReentryReport} from '../trading/lab/jeu27-report-validation.mjs';
const raw=await readFile(new URL('../trading/lab/jeu27-report.json',import.meta.url));
test('the reentry report retains four rejected configurations, frozen sources and reconciled repeats without private executions',async()=>{
  const r=await verifyReentryReport(raw),freeze=JSON.parse(await readFile(new URL('../trading/lab/jeu27-freeze.json',import.meta.url)));
  assert.equal(r.results.length,4);assert.equal(r.selection.id,null);assert.equal(r.holdout.status,'not-opened');
  for(const [path,sha]of Object.entries(freeze.files))assert.equal(createHash('sha256').update(await readFile(new URL('../'+path,import.meta.url))).digest('hex'),sha,path);
  const damaged=Buffer.from(raw);damaged[damaged.indexOf('diagnostic')]=88;await assert.rejects(verifyReentryReport(damaged),/fingerprint/);
  const check=v=>{if(!v||typeof v!=='object')return;for(const [key,value]of Object.entries(v)){assert.ok(!['entry','exit','signalOpen','signalClose','trendClosedAt','open','high','low','close','sourceTime','closedAt','fast','slow','rsi','patterns','decisions'].includes(key),'Raw data must stay private');if(key==='trades')assert.equal(typeof value,'number');check(value);}};check(r);
  const ledger=JSON.parse(await readFile(new URL('../trading/lab/research-ledger.json',import.meta.url))),entries=ledger.entries.filter(x=>x.game===27);
  assert.equal(entries.length,4);assert.deepEqual(entries.map(x=>x.id),r.results.map(x=>x.id));assert.ok(entries.every(x=>x.freezeSha256===r.freezeSha256&&!x.developmentPassed&&!x.confirmed));
});
class Element{constructor(){this.textContent='';this.value='';this.children=[];this.listeners={};}append(n){this.children.push(n);}replaceChildren(...ns){this.children=ns;}addEventListener(name,f){this.listeners[name]=f;}}
test('cost views show fresh-reentry totals, archived comparisons and observed daily activity',async()=>{
  const html=await readFile(new URL('../trading/lab/index.html',import.meta.url),'utf8'),ids=[...html.matchAll(/id="(reentry[^"]*)"/g)].map(m=>m[1]);
  const original={document:globalThis.document,fetch:globalThis.fetch};
  try{for(const mode of ['valid','invalid']){
    const elements=new Map(ids.map(id=>[id,new Element()])),done=Promise.withResolvers(),el=id=>elements.get('reentry'+id);
    Object.defineProperty(el('Results'),'hidden',{set(v){this.isHidden=v;done.resolve();}});el('Costs').value='normal';
    globalThis.document={getElementById(id){assert.ok(elements.has(id),'Missing '+id);return elements.get(id);},createElement(){return new Element();}};
    globalThis.fetch=async()=>new Response(mode==='valid'?raw:Buffer.from('<html>Login</html>'),{headers:{'Content-Type':'application/json'}});
    await import(`../trading/lab/lab-fresh-reentry.mjs?fixture=${mode}`);await done.promise;
    if(mode==='invalid'){assert.equal(el('Results').isHidden,true);assert.equal(el('Status').textContent,'Bilan indisponible');continue;}
    const r=JSON.parse(raw),money=n=>(n>0?'+':'')+new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)+' $';
    for(const cost of ['normal','stress']){
      el('Costs').value=cost;el('Costs').listeners.change();
      for(const name of ['Comparison','Changes','Checks','Activity'])assert.equal(el(name).children.length,4);assert.equal(el('Windows').children.length,8);
      for(const [i,x]of r.results.entries()){
        const d=x.diagnostic[cost],tr=el('Comparison').children[i].children;
        assert.equal(tr[1].textContent,String(d.trades));assert.equal(tr[2].textContent,money(d.net));assert.equal(tr[4].textContent,money(d.referenceComparison.oldNet));assert.equal(tr[5].textContent,money(d.drawdown));
        assert.equal(tr[3].textContent,new Intl.NumberFormat('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1}).format(d.metrics.win*100)+' %');
        const day=el('Activity').children[i].children;assert.equal(day[1].textContent,String(d.daily.observed));assert.equal(day[2].textContent,String(d.daily.positive));assert.equal(day[6].textContent,money(d.dailyMean));

      }
      assert.equal(el('Status').textContent,'Aucune candidate validée');
    }
    assert.match(html,/Maximum deux trades par jour/);
  }}finally{globalThis.document=original.document;globalThis.fetch=original.fetch;}
});
