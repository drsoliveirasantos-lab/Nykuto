import { base64ToBytes } from '../_lib/local-marketplace.js';
import { getLocalAccess } from '../_lib/local-auth.js';

export async function onRequestGet({ request, env, params }) {
  if (!env.LOCAL_DB || !/^med_[0-9a-f-]{36}$/i.test(params.id)) return new Response('Not found', { status: 404 });
  const row = await env.LOCAL_DB.prepare(`
    SELECT m.storage_type, m.object_key, m.data_base64, m.mime_type, m.byte_size,
           l.owner_publisher_id, l.status, l.expires_at, p.status AS publisher_status
    FROM local_listing_media m
    JOIN local_listings l ON l.id = m.listing_id
    JOIN local_publishers p ON p.id = l.owner_publisher_id
    WHERE m.id = ?
    LIMIT 1
  `).bind(params.id).first();
  if (!row) return new Response('Not found', { status: 404 });
  const now = Math.floor(Date.now() / 1000);
  const publiclyVisible = row.status === 'published' && Number(row.expires_at) > now && row.publisher_status === 'active';
  const access = publiclyVisible ? null : await getLocalAccess(request, env);
  const ownerVisible = access?.state === 'active' && access.profile.id === row.owner_publisher_id;
  if (!publiclyVisible && !ownerVisible) return new Response('Not found', { status: 404 });
  let body;
  if (row.storage_type === 'r2') {
    if (!env.LOCAL_MEDIA || !row.object_key || row.object_key.includes('..')) return new Response('Not found', { status: 404 });
    const object = await env.LOCAL_MEDIA.get(row.object_key);
    if (!object) return new Response('Not found', { status: 404 });
    body = object.body;
  } else {
    if (!row.data_base64) return new Response('Not found', { status: 404 });
    body = base64ToBytes(row.data_base64);
  }
  return new Response(body, {
    headers: {
      'Cache-Control': publiclyVisible ? 'public, max-age=300' : 'private, no-store',
      'Content-Length': String(row.byte_size),
      'Content-Type': row.mime_type,
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
