# Mock verification — behavior contract

## Foundation
Customer-facing extension of the existing endorsement request journey. Visual tokens come from [DESIGN.md](DESIGN.md).

## Information Architecture
The signed-in customer reaches a verification step for an owned active policy. The step contains separate mock eKYC and document-bypass sections.

## Voice and Tone
State what the simulation did and did not do. Show reason codes in readable language.

## Component Patterns
Each section has a heading, result, explanation, and the simulation disclosure. A `VERIFIED` mock eKYC result is never labeled real identity verification. `BYPASSED_MOCK` is never styled as a passing document check.

## State Patterns
Loading names the check in progress. `FAILED` and `REVIEW_REQUIRED` stop advancement to later quote/draft steps. Session expiry sends the customer to sign-in; missing or unowned policy shows the same unavailable state. Audit failure shows an error and no successful result.

## Interaction Primitives
Customers choose only a documented synthetic scenario. The document bypass has no upload or file picker. Results are announced in an `aria-live` region.

## Accessibility Floor
Use semantic headings, explicit labels, keyboard reachable controls, visible focus, and text status independent of color.

## Key Flows
Customer selects an owned active policy, chooses a synthetic scenario, runs mock eKYC, and sees the result. The page separately shows `BYPASSED_MOCK` with “Document verification was skipped for this demonstration.”
