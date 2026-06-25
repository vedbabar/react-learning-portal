/**
 * Panel — the basic "card" surface used everywhere.
 *
 * Notice this component does almost nothing except wrap `children` in a styled
 * <div>. That's the whole point of React: small, boring, reusable building
 * blocks that you compose into bigger things. `children` is the slot where
 * whatever you nest inside <Panel>...</Panel> shows up.
 */
export default function Panel({ children, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={
        'rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur ' +
        className
      }
      {...rest}
    >
      {children}
    </Tag>
  )
}
