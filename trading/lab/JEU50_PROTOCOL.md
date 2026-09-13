# Jeu 50 — ORB + RSI vs ORB + RSI + Tokyo confirmation

## Purpose

Test the strongest practical candidate from the recent session work without changing the verified production reference: add a completed-Tokyo-range confirmation to the existing MNQ New York ORB/retest + anti-late-entry RSI candidate.

This is research-only. No broker execution is enabled.

## Dataset

Merged MNQ 1-minute TradingView exports supplied by Diego. Duplicate Unix timestamps are removed. Available merged history spans 25 May–10 September 2026. Evaluation window is the three complete months **1 June–31 August 2026**; May is warm-up/context only.

## Frozen ORB baseline

The ORB reconstruction is the Jeu 22/47 rule already used in the prior diagnostic:

- build the New York 09:30–10:00 range from six complete M5 candles;
- after 10:00, require a close at least one MNQ tick beyond the range;
- allow up to six M5 bars for a retest;
- retest candle must touch the broken boundary, remain closed on the breakout side, and have a body in the breakout direction;
- entry is the next M5 open;
- structural stop is one MNQ tick beyond the retest candle extreme;
- target = 2R;
- maximum one executed trade per direction/day;
- last eligible signal bar starts 11:55 New York;
- if stop and target are both touched in the same M5, stop wins conservatively;
- otherwise follow the trade through the 16:00 New York session close.

## RSI candidate

Use the last closed 1-minute RSI14 value inside the M5 confirmation candle. Refuse:

- Long when RSI > 70;
- Short when RSI < 30.

This reproduces the Jeu 47 filtered baseline.

## Primary Tokyo confirmation

Tokyo range = **09:00–15:00 Asia/Tokyo**, using only complete 1-minute bars. At the ORB confirmation time, use the latest fully completed Tokyo range. The primary candidate accepts an ORB direction only if, after Tokyo ended and before the ORB confirmation, at least one closed 1-minute candle has closed beyond the Tokyo boundary in the same direction:

- Long: a prior confirmed close > Tokyo High;
- Short: a prior confirmed close < Tokyo Low.

A wick alone does not count.

This is called `tokyo-ever-break`.

## Secondary diagnostics

To expose sensitivity to the ambiguous verbal rule, measure but do not promote two alternate definitions:

1. `tokyo-state`: the last closed 1-minute candle at ORB confirmation is still beyond the Tokyo boundary in the ORB direction.
2. `tokyo-first-break`: the first confirmed close outside either side of the completed Tokyo range matched the later ORB direction.

## Metrics

Compare trade count, wins, win rate, total R, mean R/trade, and month-by-month R for:

1. ORB base;
2. ORB + RSI;
3. ORB + RSI + primary Tokyo confirmation.

The Tokyo candidate is retained only if it improves expectancy without collapsing frequency and does not merely concentrate the June edge while worsening July/August.

This window is exploratory because it has already influenced development; it is not independent validation.