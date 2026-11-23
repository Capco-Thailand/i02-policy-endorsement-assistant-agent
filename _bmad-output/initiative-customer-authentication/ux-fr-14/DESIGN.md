---
name: Policy Endorsement Assistant
status: final
updated: 2026-11-23
colors:
  ink: '#0a2540'
  muted: '#425466'
  line: '#dce6ef'
  paper: '#ffffff'
  accent: '#5148d9'
  warning: '#79510d'
  focus: '#5148d9'
typography:
  family: 'Inter, system-ui, Arial, sans-serif'
rounded:
  panel: 10px
  control: 6px
spacing:
  section: 30px
components:
  coverage-row: 'Flat bordered row with name, amount, currency, and source'
  citation: 'Source title, version, and section in readable text'
---

# FR-14 expanded policy detail — visual contract

## Brand & Style
Extend the existing synthetic policy record interface. Present coverage as cited policy information, without implying live or bound coverage. The [behavior contract](EXPERIENCE.md) governs interaction and states; both contracts govern if the [mockup](../../../design/page/policy-detail-coverage.html) differs.

## Colors
Use {colors.ink} for facts, {colors.muted} for labels and source metadata, {colors.line} for section rules, and {colors.paper} for the page. Use {colors.warning} with explicit unresolved text. Links and focus use {colors.accent} and {colors.focus}.

## Typography
Use {typography.family} and the existing page title and section heading scale. Give the coverage name and amount equal visual weight. Keep currency next to every amount; use tabular numerals. Source title, version, and section remain legible body text.

## Layout & Spacing
Keep one reading column. Order: policy identity and status, insurer/product facts, coverage, exclusions, existing policy facts, beneficiaries, then request action. Use {spacing.section} between sections. Coverage rows stack name, amount, and citation at 320px; never truncate a source reference.

## Elevation & Depth
Separate content with thin rules. Avoid shadows and raised cards for policy terms.

## Shapes
Use {rounded.panel} sparingly on state notices and {rounded.control} on controls. Coverage and exclusions remain flat rows.

## Components
- Coverage row: {components.coverage-row}. Display one name, one insured amount and currency, and a citation immediately below.
- Citation line: {components.citation}. It names a synthetic source document, version, and section; keep it visible rather than behind a disclosure.
- Exclusion row: customer-readable exclusion or limitation with the same citation treatment.
- Unresolved notice: warning border and text explaining which evidence is missing, stale, or conflicting. Do not show an invented value.

## Do's and Don'ts
Show “Synthetic policy data for this prototype” near the record. Keep active and expired status words visible. Never label a coverage amount “approved”, “issued”, or “guaranteed”. Mock values are illustrative until the product fixtures are agreed in the FR-14 ticket.
