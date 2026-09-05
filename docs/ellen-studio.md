# Ellen Studio — public visual preview

## Scope and approved direction

A standalone Portuguese-language beauty showcase at `/ellen-studio/`, developed on
`feature/ellen-studio`. The user approved the name **Ellen Studio** and requested a
very feminine, sophisticated identity with fine contrasting typography.

This first version remains a **visual preview**, not an operational salon website or
a SaaS release. Diego approved publication of this protected preview to `main` on
5 September 2026; the noindex state remains required until the real business
information and launch are confirmed.

## Authoritative sources and integration

- `ellen-studio/index.html`: public presentation, suggested service menu and contact state.
- `ellen-studio/ellen-studio.css`: fully separate ivory, powder-rose and deep-brown visual identity.
- `ellen-studio/ellen-studio.js`: mobile navigation and progressive service-category filters.
- `ellen-studio/editorial-beauty.webp`: optimized, AI-generated editorial brand image.
- `ellen-studio/emblem.svg`: original text-based favicon; not a photograph.
- `scripts/test-ellen-studio.mjs`: dependency-free source-contract checks.
- `scripts/prepare-cloudflare-output.js`: explicitly copies `ellen-studio/` to all three outputs.
- `_headers`: preview noindex and no-store headers scoped only to `/ellen-studio/*`.

This extends the static source model documented in `site-architecture.md`. It does
not use inactive Next.js scaffolding, shared commercial CSS, the property manager,
`LOCAL_DB`, D1 migrations, existing sessions, or the Nykuto Local catalogue. There
are no changes to existing public homepage/navigation destinations. Both Pages
projects consume the repository; verify the intended preview host before sharing.
The intended final main-domain path is `https://nykuto.com/ellen-studio/`, but that
URL must not be described as live until an approved deployment is verified.

## Preview honesty and privacy

A visible notice and HTML/HTTP noindex state remain in place. Service names are
explicitly suggestions pending Ellen's approval; no prices, durations, credentials,
reviews, availability, address or phone number are invented. All prices read
`Valor a definir`. The agenda explains that **no reservation is made**.

The hero uses an original AI-generated editorial image. It is visibly labelled
as illustrative, its alternative text states that it is not Ellen or studio work,
and it is not presented as a photograph of her studio. No third-party images,
remote fonts, trackers or analytics are requested. Native font stacks vary with
the visitor's installed fonts; no font files are bundled. Core information remains
readable without JavaScript. Navigation, focus states, service buttons and
reduced-motion preferences are supported.

## What is deliberately not built yet

No admin interface, password, login/session, photo upload, database persistence,
payment, appointment storage, calendar sync, or active WhatsApp contact. Do not
present browser previews or edits as saved data. Content currently changes through
source edits only. An actual authenticated admin is a separate next implementation.

## Validation

```sh
node --check ellen-studio/ellen-studio.js
npm run test:ellen-studio
npm run build
node scripts/test-ellen-studio.mjs --built
npm run hygiene
npm run functions:check
```

The first local prototype was rendered in Chromium at widths 320, 375, 390, 768,
1024, 1440 and 1920 px. Checks covered horizontal overflow, category switching,
deep-link category selection, mobile menu/Escape/focus behavior, absence of
JavaScript errors and absence of remote requests. A JavaScript-disabled mobile
render retained navigation and all service categories. This is not a claim of
physical-iPhone or Safari testing. Full-repository checks must also run in CI.

## Full launch and indexing prerequisites

Obtain Ellen's confirmed services and prices, authorized portfolio photos, public
business contact and location/hours. Confirm the intended language and contact
journey. Only enable a WhatsApp link after the actual destination is supplied and
checked. Remove preview/noindex restrictions only when the business information is
genuine and the owner approves public indexing. Do not register a new domain for
this pilot.
