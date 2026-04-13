import { load, type Store } from '@tauri-apps/plugin-store';

let _store: Store | null = null;

export async function getStore(): Promise<Store> {
  if (!_store) {
    _store = await load('gsd-ui-settings.json');
  }
  return _store;
}

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const store = await getStore();
  const value = await store.get<T>(key);
  return value ?? defaultValue;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const store = await getStore();
  await store.set(key, value);
  await store.save();
}
