import { NavLink } from 'react-router-dom'
import { MODULES } from '../lib/curriculum'
import { useProgress } from '../lib/progress'

/**
 * Sidebar — persistent navigation + progress.
 *
 * <NavLink> is React Router's smart link: it knows whether its `to` matches the
 * current URL and hands us an `isActive` flag so we can highlight the current
 * page. We `.map()` over the curriculum array instead of hand-writing six
 * links. Completion state comes from the shared progress Context, so checking
 * off a module here lights up instantly everywhere.
 */
export default function Sidebar() {
  const { isComplete, completedCount, total, percent } = useProgress()

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/60 backdrop-blur">
      <div className="border-b border-slate-800/80 px-5 py-5">
        <NavLink to="/" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 text-lg font-black text-white shadow-lg shadow-cyan-500/30">
            ⚛
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold text-white">React Crash Course</div>
            <div className="text-[11px] text-slate-500">Learn by building & fixing</div>
          </div>
        </NavLink>
      </div>

      {/* Overall progress */}
      <div className="border-b border-slate-800/80 px-5 py-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-semibold uppercase tracking-wider text-slate-500">
            Your progress
          </span>
          <span className="font-bold text-emerald-300">
            {completedCount}/{total}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Curriculum
        </div>
        {MODULES.map((m) => {
          const done = isComplete(m.id)
          return (
            <NavLink
              key={m.id}
              to={m.path}
              className={({ isActive }) =>
                [
                  'group flex items-start gap-3 rounded-lg px-2.5 py-2 text-sm transition',
                  isActive
                    ? 'bg-cyan-500/10 text-white ring-1 ring-inset ring-cyan-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                      done
                        ? 'bg-emerald-500 text-white'
                        : isActive
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700',
                    ].join(' ')}
                  >
                    {done ? '✓' : m.id}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium leading-snug">{m.short}</span>
                    {done ? (
                      <span className="text-[11px] font-medium text-emerald-500/80">
                        completed
                      </span>
                    ) : m.status === 'soon' ? (
                      <span className="text-[11px] font-medium text-slate-600">
                        coming soon
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-600">
                        theory + sandbox
                      </span>
                    )}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-slate-800/80 px-5 py-4 text-[11px] leading-relaxed text-slate-600">
        Built with <span className="text-slate-400">Vite · React · Tailwind</span>
        <br />
        Progress saves in this browser.
      </div>
    </aside>
  )
}
