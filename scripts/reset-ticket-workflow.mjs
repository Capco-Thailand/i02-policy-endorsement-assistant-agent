#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const within = (parent, child) =>
  child === parent || child.startsWith(parent + sep);
const posix = (path) => path.replaceAll('\\', '/');
const files = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
        entry.isFile() ? [resolve(dir, entry.name)] : [],
      )
    : [];

function ticketFile(root, folder, id) {
  const matches = files(resolve(root, 'docs', folder)).filter((path) =>
    new RegExp(`^${id.toLowerCase()}-[a-z0-9-]+\\.md$`).test(basename(path)),
  );
  if (matches.length > 1)
    throw new Error(`Multiple ${id} files in docs/${folder}`);
  return matches[0];
}

function linkedPaths(text, source, root, id) {
  const paths = new Set();
  for (const [, target] of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(?:[a-z]+:|#)/i.test(target)) continue;
    const absolute = resolve(dirname(source), target.split(/[?#]/)[0]);
    const design = resolve(root, 'design');
    const ux = resolve(root, '_bmad-output');
    if (
      (within(design, absolute) && basename(absolute) !== 'index.html') ||
      (within(ux, absolute) &&
        posix(absolute).includes(`/ux-${id.toLowerCase()}-`))
    ) {
      if (existsSync(absolute) && statSync(absolute).isFile())
        paths.add(absolute);
      if (
        within(resolve(design, 'page'), absolute) &&
        extname(absolute) === '.html'
      ) {
        for (const extension of ['.css', '.js']) {
          const sibling = absolute.slice(0, -5) + extension;
          if (existsSync(sibling)) paths.add(sibling);
        }
      }
    }
  }
  return paths;
}

function backlogText(text) {
  return text
    .replace(/^\*\*Labels:\*\*.*$/m, '**Labels:** `type:story`')
    .replace(/^\*\*GitHub Issue:\*\*.*$/m, '**GitHub Issue:** Not filed')
    .replace(
      /^\*\*State:\*\* (?!Backlog draft\b).*$/m,
      '**State:** Backlog draft',
    )
    .replace(/^- Status: (?!Backlog draft\b).*$/gm, '- Status: Backlog draft.')
    .replace(
      /^## UX handoff references[\s\S]*?(?=^## |$(?![\s\S]))/m,
      '## UX handoff\n\nNo current design. Create a fresh UX handoff when this draft is selected.\n\n',
    );
}

function rewriteLinks(text, source, oldPath, newPath) {
  return text.replace(/\]\(([^)]+)\)/g, (whole, target) => {
    if (/^(?:[a-z]+:|#)/i.test(target)) return whole;
    const [, path, suffix] = target.match(/^([^?#]*)(.*)$/);
    if (resolve(dirname(source), path) !== oldPath) return whole;
    return `](${posix(relative(dirname(source), newPath))}${suffix})`;
  });
}

function rebaseLinks(text, oldPath, newPath, root) {
  return text.replace(/\]\(([^)]+)\)/g, (whole, target) => {
    if (/^(?:[a-z]+:|#)/i.test(target)) return whole;
    const [, path, suffix] = target.match(/^([^?#]*)(.*)$/);
    const resolved = resolve(dirname(oldPath), path);
    if (!within(root, resolved)) return whole;
    return `](${posix(relative(dirname(newPath), resolved))}${suffix})`;
  });
}

function prune(dir, stop) {
  while (
    within(stop, dir) &&
    dir !== stop &&
    existsSync(dir) &&
    readdirSync(dir).length === 0
  ) {
    try {
      rmdirSync(dir);
    } catch (error) {
      if (['EPERM', 'EACCES'].includes(error.code)) {
        console.warn(
          `Could not remove empty directory ${dir}: ${error.message}`,
        );
        return;
      }
      throw error;
    }
    dir = dirname(dir);
  }
}

export function resetTickets(
  root,
  ids,
  { apply = false, closeIssues = false } = {},
) {
  root = resolve(root);
  const uniqueIds = [...new Set(ids.map((id) => id.toUpperCase()))];
  if (!uniqueIds.length || uniqueIds.some((id) => !/^FR-\d+$/.test(id)))
    throw new Error(
      'Usage: npm run ticket:reset -- FR-01 [FR-02 ...] [--apply] [--close-issues]',
    );
  if (closeIssues && !apply) throw new Error('--close-issues requires --apply');
  const actions = [];
  const issueNumbers = [];
  const moved = [];
  const designPaths = new Set();
  const planPaths = new Set();
  for (const id of uniqueIds) {
    const ticket = ticketFile(root, 'tickets', id);
    const backlog = ticketFile(root, 'backlog', id);
    if (ticket && backlog)
      throw new Error(
        `${id} exists in both tickets and backlog; resolve the conflict first`,
      );
    if (!ticket && !backlog)
      throw new Error(`${id} has no ticket or backlog draft`);
    const source = ticket ?? backlog;
    const target = ticket
      ? resolve(root, 'docs/backlog', basename(ticket))
      : backlog;
    const content = readFileSync(source, 'utf8');
    const issue = content.match(
      /^\*\*GitHub Issue:\*\* (https:\/\/github\.com\/[^\s]+\/issues\/\d+)/m,
    )?.[1];
    if (issue) issueNumbers.push(issue);
    for (const path of linkedPaths(content, source, root, id))
      designPaths.add(path);
    for (const dir of ['docs/implementation-plan', 'doc/implementation-plan'])
      for (const path of files(resolve(root, dir)))
        if (basename(path).toLowerCase().startsWith(`${id.toLowerCase()}-`))
          planPaths.add(path);
    if (ticket) {
      actions.push(
        `Move ${posix(relative(root, ticket))} -> ${posix(relative(root, target))}`,
      );
      moved.push([ticket, target]);
    }
    if (content !== backlogText(content) || ticket)
      actions.push(
        `Reset ${posix(relative(root, target))} metadata and UX handoff`,
      );
  }
  for (const path of [...designPaths, ...planPaths])
    actions.push(`Remove ${posix(relative(root, path))}`);
  const design = resolve(root, 'design');
  const removedPages = [...designPaths].filter(
    (path) =>
      within(resolve(design, 'page'), path) && extname(path) === '.html',
  );
  const remainingPages = files(resolve(design, 'page')).filter(
    (path) =>
      extname(path) === '.html' &&
      basename(path) !== 'index.html' &&
      !designPaths.has(path),
  );
  const designIndex = resolve(design, 'page/index.html');
  if (removedPages.length && existsSync(designIndex))
    actions.push(
      `${remainingPages.length ? 'Update' : 'Remove'} design/page/index.html`,
    );
  if (
    removedPages.length &&
    !remainingPages.length &&
    existsSync(resolve(design, 'global.css'))
  )
    actions.push('Remove design/global.css');
  for (const dir of ['doc/implementation-plan', 'docs/implementation-plan'])
    if (
      existsSync(resolve(root, dir)) &&
      files(resolve(root, dir)).every((path) => planPaths.has(path))
    )
      actions.push(`Prune empty ${dir}/`);
  const docs = resolve(root, 'docs');
  const rewrites = new Map();
  const visit = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile() && path.endsWith('.md')) {
        let text = readFileSync(path, 'utf8');
        for (const [oldPath, newPath] of moved)
          text = rewriteLinks(text, path, oldPath, newPath);
        if (path === resolve(docs, 'TICKETING.md'))
          for (const id of uniqueIds)
            text = text.replace(
              new RegExp(`^${id}(?=\\b)[^\\n]*\\r?\\n`, 'gm'),
              '',
            );
        if (path === resolve(docs, 'backlog/README.md'))
          for (const id of uniqueIds)
            text = text
              .split('\n')
              .map((line) => {
                const cells = line.split('|');
                if (
                  cells.length < 6 ||
                  !new RegExp(`\\b${id}\\b`).test(cells[2]) ||
                  (cells[3].includes('[Draft]') && cells[4].includes('Backlog'))
                )
                  return line;
                cells[3] = ` [Draft](${basename(ticketFile(root, 'tickets', id) ?? ticketFile(root, 'backlog', id))}) `;
                cells[4] = ' Backlog; fresh UX handoff needed ';
                return cells.join('|');
              })
              .join('\n');
        if (text !== readFileSync(path, 'utf8')) rewrites.set(path, text);
      }
    }
  };
  visit(docs);
  for (const path of rewrites.keys())
    actions.push(`Update ${posix(relative(root, path))}`);
  if (closeIssues)
    for (const url of issueNumbers) actions.push(`Close GitHub Issue ${url}`);
  if (!apply) return actions;

  for (const [oldPath, newPath] of moved) {
    mkdirSync(dirname(newPath), { recursive: true });
    renameSync(oldPath, newPath);
  }
  for (const id of uniqueIds) {
    const path = ticketFile(root, 'backlog', id);
    const previous = moved.find(([, target]) => target === path)?.[0];
    const content = readFileSync(path, 'utf8');
    writeFileSync(
      path,
      backlogText(
        previous ? rebaseLinks(content, previous, path, root) : content,
      ),
    );
  }
  for (const [path, text] of rewrites)
    if (existsSync(path)) writeFileSync(path, text);
  for (const path of [...designPaths, ...planPaths])
    if (existsSync(path)) unlinkSync(path);
  if (existsSync(design)) {
    const index = resolve(design, 'page/index.html');
    if (removedPages.length && existsSync(index)) {
      let html = readFileSync(index, 'utf8');
      for (const path of designPaths)
        if (extname(path) === '.html')
          html = html.replace(
            new RegExp(
              `<li><a href="${basename(path)}(?:\\?[^\"]*)?"[^>]*>[^<]*<\\/a><\\/li>`,
              'g',
            ),
            '',
          );
      if (/<li>/.test(html)) writeFileSync(index, html);
      else unlinkSync(index);
    }
    if (
      removedPages.length &&
      !files(resolve(design, 'page')).some((path) => extname(path) === '.html')
    ) {
      const globalCss = resolve(design, 'global.css');
      if (existsSync(globalCss)) unlinkSync(globalCss);
    }
    prune(resolve(design, 'page'), root);
    prune(resolve(design, 'components'), root);
    prune(design, root);
  }
  for (const path of designPaths) prune(dirname(path), root);
  for (const dir of ['doc/implementation-plan', 'docs/implementation-plan'])
    prune(resolve(root, dir), root);
  if (closeIssues)
    for (const url of issueNumbers)
      execFileSync('gh', ['issue', 'close', url], {
        cwd: root,
        stdio: 'inherit',
      });
  return actions;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const args = process.argv.slice(2);
    const unknown = args.filter(
      (arg) =>
        arg.startsWith('--') && !['--apply', '--close-issues'].includes(arg),
    );
    if (unknown.length)
      throw new Error(`Unknown option: ${unknown.join(', ')}`);
    const actions = resetTickets(
      projectRoot,
      args.filter((arg) => !arg.startsWith('--')),
      {
        apply: args.includes('--apply'),
        closeIssues: args.includes('--close-issues'),
      },
    );
    console.log(actions.length ? actions.join('\n') : 'Nothing to reset.');
    if (!args.includes('--apply'))
      console.log('Dry run only. Add --apply to make these changes.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
