---
name: Policy Endorsement Assistant
status: final
updated: 2026-11-23
colors:
  ink: '#0a2540'
  muted: '#425466'
  line: '#dce6ef'
  paper: '#ffffff'
  accent: '#635bff'
  accent-ink: '#5148d9'
  accent-soft: '#f0efff'
  warning: '#79510d'
  warning-soft: '#fff5df'
  active: '#16624a'
  active-soft: '#e8f6ef'
  error: '#a22d37'
typography:
  family: 'Inter, system-ui, Arial, sans-serif'
  title: 'clamp(34px, 4vw, 46px), weight 750, line-height 1.12'
  body: '15px, line-height 1.65'
rounded:
  small: '6px'
  medium: '10px'
spacing:
  page: '24px desktop, 18px narrow viewport'
  section: '30px'
components:
  proposalPanel: 'white surface, thin border, compact radius'
  decisionPanel: 'flat border with solid status rule and text label'
  nonBindingNotice: 'warning tint, explicit non-binding statement'
---

## Brand & Style
Continue the established synthetic policy servicing interface in `design/global.css`. The screen helps a customer understand a proposed change and record a personal decision. It must never look like a policy issuance or coverage activation screen.

## Colors
Use `{colors.ink}` and `{colors.muted}` for content, `{colors.line}` for separators, and `{colors.paper}` for reading surfaces. `{colors.accent}` marks primary actions and links. `{colors.active}`, `{colors.warning}`, and `{colors.error}` mark status only and always accompany a visible text label.

## Typography
Use `{typography.family}` and the existing eyebrow, page title, section heading, and body hierarchy. Proposed values and policy identifiers use tabular numerals. Give customer-facing explanations more prominence than internal status codes.

## Layout & Spacing
Use a single reading column up to 850px. Keep policy identity and proposal status near the top, followed by a side-by-side current/proposed comparison on wide screens and a stacked comparison on narrow screens. Place source citations after the explanation they support. Keep the decision controls after the comparison and boundary notice.

## Elevation & Depth
Use flat bordered surfaces. No layered shadows, gradients, or floating dashboards. Status panels use a solid left rule, not color alone.

## Shapes
Use `{rounded.small}` on controls and `{rounded.medium}` on grouped content, consistent with the existing mockups.

## Components
- **Value comparison:** label each value as Current and Proposed; show “Unchanged” when a field is unaffected. Currency and frequency are explicit.
- **Non-binding notice:** state that this is a synthetic proposal, approval records a history entry only, and the underlying policy and coverage stay unchanged.
- **Decision controls:** separate Approve proposal and Reject proposal actions; rejection requires a confirmation step that names the consequence and offers Cancel.
- **Citation list:** identify policy wording or endorsement rule, source version, and section in readable text.
- **History row:** show policy, proposed change, decision, and date; details open the recorded proposal without implying live policy changes.

## Do's and Don'ts
| Do | Don't |
|---|---|
| Say “Proposed change” and “Approval records your decision” | Say “Policy updated,” “Coverage approved,” or “Issued” |
| Distinguish current and proposed values in text | Rely on color or arrows alone to explain a change |
| Explain unchanged amounts and values | Present absent calculations as zero impact |
| Keep evidence traceable to cited source versions | Suggest a staff reviewer or issuance step exists |

The [behavior contract](EXPERIENCE.md) owns interaction and state rules. Both contracts govern if a [mockup](../../../design/page/proposal-review.html) differs.
