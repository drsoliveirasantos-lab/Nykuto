# Jeu 03 — Filter Diagnosis

Purpose: diagnose which filters help or hurt the fixed SPY 15m EMA 9/21 baseline before building any Paper Bot.

The test window is frozen at 2026-07-25 through the historical endpoint horizon ending 2026-09-08 so repeated runs remain comparable. All variants share the same execution assumptions: signal at candle close, entry at next candle open, 1.25 ATR stop, 1.5R target, 0.05R cost, one open trade at a time, max 3 trades/day, -2R daily block and pause after two consecutive losses.

Variants:

1. Baseline EMA 9/21 only.
2. No-range: reject only ADX < 20, preserving transition and trend regimes.
3. EMA200 trend alignment only.
4. Volume >= 20-bar average only.
5. Completed 4x higher-timeframe EMA20/50 alignment only.
6. No-range + EMA200.
7. No-range + volume.
8. Full Filtered Trend reference from Jeu 02.

The final 30% of candles remain chronological validation. The diagnostic table reports total trades, win rate, expectancy, profit factor, drawdown, validation trades and validation expectancy. The automatic ranking is diagnostic only; it refuses to propose a candidate with a very small total or validation sample.

A candidate for a later Jeu 04 requires at least 15 total trades, 5 validation trades, positive total and validation expectancy, PF >= 1.05 and drawdown <= 8R. Meeting these thresholds does not activate Paper Bot and is not evidence of future profitability; it only identifies a strategy variant worth retesting on a separate historical window.
