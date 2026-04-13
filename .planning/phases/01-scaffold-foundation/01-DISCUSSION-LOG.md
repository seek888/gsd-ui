# Phase 1: Scaffold + Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 1-scaffold-foundation
**Areas discussed:** App Layout, Setup Experience

---

## App Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed sidebar | 左侧固定图标+文字导航栏，点击切换主内容区（Linear/VS Code 惯例） | ✓ |
| Top tabs | 顶部 Tab 切换，无左侧栏 | |
| Top bar + left menu | 顶部水平栏 + 左下拉菜单 | |

**User's choice:** Fixed sidebar
**Notes:** Consistent with developer tool conventions

### Navigation items

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard（首页总览） | 主页，显示项目概览、当前阶段、注意事项 | ✓ |
| Roadmap（阶段进度） | 阶段列表视图，显示所有阶段的进度和完成状态 | ✓ |
| Terminal（命令输出） | 命令面板 + 实时输出终端 | ✓ |
| Documents（文档/编辑器） | 文档浏览和 Monaco 编辑器 | ✓ |
| Settings（设置） | 项目设置 | |

**User's choice:** Dashboard, Roadmap, Terminal, Documents
**Notes:** Settings deferred — accessible from Dashboard or header icon later

### Sidebar width

| Option | Description | Selected |
|--------|-------------|----------|
| Narrow (48px) | 只显示图标，hover 显示文字提示 | |
| Standard (200px) | 显示图标 + 文字标签 | ✓ |
| Wide (240px) | 图标 + 文字 + 快捷键 | |

**User's choice:** Standard (200px)

### Shell scope

| Option | Description | Selected |
|--------|-------------|----------|
| Complete App Shell | 完整侧边栏建好，内容区留空但框架完整 | ✓ |
| Core Setup Only | 仅 CLI 检测和项目路径选择，Shell 在 Phase 2 搭 | |

**User's choice:** Complete App Shell

---

## Setup Experience

### CLI not found

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen welcome page | 首次启动时显示全屏欢迎页（图标 + 说明 + 安装指引） | ✓ |
| Inline main app | 直接进入主界面，相关区域显示引导横幅/遮罩 | |

**User's choice:** Full-screen welcome page

### Project path selection

| Option | Description | Selected |
|--------|-------------|----------|
| Remember last project | 记住上次项目，自动打开。Settings 可改。 | ✓ |
| Select every time | 启动时先选项目 | |

**User's choice:** Remember last project

---

## Claude's Discretion

- Sidebar 内 Dashboard 默认内容（Phase 4 完成后填充进度数据）
- Terminal 和 Documents 的容器框架（空状态设计）
- Welcome page 的具体文案和图标风格
- Settings 后续作为 header 图标还是 Dashboard 入口

