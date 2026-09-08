# Jeu 02 — Filtered Trend

This fixed Strategy Lab comparison is intentionally defined before reading its result so it can test whether common context filters improve a simple EMA crossover without tuning parameters after the fact.

## Fixed preset

- market: SPY;
- timeframe: 15 minutes;
- raw signal: EMA 9 / EMA 21 crossover;
- directional trend filter: price relative to EMA 200 plus EMA 200 slope;
- trend-strength filter: ADX(14) >= 22;
- participation filter: current volume >= 20-bar average volume;
- higher-timeframe confirmation: completed 4x aggregated bars, EMA 20 vs EMA 50;
- stop: 1.25 ATR(14);
- target: 1.5 R;
- simulated execution cost: 0.05 R per trade;
- maximum 3 entries per UTC day;
- daily realized-loss block at -2 R;
- pause for the rest of the day after 2 consecutive losses.

The baseline comparison uses the same entry/stop/target/risk-control assumptions but disables the trend, ADX, volume and higher-timeframe filters. Both versions run on exactly the same historical candles.

## Anti-overfitting rules

- a crossover is known only at candle close and any position opens at the following candle open;
- stop is assumed to occur first if stop and target are both inside the same OHLC candle;
- the final 30% of the chronology remains the validation segment;
- the fixed preset should not be changed simply because one result is unattractive;
- the UI reports how many raw signals each filter rejects and shows baseline performance by market regime.

## Regime Analyzer

Baseline trades are grouped from information available at entry:

- ADX >= 25: trend;
- ADX < 20: range;
- otherwise: transition;
- ATR% relative to its recent average classifies low, normal or high volatility.

This is diagnostic. A regime label does not guarantee that the next trade will win.

## Paper gate

The V1 gate labels the preset as a Paper Bot candidate only when all of these minimum research checks pass:

- at least 40 total filtered trades;
- at least 12 trades in the final 30% validation segment;
- positive overall expectancy;
- positive validation expectancy;
- profit factor >= 1.10;
- maximum drawdown <= 8 R.

These are project guardrails, not universal profitability thresholds. Passing the gate permits only the next fictitious-capital phase. It never enables broker execution or real-money automation.
