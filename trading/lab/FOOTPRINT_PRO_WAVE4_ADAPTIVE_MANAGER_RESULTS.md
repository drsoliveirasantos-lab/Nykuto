# Nykuto Trading — Footprint Pro Wave 4 Adaptive Manager

Date: 2026-09-14  
Status: **retrospective / SHADOW research only**. No commercial Pine change, no hard-gate or live-management promotion.

## Scope

Wave 4 tests whether post-entry Footprint behavior can improve trade management. It uses the same M5/M15/M45 dataset family and the same 1,712 M5 Nykuto signals as prior waves. All decisions use only information available at or after the relevant checkpoint; no future bar is consulted before the checkpoint.

Primary states tested:
- M15 + POC
- M15 + POC + positive POC acceleration
- Flow Response
- STALE / STALE+

Management families tested:
- fixed HOLD30 / HOLD60 / HOLD90
- TP2 / TP2.5 horizons
- breakeven variants
- early exit on M5 Footprint opposition at +5 / +10 / +15 / +20 minutes
- adaptive branch: inspect M5 at checkpoint, exit if opposed, otherwise extend toward 2.5R / 90 min

## 1. Post-entry M5 flow is strongly diagnostic

Among sequential HOLD30 trades that are still alive at the checkpoint:

### M15 + POC
- +5m, M5 aligned: n=29, +0.834R, PF ~11.64, win ~82.8%
- +5m, M5 opposed: n=16, +0.050R, PF ~1.12, win ~31.3%
- +10m, M5 aligned: n=27, **+1.008R**, PF ~16.57, win ~81.5%
- +10m, M5 opposed: n=17, **-0.068R**, PF ~0.82, win ~41.2%
- +20m, M5 aligned: n=31, +0.878R
- +20m, M5 opposed: n=12, -0.008R

Day-block bootstrap for the +10m aligned-minus-opposed difference inside M15+POC:
- observed difference ~**+1.076R**
- 95% day-block interval approximately **[+0.386R, +1.853R]**

Interpretation: `FLOW HOLDING` at +10m is a strong live quality state, while `FLOW OPPOSED` is a genuine deterioration warning. This is stronger evidence for a management state than for a new entry filter.

### M15 + POC + POC acceleration
- +10m aligned: n=22, +1.130R, PF ~17.81
- +10m opposed: n=13, +0.034R, PF ~1.09
- day-block aligned-minus-opposed difference ~+1.096R, 95% interval ~[+0.268R, +2.034R]

### Flow Response
- +10m aligned: n=29, +0.793R
- +10m opposed: n=20, +0.122R
- bootstrap difference interval crosses zero slightly: about [-0.043R, +1.470R]

Interpretation: live M5 continuation is most convincing as a management discriminator for M15+POC and especially M15+POC+POC_ACCEL.

## 2. Simple protective exits do not beat the best static management cleanly

On M15+POC, exiting at +10m whenever M5 turns opposite gives roughly:
- n=46
- +0.573R/trade
- PF ~5.46
- after top 5 ~+0.204R

This is not materially better than the original HOLD30 (+0.555R) and remains below the stronger retrospective TP2.5/90 management discovered previously.

On M15+POC+POC_ACCEL, +10m opposition exit gives roughly:
- n=38
- +0.713R/trade
- PF ~6.75
- after top 5 ~+0.276R

Again useful defensively, but below the best static runner result on the already-seen sample.

Decision: **do not auto-exit solely because M5 flips once**. Use `FLOW OPPOSED` as a warning/state first.

## 3. Adaptive extend/exit branch

Rule family:
- inspect M5 at +10m;
- if M5 remains aligned, allow extension toward TP2.5 / 90m;
- if M5 is opposed, exit at the checkpoint.

Results:

### M15 + POC
- n=43
- +0.691R/trade
- PF ~4.19
- after top 5 ~+0.455R
- BUY +0.449R, SELL +0.996R
- June +1.051R, July +0.778R, Aug-Sep +0.466R

This is robustly positive across side and period, but **does not outperform** the best simple TP2.5/90 retrospective policy on raw expectancy / top-five robustness. Therefore the adaptive branch is not promoted.

### M15 + POC + POC acceleration
- n=36
- **+0.936R/trade**
- PF ~7.32
- win ~72.2%
- after top 5 ~+0.686R
- BUY +0.712R, SELL +1.216R
- June +1.239R, July +1.067R, Aug-Sep +0.697R

This is the strongest adaptive-manager historical result in Wave 4. However, it is built on an already-discovered POC_ACCEL subset and uses already-seen data, so it remains SHADOW only.

### Flow Response
- n=47
- +0.504R/trade
- PF ~3.01
- after top 5 ~+0.269R

It does not beat the original HOLD30 parent cleanly.

## 4. STALE remains unsuitable for rescue management

All tested extensions / adaptive branches remain negative for STALE and STALE+.

The best tested protective variants only reduce losses; they do not turn STALE into an attractive state.

Decision: treat STALE / STALE+ as quality deterioration, not as a family to optimize with more ambitious targets.

## 5. Design implication for Nykuto Pro

The architecture should explicitly separate:

### ENTRY STATE
- M15 + POC
- POC ACCEL
- Flow Response / Acceptance
- STALE / STALE+

### LIVE STATE
- `FLOW HOLDING`
- `FLOW WEAKENING`
- `FLOW OPPOSED`
- future `FLOW RECOVERY`

Recommended live checkpoints for prospective collection:
- +5m
- +10m
- +15m
- +20m

The most informative checkpoint in this retrospective screen is **+10 minutes**.

## 6. Prospective fields to collect

For every admitted trade, capture at entry and at each live checkpoint:
- oriented M5 delta current
- M5 delta change from entry
- M15 current delta / POC direction / POC acceleration
- M45 regime
- current R
- MFE / MAE to checkpoint
- whether 0.5R / 1R / 1.5R was reached
- `FLOW_HOLDING`, `FLOW_WEAKENING`, `FLOW_OPPOSED`

V2 cell-level fields remain mandatory for later absorption/acceptance work.

## Decision

Wave 4 does **not** justify an automatic live exit or target change yet.

Promote to prospective SHADOW collection:
1. +10m `FLOW HOLDING / FLOW OPPOSED` state.
2. M15+POC+POC_ACCEL as the main candidate for adaptive runner research.
3. Entry-state versus live-state separation in the Pro HUD and dataset.

Do not promote:
- one-flip = automatic exit;
- universal 90m runner;
- any STALE rescue strategy;
- risk increase.
