import { member, publicProfile, mutation, body, boundedText, handle, json, AccountError } from '../../../account/account-service.mjs';
export const onRequest = context => handle(async () => {
  const user = await member(context, false);
  if (context.request.method === 'GET') return json({ user: publicProfile(user) });
  if (context.request.method !== 'PUT') throw new AccountError('Méthode non autorisée.', 405);
  mutation(context.request, user);
  const input = await body(context.request, 4096);
  if (Object.keys(input).some(k => !['firstName', 'lastName'].includes(k))) throw new AccountError('Champ non autorisé.');
  const first = boundedText(input.firstName, 80, 'Prénom'), last = boundedText(input.lastName, 80, 'Nom');
  await context.env.TRADING_USERS.prepare('UPDATE trading_users SET first_name = ?, last_name = ?, updated_at = ? WHERE id = ? AND active = 1').bind(first, last, new Date().toISOString(), user.id).run();
  return json({ user: publicProfile({ ...user, first_name: first, last_name: last }) });
});
