---
colors:
  ink: '#0a2540'
  muted: '#425466'
  paper: '#ffffff'
  warning: '#79510d'
typography:
  body: 'Inter, system-ui, sans-serif'
rounded:
  small: 6px
spacing:
  section: 24px
components:
  result: 'flat bordered panel'
---

# Mock verification — visual contract

## Brand & Style
Continue the existing policy assistant layout. State the simulation boundary in plain text beside each result.

## Colors
Use existing `design/global.css` tokens. Reserve warning treatment for review or failed outcomes; do not use green alone to imply real verification.

## Typography
Use a clear heading, short result label, and supporting explanation. Keep `BYPASSED_MOCK` visible as a technical status with a plain-language explanation.

## Layout & Spacing
Keep the policy context above two separate result sections. Stack sections at narrow widths.

## Components
Result panels show status, reason, and simulation disclosure. Actions use the existing button style.

## Do's and Don'ts
Do say “simulated identity check” and “document check skipped”. Do not say identity or documents were verified in reality.
