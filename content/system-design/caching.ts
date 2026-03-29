// @ts-nocheck
import type { Category } from '@/lib/types'

export const cachingCategory: Category = {
  id: 'caching',
  title: 'Caching',
  description: 'Caching strategies from application-level patterns to distributed Redis clusters — including eviction policies, stampede prevention, and CDN behavior.',
  icon: 'Zap',
  concepts: [
    {
      id: 'cache-aside',
      title: 'Cache-Aside (Lazy Loading)',
      description: 'The application manages the cache explicitly: check cache first, on miss query the database, then populate the cache. This is the most common caching pattern because it gives the application full control over what gets cached and when.',
      keyPoints: [
        'Application is responsible for reading from cache and writing to cache',
        'On cache hit: return cached data (fast path)',
        'On cache miss: query database, store result in cache, return data (slow path)',
        'Stale data risk: data changes in DB but cache still has old value — mitigated with TTL',
        'Thundering herd on cache miss: many concurrent requests for the same expired key all hit the DB simultaneously',
        'Lazy population: cache is populated only when data is requested — no wasted cache space on unrequested data',
        'Cache warming: pre-populate cache on startup or deployment to avoid cold-start miss storms',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Cache-Aside with Thundering Herd Protection',
          code: `import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

interface CacheOptions {
  ttlSeconds: number
  lockTimeoutMs?: number
}

// Simple cache-aside
async function cacheAside<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  // 1. Check cache
  const cached = await redis.get(key)
  if (cached !== null) {
    return JSON.parse(cached) as T
  }

  // 2. Cache miss — fetch from source
  const data = await fetchFn()

  // 3. Populate cache
  await redis.setex(key, options.ttlSeconds, JSON.stringify(data))

  return data
}

// Cache-aside with mutex lock (thundering herd protection)
async function cacheAsideWithLock<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const cached = await redis.get(key)
  if (cached !== null) {
    return JSON.parse(cached) as T
  }

  const lockKey = \`lock:\${key}\`
  const lockTimeout = options.lockTimeoutMs ?? 5000

  // Try to acquire lock
  const acquired = await redis.set(lockKey, '1', 'PX', lockTimeout, 'NX')

  if (acquired) {
    try {
      // Double-check cache (another request may have populated it)
      const rechecked = await redis.get(key)
      if (rechecked !== null) {
        return JSON.parse(rechecked) as T
      }

      const data = await fetchFn()
      await redis.setex(key, options.ttlSeconds, JSON.stringify(data))
      return data
    } finally {
      await redis.del(lockKey)
    }
  }

  // Lock not acquired — wait and retry from cache
  await new Promise((resolve) => setTimeout(resolve, 100))
  const retried = await redis.get(key)
  if (retried !== null) {
    return JSON.parse(retried) as T
  }

  // Fallback: fetch directly (lock holder may have failed)
  return fetchFn()
}

// Usage
const user = await cacheAsideWithLock(
  \`user:\${userId}\`,
  () => db.query('SELECT * FROM users WHERE id = $1', [userId]),
  { ttlSeconds: 300 }
)`,
        },
      ],
      useCases: [
        'Most read-heavy web applications — the default caching pattern',
        'User profiles, product details, configuration data — data that is read far more than written',
        'Microservices that query slow downstream services — cache the responses',
      ],
      commonPitfalls: [
        'No TTL: cached data never expires, becomes permanently stale',
        'TTL too short: cache provides little benefit, most requests still hit the DB',
        'TTL too long: stale data served for extended periods',
        'Not handling cache miss storms: 1000 requests for the same key after TTL expires all hit the DB',
        'Caching null/empty results without realizing it: cache says "no data" when data was added after the miss',
      ],
      interviewTips: [
        'This is the pattern interviewers expect you to know first — describe the read flow clearly',
        'Mention the thundering herd problem and the mutex lock solution',
        'Discuss TTL selection as a trade-off between staleness and database load',
      ],
      relatedConcepts: ['read-through-cache', 'cache-stampede', 'cache-eviction-policies', 'redis-architecture'],
      difficulty: 'intermediate',
      tags: ['caching', 'patterns', 'performance'],
      proTip: 'Probabilistic early expiration (PER) is an elegant alternative to mutex locks for thundering herd prevention. Instead of locking, each cache read has a small probability of triggering a background refresh before the TTL expires. The formula: should_refresh = random() < (beta * log(random())) + (now - fetched_at) / ttl. This is used by Facebook for their massive cache infrastructure.',
    },
    {
      id: 'read-through-cache',
      title: 'Read-Through Cache',
      description: 'In read-through caching, the cache itself is responsible for loading data from the database on a miss. The application only talks to the cache, never directly to the database for reads. This simplifies application code but couples your caching layer to your data source.',
      keyPoints: [
        'Cache sits between application and database — application reads only from cache',
        'On miss, the cache loads from DB transparently — application does not manage this',
        'Consistent read path: all reads go through cache, simplifying application logic',
        'Cold start problem: empty cache means all initial requests are cache misses — need warming strategy',
        'AWS ElastiCache for Redis supports read-through natively with data integration',
        'Less flexible than cache-aside: cache must know how to query the data source',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Read-Through Cache Abstraction',
          code: `import Redis from 'ioredis'

type DataLoader<T> = (key: string) => Promise<T | null>

class ReadThroughCache<T> {
  private readonly redis: Redis

  constructor(
    redisUrl: string,
    private readonly loader: DataLoader<T>,
    private readonly ttlSeconds: number
  ) {
    this.redis = new Redis(redisUrl)
  }

  async get(key: string): Promise<T | null> {
    // Application just calls get() — cache handles the rest
    const cached = await this.redis.get(key)

    if (cached !== null) {
      return JSON.parse(cached) as T
    }

    // Cache handles DB loading transparently
    const data = await this.loader(key)

    if (data !== null) {
      await this.redis.setex(key, this.ttlSeconds, JSON.stringify(data))
    }

    return data
  }

  async invalidate(key: string): Promise<void> {
    await this.redis.del(key)
  }

  // Warm the cache with a batch of keys
  async warm(keys: string[]): Promise<void> {
    const pipeline = this.redis.pipeline()
    const results = await Promise.all(keys.map((k) => this.loader(k)))

    results.forEach((data, i) => {
      if (data !== null) {
        pipeline.setex(keys[i], this.ttlSeconds, JSON.stringify(data))
      }
    })

    await pipeline.exec()
  }
}

// Usage — application never touches DB for reads
const userCache = new ReadThroughCache<User>(
  process.env.REDIS_URL!,
  async (key) => {
    const userId = key.replace('user:', '')
    return db.query('SELECT * FROM users WHERE id = $1', [userId])
  },
  300
)

const user = await userCache.get(\`user:\${userId}\`)`,
        },
      ],
      useCases: [
        'Applications with simple read patterns — one key maps to one DB query',
        'Content delivery: CMS content, product catalogs, configuration data',
        'When you want to decouple cache management from business logic',
      ],
      commonPitfalls: [
        'Cold start: deploying a new cache instance means 100% miss rate initially — pre-warm with common keys',
        'Loader function errors: if the DB query fails, the cache should not cache the error',
        'Tight coupling: the cache must understand the data source schema — harder to change either independently',
      ],
      interviewTips: [
        'Compare with cache-aside: read-through is simpler for the application but less flexible',
        'Mention cache warming as the solution to the cold start problem',
        'Discuss that AWS DAX (DynamoDB Accelerator) is a production example of read-through caching',
      ],
      relatedConcepts: ['cache-aside', 'write-through-cache', 'cache-eviction-policies'],
      difficulty: 'intermediate',
      tags: ['caching', 'patterns', 'performance'],
    },
    {
      id: 'write-through-cache',
      title: 'Write-Through Cache',
      description: 'Write-through caching writes data to both the cache and the database synchronously. The write is only considered successful when both the cache and database have been updated. This eliminates stale data but adds write latency.',
      keyPoints: [
        'Every write updates cache AND database synchronously — no stale data by design',
        'Write latency doubles: you pay the cost of writing to two systems on every write',
        'Orphaned entries: if a key is in cache but never read, you waste cache memory',
        'Best combined with read-through: write-through ensures cache is always fresh, read-through serves from cache',
        'Consistency guarantee: cache always reflects the latest database state',
        'Not suitable for write-heavy workloads: the double-write overhead is prohibitive',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Write-Through Cache',
          code: `import Redis from 'ioredis'
import { Pool } from 'pg'

const redis = new Redis(process.env.REDIS_URL!)
const db = new Pool({ connectionString: process.env.DATABASE_URL })

async function writeThrough<T extends Record<string, unknown>>(
  cacheKey: string,
  dbQuery: string,
  dbParams: unknown[],
  data: T,
  ttlSeconds: number
): Promise<void> {
  // Write to database first (source of truth)
  await db.query(dbQuery, dbParams)

  // Then write to cache (synchronous — both must succeed)
  await redis.setex(cacheKey, ttlSeconds, JSON.stringify(data))
}

// Usage
async function updateUserProfile(
  userId: string,
  updates: { name: string; bio: string }
): Promise<void> {
  const updatedUser = { id: userId, ...updates }

  await writeThrough(
    \`user:\${userId}\`,
    'UPDATE users SET name = $1, bio = $2 WHERE id = $3 RETURNING *',
    [updates.name, updates.bio, userId],
    updatedUser,
    300
  )
}`,
        },
      ],
      useCases: [
        'User profile data: written infrequently, read very frequently',
        'Configuration settings: must always be consistent, changed rarely',
        'Product catalog prices: cannot serve stale prices to customers',
      ],
      commonPitfalls: [
        'Wasting cache memory on write-only data that is never read',
        'Not handling the case where DB write succeeds but cache write fails — need retry or invalidation',
        'Using write-through for high-write workloads: the overhead makes it impractical',
      ],
      interviewTips: [
        'Emphasize the consistency benefit — no stale data, at the cost of write latency',
        'Compare with write-back: write-through is safer (no data loss) but slower',
        'Mention that combining write-through + read-through gives you a fully transparent cache layer',
      ],
      relatedConcepts: ['write-back-cache', 'read-through-cache', 'cache-aside'],
      difficulty: 'intermediate',
      tags: ['caching', 'patterns', 'consistency'],
    },
    {
      id: 'write-back-cache',
      title: 'Write-Back (Write-Behind)',
      description: 'Write-back caching writes to the cache immediately and asynchronously flushes to the database later. This provides the lowest write latency but risks data loss if the cache fails before flushing.',
      keyPoints: [
        'Write to cache immediately, return success to the client — database updated asynchronously',
        'Lowest write latency: only the cache write is in the critical path',
        'Data loss risk: if cache (Redis) crashes before flushing to DB, data is lost',
        'Batch writes: accumulate changes and flush to DB in batches — reduces DB load',
        'Use cases: counters, view counts, analytics — where losing a few data points is acceptable',
        'Coalescing: multiple writes to the same key result in a single DB write — great for frequently-updated data',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Write-Behind with Batch Flush',
          code: `import Redis from 'ioredis'
import { Pool } from 'pg'

const redis = new Redis(process.env.REDIS_URL!)
const db = new Pool({ connectionString: process.env.DATABASE_URL })

class WriteBehindCache {
  private readonly dirtyKeys = new Set<string>()
  private flushInterval: NodeJS.Timeout | null = null

  constructor(
    private readonly flushIntervalMs: number = 5000,
    private readonly batchSize: number = 100
  ) {}

  start(): void {
    this.flushInterval = setInterval(
      () => this.flush(),
      this.flushIntervalMs
    )
  }

  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    // Final flush on shutdown
    this.flush()
  }

  // Fast write — only touches cache
  async write(key: string, value: unknown): Promise<void> {
    await redis.set(key, JSON.stringify(value))
    this.dirtyKeys.add(key)
  }

  // Increment counter — purely in Redis
  async increment(key: string): Promise<number> {
    const result = await redis.incr(key)
    this.dirtyKeys.add(key)
    return result
  }

  // Periodic flush to database
  private async flush(): Promise<void> {
    if (this.dirtyKeys.size === 0) return

    const keysToFlush = Array.from(this.dirtyKeys).slice(0, this.batchSize)
    const pipeline = redis.pipeline()

    for (const key of keysToFlush) {
      pipeline.get(key)
    }

    const results = await pipeline.exec()
    if (!results) return

    // Batch insert/update to DB
    const values = keysToFlush.map((key, i) => {
      const value = results[i]?.[1] as string | null
      return { key, value }
    }).filter((v) => v.value !== null)

    if (values.length > 0) {
      const query = \`
        INSERT INTO cache_store (key, value, updated_at)
        VALUES \${values.map((_, i) =>
          \`($\${i * 2 + 1}, $\${i * 2 + 2}, NOW())\`
        ).join(', ')}
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = NOW()
      \`
      const params = values.flatMap((v) => [v.key, v.value])
      await db.query(query, params)
    }

    for (const key of keysToFlush) {
      this.dirtyKeys.delete(key)
    }
  }
}

// Usage: page view counter (losing a few counts is fine)
const cache = new WriteBehindCache(5000, 100)
cache.start()

async function trackPageView(pageId: string): Promise<void> {
  await cache.increment(\`views:\${pageId}\`)
}`,
        },
      ],
      useCases: [
        'View counters, like counts, impression tracking — high write volume, occasional data loss is acceptable',
        'Session data: fast writes, periodic flush, data loss on crash means user re-authenticates',
        'Analytics events: buffer in Redis, batch insert to database/data warehouse',
        'Gaming leaderboards: real-time score updates in cache, periodic persistence',
      ],
      commonPitfalls: [
        'Using write-back for financial data: losing a payment record is catastrophic',
        'Flush interval too long: too much data at risk of loss',
        'Not handling flush failures: if the DB is down, dirty keys accumulate and Redis fills up',
        'Not flushing on graceful shutdown: lose all buffered writes when the process exits',
      ],
      interviewTips: [
        'Be clear about the data loss risk — this is the key trade-off',
        'Mention write coalescing as the hidden benefit: 1000 writes to the same key = 1 DB write',
        'Compare with write-through: write-back is faster but unsafe, write-through is slower but consistent',
      ],
      relatedConcepts: ['write-through-cache', 'cache-aside', 'redis-architecture'],
      difficulty: 'intermediate',
      tags: ['caching', 'patterns', 'performance'],
      proTip: 'Redis with AOF persistence (appendfsync everysec) combined with write-back gives you a middle ground: you lose at most 1 second of data on Redis crash, and the DB flush can happen at a leisurely pace. This is how many real-time analytics systems work.',
    },
    {
      id: 'write-around',
      title: 'Write-Around',
      description: 'Write-around caching writes directly to the database, bypassing the cache entirely. The cache is only populated on reads (via cache-aside). This is optimal for write-heavy data that is rarely read back immediately.',
      keyPoints: [
        'Writes go directly to DB, cache is not updated on write',
        'Cache is populated only on read (via cache-aside or read-through)',
        'Best for data that is written frequently but read infrequently',
        'Prevents cache pollution: write-heavy data does not evict more-read data from cache',
        'Common for CDN patterns: origin writes new content, CDN pulls it when requested',
        'Trade-off: first read after a write always misses the cache',
      ],
      useCases: [
        'Log ingestion: write millions of log entries, read only during investigation',
        'Bulk data imports: loading CSV data into DB — no point caching it during import',
        'Large binary data: uploaded files written to S3, cached at CDN edge only on first request',
        'Audit trails: written on every action, rarely queried',
      ],
      commonPitfalls: [
        'Not invalidating stale cache entries: if data was cached before the write, the cache now has stale data',
        'Using write-around when read-after-write is common: user uploads a photo and immediately views it — cache miss on every upload',
      ],
      interviewTips: [
        'Mention write-around as the strategy for write-heavy, read-light workloads',
        'Contrast with write-through: write-around is better when cached data would mostly be evicted before being read',
      ],
      relatedConcepts: ['cache-aside', 'write-through-cache', 'cdn-caching'],
      difficulty: 'beginner',
      tags: ['caching', 'patterns'],
    },
    {
      id: 'cache-eviction-policies',
      title: 'Cache Eviction Policies',
      description: 'When the cache is full, something must go. The eviction policy determines which entries to remove. LRU is the default for good reason, but understanding alternatives helps you choose the right one for your access pattern.',
      keyPoints: [
        'LRU (Least Recently Used): evict the entry that was accessed least recently — best general-purpose default',
        'LRU implementation: doubly-linked list + hash map — O(1) get and put (LinkedHashMap in Java)',
        'LFU (Least Frequently Used): evict the entry with the fewest accesses — better for frequency-skewed workloads',
        'LFU implementation: min-frequency heap or frequency buckets with linked lists',
        'ARC (Adaptive Replacement Cache): automatically balances between recency and frequency — used in ZFS',
        'LIRS (Low Inter-reference Recency Set): tracks inter-reference distance, outperforms LRU for many workloads',
        'Random eviction: surprisingly effective — O(1) and within 10% of LRU performance for most workloads',
        'Redis uses approximated LRU (samples 5 keys, evicts the least recently used) — good enough and much cheaper than exact LRU',
        'TTL-based expiration: not an eviction policy per se, but entries expire after a time regardless of access pattern',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'LRU Cache Implementation',
          code: `class LRUCache<K, V> {
  private readonly map = new Map<K, V>()

  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined

    // Move to end (most recently used)
    const value = this.map.get(key)!
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }

  put(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key)
    } else if (this.map.size >= this.capacity) {
      // Evict least recently used (first entry in Map)
      const firstKey = this.map.keys().next().value
      if (firstKey !== undefined) {
        this.map.delete(firstKey)
      }
    }
    this.map.set(key, value)
  }

  get size(): number {
    return this.map.size
  }
}

// JS Map maintains insertion order, so:
// - First entry = least recently used
// - Last entry = most recently used
// - Delete + re-insert = move to most recent

const cache = new LRUCache<string, User>(1000)
cache.put('user:1', { id: '1', name: 'Alice' })
const user = cache.get('user:1') // Moves to most-recent position`,
        },
      ],
      ascii: `
  LRU: Evict least recently accessed
  ┌─────────────────────────────┐
  │ LEAST RECENT ──────> MOST RECENT │
  │ [D] [A] [B] [E] [C]            │
  │  ↑                              │
  │  Evict this one                 │
  └─────────────────────────────┘

  LFU: Evict least frequently accessed
  ┌─────────────────────────────┐
  │ Key  │ Frequency            │
  │  D   │  1  ← Evict          │
  │  A   │  3                   │
  │  B   │  7                   │
  │  E   │  2                   │
  │  C   │  15                  │
  └─────────────────────────────┘`,
      useCases: [
        'LRU: most web applications — recently accessed data is likely to be accessed again (temporal locality)',
        'LFU: CDN caching — popular content should stay cached regardless of when it was last accessed',
        'TTL: session caches — sessions should expire after a fixed time regardless of activity',
        'Random: high-throughput systems where eviction overhead must be minimal',
      ],
      commonPitfalls: [
        'LRU pollution: a full table scan reads every item once, evicting frequently-used items — use LRU-K or ARC instead',
        'LFU starvation: new items have low frequency and get evicted immediately — use LFU with aging/decay',
        'Not monitoring eviction rate: high eviction rate means your cache is too small or your TTLs are wrong',
        'Assuming Redis LRU is exact: Redis samples random keys and evicts the LRU among the sample — good enough but not perfect',
      ],
      interviewTips: [
        'Implement LRU from scratch (doubly-linked list + hashmap) — this is a top-10 LeetCode question',
        'Explain why LRU is the default: temporal locality is the most common access pattern',
        'Mention that Redis uses approximate LRU for efficiency — shows production awareness',
      ],
      relatedConcepts: ['cache-aside', 'redis-architecture', 'cache-stampede'],
      difficulty: 'intermediate',
      tags: ['caching', 'algorithms', 'data-structures'],
      proTip: 'LeetCode #146 (LRU Cache) is one of the most frequently asked interview questions. The trick is using a Map (which maintains insertion order in JS) or a doubly-linked list + hashmap in other languages. Practice until you can write it in 5 minutes.',
    },
    {
      id: 'cache-stampede',
      title: 'Cache Stampede / Thundering Herd',
      description: 'When a popular cache key expires, hundreds of concurrent requests simultaneously discover the miss and all query the database. This "stampede" can overwhelm the database. It is the most dangerous caching problem in production and has brought down many systems.',
      keyPoints: [
        'Trigger: a hot key with many concurrent readers expires simultaneously',
        'Probabilistic early expiration: each request has a chance of refreshing the cache before TTL expires — no coordination needed',
        'Mutex/lock approach: first request acquires a lock, fetches data, populates cache — others wait or serve stale',
        'Background refresh: a background job refreshes the cache before expiration — cache never actually expires',
        'Staggered TTLs: add random jitter to TTL (e.g., TTL = 300 +/- 30 seconds) — prevents synchronized expiration',
        'External recompute: use Redis SETNX as a distributed lock to ensure only one process recomputes',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Multiple Stampede Prevention Strategies',
          code: `import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

// Strategy 1: Probabilistic Early Expiration (XFetch algorithm)
async function xfetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number,
  beta: number = 1.0
): Promise<T> {
  const raw = await redis.get(key)

  if (raw !== null) {
    const { value, fetchedAt, ttl } = JSON.parse(raw) as {
      value: T
      fetchedAt: number
      ttl: number
    }
    const age = (Date.now() - fetchedAt) / 1000
    const remaining = ttl - age

    // Probabilistic early expiration
    // As remaining time approaches 0, probability of refresh increases
    const shouldRefresh = remaining - beta * Math.log(Math.random()) <= 0

    if (!shouldRefresh && remaining > 0) {
      return value
    }
  }

  // Fetch and cache
  const value = await fetchFn()
  const envelope = {
    value,
    fetchedAt: Date.now(),
    ttl: ttlSeconds,
  }
  await redis.setex(key, ttlSeconds, JSON.stringify(envelope))
  return value
}

// Strategy 2: Staggered TTL
function staggeredTtl(baseTtl: number, jitterPercent: number = 10): number {
  const jitter = baseTtl * (jitterPercent / 100)
  return Math.floor(baseTtl + Math.random() * jitter * 2 - jitter)
}

// Strategy 3: Background Refresh (never-expire pattern)
class BackgroundRefreshCache<T> {
  private refreshTimers = new Map<string, NodeJS.Timeout>()

  constructor(
    private readonly fetchFn: (key: string) => Promise<T>,
    private readonly ttlSeconds: number
  ) {}

  async get(key: string): Promise<T | null> {
    const cached = await redis.get(key)

    if (cached !== null) {
      // Schedule background refresh at 80% of TTL
      if (!this.refreshTimers.has(key)) {
        const refreshAt = this.ttlSeconds * 0.8 * 1000
        const timer = setTimeout(
          () => this.refresh(key),
          refreshAt
        )
        this.refreshTimers.set(key, timer)
      }
      return JSON.parse(cached) as T
    }

    return this.refresh(key)
  }

  private async refresh(key: string): Promise<T> {
    this.refreshTimers.delete(key)
    const data = await this.fetchFn(key)
    await redis.setex(key, this.ttlSeconds, JSON.stringify(data))
    return data
  }
}`,
        },
      ],
      useCases: [
        'Any cache key accessed by many concurrent users (homepage data, popular product pages)',
        'Flash sale pages: millions of users hitting the same product cache key',
        'API rate limit counters during traffic spikes',
      ],
      commonPitfalls: [
        'Ignoring the problem entirely: works fine until a traffic spike exposes it',
        'Mutex lock without timeout: if the lock holder crashes, all requests block forever',
        'Background refresh without monitoring: if the refresh job fails, cache goes stale silently',
      ],
      interviewTips: [
        'Name all three solutions (probabilistic, mutex, background refresh) and explain trade-offs',
        'XFetch/probabilistic early expiration is the most elegant — it requires no coordination between processes',
        'Mention that Facebook uses probabilistic early expiration at scale',
      ],
      relatedConcepts: ['cache-aside', 'cache-penetration', 'cache-breakdown', 'redis-architecture'],
      difficulty: 'advanced',
      tags: ['caching', 'reliability', 'production'],
      proTip: 'The XFetch algorithm from the paper "Optimal Probabilistic Cache Stampede Prevention" is mathematically proven to minimize the expected number of redundant recomputations. Set beta=1.0 for most workloads. Higher beta values cause earlier refreshes (more aggressive but safer).',
    },
    {
      id: 'cache-penetration',
      title: 'Cache Penetration',
      description: 'Cache penetration occurs when requests for non-existent data bypass the cache and hit the database every time. Since the data does not exist, there is nothing to cache, and every request is a cache miss. Attackers can exploit this to DDoS your database.',
      keyPoints: [
        'Null caching: cache the "not found" result with a short TTL (60-300 seconds) — prevents repeated DB lookups',
        'Bloom filter guard: a space-efficient probabilistic data structure that tells you if an item definitely does NOT exist',
        'Bloom filter: false positives possible (says "maybe exists"), false negatives impossible (says "definitely not")',
        'Combined approach: bloom filter first (fast reject), then cache check, then DB query',
        'Distributed lock on cache miss: only one request queries the DB, others wait — prevents parallel penetration',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Cache Penetration Protection with Bloom Filter',
          code: `import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

// Null caching — cache the absence of data
async function getWithNullCache<T>(
  key: string,
  fetchFn: () => Promise<T | null>,
  ttlSeconds: number,
  nullTtlSeconds: number = 60
): Promise<T | null> {
  const cached = await redis.get(key)

  if (cached === '__NULL__') {
    return null // Known non-existent — don't hit DB
  }

  if (cached !== null) {
    return JSON.parse(cached) as T
  }

  const data = await fetchFn()

  if (data === null) {
    // Cache the null result with a short TTL
    await redis.setex(key, nullTtlSeconds, '__NULL__')
    return null
  }

  await redis.setex(key, ttlSeconds, JSON.stringify(data))
  return data
}

// Bloom filter using Redis BF.* commands (RedisBloom module)
class BloomFilterGuard {
  constructor(
    private readonly filterName: string,
    private readonly redis: Redis
  ) {}

  async mightExist(key: string): Promise<boolean> {
    // Returns 1 if might exist, 0 if definitely doesn't
    const result = await this.redis.call('BF.EXISTS', this.filterName, key)
    return result === 1
  }

  async add(key: string): Promise<void> {
    await this.redis.call('BF.ADD', this.filterName, key)
  }
}

// Combined approach
const bloomFilter = new BloomFilterGuard('user_ids', redis)

async function getUser(userId: string): Promise<User | null> {
  // Step 1: Bloom filter — fast reject for non-existent IDs
  const mightExist = await bloomFilter.mightExist(userId)
  if (!mightExist) {
    return null // Definitely doesn't exist — skip cache and DB
  }

  // Step 2: Cache check + null caching for the rest
  return getWithNullCache(
    \`user:\${userId}\`,
    () => db.query('SELECT * FROM users WHERE id = $1', [userId]),
    300,
    60
  )
}`,
        },
      ],
      useCases: [
        'User profile lookups by ID: random/sequential ID scanning by attackers',
        'URL shortener: checking if a short code exists — millions of non-existent codes can be tried',
        'Any system where the key space is much larger than the actual data (e.g., UUIDs)',
      ],
      commonPitfalls: [
        'Null cache TTL too long: if the data is actually created, the cache blocks access to it',
        'Not using null caching at all: trivial to exploit with sequential ID scanning',
        'Bloom filter false positive rate too high: too many unnecessary DB queries',
        'Bloom filter not updated: new data added to DB but not to the bloom filter',
      ],
      interviewTips: [
        'Mention both null caching and bloom filter — they are complementary strategies',
        'Explain the bloom filter property: no false negatives, possible false positives',
        'Discuss the attack vector: an attacker sends requests for millions of non-existent IDs to overwhelm the DB',
      ],
      relatedConcepts: ['cache-aside', 'cache-stampede', 'cache-breakdown'],
      difficulty: 'intermediate',
      tags: ['caching', 'security', 'performance'],
    },
    {
      id: 'cache-breakdown',
      title: 'Cache Breakdown',
      description: 'Cache breakdown occurs when a single extremely popular ("hot") key expires, causing a massive spike of concurrent requests to the database. Unlike cache stampede (many keys expiring), breakdown is about ONE key being so hot that its expiration creates a crisis.',
      keyPoints: [
        'Hot key: a single cache key accessed by thousands of requests per second (homepage data, viral content)',
        'Expiration crisis: when this one key expires, all concurrent readers hit the database simultaneously',
        'Distributed mutex: use Redis SETNX to ensure only one process rebuilds the cache',
        'Never-expire + background update: keep the key alive forever, update it periodically in the background',
        'Layered caching: local in-memory cache (L1) in front of Redis (L2) — even if Redis key expires, L1 absorbs the spike',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Hot Key Protection',
          code: `import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

// Never-expire pattern for hot keys
class HotKeyManager {
  private refreshIntervals = new Map<string, NodeJS.Timeout>()

  async setHotKey<T>(
    key: string,
    fetchFn: () => Promise<T>,
    refreshIntervalSeconds: number
  ): Promise<void> {
    // Initial population
    const data = await fetchFn()
    await redis.set(key, JSON.stringify(data)) // No TTL — never expires

    // Schedule periodic refresh
    const interval = setInterval(async () => {
      try {
        const freshData = await fetchFn()
        await redis.set(key, JSON.stringify(freshData))
      } catch (error) {
        // Keep serving stale data rather than removing the key
        console.error(\`Failed to refresh hot key \${key}\`, error)
      }
    }, refreshIntervalSeconds * 1000)

    this.refreshIntervals.set(key, interval)
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) as T : null
  }

  stop(key: string): void {
    const interval = this.refreshIntervals.get(key)
    if (interval) {
      clearInterval(interval)
      this.refreshIntervals.delete(key)
    }
  }
}

// Usage: homepage trending data
const hotKeys = new HotKeyManager()

await hotKeys.setHotKey(
  'trending:homepage',
  () => db.query('SELECT * FROM trending_items LIMIT 50'),
  30 // Refresh every 30 seconds
)`,
        },
      ],
      useCases: [
        'Homepage content: the single most-requested cache key in most web applications',
        'Viral content: a post going viral creates a temporary hot key',
        'Global configuration: feature flags, site settings — read by every request',
      ],
      commonPitfalls: [
        'Treating all keys the same: hot keys need special handling that normal keys do not',
        'Background refresh failure: if the refresh fails and the key has no TTL, stale data is served forever',
        'Not identifying hot keys: use Redis OBJECT FREQ or monitor to find them',
      ],
      interviewTips: [
        'Distinguish breakdown (one hot key) from stampede (many keys) — they require different solutions',
        'The never-expire + background refresh pattern is the standard answer for hot keys',
        'Mention layered caching (local + distributed) as a defense-in-depth approach',
      ],
      relatedConcepts: ['cache-stampede', 'cache-aside', 'redis-architecture'],
      difficulty: 'intermediate',
      tags: ['caching', 'reliability', 'production'],
    },
    {
      id: 'redis-architecture',
      title: 'Redis Architecture',
      description: 'Redis is a single-threaded, in-memory data structure server. Understanding its threading model, persistence options, and clustering architecture is essential because Redis is in the critical path of almost every modern web application.',
      keyPoints: [
        'Single-threaded event loop: one thread handles all commands — no lock contention, predictable latency',
        'I/O threading (Redis 6+): I/O operations run on multiple threads, but command execution is still single-threaded',
        'RDB snapshots: periodic point-in-time snapshots (fork + COW) — fast recovery but data loss between snapshots',
        'AOF (Append-Only File): logs every write command — 3 modes: always (every write), everysec (default, up to 1s loss), no (OS decides)',
        'RDB + AOF: use both — AOF for durability, RDB for fast restarts and backups',
        'Replication: async by default, one primary with multiple replicas — replicas serve reads',
        'Redis Sentinel: automatic failover for master-replica setup — monitors, notifies, promotes replicas',
        'Redis Cluster: automatic sharding across 16384 hash slots — horizontal scaling for both reads and writes',
        'Sentinel vs Cluster: Sentinel is for HA only (one dataset), Cluster is for HA + sharding (distributed dataset)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Redis Cluster Connection with Fallbacks',
          code: `import Redis, { Cluster } from 'ioredis'

// Redis Cluster — auto-sharding across nodes
const cluster = new Cluster([
  { host: 'redis-1', port: 6379 },
  { host: 'redis-2', port: 6379 },
  { host: 'redis-3', port: 6379 },
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD,
    connectTimeout: 5000,
    maxRetriesPerRequest: 3,
  },
  // Cluster-specific options
  clusterRetryStrategy: (times) => {
    if (times > 3) return null // Stop retrying
    return Math.min(times * 200, 2000)
  },
  enableReadyCheck: true,
  scaleReads: 'slave', // Read from replicas for scalability
})

cluster.on('error', (err) => {
  console.error('Redis Cluster error:', err.message)
})

// Sentinel — HA without sharding
const sentinel = new Redis({
  sentinels: [
    { host: 'sentinel-1', port: 26379 },
    { host: 'sentinel-2', port: 26379 },
    { host: 'sentinel-3', port: 26379 },
  ],
  name: 'mymaster', // Sentinel master name
  role: 'master',   // Connect to current master
  sentinelPassword: process.env.SENTINEL_PASSWORD,
  password: process.env.REDIS_PASSWORD,
})

// Pipeline for batch operations (reduces round trips)
async function batchGet(keys: string[]): Promise<(string | null)[]> {
  const pipeline = cluster.pipeline()
  for (const key of keys) {
    pipeline.get(key)
  }
  const results = await pipeline.exec()
  return (results ?? []).map(([err, val]) => {
    if (err) return null
    return val as string | null
  })
}`,
        },
      ],
      ascii: `
  Redis Sentinel (HA):              Redis Cluster (HA + Sharding):
  ┌─────────────┐                   ┌─────────────────────────────┐
  │ Sentinel x3 │                   │   16384 hash slots          │
  │ (monitoring) │                  │   distributed across nodes   │
  └──────┬──────┘                   └──────────────────────────────┘
         │ failover
  ┌──────▼──────┐                   ┌────────┐ ┌────────┐ ┌────────┐
  │   Master    │                   │Node A  │ │Node B  │ │Node C  │
  │  (R+W)      │                   │0-5460  │ │5461-   │ │10923-  │
  └──────┬──────┘                   │        │ │10922   │ │16383   │
    ┌────┼────┐                     │ +replica│ │+replica│ │+replica│
    ▼    ▼    ▼                     └────────┘ └────────┘ └────────┘
  [R1] [R2] [R3]
  (read replicas)                   Each node owns a range of slots.
                                    Client routes by: CRC16(key) % 16384`,
      useCases: [
        'Session storage: fast reads/writes, TTL for expiration, replicated for HA',
        'Caching: most popular caching backend — cache-aside, read-through patterns',
        'Rate limiting: INCR + EXPIRE or sorted sets for sliding window',
        'Leaderboards: sorted sets with ZADD/ZRANGEBYSCORE — O(log n) insert, O(log n + m) range query',
        'Pub/Sub: lightweight messaging for real-time features (but not durable — use Kafka for that)',
        'Distributed locking: SETNX-based locks (but consider Redlock controversy)',
      ],
      commonPitfalls: [
        'No persistence configured: Redis restart = all data lost — always enable at least RDB',
        'Maxmemory not set: Redis grows until it OOMs the server — set maxmemory + eviction policy',
        'Using Redis as a primary database: Redis is a cache/store, not a durable database — data loss is possible',
        'KEYS command in production: blocks the event loop scanning all keys — use SCAN instead',
        'Large values (>100KB): Redis is optimized for small values — large values block the event loop during serialization',
      ],
      interviewTips: [
        'Explain the single-threaded model and why it is actually an advantage (no locks, predictable performance)',
        'Discuss persistence trade-offs: RDB (fast recovery) vs AOF (durability) vs both',
        'Know the Sentinel vs Cluster distinction — Sentinel for HA, Cluster for HA + horizontal scaling',
        'Mention that Redis 7.0+ supports functions (Lua replacement) and is moving toward multi-threaded operations',
      ],
      relatedConcepts: ['cache-aside', 'rate-limiting', 'distributed-locking', 'redis-data-structures'],
      difficulty: 'intermediate',
      tags: ['caching', 'infrastructure', 'redis'],
      proTip: 'The biggest Redis performance killer in production is not CPU — it is network round trips. Use pipelines to batch commands (10-100x throughput improvement) and Lua scripts for atomic multi-step operations. A single Lua script replacing 5 round trips can reduce latency from 5ms to 1ms.',
    },
    {
      id: 'redis-data-structures',
      title: 'Redis Data Structures',
      description: 'Redis is not just a key-value store — it is a data structure server. Strings, lists, sets, sorted sets, hashes, streams, HyperLogLog, and geo indexes each solve specific problems. Choosing the right data structure is often the difference between an elegant solution and a hack.',
      keyPoints: [
        'String: basic key-value, also used for counters (INCR), bit operations, and serialized objects',
        'List: doubly-linked list — LPUSH/RPOP for queues, LRANGE for paginated feeds, blocking pops (BLPOP) for work queues',
        'Set: unordered unique elements — SADD/SMEMBERS, set operations (SINTER, SUNION, SDIFF) for tags, friends',
        'Sorted Set (ZSET): set with scores — ZADD/ZRANGEBYSCORE for leaderboards, rate limiting, priority queues',
        'Hash: field-value pairs under one key — HSET/HGET for objects (user profiles), memory-efficient for small hashes',
        'Stream: append-only log with consumer groups — event streaming, activity feeds, replaces Pub/Sub for durable messaging',
        'HyperLogLog: probabilistic cardinality estimation (0.81% error) — count unique visitors with 12KB memory regardless of cardinality',
        'Geo: geospatial index — GEOADD/GEOSEARCH for nearby locations, ride-sharing driver matching',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Redis Data Structures in Practice',
          code: `import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

// SORTED SET: Real-time leaderboard
async function updateScore(userId: string, score: number): Promise<void> {
  await redis.zadd('leaderboard', score, userId)
}

async function getTopPlayers(count: number): Promise<Array<{ userId: string; score: number }>> {
  const results = await redis.zrevrange('leaderboard', 0, count - 1, 'WITHSCORES')
  const players: Array<{ userId: string; score: number }> = []
  for (let i = 0; i < results.length; i += 2) {
    players.push({ userId: results[i], score: parseFloat(results[i + 1]) })
  }
  return players
}

async function getRank(userId: string): Promise<number | null> {
  const rank = await redis.zrevrank('leaderboard', userId)
  return rank !== null ? rank + 1 : null // 1-indexed
}

// HYPERLOGLOG: Count unique visitors (12KB regardless of count)
async function trackVisitor(pageId: string, visitorId: string): Promise<void> {
  await redis.pfadd(\`visitors:\${pageId}\`, visitorId)
}

async function getUniqueVisitorCount(pageId: string): Promise<number> {
  return redis.pfcount(\`visitors:\${pageId}\`)
}

// STREAM: Durable event log with consumer groups
async function publishEvent(stream: string, event: Record<string, string>): Promise<string> {
  return redis.xadd(stream, '*', ...Object.entries(event).flat())
}

async function consumeEvents(
  stream: string,
  group: string,
  consumer: string,
  count: number = 10
): Promise<Array<[string, string[]]>> {
  // Create group if it doesn't exist
  try {
    await redis.xgroup('CREATE', stream, group, '0', 'MKSTREAM')
  } catch {
    // Group already exists
  }

  const results = await redis.xreadgroup(
    'GROUP', group, consumer,
    'COUNT', count,
    'BLOCK', 5000,
    'STREAMS', stream, '>'
  )

  return results?.[0]?.[1] ?? []
}

// GEO: Find nearby drivers
async function updateDriverLocation(
  driverId: string, lat: number, lng: number
): Promise<void> {
  await redis.geoadd('drivers', lng, lat, driverId)
}

async function findNearbyDrivers(
  lat: number, lng: number, radiusKm: number
): Promise<string[]> {
  return redis.geosearch(
    'drivers', 'FROMLONLAT', lng, lat,
    'BYRADIUS', radiusKm, 'km',
    'ASC', 'COUNT', 10
  )
}`,
        },
      ],
      useCases: [
        'String + INCR: rate limiting counters, API quota tracking, distributed ID generation',
        'Sorted Set: leaderboards, delayed job scheduling (score = execution timestamp), sliding window rate limiter',
        'HyperLogLog: unique visitor counting, cardinality estimation for analytics',
        'Stream: event sourcing, activity feeds, durable pub/sub with consumer groups',
        'Geo: ride-sharing driver matching, store locator, delivery radius checking',
        'Hash: user sessions (multiple fields), feature flags (one hash per environment)',
      ],
      commonPitfalls: [
        'Using String for everything: storing serialized JSON when a Hash would be more memory-efficient and allow partial updates',
        'Not setting maxmemory-policy: default is noeviction — Redis returns errors when full instead of evicting',
        'Large sorted sets without ZRANGEBYSCORE limits: fetching millions of members blocks the event loop',
        'Using Pub/Sub for durable messaging: subscribers that disconnect lose messages — use Streams instead',
      ],
      interviewTips: [
        'Match the data structure to the problem — this shows Redis expertise',
        'Leaderboard with sorted set is a classic interview question — know ZADD, ZRANK, ZREVRANGE',
        'HyperLogLog is impressive to mention — counting 100M unique IPs with 12KB is a great talking point',
      ],
      relatedConcepts: ['redis-architecture', 'rate-limiting', 'cache-eviction-policies'],
      difficulty: 'intermediate',
      tags: ['caching', 'redis', 'data-structures'],
      proTip: 'Redis Streams with consumer groups is essentially Kafka-lite built into Redis. For systems that need durable event streaming but cannot justify a separate Kafka cluster, Streams provides consumer groups, acknowledgment, pending entry list (PEL), and dead letter semantics — all within your existing Redis deployment.',
    },
    {
      id: 'cdn-caching',
      title: 'CDN Caching',
      description: 'A CDN (Content Delivery Network) caches content at edge locations worldwide. Understanding cache-control headers, purge strategies, and origin behavior is essential because CDN misconfiguration is one of the most common causes of stale content and cache-related incidents.',
      keyPoints: [
        'Origin pull: CDN fetches content from your origin server on first request, caches at edge — most common model',
        'Origin push: you upload content to CDN storage directly — used for large files, video, pre-rendered pages',
        'Cache-Control headers: max-age (browser + CDN TTL), s-maxage (CDN-only TTL), no-cache (validate before using), no-store (never cache)',
        'stale-while-revalidate: serve stale content while fetching fresh in background — eliminates revalidation latency',
        'stale-if-error: serve stale content if origin returns an error — improves availability',
        'Purge/invalidation: remove specific content from CDN cache — instant purge (Fastly), batch purge (CloudFront up to 15min)',
        'Edge Side Includes (ESI): assemble pages at the edge from cached fragments — cache static parts, fetch dynamic parts',
        'Vary header: cache different versions based on request headers (Accept-Encoding, Accept-Language)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Cache-Control Headers Strategy',
          code: `import type { NextApiRequest, NextApiResponse } from 'next'

// Static assets (CSS, JS, images) — immutable, long cache
// Use content-hash in filename for cache busting
function setImmutableCacheHeaders(res: NextApiResponse): void {
  res.setHeader(
    'Cache-Control',
    'public, max-age=31536000, immutable'
  )
  // Browser and CDN cache for 1 year
  // "immutable" tells browser: don't even revalidate
}

// API responses — short CDN cache, revalidate
function setApiCacheHeaders(res: NextApiResponse): void {
  res.setHeader(
    'Cache-Control',
    [
      'public',
      's-maxage=60',                  // CDN caches for 60s
      'max-age=0',                     // Browser always revalidates
      'stale-while-revalidate=300',    // Serve stale for 5min while refreshing
      'stale-if-error=3600',           // Serve stale for 1hr if origin errors
    ].join(', ')
  )
}

// User-specific content — never cache at CDN
function setPrivateCacheHeaders(res: NextApiResponse): void {
  res.setHeader(
    'Cache-Control',
    'private, no-cache, no-store, must-revalidate'
  )
  // "private" prevents CDN from caching
  // User-specific data must never be served to other users
}

// HTML pages — short cache with revalidation
function setPageCacheHeaders(res: NextApiResponse): void {
  res.setHeader(
    'Cache-Control',
    [
      'public',
      's-maxage=300',                  // CDN: 5 minutes
      'max-age=60',                     // Browser: 1 minute
      'stale-while-revalidate=600',    // Background revalidate for 10min
    ].join(', ')
  )
}

// Purge CDN cache (Cloudflare example)
async function purgeCloudflareCache(urls: string[]): Promise<void> {
  const response = await fetch(
    \`https://api.cloudflare.com/client/v4/zones/\${process.env.CF_ZONE_ID}/purge_cache\`,
    {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${process.env.CF_API_TOKEN}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: urls }),
    }
  )

  if (!response.ok) {
    throw new Error(\`Purge failed: \${response.statusText}\`)
  }
}`,
        },
      ],
      ascii: `
  User (Tokyo)         User (NYC)         User (London)
      │                    │                    │
      ▼                    ▼                    ▼
  ┌─────────┐        ┌─────────┐        ┌─────────┐
  │  Edge   │        │  Edge   │        │  Edge   │
  │ Tokyo   │        │  NYC    │        │ London  │
  │  (hit)  │        │ (miss)  │        │  (hit)  │
  └─────────┘        └────┬────┘        └─────────┘
                          │ origin pull
                          ▼
                    ┌────────────┐
                    │   Origin   │
                    │  Server    │
                    │ (us-east)  │
                    └────────────┘

  Cache-Control: public, s-maxage=300,
    stale-while-revalidate=600

  = CDN serves cached for 5min,
    then serves stale for 10min
    while refreshing in background`,
      useCases: [
        'Static assets: CSS, JS, images, fonts — max-age=1year with content hashing',
        'HTML pages: s-maxage=300 with stale-while-revalidate — fast page loads without stale content',
        'API responses: s-maxage=60 for public data (product listings), private for user data',
        'Video streaming: CDN edge caching with range request support (HLS/DASH segments)',
      ],
      commonPitfalls: [
        'Caching private data at CDN: user A sees user B\'s dashboard — set Cache-Control: private',
        'Not using Vary header: caching the gzip version and serving it to a client that cannot decompress',
        'Purge propagation delay: CloudFront takes up to 15 minutes to propagate invalidation — Fastly is instant',
        'Cache-busting with query strings: some CDNs ignore query strings by default — use content hash in filename instead',
        'Not setting s-maxage: without it, max-age applies to both browser and CDN — you lose independent control',
      ],
      interviewTips: [
        'Explain the Cache-Control header values and what each means for browser vs CDN behavior',
        'Mention stale-while-revalidate as the killer feature — eliminates revalidation latency',
        'Discuss cache invalidation strategies: purge API, versioned URLs, short TTL + SWR',
        'Know that "there are only two hard things in computer science: cache invalidation and naming things"',
      ],
      relatedConcepts: ['cache-aside', 'write-around', 'geographic-distribution'],
      difficulty: 'intermediate',
      tags: ['caching', 'cdn', 'performance', 'web'],
      proTip: 'Vercel and Cloudflare Workers use stale-while-revalidate by default for ISR (Incremental Static Regeneration). This means your Next.js pages are always served instantly from cache, and refresh in the background. Understanding this header is essential for modern web performance.',
    },
  ],
}
