# FR-18 criterion traceability

Run date: 2026-11-25 (Asia/Bangkok). Browser: Chromium on Windows. Baseline commit: `03954f58b8a1b4c9a7459185625ef12d0c9ccc88`; the local report was produced from the FR-18 worktree before commit.

Evidence: [dated local HTML report](../../test-results/fr-18-redesign-decision-history/report-20261125211715/e2e-20261125211715.html) (local ignored artifact). The full browser suite had 62 passes, four platform skips, and three failures. Four of five FR-18 scenarios passed, including both 1280px and 320px reviewed visual comparisons. The real approved-history scenario failed because `/api/history` returned 503 on the shared synthetic Neon database after approval and rejection succeeded. Two FR-16 policy-list visual baselines also differ locally; neither is changed by FR-18. A fresh CI database must settle the real FR-18 flow before completion.

After review patches, the [targeted owner-flow report](../../test-results/fr-18-redesign-decision-history/report-20261125212324/e2e-20261125212324.html) still shows the same shared-database 503. The [final no-update visual report](../../test-results/fr-18-redesign-decision-history/report-20261125212531/e2e-20261125212531.html) passes both FR-18 baselines after restoring mobile DOM/visual reading order. Root `npm test` passed: script 17/17, API 65 passed with 49 dedicated-database cases skipped, calculator 10/10, web 63/63. Root typecheck and format check passed.

| Ticket criterion | Test seam and expected result | Local result / remaining check |
| --- | --- | --- |
| Approved records, rejection exclusion, policy/request identity, exact proposal | `e2e/history.spec.ts` real owner flow plus `ChangeHistory.test.tsx` approved identity and safe-summary tests. Rows show date, policy, request ID, Approved, exact links; rejected proposal absent. | Component passed; real browser flow blocked by shared DB 503. CI fresh-database browser result required. |
| Non-binding meaning and text status | Component boundary/order and approved-label tests; real browser flow. | Component passed; visual baselines passed. Real flow pending CI. |
| Concise overview without full address or beneficiary detail | Component safe-summary test for all four change types; real browser asserts requested addresses absent. | Component passed; real browser pending CI. |
| Loading, empty, error, ended session, multiple records, 320px, keyboard | Component loading/empty/error/ended tests and browser failure, signed-out/empty, 1280px/320px visual tests. | Component 6/6; four browser scenarios passed. Multiple real records pending CI. |
| Accepted UX references | Ticket, final DESIGN/EXPERIENCE spines, mockup, desktop/320px captures and reviewed browser baselines. | Linked and visually checked. |
| Synthetic approval/rejection, owner boundary, unchanged policy | `e2e/history.spec.ts` real API and UI flow checks latest and earlier proposals, foreign history/detail access, and policy record equality. | Decisions completed locally but history returned 503 before later assertions. CI fresh-database browser result required. |

Red/green implementation evidence: `ChangeHistory.test.tsx` safe summaries/request IDs 2/3 to 3/3; boundary/empty 3/4 to 4/4; approved identity/link 4/5 to 5/5; loading/ended session 5/6 to 6/6. Final component 6/6, root typecheck, and format check passed. The production web build passed before the browser suite.
