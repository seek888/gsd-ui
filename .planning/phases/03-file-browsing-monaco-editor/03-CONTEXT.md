# Phase 3: File Browsing + Monaco Editor - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can browse the `.planning/` directory structure in a file tree, click Markdown files to open them in the main content area, view rendered Markdown (headings, tables, code blocks with syntax highlighting, visible front matter), toggle to Monaco editor mode to edit Markdown files, and save changes back to disk. Unsaved changes are indicated with a visual marker. The app watches the `.planning/` directory for changes and auto-refreshes the file tree.

</domain>

<decisions>
## Implementation Decisions

### File Tree Layout
- **D-01:** File tree is part of Documents View — Documents View contains both the file tree and the preview/edit area, not a separate navigation item
- **D-02:** Documents View uses horizontal split layout (flex-row) — file tree on the left (200px width, matching Terminal layout), preview/edit area on the right (flex-1)
- **D-03:** This maintains consistency with Terminal View's layout pattern established in Phase 2

### Preview/Edit Mode Switching
- **D-04:** Single-click to preview, double-click to edit — clicking a file in the tree opens it in preview mode; double-clicking switches to edit mode
- **D-05:** Unsaved changes indicator — files with unsaved changes display a small dot (•) after the filename in the file tree, similar to VS Code's pattern

### Markdown Rendering
- **D-06:** Use react-markdown for Markdown rendering — simple, lightweight, supports custom renderers for code blocks
- **D-07:** Use Monaco's built-in syntax highlighting for code blocks — reuse Monaco's highlighting capability (already loaded for editor)
- **D-08:** Front matter (YAML headers) is collapsible — displayed in a collapsible/expandable section in preview mode so users can toggle visibility

### File Watching
- **D-09:** Use Tauri's native `fs.watch()` API for real-time directory monitoring — reliable, cross-platform, built into the fs plugin
- **D-10:** Apply 500ms debounce to file change events — wait 500ms after the last change before refreshing to avoid excessive updates
- **D-11:** When file changes are detected, refresh the file tree structure (additions/deletions) — if the currently open file was modified externally, prompt user to reload

### Claude's Discretion
- File tree component internal implementation details (node rendering, virtualization)
- Markdown preview styling (CSS classes, typography)
- Monaco editor configuration specifics (editor options beyond basic setup)
- Error handling for file read/write failures

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` — FILE-01 through FILE-05 define the Phase 3 requirements

### Tech Stack (from PROJECT.md)
- `.planning/RESEARCH.md` or `.planning/research/STACK.md` — React 18, Tauri v2, TypeScript, Monaco Editor via @monaco-editor/react
- `.planning/research/STACK.md` §react-arborist — File tree library (chosen in Phase 1)

### Prior Phase Context
- `.planning/phases/01-scaffold-foundation/01-CONTEXT.md` — Sidebar pattern (200px width), Zustand state management, shadcn/ui components
- `.planning/phases/02-command-execution-output-streaming/02-CONTEXT.md` — Terminal View layout pattern (flex-row with 200px sidebar), established UI patterns

### Library Documentation
- react-arborist documentation — File tree component patterns
- @monaco-editor/react documentation — Editor integration patterns
- react-markdown documentation — Markdown rendering patterns

### No External Specs
No external specification documents apply — requirements are fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/fs.ts` — Tauri v2 fs plugin wrapper with readDir, readFile, writeFile, watch functions
- `src/stores/uiStore.ts` — Zustand store with activeView state for navigation
- `src/stores/projectStore.ts` — Zustand store with projectPath state
- `src/components/ui/` — shadcn/ui base components (Button, ScrollArea, etc.)
- `src/views/TerminalView.tsx` — Reference layout pattern: flex-row with 200px left sidebar

### Established Patterns
- **Sidebar navigation:** 200px fixed width, NavItem component with icon + label, active view highlighting
- **Zustand stores:** `create((set, get) => ({ state, actions }))` pattern for state management
- **Tauri plugin wrappers:** Singleton store instances, typed helper functions
- **Split view layouts:** flex-row container with fixed-width sidebar and flex-1 content area

### Integration Points
- **Documents View** (`src/views/DocumentsView.tsx`) — Currently a placeholder, needs full implementation
- **File Store** — New Zustand store needed for file tree state, current file, dirty state tracking
- **Monaco Editor** — New component needed, wrapped with @monaco-editor/react

### New Dependencies Needed
- `react-arborist` — File tree component
- `react-markdown` — Markdown rendering
- `react-syntax-highlighter` or similar — Code syntax highlighting (or use Monaco's built-in)

</code_context>

<specifics>
## Specific Ideas

- File tree node rendering: show folder icons, file icons by type, expand/collapse arrows
- Double-click to edit pattern matches VS Code's familiar UX
- Dot indicator (•) after filename in bold color to show unsaved changes
- Front matter collapsible: show "▼ YAML metadata" header that expands/collapses
- When current file is modified externally, show banner: "This file was modified externally. [Reload] [Keep local]"
- 500ms debounce using a timer that resets on each file event

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 3 scope.

</deferred>

---
*Phase: 03-file-browsing-monaco-editor*
*Context gathered: 2026-04-13*
