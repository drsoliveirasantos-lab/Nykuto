# MNQ historical research corpus

`trading/lab/data/mnq-rth-m5/` is the repository-owned historical corpus for current MNQ research runs.

- Source instrument: `CME_MINI:MNQ1!` (Micro E-mini Nasdaq-100 continuous futures).
- Source capture: manual TradingView **Download chart data** CSV exports supplied by the repository owner from the observed `CME_MINI_DL` delayed feed.
- Source granularity: normal M1 candles with OHLCV; no Heikin-Ashi and no automated TradingView extraction.
- M1 merge: 107,491 unique timestamps from 2026-05-25 04:08 UTC through 2026-09-10 17:48 UTC. Overlapping exports had no conflicting OHLCV values.
- Accepted source hole: ten M1 bars between 2026-09-08 03:59 and 04:10 UTC. This is outside the stored US cash/RTH window and is intentionally not synthesized.
- Repository representation: 5,992 M5 bars in the 09:30-16:00 `America/New_York` research window. This matches the current Game40+ engine cadence and keeps the repository payload compact.

Use `loadMnqRthM5Corpus()` for decoded UTC OHLCV bars or `loadMnqResearchStream()` for the current engine-shaped MNQ stream. The loader verifies the compressed payload checksum and expected row count before returning data.

This corpus is for historical research/backtesting. It is not a live feed, broker route, or execution authorization.
