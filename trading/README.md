# Nykuto Trading HQ

Private personal trading workspace intended for `trading.nykuto.com`.

## V1 scope

- TradingView Advanced Chart widget for market visualization;
- local risk/position-size calculator;
- local trade journal and R statistics;
- pre-trade checklist;
- market replay training screen with candle-by-candle reveal;
- simulated Long/Short positions inside Replay, including optional stop/target handling;
- compact desktop workspace where Dashboard, Risk, Journal and Plan open as single module views instead of one long scrolling page;
- `/lab/` Strategy Lab with deterministic strategy configuration and an active historical Backtest V1;
- no broker execution and no automated real-money trading;
- no server-side portfolio or credential storage.

Journal entries, checklist state, calculator defaults and Strategy Lab configuration are stored only in browser `localStorage` in V1. Replay trades with a valid stop are appended to the same local journal in R.

## Compact workspace

Desktop Trading HQ prioritises density because it is a private single-user terminal. The shared `compact.css` layer reduces spacing and UI typography on large screens while keeping mobile form controls large enough for reliable touch input. `navigation.js` turns the Dashboard, Risk, Journal and Plan anchors into mutually exclusive module views so switching modules does not require scrolling through unrelated sections. Replay and Lab remain dedicated routes.

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

If stop and target both fall inside one OHLC candle, V1 conservatively records the stop first because the intrabar path is unknown. An open position at the end of the sample is closed at the final close.

The result surface reports trades, win rate, total R, expectancy, profit factor, maximum drawdown and longest losing streak. The last 30% of chronological candles are treated as a validation segment and displayed separately from the first 70%. This is a basic out-of-sample guardrail, not proof of robustness. Small samples are explicitly labelled.

Paper Bot and Shadow remain visibly OFF. They must not be presented as active until live-market ingestion, scheduling, persistence and monitoring have been implemented and validated. Broker execution remains explicitly out of scope.

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
