# WMR Assessment Intelligence Engine

## Responsibilities

The assessment pipeline separates deterministic checks, rubric-based AI judgement, evidence validation and learning actions. It is formative and does not provide an official IELTS score.

## Pipeline

1. **Preflight:** task type, word count, missing text and basic structural signals. This stage never fabricates a band.
2. **Task analysis:** separate instructions for Academic Task 1, General Training Task 1 and Task 2.
3. **Four-criterion judgement:** Task Achievement/Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.
4. **Evidence validation:** issue and strength quotations must occur in the submitted essay; unsupported quotations are discarded.
5. **Report:** criterion estimates, explanations, severity-ranked issues, strengths, priorities and uncertainty.
6. **Learning loop:** compare revisions, mark feedback resolved, then practise a targeted skill.

## Scoring integrity

- Scores are formative estimates, never official IELTS results.
- A single-task mean is labelled a task-level estimate; it is not an overall Writing score.
- Provider-generated scores have not been calibrated against an independent human-rated dataset yet.
- A quotation matching the essay does not itself prove the explanation is correct.
- Sophisticated vocabulary does not compensate for missing task requirements, unsupported claims or weak logic.

## Evaluation gate

Before claiming scoring accuracy, curate representative Task 1 and Task 2 essays with expert reference ratings, measure agreement and error by criterion, track fabricated feedback, and test consistency across repeat runs and provider/model changes.
