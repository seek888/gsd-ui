# Phase 2: Command Execution + Output Streaming - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 02-command-execution-output-streaming
**Areas discussed:** Command panel layout, Command list definition, Terminal output rendering, Scroll behavior

---

## Command Panel Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Terminal 左侧边栏 | 在 Terminal 视图左侧放命令按钮，类似 VS Code 的调试面板。与现有 Sidebar 模式一致，看输出时命令始终可见。 | ✓ |
| 顶部工具栏 | 在终端输出上方横向排列命令按钮。输出区域垂直空间更大，但命令多时可能需要横向滚动。 | |
| 可折叠面板 | 命令面板可以展开/收起。不运行命令时最大化输出空间，但增加 UI 复杂度。 | |

**User's choice:** Terminal 左侧边栏
**Notes:** 与现有 200px Sidebar 模式保持一致

---

## Command List Definition

| Option | Description | Selected |
|--------|-------------|----------|
| 核心命令列表 (推荐) | 定义一个固定的核心命令集：/gsd-next、/gsd-status、/gsd-plan-phase、/gsd-execute-phase、/gsd-verify-work。每个命令配置标签、描述、CLI 参数映射。 | ✓ |
| 从 ROADMAP 动态生成 | 解析 ROADMAP.md 自动生成命令按钮。添加新阶段时自动出现对应命令，更灵活但依赖 ROADMAP 格式。 | |
| 配置文件定义 | 在 .gsd/config.json 或类似文件中定义命令列表。用户可以自定义，但需要额外配置步骤。 | |

**User's choice:** 核心命令列表 (推荐)
**Notes:** 在 `src/lib/gsdCommands.ts` 中定义常量数组

---

## Terminal Output Rendering

| Option | Description | Selected |
|--------|-------------|----------|
| xterm.js 终端模拟器 | 完整的终端模拟器，ANSI 支持最完善。被 VS Code、GitLab 使用。但 bundle 体积较大 (~1.5MB)，功能可能超出需求。 | ✓ |
| 轻量级 ANSI 解析器 (推荐) | 使用 ansi-to-html 或类似库将 ANSI 转换为 HTML/CSS。体积小 (~50KB)，足以满足颜色渲染需求。更轻量。 | |
| 纯 CSS + 预处理 | 在 Rust 端预处理 ANSI 码，输出带样式类的 HTML。最小依赖，但自定义颜色支持可能受限。 | |

**User's choice:** xterm.js 终端模拟器
**Notes:** 用户接受较大的 bundle 体积以获得完整的终端体验

---

## Scroll Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| 智能暂停 (推荐) | 有新输出时自动滚动到底部。当用户向上滚动查看历史输出时，暂停自动滚动并显示 '跳到底部' 浮动按钮。用户滚动回底部附近时恢复自动滚动。 | ✓ |
| 始终粘底 | 总是自动滚动到最新输出。用户无法方便地查看中间的历史输出，需要持续与自动滚动对抗。 | |
| 手动控制为主 | 默认不自动滚动，用户手动滚动。新输出时显示轻微提示或指示器。更适合查看长输出但可能错过最新内容。 | |

**User's choice:** 智能暂停 (推荐)
**Notes:** 通过 xterm.js `onScroll` 事件 + 视口位置追踪实现

---

## Claude's Discretion

- Terminal 主题颜色精确值（应匹配 shadcn/ui 深色主题）
- 命令按钮图标选择（Lucide 图标）
- "跳到底部" 按钮样式和位置
- 成功指示器自动清除超时时间（建议 3 秒）


