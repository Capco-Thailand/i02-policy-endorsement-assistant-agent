# FR-20 — Fix history data fetch

**Title:** [Bug] FR-20 Customer change history cannot fetch data
**Feature ID:** FR-20
**Labels:** `type:bug`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/170
**Product context:** [PRD](../PRD.md)
**State:** Selected; reproduced and fix in review

## Bug summary

The customer reports that history data cannot be fetched from the Customer change history screen. This affects the approved-decision history introduced by [FR-12](../tickets/fr-12-record-activity-audit-history.md) and presented by [FR-18](../tickets/fr-18-redesign-decision-history.md). Source: customer report, 2026-11-26. The exact failure response and root cause have not yet been captured.

## Severity

Medium â€” customers cannot review their approved decision records when this occurs; scope and frequency are not yet known.

## Steps to reproduce

1. Sign in with a synthetic demo account that has an approved proposal in history.
2. Open Customer change history from the Policies screen.
3. Observe whether records load or the page shows â€œHistory unavailableâ€ / â€œSession endedâ€. Capture the status and redacted response for `GET /api/history`.

Reproduced on 2026-11-26 with the synthetic `narin` account: sign-in returned `200`; authenticated `GET /api/history` returned `503` before the fix.

## Expected vs. actual behavior

Expected: An authorized customer sees only their approved proposal records, or a clear empty state when none exist. Retry recovers from a transient failure.

Actual: The API returned `503 HISTORY_UNAVAILABLE` because historical approved proposal payloads without `current.label` caused a repository `TypeError`. After the first fallback, the response failed serialization because the same six rows also lacked `requestedChange` and their linked request payloads contained only an ID. The final fix retains those six decisions with an explicit unavailable-details state.

The first diagnostic check should distinguish an expired session (`401`), a successful empty history (`200` with an empty array), and a service failure. Do not treat an empty history as a fetch failure.

## Environment

Local prototype with Next.js web app, Fastify API, and synthetic PostgreSQL data. Affected deployment and browser are unconfirmed.

## Evidence and logs

The web UI uses `useHistory()` → `getHistory()` → `GET /api/history`; the API route is session scoped. The synthetic database has 56 approved rows, including six incomplete historical fixtures. The server derives a missing policy label from the owner-scoped policy row, uses a complete linked request payload when available, and returns an approved entry without change details when no complete request exists. No stored row is deleted or rewritten. A live authenticated check returned `200` with all 56 entries after the fix; six have unavailable change details. No session cookie or database credential is included here.

## Related Issues or PRs

FR-12 and FR-18 tickets above. Active tracking Issue: [#170](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/170).

## Accepted decisions and readiness

- 2026-11-26: Customer invoked `bmad do fr-20`, selecting this bug for delivery. Reproduce the reported failure before assigning a cause or changing implementation.
- Ticket/UX PR #169 and reciprocal link PR #171 merged; Issue #170 is open.

## UX handoff references

Use the existing [FR-18 experience](../../_bmad-output/initiative-customer-ui-redesign/ux-fr-18/EXPERIENCE.md) and [history mockup](../../design/page/fr-18-history.html). This bug does not propose a new layout.

## Verification criteria

- [ ] Reproduce the reported fetch failure with a focused, repeatable check and capture the failing response without secrets.
- [ ] Fix the cause at the appropriate API, session, database, or client boundary; a signed-in customer with approved records loads them successfully.
- [ ] An account with no approved records receives the empty state; a session failure receives the session-ended state; a transient service failure offers a working retry.
- [ ] Verify cross-account isolation: no customer can fetch another account's history.
- [ ] Add regression coverage at the boundary that reproduced the failure.

## Acceptance criteria

- [ ] An authenticated customer loads all of their approved history, including legacy entries with incomplete change details, with readable policy labels and no other customer's records.
- [ ] Empty history, session failure, and transient service failure remain distinguishable and actionable.

## Verification traceability

| Criterion | Evidence | Result |
| --- | --- | --- |
| Reproduce fetch failure | Synthetic sign-in `200`, then `GET /api/history` `503`; API log showed missing `current.label` | Confirmed before fix |
| Load approved history | Focused `apps/api/src/history.test.ts`; live synthetic sign-in `200` and history `200` with all 56 entries | Passed after fix |
| Empty, session, and retry states | `ChangeHistory.test.tsx` 7/7 passed; history OpenAPI contract 1/1 passed | Component behavior passed; API integration pending disposable `TEST_DATABASE_URL` |
| Cross-account isolation | Owner joins in repository query; `history.integration.test.ts` | API integration skipped without disposable `TEST_DATABASE_URL` |
| Regression coverage | `npm run test -w apps/api -- history.test.ts`; `npm run test -w apps/web -- ChangeHistory.test.tsx` | Passed |

The six incomplete historical fixtures remain in storage and appear with policy, request, decision date, and approval status. The UI labels their missing change details without inventing values and does not offer a proposal detail link that cannot render.

## Definition of Done

- [ ] Verification criteria satisfied
- [ ] Relevant documentation updated
- [ ] Code review and CI checks passed, if applicable
- [ ] Related Issue and PR linked after selection
- [ ] Progress and handover updated
- [ ] No unresolved blockers
