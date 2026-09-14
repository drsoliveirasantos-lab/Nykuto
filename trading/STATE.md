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

M10 and M30 remain useful context, but test 1 does not show incremental improvement when they are required on top of M15+POC / Flow Response. M1–M4 remain micro diagnostics.

## Wave 2 additions

Wave 2 screens mechanism-level features and trade-path behavior without changing any production logic.

New SHADOW candidates:

- `M15_POC_ACCEL_ATR > 0` is the strongest new positive quality field. Inside M15+POC it produced sequential n=36, about +0.674R/trade, PF ~4.32, and remained about +0.221R after removing the top five trades. An opportunity-level day-block comparison against other M15+POC observations produced an incremental interval approximately [+0.027R, +1.195R]. This is still retrospective and is not a hard gate.
- `STALE + M15 POC opposed` is the strongest new severity field. Sequential n=219, about -0.247R/trade, PF ~0.50, and about -0.310R after removing the top five. The day-block comparison versus other STALE observations produced an interval approximately [-0.400R, -0.035R]. Proposed research label: `STALE+`.
- M5 flow streak/maturity, session and volatility remain diagnostics only.

Management research is now explicitly state-dependent:

- M15+POC: HOLD60 ~+0.684R; TP2.5/60 ~+0.679R; both remain positive after top-five removal.
- Flow Response: HOLD30 remains better than HOLD60 and the tested runner variants.
- Flow Acceptance A+: TP2.5/60 is strong historically but doubly exploratory because the parent rule was already optimized on seen data.
- STALE remains negative under every tested management policy.

Path geometry over up to 60 minutes reinforces the distinction: M15+POC and Flow Acceptance have higher median MFE and lower median adverse excursion than STALE. No target or stop rule is promoted from this retrospective work.

The old aggregate CSVs do not contain per-price-cell MAX BUY/MAX SELL locations, centroids or concentration, so true price-level absorption/acceptance tests must wait for V2 prospective collection.

## Provisional personal Nykuto Pro layout

The first architecture test and TradingView interface-limit review support **three active Pro scripts**:

- `[1/3] NYKUTO PRO — CORE M5`
- `[2/3] NYKUTO PRO — M15 FLOW SENSOR`
- `[3/3] NYKUTO PRO — M45 REGIME SENSOR`

Only `[1/3]` should own the visible phone HUD and priority Footprint alerts. Sensors should be visually silent except for Data Window/source outputs.

The provisional CORE interface uses 9 of the 10 available external `input.source()` links: six M15 outputs and three M45 outputs. The CORE calculates its own M5 Footprint. Exact signal-time source-close timestamps are part of the interface contract so the TradingView replay can audit no-repaint behavior.

Wave 2 means the M15 sensor should also collect/export POC velocity/acceleration and POC-opposition research fields. Where the 10-source budget prevents direct CORE wiring, secondary fields should remain export-only or be packed into a sensor state code rather than adding another required script.

This architecture is technically frozen for implementation, but it is **not operationally validated** until the three Pine files compile in TradingView and the five-signal replay/reload no-repaint check passes.

`NYKUTO STANDARD — PARTNERS` stays separate and may be hidden on Diego's personal chart.

## 1R

1R is explicitly retained as a benchmark. Test 1 compares the same candidate families under HOLD30 and a conservative TP1/1R cap. The 1R cap generally raises observed win rate but reduces expectancy on the already-seen June–September data. Wave 2 additionally shows that management performance differs by market state, so one universal 1R/runner rule is not justified. No target change is promoted.

## Canonical files for this work

- `trading/lab/FOOTPRINT_PRO_V1_PROTOCOL.md`
- `trading/lab/FOOTPRINT_PRO_V1_RESULTS.md`
- `trading/lab/FOOTPRINT_PRO_V1_INTERFACE.md`
- `trading/lab/FOOTPRINT_PRO_WAVE2_RESULTS.md`
- `trading/lab/footprint-pro-v1-source.json`
- `trading/lab/footprint-pro-v1-summary.csv`
- `scripts/run-trading-footprint-pro-v1.mjs`

## Next action

1. Generate the three complete `[1/3]`, `[2/3]`, `[3/3]` Pine scripts from the frozen interface contract, including Wave 2 SHADOW collection fields.
2. Ensure V2 prospectively exports per-price-cell MAX BUY/MAX SELL/MAX +/- delta prices, flow concentration/centroid fields and live post-entry flow snapshots.
3. Compile the three scripts manually in TradingView.
4. Connect the sensor outputs to CORE.
5. Verify five historical signals in Replay, then reload the chart and confirm the attached M15/M45 values remain identical.
6. If compilation and replay pass, freeze the first prospective ruleset and begin collection without threshold changes.
7. Promote no new gate, risk or management rule until prospective observations are accumulated.

## Resume procedure for a new chat

1. Read `SOURCE_OF_TRUTH.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `docs/site-architecture.md`.
2. Read `trading/STATE.md`.
3. Read `trading/lab/RESEARCH_LESSONS.md` and `trading/lab/research-catalog.json` before proposing another trading experiment.
4. Read the Footprint Pro protocol/results/interface and Wave 2 report above.
5. Never treat a repeated retrospective test as independent evidence.
6. Do not merge the Footprint Pro branch into Trading production until Diego explicitly validates the merge and checks are green.
