import { serializeListing } from '../../_lib/listings.js';
import { json } from '../../_lib/security.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ ok: false, code: 'SERVICE_UNAVAILABLE' }, 503);
  const [result, catalog] = await env.DB.batch([env.DB.prepare(`
    SELECT id, reference, title, zone_label, price_amount, currency, publication_status,
           availability_label, cover_url, version, created_at, updated_at
    FROM listings
    WHERE publication_status IN ('published', 'reserved')
      AND reference LIKE 'NYK-CDE-%'
    ORDER BY sort_order ASC
  `), env.DB.prepare("SELECT COUNT(*) AS total FROM listings WHERE reference LIKE 'NYK-CDE-%'")]);
  const total = Number(catalog.results?.[0]?.total || 0);
  return json({ ok: true, catalogReady: total >= 5, listings: (result.results || []).map(serializeListing) });
}
