# Jeu 54 — Forward check of `orb-rsi-compact-fast-retest` on September 2026

Research-only forward check using Diego's merged MNQ 1-minute TradingView exports. The candidate was frozen in Jeu 53 before this replay:

- base family: New York 09:30–10:00 ORB breakout/retest;
- asymmetric RSI filter: reject Long when RSI > 70; reject Short when RSI < 30;
- opening-range width <= 3.0 ATR;
- retest delay <= 1 M5 bar after breakout;
- structural stop, fixed 2R target;
- same-bar stop/target tie resolved conservatively in favor of stop;
- no Tokyo/H1/Ichimoku/SMMA additions.

## Available unseen window
The uploaded dataset extends through **10 September 2026** only, so this is a partial-month forward check, not a complete September validation.

## Reproduction audit
The Jeu 53 reconstruction was first rechecked on June–August and reproduced the locked population exactly: 34 ORB setups, 30 after RSI, and the fixed-2R +6R reference. The cash-session Wilder ATR14 used for the candidate matches the stored Jeu 53 `atr14` feature exactly.

## September 1–10, 2026
The base ORB+RSI family produced 4 trades in the available data:

| Date | Side | OR width / ATR | Retest delay | Base outcome |
|---|---|---:|---:|---:|
| Sep 1 | Long | 2.30 ATR | 1 bar | +2R |
| Sep 2 | Long | 2.61 ATR | 3 bars | +2R |
| Sep 7 | Short | 2.33 ATR | 2 bars | +2R |
| Sep 10 | Long | 3.00 ATR | 5 bars | -1R |

Base ORB+RSI over this partial window: **4 trades, 3 wins, 75.0% win rate, +5R, +1.25R/trade**.

The frozen `orb-rsi-compact-fast-retest` candidate accepted only **Sep 1** because it was the only setup satisfying both OR <= 3.0 ATR and retest <= 1 M5 bar.

Candidate result: **1 trade, 1 win, 100% win rate, +2R, +2.0R/trade**.

## Interpretation
The first truly forward observation is favorable, but **n=1 is not evidence of a stable 72.7% win rate**. The rule has not failed, but it is far too early to promote. Three otherwise profitable base trades were excluded solely because their retest delay was 2–5 M5 bars; therefore the fast-retest filter may be trading frequency for selectivity, and the present forward sample cannot yet quantify that trade-off.

## Decision
1. Keep the candidate frozen exactly as discovered in Jeu 53; do not retune the 3.0 ATR or 1-bar thresholds from September.
2. Keep live execution OFF.
3. Continue forward/paper validation on September onward until there is a materially larger sample. A practical minimum is at least 20 candidate trades before treating forward win rate/expectancy as informative.
4. Track both the filtered candidate and the unfiltered ORB+RSI reference in parallel so rejected winners are visible rather than hidden.
