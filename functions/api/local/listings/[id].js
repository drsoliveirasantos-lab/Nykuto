import { getLocalAccess, requireLocalMutation } from '../../../_lib/local-auth.js';
import { LOCAL_STATUSES, serializeLocalListing } from '../../../_lib/local-marketplace.js';
import { json, nowSeconds, readJson } from '../../../_lib/security.js';

async function fetchListing(env, id) {
  return env.LOCAL_DB.prepare(`
    SELECT l.*, p.first_name, p.last_name, p.whatsapp_e164, p.status AS publisher_status
    FROM local_listings l
    JOIN local_publishers p ON p.id = l.owner_publisher_id
    WHERE l.id = ? LIMIT 1
  `).bind(id).first();
}

async function fetchMedia(env, id) {
  const result = await env.LOCAL_DB.prepare(`
    SELECT id, mime_type FROM local_listing_media
    WHERE listing_id = ? ORDER BY sort_order ASC, id ASC
  `).bind(id).all();
  return (result.results || []).map((row) => ({ id: row.id, mimeType: row.mime_type }));
}

export async function onRequestGet({ request, env, params }) {
  if (!env.LOCAL_DB) return json({ ok: false, code: 'SERVICE_UNAVAILABLE' }, 503);
  const row = await fetchListing(env, params.id);
  if (!row) return json({ ok: false, code: 'NOT_FOUND', message: 'Anúncio não encontrado.' }, 404);
  const access = await getLocalAccess(request, env);
  const ownerView = access.state === 'active' && access.profile.id === row.owner_publisher_id;
  const publiclyVisible = row.status === 'published'
    && row.publisher_status === 'active'
    && Number(row.expires_at) > nowSeconds();
  if (!ownerView && !publiclyVisible) return json({ ok: false, code: 'NOT_FOUND', message: 'Este anúncio não está disponível.' }, 404);
  const listing = serializeLocalListing(row, { ownerView, media: await fetchMedia(env, row.id) });
  return json({ ok: true, listing, ownerView, csrfToken: ownerView ? access.csrfToken : undefined }, 200, ownerView ? {} : { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' });
}

export async function onRequestPatch({ request, env, params }) {
  const resolved = await requireLocalMutation(request, env);
  if (resolved.response) return resolved.response;
  let body;
  try { body = await readJson(request, 4096); } catch (error) { return json({ ok: false, code: error.message, message: 'Ação inválida.' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ ok: false, code: 'INVALID_JSON', message: 'Ação inválida.' }, 400);
  const nextStatus = LOCAL_STATUSES.has(body.status) ? body.status : null;
  if (!['published', 'paused', 'sold'].includes(nextStatus)) return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Escolha um estado válido.' }, 422);
  const current = await fetchListing(env, params.id);
  if (!current || current.owner_publisher_id !== resolved.access.profile.id || current.status === 'deleted') return json({ ok: false, code: 'NOT_FOUND', message: 'Anúncio não encontrado.' }, 404);
  if (current.status === 'hidden') return json({ ok: false, code: 'MODERATION_HOLD', message: 'Este anúncio foi ocultado após sinalizações e não pode ser reativado pelo perfil.' }, 403);
  const now = nowSeconds();
  const expiresAt = nextStatus === 'published' ? now + 45 * 24 * 60 * 60 : Number(current.expires_at);
  await env.LOCAL_DB.prepare('UPDATE local_listings SET status = ?, expires_at = ?, updated_at = ? WHERE id = ? AND owner_publisher_id = ?')
    .bind(nextStatus, expiresAt, now, params.id, resolved.access.profile.id).run();
  const row = await fetchListing(env, params.id);
  return json({ ok: true, listing: serializeLocalListing(row, { ownerView: true, media: await fetchMedia(env, params.id) }) });
}

export async function onRequestDelete({ request, env, params }) {
  const resolved = await requireLocalMutation(request, env);
  if (resolved.response) return resolved.response;
  const current = await fetchListing(env, params.id);
  if (!current || current.owner_publisher_id !== resolved.access.profile.id) return json({ ok: false, code: 'NOT_FOUND', message: 'Anúncio não encontrado.' }, 404);
  const media = await env.LOCAL_DB.prepare("SELECT object_key FROM local_listing_media WHERE listing_id = ? AND storage_type = 'r2' AND object_key IS NOT NULL").bind(params.id).all();
  if (env.LOCAL_MEDIA) {
    const keys = (media.results || []).map((row) => row.object_key).filter(Boolean);
    if (keys.length) await env.LOCAL_MEDIA.delete(keys);
  }
  await env.LOCAL_DB.prepare('DELETE FROM local_listing_media WHERE listing_id = ?').bind(params.id).run();
  await env.LOCAL_DB.prepare('DELETE FROM local_listings WHERE id = ? AND owner_publisher_id = ?').bind(params.id, resolved.access.profile.id).run();
  return json({ ok: true });
}
