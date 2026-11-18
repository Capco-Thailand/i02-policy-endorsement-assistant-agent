# AI-powered ADLC — five-slide reference

[PowerPoint deck](../../artifacts/adlc-sprint-1-five-slides-ready.pptx)

**Audience:** Customer stakeholders
**Visual identity:** Policy Endorsement Assistant — Inter, #F6F9FC canvas, #0A2540 ink, #635BFF accent, restrained green for built features.

## 1. Policy Endorsement Assistant

A guided change request for a synthetic life insurance policy.

Select policy → Request change → Review guidance → See proposal → Decide. The first two journey steps are built; the remaining steps are planned. No live policy update or coverage binding.

## 2. An iterative delivery loop

Five connected stages: **Frame → Design → Build → Verify → Learn**. Frame agrees on the next feature using requirements and backlog. Design writes a clear ticket and tests the journey in screen mockups. Build reviews a plan and uses an AI agent to implement. Verify checks code and browser behavior against acceptance criteria. Learn reviews the pull request and chooses the next change. A prominent arrow returns test results and customer feedback to Frame. Automated checks cover ticket readiness, CI, browser tests, and Issue updates.

## 3. Where we use AI in delivery

- **Frame:** Turn PRD and backlog into a focused ticket with acceptance criteria.
- **Design:** Explore the customer flow and draft UX handoff and browser mockups.
- **Build:** Prepare the implementation plan, make code changes, and review the diff.
- **Verify:** Generate checks, run browser E2E, and diagnose failures before PR review.

People approve scope, UX, implementation plans, and pull requests.

## 4. App progress today

Three browser E2E screenshots show sign-in (FR-01), own-policy access (FR-03), and a change request (FR-02). Mock upload (FR-07) is implemented but has no current E2E screenshot.

## 5. What we learned and what comes next

- **Learned the method:** PO shapes the ticket; UX defines behavior; Build implements; review checks the result.
- **Made it fit this project:** We review the ticket and screen design together. A linked GitHub Issue tracks the work. A readiness check and build plan guide implementation.
- **Added quality checks:** Browser tests show which acceptance criteria pass. CI checks the code, and the pull request records the review before merge.
- **Next ambition:** Validated feedback → next ticket → agent plan and build → E2E evidence → PR for human approval. Human approval stays at scope and merge decisions.

Sources: [PRD](../PRD.md), [ticket workflow](../TICKETING.md), [backlog](../backlog/README.md), [agent routing](../../AGENTS.md), and [BMad feature flow](../../.agents/skills/bmad/references/do-feature.md).
