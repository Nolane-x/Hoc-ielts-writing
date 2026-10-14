const VALID_STATUSES = new Set(['awaiting-feedback', 'feedback-received', 'feedback-unavailable']);
const VALID_SOURCES = new Set(['ai-provider', 'local-guide', 'configuration-message', 'unavailable']);
const MAX_ATTEMPTS = 100;

function cleanText(value, max) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max)
    : '';
}

function parseDate(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString()
    : '';
}

export function normaliseAgentPracticeAttempts(input, validTaskIds) {
  const taskIds = new Set(Array.isArray(validTaskIds) ? validTaskIds.filter(item => typeof item === 'string') : []);
  if (!Array.isArray(input)) return [];
  return input.slice(0, MAX_ATTEMPTS).map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item) || !taskIds.has(item.taskId)) return null;
    const skill = cleanText(item.skill, 120);
    const prompt = cleanText(item.prompt, 900);
    const instructions = cleanText(item.instructions, 900);
    const successCriteria = cleanText(item.successCriteria, 500);
    const answer = cleanText(item.answer, 4000);
    if (!skill || prompt.length < 8 || instructions.length < 8 || successCriteria.length < 8 || !answer) return null;
    const feedback = cleanText(item.feedback, 3000);
    const rawStatus = VALID_STATUSES.has(item.status) ? item.status : 'awaiting-feedback';
    const rawSource = VALID_SOURCES.has(item.feedbackSource) ? item.feedbackSource : 'unavailable';
    const verifiedFeedback = feedback && ['ai-provider', 'local-guide'].includes(rawSource) ? feedback : '';
    const status = verifiedFeedback ? 'feedback-received' : rawStatus === 'feedback-received' || rawSource === 'configuration-message' ? 'feedback-unavailable' : rawStatus;
    const feedbackSource = verifiedFeedback ? rawSource : (rawSource === 'configuration-message' ? rawSource : 'unavailable');
    return {
      id: cleanText(item.id, 128) || 'practice-attempt-' + (index + 1),
      taskId: item.taskId,
      taskTitle: cleanText(item.taskTitle, 180) || item.taskId,
      exerciseId: cleanText(item.exerciseId, 128),
      skill,
      prompt,
      instructions,
      successCriteria,
      answer,
      submittedAt: parseDate(item.submittedAt) || new Date(0).toISOString(),
      status,
      feedback: verifiedFeedback,
      feedbackSource,
      reviewedAt: verifiedFeedback ? (parseDate(item.reviewedAt) || parseDate(item.submittedAt) || new Date(0).toISOString()) : ''
    };
  }).filter(Boolean).slice(0, MAX_ATTEMPTS);
}

export function buildAgentPracticeSummary(input, taskId = '') {
  const attempts = Array.isArray(input) ? input : [];
  const selected = attempts.filter(item => item && (!taskId || item.taskId === taskId));
  const bySkill = new Map();
  for (const attempt of selected) {
    const key = attempt.skill || 'Kỹ năng chưa đặt tên';
    const current = bySkill.get(key) || { skill: key, attemptCount: 0, feedbackCount: 0, latestAt: '' };
    current.attemptCount++;
    if (attempt.status === 'feedback-received' && attempt.feedback) current.feedbackCount++;
    if (!current.latestAt || Date.parse(attempt.submittedAt) > Date.parse(current.latestAt)) current.latestAt = attempt.submittedAt;
    bySkill.set(key, current);
  }
  return {
    attemptCount: selected.length,
    feedbackCount: selected.filter(item => item.status === 'feedback-received' && item.feedback).length,
    awaitingFeedbackCount: selected.filter(item => item.status === 'awaiting-feedback').length,
    unavailableFeedbackCount: selected.filter(item => item.status === 'feedback-unavailable').length,
    skills: [...bySkill.values()].sort((a, b) => b.attemptCount - a.attemptCount || a.skill.localeCompare(b.skill)).slice(0, 12),
    interpretation: 'Attempt counts and feedback coverage only; not a band score, skill mastery or proof of improvement.'
  };
}

export function createAgentPracticeAttempt(input, validTaskIds) {
  const records = normaliseAgentPracticeAttempts([input], validTaskIds);
  if (!records.length) throw new Error('agent_practice_attempt_invalid');
  return records[0];
}
