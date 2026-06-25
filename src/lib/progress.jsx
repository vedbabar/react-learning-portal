import { createContext, useCallback, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { MODULES } from './curriculum'

/**
 * Course-progress state, shared across the whole app via Context (the very
 * pattern Module 6 teaches) and persisted to localStorage (Module 4's hook).
 *
 * It stores just an array of completed module ids under one key. Everything else
 * (counts, percent, "is this one done?") is derived.
 */
const STORAGE_KEY = 'rcc:progress:v1'
const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const [completedIds, setCompletedIds] = useLocalStorage(STORAGE_KEY, [])

  const completed = useMemo(() => new Set(completedIds), [completedIds])

  const isComplete = useCallback((id) => completed.has(id), [completed])

  const toggleComplete = useCallback(
    (id) => {
      setCompletedIds((prev) => {
        const set = new Set(prev)
        if (set.has(id)) set.delete(id)
        else set.add(id)
        return [...set].sort((a, b) => a - b)
      })
    },
    [setCompletedIds],
  )

  const resetProgress = useCallback(() => setCompletedIds([]), [setCompletedIds])

  const value = useMemo(() => {
    const total = MODULES.length
    const completedCount = completed.size
    return {
      isComplete,
      toggleComplete,
      resetProgress,
      completedCount,
      total,
      percent: total ? Math.round((completedCount / total) * 100) : 0,
    }
  }, [completed, isComplete, toggleComplete, resetProgress])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) {
    throw new Error('useProgress must be used inside a <ProgressProvider>')
  }
  return ctx
}
