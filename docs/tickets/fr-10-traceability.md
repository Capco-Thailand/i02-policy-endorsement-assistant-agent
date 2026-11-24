# FR-10 verification traceability

The ticket criteria are in [FR-10](fr-10-create-draft-endorsement-for-human-approval.md). Synthetic fixtures only.

| Criterion | Evidence | Layer | Result | Remaining check |
| --- | --- | --- | --- | --- |
| Owned active request and fresh positive assessment | `apps/api/src/proposal.test.ts`: session, ownership, blocked assessment, expired and ineligible retries; `e2e/proposal.spec.ts`: eligible owner | API/browser | Pass locally | No uncovered behavior |
| Unchanged and calculated impact, calculator failure | `apps/api/src/proposal.test.ts`: unchanged and one-assessment calculation; `apps/api/src/quote.integration.test.ts`: exact quote and failure; `e2e/proposal.spec.ts`: unchanged and calculated views | API/integration/browser | Pass locally; PostgreSQL integration 8/8 and FR-10 browser 2/2 | No uncovered behavior |
| One non-binding draft, citations, retry | `apps/api/src/proposal.test.ts`: one draft and unchanged snapshot; `apps/api/src/quote.integration.test.ts`: exact quote and audit | API/integration | Pass locally and on disposable PostgreSQL | Browser does not directly observe duplicate prevention; API verifies it |
| Pending review, comparison, citations and notice | `apps/web/src/endorsement/ProposalReview.test.tsx`; `apps/api/src/proposal.test.ts`: presentation; `e2e/proposal.spec.ts`: desktop and narrow view with reviewed visual baselines | Component/API/browser | Pass locally; 45 web tests and FR-10 browser 4/4 | No uncovered behavior |
| Missing/foreign/session/storage boundaries | `apps/api/src/proposal.test.ts`; `e2e/proposal.spec.ts`: signed-out review | API/browser | Pass locally | Foreign and storage boundaries are API-only checks |
| Audit and no policy mutation | `apps/api/src/quote.integration.test.ts` | Integration | PostgreSQL integration 8/8 passed on disposable test database | Browser cannot directly inspect database audit and policy state |

Browser report: `test-results/fr-10-create-draft-endorsement-for-human-approval/report-20261124113736/e2e-20261124113736.html` (24 November 2026, Asia/Bangkok, Chromium, four FR-10 scenarios passed: two functional, two visual). The visual scenarios attach the reviewed baseline and current image at desktop and 375px. A full local E2E run passed 32 scenarios but failed two new locator assertions, since corrected and passed, and two existing FR-01/FR-03/FR-02 visual baselines. The added proposal CSS is scoped to `.proposal-*`; those existing screens are unchanged by FR-10. The first Linux CI run passed 34 browser cases and exposed two FR-08 visual baselines that needed the new proposal action; the 1280px and 375px baseline images were updated from that run's current screenshots after visual inspection.
