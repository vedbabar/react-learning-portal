import { useState, useEffect } from 'react'
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
   CUSTOM HOOKS
   A custom hook is JUST a function whose name starts with "use" and which
   calls other hooks. It exists to share LOGIC — never state. Every component
   that calls one of these gets its OWN private copy of whatever state lives
   inside. We define the two demo hooks here so you can read the chapter top
   to bottom; in a real app they'd live in src/hooks/*.
   ════════════════════════════════════════════════════════════════════════ */

/**
 * useWindowSize — returns the live { width, height } of the browser window.
 *
 * WHY a hook? Three different components might all want the window size.
 * Without a hook you'd copy this same useState + useEffect + cleanup into each
 * one. With a hook you write it ONCE and call it anywhere.
 */
function useWindowSize() {
  // Lazy initializer: read the size once, on first render, instead of on every render.
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))

  useEffect(() => {
    // The effect subscribes to the browser's resize event…
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)

    // …and the cleanup unsubscribes. Without this, every component that ever
    // mounted would leave a dead listener behind — a classic memory leak.
    return () => window.removeEventListener('resize', onResize)
  }, []) // empty deps → subscribe once on mount, clean up once on unmount

  return size
}

/**
 * useLocalStorage — like useState, but the value is mirrored to localStorage,
 * so it survives a page reload. Same shape as useState: [value, setValue].
 *
 * Notice it RETURNS the [value, setValue] pair. A hook is free to return
 * anything — a value, an array, an object, a function. The caller decides
 * what to do with it.
 */
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    // Lazy initializer again: hit localStorage exactly once, on mount.
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      // Private mode / quota / corrupt JSON → fall back gracefully.
      return initialValue
    }
  })

  // Whenever the value (or key) changes, write it back to localStorage.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore write failures (storage full, disabled, etc.).
    }
  }, [key, value])

  return [value, setValue]
}

/* ════════════════════════════════════════════════════════════════════════
   DEMO COMPONENTS
   ════════════════════════════════════════════════════════════════════════ */

/**
 * PLAYGROUND (a) — useWindowSize() in action.
 * The component itself is tiny: it calls the hook and renders the numbers.
 * ALL the messy subscription logic lives in the hook, out of sight.
 */
function WindowSizeDemo() {
  const { width, height } = useWindowSize()

  // A little derived label so there's something visual to react to.
  const breakpoint =
    width < 640
      ? { label: 'mobile', tone: 'rose' }
      : width < 1024
        ? { label: 'tablet', tone: 'amber' }
        : { label: 'desktop', tone: 'emerald' }

  const breakpointColor = {
    rose: 'text-rose-300',
    amber: 'text-amber-300',
    emerald: 'text-emerald-300',
  }[breakpoint.tone]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-end gap-8 font-mono">
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-300">{width}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
              width
            </div>
          </div>
          <div className="pb-3 text-2xl text-slate-600">×</div>
          <div className="text-center">
            <div className="text-4xl font-bold text-violet-300">{height}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
              height
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          breakpoint:{' '}
          <span className={`font-semibold ${breakpointColor}`}>
            {breakpoint.label}
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        👉 Drag the browser window (or this panel) wider and narrower — the
        numbers update live. The component never wrote a single{' '}
        <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-cyan-300">
          addEventListener
        </code>
        ; the hook did.
      </p>
    </div>
  )
}

/**
 * PLAYGROUND (b) — useLocalStorage() in action.
 * Type into the field, then reload the whole page. Your text is still here,
 * because the hook persisted it. Same API surface as useState.
 */
function LocalStorageDemo() {
  // Looks exactly like useState — but it's backed by localStorage.
  const [name, setName] = useLocalStorage('m4-demo-name', '')

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* ---- The input ---- */}
      <div className="min-w-0 space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your name (persisted)
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type something…"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
          />
        </label>
        <button
          onClick={() => setName('')}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-rose-500/50 hover:text-rose-300"
        >
          Clear
        </button>
      </div>

      {/* ---- What's actually stored ---- */}
      <div className="min-w-0 space-y-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            localStorage["m4-demo-name"]
          </div>
          <div className="mt-2 break-all font-mono text-sm text-emerald-300">
            {name ? JSON.stringify(name) : <span className="text-slate-600">(empty)</span>}
          </div>
        </div>
        <Callout variant="tip" title="Now reload the page">
          <p>
            Hit <code>F5</code> / <code>Cmd&nbsp;+&nbsp;R</code>. The text you
            typed is <strong>still here</strong> — the component unmounted and
            remounted, but the hook re-read the value from disk on the way back
            in.
          </p>
        </Callout>
      </div>
    </div>
  )
}

/**
 * PLAYGROUND — "shares logic, not state" proof.
 * Two independent counters, both built from the SAME custom hook. Incrementing
 * one does NOT touch the other. This is the single most misunderstood thing
 * about custom hooks, so we make it visible.
 */
function useCounter(start = 0, step = 1) {
  const [count, setCount] = useState(start)
  const increment = () => setCount((c) => c + step)
  const reset = () => setCount(start)
  // Returning an object so the caller can name the pieces it wants.
  return { count, increment, reset }
}

function CounterCard({ name, accent }) {
  // Each card calls useCounter independently → each gets its OWN count.
  const { count, increment, reset } = useCounter(0, 1)
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-center">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {name}
      </div>
      <div className={`my-3 text-5xl font-bold ${accent}`}>{count}</div>
      <div className="flex justify-center gap-2">
        <button
          onClick={increment}
          className="rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          +1
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 transition hover:text-slate-200"
        >
          reset
        </button>
      </div>
    </div>
  )
}

function SharedLogicDemo() {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CounterCard name="Counter A" accent="text-cyan-300" />
        <CounterCard name="Counter B" accent="text-violet-300" />
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        Both counters were built from the exact same{' '}
        <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-amber-300">
          useCounter()
        </code>{' '}
        hook — yet clicking <strong>+1</strong> on A leaves B alone. The hook
        gave each one a <em>private</em> piece of state. Logic is shared; state
        is not.
      </p>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SANDBOX SNIPPET SOURCES
   Module-scope strings. Inside these template literals: NO backticks, NO
   ${...}, NO imports/exports, plain semantic tags only. The snippet defines a
   component and ends with render(<Component />).
   ════════════════════════════════════════════════════════════════════════ */

const BROKEN_HOOKS = `// 🐛 Goal: show a name field only when "logged in".
// BUG: useState is called CONDITIONALLY — it only runs when loggedIn is true.
// React tracks hooks by CALL ORDER. When the order changes between renders,
// React throws: "Rendered more hooks than during the previous render."
//
// Click "Toggle login" and watch the in-app console / preview blow up. 👇

function Profile() {
  const [loggedIn, setLoggedIn] = useState(false)

  // ❌ A hook hidden inside an if — sometimes called, sometimes skipped.
  if (loggedIn) {
    const [name, setName] = useState('Ada')
    return (
      <div>
        <p>Welcome back, {name}!</p>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => setLoggedIn(false)}>Toggle login</button>
      </div>
    )
  }

  return (
    <div>
      <p>Please log in.</p>
      <button onClick={() => setLoggedIn(true)}>Toggle login</button>
    </div>
  )
}

render(<Profile />)
`

const FIXED_HOOKS = `// ✅ Fix: call EVERY hook at the top level, unconditionally and in the same
// order on every render. Then BRANCH on the value, not on whether the hook ran.

function Profile() {
  // Both hooks run every time, in the same order — React's count stays stable.
  const [loggedIn, setLoggedIn] = useState(false)
  const [name, setName] = useState('Ada')

  if (loggedIn) {
    return (
      <div>
        <p>Welcome back, {name}!</p>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => setLoggedIn(false)}>Toggle login</button>
      </div>
    )
  }

  return (
    <div>
      <p>Please log in.</p>
      <button onClick={() => setLoggedIn(true)}>Toggle login</button>
    </div>
  )
}

render(<Profile />)
`

/* ════════════════════════════════════════════════════════════════════════
   THE MODULE PAGE
   ════════════════════════════════════════════════════════════════════════ */

const CHECKPOINTS = [
  {
    bad: 'Calling a hook inside an if, a for-loop, or an event handler: if (open) useEffect(...).',
    good: 'Call every hook at the TOP LEVEL of the component, unconditionally. Put the condition INSIDE the hook (e.g. inside the effect body) instead.',
    why: 'React matches each hook to its state slot by call ORDER, not by name. A conditional hook changes the order between renders, so React reads the wrong slot and your state corrupts (or it throws "Rendered more hooks…").',
  },
  {
    bad: 'Naming a custom hook getWindowSize() or windowSize() — without the "use" prefix.',
    good: 'Prefix it with "use": useWindowSize(). The name is not cosmetic.',
    why: "The linter (and React) keys the Rules-of-Hooks checks off the `use` prefix. Drop it and the tooling stops protecting you, and other devs won't know it's allowed to call hooks.",
  },
  {
    bad: 'Copy-pasting the same useState + useEffect + cleanup into five components.',
    good: 'Extract the shared logic into one custom hook and call it from each component.',
    why: 'Duplicated stateful logic drifts out of sync — you fix the bug in four places and miss the fifth. A hook is the single source of truth for that behavior.',
  },
  {
    bad: 'Expecting two components that both call useCart() to see the SAME cart.',
    good: 'Remember a hook shares logic, not state. For shared state, lift it up or use Context/a store.',
    why: 'Each call to a hook creates its own independent state. useCart() in two places = two separate carts. A hook is a recipe, not a shared pantry.',
  },
  {
    bad: 'Early-returning (if (!user) return null) BEFORE the rest of your hooks have run.',
    good: 'Run ALL hooks first, then do your early return. The return must come after the last hook call.',
    why: 'An early return short-circuits the render before later hooks execute, so on some renders they run and on others they don\'t — same order-mismatch bug, just sneakier.',
  },
]

export default function Module4() {
  return (
    <article>
      <ModuleHeader
        id={4}
        title="Reusability & Custom Hooks"
        blurb="Hooks gave components memory and side effects. Now we learn the two rules that keep them working — and the superpower they unlock: bundling stateful logic into your OWN reusable hooks, so you write it once and reach for it everywhere."
        tags={['Rules of Hooks', 'Call order', 'Custom hooks', 'DRY']}
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
          icon="🪝"
          title="The Rules of Hooks & why custom hooks work"
        />

        <div className="space-y-5">
          <Callout variant="eli5" title="Numbered seats at a theater">
            <p className="mb-2">
              Imagine React seats your hooks in a row of{' '}
              <strong>numbered seats</strong>: the first{' '}
              <code>useState</code> sits in seat&nbsp;1, the next hook in
              seat&nbsp;2, and so on. On the <em>next</em> render React walks the
              seats <em>in the same order</em> to hand each hook back its memory.
            </p>
            <p>
              If you <strong>sometimes skip a seat</strong> — by hiding a hook
              inside an <code>if</code> — everyone after it shifts down a seat.
              Now seat&nbsp;2 gets handed seat&nbsp;3's memory and the whole row
              is wrong. That's the entire reason for Rule&nbsp;#1. A{' '}
              <strong>custom hook</strong>, meanwhile, is just a{' '}
              <strong>recipe card</strong>: hand it to ten cooks and each makes
              their own dish in their own kitchen.
            </p>
          </Callout>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              Rule #1 — call hooks only at the top level
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Never call a hook inside a condition, a loop, a nested function, or
              after an early <code>return</code>. React doesn't read the{' '}
              <em>name</em> of your hook — it matches each call to its stored
              state purely by the <strong>order</strong> the calls happen in,
              every render. Keep the order identical and React always hands back
              the right state.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <Pill tone="rose">Breaks the order</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="bad.jsx"
                    code={`function Profile({ user }) {
  // ❌ This hook only runs when user is truthy.
  if (user) {
    const [name, setName] = useState(user.name)
  }
  // Next render user is null → useState is skipped →
  // every later hook shifts → state corrupts.
  const [tab, setTab] = useState('home')
  // ...
}`}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <Pill tone="emerald">Stable order</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="good.jsx"
                    highlight
                    code={`function Profile({ user }) {
  // ✅ Always called, same order, every render.
  const [name, setName] = useState(user?.name ?? '')
  const [tab, setTab] = useState('home')

  // Branch on the VALUE, not on whether the hook ran.
  if (!user) return <LoginPrompt />
  // ...
}`}
                  />
                </div>
              </div>
            </div>
            <Callout variant="warn" title="Early returns count too">
              <p>
                An early <code>return</code> before your last hook is a sneaky
                version of the same bug: on some renders the hooks below it run,
                on others they don't. Run <strong>all</strong> your hooks first,
                then return.
              </p>
            </Callout>
          </Panel>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              Rule #2 — only call hooks from React functions
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Call hooks from <strong>React components</strong> (functions that
              return JSX) or from <strong>other hooks</strong>. Never from a
              plain helper function, a class, or a regular event callback. That's
              the second half of the contract — and it's exactly what makes
              custom hooks legal: a hook is a function that's <em>allowed</em> to
              call other hooks.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Callout variant="tip" title="✅ A component">
                Returns JSX. Hooks welcome.
              </Callout>
              <Callout variant="tip" title="✅ Another hook">
                Name starts with <code>use</code>. Hooks welcome.
              </Callout>
              <Callout variant="danger" title="❌ A plain function">
                <code>formatDate()</code>, a click handler body, a class method —
                hooks forbidden.
              </Callout>
            </div>
          </Panel>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              A custom hook is just a function
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              There is no special syntax. A custom hook is a function whose name
              starts with <code className="text-cyan-300">use</code>, which calls
              other hooks, and returns whatever the caller needs. You're not
              learning a new API — you're <em>refactoring</em>. Watch the same
              logic move out of a component and into a reusable hook:
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="min-w-0">
                <Pill tone="amber">Logic trapped in a component</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="Before.jsx"
                    code={`function Header() {
  const [width, setWidth] = useState(
    window.innerWidth
  )
  useEffect(() => {
    const onResize = () =>
      setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () =>
      window.removeEventListener('resize', onResize)
  }, [])

  return <nav>{width}px</nav>
}`}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <Pill tone="emerald">Logic extracted into a hook</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="useWindowWidth.js"
                    highlight
                    code={`// Write it ONCE.
function useWindowWidth() {
  const [width, setWidth] = useState(
    window.innerWidth
  )
  useEffect(() => {
    const onResize = () =>
      setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () =>
      window.removeEventListener('resize', onResize)
  }, [])
  return width
}

// Reuse it anywhere.
function Header() {
  const width = useWindowWidth()
  return <nav>{width}px</nav>
}`}
                  />
                </div>
              </div>
            </div>
            <Callout variant="info" title="The one idea that trips everyone up">
              <p>
                A custom hook shares <strong>logic, not state</strong>. Every
                component that calls <code>useWindowWidth()</code> runs the hook{' '}
                <em>fresh</em> and gets its <strong>own</strong> independent{' '}
                <code>width</code> state. Two calls ≠ one shared value. (Need
                shared state? That's Context or a store — a later module.)
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
          title="Two real custom hooks you'll actually use"
        />
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-400">
            These two hooks show up in nearly every app. Notice how small the{' '}
            <em>components</em> become: all the subscription, cleanup, and
            persistence logic hides inside the hook, and the component just asks
            for a value.
          </p>

          <Playground
            title="useWindowSize()"
            subtitle="A hook that subscribes to window resize — with a cleanup that removes the listener. Resize your window and watch."
          >
            <WindowSizeDemo />
          </Playground>

          <Playground
            title="useLocalStorage(key, initial)"
            subtitle="Same API as useState, but the value is mirrored to localStorage — so it survives a reload."
          >
            <LocalStorageDemo />
          </Playground>

          <Playground
            title="useCounter() × 2 — logic is shared, state is not"
            subtitle="Both counters come from the same hook, yet each keeps its own count. This is the mental model that matters most."
          >
            <SharedLogicDemo />
          </Playground>
        </div>
      </section>

      {/* ─────────────────────────── SANDBOX ─────────────────────────── */}
      <section className="mb-14">
        <SectionHeading
          id="sandbox"
          kicker="Your turn"
          icon="🐛"
          title="Fix the bug: a conditional hook"
        />

        <Callout variant="info" title="This one runs right here — no setup">
          <p>
            The editor below is <strong>live</strong>. The component hides a{' '}
            <code>useState</code> inside an <code>if</code>. It renders fine at
            first — but click <strong>“Toggle login”</strong> and the hook count
            changes between renders, so React throws{' '}
            <em>“Rendered more hooks than during the previous render.”</em> The
            error boundary catches it and the in-app console explains it. Your
            job: move the hook to the top level.
          </p>
        </Callout>

        <div className="mt-5">
          <LiveSandbox
            title="Fix the bug: a conditional hook"
            filename="Profile.jsx"
            initialCode={BROKEN_HOOKS}
            solutionCode={FIXED_HOOKS}
            hints={[
              'A hook lives inside an if-block. Hooks must be called at the TOP LEVEL — never conditionally. Move the useState for `name` up next to the useState for `loggedIn`.',
              'Once both useState calls run on every render, you no longer need the hook inside the if — keep only the rendering branch inside it and read `name` from the top-level state.',
            ]}
          />
        </div>

        <Callout variant="warn" title="Why toggling is what breaks it">
          <p>
            On the very first render <code>loggedIn</code> is{' '}
            <code>false</code>, so React sees <strong>one</strong> hook. Click
            the button and <code>loggedIn</code> becomes <code>true</code>, so
            now React sees <strong>two</strong> hooks. The count went 1 → 2
            mid-life, and React has no idea which stored slot the new hook owns.
            That mismatch is the crash.
          </p>
        </Callout>

        {/* DRY payoff — extract repeated logic into a custom hook. */}
        <div className="mt-6">
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">♻️</span>
              <h4 className="font-bold text-slate-100">
                Bonus: the DRY payoff — extract a custom hook
              </h4>
              <Pill tone="slate">refactor</Pill>
            </div>
            <p className="mb-3 text-sm text-slate-400">
              Here are two components that need the same toggle logic
              (open/close). Spot the duplication, then see how one little hook
              erases it.
            </p>
            <CodeBlock
              filename="Before.jsx (duplicated)"
              code={`function Modal() {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen((o) => !o)
  // ...same three lines again over here:
}

function Drawer() {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen((o) => !o)
  // ...and you'll write them a THIRD time tomorrow.
}`}
            />
            <div className="mt-4">
              <RevealCard buttonText="Show the custom-hook version">
                <p className="mb-3 text-sm text-slate-300">
                  Lift the repeated <code>useState</code> + toggle into one{' '}
                  <code>useToggle</code> hook. Each component still gets its{' '}
                  <strong>own</strong> independent <code>open</code> state — you
                  just stopped copy-pasting the wiring.
                </p>
                <CodeBlock
                  filename="useToggle.js (fixed)"
                  highlight
                  code={`// Write the logic ONCE.
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = () => setOn((o) => !o)
  return [on, toggle]
}

// Reuse it — each call gets its own private state.
function Modal() {
  const [open, toggle] = useToggle()
  // ...
}

function Drawer() {
  const [open, toggle] = useToggle()
  // ...
}`}
                />
                <p className="mt-3 text-sm text-slate-400">
                  Fix a bug in <code>useToggle</code> once and{' '}
                  <strong>both</strong> components are fixed. That's the whole
                  point of DRY.
                </p>
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
            <Pill tone="cyan">You finished Module 4</Pill>
            <h3 className="text-lg font-bold text-white">
              You can package logic into reusable hooks.
            </h3>
            <p className="text-sm text-slate-400">
              You know the two Rules of Hooks and <em>why</em> call order is
              sacred, and you can lift duplicated stateful logic into a{' '}
              <code className="font-mono text-violet-300">useSomething</code>{' '}
              hook that shares logic while keeping state private. Next up:{' '}
              <strong className="text-slate-200">
                sharing state across the tree
              </strong>{' '}
              without prop-drilling — <code>useContext</code> and the Context
              API.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              When you're ready, ask: <em>“generate Module 5.”</em>
            </p>
          </div>
        </Panel>
      </section>
    </article>
  )
}
