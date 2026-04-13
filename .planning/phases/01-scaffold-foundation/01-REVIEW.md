---
phase: 01-scaffold-foundation
reviewed: 2025-04-13T00:00:00Z
depth: standard
files_reviewed: 29
files_reviewed_list:
  - src-tauri/src/main.rs
  - src-tauri/src/lib.rs
  - src-tauri/Cargo.toml
  - src-tauri/tauri.conf.json
  - src-tauri/capabilities/main.json
  - src/main.tsx
  - src/App.tsx
  - src/lib/utils.ts
  - src/lib/store.ts
  - src/lib/shell.ts
  - src/lib/fs.ts
  - src/stores/uiStore.ts
  - src/stores/projectStore.ts
  - src/stores/cliStore.ts
  - src/stores/index.ts
  - src/components/Sidebar.tsx
  - src/components/NavItem.tsx
  - src/components/AppShell.tsx
  - src/components/WelcomePage.tsx
  - src/components/WelcomeLayout.tsx
  - src/components/DirectoryPicker.tsx
  - src/views/DashboardView.tsx
  - src/views/RoadmapView.tsx
  - src/views/TerminalView.tsx
  - src/views/DocumentsView.tsx
  - src/components/ui/button.tsx
  - src/components/ui/card.tsx
  - src/components/ui/scroll-area.tsx
  - tsconfig.json
  - vite.config.ts
  - tailwind.config.cjs
  - package.json
findings:
  critical: 3
  warning: 8
  info: 4
  total: 15
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2025-04-13
**Depth:** standard
**Files Reviewed:** 29
**Status:** issues_found

## Summary

Reviewed 29 source files for the GSD UI foundation scaffold phase. The codebase demonstrates good TypeScript discipline with strict mode enabled and follows the established tech stack (Tauri v2 + React + Zustand). However, several security concerns and potential bugs were identified that should be addressed before proceeding to subsequent phases.

**Key concerns:**
- CSP allows `unsafe-eval` which creates XSS vulnerabilities
- CLI output array grows unbounded (memory leak risk)
- Missing process exit event handling causes state inconsistency
- Shell command arguments lack validation

## Critical Issues

### CR-01: CSP Allows `unsafe-eval` - XSS Vulnerability

**File:** `src-tauri/tauri.conf.json:28`

**Issue:** The Content Security Policy permits `unsafe-eval` in `script-src`, which allows `eval()` and similar dynamic code evaluation. This significantly increases the attack surface for XSS attacks. While Tauri's desktop model reduces web-based XSS risk, this still violates security best practices.

```json
"script-src": "'self' 'unsafe-eval' blob:",
```

**Fix:** Remove `unsafe-eval` unless absolutely required by a dependency. If Monaco Editor or another library requires it, consider using a non-evaluating build or sandbox the component.

```json
"script-src": "'self' blob:",
```

### CR-02: Unbounded Array Growth in CLI Store

**File:** `src/stores/cliStore.ts:46-50`

**Issue:** The `output` array grows indefinitely with each command execution. No size limit or rotation policy exists. Long-running commands with substantial output will cause memory exhaustion.

```typescript
appendOutput: (line, source = 'stdout') => {
  set((state) => ({
    output: [...state.output, `[${source}] ${line}`],
  }));
},
```

**Fix:** Implement a size limit (e.g., 10,000 lines) with FIFO eviction:

```typescript
const MAX_OUTPUT_LINES = 10000;

appendOutput: (line, source = 'stdout') => {
  set((state) => {
    const newOutput = [...state.output, `[${source}] ${line}`];
    if (newOutput.length > MAX_OUTPUT_LINES) {
      newOutput.splice(0, newOutput.length - MAX_OUTPUT_LINES);
    }
    return { output: newOutput };
  });
},
```

### CR-03: Missing Process Exit Event Handling

**File:** `src/stores/cliStore.ts:26-44`

**Issue:** The `executeCommand` function spawns a process but never listens for the process exit event. The `isRunning` state remains `true` even after command completion, and the `runningProcess` is never cleared on normal exit.

```typescript
executeCommand: async (name, args) => {
  const { clearOutput } = get();
  clearOutput();

  return new Promise((resolve, reject) => {
    runCommand(/* ... */).then((child) => {
      set({
        runningProcess: { pid: child.pid, name, child },
        isRunning: true,
      });
      resolve(child.pid);
      // No exit handler attached!
    }).catch(reject);
  });
},
```

**Fix:** Attach exit event listeners to properly update state:

```typescript
executeCommand: async (name, args) => {
  const { clearOutput } = get();
  clearOutput();

  return new Promise((resolve, reject) => {
    runCommand(
      name,
      args,
      (data) => get().appendOutput(data, 'stdout'),
      (data) => get().appendOutput(data, 'stderr')
    ).then((child) => {
      set({
        runningProcess: { pid: child.pid, name, child },
        isRunning: true,
      });
      resolve(child.pid);

      // Handle process exit
      child.on('close', (data) => {
        set({ runningProcess: null, isRunning: false });
      });
    }).catch(reject);
  });
},
```

## Warnings

### WR-01: Incorrect Ref Forwarding to ScrollArea Component

**File:** `src/views/TerminalView.tsx:32`

**Issue:** The `scrollRef` is passed to `ScrollArea` component, but `ScrollArea` does not forward refs to its internal viewport. The auto-scroll effect will not work.

```typescript
const scrollRef = useRef<HTMLDivElement>(null);

// ...

<ScrollArea className="flex-1" ref={scrollRef}>
```

**Fix:** Use Radix's `ViewportRef` context or access the viewport directly:

```typescript
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

// In the component:
<ScrollArea className="flex-1">
  <ScrollAreaPrimitive.Viewport ref={scrollRef}>
    {/* content */}
  </ScrollAreaPrimitive.Viewport>
</ScrollArea>
```

### WR-02: Shell Command Arguments Not Validated

**File:** `src/lib/shell.ts:26-36`

**Issue:** The `runCommand` function accepts arbitrary program and arguments without validation. While Tauri's plugin-shell provides some protection, missing validation could allow unexpected command execution.

```typescript
export async function runCommand(
  program: string,
  args: string[],
  onStdout: (data: string) => void,
  onStderr: (data: string) => void
): Promise<Child> {
  const cmd = Command.create(program, args);
  // No validation of program or args
```

**Fix:** Add allowlist validation for allowed commands:

```typescript
const ALLOWED_COMMANDS = ['claude', 'npm', 'node', 'git'] as const;

export async function runCommand(
  program: string,
  args: string[],
  onStdout: (data: string) => void,
  onStderr: (data: string) => void
): Promise<Child> {
  if (!ALLOWED_COMMANDS.includes(program as any)) {
    throw new Error(`Command not allowed: ${program}`);
  }
  // Also validate args for injection patterns (e.g., ';', '&', '|', '`')
  const cmd = Command.create(program, args);
```

### WR-03: Silent Error Swallowing in Multiple Stores

**File:** `src/stores/projectStore.ts:35-37`, `src/stores/cliStore.ts:54-59`

**Issue:** Errors are caught, logged to console, but never propagated to the UI. Users have no indication that operations failed.

```typescript
} catch (err) {
  console.error('Failed to load settings:', err);
}
```

**Fix:** Add error state to stores for UI display:

```typescript
interface ProjectState {
  // ...
  error: string | null;
  clearError: () => void;
}

// In loadSettings:
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  set({ error: `Failed to load settings: ${message}` });
}
```

### WR-04: No Path Validation for Selected Project Directory

**File:** `src/components/DirectoryPicker.tsx:11-24`

**Issue:** The selected directory path is used directly without validation. Malicious or malformed paths could cause unexpected behavior. No verification that the directory contains a valid `.planning/` folder.

```typescript
if (selected && typeof selected === 'string') {
  await saveProjectPath(selected);  // No validation
}
```

**Fix:** Validate path structure and permissions:

```typescript
if (selected && typeof selected === 'string') {
  // Verify it's a valid directory
  const { exists } = await import('@tauri-apps/plugin-fs');
  const { readDir } = await import('@tauri-apps/plugin-fs');

  try {
    const entries = await readDir(selected);
    const hasPlanningDir = entries.some(e => e.name === '.planning' && e.isDirectory);

    if (!hasPlanningDir) {
      // Show warning or error
      console.warn('Selected directory does not contain .planning folder');
    }

    await saveProjectPath(selected);
  } catch (err) {
    console.error('Invalid directory:', err);
  }
}
```

### WR-05: Type Assertion Bypasses Type Safety

**File:** `src/components/Sidebar.tsx:7-12`

**Issue:** The `NAV_ITEMS` array uses `typeof LayoutDashboard` which works but relies on type inference. If icons were imported differently, this could silently break.

```typescript
const NAV_ITEMS: { icon: typeof LayoutDashboard; label: string; view: ActiveView }[] = [
```

**Fix:** Use explicit type import from lucide-react:

```typescript
import type { LucideIcon } from 'lucide-react';

const NAV_ITEMS: { icon: LucideIcon; label: string; view: ActiveView }[] = [
```

### WR-06: React Array Keys Using Index

**File:** `src/views/TerminalView.tsx:40-47`

**Issue:** Using array index as key for terminal output lines. While acceptable for append-only arrays, this can cause issues with React reconciliation if filtering or other operations are added.

```typescript
{output.map((line, i) => (
  <div key={i} className="whitespace-pre-wrap break-all">
```

**Fix:** Use a unique identifier combining index and a prefix/hash:

```typescript
{output.map((line, i) => (
  <div key={`line-${i}-${line.length}`} className="whitespace-pre-wrap break-all">
```

### WR-07: Missing Cleanup on Component Unmount

**File:** `src/main.tsx:11-18`

**Issue:** The `useEffect` with an async function has no cleanup. If the component unmounts before the async operations complete, it could cause state updates on unmounted components (React warning).

```typescript
useEffect(() => {
  const init = async () => {
    await loadSettings();
    await detectCli();
  };
  init();
}, []);
```

**Fix:** Add abort controller or cleanup flag:

```typescript
useEffect(() => {
  let mounted = true;
  const init = async () => {
    await loadSettings();
    if (mounted) await detectCli();
  };
  init();
  return () => { mounted = false; };
}, []);
```

### WR-08: Missing Error Handling in Shell Command Execution

**File:** `src/lib/shell.ts:31-36`

**Issue:** The `runCommand` function registers event handlers but doesn't handle the case where event registration fails. Errors during spawn are caught in `cliStore.ts` but event handler errors could be lost.

```typescript
cmd.stdout.on('data', onStdout);
cmd.stderr.on('data', onStderr);
return await cmd.spawn();
```

**Fix:** Wrap event registration in try-catch or add error handlers:

```typescript
try {
  cmd.stdout.on('data', onStdout);
  cmd.stderr.on('data', onStderr);
} catch (err) {
  onStderr(`Failed to attach to command output: ${err}`);
}
return await cmd.spawn();
```

## Info

### IN-01: Unused Import in Rust Code

**File:** `src-tauri/src/lib.rs:1`

**Issue:** The `Manager` import is marked as unused but still present. While the `#[allow(unused_imports)]` suppresses warnings, this is dead code.

```rust
#[allow(unused_imports)]
use tauri::Manager;
```

**Fix:** Remove the unused import:

```rust
// Remove this line
```

### IN-02: Console.error Statements - Debug Artifacts

**File:** Multiple files (`src/stores/cliStore.ts:58`, `src/stores/projectStore.ts:36`, `src/components/DirectoryPicker.tsx:22`)

**Issue:** Production code contains `console.error` calls. While useful during development, these should use proper error logging for production builds.

```typescript
console.error('Failed to load settings:', err);
```

**Fix:** Replace with a proper logging abstraction or error state:

```typescript
// Use a logging utility that can be stripped in production
// Or set error state for UI display
```

### IN-03: Hardcoded Magic Numbers

**File:** `src/components/Sidebar.tsx:19`, `src/views/TerminalView.tsx:36`

**Issue:** Hardcoded dimension values (`w-[200px]`, `text-sm`) without centralized constants. While Tailwind makes this acceptable, a design tokens file would improve maintainability.

```typescript
className="w-[200px] h-screen shrink-0 border-r bg-card flex flex-col"
```

**Fix:** Define layout constants:

```typescript
// src/lib/constants.ts
export const LAYOUT = {
  SIDEBAR_WIDTH: '200px',
  MIN_WIDTH: '900px',
  MIN_HEIGHT: '600px',
} as const;

// Usage
className={`w-[${LAYOUT.SIDEBAR_WIDTH}] h-screen shrink-0 border-r bg-card flex flex-col`}
```

### IN-04: Unused Dead Code - App.tsx

**File:** `src/App.tsx`

**Issue:** This file appears to be a placeholder or initial scaffold that has been superseded by `src/main.tsx`. It's imported by nothing in the codebase.

**Fix:** Remove `src/App.tsx` or repurpose as the actual app entry point if intended.

---

_Reviewed: 2025-04-13_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
