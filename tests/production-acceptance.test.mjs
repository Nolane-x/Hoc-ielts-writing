import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [packageJson, html, app, viteConfig, academy, styles, visualWorkflow, smokeScript, ciWorkflow] = await Promise.all([
  readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../web/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../web/app.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../vite.config.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../web/academy-studio.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../web/styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/visual-smoke.yml', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/visual-smoke.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8')
]);

test('visible application version is generated from package.json at build time', () => {
  assert.match(html, /WMR Editorial Studio · v__APP_VERSION__/);
  assert.match(viteConfig, /transformIndexHtml\(html\)/);
  assert.match(viteConfig, /replaceAll\('__APP_VERSION__', packageJson\.version\)/);
  assert.match(packageJson.version, /^1\.7\.0$/);
  assert.match(ciWorkflow, /Verify CSP-safe dynamic styling and generated version/);
});

test('dynamic progress and status states avoid inline styles under CSP', () => {
  assert.doesNotMatch(app, /\.style\.(?:color|background|width)|style="width:/);
  assert.match(app, /setProgressBucket\(/);
  assert.match(app, /status-error/);
  assert.match(styles, /progress-p100/);
  assert.match(ciWorkflow, /__APP_VERSION__/);
});

test('Academy templates and sentence surgery do not claim unvalidated numeric bands', () => {
  assert.doesNotMatch(academy, /band:\s*8\.5|Band 8\.5\+/i);
  assert.match(academy, /illustrative-unvalidated/);
  assert.match(app, /Nội dung mẫu chưa được chấm độc lập/);
  assert.match(app, /Chưa có điểm AI hợp lệ để dựng biểu đồ/);
  assert.doesNotMatch(app, /modelEssay\.band\.toFixed|surgery\.band75|surgery\.band85/);
});

test('backup restore is routed through the rollback-capable transaction helper', async () => {
  const source = await readFile(new URL('../web/storage-transaction.mjs', import.meta.url), 'utf8');
  assert.match(app, /applyStorageTransaction\(localStorage, changes\)/);
  assert.match(source, /storage_transaction_failed/);
  assert.match(source, /storage_transaction_rollback_failed/);
});

test('exam interface is described as practice rather than official test software', () => {
  assert.match(app, /Chế độ luyện thi trên máy tính/);
  assert.match(app, /không phải phần mềm thi chính thức/);
  assert.match(html, /IELTS PRACTICE TASK/);
});

test('visual smoke includes screenshots for Academy, practice mode and learner evidence', () => {
  assert.match(visualWorkflow, /branches: \['\*\*'\]/);
  assert.match(visualWorkflow, /name: wmr-ui-screenshots/);
  assert.match(smokeScript, /01b-academy-idea-lab-desktop\.png/);
  assert.match(smokeScript, /01c-exam-practice-desktop\.png/);
  assert.match(smokeScript, /radar-empty-note/);
  assert.match(smokeScript, /visual-smoke-manifest\.json/);
});
