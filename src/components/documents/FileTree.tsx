import { useEffect, useCallback, useRef, useState } from 'react';
import { Tree } from 'react-arborist';
import type { NodeApi } from 'react-arborist';
import type { RowRendererProps } from 'react-arborist';
import {
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FolderPlus,
} from 'lucide-react';
import { readDir, resolvePath } from '@/lib/fs';
import { join } from 'path';
import { useFileStore, type FileNode } from '@/stores/fileStore';
import { useProjectStore } from '@/stores/projectStore';

async function buildFileTree(dirPath: string): Promise<FileNode[]> {
  try {
    console.log('[FileTree] buildFileTree called with path:', dirPath);
    // Resolve path to ensure it's absolute for Tauri's fs plugin
    const resolvedPath = await resolvePath(dirPath);
    console.log('[FileTree] resolved path:', resolvedPath);
    const entries = await readDir(resolvedPath);
    console.log('[FileTree] readDir returned entries:', entries.length, entries);

    const sortedEntries = [...entries].sort((a, b) => {
      // Directories first, then alphabetically
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    const nodes: FileNode[] = [];
    for (const entry of sortedEntries) {
      const fullPath = await join(resolvedPath, entry.name);
      const node: FileNode = {
        id: fullPath,
        name: entry.name,
        path: fullPath,
        type: entry.isDirectory ? 'folder' : 'file',
      };
      if (entry.isDirectory) {
        // Only pre-populate children for the top level to avoid deep recursion on mount
        node.children = await buildFileTree(fullPath);
      }
      nodes.push(node);
    }
    console.log('[FileTree] built tree with', nodes.length, 'nodes');
    return nodes;
  } catch (error) {
    // Log error for debugging
    console.error('[FileTree] buildFileTree error:', error);
    // Return empty array if directory cannot be read (e.g., no permission)
    return [];
  }
}

export function FileTree() {
  const { fileTree, setFileTree, openFileByPath, setViewMode, isFileDirty } = useFileStore();
  const projectPath = useProjectStore((s) => s.projectPath);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ height: 400, width: 200 });

  const loadTree = useCallback(async () => {
    if (!projectPath) {
      console.log('[FileTree] loadTree: no projectPath');
      return;
    }
    // Resolve project path first to ensure it's absolute
    const resolvedProjectPath = await resolvePath(projectPath);
    const planningPath = await join(resolvedProjectPath, '.planning');
    console.log('[FileTree] loadTree: projectPath=', projectPath, 'resolvedProjectPath=', resolvedProjectPath, 'planningPath=', planningPath);
    const tree = await buildFileTree(planningPath);
    console.log('[FileTree] loadTree: tree=', tree);
    setFileTree(tree);
  }, [projectPath, setFileTree]);

  // Update container dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ height: rect.height, width: rect.width });
      }
    };

    // Initial size
    updateSize();

    // Watch for resize
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const handleSelect = useCallback(
    (node: NodeApi<FileNode>) => {
      if (node.data.type === 'file') {
        const { openFile } = useFileStore.getState();
        if (openFile?.isDirty && openFile.path !== node.data.path) {
          const proceed = confirm('You have unsaved changes. Do you want to continue?');
          if (!proceed) return;
        }
        openFileByPath(node.data.path);
      }
    },
    [openFileByPath]
  );

  const handleDoubleClick = useCallback(
    (node: NodeApi<FileNode>) => {
      if (node.data.type === 'file') {
        setViewMode('edit');
        openFileByPath(node.data.path);
      }
    },
    [setViewMode, openFileByPath]
  );

  const renderRow = useCallback(
    ({ node, attrs }: RowRendererProps<FileNode>) => {
      const isFolder = node.data.type === 'folder';
      const isOpen = node.isOpen;

      return (
        <div
          {...attrs}
          className="group flex items-center gap-1 px-2 select-none cursor-pointer hover:bg-accent/50"
          onClick={() => {
            if (isFolder) {
              node.toggle();
            } else {
              handleSelect(node);
            }
          }}
          onDoubleClick={() => {
            if (!isFolder) {
              handleDoubleClick(node);
            }
          }}
        >
          {/* Expand/collapse arrow for folders */}
          <span className="w-4 h-4 flex items-center justify-center shrink-0">
            {isFolder ? (
              isOpen ? (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )
            ) : null}
          </span>

          {/* Icon */}
          <span className="w-4 h-4 flex items-center justify-center shrink-0">
            {isFolder ? (
              isOpen ? (
                <FolderOpen className="w-4 h-4 text-amber-500" />
              ) : (
                <Folder className="w-4 h-4 text-amber-500" />
              )
            ) : (
              <FileText className="w-4 h-4 text-blue-400" />
            )}
          </span>

          {/* Name */}
          <span className="truncate text-sm">{node.data.name}</span>
          {/* Dirty indicator dot */}
          {!isFolder && isFileDirty(node.data.path) && (
            <span className="text-yellow-500 font-bold shrink-0">&#8226;</span>
          )}
        </div>
      );
    },
    [handleSelect, handleDoubleClick, isFileDirty]
  );

  if (!projectPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <FolderPlus className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No project selected</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-auto">
      {fileTree.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <p className="text-sm text-muted-foreground">No files found</p>
        </div>
      ) : (
        <Tree<FileNode>
          data={fileTree}
          rowHeight={32}
          height={dimensions.height}
          width={dimensions.width}
          renderRow={renderRow}
        />
      )}
    </div>
  );
}
