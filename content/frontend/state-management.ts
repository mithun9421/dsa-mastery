// @ts-nocheck
import type { Category } from '@/lib/types'

export const stateManagementCategory: Category = {
  id: 'state-management',
  title: 'State Management',
  description:
    'From Redux Toolkit to atomic state with Jotai, server state with TanStack Query, and the art of knowing what belongs where. Every state library makes trade-offs — understand them.',
  icon: 'Database',
  concepts: [
    {
      id: 'redux-toolkit',
      title: 'Redux Toolkit (RTK)',
      description:
        'Redux Toolkit is the official, opinionated toolset for Redux. It eliminates boilerplate with createSlice, handles async logic with createAsyncThunk, and replaces most data fetching patterns with RTK Query.',
      keyPoints: [
        'createSlice generates action creators and reducer from a single object — uses Immer under the hood so you "mutate" draft state safely',
        'createAsyncThunk handles pending/fulfilled/rejected lifecycle for async operations — generates three action types automatically',
        'RTK Query (createApi) is a data fetching and caching layer built into RTK — replaces Redux Saga for most data fetching patterns',
        'RTK Query features: automatic caching, deduplication, polling, optimistic updates, cache invalidation via tags, code generation from OpenAPI specs',
        'createSelector (re-exported from Reselect) memoizes derived state — recomputes only when input selectors return new values',
        'Redux DevTools integration: time-travel debugging, action replay, state diff — the best debugging experience in the React ecosystem',
        'When to use Redux: large team needing strict unidirectional data flow, complex state transitions, or when DevTools time-travel is critical',
        'When NOT to use Redux: simple apps, server state only (use React Query), or when the boilerplate cost exceeds the coordination benefit',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'createSlice with Immer',
          code: `import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface Todo {
  id: string
  text: string
  completed: boolean
}

interface TodosState {
  items: Todo[]
  filter: 'all' | 'active' | 'completed'
}

const initialState: TodosState = { items: [], filter: 'all' }

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // Immer lets you "mutate" — it produces an immutable update behind the scenes
    addTodo(state, action: PayloadAction<{ id: string; text: string }>) {
      state.items.push({ ...action.payload, completed: false })
    },
    toggleTodo(state, action: PayloadAction<string>) {
      const todo = state.items.find((t) => t.id === action.payload)
      if (todo) todo.completed = !todo.completed
    },
    setFilter(state, action: PayloadAction<TodosState['filter']>) {
      state.filter = action.payload
    },
  },
})

export const { addTodo, toggleTodo, setFilter } = todosSlice.actions
export default todosSlice.reducer`,
        },
        {
          language: 'typescript',
          label: 'RTK Query API definition',
          code: `import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface User { id: string; name: string; email: string }

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    addUser: builder.mutation<User, Omit<User, 'id'>>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['User'], // auto-refetches getUsers
    }),
  }),
})

// Auto-generated hooks
export const { useGetUsersQuery, useAddUserMutation } = usersApi`,
        },
      ],
      useCases: [
        'Large enterprise applications with many developers — Redux enforces predictable patterns',
        'Complex state machines with many transitions — reducer pattern makes transitions explicit',
        'Apps requiring time-travel debugging for QA or reproducing bugs',
        'When you need RTK Query for automatic cache management with tag-based invalidation',
      ],
      commonPitfalls: [
        'Putting server state in Redux when React Query/RTK Query handles it better with less code',
        'Not using createSelector for derived data — recomputing filtered lists on every render',
        'Over-normalizing state when the app is simple — adds complexity without proportional benefit',
        'Using Redux for form state — forms change on every keystroke, Redux DevTools fills with noise',
      ],
      interviewTips: [
        'Know that RTK uses Immer — you can explain how "mutation" syntax produces immutable updates',
        'Compare RTK Query with React Query: RTK Query lives in Redux store, React Query is standalone',
        'Explain createSelector memoization: input selectors → memoized output selector',
        'Discuss when Redux is overkill: if your only state is server data, React Query is simpler',
      ],
      relatedConcepts: [
        'zustand',
        'tanstack-query',
        'server-vs-client-state',
        'context-antipatterns',
      ],
      difficulty: 'intermediate',
      tags: ['redux', 'rtk', 'state-management', 'rtk-query', 'immer'],
    },
    {
      id: 'zustand',
      title: 'Zustand',
      description:
        'Zustand is a minimal state management library with a hooks-based API. No providers, no boilerplate, just a store function and selectors. It solves the Context re-render problem with selector-based subscriptions.',
      keyPoints: [
        'create() returns a hook — call it with a selector to subscribe to only the slice you need',
        'No Provider wrapper needed — stores are module-level singletons accessed via hooks',
        'Selector-based subscriptions: useStore(state => state.count) only re-renders when count changes',
        'Middleware: persist (localStorage/sessionStorage), devtools (Redux DevTools), immer (mutation syntax)',
        'Slice pattern for large stores: split state and actions into separate slices, combine with spread',
        'Works outside React (store.getState(), store.subscribe()) — useful for non-React code or tests',
        'Prefer Zustand over Redux when: you want less boilerplate, do not need middleware ecosystem, or have a smaller team',
        'Zustand vs Context: Zustand has selectors (partial subscription), Context re-renders all consumers',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Zustand store with middleware',
          code: `import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface BearStore {
  bears: number
  fishes: number
  addBear: () => void
  addFish: () => void
  reset: () => void
}

export const useBearStore = create<BearStore>()(
  devtools(
    persist(
      immer((set) => ({
        bears: 0,
        fishes: 0,
        addBear: () => set((state) => { state.bears += 1 }),
        addFish: () => set((state) => { state.fishes += 1 }),
        reset: () => set({ bears: 0, fishes: 0 }),
      })),
      { name: 'bear-store' }, // localStorage key
    ),
  ),
)

// Component — only re-renders when bears changes
function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  return <div>{bears} bears</div>
}

// Outside React
const currentBears = useBearStore.getState().bears`,
        },
        {
          language: 'typescript',
          label: 'Slice pattern for large stores',
          code: `import { create, type StateCreator } from 'zustand'

interface AuthSlice {
  user: { id: string; name: string } | null
  login: (user: { id: string; name: string }) => void
  logout: () => void
}

interface UISlice {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

const createAuthSlice: StateCreator<AuthSlice & UISlice, [], [], AuthSlice> = (set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
})

const createUISlice: StateCreator<AuthSlice & UISlice, [], [], UISlice> = (set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
})

export const useAppStore = create<AuthSlice & UISlice>()((...args) => ({
  ...createAuthSlice(...args),
  ...createUISlice(...args),
}))`,
        },
      ],
      useCases: [
        'Client-side state that multiple components share — user preferences, UI state, feature flags',
        'Replacing Context for high-frequency state — search filters, form state across components',
        'State that needs to be accessed outside React — WebSocket handlers, service workers',
        'Persisted state with localStorage/sessionStorage — user settings, draft content',
      ],
      commonPitfalls: [
        'Not using selectors — useStore() without a selector subscribes to the entire store and re-renders on any change',
        'Creating a new selector function inline — use useShallow or a stable reference for object selectors',
        'Mutating state directly instead of using set() — Zustand detects changes via Object.is on the top-level result of set()',
        'Using one mega-store for everything — split into domain-specific stores for clarity',
      ],
      interviewTips: [
        'Key advantage over Context: selector-based subscriptions prevent unnecessary re-renders',
        'Compare with Redux: Zustand is ~1KB, no providers, less boilerplate, but also less structure/tooling',
        'Explain the middleware composition: create()(devtools(persist(immer(fn))))',
        'Mention that Zustand works outside React — getState()/subscribe() for vanilla JS',
      ],
      relatedConcepts: [
        'context-performance',
        'jotai',
        'redux-toolkit',
        'server-vs-client-state',
      ],
      difficulty: 'intermediate',
      tags: ['zustand', 'state-management', 'hooks', 'selectors'],
      proTip:
        'Use useShallow from zustand/react/shallow when selecting multiple fields: useStore(useShallow(s => ({ a: s.a, b: s.b }))). Without it, a new object is created every render and the shallow equality check fails, causing unnecessary re-renders.',
    },
    {
      id: 'jotai',
      title: 'Jotai',
      description:
        'Jotai is an atomic state management library inspired by Recoil. Each piece of state is an "atom" — a minimal, independent unit. Components subscribe to individual atoms, so only the atoms they read trigger re-renders.',
      keyPoints: [
        'atom() creates a minimal state unit — similar to useState but shareable across components without Context',
        'Derived atoms compute values from other atoms — like createSelector but reactive and declarative',
        'Async atoms handle promises natively — they integrate with Suspense for loading states',
        'atomWithStorage persists to localStorage/sessionStorage with automatic sync across tabs',
        'Jotai atoms are bottom-up (compose small atoms into bigger ones), unlike Redux which is top-down (one big store)',
        'No Provider needed for basic usage — atoms use a default store. Provider is optional for testing or multiple stores',
        'Comparison with Recoil: Jotai has a simpler API, smaller bundle, no string keys, and is actively maintained',
        'Best for: component-local state that needs to be shared, form state, feature flags, derived computations',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Primitive, derived, and async atoms',
          code: `import { atom, useAtom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Primitive atom
const countAtom = atom(0)

// Derived atom (read-only) — recomputes when countAtom changes
const doubleCountAtom = atom((get) => get(countAtom) * 2)

// Writable derived atom
const countWithMinAtom = atom(
  (get) => get(countAtom),
  (get, set, newValue: number) => {
    set(countAtom, Math.max(0, newValue)) // enforce minimum 0
  },
)

// Async atom — integrates with Suspense
const userAtom = atom(async () => {
  const res = await fetch('/api/user')
  return res.json() as Promise<{ id: string; name: string }>
})

// Persisted atom — syncs with localStorage
const themeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light')

// Usage
function Counter() {
  const [count, setCount] = useAtom(countAtom)
  const doubled = useAtomValue(doubleCountAtom) // read-only
  return (
    <div>
      <span>{count} (doubled: {doubled})</span>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  )
}`,
        },
      ],
      useCases: [
        'Shared component state without Context providers — feature flags, UI toggles',
        'Derived computations that depend on multiple state sources',
        'Form state atoms that individual fields subscribe to independently',
        'Persisted user preferences with atomWithStorage',
      ],
      commonPitfalls: [
        'Creating atoms inside components — atoms should be module-level constants, not created per render',
        'Not understanding atom identity — each atom() call creates a unique atom, even with the same initial value',
        'Overusing derived atoms for trivial computations — inline computation during render is fine for simple cases',
        'Forgetting that async atoms require Suspense boundaries — they throw promises when loading',
      ],
      interviewTips: [
        'Explain the atomic model: each atom is an independent subscription unit, unlike Redux where the whole store is one unit',
        'Compare with Zustand: Zustand is one store with selectors, Jotai is many atoms with composition',
        'Mention the Recoil comparison: Jotai is simpler (no string keys, no RecoilRoot required), smaller, and actively maintained',
        'Discuss bottom-up vs top-down: Jotai composes small atoms, Redux decomposes one big state',
      ],
      relatedConcepts: [
        'zustand',
        'context-performance',
        'server-vs-client-state',
      ],
      difficulty: 'intermediate',
      tags: ['jotai', 'atomic', 'state-management', 'recoil'],
      proTip:
        'Think of Jotai atoms like React useState that works across components. Start with primitive atoms for each independent piece of state, then compose derived atoms for computed values. If you find yourself reaching for useEffect to sync state between atoms, you probably need a derived atom instead.',
    },
    {
      id: 'xstate',
      title: 'XState',
      description:
        'XState implements finite state machines and statecharts in JavaScript. When your component has states that should never coexist (loading AND error) or transitions that depend on guards, XState makes impossible states impossible.',
      keyPoints: [
        'State machines define a finite set of states and valid transitions — if a transition is not defined, it cannot happen',
        'Statecharts extend state machines with: nested states, parallel states, guards (conditions), actions (side effects), and services (async)',
        'Guards are boolean conditions that must be true for a transition to occur — replaces scattered if/else logic',
        'Actions fire on transitions (not in states) — entry actions, exit actions, and transition actions',
        'Services handle async operations — invoke a promise, callback, or observable from a state',
        'XState Visualizer (stately.ai/viz) renders your machine as a visual diagram — invaluable for design reviews',
        'When to use: multi-step forms, authentication flows, complex UI states (upload: idle → selecting → uploading → success/error)',
        'When NOT to use: simple boolean toggles, server data caching (use React Query), or when the learning curve outweighs complexity',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'File upload state machine',
          code: `import { createMachine, assign } from 'xstate'
import { useMachine } from '@xstate/react'

interface UploadContext {
  file: File | null
  progress: number
  error: string | null
}

type UploadEvent =
  | { type: 'SELECT_FILE'; file: File }
  | { type: 'UPLOAD' }
  | { type: 'PROGRESS'; value: number }
  | { type: 'CANCEL' }
  | { type: 'RETRY' }

const uploadMachine = createMachine({
  id: 'upload',
  initial: 'idle',
  context: { file: null, progress: 0, error: null } as UploadContext,
  states: {
    idle: {
      on: {
        SELECT_FILE: {
          target: 'selected',
          actions: assign({ file: (_, event) => event.file }),
        },
      },
    },
    selected: {
      on: {
        UPLOAD: { target: 'uploading', guard: 'hasFile' },
        SELECT_FILE: {
          actions: assign({ file: (_, event) => event.file }),
        },
      },
    },
    uploading: {
      on: {
        PROGRESS: { actions: assign({ progress: (_, event) => event.value }) },
        CANCEL: { target: 'idle', actions: assign({ file: null, progress: 0 }) },
      },
      invoke: {
        src: 'uploadFile',
        onDone: 'success',
        onError: {
          target: 'error',
          actions: assign({ error: (_, event) => event.data.message }),
        },
      },
    },
    success: { type: 'final' },
    error: {
      on: {
        RETRY: { target: 'uploading', actions: assign({ error: null, progress: 0 }) },
      },
    },
  },
})

// In component
function FileUpload() {
  const [state, send] = useMachine(uploadMachine)

  // state.value is 'idle' | 'selected' | 'uploading' | 'success' | 'error'
  // No impossible states: cannot be uploading AND idle simultaneously
}`,
        },
      ],
      useCases: [
        'Multi-step forms/wizards — states define which step is active, transitions enforce order',
        'Authentication flows — idle → authenticating → authenticated/error, with token refresh sub-states',
        'File upload with progress, cancel, and retry — impossible states are actually impossible',
        'Complex UI interactions — drag-and-drop, multi-select, undo/redo with clear state transitions',
      ],
      commonPitfalls: [
        'Using XState for simple boolean state — useState(false) is fine, you do not need a state machine for a toggle',
        'Not using the visualizer — the main benefit of XState is that machines are visual and reviewable',
        'Putting too much logic in actions instead of guards — guards make transitions conditional and explicit',
        'Overcomplicating by modeling every UI detail as a state — focus on the states that matter for correctness',
      ],
      interviewTips: [
        'Key insight: state machines make impossible states impossible — if there is no transition, it cannot happen',
        'Compare with useReducer: both use actions/transitions, but XState enforces valid state combinations',
        'Mention the visualizer as a design tool — non-engineers can review the flow',
        'Discuss when it is overkill: if you can represent the state with a boolean or enum, you do not need XState',
      ],
      relatedConcepts: [
        'redux-toolkit',
        'hooks-deep-dive',
        'discriminated-unions',
      ],
      difficulty: 'advanced',
      tags: ['xstate', 'state-machine', 'statechart', 'state-management'],
      proTip:
        'Before writing XState code, sketch the machine on paper or in the Stately editor (stately.ai). If you cannot draw the states and transitions clearly, you do not understand the problem well enough to code it. The diagram IS the specification.',
    },
    {
      id: 'tanstack-query',
      title: 'TanStack Query (React Query)',
      description:
        'TanStack Query is a server state management library that handles fetching, caching, synchronization, and updates. It replaces the manual useEffect + useState + isLoading + isError pattern with a declarative, cache-first approach.',
      keyPoints: [
        'Query keys are the cache identity — same key = same cached data, different key = new fetch',
        'Stale-while-revalidate: return cached data immediately (stale), then refetch in the background (revalidate)',
        'Background refetch triggers: window focus, network reconnection, interval polling, query invalidation',
        'Mutations (useMutation) handle create/update/delete with onSuccess callbacks for cache invalidation',
        'Optimistic updates: update the cache before the server responds, roll back on error',
        'Query invalidation: queryClient.invalidateQueries({ queryKey: ["todos"] }) marks cache as stale and triggers refetch',
        'Infinite queries (useInfiniteQuery) handle paginated/cursor-based APIs with getNextPageParam',
        'Parallel queries: multiple useQuery hooks in one component fetch independently and concurrently',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Query with mutation and optimistic update',
          code: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Todo { id: string; text: string; completed: boolean }

function TodoApp() {
  const queryClient = useQueryClient()

  // Query: fetch with stale-while-revalidate
  const { data: todos, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then((r) => r.json()) as Promise<Todo[]>,
    staleTime: 5 * 60 * 1000, // 5 minutes before considered stale
  })

  // Mutation with optimistic update
  const addTodo = useMutation({
    mutationFn: (text: string) =>
      fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text }),
      }).then((r) => r.json()) as Promise<Todo>,

    // Optimistic update
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previous = queryClient.getQueryData<Todo[]>(['todos'])
      queryClient.setQueryData<Todo[]>(['todos'], (old) => [
        ...(old ?? []),
        { id: 'temp', text, completed: false },
      ])
      return { previous }
    },
    onError: (_err, _text, context) => {
      // Roll back on error
      queryClient.setQueryData(['todos'], context?.previous)
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {(error as Error).message}</div>

  return (
    <ul>
      {todos?.map((t) => <li key={t.id}>{t.text}</li>)}
    </ul>
  )
}`,
        },
      ],
      useCases: [
        'Any component that fetches data from an API — replaces useEffect + useState patterns',
        'Dashboard with multiple independent data sources — each useQuery fetches and caches independently',
        'Real-time data with polling — refetchInterval for live updates',
        'Infinite scroll / load more — useInfiniteQuery with cursor-based pagination',
      ],
      commonPitfalls: [
        'Not setting staleTime — default is 0 (always stale), which means refetch on every mount/focus',
        'Query key not matching data identity — stale data shown because key did not change when params did',
        'Manual cache manipulation without invalidation — leads to stale data that never refreshes',
        'Putting non-serializable values in query keys — functions or class instances break caching',
      ],
      interviewTips: [
        'Explain stale-while-revalidate: instant UI with cached data, background sync for freshness',
        'Walk through an optimistic update: onMutate (cache write) → onError (rollback) → onSettled (invalidate)',
        'Compare with RTK Query: React Query is standalone, RTK Query lives in Redux store',
        'Discuss query key design: ["todos", { filter: "active" }] includes filter as cache key',
      ],
      relatedConcepts: [
        'swr',
        'server-vs-client-state',
        'redux-toolkit',
        'context-antipatterns',
      ],
      difficulty: 'intermediate',
      tags: ['react-query', 'tanstack-query', 'server-state', 'caching', 'data-fetching'],
      proTip:
        'Set a global staleTime of 60 seconds (staleTime: 60_000 in QueryClient defaults). The default of 0 means every mount triggers a background refetch — this is usually too aggressive and wastes bandwidth. Tune staleTime per query based on how fresh the data needs to be.',
    },
    {
      id: 'swr',
      title: 'SWR',
      description:
        'SWR (stale-while-revalidate) by Vercel is a lightweight data fetching library with a similar philosophy to React Query but a simpler API. It focuses on the most common patterns and integrates naturally with Next.js.',
      keyPoints: [
        'useSWR(key, fetcher) — key is the cache identity, fetcher is the function that retrieves data',
        'Automatic revalidation on focus, reconnect, and interval — keeps data fresh without manual refetching',
        'Deduplication: multiple components using the same key share one request — no duplicate fetches',
        'Built-in error retry with exponential backoff',
        'Mutation with mutate() for local cache updates and revalidation',
        'Simpler API than React Query — fewer options, easier to learn, but also fewer features',
        'React Query advantages over SWR: devtools, infinite queries, mutations API, optimistic updates, query invalidation by prefix',
        'SWR advantage: smaller bundle, simpler mental model, first-party Vercel/Next.js integration',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'SWR basic usage',
          code: `import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, mutate } = useSWR(
    \`/api/users/\${userId}\`,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 30_000, // poll every 30s
      dedupingInterval: 5_000, // dedup requests within 5s
    },
  )

  const updateName = async (name: string) => {
    // Optimistic update
    mutate({ ...data, name }, false) // false = don't revalidate yet
    await fetch(\`/api/users/\${userId}\`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    })
    mutate() // revalidate after server update
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading user</div>
  return <div>{data.name}</div>
}`,
        },
      ],
      useCases: [
        'Simple data fetching in Next.js applications — minimal setup, great DX',
        'Real-time dashboards with polling — refreshInterval for automatic updates',
        'Pages with many data-fetching components — deduplication prevents duplicate requests',
        'When you want the simplest possible data fetching library',
      ],
      commonPitfalls: [
        'Expecting the same feature set as React Query — SWR has fewer features (no infinite queries helper, no devtools)',
        'Not understanding deduplication — multiple useSWR with the same key are merged, not independent',
        'Mutating data without revalidation — leads to client/server divergence',
        'Using SWR for mutations — it is primarily a read/cache library, mutations are basic compared to React Query',
      ],
      interviewTips: [
        'Know the SWR name origin: HTTP cache strategy "stale-while-revalidate" (RFC 5861)',
        'Compare with React Query: SWR is simpler and smaller, React Query is more powerful and configurable',
        'Explain deduplication: same key = one network request shared across all consumers',
        'Mention Vercel/Next.js integration as SWR\'s main ecosystem advantage',
      ],
      relatedConcepts: [
        'tanstack-query',
        'server-vs-client-state',
        'react-server-components',
      ],
      difficulty: 'beginner',
      tags: ['swr', 'data-fetching', 'caching', 'vercel', 'next.js'],
    },
    {
      id: 'server-vs-client-state',
      title: 'Server State vs Client State',
      description:
        'The most common state management mistake is treating server data and client UI state the same way. They have fundamentally different lifetimes, ownership, and synchronization needs.',
      keyPoints: [
        'Server state: data owned by the server (users, todos, products) — you have a cached copy, not the source of truth',
        'Client state: data owned by the browser (is the modal open? which tab is selected? form input values) — no server involvement',
        'Server state libraries (React Query, SWR, RTK Query) handle caching, staleness, background sync, and deduplication',
        'Client state libraries (Zustand, Jotai, Context) handle UI state, user preferences, and transient interaction state',
        'URL is state too: query params (?filter=active&page=2), hash fragments, and pathname encode navigational state',
        'Form state is transient client state — it lives and dies with the form, does not belong in global stores',
        'Avoid duplicating server data into client stores — fetch from cache (React Query), do not copy into Redux',
        'The question to ask: "Who owns this data?" Server → server state lib. Browser → client state lib. URL → router.',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Separating state ownership',
          code: `// SERVER STATE: owned by the server, cached locally
// Use React Query — it handles caching, revalidation, and deduplication
const { data: todos } = useQuery({
  queryKey: ['todos', { filter }],
  queryFn: () => fetchTodos(filter),
})

// CLIENT STATE: owned by the browser, no server involvement
// Use Zustand or useState — simple, fast, no caching needed
const useSidebarStore = create<{ open: boolean; toggle: () => void }>((set) => ({
  open: true,
  toggle: () => set((s) => ({ open: !s.open })),
}))

// URL STATE: owned by the router, shareable via links
// Use Next.js router or URLSearchParams
const searchParams = useSearchParams()
const filter = searchParams.get('filter') ?? 'all'

// FORM STATE: transient, dies with the form
// Use React Hook Form or local useState — never put in global store
const { register, handleSubmit } = useForm<{ title: string }>()

// ANTI-PATTERN: duplicating server data into Redux
// Don't do: dispatch(setTodos(apiResponse)) — React Query already caches this`,
        },
      ],
      useCases: [
        'Architecture decisions in new projects — choose the right library for each state type',
        'Refactoring apps that put everything in Redux — extract server state to React Query',
        'Debugging stale data issues — usually caused by treating server state as client state',
        'Code reviews — check if state is in the right place',
      ],
      commonPitfalls: [
        'Putting API responses in Redux/Zustand — duplicates server state, cache becomes stale',
        'Using React Query for client-only state (modals, sidebar) — wrong tool, unnecessary complexity',
        'Not using URL state for shareable filters/pagination — users cannot bookmark or share state',
        'Treating form state as global state — forms are ephemeral, global stores are persistent',
      ],
      interviewTips: [
        'This is a system design question in disguise — classify state by ownership and lifetime',
        'Walk through the decision tree: who owns it (server/client/URL), how often it changes, who needs it',
        'Explain why duplicating server state is wrong: two sources of truth that will diverge',
        'Mention the URL as state: search params, pathname, hash — all linkable, bookmarkable state',
      ],
      relatedConcepts: [
        'tanstack-query',
        'zustand',
        'context-antipatterns',
        'redux-toolkit',
      ],
      difficulty: 'intermediate',
      tags: ['state-management', 'architecture', 'server-state', 'client-state'],
      proTip:
        'Run this audit on any React codebase: open Redux/Zustand stores and highlight every piece of data that came from an API response. That highlighted data should probably live in React Query instead. The store should only contain client-owned state like UI preferences and interaction state.',
    },
    {
      id: 'context-antipatterns',
      title: 'Context Antipatterns',
      description:
        'React Context is a dependency injection mechanism, not a state management solution. Using it as a global store creates performance problems and architectural confusion. Know when Context is right and when to reach for something else.',
      keyPoints: [
        'Antipattern: "God Context" with all app state — every consumer re-renders on any field change',
        'Antipattern: Context for high-frequency state (search input, slider values) — cascading re-renders',
        'Antipattern: Context as prop drilling "fix" when component composition would work — lift children, not state',
        'Prop drilling is not always bad — 2-3 levels of explicit props is clearer than hidden Context dependencies',
        'Component composition (children prop, render slots) eliminates many "prop drilling" complaints without any state library',
        'Context is correct for: infrequent state (theme, locale, auth), dependency injection (test doubles), and compound components',
        'For frequent updates: Zustand (selectors), Jotai (atoms), or signals-based libraries',
        'Performance rule of thumb: if the value changes more than once per second, do not use Context',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Component composition vs Context',
          code: `// PROBLEM: prop drilling user through 3 levels
function App() {
  const user = useUser()
  return <Layout user={user} />
}
function Layout({ user }) {
  return <Sidebar user={user} />
}
function Sidebar({ user }) {
  return <UserAvatar user={user} />
}

// SOLUTION A: Component composition (often better than Context!)
function App() {
  const user = useUser()
  return (
    <Layout sidebar={<Sidebar avatar={<UserAvatar user={user} />} />} />
  )
}
// Layout and Sidebar don't even know about user

// SOLUTION B: Context (when many distant components need the value)
const UserContext = createContext<User | null>(null)
function App() {
  const user = useUser()
  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  )
}
function UserAvatar() {
  const user = useContext(UserContext) // consumes directly
}

// ANTIPATTERN: Context for high-frequency state
// This re-renders EVERY consumer on every keystroke
const SearchContext = createContext({ query: '', setQuery: () => {} })
// FIX: Use Zustand with selector
const useSearchStore = create((set) => ({
  query: '',
  setQuery: (q: string) => set({ query: q }),
}))`,
        },
      ],
      useCases: [
        'Refactoring over-Contextualized codebases — replace with composition or external stores',
        'Code reviews — spot Context misuse before it causes performance problems',
        'Architecture planning — decide upfront what goes in Context vs external stores',
        'Performance debugging — trace re-renders to Context consumers',
      ],
      commonPitfalls: [
        'Reaching for Context before trying component composition — composition often eliminates the need entirely',
        'Putting form state in Context — forms change on every keystroke, Context re-renders all consumers',
        'Not measuring before optimizing — use React DevTools Profiler to confirm Context is the bottleneck',
        'Splitting Context too aggressively — 20 tiny contexts is also a maintenance problem',
      ],
      interviewTips: [
        'Explain Context as dependency injection, not state management — compare with Angular services or Spring DI',
        'Show the component composition alternative — many "prop drilling" complaints are solved by passing children',
        'Discuss the re-render behavior: no selectors, all consumers update on any change',
        'Know when Context IS right: theme, locale, auth, compound components — low-frequency, read-heavy state',
      ],
      relatedConcepts: [
        'context-performance',
        'zustand',
        'jotai',
        'compound-components',
      ],
      difficulty: 'intermediate',
      tags: ['react', 'context', 'antipatterns', 'architecture', 'performance'],
      proTip:
        'Before adding a Context, ask: "Would passing children work here?" Component composition is React\'s most underused pattern. If the intermediate components do not use the data — they just pass it through — restructure the tree so the data consumer is a direct child of the data provider.',
    },
  ],
}
