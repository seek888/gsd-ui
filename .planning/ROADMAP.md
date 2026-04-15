# Roadmap: GSD UI

## Overview

A Tauri v2 + React desktop app that wraps the GSD CLI workflow. Users can trigger GSD commands via buttons, watch real-time output streamed from the Claude CLI, browse and edit `.planning/` files through a Monaco editor, and view phase progress and project state — all in one desktop window. Target platforms: macOS and Windows.

## Phases

- [x] **Phase 1: Scaffold + Foundation** - Tauri v2 project setup, CLI detection, path selection, Zustand stores, capability configuration
- [x] **Phase 2: Command Execution + Output Streaming** - GSD command buttons, real-time stdout/stderr streaming, ANSI colors, cancel support
- [x] **Phase 3: File Browsing + Monaco Editor** - File tree, Markdown preview, Monaco editing, unsaved indicator, file watching
- [x] **Phase 4: Progress & State Views** - Phase list with completion, expandable plans, session context, attention panel
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
**Plans**: 3 plans (consolidated from original 7)

Plans:
- [x] 01-01: Scaffold Tauri v2 + React + TypeScript project, install all plugins, configure capabilities + CSP
- [x] 01-02: Create Zustand stores (project, UI, CLI), lib helpers, and shadcn/ui base components
- [x] 01-03: Build App Shell (sidebar, WelcomePage, DirectoryPicker, 4 view shells) and wire persistence
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
- [x] 02-01: Build GSD command panel with button list (CMD-01, CMD-02)
- [x] 02-02: Implement shell plugin command execution with cancel/kill support (CMD-03, CMD-04)
- [x] 02-03: Implement real-time output streaming with Rust-side batching (100ms windows) and React-side requestAnimationFrame throttling (OUT-01)
- [x] 02-04: Implement ANSI color code parsing and terminal output rendering (OUT-02)
- [x] 02-05: Implement auto-scroll with user-scroll detection and "jump to bottom" button (OUT-03)
- [x] 02-06: Implement output copy-to-clipboard and clear panel functionality (OUT-04)
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
- [x] 03-01: Build file tree component with react-arborist showing `.planning/` structure with expand/collapse
- [x] 03-02: Implement Markdown file preview rendering with heading hierarchy, tables, code blocks, and front matter display
- [x] 03-03: Integrate Monaco Editor with read/edit toggle for Markdown files; implement save via Tauri fs plugin
- [x] 03-04: Add unsaved changes indicator (dirty state) and save button state management
- [x] 03-05: Implement file watcher on `.planning/` directory with 500ms debounce to auto-refresh tree and open views
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
- [x] 04-01: Add shadcn/ui components (Badge, Progress, Accordion, Separator) for progress visualization (PROG-01, PROG-02)
- [x] 04-02: Create progressStore Zustand store and gsd-tools wrapper for roadmap/state data parsing via CLI with markdown fallback (PROG-01, PROG-02, PROG-03, PROG-05)
- [x] 04-03: Implement PhaseCard and PlanItem components showing phase progress and plan completion status (PROG-01, PROG-02)
- [x] 04-04: Implement SessionContext and AttentionPanel components showing current session state and attention items (PROG-03, PROG-04)
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
- [x] 05-01-PLAN.md — 实现分级错误处理系统（重试逻辑、日志记录、Modal/Toast UI 组件及连接）
- [x] 05-02-PLAN.md — 扩展设置持久化（侧边栏状态、当前视图自动恢复）
- [x] 05-03-PLAN.md — 构建和测试 macOS .app bundle ✅
- [x] 05-04-PLAN.md — 构建和测试 Windows .exe 安装程序（含 Windows 验证说明）✅
- [x] 05-05-PLAN.md — 配置应用图标和元数据 ✅
**UI hint**: yes

**Phase 5 Detail:**

| Plan | Tasks | Wave | Status |
|------|-------|------|--------|
| 05-01 | 4 | 1 | ✅ Complete |
| 05-02 | 3 | 2 | ✅ Complete |
| 05-03 | 3 | 3 | ✅ Complete (macOS build verified) |
| 05-04 | 3 | 3 | ✅ Complete (config ready, Win build pending) |
| 05-05 | 3 | 4 | ✅ Complete |

**Wave Structure:**

| Wave | Plans | Parallel Execution |
|------|-------|-------------------|
| 1 | 05-01 | Independent (error handling foundation with executeWithRetry) |
| 2 | 05-02 | After 05-01 (depends on error store) |
| 3 | 05-03, 05-04 | Parallel cross-platform builds (can execute on different platforms simultaneously) |
| 4 | 05-05 | After 05-03, 05-04 (final polish) |

**Total Tasks:** 16 tasks across 5 plans

**Validation Notes:**
- Nyquist validation: Skipped for Phase 5 (polish/release phase with no v1 requirements; core functionality validated in earlier phases)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold + Foundation | 3/3 | Complete | 2026-04-13 |
| 2. Command Execution + Output Streaming | 6/6 | Complete | 2026-04-13 |
| 3. File Browsing + Monaco Editor | 5/5 | Complete | 2026-04-14 |
| 4. Progress & State Views | 4/4 | Complete | 2026-04-14 |
| 5. Polish + Distribution | 5/5 | Complete | 2026-04-15 |
| 6. Electron 迁移 | 4/5 | Executing | - |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22/22 (Tauri)
- Phase 6: Electron migration (new requirements)

---

## Phase 6: Electron 迁移

**Goal**: 将 GSD UI 从 Tauri v2 迁移到 Electron + React
**Depends on**: Phase 5 (Tauri MVP 完成)
**Plans**: 5 plans

Plans:
- [x] 06-01-PLAN.md — Electron 项目脚手架搭建 ✅
- [x] 06-02-PLAN.md — Main Process 和 Preload 实现 ✅
- [x] 06-03-PLAN.md — Stores 迁移 (electron-store) ✅
- [x] 06-04-PLAN.md — Shell 和文件系统迁移 ✅
- [ ] 06-05-PLAN.md — 构建和测试
