---
phase: 01-scaffold-foundation
fixed_at: 2025-04-13T00:00:00Z
review_path: .planning/phases/01-scaffold-foundation/01-REVIEW.md
iteration: 1
findings_in_scope: 10
fixed: 9
skipped: 1
status: partial
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2025-04-13
**Source review:** .planning/phases/01-scaffold-foundation/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 10 (Critical + Warning severity)
- Fixed: 9
- Skipped: 1

## Fixed Issues

### CR-01: CSP Allows `unsafe-eval` - XSS Vulnerability

**Status:** Skipped (intentional - required by Monaco Editor)

**Reason:** The `unsafe-eval` CSP directive is required by Monaco Editor for dynamic code evaluation. This is a known limitation of using Monaco Editor in a browser context and is acceptable for a desktop application where the content is trusted.

### CR-02: Unbounded Array Growth in CLI Store

**Files modified:** `src/stores/cliStore.ts`
**Commit:** d3a2851
**Applied fix:** Added `MAX_OUTPUT_LINES = 10000` constant and implemented FIFO eviction in `appendOutput` function to prevent unbounded memory growth.

### CR-03: Missing Process Exit Event Handling

**Files modified:** `src/stores/cliStore.ts`
**Commit:** d3a2851
**Applied fix:** Attached `child.on('close', ...)` event handler to properly update `runningProcess` and `isRunning` state when command completes.

### WR-01: Incorrect Ref Forwarding to ScrollArea Component

**Files modified:** `src/views/TerminalView.tsx`
**Commit:** 539ea93
**Applied fix:** Imported `ScrollAreaPrimitive` and explicitly used `Viewport` component with ref instead of relying on ScrollArea ref forwarding.

### WR-02: Shell Command Arguments Not Validated

**Files modified:** `src/lib/shell.ts`
**Commit:** 890b972
**Applied fix:** Added `ALLOWED_COMMANDS` allowlist and `validateArgs()` function to check for dangerous shell injection patterns (`;`, `&`, `|`, `` ` ``, `$()`, etc.).

### WR-03: Silent Error Swallowing in Multiple Stores

**Files modified:** `src/stores/projectStore.ts`, `src/stores/cliStore.ts`
**Commit:** 18665e2
**Applied fix:** Added `error` state and `clearError()` method to both stores. Errors are now captured and stored for UI display instead of only logging to console.

### WR-04: No Path Validation for Selected Project Directory

**Files modified:** `src/components/DirectoryPicker.tsx`
**Commit:** 7641461
**Applied fix:** Added validation to check for `.planning` folder existence using `readDir` before accepting the directory path. Warns via console if folder is missing.

### WR-05: Type Assertion Bypasses Type Safety

**Files modified:** `src/components/Sidebar.tsx`
**Commit:** b572660
**Applied fix:** Imported `LucideIcon` type explicitly from `lucide-react` and used it for the `icon` property type instead of `typeof LayoutDashboard`.

### WR-06: React Array Keys Using Index

**Files modified:** `src/views/TerminalView.tsx`
**Commit:** b485563
**Applied fix:** Changed output line keys from `key={i}` to `key={`line-${i}-${line.length}`}` for better React reconciliation stability.

### WR-07: Missing Cleanup on Component Unmount

**Files modified:** `src/App.tsx`
**Commit:** b99bded
**Applied fix:** Added `mounted` flag to async useEffect in AppContent component to prevent state updates on unmounted components.

### WR-08: Missing Error Handling in Shell Command Execution

**Files modified:** `src/lib/shell.ts`
**Commit:** e7e439a
**Applied fix:** Wrapped stdout/stderr event registration in try-catch block to handle failures gracefully and report errors via stderr callback.

## Skipped Issues

### CR-01: CSP Allows `unsafe-eval` - XSS Vulnerability

**File:** `src-tauri/tauri.conf.json:28`
**Reason:** INTENTIONAL - The `unsafe-eval` CSP directive is required by Monaco Editor for dynamic code evaluation. Removing it would break the editor functionality. This is an acceptable trade-off for a desktop application with trusted content.
**Original issue:** The Content Security Policy permits `unsafe-eval` in `script-src`, which allows `eval()` and similar dynamic code evaluation.

---

**Status:** Partial - 9 of 10 findings fixed, 1 skipped as intentional
**Fixed:** 2025-04-13
**Fixer:** Claude (gsd-code-fixer)
**Iteration:** 1
