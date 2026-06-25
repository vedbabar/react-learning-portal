import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
  useCallback,
  useReducer,
  useContext,
  createContext,
  memo,
} from 'react'
import { transpileJSX } from './transpile'

/**
 * The "scope" every learner snippet runs inside.
 *
 * We inject React + every hook/helper a snippet might reasonably use, so the
 * learner NEVER has to write an `import` line (and they can't — `new Function`
 * can't run ES module syntax). A snippet is just a body that defines a component
 * and calls the injected `render(<Thing/>)`.
 *
 * Note: timer functions (setInterval/setTimeout/etc.) are injected separately,
 * per-preview-instance, by SandboxPreview so they can be auto-cleaned on remount.
 */
// ── Infinite-render-loop guard ──────────────────────────────────────────────
// A snippet like `useEffect(() => setCount(count + 1))` with NO deps array sets
// state on every render. React does NOT bail out of that (it's not a
// render-phase setState) — it spins forever at thousands of renders/sec, pinning
// the CPU and freezing the tab. We can't let a learner's mistake do that.
//
// So the sandbox's useState/useReducer keep a PER-COMPONENT render counter (via
// useRef) and throw once a single component clearly runs away (far above any real
// animation, ~300/sec). Two subtleties make this actually stop the loop:
//   • PER-INSTANCE counting (not a global) so one runaway component can't trip
//     an innocent sibling sandbox into erroring.
//   • We DELIBERATELY do NOT reset the counter when we throw. React tries to
//     recover a render error by re-rendering once; if we reset, that retry gets
//     a fresh budget, succeeds, and the loop resumes (climbing forever). By
//     leaving the counter over the limit, the retry throws again and React falls
//     through to the ErrorBoundary, which finally unmounts the looping component.
const LOOP_LIMIT = 300
function useLoopGuard() {
  const meta = useRef({ ticks: 0, window: 0 }).current
  const now = typeof performance !== 'undefined' ? performance.now() : 0
  if (now - meta.window > 1000) {
    meta.window = now
    meta.ticks = 0
  }
  meta.ticks += 1
  if (meta.ticks > LOOP_LIMIT) {
    throw new Error(
      'Infinite render loop: a component is updating state on every render. ' +
        'If you set state inside a useEffect, give the effect a dependency array (often []).',
    )
  }
}
function useGuardedState(initial) {
  useLoopGuard()
  return useState(initial)
}
function useGuardedReducer(reducer, initialArg, init) {
  useLoopGuard()
  return useReducer(reducer, initialArg, init)
}

export const BASE_SCOPE = {
  React,
  useState: useGuardedState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
  useCallback,
  useReducer: useGuardedReducer,
  useContext,
  createContext,
  memo,
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/

/**
 * Transpile JSX → JS, returning a tidy result instead of throwing.
 *   success → { compiled: '<js source>' }
 *   failure → { error: { message, line, column } }
 * Sucrase reports syntax errors as "... (line:col)"; we split that out so the
 * UI can say "Syntax error on line 7".
 */
export function compileSnippet(code) {
  try {
    return { compiled: transpileJSX(code) }
  } catch (e) {
    const match = /\((\d+):(\d+)\)/.exec(e.message || '')
    return {
      error: {
        message: (e.message || String(e)).replace(/\s*\(\d+:\d+\)/, '').trim(),
        line: match ? Number(match[1]) : null,
        column: match ? Number(match[2]) : null,
      },
    }
  }
}

/**
 * Turn compiled JS into a callable factory.
 *
 * We build `new Function(React, useState, …, render, …scopeKeys, body)`. Calling
 * it executes the snippet: it defines its component(s) and calls `render(el)`,
 * which we capture. The factory is built once per compiled string (memoized by
 * the caller) so the component identity is stable and its state survives
 * re-renders — until the next successful compile remounts everything.
 *
 * `scope` keys that collide with the injected names or aren't valid identifiers
 * are dropped defensively (otherwise `new Function` would throw at build time).
 */
export function buildFactory(compiled, scope = {}) {
  const safeScope = Object.fromEntries(
    Object.entries(scope).filter(
      ([key]) => IDENTIFIER.test(key) && !(key in BASE_SCOPE) && key !== 'render',
    ),
  )

  const baseKeys = Object.keys(BASE_SCOPE)
  const baseValues = Object.values(BASE_SCOPE)
  const scopeKeys = Object.keys(safeScope)
  const scopeValues = Object.values(safeScope)

  // eslint-disable-next-line no-new-func
  const fn = new Function(
    ...baseKeys,
    'render',
    ...scopeKeys,
    '"use strict";\n' + compiled,
  )

  // The caller invokes: fn(...baseValues, renderCallback, ...scopeValues)
  return { fn, baseValues, scopeValues }
}
