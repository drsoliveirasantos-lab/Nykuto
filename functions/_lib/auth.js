import {
  SESSION_COOKIE,
  clearSessionCookie,
  constantTimeEqual,
  csrfForSession,
  isSameOrigin,
  json,
  nowSeconds,
  parseCookies,
  sha256
} from './security.js';

export async function getAccessState(request, env) {
  if (!env.DB || !env.AUTH_PEPPER) return { state: 'unavailable' };

  const rawToken = parseCookies(request)[SESSION_COOKIE];
  if (!rawToken || rawToken.length < 32 || rawToken.length > 128) return { state: 'missing' };

  const tokenHash = await sha256(rawToken);
  const session = await env.DB.prepare(`
    SELECT
      s.token_hash,
      s.user_id,
      s.expires_at AS session_expires_at,
      s.revoked_at,
      u.username,
      u.display_name,
      u.role,
      u.last_login_at,
      u.status AS user_status
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?
    LIMIT 1
  `).bind(tokenHash).first();

  const now = nowSeconds();
  if (!session || session.revoked_at || Number(session.session_expires_at) <= now) {
    if (session) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
    return { state: 'invalid' };
  }
  const csrfToken = await csrfForSession(rawToken, env.AUTH_PEPPER);
  const sessionIdentity = { rawToken, tokenHash, csrfToken };
  if (session.user_status !== 'active') return { state: 'suspended', user: session, ...sessionIdentity };

  const pass = await env.DB.prepare(`
    SELECT id, starts_at, expires_at, status
    FROM access_passes
    WHERE user_id = ? AND status = 'active' AND starts_at <= ? AND expires_at > ?
    ORDER BY expires_at DESC
    LIMIT 1
  `).bind(session.user_id, now, now).first();

  if (!pass) {
    const latestPass = await env.DB.prepare(`
      SELECT id, starts_at, expires_at, status
      FROM access_passes
      WHERE user_id = ?
      ORDER BY expires_at DESC
      LIMIT 1
    `).bind(session.user_id).first();
    return { state: 'pass_expired', user: session, pass: latestPass, ...sessionIdentity };
  }

  return {
    state: 'active',
    rawToken,
    tokenHash,
    user: {
      id: session.user_id,
      username: session.username,
      displayName: session.display_name,
      role: session.role,
      lastLoginAt: session.last_login_at ? Number(session.last_login_at) : null
    },
    pass: {
      id: pass.id,
      startsAt: Number(pass.starts_at),
      expiresAt: Number(pass.expires_at)
    },
    csrfToken
  };
}

export function accessError(access) {
  if (access.state === 'unavailable') return json({ ok: false, code: 'SERVICE_UNAVAILABLE', message: 'A área de gestão está temporariamente indisponível.' }, 503);
  if (access.state === 'pass_expired') return json({ ok: false, code: 'PASS_EXPIRED', message: 'Este passe expirou.', pass: access.pass || null }, 403);
  if (access.state === 'suspended') return json({ ok: false, code: 'ACCOUNT_SUSPENDED', message: 'Este acesso está suspenso.' }, 403);
  return json({ ok: false, code: 'AUTH_REQUIRED', message: 'Faça login para continuar.' }, 401, { 'Set-Cookie': clearSessionCookie() });
}

export async function requireActiveAccess(request, env) {
  const access = await getAccessState(request, env);
  return access.state === 'active' ? { access } : { access, response: accessError(access) };
}

export async function requireMutationAccess(request, env) {
  const resolved = await requireActiveAccess(request, env);
  if (resolved.response) return resolved;
  if (!isSameOrigin(request)) {
    return { access: resolved.access, response: json({ ok: false, code: 'INVALID_ORIGIN', message: 'Origem da solicitação inválida.' }, 403) };
  }
  const provided = request.headers.get('X-CSRF-Token') || '';
  if (!provided || !constantTimeEqual(provided, resolved.access.csrfToken)) {
    return { access: resolved.access, response: json({ ok: false, code: 'INVALID_CSRF', message: 'Atualize a página e tente novamente.' }, 403) };
  }
  return resolved;
}
