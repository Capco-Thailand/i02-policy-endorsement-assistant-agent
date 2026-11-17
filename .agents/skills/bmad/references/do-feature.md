# Deliver a feature

Use this workflow for `bmad do fr-<number>`. Read `{project-root}/AGENTS.md` and `{project-root}/docs/TICKETING.md`. The FR identifies a feature, not a GitHub Issue. The local ticket is the build specification.

## Existing ticket handoff

Keep the existing BMad flow through ticket/UX PR merge and GitHub Issue creation. Preserve its requirements, design artifacts, review gate, and reciprocal ticket/Issue link. Start implementation only when the active Issue exists and the linked ticket is on the default branch. If the handoff PR awaits review, report its URL and resume after merge.

## Start implementation

Resolve the FR to exactly one `docs/tickets/fr-<number>-*.md` and its active Issue. Exclude `LEGACY` and `LAGECY` records. Inspect the worktree, current branch, and matching implementation branches/PRs; resume existing work. Read the ticket, Issue, and linked UX/architecture files. Run `npm run ticket:preflight -- docs/tickets/<file>.md` before new implementation work. Report any blocker it finds.

Create or reuse `implement/fr-<number>-<slug>` from the current default branch, isolating unrelated local edits. On that branch, prepare an implementation plan in `docs/implementation-plan/` from `.agents/skills/bmad-build/plan-template.md`, the local ticket, Issue, and linked files. `npm run plan:issues -- <issue-number>` may create the draft; inspect and complete it against the ticket before building. `.agents/skills/vercel-react-view-transitions/references/implementation.md` is specific to View Transitions: consult it only when the ticket includes that work.

Invoke `bmad-build` with the completed implementation plan and local ticket. Follow that plan through code, review, and verification. Update affected documentation with the code. Keep the Issue open through implementation; automation marks Progress & Handover Done and closes it as completed after the implementation PR merges.

## Open the implementation PR

Inspect the complete diff, commit and push the implementation branch, and open or update one non-draft PR. Use `.github/pull_request_template.md` with `Ticket: docs/tickets/<file>.md`, `Issue: #<number>`, `Type: implementation`, and the documentation result. Run `npm run test:e2e`; record the dated HTML report path, verified criteria, and uncovered criteria in the handoff. The `Ticket links` workflow enables auto-merge after validation, tests, typecheck, formatting, build, and browser E2E pass; repository branch rules also apply. After an implementation PR merges to `main` or `codex/main-backup`, the Issue activity workflow sets Progress & Handover to Done, records the merged PR, and closes the Issue as completed. Verify the PR URL, checks, merge state, and Issue state, then report the result. If a gate fails, retain the branch and report it.
