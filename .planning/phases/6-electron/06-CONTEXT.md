# Phase 6 Context: Electron 迁移

## 迁移概述

将 GSD UI 从 Tauri v2 + React 迁移到 Electron + React + TypeScript。

## 迁移原因
用户选择 Electron 作为桌面框架。

## 技术栈对比

| 组件 | Tauri v2 (当前) | Electron (目标) |
|------|----------------|----------------|
| 桌面框架 | Tauri v2 (Rust) | Electron |
| 前端框架 | React 18 + TypeScript | React 18 + TypeScript (不变) |
| 构建工具 | Vite + Tauri CLI | Vite + Electron Builder |
| Shell 执行 | @tauri-apps/plugin-shell | electron + node 实现 |
| 文件系统 | @tauri-apps/plugin-fs | Node.js fs / electron fs |
| 对话框 | @tauri-apps/plugin-dialog | Electron dialog |
| 设置存储 | @tauri-apps/plugin-store | electron-store |
| 包大小 | ~10MB | ~150MB |

## 需要迁移的模块

### 1. 项目脚手架
- package.json (移除 Tauri CLI, 添加 Electron)
- vite.config.ts (调整 Electron 入口)
- main.ts → Electron main process
- preload.ts → Electron preload
- 删除 src-tauri/ 目录

### 2. 状态管理 (Stores)
- `src/stores/projectStore.ts` - 使用 electron-store
- `src/stores/uiStore.ts` - 使用 electron-store
- `src/stores/cliStore.ts` - 使用 Node.js child_process
- `src/stores/errorStore.ts` - 适配 Electron 错误处理
- `src/stores/fileStore.ts` - 使用 Node.js fs

### 3. 库层 (lib/)
- `src/lib/shell.ts` - 重写为 Node.js child_process
- `src/lib/gsd-tools.ts` - 保持不变 (Node.js 可直接运行)
- `src/lib/logger.ts` - 使用 electron-log
- `src/lib/errorHandler.ts` - 适配 Electron

### 4. Tauri API 替换
| 原 API | 替换方案 |
|--------|----------|
| @tauri-apps/api/core (invoke) | Electron IPC |
| @tauri-apps/plugin-shell | Node.js child_process |
| @tauri-apps/plugin-fs | Node.js fs |
| @tauri-apps/plugin-dialog | Electron dialog |
| @tauri-apps/plugin-store | electron-store |

### 5. 前端组件 (不变)
- src/components/ - shadcn/ui 组件
- src/views/ - 视图组件
- src/App.tsx - 主应用

## 迁移顺序

1. 创建 Electron 项目结构
2. 配置 Electron + Vite
3. 实现 Main Process (主进程)
4. 实现 Preload Script
5. 迁移 Stores (使用 electron-store)
6. 迁移 Shell 执行逻辑
7. 迁移文件系统操作
8. 迁移对话框
9. 调整构建配置
10. 测试和验证

## 风险评估

| 风险 | 影响 | 缓解 |
|------|------|------|
| 包大小增加 (~150MB) | 用户体验 | 考虑代码分割、优化依赖 |
| 安全模型差异 | 安全 | Electron 安全最佳实践 |
| IPC 通信复杂性 | 开发效率 | 使用 typed-ipc 模式 |

## 参考资源
- Electron 官方文档
- electron-vite (Vite + Electron 集成)
- electron-builder (打包工具)
