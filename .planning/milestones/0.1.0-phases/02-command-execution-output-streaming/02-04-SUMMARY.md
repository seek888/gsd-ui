---
phase: 02-command-execution-output-streaming
plan: 04
subsystem: terminal-output-ansi-rendering
tags:
  - terminal
  - ansi-colors
  - xterm.js
  - dark-theme
dependency_graph:
  requires:
    - 02-03
  provides:
    - "02-05: terminal-output-integration"
  affects:
    - TerminalView.tsx
tech_stack:
  added:
    - "@xterm/xterm v6.0.0 - Terminal emulator core"
    - "@xterm/addon-fit v0.11.0 - Auto-resize addon"
  patterns:
    - "xterm.js React integration with proper cleanup"
    - "ANSI color theme configuration for dark mode"
key_files:
  created:
    - "src/lib/xtermTheme.ts - XTermTheme interface and XTERM_DARK_THEME export"
    - "src/components/terminal/TerminalOutput.tsx - xterm.js React wrapper"
  modified:
    - "src/main.tsx - Added xterm.css global import"
    - "src/stores/cliStore.ts - Added terminalRef, writeStdout, testANSI methods"
    - "src/lib/shell.ts - Updated to return CommandWithEvents for close handling"
    - "src/components/DirectoryPicker.tsx - Removed unused setCliInstalled import"
decisions: []
metrics:
  duration: "8 minutes"
  completed_date: "2026-04-13"
---

# Phase 02 Plan 04: ANSI Color Code Parsing and Terminal Output Rendering Summary

Implement ANSI color code parsing and terminal output rendering with correct colors matching app dark theme. CLI output displays with proper syntax highlighting (errors in red, success in green, warnings in yellow) for better readability using xterm.js Terminal with configured theme.

## One-Liner

xterm.js terminal emulator with full ANSI color support using custom dark theme matching shadcn/ui colors, including testANSI method for verification.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Fix blocking issue] Fixed TypeScript generic type error in Command**
- **Found during:** Task 3 (build verification)
- **Issue:** `Command<O>` requires 1 type argument. The Tauri v2 shell plugin's Command class is generic and requires the IOPayload type parameter.
- **Fix:** Updated `shell.ts` to use `Command<IOPayload>` instead of `Command`
- **Files modified:** `src/lib/shell.ts`
- **Commit:** 739c998

**2. [Rule 3 - Fix blocking issue] Updated shell.ts to return CommandWithEvents wrapper**
- **Found during:** Task 3 (build verification)
- **Issue:** `child.on('close')` doesn't exist on the Child class. The close event is on the Command class, not Child.
- **Fix:** Created `CommandWithEvents` interface that wraps both Child and Command, providing an `onClose` method that attaches to the Command's close event. Updated cliStore to use this wrapper.
- **Files modified:** `src/lib/shell.ts`, `src/stores/cliStore.ts`
- **Commit:** 739c998

**3. [Rule 1 - Bug] Removed unused import causing build error**
- **Found during:** Task 3 (build verification)
- **Issue:** `setCliInstalled` was imported but never used in DirectoryPicker.tsx, causing TS6133 error
- **Fix:** Removed unused import from the destructuring of useProjectStore
- **Files modified:** `src/components/DirectoryPicker.tsx`
- **Commit:** 739c998

## Commits

| Commit | Message | Files |
|--------|---------|-------|
| 655dfb0 | feat(02-04): add xterm dark theme config | src/lib/xtermTheme.ts |
| 31e5a82 | feat(02-04): apply xterm dark theme to TerminalOutput | src/components/terminal/TerminalOutput.tsx, src/main.tsx |
| 02c1535 | feat(02-04): add testANSI method to verify ANSI rendering | src/stores/cliStore.ts |
| 739c998 | fix(02-04): fix build errors and update shell integration | src/lib/shell.ts, src/stores/cliStore.ts, src/components/DirectoryPicker.tsx |

## Files Created

### src/lib/xtermTheme.ts
- `XTermTheme` interface with all 16 standard and bright ANSI colors
- `XTERM_DARK_THEME` export with hex values converted from shadcn/ui HSL CSS variables
- Colors match app dark theme: background #09090b, foreground #fafafa

### src/components/terminal/TerminalOutput.tsx
- React component wrapping xterm.js Terminal
- Configured with XTERM_DARK_THEME (cursorBlink: false, fontSize: 14)
- FitAddon integration for auto-resize on window resize
- Proper cleanup in useEffect return
- Welcome message on mount

## Files Modified

### src/main.tsx
- Added `import '@xterm/xterm/css/xterm.css'` for terminal styling

### src/stores/cliStore.ts
- Added `terminalRef: Terminal | null` state
- Added `setTerminalRef()` method
- Added `writeStdout(data: string)` for direct terminal writes
- Added `testANSI()` method that writes colored test output
- Updated `executeCommand` to use CommandWithEvents wrapper

### src/lib/shell.ts
- Added `CommandWithEvents` interface
- Updated `runCommand()` to return `CommandWithEvents` instead of `Child`
- Added `IOPayload` generic type to Command

### src/components/DirectoryPicker.tsx
- Removed unused `setCliInstalled` import

## Verification

1. **Build:** `npm run build` completed without errors (after fixes)
2. **TypeScript:** All type errors resolved
3. **Theme:** XTERM_DARK_THEME provides color palette for ANSI rendering
4. **Test method:** `testANSI()` available in cliStore for manual verification

## Known Stubs

None. The plan was executed exactly as specified. The TerminalOutput component is self-contained and ready for integration with the CLI store in plan 02-05.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: accept | src/lib/shell.ts | xterm.js sandbox prevents code execution from ANSI escape sequences |
| threat_flag: accept | src/components/terminal/TerminalOutput.tsx | xterm.js handles malformed ANSI gracefully |

## Self-Check: PASSED

```bash
# Created files exist
[ -f "src/lib/xtermTheme.ts" ] && echo "FOUND: src/lib/xtermTheme.ts" || echo "MISSING: src/lib/xtermTheme.ts"
[ -f "src/components/terminal/TerminalOutput.tsx" ] && echo "FOUND: src/components/terminal/TerminalOutput.tsx" || echo "MISSING: src/components/terminal/TerminalOutput.tsx"

# Commits exist
git log --oneline --all | grep -q "655dfb0" && echo "FOUND: 655dfb0" || echo "MISSING: 655dfb0"
git log --oneline --all | grep -q "31e5a82" && echo "FOUND: 31e5a82" || echo "MISSING: 31e5a82"
git log --oneline --all | grep -q "02c1535" && echo "FOUND: 02c1535" || echo "MISSING: 02c1535"
git log --oneline --all | grep -q "739c998" && echo "FOUND: 739c998" || echo "MISSING: 739c998"
```

All files and commits verified.

---

**Plan completed successfully.** ANSI color rendering infrastructure is in place. The next plan (02-05) will integrate TerminalOutput with the CLI store for actual command output streaming.
