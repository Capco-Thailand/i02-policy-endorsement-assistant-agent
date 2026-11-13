# Spine Pair Review — Policy Endorsement Assistant

## Overall verdict
The sign-in spine pair is usable but thin at the handoff between behavior and visual components. Its current wording leaves the sign-out journey and several component appearances for the builder to infer. The linked mock resolves and matches the selected existing style.

## 1. Flow coverage — thin
Checked FR-01's customer sign-in, sign-out, session expiry, and protected-entry behavior. The two flows have named protagonist, numbered steps, climax, and failure path where relevant.
### Findings
- **high** The ticket's AC3 sign-out path has no named Key Flow; the expiry flow does not show a customer choosing Sign out or the resulting data clearing (EXPERIENCE.md, Key Flows). *Fix:* Add a short sign-out flow with a visible signed-out result and no protected data.

## 2. Token completeness — adequate
All `{path.to.token}` references in both spines resolve to DESIGN.md frontmatter, and the listed colors are hex values.
### Findings
- **medium** The load-bearing combinations (primary button text, body text on canvas, error and focus) have no explicit contrast target or verified contrast statement (DESIGN.md, Colors and Components). *Fix:* State WCAG AA contrast targets for normal text and focus indicators, and verify those combinations before implementation.

## 3. Component coverage — thin
The mock contains a form panel, two fields, a primary button, a status message, and a demo note.
### Findings
- **high** Component names diverge across spines: DESIGN.md uses “Primary button,” “Inputs,” and “Message,” while EXPERIENCE.md uses “Sign-in button,” “Email field,” “Password field,” and “Status message.” A builder cannot pair each behavior with a single visual spec by name (DESIGN.md, Components; EXPERIENCE.md, Component Patterns). *Fix:* Use identical component names in both sections and define visual and behavioral rules for each.
- **medium** “Demo boundary note” is behavioral in EXPERIENCE.md but has no named visual component in DESIGN.md; “Form panel” is visual but has no behavioral entry (same sections). *Fix:* Add matching rows or consolidate them under one shared named component with both contracts.

## 4. State coverage — adequate
Initial, valid session, invalid input, pending, invalid credentials, service error, expiry, and signed-out states are covered for sign-in.
### Findings
- **medium** “Authenticated entry” is listed as an IA surface but has no state contract beyond redirect; FR-03 owns its content (EXPERIENCE.md, Information Architecture and State Patterns). *Fix:* Mark it as a navigation destination outside FR-01's surface inventory, or specify only the FR-01 transition state clearly.

## 5. Visual reference coverage — adequate
No files exist in `mockups/`, `wireframes/`, or `imports/`. Both spines link the external `design/page/sign-in.html` mockup, and their links resolve.
### Findings
- **low** The EXPERIENCE.md link calls the mock a browser preview without naming which states its preview controls illustrate (EXPERIENCE.md, Foundation). *Fix:* Identify initial, invalid-credentials, expiry, and service-failure states beside the link.

## 6. Bloat & overspecification — strong
The contracts are short and avoid repeating backend guard criteria. The pixel values in DESIGN.md are limited to load-bearing form size and breakpoint decisions.
### Findings
None.

## 7. Inheritance discipline — adequate
The repo-relative ticket source exists; all token references resolve. The visual style decision matches the memlog and existing CSS.
### Findings
- **low** Flow headings use “Customer signs in” and “Session ends,” while the ticket uses AC1–AC3 names. Stable AC references are absent from the flows (EXPERIENCE.md, Key Flows). *Fix:* Add AC labels to flow headings or brief flow introductions for traceability.

## 8. Shape fit — strong
DESIGN.md follows the canonical section order. EXPERIENCE.md contains all default sections plus Responsive & Platform. The spines use the expected visual/behavior split.
### Findings
None.

## Mechanical notes
No broken mockup or cross-spine links found. The frontmatter has complete color, typography, rounded, spacing, and component token groups. No Mermaid appears. The mockup lives at `design/page/sign-in.html` by repository convention rather than under the UX workspace's `mockups/` folder.
