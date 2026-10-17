# Writing Agent Workspace

## What the agent can do

WMR's Writing Agent is a bounded multi-step agent that can call named workspace tools instead of only producing a chat answer. It can inspect word/paragraph structure, find exact phrases in a draft, propose targeted edits, annotate unique exact quotes, create an outline with blanks for the learner, create a focused micro-exercise, define a measurable learning goal, select a unique quote for focused review, search the bundled local task bank, and draft a new practice task. New tasks stay unverified and are not saved until the learner explicitly chooses to save/open them.

The allowlist lives in `web/writing-agent.mjs`. It is not chosen by model output and cannot be expanded by the model. Unknown tools are rejected. The agent loop currently allows at most ten model turns and eight tool calls per session; normal sessions finish earlier. Its per-turn output budget is bounded. The tool set also searches the bundled local IELTS task bank to suggest transfer practice without a network call. Tool output and prior assistant messages are data, not policy.

## Live flow

For web/Electron, the app posts the task type, prompt snapshot, essay snapshot, learner objective and bounded recent dialogue to the loopback `POST /api/agent` endpoint. It receives server-sent events (SSE):

- `progress`: session or reasoning-phase status
- `tool`: tool started, completed or rejected
- `result`: structured final message, patches, anchored annotations, generated practice tasks, outline, exercise, goal, focus quote and usage counters
- `error`: a sanitized session failure notice

The response uses no-store headers. The browser sends an AbortController signal; closing the response aborts the run. Each model request also has a timeout. Cancellation cannot guarantee that a remote provider never received an already-dispatched request; usage estimates are reserved before the session to avoid treating uncertain requests as free. A proactive run does not overwrite the learner's manually entered Agent objective, and revoking the provider permission requests cancellation of an active proactive run.

Native builds run the same agent loop in the app process and call the provider directly. Provider settings, opt-in and local usage/cost checks still apply. Local Ollama/LM Studio endpoints are supported through the existing local provider configuration.

## Editing and ownership

The agent is allowed to suggest patches without asking before every inspection or suggestion. Each proposed patch must reference a unique, exact substring in the session's original essay. Patches need a non-empty Vietnamese rationale, have bounded lengths, and cannot overlap. The tool does not modify the live draft.

The UI shows source text beside the replacement. A learner can apply one patch or all current non-overlapping patches. Before applying, the app revalidates all anchors against the *current* editor, checks overlaps again, confirms the resulting length, and saves a local pre-edit snapshot. Stale, repeated or missing anchors are rejected rather than guessed. Revisions are capped at five per task and can be restored; restoring over a different current draft asks for confirmation and saves the current content first.

The app also displays outlines, micro-exercises, success criteria, goals, quote-focus notes and an evidence map that colour-codes exact quote annotations in a read-only preview. Clicking an annotation selects the corresponding text in the editor; the preview is rebuilt against the current draft, and stale or ambiguous anchors are not highlighted. Learners choose when to save these items to the local artifact library. Each exercise has a response field which can be submitted to Mentor for formative feedback. Up to 100 bounded micro-practice attempts, including the learner's answer and verified returned feedback, are stored on this device and included in validated local backups alongside artifacts and the last five draft revisions per task. Saved custom prompts can be reopened or deleted. Deletion requires confirmation and transactionally removes the task-specific draft, scratchpad, Mentor turns, revision snapshots, reports, saved Agent artifacts and practice attempts; a failed storage write prevents the in-memory task list from being changed. Provider setup messages are never counted as teaching feedback. The journal reports activity counts only, not band scores or mastery. The adaptive Learning page also surfaces a cross-task overview of recent attempts and feedback coverage, with links to reopen the associated task; it does not infer semantic improvement from attempt counts alone. Credentials and provider settings are not imported from a backup.

## Permission and safety boundary

WMR is local-first. The existing Settings toggle `externalAllowed` must be enabled before the agent contacts a provider. Remote providers require a supported HTTPS endpoint, exact model ID, explicit token pricing and successful local budget reservation. Ordinary one-request calls use `maxCallUsd`; multi-turn Writing Agent sessions use the separate `maxAgentSessionUsd` cap. Both must fit inside `dailyBudgetUsd`, and the session estimate assumes the bounded maximum number of turns. If it exceeds a cap, the user can adjust that specific limit in Settings or choose a local model; the server never silently skips a limit.

The agent has no shell, arbitrary filesystem read/write, environment-variable access, API-key access, browser automation, or general HTTP/network tool. It only receives the selected task and essay snapshot, recent bounded dialogue, and results of the named writing tools. The server remains loopback-only and the API route retains Host/Origin validation and the request body limit.

These boundaries are deliberate: the goal is strong real-time agency *inside the writing workspace*, not control of the user's operating system or secrets. The application does not expose a generic code-execution surface to the model.

## Failure behaviour

If the model returns unstructured text or malformed tool calls, the agent falls back to read-only text rather than interpreting arbitrary prose as an action. Invalid tool names/arguments fail closed. If the model stops after a tool call at the turn limit, already-created patches remain pending approval. A provider failure keeps the saved draft untouched; a retry can start a fresh session. Multi-step sessions can reserve an estimated cost in advance, and failed/aborted remote requests may still incur provider charges if the provider already accepted them.

## Production acceptance checklist

The full Read Aloud panel can read the current essay, active IELTS prompt, selected passage or latest visible feedback; users can pause, resume, stop, select Auto/English UK/English US/Vietnamese, and choose playback speed. Text is bounded to 30,000 characters and split into sequential utterances; URLs and credential-like values are filtered before playback. WMR invokes only the browser/system speech synthesis API; it does not directly call a speech service or record microphone input. A particular OS/browser voice may itself rely on an online service, so offline playback cannot be guaranteed across devices and users should check the selected platform voice's privacy settings. On unsupported platforms the UI explains the limitation instead of claiming playback started.

The following are checked in CI via unit and local integration tests:
- Tool allowlist rejects undeclared capabilities; exact-quote annotation and custom-task creation are validated and bounded.
- Proactive review is opt-in, requires the explicit provider-permission setting, triggers only after an idle interval and sufficient changed text, and has a cooldown plus existing provider budget/call caps.
- Speech reminders use browser/system speech synthesis and do not request or record microphone input; selected platform voices may still rely on an online service.
- Custom-task and scratchpad backup fields are length/type/identifier validated; API keys and provider settings remain excluded from import.
- Task generation sends a dedicated prompt with an empty essay context; generated prompts remain marked unverified.
- Edit anchors must be exact and unique; overlapping patches are rejected.
- Live draft is unchanged while proposals are generated.
- Tool and model-turn budgets are enforced.
- Provider opt-out rejects agent calls.
- A configured local-compatible provider produces the expected SSE progress/tool/result event chain.
- UI controls exist for cancellation, approval, revision restoration and artifact library.
- Backup validation constrains artifact kinds, task IDs, practice-feedback provenance, lengths and record/revision counts; unsupported IDs and malformed attempts are dropped.
- Existing provider, cost-ledger, loopback and dependency-audit checks still run.

Manual production validation is still needed for real provider cancellation semantics, accessibility with keyboard/screen readers, physical Windows/Linux/Android builds and pedagogical quality. The agent's structured actions are not proof that its advice is correct; score quality still requires a permissioned, independently rated writing corpus.
