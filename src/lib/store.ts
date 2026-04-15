import { getStoredValue, setStoredValue } from '@/lib/electronStore'

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  return getStoredValue(key, defaultValue)
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  return setStoredValue(key, value)
}
