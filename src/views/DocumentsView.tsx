import { useEffect } from 'react';
import { useFileStore } from '@/stores/fileStore';
import { useProjectStore } from '@/stores/projectStore';
import { FileTree } from '@/components/documents/FileTree';
import { MarkdownPreview } from '@/components/documents/MarkdownPreview';
import { FrontMatter } from '@/components/documents/FrontMatter';
import { MonacoEditor } from '@/components/documents/MonacoEditor';
import { EditModeToggle } from '@/components/documents/EditModeToggle';
import { Button } from '@/components/ui/button';
import { watchDirectory } from '@/lib/watchers';

export function DocumentsView() {
  const {
    openFile,
    viewMode,
    setViewMode,
    saveFile,
    updateContent,
    externalModification,
    reloadCurrentFile,
    clearExternalModification,
    refreshFileTree,
  } = useFileStore();
  const projectPath = useProjectStore((s) => s.projectPath);

  // Initialize file watcher on mount, cleanup on unmount
  useEffect(() => {
    if (!projectPath) return;

    const planningPath = `${projectPath}/.planning`;
    let unwatch: (() => void) | null = null;

    watchDirectory(planningPath, async (event) => {
      const { setExternalModification, openFile } = useFileStore.getState();

      // Reload file tree structure
      await refreshFileTree();

      // If current file was modified externally, set flag to prompt user
      if (openFile && event.path === openFile.path) {
        setExternalModification(openFile.path);
      }
    }, 500).then((cleanup) => {
      unwatch = cleanup;
    });

    return () => {
      unwatch?.();
    };
  }, [projectPath, refreshFileTree]);

  return (
    <div className="h-full flex flex-row">
      {/* File Tree Sidebar - 200px width per D-02 */}
      <div className="shrink-0 w-[200px] border-r overflow-y-auto">
        <FileTree />
      </div>

      {/* Preview/Edit Area - flex-1 to fill remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with file name and actions */}
        <div className="shrink-0 px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-sm font-medium">{openFile?.path ?? 'No file selected'}</h2>
          <div className="flex items-center gap-2">
            <EditModeToggle
              currentMode={viewMode}
              onToggle={() => setViewMode(viewMode === 'preview' ? 'edit' : 'preview')}
            />
            {viewMode === 'edit' && (
              <Button
                size="sm"
                onClick={() => saveFile()}
                disabled={!openFile || !openFile.isDirty}
                title={openFile?.isDirty ? 'Save changes (Cmd+S)' : 'No changes to save'}
              >
                {openFile?.isDirty ? 'Save' : 'Saved'}
              </Button>
            )}
          </div>
        </div>

        {/* External modification banner */}
        {externalModification && (
          <div className="shrink-0 px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center justify-between">
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              This file was modified externally.
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => reloadCurrentFile()}>
                Reload
              </Button>
              <Button size="sm" variant="ghost" onClick={() => clearExternalModification()}>
                Keep local
              </Button>
            </div>
          </div>
        )}

        {/* Content area */}
        {openFile ? (
          <div className="flex-1 overflow-hidden">
            {viewMode === 'preview' ? (
              <>
                <FrontMatter content={openFile.content} />
                <div className="h-[calc(100%-40px)] overflow-auto">
                  <MarkdownPreview content={openFile.content} />
                </div>
              </>
            ) : (
              <MonacoEditor
                value={openFile.content}
                onChange={updateContent}
                onSave={saveFile}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a file to view
          </div>
        )}
      </div>
    </div>
  );
}
