import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ErrorBoundary from './components/ErrorBoundary'
import ModuleProgressFooter from './components/ModuleProgressFooter'
import Home from './pages/Home'
import ModulePlaceholder from './pages/ModulePlaceholder'
import { MODULES } from './lib/curriculum'

// Each "ready" module is a real page component. We import them eagerly here.
import Module1 from './modules/module1/Module1'
import Module2 from './modules/module2/Module2'
import Module3 from './modules/module3/Module3'
import Module4 from './modules/module4/Module4'
import Module5 from './modules/module5/Module5'
import Module6 from './modules/module6/Module6'

// A lookup from module id → its page component. Modules not listed here fall
// back to the friendly "coming soon" placeholder, so the route never 404s.
const MODULE_PAGES = {
  1: Module1,
  2: Module2,
  3: Module3,
  4: Module4,
  5: Module5,
  6: Module6,
}

/**
 * App — the layout shell + the route table.
 *
 * Layout:  [ Sidebar ][ scrollable page content ]
 *
 * <Routes> looks at the current URL and renders the FIRST <Route> whose `path`
 * matches. This is "declarative routing": you describe which URL shows which
 * component, and React Router figures out the rest.
 */
export default function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
          {/* A page-level safety net: one module throwing shouldn't blank the
              whole app. The boundary remounts when the route changes. */}
          <ErrorBoundary resetKey={location.pathname}>
            <Routes>
              <Route path="/" element={<Home />} />

              {MODULES.map((m) => {
                const Page = MODULE_PAGES[m.id]
                return (
                  <Route
                    key={m.id}
                    path={m.path}
                    element={
                      Page ? (
                        <>
                          <Page />
                          {/* Auto-added so every module gets a consistent
                              "mark complete / next" bar without editing the
                              module files themselves. */}
                          <ModuleProgressFooter id={m.id} />
                        </>
                      ) : (
                        <ModulePlaceholder module={m} />
                      )
                    }
                  />
                )
              })}

              {/* Anything unknown → bounce back to Home. */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
