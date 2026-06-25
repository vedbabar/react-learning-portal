import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ErrorBoundary from '../ErrorBoundary'
import CodeBlock from './CodeBlock'
import CodeEditor from './CodeEditor'
import SandboxPreview from './SandboxPreview'
import SandboxConsole from './SandboxConsole'
import { compileSnippet } from '../../lib/runSnippet'
import { useConsoleCapture, installConsoleCapture } from '../../hooks/useConsoleCapture'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import './sandbox-preview.css'

// Console output that isn't the learner's bug — filtered out of the in-app panel.
const SANDBOX_CONSOLE_NOISE =
  /outdated JSX transform|ErrorBoundary caught|Download the React DevTools/i

/**
 * @typedef {Object} LiveSandboxProps
 * @property {string}   initialCode    Broken snippet shown first. Ends with render(<X/>).
 * @property {string=}  solutionCode   Fixed snippet. Enables Reveal/Load-solution.
 * @property {Object=}  scope          Extra vars/components injected into the snippet (e.g. { TEAM }).
 * @property {string=}  title          Header label.
 * @property {string=}  filename       Filename chip on the editor.
 * @property {string[]=} hints         Progressive hints, revealed one at a time.
 * @property {number=}  height         Editor/preview row height (px).
 * @property {number=}  consoleHeight  Console panel height (px).
 * @property {boolean=} autoRun        Re-run on edit (debounced) vs require Run click.
 * @property {number=}  debounceMs     Auto-run debounce.
 */

/**
 * LiveSandbox — an in-app, editable code playground.
 *
 * The learner edits JSX on the left; it transpiles (Sucrase) and renders on the
 * right; and React's own warnings/errors show up in the in-app console below —
 * no DevTools, no external editor.
 *
 * Two design notes:
 *  1. CONSOLE CAPTURE IS PERSISTENT-BUT-GATED. React emits warnings (like
 *     "missing key") while it renders, not while we eval the snippet, and that
 *     render is async. So the console patch is installed for the sandbox's whole
 *     lifetime and gated by an `armed` flag, rather than wrapped tightly around
 *     the eval — that way it's still in place when React commits.
 *  2. RUN ID REMOUNTS THE PREVIEW. Bumping `runId` (used as a key) gives each run
 *     a fresh component tree — resetting the learner's component state and the
 *     error boundary. (Note: React dedupes each dev warning per page session, so
 *     a warning shows the first time the code triggers it; the hints remind
 *     after that.)
 */
export default function LiveSandbox({
  initialCode = '',
  solutionCode,
  scope = {},
  title = 'Live sandbox',
  filename = 'sandbox.jsx',
  hints = [],
  height = 280,
  consoleHeight = 150,
  autoRun = true,
  debounceMs = 350,
}) {
  // Persist the learner's edits per-sandbox, so a refresh doesn't wipe their
  // work. The key is derived from the route + this sandbox's title/filename
  // (unique per page). Reset writes initialCode back, clearing the saved edits.
  const { pathname } = useLocation()
  const [code, setCode] = useLocalStorage(
    `rcc:code:${pathname}:${title}:${filename}`,
    initialCode,
  )
  const [compiled, setCompiled] = useState(null)
  const [runId, setRunId] = useState(0)
  const [bar, setBar] = useState(null) // { kind: 'syntax' | 'runtime' | 'info', msg }
  const [showSolution, setShowSolution] = useState(false)
  const [revealedHints, setRevealedHints] = useState(0)
  const { logs, clear, showBatch } = useConsoleCapture()
  const armedRef = useRef(false)
  const batchRef = useRef([])

  // Patch the console ONCE for this sandbox's lifetime, but only collect entries
  // while a run is "armed". Installing it persistently (rather than per-run) means
  // it's still in place during React's async render/commit, so commit-phase
  // warnings like "missing key" are captured. The armed flag keeps unrelated app
  // logs out of the panel. Restored on unmount.
  useEffect(() => {
    const release = installConsoleCapture((entry) => {
      // Only collect during an armed run, and drop noise that isn't the learner's
      // bug: our own boundary log, React's one-time "outdated JSX transform" notice
      // (a side effect of transpiling in the browser), and the DevTools nudge.
      if (armedRef.current && !SANDBOX_CONSOLE_NOISE.test(entry.text)) {
        batchRef.current.push(entry)
      }
    })
    return release
  }, [])

  const run = useCallback(() => {
    const result = compileSnippet(code)
    if (result.error) {
      // Keep the last good preview on screen; just flag the syntax problem.
      setBar({
        kind: 'syntax',
        msg: `Syntax error${
          result.error.line ? ` on line ${result.error.line}` : ''
        }: ${result.error.message}`,
      })
      return
    }
    // Arm capture, then trigger a fresh render. A bumped runId remounts the
    // preview so component state and the error boundary reset for the new run.
    batchRef.current = []
    armedRef.current = true
    setBar(null)
    setCompiled(result.compiled)
    setRunId((id) => id + 1)
  }, [code])

  // After the preview commits for this run, flush what we captured and disarm.
  useEffect(() => {
    if (compiled == null) return
    armedRef.current = false
    showBatch(batchRef.current)
    batchRef.current = []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId])

  // Auto-run, debounced, on every edit (and once on mount).
  useEffect(() => {
    if (!autoRun) return
    const timer = setTimeout(run, debounceMs)
    return () => clearTimeout(timer)
  }, [code, autoRun, debounceMs, run])

  // For autoRun=false, still do a single run on mount so the preview isn't blank.
  const didInit = useRef(false)
  useEffect(() => {
    if (autoRun || didInit.current) return
    didInit.current = true
    run()
  }, [autoRun, run])

  const handleRuntimeError = useCallback((error) => {
    setBar({
      kind: 'runtime',
      msg: error?.message ? `Runtime error: ${error.message}` : 'Runtime error',
    })
  }, [])

  const resetCode = () => {
    if (
      code !== initialCode &&
      !window.confirm('Reset to the original broken code? Your edits will be lost.')
    ) {
      return
    }
    setShowSolution(false)
    setRevealedHints(0)
    clear()
    setCode(initialCode)
  }

  const loadSolution = () => {
    if (!window.confirm('Replace your code with the full solution?')) return
    setShowSolution(false)
    setCode(solutionCode)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b0b12] shadow-xl shadow-black/30">
      {/* ── Header + controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-100">{title}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300 ring-1 ring-inset ring-cyan-500/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            Live
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {!autoRun && (
            <button
              onClick={run}
              className="rounded-lg bg-cyan-500/15 px-3 py-1.5 text-cyan-300 ring-1 ring-inset ring-cyan-500/30 transition hover:bg-cyan-500/25"
            >
              ▶ Run
            </button>
          )}
          <button
            onClick={resetCode}
            className="rounded-lg px-3 py-1.5 text-slate-400 ring-1 ring-inset ring-slate-700 transition hover:bg-slate-800 hover:text-slate-200"
          >
            ↺ Reset
          </button>
          {solutionCode && (
            <button
              onClick={() => setShowSolution((s) => !s)}
              className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-emerald-300 ring-1 ring-inset ring-emerald-500/30 transition hover:bg-emerald-500/25"
            >
              {showSolution ? 'Hide answer' : '🔑 Reveal answer'}
            </button>
          )}
          {solutionCode && (
            <button
              onClick={loadSolution}
              className="rounded-lg px-3 py-1.5 text-amber-300 ring-1 ring-inset ring-amber-500/30 transition hover:bg-amber-500/15"
            >
              Load solution
            </button>
          )}
        </div>
      </div>

      {/* ── Editor | Preview ── */}
      <div className="grid gap-px bg-slate-800 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col bg-[#0b0b12]">
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-slate-500">
            <span className="font-mono">{filename}</span>
            <span className="uppercase tracking-wide">editable</span>
          </div>
          <div style={{ height }}>
            <CodeEditor value={code} onChange={setCode} minHeight={height} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col bg-[#0b0b12]">
          <div className="px-3 py-1.5 text-[11px] text-slate-500">Live preview</div>
          <div
            style={{ minHeight: height }}
            className="m-3 mt-0 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 p-4"
          >
            {bar && (
              <div
                className={`mb-3 rounded-lg border px-3 py-2 text-xs ${
                  bar.kind === 'syntax'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                    : bar.kind === 'runtime'
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                      : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
                }`}
              >
                {bar.msg}
                {(bar.kind === 'runtime' || bar.kind === 'syntax') && (
                  <span className="text-slate-400"> — see the console below.</span>
                )}
              </div>
            )}
            <ErrorBoundary resetKey={runId} onError={handleRuntimeError}>
              {compiled != null && (
                <SandboxPreview key={runId} compiled={compiled} scope={scope} />
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* ── Styling tip (Tailwind-runtime caveat, turned into a lesson) ── */}
      <div className="border-t border-slate-800 px-4 py-2 text-[11px] leading-relaxed text-slate-500">
        💡 <span className="text-slate-400">Styling tip:</span> the preview styles
        plain tags (<code className="font-mono text-slate-400">ul</code>,{' '}
        <code className="font-mono text-slate-400">li</code>,{' '}
        <code className="font-mono text-slate-400">button</code>…). Tailwind
        classes you invent here won’t exist in the CSS — use an inline{' '}
        <code className="font-mono text-slate-400">style={'{{…}}'}</code> for
        custom looks.
      </div>

      {/* ── Progressive hints ── */}
      {hints.length > 0 && (
        <div className="border-t border-slate-800 px-4 py-3">
          {revealedHints < hints.length ? (
            <button
              onClick={() => setRevealedHints((n) => n + 1)}
              className="text-xs font-semibold text-amber-300 transition hover:text-amber-200"
            >
              💡 Need a hint? ({revealedHints}/{hints.length} shown)
            </button>
          ) : (
            <span className="text-xs text-slate-500">All hints revealed.</span>
          )}
          {revealedHints > 0 && (
            <ul className="mt-2 space-y-1">
              {hints.slice(0, revealedHints).map((hint, i) => (
                <li key={i} className="text-xs text-amber-200/90">
                  • {hint}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Reveal answer (read-only, doesn't overwrite the learner's code) ── */}
      {showSolution && solutionCode && (
        <div className="border-t border-slate-800 p-4">
          <p className="mb-2 text-xs font-semibold text-emerald-300">✅ Solution</p>
          <CodeBlock filename="solution.jsx" code={solutionCode} highlight />
        </div>
      )}

      {/* ── In-app console ── */}
      <div className="border-t border-slate-800 p-3">
        <SandboxConsole logs={logs} onClear={clear} height={consoleHeight} />
      </div>
    </div>
  )
}
