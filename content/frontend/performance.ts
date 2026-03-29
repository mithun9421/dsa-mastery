// @ts-nocheck
import type { Category } from '@/lib/types'

export const frontendPerfCategory: Category = {
  id: 'frontend-performance',
  title: 'Frontend Performance',
  description:
    'Memoization, code splitting, virtualization, Web Workers, bundle analysis, and the real metrics that matter. Profile before you optimize — intuition lies.',
  icon: 'Gauge',
  concepts: [
    {
      id: 'memo-usememo-usecallback',
      title: 'React.memo, useMemo, useCallback',
      description:
        'React\'s memoization primitives prevent unnecessary re-renders and recomputations. But they have a cost — the comparison itself takes time and memory. The React DevTools Profiler is the only reliable way to know if memoization helps.',
      keyPoints: [
        'React.memo wraps a component to skip re-render if props are shallowly equal — the component must be pure (same props → same output)',
        'useMemo memoizes a computed value — recomputes only when dependencies change. Use for expensive calculations, not every variable',
        'useCallback memoizes a function reference — returns the same function object if dependencies have not changed',
        'useCallback is useMemo for functions: useCallback(fn, deps) === useMemo(() => fn, deps)',
        'The cost of memoization: dependency comparison on every render + memory for cached values. If comparison cost exceeds re-render cost, memoization hurts',
        'React.memo does NOT help when: parent passes inline objects/functions as props (new reference every render), or the component re-renders due to context change',
        'Profile first: React DevTools Profiler shows render times. Only memoize components that show up as slow in the flamegraph',
        'React 19 Compiler auto-memoizes — in compiler-enabled projects, you can remove most manual memo/useMemo/useCallback',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'When memoization helps vs hurts',
          code: `import { memo, useMemo, useCallback } from 'react'

// HELPS: ExpensiveList renders 1000 items, parent re-renders often
const ExpensiveList = memo(function ExpensiveList({ items, onSelect }: {
  items: Item[]
  onSelect: (id: string) => void
}) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => onSelect(item.id)}>{item.name}</li>
      ))}
    </ul>
  )
})

function Parent() {
  const [search, setSearch] = useState('')
  const [items] = useState(generateItems(1000))

  // Without useCallback, onSelect is a new function every render
  // and React.memo on ExpensiveList becomes useless
  const onSelect = useCallback((id: string) => {
    console.log('Selected:', id)
  }, [])

  // Without useMemo, filtered creates a new array every render
  const filtered = useMemo(
    () => items.filter((i) => i.name.includes(search)),
    [items, search],
  )

  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <ExpensiveList items={filtered} onSelect={onSelect} />
    </div>
  )
}

// HURTS: trivial component, memoization overhead > render cost
const Label = memo(({ text }: { text: string }) => <span>{text}</span>)
// ^ This is slower with memo than without — comparison costs more than re-rendering a <span>`,
        },
      ],
      useCases: [
        'Expensive list rendering (1000+ items) with a parent that re-renders frequently',
        'Computed values from large datasets — useMemo for filtering, sorting, aggregation',
        'Stable callback references for child components wrapped in React.memo',
        'Preventing re-renders in compound component consumers',
      ],
      commonPitfalls: [
        'Memoizing everything "just in case" — adds complexity and memory overhead for no measurable benefit',
        'Using useMemo for cheap computations — the memo overhead exceeds the computation cost',
        'Wrapping a component in React.memo but passing inline objects as props — memo check always fails',
        'Not profiling — assuming memoization helps without measuring',
      ],
      interviewTips: [
        'Know the relationship: useCallback(fn, deps) === useMemo(() => fn, deps)',
        'Explain when React.memo is useless: inline objects/functions as props, or context changes trigger the re-render',
        'Describe the profiling workflow: Profiler → identify slow component → add memo → re-profile to confirm improvement',
        'Mention React 19 Compiler as the future: auto-memoization eliminates manual optimization',
      ],
      relatedConcepts: [
        'react-reconciliation',
        'context-performance',
        'code-splitting',
        'virtualization',
      ],
      difficulty: 'intermediate',
      tags: ['react', 'performance', 'memoization', 'useMemo', 'useCallback'],
      proTip:
        'The best optimization is often not memo — it is restructuring the component tree. Move state down (closer to where it is used) or lift content up (pass children to avoid re-rendering static content). These structural changes are free and permanent, unlike memoization which can break silently.',
    },
    {
      id: 'code-splitting',
      title: 'Code Splitting',
      description:
        'Code splitting divides your JavaScript bundle into smaller chunks loaded on demand. Instead of downloading the entire app upfront, users only download the code they need for the current page or feature.',
      keyPoints: [
        'dynamic import() returns a Promise<Module> — bundlers (webpack, Vite, Turbopack) create a separate chunk at the import() boundary',
        'React.lazy() wraps a dynamic import for component-level code splitting — must be used with Suspense for loading state',
        'Route-level splitting is the highest-impact strategy — each page is a separate chunk loaded on navigation',
        'Component-level splitting for heavy features: rich text editors, charts, maps, syntax highlighters',
        'Prefetching: load chunks before the user needs them — on hover, on viewport intersection, or on route prefetch',
        'Next.js does route-level splitting automatically — each page in app/ or pages/ is a separate chunk',
        'Named exports require a wrapper with React.lazy: const Chart = lazy(() => import("./Chart").then(m => ({ default: m.Chart })))',
        'Measure bundle impact with webpack-bundle-analyzer or next/bundle-analyzer — split the biggest chunks first',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'React.lazy with prefetch',
          code: `import { lazy, Suspense, useState } from 'react'

// Lazy load the chart component — separate chunk
const Chart = lazy(() => import('./Chart'))

// Prefetch on hover — chunk downloads before click
function prefetchChart() {
  import('./Chart') // triggers chunk download, cached by bundler
}

function Dashboard() {
  const [showChart, setShowChart] = useState(false)

  return (
    <div>
      <button
        onMouseEnter={prefetchChart}
        onClick={() => setShowChart(true)}
      >
        Show Chart
      </button>

      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <Chart />
        </Suspense>
      )}
    </div>
  )
}`,
        },
        {
          language: 'tsx',
          label: 'Route-level splitting in React Router',
          code: `import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}`,
        },
      ],
      useCases: [
        'Route-level splitting — each page loads independently (biggest impact)',
        'Heavy third-party libraries — load chart/map/editor only when user navigates to that feature',
        'Admin-only features — regular users never download admin panel code',
        'Modal content — load the modal body only when opened',
      ],
      commonPitfalls: [
        'Splitting too aggressively — dozens of tiny chunks cause waterfall requests that are slower than one larger bundle',
        'Not adding Suspense fallback — unhandled lazy component throws an error',
        'Forgetting to prefetch — code splitting without prefetching adds latency to every navigation',
        'Not analyzing the bundle — splitting a 2KB component is pointless; target the largest chunks first',
      ],
      interviewTips: [
        'Route-level splitting is the first and highest-impact optimization — each page is an independent chunk',
        'Explain the loading waterfall: chunk download → parse → execute → render. Prefetching eliminates the download step',
        'Mention Next.js automatic splitting and router prefetch — it handles this out of the box',
        'Discuss the trade-off: smaller initial bundle vs additional network requests on navigation',
      ],
      relatedConcepts: [
        'memo-usememo-usecallback',
        'bundle-analysis',
        'suspense-concurrent',
        'prefetching-preloading',
      ],
      difficulty: 'intermediate',
      tags: ['performance', 'code-splitting', 'lazy-loading', 'bundling'],
    },
    {
      id: 'virtualization',
      title: 'Virtualization',
      description:
        'Virtualization renders only the visible items in a large list, keeping a constant number of DOM nodes regardless of data size. A list with 100,000 items renders as fast as one with 20 because only ~20 are in the DOM at any time.',
      keyPoints: [
        'Only visible items (+ a small overscan buffer) are rendered — items outside the viewport are removed from the DOM',
        'Libraries: @tanstack/react-virtual (headless, flexible), react-window (simpler API), react-virtuoso (auto-sizing)',
        'Variable-size items require measuring — react-virtual supports dynamic row heights with a measureElement callback',
        'Scroll-to-index: programmatically scroll to a specific item — essential for search results, anchor links',
        'Overscan: render extra items above and below the viewport to reduce flicker during fast scrolling',
        'Windowing vs infinite scroll: windowing renders a fixed window, infinite scroll loads more data on scroll — they can combine',
        'DOM node count is the key metric — 10,000 DOM nodes cause layout thrashing, 100 do not',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'TanStack Virtual list',
          code: `import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

function VirtualList({ items }: { items: { id: string; text: string }[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // estimated row height
    overscan: 5, // render 5 extra items above/below viewport
  })

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: \`\${virtualizer.getTotalSize()}px\`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: \`translateY(\${virtualRow.start}px)\`,
              height: \`\${virtualRow.size}px\`,
              width: '100%',
            }}
          >
            {items[virtualRow.index].text}
          </div>
        ))}
      </div>
    </div>
  )
}`,
        },
      ],
      useCases: [
        'Long lists or tables with 1000+ rows — logs, data grids, file explorers',
        'Chat applications — messages can number in the thousands',
        'Autocomplete dropdowns with many options',
        'Infinite scroll feeds — combine virtualization with data fetching',
      ],
      commonPitfalls: [
        'Not accounting for variable row heights — fixed-size virtualizer shows overlapping items if heights differ',
        'Forgetting the scroll container — the parent element must have a fixed height and overflow:auto',
        'Overcomplicating small lists — virtualization adds complexity; for <100 items, just render them all',
        'Not testing keyboard navigation — virtualized lists can break tab order and screen reader accessibility',
      ],
      interviewTips: [
        'Explain the core idea: a window of visible items + absolute positioning to simulate a full-length list',
        'Know the DOM node math: 10,000 rows × 5 cells = 50,000 DOM nodes → layout thrashing. Virtualization: ~20 rows × 5 = 100 nodes',
        'Discuss the trade-off: simpler rendering logic vs complex scroll management and accessibility challenges',
        'Mention that browsers handle <100 items efficiently — do not virtualize unless you need to',
      ],
      relatedConcepts: [
        'memo-usememo-usecallback',
        'intersection-observer',
        'layout-thrashing',
      ],
      difficulty: 'intermediate',
      tags: ['performance', 'virtualization', 'windowing', 'lists'],
      proTip:
        'If your list items have different heights, use @tanstack/react-virtual with measureElement. It measures each item after render and caches the height. The initial render uses estimateSize, then subsequent renders use actual measurements. This is much more reliable than trying to pre-calculate heights.',
    },
    {
      id: 'web-workers',
      title: 'Web Workers',
      description:
        'Web Workers run JavaScript in a background thread, keeping the main thread (and UI) responsive during CPU-intensive operations. The main thread and worker communicate via message passing — no shared memory (unless using SharedArrayBuffer).',
      keyPoints: [
        'Workers run in a separate thread — they cannot access the DOM, window, or document',
        'Communication via postMessage and onmessage — data is copied (structured clone algorithm), not shared',
        'Transferable objects (ArrayBuffer, OffscreenCanvas, MessagePort) can be transferred without copying — zero-copy for large data',
        'SharedArrayBuffer + Atomics enable true shared memory between threads — requires Cross-Origin Isolation headers',
        'Comlink library wraps postMessage in an RPC interface — call worker functions as if they were local async functions',
        'Worker pools (workerpool, threads.js) distribute tasks across multiple workers for parallelism',
        'Use for: JSON parsing large payloads, image processing, encryption, data transformation, CSV parsing, search indexing',
        'Do NOT use for: DOM manipulation (workers cannot access DOM), simple computations (message overhead exceeds compute time)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Worker with Comlink',
          code: `// worker.ts — runs in background thread
import { expose } from 'comlink'

const api = {
  // CPU-intensive: sort and aggregate 100K records
  processData(records: Record<string, unknown>[]) {
    return records
      .sort((a, b) => (a.score as number) - (b.score as number))
      .reduce((acc, r) => {
        const group = r.category as string
        acc[group] = (acc[group] ?? 0) + 1
        return acc
      }, {} as Record<string, number>)
  },

  // Expensive string matching
  fuzzySearch(items: string[], query: string) {
    return items.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    )
  },
}

expose(api)

// main.ts — runs on main thread
import { wrap } from 'comlink'

const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
const api = wrap<typeof import('./worker').default>(worker)

// Call worker function like a normal async function
const result = await api.processData(largeDataset)`,
        },
      ],
      useCases: [
        'Sorting/filtering/aggregating large datasets without blocking the UI',
        'Image processing (resize, filter, compress) in the browser',
        'Client-side search indexing (Fuse.js, FlexSearch in a worker)',
        'Parsing large JSON/CSV files without freezing the tab',
      ],
      commonPitfalls: [
        'Sending huge objects via postMessage — structured clone is expensive for large payloads; use Transferable objects',
        'Creating a new Worker for every task — Worker instantiation is expensive; reuse workers or use a pool',
        'Not handling Worker errors — unhandled errors in workers are silent unless you listen for the error event',
        'Using Workers for trivial tasks — the postMessage overhead (serialize + deserialize) exceeds the computation time',
      ],
      interviewTips: [
        'Explain the threading model: Workers run on a separate OS thread, communicate via message passing, no shared memory by default',
        'Describe structured clone vs Transferable: clone copies data (slow for large), transfer moves ownership (zero-copy)',
        'Mention SharedArrayBuffer for true shared memory — requires COOP/COEP headers for security',
        'Know the limitation: Workers cannot access DOM — for DOM-heavy work, use requestAnimationFrame batching instead',
      ],
      relatedConcepts: [
        'request-animation-frame',
        'layout-thrashing',
        'wasm',
      ],
      difficulty: 'advanced',
      tags: ['performance', 'web-workers', 'threading', 'offloading'],
    },
    {
      id: 'request-animation-frame',
      title: 'requestAnimationFrame',
      description:
        'requestAnimationFrame (rAF) schedules a callback before the next browser repaint, synchronized with the display refresh rate (typically 60fps = 16.6ms per frame). It is the foundation for smooth animations and efficient DOM batching.',
      keyPoints: [
        'rAF fires once per frame, right before the browser paints — ideal for animations and visual updates',
        '60fps means 16.6ms per frame budget — if your frame takes longer, the animation stutters (dropped frames)',
        'rAF automatically pauses when the tab is not visible — saves CPU/battery unlike setInterval',
        'Batch DOM reads then DOM writes within a single rAF callback to avoid layout thrashing',
        'Use rAF for: animations, scroll-linked effects, resize handlers, visual state transitions',
        'Do NOT use rAF for: timers, delays, or non-visual work — use setTimeout or Web Workers instead',
        'cancelAnimationFrame stops a pending rAF — important for cleanup in useEffect return',
        'Chrome DevTools Performance panel shows frame timing — use it to identify frames that exceed 16ms',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Animation loop with rAF',
          code: `import { useEffect, useRef } from 'react'

function useAnimationLoop(callback: (deltaTime: number) => void) {
  const rafRef = useRef<number>(0)
  const previousTimeRef = useRef<number>(0)

  useEffect(() => {
    function animate(time: number) {
      if (previousTimeRef.current) {
        const delta = time - previousTimeRef.current
        callback(delta)
      }
      previousTimeRef.current = time
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [callback])
}

// Usage: smooth counter
function SmoothCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0)

  useAnimationLoop((delta) => {
    setDisplay((prev) => {
      const step = delta * 0.01 // speed
      if (Math.abs(target - prev) < step) return target
      return prev + Math.sign(target - prev) * step
    })
  })

  return <span>{Math.round(display)}</span>
}`,
        },
      ],
      useCases: [
        'Custom animations that cannot be done with CSS transitions (physics-based, interactive)',
        'Scroll-linked effects (parallax, progress indicators)',
        'Canvas/WebGL render loops',
        'Batching DOM reads/writes to avoid layout thrashing',
      ],
      commonPitfalls: [
        'Using setInterval for animations — it does not sync with display refresh, causes stuttering',
        'Not cleaning up with cancelAnimationFrame — causes memory leaks and errors when component unmounts',
        'Doing too much work in the rAF callback — exceeding 16ms causes dropped frames',
        'Calling rAF recursively without a condition — infinite loop that never stops',
      ],
      interviewTips: [
        'Explain the frame budget: 60fps = 16.6ms for JS + layout + paint + composite',
        'Describe why rAF is better than setInterval for animations: synced to display refresh, pauses when hidden',
        'Mention the read-then-write pattern: batch all DOM reads before DOM writes to avoid forced reflow',
        'Know that CSS animations and Web Animations API are often better — they run on the compositor thread',
      ],
      relatedConcepts: [
        'layout-thrashing',
        'web-animations-api',
        'web-workers',
      ],
      difficulty: 'advanced',
      tags: ['performance', 'animation', 'requestAnimationFrame', 'rendering'],
    },
    {
      id: 'layout-thrashing',
      title: 'Layout Thrashing',
      description:
        'Layout thrashing occurs when JavaScript interleaves DOM reads and writes, forcing the browser to recalculate layout multiple times per frame instead of once. It is the most common cause of janky animations and slow interactions.',
      keyPoints: [
        'Forced synchronous layout: reading a layout property (offsetHeight, getBoundingClientRect) after writing to the DOM forces an immediate reflow',
        'The browser normally batches layout calculations — reading triggers it early, causing a "forced reflow"',
        'Read-then-write pattern: batch all reads first, then all writes — one layout calculation instead of N',
        'Properties that trigger forced reflow: offsetTop/Left/Width/Height, scrollTop/Left/Width/Height, clientTop/Left/Width/Height, getComputedStyle()',
        'fastdom library enforces the read-then-write pattern by batching operations into measure and mutate phases',
        'will-change CSS property hints to the browser that an element will change — promotes to compositor layer, avoids layout for transform/opacity',
        'Chrome DevTools Performance panel marks forced reflows with a red triangle — look for "Layout Forced" warnings',
        'ResizeObserver and IntersectionObserver avoid layout thrashing for measurements — they report layout info asynchronously',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Layout thrashing vs batched reads/writes',
          code: `// BAD: layout thrashing — each iteration forces a reflow
// N elements = N forced layouts instead of 1
function thrashing(elements: HTMLElement[]) {
  elements.forEach((el) => {
    const height = el.offsetHeight // READ — forces layout
    el.style.height = \`\${height * 2}px\` // WRITE — invalidates layout
    // Next iteration reads again → forces ANOTHER layout
  })
}

// GOOD: batch reads, then batch writes — 1 layout total
function batched(elements: HTMLElement[]) {
  // Phase 1: READ all values
  const heights = elements.map((el) => el.offsetHeight)

  // Phase 2: WRITE all values (single layout at end of frame)
  elements.forEach((el, i) => {
    el.style.height = \`\${heights[i] * 2}px\`
  })
}

// BEST: use requestAnimationFrame for separation
function optimal(elements: HTMLElement[]) {
  const heights = elements.map((el) => el.offsetHeight) // reads

  requestAnimationFrame(() => {
    elements.forEach((el, i) => {
      el.style.height = \`\${heights[i] * 2}px\` // writes
    })
  })
}`,
        },
      ],
      useCases: [
        'Animating multiple elements simultaneously — batch position reads then apply transforms',
        'Responsive layout adjustments — measure containers then update children',
        'Drag-and-drop implementations — read mouse position once, apply to all affected elements',
        'Accordion/collapse animations — measure content height then animate',
      ],
      commonPitfalls: [
        'Reading layout properties inside a loop that also writes — classic thrashing pattern',
        'Calling getComputedStyle after style changes — triggers forced reflow to compute the result',
        'Using element.offsetHeight as a "trick" to force transitions — intentional thrashing that can be replaced with rAF',
        'Forgetting that some CSS changes trigger layout (width, height, top, left) while others do not (transform, opacity)',
      ],
      interviewTips: [
        'Explain the browser rendering pipeline: JS → Style → Layout → Paint → Composite',
        'Describe forced reflow: reading layout after writing forces immediate recalculation',
        'Know which properties are "layout-safe" (transform, opacity) vs "layout-triggering" (width, height, top)',
        'Mention DevTools: Performance panel shows "Layout Forced" warnings with stack traces',
      ],
      relatedConcepts: [
        'request-animation-frame',
        'virtualization',
        'web-animations-api',
      ],
      difficulty: 'advanced',
      tags: ['performance', 'layout', 'reflow', 'rendering', 'dom'],
      proTip:
        'Use CSS transform and opacity for animations instead of top/left/width/height. Transforms and opacity changes are handled by the compositor thread — they do not trigger layout or paint, making them essentially free. This is why libraries like Framer Motion default to transform-based animations.',
    },
    {
      id: 'bundle-analysis',
      title: 'Bundle Analysis',
      description:
        'Bundle analysis reveals exactly what is in your JavaScript bundles and how much each dependency contributes. It is the foundation for informed code splitting — you cannot optimize what you cannot measure.',
      keyPoints: [
        'webpack-bundle-analyzer generates an interactive treemap of your bundle contents — biggest rectangles are the biggest targets',
        'next/bundle-analyzer wraps webpack-bundle-analyzer for Next.js projects',
        'Tree shaking eliminates unused exports — but only works with ES modules (import/export), not CommonJS (require)',
        'The "sideEffects": false flag in package.json tells the bundler it is safe to tree-shake unused exports from a package',
        'Dynamic import() creates a separate chunk — use it to defer large dependencies that are not needed on initial load',
        'source-map-explorer provides a simpler view of bundle contents from source maps',
        'Check import cost: the Import Cost VS Code extension shows the size of each import inline',
        'Replace heavy dependencies: date-fns over moment.js (tree-shakeable), lodash-es over lodash (ES modules)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Tree shaking and import optimization',
          code: `// BAD: imports entire lodash (70KB gzipped)
import _ from 'lodash'
const result = _.groupBy(items, 'category')

// GOOD: import only what you need (4KB)
import groupBy from 'lodash/groupBy'
const result = groupBy(items, 'category')

// BEST: use lodash-es for tree shaking
import { groupBy } from 'lodash-es'

// ALTERNATIVE: native JS often eliminates the dependency entirely
const result = Object.groupBy(items, (item) => item.category)

// Dynamic import for heavy dependencies
const { default: Chart } = await import('chart.js')

// package.json sideEffects flag
// "sideEffects": false — tells bundler all exports are tree-shakeable
// "sideEffects": ["*.css"] — CSS files have side effects, don't tree-shake them`,
        },
      ],
      useCases: [
        'Initial performance audit — understand what is in the bundle before optimizing',
        'Identifying large dependencies to replace, defer, or eliminate',
        'Verifying tree shaking — confirm unused exports are removed from production builds',
        'Monitoring bundle size in CI — fail builds that exceed a size budget',
      ],
      commonPitfalls: [
        'Optimizing without measuring — intuition about bundle size is often wrong',
        'Assuming tree shaking works with CommonJS — it does not; require() is dynamic and cannot be analyzed statically',
        'Adding a utility library for one function — check if native JS has an equivalent',
        'Not considering gzip/brotli — raw bundle size differs significantly from compressed transfer size',
      ],
      interviewTips: [
        'Explain why tree shaking requires ES modules: static imports can be analyzed at build time, dynamic requires cannot',
        'Describe the optimization workflow: analyze → identify targets → split/replace/defer → re-analyze',
        'Mention the sideEffects field and why it matters for library authors',
        'Know that Next.js automatically does many optimizations: tree shaking, route splitting, dynamic imports',
      ],
      relatedConcepts: [
        'code-splitting',
        'prefetching-preloading',
        'image-optimization',
      ],
      difficulty: 'intermediate',
      tags: ['performance', 'bundling', 'webpack', 'tree-shaking', 'optimization'],
    },
    {
      id: 'image-optimization',
      title: 'Image Optimization',
      description:
        'Images are typically the largest assets on a web page. Optimizing them — format, size, loading strategy — has the highest impact on page load metrics, especially Largest Contentful Paint (LCP).',
      keyPoints: [
        'Modern formats: WebP (30% smaller than JPEG), AVIF (50% smaller) — use <picture> with fallbacks for browser support',
        'Responsive images: srcset and sizes tell the browser which image size to download based on viewport and DPR',
        'Native lazy loading: loading="lazy" defers offscreen images until they approach the viewport — zero JavaScript needed',
        'LCP image: the largest visible image should be loaded eagerly (loading="eager") and preloaded with <link rel="preload">',
        'next/image handles optimization automatically: WebP/AVIF conversion, responsive srcset, lazy loading, blur placeholder',
        'Width and height attributes prevent Cumulative Layout Shift (CLS) — browser reserves space before the image loads',
        'Blur-up technique: show a tiny blurred placeholder (base64 or CSS gradient) while the full image loads',
        'CDN image services (Cloudinary, Imgix, Vercel OG) resize and convert images on the fly via URL parameters',
      ],
      codeExamples: [
        {
          language: 'html',
          label: 'Responsive image with modern formats',
          code: `<!-- Modern formats with fallback -->
<picture>
  <source srcset="/hero.avif" type="image/avif" />
  <source srcset="/hero.webp" type="image/webp" />
  <img
    src="/hero.jpg"
    alt="Hero image"
    width="1200"
    height="600"
    loading="lazy"
    decoding="async"
  />
</picture>

<!-- Responsive: different sizes for different viewports -->
<img
  srcset="
    /photo-400w.webp 400w,
    /photo-800w.webp 800w,
    /photo-1200w.webp 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
  src="/photo-800w.webp"
  alt="Responsive photo"
  width="800"
  height="600"
  loading="lazy"
/>

<!-- LCP image: eager load + preload in <head> -->
<link rel="preload" as="image" href="/hero.webp" type="image/webp" />
<img src="/hero.webp" alt="Hero" loading="eager" fetchpriority="high" />`,
        },
      ],
      useCases: [
        'E-commerce product images — responsive srcset for grid vs detail views',
        'Hero/banner images — preload for LCP optimization',
        'User-generated content — CDN-based resize and format conversion',
        'Blog/article images — lazy loading for below-the-fold content',
      ],
      commonPitfalls: [
        'Lazy loading the LCP image — this delays the most important visual element; use loading="eager" and preload',
        'Not setting width/height — causes layout shift when the image loads',
        'Serving desktop-sized images to mobile — wastes bandwidth; use srcset with appropriate breakpoints',
        'Not using modern formats — JPEG/PNG when WebP/AVIF are supported by 95%+ of browsers',
      ],
      interviewTips: [
        'Explain the LCP optimization: identify the LCP element (usually an image), preload it, and set fetchpriority="high"',
        'Describe srcset/sizes: srcset tells the browser what sizes are available, sizes tells it which size to pick',
        'Mention CLS prevention: width + height attributes let the browser calculate aspect ratio before download',
        'Know the format progression: JPEG → WebP (30% smaller) → AVIF (50% smaller)',
      ],
      relatedConcepts: [
        'prefetching-preloading',
        'font-loading',
        'intersection-observer',
      ],
      difficulty: 'intermediate',
      tags: ['performance', 'images', 'lcp', 'webp', 'responsive'],
    },
    {
      id: 'font-loading',
      title: 'Font Loading',
      description:
        'Web fonts cause two problems: Flash of Invisible Text (FOIT) and Flash of Unstyled Text (FOUT). The font-display property and preloading strategy determine which problem you get and how to minimize its impact.',
      keyPoints: [
        'font-display: swap — show fallback text immediately, swap to web font when loaded (FOUT). Best for body text',
        'font-display: optional — show fallback if font is not cached, use web font only if already cached. Best for performance-critical pages',
        'font-display: block — hide text until font loads (FOIT up to 3s). Rarely appropriate',
        'Preload critical fonts: <link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin> — starts download immediately',
        'Variable fonts: one file with adjustable weight/width/italic — reduces requests from multiple font files to one',
        'Self-host fonts instead of Google Fonts — eliminates the DNS lookup + connection to fonts.googleapis.com',
        'Subset fonts to include only needed characters — Latin subset is ~20KB vs ~100KB for full Unicode',
        'next/font handles all of this automatically: preload, self-host, font-display, CSS variable injection',
      ],
      codeExamples: [
        {
          language: 'css',
          label: 'Font loading strategy',
          code: `/* Self-hosted font with swap strategy */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900; /* variable font weight range */
  font-display: swap; /* show fallback immediately, swap when loaded */
  src: url('/fonts/inter-variable.woff2') format('woff2');
  unicode-range: U+0000-00FF; /* Latin subset only */
}

/* Preload in HTML <head> — download starts immediately */
/* <link rel="preload" href="/fonts/inter-variable.woff2"
        as="font" type="font/woff2" crossorigin /> */

/* Size-adjusted fallback to minimize layout shift on swap */
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  size-adjust: 107%; /* match Inter's metrics */
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}

body {
  font-family: 'Inter', 'Inter Fallback', system-ui, sans-serif;
}`,
        },
      ],
      useCases: [
        'Marketing/landing pages where typography is critical — preload + swap for minimal FOUT',
        'Performance-critical apps — font-display: optional to eliminate all font-related layout shift',
        'Multi-language apps — subset fonts per locale to reduce download size',
        'Design systems — variable fonts reduce the number of font files to manage',
      ],
      commonPitfalls: [
        'Loading Google Fonts from the CDN — adds DNS + TCP + TLS overhead; self-host instead',
        'Using font-display: block — hides text for up to 3 seconds on slow connections',
        'Not preloading the critical font — browser discovers it late (after CSS is parsed), delaying render',
        'Loading all weights as separate files when a variable font would be one file',
      ],
      interviewTips: [
        'Explain FOIT vs FOUT and how font-display controls the behavior',
        'Describe the ideal strategy: preload + self-host + variable font + swap/optional',
        'Mention size-adjust and metric overrides to minimize layout shift during the swap',
        'Know that next/font handles all of this with zero configuration',
      ],
      relatedConcepts: [
        'image-optimization',
        'prefetching-preloading',
        'bundle-analysis',
      ],
      difficulty: 'intermediate',
      tags: ['performance', 'fonts', 'fout', 'foit', 'web-fonts'],
    },
    {
      id: 'prefetching-preloading',
      title: 'Prefetching & Preloading',
      description:
        'Resource hints tell the browser to fetch resources before they are discovered naturally. Used correctly, they eliminate network latency from the critical path. Used incorrectly, they waste bandwidth and compete with critical resources.',
      keyPoints: [
        '<link rel="preload"> — fetch this resource NOW, it is needed for the current page (fonts, hero images, critical CSS/JS)',
        '<link rel="prefetch"> — fetch this resource at low priority, it is needed for a future navigation (next page data/chunks)',
        '<link rel="preconnect"> — establish TCP + TLS connection to a domain early (API servers, CDNs, font servers)',
        '<link rel="dns-prefetch"> — resolve DNS only (lighter than preconnect, use for less critical domains)',
        'Preload is mandatory: if you preload but never use the resource, Chrome warns in DevTools. Only preload what the current page needs',
        'Prefetch is speculative: resources are fetched at idle priority. OK to prefetch even if the user might not visit the page',
        'Next.js router automatically prefetches linked pages on viewport intersection — code splitting + prefetch = fast navigation',
        'fetchpriority="high|low|auto" attribute (Fetch Priority API) fine-tunes resource priority within the same type',
      ],
      codeExamples: [
        {
          language: 'html',
          label: 'Resource hints in HTML',
          code: `<head>
  <!-- Preconnect to API server — saves 100-300ms on first request -->
  <link rel="preconnect" href="https://api.example.com" />

  <!-- DNS prefetch for analytics (less critical) -->
  <link rel="dns-prefetch" href="https://analytics.example.com" />

  <!-- Preload critical font — needed for above-the-fold text -->
  <link rel="preload" href="/fonts/inter.woff2"
        as="font" type="font/woff2" crossorigin />

  <!-- Preload hero image — LCP element -->
  <link rel="preload" href="/hero.webp"
        as="image" type="image/webp" />

  <!-- Preload critical CSS chunk (if code-split) -->
  <link rel="preload" href="/critical.css" as="style" />

  <!-- Prefetch next page JS chunk — low priority, for future navigation -->
  <link rel="prefetch" href="/dashboard.js" />
</head>`,
        },
      ],
      useCases: [
        'Preloading LCP images and critical fonts for faster initial render',
        'Preconnecting to API servers and CDNs to eliminate connection overhead',
        'Prefetching next-page bundles for instant navigation (wizard steps, pagination)',
        'DNS prefetching third-party domains (analytics, ads, social embeds)',
      ],
      commonPitfalls: [
        'Preloading too many resources — they compete with each other and delay critical content',
        'Using preload for resources on future pages — use prefetch instead (low priority)',
        'Forgetting crossorigin on font preloads — fonts require CORS, without it the preloaded font is ignored and fetched again',
        'Not measuring impact — use WebPageTest or Lighthouse to verify that hints actually improve metrics',
      ],
      interviewTips: [
        'Explain the hierarchy: dns-prefetch (lightest) → preconnect (TCP+TLS) → prefetch (low priority fetch) → preload (high priority fetch)',
        'Describe when each is appropriate: preload for current page critical resources, prefetch for future navigations',
        'Mention the fetchpriority attribute for fine-grained control within the same resource type',
        'Know that Next.js and Remix handle most of this automatically through their router and page lifecycle',
      ],
      relatedConcepts: [
        'code-splitting',
        'image-optimization',
        'font-loading',
      ],
      difficulty: 'intermediate',
      tags: ['performance', 'preload', 'prefetch', 'resource-hints', 'network'],
    },
  ],
}
