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


test('learner profile only derives criteria and recurring patterns from eligible AI assessments', () => {
  assert.match(app, /buildRecurringErrorPatterns\(history\)/);
  assert.match(app, /learnerCriterionSummary\(history\)/);
  assert.match(app, /eligibleAIRecords\(history\)/);
  assert.match(app, /Nhóm lỗi xuất hiện qua nhiều bài/);
  assert.match(app, /Tách Task Achievement và Task Response/);
});

test('resolved issue buttons restore their persisted state when a report is reopened', () => {
  assert.match(app, /aria-pressed="' \+ String\(item\.userMarkedResolved === true\)/);
  assert.match(app, /item\.userMarkedResolved === true \? '✓ Đã xử lý · Hoàn tác'/);
});


test('Writing Agent workspace exposes real-time status, staged edits, cancellation and revision recovery', () => {
  for (const id of [
    'agent-workspace', 'agent-task-input', 'run-writing-agent', 'cancel-writing-agent',
    'agent-live-status', 'agent-activity', 'agent-result', 'agent-saved-artifacts',
    'agent-revisions', 'agent-revision-list'
  ]) assert.match(html, new RegExp('id="' + id + '"'), 'missing Writing Agent control #' + id);
  assert.match(app, /fetch\('\/api\/agent'/);
  assert.match(app, /consumeWritingAgentStream\(response\)/);
  assert.match(app, /AbortController\(\)/);
  assert.match(app, /applyAgentPatches\(\[Number\(patchButton\.dataset\.agentPatch\)\]\)/);
  assert.match(app, /persistAgentRevision\(agentResultTaskId, essay/);
  assert.match(app, /data-agent-restore/);
  assert.match(css, /\.agent-activity-item/);
  assert.match(css, /\.agent-patch-card/);
  assert.match(app, /agentArtifacts: agentSavedArtifacts\(\)/);
  assert.match(app, /agentRevisions\[task\.id\] = agentRevisionSnapshots\(task\.id\)/);
});


test('Writing Agent task-bank suggestions are rendered from local results and revisions fail safely', () => {
  assert.match(app, /const practiceMatches = Array\.isArray\(result\.practiceMatches\)/);
  assert.match(app, /data-agent-start-task=/);
  assert.match(app, /function openAgentPracticeTask\(taskId\)/);
  assert.match(app, /TASKS\.find\(item => item\.id === taskId\)/);
  assert.match(app, /hasStructuredOutput/);
  assert.match(app, /Không áp dụng sửa đổi vì WMR chưa thể lưu bản trước để hoàn tác/);
  assert.match(app, /Không thể khôi phục vì chưa lưu được nội dung editor hiện tại/);
});


test('native Writing Agent reserves one conservative session estimate and passes cancellation into provider calls', () => {
  assert.match(app, /async function reserveNativeAgentSession\(config, input\)/);
  assert.match(app, /estimateWritingAgentSessionCost\(config, input, settings\.maxOutputTokens\)/);
  assert.match(app, /complete: async \(\{ messages, maxOutputTokens, signal \}\) => await requestCompletion\(/);
  assert.match(app, /estimatedSessionCostUsd/);
  assert.match(app, /metadataLine/);
});


test('Writing Agent passes an aggregate local learner profile and discloses what can be sent', () => {
  assert.match(app, /function buildAgentLearningContext\(\)/);
  assert.match(app, /learningContext: buildAgentLearningContext\(\)/);
  assert.match(app, /eligibleAIRecords\(history\)/);
  assert.match(app, /recurringPatterns:/);
  assert.match(html, /không gửi nguyên văn bài cũ/);
  assert.match(app, /issueCategories,/);
  assert.match(app, /resolvedIssues:/);
});


test('Settings exposes a separate budget for a multi-turn Writing Agent session', () => {
  assert.match(html, /id="max-agent-session-budget"[^>]*name="maxAgentSessionUsd"/);
  assert.match(app, /maxAgentSessionUsd: Number\(\$\('#max-agent-session-budget'\)\.value\)/);
  assert.match(app, /\$\('#max-agent-session-budget'\)\.value = settings\.maxAgentSessionUsd/);
  assert.match(app, /cost > settings\.maxAgentSessionUsd/);
  assert.match(html, /TỐI ĐA CẢ PHIÊN AGENT/);
});


test('micro-practice answers persist locally and the practice journal clearly distinguishes feedback from mastery', () => {
  assert.match(html, /id="agent-practice-journal"/);
  assert.match(app, /const AGENT_PRACTICE_ATTEMPTS_KEY/);
  assert.match(app, /function renderAgentPracticeJournal\(\)/);
  assert.match(app, /createAgentPracticeAttempt\(/);
  assert.match(app, /agentPracticeAttempts: agentPracticeAttempts\(\)/);
  assert.match(app, /localStorage\.setItem\(AGENT_PRACTICE_ATTEMPTS_KEY, JSON\.stringify\(backup\.agentPracticeAttempts \|\| \[\]\)\)/);
  assert.match(app, /feedbackSource: response\?\.source === 'configuration-message'/);
  assert.match(app, /không phải band hay bằng chứng đã thành thạo/i);
  assert.match(app, /Đã xóa lượt luyện khỏi nhật ký cục bộ/);
});
