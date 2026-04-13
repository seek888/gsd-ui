import { useFileStore } from '@/stores/fileStore';
import { FileTree } from '@/components/documents/FileTree';
import { MarkdownPreview } from '@/components/documents/MarkdownPreview';
import { FrontMatter } from '@/components/documents/FrontMatter';

export function DocumentsView() {
  const { openFile } = useFileStore();

  return (
    <div className="h-full flex flex-row">
      {/* File Tree Sidebar - 200px width per D-02 */}
      <div className="shrink-0 w-[200px] border-r overflow-y-auto">
        <FileTree />
      </div>

      {/* Preview/Edit Area - flex-1 to fill remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {openFile ? (
          <div className="flex-1 overflow-auto">
            <FrontMatter content={openFile.content} />
            <MarkdownPreview content={openFile.content} />
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
