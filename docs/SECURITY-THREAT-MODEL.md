# WMR v1.1 threat model

## Assets

- Personal drafts, reports, learning history, Mentor conversations and backup files.
- API provider credentials and optional spending.
- Integrity of provider feedback and reported IELTS estimates.
- Local runtime process, settings, npm dependency graph and release artifacts.

## Trust boundaries

1. **Browser/WebView to local runtime:** write endpoints require JSON and enforce loopback host/origin matching. Request bodies and provider responses are bounded. The desktop renderer may only navigate to the expected loopback origin.
2. **Desktop launcher to child runtime:** child processes receive an explicit environment allowlist instead of all inherited process environment variables.
3. **Local runtime to AI provider:** requests are allowed only after explicit opt-in and a deliberate learner action. Hosted HTTPS providers require user-supplied token prices. Redirects are rejected, response bodies are size-capped, and the request deadline remains active while reading the body.
4. **Essay to model:** task, essay and dialogue are untrusted input. The Tutor has no shell, arbitrary filesystem, browser automation or generic tool execution.
5. **Backup file to local storage:** data is parsed and sanitized against schema v1, known task IDs, bounded sizes, allowed conversation roles and exact essay evidence. Provider keys/settings are not restored.
6. **Model output to report:** dynamic strings are rendered as text, criterion IDs are fixed and quotations are retained only if they occur exactly in the essay. This is an evidence check, not proof of semantic correctness.

## Key threats and mitigations

| Threat | Mitigation | Residual risk |
|---|---|---|
| Accidental external transmission | Provider permission off by default, explicit send action required | A user who opts in knowingly sends supplied text to the configured endpoint |
| API key exposure | No key in URL, settings JSON, GET response or log; memory-only desktop key; Android secure storage | Desktop key exists in process memory while WMR runs |
| Cross-origin local API abuse | Loopback-only binding, Host/Origin checks on writes, no CORS | Compromised local software or browser extensions remain outside the main control |
| Runaway spend | Daily request cap, per-call/day estimated cost caps, reservation before requests, fail-closed corrupt ledger | Prices/token counts are estimates; actual provider billing can differ |
| Prompt injection in essay/history | Untrusted-source labels, role-allowlisted bounded history, no general-purpose tools | Model may still produce incorrect or manipulated feedback |
| Fabricated quote | Exact, case-sensitive quote matching | Matching words do not prove an explanation is true |
| Malicious backup import | Schema, task ID, input size, role and quote validation; credentials not imported | User may choose to overwrite their own local drafts/history |
| Runaway/stalled provider response | Abort deadline covers body streaming; cap responses at 1 MB | Provider/runtime bugs can still cause temporary unavailability |
| Misleading IELTS band | Explicit formative/uncalibrated labels; no offline band | Calibration remains future work against expert-rated essays |
| Dependency compromise | Committed lockfile, npm ci and npm audit high-severity gate | Advisory databases do not prove dependency code is safe |
| Environment-variable leakage to child process | Electron child environment allowlist | Platform-specific environment needs still require regression testing |

## Release posture

This application is intended for one local user. Do not expose the runtime port, add public multi-user hosting or claim official IELTS scoring. Before broad public distribution, run independent dependency, platform, accessibility, privacy and human-rated assessment reviews. Android Play Store distribution requires a protected release-signing setup.
