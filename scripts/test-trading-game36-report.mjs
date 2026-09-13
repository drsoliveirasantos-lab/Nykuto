import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyEntryReport} from '../trading/lab/jeu36-report-validation.mjs';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root)),hash=b=>createHash('sha256').update(b).digest('hex'),cents=n=>Math.round(n*100)/100;
test('entry report preserves its freeze and reconciles delayed setups, monthly cashflows and exact controls',async()=>{
 const raw=await read('trading/lab/jeu36-report.json'),r=await verifyEntryReport(raw),frozen=await read('trading/lab/jeu36-freeze.json'),old=JSON.parse(await read('trading/lab/jeu35-report.json'));
 assert.equal(hash(frozen),r.freezeSha256);for(const [p,sha]of Object.entries(JSON.parse(frozen).files))assert.equal(hash(await read(p)),sha,p);
 assert.deepEqual(r.audit,{controlReplays:12,accountPrefixes:768,checkedTrades:472,passed:true});assert.equal(r.newConfigurations,4);assert.equal(r.newStrategyVariants,2);assert.ok(r.assessments.every(a=>a.favorable===false));
 for(const v of r.views)for(const [cost,c]of Object.entries(v.costs)){
  const b=old.views.find(x=>x.variant==='baseline'&&x.month===v.month&&x.mode===v.mode).costs[cost],d=c.comparison;
  assert.equal(cents(c.balance+c.withdrawnUSD-50000),c.net);assert.equal(cents(c.calendar.weeks.reduce((n,w)=>n+(w.net??0),0)),c.net);
  assert.equal(cents(c.contributions.reduce((n,m)=>n+m.net,0)),c.net);assert.equal(c.personalGoalAchieved,false);assert.equal(c.receiptEUR,0);
  assert.equal(cents(d.commonDelta-d.removed.net+d.added.net),d.delta);assert.equal(d.delta,cents(c.net-b.net));assert.equal(c.contributions.find(m=>m.symbol==='MYM').trades,0);
  assert.ok(c.confirmation.accepted<=c.confirmation.candidates);assert.equal(Object.values(c.confirmation.reasons).reduce((a,n)=>a+n,0),c.confirmation.candidates);
  assert.equal(c.trades,d.common+d.added.count);assert.equal(b.trades,d.common+d.removed.count);assert.ok(d.delayedCommon<=d.common);
  if(v.variant==='baseline')for(const key of ['net','trades','drawdown','calendar','contributions'])assert.deepEqual(c[key],b[key]);
 }
 const altered=Buffer.from(raw);altered[12]^=1;await assert.rejects(()=>verifyEntryReport(altered));
 assert.equal(/"(?:entryTime|exitTime|stopPrice|candles)"\s*:/.test(raw.toString()),false);
});
class Element{constructor(){this.value='';this.textContent='';this.children=[];this.listeners={};}append(n){this.children.push(n);}replaceChildren(...v){this.children=v;}addEventListener(k,f){this.listeners[k]=f;}}
test('all 36 entry comparisons render their own market, filter and weekly results; damaged reports show no results',async()=>{
 const html=(await read('trading/lab/index.html')).toString(),ids=[...html.matchAll(/id="(entry36[^"]*)"/g)].map(m=>m[1]),raw=await read('trading/lab/jeu36-report.json'),r=JSON.parse(raw),old={document:globalThis.document,fetch:globalThis.fetch};
 try{for(const valid of [true,false]){
  const elements=new Map(ids.map(id=>[id,new Element()])),el=id=>elements.get(id),done=Promise.withResolvers();
  Object.defineProperty(el('entry36Results'),'hidden',{set(v){this.isHidden=v;done.resolve();}});
  for(const [id,v]of [['entry36Month','june'],['entry36Variant','baseline'],['entry36Mode','funded'],['entry36Cost','normal']])el(id).value=v;
  globalThis.document={getElementById(id){assert.ok(elements.has(id),id);return el(id);},createElement(){return new Element();}};globalThis.fetch=async()=>new Response(valid?raw:'<html>Login</html>');
  await import(`../trading/lab/lab-entries.mjs?test=${valid}`);await done.promise;assert.equal(el('entry36Results').isHidden,!valid);if(!valid)continue;
  for(const view of r.views)for(const cost of ['normal','stress']){
   el('entry36Month').value=view.month;el('entry36Variant').value=view.variant;el('entry36Mode').value=view.mode;el('entry36Cost').value=cost;el('entry36Cost').listeners.change();
   const c=view.costs[cost],usd=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(n);
   assert.equal(el('entry36Weeks').children.length,c.calendar.weeks.length);assert.equal(el('entry36Months').children.length,3);assert.equal(el('entry36Markets').children.length,4);
   assert.equal(el('entry36Stats').children[0].children[2].textContent,String(c.trades));
   if(view.variant!=='baseline')assert.ok(el('entry36Filter').textContent.includes(`${c.confirmation.accepted}/${c.confirmation.candidates}`));
   for(const [i,w]of c.calendar.weeks.entries())assert.equal(el('entry36Weeks').children[i].children[2].textContent,usd(w.net));
   for(const [i,m]of c.contributions.entries())assert.equal(el('entry36Markets').children[i].children[3].textContent,usd(m.net));
  }
 }}finally{globalThis.document=old.document;globalThis.fetch=old.fetch;}
});
