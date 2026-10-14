const CRITERIA = [
  {
    id: 'taskAchievement',
    label: 'Task Achievement',
    focus: 'Select the most important features, compare accurately, or fulfil the letter purpose and all required points.',
    primaryTask: 'task1-line',
    transferTask: 'task1-table',
    success: 'Every required feature or letter point is covered, with the key information clearly selected and explained.'
  },
  {
    id: 'taskResponse',
    label: 'Task Response',
    focus: 'Answer every part of the Task 2 prompt and develop a clear, supported position.',
    primaryTask: 'task2-opinion',
    transferTask: 'task2-discussion',
    success: 'Each part of the prompt is answered directly, and each main claim is explained and supported.'
  },
  {
    id: 'coherence',
    label: 'Coherence & Cohesion',
    focus: 'Give each paragraph one purpose and connect ideas logically.',
    primaryTask: 'task2-discussion',
    transferTask: 'task1-line',
    success: 'A reader can explain the purpose of every paragraph and how each idea supports the answer.'
  },
  {
    id: 'lexical',
    label: 'Lexical Resource',
    focus: 'Choose precise words and natural collocations without replacing words just to avoid repetition.',
    primaryTask: 'task2-online-learning',
    transferTask: 'task1-table',
    success: 'Key terms are precise, repetition is controlled and word choices preserve the intended meaning.'
  },
  {
    id: 'grammar',
    label: 'Grammatical Range & Accuracy',
    focus: 'Improve sentence control, clause structure and accuracy before adding complexity.',
    primaryTask: 'task1-process',
    transferTask: 'task1-request',
    success: 'Sentences remain easy to understand and structures are accurate in a new paragraph.'
  }
];

const STARTER_STEPS = [
  {
    criterion: 'Task Response',
    title: 'Build a clear Task 2 answer',
    taskId: 'task2-opinion',
    minutes: 25,
    focus: 'Position, main reasons and task coverage',
    success: 'Write an introduction and one body paragraph that answer the question directly.'
  },
  {
    criterion: 'Overview and comparison',
    title: 'Summarise key trends',
    taskId: 'task1-line',
    minutes: 20,
    focus: 'Overview, significant comparisons and accurate figures',
    success: 'Write an overview plus two comparisons using only the supplied synthetic data.'
  },
  {
    criterion: 'Tone and task coverage',
    title: 'Practise a General Training letter',
    taskId: 'task1-formal-letter',
    minutes: 20,
    focus: 'Purpose, three required points and an appropriate tone',
    success: 'All bullet points are addressed and the requested action is clear.'
  }
];

export function buildStudyPlan(history, tasks, limit = 3) {
  const taskMap = new Map((Array.isArray(tasks) ? tasks : []).map(task => [task.id, task]));
  const records = Array.isArray(history) ? history.slice(0, 30).filter(record => record?.report && typeof record.essay === 'string') : [];
  const maxSteps = Math.max(1, Math.min(3, Number.isFinite(limit) ? Math.floor(limit) : 3));
  const aggregate = new Map(CRITERIA.map(criterion => [criterion.id, { ...criterion, scores: [] }]));
  const eligibleRecords = records.filter(record =>
    record.source === 'ai' &&
    record.report.status === 'ai-formative' &&
    Number(record.report.wordCount) >= 80
  );

  for (const record of eligibleRecords) {
    const reportType = record.report.taskType || record.taskType;
    const criteria = Array.isArray(record.report.criteria) ? record.report.criteria : [];
    for (const item of criteria) {
      if (item?.score === null || item?.score === undefined || item?.score === '') continue;
      const key = item?.id === 'taskResponse' && reportType !== 'task2' ? 'taskAchievement' : item?.id;
      const target = aggregate.get(key);
      const score = Number(item.score);
      if (target && Number.isFinite(score) && score >= 0 && score <= 9 && Math.abs(score * 2 - Math.round(score * 2)) < 1e-9) target.scores.push(score);
    }
  }
  const scored = [...aggregate.values()]
    .filter(item => item.scores.length)
    .map(item => ({ ...item, mean: item.scores.reduce((sum, value) => sum + value, 0) / item.scores.length }))
    .sort((a, b) => a.mean - b.mean || b.scores.length - a.scores.length);

  if (!scored.length) {
    return {
      basis: records.length
        ? 'Bạn đã có báo cáo, nhưng chưa có điểm tiêu chí AI hợp lệ. Đây là lộ trình khởi động, chưa phải chẩn đoán điểm yếu.'
        : 'Chưa có lịch sử đánh giá. Đây là lộ trình khởi động; WMR sẽ cá nhân hóa hơn khi có dữ liệu học.',
      adaptive: false,
      steps: STARTER_STEPS.slice(0, maxSteps).map((step, index) => materialiseStep(step, index, taskMap)).filter(Boolean)
    };
  }

  const weakest = scored.slice(0, Math.min(2, scored.length));
  const chosen = [];
  for (const item of weakest) {
    const primary = taskMap.get(item.primaryTask);
    const transfer = taskMap.get(item.transferTask);
    if (primary) chosen.push({
      criterion: item.label,
      title: 'Tập trung vào ' + item.label,
      taskId: primary.id,
      minutes: primary.estimatedMinutes || 20,
      focus: item.focus,
      success: item.success,
      basis: 'Trung bình ước lượng gần đây: ' + item.mean.toFixed(1) + '/9 qua ' + item.scores.length + ' lần có điểm.'
    });
    if (transfer) chosen.push({
      criterion: item.label,
      title: 'Chuyển giao kỹ năng sang dạng bài khác',
      taskId: transfer.id,
      minutes: transfer.estimatedMinutes || 20,
      focus: item.focus,
      success: item.success,
      basis: 'Luyện lại cùng kỹ năng trong một dạng bài khác để kiểm tra khả năng vận dụng.'
    });
  }
  for (const step of STARTER_STEPS) {
    if (chosen.length >= maxSteps) break;
    if (!chosen.some(item => item.taskId === step.taskId)) chosen.push({ ...step, basis: 'Bài luyện bổ sung để giữ cân bằng giữa các dạng IELTS Writing.' });
  }
  const steps = chosen.slice(0, maxSteps).map((step, index) => materialiseStep(step, index, taskMap)).filter(Boolean);
  return {
    basis: 'Đề xuất từ điểm tiêu chí AI đã lưu trên thiết bị. Các điểm này vẫn là ước lượng luyện tập chưa hiệu chuẩn, không phải band chính thức.',
    adaptive: true,
    weakestCriteria: weakest.map(item => ({ id: item.id, label: item.label, mean: Math.round(item.mean * 10) / 10, observations: item.scores.length })),
    steps
  };
}

function materialiseStep(step, index, taskMap) {
  const task = taskMap.get(step.taskId);
  if (!task) return null;
  return {
    id: task.id + '-' + index,
    taskId: task.id,
    taskTitle: task.title,
    taskType: task.type,
    criterion: String(step.criterion || task.skillFocus || task.group || 'IELTS Writing'),
    title: String(step.title || task.title),
    minutes: Math.max(10, Math.min(60, Number(step.minutes) || task.estimatedMinutes || 20)),
    focus: String(step.focus || task.skillFocus || task.goal),
    success: String(step.success || task.goal),
    basis: String(step.basis || 'Bài luyện theo lộ trình.'),
    difficulty: task.difficulty || 'Intermediate'
  };
}
