import { getAccessState } from '../../_lib/auth.js';
import { clearSessionCookie, isSameOrigin, json } from '../../_lib/security.js';

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ ok: false, code: 'INVALID_ORIGIN' }, 403);
  const access = await getAccessState(request, env);
  if (env.DB && access.rawToken && access.tokenHash) {
    await env.DB.prepare('UPDATE sessions SET revoked_at = ? WHERE token_hash = ?').bind(Math.floor(Date.now() / 1000), access.tokenHash).run();
  }
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
}
