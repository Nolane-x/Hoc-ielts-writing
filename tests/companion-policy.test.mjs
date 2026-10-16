import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normaliseCustomTasks,
  evaluateProactiveReview,
  buildSpokenSummary
} from '../web/companion-policy.mjs';

const baseTasks = [{ id: 'task2-opinion' }];
const task = overrides => ({
  id: 'custom-demo-task-a1',
  type: 'task2',
  title: 'Custom task',
  prompt: 'Some people support this change while others disagree. Discuss both views and give your opinion.',
  goal: 'Present a clear position and support it with developed reasons.',
  ...overrides
});

test('custom task normalization bounds fields, whitelists task types and drops duplicate/base IDs', () => {
  const cleaned = normaliseCustomTasks([
    task(),
    task({ id: 'task2-opinion', title: 'Override base task' }),
    task({ id: 'custom-demo-task-a1', title: 'Duplicate ID' }),
    task({ id: 'custom-bad', type: 'shell' }),
    task({ id: 'custom-demo-task-b2', prompt: 'tiny' }),
    task({ id: 'custom-demo-task-c3', title: 'x'.repeat(500), prompt: 'P'.repeat(3000), goal: 'G'.repeat(800) })
  ], baseTasks);
  assert.equal(cleaned.length, 2);
  assert.equal(cleaned[0].id, 'custom-demo-task-a1');
  assert.equal(cleaned[1].title.length, 120);
  assert.equal(cleaned[1].prompt.length, 1600);
  assert.equal(cleaned[1].goal.length, 500);
  assert.equal(cleaned[1].estimatedMinutes, 40);
});

test('proactive review requires opt-in, provider permission, meaningful changed text, enough words and cooldown', () => {
  const previousDraft = 'A sentence repeated for this small fixture. '.repeat(5);
  const draft = previousDraft + 'I will now add a substantial paragraph with a clear reason and one specific example to support this position. '.repeat(3);
  const common = {
    enabled: true,
    providerAllowed: true,
    busy: false,
    draft,
    previousDraft,
    now: 500000,
    lastTriggeredAt: 100000,
    minChangedCharacters: 100,
    cooldownMs: 120000,
    minWords: 35
  };
  assert.equal(evaluateProactiveReview(common).eligible, true);
  assert.ok(evaluateProactiveReview(common).changedCharacters >= 100);
  assert.equal(evaluateProactiveReview({ ...common, enabled: false }).eligible, false);
  assert.ok(evaluateProactiveReview({ ...common, providerAllowed: false }).reasons.includes('provider-permission-off'));
  assert.ok(evaluateProactiveReview({ ...common, busy: true }).reasons.includes('workspace-busy'));
  assert.ok(evaluateProactiveReview({ ...common, lastTriggeredAt: 450000 }).reasons.includes('cooldown'));
  assert.ok(evaluateProactiveReview({ ...common, previousDraft: draft }).reasons.includes('not-enough-new-or-changed-text'));
});

test('spoken summary removes URLs, bounds length and avoids speaking empty content', () => {
  assert.equal(buildSpokenSummary('https://example.test A useful reminder.'), 'A useful reminder.');
  assert.equal(buildSpokenSummary('   '), '');
  assert.equal(buildSpokenSummary('A'.repeat(400), 40).length, 40);
  assert.match(buildSpokenSummary('token=abc123 has been redacted'), /đã ẩn thông tin nhạy cảm/);
  assert.doesNotMatch(buildSpokenSummary('key sk-123456789012345678901234567890'), /sk-123456789012345678901234567890/);
  assert.doesNotMatch(buildSpokenSummary('password=hunter2'), /hunter2/);
});


test('custom task bank has a hard maximum and accepts only unique namespaced IDs', () => {
  const candidates = Array.from({ length: 45 }, (_, index) => task({
    id: 'custom-example-task-' + String(index).padStart(2, '0'),
    title: 'Custom practice ' + index
  }));
  const normalized = normaliseCustomTasks(candidates, baseTasks);
  assert.equal(normalized.length, 30);
  assert.equal(new Set(normalized.map(item => item.id)).size, 30);
  assert.equal(normaliseCustomTasks(candidates, [{ id: 'custom-example-task-00' }]).length, 29);
});
