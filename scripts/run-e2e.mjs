import { execFileSync, spawn } from 'node:child_process';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const timestamp = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Bangkok',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})
  .format(new Date())
  .replace(/\D/g, '');
const reportName = `report-${timestamp}`;
const reportDir = join('test-results', reportName);
await mkdir(reportDir, { recursive: true });
if (!process.env.CI) {
  const build = spawn(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'build'],
    { stdio: 'inherit' },
  );
  const buildExit = await new Promise((resolve) => {
    build.on('error', () => resolve(1));
    build.on('exit', (code) => resolve(code ?? 1));
  });
  if (buildExit !== 0) process.exit(buildExit);
}
const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['playwright', 'test', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: { ...process.env, PLAYWRIGHT_HTML_OUTPUT_DIR: reportDir },
  },
);
const exitCode = await new Promise((resolve) => {
  child.on('error', () => resolve(1));
  child.on('exit', (code) => resolve(code ?? 1));
});
const htmlName = `e2e-${timestamp}.html`;
try {
  await rename(join(reportDir, 'index.html'), join(reportDir, htmlName));
  const commit =
    process.env.GITHUB_SHA ??
    execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const dirty = Boolean(
    execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim(),
  );
  await writeFile(
    join(reportDir, 'run.json'),
    JSON.stringify(
      {
        browser: 'Chromium',
        runAtAsiaBangkok: timestamp,
        commit,
        dirty,
        result: exitCode === 0 ? 'passed' : 'failed',
        command: ['npm', 'run', 'test:e2e', ...process.argv.slice(2)],
      },
      null,
      2,
    ) + '\n',
  );
  await writeFile(
    join('test-results', 'index.html'),
    `<!doctype html><meta http-equiv="refresh" content="0;url=${reportName}/${htmlName}"><a href="${reportName}/${htmlName}">Latest E2E report</a>\n`,
  );
  console.log(`E2E report: test-results/${reportName}/${htmlName}`);
} catch (error) {
  console.error('E2E report was not produced:', error);
  process.exitCode = 1;
}
if (exitCode !== 0) process.exitCode = exitCode;
