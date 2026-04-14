# Phase 4: Progress & State Views - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can view all phases with completion status, drill into individual plans to see their completion status, view current session context (recent activity, blockers, key decisions), and see an attention panel with incomplete plans and outstanding items. All progress and state data is sourced from `node gsd-tools.cjs` commands.

</domain>

<decisions>
## Implementation Decisions

### Phase List Layout
- **D-01:** Layout style: **卡片式 (Card)** — 类似 Linear/Notion 的卡片设计，每个阶段一张卡片
- **D-02:** Each card displays: phase name, progress bar, percentage, status badge (已完成/进行中/未开始)
- **D-03:** Card visual hierarchy: clear title at top, progress visualization prominent, status badge in corner

### Progress Visualization
- **D-04:** Three-tier display: **进度条 + 百分比 + 徽章** — 进度条 + 百分比文字 + 状态徽章
- **D-05:** Progress bar: traditional horizontal bar (类似 GitHub Actions style)
- **D-06:** Status badges: "已完成" (green) / "进行中" (yellow) / "未开始" (gray)
- **D-07:** Percentage text: displayed next to progress bar (e.g., "79%")

### Expansion Behavior (Claude's Discretion)
- **D-08:** Click to expand: 手风琴展开（同页） — 点击卡片在下方展开显示计划列表
- **D-09:** Expansion pattern: accordion-style (only one phase expanded at a time, or allow multiple)
- **D-10:** Plan display: each plan shows name, completion status (PLAN.md exists, SUMMARY.md exists), and task count

### Session Context Placement (Claude's Discretion)
- **D-11:** Position: **页面底部区域** — 放在 Dashboard 页面底部作为单独区域
- **D-12:** Layout: separate section below phase cards, reachable by scrolling
- **D-13:** Content: recent activity, blockers, key decisions from STATE.md
- **D-14:** Visual separation: distinct background color or separator to differentiate from phase list

### Data Sources
- **D-15:** Phase progress: `node gsd-tools.cjs roadmap analyze` — returns phases with plan/summary counts, progress percent
- **D-16:** Session state: `node gsd-tools.cjs state-snapshot` — returns recent position, blockers, decisions
- **D-17:** Plan completion: check for PLAN.md and SUMMARY.md existence in phase directories

### Attention Panel
- **D-18:** Content: incomplete plans (no SUMMARY.md), STATE.md blockers, outstanding items
- **D-19:** Placement: can be part of session context section or separate panel (designer's choice based on layout)

### Claude's Discretion
- Accordion behavior: single-expand (only one phase open at a time) vs multi-expand (multiple phases can be open simultaneously)
- Card elevation/shadow styling intensity
- Color scheme for status badges (exact hex codes)
- Typography for phase names and plan names
- Icon usage (whether to include icons alongside text)
- Empty state design when no phases exist
- Loading states while fetching data from gsd-tools CLI

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` — PROG-01 through PROG-05 define Phase 4 requirements

### Tech Stack (from PROJECT.md)
- `.planning/research/STACK.md` — React 18, Tauri v2, TypeScript, shadcn/ui components

### Prior Phase Context
- `.planning/phases/01-scaffold-foundation/01-CONTEXT.md` — 200px sidebar pattern, Zustand state management
- `.planning/phases/02-command-execution-output-streaming/02-CONTEXT.md` — Split view layout pattern
- `.planning/phases/03-file-browsing-monaco-editor/03-CONTEXT.md` — File tree patterns, DocumentsView layout

### gsd-tools CLI Documentation
- `node gsd-tools.cjs roadmap analyze` — Returns structured roadmap data with phases, plans, progress
- `node gsd-tools.cjs state-snapshot` — Returns current session state with position, blockers, decisions

### No External Specs
No external specification documents apply — requirements are fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/views/DashboardView.tsx` — Currently a placeholder from Phase 1, needs full implementation
- `src/views/RoadmapView.tsx` — Another placeholder that may be related or duplicate
- `src/stores/uiStore.ts` — Zustand store with activeView state for navigation
- `src/components/ui/` — shadcn/ui base components (Card, ScrollArea, Badge, Separator, etc.)
- `src/components/ui/card/` — Card component exists for card-based layout

### Established Patterns
- **Sidebar navigation:** 200px fixed width, NavItem component with icon + label
- **Zustand stores:** `create((set, get) => ({ state, actions }))` pattern
- **Split view layouts:** flex-row container with fixed-width sidebar and flex-1 content area

### Integration Points
- **Dashboard View** (`src/views/DashboardView.tsx`) — Needs full implementation as the main progress display
- **gsd-tools CLI** — Shell command execution via Tauri shell plugin to get roadmap/state data
- **New store needed:** progressStore.ts for caching roadmap/state data from CLI calls

### New Dependencies Needed
- None expected — using existing Tauri shell plugin and Zustand patterns

</code_context>

<specifics>
## Specific Ideas

- Card design: similar to Linear's phase cards — title at top, progress bar prominent, status badge in top-right corner
- Progress bar: use shadcn/ui Progress component or custom div with width percentage
- Accordion: use shadcn/ui Accordion component or custom expand/collapse with CSS transitions
- Session context section: distinct background (light gray or subtle border) to separate from phase cards
- Status badges: green for "已完成" (100%), yellow for "进行中" (>0% but <100%), gray for "未开始" (0%)
- Plan list under expanded phase: show plan ID, name, completion checkmark (PLAN.md ✓, SUMMARY.md ✓)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 4 scope.

</deferred>

---

*Phase: 04-progress-state-views*
*Context gathered: 2026-04-14*
