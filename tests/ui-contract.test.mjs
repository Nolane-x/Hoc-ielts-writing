import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, css, app] = await Promise.all([
  readFile(new URL('../web/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../web/styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../web/app.mjs', import.meta.url), 'utf8')
]);

test('primary navigation always points to an existing page region', () => {
  const navigablePages = [...html.matchAll(/data-page="([^"]+)"/g)].map(match => match[1]);
  assert.ok(navigablePages.includes('workspace'));
  assert.ok(navigablePages.includes('learn'));
  assert.ok(navigablePages.includes('report'));
  assert.ok(navigablePages.includes('settings'));
  for (const page of ['workspace', 'learn', 'report', 'settings']) {
    assert.match(html, new RegExp('id="page-' + page + '"'));
  }
});

test('writer, submission status, settings and import controls are present in the semantic shell', () => {
  for (const id of [
    'task-select', 'task-prompt', 'task-goal', 'task-meta', 'essay-editor',
    'word-count', 'submit-review', 'local-check', 'coach-input', 'coach-answer',
    'clear-coach-history', 'settings-form', 'external-allowed', 'provider-key',
    'import-backup', 'import-file', 'clear-local-data', 'toast'
  ]) {
    assert.match(html, new RegExp('id="' + id + '"'), 'missing HTML element #' + id);
  }
  assert.match(html, /id="essay-editor"[^>]*aria-describedby=/);
  assert.match(html, /id="coach-status"[^>]*aria-live="polite"/);
  assert.match(html, /id="settings-status"[^>]*aria-live="polite"/);
  assert.match(html, /id="import-file"[^>]*accept="\.json,application\/json"/);
});

test('production source uses local assets only and has motion/contrast adaptations', () => {
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i);
  assert.doesNotMatch(html, /<link[^>]+href=["']https?:\/\//i);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /forced-colors/);
  assert.match(css, /@media\s*\(max-width:\s*650px\)/);
  assert.match(css, /:focus-visible/);
});

test('assessment uses a locked submitted snapshot and backup restore passes through validation', () => {
  assert.match(app, /const snapshot = \{ task: \{ \.\.\.currentTask \}, essay \}/);
  assert.match(app, /editor\.readOnly = true/);
  assert.match(app, /reportStamp\(report, 'ai', snapshot\)/);
  assert.match(app, /parseLocalBackup\(await file\.text\(\), TASKS\.map\(task => task\.id\)\)/);
  assert.match(app, /localStorage\.removeItem\(COACH_PREFIX \+ task\.id\)/);
});
