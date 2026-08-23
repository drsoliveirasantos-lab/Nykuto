# Site architecture — Nykuto

## Current production model

Nykuto is a static multi-page website deployed through Cloudflare Pages.

Two Cloudflare Pages projects consume the same `main` branch:

- `nykuto` publishes the complete commercial site on `nykuto.com`;
- `nykuto-demo` publishes the real-estate concept at the root of
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
demo-imobiliaria.html          Interactive real-estate concept demo
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

`demo-imobiliaria.html` is an independent, clearly labelled concept linked from
the Nykuto commercial site and published canonically on `demo.nykuto.com`. It
uses owner-supplied photos and videos of real Ciudad del Este properties that
were neutralised before publication and stripped of embedded metadata. Property
names, references, prices, availability and locations remain illustrative. The
demo keeps a static inventory and a schematic map with approximate zones,
without a paid mapping API, live client account, payment flow, booking flow or
production property database.

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
```

Before merging, inspect the production output, verify internal links, confirm legal publisher data and wait for user approval.
