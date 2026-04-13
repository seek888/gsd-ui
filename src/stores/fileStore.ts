import { create } from 'zustand';
import { readTextFile, writeTextFile } from '@/lib/fs';

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
  setFileTree: (tree: FileNode[]) => void;
  openFileByPath: (path: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  saveFile: () => Promise<void>;
  updateContent: (content: string) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  fileTree: [],
  openFile: null,
  viewMode: 'preview',

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
}));
