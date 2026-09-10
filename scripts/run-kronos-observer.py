#!/usr/bin/env python3
"""Run Kronos-mini as a forecast-only observer over a local OHLCV CSV.

Requires the official shiyu-coder/Kronos source tree via KRONOS_SOURCE_DIR and
verified local weights produced by scripts/download-kronos-assets.py.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / ".models" / "kronos-mini"
VALID_SYMBOLS = {"MNQ", "MES", "MYM", "MGC"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, help="CSV with timestamp/open/high/low/close and optional volume/amount")
    parser.add_argument("--symbol", required=True, choices=sorted(VALID_SYMBOLS))
    parser.add_argument("--horizon", type=int, default=6, help="Number of future bars to forecast")
    parser.add_argument("--context", type=int, default=512, help="Maximum historical rows used; capped at 2048")
    parser.add_argument("--device", default=None, help="cpu, mps, cuda:0, or omit for auto-detection")
    parser.add_argument("--temperature", type=float, default=1.0)
    parser.add_argument("--top-p", type=float, default=0.9)
    parser.add_argument("--samples", type=int, default=5)
    return parser.parse_args()


def add_official_source_to_path() -> None:
    source = os.environ.get("KRONOS_SOURCE_DIR")
    if not source:
        raise RuntimeError("KRONOS_SOURCE_DIR must point to a checkout of https://github.com/shiyu-coder/Kronos")
    source_path = Path(source).expanduser().resolve()
    if not (source_path / "model" / "kronos.py").exists():
        raise RuntimeError(f"KRONOS_SOURCE_DIR is not a valid Kronos checkout: {source_path}")
    sys.path.insert(0, str(source_path))


def infer_frequency(index: pd.DatetimeIndex) -> pd.Timedelta:
    if len(index) < 3:
        raise ValueError("At least three timestamped candles are required.")
    diffs = index.to_series().diff().dropna()
    step = diffs.median()
    if pd.isna(step) or step <= pd.Timedelta(0):
        raise ValueError("Unable to infer a positive candle interval.")
    return step


def load_frame(path: Path, context: int) -> tuple[pd.DataFrame, pd.DatetimeIndex, pd.Timedelta]:
    frame = pd.read_csv(path)
    required = {"timestamp", "open", "high", "low", "close"}
    missing = required.difference(frame.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")

    frame["timestamp"] = pd.to_datetime(frame["timestamp"], utc=True, errors="raise")
    frame = frame.sort_values("timestamp").drop_duplicates("timestamp", keep="last")
    if frame[list(required - {"timestamp"})].isna().any().any():
        raise ValueError("OHLC columns contain NaN values.")
    if (frame["high"] < frame[["open", "close", "low"]].max(axis=1)).any():
        raise ValueError("Input contains candles whose high is below open/close/low.")
    if (frame["low"] > frame[["open", "close", "high"]].min(axis=1)).any():
        raise ValueError("Input contains candles whose low is above open/close/high.")

    context = max(3, min(context, 2048))
    frame = frame.tail(context).copy()
    timestamps = pd.DatetimeIndex(frame.pop("timestamp"))
    step = infer_frequency(timestamps)
    return frame, timestamps, step


def main() -> None:
    args = parse_args()
    if args.horizon < 1 or args.horizon > 120:
        raise ValueError("--horizon must be between 1 and 120 bars.")
    if args.samples < 1 or args.samples > 100:
        raise ValueError("--samples must be between 1 and 100.")

    add_official_source_to_path()
    from model.kronos import Kronos, KronosPredictor, KronosTokenizer

    model_dir = ASSET_ROOT / "model"
    tokenizer_dir = ASSET_ROOT / "tokenizer"
    if not (model_dir / "model.safetensors").exists() or not (tokenizer_dir / "model.safetensors").exists():
        raise RuntimeError("Verified Kronos assets are missing. Run scripts/download-kronos-assets.py first.")

    frame, timestamps, step = load_frame(Path(args.csv), args.context)
    future = pd.date_range(start=timestamps[-1] + step, periods=args.horizon, freq=step)

    tokenizer = KronosTokenizer.from_pretrained(str(tokenizer_dir))
    model = Kronos.from_pretrained(str(model_dir))
    predictor = KronosPredictor(model, tokenizer, device=args.device, max_context=2048)
    prediction = predictor.predict(
        frame,
        timestamps,
        future,
        pred_len=args.horizon,
        T=args.temperature,
        top_k=0,
        top_p=args.top_p,
        sample_count=args.samples,
        verbose=False,
    )

    last_close = float(frame["close"].iloc[-1])
    rows = []
    for timestamp, row in prediction.iterrows():
        rows.append({
            "timestamp": timestamp.isoformat(),
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
            "volume": float(row["volume"]),
            "amount": float(row["amount"]),
        })

    print(json.dumps({
        "symbol": args.symbol,
        "lastClose": last_close,
        "forecast": rows,
        "meta": {
            "model": "NeoQuasar/Kronos-mini",
            "tokenizer": "NeoQuasar/Kronos-Tokenizer-2k",
            "observerOnly": True,
            "executable": False,
            "contextRows": len(frame),
            "horizonBars": args.horizon,
            "sampleCount": args.samples,
        },
    }, separators=(",", ":")))


if __name__ == "__main__":
    main()
