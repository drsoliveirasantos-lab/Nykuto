# Nykuto Trading — current state

Last updated: 2026-09-14  
Purpose: stable handoff for new ChatGPT conversations and future contributors. Read this file before continuing Trading work, then follow the linked protocol/results.

## Production boundary

- Trading production branch: `feat/trading-hq-v1`.
- Current Footprint/Pro working branch: `research/trading-footprint-pro-v1`.
- `NYKUTO STANDARD — PARTNERS` remains the partner/non-Premium line and must not receive `request.footprint()`.
- Private Pine source and raw market CSVs remain outside the public repository.
- No broker, Paper or Shadow execution is activated by this research.

## Current Footprint evidence

The repository-owned Footprint Pro runner reproduces the already-reported historical candidate statistics from 1,712 M5 signals with Footprint.

Current hierarchy remains:

1. STALE CURRENT M15/M45 — strongest negative state; SHADOW warning.
2. M15 current Footprint + POC migration — strongest simple positive badge candidate.
3. M15 FLOW RESPONSE — secondary positive badge.
4. FLOW ACCEPTANCE A+ — optimized on seen data; SHADOW only.
5. M5 Delta30 30–50 — small-sample ELITE research only.

M10 and M30 remain useful context. M1–M4 have not validated as admission gates, but they are now explicitly retained as microstructure sensors for temporal/conditional role discovery rather than discarded.

## Wave 2+ additions

New SHADOW candidates and management observations remain research-only:

- `M15_POC_ACCEL_ATR > 0` is a leading positive quality field.
- `STALE + M15 POC opposed` is a leading STALE severity field (`STALE+`).
- M5 flow streak/maturity, session and volatility remain diagnostics.
- Live health research distinguishes flow holding, weakening, recovery and failure after entry.
- Price response is required alongside Footprint deterioration before treating a trade as failed; flow opposition alone is not sufficient.
- No retrospective management rule is promoted to live exits yet.

The old aggregate CSVs do not contain full per-price-cell MAX BUY/MAX SELL locations, centroids or concentration, so true price-level absorption/acceptance tests require V2 prospective collection.

## Personal Nykuto Pro architecture — expanded research stack

The project is no longer optimizing for the minimum number of scripts. Diego accepts several hidden sensor scripts if they improve data collection, auditability and future role discovery.

Target research layout is now **nine active Pro scripts**:

- `[1/9] NYKUTO PRO — CORE M5`
- `[2/9] NYKUTO PRO — M1 MICRO SENSOR`
- `[3/9] NYKUTO PRO — M2 MICRO SENSOR`
- `[4/9] NYKUTO PRO — M3 MICRO SENSOR`
- `[5/9] NYKUTO PRO — M4 MICRO SENSOR`
- `[6/9] NYKUTO PRO — M10 PRESSURE SENSOR`
- `[7/9] NYKUTO PRO — M15 FLOW SENSOR`
- `[8/9] NYKUTO PRO — M30 ACTIVITY SENSOR`
- `[9/9] NYKUTO PRO — M45 REGIME SENSOR`

Only `[1/9]` should own the visible phone HUD, labels and priority alerts. All other sensors should be visually silent except for Data Window/export outputs.

### Sensor role principle

Each timeframe has a role to discover rather than an equal vote:

- M1: first detector / noise discriminator.
- M2: first confirmation of M1.
- M3: persistence / maturation.
- M4: bridge from microstructure to M5 execution.
- M5: Nykuto execution and live-health engine.
- M10: intermediate pressure.
- M15: decision layer, POC migration, acceptance/response.
- M30: activity/expansion/runner context.
- M45: slow regime, STALE/FRESH.

The research objective is incremental, conditional and temporal value — not simple alignment counts.

### CORE interface / source-budget rule

TradingView external-source limits mean the CORE cannot directly wire every raw output from every sensor. Sensors should therefore export rich research fields for CSV/Data Window while exposing compact `STATE_CODE` / health outputs to CORE. Secondary fields should remain export-only or be packed into state codes.

Each sensor should publish quality metadata such as availability, source-close timestamp, data age, row count and schema version. CORE must be able to display a `SYSTEM 9/9` health state and mark dependent states `INCOMPLETE` when a sensor is missing/stale.

## 1R

1R remains an explicit benchmark. Historical tests show a universal 1R cap often raises win rate while reducing expectancy. Management is increasingly state-dependent; no target change is promoted.

## Canonical files for this work

- `trading/lab/FOOTPRINT_PRO_V1_PROTOCOL.md`
- `trading/lab/FOOTPRINT_PRO_V1_RESULTS.md`
- `trading/lab/FOOTPRINT_PRO_V1_INTERFACE.md`
- `trading/lab/FOOTPRINT_PRO_WAVE2_RESULTS.md`
- `trading/lab/FOOTPRINT_PRO_WAVE12_SENSOR_ROLE_DISCOVERY_PROTOCOL.md`
- `trading/lab/footprint-pro-v1-source.json`
- `trading/lab/footprint-pro-v1-summary.csv`
- `scripts/run-trading-footprint-pro-v1.mjs`

## Next action

1. Build the sensor contract for all 9 scripts, with common quality/audit fields and compact CORE-facing state codes.
2. Re-run retrospective role-discovery tests where historical coverage exists: micro lead/lag, cascade depth, recovery, M4↔M5 disagreement, M10 conditional pressure, M30 runner/activity and cross-TF redundancy.
3. Generate the nine Pine scripts on the research branch, leaving `NYKUTO STANDARD — PARTNERS` unchanged.
4. Ensure V2 prospectively exports per-price-cell MAX BUY/MAX SELL/MAX +/- delta prices, centroids, concentration/entropy, imbalance location and post-entry snapshots.
5. Compile all nine manually in TradingView and connect CORE inputs.
6. Verify `SYSTEM 9/9`, timestamps, replay/reload no-repaint behavior and sensor failure handling.
7. Freeze the prospective ruleset and begin collecting without threshold changes.
8. Promote no new gate, risk or management rule until prospective observations are accumulated.

## Resume procedure for a new chat

1. Read `SOURCE_OF_TRUTH.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `docs/site-architecture.md`.
2. Read `trading/STATE.md`.
3. Read `trading/lab/RESEARCH_LESSONS.md` and `trading/lab/research-catalog.json` before proposing another trading experiment.
4. Read the Footprint Pro protocol/results/interface and latest Wave reports.
5. Read `trading/lab/FOOTPRINT_PRO_WAVE12_SENSOR_ROLE_DISCOVERY_PROTOCOL.md` before changing sensor architecture.
6. Never treat a repeated retrospective test as independent evidence.
7. Do not merge the Footprint Pro branch into Trading production until Diego explicitly validates the merge and checks are green.
