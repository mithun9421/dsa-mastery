// @ts-nocheck
import type { Category } from '@/lib/types'

export const scalabilityCategory: Category = {
  id: 'scalability',
  title: 'Scalability',
  description: 'Patterns and strategies for scaling systems from thousands to millions of users — horizontal scaling, load balancing, rate limiting, and geographic distribution.',
  icon: 'TrendingUp',
  concepts: [
    {
      id: 'horizontal-vs-vertical-scaling',
      title: 'Horizontal vs Vertical Scaling',
      description: 'Vertical scaling (scale-up) adds more power to a single machine. Horizontal scaling (scale-out) adds more machines. Real production systems use both, but horizontal scaling is what gets you to internet scale because vertical has a hard ceiling.',
      keyPoints: [
        'Vertical scaling: bigger CPU, more RAM, faster disks — simple but has a hard ceiling (you cannot buy a 10TB RAM server forever)',
        'Horizontal scaling: add more machines behind a load balancer — requires stateless application design',
        'Scale Cube: X-axis (clone/replicate), Y-axis (functional decomposition/microservices), Z-axis (data partitioning/sharding)',
        'Shared-nothing architecture: each node is self-sufficient, no shared memory or disk between nodes',
        'Stateless services are mandatory for horizontal scaling — any request can hit any server',
        'Vertical scaling is fine until ~$20K/month for a beefy machine; beyond that, horizontal wins on cost-performance',
        'Database tier often scales vertically first (bigger RDS instance) before you introduce read replicas or sharding',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Scale Cube (AKF Scale Cube)',
          code: `
  X-Axis: Horizontal Duplication (Cloning)
  ┌──────────────────────────────────────────┐
  │  LB ──> [App1] [App2] [App3] [App4]     │
  │         (identical clones)                │
  └──────────────────────────────────────────┘

  Y-Axis: Functional Decomposition
  ┌──────────────────────────────────────────┐
  │  [Auth Service] [Product Service]         │
  │  [Order Service] [Payment Service]        │
  │  (split by function/domain)               │
  └──────────────────────────────────────────┘

  Z-Axis: Data Partitioning
  ┌──────────────────────────────────────────┐
  │  Shard-A (users A-M)                      │
  │  Shard-B (users N-Z)                      │
  │  (same code, different data subsets)       │
  └──────────────────────────────────────────┘`,
        },
      ],
      useCases: [
        'Vertical: early-stage startups, databases that are hard to shard, single-threaded workloads (Redis)',
        'Horizontal: web/API servers, stateless microservices, CDN edge nodes',
        'Z-axis: multi-tenant SaaS where tenants are isolated by region or tier',
      ],
      commonPitfalls: [
        'Scaling horizontally without making services stateless — session state on disk breaks everything',
        'Premature horizontal scaling adds operational complexity (service discovery, distributed debugging)',
        'Ignoring the database bottleneck — scaling app servers while the DB is still a single node',
        'Assuming vertical scaling is always cheaper — cloud vertical pricing is non-linear',
      ],
      interviewTips: [
        'Always mention you would scale vertically first (simpler) and explain when you would switch to horizontal',
        'Discuss the statelessness requirement for horizontal scaling — show you understand session externalization',
        'Mention the Scale Cube to demonstrate structured thinking about scaling dimensions',
      ],
      relatedConcepts: ['load-balancing', 'stateless-architecture', 'database-sharding', 'auto-scaling'],
      difficulty: 'intermediate',
      tags: ['scalability', 'infrastructure', 'architecture'],
      proTip: 'Netflix scales on all 3 axes simultaneously: X-axis for stateless microservices, Y-axis for domain decomposition (hundreds of services), Z-axis for regional isolation.',
    },
    {
      id: 'load-balancing',
      title: 'Load Balancing',
      description: 'A load balancer distributes incoming traffic across multiple backend servers. The choice of layer (L4 vs L7), algorithm, and health check strategy determines latency, availability, and cost.',
      keyPoints: [
        'L4 (Transport): routes based on IP/port, no payload inspection, faster, used for TCP/UDP — think NLB',
        'L7 (Application): inspects HTTP headers/URL/cookies, can do content-based routing, SSL termination — think ALB, Nginx',
        'Round Robin: simplest, rotates through servers equally — fine when all servers are identical',
        'Weighted Round Robin: assigns weights to servers (e.g., 3:1 ratio for bigger:smaller instances)',
        'Least Connections: routes to the server with fewest active connections — best for long-lived connections',
        'IP Hash: hashes client IP to pick server — provides session affinity without cookies',
        'Consistent Hashing: minimizes redistribution when servers are added/removed — used in distributed caches',
        'Health checks: active (LB pings /health) vs passive (LB monitors response errors) — always use both',
        'Session affinity (sticky sessions): routes same client to same server — a crutch, not a solution',
      ],
      codeExamples: [
        {
          language: 'nginx',
          label: 'Nginx L7 Load Balancer with Health Checks',
          code: `upstream backend {
    least_conn;  # Algorithm: least connections

    server 10.0.1.1:8080 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.2:8080 weight=1 max_fails=3 fail_timeout=30s;
    server 10.0.1.3:8080 backup;  # Only used when primary servers are down
}

server {
    listen 443 ssl;

    location /api/ {
        proxy_pass http://backend;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_next_upstream error timeout http_502 http_503;
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
    }

    location /health {
        access_log off;
        return 200 "OK";
    }
}`,
        },
      ],
      ascii: `
  Client Requests
       │
       ▼
  ┌─────────┐
  │   L7    │ ── SSL termination
  │   LB    │ ── Health checks
  │ (Nginx) │ ── Content routing
  └────┬────┘
       │
  ┌────┼────────────┐
  ▼    ▼            ▼
┌───┐ ┌───┐      ┌───┐
│S1 │ │S2 │ ...  │Sn │  Backend servers
└───┘ └───┘      └───┘`,
      useCases: [
        'L4: high-throughput TCP services (databases, game servers, gRPC without path routing)',
        'L7: HTTP APIs with path-based routing, A/B testing, canary deployments',
        'Consistent hashing: distributed cache nodes (Memcached ring)',
        'Least connections: WebSocket servers with long-lived connections',
      ],
      commonPitfalls: [
        'Using sticky sessions instead of externalizing state — creates uneven load and failover issues',
        'Not configuring health checks — one bad server drains traffic into a black hole',
        'Ignoring connection draining on scale-in — active requests get killed mid-flight',
        'HAProxy vs Nginx vs ALB: HAProxy is best for raw TCP L4, Nginx for L7 flexibility, ALB for AWS-native with auto-scaling integration',
      ],
      interviewTips: [
        'Mention L4 vs L7 distinction and explain when you would use each',
        'Discuss health checks as critical — interviewers want to hear about failure detection',
        'For real-world designs, ALB + target groups is the typical answer on AWS; GCP uses Envoy-based LBs',
      ],
      relatedConcepts: ['horizontal-vs-vertical-scaling', 'auto-scaling', 'geographic-distribution', 'rate-limiting'],
      difficulty: 'intermediate',
      tags: ['scalability', 'networking', 'infrastructure'],
      proTip: 'At FAANG scale, the load balancer itself is a distributed system. Google uses Maglev (a consistent-hashing L4 LB), which distributes across multiple machines using ECMP routing to avoid a single-LB bottleneck.',
    },
    {
      id: 'auto-scaling',
      title: 'Auto Scaling',
      description: 'Auto scaling dynamically adjusts compute capacity based on demand. The difference between a $5K and $50K monthly bill is often how well auto scaling is configured — including cooldown periods, scale-in protection, and predictive policies.',
      keyPoints: [
        'Reactive scaling: triggered by metrics crossing thresholds (CPU > 70%, request count > 1000/min)',
        'Predictive scaling: ML-based, learns traffic patterns and pre-provisions capacity before spikes',
        'Cooldown period: time after a scaling action before another can occur — prevents oscillation (default 300s in AWS)',
        'Scale-in protection: prevents specific instances from termination (e.g., ones running long batch jobs)',
        'Target tracking: set a target metric (e.g., avg CPU = 50%) and the ASG adjusts automatically — simplest to use',
        'Step scaling: different scaling amounts at different threshold levels (add 1 at 70% CPU, add 3 at 90%)',
        'Spot instance strategies: use spot for stateless workloads, on-demand for baseline, mix for cost optimization',
        'Vertical Pod Autoscaler (VPA): adjusts CPU/memory requests per pod in Kubernetes — complementary to HPA',
        'HPA + VPA together: HPA handles replica count, VPA handles resource requests per replica — do not use both on CPU',
      ],
      codeExamples: [
        {
          language: 'yaml',
          label: 'Kubernetes HPA with Custom Metrics',
          code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 3
  maxReplicas: 50
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60   # Wait 60s before scaling up again
      policies:
        - type: Percent
          value: 100                     # Double the pods
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300  # Wait 5min before scaling down
      policies:
        - type: Percent
          value: 10                     # Remove 10% at a time
          periodSeconds: 60
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"`,
        },
      ],
      useCases: [
        'Web APIs with diurnal traffic patterns — ramp up in the morning, scale down at night',
        'Event-driven workloads — flash sales, product launches, live events',
        'Batch processing with spot instances — scale up workers, process queue, scale to zero',
        'ML inference endpoints with bursty traffic — predictive scaling reduces cold start latency',
      ],
      commonPitfalls: [
        'Cooldown too short: scaling actions oscillate up/down rapidly, wasting money and causing instability',
        'Cooldown too long: cannot respond to genuine rapid traffic spikes',
        'Scaling on CPU alone: a memory-bound or I/O-bound service might OOM before CPU triggers scaling',
        'Not setting maxReplicas: runaway scaling from a traffic flood can bankrupt you',
        'Ignoring startup time: if your app takes 3 minutes to boot, you need pre-warming or predictive scaling',
      ],
      interviewTips: [
        'Mention reactive AND predictive scaling — it shows production experience',
        'Discuss the cold start problem: scaling is not instant, so you need headroom or pre-warming',
        'Talk about cost optimization: spot instances for stateless, reserved for baseline, on-demand for burst',
      ],
      relatedConcepts: ['horizontal-vs-vertical-scaling', 'load-balancing', 'stateless-architecture'],
      difficulty: 'intermediate',
      tags: ['scalability', 'infrastructure', 'cost-optimization'],
      proTip: 'Combine predictive scaling for known patterns (daily traffic, weekly patterns) with reactive scaling for unexpected spikes. AWS Auto Scaling can run both policies simultaneously — predictive provisions the baseline, reactive handles the unexpected.',
    },
    {
      id: 'stateless-architecture',
      title: 'Stateless Architecture',
      description: 'A stateless service stores no session data locally — every request contains all information needed to process it. This is the foundation of horizontal scaling: if any server can handle any request, adding servers is trivial.',
      keyPoints: [
        'Externalize all session state to a shared store (Redis, DynamoDB, database)',
        'JWT tokens carry authentication state in the token itself — no server-side session lookup needed',
        'Server-side sessions with Redis: centralized session store accessible by all app servers',
        'Sticky sessions are an anti-pattern: they create hotspots, complicate failover, and prevent true horizontal scaling',
        'CDN for static assets: offload images, CSS, JS to CloudFront/Fastly — app servers only handle dynamic requests',
        '12-Factor App: store config in environment variables, not in local files on the server',
        'File uploads: never store on local disk — use S3/GCS with pre-signed URLs',
        'Caches: local in-memory caches (node-cache) are fine for read-heavy immutable data, but mutable state must be external',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'JWT-based Stateless Authentication',
          code: `import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

interface TokenPayload {
  userId: string
  role: 'admin' | 'user'
  permissions: string[]
}

// No session store needed — state is IN the token
function verifyToken(req: Request, _res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    throw new Error('Missing token')
  }

  // Any server can verify this — no shared state needed
  const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
  req.user = payload
  next()
}

// Session externalization with Redis (when you need server-side state)
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

async function getSession(sessionId: string): Promise<Record<string, unknown> | null> {
  const data = await redis.get(\`session:\${sessionId}\`)
  return data ? JSON.parse(data) : null
}

async function setSession(
  sessionId: string,
  data: Record<string, unknown>,
  ttlSeconds: number = 3600
): Promise<void> {
  await redis.setex(\`session:\${sessionId}\`, ttlSeconds, JSON.stringify(data))
}`,
        },
      ],
      useCases: [
        'Any service that needs to scale horizontally behind a load balancer',
        'Kubernetes deployments where pods are ephemeral and can be killed/rescheduled at any time',
        'Serverless functions (Lambda, Cloud Functions) — inherently stateless by design',
        'Blue-green and canary deployments — traffic can shift between versions without session loss',
      ],
      commonPitfalls: [
        'Storing state in local memory or filesystem — breaks when new instances spin up or old ones die',
        'JWT without expiration or refresh tokens — if a JWT is stolen, the attacker has access forever',
        'Making Redis a single point of failure — use Redis Sentinel or Cluster for HA',
        'Over-engineering: not every service needs to be stateless — a single-instance CLI tool is fine with local state',
      ],
      interviewTips: [
        'Explain WHY statelessness matters: it enables horizontal scaling, simplifies deployments, and improves fault tolerance',
        'Discuss JWT vs server-side sessions trade-offs: JWT cannot be revoked easily (need blocklist), sessions add a network hop',
        'Mention the 12-Factor App methodology — interviewers love hearing principled architectural thinking',
      ],
      relatedConcepts: ['horizontal-vs-vertical-scaling', 'load-balancing', 'redis-architecture'],
      difficulty: 'intermediate',
      tags: ['scalability', 'architecture', 'statelessness'],
      proTip: 'JWT revocation is the Achilles heel of stateless auth. The pragmatic approach: short-lived access tokens (15 min) + long-lived refresh tokens stored in Redis. This gives you near-stateless verification for 99% of requests while maintaining the ability to revoke access.',
    },
    {
      id: 'rate-limiting',
      title: 'Rate Limiting',
      description: 'Rate limiting protects your system from abuse, ensures fair usage, and prevents cascade failures. The algorithm choice matters — each has different memory, accuracy, and burst-handling characteristics.',
      keyPoints: [
        'Token Bucket: tokens refill at a fixed rate, each request consumes a token — allows bursts up to bucket capacity',
        'Leaky Bucket: requests enter a FIFO queue, processed at a fixed rate — smooths traffic, no bursts',
        'Fixed Window: count requests in fixed time windows (e.g., per minute) — simple but has boundary spike problem',
        'Sliding Window Log: store timestamp of each request, count within sliding window — accurate but memory-heavy',
        'Sliding Window Counter: weighted average of current and previous window counts — best accuracy/memory trade-off',
        'Distributed rate limiting: use Redis INCR + EXPIRE or Lua scripts for atomic operations across multiple servers',
        'Rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset — always include these in API responses',
        'Return HTTP 429 Too Many Requests with Retry-After header',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Sliding Window Counter in Redis',
          code: `import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

async function slidingWindowRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const windowStart = now - windowMs

  // Lua script for atomic sliding window counter
  const luaScript = \`
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window_start = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])
    local window_ms = tonumber(ARGV[4])

    -- Remove expired entries
    redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)

    -- Count current entries
    local count = redis.call('ZCARD', key)

    if count < limit then
      -- Add new request
      redis.call('ZADD', key, now, now .. '-' .. math.random(1000000))
      redis.call('PEXPIRE', key, window_ms)
      return {1, limit - count - 1}
    else
      return {0, 0}
    end
  \`

  const result = await redis.eval(
    luaScript, 1, key, now, windowStart, limit, windowMs
  ) as [number, number]

  return {
    allowed: result[0] === 1,
    remaining: result[1],
    resetAt: now + windowMs,
  }
}

// Usage in Express middleware
import type { Request, Response, NextFunction } from 'express'

async function rateLimitMiddleware(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  const clientKey = \`ratelimit:\${req.ip}\`
  const result = await slidingWindowRateLimit(clientKey, 100, 60) // 100 req/min

  res.set({
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  })

  if (!result.allowed) {
    res.status(429).json({ error: 'Too many requests' })
    return
  }

  next()
}`,
        },
      ],
      ascii: `
  Token Bucket:                    Leaky Bucket:
  ┌──────────┐                    ┌──────────┐
  │ ●●●●●○○○ │ ← tokens refill   │ Request  │
  │  bucket   │   at fixed rate    │  Queue   │
  └────┬─────┘                    └────┬─────┘
       │ consume 1 token                │ drain at
       │ per request                    │ fixed rate
       ▼                                ▼
  [Allow/Deny]                    [Process]

  Fixed Window:        Sliding Window:
  |---min 1---|---min 2---|    |------60s window----->|
  [  45 req   ][ 55 req   ]    Always counts last 60s
   ↑ boundary spike: 100 req    No boundary spikes
     in 1 second possible`,
      useCases: [
        'Public API protection — prevent abuse from aggressive clients',
        'Login endpoints — prevent brute force attacks (stricter limits)',
        'Downstream service protection — prevent your service from overwhelming a dependency',
        'Tiered API plans — free: 100 req/min, paid: 10000 req/min',
      ],
      commonPitfalls: [
        'Fixed window boundary problem: 100 requests at :59 and 100 at :00 = 200 in 2 seconds',
        'Rate limiting only by IP: NATs can make thousands of users share one IP',
        'Not rate limiting internal services: one buggy microservice can DDoS your database',
        'Forgetting Retry-After headers: clients without guidance hammer you harder after a 429',
      ],
      interviewTips: [
        'Know all 5 algorithms and when to use each — this is frequently asked',
        'Sliding window counter is usually the best answer: O(1) memory, good accuracy, no boundary issues',
        'Discuss distributed rate limiting with Redis — shows you think beyond single-server',
        'Mention rate limiting at multiple layers: API gateway, application, and per-endpoint',
      ],
      relatedConcepts: ['circuit-breaker', 'backpressure', 'api-gateway', 'redis-architecture'],
      difficulty: 'intermediate',
      tags: ['scalability', 'api', 'security'],
      proTip: 'Stripe uses a sophisticated multi-tier rate limiter: per-API-key limits, per-endpoint limits, and global limits. They use token bucket at the edge (allows bursts for legitimate traffic) and sliding window counters internally for precise accounting.',
    },
    {
      id: 'circuit-breaker',
      title: 'Circuit Breaker',
      description: 'The circuit breaker pattern prevents cascading failures by detecting when a downstream service is failing and short-circuiting requests to it. Without it, one failing service can take down your entire system through resource exhaustion.',
      keyPoints: [
        'Three states: CLOSED (normal, requests pass through), OPEN (failing, requests rejected immediately), HALF-OPEN (testing, limited requests allowed)',
        'Failure threshold: number or percentage of failures that trips the circuit (e.g., 50% failure rate over 10 requests)',
        'Timeout: how long the circuit stays OPEN before transitioning to HALF-OPEN',
        'Half-open: allows a small number of test requests — if they succeed, circuit closes; if they fail, circuit reopens',
        'Hystrix (Netflix, deprecated) vs Resilience4j (modern Java) vs custom implementation',
        'Bulkhead pattern: isolate resources per dependency — a failing service cannot consume all your thread pool',
        'Fallback: provide degraded response when circuit is open (cached data, default values, queue for later)',
        'Monitor circuit state: open circuits are operational alerts — you should be paged when a circuit opens',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Circuit Breaker Implementation',
          code: `type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

interface CircuitBreakerOptions {
  failureThreshold: number     // failures before opening
  resetTimeoutMs: number       // time in OPEN before trying HALF_OPEN
  halfOpenMaxAttempts: number  // test requests in HALF_OPEN
}

class CircuitBreaker {
  private state: CircuitState = 'CLOSED'
  private failureCount = 0
  private successCount = 0
  private lastFailureTime = 0
  private halfOpenAttempts = 0

  constructor(private readonly options: CircuitBreakerOptions) {}

  async execute<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeoutMs) {
        this.state = 'HALF_OPEN'
        this.halfOpenAttempts = 0
      } else {
        if (fallback) return fallback()
        throw new Error('Circuit is OPEN — request rejected')
      }
    }

    if (this.state === 'HALF_OPEN' &&
        this.halfOpenAttempts >= this.options.halfOpenMaxAttempts) {
      if (fallback) return fallback()
      throw new Error('Circuit is HALF_OPEN — max test attempts reached')
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      if (fallback) return fallback()
      throw error
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++
      if (this.successCount >= this.options.halfOpenMaxAttempts) {
        this.state = 'CLOSED'
        this.failureCount = 0
        this.successCount = 0
      }
    } else {
      this.failureCount = 0
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN'
    } else if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'OPEN'
    }
  }

  getState(): CircuitState {
    return this.state
  }
}

// Usage
const paymentCircuit = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
  halfOpenMaxAttempts: 3,
})

const result = await paymentCircuit.execute(
  () => paymentService.charge(amount),
  () => ({ status: 'queued', message: 'Payment will be retried' })
)`,
        },
      ],
      ascii: `
  ┌─────────┐  success    ┌─────────┐
  │ CLOSED  │◄────────────│HALF_OPEN│
  │(normal) │             │ (test)  │
  └────┬────┘             └────┬────┘
       │ failures              │ failure
       │ exceed                │
       │ threshold             │
       ▼                       │
  ┌─────────┐  timeout    ┌───┘
  │  OPEN   │─────────────┘
  │(reject) │
  └─────────┘

  All requests rejected immediately
  when circuit is OPEN — no waiting
  for timeout on a dead service`,
      useCases: [
        'Any HTTP call to an external or internal service that could fail or become slow',
        'Database connections when the DB is overloaded — fail fast instead of piling up connections',
        'Third-party API calls (payment gateways, email providers) that have SLA violations',
        'Preventing cascade failures in microservice architectures',
      ],
      commonPitfalls: [
        'Not implementing fallbacks: circuit breaker without fallback just gives users faster errors',
        'Threshold too low: transient errors trip the circuit unnecessarily',
        'Threshold too high: the circuit never opens, defeating the purpose',
        'Not monitoring circuit state: an open circuit is an ops event — wire it to your alerting',
        'Sharing one circuit across different endpoints: /health being slow should not break /critical-data',
      ],
      interviewTips: [
        'Draw the state machine (CLOSED -> OPEN -> HALF_OPEN -> CLOSED) — interviewers love visual explanations',
        'Mention the bulkhead pattern alongside circuit breaker — they are complementary',
        'Discuss real-world: Netflix was the pioneer (Hystrix), now Resilience4j or Envoy circuit breaking is standard',
      ],
      relatedConcepts: ['backpressure', 'rate-limiting', 'distributed-tracing'],
      difficulty: 'intermediate',
      tags: ['scalability', 'resilience', 'microservices'],
      proTip: 'In service mesh architectures (Istio/Envoy), circuit breaking is configured at the infrastructure layer, not in application code. This means every service gets circuit breaking for free without library dependencies — one of the strongest arguments for adopting a service mesh.',
    },
    {
      id: 'backpressure',
      title: 'Backpressure',
      description: 'Backpressure is a mechanism for a consumer to signal to a producer to slow down when it cannot keep up. Without backpressure, fast producers overwhelm slow consumers, leading to OOM errors, dropped messages, or cascade failures.',
      keyPoints: [
        'Producer/consumer imbalance: producer sends 10K msgs/sec, consumer processes 5K msgs/sec — queue grows unbounded',
        'Queue depth monitoring: track queue size as a metric — if it grows continuously, you have a backpressure problem',
        'Reactive Streams: built-in backpressure protocol — consumer requests N items, producer sends at most N',
        'TCP backpressure: the TCP receive window naturally applies backpressure — if receiver is slow, sender slows down',
        'Strategies: drop oldest, drop newest, block producer, reject with error, buffer with bounds',
        'Bounded queues: fixed-size buffers that block or reject when full — essential for preventing OOM',
        'Load shedding: intentionally dropping lower-priority work to protect the system',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Bounded Queue with Backpressure',
          code: `class BoundedQueue<T> {
  private readonly queue: T[] = []
  private readonly waitingProducers: Array<{
    item: T
    resolve: () => void
  }> = []
  private readonly waitingConsumers: Array<{
    resolve: (item: T) => void
  }> = []

  constructor(private readonly maxSize: number) {}

  async enqueue(item: T): Promise<void> {
    // If consumers are waiting, deliver directly
    if (this.waitingConsumers.length > 0) {
      const consumer = this.waitingConsumers.shift()!
      consumer.resolve(item)
      return
    }

    // If queue is full, block the producer (backpressure)
    if (this.queue.length >= this.maxSize) {
      return new Promise<void>((resolve) => {
        this.waitingProducers.push({ item, resolve })
      })
    }

    this.queue.push(item)
  }

  async dequeue(): Promise<T> {
    // If items available, return immediately
    if (this.queue.length > 0) {
      const item = this.queue.shift()!

      // Unblock a waiting producer if any
      if (this.waitingProducers.length > 0) {
        const producer = this.waitingProducers.shift()!
        this.queue.push(producer.item)
        producer.resolve()
      }

      return item
    }

    // No items — block consumer until one arrives
    return new Promise<T>((resolve) => {
      this.waitingConsumers.push({ resolve })
    })
  }

  get size(): number {
    return this.queue.length
  }

  get isFull(): boolean {
    return this.queue.length >= this.maxSize
  }
}

// Usage
const queue = new BoundedQueue<string>(1000) // Max 1000 items

// Producer — will block when queue is full
async function producer(): Promise<void> {
  for (let i = 0; ; i++) {
    await queue.enqueue(\`message-\${i}\`) // Blocks if full
    // Producer naturally slows down when consumer is slow
  }
}

// Slow consumer
async function consumer(): Promise<void> {
  while (true) {
    const item = await queue.dequeue()
    await processItem(item) // Slow processing
  }
}`,
        },
      ],
      useCases: [
        'Kafka consumers falling behind producers — consumer lag triggers alerts and scaling',
        'API servers overwhelmed by upstream traffic — respond with 429 or 503 as backpressure',
        'Stream processing pipelines — bounded buffers between stages prevent memory exhaustion',
        'WebSocket server broadcasting to slow clients — per-client send buffers with overflow policy',
      ],
      commonPitfalls: [
        'Unbounded queues: the #1 cause of OOM in production — always bound your buffers',
        'Ignoring consumer lag: Kafka consumer group lag should be a first-class metric in your monitoring',
        'Dropping messages silently: if you drop, at least log it and increment a counter',
        'Not distinguishing transient from sustained overload: transient can be buffered, sustained needs scaling or shedding',
      ],
      interviewTips: [
        'Mention TCP backpressure as the classic example everyone knows but few think about explicitly',
        'Discuss the trade-off between buffering (latency) and dropping (data loss)',
        'Load shedding is an advanced concept that shows you think about system-level trade-offs',
      ],
      relatedConcepts: ['rate-limiting', 'circuit-breaker', 'kafka-internals', 'dead-letter-queue'],
      difficulty: 'advanced',
      tags: ['scalability', 'resilience', 'streaming'],
      proTip: 'Reactive Streams (Java) / Node.js Streams with highWaterMark are the correct abstractions for backpressure. If you are piping data through multiple stages and NOT using these, you almost certainly have a backpressure bug waiting to OOM your service.',
    },
    {
      id: 'geographic-distribution',
      title: 'Geographic Distribution',
      description: 'Serving users from geographically distributed data centers reduces latency, improves availability, and can satisfy data residency requirements. The hard problem is data replication and consistency across regions.',
      keyPoints: [
        'Active-Active: all regions serve read AND write traffic — lowest latency but hardest consistency model',
        'Active-Passive: one primary region handles writes, other regions are read replicas — simpler but higher write latency for non-primary users',
        'Data replication latency: cross-region replication adds 50-200ms latency — eventual consistency is often unavoidable',
        'Global load balancing: DNS-based (Route53), Anycast (Cloudflare), or geo-aware L7 (GCP Global LB)',
        'Latency-based routing: Route53 routes users to the lowest-latency region automatically',
        'Data residency: GDPR, data sovereignty laws may require data to stay in specific regions',
        'Conflict resolution: active-active writes to the same data from different regions create conflicts — need CRDTs, last-write-wins, or application-level merge',
        'Anycast: multiple servers advertise the same IP, BGP routing sends traffic to the nearest one',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Multi-Region Architecture',
          code: `
  ┌──────────────────────────────────────────────────────────┐
  │                   Global DNS / Anycast                    │
  │              (Route53 latency-based routing)              │
  └─────────┬──────────────────┬──────────────┬──────────────┘
            │                  │              │
    ┌───────▼──────┐  ┌───────▼──────┐  ┌───▼──────────┐
    │  US-EAST     │  │  EU-WEST     │  │  AP-SOUTH    │
    │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │
    │  │  App   │  │  │  │  App   │  │  │  │  App   │  │
    │  │ Servers│  │  │  │ Servers│  │  │  │ Servers│  │
    │  └───┬────┘  │  │  └───┬────┘  │  │  └───┬────┘  │
    │      │       │  │      │       │  │      │       │
    │  ┌───▼────┐  │  │  ┌───▼────┐  │  │  ┌───▼────┐  │
    │  │  DB    │  │  │  │  DB    │  │  │  │  DB    │  │
    │  │PRIMARY │──│──│──│REPLICA │──│──│──│REPLICA │  │
    │  └────────┘  │  │  └────────┘  │  │  └────────┘  │
    └──────────────┘  └──────────────┘  └──────────────┘

  Active-Passive: Writes go to US-EAST primary.
  Reads served locally from each region's replica.
  Replication lag: 50-200ms cross-region.`,
        },
      ],
      useCases: [
        'Global SaaS products serving users on multiple continents',
        'Compliance requirements (GDPR: EU data stays in EU)',
        'High availability: survive an entire region going down (AWS us-east-1 outages are legendary)',
        'Gaming: low latency is critical, so game servers must be near players',
      ],
      commonPitfalls: [
        'Active-active without conflict resolution: two regions update the same user simultaneously — data corruption',
        'Not accounting for replication lag in read-after-write scenarios: user writes in US, reads from EU, gets stale data',
        'DNS TTL too high: during failover, clients keep hitting the dead region for minutes',
        'Assuming all regions need the same capacity: follow the sun — scale each region based on its time zone',
      ],
      interviewTips: [
        'Start with active-passive (simpler) and explain when you would need active-active',
        'Mention the CAP theorem connection: cross-region systems must choose between consistency and availability during partition',
        'Discuss data residency as a non-technical requirement that drives technical decisions',
      ],
      relatedConcepts: ['load-balancing', 'database-replication', 'cap-theorem', 'eventual-consistency-patterns'],
      difficulty: 'advanced',
      tags: ['scalability', 'infrastructure', 'global'],
      proTip: 'CockroachDB and Google Spanner offer serializable consistency across regions using synchronized clocks (TrueTime / hybrid logical clocks). This is the holy grail of geo-distribution, but comes with higher write latency. For most applications, eventual consistency with conflict resolution is the pragmatic choice.',
    },
  ],
}
