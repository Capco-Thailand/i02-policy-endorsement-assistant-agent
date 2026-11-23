---
name: Policy Endorsement Assistant
status: final
updated: 2026-11-23
---

# FR-08 eligibility — visual contract

## Brand & Style
Continue the synthetic policy servicing screens and `design/global.css`. The result is a preliminary assessment of a recorded request, not policy approval or issued coverage.

## Colors
Use the existing ink, muted, line, and paper tokens for content and structure. Use the active, warning, and error treatments only with visible status text. `CAN_PROCEED` uses active treatment; `NEEDS_REVIEW` uses warning; `CANNOT_PROCEED` and service failure use error treatment.

## Typography
Use the existing eyebrow, page-title, section-heading, and body hierarchy. Make customer-readable explanation more prominent than enum values.

## Layout & Spacing
Keep the request context above one decision section. Show outcome, reason, next step, and policy and rule citations in reading order. Stack content on narrow screens.

## Elevation & Depth
Use a flat bordered panel with a solid left rule for the outcome. Avoid shadows on status or citation blocks.

## Shapes
Follow the small control and medium panel radii in the shared screen styles.

## Components
- Decision panel: text status, short explanation, reasons, and next step.
- Citation line: policy wording or rule, source version, and section.
- Check action: primary button. Pending state retains its label and names the operation.

## Do's and Don'ts
- Say “Can proceed to a proposal” rather than “Approved.”
- Explain unresolved evidence without implying a reviewer was assigned.
- Do not show an upload requirement or a human referral status.
- For rider additions, note real-world underwriting may be needed without requesting medical details.

The [behavior contract](EXPERIENCE.md) owns interaction and states. Both contracts govern if the [mockup](../../../design/page/check-endorsement-eligibility.html) differs.
