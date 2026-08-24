# Site architecture — Nykuto

## Current production model

Nykuto is a static multi-page website deployed through Cloudflare Pages.

Two Cloudflare Pages projects consume the same `main` branch:

- `nykuto` publishes the complete commercial site on `nykuto.com`;
- `nykuto-demo` publishes the autonomous real-estate demonstration at the root of
  `demo.nykuto.com` by copying `demo-imobiliaria.html` to `index.html` during
  its build. Its production build command is
  `cp demo-imobiliaria.html index.html`, with `/` as the output directory.

Both projects stay connected to the GitHub repository, so a production update
on `main` triggers their deployments independently.

The authoritative production sources are:

```txt
index.html                     Homepage
offres.html                    Nykuto Digital
international.html             Nykuto Business International
exemples.html                  Illustrative scenarios
demo-imobiliaria.html          Autonomous interactive real-estate demo
imoveis/index.html             Complete searchable property catalogue
mapa/index.html                Map-focused property search
favoritos/index.html           Device-local saved-property selection
anunciar/index.html            Owner and agency publishing journey
gestor/login/index.html        Private manager sign-in
gestor/index.html              Authenticated manager dashboard
gestor/imoveis/                Persistent listing management
gestor/imoveis/novo/           Guided test-draft creation
gestor/conta/                  Professional WhatsApp profile, pass and account status
functions/                     Cloudflare Pages authentication and APIs
migrations/                    D1 schema for accounts, passes, sessions and listings
process.html                   Method
a-propos.html                  Founder and company
faq.html                       FAQ
contact.html                   Mailto contact journey
mentions-legales.html          Legal notice
confidentialite.html           Privacy policy
cgv.html                       B2B terms
styles.css                     Shared design system
demo-imobiliaria.css           Real-estate demo interface styles
i18n.js                        FR/EN/PT/ES translations and language state
script.js                      Shared interactions
demo-imobiliaria.js            Static demo inventory, filters, map and dialogs
assets/                        Production images
assets/demo-imobiliaria/       Optimised, neutralised real-estate demo media
assets/nykuto-emblem.webp      Production brand emblem
assets/nykuto-emblem-favicon.png  Browser icon
imovel/*/index.html             Share pages with property-specific metadata
favicon.svg                    Legacy fallback icon
robots.txt / sitemap.xml       Search discovery
_headers                       Cloudflare response headers
scripts/prepare-cloudflare-output.js
```

## Generated outputs

`npm run build` creates three equivalent static outputs:

- `out/` — Cloudflare Pages production output;
- `dist/` — generic static output;
- `.vercel/output/static/` — compatibility output.

Never edit these folders directly.

## Inactive scaffolding

`app/`, `components/`, `data/`, Next.js configuration, Tailwind configuration and the legacy layered CSS files are currently inactive scaffolding. They remain in the repository to avoid destructive cleanup without approval. They are not used by the build.

Before a framework migration:

1. obtain user approval;
2. update `SOURCE_OF_TRUTH.md`;
3. document new build and deployment settings;
4. migrate all production pages and metadata;
5. verify parity before retiring static sources.

## Page principles

- shared header and footer across commercial pages;
- homepage limited to the brand introduction and direct links to dedicated pages;
- primary navigation uses separate HTML routes rather than reproducing full service content on the homepage;
- unique title, description and canonical URL;
- Open Graph image on public sales pages;
- no server-side contact collection in the current version;
- no invented proof or unsupported claim;
- responsive and keyboard-accessible interactions.

`demo-imobiliaria.html` is the autonomous property homepage linked from the
Nykuto commercial site and published canonically on `demo.nykuto.com`. The
subdomain opens directly on the real-estate experience: it does not reproduce
the commercial header, scenario introduction, browser mockup, sales CTA or
commercial-site footer. Main navigation uses dedicated static routes instead
of scrolling every destination inside the homepage: `/imoveis/` for the full
catalogue, `/mapa/` for map-first search, `/favoritos/` for the visitor's local
selection and `/anunciar/` for the owner/agency offer. A compact in-app footer
keeps the illustrative nature of the inventory visible without interrupting
the property journey.

The demo uses owner-supplied photos and videos of real Ciudad del Este
properties that were neutralised before publication and stripped of embedded
metadata. Property names, references, prices, availability and locations remain
illustrative. Its static inventory is displayed over a real interactive map of
Ciudad del Este powered by Leaflet and OpenStreetMap tiles. Each listing exposes
an intentionally approximate centre and a privacy radius in metres; no exact
property address is stored or displayed. OpenStreetMap attribution remains
visible in the map. The demo has no paid mapping API, live client account,
payment flow, booking flow or production property database.

The public journey prioritises the property search before any commercial
message. Property cards include an in-page media carousel, deliberate visual
privacy masks over neutralised areas, favourites stored locally and a comparison
flow. Cards and price markers are synchronised: selecting either highlights the
corresponding approximate area, while map markers open a compact property
preview before the full detail sheet. The detail sheet groups media, monthly and
entry costs, approximate distances and privacy information. Contact buttons open
the WhatsApp number verified on the listing owner's profile with a structured,
pre-filled enquiry; the site does not store or transmit the visitor's message
itself. Nykuto's own number remains the destination for platform sales and pass
renewals. A persistent WhatsApp button uses locally saved favourites as the
visitor's selection and can send either one property or a concise multi-property
request when the selected properties share a contact. Different owners remain
separate so no enquiry is sent to the wrong manager. On small screens,
filters use a bottom sheet and a fixed navigation bar provides direct access to
listings, map, favourites and the owner journey.

Each illustrative property also has a static `/imovel/<reference>/` share page
with its own Open Graph title, description and neutralised cover image. These
pages redirect human visitors to the matching detail sheet but remain readable
by link-preview crawlers. The preview is best effort: no image or video is
silently attached to the WhatsApp message, and the readable reference and URL
remain in the pre-filled text.

The owner journey remains public and illustrative, but the manager pilot is now
a real protected environment on `/gestor/`. Cloudflare Pages Functions validate
an opaque `HttpOnly`, `Secure`, `SameSite=Lax` session cookie and an active D1
access pass on every protected page and manager API request. Only the SHA-256
session-token digest is stored. The temporary pass uses a randomly generated,
high-entropy access code verified by HMAC-SHA-256 with a per-user salt and a
server-side pepper. Unsafe requests also require a same-origin CSRF token.
Credentials and the pepper are provisioned directly in Cloudflare and never
committed to Git.

The pilot D1 database stores one test manager, pass history, sessions, rate-limit
state, audit events and a management projection of the five illustrative
properties. Status and cover changes persist across devices and are exposed to
the public catalogue through a read-only, privacy-limited endpoint. Exact
addresses, private owner details, visitor messages, payments and leads are not
stored. Newly created properties remain drafts in this pilot. The guided editor
stores the complete rental offer: property type, rooms, availability, currency,
rent, guarantee, agency fee, rules, parking, included utilities and public
location notes. Its mobile media picker enforces a product limit of five photos
(10 MB per photo), shows local thumbnails and keeps demo covers secondary.
Video upload is intentionally
disabled during the no-revenue pilot. Binary persistence remains visibly
disabled until R2 is activated on the Cloudflare account; the interface never
claims that a locally selected file was uploaded.

The manager API records first publication and explicit availability verification
timestamps. A listing becomes due for review after 14 days. The public API hides
it after 30 days without a property confirmation or after 30 days without a
manager login; the row remains recoverable in D1. Logging in never changes the
property verification timestamp by itself.

The manager account page also stores the agency name and one WhatsApp contact in
normalized E.164 form. Common country codes are presented as mobile-friendly
choices and the server validates the full 8–15 digit international number. A
change invalidates the previous confirmation. The free pilot uses manual
verification: the manager sends a generated account code to Nykuto from the
same WhatsApp number, then Nykuto confirms it administratively. Publication,
reservation and availability confirmation are blocked until that verification
timestamp exists. The public API joins listings to their owner profile and
returns only verified contact routing; drafts and private account fields remain
private.

## Language architecture

- The French HTML is the content source of truth.
- `i18n.js` injects an accessible language selector into the shared header and translates text, labels, placeholders and page titles for English, Brazilian Portuguese and Spanish.
- Language state is carried through `?lang=` on internal links and stored locally in the visitor's browser.
- `script.js` reads the active language for dynamic estimator and contact-email text.
- Legal-page body copy is intentionally excluded from client-side translation; a localized notice identifies French as the authoritative legal version.

## Validation

```bash
npm run build
npm run hygiene
npm run functions:check
```

Before merging, inspect the production output, verify internal links, confirm legal publisher data and wait for user approval.
