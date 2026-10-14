# Security policy

WMR is a local-first personal learning application, not a multi-user service. The HTTP runtime binds to loopback only and rejects non-loopback binding. Do not expose its port to a LAN, tunnel or public network.

## AI data boundary

- No essay is sent to an AI provider unless the user enables provider access and explicitly submits an assessment or tutor request.
- Desktop API keys are held in process memory and are not written into settings files or logs; re-enter the key after a restart.
- Android API keys are stored with Android Keystore-backed secure storage.
- Hosted providers require HTTPS and explicit per-million-token input/output prices before live requests.
- Study, drafts, task data and reports work without a provider. A local heuristic report is not represented as an IELTS band score.
- Essay text is untrusted input. The assessment agent has no shell, arbitrary file, browser automation or generic tool-execution capability.
- Requests and provider responses are bounded; provider redirects are rejected.

Report a security issue privately to the repository maintainer rather than publishing secrets or real learner essays.
