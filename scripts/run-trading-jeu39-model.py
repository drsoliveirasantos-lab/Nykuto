#!/usr/bin/env python3
"""One frozen, local CPU inference pass over private Game 39 requests.

No training, broker, network loader, prices after a decision, or PnL access.
The output is exclusively created before inference and is never overwritten.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]


def digest(value):
    return hashlib.sha256(value).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--assets-dir', type=Path, required=True)
    args = parser.parse_args()
    for path in [args.input, args.output, args.assets_dir]:
        require(not path.resolve().is_relative_to(ROOT), 'Private paths outside checkout required')
    require(not args.output.exists(), 'Output already exists; no recalculation or overwrite')

    freeze_bytes = (ROOT / 'trading/lab/jeu39-freeze.json').read_bytes()
    freeze = json.loads(freeze_bytes)
    for name, expected in freeze['files'].items():
        require(digest((ROOT / name).read_bytes()) == expected, f'Frozen dependency mismatch: {name}')
    commit = subprocess.check_output(['git', 'log', '-1', '--format=%H', '--', 'trading/lab/jeu39-freeze.json'], cwd=ROOT, text=True).strip()
    committed = subprocess.check_output(['git', 'show', f'{commit}:trading/lab/jeu39-freeze.json'], cwd=ROOT)
    require(digest(committed) == digest(freeze_bytes), 'Freeze must be committed before inference')
    source = json.loads((ROOT / 'trading/lab/jeu39-source.json').read_bytes())
    pack_bytes = args.input.read_bytes()
    pin = source['inputs']['requestPack']
    require(len(pack_bytes) == pin['bytes'] and digest(pack_bytes) == pin['sha256'], 'Frozen request pack mismatch')
    pack = json.loads(pack_bytes)
    require(pack.get('schema') == 'jeu39-requests-v1' and pack.get('executionAllowed') is False, 'Invalid private request pack')
    require(pack.get('sourceSha256') == {'prices': source['inputs']['prices']['sha256'], 'mnq': source['inputs']['mnq']['sha256']}, 'Request price sources differ from frozen sources')
    policy = {'contextBars': 64, 'intervalSeconds': 900, 'horizonBars': 4, 'seed': 42, 'temperature': 1, 'topK': 0, 'topP': .9, 'sampleCount': 1, 'device': 'cpu', 'threads': 2, 'amountPolicy': 'zero-unavailable'}
    require(pack.get('policy') == policy, 'Request policy differs from frozen inference settings')
    require(isinstance(pack.get('requests'), list) and isinstance(pack.get('links'), list), 'Incomplete request pack')

    spec = importlib.util.spec_from_file_location('nykuto_frozen_kronos', ROOT / 'scripts/run-trading-kronos.py')
    adapter = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(adapter)
    adapter.ROOT = args.assets_dir.resolve()
    for name, expected in adapter.PINNED_HASHES.items():
        require(digest((adapter.ROOT / name).read_bytes()) == expected, f'Pinned model asset mismatch: {name}')
    ids = set()
    for item in pack['requests']:
        require(set(item) == {'id', 'request'} and item['id'] not in ids, 'Duplicate or malformed request record')
        request = item['request']
        require(item['id'] == request.get('inputSha256') and request.get('symbol') == 'MNQ' and request.get('intervalSeconds') == 900 and len(request.get('candles', [])) == 64 and len(request.get('futureTimes', [])) == 4, 'Unexpected request configuration')
        adapter.validate_request(request)
        ids.add(item['id'])
    require(all(link.get('requestId') is None or link['requestId'] in ids for link in pack['links']), 'Unknown linked request')

    # Verify the available runtime before any forward pass, without installing.
    import numpy
    import pandas
    import torch
    import safetensors
    import huggingface_hub
    registry = json.loads((ROOT / 'trading/models/registry.json').read_bytes())
    require(registry['modelRevision'] == adapter.MODEL_REVISION and registry['tokenizerRevision'] == adapter.TOKENIZER_REVISION and registry['codeRevision'] == adapter.CODE_REVISION, 'Model revisions differ from audited registry')
    versions = {'torch': torch.__version__, 'numpy': numpy.__version__, 'pandas': pandas.__version__}
    require(all(versions[key] == registry['runtime'][key] for key in versions), 'CPU runtime differs from audited registry')
    require(safetensors.__version__ == '0.6.2' and huggingface_hub.__version__ == '0.33.1', 'Loader dependency version mismatch')
    predictor, runtime = adapter.load_predictor(device='cpu', threads=2)
    require(all(runtime[key] == expected for key, expected in registry['runtime'].items()), 'Loaded model runtime differs from audited registry')
    result = {'schema': 'jeu39-forecasts-v1', 'inputSha256': digest(pack_bytes), 'prePerformanceCommit': commit,
              'freezeSha256': digest(freeze_bytes), 'model': 'NeoQuasar/Kronos-mini',
              'modelRevision': adapter.MODEL_REVISION, 'tokenizerRevision': adapter.TOKENIZER_REVISION,
              'codeRevision': adapter.CODE_REVISION, 'policy': policy, 'runtime': runtime,
              'loaderVersions': {'safetensors': safetensors.__version__, 'huggingface_hub': huggingface_hub.__version__},
              'records': [], 'executionAllowed': False, 'independent': False}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive ownership is acquired before the first forecast. A prior file,
    # including an interrupted occurrence, blocks replay rather than being lost.
    with args.output.open('x') as output:
        for item in pack['requests']:
            try:
                forecast = adapter.infer(item['request'], predictor, runtime)
                record = {'id': item['id'], 'result': forecast, 'error': None}
            except Exception as exc:
                record = {'id': item['id'], 'result': None, 'error': f'{type(exc).__name__}: {exc}'}
            result['records'].append(record)
        result['generatedAt'] = datetime.now(timezone.utc).isoformat()
        json.dump(result, output, separators=(',', ':'), allow_nan=False)
        output.write('\n')
    failures = sum(record['error'] is not None for record in result['records'])
    invalid = sum(record['result'] is not None and not record['result']['forecastValidation']['validOhlcv'] for record in result['records'])
    print(json.dumps({'records': len(result['records']), 'failures': failures, 'invalidOhlcv': invalid, 'outputSha256': digest(args.output.read_bytes())}))


if __name__ == '__main__':
    main()
