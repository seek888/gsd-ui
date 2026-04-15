import { electronAPI } from '@/lib/electronAPI'
import { resolve } from 'path'

export async function readTextFile(path: string): Promise<string> {
  return electronAPI.readFile(path)
}

export async function writeTextFile(path: string, content: string): Promise<void> {
  return electronAPI.writeFile(path, content)
}

export async function readDir(path: string) {
  return electronAPI.readDir(path)
}

export async function exists(path: string): Promise<boolean> {
  return electronAPI.exists(path)
}

export async function directoryExists(path: string): Promise<boolean> {
  try {
    return await exists(path)
  } catch {
    return false
  }
}

export async function resolvePath(path: string): Promise<string> {
  // In Electron, paths are already absolute
  return resolve(path)
}
