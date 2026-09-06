# Ellen Studio — typography audit

Reviewed 6 September 2026 after Diego reported that descriptions near prices felt
too large and asked for a clear hierarchy at each content level.

## Findings

The source styles used many repeated size declarations and independent breakpoint
overrides. At a 390px viewport, a care name and its primary description both used
16px, while the price used 28px. Desktop prices reached 30px. The cart repeated this
pattern: item names were 16px but prices were 20–22px and the total was 32px.

Page headings also varied independently from section headings. On the homepage
at 390px, the page heading was about 30.4px while the section heading was 32px.
Several later headings and the footer logo therefore competed with the main title.

## Adopted scale

All sizes below are equivalent CSS pixels at a default 16px root size. The actual
stylesheet uses `rem` tokens so user text-size preferences can scale the hierarchy.

| Role | Mobile before | Mobile now | Desktop before | Desktop now |
| --- | ---: | ---: | ---: | ---: |
| Page title | 30–40 | 32 | 56–70.4 | 44 |
| Section title | 28–36 | 24 | 32–41 | 28 |
| Homepage category title | 28 | 18 | 34 | 20 |
| Care name / list-item heading | 16–17 | 16 | 16–17 | 16 |
| Page introduction | 16 | 16 | 16–18 | 16 |
| Section introduction | 16 | 14 | 16 | 14 |
| Main care description | 15–16 | 14 | 15–16 | 14 |
| Care price | 28 | 14 | 30 | 14 |
| Unquoted-price text | 18 | 14 | 20 | 14 |
| Currency and approximation symbols | 14 | 12 | 14 | 12 |
| Price qualifier | 12 | 12 | 12 | 12 |
| Indicative-price note | 14 | 12 | 14 | 12 |
| Navigation and action text | 14 | 14 | 14–15 | 14 |
| Cart section heading | 32 | 24 | 32 | 28 |
| Cart care name | 16 | 16 | 16 | 16 |
| Cart line price | 20 | 14 | 22 | 14 |
| Cart total amount | 32 | 16 | 32 | 16 |
| Appointment form heading | 36 | 24 | 40 | 28 |
| Field label | 14 | 14 | 14 | 14 |
| Input, select and textarea text | 16 | 16 | 16 | 16 |
| Form help and optional-field notes | 12–14 | 12 | 12–14 | 12 |
| Image captions | 12 | 12 | 12 | 12 |
| Footer tagline | 21 | 16 | 23 | 16 |
| Footer fine print | 12 | 12 | 12 | 12 |
| Footer wordmark | 44 | 28 | 44 | 28 |

Mobile values above use 390 CSS pixels; desktop values use 1280. Ranges represent
different components in the same role, not uncertainty. The desktop specialty
navigation is hidden; its previously inherited size is now explicitly aligned with
the 14px navigation token as well.

## Implementation

- `--type-page`, `--type-section` and `--type-category` are the three responsive levels.
- `--type-card` is 16px; `--type-body` is 14px; `--type-meta` is 12px.
- Existing font-size declarations now refer to those roles, including small-screen
  overrides. This replaces isolated size choices rather than layering another set
  of numeric exceptions over them.
- Headings and price figures retain the local Cormorant typeface. Descriptions,
  care names and controls retain the native sans-serif stack.
- Care names use a medium weight. Descriptions use a 1.5 line height; compact price
  figures use 1.3. Cherry color continues to identify prices without enlarging them.
- Form input text stays at 16px for a readable editing surface. Decorative monograms
  and icons are graphic elements, outside the content-heading hierarchy. Interactive
  icon targets remain 44 × 44px; text reduction does not shrink their hit area.

The hierarchy follows the role of each block: a new section can introduce its own
heading, while details inside that section remain subordinate. No care descriptions,
prices or qualifiers are equal to or larger than their care heading.

## Validation and limits

The audit parses the actual stylesheet and all six HTML routes, resolves selector
specificity, source order, width media queries, inherited sizes and CSS variables,
and evaluates `px`, `rem`, `em`, `vw` and `clamp()` values. Cart item rows use a source
fixture with the same markup classes and tags as the cart renderer.

The updated hierarchy was checked at widths of 320, 390, 768 and 1280 CSS pixels.
At each width, section titles remain below the page title, and care descriptions,
prices and qualifiers remain below their care name. Repeating the card hierarchy
check with a doubled root text size also passed. Font families, monetary values,
cart controls and WhatsApp content retain their existing behavior.

This is a source-level cascade audit, not browser layout, physical-device or Safari
testing. It does not measure glyph shape, optical size or actual line wrapping.
Normal repository, cart-handler and copied-build checks remain required before
publication.
