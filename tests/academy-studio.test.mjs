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

test('every task has context-appropriate study scaffolds without unvalidated band claims', () => {
  for (const task of TASKS) {
    const data = getTaskAcademyData(task);
    assert.ok(data.topic && data.topic.length > 3, `missing topic for ${task.id}`);
    assert.ok(data.instruction && data.instruction.length > 5, `missing instruction for ${task.id}`);
    assert.ok(Array.isArray(data.traps) && data.traps.length >= 2, `missing traps for ${task.id}`);
    assert.ok(Array.isArray(data.collocations) && data.collocations.length >= 6, `expected >=6 collocations for ${task.id}`);
    for (const item of data.collocations) {
      assert.ok(item.phrase && item.meaning, `invalid collocation item for ${task.id}`);
    }
    assert.ok(data.modelEssay && data.modelEssay.qualityStatus === 'illustrative-unvalidated', `missing transparency status for ${task.id}`);
    assert.equal(Object.hasOwn(data.modelEssay, 'band'), false, `unvalidated band claim for ${task.id}`);
    assert.ok(Array.isArray(data.modelEssay.paragraphs) && data.modelEssay.paragraphs.length >= 3, `model essay needs paragraphs for ${task.id}`);
    assert.ok(data.collocationDrill && Array.isArray(data.collocationDrill.options) && data.collocationDrill.options.length === 4);
    assert.ok(data.cohesionPuzzle && Array.isArray(data.cohesionPuzzle.items) && data.cohesionPuzzle.items.length === 4);
  }
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

test('sentence surgery remains grounded in supplied assessment rather than inventing band-labelled rewrites', () => {
  const surgery = buildSentenceSurgery({
    category: 'lexical',
    quote: 'Government should do many things to solve traffic problem.',
    suggestedFix: 'Municipal authorities should implement targeted measures to alleviate traffic congestion.',
    teachingHint: 'Explain how the proposed measure reduces congestion.',
    explanation: 'The wording is vague; explain the mechanism and keep the claim specific.'
  }, 'task2');

  assert.ok(surgery.diagnosis.length > 10);
  assert.equal(surgery.suggestedRevision, 'Municipal authorities should implement targeted measures to alleviate traffic congestion.');
  assert.match(surgery.learningNote, /Explain how/);
  const unsupported = buildSentenceSurgery({ category: 'lexical', quote: 'The words.' }, 'task2');
  assert.equal(unsupported.suggestedRevision, '');
  assert.doesNotMatch(unsupported.diagnosis, /Band 5\.5|Band 8\.5/);
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
  const empty = renderMasteryRadarSvg([]);
  assert.doesNotMatch(empty, /class="radar-data-polygon"/);
  assert.match(empty, /TR \/ TA \(—\)/);
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
