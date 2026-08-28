import { createLocalSession, getLocalAccess, serializeLocalProfile } from '../../../_lib/local-auth.js';
import {
  LOCAL_CATEGORIES,
  LOCAL_CURRENCIES,
  LOCAL_LISTING_KINDS,
  LOCAL_PRICE_MODES,
  LOCAL_SUBCATEGORIES,
  MAX_MEDIA_BYTES,
  MAX_MEDIA_COUNT,
  MAX_TOTAL_MEDIA_BYTES,
  bytesToBase64,
  cleanCoordinate,
  cleanEmail,
  cleanFeeList,
  cleanLocalOptionalText,
  cleanLocalText,
  cleanPriceAmount,
  cleanSourceUrl,
  cleanStringList,
  consumeRateLimit,
  containsBlockedContent,
  deriveMarketSection,
  detectImageType,
  normalizeLocalWhatsapp,
  normalizeSearchText,
  requestIdentity,
  serializeLocalListing
} from '../../../_lib/local-marketplace.js';
import { constantTimeEqual, isSameOrigin, json, nowSeconds } from '../../../_lib/security.js';
import { verifyTurnstile } from '../../../_lib/turnstile.js';

const LISTING_LIFETIME_SECONDS = 45 * 24 * 60 * 60;

function validateProfile(value) {
  const firstName = cleanLocalText(value?.firstName, 2, 50);
  const lastName = cleanLocalText(value?.lastName, 2, 60);
  const email = cleanEmail(value?.email);
  const whatsapp = normalizeLocalWhatsapp(value?.whatsapp);
  if (!firstName || !lastName || email === null || !whatsapp || value?.contactConsent !== true) return null;
  return { firstName, lastName, email, whatsapp };
}

function validateListing(value) {
  const kind = LOCAL_LISTING_KINDS.has(value?.kind) ? value.kind : 'offer';
  const category = LOCAL_CATEGORIES.has(value?.category) ? value.category : null;
  const subcategory = cleanLocalText(value?.subcategory, 2, 80);
  const title = cleanLocalText(value?.title, 4, 90);
  const description = cleanLocalOptionalText(value?.description, 1200);
  const priceMode = LOCAL_PRICE_MODES.has(value?.priceMode) ? value.priceMode : null;
  const needsPrice = priceMode === 'fixed' || priceMode === 'negotiable';
  const priceAmount = needsPrice ? cleanPriceAmount(value?.priceAmount) : null;
  const currency = needsPrice && LOCAL_CURRENCIES.has(value?.currency) ? value.currency : null;
  const condition = cleanLocalText(value?.condition, 2, 80);
  const availability = cleanLocalText(value?.availability, 2, 80);
  const logistics = cleanStringList(value?.logistics);
  const fees = cleanFeeList(value?.fees);
  const zoneLabel = cleanLocalText(value?.zoneLabel, 2, 100);
  const zoneLat = cleanCoordinate(value?.zoneLatitude, -25.9, -24.8);
  const zoneLng = cleanCoordinate(value?.zoneLongitude, -55.1, -54.2);
  const sourceUrl = cleanSourceUrl(value?.sourceUrl);
  const sourceOwnerConsent = value?.sourceOwnerConsent === true;

  if (!category || !subcategory || !LOCAL_SUBCATEGORIES[category]?.has(subcategory) || !title || description === null || !priceMode || (needsPrice && (priceAmount === null || !currency)) || !condition || !availability || !zoneLabel || zoneLat === null || zoneLng === null || sourceUrl === null) return null;
  if (sourceUrl && !sourceOwnerConsent) return null;
  if (containsBlockedContent(title, description, subcategory, condition, availability, zoneLabel, ...logistics, ...fees.map((fee) => `${fee.label} ${fee.value}`))) return { blocked: true };
  return {
    kind,
    category,
    marketSection: deriveMarketSection(category, subcategory),
    subcategory,
    title,
    description,
    searchText: normalizeSearchText(`${title} ${description} ${category} ${subcategory} ${zoneLabel}`),
    priceAmount,
    currency,
    priceMode,
    condition,
    availability,
    logistics,
    fees,
    zoneLabel,
    zoneLat,
    zoneLng,
    sourceUrl,
    sourceOwnerConsent
  };
}

async function resolveImages(files) {
  if (files.length > MAX_MEDIA_COUNT) throw new Error('TOO_MANY_PHOTOS');
  let totalBytes = 0;
  const images = [];
  for (const file of files) {
    if (!(file instanceof File) || file.size <= 0 || file.size > MAX_MEDIA_BYTES) throw new Error('INVALID_PHOTO');
    totalBytes += file.size;
    if (totalBytes > MAX_TOTAL_MEDIA_BYTES) throw new Error('PHOTOS_TOO_LARGE');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const detected = detectImageType(bytes);
    if (!detected) throw new Error('INVALID_PHOTO');
    images.push({ bytes, ...detected });
  }
  return images;
}

async function listingRow(env, listingId) {
  return env.LOCAL_DB.prepare(`
    SELECT l.*, p.first_name, p.last_name, p.whatsapp_e164,
           m.id AS cover_media_id, m.mime_type AS cover_mime_type
    FROM local_listings l
    JOIN local_publishers p ON p.id = l.owner_publisher_id
    LEFT JOIN local_listing_media m ON m.id = (
      SELECT lm.id FROM local_listing_media lm
      WHERE lm.listing_id = l.id ORDER BY lm.sort_order ASC, lm.id ASC LIMIT 1
    )
    WHERE l.id = ? LIMIT 1
  `).bind(listingId).first();
}

export async function onRequestGet({ request, env }) {
  if (!env.LOCAL_DB) return json({ ok: false, code: 'SERVICE_UNAVAILABLE', message: 'O catálogo está temporariamente indisponível.' }, 503);
  const url = new URL(request.url);
  // SQLite/D1 limits LIKE patterns to 50 bytes. Keep enough room for the two `%`
  // wildcards and stay safely below the limit for UTF-8 input.
  const query = normalizeSearchText(url.searchParams.get('q')).slice(0, 40);
  const category = url.searchParams.get('category') || '';
  const section = url.searchParams.get('section') || '';
  const subcategory = cleanLocalOptionalText(url.searchParams.get('subcategory'), 80) || '';
  const kind = LOCAL_LISTING_KINDS.has(url.searchParams.get('kind')) ? url.searchParams.get('kind') : 'offer';
  const limit = Math.max(1, Math.min(24, Math.trunc(Number(url.searchParams.get('limit'))) || 12));
  const page = Math.max(1, Math.min(100, Math.trunc(Number(url.searchParams.get('page'))) || 1));
  const offset = (page - 1) * limit;
  const now = nowSeconds();
  const conditions = [
    "l.status = 'published'",
    'l.expires_at > ?',
    'l.listing_kind = ?',
    "EXISTS (SELECT 1 FROM local_publishers p2 WHERE p2.id = l.owner_publisher_id AND p2.status = 'active')"
  ];
  const values = [now, kind];
  if (query) { conditions.push('instr(l.search_text, ?) > 0'); values.push(query); }
  if (LOCAL_CATEGORIES.has(category)) { conditions.push('l.category = ?'); values.push(category); }
  if (section) { conditions.push('l.market_section = ?'); values.push(section.slice(0, 30)); }
  if (subcategory) { conditions.push('l.subcategory = ?'); values.push(subcategory); }
  const where = conditions.join(' AND ');
  const [rows, count] = await env.LOCAL_DB.batch([
    env.LOCAL_DB.prepare(`
      SELECT l.*, p.first_name, p.last_name, p.whatsapp_e164,
             m.id AS cover_media_id, m.mime_type AS cover_mime_type
      FROM local_listings l
      JOIN local_publishers p ON p.id = l.owner_publisher_id AND p.status = 'active'
      LEFT JOIN local_listing_media m ON m.id = (
        SELECT lm.id FROM local_listing_media lm
        WHERE lm.listing_id = l.id ORDER BY lm.sort_order ASC, lm.id ASC LIMIT 1
      )
      WHERE ${where}
      ORDER BY l.published_at DESC
      LIMIT ? OFFSET ?
    `).bind(...values, limit, offset),
    env.LOCAL_DB.prepare(`SELECT COUNT(*) AS total FROM local_listings l WHERE ${where}`).bind(...values)
  ]);
  const total = Number(count.results?.[0]?.total || 0);
  return json({
    ok: true,
    listings: (rows.results || []).map((row) => serializeLocalListing(row)),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
  }, 200, { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' });
}

export async function onRequestPost({ request, env }) {
  if (!env.LOCAL_DB || !env.AUTH_PEPPER) return json({ ok: false, code: 'SERVICE_UNAVAILABLE', message: 'A publicação está temporariamente indisponível.' }, 503);
  if (!isSameOrigin(request)) return json({ ok: false, code: 'INVALID_ORIGIN', message: 'Origem da solicitação inválida.' }, 403);
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > 4 * 1024 * 1024) return json({ ok: false, code: 'PAYLOAD_TOO_LARGE', message: 'Reduza o tamanho das fotos e tente novamente.' }, 413);

  let form;
  let payload;
  try {
    form = await request.formData();
    payload = JSON.parse(String(form.get('payload') || '{}'));
  } catch (_) {
    return json({ ok: false, code: 'INVALID_FORM', message: 'Não foi possível ler o anúncio.' }, 400);
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return json({ ok: false, code: 'INVALID_FORM', message: 'Não foi possível ler o anúncio.' }, 400);
  const listing = validateListing(payload.listing);
  const profile = validateProfile(payload.profile);
  if (!listing || !profile) return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Confira os dados do anúncio, perfil, preço e zona.' }, 422);
  if (listing.blocked) return json({ ok: false, code: 'PROHIBITED_CONTENT', message: 'Este conteúdo não pode ser publicado no Nykuto Local.' }, 422);
  const challenge = await verifyTurnstile(request, env, payload.turnstileToken);
  if (!challenge.ok) return json({ ok: false, code: challenge.code, message: 'Atualize a verificação de segurança e tente novamente.' }, 403);

  const access = await getLocalAccess(request, env);
  if (access.state === 'suspended') return json({ ok: false, code: 'ACCOUNT_SUSPENDED', message: 'Este perfil está suspenso.' }, 403);
  if (access.state === 'active') {
    const provided = request.headers.get('X-CSRF-Token') || '';
    if (!provided || !constantTimeEqual(provided, access.csrfToken)) return json({ ok: false, code: 'INVALID_CSRF', message: 'Atualize a página e tente novamente.' }, 403);
  }
  const rateKey = await requestIdentity(request, env, 'listing-create');
  if (!await consumeRateLimit(env.LOCAL_DB, rateKey, 10, 24 * 60 * 60)) return json({ ok: false, code: 'RATE_LIMITED', message: 'Limite diário de publicações atingido neste acesso.' }, 429);

  let images;
  try { images = await resolveImages(form.getAll('photos')); } catch (error) {
    const message = error.message === 'TOO_MANY_PHOTOS' ? 'Escolha no máximo cinco fotos.' : 'Cada foto deve ser JPG, PNG ou WebP e ter até 300 KB após otimização.';
    return json({ ok: false, code: error.message, message }, 422);
  }
  if (listing.kind === 'offer' && ['Produto', 'Imóvel'].includes(listing.category) && images.length === 0) return json({ ok: false, code: 'PHOTO_REQUIRED', message: 'Adicione pelo menos uma foto para este anúncio.' }, 422);

  let publisherId = access.state === 'active' ? access.profile.id : '';
  let createdPublisher = false;
  let session = null;
  const listingId = `loc_${crypto.randomUUID()}`;
  const storedObjectKeys = [];
  const now = nowSeconds();
  try {
    if (!publisherId) {
      publisherId = `pub_${crypto.randomUUID()}`;
      await env.LOCAL_DB.prepare(`
        INSERT INTO local_publishers (id, first_name, last_name, email, whatsapp_e164, status, contact_consent_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)
      `).bind(publisherId, profile.firstName, profile.lastName, profile.email || null, profile.whatsapp, now, now, now).run();
      createdPublisher = true;
      session = await createLocalSession(env, publisherId);
    } else {
      await env.LOCAL_DB.prepare(`
        UPDATE local_publishers SET first_name = ?, last_name = ?, email = ?, whatsapp_e164 = ?, contact_consent_at = ?, updated_at = ?
        WHERE id = ?
      `).bind(profile.firstName, profile.lastName, profile.email || null, profile.whatsapp, now, now, publisherId).run();
    }
    const activeCount = await env.LOCAL_DB.prepare(`
      SELECT COUNT(*) AS total FROM local_listings
      WHERE owner_publisher_id = ? AND status IN ('published', 'paused') AND expires_at > ?
    `).bind(publisherId, now).first('total');
    if (Number(activeCount || 0) >= 20) throw new Error('LISTING_LIMIT');

    await env.LOCAL_DB.prepare(`
      INSERT INTO local_listings (
        id, owner_publisher_id, listing_kind, category, market_section, subcategory,
        title, description, search_text, price_amount, currency, price_mode, condition_label,
        availability_label, logistics_json, fees_json, zone_label, zone_lat, zone_lng,
        zone_radius_m, source_url, source_owner_consent, status, report_count,
        published_at, expires_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5000, ?, ?, 'paused', 0, ?, ?, ?, ?)
    `).bind(
      listingId, publisherId, listing.kind, listing.category, listing.marketSection, listing.subcategory,
      listing.title, listing.description || null, listing.searchText, listing.priceAmount, listing.currency,
      listing.priceMode, listing.condition, listing.availability, JSON.stringify(listing.logistics),
      JSON.stringify(listing.fees), listing.zoneLabel, listing.zoneLat, listing.zoneLng,
      listing.sourceUrl || null, listing.sourceOwnerConsent ? 1 : 0,
      now, now + LISTING_LIFETIME_SECONDS, now, now
    ).run();

    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      const mediaId = `med_${crypto.randomUUID()}`;
      if (env.LOCAL_MEDIA) {
        const objectKey = `local/${listingId}/${mediaId}.${image.extension}`;
        await env.LOCAL_MEDIA.put(objectKey, image.bytes, { httpMetadata: { contentType: image.mimeType } });
        storedObjectKeys.push(objectKey);
        await env.LOCAL_DB.prepare(`
          INSERT INTO local_listing_media (id, listing_id, storage_type, object_key, data_base64, mime_type, byte_size, sort_order, created_at)
          VALUES (?, ?, 'r2', ?, NULL, ?, ?, ?, ?)
        `).bind(mediaId, listingId, objectKey, image.mimeType, image.bytes.byteLength, index, now).run();
      } else {
        await env.LOCAL_DB.prepare(`
          INSERT INTO local_listing_media (id, listing_id, storage_type, object_key, data_base64, mime_type, byte_size, sort_order, created_at)
          VALUES (?, ?, 'd1', NULL, ?, ?, ?, ?, ?)
        `).bind(mediaId, listingId, bytesToBase64(image.bytes), image.mimeType, image.bytes.byteLength, index, now).run();
      }
    }

    // The listing becomes public only after every media row has been stored.
    // This prevents a partially uploaded listing from appearing in the catalog.
    await env.LOCAL_DB.prepare("UPDATE local_listings SET status = 'published', updated_at = ? WHERE id = ?")
      .bind(nowSeconds(), listingId).run();

    const row = await listingRow(env, listingId);
    const headers = session ? { 'Set-Cookie': session.cookie } : {};
    return json({
      ok: true,
      listing: serializeLocalListing(row, { ownerView: true }),
      profile: serializeLocalProfile(await env.LOCAL_DB.prepare('SELECT * FROM local_publishers WHERE id = ?').bind(publisherId).first()),
      csrfToken: session?.csrfToken || access.csrfToken
    }, 201, headers);
  } catch (error) {
    if (env.LOCAL_MEDIA && storedObjectKeys.length) await env.LOCAL_MEDIA.delete(storedObjectKeys);
    await env.LOCAL_DB.prepare('DELETE FROM local_listing_media WHERE listing_id = ?').bind(listingId).run();
    await env.LOCAL_DB.prepare('DELETE FROM local_listings WHERE id = ?').bind(listingId).run();
    if (createdPublisher) await env.LOCAL_DB.prepare('DELETE FROM local_publishers WHERE id = ?').bind(publisherId).run();
    if (error.message === 'LISTING_LIMIT') return json({ ok: false, code: 'LISTING_LIMIT', message: 'Este perfil já possui vinte anúncios ativos. Pause ou conclua um deles antes de publicar outro.' }, 409);
    return json({ ok: false, code: 'PUBLICATION_FAILED', message: 'Não foi possível publicar agora. Seus dados continuam no formulário para tentar novamente.' }, 500);
  }
}
