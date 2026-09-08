// Frozen before the first collected session. No scoring or order execution here.
export const COLLECTION = Object.freeze({
  id: 'jeu08-mnqz6-v1', ticker: 'MNQZ6', product: 'MNQ', venue: 'XCME',
  prep: '2026-09-09', start: '2026-10-01', end: '2026-11-30',
  calendarSource: 'https://www.nyse.com/trade/hours-calendars',
  calendarCheckedAt: '2026-09-08', maximumDelayHours: 48,
  engineCommit: '7a20a9459bfdd2b4546c7b0ec6b04ee721d9a2be',
  requiredWindows: 3, availableWindows: 1, paperEnabled: false
});
export const COLLECTION_KEY = 'jeu08/collection-v1.json';
const localClock = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });

export function plannedSessions() {
  const sessions = [];
  for (let time = Date.parse(`${COLLECTION.prep}T12:00:00Z`); time <= Date.parse(`${COLLECTION.end}T12:00:00Z`); time += 86400000) {
    const day = new Date(time), date = day.toISOString().slice(0, 10);
    if ([0, 6].includes(day.getUTCDay()) || date === '2026-11-26') continue;
    const hour = Number(localClock.formatToParts(day).find(p => p.type === 'hour').value);
    const open = time / 1000 + (570 - hour * 60) * 60;
    const close = open + (date === '2026-11-27' ? 210 : 390) * 60;
    sessions.push({ date, open, close, expectedBars: (close - open) / 900, phase: date < COLLECTION.start ? 'prep' : 'test' });
  }
  return sessions;
}

export async function sha256(text) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(hash)].map(n => n.toString(16).padStart(2, '0')).join('');
}

export function inspectSession(record, session, now = Date.now()) {
  const reasons = [];
  if (!record) return { date: session.date, phase: session.phase, complete: false, bars: 0, expectedBars: session.expectedBars, prices: false, schedule: false, timely: false, reasons: ['Pas encore reçue'] };
  if (record.date !== session.date || record.ticker !== COLLECTION.ticker || !Array.isArray(record.bars) || record.bars.length > 100 || !Array.isArray(record.scheduleEvents) || record.scheduleEvents.length > 1000) throw new Error('Séance collectée invalide.');
  const fetched = Date.parse(record.collectedAt);
  if (typeof record.collectedAt !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(record.collectedAt) || !Number.isFinite(fetched) || fetched > now + 60000 || fetched < session.close * 1000) throw new Error('Collecte avant clôture ou horodatage invalide.');
  const timely = fetched <= session.close * 1000 + COLLECTION.maximumDelayHours * 3600000;
  if (!timely) reasons.push('Collecte tardive, au-delà de 48 h');
  if (record.source?.provider !== 'Massive' || !/^[a-f0-9]{64}$/.test(record.source.rawSha256 || '') || record.source.paginationComplete !== true) throw new Error('Provenance ou pagination non vérifiée.');
  const seen = new Set();
  for (const bar of record.bars) {
    if (!Array.isArray(bar) || bar.length !== 6 || !bar.every(Number.isFinite)) throw new Error('Bougie invalide.');
    const [time, open, high, low, close, volume] = bar;
    if (!Number.isInteger(time) || time % 900 || time < session.open || time >= session.close || seen.has(time) || volume < 0 || low <= 0 || high < Math.max(open, close, low) || low > Math.min(open, close) || [open, high, low, close].some(p => Math.abs(p * 4 - Math.round(p * 4)) > 1e-6)) throw new Error('Prix, tick, doublon ou heure hors séance.');
    seen.add(time);
  }
  const prices = seen.size === session.expectedBars;
  if (!prices) reasons.push(`Prix incomplets : ${seen.size}/${session.expectedBars} bougies`);
  const events = new Map();
  for (const event of record.scheduleEvents) {
    if (event.product_code !== COLLECTION.product || event.trading_venue !== COLLECTION.venue || event.session_end_date !== session.date || !['open', 'close', 'pre_open', 'paused', 'halt', 'pcp'].includes(event.event) || typeof event.timestamp !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(event.timestamp) || !Number.isFinite(Date.parse(event.timestamp))) throw new Error('Horaire futures invalide.');
    events.set(`${event.event}/${Date.parse(event.timestamp)}`, event);
  }
  let opened = null, schedule = false;
  for (const event of [...events.values()].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))) {
    const at = Date.parse(event.timestamp) / 1000;
    if (event.event === 'open') opened = at;
    else {
      if (event.event === 'close' && opened !== null && opened <= session.open && at >= session.close && at > opened) schedule = true;
      opened = null;
    }
  }
  if (!schedule) reasons.push('Horaires futures incomplets ou interruption à examiner');
  return { date: session.date, phase: session.phase, complete: prices && schedule && timely, bars: seen.size, expectedBars: session.expectedBars, prices, schedule, timely, collectedAt: record.collectedAt, reasons };
}

export function inspectCollection(bundle, now = Date.now()) {
  if (bundle.schema !== 'jeu08-collection-v1' || bundle.protocol !== COLLECTION.id || !Array.isArray(bundle.records) || bundle.records.length > 58 || !Number.isFinite(Date.parse(bundle.updatedAt))) throw new Error('Journal de collecte invalide.');
  const planned = plannedSessions(), dates = new Set(planned.map(s => s.date)), records = new Map();
  for (const record of bundle.records) {
    if (!dates.has(record.date) || records.has(record.date)) throw new Error('Date répétée ou hors protocole.');
    records.set(record.date, record);
  }
  const rows = planned.map(session => ({ ...inspectSession(records.get(session.date), session, now), due: session.close * 1000 < now }));
  const due = rows.filter(s => s.due), complete = rows.filter(s => s.complete);
  return {
    protocol: COLLECTION.id, ticker: COLLECTION.ticker, asOf: new Date(now).toISOString(), updatedAt: bundle.updatedAt,
    automationScheduled: bundle.automation?.enabled === true && typeof bundle.automation?.id === 'string' && bundle.automation.id.length > 0,
    planned: planned.length, due: due.length, complete: complete.length,
    prepComplete: complete.filter(s => s.phase === 'prep').length, prepPlanned: rows.filter(s => s.phase === 'prep').length,
    testComplete: complete.filter(s => s.phase === 'test').length, testPlanned: rows.filter(s => s.phase === 'test').length,
    bars: rows.reduce((total, r) => total + r.bars, 0), rows,
    lastAttempt: bundle.lastAttempt ? { at: bundle.lastAttempt.at, outcome: bundle.lastAttempt.outcome } : null,
    archiveComplete: complete.length === planned.length,
    // Data completeness is not strategy confirmation. No automatic scoring or activation.
    calculated: false, paperEnabled: false, shadowEnabled: false
  };
}

// Provider CSV, including quoted fields; reject pagination hints and malformed rows.
export function readProviderCsv(text) {
  if (typeof text !== 'string' || /next.page|next_url|truncated|\[\.\.\.\]/i.test(text)) throw new Error('Réponse tronquée ou paginée : récupérer toutes les pages.');
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (!quoted && (c === ',' || c === '\n')) { row.push(cell.replace(/\r$/, '')); cell = ''; if (c === '\n') { if (row.some(Boolean)) rows.push(row); row = []; } }
    else cell += c;
  }
  if (quoted) throw new Error('CSV incomplet.');
  if (cell || row.length) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
  const header = rows.shift();
  if (!header || new Set(header).size !== header.length || rows.some(r => r.length !== header.length)) throw new Error('CSV invalide.');
  return rows.map(r => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

export async function normalizeCapture(raw, now = Date.now()) {
  const session = plannedSessions().find(s => s.date === raw.date);
  if (!session || raw.paginationComplete !== true) throw new Error('Capture hors période ou incomplète.');
  const prices = readProviderCsv(raw.pricesCsv), events = readProviderCsv(raw.schedulesCsv);
  if (!prices.length || !events.length) throw new Error('Source vide : conserver un échec de collecte.');
  const bars = prices.map(r => {
    if (r.ticker !== COLLECTION.ticker || !/^\d{19}$/.test(r.window_start || '') || ['open', 'high', 'low', 'close', 'volume'].some(k => r[k] === undefined || r[k].trim() === '')) throw new Error('Réponse de prix inattendue.');
    const stamp = BigInt(r.window_start);
    if (stamp % 1000000000n) throw new Error('Bougie non alignée.');
    const time = Number(stamp / 1000000000n);
    if (time >= session.open && time < session.close && r.session_end_date !== raw.date) throw new Error('Mauvaise séance futures.');
    return [time, ...['open', 'high', 'low', 'close', 'volume'].map(k => Number(r[k]))];
  }).filter(b => b[0] >= session.open && b[0] < session.close).sort((a, b) => a[0] - b[0]);
  const record = { date: raw.date, ticker: COLLECTION.ticker, collectedAt: raw.collectedAt, bars, scheduleEvents: events, source: { provider: 'Massive', rawSha256: await sha256(JSON.stringify(raw)), paginationComplete: true } };
  inspectSession(record, session, now);
  return record;
}
