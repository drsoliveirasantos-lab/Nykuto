export const LISTING_STATUSES = new Set(['draft', 'published', 'reserved', 'rented', 'archived']);
export const CURRENCIES = new Set(['PYG', 'USD']);
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

export function statusLabel(status) {
  return ({ draft: 'Rascunho', published: 'Disponível', reserved: 'Reservado', rented: 'Alugado', archived: 'Arquivado' })[status] || status;
}

export function serializeListing(row) {
  return {
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
    version: Number(row.version),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  };
}
