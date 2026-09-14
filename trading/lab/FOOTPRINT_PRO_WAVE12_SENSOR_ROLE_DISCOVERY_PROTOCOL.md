# Nykuto Trading — Wave 12 Sensor Role Discovery Protocol

Date: 2026-09-14
Status: research protocol / SHADOW only. No commercial Pine change, no risk or target promotion.

## Goal

Extend Footprint Pro from a minimal M5/M15/M45 architecture to a full research sensor network where every timeframe has a defined collection role, without treating neighboring timeframes as independent votes.

Target live/research stack:

1. `[1/9] NYKUTO PRO — CORE M5`
2. `[2/9] NYKUTO PRO — M1 MICRO SENSOR`
3. `[3/9] NYKUTO PRO — M2 MICRO SENSOR`
4. `[4/9] NYKUTO PRO — M3 MICRO SENSOR`
5. `[5/9] NYKUTO PRO — M4 MICRO SENSOR`
6. `[6/9] NYKUTO PRO — M10 PRESSURE SENSOR`
7. `[7/9] NYKUTO PRO — M15 FLOW SENSOR`
8. `[8/9] NYKUTO PRO — M30 ACTIVITY SENSOR`
9. `[9/9] NYKUTO PRO — M45 REGIME SENSOR`

Only CORE owns the visible HUD and user-facing alerts. All other scripts are silent sensors plus export/Data Window outputs.

## Core principle

Collect broadly, decide narrowly. M1/M2/M3/M4/M10/M30 are not promoted merely because they agree with M5/M15. Their value must be incremental, conditional, or temporal.

Examples of valid discoveries:

- M1 flip alone = noise, but M1→M2→M3 cascade preceding M5 failure = useful early deterioration state.
- M3/M4 opposition while price and M15 POC remain favorable = pullback/absorption rather than failure.
- M10 pressure may matter only when M15 is neutral, not when M15+POC is already strong.
- M30 activity may matter for runner management, not admission.

## Proposed role by timeframe

### M1 — first detector / noise discriminator
Collect: current delta, delta%, sign, flip, streak, imbalance counts, POC move, cell concentration, max-buy/max-sell location, data-quality flags.
Research: first flip latency before M5 deterioration, false-flip rate, one-sided-data frequency, recovery speed.

### M2 — first confirmation
Collect same primitive fields.
Research: does M2 confirm/invalidate M1; time from M1 flip to M2 confirmation; M1+M2 cascade vs isolated M1 noise.

### M3 — persistence / maturation
Research: persistence of micro-flow, streak length, whether M3 opposition adds information once M1/M2 are known, role in early HEALTHY→WEAKENING transitions.

### M4 — bridge into M5
Research: last microstructure layer before execution timeframe; M4/M5 disagreement, M4 flip lead-time, whether M4 predicts M5 state transition or merely duplicates it.

### M5 — execution / live health
Own Nykuto signal context, current Footprint, Delta sweet spot, flow response, health-state snapshots and user-facing live state.

### M10 — intermediate pressure
Research: sustained pressure, pressure decay, interaction with M15 neutral/confirmed states, incremental value beyond M5/M15.

### M15 — decision / POC / acceptance
Own current-flow confirmation, POC migration/velocity/acceleration, response/acceptance, STALE severity inputs and principal positive quality states.

### M30 — activity / expansion / runner context
Research: compression→expansion, activity surprise, runner persistence, volatility regime, interaction with HEALTHY live state.

### M45 — slow regime / stale detection
Own slow current-flow regime, M15↔M45 ALIGNED/FRESH/STALE/OPPOSITION states.

## Shared sensor contract

Every sensor should export at minimum:

- `FP_AVAILABLE`
- `SOURCE_CLOSE_TIME`
- `DATA_AGE`
- `FP_ROWS`
- `FP_TOTAL_VOLUME`
- `FP_DELTA_PCT`
- `FP_DIRECTION_CODE`
- `FP_POC_PRICE`
- `FP_POC_MOVE_ATR`
- `FP_MAX_BUY_PRICE`
- `FP_MAX_SELL_PRICE`
- `FP_MAX_POS_DELTA_PRICE`
- `FP_MAX_NEG_DELTA_PRICE`
- `FP_MAX_BUY_VOLUME`
- `FP_MAX_SELL_VOLUME`
- `FP_FLOW_EFFICIENCY`
- `FP_CONCENTRATION`
- `FP_CENTROID_BUY`
- `FP_CENTROID_SELL`
- `FP_CENTROID_DELTA`
- `FP_IMBALANCE_LOWER/MIDDLE/UPPER`
- `FP_ONE_SIDED_QUALITY_FLAG`
- `STATE_CODE`
- `SCHEMA_VERSION`

Not every field must be wired into CORE. Most may remain export-only for research. CORE receives compact state codes plus the few direct values needed for visible states.

## Immediate retrospective tests with existing data

These tests can be run now where history exists:

1. Lead-lag matrix: M1/M2/M3/M4 flips versus subsequent M5 flip/WEAKENING/FAILURE.
2. Cascade depth: isolated M1, M1+M2, M1+M2+M3, M1→M4 cascade.
3. Recovery matrix: micro opposition followed by realignment before M5 failure.
4. M4↔M5 disagreement: identify predictive vs redundant disagreement.
5. Conditional incremental value: test each micro TF only inside M15+POC, FLOW RESPONSE, HEALTHY and STALE families.
6. M10 conditional pressure: only when M15 is neutral vs confirmed/opposed.
7. M30 activity conditional on live-health state and runner horizon.
8. Correlation/redundancy matrix using primitive Footprint fields, followed by conditional-ablation tests.
9. Data-quality audit by TF: one-sided bars, missing Footprint, row count, age and coverage.

Because M1/M2/M3/M4 history starts later than M5/M15/M45, all retrospective comparisons must report their own overlapping sample windows and must not be compared as if they share identical history.

## Prospective tests after V2 collection starts

1. Exact micro-cascade lead time before `TRADE FAILURE`.
2. False-warning rate of M1-only and M1+M2 warnings.
3. Micro-flow sequence entropy / consistency.
4. Cell-level absorption and acceptance by bar zone.
5. Max aggressive flow location relative to entry/POC/SR.
6. Cross-timeframe centroid migration.
7. Transition models: HEALTHY→MICRO WARNING→WEAKENING→FAILURE and recovery paths.
8. State-dependent management with exact post-trigger path, including BE/partial exits/trailing.

## Front-facing design

CORE must not show nine votes. Suggested visible categories:

- `ENTRY QUALITY`
- `MICRO`: STABLE / EARLY FLIP / CASCADE / RECOVERY
- `PRESSURE`: BUILDING / HOLDING / DECAYING
- `LIVE HEALTH`: HEALTHY / WEAKENING / RECOVERED / FAILURE
- `REGIME`: ALIGNED / FRESH / STALE / STALE+
- `SYSTEM`: `9/9` sensor health

No percentage such as “87% chance” is generated from criterion counts.

## Safety against bugs and bad data

CORE should maintain a sensor-health mask. If a required sensor is stale, unavailable, schema-mismatched, or reports impossible timestamps, any derived state depending on that sensor becomes `INCOMPLETE`, not bullish/bearish.

Required audit checks:

- source-close timestamp <= decision timestamp;
- no future-bar references;
- replay value equals reload value on audited historical samples;
- sensor state cannot update before its source bar closes;
- one-sided / low-quality Footprint is tagged, never silently treated as strong flow.

## Promotion rule

A sensor role may become user-facing only if it either:

1. adds robust incremental information after controlling for existing stronger states; or
2. improves live health classification / management in prospective data; or
3. materially improves system-quality diagnostics.

Agreement alone is not enough.
