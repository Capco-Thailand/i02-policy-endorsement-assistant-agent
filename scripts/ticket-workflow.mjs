#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const [command, arg] = process.argv.slice(2);
const repo = process.env.GITHUB_REPOSITORY || execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'], { encoding: 'utf8' }).trim();
const marker = (path) => `<!-- ticket-path: ${path} -->`;
const sectionStart = '<!-- ticket-automation:start -->';
const sectionEnd = '<!-- ticket-automation:end -->';

function fail(message) { throw new Error(message); }
function gh(...args) { return execFileSync('gh', args, { encoding: 'utf8' }).trim(); }
function api(path, method = 'GET', fields = []) {
  return JSON.parse(gh('api', path, '--method', method, ...fields.flatMap(([key, value]) => ['-f', `${key}=${value}`])));
}
function issueNumber(text) {
  const match = text.match(/\*\*GitHub Issue:\*\*\s*(?:https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/issues\/)?#?(\d+)/);
  return match ? Number(match[1]) : null;
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
function issueBody(path, ticket) {
  const heading = ticket.match(/^# (.+)$/m)?.[1] ?? path;
  const summary = ticket.match(/## Summary and objective\s+([^\n]+)/)?.[1] ?? heading;
  return `${marker(path)}\n\n## Summary\n${summary}\n\n**Detailed requirements:** [${path}](https://github.com/${repo}/blob/main/${path})\n**Product context:** [PRD](https://github.com/${repo}/blob/main/docs/PRD.md)\n\n## Progress & Handover\n- **Status:** Not Started\n- **Next Action:** Review the local ticket.\n\n${sectionStart}\nNo related PRs yet.\n${sectionEnd}\n`;
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
  const number = Number(body.match(/^Issue:\s*#(\d+)\s*$/mi)?.[1]);
  const type = body.match(/^Type:\s*(ticket\/UX|implementation)\s*$/mi)?.[1];
  const docs = body.match(/^Documentation:\s*(.+)$/mi)?.[1]?.trim();
  if (!path || !number || !type || !docs) fail('PR body needs Ticket, Issue, Type, and Documentation lines from the PR template.');
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
    try { const fields = parsePr(item.body ?? ''); return fields.number === number && fields.path === path; }
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
    const line = `**GitHub Issue:** https://github.com/${repo}/issues/${issue.number}`;
    const updated = ticket.includes('**GitHub Issue:** [added by `ticket:create`]')
      ? ticket.replace('**GitHub Issue:** [added by `ticket:create`]', line)
      : ticket.replace(/^(# .+\r?\n)/, `$1\n${line}\n`);
    if (updated === ticket) fail('Ticket must start with a level-one heading.');
    writeFileSync(resolve(path), updated);
  }
  console.log(`Linked ${path} to #${issue.number}`);
}

function check() {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const pr = event.pull_request;
  const metadata = parsePr(pr.body ?? '');
  const ticket = prTicket(metadata.path, pr.head.sha);
  if (issueNumber(ticket) !== metadata.number) fail(`Ticket must link Issue #${metadata.number}.`);
  const issue = api(`repos/${repo}/issues/${metadata.number}`);
  if (!sameIssue(issue.body ?? '', metadata.path)) fail(`Issue #${metadata.number} must link ${metadata.path}.`);
  if (issue.state !== 'open') fail(`Issue #${metadata.number} is closed.`);
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
  console.log(`Checked PR #${pr.number}, Issue #${metadata.number}, and ${metadata.path}`);
}

function sync() {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const pr = event.pull_request;
  const metadata = parsePr(pr.body ?? '');
  syncIssue(metadata.path, metadata.number);
}
function syncIssue(path, number = issueNumber(readTicket(path))) {
  if (!number) fail('Ticket has no linked GitHub Issue.');
  const issue = api(`repos/${repo}/issues/${number}`);
  if (!sameIssue(issue.body ?? '', path)) fail('Issue and ticket paths disagree.');
  const body = replaceAutomation(issue.body ?? '', activity(number, path));
  if (body !== issue.body) api(`repos/${repo}/issues/${number}`, 'PATCH', [['body', body]]);
  console.log(`Updated Issue #${number} automation section`);
}
function reconcile() {
  const issues = JSON.parse(gh('issue', 'list', '--repo', repo, '--state', 'all', '--limit', '500', '--json', 'number,body'));
  let drift = 0;
  for (const issue of issues) {
    const path = issue.body?.match(/<!-- ticket-path: (docs\/tickets\/[a-z0-9-]+\.md) -->/)?.[1];
    if (!path) continue;
    const expected = replaceAutomation(issue.body, activity(issue.number, path));
    if (expected !== issue.body) { console.error(`Issue #${issue.number} activity is stale`); drift++; }
  }
  if (drift) fail(`${drift} Issue(s) need reconciliation.`);
  console.log('Ticket Issue activity is current.');
}
function preflight(path) {
  const number = issueNumber(readTicket(path));
  if (!number) fail('Ticket has no linked GitHub Issue.');
  const issue = api(`repos/${repo}/issues/${number}`);
  const prs = relatedPrs(number, path);
  console.log(`Issue #${number}: ${issue.state}; PRs: ${prs.map((pr) => `#${pr.number} ${pr.mergedAt ? 'merged' : pr.state.toLowerCase()}`).join(', ') || 'none'}`);
  if (issue.state === 'closed' || prs.some((pr) => prType(pr) === 'implementation' && (pr.state === 'OPEN' || pr.mergedAt))) fail('Implementation is open or has merged; review existing work before another build.');
  if (/\*\*Status:\*\*\s*(Blocked|In Review|Done)/i.test(issue.body ?? '')) fail('Issue handover does not show a ticket ready for a new build.');
}

try {
  if (!repo) fail('GITHUB_REPOSITORY is required.');
  if (command === 'create') await create(ticketPath(arg));
  else if (command === 'check') check();
  else if (command === 'sync') sync();
  else if (command === 'sync-issue') syncIssue(ticketPath(arg));
  else if (command === 'reconcile') reconcile();
  else if (command === 'preflight') preflight(ticketPath(arg));
  else fail('Usage: node scripts/ticket-workflow.mjs create <path> | preflight <path> | sync-issue <path> | check | sync | reconcile');
} catch (error) { console.error(error.message); process.exitCode = 1; }
