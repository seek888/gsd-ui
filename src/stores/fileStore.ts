import { create } from 'zustand';
import { readTextFile, writeTextFile, readDir, resolvePath } from '@/lib/fs';
import { join } from 'path';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export interface OpenFile {
  path: string;
  content: string;
  isDirty: boolean;
}

export type ViewMode = 'preview' | 'edit';

interface FileState {
  fileTree: FileNode[];
  openFile: OpenFile | null;
  viewMode: ViewMode;
  // Tracks when the current file was modified externally (by someone other than the user in this app)
  externalModification: { path: string; timestamp: number } | null;
  // Tracks paths of all files with unsaved changes (for file tree indicators)
  fileDirtyPaths: Set<string>;
  setFileTree: (tree: FileNode[]) => void;
  openFileByPath: (path: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  saveFile: () => Promise<void>;
  updateContent: (content: string) => void;
  setExternalModification: (path: string) => void;
  clearExternalModification: () => void;
  reloadCurrentFile: () => Promise<void>;
  refreshFileTree: () => Promise<void>;
  isFileDirty: (path: string) => boolean;
  clearDirtyFlag: (path: string) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  fileTree: [],
  openFile: null,
  viewMode: 'preview',
  externalModification: null,
  fileDirtyPaths: new Set<string>(),

  setFileTree: (tree) => set({ fileTree: tree }),

  openFileByPath: async (path) => {
    const content = await readTextFile(path);
    set({ openFile: { path, content, isDirty: false }, viewMode: 'preview' });
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  saveFile: async () => {
    const { openFile } = get();
    if (!openFile) return;
    await writeTextFile(openFile.path, openFile.content);
    const newDirtyPaths = new Set(get().fileDirtyPaths);
    newDirtyPaths.delete(openFile.path);
    set({ openFile: { ...openFile, isDirty: false }, fileDirtyPaths: newDirtyPaths });
  },

  updateContent: (content) => {
    const { openFile } = get();
    if (!openFile) return;
    const newDirtyPaths = new Set(get().fileDirtyPaths);
    newDirtyPaths.add(openFile.path);
    set({ openFile: { ...openFile, content, isDirty: true }, fileDirtyPaths: newDirtyPaths });
  },

  isFileDirty: (path) => get().fileDirtyPaths.has(path),

  clearDirtyFlag: (path) => {
    set((state) => {
      const newSet = new Set(state.fileDirtyPaths);
      newSet.delete(path);
      return { fileDirtyPaths: newSet };
    });
  },

  setExternalModification: (path) => {
    set({ externalModification: { path, timestamp: Date.now() } });
  },

  clearExternalModification: () => {
    set({ externalModification: null });
  },

  reloadCurrentFile: async () => {
    const { openFile } = get();
    if (!openFile) return;
    const content = await readTextFile(openFile.path);
    const newDirtyPaths = new Set(get().fileDirtyPaths);
    newDirtyPaths.delete(openFile.path);
    set({ openFile: { ...openFile, content, isDirty: false }, fileDirtyPaths: newDirtyPaths, externalModification: null });
  },

  refreshFileTree: async () => {
    const projectPath = (await import('@/stores/projectStore')).useProjectStore.getState().projectPath;
    if (!projectPath) return;
    const resolvedProjectPath = await resolvePath(projectPath);
    const planningPath = await join(resolvedProjectPath, '.planning');
    const tree = await buildFileTree(planningPath);
    set({ fileTree: tree });
  },
}));

// Module-level helper for refreshFileTree (avoids circular import)
async function buildFileTree(dirPath: string): Promise<FileNode[]> {
  try {
    console.log('[fileStore] buildFileTree:', dirPath);
    // Resolve path to ensure it's absolute for Tauri's fs plugin
    const resolvedPath = await resolvePath(dirPath);
    console.log('[fileStore] resolved path:', resolvedPath);
    const entries = await readDir(resolvedPath);
    console.log('[fileStore] readDir entries:', entries.length);

    const sortedEntries = [...entries].sort((a, b) => {
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
        node.children = await buildFileTree(fullPath);
      }
      nodes.push(node);
    }
    console.log('[fileStore] built', nodes.length, 'nodes');
    return nodes;
  } catch (error) {
    console.error('[fileStore] buildFileTree error:', error);
    return [];
  }
}
