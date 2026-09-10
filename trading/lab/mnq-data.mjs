import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(HERE, 'data', 'mnq-rth-m5');
const NY_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function readVarint(bytes, state) {
  let value = 0;
  let multiplier = 1;
  while (state.index < bytes.length) {
    const byte = bytes[state.index++];
    value += (byte & 0x7f) * multiplier;
    if ((byte & 0x80) === 0) return value;
    multiplier *= 128;
    if (!Number.isSafeInteger(value) || !Number.isSafeInteger(multiplier)) {
      throw new Error('MNQ corpus varint exceeds JavaScript safe integer range');
    }
  }
  throw new Error('MNQ corpus contains a truncated varint');
}

function unzigzag(value) {
  return value % 2 === 0 ? value / 2 : -(value + 1) / 2;
}

function decodeRows(bytes, priceScale) {
  const state = { index: 0 };
  const first = Array.from({ length: 6 }, () => readVarint(bytes, state));
  const rows = [{
    time: first[0],
    open: first[1] / priceScale,
    high: first[2] / priceScale,
    low: first[3] / priceScale,
    close: first[4] / priceScale,
    volume: first[5],
  }];
  let previous = first;

  while (state.index < bytes.length) {
    const next = [previous[0] + readVarint(bytes, state)];
    for (let field = 1; field < 6; field += 1) {
      next[field] = previous[field] + unzigzag(readVarint(bytes, state));
    }
    rows.push({
      time: next[0],
      open: next[1] / priceScale,
      high: next[2] / priceScale,
      low: next[3] / priceScale,
      close: next[4] / priceScale,
      volume: next[5],
    });
    previous = next;
  }
  return rows;
}

function nyParts(epochSeconds) {
  const parts = Object.fromEntries(
    NY_FORMATTER.formatToParts(new Date(epochSeconds * 1000))
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  return {
    day: `${parts.year}-${parts.month}-${parts.day}`,
    minute: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

let cachedCorpus;

export function loadMnqRthM5Corpus() {
  if (cachedCorpus) return cachedCorpus;
  const manifest = JSON.parse(readFileSync(join(DATA_DIR, 'manifest.json'), 'utf8'));
  const base64 = manifest.parts
    .map((part) => readFileSync(join(DATA_DIR, part), 'utf8').trim())
    .join('');
  const compressed = Buffer.from(base64, 'base64');
  const sha256 = createHash('sha256').update(compressed).digest('hex');
  if (sha256 !== manifest.sha256Gzip) {
    throw new Error(`MNQ corpus checksum mismatch: expected ${manifest.sha256Gzip}, got ${sha256}`);
  }
  const rows = decodeRows(gunzipSync(compressed), manifest.encoding.priceScale);
  if (rows.length !== manifest.coverage.storedRthM5Bars) {
    throw new Error(`MNQ corpus row mismatch: expected ${manifest.coverage.storedRthM5Bars}, got ${rows.length}`);
  }
  cachedCorpus = Object.freeze({ manifest, bars: Object.freeze(rows) });
  return cachedCorpus;
}

export function loadMnqResearchStream() {
  const { manifest, bars } = loadMnqRthM5Corpus();
  return {
    symbol: 'MNQ',
    ticker: 'MNQ1!',
    source: manifest.datasetId,
    intervalMinutes: 5,
    candles: bars.map((bar) => {
      const local = nyParts(bar.time);
      return {
        ...bar,
        timestamp: bar.time * 1000,
        day: local.day,
        minute: local.minute,
        closeMinute: 16 * 60,
        ticker: 'MNQ1!',
      };
    }),
    signals: new Map(),
  };
}
