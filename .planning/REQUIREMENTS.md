# Requirements: GSD UI

**Defined:** 2026-04-13
**Core Value:** 让开发者能在一个界面里看清楚"正在做什么、下一步做什么、做了什么"，而不用在终端和文件管理器之间反复切换。

## v1 Requirements

### Foundation (FOUND)

- [x] **FOUND-01**: 用户启动时应用自动检测 `claude` CLI 是否已安装（运行 `claude --version`）
- [x] **FOUND-02**: 若 CLI 未安装，显示安装引导页面而非主界面
- [x] **FOUND-03**: 用户可通过目录选择对话框指定 GSD 项目根目录
- [x] **FOUND-04**: 应用记住上次打开的项目路径，下次启动自动恢复

### Command Execution (CMD)

- [ ] **CMD-01**: 用户可看到所有 GSD 命令的按钮列表，每个按钮带命令说明
- [ ] **CMD-02**: 每个命令按钮有明确的状态显示：空闲（默认）、运行中（spinner）、成功（绿色）、失败（红色）
- [ ] **CMD-03**: 用户可取消正在执行的命令（发送终止信号给 Claude CLI 子进程）
- [ ] **CMD-04**: 命令执行时通过 Tauri shell plugin 调用 `claude /gsd-XXX` CLI，非直接调用 gsd-tools

### Output Streaming (OUT)

- [ ] **OUT-01**: Claude CLI 的 stdout/stderr 实时渲染到输出面板，延迟 ≤100ms（Rust 端 100ms 批处理 + React requestAnimationFrame 节流）
- [ ] **OUT-02**: ANSI 颜色码正确渲染（错误红色、成功绿色、警告黄色）
- [ ] **OUT-03**: 输出默认自动滚动到底部；用户向上滚动时暂停自动滚动，显示"跳到底部"按钮
- [ ] **OUT-04**: 用户可复制输出内容；用户可清除输出面板

### Progress & State Views (PROG)

- [ ] **PROG-01**: 显示所有阶段列表，每个阶段带完成状态和进度百分比，当前阶段高亮
- [ ] **PROG-02**: 用户可展开某个阶段，查看其中所有 Plan 及各 Plan 的完成情况（PLAN.md 存在、SUMMARY.md 是否已有）
- [ ] **PROG-03**: 显示当前会话上下文（STATE.md 中的最近位置、阻塞项、关键决策）
- [ ] **PROG-04**: 显示注意事项面板：汇总未完成计划、STATE.md 阻塞项、需要关注的事项
- [ ] **PROG-05**: 进度数据通过 `node gsd-tools.cjs roadmap analyze` 和 `state-snapshot` 获取（JSON 输出），而非直接解析 Markdown

### File Management (FILE)

- [ ] **FILE-01**: 左侧文件树展示 `.planning/` 目录结构，支持折叠/展开，点击文件在主区域打开
- [ ] **FILE-02**: Markdown 文件默认以渲染模式显示（标题层级、表格、代码块语法高亮、front matter 可见）
- [ ] **FILE-03**: 用户可切换到 Monaco 编辑器模式对 `.planning/` 内的 Markdown 文件进行编辑，保存后写回磁盘
- [ ] **FILE-04**: 编辑模式下有未保存变更指示（标题栏圆点或保存按钮状态）
- [ ] **FILE-05**: 应用监听 `.planning/` 目录变更（文件增删改），自动刷新进度视图和文件树（防抖 500ms）

## v2 Requirements

### Performance & Insights

- **PERF-01**: 显示每个阶段的耗时统计（从 STATE.md 解析）
- **PERF-02**: 显示每个阶段修改的文件数量

### Enhanced Navigation

- **NAV-01**: 常用 GSD 命令绑定全局键盘快捷键（Cmd+P 等），按钮上显示快捷键提示
- **NAV-02**: 应用内设置页面（主题、项目路径、快捷键配置）

### Deep Drill-down

- **DRILL-01**: 阶段详情页显示每个 Plan 关联的需求 ID（从 REQUIREMENTS.md 交叉索引）
- **DRILL-02**: 阶段依赖关系可视化（解析 depends_on 字段，显示依赖链）

### Git Integration

- **GIT-01**: 文件树中显示 git 状态标记（修改、新增）
- **GIT-02**: 每个阶段显示最后一次提交的 hash 和摘要

## Out of Scope

| Feature | Reason |
|---------|--------|
| Token 消耗追踪 | Claude Code 没有公开的本地 token 日志 API，实现不可靠 |
| 多项目切换 | 增加 tab 管理复杂度，降低专注度；单项目已满足核心需求 |
| 团队/协作功能 | 个人工具，无需多用户支持 |
| 自动推进阶段 | 不应代替用户决策；自动化会破坏 GSD 状态机 |
| 完整交互式终端 | 仅流式展示 CLI 输出，不替代真正的终端模拟器 |
| Web / 云部署版本 | 纯桌面客户端，不考虑 Web 部署 |
| 自定义工作流定义 | 包装已有 GSD CLI，不添加工作流构建器 |
| Windows 仅支持 (Linux) | macOS + Windows 已是目标，Linux 可后续考虑 |

## Architecture Decision (Recorded)

| Concern | Approach |
|---------|----------|
| **状态展示数据源** | `node gsd-tools.cjs` — 快速、无 AI、输出结构化 JSON |
| **工作流命令执行** | `claude /gsd-XXX` — 通过 Tauri shell plugin 调用，stdout 流回 UI |

## Traceability

*Populated during roadmap creation (2026-04-13).*

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| CMD-01 | Phase 2 | Pending |
| CMD-02 | Phase 2 | Pending |
| CMD-03 | Phase 2 | Pending |
| CMD-04 | Phase 2 | Pending |
| OUT-01 | Phase 2 | Pending |
| OUT-02 | Phase 2 | Pending |
| OUT-03 | Phase 2 | Pending |
| OUT-04 | Phase 2 | Pending |
| PROG-01 | Phase 4 | Pending |
| PROG-02 | Phase 4 | Pending |
| PROG-03 | Phase 4 | Pending |
| PROG-04 | Phase 4 | Pending |
| PROG-05 | Phase 4 | Pending |
| FILE-01 | Phase 3 | Pending |
| FILE-02 | Phase 3 | Pending |
| FILE-03 | Phase 3 | Pending |
| FILE-04 | Phase 3 | Pending |
| FILE-05 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22/22 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-13*
*Last updated: 2026-04-13 after roadmap creation*
