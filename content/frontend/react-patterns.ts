// @ts-nocheck
import type { Category } from '@/lib/types'

export const reactPatternsCategory: Category = {
  id: 'react-patterns',
  title: 'React Patterns & Internals',
  description:
    'Deep dive into React reconciliation, server components, hooks internals, and battle-tested composition patterns.',
  icon: 'Atom',
  concepts: [
    {
      id: 'react-reconciliation',
      title: 'React Reconciliation',
      description:
        'The fiber architecture and diffing algorithm that determines what actually changes in the DOM. Understanding reconciliation is the key to writing performant React — every re-render decision flows through this system.',
      keyPoints: [
        'Fiber is a unit of work — each fiber node represents a component instance, DOM node, or fragment in the virtual tree',
        'Reconciliation compares the previous fiber tree with the new element tree using a two-phase approach: render (interruptible) and commit (synchronous)',
        'React uses heuristics, not a full tree diff (O(n^3)) — it assumes elements of different types produce different trees and uses keys to match children (O(n))',
        'The key prop is React\'s identity hint — it tells reconciliation "this is the same logical instance" across renders',
        'Using array index as key breaks reconciliation when items are reordered, inserted, or deleted — React reuses the wrong fiber and corrupts local state',
        'Bailout conditions: React skips re-rendering a subtree when the element type and props are referentially equal (Object.is) and there are no pending state updates',
        'React.memo wraps a component to add a shallow props comparison bailout — but the bailout only works if parent does not create new object/function references each render',
        'Priority lanes in React 18+ allow urgent updates (clicks) to interrupt less urgent ones (transitions)',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Key prop — wrong vs right',
          code: `// WRONG: index as key breaks state when list reorders
{items.map((item, index) => (
  <ListItem key={index} item={item} />
))}

// RIGHT: stable unique ID preserves component identity
{items.map((item) => (
  <ListItem key={item.id} item={item} />
))}

// KEY RESET TRICK: force remount by changing key
// When key changes, React unmounts old instance and mounts new one
<UserProfile key={userId} userId={userId} />`,
        },
        {
          language: 'tsx',
          label: 'Bailout conditions',
          code: `// This child re-renders every time Parent renders
// because style={{}} creates a new object reference each time
function Parent() {
  const [count, setCount] = useState(0)
  return <Child style={{ color: 'red' }} /> // new object every render
}

// Fix: hoist static values or memoize
const style = { color: 'red' } // stable reference
function Parent() {
  const [count, setCount] = useState(0)
  return <Child style={style} />
}`,
        },
      ],
      useCases: [
        'Diagnosing unexpected re-renders in React DevTools Profiler',
        'Optimizing list rendering with correct key strategy',
        'Force-remounting components by changing key (reset form state)',
        'Understanding why React.memo does not help when parent passes inline objects',
      ],
      commonPitfalls: [
        'Using index as key in dynamic lists — causes state bugs when items reorder',
        'Assuming React diffs the entire tree — it only compares siblings at the same level',
        'Wrapping everything in React.memo without checking if parent creates new references — memo becomes useless',
        'Not realizing that a key change unmounts and remounts the entire subtree (expensive if unintended)',
      ],
      interviewTips: [
        'Explain the O(n) heuristic: same type → update, different type → unmount/remount, keys match siblings',
        'Walk through what happens when you reorder a list with index keys vs stable keys',
        'Mention fiber architecture and the two phases (render is interruptible, commit is not)',
        'Connect reconciliation to React.memo — memo adds a shallow comparison bailout before reconciliation',
      ],
      relatedConcepts: [
        'react-server-components',
        'suspense-concurrent',
        'memo-usememo-usecallback',
        'context-performance',
      ],
      difficulty: 'advanced',
      tags: ['react', 'fiber', 'reconciliation', 'performance', 'virtual-dom'],
      proTip:
        'Use React DevTools Profiler\'s "Why did this render?" feature to see exactly which props changed. If you see "Props changed" but the component should be memoized, check for inline object/function creation in the parent.',
    },
    {
      id: 'react-server-components',
      title: 'React Server Components (RSC)',
      description:
        'Server Components execute on the server and send serialized UI to the client with zero JavaScript bundle cost. They fundamentally change how you think about the client/server boundary in React applications.',
      keyPoints: [
        'Server Components run only on the server — they can directly access databases, file systems, and secrets without exposing them to the client',
        'Client Components are marked with "use client" at the top of the file — this is a boundary declaration, not a location hint',
        '"use client" propagates: if a Server Component imports a Client Component, all of that Client Component\'s imports become client-bundled too',
        'Server Components cannot use useState, useEffect, or any browser APIs — they are async functions that return JSX',
        'Props passed from Server to Client Components must be serializable (no functions, classes, or Dates — use ISO strings)',
        'Server Components can be async — you can await fetch/db calls directly in the component body',
        'Streaming allows Server Components to progressively send HTML as each Suspense boundary resolves',
        'Server Components are rendered once per request — they do not re-render on the client',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Server Component with data fetching',
          code: `// app/users/page.tsx — Server Component (default in Next.js App Router)
// No "use client" = Server Component
import { db } from '@/lib/db'
import { UserList } from './user-list'

export default async function UsersPage() {
  // Direct database access — no API route needed
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true },
  })

  // Pass serializable data to Client Component
  return <UserList users={users} />
}`,
        },
        {
          language: 'tsx',
          label: 'Client Component boundary',
          code: `// app/users/user-list.tsx
'use client'

import { useState } from 'react'

interface User {
  id: string
  name: string
  email: string
}

// This component and ALL its imports are bundled for the client
export function UserList({ users }: { users: User[] }) {
  const [search, setSearch] = useState('')
  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      {filtered.map((u) => (
        <div key={u.id}>{u.name}</div>
      ))}
    </div>
  )
}`,
        },
      ],
      useCases: [
        'Data fetching without client-side loading states — fetch in Server Component, stream results',
        'Reducing JavaScript bundle size — heavy markdown parsers, syntax highlighters stay server-side',
        'Secure data access — database queries and API keys never reach the client',
        'SEO-critical pages that need full HTML on first paint',
      ],
      commonPitfalls: [
        'Putting "use client" on every component — defeats the purpose, ships unnecessary JS',
        'Trying to pass non-serializable props (functions, Date objects) from Server to Client Components',
        'Importing a large library in a Client Component that only the server needs — push that logic to a Server Component',
        'Not understanding that "use client" is a boundary — everything imported by that file becomes client code',
      ],
      interviewTips: [
        'Explain the mental model: Server Components are the "data layer" that feeds serializable props to interactive Client Components',
        'Compare with traditional SSR: SSR renders once then hydrates everything; RSC keeps server-only code off the client permanently',
        'Discuss the serialization boundary and what can/cannot cross it',
        'Mention streaming — Server Components + Suspense enable progressive HTML delivery',
      ],
      relatedConcepts: [
        'streaming-ssr',
        'suspense-concurrent',
        'rendering-strategies',
        'edge-rendering',
      ],
      difficulty: 'advanced',
      tags: ['react', 'rsc', 'server-components', 'next.js', 'streaming'],
      proTip:
        'Think of the "use client" boundary like a network boundary. Everything above it runs on the server. Everything below ships to the browser. Design your component tree so interactive leaves are Client Components and data-heavy parents are Server Components.',
    },
    {
      id: 'suspense-concurrent',
      title: 'Suspense & Concurrent Features',
      description:
        'React 18 introduced concurrent rendering — the ability to prepare multiple versions of UI simultaneously. Suspense, useTransition, and useDeferredValue let you keep the UI responsive during expensive updates.',
      keyPoints: [
        'Suspense wraps async boundaries — when a child suspends (throws a promise), React shows the fallback until the promise resolves',
        'Concurrent rendering means React can interrupt a render to handle a more urgent update (user click beats background data)',
        'useTransition marks a state update as non-urgent — React keeps showing old UI while preparing the new one in the background',
        'useDeferredValue is the value-level equivalent of useTransition — it returns a "stale" version of a value that updates with lower priority',
        'startTransition (standalone, no isPending) wraps updates that can be interrupted without visual regression',
        'Suspense for data fetching requires a suspense-compatible data library (React Query, Next.js, Relay) — not raw useEffect + fetch',
        'Suspense boundaries are also selective hydration boundaries — React hydrates them independently and prioritizes interacted ones',
        'Nesting Suspense boundaries controls loading granularity — one big boundary = all-or-nothing, many small = progressive reveal',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'useTransition for non-urgent updates',
          code: `import { useState, useTransition } from 'react'

function SearchPage() {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Urgent: update input immediately
    setQuery(e.target.value)

    // Non-urgent: filter 10,000 items can be interrupted
    startTransition(() => {
      setFilteredItems(filterItems(e.target.value))
    })
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <span>Updating...</span>}
      <ItemList items={filteredItems} />
    </div>
  )
}`,
        },
        {
          language: 'tsx',
          label: 'Nested Suspense boundaries',
          code: `// Progressive loading: header appears first, then sidebar, then content
export default function Dashboard() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <Header />
      <div className="flex">
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
        <Suspense fallback={<ContentSkeleton />}>
          <MainContent />
        </Suspense>
      </div>
    </Suspense>
  )
}`,
        },
      ],
      useCases: [
        'Search inputs where filtering is expensive — useTransition keeps typing responsive',
        'Tab switches that load data — show old tab while new tab data loads',
        'Dashboard layouts with independent data sources — each section loads independently via Suspense',
        'Route transitions in Next.js — useTransition wraps router.push for smooth navigation',
      ],
      commonPitfalls: [
        'Using Suspense with raw useEffect + fetch — this does not work; you need a suspense-compatible library',
        'Wrapping every tiny component in Suspense — overhead for no benefit, use it at meaningful async boundaries',
        'Forgetting isPending feedback — users think nothing happened when transition is slow',
        'Confusing useDeferredValue with debounce — useDeferredValue does not delay, it deprioritizes',
      ],
      interviewTips: [
        'Explain the mental model: urgent updates (typing) vs non-urgent updates (search results)',
        'Describe how Suspense + streaming SSR work together: each boundary is an independent chunk of HTML',
        'Compare useTransition (wraps the setter) vs useDeferredValue (wraps the value)',
        'Mention that concurrent features are opt-in — you only get them by using these APIs',
      ],
      relatedConcepts: [
        'react-reconciliation',
        'streaming-ssr',
        'code-splitting',
        'react-server-components',
      ],
      difficulty: 'advanced',
      tags: ['react', 'concurrent', 'suspense', 'useTransition', 'performance'],
      proTip:
        'Think of useTransition as a "keep the old screen" button. Without it, setting state immediately swaps to a loading state. With it, React keeps the current UI visible and prepares the new UI in the background — showing isPending so you can add a subtle loading indicator.',
    },
    {
      id: 'hooks-deep-dive',
      title: 'Hooks Deep Dive',
      description:
        'Hooks are closures over the render scope. Understanding closure stale state, the rules of hooks, and when to reach for useReducer vs useState is what separates senior React developers from everyone else.',
      keyPoints: [
        'Every render has its own props, state, and effects — hooks capture values from that specific render via closures',
        'Stale closure: if an effect or callback closes over a value but the dependency array does not include it, you read the old value forever',
        'useRef stores a mutable value that persists across renders without triggering re-renders — the escape hatch from the closure model',
        'useLayoutEffect fires synchronously after DOM mutation but before browser paint — use for measurements and scroll position',
        'useEffect fires asynchronously after paint — use for side effects that do not need to block visual updates',
        'Custom hooks must start with "use" and can call other hooks — they share logic, not state (each call site gets its own state)',
        'useReducer is preferred over useState when: next state depends on previous state, multiple sub-values change together, or state transitions have complex logic',
        'The dependency array is not "optimization" — it is correctness. Lying about deps causes bugs. eslint-plugin-react-hooks/exhaustive-deps is mandatory.',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Stale closure trap and fix',
          code: `function Timer() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // BUG: count is captured from first render (0) forever
    const id = setInterval(() => {
      console.log(count) // always 0
      setCount(count + 1) // always sets to 1
    }, 1000)
    return () => clearInterval(id)
  }, []) // empty deps = closure over initial count

  // FIX 1: functional updater (does not need count in closure)
  useEffect(() => {
    const id = setInterval(() => {
      setCount((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // FIX 2: useRef for latest value (when you need to read, not just set)
  const countRef = useRef(count)
  countRef.current = count // sync on every render

  return <div>{count}</div>
}`,
        },
        {
          language: 'tsx',
          label: 'useReducer for complex state',
          code: `interface FormState {
  values: Record<string, string>
  errors: Record<string, string>
  isSubmitting: boolean
  isDirty: boolean
}

type FormAction =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'RESET'; initial: Record<string, string> }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: '' },
        isDirty: true,
      }
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true }
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false, isDirty: false }
    case 'RESET':
      return { values: action.initial, errors: {}, isSubmitting: false, isDirty: false }
    default:
      return state
  }
}`,
        },
      ],
      useCases: [
        'Interval/timer logic — functional updater avoids stale closure',
        'Form state with validation — useReducer keeps transitions predictable',
        'DOM measurements — useLayoutEffect reads layout before paint to prevent flicker',
        'Sharing stateful logic across components — custom hooks extract and reuse',
      ],
      commonPitfalls: [
        'Ignoring exhaustive-deps lint rule — the number one source of React bugs in production',
        'Using useEffect for derived state — if you can compute it during render, do it during render (no effect needed)',
        'Putting everything in useEffect — not every side effect needs an effect; event handlers are often the right place',
        'Creating custom hooks that do too much — a hook should do one thing; compose small hooks into bigger ones',
      ],
      interviewTips: [
        'Explain the closure model: each render is a snapshot, hooks capture that snapshot',
        'Walk through a stale closure bug and fix it with functional updater or useRef',
        'Describe useLayoutEffect timing: after DOM mutation, before paint (synchronous)',
        'Explain why the rules of hooks exist — React relies on call order to match hooks to state slots',
      ],
      relatedConcepts: [
        'react-reconciliation',
        'context-performance',
        'controlled-vs-uncontrolled',
        'compound-components',
      ],
      difficulty: 'intermediate',
      tags: ['react', 'hooks', 'closures', 'useEffect', 'useReducer', 'useRef'],
      proTip:
        'If you find yourself adding a ref just to read the "latest" value inside an effect, ask whether the effect should be an event handler instead. Effects are for synchronization with external systems. User-triggered actions belong in event handlers — no dependency array headaches.',
    },
    {
      id: 'compound-components',
      title: 'Compound Components',
      description:
        'Compound components share implicit state through Context, giving consumers a flexible, declarative API without prop drilling. Think of <select> and <option> — they work together without you wiring state between them.',
      keyPoints: [
        'Parent component owns state and exposes it via Context; children consume without explicit prop passing',
        'Consumers compose children in any order — the API is declarative and flexible',
        'Two approaches: React.Children.map (fragile, breaks with wrappers) vs Context (robust, works with any nesting)',
        'Context approach is preferred — children read state from Context, parent provides it',
        'Use displayName on sub-components for DevTools readability',
        'Compound components are ideal for UI kits: Tabs, Accordion, Menu, Combobox',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Compound component with Context',
          code: `import { createContext, useContext, useState, type ReactNode } from 'react'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tab components must be used within <Tabs>')
  return ctx
}

function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  )
}

function TabList({ children }: { children: ReactNode }) {
  return <div role="tablist">{children}</div>
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext()
  return (
    <button role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)}>
      {children}
    </button>
  )
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab } = useTabsContext()
  if (activeTab !== id) return null
  return <div role="tabpanel">{children}</div>
}

// Usage — flexible, declarative API
// <Tabs defaultTab="a">
//   <TabList>
//     <Tab id="a">First</Tab>
//     <Tab id="b">Second</Tab>
//   </TabList>
//   <TabPanel id="a">Content A</TabPanel>
//   <TabPanel id="b">Content B</TabPanel>
// </Tabs>`,
        },
      ],
      useCases: [
        'Design system components (Tabs, Accordion, Dropdown, Menu)',
        'Form builders where field components implicitly register with a parent form',
        'Step wizards where steps share progress state',
        'Any component with a "parent + children" relationship and shared state',
      ],
      commonPitfalls: [
        'Using React.Children.map + cloneElement instead of Context — breaks when children are wrapped in fragments or other components',
        'Exposing too much internal state through Context — keep the API surface minimal',
        'Forgetting to validate Context existence — always throw if used outside provider',
        'Making the compound pattern too abstract for simple use cases — sometimes plain props are fine',
      ],
      interviewTips: [
        'Compare with prop drilling: compound components invert control — parent owns state, children are declarative',
        'Mention the HTML analogy: <select>/<option>, <table>/<tr>/<td>',
        'Explain why Context beats cloneElement: nesting flexibility, no wrapper fragility',
        'Discuss trade-offs: more files/components, but much better API ergonomics for consumers',
      ],
      relatedConcepts: [
        'context-performance',
        'render-props',
        'higher-order-components',
        'hooks-deep-dive',
      ],
      difficulty: 'intermediate',
      tags: ['react', 'patterns', 'compound-components', 'context', 'composition'],
    },
    {
      id: 'render-props',
      title: 'Render Props',
      description:
        'A render prop is a function prop that a component uses to know what to render. It inverts rendering control — the component handles logic, the consumer handles presentation. Largely superseded by hooks but still relevant in specific scenarios.',
      keyPoints: [
        'A render prop is a prop whose value is a function that returns JSX — the component calls this function with its internal state',
        'Function-as-child is a common variant: children is the render prop',
        'Hooks replaced most render prop use cases, but render props still shine when you need to share behavior between class and function components or when the shared logic produces JSX',
        'Libraries like Formik, Downshift, and React Spring still use render props for maximum flexibility',
        'Render props can cause re-render issues if the function is recreated each render — memoize or hoist it',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Render prop vs custom hook',
          code: `// Render prop pattern
function MouseTracker({ render }: { render: (pos: { x: number; y: number }) => ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return <>{render(pos)}</>
}

// Usage: <MouseTracker render={({ x, y }) => <p>Mouse: {x}, {y}</p>} />

// Modern equivalent: custom hook (preferred)
function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return pos
}`,
        },
      ],
      useCases: [
        'Libraries that need maximum consumer flexibility (Downshift, React Spring)',
        'When the shared logic produces JSX that the consumer should control',
        'Bridging class and function components in legacy codebases',
        'Headless UI components that provide behavior without rendering',
      ],
      commonPitfalls: [
        'Creating the render function inline in JSX — causes re-renders because the function reference changes every render',
        'Overusing render props when a custom hook is simpler and more composable',
        'Deep nesting of render props ("callback hell" in JSX) — hooks eliminate this entirely',
      ],
      interviewTips: [
        'Know the historical progression: mixins → HOCs → render props → hooks',
        'Explain when render props are still useful: headless UI, library APIs, JSX delegation',
        'Compare with hooks: hooks are more composable and avoid nesting, but render props give render control',
      ],
      relatedConcepts: [
        'higher-order-components',
        'hooks-deep-dive',
        'compound-components',
      ],
      difficulty: 'intermediate',
      tags: ['react', 'patterns', 'render-props', 'composition'],
    },
    {
      id: 'higher-order-components',
      title: 'Higher-Order Components (HOC)',
      description:
        'A HOC is a function that takes a component and returns a new component with additional behavior. It is the React equivalent of the decorator pattern. Largely replaced by hooks but still used in some libraries and legacy codebases.',
      keyPoints: [
        'A HOC is a pure function: (Component) => EnhancedComponent — it does not mutate the original',
        'Common pattern: inject props (withRouter, connect), add behavior (withAuth, withLogging), or modify rendering',
        'Always set displayName on the returned component for React DevTools',
        'Forward refs using React.forwardRef to avoid ref interception',
        'Static methods on the wrapped component are lost — use hoist-non-react-statics or copy manually',
        'Compose multiple HOCs with a compose utility (right-to-left application)',
        'Hooks are preferred for new code — they avoid the "wrapper hell" problem and are easier to type',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'HOC with ref forwarding and displayName',
          code: `import { forwardRef, type ComponentType } from 'react'

interface WithAuthProps {
  isAuthenticated: boolean
  user: { id: string; name: string } | null
}

function withAuth<P extends object>(WrappedComponent: ComponentType<P & WithAuthProps>) {
  const WithAuth = forwardRef<unknown, P>((props, ref) => {
    const { isAuthenticated, user } = useAuth()
    return (
      <WrappedComponent
        {...(props as P)}
        ref={ref}
        isAuthenticated={isAuthenticated}
        user={user}
      />
    )
  })

  WithAuth.displayName = \`withAuth(\${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})\`
  return WithAuth
}

// Modern equivalent: just use the hook directly
function Dashboard() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Redirect to="/login" />
  return <div>Welcome, {user?.name}</div>
}`,
        },
      ],
      useCases: [
        'Legacy codebases with class components that cannot use hooks',
        'Library APIs where decoration is ergonomic (Redux connect, React Router withRouter)',
        'Cross-cutting concerns: logging, analytics, error boundaries',
        'Progressively migrating from HOCs to hooks',
      ],
      commonPitfalls: [
        'Applying HOC inside render — creates a new component type each render, unmounting and remounting the subtree',
        'Forgetting to forward refs — the consumer cannot access the wrapped component\'s ref',
        'Props name collision — the HOC injects props that shadow the consumer\'s props',
        'Multiple HOCs making it hard to trace which props come from where',
      ],
      interviewTips: [
        'Know the evolution: HOCs → render props → hooks, and why each was an improvement',
        'Explain the compose pattern: compose(withAuth, withLogging, withTheme)(Component)',
        'Discuss the "wrapper hell" problem: React DevTools shows deeply nested anonymous wrappers',
        'Mention that hooks solve the composition problem without adding tree depth',
      ],
      relatedConcepts: [
        'render-props',
        'hooks-deep-dive',
        'compound-components',
      ],
      difficulty: 'intermediate',
      tags: ['react', 'patterns', 'hoc', 'composition', 'legacy'],
    },
    {
      id: 'controlled-vs-uncontrolled',
      title: 'Controlled vs Uncontrolled Components',
      description:
        'Controlled components let React own the state (value + onChange). Uncontrolled components let the DOM own it (ref + defaultValue). Choosing correctly affects form complexity, validation timing, and performance.',
      keyPoints: [
        'Controlled: React state is the single source of truth — value and onChange are always paired',
        'Uncontrolled: DOM owns the value — use useRef to read it when needed (on submit)',
        'defaultValue sets initial DOM value for uncontrolled inputs — value makes it controlled',
        'Controlled is better when: you need real-time validation, conditional disabling, or derived state from input',
        'Uncontrolled is better when: you just need the value on submit, or integrating with non-React libraries',
        'useImperativeHandle customizes the ref handle exposed to parent components — useful for uncontrolled components with imperative APIs',
        'React Hook Form uses uncontrolled components by default for better performance — fewer re-renders than controlled',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Controlled vs uncontrolled',
          code: `// Controlled: React owns the state
function ControlledInput() {
  const [value, setValue] = useState('')
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

// Uncontrolled: DOM owns the state
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  const handleSubmit = () => {
    console.log(inputRef.current?.value)
  }
  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="initial" />
    </form>
  )
}`,
        },
        {
          language: 'tsx',
          label: 'useImperativeHandle',
          code: `import { forwardRef, useImperativeHandle, useRef } from 'react'

interface CustomInputHandle {
  focus: () => void
  clear: () => void
}

const CustomInput = forwardRef<CustomInputHandle>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) inputRef.current.value = ''
    },
  }))

  return <input ref={inputRef} {...props} />
})

// Parent can call ref.current.focus() and ref.current.clear()`,
        },
      ],
      useCases: [
        'Forms with real-time validation — controlled for instant feedback',
        'File inputs — always uncontrolled (value is read-only for security)',
        'Third-party library integration (jQuery plugins, D3) — uncontrolled avoids fighting React',
        'Large forms with many fields — uncontrolled (React Hook Form) reduces re-renders',
      ],
      commonPitfalls: [
        'Switching between controlled and uncontrolled (value → defaultValue) — React warns and behavior is undefined',
        'Setting value without onChange handler — creates a read-only input that React warns about',
        'Using ref to read controlled input value — unnecessary, you already have it in state',
        'Forgetting that file inputs are always uncontrolled',
      ],
      interviewTips: [
        'Controlled = React state, Uncontrolled = DOM state. Know when to use each.',
        'Explain the performance trade-off: controlled re-renders on every keystroke, uncontrolled does not',
        'Mention React Hook Form as a production example of uncontrolled-first design',
        'Describe useImperativeHandle as the escape hatch for exposing imperative methods via ref',
      ],
      relatedConcepts: [
        'hooks-deep-dive',
        'react-testing-library',
        'common-testing-patterns',
      ],
      difficulty: 'beginner',
      tags: ['react', 'forms', 'controlled', 'uncontrolled', 'ref'],
    },
    {
      id: 'error-boundaries',
      title: 'Error Boundaries',
      description:
        'Error boundaries catch JavaScript errors in their child component tree, log them, and display a fallback UI instead of crashing the entire application. They are the React equivalent of try/catch for the component tree.',
      keyPoints: [
        'Error boundaries must be class components — there is no hook equivalent (getDerivedStateFromError and componentDidCatch are class-only)',
        'getDerivedStateFromError returns new state to render fallback UI — called during render phase',
        'componentDidCatch receives the error and info (componentStack) — called during commit phase, use for logging',
        'Error boundaries do NOT catch: event handlers, async code, SSR errors, or errors in the boundary itself',
        'Granularity strategy: wrap routes/pages at a coarse level, wrap critical interactive sections at a fine level',
        'React 19 adds onError and onCaughtError callbacks to createRoot for global error handling',
        'Use react-error-boundary library for a functional API with useErrorBoundary hook',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Error boundary with retry',
          code: `import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error: Error | null }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Send to error tracking service
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert">
          <h2>Something went wrong</h2>
          <pre>{this.state.error?.message}</pre>
          <button onClick={this.handleRetry}>Try again</button>
        </div>
      )
    }
    return this.props.children
  }
}

// Usage: wrap at route level and around critical sections
// <ErrorBoundary fallback={<PageError />}>
//   <Route path="/dashboard" element={<Dashboard />} />
// </ErrorBoundary>`,
        },
      ],
      useCases: [
        'Route-level error containment — one broken page does not crash the entire app',
        'Widget isolation in dashboards — one failing chart does not take down the dashboard',
        'Third-party component sandboxing — untrusted components cannot crash your app',
        'Graceful degradation with retry buttons',
      ],
      commonPitfalls: [
        'Expecting error boundaries to catch event handler errors — they do not; use try/catch in handlers',
        'Putting one boundary at the root and nothing else — too coarse, entire app shows error for one broken widget',
        'Forgetting that async errors (promises) are not caught — handle those with .catch() or Suspense error handling',
        'Not logging errors in componentDidCatch — you lose production debugging capability',
      ],
      interviewTips: [
        'Know what error boundaries catch and do not catch (render/lifecycle only, not events/async)',
        'Explain the granularity trade-off: coarse boundaries lose context, fine boundaries add complexity',
        'Mention the react-error-boundary library for a hooks-friendly API',
        'Discuss React 19 improvements: createRoot error callbacks',
      ],
      relatedConcepts: [
        'suspense-concurrent',
        'react-reconciliation',
        'react-19-features',
      ],
      difficulty: 'intermediate',
      tags: ['react', 'error-handling', 'error-boundary', 'resilience'],
    },
    {
      id: 'portals',
      title: 'React Portals',
      description:
        'Portals render children into a DOM node outside the parent component\'s DOM hierarchy while preserving React\'s event bubbling and context. Essential for modals, tooltips, dropdowns, and anything that needs to "escape" its container.',
      keyPoints: [
        'createPortal(children, domNode) renders children into domNode regardless of where the component lives in the React tree',
        'Event bubbling follows the React tree, not the DOM tree — a click inside a portal bubbles to the React parent, not the DOM parent',
        'Context is preserved — portals can access Context from their React ancestors even though they live elsewhere in the DOM',
        'Common targets: document.body for modals, a dedicated #portal-root div for better control',
        'Portals solve z-index and overflow:hidden issues — the rendered content is outside the clipping container',
        'Always clean up portal mount nodes to prevent memory leaks',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Modal via portal',
          code: `import { createPortal } from 'react-dom'
import { useEffect, useRef, type ReactNode } from 'react'

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const elRef = useRef<HTMLDivElement | null>(null)
  if (!elRef.current) {
    elRef.current = document.createElement('div')
  }

  useEffect(() => {
    const el = elRef.current!
    document.body.appendChild(el)
    return () => { document.body.removeChild(el) }
  }, [])

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    elRef.current,
  )
}

// Event bubbling follows React tree:
// <div onClick={handleClick}>       ← catches portal click events!
//   <Modal>clicked inside</Modal>
// </div>`,
        },
      ],
      useCases: [
        'Modals and dialogs — render on top of everything, escape overflow:hidden',
        'Tooltips and popovers — position relative to viewport, not parent',
        'Toast notifications — render into a fixed notification area',
        'Dropdown menus that need to overflow their scroll container',
      ],
      commonPitfalls: [
        'Forgetting that events bubble through the React tree — a portal click can trigger parent handlers unexpectedly',
        'Not cleaning up the DOM node on unmount — causes memory leaks',
        'Z-index conflicts when multiple portals stack — use a portal manager or stack order',
        'Accessibility: portals break tab order — manually manage focus trapping for modals',
      ],
      interviewTips: [
        'Key insight: React event bubbling follows the React tree, not the DOM tree',
        'Explain the overflow:hidden problem that portals solve',
        'Mention that Context works through portals — they are part of the React tree',
        'Discuss focus management and accessibility requirements for portal-based modals',
      ],
      relatedConcepts: [
        'error-boundaries',
        'hooks-deep-dive',
      ],
      difficulty: 'intermediate',
      tags: ['react', 'portals', 'modal', 'dom', 'composition'],
    },
    {
      id: 'context-performance',
      title: 'Context Performance',
      description:
        'React Context triggers re-renders in ALL consumers when the context value changes — even if the consumer only reads a slice of the value. Understanding this is critical for avoiding performance cliffs in large applications.',
      keyPoints: [
        'When Context value changes (by reference), every useContext consumer re-renders — there is no selector or partial subscription',
        'Putting an object with multiple fields in one Context means changing any field re-renders all consumers',
        'Split contexts by update frequency: AuthContext (rarely changes) vs ThemeContext (changes on toggle) vs FilterContext (changes on every keystroke)',
        'Wrap Context.Provider value in useMemo to prevent re-renders when the parent re-renders but the value has not changed',
        'For high-frequency updates (form state, animation), Context is wrong — use Zustand, Jotai, or signals',
        'React.memo on consumers does NOT help — Context bypasses memo and forces re-render',
        'Zustand/Jotai solve this with selector-based subscriptions: components only re-render when their selected slice changes',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Context splitting and memoization',
          code: `// BAD: one mega-context — every consumer re-renders on any change
const AppContext = createContext({ user: null, theme: 'light', locale: 'en' })

// GOOD: split by update frequency
const AuthContext = createContext<AuthState | null>(null)
const ThemeContext = createContext<'light' | 'dark'>('light')

// GOOD: memoize provider value
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Without useMemo, a new object is created every render
  // and ALL consumers re-render even if user hasn't changed
  const value = useMemo(() => ({ user, setUser }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ALTERNATIVE: Zustand for selector-based subscriptions
import { create } from 'zustand'

const useStore = create<{ count: number; name: string }>((set) => ({
  count: 0,
  name: 'World',
}))

// Only re-renders when count changes, ignores name changes
function Counter() {
  const count = useStore((state) => state.count)
  return <div>{count}</div>
}`,
        },
      ],
      useCases: [
        'Authentication state shared across the app — low-frequency, Context is fine',
        'Theme/locale — low-frequency, Context is fine',
        'Form state — high-frequency, use Zustand/Jotai or React Hook Form',
        'Real-time data (WebSocket messages, animations) — never use Context, use external stores',
      ],
      commonPitfalls: [
        'Mega-context with everything — a single God context that re-renders the entire app on any change',
        'Forgetting useMemo on provider value — parent re-render creates new object, all consumers re-render',
        'Using Context for high-frequency state (search input, slider) — causes cascade re-renders',
        'Trying to use React.memo to prevent context-triggered re-renders — it does not work',
      ],
      interviewTips: [
        'Explain why Context does not have selectors: the subscription model re-renders all consumers on any value change',
        'Compare Context with Zustand: Context = re-render all, Zustand = re-render only affected selectors',
        'Mention the splitting strategy: separate contexts by update frequency',
        'Know that React team has discussed adding selectors (useContextSelector) but it is not shipped',
      ],
      relatedConcepts: [
        'react-reconciliation',
        'memo-usememo-usecallback',
        'zustand',
        'jotai',
      ],
      difficulty: 'advanced',
      tags: ['react', 'context', 'performance', 'state-management', 're-renders'],
      proTip:
        'A quick litmus test: if the context value changes more than once per second, do not use Context. Use Zustand with selectors or Jotai atoms instead. Context is a dependency injection mechanism, not a state management solution.',
    },
    {
      id: 'react-19-features',
      title: 'React 19 Features',
      description:
        'React 19 brings the compiler (React Forget), the use() hook, Actions, useOptimistic, useFormStatus, and ref-as-prop. These changes reduce boilerplate and shift performance optimization from manual to automatic.',
      keyPoints: [
        'React Compiler (React Forget) auto-memoizes components and hooks — no more manual React.memo/useMemo/useCallback',
        'use() hook reads promises and contexts inline — replaces useEffect-based data fetching patterns',
        'Actions: async functions passed to form action prop — handle pending/error/optimistic state automatically',
        'useOptimistic provides instant UI feedback while async action is pending — rolls back on failure',
        'useFormStatus lets child components read the pending/data state of a parent <form> action without prop drilling',
        'ref is now a regular prop on function components — no more forwardRef wrapper needed',
        'useActionState (renamed from useFormState) manages form action state with automatic pending tracking',
        'Document metadata: <title>, <meta>, <link> in components hoist to <head> automatically',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Actions with useOptimistic',
          code: `import { useOptimistic, useActionState } from 'react'

interface Todo {
  id: string
  text: string
  completed: boolean
}

function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (state: Todo[], newTodo: Todo) => [...state, newTodo],
  )

  async function addTodoAction(formData: FormData) {
    const text = formData.get('text') as string
    const tempTodo: Todo = { id: crypto.randomUUID(), text, completed: false }

    // Show immediately in UI
    addOptimistic(tempTodo)

    // Actually persist — if this fails, optimistic state rolls back
    await saveTodo(tempTodo)
  }

  return (
    <div>
      <form action={addTodoAction}>
        <input name="text" required />
        <SubmitButton />
      </form>
      <ul>
        {optimisticTodos.map((t) => (
          <li key={t.id}>{t.text}</li>
        ))}
      </ul>
    </div>
  )
}

// useFormStatus reads parent form's pending state
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add Todo'}
    </button>
  )
}`,
        },
        {
          language: 'tsx',
          label: 'use() hook and ref as prop',
          code: `import { use } from 'react'

// use() reads a promise — works with Suspense
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise) // suspends until resolved
  return <div>{user.name}</div>
}

// use() reads context — alternative to useContext
function ThemedButton() {
  const theme = use(ThemeContext) // same as useContext(ThemeContext)
  return <button className={theme}>Click</button>
}

// ref is now a regular prop — no forwardRef needed (React 19)
function Input({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />
}`,
        },
      ],
      useCases: [
        'Form handling with automatic pending states — Actions eliminate manual isLoading state',
        'Optimistic UI patterns — instant feedback without complex state management',
        'Auto-memoization via compiler — remove all manual React.memo/useMemo in compiler-enabled projects',
        'Simplified ref forwarding — ref as prop eliminates the forwardRef boilerplate',
      ],
      commonPitfalls: [
        'Assuming the compiler removes all performance issues — it memoizes, but it cannot fix fundamentally slow algorithms',
        'Using use() outside of Suspense — it will throw an unhandled promise rejection',
        'Mixing old useFormState (deprecated) with new useActionState — check the React version',
        'Not wrapping form action functions in server actions when using Next.js — they run on the client by default',
      ],
      interviewTips: [
        'Explain the compiler: it analyzes component dependencies and auto-inserts memoization at build time',
        'Walk through an Actions flow: form action → useOptimistic → server call → revalidation',
        'Compare use() with useEffect for data: use() integrates with Suspense, useEffect requires manual loading states',
        'Mention that ref-as-prop eliminates one of the last reasons for forwardRef',
      ],
      relatedConcepts: [
        'hooks-deep-dive',
        'suspense-concurrent',
        'react-server-components',
        'error-boundaries',
      ],
      difficulty: 'advanced',
      tags: ['react', 'react-19', 'compiler', 'actions', 'optimistic-ui'],
      proTip:
        'The React Compiler is the biggest shift since hooks. Once your project adopts it, you can safely remove all React.memo, useMemo, and useCallback calls — the compiler handles memoization decisions better than humans. Check the compiler playground to see what it generates.',
    },
  ],
}
