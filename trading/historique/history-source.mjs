import { MANIFEST_SHA256 } from './catalog.mjs';
const endpoint = '/api/lab/history';
export async function sha256(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2,'0')).join('');
}
export async function loadManifest(fetcher = fetch) {
  const response = await fetcher(endpoint, { credentials:'same-origin', cache:'no-store' });
  if (!response.ok) throw new Error(`Historique indisponible (${response.status}). Vérifie ta connexion au site.`);
  const raw = await response.text();
  if (await sha256(raw) !== MANIFEST_SHA256) throw new Error('Le manifeste ne correspond pas à la version vérifiée.');
  const data = JSON.parse(raw);
  if (data.schema !== 'nykuto-mnq-history-v1') throw new Error('Format inconnu.');
  return data;
}
export async function decodePart(encoded, part) {
  if (await sha256(encoded) !== part.encodedSha256) throw new Error('Empreinte du bloc incorrecte.');
  const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
  const raw = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  if (await sha256(raw) !== part.sha256 || new TextEncoder().encode(raw).length !== part.bytes) throw new Error('Contenu du bloc incorrect.');
  const rows = JSON.parse(raw);
  if (rows.length !== part.count || rows[0]?.[0] !== part.from || rows.at(-1)?.[0] !== part.to) throw new Error('Couverture du bloc incorrecte.');
  return rows;
}
export async function loadHistory(dataset, { from = -Infinity, to = Infinity, fetcher = fetch, progress = () => {} } = {}) {
  const selected = dataset.parts.filter(p => p.to >= from && p.from < to), rows = [];
  for (const [i, part] of selected.entries()) {
    const response = await fetcher(`${endpoint}?dataset=${dataset.id}&part=${part.index}`, { credentials:'same-origin', cache:'no-store' });
    if (!response.ok) throw new Error(`Bloc indisponible (${response.status}).`);
    const decoded = await decodePart(await response.text(), part);
    for (const row of decoded) if (row[0] >= from && row[0] < to) rows.push(row);
    progress(i+1, selected.length);
  }
  if (from === -Infinity && to === Infinity && (rows.length !== dataset.count || await sha256(JSON.stringify(rows)) !== dataset.rowsSha256)) throw new Error('Historique assemblé incorrect.');
  return rows;
}
export function toCsv(rows) {
  return 'time,open,high,low,close,volume\n' + rows.map(r => r.map(v => v === null ? '' : v).join(',')).join('\n') + '\n';
}
