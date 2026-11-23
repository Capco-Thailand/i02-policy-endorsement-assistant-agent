# FR-12 — Customer Change History & Audit

**Title:** [Story] Customer Change History & Audit
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-12
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed Medium — missing audit evidence could prevent a decision from being explained.
**State:** Backlog draft

## Summary and objective

Log access, cited policy and rule sources, preliminary assessment outcomes and reasons, calculation calls when needed, proposal creation, and customer decisions. Show each customer the approved changes to their own synthetic policies in a history page.

## User story or requirement

System requirement: Log cited sources and versions, assessment outcomes and reasons, any calculation, proposal creation, and customer decisions; show approved change records in the owning customer's history page.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Audit authenticated actor and action, policy access, cited policy and rule sources and versions, `CAN_PROCEED`/`CANNOT_PROCEED`/`NEEDS_REVIEW` outcomes and reasons, calculation calls and results when used, proposal creation, and customer decisions. FR-07 upload events remain separate from this endorsement audit flow.
- [ ] After approval, the owning customer can see the proposed change, approval decision, and time in their history page; another customer cannot access the record.
- [ ] Exclude credentials, session secrets, and unnecessary personal data.

## Scope and out of scope

In scope:
- The behavior in the draft criteria above, using synthetic data.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Further exclusions to confirm during refinement.

## Dependencies
- The [Neon migration ticket](../tickets/chore-migrate-persistence-to-neon.md) persists the existing API audit events. FR-12 extends that audit trail for later workflow stages and customer history without a separate process-local store.

- Determine prerequisites and sequencing with the Product Owner.

## Related subtasks

None identified; confirm during refinement.

## Accepted decisions and readiness
- 2026-11-18: Audit mock upload receipt in place of FR-06 and bypass outcomes for the MVP workflow.
- 2026-11-23: Audit the preliminary assessment and its reasons; calculation events are conditional. FR-07 upload events are outside this endorsement flow.

- 2026-11-12: Customer approval adds the proposed change to that customer's history page with no further processing.
- Open question: Confirm precise inputs, error cases, dependencies, and any UX handoff before implementation.
- Status: Backlog draft; not ready for implementation or Issue creation.

## UX handoff references

- Not yet identified; add design documents and browser-viewable mockups if this ticket includes UI.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
