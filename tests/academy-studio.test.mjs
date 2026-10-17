import test from 'node:test';
import assert from 'node:assert/strict';
import { TASKS } from '../web/tasks.mjs';
import {
  getTaskAcademyData,
  formatOutlineForEditor,
  buildSentenceSurgery,
  renderMasteryRadarSvg,
  evaluateCollocationChoice,
  evaluateCohesionOrder
} from '../web/academy-studio.mjs';

test('every bundled task has a bounded Academy profile, interactive drills and an explicitly uncalibrated sample', () => {
  for (const task of TASKS) {
    const data = getTaskAcademyData(task);
    assert.ok(data.topic && data.topic.length > 3, `missing topic for ${task.id}`);
    assert.ok(data.instruction && data.instruction.length > 5, `missing instruction for ${task.id}`);
    assert.ok(Array.isArray(data.traps) && data.traps.length >= 2, `missing traps for ${task.id}`);
    assert.ok(Array.isArray(data.collocations) && data.collocations.length >= 6, `expected >=6 collocations for ${task.id}`);
    for (const item of data.collocations) {
      assert.ok(item.phrase && item.meaning, `invalid collocation item for ${task.id}`);
    }
    assert.ok(data.modelEssay && data.modelEssay.label === 'Bài mẫu tham khảo', `missing honest sample label for ${task.id}`);
    assert.equal(data.modelEssay.band, undefined, `must not claim an unverified band for ${task.id}`);
    assert.equal(data.modelEssay.calibration, 'not-calibrated-against-independent-human-rated-corpus');
    assert.ok(Array.isArray(data.modelEssay.paragraphs) && data.modelEssay.paragraphs.length >= 3, `model sample needs paragraphs for ${task.id}`);
    assert.ok(data.collocationDrill && Array.isArray(data.collocationDrill.options) && data.collocationDrill.options.length === 4);
    assert.ok(Number.isInteger(data.collocationDrill.answerIndex) && data.collocationDrill.answerIndex >= 0 && data.collocationDrill.answerIndex < 4);
    assert.ok(data.cohesionPuzzle && Array.isArray(data.cohesionPuzzle.items) && data.cohesionPuzzle.items.length === 4);
    assert.ok(data.cohesionPuzzle.correctOrder.length === 4);
  }
});

test('Academic Task 1 samples use the selected task data instead of one generic renewable-energy fallback', () => {
  const taskData = id => getTaskAcademyData(TASKS.find(task => task.id === id));
  const line = taskData('task1-line').modelEssay.paragraphs.map(item => item.text).join(' ');
  const map = taskData('task1-map').modelEssay.paragraphs.map(item => item.text).join(' ');
  const process = taskData('task1-process').modelEssay.paragraphs.map(item => item.text).join(' ');
  const pie = taskData('task1-pie').modelEssay.paragraphs.map(item => item.text).join(' ');
  assert.match(line, /Country A/);
  assert.match(map, /warehouse/);
  assert.match(process, /pulp/);
  assert.match(pie, /housing/);
  assert.doesNotMatch(map, /renewable share|electricity generated from renewable sources/i);
  assert.doesNotMatch(process, /renewable share|electricity generated from renewable sources/i);
});

test('General Training letter models match their purpose and audience', () => {
  const taskData = id => getTaskAcademyData(TASKS.find(task => task.id === id));
  const friend = taskData('task1-friend').modelEssay.paragraphs.map(item => item.text).join(' ');
  const apology = taskData('task1-apology').modelEssay.paragraphs.map(item => item.text).join(' ');
  const request = taskData('task1-request').modelEssay.paragraphs.map(item => item.text).join(' ');
  assert.match(friend, /inviting me|arrive on Friday|bring/i);
  assert.match(apology, /apology|responsibility|replacement/i);
  assert.match(request, /Course Manager|classroom|quieter room/i);
});

test('formatOutlineForEditor builds a non-destructive 4-stage outline scaffold', () => {
  const result = formatOutlineForEditor({
    intro: 'Paraphrase + Thesis: Investing in rail is vital.',
    body1: 'Reduces urban traffic congestion.',
    body2: 'Lowers per-capita carbon emissions.',
    conclusion: 'Rail should be prioritised alongside road maintenance.'
  }, 'Existing essay paragraph here.');

  assert.match(result, /\[DÀN Ý HỌC THUẬT · WMR IDEA LAB\]/);
  assert.match(result, /1\. Mở bài \(Introduction\): Paraphrase \+ Thesis: Investing in rail is vital\./);
  assert.match(result, /2\. Thân bài 1 \(Body 1\): Reduces urban traffic congestion\./);
  assert.match(result, /Existing essay paragraph here\./);
});

test('buildSentenceSurgery produces 3-tier diagnosis, Band 7.5 upgrade and Band 8.5+ formulation', () => {
  const surgery = buildSentenceSurgery({
    category: 'lexical',
    quote: 'Government should do many things to solve traffic problem.',
    suggestedFix: 'Municipal authorities should implement targeted measures to alleviate traffic congestion.',
    explanation: 'Cụm từ do many things và solve traffic problem còn chung chung ở mức Band 5.5.'
  }, 'task2');

  assert.ok(surgery.diagnosis.length > 10);
  assert.ok(surgery.band75.length > 10);
  assert.ok(surgery.band85.length > 10);
});

test('renderMasteryRadarSvg outputs pure mathematical SVG with 4 axes and no external references', () => {
  const svg = renderMasteryRadarSvg([
    { id: 'taskResponse', mean: 7.0, count: 3 },
    { id: 'coherence', mean: 6.5, count: 3 },
    { id: 'lexical', mean: 7.5, count: 3 },
    { id: 'grammar', mean: 6.0, count: 3 }
  ]);

  assert.match(svg, /<svg[^>]*class="mastery-radar-svg"/);
  assert.match(svg, /<polygon[^>]*class="radar-data-polygon"/);
  assert.doesNotMatch(svg, /https?:\/\//i);
});

test('evaluateCollocationChoice and evaluateCohesionOrder score Socratic Gym interactions accurately', () => {
  const data = getTaskAcademyData(TASKS[0]);
  const rightColloc = evaluateCollocationChoice(data.collocationDrill, data.collocationDrill.answerIndex);
  assert.equal(rightColloc.correct, true);
  const wrongColloc = evaluateCollocationChoice(data.collocationDrill, (data.collocationDrill.answerIndex + 1) % 4);
  assert.equal(wrongColloc.correct, false);

  const rightOrder = evaluateCohesionOrder(data.cohesionPuzzle, data.cohesionPuzzle.correctOrder);
  assert.equal(rightOrder.correct, true);
  assert.equal(rightOrder.score, 4);

  const reversed = [...data.cohesionPuzzle.correctOrder].reverse();
  const wrongOrder = evaluateCohesionOrder(data.cohesionPuzzle, reversed);
  assert.equal(wrongOrder.correct, false);
});
