const SOURCES = new Set(['local', 'ai', 'local-fallback']);

export function createLearningRecord({ report, source = 'local', task, essay, id, at } = {}) {
  if (!task || typeof task !== 'object' || typeof task.id !== 'string' || !task.id.trim()) {
    throw new Error('learning_record_task_invalid');
  }
  if (typeof essay !== 'string') throw new Error('learning_record_essay_invalid');
  if (!report || typeof report !== 'object' || Array.isArray(report)) {
    throw new Error('learning_record_report_invalid');
  }
  const timestamp = typeof at === 'string' && Number.isFinite(Date.parse(at))
    ? new Date(at).toISOString()
    : new Date().toISOString();
  const recordId = typeof id === 'string' && id.trim()
    ? id.slice(0, 128)
    : (globalThis.crypto?.randomUUID?.() || (Date.now() + '-' + Math.random().toString(16).slice(2)));
  return {
    id: recordId,
    at: timestamp,
    taskId: task.id,
    taskTitle: String(task.title || task.id).slice(0, 180),
    taskType: ['task1-academic', 'task1-general', 'task2'].includes(task.type) ? task.type : 'task2',
    taskPrompt: String(task.prompt || '').slice(0, 5000),
    essay: essay.slice(0, 20000),
    report,
    source: SOURCES.has(source) ? source : 'local'
  };
}
