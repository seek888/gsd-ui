import { create } from 'zustand';
import { readTextFile, writeTextFile, readDir } from '@/lib/fs';
import { join } from '@tauri-apps/api/path';

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
  setFileTree: (tree: FileNode[]) => void;
  openFileByPath: (path: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  saveFile: () => Promise<void>;
  updateContent: (content: string) => void;
  setExternalModification: (path: string) => void;
  clearExternalModification: () => void;
  reloadCurrentFile: () => Promise<void>;
  refreshFileTree: () => Promise<void>;
}

export const useFileStore = create<FileState>((set, get) => ({
  fileTree: [],
  openFile: null,
  viewMode: 'preview',
  externalModification: null,

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
    set({ openFile: { ...openFile, isDirty: false } });
  },

  updateContent: (content) => {
    const { openFile } = get();
    if (!openFile) return;
    set({ openFile: { ...openFile, content, isDirty: true } });
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
    set({ openFile: { ...openFile, content, isDirty: false }, externalModification: null });
  },

  refreshFileTree: async () => {
    const projectPath = (await import('@/stores/projectStore')).useProjectStore.getState().projectPath;
    if (!projectPath) return;
    const planningPath = await join(projectPath, '.planning');
    const tree = await buildFileTree(planningPath);
    set({ fileTree: tree });
  },
}));

// Module-level helper for refreshFileTree (avoids circular import)
async function buildFileTree(dirPath: string): Promise<FileNode[]> {
  try {
    const entries = await readDir(dirPath);
    const sortedEntries = [...entries].sort((a, b) => {
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
        node.children = await buildFileTree(fullPath);
      }
      nodes.push(node);
    }
    return nodes;
  } catch {
    return [];
  }
}
