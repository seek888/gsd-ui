# Features Research

**Domain:** Developer workflow visualization / GSD CLI desktop wrapper
**Project:** GSD UI -- Tauri + React desktop client
**Researched:** 2026-04-13
**Confidence:** MEDIUM-HIGH (patterns from Linear, GitHub Projects/Actions, VS Code, Claude Code)

---

## Table Stakes

Features users will expect. Missing these makes the product feel broken or incomplete.

### 1. Command Execution Panel (Button List)

Users need to trigger GSD commands with confidence. This is the primary interaction surface.

**What users expect:**
- Clear list of available commands (plan-phase, execute-phase, verify-work, etc.)
- Visual state for each command: idle, running, success, failure
- Ability to cancel a running command
- Clear indication of what each command does (tooltip or description on hover)
- Keyboard shortcuts for common commands (shown in UI)

**Complexity:** Low-Medium
- Tauri spawns child processes and streams output
- State management for running/idle states
- Cancellation via process group kill

**Reference:** Linear's command palette (`Cmd+K`) and action buttons. GitHub Actions' "Run workflow" button with clear status.

### 2. Real-time Output Streaming

The terminal output panel is where users spend the most time during execution.

**What users expect:**
- Output appears as it is produced (no buffering delay beyond 50-100ms batches)
- ANSI color codes rendered correctly (red for errors, green for success, yellow for warnings)
- Clear visual distinction between stdout and stderr (or unified with color coding)
- Auto-scroll to bottom during streaming, with pause-on-scroll detection
- Ability to scroll back through full output history
- Option to copy output text
- Option to clear output

**Complexity:** Medium-High
- Requires a terminal emulator component (xterm.js, react-terminal, or similar)
- Process stdout/stderr streaming over Tauri IPC
- Performance at high output volume (thousands of lines)
- ANSI escape sequence parsing

**Reference:** VS Code integrated terminal, GitHub Actions live logs, Claude Code streaming output. Key pattern: batch IPC messages (~100ms windows) to avoid renderer flooding (Hyper terminal blog).

### 3. Phase/Progress View

Users need to understand where they are in the project journey.

**What users expect:**
- List of all phases with completion status
- Current phase clearly highlighted/emphasized
- For each phase: number of plans, completed plans, completion percentage
- Visual progress indicator (progress bar or checkmarks)
- Click to expand a phase and see its plans

**Complexity:** Low-Medium
- Parse ROADMAP.md and STATE.md via gsd-tools JSON output
- Render as structured component
- File watcher for auto-refresh

**Reference:** Linear's Cycles view, GitHub Projects' progress indicators. GitHub Actions progress table: `| Phase | Plans Complete | Status | Completed |`.

### 4. Project/Planning File Browser

Users need to browse and read the documentation that drives their work.

**What users expect:**
- File tree showing `.planning/` directory structure
- Icons differentiating file types (Markdown, JSON, directory)
- Click to preview file content (at minimum, Markdown rendering)
- Collapsible directory tree
- Current file/directory highlighted

**Complexity:** Low
- Tauri fs API to read directory listing
- Recursive tree rendering with expand/collapse
- File preview panel

**Reference:** VS Code Explorer sidebar, GitHub file browser.

### 5. Markdown File Viewer/Editor

Users need to read and sometimes edit planning documents.

**What users expect:**
- Rendered Markdown with proper heading hierarchy, code blocks, tables, links
- Code block syntax highlighting (at minimum for common languages)
- Frontmatter visibility (YAML frontmatter should be readable, not hidden)
- Edit mode with save capability (Monaco Editor as planned)
- Unsaved changes indicator

**Complexity:** Medium
- Monaco Editor integration (already planned)
- Markdown rendering via react-markdown or similar
- Read vs edit mode toggle
- File write via Tauri fs API

**Reference:** VS Code Markdown preview, GitHub file viewer.

### 6. CLI Detection and Setup Prompt

Since this is a CLI wrapper, the app is useless without `claude` CLI installed.

**What users expect:**
- On first launch, detect whether `claude` CLI is installed
- Clear instructions if not installed (install command)
- Verification that the CLI works before showing the main UI
- Helpful error if the CLI is missing when a command is triggered

**Complexity:** Low
- Tauri shell command to check `claude --version`
- Conditional rendering of setup vs main UI

### 7. Project Path Selection

Users need to point the app at their GSD project.

**What users expect:**
- On first launch or via settings, select a project directory
- Path displayed in UI header/sidebar
- Change project path easily
- Remember last opened project

**Complexity:** Low
- Tauri dialog API for directory picker
- Store path in local storage / Tauri store

---

## Differentiators

Features that make this tool feel professional and uniquely suited to GSD workflows. These are not expected but are highly valued.

### 8. Phase Dependency Visualization

GSD phases have explicit dependencies. Showing this visually helps users understand the journey.

**What makes it valuable:**
- Shows which phases must complete before others can start
- Visual arrows/lines connecting dependent phases
- Locked phases clearly show what they are waiting for
- Can be simple (list with "Depends on: Phase X" badges) rather than a full graph

**Complexity:** Medium
- Parse depends_on from ROADMAP.md phase details
- Render as styled dependency list or simple graph

**Reference:** Linear's initiative dependencies, Jira's dependency links.

### 9. Session Continuity / Resume Context

GSD stores session state in STATE.md. Showing this context helps users resume quickly.

**What makes it valuable:**
- "Last session: [timestamp], Stopped at: [description]"
- Current position in workflow clearly visible
- One-click resume indicators
- Blocker/concern visibility (STATE.md blockers section)

**Complexity:** Low
- Parse STATE.md frontmatter via gsd-tools
- Render as prominent "Resume Context" panel section

### 10. Plan-to-Summary Progress Tracking

Drill into a phase and see plan vs summary completion.

**What makes it valuable:**
- Phase detail view shows all plans with status (PLAN.md exists? SUMMARY.md exists?)
- Visual diff: what is pending vs complete
- Key files modified shown per plan (from frontmatter)
- Requirements coverage (which requirements are addressed by which plans)

**Complexity:** Medium
- Parse phase directory structure and frontmatter
- Show file existence status
- Highlight incomplete plans

**Reference:** Linear's issue-to-sub-issue hierarchy, GitHub Actions' step-level logging.

### 11. Performance Metrics Display

STATE.md stores execution metrics. Surface this for velocity insights.

**What makes it valuable:**
- Time per plan, time per phase
- Files modified per plan
- Velocity trends across phases
- Comparison to average

**Complexity:** Low
- Parse STATE.md performance metrics section
- Render as compact stats cards

**Reference:** Linear's Insights/Dashboards, GitHub Actions duration charts.

### 12. Inline Requirement References

ROADMAP.md and PLAN.md reference requirements (AUTH-01, PLANT-02, etc.).

**What makes it valuable:**
- Clickable requirement IDs that show requirement text
- Requirement coverage map (which phases/plans address which requirements)
- Uncovered requirements highlighted

**Complexity:** Medium
- Parse REQUIREMENTS.md for ID-to-text mapping
- Cross-reference with ROADMAP.md and PLAN.md frontmatter
- Show in plan detail and phase overview

### 13. Git Integration Indicators

GSD phases produce commits. Show git status in context.

**What makes it valuable:**
- Last commit per phase/plan
- Branch status
- Commit hash links (if project has remote)
- Uncommitted changes warning

**Complexity:** Medium
- Git CLI via Tauri shell
- Parse commit info from phase directories

---

## Anti-Features

Things to deliberately NOT build in v1. They drain resources, add complexity, and can undermine the core value.

### 1. Multi-project management
Users should focus on one project at a time. Multi-project adds tab management, project switching, cross-project views that dilute focus. Defer to v2.

### 2. Token/cost tracking
Claude Code does not expose a local token usage API. Parsing logs is unreliable and brittle. Users can check Anthropic console separately. Defer indefinitely.

### 3. Team/multiplayer features
GSD is a personal workflow tool. Collaboration features add auth, permissions, real-time sync, and conflict resolution. Out of scope per PROJECT.md.

### 4. Automatic GSD phase advancement
Do not auto-advance phases or auto-update STATE.md based on file changes. The user controls workflow progression. Automation here is presumptuous and can break state.

### 5. Built-in terminal beyond output streaming
Do not try to build a full-featured terminal emulator. The app streams command output, not an interactive shell. Interactive commands should run in the user's terminal. Only stream output from GSD CLI commands.

### 6. Web/deployment versions
Desktop-only per PROJECT.md constraints. Cross-platform support (macOS + Windows) is already on the plate. Adding web builds multiplies testing surface.

### 7. Custom workflow definitions
Do not let users define custom GSD commands or workflows within the app. The app wraps the existing GSD CLI. Adding workflow builder complexity defeats the purpose.

---

## UX Patterns to Follow

Specific patterns from reference tools, mapped to GSD UI decisions.

### Pattern 1: Linear-style Sidebar Navigation

**What it is:** Fixed left sidebar with icon + label navigation, collapsible, workspace-level sections.
**How to apply:** Left sidebar with sections:
- Dashboard (home)
- Roadmap (ROADMAP.md overview)
- Phase [current] (deep-dive on active phase)
- Documents (browse .planning/ files)
- Output (terminal view, when a command is running)
- Settings

**Why:** Linear's sidebar is proven for developer tools. It provides always-accessible navigation without stealing content area.

### Pattern 2: GitHub Actions Live Log Output

**What it is:** Streaming output with color coding, timestamps, step grouping, collapsible sections.
**How to apply:**
- Group output by command phase (plan-phase, execute-phase, verify-work)
- Show timestamp at start of each output chunk
- Use green for success indicators, red for errors, yellow for warnings
- Support line-specific copy (click to copy a specific line)
- Show command exit code on completion

**Why:** GitHub Actions is the standard for "real-time CLI output in a browser-like environment". Its patterns are familiar to developers.

### Pattern 3: VS Code Terminal Auto-scroll Pause

**What it is:** Output auto-scrolls to bottom during streaming. If the user scrolls up, auto-scroll pauses. A "scroll to bottom" button appears.
**How to apply:**
- Default: auto-scroll on
- On user scroll-up: pause auto-scroll, show floating "Jump to bottom" button
- On new output after pause: offer to resume auto-scroll or stay paused

**Why:** This is the standard behavior in VS Code, Xcode, and all major terminal emulators. Users expect it. Implementing it prevents the "output scrolls away while I'm reading" frustration.

### Pattern 4: VS Code Explorer File Tree

**What it is:** Collapsible tree with file type icons, indentation guides, active file highlighting, inline status badges (git modified, etc.).
**How to apply:**
- Show `.planning/` tree with folders (phases/, milestones/, etc.)
- Markdown files get a document icon
- Directories show chevron for expand/collapse
- Currently selected file highlighted with background color
- Optionally show git status badges (modified, new)

**Why:** VS Code's explorer is the de facto standard for developer file trees. Developers will intuitively know how to use it.

### Pattern 5: GitHub Projects Kanban vs List Toggle

**What it is:** Multiple views (list, board, timeline) for the same underlying data. Users choose their preferred lens.
**How to apply:**
- Roadmap view: toggle between list view (default) and a simple timeline bar
- List view shows: phase number, name, plans completed, status badge
- Timeline bar shows phases as horizontal bars on a time axis (stretch goal)
- Persist user's view preference

**Why:** Different users prefer different views. Offering a toggle costs little but serves both preferences.

### Pattern 6: Command Button State Machine

**What it is:** Each command button has explicit states: idle, running (with spinner/progress), success (green check, fades), error (red X, stays until dismissed or re-run).
**How to apply:**
```
[Plan Phase] --click--> [Plan Phase (running...)] --success--> [Plan Phase (done)] --reset--> [Plan Phase]
                                     \--error--> [Plan Phase (failed)] --click--> [Plan Phase (running...)]
```
- Show spinner or pulsing indicator while running
- Show exit code and summary on completion
- Show "View output" link on completion
- Color coding: neutral=idle, blue=running, green=success, red=error

**Why:** Linear's issue state transitions are a model of clarity. Explicit state transitions prevent confusion about "is this still running?"

### Pattern 7: Monaco Editor Read/Edit Split

**What it is:** Markdown files show in read mode by default (rendered). A toggle or button switches to edit mode (Monaco raw editor).
**How to apply:**
- Default: rendered Markdown view (react-markdown)
- Edit button: switches to Monaco editor with Markdown language mode
- Save: writes back via Tauri fs API, returns to rendered view
- Unsaved indicator: dot in tab or save button

**Why:** VS Code uses this pattern. Most users read more than they write. Defaulting to rendered view reduces visual noise while keeping editing accessible.

### Pattern 8: Progress Bar with Fraction

**What it is:** Linear uses `[████████░░] 75%` style progress bars. GitHub Actions uses a step checklist.
**How to apply:**
- Overall project progress: segmented bar showing phase completion (one segment per phase)
- Phase progress: `[██████████] 3/3` or `[████░░░░░░] 2/5` with fraction
- Plan progress: `[x] 01-01`, `[x] 01-02`, `[ ] 01-03`

**Why:** The STATE.md already uses this format (`[████████░░] 75%`). Consistency with the underlying data format is both easier to implement and more readable for GSD users.

### Pattern 9: Triage Inbox for Blockers

**What it is:** Linear's Triage inbox surfaces items needing attention from all integrations.
**How to apply:**
- A "Attention Needed" panel that surfaces:
  - WAITING.json signals (STATE.md signal-waiting)
  - Incomplete plans (PLAN.md exists, no SUMMARY.md)
  - Unresolved blockers in STATE.md
  - Phase 3+ with TBD plan counts
- Clear, actionable items with direct links to navigate

**Why:** This is the "single source of truth" principle -- surfacing what needs attention without requiring the user to hunt through files.

### Pattern 10: Keyboard Shortcut Hints on Buttons

**What it is:** Show keyboard shortcut badge on buttons (e.g., `Cmd+P` on the Plan Phase button).
**How to apply:**
- Add shortcut badges to primary action buttons
- Register global shortcuts via Tauri global shortcut API
- Show shortcuts in tooltips if space is tight

**Why:** Developer tools users expect keyboard shortcuts. Surface them without cluttering the UI.

---

## Feature Complexity Notes

Estimated implementation complexity for each feature, considering the Tauri + React stack.

| Feature | Complexity | Key Challenge |
|---------|------------|---------------|
| Command execution panel (buttons + state) | Low | State machine for running/success/error |
| Real-time output streaming | **High** | xterm.js or equivalent, IPC batching, ANSI parsing |
| Phase/progress list view | Low | Parse gsd-tools JSON output |
| File tree browser | Low-Medium | Recursive Tauri fs read, tree state |
| Markdown viewer (rendered) | Low | react-markdown + syntax highlighting |
| Monaco editor integration | Medium | Read/write flow, unsaved changes |
| CLI detection + setup prompt | Low | `claude --version` check |
| Project path selection | Low | Tauri dialog API |
| Phase dependency visualization | Medium | Parse depends_on, render graph/list |
| Session continuity display | Low | Parse STATE.md frontmatter |
| Plan-to-summary tracking | Medium | Phase directory parsing, file existence |
| Performance metrics display | Low | Parse STATE.md metrics section |
| Requirement reference links | Medium | REQUIREMENTS.md parsing, cross-reference |
| Git status indicators | Medium | Git CLI via Tauri shell |
| Keyboard shortcuts | Low-Medium | Tauri global shortcut API |
| File watcher (auto-refresh) | Medium | Tauri notify or polling |
| View toggle (list vs timeline) | Medium | Multiple render paths for same data |
| Blocker/attention panel (Triage) | Medium | Aggregate from multiple sources |

### Priority Recommendation for MVP

**Must have (v1):**
1. CLI detection + project path selection (prerequisites)
2. Command execution panel with state machine
3. Real-time output streaming (the most complex, highest value)
4. Phase/progress list view
5. Markdown file viewer (read mode)
6. File tree browser (can share implementation with plan/summary views)

**Strong v2 candidates:**
- Monaco editor integration
- Plan-to-summary tracking detail view
- Keyboard shortcuts
- Performance metrics display
- Phase dependency visualization

**v3 and beyond:**
- Requirement reference links
- Git status indicators
- Timeline view toggle
- File watcher auto-refresh

### Critical Risk: Output Streaming

The real-time output streaming is the highest-complexity feature and the core value proposition. If the streaming experience is janky (lag, flicker, crashes on large output), the entire product fails. Invest in:
- Choosing the right terminal component (xterm.js vs react-terminal vs custom)
- IPC message batching strategy (50-100ms windows)
- Virtual scrolling for large output buffers
- Testing with high-volume output (thousands of lines from real Claude Code sessions)

---

## Sources

- Linear documentation (linear.app/docs) -- UI patterns, workflows, cycles, views
- Linear changelog (linear.app/changelog) -- nested hierarchy, timing charts, time-in-status
- GitHub Projects documentation (docs.github.com) -- views, automation, charts
- GitHub Actions (github.com/features/actions) -- live logs, color/emoji, line-specific sharing
- VS Code Terminal (code.visualstudio.com) -- ANSI colors, WebGL renderer, shell integration
- Hyper terminal blog -- IPC batching for streaming output performance
- Claude Code documentation (code.claude.com) -- CLI patterns, streaming, multi-surface integration
- GSD tools source (`.claude/get-shit-done/bin/gsd-tools.cjs`) -- command taxonomy, JSON output schemas
- GSD project examples (`.planning/ROADMAP.md`, `STATE.md`) -- actual data structures
