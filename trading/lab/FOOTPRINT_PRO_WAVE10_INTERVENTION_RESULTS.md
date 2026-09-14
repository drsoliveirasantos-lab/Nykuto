# Nykuto Trading — Footprint Pro Wave 10: intervention test

Date: 2026-09-14
Status: retrospective / SHADOW only. No production or live-management change.

## Objective
Test whether acting on post-entry health deterioration adds realized R, rather than merely classifying trades well.

Dataset: same M15+POC historical sample used in Waves 6–9. Baseline observed mean R in the available 56-row detail = +0.56875R.

## Intervention simulation at +10m
For each triggered trade, close a fraction f at the observed +10m R and leave (1-f) on the original observed outcome. Fractions tested: 25%, 50%, 75%, 100%.

### Persistent weakening proxy: M5 opposed at both +5m and +10m
n=11. Triggered trades had original mean -0.2355R and +10m mean -0.3499R.

Results versus no intervention:
- 25% exit: portfolio mean +0.5631R, delta -0.0056R/trade
- 50% exit: +0.5575R, delta -0.0112R
- 75% exit: +0.5519R, delta -0.0169R
- 100% exit: +0.5463R, delta -0.0225R

Conclusion: this broad persistent-flow rule is NOT a useful exit trigger in this sample. Acting on it makes results slightly worse.

### Trade Failure: M5 opposed at +10m AND price progress <= 0R
n=11. Triggered trades had original mean -0.6171R and +10m mean -0.4609R.

Results:
- 25% exit: +0.5764R, delta +0.0077R/trade
- 50% exit: +0.5841R, delta +0.0153R
- 75% exit: +0.5918R, delta +0.0230R
- 100% exit: +0.5994R, delta +0.0307R

Conclusion: the combined flow+price FAILURE state is more actionable than flow deterioration alone, but the realized improvement is small (~+0.031R/trade even with full exit) and is retrospective.

### Failure + POC opposed
Only n=2 in the available detail. Full exit at +10m improves total portfolio mean by about +0.0196R/trade, but this subgroup is far too small for inference.

## Breakeven limitation
A valid BE intervention cannot be reconstructed from this aggregate detail alone. To test a stop moved to entry after a trigger, we need the causal intrabar/post-trigger path to know whether BE was touched before a later target. Do not approximate this as a zero-R exit. The V2 prospective collector should save enough post-entry path/state data to test BE exactly.

## Decision
1. Do NOT exit merely because M5 flow is opposed twice; the intervention slightly worsened expectancy.
2. Keep TRADE FAILURE = flow opposed + price non-response as a SHADOW management warning.
3. Do NOT promote the +10m full-exit rule: historical lift is only ~+0.031R/trade and was discovered on seen data.
4. Collect exact event timestamps and post-trigger price path prospectively so BE, partial exits, trailing and state transitions can be simulated causally.
5. No change to Standard Partners, risk, TP or live exits.