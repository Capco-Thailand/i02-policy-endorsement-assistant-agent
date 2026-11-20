---
title: 'FR-07 Show FR-05 Cited Document Guidance'
type: feature
ticket: ''
created: '2026-11-20'
status: built
baseline_revision: '6a791c544f30ef12280fd89093fa7c8e5e303911'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/fr-07-bypass-document-verification-mock.md
  - _bmad-output/initiative-customer-authentication/ux-mock-document-upload/DESIGN.md
  - _bmad-output/initiative-customer-authentication/ux-mock-document-upload/EXPERIENCE.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - docs/DESIGN_STANDARD.md
  - docs/VISUAL_UX_CONSTRAINTS.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-07's upload page still shows a fixed example even though FR-05 now returns cited, date-specific document guidance.

**Approach:** Fetch FR-05 rules for the recorded request's policy, change type, and effective date, then show the guidance section and its citation beside the existing mock upload flow.

## Boundaries & Constraints

**Always:** Distinguish cited `DOCUMENT` from cited `NONE`; show missing, conflicting, and service failure as unresolved. Keep upload receipt and guidance independent, and state that uploaded content is not verified.

**Never:** Fall back to a fixture after FR-05 is available, infer a document requirement from a rule-only citation, use guidance to judge the uploaded file, request real identity/health records, or claim that upload changes coverage.

## I/O & Edge-Case Matrix

| State | Observable result |
| --- | --- |
| `AVAILABLE` with `DOCUMENT` | Show cited document guidance and source/version/section; mock upload remains available |
| `AVAILABLE` with `NONE` | Show cited no-document guidance; mock upload remains a demonstration step |
| `MISSING`, `CONFLICTING`, or failed retrieval | Explain unresolved guidance without fixture text or a verified-requirement claim |
| Session ends or policy becomes unavailable | Follow existing sign-in/unavailable handling; do not show another customer's guidance |

</frozen-after-approval>

## Code Map

- `apps/web/src/endorsement/RequestForm.tsx`: after request creation, passes `saved.changeType`; also pass `saved.requestedEffectiveDate` to the upload section. Keep the existing request and upload states.
- `apps/web/src/endorsement/DocumentUpload.tsx`: replace the hard-coded `guidance` map with a query-backed guidance display. Reuse the section's file picker, result, warning, and `aria-live` behavior; React escapes source text.
- `apps/web/src/lib/api.ts` and `queries.ts`: use generated `api-types.ts` for the FR-05 GET response/query, existing credentialed fetch and TanStack Query patterns; do not change the Fastify rules API.
- `apps/web/src/endorsement/RequestForm.test.tsx` and focused component tests: mock the rules query and prove rendered citations, unresolved states, and upload independence.
- `docs/API_DEVELOPMENT.md` and FR-07 ticket: replace the pending-fixture description with the delivered integration. Issue #87 was closed after the earlier upload slice; reopen that same Issue for its pending FR-05 integration and close it through the follow-up implementation PR. `ticket:preflight` rejects a repeated initial build because prior implementation PRs merged.

## Tasks & Acceptance

**Execution:**

- [x] Add component tests for dated FR-05 query inputs, `DOCUMENT`/`NONE` citations, unresolved/error states, accessible status, and upload remaining independent; run red.
- [x] Add typed GET client/query keyed by policy, change, and date. Pass the recorded request date and render only `GUIDANCE` citations when `AVAILABLE`.
- [x] Handle 401 by existing sign-in behavior, 404 as unavailable, and 503 as service failure. Preserve the mock receipt disclaimer and retry path.
- [ ] Update FR-07 ticket state and API development documentation, refresh and reopen Issue #87, then run full web tests, typecheck, format, build, and browser E2E. Use the existing Issue for the follow-up PR.

**Acceptance Criteria:**

- Given an owned recorded request, when FR-05 returns cited `DOCUMENT` or `NONE` guidance for its effective date, then the page shows the guidance and source/version/section without a fixture label.
- Given unresolved or failed retrieval, when the page loads, then it says guidance is unresolved and never presents an uncited requirement as verified.
- Given any guidance state, when a synthetic file is selected and uploaded, then the existing mock receipt flow works and explains that content and suitability were not checked.
- Given a lost session or inaccessible policy, when the rules request fails, then the page follows sign-in or unavailable handling without displaying protected guidance.

## Implementation Notes

API client test failed with `getRules is not a function`, then passed after adding the typed GET. Component test failed because the rules hook was unused, then passed after rendering query-backed guidance. Matrix audit: `DocumentUpload.test.tsx` covers all four matrix rows; Chromium covers real `DOCUMENT`, `NONE`, and simulated 503 states. All covering tests ran without skips.

## Plan Change Log

## Review Triage Log

| Verdict | Route | Evidence |
| --- | --- | --- |
| medium | patch | `DocumentUpload.tsx` could render cached `AVAILABLE` citations while `useRules` reports a failed refetch, because TanStack Query retains prior data on error. Citations are now suppressed on error; the focused red/green test and full verification passed. |

## Design Notes

Only the guidance text and its status inside the existing upload section change. No new page or wrapper component is needed. Display citation metadata as text, not an external link; the source is a synthetic corpus entry. Keep `NONE` explicit even though the demo upload control remains available.

## Verification
Web tests 38/38, typecheck, format check, build, and Chromium E2E 23/23 passed on 2026-11-20 using disposable `pea_fr07_guidance_test`. Latest local report: `test-results/fr-07-fr-05-guidance/report-20261120104910/e2e-20261120104910.html`. The review fix was rerun through all checks.


**Commands:**

- `npm run test -w apps/web`
- `npm run typecheck`
- `npm run format:check`
- `npm run build`
- `npm run test:e2e`

**Manual checks (if no CLI):**

- At desktop and narrow width, inspect the saved request upload section for readable citations, unresolved text, keyboard access, and the unchanged mock receipt warning.
