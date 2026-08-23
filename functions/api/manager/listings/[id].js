import { requireMutationAccess } from '../../../_lib/auth.js';
import { ALLOWED_COVERS, CURRENCIES, LISTING_STATUSES, cleanPrice, cleanText, serializeListing } from '../../../_lib/listings.js';
import { json, nowSeconds, readJson } from '../../../_lib/security.js';

export async function onRequestPatch({ request, env, params }) {
  const resolved = await requireMutationAccess(request, env);
  if (resolved.response) return resolved.response;
  const id = Number(params.id);
  if (!Number.isSafeInteger(id) || id < 1) return json({ ok: false, code: 'NOT_FOUND' }, 404);

  let body;
  try { body = await readJson(request); } catch (error) { return json({ ok: false, code: error.message, message: 'Dados inválidos.' }, 400); }
  const expectedVersion = Number(body.version);
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 1) return json({ ok: false, code: 'VERSION_REQUIRED', message: 'Atualize a página e tente novamente.' }, 409);

  const now = nowSeconds();
  if (body.verifyAvailable === true && body.publicationStatus !== 'published' && body.publicationStatus !== 'reserved') {
    const current = await env.DB.prepare('SELECT publication_status FROM listings WHERE id = ? AND owner_user_id = ? AND version = ?')
      .bind(id, resolved.access.user.id, expectedVersion).first();
    if (!current) return json({ ok: false, code: 'VERSION_CONFLICT', message: 'Este imóvel foi alterado em outra sessão. Atualize a página.' }, 409);
    if (current.publication_status !== 'published' && current.publication_status !== 'reserved') {
      return json({ ok: false, code: 'NOT_PUBLIC', message: 'Publique o imóvel antes de confirmar a disponibilidade.' }, 422);
    }
  }

  const columns = [];
  const values = [];
  if (Object.hasOwn(body, 'title')) {
    const value = cleanText(body.title, 4, 90);
    if (!value) return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Título inválido.' }, 422);
    columns.push('title = ?'); values.push(value);
  }
  if (Object.hasOwn(body, 'zoneLabel')) {
    const value = cleanText(body.zoneLabel, 3, 100);
    if (!value) return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Zona inválida.' }, 422);
    columns.push('zone_label = ?'); values.push(value);
  }
  if (Object.hasOwn(body, 'priceAmount')) {
    const value = cleanPrice(body.priceAmount);
    if (value === null) return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Valor inválido.' }, 422);
    columns.push('price_amount = ?'); values.push(value);
  }
  if (Object.hasOwn(body, 'currency')) {
    if (!CURRENCIES.has(body.currency)) return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Moeda inválida.' }, 422);
    columns.push('currency = ?'); values.push(body.currency);
  }
  if (Object.hasOwn(body, 'publicationStatus')) {
    if (!LISTING_STATUSES.has(body.publicationStatus)) return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Status inválido.' }, 422);
    columns.push('publication_status = ?'); values.push(body.publicationStatus);
    if (body.publicationStatus === 'published' || body.publicationStatus === 'reserved') {
      columns.push('published_at = COALESCE(published_at, ?)', 'verified_at = ?');
      values.push(now, now);
    }
  }
  if (body.verifyAvailable === true) {
    columns.push('verified_at = ?'); values.push(now);
  }
  if (Object.hasOwn(body, 'coverUrl')) {
    if (!ALLOWED_COVERS.has(body.coverUrl)) return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Capa inválida.' }, 422);
    columns.push('cover_url = ?'); values.push(body.coverUrl);
  }
  if (!columns.length) return json({ ok: false, code: 'NO_CHANGES', message: 'Nenhuma alteração recebida.' }, 422);

  columns.push('version = version + 1', 'updated_at = ?');
  values.push(now, id, resolved.access.user.id, expectedVersion);
  const updated = await env.DB.prepare(`
    UPDATE listings SET ${columns.join(', ')}
    WHERE id = ? AND owner_user_id = ? AND version = ?
    RETURNING id, reference, title, zone_label, price_amount, currency, publication_status,
              availability_label, cover_url, property_type, bedrooms, bathrooms, floor_label,
              furnished, pets_policy, children_policy, parking_type, availability_date,
              guarantee_amount, agency_fee_amount, water_included, electricity_included,
              internet_included, trash_included, condominium_included, location_notes,
              utility_notes, description, published_at, verified_at, version, created_at, updated_at
  `).bind(...values).first();
  if (!updated) return json({ ok: false, code: 'VERSION_CONFLICT', message: 'Este imóvel foi alterado em outra sessão. Atualize a página.' }, 409);
  try {
    await env.DB.prepare("INSERT INTO audit_log (user_id, action, entity_type, entity_id, created_at) VALUES (?, 'update', 'listing', ?, ?)")
      .bind(resolved.access.user.id, String(id), now).run();
  } catch (_) { /* The update remains usable if non-critical audit logging is unavailable. */ }
  return json({ ok: true, listing: serializeListing(updated) });
}
