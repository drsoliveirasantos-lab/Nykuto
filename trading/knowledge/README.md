# Knowledge integration

This directory contains Diego's three supplied research packs, their original text/JSON, a reproducible search catalogue and the descriptive analysis integration. See [the intake audit](INTEGRATION_AUDIT.md) for the comparison, definition conflicts, counts and limitations.

Authoritative imported documents live in `packs/`; `import-manifest.json` records their original SHA256 and ZIP provenance. Do not silently edit a supplied document: record a new reviewed version and update the manifest deliberately. `catalogue.json` and `catalogue-pin.mjs` are generated only by `node scripts/build-trading-knowledge.mjs` from the repository root. `node scripts/build-trading-knowledge.mjs --check` validates reproducibility and all source hashes without changing files.

`knowledge-core.mjs` searches this fixed corpus and returns references with guardrails. It never fetches a source URL, evaluates a formula string, claims model training, or authorizes an order. `knowledge-loader.mjs` verifies the pinned bytes. `knowledge-view.mjs` inserts only text nodes and explicit HTTPS citation links; imported Markdown/HTML-looking text is never executed. Original Markdown remains available for long-form reading.

`analysis-knowledge.mjs` is the actual runtime consumer, called from the existing `analysis.mjs`. It associates descriptive observations with explanatory records. An asynchronous generation counter prevents a stale response from replacing a more recent selection or reappearing after a load failure. This is document retrieval for a deterministic descriptive interface, not an LLM integration or a new strategy detector. No broker, source connector, background collection, paper/shadow mode or account mutation is added.

Both pages inherit the existing Trading HQ membership middleware. The trading directory is deployed separately from the commercial static outputs; a successful commercial build does not prove that the new knowledge page is live. Changes are submitted on a dedicated branch stacked on PR 91, awaiting the owner's merge validation.
