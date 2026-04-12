# Architecture Research: GSD UI

**Project:** GSD UI -- Tauri v2 + React desktop client for GSD workflow
**Researched:** 2026-04-13
**Confidence:** MEDIUM-HIGH (verified with official docs, Tauri source code, and npm packages)

## Component Map

```
GSD UI
├── Tauri Backend (Rust)
│   ├── Shell Plugin (tauri-plugin-shell)
│   │   ├── Spawn Claude CLI processes
│   │   ├── Stream stdout/stderr via Channels
│   │   └── Track PIDs for kill/cancellation
│   ├── FS Plugin (tauri-plugin-fs)
│   │   ├── Read .planning/ files (readTextFile, readDir)
│   │   ├── Write edited .planning/ files (writeTextFile)
│   │   └── Watch files via notify crate (watch, watchImmediate)
│   ├── Store Plugin (tauri-plugin-store)
│   │   └── Persist app settings (recent project path, UI prefs)
│   └── Custom Commands (src-tauri/src/lib.rs)
│       ├── invoke_gsd_command() -- runs claude CLI with GSD commands
│       ├── parse_planning_files() -- parses .planning/ markdown to JSON
│       ├── get_roadmap_state() -- aggregates phase/project state
│       └── detect_claude_cli() -- checks if `claude` is installed
│
├── React Frontend
│   ├── App Shell
│   │   ├── Sidebar (FileTree)
│   │   ├── Main Panel (Dashboard | Roadmap | Editor)
│   │   └── Terminal Panel (streaming output)
│   ├── State Management (Zustand)
│   │   ├── projectStore -- .planning/ files, parsed state
│   │   ├── cliStore -- running processes, output buffer
│   │   └── uiStore -- active panel, editor state
│   ├── Monaco Editor Integration
│   │   └── @monaco-editor/react for .planning/ editing
│   └── Tauri API Bindings
│       ├── @tauri-apps/plugin-shell -- CLI spawning
│       ├── @tauri-apps/plugin-fs -- file operations
│       └── @tauri-apps/api/event -- listen/emit
│
└── External Tools
    ├── claude CLI -- GSD command execution
    └── gsd-tools.cjs -- roadmap analysis, state snapshots
```

## Data Flow

### Path 1: GSD Command Execution

```
User clicks command button
    → React: cliStore.startCommand('gsd-new-milestone', args)
    → Tauri invoke('run_gsd_command', { command, args })
    → Rust: shell.command("claude").args([...]).spawn()
    → Rust: Channel<JSCommandEvent> streams stdout/stderr lines
    → Frontend: command.stdout.on('data', line => cliStore.appendOutput(line))
    → UI: Terminal panel renders output in real-time
    → On completion: Terminated event with exit code
```

### Path 2: File Watching

```
App startup
    → Rust: notify::Watcher watches .planning/ directory
    → File change detected
    → Rust: Channel emits notify::Event
    → Frontend: projectStore.refreshFiles()
    → Tauri invoke('read_planning_files')
    → Rust: fs.readTextFile() for changed files
    → Frontend: projectStore.updateFiles() triggers re-render
```

### Path 3: Planning State Display

```
User opens Roadmap panel
    → React: projectStore.loadRoadmapState()
    → Tauri invoke('get_roadmap_state')
    → Rust: parse .planning/ROADMAP.md + phase/*.md files
    → Rust: optionally run gsd-tools.cjs roadmap analyze --json
    → Frontend: JSON state populates RoadmapView component
```

### Path 4: Monaco Editor Editing

```
User clicks file in FileTree
    → React: projectStore.openFile(path)
    → Tauri invoke('read_file', { path })
    → Rust: fs.readTextFile() returns content
    → React: MonacoEditor loads content
    → User edits and saves (Ctrl+S)
    → React: Tauri invoke('write_file', { path, content })
    → Rust: fs.writeTextFile() persists to disk
    → File watcher detects change → Path 2 triggers refresh
```

## Tauri Backend Structure

### Cargo.toml Dependencies

```toml
[dependencies]
tauri = { version = "2", features = ["devtools"] }
tauri-plugin-shell = "2"
tauri-plugin-fs = { version = "2", features = ["watch"] }
tauri-plugin-store = "2"
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
notify = "7"                    # Used by tauri-plugin-fs internally
notify-debouncer-full = "0.2"  # Debounced file watching
tokio = { version = "1", features = ["process", "io-util"] }
regex = "1"
log = "0.4"
env_logger = "0.11"
```

### Custom Rust Commands (src-tauri/src/lib.rs)

```rust
use tauri::{AppHandle, Manager, State};
use std::sync::Mutex;
use std::collections::HashMap;

// Process registry for cancellation
pub struct ProcessRegistry(pub Mutex<HashMap<u32, tokio::process::Child>>);

#[derive(Clone, serde::Serialize)]
pub struct CommandResult {
    pub pid: u32,
    pub success: bool,
}

#[tauri::command]
pub async fn run_gsd_command(
    app: AppHandle,
    shell: State<'_, tauri_plugin_shell::Shell<tauri::Wry>>,
    command: String,
    args: Vec<String>,
) -> Result<CommandResult, String> {
    // Build claude command with GSD skill invocation
    let full_args = build_gsd_args(command, args);

    let mut cmd = shell.command("claude");
    for arg in &full_args {
        cmd = cmd.arg(arg);
    }

    let (mut rx, child) = cmd.spawn()
        .map_err(|e| format!("Failed to spawn: {}", e))?;

    let pid = child.pid();
    let registry = app.state::<ProcessRegistry>();
    registry.0.lock().unwrap().insert(pid, child);

    // Stream events to frontend via Channel
    // (Handled by shell plugin's spawn command -- no custom channel needed here)

    Ok(CommandResult { pid, success: true })
}

#[tauri::command]
pub async fn kill_gsd_command(
    app: AppHandle,
    shell: State<'_, tauri_plugin_shell::Shell<tauri::Wry>>,
    pid: u32,
) -> Result<(), String> {
    // The shell plugin's kill command is sufficient
    // This custom command can be used for additional cleanup
    let registry = app.state::<ProcessRegistry>();
    registry.0.lock().unwrap().remove(&pid);
    Ok(())
}

#[tauri::command]
pub async fn read_planning_file(
    path: String,
) -> Result<String, String> {
    std::fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read {}: {}", path, e))
}

#[tauri::command]
pub async fn write_planning_file(
    path: String,
    content: String,
) -> Result<(), String> {
    std::fs::write(&path, content)
        .map_err(|e| format!("Failed to write {}: {}", path, e))
}

#[tauri::command]
pub async fn get_roadmap_state(
    project_path: String,
) -> Result<serde_json::Value, String> {
    // Parse ROADMAP.md and phase files
    // Return structured JSON for frontend
    let roadmap_path = format!("{}/.planning/ROADMAP.md", project_path);
    let content = std::fs::read_to_string(&roadmap_path)
        .map_err(|e| format!("Failed to read ROADMAP.md: {}", e))?;

    parse_roadmap(&content)
}

#[tauri::command]
pub fn check_claude_installed() -> bool {
    which::which("claude").is_ok()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::init())
        .manage(ProcessRegistry(Default::default()))
        .invoke_handler(tauri::generate_handler![
            run_gsd_command,
            kill_gsd_command,
            read_planning_file,
            write_planning_file,
            get_roadmap_state,
            check_claude_installed,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Capabilities Configuration (src-tauri/capabilities/default.json)

```json
{
  "$schema": "https://v2.tauri.app/schemas/desktop.schema.json",
  "identifier": "main-capability",
  "description": "Main window capability",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:allow-close",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    "core:window:allow-set-title",
    "core:window:allow-is-maximized",
    "core:window:allow-is-minimized",
    "core:window:allow-toggle-maximize",
    "shell:allow-spawn",
    "shell:allow-execute",
    "shell:allow-kill",
    "shell:allow-stdin-write",
    {
      "identifier": "shell:allow-execute",
      "allow": [
        {
          "name": "claude",
          "cmd": "claude",
          "sidecar": false
        },
        {
          "name": "exec-sh",
          "cmd": "sh",
          "args": ["-c", { "validator": "\\S+" }],
          "sidecar": false
        }
      ]
    },
    "fs:allow-read",
    "fs:allow-write",
    "fs:allow-exists",
    "fs:allow-mkdir",
    "fs:allow-remove",
    "fs:allow-rename",
    "fs:allow-copy-file",
    "fs:allow-read-dir",
    "fs:allow-read-file",
    "fs:allow-read-text-file",
    "fs:allow-write-file",
    "fs:allow-write-text-file",
    "fs:allow-watch",
    "fs:allow-unwatch",
    "fs:scope",
    {
      "identifier": "fs:scope",
      "allow": [
        { "path": "$PROJECT/*" },
        { "path": "$PROJECT/**" },
        { "path": "$HOME/.claude/**" }
      ]
    },
    "store:default"
  ]
}
```

## Frontend Architecture

### Component Tree

```
App
├── <Sidebar>
│   ├── <FileTree>
│   │   ├── <TreeNode> (recursive for directories)
│   │   └── <FileNode>
│   └── <CommandPalette>
│       └── <CommandButton> (one per GSD command)
├── <MainPanel>
│   ├── <DashboardView> (default)
│   │   ├── Project summary
│   │   ├── Current phase indicator
│   │   └── Command quick-access
│   ├── <RoadmapView>
│   │   ├── <PhaseCard> (one per phase)
│   │   └── <TaskList>
│   └── <EditorView>
│       └── <MonacoEditor>
│           ├── value: fileContent
│           ├── language: "markdown"
│           └── onChange: handleEdit
├── <TerminalPanel>
│   ├── <TerminalHeader> (command name, status, kill button)
│   └── <TerminalOutput> (scrollable, auto-scroll)
└── <StatusBar>
    ├── Claude CLI status
    └── File change indicator
```

### State Management (Zustand)

```typescript
// src/stores/projectStore.ts
import { create } from 'zustand';

interface PlanningFile {
  path: string;
  content: string;
  lastModified: number;
}

interface Phase {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
  tasks: Task[];
}

interface ProjectState {
  projectPath: string | null;
  files: Map<string, PlanningFile>;
  phases: Phase[];
  currentPhase: string | null;

  setProjectPath: (path: string) => void;
  loadRoadmapState: () => Promise<void>;
  refreshFiles: () => Promise<void>;
  updateFile: (path: string, content: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projectPath: null,
  files: new Map(),
  phases: [],
  currentPhase: null,

  setProjectPath: (path) => set({ projectPath: path }),

  loadRoadmapState: async () => {
    const { projectPath } = get();
    if (!projectPath) return;

    const state = await invoke('get_roadmap_state', { projectPath });
    set({
      phases: state.phases,
      currentPhase: state.currentPhase,
    });
  },

  refreshFiles: async () => {
    // Re-read all .planning/ files from disk
    // Called by file watcher callback
  },

  updateFile: async (path, content) => {
    await invoke('write_planning_file', { path, content });
    set((state) => {
      const files = new Map(state.files);
      files.set(path, { path, content, lastModified: Date.now() });
      return { files };
    });
  },
}));
```

```typescript
// src/stores/cliStore.ts
import { create } from 'zustand';
import { Command } from '@tauri-apps/plugin-shell';

interface CliState {
  runningProcesses: Map<number, {
    command: string;
    status: 'running' | 'completed' | 'killed';
    output: string[];
  }>;

  startCommand: (name: string, args: string[]) => Promise<number>;
  appendOutput: (pid: number, line: string) => void;
  killCommand: (pid: number) => Promise<void>;
  getOutput: (pid: number) => string[];
}

export const useCliStore = create<CliState>((set, get) => ({
  runningProcesses: new Map(),

  startCommand: async (name, args) => {
    const command = Command.create(name, args);

    command.stdout.on('data', (line) => {
      // Get PID from active processes (stored during spawn)
      // Append line to output buffer
    });

    command.stderr.on('data', (line) => {
      // Append to stderr output (or combine with stdout)
    });

    command.on('close', (data) => {
      // Update status to 'completed'
    });

    command.on('error', (error) => {
      // Handle error
    });

    const child = await command.spawn();
    const pid = child.pid;

    set((state) => {
      const processes = new Map(state.runningProcesses);
      processes.set(pid, {
        command: name,
        status: 'running',
        output: [],
      });
      return { runningProcesses: processes };
    });

    return pid;
  },

  appendOutput: (pid, line) => {
    set((state) => {
      const processes = new Map(state.runningProcesses);
      const proc = processes.get(pid);
      if (proc) {
        processes.set(pid, {
          ...proc,
          output: [...proc.output, line],
        });
      }
      return { runningProcesses: processes };
    });
  },

  killCommand: async (pid) => {
    const { Child } = await import('@tauri-apps/plugin-shell');
    const child = new Child(pid);
    await child.kill();
    set((state) => {
      const processes = new Map(state.runningProcesses);
      const proc = processes.get(pid);
      if (proc) {
        processes.set(pid, { ...proc, status: 'killed' });
      }
      return { runningProcesses: processes };
    });
  },

  getOutput: (pid) => {
    return get().runningProcesses.get(pid)?.output ?? [];
  },
}));
```

### File Watching Hook

```typescript
// src/hooks/useFileWatcher.ts
import { useEffect } from 'react';
import { watch } from '@tauri-apps/plugin-fs';
import { useProjectStore } from '../stores/projectStore';

export function useFileWatcher(projectPath: string | null) {
  const refreshFiles = useProjectStore((s) => s.refreshFiles);

  useEffect(() => {
    if (!projectPath) return;

    const planningPath = `${projectPath}/.planning`;

    let unwatch: (() => void) | undefined;

    (async () => {
      unwatch = await watch(
        planningPath,
        (event) => {
          console.log('File changed:', event.paths);
          refreshFiles();
        },
        { recursive: true, delayMs: 500 }
      );
    })();

    return () => {
      unwatch?.();
    };
  }, [projectPath, refreshFiles]);
}
```

### Monaco Editor Integration

```typescript
// src/components/MonacoEditor.tsx
import Editor, { OnMount } from '@monaco-editor/react';
import { useRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  path: string;
}

export function MonacoEditor({ value, onChange, path }: Props) {
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure Markdown language
    monaco.languages.markdown.setLanguageConfiguration({
      wordPattern: /([^\s]+)/,
    });

    // Custom keybinding for save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onChange(editor.getValue());
    });
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="markdown"
      language="markdown"
      value={value}
      onChange={(val) => onChange(val ?? '')}
      onMount={handleMount}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        wordWrap: 'on',
        lineNumbers: 'on',
        fontSize: 14,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
        // Monaco handles its own file protocol loading via CDN
        // No special configuration needed for Tauri webview
      }}
    />
  );
}
```

## Build Order

### Phase 1: Foundation (Rust backend + minimal React shell)

1. **Tauri project scaffolding** -- `npm create tauri-app@latest`
2. **Shell plugin integration** -- Spawn `echo "hello"` to verify streaming works
3. **FS plugin integration** -- Read a test file, write a test file
4. **Basic React layout** -- Sidebar + MainPanel shell (no real content)
5. **End-to-end: read file** -- React button -> Tauri invoke -> fs.readTextFile -> display

### Phase 2: CLI Execution

6. **Claude CLI detection** -- Custom `check_claude_installed` command
7. **Spawn Claude CLI** -- Use shell plugin's `Command.create().spawn()`
8. **Stream output to terminal** -- Wire `command.stdout.on('data')` to TerminalOutput
9. **Kill command** -- Wire kill button to `child.kill()`
10. **End-to-end: run GSD command** -- Full flow from button click to streamed output

### Phase 3: File Browsing & Editing

11. **File tree component** -- Recursive `<TreeNode>` using `fs.readDir`
12. **Monaco Editor integration** -- `@monaco-editor/react` with Markdown mode
13. **Open file in editor** -- Click file in tree -> load in Monaco
14. **Save file** -- Monaco onChange -> debounced `fs.writeTextFile`
15. **File watching** -- `fs.watch()` with 500ms debounce -> refresh tree

### Phase 4: Roadmap & State

16. **Parse ROADMAP.md** -- Custom Rust command or `gsd-tools.cjs roadmap analyze --json`
17. **RoadmapView component** -- Phase cards with status indicators
18. **Project state aggregation** -- Combine file parsing + gsd-tools output
19. **Auto-refresh on file change** -- File watcher triggers state reload

### Phase 5: Polish & Platform

20. **Error handling** -- Claude not installed, file permission denied, process kill failures
21. **Window management** -- Minimize, maximize, close buttons
22. **Settings persistence** -- `tauri-plugin-store` for recent project path
23. **macOS/Windows builds** -- Test on both platforms, fix platform-specific issues

## Integration Points

### Rust (Backend) <-> React (Frontend)

| Feature | Integration Method | Notes |
|---------|-------------------|-------|
| CLI stdout/stderr streaming | `Channel<JSCommandEvent>` via `Command.spawn()` | Plugin handles transport; React subscribes via `command.stdout.on('data')` |
| Kill running process | `Child.kill()` via shell plugin | No custom Rust command needed |
| Read .planning/ files | `invoke('read_planning_file', { path })` | Custom command wrapping `fs.readTextFile` |
| Write edited files | `invoke('write_planning_file', { path, content })` | Custom command wrapping `fs.writeTextFile` |
| File change notifications | `fs.watch()` via plugin-fs | Watcher is Rust-managed; events arrive in JS callback |
| Get roadmap state | `invoke('get_roadmap_state', { projectPath })` | Custom command; can shell out to `gsd-tools.cjs` |
| Check Claude installed | `invoke('check_claude_installed')` | Simple which::which check |
| Persist settings | `tauri-plugin-store` | No Rust command needed; JS API directly |

### Key Decision Points

**Sidecar vs Shell Command:** For GSD UI, use **shell command** (not sidecar). The `claude` CLI must be pre-installed on the user's system. A sidecar would embed a binary, which is unnecessary since Claude CLI is a user dependency.

**Events vs Channels:** For streaming CLI output, use **Channels** (built into shell plugin's spawn). For file change notifications, use **Events** (via fs plugin's watch). Channels are faster and ordered; Events are fire-and-forget for lifecycle signals.

**State location:** Keep project state in **Rust backend** (custom commands parse files and return JSON). Keep UI state in **React/Zustand**. This avoids serializing large file contents through the IPC layer repeatedly.

## Sources

- Tauri v2 IPC: [v2.tauri.app/concept/inter-process-communication/](https://v2.tauri.app/concept/inter-process-communication/) (HIGH confidence)
- Tauri commands: [v2.tauri.app/develop/calling-rust/](https://v2.tauri.app/develop/calling-rust/) (HIGH confidence)
- Tauri event system: [v2.tauri.app/develop/calling-frontend/](https://v2.tauri.app/develop/calling-frontend/) (HIGH confidence)
- Shell plugin (Rust source): [github.com/tauri-apps/tauri-plugin-shell@v2](https://github.com/tauri-apps/tauri-plugin-shell/tree/v2) (HIGH confidence)
- Shell plugin (JS API): npm `@tauri-apps/plugin-shell@2.3.5` (HIGH confidence)
- FS plugin (Rust source): [github.com/tauri-apps/tauri-plugin-fs@v2](https://github.com/tauri-apps/tauri-plugin-fs/tree/v2) (HIGH confidence)
- FS plugin (JS API): npm `@tauri-apps/plugin-fs@2.5.0` (HIGH confidence)
- Capabilities: [v2.tauri.app/security/capabilities/](https://v2.tauri.app/security/capabilities/) (HIGH confidence)
- Store plugin: [v2.tauri.app/plugin/store/](https://v2.tauri.app/plugin/store/) (MEDIUM confidence)
