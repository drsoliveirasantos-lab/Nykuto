# Nykuto Trading — Footprint Pro Wave 12 Sensor Role Discovery

Date: 2026-09-14
Status: retrospective role-discovery / SHADOW only

## Data and causality

Used the latest Library Footprint exports for M1/M2/M3/M4/M10/M15/M30/M45. The common micro study window is 2026-08-24 through 2026-09-14, because M1 starts latest. Sensor values are aligned by **source close time**: only a bar whose close is <= the decision timestamp is allowed. This avoids future leakage in the lead/lag screens.

This wave is not an execution backtest. It is a role-discovery study intended to determine what each sensor can contribute before Pine V2 is deployed prospectively.

## 1. Micro stack M1/M2/M3/M4

Simple alignment of the four small timeframes is not strong enough to become an entry gate. However, the stack contains useful timing information.

### Four-way micro alignment

When all M1/M2/M3/M4 Footprint directions agree, the same micro direction matches the M15 direction **15 minutes later about 70.8%** of the time in this common window (n≈1,337 snapshots).

More important, when M15 is currently opposed to a unanimous M1–M4 micro state, M15 flips into the micro direction within 15 minutes about **75.8%** of the time (n≈504 current-opposition snapshots).

At a 30-minute horizon that advantage largely decays (~53.6% flip-to-micro), which suggests the micro stack is a **short lead/transition sensor**, not a slow-regime predictor.

Research label: `MICRO_CASCADE` / `MICRO_LEAD`.

### Three-of-four alignment

With exactly three of the four micro sensors aligned, future M15 matching is materially weaker: ~60.5% at +15m, and when M15 starts opposed it flips to the micro direction ~60.7% of the time.

Interpretation: 3/4 is information, but should be `BUILDING`, not equivalent to 4/4.

### Isolated M1 disagreement

When M1 alone opposes M2/M3/M4, the majority M2/M3/M4 direction matches M15 +15m about **63.0%** of the time, and when current M15 is opposed to that majority it flips toward the majority about **63.5%** of the time.

Interpretation: an isolated M1 flip is often noise relative to the more persistent M2/M3/M4 stack. Proposed role:

- M1 = first warning
- M2 = first confirmation
- M3/M4 = persistence validation

Do **not** treat a lone M1 reversal as a trade-failure signal.

## 2. Price-response screen of micro alignment

Four-way micro alignment by itself does not create a strong universal directional edge in the next 5–30 minutes. Point returns are small and unstable by horizon.

This is consistent with the earlier finding that M1–M4 should not be direct admission gates. Their best use is **transition timing / state change detection**, especially relative to M15/M5 health.

## 3. M10 role: intermediate pressure

Current M10 and M15 alignment separates short-horizon behavior:

- M10=M15: M15-oriented next-15m price change ≈ **+0.95 MNQ points** on average (n≈2,778 snapshots).
- M10 opposite M15: M15-oriented next-15m price change ≈ **-1.09 points** (n≈1,235).

At 30 minutes the distinction weakens substantially.

Interpretation: M10 is best treated as **intermediate pressure / short-horizon continuity**, not as an additional long-regime vote. This also avoids double-counting the known M5/M10 Delta30 correlation.

Research state: `PRESSURE_ALIGNED` / `PRESSURE_OPPOSED`.

## 4. M30 role: activity / expansion

M30 Footprint total-volume surprise strongly separates future absolute movement, even without using direction:

- activity ratio <0.8× rolling median: next-30m absolute move ≈ **22.9 points**
- 0.8–1.5×: ≈ **26.8 points**
- >=1.5×: ≈ **39.6 points**

High M30 activity also coincides with a much larger M30 range ratio (~1.78× median).

Interpretation: M30 earns a clear role as **expansion / movement-potential sensor**. It should help runner/time-horizon research, not necessarily decide BUY vs SELL.

Research states: `ACTIVITY_LOW`, `ACTIVITY_NORMAL`, `ACTIVITY_EXPANSION`.

## 5. M15/M45 role separation

When M15 and M45 are opposite, short-horizon price response in this generic snapshot study follows M15 more than M45:

- following M15 over next 15m: ~+0.95 points
- following M45: ~-0.95 points

This is directionally consistent with the established STALE finding: current/recent M15 is the more useful fast regime state while M45 describes the older regime. It does **not** replace the Nykuto-signal-conditioned STALE test.

Interpretation:

- M15 = current decision/flow layer
- M45 = old/slow regime reference
- disagreement is a rotation/staleness state, not simply another vote count.

## 6. Proposed role hierarchy after Wave 12

- M1 — earliest warning; high noise; never acts alone.
- M2 — confirms/rejects M1.
- M3 — persistence/maturation.
- M4 — final micro bridge into M5.
- M5 — execution and live trade-health layer.
- M10 — short-horizon pressure continuity.
- M15 — primary Footprint decision/POC/health layer.
- M30 — activity/expansion and runner potential.
- M45 — slow/old regime, STALE/FRESH reference.

## 7. New states worth prospective collection

1. `MICRO_NOISE`: M1 opposes but M2/M3/M4 agree.
2. `MICRO_BUILDING`: 3/4 micro alignment.
3. `MICRO_CASCADE`: 4/4 micro alignment.
4. `MICRO_LEAD`: M1–M4 unanimous while M15 is still opposed.
5. `PRESSURE_ALIGNED`: M10 agrees with M15/current trade side.
6. `PRESSURE_OPPOSED`: M10 opposes M15/current trade side.
7. `ACTIVITY_EXPANSION`: M30 activity surprise >= research threshold; collect continuously, do not hard-code runner change yet.

## 8. What is NOT promoted

- No M1/M2/M3/M4 hard gate.
- No 4/4 micro signal becomes BUY/SELL by itself.
- No M10/M30 requirement is added to M15+POC.
- No risk/TP/SL changes.
- No probability percentage is shown to the user.

## 9. Next implementation test

Build the 9 Pine scripts against `FOOTPRINT_PRO_V2_SENSOR_CONTRACT.md`, then perform:

1. compile test for all 9;
2. connection audit (`SYSTEM 9/9`);
3. source-close timestamp audit;
4. five-signal Replay/reload no-repaint audit;
5. prospective logging of micro cascade -> M5/M15 health transitions;
6. cell-level MAX BUY/SELL/delta, centroid, concentration and absorption/acceptance tests when V2 fields begin accumulating.
