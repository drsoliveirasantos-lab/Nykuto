import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { PRODUCTS, PREFIX, MINUTE, normalizeBar, emptyStream, appendBar, aggregateBars, describeStream } from '../trading/live/feed-core.mjs';
import { ingest, receptionStatus, createHandler } from '../trading/live/feed-service.mjs';
import { makeRequest, sendBar } from '../trading/live/bridge/relay.mjs';
// All prices and identities below are SYNTHETIC TEST FIXTURES, never market results.
const end = Date.UTC(2026,8,9,14,0), now = end + 1000;
function fixture(overrides = {}) { return { schema:1,source:'quantower-rithmic',root:'MNQ',contract:'MNQ-202609',providerSymbol:'MNQU6',startMs:end-MINUTE,endMs:end,open:100,high:101,low:99,close:100.5,volume:12,...overrides }; }
function database() {
  const sql = new DatabaseSync(':memory:');
  sql.exec('CREATE TABLE trading_state(user_id TEXT,state_key TEXT,value TEXT,revision INTEGER,updated_at TEXT,PRIMARY KEY(user_id,state_key));');
  return { sql, prepare(query) { return { bind(...args) { const statement = sql.prepare(query); return {
    async first() { return statement.get(...args) || null; }, async all() { return { results: statement.all(...args) }; },
    async run() { const r = statement.run(...args); return { meta:{ changes:Number(r.changes) } }; }
  }; } }; } };
}
test('four micro-contracts accept only their native tick grid', () => {
  for (const root of Object.keys(PRODUCTS)) assert.equal(normalizeBar(fixture({root,contract:`${root}-202609`,providerSymbol:`${root}U6`,close:100}),now).root,root);
});
const invalid = [
  ['unknown source',{source:'demo'}],['unknown market',{root:'NQ'}],['continuous contract',{contract:'MNQ1!'}],
  ['wrong contract root',{contract:'MES-202609'}],['invalid month',{contract:'MNQ-202613'}],['expired contract',{contract:'MNQ-202401'}],
  ['remote expiry',{contract:'MNQ-202912'}],['bad native symbol',{providerSymbol:'MNQ1!'}],['wrong native root',{providerSymbol:'NQU6'}],
  ['future bar',{startMs:end,endMs:end+MINUTE}],['open interval',{endMs:end-1000}],['unaligned bar',{startMs:end-MINUTE+1,endMs:end+1}],
  ['old bar',{startMs:end-12*MINUTE,endMs:end-11*MINUTE}],['off-grid',{open:100.1}],['negative price',{low:-1}],
  ['not numeric',{close:'100.5'}],['infinite price',{high:Infinity}],['invalid OHLC',{high:100}],
  ['fractional volume',{volume:0.1}],['negative volume',{volume:-1}],['huge volume',{volume:1e12}],
  ['secret field',{password:'synthetic-do-not-save'}],['order field',{side:'buy'}],['prototype root',{root:'__proto__'}]
];
for (const [name,patch] of invalid) test(`reject ${name}`,()=>assert.throws(()=>normalizeBar(fixture(patch),now)));
test('missing schema and null payload are rejected',()=>{const b=fixture();delete b.schema;assert.throws(()=>normalizeBar(b,now));assert.throws(()=>normalizeBar(null,now));});
test('duplicate does not increase counters or refresh reception time',()=>{
  const bar=normalizeBar(fixture(),now), first=appendBar(emptyStream(),bar,now).state;
  const second=appendBar(first,bar,now+MINUTE);
  assert.equal(second.duplicate,true);assert.equal(second.state,first);assert.equal(second.state.receivedAt,now);assert.equal(second.state.accepted,1);
});
test('conflicting duplicate, out-of-order and provider mismatch fail closed',()=>{
  const state=appendBar(emptyStream(),normalizeBar(fixture(),now),now).state;
  assert.throws(()=>appendBar(state,fixture({close:100.75}),now),/contenu différent/);
  assert.throws(()=>appendBar(state,fixture({startMs:end-2*MINUTE,endMs:end-MINUTE}),now),/désordonnée/);
  assert.throws(()=>appendBar(state,fixture({startMs:end,endMs:end+MINUTE,providerSymbol:'MNQ U6'}),now),/symbole fournisseur/);
});
test('gaps and forward rollover are explicit, never interpolated',()=>{
  let state=appendBar(emptyStream(),fixture(),now).state;
  state=appendBar(state,fixture({startMs:end+MINUTE,endMs:end+2*MINUTE,contract:'MNQ-202612',providerSymbol:'MNQZ6'}),now).state;
  assert.equal(state.gaps,1);assert.equal(state.rollovers,1);assert.equal(state.bars.length,2);
  assert.throws(()=>appendBar(state,fixture({startMs:end+2*MINUTE,endMs:end+3*MINUTE}),now),/ancienne échéance/);
});
test('bounded reception buffer does not become an unbounded tick archive',()=>{
  let state=emptyStream();for(let i=0;i<130;i++)state=appendBar(state,fixture({startMs:end+i*MINUTE,endMs:end+(i+1)*MINUTE}),now).state;
  assert.equal(state.bars.length,120);assert.equal(state.accepted,130);
});
test('UTC aggregation counts complete 1/5/15/60 minute groups',()=>{
  const bars=Array.from({length:60},(_,i)=>fixture({startMs:end+i*MINUTE,endMs:end+(i+1)*MINUTE}));
  for(const [m,count] of [[1,60],[5,12],[15,4],[60,1]])assert.equal(aggregateBars(bars,m).length,count);
  const hour=aggregateBars(bars,60)[0];assert.equal(hour.volume,720);assert.equal(hour.open,100);assert.equal(hour.close,100.5);
});
test('aggregation rejects gaps, duplicate minutes, partial boundaries and mixed contracts',()=>{
  const bars=Array.from({length:5},(_,i)=>fixture({startMs:end+i*MINUTE,endMs:end+(i+1)*MINUTE}));
  assert.equal(aggregateBars(bars.slice(1),5).length,0);
  assert.equal(aggregateBars([...bars,bars[0]],5).length,0);
  assert.equal(aggregateBars([...bars.slice(0,4),{...bars[4],contract:'MNQ-202612'}],5).length,0);
  assert.throws(()=>aggregateBars(bars,2));
});
test('freshness uses market time, never an API probe or recent transport time',()=>{
  const state=appendBar(emptyStream(),fixture(),now).state;
  assert.equal(describeStream('MNQ',emptyStream(),now).state,'waiting');
  assert.equal(describeStream('MNQ',state,now).state,'recent');
  const s=describeStream('MNQ',{...state,receivedAt:now+10*MINUTE},now+3*MINUTE);
  assert.equal(s.state,'stale');for(const k of ['sourceVerified','paperEnabled','shadowEnabled','ordersEnabled'])assert.equal(s[k],false);
});
test('real SQLite persists data only under the signed member identity',async()=>{
  const db=database();await ingest(db,'owner-a',fixture(),now);
  const a=await receptionStatus(db,'owner-a',now),b=await receptionStatus(db,'owner-b',now);
  assert.equal(a.streams[0].accepted,1);assert.equal(b.streams[0].accepted,0);
  assert.equal(db.sql.prepare('SELECT state_key FROM trading_state').get().state_key,PREFIX+'MNQ');
  assert.equal(a.paperEnabled,false);assert.equal(a.ordersEnabled,false);
});
test('concurrent duplicate writes are idempotent using real SQLite revision checks',async()=>{
  const db=database();const results=await Promise.all([ingest(db,'owner',fixture(),now),ingest(db,'owner',fixture(),now)]);
  assert.equal(results.filter(r=>r.duplicate).length,1);
  assert.equal((await receptionStatus(db,'owner',now)).streams[0].accepted,1);
});
test('storage failures and corrupted state never report accepted',async()=>{
  const db=database();db.sql.prepare('INSERT INTO trading_state VALUES(?,?,?,?,?)').run('owner',PREFIX+'MNQ','broken-json',1,'synthetic');
  await assert.rejects(ingest(db,'owner',fixture(),now),/ill isible|illisible/);
  assert.equal(db.sql.prepare('SELECT value FROM trading_state').get().value,'broken-json');
});
class AccountError extends Error { constructor(message,status=400){super(message);this.status=status;} }
const dependencies={ AccountError,
  async member(c){if(!c.identity)throw new AccountError('Unauthorized',401);return c.identity;},
  mutation(r,u){if(r.headers.get('Origin')!==new URL(r.url).origin||r.headers.get('X-Nykuto-Action')!=='account-write')throw new AccountError('Forbidden',403);if(r.headers.get('X-Nykuto-User')!==u.id)throw new AccountError('Changed identity',409);},
  async body(r,max){const text=await r.text();if(Buffer.byteLength(text)>max)throw new AccountError('Large body',413);return JSON.parse(text);},
  json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});},
  async handle(fn){try{return await fn();}catch(e){return this.json({error:'rejected'},e instanceof AccountError?e.status:503);}}
};
dependencies.handle=dependencies.handle.bind(dependencies);
const route=createHandler(dependencies);
function context(action,changes={}){return {env:{TRADING_USERS:database()},identity:{id:'owner',role:'owner'},request:new Request('https://trading.nykuto.com/api/market',{method:'POST',headers:{Origin:'https://trading.nykuto.com','X-Nykuto-Action':'account-write','X-Nykuto-User':'owner','Content-Type':'application/json'},body:JSON.stringify(action)}),...changes};}
test('route rejects unauthenticated users, testers, cross-origin requests and identity changes',async()=>{
  assert.equal((await route(context({action:'probe'},{identity:null}))).status,401);
  assert.equal((await route(context({action:'probe'},{identity:{id:'tester',role:'tester'}}))).status,403);
  let c=context({action:'probe'});c.request.headers.set('Origin','https://other.invalid');assert.equal((await route(c)).status,403);
  c=context({action:'probe'});c.request.headers.set('X-Nykuto-User','someone-else');assert.equal((await route(c)).status,409);
});
test('API probe performs no market writes and never confirms a provider connection',async()=>{
  const c=context({action:'probe'}),r=await route(c),data=await r.json();
  assert.equal(r.status,200);assert.equal(data.transportReady,true);assert.equal(data.providerConnected,false);assert.equal(data.wroteMarketData,false);
  assert.equal(c.env.TRADING_USERS.sql.prepare('SELECT count(*) as n FROM trading_state').get().n,0);
});
test('route rejects oversized messages and every order/activation action',async()=>{
  assert.equal((await route(context({action:'probe',padding:'x'.repeat(4096)}))).status,413);
  for(const action of ['buy','sell','paper','live','enable','reset'])assert.equal((await route(context({action}))).status,400);
});
test('relay locks the destination and sends no request without authentication',()=>{
  assert.throws(()=>makeRequest(fixture(),'owner',''));
  const r=makeRequest(fixture(),'owner','a.b.c');assert.equal(r.redirect,'manual');assert.equal(r.headers['cf-access-token'],'a.b.c');
});
test('relay checks acknowledgement, retries transient failures and stops on authentication redirects',async()=>{
  const bar=fixture();let calls=0;const ok=()=>new Response(JSON.stringify({accepted:true,root:bar.root,endMs:bar.endMs}),{headers:{'Content-Type':'application/json'}});
  await sendBar(bar,{userId:'owner',token:'a.b.c',pause:async()=>{},fetcher:async(url)=>{assert.equal(url,'https://trading.nykuto.com/api/market');return ++calls===1?new Response(null,{status:503}):ok();}});
  assert.equal(calls,2);
  for(const status of [302,401,403])await assert.rejects(sendBar(bar,{userId:'owner',token:'a.b.c',fetcher:async()=>new Response(null,{status})}),/Accès/);
  await assert.rejects(sendBar(bar,{userId:'owner',token:'a.b.c',fetcher:async()=>new Response('{"accepted":true}',{headers:{'Content-Type':'application/json'}})}),/non acceptée/);
});
test('published page and exporter never claim an active bot or contain order entry code',async()=>{
  const page=await readFile(new URL('../trading/live/index.html',import.meta.url),'utf8');
  const source=await readFile(new URL('../trading/live/bridge/NykutoBarExporter.cs',import.meta.url),'utf8');
  assert.match(page,/Paper Bot et Shadow : OFF/);assert.match(page,/pas un plugin Quantower déjà certifié/);
  assert.doesNotMatch(source,/PlaceOrder|SendOrder|ModifyOrder|CancelOrder|OrderRequest|public Account/);
  assert.match(source,/history\[1\]/);assert.match(source,/firstFullMinute/);
});
