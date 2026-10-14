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
    taskId: 'task2-opinion',
    essay: 'Example answer',
    report: {
      status: 'ai-formative',
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
    essay: 'A draft',
    report: {
      status: 'ai-formative',
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
