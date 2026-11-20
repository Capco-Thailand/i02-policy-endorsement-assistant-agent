---
status: final
updated: 2026-11-20
colors:
  ink: '#0a2540'
  muted: '#425466'
  paper: '#ffffff'
  line: '#dce6ef'
  accent: '#635bff'
  warning: '#79510d'
  active: '#16624a'
typography:
  family: 'Inter, system-ui, Arial, sans-serif'
rounded:
  small: 6px
  medium: 10px
spacing:
  page: 24px
  section: 30px
components:
  decisionPanel: 'flat bordered section with a solid left rule'
---

# FR-08 eligibility — visual contract

## Brand & Style
Continue the synthetic policy servicing screens and `design/global.css`. The decision must read as a check on a recorded request, not as issued coverage or policy approval.

## Colors
Use `{colors.ink}` and `{colors.muted}` for content; `{colors.line}` on `{colors.paper}` for separation. Use `{colors.active}` only for `ELIGIBLE`, `{colors.warning}` for `REFERRED`, and the existing error treatment for `INELIGIBLE` or service failure. Always pair color with a text label.

## Typography
Use `{typography.family}` and the existing page title, eyebrow, section heading, and body hierarchy. Give reason text more visual weight than raw status codes.

## Layout & Spacing
Keep the request context above one decision section. At desktop width, put status and next step together, then list reasons and citations below. At narrow widths, stack all content in reading order with `{spacing.page}` page padding and `{spacing.section}` between sections.

## Elevation & Depth
Use a flat bordered panel with a solid left rule for the outcome. Avoid shadows on status or citation blocks.

## Shapes
Use `{rounded.small}` for controls and `{rounded.medium}` for the result panel, following the existing screen.

## Components
- Decision panel: `{components.decisionPanel}` with a text status, short explanation, reasons, and next step.
- Citation line: plain compact text with source, rule ID, version, and section; never imply that document suitability was verified.
- Check action: existing primary button style. Pending state retains its label and names the operation.

## Do's and Don'ts
- Show “Eligible to continue to a mock quote” rather than “Approved.”
- State that the upload receipt is mock and does not verify the document.
- Do not show a green badge for a referred or unresolved rule or imply rider underwriting passed.

The [behavior contract](EXPERIENCE.md) owns interaction and states. Both contracts govern if the [mockup](../../../design/page/check-endorsement-eligibility.html) differs.
