#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [command, arg] = process.argv.slice(2);
const repo = process.env.GITHUB_REPOSITORY || execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'], { encoding: 'utf8' }).trim();
const marker = (path) => `<!-- ticket-path: ${path} -->`;
const sectionStart = '<!-- ticket-automation:start -->';
const sectionEnd = '<!-- ticket-automation:end -->';

function fail(message) { throw new Error(message); }
function gh(...args) { return execFileSync('gh', args, { encoding: 'utf8' }).trim(); }
function ghWithInput(input, ...args) { return execFileSync('gh', args, { encoding: 'utf8', input }).trim(); }
function api(path, method = 'GET', fields = []) {
  return JSON.parse(gh('api', path, '--method', method, ...fields.flatMap(([key, value]) => ['-f', `${key}=${value}`])));
}
function issueNumber(text) {
  const match = text.match(/\*\*GitHub Issue:\*\*\s*(?:https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/issues\/)?#?(\d+)/);
  return match ? Number(match[1]) : null;
}
function withIssueLink(ticket, number) {
  const line = `**GitHub Issue:** https://github.com/${repo}/issues/${number}`;
  const pending = /\*\*GitHub Issue:\*\* (?:Pending ticket\/UX PR merge|\[added by `ticket:create`\])/;
  const updated = pending.test(ticket)
    ? ticket.replace(pending, line)
    : ticket.replace(/^(# .+\r?\n)/, `$1\n${line}\n`);
  if (updated === ticket) fail('Ticket must start with a level-one heading.');
  return updated;
}
function ticketPath(path) {
  if (!/^docs\/tickets\/[a-z0-9-]+\.md$/.test(path)) fail(`Invalid ticket path: ${path}`);
  return path;
}
function readTicket(path) {
  if (!existsSync(resolve(ticketPath(path)))) fail(`Ticket does not exist: ${path}`);
  return readFileSync(resolve(path), 'utf8');
}
function prTicket(path, sha) {
  const file = api(`repos/${repo}/contents/${ticketPath(path)}?ref=${sha}`);
  if (file.type !== 'file' || file.encoding !== 'base64') fail(`Cannot read ${path} from PR`);
  return Buffer.from(file.content, 'base64').toString('utf8');
}
function issueTicket(path, ticket) {
  const rendered = ticket.trim().replace(/(\[[^\]]+\]\()([^\s)]+)(\))/g, (match, open, target, close) => {
    if (/^(?:[a-z]+:|\/|#)/i.test(target)) return match;
    return `${open}https://github.com/${repo}/blob/main/${posix.normalize(posix.join(posix.dirname(path), target))}${close}`;
  });
  return `<!-- ticket-requirements:start -->\n${rendered}\n<!-- ticket-requirements:end -->`;
}
function issueBody(path, ticket) {
  return `${marker(path)}\n\n${issueTicket(path, ticket)}\n\n## Progress & Handover\n- **Status:** Not Started\n- **Next Action:** Review the ticket requirements above.\n\n${sectionStart}\nNo related PRs yet.\n${sectionEnd}\n`;
}
function replaceTicket(body, path, ticket) {
  const block = issueTicket(path, ticket);
  if (body.includes('<!-- ticket-requirements:start -->') && body.includes('<!-- ticket-requirements:end -->')) {
    return body.replace(/<!-- ticket-requirements:start -->[\s\S]*?<!-- ticket-requirements:end -->/, block);
  }
  const summary = ticket.match(/## Summary and objective\s+([^\n]+)/)?.[1];
  let updated = body;
  if (summary) updated = updated.replace(`## Summary\n${summary}\n\n`, '');
  updated = updated.replace(new RegExp(`^\\*\\*Detailed requirements:\\*\\* \\[${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\([^\\n]+\\)\\n`, 'm'), '');
  updated = updated.replace(/^\*\*Product context:\*\* \[PRD\]\([^\n]+\)\n/m, '');
  return updated.replace(marker(path), `${marker(path)}\n\n${block}`);
}
function replaceAutomation(body, content) {
  const block = `${sectionStart}\n${content}\n${sectionEnd}`;
  if (body.includes(sectionStart) && body.includes(sectionEnd)) {
    return body.replace(new RegExp(`${sectionStart}[\\s\\S]*?${sectionEnd}`), block);
  }
  return `${body.trimEnd()}\n\n${block}\n`;
}
function parsePr(body) {
  const path = body.match(/^Ticket:\s*(docs\/tickets\/[a-z0-9-]+\.md)\s*$/mi)?.[1];
  const issueField = body.match(/^Issue:\s*(Pending|#\d+)\s*$/mi)?.[1];
  const number = issueField?.startsWith('#') ? Number(issueField.slice(1)) : null;
  const type = body.match(/^Type:\s*(ticket\/UX|implementation)\s*$/mi)?.[1];
  const docs = body.match(/^Documentation:\s*(.+)$/mi)?.[1]?.trim();
  if (!path || !issueField || !type || !docs) fail('PR body needs Ticket, Issue, Type, and Documentation lines from the PR template.');
  if (issueField === '#0') fail('Replace the Issue placeholder with Pending or a real Issue number.');
  if (type === 'implementation' && !number) fail('Implementation PR needs a linked Issue number.');
  return { path, number, type, docs };
}
function sameIssue(body, path) { return body.includes(marker(path)) || body.includes(`docs/tickets/${path.split('/').pop()}`); }
function prType(item) {
  try { return parsePr(item.body ?? '').type; }
  catch { return /\b(UX|design)\b/i.test(item.title) ? 'ticket/UX' : 'implementation'; }
}
function relatedPrs(number, path) {
  const prs = JSON.parse(gh('pr', 'list', '--repo', repo, '--state', 'all', '--limit', '500', '--json', 'number,title,body,state,isDraft,mergedAt,url'));
  return prs.filter((item) => {
    try { const fields = parsePr(item.body ?? ''); return fields.path === path && (fields.number === number || (fields.type === 'ticket/UX' && !fields.number)); }
    catch { return new RegExp(`\\b(?:Refs|Closes|Fixes|Requirements source:)\\s+#${number}\\b`, 'i').test(item.body ?? ''); }
  }).sort((a, b) => a.number - b.number);
}
function activity(number, path) {
  const lines = relatedPrs(number, path).map((item) => {
    const type = prType(item);
    const state = item.mergedAt ? 'merged' : item.state === 'CLOSED' ? 'closed without merge' : item.isDraft ? 'draft' : 'open for review';
    return `- ${type}: [#${item.number}](${item.url}) — ${state}`;
  });
  return lines.join('\n') || 'No related PRs yet.';
}

async function create(path) {
  const ticket = readTicket(path);
  const linked = issueNumber(ticket);
  const mergedHandoff = JSON.parse(gh('pr', 'list', '--repo', repo, '--state', 'merged', '--limit', '500', '--json', 'number,body,mergedAt'))
    .some((pr) => { try { const fields = parsePr(pr.body ?? ''); return fields.type === 'ticket/UX' && fields.path === path && pr.mergedAt; } catch { return false; } });
  if (!mergedHandoff) fail('Create the Issue only after a ticket/UX PR for this ticket merges.');
  const issues = JSON.parse(gh('issue', 'list', '--repo', repo, '--state', 'all', '--limit', '500', '--json', 'number,body'));
  const matches = issues.filter((item) => sameIssue(item.body ?? '', path));
  if (matches.length > 1) fail(`Multiple Issues refer to ${path}: ${matches.map((i) => i.number).join(', ')}`);
  if (linked && matches.length && linked !== matches[0].number) fail(`Ticket links #${linked}, but #${matches[0].number} names its path.`);
  const number = linked ?? matches[0]?.number;
  let issue;
  if (number) {
    issue = api(`repos/${repo}/issues/${number}`);
    if (issue.pull_request) fail(`#${number} is a PR, not an Issue.`);
    if (!sameIssue(issue.body ?? '', path)) {
      const body = `${marker(path)}\n\n${issue.body ?? ''}`;
      api(`repos/${repo}/issues/${number}`, 'PATCH', [['body', body]]);
    }
  } else {
    const title = ticket.match(/^# (.+)$/m)?.[1] ?? path;
    issue = api(`repos/${repo}/issues`, 'POST', [['title', title], ['body', issueBody(path, ticket)]]);
    const label = /^# \[Bug\]/m.test(ticket) ? 'type:bug' : /^# \[Subtask\]/m.test(ticket) ? 'type:subtask' : 'type:story';
    gh('issue', 'edit', String(issue.number), '--repo', repo, '--add-label', label);
  }
  if (!linked) {
    writeFileSync(resolve(path), withIssueLink(ticket, issue.number));
  }
  syncIssue(path, issue.number);
  console.log(`Linked ${path} to #${issue.number}`);
}

function check() {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const pr = event.pull_request;
  const metadata = parsePr(pr.body ?? '');
  const ticket = prTicket(metadata.path, pr.head.sha);
  if (metadata.type === 'ticket/UX' && !metadata.number) {
    if (issueNumber(ticket)) fail('A pre-merge ticket/UX PR must not claim an Issue that has not been created by the merge workflow.');
  } else {
    if (issueNumber(ticket) !== metadata.number) fail(`Ticket must link Issue #${metadata.number}.`);
    const issue = api(`repos/${repo}/issues/${metadata.number}`);
    if (!sameIssue(issue.body ?? '', metadata.path)) fail(`Issue #${metadata.number} must link ${metadata.path}.`);
    if (issue.state !== 'open') fail(`Issue #${metadata.number} is closed.`);
  }
  if (metadata.type === 'implementation' && !/## Acceptance criteria\s+[\s\S]*?- \[ \]/i.test(ticket)) fail('Implementation ticket needs acceptance criteria.');
  if (metadata.type === 'implementation' && /## UX handoff references[\s\S]*?DESIGN\.md[\s\S]*?EXPERIENCE\.md/i.test(ticket)) {
    if (!relatedPrs(metadata.number, metadata.path).some((item) => prType(item) === 'ticket/UX' && item.mergedAt)) fail('UI implementation needs a merged ticket/UX PR.');
  }
  const files = api(`repos/${repo}/pulls/${pr.number}/files?per_page=100`);
  if (metadata.type === 'ticket/UX' && !files.some((file) => file.filename === metadata.path)) fail('Ticket/UX PR must change its local ticket.');
  if (/^no change\s*:/i.test(metadata.docs)) {
    if (metadata.docs.replace(/^no change\s*:/i, '').trim().length < 8) fail('Explain why documentation does not change.');
  } else {
    const named = metadata.docs.split(',').map((part) => part.trim());
    if (named.some((path) => !files.some((file) => file.filename === path))) fail('Documentation line must name changed paths, or give No change: reason.');
  }
  console.log(`Checked PR #${pr.number}, ${metadata.number ? `Issue #${metadata.number}` : 'Issue pending merge'}, and ${metadata.path}`);
}

function sync() {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const pr = event.pull_request;
  const metadata = parsePr(pr.body ?? '');
  if (metadata.number) syncIssue(metadata.path, metadata.number);
}
async function publishMerged() {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  if (!event.pull_request?.merged) return;
  const metadata = parsePr(event.pull_request.body ?? '');
  if (metadata.type !== 'ticket/UX') return;
  await create(metadata.path);
  const number = issueNumber(readTicket(metadata.path));
  const filePath = ticketPath(metadata.path);
  const project = api(`repos/${repo}`);
  const current = api(`repos/${repo}/contents/${filePath}?ref=${project.default_branch}`);
  const content = Buffer.from(readTicket(filePath)).toString('base64');
  if (Buffer.from(current.content, 'base64').toString('utf8') !== readTicket(filePath)) {
    const update = { message: `Link ${filePath} to Issue #${number}`, content, sha: current.sha };
    try {
      ghWithInput(JSON.stringify(update), 'api', `repos/${repo}/contents/${filePath}`, '--method', 'PUT', '--input', '-');
    } catch {
      const branch = `ticket-link/${filePath.split('/').pop().replace(/\.md$/, '')}-${number}`;
      const refPath = `repos/${repo}/git/ref/heads/${branch}`;
      let ref;
      try { ref = api(refPath); }
      catch {
        const base = api(`repos/${repo}/git/ref/heads/${project.default_branch}`);
        ref = JSON.parse(ghWithInput(JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha }), 'api', `repos/${repo}/git/refs`, '--method', 'POST', '--input', '-'));
      }
      const branchFile = api(`repos/${repo}/contents/${filePath}?ref=${branch}`);
      if (Buffer.from(branchFile.content, 'base64').toString('utf8') !== readTicket(filePath)) {
        ghWithInput(JSON.stringify({ ...update, sha: branchFile.sha, branch }), 'api', `repos/${repo}/contents/${filePath}`, '--method', 'PUT', '--input', '-');
      }
      const pulls = api(`repos/${repo}/pulls?head=${repo.split('/')[0]}:${encodeURIComponent(branch)}&base=${project.default_branch}&state=open`);
      if (!pulls.length) {
        ghWithInput(JSON.stringify({ title: `Link ${filePath} to Issue #${number}`, head: branch, base: project.default_branch,
          body: `Ticket: ${filePath}\nIssue: #${number}\nType: ticket/UX\nDocumentation: ${filePath}\n\nAutomated reciprocal link after the ticket/UX handoff merged.` }),
          'api', `repos/${repo}/pulls`, '--method', 'POST', '--input', '-');
      }
      console.log(`Direct ticket update was blocked; opened a link PR from ${branch}`);
    }
  }
}
function syncIssue(path, number = issueNumber(readTicket(path))) {
  if (!number) fail('Ticket has no linked GitHub Issue.');
  const issue = api(`repos/${repo}/issues/${number}`);
  if (!sameIssue(issue.body ?? '', path)) fail('Issue and ticket paths disagree.');
  const body = replaceAutomation(replaceTicket(issue.body ?? '', path, readTicket(path)), activity(number, path));
  if (body !== issue.body) api(`repos/${repo}/issues/${number}`, 'PATCH', [['body', body]]);
  console.log(`Updated Issue #${number} requirements and automation section`);
}
function reconcile() {
  const issues = JSON.parse(gh('issue', 'list', '--repo', repo, '--state', 'all', '--limit', '500', '--json', 'number,body'));
  let drift = 0;
  for (const issue of issues) {
    const path = issue.body?.match(/<!-- ticket-path: (docs\/tickets\/[a-z0-9-]+\.md) -->/)?.[1];
    if (!path) continue;
    const expected = replaceAutomation(replaceTicket(issue.body, path, readTicket(path)), activity(issue.number, path));
    if (expected !== issue.body) { console.error(`Issue #${issue.number} activity is stale`); drift++; }
  }
  if (drift) fail(`${drift} Issue(s) need reconciliation.`);
  console.log('Ticket Issue activity is current.');
}
function syncAll() {
  const issues = JSON.parse(gh('issue', 'list', '--repo', repo, '--state', 'all', '--limit', '500', '--json', 'number,body'));
  for (const issue of issues) {
    const path = issue.body?.match(/<!-- ticket-path: (docs\/tickets\/[a-z0-9-]+\.md) -->/)?.[1];
    if (path) syncIssue(path, issue.number);
  }
}
function preflight(path) {
  const number = issueNumber(readTicket(path));
  if (!number) fail('Ticket has no linked GitHub Issue.');
  const issue = api(`repos/${repo}/issues/${number}`);
  if (!sameIssue(issue.body ?? '', path)) fail('Issue and ticket paths disagree.');
  const prs = relatedPrs(number, path);
  console.log(`Issue #${number}: ${issue.state}; PRs: ${prs.map((pr) => `#${pr.number} ${pr.mergedAt ? 'merged' : pr.state.toLowerCase()}`).join(', ') || 'none'}`);
  if (!prs.some((pr) => prType(pr) === 'ticket/UX' && pr.mergedAt)) fail('Ticket/UX PR has not merged.');
  if (issue.state === 'closed' || prs.some((pr) => prType(pr) === 'implementation' && (pr.state === 'OPEN' || pr.mergedAt))) fail('Implementation is open or has merged; review existing work before another build.');
  const handover = (issue.body ?? '').replace(/<!-- ticket-requirements:start -->[\s\S]*?<!-- ticket-requirements:end -->/, '');
  if (/\*\*Status:\*\*\s*(Blocked|In Review|Done)/i.test(handover)) fail('Issue handover does not show a ticket ready for a new build.');
}

export { issueBody, issueNumber, issueTicket, parsePr, replaceTicket, sameIssue, withIssueLink };
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) try {
  if (!repo) fail('GITHUB_REPOSITORY is required.');
  if (command === 'create') await create(ticketPath(arg));
  else if (command === 'check') check();
  else if (command === 'sync') sync();
  else if (command === 'publish-merged') await publishMerged();
  else if (command === 'sync-issue') syncIssue(ticketPath(arg));
  else if (command === 'sync-all') syncAll();
  else if (command === 'reconcile') reconcile();
  else if (command === 'preflight') preflight(ticketPath(arg));
  else fail('Usage: node scripts/ticket-workflow.mjs create <path> | preflight <path> | sync-issue <path> | sync-all | check | sync | reconcile');
} catch (error) { console.error(error.message); process.exitCode = 1; }
