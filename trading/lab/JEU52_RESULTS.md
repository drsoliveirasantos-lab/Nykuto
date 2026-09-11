# Jeu 52 — Exit reconciliation and target study

Exploratory MNQ replay on Diego's merged TradingView 1-minute exports, 1 June–31 August 2026. Real-money execution remains OFF.

## Reconciliation of the Jeu 50 / Jeu 51 discrepancy

The ORB generator reproduces exactly 34 raw setups and 30 setups after the asymmetric RSI filter, with monthly counts 11 / 10 / 9. Replaying those same 30 trades directly on the merged 1-minute bars, entering at the first 1-minute open after the confirmed 5-minute signal candle and using the structural stop from the ORB signal, reproduces the locked Jeu 50 result: **12 wins, 18 losses, +6R at 2R target**.

Therefore the earlier +3R conservative local replay recorded in Jeu 51 is not promoted to the canonical ledger. It was a replay-artifact discrepancy, not a different signal set. The canonical exploratory reference for this June–August window remains +6R / 30 trades / +0.200R per trade before fees and slippage.

## Fixed target comparison

| Exit | Trades | Positive trades | Total R | Mean R/trade | Profit factor |
|---|---:|---:|---:|---:|---:|
| Fixed 1.5R | 30 | 13 | +2.5R | +0.083R | 1.15 |
| **Fixed 2R** | **30** | **12** | **+6.0R** | **+0.200R** | **1.33** |
| Fixed 2.5R | 30 | 10 | +5.0R | +0.167R | 1.25 |
| Fixed 3R | 30 | 8 | +2.0R | +0.067R | 1.09 |

### Monthly R

| Exit | June | July | August |
|---|---:|---:|---:|
| 1.5R | +9.0R | -2.5R | -4.0R |
| **2R** | **+10.0R** | **-1.0R** | **-3.0R** |
| 2.5R | +6.5R | +0.5R | -2.0R |
| 3R | +9.0R | -2.0R | -5.0R |

Fixed 2R remains the strongest aggregate exit in this already-researched window. 2.5R slightly improves July and August relative to 2R but gives up too much June performance to beat total expectancy.

## Management variants around the 2R target

All break-even changes are applied only after the triggering minute has fully completed, avoiding an intrabar assumption that the favorable threshold was reached before a reversal.

| Management | Total R | Mean R/trade | Positive trades | PF |
|---|---:|---:|---:|---:|
| **Fixed 2R / original structural stop** | **+6.00R** | **+0.200R** | 12 | **1.33** |
| 2R + break-even after +1R | +4.00R | +0.133R | 9 (+7 flat) | 1.29 |
| 50% at +1R, 50% at +2R | +4.00R | +0.133R | 12 | 1.29 |
| 50% at +1R, remainder BE then +2R | +3.00R | +0.100R | 16 | 1.21 |
| 2R + causal M5 structural trail after +1R | +5.64R | +0.188R | 12 | 1.33 |

The structural trail uses only confirmed M5 pivots (2 bars left / 2 bars right), activates only after +1R has been reached, and only moves the stop in the favorable direction. It comes close to fixed 2R but does not improve it.

### Monthly management R

| Management | June | July | August |
|---|---:|---:|---:|
| Fixed 2R | +10.00R | -1.00R | -3.00R |
| BE after +1R | +9.00R | -1.00R | -4.00R |
| 50/50 partial | +7.50R | -0.50R | -3.00R |
| 50/50 partial + BE | +7.00R | -0.50R | -3.50R |
| Structural trail | +10.00R | -0.21R | -4.14R |

## Decision

1. Keep **fixed 2R** as the current exit reference for the ORB + RSI research family.
2. Do not add automatic break-even at +1R; it lowers expectancy in this sample.
3. Do not add the tested 50/50 partial exits; they smooth some outcomes but reduce total R.
4. Do not replace the fixed target with the tested causal structural trail; it is slightly worse overall and worse in August.
5. Keep 2.5R as a secondary research candidate because it is the only fixed target that improves July and August simultaneously, but it is not promoted because total expectancy is lower than 2R.
6. The June–August window has already influenced research and is not independent validation. No exit is live-approved from these results alone.

## Next implication

The main weakness is not the 2R target itself. The instability is concentrated in July/August. Further work should characterize the 30 ORB+RSI entries by pre-entry features and adverse/favorable excursion, but must avoid introducing another large bundle of filters. Candidate features should be tested one at a time against the fixed-2R reference.
