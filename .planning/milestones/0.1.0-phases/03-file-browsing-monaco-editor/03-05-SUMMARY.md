---
phase: 03-file-browsing-monaco-editor
plan: 05
subsystem: ui
tags: [file-watching, tauri, fs-plugin, external-change, debounce]

# Dependency graph
requires:
  - phase: 03-file-browsing-monaco-editor
    plan: 01
    provides: DocumentsView, fileStore, FileTree foundation
affects:
  - 03-06+
  - command-execution

provides:
  - Debounced file watcher on .planning/ directory
  - Auto-refresh file tree on external file changes
  - External modification banner with Reload/Keep local options
  - Watcher cleanup on component unmount

# Tech tracking
tech-stack:
  added:
    - @tauri-apps/plugin-fs watchImmediate API
  patterns:
    - Debounced callback pattern with cancel support
    - External modification tracking in Zustand store
    - JavaScript-side debouncing on top of fs.watch events

key-files:
  created:
    - src/lib/watchers.ts
  modified:
    - src/stores/fileStore.ts
    - src/views/DocumentsView.tsx

key-decisions:
  - "Used watchImmediate + JS-side debounce instead of watch() with delayMs due to TS overload resolution bug with bundler moduleResolution"
  - "refreshFileTree lives in fileStore (not FileTree) so DocumentsView can call it externally"
  - "Yellow banner (not modal) for external modification prompt per D-11 research decision"
  - "Reloading discards local unsaved changes (isDirty=false) per D-11 spec"

patterns-established:
  - "Module-level helper functions (buildFileTree) avoid circular imports while staying close to consuming code"
  - "Store actions for external concerns (setExternalModification) keep UI components declarative"

requirements-completed: [FILE-05]

# Metrics
duration: 8min
completed: 2026-04-13
---

# Phase 3 Plan 5: File Watching with Debounced Refresh Summary

**Debounced file watcher on .planning/ with external change detection, yellow banner prompt, and auto-refresh**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-13T14:37:26Z
- **Completed:** 2026-04-13T14:45:27Z
- **Tasks:** 5
- **Files modified:** 3 created, 1 modified

## Accomplishments
- Created watchers.ts with createDebouncedCallback and watchDirectory utilities
- Extended fileStore with external modification tracking and refreshFileTree action
- Initialized file watcher on DocumentsView mount with cleanup on unmount
- Extracted directory scanning logic into fileStore for external use
- Added yellow banner prompt with Reload and Keep local buttons

## Task Commits

Each task was committed atomically:

1. **Task 1: Create watchers utility library with debounce** - `bcf2620` (feat)
2. **Task 2: Extend fileStore with external change handling** - `fcb0f94` (feat)
3. **Task 3-5: File watcher initialization + scan extraction + prompt UI** - `e4b7e26` (feat)
4. **Type fix: plugin-fs overload resolution workaround** - `1b5759c` (fix)

## Files Created/Modified
- `src/lib/watchers.ts` - Debounced callback + watchDirectory with 500ms debounce
- `src/stores/fileStore.ts` - Added externalModification, reloadCurrentFile, refreshFileTree, buildFileTree helper
- `src/views/DocumentsView.tsx` - File watcher useEffect, external modification banner with Reload/Keep local

## Decisions Made
- Used watchImmediate + JS-side debounce instead of watch() with delayMs due to TypeScript overload resolution bug with bundler moduleResolution (cast via `as unknown as WatchFn`)
- refreshFileTree lives in fileStore (not FileTree) so DocumentsView can call it externally
- Yellow banner (not modal) for external modification prompt per D-11 research decision
- Reloading discards local unsaved changes (isDirty=false) per D-11 spec

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript overload resolution bug with plugin-fs watch API**
- **Found during:** Task 1 (watchers.ts implementation)
- **Issue:** TypeScript resolved watch() to the 2-arg overload `watch(paths, cb)` instead of 3-arg `watch(paths, cb, options)`, making `{ recursive: true }` appear as an invalid callback argument. Affects both `watch()` and `watchImmediate()`.
- **Fix:** Switched to `watchImmediate` (no 2-arg overload) and used `as unknown as WatchFn` type assertion to force correct parameter ordering.
- **Files modified:** src/lib/watchers.ts
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** `1b5759c` (fix commit, part of Task 1)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The type fix was necessary for compilation. Tasks 3-5 were combined into one commit since they all modified the same file (DocumentsView.tsx). No functional deviation from plan.

## Issues Encountered
- None beyond the TypeScript overload resolution bug (auto-fixed)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
File watching infrastructure is complete. Next plan (03-06) can use the watcher foundation.
- Ready for: Phase 3 plan 06

---
*Phase: 03-file-browsing-monaco-editor*
*Completed: 2026-04-13*
