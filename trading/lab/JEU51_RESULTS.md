# Jeu 51 — Results: ORB + RSI + H1→M5 alignment

Exploratory replay on Diego's merged MNQ TradingView 1-minute exports, 1 June–31 August 2026. Real-money execution remains OFF.

## Data/replay audit
The reconstructed entry generator reproduces the locked Jeu 50 signal counts exactly: 34 ORB signals, 30 after the asymmetric RSI filter, with monthly counts 11/10/9 after RSI. The conservative local exit replay resolves those 30 as +3R rather than the previously recorded +6R (the difference is one July trade). Therefore the locked Jeu 50 +6R remains the historical reference, while the alignment comparison below uses one internally consistent conservative replay for all variants. Do not mix the two exit ledgers as if they were identical.

## Controlled alignment comparison

| Variant | Trades | Wins | Win rate | Total R (conservative replay) | Mean R/trade | PF |
|---|---:|---:|---:|---:|---:|---:|
| ORB + RSI replay reference | 30 | 11 | 36.67% | +3R | +0.100R | 1.16 |
| + EMA 9/21 H1→M5 aligned | 16 | 5 | 31.25% | -1R | -0.063R | 0.91 |
| + EMA 20/50 H1→M5 aligned | 7 | 1 | 14.29% | -4R | -0.571R | 0.33 |

At normalized $100 risk, the internally consistent replay corresponds to +$10/trade for reference, -$6.25/trade for 9/21 alignment, and -$57.14/trade for 20/50 alignment, before fees/slippage. These are research normalizations, not payout forecasts.

### Monthly R

| Variant | June | July | August |
|---|---:|---:|---:|
| ORB + RSI replay reference | +10R | -4R | -3R |
| + EMA 9/21 aligned | +3R | 0R | -4R |
| + EMA 20/50 aligned | -2R | +1R | -3R |

### What the filters removed
- EMA 9/21 alignment kept 16/30 trades and rejected 14. The rejected set itself produced +4R in the conservative replay; therefore the filter removed useful trades rather than isolating losses.
- EMA 20/50 alignment kept only 7/30 trades and rejected 23. The rejected set produced +7R; the surviving sample was strongly negative.

## Decision
1. Reject mandatory H1→M5 EMA 9/21 alignment for the current ORB+RSI family.
2. Reject the tested EMA 20/50 H1→M5 approximation even more strongly; it collapses sample size and expectancy.
3. Preserve the locked Jeu 50 ORB+RSI candidate as the stronger historical research reference (+6R in its original ledger), but flag the one-trade exit-ledger discrepancy for reconciliation before any promotion.
4. Do not conclude that the associate's discretionary H1→M5 method is invalid. This experiment only tests whether these mechanical EMA alignment definitions improve Nykuto's existing New York ORB/retest family.
5. Keep live execution OFF.

## Next research implication
The last two controlled additions (Tokyo confirmation and mandatory H1→M5 EMA alignment) both failed when bolted onto ORB+RSI. The next useful work should reconcile the Jeu 50 exit discrepancy and then improve exits/targets or analyze winning vs losing ORB+RSI trades, rather than stack another mandatory directional filter.
