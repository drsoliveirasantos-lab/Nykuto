import { requireActiveAccess, requireMutationAccess } from '../../../_lib/auth.js';
import { ALLOWED_COVERS, CURRENCIES, PARKING_TYPES, POLICIES, PROPERTY_TYPES, cleanCount, cleanDate, cleanFlag, cleanOptionalText, cleanPrice, cleanText, serializeListing } from '../../../_lib/listings.js';
import { json, nowSeconds, readJson } from '../../../_lib/security.js';

export async function onRequestGet({ request, env }) {
  const resolved = await requireActiveAccess(request, env);
  if (resolved.response) return resolved.response;
  const result = await env.DB.prepare(`
    SELECT id, reference, title, zone_label, price_amount, currency, publication_status,
           availability_label, cover_url, property_type, bedrooms, bathrooms, floor_label,
           furnished, pets_policy, children_policy, parking_type, availability_date,
           guarantee_amount, agency_fee_amount, water_included, electricity_included,
           internet_included, trash_included, condominium_included, location_notes,
           utility_notes, description, version, created_at, updated_at
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
  const propertyType = PROPERTY_TYPES.has(body.propertyType) ? body.propertyType : null;
  const bedrooms = cleanCount(body.bedrooms, 12);
  const bathrooms = cleanCount(body.bathrooms, 12);
  const floorLabel = cleanOptionalText(body.floorLabel, 40);
  const petsPolicy = POLICIES.has(body.petsPolicy) ? body.petsPolicy : null;
  const childrenPolicy = POLICIES.has(body.childrenPolicy) ? body.childrenPolicy : null;
  const parkingType = PARKING_TYPES.has(body.parkingType) ? body.parkingType : null;
  const availabilityDate = cleanDate(body.availabilityDate);
  const guaranteeAmount = cleanPrice(body.guaranteeAmount);
  const agencyFeeAmount = cleanPrice(body.agencyFeeAmount);
  const locationNotes = cleanOptionalText(body.locationNotes, 280);
  const utilityNotes = cleanOptionalText(body.utilityNotes, 280);
  const description = cleanOptionalText(body.description, 1200);
  if (!title || !zoneLabel || priceAmount === null || !currency || !propertyType || bedrooms === null || bathrooms === null || !petsPolicy || !childrenPolicy || !parkingType || availabilityDate === null || guaranteeAmount === null || agencyFeeAmount === null || floorLabel === null || locationNotes === null || utilityNotes === null || description === null) {
    return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Revise os campos destacados e os valores informados.' }, 422);
  }

  const now = nowSeconds();
  const reference = `NYK-TEST-${crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
  const inserted = await env.DB.prepare(`
    INSERT INTO listings (
      owner_user_id, reference, title, zone_label, price_amount, currency,
      publication_status, availability_label, cover_url, property_type, bedrooms, bathrooms,
      floor_label, furnished, pets_policy, children_policy, parking_type, availability_date,
      guarantee_amount, agency_fee_amount, water_included, electricity_included, internet_included,
      trash_included, condominium_included, location_notes, utility_notes, description,
      sort_order, version, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'draft', 'A revisar', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 999, 1, ?, ?)
    RETURNING id, reference, title, zone_label, price_amount, currency, publication_status,
              availability_label, cover_url, property_type, bedrooms, bathrooms, floor_label,
              furnished, pets_policy, children_policy, parking_type, availability_date,
              guarantee_amount, agency_fee_amount, water_included, electricity_included,
              internet_included, trash_included, condominium_included, location_notes,
              utility_notes, description, version, created_at, updated_at
  `).bind(resolved.access.user.id, reference, title, zoneLabel, priceAmount, currency, coverUrl,
    propertyType, bedrooms, bathrooms, floorLabel, cleanFlag(body.furnished), petsPolicy,
    childrenPolicy, parkingType, availabilityDate, guaranteeAmount, agencyFeeAmount,
    cleanFlag(body.waterIncluded), cleanFlag(body.electricityIncluded), cleanFlag(body.internetIncluded),
    cleanFlag(body.trashIncluded), cleanFlag(body.condominiumIncluded), locationNotes, utilityNotes,
    description, now, now).first();
  try {
    await env.DB.prepare("INSERT INTO audit_log (user_id, action, entity_type, entity_id, created_at) VALUES (?, 'create', 'listing', ?, ?)")
      .bind(resolved.access.user.id, String(inserted.id), now).run();
  } catch (_) { /* The listing remains usable if non-critical audit logging is unavailable. */ }
  return json({ ok: true, listing: serializeListing(inserted) }, 201);
}
