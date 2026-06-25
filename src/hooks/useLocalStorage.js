import { useCallback, useEffect, useState } from 'react'

/**
 * Persist a piece of state to localStorage so it survives refreshes.
 *
 * This is the real, app-level version of the hook Module 4 teaches. Same shape
 * as useState — `const [value, setValue] = useLocalStorage(key, initial)` — but
 * every write also lands in localStorage, and a lazy initializer reads it back
 * on mount. It's defensive (try/catch everywhere: storage can be full, blocked
 * in private mode, or hold corrupt JSON) and syncs across browser tabs via the
 * `storage` event.
 *
 * Caveat (by design): localStorage is per-browser, per-device. Progress saved
 * here doesn't follow you to another laptop — that would need accounts + a DB.
 */
export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item != null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      setStored((prev) => {
        const next = typeof value === 'function' ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          /* storage full or blocked — keep the in-memory value anyway */
        }
        return next
      })
    },
    [key],
  )

  // Keep multiple tabs (or other hook instances on this key) in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key) return
      try {
        setStored(e.newValue != null ? JSON.parse(e.newValue) : initialValue)
      } catch {
        /* ignore malformed cross-tab payloads */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // initialValue is intentionally omitted: we don't want a new object literal
    // from the caller to re-subscribe on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [stored, setValue]
}
