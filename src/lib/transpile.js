import { transform } from 'sucrase'

/**
 * Transpile a string of JSX into runnable JavaScript, in the browser.
 *
 * This is the engine behind the in-app live editor. The learner types JSX;
 * Sucrase rewrites it into `React.createElement(...)` calls (the "classic"
 * runtime) which we then evaluate with React injected into scope.
 *
 * We use the CLASSIC runtime on purpose: it compiles `<div/>` to
 * `React.createElement('div')`, so the evaluated code only needs a `React`
 * variable in scope — no module imports required. `production: false` keeps
 * React's helpful dev-only warnings (like the "missing key" warning) intact,
 * which is the whole point of the exercise.
 *
 * Throws a SyntaxError-like object (with a readable .message including line
 * info) when the code doesn't parse — the LiveSandbox catches that and shows
 * it in the error bar instead of a blank preview.
 */
export function transpileJSX(source) {
  const { code } = transform(source, {
    transforms: ['jsx'],
    jsxRuntime: 'classic',
    production: false,
  })
  return code
}
