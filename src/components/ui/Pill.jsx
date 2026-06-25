const TONES = {
  slate: 'bg-slate-800 text-slate-300 ring-slate-700',
  cyan: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/30',
  violet: 'bg-violet-500/10 text-violet-300 ring-violet-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  rose: 'bg-rose-500/10 text-rose-300 ring-rose-500/30',
}

/** A tiny rounded label/badge. Pure props in → styled span out. */
export default function Pill({ children, tone = 'slate', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
