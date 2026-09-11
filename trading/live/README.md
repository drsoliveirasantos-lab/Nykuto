# Lucid feed preparation — read-only reception V1

## Delivered boundary

`/live/` and `/api/market` prepare the Nykuto side of a future personal
Lucid / Rithmic / Quantower connection. They do NOT log in to Lucid, certify
Rithmic entitlement, select a strategy, run Paper/Shadow, or send orders.
The account remains completely outside the order path. No research protocol,
ledger, candidate, historical archive or prospective task is changed.

The root source-of-truth already declares `trading/` and `trading/functions/`
as the private site's active sources. This directory adds the reception layer
within that scope; it does not change the commercial build or production main.
The common navigation links to Flux Lucid. Website CI also runs the dedicated
read-only reception tests without removing any existing check.

## Before purchase or connection

Lucid lists Quantower among supported Rithmic platforms. This is not an automatic
grant to use a custom data exporter, to redistribute data, or to use a raw Rithmic
API. Confirm the selected account, fees, data entitlement, Quantower/Algo license
and permission for personal export to the authenticated Nykuto server with the
providers. Do not buy a challenge solely on a claim that this path is already
certified. No third-party login or end-to-end Lucid test has been performed.

Quantower requires a Windows computer. The supplied C# is SOURCE CODE to build
in the Strategy project template matching the installed Quantower SDK. It is
not a compiled or certified plugin. Compilation and operation on the actual
Windows/Quantower version remain acceptance gates. An iPhone displays the site;
it does not run Quantower. Do not place the exporter on a cloud server without
first checking the applicable platform/data/prop-firm conditions.

## Architecture and security

    Lucid entitlement -> Rithmic in Quantower -> local closed-minute JSONL
      -> authenticated local Node relay -> /api/market -> private D1 buffer
      -> read-only status / UTC aggregation preview

There is no endpoint that accepts orders or turns on a bot. The source exporter
has no Account input or order code and makes no network request. The Node relay
has exactly one HTTPS destination, refuses redirects and logs no tokens/prices.
The site has no broker-password form and no raw Rithmic SDK integration.

The API imports the existing signed Cloudflare Access / active-member guard.
Only the owner may use it. POST also requires the unchanged same-origin,
X-Nykuto-Action and X-Nykuto-User mutation checks. No Access bypass, service-token
exception, new public Worker, migration or new Cloudflare binding is introduced.
Authentication failures and storage errors fail closed. A test probe checks the
existing storage without saving a synthetic bar or claiming provider connection.

D1 uses the existing `TRADING_USERS` binding and `trading_state` table, with
reserved keys `nykuto-market-reception-v1:MNQ` (and MES/MYM/MGC), always scoped by
the signed owner's user id. These keys are not member-editable settings through
the general state write API. Only the last 120 one-minute bars per market are
retained: this is a bounded reception buffer, NOT a research archive, price tick
store or paper ledger. The existing account-state reader remains private to the
same user; it may include these own-user internal rows. Licensed data never goes
in Git or into another member's feed. No existing journal or archive is erased.

## Installation after access and rights are confirmed

1. Connect the real dated contract in Quantower. Compile `NykutoBarExporter.cs`
   in the current Quantower Algo Strategy template; install/use the matching
   System.Text.Json reference if required by that SDK template. Review all SDK
   warnings. There is deliberately no precompiled binary in the repository.
2. Set Root (MNQ/MES/MYM/MGC), select the actual native contract and set its
   canonical expiry, for example `MNQ-202609`. This is a data identifier, not an
   order ticker. Manually verify that the selected native symbol has that expiry.
   Confirm export rights before checking PermissionConfirmed.
3. Run the exporter. It creates `%LOCALAPPDATA%\Nykuto\feed\MNQ.jsonl` for MNQ.
   It ignores initial history and the partial startup minute. NewHistoryItem
   reads index 1 (closed Last-price bar), never the forming index 0. It skips
   stale (>2 minutes) source events rather than making historical data live.
4. Install Node.js 22 and cloudflared on the same computer. Open `/live/` while
   signed into the owner's Nykuto account and run the API probe. Copy the Nykuto
   user id displayed there, not a Lucid account id. Authenticate with the same
   approved identity from PowerShell:

```powershell
cloudflared access login https://trading.nykuto.com
cloudflared access token --app=https://trading.nykuto.com | Out-File -Encoding ascii "$env:LOCALAPPDATA\Nykuto\access.jwt"
$env:NYKUTO_ACCESS_TOKEN_FILE = "$env:LOCALAPPDATA\Nykuto\access.jwt"
node .\relay.mjs "$env:LOCALAPPDATA\Nykuto\feed\MNQ.jsonl" "YOUR_NYKUTO_USER_ID"
```

The Access token grants access to your private Nykuto application. Keep its file
private on your own computer, outside Git, and never paste it into chat, logs or
the website. The relay reads the token file for each new bar. Session expiry or
an Access redirect stops the relay; log in again and restart. Do not disable
Access/security settings to force this workflow through an incompatible policy.

The relay starts at the current end of the file: it sends only new complete
lines, not old backlog. Start it while the exporter waits for the next full
minute. Run one exporter and one relay per root. Connection/HTTP retry is bounded;
after a terminal error, resume explicitly. There is no unbounded retry loop and
no automatic historic recovery. Missing intervals remain visible. After
restarting, inspect/compare the gap rather than assuming continuous coverage.
File truncation and a 25 MiB local ceiling stop the relay; archive locally before
starting a new file, never put licensed data in the repository.

## API contract

GET `/api/market`: actual storage availability, per-market latest bar,
market-time age, last reception, accepted/retained counts, discontinuities,
rollovers, and counts of complete 1/5/15/60-minute groups.

POST `/api/market` with `{ "action": "probe" }`: authenticated transport/storage
check only. Always returns `providerConnected:false`, `wroteMarketData:false`.

POST `/api/market` with `{ "action": "bar", "bar": ... }`: exactly one bar with
exact fields `schema`, `source`, `root`, `contract`, `providerSymbol`, `startMs`,
`endMs`, `open`, `high`, `low`, `close`, `volume`. Schema = 1; source is the
DECLARED `quantower-rithmic`; root is allowlisted; contract format ROOT-YYYYMM;
UTC epoch times are milliseconds. Start is minute-aligned, end = start+60000,
and end must be past and no older than ten minutes on the server's clock.
Provider symbol must start with root and must not be a continuous `!` symbol.
OHLC must be finite, positive, consistent, and on the root's native tick grid.
Volume must be a nonnegative bounded integer for that candle, not session volume.
Bodies above 4096 bytes, extra fields (including credentials), and all
order/reset/activation actions are rejected.

Per-root writes use SQLite/D1 revision compare-and-swap, with bounded retries.
Identical retries do not increase counts or refresh freshness; conflicting
revisions, rewinds and reverse rollovers are rejected. No missing minute is
interpolated. Aggregations require contiguous, complete UTC-aligned groups with
the same contract AND native symbol. These are reception previews, not replacements
for the frozen cash-session alignment used by existing research engines.

`recent` means a closed bar whose end is at most two minutes old. It does not
mean tick streaming, a fresh bid/ask, verified exchange entitlement or a validated
execution price. `stale` does not distinguish a network problem from a scheduled
market closure. The source, contract mapping, provider timestamps, accuracy,
permissions and subscriptions must still be checked against the actual platform.
`sourceVerified`, `paperEnabled`, `shadowEnabled`, `ordersEnabled` remain false.

## Future paper gate — not delivered or enabled here

A live-paper execution service still needs independently admissible frozen
strategy selection, strategy-session warmup, restart-safe virtual positions and
fills, costs/slippage, server-side scheduling, session/calendar gates, stale-feed
halts, risk limits, audit storage and prospective observation. Minute OHLC alone
cannot reconstruct bid/ask, intrabar ordering or order-book fills. Reception must
not be confused with a completed or profitable paper bot.

## Validation

`node --test scripts/test-trading-live.mjs`: 42 focused tests passed locally on
9 September 2026. All numeric fixtures are synthetic. Tests cover strict schema,
four tick grids, time/expiry limits, OHLC/volume, duplicates, conflicts, gap and
rollover preservation, retention, aggregate completeness, freshness, real SQLite
persistence and concurrent CAS, owner isolation, mocked transport access guards,
no-write probes, relay redirects/retries/acknowledgements, and the disabled UI.
The existing cryptographic member/middleware tests remain authoritative; the new
transport fixture does not pretend to retest Cloudflare's signing infrastructure.

JavaScript syntax checks passed. The C# SDK is not installed in the development
container: source/API review and static no-order checks are NOT compilation or
Windows/Quantower runtime tests. No Lucid access, market message, account/order,
Paper/Shadow activation, purchase, task change or main merge was performed.
Full-repository CI and Cloudflare publication status must be checked for the
exact published commit, separately from these focused local tests.

## Official references consulted 2026-09-09

- https://support.lucidtrading.com/en/articles/11404614-lucid-trading-supported-platforms
- https://help.quantower.com/quantower/getting-started/installation
- https://help.quantower.com/quantower/quantower-algo/simple-strategy
- https://help.quantower.com/quantower/quantower-algo/downloading-history
- https://api.quantower.com/docs/TradingPlatform.BusinessLayer.HistoricalData.html
- https://api.quantower.com/docs/TradingPlatform.BusinessLayer.HistoryItemBar.html
- https://api.quantower.com/docs/TradingPlatform.BusinessLayer.Symbol.html
- https://developers.cloudflare.com/cloudflare-one/access-controls/authenticate-agents/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/
