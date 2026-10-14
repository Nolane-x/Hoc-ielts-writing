# WMR Writing Mentor 1.3.0

WMR is a local-first IELTS Writing learning workspace for Vietnamese-speaking learners. It combines an essay editor, a guided 21-task practice bank, an optional multi-provider AI mentor, formative four-criterion feedback, private learning history and validated backup/restore.

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
- Provider access is disabled by default. The explicit permission switch must be enabled, and the learner must submit a review or Mentor question before text is sent.
- On desktop, the API key stays in process memory and must be re-entered after restarting WMR. On Android, the key is stored using Android Keystore-backed secure storage.
- No user account, cloud sync or multi-user web service is implemented. The local HTTP runtime binds to loopback only; do not expose its port through a LAN, tunnel or reverse proxy.
- The agent has no shell, generic tool-execution or arbitrary file/browser access. Learner essay, prompt and previous conversation turns are untrusted content.
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
