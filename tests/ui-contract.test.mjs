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
    'clear-coach-history', 'study-plan', 'rubric-guide', 'settings-form', 'external-allowed', 'provider-key',
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


test('adaptive recommendations remain connected to concrete task selection and learning data', () => {
  assert.match(app, /buildStudyPlan\(history, TASKS\)/);
  assert.match(app, /data-start-task=/);
  assert.match(app, /\$\('#study-plan'\)\.addEventListener\('click'/);
  assert.match(app, /setToast\('Đã mở đề luyện theo lộ trình:/);
});


test('rubric guide and revision comparison are wired into the learning/report flow',()=>{
 assert.match(app,/getRubricGuide\(currentTask\?\.type \|\| 'task2'\)/);
 assert.match(app,/buildRevisionComparison\(currentRecord, history\)/);
 assert.match(app,/So sánh với bản trước của cùng đề/);
 assert.match(app,/Model có thể dao động giữa các lượt/);
});


test('issue-category badges map technical category keys to Vietnamese and task-aware labels', () => {
  assert.match(app, /function issueCategoryLabel\(category, taskType\)/);
  assert.match(app, /escapeHtml\(issueCategoryLabel\(item\.category, report\.taskType\)\)/);
  assert.match(app, /'task-achievement': 'Task Achievement'/);
  assert.match(app, /'task-response': 'Task Response'/);
  assert.match(app, /grammar: 'Ngữ pháp'/);
});


test('annotated essay report uses an exact-match annotation engine and links spans to issue cards', () => {
  assert.match(app, /buildEssayAnnotations\(currentRecord\.essay, issues\)/);
  assert.match(app, /renderAnnotatedEssayText\(currentRecord\.essay, annotationResult, escapeHtml\)/);
  assert.match(app, /data-annotation-issue/);
  assert.match(app, /report-issue-' \+ index/);
  assert.match(app, /Chỉ trích dẫn khớp duy nhất và không chồng lấn mới được tô sáng/);
  assert.match(app, /Bản gốc không bị sửa/);
});
