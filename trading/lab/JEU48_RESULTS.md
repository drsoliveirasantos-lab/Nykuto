# Jeu 48 — Results: V11 session/target-aware confluence on MNQ

Exploratory diagnostic on the merged MNQ 1-minute TradingView exports for the three complete months 1 June–31 August 2026. V11 is present in Nykuto as a research indicator, but these results **do not promote it to the verified reference and do not authorize live orders**.

## Coverage

- 107,491 unique 1-minute bars after merging/deduplicating the available exports.
- Full merged history used for warm-up/context: 25 May–10 September 2026.
- Evaluation window: June, July and August 2026.
- V11 marker count in the parity-style Python reconstruction: **2,912**.

## Directional diagnostics

| Marker | N | +5m correct | +15m correct | +30m correct | Mean directional move +15m |
|---|---:|---:|---:|---:|---:|
| B | 99 | 50.5% | 50.5% | 50.5% | -1.29 pts |
| B+ | 726 | 45.9% | 48.3% | 48.9% | -1.81 pts |
| B++ | 521 | 47.4% | 46.8% | 49.1% | -3.80 pts |
| BR | 102 | 60.8% | 52.9% | 57.8% | -2.26 pts |
| BR+ | 94 | 54.3% | 45.7% | 55.3% | -1.19 pts |
| S | 113 | 51.3% | 52.2% | 61.1% | +2.68 pts |
| S+ | 648 | 54.5% | **54.6%** | 53.7% | **+4.41 pts** |
| S++ | 449 | 50.3% | 51.4% | 51.2% | -2.52 pts |
| SR | 91 | 49.5% | 42.9% | 42.9% | -4.45 pts |
| SR+ | 69 | 55.1% | 37.7% | 52.2% | -3.63 pts |

Overall: **50.2% correct at +5m, 49.8% at +15m, 51.3% at +30m; mean directional move at +15m = -0.82 point.**

The strongest isolated bucket in this first pass is `S+` at +15m (54.6%, +4.41 points mean). The nominally stronger `S++` and `B++` buckets do **not** improve on the lower-strength buckets. Therefore the present score calibration does not establish that more points imply better forward performance.

## Month stability

| Month | Signals | +15m correct | Mean directional move +15m | Target hit | 1-ATR stop hit |
|---|---:|---:|---:|---:|---:|
| June | 1,017 | 51.9% | -0.43 pts | 11.4% | 72.3% |
| July | 1,008 | 49.9% | -0.43 pts | 10.1% | 73.2% |
| August | 887 | 47.4% | -1.71 pts | 11.5% | 74.2% |
| **Total** | **2,912** | **49.8%** | **-0.82 pts** | **11.0%** | **73.2%** |

The full V11 score stack degrades from June to August rather than showing stable improvement.

## Target/room diagnostic

The target-aware experiment used the nearest detected swing/pivot target and an exploratory 1-ATR adverse stop over the next 30 minutes. This was intentionally *not* treated as a production stop policy.

The target hit rate is only 11.0% while the exploratory 1-ATR stop is hit in 73.2% of markers. This means the current combination of frequent markers + nearest-target geometry is not a viable standalone execution strategy.

## Decision

1. **Do not promote V11 as the bot's execution strategy.** Keep it research-only.
2. Preserve the previously verified reference and the promising Jeu47 ORB anti-late-RSI candidate rather than replacing them with the full V11 score stack.
3. Keep Tokyo range, SMMA, Ichimoku, pivots/room, candle anatomy and volume as available features for controlled ablation tests.
4. The immediate next experiment should test these features one at a time or in small pre-registered groups against the existing ORB baseline, rather than adding all of them simultaneously.
5. Recalibrate `+`/`++`: a higher raw confluence score is currently not monotonic with better forward outcome. In particular, `S+` outperformed `S++` and B-side strong buckets remained weak.
6. Reversal BR/SR should remain a separate strategy family; the current V11 reversal target/stop geometry is not validated.
7. Real-money execution remains OFF.

## Interpretation

V11 successfully increases the bot's descriptive context, but **more context is not automatically more edge**. This test is useful precisely because it rejects an unsafe assumption: stacking Tokyo + SMMA + Ichimoku + pivots + candle/volume scores does not, as currently weighted, produce a reliable 1-minute entry engine over June–August.

This evaluation window has already influenced development and is therefore not independent validation.
