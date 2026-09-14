# Nykuto Trading — current state

Last updated: 2026-09-14  
Purpose: stable handoff for new ChatGPT conversations and future contributors. Read this file before continuing Trading work.

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

M10 and M30 remain useful context. M1–M4 are retained as microstructure sensors for temporal/conditional role discovery, not admission gates.

## Wave 2+ additions

- `M15_POC_ACCEL_ATR > 0` remains a leading positive SHADOW quality field.
- `STALE + M15 POC opposed` remains a leading STALE severity field (`STALE+`).
- Live-health research distinguishes flow holding, weakening, recovery and failure after entry.
- Price response is required alongside Footprint deterioration before treating a trade as failed; flow opposition alone is not sufficient.
- No retrospective management rule is promoted to live exits.
- Old CSVs lack complete per-price-cell MAX BUY/MAX SELL locations, centroids and concentration; V2 prospective collection is required for true absorption/acceptance tests.

## Corrected personal Nykuto Pro architecture — 10/10

A manual TradingView compile of the first 9/9 CORE revealed a hard compiled-token failure: **102,768 compiled tokens vs TradingView limit 100,256**. The cause was architectural: combining the already-large V15.2.8 CORE with the full M5 Footprint cell-level collector pushed the script beyond the compiler limit.

The corrected architecture therefore separates M5 Footprint into its own sensor. The target stack is now **ten active Pro scripts**, not nine:

- `[1/10] NYKUTO PRO — CORE` — V15.2.8 Bridge engine + slim 9-sensor hub; **no `request.footprint()`**.
- `[2/10] NYKUTO PRO — M1 MICRO SENSOR`
- `[3/10] NYKUTO PRO — M2 MICRO SENSOR`
- `[4/10] NYKUTO PRO — M3 MICRO SENSOR`
- `[5/10] NYKUTO PRO — M4 MICRO SENSOR`
- `[6/10] NYKUTO PRO — M5 FLOW SENSOR`
- `[7/10] NYKUTO PRO — M10 PRESSURE SENSOR`
- `[8/10] NYKUTO PRO — M15 FLOW SENSOR`
- `[9/10] NYKUTO PRO — M30 ACTIVITY SENSOR`
- `[10/10] NYKUTO PRO — M45 REGIME SENSOR`

Only `[1/10]` owns the visible operational HUD. Sensors remain visually silent except for Data Window/export outputs.

### Why 10/10 is safer

- Each sensor contains exactly one `request.footprint()` call, respecting TradingView's one-footprint-request-per-script runtime rule.
- CORE contains zero Footprint requests and uses nine `input.source()` links, staying under the official maximum of ten external source inputs.
- M5 Footprint no longer consumes compiled-token budget inside the legacy V15.2.8 CORE.
- `shorttitle` values are kept below TradingView's recommended/validated length.
- The commercial/partner script is untouched.

### Sensor roles

- M1: first detector / noise discriminator.
- M2: first confirmation of M1.
- M3: persistence / maturation.
- M4: bridge from microstructure to M5.
- M5: current execution-flow / health Footprint.
- M10: intermediate pressure.
- M15: decision layer, POC migration, acceptance/response.
- M30: activity / expansion / runner context.
- M45: slow regime, STALE/FRESH.

Each sensor exports a compact packet to CORE plus richer research fields for Data Window/CSV: delta, Delta30, POC move/acceleration, MAX BUY/SELL, MAX +/- delta levels, centroids, concentration, flow-efficiency, imbalance stacks, absorption/exhaustion proxies, close timestamp and availability.

## 1R

1R remains an explicit benchmark. Historical tests show a universal 1R cap often raises win rate while reducing expectancy. No target change is promoted.

## Canonical research files

- `trading/lab/FOOTPRINT_PRO_V1_PROTOCOL.md`
- `trading/lab/FOOTPRINT_PRO_V1_RESULTS.md`
- `trading/lab/FOOTPRINT_PRO_V1_INTERFACE.md`
- `trading/lab/FOOTPRINT_PRO_WAVE2_RESULTS.md`
- `trading/lab/FOOTPRINT_PRO_WAVE12_SENSOR_ROLE_DISCOVERY_PROTOCOL.md`
- `trading/lab/FOOTPRINT_PRO_WAVE12_SENSOR_ROLE_RESULTS.md`
- `scripts/run-trading-footprint-pro-v1.mjs`

Private Pine package currently prepared outside the public repository: `Nykuto_Pro_10_of_10_CORRECTED_20260914.zip`.

## Next action

1. Discard the earlier 9/9 Pine package.
2. Compile the corrected 10/10 package beginning with sensors 2→10, then CORE 1/10.
3. Connect each CORE source to the corresponding sensor `NYK10_PACKET` output.
4. Verify `SYSTEM 10/10`.
5. Verify Data Window fields and exact source-close timestamps.
6. Replay at least five historical signals and reload the chart to test no-repaint persistence.
7. Freeze the prospective ruleset and begin collection without threshold changes.
8. Promote no new gate, risk or management rule until prospective observations are accumulated.

## Resume procedure for a new chat

1. Read `SOURCE_OF_TRUTH.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `docs/site-architecture.md`.
2. Read `trading/STATE.md`.
3. Read `trading/lab/RESEARCH_LESSONS.md` and `trading/lab/research-catalog.json` before proposing another trading experiment.
4. Read the Footprint Pro protocol/results/interface and latest Wave reports.
5. Never treat a repeated retrospective test as independent evidence.
6. Do not merge the Footprint Pro branch into Trading production until Diego explicitly validates the merge and checks are green.
