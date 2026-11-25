---
name: FR-15 customer UI redesign
description: Visual contract for sourced policy detail and non-binding proposal comparison.
status: final
updated: 2026-11-25
sources:
  - docs/backlog/fr-15-redesign-policy-detail-and-proposal-review.md
colors:
  background: 'var(--background)'
  foreground: 'var(--foreground)'
  card: 'var(--card)'
  muted: 'var(--muted)'
  muted-foreground: 'var(--muted-foreground)'
  border: 'var(--border)'
  primary: 'var(--primary)'
  primary-foreground: 'var(--primary-foreground)'
  success-foreground: 'var(--success-foreground)'
  warning-foreground: 'var(--warning-foreground)'
  destructive: 'var(--destructive)'
typography:
  family:
    fontFamily: 'Public Sans'
  page-title:
    fontSize: '34px'
    fontWeight: '700'
    lineHeight: '1.15'
  section-title:
    fontSize: '20px'
    fontWeight: '700'
    lineHeight: '1.3'
  body:
    fontSize: '15px'
    lineHeight: '1.5'
  label:
    fontSize: '12px'
    fontWeight: '650'
  amount:
    fontSize: '16px'
    fontWeight: '700'
rounded:
  control: 'var(--radius)'
spacing:
  page-desktop: '28px'
  page-mobile: '16px'
  section: '30px'
  comparison-row: '16px'
components:
  policy-snapshot:
    border: '{colors.border}'
    label: '{colors.muted-foreground}'
    value: '{colors.foreground}'
  sourced-fact:
    border: '{colors.border}'
    value: '{colors.foreground}'
    link: '{colors.primary}'
  unresolved-fact:
    border: '{colors.border}'
    label: '{colors.warning-foreground}'
  proposal-field-comparison:
    border: '{colors.border}'
    background: '{colors.card}'
  quote-summary:
    background: '{colors.card}'
    foreground: '{colors.foreground}'
  decision-area:
    background: '{colors.card}'
    foreground: '{colors.foreground}'
    action-background: '{colors.primary}'
    action-foreground: '{colors.primary-foreground}'
    radius: '{rounded.control}'
  source-link:
    foreground: '{colors.primary}'
    underline: 'visible on hover and focus'
  status-label:
    border: '{colors.border}'
    foreground: '{colors.foreground}'
---

# FR-15 visual contract

## Brand & Style

This is a restrained synthetic policy servicing interface. Keep the running app's shadcn/ui preset `b51GFh7y6`, Base UI primitives, Public Sans, and semantic runtime tokens. The page should make exact policy and proposal facts easier to read. The selected lead question is **“What would this request change and cost?”**; current policy facts and evidence remain visible. This contract is derived from the [FR-15 draft](../../../docs/backlog/fr-15-redesign-policy-detail-and-proposal-review.md) and [UX decision log](.memlog.md). Its `[ASSUMPTION]` layouts remain proposed until customer review. The older shadcn contract retains current layouts, so an accepted FR-15 layout will need that contract reconciled.

## Colors

The `colors` entries are aliases of the existing shadcn semantic system, with **no FR-15 color overrides**. The exact light and dark values resolve from `:root` and `.dark` in `apps/web/src/app/styles.css`; duplicating hex values here would create a second palette that could drift. Use `{colors.background}` and `{colors.card}` for flat surfaces, `{colors.foreground}` for primary text, and `{colors.muted-foreground}` for secondary labels only when it remains readable. `{colors.border}` separates data groups and rows. `{colors.primary}` is for links, primary actions, and focus, not a quantitative data scale. Success, warning, and destructive roles may accompany a text status; color never carries the status alone. Verify at least 4.5:1 contrast for ordinary text and 3:1 for large text, controls, and visible focus in both themes; choose `{colors.foreground}` where a muted role does not meet that target. [The theme preview](../../../design/page/shadcn-theme-preview.html) is a reference, not a replacement for runtime token checks.

## Typography

Use `{typography.family.fontFamily}` throughout. Page title, section title, body, label, and amount follow the hierarchy in frontmatter; at 320px the page title may step down to 28px. Amounts and policy identifiers use tabular numerals where alignment helps comparison. State currency and period with every monetary value. Never abbreviate a money value in a way that hides cents or changes a server-returned amount.

## Layout & Spacing

[ASSUMPTION] Keep a coherent reading path for the policy and proposal journey, with aligned subcolumns only where they aid comparison. Policy detail starts with identity, status, term, and coverage, then beneficiaries, limitations, the active-policy request action, and full source evidence. Proposal review opens with the non-binding boundary and change/cost summary, followed by a field-by-field comparison, cited assessment, and decision actions.

Desktop uses a reading width near the existing policy detail shell, `{spacing.page-desktop}` outer padding, and `{spacing.section}` section separation. At 320px, use `{spacing.page-mobile}` outer padding and stack each field's current and proposed values inside the same row; keep the field label attached to both. Responsive behavior is specified in `EXPERIENCE.md` and demonstrated by the canonical browser pages [policy detail](../../../design/page/fr-15-policy-detail.html) and [proposal review](../../../design/page/fr-15-proposal-review.html). Captures show [policy desktop](mockups/policy-detail-desktop.png), [policy 320px](mockups/policy-detail-mobile-320.png), [proposal desktop](mockups/proposal-review-desktop.png), and [proposal 320px](mockups/proposal-review-mobile-320.png). The spines win if a mockup differs.

## Elevation & Depth

Flat surfaces, borders, and restrained rose accents supply hierarchy. Avoid gradients, glass, layered shadows, and repeated card elevation. Dense facts should be separated by spacing and rules rather than by a new card around every value.

## Shapes

Use `{rounded.control}` for controls and restrained surface corners. Avoid large rounded panels on every section. A status label may be compact and rounded, but its text is the state indicator.

## Components

The atomic inventory names visual responsibilities; `EXPERIENCE.md` owns their behavior. Shadcn Button, Badge, Alert, Label, Separator, and Field keep their inherited visual states.

| Level | Part | Visual contract |
| --- | --- | --- |
| Atom | Field label, amount, unit, Source Link | Inherit shadcn typography and focus; amounts use tabular numerals, Source Link is visibly underlined on hover and focus. |
| Molecule | Sourced Fact, Unresolved Fact, Status Label, Proposal Field Comparison | Pair each label with its value and source; keep current and proposed values inside one field group. |
| Organism | Policy Snapshot, Quote Summary, Decision Area | Organize exact facts by customer question; retain citations and the non-binding notice before decisions. |
| Template | Policy detail, proposal review | One reading path with a clear page heading, responsive data groups, and an action after the information it follows. |
| Page | Active/expired policy and pending/approved/rejected proposal | Populate templates only with authorized synthetic data and correct state labels. |

| Component | Visual contract |
| --- | --- |
| Policy Snapshot | `{components.policy-snapshot}` uses a rule and label/value hierarchy for identity, status, and term. |
| Sourced Fact | `{components.sourced-fact}` keeps exact value and visible source reference in one row. |
| Unresolved Fact | `{components.unresolved-fact}` replaces an unknown value with readable warning text and any available source. |
| Proposal Field Comparison | `{components.proposal-field-comparison}` keeps current and proposed values within one field group; changed/unchanged text stays visible. |
| Quote Summary | `{components.quote-summary}` emphasizes the returned annualized total and period without a chart. |
| Decision Area | `{components.decision-area}` places the non-binding explanation before inherited shadcn actions. |
| Source Link | `{components.source-link}` leads to the full versioned citation. |
| Status Label | `{components.status-label}` pairs restrained semantic color with explicit state text. |

## Do's and Don'ts

| Do | Don't |
| --- | --- |
| Show exact server-provided money, benefit, unit, and period in aligned rows. | Calculate or invent a difference in the browser or use a decorative chart for unlike benefits. |
| Keep policy source title, version, section, and excerpt accessible from a sourced fact. | Treat retrieved text as a replacement for the authoritative policy record. |
| Put the non-binding meaning before approval actions. | Style a proposal as issued or bound coverage. |
| Preserve clear labels at 320px and keyboard focus. | Depend on color or side-by-side column memory to communicate a change. |
| Reuse runtime semantic tokens and Public Sans. | Reuse the legacy purple/Inter standalone mockup palette. |
