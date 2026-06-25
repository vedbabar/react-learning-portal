import { useEffect, useRef } from 'react'

/**
 * The in-app console panel — the whole reason this sandbox exists. It shows the
 * exact console output the learner would otherwise have to open DevTools to see,
 * including React's dev warnings (the "missing key" warning lands here as a red
 * error row).
 */
const LEVEL = {
  error: { row: 'text-rose-300', rule: 'border-rose-500/50', icon: '⛔' },
  warn: { row: 'text-amber-300', rule: 'border-amber-500/50', icon: '▲' },
  info: { row: 'text-cyan-300', rule: 'border-cyan-500/40', icon: 'ℹ' },
  log: { row: 'text-slate-300', rule: 'border-slate-700', icon: '›' },
}

export default function SandboxConsole({ logs, onClear, height = 150 }) {
  const scrollRef = useRef(null)

  // Keep the newest line in view.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [logs])

  const counts = logs.reduce((acc, l) => {
    acc[l.level] = (acc[l.level] || 0) + (l.count || 1)
    return acc
  }, {})

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#08080d]">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-3 py-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-300">Console</span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            in-app
          </span>
          <span className="text-rose-400">⛔ {counts.error || 0}</span>
          <span className="text-amber-400">▲ {counts.warn || 0}</span>
          <span className="text-slate-400">› {(counts.log || 0) + (counts.info || 0)}</span>
        </div>
        <button
          onClick={onClear}
          className="rounded px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
        >
          Clear
        </button>
      </div>

      <div
        ref={scrollRef}
        style={{ height }}
        className="overflow-auto p-2 font-mono text-[12px] leading-relaxed"
      >
        {logs.length === 0 ? (
          <p className="px-1 py-2 text-slate-500">
            Console is clear — edit the code and watch React talk to you here. No
            DevTools needed.
          </p>
        ) : (
          logs.map((entry) => <ConsoleRow key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  )
}

function ConsoleRow({ entry }) {
  const style = LEVEL[entry.level] || LEVEL.log

  // React appends a component stack ("\n    at li\n    at TeamList…") — split it
  // off so the headline reads cleanly and the stack collapses into a details.
  const splitAt = entry.text.indexOf('\n    at ')
  const headline = splitAt >= 0 ? entry.text.slice(0, splitAt) : entry.text
  const stack = splitAt >= 0 ? entry.text.slice(splitAt).trim() : null

  return (
    <div className={`border-l-2 ${style.rule} px-2 py-1`}>
      <div className={`flex gap-2 ${style.row}`}>
        <span className="select-none opacity-70">{style.icon}</span>
        <span className="min-w-0 whitespace-pre-wrap break-words">
          {headline}
          {entry.count > 1 && (
            <span className="ml-2 rounded bg-slate-800 px-1 text-[10px] text-slate-400">
              ×{entry.count}
            </span>
          )}
        </span>
      </div>
      {stack && (
        <details className="ml-6 mt-0.5">
          <summary className="cursor-pointer text-[11px] text-slate-500 hover:text-slate-400">
            component stack
          </summary>
          <pre className="mt-1 whitespace-pre-wrap text-[11px] text-slate-600">{stack}</pre>
        </details>
      )}
    </div>
  )
}
