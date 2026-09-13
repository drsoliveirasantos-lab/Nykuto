import test from 'node:test';
import assert from 'node:assert/strict';
import {VARIANTS,accepts,monthlyArchive} from '../trading/lab/jeu27-diagnostic.mjs';
test('ablations remove only their specified condition and never infer missing required context',()=>{
  const all={trend:true,structure:true,momentum:true,volume:true,pattern:true};
  assert.equal(accepts({...all,volume:false},VARIANTS[0]),true);
  assert.equal(accepts({...all,pattern:false},VARIANTS[0]),false);
  assert.equal(accepts({...all,pattern:false},VARIANTS[1]),true);
  assert.equal(accepts({...all,volume:undefined},VARIANTS[1]),false);
  assert.equal(accepts({trend:true},VARIANTS[2]),true);
  assert.equal(accepts({},VARIANTS[2]),false);
});
test('monthly diagnostic ignores overlapping window/account copies and reconciles trading days',()=>{
  const trades=['05','06','07','08'].map(m=>({day:`2026-${m}-01`,netDollars:10,costDollars:3,reason:'Target'}));
  const run={trades,days:trades.map(t=>({day:t.day,net:10,trades:1}))};
  const make=factor=>({factor,account:false,period:{start:'2026-05-01',end:'2026-09-01'},run});
  const data={runs:[make(1),make(2),{...make(1),account:true},{...make(1),period:{start:'2026-07-01',end:'2026-09-01'}}]};
  const result=monthlyArchive(data);assert.equal(result.length,2);assert.equal(result[0].months.reduce((n,m)=>n+m.net,0),40);
  assert.equal(result[0].months[0].gross,13);
  const broken=structuredClone(data);broken.runs[0].run.days[0].net=9;assert.throws(()=>monthlyArchive(broken),/mismatch/);
});
