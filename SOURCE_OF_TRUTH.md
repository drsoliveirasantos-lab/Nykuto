# Source of truth — Nykuto

This file defines what contributors and AI assistants must treat as authoritative in this repository.

## Project identity

Nykuto is a French professional-services brand with two coordinated business lines:

1. **Nykuto Digital** — simple, clear and responsive showcase websites.
2. **Nykuto Business International** — administrative organization, diagnostics and project coordination between France, Europe and Latin America.

The umbrella message is:

> Le digital et l’international, réunis pour faire avancer votre entreprise.

`Nykuto Local` is a progressive audience-acquisition pilot for Ciudad del Este
and Foz do Iguaçu. It is a free local publication and discovery platform, not a
payment, booking or transaction intermediary. People publish products,
properties, freight, local services, permitted Foz requests and shared rides;
interested visitors contact the author directly on that author's WhatsApp. The
existing illustrative property catalogue remains available for demos.

## Positioning rules

Nykuto is a consultancy and coordination business. It is not a bank, payment institution, acquirer, law firm or accounting firm.

When payment projects are discussed, Nykuto may:

- qualify business needs and flows;
- compare possible payment journeys;
- help prepare KYC/KYB information;
- coordinate onboarding with a regulated provider.

Nykuto must never claim to:

- hold or transmit funds for third parties;
- capture or store card data;
- guarantee merchant account acceptance, a virtual terminal, MOTO capability or payment limits;
- provide regulated legal, tax, accounting, banking or payment services.

## Branches

- `main` is the production branch.
- Use a short working branch for every meaningful change.
- Open a pull request before merging into `main`.
- Do not merge unless checks are green and the user validates the merge.

## Editable production sources

The current production source of truth is the static root site:

- root HTML pages;
- `styles.css`, `i18n.js` and `script.js`;
- `demo-imobiliaria.html`, `demo-imobiliaria.css`, `demo-imobiliaria.js` and
  `demo-build-stamp.js` and `nykuto-local.js` for the autonomous local portal;
- `anunciar/index.html`, `anunciar/anunciar.js` and
  `anunciar/openfreemap-basemap.js` for autonomous listing and request
  publication;
- `anuncio/` for the public listing page and direct author contact;
- `conta/` for the lightweight online publisher profile and listing controls;
- `regras/` for community, safety and external-import rules;
- `assets/`, `favicon.svg`, `robots.txt`, `sitemap.xml` and `_headers`;
- `ellen-studio/`, an isolated Portuguese multipage beauty preview with its own assets and navigation;
- `trading/`, the private Trading HQ published separately from its validation
  branch; its lab protocol and data boundaries are documented in
  `trading/lab/INDEPENDENT_VALIDATION.md`;
- `workers/trading-alerts/`, the isolated TradingView webhook receiver; private
  inbox, shared validation and deployment details live in `trading/alerts/`;
- `scripts/prepare-cloudflare-output.js`;
- `gestor/` for the private real-estate manager pilot interface;
- `functions/` for Cloudflare Pages authentication, manager and local APIs;
- `migrations/` for the manager and local D1 schemas;
- documentation in `docs/`;
- repository workflows and instructions in `.github/`.

`out/`, `dist/` and `.vercel/output/static/` are generated outputs and must never be edited directly.

The existing `app/`, `components/` and `data/` folders and the old layered CSS files are inactive scaffolding. They are not included in the production build. A future migration or cleanup must update this file and `docs/site-architecture.md` before those sources become authoritative or are removed.

## Commercial scope

Allowed digital positioning:

- one-page or small multi-page showcase websites;
- clear service presentation and contact paths;
- responsive design and basic technical SEO structure;
- simple external integrations such as Calendly or Tally when scoped.

Allowed international positioning:

- diagnostic and action plan;
- administrative organization;
- cross-border project coordination;
- research and comparison of service providers;
- remote or on-site training and transmission;
- coordination with regulated specialists.

Do not promise guaranteed SEO rankings, complex custom platforms, merchant acceptance or outcomes controlled by third parties.

## Trust rules

- No invented client, partner, certification, testimonial or performance figure.
- Illustrative cases must be labelled as scenarios or concepts.
- Confidentiality claims must match actual practice.
- Legal pages must contain confirmed publisher information before production publication.
- Sensitive personal information must not be committed to a public repository without explicit owner confirmation.

The real-estate manager pilot stores no plaintext credential in Git. Account
credentials, access periods and sessions are provisioned directly in Cloudflare;
protected routes must enforce both the session and the active pass on the server.
Listing drafts store structured rental details in D1. Manager media is limited
to five photos per property; video upload is disabled. Files must not be
presented as persisted until the R2 bucket and binding are active.

Public availability freshness is property-specific. A manager login is recorded
but never silently verifies every listing. Published and reserved properties
must be explicitly confirmed at least every 30 days or they are hidden from the
public API without being deleted. The manager starts seeing them as needing
review after 14 days.

Each manager profile owns one professional WhatsApp number stored in normalized
international E.164 form. Drafts may exist without a confirmed contact, but a
listing cannot be published, reserved or availability-verified until that
number has been manually confirmed. Changing the number removes the previous
confirmation. Public property enquiries use the verified number of the listing
owner; Nykuto's own business number remains reserved for sales, pass renewal,
manual profile confirmation and manager support. Every non-property enquiry
must route directly to the publishing user's WhatsApp, labelled as unverified
until an OTP mechanism exists, instead of making Nykuto an undisclosed
transaction intermediary.

The Nykuto Local catalogue reads genuine public offers and requests from the
separate `LOCAL_DB` D1 database. Except for shared rides, public `Anunciar` is a
direct single-page form: category and subtype, title, optional description,
price or contribution, up to two images, an approximate public zone and the
author’s name and WhatsApp. Category-specific operational values that are not
part of this essential form use neutral public defaults such as `A combinar` or
`Sob consulta`; the interface must not infer a product's state, a vehicle type
or an availability claim. Category, subtype and these operational values remain
search metadata; the public detail does not repeat them as cards and instead
prioritizes photos, title, price, description, approximate zone, seller and the
direct WhatsApp action. Publication remains direct after server validation
and Turnstile. Images are re-encoded in the browser to
remove embedded metadata and targeted to two JPEG files of 180 KB each. The
picker accepts gallery images up to 100 MB, including HEIC, HEIF and DNG when
the user's browser can decode them; every accepted source is converted to JPEG
at no more than 960 px on its longest side before publication. The server keeps a
300 KB ceiling per converted image. Until account-level R2 is enabled, the
pilot may use the explicit D1 media fallback with a 600 KB total per
publication; `LOCAL_MEDIA` becomes
the preferred private storage binding as soon as R2 is available.

The homepage uses eight concise discovery entries. `Eletrônicos` groups the
legacy phone and electronics sections, and `Serviços` groups the freight and
local-service entrances. Their canonical category, subtype and market-section
values remain distinct for validation, specialized publication fields and
backward compatibility; this is a presentation grouping, not a D1 migration.

The publisher profile is a real, passwordless, cookie-backed session on the
current device. It lets the author update contact data, pause, republish, mark
complete or delete publications. Google and Facebook sign-in must not be shown
as active until the owner's OAuth applications and recovery flow are configured.
The public WhatsApp number is user-supplied and must be described as unverified
until an OTP or WhatsApp Business verification mechanism exists.

`Preciso de…` opens the same direct single-page form with
`listing_kind=request`; it never sends a request to Nykuto's WhatsApp. External
listings are never scraped
or copied automatically. The direct form does not expose source-link
republication. Any future managed import must require the author or rights
holder's express permission and keep a safe original-source link.

`Carona compartilhada` has a dedicated route-first journey while reusing the
same listing model. The public catalogue can search approximate origin,
destination and date, and it separates available rides from ride requests.
Publication is intentionally limited to three screens: offer or request, route
and schedule, then WhatsApp contact and confirmation. Recurring and occasional
trips are supported with an approximate departure zone, destination, time,
seats and an optional per-person contribution. The only hand-off is a prefilled
WhatsApp conversation; Nykuto does not book a seat, confirm a passenger or
process payment. It is sharing a journey and expenses, not a guaranteed
transport service.

Address lookup is an explicit, user-triggered convenience for the CDE–Foz pilot,
not autocomplete. It may query the public OpenStreetMap Nominatim endpoint only
with visible attribution, an in-memory result cache, a maximum rate of one
request per second and a bounded regional query. Current-device location may be
requested only after an explicit click: the browser must show its permission
prompt, and refusal must keep address search and manual map placement available.
After permission, Nominatim reverse geocoding may propose a readable address for
the selected point. The interface must disclose that the entered search or
selected coordinates are sent to this third-party service. Neither the complete
typed nor reverse-geocoded address is persisted or published. The author chooses
the public precision: about 50 m, 200 m, 500 m, 1 km, 2 km, 3 km or 5 km.
Persisted public coordinates are rounded to four decimals so the selected
circle is technically coherent; choosing 50 or 200 m must carry a visible
warning to use a safe public point rather than a private home.
Within the established Ciudad del Este PY02 corridor, the rounded public centre
also produces a coarse local orientation such as `Km 8 · lado Monday (aprox.)`.
This follows the city's local bridge-to-west convention, not national PY02
chainage. It is omitted for Foz, the microcentre and places outside the calibrated
corridor, and it never requires or reveals the typed address.
The homepage may filter the already-public catalogue by an explicit `Km N`
query using this derived coarse reference, including legacy rows at read time.

Shared-ride publication requires an approximate departure point, destination
and departure time. After the author confirms both points through lookup, a
frequent-place selector or direct map placement, the publisher requests an
approximate road route. The validated destination coordinates are stored with
the listing so the public
detail can render the suggested route without repeating address lookup. The
route is a planning aid for arranging a safe pickup along the way through
WhatsApp, not a guaranteed itinerary or booking mechanism.
Because street addresses are often difficult to identify locally, the route
screen keeps a compact map visible and lets the author mark either departure or
destination directly. Frequent UCP destinations may be offered in a compact
selector; selecting one must remain adjustable on the map before publication.

## Languages

- French is the editorial source of truth in the production HTML files.
- `i18n.js` provides the English, Brazilian Portuguese and Spanish interface and commercial-page translations.
- The selected language is preserved in the URL and local browser storage so navigation remains consistent across pages.
- Legal documents remain officially published in French. In another interface language, the site must display a clear notice that the French text is authoritative rather than presenting an unofficial translation as legally binding.

## Publication blockers and fiscal wording

- The recommended current VAT treatment is the French *franchise en base de TVA*, subject to confirmation from the competent SIE that no voluntary VAT option is active.
- Do not publish a definitive VAT status until that confirmation is obtained. Quotes and invoices must use the wording appropriate to the client's status and location; international B2B services must not automatically reuse the domestic franchise wording.
- The owner explicitly approved publication of the professional address `23 Mail des Bordelais, 33300 Bordeaux, France` and telephone number `+33 7 68 34 56 08` on 31 July 2026. Do not expand the address with an apartment number or reuse any other personal coordinate without a new explicit confirmation.
- A city, district or postcode alone is not an acceptable substitute for the full address in production legal notices.

## Documentation and validation

- `docs/brand.md` — visual and verbal identity.
- `docs/offers.md` — service lines, prices and boundaries.
- `docs/content-strategy.md` — audiences, messages and conversion logic.
- `docs/site-architecture.md` — active source and deployment structure.

Run before proposing a merge:

```bash
npm run build
npm run hygiene
```

## Shared typography standard

[Typography hierarchy](docs/typography-standard.md) is the required visual
instruction for new and updated interfaces, including sites created from this
repository. It defines role-based sizes, readable learning content and the
instruction handoff to future repositories. Adding the instruction does not
itself change the existing runtime styles.


Game 26 introduces a separately frozen closed-failure entry after public
video/transcript and community research. `jeu26-signals.mjs` requires a closed
opening-range breakout and a first directional close back inside within 30
minutes; `jeu26-terms.mjs` anchors the stop to the whole excursion and bounds
the target at the opposite range edge. One microcontract, fixed150/daily300,
the Game23 execution/account protections, source gaps and qualification gates
are retained. All four configurations fail; reserve stays closed and the
research ledger then retained 57 configurations. `lab-failed-breakout.mjs`
provides its checksum-pinned archived Lab panel; Game25 and all prior HTML IDs remain in
expandable history. Private data and trades: `jeu26/failed-breakout-v1/manifest.json`.
See `trading/lab/JEU26_PROTOCOL.md`, `JEU26_RESULTS.md`, `JEU26_ARCHIVE.md`.
Public Discord-community archives are distinguished from inaccessible private
Discord channels. No live, Paper or Shadow execution is enabled. Historical
PR83 body is preserved in `docs/trading-pr83-history-through-game25.md` to
allow a concise current PR description within GitHub's length limit.

The exploratory manual Lab uses `trading/lab/manual-backtest.mjs`, loaded by
`lab.js`. Its September 9 execution correction handles adverse opening gaps,
isolates development/validation positions and brakes, and resets loss counters
every UTC day. This is separate from all frozen research engines and does not
change their results, selections or the research ledger. See
`trading/lab/MANUAL_BACKTEST.md`; regression tests run in the existing npm suite.


Game 27 isolates one fresh same-side reentry through `jeu27-engine.mjs` and
`jeu27-policy.mjs`, using the unchanged Game 23 signal generator and fixed150
execution policy. The new breakout candle must open at or after the previous
same-side exit candle closes; at most two trades total per day, one position
and one microcontract. Rules, 30 dependencies and eight synthetic tests were
frozen and committed before performance. All four configurations fail; MNQ
grows from 36 to 42 trades but falls from +887.50 to +456.50 USD net.
`lab-fresh-reentry.mjs` is its archived checksum-pinned panel, showing both costs,
archived equal-risk comparisons, the impact of repeated entries and observed
daily activity. The new panel uses scoped typography roles with 14px body,
16px expandable titles, 20px section title and 12px brief metadata.
Game 26 and every earlier HTML ID remain in expandable history. The ledger
retains 61 configurations; reserve May–August stays unscored, with no independent
confirmation or live/Paper/Shadow activation. Private executions are archived at
`jeu27/fresh-reentry-v1/manifest.json`. See `trading/lab/JEU27_PROTOCOL.md`,
`JEU27_RESULTS.md` and `JEU27_ARCHIVE.md`.


Game 28 isolates a one-time stop move after a surviving five-minute bar closes
at +1 original price-risk. `jeu28-protection.mjs` schedules the fee-covered,
tick-aligned stop for the next bar; `jeu28-engine.mjs` retains Game 23 entries,
initial risk, targets and account rules. `jeu28-comparison.mjs` pairs identical
entries to distinguish avoided losses from cut gains. No Game 27 reentries
are combined with this hypothesis. Thirty-two dependencies were frozen before
performance. MNQ gains 44 USD from one changed exit, to +931.50 USD on 36 trades,
while MES/MGC deteriorate and MYM remains negative. All four fail qualification.
`lab-break-even.mjs` is its archived checksum-pinned Lab panel, with both costs,
matched effects, daily activity and explicit small-sample limits. Game 27 and
earlier HTML IDs remain archived; the new panel reuses the scoped 14px body,
16px expandable-title, 20px section-title and 12px metadata roles. The research
ledger preserves all 61 previous trials and adds four, for 65. Private details
are stored at `jeu28/closed-breakeven-v1/manifest.json`. See
`trading/lab/JEU28_PROTOCOL.md`, `JEU28_RESULTS.md` and `JEU28_ARCHIVE.md`.
Reserve May–August remains unscored; no independent confirmation, collection
change or live/Paper/Shadow activation.


The market-profile section at `#marketProfiles` was introduced with four
independent research focuses from existing equal-risk Game 23/26/27/28 reports. MNQ/MYM initially
inspect Game 28 protection, MES Game 23 baseline, and MGC Game 26 closed failure.
`market-profile-registry.mjs` verifies all source report hashes, creates immutable
views and never authorizes execution; all execution strategy IDs remain null.
`lab-market-profiles.mjs` provides per-market menus, both costs, criteria and
partial-failure recovery without silent fallback. Choices are page-local, with
no changes to existing account preferences. The latest Game 28 panel and all
previous HTML IDs remain in expandable history. That profile-only step calculated
no new historical performance and left the ledger at 65 trials.
`account-risk-supervisor.mjs` computes contract-specific planned risk against
one shared 150/300 USD research budget and 100 USD floor reserve. It allows
at most one position or pending proposal and two daily entries, including
reservations, with common loss brakes, account/session checks and revision
checks. It is an in-memory research preflight, not an atomic server broker lock;
future execution requires authoritative fresh state, durable coordination and
fill/cancellation reconciliation. Every outcome keeps executionAllowed false.
The Lab's clearly fictitious risk examples exercise this same module.
See `trading/lab/MARKET_PROFILES.md` and the two market-profile test files.
No frozen engine, raw history, collection, workflow or secret changes;
Paper/Shadow/broker/live execution stay disabled.


Game 29 is the current Lab panel at `#portfolioGame`, above the independent
market-profile menus. `jeu29-engine.mjs` regenerates the frozen Game 23/26
signals and uses Game 28 protection only for MNQ/MYM, with one shared position,
two daily entries and the existing 150/300 USD budgets. Simultaneous candidates
use a fixed alphabetical tie-break; a position occupies its whole exit bar.
All four tapes must be synchronized and each scored session complete on every
market. Missing sessions are excluded from the entire diagnostic and disclosed,
never filled with zero or represented as a complete account evaluation.
The single portfolio configuration returns +492.75 USD on 100 normal-cost
trades, but March–April loses 190 USD and realized drawdown reaches 13.05R.
Five criteria fail, no executable selection, no reserve evaluation and no
independent confirmation. Thirty-seven dependencies were frozen in a local
commit before performance; all earlier frozen files and 65 ledger entries are
preserved, with one joint trial added for 66. `lab-portfolio.mjs` verifies the
aggregate report before displaying both costs, market contributions, daily
activity, windows and rejection reasons; failure hides old figures and retry
retains the cost choice. `JEU29_PROTOCOL.md`, `JEU29_RESULTS.md` and
`JEU29_ARCHIVE.md` document the method and private archive. No account, order,
Paper/Shadow, source collection, workflow or secret change.
