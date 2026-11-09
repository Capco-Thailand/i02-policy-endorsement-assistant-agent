# [TICKET-ID]: [Short, outcome-focused title]

**Type:** [User Story / Bug / Task / Spike]  
**Priority:** [P0 - Critical / P1 - High / P2 - Medium / P3 - Low]  
**Version:** [1.0]  
**Status:** [Draft for review / Ready / In Progress / Done]  
**Scope:** [Frontend / Backend / Database / AI / QA / Infra; include only relevant areas]

## User story

As a **[user or role]**, I want [capability], so that [benefit].

<!-- For bugs/tasks, replace this with a concise problem statement and desired outcome. -->

## Background and boundary

[Explain why this work is needed, relevant product context, assumptions, and constraints. Link the relevant PRD or design document. State safety/data boundaries that apply.]

## Scope

1. [User-visible or system behavior to implement.]
2. [Relevant API, data, or integration behavior.]
3. [Error, empty, or edge-case behavior.]
4. [Documentation or automated coverage required.]

## Data requirements

| Field | Type | Description |
|---|---|---|
| `[field_name]` | [type] | [meaning, constraints, and whether required/nullable] |

[Describe nested objects, enums, validation, and example values if useful. Remove this section if the ticket has no data contract.]

## Business rules

### BR-001: [Rule name]

- [State the rule in clear, testable terms.]
- [Include authority/source of truth and relevant exceptions.]

### BR-002: [Rule name]

- [Add more rules as needed; remove unused placeholders.]

## Acceptance criteria

### AC-1: [Observable outcome]

**Given** [initial context]  
**When** [action or event]  
**Then** [observable result]  
**And** [additional required result].

### AC-2: [Failure, authorization, or edge case]

**Given** [initial context]  
**When** [action or event]  
**Then** [expected safe behavior].

### AC-3: Automated coverage

Tests cover [important success paths, failures, edge cases, authorization, and safety gates]. Rejected operations must not perform unintended side effects.

## Out of scope

- [Explicit exclusions to prevent scope ambiguity.]

## Notes for implementation

- [Relevant architecture, API documentation, security, privacy, accessibility, or observability guidance.]
- [Keep implementation decisions open unless a requirement depends on them.]

## Dependencies and open questions

- [Dependency or unresolved decision; identify who or what can resolve it.]
- [Write “None” if there are no known dependencies or open questions.]
