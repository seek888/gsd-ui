# Code Review: Phase 03 - File Browsing + Monaco Editor

Reviewed files: `package.json`, `EditModeToggle.tsx`, `FileTree.tsx`, `FrontMatter.tsx`, `MarkdownPreview.tsx`, `MonacoEditor.tsx`, `watchers.ts`, `fileStore.ts`, `DocumentsView.tsx`

---

## CRITICAL

### FS operations have no path scope restrictions (path traversal risk)

**Files:** `src-tauri/capabilities/main.json`, all FS-using files

The Tauri capability grants `fs:allow-read-text-file`, `fs:allow-write-text-file`, `fs:allow-read-dir`, `fs:allow-watch`, etc. **without any `scope` restriction**. This means the app can read/write any file on the filesystem, not just `.planning/` files.

```json
// main.json — current (unrestricted)
"fs:allow-read-text-file",
"fs:allow-write-text-file",
```

The code does **not** enforce `.planning` boundaries. For example, `fileStore.ts` `openFileByPath` reads any file path passed to it, and `saveFile` writes to any path. If a malicious file outside `.planning/` is added to the file tree (e.g., via symlink traversal or a crafted `.planning` directory), the app will read/write it.

**Fix:** Restrict the FS capability scope to `$APPDATA/**` or `$PROJECT/**` or explicitly to the `.planning` directory pattern. See Tauri's capability `scope` documentation for `fs` permissions.

---

## WARNING

### Watcher cleanup race condition in DocumentsView

**File:** `src/views/DocumentsView.tsx`, lines 33-49

`watchDirectory` returns a `Promise<() => void>`. The cleanup function is assigned via `.then()` inside the effect body, but the effect's return function (`() => { unwatch?.(); }`) runs **before** the Promise resolves if the user navigates away quickly.

```ts
useEffect(() => {
  // ...
  watchDirectory(planningPath, ...).then((cleanup) => {
    unwatch = cleanup;   // may not run before cleanup is called
  });
  return () => {
    unwatch?.();        // unwatch is still null
  };
}, [...]);
```

**Fix:** Await the Promise before returning the cleanup:

```ts
useEffect(() => {
  if (!projectPath) return;
  const planningPath = `${projectPath}/.planning`;

  watchDirectory(planningPath, async (event) => {
    // ...
  }, 500).then((unwatch) => {
    return () => unwatch();
  });
}, [projectPath, refreshFileTree]);
```

Or restructure to use an async cleanup pattern.

---

### Full file tree rebuilds on every external change event

**File:** `src/views/DocumentsView.tsx`, lines 33-37

The watcher callback calls `refreshFileTree()` on every single file change. `refreshFileTree` calls `buildFileTree` which does **deep recursive directory traversal** from `.planning/`. For projects with many files, this is expensive and will cause visible lag.

```ts
watchDirectory(planningPath, async (event) => {
  await refreshFileTree(); // rebuilds entire tree on every change
  // ...
}, 500)
```

**Fix:** Only update the specific node that changed, or debounce the tree refresh separately from the external-modification detection.

---

### Missing error handling in async store actions

**File:** `src/stores/fileStore.ts`

- `openFileByPath` (line 51-54): `readTextFile(path)` is called with no try/catch. If the file read fails, the store state is left in an inconsistent state.
- `saveFile` (lines 58-65): `writeTextFile` has no try/catch. If the write fails, the dirty flag is cleared anyway (lines 62-64), so the user loses the dirty state with no indication the save failed.

```ts
openFileByPath: async (path) => {
  const content = await readTextFile(path); // no try/catch
  set({ openFile: { path, content, isDirty: false }, viewMode: 'preview' });
},
saveFile: async () => {
  // ...
  await writeTextFile(openFile.path, openFile.content); // no try/catch
  // dirty flag cleared below regardless of write success
},
```

**Fix:** Wrap both in try/catch and surface errors to the user via the store's error state.

---

### Duplicate `buildFileTree` logic

**Files:** `src/components/documents/FileTree.tsx` (lines 18-48), `src/stores/fileStore.ts` (lines 112-139)

Identical implementations exist in both files. If one is updated (e.g., to sort differently, filter files, or handle errors), the other will diverge.

**Fix:** Extract to `src/lib/fileTree.ts` as a shared utility.

---

### `refreshFileTree` uses dynamic import workaround

**File:** `src/stores/fileStore.ts`, lines 102-108

```ts
refreshFileTree: async () => {
  const projectPath = (await import('@/stores/projectStore')).useProjectStore.getState().projectPath;
```

This dynamic import is a fragile workaround for a circular dependency. If the import path changes or the store structure changes, this silently breaks.

**Fix:** Refactor to eliminate the circular dependency, or pass `projectPath` as a parameter to `refreshFileTree`.

---

### Monaco redundant layout strategy

**File:** `src/components/documents/MonacoEditor.tsx`

Monaco is configured with `automaticLayout: true` (line 60) **and** a `ResizeObserver` that calls `editor.layout()` (lines 30-42). The `automaticLayout` option already polls for size changes and relayouts; the `ResizeObserver` is redundant and doubles the layout calls.

**Fix:** Remove the `ResizeObserver` and `isMounted` state, or remove `automaticLayout: true` and keep only the manual observer.

---

### `gray-matter` parsing not memoized in FrontMatter

**File:** `src/components/documents/FrontMatter.tsx`, line 11

```ts
const { data } = matter(content); // parses on every render
```

If the `FrontMatter` component re-renders (e.g., from parent state changes), the YAML frontmatter is re-parsed unnecessarily.

**Fix:** Wrap parsing in `useMemo`:

```ts
const { data } = useMemo(() => matter(content), [content]);
```

---

### Race condition with `confirm()` in handleSelect

**File:** `src/components/documents/FileTree.tsx`, lines 68-72

```ts
const proceed = confirm('You have unsaved changes. Do you want to continue?');
```

Using the native `confirm()` is blocking and synchronous. If the user has multiple dirty files and clicks rapidly, the race condition between file state and the confirm dialog can lead to incorrect decisions.

**Fix:** Replace with a non-blocking dialog (e.g., a shadcn `AlertDialog`) that properly manages state transitions.

---

### No handling when an open file is deleted externally

**File:** `src/stores/fileStore.ts`

If a file is open in the editor and gets deleted by an external tool, the watcher will fire but `reloadCurrentFile` will fail. There is no guard for this scenario.

**Fix:** Catch the error in `reloadCurrentFile` and `setExternalModification`, show a user-facing error, and optionally close the file.

---

### `buildFileTree` has no depth limit

**File:** `src/components/documents/FileTree.tsx`, lines 37-40

```ts
if (entry.isDirectory) {
  node.children = await buildFileTree(fullPath); // unbounded recursion
}
```

Symlinks or deeply nested directories could cause stack overflow or very slow initialization.

**Fix:** Add a depth parameter and stop recursion at a reasonable limit (e.g., 20 levels).

---

## INFO

### Unused `containerRef` div element

**File:** `src/components/documents/MonacoEditor.tsx`, line 45

```tsx
<div ref={containerRef} className="h-full">
```

The `containerRef` is used only for the `ResizeObserver`, which is redundant with `automaticLayout: true` (see above). The extra `div` wrapper is unnecessary.

---

### `renderRow` re-created every render, degrading tree performance

**File:** `src/components/documents/FileTree.tsx`, lines 89-145

`renderRow` is defined inline inside the component body and is passed to `<Tree>`. Every parent render creates a new function reference, which can cause `react-arborist` to re-render all rows. `handleSelect` and `handleDoubleClick` are correctly memoized via `useCallback`, but `renderRow` itself is not.

**Fix:** Wrap `renderRow` in `useCallback` with stable dependencies:

```ts
const renderRow = useCallback(
  ({ node, attrs }: RowRendererProps<FileNode>) => { ... },
  [handleSelect, handleDoubleClick, isFileDirty]
);
```

---

### Inconsistent store access patterns

**File:** `src/components/documents/FileTree.tsx`

The component uses `useFileStore()` hook for most access but calls `useFileStore.getState()` inside `handleSelect` (line 68). This is correct for event handlers but creates an inconsistent pattern. More importantly, `isFileDirty` is accessed as a stable selector but called inside the renderRow callback on every render.

---

### Missing `aria-label` on icon-only button

**File:** `src/components/documents/EditModeToggle.tsx`

The button toggles between "Edit" and "Preview" modes but does not have an `aria-label` for screen readers when the icon is the primary indicator.

---

### Tailwind calc mismatch in content area

**File:** `src/views/DocumentsView.tsx`, line 105

```tsx
<div className="h-[calc(100%-40px)] overflow-auto">
```

The `40px` hardcoded height assumes the header is exactly 40px, which may break if font sizes or padding change. A flex-based layout would be more robust.

---

### Missing `await` on void Promise in `handleDoubleClick`

**File:** `src/components/documents/FileTree.tsx`, line 82

```ts
setViewMode('edit');
openFileByPath(node.data.path); // returns a Promise, not awaited
```

This is fine functionally (the async operation is fire-and-forget here), but inconsistent with how other async operations are handled. No user-facing issue.

---

### Summary table

| Severity | Count | Files |
|----------|-------|-------|
| CRITICAL | 1 | `main.json`, all FS files |
| WARNING  | 9 | `DocumentsView.tsx`, `fileStore.ts`, `FileTree.tsx`, `MonacoEditor.tsx`, `FrontMatter.tsx` |
| INFO     | 7 | `MonacoEditor.tsx`, `FileTree.tsx`, `EditModeToggle.tsx`, `DocumentsView.tsx` |
