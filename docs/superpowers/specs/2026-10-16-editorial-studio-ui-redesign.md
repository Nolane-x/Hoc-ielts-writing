# WMR Writing Mentor — Editorial Studio UI/UX Overhaul Specification

**Document Date:** 2026-10-16  
**Status:** Approved by User  
**Target Architecture:** WMR Writing Mentor (Local-First IELTS Writing Studio for Web, Electron Desktop, Capacitor Android)  
**Methodology:** Nolane UI Intelligence (NUI) & Superpowers Brainstorming Framework  

---

## 1. Executive Summary & Objective

The objective of this specification is a complete, uncompromising visual and experiential (UI/UX) redesign of **WMR Writing Mentor** (`Hoc-ielts-writing`). The current interface suffers from visual clutter, cramped proportions ("border-soup"), uninspiring typography, and disjointed tool placement (notably the Writing Agent being pushed far down the page).

This redesign replaces the entire UI/UX with an **"Editorial Studio"** aesthetic:
- A serene, distraction-free writing sanctuary modeled on prestigious academic publications and modern editorial suites (e.g., Apple Notes/Craft/Linear).
- An integrated, cybernetic **AI Co-pilot Dock** where real-time streaming traces, staged diff patch cards, revision rollbacks, and micro-practice journals operate alongside the draft without disorienting page scrolling.
- Deep, interactive diagnostic dossiers for IELTS assessment, featuring bidirectional synchronized annotations, score comparison against previous drafts, and adaptive study plans.
- Strict adherence to local-first privacy, zero external asset dependencies (no remote CDNs/webfonts), and 100% pass rate across the existing 142 automated test suite.
- Automated multi-platform GitHub CI & Release pipeline generating Windows (`.exe`), Linux (`.AppImage`, `.deb`), and Android (`.apk`, `.aab`) releases.

---

## 2. NUI Task Profile & System Invariants

```yaml
nui_profile:
  task_id: wmr-editorial-studio-redesign-v2
  visual_ambition: flagship / exceptional
  aesthetic_direction: Editorial Studio (Academic Slate & Royal Indigo)
  target_platforms:
    - Web (Vite bundle, offline single-page architecture)
    - Desktop (Electron 44: Windows NSIS & Portable, Linux AppImage & Debian)
    - Mobile (Capacitor 8: Android APK & AAB)
  invariants:
    - Strict local-first: zero external HTTP/HTTPS assets loaded in HTML/CSS
    - Semantic element contracts preserved for 142 test assertions (tests/ui-contract.test.mjs)
    - Full accessibility compliance (prefers-reduced-motion, forced-colors, WCAG AAA contrast)
    - Monotonic state progression: no irreversible AI overwrite without user consent
```

---

## 3. Design System & Visual Foundation

### 3.1 Typography Hierarchy
* **UI Controls & Navigation**:
  * Font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, "SF Pro Text", sans-serif`.
  * Hierarchy:
    * Page Hero H1: `clamp(28px, 3.2vw, 40px)`, letter-spacing `-0.04em`, font-weight `750`.
    * Section H2: `18px`, letter-spacing `-0.03em`, font-weight `700`.
    * Card Subhead H3: `14px`, font-weight `650`.
    * Body text: `14px`, line-height `1.6`, color `var(--ink)`.
    * Captions & Meta: `11px - 12px`, color `var(--muted)`.
* **The Scholar's Canvas (Writing Editor)**:
  * Font stack: `Charter, "Sitka Text", "Cambria", Georgia, "Times New Roman", serif`.
  * Metrics: `font-size: 16px`, `line-height: 1.85`, `letter-spacing: 0.005em`.
  * Optimal line length: centered editorial container maintaining 68–78 characters per line.
* **Metrics & Code**:
  * Monospace / Tabular numerals: `font-variant-numeric: tabular-nums` for timers, word counts, band scores, and diff blocks.
  * Code stack: `ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace`.

### 3.2 Palette & Color Tokens

#### Light Mode (`:root`)
* `--bg`: `#f8fafc` (Slate 50 — soft, non-glare academic paper base)
* `--surface`: `#ffffff` (Pure white card surface)
* `--surface-soft`: `#f1f5f9` (Slate 100 — subtle elevation)
* `--ink`: `#0f172a` (Slate 900 — deep contrast for effortless reading)
* `--muted`: `#64748b` (Slate 500 — clear subordinate text)
* `--line`: `#e2e8f0` (Slate 200 — hairline borders)
* `--line-strong`: `#cbd5e1` (Slate 300)
* `--accent`: `#4f46e5` (Indigo 600 — academic prestige)
* `--accent-soft`: `#eef2ff` (Indigo 50)
* `--accent-dark`: `#4338ca` (Indigo 700)
* `--green`: `#059669` (Emerald 600)
* `--green-soft`: `#ecfdf5`
* `--amber`: `#d97706` (Amber 600)
* `--amber-soft`: `#fffbeb`
* `--red`: `#e11d48` (Rose 600)
* `--red-soft`: `#fff1f2`
* `--shadow-sm`: `0 1px 2px rgba(15, 23, 42, 0.05)`
* `--shadow-md`: `0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)`
* `--shadow-lg`: `0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)`
* `--radius-sm`: `8px`
* `--radius-md`: `12px`
* `--radius-lg`: `18px`

#### Dark Mode (`:root[data-theme="dark"]`)
* `--bg`: `#0b0f19` (Obsidian Slate — midnight sanctuary, eliminates night strain)
* `--surface`: `#131b2e` (Elevated midnight slate)
* `--surface-soft`: `#1a243c` (Luminescent card background)
* `--ink`: `#f8fafc` (Slate 50)
* `--muted`: `#94a3b8` (Slate 400)
* `--line`: `#222f4c` (Subtle boundary line)
* `--line-strong`: `#334166`
* `--accent`: `#818cf8` (Indigo 400)
* `--accent-soft`: `#1e2246`
* `--accent-dark`: `#a5b4fc`
* `--green`: `#34d399` (Emerald 400)
* `--green-soft`: `#064e3b`
* `--amber`: `#fbbf24` (Amber 400)
* `--amber-soft`: `#451a03`
* `--red`: `#fb7185` (Rose 400)
* `--red-soft`: `#4c0519`
* `--shadow-md`: `0 4px 20px rgba(0, 0, 0, 0.35)`
* `--shadow-lg`: `0 14px 40px rgba(0, 0, 0, 0.5)`

### 3.3 Micro-interactions & Tactile States
* Smooth 150ms transitions on interactive buttons, inputs, pills, and navigation tabs.
* Caret glow and subtle focus ring: `box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25)`.
* Full support for `@media (prefers-reduced-motion: reduce)` and `@media (forced-colors: active)`.

---

## 4. Architectural View Redesign

### 4.1 Navigation & Global Shell
* **Sidebar (`.sidebar`)**:
  * Refined brand mark with gradient academic seal and version badge.
  * Nav items with smooth active pills, subtle icons, and keyboard shortcuts (`1`, `2`, `3`).
  * Bottom dock with Local-First status shield and theme switcher.
  * Mobile drawer behavior with smooth slide-in/out and backdrop dismissal.
* **Top Bar (`.topbar`)**:
  * Glassmorphism header (`backdrop-filter: blur(16px)`).
  * Breadcrumb with active page title.
  * Real-time network & security indicator (`Offline ready` / `Provider active`).

### 4.2 Workspace Studio (`#page-workspace`)
* **Prompt Card (`.prompt-card`)**:
  * Badges for task type, difficulty, estimated time, and skill focus.
  * Collapsible prompt body with copy button.
* **Dynamic Word Gauge & Writing Canvas**:
  * Live word counter with animated progress ring/bar indicating target threshold (150 words for Task 1, 250 words for Task 2).
  * Tactile editor with generous padding, auto-save feedback indicator, and keyboard shortcut reminders.
  * Action bar: Primary "Nộp bài & chấm sâu" (gradient button with arrow icon) and Secondary "Kiểm tra cục bộ".
* **Integrated Co-Pilot Dock (`.coach-column` & `#agent-workspace`)**:
  * Seamlessly positioned beside or immediately accessible to the writing canvas without vertical displacement.
  * **Mentor Section**: 4 quick-analysis cards with multi-colored icons (Phân tích đề, Khung dàn ý, Kiểm tra lập luận, Luyện một lỗi), interactive Q&A input and answers.
  * **Writing Agent Section**:
    * Session goal input with clear capability disclosure.
    * Live Cybernetic Pulse indicator with radar scan animations during live runs.
    * Real-time activity timeline (`.agent-activity-item`) showing chronological steps with badge states.
    * Interactive Staged Patch Cards (`.agent-patch-card`) with before/after diff views, one-click "Áp dụng sửa đổi", and batch "Áp dụng toàn bộ".
    * Revision Safety Net (`#agent-revisions`) displaying up to 5 rollback snapshots with one-click restore.
    * Local Artifact Library and Practice Journal with attempt history.

### 4.3 Learning Intelligence Hub (`#page-learn`)
* **Key Metrics Summary**: 3 prominent cards tracking evaluated essays, lowest criterion focus, and recurring error resolution rate.
* **Adaptive Study Plan (`#study-plan`)**: 3 sequenced milestone steps with target criteria, learning goals, and one-click "Luyện ngay đề này" action linking to the workspace.
* **Recurring Error Engine (`#recurring-errors`)**: Multi-essay error clusters classified by severity (Critical, High, Medium, Low) with verbatim excerpts and action plans.
* **IELTS Rubric Guide (`#rubric-guide`)**: Cambridge band 5.0–9.0 descriptor guide with Task 1/Task 2 filters, teaching signals, risks, and practice moves.
* **History List (`#history-list`)**: Clean chronological log of previous submissions with band scores and JSON export.

### 4.4 Diagnostic Assessment Dossier (`#page-report`)
* **Executive Band Scoreboard**: Hero card featuring large estimated overall band score, evaluation source badge, and executive summary.
* **Four IELTS Criteria Cards**: Structured breakdown of TR/TA, CC, LR, and GRA with individual sub-scores, detailed rationales, and verbatim quotes.
* **Interactive Annotated Essay Reader**:
  * Verbatim essay text with inline severity-coded error highlights (Critical, High, Medium, Low).
  * Bidirectional sync: clicking any highlighted text scrolls smoothly to the matching issue card and illuminates it with a glowing border.
  * "✓ Đã xử lý · Hoàn tác" toggle buttons allowing learners to track resolved items locally.
* **Revision Delta Comparison**: Side-by-side metric comparison against previous drafts of the same task showing criterion score changes, word count variance, and model variance caveats.

### 4.5 Control Center (`#page-settings`)
* Sticky anchor navigation across connection, privacy, budget, appearance, and data sections.
* Tactile "Cho phép gửi nội dung tới provider" toggle with offline privacy explanation.
* Comprehensive cost guardrails including dedicated multi-turn Agent session budget (`#max-agent-session-budget`).
* Theme picker cards with live mini-previews (Light, Dark, System).
* Local Data Vault with JSON import, export, and secure data wipe actions.

---

## 5. Technical Implementation & Contract Integrity

### 5.1 Preservation of Tested Element IDs
All element IDs and attributes verified by `tests/ui-contract.test.mjs` must remain strictly present and functional:
- Navigation: `data-page="workspace"`, `data-page="learn"`, `data-page="report"`, `data-page="settings"`, `#page-workspace`, `#page-learn`, `#page-report`, `#page-settings`.
- Editor: `#task-select`, `#task-prompt`, `#task-goal`, `#task-meta`, `#essay-editor` (with `aria-describedby`), `#word-count`, `#submit-review`, `#local-check`.
- Mentor: `#coach-input`, `#coach-answer`, `#clear-coach-history`, `#coach-status` (`aria-live="polite"`).
- Agent: `#agent-workspace`, `#agent-task-input`, `#run-writing-agent`, `#cancel-writing-agent`, `#agent-live-status`, `#agent-activity`, `#agent-result`, `#agent-saved-artifacts`, `#agent-revisions`, `#agent-revision-list`.
- Learning & Report: `#study-plan`, `#rubric-guide`, `#agent-practice-overview`, `#agent-practice-journal`, `#recurring-errors`, `#learn-metrics`, `#report-content`.
- Settings: `#settings-form`, `#external-allowed`, `#provider-key`, `#settings-status` (`aria-live="polite"`), `#max-agent-session-budget` (`name="maxAgentSessionUsd"`), contains text `TỐI ĐA CẢ PHIÊN AGENT`.
- Data: `#import-backup`, `#import-file` (`accept=".json,application/json"`), `#clear-local-data`, `#toast`.
- CSS classes & queries: `.agent-activity-item`, `.agent-patch-card`, `prefers-reduced-motion`, `forced-colors`, `@media (max-width: 650px)`, `:focus-visible`.

### 5.2 Verification Checklist
1. `npm test`: all 142 tests must pass without regressions.
2. `npm run check`: node syntax checks and tests must pass.
3. `npm run build:web`: Vite build succeeds with zero errors.
4. Offline asset verification: `! grep -Eo '<script[^>]+src="https?://|<link[^>]+href="https?://' dist/index.html`.

---

## 6. Release & Deployment Pipeline

Upon verification of the new UI:
1. Stage all changed files and create a structured Git commit on `main`.
2. Push to `origin main` on GitHub repository `Nolane-x/Hoc-ielts-writing`.
3. GitHub Actions CI (`.github/workflows/ci.yml`) will verify tests across Node 22 and 24.
4. GitHub Actions Release (`.github/workflows/release.yml`) will build Windows, Linux, and Android binaries and publish a new GitHub Release with attached download assets.
