# WMR Assessment Intelligence Engine

## Responsibilities

The assessment pipeline separates deterministic checks, rubric-based AI judgement, evidence validation and learning actions. It is formative and does not provide an official IELTS score.

## Pipeline

1. **Preflight:** task type, word count, empty content and basic structure signals. This stage never fabricates a band.
2. **Task analysis:** separate instructions for Academic Task 1, General Training Task 1 and Task 2.
3. **Four-criterion judgement:** Task Achievement/Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.
4. **Evidence validation:** quotation text in criteria, issues and strengths must match the submitted essay exactly, including case. Unsupported quotes are discarded.
5. **Report:** criterion estimates, explanations, severity-ranked issues, strengths, priorities and uncertainty.
6. **Learning loop:** the learner reviews, revises, marks feedback resolved and practises a targeted skill. The bounded Mentor conversation can carry a few recent turns for the current task.
7. **Adaptive study plan:** aggregate only finite criterion scores in range 0–9; rank criteria by observed mean, then choose a primary task and a transfer task. Missing/null scores are not converted to zero. Without a valid criterion score, show a labelled starter path, not a diagnosis.

## Scoring integrity

- Scores are formative estimates, never official IELTS results.
- A single-task mean is labelled a task-level estimate; it is not an overall Writing score.
- Provider-generated scores have not been calibrated against an independent human-rated dataset yet.
- A quotation matching the essay does not itself prove the explanation is correct.
- Sophisticated vocabulary does not compensate for missing task requirements, unsupported claims or weak logic.
- Synthetic practice graphs, tables and maps are labelled as synthetic, and their figures must not be represented as real-world statistics.

## Agent authority and memory

The Tutor has no execution tools, shell, arbitrary file access or browser automation. The system prompt remains fixed; conversation history is restricted to user/assistant roles, the most recent eight turns, and bounded text lengths. Student essays and earlier dialogue turns are context rather than policy.

## Evaluation gate

Before claiming scoring accuracy, curate representative Task 1 and Task 2 essays with expert reference ratings, measure agreement and error by criterion, track fabricated feedback, and test consistency across repeated runs and provider/model changes.

## Reproducible validation toolkit

The local evaluator and dataset contract are documented in docs/SCORING-VALIDATION.md. It keeps Task Achievement and Task Response separate; requires adjudicated half-band references and two independent rater scores; reports coverage, disagreement, repeated-run consistency and quote integrity; and emits aggregate metrics without essay text. Its existence is not evidence of accuracy: WMR remains uncalibrated until a permissioned held-out dataset is collected, scored independently and evaluated against pre-defined criteria.
