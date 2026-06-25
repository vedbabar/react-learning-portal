import { Link } from 'react-router-dom'
import { MODULES } from '../lib/curriculum'
import { useProgress } from '../lib/progress'

/**
 * Rendered automatically at the bottom of every module page (wired in App.jsx),
 * so we get a consistent "mark complete + go to next" bar without editing any of
 * the six module files. Toggling completion updates the sidebar checkmarks and
 * the Home progress bar instantly (shared Context), and persists across
 * refreshes (localStorage).
 */
export default function ModuleProgressFooter({ id }) {
  const { isComplete, toggleComplete } = useProgress()
  const done = isComplete(id)
  const next = MODULES.find((m) => m.id === id + 1)

  return (
    <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <button
        onClick={() => toggleComplete(id)}
        className={[
          'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ring-1 ring-inset transition',
          done
            ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40 hover:bg-emerald-500/25'
            : 'bg-slate-800 text-slate-200 ring-slate-700 hover:bg-slate-700',
        ].join(' ')}
      >
        <span
          className={[
            'flex h-5 w-5 items-center justify-center rounded-full text-xs',
            done ? 'bg-emerald-500 text-white' : 'border border-slate-500 text-transparent',
          ].join(' ')}
        >
          ✓
        </span>
        {done ? 'Completed — click to unmark' : 'Mark this module complete'}
      </button>

      {next ? (
        <Link
          to={next.path}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-300 ring-1 ring-inset ring-cyan-500/30 transition hover:bg-cyan-500/25"
        >
          Next: {next.short} →
        </Link>
      ) : (
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-300 ring-1 ring-inset ring-violet-500/30 transition hover:bg-violet-500/25"
        >
          🎉 You reached the end — back to overview
        </Link>
      )}
    </div>
  )
}
