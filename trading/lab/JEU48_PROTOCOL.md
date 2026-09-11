# Jeu 48 — V11 session/target-aware confluence

## Purpose

Evaluate the new V11 research layer without changing the verified reference or enabling broker execution. V11 adds internal confirmation from candle anatomy/volume, SMMA50, Ichimoku bias, Tokyo completed-range breaks, previous-day standard pivots, and minimum room-to-target, while keeping the visible B/S/BR/SR marker family.

## Dataset

MNQ 1-minute TradingView CSV exports supplied by Diego. Files are merged by Unix timestamp and duplicate timestamps are removed. Merged history available to this diagnostic: 25 May through 10 September 2026. The requested three complete months are 1 June through 31 August 2026; May is warm-up only.

Raw CSV files are not committed to Git.

## V11 parity rules tested

- EMA9/21 local trend; confirmed 5-minute EMA20/50 context for a 1-minute chart.
- SMMA50 direction and price location.
- RSI14, 30/70 exits and 12-bar memory.
- MACD 12/26/9 momentum.
- VWAP reset on the Chicago trading date in the Python diagnostic.
- Relative volume versus the preceding 20 bars; 1.20x normal and 1.50x high-volume thresholds.
- ATR14, candle range/body/wicks, engulfing, hammer/shooting-star, pin-bar, EMA rejection, doji penalty, displacement and potential absorption.
- Confirmed pivots with two bars on each side; HH/HL/LH/LL, BOS and MSS.
- Simple three-candle FVG context.
- Tokyo range 09:00–15:00 Asia/Tokyo, frozen after session end; only a confirmed close beyond the range is a Tokyo breakout; wick-only probes are penalized.
- Prior-day standard floor pivots PP/R1-R3/S1-S3 and nearest structural/pivot target.
- Minimum room to target: 1.25 ATR.
- Continuation thresholds: B/S 8, B+/S+ 11, B++/S++ 14. Reversal: BR/SR 9, BR+/SR+ 12. Six-bar same-direction cooldown.

## Diagnostic outcomes

This is a parity-style research approximation, not a TradingView engine replay. The daily-session/VWAP boundary is reconstructed in America/Chicago and can differ slightly from the exact CME/TradingView session template. It therefore must not be represented as exact Pine parity.

For each emitted marker we measure directional close-to-close movement at +5, +15 and +30 minutes. Separately, a 30-minute target diagnostic uses the nearest V11 target and an exploratory 1-ATR adverse stop. If stop and target are touched in the same minute, the outcome is marked ambiguous rather than credited as a win.

## Promotion rule

No feature becomes a production/live-order rule merely because it exists in V11. If the full V11 stack is not materially better and stable month-to-month, keep it research-only, identify the over-filtering/over-scoring source, and preserve the prior verified reference. Real-money execution remains OFF.
