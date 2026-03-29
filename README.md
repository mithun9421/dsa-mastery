# DSA Mastery

> The engineering reference you wish existed 5 years ago.

A comprehensive, dark-themed learning app covering every CS concept a 10-year fullstack engineer needs — from algorithm internals to production system design. No surface-level explanations. Just the real stuff.

**Live:** [dsa-mastery-indol.vercel.app](https://dsa-mastery-indol.vercel.app)

---

## What's inside

6 deep-dive tabs, 200+ concepts, real TypeScript implementations, complexity analysis, interview tips, and pro-level insights for each topic.

### Algorithms
Sorting (TimSort internals, introsort, Dutch National Flag), Searching (binary search variants, search on answer), Graph (Dijkstra/Bellman-Ford/Floyd-Warshall/A\*/Tarjan/Kosaraju), Dynamic Programming (40+ patterns including digit DP, bitmask DP, tree DP), Greedy, Backtracking, String Algorithms (KMP/Aho-Corasick/suffix arrays), Bit Manipulation, Mathematical (modular arithmetic/FFT/CRT)

### Data Structures
Arrays (prefix sum/sparse table/monotonic stack), Linked Lists (skip lists/XOR lists), Stacks & Queues (monotonic variants), Trees (AVL/Red-Black/B+Tree/Segment Tree/Fenwick/Treap), Heaps (Fibonacci/binomial/indexed PQ), Hash Tables (robin hood/cuckoo/consistent hashing), Graphs, Tries (compressed/suffix/ternary), Union-Find (path compression + rank), Advanced (LRU/LFU/Bloom Filter/HyperLogLog/persistent DS)

### System Design
Scalability patterns, Database internals (ACID/isolation levels/sharding/WAL), Caching (all strategies + Redis architecture), Messaging (Kafka internals/RabbitMQ/outbox/saga), API Design (REST/GraphQL/gRPC/pagination), Distributed Systems (Paxos/Raft/vector clocks/gossip), **8 full real-world system designs** (Twitter feed, WhatsApp, Uber, Netflix, Google Search, URL shortener, distributed cache, rate limiter) with ASCII architecture diagrams and capacity estimation

### Frontend
React internals (fiber/reconciliation/RSC/concurrent), State management (Redux Toolkit/Zustand/Jotai/XState/TanStack Query), Performance (virtualization/web workers/bundle analysis/Core Web Vitals), Web APIs (Service Workers/WebRTC/IndexedDB/WebAssembly), Rendering strategies (CSR/SSR/SSG/ISR/streaming/islands), Advanced TypeScript (conditional types/mapped types/variance/template literals), Testing (RTL/MSW/Playwright)

### Backend
API design (idempotency/pagination/versioning), Authentication (JWT/OAuth 2.0/PKCE/refresh rotation/WebAuthn), Database patterns (N+1/query optimization/pessimistic vs optimistic locking/zero-downtime migrations), Security (SQL injection/CSRF/SSRF/rate limiting algorithms), Observability (distributed tracing/SLO/RED method), Background jobs (BullMQ/retry strategies/transactional enqueue)

### Architecture
All **23 GoF design patterns** with TypeScript implementations, SOLID (deep violations + trade-offs), Clean/Hexagonal/Onion architecture, Domain-Driven Design (bounded contexts/aggregates/domain events/sagas), Architectural styles (CQRS/event sourcing/microservices/service mesh/micro-frontends), Cloud patterns (strangler fig/bulkhead/circuit breaker/blue-green/canary/feature flags)

---

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Syntax highlighting | react-syntax-highlighter (oneDark) |
| Fonts | Inter + JetBrains Mono |
| Deployment | Vercel |

---

## Project structure

```
dsa-mastery/
├── app/
│   ├── [tab]/                    # Tab overview page
│   │   ├── [category]/           # Category concept grid
│   │   │   └── [concept]/        # Full concept detail
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Tab navigation
│   │   └── Sidebar.tsx           # Category + concept tree with search
│   └── concept/
│       ├── ConceptDetail.tsx     # Full concept view
│       ├── ConceptCard.tsx       # Compact concept card
│       └── ComplexityBadge.tsx   # Color-coded O() badge
├── content/
│   ├── algorithms/               # 9 category files
│   ├── dsa/                      # 10 category files
│   ├── system-design/            # 7 category files
│   ├── frontend/                 # 7 category files
│   ├── backend/                  # 7 category files
│   └── architecture/             # 6 category files
└── lib/
    ├── types.ts                  # Tab / Category / Concept interfaces
    └── content.ts                # getTab / getConcept / searchConcepts helpers
```

---

## Running locally

```bash
git clone https://github.com/mithun9421/dsa-mastery
cd dsa-mastery
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Adding content

Each content file exports a typed `Category` object. To add a new concept, add an entry to the relevant array in `content/<tab>/<category>.ts`:

```typescript
// content/algorithms/sorting.ts
export const sortingCategory: Category = {
  id: 'sorting',
  title: 'Sorting Algorithms',
  concepts: [
    {
      id: 'my-new-concept',
      title: 'My New Concept',
      description: 'Deep description...',
      difficulty: 'advanced',
      keyPoints: [...],
      codeExamples: [{ language: 'typescript', label: '...', code: '...' }],
      timeComplexity: { best: 'O(n)', average: 'O(n log n)', worst: 'O(n²)' },
      useCases: [...],
      commonPitfalls: [...],
      interviewTips: [...],
      tags: ['sorting', 'comparison'],
    }
  ]
}
```

The new concept shows up automatically in the UI — no routing changes needed.

---

## Design

- Background `#0a0a0a` · Cards `#111` · Border `#1f1f1f` · Accent `#6366f1`
- Difficulty: green (beginner) · blue (intermediate) · orange (advanced) · red (expert)
- Complexity badge colors: green O(1)/O(log n) · yellow O(n) · orange O(n log n) · red O(n²)+
