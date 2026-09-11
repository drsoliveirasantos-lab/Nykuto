# Nykuto Pine parity V9

Purpose: one causal TradingView indicator that mirrors the useful **descriptive** knowledge already present in Trading Nykuto without pretending that every server-side research/risk component can run inside Pine.

## Implemented in Trading Nykuto and portable to Pine

- Local trend: EMA 9/21.
- Higher-timeframe context: configurable HTF EMA 20/50 (research/associate-method context; not a proven admission rule).
- VWAP side.
- RSI 14, 30/70 extremes and exits from those zones.
- Confirmed swing highs/lows; HH/HL/LH/LL.
- BOS and potential MSS from confirmed pivots.
- Regular RSI divergence on confirmed price pivots.
- ATR / candle displacement and body ratio.
- Relative volume.
- Candle shapes: engulfing, hammer/rejection, dominant directional body, doji rejection.
- Opening/session context: Tokyo, London, New York as labels/stratification only.
- Simple 3-candle FVG context as an optional location/confluence feature.
- Anti-late-entry logic: do not treat RSI >70 as a fresh long continuation or RSI <30 as a fresh short continuation.
- Separate continuation and reversal families.

## Research knowledge not promoted as an automatic order rule

- H1 EMA20/50 bias and MA200 context.
- Daily Open / traditional pivots / Asia and London ranges.
- FVG as a confirmation near a level.
- Ichimoku or personal cloud variants.
- Session-specific performance differences.
- RSI divergence as a mandatory condition for every setup.

These items are useful context but have not all passed the same frozen validation protocol. Pine must not convert them into independent probabilities or simply add every indicator as an obligatory filter.

## Signal architecture

### Continuation LONG / SHORT

Require a real trigger (breakout, engulfing or EMA rejection), local trend alignment, higher-timeframe alignment and reasonable extension. Score optional confluences: VWAP side, RSI momentum, relative volume, ATR expansion, structure and FVG/location.

- B+ / S+: strong confluence.
- B++ / S++: very strong confluence.

### Reversal LONG / SHORT

MSS is mandatory. Reversal context then needs at least one of: RSI exit from an extreme zone or confirmed RSI divergence. Displacement/volume and reclaimed/lost EMA/VWAP raise the grade.

- BR / SR: reversal context confirmed.
- BR+ / SR+: stronger reversal confluence.

### Context-only labels

- R up/down: RSI exits oversold/overbought.
- DIV up/down: confirmed regular RSI divergence.
- MSS up/down: market structure shift.
- TOK/LON/NY: session-opening time markers only; they never imply direction or add a free score point.

## Non-negotiable causal rules

1. Signal only on a closed source candle.
2. HTF values come from the last closed HTF candle.
3. Pivots are known only after their right-hand confirmation bars; never back-paint the signal as if it had been known at the pivot.
4. A session label is contextual, not directional.
5. Strong/very-strong is a confluence grade, not a measured probability.
6. Real-money execution remains OFF. The server-side Nykuto risk/portfolio engine (50K simulation, contract sizing, costs, daily limits, stop/target accounting, stress tests) is not reproduced by the indicator.

## Current evidence boundary

Jeu47 on MNQ June-August 2026 found the ORB anti-late-entry RSI candidate improved the reconstructed isolated sample from +2R/34 trades to +6R/30 trades, while July and August remained negative. R, DIV and MSS alone were close to 50% directional hit rates and are therefore context, not standalone entries. Keep ORB continuation and structural reversal as separate strategy families.
