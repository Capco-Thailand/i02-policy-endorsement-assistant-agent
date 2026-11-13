# FR-01 UX structure review

These documents help the UI implementer build the customer sign-in and session flows without guessing screen behavior. The closest structure model is **Reference/Database**: each contract should be easy to consult by component, state, or flow.

| Pass | Original Text | Revised Text | Changes |
| --- | --- | --- | --- |
| structure | `EXPERIENCE.md` §Information Architecture and §Key Flows: only sign-in and session-expiry journeys appear; AC3 also requires customer sign-out. | **QUESTION / ADD:** Define where sign-out appears in the authenticated entry and add a short named-customer sign-out flow. Keep policy content delegated to FR-03. | Missing scaffold leaves the FR-01 sign-out UI placement and post-sign-out transition for the builder to guess. Adds about 35 words to the 753-word experience spine. |
| structure | `EXPERIENCE.md` §Component Patterns says the demo note is below the form on mobile; `DESIGN.md` §Layout & Spacing says context stacks above the form, matching the mockup. | **MERGE:** State one placement rule in §Information Architecture or §Responsive & Platform: demo boundary stays in context, above the form on narrow screens. Remove the conflicting location from the component row. | Resolves a cross-spine placement conflict without changing the intended screen. Roughly neutral word impact. |

**Summary:** Two recommendations. Current length: 475 words in DESIGN.md and 753 in EXPERIENCE.md (1,228 total). The recommended fixes add about 35 words, a roughly 3% increase; the added behavior is necessary for comprehension. No length target was supplied.
