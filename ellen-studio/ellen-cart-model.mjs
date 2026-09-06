// Public reference prices only. Ellen confirms the final services and quote.
export const PRICE_DATE = '2026-09-06';
export const PYG_PER_BRL = 1168.66;
export const WHATSAPP_NUMBER = '595973877606';
export const STORAGE_KEY = 'ellen-studio:appointment-draft:v1';
export const SOURCES = Object.freeze({
  exchange: 'https://www.xe.com/currencyconverter/convert/?Amount=1&From=BRL&To=PYG',
  ewa: 'https://agendapro.com/site/py/ewabeatyexperience/sara-villagra/798422',
  valuna: 'https://agendapro.com/site/py/salondemanicureypedicuredeevacabral/maria-estigarribia/738573',
  bea: 'https://www.instagram.com/bea_nailscde/p/DcHAoGsRlbs/',
  romso: 'https://www.fresha.com/es/a/romso-luque-simon-bolivar-146-ngq7bcv3',
  dermobeauty: 'https://www.dermobeauty.com.py/sitio/servicios'
});

const entries = [
  ['nails-nude', 'Nude natural', 'Nails', 60000, 'ewa', 'Manicure tradicional'],
  ['nails-cor', 'Cor única', 'Nails', 60000, 'ewa', 'Manicure tradicional'],
  ['nails-french', 'Francesinha clássica', 'Nails', 120000, 'valuna', 'Manicure + semipermanente'],
  ['nails-french-cor', 'Francesinha colorida', 'Nails', null, null, 'Acabamento a combinar'],
  ['nails-glitter', 'Glitter em destaque', 'Nails', null, null, 'Manicure e decoração a combinar'],
  ['nails-poas', 'Poás delicados', 'Nails', null, null, 'Manicure e decoração a combinar'],
  ['nails-semi', 'Manicure semipermanente', 'Nails', 95000, 'valuna', 'Referência promocional de mercado'],
  ['nails-art-par', 'Nail art · duas unhas', 'Nails', 20000, 'ewa', 'Adicional de decoração · duas unhas'],
  ['cilios-lift', 'Lash lift', 'Cílios', 150000, 'bea', 'Lifting dos cílios naturais'],
  ['cilios-classica', 'Extensão clássica', 'Cílios', null, null, 'Valor a combinar'],
  ['cilios-hibrida', 'Extensão híbrida', 'Cílios', null, null, 'Valor a combinar'],
  ['cilios-russo', 'Volume russo', 'Cílios', 500000, 'dermobeauty', 'Referência de salão especializado'],
  ['cilios-gatinho', 'Efeito gatinho (cat-eye)', 'Cílios', 180000, 'romso', 'Referência de extensão efeito foxy'],
  ['cilios-retouche', 'Manutenção · efeito rímel ou foxy', 'Cílios', 90000, 'romso', 'Condição dos fios a avaliar'],
  ['cilios-retouche-russo', 'Manutenção · volume russo', 'Cílios', 260000, 'dermobeauty', 'Condição dos fios a avaliar'],
  ['brows-design', 'Design natural', 'Sobrancelhas', 45000, 'romso', 'Design e remoção dos fios fora do desenho'],
  ['brows-tint', 'Coloração dos fios', 'Sobrancelhas', 70000, 'dermobeauty', 'Coloração avulsa · design à parte'],
  ['brows-henna', 'Design com henna', 'Sobrancelhas', 80000, 'romso', 'Design e henna'],
  ['brows-lamination', 'Brow lamination', 'Sobrancelhas', 225000, 'dermobeauty', 'Laminação com design · sem coloração']
];
export const SERVICES = Object.freeze(entries.map(([id, name, category, pyg, source, detail]) => Object.freeze({
  id, name, category, pyg, source, detail,
  // Whole reais keep the display discreet; totals sum the displayed line amounts.
  brl: pyg === null ? null : Math.round(pyg / PYG_PER_BRL)
})));
const byId = new Map(SERVICES.map(service => [service.id, service]));
export const getService = id => byId.get(id);
export const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

// Only known, unique IDs are accepted; stored names or prices are never trusted.
export function normalizeCart(value) {
  return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && byId.has(id)))] : [];
}
export function toggleService(ids, id) {
  const current = normalizeCart(ids);
  if (!byId.has(id)) return current;
  return current.includes(id) ? current.filter(item => item !== id) : [...current, id];
}
export function summarizeCart(ids) {
  const items = normalizeCart(ids).map(id => byId.get(id));
  const unknown = items.filter(item => item.brl === null).length;
  return { items, unknown, known: items.length - unknown, total: items.reduce((sum, item) => sum + (item.brl ?? 0), 0) };
}

// An appointment enquiry is a temporary draft carried between pages in this tab.
export function readDraft(storage) {
  try { return { ids: normalizeCart(JSON.parse(storage.getItem(STORAGE_KEY) || '[]')), available: true }; }
  catch { return { ids: [], available: false }; }
}
export function saveDraft(storage, ids) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(normalizeCart(ids))); return true; }
  catch { return false; }
}
export function readCarriedDraft(search) {
  const params = new URLSearchParams(search);
  return params.has('cuidados') ? normalizeCart((params.get('cuidados') || '').split(',')) : null;
}
export function carryDraft(href, ids, origin) {
  const url = new URL(href, origin);
  if (url.origin !== origin || !url.pathname.startsWith('/ellen-studio/')) return href;
  url.searchParams.set('cuidados', normalizeCart(ids).join(','));
  return url.pathname + url.search + url.hash;
}

const cleanText = (text, limit) => String(text || '').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim().slice(0, limit);
export function appointmentMessage(ids, preferences = {}) {
  const summary = summarizeCart(ids);
  if (!summary.items.length) throw new Error('Escolha pelo menos um cuidado para montar seu pedido.');
  const lines = ['Olá, Ellen! Gostaria de consultar um horário no Ellen Studio.', '', 'Meus cuidados:'];
  for (const item of summary.items) {
    lines.push(`• ${item.category} — ${item.name}: ${item.brl === null ? 'sob consulta' : `aprox. ${money(item.brl)}`}`);
    lines.push(`  ${item.detail}`);
  }
  lines.push('');
  if (summary.known) lines.push(`${summary.unknown ? 'Subtotal estimado dos itens com referência' : 'Total estimado'}: ${money(summary.total)}`);
  if (summary.unknown) lines.push(`${summary.unknown} cuidado(s) com valor sob consulta, não incluído(s) no subtotal.`);
  lines.push('Valores indicativos de mercado em reais (R$); valor final e combinação dos cuidados a confirmar com Ellen.');
  const name = cleanText(preferences.name, 70);
  const notes = cleanText(preferences.notes, 500);
  if (name) lines.push('', `Meu nome: ${name}`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(preferences.date || '')) {
    const [year, month, day] = preferences.date.split('-');
    lines.push(`Data preferida: ${day}/${month}/${year}`);
  }
  const periods = { morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' };
  if (periods[preferences.period]) lines.push(`Período preferido: ${periods[preferences.period]}`);
  if (notes) lines.push(`Observações: ${notes}`);
  lines.push('', 'Você pode confirmar os valores e me dizer quais horários estão disponíveis?', 'Pedido pelo site: https://nykuto.com/ellen-studio/');
  return lines.join('\n');
}
export function whatsappHref(ids, preferences = {}) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(appointmentMessage(ids, preferences))}`;
}
