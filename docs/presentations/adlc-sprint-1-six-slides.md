# AI-powered ADLC — six-slide reference

[PowerPoint deck](../../artifacts/adlc-sprint-1-six-slides.pptx)

**Audience:** Customer stakeholders

**Visual identity:** Policy Endorsement Assistant — Inter, #F6F9FC canvas, #0A2540 ink, and #635BFF accent.

## 1. AI Assistant vs AI-powered ADLC

**AI Assistant** means BA, Dev, and QA use AI in their own roles. BA drafts analysis, Dev drafts code through AI or vibe coding, and QA drafts tests. People still pass context and decisions between those separate tasks.

**AI-powered ADLC** links the roles into an end-to-end loop. A shared ticket and screen design carry decisions through build, tests, review, and merge. Agents and automation use the same artifacts and return validated feedback to the backlog. People approve scope, design, and merge decisions. A fully agentic feedback loop remains the next ambition.

## 2. Policy Endorsement Assistant

The customer journey is select policy → request change → review guidance → see proposal → decide. The first two journey steps are built; later steps are planned. No live policy update or coverage binding occurs.

## 3. An iterative delivery loop

The five stages are **Frame → Design → Build → Verify → Learn**. A feature starts with product requirements and backlog, moves through a reviewed ticket and screen design, receives an implementation plan and build, and is checked against acceptance criteria before pull request review. Test results and customer feedback shape the next ticket. Automated checks cover ticket readiness, CI, browser tests, and Issue updates.

## 4. What customers gain from this workflow

- **Clear expectations:** The customer can review scope and screen design before build.
- **Visible progress:** A linked Issue and pull request show what is being built and what changed.
- **Proof before acceptance:** Browser tests show whether agreed customer journeys work.
- **Feedback carried forward:** Findings become the next ticket after review or demo.

These are expected workflow benefits, not measured savings. A pilot can track time to demo, rework after review, and acceptance defects.

## 5. App progress today

Three browser E2E screenshots show sign-in (FR-01), own-policy access (FR-03), and a change request (FR-02). Mock upload (FR-07) is implemented but has no current browser test screenshot.

## 6. What we learned and what comes next

- **Learned the method:** BMad roles help define requirements, design screens, build the app, and review the result.
- **Made it fit this project:** The ticket and screen design are reviewed together. A linked GitHub Issue tracks work. A readiness check and build plan guide implementation.
- **Added quality checks:** Browser tests show which acceptance criteria pass. CI checks code, and the pull request records review before merge.
- **Next ambition:** Agents turn validated feedback into a new ticket, build the change, run tests, and propose a pull request. People still approve scope and merge.

Sources: [PRD](../PRD.md), [ticket workflow](../TICKETING.md), [backlog](../backlog/README.md), [agent routing](../../AGENTS.md), and [BMad feature flow](../../.agents/skills/bmad/references/do-feature.md).
