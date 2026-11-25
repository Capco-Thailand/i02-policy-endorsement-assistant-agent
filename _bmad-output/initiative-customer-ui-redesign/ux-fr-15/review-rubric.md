# Spine Pair Review — Policy Endorsement Assistant

## Overall verdict

The two spines cover the FR-15 customer task, the non-binding boundary, and the main proposal states. The initial mechanical issues below were corrected during this review; the layout assumptions still need customer review before implementation.

## 1. Flow coverage — strong

Checked the FR-15 user story and nine acceptance criteria against the two named Narin journeys. Both journeys have numbered steps and a climax; the payment-change journey includes unavailable-quote and decided variants, and the disputed-fact journey includes an expired variant.

### Findings

- **medium — resolved** The expired policy and recorded approval/rejection paths initially lacked explicit exits (`EXPERIENCE.md`, Key Flows). *Fix applied:* The State transitions after review table now gives each next step.

## 2. Token completeness — strong

Checked the frontmatter color, typography, rounded, spacing, and component tokens and every `{path.to.token}` reference. Color values intentionally alias the existing runtime shadcn tokens, with no new palette; the body states contrast targets for light and dark themes. All prose references resolve.

### Findings

- **medium — resolved** `{rounded.control}` initially resolved to prose, not a CSS dimension (`DESIGN.md`, frontmatter `rounded.control`). *Fix applied:* It now resolves to `var(--radius)`.
- **medium — resolved** The mobile page gutter initially differed between the token and CSS (`DESIGN.md`, frontmatter `spacing.page-mobile`; `design/page/fr-15-redesign.css`, mobile media query). *Fix applied:* Both now use 16px.

## 3. Component coverage — strong

Checked every named component in `DESIGN.md.Components` and `EXPERIENCE.md.Component Patterns`, including frontmatter component names.

### Findings

- **high — resolved** The first draft used different component names in the atomic inventory and behavior table (`DESIGN.md`, Components and frontmatter; `EXPERIENCE.md`, Component Patterns). *Fix applied:* Both now name Policy Snapshot, Sourced Fact, Unresolved Fact, Proposal Field Comparison, Quote Summary, Decision Area, Source Link, and Status Label with visual and behavioral rows; shadcn primitives remain inherited.

## 4. State coverage — strong

Checked policy detail, proposal review, and source-anchor states against the IA and ticket. Loading, unavailable, session-ended, unowned, active/expired, unresolved, pending/decided, and unchanged impact are described; focus and mobile behavior appear in Accessibility Floor.

### Findings

- **medium — resolved** The first draft did not distinguish a missing proposal from an unavailable quote or state the missing-citation fallback (`EXPERIENCE.md`, State Patterns; FR-15 acceptance criteria). *Fix applied:* Separate `Missing citation` and `Missing proposal or quote` rows now specify both treatments.

## 5. Visual reference coverage — strong

Checked both linked `design/page/` reference screens and their four desktop/320px captures in `mockups/`. The project standard uses browser-viewable pages in `design/page/`; both spines link to the page references and state once that spines win on conflict.

### Findings

- **high — resolved** The first policy-detail mockup put the long source list before term and beneficiaries in DOM/mobile order (`design/page/fr-15-policy-detail.html`, initial `.main-flow` before `.side-flow`). *Fix applied:* The DOM now reads term → coverage → beneficiaries → exclusions → request → full sources, with desktop grid areas preserving the same order.
- **low — resolved** `design/page/` is the canonical browser-viewable output under `docs/DESIGN_STANDARD.md`; there is no need to duplicate the pages in a run-local `mockups/` folder. Both spines link to those pages inline.

## 6. Bloat & overspecification — strong

The contracts focus on reusable layout and behavior decisions, with little ticket restatement. Token sizes, content order, and atomic levels serve implementation needs.

### Findings

None.

## 7. Inheritance discipline — strong

The FR-15 draft source and mockup links resolve, the lead question matches the customer decision, and both spines inherit the runtime shadcn theme. Component names now match across the two spines.

### Findings

- **low — resolved** The first draft lacked parallel `sources` frontmatter in both spines (`DESIGN.md` and `EXPERIENCE.md`, frontmatter). *Fix applied:* Each now has the same resolvable FR-15 draft path.

## 8. Shape fit — strong

`DESIGN.md` follows the canonical section order. `EXPERIENCE.md` includes every default section plus Responsive & Platform and Inspiration & Anti-patterns, both triggered by this project.

### Findings

None.

## Mechanical notes

- The `{path.to.token}` references resolve against the YAML frontmatter. Semantic CSS aliases are deliberate inheritance from `apps/web/src/app/styles.css`, not new colors.
- The quoted policy and payment-rule excerpts in the mockups match the versioned synthetic corpus (`apps/ai/corpus/policies.json` and `apps/ai/corpus/endorsement-rules.json`). The server quote amounts and annualized difference match the proposal test fixture.
- No Mermaid diagrams occur in either spine. No orphaned imports or wireframes were present; all four `mockups/` captures are linked from the spines. This repository keeps browser-viewable mocks in `design/page/`.
