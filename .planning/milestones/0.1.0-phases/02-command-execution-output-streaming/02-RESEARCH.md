# Phase 2: Command Execution + Output Streaming - Research

**Researched:** 2026-04-13
**Domain:** Tauri v2 shell plugin integration, xterm.js terminal emulator, React state management
**Confidence:** HIGH

## Summary

Phase 2 implements the command execution and output streaming capabilities for GSD UI. Users trigger GSD commands via buttons, watch real-time terminal output with ANSI color rendering, and can cancel running commands. The implementation uses Tauri v2's shell plugin for process spawning, xterm.js for terminal emulation, and Zustand for state management.

**Primary recommendation:** Use @xterm/xterm v6.0.0 + @xterm/addon-fit v0.11.0 for terminal output, extend the existing cliStore pattern, and implement command buttons as a sidebar within the Terminal view per CONTEXT.md decision D-01.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Command buttons placed in a **left sidebar within the Terminal view** — similar to VS Code's debug panel layout
- **D-02:** Command sidebar width should match the main app sidebar (200px) for visual consistency
- **D-03:** Command buttons display icon + label + description (description shown on hover or as subtitle)
- **D-04:** Use a **fixed core command set** defined in code, not dynamically generated
- **D-05:** Core commands to expose: `/gsd-next`, `/gsd-status`, `/gsd-plan-phase {N}`, `/gsd-execute-phase {N}`, `/gsd-verify-work`, `/gsd-code-review {N}`
- **D-06:** Each command has: `id`, `label`, `description`, `cliCommand`, `args` (if applicable)
- **D-07:** Command list defined in `src/lib/gsdCommands.ts` as constant array
- **D-08:** Use **xterm.js** terminal emulator for ANSI output rendering
- **D-09:** xterm.js configured with: `cursorBlink: false`, `fontSize: 13` or `14`, `fontFamily: 'Menlo, Monaco, Consolas, monospace'`, `theme: { background: '#1a1a1a', foreground: '#f0f0f0' }`
- **D-10:** Use `@xterm/addon-fit` for auto-resize to container
- **D-11:** No `@xterm/addon-web-links` initially — can add later if needed
- **D-12:** **Smart pause** auto-scroll: Default auto-scroll to bottom, pause on user scroll up, show "Jump to bottom" button, resume when scrolled near bottom (within 100px)
- **D-13:** Scroll state detection via xterm.js `onScroll` event + tracking viewport position
- **D-14:** Four visual states per CMD-02: Idle (ghost), Running (spinner + disabled), Success (green, auto-clear after 3s), Failure (red, persists)
- **D-15:** Running commands show PID or progress indicator in button label

### Claude's Discretion

- Terminal color theme exact hex values (should match shadcn/ui dark theme)
- Command button icon selection (Lucide icons)
- "Jump to bottom" button exact styling and positioning
- Success indicator auto-clear timeout (3 seconds is suggestion)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within Phase 2 scope.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @xterm/xterm | 6.0.0 | Terminal emulator core | Modular xterm.js v5/v6 packages; VS Code uses this; GPU-accelerated rendering [VERIFIED: npm registry] |
| @xterm/addon-fit | 0.11.0 | Auto-resize terminal to container | Official xterm.js addon; essential for responsive layouts [VERIFIED: npm registry] |
| @tauri-apps/plugin-shell | 2.3.5 | Child process spawning with streaming stdout/stderr | Tauri v2 first-party plugin; event-based streaming API [VERIFIED: npm registry] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | 5.0.5 | CLI execution state management | Already installed; lightweight state management [VERIFIED: package.json] |
| lucide-react | 0.511.0 | Command button icons | Already installed; consistent with shadcn/ui [VERIFIED: package.json] |
| @xterm/addon-clipboard | 0.2.0 | Copy terminal selection to clipboard | For OUT-04 copy functionality [VERIFIED: npm registry] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| xterm.js | Custom scroll log with `<pre>` | No ANSI color support; harder to maintain; xterm.js is SOTA |
| xterm.js | ansi-to-html + styled divs | Doesn't handle all ANSI codes; no true terminal behavior |
| shell plugin events | WebSocket to backend | Unnecessary complexity; shell plugin handles streaming natively |

**Installation:**

```bash
npm install @xterm/xterm @xterm/addon-fit @xterm/addon-clipboard
```

**Version verification:**
- `@xterm/xterm`: 6.0.0 (verified 2026-04-13 via npm view)
- `@xterm/addon-fit`: 0.11.0 (verified 2026-04-13 via npm view)
- `@xterm/addon-clipboard`: 0.2.0 (verified 2026-04-13 via npm view)
- `@tauri-apps/plugin-shell`: 2.3.5 (verified 2026-04-13 via npm view)
- `zustand`: 5.0.5 (verified via package.json)
- `lucide-react`: 0.511.0 (verified via package.json)

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   ├── shell.ts          # Existing: runCommand wrapper
│   ├── gsdCommands.ts    # NEW: GSD command definitions (D-07)
│   └── xtermTheme.ts     # NEW: Dark theme config for xterm.js
├── stores/
│   ├── cliStore.ts       # EXTEND: Add xterm.js integration, scroll state
│   └── uiStore.ts        # Existing: View management
├── components/
│   ├── terminal/
│   │   ├── CommandSidebar.tsx   # NEW: Command button list (CMD-01, CMD-02)
│   │   ├── TerminalOutput.tsx   # NEW: xterm.js wrapper (OUT-01, OUT-02)
│   │   └── JumpToBottom.tsx     # NEW: Floating scroll button (OUT-03)
│   └── ui/               # Existing: shadcn/ui components
└── views/
    └── TerminalView.tsx  # REPLACE: Full terminal view implementation
```

### Pattern 1: xterm.js React Integration with Cleanup

**What:** Proper xterm.js lifecycle management in React components

**When to use:** Any component using xterm.js Terminal

**Example:**

```typescript
// Source: xterm.js README [CITED: github.com/xtermjs/xterm.js]
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';

function TerminalOutput() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: false,  // Per D-09
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, Consolas, monospace',
      theme: {
        background: '#1a1a1a',
        foreground: '#f0f0f0'
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    terminalInstanceRef.current = term;

    // CRITICAL: Cleanup to prevent memory leaks
    return () => {
      term.dispose();
    };
  }, []);

  return <div ref={terminalRef} style={{ height: '100%' }} />;
}
```

### Pattern 2: Streaming Output from Tauri Shell Plugin

**What:** Wire stdout/stderr events from Tauri Command to xterm.js

**When to use:** All CLI execution with real-time output

**Example:**

```typescript
// Source: @tauri-apps/plugin-shell v2.3.5 API
import { Command } from '@tauri-apps/plugin-shell';

async function executeCommand(
  program: string,
  args: string[],
  onData: (data: string) => void,
  onError: (data: string) => void
): Promise<number> {
  const cmd = Command.create(program, args);

  // Event-based streaming
  cmd.stdout.on('data', (e) => onData(e.payload));
  cmd.stderr.on('data', (e) => onError(e.payload));

  const child = await cmd.spawn();
  return child.pid;
}
```

### Pattern 3: Smart Auto-Scroll with User Detection

**What:** Pause auto-scroll when user scrolls up, resume when near bottom

**When to use:** Terminal output panels with scrollable content

**Example:**

```typescript
import { useEffect, useRef, useState } from 'react';
import type { Terminal } from '@xterm/xterm';

function useSmartScroll(terminal: Terminal | null) {
  const [userScrolled, setUserScrolled] = useState(false);
  const scrollCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!terminal) return;

    const handleScroll = () => {
      const buffer = terminal.buffer.active;
      const viewportY = terminal._core._viewport._ydisp; // Internal API
      const bufferHeight = buffer.length;
      const threshold = 100; // Per D-12

      const isNearBottom = bufferHeight - viewportY < threshold;

      if (!isNearBottom && !userScrolled) {
        setUserScrolled(true);
      } else if (isNearBottom && userScrolled) {
        setUserScrolled(false);
      }
    };

    terminal.onScroll(handleScroll);
    return () => {
      terminal.onScroll(() => {}); // Cleanup
    };
  }, [terminal, userScrolled]);

  const scrollToBottom = () => {
    if (terminal) {
      terminal.scrollToBottom();
      setUserScrolled(false);
    }
  };

  return { userScrolled, scrollToBottom };
}
```

### Anti-Patterns to Avoid

- **Not disposing terminal:** xterm.js instances must be disposed via `term.dispose()` to prevent memory leaks and event listener accumulation
- **Writing to terminal after disposal:** Always check `terminalInstanceRef.current` exists before writing
- **Missing CSS import:** Forgetting `import '@xterm/xterm/css/xterm.css'` results in unstyled terminal
- **Using internal xterm.js APIs:** Avoid `_core` and other internal properties; use public API only
- **Not debouncing scroll events:** Scroll events fire rapidly; debounce to avoid performance issues

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Terminal emulation | Custom div with ANSI parsing | xterm.js | ANSI escape codes are complex (colors, cursor movement, line clearing); xterm.js handles edge cases |
| Auto-resize terminal | Window resize listener | @xterm/addon-fit | Correctly handles container resizing, character grid dimensions |
| Copy terminal selection | Custom selection API | @xterm/addon-clipboard | Handles cross-platform clipboard permissions correctly |
| Process spawning | Rust custom commands | @tauri-apps/plugin-shell | Built-in stdout/stderr streaming, kill support, event-based |

**Key insight:** xterm.js has 20k+ GitHub stars and is used by VS Code. Building a terminal emulator from scratch would take weeks and still miss edge cases. The shell plugin's streaming API is specifically designed for this use case.

## Common Pitfalls

### Pitfall 1: Terminal Memory Leaks

**What goes wrong:** xterm.js instances not disposed cause memory leaks and multiple terminal instances running simultaneously.

**Why it happens:** Forgetting cleanup in useEffect, or creating new terminals on every render.

**How to avoid:** Always store terminal instance in useRef and dispose in useEffect cleanup. Create terminal once on mount.

**Warning signs:** Memory usage increases over time, multiple terminals rendering simultaneously, sluggish scrolling.

### Pitfall 2: Output Flicker on Fast Streams

**What goes wrong:** Terminal output flickers or lags when CLI outputs many lines quickly.

**Why it happens:** React re-renders on every output line; no batching of writes.

**How to avoid:** Write directly to terminal instance (bypass React state), use requestAnimationFrame throttling for UI updates per OUT-01.

**Warning signs:** High CPU usage during command execution, visible lag in output.

### Pitfall 3: ANSI Color Codes Not Rendering

**What goes wrong:** Output shows raw ANSI escape codes (`\x1B[31mERROR\x1B[0m`) instead of colored text.

**Why it happens:** xterm.js not imported correctly, or using plain text container instead of Terminal.

**How to avoid:** Import `@xterm/xterm/css/xterm.css`, use `term.write()` not `term.writeln()` for raw output, ensure Terminal is initialized before writing.

**Warning signs:** Output has escape sequences visible, colors not working.

### Pitfall 4: Command Process Not Killed

**What goes wrong:** User clicks cancel but CLI process continues running in background.

**Why it happens:** `child.kill()` fails, or PID tracking is incorrect, or not waiting for kill confirmation.

**How to avoid:** Store Child handle in cliStore, call `await child.kill()`, verify process terminated via `child.on('close')` event.

**Warning signs:** Command appears stopped but output continues, high CPU usage after cancel.

### Pitfall 5: Scroll Position Lost on New Output

**What goes wrong:** User scrolls up to review output, but new output jumps back to bottom.

**Why it happens:** Auto-scroll always active, no user scroll detection.

**How to avoid:** Implement smart pause per D-12: track scroll position, pause auto-scroll when user scrolls up, show "Jump to bottom" button.

**Warning signs:** Cannot review historical output, frustrating UX.

## Code Examples

Verified patterns from official sources:

### xterm.js Terminal Initialization

```typescript
// Source: xterm.js GitHub README [CITED: github.com/xtermjs/xterm.js]
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

const term = new Terminal({
  cursorBlink: false,
  fontSize: 14,
  fontFamily: 'Menlo, Monaco, Consolas, monospace',
  theme: {
    background: '#1a1a1a',
    foreground: '#f0f0f0',
    red: '#ff5b5b',
    green: '#3db889',
    yellow: '#ffc107'
  }
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));
fitAddon.fit();

// Write output with ANSI colors
term.write('\x1b[31mError:\x1b[0m Command failed\r\n');
```

### Tauri Shell Plugin Streaming

```typescript
// Source: @tauri-apps/plugin-shell API docs
import { Command } from '@tauri-apps/plugin-shell';

const cmd = Command.create('claude', ['--version']);

// Stream stdout
cmd.stdout.on('data', (event) => {
  console.log('stdout:', event.payload);
});

// Stream stderr
cmd.stderr.on('data', (event) => {
  console.error('stderr:', event.payload);
});

// Handle process exit
cmd.on('close', (event) => {
  console.log('exit code:', event.payload.code);
});

const child = await cmd.spawn();

// Kill process
await child.kill();
```

### GSD Command Definitions (per D-07)

```typescript
// src/lib/gsdCommands.ts
export interface GSDCommand {
  id: string;
  label: string;
  description: string;
  cliCommand: string;
  args?: string[];
  icon: string; // Lucide icon name
}

export const GSD_COMMANDS: GSDCommand[] = [
  {
    id: 'gsd-next',
    label: 'Next Task',
    description: 'Advance to the next task in current phase',
    cliCommand: 'claude',
    args: ['/gsd-next'],
    icon: 'ArrowRight'
  },
  {
    id: 'gsd-status',
    label: 'Show Status',
    description: 'Display current project status and progress',
    cliCommand: 'claude',
    args: ['/gsd-status'],
    icon: 'Activity'
  },
  {
    id: 'gsd-plan-phase',
    label: 'Plan Phase',
    description: 'Create a plan for a specific phase',
    cliCommand: 'claude',
    args: ['/gsd-plan-phase'],
    icon: 'FileCode'
  },
  {
    id: 'gsd-execute-phase',
    label: 'Execute Phase',
    description: 'Execute all plans in a phase',
    cliCommand: 'claude',
    args: ['/gsd-execute-phase'],
    icon: 'Play'
  },
  {
    id: 'gsd-verify-work',
    label: 'Verify Work',
    description: 'Run UAT verification on completed work',
    cliCommand: 'claude',
    args: ['/gsd-verify-work'],
    icon: 'CheckCircle'
  },
  {
    id: 'gsd-code-review',
    label: 'Code Review',
    description: 'Run code review on a specific phase',
    cliCommand: 'claude',
    args: ['/gsd-code-review'],
    icon: 'MessageSquare'
  }
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| xterm.js monolithic package | @xterm/xterm modular packages | v5.0 (2024) | Smaller bundle, tree-shakeable addons |
| Tauri v1 allowlist | Tauri v2 capabilities system | v2.0 (2024) | More granular permission control |
| Terminal.write() per line | requestAnimationFrame throttling | - | Better performance for fast output |
| Auto-scroll always on | Smart pause with user detection | - | Better UX for reviewing output |

**Deprecated/outdated:**
- `xterm` (old package name): Use `@xterm/xterm` instead
- `xterm-addon-fit` (old package): Use `@xterm/addon-fit` instead
- Tauri v1 shell API: Migrated to `@tauri-apps/plugin-shell` in v2

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Claude CLI outputs ANSI color codes that xterm.js can render natively | Architecture Patterns | Low - xterm.js is designed for this, fallback to plain text if wrong |
| A2 | `claude` binary is in user's PATH and discoverable by Tauri shell plugin | Standard Stack | Medium - already handled by Phase 1 CLI detection |
| A3 | xterm.js onScroll event provides sufficient data for user scroll detection | Pattern 3 | Low - alternative: use scroll container's scroll events |
| A4 | 100ms batching on Rust side is not needed (shell plugin handles this) | OUT-01 | Low - if streaming is too fast, add React-side throttling |
| A5 | No need for @xterm/addon-web-links initially | Locked Decisions | Low - can add later if needed |

## Open Questions

1. **xterm.js theme hex values:** Exact hex values for dark theme should match shadcn/ui dark theme. Options: derive from CSS variables or hardcode matching values.
   - **What we know:** shadcn/ui uses HSL values in CSS variables (--background: 222.2 84% 4.9%)
   - **What's unclear:** xterm.js theme requires hex, not HSL
   - **Recommendation:** Convert HSL to hex using helper function, or hardcode approximate hex values

2. **Command that requires phase number input:** `/gsd-plan-phase {N}` and `/gsd-execute-phase {N}` require phase number. Options: prompt user via dialog, use text input, or show sub-list of phases.
   - **What we know:** These commands need a phase number argument
   - **What's unclear:** UX pattern for getting the phase number from user
   - **Recommendation:** For Phase 2 MVP, use a simple dialog with number input; defer fancier phase selector to Phase 4

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| claude CLI | Command execution | ? | — | Show install guide (already in Phase 1) |
| Node.js | gsd-tools commands | ✓ | — | — |
| npm/pnpm/yarn | gsd-tools commands | ✓ | — | — |

**Missing dependencies with no fallback:**
- `claude` CLI: Handled by Phase 1 — WelcomePage shows install guide if not detected

**Missing dependencies with fallback:**
- None identified

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CMD-01 | User can see all GSD commands as button list with descriptions | `src/lib/gsdCommands.ts` pattern; CommandSidebar component design |
| CMD-02 | Command buttons show 4 states: idle, running, success, failure | Zustand store pattern; button variant switching; auto-clear timeout |
| CMD-03 | User can cancel running command | `child.kill()` from shell plugin; cliStore.killCommand pattern |
| CMD-04 | Commands execute via Tauri shell plugin invoking claude CLI | `Command.create('claude', args)`; existing shell.ts wrapper |
| OUT-01 | Real-time stdout/stderr streaming with ≤100ms delay | Shell plugin event-based streaming; requestAnimationFrame throttling |
| OUT-02 | ANSI color codes render correctly | xterm.js Terminal handles ANSI natively; theme configuration |
| OUT-03 | Auto-scroll with smart pause and "jump to bottom" button | xterm.js onScroll event; viewport tracking; floating button |
| OUT-04 | Copy output and clear panel functionality | @xterm/addon-clipboard; terminal.clear() API |

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — Wave 0 setup required |
| Config file | None |
| Quick run command | `npm run build` (type check only) |
| Full suite command | `npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CMD-01 | Command buttons render with labels | Visual smoke | Manual only | ❌ Wave 0 |
| CMD-02 | Button states change correctly | Visual smoke | Manual only | ❌ Wave 0 |
| CMD-03 | Kill command terminates process | Integration | Manual only | ❌ Wave 0 |
| CMD-04 | Shell plugin invokes claude CLI | Integration | Manual only | ❌ Wave 0 |
| OUT-01 | Output streams in real-time | Visual smoke | Manual only | ❌ Wave 0 |
| OUT-02 | ANSI colors render | Visual smoke | Manual only | ❌ Wave 0 |
| OUT-03 | Auto-scroll pauses on user scroll | Interaction smoke | Manual only | ❌ Wave 0 |
| OUT-04 | Copy and clear work | Interaction smoke | Manual only | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run build` (TypeScript type check)
- **Per wave merge:** `npm run build`
- **Phase gate:** Manual smoke test of all button states and output streaming

### Wave 0 Gaps

- [ ] `tests/` directory structure
- [ ] Test framework choice (Vitest recommended for Vite projects)
- [ ] Component test setup for React components
- [ ] Integration test setup for Tauri commands

**Justification:** Phase 2 is primarily visual and interactive (button states, terminal rendering, scroll behavior). Automated tests would require complex setup (Tauri test harness, xterm.js mocking). Manual smoke testing is more practical for this phase.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Command argument validation in shell.ts (DANGEROUS_PATTERNS check) |
| V7 Error Handling | yes | Try-catch around Command.spawn(), user-visible error messages |

### Known Threat Patterns for Tauri + CLI Execution

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Command injection via user input | Tampering | Existing DANGEROUS_PATTERNS validation in shell.ts; ALLOWED_COMMANDS whitelist |
| Privilege escalation via spawned process | Elevation | claude CLI runs at user privileges; no elevation needed |
| Path traversal in command args | Tampering | Input validation in shell.ts blocks dangerous patterns |

## Sources

### Primary (HIGH confidence)

- @xterm/xterm README — Installation, API, addon usage [CITED: github.com/xtermjs/xterm.js]
- @tauri-apps/plugin-shell API — Command.create(), spawn(), stdout/stderr events [VERIFIED: npm package v2.3.5]
- Tauri v2 capabilities system — Permission configuration [VERIFIED: src-tauri/capabilities/main.json]
- CLAUDE.md — Project constraints and stack decisions [VERIFIED: project root]
- 02-CONTEXT.md — Locked decisions D-01 through D-15 [VERIFIED: phase directory]

### Secondary (MEDIUM confidence)

- xterm.js React integration patterns — Community best practices for useEffect cleanup
- Zustand store patterns — Established in existing cliStore.ts, uiStore.ts, projectStore.ts

### Tertiary (LOW confidence)

- None — all claims verified or cited

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified via npm registry
- Architecture: HIGH - Based on official xterm.js and Tauri docs
- Pitfalls: HIGH - Common issues documented in xterm.js community
- Code examples: HIGH - Sourced from official READMEs and API docs

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (30 days - xterm.js and Tauri v2 are stable)
