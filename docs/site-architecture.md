# Site architecture — Nykuto

This repository follows the shared Nykuto site standard.

## Purpose

Nykuto.com is the commercial showcase site for affordable, modern, simple showcase website creation.

The site must prove the quality Nykuto can deliver while keeping the offer realistic and focused.

## Layers

1. Editable application sources.
2. Public brand and media assets.
3. Commercial content and pricing data.
4. Validation scripts.
5. Documentation and repository governance.
6. GitHub workflows and AI instructions.

## Expected folders

```txt
.github/     GitHub workflows, pull request template and AI instructions
app/         Next.js app router pages when the application is added
components/  Reusable UI sections and components
data/        Pricing, FAQ, examples and structured content
lib/         Shared helpers if needed
public/      Public static assets, logo, favicons and mockups
docs/        Project documentation
scripts/     Validation and maintenance scripts
```

A repository does not need all folders immediately, but when they exist their role must stay clear.

## Planned pages

Initial commercial version:

```txt
/                    Landing page
/mentions-legales    Legal notice
/confidentialite     Privacy policy
/cgv                 Terms and conditions
```

Possible later pages:

```txt
/offres              Offers and pricing
/exemples            Example showcase sites
/contact             Lead capture form
/process             Work process
/faq                 Frequent questions
```

## Planned sections for the landing page

1. Header and navigation.
2. Hero with clear value proposition.
3. Problem: websites are often too expensive or too complex.
4. Solution: simple, useful and affordable showcase websites.
5. Offers and pricing.
6. Included features.
7. Price estimator.
8. Example website previews.
9. Process in clear steps.
10. FAQ.
11. Contact / WhatsApp call to action.
12. Footer and legal links.

## AI workflow

Before editing:

1. Read `SOURCE_OF_TRUTH.md`.
2. Read `AGENTS.md`.
3. Read `.github/copilot-instructions.md`.
4. Identify whether the target file is source, generated output, documentation, workflow, or asset.

Before merging:

1. Confirm the change is narrow.
2. Confirm checks are green.
3. Confirm the user approved the merge.

## Hygiene

Run:

```bash
node scripts/validate-repository-hygiene.js
```

The validator blocks known dangerous stale files and reports suspicious temporary or backup-style paths for review.
