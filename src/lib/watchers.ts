/**
 * File watchers for Electron
 * Note: File watching disabled during Electron migration
 * Can be re-enabled using chokidar or Node.js fs.watch
 */

/**
 * Creates a debounced callback
 */
export function createDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): [(...args: Parameters<T>) => void, () => void] {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }

  const cancel = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = null
  }

  return [debouncedFn, cancel]
}

// Simplified watcher - disabled for Electron migration
// Will be re-enabled with proper implementation using chokidar
export async function watchDirectory(
  path: string,
  onChange: (event: { type: string; path: string }) => void,
  debounceMs: number = 500
): Promise<() => void> {
  console.warn('[watchers] File watching is temporarily disabled in Electron migration')
  
  // Return a no-op cleanup function
  return () => {}
}
