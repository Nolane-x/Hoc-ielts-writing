import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const EVALUATOR_VERSION = 1;
export const TASK_TYPES = ['task1-academic', 'task1-general', 'task2'];
export const SPLITS = ['development', 'validation', 'held-out'];
export const COMMON_CRITERIA = ['coherence', 'lexical', 'grammar'];

function criteriaFor(taskType) {
  return taskType === 'task2'
    ? ['taskResponse', ...COMMON_CRITERIA]
    : ['taskAchievement', ...COMMON_CRITERIA];
}

function tracksFor(taskType) {
  return [...criteriaFor(taskType), 'taskBand'];
}

function essayWordCount(essay) {
  return String(essay || '').trim().match(/\b[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length || 0;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function fail(code) {
  throw new Error('benchmark_' + code);
}

export function isValidBand(value) {
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 9 &&
    Math.abs(value * 2 - Math.round(value * 2)) < 1e-9;
}

function validateScores(scores, taskType, location) {
  if (!isObject(scores)) fail('invalid_scores_' + location);
  const expected = criteriaFor(taskType);
  const keys = Object.keys(scores).sort();
  if (keys.length !== expected.length || expected.some(key => !Object.hasOwn(scores, key))) {
    fail('criterion_keys_' + location);
  }
  for (const key of expected) {
    if (!isValidBand(scores[key])) fail('invalid_reference_band_' + location);
  }
}

export function validateBenchmarkDataset(dataset) {
  if (!isObject(dataset)) fail('dataset_shape');
  if (dataset.schemaVersion !== 1) fail('unsupported_schema_version');
  if (typeof dataset.datasetId !== 'string' || !dataset.datasetId.trim() || dataset.datasetId.length > 160) {
    fail('dataset_id');
  }
  if (typeof dataset.rubricVersion !== 'string' || !dataset.rubricVersion.trim() || dataset.rubricVersion.length > 160) {
    fail('rubric_version');
  }
  const provenance = dataset.provenance;
  if (!isObject(provenance) ||
      typeof provenance.sourceDescription !== 'string' ||
      !provenance.sourceDescription.trim() ||
      provenance.deidentified !== true ||
      provenance.permissionConfirmed !== true ||
      provenance.ratingProtocol !== 'double-independent-adjudicated') {
    fail('provenance_not_confirmed');
  }
  if (!Array.isArray(dataset.examples) || dataset.examples.length < 1 || dataset.examples.length > 50000) {
    fail('example_count');
  }
  if (!Array.isArray(dataset.runs) || dataset.runs.length < 1 || dataset.runs.length > 100) {
    fail('run_count');
  }

  const exampleById = new Map();
  for (const example of dataset.examples) {
    if (!isObject(example)) fail('example_shape');
    if (typeof example.id !== 'string' || !example.id.trim() || example.id.length > 160 || exampleById.has(example.id)) {
      fail('duplicate_or_invalid_example_id');
    }
    if (!TASK_TYPES.includes(example.taskType)) fail('task_type');
    if (!SPLITS.includes(example.split)) fail('split');
    if (typeof example.prompt !== 'string' || !example.prompt.trim() || example.prompt.length > 5000) {
      fail('prompt');
    }
    if (typeof example.essay !== 'string' || !example.essay.trim() || example.essay.length > 30000) {
      fail('essay');
    }
    const reference = example.reference;
    if (!isObject(reference)) fail('reference');
    validateScores(reference.adjudicatedScores, example.taskType, 'adjudicated');
    if (!Array.isArray(reference.raters) || reference.raters.length < 2 || reference.raters.length > 10) {
      fail('rater_count');
    }
    const raterIds = new Set();
    for (const rater of reference.raters) {
      if (!isObject(rater) || typeof rater.id !== 'string' || !rater.id.trim() || rater.id.length > 120 || raterIds.has(rater.id)) {
        fail('rater_id');
      }
      raterIds.add(rater.id);
      validateScores(rater.scores, example.taskType, 'rater');
    }
    exampleById.set(example.id, example);
  }

  const runIds = new Set();
  for (const run of dataset.runs) {
    if (!isObject(run) ||
        typeof run.id !== 'string' || !run.id.trim() || run.id.length > 160 || runIds.has(run.id) ||
        typeof run.provider !== 'string' || !run.provider.trim() || run.provider.length > 120 ||
        typeof run.model !== 'string' || !run.model.trim() || run.model.length > 160) {
      fail('run_metadata');
    }
    runIds.add(run.id);
    if (!Array.isArray(run.results) || run.results.length > 50000) fail('run_results');
    const seenExampleIds = new Set();
    for (const result of run.results) {
      if (!isObject(result) || typeof result.exampleId !== 'string' || !exampleById.has(result.exampleId)) {
        fail('unknown_result_example');
      }
      if (seenExampleIds.has(result.exampleId)) fail('duplicate_result_for_example');
      seenExampleIds.add(result.exampleId);
      if (result.assessment !== undefined && !isObject(result.assessment)) fail('assessment_shape');
      if (result.scores !== undefined && !isObject(result.scores)) fail('prediction_scores_shape');
    }
  }
  return { dataset, exampleById };
}

function validScoreOrMissing(value) {
  if (value === undefined || value === null) return { kind: 'missing' };
  if (!isValidBand(value)) return { kind: 'invalid' };
  return { kind: 'valid', score: value };
}

function predictedScore(result, taskType, criterion, example) {
  if (criterion === 'taskBand') {
    if (!example || essayWordCount(example.essay) < 80 || !result) return { kind: 'missing' };
    const assessment = isObject(result.assessment) ? result.assessment : result;
    if (Object.hasOwn(assessment, 'estimatedTaskBand')) {
      return validScoreOrMissing(assessment.estimatedTaskBand);
    }
    const criterionScores = criteriaFor(taskType).map(key => predictedScore(result, taskType, key, example));
    if (criterionScores.some(item => item.kind === 'invalid')) return { kind: 'missing' };
    if (criterionScores.some(item => item.kind !== 'valid')) return { kind: 'missing' };
    const composite = Math.round(mean(criterionScores.map(item => item.score)) * 2) / 2;
    return validScoreOrMissing(composite);
  }

  if (!result) return { kind: 'missing' };
  if (isObject(result.scores)) {
    const key = Object.hasOwn(result.scores, criterion)
      ? criterion
      : (taskType !== 'task2' && criterion === 'taskAchievement' && Object.hasOwn(result.scores, 'taskResponse') ? 'taskResponse' : null);
    return key === null ? { kind: 'missing' } : validScoreOrMissing(result.scores[key]);
  }

  const assessment = isObject(result.assessment) ? result.assessment : result;
  if (!Array.isArray(assessment.criteria)) return { kind: 'missing' };
  const publicCriterionId = criterion === 'taskAchievement' ? 'taskResponse' : criterion;
  const item = assessment.criteria.find(entry => entry && entry.id === criterion) ||
    assessment.criteria.find(entry => entry && entry.id === publicCriterionId);
  if (!item) return { kind: 'missing' };
  return validScoreOrMissing(item.score);
}

function referenceScore(example, track) {
  if (track !== 'taskBand') return example.reference.adjudicatedScores[track];
  const criterionScores = criteriaFor(example.taskType).map(key => example.reference.adjudicatedScores[key]);
  return Math.round(mean(criterionScores) * 2) / 2;
}

function scoreIndex(value) {
  return Math.max(0, Math.min(18, Math.round(value * 2)));
}

export function quadraticWeightedKappa(pairs) {
  if (!Array.isArray(pairs) || pairs.length === 0) return null;
  const size = 19;
  const confusion = Array.from({ length: size }, () => Array(size).fill(0));
  const rows = Array(size).fill(0);
  const columns = Array(size).fill(0);
  for (const pair of pairs) {
    if (!isValidBand(pair.reference) || !isValidBand(pair.predicted)) continue;
    const reference = scoreIndex(pair.reference);
    const predicted = scoreIndex(pair.predicted);
    confusion[reference][predicted]++;
    rows[reference]++;
    columns[predicted]++;
  }
  const n = rows.reduce((sum, value) => sum + value, 0);
  if (n === 0) return null;
  let observedDisagreement = 0;
  let expectedDisagreement = 0;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const weight = ((i - j) * (i - j)) / ((size - 1) * (size - 1));
      observedDisagreement += confusion[i][j] * weight / n;
      expectedDisagreement += rows[i] * columns[j] * weight / (n * n);
    }
  }
  if (expectedDisagreement === 0) return observedDisagreement === 0 ? 1 : null;
  return 1 - observedDisagreement / expectedDisagreement;
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function percentile(sortedValues, p) {
  if (!sortedValues.length) return null;
  const position = (sortedValues.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sortedValues[lower];
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (position - lower);
}

function deterministicSeed(pairs) {
  let seed = 2166136261;
  for (const pair of pairs) {
    seed = Math.imul(seed ^ Math.round(pair.reference * 2), 16777619);
    seed = Math.imul(seed ^ Math.round(pair.predicted * 2), 16777619);
  }
  return seed >>> 0;
}

function bootstrapIntervals(pairs, iterations = 400) {
  if (pairs.length < 5) return null;
  let seed = deterministicSeed(pairs);
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const maeValues = [];
  const withinHalfValues = [];
  const qwkValues = [];
  for (let iteration = 0; iteration < iterations; iteration++) {
    const sample = [];
    for (let index = 0; index < pairs.length; index++) {
      sample.push(pairs[Math.floor(random() * pairs.length)]);
    }
    const absoluteErrors = sample.map(pair => Math.abs(pair.predicted - pair.reference));
    maeValues.push(mean(absoluteErrors));
    withinHalfValues.push(absoluteErrors.filter(error => error <= 0.500000001).length / sample.length);
    const kappa = quadraticWeightedKappa(sample);
    if (Number.isFinite(kappa)) qwkValues.push(kappa);
  }
  maeValues.sort((a, b) => a - b);
  withinHalfValues.sort((a, b) => a - b);
  qwkValues.sort((a, b) => a - b);
  return {
    method: 'deterministic percentile bootstrap; exploratory 95% intervals',
    iterations,
    mae95CI: [percentile(maeValues, 0.025), percentile(maeValues, 0.975)],
    withinHalfBand95CI: [percentile(withinHalfValues, 0.025), percentile(withinHalfValues, 0.975)],
    qwk95CI: qwkValues.length ? [percentile(qwkValues, 0.025), percentile(qwkValues, 0.975)] : null
  };
}

function summarisePairs(pairs, expectedCount, includeBootstrap = true) {
  if (!pairs.length) {
    return {
      n: 0,
      expected: expectedCount,
      missing: expectedCount,
      coverage: expectedCount ? 0 : null,
      mae: null,
      rmse: null,
      medianAbsoluteError: null,
      bias: null,
      exactMatchRate: null,
      withinHalfBandRate: null,
      withinOneBandRate: null,
      severeErrorRate: null,
      referenceMean: null,
      predictedMean: null,
      qwk: null,
      confidenceIntervals: null
    };
  }
  const errors = pairs.map(pair => pair.predicted - pair.reference);
  const absoluteErrors = errors.map(Math.abs);
  const expected = Number.isFinite(expectedCount) ? expectedCount : pairs.length;
  const sortedAbs = [...absoluteErrors].sort((a, b) => a - b);
  const metric = {
    n: pairs.length,
    expected,
    missing: Math.max(0, expected - pairs.length),
    coverage: expected ? pairs.length / expected : null,
    mae: mean(absoluteErrors),
    rmse: Math.sqrt(mean(errors.map(error => error * error))),
    medianAbsoluteError: sortedAbs.length % 2
      ? sortedAbs[Math.floor(sortedAbs.length / 2)]
      : (sortedAbs[sortedAbs.length / 2 - 1] + sortedAbs[sortedAbs.length / 2]) / 2,
    bias: mean(errors),
    exactMatchRate: absoluteErrors.filter(error => error < 1e-9).length / pairs.length,
    withinHalfBandRate: absoluteErrors.filter(error => error <= 0.500000001).length / pairs.length,
    withinOneBandRate: absoluteErrors.filter(error => error <= 1.000000001).length / pairs.length,
    severeErrorRate: absoluteErrors.filter(error => error >= 1.5 - 1e-9).length / pairs.length,
    referenceMean: mean(pairs.map(pair => pair.reference)),
    predictedMean: mean(pairs.map(pair => pair.predicted)),
    qwk: quadraticWeightedKappa(pairs),
    confidenceIntervals: null
  };
  if (includeBootstrap) metric.confidenceIntervals = bootstrapIntervals(pairs);
  return metric;
}

function normalizedEssayFingerprint(essay) {
  const normalized = essay.normalize('NFKC').toLocaleLowerCase('en')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  return normalized;
}

function collectAssessment(result) {
  return isObject(result?.assessment) ? result.assessment : result;
}

function quoteItems(result) {
  const assessment = collectAssessment(result);
  const quotes = [];
  if (!isObject(assessment)) return quotes;
  if (Array.isArray(assessment.criteria)) {
    for (const criterion of assessment.criteria) {
      if (Array.isArray(criterion?.evidence)) {
        for (const quote of criterion.evidence) {
          if (typeof quote === 'string' && quote.trim()) quotes.push(quote);
        }
      }
    }
  }
  for (const item of Array.isArray(assessment.issues) ? assessment.issues : []) {
    if (typeof item?.quote === 'string' && item.quote.trim()) quotes.push(item.quote);
  }
  for (const item of Array.isArray(assessment.strengths) ? assessment.strengths : []) {
    if (typeof item?.quote === 'string' && item.quote.trim()) quotes.push(item.quote);
  }
  return quotes;
}

function buildReferenceAgreement(examples) {
  const groups = new Map();
  for (const example of examples) {
    const keys = criteriaFor(example.taskType);
    for (const criterion of keys) {
      const ratingPairs = [];
      const raters = example.reference.raters;
      for (let i = 0; i < raters.length; i++) {
        for (let j = i + 1; j < raters.length; j++) {
          ratingPairs.push({
            reference: raters[i].scores[criterion],
            predicted: raters[j].scores[criterion]
          });
        }
      }
      const key = example.taskType + '|' + criterion;
      if (!groups.has(key)) groups.set(key, { taskType: example.taskType, criterion, pairs: [], examples: new Set() });
      const group = groups.get(key);
      group.pairs.push(...ratingPairs);
      if (ratingPairs.length) group.examples.add(example.id);
    }
  }
  return [...groups.values()].map(group => {
    const stats = summarisePairs(group.pairs, group.pairs.length, false);
    return {
      taskType: group.taskType,
      criterion: group.criterion,
      ratedExamples: group.examples.size,
      raterPairs: group.pairs.length,
      meanAbsoluteRaterDifference: stats.mae,
      exactAgreementRate: stats.exactMatchRate,
      withinHalfBandAgreementRate: stats.withinHalfBandRate,
      qwk: stats.qwk
    };
  }).sort((a, b) => a.taskType.localeCompare(b.taskType) || a.criterion.localeCompare(b.criterion));
}

function evaluateRun(dataset, run, exampleById, examplesByGroup) {
  const results = new Map(run.results.map(result => [result.exampleId, result]));
  const invalidPredictions = [];
  let evidenceQuoteCount = 0;
  let evidenceExactMatchCount = 0;
  for (const result of run.results) {
    const example = exampleById.get(result.exampleId);
    for (const quote of quoteItems(result)) {
      evidenceQuoteCount++;
      if (example.essay.includes(quote)) evidenceExactMatchCount++;
    }
  }

  const metrics = [];
  for (const [groupKey, examples] of examplesByGroup) {
    const parts = groupKey.split('|');
    const split = parts[0];
    const taskType = parts[1];
    const criterion = parts[2];
    const eligibleExamples = criterion === 'taskBand'
      ? examples.filter(example => essayWordCount(example.essay) >= 80)
      : examples;
    const excludedShortEssays = examples.length - eligibleExamples.length;
    const pairs = [];
    for (const example of eligibleExamples) {
      const result = results.get(example.id);
      const scored = predictedScore(result, taskType, criterion, example);
      if (scored.kind === 'invalid') {
        invalidPredictions.push({ exampleId: example.id, criterion, reason: 'not_a_valid_half_band_score' });
      }
      if (scored.kind === 'valid') {
        pairs.push({ reference: referenceScore(example, criterion), predicted: scored.score });
      }
    }
    metrics.push({
      split,
      taskType,
      criterion,
      excludedShortEssays,
      ...summarisePairs(pairs, eligibleExamples.length, true)
    });
  }
  metrics.sort((a, b) => a.split.localeCompare(b.split) || a.taskType.localeCompare(b.taskType) || a.criterion.localeCompare(b.criterion));
  return {
    runId: run.id,
    provider: run.provider,
    model: run.model,
    resultsSubmitted: run.results.length,
    examplesInDataset: dataset.examples.length,
    invalidPredictionCount: invalidPredictions.length,
    invalidPredictions,
    evidenceIntegrity: {
      nonEmptyQuoteCount: evidenceQuoteCount,
      exactMatchCount: evidenceExactMatchCount,
      rejectedQuoteCount: evidenceQuoteCount - evidenceExactMatchCount,
      exactMatchRate: evidenceQuoteCount ? evidenceExactMatchCount / evidenceQuoteCount : null,
      note: 'Exact substring match only; this does not verify whether the explanation is semantically correct.'
    },
    metrics
  };
}

function buildRepeatability(dataset, exampleById) {
  const cells = new Map();
  for (const run of dataset.runs) {
    for (const result of run.results) {
      const example = exampleById.get(result.exampleId);
      for (const criterion of tracksFor(example.taskType)) {
        const score = predictedScore(result, example.taskType, criterion, example);
        if (score.kind !== 'valid') continue;
        const key = [run.provider, run.model, example.split, example.taskType, criterion].join('|');
        if (!cells.has(key)) cells.set(key, { provider: run.provider, model: run.model, split: example.split, taskType: example.taskType, criterion, examples: new Map() });
        const group = cells.get(key);
        if (!group.examples.has(example.id)) group.examples.set(example.id, []);
        group.examples.get(example.id).push(score.score);
      }
    }
  }

  return [...cells.values()].map(group => {
    const comparable = [...group.examples.values()].filter(scores => scores.length >= 2);
    const pairDifferences = [];
    let exact = 0;
    let withinHalf = 0;
    const ranges = [];
    for (const scores of comparable) {
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      ranges.push(max - min);
      if (max - min < 1e-9) exact++;
      if (max - min <= 0.500000001) withinHalf++;
      for (let i = 0; i < scores.length; i++) {
        for (let j = i + 1; j < scores.length; j++) pairDifferences.push(Math.abs(scores[i] - scores[j]));
      }
    }
    return {
      provider: group.provider,
      model: group.model,
      split: group.split,
      taskType: group.taskType,
      criterion: group.criterion,
      repeatedExamples: comparable.length,
      pairwiseScoreComparisons: pairDifferences.length,
      exactRepeatabilityRate: comparable.length ? exact / comparable.length : null,
      withinHalfBandRangeRate: comparable.length ? withinHalf / comparable.length : null,
      meanScoreRange: mean(ranges),
      meanPairwiseAbsoluteDifference: mean(pairDifferences)
    };
  }).filter(group => group.repeatedExamples > 0)
    .sort((a, b) => a.provider.localeCompare(b.provider) || a.model.localeCompare(b.model) || a.split.localeCompare(b.split) || a.taskType.localeCompare(b.taskType) || a.criterion.localeCompare(b.criterion));
}

export function evaluateBenchmarkDataset(dataset) {
  const { exampleById } = validateBenchmarkDataset(dataset);
  const examplesByGroup = new Map();
  const splitCounts = {};
  const taskCounts = {};
  const warnings = [];
  const fingerprints = new Map();

  for (const example of dataset.examples) {
    splitCounts[example.split] = (splitCounts[example.split] || 0) + 1;
    taskCounts[example.taskType] = (taskCounts[example.taskType] || 0) + 1;
    const groupFingerprint = normalizedEssayFingerprint(example.essay);
    if (!fingerprints.has(groupFingerprint)) fingerprints.set(groupFingerprint, []);
    fingerprints.get(groupFingerprint).push({ id: example.id, split: example.split });
    const key = [example.split, example.taskType].join('|');
    if (!examplesByGroup.has(key)) examplesByGroup.set(key, []);
    examplesByGroup.get(key).push(example);
  }

  for (const matches of fingerprints.values()) {
    const splits = new Set(matches.map(item => item.split));
    if (matches.length > 1 && splits.size > 1) {
      warnings.push('Potential exact-text leakage across splits; review de-identified example IDs: ' + matches.map(item => item.id).join(', '));
    }
  }
  if (!splitCounts['held-out']) warnings.push('No held-out split is present; do not describe these results as independent final validation.');
  for (const split of SPLITS) {
    for (const taskType of TASK_TYPES) {
      const count = (examplesByGroup.get(split + '|' + taskType) || []).length;
      if (count > 0 && count < 30) warnings.push('Small sample: ' + split + ' / ' + taskType + ' has ' + count + ' example(s); estimates are exploratory.');
    }
  }

  const metricGroups = new Map();
  for (const example of dataset.examples) {
    for (const criterion of tracksFor(example.taskType)) {
      const key = [example.split, example.taskType, criterion].join('|');
      if (!metricGroups.has(key)) metricGroups.set(key, []);
      metricGroups.get(key).push(example);
    }
  }
  const runReports = dataset.runs.map(run => evaluateRun(dataset, run, exampleById, metricGroups));
  return {
    reportSchemaVersion: 1,
    evaluatorVersion: EVALUATOR_VERSION,
    generatedAt: new Date().toISOString(),
    dataset: {
      id: dataset.datasetId,
      rubricVersion: dataset.rubricVersion,
      exampleCount: dataset.examples.length,
      splitCounts,
      taskCounts
    },
    warnings,
    referenceRaterAgreement: buildReferenceAgreement(dataset.examples),
    repeatedRunConsistency: buildRepeatability(dataset, exampleById),
    runs: runReports,
    interpretation: {
      status: 'descriptive-evaluation-not-a-certification',
      guidance: 'Review coverage, confidence intervals, sample sizes, rater agreement and task-specific results together. Exact quote matching does not establish semantic correctness. A low or unstable reference-rater agreement limits claims about model performance.'
    }
  };
}

function parseArguments(argv) {
  const args = argv.slice(2);
  let datasetPath = null;
  let outputPath = null;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--out') {
      if (!args[index + 1]) throw new Error('benchmark_missing_output_path');
      outputPath = args[++index];
    } else if (args[index] === '--help' || args[index] === '-h') {
      return { help: true };
    } else if (!datasetPath) {
      datasetPath = args[index];
    } else {
      throw new Error('benchmark_unexpected_argument');
    }
  }
  if (!datasetPath) throw new Error('benchmark_dataset_path_required');
  return { datasetPath, outputPath };
}

export async function runCli(argv = process.argv) {
  const args = parseArguments(argv);
  if (args.help) {
    process.stdout.write('Usage: npm run evaluate:benchmark -- <dataset.json> [--out report.json]\n');
    process.stdout.write('Reads local benchmark JSON only. No network calls are made by this evaluator.\n');
    return 0;
  }
  const inputPath = resolve(args.datasetPath);
  let raw;
  try {
    raw = await readFile(inputPath, 'utf8');
  } catch {
    throw new Error('benchmark_cannot_read_dataset');
  }
  let dataset;
  try {
    dataset = JSON.parse(raw);
  } catch {
    throw new Error('benchmark_dataset_invalid_json');
  }
  const report = evaluateBenchmarkDataset(dataset);
  const content = JSON.stringify(report, null, 2) + '\n';
  if (args.outputPath) {
    const outputPath = resolve(args.outputPath);
    if (outputPath === inputPath) throw new Error('benchmark_refusing_to_overwrite_dataset');
    try {
      await writeFile(outputPath, content, { encoding: 'utf8', flag: 'wx' });
    } catch {
      throw new Error('benchmark_cannot_create_report_or_report_already_exists');
    }
    process.stdout.write('Evaluation report created locally: ' + outputPath + '\n');
    process.stdout.write('No essay text is included in the report.\n');
  } else {
    process.stdout.write(content);
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runCli().then(code => {
    process.exitCode = code;
  }).catch(error => {
    process.stderr.write((error?.message || 'benchmark_evaluation_failed') + '\n');
    process.exitCode = 1;
  });
}
