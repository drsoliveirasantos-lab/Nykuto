export const LISTING_STATUSES = new Set(['draft', 'published', 'reserved', 'rented', 'archived']);
export const CURRENCIES = new Set(['PYG', 'BRL', 'USD']);
export const PROPERTY_TYPES = new Set(['apartment', 'studio', 'house', 'kitnet', 'room']);
export const POLICIES = new Set(['yes', 'no', 'consult']);
export const PARKING_TYPES = new Set(['none', 'moto', 'car', 'both']);
export const ALLOWED_COVERS = new Set([
  '/assets/demo-imobiliaria/local-studio-01.webp',
  '/assets/demo-imobiliaria/local-studio-02.webp',
  '/assets/demo-imobiliaria/local-studio-06.webp',
  '/assets/demo-imobiliaria/local-premium-01.webp',
  '/assets/demo-imobiliaria/local-premium-03.webp',
  '/assets/demo-imobiliaria/local-premium-08.webp',
  '/assets/demo-imobiliaria/local-premium-09.webp',
  '/assets/demo-imobiliaria/local-premium-11.webp',
  '/assets/demo-imobiliaria/local-tour-apartamento-a-poster.webp',
  '/assets/demo-imobiliaria/local-tour-apartamento-b-poster.webp',
  '/assets/demo-imobiliaria/local-tour-mobiliado-poster.webp'
]);

export function cleanText(value, minimum, maximum) {
  const cleaned = String(value || '').trim().replace(/\s+/g, ' ');
  return cleaned.length >= minimum && cleaned.length <= maximum ? cleaned : null;
}

export function cleanPrice(value) {
  const price = Number(value);
  return Number.isSafeInteger(price) && price >= 0 && price <= 100000000 ? price : null;
}

export function cleanCount(value, maximum = 20) {
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 && count <= maximum ? count : null;
}

export function cleanOptionalText(value, maximum) {
  const cleaned = String(value || '').trim().replace(/\s+/g, ' ');
  return cleaned.length <= maximum ? cleaned : null;
}

export function cleanDate(value) {
  const date = String(value || '').trim();
  if (!date) return '';
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ? date : null;
}

export function cleanFlag(value) {
  return value === true || value === 1 || value === '1' ? 1 : 0;
}

export function statusLabel(status) {
  return ({ draft: 'Rascunho', published: 'Disponível', reserved: 'Reservado', rented: 'Alugado', archived: 'Arquivado' })[status] || status;
}

export function serializeListing(row) {
  const listing = {
    id: Number(row.id),
    reference: row.reference,
    title: row.title,
    zoneLabel: row.zone_label,
    priceAmount: Number(row.price_amount),
    currency: row.currency,
    publicationStatus: row.publication_status,
    statusLabel: statusLabel(row.publication_status),
    availabilityLabel: row.availability_label,
    coverUrl: row.cover_url,
    propertyType: row.property_type || 'apartment',
    bedrooms: Number(row.bedrooms || 0),
    bathrooms: Number(row.bathrooms || 1),
    floorLabel: row.floor_label || '',
    furnished: Boolean(row.furnished),
    petsPolicy: row.pets_policy || 'consult',
    childrenPolicy: row.children_policy || 'consult',
    parkingType: row.parking_type || 'none',
    availabilityDate: row.availability_date || '',
    guaranteeAmount: Number(row.guarantee_amount || 0),
    agencyFeeAmount: Number(row.agency_fee_amount || 0),
    included: {
      water: Boolean(row.water_included),
      electricity: Boolean(row.electricity_included),
      internet: Boolean(row.internet_included),
      trash: Boolean(row.trash_included),
      condominium: Boolean(row.condominium_included)
    },
    locationNotes: row.location_notes || '',
    utilityNotes: row.utility_notes || '',
    description: row.description || '',
    publishedAt: row.published_at ? Number(row.published_at) : null,
    verifiedAt: row.verified_at ? Number(row.verified_at) : null,
    version: Number(row.version),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  };
  if (row.whatsapp_e164) {
    listing.contact = {
      agencyName: row.agency_name || 'Assessoria responsável',
      whatsapp: row.whatsapp_e164,
      verifiedAt: row.whatsapp_verified_at ? Number(row.whatsapp_verified_at) : null
    };
  }
  return listing;
}
