# Coding standards

Apply these rules to code and infrastructure changes. [PRD.md](PRD.md) defines product behavior; [TESTING_STANDARD.md](TESTING_STANDARD.md) defines test coverage.

The repository uses npm workspaces for `apps/api`, `apps/web`, and `apps/ai`. Install dependencies from the root with `npm ci` and keep one root `package-lock.json`. Add dependencies to the workspace that uses them. The AI workspace has no runtime until a concrete retrieval or data need exists.

## Implementation order
For a feature or bug fix that changes behavior, use test-driven development as defined in [TESTING_STANDARD.md](TESTING_STANDARD.md). Agree on the observable test seams during planning, then work one vertical slice at a time: write a focused failing test, confirm it fails for the intended reason, add only enough code to pass, and repeat. Leave broader refactoring for review after the behavior is green. Documentation-only, formatting-only, and other changes without observable behavior do not need a failing test.

## Formatting
- Use Prettier for application source and configuration. When implementing the first application code, add Prettier as a root dev dependency, commit its version in the root lockfile, and add root `format` and `format:check` scripts plus project configuration and ignore rules. Exclude the root lockfile, generated files, build output, and documents; do not reformat unrelated files.
- Run `npm run format` on code in scope after the red-to-green cycles and `npm run format:check` before review. A failed or missing format check leaves a code change unfinished.
- Keep JSX and CSS readable after formatting: give meaningful sections and conditional states clear structure. Formatting does not replace the component responsibility rules below.

## Start with the smallest useful slice

- Implement one supported endorsement flow end to end before generalizing it to other change types.
- Reuse app structure and dependencies where present. Add a shared abstraction, package, service, or configuration only when a current requirement or a second concrete use needs it.
- In `apps/web/`, use React with Next.js App Router and shadcn/ui. Use `@tanstack/react-query` for client-side server state and API reads or mutations; add and configure it in the web workspace when implementing those flows. Keep server-rendered data fetching in Next.js Server Components when appropriate.
- In `apps/web/`, build page UI from focused React components with clear responsibilities. Extract a component when it represents a meaningful UI section, owns reusable behavior or state, or makes a page easier to understand; avoid both monolithic page components and components that only wrap a trivial element without adding value.
- Share a component when the same UI and behavior are used in more than one place. Keep shared components in a clear shared area, expose differences through a small, explicit prop API, and keep page-specific components near their page or feature. Do not generalize for hypothetical future use; promote a component when a second concrete use appears.
- When AI tools create or change React code, follow the conventions below and the existing patterns in the affected feature. Prefer small, reviewable changes that meet the requirement; do not add dependencies, architecture, or abstractions without a concrete need.
- In `apps/api/`, use TypeScript and Fastify. Derive API types and OpenAPI output from validated route schemas; keep frontend client types aligned with the published contract.
- Use RAG to retrieve versioned synthetic policy evidence and endorsement rules as required by the PRD. Verify decision fields against structured records; retrieved text never decides eligibility or premium.

## Example folder structure

This illustrates one endorsement flow, not a scaffold to create in advance. TypeScript filenames are examples; use JavaScript equivalents if that language is chosen. Add a folder when its first file is needed, and keep tests beside the code they exercise.

```text
apps/
  api/
    src/
      app.ts                         # Fastify setup and Swagger registration
      endorsement/
        route.ts                     # HTTP schema, validation, and response
        workflow.ts                  # authorization, rule, quote, draft order
        rules.ts                     # versioned lookup and eligibility checks
        mock-tools.ts                # synthetic quote and draft operations
        workflow.test.ts
  web/
    src/
      app/
        page.tsx                     # Next.js App Router entry
      endorsement/
        EndorsementPage.tsx          # request form and result states
        api.ts                       # calls to the Fastify API
        EndorsementPage.test.tsx
  ai/                              # synthetic policy and rule retrieval
design/
  component/                       # reusable HTML fragments
  page/                            # previewable HTML pages
  global.css
docs/
  PRD.md
  CODING_STANDARDS.md
  DESIGN_STANDARD.md
  TESTING_STANDARD.md
```

Keep the API's validation, eligibility, quote, draft, and audit decisions on the server. The web page presents those results and uses `api.ts` as its request boundary; it does not recalculate eligibility or premiums. Start with one page and one route. Compose the page from focused components as the UI warrants, add shared components when a second concrete use appears, and add routing when another real flow needs it.

## React implementation rules
- Use function components and compose them from focused components. Keep component and hook names descriptive; define components at module scope, not inside another component.
- Keep state minimal. Derive values from props or existing state during render instead of copying them into state or synchronizing them with an effect. Use effects only to synchronize with external systems, and include every reactive dependency they use.
- Keep event-driven work in event handlers. Use functional state updates when the next value depends on the previous value. Do not add `useMemo`, `useCallback`, or `memo` by default; use them for measured or clearly expensive work, or when stable identity is required by an integration.
- Use stable, unique keys when rendering lists. Avoid array indexes when items can be inserted, removed, or reordered.
- Use TanStack Query for client-side API data: queries for reads, mutations for writes, and query invalidation or updates after successful mutations. Do not fetch server data in effects and copy it into local component state. Keep ephemeral UI state (such as form inputs, focus, and a pending button indicator) in React state. Server-rendered data may use Next.js Server Components. All requests go through the API boundary; never reproduce server-side eligibility, quote, or premium decisions in the browser.
- Use semantic HTML and accessible labels, names, and keyboard behavior. Prefer the project's shadcn/ui components where they fit, and preserve their accessibility behavior when composing them.
- Handle loading, empty, error, and success states for asynchronous UI. Keep errors visible and actionable; never turn a failed request into an apparent approval or successful draft.
- Follow the repository's TypeScript and formatting conventions. Avoid `any` and unsafe type assertions when a concrete type or runtime validation is available.

## TypeScript and Fastify implementation rules
- Use TypeScript for API code. Give route inputs, domain values, and responses explicit types; prefer narrow types and discriminated unions for workflow outcomes. Avoid `any`, non-null assertions, and type assertions that bypass validation.
- Define request and response validation schemas at the route boundary. Derive TypeScript types and Swagger/OpenAPI documentation from those schemas, and generate or derive frontend client types from the published contract; do not maintain separate handwritten API shapes.
- Keep route handlers focused on HTTP concerns: validate and authorize the request, call the workflow/service, and map its result to the response. Keep eligibility, quote, draft, and audit decisions in domain/workflow code, not in route handlers.
- Register related routes through Fastify plugins and use Fastify's encapsulation for feature-specific hooks and dependencies. Keep shared infrastructure in app setup; avoid global mutable state and hidden cross-request state.
- Use Fastify's request logger and error handling. Return consistent, documented error responses without exposing stack traces, secrets, or unnecessary policyholder data. Do not swallow errors or convert failures into successful or eligible outcomes.
- Pass dependencies such as mock tools and repositories into workflow code explicitly so behavior stays testable. Keep asynchronous operations awaited and propagate failures through Fastify's error path.
- Keep authorization and validation before side-effecting tools. Call quote and draft tools only at the workflow gates defined by the PRD, and preserve the non-binding `PENDING_APPROVAL` result.
- When AI tools create or change API code, follow these rules and the existing Fastify patterns in the affected feature. Prefer the smallest correct change; do not introduce plugins, type-provider libraries, or abstractions without a concrete requirement.

## Preserve the hard gates

- Check authorization, required fields, and eligibility deterministically before calling `quote_endorsement`. Use the mock tool's returned amounts unchanged.
- Call `create_endorsement_draft` only after the required gates pass. Keep the result non-binding; submission moves it from `DRAFT` to `PENDING_APPROVAL`.
- Keep the audit trail needed to explain each result: request ID, cited rule IDs and versions, validation result, tool calls, and final status. Exclude unnecessary personal data.
- When changing an API or rule contract, update its consumers and the tests for the changed behavior in the same change.
