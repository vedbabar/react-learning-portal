import { useState } from 'react'
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
import { TEAM, BROKEN_LIST, FIXED_LIST } from './BrokenList'

/* ════════════════════════════════════════════════════════════════════════
   DEMO COMPONENTS
   These little components power the interactive sections below. They live in
   this file so you can read the whole chapter top-to-bottom, but in a real app
   you'd split them into their own files.
   ════════════════════════════════════════════════════════════════════════ */

/** A presentational badge. It does ONE thing: turn props into styled markup. */
function Badge({ tone = 'cyan', pill = false, children }) {
  const tones = {
    cyan: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/40',
    violet: 'bg-violet-500/15 text-violet-300 ring-violet-500/40',
    emerald: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40',
    amber: 'bg-amber-500/15 text-amber-300 ring-amber-500/40',
    rose: 'bg-rose-500/15 text-rose-300 ring-rose-500/40',
  }
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm font-semibold ring-1 ring-inset ${
        pill ? 'rounded-full' : 'rounded-md'
      } ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

/**
 * THEORY DEMO — "UI = f(state)".
 * One piece of state (`temp`). The UI is a pure function of it: same temp,
 * same output, every time. Drag the slider and watch the output recompute.
 */
function StateIsUiDemo() {
  const [temp, setTemp] = useState(50)

  // This whole block is the "f" in UI = f(state): given `temp`, derive the UI.
  const phase =
    temp < 33
      ? { emoji: '🧊', label: 'Ice', color: 'text-cyan-300' }
      : temp < 66
        ? { emoji: '💧', label: 'Water', color: 'text-blue-300' }
        : { emoji: '💨', label: 'Steam', color: 'text-rose-300' }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex flex-col items-center gap-3">
        <div className="text-6xl">{phase.emoji}</div>
        <div className={`text-lg font-bold ${phase.color}`}>{phase.label}</div>
        <input
          type="range"
          min="0"
          max="100"
          value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
          className="w-full max-w-xs accent-cyan-400"
        />
        <div className="flex items-center gap-6 font-mono text-sm">
          <span className="text-slate-400">
            state: <span className="text-amber-300">temp = {temp}</span>
          </span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-400">
            UI: <span className={phase.color}>{phase.label}</span>
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        You never told React to “change the emoji.” You changed the{' '}
        <span className="text-amber-300">state</span>; React re-ran the function
        and figured out the new UI.
      </p>
    </div>
  )
}

/**
 * THEORY DEMO — flip between the JSX you write and the JS Babel turns it into.
 * Demonstrates that JSX is *sugar* for React.createElement() calls.
 */
function JsxCompileToggle() {
  const [view, setView] = useState('jsx')

  const jsx = `const greeting = (
  <h1 className="title">
    Hello, {name}! <Wave />
  </h1>
)`

  const compiled = `const greeting = React.createElement(
  "h1",
  { className: "title" },
  "Hello, ",
  name,
  "! ",
  React.createElement(Wave, null)
)`

  return (
    <div>
      <div className="mb-3 inline-flex rounded-lg border border-slate-800 bg-slate-900/60 p-1">
        <button
          onClick={() => setView('jsx')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            view === 'jsx'
              ? 'bg-cyan-500/20 text-cyan-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          JSX (what you write)
        </button>
        <button
          onClick={() => setView('compiled')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            view === 'compiled'
              ? 'bg-violet-500/20 text-violet-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Compiled JS (what Babel emits)
        </button>
      </div>
      <CodeBlock
        filename={view === 'jsx' ? 'you-write.jsx' : 'babel-output.js'}
        code={view === 'jsx' ? jsx : compiled}
        highlight
      />
      <p className="mt-2 text-xs text-slate-500">
        Same thing, both ways. JSX isn't HTML — it's a friendlier way to call{' '}
        <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-cyan-300">
          React.createElement()
        </code>
        , which returns a plain object describing the UI.
      </p>
    </div>
  )
}

/**
 * PLAYGROUND — a dynamic UI builder. You change the controls (state); the live
 * <Badge> and the generated JSX both update. This is props + children + the
 * UI = f(state) idea, all in one toy.
 */
function BadgeBuilder() {
  const [label, setLabel] = useState('SHIPPED')
  const [tone, setTone] = useState('emerald')
  const [pill, setPill] = useState(true)
  const [star, setStar] = useState(true)

  const tones = ['cyan', 'violet', 'emerald', 'amber', 'rose']

  // Build the exact JSX a developer would write to produce this badge.
  const generated = `<Badge tone="${tone}"${pill ? ' pill' : ''}>
  ${star ? '⭐ ' : ''}${label || 'Badge'}
</Badge>`

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* ---- Controls (these set state) ---- */}
      <div className="min-w-0 space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            children (the text inside the tags)
          </span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Type badge text…"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
          />
        </label>

        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            tone (a prop)
          </span>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset transition ${
                  tone === t
                    ? 'bg-slate-700 text-white ring-slate-500'
                    : 'bg-slate-900 text-slate-400 ring-slate-800 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={pill}
              onChange={(e) => setPill(e.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
            <code className="font-mono text-cyan-300">pill</code> prop (rounded)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={star}
              onChange={(e) => setStar(e.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
            star in children
          </label>
        </div>
      </div>

      {/* ---- Live output + generated code ---- */}
      <div className="min-w-0 space-y-4">
        <div className="flex min-h-[88px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 p-6">
          <Badge tone={tone} pill={pill}>
            {star ? '⭐ ' : ''}
            {label || 'Badge'}
          </Badge>
        </div>
        <CodeBlock filename="generated.jsx" code={generated} />
      </div>
    </div>
  )
}

/** A component whose entire purpose is to wrap `children`. This is composition. */
function Frame({ title, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700">
      <div className="border-b border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-200">
        {title}
      </div>
      {/* `children` is whatever the caller nested between the tags. */}
      <div className="space-y-2 bg-slate-900/60 p-4 text-sm text-slate-300">
        {children}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   THE MODULE PAGE
   ════════════════════════════════════════════════════════════════════════ */

const CHECKPOINTS = [
  {
    bad: 'Using the array index as a key: key={index}.',
    good: 'Use a stable, unique id from your data: key={user.id}.',
    why: 'Index keys break when the list reorders, filters, or has items inserted — React reuses the wrong DOM node and state gets attached to the wrong row.',
  },
  {
    bad: 'Returning two sibling elements from a component with no wrapper.',
    good: 'Wrap them in a Fragment: <>…</> (or a real element if you need one).',
    why: "A function can only return ONE value. Two adjacent JSX tags aren't one value — Babel can't combine them without a parent.",
  },
  {
    bad: 'Writing class="..." and for="..." like in HTML.',
    good: 'Use className and htmlFor.',
    why: '`class` and `for` are reserved words in JavaScript. JSX is JS, so React renamed the attributes.',
  },
  {
    bad: 'Putting an if-statement or a for-loop directly inside JSX.',
    good: 'Use expressions: a ternary (cond ? a : b), && for conditional render, and .map() for lists.',
    why: 'JSX slots only accept expressions (things that produce a value), not statements (things that do work).',
  },
  {
    bad: 'Rendering a whole object: {user} — then getting "Objects are not valid as a React child".',
    good: 'Render a primitive: {user.name}, or JSON.stringify(user) while debugging.',
    why: 'React can render strings, numbers, and elements — not raw objects. The error literally tells you what went wrong.',
  },
]

export default function Module1() {
  return (
    <article>
      <ModuleHeader
        id={1}
        title="The React Mental Model & JSX"
        blurb="Before any hooks or APIs, you need the one idea the whole library is built on: you describe what the UI should look like for a given state, and React makes the screen match. Let's rewire how you think about UI."
        tags={['Declarative', 'UI = f(state)', 'JSX', 'Rendering lists']}
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
          title="Declarative thinking & what JSX really is"
        />

        <div className="space-y-5">
          <Callout variant="eli5" title="The vending machine vs. the chef">
            <p className="mb-2">
              <strong>Imperative</strong> code is like giving a chef
              step-by-step orders: “grab the bun, now add the patty, now the
              cheese, now wrap it.” You micromanage every action.
            </p>
            <p>
              <strong>Declarative</strong> code (React) is like a{' '}
              <strong>vending machine</strong>: you press <code>B4</code> and say
              “I want <em>that</em> burger.” You describe the{' '}
              <em>result you want</em>; the machine figures out the steps. In
              React you describe the screen you want for the current data, and
              React does the DOM grunt work.
            </p>
          </Callout>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">
              Why React is declarative
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Manually poking the DOM (“find this node, change its text, toggle
              that class”) gets impossible to track as an app grows — bugs come
              from the UI and your variables drifting out of sync. React removes
              the entire category of bug by owning the DOM for you.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <Pill tone="rose">Imperative · vanilla JS</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="imperative.js"
                    code={`const out = document.querySelector('#out')
let count = 0

button.addEventListener('click', () => {
  // YOU find the node and YOU mutate it.
  count++
  out.textContent = count
})`}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <Pill tone="emerald">Declarative · React</Pill>
                <div className="mt-2">
                  <CodeBlock
                    filename="declarative.jsx"
                    code={`function Counter() {
  const [count, setCount] = useState(0)

  // You describe the result. React updates the DOM.
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
            <Callout variant="info" title="The core equation">
              <p>
                The whole library fits in one line:{' '}
                <code className="!text-violet-300">UI = f(state)</code>. Your
                component is the function <code>f</code>. Give it some{' '}
                <code>state</code>, it returns a description of the UI. Change the
                state and React calls <code>f</code> again and reconciles the
                difference. Try it:
              </p>
            </Callout>
            <div className="mt-4">
              <StateIsUiDemo />
            </div>
          </Panel>

          <Panel>
            <h3 className="mb-1 font-bold text-slate-100">JSX is not HTML</h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              JSX <em>looks</em> like HTML, but it's syntax sugar. A build tool
              (Babel/SWC, wired up by Vite) rewrites every tag into a{' '}
              <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-xs text-cyan-300">
                React.createElement(...)
              </code>{' '}
              call that returns a plain JavaScript object — a lightweight
              description of what you want on screen. Flip between the two:
            </p>
            <JsxCompileToggle />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Callout variant="tip" title="It's just JS">
                Curly braces <code>{'{ }'}</code> drop you back into JavaScript.
                Anything that produces a value goes there.
              </Callout>
              <Callout variant="warn" title="One root only">
                A component returns one value — wrap siblings in{' '}
                <code>{'<>…</>'}</code>.
              </Callout>
              <Callout variant="danger" title="Expressions, not statements">
                No <code>if</code>/<code>for</code> inside the markup — use{' '}
                ternaries, <code>&&</code>, and <code>.map()</code>.
              </Callout>
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
          title="A dynamic UI builder: props & children"
        />
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-400">
            A component is a function that takes inputs and returns UI. Those
            inputs come in two flavors: <strong>props</strong> (named arguments
            like <code className="font-mono text-cyan-300">tone</code>) and{' '}
            <strong>children</strong> (whatever you nest between the tags). Tweak
            the controls and watch both the live badge and the JSX you'd write to
            create it update together.
          </p>

          <Playground
            title="Badge builder"
            subtitle="Change the state on the left → the UI and its source on the right recompute."
          >
            <BadgeBuilder />
          </Playground>

          <Playground
            title="Composition with children"
            subtitle="A <Frame> doesn't know or care what's inside it — it just renders whatever children you pass."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 p-6">
                {/* Everything between <Frame> and </Frame> becomes `children`. */}
                <Frame title="📥 Inbox">
                  <p>You have 3 unread messages.</p>
                  <Badge tone="violet" pill>
                    3 new
                  </Badge>
                </Frame>
              </div>
              <CodeBlock
                filename="usage.jsx"
                code={`<Frame title="📥 Inbox">
  <p>You have 3 unread messages.</p>
  <Badge tone="violet" pill>
    3 new
  </Badge>
</Frame>

// Inside Frame:
function Frame({ title, children }) {
  return (
    <div>
      <header>{title}</header>
      <div>{children}</div>  {/* the slot */}
    </div>
  )
}`}
              />
            </div>
          </Playground>
        </div>
      </section>

      {/* ─────────────────────────── SANDBOX ─────────────────────────── */}
      <section className="mb-14">
        <SectionHeading
          id="sandbox"
          kicker="Your turn"
          icon="🐛"
          title="Fix the bug: a broken list"
        />

        <Callout variant="info" title="This one runs right here — no setup">
          <p>
            The editor below is <strong>live</strong>. Edit the broken code and it
            transpiles and re-renders on the right as you type. React's warnings
            land in the <strong>in-app console</strong> at the bottom — you don't
            need to open DevTools or any file. Two bugs are hiding in this list;
            the console points right at them.
          </p>
        </Callout>

        <div className="mt-5">
          <LiveSandbox
            title="Fix the bug: a broken list"
            filename="BrokenList.jsx"
            initialCode={BROKEN_LIST}
            solutionCode={FIXED_LIST}
            scope={{ TEAM }}
            hints={[
              'Each <li> created inside .map() needs a stable key prop — use the unique member.id.',
              'One cell renders {member}, a whole object. React only renders strings/numbers — show a property like {member.name}.',
            ]}
          />
        </div>

        <Callout variant="info" title="Why the key matters">
          <p>
            Keys are React's name tags for list items. When the list changes,
            React matches old and new items <em>by key</em> to reuse DOM nodes and
            keep their state. No key (or an unstable one, like the array index) →
            subtle, infuriating bugs when rows are added, removed, or reordered.
          </p>
        </Callout>

        {/* Bonus static challenge: spot the syntax error (read-only so it can't
            break the build). */}
        <div className="mt-6">
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <h4 className="font-bold text-slate-100">
                Bonus: spot the JSX syntax error
              </h4>
              <Pill tone="slate">code reading</Pill>
            </div>
            <p className="mb-3 text-sm text-slate-400">
              This snippet won't even compile. What's wrong? (Two classic
              mistakes.)
            </p>
            <CodeBlock
              filename="Profile.jsx (broken)"
              code={`function Profile() {
  return (
    <h1 class="name">Ada Lovelace</h1>
    <p>Engineer</p>
  )
}`}
            />
            <div className="mt-4">
              <RevealCard buttonText="Reveal the fixes">
                <ul className="ml-4 list-disc space-y-1.5 text-sm text-slate-300">
                  <li>
                    Two sibling elements are returned with no parent — wrap them
                    in a Fragment <code>{'<>…</>'}</code>.
                  </li>
                  <li>
                    <code>class</code> is a reserved JS word — use{' '}
                    <code>className</code>.
                  </li>
                </ul>
                <CodeBlock
                  filename="Profile.jsx (fixed)"
                  highlight
                  code={`function Profile() {
  return (
    <>
      <h1 className="name">Ada Lovelace</h1>
      <p>Engineer</p>
    </>
  )
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
            <Pill tone="cyan">You finished Module 1</Pill>
            <h3 className="text-lg font-bold text-white">
              You can now read React like a native.
            </h3>
            <p className="text-sm text-slate-400">
              You understand declarative UI, the{' '}
              <code className="font-mono text-violet-300">UI = f(state)</code>{' '}
              equation, what JSX compiles to, and how props & children flow.
              Next up:{' '}
              <strong className="text-slate-200">
                making state actually change
              </strong>{' '}
              — events, <code>useState</code>, and the batching trap.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              When you're ready, ask: <em>“generate Module 2.”</em>
            </p>
          </div>
        </Panel>
      </section>
    </article>
  )
}
