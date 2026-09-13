# Jeu 05 — Fixed session-close hypothesis

## Decision recorded before retrieving or scoring the 2025 holdout

The owner requested improvement after Jeu 04 failed. On the already inspected
January–June 2026 sample, the filtered strategy has four adverse-gap exits
totalling -9.96416027228573 R, including a worst trade of -4.041759595486498 R.
Ten positions span nights (five winners, aggregate -3.7641602722857455 R).
Longs, shorts and three entry-hour groups were also examined descriptively.
No direction or optimized entry-hour filter is selected from those small groups.
Excluding losing trades retrospectively would not simulate a tradable rule.

Exactly one new hypothesis is committed: remove overnight exposure. Compare the
unchanged EMA9/21 + ADX14>=20 control with the same strategy under this policy:

- Liquidate open positions at the opening price of the last 15-minute regular
  session bar (15:45 New York normally, 12:45 on a 13:00 early close).
- At this opening instant, an adverse opening gap still fills at the open;
  a favorable opening beyond the target conservatively fills at the target.
  The following 15-minute bar's high/low/close must not inform this exit.
- No entry in this final bar. Discard pending signals at the boundary; do not
  carry a closing signal into the next session.
- Leave direction, EMA periods, ADX, ATR, 1.5R objective, daily limits and costs
  unchanged. Re-run both variants at 0.05R; re-run the candidate at 0.10R.
- Use the exchange calendar to validate every expected session and interval,
  including early closes and DST; never infer closing time from missing data.

## Evaluation design

Development/explanation: January–June 2026, previously used in Jeu 04. Any
improvement here is exploratory and cannot qualify the candidate.

New held-out historical comparison: January–February, March–April, May–June
2025, prepared with December 2024 bars (at least 220). These dates have not
been used by this project's Games 03–04; this is a retrospective holdout,
not a prospective live test or a claim that the owner never saw those prices.
Freeze the rule and these windows before retrieving/scoring this history.
Do not change the policy or choose different dates after seeing its results.

Candidate research gates, applied only to the 2025 comparison:
at least 40 trades overall and 12 per window; positive expectancy in every
window; aggregate expectancy greater than the control; PF >=1.10;
realized drawdown <=8R; positive aggregate expectancy at doubled costs.
These are the prior project's research thresholds, not statistical proof.
Report total R, expectancy, sample size, win rate, drawdown and worst trade;
never equate a higher win rate with profitability. Keep all bots disabled.
If the hypothesis fails, publish the failure without adding more filters.

The original Jeu 04 remains available with identical default engine behavior.
The new UI loads private hosted histories and recalculates; no manual file step.

## Modeling limits and supporting reading

The closing fill is a bar-open approximation and fixed costs are a sensitivity
assumption, not a broker execution guarantee. Intraday gaps, variable slippage,
borrowing and financing remain limitations. No portfolio return is implied by R.
Connector adjustment settings are not exposed and are not independently verified.

- FINRA, Stop Orders: Factors to Consider During Volatile Markets (2025-03-26):
  https://www.finra.org/investors/insights/stop-orders-factors-consider-during-volatile-markets
  Stop triggers do not guarantee execution at the stop price.
- Bailey et al., The Probability of Backtest Overfitting (2015):
  https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf
  Selecting rules after multiple backtests can overfit; one fixed holdout result
  is limited evidence and cannot be reused after further tuning.

## Retrieved snapshot and unchanged-rule results

Alpaca SIP provided December 2024–June 2025 in seven monthly requests. After
regular-session filtering and full exchange-calendar checks: 3,706 bars across
143 sessions (including preparation). The private JSON bundle includes those
bars, the two calendars and provider request metadata. Its 271,688 UTF-8 bytes
have SHA-256 `d2ce90483ff835e3e867fde80ca85d81bbe4ab768de02488ab92f9f43d3c9e60`.
KV key: `jeu05/spy-session-comparison-v1.json`, namespace/binding reused from
Jeu 04. API: `/api/lab/jeu05`; the client verifies the complete bundle before
parsing the CSV, and the engine verifies every calendar session again.

New comparison, January–June 2025:

| Metric | With nights | Flat before close |
| --- | ---: | ---: |
| Trades | 54 | 54 |
| Winners | 19 | 22 |
| Win rate | 35.19% | 40.74% |
| Total R | -24.02865323244682 | -5.988938263188864 |
| Mean R | -0.4449750598601263 | -0.11090626413312711 |
| Realized drawdown R | 28.002675725156713 | 12.803942857710663 |
| Worst observed trade R | -7.899117154079951 | -1.0500000000000531 |

The candidate totals by window are +2.3393647897325573 R,
+1.6159281849241045 R and -9.944231237845527 R. At doubled costs the aggregate
is -8.688938263188865 R. Verdict: **Non confirmé**. Risk and loss reduction do
not establish profitability. No rule was changed after this result, and no
additional filter was selected to conceal the negative May–June period.

Exploratory 2026 comparison: original control 47 trades, -7.614160272285612 R,
40.43% win rate; session-close candidate 44 trades, +1.9455240709808754 R,
47.73% win rate. The tempting positive development result is not the holdout
verdict. The UI shows both datasets separately and recalculates all metrics.

Verification includes session-boundary execution using only the open price,
no final-bar entry or overnight signal, early closes/DST, missing whole
sessions/intervals, byte integrity, private endpoint authorization, and
unchanged Jeu 04 reproduction. Synthetic test fixtures are not served as data.
