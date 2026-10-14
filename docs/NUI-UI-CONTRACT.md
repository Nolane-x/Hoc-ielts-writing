# NUI UI contract

## Task profile

- **Intent:** extend and verify a local-first IELTS learning workspace.
- **Surfaces:** Windows/Linux desktop, Android touch UI, local web preview.
- **AI role:** assistive and bounded; no arbitrary tool execution.
- **Risk:** privacy-sensitive learner writing and optionally billable API access.
- **Temporal behavior:** offline-first; explicit asynchronous AI assessment; interruption-safe draft autosave.
- **Primary job:** write an IELTS draft, submit once, inspect detailed feedback, revise, and practise a targeted skill.

## Invariants

- The essay editor stays primary during writing.
- Submission immediately displays local preflight; AI runs only after explicit opt-in.
- Reports preserve exact evidence and link it to the user's text.
- Offline mode never claims a model produced a band.
- External transmission is opt-in, visible, and off by default.
- Critical status and errors remain visible on mobile and desktop.
- Provider output is rendered as text, not injected as raw HTML.
- Reduced motion, visible focus, keyboard access, responsive reading order and touch-safe controls are preserved.

## Evidence required for release claims

CI verifies source tests and a production web bundle. Platform builds must succeed in Actions. Browser screenshots, screen-reader behavior, real provider calls, Android installation, release signing and learning outcome claims remain unverified until directly tested.
