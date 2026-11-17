# Chore — Browser E2E implementation gate
**Title:** [Chore] Run and retain browser E2E for implementation PRs
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/64
**Risk:** High — a passing component suite alone can miss broken customer journeys across the web and API.
**Requirements owner:** This file.

## Summary and objective
Run automated Chromium E2E for implementation PRs, retain reviewable results, and require a passing browser run before workflow auto-merge.

## Acceptance criteria
- [ ] `npm run test:e2e` starts the synthetic API and web app, runs browser and public API scenarios for FR-01 through FR-03, and exits nonzero on a failed test.
- [ ] Browser scenarios exercise sign-in/out, linked and unavailable policies, all four request types, invalid input, expired policy, and non-binding confirmation; public API scenarios cover authorization and unchanged policy facts.
- [ ] Every UI scenario attaches a screenshot to a dated HTML report under `test-results/`, with `test-results/index.html` opening the latest report. Visual checks compare desktop and narrow screens to reviewed baselines where available.
- [ ] The `Ticket links` implementation job installs Chromium, runs E2E after existing checks, and uploads the report even on failure. The auto-merge workflow requires that E2E step to succeed. Ticket/UX handoff PRs remain validation-only.
- [ ] The BMad delivery instructions and affected project documentation require E2E evidence and record the FR-01 through FR-03 results and remaining gaps.

## Scope and dependencies
Use only synthetic accounts and policies. This chore adds a test harness, workflow gate, and documentation; it does not change product behavior. The existing FR-01, FR-03, and FR-02 implementations provide the runnable customer journey. Merging an implementation PR sets its linked Issue to Done; customer approval of a proposed policy change remains separate and non-binding.
