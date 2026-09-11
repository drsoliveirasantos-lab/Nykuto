import { member, mutation, body, validateState, handle, json, AccountError } from '../../../account/account-service.mjs';
export const onRequest = context => handle(async () => {
  const user = await member(context), db = context.env.TRADING_USERS;
  if (context.request.method === 'GET') {
    const rows = await db.prepare('SELECT state_key, value, revision FROM trading_state WHERE user_id = ?').bind(user.id).all();
    return json({ userId: user.id, states: rows.results.map(row => ({ key: row.state_key, value: JSON.parse(row.value), revision: row.revision })) });
  }
  if (context.request.method !== 'PUT') throw new AccountError('Méthode non autorisée.', 405);
  mutation(context.request, user);
  const input = await body(context.request);
  if (Object.keys(input).some(k => !['key', 'value', 'revision'].includes(k))) throw new AccountError('Champ non autorisé.');
  const encoded = validateState(input.key, input.value);
  if (!Number.isSafeInteger(input.revision) || input.revision < 0) throw new AccountError('Version invalide.');
  const now = new Date().toISOString();
  const result = input.revision === 0
    ? await db.prepare('INSERT INTO trading_state(user_id, state_key, value, revision, updated_at) VALUES(?,?,?,1,?) ON CONFLICT(user_id,state_key) DO NOTHING').bind(user.id, input.key, encoded, now).run()
    : await db.prepare('UPDATE trading_state SET value = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND state_key = ? AND revision = ?').bind(encoded, now, user.id, input.key, input.revision).run();
  if (result.meta.changes !== 1) throw new AccountError('Une autre page a modifié ces données. Copie ta saisie, puis recharge pour éviter de remplacer son travail.', 409);
  return json({ saved: true, revision: input.revision + 1 });
});
