import { useEffect, useCallback } from 'react';
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
import { readDir } from '@/lib/fs';
import { join } from '@tauri-apps/api/path';
import { useFileStore, type FileNode } from '@/stores/fileStore';
import { useProjectStore } from '@/stores/projectStore';

async function buildFileTree(dirPath: string): Promise<FileNode[]> {
  try {
    const entries = await readDir(dirPath);
    const sortedEntries = [...entries].sort((a, b) => {
      // Directories first, then alphabetically
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    const nodes: FileNode[] = [];
    for (const entry of sortedEntries) {
      const fullPath = await join(dirPath, entry.name);
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
    return nodes;
  } catch {
    // Return empty array if directory cannot be read (e.g., no permission)
    return [];
  }
}

export function FileTree() {
  const { fileTree, setFileTree, openFileByPath, setViewMode } = useFileStore();
  const projectPath = useProjectStore((s) => s.projectPath);

  const loadTree = useCallback(async () => {
    if (!projectPath) return;
    const planningPath = await join(projectPath, '.planning');
    const tree = await buildFileTree(planningPath);
    setFileTree(tree);
  }, [projectPath, setFileTree]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const handleSelect = useCallback(
    (node: NodeApi<FileNode>) => {
      if (node.data.type === 'file') {
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
        </div>
      );
    },
    [handleSelect, handleDoubleClick]
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
    <Tree<FileNode>
      data={fileTree}
      rowHeight={32}
      height={Infinity}
      width={Infinity}
      renderRow={renderRow}
    />
  );
}
