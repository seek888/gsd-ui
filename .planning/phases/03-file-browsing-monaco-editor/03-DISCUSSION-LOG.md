# Phase 3: File Browsing + Monaco Editor - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 03-file-browsing-monaco-editor
**Areas discussed:** 文件树布局, 预览/编辑切换, Markdown 渲染, 文件监听策略

---

## 1. 文件树布局

| Option | Description | Selected |
|--------|-------------|----------|
| Documents View 内 | 文件树作为 Documents View 的左侧部分（类似 Terminal 的布局） | ✓ |
| 替换 Documents View | Documents View 完全变成文件树，点击文件打开预览/编辑 | |
| 全局 Sidebar 左侧 | 在现有 Sidebar 左侧添加文件树面板（可能太拥挤） | |

**User's choice:** Documents View 内

**Notes:** 与 Terminal View 布局保持一致，维持界面统一性。

### 文件树位置子项：布局方式

| Option | Description | Selected |
|--------|-------------|----------|
| 左右分割 (推荐) | 左侧文件树（200px），右侧预览/编辑区域 — 与 Terminal 布局一致 | ✓ |
| 上下分割 | 上方文件树，下方预览/编辑区域 | |
| 可切换面板 | 文件树和预览/编辑是两个独立面板，需要时切换显示 | |

**User's choice:** 左右分割 (推荐)

---

## 2. 预览/编辑切换

| Option | Description | Selected |
|--------|-------------|----------|
| 顶部切换按钮 | 在预览/编辑区域顶部显示「预览」和「编辑」两个按钮 | |
| 双击文件切换 | 单击文件打开预览，双击进入编辑模式 | ✓ |
| 快捷键切换 | 默认预览，按 Cmd+E 或 Ctrl+E 进入编辑模式 | |

**User's choice:** 双击文件切换

**Notes:** 类似 VS Code 的交互模式。

### 预览/编辑切换子项：未保存指示

| Option | Description | Selected |
|--------|-------------|----------|
| 文件名后圆点 | 在文件树中，未保存文件的名称后显示小圆点（类似 VS Code） | ✓ |
| 文件名变粗或变色 | 文件名文字变为粗体或不同颜色 | |
| 顶部保存按钮 | 在编辑区域顶部显示「保存」按钮，未保存时按钮高亮 | |

**User's choice:** 文件名后圆点

---

## 3. Markdown 渲染

### Markdown 库选择

| Option | Description | Selected |
|--------|-------------|----------|
| react-markdown (推荐) | 简单轻量，支持自定义渲染器，适合代码高亮 | ✓ |
| marked + DOMPurify | marked 解析，DOMPurify 清理，手动渲染到 DOM | |
| Monaco 内置预览 | 使用 Monaco 的内置 Markdown 预览功能（可能需要额外配置） | |

**User's choice:** react-markdown (推荐)

### 代码高亮选择

| Option | Description | Selected |
|--------|-------------|----------|
| react-syntax-highlighter | 与 react-markdown 配合良好，支持常用语言 | |
| Prism.js + react-markdown | Prism.js 解析 + react-markdown 自定义渲染器 | |
| Monaco 代码高亮 | 复用 Monaco 的代码高亮能力（编辑模式下已加载） | ✓ |

**User's choice:** Monaco 代码高亮

**Notes:** 复用已加载的 Monaco 编辑器的代码高亮能力，减少依赖。

### Front Matter 显示方式

| Option | Description | Selected |
|--------|-------------|----------|
| 始终显示 | 在预览中始终渲染 front matter 内容（带样式区分） | |
| 默认隐藏 | 默认不显示，只在编辑模式中可见 | |
| 可折叠显示 | 显示为可折叠区域，用户可点击展开/收起 | ✓ |

**User's choice:** 可折叠显示

---

## 4. 文件监听策略

### 监听方式

| Option | Description | Selected |
|--------|-------------|----------|
| Tauri fs.watch() (推荐) | 使用 Tauri 的原生 watch API，实时监听目录变化 | ✓ |
| 轮询检查 | 每隔一段时间轮询文件状态（简单但不实时） | |
| 混合模式 | 主要使用 watch，不可用时降级到轮询 | |

**User's choice:** Tauri fs.watch() (推荐)

### 刷新策略

| Option | Description | Selected |
|--------|-------------|----------|
| 防抖 500ms | 等待 500ms 无新变化后刷新（避免频繁更新） | ✓ |
| 即时刷新 | 文件变化立即刷新（可能导致频繁更新） | |
| 智能防抖 | 编辑中文件不刷新自身，只刷新其他相关文件 | |

**User's choice:** 防抖 500ms

**Notes:** 符合 FILE-05 要求的防抖策略。

### 刷新范围

| Option | Description | Selected |
|--------|-------------|----------|
| 文件树结构 | 文件增删时刷新文件树 | ✓ |
| 当前打开的文件 | 如果当前文件被外部修改，提示用户重新加载 | |
| 未保存状态 | 检查文件是否与磁盘内容一致，更新未保存指示器 | |

**User's choice:** 文件树结构

**Notes:** 优先刷新文件树结构，当前文件的外部修改提示和未保存状态同步可后续扩展。

---

## Claude's Discretion

- File tree component internal implementation details (node rendering, virtualization)
- Markdown preview styling (CSS classes, typography)
- Monaco editor configuration specifics (editor options beyond basic setup)
- Error handling for file read/write failures

## Deferred Ideas

None — discussion stayed within Phase 3 scope.
