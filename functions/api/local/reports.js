import { consumeRateLimit, requestIdentity } from '../../_lib/local-marketplace.js';
import { isSameOrigin, json, nowSeconds, readJson } from '../../_lib/security.js';
import { verifyTurnstile } from '../../_lib/turnstile.js';

const reasons = new Set(['fraud', 'prohibited', 'duplicate', 'unavailable', 'wrong_contact', 'other']);

export async function onRequestPost({ request, env }) {
  if (!env.LOCAL_DB || !env.AUTH_PEPPER) return json({ ok: false, code: 'SERVICE_UNAVAILABLE' }, 503);
  if (!isSameOrigin(request)) return json({ ok: false, code: 'INVALID_ORIGIN' }, 403);
  let body;
  try { body = await readJson(request, 4096); } catch (error) { return json({ ok: false, code: error.message }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ ok: false, code: 'INVALID_JSON' }, 400);
  const listingId = String(body.listingId || '').trim();
  const reason = reasons.has(body.reason) ? body.reason : null;
  if (!/^loc_[0-9a-f-]{36}$/i.test(listingId) || !reason) return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Sinalização inválida.' }, 422);
  const challenge = await verifyTurnstile(request, env, body.turnstileToken);
  if (!challenge.ok) return json({ ok: false, code: challenge.code, message: 'Atualize a verificação de segurança.' }, 403);
  const reporterHash = await requestIdentity(request, env, 'reporter');
  if (!await consumeRateLimit(env.LOCAL_DB, `report-rate:${reporterHash}`, 5, 24 * 60 * 60)) return json({ ok: false, code: 'RATE_LIMITED', message: 'Limite de sinalizações atingido.' }, 429);
  const listing = await env.LOCAL_DB.prepare("SELECT id, status FROM local_listings WHERE id = ? AND status = 'published'").bind(listingId).first();
  if (!listing) return json({ ok: false, code: 'NOT_FOUND', message: 'Anúncio não encontrado.' }, 404);
  const now = nowSeconds();
  const inserted = await env.LOCAL_DB.prepare(`
    INSERT INTO local_reports (id, listing_id, reporter_hash, reason, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(listing_id, reporter_hash) DO NOTHING
    RETURNING id
  `).bind(`rep_${crypto.randomUUID()}`, listingId, reporterHash, reason, now).first();
  if (!inserted) return json({ ok: true, alreadyReported: true });
  const count = await env.LOCAL_DB.prepare('SELECT COUNT(*) AS total FROM local_reports WHERE listing_id = ?').bind(listingId).first('total');
  const nextStatus = Number(count || 0) >= 5 ? 'hidden' : 'published';
  await env.LOCAL_DB.prepare('UPDATE local_listings SET report_count = ?, status = ?, updated_at = ? WHERE id = ?')
    .bind(Number(count || 0), nextStatus, now, listingId).run();
  return json({ ok: true, hidden: nextStatus === 'hidden' });
}
