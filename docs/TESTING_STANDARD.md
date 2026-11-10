# Testing standard

QA/Sec works across the API, web app, and data/RAG code. Use synthetic policies, rules, requests, and rating data only. Tie each test case to a goal, workflow step, safety boundary, or success measure in [PRD.md](PRD.md), and record the expected state, tool calls, and audit result.

## Coverage

- Test deterministic rule selection, required fields, eligibility, authorization, quote inputs, and draft gates at the unit or component level.
- Test Fastify endpoints and their Swagger/OpenAPI contracts for valid input, rejected input, authorization failures, and mock-tool errors.
- Test web screens for missing-data prompts, rule citations, unchanged mock quote amounts, and the visible non-binding `PENDING_APPROVAL` status.
- Test the full request-to-draft flow with mock services. Ineligible, unsupported, or unauthorized requests must not call `quote_endorsement` or `create_endorsement_draft`, except a referral-only draft explicitly allowed by a test policy.
- Include adversarial cases: prompt injection in requests or rules, conflicting rules, ambiguous dates, contradictory policy data, repeated submission, quote failures, and attempts to bind coverage.

Keep component tests beside the code they cover. When a shared flow spans apps, keep one labeled scenario and its synthetic fixtures reusable across the relevant tests. Verify the audit trail contains request ID, cited rule versions, validation outcome, tool calls, and final status without unnecessary personal data.

## Reporting

For evaluation runs, report fixture or dataset version, sample count, pass count, percentage, and failures for each PRD measure. Do not claim a target passed from a percentage alone when its sample size or failed cases are missing.
