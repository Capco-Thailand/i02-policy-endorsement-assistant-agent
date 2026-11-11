import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.GITHUB_REPOSITORY = 'example/tickets';
const { parsePr, issueNumber, sameIssue, withIssueLink } = await import('./ticket-workflow.mjs');

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
