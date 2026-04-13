---
status: testing
phase: 01-scaffold-foundation
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md
started: 2026-04-13T02:30:00Z
updated: 2026-04-13T02:31:00Z
---

## Current Test

number: 2
name: CLI Detection - Installed
expected: |
  When Claude CLI is installed, the app shows the main interface (sidebar + views) instead of the welcome page. The CLI status indicator shows "Installed" with version number.
awaiting: user response

## Tests

### 1. Application Launch
expected: Run `npm run dev` from the project root. The Tauri development window opens without errors. Vite dev server starts on port 1420. No TypeScript or build errors in terminal.
result: pass

### 2. CLI Detection - Installed
expected: When Claude CLI is installed, the app shows the main interface (sidebar + views) instead of the welcome page. The CLI status indicator shows "Installed" with version number.
result: pending

### 3. CLI Detection - Not Installed
expected: When Claude CLI is NOT installed, the app shows a full-screen WelcomePage with install instructions including `npm install -g @anthropic/claude-code` command and a "Check Again" button.
result: pending

### 4. Directory Picker
expected: Clicking "Choose Directory" opens a native folder selection dialog. After selecting a folder, the project path is saved and persists across app restarts.
result: pending

### 5. Sidebar Navigation
expected: Left sidebar is 200px wide with 4 navigation items: Dashboard, Roadmap, Terminal, Documents. Clicking each item switches the main content area. The active item is highlighted with background color.
result: pending

### 6. Dashboard View
expected: Dashboard view shows placeholder content indicating Phase 4 will populate progress data. If no project is selected, shows DirectoryPicker.
result: pending

### 7. Roadmap View
expected: Roadmap view shows placeholder content indicating Phase 4 will populate phase list.
result: pending

### 8. Terminal View
expected: Terminal view shows empty state with placeholder text "Run a command to see output here". The terminal area has auto-scroll capability (will be used in Phase 2).
result: pending

### 9. Documents View
expected: Documents view shows placeholder content indicating Phase 3 will implement file browsing and Monaco editor.
result: pending

### 10. Settings Persistence
expected: Selected project path is saved to Tauri store. Closing and reopening the app restores the last selected project directory automatically.
result: pending

## Summary

total: 10
passed: 1
issues: 0
pending: 9
skipped: 0
blocked: 0

## Gaps

none yet
