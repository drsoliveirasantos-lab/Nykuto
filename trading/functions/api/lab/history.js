import { serveDataset } from './jeu04.js';
import { HISTORY_PREFIX, PART_COUNTS } from '../../../historique/catalog.mjs';
export const onRequest = context => {
  const query = new URL(context.request.url).searchParams;
  if (![...query.keys()].every(k => ['dataset','part'].includes(k))) return new Response('Invalid query', { status:400 });
  if (!query.has('dataset') && !query.has('part')) return serveDataset(context, `${HISTORY_PREFIX}/manifest`, 'application/json; charset=utf-8');
  const dataset = query.get('dataset'), part = query.get('part');
  if (!Object.hasOwn(PART_COUNTS, dataset) || !/^(0|[1-9]\d*)$/.test(part ?? '') || Number(part) >= PART_COUNTS[dataset] || query.getAll('dataset').length !== 1 || query.getAll('part').length !== 1) return new Response('Invalid dataset or part', { status:400 });
  return serveDataset(context, `${HISTORY_PREFIX}/${dataset}/part-${part.padStart(3,'0')}`, 'text/plain; charset=utf-8');
};
