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
  `nykuto-local.js` for the autonomous local portal;
- `anunciar/index.html` and `anunciar/anunciar.js` for autonomous listing and
  request publication;
- `anuncio/` for the public listing page and direct author contact;
- `conta/` for the lightweight online publisher profile and listing controls;
- `regras/` for community, safety and external-import rules;
- `assets/`, `favicon.svg`, `robots.txt`, `sitemap.xml` and `_headers`;
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
separate `LOCAL_DB` D1 database. The public `Anunciar` wizard publishes directly
after server validation and Turnstile. It may collect category, subtype, title,
description, price or contribution, condition, costs, logistics, an address
reference, seller name, optional email, seller WhatsApp and up to five images.
Images are re-encoded in the browser to remove embedded metadata and limited to
300 KB each. Until account-level R2 is enabled, the pilot may use the explicit
D1 media fallback with a 1.25 MB total per publication; `LOCAL_MEDIA` becomes
the preferred private storage binding as soon as R2 is available.

The publisher profile is a real, passwordless, cookie-backed session on the
current device. It lets the author update contact data, pause, republish, mark
complete or delete publications. Google and Facebook sign-in must not be shown
as active until the owner's OAuth applications and recovery flow are configured.
The public WhatsApp number is user-supplied and must be described as unverified
until an OTP or WhatsApp Business verification mechanism exists.

`Preciso de…` opens the same autonomous wizard with `listing_kind=request`; it
never sends a request to Nykuto's WhatsApp. External listings are never scraped
or copied automatically. A publisher may provide a source URL only after
confirming that they are the author or have express permission to reuse the text
and images. The public page keeps a safe original-source link.

`Carona compartilhada` supports offers and requests, recurring or occasional
routes, an approximate departure zone, destination, time, days, seats and a cost
contribution. It is sharing a journey and expenses, not a guaranteed transport
service. Users remain responsible for licences, insurance, safety and local
rules. Foz-related copy must also remind users that fiscal, customs and
transport rules remain their responsibility.

Address lookup is an explicit, user-triggered convenience for the CDE–Foz pilot,
not autocomplete. It may query the public OpenStreetMap Nominatim endpoint only
with visible attribution, an in-memory result cache, a maximum rate of one
request per second and a bounded regional query. The interface must disclose
that the entered search is sent to this third-party service and must retain a
manual map-placement fallback. The exact typed address is not persisted. Only a
public label and coordinates rounded by the server to roughly one kilometre are
stored, then rendered as an approximate 5 km zone. Shared-ride destination
lookup and route drawing are also explicit and approximate.

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
