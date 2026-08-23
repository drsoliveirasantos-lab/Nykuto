import { getAccessState, accessError } from '../../_lib/auth.js';
import { json } from '../../_lib/security.js';

export async function onRequestGet({ request, env }) {
  const access = await getAccessState(request, env);
  if (access.state !== 'active') return accessError(access);
  return json({ ok: true, user: access.user, pass: access.pass, csrfToken: access.csrfToken });
}
