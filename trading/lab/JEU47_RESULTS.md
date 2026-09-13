# Jeu 47 — Results: V8 context on MNQ, June–August 2026

Exploratory three-month diagnostic on Diego's merged MNQ 1-minute TradingView exports. The V8 context engine is added to Trading Nykuto but is **not** promoted to live execution.

## ORB continuation diagnostic

The existing MNQ opening-range breakout/retest logic was reconstructed on complete 5-minute bars from the 1-minute exports. Target = 2R, structural stop, conservative stop-first resolution if both stop and target occur in one M5. Reported R excludes fees and the full multi-market account machinery.

| Variant | Trades | Wins | Win rate | Total R | Mean R/trade |
|---|---:|---:|---:|---:|---:|
| ORB base | 34 | 12 | 35.29% | +2.00 R | +0.059 R |
| ORB + anti-late-entry RSI | 30 | 12 | 40.00% | +6.00 R | +0.200 R |

Monthly split:

| Month | Base | RSI-filtered |
|---|---:|---:|
| June | 11 trades, 63.64%, +10 R | 11 trades, 63.64%, +10 R |
| July | 13 trades, 23.08%, -4 R | 10 trades, 30.00%, -1 R |
| August | 10 trades, 20.00%, -4 R | 9 trades, 22.22%, -3 R |

The RSI veto removed four trades while preserving the 12 winners in this reconstruction, improving +2 R to +6 R. This is promising as a **candidate filter**, but July and August remain negative and the sample is only 30 filtered trades. It is not a validated improvement and does not replace the verified reference.

## New event diagnostics at +15 minutes

These are directional observations, not simulated trades.

| Event | Usable observations | Correct direction | Mean directional move |
|---|---:|---:|---:|
| `R↑` | 1,259 | 49.48% | -2.05 pts |
| `R↓` | 1,170 | 49.66% | -0.63 pts |
| `DIV↑` | 1,315 | 51.48% | -1.26 pts |
| `DIV↓` | 1,275 | 52.55% | +1.33 pts |
| `MSS↑` | 1,042 | 51.63% | -1.94 pts |
| `MSS↓` | 1,006 | 52.09% | +2.05 pts |
| `MSS↑` + recent bullish RSI/divergence context | 613 | 53.34% | -1.91 pts |
| `MSS↓` + recent bearish RSI/divergence context | 558 | 49.64% | +0.08 pts |

The useful conclusion is that RSI exits, divergence and MSS are **not** individually strong enough to become standalone entry commands. Even the combined reversal context is not yet an economically defined strategy because no dedicated stop, target and admission geometry have been fixed.

## Session stratification

Session windows are measured as the first 90 minutes after Tokyo, London and New York opens in New York local clock for the June–August EDT sample. They are descriptive only.

Bullish reversal context (`MSS↑` plus recent bullish RSI/divergence):

- Tokyo: 42 observations, 59.52% positive at +15m, +9.70 pts mean directional move.
- London: 40 observations, 57.50%, +1.88 pts.
- New York: 54 observations, 50.00%, -15.41 pts.

Bearish reversal context:

- Tokyo: 37 observations, 43.24%, -0.31 pt.
- London: 45 observations, 51.11%, +3.53 pts.
- New York: 47 observations, 46.81%, +16.24 pts mean directional move despite sub-50% hit rate, showing a skewed outcome distribution.

These small session subsets are insufficient for promotion. Session remains a stratification variable, not a free score point.

## Decision

1. Keep **ORB continuation** and **structural reversal** as separate strategy families.
2. Keep the RSI anti-late-entry rule as a **research candidate**, not an active production rule.
3. Keep `R`, `DIV`, `MSS`, `BR/SR` as context/labels until a dedicated reversal entry/stop/target protocol is pre-registered and tested.
4. Do not make MSS mandatory for the ORB family.
5. Preserve real-money execution OFF.

No independent validation, payout claim or live-order authorization is created by Jeu 47.
