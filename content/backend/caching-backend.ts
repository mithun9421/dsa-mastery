// @ts-nocheck
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

interface CodeExample {
  language: string
  label: string
  code: string
}

interface Concept {
  id: string
  title: string
  description: string
  keyPoints: string[]
  codeExamples?: CodeExample[]
  useCases: string[]
  commonPitfalls: string[]
  interviewTips: string[]
  relatedConcepts: string[]
  difficulty: Difficulty
  tags: string[]
  proTip?: string
  ascii?: string
}

interface Category {
  id: string
  title: string
  description: string
  icon?: string
  concepts: Concept[]
}

export const backendCachingCategory: Category = {
  id: 'caching-backend',
  title: 'Backend Caching',
  description: 'Cache stampede solutions, distributed caching patterns, invalidation strategies, hot key mitigation, cache warming, and memoization. The patterns that make the difference between 200ms and 2ms response times.',
  icon: '⚡',
  concepts: [
    {
      id: 'cache-stampede-solutions',
      title: 'Cache Stampede Solutions',
      description: 'A cache stampede (thundering herd) occurs when a popular cache key expires and hundreds of concurrent requests all miss the cache simultaneously, each triggering the same expensive database query or computation. This can cascade into a database outage. The solutions — probabilistic early expiration, mutex locks, and background refresh — each trade off complexity for different guarantees.',
      keyPoints: [
        'The problem: key expires -> 100 concurrent requests all miss -> 100 identical expensive queries hit the database -> database overloaded',
        'Probabilistic Early Expiration (PER): each request has a small chance of refreshing the cache BEFORE expiry. Formula: currentTime + (TTL * beta * log(random())) > expiry. Spreads recomputation over time',
        'Mutex/distributed lock: first request acquires a lock and recomputes. Other requests either wait for the lock to release or return stale data',
        'Background refresh (stale-while-revalidate): serve stale data immediately, trigger an async background refresh. Best UX but requires infrastructure for background jobs',
        'Request coalescing (singleflight): multiple concurrent requests for the same key are collapsed into a single computation. The result is shared with all waiting requests',
        'Layered cache: L1 (in-process memory, microseconds) + L2 (Redis, milliseconds). L1 expiry is shorter, L2 acts as fallback when L1 misses',
        'Never set the same TTL on all cache keys — staggered TTLs prevent synchronized expiration of related keys',
        'For critical keys (homepage data, config), use infinite TTL + event-based invalidation. The key never expires; it is explicitly refreshed on change'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Cache Stampede Prevention with Mutex + Stale-While-Revalidate',
          code: `import Redis from 'ioredis';

const redis = new Redis();

interface CacheEntry<T> {
  readonly data: T;
  readonly staleAt: number;  // when data becomes stale (serve but refresh)
  readonly expiresAt: number; // when data is truly expired (must refresh)
}

async function getWithStampedeProtection<T>(
  key: string,
  fetchFn: () => Promise<T>,
  opts: { freshFor: number; staleFor: number } = { freshFor: 300, staleFor: 600 }
): Promise<T> {
  const raw = await redis.get(key);

  if (raw) {
    const entry: CacheEntry<T> = JSON.parse(raw);
    const now = Date.now();

    // Fresh: return immediately
    if (now < entry.staleAt) {
      return entry.data;
    }

    // Stale but not expired: return stale data + trigger background refresh
    if (now < entry.expiresAt) {
      triggerBackgroundRefresh(key, fetchFn, opts); // non-blocking
      return entry.data;
    }
  }

  // Expired or missing: acquire mutex, recompute
  return refreshWithMutex(key, fetchFn, opts);
}

async function refreshWithMutex<T>(
  key: string,
  fetchFn: () => Promise<T>,
  opts: { freshFor: number; staleFor: number }
): Promise<T> {
  const lockKey = \`lock:\${key}\`;
  const acquired = await redis.set(lockKey, '1', 'EX', 30, 'NX');

  if (!acquired) {
    // Another request is refreshing — wait briefly then read from cache
    await new Promise(resolve => setTimeout(resolve, 100));
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached).data;
    // Still nothing — we must compute (lock holder may have failed)
    return fetchAndCache(key, fetchFn, opts);
  }

  try {
    return await fetchAndCache(key, fetchFn, opts);
  } finally {
    await redis.del(lockKey);
  }
}

async function fetchAndCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  opts: { freshFor: number; staleFor: number }
): Promise<T> {
  const data = await fetchFn();
  const now = Date.now();
  const entry: CacheEntry<T> = {
    data,
    staleAt: now + opts.freshFor * 1000,
    expiresAt: now + (opts.freshFor + opts.staleFor) * 1000,
  };
  await redis.setex(key, opts.freshFor + opts.staleFor, JSON.stringify(entry));
  return data;
}

function triggerBackgroundRefresh<T>(
  key: string,
  fetchFn: () => Promise<T>,
  opts: { freshFor: number; staleFor: number }
): void {
  // Fire and forget — do not await
  refreshWithMutex(key, fetchFn, opts).catch(err => {
    console.error(\`Background refresh failed for \${key}\`, err);
  });
}`
        }
      ],
      useCases: [
        'Homepage and landing page data — accessed by everyone, cache miss affects all users simultaneously',
        'Product catalog pages — popular products get stampeded on cache expiry',
        'Rate limit counters — if the counter cache expires, every request recalculates',
        'Any cache key with high read volume where the underlying data is expensive to compute'
      ],
      commonPitfalls: [
        'No stampede protection at all — relying on "it probably will not happen" until it does and takes down the database',
        'Mutex without a timeout — if the lock holder crashes, all requests wait forever. Always set an expiry on the lock',
        'Background refresh without error handling — the refresh fails silently and stale data is served forever',
        'Setting the same TTL on all keys — when many keys expire at the same time, you get a coordinated stampede'
      ],
      interviewTips: [
        'Describe the stampede scenario with numbers: "Key expires, 1000 req/sec means 1000 simultaneous cache misses hitting the DB"',
        'Compare solutions: PER (statistical, no coordination), mutex (one recompute, others wait), stale-while-revalidate (best UX, stale briefly)',
        'Mention singleflight pattern from Go — it is request coalescing, and libraries exist for Node.js too',
        'For system design interviews, cache stampede comes up in any high-traffic read path: "How do you handle cache expiry for 100K RPM endpoints?"'
      ],
      relatedConcepts: ['distributed-caching-patterns', 'cache-invalidation-strategies', 'hot-key-problem'],
      difficulty: 'advanced',
      tags: ['cache', 'stampede', 'thundering-herd', 'mutex', 'stale-while-revalidate'],
      proTip: 'Instagram uses a "lease" mechanism: the first cache miss gets a lease (permission to recompute). Other requests see the lease and wait for a short interval, then retry. If the lease holder fails (timeout), another request gets the lease. This is more robust than a simple mutex.'
    },
    {
      id: 'distributed-caching-patterns',
      title: 'Distributed Caching Patterns',
      description: 'In a microservice architecture, caching decisions multiply: should each service have its own cache, or share a centralized cache? How do you invalidate across services? Cache-aside (application manages cache reads/writes) is the most common pattern, but read-through and write-through (cache manages itself) simplify application code at the cost of flexibility. Understanding these patterns is essential for designing cacheable microservice architectures.',
      keyPoints: [
        'Cache-aside (lazy loading): application checks cache, on miss reads from DB and writes to cache. Most common, most flexible',
        'Read-through: cache itself loads from DB on miss. Application only talks to cache. Simplifies application code but requires cache library support',
        'Write-through: writes go to cache AND DB synchronously. Cache is always fresh but writes are slower (two writes per operation)',
        'Write-behind (write-back): writes go to cache, then async flush to DB. Fast writes but risk data loss if cache fails before flush',
        'Shared cache (centralized Redis): all services share one cache. Simple invalidation but creates a single point of failure and contention',
        'Per-service cache: each service has its own cache. Better isolation but cross-service invalidation requires events/messages',
        'Event-driven invalidation: when service A updates data, it publishes an event. Service B receives the event and invalidates its cache',
        'Cache serialization: JSON is human-readable but slow. MessagePack or Protocol Buffers are faster and smaller. Choose based on debugging needs',
        'Connection pooling: shared Redis connection pools prevent connection exhaustion. Use a singleton Redis client per service'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Cache-Aside Pattern with Event-Driven Invalidation',
          code: `import Redis from 'ioredis';

const redis = new Redis();

// Cache-aside: read pattern
async function getUserById(userId: string): Promise<User> {
  const cacheKey = \`user:\${userId}\`;

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Cache miss — read from DB
  const user = await db.users.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  // 3. Populate cache (with TTL as safety net)
  await redis.setex(cacheKey, 3600, JSON.stringify(user));

  return user;
}

// Cache-aside: write pattern with event-based invalidation
async function updateUser(userId: string, data: UpdateUserDto): Promise<User> {
  // 1. Update DB (source of truth)
  const user = await db.users.update(userId, data);

  // 2. Invalidate local cache
  await redis.del(\`user:\${userId}\`);

  // 3. Publish event for other services to invalidate their caches
  await eventBus.publish('user.updated', {
    userId,
    timestamp: Date.now(),
    changedFields: Object.keys(data),
  });

  return user;
}

// Event consumer in another service (e.g., order service)
eventBus.subscribe('user.updated', async (event) => {
  // Invalidate any cached data that includes user info
  await redis.del(\`user:\${event.userId}\`);
  await redis.del(\`user-orders:\${event.userId}\`);
  // Optionally: pre-warm cache
  // await getUserById(event.userId);
});

// Two-layer cache: L1 (in-memory) + L2 (Redis)
const localCache = new Map<string, { data: unknown; expiresAt: number }>();

async function getWithLayeredCache<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  // L1: in-process memory (microseconds)
  const local = localCache.get(key);
  if (local && local.expiresAt > Date.now()) {
    return local.data as T;
  }

  // L2: Redis (milliseconds)
  const cached = await redis.get(key);
  if (cached) {
    const data = JSON.parse(cached) as T;
    localCache.set(key, { data, expiresAt: Date.now() + 30_000 }); // L1: 30s
    return data;
  }

  // Miss: fetch from source
  const data = await fetchFn();
  await redis.setex(key, 300, JSON.stringify(data)); // L2: 5min
  localCache.set(key, { data, expiresAt: Date.now() + 30_000 }); // L1: 30s
  return data;
}`
        }
      ],
      useCases: [
        'Microservice architectures where multiple services cache related data',
        'High-read APIs where database load must be minimized',
        'Multi-region deployments with local caches that need coordination',
        'Applications with both fast-changing and slow-changing data requiring different cache strategies'
      ],
      commonPitfalls: [
        'Write-through without TTL — if the write-through fails silently, stale data lives forever',
        'Shared cache between services without namespace prefixes — cache key collisions',
        'Not handling Redis connection failures — cache should be a performance optimization, not a hard dependency. Fail open to DB',
        'Over-caching: caching data that changes every second with a 5-minute TTL — users see stale data constantly',
        'Serialization overhead: JSON.parse on large objects per request adds up. Consider MessagePack for hot paths'
      ],
      interviewTips: [
        'Compare cache-aside, read-through, write-through, and write-behind: trade-offs of simplicity, consistency, and performance',
        'Discuss the "cache is not the source of truth" principle: always be able to rebuild the cache from the database',
        'Explain event-driven invalidation for microservices: service A publishes "user.updated", service B invalidates its user cache',
        'Draw a two-layer cache (L1 + L2) and explain why: L1 avoids network calls, L2 avoids DB calls, each has different TTL'
      ],
      relatedConcepts: ['cache-stampede-solutions', 'cache-invalidation-strategies', 'hot-key-problem'],
      difficulty: 'advanced',
      tags: ['cache', 'distributed', 'redis', 'microservices', 'event-driven'],
      proTip: 'Netflix uses EVCache (built on memcached) with a "zone-aware" topology: each availability zone has its own cache replica. Reads go to the local zone (fast), writes replicate to all zones (eventual consistency). This eliminates cross-zone latency for reads while keeping all zones warm.'
    },
    {
      id: 'cache-invalidation-strategies',
      title: 'Cache Invalidation Strategies',
      description: '"There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton. Cache invalidation is choosing WHEN to remove or refresh cached data. TTL-based is the simplest (set and forget). Event-based is the most accurate (invalidate on write). CDC-based is the most decoupled (watch the database changelog). Version-based is the most cache-friendly (cache key includes a version, new version = new key, old entry just expires).',
      keyPoints: [
        'TTL-based: set an expiry, cache self-evicts. Simple but staleness is guaranteed for up to TTL duration',
        'Event-based: application explicitly invalidates cache on writes. Zero staleness if done correctly, but missed events = stale data',
        'CDC-based (Change Data Capture): watch the database WAL/binlog for changes, invalidate cache entries based on the changelog. Most decoupled — works even for direct DB writes',
        'Version-based: include a version in the cache key (user:123:v5). Increment version on write, old entries naturally expire. No explicit invalidation needed',
        'Tag-based invalidation: tag cache entries with categories (tag: "product:123", tag: "homepage"). Invalidate all entries with a tag at once',
        'Combining strategies: TTL as a safety net (max staleness) + event-based for freshness. Even if event delivery fails, TTL prevents infinite staleness',
        'Write-invalidate vs write-update: invalidate (delete key, next read repopulates) is simpler and safer. Update (overwrite cached value) avoids a cache miss but risks inconsistency',
        'Cascading invalidation: updating a user invalidates user:123, user-profile:123, user-orders:123, search-index — know the dependency graph'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Multiple Invalidation Strategies',
          code: `import Redis from 'ioredis';

const redis = new Redis();

// Strategy 1: TTL-based (simplest)
async function cacheWithTTL<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const data = await fetchFn();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

// Strategy 2: Event-based invalidation with cascading
async function invalidateUserCache(userId: string): Promise<void> {
  // Invalidate all cache entries related to this user
  const keys = [
    \`user:\${userId}\`,
    \`user-profile:\${userId}\`,
    \`user-orders:\${userId}\`,
    \`user-permissions:\${userId}\`,
  ];
  await redis.del(...keys);
}

// Strategy 3: Version-based (no explicit invalidation needed)
async function getUserWithVersion(userId: string): Promise<User> {
  // Version is stored separately and incremented on writes
  const version = await redis.get(\`user-version:\${userId}\`) || '0';
  const cacheKey = \`user:\${userId}:v\${version}\`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const user = await db.users.findById(userId);
  await redis.setex(cacheKey, 3600, JSON.stringify(user));
  return user;
}

async function updateUserVersioned(userId: string, data: UpdateUserDto): Promise<User> {
  const user = await db.users.update(userId, data);
  // Increment version — old cache key naturally expires, new reads use new key
  await redis.incr(\`user-version:\${userId}\`);
  return user;
}

// Strategy 4: Tag-based invalidation with Redis Sets
async function setWithTags<T>(key: string, data: T, tags: string[], ttl: number): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.setex(key, ttl, JSON.stringify(data));
  for (const tag of tags) {
    pipeline.sadd(\`tag:\${tag}\`, key);
    pipeline.expire(\`tag:\${tag}\`, ttl + 60); // tag set lives slightly longer
  }
  await pipeline.exec();
}

async function invalidateByTag(tag: string): Promise<void> {
  const keys = await redis.smembers(\`tag:\${tag}\`);
  if (keys.length > 0) {
    await redis.del(...keys, \`tag:\${tag}\`);
  }
}

// Usage: updating a product invalidates all caches tagged with that product
await invalidateByTag('product:123'); // clears product page, search results, recommendations`
        }
      ],
      useCases: [
        'TTL-based: configuration data that changes infrequently (5-minute TTL is fine)',
        'Event-based: user profile updates that must be reflected immediately',
        'CDC-based: shared databases where multiple applications write directly (bypassing application cache invalidation)',
        'Version-based: CDN-cached assets where you want instant invalidation without purging'
      ],
      commonPitfalls: [
        'TTL only without any proactive invalidation — data is stale for up to TTL duration on every write',
        'Event-based without TTL safety net — if the event is lost (network issue, queue failure), cache is stale forever',
        'Not invalidating cascading entries — you update the user but forget to invalidate the order list that includes user data',
        'Version-based without TTL on old versions — old versioned entries accumulate and consume memory',
        'Invalidation storms: updating one entity invalidates 50 cache keys, causing a temporary stampede'
      ],
      interviewTips: [
        'Name the strategies and their trade-offs: TTL (simple, stale), event (fresh, complex), CDC (decoupled, infrastructure), version (no invalidation, key proliferation)',
        'Discuss the "always use TTL as a safety net" principle — even with event-based invalidation, TTL prevents infinite staleness',
        'Explain CDC: tools like Debezium read the PostgreSQL WAL or MySQL binlog and emit change events. Cache invalidation is just one consumer',
        'For the "how would you invalidate cache across microservices?" question: event bus (Kafka/NATS) + per-service cache invalidation handlers'
      ],
      relatedConcepts: ['cache-stampede-solutions', 'distributed-caching-patterns', 'cqrs-db-level'],
      difficulty: 'advanced',
      tags: ['cache', 'invalidation', 'ttl', 'cdc', 'versioning', 'tags'],
      proTip: 'Facebook uses a system called "lease-based invalidation." When a cache entry is invalidated, a lease is issued. The first reader after invalidation gets the lease to recompute. Other readers either wait or get stale data. The lease prevents both stampede and inconsistency. Simple concept, powerful at scale.'
    },
    {
      id: 'hot-key-problem',
      title: 'Hot Key Problem',
      description: 'A hot key is a single cache key that receives a disproportionate amount of traffic — think a viral tweet, a flash sale product, or the homepage cache. In a Redis cluster, one key maps to one shard, so all traffic for that key hits a single node. This can saturate the node\'s network, CPU, or memory while other nodes idle. The solutions involve spreading the load: local caches, read replicas, key sharding, or simply avoiding the centralized cache for known hot keys.',
      keyPoints: [
        'The problem: Redis Cluster shards by key hash. Key "product:viral" -> shard 7 -> ALL 100K requests/sec hit shard 7 -> shard overwhelmed',
        'Solution 1: Client-side cache (local in-process cache) — serve from memory, skip Redis entirely for hot keys. TTL of 1-5 seconds is enough',
        'Solution 2: Read replicas — configure Redis with replicas and distribute reads across them. Helps for read-heavy hot keys',
        'Solution 3: Key sharding — split "product:123" into "product:123:0", "product:123:1", ... "product:123:N". Random suffix per request. Spreads across N shards',
        'Solution 4: Move hot data to CDN or edge cache — for public, non-personalized content, push to the CDN layer',
        'Detection: monitor Redis with redis-cli --hotkeys (Redis 4.0+), or use KEY_SPACE notifications, or track key access counts in application metrics',
        'Proactive identification: know which keys WILL be hot (homepage, trending, config). Pre-plan the mitigation strategy',
        'Local cache + Redis as fallback: check local Map first (microseconds), then Redis (milliseconds), then DB (tens of milliseconds)',
        'Key sharding complexity: reads must check all N shards or use a random shard (acceptable for cached data). Writes must update all N shards'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Hot Key Mitigation with Local Cache + Key Sharding',
          code: `import Redis from 'ioredis';

const redis = new Redis();

// Solution 1: Local in-process cache for known hot keys
const localCache = new Map<string, { data: string; expiresAt: number }>();
const HOT_KEY_LOCAL_TTL = 2000; // 2 seconds

async function getWithLocalCache(key: string): Promise<string | null> {
  // L1: local cache (microseconds, no network)
  const local = localCache.get(key);
  if (local && local.expiresAt > Date.now()) {
    return local.data;
  }

  // L2: Redis
  const value = await redis.get(key);
  if (value) {
    localCache.set(key, { data: value, expiresAt: Date.now() + HOT_KEY_LOCAL_TTL });
  }
  return value;
}

// Solution 2: Key sharding for hot keys
const SHARD_COUNT = 8;

function getShardedKey(baseKey: string): string {
  const shard = Math.floor(Math.random() * SHARD_COUNT);
  return \`\${baseKey}:shard:\${shard}\`;
}

async function setShardedKey(baseKey: string, value: string, ttl: number): Promise<void> {
  // Write to ALL shards
  const pipeline = redis.pipeline();
  for (let i = 0; i < SHARD_COUNT; i++) {
    pipeline.setex(\`\${baseKey}:shard:\${i}\`, ttl, value);
  }
  await pipeline.exec();
}

async function getShardedValue(baseKey: string): Promise<string | null> {
  // Read from a RANDOM shard (distributes load across Redis Cluster nodes)
  const key = getShardedKey(baseKey);
  return redis.get(key);
}

// Combined: detect hot keys and apply appropriate strategy
const keyAccessCounts = new Map<string, number>();
const HOT_KEY_THRESHOLD = 1000; // accesses per second

function trackAccess(key: string): void {
  const count = (keyAccessCounts.get(key) || 0) + 1;
  keyAccessCounts.set(key, count);
}

// Reset counts every second
setInterval(() => keyAccessCounts.clear(), 1000);

async function smartGet(key: string): Promise<string | null> {
  trackAccess(key);
  const accessCount = keyAccessCounts.get(key) || 0;

  if (accessCount > HOT_KEY_THRESHOLD) {
    // Hot key detected: use local cache
    return getWithLocalCache(key);
  }

  // Normal key: go to Redis directly
  return redis.get(key);
}`
        }
      ],
      useCases: [
        'Viral content: a tweet/post/product goes viral and gets millions of reads',
        'Flash sales: one product gets all the traffic for a limited window',
        'Global config/feature flags: every request reads the same config key',
        'Homepage data: the most visited page with a single cache key'
      ],
      commonPitfalls: [
        'Not monitoring for hot keys — you discover the problem when Redis CPU hits 100% on one shard',
        'Key sharding without writing to all shards — some shards have stale data',
        'Local cache without TTL — stale data served indefinitely if Redis update is missed',
        'Over-engineering: if your Redis handles the load fine, adding key sharding adds complexity for no benefit',
        'Key sharding on write-heavy keys — writing to N shards on every update multiplies write load'
      ],
      interviewTips: [
        'Explain why hot keys are a problem specifically in Redis Cluster: consistent hashing maps one key to one shard, no automatic load spreading',
        'Compare solutions: local cache (simplest, slight staleness), key sharding (distributes load, complex), read replicas (infrastructure, no code changes)',
        'Mention that Twitter uses a local "hot content cache" in front of their distributed cache for trending tweets',
        'Discuss detection: Redis OBJECT FREQ (LFU policy), redis-cli --hotkeys, application-level access counting'
      ],
      relatedConcepts: ['cache-stampede-solutions', 'distributed-caching-patterns', 'cache-invalidation-strategies'],
      difficulty: 'expert',
      tags: ['hot-key', 'redis', 'sharding', 'local-cache', 'performance'],
      proTip: 'Redis 7.0+ supports client-side caching natively via the CLIENT TRACKING command. Redis notifies your client when a cached key is modified, so your local cache is automatically invalidated. This is the ideal solution for hot keys — microsecond local reads with automatic consistency.'
    },
    {
      id: 'cache-warming',
      title: 'Cache Warming',
      description: 'Cache warming is pre-populating the cache before it is needed, instead of waiting for the first request to trigger a cache miss. After a deployment, a Redis restart, or a cache flush, every request is a cache miss — causing a stampede on the database. Cache warming eliminates this cold-start penalty by proactively loading critical data into the cache.',
      keyPoints: [
        'Application startup warming: on boot, load critical cache entries before accepting traffic. Simple and effective for known-hot data',
        'Scheduled warming jobs: cron job that periodically refreshes cache entries (e.g., every 5 minutes, pre-compute dashboard data)',
        'Lazy warming with long TTL: let the first request populate the cache, but set a very long TTL (24h+) so cold starts are rare',
        'Shadow traffic warming: before launching a new service version, route shadow traffic (copies of real requests) to warm the cache',
        'Deployment strategy: use rolling deployments so new instances warm their caches gradually while old instances still serve traffic',
        'Warm the most accessed keys first: use access frequency data (from logs or Redis OBJECT FREQ) to prioritize warming order',
        'Parallel warming: fetch multiple cache entries concurrently to reduce total warming time',
        'Health check integration: do not mark the service as "ready" (Kubernetes readiness probe) until critical cache entries are warmed'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Cache Warming Strategies',
          code: `import Redis from 'ioredis';

const redis = new Redis();

interface WarmableEntry {
  readonly key: string;
  readonly fetch: () => Promise<unknown>;
  readonly ttl: number;
  readonly priority: number; // lower = higher priority
}

// Define critical cache entries to warm
function getCriticalEntries(): WarmableEntry[] {
  return [
    { key: 'config:feature-flags', fetch: () => db.featureFlags.findAll(), ttl: 3600, priority: 1 },
    { key: 'config:site-settings', fetch: () => db.settings.findAll(), ttl: 3600, priority: 1 },
    { key: 'categories:all', fetch: () => db.categories.findAll(), ttl: 1800, priority: 2 },
    { key: 'products:trending', fetch: () => db.products.findTrending(50), ttl: 300, priority: 3 },
  ];
}

// Startup warming: run before accepting traffic
async function warmCacheOnStartup(): Promise<void> {
  const entries = getCriticalEntries().sort((a, b) => a.priority - b.priority);
  const concurrency = 5;

  console.log(\`Warming \${entries.length} cache entries...\`);
  const startTime = Date.now();

  // Process in batches for controlled concurrency
  for (let i = 0; i < entries.length; i += concurrency) {
    const batch = entries.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (entry) => {
        try {
          const data = await entry.fetch();
          await redis.setex(entry.key, entry.ttl, JSON.stringify(data));
        } catch (err) {
          console.error(\`Failed to warm \${entry.key}\`, err);
          // Non-fatal: service can still start, entry will be populated on first request
        }
      })
    );
  }

  console.log(\`Cache warming complete in \${Date.now() - startTime}ms\`);
}

// Scheduled warming: refresh entries before they expire
function schedulePeriodicWarming(): void {
  const entries = getCriticalEntries();

  for (const entry of entries) {
    // Refresh at 80% of TTL to prevent expiry
    const refreshInterval = entry.ttl * 0.8 * 1000;
    setInterval(async () => {
      try {
        const data = await entry.fetch();
        await redis.setex(entry.key, entry.ttl, JSON.stringify(data));
      } catch (err) {
        console.error(\`Periodic warming failed for \${entry.key}\`, err);
      }
    }, refreshInterval);
  }
}

// Express app: warm cache before accepting traffic
async function startServer() {
  await warmCacheOnStartup();
  schedulePeriodicWarming();

  app.listen(3000, () => {
    console.log('Server ready — cache is warm');
  });
}`
        }
      ],
      useCases: [
        'After deployments — new instances start with empty caches',
        'After Redis restarts or cache flushes — everything is cold simultaneously',
        'New features launching — pre-warm cache entries that will be accessed immediately',
        'Disaster recovery — restoring service after an outage without a thundering herd on the database'
      ],
      commonPitfalls: [
        'Warming too much — loading the entire database into Redis defeats the purpose of caching. Warm only the top N most accessed keys',
        'Synchronous warming blocking application startup — if warming takes 5 minutes, the deployment is stuck. Set timeouts and allow partial warming',
        'Not updating warming logic when data access patterns change — you warm keys nobody accesses anymore',
        'Warming single-threaded — fetching 1000 entries sequentially takes 100x longer than fetching 10 batches of 100 concurrently',
        'Forgetting to warm after a cache infrastructure change (Redis upgrade, new cluster) — everything is cold'
      ],
      interviewTips: [
        'Discuss the cold-start problem: after a deployment or cache restart, 100% of requests are cache misses. Warming prevents this',
        'Explain how to integrate with Kubernetes: do not pass the readiness probe until critical cache entries are loaded',
        'Mention that shadow traffic is how large systems (Google, Netflix) warm caches before launching new versions — real traffic patterns, no fake data',
        'Talk about the 80/20 rule: 80% of traffic hits 20% of keys. Warm those 20% and you cover most of the load'
      ],
      relatedConcepts: ['cache-stampede-solutions', 'distributed-caching-patterns', 'hot-key-problem'],
      difficulty: 'intermediate',
      tags: ['cache', 'warming', 'cold-start', 'deployment', 'performance'],
      proTip: 'Netflix uses "shadow traffic" extensively. Before deploying a new cache cluster, they route copies of production traffic to it for hours. By the time the cluster goes live, its cache hit rate is already at steady state. This technique works for any stateful system, not just caches.'
    },
    {
      id: 'memoization-backend',
      title: 'Memoization in Backend',
      description: 'Memoization is function-level caching: store the result of a function call keyed by its inputs, return the cached result on subsequent calls with the same inputs. In backend code, memoization can be in-process (fast, per-instance) or distributed (shared across instances via Redis). The key design decision is the cache key: how do you serialize function inputs into a unique, collision-free key?',
      keyPoints: [
        'Function-level memoization: wrap a function to cache its results keyed by arguments. Return cached result on repeat calls',
        'Cache key design: serialize function name + arguments into a unique key. JSON.stringify works but be careful with object key ordering',
        'In-process memoization (Map/WeakMap): microsecond access, but each instance has its own cache. Good for computation-heavy, input-stable functions',
        'Distributed memoization (Redis): shared across instances, survives restarts. Good for expensive DB queries or API calls',
        'TTL is mandatory: without expiry, memoized results grow forever and consume all memory',
        'Cache poisoning: if a function returns an error and you cache it, subsequent calls get the cached error. Only cache successful results',
        'WeakMap for object-keyed memoization: allows garbage collection of entries when the key object is no longer referenced',
        'LRU (Least Recently Used) eviction: cap the cache size, evict the oldest entries. Use lru-cache package for in-process LRU',
        'Argument normalization: memoize("a", "b") and memoize("b", "a") might mean different things. Ensure your key generation handles argument order correctly'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'In-Process and Distributed Memoization',
          code: `import { LRUCache } from 'lru-cache';
import Redis from 'ioredis';

const redis = new Redis();

// In-process memoization with LRU eviction
function memoizeLocal<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  opts: { maxSize?: number; ttlMs?: number; keyFn?: (...args: TArgs) => string } = {}
): (...args: TArgs) => Promise<TResult> {
  const { maxSize = 1000, ttlMs = 60_000, keyFn } = opts;

  const cache = new LRUCache<string, TResult>({
    max: maxSize,
    ttl: ttlMs,
  });

  return async (...args: TArgs): Promise<TResult> => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Distributed memoization with Redis
function memoizeRedis<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  opts: { prefix: string; ttlSeconds?: number; keyFn?: (...args: TArgs) => string }
): (...args: TArgs) => Promise<TResult> {
  const { prefix, ttlSeconds = 300, keyFn } = opts;

  return async (...args: TArgs): Promise<TResult> => {
    const argKey = keyFn ? keyFn(...args) : JSON.stringify(args);
    const cacheKey = \`memo:\${prefix}:\${argKey}\`;

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const result = await fn(...args);
    // Only cache non-null results (prevent cache poisoning with errors/nulls)
    if (result !== null && result !== undefined) {
      await redis.setex(cacheKey, ttlSeconds, JSON.stringify(result));
    }
    return result;
  };
}

// Usage
const getExchangeRate = memoizeRedis(
  async (from: string, to: string): Promise<number> => {
    const response = await fetch(\`https://api.exchange.com/rate?from=\${from}&to=\${to}\`);
    const data = await response.json();
    return data.rate;
  },
  {
    prefix: 'exchange-rate',
    ttlSeconds: 60, // rates change, keep TTL short
    keyFn: (from, to) => \`\${from}:\${to}\`, // explicit key for clarity
  }
);

// Memoize a database query
const getUserPermissions = memoizeLocal(
  async (userId: string): Promise<string[]> => {
    return db.permissions.findByUserId(userId);
  },
  { maxSize: 500, ttlMs: 30_000 } // 500 users, 30s TTL
);`
        }
      ],
      useCases: [
        'Expensive computations: hash calculations, data transformations, complex business rules',
        'External API calls with rate limits: cache exchange rates, geocoding results, ML model predictions',
        'Database queries in hot paths: user permissions checked on every request, feature flags',
        'Template rendering: cache rendered HTML fragments keyed by template + data hash'
      ],
      commonPitfalls: [
        'Memoizing functions with side effects — the side effect only happens on the first call, not on cached returns',
        'Unbounded in-process cache — without size limits, memory grows until the process is killed (OOM)',
        'Caching errors/null values — a temporary failure is cached and served to all subsequent requests',
        'Object key ordering in JSON.stringify: { a: 1, b: 2 } and { b: 2, a: 1 } produce different strings. Normalize first',
        'Memoizing functions with non-serializable arguments (closures, class instances) — the cache key is meaningless'
      ],
      interviewTips: [
        'Implement a simple memoize function from scratch: closure with a Map, hash arguments as key',
        'Discuss the trade-off between in-process (fast, per-instance) and distributed (shared, slower): most apps benefit from both',
        'Explain cache poisoning: a function throws, the error is cached, all subsequent calls get the error without retrying',
        'Mention LRU eviction: bounded memory, evicts least-recently-used entries. Standard library in most languages'
      ],
      relatedConcepts: ['cache-stampede-solutions', 'distributed-caching-patterns', 'n-plus-one-problem'],
      difficulty: 'intermediate',
      tags: ['memoization', 'cache', 'function', 'lru', 'performance'],
      proTip: 'DataLoader is essentially a per-request memoization layer that also batches. It deduplicates identical lookups (memoization) and combines multiple lookups into a single query (batching). If you are building a GraphQL server, DataLoader is both your memoizer and your N+1 preventer.'
    },
  ],
}
