import { Link } from 'react-router-dom'
import { MODULES } from '../lib/curriculum'
import { useProgress } from '../lib/progress'
import { Panel, Pill } from '../components/ui'

/**
 * Home — the landing page. A grid of module cards built by mapping over the
 * curriculum, with an overall progress bar pulled from the shared Context.
 */
export default function Home() {
  const { isComplete, completedCount, total, percent, resetProgress } = useProgress()

  return (
    <div>
      <div className="mb-8">
        <Pill tone="cyan">Vite · React · Tailwind</Pill>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Build React by{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
            breaking it
          </span>
          .
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
          This app <em>is</em> the course. Every chapter is a route with three
          parts: <strong className="text-slate-200">theory</strong> with ELI5
          analogies, a <strong className="text-slate-200">live playground</strong>{' '}
          you can poke, and a{' '}
          <strong className="text-slate-200">“fix the bug” sandbox</strong> where
          you edit deliberately broken code right on the page and watch it heal.
        </p>
      </div>

      {/* Overall progress */}
      <Panel className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">
              {completedCount === total
                ? '🎉 Course complete!'
                : `You've completed ${completedCount} of ${total} modules`}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              Progress is saved in this browser.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-emerald-300">{percent}%</span>
            {completedCount > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Reset all your progress?')) resetProgress()
                }}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-700 transition hover:bg-slate-800 hover:text-slate-300"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => {
          const ready = m.status === 'ready'
          const done = isComplete(m.id)
          const Card = (
            <Panel
              className={`group h-full transition ${
                ready
                  ? 'cursor-pointer hover:border-cyan-500/40 hover:bg-slate-900/70'
                  : 'opacity-70'
              } ${done ? 'border-emerald-500/30' : ''}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black ${
                    done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-300 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-violet-600 group-hover:text-white'
                  }`}
                >
                  {done ? '✓' : m.id}
                </span>
                {done ? (
                  <Pill tone="emerald">✓ Completed</Pill>
                ) : ready ? (
                  <Pill tone="cyan">Ready</Pill>
                ) : (
                  <Pill tone="slate">Coming soon</Pill>
                )}
              </div>
              <h3 className="text-lg font-bold text-white">{m.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{m.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {m.tags.map((t) => (
                  <Pill key={t} tone="violet">
                    {t}
                  </Pill>
                ))}
              </div>
            </Panel>
          )

          return ready ? (
            <Link key={m.id} to={m.path} className="block">
              {Card}
            </Link>
          ) : (
            <div key={m.id}>{Card}</div>
          )
        })}
      </div>
    </div>
  )
}
