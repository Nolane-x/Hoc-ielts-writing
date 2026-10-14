import test from 'node:test';
import assert from 'node:assert/strict';
import { createLearningRecord } from '../web/learning-records.mjs';

test('assessment history remains bound to the immutable submitted task and essay snapshot', () => {
  const submittedTask = {
    id: 'task2-opinion',
    title: 'Task 2 · Opinion essay',
    type: 'task2',
    prompt: 'Original submitted prompt.'
  };
  const record = createLearningRecord({
    task: submittedTask,
    essay: 'The original essay sent to the assessment provider.',
    report: { status: 'ai-formative', estimatedTaskBand: 6.5 },
    source: 'ai',
    id: 'record-fixed',
    at: '2026-10-14T08:00:00.000Z'
  });
  // These objects represent later UI edits and must not mutate the stored submission snapshot.
  submittedTask.prompt = 'Prompt selected after submission.';
  const currentEditorText = 'Draft typed after the request started.';
  assert.equal(record.id, 'record-fixed');
  assert.equal(record.taskPrompt, 'Original submitted prompt.');
  assert.equal(record.essay, 'The original essay sent to the assessment provider.');
  assert.notEqual(record.essay, currentEditorText);
  assert.equal(record.source, 'ai');
});

test('learning record factory bounds stored fields and rejects invalid input', () => {
  const record = createLearningRecord({
    task: { id: 'task2-opinion', title: 'T'.repeat(300), type: 'unexpected', prompt: 'P'.repeat(6000) },
    essay: 'E'.repeat(25000),
    report: { status: 'local-preflight' },
    source: 'untrusted-source',
    id: 'i'.repeat(200)
  });
  assert.equal(record.taskTitle.length, 180);
  assert.equal(record.taskPrompt.length, 5000);
  assert.equal(record.essay.length, 20000);
  assert.equal(record.taskType, 'task2');
  assert.equal(record.source, 'local');
  assert.throws(() => createLearningRecord({ task: null, essay: '', report: {} }), /learning_record_task_invalid/);
  assert.throws(() => createLearningRecord({ task: { id: 'x' }, essay: 4, report: {} }), /learning_record_essay_invalid/);
  assert.throws(() => createLearningRecord({ task: { id: 'x' }, essay: '', report: [] }), /learning_record_report_invalid/);
});
