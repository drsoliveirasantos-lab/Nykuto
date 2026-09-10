#!/usr/bin/env python3
"""Download and verify the pinned Kronos-mini research assets outside Git.

This script intentionally writes to .models/, which is ignored by the repository.
It does not download market data and does not enable any broker/paper/live path.
"""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

from huggingface_hub import hf_hub_download

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "trading" / "kronos" / "model-manifest.json"
OUTPUT_ROOT = ROOT / ".models" / "kronos-mini"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def download_asset(entry: dict, target_dir: Path) -> Path:
    target_dir.mkdir(parents=True, exist_ok=True)
    downloaded = Path(
        hf_hub_download(
            repo_id=entry["id"],
            filename=entry["file"],
            revision=entry["revision"],
        )
    )
    target = target_dir / entry["file"]
    shutil.copy2(downloaded, target)
    actual = sha256(target)
    if actual != entry["sha256"]:
        target.unlink(missing_ok=True)
        raise RuntimeError(
            f"SHA-256 mismatch for {entry['id']}/{entry['file']}: expected {entry['sha256']}, got {actual}"
        )
    return target


def download_config(entry: dict, target_dir: Path) -> Path:
    downloaded = Path(
        hf_hub_download(
            repo_id=entry["id"],
            filename="config.json",
            revision=entry["revision"],
        )
    )
    target = target_dir / "config.json"
    shutil.copy2(downloaded, target)
    return target


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    model_dir = OUTPUT_ROOT / "model"
    tokenizer_dir = OUTPUT_ROOT / "tokenizer"

    model = download_asset(manifest["model"], model_dir)
    tokenizer = download_asset(manifest["tokenizer"], tokenizer_dir)
    model_config = download_config(manifest["model"], model_dir)
    tokenizer_config = download_config(manifest["tokenizer"], tokenizer_dir)

    result = {
        "status": "verified",
        "model": str(model.relative_to(ROOT)),
        "modelSha256": sha256(model),
        "tokenizer": str(tokenizer.relative_to(ROOT)),
        "tokenizerSha256": sha256(tokenizer),
        "modelConfig": str(model_config.relative_to(ROOT)),
        "tokenizerConfig": str(tokenizer_config.relative_to(ROOT)),
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
