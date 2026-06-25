import Panel from './Panel'

/**
 * CheckpointCard — "what a senior catches in code review".
 *
 * Pass an array of items: { bad, good, why }.
 *   bad  → the junior move (string)
 *   good → the senior move (string)
 *   why  → one-line reasoning (optional)
 */
export default function CheckpointCard({ items = [] }) {
  return (
    <Panel className="border-amber-500/20 bg-amber-500/[0.03]">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">🧑‍🏫</span>
        <h3 className="text-base font-bold text-amber-200">Internship Checkpoint</h3>
        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
          Code review
        </span>
      </div>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li
            key={i}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.04] p-3">
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-rose-400">
                  🚫 Junior move
                </div>
                <div className="text-sm text-slate-300">{item.bad}</div>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-emerald-400">
                  ✅ Senior move
                </div>
                <div className="text-sm text-slate-300">{item.good}</div>
              </div>
            </div>
            {item.why && (
              <div className="mt-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Why it matters: </span>
                {item.why}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  )
}
