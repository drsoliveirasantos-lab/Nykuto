import { readFile, writeFile } from 'node:fs/promises';
import { COLLECTION, inspectCollection, inspectSession, normalizeCapture, plannedSessions, sha256 } from '../trading/lab/prospective-collection.mjs';

// Private inputs/outputs only. This script never fetches, publishes or places orders.
// node scripts/collect-trading-session.mjs CURRENT.json CAPTURE.json NEXT.json
const [currentPath, capturePath, outputPath] = process.argv.slice(2);
if (!currentPath || !capturePath || !outputPath) throw new Error('Usage: collect-trading-session.mjs CURRENT.json CAPTURE.json NEXT.json');
const current = JSON.parse(await readFile(currentPath, 'utf8'));
const capture = JSON.parse(await readFile(capturePath, 'utf8'));
const now = Date.now();
inspectCollection(current, now);
const session = plannedSessions().find(s => s.date === capture.date);
if (!session || session.close * 1000 > now) throw new Error('Séance non terminée ou hors protocole.');
const previous = current.records.find(r => r.date === capture.date);
if (previous && inspectSession(previous, session, now).complete) throw new Error('Séance déjà complète : conserver la première capture.');
const next = structuredClone(current);
next.updatedAt = new Date(now).toISOString();
next.lastAttempt = { at: next.updatedAt, date: capture.date, outcome: 'error' };
let rawKey = null;
if (capture.error !== undefined) {
  if (!['unavailable', 'pagination', 'invalid', 'access'].includes(capture.error)) throw new Error('Code erreur non reconnu.');
  next.lastAttempt.reason = capture.error;
} else {
  const record = await normalizeCapture(capture, now);
  next.records = next.records.filter(r => r.date !== record.date).concat(record).sort((a, b) => a.date.localeCompare(b.date));
  const quality = inspectSession(record, session, now);
  next.lastAttempt.outcome = quality.complete ? 'complete' : 'incomplete';
  rawKey = `jeu08/raw/${capture.date}/${record.source.rawSha256}.json`;
}
const status = inspectCollection(next, now), serialized = JSON.stringify(next);
await writeFile(outputPath, serialized, { mode: 0o600 });
console.log(JSON.stringify({ protocol: COLLECTION.id, rawKey, revisionKey: `jeu08/revisions/${await sha256(serialized)}.json`, bytes: Buffer.byteLength(serialized), complete: status.complete, due: status.due, outcome: next.lastAttempt.outcome }));
