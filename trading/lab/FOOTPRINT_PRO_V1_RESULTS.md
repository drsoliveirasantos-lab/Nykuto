# Nykuto Trading — Footprint Pro V1 first results

Date: 2026-09-14  
Status: **retrospective / SHADOW**. No commercial Pine change.

## 1. Engine reproduction passed

The new repository runner validates the private source hashes, finds 1,712 M5 Nykuto signals with Footprint, performs causal higher-timeframe joins, and reproduces the five headline historical candidates to floating-point tolerance:

| Candidate | Sequential n | Mean R | PF | Reproduction |
|---|---:|---:|---:|---|
| PRE_BASE | 96 | +0.191 | 1.586 | PASS |
| M15 BAR + POC | 45 | +0.555 | 3.695 | PASS |
| M15 FLOW RESPONSE | 49 | +0.519 | 3.571 | PASS |
| M15 FLOW ACCEPTANCE | 37 | +0.648 | 4.380 | PASS |
| STALE M15/M45 | 347 | -0.160 | 0.630 | PASS |

This is an important software result: the new durable Nykuto Trading runner is numerically compatible with the already-audited Footprint campaign. It is not new market evidence.

## 2. 1R benchmark is now explicit

The 30-minute HOLD30 policy and a conservative TP1/1R-capped benchmark were run side by side.

| Candidate | HOLD30 mean R | TP1/1R mean R | HOLD30 win | TP1/1R win |
|---|---:|---:|---:|---:|
| PRE_BASE | +0.191 | +0.132 | 52.1% | 58.3% |
| M15 BAR + POC | +0.555 | +0.285 | 64.4% | 66.7% |
| FLOW RESPONSE | +0.519 | +0.260 | 61.2% | 63.3% |
| FLOW ACCEPTANCE | +0.648 | +0.350 | 67.6% | 70.3% |
| M5 Delta30 30–50 | +0.600 | +0.423 | 71.4% | 71.4% |
| STALE | -0.160 | -0.110 | 39.2% | 43.5% |

Interpretation: capping at 1R raises the observed win rate in several groups but lowers expectancy on these already-seen months. Therefore 1R remains a mandatory benchmark, not an automatic replacement for the research horizon or a reason to extend targets blindly.

## 3. Additional timeframe screening

### M10

M10 pressure >=20% alone remains useful as a compact context (`n=31`, +0.460R/trade), but adding it to the strongest M15 states does **not** improve their expectancy:

- M15 BAR+POC: +0.555R -> +0.529R with M10; after removing the five best trades, +0.174R -> +0.036R.
- FLOW RESPONSE: +0.519R -> +0.408R with M10; without top five, +0.179R -> +0.004R.

Decision: keep M10 as research/context data. Do not require a dedicated live M10 Footprint sensor in the first Nykuto Pro release.

### M30

Generic M30 current alignment improves the broad pre-market subset from +0.191R to +0.301R (`n=65`) and remains positive in June, July and Aug–Sep. Without the five best trades it remains +0.132R.

However it is not incrementally better once a stronger M15 state is already known:

- M15 BAR+POC + M30 = +0.439R versus +0.555R parent.
- FLOW RESPONSE + M30 = +0.451R versus +0.519R parent.

Decision: **M30 ALIGN = SHADOW CONTEXT candidate**, worth continued collection, but not a new hard gate and not yet worth another required TradingView script.

### M45

Generic M45 alignment gives only +0.109R on the same pre-market framework, below the +0.191R baseline. Its useful information is therefore not “M45 agrees = better”. Its valuable role remains the **rotation relationship**, especially M45 aligned + M15 opposed = STALE.

Decision: retain M45 specifically for regime/rotation and STALE.

### M2/M3/M4 micro layer

Requiring majority M2/M3/M4 alignment reduces both sample and expectancy of the stronger M15 parent states:

- M15 BAR+POC + MICRO234 majority: `n=16`, +0.204R; without top five becomes negative.
- FLOW RESPONSE + MICRO234 majority: `n=19`, +0.275R; without top five becomes negative.

Decision: do not add MICRO234 as an admission gate. Keep the small timeframes available for diagnostic/replay research only.

## 4. Current Footprint data quality

One-sided Footprint bars fall sharply as timeframe increases:

| TF | Footprint rows | One-sided |
|---|---:|---:|
| M1 | 20,809 | 91.16% |
| M2 | 20,759 | 46.62% |
| M3 | 20,739 | 23.41% |
| M4 | 20,952 | 11.70% |
| M5 | 19,998 | 5.92% |
| M10 | 9,992 | 0.13% |
| M15 | 6,662 | 0.03% |
| M30 | 3,330 | 0.00% |
| M45 | 2,245 | 0.00% |

This supports using M1–M4 as micro diagnostics rather than giving them equal voting weight with M15/M45.

## 5. Provisional operational architecture after test 1

The first wave does **not** justify requiring M1/M2/M3/M4/M10/M30 sensors on the live chart. The smallest architecture that preserves the strongest distinct information is provisionally:

1. `[1/3] NYKUTO PRO — CORE M5` — personal copy of the Nykuto engine + native M5 Footprint + final HUD/alerts.
2. `[2/3] NYKUTO PRO — M15 FLOW SENSOR` — current flow, POC migration, response/acceptance outputs.
3. `[3/3] NYKUTO PRO — M45 REGIME SENSOR` — current regime/rotation input for STALE/FRESH.

Separate and untouched:

- `NYKUTO STANDARD — PARTNERS` — non-Premium partner version.

M10, M30 and micro timeframes remain in the research database and can be retested later. They are not deleted; they simply do not become required live dependencies yet.

## 6. Next gate

Before writing the final Pine bundle:

- run one more architecture check for source-output budget and exact no-repaint timestamp semantics;
- freeze the three-script interface contract;
- then generate the three complete Pine files with `[1/3]`, `[2/3]`, `[3/3]` names and mobile/compact/expert HUD modes;
- compile manually in TradingView and perform the five-signal Replay no-repaint check;
- only after compilation/replay passes, start prospective collection without changing thresholds.
