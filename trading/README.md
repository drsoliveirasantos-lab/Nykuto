# Nykuto Trading HQ

Private personal trading workspace intended for `trading.nykuto.com`.

## V1 scope

- TradingView Advanced Chart widget for market visualization;
- local risk/position-size calculator;
- local trade journal and R statistics;
- pre-trade checklist;
- market replay training screen with candle-by-candle reveal;
- simulated Long/Short positions inside Replay, including optional stop/target handling;
- no broker execution and no automated trading;
- no server-side portfolio or credential storage.

Journal entries, checklist state and the calculator defaults are stored only in browser `localStorage` in V1. Replay trades with a valid stop are appended to the same local journal in R.

## Market Replay

`/replay/` is an isolated training interface designed to cover the learning need for bar replay without copying TradingView's proprietary replay implementation.

The replay deliberately sends only already-revealed candles to the chart. Controls support one-candle stepping, timed playback, reset, a random recent date and several common timeframes. A local paper position can be opened at the currently visible close. A valid stop lets the simulator size the position from the Trading HQ reference capital/risk and calculate the final result in R.

Historical candles come through the same-origin read-only Pages Function `functions/api/replay.js`. The endpoint is intentionally allow-listed rather than acting as a general proxy:

- Binance public klines for BTC/ETH/SOL pairs;
- a public Yahoo Finance chart feed for the selected US ETFs, indices, equities and commodity futures.

The Yahoo chart endpoint is not a contractual Nykuto data source and may change, throttle or limit intraday history. The interface must keep that limitation visible and fail clearly rather than fabricate candles. No market-data credential is committed to Git. A future licensed provider or broker data feed can replace this adapter without changing the replay UI.

Because an OHLC candle does not reveal the exact intrabar sequence, if both a simulated stop and target are inside the same newly revealed candle the V1 simulator conservatively treats the stop as occurring first. This is an explicit training assumption, not a claim about real execution.

## Privacy and publication

The production hostname is protected by Cloudflare Access. `robots.txt`, HTML robots directives and `_headers` provide additional defense in depth but are not substitutes for authentication.

The dedicated Cloudflare Pages project is `trading-nykuto`, rooted at this `trading/` directory. During V1 validation it deploys from `feat/trading-hq-v1`; it should move to `main` only after the repository checks and owner validation required by the Nykuto workflow.

No API key, broker credential, password or personal portfolio export may be committed to Git. Future broker or market-data integrations must keep credentials server-side and should begin read-only.

## Typography

This interface follows `../docs/typography-standard.md`: section titles remain above item titles, body/price text and metadata; form controls remain 16px for mobile usability and icon controls retain accessible touch targets.

## External charts

The dashboard chart uses TradingView's official free Advanced Chart widget. TradingView data availability and widget behavior remain subject to TradingView's own service and market-data terms.

The Replay chart is separate and uses a pinned open-source Lightweight Charts browser library; it does not unlock, wrap or bypass TradingView Premium functionality.
