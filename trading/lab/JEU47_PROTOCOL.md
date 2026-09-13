# Jeu 47 — V8 context: RSI exits, divergence, MSS and session context

## Purpose

Add the useful V8 observations to Nykuto without silently changing the verified Jeu 40/46 reference. This is a research-only addition. No broker order path is enabled.

The architecture separates three roles:

1. **ORB continuation** — existing New York opening-range breakout/retest logic. Candidate change: refuse Long when the closed 1-minute RSI is >70 and refuse Short when it is <30.
2. **Structural reversal context** — RSI exit event (`R↑/R↓`), confirmed pivot divergence (`DIV↑/DIV↓`) and an opposite structural break with impulse (`MSS↑/MSS↓`). Reversal context requires the RSI/divergence event within the preceding 30 minutes.
3. **Session context** — Tokyo, London and New York opening windows are labels for stratified measurement only, never automatic BUY/SELL points.

`BR/BR+` and `SR/SR+` remain descriptive reversal labels, not broker instructions.

## Dataset and window

The diagnostic uses the MNQ 1-minute TradingView CSV exports supplied by Diego, merged by Unix timestamp with identical overlaps deduplicated. Available merged history spans 25 May through 10 September 2026. The requested three complete months are **1 June through 31 August 2026**. May is retained only as indicator warm-up.

Raw exported price files are not committed to Git.

## Causality

- RSI uses Wilder smoothing over already closed 1-minute bars.
- `R↑` is a transition from RSI <30 to >=30; `R↓` is >70 to <=70.
- Pivots require two bars on each side; divergence is emitted only after the two right-hand bars are known.
- MSS requires a confirmed pivot break opposite the prior structural bias plus an impulse candle: range at least prior ATR14 and body/range >=0.60 in the break direction.
- The ORB signal remains a 09:30–10:00 New York range, later closed breakout and retest, with entry on the following M5 open.
- If stop and target are both inside the same M5 in the diagnostic ORB simulation, stop wins conservatively.

## Measurements

- **ORB PnL diagnostic:** 2R target, structural stop, one executed trade per direction/day, no fees in the reported R totals. This is isolated MNQ, not the full multi-market funded-account simulation.
- **Reversal-event diagnostic:** directional move 15 minutes after each event. No stop/target is invented for the new reversal family before a dedicated protocol defines one.

No result from this exploratory three-month window constitutes independent validation because this window has already influenced design decisions.
