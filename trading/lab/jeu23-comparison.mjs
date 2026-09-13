import assert from 'node:assert/strict';
const cents=n=>Math.round(n*100)/100;
// Account balances and refusal counters do not change the identity of a fill.
const fields=['ticker','side','day','entryTime','entry','stop','target','riskDollars','costDollars','exitTime','exit','reason','netDollars','ambiguous'];
const key=t=>JSON.stringify(fields.map(k=>t[k]));
export function compareExecutions(before,after){
  const old=new Map(before.trades.map(t=>[key(t),t])),next=new Map(after.trades.map(t=>[key(t),t]));
  assert.equal(old.size,before.trades.length);assert.equal(next.size,after.trades.length);
  const added=[...next].filter(([k])=>!old.has(k)).map(([,t])=>t),removed=[...old].filter(([k])=>!next.has(k)).map(([,t])=>t);
  const sum=trades=>cents(trades.reduce((n,t)=>n+t.netDollars,0));
  assert.equal(sum(before.trades),before.net);assert.equal(sum(after.trades),after.net);
  const deltaNet=cents(after.net-before.net),addedNet=sum(added),removedNet=sum(removed);
  assert.equal(cents(addedNet-removedNet),deltaNet);
  return {oldNet:before.net,newNet:after.net,deltaNet,unchangedCount:next.size-added.length,addedCount:added.length,removedCount:removed.length,addedNet,removedNet};
}
