# Research Summary -- GSD UI

**Project:** GSD UI -- Tauri v2 + React desktop client wrapping the GSD workflow CLI
**Synthesized:** 2026-04-13
**Confidence:** MEDIUM-HIGH

---

## Recommended Stack

| Layer | Choice | Version | Notes |
|-------|--------|---------|-------|
| Desktop Framework | Tauri | v2.x | ~10MB bundle vs Electron's ~150MB; Rust backend for stable process management |
| Frontend Build | Vite | v5.x | Officially recommended; fast HMR for desktop dev workflow |
| Language | TypeScript | v5.x | Strict mode required for Tauri v2 + React |
| UI Framework | React | v18.x or v19.x | v19 requires `@monaco-editor/react@next` |
| State Management | Zustand | v5.x | ~1KB; flat store sufficient for file + CLI + UI state |
| Code Editor | @monaco-editor/react | v4.x | Zero-config; Markdown support built-in; `automaticLayout: true` required |
| File Tree | react-arborist | latest | Virtualized; customizable; best-maintained React tree lib |
| Terminal Output | @xterm/xterm + @xterm/addon-fit | v5.x | VS Code-proven; GPU-accelerated; handles ANSI natively |
| UI Components | shadcn/ui | latest | Copy-paste (not a package); Radix primitives + Tailwind CSS |
| Shell Access | @tauri-apps/plugin-shell | v2.x | First-party; event-based streaming stdout/stderr |
| FS Access | @tauri-apps/plugin-fs | v2.x | First-party; read/write/watch with capability-based security |
| Settings | @tauri-apps/plugin-store | v2.x | Persist project path, UI preferences |

---

## Table Stakes Features

These are the v1 must-haves. Missing any of them makes the product feel broken.

- **CLI detection and setup prompt** -- Detect `claude` CLI on launch; show clear install instructions if missing. Without this the app is dead on arrival.
- **Project path selection** -- Users point the app at their GSD project; remember last opened path.
- **Command execution panel** -- Trigger GSD commands (plan-phase, execute-phase, verify-work, etc.) with a button list. Each button has explicit states: idle, running, success, error. Cancel capability required.
- **Real-time output streaming** -- Output appears as produced (50-100ms batches); ANSI color codes rendered; auto-scroll with pause-on-user-scroll; copy-to-clipboard. This is the core value proposition and the highest-complexity feature.
- **Phase/progress view** -- List of phases with completion status, current phase highlighted, plan counts, progress bars matching STATE.md format.
- **File tree browser** -- Browse `.planning/` directory; Markdown/JSON/directory icons; click to preview.
- **Markdown file viewer** -- Rendered Markdown with heading hierarchy, code blocks, tables. Read mode default (Monaco edit mode is a v2 feature).

---

## Architecture Pattern

The app is a thin desktop wrapper around GSD CLI and `.planning/` file state. A Tauri v2 Rust backend handles all system access (process spawning, file I/O, settings) via first-party plugins, exposing a small set of custom commands and events. The React frontend uses Zustand stores for three concerns: project state (parsed `.planning/` data), CLI state (streaming output buffers), and UI state (active panel, editor mode). State lives in Rust (parsed files returned as JSON) or React (streaming output in memory), never serialized through IPC repeatedly. Key Tauri v2 specifics: plugin-based architecture (shell, fs, store are separate packages), capability-based permissions in `src-tauri/capabilities/`, and the `Channel`/`EventTarget` IPC system.

---

## Top 5 Risks

1. **Output streaming freezes the UI.** Rapid CLI output (hundreds of lines/second) floods the React event queue and freezes rendering. Mitigation: batch on the Rust side (every 100ms or 50 lines), throttle React state updates with `requestAnimationFrame`, and virtualize the terminal panel with `@tanstack/react-virtual`. This must be designed before writing any streaming code.

2. **Monaco Editor fails to load due to CSP violations.** Monaco's vscode-loader historically relied on `eval()`. Without `'unsafe-eval'` in CSP and `'unsafe-inline'` in style-src, Monaco renders blank or throws console errors. Mitigation: configure CSP explicitly in `tauri.conf.json` with all required directives before integrating Monaco.

3. **Tauri v2 permission system is completely different from v1.** The allowlist system is gone. Every plugin, window, and command needs explicit capability declarations in `src-tauri/capabilities/`. Without correct capabilities, the webview cannot reach the Rust backend at all. Mitigation: scaffold capabilities files in Phase 1 and verify every plugin permission before proceeding.

4. **Shell plugin is not included by default.** `@tauri-apps/plugin-shell` (JS) and `tauri-plugin-shell` (Rust) must be installed and initialized separately. The FS plugin's `watch` function requires the `features = ["watch"]` Cargo flag. Either oversight causes silent failures at runtime. Mitigation: document plugin installation checklist and verify each plugin is initialized in `main.rs`.

5. **Cross-platform path handling.** Windows uses backslash separators; hardcoding forward slashes breaks on Windows. File watching events differ between macOS FSEvents and Windows ReadDirectoryChangesW. Mitigation: use `@tauri-apps/api/path` for all path operations (`join()`, `normalize()`), test file watching on both platforms, and debounce watchers with 500ms delay.

---

## Build Order Recommendation

1. **Phase 1: Scaffold and Foundation** -- Set up Tauri v2 + React + TypeScript via `npm create tauri-app`. Install and initialize all plugins (shell, fs with watch feature, store). Create capability files with all required permissions. Configure CSP for Monaco. Verify the shell plugin can spawn a process end-to-end. Wire a basic React layout (sidebar + main panel shell). This phase establishes correct permissions and plugin configuration -- fixing mistakes here is cheap; fixing them later is expensive.

2. **Phase 2: CLI Execution and Output Streaming** -- Implement CLI detection (`check_claude_installed`). Build the command execution panel with explicit state machine (idle/running/success/error). Implement real-time output streaming with Rust-side batching (100ms or 50-line windows) and React-side throttling (`requestAnimationFrame`). Add virtualized terminal output panel. Implement kill/cancel functionality. This is the highest-value, highest-complexity phase. Design the batching strategy before writing streaming code.

3. **Phase 3: File Browsing and Editing** -- Build the file tree component (react-arborist) showing `.planning/` structure. Implement file preview (rendered Markdown via react-markdown). Add Monaco editor integration with read/edit toggle. Wire file saves via Tauri fs plugin. Implement file watching with debounced refresh (500ms delay). By this phase the path handling patterns from Phase 2 should be established.

4. **Phase 4: Roadmap and State** -- Parse `ROADMAP.md` and phase files into structured state. Build the phase/progress view with status indicators and progress bars. Aggregate project state from file parsing and gsd-tools output. Wire file watcher to trigger state reload. Display current phase and resume context from `STATE.md`.

5. **Phase 5: Polish and Distribution** -- Error handling for all failure modes (CLI not found, file permission denied, process kill failures, window close during execution). Settings persistence (recent project path, UI preferences). Cross-platform testing (macOS + Windows). Windows code signing (acquire certificate early; configure in CI, not at release time).

---

## Key Decisions Needed

1. **React 18 or 19?** React 19 requires `@monaco-editor/react@next` for Monaco compatibility. React 18 works with stable Monaco v4. Choose based on stability vs. future-proofing trade-off.

2. **xterm.js vs custom scroll log?** xterm.js handles ANSI escape codes natively and is the SOTA choice, but adds complexity and bundle size. If `claude` CLI output is plain text (no escape codes), a custom scroll container is simpler. Decide based on whether ANSI color codes appear in real GSD output.

3. **Monaco vs lighter editor?** Monaco is heavy (~5MB). For a simple Markdown viewer/editor, alternatives like `@uiw/react-md-editor` or a `<textarea>` with preview may suffice. Monaco is the right choice if editing is a first-class use case.

4. **Shell plugin scope for `claude` CLI.** If `claude` is in PATH, the plugin works without scope. If restricted, a scope with `"cmd": "claude"` must be defined. Validate PATH availability during the CLI detection feature.

5. **gsd-tools.cjs execution path.** Can these scripts be invoked directly via shell plugin (`claude run node gsd-tools.cjs ...`) or do they need special handling? The scripts need validation to confirm the invocation pattern.

6. **Monaco CSP worker strategy.** Local worker bundling avoids `unsafe-eval` but requires webpack/vite configuration. CDN loading via `http://` is simpler but requires `unsafe-eval`. Choose based on how strict the deployment environment's CSP needs to be.

---

## Research Flags

The following areas may need deeper research during their respective phases:
- **Phase 2:** ANSI escape code stripping in Rust (if custom terminal is used)
- **Phase 3:** FSEvents event coalescing behavior with specific editors (VS Code, Zed, etc.)
- **Phase 5:** GitHub Actions CI/CD signing workflow with certificate secrets management

The following have well-documented patterns and are unlikely to need additional research:
- Tauri v2 plugin setup, capabilities, IPC (official docs are comprehensive)
- Monaco Editor CSP configuration (known issues documented in Monaco GitHub)
- xterm.js streaming integration (standard API, VS Code reference implementation)
- Zustand store patterns (well-established in the React ecosystem)
