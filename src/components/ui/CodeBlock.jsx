import { useState } from 'react'

/**
 * CodeBlock — a styled, copyable code sample.
 *
 * We keep this dependency-free (no syntax-highlighting library) on purpose so
 * the project stays tiny and fast. It still gives you a filename header, a
 * language tag, and a one-click Copy button.
 *
 * Pass code as a template literal:
 *   <CodeBlock filename="App.jsx" code={`const x = 1`} />
 */
export default function CodeBlock({ code, filename, language = 'jsx', highlight = false }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      // Reset the label after a moment. (You'll learn why setTimeout + state
      // needs cleanup in Module 3 — here it's harmless because it's a one-shot.)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard blocked (e.g. insecure context) — ignore silently */
    }
  }

  return (
    <div
      className={`min-w-0 overflow-hidden rounded-xl border ${
        highlight ? 'border-cyan-500/40' : 'border-slate-800'
      } bg-[#0b0b12]`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </span>
          <span className="ml-1 font-mono text-xs text-slate-400">
            {filename || language}
          </span>
        </div>
        <button
          onClick={copy}
          className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-slate-200">{code}</code>
      </pre>
    </div>
  )
}
