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


## Writing Agent workspace boundary

The Writing Agent uses a fixed, named tool allowlist for the supplied IELTS task and draft: inspect, search exact phrases, stage an anchored patch, create an outline, create a micro-exercise, create a measurable learning goal, or focus a quote. The model does not receive shell, arbitrary filesystem, environment variables, secrets, browser automation or a general HTTP tool. It cannot change this tool registry through its own output.

A patch must match one unique source substring, must not overlap another staged patch, and is applied only after a learner clicks an explicit apply control. Applying changes records the previous draft locally; recovery replaces the editor only after a confirmation when the current text differs. The server streams progress and tool results with SSE; disconnecting aborts the session/provider request where supported. Each run is bounded by model-turn/tool-call limits, request timeout, body-size bound and the existing cost ledger. The existing Settings permission switch remains the explicit boundary for sending essay content to a configured provider.

These controls intentionally grant broad agency inside the writing workspace without granting control over the host operating system, credentials or arbitrary network destinations. Tool output and essays remain untrusted content; exact quotes prove location only, not semantic correctness.


## Proactive companion, annotation and custom-task extensions

### Additional data flows

| Flow | Source and authority | Deterministic gate | Effect |
|---|---|---|---|
| Idle-triggered review | Text entered by the learner; always untrusted content | Explicit local companion toggle AND existing provider-consent toggle; minimum changed-character threshold, minimum draft length, 25-second idle interval, two-minute cooldown, daily call cap and agent-session budget | One bounded Writing Agent run over a snapshot; all edits remain staged for a learner click |
| Scratchpad notes | Learner-authored short notes attached to the selected task; untrusted data | Length bounds and same provider-consent/budget gates as the corresponding Agent run | Included as context, never instructions or capabilities |
| AI annotations | Model proposes an exact quote and a category/note | Quote must occur exactly once, no overlapping annotation, per-session limit of ten | Colour-coded read-only evidence preview and click-to-select; it does not write into the learner essay |
| AI-generated task | Model-generated task fields | Strict JSON extraction, field limits, allowed Task type, minimum prompt length and task-count cap | Presented as unverified; persistence/opening requires a learner click |
| Direct AI task generation | User-selected task type plus optional user-supplied topic; no essay field is sent | Existing provider-consent check and one-request provider budget/call limits; output is parsed and bounded before display | Draft prompt is reviewed by the learner and saved only after an explicit action |
| Voice reminders | Existing timer text or bounded Agent summary | Local voice toggle; maximum 320 spoken characters; no capture API requested | Browser/system speech-synthesis output only; no microphone recording or audio upload |

### Additional protected invariants and validation

- The live-review timer does not call a model when proactive mode is off, external-provider permission is off, the workspace is busy, the draft has not reached the configured change threshold, or the cooldown remains active.
- Model-produced notes and generated tasks remain data. They cannot add tools, change model configuration, write credentials or trigger external actions.
- Annotation rendering escapes all text and re-resolves each quote against the current editor. Missing, repeated, stale or overlapping anchors are omitted instead of guessed.
- Generated and imported custom tasks are normalized against a strict task-type allowlist and bounded title, prompt, goal, tip and ID formats. Custom tasks cannot use reserved base-task IDs.
- Backup restore includes custom tasks and scratchpad notes but does not import provider configuration or API keys.
- Patch application is unchanged: every edit must match a unique current substring, overlapping edits are rejected, a pre-edit snapshot must be saved, and the learner explicitly approves the edit.
- These controls do not make model advice inherently correct. Human-rated IELTS quality and platform-specific voice behavior remain manual validation items.
