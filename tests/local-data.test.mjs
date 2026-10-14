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

test('local backup history is capped and never imports a credential field', () => {
  const result = normaliseLocalBackup({
    schemaVersion: 1, apiKey: 'do-not-import', settings: { apiKey: 'secret' },
    history: Array.from({ length: 35 }, (_, index) => ({ ...validRecord, id: 'row-' + index }))
  }, taskIds);
  assert.equal(result.history.length, 30);
  assert.equal(Object.hasOwn(result, 'apiKey'), false);
  assert.equal(Object.hasOwn(result, 'settings'), false);
});
