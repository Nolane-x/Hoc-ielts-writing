# Production readiness — WMR Writing Mentor 1.7.0

## Automated candidate checks

The repository now enforces the following evidence on the release workflow:

- Node 22 and Node 24 CI, including the full test suite and a high/critical dependency audit gate.
- A production web build whose displayed version is generated from `package.json`.
- A Chromium desktop/mobile smoke run covering application startup, navigation, the two-column exam practice layout, its narrow-screen fallback, read-aloud UI state transitions, local report generation, learner-evidence messaging, privacy defaults and visible version parity.
- Axe scans across nine UI states (writing, reports, learning dashboard, privacy settings, exam practice, light/dark themes and mobile practice) fail on any violation under WCAG 2.0, 2.1 and 2.2 A/AA tags. The confirmed GitHub Actions run [39089448492](https://github.com/Nolane-x/Hoc-ielts-writing/actions/runs/39089448492) on 2026-10-18 passed all nine scans with 0 violations and no browser/runtime errors. The manifest now retains rule-level `incomplete` details for manual follow-up; incomplete rules are not treated as passes.
- Release packaging jobs wait for both reusable CI and browser-smoke workflows; publication waits for those checks and all platform artifact jobs.
- Local backup restore is applied with rollback on failed storage writes. A bounded, reusable SSE parser is shared by the Writing Agent stream and dedicated regression tests.
- Academy sample essays are explicitly uncalibrated study material. Sentence Surgery does not invent generic “Band 7.5/8.5” rewrites when the assessment provides no supported suggestion.

Browser smoke uses a mocked Web Speech engine. It verifies UI control wiring and state transitions but cannot prove the system has a voice installed, that a physical speaker works, or that audio quality is good.

## Still required before claiming production-ready

- Manual real-provider acceptance with test credentials for timeouts, cancellation, malformed output, rate limits and budget accounting. Credentials must stay out of source, screenshots and logs.
- Install/launch and data restore checks on Windows and Linux; Android APK/AAB checks on a physical device. The generated Android App Bundle is unsigned unless a separate signing workflow is configured.
- Manual screen-reader review with NVDA/VoiceOver/TalkBack, real keyboard-only review outside headless Chromium, zoom/reflow checks at 200–400%, forced-colors review and device-specific spoken-language testing. Automated Axe results do not certify these interaction modes.
- Independent IELTS educator ratings on a permissioned, de-identified held-out essay corpus before making any band-calibration or score-accuracy claim.

## Release boundary

The Build/Release workflow publishes prereleases only after CI, Chromium smoke and all platform packaging jobs succeed. That automation is not a production launch certificate, a third-party security audit, an IELTS score-calibration study or a substitute for physical-device acceptance.
