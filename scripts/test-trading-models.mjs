import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequest,validateRequest,validateForecast,requestHash} from '../trading/models/bridge.mjs';
import {makePrompt} from '../trading/assist/core.mjs';
const start=Date.parse('2026-07-08T13:30:00Z')/1000;
const candles=Array.from({length:64},(_,i)=>({time:start+i*60,open:100,high:101,low:99,close:100,volume:100}));
const input=()=>createRequest({symbol:'MNQ',contract:'MNQU6',intervalSeconds:60,candles});
const registry={modelRevision:'a'.repeat(40),tokenizerRevision:'b'.repeat(40),codeRevision:'c'.repeat(40)};
const result=r=>({schema:'nykuto-kronos-result-v1',inputSha256:r.inputSha256,model:'NeoQuasar/Kronos-mini',...registry,seed:42,generatedAt:'2026-09-10T00:00:00Z',elapsedSeconds:.1,forecast:r.futureTimes.map(time=>({time,open:100,high:102,low:99,close:101,volume:30})),executionEnabled:false});
test('valid native request and finite forecast stay outside execution',async()=>{const r=await input();assert.equal((await validateRequest(r)).candles.length,64);assert.equal((await validateForecast(result(r),r,registry)).executionEnabled,false);});
test('modified prices or horizon cannot reuse the input fingerprint',async()=>{const r=await input();r.candles[0].close=100.25;await assert.rejects(validateRequest(r),/empreinte/);r.inputSha256=await requestHash(r);await validateRequest(r);r.futureTimes[1]+=60;await assert.rejects(validateRequest(r),/Horizon/);});
test('unclosed data, gaps, continuous contracts, missing volume and invalid ticks rejected',async()=>{
 const base=await input();for(const mutate of [r=>r.contract='MNQ1!',r=>delete r.candles[0].volume,r=>r.candles[1].time+=60,r=>r.candles[0].close=100.1,r=>r.symbol='NQ']){const r=structuredClone(base);mutate(r);await assert.rejects(validateRequest(r));}
 await assert.rejects(validateRequest(base,start*1000),/clôturée/);
});
test('horizon may not invent a next session after cash close',async()=>{const late=candles.map((c,i)=>({...c,time:Date.parse('2026-07-08T18:56:00Z')/1000+i*60}));await assert.rejects(createRequest({symbol:'MNQ',contract:'MNQU6',intervalSeconds:60,candles:late}),/Horizon/);});
test('mismatched revision, horizon, invalid OHLC and execution flags rejected',async()=>{
 const r=await input();for(const mutate of [x=>x.modelRevision='d'.repeat(40),x=>x.executionEnabled=true,x=>x.inputSha256='0'.repeat(64),x=>x.forecast.pop(),x=>x.forecast[0].high=98,x=>x.forecast[0].volume=-1,x=>x.forecast[0].close=Infinity,x=>x.forecast[0].time++]){const x=result(r);mutate(x);await assert.rejects(validateForecast(x,r,registry));}
});
test('assisted analysis keeps unknown news and unconfirmed divergences explicit',()=>{const s=makePrompt({});assert.match(s,/annonce inconnue/);assert.match(s,/déjà confirmés/);assert.match(s,/ne justifient aucune hausse du risque/);assert.match(s,/Aucun ordre à exécuter/);});
