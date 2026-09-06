# Repository instructions for AI assistants

Always read `SOURCE_OF_TRUTH.md`, `AGENTS.md`, and `docs/site-architecture.md` before editing.

Rules:

- Identify the source of truth before changing files.
- Use small branches and pull requests after the initial bootstrap.
- Do not merge unless checks are green and the user validates the merge.
- Do not delete files, branches, workflows, generated data, assets, or backups without explicit validation.
- Do not introduce archives, stale copies, temporary dumps, or debug workflows.
- Keep project documentation synchronized with structural changes.
- Keep commercial promises realistic: Nykuto sells simple showcase websites, not complex platforms.

Validation:

```bash
node scripts/validate-repository-hygiene.js
```

If a validator fails, fix the cause before merging.

## Shared typography requirement

Before creating or updating any UI, read and apply
[the shared typography standard](../docs/typography-standard.md).
Keep nested text subordinate to its own heading: page > section > subheading >
card/item name > short description/price > metadata. Use consistent role tokens;
retain readable long-form learning text, user text scaling and touch targets.
Fix hierarchy inversions in the components touched by the requested update.
Carry the standard and its AGENTS/Copilot references into every new site or
repository created from this project.
