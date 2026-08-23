import { serializeListing } from '../../_lib/listings.js';
import { json, nowSeconds } from '../../_lib/security.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ ok: false, code: 'SERVICE_UNAVAILABLE' }, 503);
  const freshnessCutoff = nowSeconds() - 30 * 24 * 60 * 60;
  const [result, catalog] = await env.DB.batch([env.DB.prepare(`
    SELECT l.id, l.reference, l.title, l.zone_label, l.price_amount, l.currency,
           l.publication_status, l.availability_label, l.cover_url, l.published_at,
           l.verified_at, l.version, l.created_at, l.updated_at
    FROM listings l
    JOIN users u ON u.id = l.owner_user_id
    WHERE l.publication_status IN ('published', 'reserved')
      AND l.reference LIKE 'NYK-CDE-%'
      AND l.verified_at >= ?
      AND u.last_login_at >= ?
    ORDER BY l.sort_order ASC
  `).bind(freshnessCutoff, freshnessCutoff), env.DB.prepare("SELECT COUNT(*) AS total FROM listings WHERE reference LIKE 'NYK-CDE-%'")]);
  const total = Number(catalog.results?.[0]?.total || 0);
  return json({ ok: true, catalogReady: total >= 5, listings: (result.results || []).map(serializeListing) });
}
