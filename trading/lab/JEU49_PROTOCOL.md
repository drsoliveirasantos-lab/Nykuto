# Jeu 49 — Controlled feature ablation after V11

## Purpose

Test the V11 additions individually instead of stacking them into one score. The goal is to identify which contextual features add measurable edge and which only add noise. This remains research-only; broker execution stays disabled.

## Dataset

MNQ 1-minute TradingView exports already used for Jeux 47–48. Merged history spans 25 May–10 September 2026, with the evaluation window fixed to 1 June–31 August 2026. Raw CSV files remain outside Git.

## Frozen references

Two references are preserved:

1. Jeu47 ORB continuation + anti-late-entry RSI candidate: 30 trades, 12 wins, 40.0% win rate, +6R over June–August. This is not independently validated.
2. Jeu48 full V11 marker stack: 2,912 markers, 49.8% correct at +15m and -0.82 point mean directional move. This stack was rejected as an execution strategy.

## Ablation design

Do not increase a single global confluence score. Test each feature as a directional gate/context variable, one at a time, then only test small combinations if a single feature survives.

Primary feature gates:

- SMMA50 aligned with trade direction.
- Ichimoku cloud bias aligned with direction.
- Candle-pattern context aligned with direction.
- High relative volume (>=1.50x the preceding 20-bar mean).
- Confirmed Tokyo completed-range breakout in trade direction.
- Target-room geometry (>=1.25 ATR to nearest confirmed swing / standard daily pivot).

Secondary candidates may be tested only after the primary pass: BOS/FVG, displacement and ordinary volume >=1.20x.

## Measurements

For the already-emitted V11 continuation markers, measure retained sample size, +15-minute directional hit rate, mean directional move at +15 minutes, target-hit rate and exploratory 1-ATR stop-hit rate. Report June, July and August separately.

This marker-gate pass is a screening test, not an ORB execution backtest. A feature may only be proposed for the ORB family after the exact Jeu47 ORB reconstruction reproduces the frozen 30-trade/+6R RSI-filtered reference.

## Promotion gates

A feature is not promoted merely for having the highest aggregate number. It must:

- improve the chosen baseline materially,
- retain a non-trivial sample,
- avoid obvious month-to-month collapse,
- not rely on a single outlier month,
- survive a later untouched-window confirmation.

No real-money execution authorization is created by Jeu49.
