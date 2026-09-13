# Jeu 49 — Results: controlled V11 feature-gate screen

Exploratory screening on the same merged MNQ 1-minute June–August 2026 dataset used by Jeu48. This is **not** an ORB execution backtest and does not promote any feature to live trading.

## Continuation-marker gate screen

The screen keeps the already-emitted V11 continuation markers (`B/B+/B++` and `S/S+/S++`) and asks what happens when one feature is required in the trade direction.

| Single feature gate | Retained markers | +15m correct | Mean directional move +15m | Target hit | 1-ATR stop hit |
|---|---:|---:|---:|---:|---:|
| SMMA50 aligned | 2,469 | 50.63% | -0.39 pts | 12.39% | 72.54% |
| Ichimoku aligned | 2,177 | 50.11% | -0.49 pts | 12.77% | 72.71% |
| Candle context | 1,604 | 49.75% | -0.78 pts | 16.71% | 70.45% |
| High relative volume >=1.50x | 597 | 49.41% | -1.59 pts | 6.53% | 75.88% |
| Confirmed Tokyo range break | 62 | **62.90%** | **+9.71 pts** | 17.74% | 69.35% |

The V11 continuation population is much larger than the full-stack total because reversal markers are excluded here. The key result is relative: SMMA, Ichimoku, candle context and high-volume gates do not create a robust standalone improvement. The Tokyo-break subset is materially stronger in aggregate, but the sample is only 62 markers and remains unstable by month.

## Tokyo-break stability

| Month | Markers | +15m correct | Mean directional move +15m |
|---|---:|---:|---:|
| June | 26 | 65.4% | +12.13 pts |
| July | 14 | 71.4% | +22.29 pts |
| August | 22 | 54.5% | -1.15 pts |

The Tokyo signal therefore survives this first screen as a **research candidate only**. August loses positive expectancy despite a hit rate above 50%, so it is not robust enough for promotion.

## Direction check inside Tokyo subset

- Buy-side continuation + Tokyo break: 32 markers, 62.5% correct at +15m, +3.70 points mean directional move.
- Sell-side continuation + Tokyo break: 30 markers, 63.3% correct at +15m, +16.12 points mean directional move.
- The stronger sell-side mean is driven mainly by June/July; August sell-side mean is negative, so no short-only production rule is justified.

## Target-room note

The V11 continuation admission rule already requires the configured target-room condition, so re-applying the same >=1.25 ATR gate to the emitted V11 continuation sample would not constitute an independent ablation. It must be tested by rebuilding the continuation baseline with target-room removed, then adding it back. Jeu49 therefore does **not** claim a result for target-room from this marker-screen pass.

## Decision

1. Reject SMMA50, Ichimoku, candle-context and high-volume as mandatory standalone gates based on this screen.
2. Keep confirmed Tokyo completed-range break as the only primary feature that merits a dedicated follow-up.
3. Do not stack Tokyo with additional features yet.
4. Next controlled test: reproduce the exact Jeu47 ORB + anti-late-RSI reference, then compare `ORB+RSI` versus `ORB+RSI+Tokyo` under the same entry, stop, 2R target and conservative intrabar rules.
5. Preserve the previously verified reference and keep real-money execution OFF.

This evaluation window has already influenced development and is not independent validation.
