# Roadmap: GSD UI

## Overview

A Tauri v2 + React desktop app that wraps the GSD CLI workflow. Users can trigger GSD commands via buttons, watch real-time output streamed from the Claude CLI, browse and edit `.planning/` files through a Monaco editor, and view phase progress and project state — all in one desktop window. Target platforms: macOS and Windows.

## Phases

- [ ] **Phase 1: Scaffold + Foundation** - Tauri v2 project setup, CLI detection, path selection, Zustand stores, capability configuration
- [ ] **Phase 2: Command Execution + Output Streaming** - GSD command buttons, real-time stdout/stderr streaming, ANSI colors, cancel support
- [ ] **Phase 3: File Browsing + Monaco Editor** - File tree, Markdown preview, Monaco editing, unsaved indicator, file watching
- [ ] **Phase 4: Progress & State Views** - Phase list with completion, expandable plans, session context, attention panel
- [ ] **Phase 5: Polish + Distribution** - Error handling, settings persistence, cross-platform builds, app icon

## Phase Details

### Phase 1: Scaffold + Foundation
**Goal**: Users can launch the app, confirm the Claude CLI is installed, and select their GSD project directory.
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04
**Success Criteria** (what must be TRUE):
  1. App launches without errors on macOS and Windows
  2. App detects whether `claude` CLI is installed and shows appropriate startup state
  3. If CLI is missing, user sees a clear install guide page instead of a broken app
  4. User can select a project directory via a native directory picker dialog
  5. Selected project path persists across app restarts
**Plans**: 7 plans

Plans:
- [ ] 01-01: Initialize Tauri v2 + React + TypeScript project via `npm create tauri-app`
- [ ] 01-02: Install and initialize all Tauri v2 plugins (shell, fs with watch, store) and configure capability files
- [ ] 01-03: Configure CSP in tauri.conf.json for Monaco Editor (add required directives)
- [ ] 01-04: Implement CLI detection command (run `claude --version` via shell plugin, handle not-found)
- [ ] 01-05: Create CLI install guide page (shown when CLI is not detected)
- [ ] 01-06: Create native directory picker and wire project path selection
- [ ] 01-07: Set up Zustand stores (project state, CLI state, UI state) and persist settings via @tauri-apps/plugin-store
**UI hint**: yes

### Phase 2: Command Execution + Output Streaming
**Goal**: Users can trigger GSD commands via button clicks and watch real-time output with ANSI colors.
**Depends on**: Phase 1
**Requirements**: CMD-01, CMD-02, CMD-03, CMD-04, OUT-01, OUT-02, OUT-03, OUT-04
**Success Criteria** (what must be TRUE):
  1. User sees a button list of all GSD commands, each with a label and description
  2. Each command button shows distinct visual states: idle, running (spinner), success (green), failure (red)
  3. User can cancel a running command mid-execution and the subprocess is terminated
  4. Output from the Claude CLI appears in real time with correct ANSI color rendering (errors red, successes green, warnings yellow)
  5. User can manually scroll output and jump back to the bottom; user can copy output content and clear the panel
**Plans**: 6 plans

Plans:
- [ ] 02-01: Build GSD command panel with button list (CMD-01, CMD-02)
- [ ] 02-02: Implement shell plugin command execution with cancel/kill support (CMD-03, CMD-04)
- [ ] 02-03: Implement real-time output streaming with Rust-side batching (100ms windows) and React-side requestAnimationFrame throttling (OUT-01)
- [ ] 02-04: Implement ANSI color code parsing and terminal output rendering (OUT-02)
- [ ] 02-05: Implement auto-scroll with user-scroll detection and "jump to bottom" button (OUT-03)
- [ ] 02-06: Implement output copy-to-clipboard and clear panel functionality (OUT-04)
**UI hint**: yes

### Phase 3: File Browsing + Monaco Editor
**Goal**: Users can browse the `.planning/` directory, preview rendered Markdown files, and edit them with Monaco.
**Depends on**: Phase 1
**Requirements**: FILE-01, FILE-02, FILE-03, FILE-04, FILE-05
**Success Criteria** (what must be TRUE):
  1. User sees a collapsible file tree on the left showing the `.planning/` directory structure
  2. Clicking a Markdown file shows it rendered with proper heading hierarchy, tables, code blocks, and visible front matter
  3. User can switch from preview mode to Monaco editor mode to edit Markdown files, and save changes back to disk
  4. Unsaved changes are indicated visually in the title area and the save button reflects modified state
  5. When files in `.planning/` are modified externally, the file tree and any open views refresh automatically
**Plans**: 5 plans

Plans:
- [ ] 03-01: Build file tree component with react-arborist showing `.planning/` structure with expand/collapse
- [ ] 03-02: Implement Markdown file preview rendering with heading hierarchy, tables, code blocks, and front matter display
- [ ] 03-03: Integrate Monaco Editor with read/edit toggle for Markdown files; implement save via Tauri fs plugin
- [ ] 03-04: Add unsaved changes indicator (dirty state) and save button state management
- [ ] 03-05: Implement file watcher on `.planning/` directory with 500ms debounce to auto-refresh tree and open views
**UI hint**: yes

### Phase 4: Progress & State Views
**Goal**: Users can view all phases with completion status, drill into individual plans, see session context, and review attention items.
**Depends on**: Phase 3 (depends on file tree and data access patterns established in Phase 3)
**Requirements**: PROG-01, PROG-02, PROG-03, PROG-04, PROG-05
**Success Criteria** (what must be TRUE):
  1. User sees a list of all phases with completion status and progress percentage; the current active phase is highlighted
  2. User can expand a phase to see all its Plans, with each Plan showing completion status (PLAN.md exists, SUMMARY.md exists)
  3. User sees the current session context: recent position, blockers, and key decisions from STATE.md
  4. User sees an attention panel listing incomplete plans, STATE.md blockers, and outstanding items
  5. Progress and state data is sourced from `node gsd-tools.cjs roadmap analyze` and `state-snapshot` JSON output
**Plans**: 4 plans

Plans:
- [ ] 04-01: Build phase list view with completion status, progress bars, and current phase highlight (PROG-01)
- [ ] 04-02: Implement phase detail expansion showing Plans and their completion indicators (PROG-02)
- [ ] 04-03: Display current session context (recent activity, blockers, decisions) sourced from gsd-tools state-snapshot (PROG-03, PROG-05)
- [ ] 04-04: Build attention panel aggregating incomplete plans, blockers, and outstanding items (PROG-04)
**UI hint**: yes

### Phase 5: Polish + Distribution
**Goal**: The app handles errors gracefully, persists user preferences, and runs on both macOS and Windows.
**Depends on**: Phase 4
**Requirements**: (no v1 requirements — hardening and release)
**Success Criteria** (what must be TRUE):
  1. All failure modes produce user-visible error messages rather than silent crashes (CLI not found, file permission denied, process kill failures, window close during execution)
  2. Project path and UI preferences persist across app restarts
  3. App builds and runs on macOS (.app bundle)
  4. App builds and runs on Windows (.exe installer)
  5. App displays a branded icon in the title bar and taskbar/dock
**Plans**: 5 plans

Plans:
- [ ] 05-01: Implement comprehensive error handling for all CLI, file system, and process failure modes
- [ ] 05-02: Persist user preferences (project path, UI state) via @tauri-apps/plugin-store
- [ ] 05-03: Build and test macOS .app bundle
- [ ] 05-04: Build and test Windows .exe (acquire code signing certificate, configure CI signing, test Windows path handling)
- [ ] 05-05: Configure app icon and metadata (app name, version, description in tauri.conf.json)
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold + Foundation | 0/7 | Not started | - |
| 2. Command Execution + Output Streaming | 0/6 | Not started | - |
| 3. File Browsing + Monaco Editor | 0/5 | Not started | - |
| 4. Progress & State Views | 0/4 | Not started | - |
| 5. Polish + Distribution | 0/5 | Not started | - |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22/22
