# WMR Assessment Intelligence Engine

## Responsibilities

The assessment pipeline separates deterministic checks, rubric-based AI judgement, evidence validation and learning actions. It is formative and does not provide an official IELTS score.

## Pipeline

1. **Preflight:** task type, word count, empty content and basic structure signals. This stage never fabricates a band.
2. **Task analysis:** separate instructions for Academic Task 1, General Training Task 1 and Task 2.
3. **Rubric-anchored judgement prompt:** injects the matching task-specific original Vietnamese guideposts for bands 5–9, including performance signals and risks, and asks the model to justify non-null scores against observed evidence and adjacent-band limits.
4. **Four-criterion judgement:** Task Achievement/Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.
4. **Evidence validation:** quotation text in criteria, issues and strengths must match the submitted essay exactly, including case. Unsupported quotes are discarded.
5. **Report:** criterion estimates, explanations, severity-ranked issues, strengths, priorities and uncertainty.
6. **Learning loop:** the learner reviews, revises, marks feedback resolved and practises a targeted skill. The bounded Mentor conversation can carry a few recent turns for the current task.
7. **Adaptive study plan:** aggregate only finite criterion scores in range 0–9; rank criteria by observed mean, then choose a primary task and a transfer task. Missing/null scores are not converted to zero. Without a valid criterion score, show a labelled starter path, not a diagnosis.

## Scoring integrity

- Scores are formative estimates, never official IELTS results.
- A single-task mean is labelled a task-level estimate; it is not an overall Writing score.
- Provider-generated scores have not been calibrated against an independent human-rated dataset yet. The prompt includes concise, original learner-facing band 5–9 signals and risks from the in-app guide; these are not verbatim official descriptors and their inclusion is not proof that model scores became more accurate. Feedback explanations default to Vietnamese while preserving essay quotes and corrected phrases in English.
- A quotation matching the essay does not itself prove the explanation is correct.
- Sophisticated vocabulary does not compensate for missing task requirements, unsupported claims or weak logic.
- Synthetic practice graphs, tables and maps are labelled as synthetic, and their figures must not be represented as real-world statistics.

## Agent authority and memory

The Tutor has no execution tools, shell, arbitrary file access or browser automation. The system prompt remains fixed; conversation history is restricted to user/assistant roles, the most recent eight turns, and bounded text lengths. Student essays and earlier dialogue turns are context rather than policy.

## Evaluation gate

Before claiming scoring accuracy, curate representative Task 1 and Task 2 essays with expert reference ratings, measure agreement and error by criterion, track fabricated feedback, and test consistency across repeated runs and provider/model changes.

## Reproducible validation toolkit

The local evaluator and dataset contract are documented in docs/SCORING-VALIDATION.md. It keeps Task Achievement and Task Response separate; requires adjudicated half-band references and two independent rater scores; reports coverage, disagreement, repeated-run consistency and quote integrity; and emits aggregate metrics without essay text. Its existence is not evidence of accuracy: WMR remains uncalibrated until a permissioned held-out dataset is collected, scored independently and evaluated against pre-defined criteria.


## Writing Agent workspace runtime

The interactive Writing Agent runs up to ten model turns and eight tool calls per session. Its tool allowlist is intentionally tailored to writing: inspect the draft, search exact phrases, stage precise edits, produce an outline, create a focused exercise, define a measurable goal, search the bundled offline task bank and focus a unique quote. The agent can chain tools, inspect their results and stream its work as progress/tool/result events; an unstructured model reply is kept read-only rather than interpreted as an action.

Every edit is a staged source patch based on a unique exact quote from the session snapshot. Patch ranges cannot overlap. The app rechecks anchors against the current editor, saves a local revision before applying, applies multiple patches from end to start, and rejects stale/ambiguous anchors instead of guessing. Draft revisions are capped at five per task, and saved outlines/exercises/goals/focus notes are stored locally and included in validated backups. Native builds run the same agent loop directly; desktop/web use the loopback SSE route.

The provider permission switch remains required. Remote cost estimates account for multiple model turns and use the existing fail-closed usage ledger; a budget estimate can be conservative because later turns see accumulated tool results. Cancellation is forwarded through AbortController and should be treated as a best-effort stop for in-flight provider calls. This agent is not allowed to operate the host OS, read arbitrary files or secrets, or call arbitrary network tools. Its greater agency is limited to learner-visible actions in the supplied writing workspace.

Tests cover grounded patches, ambiguous/missing quotes, prohibited tools, bounded session loops, local practice-bank search, provider-opt-out gating and the local-provider SSE tool chain. These are behaviour tests, not proof that the provider's educational advice is correct.
