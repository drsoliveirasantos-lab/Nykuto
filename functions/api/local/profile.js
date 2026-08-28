import {
  clearLocalSessionCookie,
  createLocalSession,
  getLocalAccess,
  requireLocalMutation,
  serializeLocalProfile
} from '../../_lib/local-auth.js';
import {
  cleanEmail,
  cleanLocalText,
  consumeRateLimit,
  normalizeLocalWhatsapp,
  requestIdentity,
  serializeLocalListing
} from '../../_lib/local-marketplace.js';
import { isSameOrigin, json, nowSeconds, readJson } from '../../_lib/security.js';
import { verifyTurnstile } from '../../_lib/turnstile.js';

function validateProfile(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const firstName = cleanLocalText(body.firstName, 2, 50);
  const lastName = cleanLocalText(body.lastName, 2, 60);
  const email = cleanEmail(body.email);
  const whatsapp = normalizeLocalWhatsapp(body.whatsapp);
  const contactConsent = body.contactConsent === true;
  if (!firstName || !lastName || email === null || !whatsapp || !contactConsent) return null;
  return { firstName, lastName, email, whatsapp };
}

async function ownerListings(env, publisherId) {
  const result = await env.LOCAL_DB.prepare(`
    SELECT l.*, p.first_name, p.last_name, p.whatsapp_e164,
           m.id AS cover_media_id, m.mime_type AS cover_mime_type
    FROM local_listings l
    JOIN local_publishers p ON p.id = l.owner_publisher_id
    LEFT JOIN local_listing_media m ON m.id = (
      SELECT lm.id FROM local_listing_media lm
      WHERE lm.listing_id = l.id ORDER BY lm.sort_order ASC, lm.id ASC LIMIT 1
    )
    WHERE l.owner_publisher_id = ? AND l.status != 'deleted'
    ORDER BY l.updated_at DESC
  `).bind(publisherId).all();
  return (result.results || []).map((row) => serializeLocalListing(row, { ownerView: true }));
}

export async function onRequestGet({ request, env }) {
  const access = await getLocalAccess(request, env);
  if (access.state === 'unavailable') return json({ ok: false, code: 'SERVICE_UNAVAILABLE', message: 'O perfil está temporariamente indisponível.' }, 503);
  if (access.state !== 'active') return json({ ok: true, authenticated: false, profile: null, listings: [] }, 200, access.state === 'invalid' ? { 'Set-Cookie': clearLocalSessionCookie() } : {});
  return json({
    ok: true,
    authenticated: true,
    profile: access.profile,
    csrfToken: access.csrfToken,
    listings: await ownerListings(env, access.profile.id)
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.LOCAL_DB || !env.AUTH_PEPPER) return json({ ok: false, code: 'SERVICE_UNAVAILABLE', message: 'O cadastro está temporariamente indisponível.' }, 503);
  if (!isSameOrigin(request)) return json({ ok: false, code: 'INVALID_ORIGIN', message: 'Origem da solicitação inválida.' }, 403);
  const existing = await getLocalAccess(request, env);
  if (existing.state === 'active') return json({ ok: false, code: 'ALREADY_AUTHENTICATED', message: 'Seu perfil já está ativo neste aparelho.' }, 409);

  let body;
  try { body = await readJson(request, 8192); } catch (error) { return json({ ok: false, code: error.message, message: 'Dados inválidos.' }, 400); }
  const profile = validateProfile(body);
  if (!profile) return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Confira nome, WhatsApp internacional, e-mail e autorização de contato.' }, 422);
  const challenge = await verifyTurnstile(request, env, body.turnstileToken);
  if (!challenge.ok) return json({ ok: false, code: challenge.code, message: 'Não foi possível confirmar que você é uma pessoa. Atualize o desafio e tente novamente.' }, 403);
  const rateKey = await requestIdentity(request, env, 'profile-create');
  if (!await consumeRateLimit(env.LOCAL_DB, rateKey, 5, 60 * 60)) return json({ ok: false, code: 'RATE_LIMITED', message: 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.' }, 429);

  const now = nowSeconds();
  const publisherId = `pub_${crypto.randomUUID()}`;
  let session;
  try {
    await env.LOCAL_DB.prepare(`
      INSERT INTO local_publishers (
        id, first_name, last_name, email, whatsapp_e164, status,
        contact_consent_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)
    `).bind(publisherId, profile.firstName, profile.lastName, profile.email || null, profile.whatsapp, now, now, now).run();
    session = await createLocalSession(env, publisherId);
  } catch (_) {
    await env.LOCAL_DB.prepare('DELETE FROM local_publishers WHERE id = ?').bind(publisherId).run();
    return json({ ok: false, code: 'PROFILE_CREATION_FAILED', message: 'Não foi possível criar o perfil agora.' }, 500);
  }
  const row = await env.LOCAL_DB.prepare('SELECT * FROM local_publishers WHERE id = ?').bind(publisherId).first();
  return json({
    ok: true,
    authenticated: true,
    profile: serializeLocalProfile(row),
    csrfToken: session.csrfToken,
    listings: []
  }, 201, { 'Set-Cookie': session.cookie });
}

export async function onRequestPatch({ request, env }) {
  const resolved = await requireLocalMutation(request, env);
  if (resolved.response) return resolved.response;
  let body;
  try { body = await readJson(request, 8192); } catch (error) { return json({ ok: false, code: error.message, message: 'Dados inválidos.' }, 400); }
  const profile = validateProfile(body);
  if (!profile) return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Confira nome, WhatsApp internacional, e-mail e autorização de contato.' }, 422);
  const now = nowSeconds();
  const row = await env.LOCAL_DB.prepare(`
    UPDATE local_publishers SET first_name = ?, last_name = ?, email = ?, whatsapp_e164 = ?,
      contact_consent_at = ?, updated_at = ?
    WHERE id = ?
    RETURNING *
  `).bind(profile.firstName, profile.lastName, profile.email || null, profile.whatsapp, now, now, resolved.access.profile.id).first();
  return json({ ok: true, profile: serializeLocalProfile(row), csrfToken: resolved.access.csrfToken });
}

export async function onRequestDelete({ request, env }) {
  const resolved = await requireLocalMutation(request, env);
  if (resolved.response) return resolved.response;
  const media = await env.LOCAL_DB.prepare(`
    SELECT m.object_key FROM local_listing_media m
    JOIN local_listings l ON l.id = m.listing_id
    WHERE l.owner_publisher_id = ? AND m.storage_type = 'r2' AND m.object_key IS NOT NULL
  `).bind(resolved.access.profile.id).all();
  if (env.LOCAL_MEDIA) {
    const keys = (media.results || []).map((row) => row.object_key).filter(Boolean);
    if (keys.length) await env.LOCAL_MEDIA.delete(keys);
  }
  await env.LOCAL_DB.prepare('DELETE FROM local_publishers WHERE id = ?').bind(resolved.access.profile.id).run();
  return json({ ok: true }, 200, { 'Set-Cookie': clearLocalSessionCookie() });
}
