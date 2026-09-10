# Kronos observer — research integration

## Status

Kronos is integrated as a **forecast-only research observer**. It cannot place orders, activate Paper/Shadow/live trading, alter position size, or raise Nykuto risk. Its only admissible use is an ablation: compare an already-frozen Nykuto candidate with and without a Kronos agreement filter on data that is valid for that experiment.

The production Trading HQ is a static Cloudflare Pages site. PyTorch inference therefore does **not** run inside the current Pages deployment. Inference must run in a separate local or server-side Python environment and return only the forecast payload consumed by `observer-core.mjs`.

## Pinned model

- Model: `NeoQuasar/Kronos-mini`
- Tokenizer: `NeoQuasar/Kronos-Tokenizer-2k`
- Context: 2048 bars
- Model parameters: approximately 4.1M
- License shown by the upstream model cards: MIT
- Exact expected weight hashes are recorded in `model-manifest.json`.

Do not substitute `Kronos-Tokenizer-base`: upstream maps Kronos-mini to `Kronos-Tokenizer-2k`.

## What upstream actually predicts

The official `KronosPredictor` accepts `open`, `high`, `low`, `close`, with optional `volume` and `amount`. It derives `amount` when volume exists and amount does not. It normalizes the input window, performs autoregressive generation, then denormalizes a future OHLCV/amount path. It does not natively output a Nykuto entry decision, stop, target, contract count or broker order.

For futures research, use genuine volume when available. Filling volume with zero is accepted by upstream code but removes information and should be treated as a degraded-input diagnostic, not equivalent evidence.

## Isolated installation

The heavyweight Python dependencies are intentionally outside the normal static-site install.

```bash
python3 -m venv .venv-kronos
source .venv-kronos/bin/activate
pip install -r trading/kronos/requirements-kronos.txt
python scripts/download-kronos-assets.py
```

The downloader stores verified weights under `.models/kronos-mini/`, never in Git. It fails closed if either SHA-256 differs from the pinned manifest.

Kronos' official source code is an external dependency. Clone the upstream MIT repository outside this repository and point `KRONOS_SOURCE_DIR` to it before inference:

```bash
export KRONOS_SOURCE_DIR=/absolute/path/to/Kronos
python scripts/run-kronos-observer.py --csv /path/to/closed-candles.csv --symbol MNQ --horizon 6
```

The CSV must contain `timestamp,open,high,low,close` and should contain real `volume`; `amount` is optional. Timestamps must be ordered or orderable and only closed candles may be supplied.

## Nykuto observer contract

`observer-core.mjs` validates forecast timestamps and OHLC integrity, then derives an auditable summary:

- terminal and median forecast returns in basis points;
- fraction of forecast closes above versus below the last observed close;
- forecast path range;
- `bullish`, `bearish` or `neutral` agreement.

Every summary is hard-coded `executable: false` and `riskMultiplier: 1`. A Kronos forecast may at most become a predeclared **filter** in a new research game. It is never evidence for increasing risk on a single trade.

## Validation protocol before any use in strategy selection

1. Freeze the base strategy and exact Kronos rule before measuring performance.
2. Exclude or clearly label any interval that may overlap upstream pretraining; the public model card describes a broad multi-market training corpus but does not provide enough per-contract provenance to assume a futures interval is unseen.
3. Run paired results: baseline versus baseline + Kronos filter on identical sessions, costs and account rules.
4. Report trade count, net PnL, stress-cost PnL, drawdown, weekly distribution, rejected signals and market/month contributions.
5. Require later independent confirmation before promoting the filter.
6. Keep broker credentials and order routes absent from the inference environment.

## Current limitation

The ChatGPT execution environment used to prepare this integration could inspect the official model cards, configs, upstream code and published SHA-256 values, but it could not retrieve the Hugging Face Xet binary payload into its local container because the binary redirect was blocked. Therefore no claim is made here that the weights were locally executed during this change. The download-and-hash path is included so a capable runtime can verify the exact artifacts before inference.
