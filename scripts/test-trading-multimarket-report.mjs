import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { verifyMultimarketReport } from '../trading/lab/jeu19-report-validation.mjs';
const raws=new Map(await Promise.all([19,20].map(async game=>[game,await readFile(new URL(`../trading/lab/jeu${game}-report.json`,import.meta.url))])));
test('both pinned reports retain failed experiments and frozen protocols',async()=>{
  for(const game of [19,20]){
    const raw=raws.get(game),r=await verifyMultimarketReport(raw,game);
    assert.equal(r.confirmed,false);
    const damaged=Buffer.from(raw);damaged[damaged.indexOf('diagnostic')]=88;
    await assert.rejects(verifyMultimarketReport(damaged,game),/fingerprint/);
    await assert.rejects(verifyMultimarketReport(raw.subarray(1),game),/Unverifiable/);
    const freeze=JSON.parse(await readFile(new URL(`../trading/lab/jeu${game}-freeze.json`,import.meta.url)));
    for(const [path,sha] of Object.entries(freeze.files))assert.equal(createHash('sha256').update(await readFile(new URL('../'+path,import.meta.url))).digest('hex'),sha,path);
    const check=v=>{if(!v||typeof v!=='object')return;for(const [key,value] of Object.entries(v)){assert.ok(!['entry','exit','signalOpen','signalClose','trendClosedAt','open','high','low','close'].includes(key),'Raw prices or trades must remain private');if(key==='trades')assert.equal(typeof value,'number');check(value);}};check(r);
  }
  const held=await verifyMultimarketReport(raws.get(20),20);
  assert.equal(held.results[0].researchPassed,true);assert.equal(held.holdout.result.researchPassed,false);
  assert.equal(held.holdout.result.diagnostic.normal.net,-424.5);
  assert.equal(held.holdout.result.windows[1].diagnostic.normal.net,-558.5);
});
class Element{
  constructor(){this.textContent='';this.value='';this.children=[];this.listeners={};}
  append(n){this.children.push(n);}replaceChildren(...ns){this.children=ns;}addEventListener(name,f){this.listeners[name]=f;}
}
test('four cost views show exact results; corrupt loads hide both result panels',async()=>{
  const html=await readFile(new URL('../trading/lab/index.html',import.meta.url),'utf8'),ids=[...html.matchAll(/id="((?:multi|native)[^"]*)"/g)].map(m=>m[1]);
  const original={document:globalThis.document,fetch:globalThis.fetch};
  try{for(const mode of ['valid','invalid']){
    const elements=new Map(ids.map(id=>[id,new Element()])),done=[Promise.withResolvers(),Promise.withResolvers()],el=id=>elements.get(id);
    for(const [i,prefix] of ['multi','native'].entries()){
      Object.defineProperty(el(prefix+'Results'),'hidden',{set(v){this.isHidden=v;done[i].resolve();}});el(prefix+'Costs').value='normal';
    }
    globalThis.document={getElementById(id){assert.ok(elements.has(id),'Missing '+id);return el(id);},createElement(){return new Element();}};
    globalThis.fetch=async url=>new Response(mode==='valid'?raws.get(url.includes('19')?19:20):Buffer.from('<html>Login</html>'),{headers:{'Content-Type':'application/json'}});
    await import(`../trading/lab/lab-multimarket.mjs?fixture=${mode}`);await Promise.all(done.map(d=>d.promise));
    if(mode==='invalid'){for(const prefix of ['multi','native']){assert.equal(el(prefix+'Results').isHidden,true);assert.equal(el(prefix+'Status').textContent,'Bilan indisponible');}continue;}
    for(const [cost,net,count] of [['normal','-424,50 $',91],['stress','-340,50 $',57]]){
      for(const prefix of ['multi','native']){el(prefix+'Costs').value=cost;el(prefix+'Costs').listeners.change();}
      assert.equal(el('nativeNet').textContent,net);assert.equal(el('nativeTrades').textContent,`${count} trades`);
      assert.equal(el('nativeComparison').children.length,2);assert.equal(el('nativeWindows').children.length,4);assert.equal(el('nativeChecks').children.length,8);assert.equal(el('multiComparison').children.length,8);
      assert.equal(el('nativeStatus').textContent,'Échec sur la réserve');
    }
  }}finally{globalThis.document=original.document;globalThis.fetch=original.fetch;}
});
