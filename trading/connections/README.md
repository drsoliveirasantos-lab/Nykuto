# Connections gallery and bot validation guide

`/connections/` is the private environment-selection page, reachable from the
common menu and the existing account form. It has a compact responsive card grid,
text search, category filter, radio selection, custom names and explicit save.
The cards use text initials, not copied broker logos, ratings or endorsements.

## Preference contract

The gallery reuses the existing `connections` state and membership/revision
checks. The legacy `broker` string now represents the chosen broker, platform,
prop firm or simulator label; it is **not** a linked-account identifier. There is
no schema migration. `mode` remains `paper` or `manual` and grants no execution
capability. A new choice preserves `tradingViewName` at the queued write.
Unknown existing names reopen under Other and are not overwritten by loading or
filtering. Filters never change a saved or selected preference. Account-local
memory is the only client cache; there is no localStorage preference fallback.

The UI confirms success only after the existing state API acknowledges the write.
A failed/conflicting save retains the last acknowledged value and exposes the
error. Buttons are disabled while saving. No credentials, `connected` flags or
account identifiers are added. No account record, journal, alert inbox or licensed
dataset is written by publishing this page.

## Actual capabilities

- Native Replay: manual historical practice.
- TradingView Paper Trading: external manual simulator, not a Nykuto bot adapter.
- TradingView alerts: existing private receiver and setup guide. A real incoming
  TradingView event, not the internal inbox test, confirms delivery.
- Lucid Trading: prop firm information and preference only; CQG vs Rithmic and
  supported platforms explained with official sources.
- Tradovate, NinjaTrader and IBKR: preference only. No broker authentication,
  live quote feed, historical trade import, position sync or order API.

## Bot validation

The page links the current Jeu 10 verdict to `lab/CONFLUENCE_DIAGNOSTIC.md` and
the fixed prospective period/criteria in `lab/PROSPECTIVE_COLLECTION.md`.
Backtest, unseen-period forward testing and automated paper execution are distinct.
It does not lower any research threshold, certify returns, change the engine or
activate Paper Bot/Shadow. The existing MNQ collection and test tasks are untouched.
The prospective collection is after-session archiving, not a real-time bot test.

Official documentation consulted 2026-09-09:

- https://support.lucidtrading.com/en/articles/11404614-lucid-trading-supported-platforms
- https://support.lucidtrading.com/en/articles/11404728-other-trading-activities
- https://www.tradingview.com/support/solutions/43000516466-paper-trading-main-functionality/
- https://www.tradingview.com/support/solutions/43000471705-how-to-purchase-additional-market-data/

## Verification boundaries

Tests cover filtering, preservation of existing/custom preferences, invalid
selection/mode rejection, queued update preservation, acknowledged-save failures,
per-member isolation, credential rejection and stale-write protection. The
connections route is covered by the shared authenticated middleware test.
No real member save, broker login, order, external TradingView delivery or browser
visual test is performed for this change. Publication requires the exact commit's
Website CI, Repository hygiene and production Cloudflare deployment to succeed.

Local validation for this delivery: 82 trading tests passed, root build passed,
repository hygiene had zero findings, 25 Pages Functions validated, and changed
JavaScript syntax plus local page references/explicit control IDs checked.
