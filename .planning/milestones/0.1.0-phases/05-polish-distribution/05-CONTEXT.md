---
phase: 5
slug: polish-distribution
status: draft
created: 2026-04-14
---

# Phase 5: Polish + Distribution - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

应用加固和发布阶段，不添加新功能。专注于：错误处理、设置持久化、跨平台构建、应用图标。

</domain>

<decisions>
## Implementation Decisions

### 错误处理策略 (Error Handling)

- **D-01:** 分级错误处理策略 — 某些错误自动重试，某些立即通知用户
  - **自动重试:** 网络相关错误（gsd-tools CLI 超时）、进程相关错误（子进程启动失败、进程意外终止）
  - **立即通知:** 文件权限拒绝、CLI 未安装等关键错误

- **D-02:** 混合错误展示方式 — 根据错误严重程度使用不同展示
  - **Modal 模态对话框:** CLI 未安装、文件权限拒绝（关键错误，需要用户操作）
  - **Toast 轻量通知:** 进程超时等可重试错误（右上角弹出，几秒后自动消失）
  - **Inline 内联消息:** 窗口关闭时的执行状态（在执行区域显示上下文相关错误）

- **D-03:** 错误日志记录策略 — 控制台 + 文件日志两者都记录
  - 控制台输出：用于开发调试
  - 文件日志：写入到用户目录下的 `.gsd-ui/logs/` 目录，便于问题诊断

- **D-04:** 重试策略 — 自动重试最多 3 次，每次间隔递增（1s → 2s → 3s）
  - 仅对网络相关和进程相关错误进行自动重试
  - 重试失败后显示错误消息给用户

### Claude's Discretion

- **设置持久化范围** — 具体哪些设置需要持久化（项目路径、窗口大小、侧边栏状态等）
- **构建自动化** — 是否设置 CI/CD，手动构建还是自动化构建
- **代码签名策略** — 自签名证书还是购买正式证书
- **应用图标设计** — 自定义图标还是使用默认 Tauri 图标

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 5 Requirements
- `.planning/ROADMAP.md` §Phase 5 — Phase 5 成功标准（错误处理、持久化、构建、图标）

### Prior Phase Context
- `.planning/phases/01-scaffold-foundation/01-CONTEXT.md` — Tauri v2 + React 技术栈、Zustand 状态管理
- `.planning/phases/02-command-execution-output-streaming/02-CONTEXT.md` — Shell 插件集成、进程管理模式
- `.planning/phases/03-file-browsing-monaco-editor/03-CONTEXT.md` — FS 插件集成、文件 watcher 模式
- `.planning/phases/04-progress-state-views/04-CONTEXT.md` — 进度数据获取方式、UI 组件模式

### Project-Level References
- `.planning/PROJECT.md` — 项目愿景、核心价值
- `.planning/REQUIREMENTS.md` — v1 需求（Phase 5 无特定需求，属于加固和发布）
- `CLAUDE.md` — 项目指南、技术栈约束

### Tauri Documentation
- Tauri v2 Error Handling: https://tauri.app/v2/guides/architecture/error-handling
- Tauri v2 Plugins: https://tauri.app/v2/guides/architecture/plugins
- @tauri-apps/plugin-store: https://tauri.app/v2/plugin/store/

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Zustand stores:** `src/stores/` (cliStore, fileStore, progressStore, projectStore, uiStore) — 状态管理已建立
- **Error handling patterns:** `src/stores/fileStore.ts` 有 try-catch 块，可作为参考模式
- **Tauri plugins:** `@tauri-apps/plugin-shell`, `@tauri-apps/plugin-fs`, `@tauri-apps/plugin-process` 已集成
- **UI components:** shadcn/ui components (Dialog, Toast, Alert via lucide-react icons)

### Established Patterns
- **State management:** Zustand stores 使用 `create((set, get) => ({ state, actions }))` 模式
- **CLI execution:** `src/lib/shell.ts` `runCommand()` 函数封装了 shell 插件调用
- **File operations:** `@tauri-apps/plugin-fs` 用于文件读写

### Integration Points
- **Error UI components:** 需要创建 Toast、Dialog、Inline error message 组件
- **Store API:** `@tauri-apps/plugin-store` 需要集成用于持久化
- **Build configuration:** `src-tauri/tauri.conf.json`, `package.json` scripts

</code_context>

<specifics>
## Specific Ideas

### 错误处理具体实现
- **Toast 组件:** 使用 shadcn/ui Toast 或基于 sonner 库实现
- **Dialog 组件:** 使用 shadcn/ui Dialog（已通过 Radix UI 可用）
- **日志文件:** 用户目录下的 `.gsd-ui/logs/error-{date}.log`，每天一个文件

### 重试配置
- 最大重试次数: 3
- 重试间隔: 1000ms → 2000ms → 3000ms (递增)
- 指数退避: 避免频繁重试导致系统负担

</specifics>

<deferred>
## Deferred Ideas

- **设置持久化范围** — 延迟到规划阶段决定（Claude's discretion）
- **构建自动化** — 延迟到规划阶段决定（Claude's discretion）
- **代码签名策略** — 延迟到规划阶段决定（Claude's discretion）
- **应用图标设计** — 延迟到规划阶段决定（Claude's discretion）

</deferred>

---

*Phase: 05-polish-distribution*
*Context gathered: 2026-04-14*
