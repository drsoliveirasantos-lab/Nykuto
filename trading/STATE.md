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

## Hardened personal Nykuto Pro architecture — 11/11 v2.4

A manual TradingView compile showed that embedding the sensor hub inside the large V15.2.8 execution script exceeded the Pine compiled-token ceiling (`103,446` vs `100,256`). Comments were also stripped for readability, but comments are not the real compiled-token driver. The architectural fix is to split execution and context/HUD into separate scripts.

Target stack:

- `[1/11] NYKUTO PRO — EXEC CORE` — V15.2.8 Bridge execution engine, no Footprint request, original plan logic preserved. Exports one compact `NYK24_PLAN_PACKET` only.
- `[2/11] NYKUTO PRO — M1 MICRO SENSOR`
- `[3/11] NYKUTO PRO — M2 MICRO SENSOR`
- `[4/11] NYKUTO PRO — M3 MICRO SENSOR`
- `[5/11] NYKUTO PRO — M4 MICRO SENSOR`
- `[6/11] NYKUTO PRO — M5 FLOW SENSOR`
- `[7/11] NYKUTO PRO — M10 PRESSURE SENSOR`
- `[8/11] NYKUTO PRO — M15 FLOW SENSOR`
- `[9/11] NYKUTO PRO — M30 ACTIVITY SENSOR`
- `[10/11] NYKUTO PRO — M45 REGIME SENSOR`
- `[11/11] NYKUTO PRO — HUD HUB` — separate lightweight overlay. Uses exactly 10 `input.source()` links: 1 plan packet + 9 sensor packets. Contains no Footprint request and no trade execution.

The EXEC CORE owns the actual Nykuto operational visuals/signals. The HUD HUB owns the compact research/context HUD. The nine sensors remain visually silent/overlay-only and can be hidden without stopping calculation.

### v2.4 hardening

- Common sensor contract remains schema v3.
- Every sensor packet carries schema version, sensor ID, online bit, direction class, role state, data-quality class, flags and compact source-close timestamp.
- HUD HUB validates expected sensor ID + schema + online state + source age.
- M1–M4 expose temporal micro states; M5 carries current flow/absorption/exhaustion SHADOW; M10 pressure; M15 POC/flow; M30 activity; M45 slow regime.
- Health Engine remains SHADOW and is now computed in the separate HUD HUB from M5 flow + price response in R + M15 POC support.
- `M15+POC`, `STALE`, micro cascade, persistent weakness, recovery and trade-failure outputs remain diagnostics only.
- No new state modifies BUY/SELL admission, SL, TP, size or risk.
- Verbose historical comments were removed from the private EXEC CORE copy to improve readability. Detailed research history remains in the repository instead of being duplicated in Pine source.

### Token-limit safety

The reason for 11/11 is architectural, not cosmetic:

- V15.2.8 execution logic remains isolated in one script that already compiled before the research hub was added.
- HUD HUB is a small independent script, so future context features no longer consume the execution CORE token budget.
- Sensors each keep exactly one `request.footprint()`.
- HUD HUB has 10 external sources exactly, matching the current source budget design.

This remains a static/package-level design until each script is compiled manually in TradingView.

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

Private package currently prepared outside the public repository: `Nykuto_Pro_11_of_11_v2_4_SPLIT_CORE_20260914.zip`.

## Next action

1. Treat the previous 9/9 and 10/10 CORE packages as obsolete.
2. Compile `[1/11] EXEC CORE` and confirm it still compiles with the tiny plan-packet addition.
3. Compile sensors `[2/11]` through `[10/11]`.
4. Compile `[11/11] HUD HUB` last.
5. Connect `NYK24_PLAN_PACKET` plus each correct `NYK10_PACKET` and verify `SYSTEM 11/11`.
6. Keep all sensors hidden/overlay-only; only EXEC CORE and HUD HUB need to remain visible.
7. Replay at least five historical signals and reload the chart to test closed-bar persistence/no-repaint behavior.
8. Freeze the prospective ruleset and begin collection without threshold changes.
9. Promote no new gate, risk or management rule until prospective observations are accumulated.

## Resume procedure for a new chat

1. Read `SOURCE_OF_TRUTH.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `docs/site-architecture.md`.
2. Read `trading/STATE.md`.
3. Read `trading/lab/RESEARCH_LESSONS.md` and `trading/lab/research-catalog.json` before proposing another trading experiment.
4. Read the Footprint Pro protocol/results/interface and latest Wave reports.
5. Never treat a repeated retrospective test as independent evidence.
6. Do not merge the Footprint Pro branch into Trading production until Diego explicitly validates the merge and checks are green.
