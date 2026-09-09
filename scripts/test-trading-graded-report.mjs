import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyGradedReport} from '../trading/lab/jeu25-report-validation.mjs';
const raw=await readFile(new URL('../trading/lab/jeu25-report.json',import.meta.url));
test('the graded report retains four failures, frozen sources and reconciled risk tiers without private executions',async()=>{
  const r=await verifyGradedReport(raw),freeze=JSON.parse(await readFile(new URL('../trading/lab/jeu25-freeze.json',import.meta.url)));
  assert.equal(r.results.length,4);assert.equal(r.selection.id,null);assert.equal(r.holdout.status,'not-opened');
  for(const [path,sha]of Object.entries(freeze.files))assert.equal(createHash('sha256').update(await readFile(new URL('../'+path,import.meta.url))).digest('hex'),sha,path);
  const damaged=Buffer.from(raw);damaged[damaged.indexOf('diagnostic')]=88;await assert.rejects(verifyGradedReport(damaged),/fingerprint/);
  const check=v=>{if(!v||typeof v!=='object')return;for(const [key,value]of Object.entries(v)){assert.ok(!['entry','exit','signalOpen','signalClose','trendClosedAt','open','high','low','close','sourceTime','closedAt','fast','slow','rsi','patterns','decisions'].includes(key),'Raw data must stay private');if(key==='trades')assert.equal(typeof value,'number');check(value);}};check(r);
  const ledger=JSON.parse(await readFile(new URL('../trading/lab/research-ledger.json',import.meta.url))),entries=ledger.entries.filter(x=>x.game===25);
  assert.equal(entries.length,4);assert.deepEqual(entries.map(x=>x.id),r.results.map(x=>x.id));assert.ok(entries.every(x=>x.freezeSha256===r.freezeSha256&&!x.developmentPassed&&!x.confirmed));
});
class Element{constructor(){this.textContent='';this.value='';this.children=[];this.listeners={};}append(n){this.children.push(n);}replaceChildren(...ns){this.children=ns;}addEventListener(name,f){this.listeners[name]=f;}}
test('cost views show exact graduated totals, archived comparisons and actual planned risk instead of multiplying repeated gains',async()=>{
  const html=await readFile(new URL('../trading/lab/index.html',import.meta.url),'utf8'),ids=[...html.matchAll(/id="(graded[^"]*)"/g)].map(m=>m[1]);
  const original={document:globalThis.document,fetch:globalThis.fetch};
  try{for(const mode of ['valid','invalid']){
    const elements=new Map(ids.map(id=>[id,new Element()])),done=Promise.withResolvers(),el=id=>elements.get('graded'+id);
    Object.defineProperty(el('Results'),'hidden',{set(v){this.isHidden=v;done.resolve();}});el('Costs').value='normal';
    globalThis.document={getElementById(id){assert.ok(elements.has(id),'Missing '+id);return elements.get(id);},createElement(){return new Element();}};
    globalThis.fetch=async()=>new Response(mode==='valid'?raw:Buffer.from('<html>Login</html>'),{headers:{'Content-Type':'application/json'}});
    await import(`../trading/lab/lab-graded-risk.mjs?fixture=${mode}`);await done.promise;
    if(mode==='invalid'){assert.equal(el('Results').isHidden,true);assert.equal(el('Status').textContent,'Bilan indisponible');continue;}
    const r=JSON.parse(raw),money=n=>(n>0?'+':'')+new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)+' $';
    for(const cost of ['normal','stress']){
      el('Costs').value=cost;el('Costs').listeners.change();
      for(const name of ['Comparison','Changes','Checks','Activity'])assert.equal(el(name).children.length,4);assert.equal(el('Windows').children.length,8);assert.equal(el('Tiers').children.length,12);
      for(const [i,x]of r.results.entries()){
        const d=x.diagnostic[cost],tr=el('Comparison').children[i].children;
        assert.equal(tr[1].textContent,String(d.trades));assert.equal(tr[2].textContent,money(d.net));assert.equal(tr[3].textContent,money(d.referenceComparison.oldNet));assert.equal(tr[4].textContent,money(d.strictComparison.oldNet));
        for(const [j,t]of d.tiers.entries()){
          const row=el('Tiers').children[i*3+j].children;
          assert.equal(row[1].textContent,`${t.cap} $`);assert.equal(row[3].textContent,String(t.trades));assert.equal(row[4].textContent,money(t.net));assert.equal(row[5].textContent,t.averagePlannedRisk===null?'—':money(t.averagePlannedRisk));
        }
      }
      assert.equal(el('Status').textContent,'Aucune candidate validée');
    }
    assert.match(html,/même trade comparé quatre fois, pas à quatre gains distincts/);
  }}finally{globalThis.document=original.document;globalThis.fetch=original.fetch;}
});
