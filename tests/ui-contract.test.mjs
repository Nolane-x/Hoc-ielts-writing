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
  assert.match(app, /parseLocalBackup\(await file\.text\(\), tasks\.map\(task => task\.id\)\)/);
  assert.match(app, /localStorage\.removeItem\(COACH_PREFIX \+ task\.id\)/);
});


test('adaptive recommendations remain connected to concrete task selection and learning data', () => {
  assert.match(app, /buildStudyPlan\(history, tasks\)/);
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
  assert.match(app, /tasks\.find\(item => item\.id === taskId\)/);
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
  assert.match(app, /changes\[AGENT_PRACTICE_ATTEMPTS_KEY\] = JSON\.stringify\(backup\.agentPracticeAttempts \|\| \[\]\)/);
  assert.match(app, /applyStorageTransaction\(localStorage, changes\)/);
  assert.match(app, /feedbackSource: response\?\.source === 'configuration-message'/);
  assert.match(app, /không phải band hay bằng chứng đã thành thạo/i);
  assert.match(app, /Đã xóa lượt luyện khỏi nhật ký cục bộ/);
});


test('adaptive learning page surfaces device-local micro-practice coverage without inferring mastery', () => {
  assert.match(html, /id="agent-practice-overview"/);
  assert.match(app, /function renderAgentPracticeOverview\(\)/);
  assert.match(app, /renderAgentPracticeOverview\(\);/);
  assert.match(app, /buildAgentPracticeSummary\(attempts\)/);
  assert.match(app, /không phải band IELTS, đánh giá chất lượng câu trả lời hay bằng chứng người học đã thành thạo/i);
  assert.match(app, /agent-practice-overview-metrics/);
});


test('Editorial Studio exposes exam timer, zen mode, word progress gauge, co-pilot switcher and agent presets', () => {
  for (const id of [
    'exam-timer', 'timer-display', 'timer-toggle', 'timer-reset',
    'zen-toggle', 'word-progress-fill', 'paragraph-count', 'toggle-prompt'
  ]) {
    assert.match(html, new RegExp('id="' + id + '"'), 'missing Editorial Studio control #' + id);
  }
  assert.match(html, /data-copilot-tab="agent"/);
  assert.match(html, /data-agent-preset=/);
  assert.match(app, /function toggleExamTimer\(\)/);
  assert.match(app, /function setCopilotTab\(/);
  assert.match(css, /\.agent-workspace-panel\.is-running/);
});


test('Full-Cycle IELTS Academy WMR 2.0 exposes Idea Lab, IDP/BC Simulator, Socratic Gym, Radar SVG and Print Dossier', () => {
  for (const id of [
    'idea-lab', 'task-deconstruct-view', 'topic-lexical-bank', 'outline-builder', 'insert-outline',
    'exam-mode-toggle', 'highlight-prompt-selection', 'clear-prompt-highlights', 'exam-notes-input',
    'socratic-gym-panel', 'gym-collocation-drill', 'gym-cohesion-puzzle',
    'mastery-radar-panel', 'mastery-radar-chart', 'print-report'
  ]) {
    assert.match(html, new RegExp('id="' + id + '"'), 'missing WMR 2.0 control #' + id);
  }
  assert.match(html, /data-copilot-tab="gym"/);
  assert.match(css, /\.idp-bc-mode/);
  assert.match(css, /\.timer-warning/);
  assert.match(css, /\.timer-critical/);
  assert.match(css, /\.sentence-surgery-card/);
  assert.match(css, /\.parallel-model-grid/);
  assert.match(css, /\.mastery-radar-svg/);
  assert.match(css, /@media print/);
  assert.match(app, /renderMasteryRadarSvg\(/);
  assert.match(app, /buildSentenceSurgery\(/);
  assert.match(app, /evaluateCollocationChoice\(/);
  assert.match(app, /evaluateCohesionOrder\(/);
});



test('proactive Writing Companion requires explicit opt-in and exposes user-controlled task, annotation and voice flows', () => {
  for (const id of [
    'custom-task-panel', 'custom-task-type', 'custom-task-title', 'custom-task-prompt',
    'custom-task-goal', 'save-custom-task', 'generate-custom-task',
    'proactive-review-toggle', 'voice-reminder-toggle', 'proactive-threshold',
    'companion-status', 'live-annotation-panel', 'live-annotation-preview',
    'live-annotation-list', 'clear-live-annotations', 'exam-notes-input'
  ]) assert.ok(html.includes('id="' + id + '"'), 'missing companion control #' + id);
  for (const marker of [
    'async function generateCustomTaskWithAI()',
    'if (!settings.externalAllowed)',
    'evaluateProactiveReview({',
    'PROACTIVE_COOLDOWN_MS',
    'scratchpadNotes:',
    'function renderLiveAnnotationPreview(',
    'data-live-annotation=',
    'applyAgentPatches(',
    'globalThis.speechSynthesis',
    'changes[CUSTOM_TASKS_KEY]',
    'changes[EXAM_NOTES_PREFIX + id]'
  ]) assert.ok(app.includes(marker), 'missing implementation marker: ' + marker);
  assert.doesNotMatch(app, /getUserMedia|getDisplayMedia|navigator\.mediaDevices/);
  assert.match(html, /ghi chú riêng của đề hiện tại/);
  assert.match(html, /Tắt quyền provider sẽ yêu cầu dừng lượt tự động đang chạy/);
  assert.match(css, /\.app-shell\.idp-bc-mode \.custom-task-panel/);
});

test('AI-created prompts remain drafts until explicit save/open and stay labelled unverified', () => {
  assert.match(app, /provenance: generatedTaskDraft \? 'ai-generated-unverified' : 'learner-supplied'/);
  assert.match(app, /Đề AI tạo chưa được kiểm định độc lập/);
  assert.match(app, /persistCustomTask\(task, true\)/);
  assert.match(app, /if \(!settings\.externalAllowed\)/);
  assert.ok(app.includes("postJson('/api/tasks/generate', { taskType: type, topic, learnerIdea: learnerHint }, { signal: controller.signal })"),
    'Generation must use the dedicated data-minimized endpoint and pass an abort signal.');
  assert.doesNotMatch(app, /postJson\('\/api\/tasks\/generate', \{[^}]*essay:/);
  assert.ok(app.includes('let taskGenerationController = null;'));
  assert.ok(app.includes('taskGenerationController.abort();'));
  assert.ok(app.includes("timeoutMs: 45000, signal: controller.signal });"),
    'Native provider calls must receive the abort signal.');
  assert.ok(app.includes("{ signal: controller.signal });"),
    'Web requests must receive the abort signal.');
  assert.ok(app.includes("$('#custom-task-type')?.addEventListener('change', () => {"));
  assert.ok(app.includes("parseGeneratedTaskResponse(answer, type)"));
});


test('proactive review never reuses a change timer or baseline across task switches', () => {
  assert.ok(app.includes("function loadCurrentTask() {\n  clearTimeout(proactiveTimer);\n  proactiveTimer = 0;"),
    'Switching/reloading a task must cancel a timer created for a different draft.');
  assert.ok(app.includes('lastAgentSnapshotDraft = readDraft(currentTask.id);'),
    'Each task must establish its own local draft baseline.');
  assert.ok(app.includes('if (!settings.externalAllowed && agentSessionProactive)'),
    'Revoking provider permission must request cancellation of an active automatic review.');
});

test('custom task navigation preserves the current draft and refuses task changes during AI work', () => {
  for (const snippet of [
    'if (agentBusy || coachBusy || submitting)',
    'if (currentTask?.id !== taskId) saveDraft();',
    'Không mở đề mới vì chưa lưu được bản nháp hiện tại',
    'Không xóa đề vì chưa lưu được bản nháp đang mở',
    'Không lưu được bản nháp hiện tại; đề mới chưa được lưu hoặc mở.'
  ]) assert.ok(app.includes(snippet), 'missing draft-preservation invariant: ' + snippet);
});

test('saved custom-task deletion requires confirmation and rolls related device data back on failure', () => {
  for (const id of ['custom-task-manager', 'custom-task-count']) {
    assert.ok(html.includes('id="' + id + '"'), 'missing custom task manager mount #' + id);
  }
  for (const marker of [
    'function renderCustomTaskManager()',
    'function openCustomTask(taskId)',
    'function deleteCustomTask(taskId)',
    '((coachBusy || submitting) && currentTask?.id === taskId)',
    'generationFields.forEach(field => { field.disabled = true; })',
    'generationFields.forEach(field => { field.disabled = false; })',
    'if (customTasks.length >= 30)',
    'globalThis.crypto?.randomUUID',
    'const approved = confirm(',
    'applyStorageTransaction(localStorage, changes)',
    '[DRAFT_PREFIX + taskId]: null',
    '[COACH_PREFIX + taskId]: null',
    '[EXAM_NOTES_PREFIX + taskId]: null',
    '[agentRevisionKey(taskId)]: null',
    'agentPracticeAttempts().filter(item => item.taskId !== taskId)',
    'agentSavedArtifacts().filter(item => item.taskId !== taskId)'
  ]) assert.ok(app.includes(marker), 'missing delete safety marker: ' + marker);
  assert.ok(app.includes("if (!proactive) $('#agent-task-input').value = message;"),
    'Automatic review must not replace the learner-authored Agent objective.');
});
