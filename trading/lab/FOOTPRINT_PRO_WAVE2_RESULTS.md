# Nykuto Trading — Footprint Pro Wave 2

Date: 2026-09-14  
Status: **retrospective mechanism screening / SHADOW only**. No commercial Pine change, no hard-gate promotion.

## Scope

Wave 2 uses the same hash-pinned M1/M2/M3/M4/M5/M10/M15/M30/M45 CSV family and the same 1,712 M5 Nykuto signals reproduced by Footprint Pro V1. It tests mechanisms rather than another universal score:

- M5 flow maturation / streaks and flips;
- M15 POC velocity and acceleration;
- flow-efficiency / absorption proxies available in the old aggregate CSVs;
- STALE intensity and age;
- volatility/session interactions;
- MFE/MAE and time-to-R trajectories;
- fixed-target / hold-time / breakeven management policies.

The old CSVs **do not contain cell-level MAX BUY/MAX SELL prices**, so price-level localization, centroids, concentration and true absorption-by-price tests remain deferred until V2 prospective collection.

## 1. Strongest new mechanism: M15 POC acceleration

Within the already-strong M15 families, positive acceleration of the oriented M15 POC is the clearest new candidate.

Sequential HOLD30 screens:

| Parent | Variant | n | Mean R | PF | Mean R after top 5 removed |
|---|---|---:|---:|---:|---:|
| M15 + POC | POC acceleration > 0 | 36 | +0.674 | 4.32 | +0.221 |
| Flow Response | POC acceleration > 0 | 34 | +0.628 | 4.26 | +0.161 |
| Flow Acceptance | POC acceleration > 0 | 31 | +0.748 | 5.38 | +0.249 |

Opportunity-level day-block bootstrap, comparing POC-acceleration-positive observations with the other observations inside the same parent family:

- M15+POC: incremental mean difference about **+0.595R**, 95% day-block interval **[+0.027, +1.195]**.
- Flow Response: +0.434R, interval [-0.138, +1.061].
- Flow Acceptance: +0.651R, interval [-0.054, +1.375].

Interpretation: `POC_ACCEL_POS` is the best new **SHADOW quality variable** from Wave 2. Only M15+POC has a positive day-block interval in this exploratory comparison. It still uses already-seen data and must not be promoted to a hard gate.

## 2. STALE can be refined by POC opposition

STALE remains negative overall. A more coherent subgroup appears when the M15 POC itself is migrating against the Nykuto side.

- STALE + M15 POC opposed: sequential n=219, **-0.247R/trade**, PF ~0.50, after top 5 removed ~-0.310R.
- Opportunity-level day-block comparison versus other STALE observations: incremental difference about **-0.209R**, 95% interval **[-0.400, -0.035]**.
- M15 opposition magnitude 20–40% is also poor (sequential n=100, -0.289R, PF ~0.43), but its bootstrap difference interval slightly crosses zero.

Interpretation: `STALE + POC opposed` becomes the leading **STALE severity** candidate. Proposed research labels: `STALE`, `STALE+`, with `STALE+` requiring POC opposition. Still SHADOW; no commercial veto yet.

## 3. M5 maturation: useful context, not a gate yet

Longer aligned M5 streaks look better than one-bar flips in broad pre-market signals:

- PRE_BASE streak >=3: sequential n=30, +0.609R, PF 4.37, after top 5 +0.134R.
- PRE_BASE one-bar/flip-like streak1: n=44, +0.077R, PF 1.21, after top 5 -0.168R.

But within M15+POC / Flow Response the pattern is not monotonic and several small subgroups collapse after removing the top five trades. The bootstrap difference for PRE_BASE streak>=3 versus other PRE_BASE observations crosses zero.

Decision: retain `FLOW_MATURITY` / `FLOW_STREAK` as a diagnostic field, not an admission requirement.

## 4. Management / target research

The 1R benchmark remains important, but Wave 2 confirms that the best management horizon can depend on state.

### M15 + POC

- HOLD30: n=45, +0.555R, PF 3.70.
- HOLD60: n=41, **+0.684R**, PF 3.60, after top 5 +0.257R.
- TP2.5 within 60m: n=41, **+0.679R**, PF 3.85, after top 5 +0.429R.
- BE after +1R, otherwise hold60: n=41, +0.666R, PF 4.51.

This is a credible runner-management research candidate, not a production target change.

### Flow Response

HOLD30 remains better than the tested 60-minute extensions:

- HOLD30: +0.519R.
- HOLD60: +0.399R.
- TP2.5/60: +0.434R.

This argues against applying one universal runner rule to every positive Footprint state.

### Flow Acceptance A+

- HOLD30: +0.648R.
- TP2.5/60: **+0.718R**, PF 4.05, after top 5 +0.434R.
- TP2/60: +0.628R.

Interesting, but Flow Acceptance was already optimized on seen data, so the management result is doubly exploratory.

### STALE

Every tested management policy remains negative. A small 0.5R target reduces the damage but does not make STALE attractive: about -0.070R/trade.

Decision: management should eventually be **state-dependent**, but no TP/SL logic changes now.

## 5. Path / MFE-MAE evidence

On the same sequential HOLD30-selected historical streams, measured over up to 60 minutes:

| State | Median MFE | Median MAE | Hit 1R | Hit 2R | Median time to 1R |
|---|---:|---:|---:|---:|---:|
| PRE_BASE | +0.943R | -0.768R | 44.8% | 24.0% | 25m |
| M15 + POC | +1.042R | -0.530R | 51.1% | 31.1% | 20m |
| Flow Response | +0.880R | -0.607R | 49.0% | 24.5% | 30m |
| Flow Acceptance | +1.134R | -0.530R | 54.1% | 32.4% | 20m |
| STALE | +0.623R | -0.889R | 32.9% | 10.4% | 20m |

This supports two future research directions:

1. M15+POC / Acceptance are more plausible runner states than generic Flow Response.
2. STALE has materially worse excursion geometry and should be treated as a quality warning before any attempt to optimize exits.

## 6. Session and volatility

The previously observed 09:00–09:30 New York concentration appears again:

- M15+POC: about +1.324R in that window (n=15) versus ~+0.199R in 08:00–09:00.
- Flow Response: about +1.242R (n=16) versus ~+0.197R in 08:00–09:00.

This is **not** promoted to a 09:00–09:30 hard rule because the same period was already discovered in earlier work.

Normal-volatility M15 states remain strong, but the high/extreme-volatility samples are small. Volatility regime should be exported prospectively, not optimized retrospectively.

## 7. What Wave 2 changes in the Pro design

Add to the planned M15 sensor / CORE contract as research fields:

- `M15_POC_VELOCITY_ATR`
- `M15_POC_ACCEL_ATR`
- `M15_POC_OPPOSED`
- `M15_OPPOSITION_AGE`
- `M5_FLOW_STREAK`
- `M5_FLOW_MATURITY_CODE`
- `VOL_REGIME_CODE`
- `SESSION_CODE`

Front-facing states remain explicit, not a giant score:

- `M15 + POC STRONG CONFIRM`
- optional SHADOW badge `POC ACCEL`
- `STALE / CHASE`
- optional SHADOW severity `STALE+` when M15 POC is also opposed
- `FLOW MATURITY` informational only
- runner-management candidates remain research-only.

## 8. Next tests that require V2 collection

The most valuable next wave cannot be reconstructed from the old aggregate CSVs. V2 must prospectively export per-price-cell information:

- MAX BUY / MAX SELL / MAX +/- DELTA price;
- BUY/SELL/delta centroids;
- flow concentration / entropy;
- distance of aggressive flow to POC, entry, support and resistance;
- imbalance location by lower/middle/upper bar zone;
- acceptance vs absorption after high-delta cells;
- live post-entry flow deterioration snapshots.

These tests are likely more valuable than adding more correlated EMA/RSI-style filters.

## Decision

Wave 2 does **not** change the commercial Pine, risk, target or hard admissions.

Promote only to prospective SHADOW collection:

1. `M15 POC acceleration` as a positive quality field.
2. `STALE + POC opposed` as a severity field.
3. state-specific runner candidates (especially M15+POC), with no live management change yet.
4. flow streak/maturity, session and volatility as diagnostics.
