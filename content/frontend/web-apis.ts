// @ts-nocheck
import type { Category } from '@/lib/types'

export const webApisCategory: Category = {
  id: 'web-apis',
  title: 'Web APIs',
  description:
    'Browser APIs that every senior frontend developer should know — from Intersection Observer to Service Workers, WebRTC, and WebAssembly. These are the building blocks underneath your framework.',
  icon: 'Globe',
  concepts: [
    {
      id: 'intersection-observer',
      title: 'Intersection Observer',
      description:
        'Intersection Observer asynchronously detects when an element enters or exits the viewport (or a parent scroll container). It replaces scroll event listeners for lazy loading, infinite scroll, and analytics tracking — without layout thrashing.',
      keyPoints: [
        'The observer callback fires asynchronously when target elements cross the specified thresholds — no scroll event listener needed',
        'threshold option: array of visibility ratios (0 to 1) that trigger the callback. threshold: [0, 0.5, 1] fires at 0%, 50%, and 100% visibility',
        'rootMargin extends the detection zone beyond the viewport — "200px" starts loading images 200px before they scroll into view',
        'root option: use null for viewport (default) or a specific scroll container element',
        'Unobserve after use: for one-time triggers (lazy load), call observer.unobserve(entry.target) in the callback to avoid unnecessary future callbacks',
        'React pattern: create the observer in useEffect, observe in a ref callback, disconnect on cleanup',
        'Performance: one observer can watch many elements — more efficient than one scroll listener per element',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Lazy loading with Intersection Observer',
          code: `import { useEffect, useRef, useState } from 'react'

function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.unobserve(el) // one-time trigger
      }
    }, options)

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return { ref, isInView }
}

// Usage: lazy load a component when it scrolls into view
function LazySection() {
  const { ref, isInView } = useInView({ rootMargin: '200px' })

  return (
    <div ref={ref}>
      {isInView ? <ExpensiveChart /> : <ChartPlaceholder />}
    </div>
  )
}`,
        },
      ],
      useCases: [
        'Lazy loading images and components below the fold',
        'Infinite scroll — detect when sentinel element is visible, fetch next page',
        'Analytics impression tracking — report when a section becomes visible',
        'Sticky header show/hide — observe a sentinel to know when to pin the header',
      ],
      commonPitfalls: [
        'Not disconnecting the observer on component unmount — causes memory leaks',
        'Using scroll event + getBoundingClientRect instead — causes layout thrashing and janky scroll',
        'Setting threshold to [1] for lazy loading — element must be 100% visible before triggering, too late',
        'Forgetting rootMargin for preloading — without it, loading starts only when element is already visible',
      ],
      interviewTips: [
        'Explain why Intersection Observer is better than scroll events: async, no layout thrashing, browser-optimized',
        'Describe the threshold and rootMargin options with concrete examples',
        'Know the React hook pattern: useRef + useEffect + observer.disconnect',
        'Mention real-world uses: lazy loading (loading="lazy" uses this internally), infinite scroll, analytics',
      ],
      relatedConcepts: [
        'resize-observer',
        'mutation-observer',
        'virtualization',
        'image-optimization',
      ],
      difficulty: 'intermediate',
      tags: ['web-api', 'intersection-observer', 'lazy-loading', 'performance'],
    },
    {
      id: 'resize-observer',
      title: 'Resize Observer',
      description:
        'Resize Observer watches for changes to an element\'s dimensions, triggering a callback whenever the content or border box size changes. It enables responsive components that adapt to their container, not just the viewport.',
      keyPoints: [
        'Fires when an observed element\'s size changes — including initial observation',
        'Reports both content box and border box sizes via contentBoxSize and borderBoxSize',
        'Replaces window.addEventListener("resize") for element-level responsiveness — works even when viewport does not change',
        'Enables "container queries" in JavaScript — component adapts to its container width, not the viewport',
        'Callback batches observations — one callback per frame, not per element, preventing layout thrashing',
        'Use with React: observe in useLayoutEffect (need size before paint) or useEffect (size after paint)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'useElementSize hook',
          code: `import { useLayoutEffect, useRef, useState } from 'react'

interface Size { width: number; height: number }

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      const { inlineSize: width, blockSize: height } = entry.contentBoxSize[0]
      setSize({ width, height })
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, ...size }
}

// Usage: responsive component based on container, not viewport
function AdaptiveCard() {
  const { ref, width } = useElementSize<HTMLDivElement>()
  const layout = width > 600 ? 'horizontal' : 'vertical'

  return (
    <div ref={ref} className={layout}>
      <CardImage />
      <CardContent />
    </div>
  )
}`,
        },
      ],
      useCases: [
        'Responsive components that adapt to container width (dashboard widgets, reusable cards)',
        'Auto-resizing text areas that grow with content',
        'Chart/canvas components that redraw on resize',
        'Virtualized lists that need to know container height',
      ],
      commonPitfalls: [
        'Setting state inside ResizeObserver that causes the element to resize — infinite loop (resize → setState → re-render → resize)',
        'Using window resize event for element-level responsiveness — does not detect container changes from CSS/layout shifts',
        'Not cleaning up the observer — causes memory leaks and callbacks on unmounted components',
        'Over-reacting to every pixel change — debounce if the callback triggers expensive work',
      ],
      interviewTips: [
        'Compare with CSS container queries: ResizeObserver is JS-based (more flexible), container queries are CSS-based (simpler)',
        'Explain why window resize is insufficient: sidebar toggle, dynamic panels, and CSS changes affect element size without changing viewport',
        'Mention the loop protection: browsers limit ResizeObserver callbacks to prevent infinite loops',
      ],
      relatedConcepts: [
        'intersection-observer',
        'mutation-observer',
        'layout-thrashing',
      ],
      difficulty: 'intermediate',
      tags: ['web-api', 'resize-observer', 'responsive', 'layout'],
    },
    {
      id: 'mutation-observer',
      title: 'Mutation Observer',
      description:
        'Mutation Observer watches for changes to the DOM tree — element additions, removals, attribute changes, and text content changes. It is essential for integrating with non-React code that mutates the DOM directly.',
      keyPoints: [
        'Observes DOM mutations: childList (add/remove nodes), attributes (attribute changes), characterData (text changes)',
        'subtree: true watches the entire subtree, not just direct children',
        'Callbacks are batched — one callback with all mutations since the last callback, delivered as a MutationRecord array',
        'attributeFilter restricts observation to specific attributes — reduces noise and improves performance',
        'Critical to disconnect when done — MutationObservers that outlive their usefulness cause memory leaks and performance degradation',
        'Use cases: integrating third-party widgets, building browser extensions, implementing undo/redo',
        'In React apps, you rarely need MutationObserver — React manages the DOM. Use it only when interfacing with non-React code',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'MutationObserver for third-party integration',
          code: `import { useEffect, useRef } from 'react'

// Watch for when a third-party widget modifies the DOM
function useMutationObserver(
  callback: MutationCallback,
  options: MutationObserverInit = { childList: true, subtree: true },
) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new MutationObserver(callback)
    observer.observe(el, options)
    return () => observer.disconnect()
  }, [callback, options])

  return ref
}

// Usage: react to third-party widget DOM changes
function ThirdPartyWrapper() {
  const ref = useMutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        console.log('Widget added/removed nodes:', mutation.addedNodes.length)
      }
    }
  })

  return <div ref={ref} id="third-party-mount-point" />
}`,
        },
      ],
      useCases: [
        'Integrating third-party widgets that modify the DOM (chat widgets, ad embeds)',
        'Browser extensions that need to react to page content changes',
        'Building a visual editor that tracks DOM modifications for undo/redo',
        'Monitoring for dynamically injected content (analytics, A/B testing scripts)',
      ],
      commonPitfalls: [
        'Not disconnecting — outlived observers degrade performance as more mutations accumulate',
        'Observing too broadly (subtree on document.body) — fires on every DOM change in the entire page',
        'Mutating the DOM inside the callback — can cause infinite loops if the mutation triggers re-observation',
        'Using MutationObserver in React apps for React-managed DOM — unnecessary, React already tracks changes',
      ],
      interviewTips: [
        'Explain when MutationObserver is needed in React: only for non-React DOM mutations (third-party scripts, browser extensions)',
        'Compare with React\'s reconciliation: React diffs virtual DOM, MutationObserver watches real DOM',
        'Describe the batching behavior: one callback with an array of MutationRecords, not one callback per mutation',
      ],
      relatedConcepts: [
        'intersection-observer',
        'resize-observer',
        'react-reconciliation',
      ],
      difficulty: 'intermediate',
      tags: ['web-api', 'mutation-observer', 'dom', 'integration'],
    },
    {
      id: 'service-workers',
      title: 'Service Workers',
      description:
        'Service Workers are proxy scripts that sit between the browser and the network. They intercept fetch requests, manage caches, and enable offline functionality. They are the foundation of Progressive Web Apps (PWA).',
      keyPoints: [
        'Lifecycle: register → install (cache assets) → activate (clean old caches) → fetch (intercept requests)',
        'Service Workers run in a separate thread — no DOM access, communicate via postMessage',
        'Caching strategies: cache-first (offline-ready), network-first (fresh data), stale-while-revalidate (fast + fresh)',
        'Cache-first: check cache, return if found, else fetch and cache. Best for static assets (JS, CSS, images)',
        'Network-first: try network, fall back to cache on failure. Best for dynamic data (API responses)',
        'Stale-while-revalidate: return cache immediately, fetch in background and update cache. Best balance of speed and freshness',
        'Workbox library simplifies service worker development — precaching, runtime caching, routing, and strategies out of the box',
        'Background sync: queue failed requests (e.g., form submissions) and retry when connectivity returns',
        'Push notifications: receive server-initiated messages even when the app is closed',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Caching strategies with Workbox',
          code: `import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Precache build assets (versioned, cache-busted)
precacheAndRoute(self.__WB_MANIFEST)

// Static assets: cache-first (images, fonts)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  }),
)

// API calls: network-first with cache fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 }),
    ],
  }),
)

// App shell: stale-while-revalidate
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({ cacheName: 'pages' }),
)`,
        },
      ],
      useCases: [
        'Offline-first applications — cache critical resources for offline access',
        'Performance optimization — serve cached responses instantly while updating in the background',
        'Background sync — queue form submissions and API calls when offline, replay when connected',
        'Push notifications — engage users with server-initiated messages',
      ],
      commonPitfalls: [
        'Not versioning caches — old cache serves stale content forever. Use cache names with version numbers',
        'Caching everything — API responses with user-specific data should not be cached without invalidation strategy',
        'Not handling the activate event — old caches linger and consume storage',
        'Debugging difficulty — service workers persist across page reloads; use "Update on reload" in DevTools',
      ],
      interviewTips: [
        'Walk through the lifecycle: register → install (cache) → activate (cleanup) → fetch (intercept)',
        'Explain the three main caching strategies and when each is appropriate',
        'Describe how offline-first works: cache-first for shell, network-first for data, background sync for mutations',
        'Mention Workbox as the de facto library — you should not write raw service worker caching logic',
      ],
      relatedConcepts: [
        'cache-api',
        'web-workers',
        'broadcast-channel',
        'indexeddb',
      ],
      difficulty: 'advanced',
      tags: ['web-api', 'service-worker', 'pwa', 'caching', 'offline'],
      proTip:
        'Start with Workbox and its webpack/Vite plugin. Writing raw service workers is like writing raw SQL migrations — technically possible but error-prone. Workbox handles precaching, versioning, and strategy selection with a few lines of configuration.',
    },
    {
      id: 'indexeddb',
      title: 'IndexedDB',
      description:
        'IndexedDB is a transactional, key-value database in the browser. Unlike localStorage (5MB, synchronous, strings only), IndexedDB handles large structured data asynchronously with indexes and range queries.',
      keyPoints: [
        'Asynchronous API — all operations return via events/callbacks, never blocks the main thread',
        'Structured data: stores objects directly (no JSON.stringify/parse needed)',
        'Indexes enable efficient queries by non-primary-key fields (e.g., find all todos with status "active")',
        'Transactions are atomic: all operations in a transaction succeed or all fail — data integrity guaranteed',
        'IDBKeyRange enables range queries: all items with a date between X and Y',
        'Dexie.js is the standard wrapper — provides a Promise-based API that is dramatically simpler than raw IndexedDB',
        'Storage limit: roughly 50% of available disk space (much more than localStorage\'s 5MB)',
        'Comparison: localStorage (sync, 5MB, strings), sessionStorage (per-tab, 5MB), IndexedDB (async, huge, structured)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'IndexedDB with Dexie.js',
          code: `import Dexie, { type EntityTable } from 'dexie'

interface Todo {
  id?: number
  text: string
  completed: boolean
  createdAt: Date
}

// Define schema
const db = new Dexie('TodoApp') as Dexie & { todos: EntityTable<Todo, 'id'> }
db.version(1).stores({
  todos: '++id, completed, createdAt', // auto-increment id, indexes on completed and createdAt
})

// CRUD operations
async function addTodo(text: string) {
  await db.todos.add({ text, completed: false, createdAt: new Date() })
}

async function getActiveTodos() {
  return db.todos.where('completed').equals(0).sortBy('createdAt')
}

async function toggleTodo(id: number) {
  await db.todos.update(id, (todo) => {
    todo.completed = !todo.completed
  })
}

// Range query: todos from last 7 days
async function getRecentTodos() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return db.todos.where('createdAt').above(weekAgo).toArray()
}`,
        },
      ],
      useCases: [
        'Offline-first apps — store data locally, sync when online',
        'Large dataset caching — API responses too big for localStorage',
        'Draft/autosave — persist user work without server round-trips',
        'Client-side search indexes — store and query indexed data',
      ],
      commonPitfalls: [
        'Using raw IndexedDB API — it is callback-based and extremely verbose; always use Dexie or idb wrapper',
        'Not handling version upgrades — schema changes require version bumps and migration logic',
        'Assuming data persists forever — browsers may evict IndexedDB data under storage pressure (use navigator.storage.persist())',
        'Storing sensitive data without encryption — IndexedDB is readable by any script on the origin',
      ],
      interviewTips: [
        'Compare the three browser storage options: localStorage (simple, small), sessionStorage (per-tab), IndexedDB (structured, large)',
        'Explain why IndexedDB is async — it prevents blocking the main thread during large operations',
        'Describe a real use case: offline-first PWA that caches API data in IndexedDB and syncs via service worker',
        'Mention Dexie.js as the standard abstraction — nobody uses raw IndexedDB in production',
      ],
      relatedConcepts: [
        'service-workers',
        'cache-api',
        'web-workers',
      ],
      difficulty: 'intermediate',
      tags: ['web-api', 'indexeddb', 'storage', 'offline', 'database'],
    },
    {
      id: 'webrtc',
      title: 'WebRTC',
      description:
        'WebRTC enables real-time, peer-to-peer communication of audio, video, and data directly between browsers without a relay server. The connection setup requires a signaling server, but the actual media/data flows peer-to-peer.',
      keyPoints: [
        'RTCPeerConnection manages the peer connection — handles ICE candidates, codec negotiation, and media transport',
        'Signaling server: exchanges SDP offers/answers and ICE candidates between peers — can be WebSocket, HTTP polling, or any channel',
        'ICE (Interactive Connectivity Establishment) finds the best path between peers — tries direct, STUN (NAT traversal), then TURN (relay)',
        'STUN server: helps peers discover their public IP behind NAT — lightweight, used for most connections',
        'TURN server: relays traffic when direct/STUN fails (symmetric NAT, firewalls) — bandwidth-intensive, last resort',
        'Data channels (RTCDataChannel) send arbitrary data peer-to-peer — low latency, suitable for games and file transfer',
        'MediaStream API captures camera/microphone — getUserMedia() returns a stream you attach to a peer connection',
        'SFU (Selective Forwarding Unit) is used for multi-party calls — each peer sends to server, server forwards to others (not full mesh)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'WebRTC peer connection setup',
          code: `// Simplified WebRTC connection flow
const config: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:turn.example.com', username: 'user', credential: 'pass' },
  ],
}

async function createOffer(pc: RTCPeerConnection, signaling: WebSocket) {
  // 1. Create offer
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)

  // 2. Send offer via signaling server
  signaling.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }))

  // 3. Collect and send ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      signaling.send(JSON.stringify({ type: 'ice', candidate: event.candidate }))
    }
  }
}

async function handleOffer(
  pc: RTCPeerConnection,
  signaling: WebSocket,
  offer: RTCSessionDescriptionInit,
) {
  await pc.setRemoteDescription(offer)
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  signaling.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }))
}

// Data channel for arbitrary data
const dataChannel = pc.createDataChannel('chat')
dataChannel.onmessage = (event) => console.log('Received:', event.data)
dataChannel.send('Hello peer!')`,
        },
      ],
      useCases: [
        'Video/audio calls — peer-to-peer with low latency',
        'Screen sharing — getDisplayMedia() + peer connection',
        'Peer-to-peer file transfer — data channels for direct file sharing',
        'Real-time multiplayer games — low-latency data channels for game state',
      ],
      commonPitfalls: [
        'Not providing TURN servers — connections fail behind strict firewalls or symmetric NAT (~10-15% of users)',
        'Assuming peer-to-peer means no server — you always need a signaling server for connection setup',
        'Not handling disconnection/reconnection — network changes (wifi ↔ cellular) break connections',
        'Full mesh for multi-party — scales poorly beyond ~4 participants; use an SFU for larger groups',
      ],
      interviewTips: [
        'Walk through the connection flow: signaling → offer/answer exchange → ICE candidate exchange → peer connection established',
        'Explain STUN vs TURN: STUN discovers public IP (cheap), TURN relays traffic (expensive, fallback)',
        'Describe the SFU architecture for multi-party: peers send one stream to server, server forwards N streams',
        'Mention that WebRTC is UDP-based for low latency — unreliable by default, data channels can be configured as reliable',
      ],
      relatedConcepts: [
        'web-workers',
        'broadcast-channel',
        'service-workers',
      ],
      difficulty: 'expert',
      tags: ['web-api', 'webrtc', 'real-time', 'peer-to-peer', 'video'],
    },
    {
      id: 'cache-api',
      title: 'Cache API',
      description:
        'The Cache API provides programmatic control over HTTP response caching. Used primarily in Service Workers, it allows you to store request/response pairs with version control and explicit invalidation.',
      keyPoints: [
        'caches.open(name) opens or creates a named cache — use version names for cache busting',
        'cache.put(request, response) stores a response — you control exactly what gets cached',
        'cache.match(request) retrieves a cached response — returns undefined if not found',
        'cache.addAll(urls) fetches and caches multiple URLs atomically — all-or-nothing',
        'Workbox abstracts the Cache API with strategies (CacheFirst, NetworkFirst, StaleWhileRevalidate)',
        'Cache versioning: delete old caches in the service worker activate event to free storage',
        'The Cache API stores full HTTP responses — including headers, status code, and body',
        'Different from HTTP cache (browser-managed): Cache API gives you full control, HTTP cache is heuristic',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Cache API usage in service worker',
          code: `const CACHE_VERSION = 'v2'
const CACHE_NAME = \`app-cache-\${CACHE_VERSION}\`
const PRECACHE_URLS = ['/', '/styles.css', '/app.js', '/offline.html']

// Install: precache critical resources
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
})

// Activate: clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
})

// Fetch: stale-while-revalidate
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
      return cached ?? fetchPromise
    })
  )
})`,
        },
      ],
      useCases: [
        'Precaching critical app shell resources during service worker install',
        'Implementing custom caching strategies beyond what HTTP caching provides',
        'Offline fallback pages — cache an offline.html and serve when network is unavailable',
        'API response caching with controlled invalidation',
      ],
      commonPitfalls: [
        'Not versioning caches — old responses served indefinitely after code updates',
        'Forgetting to clone responses — a response body can only be consumed once; clone before caching',
        'Caching opaque responses (no-cors) — they always return status 0 and cannot be inspected',
        'Not cleaning up old caches in activate — storage accumulates across deployments',
      ],
      interviewTips: [
        'Explain the relationship: Service Worker intercepts fetch → checks Cache API → returns cached or fetches new',
        'Compare with HTTP cache: Cache API is explicit/programmatic, HTTP cache is implicit/heuristic',
        'Describe cache versioning and cleanup in the activate lifecycle',
        'Mention Workbox as the production abstraction over raw Cache API',
      ],
      relatedConcepts: [
        'service-workers',
        'indexeddb',
        'prefetching-preloading',
      ],
      difficulty: 'advanced',
      tags: ['web-api', 'cache-api', 'service-worker', 'offline', 'caching'],
    },
    {
      id: 'broadcast-channel',
      title: 'Broadcast Channel',
      description:
        'Broadcast Channel API enables communication between tabs, windows, and iframes of the same origin. It is a simple pub/sub system for cross-tab coordination.',
      keyPoints: [
        'new BroadcastChannel(name) creates or joins a channel — all instances with the same name receive messages',
        'channel.postMessage(data) broadcasts to all other contexts — the sender does NOT receive its own message',
        'channel.onmessage receives messages from other tabs/windows',
        'Same-origin only — cannot communicate across different domains',
        'Common use: sync auth state (logout all tabs), theme changes, shared notifications',
        'Alternative: SharedWorker for more complex cross-tab communication with shared state',
        'Close the channel (channel.close()) when done to prevent memory leaks',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Cross-tab auth sync',
          code: `// Broadcast auth state changes across all tabs
const authChannel = new BroadcastChannel('auth')

// When user logs out in one tab, log out everywhere
function logout() {
  clearSession()
  authChannel.postMessage({ type: 'LOGOUT' })
  window.location.href = '/login'
}

// Listen for logout from other tabs
authChannel.onmessage = (event) => {
  if (event.data.type === 'LOGOUT') {
    clearSession()
    window.location.href = '/login'
  }
}

// React hook for cross-tab communication
function useBroadcastChannel<T>(name: string, onMessage: (data: T) => void) {
  useEffect(() => {
    const channel = new BroadcastChannel(name)
    channel.onmessage = (event) => onMessage(event.data)
    return () => channel.close()
  }, [name, onMessage])
}`,
        },
      ],
      useCases: [
        'Synchronizing logout across all open tabs',
        'Theme/locale changes reflected in all windows instantly',
        'Shopping cart updates synced across tabs',
        'Collaborative features where multiple tabs show the same data',
      ],
      commonPitfalls: [
        'Expecting to receive your own messages — the sender does not receive its own broadcast',
        'Not closing the channel — open channels prevent garbage collection',
        'Using for complex state sync — BroadcastChannel is fire-and-forget; for stateful sync, use SharedWorker or IndexedDB with polling',
        'Assuming cross-origin works — BroadcastChannel is strictly same-origin',
      ],
      interviewTips: [
        'Explain the use case: cross-tab state synchronization (auth, theme, notifications)',
        'Compare with SharedWorker: BroadcastChannel is simpler (pub/sub), SharedWorker supports shared state',
        'Mention alternatives: localStorage "storage" event also works for cross-tab communication but is string-only',
      ],
      relatedConcepts: [
        'service-workers',
        'web-workers',
        'indexeddb',
      ],
      difficulty: 'intermediate',
      tags: ['web-api', 'broadcast-channel', 'cross-tab', 'communication'],
    },
    {
      id: 'wasm',
      title: 'WebAssembly (WASM)',
      description:
        'WebAssembly is a binary instruction format that runs near-native speed in the browser. It allows C, C++, Rust, Go, and other languages to compile to a format browsers can execute, enabling performance-critical applications on the web.',
      keyPoints: [
        'WASM runs in a sandboxed VM alongside JavaScript — it cannot access the DOM directly, communicates with JS via imports/exports',
        'Compilation targets: C/C++ (via Emscripten), Rust (via wasm-pack), Go, AssemblyScript (TypeScript-like)',
        'Use cases: image/video processing, codecs, game engines, physics simulations, cryptography, databases (SQLite compiled to WASM)',
        'WASM SIMD: Single Instruction Multiple Data — enables parallel math operations for ML inference, audio processing',
        'Calling JS from WASM and vice versa has overhead — minimize boundary crossings for performance',
        'WASM modules are cached by browsers — subsequent loads are near-instant',
        'WASI (WebAssembly System Interface) extends WASM beyond browsers — server-side, edge computing, plugin systems',
        'You do NOT need WASM for: simple DOM manipulation, typical web apps, anything where JS is fast enough',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Loading and using a WASM module',
          code: `// Load a WASM module (e.g., image processing compiled from Rust)
async function loadWasmModule() {
  const response = await fetch('/image-processor.wasm')
  const bytes = await response.arrayBuffer()

  const { instance } = await WebAssembly.instantiate(bytes, {
    env: {
      // JS functions WASM can call
      log: (ptr: number, len: number) => {
        const bytes = new Uint8Array(instance.exports.memory.buffer, ptr, len)
        console.log(new TextDecoder().decode(bytes))
      },
    },
  })

  return instance.exports as {
    memory: WebAssembly.Memory
    resize_image: (width: number, height: number, quality: number) => number
    get_result_ptr: () => number
    get_result_len: () => number
  }
}

// Using wasm-pack (Rust) with higher-level bindings
// import init, { resize_image } from './pkg/image_processor'
// await init() // load and instantiate WASM
// const result = resize_image(imageData, 800, 600, 85)`,
        },
      ],
      useCases: [
        'Image/video processing in the browser (resize, filter, convert formats)',
        'Running SQLite in the browser (sql.js) for offline-first databases',
        'Game engines and physics simulations (Unity, Godot compile to WASM)',
        'Cryptographic operations (argon2 password hashing, client-side encryption)',
        'PDF generation and manipulation in the browser',
      ],
      commonPitfalls: [
        'Using WASM for DOM manipulation — WASM cannot access the DOM directly; the JS↔WASM boundary adds overhead',
        'Assuming WASM is always faster than JS — for simple operations, the boundary crossing overhead exceeds the speedup',
        'Large WASM binaries blocking initial load — stream compilation (WebAssembly.instantiateStreaming) and caching help',
        'Memory management: WASM uses linear memory — you must manage allocation/deallocation manually (no garbage collector)',
      ],
      interviewTips: [
        'Explain when WASM makes sense: CPU-bound work where JS is the bottleneck (not DOM, not I/O)',
        'Describe the compilation pipeline: source language → LLVM/compiler → .wasm binary → browser VM',
        'Mention streaming compilation: browser can compile WASM while downloading, reducing load time',
        'Know real-world examples: Figma (C++ to WASM), Google Earth, Photoshop on the web, SQLite in the browser',
      ],
      relatedConcepts: [
        'web-workers',
        'web-animations-api',
        'performance-api',
      ],
      difficulty: 'expert',
      tags: ['web-api', 'wasm', 'webassembly', 'performance', 'native'],
    },
    {
      id: 'web-animations-api',
      title: 'Web Animations API',
      description:
        'The Web Animations API (WAAPI) provides programmatic control over CSS-like animations in JavaScript. It runs on the compositor thread (like CSS animations) for smooth 60fps performance while giving you full JavaScript control.',
      keyPoints: [
        'element.animate(keyframes, options) creates an Animation object — similar to CSS @keyframes but controlled from JS',
        'Runs on the compositor thread for transform and opacity — same performance as CSS animations',
        'Full control: play(), pause(), reverse(), finish(), cancel(), and playbackRate for speed control',
        'fill: "forwards" keeps the final state, "backwards" applies initial state before delay, "both" does both',
        'Composable: multiple animations on the same element stack (add), replace (replace), or accumulate (accumulate)',
        'Finished promise: animation.finished returns a Promise that resolves when the animation completes',
        'Compared with CSS animations: WAAPI is more flexible (dynamic values, chaining, promise-based), CSS is simpler for static animations',
        'Compared with GSAP: WAAPI is built-in (no library), GSAP is more powerful (timelines, complex easing, broader browser support)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Web Animations API examples',
          code: `// Basic animation
const animation = element.animate(
  [
    { transform: 'translateX(0)', opacity: 1 },
    { transform: 'translateX(300px)', opacity: 0 },
  ],
  {
    duration: 500,
    easing: 'ease-in-out',
    fill: 'forwards', // keep final state
  },
)

// Await completion
await animation.finished
console.log('Animation complete')

// Interactive control
animation.pause()
animation.playbackRate = 2 // double speed
animation.reverse()

// Spring-like animation with custom easing
element.animate(
  [
    { transform: 'scale(0.8)' },
    { transform: 'scale(1.05)', offset: 0.6 },
    { transform: 'scale(1)' },
  ],
  { duration: 400, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
)

// Stagger multiple elements
const items = document.querySelectorAll('.list-item')
items.forEach((item, i) => {
  item.animate(
    [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    { duration: 300, delay: i * 50, fill: 'forwards' },
  )
})`,
        },
      ],
      useCases: [
        'Interactive animations that respond to user input (drag, scroll, gesture)',
        'Staggered list animations with dynamic delays',
        'Page transitions with promise-based sequencing',
        'Replacing jQuery.animate() and simple GSAP animations with a built-in API',
      ],
      commonPitfalls: [
        'Animating layout properties (width, height, top) — not compositor-friendly, causes layout thrashing. Use transform instead',
        'Not using fill: "forwards" — animation snaps back to initial state on completion',
        'Creating many Animation objects without canceling them — they accumulate and consume resources',
        'Assuming full GSAP parity — WAAPI lacks timelines, morphing, scroll-linked animations (use GSAP for those)',
      ],
      interviewTips: [
        'Explain compositor-friendly properties: transform and opacity run on the GPU compositor thread, no layout/paint',
        'Compare with CSS animations: WAAPI adds dynamic control (pause, reverse, speed), CSS is simpler for static animations',
        'Mention the finished promise for sequencing: await anim1.finished, then start anim2',
        'Know the fill modes: forwards (keep end state), backwards (apply start state during delay), both',
      ],
      relatedConcepts: [
        'request-animation-frame',
        'layout-thrashing',
        'performance-api',
      ],
      difficulty: 'intermediate',
      tags: ['web-api', 'animation', 'waapi', 'compositor', 'performance'],
    },
    {
      id: 'performance-api',
      title: 'Performance API',
      description:
        'The Performance API provides high-resolution timing data for navigation, resources, paint, and custom metrics. PerformanceObserver enables real-time monitoring of performance entries as they occur.',
      keyPoints: [
        'Navigation Timing: measures the full page load pipeline — DNS, TCP, TLS, TTFB, DOM processing, load event',
        'Resource Timing: per-resource metrics (images, scripts, stylesheets) — size, duration, cache hit/miss',
        'Paint Timing: First Paint (FP) and First Contentful Paint (FCP) — when pixels first appear on screen',
        'Largest Contentful Paint (LCP): when the largest visible element finishes rendering — Core Web Vital',
        'Long Task API: detects tasks that block the main thread for >50ms — a signal for interaction responsiveness issues',
        'PerformanceObserver: subscribe to performance entries as they occur — more efficient than polling performance.getEntries()',
        'performance.mark() and performance.measure(): custom timing for your own code (e.g., measure component render time)',
        'User Timing API entries can be sent to analytics services — real user monitoring (RUM) data',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Performance monitoring',
          code: `// Observe Core Web Vitals
function observeWebVitals() {
  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log('LCP:', lastEntry.startTime, 'ms')
  }).observe({ type: 'largest-contentful-paint', buffered: true })

  // Long Tasks (>50ms main thread blocks)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('Long task:', entry.duration, 'ms', entry.attribution)
    }
  }).observe({ type: 'longtask', buffered: true })

  // First Input Delay
  new PerformanceObserver((list) => {
    const entry = list.getEntries()[0]
    console.log('FID:', entry.processingStart - entry.startTime, 'ms')
  }).observe({ type: 'first-input', buffered: true })
}

// Custom timing for your code
performance.mark('component-render-start')
// ... render logic ...
performance.mark('component-render-end')
performance.measure('component-render', 'component-render-start', 'component-render-end')

const measure = performance.getEntriesByName('component-render')[0]
console.log('Render took:', measure.duration, 'ms')`,
        },
      ],
      useCases: [
        'Real User Monitoring (RUM) — collect performance data from real users in production',
        'Core Web Vitals tracking — LCP, FID/INP, CLS for SEO and user experience',
        'Custom performance metrics — measure specific operations in your code',
        'Identifying long tasks that cause interaction latency',
      ],
      commonPitfalls: [
        'Only using Lighthouse — it is synthetic, not real user data. Performance API gives RUM data',
        'Not using buffered: true on PerformanceObserver — misses entries that occurred before the observer was created',
        'Over-instrumenting — too many marks/measures add overhead. Monitor critical paths only',
        'Ignoring Long Task API — it is the best signal for interaction responsiveness issues (Interaction to Next Paint)',
      ],
      interviewTips: [
        'Know the Core Web Vitals: LCP (loading), INP (interactivity), CLS (visual stability)',
        'Explain how PerformanceObserver works: subscribe to entry types, receive entries as they occur',
        'Describe the User Timing API: performance.mark() and performance.measure() for custom metrics',
        'Mention the web-vitals library as the standard way to collect CWV in production',
      ],
      relatedConcepts: [
        'layout-thrashing',
        'request-animation-frame',
        'image-optimization',
      ],
      difficulty: 'advanced',
      tags: ['web-api', 'performance', 'web-vitals', 'monitoring', 'rum'],
      proTip:
        'Use the web-vitals library (by Google) in production instead of raw Performance API. It handles all the edge cases (buffered entries, hidden tabs, back-forward cache) and reports LCP, INP, CLS, FCP, and TTFB accurately. Send the data to your analytics service for real user performance monitoring.',
    },
  ],
}
