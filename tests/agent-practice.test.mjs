import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAgentPracticeSummary,
  createAgentPracticeAttempt,
  normaliseAgentPracticeAttempts
} from '../web/agent-practice.mjs';

const taskIds = ['task2-opinion', 'task1-academic'];
const validAttempt = overrides => ({
  id: 'attempt-1',
  taskId: 'task2-opinion',
  taskTitle: 'Task 2 Opinion',
  exerciseId: 'agent-exercise-1',
  skill: 'Cohesion',
  prompt: 'Connect one reason to an example.',
  instructions: 'Write one sentence that links the reason to its example.',
  successCriteria: 'The link between the claim and example is explicit.',
  answer: 'This matters because it provides a clear link.',
  submittedAt: '2026-10-14T12:00:00.000Z',
  status: 'awaiting-feedback',
  feedback: '',
  feedbackSource: 'unavailable',
  reviewedAt: '',
  ...overrides
});

test('practice attempt creation accepts bounded local learner writing and rejects invalid content', () => {
  const attempt = createAgentPracticeAttempt(validAttempt(), taskIds);
  assert.equal(attempt.taskId, 'task2-opinion');
  assert.equal(attempt.status, 'awaiting-feedback');
  assert.throws(() => createAgentPracticeAttempt(validAttempt({ taskId: 'attacker-task' }), taskIds), /agent_practice_attempt_invalid/);
  assert.throws(() => createAgentPracticeAttempt(validAttempt({ answer: ' ' }), taskIds), /agent_practice_attempt_invalid/);
});

test('practice journal normalisation enforces task boundaries, text limits and record caps', () => {
  const attempts = normaliseAgentPracticeAttempts([
    validAttempt({ answer: 'A'.repeat(5000) }),
    validAttempt({ id: 'bad-task', taskId: 'not-a-task' }),
    validAttempt({ id: 'bad-feedback', status: 'feedback-received', feedback: '' }),
    validAttempt({ id: 'good-ai', status: 'feedback-received', feedback: 'Try linking the reason more directly.', feedbackSource: 'ai-provider' })
  ], taskIds);
  assert.equal(attempts.length, 3);
  assert.equal(attempts[0].answer.length, 4000);
  assert.equal(attempts[1].status, 'feedback-unavailable');
  assert.equal(attempts[2].feedbackSource, 'ai-provider');

  const tooMany = Array.from({ length: 120 }, (_, index) => validAttempt({ id: 'attempt-' + index }));
  assert.equal(normaliseAgentPracticeAttempts(tooMany, taskIds).length, 100);
});

test('practice summaries report attempts and feedback coverage without implying mastery', () => {
  const attempts = normaliseAgentPracticeAttempts([
    validAttempt(),
    validAttempt({ id: 'attempt-2', status: 'feedback-received', feedback: 'Your logic is clear.', feedbackSource: 'local-guide', reviewedAt: '2026-10-14T12:05:00Z' }),
    validAttempt({ id: 'attempt-3', skill: 'Task Response', taskId: 'task2-opinion', status: 'feedback-unavailable' }),
    validAttempt({ id: 'attempt-4', taskId: 'task1-academic', skill: 'Overview' })
  ], taskIds);
  const summary = buildAgentPracticeSummary(attempts, 'task2-opinion');
  assert.equal(summary.attemptCount, 3);
  assert.equal(summary.feedbackCount, 1);
  assert.equal(summary.awaitingFeedbackCount, 1);
  assert.equal(summary.unavailableFeedbackCount, 1);
  assert.ok(summary.skills.some(item => item.skill === 'Cohesion' && item.attemptCount === 2));
  assert.match(summary.interpretation, /not a band score/i);
});


test('provider configuration notices are not counted as tutoring feedback', () => {
  const records = normaliseAgentPracticeAttempts([
    {
      id: 'configuration-message',
      taskId: 'task2-opinion',
      skill: 'Cohesion',
      prompt: 'Connect the reason to an example.',
      instructions: 'Write one linking sentence.',
      successCriteria: 'The logical link is clear.',
      answer: 'This matters because the example supports the reason.',
      submittedAt: '2026-10-14T12:00:00Z',
      status: 'feedback-received',
      feedback: 'Please configure the provider first.',
      feedbackSource: 'configuration-message'
    }
  ], taskIds);
  assert.equal(records.length, 1);
  assert.equal(records[0].status, 'feedback-unavailable');
  assert.equal(records[0].feedback, '');
  assert.equal(records[0].feedbackSource, 'configuration-message');
  assert.equal(buildAgentPracticeSummary(records, 'task2-opinion').feedbackCount, 0);
});
