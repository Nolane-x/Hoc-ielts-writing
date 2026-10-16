# WMR IELTS Supercharged 2.0 (Full-Cycle Academy) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Full-Cycle IELTS Academy 2.0 suite inside WMR Writing Mentor, adding Pre-Writing Idea Lab, Computer-Delivered IELTS Exam Simulator, Diagnostic Criteria Filter & 3-Tier Sentence Surgery, Parallel Band 8.5+ Model Essay Comparison, Interactive Socratic Gym (Collocation Matcher & Cohesion Puzzle), Native SVG Mastery Radar Chart, and Academic Print/PDF Dossier.

**Architecture:** Extract pedagogical data enrichment, pure-SVG radar chart math, interactive drill engines, and sentence surgery builders into a focused module `web/academy-studio.mjs`. Wire semantic HTML regions in `web/index.html`, style them in `web/styles.css` (including `.idp-bc-mode` and `@media print`), and connect event handlers in `web/app.mjs`.

**Tech Stack:** Vanilla ES Modules (`.mjs`), Semantic HTML5, CSS Custom Properties, Pure Mathematical SVG (zero external dependencies, 100% offline & CSP-compliant), Node.js built-in test runner (`node --test`).

## Global Constraints

- Node.js `>=22.0.0`, zero new npm runtime dependencies.
- 100% offline-first: no remote `<script>` or `<link>` URLs in `web/index.html` or `dist/index.html`.
- Preserve all 143 existing unit, integration, and UI contract tests while adding new unit and UI contract tests for WMR 2.0.

---

### Task 1: Create `web/academy-studio.mjs` & Unit Tests (`tests/academy-studio.test.mjs`)

**Files:**
- Create: `web/academy-studio.mjs`
- Create: `tests/academy-studio.test.mjs`

**Interfaces:**
- Consumes: `TASKS` from `web/tasks.mjs`
- Produces:
  - `getTaskAcademyData(task)` -> `{ topic, instruction, traps, collocations, modelEssay, collocationDrill, cohesionPuzzle }`
  - `formatOutlineForEditor(outline, existingDraft)` -> `string`
  - `buildSentenceSurgery(issue, taskType)` -> `{ diagnosis, band75, band85 }`
  - `renderMasteryRadarSvg(criterionScores)` -> `string` (valid `<svg>` markup)
  - `evaluateCollocationChoice(drill, choiceIndex)` -> `{ correct, explanation, phrase }`
  - `evaluateCohesionOrder(puzzle, orderedIds)` -> `{ correct, score, total, explanation }`

- [ ] **Step 1: Write unit tests in `tests/academy-studio.test.mjs`**
- [ ] **Step 2: Implement `web/academy-studio.mjs` and verify tests pass**

---

### Task 2: Upgrade `web/index.html` with Full-Cycle IELTS Academy 2.0 Regions

**Files:**
- Modify: `web/index.html`
- Test: `tests/ui-contract.test.mjs`

**Interfaces:**
- Adds:
  - Topbar `#exam-mode-toggle` (`Phòng thi IDP/BC`)
  - Workspace `#idea-lab` (`#toggle-idea-lab`, `#idea-lab-body`, `#task-deconstruct-view`, `#topic-lexical-bank`, `#outline-intro`, `#outline-body1`, `#outline-body2`, `#outline-conclusion`, `#insert-outline`)
  - Prompt Highlight toolbar (`#highlight-prompt-selection`, `#clear-prompt-highlights`, `#exam-notes-input`)
  - Co-Pilot Tab `gym` (`[data-copilot-tab="gym"]`, `#socratic-gym-panel`, `#gym-collocation-drill`, `#gym-cohesion-puzzle`)
  - Learning page `#mastery-radar-panel` (`#mastery-radar-chart`)
  - Report page `#print-report` button

- [ ] **Step 1: Update `web/index.html` with all new semantic elements and ARIA attributes**

---

### Task 3: Upgrade `web/styles.css` with Computer-Delivered IELTS Mode, Idea Lab, Socratic Gym, Radar & Print Dossier

**Files:**
- Modify: `web/styles.css`
- Test: `tests/ui-contract.test.mjs`

- [ ] **Step 1: Add `.idp-bc-mode`, `.timer-warning`, `.timer-critical`, `.idea-lab-panel`, `.socratic-gym-panel`, `.sentence-surgery-card`, `.parallel-model-grid`, `.radar-chart-shell`, and `@media print` academic dossier styles to `web/styles.css`**

---

### Task 4: Wire Full-Cycle Academy 2.0 State & Events in `web/app.mjs`

**Files:**
- Modify: `web/app.mjs`
- Modify: `tests/ui-contract.test.mjs`
- Modify: `package.json` (add `node --check web/academy-studio.mjs` to `check` script)

- [ ] **Step 1: Import `web/academy-studio.mjs` in `web/app.mjs` and wire Idea Lab, IDP/BC Exam Mode, Multi-tier Timer Alerts, Prompt Highlighting, Socratic Gym, Criteria Filter Chips, 3-Tier Sentence Surgery, Parallel Model Essay Comparison, SVG Radar Chart, and Print Dossier**
- [ ] **Step 2: Expand `tests/ui-contract.test.mjs` to verify all WMR 2.0 contracts**
- [ ] **Step 3: Run `npm run check`, commit, push to `origin main`, and verify GitHub CI + Release**
