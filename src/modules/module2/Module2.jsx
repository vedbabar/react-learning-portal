import { useState, useRef } from 'react'
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
   SANDBOX SNIPPET SOURCES
   These are JSX *strings*. The <LiveSandbox> transpiles them in the browser
   (Sucrase) and renders them live, so the learner can edit them right on the
   page. Rules for the strings:
     • No import/export — React, useState, useRef, render(), etc. are injected.
     • Plain semantic tags only (button, p, input…) — no Tailwind classes.
     • No backticks or ${...} inside (they'd break THIS outer template literal).
     • Each snippet ends by calling render(<Component />).
   ════════════════════════════════════════════════════════════════════════ */

// ── Sandbox 1: the classic "+2 only adds 1" stale-snapshot bug ──────────────
const BROKEN_DOUBLE = `// Goal: the "+2" button should add 2 each click.
// Bug: it only adds 1. Why? Both setCount calls read the SAME frozen 'count'
// from this render's snapshot, so they both compute the same number.

function DoubleCounter() {
  const [count, setCount] = useState(0)

  function addTwo() {
    setCount(count + 1) // count is, say, 0 here -> schedules 1
    setCount(count + 1) // count is STILL 0 here -> schedules 1 again
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={addTwo}>+2</button>
    </div>
  )
}

render(<DoubleCounter />)
`

const FIXED_DOUBLE = `// Fix: use the FUNCTIONAL updater. React passes each call the latest
// pending value, so the second +1 sees the first one's result.

function DoubleCounter() {
  const [count, setCount] = useState(0)

  function addTwo() {
    setCount((c) => c + 1) // c = 0 -> 1
    setCount((c) => c + 1) // c = 1 -> 2  (sees the queued update!)
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={addTwo}>+2</button>
    </div>
  )
}

render(<DoubleCounter />)
`

// ── Sandbox 2: a controlled input with no onChange (you can't type) ─────────
const BROKEN_FORM = `// Goal: type your name and see it echoed below.
// Bug: the input is "controlled" (value={text}) but nothing ever updates
// 'text'. React keeps forcing the box back to the empty state on every
// keystroke, so it looks frozen — you literally cannot type.

function NameForm() {
  const [text, setText] = useState('')

  return (
    <div>
      <label>Your name</label>
      <input value={text} placeholder="Try typing here..." />
      <p>Hello, {text || '...'}!</p>
    </div>
  )
}

render(<NameForm />)
`

const FIXED_FORM = `// Fix: give the input an onChange that writes every keystroke back into
// state. Now state is the single source of truth AND it actually changes.

function NameForm() {
  const [text, setText] = useState('')

  return (
    <div>
      <label>Your name</label>
      <input
        value={text}
        placeholder="Try typing here..."
        onChange={(e) => setText(e.target.value)}
      />
      <p>Hello, {text || '...'}!</p>
    </div>
  )
}

render(<NameForm />)
`

/* ════════════════════════════════════════════════════════════════════════
   DEMO COMPONENTS
   Real, interactive React using normal Tailwind classes (this is app code, so
   Tailwind works here — unlike the sandbox snippets above). They live in this
   file so the chapter reads top-to-bottom.
   ════════════════════════════════════════════════════════════════════════ */

/**
 * THEORY DEMO — "each render is a Polaroid".
 * One button. We capture the value of `count` AT THE MOMENT you clicked into
 * `snapshot`, then 1 second later we show it again. It's still the old number,
 * proving the click handler closed over a *frozen* snapshot of `count`.
 */
function SnapshotDemo() {
  const [count, setCount] = useState(0)
  const [log, setLog] = useState([])

  function handleClick() {
    // `count` here is whatever it was when THIS render's function ran.
    // setCount schedules a NEW render with count+1 — but it does NOT change
    // the `count` variable we're holding right now.
    setCount(count + 1)

    const frozen = count // capture the snapshot value
    setLog((l) => [
      {
        id: Date.now(),
        // What we read immediately after setState: still the OLD value.
        nowValue: frozen,
      },
      ...l.slice(0, 3),
    ])
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">Live state</div>
          <div className="font-mono text-3xl font-bold text-cyan-300">
            count = {count}
          </div>
        </div>
        <button
          onClick={handleClick}
          className="rounded-lg bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-300 ring-1 ring-inset ring-cyan-500/30 transition hover:bg-cyan-500/25"
        >
          Click me (setCount + read count)
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          What <code className="font-mono text-amber-300">count</code> was when
          you read it (right after setState)
        </div>
        {log.length === 0 ? (
          <p className="text-xs text-slate-600">
            Click the button — you'll see the value you read is always{' '}
            <em>one behind</em> the live state above.
          </p>
        ) : (
          <ul className="space-y-1 font-mono text-sm">
            {log.map((entry) => (
              <li key={entry.id} className="text-slate-300">
                <span className="text-slate-500">read just now →</span>{' '}
                <span className="text-amber-300">count was {entry.nowValue}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-slate-500">
        The handler ran inside an old Polaroid. It saw the{' '}
        <span className="text-amber-300">frozen</span> value, not the live one —
        the live one only exists in the <span className="text-cyan-300">next</span>{' '}
        render.
      </p>
    </div>
  )
}

/**
 * PLAYGROUND DEMO (a) — Controlled vs Uncontrolled inputs.
 * Left: a controlled input — React owns the value via state, mirrored live.
 * Right: an uncontrolled input — the DOM owns the value; we only peek at it
 * (via a ref) when you click "Read".
 */
function ControlledVsUncontrolled() {
  // CONTROLLED: state is the single source of truth.
  const [controlled, setControlled] = useState('')

  // UNCONTROLLED: the DOM node keeps the value; we grab it on demand.
  const uncontrolledRef = useRef(null)
  const [snapshot, setSnapshot] = useState('(nothing read yet)')

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* ---- Controlled ---- */}
      <div className="min-w-0 space-y-3 rounded-xl border border-cyan-500/20 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2">
          <Pill tone="cyan">Controlled</Pill>
          <span className="text-xs text-slate-400">React owns the value</span>
        </div>
        <input
          value={controlled}
          onChange={(e) => setControlled(e.target.value)}
          placeholder="Type — state mirrors it live"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
        />
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 font-mono text-xs">
          <span className="text-slate-500">state value →</span>{' '}
          <span className="text-cyan-300">"{controlled}"</span>
        </div>
        <p className="text-xs text-slate-500">
          Every keystroke flows through{' '}
          <code className="font-mono text-cyan-300">onChange</code> into state,
          then state flows back into the box. The value is always in sync — you
          can validate, transform, or disable as the user types.
        </p>
      </div>

      {/* ---- Uncontrolled ---- */}
      <div className="min-w-0 space-y-3 rounded-xl border border-violet-500/20 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2">
          <Pill tone="violet">Uncontrolled</Pill>
          <span className="text-xs text-slate-400">the DOM owns the value</span>
        </div>
        <input
          ref={uncontrolledRef}
          defaultValue=""
          placeholder="Type — React isn't watching"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-violet-500"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setSnapshot(uncontrolledRef.current?.value || '(empty)')
            }
            className="rounded-lg bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-300 ring-1 ring-inset ring-violet-500/30 transition hover:bg-violet-500/25"
          >
            Read value from the DOM
          </button>
          <div className="font-mono text-xs">
            <span className="text-slate-500">last read →</span>{' '}
            <span className="text-violet-300">"{snapshot}"</span>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          No state, no re-render per keystroke. We reach in with a{' '}
          <code className="font-mono text-violet-300">ref</code> only when we
          ask. Simpler, but React doesn't know the value until you read it.
        </p>
      </div>
    </div>
  )
}

/**
 * PLAYGROUND DEMO (b) — Batching visualizer.
 * "+3 the buggy way" calls setCount(count + 1) three times (all read the same
 * frozen snapshot → +1). "+3 the right way" uses the functional updater three
 * times (each reads the latest queued value → +3). We track click history so
 * the difference is impossible to miss.
 */
function BatchingVisualizer() {
  const [buggy, setBuggy] = useState(0)
  const [right, setRight] = useState(0)
  const [lastBuggyDelta, setLastBuggyDelta] = useState(null)
  const [lastRightDelta, setLastRightDelta] = useState(null)

  function addThreeBuggy() {
    const before = buggy
    // All three see the SAME `buggy` from this render's snapshot. React batches
    // them and the last one wins → net effect is +1, not +3.
    setBuggy(buggy + 1)
    setBuggy(buggy + 1)
    setBuggy(buggy + 1)
    // (before + 1) is what actually lands — we record the delta after commit
    // by comparing on the next click; here we just predict it for the label.
    setLastBuggyDelta(before + 1 - before) // = 1
  }

  function addThreeRight() {
    const before = right
    // Each updater receives the latest pending value, so they chain: +1 +1 +1.
    setRight((c) => c + 1)
    setRight((c) => c + 1)
    setRight((c) => c + 1)
    setLastRightDelta(before + 3 - before) // = 3
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* ---- The buggy way ---- */}
      <div className="min-w-0 space-y-3 rounded-xl border border-rose-500/20 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2">
          <Pill tone="rose">The buggy way</Pill>
          <span className="text-xs text-slate-400">3× setCount(count + 1)</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-mono text-4xl font-bold text-rose-300">
            {buggy}
          </div>
          <button
            onClick={addThreeBuggy}
            className="rounded-lg bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-300 ring-1 ring-inset ring-rose-500/30 transition hover:bg-rose-500/25"
          >
            +3 (the buggy way)
          </button>
        </div>
        {lastBuggyDelta != null && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-200">
            You pressed “+3” but it only moved by{' '}
            <strong>+{lastBuggyDelta}</strong>. All three calls read the same
            frozen <code className="font-mono">count</code>.
          </div>
        )}
        <CodeBlock
          filename="buggy.jsx"
          code={`setCount(count + 1) // count = 5 → 6
setCount(count + 1) // count = 5 → 6
setCount(count + 1) // count = 5 → 6
// net: +1`}
        />
      </div>

      {/* ---- The right way ---- */}
      <div className="min-w-0 space-y-3 rounded-xl border border-emerald-500/20 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2">
          <Pill tone="emerald">The right way</Pill>
          <span className="text-xs text-slate-400">3× setCount(c =&gt; c + 1)</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-mono text-4xl font-bold text-emerald-300">
            {right}
          </div>
          <button
            onClick={addThreeRight}
            className="rounded-lg bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/30 transition hover:bg-emerald-500/25"
          >
            +3 (the right way)
          </button>
        </div>
        {lastRightDelta != null && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-200">
            Pressed “+3”, moved by <strong>+{lastRightDelta}</strong>. Each
            updater saw the previous one's result.
          </div>
        )}
        <CodeBlock
          filename="correct.jsx"
          code={`setCount((c) => c + 1) // 5 → 6
setCount((c) => c + 1) // 6 → 7
setCount((c) => c + 1) // 7 → 8
// net: +3`}
        />
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   CHECKPOINT DATA — junior mistake / senior fix / why
   ════════════════════════════════════════════════════════════════════════ */

const CHECKPOINTS = [
  {
    bad: 'Reading state right after calling setState: setCount(count + 1); console.log(count) // expecting the new value.',
    good: 'Remember the new value is for the NEXT render. If you need it now, compute it into a local const: const next = count + 1; setCount(next); use next.',
    why: 'setState does not mutate the current `count` — it schedules a re-render. During this render, `count` is a frozen snapshot. The updated value only exists when the component runs again.',
  },
  {
    bad: 'Chaining updates with the snapshot: setCount(count + 1); setCount(count + 1) and expecting +2.',
    good: 'Use the functional updater when the next state depends on the previous: setCount((c) => c + 1) twice.',
    why: 'Both `count + 1` calls read the same frozen value, so the second overwrites the first. The updater form receives the latest queued value, so updates compose correctly.',
  },
  {
    bad: 'A controlled input with value={text} but no onChange — typing does nothing and React warns about a read-only field.',
    good: 'Add onChange={(e) => setText(e.target.value)} so every keystroke flows back into state.',
    why: 'A controlled input renders state. With no way to update that state, React keeps resetting the box to the old value on every keystroke — it looks frozen.',
  },
  {
    bad: 'Mutating state directly: todos.push(newTodo); setTodos(todos) — or items[0].done = true.',
    good: 'Create a new value: setTodos([...todos, newTodo]); for edits, map to a fresh array/object copy.',
    why: 'React decides whether to re-render by comparing the OLD reference to the NEW one. Mutating in place keeps the same reference, so React may skip the update — and you get stale UI.',
  },
  {
    bad: 'Cramming unrelated values into one object: useState({ name, email, isModalOpen, theme }).',
    good: 'Split unrelated concerns into separate useState calls; group only values that genuinely change together.',
    why: 'One blob means every update must spread the whole object (easy to drop a field), unrelated changes re-render together, and the data model gets muddy. Independent state stays independent.',
  },
]

/* ════════════════════════════════════════════════════════════════════════
   THE MODULE PAGE
   ════════════════════════════════════════════════════════════════════════ */

export default function Module2() {
  return (
    <article>
      <ModuleHeader
        id={2}
        title="State, Events & the Core of React"
        blurb="In Module 1 the UI was a function of state — but state never changed. Now we make it move. You'll learn how useState gives a component memory, how events trigger updates, and the single most misunderstood thing in React: why setState doesn't change your variable on the spot."
        tags={['useState', 'Events', 'Snapshots', 'Batching', 'Functional updates']}
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
          icon="🧠"
          title="useState, events & the frozen-snapshot rule"
        />

        <div className="space-y-5">
          <Callout variant="eli5" title="Every render is a Polaroid photo">
            <p className="mb-2">
              Think of each render as snapping a <strong>Polaroid</strong> of your
              component. The <code>count</code> variable is a number{' '}
              <em>printed on that photo</em> — frozen. You can't smudge the photo
              to change the number.
            </p>
            <p>
              Calling <code>setCount(...)</code> doesn't edit the current photo. It
              asks React to <strong>take a brand-new Polaroid</strong> with the new
              number on it. Until that new photo develops (the next render), every
              line of code still reads the <em>old</em> printed value. That one idea
              explains 90% of “why didn't my state update?!” bugs.
            </p>
          </Callout>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              State = memory that survives re-renders
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              A plain variable inside a component is reborn every render — it can't
              remember anything. <code>useState</code> hands you a value that{' '}
              <strong>persists across renders</strong> and, crucially, a setter that{' '}
              <strong>triggers a re-render</strong> when you call it. That's the
              whole job: remember a value, and re-run the component when it changes.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <Pill tone="rose">A plain variable forgets</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="forgets.jsx"
                    code={`function Counter() {
  // Re-created as 0 on EVERY render. Clicking
  // mutates it, but React never re-renders, and
  // the next render resets it back to 0.
  let count = 0

  return (
    <button onClick={() => { count++ }}>
      {count}
    </button>
  )
}`}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <Pill tone="emerald">useState remembers</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="remembers.jsx"
                    highlight
                    code={`function Counter() {
  // Survives re-renders. setCount tells React
  // "remember this AND re-render me."
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  )
}`}
                  />
                </div>
              </div>
            </div>
            <Callout variant="info" title="Reading the useState line">
              <p>
                <code className="!text-violet-300">
                  const [count, setCount] = useState(0)
                </code>{' '}
                is array destructuring. <code>useState(0)</code> returns a pair:{' '}
                <strong>[currentValue, setterFunction]</strong>. The{' '}
                <code>0</code> is the initial value, used <em>only</em> on the first
                render. The names are yours — <code>count</code>/<code>setCount</code>{' '}
                is just a convention.
              </p>
            </Callout>
          </Panel>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              Events: how the user talks to your component
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              You wire behavior to user actions with event props like{' '}
              <code className="font-mono text-cyan-300">onClick</code>,{' '}
              <code className="font-mono text-cyan-300">onChange</code>, and{' '}
              <code className="font-mono text-cyan-300">onSubmit</code>. The value
              you pass is a <strong>function React calls for you</strong> when the
              event fires — you pass the function, you don't call it.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <Pill tone="rose">Calls it immediately (wrong)</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="oops.jsx"
                    code={`// handleClick() RUNS during render and passes
// its return value (undefined) to onClick.
<button onClick={handleClick()}>
  Click
</button>`}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <Pill tone="emerald">Passes the function (right)</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="good.jsx"
                    highlight
                    code={`// Pass the function itself; React calls it later.
<button onClick={handleClick}>Click</button>

// Need to pass args? Wrap in an arrow:
<button onClick={() => handleClick(id)}>
  Click
</button>`}
                  />
                </div>
              </div>
            </div>
            <Callout variant="tip" title="onClick={fn} vs onClick={() => fn()}">
              <p>
                Use <code>onClick={'{handleClick}'}</code> when you just want to run
                the function. Use the arrow wrapper{' '}
                <code>onClick={'{() => handleClick(id)}'}</code> when you need to
                pass arguments — otherwise it would fire during render.
              </p>
            </Callout>
          </Panel>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              The trap: state updates are asynchronous &amp; batched
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              This is the part every junior gets bitten by. Calling{' '}
              <code className="font-mono text-amber-300">setCount(count + 1)</code>{' '}
              does <strong>not</strong> change the <code>count</code> variable on the
              next line. React <em>schedules</em> a re-render. Within the current
              render, <code>count</code> is a frozen snapshot. And if you call the
              setter several times in one handler, React <strong>batches</strong>{' '}
              them into a single re-render.
            </p>
            <CodeBlock
              filename="the-trap.jsx"
              code={`function handleClick() {
  // Pretend count is 0 right now.
  setCount(count + 1)
  console.log(count) // 0  — NOT 1. Still the snapshot.
  setCount(count + 1) // 0 + 1 again → also schedules 1
  // After this handler, React re-renders ONCE with count = 1, not 2.
}`}
            />
            <p className="mt-4 mb-1 text-sm font-semibold text-slate-200">
              The fix when the next value depends on the previous one:
            </p>
            <CodeBlock
              filename="functional-update.jsx"
              highlight
              code={`function handleClick() {
  // The functional updater gets the LATEST queued value.
  setCount((c) => c + 1) // 0 → 1
  setCount((c) => c + 1) // 1 → 2  ✅
  // React re-renders once with count = 2.
}`}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Callout variant="warn" title="It's a snapshot">
                Inside one render, <code>count</code> never changes — not even after{' '}
                <code>setCount</code>. The new value lives in the next render.
              </Callout>
              <Callout variant="info" title="Batching is good">
                Multiple setters in one event = one re-render. Faster, fewer flickers
                — but you must use updaters to chain.
              </Callout>
              <Callout variant="danger" title="When you MUST use c => c + 1">
                Any time the next state is computed from the previous state. Toggles,
                counters, appending to a list, anything cumulative.
              </Callout>
            </div>
          </Panel>

          <RevealCard buttonText="Wait — why does React even do this?">
            <div className="space-y-2 text-sm leading-relaxed text-slate-300">
              <p>
                If <code>setCount</code> updated <code>count</code> instantly and
                re-rendered immediately, a handler that touches state five times
                would trigger five renders, each showing a half-finished UI. By
                deferring and <strong>batching</strong>, React applies all the
                updates and renders <em>once</em> with a consistent result.
              </p>
              <p>
                The price you pay: the <code>count</code> in your handler is a value
                from the past — a snapshot. Make peace with that and the snapshot
                model becomes a feature, not a bug. (React 18+ even batches across
                promises and timeouts, not just events.)
              </p>
            </div>
          </RevealCard>
        </div>
      </section>

      {/* ────────────────────────── PLAYGROUND ────────────────────────── */}
      <section className="mb-14">
        <SectionHeading
          id="playground"
          kicker="Try it live"
          icon="🎛️"
          title="Controlled inputs & the batching trap, live"
        />
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-400">
            Two demos. First, the two ways an input can hold a value —{' '}
            <strong>controlled</strong> (React owns it via state) vs{' '}
            <strong>uncontrolled</strong> (the DOM owns it; you read it with a ref).
            Then the batching trap from the theory section, where you can press the
            buttons and watch the counters disagree.
          </p>

          <Playground
            title="Controlled vs uncontrolled inputs"
            subtitle="Left: state mirrors every keystroke. Right: the DOM holds the value; you peek with a ref only when you click Read."
          >
            <ControlledVsUncontrolled />
          </Playground>

          <Playground
            title="Batching visualizer: +3 done two ways"
            subtitle="Same intent, different mechanics. The snapshot version stalls at +1; the functional updater chains to +3."
          >
            <BatchingVisualizer />
          </Playground>

          <Callout variant="tip" title="Rule of thumb">
            <p>
              Reach for a <strong>controlled</strong> input when you need the value
              as the user types (validation, live preview, enabling a button).
              Reach for <strong>uncontrolled</strong> for simple, fire-and-forget
              forms where you only need the value on submit — less code, fewer
              re-renders.
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
          title="Fix the bug: two classic state mistakes"
        />

        <Callout variant="info" title="These run right here — no setup">
          <p>
            Both editors below are <strong>live</strong>. Edit the broken code and
            it transpiles and re-renders on the right as you type. The first bug is{' '}
            <em>behavioral</em> (the math is wrong); the second makes the input feel{' '}
            <em>frozen</em>. Use the hints if you get stuck, then reveal the answer.
          </p>
        </Callout>

        <div className="mt-5 space-y-8">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Pill tone="amber">Bug 1</Pill>
              <span className="text-sm font-semibold text-slate-200">
                The “+2” button only adds 1
              </span>
            </div>
            <LiveSandbox
              title="Fix the bug: the double counter"
              filename="DoubleCounter.jsx"
              initialCode={BROKEN_DOUBLE}
              solutionCode={FIXED_DOUBLE}
              hints={[
                'Both setCount calls read the same `count` from this render — a frozen snapshot. Adding 1 to the same number twice still lands on the same number.',
                'Switch to the functional updater so each call sees the latest queued value: setCount((c) => c + 1).',
              ]}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Pill tone="amber">Bug 2</Pill>
              <span className="text-sm font-semibold text-slate-200">
                The form won't let you type
              </span>
            </div>
            <LiveSandbox
              title="Fix the bug: a frozen input"
              filename="NameForm.jsx"
              initialCode={BROKEN_FORM}
              solutionCode={FIXED_FORM}
              hints={[
                'The input is controlled (value={text}) but nothing ever updates `text`, so React snaps it back to empty on every keystroke.',
                'Add onChange={(e) => setText(e.target.value)} so each keystroke writes back into state.',
              ]}
            />
          </div>
        </div>

        <Callout variant="info" title="Why both bugs share one root cause">
          <p>
            They're the same lesson from two angles. Bug 1: you read a{' '}
            <strong>frozen snapshot</strong> of state and chained off it. Bug 2: you{' '}
            <em>rendered</em> state but never gave it a way to <strong>change</strong>
            . State is a one-way street — render it out, and feed updates back in
            through events. Break either half and the UI goes wrong.
          </p>
        </Callout>

        {/* Bonus static challenge: spot the mutation bug (read-only). */}
        <div className="mt-6">
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <h4 className="font-bold text-slate-100">
                Bonus: spot the state-mutation bug
              </h4>
              <Pill tone="slate">code reading</Pill>
            </div>
            <p className="mb-3 text-sm text-slate-400">
              This “add todo” handler looks reasonable but the list often won't
              update on screen. What's wrong?
            </p>
            <CodeBlock
              filename="TodoList.jsx (buggy)"
              code={`function addTodo(text) {
  // Mutates the SAME array, then sets the same reference.
  todos.push({ id: Date.now(), text })
  setTodos(todos)
}`}
            />
            <div className="mt-4">
              <RevealCard buttonText="Reveal the fix">
                <ul className="ml-4 list-disc space-y-1.5 text-sm text-slate-300">
                  <li>
                    <code>push</code> mutates the existing array, so{' '}
                    <code>todos</code> is still the <em>same reference</em>. React
                    compares old vs new by reference and may skip the re-render.
                  </li>
                  <li>
                    Build a <strong>new</strong> array instead — and use the
                    functional updater so you're appending to the latest value.
                  </li>
                </ul>
                <CodeBlock
                  filename="TodoList.jsx (fixed)"
                  highlight
                  code={`function addTodo(text) {
  // New array → new reference → React re-renders.
  setTodos((prev) => [...prev, { id: Date.now(), text }])
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
            <Pill tone="cyan">You finished Module 2</Pill>
            <h3 className="text-lg font-bold text-white">
              State now moves — and you know why it lags.
            </h3>
            <p className="text-sm text-slate-400">
              You can give a component memory with{' '}
              <code className="font-mono text-violet-300">useState</code>, wire up
              events, and you understand the snapshot/batching model that trips up
              everyone — plus the{' '}
              <code className="font-mono text-emerald-300">setCount((c) =&gt; c + 1)</code>{' '}
              fix and why you never mutate state in place. Next up:{' '}
              <strong className="text-slate-200">
                side effects and the outside world
              </strong>{' '}
              — <code>useEffect</code>, data fetching, and cleanup.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              When you're ready, ask: <em>“generate Module 3.”</em>
            </p>
          </div>
        </Panel>
      </section>
    </article>
  )
}
