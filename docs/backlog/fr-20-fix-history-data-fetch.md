# FR-20 — Fix history data fetch

**Title:** [Bug] FR-20 Customer change history cannot fetch data
**Feature ID:** FR-20
**Labels:** `type:bug`, `role:dev`
**GitHub Issue:** Not filed
**Product context:** [PRD](../PRD.md)
**State:** Backlog draft; reproduction details pending

## Bug summary

The customer reports that history data cannot be fetched from the Customer change history screen. This affects the approved-decision history introduced by [FR-12](../tickets/fr-12-record-activity-audit-history.md) and presented by [FR-18](../tickets/fr-18-redesign-decision-history.md). Source: customer report, 2026-11-26. The exact failure response and root cause have not yet been captured.

## Severity

Medium â€” customers cannot review their approved decision records when this occurs; scope and frequency are not yet known.

## Steps to reproduce

1. Sign in with a synthetic demo account that has an approved proposal in history.
2. Open Customer change history from the Policies screen.
3. Observe whether records load or the page shows â€œHistory unavailableâ€ / â€œSession endedâ€. Capture the status and redacted response for `GET /api/history`.

Reproduction is pending; the report did not include the account, browser, timestamp, or network response.

## Expected vs. actual behavior

Expected: An authorized customer sees only their approved proposal records, or a clear empty state when none exist. Retry recovers from a transient failure.

Actual: Customer reports history data cannot be fetched. The exact UI state and HTTP failure are not yet established.

## Environment

Local prototype with Next.js web app, Fastify API, and synthetic PostgreSQL data. Affected deployment and browser are unconfirmed.

## Evidence and logs

Customer report only. The web UI uses `useHistory()` → `getHistory()` → `GET /api/history`; the API route is session scoped. Capture a redacted failing request/response and relevant API log before assigning a cause. Do not include session cookies or database credentials.

## Related Issues or PRs

FR-12 and FR-18 tickets above. GitHub Issue for this bug is pending backlog selection.

## Verification criteria

- [ ] Reproduce the reported fetch failure with a focused, repeatable check and capture the failing response without secrets.
- [ ] Fix the cause at the appropriate API, session, database, or client boundary; a signed-in customer with approved records loads them successfully.
- [ ] An account with no approved records receives the empty state; a session failure receives the session-ended state; a transient service failure offers a working retry.
- [ ] Verify cross-account isolation: no customer can fetch another account's history.
- [ ] Add regression coverage at the boundary that reproduced the failure.

## Definition of Done

- [ ] Verification criteria satisfied
- [ ] Relevant documentation updated
- [ ] Code review and CI checks passed, if applicable
- [ ] Related Issue and PR linked after selection
- [ ] Progress and handover updated
- [ ] No unresolved blockers
