# Scoring validation protocol and local benchmark evaluator

## Why this exists

WMR criterion scores are formative estimates. A green unit-test suite establishes software behaviour, not IELTS scoring accuracy. Accuracy claims require independently rated essays, an explicit reference protocol, and a held-out set that was not used to change prompts or scoring logic.

The evaluator in scripts/evaluate-benchmark.mjs is dependency-free, uses local files only, performs no network requests, and deliberately omits essay text and prompts from its report. No real learner essay or credential belongs in this repository.

## Dataset contract: schema version 1

A dataset is a local JSON file with these fields:

- schemaVersion: 1
- datasetId: a stable, non-identifying dataset label
- rubricVersion: the exact descriptor/version used by raters
- provenance: sourceDescription, deidentified=true, permissionConfirmed=true, ratingProtocol=double-independent-adjudicated
- examples: one record per essay, with id, taskType, split, prompt, essay, and reference
- runs: one record per provider/model execution, with id, provider, model, and results

Each example must have split=development, validation, or held-out. Each reference has adjudicatedScores and at least two independent raters. For Academic Task 1 and General Training Task 1, scores use taskAchievement, coherence, lexical, and grammar. For Task 2, use taskResponse, coherence, lexical, and grammar. Every reference score must be a numeric 0–9 half-band value. Rater IDs must be pseudonyms, unique within an essay, and not personal identifiers.

A run result identifies exampleId and contains either canonical scores or an assessment object with criteria, issues, and strengths. The evaluator understands WMR criterion objects where Task 1's internal id is taskResponse but the task-specific measured criterion is Task Achievement. A missing score reduces coverage; an invalid score such as 7.3 is reported as invalid and is never rounded.

## Minimum responsible collection protocol

1. Obtain explicit permission for the intended evaluation use; follow the source dataset's licence, retention limits and deletion terms. De-identify essays and prompts before they enter any benchmark file. Do not collect names, student IDs, email addresses, school names, or unrelated sensitive attributes.
2. Sample across Academic Task 1, General Training Task 1 and Task 2, prompt families, essay lengths and proficiency levels. Document inclusion/exclusion criteria. Do not present a convenience sample as representative of every IELTS candidate.
3. Have at least two qualified raters independently assess each criterion using the same rubric version. Keep raters blind to model/provider identity, model output and each other's ratings. Record original ratings before adjudication. Resolve disagreement with a documented third-rater or moderation process; preserve the independent ratings for agreement analysis.
4. Split by writer where possible, not just by essay. Keep all drafts of one essay, repeated prompts from a private writer set, and near-duplicate texts in the same split. Freeze the held-out set before changing prompts, examples, providers, rubric instructions or calibration logic. Exact duplicate detection is included; near-duplicate leakage still needs review.
5. Keep benchmark JSON and generated reports in a local ignored directory. The evaluator has no upload behaviour. Do not commit a private benchmark, even if it has been de-identified.

The evaluator requires an explicit permission and de-identification declaration, but those declarations are supplied by the dataset owner: the code cannot independently verify consent, legal rights or whether identifying details remain.

## Running it

Install dependencies as usual for the project, then create a dataset JSON outside tracked source files, for example in benchmarks/private. Add your own permissioned examples and reference ratings; do not use the unit-test fixtures as an accuracy dataset.

Run: npm run evaluate:benchmark -- benchmarks/private/your-dataset.json

To save a new report file: npm run evaluate:benchmark -- benchmarks/private/your-dataset.json --out benchmark-results/evaluation.json

The evaluator refuses to overwrite the input or an existing output file. Create the ignored output directory first. It prints or saves aggregate counts and metrics only, never essay text or prompts. The command itself does not send files to any network service. The application can still send text to a configured AI provider if a user explicitly initiates an assessment; that is a separate product action.

## Metrics and how to read them

For every split, task type and criterion, the report contains:

- Coverage: number of valid model predictions divided by the expected number. Missing and invalid scores must not disappear from view.
- MAE and median absolute error: typical band-point distance from adjudicated reference scores; smaller is better.
- RMSE: penalises larger errors more heavily than MAE.
- Bias: mean model score minus reference score. Positive means over-scoring; negative means under-scoring.
- Exact, within-half-band, and within-one-band rates; severe-error rate counts an absolute error of at least 1.5 bands.
- Quadratic weighted kappa (QWK): chance-adjusted agreement that penalises larger disagreements more. Interpret cautiously when score distributions are narrow or samples are small.
- Deterministic bootstrap 95% intervals for MAE, within-half-band rate and QWK when at least five score pairs exist. These are exploratory intervals, not a substitute for a pre-registered analysis; very small samples still produce unstable estimates.

The report separately measures human-rater agreement. If raters disagree materially, apparent model error is partly inseparable from label uncertainty. It also reports repeated-run consistency for the same provider/model on the same examples and exact-substring integrity for non-empty evidence quotes. A quote that exists in the essay can still support a wrong or irrelevant explanation; this is not a semantic correctness metric.

The evaluator warns when task/split cells have fewer than 30 examples. This is a caution threshold, not proof that 30 examples are enough. Before drawing strong conclusions, grow a pre-specified held-out set, examine confidence intervals and per-task/per-criterion errors, and review a blinded sample of reports with human experts. Consider larger samples and writer-level uncertainty estimates for formal claims.

## Release gate and claims

Do not publish “more accurate than IELTS graders” or a single overall accuracy percentage from a tiny sample. Do not treat exact band matches alone as success, and do not combine Task Achievement with Task Response. Compare model versions on the same frozen held-out essays, disclose provider/model and settings, report coverage and all four criteria, include human-rater agreement and uncertainty, and retain failed/invalid outputs in the denominator through the coverage metric.

There is currently no universal numerical pass threshold in this tool. Choose minimum acceptable MAE, severe-error rate, score coverage, evidence quality and task-specific tolerances before inspecting held-out results. A release should not claim validated calibration until those pre-registered gates are met and reviewed.

## Privacy and safety

The checked-in tests use generated synthetic strings and labels solely to exercise evaluator logic; they are not a public IELTS answer bank and provide no evidence of model quality. Never put API keys, real student submissions, identifiable annotations, or private provider outputs into test fixtures or the public repository.
