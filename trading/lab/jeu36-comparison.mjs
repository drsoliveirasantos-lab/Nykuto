const cents=n=>Math.round(n*100)/100;
// Match the ORIGINAL setup as well as unchanged timestamps. A delayed entry
// must not be described as an unrelated new trade when the retest is the same.
export function compareEntryRuns(reference,candidate){
 const key=t=>`${t.symbol}/${t.side}/${t.originalSignalClose??t.entryTime}`;
 const before=new Map(reference.trades.map(t=>[key(t),t])),after=new Map(candidate.trades.map(t=>[key(t),t]));
 if(before.size!==reference.trades.length||after.size!==candidate.trades.length)throw Error('Duplicate original setup');
 const common=candidate.trades.filter(t=>before.has(key(t))),removed=reference.trades.filter(t=>!after.has(key(t))),added=candidate.trades.filter(t=>!before.has(key(t)));
 const summary=rows=>({count:rows.length,wins:rows.filter(t=>t.netDollars>0).length,losses:rows.filter(t=>t.netDollars<0).length,net:cents(rows.reduce((n,t)=>n+t.netDollars,0))});
 const r={common:common.length,delayedCommon:common.filter(t=>t.entryTime!==before.get(key(t)).entryTime).length,
  commonDelta:cents(common.reduce((n,t)=>n+t.netDollars-before.get(key(t)).netDollars,0)),removed:summary(removed),added:summary(added),delta:cents(candidate.net-reference.net),
  winnersToLosers:common.filter(t=>before.get(key(t)).netDollars>0&&t.netDollars<0).length,losersToWinners:common.filter(t=>before.get(key(t)).netDollars<0&&t.netDollars>0).length};
 if(cents(r.commonDelta-r.removed.net+r.added.net)!==r.delta)throw Error('Entry attribution does not reconcile');
 return r;
}
