# Validation Report — FR-15 customer UI redesign

- **DESIGN.md:** [Visual contract](DESIGN.md)
- **EXPERIENCE.md:** [Experience contract](EXPERIENCE.md)
- **Run at:** 2026-11-25

## Overall verdict

The two contracts cover the FR-15 customer task, the non-binding boundary, responsive comparison, and required states. The rubric's draft findings and the accessibility review's two medium findings were corrected. The marked layout assumptions still need customer review before implementation; screen-reader table navigation needs checking in the implemented UI.

## Category verdicts

| Category | Verdict | Result |
| --- | --- | --- |
| Flow coverage | Strong | Named journeys and exits for expired and decided states. |
| Token completeness | Strong | Runtime shadcn aliases and aligned 16px mobile gutter. |
| Component coverage | Strong | Shared atomic names across visual and behavior contracts. |
| State coverage | Strong | Missing citation, proposal, and quote fallbacks are explicit. |
| Visual reference coverage | Strong | Canonical browser pages and four width-specific captures linked. |
| Bloat & overspecification | Strong | Contracts focus on layout and behavior decisions. |
| Inheritance discipline | Strong | Sources, theme inheritance, and names resolve. |
| Shape fit | Strong | Required sections follow the BMad UX shape. |

## Findings by severity

### Critical (0 open)

None.

### High (0 open)

Two initial rubric findings were resolved: component names now match across both contracts, and policy detail now reads term, coverage, beneficiaries, exclusions, request, and sources in that order.

### Medium (0 open)

Four initial rubric findings were resolved: explicit exits for expired/decided states, a usable radius token, a consistent mobile gutter, and separate missing-citation/proposal/quote fallbacks. The accessibility review's two medium findings were resolved: citation targets have visible focus, and policy source links are inside their definition-list values.

### Low (0 open)

Two initial rubric findings were resolved: `design/page/` is identified as the canonical page location, and both contracts use the same `sources` frontmatter.

## Accessibility review

The 320px comparison has visible Current/Proposed labels and explicit table roles. Light-theme contrast estimates pass the checked text combinations. The static mockups do not replace a screen-reader pass in the implemented UI; the runtime dark theme is inherited but not shown in these captures.

## Document standards

The BMad structure and prose passes found no further edits needed. The contracts serve as reference documents; the atomic level map, visual component rules, behavior rules, and state table each support a distinct lookup.

## Verification

Headless Edge loaded both browser pages at 1280px and 320px. All four had one page heading, no horizontal overflow, and resolving in-page source anchors. The captures are linked from the contracts.

## Reviewer files

- [Rubric review](review-rubric.md)
- [Accessibility review](review-accessibility.md)
