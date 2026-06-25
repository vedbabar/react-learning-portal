/**
 * Single source of truth for the course outline.
 *
 * The Sidebar and the Home page both read from this array, so there's exactly
 * ONE place to edit when we add or rename a module. (That's the "DRY" principle
 * you'll formalize in Module 4 — Don't Repeat Yourself.)
 *
 * status:
 *   'ready' → the route is fully built and clickable.
 *   'soon'  → a placeholder page renders so routing never breaks.
 */
export const MODULES = [
  {
    id: 1,
    path: '/module-1',
    title: 'The React Mental Model & JSX',
    short: 'Mental Model & JSX',
    blurb:
      'Declarative vs. imperative thinking, the UI = f(state) equation, and what JSX actually compiles into.',
    tags: ['JSX', 'Declarative', 'Rendering lists'],
    status: 'ready',
  },
  {
    id: 2,
    path: '/module-2',
    title: 'State, Events & the Core of React',
    short: 'State & Events',
    blurb:
      'useState, asynchronous state batching, functional updates, and controlled inputs.',
    tags: ['useState', 'Events', 'Batching'],
    status: 'ready',
  },
  {
    id: 3,
    path: '/module-3',
    title: 'Side Effects & the useEffect Trap',
    short: 'Side Effects',
    blurb:
      'The dependency array, cleanup functions, infinite loops, and memory leaks.',
    tags: ['useEffect', 'Cleanup', 'Deps'],
    status: 'ready',
  },
  {
    id: 4,
    path: '/module-4',
    title: 'Reusability & Custom Hooks',
    short: 'Custom Hooks',
    blurb: 'The Rules of Hooks and extracting logic into reusable custom hooks.',
    tags: ['Custom hooks', 'DRY', 'Rules of Hooks'],
    status: 'ready',
  },
  {
    id: 5,
    path: '/module-5',
    title: 'Advanced Hooks & Escaping the Render Cycle',
    short: 'Advanced Hooks',
    blurb: 'useRef for mutable values, plus useMemo & useCallback for performance.',
    tags: ['useRef', 'useMemo', 'useCallback'],
    status: 'ready',
  },
  {
    id: 6,
    path: '/module-6',
    title: 'The State Management Landscape',
    short: 'State Management',
    blurb: 'Prop drilling vs. the Context API for sharing state across the tree.',
    tags: ['Context', 'Prop drilling', 'Providers'],
    status: 'ready',
  },
]

export const getModule = (id) => MODULES.find((m) => m.id === id)
