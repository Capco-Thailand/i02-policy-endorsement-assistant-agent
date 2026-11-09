# Spine Pair Review — PEA-001 Policy List and Detail

## Overall verdict

The two spines cover the main policy browsing and eligibility decisions, and their source and mockup links resolve. The expired-policy mockup and token frontmatter need correction before the pair is a dependable implementation contract. Several UI states are specified only in prose, which is acceptable if the mockups are explicitly treated as examples.

## 1. Flow coverage — adequate

AC-1/2, AC-3/4/6, and AC-5/7 are grouped into three named-protagonist flows with numbered steps, climax, and failure notes. AC-8 is a test requirement rather than a user journey.

### Findings

- **medium** AC-4 is only a failure note within the active-policy journey, so the expired-policy decision lacks its own numbered path and climax (`EXPERIENCE.md` Key Flows, AC-3/4/6). *Fix:* Add a brief expired-policy flow or make the alternate path explicit in numbered steps.

## 2. Token completeness — thin

No unresolved `{path.to.token}` references appear, and `colors: {}` correctly signals no custom color overrides. The shadcn inheritance choice is clear in prose.

### Findings

- **high** `typography`, `rounded`, and `spacing` frontmatter entries use `note` objects where the DESIGN.md spec expects type properties, CSS dimensions, or spacing dimensions (`DESIGN.md` frontmatter). `components` entries also contain only notes rather than machine-readable component tokens. *Fix:* Use empty objects for inherited scales and state shadcn inheritance in prose; keep only valid concrete overrides in frontmatter.
- **medium** The visual contract says to check contrast in the implemented theme but gives no target for the primary button, badge text, disabled explanation, or focus ring (`DESIGN.md` Colors). *Fix:* State a WCAG 2.2 AA target for these load-bearing combinations without inventing a brand palette.

## 3. Component coverage — adequate

Policy card, status badge, policy fact group, beneficiary list, action button, and feedback panel have corresponding visual and behavioral rows. Frontmatter is narrower than the body, which is fine if it only records overrides.

### Findings

- **low** The feedback panel is specified in both spines but absent from either visual mockup (`DESIGN.md` Components; `design/page/*.html`). *Fix:* Identify error and unauthorized states as spine-only, or add a small feedback-panel visual reference.

## 4. State coverage — adequate

Loading, loaded, empty, ACTIVE, EXPIRED, API/invalid-data error, unauthorized/unknown policy, and changed eligibility are specified across the two main surfaces. Endorsement intake is explicitly outside the ticket.

### Findings

- **medium** A direct route to the intake page after status or authorization changes has no stated user-facing landing behavior, though server refusal is described (`EXPERIENCE.md` State Patterns and Key Flows). *Fix:* Specify a generic blocked state or return path for a direct, ineligible intake URL without implying draft creation.

## 5. Visual reference coverage — thin

There are no files in `mockups/`, `wireframes/`, or `imports/`; the two mockups are under `design/page/` per repository design standard. Both spines link to them. Each illustrates one canonical loaded state, with an expired alternate in detail.

### Findings

- **high** The expired policy card links to `policy-detail.html#expired`, which displays another policy's ACTIVE details and beneficiaries above the expired callout (`design/page/policies.html`; `design/page/policy-detail.html`). This suggests the wrong record can appear when an expired policy is selected. *Fix:* Give the expired sample a distinct detail mockup or make the detail mockup switch the entire record, not just scroll to a callout.
- **medium** The ACTIVE Request Endorsement link targets `#intake-note`, not an intake view or route, so the most important interaction is only described in text (`design/page/policy-detail.html`). *Fix:* Render it as a clearly nonfunctional visual element, or link to a lightweight intake boundary mockup that demonstrates navigation without creating a draft.

## 6. Bloat & overspecification — strong

The two spines are concise and generally keep ticket requirements out of design prose. Open questions are appropriately contained.

## 7. Inheritance discipline — adequate

Both `sources` paths resolve to the ticket. Component names align between the two tables, and no token references are broken. The visual contract's shadcn inheritance is consistent with the user's choice.

### Findings

- **low** The memlog says validation was skipped and the spines were finalized, but validation was later requested (`.memlog.md`). *Fix:* Append a new event recording that the review occurred; preserve the prior event as history.

## 8. Shape fit — strong

DESIGN.md body headings follow the required order, and EXPERIENCE.md has every default section plus Responsive & Platform. Open questions are relevant to the ticket.

## Mechanical notes

The ticket and mockup links resolve. No `{path.to.token}` references or Mermaid diagrams need checking. The token frontmatter should be normalized to the DESIGN.md schema before downstream use. `design/page/` is the repository's required design-output location.
