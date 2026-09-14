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

The first repository-owned Footprint Pro runner reproduces the already-reported historical candidate statistics from 1,712 M5 signals with Footprint.

Current hierarchy remains:

1. STALE CURRENT M15/M45 — strongest negative state; SHADOW warning.
2. M15 current Footprint + POC migration — strongest simple positive badge candidate.
3. M15 FLOW RESPONSE — secondary positive badge.
4. FLOW ACCEPTANCE A+ — optimized on seen data; SHADOW only.
5. M5 Delta30 30–50 — small-sample ELITE research only.

M10 and M30 remain useful context, but test 1 does not show incremental improvement when they are required on top of M15+POC / Flow Response. M1–M4 remain micro diagnostics.

## Provisional personal Nykuto Pro layout

Pending final interface/no-repaint test, the target is **three active Pro scripts**:

- `[1/3] NYKUTO PRO — CORE M5`
- `[2/3] NYKUTO PRO — M15 FLOW SENSOR`
- `[3/3] NYKUTO PRO — M45 REGIME SENSOR`

Only `[1/3]` should own the visible phone HUD and priority Footprint alerts. Sensors should be visually silent except for Data Window/source outputs.

`NYKUTO STANDARD — PARTNERS` stays separate and may be hidden on Diego's personal chart.

## 1R

1R is explicitly retained as a benchmark. Test 1 compares the same candidate families under HOLD30 and a conservative TP1/1R cap. The 1R cap generally raises observed win rate but reduces expectancy on the already-seen June–September data. No target change is promoted from this retrospective comparison.

## Canonical files for this work

- `trading/lab/FOOTPRINT_PRO_V1_PROTOCOL.md`
- `trading/lab/FOOTPRINT_PRO_V1_RESULTS.md`
- `trading/lab/footprint-pro-v1-source.json`
- `trading/lab/footprint-pro-v1-summary.csv`
- `scripts/run-trading-footprint-pro-v1.mjs`

## Resume procedure for a new chat

1. Read `SOURCE_OF_TRUTH.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `docs/site-architecture.md`.
2. Read `trading/STATE.md`.
3. Read `trading/lab/RESEARCH_LESSONS.md` and `trading/lab/research-catalog.json` before proposing another trading experiment.
4. Read the Footprint Pro protocol/results above.
5. Never treat a repeated retrospective test as independent evidence.
6. Do not merge the Footprint Pro branch into Trading production until Diego explicitly validates the merge and checks are green.
