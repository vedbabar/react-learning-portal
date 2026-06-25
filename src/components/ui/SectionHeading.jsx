/**
 * SectionHeading — a numbered section divider used inside a module page.
 * `id` becomes an anchor target so the in-page nav can jump to it.
 */
export default function SectionHeading({ id, kicker, title, icon }) {
  return (
    <div id={id} className="mb-5">
      {kicker && (
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          {kicker}
        </div>
      )}
      <h2 className="flex items-center gap-2.5 text-2xl font-bold text-white">
        {icon && <span className="text-2xl">{icon}</span>}
        {title}
      </h2>
    </div>
  )
}
