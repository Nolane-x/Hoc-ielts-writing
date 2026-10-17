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


test('backup restores bounded Writing Agent artifacts and revision snapshots without credentials', () => {
  const backup = normaliseLocalBackup({
    schemaVersion: 1,
    apiKey: 'never import',
    settings: { apiKey: 'never import' },
    agentArtifacts: [
      { id: 'outline-1', taskId: 'task2-opinion', taskTitle: 'Task 2 Opinion', at: '2026-01-01T00:00:00Z', kind: 'outline', title: 'Argument outline', payload: { title: 'Argument outline', content: 'Position: ____. Reason: ____. Evidence: ____.' } },
      { id: 'exercise-1', taskId: 'task2-opinion', kind: 'exercise', title: 'Cohesion practice', payload: { skill: 'Cohesion', prompt: 'Write a transition sentence.', instructions: 'Connect the reason to the example.', successCriteria: 'The relationship between ideas is explicit.' } },
      { id: 'bad-task', taskId: 'attacker-task', kind: 'goal', title: 'Ignore task boundary', payload: { why: 'This goal should be ignored.', successCriteria: 'Do something.' } },
      { id: 'bad-kind', taskId: 'task2-opinion', kind: 'shell', title: 'Unsafe', payload: {} },
      { id: 'bad-exercise', taskId: 'task2-opinion', kind: 'exercise', title: 'Incomplete', payload: { skill: 'x', prompt: '', instructions: '', successCriteria: '' } }
    ],
    agentRevisions: {
      'task2-opinion': [
        { id: 'revision-1', at: '2026-01-01T00:00:00Z', label: 'Before edit', essay: 'Original essay.' },
        { id: 'bad', essay: 'E'.repeat(25000) }
      ],
      'attacker-task': [{ essay: 'must be ignored' }]
    }
  }, taskIds);
  assert.equal(backup.agentArtifacts.length, 2);
  assert.deepEqual(backup.agentArtifacts[0].payload, { title: 'Argument outline', content: 'Position: ____. Reason: ____. Evidence: ____.' });
  assert.equal(backup.agentRevisions['task2-opinion'].length, 2);
  assert.equal(backup.agentRevisions['task2-opinion'][1].essay.length, 20000);
  assert.equal(Object.hasOwn(backup.agentRevisions, 'attacker-task'), false);
  assert.equal(Object.hasOwn(backup, 'apiKey'), false);
  assert.equal(Object.hasOwn(backup, 'settings'), false);
});


test('backup normalises Writing Agent practice journal records without trusting unsupported task IDs', () => {
  const backup = normaliseLocalBackup({
    schemaVersion: 1,
    drafts: {},
    history: [],
    agentPracticeAttempts: [
      { id:'attempt-good', taskId:'task2-opinion', taskTitle:'Task 2 Opinion', skill:'Cohesion', prompt:'Link a reason to an example.', instructions:'Write one linking sentence.', successCriteria:'The logic is clear.', answer:'This matters because it explains the mechanism.', submittedAt:'2026-10-14T12:00:00Z', status:'feedback-received', feedback:'Explain the mechanism more specifically.', feedbackSource:'ai-provider', reviewedAt:'2026-10-14T12:05:00Z' },
      { id:'attempt-bad-task', taskId:'not-a-task', skill:'x', prompt:'Invalid prompt', instructions:'Invalid instruction', successCriteria:'Invalid criteria', answer:'Answer.' },
      { id:'attempt-invalid', taskId:'task2-opinion', skill:'x', prompt:'Short', instructions:'Short', successCriteria:'Short', answer:'Answer.' }
    ]
  }, taskIds);
  assert.equal(backup.agentPracticeAttempts.length, 1);
  assert.equal(backup.agentPracticeAttempts[0].feedbackSource, 'ai-provider');
  assert.equal(backup.agentPracticeAttempts[0].status, 'feedback-received');
});


test('backup preserves bounded custom prompts and scratchpad notes without accepting arbitrary task IDs', () => {
  const validCustom = {
    id: 'custom-example-task-a1',
    type: 'task2',
    title: 'A custom practice task',
    group: 'Learner-created',
    difficulty: 'Custom',
    skillFocus: 'Argument development',
    prompt: 'Some people believe online learning is more effective, while others disagree. Discuss both views and give your opinion.',
    goal: 'Present a clear position supported by developed reasons.',
    provenance: 'ai-generated-unverified'
  };
  const backup = normaliseLocalBackup({
    schemaVersion: 1,
    customTasks: [
      validCustom,
      { ...validCustom, id: 'attacker-task', title: 'Bad identifier' },
      { ...validCustom, id: 'custom-example-task-b2', type: 'shell' }
    ],
    drafts: { 'custom-example-task-a1': 'A saved custom draft.', 'attacker-task': 'drop this' },
    examNotes: { 'custom-example-task-a1': 'Compare the two positions.', 'attacker-task': 'ignore this', 'task2-opinion': 'N'.repeat(400) }
  }, taskIds);
  assert.equal(backup.customTasks.length, 1);
  assert.equal(backup.customTasks[0].provenance, 'ai-generated-unverified');
  assert.deepEqual(backup.drafts, { 'custom-example-task-a1': 'A saved custom draft.' });
  assert.equal(backup.examNotes['custom-example-task-a1'], 'Compare the two positions.');
  assert.equal(backup.examNotes['task2-opinion'].length, 280);
  assert.equal(Object.hasOwn(backup.drafts, 'attacker-task'), false);
});
