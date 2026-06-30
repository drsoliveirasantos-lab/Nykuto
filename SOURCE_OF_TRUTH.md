# Source of truth — Nykuto

This file defines what contributors and AI assistants must treat as authoritative in this repository.

## Project identity

Nykuto is the main commercial showcase website for affordable website creation services.

The brand message is:

> Simple, modern and affordable showcase websites for professionals who want a clean online presence without a complex agency project.

## Branches

- `main` is the production branch.
- After the initial repository bootstrap, use a short working branch for every meaningful change.
- Open a pull request before merging into `main`.
- Do not merge unless checks are green and the user validates the merge.

## Editable sources

The editable source of truth is:

- project documentation in `docs/`;
- application source code in `app/`, `components/`, `data/`, `lib/`, or `src/` when those folders exist;
- public brand and media assets in `public/` or `assets/` when those folders exist;
- repository workflows and instructions in `.github/`;
- validation scripts in `scripts/`.

Generated, bundled, copied, temporary, exported, or archived files must never be treated as primary sources unless explicitly documented here.

## Commercial scope

Nykuto sells simple showcase websites, not complex software platforms.

Allowed positioning:

- one-page or small multi-page showcase websites;
- clear service presentation;
- simple contact forms;
- WhatsApp/contact buttons;
- basic structure to help search engines understand the activity;
- responsive design;
- simple external integrations such as Calendly or Tally if needed.

Do not promise:

- first-page Google ranking;
- advanced SEO guarantees;
- complex custom booking systems;
- full e-commerce platforms;
- private client portals;
- complex back-end systems;
- advanced automation unless explicitly scoped later.

## Documentation

- `AGENTS.md` = operating rules for AI agents.
- `.github/copilot-instructions.md` = repository-level AI instructions.
- `docs/site-architecture.md` = repository organization and workflow.
- `docs/brand.md` = brand identity, voice and visual direction.
- `docs/offers.md` = commercial offers, prices and boundaries.
- `docs/content-strategy.md` = messages, target customers and conversion logic.

## Validation

The repository hygiene script is:

```bash
node scripts/validate-repository-hygiene.js
```

The GitHub workflow is:

```txt
.github/workflows/repository-hygiene.yml
```

## Forbidden stale material

Do not keep temporary archives, backup copies, debug workflows, old generated dumps, stale copies, or undocumented exported material in the repository.
