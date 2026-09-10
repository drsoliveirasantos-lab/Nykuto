import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { verifyContinuationReport } from '../trading/lab/jeu21-22-report-validation.mjs';
const raws=new Map(await Promise.all([21,22].map(async game=>[game,await readFile(new URL(`../trading/lab/jeu${game}-report.json`,import.meta.url))])));
test('new reports preserve all eight failed configurations and their frozen protocols',async()=>{
  for(const game of [21,22]){
    const raw=raws.get(game),r=await verifyContinuationReport(raw,game);
    assert.equal(r.confirmed,false);
    const damaged=Buffer.from(raw);damaged[damaged.indexOf('diagnostic')]=88;
    await assert.rejects(verifyContinuationReport(damaged,game),/fingerprint/);
    await assert.rejects(verifyContinuationReport(raw.subarray(1),game),/Unverifiable/);
    const freeze=JSON.parse(await readFile(new URL(`../trading/lab/jeu${game}-freeze.json`,import.meta.url)));
    for(const [path,sha] of Object.entries(freeze.files))assert.equal(createHash('sha256').update(await readFile(new URL('../'+path,import.meta.url))).digest('hex'),sha,path);
    const check=v=>{if(!v||typeof v!=='object')return;for(const [key,value] of Object.entries(v)){assert.ok(!['entry','exit','signalOpen','signalClose','trendClosedAt','open','high','low','close'].includes(key),'Raw prices or trades must remain private');if(key==='trades')assert.equal(typeof value,'number');check(value);}};check(r);
  }
  const ledger=JSON.parse(await readFile(new URL('../trading/lab/research-ledger.json',import.meta.url)));
  assert.equal(ledger.configurationCount,92);assert.equal(ledger.entries.length,92);assert.equal(ledger.independentConfirmations,0);assert.equal(new Set(ledger.entries.map(x=>x.executionKey)).size,92);
  assert.equal(ledger.entries.filter(x=>x.game<39).length,90);
  assert.deepEqual(ledger.entries.filter(x=>x.game===39).map(x=>x.configuration),['mnq-before-11/funded','mnq-kronos/funded']);
  assert.equal(ledger.entries.find(x=>x.game===20).holdoutPassed,false);
  assert.ok(ledger.entries.filter(x=>x.game>=21).every(x=>x.developmentPassed===false&&x.holdoutStatus==='not-opened'));

});
class Element{
  constructor(){this.textContent='';this.value='';this.children=[];this.listeners={};}
  append(n){this.children.push(n);}replaceChildren(...ns){this.children=ns;}addEventListener(name,f){this.listeners[name]=f;}
}
test('new cost views retain positive and negative totals and hide unverifiable reports',async()=>{
  const html=await readFile(new URL('../trading/lab/index.html',import.meta.url),'utf8'),ids=[...html.matchAll(/id="((?:expanded|opening)[^"]*)"/g)].map(m=>m[1]);
  const original={document:globalThis.document,fetch:globalThis.fetch};
  try{for(const mode of ['valid','invalid']){
    const elements=new Map(ids.map(id=>[id,new Element()])),done=[Promise.withResolvers(),Promise.withResolvers()],el=id=>elements.get(id);
    for(const [i,prefix] of ['expanded','opening'].entries()){
      Object.defineProperty(el(prefix+'Results'),'hidden',{set(v){this.isHidden=v;done[i].resolve();}});el(prefix+'Costs').value='normal';
    }
    globalThis.document={getElementById(id){assert.ok(elements.has(id),'Missing '+id);return el(id);},createElement(){return new Element();}};
    globalThis.fetch=async url=>new Response(mode==='valid'?raws.get(url.includes('21')?21:22):Buffer.from('<html>Login</html>'),{headers:{'Content-Type':'application/json'}});
    await import(`../trading/lab/lab-research-continuation.mjs?fixture=${mode}`);await Promise.all(done.map(d=>d.promise));
    if(mode==='invalid'){for(const prefix of ['expanded','opening']){assert.equal(el(prefix+'Results').isHidden,true);assert.equal(el(prefix+'Status').textContent,'Bilan indisponible');}continue;}
    for(const cost of ['normal','stress']){
      for(const [game,prefix]of [[21,'expanded'],[22,'opening']]){
        el(prefix+'Costs').value=cost;el(prefix+'Costs').listeners.change();
        assert.equal(el(prefix+'Comparison').children.length,4);assert.equal(el(prefix+'Windows').children.length,8);assert.equal(el(prefix+'Checks').children.length,4);assert.equal(el(prefix+'Activity').children.length,4);
        const report=JSON.parse(raws.get(game));
        for(const [i,r]of report.results.entries()){
          const d=r.diagnostic[cost],money=(d.net>0?'+':'')+new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(d.net)+' $';
          assert.equal(el(prefix+'Comparison').children[i].children[2].textContent,String(d.trades));assert.equal(el(prefix+'Comparison').children[i].children[3].textContent,money);
        }
        assert.equal(el(prefix+'Status').textContent,'Aucune candidate validée');
      }
    }
  }}finally{globalThis.document=original.document;globalThis.fetch=original.fetch;}
});
