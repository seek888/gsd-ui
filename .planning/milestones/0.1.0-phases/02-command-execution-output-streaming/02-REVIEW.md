---
phase: 02-command-execution-output-streaming
reviewed: 2026-04-13T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - package.json
  - src/components/terminal/CommandSidebar.tsx
  - src/components/terminal/JumpToBottom.tsx
  - src/components/terminal/TerminalOutput.tsx
  - src/lib/gsdCommands.ts
  - src/lib/shell.ts
  - src/lib/xtermTheme.ts
  - src/main.tsx
  - src/stores/cliStore.ts
  - src/views/TerminalView.tsx
findings:
  critical: 4
  warning: 3
  info: 2
  total: 9
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-13
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Reviewed all source files for the command execution and output streaming feature. The implementation demonstrates good security practices with command validation (allowlist, dangerous pattern detection) and proper React patterns (stable callbacks, cleanup hooks).

However, several critical issues were identified:

1. **Memory leaks** in the CLI store - the `onClose` callback is never cleaned up
2. **Broken data flow** - output is captured but never written to the terminal
3. **Incomplete UI state management** - command buttons don't reflect completion status
4. **Resource cleanup** missing for running processes when starting new commands

The security posture is strong with proper command injection protections, and Tauri v2 APIs are used correctly.

## Critical Issues

### CR-01: Memory leak in cliStore.ts - onClose callback never cleaned up

**File:** `src/stores/cliStore.ts:60-62`
**Issue:** The `onClose` callback registered on line 60-62 is never cleaned up. When a component unmounts or a new command is executed, the old callback remains active, causing:
- Stale state updates after component unmount
- Memory leaks from accumulating callbacks
- Potential state corruption if multiple commands run in sequence

**Fix:**
```typescript
// Store the close handler so it can be cleaned up
let closeHandler: ((data: { code: number | null; signal: number | null }) => void) | null = null;

executeCommand: async (name, args) => {
  const { clearOutput, runningProcess } = get();

  // Kill any existing process before starting a new one
  if (runningProcess) {
    await runningProcess.child.kill();
  }
  clearOutput();

  return new Promise((resolve, reject) => {
    runCommand(
      name,
      args,
      (data) => get().appendOutput(data, 'stdout'),
      (data) => get().appendOutput(data, 'stderr')
    ).then((commandWithEvents) => {
      const { child, onClose } = commandWithEvents;
      set({
        runningProcess: { pid: child.pid, name, child, command: commandWithEvents },
        isRunning: true,
      });
      resolve(child.pid);

      // Clean up previous handler if exists
      if (closeHandler) {
        // Note: Tauri's Command doesn't expose off() for close events
        // We need to track if this callback is for the current process
        const currentPid = child.pid;
        closeHandler = ((data: { code: number | null; signal: number | null }) => {
          // Only process if this is still the current process
          const state = get();
          if (state.runningProcess?.pid === currentPid) {
            set({ runningProcess: null, isRunning: false });
          }
        })();
        onClose(closeHandler);
      }
    }).catch(reject);
  });
},
```

### CR-02: Output never written to terminal instance

**File:** `src/stores/cliStore.ts:67-75`
**Issue:** The `appendOutput` function stores output in state, but nothing writes this output to the xterm.js terminal instance stored in `terminalRef`. The terminal will remain empty even when commands produce output.

**Fix:**
```typescript
appendOutput: (line, source = 'stdout') => {
  const { terminalRef } = get();
  set((state) => {
    const newOutput = [...state.output, `[${source}] ${line}`];
    if (newOutput.length > MAX_OUTPUT_LINES) {
      newOutput.splice(0, newOutput.length - MAX_OUTPUT_LINES);
    }

    // Write to terminal instance
    if (terminalRef) {
      terminalRef.write(`${line}\r\n`);
    }

    return { output: newOutput };
  });
},
```

### CR-03: Command state never transitions from running to success/failure

**File:** `src/components/terminal/CommandSidebar.tsx:103-126`
**Issue:** The `handleCommandClick` function sets the command state to 'running' but never transitions to 'success' or 'failure' based on process completion. The comment on line 116 says "Success/failure will be determined by whether an error occurred" but this logic is never implemented.

**Fix:**
```typescript
const handleCommandClick = async (command: GSDCommand) => {
  try {
    setCommandStates((prev) => {
      const next = new Map(prev);
      next.set(command.id, 'running');
      return next;
    });

    await executeCommand(command.cliCommand, command.args);

    // Wait for process completion by polling the store
    const checkCompletion = () => {
      const { isRunning } = useCLIStore.getState();
      if (!isRunning) {
        // Process completed - determine success/failure
        const { error } = useCLIStore.getState();
        setCommandStates((prev) => {
          const next = new Map(prev);
          next.set(command.id, error ? 'failure' : 'success');
          return next;
        });
      } else {
        // Still running, check again
        setTimeout(checkCompletion, 100);
      }
    };
    checkCompletion();
  } catch (error) {
    setCommandStates((prev) => {
      const next = new Map(prev);
      next.set(command.id, 'failure');
      return next;
    });
    console.error(`Failed to execute command ${command.id}:`, error);
  }
};
```

### CR-04: No cleanup of running process when starting new command

**File:** `src/stores/cliStore.ts:41-65`
**Issue:** When `executeCommand` is called while another command is already running, the old process is not killed. This causes:
- Multiple processes running simultaneously
- Resource leaks (file handles, memory)
- Conflicting output in the terminal

**Fix:**
```typescript
executeCommand: async (name, args) => {
  const { clearOutput, runningProcess } = get();

  // Kill existing process before starting new one
  if (runningProcess) {
    try {
      await runningProcess.child.kill();
    } catch (err) {
      console.error('Failed to kill existing process:', err);
    }
  }

  clearOutput();
  // ... rest of function
},
```

## Warnings

### WR-01: Unsafe internal API access in TerminalOutput

**File:** `src/components/terminal/TerminalOutput.tsx:65`
**Issue:** The code accesses xterm.js internal APIs via `(term as any)._core._viewport._ydisp`. These internal APIs are not part of the public contract and may break or change behavior without warning in future versions.

**Fix:**
```typescript
// Use the public API for detecting scroll position
const handleScroll = () => {
  const buffer = term.buffer.active;
  const bufferHeight = buffer.length;
  // Use _ydisp is unfortunately the only way currently
  // File an issue with xterm.js for a public API
  const viewportY = (term as any)._core?.viewport?._ydisp || 0;
  const threshold = 100;

  const isNearBottom = bufferHeight - viewportY < threshold;
  setUserScrolled(!isNearBottom);
};
```

Or consider using a debounce on the ` onData ` event to detect user activity vs programmatic output.

### WR-02: executeCommand promise resolves before process completion

**File:** `src/stores/cliStore.ts:57`
**Issue:** The `executeCommand` promise resolves immediately after `spawn()` returns (line 57), not when the process actually completes. This causes the caller to think the command finished when it's still running.

**Fix:**
```typescript
executeCommand: async (name, args) => {
  const { clearOutput, runningProcess } = get();

  if (runningProcess) {
    await runningProcess.child.kill();
  }
  clearOutput();

  return new Promise((resolve, reject) => {
    runCommand(
      name,
      args,
      (data) => get().appendOutput(data, 'stdout'),
      (data) => get().appendOutput(data, 'stderr')
    ).then((commandWithEvents) => {
      const { child, onClose } = commandWithEvents;
      const pid = child.pid;

      set({
        runningProcess: { pid, name, child, command: commandWithEvents },
        isRunning: true,
      });

      // Only resolve when process closes
      onClose((data) => {
        set({ runningProcess: null, isRunning: false });
        resolve(pid);
      });
    }).catch((err) => {
      set({ isRunning: false, error: String(err) });
      reject(err);
    });
  });
},
```

### WR-03: Missing error handling for clipboard writeText

**File:** `src/views/TerminalView.tsx:24`
**Issue:** The `navigator.clipboard.writeText()` call can fail (permission denied, not HTTPS, etc.) but there's no error handling or user feedback.

**Fix:**
```typescript
const handleCopy = useCallback(() => {
  const selection = terminalRef?.getSelection();
  if (selection) {
    navigator.clipboard.writeText(selection)
      .catch((err) => {
        console.error('Failed to copy to clipboard:', err);
        // Could show a toast notification here
      });
  }
}, [terminalRef]);
```

## Info

### IN-01: Unused import of CheckCircle in CommandSidebar

**File:** `src/components/terminal/CommandSidebar.tsx:2`
**Issue:** `CheckCircle` is imported from `lucide-react` but also defined in `ICON_MAP` on line 26. The import is redundant since it's already in the map.

**Fix:** Remove `CheckCircle` from the import statement on line 2:
```typescript
import { X, Loader2, ArrowRight, Activity, FileCode, Play, MessageSquare } from 'lucide-react';
```

### IN-02: Unnecessary useState in main.tsx

**File:** `src/main.tsx:6-9`
**Issue:** The `useState` hook with `status` is unnecessary because the state is immediately set in `useEffect` and never changed again. A simple constant would suffice.

**Fix:**
```typescript
function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold">GSD UI</h1>
      <p className="text-muted-foreground mt-2">Status: GSD UI initialized</p>
    </div>
  );
}
```

---

_Reviewed: 2026-04-13_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
