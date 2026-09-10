import test from 'node:test';
import assert from 'node:assert/strict';
import {studyDecision39,filterStudyStreams39} from '../trading/lab/jeu39-filters.mjs';
import {reviewResearchCandidate} from '../trading/lab/research-self-review.mjs';
import {modelOpinions39} from '../trading/lab/jeu39-model-opinions.mjs';
import {JEU39_MODEL} from '../trading/lab/jeu39-policy.mjs';
const signal=(iso,side='Long')=>{const t=Date.parse(iso)/1000;return {signalClose:t,signalOpen:t-300,side,day:iso.slice(0,10)};};
test('morning entry cutoff uses the entry open in New York, preserves DST and other markets, not exit times',()=>{
 for(const [before,at]of [['2026-06-01T14:55Z','2026-06-01T15:00Z'],['2026-01-05T15:55Z','2026-01-05T16:00Z']]){
  assert.equal(studyDecision39(signal(before),100,'mnq-before-11').accepted,true);assert.equal(studyDecision39(signal(at),100,'mnq-before-11').accepted,false);
 }
 const s=signal('2026-06-01T15:00Z'),other={symbol:'MGC',signals:new Map()},mnq={symbol:'MNQ',signals:new Map([[s.signalClose,s]]),candles:[{time:s.signalClose,day:s.day,open:100}]};
 const r=filterStudyStreams39([mnq,other],'mnq-before-11');assert.equal(r.streams[0].signals.size,0);assert.equal(mnq.signals.size,1);assert.equal(r.streams[1],other);
 assert.throws(()=>studyDecision39({...s,signalOpen:s.signalClose},100,'mnq-before-11'),/Invalid/);
});
test('Kronos veto is symmetric, neutral on equality or unavailable output, and cannot inspect future entry extremes',()=>{
 const s=signal('2026-06-01T14:10Z'),t=s.signalClose,base={status:'valid',signalClose:t,knownAt:t-600,lastClose:99};
 assert.equal(studyDecision39(s,100,'mnq-kronos',base).accepted,false);assert.equal(studyDecision39({...s,side:'Short'},100,'mnq-kronos',base).accepted,true);
 assert.equal(studyDecision39(s,100,'mnq-kronos',{...base,lastClose:100}).accepted,true);
 for(const status of ['insufficient-context','invalid-output','inference-error'])assert.equal(studyDecision39(s,100,'mnq-kronos',{signalClose:t,status}).accepted,true);
 for(const knownAt of [t+1,t-900])assert.throws(()=>studyDecision39(s,100,'mnq-kronos',{...base,knownAt}),/Future/);
 const stream={symbol:'MNQ',signals:new Map([[t,s]]),candles:[{time:t,day:s.day,open:100,high:101,low:99,close:100}]},opinions=new Map([[t,base]]),a=filterStudyStreams39([stream],'mnq-kronos',opinions);stream.candles[0].high=10000;stream.candles[0].low=1;stream.candles[0].close=200;
 assert.deepEqual(filterStudyStreams39([stream],'mnq-kronos',opinions).decisions,a.decisions);
});
test('self-review rejects a best-month-only improvement, no-effect filters and invalid models; even a descriptive pass cannot activate',()=>{
 const cells=['june','july','august'].flatMap(month=>['normal','stress'].map(cost=>({month,cost,net:10,delta:0,drawdown:10,referenceDrawdown:10,status:'incomplete'})));
 assert.equal(reviewResearchCandidate(cells).descriptiveGatePassed,false);
 const improved=cells.map(c=>({...c,delta:1}));assert.equal(reviewResearchCandidate(improved).descriptiveGatePassed,true);assert.equal(reviewResearchCandidate(improved).executionAllowed,false);assert.equal(reviewResearchCandidate(improved).selection,null);
 improved[2].delta=-1;assert.equal(reviewResearchCandidate(improved).descriptiveGatePassed,false);improved[2].delta=1;improved[4].drawdown=11;assert.equal(reviewResearchCandidate(improved).descriptiveGatePassed,false);
 assert.equal(reviewResearchCandidate(cells.map(c=>({...c,delta:1})),{qualityIssues:1}).descriptiveGatePassed,false);assert.throws(()=>reviewResearchCandidate(cells.slice(1)),/Incomplete/);
});
test('model opinions bind every output to its frozen request and verify malformed OHLC instead of trusting a flag',()=>{
 const s=signal('2026-06-01T14:10Z'),knownAt=s.signalClose-600,request={inputSha256:'abc',symbol:'MNQ',contract:'MNQM6',intervalSeconds:900,candles:Array.from({length:64},(_,i)=>({time:knownAt-(64-i)*900})),futureTimes:Array.from({length:4},(_,i)=>knownAt+i*900)},pack={schema:'jeu39-requests-v1',requests:[{id:'one',request}],links:[{day:s.day,signalClose:s.signalClose,requestId:'one'}]},result={...JEU39_MODEL,schema:'nykuto-kronos-result-v1',inputSha256:'abc',symbol:'MNQ',contract:'MNQM6',executionEnabled:false,experimentOnly:true,forecast:request.futureTimes.map(time=>({time,open:100,high:101,low:99,close:100,volume:1})),forecastValidation:{validOhlcv:true,invalidOhlcvRows:[]}},pred={schema:'jeu39-forecasts-v1',records:[{id:'one',result,error:null}]};
 assert.equal(modelOpinions39(pack,pred).summary.invalidForecasts,0);result.forecast[0].high=98;assert.throws(()=>modelOpinions39(pack,pred),/validity/);result.forecastValidation={validOhlcv:false,invalidOhlcvRows:[0]};assert.equal(modelOpinions39(pack,pred).opinions.get(s.signalClose).status,'invalid-output');result.inputSha256='bad';assert.throws(()=>modelOpinions39(pack,pred),/Unbound/);
 assert.throws(()=>modelOpinions39(pack,{...pred,records:[]}),/Missing/);
});
