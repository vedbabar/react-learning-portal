import { useState } from 'react'

/**
 * RevealCard — a spoiler box for "Reveal Answer".
 *
 * This is the simplest possible piece of stateful UI: a single boolean
 * (`open`) flipped by a button. When `open` is true we render the children;
 * when it's false we don't. That conditional `{open && <div>...</div>}` is the
 * bread and butter of React UIs.
 */
export default function RevealCard({
  buttonText = 'Reveal Answer',
  hideText = 'Hide Answer',
  children,
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04]">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
          <span>{open ? '🔓' : '🔒'}</span>
          {open ? hideText : buttonText}
        </span>
        <span
          className={`text-emerald-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-emerald-500/20 p-4">{children}</div>
      )}
    </div>
  )
}
