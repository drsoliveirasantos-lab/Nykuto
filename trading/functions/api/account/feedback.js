import { member, mutation, body, boundedText, handle, json, AccountError } from '../../../account/account-service.mjs';
export const onRequest = context => handle(async () => {
  const user = await member(context), db = context.env.TRADING_USERS, method = context.request.method;
  if (method === 'GET') {
    const offset = Math.min(100000, Math.max(0, Number.parseInt(new URL(context.request.url).searchParams.get('offset') || '0', 10) || 0));
    const base = 'SELECT f.id, f.user_id, f.category, f.page, f.message, f.status, f.response, f.created_at, f.updated_at, u.first_name, u.last_name FROM trading_feedback f JOIN trading_users u ON u.id = f.user_id';
    const rows = user.role === 'owner'
      ? await db.prepare(base + ' ORDER BY f.created_at DESC LIMIT 51 OFFSET ?').bind(offset).all()
      : await db.prepare(base + ' WHERE f.user_id = ? ORDER BY f.created_at DESC LIMIT 51 OFFSET ?').bind(user.id, offset).all();
    return json({ feedback: rows.results.slice(0, 50), hasMore: rows.results.length > 50, offset });
  }
  if (!['POST', 'PATCH'].includes(method)) throw new AccountError('Méthode non autorisée.', 405);
  mutation(context.request, user); const input = await body(context.request, 12000), now = new Date().toISOString();
  if (method === 'PATCH') {
    if (user.role !== 'owner') throw new AccountError('Le suivi est réservé au responsable du site.', 403);
    if (!['new', 'reviewing', 'done'].includes(input.status)) throw new AccountError('Statut invalide.');
    const result = await db.prepare('UPDATE trading_feedback SET status = ?, response = ?, updated_at = ? WHERE id = ?').bind(input.status, boundedText(input.response, 2000, 'Réponse', false), now, boundedText(input.id, 100, 'Référence')).run();
    if (!result.meta.changes) throw new AccountError('Retour introuvable.', 404);
    return json({ saved: true });
  }
  if (!['bug', 'confusing', 'idea', 'connection'].includes(input.category)) throw new AccountError('Catégorie invalide.');
  const id = boundedText(input.id, 100, 'Référence'), message = boundedText(input.message, 3000, 'Description'), page = boundedText(input.page, 120, 'Page');
  if (!/^\/[a-zA-Z0-9/_#-]*$/.test(page)) throw new AccountError('Indique uniquement le chemin de la page.');
  const prior = await db.prepare('SELECT user_id, message FROM trading_feedback WHERE id = ?').bind(id).first();
  if (prior) { if (prior.user_id === user.id && prior.message === message) return json({ saved: true, id }); throw new AccountError('Référence déjà utilisée.', 409); }
  const count = await db.prepare('SELECT COUNT(*) AS n FROM trading_feedback WHERE user_id = ? AND created_at >= ?').bind(user.id, new Date(Date.now() - 86400000).toISOString()).first();
  if (count.n >= 30) throw new AccountError('Limite de 30 retours par jour atteinte.', 429);
  await db.prepare('INSERT INTO trading_feedback(id,user_id,category,page,message,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').bind(id, user.id, input.category, page, message, now, now).run();
  return json({ saved: true, id }, 201);
});
