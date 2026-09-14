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

## Live TradingView architecture — v3.0 CLEAN MEMORY

Manual TradingView testing exposed two separate platform ceilings:

1. Embedding the research hub inside the large V15.2.8 execution script exceeded the compiled-token ceiling (`103,446` vs `100,256`).
2. A separate HUD directly reading EXEC plus all nine Footprint sensors appeared initially and then disappeared while TradingView progressively loaded the sources, with `Memory limits exceeded`. Reducing HUD plots and source history alone did not solve this reliably.

The v3.0 live architecture therefore uses a two-stage fan-in. The nine Footprint sensors remain independent, but the final HUD no longer reads them directly.

### Layer A — execution + nine minimal Footprint sensors

- `NYKEXEC` — current personal EXEC CORE derived from V15.2.8; no Footprint request; exports compact `NYK24_PLAN_PACKET`.
- `NYK2/10` — M1 micro sensor.
- `NYK3/10` — M2 micro sensor.
- `NYK4/10` — M3 micro sensor.
- `NYK5/10` — M4 micro sensor.
- `NYK6/10` — M5 flow sensor.
- `NYK7/10` — M10 pressure sensor.
- `NYK8/10` — M15 flow/POC sensor.
- `NYK9/10` — M30 activity sensor.
- `NYK10/10` — M45 regime sensor.

Each live sensor now has:

- exactly one `request.footprint()`;
- exactly one exported plot: `NYK10_PACKET`;
- no external `input.source()`;
- `max_bars_back=80` and `calc_bars_count=80`;
- no heavy per-price row loop in the live version unless its role requires a built-in Footprint field (M15 uses only POC);
- the same compact schema-v3 packet contract used by downstream hubs.

Rich cell-level research collectors are intentionally not part of the live layout. They can be run separately for explicit export/research sessions so they do not destabilize the operational chart.

### Layer B — three lightweight aggregation hubs

- `NYKMIC` — MICRO HUB. Reads M1/M2/M3/M4 only (4 sources) and exports one `NYK_MICRO_PACKET`.
- `NYKFLW` — FLOW HUB. Reads M5/M10/M15 only (3 sources) and exports one `NYK_FLOW_PACKET`.
- `NYKREG` — REGIME HUB. Reads M30/M45 only (2 sources) and exports one `NYK_REGIME_PACKET`.

These hubs contain no `request.footprint()` and each exports one compact packet.

### Layer C — final NYKHUD

Final `NYKHUD` reads only four external sources:

1. `NYKEXEC: NYK24_PLAN_PACKET`
2. `NYKMIC: NYK_MICRO_PACKET`
3. `NYKFLW: NYK_FLOW_PACKET`
4. `NYKREG: NYK_REGIME_PACKET`

Therefore the final HUD no longer loads nine Footprint-backed external series directly. It reconstructs:

- system health;
- micro cascade / chaos / M1 noise / building state;
- M10 pressure alignment;
- M15 + POC confirmation;
- M30 activity state;
- M45 regime / STALE;
- live Health state from M5 flow + current R response + M15 POC support;
- centralized priority alerts.

The HUD has no Footprint request and no research plots.

### Expected diagnostic state

When wired correctly in Diagnostic mode:

- `SYSTEM 10/10`
- `MICRO 4/4`
- `FLOW 3/3`
- `REGIME 2/2`
- `EXEC OK`

The `10/10` count represents EXEC + the nine Footprint sensor roles. The three hubs and HUD are transport/aggregation layers and are not additional market-role votes.

## Visual policy

- `NYKUTO STANDARD — PARTNERS` remains untouched.
- Personal Nykuto Pro visual options must separate display from calculation.
- Hiding an `Afficher ...` visual must not disable the underlying calculation.
- The live Footprint sensors and intermediate hubs should be visually silent/hidden; only EXEC and the compact HUD need to be visible.
- Do not remove BUY/SELL, Entry, SL, TP or other operational visuals when the user asks only to hide a specific guide line.

## Alert policy

Only final `NYKHUD` should own phone-priority research alerts. Sensors and intermediate hubs remain silent.

Current alert classes are SHADOW/diagnostic only:

- IMPORTANT: M15+POC strong confirm.
- IMPORTANT: micro cascade against current plan.
- CRITICAL: STALE / CHASE.
- CRITICAL: trade failure.
- CRITICAL: persistent weakening.
- CRITICAL: system incomplete.

Create one TradingView alert on `NYKHUD -> Any alert() function call` after the final HUD is stable.

## Sensor roles

- M1: first detector / noise discriminator.
- M2: first confirmation of M1.
- M3: persistence / maturation.
- M4: bridge from microstructure to M5.
- M5: current execution-flow / health Footprint.
- M10: intermediate pressure.
- M15: decision layer, POC migration, acceptance/response.
- M30: activity / expansion / runner context.
- M45: slow regime, STALE/FRESH.

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

Private live package prepared outside the public repository: `Nykuto_Pro_v3_0_CLEAN_MEMORY_ARCHITECTURE.zip`.

## Next action

1. Treat prior direct-fan-in HUD versions as obsolete for live use.
2. Keep current NYKEXEC.
3. Replace the nine live Footprint sensor codes with v3.0 minimal sensors.
4. Add and wire MICRO HUB, FLOW HUB and REGIME HUB.
5. Replace NYKHUD with v3.0 final HUD and connect only four external sources.
6. Confirm `SYSTEM 10/10`, `MICRO 4/4`, `FLOW 3/3`, `REGIME 2/2`, `EXEC OK` without a runtime-memory error.
7. Only after that create the single NYKHUD phone alert.
8. Replay at least five historical signals and reload the chart to test closed-bar persistence/no-repaint behavior.
9. Freeze the prospective ruleset and begin collection without threshold changes.
10. Promote no new gate, risk or management rule until prospective observations are accumulated.

## Resume procedure for a new chat

1. Read `SOURCE_OF_TRUTH.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `docs/site-architecture.md`.
2. Read `trading/STATE.md`.
3. Read `trading/lab/RESEARCH_LESSONS.md` and `trading/lab/research-catalog.json` before proposing another trading experiment.
4. Read the Footprint Pro protocol/results/interface and latest Wave reports.
5. Never treat a repeated retrospective test as independent evidence.
6. Do not merge the Footprint Pro branch into Trading production until Diego explicitly validates the merge and checks are green.
