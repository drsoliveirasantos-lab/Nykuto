# Nykuto V14.6 — Fidelity priority layer

Status: **research-only diagnostic layer**. It does not authorize live, Paper or Shadow execution and does not change the V14.5 entry/session/risk gates.

## What is being retained from the fidelity screening

The June–September 2026 MNQ screening compared the existing V14.5 plan stream with causal structure, volume, reaction and trend descriptors. The discovery split was June 10–July 31; the validation split was August 1–September 10. The validation baseline contained 192 plans: TP1 41.15%, TP2 15.63%, TP3 7.81%. Final `SL` state is a plan-state diagnostic and can occur after an earlier TP touch; it is not a standalone realized-PnL label.

Findings retained as annotations:

- **Structure is tiered.** A simple HL/LH is `BASIC`; BOS/MSS is `CONFIRMED`. Generic structure is not promoted to a mandatory gate.
- **Break distance is exposed.** A close at least 0.30 ATR beyond the broken swing is tagged `STRONG`, but the tag does not block or admit a trade. In validation, the >=0.30 ATR subset had 83 plans, TP1 48.19%, TP2 12.05%, TP3 7.23% and final SL 44.58%; it improved initial follow-through but not extended targets.
- **Swing amplitude stays visible instead of being filtered.** A 0.20 ATR threshold is only a `MICRO`/`CLEAR` visual scale tag because amplitude filters were not consistently better out of sample.
- **Rolling relative volume remains useful context.** `relVol20 >= 1.2` had 143 validation plans, TP1 44.06%, TP2 16.08%, TP3 8.39%, final SL 51.75%. Time-of-day-normalized volume was less stable and is not promoted as a gate.
- **EMA spread/slope and H1 trend remain descriptive.** Hard directional EMA/H1 gates did not validate consistently and are not added to admission.
- **Confirmed-extreme watch is causal.** After a confirmed LL, BUY context is watched for the next 8 bars; after a confirmed HH, SELL context is watched for the next 8 bars. The watch starts at pivot confirmation, not at the back-plotted pivot candle. `Q>=5 + recent confirmed extreme <=8 bars` produced 20 validation observations with TP1 65%, TP2 30%, TP3 20%; the sample is too small for an automatic entry rule.
- **Priority score is frozen and separate from Quality 6/6.** Reaction=2.0, Participation=1.5, H1 context=1.0, Momentum=0.5, Impulse=0.5, generic Structure=0. Threshold 5.0 is labelled `PRIORITY`. Validation score>=5 contained 26 observations: TP1 53.85%, TP2 34.62%, TP3 23.08%. Across the screened period it contained 41 observations: TP1 60.98%, TP2 36.59%, TP3 24.39%. These are retrospective research rates, **not a win probability**.

## Why V14.6 does not hard-gate entries yet

The same historical universe was used to discover and screen these relationships. Turning one of these tags into a hard admission rule would change trade sequencing, cooldowns and later signal availability. A filtered replay of the old plan list would therefore be insufficient evidence. Any future admission change must be frozen first and then fully regenerated on a fresh or explicitly reserved dataset.

V14.6 consequently keeps V14.5 operational sequencing unchanged while making the new evidence visible and machine-readable. That is deliberate: it lets the research stack accumulate better-labelled observations without pretending the screening has already established an independent trading edge.

## What “learning” means here

Nykuto can **learn operationally** by retaining tested observations, fixed definitions and rejected hypotheses in code, reports and tests. This is durable research memory. It is not neural-network retraining and it does not update ChatGPT/Kronos model weights automatically.

The policy is therefore immutable at runtime:

- `researchOnly = true`
- `probability = false`
- `hardGate = false`
- `autoTune = false`
- `executionAllowed = false`

Promotion requires a separate, predeclared validation protocol. No threshold is automatically moved after seeing a result.
