import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { SPEC, context, assess, emptyBook, apply, makePrompt } from '../trading/assist/core.mjs';
import { loadBook, saveCommand, createHandler } from '../trading/assist/service.mjs';
import { aiConfigured, validateVision, reserveAttempt, analyze } from '../trading/assist/vision.mjs';
// Synthetic fixtures only. No real market quotes, identities, credentials or paid calls.
const now=Date.UTC(2026,8,9,14), id='aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const ctx=()=>({root:'MNQ',contract:'MNQ-202609',timeframes:'15m,5m,1m',capturedAt:now-60000,source:'declared-live',notes:'Synthetic test'});
const ticket=(overrides={})=>({context:ctx(),side:'long',quantity:1,entry:100,stop:90,target:120,feePerSide:.5,slippageTicks:1,riskBudget:30,quoteAt:now-10000,analysis:'Synthetic manual scenario',...overrides});
const open=(overrides={})=>({action:'open',id,ticket:ticket(),confirmed:true,...overrides});
const close=(overrides={})=>({action:'close',id,exit:110,observedAt:now,reason:'Manual observation',confirmed:true,...overrides});
function database(){const sql=new DatabaseSync(':memory:');sql.exec('CREATE TABLE trading_state(user_id TEXT,state_key TEXT,value TEXT,revision INTEGER,updated_at TEXT,PRIMARY KEY(user_id,state_key))');return {sql,prepare(query){return {bind(...args){const s=sql.prepare(query);return {async first(){return s.get(...args)||null;},async run(){return {meta:{changes:Number(s.run(...args).changes)}};}};}};}};}
test('micro contract grids and dollar values are distinct',()=>{
  assert.deepEqual(Object.keys(SPEC),['MNQ','MES','MYM','MGC']);
  for(const [root,expected] of [['MNQ',22],['MES',53.5],['MYM',7],['MGC',103]]){
    const t=ticket({context:{...ctx(),root,contract:`${root}-202609`},riskBudget:200});
    assert.equal(assess(t,now).risk,expected);
  }
});
test('long costs, fill and reward are explicit',()=>{const a=assess(ticket(),now);assert.equal(a.risk,22);assert.equal(a.reward,38);assert.equal(a.fillPrice,100.25);assert.deepEqual(a.blockers,[]);});
test('short applies adverse fills in the opposite direction',()=>{const t=ticket({side:'short',stop:110,target:80}),b=apply(emptyBook(),open({ticket:t}),now).book;const c=apply(b,close({exit:90}),now+1000).book.trades[0];assert.equal(c.entryFill,99.75);assert.equal(c.exitFill,90.25);assert.equal(c.gross,19);assert.equal(c.fees,1);assert.equal(c.net,18);});
for(const [name,changes] of [
  ['empty numerical field',{entry:null}],['numeric string',{entry:'100'}],['off tick',{entry:100.1}],
  ['bad long stop',{stop:101}],['bad target',{target:99}],['zero stop',{stop:100}],['invalid side',{side:'wait'}],
  ['negative fee',{feePerSide:-1}],['fractional quantity',{quantity:1.5}],['excess size',{quantity:21}],
  ['fractional slippage',{slippageTicks:.5}],['future time',{quoteAt:now+60000}],['empty analysis',{analysis:''}],
  ['credential field',{password:'not-a-secret'}]
])test(`reject ${name}`,()=>assert.throws(()=>assess(ticket(changes),now)));
test('contract and source cannot be substituted silently',()=>{
  for(const changes of [{root:'__proto__'},{root:'NQ'},{contract:'MNQ1!'},{contract:'MES-202609'},{contract:'MNQ-202613'},{source:'verified-by-ai'},{capturedAt:now+60000}])assert.throws(()=>context({...ctx(),...changes},now));
});
test('budget, stale quote, old screenshot and hypothetical source remain distinct',()=>{
  assert.match(assess(ticket({riskBudget:10}),now).blockers.join(),/budget/);
  assert.match(assess(ticket({quoteAt:now-180000,context:{...ctx(),capturedAt:now-240000}}),now).blockers.join(),/ancien/);
  const a=assess(ticket({context:{...ctx(),capturedAt:now-360000}}),now);assert.equal(a.blockers.length,0);assert.match(a.warnings.join(),/Capture ancienne/);
  const b=assess(ticket({context:{...ctx(),source:'unknown'}}),now);assert.match(b.warnings.join(),/hypothétique/);
});
test('entry past target after slippage is blocked',()=>assert.ok(assess(ticket({target:100.25}),now).blockers.length));
test('opening requires confirmation and blocks exceeding risk',()=>{assert.throws(()=>apply(emptyBook(),open({confirmed:false}),now));assert.throws(()=>apply(emptyBook(),open({ticket:ticket({riskBudget:1})}),now));});
test('idempotent opening and conflicting IDs',()=>{
  const b=apply(emptyBook(),open(),now).book;assert.equal(apply(b,open(),now+300000).duplicate,true);
  assert.throws(()=>apply(b,open({ticket:ticket({quantity:2})}),now),/autre ticket/);
  assert.throws(()=>apply(b,open({id:'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb'}),now),/Clôture/);
});
test('manual closure PNL, duplicate and conflict',()=>{
  const b=apply(emptyBook(),open(),now).book, closed=apply(b,close(),now+1000).book;
  assert.equal(closed.trades[0].entryFill,100.25);assert.equal(closed.trades[0].exitFill,109.75);assert.equal(closed.trades[0].net,18);
  assert.equal(apply(closed,close(),now+2000).duplicate,true);
  assert.throws(()=>apply(closed,close({exit:111}),now+2000),/déjà clôturé/);
});
test('a gap may exceed modelled stop risk; no automatic fill is fabricated',()=>{
  const b=apply(emptyBook(),open(),now).book,c=apply(b,close({exit:70}),now+1000).book;
  assert.equal(b.trades[0].status,'open');assert.ok(c.trades[0].net < -c.trades[0].plannedRisk);
});
test('close time must not precede entry observation; unknown action rejected',()=>{
  const b=apply(emptyBook(),open(),now).book;assert.throws(()=>apply(b,close({observedAt:now-120000}),now));
  for(const action of ['buy','sell','live','reset','enable'])assert.throws(()=>apply(b,{action},now));
});
test('real SQLite isolation and conditional revisions',async()=>{
  const db=database(),first=await saveCommand(db,'a',{revision:0,command:open()},now);
  assert.equal(first.revision,1);assert.equal((await loadBook(db,'b')).book.trades.length,0);
  assert.equal((await saveCommand(db,'a',{revision:0,command:open()},now)).duplicate,true);
  await assert.rejects(saveCommand(db,'a',{revision:0,command:close()},now+1000),/autre page/);
  await saveCommand(db,'a',{revision:1,command:close()},now+1000);assert.equal((await loadBook(db,'a')).book.trades[0].net,18);
});
test('concurrent saves never create two positions',async()=>{
  const db=database();await Promise.allSettled([saveCommand(db,'a',{revision:0,command:open()},now),saveCommand(db,'a',{revision:0,command:open({id:'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb'})},now)]);
  assert.equal((await loadBook(db,'a')).book.trades.length,1);
});
test('corrupt storage is not erased',async()=>{
  const db=database();db.sql.prepare('INSERT INTO trading_state VALUES(?,?,?,?,?)').run('a','nykuto-assisted-simulation-v1','broken',1,'date');
  await assert.rejects(loadBook(db,'a'),/illisible/);assert.equal(db.sql.prepare('SELECT value FROM trading_state').get().value,'broken');
});
class AccountError extends Error{constructor(message,status=400){super(message);this.status=status;}}
const accounts={AccountError,member:async c=>{if(!c.user)throw new AccountError('No session',401);return c.user;},mutation(r,u){if(r.headers.get('Origin')!=='https://trading.nykuto.com')throw new AccountError('Origin',403);if(r.headers.get('X-Nykuto-User')!==u.id)throw new AccountError('Changed user',409);},body:r=>r.json(),json:(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}}),handle:async f=>{try{return await f();}catch(e){return new Response('{}',{status:e.status||503});}}};
test('handler requires membership, same-origin and the current user',async()=>{
  const handler=createHandler(accounts),make=()=>({env:{TRADING_USERS:database()},user:{id:'a',role:'owner'},request:new Request('https://trading.nykuto.com/api/assist/',{method:'POST',headers:{Origin:'https://trading.nykuto.com','X-Nykuto-User':'a','Content-Type':'application/json'},body:'{}'})});
  let c=make();c.user=null;assert.equal((await handler(c)).status,401);
  c=make();c.request.headers.set('Origin','https://evil.invalid');assert.equal((await handler(c)).status,403);
  c=make();c.request.headers.set('X-Nykuto-User','b');assert.equal((await handler(c)).status,409);
});
test('AI requires explicit deployment configuration and consent',()=>{
  assert.equal(aiConfigured({}),false);assert.equal(aiConfigured({NYKUTO_ASSIST_AI_ENABLED:'true',OPENAI_API_KEY:'synthetic-private-key',OPENAI_VISION_MODEL:'test-model'}),true);
  assert.throws(()=>validateVision({context:ctx(),images:[],consent:false},now));
  for(const image of ['https://evil.invalid/a.png','data:image/jpeg;base64,AAAA','data:text/html;base64,AAAA'])assert.throws(()=>validateVision({context:ctx(),images:[image],consent:true},now));
});
test('atomic AI quota handles concurrency, cooldown and next UTC day',async()=>{
  const db=database(),r=await Promise.allSettled([reserveAttempt(db,'a',now),reserveAttempt(db,'a',now)]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1);
  await reserveAttempt(db,'a',now+60000);await reserveAttempt(db,'a',now+120000);
  await assert.rejects(reserveAttempt(db,'a',now+180000),/Limite/);await reserveAttempt(db,'a',now+86400000);
});
test('disabled AI never contacts provider',async()=>{
  let calls=0;await assert.rejects(analyze({},database(),{id:'a',role:'owner'},{},{now,fetcher:async()=>{calls++;}}),/non configurée/);assert.equal(calls,0);
});
test('vision output is text only, with no tools, no storage request and no orders',async()=>{
  const env={NYKUTO_ASSIST_AI_ENABLED:'true',OPENAI_API_KEY:'synthetic-private-key',OPENAI_VISION_MODEL:'test-model'},input={context:ctx(),images:['data:image/jpeg;base64,/9j/AA=='],consent:true};
  const r=await analyze(env,database(),{id:'a',role:'owner'},input,{now,fetcher:async(url,options)=>{
    assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(options.redirect,'error');
    const body=JSON.parse(options.body);assert.equal(body.store,false);assert.equal(body.tools,undefined);assert.equal(body.input[0].content[1].type,'input_image');
    return new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'Synthetic analysis'}]}]}),{status:200});
  }});
  assert.equal(r.analysis,'Synthetic analysis');assert.equal(r.orderCreated,false);assert.equal(r.sourceVerified,false);
});
test('handoff never pretends to have images; UI keeps manual confirmation and disabled broker',async()=>{
  assert.match(makePrompt(ctx()),/joins les images séparément/);
  const page=await readFile(new URL('../trading/assist/index.html',import.meta.url),'utf8');
  assert.match(page,/aucun broker connecté/);assert.match(page,/pas une surveillance automatique/);assert.match(page,/id="confirmed"/);
  const ui=await readFile(new URL('../trading/assist/assist.mjs',import.meta.url),'utf8');assert.doesNotMatch(ui,/innerHTML|localStorage|PlaceOrder|SendOrder/);
});
