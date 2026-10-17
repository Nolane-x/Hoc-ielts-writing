# Changelog

## Unreleased

- Add a full local read-aloud studio for listening to the current essay, IELTS prompt, selected passage or visible feedback.
- Support pause/resume/stop, automatic or explicit British English/American English/Vietnamese voice locale, and adjustable playback speed.
- Split long reads into bounded sequential utterances, redact URLs and credential-like strings, and disclose unsupported speech environments without claiming playback started.
- Add unit and headless browser coverage for speech lifecycle, selected text, task prompt and responsive controls.

## 1.7.0 — Production hardening and Academy integrity

- Fix Writing Agent server-sent-event framing and use a bounded client parser with protocol-level tests.
- Remove unverified Band 8.5+ claims from uncalibrated Academy templates and sentence-surgery suggestions.
- Stop showing default 6.0 personal criterion scores when no eligible assessment exists.
- Confirm before inserting an outline into a non-empty draft and roll back failed local backup writes.
- Generate the UI version from package metadata and replace dynamic inline styles with CSP-safe classes.
- Add browser screenshot evidence for Academy, practice mode, local report, Learning and mobile navigation.

## 1.6.0 — Adaptive micro-practice journal

- Persist Writing Agent micro-practice answers locally with task, skill, success criteria and feedback state.
- Distinguish actual provider/local-guide feedback from provider-configuration notices in learning metrics.
- Add an expandable per-task journal for answers and feedback, with individual-attempt deletion.
- Include up to 100 validated practice attempts in local backups and clear them through the existing delete-local-data action.
- Add a cross-task micro-practice overview to the adaptive Learning page with recent attempts and feedback coverage.
- Keep the privacy model local-first: exercise history stays on the device; a configured provider receives text only when the learner explicitly requests feedback and has enabled provider access.
- Explicitly avoid treating activity counts as IELTS band scores or proof of mastery.
