# Nykuto Trading — Footprint Pro V1 protocol

Date: 2026-09-14  
Status: **retrospective architecture screening / reproduction audit**. This is not an independent holdout and cannot promote a commercial trading rule.

## Purpose

This first wave has four goals:

1. make Nykuto Trading the durable source of truth for the Footprint/Pro work;
2. reproduce the already-reported M5/M15/M45 candidate statistics from the exact private CSV hashes before adding anything new;
3. keep a **1R benchmark** beside the existing 30-minute mark-to-close research policy;
4. screen whether M10, M30 and M2/M3/M4 add useful incremental information to the stronger M15 states without tuning new thresholds.

Raw market prices and private Pine source stay outside the public repository. The repository stores only code, hashes, aggregate results and decisions.

## Private inputs

The exact private CSV filenames, byte sizes and SHA-256 hashes are pinned in `footprint-pro-v1-source.json` for M1, M2, M3, M4, M5, M10, M15, M30 and M45.

The M5 source must produce **1,712 Nykuto signals with an available Footprint** before the test proceeds.

## Causal convention

- A Nykuto signal exists at the close of its M5 bar.
- Every other timeframe uses only the latest bar whose own close is at or before that M5 signal close.
- No open M10/M15/M30/M45 candle is allowed to contribute information.
- Entry equals the admitted Nykuto entry at the M5 close.
- Sequential replay admits only one active position at a time; opportunity count is also reported separately.
- Round-trip transaction allowance: 3.25 USD per MNQ contract.

## Two fixed outcome policies

### HOLD30

Structural SL remains -1R. If it is not hit, the position is marked to the M5 close 30 minutes after the signal. This reproduces the prior multi-timeframe campaign.

### TP1-1R benchmark

The same signal is capped at the existing TP1 (~+1R). The first SL or TP1 touch wins; when both are touched inside the same M5 candle, the stop is assumed first. If neither is hit by 30 minutes, the position is marked to the 30-minute close.

This is only a benchmark. It does not modify the live Pine or claim that 1R is universally better or worse.

## Frozen states reproduced

- `PRE_BASE`: 08:00–09:30 New York.
- `M15_BAR_POC`: current M15 Footprint aligned with the Nykuto signal and M15 POC migration aligned.
- `FLOW_RESPONSE`: pre-market, oriented current M15 delta >= 10%, oriented M15 body progression >= 0.20 ATR.
- `FLOW_ACCEPTANCE`: pre-market, oriented M15 delta >= 5%, body progression >= 0.20 ATR, oriented POC migration >= 0.02 ATR.
- `M5_ZONE`: oriented M5 Delta30 between 30% and 50%.
- `M10_PRESS20`: oriented M10 Delta30 >= 20%.
- `STALE_ALL`: M45 current Footprint still aligned while M15 current Footprint is already opposed.
- `FRESH_PRE`: M45 opposed while M15 is aligned, pre-market only.

## First non-tuned architecture checks

No grid search is allowed in this wave. The following simple states are evaluated exactly once:

- `M30_ALIGN_PRE`: current M30 Footprint has the same sign as the Nykuto signal.
- `M45_ALIGN_PRE`: generic current M45 alignment, to verify that M45 should not be treated as a generic confirmation merely because STALE is useful.
- M15+POC plus M10 pressure.
- M15+POC plus M30 current alignment.
- M15+POC plus both M10 and M30.
- Flow Response plus the same M10/M30 additions.
- `MICRO234`: M2, M3 and M4 must all be available; majority alignment means at least two of their current Footprint deltas agree with the Nykuto side. No magnitude threshold is optimized.

M1 is measured for data quality and context only. It is not a hard gate in this wave because its historical Footprint is strongly one-sided.

## Promotion boundary

This run may choose what deserves to be **displayed or collected** in Nykuto Pro. It may not:

- modify `NYKUTO STANDARD — PARTNERS`;
- increase risk;
- change live BUY/SELL admission;
- hard-veto trades from a newly screened state;
- claim independent validation;
- tune a threshold after reading this run.

Any eventual hard gate still requires a frozen prospective sample.
