import {
  constantTimeEqual,
  credentialDigest,
  csrfForSession,
  isSameOrigin,
  json,
  nowSeconds,
  randomToken,
  readJson,
  sessionCookie,
  sha256
} from '../../_lib/security.js';

const LOGIN_WINDOW_SECONDS = 15 * 60;
const MAX_FAILURES = 5;
const SESSION_SECONDS = 7 * 24 * 60 * 60;

async function registerFailure(env, attemptKey, now) {
  await env.DB.prepare(`
    INSERT INTO auth_attempts (attempt_key, window_started_at, failure_count, locked_until)
    VALUES (?, ?, 1, NULL)
    ON CONFLICT(attempt_key) DO UPDATE SET
      window_started_at = CASE
        WHEN excluded.window_started_at - auth_attempts.window_started_at >= ${LOGIN_WINDOW_SECONDS} THEN excluded.window_started_at
        ELSE auth_attempts.window_started_at
      END,
      failure_count = CASE
        WHEN excluded.window_started_at - auth_attempts.window_started_at >= ${LOGIN_WINDOW_SECONDS} THEN 1
        ELSE auth_attempts.failure_count + 1
      END,
      locked_until = CASE
        WHEN (CASE
          WHEN excluded.window_started_at - auth_attempts.window_started_at >= ${LOGIN_WINDOW_SECONDS} THEN 1
          ELSE auth_attempts.failure_count + 1
        END) >= ${MAX_FAILURES} THEN excluded.window_started_at + ${LOGIN_WINDOW_SECONDS}
        ELSE NULL
      END
  `).bind(attemptKey, now).run();
}

export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.AUTH_PEPPER) return json({ ok: false, code: 'SERVICE_UNAVAILABLE', message: 'A área de gestão está temporariamente indisponível.' }, 503);
  if (!isSameOrigin(request)) return json({ ok: false, code: 'INVALID_ORIGIN', message: 'Origem da solicitação inválida.' }, 403);

  let body;
  try {
    body = await readJson(request, 4096);
  } catch (error) {
    const status = error.message === 'PAYLOAD_TOO_LARGE' ? 413 : error.message === 'UNSUPPORTED_MEDIA_TYPE' ? 415 : 400;
    return json({ ok: false, code: error.message, message: 'Não foi possível ler os dados de acesso.' }, status);
  }

  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!/^[a-z0-9._-]{3,80}$/.test(username) || password.length < 12 || password.length > 160) {
    return json({ ok: false, code: 'INVALID_CREDENTIALS', message: 'Usuário ou código incorretos.' }, 401);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const attemptKey = await sha256(`login:v1:${username}:${ip}`);
  const now = nowSeconds();
  const attempt = await env.DB.prepare('SELECT window_started_at, failure_count, locked_until FROM auth_attempts WHERE attempt_key = ?').bind(attemptKey).first();
  if (attempt?.locked_until && Number(attempt.locked_until) > now) {
    const retryAfter = Number(attempt.locked_until) - now;
    return json({ ok: false, code: 'TOO_MANY_ATTEMPTS', message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, 429, { 'Retry-After': String(retryAfter) });
  }

  const user = await env.DB.prepare(`
    SELECT id, username, display_name, role, credential_digest, credential_salt, status
    FROM users
    WHERE username = ?
    LIMIT 1
  `).bind(username).first();
  const fallbackSalt = 'invalid-access-salt';
  const candidateDigest = await credentialDigest(
    username,
    password,
    env.AUTH_PEPPER,
    user?.credential_salt || fallbackSalt
  );
  const validCredential = Boolean(user && constantTimeEqual(candidateDigest, user.credential_digest));
  if (!validCredential || user.status !== 'active') {
    await registerFailure(env, attemptKey, now);
    return json({ ok: false, code: 'INVALID_CREDENTIALS', message: 'Usuário ou código incorretos.' }, 401);
  }

  const pass = await env.DB.prepare(`
    SELECT id, starts_at, expires_at
    FROM access_passes
    WHERE user_id = ? AND status = 'active' AND starts_at <= ? AND expires_at > ?
    ORDER BY expires_at DESC
    LIMIT 1
  `).bind(user.id, now, now).first();
  if (!pass) {
    const latestPass = await env.DB.prepare('SELECT id, starts_at, expires_at FROM access_passes WHERE user_id = ? ORDER BY expires_at DESC LIMIT 1').bind(user.id).first();
    return json({ ok: false, code: 'PASS_EXPIRED', message: 'Seu passe não está ativo.', pass: latestPass || null }, 403);
  }

  const rawToken = randomToken(32);
  const tokenHash = await sha256(rawToken);
  const sessionExpiresAt = Math.min(now + SESSION_SECONDS, Number(pass.expires_at));
  await env.DB.batch([
    env.DB.prepare('DELETE FROM auth_attempts WHERE attempt_key = ?').bind(attemptKey),
    env.DB.prepare('DELETE FROM auth_attempts WHERE window_started_at < ?').bind(now - 24 * 60 * 60),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND (expires_at <= ? OR revoked_at IS NOT NULL)').bind(user.id, now),
    env.DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(tokenHash, user.id, now, sessionExpiresAt),
    env.DB.prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?').bind(now, now, user.id),
    env.DB.prepare("INSERT INTO audit_log (user_id, action, entity_type, entity_id, created_at) VALUES (?, 'login', 'session', ?, ?)").bind(user.id, tokenHash.slice(0, 12), now)
  ]);

  const csrfToken = await csrfForSession(rawToken, env.AUTH_PEPPER);
  return json({
    ok: true,
    user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role },
    pass: { id: pass.id, startsAt: Number(pass.starts_at), expiresAt: Number(pass.expires_at) },
    csrfToken
  }, 200, { 'Set-Cookie': sessionCookie(rawToken, sessionExpiresAt - now) });
}
