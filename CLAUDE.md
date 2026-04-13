<!-- GSD:project-start source:PROJECT.md -->
## Project

**GSD UI**

GSD UI 是一个基于 Tauri + React 的桌面客户端，为 GSD 工作流提供可视化操作界面。用户可以通过点击按钮触发 GSD 命令（调用 Claude Code CLI），实时查看执行输出，浏览阶段进度和规划文档，并通过内置的 Monaco 编辑器直接读写 `.planning/` 目录中的 Markdown 文件。目标平台为 macOS 和 Windows。

**Core Value:** 让开发者能在一个界面里看清楚"正在做什么、下一步做什么、做了什么"，而不用在终端和文件管理器之间反复切换。

### Constraints

- **Tech Stack**: Tauri v2 + React + TypeScript — 已决策，不可变
- **Platform**: macOS + Windows — 必须跨平台构建，不能用纯 macOS API
- **CLI Dependency**: 依赖本地安装的 `claude` CLI — 需要检测并提示安装
- **File Access**: Tauri 沙箱需要显式授权文件系统访问权限
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Desktop Framework | Tauri | v2.x (stable) | ~10MB bundle vs Electron's ~150MB; Rust backend for stable process management; plugin ecosystem mature in v2 |
| Frontend Build | Vite | v5.x | Officially recommended by Tauri; fast HMR essential for desktop dev workflow |
| Language | TypeScript | v5.x | Required for Tauri v2 + React; strict mode for reliability |
| UI Framework | React | v18.x or v19.x | Tauri v2 officially supports; v19 via `@monaco-editor/react@next` |
| State Management | Zustand | v5.x | ~1KB, minimal boilerplate, ideal for file-system/event-driven state; React Query adds unnecessary complexity for local file data |
| Code Editor | @monaco-editor/react | v4.x | Official Monaco wrapper; zero webpack config; Markdown language support built-in |
| File Tree | react-arborist | latest | Purpose-built React tree library; virtualized rendering; drag-and-drop capable; most popular React tree lib |
| Terminal Output | @xterm/xterm + @xterm/addon-fit | v5.x | Modular xterm.js packages; used by VS Code; GPU-accelerated rendering |
| UI Component Library | shadcn/ui | latest | Copy-paste components (not a package); Radix UI primitives + Tailwind CSS; highly customizable for developer tools aesthetic |
| Styling | Tailwind CSS | v3.x | Required by shadcn/ui; utility-first fits custom developer tool UI |
| Styling Primitive | Radix UI | via shadcn/ui | Headless accessible primitives; shadcn/ui wraps these |
| Shell Plugin | @tauri-apps/plugin-shell | v2.x | First-party Tauri plugin for child process spawning with streaming stdout/stderr |
| FS Plugin | @tauri-apps/plugin-fs | v2.x | First-party Tauri plugin for read/write/watch with capability-based security |
| Process Plugin | @tauri-apps/plugin-process | v2.x | App exit/relaunch only (not for spawning); spawn uses shell plugin |
## Key Library Decisions
### 1. Tauri v2 vs v1
- **Plugin system**: Non-core APIs (fs, shell, dialog, http, etc.) moved to `@tauri-apps/plugin-*` packages. This is cleaner and more maintainable.
- **Capabilities system**: Replaced v1's allowlist with a capability/permission ACL system in `src-tauri/capabilities/`. More granular and explicit.
- **IPC rewrite**: New `Channel` API with `EventTarget`-based event system.
- **Window API rename**: `Window` -> `WebviewWindow` (Rust + JS) for clarity.
### 2. Tauri v2 Shell Plugin (`@tauri-apps/plugin-shell`)
- `Command.create(program, args)` creates a command
- `cmd.spawn()` returns a `Child` handle with `.kill()` and `.write()` methods
- `cmd.execute()` waits for completion and returns full output (use for quick commands)
- Streaming is event-based: `cmd.stdout.on('data', callback)`
### 3. Tauri v2 FS Plugin (`@tauri-apps/plugin-fs`)
### 4. State Management: Zustand
- File system state (read from `.planning/`)
- CLI execution state (streaming output, process lifecycle)
- UI state (selected file, panel sizes)
- No server/API state
- **vs Jotai**: Jotai's atomic model shines for fine-grained subscriptions in large apps. GSD UI is medium complexity -- Zustand's flat store is simpler and sufficient.
- **vs React Query**: React Query is designed for server state (caching, background refetch, optimistic updates). GSD UI has no server state. Using React Query would be misusing it.
- **vs React Context**: Zustand is easier to use than Context for multiple independent state slices.
### 5. Monaco Editor (`@monaco-editor/react`)
### 6. File Tree: react-arborist
| Alternative | Why Not |
|-------------|---------|
| Custom `<ul>/<li>` tree | No virtualization; slow with large dirs |
| react-file-tree | Unmaintained, no TypeScript |
| @nrwl/nx file utilities | Too heavy for a standalone component |
| react-virtualized-tree | Hard to customize appearance |
| react-tree-walker | Lower level, requires more boilerplate |
- Virtualized rendering (handles thousands of nodes)
- Customizable node rendering (render prop API)
- Drag-and-drop support
- TypeScript native
- Active maintenance (~weekly releases as of 2024-2025)
### 7. Terminal Output: @xterm/xterm
### 8. UI Component Library: shadcn/ui + Tailwind CSS
| Library | Why Not |
|---------|---------|
| Raw Radix UI | Too low-level; requires significant styling work |
| Material UI (MUI) | Google's design language; heavy (~60KB+); not a developer tool aesthetic |
| Chakra UI | Maintenance concerns (v3 delayed); opinionated |
| Mantine | Good but less customizable than shadcn/ui for custom aesthetics |
| custom | Too much work for common components (buttons, dialogs, menus) |
- No external dependency risk
- Full customization (developer tool aesthetic is achievable)
- Accessible by default (Radix UI primitives underneath)
- Tailwind CSS for styling
- Button, Badge (command buttons, status indicators)
- Dialog, Sheet (file editor, settings)
- Resizable (adjustable panels)
- ScrollArea (custom scrollbar)
- Tooltip, ContextMenu (file tree interactions)
- Tabs (Dashboard vs Files vs Editor views)
- Separator, Collapsible (panel layouts)
### 9. Build Tooling: Vite + Tauri CLI
## What NOT to Use
### Electron
- Bundle size: ~150MB vs Tauri's ~10MB
- Chromium overhead: memory-heavy, two JS runtimes (Node + renderer)
- **Exception**: Only if Tauri cannot fulfill a specific requirement (unlikely for this use case)
### Tauri v1
- Deprecated. No new features. Plugin ecosystem moved to v2.
- Breaking migration path exists but unnecessary for a new project.
### React Context for global state
- Boilerplate-heavy for multiple state slices
- Re-render issues require careful optimization
- Zustand at ~1KB is strictly better
### `fs-extra` or `chokidar` in Node.js
- These run in Node.js, not in the Tauri webview
- Tauri provides Rust-based FS access via plugins
- Use `@tauri-apps/plugin-fs` instead of Node.js fs modules
### Monaco Editor via webpack loader
- Old approach requiring custom webpack configuration
- `@monaco-editor/react` wraps everything; zero config needed
### Raw WebSocket for CLI streaming
- The shell plugin handles process management natively
- WebSocket would be for linking a separate backend process
- Unnecessary complexity for direct CLI invocation
### Ant Design or Material UI
- Enterprise/consumer design language
- Heavy bundle sizes
- Wrong aesthetic for developer tools
## Open Questions
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
