import { readTextFile, writeTextFile, readDir, exists } from '@tauri-apps/plugin-fs';

export { readTextFile, writeTextFile, readDir, exists };

export async function directoryExists(path: string): Promise<boolean> {
  try {
    return await exists(path);
  } catch {
    return false;
  }
}
