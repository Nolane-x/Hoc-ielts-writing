# Writing Agent Workspace

## What the agent can do

WMR's Writing Agent is a bounded multi-step agent that can call named workspace tools instead of only producing a chat answer. It can inspect word/paragraph structure, find exact phrases in a draft, propose targeted edits, create an outline with blanks for the learner, create a focused micro-exercise, define a measurable learning goal, and select a unique quote for focused review.

The allowlist lives in `web/writing-agent.mjs`. It is not chosen by model output and cannot be expanded by the model. Unknown tools are rejected. The agent loop currently allows at most six model turns and five tool calls per session; normal sessions finish earlier. Its per-turn output budget is bounded. Tool output and prior assistant messages are data, not policy.

## Live flow

For web/Electron, the app posts the task type, prompt snapshot, essay snapshot, learner objective and bounded recent dialogue to the loopback `POST /api/agent` endpoint. It receives server-sent events (SSE):

- `progress`: session or reasoning-phase status
- `tool`: tool started, completed or rejected
- `result`: structured final message, patches, outline, exercise, goal, focus quote and usage counters
- `error`: a sanitized session failure notice

The response uses no-store headers. The browser sends an AbortController signal; closing the response aborts the run. Each model request also has a timeout. Cancellation cannot guarantee that a remote provider never received an already-dispatched request; usage estimates are reserved before the session to avoid treating uncertain requests as free.

Native builds run the same agent loop in the app process and call the provider directly. Provider settings, opt-in and local usage/cost checks still apply. Local Ollama/LM Studio endpoints are supported through the existing local provider configuration.

## Editing and ownership

The agent is allowed to suggest patches without asking before every inspection or suggestion. Each proposed patch must reference a unique, exact substring in the session's original essay. Patches need a non-empty Vietnamese rationale, have bounded lengths, and cannot overlap. The tool does not modify the live draft.

The UI shows source text beside the replacement. A learner can apply one patch or all current non-overlapping patches. Before applying, the app revalidates all anchors against the *current* editor, checks overlaps again, confirms the resulting length, and saves a local pre-edit snapshot. Stale, repeated or missing anchors are rejected rather than guessed. Revisions are capped at five per task and can be restored; restoring over a different current draft asks for confirmation and saves the current content first.

The app also displays outlines, micro-exercises, success criteria, goals and quote-focus notes. Learners choose when to save these items to the local artifact library. Each exercise has a response field which can be submitted to Mentor for formative feedback. Artifacts and the last five draft revisions per task are included in validated local backups. Credentials and provider settings are not imported from a backup.

## Permission and safety boundary

WMR is local-first. The existing Settings toggle `externalAllowed` must be enabled before the agent contacts a provider. Remote providers require a supported HTTPS endpoint, exact model ID, explicit token pricing and successful local budget reservation. The session cost estimate assumes the bounded maximum number of turns and is intentionally conservative. If it exceeds the current per-call/day limit, the user can adjust Settings or choose a local model; the server does not silently bypass the limit.

The agent has no shell, arbitrary filesystem read/write, environment-variable access, API-key access, browser automation, or general HTTP/network tool. It only receives the selected task and essay snapshot, recent bounded dialogue, and results of the named writing tools. The server remains loopback-only and the API route retains Host/Origin validation and the request body limit.

These boundaries are deliberate: the goal is strong real-time agency *inside the writing workspace*, not control of the user's operating system or secrets. The application does not expose a generic code-execution surface to the model.

## Failure behaviour

If the model returns unstructured text or malformed tool calls, the agent falls back to read-only text rather than interpreting arbitrary prose as an action. Invalid tool names/arguments fail closed. If the model stops after a tool call at the turn limit, already-created patches remain pending approval. A provider failure keeps the saved draft untouched; a retry can start a fresh session. Multi-step sessions can reserve an estimated cost in advance, and failed/aborted remote requests may still incur provider charges if the provider already accepted them.

## Production acceptance checklist

The following are checked in CI via unit and local integration tests:
- Tool allowlist rejects undeclared capabilities.
- Edit anchors must be exact and unique; overlapping patches are rejected.
- Live draft is unchanged while proposals are generated.
- Tool and model-turn budgets are enforced.
- Provider opt-out rejects agent calls.
- A configured local-compatible provider produces the expected SSE progress/tool/result event chain.
- UI controls exist for cancellation, approval, revision restoration and artifact library.
- Backup validation constrains artifact kinds, task IDs, lengths and revision counts.
- Existing provider, cost-ledger, loopback and dependency-audit checks still run.

Manual production validation is still needed for real provider cancellation semantics, accessibility with keyboard/screen readers, physical Windows/Linux/Android builds and pedagogical quality. The agent's structured actions are not proof that its advice is correct; score quality still requires a permissioned, independently rated writing corpus.
