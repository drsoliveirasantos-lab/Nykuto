# Nykuto Trading HQ

Private personal trading workspace intended for `trading.nykuto.com`.

## Current Lab — cross-market audit

The Lab opens with `/lab/#marketAudit`: 126 distinct normal-cost diagnostic
trades, all 67 archived trials reconciled, 264 exit checks and 138 causal context
prefix checks. Thirty-two views compare winners, losers, unknown confirmations,
pre-entry features, price-path bounds, sides, hours, weekdays, exits and refusals.
Initial and doubled costs use explicit matched/unmatched-trade attribution.
The report distinguishes the August diagnostic from its account model.

MGC's time-of-day split is a future test hypothesis; MNQ's August losing trades
never reached +1R, and MES/MYM remain weak. No strategy is newly qualified, no
filter is activated and the ledger remains unchanged. See the complete
[market audit](lab/MARKET_AUDIT_RESULTS.md) and its
[method](lab/MARKET_AUDIT_PROTOCOL.md).

## Latest Lab comparison — Jeu 30, August 2026

The August panel remains at `/lab/#augustGame`. Diego explicitly requested August;
the same Game 29 economic rules were frozen locally before calculating it.
All four markets have 21 complete sessions. The continuous 25K account model
loses 561.50 USD on 26 trades at initial costs and 887 USD on 17 trades with
costs doubled. Neither objective nor floor is reached. The full diagnostic,
without account floor/target checks, loses 975 USD on 18 stress trades.

The panel shows 21 daily rows, five weekly groups (August 31 is partial),
continuous balances, market contributions and refusal reasons for both modes
and both costs. It distinguishes missing data and stopped days from no-trade
days and clears stale results on a failed refresh. No August optimization was
performed. August is now observed for this portfolio; the 66 old ledger entries
remain intact and the requested evaluation brings the total to 67 trials.
The portfolio remains unqualified and execution remains disabled. See
[JEU30_RESULTS.md](lab/JEU30_RESULTS.md) for the complete daily and weekly tables.

## Archived Lab comparison — Jeu 29

The archived panel at `/lab/#portfolioGame` shows how four profiles are replayed
chronologically with one position and two daily entries for the entire account.
The 80 common complete sessions give +492.75 USD on 100 trades, but March–April
loses 190 USD and realized drawdown reaches 13.05R. Five criteria fail. Both
windows have missing sessions, so neither is a complete 25K account evaluation.
The panel shows both costs, market contributions, daily activity and rejected
candidates. At that stage, one new joint configuration brought the ledger to
66 trials and reserve May–August remained closed. Game 30 subsequently evaluates
August by request. All execution remains disabled. See
[JEU29_RESULTS.md](lab/JEU29_RESULTS.md) for results, method and limits.

## Market research profiles

The profile menus remain at `/lab/#marketProfiles`. Four independent profiles
inspect existing strategies with separate menus, costs and qualification
failures. Initial research focuses: Game 28 on MNQ/MYM, Game 23 on MES, Game 26
on MGC. These are choices made after observing old results; none is independently
confirmed or enabled for execution. That interface step ran no new market backtest and left the
ledger at 65 trials. A shared research preflight models the common
risk budget, pending reservations and one simultaneous position across markets.
Its examples are fictitious and no real account is connected. See
[MARKET_PROFILES.md](lab/MARKET_PROFILES.md) for behavior, tests and limits.

## Archived Lab comparison — Jeu 28

The preceding exploratory experiment remains `/lab/#protectionGame`: a fee-covered
stop moved only after a completed +1R bar, effective on the next bar. It keeps
Game 23 fixed150 entries and excludes the Game 27 reentries. MNQ improves from
+887.50 to +931.50 USD on the same 36 trades because one loss becomes zero;
MES/MGC deteriorate and MYM remains negative. All four fail qualification.
The panel shows both costs, matched-entry effects, daily activity and limits.
At that stage the ledger retained 65 trials with no independent confirmation;
the May–August reserve was unscored. Game 27 and earlier comparisons remain archived.
See [JEU28_RESULTS.md](lab/JEU28_RESULTS.md).

## Earlier comparison — Jeu 06

`/lab/#marketGame` compares the unchanged session-close EMA + ADX strategy on
SPY, MES and MNQ during July–December 2025, with normalized R, explicit per-unit
cost assumptions and a doubled-cost rerun. One click loads a private verified
snapshot and calculates totals, period results, cumulative curves and research
gates. All bots remain disabled. MNQ's aggregate +5.23 R does not pass the
consistency gate because September–October is negative. The fixed protocol,
data boundaries and complete results are in [MARKET_COMPARISON.md](lab/MARKET_COMPARISON.md).
Licensed raw price histories are stored privately in `TRADING_DATASETS`, served
by `/api/lab/jeu06` after Access signature validation, and never committed here.

## V1 scope

`/discipline/` adds a pre-trade self-report and drawdown scenario calculator,
including manual trading. Stress, fatigue, FOMO, emotion, plan and checks are
saved before entry. A five-minute pause is a personal timer, not a broker lock.
Post-trade R, emotion and plan adherence can be attached and inserted
idempotently into the personal account journal, which shows before/after emotion.
No psychological diagnosis or profitability score is produced.

Records use account-scoped `nykuto-trading-preparations-v1`; the optional export
contains this personal history. Existing trades are preserved. Storage failures
must not claim success or replace unreadable history. If journal linkage fails,
the preparation retains its saved result and offers a retry. Confirmed records sync through the personal account. There is no broker connection. Drawdown assumes unchanged cash flows and currency;
successive hypothetical losses compound on remaining capital. Initial calculator
amounts are an example, not account data.

- TradingView Advanced Chart widget for market visualization;
- local risk/position-size calculator;
- personal account journal and R statistics;
- pre-trade checklist;
- market replay training screen with candle-by-candle reveal;
- simulated Long/Short positions inside Replay, including optional stop/target handling;
- compact desktop workspace where Dashboard, Risk, Journal and Plan open as single module views instead of one long scrolling page;
- `/lab/` Strategy Lab with deterministic strategy configuration and an active historical Backtest V1;
- no broker execution and no automated real-money trading;
- no server-side portfolio or credential storage.

Journal entries, preparations, checklist state, calculator defaults and Strategy Lab configuration are saved in account-scoped D1 records. Replay trades with a valid stop are appended to the same personal journal in R. First and last names are required after email-PIN login. See `account/README.md` for tester provisioning, feedback and the owner-only legacy import.

## Compact workspace

The Dashboard's dedicated density stylesheet reduces calendar and card spacing
without reducing touch targets. The common menu exposes `Connexions`, linking to
`/connections/`. Its searchable gallery saves a broker/platform preference in the
member's existing account state and explains the available personal TradingView
webhook inbox and the unimplemented broker/history sync. The earlier
`/account/#connections` form remains compatible. See `connections/README.md`.
Each user must configure
their alert on TradingView; an internal test alone does not confirm delivery.

The Dashboard now includes a personal monthly calendar, cumulative R curve, daily
trade detail and mode/timezone filters. It uses the authenticated user's journal,
with explicit data-quality and legacy-date notices. New entries carry closing
time and mode; no broker history or monetary balance is implied. See
`performance/README.md` for the scope and metric definitions.

Desktop Trading HQ prioritises density because it is a private trading workspace. The shared `compact.css` layer reduces spacing and UI typography on large screens while keeping mobile form controls large enough for reliable touch input. `navigation.js` turns the Dashboard, Risk, Journal and Plan anchors into mutually exclusive module views so switching modules does not require scrolling through unrelated sections. Replay and Lab remain dedicated routes.

## Strategy Lab

`/lab/` is the control surface for the systematic-trading workflow:

1. define deterministic strategy rules and risk limits;
2. backtest them on historical data;
3. run the validated rules as a Paper Bot using live-market inputs but fictitious capital;
4. run a Shadow phase that records trades the system would have taken without sending broker orders.

Backtest V1 is active. It reuses the allow-listed historical endpoint used by Replay and currently supports three explicit, inspectable signal models:

- EMA crossover;
- RSI re-entry after an extreme zone;
- price breakout with a volume confirmation threshold.

Signals are generated only from information available at the close of a candle and simulated entries occur at the following candle's open to avoid same-bar look-ahead. Stops use ATR multiples; targets use the configured R:R. Only one simulated position can be open at a time. The daily trade limit, daily maximum realized loss and pause-after-consecutive-losses rules are enforced during the simulation. A configurable per-trade cost in R is subtracted from results.

The manual simulator first handles the observed open: adverse stop gaps fill
at that open, while favorable target gaps receive no improvement over the target.
Otherwise, if stop and target both fall inside one OHLC candle, it records the
stop first because the intrabar path is unknown. Daily brakes reset each UTC day.

The result surface reports trades, win rate, total R, expectancy, profit factor,
maximum drawdown and longest losing streak. The 70/30 chronological split runs
two separate simulations. Development closes any remaining position at its own
final close; validation starts flat with fresh brakes and no pending signal.
Indicators retain past observations only. The combined total joins these two
simulations rather than representing one continuous account. Small samples are
explicitly labelled; repeated manual trials are not independent confirmation.
See [MANUAL_BACKTEST.md](lab/MANUAL_BACKTEST.md) for the September 9 corrections,
synthetic regression cases and remaining source/calendar limits. Frozen Games
and their results are unchanged.

Paper Bot and Shadow remain visibly OFF. They must not be presented as active until live-market ingestion, scheduling, persistence and monitoring have been implemented and validated. Broker execution remains explicitly out of scope.

Jeu 04 adds a fixed independent comparison of EMA alone versus EMA + No-range
on three January–June 2026 windows. It requires an older SPY 15m CSV because the
current Yahoo source cannot supply that period. The imported file remains in
the current tab. Missing data blocks the calculation explicitly; no placeholder
market result is displayed. Protocol, execution corrections, data checks and
limitations are documented in [INDEPENDENT_VALIDATION.md](lab/INDEPENDENT_VALIDATION.md).

## Analyse du graphique

`/analysis/` lets members select a MNQ contract, 20–500 candles, 15-minute or hourly
bars and an endpoint. A native chart and explanations use exactly that window:
confirmed highs/lows, potential MSS/BOS, EMA direction and candle shapes. Data
comes from the existing verified private Jeu 09 history; it is not live or taken
from the TradingView widget. See `analysis/README.md` for rules, limits and checks.

A chart menu now toggles trend EMAs, confirmed HH/HL/LH/LL, BOS, potential MSS,
other breaks, engulfing and other candle shapes, pivot levels, RSI14, volume and
Bollinger bands. Visibility does not change the analysis or reset the zoom.
The last available historical session and per-contract date limits are explicit.

## Market Replay

`/replay/` is an isolated training interface designed to cover the learning need for bar replay without copying TradingView's proprietary replay implementation.

The replay deliberately sends only already-revealed candles to the chart. Controls support one-candle stepping, timed playback, reset, a random recent date and several common timeframes. A local paper position can be opened at the currently visible close. A valid stop lets the simulator size the position from the Trading HQ reference capital/risk and calculate the final result in R.

Historical candles come through the same-origin read-only Pages Function `functions/api/replay.js`. The endpoint is intentionally allow-listed rather than acting as a general proxy:

- Binance public klines for BTC/ETH/SOL pairs;
- a public Yahoo Finance chart feed for the selected US ETFs, indices, equities and commodity futures.

The Yahoo chart endpoint is not a contractual Nykuto data source and may change, throttle or limit intraday history. The interface must keep that limitation visible and fail clearly rather than fabricate candles. No market-data credential is committed to Git. A future licensed provider or broker data feed can replace this adapter without changing the Replay or Backtest UI.

Because an OHLC candle does not reveal the exact intrabar sequence, if both a simulated stop and target are inside the same newly revealed candle the V1 simulator conservatively treats the stop as occurring first. This is an explicit training assumption, not a claim about real execution.

## Privacy and publication

The production hostname is protected by Cloudflare Access. `robots.txt`, HTML robots directives and `_headers` provide additional defense in depth but are not substitutes for authentication.

The dedicated Cloudflare Pages project is `trading-nykuto`, rooted at this `trading/` directory. During V1 validation it deploys from `feat/trading-hq-v1`; it should move to `main` only after the repository checks and owner validation required by the Nykuto workflow.

No API key, broker credential, password or personal portfolio export may be committed to Git. Future broker or market-data integrations must keep credentials server-side and should begin read-only.

## Typography

The general Nykuto typography hierarchy still applies, but this single-user trading terminal intentionally uses a denser desktop scale after explicit owner request. Headings remain larger than their subordinate content. Mobile inputs retain larger control text and touch targets for usability.

## External charts

The dashboard chart uses TradingView's official free Advanced Chart widget. TradingView data availability and widget behavior remain subject to TradingView's own service and market-data terms.

The Replay chart is separate and uses a pinned open-source Lightweight Charts browser library; it does not unlock, wrap or bypass TradingView Premium functionality.

## Ergonomics audit — September 8–9, 2026

See [UX_AUDIT.md](UX_AUDIT.md) for findings, fixes and browser-test boundaries.
Shared navigation now exposes the same routes including Replay, with a collapsible
mobile menu, active-page semantics and working module history/focus. The risk
calculator rejects blank prices and contradictory long/short levels; its scope
is explicitly euro-denominated cash units, not futures contracts or Forex lots.
Journal deletion asks confirmation, form closure restores focus and saves expose
a local status. Global journal statistics reuse the same valid-record rules as
the calendar. Color preferences have their own account state, separate from risk
settings. No licensed prices or audit fixtures are published.
