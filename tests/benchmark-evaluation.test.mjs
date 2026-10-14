import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateBenchmarkDataset,
  isValidBand,
  quadraticWeightedKappa,
  validateBenchmarkDataset
} from '../scripts/evaluate-benchmark.mjs';

const longEssay = (marker) => (
  'The following synthetic practice draft discusses a public policy and its possible effects. ' +
  'A clear answer should explain its main position, develop reasons, and use examples without inventing facts. ' +
  'However, the outcome depends on implementation, access, cost, and the needs of different communities. ' +
  'For this reason, decision makers should compare alternatives and consider likely disadvantages before acting. ' +
  'The draft is deliberately created for software tests and is not a learner submission or a human-rated benchmark essay. ' +
  'Its purpose is to provide enough text for deterministic validation of score mapping, metrics, and evidence handling. ' +
  marker + ' '
).repeat(3);

function scores(taskType, first = 6.5) {
  const criterion = taskType === 'task2' ? 'taskResponse' : 'taskAchievement';
  return { [criterion]: first, coherence: 6, lexical: 6.5, grammar: 6 };
}

function example(id, taskType, split, essay, responseScore) {
  const gold = scores(taskType, responseScore);
  return {
    id,
    taskType,
    split,
    prompt: 'Discuss the benefits and disadvantages of the policy described in this synthetic test prompt.',
    essay,
    reference: {
      adjudicatedScores: gold,
      raters: [
        { id: 'rater-a', scores: { ...gold } },
        { id: 'rater-b', scores: { ...gold } }
      ]
    }
  };
}

function assessment(taskType, responseScore, essay, options = {}) {
  const criterionId = 'taskResponse';
  return {
    criteria: [
      { id: criterionId, score: responseScore, evidence: [essay.slice(0, 16)] },
      { id: 'coherence', score: 6, evidence: [] },
      { id: 'lexical', score: 6.5, evidence: [] },
      { id: 'grammar', score: 6, evidence: [] }
    ],
    issues: options.invalidQuote ? [{ quote: 'this phrase does not occur in the essay', explanation: 'test-only issue' }] : [],
    strengths: [{ quote: essay.slice(0, 16), why: 'Synthetic evidence fixture.' }]
  };
}

function datasetFactory() {
  const essayA = longEssay('synthetic draft alpha');
  const essayB = longEssay('synthetic draft beta');
  const examples = [
    example('task2-a', 'task2', 'held-out', essayA, 6.5),
    example('task2-b', 'task2', 'held-out', essayB, 7)
  ];
  const run = {
    id: 'run-1',
    provider: 'test-provider',
    model: 'test-model',
    results: [
      { exampleId: 'task2-a', assessment: assessment('task2', 6.5, essayA, { invalidQuote: true }) },
      { exampleId: 'task2-b', assessment: assessment('task2', 6.5, essayB) }
    ]
  };
  return {
    schemaVersion: 1,
    datasetId: 'synthetic-unit-test-only',
    rubricVersion: 'test-fixture-not-an-IELTS-calibration',
    provenance: {
      sourceDescription: 'Synthetic unit-test text and labels; not real learner data.',
      deidentified: true,
      permissionConfirmed: true,
      ratingProtocol: 'double-independent-adjudicated'
    },
    examples,
    runs: [run]
  };
}

test('band validation accepts only numeric 0–9 half-band values', () => {
  for (const value of [0, 0.5, 6, 6.5, 9]) assert.equal(isValidBand(value), true);
  for (const value of [-0.5, 9.5, 7.3, '6.5', NaN, Infinity, null]) assert.equal(isValidBand(value), false);
});

test('dataset validation requires permission, de-identification and independent reference raters', () => {
  const data = datasetFactory();
  assert.equal(validateBenchmarkDataset(data).dataset, data);
  data.provenance.permissionConfirmed = false;
  assert.throws(() => validateBenchmarkDataset(data), /benchmark_provenance_not_confirmed/);
});

test('metrics report MAE, RMSE, bias, exact and adjacent-band rates and QWK', () => {
  const report = evaluateBenchmarkDataset(datasetFactory());
  const score = report.runs[0].metrics.find(item =>
    item.split === 'held-out' && item.taskType === 'task2' && item.criterion === 'taskResponse'
  );
  assert.equal(score.n, 2);
  assert.equal(score.expected, 2);
  assert.equal(score.coverage, 1);
  assert.equal(score.mae, 0.25);
  assert.equal(score.rmse, Math.sqrt(0.125));
  assert.equal(score.bias, -0.25);
  assert.equal(score.exactMatchRate, 0.5);
  assert.equal(score.withinHalfBandRate, 1);
  assert.equal(score.withinOneBandRate, 1);
  assert.equal(score.severeErrorRate, 0);
  assert.equal(score.qwk, 0);
  assert.equal(score.confidenceIntervals, null);
});

test('Task 1 application criterion ID maps to Task Achievement rather than Task Response', () => {
  const data = datasetFactory();
  const task1Essay = longEssay('synthetic task 1 draft');
  data.examples.push(example('task1-a', 'task1-academic', 'held-out', task1Essay, 6.5));
  data.runs[0].results.push({
    exampleId: 'task1-a',
    assessment: assessment('task1-academic', 6.5, task1Essay)
  });
  const report = evaluateBenchmarkDataset(data);
  const achievement = report.runs[0].metrics.find(item =>
    item.taskType === 'task1-academic' && item.criterion === 'taskAchievement'
  );
  assert.equal(achievement.n, 1);
  assert.equal(achievement.mae, 0);
});

test('invalid model scores are counted and reduce coverage instead of being silently rounded', () => {
  const data = datasetFactory();
  data.runs[0].results[1].assessment.criteria[2].score = 7.3;
  const report = evaluateBenchmarkDataset(data);
  assert.equal(report.runs[0].invalidPredictionCount, 1);
  assert.equal(report.runs[0].invalidPredictions[0].criterion, 'lexical');
  const lexical = report.runs[0].metrics.find(item => item.taskType === 'task2' && item.criterion === 'lexical');
  assert.equal(lexical.n, 1);
  assert.equal(lexical.expected, 2);
  assert.equal(lexical.coverage, 0.5);
  assert.equal(lexical.missing, 1);
});

test('quote integrity checks exact essay substrings but does not claim semantic correctness', () => {
  const report = evaluateBenchmarkDataset(datasetFactory());
  const evidence = report.runs[0].evidenceIntegrity;
  assert.equal(evidence.nonEmptyQuoteCount, 5);
  assert.equal(evidence.exactMatchCount, 4);
  assert.equal(evidence.rejectedQuoteCount, 1);
  assert.equal(evidence.exactMatchRate, 0.8);
  assert.match(evidence.note, /does not verify/i);
});

test('reference agreement is reported separately from model accuracy', () => {
  const report = evaluateBenchmarkDataset(datasetFactory());
  const agreement = report.referenceRaterAgreement.find(item =>
    item.taskType === 'task2' && item.criterion === 'taskResponse'
  );
  assert.equal(agreement.ratedExamples, 2);
  assert.equal(agreement.meanAbsoluteRaterDifference, 0);
  assert.equal(agreement.qwk, 1);
});

test('repeated runs for one model expose score consistency without hiding disagreement', () => {
  const data = datasetFactory();
  const repeated = structuredClone(data.runs[0]);
  repeated.id = 'run-2';
  repeated.results[0].assessment.criteria[0].score = 7;
  data.runs.push(repeated);
  const report = evaluateBenchmarkDataset(data);
  const consistency = report.repeatedRunConsistency.find(item =>
    item.provider === 'test-provider' &&
    item.model === 'test-model' &&
    item.taskType === 'task2' &&
    item.criterion === 'taskResponse'
  );
  assert.equal(consistency.repeatedExamples, 2);
  assert.equal(consistency.exactRepeatabilityRate, 0.5);
  assert.equal(consistency.withinHalfBandRangeRate, 0.5);
  assert.equal(consistency.meanScoreRange, 0.25);
  assert.equal(consistency.meanPairwiseAbsoluteDifference, 0.25);
});

test('exact duplicate essays in different splits raise a leakage warning without printing essay text', () => {
  const data = datasetFactory();
  const duplicate = structuredClone(data.examples[0]);
  duplicate.id = 'same-text-in-development';
  duplicate.split = 'development';
  data.examples.push(duplicate);
  const report = evaluateBenchmarkDataset(data);
  assert.ok(report.warnings.some(warning => /leakage across splits/i.test(warning)));
  assert.equal(JSON.stringify(report).includes(data.examples[0].essay), false);
});

test('invalid reference score and duplicate result fail closed', () => {
  const invalid = datasetFactory();
  invalid.examples[0].reference.adjudicatedScores.taskResponse = 7.3;
  assert.throws(() => validateBenchmarkDataset(invalid), /benchmark_invalid_reference_band/);
  const duplicated = datasetFactory();
  duplicated.runs[0].results.push(structuredClone(duplicated.runs[0].results[0]));
  assert.throws(() => validateBenchmarkDataset(duplicated), /benchmark_duplicate_result_for_example/);
});

test('QWK is perfect for identical scores and defined as null when there are no pairs', () => {
  assert.equal(quadraticWeightedKappa([{ reference: 6.5, predicted: 6.5 }, { reference: 7, predicted: 7 }]), 1);
  assert.equal(quadraticWeightedKappa([]), null);
});
