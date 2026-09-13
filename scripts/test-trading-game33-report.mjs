import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyAccountReport} from '../trading/lab/jeu33-report-validation.mjs';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root)),hash=b=>createHash('sha256').update(b).digest('hex');
test('Game33 report stays pinned, reconciled, unqualified, and all frozen dependencies preserved',async()=>{
 const bytes=await read('trading/lab/jeu33-report.json'),r=await verifyAccountReport(bytes),freezeRaw=await read('trading/lab/jeu33-freeze.json'),freeze=JSON.parse(freezeRaw);
 assert.equal(r.freezeSha256,hash(freezeRaw));for(const [p,sha]of Object.entries(freeze.files))assert.equal(hash(await read(p)),sha,p);
 assert.equal(r.executionCount,32);assert.equal(r.newConfigurations,4);assert.equal(r.confirmed,false);assert.equal(r.selection,null);
 assert.deepEqual(r.audit,{archivedReplays:8,controlReplays:8,accountPrefixes:999,tradesChecked:841,passed:true});
 for(const v of r.views)for(const c of Object.values(v.costs)){
  const cents=n=>Math.round(n*100)/100;assert.equal(cents(c.contributions.reduce((n,m)=>n+m.net,0)),c.net);assert.equal(c.contributions.reduce((n,m)=>n+m.trades,0),c.trades);
  assert.equal(cents(c.calendar.daily.reduce((n,d)=>n+(d.net??0),0)),c.net);
  assert.equal(c.balance-v.initial,c.net);assert.equal(cents(c.balance-c.floor),c.headroom);assert.equal(c.executionAllowed,false);
 }
 const broken=Buffer.from(bytes);broken[15]^=1;await assert.rejects(()=>verifyAccountReport(broken));
 const forbidden=/("(?:stopPrice|candles|entryTime|exitTime)"\s*:)/;assert.equal(forbidden.test(bytes.toString()),false);
});

class Element{
 constructor(){this.textContent='';this.value='';this.children=[];this.listeners={};this.hidden=true;}
 append(n){this.children.push(n);}replaceChildren(...ns){this.children=ns;}addEventListener(name,f){this.listeners[name]=f;}
 checkValidity(){return this.value.trim()!==''&&Number.isFinite(Number(this.value));}
}
test('account UI compares every frozen view, explains consistency, and hides an invalid report',async()=>{
 const html=(await read('trading/lab/index.html')).toString(),ids=[...html.matchAll(/id="((?:account50|consistency50)[^"]*)"/g)].map(m=>m[1]);
 const raw=await read('trading/lab/jeu33-report.json'),report=JSON.parse(raw),original={document:globalThis.document,fetch:globalThis.fetch};
 try{for(const valid of [true,false]){
  const elements=new Map(ids.map(id=>[id,new Element()])),el=id=>elements.get(id),done=Promise.withResolvers();
  Object.defineProperty(el('account50Results'),'hidden',{set(v){this.isHidden=v;done.resolve();}});
  for(const [id,value]of [['account50Profile','50k-reduced100'],['account50Period','summer'],['consistency50Stage','evaluation'],['consistency50Best','1800'],['consistency50Profit','3000']])el(id).value=value;
  globalThis.document={getElementById(id){assert.ok(elements.has(id),'Missing '+id);return el(id);},createElement(){return new Element();}};
  globalThis.fetch=async()=>new Response(valid?raw:'<html>Login</html>');
  await import(`../trading/lab/lab-account50.mjs?ui-test=${valid}`);await done.promise;
  assert.equal(el('account50Results').isHidden,!valid);if(!valid)continue;
  assert.match(el('consistency50Result').textContent,/60 %/);assert.match(el('consistency50Result').textContent,/600/);
  el('consistency50Stage').value='funded';el('consistency50Stage').listeners.input();assert.match(el('consistency50Result').textContent,/aucune règle/);
  for(const view of report.views){
   el('account50Profile').value=view.profileId;el('account50Period').value=view.id;el('account50Profile').listeners.change();
   const rows=el('account50Summary').children;assert.equal(rows.length,6);
   assert.equal(rows[0].children[1].textContent,new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(view.costs.normal.net));
   assert.equal(rows[1].children[2].textContent,String(view.costs.stress.trades));assert.equal(el('account50Markets').children.length,4);
  }
 }}finally{globalThis.document=original.document;globalThis.fetch=original.fetch;}
});
