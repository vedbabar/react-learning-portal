import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ProgressProvider } from './lib/progress.jsx'
import './index.css'

/**
 * This is the ONE place where React "takes over" a piece of the DOM.
 *
 *  - createRoot(...)  →  hands React control of the <div id="root"> in index.html.
 *  - <StrictMode>     →  a dev-only helper. It intentionally double-invokes some
 *                        functions (renders, effects) to surface bugs early. You'll
 *                        feel this in Module 3 when an effect "runs twice" — that's
 *                        a feature, not a bug.
 *  - <BrowserRouter>  →  makes the URL bar a piece of state. Anything inside can
 *                        read the current route and render the matching page.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </BrowserRouter>
  </StrictMode>,
)
