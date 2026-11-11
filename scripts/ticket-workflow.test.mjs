import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.GITHUB_REPOSITORY = 'example/tickets';
const { isHandoffFile, issueBody, parsePr, issueNumber, replaceTicket, sameIssue, withIssueLink } = await import('./ticket-workflow.mjs');

test('ticket handoff cannot carry application or workflow code', () => {
  const ticket = 'docs/tickets/fr-2-request.md';
  assert.equal(isHandoffFile(ticket, ticket), true);
  assert.equal(isHandoffFile('design/page/request.html', ticket), true);
  assert.equal(isHandoffFile('docs/PRD.md', ticket), true);
  assert.equal(isHandoffFile('apps/api/src/app.ts', ticket), false);
  assert.equal(isHandoffFile('.github/workflows/ticket-check.yml', ticket), false);
  assert.equal(isHandoffFile('docs/tickets/fr-3-other.md', ticket), false);
});

test('new handoff PR may have an Issue pending', () => {
  assert.deepEqual(parsePr('Ticket: docs/tickets/fr-2-request.md\nIssue: Pending\nType: ticket/UX\nDocumentation: docs/tickets/fr-2-request.md'), {
    path: 'docs/tickets/fr-2-request.md', number: null, type: 'ticket/UX', docs: 'docs/tickets/fr-2-request.md',
  });
  assert.equal(issueNumber('**GitHub Issue:** Pending ticket/UX PR merge'), null);
});

test('implementation PR requires a numbered Issue', () => {
  assert.throws(() => parsePr('Ticket: docs/tickets/fr-2-request.md\nIssue: Pending\nType: implementation\nDocumentation: No change: implementation only'), /linked Issue/);
  assert.throws(() => parsePr('Ticket: docs/tickets/fr-2-request.md\nType: ticket/UX\nDocumentation: docs/tickets/fr-2-request.md'), /needs Ticket, Issue/);
  assert.throws(() => parsePr('Ticket: docs/tickets/fr-2-request.md\nIssue: #0\nType: ticket/UX\nDocumentation: docs/tickets/fr-2-request.md'), /placeholder/);
  assert.equal(parsePr('Ticket: docs/tickets/fr-2-request.md\nIssue: #42\nType: implementation\nDocumentation: No change: implementation only').number, 42);
});

test('retired premature Issue does not claim the ticket', () => {
  const path = 'docs/tickets/fr-2-request.md';
  assert.equal(sameIssue('Created before the handoff PR; closed as premature.', path), false);
  assert.equal(sameIssue(`<!-- ticket-path: ${path} -->`, path), true);
});

test('post-merge link replaces the pending marker once', () => {
  const ticket = '# Ticket 2\n\n**GitHub Issue:** Pending ticket/UX PR merge  \n';
  const linked = withIssueLink(ticket, 42);
  assert.equal(linked.match(/\*\*GitHub Issue:\*\*/g)?.length, 1);
  assert.equal(issueNumber(linked), 42);
});

test('Issue displays the full ticket with working repository links', () => {
  const path = 'docs/tickets/fr-2-request.md';
  const ticket = '# Ticket 2\n\n## Summary and objective\nRequest capture.\n\n## Acceptance criteria\n- [ ] Record request\n\n[PRD](../PRD.md)';
  const body = issueBody(path, ticket);
  assert.match(body, /## Acceptance criteria\n- \[ \] Record request/);
  assert.match(body, /\[PRD\]\(https:\/\/github.com\/example\/tickets\/blob\/main\/docs\/PRD.md\)/);
  assert.doesNotMatch(body, /\*\*Detailed requirements:\*\*/);
});

test('requirements sync replaces the ticket while preserving human handover', () => {
  const path = 'docs/tickets/fr-2-request.md';
  const oldTicket = '# Ticket 2\n\n## Summary and objective\nOld summary.';
  const current = issueBody(path, oldTicket).replace('**Status:** Not Started', '**Status:** In Review');
  const updated = replaceTicket(current, path, '# Ticket 2\n\n## Acceptance criteria\n- [ ] New behavior');
  assert.match(updated, /New behavior/);
  assert.doesNotMatch(updated, /Old summary/);
  assert.match(updated, /\*\*Status:\*\* In Review/);
});

test('legacy Issue gains ticket content and drops its generated link', () => {
  const path = 'docs/tickets/fr-2-request.md';
  const ticket = '# Ticket 2\n\n## Summary and objective\nRequest capture.\n\n## Acceptance criteria\n- [ ] Complete';
  const legacy = `<!-- ticket-path: ${path} -->\n\n## Summary\nRequest capture.\n\n**Detailed requirements:** [${path}](https://github.com/example/tickets/blob/main/${path})\n**Product context:** [PRD](https://github.com/example/tickets/blob/main/docs/PRD.md)\n\n## Progress & Handover\n- **Status:** In Review\n`;
  const updated = replaceTicket(legacy, path, ticket);
  assert.match(updated, /## Acceptance criteria/);
  assert.doesNotMatch(updated, /\*\*Detailed requirements:\*\*/);
  assert.match(updated, /\*\*Status:\*\* In Review/);
  assert.equal(replaceTicket(updated, path, ticket), updated);
});
