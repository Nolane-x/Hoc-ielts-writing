# Editorial Studio UI/UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the entire WMR Writing Mentor UI/UX with a flagship "Editorial Studio" design featuring an integrated Co-pilot dock, cybernetic AI Agent live operations, interactive word-target gauges, exam timer, and diagnostic assessment dossiers while preserving 100% of existing 142 automated tests and releasing via GitHub CI/Actions.

**Architecture:** Modern modular semantic HTML shell (`web/index.html`), comprehensive multi-layered CSS design system with Editorial Slate/Indigo tokens and dark/light modes (`web/styles.css`), and enhanced interactive UI bindings in `web/app.mjs` (live word gauge progress, exam countdown timer, studio zen mode, Co-pilot tab switcher, agent radar states, and null-safe event registration).

**Tech Stack:** Vanilla ES2022 Modules, Vite 8, CSS Custom Properties & Container/Media Queries, Node.js Test Runner (`node:test`), Electron 44, Capacitor 8.

## Global Constraints

- Zero external HTTP/HTTPS scripts, stylesheets, or font links (`dist/index.html` must pass offline asset checks).
- Preserve all required DOM IDs, `data-*` attributes, `aria-*` attributes, and exact Vietnamese copy matched by `tests/ui-contract.test.mjs`.
- Support `@media (prefers-reduced-motion: reduce)`, `@media (forced-colors: active)`, `@media (max-width: 650px)`, and `:focus-visible`.
- All 142+ tests in `npm run check` and `npm test` must pass.

---

### Task 1: Rebuild `web/index.html` with Editorial Studio & Integrated Co-Pilot Architecture

**Files:**
- Modify: `web/index.html`
- Test: `tests/ui-contract.test.mjs`

**Interfaces:**
- Produces: Semantic DOM structure containing the Integrated Dual-Studio layout, Co-Pilot Dock tabs (`data-copilot-tab="agent"` and `data-copilot-tab="mentor"`), Exam Timer controls (`#timer-toggle`, `#timer-reset`, `#timer-display`), Zen Focus toggle (`#zen-toggle`), Word Progress bar (`#word-progress-fill`), and all existing required IDs.

- [x] **Step 1: Update `web/index.html` with the complete Editorial Studio semantic markup**
- [x] **Step 2: Run `node --test tests/ui-contract.test.mjs` to verify all HTML contract assertions pass**

---

### Task 2: Craft Flagship Design System & Cybernetic Agent Styles in `web/styles.css`

**Files:**
- Modify: `web/styles.css`
- Test: `tests/ui-contract.test.mjs`

**Interfaces:**
- Consumes: Classes and IDs defined in `web/index.html` and dynamic templates in `web/app.mjs`.
- Produces: Complete styling system including Light/Dark mode tokens, Editorial typography, Glassmorphic Topbar, Scholar's Writing Canvas, Cybernetic Agent Radar & Timeline animations, GitHub-PR style Patch Diff Cards, Interactive Annotated Essay Reader, and responsive breakpoints (`@media (max-width: 650px)`).

- [x] **Step 1: Write the complete `web/styles.css` stylesheet**
- [x] **Step 2: Run `node --test tests/ui-contract.test.mjs` to verify CSS contract assertions pass**

---

### Task 3: Enhance Interactive UX & Co-Pilot Experience in `web/app.mjs`

**Files:**
- Modify: `web/app.mjs`
- Modify: `tests/ui-contract.test.mjs`

**Interfaces:**
- Consumes: DOM elements from `web/index.html`.
- Produces:
  - Dynamic word target progress bar (`updateWordTarget`) and paragraph counter (`#paragraph-count`).
  - Built-in IELTS Exam Timer (40m / 20m task-aware countdown with start/pause/reset).
  - Distraction-free Zen Focus mode toggle (`#zen-toggle`).
  - Co-pilot tab switching (`data-copilot-tab`) and automatic tab activation when Agent or Mentor runs.
  - Visual busy state class `.is-running` on `#agent-workspace` and `#agent-live-status` for live radar animations.
  - Quick-preset mission chips (`[data-agent-preset]`) for one-click Agent workflows.
  - Null-safe `#export-current-report` event listener fixing startup initialization.

- [x] **Step 1: Add unit test in `tests/ui-contract.test.mjs` verifying Editorial Studio UX enhancements**
- [x] **Step 2: Implement UX enhancements in `web/app.mjs`**
- [x] **Step 3: Run `npm run check` and `npm run build:web` to verify all tests and build pass**

---

### Task 4: Commit, Push to GitHub & Trigger Full CI + Multi-Platform Release

**Files:**
- Modify: `package.json` (bump version or keep clean for release workflow)
- Modify: `CHANGELOG.md`

- [x] **Step 1: Verify `npm run check` and `npm run build:web` and offline asset rules**
- [x] **Step 2: Stage, commit, and push to `origin/main` on GitHub**
- [x] **Step 3: Monitor GitHub Actions `CI` and `Build and Release` workflows using `gh run list` / `gh run view`**
