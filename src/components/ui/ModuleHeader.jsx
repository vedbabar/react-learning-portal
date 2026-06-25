import Pill from './Pill'

/**
 * ModuleHeader — the big title block at the top of each chapter, plus a sticky
 * in-page nav (Theory / Playground / Sandbox / Checkpoint).
 */
export default function ModuleHeader({ id, title, blurb, tags = [], sections = [] }) {
  return (
    <header className="mb-10">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 text-lg font-black text-white shadow-lg shadow-cyan-500/20">
          {id}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Module {id}
        </span>
      </div>

      <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400">{blurb}</p>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Pill key={t} tone="violet">
              {t}
            </Pill>
          ))}
        </div>
      )}

      {sections.length > 0 && (
        <nav className="mt-6 flex flex-wrap gap-2 border-t border-slate-800 pt-5">
          {sections.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-300"
            >
              {s.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
