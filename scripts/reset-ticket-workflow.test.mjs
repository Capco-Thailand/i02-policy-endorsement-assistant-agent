import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { resetTickets } from './reset-ticket-workflow.mjs';

test('reset returns a selected ticket to backlog and removes only its delivery artifacts', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'ticket-reset-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (path, text) => {
    const absolute = join(root, path);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, text);
  };
  const has = (path) => existsSync(join(root, path));
  const read = (path) => readFileSync(join(root, path), 'utf8');

  put(
    'docs/tickets/fr-01-authenticate.md',
    [
      '# FR-01 — Authenticate',
      '**Labels:** `type:story`, `role:dev`',
      '**GitHub Issue:** https://github.com/example/repo/issues/37',
      '**State:** Handoff merged',
      '[PRD](../PRD.md)',
      '[FR-03](../backlog/fr-03-access.md)',
      '## Accepted decisions',
      '- Customers sign in.',
      '- Status: Ready for build.',
      '## UX handoff references',
      '[Design](../../_bmad-output/initiative/ux-fr-01-auth/DESIGN.md)',
      '[Experience](../../_bmad-output/initiative/ux-fr-01-auth/EXPERIENCE.md)',
      '[Preview](../../design/page/sign-in.html)',
      '## Definition of Done',
      '- [ ] Tested',
      '',
    ].join('\n'),
  );
  put('docs/backlog/fr-03-access.md', '# FR-03');
  put('docs/PRD.md', '[Authentication](tickets/fr-01-authenticate.md)');
  put(
    'docs/TICKETING.md',
    'General workflow.\n\nFR-01 has a selected ticket and Issue #37.\n\nKeep this.\n',
  );
  put(
    'docs/backlog/README.md',
    '| 1 | FR-01 Authenticate | [Ticket](../tickets/fr-01-authenticate.md) | Handoff merged |\n',
  );
  put('_bmad-output/initiative/ux-fr-01-auth/DESIGN.md', '# Design');
  put('_bmad-output/initiative/ux-fr-01-auth/EXPERIENCE.md', '# Experience');
  put(
    'design/page/sign-in.html',
    '<link rel="stylesheet" href="../global.css">',
  );
  put('design/page/sign-in.js', '');
  put('design/page/other.html', 'Other design');
  put(
    'design/page/index.html',
    '<ul><li><a href="sign-in.html">FR-01</a></li><li><a href="other.html">Other</a></li></ul>',
  );
  put('design/global.css', 'Shared');
  put('docs/implementation-plan/fr-01-authenticate.md', '# Plan');
  put('docs/implementation-plan/fr-03-access.md', '# Other plan');
  const preview = resetTickets(root, ['FR-01']);
  assert.match(preview.join('\n'), /Move docs\/tickets\/fr-01-authenticate.md/);
  assert.equal(has('docs/tickets/fr-01-authenticate.md'), true);

  resetTickets(root, ['FR-01'], { apply: true });
  assert.equal(has('docs/tickets/fr-01-authenticate.md'), false);
  assert.equal(has('docs/backlog/fr-01-authenticate.md'), true);
  const draft = read('docs/backlog/fr-01-authenticate.md');
  assert.match(draft, /\*\*GitHub Issue:\*\* Not filed/);
  assert.match(draft, /Customers sign in/);
  assert.match(draft, /\[FR-03\]\(fr-03-access.md\)/);
  assert.match(draft, /No current design/);
  assert.doesNotMatch(draft, /ux-fr-01-auth/);
  assert.match(read('docs/PRD.md'), /backlog\/fr-01-authenticate.md/);
  assert.doesNotMatch(read('docs/TICKETING.md'), /FR-01/);
  assert.match(
    read('docs/backlog/README.md'),
    /\[Draft\]\(fr-01-authenticate.md\)/,
  );
  assert.equal(has('design/page/sign-in.html'), false);
  assert.equal(has('design/page/sign-in.js'), false);
  assert.equal(has('docs/implementation-plan/fr-01-authenticate.md'), false);
  assert.equal(has('design/page/other.html'), true);
  assert.equal(has('design/global.css'), true);
  assert.match(read('design/page/index.html'), /other.html/);
  assert.doesNotMatch(read('design/page/index.html'), /sign-in.html/);
  assert.equal(resetTickets(root, ['FR-01']).length, 0);
});

test('reset refuses duplicate or missing ticket records', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'ticket-reset-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.throws(
    () => resetTickets(root, ['FR-01']),
    /no ticket or backlog draft/,
  );
  mkdirSync(join(root, 'docs/tickets'), { recursive: true });
  mkdirSync(join(root, 'docs/backlog'), { recursive: true });
  writeFileSync(join(root, 'docs/tickets/fr-01-a.md'), '# Ticket');
  writeFileSync(join(root, 'docs/backlog/fr-01-a.md'), '# Draft');
  assert.throws(
    () => resetTickets(root, ['FR-01']),
    /both tickets and backlog/,
  );
});

test('reset of two tickets removes shared design only after the last page', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'ticket-reset-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (path, text) => {
    const absolute = join(root, path);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, text);
  };
  for (const [id, page] of [
    ['01', 'sign-in'],
    ['02', 'request'],
  ]) {
    put(
      `docs/tickets/fr-${id}-test.md`,
      `# FR-${id}\n**GitHub Issue:** Not filed\n## UX handoff references\n[Preview](../../design/page/${page}.html)\n## Definition of Done\n- [ ] Done\n`,
    );
    put(`design/page/${page}.html`, `# ${page}`);
    put(`doc/implementation-plan/fr-${id}-test.md`, '# Plan');
  }
  put(
    'design/page/index.html',
    '<ul><li><a href="sign-in.html">Sign in</a></li><li><a href="request.html">Request</a></li></ul>',
  );
  put('design/global.css', 'Shared');
  const preview = resetTickets(root, ['FR-01', 'FR-02']);
  assert.ok(preview.includes('Remove design/page/index.html'));
  assert.ok(preview.includes('Remove design/global.css'));
  assert.ok(preview.includes('Prune empty doc/implementation-plan/'));
  resetTickets(root, ['FR-01', 'FR-02'], { apply: true });
  assert.equal(existsSync(join(root, 'design')), false);
  assert.equal(existsSync(join(root, 'doc/implementation-plan')), false);
  assert.equal(existsSync(join(root, 'docs/backlog/fr-01-test.md')), true);
  assert.equal(existsSync(join(root, 'docs/backlog/fr-02-test.md')), true);
});
