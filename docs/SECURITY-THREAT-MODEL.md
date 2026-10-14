# WMR v1 threat model

## Assets

- Personal drafts, reports, learning history and lesson data.
- API provider credentials and optional spending.
- Integrity of provider feedback and reported IELTS estimates.
- Local runtime process, settings and estimated usage ledger.

## Trust boundaries

1. **Browser/WebView to local runtime:** all write endpoints require JSON and enforce loopback host/origin matching. Request bodies and provider responses are bounded.
2. **Local runtime to AI provider:** the request is permitted only after explicit opt-in and an explicit user action. Hosted HTTPS providers require entered token prices; redirects are rejected. The desktop key exists only in runtime memory; Android uses Keystore-backed secure storage.
3. **Essay to model:** prompt, task and essay are untrusted input. The tutor has no shell, arbitrary filesystem, browser automation or generic tool execution.
4. **Model output to report:** strings are rendered as text, criterion IDs are fixed, and quotation spans are retained only if they occur in the source essay. This is an evidence check, not proof of semantic correctness.

## Key threats and mitigations

| Threat | Mitigation | Residual risk |
|---|---|---|
| Accidental external transmission | Local-first defaults, explicit provider toggle, send action required | A user who opts in knowingly sends the supplied text to the endpoint |
| API key exposure | No key in URL, settings JSON, GET responses or logs; Android secure store | Desktop key is in process memory while running |
| Cross-origin local API abuse | Loopback-only binding, origin/host checks on writes, no CORS | A compromised local process/browser extension remains in scope |
| Runaway spend | Daily call cap, per-call/day estimated budget, reservation before requests, fail-closed corrupt ledger | Provider prices/tokens are estimates; billing can differ |
| Prompt injection in essay | Essay marked untrusted, no general-purpose agent tools | Model may still produce incorrect or manipulated feedback |
| Fabricated quote | Citation spans must match essay text | Matching words do not prove an explanation is true |
| Misleading IELTS band | Explicit formative/uncalibrated labeling, no score in offline mode | Calibration remains future work against expert-rated essays |
| Provider redirect or huge response | Redirect disabled, output bounded and response-length checked | A provider can still return inaccurate or adversarial content |

## Release posture

This application is intended for one local user. Do not expose the runtime port, add public multi-user hosting, or claim official IELTS scoring. Before public distribution, run independent dependency, platform, accessibility, privacy and human-rated assessment reviews. Android Play Store distribution requires a protected release-signing configuration.
