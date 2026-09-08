import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { accountDatabase, users } from './trading-account-fixtures.mjs';
import { onRequest as profile } from '../trading/functions/api/account/index.js';
import { onRequest as state } from '../trading/functions/api/account/state.js';
import { onRequest as feedback } from '../trading/functions/api/account/feedback.js';
import { onRequest as middleware } from '../trading/functions/_middleware.js';
import { onRequest as inbox } from '../trading/functions/api/alerts/index.js';
import { onRequest as setup } from '../trading/functions/api/alerts/setup.js';
import worker from '../workers/trading-alerts/worker.mjs';
import { hash, personalAlerts, readSetup } from '../trading/alerts/alert-service.mjs';
const origin = 'https://trading.nykuto.com', [owner, a, b] = users;
const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const jwk = { ...await crypto.subtle.exportKey('jwk', pair.publicKey), kid: 'accounts-test' };
const originalFetch = globalThis.fetch;
globalThis.fetch = async url => { assert.equal(url, 'https://nykuto.cloudflareaccess.com/cdn-cgi/access/certs'); return Response.json({ keys: [jwk] }); };
test.after(() => { globalThis.fetch = originalFetch; });
async function jwt(email, overrides = {}) {
  const encode = v => Buffer.from(JSON.stringify(v)).toString('base64url'), now = Math.floor(Date.now() / 1000);
  const claims = { email, iss: 'https://nykuto.cloudflareaccess.com', aud: ['c32e7605f403b5782f17f3ba017488d62e13599d14811f0a15a3d914c4b50190'], iat: now - 1, exp: now + 300, ...overrides };
  const unsigned = `${encode({ alg: 'RS256', kid: jwk.kid })}.${encode(claims)}`;
  return `${unsigned}.${Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(unsigned))).toString('base64url')}`;
}
async function ctx(env, user, path = '/api/account', method = 'GET', value, headers = {}) {
  return { env, request: new Request(origin + path, { method, headers: { 'Cf-Access-Jwt-Assertion': await jwt(user.email), Origin: origin, 'Content-Type': 'application/json', 'X-Nykuto-Action': 'account-write', 'X-Nykuto-User': user.id, ...headers }, ...(value === undefined ? {} : { body: JSON.stringify(value) }) }) };
}
const journal = label => [{ id: label, createdAt: new Date().toISOString(), asset: label, side: 'Long', r: 1 }];
const key = 'nykuto-trading-trades-v1';
test('verified email membership and mandatory names fail closed; role cannot be supplied by client', async () => {
  const env = { TRADING_USERS: accountDatabase() };
  for (const u of [{ id: 'outsider', email: 'outside@example.com' }, a]) {
    const c = await ctx(env, u); if (u === a) c.request.headers.set('Cf-Access-Jwt-Assertion', 'fake');
    assert.equal((await profile(c)).status, u === a ? 401 : 403);
  }
  const missing = await ctx({}, a); assert.equal((await profile(missing)).status, 503);
  env.TRADING_USERS.sql.prepare('UPDATE trading_users SET first_name = ?, last_name = ? WHERE id = ?').run('', '', a.id);
  assert.equal((await (await profile(await ctx(env, a))).json()).user.complete, false);
  assert.equal((await state(await ctx(env, a, '/api/account/state'))).status, 428);
  assert.equal((await profile(await ctx(env, a, '/api/account', 'PUT', { firstName: 'A', lastName: '' }))).status, 400);
  assert.equal((await profile(await ctx(env, a, '/api/account', 'PUT', { firstName: 'A', lastName: 'B', role: 'owner' }))).status, 400);
  assert.equal((await profile(await ctx(env, a, '/api/account', 'PUT', { firstName: 'Alice', lastName: 'Test' }))).status, 200);
  const actual = (await (await profile(await ctx(env, a))).json()).user; assert.equal(actual.role, 'tester'); assert.equal(actual.firstName, 'Alice');
  assert.equal((await profile(await ctx(env, { ...a, email: a.email.toUpperCase() }))).status, 200);
});
test('personal state is separate even for owner, rejects cross-account claims and stale overwrites', async () => {
  const env = { TRADING_USERS: accountDatabase() };
  for (const user of [a,b]) assert.equal((await state(await ctx(env,user,'/api/account/state','PUT',{key,value:journal(user.id),revision:0}))).status, 200);
  for (const user of [a,b]) { const data = await (await state(await ctx(env,user,'/api/account/state?user_id='+owner.id))).json(); assert.equal(data.states.length,1); assert.equal(data.states[0].value[0].id,user.id); }
  assert.deepEqual((await (await state(await ctx(env,owner,'/api/account/state'))).json()).states, []);
  const mutation = {key,value:journal('changed'),revision:0};
  assert.equal((await state(await ctx(env,a,'/api/account/state','PUT',mutation))).status,409);
  assert.equal((await state(await ctx(env,a,'/api/account/state','PUT',{...mutation,revision:1}, {'X-Nykuto-User':b.id}))).status,409);
  assert.equal((await state(await ctx(env,a,'/api/account/state','PUT',{...mutation,revision:1,user_id:b.id}))).status,400);
  assert.equal((await state(await ctx(env,a,'/api/account/state','PUT',{...mutation,revision:1}, {Origin:'https://evil.example'}))).status,403);
  assert.equal((await state(await ctx(env,a,'/api/account/state','PUT',{...mutation,revision:1}, {'X-Nykuto-Action':''}))).status,403);
  assert.equal((await state(await ctx(env,a,'/api/account/state','GET',undefined, {'X-Nykuto-User':b.id}))).status,409);
  assert.equal((await state(await ctx(env,a,'/api/account/state','PUT',{...mutation,revision:1}))).status,200);
  assert.equal((await state(await ctx(env,a,'/api/account/state','PUT',{key:'connections',revision:0,value:{broker:'Demo',tradingViewName:'',mode:'paper',apiKey:'secret'}}))).status,400);
  assert.equal((await state(await ctx(env,a,'/api/account/state','PUT',{key,value:journal('x'.repeat(1600000)),revision:2}))).status,413);
});
test('feedback is attributed server-side, idempotent and private to author and owner', async () => {
  const env = { TRADING_USERS: accountDatabase() }, path='/api/account/feedback';
  const report = {id:crypto.randomUUID(),category:'idea',page:'/lab/',message:'Rendre le statut plus clair',user_id:b.id};
  assert.equal((await feedback(await ctx(env,a,path,'POST',report))).status,201);
  assert.equal((await feedback(await ctx(env,a,path,'POST',report))).status,200);
  assert.equal((await (await feedback(await ctx(env,b,path))).json()).feedback.length,0);
  const seen = await (await feedback(await ctx(env,owner,path))).json(); assert.equal(seen.feedback.length,1); assert.equal(seen.feedback[0].user_id,a.id);
  const update={id:report.id,status:'reviewing',response:'Je vérifie le libellé.'};
  assert.equal((await feedback(await ctx(env,b,path,'PATCH',update))).status,403);
  assert.equal((await feedback(await ctx(env,owner,path,'PATCH',update))).status,200);
  assert.equal((await (await feedback(await ctx(env,a,path))).json()).feedback[0].response,update.response);
  assert.equal((await feedback(await ctx(env,a,path,'POST',{...report,id:'new',page:'https://evil.example'}))).status,400);
});
test('middleware rejects inactive users, gates onboarding and marks authenticated HTML private', async () => {
  const env={TRADING_USERS:accountDatabase()}; let called=false;
  const context=await ctx(env,a,'/lab/'); context.next=async()=>{called=true;return new Response('html',{headers:{'Content-Type':'text/html'}});};
  env.TRADING_USERS.sql.prepare('UPDATE trading_users SET first_name = ? WHERE id = ?').run('',a.id);
  let response=await middleware(context); assert.equal(response.status,303); assert.equal(response.headers.get('Location'),'/account/'); assert.equal(called,false);
  const api=await ctx(env,a,'/api/replay');api.next=context.next;assert.equal((await middleware(api)).status,428);
  env.TRADING_USERS.sql.prepare('UPDATE trading_users SET active = 0 WHERE id = ?').run(a.id);
  assert.equal((await middleware(context)).status,403); assert.equal(called,false);
  env.TRADING_USERS.sql.prepare('UPDATE trading_users SET active = 1, first_name = ? WHERE id = ?').run('A',a.id);
  let prepended='';globalThis.HTMLRewriter=class{on(selector,handler){handler.element({prepend:s=>{prepended+=s;},append:()=>{}});return this;}transform(response){return response;}};
  try { response=await middleware(context);assert.equal(called,true);assert.match(response.headers.get('Cache-Control'),/private, no-store/);assert.match(prepended,/account\/session.js/); } finally { delete globalThis.HTMLRewriter; }
});
test('personal TradingView deliveries and private URLs never cross account boundaries', async () => {
  const records=new Map(), kv={async get(k){return records.get(k)?.value||null;},async put(k,value,options={}){records.set(k,{value,metadata:options.metadata});},async list({prefix}){return {keys:[...records].filter(([k])=>k.startsWith(prefix)).map(([name,v])=>({name,metadata:v.metadata})),list_complete:true};}};
  const env={TRADING_USERS:accountDatabase(),TRADING_ALERTS:kv}, token='d'.repeat(64), url=`https://nykuto-trading-alerts.test.workers.dev/personal/${a.id}/${token}`;
  await kv.put('routes/'+await hash(token),JSON.stringify({userId:a.id}));
  await personalAlerts(kv,a).put('config/webhook-v1',JSON.stringify({schema:'trading-alerts-v1',webhookUrl:url}));
  assert.equal((await readSetup(personalAlerts(kv,a))).webhookUrl,url);
  const payload={name:'Seuil',symbol:'CME:MNQ1!',price:24000,interval:'15',triggeredAt:new Date().toISOString()};
  const request=u=>new Request(u,{method:'POST',headers:{'CF-Connecting-IP':'52.89.214.238','Content-Type':'application/json'},body:JSON.stringify(payload)});
  assert.equal((await worker.fetch(request(url),env)).status,200);
  assert.equal((await worker.fetch(request(url.replace(a.id,b.id)),env)).status,404);
  assert.equal((await (await inbox(await ctx(env,a,'/api/alerts'))).json()).events.length,1);
  for (const other of [b,owner]) { assert.equal((await (await inbox(await ctx(env,other,'/api/alerts'))).json()).events.length,0); assert.equal((await setup(await ctx(env,other,'/api/alerts/setup'))).status,503); }
  env.TRADING_USERS.sql.prepare('UPDATE trading_users SET active=0 WHERE id=?').run(a.id);
  assert.equal((await worker.fetch(request(url),env)).status,404);
});
test('browser account state waits for acknowledged writes and does not read another local journal', async () => {
  const saved=[],statusNode={textContent:''};let fail=false;
  const context={window:{addEventListener(){}},document:{body:{},getElementById(){return statusNode;}},location:{pathname:'/'},structuredClone,AbortSignal,Map,Promise,JSON,Error,
    fetch:async(path,opts)=>{if(path==='/api/account')return Response.json({user:{...a,complete:true}});if(opts.method==='PUT'){if(fail)return Response.json({error:'Conflict'},{status:409});const data=JSON.parse(opts.body);saved.push(data);return Response.json({revision:data.revision+1});}return Response.json({userId:a.id,states:[]});},
    localStorage:{getItem(){throw new Error('Must not read device-wide personal data');}}};
  vm.runInNewContext(readFileSync(new URL('../trading/account/session.js',import.meta.url),'utf8'),context);const app=context.window.Nykuto;await app.ready;
  const data=journal('a');const write=app.set(key,data);data[0].asset='mutated';await write;assert.equal(app.read(key,[])[0].asset,'a');
  fail=true;await assert.rejects(app.set(key,journal('bad')),/Conflict/);assert.equal(app.read(key,[])[0].asset,'a');
  assert.equal(saved.length,1);
  fail=false;
  await Promise.all([app.update(key,current=>[...current,...journal('second')]),app.update(key,current=>[...current,...journal('third')])]);
  assert.deepEqual(Array.from(app.read(key,[]),v=>v.id),['a','second','third']);
});
