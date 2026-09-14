# Nykuto Pro — Footprint V1 interface contract (provisional)

Date: 2026-09-14  
Status: architecture feasibility check passed; Pine compilation/replay still required.

## Why three scripts

TradingView permits only one unique `request.footprint()` dependency per script, including Footprint calculations copied into another dataset through `request.security()`. Therefore a single output-producing script cannot simultaneously depend on independent M5, M15 and M45 Footprint requests.

Official references:

- https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/#requestfootprint
- https://www.tradingview.com/pine-script-docs/faq/indicators/

The FAQ also limits external `input.source()` links to ten. The proposed CORE uses nine.

## [1/3] NYKUTO PRO — CORE M5

Responsibilities:

- personal copy of the current Nykuto engine;
- native M5 `request.footprint()`;
- M5 Delta/Delta30, Sweet Spot, flow efficiency, cell-level research fields;
- read M15/M45 sensor outputs;
- build STALE, M15+POC, Flow Response, Flow Acceptance and research/context states;
- own the only visible mobile/compact/expert HUD;
- own Footprint priority alerts;
- preserve 1R/TP1 as an explicit benchmark; no automatic target/risk promotion from retrospective tests.

External-source budget: **9 / 10** planned.

## [2/3] NYKUTO PRO — M15 FLOW SENSOR

One M15 Footprint request. Visually silent except for source/Data Window plots.

Planned CORE-facing outputs (6):

1. `M15_VALID`
2. `M15_SOURCE_CLOSE_MS`
3. `M15_CURRENT_DELTA_PCT`
4. `M15_POC_MOVE_ATR`
5. `M15_BODY_RESPONSE_ATR`
6. `M15_FLOW_STATE_CODE` (packed research state such as normal/absorption/exhaustion)

Additional cell-level measurements may remain export-only inside this sensor and do not need to consume CORE `input.source()` slots.

## [3/3] NYKUTO PRO — M45 REGIME SENSOR

One M45 Footprint request. Visually silent except for source/Data Window plots.

Planned CORE-facing outputs (3):

7. `M45_VALID`
8. `M45_SOURCE_CLOSE_MS`
9. `M45_CURRENT_DELTA_PCT`

The CORE derives STALE/FRESH/ALIGNED/OPPOSITION relative to the live Nykuto side.

## Standard partner line

`NYKUTO STANDARD — PARTNERS` remains independent and non-Premium. It is not one of the `[1/3]...[3/3]` Pro dependencies and receives no `request.footprint()`.

Compatible non-Footprint improvements can later be ported from Pro back to Standard deliberately.

## No-repaint contract

The offline runner already uses only the latest higher-timeframe bar whose close is <= the M5 signal close. The Pine implementation must reproduce that exact convention.

Before prospective use:

1. sensors emit confirmed values only;
2. both sensor close timestamps are transmitted to CORE;
3. CORE rejects a context state if a required sensor is absent or temporally invalid;
4. run TradingView Replay on at least five historical signals;
5. reload the chart and confirm that the M15/M45 values attached to those signal timestamps do not change.

Until that TradingView compile/replay check passes, the interface is **provisional**, not operational.
