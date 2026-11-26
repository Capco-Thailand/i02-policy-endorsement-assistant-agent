---
name: FR-19 customer UI refinement
status: final
updated: 2026-11-26
source: docs/tickets/fr-19-refine-customer-ui.md
---

# Experience contract

Follow-up, 2026-11-26: The recorded request presents one confirmation panel containing the check action. Proposal review presents status, annualized impact, aligned comparison, then decision controls. Expired policy detail omits Source wording and source links while keeping its policy facts and evidence check available.

1. On the Policies screen, the customer can open Change history from a button-styled link by the page heading. It is absent from the top navigation, works by keyboard, and leads to the existing authorized history route. Each policy displays Active or Expired in text.
2. After a request is recorded, focus moves to the confirmation heading. The saved request ID, requested value, date, and pending-check state are readable before the “Check eligibility” action. This action runs the existing separate check; recording alone changes no policy data.
3. On proposal review, the customer compares current and proposed values and annualized cost, then approves or rejects using the existing decision flow. The specified non-binding notice is omitted from this screen. A recorded decision replaces the pending action state; it does not imply issued coverage.
4. Assessment reasons and next step remain visible. Source-detail panels are omitted from the customer presentation, while the API and audit retain citations.

At 320px, content follows the same reading order and wraps without horizontal scrolling. Loading, error, empty, session-ended, and decided states retain clear text and next actions. Controls have visible focus and accessible names. The previews are static review artifacts; they do not submit requests or decisions.

Customer decision, 2026-11-26: remove the specified policy-detail and proposal-review notices. Keep the request-recorded explanation and the underlying non-binding behavior.
