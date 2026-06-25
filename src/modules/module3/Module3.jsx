import { useState, useEffect, useRef } from 'react'
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
   SANDBOX SNIPPETS
   These are STRINGS that get transpiled and run inside the LiveSandbox. They
   use plain semantic tags (no Tailwind) and call the injected render(<X/>) as
   their last line. No imports — React, the hooks, and the timer functions are
   all injected for you.

   IMPORTANT: inside these template literals, never use backticks or ${} — they
   would terminate the outer string. Plain quotes only.
   ════════════════════════════════════════════════════════════════════════ */

/**
 * SANDBOX 1 — the classic infinite render loop.
 * The effect has NO dependency array, so it runs after EVERY render. It calls
 * setState on every run, which schedules another render, which runs the effect
 * again… forever. React gives up and throws "Too many re-renders" /
 * "Maximum update depth exceeded", which our error boundary catches and shows.
 */
const BROKEN_LOOPER = `// Goal: show a counter. But this never settles.
// The effect runs after EVERY render (no deps array), and it sets state
// every time → render → effect → render → ... → React throws.
// Read the error in the preview / console, then fix the deps.

function Looper() {
  const [count, setCount] = useState(0)

  // 🐛 No dependency array → runs after every render, and it setStates,
  //    which triggers another render. Infinite loop.
  useEffect(() => {
    setCount(count + 1)
  })

  return <p>Render count: {count}</p>
}

render(<Looper />)
`

const FIXED_LOOPER = `// Fixed: an empty deps array [] means "run this effect ONCE, after the
// first paint." It still bumps the count a single time, then stops — because
// the effect never runs again. The loop is broken.

function Looper() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(count + 1)
  }, []) // ← run once on mount, not after every render

  return <p>Render count: {count}</p>
}

render(<Looper />)
`

/**
 * SANDBOX 2 — a stopwatch that leaks its interval.
 * The effect starts a setInterval but never returns a cleanup. The timer
 * sandbox auto-clears it on remount so the page doesn't melt, but the LESSON
 * is: write the cleanup yourself. Without it, every remount stacks another
 * ticking interval on top of the last (in a real app, the seconds would race).
 */
const BROKEN_STOPWATCH = `// Goal: a stopwatch that ticks once per second.
// It "works"… but it never cleans up the interval. In a real app, each time
// this component remounts you'd stack ANOTHER interval on top — the number
// would speed up and you'd leak timers. Add the cleanup.

function Stopwatch() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    // 🐛 We start a timer but never stop it. No cleanup returned.
    setInterval(() => setSeconds((s) => s + 1), 1000)
  }, [])

  return <p>Elapsed: {seconds}s</p>
}

render(<Stopwatch />)
`

const FIXED_STOPWATCH = `// Fixed: capture the interval id, then RETURN a cleanup function that clears
// it. React runs that cleanup before the next effect and on unmount — so the
// timer is torn down exactly when it should be. One interval, no leak.

function Stopwatch() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id) // ← undo the subscription
  }, [])

  return <p>Elapsed: {seconds}s</p>
}

render(<Stopwatch />)
`

/* ════════════════════════════════════════════════════════════════════════
   PLAYGROUND DEMO — a mock API fetcher with loading / error / data states.

   This is REAL app code (Tailwind works here). A fake fetchUser(id) returns a
   Promise that resolves after ~800ms — or rejects for one specific id so we can
   demo the error path. The effect re-fetches whenever the selected id changes,
   and uses a cleanup-driven "ignore stale responses" guard so a slow earlier
   request can never overwrite a newer one.
   ════════════════════════════════════════════════════════════════════════ */

// A tiny fake user "database".
const FAKE_USERS = {
  1: { id: 1, name: 'Ada Lovelace', title: 'Engineer', emoji: '👩‍💻' },
  2: { id: 2, name: 'Alan Turing', title: 'Architect', emoji: '🧠' },
  3: { id: 3, name: 'Grace Hopper', title: 'Compiler Wizard', emoji: '🛠️' },
  4: { id: 4, name: 'Katherine Johnson', title: 'Orbital Math', emoji: '🚀' },
}

/**
 * Fake network call. Resolves after a delay with the user, OR rejects when
 * `id` is the special "broken" id (5) so we can show the error state. Returns a
 * Promise — exactly like fetch(...).then(r => r.json()) would.
 */
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 5) {
        reject(new Error(`User #${id} not found (simulated 404)`))
        return
      }
      resolve(FAKE_USERS[id])
    }, 800)
  })
}

function ApiFetcherDemo() {
  const [userId, setUserId] = useState(1)
  // Three mutually-exclusive UI states. This trio is the bread and butter of
  // any data-fetching component: loading | error | data.
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'success'
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  // Count how many times the effect has fired, just to make the re-runs visible.
  const [fetchCount, setFetchCount] = useState(0)

  useEffect(() => {
    // `ignore` is the "stale response" guard. If `userId` changes while a fetch
    // is in flight, the cleanup below sets ignore = true for the OLD effect, so
    // when its slow promise finally resolves we throw the result away. Without
    // this, a slow request for user 1 could land AFTER a fast request for user
    // 2 and clobber the screen with the wrong person — the #1 fetch race bug.
    let ignore = false

    setStatus('loading')
    setError(null)
    setFetchCount((n) => n + 1)

    fetchUser(userId)
      .then((data) => {
        if (ignore) return // stale → drop it
        setUser(data)
        setStatus('success')
      })
      .catch((err) => {
        if (ignore) return
        setError(err.message)
        setStatus('error')
      })

    // Cleanup runs before the next effect (when userId changes) and on unmount.
    return () => {
      ignore = true
    }
  }, [userId]) // ← re-fetch ONLY when the selected id changes

  const ids = [1, 2, 3, 4]

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* ---- Controls (these set the userId state) ---- */}
      <div className="min-w-0 space-y-4">
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Selected user id (the effect's only dependency)
          </span>
          <div className="flex flex-wrap gap-2">
            {ids.map((id) => (
              <button
                key={id}
                onClick={() => setUserId(id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 ring-inset transition ${
                  userId === id
                    ? 'bg-cyan-500/20 text-cyan-300 ring-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 ring-slate-800 hover:text-slate-200'
                }`}
              >
                #{id}
              </button>
            ))}
            <button
              onClick={() => setUserId(5)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 ring-inset transition ${
                userId === 5
                  ? 'bg-rose-500/20 text-rose-300 ring-rose-500/40'
                  : 'bg-slate-900 text-rose-400/80 ring-rose-900/40 hover:text-rose-300'
              }`}
            >
              #5 (404)
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 font-mono text-xs text-slate-400">
          <div>
            userId ={' '}
            <span className="text-amber-300">{userId}</span>
          </div>
          <div>
            status ={' '}
            <span
              className={
                status === 'loading'
                  ? 'text-cyan-300'
                  : status === 'error'
                    ? 'text-rose-300'
                    : 'text-emerald-300'
              }
            >
              '{status}'
            </span>
          </div>
          <div>
            effect runs ={' '}
            <span className="text-violet-300">{fetchCount}</span>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-slate-500">
          Click a different id and the effect re-runs because{' '}
          <code className="font-mono text-cyan-300">userId</code> changed. Click{' '}
          <strong className="text-rose-300">#5</strong> to watch the error branch.
          Spam the buttons fast — the stale-response guard makes sure only the{' '}
          <em>last</em> click wins.
        </p>
      </div>

      {/* ---- The live result card: loading | error | data ---- */}
      <div className="min-w-0">
        <div className="flex min-h-[180px] flex-col justify-center rounded-xl border border-slate-800 bg-slate-950/60 p-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
              <p className="text-sm font-medium text-cyan-300">
                Fetching user #{userId}…
              </p>
              <p className="text-xs text-slate-500">
                (simulated 800ms network delay)
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="text-4xl">💥</div>
              <p className="text-sm font-semibold text-rose-300">
                Request failed
              </p>
              <p className="rounded-md bg-rose-500/10 px-3 py-1.5 font-mono text-xs text-rose-200">
                {error}
              </p>
            </div>
          )}

          {status === 'success' && user && (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="text-5xl">{user.emoji}</div>
              <p className="text-lg font-bold text-slate-100">{user.name}</p>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
                {user.title}
              </span>
              <p className="mt-1 font-mono text-[11px] text-slate-500">
                GET /api/users/{user.id} → 200 OK
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   PLAYGROUND DEMO — a dependency-array visualizer.

   Lets the learner FEEL the three flavours of the deps array. We bump two
   independent counters (a and b) plus force unrelated re-renders, and show how
   often an effect would fire under each deps configuration. No real effect is
   run here — we count what WOULD run — so it stays predictable and teachy.
   ════════════════════════════════════════════════════════════════════════ */

function DepsArrayDemo() {
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const [renders, setRenders] = useState(0) // unrelated re-renders (state we don't read in the effect)

  // We model three effects and tally how many times each WOULD have run.
  // (We derive these from the action history rather than running live effects,
  // so the lesson is crisp and deterministic.)
  const [runsNoArray, setRunsNoArray] = useState(1) // runs after EVERY render
  const [runsEmpty] = useState(1) // runs ONCE on mount — never again
  const [runsDepsA, setRunsDepsA] = useState(1) // runs when `a` changes

  // Every "render-causing" action bumps the no-array effect.
  const bumpRender = () => setRunsNoArray((n) => n + 1)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setA((x) => x + 1)
            setRunsDepsA((n) => n + 1)
            bumpRender()
          }}
          className="rounded-lg bg-cyan-500/15 px-3 py-1.5 text-sm font-semibold text-cyan-300 ring-1 ring-inset ring-cyan-500/30 transition hover:bg-cyan-500/25"
        >
          a++ <span className="font-mono text-cyan-200/70">({a})</span>
        </button>
        <button
          onClick={() => {
            setB((x) => x + 1)
            bumpRender()
          }}
          className="rounded-lg bg-violet-500/15 px-3 py-1.5 text-sm font-semibold text-violet-300 ring-1 ring-inset ring-violet-500/30 transition hover:bg-violet-500/25"
        >
          b++ <span className="font-mono text-violet-200/70">({b})</span>
        </button>
        <button
          onClick={() => {
            setRenders((x) => x + 1)
            bumpRender()
          }}
          className="rounded-lg bg-slate-700/40 px-3 py-1.5 text-sm font-semibold text-slate-300 ring-1 ring-inset ring-slate-600/40 transition hover:bg-slate-700/60"
        >
          force re-render{' '}
          <span className="font-mono text-slate-400">({renders})</span>
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {/* No array → after every render */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
          <code className="font-mono text-xs text-rose-300">
            useEffect(fn)
          </code>
          <p className="mt-1 text-[11px] text-slate-400">no array</p>
          <p className="mt-3 text-3xl font-bold text-rose-300">{runsNoArray}</p>
          <p className="text-[11px] text-slate-500">runs · after EVERY render</p>
        </div>

        {/* Empty array → once */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <code className="font-mono text-xs text-emerald-300">
            useEffect(fn, [])
          </code>
          <p className="mt-1 text-[11px] text-slate-400">empty array</p>
          <p className="mt-3 text-3xl font-bold text-emerald-300">
            {runsEmpty}
          </p>
          <p className="text-[11px] text-slate-500">run · once on mount</p>
        </div>

        {/* [a] → when a changes */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
          <code className="font-mono text-xs text-cyan-300">
            useEffect(fn, [a])
          </code>
          <p className="mt-1 text-[11px] text-slate-400">populated array</p>
          <p className="mt-3 text-3xl font-bold text-cyan-300">{runsDepsA}</p>
          <p className="text-[11px] text-slate-500">runs · only when a changes</p>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        Hammer <strong className="text-violet-300">b++</strong> and{' '}
        <strong className="text-slate-300">force re-render</strong>: the
        no-array effect (rose) climbs with every single render, the{' '}
        <code className="font-mono text-cyan-300">[a]</code> effect (cyan) sits
        still, and the <code className="font-mono text-emerald-300">[]</code>{' '}
        effect (emerald) never moves off 1. That gap is the entire deps-array
        lesson in one picture.
      </p>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   CHECKPOINTS — five mistakes a senior catches in review.
   ════════════════════════════════════════════════════════════════════════ */

const CHECKPOINTS = [
  {
    bad: 'Reaching for useEffect with no deps array "just to be safe" — so it runs after every render.',
    good: 'Pick the dependency list on purpose: [] for mount-only, [a, b] to re-run when a or b change. No array is almost never what you want.',
    why: 'No array means "after every render forever." It is the easiest way to fire network calls or timers far more often than intended, and the doorway to infinite loops.',
  },
  {
    bad: 'Starting a setInterval, addEventListener, or subscription in an effect and never cleaning it up.',
    good: 'Return a cleanup function: const id = setInterval(...); return () => clearInterval(id). Same for removeEventListener / unsubscribe.',
    why: 'Without cleanup, every re-run or remount stacks another live timer/listener. They keep firing on unmounted components → leaks, double events, and "setState on an unmounted component" warnings.',
  },
  {
    bad: 'Calling setState unconditionally inside an effect whose deps include the state it sets.',
    good: 'Break the cycle: gate the setState behind a condition, derive the value during render instead, or use an empty/narrower deps array.',
    why: 'set → render → effect re-runs (because its dep changed) → set → render… React bails with "Maximum update depth exceeded." The infinite loop is the dependency feeding itself.',
  },
  {
    bad: 'Using a prop or state value inside the effect but leaving it out of the deps array to "stop it re-running."',
    good: 'List every value the effect reads. If that re-runs too often, fix the cause (memoize, use the functional updater setX(x => ...)), do not hide the dependency.',
    why: 'A missing dependency means the effect closes over a STALE value — it keeps using the version from the render it last ran in. That is the silent, maddening "why is it showing the old data" bug.',
  },
  {
    bad: 'Doing side-effecty work (fetching, subscribing, logging to a server, mutating the DOM) directly in the component body during render.',
    good: 'Move it into useEffect. Rendering must be pure — same props/state → same output, no outside contact.',
    why: 'React may render a component multiple times, bail out, or render it in the background. Side effects in render fire at unpredictable times and counts; effects run after the commit, on a schedule React controls.',
  },
]

/* ════════════════════════════════════════════════════════════════════════
   THE MODULE PAGE
   ════════════════════════════════════════════════════════════════════════ */

export default function Module3() {
  return (
    <article>
      <ModuleHeader
        id={3}
        title="Side Effects & the useEffect Trap"
        blurb="Rendering is supposed to be pure — same state in, same UI out, no contact with the outside world. But real apps must talk to that world: fetch data, start timers, subscribe to things. useEffect is the escape hatch where that happens safely. Misuse it and you get infinite loops, leaked timers, and stale data. Let's learn to wield it with intent."
        tags={['useEffect', 'Dependencies', 'Cleanup', 'Data fetching']}
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
          icon="⚡"
          title="What a side effect is, and when useEffect runs"
        />

        <div className="space-y-5">
          <Callout variant="eli5" title="Hanging pictures after the paint dries">
            <p className="mb-2">
              Think of rendering as <strong>painting a wall</strong>. React wants
              that step to be clean and predictable — given the same colour
              (state), you get the same wall (UI), every time. No surprises.
            </p>
            <p className="mb-2">
              But some jobs can't happen while the paint is wet — like{' '}
              <strong>hanging pictures</strong> (fetching data, starting a clock,
              wiring up a doorbell). Those are <strong>side effects</strong>:
              anything that reaches outside the pure render. <code>useEffect</code>{' '}
              is your note that says <em>"after the paint dries, hang the pictures."</em>
            </p>
            <p>
              The <strong>dependency array</strong> is the sticky note's
              condition: <em>"only redo this when the wall colour changes."</em>{' '}
              And <strong>cleanup</strong> is the rule{' '}
              <em>"take the old pictures down before you hang new ones"</em> — so
              you never end up with a wall full of duplicates.
            </p>
          </Callout>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              A side effect is anything outside pure rendering
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Your component function has one job: take props + state and{' '}
              <em>return</em> a description of the UI. It must be{' '}
              <strong>pure</strong> — no reaching out, no mutating the world. The
              moment you need to touch something <em>outside</em> that pure
              calculation, you have a side effect, and it belongs in an effect —
              not in the render body.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                <Pill tone="rose">Side effects (need useEffect)</Pill>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
                  <li>🌐 Fetching data from an API</li>
                  <li>⏱️ Starting timers / intervals</li>
                  <li>📡 Subscribing to a socket or event</li>
                  <li>🖐️ Manually touching the DOM</li>
                  <li>📝 Logging to an analytics server</li>
                </ul>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <Pill tone="emerald">Pure render (no effect)</Pill>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
                  <li>🧮 Computing values from props/state</li>
                  <li>🔀 Choosing what to render (ternaries)</li>
                  <li>🗺️ Mapping a list to JSX</li>
                  <li>🎨 Returning markup</li>
                  <li>🧷 Formatting a string for display</li>
                </ul>
              </div>
            </div>
            <Callout variant="info" title="The order of events">
              <p>
                On each update React runs your function (render), commits the
                result to the DOM, the browser <strong>paints</strong>, and{' '}
                <em>then</em> your effects fire. Effects always run{' '}
                <strong>after</strong> the screen is up to date — never during
                render. That's why you never see a flicker of the effect's work
                blocking the paint.
              </p>
            </Callout>
          </Panel>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              The dependency array: the most misunderstood part of React
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              The second argument to <code>useEffect</code> controls{' '}
              <em>when</em> it re-runs. There are exactly three shapes, and mixing
              them up is the source of most effect bugs.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="min-w-0">
                <Pill tone="rose">No array</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="every-render.jsx"
                    code={`useEffect(() => {
  // runs after EVERY render
  console.log('again')
})`}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Rarely what you want. A magnet for loops.
                </p>
              </div>
              <div className="min-w-0">
                <Pill tone="emerald">Empty array</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="on-mount.jsx"
                    code={`useEffect(() => {
  // runs ONCE, after mount
  startApp()
}, [])`}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Setup-once: initial fetch, subscribe.
                </p>
              </div>
              <div className="min-w-0">
                <Pill tone="cyan">Populated array</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="on-change.jsx"
                    code={`useEffect(() => {
  // re-runs when id changes
  fetchUser(id)
}, [id])`}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  The workhorse: react to specific values.
                </p>
              </div>
            </div>
            <Callout variant="warn" title="The deps array is not a wishlist">
              <p>
                A common trap: leaving a value out of the array to stop the effect
                re-running. Don't. The array isn't where you choose what you{' '}
                <em>want</em> to depend on — it must list <strong>everything the
                effect reads</strong>. Omit a value and your effect quietly uses a{' '}
                <strong>stale</strong> copy from an old render. If it re-runs too
                often, fix the cause (memoize it, or use the functional updater{' '}
                <code>setX(x =&gt; x + 1)</code> so you don't need <code>x</code> in
                deps).
              </p>
            </Callout>
          </Panel>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              Cleanup: the return function that undoes your effect
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              If your effect <em>sets something up</em> — a timer, a subscription,
              an event listener — it must <em>tear it down</em>. Return a function
              from the effect and React calls it at two moments:{' '}
              <strong>before the next run of this effect</strong> and{' '}
              <strong>when the component unmounts</strong>. That's how you avoid
              stacking duplicates and leaking resources.
            </p>
            <CodeBlock
              filename="cleanup.jsx"
              highlight
              code={`useEffect(() => {
  // 1) SET UP: subscribe / start a timer
  const id = setInterval(() => tick(), 1000)

  // 2) RETURN the undo. React calls it before the next
  //    run and on unmount — so there's only ever ONE timer.
  return () => clearInterval(id)
}, [])`}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Callout variant="tip" title="The mental model">
                Every effect run is paired with a cleanup. React's rhythm is:{' '}
                <em>cleanup the old → run the new</em>. If you set something up but
                never clean it, the old one never dies.
              </Callout>
              <Callout variant="danger" title="The stale-closure leak">
                A timer with no cleanup keeps calling <code>setState</code> on a
                component that may already be gone — leaking memory and firing
                ghost updates. Always return the undo.
              </Callout>
            </div>
            <div className="mt-4">
              <RevealCard buttonText="Why does my effect run TWICE in development?">
                <p className="text-sm leading-relaxed text-slate-300">
                  In React's <strong>Strict Mode</strong> (dev only), React
                  deliberately mounts each component, runs its effects, runs the{' '}
                  <em>cleanups</em>, then runs the effects again. It's a smoke test:
                  if your effect can survive a setup → cleanup → setup cycle
                  without breaking (no doubled timers, no duplicate subscriptions),
                  it's correct. If it can't, your cleanup is missing or wrong. This
                  doesn't happen in production — it's a safety net that surfaces the
                  exact bugs this module is about.
                </p>
              </RevealCard>
            </div>
          </Panel>
        </div>
      </section>

      {/* ────────────────────────── PLAYGROUND ────────────────────────── */}
      <section className="mb-14">
        <SectionHeading
          id="playground"
          kicker="Try it live"
          icon="🎛️"
          title="Fetching data the right way (loading · error · data)"
        />
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-400">
            Data fetching is the most common reason to reach for{' '}
            <code className="font-mono text-cyan-300">useEffect</code>. The pattern
            below is the one you'll write a hundred times: an effect keyed on the{' '}
            <code className="font-mono text-cyan-300">id</code> you're fetching,
            three UI states for <strong>loading</strong>, <strong>error</strong>,
            and <strong>data</strong>, and a cleanup-driven guard so a slow
            response can never overwrite a newer one.
          </p>

          <Playground
            title="Mock API fetcher"
            subtitle="The effect re-runs when the selected id changes. Switch ids fast — the stale-response guard keeps the last click winning."
          >
            <ApiFetcherDemo />
          </Playground>

          <Callout variant="tip" title="The race condition you can't see in a demo (but will hit in production)">
            <p>
              Imagine clicking user #1 (slow, 3s) then immediately user #2 (fast,
              0.2s). Without the <code>ignore</code> guard, #2's data shows, then
              #1's slow response lands and <em>replaces</em> it — you're staring at
              the wrong user with no error. The cleanup function flips{' '}
              <code>ignore = true</code> on the abandoned fetch so its late result
              is discarded. This is the single most important habit in effect-based
              fetching.
            </p>
          </Callout>

          <Playground
            title="Dependency-array visualizer"
            subtitle="Three effects, three deps shapes. Watch how often each WOULD fire as you trigger renders."
          >
            <DepsArrayDemo />
          </Playground>
        </div>
      </section>

      {/* ─────────────────────────── SANDBOX ─────────────────────────── */}
      <section className="mb-14">
        <SectionHeading
          id="sandbox"
          kicker="Your turn"
          icon="🐛"
          title="Fix the bug: the two classic effect traps"
        />

        <Callout variant="info" title="These run right here — no setup">
          <p>
            Both editors below are <strong>live</strong>: edit the broken code and
            it transpiles and re-renders on the right as you type, with React's own
            warnings landing in the <strong>in-app console</strong>. The first bug{' '}
            <em>throws</em> (React gives up); the second <em>leaks</em> (it "works"
            but is wrong). Fix them with the deps array and cleanup you just
            learned.
          </p>
        </Callout>

        <div className="mt-5 space-y-8">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Pill tone="rose">Bug 1</Pill>
              <span className="text-sm font-semibold text-slate-200">
                The infinite render loop
              </span>
            </div>
            <p className="mb-3 text-sm text-slate-400">
              This effect has no deps array, so it runs after every render — and it
              calls <code className="font-mono text-cyan-300">setCount</code> every
              time. set → render → effect → set → render… React throws{' '}
              <code className="font-mono text-rose-300">
                Too many re-renders
              </code>
              . Give the effect the right dependency array so it settles.
            </p>
            <LiveSandbox
              title="Stop the infinite loop"
              filename="Looper.jsx"
              initialCode={BROKEN_LOOPER}
              solutionCode={FIXED_LOOPER}
              hints={[
                'The effect has no second argument, so it runs after EVERY render — and it setStates on every run. What deps array makes it run only once?',
                'Add an empty dependency array: useEffect(() => { ... }, []). Now it runs a single time on mount and the loop is broken.',
              ]}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Pill tone="amber">Bug 2</Pill>
              <span className="text-sm font-semibold text-slate-200">
                The stopwatch that leaks its timer
              </span>
            </div>
            <p className="mb-3 text-sm text-slate-400">
              This stopwatch starts a{' '}
              <code className="font-mono text-cyan-300">setInterval</code> but never
              stops it. The sandbox auto-clears leaked timers on remount so the page
              survives — but the lesson is to <strong>write the cleanup yourself</strong>,
              because in a real app every remount would stack another ticking
              interval. Return the undo.
            </p>
            <LiveSandbox
              title="Plug the timer leak"
              filename="Stopwatch.jsx"
              initialCode={BROKEN_STOPWATCH}
              solutionCode={FIXED_STOPWATCH}
              hints={[
                'setInterval returns an id you can later pass to clearInterval. Right now that id is thrown away.',
                'Capture it — const id = setInterval(...) — then RETURN a cleanup from the effect: return () => clearInterval(id).',
              ]}
            />
          </div>
        </div>

        {/* Bonus static challenge: spot the missing dependency. */}
        <div className="mt-8">
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <h4 className="font-bold text-slate-100">
                Bonus: spot the stale dependency
              </h4>
              <Pill tone="slate">code reading</Pill>
            </div>
            <p className="mb-3 text-sm text-slate-400">
              This effect compiles and runs — but it has a subtle bug. The{' '}
              <code className="font-mono text-cyan-300">query</code> changes as the
              user types, yet the search never updates. Why?
            </p>
            <CodeBlock
              filename="Search.jsx (buggy)"
              code={`function Search({ query }) {
  const [results, setResults] = useState([])

  useEffect(() => {
    // Uses \`query\`… but it's not in the deps array.
    searchApi(query).then(setResults)
  }, []) // ← runs once, with the FIRST query forever

  return <ResultList items={results} />
}`}
            />
            <div className="mt-4">
              <RevealCard buttonText="Reveal the fix">
                <ul className="ml-4 list-disc space-y-1.5 text-sm text-slate-300">
                  <li>
                    The effect reads <code>query</code> but lists{' '}
                    <code>[]</code> as its deps, so it only ever runs with the{' '}
                    <em>first</em> value of <code>query</code> — a stale closure.
                  </li>
                  <li>
                    Put every value the effect reads in the array:{' '}
                    <code>[query]</code>. Now it re-runs each time the query
                    changes.
                  </li>
                </ul>
                <CodeBlock
                  filename="Search.jsx (fixed)"
                  highlight
                  code={`function Search({ query }) {
  const [results, setResults] = useState([])

  useEffect(() => {
    let ignore = false
    searchApi(query).then((r) => {
      if (!ignore) setResults(r)
    })
    return () => { ignore = true } // drop stale responses
  }, [query]) // ← re-run when query changes

  return <ResultList items={results} />
}`}
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
            <Pill tone="cyan">You finished Module 3</Pill>
            <h3 className="text-lg font-bold text-white">
              You can now reach outside the pure render — safely.
            </h3>
            <p className="text-sm text-slate-400">
              You know what a side effect is, exactly when{' '}
              <code className="font-mono text-violet-300">useEffect</code> fires,
              how the three deps-array shapes change its rhythm, and why{' '}
              <strong className="text-slate-200">cleanup</strong> is non-negotiable
              for timers, subscriptions, and races. Next up:{' '}
              <strong className="text-slate-200">
                performance — memoization, useMemo / useCallback, and when re-renders
                actually cost you
              </strong>
              .
            </p>
            <p className="mt-1 text-sm text-slate-500">
              When you're ready, ask: <em>"generate Module 4."</em>
            </p>
          </div>
        </Panel>
      </section>
    </article>
  )
}
