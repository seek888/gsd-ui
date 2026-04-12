# GSD UI

## What This Is

GSD UI 是一个基于 Tauri + React 的桌面客户端，为 GSD 工作流提供可视化操作界面。用户可以通过点击按钮触发 GSD 命令（调用 Claude Code CLI），实时查看执行输出，浏览阶段进度和规划文档，并通过内置的 Monaco 编辑器直接读写 `.planning/` 目录中的 Markdown 文件。目标平台为 macOS 和 Windows。

## Core Value

让开发者能在一个界面里看清楚"正在做什么、下一步做什么、做了什么"，而不用在终端和文件管理器之间反复切换。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 仪表板面板：以按钮列表展示所有 GSD 命令，点击后通过 Tauri Command API 调用 `claude` CLI
- [ ] 实时输出流：将 Claude CLI 的 stdout/stderr 实时流式渲染到内嵌终端视图
- [ ] 阶段进度视图：读取 `.planning/ROADMAP.md` 和各 phase 目录，可视化展示阶段完成状态
- [ ] 任务全貌视图：展示所有 Plan、当前进度、下一步行动，对应 ROADMAP.md 的结构
- [ ] 文档面板：列出并展示 `.planning/` 目录下的关键文档（PROJECT.md、STATE.md、REQUIREMENTS.md 等）
- [ ] Monaco 编辑器：内置可读写的代码编辑器，支持 Markdown 语法高亮，可直接编辑 `.planning/` 文件
- [ ] 文件树：左侧面板展示项目文件结构，可浏览任意文件
- [ ] 执行统计：记录并展示每个阶段的耗时、修改的文件数量
- [ ] 文件监听：监听 `.planning/` 目录变更，自动刷新状态视图

### Out of Scope

- Token 消耗追踪 — 暂时跳过，Claude Code 没有公开的本地 token 日志 API，后续可考虑解析日志文件
- 多项目切换 — 仅聚焦当前工作目录，保持简单
- 多用户/团队功能 — 个人工具，不需要协作支持
- 自托管/Web 版本 — 纯桌面客户端，不需要 Web 部署

## Context

- GSD 工作流通过 Claude Code CLI（`claude` 命令）和 `gsd-tools.cjs` Node.js 脚本驱动
- 所有规划状态存储在项目根目录的 `.planning/` 目录中，为 Markdown 文件
- `gsd-tools.cjs` 提供结构化 JSON 输出（`roadmap analyze`、`state-snapshot` 等），可作为后端数据源
- Tauri v2 + React 18 + TypeScript；Monaco Editor 通过 `@monaco-editor/react` 集成
- 目标用户是使用 GSD 工作流的开发者（个人工具）

## Constraints

- **Tech Stack**: Tauri v2 + React + TypeScript — 已决策，不可变
- **Platform**: macOS + Windows — 必须跨平台构建，不能用纯 macOS API
- **CLI Dependency**: 依赖本地安装的 `claude` CLI — 需要检测并提示安装
- **File Access**: Tauri 沙箱需要显式授权文件系统访问权限

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tauri + React 而非 Electron | 包体积 ~10MB vs ~150MB，Rust 后端进程管理更稳定 | — Pending |
| Monaco Editor 用于文件编辑 | 与 VS Code 同款，Markdown 支持开箱即用，API 成熟 | — Pending |
| 直接调用 `claude` CLI | 保持与 GSD 工作流完全兼容，不需要维护独立的逻辑层 | — Pending |
| 单项目模式 | 降低复杂度，聚焦核心价值；多项目可后续添加 | — Pending |
| 不做 Token 追踪 | Claude Code 没有公开 token 日志 API，实现成本高且不可靠 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-13 after initialization*
