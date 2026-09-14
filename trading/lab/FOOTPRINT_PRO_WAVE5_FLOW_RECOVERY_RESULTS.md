# Nykuto Trading — Footprint Pro Wave 5: Flow Recovery

Date: 2026-09-14
Status: retrospective mechanism screening / SHADOW only. No production Pine, risk, target or hard-gate change.

## Question

When a M15+POC trade loses M5 flow alignment after entry, does waiting for M5 flow to recover improve management versus exiting immediately or simply keeping the static runner?

The analysis uses the same 1,712-signal M5 Footprint dataset and causal M15/M45 joins. Results below are opportunity-level exploratory comparisons on the M15+POC family; they are not independent validation.

## Flow sequence results

For M15+POC observations classified from M5 current delta snapshots after entry:

| Sequence | n | HOLD30 mean R | TP2.5/90 mean R |
|---|---:|---:|---:|
| M5 aligned at +5m and +10m | 28 | +1.043 | +1.317 |
| Opposed early then later recovered | 14 | +0.294 | -0.167 |
| Opposed at +10m then later recovered | 10 | +0.133 | +0.117 |
| Early opposition that persisted | 4 | -0.700 | -0.457 |

Interpretation: recovery exists, but the recovered groups are materially weaker than trades whose flow simply remains aligned. A recovery badge may be useful descriptively, but recovery does not restore the trade to the same quality class as uninterrupted FLOW HOLDING.

## Adaptive management screens

M15+POC opportunity-level comparison:

- HOLD30: +0.569R, PF ~4.56.
- Static TP2.5 / 90m: +0.605R, PF ~2.52.
- TP2.5/90 with immediate exit at +10m when M5 flow is opposed: +0.615R, PF ~3.44.
- Give a +10m opposed trade another 10 minutes to recover; if still non-aligned at +20m exit, otherwise continue TP2.5/90: +0.631R, PF ~2.80.

The 10-minute recovery grace is the best mean-R variant in this small exploratory grid, but its improvement over the static TP2.5/90 runner is only about +0.026R/trade. This is too small and too selected on seen data to justify a live management rule.

For the M15+POC + POC_ACCEL subset:

- HOLD30: +0.709R, PF ~5.39.
- Static TP2.5/90: +0.769R, PF ~3.32.
- Immediate +10m opposed-flow exit: +0.770R, PF ~4.62.
- +10m recovery grace to +20m: +0.777R, PF ~3.65.

Again, the recovery-grace improvement in expectancy is negligible versus the static runner. Immediate flow-opposition handling improves PF more than expectancy in this already-selected subset.

## Decision

1. Keep `FLOW HOLDING` as the strongest live-state quality observation.
2. Add descriptive research states `FLOW OPPOSED`, `FLOW RECOVERED`, and `FLOW OPPOSITION PERSISTENT` to prospective collection.
3. Do **not** promote `FLOW RECOVERED` back to the same quality tier as uninterrupted FLOW HOLDING.
4. Do **not** add an automatic exit or a fixed 10-minute recovery grace yet. The incremental expectancy gain over static management is too small on already-seen data.
5. Prospective V2 should snapshot M5 flow at +5/+10/+15/+20/+30 minutes and preserve the full transition path so recovery/persistence can be tested out of sample.

## Design implication

The future HUD should distinguish entry quality from live quality:

- ENTRY: M15+POC / POC_ACCEL / STALE severity.
- LIVE: FLOW HOLDING / WEAKENING / OPPOSED / RECOVERED / OPPOSITION PERSISTENT.

A recovered trade remains a lower-confidence live state than one whose flow never broke. This is a more faithful representation of the retrospective evidence than a binary aligned/opposed flag.
