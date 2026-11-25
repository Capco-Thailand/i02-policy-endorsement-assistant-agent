---
title: 'FR-16 Redesign Sign-in and Policy List'
type: feature
ticket: 'fr-16-redesign-sign-in-and-policy-list'
created: '2026-11-25'
status: built
baseline_revision: 'd459e004e2a6bfd7d0f0f615ca589d3f31da6fa2'
route: full
route_source: auto
risk: medium
review: quick
review_source: auto
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - docs/DESIGN_STANDARD.md
  - docs/VISUAL_UX_CONSTRAINTS.md
  - _bmad-output/initiative-customer-ui-redesign/ux-fr-16/DESIGN.md
  - _bmad-output/initiative-customer-ui-redesign/ux-fr-16/EXPERIENCE.md
  - design/page/fr-16-sign-in.html
  - design/page/fr-16-policy-list.html
---

<frozen-after-approval reason="customer-owned intent; edit only after customer agreement">

## Intent

**Problem:** Sign-in and policy selection still use the prior layout. The two-column policy card grid makes authorized policies harder to compare with the accepted FR-16 reference.

**Approach:** Apply the accepted sign-in hierarchy and single-row policy list at desktop and 320px. Reuse the current session, API, and owner authorization flows; change presentation and copy only.

## Boundaries & Constraints

**Always:** Use only the authorized label, ID, and status; preserve sign-out, history navigation, field errors, session-ended cache clearing, explicit view actions, and expired historical meaning. Use shadcn semantic tokens, Public Sans, keyboard focus, and the synthetic boundary.

**Never:** Add policy-summary facts or a new API, infer coverage or payment data, expose another customer's record, change sign-in/session semantics, or suggest that opening a policy changes coverage.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Sign-in | Blank, invalid, ended, or unavailable | Form labels, first-invalid focus, readable error or ended message | No session or protected data on failure |
| Policy list | Multiple owned active and expired records | One readable row per policy with label, ID, status, and View policy | Expired detail remains historical; no request action |
| Async list | Loading, empty, service error, or ended session | Named state; retry for service failure; sign-in after session end | No stale or foreign record displayed |
| Narrow view | Any listed state at 320px | Same facts, actions, and reading order | No clipped text or horizontal scrolling |

</frozen-after-approval>

## Code Map

- `apps/web/src/auth/SignInScreen.tsx`, `SignInForm.tsx` — compose synthetic boundary, ended message, labels, errors, and submit; preserve `useSignIn` and focus behavior.
- `apps/web/src/app/policies/page.tsx`, `apps/web/src/policies/PolicyList.tsx` — heading, history/sign-out, query states and owner-authorized rows; preserve session cache clear and redirect.
- `apps/web/src/app/styles.css` — replace old two-column auth spacing and policy-card grid with accepted flat sign-in and single-row list at 320px; avoid styling other routes broadly.
- `apps/web/src/auth/*.test.tsx`, `apps/web/src/policies/PolicyList.test.tsx`, `apps/web/src/app/policies/page.test.tsx` — component seam for labels, focus, accessible link name, statuses, empty/error/retry, and ended-session behavior. These tests cannot prove server owner isolation.
- `e2e/customer-flows.spec.ts`, `e2e/visual.spec.ts`, `e2e/api-boundaries.spec.ts` — browser and API seam for real sign-in, two owned policies, foreign/unknown exclusion, expired status, states, and desktop/320 captures. A browser list check proves rendered authorization results but not every server filtering path; retain API boundary tests.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/src/auth/SignInForm.test.tsx`, `apps/web/src/policies/PolicyList.test.tsx`, `apps/web/src/app/policies/page.test.tsx` — add focused FR-16 assertions first; record a failing run for the intended missing presentation or copy, then green runs.
- [ ] `apps/web/src/auth/SignInScreen.tsx`, `SignInForm.tsx`, `apps/web/src/app/policies/page.tsx`, `apps/web/src/policies/PolicyList.tsx` — compose the accepted sections and state text, reusing current hooks and navigation.
- [ ] `apps/web/src/app/styles.css` — implement flat desktop and 320px hierarchy without affecting FR-15 detail or proposal screens.
- [ ] `e2e/customer-flows.spec.ts`, `e2e/visual.spec.ts` — add FR-16 browser criterion coverage, screenshots, and reviewed desktop/320 baselines; retain owner-boundary API checks.
- [ ] This plan and `docs/UX_REDESIGN_HANDOFF.md` — record dated report, criterion coverage, red/green evidence, review findings, and any limits. Sync Issue #156 only if the ticket requirement changes.

**Acceptance Criteria:**
- Given a synthetic demo account, when sign-in succeeds or fails, then the accepted boundary, labels, errors, focus, and session-ended explanation remain understandable at desktop and 320px.
- Given multiple owned policies, when the list loads, then each row names the policy, ID, Active or Expired state, and View policy; sign-out and history remain reachable.
- Given loading, empty, error, or ended states, when the list changes, then it communicates the next action without protected-data leakage, color-only meaning, or horizontal overflow.
- Given a foreign or unknown policy, when the customer opens a direct URL or the list loads, then no foreign policy appears and the direct URL remains non-disclosing.

## Implementation Notes

### 2026-11-25 implementation

- Sign-in copy now follows the accepted synthetic account hierarchy. The existing field validation, first-invalid focus, error handling, session mutation, cache clear, and redirect remain in place.
- The policy list uses one owner-authorized row per policy with the current response's label, ID, and status. Each row has an explicit, policy-specific accessible View policy name. The page explains linked records and historical expired values; sign-out and history remain available.
- Scoped CSS replaces the card grid with ruled rows and stacks both screens at narrow widths. No API contract or ticket requirement changed.
- Root Prettier configuration, dependency, and `format:check` script were already present. Only touched code was formatted.

### Red and green evidence

| Slice | Red | Green |
| --- | --- | --- |
| Synthetic account copy, `SignInForm.test.tsx` | `npx vitest run src/auth/SignInForm.test.tsx`: 1 failed, 2 passed; missing exact “Synthetic demo account” text | Same command: 3 passed |
| Named policy actions and readable status, `PolicyList.test.tsx` | `npx vitest run src/policies/PolicyList.test.tsx`: 1 failed, 3 passed; expected accessible View policy name absent | Same command: 4 passed |
| Authorized list and historical note, `page.test.tsx` | `npx vitest run src/app/policies/page.test.tsx`: 1 failed, 1 passed; linked-account explanation absent | Same command: 2 passed |

### Criterion coverage, 2026-11-25

| Criterion | Evidence | Result / remaining limit |
| --- | --- | --- |
| Sign-in success, errors, focus, ended state at desktop and 320px | `SignInForm.test.tsx`; FR-16 scenarios in `e2e/customer-flows.spec.ts`; FR-16 captures in `e2e/visual.spec.ts` | Component pass; browser pending database |
| Owned active and expired rows, View policy, history, sign-out | `PolicyList.test.tsx`, `page.test.tsx`; FR-16 browser scenario | Component pass; browser pending database |
| Loading, empty, service error, retry, session end, no overflow | `PolicyList.test.tsx` loading, empty, error/retry, and ended-session tests; FR-16 320px browser state scenarios | Component pass; browser pending database; 320px overflow unverified |
| Foreign and unknown records remain hidden and non-disclosing | Existing FR-03 browser/API scenarios and FR-16 `api-boundaries.spec.ts` scenario | Browser and API pending database; component mocks cannot prove server filtering |

### Verification result, 2026-11-25

- `npm run test -w apps/web`: 58/58 passed after the follow-up loading assertion; focused `PolicyList.test.tsx` rerun passed 5/5.
- `npm run typecheck`: passed.
- `npm run format:check`: passed.
- `npm run build`: passed.
- `npm run test:e2e -- --grep 'FR-16'`: blocked at API startup with `DATABASE_URL is required`. Failed harness report: `test-results/fr-16-redesign-sign-in-and-policy-list/report-20261125183644/e2e-20261125183644.html`. No browser criterion is marked verified, and reviewed desktop/320px baselines have not been generated.

### Browser follow-up, 2026-11-25

- Added 320px loading-to-empty, service-error/retry, and ended-session browser scenarios. The component state tests cover the corresponding visible text and cache clearing; they cannot verify responsive layout or a real API response.
- FR-16 visual scenarios now run on Linux and Windows. Each attaches the accepted UX mockup plus the current application screenshot. If a reviewed platform baseline exists, the test also compares pixels and attaches that baseline. If it does not, the test records `visual-baseline-pending` and leaves the comparison unverified; a passing capture alone must not be reported as visual-baseline approval. Review the first CI captures against the attached reference, commit accepted platform baselines, then rerun for comparison evidence.
- The browser and API scenarios still require a seeded synthetic PostgreSQL `DATABASE_URL`. The local rerun stopped at API startup, before any scenario executed.
- `npx playwright test --list --grep FR-16`: eight registered scenarios across browser UI, API boundary, and visual capture. `npm run test:e2e -- --grep 'FR-16'` stopped at API startup again with `DATABASE_URL is required`; report: `test-results/fr-16-redesign-sign-in-and-policy-list/report-20261125184126/e2e-20261125184126.html`. No new browser pass is claimed.
- Focused `npx vitest run src/policies/PolicyList.test.tsx --reporter=dot`: 5/5 passed, including the added loading state. This assertion covers existing behavior, so no red step was applicable. The prior sign-in, row, and page copy slices retain their recorded red/green results. `npm run typecheck` and `npm run format:check` passed after these additions.

### Review triage

- Quick review: preserved the existing session and owner-authorization paths; no server contract changes. Browser layout, contrast, and screenshots still need review after a synthetic database is available.

### Superseding browser verification, 2026-11-25

The customer supplied access to the synthetic Neon database. The credential is held in an ignored local Windows user encrypted file; it is absent from this plan, source, reports, and commits. Node used the Windows system CA store for TLS verification.

- `npm run test:e2e -- --grep FR-16` passed **8/8** in `test-results/fr-16-redesign-sign-in-policy-list/report-20261125184947/e2e-20261125184947.html`. API owner isolation, sign-in, active/expired rows, loading/empty, service error/retry, ended session, and desktop/320px states passed. An added sign-in service-failure case passed **1/1** in `report-20261125185545/e2e-20261125185545.html`; the FR-16 suite now registers nine scenarios.
- The final focused run passed **9/9**, including all four Windows visual comparisons, in `test-results/fr-16-redesign-sign-in-policy-list/report-20261125190241/e2e-20261125190241.html`. A prior 8/9 run found one shared-database sign-in response taking longer than Playwright's default five-second assertion timeout; the visual test now allows 15 seconds for the policy list to appear.
- After review fixes, the final focused run passed **9/9** in `test-results/fr-16-redesign-sign-in-policy-list/report-20261125190454/e2e-20261125190454.html`; web tests passed **58/58**, typecheck and format check passed, and the E2E production build passed.
- Four Windows Chromium baselines were generated after comparing the application captures with the accepted UX mockups: sign-in and policy list at 1280px and 320px. The focused run compared and passed all four. Review corrected heading weight, form control shape, notice contrast, and scoped list CSS to the policy-list route.
- The unfiltered `npm run test:e2e` produced `test-results/fr-16-redesign-sign-in-policy-list/report-20261125185103/e2e-20261125185103.html`: **51 passed, 6 failed, 6 platform skips** on the shared Neon database. The FR-16 scenarios passed. One FR-03 failure was an ambiguous `Arisa K.` locator and is fixed with an exact match; its focused rerun passed. Three FR-12 failures match the previously documented shared-data history failure from six older approved payloads. Two FR-14 Windows visual baselines differ from current Chromium output; after scoping the CSS away from policy detail, the desktop diff fell to 695 pixels, while the 320px screenshot still differs in text rendering and by 2px height. No FR-14 baseline was updated. Fresh CI database verification remains the full-suite gate.

### Updated criterion coverage, 2026-11-25

| Criterion | Evidence | Status |
| --- | --- | --- |
| Sign-in success, blank/invalid/unavailable error, focus, ended session | `SignInForm.test.tsx`; FR-01 and FR-16 browser cases, including service failure at 320px | Verified at component and browser seams |
| Owned active/expired policy rows and navigation | `PolicyList.test.tsx`, `page.test.tsx`; FR-16 1280/320 browser cases; existing expired-detail case | Verified |
| Loading, empty, error/retry, session end, and narrow layout | FR-16 320px browser cases and four reviewed visual baselines | Verified on Windows Chromium |
| Owner-only list and non-disclosing foreign/unknown detail | FR-16 `api-boundaries.spec.ts`; existing FR-01/03 browser/API cases | Verified against the supplied synthetic database |

The first browser attempt failed because the API lacked `DATABASE_URL`; after the credential was supplied, the focused criterion coverage above passed. The shared database does not provide a clean full-suite result; CI uses a fresh synthetic PostgreSQL service.

## Plan Change Log

## Review Triage Log

| Finding | Verdict and evidence | Route |
| --- | --- | --- |
| Obsolete macOS sign-in and list snapshots | Medium: those two screens changed, so their earlier zero-tolerance comparisons would fail on macOS. Removed only those comparisons; retained the policy detail and request form checks. Scoped new status-pill styling to the list so other screens keep their prior appearance. | Patch |
| CI does not compare FR-16 pixels | Low: FR-16 baselines were reviewed on Windows, while ticket CI runs on Linux and skips their pixel comparisons. Linux exercises browser behavior, 320px overflow, and owner boundary; local Windows supplies the required pixel comparison. A reviewed Linux baseline would be needed for a CI pixel comparison, which this ticket does not require. | Accepted verification limit |

## Verification

**Commands:**
- Focused Vitest after each red/green slice; expected failure before code and pass after.
- `npm run test -w apps/web` — web component suite passes.
- `npm run typecheck` and `npm run format:check` — clean types and formatting.
- `npm run build` — production web build passes.
- `npm run test:e2e` — browser report under `test-results/fr-16-redesign-sign-in-and-policy-list/`; criterion mapping and captures recorded here.
- `git diff --check` — no whitespace errors.
