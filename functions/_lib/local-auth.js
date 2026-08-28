import {
  clearSessionCookie,
  constantTimeEqual,
  csrfForSession,
  isSameOrigin,
  json,
  nowSeconds,
  parseCookies,
  randomToken,
  sha256
} from './security.js';

export const LOCAL_SESSION_COOKIE = '__Host-nykuto_local';
const SESSION_LIFETIME_SECONDS = 180 * 24 * 60 * 60;

function localSessionCookie(token, maxAgeSeconds = SESSION_LIFETIME_SECONDS) {
  return `${LOCAL_SESSION_COOKIE}=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`;
}

export function clearLocalSessionCookie() {
  return clearSessionCookie().replace('__Host-nykuto_manager', LOCAL_SESSION_COOKIE);
}

export function serializeLocalProfile(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email || '',
    whatsapp: row.whatsapp_e164,
    status: row.status,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  };
}

export async function getLocalAccess(request, env) {
  if (!env.LOCAL_DB || !env.AUTH_PEPPER) return { state: 'unavailable' };
  const rawToken = parseCookies(request)[LOCAL_SESSION_COOKIE];
  if (!rawToken || rawToken.length < 32 || rawToken.length > 128) return { state: 'missing' };

  const tokenHash = await sha256(rawToken);
  const row = await env.LOCAL_DB.prepare(`
    SELECT p.id, p.first_name, p.last_name, p.email, p.whatsapp_e164, p.status,
           p.created_at, p.updated_at, s.expires_at, s.revoked_at
    FROM local_sessions s
    JOIN local_publishers p ON p.id = s.publisher_id
    WHERE s.token_hash = ?
    LIMIT 1
  `).bind(tokenHash).first();

  if (!row || row.revoked_at || Number(row.expires_at) <= nowSeconds()) {
    if (row) await env.LOCAL_DB.prepare('DELETE FROM local_sessions WHERE token_hash = ?').bind(tokenHash).run();
    return { state: 'invalid' };
  }
  if (row.status !== 'active') return { state: 'suspended', rawToken, tokenHash };

  return {
    state: 'active',
    rawToken,
    tokenHash,
    csrfToken: await csrfForSession(rawToken, env.AUTH_PEPPER),
    profile: serializeLocalProfile(row)
  };
}

export async function createLocalSession(env, publisherId) {
  const rawToken = randomToken(40);
  const tokenHash = await sha256(rawToken);
  const now = nowSeconds();
  const expiresAt = now + SESSION_LIFETIME_SECONDS;
  await env.LOCAL_DB.prepare(`
    INSERT INTO local_sessions (token_hash, publisher_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `).bind(tokenHash, publisherId, now, expiresAt).run();
  return {
    rawToken,
    tokenHash,
    csrfToken: await csrfForSession(rawToken, env.AUTH_PEPPER),
    cookie: localSessionCookie(rawToken),
    expiresAt
  };
}

export async function requireLocalMutation(request, env) {
  const access = await getLocalAccess(request, env);
  if (access.state === 'unavailable') return { access, response: json({ ok: false, code: 'SERVICE_UNAVAILABLE', message: 'O perfil está temporariamente indisponível.' }, 503) };
  if (access.state !== 'active') return { access, response: json({ ok: false, code: 'AUTH_REQUIRED', message: 'Abra seu perfil neste aparelho para continuar.' }, 401, { 'Set-Cookie': clearLocalSessionCookie() }) };
  if (!isSameOrigin(request)) return { access, response: json({ ok: false, code: 'INVALID_ORIGIN', message: 'Origem da solicitação inválida.' }, 403) };
  const provided = request.headers.get('X-CSRF-Token') || '';
  if (!provided || !constantTimeEqual(provided, access.csrfToken)) return { access, response: json({ ok: false, code: 'INVALID_CSRF', message: 'Atualize a página e tente novamente.' }, 403) };
  return { access };
}
