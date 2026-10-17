# WMR Writing Mentor 1.7.0

WMR is a local-first IELTS Writing learning workspace for Vietnamese-speaking learners. It combines an essay editor, a guided 21-task practice bank, an optional multi-provider AI mentor, formative four-criterion feedback, private learning history and validated backup/restore.

## Highlights in 1.7.0

- Academy templates are marked as illustrative rather than independently verified band-scored answers.
- Writing Agent event streaming has protocol-level regression coverage.
- Backup restore uses rollback for failed multi-key local writes.
- Application version is generated from package metadata; dynamic progress styling is CSP-safe.
- Opt-in proactive review after a pause in writing, with change threshold, cooldown and existing usage/budget gates.
- Browser/system speech synthesis for Agent summaries and timer reminders; no microphone capture.
- **Read-aloud studio:** listen to the IELTS prompt, the current essay, selected text or the latest feedback; pause/resume/stop, choose British/American English or Vietnamese, and adjust playback speed. Uses only browser/system speech synthesis.
- Evidence-grounded, colour-coded annotation map that revalidates exact quotes against the live draft.
- Learner-created and AI-generated custom prompts, persisted locally and included in validated backups; AI prompts are labelled unverified.

## Highlights in 1.4.0

- **Recurring error intelligence.** Detects issue categories that reappear across distinct essays, shows frequency and a targeted next exercise, and deliberately excludes local preflight, fallback reports, short essays and duplicate submissions. Task Achievement and Task Response remain separate.
- **Persisted issue resolution.** Reopening a saved report restores the learner's 'Đã xử lý' button state.
- **Evidence-gated skill profile.** Criterion averages now come from eligible AI assessments only and separate the five IELTS task criteria, not a mixed Task 1/Task 2 aggregate.

## Highlights in 1.3.0

- Correct Task 1 issue categories and Vietnamese report labels so Task Achievement is never conflated with Task Response.

## Highlights in 1.2

- **21 guided tasks** across Academic Task 1, General Training Task 1 and Task 2, with difficulty, estimated time and a focus skill. Numbers and maps created for practice are explicitly labelled synthetic data.
- **Context-aware Mentor** with up to eight recent user/assistant turns per task. The learner can clear the local conversation. Stored conversation is treated as untrusted context, not system authority.
- **Task-correct rubric.** Task 1 uses Task Achievement; Task 2 uses Task Response. Scores such as 7.3 are rejected rather than rounded, and essays under 80 words cannot receive an aggregate band estimate.
- **Revision comparison.** Reports compare two different drafts for the same prompt, showing criterion movement, word count and reported issue counts while warning that model variance makes this a learning signal rather than proof.
- **Rubric field guide.** Vietnamese, independently written summaries explain common signals, risks and practice moves for bands 5–9, with Academic Task 1, General Training Task 1 and Task 2 distinctions.
- **Evidence-aware reports.** Provider quotes must exactly match the submitted essay; mismatched quotes are discarded. Offline preflight does not fabricate a band. All AI scores remain formative estimates, not official IELTS scores.
- **Multi-provider AI** for OpenAI, Anthropic, Gemini, OpenRouter, DeepSeek, Groq, Together, Mistral, Ollama, LM Studio and custom OpenAI-compatible endpoints.
- **Adaptive study plan.** After AI assessments, WMR prioritises the weakest criterion with a follow-up exercise in a different task type; if there is no valid AI criterion score, it explicitly provides a starter plan rather than inventing weaknesses.
- **Backup and restore.** Import validates schema, supported task IDs, field lengths, report evidence and conversation roles. Import never replaces API keys, provider permission or provider settings.
- **More bounded runtime.** Provider requests have deadlines through response-body reading, responses are capped, API writes are loopback/origin checked, Electron child processes receive an environment allowlist, and navigation is constrained to the expected local origin.
- **Reproducible builds.** package-lock.json is committed; CI uses npm ci, checks high/critical dependency advisories, runs tests and builds the web bundle on Node 22 and 24.

## Privacy and AI boundary

- Drafts, tasks, local checks, history, learning summaries, Mentor history and theme settings work locally.
- Provider access is disabled by default. The explicit permission switch must be enabled. Proactive review requires a separate opt-in toggle and only sends after the configured idle/change threshold; direct AI task generation sends the task request, not the current essay.
- On desktop, the API key stays in process memory and must be re-entered after restarting WMR. On Android, the key is stored using Android Keystore-backed secure storage.
- No user account, cloud sync or multi-user web service is implemented. The local HTTP runtime binds to loopback only; do not expose its port through a LAN, tunnel or reverse proxy.
- The agent has no shell, generic tool-execution, arbitrary file/browser access, screen capture or microphone access. Learner essay, prompt, scratchpad and previous conversation turns are untrusted content.
- Voice output uses local browser/system speech synthesis only; no audio is recorded or uploaded.
- Hosted endpoints must use HTTPS and explicitly supplied input/output token prices. WMR estimates spend; the provider's actual billing can differ.
- On Android, 127.0.0.1 means the Android device itself. It does not reach an Ollama/LM Studio instance on a different computer.

## Run locally

Requires Node.js 22 or newer. Use a clean install:

    npm ci
    npm test
    npm run check
    npm run build:web
    npm start

Open http://127.0.0.1:4179. Keep the runtime loopback-only.

For the development UI, start the backend in one terminal after building the web assets, then run the Vite dev server in another:

    # terminal 1
    npm run build:web
    npm start

    # terminal 2
    npm run dev

Vite proxies /api calls to the local runtime. The production build uses relative paths and has no remote JavaScript or CSS assets.

## Multiple AI providers

Choose a service in Settings, enter the exact model ID supported by your account, and enter current input/output prices in USD per million tokens for hosted providers. WMR does not guess prices. Local loopback HTTP is allowed only for local model servers. If the provider format is not covered by a built-in adapter, the custom endpoint expects an OpenAI-compatible Chat Completions API.

The output cap, per-call estimate, daily estimated budget and daily call limit reduce accidental spend. They do not replace provider-side quotas. Keep credentials private and do not paste a real key into an essay, chat or report.

## Writing Mentor and assessment

The Mentor can help analyse a task, build an outline through questions, inspect an argument, and create a small practice exercise. It is designed to preserve learner authorship rather than write a complete essay on the learner's behalf. It remembers a bounded recent dialogue per task; clear it from the workspace whenever needed.

When a learner submits an essay, WMR creates a local preflight immediately. AI assessment runs only when the provider permission is enabled and a valid provider is configured. The report contains four IELTS criteria, evidence quotes, prioritised issues, targeted fixes, strengths and next-step actions.

A single essay's criterion mean is only a formative task-level estimate. It is not an official IELTS score or a validated prediction. Quotation matching proves only that the words occur in the source; it does not prove every explanation is semantically correct. A rigorous calibration claim requires an independent expert-rated dataset, criterion-level agreement analysis and repeated-model consistency tests.

## Data backup and restore

Settings → Data lets you export a JSON backup and restore one later. Import is limited to 5 MB, supported schema v1 and known task IDs. It bounds drafts, report history and Mentor conversation, drops unsupported roles and mismatched quotation evidence, and does **not** overwrite the current provider, API key, permission toggle or spend settings. Treat exported backups as private files.

## GitHub Actions release

CI uses the committed lockfile, runs npm audit --audit-level=high, executes the test suite and builds the web application on Node 22/24.

Pushing to main starts platform builds:

- Windows x64: NSIS installer and portable executable.
- Linux x64: AppImage and Debian package.
- Android: debug-signed APK for sideload/testing and an unsigned AAB.

The publish job verifies all five installer/package outputs are present before creating a GitHub prerelease tagged with the package version and workflow build number. The Android AAB is not Play Store-ready without maintainer-controlled release signing. No official production signing keys are stored in this repository.

## Validation status and limitations

Automated tests cover local HTTP security boundaries, API-key handling, provider adapters, response timeout/size limits, assessment evidence, backup import, task-bank metadata and desktop navigation/environment policy. CI checks syntax, tests, web build and dependency advisories. Cross-platform release builds are separately verified by Actions.

This is not a third-party security certification. Live provider billing/interoperability, installation on physical Android/Windows/Linux devices, screen-reader and manual keyboard testing, and assessment accuracy against human-rated essays still need direct verification. The original full v0.9 knowledge corpus was not part of the empty-repository bootstrap and is not claimed to be present.

## Scoring validation toolkit

The local benchmark evaluator reports criterion-specific and one-task composite-band MAE, RMSE, bias, exact and adjacent-band rates, severe-error rate, quadratic weighted kappa, exploratory bootstrap intervals, coverage, human-rater agreement, repeated-run consistency, and exact quote integrity. Run it against permissioned, de-identified essays and independently adjudicated ratings; see docs/SCORING-VALIDATION.md. The evaluator makes no network calls and its report omits essay text. The included synthetic unit tests are not a scoring benchmark, and this tool does not claim that WMR is calibrated.


## Real-time Writing Agent workspace

The Writing Agent can inspect draft structure, locate exact phrases, propose anchored sentence edits, create a learner-completable outline, generate a micro-exercise, define a measurable practice goal, search the bundled practice bank for a transferable next task and focus an exact quote. Its multi-step sessions stream progress and tool actions into the workspace. You can apply individual changes or a set of non-overlapping changes, ask the agent to find an offline transfer-practice task, save agent-created learning materials locally, and restore prior draft revisions.

The model has no shell, arbitrary file access, environment-variable or API-key access, browser automation, or general-purpose network tool. Agency is broad inside the writing task but remains bounded to named workspace actions; the AI cannot silently overwrite the editor. Remote execution still requires the existing provider opt-in and a budget estimate for multi-turn use. See docs/WRITING-AGENT.md for the tool protocol, data flow, cancellation behaviour and production limitations.


## Micro-practice journal

Answers to Writing Agent micro-exercises can be submitted for a tutor response and saved to a device-local practice journal. The journal stores the learner's answer, exercise criteria, and only verified tutoring feedback from a provider or the local guide; provider setup messages are not presented as pedagogical feedback. Users can inspect or delete individual attempts. The journal is included in validated local backups, and its attempt counts are not presented as band scores or proof of mastery.


## WMR 1.6.0 — Adaptive micro-practice

The Writing Agent's micro-exercises now form a persistent learning loop. Answers, exercise criteria and verified tutor feedback can be reviewed or deleted from the on-device practice journal, included in validated local backups, and summarized across tasks on the adaptive Learning page. Provider configuration notices are never treated as teaching feedback; activity counts are not represented as band scores or proof of mastery.
