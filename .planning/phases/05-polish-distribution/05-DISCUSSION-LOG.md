# Phase 5: Polish + Distribution - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-14
**Phase:** 05-polish-distribution
**Areas discussed:** 错误处理策略

---

## 错误处理策略

### 错误级别

| Option | Description | Selected |
|--------|-------------|----------|
| 静默重试 | 自动重试 1-3 次，不通知用户，失败后才显示错误 | |
| 立即通知 | 第一次失败就显示错误消息给用户 | |
| 分级处理 | 某些错误自动重试（如网络超时），某些立即提示用户（如权限问题） | ✓ |

**User's choice:** 分级处理

### 错误显示

| Option | Description | Selected |
|--------|-------------|----------|
| Toast 通知 | 右上角弹出通知，几秒后自动消失（适合非关键错误） | |
| 模态对话框 | 居中弹窗，需要用户点击确认（适合阻止操作的严重错误） | |
| 内联消息 | 在相关位置显示错误条/文字（适合上下文相关的错误） | |
| 混合方式 | 根据错误严重程度使用不同展示方式 | ✓ |

**User's choice:** 混合方式

### 自动重试

| Option | Description | Selected |
|--------|-------------|----------|
| 网络相关 | gsd-tools CLI 超时、网络请求失败等 | ✓ |
| 文件系统暂时性 | 文件被其他进程占用导致的临时访问失败 | |
| 进程相关 | 子进程启动失败、进程意外终止 | ✓ |

**User's choice:** 网络相关, 进程相关

### 错误日志

| Option | Description | Selected |
|--------|-------------|----------|
| 仅控制台 | 只在开发者控制台输出日志（用于调试） | |
| 文件日志 | 写入到日志文件（用户目录下的 .gsd-ui/logs/） | |
| 两者都记录 | 控制台 + 文件日志，便于问题诊断 | ✓ |

**User's choice:** 两者都记录

### 显示映射

| Option | Description | Selected |
|--------|-------------|----------|
| CLI 未安装 | 关键错误，阻止所有功能 → Modal 模态对话框 | |
| 文件权限拒绝 | 阻止文件操作 → Modal 模态对话框 | |
| 进程超时 | 可重试的错误 → Toast 轻量通知 | ✓ |
| 窗口关闭时执行 | 上下文相关，在执行区域显示 → Inline 内联 | |

**User's choice:** 进程超时（其他使用默认映射）

---

## Claude's Discretion

Areas where user deferred to Claude:
- 设置持久化范围 — 具体哪些设置需要保存
- 构建自动化 — CI/CD 配置策略
- 代码签名策略 — 自签名 vs 购买证书
- 应用图标设计 — 自定义 vs 默认

## Deferred Ideas

None — discussion stayed within Phase 5 scope.
