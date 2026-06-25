/**
 * Callout — a colored aside box for analogies, warnings, and tips.
 *
 * `variant` selects a preset look. Defaulting props (variant = 'info') is a
 * common pattern: callers only override what they care about.
 */
const VARIANTS = {
  eli5: {
    icon: '🧸',
    label: 'ELI5',
    box: 'border-violet-500/30 bg-violet-500/5',
    chip: 'bg-violet-500/15 text-violet-300',
  },
  info: {
    icon: '💡',
    label: 'Note',
    box: 'border-cyan-500/30 bg-cyan-500/5',
    chip: 'bg-cyan-500/15 text-cyan-300',
  },
  tip: {
    icon: '🛠️',
    label: 'Pro tip',
    box: 'border-emerald-500/30 bg-emerald-500/5',
    chip: 'bg-emerald-500/15 text-emerald-300',
  },
  warn: {
    icon: '⚠️',
    label: 'Watch out',
    box: 'border-amber-500/30 bg-amber-500/5',
    chip: 'bg-amber-500/15 text-amber-300',
  },
  danger: {
    icon: '🔥',
    label: 'Gotcha',
    box: 'border-rose-500/30 bg-rose-500/5',
    chip: 'bg-rose-500/15 text-rose-300',
  },
}

export default function Callout({ variant = 'info', title, children }) {
  const v = VARIANTS[variant] ?? VARIANTS.info
  return (
    <div className={`rounded-xl border p-4 ${v.box}`}>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-base leading-none">{v.icon}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${v.chip}`}
        >
          {v.label}
        </span>
        {title && <span className="text-sm font-semibold text-slate-200">{title}</span>}
      </div>
      <div className="text-sm leading-relaxed text-slate-300 [&_code]:rounded [&_code]:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-cyan-300">
        {children}
      </div>
    </div>
  )
}
