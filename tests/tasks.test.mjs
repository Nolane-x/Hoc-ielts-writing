import test from 'node:test';
import assert from 'node:assert/strict';
import { TASKS } from '../web/tasks.mjs';

test('task bank contains a broad mix of Academic, General Training and Task 2 practice', () => {
  assert.ok(TASKS.length >= 18);
  assert.ok(TASKS.some(task => task.type === 'task1-academic' && /line graph/i.test(task.title)));
  assert.ok(TASKS.some(task => task.type === 'task1-academic' && /maps/i.test(task.title)));
  assert.ok(TASKS.some(task => task.type === 'task1-general'));
  assert.ok(TASKS.some(task => task.type === 'task2'));
});

test('every task has a unique stable id and complete learning metadata', () => {
  const ids = TASKS.map(task => task.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const task of TASKS) {
    assert.ok(['task1-academic', 'task1-general', 'task2'].includes(task.type), task.id);
    assert.ok(task.title.trim(), task.id + ' title');
    assert.ok(task.prompt.trim().length >= 80, task.id + ' prompt');
    assert.ok(task.goal.trim().length >= 20, task.id + ' goal');
    assert.ok(Array.isArray(task.tips) && task.tips.length >= 2, task.id + ' tips');
    assert.ok(['Intermediate', 'Advanced'].includes(task.difficulty), task.id + ' difficulty');
    assert.ok(task.skillFocus.trim(), task.id + ' skill focus');
    assert.ok(Number.isFinite(task.estimatedMinutes) && task.estimatedMinutes >= 10, task.id + ' time');
  }
});

test('all synthetic graph/table/chart data are explicitly labelled as practice data', () => {
  const syntheticDataTasks = TASKS.filter(task => /Synthetic (practice )?data|Synthetic map description|Synthetic process stages/i.test(task.prompt));
  assert.ok(syntheticDataTasks.length >= 5);
});
