# Production readiness — WMR Writing Mentor 1.6.0

This document distinguishes automated evidence from checks that still require a real provider, device, or independently rated learner data. A green build is necessary, but it is not equivalent to a production-readiness claim.

## Verified baseline

- `main` is at WMR 1.6.0 and contains the Writing Agent workspace and local micro-practice journal.
- Existing CI checks Node 22 and Node 24, installs from `package-lock.json`, audits high/critical dependency advisories, runs the test suite, builds the web bundle, and rejects remote script/style assets.
- Provider access defaults to off. The app is designed to run locally; the local runtime must remain bound to loopback.
- The release workflow packages Windows x64, Linux x64, and Android outputs. The Android AAB remains unsigned and is not ready for Play Store publication without maintainer-controlled signing.

## Acceptance gates

### 1. Every commit — automated

- [ ] Node 22 and Node 24: clean install, dependency audit, full tests, production web build.
- [ ] Runtime visual smoke: load the production build in Chromium; verify version label, essay editor, Writing Agent workspace, local report flow, Learning page, and privacy defaults.
- [ ] Capture desktop views for Writing Workspace, Writing Agent, Local Report, Learning, and Settings/Privacy; capture mobile Workspace and open navigation drawer.
- [ ] Assert mobile layout has no material horizontal overflow and the browser emits no runtime/console errors.
- [ ] Upload screenshot PNGs plus the machine-readable smoke manifest as the `wmr-ui-screenshots` CI artifact. These screenshots are generated evidence, not a substitute for human design review.

### 2. Provider integration and cancellation — real-provider/manual

- [ ] Run one low-cost smoke request per supported provider family using a test key and explicit token pricing; never store the key in fixtures, logs, screenshots, or repository files.
- [ ] Verify timeout, malformed output, rate-limit, unavailable endpoint and cancellation behaviour. Cancellation cannot retract a provider request already accepted remotely.
- [ ] Compare the local estimated spend ledger with provider-side usage for representative requests and confirm daily/session caps fail closed.
- [ ] Verify provider opt-out causes no outbound request, including Writing Agent and micro-practice feedback.

### 3. Data safety and recovery — desktop/mobile acceptance

- [ ] Test backup/export, invalid backup rejection, restore, deletion and version migration with synthetic data on Windows, Linux and Android.
- [ ] Confirm draft revisions, artifacts and practice answers restore correctly while API keys, provider permission and cost settings never come from imported backups.
- [ ] Inspect logs and crash output for accidental essay, credential, or provider-response leakage.
- [ ] Confirm the runtime remains loopback-only and external transmission is opt-in.

### 4. Accessibility and responsive design — manual acceptance

- [ ] Complete every primary flow using only keyboard, including Escape/cancel, focus restoration, error recovery and patch approval.
- [ ] Test screen reader names/roles/live regions, zoom at 200%, contrast, reduced motion, and mobile drawer focus/closure.
- [ ] Review the uploaded desktop and mobile screenshots at normal scale; visual automation catches regressions but cannot judge whether the learning hierarchy feels clear.

### 5. Learning-quality evidence — separate research gate

- [ ] Build a permissioned, de-identified, independently double-rated essay set across Academic Task 1, General Training Task 1 and Task 2.
- [ ] Keep a held-out split; report criterion-level coverage, MAE, within-half-band agreement, severe errors, quadratic weighted kappa, rater agreement and repeated-run consistency.
- [ ] Review Vietnamese explanations with IELTS writing educators and learners. Do not claim calibrated band accuracy until this gate is met.

## Release sequence

1. Require the Node 22/24 CI jobs and visual-smoke job to pass on the exact candidate commit.
2. Inspect the screenshot artifact and review outstanding code/CI feedback.
3. Build all release artifacts; verify checksums and install/launch on real Windows and Linux systems and a physical Android device.
4. Keep Android store signing outside public CI and use maintainer-controlled secrets only when a signed store release is intentionally prepared.
5. Publish a prerelease first, smoke-test that exact artifact, then promote deliberately.

## Rollback

Revert the focused production-acceptance commit if its HTML version transform or visual workflow causes release regressions. The visual workflow is additive and does not change provider permissions, the Writing Agent capability allowlist, or stored learner data.
