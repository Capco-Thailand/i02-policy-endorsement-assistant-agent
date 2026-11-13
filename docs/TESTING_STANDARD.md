# Testing standard

QA/Sec works across the API, web app, and data/RAG code. Use synthetic policies, rules, requests, and rating data only. Tie each test case to a goal, workflow step, safety boundary, or success measure in [PRD.md](PRD.md), and record the expected state, tool calls, and audit result.

## Test-driven development
For behavior-changing work, choose the public interfaces to test during planning and confirm those seams with the requester before writing tests. State what each seam can and cannot prove. Map the selected acceptance criterion to an observable result at that seam; prefer a known expected value from the requirement over one calculated by the implementation.

Work in small vertical slices. Write one focused test first, run it, and confirm it fails because the required behavior is missing rather than because the test setup is broken. Implement only what makes that test pass, run it again, then take the next slice. Do not write a whole suite of speculative tests before implementation. Keep tests independent of private methods and internal collaborators; mock external boundaries such as an API, clock, or filesystem only when needed. Perform broader refactoring and rerun the affected tests during review, after the red-to-green implementation cycles.

Record the test name and red/green commands or results in the implementation handoff. A test added after its implementation does not count as test-first evidence. Documentation, formatting, and other changes without observable behavior may use relevant checks without a red test.

## Coverage

- Test deterministic rule selection, required fields, eligibility, authorization, quote inputs, and draft gates at the unit or component level.
- Test Fastify endpoints and their Swagger/OpenAPI contracts for valid input, rejected input, authorization failures, and mock-tool errors.
- Test web screens for missing-data prompts, rule citations, unchanged mock quote amounts, the proposed updated-policy view, visible non-binding `PENDING_APPROVAL` status, customer decision, and history record.
- Test the full request-to-draft flow with mock services. Ineligible, unsupported, or unauthorized requests must not call `quote_endorsement` or `create_endorsement_draft`, except a referral-only draft explicitly allowed by a test policy.
- Include adversarial cases: prompt injection in requests or rules, conflicting rules, ambiguous dates, contradictory policy data, repeated submission, quote failures, and attempts to bind coverage.

Keep component tests beside the code they cover. When a shared flow spans apps, keep one labeled scenario and its synthetic fixtures reusable across the relevant tests. Verify the audit trail contains request ID, cited rule versions, validation outcome, tool calls, and final status without unnecessary personal data.

## Acceptance criteria traceability
For each ticket, use its current acceptance criteria as the source for test planning. Before implementation, break each criterion into observable success, rejection, and boundary cases as applicable. Give each case a stable reference to the ticket and criterion; use the criterion's ID when it has one, otherwise a short identifying phrase that remains clear if bullets are reordered. Include that reference in the test name or in a nearby test comment. Build the mapping as each red-to-green slice lands.

Maintain a traceability record with the ticket that contains, for every criterion: its reference, test file and scenario or manual check, verification layer (unit, component, API, integration, or browser), expected result, latest run result, and any uncovered behavior. Link to evidence rather than treating a test filename or a planned test as proof of a pass. Mark a criterion verified only when every part of it has applicable evidence and the relevant checks have passed.

Choose the layer that can prove the claim: a mocked component test proves UI behavior under the simulated response, while an API test proves the server contract. Use an integration or browser check when the criterion spans those boundaries. If a dependent endpoint or workflow does not exist yet, record the missing integration check and its owning ticket; do not mark the original criterion fully verified from a guard or mock alone. Revisit the mapping whenever requirements, routes, UI behavior, or shared authorization rules change.

## Reporting

For evaluation runs, report fixture or dataset version, sample count, pass count, percentage, and failures for each PRD measure. Do not claim a target passed from a percentage alone when its sample size or failed cases are missing.

## Evaluation protocol

Use a versioned synthetic evaluation set fixed before each run. Cover all four change types with at least 20 cases each for intent classification, policy retrieval, rule retrieval, and eligibility (at least 80 cases per measure). Include eligible, ineligible, expired-policy, missing-rule, conflicting-rule, and unauthorized cases. Cover each mock eKYC outcome (`VERIFIED`, `FAILED`, `REVIEW_REQUIRED`) with at least 20 cases (at least 60 total). Evaluate document bypass, draft completeness, and quote agreement on every applicable case. Include sign-in, sign-out, session expiry, cross-account access, approval of the customer's own proposal, blocked cross-account decisions, history visibility, duplicate submission, and attempted binding in the safety set; every unauthorized action and binding attempt must be blocked.

For each measure, report the fixture version, denominator, passing count, percentage, and failed case IDs. Record a baseline on the first run; no baseline is claimed in this PRD. Also report false referrals of eligible requests, incorrect successful drafts, and retrieval failures by change type as counter-metrics, with counts and denominators. Investigate any increase from the baseline before declaring the MVP ready. A percentage alone, or a result below the minimum sample size, does not satisfy a release target.

Test sign-in, sign-out, expired/invalid sessions, cross-account policy access, customer approval of their own proposal, blocked cross-account approval, approved-change history visibility, unchanged underlying policy data after a decision, active/expired policies, successful/failed mock eKYC, document bypass, unavailable/conflicting RAG evidence, premium changes and zero-delta quotes, duplicate submissions, and tool failure handling.
