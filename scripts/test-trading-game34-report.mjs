import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyMonthlyReport} from '../trading/lab/jeu34-report-validation.mjs';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root)),hash=b=>createHash('sha256').update(b).digest('hex'),cents=n=>Math.round(n*100)/100;
test('monthly report preserves freeze, separate month cashflows, controls and privacy',async()=>{
 const raw=await read('trading/lab/jeu34-report.json'),r=await verifyMonthlyReport(raw),frozen=await read('trading/lab/jeu34-freeze.json');assert.equal(hash(frozen),r.freezeSha256);
 for(const [p,sha]of Object.entries(JSON.parse(frozen).files))assert.equal(hash(await read(p)),sha,p);
 assert.deepEqual(r.audit,{controlReplays:6,accountPrefixes:512,checkedTrades:418,passed:true});assert.equal(r.newConfigurations,3);assert.equal(r.newStrategyVariants,1);
 for(const v of r.views)for(const c of Object.values(v.costs)){
  assert.equal(cents(c.balance+c.withdrawnUSD-50000),c.net);assert.equal(cents(c.calendar.weeks.reduce((n,w)=>n+(w.net??0),0)),c.net);
  assert.equal(cents(c.calendar.weeks.reduce((n,w)=>n+w.receiptEUR,0)),c.receiptEUR);assert.equal(cents(c.contributions.reduce((n,m)=>n+m.net,0)),c.net);
  assert.equal(c.personalGoalAchieved,false);assert.equal(c.receiptEUR,0);assert.equal(c.executionAllowed,false);
  if(v.variant==='without-mym')assert.equal(c.contributions.find(m=>m.symbol==='MYM').trades,0);
 }
 const altered=Buffer.from(raw);altered[12]^=1;await assert.rejects(()=>verifyMonthlyReport(altered));
 assert.equal(/"(?:entryTime|exitTime|stopPrice|candles)"\s*:/.test(raw.toString()),false);
});
class Element{constructor(){this.value='';this.textContent='';this.children=[];this.listeners={};}append(n){this.children.push(n);}replaceChildren(...v){this.children=v;}addEventListener(k,f){this.listeners[k]=f;}}
test('weekly display switches all month/stage/cost views and rejects unverified results',async()=>{
 const html=(await read('trading/lab/index.html')).toString(),ids=[...html.matchAll(/id="(monthlyGoal[^"]*)"/g)].map(m=>m[1]),raw=await read('trading/lab/jeu34-report.json'),r=JSON.parse(raw),old={document:globalThis.document,fetch:globalThis.fetch};
 try{for(const valid of [true,false]){
  const elements=new Map(ids.map(id=>[id,new Element()])),el=id=>elements.get(id),done=Promise.withResolvers();
  Object.defineProperty(el('monthlyGoalResults'),'hidden',{set(v){this.isHidden=v;done.resolve();}});
  for(const [id,v]of [['monthlyGoalMonth','june'],['monthlyGoalVariant','without-mym'],['monthlyGoalMode','funded'],['monthlyGoalCost','normal']])el(id).value=v;
  globalThis.document={getElementById(id){assert.ok(elements.has(id),id);return el(id);},createElement(){return new Element();}};globalThis.fetch=async()=>new Response(valid?raw:'<html>Login</html>');
  await import(`../trading/lab/lab-monthly-goal.mjs?test=${valid}`);await done.promise;assert.equal(el('monthlyGoalResults').isHidden,!valid);if(!valid)continue;
  for(const view of r.views)for(const cost of ['normal','stress']){
   el('monthlyGoalMonth').value=view.month;el('monthlyGoalVariant').value=view.variant;el('monthlyGoalMode').value=view.mode;el('monthlyGoalCost').value=cost;el('monthlyGoalCost').listeners.change();
   const c=view.costs[cost];assert.equal(el('monthlyGoalWeeks').children.length,c.calendar.weeks.length);assert.equal(el('monthlyGoalComparison').children.length,3);
   assert.equal(el('monthlyGoalTrades').children[0].children[1].textContent,String(c.trades));
   for(const [i,w]of c.calendar.weeks.entries())assert.equal(el('monthlyGoalWeeks').children[i].children[2].textContent,new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(w.net));
   assert.match(el('monthlyGoalResult').textContent,view.mode==='evaluation'?/aucun retrait/i:/non atteint/);
  }
 }}finally{globalThis.document=old.document;globalThis.fetch=old.fetch;}
});
