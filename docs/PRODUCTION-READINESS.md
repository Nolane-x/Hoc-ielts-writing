# Production readiness — WMR Writing Mentor 1.7.0

## Verified candidate scope

- Writing Agent SSE framing and parser regression coverage.
- CSP-safe progress/status states and generated UI version.
- Academy placeholders identified as illustrative; no unvalidated Band 8.5+ templates or default personal 6.0 radar scores.
- Backup restore uses a rollback-capable local storage transaction.
- Browser screenshot workflow captures desktop and mobile views and uploads a machine-readable manifest.

## Required acceptance before production

- Green Node 22/24 CI and visual smoke on the exact candidate commit.
- Real-provider timeout, cancellation, malformed response, rate limit and budget checks using test credentials kept out of source and logs.
- Backup/restore, deletion and restart checks on Windows, Linux and Android.
- Keyboard-only use, screen-reader support, reduced motion, zoom and mobile drawer checks.
- Install and launch exact platform artifacts; Android AAB remains unsigned.
- Independent IELTS educator ratings on a permissioned, de-identified held-out essay set before any band-calibration claim.

## Release boundary

CI and visual screenshots provide candidate evidence but are not a production launch certificate. The existing Build/Release workflow still needs a release-level dependency on verification and visual smoke before publishing. This branch has not been merged to main or released.
