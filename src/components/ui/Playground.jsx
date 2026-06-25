import Panel from './Panel'

/**
 * Playground — a labeled container for "live, working" demos.
 *
 * The little pulsing "LIVE" badge is just decoration to signal: everything
 * inside this box is real, running React you can poke at.
 */
export default function Playground({ title, subtitle, children }) {
  return (
    <Panel className="border-cyan-500/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-300 ring-1 ring-inset ring-cyan-500/30">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          Live
        </span>
      </div>
      <div>{children}</div>
    </Panel>
  )
}
