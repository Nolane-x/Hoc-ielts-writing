import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [packageJson, html, app, viteConfig, academy, styles, smokeScript, ciWorkflow, releaseWorkflow] = await Promise.all([
  readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../web/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../web/app.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../vite.config.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../web/academy-studio.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../web/styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/visual-smoke.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8')
]);

test('visible application version is generated from package.json during the build', () => {
  assert.match(html, /WMR Editorial Studio · v__APP_VERSION__/);
  assert.match(viteConfig, /transformIndexHtml\(html\)/);
  assert.match(viteConfig, /replaceAll\('__APP_VERSION__', packageJson\.version\)/);
  assert.equal(packageJson.version, '1.7.0');
  assert.match(smokeScript, /The visible app version must match package\.json/);
});

test('dynamic progress and status never mutate inline styles under the strict CSP', () => {
  assert.doesNotMatch(app, /\.style\.(?:width|color|background|setProperty)\s*=/);
  assert.doesNotMatch(app, /style\s*=\s*["'][^"']*(?:width|color|background)\s*:/i);
  assert.match(app, /setProgressClass\(fillEl, pct\)/);
  assert.match(app, /status-error/);
  assert.match(app, /provider-active/);
  assert.match(styles, /\.progress-p100\s*\{\s*transform: scaleX\(1\);/);
});

test('sentence surgery uses supplied evidence instead of synthetic Band 7.5/8.5 rewrites', () => {
  assert.match(academy, /not-calibrated-against-independent-human-rated-corpus/);
  assert.match(academy, /label: 'Bài mẫu tham khảo'/);
  assert.doesNotMatch(academy, /const band75|const band85|Band 8\.5\+/i);
  assert.match(app, /surgery\.suggestedRevision/);
  assert.match(app, /surgery\.learningNote/);
  assert.doesNotMatch(app, /surgery\.band75|surgery\.band85/);
  assert.match(app, /Chưa có điểm AI hợp lệ để dựng biểu đồ/);
});

test('local backup restoration is routed through a rollback-capable storage transaction', async () => {
  const source = await readFile(new URL('../web/storage-transaction.mjs', import.meta.url), 'utf8');
  assert.match(app, /applyStorageTransaction\(localStorage, changes\)/);
  assert.match(app, /storage_transaction_failed/);
  assert.match(app, /storage_transaction_rollback_failed/);
  assert.match(source, /storage_transaction_failed/);
  assert.match(source, /storage_transaction_rollback_failed/);
  assert.match(app, /Cài đặt AI và khóa hiện tại sẽ không thay đổi/);
});

test('Writing Agent uses a bounded reusable SSE parser with regression coverage', async () => {
  const source = await readFile(new URL('../web/sse.mjs', import.meta.url), 'utf8');
  const tests = await readFile(new URL('./sse.test.mjs', import.meta.url), 'utf8');
  assert.match(app, /consumeSSEStream\(response/);
  assert.match(source, /MAX_SSE_BUFFER_CHARS/);
  assert.match(source, /SSE frame exceeds the maximum supported size/);
  assert.match(source, /reader\.cancel/);
  assert.match(tests, /fragmented UTF-8 frames/);
  assert.match(tests, /rejects oversized frames/);
});

test('practice mode and bundled task wording do not imply official exam software or official Cambridge content', () => {
  assert.match(app, /không phải phần mềm thi chính thức/);
  assert.match(html, /không phải phần mềm thi chính thức/);
  assert.match(html, /NGÂN HÀNG ĐỀ LUYỆN TẬP THEO DẠNG IELTS/);
  assert.doesNotMatch(html, /NGÂN HÀNG ĐỀ LUYỆN TẬP CHUẨN CAMBRIDGE/);
});

test('release packaging and publication wait for CI and browser smoke', () => {
  assert.match(releaseWorkflow, /verify:\s*\n\s+name: Required CI \(Node 22 and 24\)\s*\n\s+uses: \.\/\.github\/workflows\/ci\.yml/);
  assert.match(releaseWorkflow, /visual-smoke:\s*\n\s+name: Required Chromium desktop\/mobile smoke\s*\n\s+uses: \.\/\.github\/workflows\/visual-smoke\.yml/);
  assert.match(releaseWorkflow, /needs:\s*\[verify, visual-smoke, windows, linux, android\]/);
  assert.match(ciWorkflow, /npm audit --audit-level=high/);
  assert.match(smokeScript, /browserErrors, \[\]/);
});
