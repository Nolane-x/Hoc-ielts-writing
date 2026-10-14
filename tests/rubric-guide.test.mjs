import test from 'node:test';
import assert from 'node:assert/strict';
import { getRubricGuide } from '../web/rubric-guide.mjs';

test('rubric guide labels Task Achievement for Task 1 and Task Response for Task 2', () => {
  assert.equal(getRubricGuide('task1-academic')[0].title, 'Task Achievement');
  assert.equal(getRubricGuide('task1-general')[0].title, 'Task Achievement');
  assert.equal(getRubricGuide('task2')[0].title, 'Task Response');
});

test('all four criteria provide bounded band 5–9 teaching signals, risks and practice moves', () => {
  for (const taskType of ['task1-academic', 'task1-general', 'task2']) {
    const guide = getRubricGuide(taskType);
    assert.equal(guide.length, 4);
    for (const criterion of guide) {
      assert.deepEqual(criterion.bands.map(item => item.score), [5,6,7,8,9]);
      for (const item of criterion.bands) {
        assert.ok(item.signal.length > 12);
        assert.ok(item.risk.length > 8);
        assert.ok(item.practice.length > 8);
      }
    }
  }
});

test('Task 1 guidance distinguishes data-summary and letter-purpose obligations', () => {
  assert.match(getRubricGuide('task1-academic')[0].overview, /overview/i);
  assert.match(getRubricGuide('task1-general')[0].overview, /bức thư/);
  assert.match(getRubricGuide('task2')[0].overview, /lập trường/);
});
