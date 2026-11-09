# Accessibility review — PEA-001 UX

## Overall verdict

The design documents call for semantic controls, visible focus, text status, and responsive reflow. The static mockups largely support keyboard access and readable status. The expired-policy preview and beneficiary semantics need correction before the mockups can serve as reliable implementation references.

## Findings

- **High — Expired policy link opens a page whose main heading and facts belong to an ACTIVE policy.** The expired card in `design/page/policies.html` links to `policy-detail.html#expired`, which scrolls to an alternate-state panel below the ACTIVE policy's `h1`, beneficiary information, and enabled action. A screen reader's page title and first heading still identify SYN-LIFE-1001. This obscures which policy is selected and makes the two statuses appear on one detail page. Provide a separate expired detail mockup, or make the alternate state a clearly isolated design preview with its own page heading and no navigable policy-card link to it.
- **Medium — Beneficiary relationships and allocations lack explicit list semantics and labels.** In `design/page/policy-detail.html`, two generic `div` rows contain a name, relationship, and bare percentage. A screen reader hears values without knowing that `60%` is the allocation. Use a semantic list or table, and include an accessible label such as “Allocation: 60%” for each row; keep the visible column label if useful.
- **Medium — The policy collection is a generic `div` with `aria-label`.** In `design/page/policies.html`, `aria-label="Your policies"` on a generic `div` may not convey a collection or item count. Use a semantic `ul`/`li` structure, or a named section with each card as an article/link. This makes navigation between policies clearer to assistive technology.
- **Medium — Route-change focus behavior is stated but not specified enough for implementation.** `EXPERIENCE.md` says to “announce or focus the new page heading.” Choose a deterministic SPA navigation behavior: after a successful route transition, set document title and programmatically focus the new `h1` (with `tabindex="-1"` if needed); preserve focus when an inline Retry updates the same page. This avoids inconsistent announcements across screen readers.
- **Low — Disabled action has no focusable explanation target.** The expired mockup's native disabled button is removed from keyboard focus order. Its nearby text is readable in document order, which may be sufficient, but a keyboard user navigating only controls may miss why no action exists. Give the explanation a clear heading or connect the disabled control to it with `aria-describedby` in the implementation; keep the reason visible.
- **Low — Error states are contractual only.** `EXPERIENCE.md` calls for announced errors and Retry, but neither mockup shows an error state. Add one illustrative error panel or a small pattern specification that requires `role="alert"` or a live region when an asynchronous error appears, a keyboard-operable Retry button, and focus placement after the response.

## Checks with no finding

- Policy cards are actual links and Request Endorsement is a link/button, so their basic keyboard semantics are available.
- `:focus-visible` is defined for links and buttons, and the main policy facts use a definition list.
- ACTIVE and EXPIRED are written as text; the expired reason is visible independently of color.
- The CSS stacks policy cards and fact pairs on narrow screens; no fixed-width content or hover-only action was found.
- Text and primary-action colors appear strong against their backgrounds. The pale disabled button text is exempt from ordinary contrast requirements, but its adjacent explanation must remain legible.

## Review scope

Reviewed the ticket, `DESIGN.md`, `EXPERIENCE.md`, and the two static HTML mockups plus shared CSS. No browser or assistive technology execution was performed; contrast observations are from the declared CSS values.
