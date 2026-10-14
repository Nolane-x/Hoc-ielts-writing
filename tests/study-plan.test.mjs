import test from 'node:test';
import assert from 'node:assert/strict';
import { TASKS } from '../web/tasks.mjs';
import { buildStudyPlan } from '../web/study-plan.mjs';

test('new learners get a starter plan with real supported tasks and measurable goals', () => {
  const plan = buildStudyPlan([], TASKS);
  assert.equal(plan.adaptive, false);
  assert.equal(plan.steps.length, 3);
  for (const step of plan.steps) {
    assert.ok(TASKS.some(task => task.id === step.taskId));
    assert.ok(step.minutes >= 10 && step.minutes <= 60);
    assert.ok(step.success.length > 10);
  }
});

test('study plan prioritises the lowest observed AI criterion and includes practice transfer', () => {
  const history = [{
    id: 'assessment-task2-1',
    source: 'ai',
    taskId: 'task2-opinion',
    taskType: 'task2',
    essay: ('Example answer with a reason and supporting detail. ').repeat(12),
    report: {
      status: 'ai-formative',
      taskType: 'task2',
      wordCount: 120,
      criteria: [
        { id: 'taskResponse', score: 7, rationale: 'ok', evidence: [] },
        { id: 'coherence', score: 5.5, rationale: 'needs work', evidence: [] },
        { id: 'lexical', score: 6.5, rationale: 'fine', evidence: [] },
        { id: 'grammar', score: 7, rationale: 'fine', evidence: [] }
      ]
    }
  }];
  const plan = buildStudyPlan(history, TASKS, 3);
  assert.equal(plan.adaptive, true);
  assert.equal(plan.weakestCriteria[0].id, 'coherence');
  assert.equal(plan.steps[0].taskId, 'task2-discussion');
  assert.equal(plan.steps[1].taskId, 'task1-line');
});

test('local-only reports without AI criterion scores do not invent a weak criterion', () => {
  const plan = buildStudyPlan([{ essay: 'draft', report: { status: 'local-preflight', criteria: [], issues: [] } }], TASKS);
  assert.equal(plan.adaptive, false);
  assert.match(plan.basis, /chưa có điểm tiêu chí AI hợp lệ/i);
});

test('invalid scores and missing tasks cannot leak into recommended plan output', () => {
  const history = [{
    essay: 'A draft',
    report: { criteria: [{ id: 'grammar', score: 99 }, { id: 'unknown', score: 1 }, { id: 'lexical', score: -3 }] }
  }];
  const plan = buildStudyPlan(history, TASKS, 90);
  assert.equal(plan.adaptive, false);
  assert.equal(plan.steps.length, 3);
  assert.ok(plan.steps.every(step => TASKS.some(task => task.id === step.taskId)));
});


test('null or absent criterion scores are treated as missing rather than zero', () => {
  const history = [{
    id: 'assessment-task2-null',
    source: 'ai',
    taskId: 'task2-opinion',
    taskType: 'task2',
    essay: ('A sufficiently developed example sentence. ').repeat(15),
    report: {
      status: 'ai-formative',
      taskType: 'task2',
      wordCount: 90,
      criteria: [
        { id: 'taskResponse', score: null },
        { id: 'coherence', score: undefined },
        { id: 'lexical', score: '' },
        { id: 'grammar', score: 6 }
      ]
    }
  }];
  const plan = buildStudyPlan(history, TASKS);
  assert.equal(plan.adaptive, true);
  assert.equal(plan.weakestCriteria.length, 1);
  assert.equal(plan.weakestCriteria[0].id, 'grammar');
  assert.equal(plan.weakestCriteria[0].mean, 6);
});


test('Task 1 Task Achievement and Task 2 Task Response are aggregated separately', () => {
  const history = [
    {
      id: 'academic-task1', source: 'ai', taskId: 'task1-line', taskType: 'task1-academic',
      essay: ('The chart shows an upward trend. ').repeat(40),
      report: { status: 'ai-formative', taskType: 'task1-academic', wordCount: 160, criteria: [
        { id: 'taskResponse', score: 5.5 }, { id: 'coherence', score: 6 }, { id: 'lexical', score: 6 }, { id: 'grammar', score: 6 }
      ] }
    },
    {
      id: 'task2-opinion-stronger', source: 'ai', taskId: 'task2-opinion', taskType: 'task2',
      essay: ('The policy has benefits because it solves a specific problem. ').repeat(45),
      report: { status: 'ai-formative', taskType: 'task2', wordCount: 270, criteria: [
        { id: 'taskResponse', score: 7 }, { id: 'coherence', score: 7 }, { id: 'lexical', score: 7 }, { id: 'grammar', score: 7 }
      ] }
    }
  ];
  const plan = buildStudyPlan(history, TASKS);
  assert.equal(plan.adaptive, true);
  assert.equal(plan.weakestCriteria[0].id, 'taskAchievement');
  assert.equal(plan.steps[0].taskId, 'task1-line');
});

test('local reports with artificial criterion scores cannot influence adaptive ranking', () => {
  const history = [{
    source: 'local', taskId: 'task2-opinion', taskType: 'task2', essay: 'A draft',
    report: { status: 'local-fallback', taskType: 'task2', wordCount: 300, criteria: [
      { id: 'taskResponse', score: 1 }, { id: 'coherence', score: 1 }, { id: 'lexical', score: 1 }, { id: 'grammar', score: 1 }
    ] }
  }];
  const plan = buildStudyPlan(history, TASKS);
  assert.equal(plan.adaptive, false);
  assert.match(plan.basis, /chưa có điểm tiêu chí AI hợp lệ/i);
});
