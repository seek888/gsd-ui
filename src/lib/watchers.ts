import { watchImmediate } from '@tauri-apps/plugin-fs';
import type { WatchEvent, WatchOptions } from '@tauri-apps/plugin-fs';

// Type assertion to work around TS overload resolution issue with bundler moduleResolution
type WatchFn = (
  paths: string | string[] | URL | URL[],
  opts: WatchOptions,
  cb: (event: WatchEvent) => void
) => Promise<() => void>;
const safeWatch = watchImmediate as unknown as WatchFn;

/**
 * Creates a debounced callback that delays execution until after the
 * specified delay has elapsed since the last invocation.
 */
export function createDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): [(...args: Parameters<T>) => void, () => void] {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };

  const cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
  };

  return [debouncedFn, cancel];
}

/**
 * Watches a directory for file changes with debouncing.
 * Returns a cleanup function to stop watching.
 */
export async function watchDirectory(
  path: string,
  onChange: (event: { type: string; path: string }) => void,
  debounceMs: number = 500
): Promise<() => void> {
  const [debouncedOnChange] = createDebouncedCallback(onChange, debounceMs);
  const unwatch = await safeWatch(
    path,
    { recursive: true },
    (event: WatchEvent) => {
      const changedPath = event.paths[0] ?? '';
      debouncedOnChange({ type: event.type as string, path: changedPath });
    }
  );
  return unwatch;
}
