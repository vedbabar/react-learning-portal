// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Module 1 sandbox — snippet sources                                    ║
// ╠══════════════════════════════════════════════════════════════════════╣
// ║  These are no longer a live-rendered component. The <LiveSandbox> on    ║
// ║  the Module 1 page transpiles these JSX *strings* in the browser, so    ║
// ║  you can edit them right on the page and watch them re-render — no       ║
// ║  external editor, no DevTools.                                           ║
// ║                                                                          ║
// ║  Snippets use plain semantic tags (no Tailwind classes) — they're        ║
// ║  styled by sandbox-preview.css. `TEAM` is injected into the snippet's    ║
// ║  scope by the sandbox, so the code needs no imports.                     ║
// ╚══════════════════════════════════════════════════════════════════════╝

export const TEAM = [
  { id: 'u1', name: 'Ada Lovelace', role: 'Engineer' },
  { id: 'u2', name: 'Alan Turing', role: 'Architect' },
  { id: 'u3', name: 'Grace Hopper', role: 'Compiler Wizard' },
  { id: 'u4', name: 'Katherine Johnson', role: 'Orbital Math' },
]

export const BROKEN_LIST = `// Goal: render each teammate as "Name — Role".
// TWO bugs are hiding here. Watch the in-app console below 👇
//
//   1) the <li> created inside .map() has no \`key\`
//   2) the first cell renders {member} — a whole OBJECT — not {member.name}

function TeamList() {
  return (
    <ul>
      {TEAM.map((member) => (
        <li>
          <strong>{member}</strong>
          <span>{member.role}</span>
        </li>
      ))}
    </ul>
  )
}

render(<TeamList />)
`

export const FIXED_LIST = `// Fixed:
//   - a stable key={member.id} on the <li>
//   - {member.name} (a string) instead of the whole {member} object

function TeamList() {
  return (
    <ul>
      {TEAM.map((member) => (
        <li key={member.id}>
          <strong>{member.name}</strong>
          <span>{member.role}</span>
        </li>
      ))}
    </ul>
  )
}

render(<TeamList />)
`
