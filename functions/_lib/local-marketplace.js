import { hmac, nowSeconds } from './security.js';

export const LOCAL_CATEGORIES = new Set(['Produto', 'Imóvel', 'Frete ou mudança', 'Serviço local', 'Compra ou retirada em Foz', 'Carona compartilhada', 'Outro']);
export const LOCAL_SUBCATEGORIES = {
  Produto: new Set(['Móveis e decoração', 'Eletrodomésticos', 'Eletrônicos e informática', 'Celular e acessórios', 'Moda e acessórios', 'Veículos e peças', 'Outro produto']),
  Imóvel: new Set(['Apartamento para alugar', 'Casa para alugar', 'Quarto ou kitnet', 'Imóvel para vender', 'Terreno', 'Comercial']),
  'Frete ou mudança': new Set(['Pequeno frete', 'Mudança completa', 'Entrega ou retirada', 'Rota CDE ↔ Foz', 'Motorista com veículo', 'Outro transporte']),
  'Serviço local': new Set(['Montagem e instalação', 'Manutenção e reparo', 'Limpeza', 'Elétrica ou hidráulica', 'Climatização', 'Aulas ou atendimento', 'Outro serviço']),
  'Compra ou retirada em Foz': new Set(['Comprar em Foz', 'Retirar uma compra', 'Entregar CDE ↔ Foz', 'Documento permitido', 'Outro pedido permitido']),
  'Carona compartilhada': new Set(['Ofereço carona recorrente', 'Ofereço carona ocasional', 'Procuro carona recorrente', 'Procuro carona ocasional']),
  Outro: new Set(['Evento ou aluguel', 'Oportunidade local', 'Doação', 'Outro anúncio'])
};
export const LOCAL_PRICE_MODES = new Set(['fixed', 'negotiable', 'quote', 'free']);
export const LOCAL_CURRENCIES = new Set(['BRL', 'PYG', 'USD']);
export const LOCAL_STATUSES = new Set(['published', 'paused', 'sold', 'hidden', 'deleted', 'expired']);
export const LOCAL_LISTING_KINDS = new Set(['offer', 'request']);
export const PUBLIC_STATUSES = new Set(['published']);
export const MAX_MEDIA_COUNT = 5;
// Keep the D1 compatibility fallback within conservative Worker CPU/storage
// budgets until the account-level R2 service is enabled.
export const MAX_MEDIA_BYTES = 300000;
export const MAX_TOTAL_MEDIA_BYTES = 1250000;

const blockedTerms = [
  'arma de fogo', 'municao', 'munição', 'cocaina', 'cocaína', 'maconha', 'droga',
  'documento falso', 'passaporte falso', 'carteira falsa', 'produto roubado', 'contrabando'
];

export function cleanLocalText(value, minimum, maximum) {
  const cleaned = String(value || '').normalize('NFKC').replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/g, ' ').trim().replace(/\s+/g, ' ');
  return cleaned.length >= minimum && cleaned.length <= maximum ? cleaned : null;
}

export function cleanLocalOptionalText(value, maximum) {
  const cleaned = String(value || '').normalize('NFKC').replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/g, ' ').trim().replace(/\s+/g, ' ');
  return cleaned.length <= maximum ? cleaned : null;
}

export function cleanPublicRidePlace(value) {
  let cleaned = cleanLocalText(value, 2, 80);
  if (!cleaned) return null;
  const protectedPrefixes = new Set(['area', 'km', 'ruta', 'rota']);
  const streetNameConnectors = new Set(['de', 'da', 'do', 'das', 'dos']);
  cleaned = cleaned
    .replace(/\b(?:(?:casa|apartamento|apto|número|numero)\b|ap\.|n[º°]|n[o]?\.)\s*[:.#-]?\s*[^\s,]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  cleaned = cleaned.split(',').map((segment) => {
    const words = segment.trim().split(/\s+/).filter(Boolean);
    const addressNumberIndex = words.findIndex((word, index) => {
      if (!/^\d{1,6}(?:[a-z]|[-/][a-z0-9]+)?$/i.test(word)) return false;
      if (protectedPrefixes.has(normalizeSearchText(words[index - 1]))) return false;
      if (streetNameConnectors.has(normalizeSearchText(words[index + 1]))) return false;
      return true;
    });
    const publicWords = addressNumberIndex >= 0 ? words.slice(0, addressNumberIndex) : words;
    if (['n', 'no', 'num', 'numero', 'ap', 'apto', 'casa'].includes(normalizeSearchText(publicWords[publicWords.length - 1]))) publicWords.pop();
    return publicWords.join(' ');
  }).filter(Boolean).join(', ').trim();
  return cleanLocalText(cleaned, 2, 80);
}

export function normalizeLocalWhatsapp(value) {
  const digits = String(value || '').replace(/\D/g, '').replace(/^00/, '');
  if (!/^[1-9]\d{7,14}$/.test(digits) || /^(\d)\1+$/.test(digits)) return null;
  return `+${digits}`;
}

export function cleanEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!email) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 120 ? email : null;
}

export function cleanPriceAmount(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 && number <= 100000000000 ? number : null;
}

export function cleanCoordinate(value, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum || number > maximum) return null;
  return Math.round(number * 100) / 100;
}

export function cleanStringList(value, maximumItems = 8, maximumLength = 80) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maximumItems).map((item) => cleanLocalText(item, 1, maximumLength)).filter(Boolean);
}

export function cleanFeeList(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).map((item) => ({
    label: cleanLocalText(item?.label, 1, 60),
    value: cleanLocalText(item?.value, 1, 80)
  })).filter((item) => item.label && item.value);
}

export function cleanSourceUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.length > 500) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && !url.username && !url.password && url.hostname ? url.toString() : null;
  } catch (_) {
    return null;
  }
}

export function deriveMarketSection(category, subcategory) {
  if (category === 'Frete ou mudança') return 'freight';
  if (category === 'Serviço local') return 'services';
  if (category === 'Compra ou retirada em Foz') return 'foz';
  if (category === 'Carona compartilhada') return 'rides';
  if (category === 'Imóvel') return 'properties';
  if (category !== 'Produto') return 'other';
  const normalized = String(subcategory || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (normalized.includes('celular')) return 'phones';
  if (normalized.includes('eletron') || normalized.includes('informat')) return 'electronics';
  if (normalized.includes('moda') || normalized.includes('acessor')) return 'fashion';
  if (normalized.includes('veiculo') || normalized.includes('peca')) return 'vehicles';
  return 'home';
}

export function containsBlockedContent(...values) {
  const normalized = normalizeSearchText(values.join(' '));
  return blockedTerms.some((term) => normalized.includes(term.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()));
}

export function normalizeSearchText(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/g, ' ').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

export function publicSellerName(firstName, lastName) {
  const initial = String(lastName || '').trim().slice(0, 1);
  return `${firstName}${initial ? ` ${initial}.` : ''}`;
}

export function serializeLocalListing(row, { ownerView = false, media = null } = {}) {
  let fees = parseJsonArray(row.fees_json);
  let zoneLabel = row.zone_label;
  let title = row.title;
  if (row.category === 'Carona compartilhada') {
    fees = fees.flatMap((fee) => {
      const label = String(fee?.label || '');
      const normalized = normalizeSearchText(label);
      if (normalized.includes('encontro')) return [];
      if (normalized.includes('partida') || normalized === 'origem' || normalized.includes('ponto inicial') || normalized.includes('destino') || normalized.includes('chegada')) {
        const value = cleanPublicRidePlace(fee?.value);
        return value ? [{ label, value }] : [];
      }
      return fee?.value ? [{ label, value: String(fee.value) }] : [];
    });
    zoneLabel = cleanPublicRidePlace(row.zone_label) || 'Região de CDE/Foz';
    const feeValue = (patterns) => String(fees.find((fee) => patterns.some((pattern) => normalizeSearchText(fee.label).includes(pattern)))?.value || '');
    const origin = feeValue(['ponto de partida', 'origem']) || zoneLabel;
    const destination = feeValue(['destino', 'chegada']);
    const time = feeValue(['horario', 'hora']);
    title = destination
      ? `${row.listing_kind === 'request' ? 'Procuro carona' : 'Carona'}: ${origin} → ${destination}${time ? ` · ${time}` : ''}`.slice(0, 90)
      : 'Carona compartilhada';
  }
  const listing = {
    id: row.id,
    kind: row.listing_kind,
    category: row.category,
    marketSection: row.market_section,
    subcategory: row.subcategory,
    title,
    description: row.description || '',
    priceAmount: row.price_amount === null || row.price_amount === undefined ? null : Number(row.price_amount),
    currency: row.currency || '',
    priceMode: row.price_mode,
    condition: row.condition_label,
    availability: row.availability_label,
    logistics: parseJsonArray(row.logistics_json),
    fees,
    zone: {
      label: zoneLabel,
      latitude: Number(row.zone_lat),
      longitude: Number(row.zone_lng),
      radiusMeters: Number(row.zone_radius_m || 5000)
    },
    sourceUrl: row.source_url || '',
    status: row.status,
    reportCount: ownerView ? Number(row.report_count || 0) : undefined,
    publishedAt: Number(row.published_at),
    expiresAt: Number(row.expires_at),
    updatedAt: Number(row.updated_at),
    seller: {
      name: ownerView ? `${row.first_name} ${row.last_name}` : publicSellerName(row.first_name, row.last_name),
      whatsapp: row.whatsapp_e164
    }
  };
  const resolvedMedia = media || (row.cover_media_id ? [{ id: row.cover_media_id, mimeType: row.cover_mime_type }] : []);
  listing.media = resolvedMedia.map((item) => ({ id: item.id, mimeType: item.mimeType || item.mime_type, url: `/media/${encodeURIComponent(item.id)}` }));
  return listing;
}

export async function requestIdentity(request, env, purpose) {
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  return hmac(`local-rate:${purpose}:${ip}`, env.AUTH_PEPPER || 'unavailable');
}

export async function consumeRateLimit(db, rateKey, limit, windowSeconds) {
  const now = nowSeconds();
  const cutoff = now - windowSeconds;
  const row = await db.prepare(`
    INSERT INTO local_rate_limits (rate_key, window_started_at, request_count)
    VALUES (?, ?, 1)
    ON CONFLICT(rate_key) DO UPDATE SET
      request_count = CASE WHEN local_rate_limits.window_started_at < ? THEN 1 ELSE local_rate_limits.request_count + 1 END,
      window_started_at = CASE WHEN local_rate_limits.window_started_at < ? THEN excluded.window_started_at ELSE local_rate_limits.window_started_at END
    RETURNING window_started_at, request_count
  `).bind(rateKey, now, cutoff, cutoff).first();
  return Number(row?.request_count || 1) <= limit;
}

export function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + chunkSize, bytes.length)));
  }
  return btoa(binary);
}

export function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function detectImageType(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mimeType: 'image/jpeg', extension: 'jpg' };
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { mimeType: 'image/png', extension: 'png' };
  if (bytes.length >= 12 && String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP') return { mimeType: 'image/webp', extension: 'webp' };
  return null;
}
