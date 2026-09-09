import assert from 'node:assert/strict';
const cents = n => Math.round(n * 100) / 100;
const key = t => JSON.stringify([t.ticker, t.side, t.day, t.entryTime, t.entry, t.riskDollars, t.costDollars, t.target]);
export function compareProtection(before, after) {
  const old = new Map(before.trades.map(t => [key(t), t])), next = new Map(after.trades.map(t => [key(t), t]));
  assert.equal(old.size, before.trades.length); assert.equal(next.size, after.trades.length);
  const shared = [...next].filter(([k]) => old.has(k)).map(([k, t]) => ({ before: old.get(k), after: t, delta: cents(t.netDollars - old.get(k).netDollars) }));
  const added = [...next].filter(([k]) => !old.has(k)).map(([, t]) => t);
  const removed = [...old].filter(([k]) => !next.has(k)).map(([, t]) => t);
  const sum = trades => cents(trades.reduce((n, t) => n + t.netDollars, 0));
  assert.equal(sum(before.trades), before.net); assert.equal(sum(after.trades), after.net);
  const sharedDelta = cents(shared.reduce((n, t) => n + t.delta, 0)), addedNet = sum(added), removedNet = sum(removed), deltaNet = cents(after.net - before.net);
  assert.equal(cents(sharedDelta + addedNet - removedNet), deltaNet);
  return { sharedEntries: shared.length, changedExits: shared.filter(t => t.before.exitTime !== t.after.exitTime || t.before.exit !== t.after.exit || t.before.reason !== t.after.reason).length,
    improved: shared.filter(t => t.delta > 0).length, worsened: shared.filter(t => t.delta < 0).length, sameNet: shared.filter(t => t.delta === 0).length,
    improvedDollars: cents(shared.filter(t => t.delta > 0).reduce((n, t) => n + t.delta, 0)), worsenedDollars: cents(shared.filter(t => t.delta < 0).reduce((n, t) => n + t.delta, 0)),
    sharedDelta, addedEntries: added.length, removedEntries: removed.length, addedNet, removedNet, oldNet: before.net, newNet: after.net, deltaNet };
}
