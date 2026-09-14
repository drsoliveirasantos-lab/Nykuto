# Nykuto Trading — Footprint Pro Wave 9: health transitions

Date: 2026-09-14
Status: retrospective transition screening / SHADOW only. No production, risk, stop or target change.

## Method
Uses the 57 M15+POC observations already encoded in Wave 8. At +5/+10/+15/+20 minutes, the three axes are M5 flow alignment, positive price progress in R, and confirmed M15 POC direction. State mapping: HEALTHY = >=2/3 axes healthy; WEAKENING = 1/3; FAILURE = 0/3.

## Full transition paths
- H>H>H>H: n=26, mean R30 +1.318, positive 88.5%.
- H>H>W>H: n=6, +0.325, positive 66.7%.
- W>W>H>H: n=3, -0.416, positive 0%.
- H>H>H>W: n=3, -0.289, positive 33.3%.
- Other paths are n<=2 and are not interpretable individually.

## Adjacent transitions
+5 to +10:
- H->H: n=37, +0.942R.
- H->W: n=4, -0.113R.
- W->H: n=8, +0.340R.
- W->W: n=5, -0.650R.

+10 to +15:
- H->H: n=31, +1.298R.
- H->W: n=11, +0.034R.
- W->H: n=5, -0.041R.
- W->W: n=4, -0.874R.
- H->F: n=3, -1.000R.

+15 to +20:
- H->H: n=33, +1.178R.
- H->W: n=4, +0.034R.
- W->H: n=6, +0.325R.
- W->W: n=6, -0.346R.
- W->F: n=3, -1.000R.

## Persistence screen
Number of snapshots at WEAKENING/FAILURE (score <=1):
- >=1 bad snapshot: n=31, -0.092R, positive 35.5%.
- >=2 bad snapshots: n=19, -0.569R, positive 15.8%.
- >=3 bad snapshots: n=12, -0.756R, positive 8.3%.
- 4/4 bad snapshots: n=4, -0.871R, positive 0%.

Conversely, number of HEALTHY snapshots (score >=2):
- >=2: n=45, +0.900R.
- >=3: n=38, +1.111R.
- 4/4: n=26, +1.318R.

## Interpretation
Persistence matters more than a single transient weakening. One isolated WEAKENING can recover; repeated WEAKENING/FAILURE is associated with progressively worse R30. The cleanest provisional transition concept is therefore not 'exit on first warning' but `PERSISTENT WEAKENING` after at least two unhealthy snapshots. A transition directly from HEALTHY to FAILURE at +15 was catastrophic in this tiny sample (n=3), but is far too small for promotion.

A recovery is path-dependent. H>H>W>H remained positive (+0.325R), while W>W>H>H remained negative (-0.416R). Thus a late temporary weakening after an established healthy path is different from a trade that begins weak and only later recovers.

## Provisional live-state vocabulary
- HEALTHY: >=2/3 axes healthy.
- WEAKENING: 1/3 on one snapshot.
- PERSISTENT WEAKENING: <=1/3 on at least two monitored snapshots — SHADOW warning.
- FAILURE: 0/3, especially after prior deterioration — SHADOW severe warning.
- RECOVERED: return to HEALTHY after weakening; retain history flag because recovery does not erase prior weakness.

No automatic exit is promoted. Prospective validation is required, and these thresholds were defined using already-seen data.
