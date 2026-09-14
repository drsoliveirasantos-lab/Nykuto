# Nykuto Trading — Footprint Pro Wave 11 Parallel Robustness

Date: 2026-09-14
Status: retrospective robustness / SHADOW only. No production rule, risk, TP or SL change.

## Scope

Wave 11 runs the currently possible robustness tests in parallel on the existing Wave 8 M15+POC health-triad sample (57 observations):

- health triad score at +5/+10/+15/+20 minutes;
- BUY vs SELL asymmetry;
- session interaction (New York time);
- day-block bootstrap of HEALTHY (3/3) versus WEAK/FAILURE (0–1/3);
- top-five-trade removal robustness.

Tests requiring new cell-level V2 data, exact post-entry order-of-events, or genuinely unseen prospective days remain pending and cannot be manufactured from the old aggregate CSVs.

## 1. Health triad by horizon

Triad = M5 flow alignment + price progress > 0R + confirmed M15 POC migration in trade direction.

| Time | State | n | Mean R30 | PF | Positive |
|---|---|---:|---:|---:|---:|
| +5m | 3/3 HEALTHY | 33 | +0.732R | 5.67 | 72.7% |
| +5m | 2/3 | 8 | +1.284R | 51.33 | 87.5% |
| +5m | 0–1/3 WEAK | 16 | -0.188R | 0.70 | 18.8% |
| +10m | 3/3 HEALTHY | 26 | +0.976R | 19.58 | 84.6% |
| +10m | 2/3 | 19 | +0.643R | 2.81 | 52.6% |
| +10m | 0–1/3 WEAK | 12 | -0.515R | 0.14 | 16.7% |
| +15m | 3/3 HEALTHY | 23 | +1.064R | 18.18 | 82.6% |
| +15m | 2/3 | 14 | +1.040R | 7.07 | 64.3% |
| +15m | 0–1/3 WEAK | 20 | -0.380R | 0.34 | 30.0% |
| +20m | 3/3 HEALTHY | 20 | +1.335R | 9.90 | 85.0% |
| +20m | 2/3 | 19 | +0.744R | 18.25 | 68.4% |
| +20m | 0–1/3 WEAK | 18 | -0.524R | 0.18 | 22.2% |

Interpretation: +5m is noisy and not monotonic. +10m is the earliest horizon with a clean ordinal separation and remains the leading research checkpoint.

## 2. Day-block bootstrap: HEALTHY 3/3 vs WEAK 0–1/3

2,000 resamples by trading day:

- +5m: mean difference +0.895R; 95% interval [-0.092, +1.684].
- +10m: mean difference +1.500R; 95% interval [+0.869, +2.156].
- +15m: mean difference +1.445R; 95% interval [+0.844, +2.213].
- +20m: mean difference +1.867R; 95% interval [+0.920, +2.920].

The +10/+15/+20 intervals remain positive under day-block resampling. This is retrospective evidence, not independent prospective validation.

## 3. Top-five removal

Mean R after removing the five best trades from each subgroup:

- +10m HEALTHY 3/3: +0.514R.
- +10m 2/3: -0.361R.
- +10m WEAK 0–1/3: -0.928R.
- +15m HEALTHY 3/3: +0.467R.
- +15m 2/3: -0.082R.
- +15m WEAK 0–1/3: -0.763R.
- +20m HEALTHY 3/3: +0.481R.
- +20m 2/3: +0.155R.
- +20m WEAK 0–1/3: -0.868R.

This makes HEALTHY 3/3 materially more robust than the intermediate 2/3 state. The 2/3 state should remain descriptive, not treated as an A+ state.

## 4. BUY vs SELL at +10m

- BUY HEALTHY 3/3: n=4, +1.860R, PF ~151.5, 75% positive. Sample too small for inference.
- BUY 2/3: n=12, +1.089R, PF ~4.47, 50% positive.
- BUY WEAK 0–1/3: n=7, -0.602R, PF ~0.01, 14.3% positive.
- SELL HEALTHY 3/3: n=22, +0.816R, PF ~14.62, 86.4% positive.
- SELL 2/3: n=7, -0.122R, PF ~0.72, 57.1% positive.
- SELL WEAK 0–1/3: n=5, -0.395R, PF ~0.34, 20% positive.

The negative WEAK state is present on both sides. BUY HEALTHY looks strong but n=4 is unusably small; no side-specific rule is promoted.

## 5. Session interaction at +10m

This sample is concentrated in pre-market New York.

- 08:00–09:00 HEALTHY 3/3: n=15, +0.486R, PF ~20.89, 80.0% positive.
- 08:00–09:00 WEAK 0–1/3: n=9, -0.577R, PF ~0.01, 11.1% positive.
- 09:00–09:30 HEALTHY 3/3: n=11, +1.645R, PF ~19.09, 90.9% positive.
- 09:00–09:30 WEAK 0–1/3: n=3, -0.331R, PF ~0.50, 33.3% positive.

The 09:00–09:30 concentration remains visible, but it was already discovered on these data. It remains context only and must not be optimized into a hard time gate.

## Decision

1. Keep +10m as the primary SHADOW health checkpoint.
2. `HEALTHY 3/3` is the strongest live-state research candidate.
3. `WEAK/FAILURE 0–1/3` is a coherent adverse state and remains negative after robustness checks.
4. `2/3` is not robust enough to be promoted to a strong state because top-five removal often collapses it.
5. No automatic exit, risk increase, side-specific rule or session gate is promoted.

## Tests launched but blocked by data availability

The following are now defined for the V2 prospective collector and should run automatically as soon as new observations exist:

- MAX BUY / MAX SELL / MAX +/-DELTA location;
- buy/sell/delta centroids;
- flow concentration / entropy;
- imbalance location by bar zone;
- flow-to-POC / flow-to-entry / flow-to-SR distances;
- exact post-entry path for BE / partial exit / trailing stop simulation;
- prospective HEALTHY / WEAKENING / FAILURE transition validation;
- prospective BUY-vs-SELL, session and volatility robustness.

These cannot be validly backfilled from the old aggregate exports.
