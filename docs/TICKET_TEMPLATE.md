# Ticket requirement template

Use this file to draft one requirement in `docs/backlog/` or `docs/tickets/`, following [TICKETING.md](TICKETING.md). The local file is the detailed requirements source. Keep the PRD at the business level; put feature IDs, ticket-specific behavior, business rules, data contracts, edge cases, and acceptance criteria here. Link the PRD for product context and any relevant UX or architecture documents.

Name backlog and implementation files by feature ID, for example `docs/backlog/fr-02-create-endorsement-request.md` and `docs/tickets/fr-01-authenticate-customers.md`. Keep the FR ID when moving a draft; the build order in [backlog/README.md](backlog/README.md) and GitHub Issue number are separate. Link the Issue and local file in both directions; `npm run ticket:create` displays the complete ticket Markdown in the Issue and `npm run ticket:sync` refreshes it after ticket changes merge. GitHub tracks status, ownership, discussion, Definition of Done, and Progress & Handover. Use native sub-issues and blocking dependencies where available; see `.agents/skills/setup-matt-pocock-skills/issue-tracker-github.md`.

Choose **one** body below for the local file. Use `##` headings in the ticket; the examples use `###` only to nest them here. Keep draft criteria and unresolved decisions explicit until refinement. Replace prompts and remove unused optional detail. After moving it into `docs/tickets/`, commit it in a ticket/UX PR with the Issue pending. After that PR merges, run `npm run ticket:create -- docs/tickets/<file>.md` to create or reuse the Issue and add the link while automation is disabled. Add the matching type label and at least one relevant role label after creation. Apply `needs:human-review` only while a human decision is pending. Record accepted scope decisions in this file before a build.

## Story body (`story.yml`)

**Title:** `[Story] [short outcome-focused title]`
**Labels:** `type:story`, `[role:...]`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-[number]
**Product context:** [PRD](../PRD.md)
**Risk:** [Low / Medium / High — reason]
**State:** Backlog draft

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

### Accepted decisions and readiness

[Dated decisions from Issue discussion that change the build; N/A if none. State whether dependencies and UX handoff are ready.]

### UX handoff references

[DESIGN.md, EXPERIENCE.md, and browser-viewable mockup paths for UI work; N/A otherwise.]

### Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers

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

[Copy the Definition of Done section from the story body.]

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

[Copy the Definition of Done section from the story body.]

Update **Progress & Handover** in the Issue before stopping or transferring work. Use `Not Started`, `In Progress`, `Blocked`, `In Review`, or `Done`; link evidence and date the update. Completing implementation does not itself record human approval.
