import assert from 'node:assert/strict';
import test from 'node:test';
import {
  eligible,
  planFilename,
  slug,
  ticketPath,
} from './plan-role-dev-issues.mjs';

test('selects only current development Issues', () => {
  const issue = { labels: [{ name: 'role:dev' }] };
  assert.equal(eligible(issue), true);
  assert.equal(eligible({ labels: [{ name: 'role:ux' }] }), false);
  assert.equal(
    eligible({ labels: [...issue.labels, { name: 'LAGECY' }] }),
    false,
  );
  assert.equal(
    eligible({ labels: [...issue.labels, { name: 'LEGACY' }] }),
    false,
  );
});

test('uses a safe ticket marker and filename slug', () => {
  assert.equal(
    ticketPath(
      '<!-- ticket-path: docs/tickets/fr-01-authenticate-staff.md -->',
    ),
    'docs/tickets/fr-01-authenticate-staff.md',
  );
  assert.equal(ticketPath('<!-- ticket-path: ../secret.md -->'), undefined);
  assert.equal(
    slug('FR-01 — Authenticate Customers'),
    'fr-01-authenticate-customers',
  );
  assert.equal(
    planFilename('FR-01 — Authenticate Customers'),
    'fr-01-authenticate-customers.md',
  );
});
