import { normaliseAgentPracticeAttempts } from './agent-practice.mjs';

const TASK_TYPES = new Set(['task1-academic', 'task1-general', 'task2']);
const CRITERION_IDS = new Set(['taskResponse', 'coherence', 'lexical', 'grammar']);
const CATEGORIES = new Set(['grammar', 'lexical', 'coherence', 'task-achievement', 'task-response', 'data-accuracy', 'register', 'other']);
const SEVERITIES = new Set(['critical', 'high', 'medium', 'low']);
const SOURCES = new Set(['local', 'ai', 'local-fallback']);
const THEMES = new Set(['light', 'dark', 'system']);
const MAX_BACKUP_CHARS = 5 * 1024 * 1024;

export function parseLocalBackup(text, validTaskIds) {
  if (typeof text !== 'string' || text.length > MAX_BACKUP_CHARS) throw new Error('backup_size_invalid');
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new Error('backup_invalid_json'); }
  return normaliseLocalBackup(parsed, validTaskIds);
}

export function normaliseLocalBackup(input, validTaskIds) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || input.schemaVersion !== 1) {
    throw new Error('backup_schema_unsupported');
  }
  const taskIds = new Set(Array.isArray(validTaskIds) ? validTaskIds.filter(x => typeof x === 'string') : []);
  const drafts = {};
  if (input.drafts && typeof input.drafts === 'object' && !Array.isArray(input.drafts)) {
    for (const [id, value] of Object.entries(input.drafts)) {
      if (taskIds.has(id) && typeof value === 'string') drafts[id] = value.slice(0, 20000);
    }
  }
  const history = Array.isArray(input.history)
    ? input.history.slice(0, 30).map((item, index) => normaliseRecord(item, index, taskIds)).filter(Boolean)
    : [];
  const coachHistories = {};
  if (input.coachHistories && typeof input.coachHistories === 'object' && !Array.isArray(input.coachHistories)) {
    for (const [id, turns] of Object.entries(input.coachHistories)) {
      if (!taskIds.has(id) || !Array.isArray(turns)) continue;
      coachHistories[id] = turns.slice(-8).map(turn => {
        const role = turn?.role;
        const content = cleanText(turn?.content, 3000);
        return ['user', 'assistant'].includes(role) && content ? { role, content } : null;
      }).filter(Boolean).slice(-8);
    }
  }
  const agentArtifacts = Array.isArray(input.agentArtifacts)
    ? input.agentArtifacts.slice(0, 100).map((item, index) => normaliseAgentArtifact(item, index, taskIds)).filter(Boolean)
    : [];
  const agentPracticeAttempts = normaliseAgentPracticeAttempts(input.agentPracticeAttempts, taskIds);
  const agentRevisions = {};
  if (input.agentRevisions && typeof input.agentRevisions === 'object' && !Array.isArray(input.agentRevisions)) {
    for (const [taskId, revisions] of Object.entries(input.agentRevisions)) {
      if (!taskIds.has(taskId) || !Array.isArray(revisions)) continue;
      agentRevisions[taskId] = revisions.slice(0, 5).map((item, index) => normaliseAgentRevision(item, index)).filter(Boolean);
    }
  }
  return {
    schemaVersion: 1,
    exportedAt: cleanText(input.exportedAt, 80),
    theme: THEMES.has(input.theme) ? input.theme : 'system',
    drafts,
    history,
    coachHistories,
    agentArtifacts,
    agentRevisions,
    agentPracticeAttempts
  };
}

function normaliseRecord(item, index, taskIds) {
  if (!item || typeof item !== 'object' || Array.isArray(item) ||
      !taskIds.has(item.taskId) || !item.report || typeof item.report !== 'object' ||
      typeof item.essay !== 'string') return null;
  const essay = item.essay.slice(0, 20000);
  const taskPrompt = cleanText(item.taskPrompt, 5000);
  const taskType = TASK_TYPES.has(item.taskType) ? item.taskType : 'task2';
  const at = typeof item.at === 'string' && Number.isFinite(Date.parse(item.at)) ? new Date(item.at).toISOString() : new Date().toISOString();
  const rawReport = item.report;
  const criteriaById = new Map((Array.isArray(rawReport.criteria) ? rawReport.criteria : []).filter(x => x && CRITERION_IDS.has(x.id)).map(x => [x.id, x]));
  const criteria = [...CRITERION_IDS].map(id => {
    const raw = criteriaById.get(id);
    const evidence = Array.isArray(raw?.evidence) ? raw.evidence.slice(0, 3).map(x => exactQuote(x, essay)).filter(Boolean) : [];
    return {
      id,
      title: ({ taskResponse: 'Task Achievement / Response', coherence: 'Coherence & Cohesion', lexical: 'Lexical Resource', grammar: 'Grammatical Range & Accuracy' })[id],
      score: bandValue(raw?.score),
      rationale: cleanText(raw?.rationale, 1200),
      evidence
    };
  });
  const issues = (Array.isArray(rawReport.issues) ? rawReport.issues : []).slice(0, 18).map((raw, idx) => {
    let category = CATEGORIES.has(raw?.category) ? raw.category : 'other';
    if (taskType !== 'task2' && category === 'task-response') category = 'task-achievement';
    const quote = exactQuote(raw?.quote, essay);
    return {
      id: 'issue-' + (idx + 1),
      category,
      severity: SEVERITIES.has(raw?.severity) ? raw.severity : 'medium',
      criterion: CRITERION_IDS.has(raw?.criterion) ? raw.criterion : 'other',
      title: cleanText(raw?.title, 120) || category,
      quote,
      explanation: cleanText(raw?.explanation, 1200),
      suggestedFix: cleanText(raw?.suggestedFix, 600),
      teachingHint: cleanText(raw?.teachingHint, 600),
      evidenceValidated: Boolean(quote),
      userMarkedResolved: raw?.userMarkedResolved === true
    };
  }).filter(x => x.quote || x.explanation);
  const strengths = (Array.isArray(rawReport.strengths) ? rawReport.strengths : []).slice(0, 6).map(raw => ({
    quote: exactQuote(raw?.quote, essay),
    why: cleanText(raw?.why, 600)
  })).filter(x => x.quote && x.why);
  const priorities = (Array.isArray(rawReport.priorities) ? rawReport.priorities : []).slice(0, 3).map(raw => ({
    title: cleanText(raw?.title, 120),
    action: cleanText(raw?.action, 500)
  })).filter(x => x.title && x.action);
  const status = rawReport.status === 'ai-formative' ? 'ai-formative' : 'local-preflight';
  return {
    id: cleanText(item.id, 128) || 'imported-' + (index + 1),
    at,
    taskId: item.taskId,
    taskTitle: cleanText(item.taskTitle, 180) || item.taskId,
    taskType,
    taskPrompt,
    essay,
    source: SOURCES.has(item.source) ? item.source : 'local',
    report: {
      schemaVersion: 1,
      createdAt: typeof rawReport.createdAt === 'string' && Number.isFinite(Date.parse(rawReport.createdAt)) ? new Date(rawReport.createdAt).toISOString() : at,
      taskType,
      wordCount: Number.isFinite(rawReport.wordCount) ? Math.max(0, Math.min(30000, Math.floor(rawReport.wordCount))) : 0,
      status,
      officialScore: false,
      estimatedTaskBand: status === 'ai-formative' ? bandValue(rawReport.estimatedTaskBand) : null,
      scoreLabel: cleanText(rawReport.scoreLabel, 120) || (status === 'ai-formative' ? 'Band ước lượng chưa hiệu chuẩn' : 'Chưa có band AI'),
      scoreRationale: cleanText(rawReport.scoreRationale, 500),
      lengthWarnings: (Array.isArray(rawReport.lengthWarnings) ? rawReport.lengthWarnings : []).slice(0, 3).map(x => cleanText(x, 300)).filter(Boolean),
      criteria,
      issues,
      strengths,
      priorities,
      summary: cleanText(rawReport.summary, 1800),
      metadata: {
        source: status === 'ai-formative' ? 'imported-ai-formative' : 'imported-local',
        evidenceValidated: true,
        rubricCalibration: 'not-validated-against-independent-human-rated-corpus',
        officialScore: false
      },
      uncertainties: (Array.isArray(rawReport.uncertainties) ? rawReport.uncertainties : []).slice(0, 6).map(x => cleanText(x, 300)).filter(Boolean)
    }
  };
}

function exactQuote(value, essay) {
  const quote = cleanText(value, 300);
  return quote.length >= 5 && essay.includes(quote) ? quote : '';
}
function bandValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 9) return null;
  const half = Math.round(n * 2) / 2;
  return Math.abs(n - half) < 1e-9 ? half : null;
}
function cleanText(value, max) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max) : '';
}


const AGENT_ARTIFACT_KINDS = new Set(['outline', 'exercise', 'goal', 'focus']);

function normaliseAgentArtifact(item, index, taskIds) {
  if (!item || typeof item !== 'object' || Array.isArray(item) ||
      !taskIds.has(item.taskId) || !AGENT_ARTIFACT_KINDS.has(item.kind)) return null;
  const kind = item.kind;
  const title = cleanText(item.title, 160);
  if (!title) return null;
  const payload = item.payload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  let cleanPayload;
  if (kind === 'outline') {
    const content = cleanText(payload.content, 3000);
    if (content.length < 12) return null;
    cleanPayload = { title: cleanText(payload.title, 160) || title, content };
  } else if (kind === 'exercise') {
    const skill = cleanText(payload.skill, 120);
    const prompt = cleanText(payload.prompt, 900);
    const instructions = cleanText(payload.instructions, 900);
    const successCriteria = cleanText(payload.successCriteria, 500);
    if (!skill || prompt.length < 8 || instructions.length < 8 || successCriteria.length < 8) return null;
    cleanPayload = { skill, prompt, instructions, successCriteria };
  } else if (kind === 'goal') {
    const why = cleanText(payload.why, 600);
    const successCriteria = cleanText(payload.successCriteria, 500);
    if (why.length < 8 || successCriteria.length < 8) return null;
    cleanPayload = { title: cleanText(payload.title, 160) || title, why, successCriteria };
  } else {
    const quote = cleanText(payload.quote, 600);
    const reason = cleanText(payload.reason, 500);
    if (quote.length < 5 || !reason) return null;
    cleanPayload = { quote, reason };
  }
  const at = typeof item.at === 'string' && Number.isFinite(Date.parse(item.at)) ? new Date(item.at).toISOString() : new Date().toISOString();
  return {
    id: cleanText(item.id, 128) || 'agent-artifact-' + (index + 1),
    taskId: item.taskId,
    taskTitle: cleanText(item.taskTitle, 180) || item.taskId,
    at,
    kind,
    title,
    payload: cleanPayload
  };
}

function normaliseAgentRevision(item, index) {
  if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item.essay !== 'string') return null;
  const essay = item.essay.slice(0, 20000);
  const at = typeof item.at === 'string' && Number.isFinite(Date.parse(item.at)) ? new Date(item.at).toISOString() : new Date().toISOString();
  const label = cleanText(item.label, 180) || 'Bản trước khi sửa';
  return {
    id: cleanText(item.id, 128) || 'agent-revision-' + (index + 1),
    at,
    label,
    essay
  };
}
