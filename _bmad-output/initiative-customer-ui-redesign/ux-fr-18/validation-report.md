# FR-18 accepted UX validation — 2026-11-25

The customer selected FR-18, approved the existing FR-12 approved-only history boundary, and accepted the proposed reference layout by asking to continue after review. Rejected decisions remain on their proposal detail.

## Browser review

- Headless Chromium rendered the [history mockup](../../../design/page/fr-18-history.html) at 1280px and 320px. In both widths, multiple, one-record, empty, loading, service-error, and session-ended previews had a visible heading and no horizontal overflow.
- The overview keeps the non-binding notice beside the page heading. Each approved row retains policy label and ID, request ID, decision date, text status, and a proposal link. Full address and beneficiary details are absent.
- Chromium keyboard activation of the 320px Empty preview exposed its heading and “View your policies” action. Proposal and navigation links are native anchors with visible focus. Runtime screen-reader behavior, API owner isolation, and unchanged-policy checks remain implementation verification.
- Captures: [desktop](../../../design/page/fr-18-history-1280.png) and [320px](../../../design/page/fr-18-history-320.png). These are review references, not application screenshots.

The accepted visual and behavior spines govern if a mockup differs. The UX handoff is ready for the ticket/UX PR.
