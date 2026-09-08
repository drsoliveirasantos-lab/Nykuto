export const MAX_BYTES = 12 * 1024 * 1024;

function csvRows(text) {
  const delimiter = text.split(/\r?\n/, 1)[0].includes(';') ? ';' : ',';
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i += 1; }
      else quoted = !quoted;
    } else if (!quoted && c === delimiter) { row.push(field.trim()); field = ''; }
    else if (!quoted && (c === '\n' || c === '\r')) {
      if (c === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      if (rows.length > 100001) throw new Error('Le CSV dépasse 100 000 bougies.');
      row = []; field = '';
    } else field += c;
  }
  if (quoted) throw new Error('CSV incomplet : guillemet non fermé.');
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function timestamp(value) {
  if (/^\d+(\.\d+)?$/.test(value)) {
    const number = Number(value);
    return number > 1e12 ? number / 1000 : number;
  }
  // A timezone-free export must never silently inherit the viewer's timezone.
  if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/i.test(value)) {
    throw new Error('Les dates doivent être en timestamp Unix ou ISO avec fuseau (Z ou -05:00, par exemple).');
  }
  return Date.parse(value.replace(' ', 'T')) / 1000;
}

export function parseCandles(text) {
  if (text.length > MAX_BYTES) throw new Error('Fichier trop volumineux (12 Mo maximum).');
  const rows = csvRows(text.replace(/^\uFEFF/, ''));
  if (rows.length < 2 || rows.length > 100001) throw new Error('Le CSV doit contenir entre 1 et 100 000 bougies.');
  const header = rows.shift().map(v => v.toLowerCase());
  const aliases = { time: ['time', 'timestamp', 'datetime', 'date', 't'], open: ['open', 'o'], high: ['high', 'h'], low: ['low', 'l'], close: ['close', 'c'], volume: ['volume', 'v'], symbol: ['symbol', 'ticker', 'asset'] };
  const columns = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, header.findIndex(h => names.includes(h))]));
  for (const key of ['time', 'open', 'high', 'low', 'close']) {
    if (columns[key] < 0) throw new Error(`Colonne manquante : ${key}.`);
  }
  const seen = new Map();
  let duplicateCount = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (columns.symbol >= 0 && !/^(?:[A-Z]+:)?SPY$/.test((row[columns.symbol] || '').toUpperCase())) {
      throw new Error(`Ligne ${i + 2} : le Jeu 04 accepte uniquement SPY.`);
    }
    const candle = { time: timestamp(row[columns.time] || '') };
    for (const key of ['open', 'high', 'low', 'close']) {
      const value = row[columns[key]];
      if (!value || !Number.isFinite(Number(value)) || Number(value) <= 0) throw new Error(`Ligne ${i + 2} : prix ${key} invalide ou vide.`);
      candle[key] = Number(value);
    }
    candle.volume = columns.volume < 0 ? 0 : Number(row[columns.volume]);
    if (!Number.isFinite(candle.volume) || candle.volume < 0) throw new Error(`Ligne ${i + 2} : volume invalide.`);
    if (!Number.isSafeInteger(candle.time) || candle.time <= 0 || candle.time % 900 !== 0) throw new Error(`Ligne ${i + 2} : horodatage non aligné sur 15 minutes.`);
    if (candle.low > Math.min(candle.open, candle.close) || candle.high < Math.max(candle.open, candle.close) || candle.high < candle.low) throw new Error(`Ligne ${i + 2} : prix OHLC incohérents.`);
    const prior = seen.get(candle.time);
    if (prior) {
      if (['open', 'high', 'low', 'close', 'volume'].some(key => prior[key] !== candle[key])) throw new Error(`Ligne ${i + 2} : deux bougies différentes à la même heure.`);
      duplicateCount += 1;
    } else seen.set(candle.time, candle);
  }
  return { candles: [...seen.values()].sort((a, b) => a.time - b.time), duplicateCount, symbolVerified: columns.symbol >= 0 };
}
