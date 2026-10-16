const TASK_TYPES = new Set(['task1-academic', 'task1-general', 'task2']);
const BASE_ID = /^[a-z0-9][a-z0-9-]{2,100}$/;
const CUSTOM_ID = /^custom-[a-z0-9-]{4,60}$/;

function bounded(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function normaliseCustomTasks(value, baseTasks = []) {
  if (!Array.isArray(value)) return [];
  const reserved = new Set((Array.isArray(baseTasks) ? baseTasks : []).map(task => task?.id).filter(Boolean));
  const accepted = [];
  for (const item of value.slice(0, 50)) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const id = bounded(item.id, 72);
    const type = TASK_TYPES.has(item.type) ? item.type : '';
    const title = bounded(item.title, 120);
    const prompt = bounded(item.prompt, 1600);
    const goal = bounded(item.goal, 500);
    const group = bounded(item.group, 60) || 'Đề tùy chỉnh';
    const difficulty = bounded(item.difficulty, 40) || 'Tùy chỉnh';
    const skillFocus = bounded(item.skillFocus, 160) || 'Luyện theo đề riêng';
    if (!CUSTOM_ID.test(id) || reserved.has(id) || !type || title.length < 3 || prompt.length < 20 || !goal) continue;
    reserved.add(id);
    accepted.push({
      id, type, title, group, difficulty,
      estimatedMinutes: type === 'task2' ? 40 : 20,
      skillFocus, prompt, goal,
      tips: Array.isArray(item.tips) ? item.tips.filter(tip => typeof tip === 'string').slice(0, 3).map(tip => bounded(tip, 180)).filter(Boolean) : [],
      provenance: item.provenance === 'ai-generated-unverified' ? 'ai-generated-unverified' : 'learner-supplied'
    });
    if (accepted.length >= 30) break;
  }
  return accepted;
}

function changedCharacters(beforeValue, afterValue) {
  const before = String(beforeValue || '');
  const after = String(afterValue || '');
  let prefix = 0;
  const minLength = Math.min(before.length, after.length);
  while (prefix < minLength && before[prefix] === after[prefix]) prefix++;
  let suffix = 0;
  while (suffix < minLength - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix++;
  return Math.max(before.length - prefix - suffix, after.length - prefix - suffix);
}

export function evaluateProactiveReview({
  enabled, providerAllowed, busy, draft, previousDraft,
  now = Date.now(), lastTriggeredAt = 0, minChangedCharacters = 100,
  cooldownMs = 120000, minWords = 35
} = {}) {
  const value = String(draft || '');
  const change = changedCharacters(previousDraft, value);
  const reasons = [];
  if (enabled !== true) reasons.push('disabled');
  if (providerAllowed !== true) reasons.push('provider-permission-off');
  if (busy === true) reasons.push('workspace-busy');
  if (value.trim().split(/\s+/u).filter(Boolean).length < minWords) reasons.push('draft-too-short');
  if (change < minChangedCharacters) reasons.push('not-enough-new-or-changed-text');
  const since = Number(now) - Number(lastTriggeredAt || 0);
  if (Number(lastTriggeredAt) > 0 && since < cooldownMs) reasons.push('cooldown');
  return { eligible: reasons.length === 0, reasons, changedCharacters: change, cooldownRemainingMs: Math.max(0, cooldownMs - since) };
}

export function buildSpokenSummary(value, maxLength = 320) {
  const clean = String(value || '')
    .replace(/https?:\/\/\S+/giu, ' ')
    .replace(/\b(?:https?:|www\.)\S+/giu, ' ')
    .replace(/\b(?:sk-[A-Za-z0-9_-]{16,}|AIza[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,})\b/giu, '[đã ẩn thông tin nhạy cảm]')
    .replace(/\b(?:api[_ -]?key|secret|token|password)\s*(?:[:=]\s*)\S+/giu, '[đã ẩn thông tin nhạy cảm]')
    .replace(/\b(?:api[_ -]?key|secret|token|password)\b/giu, '[đã ẩn thông tin nhạy cảm]')
    .replace(/[*_#>|{}]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
  if (!clean) return '';
  return clean.length > maxLength ? clean.slice(0, maxLength - 1).trimEnd() + '…' : clean;
}

export function isSafeCustomTaskType(value) {
  return TASK_TYPES.has(value) && BASE_ID.test(value);
}


export function parseGeneratedPracticeTask(raw, expectedTaskType) {
  if (!TASK_TYPES.has(expectedTaskType)) throw new Error('generated_task_type_invalid');
  const source = typeof raw === 'string' ? raw.trim().slice(0, 12000).replace(/^\\uFEFF/, '') : '';
  const unfenced = source.replace(/^\\s*```(?:json)?\\s*/i, '').replace(/\\s*```\\s*$/, '');
  const start = unfenced.indexOf('{');
  const end = unfenced.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('generated_task_json_missing');
  let parsed;
  try { parsed = JSON.parse(unfenced.slice(start, end + 1)); }
  catch { throw new Error('generated_task_json_invalid'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('generated_task_shape_invalid');
  const title = bounded(parsed.title, 120);
  const prompt = bounded(parsed.prompt, 1600);
  const goal = bounded(parsed.goal, 500);
  if (title.length < 3 || prompt.length < 40 || !goal) throw new Error('generated_task_fields_invalid');
  return {
    title, prompt, goal,
    taskType: expectedTaskType,
    provenance: 'ai-generated-unverified'
  };
}
