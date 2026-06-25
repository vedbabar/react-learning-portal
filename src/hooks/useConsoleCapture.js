import { useCallback, useRef, useState } from 'react'

const METHODS = ['log', 'info', 'warn', 'error']

/**
 * Temporarily route console.{log,info,warn,error} into `sink`, then hand back a
 * `release()` to undo it. This is how we show React's own dev warnings (the
 * "missing key" warning is a console.error) inside the app — no DevTools.
 *
 * THREE correctness rules baked in:
 *   1. ALWAYS restore (the caller wraps release() in a finally). A patch left
 *      installed would silently hijack the whole app's console forever.
 *   2. `released` makes release() idempotent — calling it twice is safe.
 *   3. `inside` is a re-entrancy guard: if a learner logs an object whose own
 *      getter/toString logs, we don't recurse forever.
 * We still forward to the original method so real DevTools stays accurate.
 */
export function installConsoleCapture(sink) {
  const original = {}
  let inside = false
  let released = false

  for (const method of METHODS) {
    original[method] = console[method]
    console[method] = (...args) => {
      if (!inside) {
        inside = true
        try {
          sink({ level: method, text: formatArgs(args) })
        } finally {
          inside = false
        }
      }
      original[method].apply(console, args)
    }
  }

  return function release() {
    if (released) return
    released = true
    for (const method of METHODS) console[method] = original[method]
  }
}

/**
 * Owns the list of console entries shown in the in-app console panel.
 * - showBatch(batch): replace the panel with one run's worth of output,
 *   collapsing consecutive identical lines into a single row with a count
 *   (so StrictMode's doubled warnings, or a log-per-item loop, read cleanly).
 * - clear(): empty the panel (the Clear button).
 */
export function useConsoleCapture() {
  const [logs, setLogs] = useState([])
  const idRef = useRef(0)

  const clear = useCallback(() => setLogs([]), [])

  const showBatch = useCallback((batch) => {
    const collapsed = []
    for (const entry of batch) {
      const last = collapsed[collapsed.length - 1]
      if (last && last.level === entry.level && last.text === entry.text) {
        last.count += 1
      } else {
        collapsed.push({ id: ++idRef.current, count: 1, ...entry })
      }
    }
    // Cap stored rows so a runaway loop can't grow memory without bound.
    setLogs(collapsed.slice(-200))
  }, [])

  return { logs, clear, showBatch }
}

/**
 * Render console args the way the browser would, but as a plain string.
 * Handles React's printf-style warnings (a format string with %s/%o + the
 * substitution args + a trailing component stack), strips the legacy
 * "Warning: " prefix, and never throws on circular/odd values.
 */
function formatArgs(args) {
  if (typeof args[0] === 'string' && /%[sdifoOc]/.test(args[0])) {
    let i = 1
    let out = args[0].replace(/%[sdifoOc]/g, (spec) => {
      if (i >= args.length) return spec
      const value = args[i++]
      if (spec === '%c') return '' // CSS styling directive — drop it
      if (spec === '%o' || spec === '%O') return safeStringify(value)
      if (spec === '%d' || spec === '%i') return String(Math.trunc(Number(value)))
      if (spec === '%f') return String(Number(value))
      return typeof value === 'string' ? value : safeStringify(value)
    })
    for (; i < args.length; i++) {
      const value = args[i]
      out += ' ' + (typeof value === 'string' ? value : safeStringify(value))
    }
    return clean(out)
  }
  return clean(
    args.map((a) => (typeof a === 'string' ? a : safeStringify(a))).join(' '),
  )
}

function clean(text) {
  return text.replace(/^Warning:\s*/, '').trimEnd()
}

function safeStringify(value) {
  if (value instanceof Error) return value.message
  if (typeof value === 'function') return value.name ? `[Function: ${value.name}]` : '[Function]'
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
