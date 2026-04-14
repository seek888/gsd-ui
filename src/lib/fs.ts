import { readTextFile, writeTextFile, readDir, exists } from '@tauri-apps/plugin-fs';
import { resolve } from '@tauri-apps/api/path';

export { readTextFile, writeTextFile, readDir, exists };

export async function directoryExists(path: string): Promise<boolean> {
  try {
    return await exists(path);
  } catch {
    return false;
  }
}

/**
 * Resolves a path to an absolute file system path
 * This ensures paths are properly normalized for Tauri's fs plugin
 */
export async function resolvePath(path: string): Promise<string> {
  try {
    return await resolve(path);
  } catch {
    return path;
  }
}
