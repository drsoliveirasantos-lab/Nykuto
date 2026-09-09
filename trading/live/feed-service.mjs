import { PREFIX, PRODUCTS, FeedError, emptyStream, normalizeBar, appendBar, describeStream } from './feed-core.mjs';
const keyFor = root => PREFIX + root;
async function readStream(db, userId, root) {
  const row = await db.prepare('SELECT value, revision FROM trading_state WHERE user_id = ? AND state_key = ?').bind(userId, keyFor(root)).first();
  if (!row) return { state: emptyStream(), revision: 0 };
  try { return { state: JSON.parse(row.value), revision: row.revision }; }
  catch { throw new FeedError('État du flux illisible ; aucune donnée remplacée.', 503); }
}
export async function ingest(db, userId, input, now = Date.now()) {
  const bar = normalizeBar(input, now);
  for (let attempt = 0; attempt < 4; attempt++) {
    const { state, revision } = await readStream(db, userId, bar.root);
    const next = appendBar(state, bar, now);
    if (next.duplicate) return { accepted: true, duplicate: true, root: bar.root, endMs: bar.endMs };
    const values = JSON.stringify(next.state), time = new Date(now).toISOString();
    const result = revision === 0
      ? await db.prepare('INSERT INTO trading_state(user_id,state_key,value,revision,updated_at) VALUES(?,?,?,1,?) ON CONFLICT(user_id,state_key) DO NOTHING').bind(userId,keyFor(bar.root),values,time).run()
      : await db.prepare('UPDATE trading_state SET value = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND state_key = ? AND revision = ?').bind(values,time,userId,keyFor(bar.root),revision).run();
    if (result.meta.changes === 1) return { accepted: true, duplicate: false, root: bar.root, endMs: bar.endMs };
  }
  throw new FeedError('Écriture concurrente ; réessaie la même bougie sans la modifier.', 409);
}
export async function receptionStatus(db, userId, now = Date.now()) {
  const streams = await Promise.all(Object.keys(PRODUCTS).map(async root => describeStream(root, (await readStream(db,userId,root)).state,now)));
  return { version: 1, userId, serverTime: now, storageReady: true, streams,
    sourceVerified: false, paperEnabled: false, shadowEnabled: false, ordersEnabled: false,
    scope: 'read-only-minute-reception', retentionPerMarket: 120 };
}
// Dependency injection keeps the transport testable; production uses the existing signed membership guard.
export function createHandler({ member, mutation, body, json, handle, AccountError }) {
  return context => handle(async () => {
    const user = await member(context);
    if (user.role !== 'owner') throw new AccountError('La préparation du flux est réservée au propriétaire du site.', 403);
    const db = context.env.TRADING_USERS;
    try {
      if (context.request.method === 'GET') return json(await receptionStatus(db,user.id));
      if (context.request.method !== 'POST') throw new FeedError('Méthode non autorisée.', 405);
      mutation(context.request,user);
      const input = await body(context.request,4096);
      if (input.action === 'probe' && Object.keys(input).length === 1) {
        await receptionStatus(db,user.id);
        return json({ transportReady: true, providerConnected: false, wroteMarketData: false, paperEnabled: false, ordersEnabled: false });
      }
      if (input.action !== 'bar' || Object.keys(input).length !== 2 || !Object.hasOwn(input,'bar')) throw new FeedError('Action non autorisée.');
      return json(await ingest(db,user.id,input.bar));
    } catch (error) {
      if (error instanceof FeedError) throw new AccountError(error.message,error.status);
      throw error;
    }
  });
}
