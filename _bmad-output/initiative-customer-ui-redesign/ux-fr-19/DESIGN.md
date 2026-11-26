---
name: FR-19 customer UI refinement
status: final
updated: 2026-11-26
source: docs/tickets/fr-19-refine-customer-ui.md
---

# Visual contract

Follow-up, 2026-11-26: The running Request Recorded and Proposal Review screens use the reference previews' hierarchy and panel treatments. Active and expired policy detail retain policy facts while omitting Source wording, View source links, and the Policy evidence section. The request entry form omits the specified synthetic request notice. Give the “Can proceed to a proposal” outcome more space above it. Proposal Review uses the preview's aligned comparison table. Preview links and disabled controls are static artifacts; runtime navigation and controls remain functional.

Use the shadcn preset `b51GFh7y6` theme as shown on the FR-16 sign-in reference. The FR-19 CSS imports `fr-16-redesign.css`, which imports the FR-15 token sheet. Use its semantic tokens, Public Sans, and existing heading scale. The brand is a primary red square monogram with foreground “PE”; the adjacent product name supplies the accessible name. Remove decorative prototype tags and subtitles.

The header contains the brand without Change history navigation. Place a button-styled Change history link beside the Policies heading, with a 44px minimum hit area and visible keyboard focus. Reuse the FR-16 policy list rows. Active uses the runtime success background/border/foreground and status dot; Expired uses the runtime warning tokens and dot. Both retain text labels. Restore real arrow icons on View policy, back links, and Check eligibility; hide decorative icons from assistive technology. Remove the specified policy-detail notice and the synthetic-policy notice below the list. Back links on request and proposal pages have 28px space below them before the page heading area.

The recorded request is a single confirmation panel: status, ID, concise change summary, effective date, and one strong “Check eligibility” action. The proposal leads with status and annualized impact; aligned current/proposed values and decision actions follow. Remove the specified non-binding proposal notice from that review screen. No source evidence panel appears in either screen.

Reference previews: [policy navigation](../../../design/page/fr-19-policy-navigation.html), [request recorded](../../../design/page/fr-19-request-recorded.html), [proposal review](../../../design/page/fr-19-proposal-review.html). On 2026-11-26 the customer reviewed and revised the layouts, then selected FR-19 for delivery with `bmad do fr-19`.
