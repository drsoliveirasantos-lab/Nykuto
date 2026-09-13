const cents=n=>Math.round(n*100)/100,sum=a=>cents(a.reduce((s,t)=>s+t.netDollars,0));
const key=t=>[t.symbol,t.side,t.entryTime].join('/');
export function compareExecutions(reference,candidate,symbol=null){
 const a=new Map(reference.trades.map(t=>[key(t),t])),b=new Map(candidate.trades.map(t=>[key(t),t]));
 if(a.size!==reference.trades.length||b.size!==candidate.trades.length)throw Error('Duplicate execution');
 const common=[...a].filter(([k])=>b.has(k)).map(([k,t])=>({before:t,after:b.get(k)})),removed=[...a].filter(([k])=>!b.has(k)).map(([,t])=>t),added=[...b].filter(([k])=>!a.has(k)).map(([,t])=>t);
 const delta=cents(candidate.net-reference.net),commonDelta=cents(common.reduce((n,t)=>n+t.after.netDollars-t.before.netDollars,0)),removedNet=sum(removed),addedNet=sum(added);
 if(cents(commonDelta-removedNet+addedNet)!==delta)throw Error('Exit comparison does not reconcile');
 const target=common.filter(t=>!symbol||t.before.symbol===symbol),mean=(ts,field)=>ts.length?cents(ts.reduce((n,t)=>n+(t[field].exitTime-t[field].entryTime)/60,0)/ts.length):null;
 return {delta,commonTrades:common.length,commonDelta,removedTrades:removed.length,removedNet,addedTrades:added.length,addedNet,
  targetedCommon:target.length,winnersToLosers:target.filter(t=>t.before.netDollars>0&&t.after.netDollars<0).length,
  improved:target.filter(t=>t.after.netDollars>t.before.netDollars).length,worsened:target.filter(t=>t.after.netDollars<t.before.netDollars).length,
  meanDurationBeforeLowerMinutes:mean(target,'before'),meanDurationAfterLowerMinutes:mean(target,'after')};
}
