---
title: Apply shadcn preset across the customer web app
type: chore
ticket: chore-apply-shadcn-preset
created: 2026-11-25
status: in-review
baseline_revision: d8cd6233b2fc154bc2a4814726d4e8a80f658db5
route: full
route_source: auto
risk: medium
review: quick
review_source: auto
lenses_ran: []
review_loop_iteration: 0
context:
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - docs/VISUAL_UX_CONSTRAINTS.md
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-chore-shadcn-preset/DESIGN.md
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-chore-shadcn-preset/EXPERIENCE.md
---

## Intent

**Problem:** The runtime web stylesheet retains fixed legacy colors, Inter typography, and control rules that mask the requested shadcn preset on most screens.

**Approach:** Apply preset `b51GFh7y6` in `apps/web`, make semantic shadcn tokens the runtime visual source, and migrate all implemented customer screens while preserving behavior.

## Boundaries & Constraints

**Always:** Keep Base UI, root npm lockfile, policy text and values, keyboard behavior, and the synthetic non-binding decision boundary. Preserve the layout intent of existing UX handoffs.

**Never:** Import `design/global.css` into the Next.js app, replace the customer flow with a generic dashboard, or change API/database behavior.

## Code Map

- `apps/web/components.json`, `apps/web/package.json`, `package-lock.json` — preset and dependencies.
- `apps/web/src/app/layout.tsx`, `apps/web/src/app/styles.css` — font and runtime theme; legacy overrides live in the CSS file.
- `apps/web/src/components/ui/` — installed shadcn components, currently Base UI.
- `apps/web/src/auth/`, `apps/web/src/policies/`, `apps/web/src/endorsement/` — customer screens and states.
- `design/global.css` — separate mockup styling; not loaded by the app.

## Tasks & Acceptance

**Execution:**
- [x] Restore and review the CLI-generated preset diff; keep only the required dependency, font, configuration, token, and component changes.
- [x] Reconcile `apps/web/src/app/styles.css` so preset tokens drive surfaces, text, controls, links, focus, and status treatments without legacy visual overrides.
- [x] Update screen components where raw controls or classes bypass the shared shadcn styling; preserve labels, focus, errors, and decisions.
- [x] Update affected documentation and the ticket if implementation scope changes; sync Issue #147.
- [x] Verify web component tests, typecheck, formatting, build, browser flows, and desktop/narrow screenshots.

**Acceptance Criteria:**
- Given any implemented customer route, when it renders, then the preset's visual system is evident and content remains readable at desktop and narrow widths.
- Given a form error or decision status, when it appears, then text and accessible semantics explain it without relying on color.
- Given an approved proposal, when history is viewed, then it remains a non-binding decision and the underlying policy is unchanged.

## Implementation Notes

The preset command completed before ticket creation; its uncommitted diff was stashed while the ticket/UX PR merged. Restore that diff on the implementation branch before editing.

The preset switched the web configuration to Base Luma, mist, rose, Public Sans, and Phosphor. Legacy runtime palette and Inter declarations were removed. Native retry and decision buttons now use shadcn Button; request inputs use shadcn Input. `design/global.css` remains isolated to mockups. The old Lucide dependency was removed.

The first browser run passed 41 functional scenarios and failed four Windows visual baselines because of the intended theme change. After reviewing desktop and narrow captures against the UX handoff, the four baselines were updated. The second run passed 45 scenarios with six platform-specific visual tests skipped on Windows. Both runs used newly created disposable Neon databases that were removed afterward. Latest report: `test-results/chore-apply-shadcn-preset/report-20261125103548/e2e-20261125103548.html`. Linux CI still needs to validate its own baselines.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- `npm run format:check` — formatting passes.
- `npm run typecheck` — TypeScript passes.
- `npm run test -w apps/web` — web component tests pass.
- `npm run build` — Next.js build passes.
- `npm run test:e2e` — browser flows pass with screenshots; inspect desktop and narrow views.
