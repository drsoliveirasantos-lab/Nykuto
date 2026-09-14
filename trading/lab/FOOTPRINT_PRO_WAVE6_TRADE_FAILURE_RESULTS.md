# Nykuto Trading — Footprint Pro Wave 6: Trade Failure

Date: 2026-09-14
Status: retrospective mechanism screen / SHADOW only. No production, risk, target or hard-exit change.

## Goal

Test whether post-entry M5 flow deterioration becomes more informative when combined with actual price response and M15 context, rather than treating every M5 flip as an exit.

Universe: historical pre-market M15+POC opportunities reconstructed causally from the existing M5/M15 exports. This screen uses opportunity-level HOLD30 outcomes and is exploratory; it is not an independent holdout.

## Headline

At +10 minutes, M5 flow alone separates the sample strongly:

- FLOW HOLDING: n=35, mean ~+0.946R, win ~85.7%.
- FLOW OPPOSED: n=21, mean ~-0.060R, win ~42.9%.

The strongest simple failure screen available in the old aggregate data is not merely `flow opposed`; it is `flow opposed AND price has failed to make positive progress`.

### Candidate TRADE FAILURE

At +10m:

`M5 flow opposed to Nykuto side AND mark-to-market <= 0R`

Historical screen:

- n=11
- subsequent HOLD30 mean ~-0.617R
- win ~9.1%

Tightening the price condition to <= -0.25R leaves n=8 and mean ~-0.649R, but does not create enough extra information to justify optimizing that threshold.

For comparison, opposed flow at +10m while price was still between 0R and +0.25R had a much better subsequent mean (~+0.55R in a very small n=7 subgroup). This supports the mechanism: a flow flip is materially worse when the price also fails to respond.

## Persistence / recovery

- M5 opposed at both +5 and +10m: n=11, mean ~-0.235R.
- Opposed at +10 and still opposed +15: n=11, mean ~-0.209R.
- Opposed at +10 and still opposed +20: n=8, mean ~-0.325R.
- Opposed +10 then aligned +15: n=10, mean ~+0.104R.
- Opposed +10 then aligned +20: n=13, mean ~+0.103R.

Recovery is therefore better than persistent opposition, but remains far below uninterrupted FLOW HOLDING.

## M15 context

Adding current M15 opposition to an M5 flip did not improve this historical failure screen (small n=6, mean near -0.06R). POC-opposed at the +10m checkpoint was very poor but only n=2, so it is not usable as a threshold result.

The main practical result is therefore **price response + M5 flow**, not another stacked HTF score.

## Adaptive exit screen

Replacing HOLD30 by an exit at the +10m close only for `M5 opposed AND price <= 0R` improved the opportunity-level mean from ~+0.569R to ~+0.599R in this reconstruction (~+0.031R/trade).

That uplift is too small and too retrospectively selected to justify an automatic live exit. It is useful as a SHADOW state to collect prospectively.

## Proposed live-state taxonomy for V2

- `FLOW HOLDING`
- `FLOW WEAKENING`
- `FLOW OPPOSED`
- `FLOW RECOVERED`
- `TRADE FAILURE — SHADOW`: at +10m, M5 flow opposed AND price progress <= 0R
- `PERSISTENT FAILURE — RESEARCH`: opposed across later checkpoints and price not recovering

The V2 collector should export the exact checkpoint values, not only the final label: M5 oriented delta, mark-to-market R, M15 oriented delta, M15 POC direction and source-close timestamps at +5/+10/+15/+20m.

## Decision

Do not implement an automatic exit from Wave 6. Add `TRADE FAILURE` as a prospective SHADOW warning. The strongest mechanism so far is that **flow opposition matters much more when price response is also absent**. Future cell-level Footprint collection should test whether absorption/localized aggressive flow explains which opposed-flow trades recover and which fail.
