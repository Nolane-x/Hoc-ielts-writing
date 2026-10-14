# Security policy

WMR is a local-first single-user IELTS Writing application, not a hosted multi-user service. The HTTP runtime binds to loopback only. Do not expose its port to a LAN, tunnel, reverse proxy or public network.

## AI data boundary

- No essay or Mentor context is sent to an AI provider unless the user enables the provider permission and explicitly requests an assessment or Mentor response.
- Desktop API keys remain in runtime memory and are not written into settings files, returned by the settings endpoint or logged. Re-enter the key after restarting WMR.
- Android API keys use Android Keystore-backed secure storage.
- Hosted providers must use HTTPS and explicit user-supplied input/output token prices. The client rejects provider redirects and limits response size and request duration.
- Study, drafts, reports, learning history and validated backup import work without AI. Local preflight never produces an invented band score.
- The Mentor has no shell, arbitrary file, browser automation or generic tool-execution capability. Student essay, task prompts and conversation history are untrusted input.
- Imported backup files are treated as untrusted data: schema, task IDs, sizes, conversation roles and essay quotations are checked. API keys and provider permissions are never imported.

## Build and release

- CI installs from the committed npm lockfile and runs npm audit with the high severity threshold.
- Release automation builds Windows, Linux and Android packages in isolated platform jobs before publishing a prerelease.
- Electron child processes receive a restricted environment allowlist, and renderer navigation is limited to the explicit loopback origin.
- The Android APK is for sideloading/testing; the AAB is unsigned. Store signing secrets are not stored in this repository.

Report security issues privately to the repository maintainer. Do not include API keys, credentials or real learner essays in public reports.
