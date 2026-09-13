# Jeu 51 — ORB + RSI + H1→M5 alignment

Status: exploratory research only. Live execution remains OFF.

## Question
Does causal H1→M5 trend alignment improve the Jeu 50 MNQ ORB + anti-late RSI candidate when added as one isolated filter?

## Locked reference
- Window: 1 June–31 August 2026; warm-up may use prior closed bars only.
- Product: MNQ.
- Entry family: existing New York 30-minute ORB breakout/retest.
- RSI rule: preserve Jeu 50 asymmetric anti-late-entry filter (reject Long when RSI > 70; reject Short when RSI < 30).
- Exit economics: structural stop and 2R target, unchanged.
- No Tokyo filter.

## Alignment variants
The repository already contains a causal alignment implementation in `jeu32-alignment.mjs`. Jeu 51 must compare rather than silently replace assumptions:

A. `reference-orb-rsi`: Jeu 50 ORB + RSI, no trend alignment.
B. `ema9-21-h1-m5`: require M5 and H1 directions to equal the trade side using the existing Jeu 32 EMA 9/21 definition.
C. `ema20-50-h1-m5`: same causal rule but EMA 20/50, because the associate-method note says H1 20/50 was the principal verbal description. This is an approximation until SMA/EMA and exact chart settings are confirmed.

H1 bars must use only completed information. No partial H1 candle, future candle, or look-ahead is permitted. Keep the 09:30 New York cash-session anchor for comparability with existing repository data; do not claim this reproduces the associate's full-session chart.

## Outputs
For every variant report trades, wins, win rate, total R, mean R/trade, profit factor, June/July/August split, rejected-trade count and the P/L of rejected trades. At normalized $100 risk, also report illustrative dollars/trade, excluding fees/slippage.

## Decision rule
Promote an alignment filter only if it improves mean R/trade and total R without making the already weak July/August robustness materially worse or collapsing sample size. A higher win rate alone is insufficient.

The June–August window is exploratory and already research-influenced; it is not independent validation. No result authorizes real-money execution.