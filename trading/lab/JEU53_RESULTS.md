# Jeu 53 — Winners vs losers study on the 30 ORB+RSI trades

Exploratory analysis on Diego's merged MNQ 1-minute TradingView exports, 1 June–31 August 2026. Same 30 ORB+RSI trades as the locked Jeu 50 candidate; same conservative 2R exit logic. Real-money execution remains OFF.

## Reproduction audit

The local reconstruction exactly reproduces the locked candidate population and economics:

- 34 ORB setups before RSI;
- 30 trades after the asymmetric RSI filter;
- 12 winners / 18 losers;
- total = **+6R**;
- monthly = June **+10R**, July **-1R**, August **-3R**.

This closes the prior +6R/+3R replay discrepancy: the Jeu 53 implementation is aligned with the locked Jeu 50 outcome ledger.

## Direction and time

| Split | Trades | Win rate | Total R |
|---|---:|---:|---:|
| Long | 13 | 46.2% | +5R |
| Short | 17 | 35.3% | +1R |
| 10:00–10:29 entry | 9 | 33.3% | 0R |
| 10:30–10:59 entry | 10 | 50.0% | +5R |
| 11:00–11:29 entry | 6 | 33.3% | 0R |
| 11:30–11:59 entry | 5 | 40.0% | +1R |

Longs were better than shorts in this window, but sample size is too small to turn side into a mandatory filter.

## Pre-entry feature comparison

The strongest *pre-entry* separations were modest, not decisive. Winners tended to have:

- lower structural risk distance: mean 39.25 points vs 47.97 for losers;
- stronger directionally aligned EMA9/21 spread normalized by ATR: 0.61 ATR vs 0.30;
- slightly higher M5 relative volume: 1.02x vs 0.97x;
- more directional wick in the trade direction: 0.33 of candle range vs 0.24;
- shorter retest delay: 1.25 M5 bars vs 1.78;
- somewhat narrower opening range normalized by ATR: 3.25 vs 3.52;
- stronger preceding 15-minute directional move: 1.01 ATR vs 0.71.

RSI itself, VWAP distance, entry time, and simple distance beyond the OR boundary did **not** meaningfully separate winners from losers.

MFE/MAE separated winners very strongly, as expected, but these are post-entry outcome variables and therefore cannot be used as causal entry filters.

## Simple robustness probes

These are exploratory probes on the same already-used sample, not validation.

| Candidate rule | Trades | Win rate | Total R | June | July | August |
|---|---:|---:|---:|---:|---:|---:|
| Reference ORB+RSI | 30 | 40.0% | +6R | +10 | -1 | -3 |
| Opening range <= 3.0 ATR | 15 | 53.3% | +9R | +6 | +2 | +1 |
| Retest within 1 M5 bar | 20 | 50.0% | +10R | +10 | 0 | 0 |
| Prior 15m move >= 0.8 ATR | 15 | 53.3% | +9R | +4 | +5 | 0 |
| OR <= 3.0 ATR AND retest <= 1 bar | 11 | 72.7% | **+13R** | +8 | +3 | +2 |
| Retest <= 1 bar AND prior 15m >= 0.8 ATR | 11 | 63.6% | +10R | +5 | +4 | +1 |

The strongest in-sample candidate is therefore **opening-range width <= 3.0 ATR + first-bar retest**, yielding 11 trades and +13R. It is attractive because both conditions are causal and economically interpretable: avoid abnormally wide opening ranges and prefer immediate retests rather than stale breakouts.

However, this rule was discovered on the same June–August sample. It is therefore **data-mined and must not be promoted yet**. The apparent 72.7% win rate is not an independent estimate of future win rate.

## Interpretation

The losing trades do not appear to be explained by one magic indicator. The useful pattern is more structural:

1. excessively wide opening ranges are less efficient for the fixed ORB/retest geometry;
2. delayed retests lose quality;
3. stronger recent directional impulse helps;
4. simple RSI/VWAP/volume thresholds add little by themselves.

This also explains why stacking Tokyo, H1 alignment, Ichimoku, SMMA and other broad filters did not help the ORB family: the most promising information is local to the setup itself.

## Decision

1. Keep the production/research reference unchanged: ORB + asymmetric RSI + fixed 2R.
2. Create a new candidate for the next controlled replay: `orb-rsi-compact-fast-retest` = opening range <= 3.0 ATR + retest delay <= 1 M5 bar.
3. Do not promote or enable execution from Jeu 53.
4. Validate the candidate on unseen data first. If no clean unseen MNQ interval is available, use September onward as forward/paper validation rather than retuning June–August.
5. Preserve the current 2R target while validating the entry filter so exit and entry changes are not mixed.
