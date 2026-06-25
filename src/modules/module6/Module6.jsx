import {
  useState,
  createContext,
  useContext,
} from 'react'
import {
  ModuleHeader,
  SectionHeading,
  Panel,
  Callout,
  CodeBlock,
  RevealCard,
  CheckpointCard,
  Playground,
  Pill,
  LiveSandbox,
} from '../../components/ui'

/* ════════════════════════════════════════════════════════════════════════
   DEMO COMPONENTS
   These power the interactive sections below. They live in this one file so
   you can read the whole chapter top-to-bottom; in a real app you'd give each
   Context its own module (e.g. ThemeContext.jsx, AuthContext.jsx).
   ════════════════════════════════════════════════════════════════════════ */

/* ───────────────────────────────────────────────────────────────────────
   THEORY DEMO — prop drilling, visualized.
   The same `username` has to be threaded through THREE components that don't
   care about it, just to reach the deep <Greeting> at the bottom. Toggle the
   highlight to see how many "pass-through" layers a single prop touches.
   ─────────────────────────────────────────────────────────────────────── */
function DrillingDemo() {
  const [highlight, setHighlight] = useState(true)

  // Each "layer" is a relay station the prop must hop through.
  const layers = [
    { name: '<App>', note: 'owns the data', uses: true },
    { name: '<Page>', note: 'just passes it down', uses: false },
    { name: '<Sidebar>', note: 'just passes it down', uses: false },
    { name: '<Profile>', note: 'just passes it down', uses: false },
    { name: '<Greeting>', note: 'finally USES it', uses: true },
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          The journey of one <code className="font-mono text-amber-300">username</code> prop
        </span>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={highlight}
            onChange={(e) => setHighlight(e.target.checked)}
            className="h-4 w-4 accent-rose-400"
          />
          show pass-through layers
        </label>
      </div>

      <div className="space-y-1.5 font-mono text-sm">
        {layers.map((layer, i) => {
          const isPassThrough = !layer.uses && highlight
          return (
            <div
              key={layer.name}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition ${
                isPassThrough
                  ? 'border-rose-500/40 bg-rose-500/10'
                  : layer.uses
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-slate-800 bg-slate-950/40'
              }`}
              style={{ marginLeft: i * 18 }}
            >
              <span
                className={
                  layer.uses ? 'text-emerald-300' : 'text-slate-300'
                }
              >
                {layer.name}
              </span>
              <span className="text-slate-600">·</span>
              <span
                className={`text-xs ${
                  isPassThrough ? 'text-rose-300' : 'text-slate-500'
                }`}
              >
                {layer.note}
              </span>
              {isPassThrough && (
                <span className="ml-auto text-xs text-rose-400">
                  username={'{username}'} 🥱
                </span>
              )}
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        Three of the five components touch{' '}
        <code className="font-mono text-amber-300">username</code> only to hand
        it off. That's <span className="text-rose-300">prop drilling</span>:
        plumbing, not logic.
      </p>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────────────
   PLAYGROUND DEMO (a) — THEME SWITCHER with a REAL Context.
   We create a context, wrap a subtree in its Provider, and a DEEPLY nested
   button reads the theme via useContext — with NO props passed down the tree.
   ─────────────────────────────────────────────────────────────────────── */

// 1) Create the context. The argument is the DEFAULT value used ONLY when a
//    consumer has no matching Provider above it. (Remember this for the bug!)
const ThemeContext = createContext('light')

// 2) A deeply nested component. Notice: it takes NO props. It reaches UP the
//    tree with useContext to grab whatever the nearest Provider is broadcasting.
function DeepThemedCard() {
  const theme = useContext(ThemeContext) // the "loudspeaker" — just listen
  const isDark = theme === 'dark'
  return (
    <div
      className={`rounded-lg border p-4 transition ${
        isDark
          ? 'border-slate-700 bg-slate-950 text-slate-100'
          : 'border-amber-200 bg-amber-50 text-slate-900'
      }`}
    >
      <div className="text-sm font-bold">
        {isDark ? '🌙 Dark mode' : '☀️ Light mode'}
      </div>
      <p
        className={`mt-1 text-xs ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        I'm nested 3 levels deep and received{' '}
        <strong>zero props</strong>. I read{' '}
        <code className="font-mono">theme = "{theme}"</code> straight from
        context.
      </p>
    </div>
  )
}

// These middle layers exist only to PROVE the point: they pass nothing down,
// yet the card still gets the theme. That's the whole pitch of Context.
function ThemeMidLayer() {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 p-3">
      <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">
        &lt;ThemeMidLayer&gt; — passes no props
      </p>
      <ThemeInnerLayer />
    </div>
  )
}
function ThemeInnerLayer() {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 p-3">
      <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">
        &lt;ThemeInnerLayer&gt; — passes no props
      </p>
      <DeepThemedCard />
    </div>
  )
}

function ThemeSwitcherDemo() {
  const [theme, setTheme] = useState('light')

  return (
    // 3) The Provider broadcasts `value` to EVERY descendant, however deep.
    <ThemeContext.Provider value={theme}>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              The Provider's value (one piece of state)
            </span>
            <button
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              className="rounded-lg bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-300 ring-1 ring-inset ring-violet-500/30 transition hover:bg-violet-500/25"
            >
              Toggle theme (currently:{' '}
              <span className="text-violet-200">{theme}</span>)
            </button>
          </div>
          <Callout variant="tip" title="Watch the wiring">
            The toggle sets state on the Provider. The deep card re-reads context
            and restyles itself — and not one component in between had to forward
            a single prop.
          </Callout>
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">
            &lt;Provider&gt; wraps this whole subtree ↓
          </p>
          {/* Two pass-through layers, then the consumer. No props anywhere. */}
          <ThemeMidLayer />
        </div>
      </div>
    </ThemeContext.Provider>
  )
}

/* ───────────────────────────────────────────────────────────────────────
   PLAYGROUND DEMO (b) — AUTH CONTEXT with user + login()/logout().
   A nested navbar reads the current user from context and shows the right
   button — again, no props threaded down from the top.
   ─────────────────────────────────────────────────────────────────────── */

// The default is `null` — "logged out" — so even with no Provider the app
// doesn't crash, it just behaves as a guest.
const AuthContext = createContext(null)

// A nested navbar. It pulls BOTH the user and the actions out of one context
// object. No props — it talks to the AuthContext directly.
function Navbar() {
  const { user, login, logout } = useContext(AuthContext)
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3">
      <span className="text-sm font-bold text-slate-200">⚡ Acme App</span>
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300">
            Hi, <span className="font-semibold text-emerald-300">{user.name}</span>
          </span>
          <button
            onClick={logout}
            className="rounded-md bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-300 ring-1 ring-inset ring-rose-500/30 transition hover:bg-rose-500/25"
          >
            Log out
          </button>
        </div>
      ) : (
        <button
          onClick={login}
          className="rounded-md bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/30 transition hover:bg-emerald-500/25"
        >
          Log in
        </button>
      )}
    </div>
  )
}

// A page body that ALSO reads auth, to show many consumers share one source.
function AccountPanel() {
  const { user } = useContext(AuthContext)
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-sm">
      {user ? (
        <p className="text-slate-300">
          🔓 You're viewing your private dashboard,{' '}
          <span className="font-semibold text-emerald-300">{user.name}</span>.
        </p>
      ) : (
        <p className="text-slate-400">
          🔒 Please log in to see your dashboard.
        </p>
      )}
    </div>
  )
}

function AuthContextDemo() {
  // The Provider OWNS the auth state and the functions that change it.
  const [user, setUser] = useState(null)
  const login = () => setUser({ name: 'Ada' })
  const logout = () => setUser(null)

  // We hand the whole bundle — data + actions — down through context.
  const value = { user, login, logout }

  return (
    <AuthContext.Provider value={value}>
      <div className="space-y-3">
        <Navbar />
        <AccountPanel />
        <p className="text-center text-xs text-slate-500">
          Both the navbar and the dashboard read the <em>same</em> user from one{' '}
          <code className="font-mono text-cyan-300">AuthContext</code> — change it
          once, every consumer updates.
        </p>
      </div>
    </AuthContext.Provider>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SANDBOX SNIPPET STRINGS
   Plain semantic HTML, no Tailwind, no backticks/${} inside. `createContext`
   and `useContext` are injected into the snippet scope, so no imports needed.
   ════════════════════════════════════════════════════════════════════════ */

const BROKEN_CONTEXT = `// Goal: clicking "Toggle" should flip the button between light & dark.
// BUG: <ThemedButton> reads useContext(ThemeContext), but NOTHING in this
// tree is wrapped in <ThemeContext.Provider>. So useContext silently returns
// the context's DEFAULT ("light"), the toggle's state changes... and the
// deep button never hears about it. Clicking does nothing visible. 😖

const ThemeContext = createContext("light")

// Deeply nested. It listens to context for the theme. No props.
function ThemedButton() {
  const theme = useContext(ThemeContext)
  const dark = theme === "dark"
  return (
    <button style={{
      background: dark ? "#0f172a" : "#fde68a",
      color: dark ? "#e2e8f0" : "#0f172a",
      border: "1px solid #64748b",
      padding: "8px 14px",
      borderRadius: "8px",
    }}>
      Theme is: {theme}
    </button>
  )
}

// A middle layer that just nests the button — no props passed.
function Toolbar() {
  return (
    <div>
      <p>Toolbar (passes nothing down)</p>
      <ThemedButton />
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState("light")
  return (
    <div>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle (state says: {theme})
      </button>
      {/* 🐛 No Provider here, so ThemedButton can't see this theme. */}
      <Toolbar />
    </div>
  )
}

render(<App />)
`

const FIXED_CONTEXT = `// Fix: wrap the subtree in <ThemeContext.Provider value={theme}>.
// Now the toggle's state flows down the loudspeaker, the deep button reads
// the LIVE value (not the default), and clicking actually restyles it.

const ThemeContext = createContext("light")

function ThemedButton() {
  const theme = useContext(ThemeContext)
  const dark = theme === "dark"
  return (
    <button style={{
      background: dark ? "#0f172a" : "#fde68a",
      color: dark ? "#e2e8f0" : "#0f172a",
      border: "1px solid #64748b",
      padding: "8px 14px",
      borderRadius: "8px",
    }}>
      Theme is: {theme}
    </button>
  )
}

function Toolbar() {
  return (
    <div>
      <p>Toolbar (passes nothing down)</p>
      <ThemedButton />
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState("light")
  return (
    // ✅ The Provider broadcasts the live theme to every descendant.
    <ThemeContext.Provider value={theme}>
      <div>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          Toggle (state says: {theme})
        </button>
        <Toolbar />
      </div>
    </ThemeContext.Provider>
  )
}

render(<App />)
`

/* ════════════════════════════════════════════════════════════════════════
   CHECKPOINTS
   ════════════════════════════════════════════════════════════════════════ */

const CHECKPOINTS = [
  {
    bad: 'Threading a prop through 4 components that never read it, just to reach the 5th: <Page user={user}/> → <Sidebar user={user}/> → <Menu user={user}/> → <Avatar user={user}/>.',
    good: 'Put genuinely cross-cutting data in Context and read it where you need it with useContext — the middle layers stay clean.',
    why: 'Pass-through props are pure plumbing: they bloat signatures, make refactors painful, and every intermediate component re-renders for data it ignores.',
  },
  {
    bad: 'Calling useContext(ThemeContext) but forgetting to wrap the tree in <ThemeContext.Provider>. The toggle "does nothing".',
    good: 'Render a <ThemeContext.Provider value={...}> above every consumer (often at the app root), and pick a default that screams "no provider" while debugging.',
    why: 'With no matching Provider, useContext returns the createContext DEFAULT — silently. There is no error, so it looks like your state is broken when really the value never reached the consumer.',
  },
  {
    bad: 'Stuffing theme + auth + cart + form drafts + every modal flag into one giant <AppContext> with one big value object.',
    good: 'Split by concern: ThemeContext, AuthContext, CartContext. Each Provider re-renders only its own consumers.',
    why: 'When ANY field on a Provider value changes, EVERY consumer of that context re-renders. One mega-context turns an unrelated change into an app-wide re-render storm.',
  },
  {
    bad: 'Reaching for Context (or installing Redux) the moment two sibling components need to share a value.',
    good: 'First try "lifting state up": move the state to the nearest common parent and pass props. Escalate to Context only when the prop path gets deep and crosscutting.',
    why: 'Most sharing is shallow and local. Lifting state up keeps data flow explicit and traceable; Context/Redux add indirection you should only pay for when drilling genuinely hurts.',
  },
  {
    bad: 'Treating Context as "a shortcut to avoid typing props," then being surprised that a value you set is visible everywhere in the app.',
    good: 'Remember Context shares state across an entire subtree by design. Scope the Provider to just the part of the tree that needs it.',
    why: 'Context is global-ish state for its subtree, not local sugar. Wrapping the whole app in a Provider when only a panel needs the data leaks that state (and its re-renders) far wider than intended.',
  },
]

/* ════════════════════════════════════════════════════════════════════════
   THE MODULE PAGE
   ════════════════════════════════════════════════════════════════════════ */

export default function Module6() {
  return (
    <article>
      <ModuleHeader
        id={6}
        title="The State Management Landscape"
        blurb="State doesn't always live where it's needed. When data has to reach a far-off, deeply nested component, beginners thread it through every layer in between — prop drilling. This module shows you the escape hatch: the Context API, when to use it, and (just as important) when not to."
        tags={['Prop drilling', 'Context API', 'createContext', 'useContext']}
        sections={[
          { href: '#theory', label: '1. Theory' },
          { href: '#playground', label: '2. Playground' },
          { href: '#sandbox', label: '3. Fix the Bug' },
          { href: '#checkpoint', label: '4. Checkpoint' },
        ]}
      />

      {/* ─────────────────────────── THEORY ─────────────────────────── */}
      <section className="mb-14">
        <SectionHeading
          id="theory"
          kicker="Concept"
          icon="📡"
          title="Prop drilling, and the Context escape hatch"
        />

        <div className="space-y-5">
          <Callout variant="eli5" title="The note vs. the loudspeaker">
            <p className="mb-2">
              <strong>Prop drilling</strong> is passing a note hand-to-hand
              through a packed room to reach someone in the back row. Everyone in
              between has to physically hold and pass the note, even though it's
              not for them. Slow, tedious, and if one person fumbles, the message
              never arrives.
            </p>
            <p>
              <strong>Context</strong> is a <strong>loudspeaker</strong>. You
              announce the message once, and <em>anyone</em> in the room who cares
              to listen just hears it — no relay chain, no middle-people. In React,{' '}
              the Provider is the loudspeaker and{' '}
              <code>useContext</code> is putting your ear up.
            </p>
          </Callout>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              What prop drilling actually is
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Drilling isn't "passing props" — passing props is normal and good.
              Drilling is passing a prop through{' '}
              <em>intermediate components that don't use it</em>, purely to reach
              a deep descendant. Those middle components become couriers: their
              prop signatures grow, refactors get fragile, and they re-render for
              data they never read.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <Pill tone="rose">The drilling smell</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="drilling.jsx"
                    code={`function App() {
  const user = { name: 'Ada' }
  // user starts here…
  return <Page user={user} />
}

// …but only <Greeting> uses it. The three
// middle components are forced to carry it.
const Page    = ({ user }) => <Sidebar user={user} />
const Sidebar = ({ user }) => <Profile user={user} />
const Profile = ({ user }) => <Greeting user={user} />
const Greeting = ({ user }) => <h1>Hi {user.name}</h1>`}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <Pill tone="emerald">The same thing with Context</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="context.jsx"
                    highlight
                    code={`const UserContext = createContext(null)

function App() {
  const user = { name: 'Ada' }
  // Announce once at the top…
  return (
    <UserContext.Provider value={user}>
      <Page />
    </UserContext.Provider>
  )
}

// Middle components pass NOTHING. Clean.
const Page    = () => <Sidebar />
const Sidebar = () => <Profile />
const Profile = () => <Greeting />

// …and the deep one just listens.
function Greeting() {
  const user = useContext(UserContext)
  return <h1>Hi {user.name}</h1>
}`}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <DrillingDemo />
            </div>
          </Panel>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              The three moving parts of Context
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Context always comes in three pieces. Learn the shape once and
              every Context you ever write looks the same:
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <Pill tone="cyan">1 · Create</Pill>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  <code className="font-mono text-cyan-300">
                    createContext(default)
                  </code>{' '}
                  makes the channel. The argument is the fallback used only when a
                  consumer has <em>no</em> Provider above it.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <Pill tone="violet">2 · Provide</Pill>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  <code className="font-mono text-violet-300">
                    {'<Ctx.Provider value={...}>'}
                  </code>{' '}
                  wraps a subtree and broadcasts <code>value</code> to everything
                  inside it, at any depth.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <Pill tone="emerald">3 · Consume</Pill>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  <code className="font-mono text-emerald-300">
                    useContext(Ctx)
                  </code>{' '}
                  in any descendant returns the nearest Provider's current value.
                  No props, no drilling.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <CodeBlock
                filename="the-shape.jsx"
                code={`// 1) CREATE — one channel, with a default
const ThemeContext = createContext('light')

// 2) PROVIDE — broadcast a value to a subtree
function App() {
  const [theme, setTheme] = useState('dark')
  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar />            {/* no theme prop */}
    </ThemeContext.Provider>
  )
}

// 3) CONSUME — read it deep down, no props
function ThemedButton() {
  const theme = useContext(ThemeContext)
  return <button className={theme}>Hi</button>
}`}
              />
            </div>
          </Panel>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              When to reach for Context (and when not to)
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Context is a power tool with a cost: when a Provider's{' '}
              <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-xs text-cyan-300">
                value
              </code>{' '}
              changes, <em>every</em> consumer of that context re-renders. So use
              it for state that is genuinely <strong>cross-cutting</strong> — read
              all over the tree, changes rarely — and don't dump everything into
              it.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Callout variant="tip" title="✅ Great fits">
                <ul className="ml-4 list-disc space-y-1">
                  <li>Theme (light/dark)</li>
                  <li>Authenticated user / session</li>
                  <li>Locale / i18n strings</li>
                  <li>App-wide feature flags</li>
                </ul>
              </Callout>
              <Callout variant="warn" title="🚫 Usually a mistake">
                <ul className="ml-4 list-disc space-y-1">
                  <li>A form's text input value</li>
                  <li>State only two siblings share (lift it up instead)</li>
                  <li>High-frequency values (mouse position, scroll)</li>
                  <li>"Everything," in one mega-context</li>
                </ul>
              </Callout>
            </div>
            <Callout variant="info" title="Context is not a state manager">
              <p>
                Context is a <em>transport</em> mechanism — it moves a value to
                wherever it's needed. It doesn't optimize re-renders or persist
                anything for you. For complex global state you'll later combine it
                with <code>useReducer</code>, or reach for a dedicated library
                (Redux, Zustand). But always try{' '}
                <strong>lifting state up</strong> first — most sharing is shallow
                and doesn't need any of this.
              </p>
            </Callout>
          </Panel>
        </div>
      </section>

      {/* ────────────────────────── PLAYGROUND ────────────────────────── */}
      <section className="mb-14">
        <SectionHeading
          id="playground"
          kicker="Try it live"
          icon="🎛️"
          title="Two real Contexts: theme & auth"
        />
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-400">
            Both demos below use the real{' '}
            <code className="font-mono text-cyan-300">createContext</code> /{' '}
            <code className="font-mono text-cyan-300">useContext</code> API. The
            key thing to notice: in each one, the component that finally{' '}
            <em>uses</em> the data is nested several layers deep, and{' '}
            <strong>no prop is ever passed down to it</strong>. The Provider does
            all the work.
          </p>

          <Playground
            title="(a) Theme switcher"
            subtitle="One toggle on the left; a button nested 3 layers deep on the right restyles itself — with zero props in between."
          >
            <ThemeSwitcherDemo />
          </Playground>

          <Playground
            title="(b) Auth context"
            subtitle="The Provider holds the user plus login()/logout(). A nested navbar and dashboard both read it from context."
          >
            <AuthContextDemo />
          </Playground>

          <Callout variant="tip" title="Notice the pattern">
            <p>
              In the auth demo the context value is an{' '}
              <strong>object bundling data AND actions</strong> (
              <code>{'{ user, login, logout }'}</code>). That's the idiomatic
              "provider component" shape: state lives at the top, the functions
              that change it live there too, and the whole tree gets a clean API
              to both — no callbacks drilled down as props.
            </p>
          </Callout>
        </div>
      </section>

      {/* ─────────────────────────── SANDBOX ─────────────────────────── */}
      <section className="mb-14">
        <SectionHeading
          id="sandbox"
          kicker="Your turn"
          icon="🐛"
          title="Fix the bug: the silent missing Provider"
        />

        <Callout variant="info" title="The sneakiest Context bug there is">
          <p>
            The editor below is <strong>live</strong> — edit and it re-renders on
            the right. This bug is nasty because it{' '}
            <strong>throws no error</strong>: a deep{' '}
            <code>useContext(ThemeContext)</code> call has no matching Provider
            above it, so it silently falls back to the context's{' '}
            <em>default</em> value. The toggle flips state, but the deep button
            never hears about it. Your job: give it a loudspeaker.
          </p>
        </Callout>

        <div className="mt-5">
          <LiveSandbox
            title="Fix the bug: missing Provider"
            filename="ThemeApp.jsx"
            initialCode={BROKEN_CONTEXT}
            solutionCode={FIXED_CONTEXT}
            hints={[
              'Clicking does nothing because <ThemedButton> reads context, but no <ThemeContext.Provider> sits above it — so it only ever sees the createContext default ("light").',
              'In App, wrap the returned tree in <ThemeContext.Provider value={theme}>…</ThemeContext.Provider> so the live theme reaches the deep button.',
            ]}
          />
        </div>

        <Callout variant="warn" title="Why there's no error message">
          <p>
            A missing Provider is <em>legal</em> React — that's exactly what the{' '}
            <code>createContext(defaultValue)</code> default is for. So instead of
            crashing, your consumer quietly reads the default and everything{' '}
            <em>looks</em> wired up. The tell: state changes at the top but the
            deep component never updates. When that happens, your first question
            should be: <strong>"is there a Provider above this consumer?"</strong>
          </p>
        </Callout>

        {/* Bonus static challenge: code reading, read-only so it can't break. */}
        <div className="mt-6">
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <h4 className="font-bold text-slate-100">
                Bonus: spot the mega-context smell
              </h4>
              <Pill tone="slate">code reading</Pill>
            </div>
            <p className="mb-3 text-sm text-slate-400">
              This compiles and "works" — but a senior would flag it in review.
              What's the performance trap hiding here?
            </p>
            <CodeBlock
              filename="GiantContext.jsx"
              code={`const AppContext = createContext(null)

function AppProvider({ children }) {
  const [theme, setTheme] = useState('dark')
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [mouseX, setMouseX] = useState(0) // updates constantly!

  // Everything in ONE value. Every consumer of ANYTHING
  // re-renders whenever ANY of these change.
  const value = { theme, setTheme, user, setUser, cart, setCart, mouseX }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}`}
            />
            <div className="mt-4">
              <RevealCard buttonText="Reveal the problem & fix">
                <ul className="ml-4 list-disc space-y-1.5 text-sm text-slate-300">
                  <li>
                    Every field shares one Provider <code>value</code>. When{' '}
                    <code>mouseX</code> updates (constantly!), <em>every</em>{' '}
                    consumer of this context re-renders — even a component that
                    only reads <code>theme</code>.
                  </li>
                  <li>
                    <strong>Split by concern:</strong> separate{' '}
                    <code>ThemeContext</code>, <code>AuthContext</code>,{' '}
                    <code>CartContext</code> so a change re-renders only the
                    consumers that care.
                  </li>
                  <li>
                    High-frequency values like <code>mouseX</code> usually don't
                    belong in Context at all — keep them local, or pass via props
                    to the few components that need them.
                  </li>
                </ul>
                <CodeBlock
                  filename="split.jsx"
                  highlight
                  code={`// One context per concern → narrow, targeted re-renders.
const ThemeContext = createContext('dark')
const AuthContext  = createContext(null)
const CartContext  = createContext([])

// A theme change now re-renders only theme consumers,
// not your whole app.`}
                />
              </RevealCard>
            </div>
          </Panel>
        </div>
      </section>

      {/* ────────────────────────── CHECKPOINT ────────────────────────── */}
      <section className="mb-10">
        <SectionHeading
          id="checkpoint"
          kicker="Code review"
          icon="🧑‍🏫"
          title="Mistakes seniors catch in review"
        />
        <CheckpointCard items={CHECKPOINTS} />

        <Panel className="mt-6 border-cyan-500/20">
          <div className="flex flex-col items-start gap-2">
            <Pill tone="cyan">You finished Module 6</Pill>
            <h3 className="text-lg font-bold text-white">
              You can move state to wherever it's needed — without the plumbing.
            </h3>
            <p className="text-sm text-slate-400">
              You can now name prop drilling on sight, wire up the{' '}
              <code className="font-mono text-violet-300">createContext</code> →{' '}
              <code className="font-mono text-violet-300">Provider</code> →{' '}
              <code className="font-mono text-violet-300">useContext</code>{' '}
              triangle, and — crucially — judge <em>when</em> Context earns its
              keep versus when to just lift state up. Next up:{' '}
              <strong className="text-slate-200">
                taming complex state with useReducer
              </strong>{' '}
              — and pairing it with Context to build a real app-wide store.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              When you're ready, ask: <em>“generate Module 7.”</em>
            </p>
          </div>
        </Panel>
      </section>
    </article>
  )
}
