# Changelog

## 1.7.0 — Speech, task-specific Academy content and local API hardening
- Fixed a startup crash in page navigation binding discovered by real-browser smoke testing.
- Corrected computer-delivered exam layout so the prompt and writing pane align side by side on desktop and stack responsively on narrow screens.
- Gate release packaging and publication on reusable Node 22/24 CI plus Chromium desktop/mobile smoke evidence, including read-aloud lifecycle checks.

- Add a device-native read-aloud dock with selected-text reading, current-page reading, Vietnamese/English language selection, pause/resume/stop controls and playback-rate selection. The feature uses the browser or OS speech engine and does not send text to a remote TTS provider.
- Replace generic Academy fallback content for the remaining 19 tasks with task-targeted topics, traps, collocations, sample passages and collocation exercises. Keep all 21 bundled tasks covered by the Academy test contract.
- Remove the unsupported numeric band label from Academy sample data and present the passages as uncalibrated study examples rather than Cambridge-verified or Band 8.5+ material.
- Require state-changing local API requests to carry an exact HTTP loopback Origin, and require a true application/json media type.
- Add regression tests for speech splitting and cancellation, Academy/task relevance, Origin validation and JSON media-type matching.
- Align package metadata and lockfile to version 1.7.0.

## 1.6.0 — Adaptive micro-practice journal

- Persist Writing Agent micro-practice answers locally with task, skill, success criteria and feedback state.
- Distinguish actual provider/local-guide feedback from provider-configuration notices in learning metrics.
- Add an expandable per-task journal for answers and feedback, with individual-attempt deletion.
- Include up to 100 validated practice attempts in local backups and clear them through the existing delete-local-data action.
- Add a cross-task micro-practice overview to the adaptive Learning page with recent attempts and feedback coverage.
- Keep the privacy model local-first: exercise history stays on the device; a configured provider receives text only when the learner explicitly requests feedback and has enabled provider access.
- Explicitly avoid treating activity counts as IELTS band scores or proof of mastery.
