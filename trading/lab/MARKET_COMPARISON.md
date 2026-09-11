# Jeu 06 — Fixed cross-market comparison

## Frozen before retrieving/scoring the final sample

Continue the owner's Lab with SPY, MES and MNQ. These are research products,
not a selection for live investment or an inference about the friends' broker.
Compare the existing EMA9/21 + ADX14>=20, ATR14*1.25 stop, 1.5R target,
three entries/day maximum, pause after two consecutive losses or -2R realized.
Close at the opening of the final 15-minute shared cash-session bar and discard
all overnight signals. One position at a time; no parameter search.

New retrospective sample: July–August, September–October and November–December
2025. June 2025 prepares the indicators (preparation only; no scored trades). No rules or dates may be selected from
the resulting performance. Games 04–05 remain unchanged. This is a new
historical comparison, not prospective validation or independent asset bets:
SPY and MES share S&P 500 exposure, and equity index markets are correlated.

Use authentic 15-minute OHLCV from Alpaca SIP (SPY) and Massive (MES/MNQ).
Use the Alpaca cash-market calendar and verify futures trading schedules cover
these same intervals. Score only the shared cash session, including early
closes; this is not a claim to test the full overnight futures market.

Futures contract selection is fixed by date, not subsequent volume or return:
September 2025 contract until September 14; December 2025 from September 15
through December 14; March 2026 from December 15. This roll convention is a modeling choice.
Prepare each actual contract's indicators separately with >=220 earlier
cash-session bars; never concatenate unadjusted contracts into one indicator.
Fetch September from 2025-06-01, December from 2025-08-15, March from 2025-11-15.
At roll boundaries all positions and signals are already flat.

Round stop distance upward to the tradable tick; round target distance toward
entry (no more than 1.5 times stop risk). Tick: SPY $0.01, MES/MNQ 0.25 points.
Point multiplier: SPY 1, MES $5, MNQ $2. Use adverse-gap open prices and
stop-first ordering if both stop and target occur in one bar. Session close
uses only its open, never that bar's later high/low/close.

Costs are explicitly hypothetical scenarios, not the unknown user's broker:
SPY $0.02 round-trip fees/share plus two $0.01 ticks for total execution costs;
MES/MNQ $2.50 round-trip fees/contract plus two ticks total for execution costs.
Thus cost/unit = $0.04 SPY, $5 MES, $3.50 MNQ. Convert to R using each trade's
rounded stop distance times multiplier. Re-simulate at twice all costs because
daily stopping rules depend on realized net returns. Do not retroactively
deduct costs from a fixed gross trade list. Data subscriptions, stock borrow,
financing and actual spread/slippage are not verified. The normalized R
comparison is not a same-cash-capital portfolio or an account return: no margin,
position sizing, whole-contract affordability or liquidation model is implied.

Predefined screening per market: >=40 trades total; >=12 each window; positive
net mean in every window; PF>=1.10; realized drawdown<=8R; positive net total
under doubled costs. Report every product in fixed SPY/MES/MNQ order, every
window, total and mean R, win rate, drawdown, losing streak and costs.
No optimized winner or predictive profit probability is produced. Passing
only means a research candidate; Paper Bot and Shadow always remain OFF.
Failures or missing history must be shown honestly, never filled with invented
prices, relabeled SPY bars, or synthetic results.

The private hosted snapshot is loaded by one button and recalculated in the
browser. Keep raw licensed price data out of the public Git repository.

References: CME contract specifications and Massive API documentation for
products, contracts, schedules and aggregate bars; these specify instruments
and data behavior, not evidence that the strategy is profitable.

## Availability amendment before any performance calculation

The initial candidate dates were January–June 2024. Massive documents only two
years of futures schedules, and the 2023-12-01 through 2024-06-30 schedule query
returned no records. No 2024 price history was retrieved or scored. Replace
these inaccessible dates with July–December 2025 as above, before retrieving or
scoring those prices. Contract rolls are the Monday preceding the verified
quarterly expiry: 2025-09-15 and 2025-12-15. This replaces the erroneous initial
March 2024 roll date, also before any prices or results were used.

## Verified snapshot and unchanged-rule outcome

Final snapshot: 13,440 cash-session bars including separate-contract preparation;
148 calendar sessions from June through December 2025. Each market is scored on
the same 128 sessions: 43 in July–August, 44 in September–October, 41 in
November–December. Every cash interval is covered by Massive's futures schedules.
Duplicate schedule events were deduplicated by product/date/event/timestamp.
Stock and futures timestamps, price bounds, tick grid, exact 15-minute continuity,
whole-session coverage and >=220 warmup bars per contract are checked.

The 688,525-byte private JSON has SHA-256
`68336737884c2beb1ea0323c0079441b985e834e4940b2214cad82e1ee6a6b3b`.
KV key `jeu06/market-comparison-v1.json`; endpoint `/api/lab/jeu06`; existing
`TRADING_DATASETS` binding. The endpoint reuses signed Cloudflare Access checks.
The client verifies bytes before parsing and recalculates, with no broker order.

| Product | Trades | Wins | Net R | Mean R | Realized DD R | Double-cost R |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| SPY | 57 | 25 | -5.458611893957509 | -0.09576512094662297 | 8.145683391479494 | -7.336041722904592 |
| MES | 54 | 20 | -12.163182502116108 | -0.22524412040955755 | 13.55853133932541 | -16.40761373537792 |
| MNQ | 66 | 34 | +5.230231160634859 | +0.07924592667628574 | 5.1657871943744675 | +3.3612782587739134 |

All three verdicts remain **Non confirmé**. MNQ totals +3.2744705773244993 R,
-0.6623087191243904 R and +2.6180693024347494 R by window: the negative middle
period fails the predeclared consistency gate. Its aggregate gain, including
under doubled cost assumptions, is not a sufficient validation of profitability.
No rule, date or filter was changed after observing these results.

Verification: tick and dollar-cost arithmetic; next-bar signal execution;
session exits that cannot inspect later prices; adverse gaps; stop-first bars;
daily stopping rules actually rerun at doubled costs; missing sessions and
wrong-contract rejection; integrity/login/network failures; private API checks;
and unchanged Games 04–05 regression tests. Browser visual QA was not requested.
