# Changelog

## Unreleased
- Queue Companion voice reminders behind active Read Aloud without interruption; clear queued reminders on opt-out and verify both paths in Chromium smoke.
- Enforce zero Axe violations across nine WCAG 2.0/2.1/2.2 A/AA UI states, with light/dark and mobile practice coverage.
- Preserve rule-level Axe `incomplete` findings in the smoke manifest for manual accessibility follow-up.
- Abort in-flight assessment, Mentor, task-generation and Writing Agent provider requests immediately when provider consent is revoked, with regression coverage for cancellation and request-start races.
- Reconcile the Full-Cycle Academy design spec with the released 1.7.0 scope and explicit remaining acceptance requirements.

## 1.7.0 — Speech, task-specific Academy content and local API hardening
- Add opt-in Proactive Writing Companion reviews with per-task baselines, changed-text threshold, cooldown, approval-staged edits, cancellation and existing budget limits.
- Add local custom prompt creation/management and a consent-gated task-generation endpoint that excludes essay text, the current prompt and chat history from upstream context.
- Add quote-anchored essay annotations with revalidation and task-aware IELTS criterion naming.
- Add Read Aloud language/voice preferences (auto, British English, American English, Vietnamese), playback controls and bounded text preparation; actual voice availability remains device-dependent.
- Make local backup restoration transactional with rollback and explicit reporting if rollback itself fails.
- Replace ad hoc Writing Agent SSE framing parsing with a bounded, reusable parser and fragmented UTF-8 regression coverage.
- Generate the visible UI version from `package.json` during the Vite build.
- Remove synthetic Band 7.5/8.5 rewrite tiers and describe the exam-like interface and task bank as practice material, not official test software or Cambridge content.
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
