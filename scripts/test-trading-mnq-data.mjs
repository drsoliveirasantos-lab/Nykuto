import test from 'node:test';
import assert from 'node:assert/strict';

import { loadMnqRthM5Corpus, loadMnqResearchStream } from '../trading/lab/mnq-data.mjs';

test('MNQ corpus decodes with expected coverage', () => {
  const { manifest, bars } = loadMnqRthM5Corpus();
  assert.equal(manifest.symbol, 'CME_MINI:MNQ1!');
  assert.equal(bars.length, 5992);
  assert.deepEqual(bars[0], {
    time: 1779715800,
    open: 29940.5,
    high: 29958.75,
    low: 29940,
    close: 29955,
    volume: 6342,
  });
  assert.deepEqual(bars.at(-1), {
    time: 1789062300,
    open: 29202.25,
    high: 29205.25,
    low: 29188,
    close: 29191.75,
    volume: 7360,
  });
});

test('MNQ corpus is strictly ordered and OHLCV-valid', () => {
  const { bars } = loadMnqRthM5Corpus();
  let previousTime = 0;
  for (const bar of bars) {
    assert.ok(bar.time > previousTime, `non-increasing timestamp ${bar.time}`);
    assert.ok(bar.high >= Math.max(bar.open, bar.close), `invalid high at ${bar.time}`);
    assert.ok(bar.low <= Math.min(bar.open, bar.close), `invalid low at ${bar.time}`);
    assert.ok(bar.high >= bar.low, `high below low at ${bar.time}`);
    assert.ok(Number.isFinite(bar.volume) && bar.volume >= 0, `invalid volume at ${bar.time}`);
    previousTime = bar.time;
  }
});

test('MNQ research stream matches current 09:30-16:00 ET engine contract', () => {
  const stream = loadMnqResearchStream();
  assert.equal(stream.symbol, 'MNQ');
  assert.equal(stream.ticker, 'MNQ1!');
  assert.equal(stream.intervalMinutes, 5);
  assert.equal(stream.candles.length, 5992);
  assert.ok(stream.signals instanceof Map);
  for (const candle of stream.candles) {
    assert.ok(candle.minute >= 9 * 60 + 30, `${candle.day} begins before 09:30 ET`);
    assert.ok(candle.minute < 16 * 60, `${candle.day} reaches/passes 16:00 ET`);
    assert.equal(candle.closeMinute, 16 * 60);
    assert.equal(candle.ticker, 'MNQ1!');
  }
});
