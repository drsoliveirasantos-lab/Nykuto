# Nykuto Trading — Footprint Pro Wave 7: Health-state trajectory

Date: 2026-09-14
Status: retrospective SHADOW research only.

Wave 7 uses the 56 M15+POC observations exported by Wave 6 and studies the joint state of M5 flow and price progress at +10 minutes, plus persistence through +20 minutes.

## Main split at +10m

- HEALTHY: M5 flow aligned and price progress >0R: n=30, mean subsequent R +1.088, win rate 90%, median +0.659R.
- ALIGNED BUT NOT PROGRESSING: n=5, mean +0.092R, win 60%.
- OPPOSED BUT PROGRESSING: n=10, mean +0.553R, win 80%.
- TRADE FAILURE: M5 flow opposed and price progress <=0R: n=11, mean -0.617R, win 9.1%, median -0.597R.

A simple row bootstrap for HEALTHY minus FAILURE gives an observed difference +1.705R with 95% interval approximately [+1.168,+2.341]. This is not a day-block bootstrap because the Wave 6 detail export lacks dates; it is descriptive only.

## Persistence across +5/+10/+15/+20m

Number of aligned M5 snapshots is strongly ordered in this small retrospective sample:

- 0/4 aligned: n=4, mean -0.700R, win 0%.
- 1/4 aligned: n=4, mean -0.171R, win 25%.
- 2/4 aligned: n=20, mean +0.408R, win 70%.
- 3/4 aligned: n=16, mean +0.574R, win 75%.
- 4/4 aligned: n=12, mean +1.500R, win 100%.

Persistent opposition at +10,+15,+20m: n=4, mean -0.700R, win 0%.

## Interpretation

The important result is not simply whether M5 is aligned. Price progress materially changes the interpretation:

- Opposed flow + positive price progress can still be healthy enough to continue (n=10, +0.553R).
- Aligned flow without price progress is weak despite nominal flow alignment (n=5, +0.092R).
- Opposed flow + no price progress is the clearest failure state (n=11, -0.617R).

This supports an explicit live state machine rather than a single flow flag:

HEALTHY -> WEAKENING -> OPPOSED/ABSORBING -> FAILURE
with RECOVERED as a separate transition state.

No automatic exit is promoted. Samples are small and discovered on already-seen data. V2 prospective collection should add M15 POC evolution at each live snapshot and cell-level flow location before testing an irreversible-failure exit rule.
