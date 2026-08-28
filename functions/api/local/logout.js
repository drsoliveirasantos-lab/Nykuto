import { clearLocalSessionCookie, getLocalAccess } from '../../_lib/local-auth.js';
import { isSameOrigin, json, nowSeconds } from '../../_lib/security.js';

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ ok: false, code: 'INVALID_ORIGIN' }, 403);
  const access = await getLocalAccess(request, env);
  if (['active', 'suspended'].includes(access.state) && access.tokenHash) {
    await env.LOCAL_DB.prepare('UPDATE local_sessions SET revoked_at = ? WHERE token_hash = ?').bind(nowSeconds(), access.tokenHash).run();
  }
  return json({ ok: true }, 200, { 'Set-Cookie': clearLocalSessionCookie() });
}
