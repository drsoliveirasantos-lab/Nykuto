# Jeu 55 — Exploratory January→September MNQ replay on Massive 5-minute futures data

Purpose: answer whether the compact/fast-retest ORB idea shows any life when replayed beyond the June–August discovery window. This is deliberately exploratory and does **not** authorize live execution.

## Data
Historical MNQ quarterly contracts from Massive, 5-minute aggregates:
- MNQH6: 1 Jan–20 Mar 2026
- MNQM6: 20 Mar–19 Jun 2026
- MNQU6: 19 Jun–11 Sep 2026

The dataset therefore covers January through 11 September 2026 using actual quarterly contracts rather than TradingView's continuous MNQ1! series.

## Important approximation
This replay is not byte-for-byte identical to Jeu 53. It uses 5-minute Massive bars, a simple rolling 14-bar RSI approximation for the anti-late filter, and a simple rolling true-range average for the opening-range/ATR diagnostic. The original Jeu 53 candidate was discovered on TradingView data and its ATR/RSI calculations differ. Therefore this is a robustness probe, not a direct validation.

## Adapted fast-retest family
Frozen mechanics for this probe:
- New York opening range 09:30–10:00;
- confirmed close at least one MNQ tick outside the range;
- first retest must occur on the immediately following M5 candle;
- retest candle must touch the broken boundary, close on the breakout side, and have a body in the breakout direction;
- entry next M5 open;
- RSI anti-late rule: reject Long above 70, reject Short below 30;
- structural stop one tick beyond retest extreme;
- target 2R;
- same-bar stop/target resolved conservatively in favor of stop.

### Fast retest + RSI, without the compact-range filter
| Month | Trades | Wins | Win rate | Total R | Mean R/trade |
|---|---:|---:|---:|---:|---:|
| Jan | 1 | 1 | 100.0% | +2R | +2.000R |
| Feb | 2 | 0 | 0.0% | -2R | -1.000R |
| Mar | 3 | 1 | 33.3% | 0R | 0.000R |
| Apr | 2 | 1 | 50.0% | +1R | +0.500R |
| May | 5 | 1 | 20.0% | -2R | -0.400R |
| Jun | 3 | 2 | 66.7% | +3R | +1.000R |
| Jul | 5 | 2 | 40.0% | +1R | +0.200R |
| Aug | 4 | 2 | 50.0% | +2R | +0.500R |
| Sep 1–11 | 1 | 1 | 100.0% | +2R | +2.000R |

Aggregate: **26 trades, 11 wins, 42.3% win rate, +7R, +0.269R/trade** before fees/slippage.

This is modestly positive across the full January→11 September probe, but the monthly path is uneven and frequency is low.

### Exact numeric `OR <= 3 ATR` transfer
Applying the literal `OR <= 3 ATR` threshold with the Massive 5-minute ATR approximation leaves only two trades across the whole January→11 September period: one May loss and one July winner, net **+1R**. That sample is too small to interpret.

This happens because the ATR implementation/data construction is not the same as Jeu 53; on dates known to qualify in the TradingView sample, the Massive simple-ATR ratio can be materially larger. We therefore do **not** retune the 3.0 threshold on the same data just to force agreement.

## Decision
1. The underlying **fast-retest ORB + RSI** concept is worth keeping as a research candidate: the adapted Jan→Sep probe is +7R over 26 trades.
2. The exact `OR <= 3 ATR` filter cannot be judged from this Massive approximation because its ATR scale is not directly comparable to the TradingView/Jeu 53 implementation.
3. Do not promote the 72.7% Jeu 53 win rate; this broader probe does not reproduce that number.
4. Next useful step: replay the **exact** Jeu 53 formula on a consistent continuous MNQ 1-minute/5-minute dataset from January onward, or implement the exact Wilder ATR/RSI and roll handling on Massive before deciding whether the compact-range filter survives.
5. Live execution remains OFF.
