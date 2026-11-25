# Coding standards

Apply these rules to application code and infrastructure changes. [PRD.md](PRD.md) defines product behavior, [ADR.md](ADR.md) records accepted architecture choices, and [TESTING_STANDARD.md](TESTING_STANDARD.md) defines verification. The new application's stack is undecided; the root npm package currently runs ticket tooling only. Record its real workspaces and commands here after they exist.

## Implementation order

For a behavior-changing feature or fix, choose observable test seams during planning and work one vertical slice at a time: write a focused failing test, confirm the expected failure, implement enough to pass, and repeat. Refactor after the behavior is green. Documentation, formatting, and other changes without observable behavior need relevant checks rather than a failing test.

Implement one supported user flow end to end before generalizing it. Reuse established structure and dependencies. Add a shared abstraction, package, service, or configuration when a current requirement or a second concrete use needs it. Keep tests beside the code they exercise.

## Formatting and dependencies

Use the formatter and linter selected for the new stack. For a JavaScript or TypeScript application, keep Prettier as a root development dependency with project configuration and scoped `format` and `format:check` scripts. Exclude generated files, lockfiles, build output, and documents; format only code in scope. Run the configured format check before review. A missing check is setup work, not evidence of a pass.

Keep one root lockfile if using npm workspaces. Add each dependency to the workspace that uses it. Record the actual install, test, typecheck, build, and browser E2E commands after the application exists; the current root package does not provide application checks.

## Boundaries and contracts

- Keep transport handlers focused on input validation, authorization, calling a workflow or service, and mapping its result to a response. Put domain decisions in testable modules with explicit dependencies.
- Define request and response schemas at the boundary. Derive or generate client types and API documentation from the published contract when the selected stack supports it; avoid separate handwritten shapes that can drift.
- Validate client input and establish the actor before reading protected data or calling side-effecting tools. A client-supplied identity or role is data, not authority.
- Keep database access and secrets in the owning server component. Give each state change a clear owner and transaction boundary. The UI displays server results and does not recalculate authoritative decisions.
- Return consistent, documented failures without secrets, stack traces, or unnecessary personal data. Do not turn a failed dependency into an apparent success.
- When an API or shared rule contract changes, update its consumers, tests, and documentation in the same change.

## UI implementation, when the project has a UI

- Keep HTTP calls behind one API client or equivalent boundary. Screens use feature-level reads and writes rather than scattering request details across components.
- Give repeated paths and behavior-defining values named owners. Use route constants or helpers for navigation when the UI has multiple routes.
- Build pages from focused components. Extract a component when it owns meaningful behavior, represents a clear section, or improves readability; avoid trivial wrappers and premature shared components. Promote a component when a second concrete use appears.
- Use semantic HTML and accessible labels, names, focus, and keyboard behavior. Handle loading, empty, error, and success states. Keep failures visible and actionable.

If React is selected, use function components with descriptive names at module scope. Derive values during render instead of copying props into state; use effects for synchronization with external systems. Keep event-driven work in handlers, use functional state updates when needed, and use stable keys for changing lists. Use memoization for measured cost or an integration that requires stable identity, not by default. If TanStack Query is selected, use queries for reads, mutations for writes, and invalidate or update cached data after a successful mutation; keep ephemeral UI state local.

## API implementation, when the project has an API

Give route inputs, domain values, and responses explicit types where the language supports them. Prefer narrow outcome types and runtime validation at external boundaries. Pass repositories, clocks, and external services into workflow code explicitly. Await asynchronous operations and propagate failures through the server's error path.

If Fastify is selected, derive OpenAPI and TypeScript types from route schemas, group related routes with plugins, and use encapsulation for feature-specific hooks. Use the request logger and a consistent error handler. Do not introduce a plugin or type-provider library without a concrete requirement.

## AI or retrieval, when used

Keep source retrieval behind an authorized service boundary. Treat retrieved text and model output as evidence or proposals, not authority to change protected state. Reconcile structured claims with authoritative records and keep deterministic validation before side effects. Define missing, stale, conflicting, and unavailable evidence outcomes in the ticket and test them. Record the versions and sources needed to explain a result without storing unnecessary personal data.

## Completion

Run the checks relevant to the change, review the diff and generated artifacts, update affected documents, and record any unverified criterion in the handoff. Prefer the smallest correct change that satisfies the ticket and accepted ADRs.
