"""Normalize private Massive exports; publish fingerprints only, never prices."""
import csv
import hashlib
import json
import pathlib
import shutil
import subprocess
import sys
from datetime import datetime, timezone

repo = pathlib.Path(__file__).resolve().parents[1]
directory, mnq_path = [pathlib.Path(p).resolve() for p in sys.argv[1:3]]
if directory.is_relative_to(repo) or mnq_path.is_relative_to(repo):
    raise ValueError('Market data must stay outside the repository')
definitions = json.loads(subprocess.check_output([
    'node', '--input-type=module', '-e',
    "import {JEU19_SEGMENTS} from './trading/lab/jeu19-policy.mjs'; console.log(JSON.stringify(JEU19_SEGMENTS))"
], cwd=repo))

def rows(name):
    with (directory / name).open(newline='') as handle:
        return list(csv.DictReader(handle))

products = []
for symbol in ['MES', 'MYM', 'MGC']:
    segments = []
    for definition in [d for d in definitions if d['symbol'] == symbol]:
        ticker = definition['ticker']
        metadata = rows(ticker + '-metadata.csv')
        assert len(metadata) == 1 and metadata[0]['ticker'] == ticker
        bars = [[int(r['time']), *[float(r[k]) for k in ['open', 'high', 'low', 'close', 'volume']]]
                for r in rows(ticker + '.csv')]
        assert len({r[0] for r in bars}) == len(bars)
        segments.append({'ticker': ticker, 'metadata': metadata[0], 'paginationComplete': True, 'bars': bars})
    products.append({'symbol': symbol, 'segments': segments, 'scheduleEvents': rows(symbol + '-schedules.csv')})

bundle = {'schema': 'jeu19-data-v1', 'provider': 'Massive', 'resolution': '5min',
          'retrievedAt': datetime.now(timezone.utc).isoformat(), 'products': products}
encoded = (json.dumps(bundle, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
(directory / 'dataset.json').write_bytes(encoded)
shutil.copyfile(mnq_path, directory / 'mnq-dataset.json')
manifest = {'provider': 'Massive', 'resolution': '5min', 'bytes': len(encoded),
            'sha256': hashlib.sha256(encoded).hexdigest(), 'retrievedAt': bundle['retrievedAt'],
            'contracts': [s['ticker'] for p in products for s in p['segments']],
            'rawPublic': False, 'mnqSource': 'Pinned Jeu 14 archive, reused observations'}
(repo / 'trading/lab/jeu19-source.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({'bytes': len(encoded), 'sha256': manifest['sha256'],
                  'contracts': len(manifest['contracts']),
                  'bars': {p['symbol']: sum(len(s['bars']) for s in p['segments']) for p in products}}))
