# FR-15 accessibility review

**Verdict:** Adequate; no open findings after corrections. The revised document order puts policy identity and term before coverage, then beneficiaries, exclusions, request action, and citations. The proposal places its non-binding notice and comparison before decision controls. Both screens use text status labels and exact money units.

## Findings

- **Medium — Citation destinations lacked a visible arrival indicator. Resolved.** The `#source-*` targets in `design/page/fr-15-policy-detail.html` now have `:target` and `:focus` outline/background styles in `design/page/fr-15-redesign.css`. Browser keyboard behavior should still be checked during implementation.
- **Medium — Source links interrupted definition-list groups. Resolved.** Each source link in the `Policy and term` section of `design/page/fr-15-policy-detail.html` is now inside its corresponding `<dd>`, keeping label, value, and source link together.

## Checks and limits

- The 320px proposal layout provides real `Current policy` and `Proposed` text in each value cell and explicit table roles. This addresses the earlier risk from CSS-generated labels when the table is visually stacked. A screen-reader pass is still needed to confirm table navigation after `display:block` transforms; [MDN documents that display changes can alter table semantics](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/display#tables), while [W3C WAI explains why header associations matter](https://www.w3.org/WAI/tutorials/tables/).
- Light-theme contrast estimates from the mirrored OKLCH tokens pass common text thresholds: primary on white about 6.06:1, muted foreground on white about 4.61:1, warning text/background about 6.08:1, success text/background about 7.08:1. These are calculated estimates; the dark runtime theme is inherited in the contract but not previewed in these static pages.
- Browser execution was unavailable in the reviewer sandbox (bundled Chromium absent; system Edge returned `EPERM`). The parent agent separately ran headless Edge after the final mockup edits: both pages at 320px and 1280px had no horizontal overflow, one page heading, and resolving in-page source anchors.
