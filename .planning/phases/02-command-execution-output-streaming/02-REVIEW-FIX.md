---
phase: 02
fixed_at: 2026-04-13T00:00:00Z
review_path: .planning/phases/02-command-execution-output-streaming/02-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-04-13
**Source review:** .planning/phases/02-command-execution-output-streaming/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (4 Critical, 3 Warning)
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: Memory leak in cliStore.ts - onClose callback never cleaned up

**Files modified:** `src/stores/cliStore.ts`
**Commit:** `4195c29`
**Applied fix:** Added PID check in `onClose` callback to prevent stale callbacks from affecting new commands. The callback now verifies that the PID in the callback matches the current `runningProcess.pid` before clearing the state.

### CR-02: Output never written to terminal instance

**Files modified:** `src/stores/cliStore.ts`
**Commit:** `faf11d4`
**Applied fix:** Added `terminalRef.write()` call in `appendOutput()` function to write output lines to the xterm.js terminal instance. Output is now displayed in real-time as commands execute.

### CR-03: Command state never transitions from running to success/failure

**Files modified:** `src/components/terminal/CommandSidebar.tsx`
**Commit:** `ad962b4`
**Applied fix:** Refactored `handleCommandClick` to set running state before executing, then transition to 'success' on successful completion or 'failure' on error. With WR-02 also fixed (executeCommand now resolves on completion), the UI state now correctly reflects command lifecycle.

### CR-04: No cleanup of running process when starting new command

**Files modified:** `src/stores/cliStore.ts`
**Commit:** `9bcca7e`
**Applied fix:** Added process cleanup at the start of `executeCommand()` to kill any existing running process before starting a new one. This prevents multiple processes running simultaneously and resource leaks.

### WR-01: Unsafe internal API access in TerminalOutput

**Files modified:** `src/components/terminal/TerminalOutput.tsx`
**Commit:** `9d80f30`
**Applied fix:** Added optional chaining (`?.`) when accessing `_core.viewport._ydisp` and updated comments to acknowledge this is the only available API, suggesting to file an issue with xterm.js for a public API.

### WR-02: Promise resolves too early - executeCommand resolves before process completes

**Files modified:** `src/stores/cliStore.ts`
**Commit:** `70662a9`
**Applied fix:** Moved the `resolve()` call inside the `onClose` callback so the promise only resolves when the process actually terminates. Added error state update in the catch handler as well.

### WR-03: Missing clipboard error handling

**Files modified:** `src/views/TerminalView.tsx`
**Commit:** `3f6e441`
**Applied fix:** Added `.catch()` handler to `navigator.clipboard.writeText()` call to log errors to console. Added comment suggesting toast notification for future enhancement.

## Skipped Issues

None - all in-scope findings were successfully fixed.

---

_Fixed: 2026-04-13_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
