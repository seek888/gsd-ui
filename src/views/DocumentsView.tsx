import { useFileStore } from '@/stores/fileStore';
import { FileTree } from '@/components/documents/FileTree';
import { MarkdownPreview } from '@/components/documents/MarkdownPreview';
import { FrontMatter } from '@/components/documents/FrontMatter';
import { MonacoEditor } from '@/components/documents/MonacoEditor';
import { EditModeToggle } from '@/components/documents/EditModeToggle';
import { Button } from '@/components/ui/button';

export function DocumentsView() {
  const { openFile, viewMode, setViewMode, saveFile, updateContent } = useFileStore();

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
              <Button size="sm" onClick={() => saveFile()}>
                Save
              </Button>
            )}
          </div>
        </div>

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
