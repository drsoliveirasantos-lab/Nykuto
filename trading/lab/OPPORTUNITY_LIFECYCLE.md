# Nykuto — Opportunity lifecycle after TP1

Status: **research only**. This policy does not authorize live orders and does not modify the frozen JEU23 sequential baseline.

## Goal

Remove artificial daily trade-count limits without turning “unlimited” into uncontrolled position stacking.

The system separates three concepts:

1. **Opportunity Census** — counts every distinct qualified market opportunity independently of account state.
2. **Setup lineage** — decides whether a later signal is a genuinely new setup or only another emission of the same parent setup.
3. **TP1 release lifecycle** — allows only one setup to carry fresh initial risk at a time, but permits a new independent setup after the prior setup reaches TP1 or fully closes.

## Frozen research policy

- No maximum trades per day.
- One fresh initial-risk slot at a time.
- The slot is released on **TP1** or on **full close**.
- A TP1 release assumes the remaining runner is immediately protected at **break-even** before the next setup receives fresh risk.
- TP1-protected runners may overlap with later independent setups.
- A later signal with the same explicit `setupId` is **not** a new trade, even after TP1 or final close.
- A setup without explicit structural lineage is treated as unique rather than guessed from side/family alone.
- Risk-incompatible analytical opportunities remain visible in the Census but do not consume the execution slot.
- If TP1 and SL are both touched in the same 5-minute bar, the conservative stop-first rule applies: TP1 does not release the slot.

## JEU23 ORB lineage

For the current JEU23 opening-range research family, setup identity is:

`ORB_RETEST | trading day | direction | opening-range close timestamp`

Multiple same-direction retest emissions from the same daily opening range therefore belong to one parent setup and cannot create repeated trades from the same idea.

Future B/S, REV, MSS/BOS and structural families should provide their own `setupId` based on the causal structural anchor (confirmed pivot, break, sweep, etc.) rather than using a generic time cooldown as a substitute for lineage.

## What the lifecycle test measures

The lifecycle layer reports:

- admitted independent setups;
- signals blocked because the initial-risk slot has not yet reached TP1/close;
- duplicate emissions blocked as `SAME_SETUP`;
- releases via TP1 vs close;
- maximum admitted trades in a day;
- maximum number of TP1-protected runners that coexist.

It deliberately does **not** aggregate portfolio PnL for overlapping runners yet. A valid PnL claim requires a dedicated multi-position fill replay that moves each runner stop to break-even at TP1 and applies account-level risk, fees, gaps and session constraints causally.

## Promotion rule

This layer remains research-only until it is tested on historical data with explicit setup lineage and then checked on a later unseen period. The existing frozen sequential results remain the reference baseline until such validation is complete.
