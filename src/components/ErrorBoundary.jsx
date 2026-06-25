import { Component } from 'react'

/**
 * ErrorBoundary — a safety net for the "Fix the Bug" sandboxes.
 *
 * WHY THIS EXISTS (read this — it's a real React concept):
 * If a component throws while rendering, React unmounts the WHOLE tree by
 * default — your entire page goes blank. An Error Boundary catches that throw
 * for the subtree it wraps and shows a fallback instead, so one broken sandbox
 * can't take down the rest of the course.
 *
 * Error boundaries are the ONE thing you still need a class component for —
 * there is no hook equivalent for `getDerivedStateFromError`. You'll basically
 * never write more class components than this one.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  // Called by React when a child throws during render. Whatever you return is
  // merged into state, so here we stash the error to trigger the fallback UI.
  static getDerivedStateFromError(error) {
    return { error }
  }

  // Side-effecty logging hook (e.g. send to Sentry in a real app). We also
  // bubble the error up via onError so a parent (the LiveSandbox) can show it
  // in its error bar.
  componentDidCatch(error, info) {
    this.props.onError?.(error, info)
    // eslint-disable-next-line no-console
    console.error('🧯 ErrorBoundary caught:', error, info?.componentStack)
  }

  // Reset-on-edit: a stock boundary latches forever once it catches. When the
  // caller passes a changing `resetKey` (e.g. after the learner edits the code),
  // we clear the caught error so the fixed code gets a fresh attempt.
  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (error) {
      return (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/[0.06] p-5">
          <div className="mb-2 flex items-center gap-2 text-rose-300">
            <span className="text-lg">💥</span>
            <span className="font-bold">This component threw an error</span>
          </div>
          <p className="mb-3 text-sm text-slate-300">
            That's expected — this is a broken sandbox! React caught it instead of
            blanking the page. Fix the source file, then click{' '}
            <span className="font-semibold text-rose-200">Re-run</span>.
          </p>
          <pre className="mb-4 overflow-x-auto rounded-lg bg-black/50 p-3 font-mono text-xs text-rose-300">
            {String(error?.message || error)}
          </pre>
          <button
            onClick={this.reset}
            className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-sm font-semibold text-rose-200 ring-1 ring-inset ring-rose-500/40 transition hover:bg-rose-500/30"
          >
            ↻ Re-run component
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
