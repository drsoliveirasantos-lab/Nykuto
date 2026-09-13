#!/usr/bin/env python3
"""Pinned, local-only Kronos-mini inference for Nykuto experimental requests.

No orders, broker connection, fitting, or historical outcome access.
Use --input REQUEST.json --output RESULT.json, or --input-dir/--output-dir.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import re
import sys
import time
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
CODE_REVISION = "67b630e67f6a18c9e9be918d9b4337c960db1e9a"
MODEL_REVISION = "f4e68697d9d5aed55cef5c96aabc3376bcad9f81"
TOKENIZER_REVISION = "26966d0035065a0cae0ebad7af8ece35bc1fb51c"
FIELDS = ("time", "open", "high", "low", "close", "volume")
TICKS = {"MNQ": 0.25, "MES": 0.25, "MYM": 1.0, "MGC": 0.1}
PINNED_HASHES = {
    "Kronos-mini/config.json": "70daca2cb11e3a979dd6b8ac12ee08e2aace877acf28f5b8dfb4fe5609736201",
    "Kronos-mini/model.safetensors": "a7d5f37e2e9fbd9891f7d7d4f72574512dd1f704fee14223e0a8cd0fbf54197c",
    "Kronos-Tokenizer-2k/config.json": "0b30a443affb03e05a876a083857de9164f899feb7b4d261da02c485c9a3e3b6",
    "Kronos-Tokenizer-2k/model.safetensors": "b97ec46b3b72160509e289183eaf7bdf5f0dac5bb9b49522f6d46638a99a8717",
    f"Kronos-{CODE_REVISION}/model/__init__.py": "f8f856ca3fedadcaac97e196be23d1aeda1c3c9ffe8903d66d43ea3bcac6240c",
    f"Kronos-{CODE_REVISION}/model/kronos.py": "0a5f90282e2039c2de0771473419715c845def154896dbd0f5747837e6241032",
    f"Kronos-{CODE_REVISION}/model/module.py": "a07edbadc0e96804c8158c021bbc6063bb7cc43b34d7fc470d5c8ff2005a409f",
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical_number(value):
    # Match JSON.stringify for ordinary finite OHLCV numbers. The accepted
    # magnitude range below excludes exponent formatting differences.
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return value


def request_hash(req):
    payload = [req["contract"], req["intervalSeconds"],
               [[canonical_number(c[k]) for k in FIELDS] for c in req["candles"]],
               req["futureTimes"]]
    return hashlib.sha256(json.dumps(payload, separators=(",", ":"), ensure_ascii=False,
                                     allow_nan=False).encode()).hexdigest()


def valid_ohlcv(row):
    return (all(math.isfinite(row[k]) for k in FIELDS[1:])
            and min(row[k] for k in ("open", "high", "low", "close")) > 0
            and row["volume"] >= 0
            and row["low"] <= min(row["open"], row["close"])
            and row["high"] >= max(row["open"], row["close"]))


def market_clock(timestamp):
    local = datetime.fromtimestamp(timestamp, ZoneInfo("America/New_York"))
    return local.date(), local.hour * 60 + local.minute


def validate_request(req, now=None):
    now = time.time() if now is None else now
    if req.get("schema") != "nykuto-kronos-request-v1":
        raise ValueError("Unsupported request schema")
    if req.get("symbol") not in {"MNQ", "MES", "MYM", "MGC"}:
        raise ValueError("Unsupported market")
    contract_pattern = re.escape(req["symbol"]) + r"(?:[FGHJKMNQUVXZ][0-9]{1,2}|-20[0-9]{2}(?:0[1-9]|1[0-2]))"
    if not isinstance(req.get("contract"), str) or not re.fullmatch(contract_pattern, req["contract"]):
        raise ValueError("Contract must match market and include delivery month/year")
    if (req.get("timezone") != "America/New_York"
            or req.get("timestampConvention") != "bar-open-utc-seconds"
            or req.get("amountPolicy") != "zero-unavailable"):
        raise ValueError("Unsupported temporal or amount convention")
    step = req.get("intervalSeconds")
    if type(step) is not int or step not in {60, 300, 900, 3600}:
        raise ValueError("Invalid intervalSeconds")
    candles, future = req.get("candles"), req.get("futureTimes")
    if not isinstance(candles, list) or not 32 <= len(candles) <= 512:
        raise ValueError("Require 32–512 completed historical bars")
    if not isinstance(future, list) or not 1 <= len(future) <= 4:
        raise ValueError("Require 1–4 future bar timestamps")
    previous = None
    for i, row in enumerate(candles):
        if not isinstance(row, dict) or any(k not in row for k in FIELDS):
            raise ValueError(f"Incomplete candle {i}")
        if type(row["time"]) is not int or not 946684800 <= row["time"] <= 9007199254740991:
            raise ValueError(f"Invalid time in candle {i}")
        for key in FIELDS[1:]:
            value = row[key]
            if type(value) not in (int, float) or not math.isfinite(value):
                raise ValueError(f"Nonfinite numeric candle field {i}/{key}")
            if value != 0 and not 0.0001 <= abs(value) < 1000000000000000:
                raise ValueError(f"Unsupported numeric magnitude {i}/{key}")
        if not valid_ohlcv(row):
            raise ValueError(f"Invalid OHLCV candle {i}")
        tick = TICKS[req["symbol"]]
        if any(abs(row[key] / tick - round(row[key] / tick)) > 1e-5 for key in FIELDS[1:5]):
            raise ValueError(f"Prices do not respect native contract tick in candle {i}")
        if row["time"] + step > now:
            raise ValueError(f"Historical candle {i} is not closed yet")
        day, minute = market_clock(row["time"])
        end_day, end_minute = market_clock(row["time"] + step)
        if row["time"] % 60 or day != end_day or minute < 570 or end_minute > 960:
            raise ValueError("Only 09:30–16:00 New York cash-session bars are supported")
        if previous is not None and (row["time"] <= previous
                or (market_clock(previous)[0] == day and row["time"] - previous != step)):
            raise ValueError("Duplicate, unsorted, or missing intraday historical bars")
        previous = row["time"]
    last = candles[-1]["time"]
    for i, timestamp in enumerate(future):
        if type(timestamp) is not int or timestamp != last + (i + 1) * step:
            raise ValueError("Future times must be contiguous subsequent bars")
        if market_clock(timestamp)[0] != day or market_clock(timestamp + step)[1] > 960:
            raise ValueError("Forecast horizon must remain inside the same cash session")
    if request_hash(req) != req.get("inputSha256"):
        raise ValueError("Input SHA-256 mismatch; no inference performed")


def load_predictor(device="cpu", threads=2):
    for relative, expected in PINNED_HASHES.items():
        if digest(ROOT / relative) != expected:
            raise ValueError(f"Pinned asset hash mismatch: {relative}")
    # No Hugging Face from_pretrained/network loader is used.
    import numpy as np
    import pandas as pd
    import torch
    from safetensors.torch import load_file
    torch.set_num_threads(threads)
    torch.set_num_interop_threads(1)
    sys.path.insert(0, str(ROOT / f"Kronos-{CODE_REVISION}"))
    from model import Kronos, KronosTokenizer, KronosPredictor
    model = Kronos(**json.loads((ROOT / "Kronos-mini/config.json").read_text()))
    tokenizer = KronosTokenizer(**json.loads((ROOT / "Kronos-Tokenizer-2k/config.json").read_text()))
    model.load_state_dict(load_file(ROOT / "Kronos-mini/model.safetensors", device="cpu"), strict=True)
    tokenizer.load_state_dict(load_file(ROOT / "Kronos-Tokenizer-2k/model.safetensors", device="cpu"), strict=True)
    model.eval()
    tokenizer.eval()
    predictor = KronosPredictor(model, tokenizer, device=device, max_context=2048)
    info = {"device": device, "threads": threads, "torch": torch.__version__,
            "numpy": np.__version__, "pandas": pd.__version__,
            "modelParameters": sum(p.numel() for p in model.parameters()),
            "tokenizerParameters": sum(p.numel() for p in tokenizer.parameters()),
            "strictStateDictLoad": True}
    return predictor, info


def infer(req, predictor, runtime):
    validate_request(req)
    import numpy as np
    import pandas as pd
    import torch
    # Seed fixed independently for every request, never selected after outcomes.
    np.random.seed(42)
    torch.manual_seed(42)
    frame = pd.DataFrame(req["candles"])[list(FIELDS[1:])]
    frame["amount"] = 0.0
    def local_times(values):
        return pd.Series(pd.to_datetime(values, unit="s", utc=True).tz_convert(
            "America/New_York").tz_localize(None))
    historical_times = local_times([row["time"] for row in req["candles"]])
    future_times = local_times(req["futureTimes"])
    started = time.perf_counter()
    with torch.inference_mode():
        prediction = predictor.predict(frame, historical_times, future_times,
            pred_len=len(future_times), T=1.0, top_k=0, top_p=0.9,
            sample_count=1, verbose=False)
    elapsed = time.perf_counter() - started
    forecast = [{"time": timestamp, **{key: float(prediction.iloc[i][key]) for key in FIELDS[1:]}}
                for i, timestamp in enumerate(req["futureTimes"])]
    if not all(math.isfinite(row[key]) for row in forecast for key in FIELDS[1:]):
        raise ValueError("Model produced nonfinite forecast values")
    invalid = [i for i, row in enumerate(forecast) if not valid_ohlcv(row)]
    return {"schema": "nykuto-kronos-result-v1", "inputSha256": req["inputSha256"],
            "symbol": req["symbol"], "contract": req["contract"],
            "model": "NeoQuasar/Kronos-mini", "modelRevision": MODEL_REVISION,
            "tokenizerRevision": TOKENIZER_REVISION, "codeRevision": CODE_REVISION,
            "seed": 42, "temperature": 1.0, "topP": 0.9, "sampleCount": 1,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "elapsedSeconds": elapsed, "forecast": forecast,
            "forecastValidation": {"validOhlcv": not invalid, "invalidOhlcvRows": invalid,
                                   "postprocessing": "none-raw-model-output"},
            "runtime": runtime, "executionEnabled": False,
            "experimentOnly": True}


def main():
    global ROOT
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--input", type=Path)
    source.add_argument("--input-dir", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument("--device", choices=["cpu", "mps"], default="cpu")
    parser.add_argument("--threads", type=int, default=2)
    parser.add_argument("--assets-dir", type=Path, default=ROOT,
                        help="Directory containing pinned model/code assets (default: script directory)")
    args = parser.parse_args()
    ROOT = args.assets_dir.resolve()
    if args.input and not args.output or args.input_dir and not args.output_dir:
        parser.error("Specify matching --output or --output-dir")
    if not 1 <= args.threads <= 16:
        parser.error("--threads must be between 1 and 16")
    paths = [args.input] if args.input else sorted(args.input_dir.glob("*.json"))
    if not paths:
        parser.error("No request files found")
    started = time.perf_counter()
    predictor, runtime = load_predictor(args.device, args.threads)
    load_seconds = time.perf_counter() - started
    outcomes = []
    for path in paths:
        output = args.output if args.input else args.output_dir / path.name
        try:
            request = json.loads(path.read_text())
            result = infer(request, predictor, runtime)
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(json.dumps(result, indent=2, allow_nan=False) + "\n")
            entry = {"request": path.name, "success": True, "elapsedSeconds": result["elapsedSeconds"],
                     "validOhlcv": result["forecastValidation"]["validOhlcv"]}
        except Exception as exc:
            entry = {"request": path.name, "success": False, "error": str(exc)}
        outcomes.append(entry)
        print(json.dumps(entry), flush=True)
    summary = {"loadSeconds": load_seconds, "runtime": runtime,
               "successCount": sum(x["success"] for x in outcomes),
               "failureCount": sum(not x["success"] for x in outcomes), "requests": outcomes}
    summary_path = (args.output_dir if args.input_dir else args.output.parent) / "execution-summary.json"
    summary_path.write_text(json.dumps(summary, indent=2) + "\n")
    if summary["failureCount"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
