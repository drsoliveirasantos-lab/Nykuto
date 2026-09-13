# Adaptive risk policy — research only

This layer answers one narrow question: **how much fresh risk should a specific qualified opportunity deserve, up to an absolute ceiling of 500 USD?** It does not authorize live execution and it is not a daily-loss controller.

## Owner rule

- 500 USD is the absolute per-trade ceiling, never the default stake.
- Risk varies by opportunity.
- Current-day loss throttling is intentionally excluded from this research layer for now. A later account-protection layer may reduce or block risk after a bad day, but that must be evaluated separately so it does not hide the raw potential of the signal model.
- Existing Opportunity Census and TP1 lifecycle rules remain separate: every distinct setup is counted; a fresh-risk slot is released after TP1 only under the break-even runner assumption or after full close; repeated emissions of the same `setupId` are not new trades.

## Inputs

Adaptive sizing uses three independent inputs:

1. **Expected value in R** — preferably an empirical `historicalEvR` / `expectancyR`. If that is unavailable, the module may derive a binary approximation only from an explicitly calibrated terminal win probability plus its reward multiple. A TP1 reach percentage by itself is never treated as terminal win probability.
2. **Evidence size** — the historical sample count (`evidenceN`). Confidence is shrunk as `n / (n + 100)` so a small high-performing bucket cannot immediately receive large risk.
3. **Setup quality** — a normalized quality value or known CLEAN/T5 quality context. Quality changes sizing but is never converted into a win probability.

This preserves the research lesson that a confluence count is not a probability and that the earlier graded-risk / fixed-500 experiments did not validate larger risk merely because a setup looked stronger.

## Risk formula

For positive expectancy:

```text
edgeScore      = clamp(expectedR / 0.50R, 0, 1)
confidence     = n / (n + 100)
qualityFactor  = 0.50 + 0.50 × quality
rawRisk        = min(500, 500 × edgeScore × confidence × qualityFactor)
recommended    = rawRisk rounded down to the nearest 5 USD
```

If expectancy is zero or negative, recommended risk is 0. If expectancy or evidence size is missing, the opportunity stays visible but is marked `INSUFFICIENT_EVIDENCE` rather than receiving an invented risk budget.

The maximum requested by callers is always clamped to 500 USD. Passing 1,000 or 5,000 cannot increase the ceiling.

## Contract sizing

The structural stop is not moved to spend the budget. Quantity is rounded down:

```text
perContractLoss = |entry - stop| × pointValue + estimated per-contract costs
quantity        = floor(recommendedRisk / perContractLoss)
plannedLoss     = quantity × perContractLoss
```

Therefore planned loss cannot exceed the adaptive recommendation. If the recommendation cannot fund one contract, the opportunity is retained as `ANALYTICAL_ONLY_RISK`.

## Separation from account protection

Fields such as current daily PnL are deliberately ignored by `adaptive-risk.mjs`. This is intentional for the present potential study, not a claim that daily drawdown should be ignored in funded trading. Lucid/account loss limits, payout rules, portfolio runner risk and any future rule such as reducing risk after a -800/-1,000 USD day belong to a distinct execution/account guard and require their own replay.

## Research boundary

- `researchOnly: true`
- `executionAllowed: false`
- no broker route
- no automatic promotion
- no claim that software tests prove profitability
- no claim that a small T5/CLEAN sample justifies maximum risk
- historical sizing performance must be replayed trade-by-trade before comparing monthly PnL or payout potential
