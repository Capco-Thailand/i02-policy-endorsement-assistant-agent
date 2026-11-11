# Ticket requirement template

Use this file to draft one requirement in `docs/backlog/` or `docs/tickets/`, following [TICKETING.md](TICKETING.md). The local file is the detailed requirements source. Keep the PRD at the business level; put feature IDs, ticket-specific behavior, business rules, data contracts, edge cases, and acceptance criteria here. Link the PRD for product context and any relevant UX or architecture documents.

Start implementation filenames with `fr-` and number them by build order, for example `docs/tickets/fr-1-authenticate-staff.md`. The ticket's feature ID and GitHub Issue number are separate identifiers and may differ from the local number. A backlog draft may use its feature ID until it is selected and numbered. Link the Issue and local file in both directions. GitHub tracks status, ownership, discussion, Definition of Done, and Progress & Handover. Use native sub-issues and blocking dependencies where available; see `.agents/skills/setup-matt-pocock-skills/issue-tracker-github.md`.

Choose **one** body below for the local file. Replace prompts and remove unused optional detail. Use the matching form in `.github/ISSUE_TEMPLATE/` when creating the tracking Issue; its body should summarize the outcome, link this file and PRD product context, and carry the current handover. Add the matching type label and at least one relevant `role:product`, `role:design`, `role:qa`, or `role:dev` label. Apply `needs:human-review` only while a human decision is pending.

## Story body (`story.yml`)

**Title:** `[Story] [short outcome-focused title]`
**Labels:** `type:story`, `[role:...]`

### Summary and objective

[What outcome should this story deliver? State its feature ID, if assigned, and link the PRD for product context.]

### User story or requirement

As a [user or role], I want [capability], so that [benefit].

[Use a system requirement when a user story does not fit.]

### Business or technical context

[Why this is needed; relevant PRD, decision, UX, and API links; applicable synthetic-data and human-review boundaries. Use N/A if none.]

[Add ticket-specific business rules or data contracts here when needed. State each rule in testable terms, including exceptions and source. Do not duplicate broad PRD text.]

### Acceptance criteria

- [ ] [Observable success outcome and its conditions.]
- [ ] [Relevant error, empty, authorization, or edge-case outcome.]
- [ ] [Required safety behavior: no unintended quote, draft, policy write, or binding where applicable.]

### Scope and out of scope

In scope:
- [Required behavior and boundaries.]

Out of scope:
- [Explicit exclusions.]

### Dependencies

[Prerequisite Issues or decisions, or None. Add native blocking dependencies in GitHub where available.]

### Related subtasks

[Subtask Issues or None. Add native sub-issues in GitHub where available.]

### Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers

### Progress & Handover

- **Status:** Not Started
- **Completed:** N/A
- **Remaining:** N/A
- **Branch:** N/A
- **PR:** N/A
- **Latest Test/CI Result:** N/A
- **Blockers:** N/A
- **Dependencies:** N/A
- **Next Action:** N/A
- **Context Links:** N/A
- **Last Updated:** N/A

## Bug body (`bug.yml`)

**Title:** `[Bug] [short failure summary]`
**Labels:** `type:bug`, `[role:...]`

### Bug summary

[What fails, and where? Link the affected ticket or Issue and the PRD for product context.]

### Severity

[Critical / High / Medium / Low / Unknown]

### Steps to reproduce

1. [Prerequisite and synthetic input.]
2. [Action.]
3. [Observed result.]

[Explain why reproduction is unavailable if needed.]

### Expected vs. actual behavior

Expected: [Expected behavior.]
Actual: [Observed behavior.]

### Environment

[Relevant version, platform, or configuration; N/A if unknown.]

### Evidence and logs

[Link screenshots, logs, or test output. Redact secrets and personal data.]

### Related Issues or PRs

[Links or N/A.]

### Verification criteria

- [ ] [How to confirm the fix.]
- [ ] [Relevant regression and safety checks.]

[Copy the Definition of Done and Progress & Handover sections from the story body.]

## Subtask body (`subtask.yml`)

**Title:** `[Subtask] [short bounded outcome]`
**Labels:** `type:subtask`, `[role:...]`

### Parent Issue

[#123 or full Issue URL. Add this as a native sub-issue where available.]

### Objective

[What outcome should this subtask deliver?]

### Implementation scope

[Bounded work and exclusions; link relevant parent acceptance criteria.]

### Acceptance criteria

- [ ] [Observable result and conditions.]
- [ ] [Relevant failure or safety behavior.]

### Dependencies

[Prerequisite Issues or decisions, or None. Add native blocking dependencies where available.]

### Relevant files or components

[Paths or links when known; N/A otherwise.]

### Test requirements

[Applicable checks and expected evidence; N/A if none.]

[Copy the Definition of Done and Progress & Handover sections from the story body.]

Update **Progress & Handover** in the Issue before stopping or transferring work. Use `Not Started`, `In Progress`, `Blocked`, `In Review`, or `Done`; link evidence and date the update. Completing implementation does not itself record human approval.
