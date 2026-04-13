---
phase: 02
slug: command-execution-output-streaming
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual smoke testing (Phase 2 is visual/interactive) |
| **Config file** | none |
| **Quick run command** | `npm run dev` |
| **Full suite command** | Interactive UAT via `/gsd-verify-work` |
| **Estimated runtime** | ~2 minutes (smoke test) |

---

## Sampling Rate

- **After every task commit:** Run `npm run dev` and smoke test the feature
- **After every plan wave:** Interactive verification via `/gsd-verify-work`
- **Before `/gsd-verify-work`:** Full UAT must pass
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | CMD-01 | — | Command allowlist enforced | manual | `Click command buttons, verify all core commands listed` | ✅ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | CMD-02 | — | No process leakage | manual | `Verify buttons show correct states` | ✅ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | CMD-03 | — | Child process killed on cancel | manual | `Start command, click cancel, verify process terminates` | ✅ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | OUT-01 | — | Output batching 100ms | manual | `Run command, verify output appears in <100ms` | ✅ W0 | ⬜ pending |
| 02-04-01 | 04 | 2 | OUT-02 | — | ANSI colors render correctly | manual | `Run command with colored output, verify colors match` | ✅ W0 | ⬜ pending |
| 02-05-01 | 05 | 2 | OUT-03 | — | Scroll state tracked correctly | manual | `Scroll up, verify auto-scroll pauses, jump button appears` | ✅ W0 | ⬜ pending |
| 02-06-01 | 06 | 3 | OUT-04 | — | Clipboard/clear functionality | manual | `Copy output, verify paste works. Clear, verify empty.` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

**Gap:** No test infrastructure exists. Phase 2 is primarily visual/interactive — manual smoke testing is practical.

- [ ] Manual smoke test checklist (see Per-Task Verification Map above)
- [ ] Vitest framework consideration for future phases (not Wave 0 for Phase 2)

*Rationale:* Phase 2 features are UI-heavy (terminal emulation, button states, scroll behavior). Automated tests would require Playwright or similar. Manual UAT via `/gsd-verify-work` is more efficient for this phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Command button states | CMD-02 | Visual state changes are hard to assert in DOM | 1. Run `npm run dev`. 2. Click a command button. 3. Verify spinner appears. 4. Wait for completion. 5. Verify green check appears then fades. |
| ANSI color rendering | OUT-02 | xterm.js canvas rendering not testable via DOM queries | 1. Run `npm run dev`. 2. Execute a command that produces colored output. 3. Verify red/green/yellow colors render correctly. |
| Smart scroll behavior | OUT-03 | Requires user interaction and viewport state tracking | 1. Run `npm run dev`. 2. Start a long-running command. 3. Scroll up while output is streaming. 4. Verify auto-scroll pauses and "Jump to bottom" button appears. 5. Scroll near bottom. 6. Verify auto-scroll resumes and button hides. |

*All phase behaviors have manual verification.*

---

## Validation Sign-Off

- [ ] All tasks have verification (manual or automated)
- [ ] Sampling continuity: no 3 consecutive tasks without verification
- [ ] Wave 0 covers all MISSING references (N/A for Phase 2 — manual verification)
- [ ] No watch-mode flags
- [ ] Feedback latency < ~30s
- [ ] `nyquist_compliant: true` set in frontmatter after UAT

**Approval:** pending
