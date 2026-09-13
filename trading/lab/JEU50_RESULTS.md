# Jeu 50 — Results: ORB + RSI vs ORB + RSI + Tokyo

Exploratory MNQ test on Diego's merged TradingView 1-minute exports, evaluation window **1 June–31 August 2026**. This does not change the verified reference and does not authorize live execution.

## Main comparison

| Variant | Trades | Wins | Win rate | Total R | Mean R/trade | Profit factor |
|---|---:|---:|---:|---:|---:|---:|
| ORB base | 34 | 12 | 35.29% | +2.00 R | +0.059 R | 1.09 |
| ORB + anti-late RSI | 30 | 12 | 40.00% | **+6.00 R** | **+0.200 R** | **1.33** |
| ORB + RSI + `tokyo-ever-break` | 20 | 7 | 35.00% | +1.00 R | +0.050 R | 1.08 |

At a normalized fixed risk of **$100 per trade**, mean expectancy corresponds approximately to:

- ORB base: **+$5.88/trade**;
- ORB + RSI: **+$20.00/trade**;
- ORB + RSI + Tokyo: **+$5.00/trade**.

This dollar translation is only a normalized fixed-risk illustration; it is not a Lucid payout forecast and excludes fees/slippage.

## Monthly split

### ORB + RSI

| Month | Trades | Total R |
|---|---:|---:|
| June | 11 | +10 R |
| July | 10 | -1 R |
| August | 9 | -3 R |

### ORB + RSI + primary Tokyo confirmation

| Month | Trades | Total R |
|---|---:|---:|
| June | 9 | +6 R |
| July | 7 | -1 R |
| August | 4 | -4 R |

The Tokyo requirement removes ten of the thirty RSI-filtered ORB trades, but it also removes five winners. Total expectancy falls from **+6 R to +1 R**, and August becomes slightly worse.

## Sensitivity to the verbal Tokyo definition

| Tokyo definition after RSI | Trades | Wins | Win rate | Total R | Mean R/trade | PF |
|---|---:|---:|---:|---:|---:|---:|
| `tokyo-ever-break` (primary) | 20 | 7 | 35.00% | +1 R | +0.050 R | 1.08 |
| `tokyo-state` | 16 | 5 | 31.25% | -1 R | -0.063 R | 0.91 |
| `tokyo-first-break` | 13 | 5 | 38.46% | +2 R | +0.154 R | 1.25 |

None beats the existing ORB + RSI candidate's +0.200 R/trade. The result is therefore not a hidden consequence of choosing only one reasonable interpretation of the associate's Tokyo-break language.

## Decision

1. **Reject Tokyo confirmation as a mandatory filter for the existing New York ORB family.**
2. Preserve ORB + anti-late RSI as the stronger research candidate from this window.
3. Keep Tokyo range logic available as a **separate strategy/session family** rather than forcing it into the New York ORB.
4. Do not infer that the associate's discretionary Tokyo setup is disproved: this test only asks whether a coarse Tokyo-break confirmation improves Nykuto's existing New York ORB.
5. The next useful test is H1→M5 alignment as an isolated addition to ORB + RSI, not another stacked feature bundle.
6. Real-money execution remains OFF.

## Interpretation

Jeu 49 showed that Tokyo-break markers had promising raw 15-minute directional behavior in isolation. Jeu 50 shows that this does **not** transfer automatically into better economics when Tokyo confirmation is bolted onto a different entry family (New York ORB/retest). This is precisely why session strategies should remain separate unless a controlled test demonstrates incremental edge.

The June–August window has already influenced research and is not independent validation.