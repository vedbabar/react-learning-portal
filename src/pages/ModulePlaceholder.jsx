import { Link } from 'react-router-dom'
import { Panel, Pill } from '../components/ui'

/**
 * ModulePlaceholder — renders for modules that aren't built yet, so the route
 * still works and the sidebar never points at a dead link.
 */
export default function ModulePlaceholder({ module }) {
  return (
    <div>
      <Pill tone="slate">Module {module.id}</Pill>
      <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
        {module.title}
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400">
        {module.blurb}
      </p>

      <Panel className="mt-8 border-dashed">
        <div className="flex flex-col items-center py-8 text-center">
          <div className="text-4xl">🚧</div>
          <h2 className="mt-3 text-lg font-bold text-slate-200">
            We'll build this chapter next.
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-slate-400">
            Module 1 is fully interactive right now. Ask me to “generate Module{' '}
            {module.id}” and I'll drop a complete{' '}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-cyan-300">
              src/modules/module{module.id}/
            </code>{' '}
            page with theory, a playground, and a fix-the-bug sandbox.
          </p>
          <Link
            to="/module-1"
            className="mt-5 rounded-lg bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-300 ring-1 ring-inset ring-cyan-500/30 transition hover:bg-cyan-500/25"
          >
            ← Start with Module 1
          </Link>
        </div>
      </Panel>
    </div>
  )
}
