# Jeu 04 — Independent comparison

The owner requested continuation after reviewing Jeu 03. No-range is a hypothesis,
not a qualified candidate: the screenshot has 12 total trades and 4 validation
trades. Jeu 04 gathers additional evidence without lowering the earlier gates.

## Frozen protocol (before any new market result)

- SPY, regular-session 15-minute OHLC bars timestamped at interval open.
- Preparation: December 2025, at least 220 bars before January.
- Scored windows: January–February, March–April, May–June 2026.
- Each window starts flat and closes any remaining position at its last close.
- Only two variants: EMA 9/21 alone and EMA 9/21 with ADX(14) >= 20.
- Indicator formulas retained from Jeu 03; all use only current/past bars.
- Next-bar entry; ATR(14) x 1.25 initial risk; 1.5R target; one open position.
- Three entries per UTC day maximum; realized daily loss block at -2R;
  rest-of-day pause after two consecutive losses. Counters reset each day.
- Base cost: 0.05R per trade. Re-simulate with 0.10R per trade for sensitivity,
  since costs can change daily block timing and thus the later trade sequence.
- At an adverse gap beyond the stop, fill at the opening price. At a favorable
  gap beyond the target, conservatively fill at the target. Otherwise assume
  stop first when both levels lie inside a candle. A loss can exceed 1R.
- Drawdown is based on realized trade results, not mark-to-market equity.

Both variants use these corrected execution rules. Do not compare their metrics
numerically with Jeu 03 as if only the period had changed. Older games remain
untouched so their previous results and assumptions remain inspectable.

All three windows are outside Jeu 03's July–September source window, including
its July preparation data. This does not certify that the owner has never viewed
these older dates elsewhere. Once their results have been inspected, they must
not be reused as fresh validation after tuning rules. There is no parameter
optimizer, best-window selection, pooling with Jeu 03, or automatic bot activation.

## Research gate

The result is **Piste à examiner** only if there are >=40 filtered trades overall,
>=12 per window, positive expectancy in all windows, overall expectancy greater
than baseline, overall PF >=1.10, realized drawdown <=8R and positive total
expectancy with doubled costs. Otherwise it is insufficient-sample or not-confirmed.
These are project research guardrails, not universal statistical evidence.
The Wilson 95% win-rate interval is descriptive: it assumes independent trades
and is not a confidence interval for profitability or filter improvement.

## Data constraint and import

On 2026-09-08 the actual Yahoo chart request for SPY 15m, January–June 2026,
returned HTTP 422: the requested range must be within the last 60 days. Never
silently reuse recent data, change timeframe, fabricate bars or declare success.

The UI initially says **Données requises**. It accepts a local CSV (12 MiB and
100,000 rows maximum) with `time,open,high,low,close`, optional `volume,symbol`.
Unix seconds/milliseconds and ISO timestamps with explicit timezone are accepted;
timezone-free timestamps are rejected. Common Alpaca `t,o,h,l,c,v` headers also
work. A symbol column, when present, must declare SPY; its absence is disclosed.
This checks declared metadata, not an independent source/instrument certification.

Nonpositive/missing/nonfinite prices, invalid OHLC, non-15-minute-aligned times,
contradictory duplicate timestamps and intraday gaps are rejected. Identical
duplicates are counted once. US regular sessions are identified using
`America/New_York`, including DST. Out-of-session and out-of-period data are
excluded. Each scored window requires at least 30 observed sessions and data
within seven days of both boundaries. Sessions must start at 09:30 and have
at least 13 consecutive bars (allowing genuine shortened sessions).
These checks do not certify exchange-calendar completeness, absent whole
sessions, corporate-action adjustment, or provider quality.

CSV data and results stay in the current tab, with no upload or persistence.
The optional JSON report contains the rule version, file name, SHA-256,
declared-symbol verification, actual coverage, all simulated trades and metrics.
No broker credential or personal portfolio export belongs in the repository.

Alpaca was identified as a potential source with historical stock bars. Its app
was not connected when this protocol was authored. Connecting a ChatGPT app does
not automatically configure a website feed; use retrieved bars through this
import, or separately implement an authorized server-side data integration.

## Verification

`npm run test:trading-validation` covers bad input, duplicate inflation, explicit
timezones, missing preparation, incomplete windows, gaps, causal indicators,
next-bar execution, window boundaries, ADX threshold, daily pause reset, cost
sensitivity, deterministic aggregation and sample gates. Synthetic fixtures are
tests only and are never served as financial results. CI runs these checks.
