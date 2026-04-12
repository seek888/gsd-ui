# Pitfalls Research: GSD UI (Tauri v2 + React + Monaco)

**Domain:** Desktop application -- real-time CLI output streaming, file editing, file watching
**Researched:** 2026/04/13
**Overall confidence:** MEDIUM-HIGH (official Tauri docs + published issues; some areas like Monaco CSP webview-specific behavior rely on community reports rather than Tauri-specific docs)

---

## Critical Gotchas

Things that WILL break you if you do not know about them upfront.

### 1. Tauri v2 Completely Rewrote the Permission System

**What goes wrong:** Applications fail to access any system resources with cryptic permission errors. The v1 allowlist system is gone entirely.

**Why it happens:** Tauri v2 replaced the allowlist (`tauri.conf.json` `allowlist` block) with a capability-based system. Capability files live in `src-tauri/capabilities/` as JSON or TOML files.

**Consequences:** Every plugin, window, and command access needs explicit capability declaration. Without it, the webview simply cannot reach the Rust backend.

**Prevention:** Create capability files for every window. The minimal capability for the main window:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "main-capability",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:event:default",
    "core:window:default",
    "core:app:default",
    "fs:default",
    "shell:allow-execute",
    "shell:allow-spawn",
    "shell:allow-kill",
    "fs:allow-read-dir",
    "fs:allow-watch"
  ]
}
```

Run `npm run tauri migrate` to auto-migrate many v1 configurations, but manual review is still required for the permission system changes.

**Sources:**
- [Tauri v2 Capabilities Overview](https://v2.tauri.app/security/capabilities/) -- HIGH confidence (official docs)
- [Tauri v1 to v2 Migration](https://v2.tauri.app/start/migrate/from-tauri-1/) -- HIGH confidence (official docs)

---

### 2. Monaco Editor Requires `'unsafe-eval'` in CSP

**What goes wrong:** Monaco Editor fails to load with CSP violations, or workers do not initialize, producing blank editors and console errors like "Refused to evaluate a string as JavaScript".

**Why it happens:** Monaco's internal vscode-loader historically relied on `eval()` and `new Function()` for loading worker scripts. While a fallback to `importScripts` was added in 2021, enterprise CSP configurations with strict `script-src` directives still break Monaco.

**Prevention:** Explicitly configure CSP in `tauri.conf.json`:

```json
{
  "app": {
    "security": {
      "csp": {
        "default-src": "'self' customprotocol: asset:",
        "script-src": "'self' 'unsafe-eval' blob:",
        "worker-src": "'self' blob:",
        "style-src": "'self' 'unsafe-inline'",
        "font-src": "'self' data:",
        "connect-src": "ipc: http://ipc.localhost"
      }
    }
  }
}
```

**Additional Monaco CSP requirements:**
- `'unsafe-inline'` in `style-src` -- Monaco generates inline styles (this was a reported issue as recently as June 2025)
- `worker-src blob:` -- web workers use blob URLs
- `font-src data:` -- Monaco loads codicon fonts from data URIs

**Alternative:** Bundle Monaco workers locally using `MonacoEnvironment.getWorker()` with `new URL(..., import.meta.url)` to avoid blob URLs and potentially avoid `unsafe-eval` if the vscode-loader fallback works.

**Sources:**
- [Monaco Editor Issue #2488 -- unsafe-eval CSP](https://github.com/microsoft/monaco-editor/issues/2488) -- HIGH confidence (official repo issue, resolved 2021)
- [Monaco Editor Issue #4927 -- inline styles CSP violation](https://github.com/microsoft/monaco-editor/issues/4927) -- HIGH confidence (official repo issue, reported June 2025)
- [Tauri CSP Documentation](https://v2.tauri.app/security/csp/) -- HIGH confidence (official docs)

---

### 3. Shell Plugin is Not Included by Default -- Must Add as a Plugin

**What goes wrong:** Calling `Command` from JavaScript fails with "Command not found" or module import errors. The shell plugin is not part of Tauri's core.

**Why it happens:** Tauri v2 extracted the shell functionality into `@tauri-apps/plugin-shell` (JavaScript) and `tauri-plugin-shell` (Rust). It is not included in the default Tauri app scaffold.

**Prevention:** Install both sides:

```bash
# JavaScript side
npm install @tauri-apps/plugin-shell

# Rust side (in src-tauri/Cargo.toml)
tauri-plugin-shell = "2"
```

Then initialize in `main.rs`:
```rust
use tauri_plugin_shell::ShellExt;
app.plugin(tauri_plugin_shell::init())?;
```

Add capabilities for shell operations:
```json
{
  "permissions": [
    "shell:allow-execute",
    "shell:allow-spawn",
    "shell:allow-kill",
    "shell:allow-stdin-write"
  ]
}
```

**Sources:**
- [Tauri Shell Plugin](https://v2.tauri.app/plugin/shell/) -- HIGH confidence (official docs)

---

### 4. File Watching Requires Explicit Cargo Feature Flag

**What goes wrong:** The `watch` function is undefined at runtime, or the file system plugin silently fails to emit change events.

**Why it happens:** The `watch` functionality is gated behind a Cargo feature flag that is not enabled by default.

**Prevention:** Enable the feature in `src-tauri/Cargo.toml`:

```toml
[dependencies.tauri-plugin-fs]
version = "2"
features = ["watch"]
```

And grant the permission in capabilities:
```json
"permissions": [
  "fs:allow-watch",
  "fs:deny-watch"
]
```

**Sources:**
- [Tauri File System Plugin -- Watch](https://v2.tauri.app/plugin/file-system/) -- HIGH confidence (official docs)

---

### 5. Streaming Stdout Without Batching Will Freeze the UI

**What goes wrong:** React UI becomes completely unresponsive as thousands of `stdout` events per second flood the event queue, each triggering a re-render.

**Why it happens:** When `claude` CLI outputs rapidly (e.g., syntax-highlighted terminal output, progress bars using ANSI escape codes), each line becomes a separate event. At 100+ lines per second, React's reconciliation cycle cannot keep up.

**Prevention:** Batch incoming stream data on the Rust side before emitting events:

```rust
use tauri::{AppHandle, Emitter, Runtime};
use std::io::{BufRead, BufReader};
use std::process::{Command as StdCommand, Stdio};
use std::sync::mpsc::{channel, Sender};
use std::thread;
use std::time::Duration;

struct StreamState {
    buffer: String,
    last_emit: std::time::Instant,
}

pub fn spawn_claude_stream<R: Runtime>(
    app: AppHandle<R>,
    args: Vec<String>,
) -> Result<(), String> {
    let mut child = StdCommand::new("claude")
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    let stdout = child.stdout.take().unwrap();
    let (tx, rx) = channel::<String>();

    // Spawn a thread to read and buffer stdout
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        let mut state = StreamState {
            buffer: String::new(),
            last_emit: std::time::Instant::now(),
        };
        for line in reader.lines() {
            if let Ok(line) = line {
                state.buffer.push_str(&line);
                state.buffer.push('\n');
                // Emit every 100ms or every 50 lines, whichever comes first
                if state.last_emit.elapsed() > Duration::from_millis(100)
                    || state.buffer.lines().count() >= 50
                {
                    let _ = tx.send(state.buffer.clone());
                    state.buffer.clear();
                    state.last_emit = std::time::Instant::now();
                }
            }
        }
        // Flush remaining buffer
        if !state.buffer.is_empty() {
            let _ = tx.send(state.buffer);
        }
    });

    // On the main thread, emit batched events
    std::thread::spawn(move || {
        while let Ok(data) = rx.recv() {
            let _ = app.emit("claude-output", data);
        }
        let _ = app.emit("claude-exit", ());
    });

    Ok(())
}
```

On the React side, throttle React state updates:
```tsx
const outputRef = useRef<string>("");
const pendingUpdate = useRef(false);

useEffect(() => {
  const unlisten = listen<string>("claude-output", (event) => {
    outputRef.current += event.payload;
    if (!pendingUpdate.current) {
      pendingUpdate.current = true;
      requestAnimationFrame(() => {
        setOutput(outputRef.current);
        pendingUpdate.current = false;
      });
    }
  });
  return () => { unlisten.then(fn => fn()); };
}, []);
```

**Sources:**
- [Tauri Event API](https://v2.tauri.app/reference/javascript/api/namespaceevent/) -- HIGH confidence (official docs)
- General React performance knowledge -- MEDIUM confidence

---

## Platform-Specific Issues

### macOS vs Windows Differences

#### 6. Path Separators -- Always Use Tauri Path API

**Issue:** Windows uses backslash (`\`), Unix uses forward slash (`/`). Hardcoding either causes failures on the other platform.

**Prevention:** Use Tauri's path module exclusively for all path operations:

```typescript
import { join, resolve, normalize } from "@tauri-apps/api/path";

// Good: cross-platform
const planningPath = await join(projectRoot, ".planning", "ROADMAP.md");

// Bad: will break on Windows
const badPath = projectRoot + "/.planning/ROADMAP.md";
```

Key functions: `join()`, `normalize()`, `resolve()`. Access platform separator via `sep()` and `delimiter()` if needed.

**Additional consideration:** On Windows, the `$RESOURCE` path requires admin permissions for writes. The `$HOME` scope does not automatically cover the current working directory -- it must be explicitly allowlisted.

**Sources:**
- [Tauri Path API](https://v2.tauri.app/reference/javascript/api/namespacepath/) -- HIGH confidence (official docs)
- [Tauri FS Plugin Scopes](https://v2.tauri.app/plugin/file-system/) -- HIGH confidence (official docs)

---

#### 7. File Watching on macOS Uses FSEvents (Subtly Different from inotify)

**Issue:** File watching behaviors differ between macOS (FSEvents) and Windows (ReadDirectoryChangesW). Events may fire differently for:
- File saves that involve rename-then-write (common with editors like VS Code)
- symlink changes
- Very rapid successive changes

**Prevention:**
- Use `watch` (debounced) rather than `watchImmediate` to coalesce rapid events
- Set a reasonable `delayMs` (500ms is the default and a good starting point):
  ```typescript
  await watch(path, handler, {
    baseDir: BaseDirectory.Home,
    delayMs: 500,
    recursive: true, // Enable for .planning/ subdirectories
  });
  ```
- Handle potential duplicate events in your event handler
- Test on both platforms during development, not just one

**Additional macOS consideration:** File access permissions in macOS sandbox may require user granting access to specific directories. When the user selects a project directory, use the Open Dialog with `canOpen: true` to properly prompt for access.

**Sources:**
- [Tauri File System Plugin -- Watch](https://v2.tauri.app/plugin/file-system/) -- HIGH confidence (official docs)
- General platform knowledge -- MEDIUM confidence

---

#### 8. Windows SmartScreen -- New Certificates Get Warnings

**Issue:** On Windows, downloaded executables signed with a newly-issued OV (Organization Validated) certificate trigger SmartScreen warnings until reputation builds (weeks to months). This can alarm users.

**Options:**

| Certificate Type | Cost | SmartScreen Behavior | Recommended For |
|-----------------|------|---------------------|-----------------|
| EV (Extended Validation) | Higher (~300+/year) | Immediate trust, no warnings | Distribution via direct download |
| OV (Organization Validated) | Lower (~100-200/year) | Warnings until reputation builds | Internal/dev tools, or paired with Microsoft Store listing |
| Unsigned | Free | SmartScreen + OS warnings | Development only, NOT for distribution |

**Prevention:** For a personal developer tool like GSD UI:
1. Use an OV certificate (cheaper, sufficient for dev tools)
2. Or submit to Microsoft Store (reduces SmartScreen warnings after review)
3. Or use EV if budget allows and avoiding user friction is critical
4. Set up signing early in CI -- do not sign for the first time on a release build

Configuration in `tauri.conf.json`:
```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_THUMBPRINT",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.comodoca.com"
    }
  }
}
```

**Note:** Signing is NOT required to execute the application. It is only required for distribution and to avoid SmartScreen warnings. Users can bypass the warning by clicking "More info" and "Run anyway."

**Sources:**
- [Tauri Windows Code Signing](https://v2.tauri.app/distribute/sign/windows/) -- HIGH confidence (official docs)
- [Tauri Windows Installer Options](https://v2.tauri.app/distribute/windows-installer/) -- HIGH confidence (official docs)

---

## Performance Traps

Things that seem fine until scale.

#### 9. Rendering Thousands of Log Lines Without Virtualization

**Issue:** Storing all CLI output in a React state array and rendering each line as a DOM element causes exponential slowdowns. At 5,000 lines, the DOM has 5,000+ nodes. Scrolling becomes jerky. Memory usage climbs.

**Prevention:** Use a virtualized list for the terminal output panel. Options:
- `@tanstack/react-virtual` -- lightweight, works well for chat-like scrolling
- `react-window` -- proven, smaller API
- Custom implementation using CSS `overflow` + `translateY` positioning

Even with batching (Pitfall #5), the accumulated DOM nodes will eventually cause issues. Virtualization ensures O(visible lines) DOM nodes regardless of total output size.

**Implementation approach:**
```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

const rowVirtualizer = useVirtualizer({
  count: lines.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 20, // line height in px
  overscan: 20, // render 20 extra rows above/below viewport
});

return (
  <div ref={scrollRef} style={{ overflow: "auto", height: "100%" }}>
    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <div key={virtualRow.key} style={{
          position: "absolute",
          top: `${virtualRow.start}px`,
          height: `${virtualRow.size}px`,
        }}>
          {lines[virtualRow.index]}
        </div>
      ))}
    </div>
  </div>
);
```

**Sources:**
- General React performance knowledge -- MEDIUM confidence

---

#### 10. Monaco Editor with Very Large Files

**Issue:** Monaco Editor is designed for code editing, not log viewing. Opening a 10,000+ line file in Monaco can cause:
- Slow initial render
- High memory usage
- Stuttering during scrolling

**Prevention:**
- Use Monaco specifically for the Markdown editor (PLAN files, PROJECT.md)
- Use a dedicated terminal/console component for log output (see Pitfall #9)
- If Monaco must handle large files, configure `automaticLayout: true` carefully and consider setting `readOnly: true` for log viewing mode
- Set `scrollBeyondLastLine: false` and limit `lineNumbers` rendering for large files

**Sources:**
- General Monaco Editor knowledge -- MEDIUM confidence

---

#### 11. File System Watch Handler Does Too Much Work

**Issue:** The file watcher triggers on every save. If the handler re-reads the entire roadmap, re-parses all phases, and re-renders everything, the app becomes sluggish during active editing.

**Prevention:** Debounce the handler and use shallow comparison:

```typescript
const debouncedHandler = useMemo(
  () => debounce((event: WatchEvent) => {
    // Only refresh what changed
    if (event.paths.some(p => p.includes("ROADMAP.md"))) {
      setRoadmapNeedsRefresh(true);
    }
    if (event.paths.some(p => p.includes("STATE.md"))) {
      setStateNeedsRefresh(true);
    }
  }, 300),
  []
);
```

Only reload files that changed, not the entire project state.

**Sources:**
- General React performance knowledge -- MEDIUM confidence

---

#### 12. Tauri IPC Event Memory Leaks from Unlisten

**Issue:** Event listeners registered in `useEffect` hooks are never cleaned up when the component unmounts or when the listener callback changes. Each re-render registers a new listener without removing the old one.

**Prevention:** Always store and call the unlisten function:

```typescript
useEffect(() => {
  let unlisten: (() => void) | undefined;

  listen("claude-output", (event) => {
    // handler
  }).then(fn => { unlisten = fn; });

  return () => {
    if (unlisten) unlisten();
  };
}, []);
```

Or use a helper hook:
```typescript
function useTauriEvent<T>(event: string, handler: (payload: T) => void) {
  useEffect(() => {
    const unlistenPromise = listen<T>(event, (e) => handler(e.payload));
    return () => { unlistenPromise.then(fn => fn()); };
  }, [event, handler]);
}
```

**Sources:**
- [Tauri Event API -- listen returns UnlistenFn](https://v2.tauri.app/reference/javascript/api/namespaceevent/) -- HIGH confidence (official docs)

---

## Prevention Strategies

Summarized checklist organized by category.

### Tauri v2 Core
- [ ] Migrate from v1: run `npm run tauri migrate`, then manually audit all capability files
- [ ] Add `tauri-plugin-shell` explicitly (not included by default)
- [ ] Add `tauri-plugin-fs` with `features = ["watch"]` for file watching
- [ ] Create capability files in `src-tauri/capabilities/` for every window
- [ ] Use `@tauri-apps/api/core` instead of `@tauri-apps/api/tauri` (renamed in v2)
- [ ] Use `@tauri-apps/api/webviewWindow` instead of `@tauri-apps/api/window` (renamed in v2)

### Monaco Editor
- [ ] Add `'unsafe-eval'` and `'unsafe-inline'` to CSP in `tauri.conf.json`
- [ ] Add `worker-src blob:` and `font-src data:` to CSP
- [ ] Serve Monaco over http:// (not file://) to enable web workers
- [ ] Consider local worker bundling to reduce CSP requirements

### CLI Streaming
- [ ] Batch stdout lines on the Rust side (every 100ms or 50 lines)
- [ ] Throttle React state updates with `requestAnimationFrame`
- [ ] Always handle the `claude-exit` event to clean up state
- [ ] Set a timeout for long-running processes (e.g., 30 minutes)
- [ ] Implement kill handling: store the child PID and call `.kill()` on user request

### File System
- [ ] Always use `@tauri-apps/api/path` for path operations (never string concatenation)
- [ ] Use `join()`, `normalize()`, `resolve()` -- never hardcode `/` or `\`
- [ ] Allowlist specific paths in capability scopes, not broad `$HOME/*`
- [ ] Set `recursive: true` in watch options for subdirectory watching
- [ ] Use `delayMs: 500` (or similar) for debounced watching
- [ ] Handle duplicate events from the file watcher

### Performance
- [ ] Virtualize the terminal output panel (thousands of lines)
- [ ] Virtualize the file tree if the project has many files
- [ ] Debounce file watcher handlers (300ms minimum)
- [ ] Always unlisten from Tauri events in useEffect cleanup
- [ ] Split large roadmap state into granular React state for targeted re-renders

### Windows Distribution
- [ ] Acquire a code signing certificate before first release build
- [ ] Prefer EV certificate for immediate SmartScreen trust
- [ ] Set `digestAlgorithm: "sha256"` and include a `timestampUrl`
- [ ] Configure signing in CI using Base64-encoded certificate secrets
- [ ] Test the installer on a clean Windows VM before distribution

---

## Phase Mapping

Which phase should address each pitfall.

| Pitfall | Phase | Rationale |
|---------|-------|-----------|
| Capability system migration (v1 to v2) | Phase 1 (Scaffold) | Foundation -- everything else depends on correct permissions |
| Shell plugin setup | Phase 1 (Scaffold) | Required for the core GSD command execution feature |
| FS plugin with watch feature | Phase 1 (Scaffold) | Required for .planning directory watching |
| Monaco CSP configuration | Phase 1 (Scaffold) | Monaco must work before any editing features |
| Monaco workers local bundling | Phase 2 (Editor) | Refinement of Monaco setup, not blocking |
| CLI streaming with batching (Rust side) | Phase 2 (CLI Integration) | Core feature of real-time output streaming |
| React state batching and throttling | Phase 2 (CLI Integration) | Performance foundation for the terminal view |
| Path API usage (no hardcoded separators) | Phase 2 (CLI Integration) | Required when reading .planning/ files |
| Virtualized terminal output | Phase 2 (CLI Integration) | Performance trap if not addressed with streaming |
| File watcher debouncing | Phase 3 (File Watching) | Core of the file watching feature |
| Event listener cleanup (unlisten) | Phase 2 (CLI Integration) | Cleanup patterns should be established early |
| Monaco large file handling | Phase 3 (File Watching) | Not an issue until watching + editing large files |
| macOS FSEvents vs Windows differences | Phase 3 (Cross-Platform Testing) | Platform-specific testing phase |
| Windows code signing | Phase 4 (Distribution) | Only needed when distributing builds |
| SmartScreen certificate type selection | Phase 4 (Distribution) | Business decision for distribution strategy |

**Phase ordering rationale:**
1. **Phase 1 (Scaffold)** must establish correct Tauri v2 configuration (capabilities, plugins, CSP) before any feature work. Wrong permissions are extremely hard to debug later.
2. **Phase 2 (CLI Integration)** should tackle streaming + React performance together. The batching strategy in Rust must be designed before the React event handlers are written.
3. **Phase 3 (File Watching)** addresses remaining file system concerns. By this phase, path handling patterns should be established.
4. **Phase 4 (Distribution)** handles Windows signing. Should not be attempted before the app is feature-complete.

**Research flags for future phases:**
- Phase 3: May need deeper research on FSEvents event coalescing behavior with specific editors
- Phase 4: May need deeper research on GitHub Actions CI/CD signing workflow with Azure Key Vault
- Phase 2: May need research on ANSI escape code stripping in Rust for clean terminal output rendering

---

## Appendix: Key Official Documentation URLs

| Topic | URL |
|-------|-----|
| Tauri v2 Capabilities | https://v2.tauri.app/security/capabilities/ |
| Tauri v1 to v2 Migration | https://v2.tauri.app/start/migrate/from-tauri-1/ |
| Shell Plugin | https://v2.tauri.app/plugin/shell/ |
| File System Plugin | https://v2.tauri.app/plugin/file-system/ |
| CSP Configuration | https://v2.tauri.app/security/csp/ |
| Event API | https://v2.tauri.app/reference/javascript/api/namespaceevent/ |
| Path API | https://v2.tauri.app/reference/javascript/api/namespacepath/ |
| Windows Code Signing | https://v2.tauri.app/distribute/sign/windows/ |
| Windows Installer | https://v2.tauri.app/distribute/windows-installer/ |
