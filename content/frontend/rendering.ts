// @ts-nocheck
import type { Category } from '@/lib/types'

export const renderingCategory: Category = {
  id: 'rendering-strategies',
  title: 'Rendering Strategies',
  description:
    'CSR, SSR, SSG, ISR, streaming, islands, RSC, and edge rendering — every rendering strategy is a trade-off between time-to-first-byte, time-to-interactive, freshness, and infrastructure cost. Know when each is right.',
  icon: 'Layers',
  concepts: [
    {
      id: 'client-side-rendering',
      title: 'Client-Side Rendering (CSR)',
      description:
        'CSR ships a minimal HTML shell with a JavaScript bundle. The browser downloads, parses, and executes the JS, which then renders the entire UI. This is the traditional SPA model — simple to deploy but slow to first paint.',
      keyPoints: [
        'Flow: empty HTML → download JS bundle → parse → execute → render UI → interactive',
        'Pros: simple deployment (static files), rich interactivity, no server-side rendering infrastructure needed',
        'Cons: blank page until JS loads (poor FCP/LCP), SEO challenges (crawlers may not execute JS), large JS bundles',
        'Hydration: not needed (there is nothing to hydrate — the client builds the DOM from scratch)',
        'SEO: search engines may not index CSR content reliably — Google can execute JS but with delays and limits',
        'Best for: internal tools, dashboards, admin panels — apps where SEO does not matter and users have fast connections',
        'Code splitting mitigates bundle size but does not fix the fundamental blank-page-until-JS-loads problem',
        'Create React App (CRA) was the canonical CSR setup — now deprecated in favor of frameworks with SSR support',
      ],
      codeExamples: [
        {
          language: 'html',
          label: 'CSR HTML shell',
          code: `<!-- The entire HTML is just a mount point -->
<!DOCTYPE html>
<html>
<head>
  <title>My SPA</title>
</head>
<body>
  <!-- Empty until JS renders -->
  <div id="root"></div>

  <!-- All rendering happens after this bundle loads and executes -->
  <script src="/app.bundle.js"></script>
</body>
</html>

<!--
Timeline:
1. Browser downloads HTML (~1KB)  → blank page
2. Browser discovers app.bundle.js
3. Downloads JS (~200-500KB)      → still blank
4. Parses and executes JS         → still blank
5. React renders to #root         → content appears
6. Event handlers attach          → interactive

Total: ~2-5 seconds of blank page on 3G
-->`,
        },
      ],
      useCases: [
        'Internal dashboards and admin panels where SEO is irrelevant',
        'Highly interactive applications (Figma, Google Docs) where server rendering adds complexity without benefit',
        'Apps behind authentication where search engines never access the content',
        'Prototypes and MVPs where deployment simplicity matters most',
      ],
      commonPitfalls: [
        'Using CSR for content sites (blogs, e-commerce, marketing) — terrible SEO and perceived performance',
        'Massive JS bundles without code splitting — users see nothing for seconds',
        'Not adding loading states — users see a blank white page instead of a skeleton',
        'Assuming Google indexes JS-rendered content instantly — it queues JS rendering and may take days',
      ],
      interviewTips: [
        'CSR is the simplest model but has the worst initial load performance and SEO',
        'Explain the blank page problem: no content until JS downloads, parses, AND executes',
        'Compare with SSR: SSR shows content immediately (HTML), then hydrates for interactivity',
        'Know when CSR is actually the right choice: behind auth, internal tools, highly interactive apps',
      ],
      relatedConcepts: [
        'server-side-rendering',
        'static-site-generation',
        'code-splitting',
        'streaming-ssr',
      ],
      difficulty: 'beginner',
      tags: ['rendering', 'csr', 'spa', 'client-side'],
    },
    {
      id: 'server-side-rendering',
      title: 'Server-Side Rendering (SSR)',
      description:
        'SSR renders HTML on the server for each request, sending fully-formed HTML to the browser. The user sees content immediately while the JavaScript loads in the background for interactivity (hydration).',
      keyPoints: [
        'Flow: request → server renders HTML → send HTML (visible) → download JS → hydrate (interactive)',
        'Faster First Contentful Paint (FCP) than CSR — content is visible before JS loads',
        'Time to Interactive (TTI) still depends on JS bundle — users can see but not interact during hydration',
        'Server load: every request runs React on the server — requires a Node.js server or serverless functions',
        'SEO: excellent — crawlers receive full HTML content immediately',
        'Hydration: React attaches event handlers to existing server-rendered HTML — the DOM must match exactly',
        'TTFB is slower than static (server must render) but faster than CSR (no JS needed for first paint)',
        'Next.js App Router and Pages Router both support SSR — App Router uses Server Components by default',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'SSR in Next.js (Pages Router)',
          code: `// pages/products/[id].tsx
interface Product { id: string; name: string; price: number }

export async function getServerSideProps({ params }: { params: { id: string } }) {
  // Runs on every request — on the server
  const res = await fetch(\`https://api.example.com/products/\${params.id}\`)
  const product: Product = await res.json()

  return {
    props: { product }, // passed to component as props
  }
}

export default function ProductPage({ product }: { product: Product }) {
  // This HTML is fully rendered on the server
  // Browser receives complete HTML → user sees content immediately
  return (
    <div>
      <h1>{product.name}</h1>
      <p>Price: \${product.price}</p>
      <button onClick={() => addToCart(product.id)}>
        Add to Cart {/* Interactive after hydration */}
      </button>
    </div>
  )
}

// Timeline:
// 1. User requests /products/123
// 2. Server fetches product data from API
// 3. Server renders React to HTML string
// 4. HTML sent to browser → content visible immediately
// 5. JS bundle downloads → hydration → interactive`,
        },
      ],
      useCases: [
        'E-commerce product pages — SEO + personalized content (prices, stock levels)',
        'Social media feeds — different content per user, needs SEO for public profiles',
        'News/content sites with frequently updated content that cannot be statically generated',
        'Any page that needs SEO AND user-specific or frequently-changing data',
      ],
      commonPitfalls: [
        'High server cost under traffic spikes — every request renders on the server',
        'Hydration mismatch: server HTML and client render must produce identical output',
        'Slow APIs block TTFB — if data fetching takes 2s, TTFB is 2s+ (use streaming SSR to solve)',
        'Not caching SSR responses at CDN level — every request hits the origin server',
      ],
      interviewTips: [
        'Explain the trade-off: faster FCP than CSR (content visible sooner) but TTFB is slower than static',
        'Describe hydration: attaching event handlers to server-rendered HTML, making it interactive',
        'Compare TTFB: static (CDN, ~50ms) < SSR (server render, ~200-500ms) — but SSR content is always fresh',
        'Mention streaming SSR as the improvement: send HTML as it is ready, do not wait for all data',
      ],
      relatedConcepts: [
        'client-side-rendering',
        'static-site-generation',
        'streaming-ssr',
        'hydration-mismatch',
      ],
      difficulty: 'intermediate',
      tags: ['rendering', 'ssr', 'server-side', 'hydration', 'seo'],
    },
    {
      id: 'static-site-generation',
      title: 'Static Site Generation (SSG)',
      description:
        'SSG pre-renders pages at build time, producing static HTML files that can be served from a CDN. The fastest possible TTFB — no server-side computation at request time.',
      keyPoints: [
        'Build time: pages are rendered to HTML during the build step — the output is static files',
        'CDN distribution: static files are served from edge locations worldwide — ~50ms TTFB from nearest edge',
        'No server needed at request time — hosting is cheap (Vercel, Netlify, S3 + CloudFront)',
        'Stale content: pages are only updated on rebuild — data can be minutes to hours old',
        'ISR (Incremental Static Regeneration) adds staleness control without full rebuilds',
        'Best for: marketing sites, blogs, documentation, product pages with infrequent updates',
        'Build time scales with page count — 10,000 pages can take minutes to build',
        'Hybrid: SSG for most pages, SSR for dynamic pages, CSR for interactive widgets — use the right strategy per page',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'SSG in Next.js (Pages Router)',
          code: `// pages/blog/[slug].tsx
interface Post { slug: string; title: string; content: string }

// 1. Define which pages to generate at build time
export async function getStaticPaths() {
  const posts = await getAllPosts()
  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: 'blocking', // SSR for unknown slugs, then cache
  }
}

// 2. Fetch data at build time for each page
export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  return {
    props: { post },
    revalidate: 3600, // ISR: regenerate every hour
  }
}

// 3. Component renders with pre-fetched data
export default function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}

// Result: HTML generated at build → served from CDN → ~50ms TTFB
// ISR: after 1 hour, next request triggers background regeneration`,
        },
      ],
      useCases: [
        'Marketing and landing pages — content changes infrequently, SEO is critical',
        'Blog and documentation sites — content is authored and published, not real-time',
        'E-commerce product catalog — product info updates on publish, not per request',
        'Any page where data can be slightly stale (minutes to hours)',
      ],
      commonPitfalls: [
        'Using SSG for highly dynamic content (user dashboards, real-time feeds) — data is stale until rebuild',
        'Build time growing linearly with page count — 100K pages can take 30+ minutes',
        'Not setting fallback for new pages — new content requires a full rebuild',
        'Forgetting that SSG pages are the same for all users — cannot personalize without client-side JS',
      ],
      interviewTips: [
        'SSG = fastest possible delivery (CDN edge, ~50ms), SSR = fresh but slower, CSR = blank until JS',
        'Explain the build time trade-off: more pages = longer builds, solved by ISR or on-demand revalidation',
        'Describe fallback strategies: false (404 for unknown), blocking (SSR then cache), true (show loading)',
        'Know the hybrid approach: SSG for most pages, SSR where needed, CSR for interactive parts',
      ],
      relatedConcepts: [
        'incremental-static-regeneration',
        'server-side-rendering',
        'client-side-rendering',
        'edge-rendering',
      ],
      difficulty: 'intermediate',
      tags: ['rendering', 'ssg', 'static', 'cdn', 'build-time'],
    },
    {
      id: 'incremental-static-regeneration',
      title: 'Incremental Static Regeneration (ISR)',
      description:
        'ISR combines SSG speed with SSR freshness. Pages are served statically from the CDN but regenerated in the background after a configurable time-based or on-demand trigger. Users get cached speed; content stays fresh.',
      keyPoints: [
        'revalidate: N — after N seconds, the next request triggers a background regeneration. The stale page is served instantly, the new page replaces it for subsequent requests',
        'On-demand revalidation: trigger regeneration programmatically (e.g., CMS webhook calls revalidatePath or revalidateTag)',
        'fallback: blocking — new pages (not built at build time) are SSR-rendered on first request, then cached as static',
        'fallback: true — shows a loading state while the page is generated in the background',
        'Edge caching: ISR pages are cached at the CDN edge — subsequent requests are as fast as pure SSG',
        'Next.js App Router uses time-based revalidation in fetch() and revalidatePath/revalidateTag for on-demand',
        'ISR is ideal for the "long tail" — pre-build popular pages, generate and cache niche pages on demand',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'ISR with on-demand revalidation',
          code: `// app/products/[id]/page.tsx (Next.js App Router)
export async function generateStaticParams() {
  // Pre-build top 100 products
  const topProducts = await getTopProducts(100)
  return topProducts.map((p) => ({ id: p.id }))
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetch(\`https://api.example.com/products/\${params.id}\`, {
    next: { revalidate: 3600 }, // revalidate every hour
  }).then((r) => r.json())

  return <ProductDetail product={product} />
}

// api/revalidate/route.ts — webhook endpoint for CMS
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const { productId, secret } = await request.json()

  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 })
  }

  // Instantly regenerate specific page
  revalidatePath(\`/products/\${productId}\`)
  return Response.json({ revalidated: true })
}

// Flow:
// 1. Build: top 100 products pre-rendered as static HTML
// 2. Request for product #500: SSR → cache as static (fallback: blocking)
// 3. After 1 hour: next request serves stale, triggers background regen
// 4. CMS publishes update → webhook calls /api/revalidate → instant refresh`,
        },
      ],
      useCases: [
        'E-commerce with thousands of product pages — pre-build popular, on-demand for long tail',
        'Blog/CMS sites — revalidate when content is published via webhook',
        'Documentation — periodic revalidation to pick up updates without full rebuild',
        'Any page that benefits from CDN speed but needs periodic freshness',
      ],
      commonPitfalls: [
        'Setting revalidate too low (e.g., 1 second) — effectively becomes SSR with extra caching complexity',
        'Not implementing on-demand revalidation — content stays stale until the timer expires',
        'Expecting ISR pages to show user-specific content — ISR pages are the same for everyone (use client-side personalization)',
        'Not handling the fallback loading state — users see a flash of loading before the page renders',
      ],
      interviewTips: [
        'Explain the stale-while-revalidate pattern: serve cached (instant), regenerate in background (fresh for next request)',
        'Compare time-based vs on-demand: time-based is set-and-forget, on-demand is event-driven (CMS webhook)',
        'Describe the long-tail optimization: pre-build popular pages, generate+cache niche pages on first request',
        'Know the limitations: ISR pages are not personalized, and there is a staleness window',
      ],
      relatedConcepts: [
        'static-site-generation',
        'server-side-rendering',
        'edge-rendering',
        'streaming-ssr',
      ],
      difficulty: 'intermediate',
      tags: ['rendering', 'isr', 'next.js', 'caching', 'revalidation'],
    },
    {
      id: 'streaming-ssr',
      title: 'Streaming SSR',
      description:
        'Streaming SSR sends HTML to the browser as it is generated, not after the entire page is ready. React 18\'s renderToPipeableStream combined with Suspense boundaries enables out-of-order streaming — fast content appears instantly, slow content streams in when ready.',
      keyPoints: [
        'Traditional SSR waits for ALL data before sending any HTML — slowest query blocks TTFB for the entire page',
        'Streaming SSR sends HTML progressively: static shell first, then each Suspense boundary resolves independently',
        'React 18 renderToPipeableStream: streams HTML chunks as each Suspense boundary resolves',
        'Out-of-order streaming: slow sections stream in later, injected into the correct position via inline <script> tags',
        'Selective hydration: React hydrates each streamed section independently, prioritizing sections the user interacts with',
        'TTFB improvement: first byte is sent immediately with the static shell, even if data is still loading',
        'Suspense boundaries define streaming units: each boundary can stream independently',
        'Next.js App Router uses streaming by default with Server Components + Suspense',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Streaming with Suspense boundaries',
          code: `// Each Suspense boundary streams independently
export default async function Page() {
  return (
    <div>
      {/* Sent immediately — no data needed */}
      <Header />

      {/* Streams as soon as product data loads (~200ms) */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductInfo productId="123" />
      </Suspense>

      {/* Streams later when reviews load (~800ms) */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId="123" />
      </Suspense>

      {/* Streams last when recommendations load (~1500ms) */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations userId="456" />
      </Suspense>
    </div>
  )
}

// async Server Component — suspends until data is ready
async function ProductReviews({ productId }: { productId: string }) {
  const reviews = await fetchReviews(productId) // 800ms
  return (
    <ul>
      {reviews.map((r) => <li key={r.id}>{r.text}</li>)}
    </ul>
  )
}

// Timeline:
// 0ms:    HTML starts streaming — Header visible, skeletons shown
// 200ms:  ProductInfo HTML streams in, replaces skeleton
// 800ms:  Reviews HTML streams in, replaces skeleton
// 1500ms: Recommendations HTML streams in, replaces skeleton
// Without streaming: entire page blocked until 1500ms`,
        },
      ],
      useCases: [
        'Pages with multiple data sources of varying speed — fast sources appear instantly, slow ones stream in',
        'E-commerce product pages — show product info fast, reviews and recommendations stream in later',
        'Dashboard pages — critical metrics appear first, detailed charts stream in',
        'Any SSR page where some data is significantly slower than other data',
      ],
      commonPitfalls: [
        'One giant Suspense boundary around everything — defeats streaming, same as blocking SSR',
        'Too many Suspense boundaries — users see a jarring cascade of loading states',
        'Not providing meaningful skeletons — empty divs are worse than a coherent loading state',
        'CDN/proxy buffering — some CDNs buffer the entire response before forwarding, negating streaming benefits',
      ],
      interviewTips: [
        'Explain the key innovation: HTML streams progressively, so TTFB = time to render the shell, not the slowest data',
        'Describe out-of-order streaming: React injects late-arriving content into the correct DOM position via script tags',
        'Compare with waterfall SSR: waterfall blocks on slowest query; streaming sends fast content immediately',
        'Mention selective hydration: React hydrates streamed sections independently and prioritizes user interactions',
      ],
      relatedConcepts: [
        'server-side-rendering',
        'suspense-concurrent',
        'react-server-components',
        'partial-hydration',
      ],
      difficulty: 'advanced',
      tags: ['rendering', 'streaming', 'ssr', 'suspense', 'performance'],
      proTip:
        'Place Suspense boundaries at data-fetching boundaries, not component boundaries. Each Suspense boundary should represent a meaningful loading unit that users can understand — "reviews are loading" makes sense, "div is loading" does not.',
    },
    {
      id: 'partial-hydration',
      title: 'Partial Hydration & Islands Architecture',
      description:
        'Islands architecture renders the entire page as static HTML on the server and only hydrates specific interactive "islands" on the client. The rest of the page ships zero JavaScript. Astro is the primary framework implementing this pattern.',
      keyPoints: [
        'Most of a web page is static content (text, images, layout) — it does not need JavaScript for interactivity',
        'Islands are interactive components embedded in a static HTML page — only they ship JavaScript to the client',
        'Astro: components are server-rendered by default; add client:load, client:visible, or client:idle to hydrate',
        'client:load — hydrate immediately when page loads (above-the-fold interactive elements)',
        'client:visible — hydrate when the island scrolls into viewport (lazy hydration)',
        'client:idle — hydrate when the browser is idle (low-priority interactivity)',
        'Result: a blog post with one interactive widget ships only that widget\'s JS, not the entire framework runtime',
        'Fresh (Deno) and Marko also implement islands — the pattern is framework-agnostic',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Astro islands',
          code: `---
// page.astro — server-rendered by default, zero JS
import Header from '../components/Header.astro' // static, no JS
import BlogContent from '../components/BlogContent.astro' // static
import Newsletter from '../components/Newsletter' // React, interactive
import Comments from '../components/Comments' // React, interactive
---

<html>
<body>
  <!-- Static HTML — zero JavaScript -->
  <Header />
  <BlogContent />

  <!-- Island: hydrates immediately (form needs to be interactive) -->
  <Newsletter client:load />

  <!-- Island: hydrates when scrolled into view (below the fold) -->
  <Comments client:visible />

  <!-- Result: only Newsletter.js and Comments.js ship to client
       The rest of the page is pure HTML — no React runtime -->
</body>
</html>`,
        },
      ],
      useCases: [
        'Content-heavy sites (blogs, docs, news) with sparse interactivity',
        'Marketing/landing pages where most content is static but a few widgets need JS',
        'Sites where bundle size and performance are top priority',
        'Multi-framework sites — different islands can use different frameworks (React, Svelte, Vue)',
      ],
      commonPitfalls: [
        'Using islands for highly interactive apps (dashboards, editors) — too many islands, too much coordination overhead',
        'Islands cannot easily share state — each island is independently hydrated, no shared React tree',
        'Not choosing the right hydration strategy — client:load for everything negates the benefit',
        'Assuming this works with Next.js/Remix — they use a different model (full-page hydration or RSC); Astro is the islands framework',
      ],
      interviewTips: [
        'Explain the core insight: most of a web page does not need JavaScript, so do not ship it',
        'Compare with Next.js RSC: RSC keeps server components off the client but still hydrates the client tree. Islands hydrate only individual interactive components',
        'Describe the hydration strategies: load (immediate), visible (lazy), idle (deferred)',
        'Know the limitation: islands are isolated — sharing state between them requires explicit coordination',
      ],
      relatedConcepts: [
        'react-server-components',
        'streaming-ssr',
        'static-site-generation',
      ],
      difficulty: 'advanced',
      tags: ['rendering', 'islands', 'astro', 'partial-hydration', 'performance'],
    },
    {
      id: 'edge-rendering',
      title: 'Edge Rendering',
      description:
        'Edge rendering runs server-side logic at CDN edge locations close to the user, reducing TTFB by eliminating the round-trip to a central origin server. Cloudflare Workers, Vercel Edge Functions, and Deno Deploy are the primary platforms.',
      keyPoints: [
        'Edge = CDN edge locations (100+ globally) — your code runs ~50ms from every user, not 200ms+ from one region',
        'Dramatically lower TTFB for SSR compared to a single-region server',
        'Limited runtime: no Node.js APIs (fs, child_process, native modules). Uses Web standard APIs (fetch, crypto, Request/Response)',
        'Cold start is minimal (~5ms) compared to Lambda (~200-500ms) — edge runtimes are lighter',
        'Best for: personalization at the edge (A/B tests, geolocation, auth checks), middleware, API proxying',
        'Not suitable for: database queries to a central DB (latency from edge to DB), heavy computation, long-running tasks',
        'Next.js Edge Runtime: export const runtime = "edge" in route handlers or middleware',
        'Data strategy: use edge-compatible databases (PlanetScale, Turso, Neon, D1) or read replicas distributed to edge regions',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Next.js Edge Function',
          code: `// app/api/geo/route.ts — runs at the CDN edge
export const runtime = 'edge'

export function GET(request: Request) {
  // Edge has access to geo information from the CDN
  const country = request.headers.get('x-vercel-ip-country') ?? 'US'
  const city = request.headers.get('x-vercel-ip-city') ?? 'Unknown'

  return Response.json({
    country,
    city,
    message: \`Hello from the edge near \${city}, \${country}!\`,
    // Response generated at the nearest edge location
    // TTFB: ~50ms instead of ~200-500ms from origin
  })
}

// middleware.ts — runs at the edge before every request
import { NextResponse } from 'next/server'

export function middleware(request: Request) {
  const country = request.headers.get('x-vercel-ip-country')

  // A/B testing at the edge
  const bucket = Math.random() < 0.5 ? 'control' : 'experiment'
  const response = NextResponse.next()
  response.cookies.set('ab-bucket', bucket)

  // Geolocation redirect
  if (country === 'DE') {
    return NextResponse.redirect(new URL('/de', request.url))
  }

  return response
}`,
        },
      ],
      useCases: [
        'Authentication/authorization middleware — validate tokens at the edge before reaching the origin',
        'A/B testing — assign buckets at the edge, no origin round-trip needed',
        'Geolocation-based personalization — redirect, localize, or customize content based on user location',
        'API response transformation — modify, filter, or enrich API responses at the edge',
      ],
      commonPitfalls: [
        'Database queries from the edge — if the DB is in us-east-1 and the edge is in Tokyo, the edge advantage is lost',
        'Using Node.js-specific APIs (fs, Buffer as Node module) — edge runtime does not support them',
        'Assuming edge is always faster — for compute-heavy tasks, a powerful origin server can be faster than a lightweight edge worker',
        'Not considering regional data residency — edge functions may process data in regions that violate compliance requirements',
      ],
      interviewTips: [
        'Explain the latency advantage: edge (50ms) vs origin (200-500ms) for users far from the origin region',
        'Describe the runtime limitation: Web APIs only, no Node.js. This is why lightweight middleware and personalization are the sweet spot',
        'Compare with Lambda@Edge: similar concept but Cloudflare Workers and Vercel Edge have faster cold starts',
        'Discuss the database problem: edge compute is fast, but the data still lives in a central region. Solution: distributed databases',
      ],
      relatedConcepts: [
        'streaming-ssr',
        'incremental-static-regeneration',
        'server-side-rendering',
        'service-workers',
      ],
      difficulty: 'advanced',
      tags: ['rendering', 'edge', 'cdn', 'performance', 'serverless'],
    },
    {
      id: 'hydration-mismatch',
      title: 'Hydration Mismatch',
      description:
        'A hydration mismatch occurs when the HTML rendered on the server does not match what React produces on the client during hydration. React warns about mismatches and in severe cases, throws away the server HTML and re-renders from scratch.',
      keyPoints: [
        'Hydration: React walks the existing server-rendered DOM and attaches event handlers — it expects the DOM to match exactly',
        'Common causes: Date.now(), Math.random(), window/document checks, different data on server vs client, browser extensions modifying DOM',
        'React 18 improved handling: minor mismatches log a warning but try to recover. Major mismatches (different elements) force a full client re-render',
        'suppressHydrationWarning: only use for intentional mismatches (e.g., timestamps that differ by milliseconds)',
        'Testing: run in production mode to see hydration warnings — development mode may mask some issues',
        'Browser extensions (ad blockers, translation tools) can modify DOM before hydration — nothing you can do about this',
        'Solution pattern: render shared content on both server and client, use useEffect for client-only content',
      ],
      codeExamples: [
        {
          language: 'tsx',
          label: 'Hydration mismatch causes and fixes',
          code: `// BUG: Date.now() produces different values on server and client
function Header() {
  return <span>Page loaded at: {Date.now()}</span>
  // Server: "Page loaded at: 1700000000"
  // Client: "Page loaded at: 1700000005" ← MISMATCH
}

// FIX: use client-only rendering for dynamic values
function Header() {
  const [time, setTime] = useState<number | null>(null)

  useEffect(() => {
    setTime(Date.now()) // only runs on client, after hydration
  }, [])

  return <span>Page loaded at: {time ?? 'Loading...'}</span>
}

// BUG: window check in render
function Layout() {
  const isMobile = window.innerWidth < 768 // ERROR: window is undefined on server
  return isMobile ? <MobileNav /> : <DesktopNav />
}

// FIX: default to a consistent value, update on client
function Layout() {
  const [isMobile, setIsMobile] = useState(false) // same on server and client

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  return isMobile ? <MobileNav /> : <DesktopNav />
}

// INTENTIONAL mismatch: suppress warning
function Timestamp({ date }: { date: Date }) {
  return (
    <time dateTime={date.toISOString()} suppressHydrationWarning>
      {date.toLocaleTimeString()} {/* may differ by timezone */}
    </time>
  )
}`,
        },
      ],
      useCases: [
        'Debugging white screens after deploying SSR — hydration failure causes full client re-render',
        'Handling timezone-dependent content — server renders in UTC, client in local timezone',
        'Browser-specific rendering — feature detection that differs between server and client',
        'Third-party script integration — scripts that modify DOM before React hydrates',
      ],
      commonPitfalls: [
        'Using typeof window !== "undefined" in render — produces different output on server vs client, causing mismatch',
        'Rendering user-specific content (locale, timezone) that differs between server and client environments',
        'Using suppressHydrationWarning everywhere — hides real bugs; only use for intentional, harmless mismatches',
        'Not testing in production mode — development mode may not show all hydration issues',
      ],
      interviewTips: [
        'Explain what hydration does: React walks the server-rendered DOM and attaches event handlers, expecting it to match',
        'Describe the consequences: minor mismatch = warning + recovery, major mismatch = full re-render (flicker, performance hit)',
        'Know the pattern: useState(defaultValue) + useEffect for client-only values — server and client agree on the default',
        'Mention React 18 improvements: better recovery from mismatches, but they are still bugs that should be fixed',
      ],
      relatedConcepts: [
        'server-side-rendering',
        'react-server-components',
        'streaming-ssr',
      ],
      difficulty: 'intermediate',
      tags: ['rendering', 'hydration', 'ssr', 'debugging', 'react'],
    },
  ],
}
