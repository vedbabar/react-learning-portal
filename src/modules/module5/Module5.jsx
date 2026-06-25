import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
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
   SANDBOX SNIPPETS (module-scope STRINGS)
   These are JSX *source strings* the <LiveSandbox> transpiles in the browser.
   Rules that bit me until I internalized them:
     • No import/export. React + hooks + timers are injected.
     • Plain semantic tags only — NO Tailwind classes (they don't exist at
       runtime). The preview auto-styles bare tags.
     • Inside these template literals you may NOT use backticks or ${...}.
     • setInterval/clearInterval are injected and auto-cleaned on remount.
   ════════════════════════════════════════════════════════════════════════ */

const BROKEN_STOPWATCH = `// Goal: a stopwatch. Start, Stop, Reset.
// THE BUG: the interval id lives in a plain local variable (timerId).
// Every time this component re-renders (and setTime triggers a render
// 10x a second!) the function runs top-to-bottom again and timerId is
// reset to undefined. So:
//   • clearInterval(undefined) does nothing -> Stop can't stop it
//   • click Start twice and you STACK intervals -> time races ahead
//
// Click Start, then click Start again. Watch it speed up. Now try Stop.

function Stopwatch() {
  const [time, setTime] = useState(0)
  let timerId  // <-- reborn as undefined on EVERY render

  function start() {
    // each call makes a NEW interval, but timerId only remembers the last one
    timerId = setInterval(function () {
      setTime(function (t) { return t + 1 })
    }, 100)
  }

  function stop() {
    clearInterval(timerId)  // timerId is undefined right now -> no-op
  }

  function reset() {
    clearInterval(timerId)
    setTime(0)
  }

  return (
    <div>
      <h1>{(time / 10).toFixed(1)}s</h1>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}

render(<Stopwatch />)
`

const FIXED_STOPWATCH = `// Fixed: the interval id lives in a useRef "box".
// ref.current PERSISTS across renders and changing it does NOT trigger
// a render. That's exactly what a timer id needs: a stable hiding spot
// that survives the 10-renders-a-second the stopwatch causes.
//
//   • start() refuses to launch a second interval if one is running
//   • stop() reads the SAME id start() stored, so clearInterval works
//   • we null the ref after clearing so start() can run again later

function Stopwatch() {
  const [time, setTime] = useState(0)
  const timerRef = useRef(null)  // <-- survives every render

  function start() {
    if (timerRef.current !== null) return  // already running, ignore
    timerRef.current = setInterval(function () {
      setTime(function (t) { return t + 1 })
    }, 100)
  }

  function stop() {
    clearInterval(timerRef.current)
    timerRef.current = null
  }

  function reset() {
    stop()
    setTime(0)
  }

  return (
    <div>
      <h1>{(time / 10).toFixed(1)}s</h1>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}

render(<Stopwatch />)
`

/* ════════════════════════════════════════════════════════════════════════
   PLAYGROUND DEMO COMPONENTS
   Real React + Tailwind (this is app code — classes WORK here).
   ════════════════════════════════════════════════════════════════════════ */

/**
 * PLAYGROUND (a) — Ref vs State, side by side.
 *
 * The whole lesson in one widget: bumping a useState value re-renders (the
 * number on screen climbs AND the render counter ticks). Bumping a useRef value
 * is SILENT — ref.current really did change, but nothing repaints, so the screen
 * lies until something else forces a render. The "Force re-render" button reveals
 * the ref's true, hidden value.
 */
function RefVsStateDemo() {
  const [stateCount, setStateCount] = useState(0)
  const refCount = useRef(0)
  const [, forceRender] = useState(0)

  // A render counter. We mutate a ref during render to count renders WITHOUT
  // causing another render (using state here would loop forever).
  const renders = useRef(0)
  renders.current += 1

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* ---- useState column ---- */}
      <div className="rounded-xl border border-emerald-500/25 bg-slate-900/50 p-5">
        <div className="mb-3 flex items-center justify-between">
          <Pill tone="emerald">useState</Pill>
          <span className="text-xs text-slate-500">repaints the room</span>
        </div>
        <div className="mb-1 text-center font-mono text-5xl font-bold text-emerald-300">
          {stateCount}
        </div>
        <p className="mb-4 text-center text-xs text-slate-500">
          what the screen shows
        </p>
        <button
          onClick={() => setStateCount((c) => c + 1)}
          className="w-full rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/40 transition hover:bg-emerald-500/25"
        >
          setStateCount(c =&gt; c + 1)
        </button>
        <p className="mt-3 text-center text-xs text-emerald-300/80">
          UI updates immediately ✓
        </p>
      </div>

      {/* ---- useRef column ---- */}
      <div className="rounded-xl border border-amber-500/25 bg-slate-900/50 p-5">
        <div className="mb-3 flex items-center justify-between">
          <Pill tone="amber">useRef</Pill>
          <span className="text-xs text-slate-500">sticky note in pocket</span>
        </div>
        <div className="mb-1 text-center font-mono text-5xl font-bold text-amber-300">
          {refCount.current}
        </div>
        <p className="mb-4 text-center text-xs text-slate-500">
          what the screen shows (stale!)
        </p>
        <button
          onClick={() => {
            // Mutating ref.current does NOT schedule a render — the number
            // above is now a LIE until React re-renders for some other reason.
            refCount.current += 1
          }}
          className="w-full rounded-lg bg-amber-500/15 px-3 py-2 text-sm font-semibold text-amber-300 ring-1 ring-inset ring-amber-500/40 transition hover:bg-amber-500/25"
        >
          refCount.current += 1
        </button>
        <p className="mt-3 text-center text-xs text-amber-300/80">
          ref changed silently — screen unchanged
        </p>
      </div>

      {/* ---- The reveal row ---- */}
      <div className="md:col-span-2">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5 sm:flex-row sm:justify-between">
          <div className="text-sm text-slate-300">
            <span className="font-mono text-violet-300">renders.current</span> ={' '}
            <span className="font-mono font-bold text-violet-300">
              {renders.current}
            </span>{' '}
            <span className="text-slate-500">
              — this component has rendered that many times
            </span>
          </div>
          <button
            onClick={() => forceRender((n) => n + 1)}
            className="rounded-lg bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-300 ring-1 ring-inset ring-violet-500/40 transition hover:bg-violet-500/25"
          >
            Force a re-render →
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          Click the amber button a few times (screen stays{' '}
          <span className="text-amber-300">0</span>), then hit{' '}
          <span className="text-violet-300">Force a re-render</span>. The ref's
          real value snaps into view — proof it was changing all along, just
          invisibly.
        </p>
      </div>
    </div>
  )
}

/**
 * PLAYGROUND (b) — a real, correct Stopwatch.
 *
 * This is the canonical pattern: the interval id is stored in a ref so it
 * survives the constant re-renders that `setElapsed` causes, and a cleanup
 * effect guarantees we never leak the interval when the component unmounts.
 */
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0) // hundredths of a second
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null) // the timer id lives here, across renders

  function start() {
    if (intervalRef.current !== null) return // guard against double-start
    setRunning(true)
    intervalRef.current = setInterval(() => {
      // functional update: we don't close over a stale `elapsed`
      setElapsed((e) => e + 1)
    }, 10)
  }

  function stop() {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
  }

  function reset() {
    stop()
    setElapsed(0)
  }

  // Safety net: if this component unmounts while running, clear the interval
  // so it doesn't keep firing into a dead component. ref read in cleanup is
  // exactly what refs are for — a value that outlives any single render.
  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const seconds = Math.floor(elapsed / 100)
  const hundredths = elapsed % 100

  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="font-mono text-6xl font-bold tabular-nums text-cyan-300">
        {seconds}
        <span className="text-slate-600">.</span>
        <span className="text-3xl text-cyan-400/70">
          {String(hundredths).padStart(2, '0')}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            running ? 'animate-pulse bg-emerald-400' : 'bg-slate-600'
          }`}
        />
        <span className="text-xs uppercase tracking-wide text-slate-500">
          {running ? 'running' : 'stopped'}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={start}
          disabled={running}
          className="rounded-lg bg-emerald-500/15 px-5 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/40 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start
        </button>
        <button
          onClick={stop}
          disabled={!running}
          className="rounded-lg bg-rose-500/15 px-5 py-2 text-sm font-semibold text-rose-300 ring-1 ring-inset ring-rose-500/40 transition hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Stop
        </button>
        <button
          onClick={reset}
          className="rounded-lg bg-slate-700/40 px-5 py-2 text-sm font-semibold text-slate-300 ring-1 ring-inset ring-slate-600 transition hover:bg-slate-700/60"
        >
          Reset
        </button>
      </div>

      <p className="text-center text-xs text-slate-500">
        The interval id lives in{' '}
        <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-cyan-300">
          intervalRef.current
        </code>
        . It survives the ~100 renders per second that{' '}
        <code className="font-mono text-cyan-300">setElapsed</code> causes — a
        plain variable would be wiped on every one of them.
      </p>
    </div>
  )
}

/**
 * PLAYGROUND (c) — useMemo on a deliberately slow calculation.
 *
 * `slowFactorize` is artificially heavy. WITHOUT memoization it would re-run on
 * every keystroke in the unrelated text box. WITH useMemo it only recomputes
 * when `target` changes — typing in the box is buttery because the cached value
 * is reused. We measure and show the compute time so the win is visible.
 */
function slowFactorize(n) {
  // Intentionally O(n) with a busy inner loop so it's measurably slow.
  const factors = []
  for (let i = 1; i <= n; i++) {
    // burn a little time so the difference is felt, not just theoretical
    for (let j = 0; j < 600; j++) {
      // eslint-disable-next-line no-unused-expressions
      Math.sqrt(j * i)
    }
    if (n % i === 0) factors.push(i)
  }
  return factors
}

function MemoDemo() {
  const [target, setTarget] = useState(84)
  const [note, setNote] = useState('')
  const [useMemoOn, setUseMemoOn] = useState(true)

  // We time the calc and stash the duration in a ref. Writing a ref during
  // render is fine — it doesn't schedule a render — and we just read it back
  // into the JSX below. Calling setState here instead would risk an extra
  // render or a loop, exactly the trap this module warns about.
  const lastMsRef = useRef(0)

  // Memoized path: the body only runs when `target` changes. On a render where
  // useMemo returns the cache (e.g. you typed in the note box), this function
  // does NOT execute at all — that's the saved work.
  const memoFactors = useMemo(() => {
    const t0 = performance.now()
    const result = slowFactorize(target)
    lastMsRef.current = performance.now() - t0
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  // Unmemoized path: this runs on EVERY render — including typing in `note`,
  // which has nothing to do with the factors. That's the cost useMemo avoids.
  let liveFactors = memoFactors
  if (!useMemoOn) {
    const t0 = performance.now()
    liveFactors = slowFactorize(target)
    lastMsRef.current = performance.now() - t0
  }

  const lastMs = lastMsRef.current

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={useMemoOn}
            onChange={(e) => setUseMemoOn(e.target.checked)}
            className="h-4 w-4 accent-cyan-400"
          />
          <code className="font-mono text-cyan-300">useMemo</code> the expensive
          calc
        </label>
        <Pill tone={useMemoOn ? 'emerald' : 'rose'}>
          {useMemoOn ? 'cached ✓' : 'recomputes every render ✗'}
        </Pill>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            target number (drives the slow calc)
          </span>
          <input
            type="range"
            min="20"
            max="160"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <span className="mt-1 block font-mono text-sm text-cyan-300">
            target = {target}
          </span>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            unrelated text box (type fast!)
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type here and feel the lag…"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
          />
          <span className="mt-1 block text-xs text-slate-500">
            typing re-renders the component but does NOT change{' '}
            <code className="font-mono text-cyan-300">target</code>
          </span>
        </label>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-slate-500">
            factors of {target}
          </span>
          <span className="font-mono text-xs text-violet-300">
            last compute: {lastMs.toFixed(1)} ms
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {liveFactors.map((f) => (
            <span
              key={f}
              className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-300"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        With <code className="font-mono text-cyan-300">useMemo</code> on, typing
        in the text box reuses the cached factor list — no recompute. Turn it off
        and every keystroke re-runs the slow calculation, even though{' '}
        <code className="font-mono text-cyan-300">target</code> never changed.
        That is the entire point of <code>useMemo</code>: skip work whose inputs
        didn't change.
      </p>
    </div>
  )
}

/**
 * PLAYGROUND (d) — useCallback & memoized children.
 *
 * A memo()'d child only skips re-rendering if its props are referentially
 * EQUAL between renders. A function literal is a new object every render, so an
 * unmemoized callback defeats memo(). useCallback freezes the function identity.
 * The render counters make the difference undeniable.
 */
const Child = memo(function Child({ label, onClick, tone }) {
  // A ref that counts how many times THIS child actually rendered.
  const renders = useRef(0)
  renders.current += 1
  const colors = {
    rose: 'border-rose-500/30 text-rose-300',
    emerald: 'border-emerald-500/30 text-emerald-300',
  }
  return (
    <div className={`rounded-xl border bg-slate-900/50 p-4 ${colors[tone]}`}>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide">
        {label}
      </div>
      <div className="mb-3 font-mono text-3xl font-bold">
        {renders.current}
      </div>
      <div className="mb-3 text-xs text-slate-500">child renders</div>
      <button
        onClick={onClick}
        className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-inset ring-slate-700 transition hover:bg-slate-700"
      >
        ping parent
      </button>
    </div>
  )
})

function CallbackDemo() {
  const [tick, setTick] = useState(0)

  // ❌ New function identity on EVERY parent render → memo() can't help.
  const unstableOnClick = () => setTick((t) => t + 1)

  // ✓ Stable identity (deps []), so the memo() child skips re-rendering.
  const stableOnClick = useCallback(() => setTick((t) => t + 1), [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setTick((t) => t + 1)}
          className="rounded-lg bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-300 ring-1 ring-inset ring-cyan-500/40 transition hover:bg-cyan-500/25"
        >
          Re-render the parent (tick = {tick})
        </button>
        <span className="text-xs text-slate-500">
          each click re-renders the parent. Watch which child re-renders with it.
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Child
          label="prop = plain arrow fn"
          onClick={unstableOnClick}
          tone="rose"
        />
        <Child
          label="prop = useCallback fn"
          onClick={stableOnClick}
          tone="emerald"
        />
      </div>

      <p className="text-xs text-slate-500">
        Both children are wrapped in{' '}
        <code className="font-mono text-cyan-300">memo()</code>. The left one
        receives a <em>fresh</em> function every render, so memo sees a "changed"
        prop and re-renders it anyway. The right one gets the same{' '}
        <code className="font-mono text-cyan-300">useCallback</code> identity, so
        memo correctly skips it. Its counter stays put.
      </p>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   CHECKPOINTS
   ════════════════════════════════════════════════════════════════════════ */

const CHECKPOINTS = [
  {
    bad: 'Storing a timer id (or other render-irrelevant value) in useState: const [timerId, setTimerId] = useState(null).',
    good: 'Keep it in a ref: const timerRef = useRef(null); timerRef.current = setInterval(...).',
    why: 'Every setTimerId triggers a re-render you never wanted — and worse, the new id is only readable on the NEXT render, so cleanup logic in the same handler sees a stale value. A ref is the right box for values the UI does not depend on.',
  },
  {
    bad: 'Reading ref.current to decide what to render: return <span>{countRef.current}</span>.',
    good: 'If a value drives the UI, it belongs in state: const [count, setCount] = useState(0).',
    why: 'Changing a ref does not schedule a render, so the screen shows a stale value until something else repaints. Refs are for things the render output does NOT read; state is for things it does.',
  },
  {
    bad: 'Wrapping every value and function in useMemo / useCallback "to be safe".',
    good: 'Reach for them only when you have a measured cost: an expensive calc, or a stable prop a memo() child depends on.',
    why: 'Memoization is not free — it costs memory and a dependency-array comparison every render, plus it clutters the code. Applied blindly it often makes things slower and always makes them harder to read. Optimize what you measured, not what you guessed.',
  },
  {
    bad: 'Mutating a ref and expecting the UI to update: ref.current = next; // why is the screen wrong?',
    good: 'If you need the screen to reflect it, also call a setState, or lift the value into state entirely.',
    why: 'Ref writes are invisible to React. The change is real in memory but the component will not re-render to show it — a classic "I changed it but nothing happened" bug. Remember: refs are silent.',
  },
  {
    bad: 'Passing a fresh inline object/array/function to a memo() child every render: <Row style={{color:"red"}} onSelect={() => pick(id)} />.',
    good: 'Memoize the props: const style = useMemo(() => ({color:"red"}), []); const onSelect = useCallback(() => pick(id), [id]).',
    why: 'A new {}/[]/() literal is a new reference each render, so the memo() child sees "different" props and re-renders anyway — you paid for memo() and got nothing. Stable references are what let memoized children actually skip work.',
  },
]

/* ════════════════════════════════════════════════════════════════════════
   THE MODULE PAGE
   ════════════════════════════════════════════════════════════════════════ */

export default function Module5() {
  return (
    <article>
      <ModuleHeader
        id={5}
        title="Advanced Hooks & Escaping the Render Cycle"
        blurb="State drives the screen — but not every value should. Some things (timer ids, the previous value, a DOM node, an expensive result) need to live OUTSIDE the render cycle. This module is about useRef, useMemo, and useCallback: the hooks that let you persist values silently, cache work, and freeze function identities."
        tags={['useRef', 'useMemo', 'useCallback', 'Escape hatches']}
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
          icon="📦"
          title="The mutable box, and caching the expensive bits"
        />

        <div className="space-y-5">
          <Callout variant="eli5" title="The whiteboard vs. the sticky note">
            <p className="mb-2">
              <strong>useState</strong> is a shared{' '}
              <strong>whiteboard</strong> on the wall. The moment you change what
              it says, everyone notices and the whole room repaints to match. That
              is great when the value <em>is</em> the UI.
            </p>
            <p>
              <strong>useRef</strong> is a <strong>sticky note in your
              pocket</strong>. You can scribble on it, update it, read it back —
              and nobody repaints the room, because nobody's looking at your
              pocket. Perfect for values you need to <em>remember</em> but the
              screen doesn't care about: a timer id, the previous value, a flag,
              a DOM node.
            </p>
          </Callout>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              Why a ref exists at all
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              A component function re-runs top-to-bottom on every render. That
              means any plain <code>let x = ...</code> you declare is{' '}
              <em>reborn from scratch</em> each time — it cannot remember anything
              between renders. <code>useState</code> remembers, but waking it up
              triggers a re-render. Sometimes you need the memory{' '}
              <strong>without</strong> the re-render. That's the gap{' '}
              <code className="!text-violet-300">useRef</code> fills: a single
              object,{' '}
              <code className="font-mono text-cyan-300">{'{ current: ... }'}</code>
              , that React hands you the <em>same</em> instance of on every
              render, and that you may freely mutate.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="min-w-0">
                <Pill tone="rose">plain variable</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="reborn.jsx"
                    code={`function C() {
  // reborn as undefined
  // EVERY render — useless
  // for persistence.
  let id

  return null
}`}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <Pill tone="emerald">useState</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="repaints.jsx"
                    code={`function C() {
  // persists ✓
  // but writing it
  // RE-RENDERS the
  // whole component.
  const [n, setN] =
    useState(0)
  return null
}`}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <Pill tone="amber">useRef</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="silent.jsx"
                    code={`function C() {
  // persists ✓
  // AND writing it is
  // silent — no render.
  const id =
    useRef(null)
  // id.current = ...
  return null
}`}
                  />
                </div>
              </div>
            </div>

            <Callout variant="info" title="The one-line rule">
              <p>
                If the render output <strong>reads</strong> the value, it's{' '}
                <code className="!text-emerald-300">state</code>. If it doesn't,
                it's a <code className="!text-amber-300">ref</code>. That single
                question resolves almost every "useState or useRef?" decision you
                will ever face.
              </p>
            </Callout>
          </Panel>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              The two jobs of useRef
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Refs do double duty, and it confuses people that one hook covers
              both. They're really the same idea — "a stable box that survives
              renders" — pointed at two different kinds of thing.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  <h4 className="font-semibold text-slate-200">
                    1 · Mutable instance values
                  </h4>
                </div>
                <p className="mb-3 text-sm text-slate-400">
                  Timer ids, the previous prop, a "did I already fetch?" flag —
                  things you mutate across time but the UI never reads directly.
                </p>
                <CodeBlock
                  filename="timer-id.jsx"
                  code={`const intervalRef = useRef(null)

function start() {
  intervalRef.current =
    setInterval(tick, 1000)
}
function stop() {
  clearInterval(intervalRef.current)
  intervalRef.current = null
}`}
                />
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <h4 className="font-semibold text-slate-200">
                    2 · A handle to a DOM node
                  </h4>
                </div>
                <p className="mb-3 text-sm text-slate-400">
                  Pass a ref to a JSX element's <code>ref={'{...}'}</code> and
                  React fills <code>.current</code> with the real DOM node after
                  it mounts — for focus, measuring, scrolling.
                </p>
                <CodeBlock
                  filename="dom-ref.jsx"
                  code={`const inputRef = useRef(null)

useEffect(() => {
  // focus on mount
  inputRef.current.focus()
}, [])

return <input ref={inputRef} />`}
                />
              </div>
            </div>
            <Callout variant="warn" title="Refs are invisible until the next render">
              <p>
                Setting <code>ref.current</code> does <strong>not</strong>{' '}
                schedule a render. The new value is really there in memory, but
                the screen won't reflect it until some <em>other</em> cause
                repaints the component. If you find yourself wanting the UI to
                update when a ref changes, that value wanted to be{' '}
                <code className="!text-emerald-300">state</code> all along.
              </p>
            </Callout>
          </Panel>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              useMemo & useCallback — caching, not magic
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              These two are the same mechanism wearing different hats.{' '}
              <code className="font-mono text-cyan-300">useMemo</code> caches a{' '}
              <em>computed value</em>;{' '}
              <code className="font-mono text-cyan-300">useCallback</code> caches
              a <em>function</em>. Both watch a dependency array and only redo the
              work when a dependency changes. Between those changes they hand back
              the exact same cached result — same value, same reference.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <Pill tone="violet">useMemo · cache a value</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="useMemo.jsx"
                    code={`// Recomputes ONLY when
// items or query change.
const visible = useMemo(
  () => items.filter(
    (i) => i.name.includes(query)
  ),
  [items, query],
)`}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Use it for genuinely expensive computations, or to keep an
                  object/array reference stable for a child.
                </p>
              </div>
              <div className="min-w-0">
                <Pill tone="cyan">useCallback · cache a function</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="useCallback.jsx"
                    code={`// Same function identity
// until id changes.
const onSelect = useCallback(
  () => select(id),
  [id],
)

// useCallback(fn, deps) is just
// useMemo(() => fn, deps)`}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Its main job: keep a callback's identity stable so a{' '}
                  <code className="font-mono text-cyan-300">memo()</code> child
                  can skip re-rendering.
                </p>
              </div>
            </div>
            <Callout variant="danger" title="Don't cargo-cult these">
              <p>
                Memoization isn't free: it costs memory plus a dependency
                comparison on every render, and it makes code noisier. Wrapping{' '}
                <em>everything</em> "to be safe" usually makes an app{' '}
                <strong>slower</strong> and always harder to read. Reach for{' '}
                <code>useMemo</code>/<code>useCallback</code> when you've measured
                an expensive calc, or when a{' '}
                <code className="font-mono text-cyan-300">memo()</code> child
                genuinely depends on a stable prop — not by reflex.
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
          title="Feel the difference: silent refs vs. loud state"
        />

        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-400">
            Reading about "refs don't trigger renders" is one thing. Watching a
            number sit at <span className="font-mono text-amber-300">0</span> on
            screen while you mash a button is another. Play with these until the
            distinction is in your bones.
          </p>

          <Playground
            title="Ref vs. State — the silent button"
            subtitle="The emerald button repaints the room. The amber button scribbles a sticky note nobody's watching."
          >
            <RefVsStateDemo />
          </Playground>

          <Playground
            title="A real stopwatch — the correct pattern"
            subtitle="Start / Stop / Reset. The interval id lives in a ref so it survives the ~100 renders/sec the ticking causes."
          >
            <Stopwatch />
          </Playground>

          <Playground
            title="useMemo — skip work whose inputs didn't change"
            subtitle="Type in the unrelated text box. With memo on it's smooth; off, every keystroke re-runs a slow calc."
          >
            <MemoDemo />
          </Playground>

          <Playground
            title="useCallback + memo() — stable function identity"
            subtitle="Both children are memo()'d. Only the one with an unstable callback prop re-renders with the parent."
          >
            <CallbackDemo />
          </Playground>
        </div>
      </section>

      {/* ─────────────────────────── SANDBOX ─────────────────────────── */}
      <section className="mb-14">
        <SectionHeading
          id="sandbox"
          kicker="Your turn"
          icon="🐛"
          title="Fix the bug: the stopwatch that loses its timer"
        />

        <Callout variant="info" title="This one runs right here — no setup">
          <p>
            The editor below is <strong>live</strong>. Edit the broken code and it
            transpiles and re-renders on the right as you type. This stopwatch has
            a nasty, real-world bug: its interval id lives in a plain local
            variable. Click <strong>Start</strong>, then click{' '}
            <strong>Start again</strong> — watch the clock <em>accelerate</em>.
            Then try <strong>Stop</strong> and notice it can't actually stop.
          </p>
        </Callout>

        <div className="mt-5">
          <LiveSandbox
            title="Fix the bug: the stopwatch that loses its timer"
            filename="Stopwatch.jsx"
            initialCode={BROKEN_STOPWATCH}
            solutionCode={FIXED_STOPWATCH}
            hints={[
              'A plain `let timerId` is reborn as undefined on every render — and setTime renders 10x a second. The id you saved in start() is gone by the time stop() runs.',
              'Store the id in a ref so it survives renders: const timerRef = useRef(null), then timerRef.current = setInterval(...).',
              'In stop(), call clearInterval(timerRef.current) and then set timerRef.current = null so a future Start can run again.',
              'Guard start() so it refuses to launch a second interval while one is already running (if timerRef.current !== null, return).',
            ]}
          />
        </div>

        <Callout variant="info" title="Why the plain variable fails">
          <p>
            Every <code>setTime</code> re-runs the whole component function, which
            re-declares <code>let timerId</code> and wipes it back to{' '}
            <code>undefined</code>. So the id you stored in{' '}
            <code>start()</code> never survives to <code>stop()</code> —{' '}
            <code>clearInterval(undefined)</code> is a no-op. Click Start twice
            and you've now got two intervals firing, with no handle to either. A
            ref is the fix because React hands you the <em>same</em> box on every
            render.
          </p>
        </Callout>

        <div className="mt-6">
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <h4 className="font-bold text-slate-100">
                Bonus: state or ref?
              </h4>
              <Pill tone="slate">design judgement</Pill>
            </div>
            <p className="mb-3 text-sm text-slate-400">
              For each value below, decide: does the render output read it? If
              yes → <span className="text-emerald-300">state</span>. If no →{' '}
              <span className="text-amber-300">ref</span>. Then reveal the
              answers.
            </p>
            <CodeBlock
              filename="which-hook.jsx"
              code={`function VideoPlayer() {
  // a) the displayed "1:23 / 4:05" timestamp
  // b) the <video> DOM node (to call .play())
  // c) the interval id polling currentTime
  // d) whether the controls overlay is visible
  // e) a "have we already auto-played once?" flag
}`}
            />
            <div className="mt-4">
              <RevealCard buttonText="Reveal the answers">
                <ul className="ml-4 list-disc space-y-1.5 text-sm text-slate-300">
                  <li>
                    <strong>a) timestamp</strong> →{' '}
                    <span className="text-emerald-300">state</span> — it's drawn
                    on screen, so a change must repaint.
                  </li>
                  <li>
                    <strong>b) &lt;video&gt; node</strong> →{' '}
                    <span className="text-amber-300">ref</span> — a DOM handle the
                    UI never renders; you call methods on it.
                  </li>
                  <li>
                    <strong>c) interval id</strong> →{' '}
                    <span className="text-amber-300">ref</span> — pure plumbing;
                    nothing on screen reads it.
                  </li>
                  <li>
                    <strong>d) overlay visible</strong> →{' '}
                    <span className="text-emerald-300">state</span> — it controls
                    what's rendered, so it must trigger a re-render.
                  </li>
                  <li>
                    <strong>e) auto-played flag</strong> →{' '}
                    <span className="text-amber-300">ref</span> — a remembered
                    fact that guards logic, not something the UI displays.
                  </li>
                </ul>
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
            <Pill tone="cyan">You finished Module 5</Pill>
            <h3 className="text-lg font-bold text-white">
              You can step outside the render cycle on purpose now.
            </h3>
            <p className="text-sm text-slate-400">
              You know when a value belongs in a silent{' '}
              <code className="font-mono text-amber-300">useRef</code> box vs. a
              loud <code className="font-mono text-emerald-300">useState</code>,
              how to stash timer ids and DOM nodes, and when{' '}
              <code className="font-mono text-violet-300">useMemo</code> /{' '}
              <code className="font-mono text-cyan-300">useCallback</code> are
              worth their weight (and when they're just noise). Next up:{' '}
              <strong className="text-slate-200">
                sharing state across the tree without prop-drilling
              </strong>{' '}
              — Context, and the patterns that keep it from re-rendering the
              world.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              When you're ready, ask: <em>“generate Module 6.”</em>
            </p>
          </div>
        </Panel>
      </section>
    </article>
  )
}
