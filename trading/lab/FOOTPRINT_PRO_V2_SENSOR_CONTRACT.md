# Nykuto Pro V2 — 9/9 Sensor Contract

Date: 2026-09-14
Status: research contract / no production promotion

## Architecture

1. `[1/9] NYKUTO PRO — CORE M5`
2. `[2/9] NYKUTO PRO — M1 MICRO SENSOR`
3. `[3/9] NYKUTO PRO — M2 MICRO SENSOR`
4. `[4/9] NYKUTO PRO — M3 MICRO SENSOR`
5. `[5/9] NYKUTO PRO — M4 MICRO SENSOR`
6. `[6/9] NYKUTO PRO — M10 PRESSURE SENSOR`
7. `[7/9] NYKUTO PRO — M15 FLOW SENSOR`
8. `[8/9] NYKUTO PRO — M30 ACTIVITY SENSOR`
9. `[9/9] NYKUTO PRO — M45 REGIME SENSOR`

Only CORE owns the visible phone HUD and priority alerts. All other scripts are silent sensors.

## Common sensor outputs

Every sensor should expose/export at least:

- `SENSOR_OK`
- `SOURCE_CLOSE_MS`
- `DATA_AGE_MIN`
- `FP_AVAILABLE`
- `FP_ROWS`
- `FP_DELTA_PCT`
- `FP_POC_MOVE`
- `FP_BUY_IMBALANCES`
- `FP_SELL_IMBALANCES`
- `STATE_CODE`
- `SCHEMA_VERSION`

V2 prospective cell-level fields where Pine exposes them:

- `FP_MAX_BUY_PRICE`
- `FP_MAX_SELL_PRICE`
- `FP_MAX_POS_DELTA_PRICE`
- `FP_MAX_NEG_DELTA_PRICE`
- `FP_MAX_BUY_VOLUME`
- `FP_MAX_SELL_VOLUME`
- BUY/SELL/delta centroids
- flow concentration / entropy
- imbalance location lower/middle/upper bar
- distances to close, entry, POC, support, resistance
- `FLOW_EFFICIENCY`
- `ABSORPTION`
- `EXHAUSTION`

## Role discovery targets

- M1: first micro flip, noise detector, very early acceleration/deceleration.
- M2: confirm/reject M1 flip.
- M3: persistence and micro maturation.
- M4: transition bridge into M5.
- M5: Nykuto execution state, live health and trade path.
- M10: intermediate pressure and continuity.
- M15: decision layer, POC, response, acceptance, health.
- M30: activity surprise, compression/expansion, runner context.
- M45: slow regime, STALE/FRESH/rotation.

## CORE derived states

The CORE should derive explicit states rather than a giant additive score:

- `MICRO_NOISE`
- `MICRO_BUILDING`
- `MICRO_CASCADE`
- `MICRO_RECOVERY`
- `PRESSURE_ALIGNED / PRESSURE_OPPOSED`
- `M15 + POC STRONG CONFIRM`
- `POC ACCEL`
- `FLOW RESPONSE`
- `FLOW ACCEPTANCE A+ — SHADOW`
- `STALE / CHASE`
- `STALE+`
- `HEALTHY`
- `WEAKENING`
- `PERSISTENT WEAKENING`
- `RECOVERED`
- `TRADE FAILURE`
- `RUNNER CANDIDATE — RESEARCH`

## Reliability rules

- Every external state must carry its exact source-close timestamp.
- The CORE must reject stale/missing dependencies instead of silently treating them as neutral.
- Front-facing strong states require all dependencies used by that state to be `SENSOR_OK`.
- A missing sensor changes `SYSTEM 9/9` to `8/9` etc. and marks dependent states incomplete.
- Historical and replay decisions must use only source bars whose close time is <= decision time.
- No commercial BUY/SELL, risk, SL or TP is changed by this contract.

## Research principle

Collect broadly, decide narrowly. Nearby timeframes may be correlated/redundant. A sensor earns decision power only if it adds incremental information conditional on the already-known states and survives prospective validation.
