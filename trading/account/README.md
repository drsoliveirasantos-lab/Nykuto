# Trading HQ tester accounts

This is the existing external Cloudflare Pages project, not a native Sites migration.
Authentication remains Cloudflare Access email one-time PIN. The only approved
emails are provisioned privately in Access and `TRADING_USERS`; never put them,
actual profiles, broker credentials or webhook tokens in this public repository.

## Server boundaries

- `functions/_middleware.js` verifies the Access signature and active D1 membership
  on every route. Incomplete first/last names route to `/account/`; other APIs fail
  with 428. Missing bindings and failures fail closed. Protected HTML is no-store.
- `/api/account` returns only the verified caller; PUT accepts only first/last name.
- `/api/account/state` reads/writes only the caller's keys. Writes use bounded JSON,
  allowed keys, same Origin, custom action and expected caller ID. SQL revisions
  reject stale writes rather than overwriting another tab/device's data.
- `/api/account/feedback` lets a tester see only their reports and the owner's
  responses. Owner can see all reports, respond and update status. Owner cannot
  obtain a tester's personal journal through the state API. Feedback retries use
  the original opaque ID; plaintext content is rendered with textContent.
- `/api/alerts` uses a per-tester KV prefix. The existing owner prefix and webhook
  continue unchanged. The independent receiver also checks active D1 membership
  before a personal delivery. See the alerts README for provisioned token routes.
- The membership role and email cannot be changed through any public API.
- No paid subscriptions, messages to invitees, broker orders or trading activation.

`account/session.js` loads state into memory before the existing apps initialize.
Acknowledged writes update memory; failures retain forms and display a recovery
message. Same-document functional updates serialize appends; revisions protect
against other documents/devices. A user switching account cannot save from a stale
tab into the newly signed-in user's account. Refresh shows another device's saves;
there is no background merge or offline-write queue. Pending writes warn before
leaving the document. No personal data is newly stored in localStorage.

Only the original owner sees the legacy browser import. It copies only absent
keys and preserves both existing online records and the original local values.
Users should use their own browser profiles on shared computers: the old local
copy may still exist on the owner's original device. Old entries are not assigned
to invitees. Broker preferences are labels only, explicitly non-connected; the
TradingView connection is receipt of personally configured alerts, not OAuth,
saved chart synchronization or a route to a trading account.

## Rollout / operations

1. Create dedicated D1 `nykuto-trading-users`, apply the schema-only
   `trading/migrations/0001_trading_accounts.sql` once through Cloudflare API.
2. Insert the existing owner and exactly the requested testers, UUID identities,
   `active=1`, blank names, roles owner/tester. Keep records outside Git.
3. Bind D1 as `TRADING_USERS` to production Pages and the isolated alert Worker.
   Retain existing KV and Worker secret bindings. Previews remain unbound/closed.
4. Provision each tester's random 256-bit webhook token, store only its hash in
   `routes/<sha256>` with userId and the full URL in their private config key.
5. Run account/alert isolation regressions, existing trading tests, build and
   hygiene. Upload the exact Worker modules and publish Trading HQ branch.
6. Verify publication then add only the two requested email rules to Access,
   preserving the original owner policy. Use the existing email-PIN provider.
7. Re-read memberships, bindings, Access policies and deployment status. Account
   names remain blank until each person completes their own onboarding.

Revocation: set `active=0` in D1 and remove their exact Access email rule.
The app and personal receiver then fail closed even before old Access JWT expiry.
Never delete records or expose actual membership values through public docs.

## Verification

`npm run test:trading-validation` uses an in-memory SQLite adapter over the real
migration and production SQL. Tests exercise signed identities, missing/revoked
membership, onboarding, cross-user state/feedback/alerts, role escalation,
forged/mismatched headers, CSRF, stale writes, body limits and failed saves.
A real email PIN and actual TradingView delivery must be completed by each user;
local fixtures are not represented as proof of those external delivery flows.
