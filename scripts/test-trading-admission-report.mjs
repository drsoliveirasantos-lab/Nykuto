import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyAdmissionReport} from '../trading/lab/jeu23-report-validation.mjs';
const raw=await readFile(new URL('../trading/lab/jeu23-report.json',import.meta.url));
test('the risk report retains all sixteen failures and matches its pre-performance freeze',async()=>{
  const r=await verifyAdmissionReport(raw),freeze=JSON.parse(await readFile(new URL('../trading/lab/jeu23-freeze.json',import.meta.url)));
  assert.equal(r.results.length,16);assert.equal(r.selection.id,null);assert.equal(r.holdout.status,'not-opened');
  for(const [path,sha]of Object.entries(freeze.files))assert.equal(createHash('sha256').update(await readFile(new URL('../'+path,import.meta.url))).digest('hex'),sha,path);
  const damaged=Buffer.from(raw);damaged[damaged.indexOf('diagnostic')]=88;await assert.rejects(verifyAdmissionReport(damaged),/fingerprint/);
  const check=v=>{if(!v||typeof v!=='object')return;for(const [key,value]of Object.entries(v)){assert.ok(!['entry','exit','signalOpen','signalClose','trendClosedAt','open','high','low','close'].includes(key),'Raw data must stay private');if(key==='trades')assert.equal(typeof value,'number');check(value);}};check(r);
  const ledger=JSON.parse(await readFile(new URL('../trading/lab/research-ledger.json',import.meta.url))),entries=ledger.entries.filter(x=>x.game===23);
  assert.equal(entries.length,16);assert.deepEqual(entries.map(x=>x.id),r.results.map(x=>x.id));assert.ok(entries.every(x=>x.freezeSha256===r.freezeSha256&&!x.developmentPassed&&!x.confirmed));
});
class Element{constructor(){this.textContent='';this.value='';this.children=[];this.listeners={};}append(n){this.children.push(n);}replaceChildren(...ns){this.children=ns;}addEventListener(name,f){this.listeners[name]=f;}}
test('both cost assumptions and all four risk details display the exact archived aggregates',async()=>{
  const html=await readFile(new URL('../trading/lab/index.html',import.meta.url),'utf8'),ids=[...html.matchAll(/id="(admission[^"]*)"/g)].map(m=>m[1]);
  const original={document:globalThis.document,fetch:globalThis.fetch};
  try{for(const mode of ['valid','invalid']){
    const elements=new Map(ids.map(id=>[id,new Element()])),done=Promise.withResolvers(),el=id=>elements.get('admission'+id);
    Object.defineProperty(el('Results'),'hidden',{set(v){this.isHidden=v;done.resolve();}});el('Costs').value='normal';el('Risk').value='50';
    globalThis.document={getElementById(id){assert.ok(elements.has(id),'Missing '+id);return elements.get(id);},createElement(){return new Element();}};
    globalThis.fetch=async()=>new Response(mode==='valid'?raw:Buffer.from('<html>Login</html>'),{headers:{'Content-Type':'application/json'}});
    await import(`../trading/lab/lab-admission-risk.mjs?fixture=${mode}`);await done.promise;
    if(mode==='invalid'){assert.equal(el('Results').isHidden,true);assert.equal(el('Status').textContent,'Bilan indisponible');continue;}
    const r=JSON.parse(raw),money=n=>(n>0?'+':'')+new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)+' $';
    for(const cost of ['normal','stress'])for(const risk of [50,75,100,150]){
      el('Costs').value=cost;el('Risk').value=String(risk);el('Costs').listeners.change();el('Risk').listeners.change();
      for(const name of ['Matrix','Comparison','Changes','Checks','Activity'])assert.equal(el(name).children.length,4);assert.equal(el('Windows').children.length,8);
      for(const [i,x]of r.results.filter(x=>x.riskPerTrade===risk).entries()){
        const d=x.diagnostic[cost],tr=el('Comparison').children[i].children;
        assert.equal(tr[1].textContent,String(d.trades));assert.equal(tr[2].textContent,money(d.net));assert.equal(tr[3].textContent,money(d.drawdown));
        for(const [j,cap]of [50,75,100,150].entries())assert.equal(el('Matrix').children[i].children[j+1].textContent,money(r.results.find(y=>y.symbol===x.symbol&&y.riskPerTrade===cap).diagnostic[cost].net));
        assert.equal(el('Changes').children[i].children[4].textContent,money(d.referenceComparison.deltaNet));
      }
      assert.equal(el('Status').textContent,'Aucune candidate validée');
    }
  }}finally{globalThis.document=original.document;globalThis.fetch=original.fetch;}
});
