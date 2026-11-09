# Coding standards

Apply these rules to code and infrastructure changes. [PRD.md](PRD.md) defines product behavior; [TESTING_STANDARD.md](TESTING_STANDARD.md) defines test coverage.

## Start with the smallest useful slice

- Implement one supported endorsement flow end to end before generalizing it to other change types.
- Reuse app structure and dependencies where present. Add a shared abstraction, package, service, or configuration only when a current requirement or a second concrete use needs it.
- In `apps/web/`, use React and shadcn/ui. Select only the TanStack packages needed for the current flow, and record them in the dependency manifest.
- In `apps/api/`, use Fastify. Keep route validation, behavior, and Swagger/OpenAPI output aligned.
- Start rule retrieval with structured lookup over versioned synthetic rules. Add RAG only when measured lookup failures justify it; retrieved text never decides eligibility or premium.

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
      App.tsx                        # app entry
      endorsement/
        EndorsementPage.tsx          # request form and result states
        api.ts                       # calls to the Fastify API
        EndorsementPage.test.tsx
  ai/                              # retrieval code only if a measured need arises
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

Keep the API's validation, eligibility, quote, draft, and audit decisions on the server. The web page presents those results and uses `api.ts` as its request boundary; it does not recalculate eligibility or premiums. Start with one page and one route, then split UI components or add routing when another real flow needs them.

## Preserve the hard gates

- Check authorization, required fields, and eligibility deterministically before calling `quote_endorsement`. Use the mock tool's returned amounts unchanged.
- Call `create_endorsement_draft` only after the required gates pass. Keep the result non-binding with `PENDING_REVIEW` status.
- Keep the audit trail needed to explain each result: request ID, cited rule IDs and versions, validation result, tool calls, and final status. Exclude unnecessary personal data.
- When changing an API or rule contract, update its consumers and the tests for the changed behavior in the same change.
