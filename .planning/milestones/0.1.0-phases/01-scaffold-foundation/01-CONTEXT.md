# Phase 1: Scaffold + Foundation - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can launch the app, confirm the Claude CLI is installed, and select their GSD project directory. Phase 1 establishes the full app shell with sidebar navigation, the CLI detection welcome page, and project path selection with persistence.

</domain>

<decisions>
## Implementation Decisions

### App Layout

- **D-01:** Navigation mode: **Fixed sidebar** — 左侧固定图标+文字导航栏，点击切换主内容区（Linear/VS Code 惯例）
- **D-02:** Sidebar width: **200px 标准版** — 图标 + 文字标签
- **D-03:** Sidebar navigation items:
  - Dashboard（首页总览）
  - Roadmap（阶段进度）
  - Terminal（命令输出）
  - Documents（文档/编辑器）
- **D-04:** Settings 不在侧边栏，暂不实现（可从 Dashboard 进入或后续添加为 header 图标）
- **D-05:** Phase 1 scope: **完整 App Shell** — 侧边栏和四个页面框架全部搭建好，内容区（Terminal/Documents）Phase 2-3 再填入具体功能

### Setup Experience

- **D-06:** CLI 未安装时：显示 **独立全屏欢迎页**，包含安装指引和 `claude` CLI 安装说明
- **D-07:** 项目路径：启动时**记住上次打开的项目**，自动恢复，无需每次手动选择（FOUND-04）

### CLI Detection

- **D-08:** CLI 检测方式：运行 `claude --version` via Tauri shell plugin
- **D-09:** 检测结果两种状态：已安装（进入主界面） / 未安装（全屏欢迎页）

### State Management

- **D-10:** Zustand stores：project state（路径、CLI 状态）、UI state（当前视图、侧边栏状态）
- **D-11:** 设置持久化 via @tauri-apps/plugin-store

### Claude's Discretion

- 侧边栏内 Dashboard 默认内容（Phase 4 完成后填充进度数据）
- Terminal 和 Documents 的容器框架（空状态设计）
- Welcome page 的具体文案和图标风格

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value: "看清楚正在做什么、下一步做什么、做了什么"
- `.planning/REQUIREMENTS.md` — FOUND-01 through FOUND-04 are Phase 1 requirements
- `.planning/ROADMAP.md` — Phase 1 goal and 7 plans
- `.planning/research/STACK.md` — Recommended stack (Tauri v2 + React + Zustand + shadcn/ui)
- `.planning/research/ARCHITECTURE.md` — CLI streaming patterns, Tauri IPC architecture
- `.planning/research/PITFALLS.md` — Tauri v2 capabilities system, Monaco CSP (unsafe-eval)
- `.planning/research/FEATURES.md` — Linear-style sidebar navigation (Pattern 1)

### Tech Decisions
- `.planning/research/STACK.md` §Tauri v2 Plugins — shell plugin for CLI invocation, fs plugin for file access, store plugin for persistence
- `.planning/research/STACK.md` §Zustand — state management for file/event-driven UI state
- `.planning/research/STACK.md` §shadcn/ui + Tailwind — UI component library

</canonical_refs>

<code_context>
## Existing Code Insights

This is a greenfield project — no existing code.

### Reusable Assets
- None yet — building from scratch

### Established Patterns
- None yet — this phase establishes the foundational patterns

### Integration Points
- Tauri shell plugin → CLI detection (plan 01-04)
- Tauri fs plugin → project path selection (plan 01-06)
- Tauri store plugin → settings persistence (plan 01-07)
- Zustand stores → all React components consuming project/UI state

</code_context>

<specifics>
## Specific Ideas

- Welcome page should include a clear install command: `npm install -g @anthropic/claude-code`
- Welcome page should have a "Check again" button to retry CLI detection
- Sidebar should have a subtle active indicator for the current view
- Dashboard as empty shell in Phase 1 — will be populated in Phase 4 with progress data
- Terminal view: show empty state with "Run a command to see output here" placeholder in Phase 1

</specifics>

<deferred>
## Deferred Ideas

- Settings page / in-app settings access — not in Phase 1 scope
- Keyboard shortcuts — Phase 2+ (v2 requirement NAV-01)
- Phase dependency visualization — Phase 4 (differentiator)

</deferred>

---

*Phase: 01-scaffold-foundation*
*Context gathered: 2026-04-13*
