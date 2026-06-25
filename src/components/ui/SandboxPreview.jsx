import { useEffect, useMemo, useRef } from 'react'
import { buildFactory } from '../../lib/runSnippet'

/**
 * Per-instance timer sandbox.
 *
 * Snippets in the timer modules (stopwatches) often FORGET to clean up their
 * setInterval/setTimeout — that's the bug being taught. Without help, a leaked
 * interval keeps firing even after the preview remounts on the next edit, so
 * timers pile up and the demo goes haywire. We inject wrapped timer functions
 * that register every id, and clear them all when this preview unmounts — so a
 * leak is contained to one edit instead of accumulating forever (and the learner
 * still SEES the leak within a run, which is the point).
 */
function createTimerSandbox() {
  const intervals = new Set()
  const timeouts = new Set()
  const rafs = new Set()
  const scope = {
    setInterval: (fn, ms, ...args) => {
      const id = window.setInterval(fn, ms, ...args)
      intervals.add(id)
      return id
    },
    clearInterval: (id) => {
      window.clearInterval(id)
      intervals.delete(id)
    },
    setTimeout: (fn, ms, ...args) => {
      const id = window.setTimeout(fn, ms, ...args)
      timeouts.add(id)
      return id
    },
    clearTimeout: (id) => {
      window.clearTimeout(id)
      timeouts.delete(id)
    },
    requestAnimationFrame: (fn) => {
      const id = window.requestAnimationFrame(fn)
      rafs.add(id)
      return id
    },
    cancelAnimationFrame: (id) => {
      window.cancelAnimationFrame(id)
      rafs.delete(id)
    },
  }
  const cleanup = () => {
    intervals.forEach((id) => window.clearInterval(id))
    timeouts.forEach((id) => window.clearTimeout(id))
    rafs.forEach((id) => window.cancelAnimationFrame(id))
    intervals.clear()
    timeouts.clear()
    rafs.clear()
  }
  return { scope, cleanup }
}

/**
 * Runs the learner's compiled snippet and renders whatever it handed to
 * `render(...)`.
 *
 * Why the factory runs inside useMemo (and not in an effect): we want the
 * snippet evaluated exactly once per compiled version, producing a STABLE
 * component identity. If we re-ran it on every render, the learner's component
 * would be a brand-new function each time and React would throw its state away
 * on every keystroke. Memoizing by `compiled` keeps component state alive until
 * the next successful compile — which is exactly the behavior you want in a
 * sandbox (and which the state/effects modules rely on).
 *
 * Errors split into two paths, both caught upstream by the ErrorBoundary:
 *   - eval-time throw (e.g. a ReferenceError, or `render` never called): caught
 *     here and re-thrown during render.
 *   - render-time throw (Module 1's "Objects are not valid as a React child",
 *     or "Too many re-renders" from an effect loop): happens when React renders
 *     {element} below.
 *
 * Note on warnings: React only emits each dev warning (like the "missing key"
 * warning) ONCE per page session — it dedupes internally in a way a remount
 * can't reset. So the in-app console shows a given warning the first time the
 * learner's code triggers it; the module's hints carry the reminder after that.
 */
export default function SandboxPreview({ compiled, scope }) {
  const timerRef = useRef(null)
  if (timerRef.current === null) {
    timerRef.current = createTimerSandbox()
  }

  // Clear any timers this run started when the preview remounts/unmounts.
  useEffect(() => {
    const timers = timerRef.current
    return () => timers.cleanup()
  }, [])

  const { element, evalError } = useMemo(() => {
    try {
      let captured = null
      const render = (el) => {
        captured = el
      }
      // Timer sandbox first so a module's own `scope` can override if needed.
      const fullScope = { ...timerRef.current.scope, ...scope }
      const { fn, baseValues, scopeValues } = buildFactory(compiled, fullScope)
      fn(...baseValues, render, ...scopeValues)
      return { element: captured, evalError: null }
    } catch (error) {
      return { element: null, evalError: error }
    }
    // `scope` is intentionally not a dependency: it's static per module, and
    // re-running the factory would reset the learner's component state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compiled])

  if (evalError) throw evalError // → ErrorBoundary

  if (element == null) {
    return (
      <div className="sandbox-preview">
        <p className="text-sm text-slate-500">
          Your code didn’t call <code>render(&lt;Something /&gt;)</code> yet — add
          it as the last line so there’s something to show.
        </p>
      </div>
    )
  }

  // `.sandbox-preview` provides scoped base styles for plain semantic tags, so
  // the snippet doesn't need Tailwind classes (which wouldn't exist at runtime).
  return <div className="sandbox-preview">{element}</div>
}
