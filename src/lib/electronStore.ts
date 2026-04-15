// Electron store wrapper for persistent settings
import { electronAPI } from '@/lib/electronAPI'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

export async function getStoredValue<T>(key: string, defaultValue: T): Promise<T> {
  if (!isElectron) return defaultValue
  try {
    const value = await electronAPI.getSetting<T>(key)
    return value ?? defaultValue
  } catch {
    return defaultValue
  }
}

export async function setStoredValue<T>(key: string, value: T): Promise<void> {
  if (!isElectron) return
  try {
    await electronAPI.setSetting(key, value)
  } catch (err) {
    console.error('Failed to save setting:', key, err)
  }
}
