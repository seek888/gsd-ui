# Phase 2: Command Execution + Output Streaming - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can trigger GSD commands by clicking buttons and watch real-time terminal output with ANSI colors. Commands execute via Tauri shell plugin invoking the Claude CLI, with output streaming to xterm.js terminal emulator. Users can cancel running commands, scroll through output history, copy output, and clear the terminal panel.

</domain>

<decisions>
## Implementation Decisions

### Command Panel Layout
- **D-01:** Command buttons placed in a **left sidebar within the Terminal view** — similar to VS Code's debug panel layout
- **D-02:** Command sidebar width should match the main app sidebar (200px) for visual consistency
- **D-03:** Command buttons display icon + label + description (description shown on hover or as subtitle)

### Command List Definition
- **D-04:** Use a **fixed core command set** defined in code, not dynamically generated
- **D-05:** Core commands to expose:
  - `/gsd-next` — Advance to next task/plan
  - `/gsd-status` — Show current project status
  - `/gsd-plan-phase {N}` — Plan a phase
  - `/gsd-execute-phase {N}` — Execute a phase
  - `/gsd-verify-work` — Run UAT verification
  - `/gsd-code-review {N}` — Run code review
- **D-06:** Each command has: `id`, `label`, `description`, `cliCommand`, `args` (if applicable)
- **D-07:** Command list defined in `src/lib/gsdCommands.ts` as constant array

### Terminal Output Rendering
- **D-08:** Use **xterm.js** terminal emulator for ANSI output rendering
- **D-09:** xterm.js configured with:
  - `cursorBlink: false` — disable cursor for read-only terminal
  - `fontSize: 13` or `14` — readable default
  - `fontFamily: 'Menlo, Monaco, Consolas, monospace'` — standard dev fonts
  - `theme: { background: '#1a1a1a', foreground: '#f0f0f0' }` — dark theme matching app
- **D-10:** Use `@xterm/addon-fit` for auto-resize to container
- **D-11:** No `@xterm/addon-web-links` initially — can add later if needed

### Scroll Behavior
- **D-12:** **Smart pause** auto-scroll:
  - Default: auto-scroll to bottom on new output
  - When user scrolls up: pause auto-scroll, show "Jump to bottom" floating button
  - When user scrolls near bottom (within 100px): resume auto-scroll, hide button
  - "Jump to bottom" button fixed-position in bottom-right corner
- **D-13:** Scroll state detection via xterm.js `onScroll` event + tracking viewport position

### Command Button States
- **D-14:** Four visual states per CMD-02:
  - **Idle:** Default button, neutral color (ghost variant)
  - **Running:** Spinner + label change, button disabled
  - **Success:** Green indicator, auto-clear after 3 seconds
  - **Failure:** Red indicator, persists until next action
- **D-15:** Running commands show PID or progress indicator in button label

### Claude's Discretion
- Terminal color theme exact hex values (should match shadcn/ui dark theme)
- Command button icon selection (Lucide icons)
- "Jump to bottom" button exact styling and positioning
- Success indicator auto-clear timeout (3 seconds is suggestion)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value: "看清楚正在做什么、下一步做什么、做了什么"
- `.planning/REQUIREMENTS.md` — CMD-01 through CMD-04, OUT-01 through OUT-04 are Phase 2 requirements
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, and 6 plans
- `.planning/phases/01-scaffold-foundation/01-CONTEXT.md` — Phase 1 decisions (Tauri shell plugin, CLI store pattern)

### Tech Decisions
- `.planning/research/STACK.md` §Tauri v2 Shell Plugin — `Command.create()`, `spawn()`, event-based stdout/stderr
- `.planning/research/STACK.md` §xterm.js — @xterm/xterm + @xterm/addon-fit for terminal output

### Phase 1 Implementation
- `src/lib/shell.ts` — `runCommand()` wrapper with stdout/stderr callbacks
- `src/stores/cliStore.ts` — CLI execution state, runningProcess, output array (with MAX_OUTPUT_LINES limit)
- `src/views/TerminalView.tsx` — Terminal view placeholder (to be replaced with actual implementation)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/shell.ts` — `runCommand(program, args, onStdout, onStderr)` wrapper already exists
- `src/stores/cliStore.ts` — CLI store with `executeCommand`, `killCommand`, `appendOutput`, `clearOutput`
- `src/stores/uiStore.ts` — UI state with `activeView` for navigation
- `src/components/ui/button.tsx` — shadcn/ui Button component with variants (default, ghost, destructive)
- `src/components/ui/scroll-area.tsx` — ScrollArea component (may be used for command sidebar)

### Established Patterns
- **Zustand store pattern:** `create((set, get) => ({ state, actions }))`
- **Tauri plugin wrapper:** singleton store instance, typed helper functions
- **Sidebar navigation:** 200px fixed width, NavItem component with icon + label

### Integration Points
- **TerminalView** (src/views/TerminalView.tsx) — currently placeholder, needs full implementation
- **CLI store** (src/stores/cliStore.ts) — extend with xterm.js integration, scroll state
- **Shell plugin** (@tauri-apps/plugin-shell) — already wrapped, use existing `runCommand()`

### New Dependencies Needed
- `@xterm/xterm` — Terminal emulator core
- `@xterm/addon-fit` — Auto-resize addon

</code_context>

<specifics>
## Specific Ideas

- Command sidebar button layout: vertical stack, full-width buttons with icon left, label center, description/subtitle below (truncate with ellipsis)
- "Jump to bottom" button: floating circular button in bottom-right, shows ↓ icon, appears only when scrolled up
- Command running state: button shows spinner (Lucide `Loader2`) with rotation animation, label changes to "Running..."
- Command success state: button border or icon turns green, shows ✓ (Lucide `Check`), fades after 3 seconds
- Command failure state: button border or icon turns red, shows ✕ (Lucide `X`), stays until next command
- xterm.js container should fill available space after command sidebar and header
- Terminal should have a "Copy" and "Clear" button in top-right corner of terminal area

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 2 scope.

</deferred>

---

*Phase: 02-command-execution-output-streaming*
*Context gathered: 2026-04-13*
