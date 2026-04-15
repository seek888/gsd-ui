# Milestones

## 0.1.0 Tauri MVP 完成 (Shipped: 2026-04-15)

**Phases completed:** 5 phases, 23 plans, 58 tasks

**Key accomplishments:**

- What was done:
- Zustand stores (project, UI, CLI) with Tauri plugin wrappers for settings persistence, CLI detection, and file system access, plus shadcn/ui base components
- 200px fixed sidebar with four navigation items, CLI welcome flow with install guide and directory picker, and four empty view shells forming the complete app foundation
- GSD command sidebar with 6 core workflow buttons, 4-state visual feedback (idle/running/success/failure), and icon+label+description layout integrated into Terminal view
- One-liner:
- Plan:
- 1. [Rule 3 - Fix blocking issue] Fixed TypeScript generic type error in Command
- xterm.js terminal with smart auto-scroll pause and floating jump-to-bottom button
- Terminal output management with clipboard addon integration, Copy/Clear buttons, and selection-aware UI feedback
- Virtualized file tree component using react-arborist with Zustand state management and DocumentsView sidebar layout
- Markdown file preview rendering with react-markdown + remark-gfm, syntax-highlighted code blocks, and collapsible YAML front matter
- Monaco Editor integration with read/edit mode toggle, Cmd+S/Ctrl+S keyboard shortcut, and file save to disk
- Dirty state tracking with fileDirtyPaths Set, yellow dot indicators in file tree, and Save button disabled/enabled based on isDirty status
- Debounced file watcher on .planning/ with external change detection, yellow banner prompt, and auto-refresh
- Phase card list view with progress visualization, expandable plan lists, and complete DashboardView implementation
- File:
- 决定
- 构建命令
- 注意
- 图标文件检查

---
