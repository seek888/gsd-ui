# Stack Research

**Project:** GSD UI
**Researched:** 2026-04-13
**Confidence:** MEDIUM-HIGH (official Tauri docs + npm verified; React ecosystem details from training data + web sources)

---

## Recommended Stack

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Desktop Framework | Tauri | v2.x (stable) | ~10MB bundle vs Electron's ~150MB; Rust backend for stable process management; plugin ecosystem mature in v2 |
| Frontend Build | Vite | v5.x | Officially recommended by Tauri; fast HMR essential for desktop dev workflow |
| Language | TypeScript | v5.x | Required for Tauri v2 + React; strict mode for reliability |
| UI Framework | React | v18.x or v19.x | Tauri v2 officially supports; v19 via `@monaco-editor/react@next` |
| State Management | Zustand | v5.x | ~1KB, minimal boilerplate, ideal for file-system/event-driven state; React Query adds unnecessary complexity for local file data |
| Code Editor | @monaco-editor/react | v4.x | Official Monaco wrapper; zero webpack config; Markdown language support built-in |
| File Tree | react-arborist | latest | Purpose-built React tree library; virtualized rendering; drag-and-drop capable; most popular React tree lib |
| Terminal Output | @xterm/xterm + @xterm/addon-fit | v5.x | Modular xterm.js packages; used by VS Code; GPU-accelerated rendering |
| UI Component Library | shadcn/ui | latest | Copy-paste components (not a package); Radix UI primitives + Tailwind CSS; highly customizable for developer tools aesthetic |
| Styling | Tailwind CSS | v3.x | Required by shadcn/ui; utility-first fits custom developer tool UI |
| Styling Primitive | Radix UI | via shadcn/ui | Headless accessible primitives; shadcn/ui wraps these |
| Shell Plugin | @tauri-apps/plugin-shell | v2.x | First-party Tauri plugin for child process spawning with streaming stdout/stderr |
| FS Plugin | @tauri-apps/plugin-fs | v2.x | First-party Tauri plugin for read/write/watch with capability-based security |
| Process Plugin | @tauri-apps/plugin-process | v2.x | App exit/relaunch only (not for spawning); spawn uses shell plugin |

---

## Key Library Decisions

### 1. Tauri v2 vs v1

**Decision: Tauri v2 is the correct choice.**

Tauri v2 made breaking changes that are all improvements:

- **Plugin system**: Non-core APIs (fs, shell, dialog, http, etc.) moved to `@tauri-apps/plugin-*` packages. This is cleaner and more maintainable.
- **Capabilities system**: Replaced v1's allowlist with a capability/permission ACL system in `src-tauri/capabilities/`. More granular and explicit.
- **IPC rewrite**: New `Channel` API with `EventTarget`-based event system.
- **Window API rename**: `Window` -> `WebviewWindow` (Rust + JS) for clarity.

For a new project in 2025/2026, there is no reason to use v1. Tauri v2 has been stable since 2024 and the plugin ecosystem is mature.

**Confidence:** HIGH (from official Tauri migration docs at `tauri.app/start/migrate/`)

---

### 2. Tauri v2 Shell Plugin (`@tauri-apps/plugin-shell`)

**Usage pattern for streaming output:**

```typescript
import { Command } from '@tauri-apps/plugin-shell';

const cmd = Command.create('claude', ['--some-arg']);
cmd.stdout.on('data', (line) => appendOutput(line));
cmd.stderr.on('data', (line) => appendOutput(line));

const child = await cmd.spawn();
// To kill: await child.kill()
```

- `Command.create(program, args)` creates a command
- `cmd.spawn()` returns a `Child` handle with `.kill()` and `.write()` methods
- `cmd.execute()` waits for completion and returns full output (use for quick commands)
- Streaming is event-based: `cmd.stdout.on('data', callback)`

**Required capability permissions:**
```json
{
  "identifier": "my-capability",
  "permissions": [
    "shell:allow-execute",
    "shell:allow-spawn",
    "shell:allow-kill",
    "shell:allow-stdin-write"
  ]
}
```

Note: `shell:allow-execute` without a scope allows any program. For restricted execution, define a scope with allowed programs/args patterns.

**Confidence:** HIGH (from official Tauri docs at `tauri.app/reference/javascript/shell/`)

---

### 3. Tauri v2 FS Plugin (`@tauri-apps/plugin-fs`)

**Core APIs for GSD UI:**

```typescript
import { readTextFile, writeTextFile, readDir, watch } from '@tauri-apps/plugin-fs';

// Read a file
const content = await readTextFile('.planning/ROADMAP.md');

// Write a file
await writeTextFile('.planning/STATE.md', content);

// List directory
const entries = await readDir('.planning/');

// Watch for changes
const unwatch = await watch('.planning/', (event) => {
  // event.kind: 'create' | 'modify' | 'remove' | 'access'
  refreshState();
});

return () => unwatch();
```

**Scope configuration** in `src-tauri/capabilities/default.json`:
```json
{
  "permissions": [
    {
      "identifier": "fs:allow-readTextFile",
      "allow": [{ "path": "**/.planning/**" }]
    },
    {
      "identifier": "fs:allow-writeTextFile",
      "allow": [{ "path": "**/.planning/**" }]
    },
    {
      "identifier": "fs:allow-readDir",
      "allow": [{ "path": "**/.planning/**" }]
    },
    {
      "identifier": "fs:allow-watch"
    }
  ]
}
```

Path variables: `$HOME`, `$APPDATA`, `$APPCONFIG`, `$DESKTOP`, `$DOCUMENT`, `$DOWNLOAD`, `$TEMP`

**Confidence:** HIGH (from official Tauri docs at `tauri.app/reference/javascript/fs/`)

---

### 4. State Management: Zustand

**Decision: Zustand over Jotai or React Query.**

This project is a desktop developer tool with:
- File system state (read from `.planning/`)
- CLI execution state (streaming output, process lifecycle)
- UI state (selected file, panel sizes)
- No server/API state

**Why Zustand:**
- **vs Jotai**: Jotai's atomic model shines for fine-grained subscriptions in large apps. GSD UI is medium complexity -- Zustand's flat store is simpler and sufficient.
- **vs React Query**: React Query is designed for server state (caching, background refetch, optimistic updates). GSD UI has no server state. Using React Query would be misusing it.
- **vs React Context**: Zustand is easier to use than Context for multiple independent state slices.

**Store structure recommendation:**

```typescript
// stores/cli.ts
interface CliStore {
  output: string[];
  isRunning: boolean;
  process: Child | null;
  appendOutput: (line: string) => void;
  execute: (args: string[]) => Promise<void>;
  kill: () => Promise<void>;
}

// stores/project.ts
interface ProjectStore {
  files: FileEntry[];
  selectedFile: string | null;
  roadmap: RoadmapState | null;
  loadProject: () => Promise<void>;
}
```

**Confidence:** MEDIUM (ecosystem consensus, not from official docs)

---

### 5. Monaco Editor (`@monaco-editor/react`)

**Version:** v4.x (stable), v5.x-next for React 19 support

**Installation:**
```bash
npm install @monaco-editor/react
```

**Markdown configuration:**

```typescript
import Editor from '@monaco-editor/react';

<Editor
  height="100%"
  defaultLanguage="markdown"
  defaultValue={content}
  theme="vs-dark"
  onChange={(value) => handleChange(value ?? '')}
  onMount={(editor, monaco) => {
    // Configure Markdown if needed
    monaco.editor.setTheme('vs-dark');
  }}
  options={{
    wordWrap: 'on',
    minimap: { enabled: false },
    lineNumbers: 'on',
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Menlo, monospace',
    scrollBeyondLastLine: false,
    automaticLayout: true,
  }}
/>
```

Monaco has built-in Markdown language support (syntax highlighting, basic formatting). No additional language configuration needed.

**Important:** The `automaticLayout: true` option is critical for Tauri webview -- Monaco won't auto-resize otherwise.

**Confidence:** HIGH (from official npm page and GitHub repo)

---

### 6. File Tree: react-arborist

**Why react-arborist over alternatives:**

| Alternative | Why Not |
|-------------|---------|
| Custom `<ul>/<li>` tree | No virtualization; slow with large dirs |
| react-file-tree | Unmaintained, no TypeScript |
| @nrwl/nx file utilities | Too heavy for a standalone component |
| react-virtualized-tree | Hard to customize appearance |
| react-tree-walker | Lower level, requires more boilerplate |

react-arborist is the most maintained, feature-rich React tree library with:
- Virtualized rendering (handles thousands of nodes)
- Customizable node rendering (render prop API)
- Drag-and-drop support
- TypeScript native
- Active maintenance (~weekly releases as of 2024-2025)

**Usage pattern:**

```typescript
import { Tree } from 'react-arborist';

const data = buildTreeFromFsEntries(entries);

<Tree
  data={data}
  openByDefault={true}
  width={240}
  height={400}
>
  {({ node, style, ...rest }) => (
    <div style={style} {...rest}>
      {node.data.name}
    </div>
  )}
</Tree>
```

**Confidence:** MEDIUM (community consensus, not officially vetted by Tauri)

---

### 7. Terminal Output: @xterm/xterm

**Decision: Use @xterm/xterm (v5.x) over custom scroll log.**

xterm.js is battle-tested (VS Code, Hyper, Tabby). The new modular packages (`@xterm/xterm`, `@xterm/addon-fit`, etc.) are the 5.x branch.

**Installation:**
```bash
npm install @xterm/xterm @xterm/addon-fit
```

**React integration pattern:**

```typescript
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';

function OutputTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);

  useEffect(() => {
    const term = new Terminal({ theme: { background: '#1e1e1e' } });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current!);
    fitAddon.fit();
    terminal.current = term;

    return () => term.dispose();
  }, []);

  const appendOutput = (line: string) => {
    terminal.current?.write(line + '\r\n');
  };

  return <div ref={terminalRef} style={{ height: '100%' }} />;
}
```

**For streaming integration with Tauri shell plugin:**
```typescript
cmd.stdout.on('data', (line) => {
  terminal.current?.writeln(line);
});
```

**Alternative -- simple scroll log:**
For simpler needs (no ANSI codes needed), a custom scroll container with a `<pre>` or `<div>` and auto-scroll is much simpler and avoids xterm.js complexity. Given GSD UI's output is primarily text from `claude` CLI (mostly plain text), a custom scroll log may suffice. But xterm.js is the SOTA choice if ANSI color/escape code support is needed.

**Confidence:** MEDIUM (well-documented ecosystem, VS Code reference)

---

### 8. UI Component Library: shadcn/ui + Tailwind CSS

**Why shadcn/ui (not raw Radix, not MUI, not Chakra):**

| Library | Why Not |
|---------|---------|
| Raw Radix UI | Too low-level; requires significant styling work |
| Material UI (MUI) | Google's design language; heavy (~60KB+); not a developer tool aesthetic |
| Chakra UI | Maintenance concerns (v3 delayed); opinionated |
| Mantine | Good but less customizable than shadcn/ui for custom aesthetics |
| custom | Too much work for common components (buttons, dialogs, menus) |

shadcn/ui is not a package -- it's a copy-paste component system. You own the code. This means:
- No external dependency risk
- Full customization (developer tool aesthetic is achievable)
- Accessible by default (Radix UI primitives underneath)
- Tailwind CSS for styling

**Components relevant for GSD UI:**
- Button, Badge (command buttons, status indicators)
- Dialog, Sheet (file editor, settings)
- Resizable (adjustable panels)
- ScrollArea (custom scrollbar)
- Tooltip, ContextMenu (file tree interactions)
- Tabs (Dashboard vs Files vs Editor views)
- Separator, Collapsible (panel layouts)

**Installation with Vite:**
```bash
pnpm add tailwindcss @tailwindcss/vite
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button dialog sheet resizable tabs separator
```

**Confidence:** MEDIUM (community standard in React ecosystem 2024-2026)

---

### 9. Build Tooling: Vite + Tauri CLI

**Recommended project creation:**
```bash
npm create tauri-app@latest gsd-ui -- --template react-ts --manager npm
```

This scaffolds a Tauri v2 + React + TypeScript project with Vite.

**Key configuration files:**

`src-tauri/tauri.conf.json` (essential for GSD UI):
```json
{
  "productName": "GSD UI",
  "identifier": "com.gsd.ui",
  "build": {
    "devtools": true
  }
}
```

`src-tauri/capabilities/default.json` (permissions):
```json
{
  "identifier": "default",
  "description": "GSD UI default capabilities",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-execute",
    "shell:allow-spawn",
    "shell:allow-kill",
    "fs:allow-readTextFile",
    "fs:allow-writeTextFile",
    "fs:allow-readDir",
    "fs:allow-watch",
    "process:allow-exit",
    "process:allow-restart"
  ]
}
```

**Vite config** (`vite.config.ts`):
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Confidence:** HIGH (from official Tauri docs)

---

## What NOT to Use

### Electron

- Bundle size: ~150MB vs Tauri's ~10MB
- Chromium overhead: memory-heavy, two JS runtimes (Node + renderer)
- **Exception**: Only if Tauri cannot fulfill a specific requirement (unlikely for this use case)

### Tauri v1

- Deprecated. No new features. Plugin ecosystem moved to v2.
- Breaking migration path exists but unnecessary for a new project.

### React Context for global state

- Boilerplate-heavy for multiple state slices
- Re-render issues require careful optimization
- Zustand at ~1KB is strictly better

### `fs-extra` or `chokidar` in Node.js

- These run in Node.js, not in the Tauri webview
- Tauri provides Rust-based FS access via plugins
- Use `@tauri-apps/plugin-fs` instead of Node.js fs modules

### Monaco Editor via webpack loader

- Old approach requiring custom webpack configuration
- `@monaco-editor/react` wraps everything; zero config needed

### Raw WebSocket for CLI streaming

- The shell plugin handles process management natively
- WebSocket would be for linking a separate backend process
- Unnecessary complexity for direct CLI invocation

### Ant Design or Material UI

- Enterprise/consumer design language
- Heavy bundle sizes
- Wrong aesthetic for developer tools

---

## Open Questions

1. **React 19 compatibility**: `@monaco-editor/react@next` is needed for React 19. If using React 18, stick with v4.x stable. Need to decide which React version to target based on other dependencies.

2. **react-arborist latest version**: Could not verify the current version number. Need to check `npm ls react-arborist` or the GitHub releases page after scaffolding.

3. **Shell plugin scope for `claude` CLI**: The `claude` binary needs to be reachable. If `claude` is in PATH, `shell:allow-execute` without scope should work. But if restricted, need to define a scope with `"path": "claude"` or use a sidecar approach.

4. **File watching recursive scope**: Confirm that `**/.planning/**` glob pattern works correctly in Tauri v2 fs plugin scope, or if a different syntax is needed.

5. **ANSI escape code handling in output**: If `claude` CLI output contains ANSI color codes, xterm.js will handle them natively. If a custom scroll log is used instead, a lightweight ANSI parser (e.g., `ansi-styles` or `strip-ansi`) would be needed.

6. **gsd-tools.cjs Node.js script execution**: Can these scripts be invoked via the shell plugin directly (`node gsd-tools.cjs roadmap analyze`) or do they need special handling? The shell plugin should work, but the scripts may need validation.

7. **Monaco editor memory usage**: Monaco is heavy (~5MB). For a simple Markdown editor, consider whether a lighter alternative (e.g., `@uiw/react-md-editor` or even a `<textarea>` with preview) would be sufficient. For MVP, Monaco is fine, but it adds significant bundle weight.

8. **shadcn/ui CSS conflicts**: shadcn/ui uses Tailwind CSS. If any existing CSS (e.g., a global stylesheet) conflicts, need to audit. Tailwind's `@tailwindcss/vite` plugin should integrate cleanly with Vite.
