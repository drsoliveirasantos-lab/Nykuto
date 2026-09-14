# Nykuto Trading — Footprint Pro Wave 8 — Health Triad

Date: 2026-09-14  
Status: retrospective mechanism screening / SHADOW only. No commercial Pine change, no live management promotion.

## Goal

Test whether the live trade state improves when three independent mechanisms are tracked together after a M15+POC entry:

1. M5 flow direction versus the trade.
2. Price progress versus entry in R units.
3. Confirmed M15 POC migration versus the trade.

The intent is not to create a generic score, but to classify trade health as a state machine using flow + price response + POC acceptance.

## Sample

Same historical M15+POC opportunity family used in the Footprint Pro campaigns, reconstructed causally from the June–September 2026 MNQ Footprint exports. The test uses only confirmed M15 bars available at each snapshot.

57 historical M15+POC opportunities were available for this mechanism screen.

## Health axes

At each +5/+10/+15/+20 minute snapshot:

- FLOW_OK: current M5 Footprint delta remains in the trade direction.
- PRICE_OK: current price is above 0R in the trade direction.
- POC_OK: latest confirmed M15 POC migration is in the trade direction.

The count of satisfied mechanisms is used only as an explanatory health state (0/3 to 3/3), not as a probability or entry score.

## Main results

### +10 minutes

| Health mechanisms | n | Mean subsequent/30m R | Positive trades | Median R |
|---|---:|---:|---:|---:|
| 0/3 | 2 | -0.742R | 0.0% | -0.742R |
| 1/3 | 10 | -0.470R | 20.0% | -0.747R |
| 2/3 | 19 | +0.643R | 52.6% | +0.106R |
| 3/3 | 26 | +0.976R | 84.6% | +0.757R |

This is the cleanest snapshot in the old data. Once flow, price response and POC acceptance are all aligned, the historical path is much stronger than when only zero or one mechanism is healthy.

### +15 minutes

| Health mechanisms | n | Mean R | Positive trades |
|---|---:|---:|---:|
| 0/3 | 5 | -0.897R | 0.0% |
| 1/3 | 15 | -0.208R | 40.0% |
| 2/3 | 14 | +1.040R | 64.3% |
| 3/3 | 23 | +1.064R | 82.6% |

### +20 minutes

| Health mechanisms | n | Mean R | Positive trades |
|---|---:|---:|---:|
| 0/3 | 4 | -1.000R | 0.0% |
| 1/3 | 14 | -0.387R | 28.6% |
| 2/3 | 19 | +0.744R | 68.4% |
| 3/3 | 20 | +1.335R | 85.0% |

### +5 minutes

The +5 minute split is less monotonic: 2/3 outperformed 3/3 in mean R. This is consistent with the M15 POC axis still being relatively stale/lagged so early after entry. Therefore the triad should not be used as a hard +5 minute decision rule.

## Important mechanism result

At +10 minutes, the strongest positive state is:

`FLOW aligned + PRICE > 0R + confirmed M15 POC aligned` = HEALTHY 3/3.

The weakest states are those with zero or one healthy mechanism. This reinforces Wave 6/7: an opposite M5 flow alone is not enough to declare failure, and a POC signal alone is not enough to rescue a trade whose price and M5 flow have already failed.

Examples inside the +10 minute data:

- price + POC healthy while M5 flow is opposed: n=12, about +0.754R, 66.7% positive.
- flow + price failed while POC remains supportive: n=8, about -0.588R, 12.5% positive.
- all three failed: n=2, about -0.742R, 0% positive.

Thus PRICE RESPONSE is a critical axis, and POC should be treated as acceptance context rather than a standalone rescue signal.

## State transitions +10 to +20

The transition data also supports a state-machine interpretation:

- 3/3 at +10 and still 3/3 at +20: n=11, about +1.60R.
- 3/3 at +10 degrading to 2/3 at +20: n=12, about +0.68R.
- 2/3 at +10 improving to 3/3 at +20: n=7, about +1.59R.
- 2/3 at +10 degrading to 1/3: n=6, about -0.52R.
- 1/3 remaining 1/3: n=5, about -0.50R.

Small samples, but directionally this supports transitions rather than one static snapshot.

## Proposed SHADOW live states

Do not display 0/3–3/3 as fake probabilities. Translate the mechanisms into explicit states:

- `HEALTHY`: flow aligned + price >0R + POC supportive.
- `HEALTHY / ABSORBING`: price and POC remain supportive while M5 flow temporarily opposes.
- `WEAKENING`: only one of the three mechanisms remains healthy, or a previously healthy state degrades materially.
- `RECOVERING`: health improves from <=1/3 to >=2/3.
- `TRADE FAILURE`: flow and price fail together; severity increases when POC also opposes or the state persists.

All states remain SHADOW until prospective validation.

## What this changes in V2 collection

The Pro CORE should save synchronized snapshots at +5/+10/+15/+20 minutes containing:

- M5 oriented delta / flow state.
- price progress in R.
- confirmed M15 POC migration direction and magnitude.
- M15 source-close timestamp used at that moment.
- resulting live state code.
- previous live state code to reconstruct transitions.

No automatic exit, TP change, risk increase or commercial-Pine modification is authorized from this retrospective screen.

## Decision

Wave 8 supports adding a three-axis live health model to Nykuto Pro research. The most useful checkpoint in the current historical sample is around +10 minutes. The main insight is mechanistic: **flow, price response and POC acceptance together are substantially more informative than any one of them alone.**

The next prospective V2 phase should collect these three axes plus cell-level Footprint location, then validate whether transitions HEALTHY -> WEAKENING -> FAILURE remain predictive on unseen observations.
