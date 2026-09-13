import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { serveVerifiedPine } from '../trading/functions/api/lab/pine.js';
import { accountDatabase, users } from './trading-account-fixtures.mjs';

test('Pine download requires the owner and an exact source fingerprint before returning text', async()=>{
  const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  const jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'private-pine'};
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async()=>Response.json({keys:[jwk]});
  try {
    const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
    const tokenFor=async email=>{
      const now=Math.floor(Date.now()/1000);
      const input=encode({alg:'RS256',kid:jwk.kid})+'.'+encode({email,iss:'https://nykuto.cloudflareaccess.com',aud:['c32e7605f403b5782f17f3ba017488d62e13599d14811f0a15a3d914c4b50190'],iat:now-10,exp:now+300});
      return input+'.'+Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(input))).toString('base64url');
    };
    const [owner,tester]=users;
    const source='//@version=6\nindicator("Fixture")\nplot(close)\n';
    const reference={version:'15.2.8',key:'private/fixture',sha256:createHash('sha256').update(source).digest('hex')};
    let reads=0;
    const env={TRADING_USERS:accountDatabase(),TRADING_DATASETS:{get:async key=>{reads++;assert.equal(key,reference.key);return source;}}};
    const request=(token,query='')=>new Request('https://trading.nykuto.com/api/lab/pine'+query,{headers:token?{'Cf-Access-Jwt-Assertion':token}:{}});
    assert.equal((await serveVerifiedPine({request:request(),env},reference)).status,401);
    assert.equal((await serveVerifiedPine({request:request(await tokenFor(tester.email)),env},reference)).status,403);
    assert.equal(reads,0);
    const ownerToken=await tokenFor(owner.email);
    assert.equal((await serveVerifiedPine({request:request(ownerToken,'?key=other'),env},reference)).status,400);
    const response=await serveVerifiedPine({request:request(ownerToken),env},reference);
    assert.equal(response.status,200);assert.equal(await response.text(),source);
    assert.equal(response.headers.get('x-pine-sha256'),reference.sha256);
    assert.match(response.headers.get('content-disposition'),/attachment.*TradingView\.txt/);
    assert.match(response.headers.get('cache-control'),/private, no-store/);
    assert.equal((await serveVerifiedPine({request:request(ownerToken),env},{...reference,sha256:'a'.repeat(64)})).status,503);
    assert.equal((await serveVerifiedPine({request:request(ownerToken),env},{...reference,key:null})).status,503);
  } finally {globalThis.fetch=originalFetch;}
});
