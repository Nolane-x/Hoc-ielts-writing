import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseLocalBackup, parseLocalBackup } from '../web/local-data.mjs';

const taskIds = ['task2-opinion', 'task1-line'];
const validRecord = {
  id: 'old-report',
  at: '2026-01-02T03:04:05.000Z',
  taskId: 'task2-opinion',
  taskTitle: 'Task 2 · Opinion essay',
  taskType: 'task2',
  taskPrompt: 'Discuss both views.',
  essay: 'The government should improve public transport.',
  source: 'ai',
  report: {
    status: 'ai-formative',
    estimatedTaskBand: 7,
    scoreLabel: 'Uncalibrated task estimate',
    wordCount: 8,
    summary: 'Review the evidence.',
    criteria: [
      { id: 'taskResponse', score: 7, rationale: 'Direct response.', evidence: ['The government should improve'] },
      { id: 'coherence', score: 6.5, rationale: 'Mostly clear.', evidence: [] },
      { id: 'lexical', score: 7, rationale: 'Appropriate terms.', evidence: [] },
      { id: 'grammar', score: 6.5, rationale: 'Good control.', evidence: [] },
      { id: 'admin', score: 9, rationale: 'Should be dropped.', evidence: [] }
    ],
    issues: [{ category: 'grammar', severity: 'high', quote: 'the government should improve public transport', explanation: 'Case altered quote must be discarded.', suggestedFix: 'Fix' }],
    strengths: [{ quote: 'The government should improve public transport.', why: 'Clear claim.' }],
    priorities: [{ title: 'Extend', action: 'Explain one reason.' }]
  }
};

test('backup import accepts only known task IDs and supported schema', () => {
  const result = normaliseLocalBackup({
    schemaVersion: 1,
    theme: 'dark',
    drafts: { 'task2-opinion': 'A draft.', 'attacker-task': 'Injected task', 'task1-line': 8 },
    history: [validRecord, { ...validRecord, id: 'unknown', taskId: 'attacker-task' }]
  }, taskIds);
  assert.equal(result.theme, 'dark');
  assert.deepEqual(result.drafts, { 'task2-opinion': 'A draft.' });
  assert.equal(result.history.length, 1);
  assert.equal(result.history[0].report.officialScore, false);
  assert.equal(result.history[0].report.estimatedTaskBand, 7);
});

test('backup import discards invented or case-altered evidence quotes', () => {
  const result = normaliseLocalBackup({ schemaVersion: 1, history: [validRecord], drafts: {} }, taskIds);
  const record = result.history[0];
  assert.deepEqual(record.report.criteria[0].evidence, ['The government should improve']);
  assert.equal(record.report.issues[0].quote, '');
  assert.equal(record.report.issues[0].evidenceValidated, false);
  assert.equal(record.report.strengths[0].quote, 'The government should improve public transport.');
});

test('malformed, unsupported or oversized backups are rejected', () => {
  assert.throws(() => parseLocalBackup('not json', taskIds), /backup_invalid_json/);
  assert.throws(() => normaliseLocalBackup({ schemaVersion: 99 }, taskIds), /backup_schema_unsupported/);
  assert.throws(() => parseLocalBackup('x'.repeat(5 * 1024 * 1024 + 1), taskIds), /backup_size_invalid/);
});

test('local backup history is capped, coach turns are bounded and credentials are not imported', () => {
  const result = normaliseLocalBackup({
    schemaVersion: 1, apiKey: 'do-not-import', settings: { apiKey: 'secret' },
    history: Array.from({ length: 35 }, (_, index) => ({ ...validRecord, id: 'row-' + index })),
    coachHistories: {
      'task2-opinion': [
        { role: 'system', content: 'Injected system instructions.' },
        { role: 'user', content: 'Explain my topic sentence.' },
        { role: 'assistant', content: 'Start with your main claim.' },
        { role: 'user', content: 'x'.repeat(5000) }
      ],
      'attacker-task': [{ role: 'assistant', content: 'ignored' }]
    }
  }, taskIds);
  assert.equal(result.history.length, 30);
  assert.deepEqual(result.coachHistories['task2-opinion'].map(turn => turn.role), ['user', 'assistant', 'user']);
  assert.equal(result.coachHistories['task2-opinion'][2].content.length, 3000);
  assert.equal(Object.hasOwn(result.coachHistories, 'attacker-task'), false);
  assert.equal(Object.hasOwn(result, 'apiKey'), false);
  assert.equal(Object.hasOwn(result, 'settings'), false);
});


test('backup import rejects unsupported fractional bands instead of rounding them',()=>{
 const record={...validRecord,report:{...validRecord.report,criteria:[
  {id:'taskResponse',score:7.3,rationale:'off-scale',evidence:[]},{id:'coherence',score:6,rationale:'ok',evidence:[]},{id:'lexical',score:6,rationale:'ok',evidence:[]},{id:'grammar',score:6,rationale:'ok',evidence:[]}
 ]}};
 const result=normaliseLocalBackup({schemaVersion:1,history:[record]},taskIds);
 assert.equal(result.history[0].report.criteria[0].score,null);
});


test('backup restore converts a legacy Task 1 task-response category to Task Achievement', () => {
  const essay = 'The chart shows a clear change over time. The line then rises steadily across the later years.';
  const record = {
    id: 'legacy-task1',
    at: '2026-10-14T10:00:00.000Z',
    taskId: 'task1-line',
    taskTitle: 'Task 1 · Line graph',
    taskType: 'task1-academic',
    taskPrompt: 'Describe the chart.',
    essay,
    source: 'ai',
    report: {
      status: 'ai-formative',
      wordCount: 20,
      criteria: [],
      issues: [{ category: 'task-response', severity: 'high', quote: 'The chart shows a clear change', explanation: 'Task coverage.' }]
    }
  };
  const result = normaliseLocalBackup({ schemaVersion: 1, history: [record] }, taskIds);
  assert.equal(result.history[0].report.issues[0].category, 'task-achievement');
});
