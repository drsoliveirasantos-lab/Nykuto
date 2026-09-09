# Analyse du graphique

`/analysis/` gives the user a native chart and deterministic, descriptive reading
of exactly the same 20–500 requested closed candles. If an endpoint is too early,
the actual smaller count is disclosed. Contract, interval, end date, slider and
single-bar steps recalculate in document memory. Chart pan/zoom does not change
the analysis selection. Date selection snaps to the latest available candle at
or before that date, displays the actual endpoint, and rejects dates outside the
available history. Missing data and invalid selections clear the previous result.

`analysis-source.mjs` reuses the checksum-pinned private Jeu 09 snapshot and its
complete calendar validation before exposing prepared MNQH6, MNQM6 and MNQU6 cash
histories. There is no new endpoint, market-data subscription, upload, persistence,
order path or bot change. The common account middleware protects the page,
modules and data. Raw licensed prices remain outside Git. This is historical
data, not a live feed or access to the opaque TradingView widget on Dashboard.

The chart uses the same Lightweight Charts 4.2.0 standalone dependency as Replay.
The chart failure state preserves the independently calculated text. Both are
rendered from the same selected array; no data is read from TradingView.

## Display menu — September 9, 2026

The chart menu independently toggles EMA9/21, confirmed HH/LH/HL/LL, BOS,
potential MSS, other breaks, engulfing bodies, doji/hammer/upper-wick shapes,
endpoint pivot levels, RSI14, candle volume and Bollinger bands. Essential view
shows EMA, BOS, potential MSS and endpoint levels. Hide-all keeps the candles.
Options live only in page memory; there is no new account persistence. H/L denote
the first high/low, H=/L= equal levels. Swing labels sit on the confirming candle,
two selected bars after the pivot, never on an unconfirmed historical pivot.
Merged same-side labels preserve all selected observations at a shared timestamp.

`chart-indicators.mjs` uses only the validated selected array. EMA initialization
matches the existing structure reading. RSI14 averages the first 14 close changes
then uses Wilder smoothing; its first value needs 15 candles. All-flat history is
explicitly neutral (50); one-way gains/losses give 100/0. Bollinger uses a 20-close
simple average plus/minus two population standard deviations, with no values
before bar 20. Volume has its own overlay scale and is not added to the price axis.
No VWAP, divergence detector, live data or new strategy filter is claimed.

`chart-view.mjs` separates drawing from calculations. Visibility changes preserve
the horizontal viewport and do not recalculate the analysis. A changed selection
fits the chart. The optional RSI pane has a separate 0–100 scale, 30/70 reference
lines, warm-up whitespace and the price chart's logical range. Pan/zoom the price
chart to navigate both; its viewport still does not change the analysed window.

The availability message derives the last session from the verified snapshot
(August 31, 2026 for this delivery). The latest-session button selects its actual
contract and endpoint. Reload does not imply obtaining today's prices. Per-contract
date bounds and the actual endpoint remain explicit. No current prices are invented.

Tests cover Wilder arithmetic, flat/one-way cases, Bollinger warm-up and deviation,
prefix causality, selected-context independence, swing labels and confirmation,
marker visibility, independent scales and viewport retention. The chart-adapter
test is a programmatic API stub, not a browser rendering check.

## Defined observations

- Strict swing: two lower highs / higher lows on each side. A pivot becomes known
  only at the second following candle's close. Last-two-bar pivots stay unconfirmed.
  Cash bars may span overnight gaps; their actual timestamps are preserved.
- Structure: compare the last two confirmed highs and lows. All ascending is up,
  all descending is down; otherwise mixed or insufficient. No future confirmation.
- Initial direction comes from those confirmed swings or the first pivot break.
  Subsequent same-direction breaks are BOS. An opposite close is a potential MSS
  only with a body aligned with that direction, at least 60% of the range, and a
  range at least the prior ATR14, after 14 preceding selected bars. Otherwise it
  is an opposite break. A wick alone is never a closing break. These explicit
  descriptive definitions are not a validated trading system.
- EMA9/21 use selected closes, initialized at the first close. ATR14 uses selected
  true ranges, initialized at the first range and Wilder-smoothed. Nothing before
  the selected start is used; readings may change when the window changes.
- Engulfing: opposite-color bodies, full body enclosure with at least one strict
  bound, two contiguous same-session bars. Doji: body <=10% range. Hammer shape /
  upper wick: main wick >=2 bodies, opposite wick <=1 body, body >10% range.
  Dominant body: >=80% range. These do not imply a reversal probability.
- Relative volume uses the previous 20 selected candles and does not adjust for
  time of day. EMA momentum, last swing structure and last break are separate
  observations and may diverge. No combined buy/sell score is manufactured.
- Hourly candles require four contiguous same-day 15-minute bars anchored at
  09:30 New York. Full sessions yield six hours, the Christmas half-session three.
  Partial final half-hours are excluded. Contracts are never spliced together.
- Chart markers sit on the breaking candle. The ledger uses its closing time
  and records when its pivot became known. Horizontal lines show the last known
  levels at the endpoint, not levels that were available across the entire chart.

## Validation and publication follow-up

`scripts/test-trading-analysis.mjs` covers excluded-context independence, delayed
pivot confirmation, causal prefix stability, close-versus-wick and aligned-body
rules in both directions, hourly gaps/early closes, patterns and invalid data.
It is included in `npm run test:trading-validation`. A private real-snapshot
calculation checks the three contracts and both intervals without publishing prices.
UI source, links and sizing are reviewed statically; browser rendering is not
claimed to have been checked.

September 8 validation: all 65 trading tests passed, including six analysis tests;
72 selections on the private real snapshot passed across three contracts, two
intervals, three counts and four endpoints. Build, repository hygiene (zero
findings), 25 Pages Function modules and page references passed locally.

At the owner's request, after completing the code and local gates, publish to the
existing trading validation branch and schedule a separate check of the published
commit's GitHub workflows and Cloudflare deployment. Give an estimated delay,
then end the active turn while remote runs execute. The follow-up must check the
specific commit, distinguish pending/missing runs from success, fix scoped failures
when possible and report blockers. Do not merge main, change branch protection,
activate any bot or alter the future MNQ collection to make a check appear green.

## Ajustements de compréhension après audit

Le caractère historique, sans flux direct, apparaît dès l'introduction. Pendant
une saisie de nombre incomplète (hors 20–500), le graphique et sa lecture restent
ceux de la dernière sélection valide, avec un message explicite. Une nouvelle
erreur de chargement masque toujours les anciens résultats. Le contrôle
d'intégrité exige Web Crypto : un contexte non sécurisé affiche désormais un
message en français, sans désactiver ce contrôle.
