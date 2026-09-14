# Nykuto Trading — Footprint Pro Wave 3

Date: 2026-09-14  
Status: **retrospective SHADOW research only**. No commercial Pine, risk, target or hard-gate change.

## Scope

Wave 3 reuses the same 1,712 M5 signals with Footprint and tests:

- post-entry M5 flow persistence / reversal at +5/+10/+15/+20 minutes;
- STALE age/severity;
- POC-acceleration robustness by BUY/SELL and phase;
- state-specific target/horizon/breakeven management;
- MFE/MAE geometry.

## 1. Post-entry flow persistence is highly informative

For M15+POC sequential trades (HOLD30):

| Snapshot | M5 flow aligned | M5 flow opposed |
|---|---:|---:|
| +5m | n=29, +0.834R, PF 11.64 | n=16, +0.050R, PF 1.12 |
| +10m | n=27, **+1.008R, PF 16.57** | n=18, **-0.123R, PF 0.70** |
| +15m | n=27, +0.764R, PF 6.57 | n=18, +0.243R, PF 1.78 |
| +20m | n=33, +0.760R, PF 5.34 | n=12, -0.008R, PF 0.97 |

For POC-ACCEL trades, the same pattern is visible: at +10m, aligned M5 flow gives about +1.130R versus -0.044R when opposed.

For FLOW RESPONSE, aligned post-entry M5 flow is also materially better at every tested snapshot.

For STALE+, post-entry opposition is particularly poor: at +5m, opposed M5 flow gives about -0.490R versus +0.027R when aligned; at +15m, about -0.450R versus -0.053R.

Interpretation: `LIVE_FLOW_HOLDING / LIVE_FLOW_OPPOSED` is a strong candidate for **trade-management SHADOW state**, not for entry filtering because the information only exists after the trade begins. A day-block bootstrap for M15+POC at +10m produced an aligned-vs-opposed difference around +1.13R with a 95% interval approximately [+0.42R, +1.92R]. This still needs prospective validation.

## 2. STALE age

STALE stays negative across age buckets:

- age 1 M15 bar: n=236, -0.140R, PF 0.65;
- age 2: n=97, -0.205R, PF 0.59;
- age >=3: n=23, -0.190R, PF 0.63.

STALE+ remains worse:

- STALE+ age1: n=132, -0.280R, PF 0.43;
- STALE+ age>=2: n=88, -0.206R, PF 0.60.

Interpretation: the risk is not confined to the first M15 flip. `STALE_AGE` is worth collecting, but Wave 3 does not support a clean monotonic severity ladder based on age alone. POC opposition remains the stronger severity variable.

## 3. POC acceleration robustness

POC-ACCEL inside M15+POC remains positive on both sides:

- BUY: n=19, +0.806R, PF 3.82;
- SELL: n=17, +0.525R, PF 5.73.

By phase:

- June: n=8, +0.878R;
- July: n=13, +0.342R;
- Aug-Sep: n=15, +0.852R.

Small samples remain a major limitation. Keep `POC ACCEL` SHADOW.

STALE+ is consistently negative on both sides and all broad phases:

- BUY: n=120, -0.251R;
- SELL: n=99, -0.242R;
- June: -0.218R;
- July: -0.297R;
- Aug-Sep: -0.225R.

This materially strengthens STALE+ as a severity label, but it is still retrospective.

## 4. State-specific management grid

### M15+POC

Best retrospective rows among the tested grid:

- TP2.5 / 90m: n=39, +0.773R, PF 3.22, after top-5 removal +0.522R;
- HOLD60: n=41, +0.684R;
- TP2.5 / 60m: n=41, +0.679R, after top-5 +0.429R;
- BE after +1R / 60m: n=41, +0.666R, PF 4.51.

### POC-ACCEL

- TP2.5 / 90m: n=34, **+0.934R**, PF 4.35, after top-5 +0.667R;
- TP2.5 / 60m: n=36, +0.787R, PF 4.35;
- TP2.0 / 90m: n=34, +0.784R.

This is promising runner geometry, but the state itself was discovered retrospectively, so these are doubly exploratory results.

### FLOW RESPONSE

HOLD30 remains competitive. The best tested row was TP2.5 / 90m at about +0.550R, only modestly above HOLD30 +0.519R and with fewer sequential trades. Do not create a universal runner rule.

### STALE+

All tested management variants remain negative. Even the best rows (e.g. TP1/30) remain around -0.13R/trade. Exit optimization does not rescue the underlying state.

## 5. Path geometry

Sequential M15+POC trades show materially better favorable excursion than STALE+. POC-ACCEL is stronger still:

- M15+POC median MFE ~1.13R, median MAE ~-0.53R;
- POC-ACCEL median MFE ~1.70R, median MAE ~-0.45R;
- STALE+ median MFE ~0.90R, median MAE ~-1.16R.

These values support collecting state-dependent management information, not changing live TP/SL yet.

## Design consequences

Add prospective/live research fields to Nykuto Pro:

- `LIVE_M5_FLOW_STATE`;
- `LIVE_M5_FLOW_5M`, `10M`, `15M`, `20M` snapshots or a packed deterioration state;
- `STALE_AGE_M15`;
- keep `M15_POC_ACCEL_ATR` and `M15_POC_OPPOSED`;
- preserve signal-time ENTRY STATE separately from LIVE STATE.

The live HUD may eventually show `FLOW HOLDING`, `FLOW WEAKENING`, or `FLOW OPPOSED`, but these must remain SHADOW until prospective evidence exists.

## Decision

No production promotion. Wave 3 strengthens three priorities for prospective V2:

1. POC acceleration as a positive quality field.
2. STALE+ (STALE + POC opposition) as a negative severity field.
3. Post-entry flow persistence/reversal as the leading Adaptive Trade Manager research input.
