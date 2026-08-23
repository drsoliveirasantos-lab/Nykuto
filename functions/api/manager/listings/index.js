import { requireActiveAccess, requireMutationAccess } from '../../../_lib/auth.js';
import { ALLOWED_COVERS, CURRENCIES, cleanPrice, cleanText, serializeListing } from '../../../_lib/listings.js';
import { json, nowSeconds, readJson } from '../../../_lib/security.js';

export async function onRequestGet({ request, env }) {
  const resolved = await requireActiveAccess(request, env);
  if (resolved.response) return resolved.response;
  const result = await env.DB.prepare(`
    SELECT id, reference, title, zone_label, price_amount, currency, publication_status,
           availability_label, cover_url, version, created_at, updated_at
    FROM listings
    WHERE owner_user_id = ?
    ORDER BY CASE publication_status WHEN 'published' THEN 1 WHEN 'reserved' THEN 2 WHEN 'draft' THEN 3 WHEN 'rented' THEN 4 ELSE 5 END,
             sort_order ASC, updated_at DESC
  `).bind(resolved.access.user.id).all();
  return json({ ok: true, listings: (result.results || []).map(serializeListing) });
}

export async function onRequestPost({ request, env }) {
  const resolved = await requireMutationAccess(request, env);
  if (resolved.response) return resolved.response;
  let body;
  try { body = await readJson(request); } catch (error) { return json({ ok: false, code: error.message, message: 'Dados inválidos.' }, 400); }

  const title = cleanText(body.title, 4, 90);
  const zoneLabel = cleanText(body.zoneLabel, 3, 100);
  const priceAmount = cleanPrice(body.priceAmount);
  const currency = CURRENCIES.has(body.currency) ? body.currency : null;
  const coverUrl = ALLOWED_COVERS.has(body.coverUrl) ? body.coverUrl : '/assets/demo-imobiliaria/local-premium-08.webp';
  if (!title || !zoneLabel || priceAmount === null || !currency) {
    return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Preencha título, zona, moeda e valor corretamente.' }, 422);
  }

  const now = nowSeconds();
  const reference = `NYK-TEST-${crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
  const inserted = await env.DB.prepare(`
    INSERT INTO listings (
      owner_user_id, reference, title, zone_label, price_amount, currency,
      publication_status, availability_label, cover_url, sort_order, version, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'draft', 'A revisar', ?, 999, 1, ?, ?)
    RETURNING id, reference, title, zone_label, price_amount, currency, publication_status,
              availability_label, cover_url, version, created_at, updated_at
  `).bind(resolved.access.user.id, reference, title, zoneLabel, priceAmount, currency, coverUrl, now, now).first();
  try {
    await env.DB.prepare("INSERT INTO audit_log (user_id, action, entity_type, entity_id, created_at) VALUES (?, 'create', 'listing', ?, ?)")
      .bind(resolved.access.user.id, String(inserted.id), now).run();
  } catch (_) { /* The listing remains usable if non-critical audit logging is unavailable. */ }
  return json({ ok: true, listing: serializeListing(inserted) }, 201);
}
