# NUI UI contract

## Task profile

- **Intent:** a local-first IELTS Writing workspace for guided practice and targeted revision.
- **Surfaces:** Windows/Linux desktop, Android touch UI and a local web preview.
- **AI role:** assistive and bounded; no arbitrary tool execution.
- **Risk:** privacy-sensitive learner writing and optionally billable API access.
- **Temporal behavior:** offline-first; explicit asynchronous AI assessment; interruptible, locally autosaved drafts.
- **Primary job:** choose a task, write a draft, inspect reliable feedback, revise and practise a specific skill.

## Invariants

- The essay editor stays primary during writing.
- Task selectors expose task identity plus focus, difficulty and suggested time.
- Submission shows local preflight; AI runs only after explicit opt-in.
- Reports preserve exact evidence quotes and discard quotations absent from the source essay.
- Offline mode never claims a model produced a band.
- External transmission is opt-in, visible and off by default.
- Backup restore does not override existing provider credentials or permissions.
- Critical status and errors remain visible on mobile and desktop.
- Provider output is rendered as text, not injected as HTML.
- Reduced motion, visible focus, keyboard access, responsive reading order and touch-safe controls are preserved.

## Evidence required for release claims

CI verifies tests, clean lockfile installs, dependency advisories and a production web bundle. Release Actions separately verify Windows, Linux and Android package creation. Manual screenshot review, screen-reader behavior, provider billing/interoperability, real-device installation and release signing remain unverified until directly tested.
