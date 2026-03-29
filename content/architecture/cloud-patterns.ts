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

export const cloudPatternsCategory: Category = {
  id: 'cloud-patterns',
  title: 'Cloud Patterns',
  description: 'Resilience, deployment, and operational patterns for distributed cloud-native systems. These patterns address the fundamental reality of cloud computing: networks fail, services crash, deployments go wrong, and traffic is unpredictable. Mastering these patterns is the difference between a system that recovers gracefully and one that cascades into a total outage.',
  icon: '☁️',
  concepts: [
    {
      id: 'strangler-fig-pattern',
      title: 'Strangler Fig Pattern',
      description: 'Incrementally replaces a legacy system by gradually routing traffic from the old system to a new one. Named after strangler fig trees that grow around a host tree and eventually replace it entirely. Instead of a risky big-bang rewrite, you build new functionality alongside the old system, route specific features to the new code, and eventually decommission the legacy system when nothing depends on it.',
      keyPoints: [
        'Incremental migration: replace one feature/route at a time, not the entire system at once',
        'Facade/proxy layer: routes requests to either the old or new system based on the URL, feature flag, or header',
        'Coexistence: old and new systems run simultaneously during the migration — no big-bang cutover',
        'Reversible: if the new implementation has issues, route traffic back to the old system instantly',
        'Data synchronization: during migration, both systems may need access to the same data — plan the data strategy',
        'Completion criteria: migration is done when 100% of traffic goes to the new system and the legacy can be decommissioned',
        'Traffic splitting: start with 1% to new, 99% to old. Gradually increase as confidence grows.'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Strangler Fig: Router Proxy with Feature-Based Routing',
          code: `// Strangler proxy — routes requests to old or new system

interface RouteConfig {
  path: string;
  target: 'legacy' | 'modern';
  splitPercent?: number; // Optional: gradual traffic shift
}

class StranglerProxy {
  private readonly routes: RouteConfig[] = [
    // Migrated routes → new system
    { path: '/api/users/*', target: 'modern' },
    { path: '/api/products/*', target: 'modern' },

    // In-progress migration — canary traffic split
    { path: '/api/orders/*', target: 'modern', splitPercent: 20 },

    // Not yet migrated → legacy
    { path: '/api/reports/*', target: 'legacy' },
    { path: '/api/admin/*', target: 'legacy' },
  ];

  constructor(
    private readonly legacyUrl: string,
    private readonly modernUrl: string,
  ) {}

  async route(req: IncomingRequest): Promise<Response> {
    const config = this.findRoute(req.path);
    const target = this.resolveTarget(config);

    const targetUrl = target === 'modern' ? this.modernUrl : this.legacyUrl;

    try {
      const response = await fetch(\`\${targetUrl}\${req.path}\`, {
        method: req.method,
        headers: {
          ...req.headers,
          'X-Routed-To': target,
          'X-Migration-Phase': config.splitPercent ? 'canary' : 'migrated',
        },
        body: req.body,
      });

      // Track metrics per route and target
      metrics.increment('proxy.request', {
        path: config.path,
        target,
        status: String(response.status),
      });

      return response;
    } catch (error) {
      // Fallback to legacy on modern service failure
      if (target === 'modern') {
        metrics.increment('proxy.fallback_to_legacy', { path: config.path });
        return fetch(\`\${this.legacyUrl}\${req.path}\`, {
          method: req.method,
          headers: req.headers,
          body: req.body,
        });
      }
      throw error;
    }
  }

  private findRoute(path: string): RouteConfig {
    return this.routes.find(r => this.matchPath(r.path, path))
      ?? { path: '/*', target: 'legacy' }; // Default: legacy
  }

  private resolveTarget(config: RouteConfig): 'legacy' | 'modern' {
    if (!config.splitPercent) return config.target;
    return Math.random() * 100 < config.splitPercent ? 'modern' : 'legacy';
  }

  private matchPath(pattern: string, path: string): boolean {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    return regex.test(path);
  }
}`
        }
      ],
      useCases: [
        'Replacing a legacy monolith with a modern microservices architecture incrementally',
        'API versioning migration: gradually route clients from v1 to v2',
        'Technology migration: Java monolith to Node.js services, one endpoint at a time',
        'Database migration: old database schema to new, with the proxy handling which system to query'
      ],
      commonPitfalls: [
        'No clear completion criteria: the migration stalls at 70% and both systems run indefinitely',
        'Data synchronization neglected: old and new systems diverge because data flows were not planned',
        'Big-bang fallback temptation: "let us just finish the rewrite" instead of staying incremental',
        'Not monitoring both systems equally: old system neglected during migration, causing outages'
      ],
      interviewTips: [
        'Versus big-bang rewrite: "Strangler Fig is incremental and reversible. Big-bang rewrites are risky and often fail."',
        'Traffic splitting: "Start at 1%, monitor, increase gradually. If errors spike, route back to legacy instantly."',
        'Data strategy: "The hardest part is not routing — it is keeping data in sync between old and new systems during migration."',
        'Real-world: "Most successful legacy migrations use Strangler Fig — Shopify, Amazon, and many others."'
      ],
      relatedConcepts: ['canary-release', 'blue-green-deployment', 'monolith-vs-microservices', 'anti-corruption-layer'],
      difficulty: 'advanced',
      tags: ['cloud', 'migration', 'incremental', 'legacy']
    },
    {
      id: 'sidecar-pattern',
      title: 'Sidecar Pattern',
      description: 'Deploys a helper process alongside the main application to provide auxiliary functionality: logging, monitoring, configuration, networking, or security. The sidecar runs in the same host/pod as the main application, shares the same lifecycle, and can access the same resources. This enables adding cross-cutting concerns without modifying the application code — critical for polyglot microservices environments.',
      keyPoints: [
        'Co-located: sidecar runs alongside the main process in the same pod/host — same lifecycle',
        'Language-agnostic: works with any application regardless of language or framework',
        'Cross-cutting concerns: logging, monitoring, mTLS, config management, service discovery',
        'Service mesh uses sidecars: Envoy proxy is the sidecar in Istio and other service meshes',
        'Shared resources: sidecar can access the same filesystem, network namespace, and environment variables',
        'Independent updates: update the sidecar without redeploying the main application (and vice versa)',
        'Resource overhead: each sidecar consumes CPU and memory — multiply by number of service instances'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Sidecar: Log Shipping and Metrics Collection',
          code: `// Main application — writes logs to a local file, no shipping logic
class OrderService {
  private readonly logger: Logger;

  constructor() {
    // Writes to /var/log/app/orders.log — sidecar ships to central logging
    this.logger = createFileLogger('/var/log/app/orders.log');
  }

  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    this.logger.info('Placing order', { customerId: input.customerId });
    const order = await this.processOrder(input);
    this.logger.info('Order placed', { orderId: order.id });
    return order;
  }
}

// Sidecar: Log shipper (runs as a separate process in the same pod)
// Reads /var/log/app/*.log and ships to Elasticsearch/Loki/CloudWatch
class LogShipperSidecar {
  constructor(
    private readonly logDir: string,
    private readonly destination: LogDestination,
  ) {}

  async start(): Promise<void> {
    const watcher = watch(this.logDir, { recursive: true });

    for await (const event of watcher) {
      if (event.eventType === 'change') {
        const newLines = await this.readNewLines(event.filename);
        for (const line of newLines) {
          await this.destination.ship({
            timestamp: new Date(),
            service: process.env.SERVICE_NAME ?? 'unknown',
            pod: process.env.POD_NAME ?? 'unknown',
            message: line,
          });
        }
      }
    }
  }

  private async readNewLines(filename: string): Promise<string[]> {
    // Track file position, read only new content
    return []; // simplified
  }
}

// Sidecar: Metrics exporter (Prometheus format)
class MetricsExporterSidecar {
  private readonly metrics = new Map<string, number>();

  constructor(private readonly appMetricsUrl: string) {}

  async start(): Promise<void> {
    // Poll main app's /internal/metrics endpoint
    setInterval(async () => {
      const appMetrics = await fetch(this.appMetricsUrl).then(r => r.json());
      // Transform and expose as Prometheus metrics on :9090/metrics
      this.updateMetrics(appMetrics);
    }, 15_000);

    // Serve Prometheus scrape endpoint
    Bun.serve({
      port: 9090,
      fetch: (req) => {
        if (new URL(req.url).pathname === '/metrics') {
          return new Response(this.formatPrometheus(), {
            headers: { 'Content-Type': 'text/plain' },
          });
        }
        return new Response('Not Found', { status: 404 });
      },
    });
  }

  private updateMetrics(data: Record<string, number>): void {
    for (const [key, value] of Object.entries(data)) {
      this.metrics.set(key, value);
    }
  }

  private formatPrometheus(): string {
    return [...this.metrics.entries()]
      .map(([key, value]) => \`\${key} \${value}\`)
      .join('\\n');
  }
}`
        }
      ],
      useCases: [
        'Log shipping: collect application logs and forward to central logging (ELK, Loki)',
        'Metrics export: expose application metrics in Prometheus format without modifying the app',
        'Configuration management: sidecar pulls config from a central store and writes to a shared volume',
        'mTLS termination: sidecar handles TLS handshake, main app talks plain HTTP to localhost',
        'Database proxy: sidecar manages connection pooling, auth, and TLS for database connections (Cloud SQL Proxy)'
      ],
      commonPitfalls: [
        'Resource overhead at scale: 100 pods each with a sidecar = 200 containers to manage',
        'Sidecar startup race: main app starts before sidecar is ready — use init containers or readiness checks',
        'Sidecar failure modes: if the log shipper crashes, logs are lost — add persistence/buffering',
        'Over-sidecaring: one sidecar per concern creates a pod with 5 containers — consolidate related concerns'
      ],
      interviewTips: [
        'Service mesh connection: "Envoy proxy in Istio is the canonical sidecar — handles mTLS, retries, and observability"',
        'Language-agnostic: "The sidecar works with Java, Go, Node, Python — any language, same cross-cutting concerns"',
        'Versus library: "A library requires importing into every service in every language. A sidecar is deploy-once, language-agnostic."',
        'Real-world: "Cloud SQL Proxy, Envoy, Fluentd/Fluent Bit, Prometheus exporters are all sidecar patterns"'
      ],
      relatedConcepts: ['service-mesh', 'ambassador-pattern', 'microservices'],
      difficulty: 'intermediate',
      tags: ['cloud', 'sidecar', 'cross-cutting', 'container']
    },
    {
      id: 'ambassador-pattern',
      title: 'Ambassador Pattern',
      description: 'A special case of the sidecar pattern focused on outbound traffic. The ambassador acts as a proxy between the application and external services, handling retries, circuit breaking, timeouts, and routing without the application knowing. The application calls the ambassador on localhost; the ambassador handles the complexity of calling the real external service.',
      keyPoints: [
        'Outbound proxy: handles complexity of calling external services on behalf of the application',
        'Retry logic: automatic retries with exponential backoff, configurable per destination',
        'Circuit breaking: prevents calling a failing service, returning fast errors instead',
        'Timeout management: enforces timeouts per destination, preventing the application from hanging',
        'Language-agnostic: application makes a simple HTTP call to localhost, ambassador handles the rest',
        'Configuration-driven: routing rules, retry policies, and circuit breaker thresholds are config, not code',
        'Subset of sidecar: ambassador IS a sidecar, but specifically for outbound network traffic'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Ambassador: Outbound Resilience Proxy',
          code: `// Application code — simple, no resilience logic
class PaymentClient {
  // Calls ambassador on localhost — does not know about retries, timeouts, or circuit breaking
  private readonly baseUrl = 'http://localhost:8500/payment-service';

  async charge(amount: number, customerId: string): Promise<ChargeResult> {
    const response = await fetch(\`\${this.baseUrl}/charges\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, customerId }),
    });
    if (!response.ok) throw new Error(\`Payment failed: \${response.status}\`);
    return response.json();
  }
}

// Ambassador proxy — handles all outbound complexity
class AmbassadorProxy {
  private readonly routes: Map<string, RouteConfig> = new Map([
    ['/payment-service', {
      target: 'https://api.stripe.com',
      retries: 3,
      retryBackoffMs: 100,
      timeoutMs: 5000,
      circuitBreaker: { threshold: 5, resetMs: 30_000 },
    }],
    ['/inventory-service', {
      target: 'http://inventory.internal:3000',
      retries: 2,
      retryBackoffMs: 50,
      timeoutMs: 2000,
      circuitBreaker: { threshold: 10, resetMs: 15_000 },
    }],
  ]);

  private readonly breakers = new Map<string, { failures: number; openUntil: number }>();

  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const routeKey = this.findRouteKey(url.pathname);
    const config = this.routes.get(routeKey);
    if (!config) return new Response('No route', { status: 502 });

    // Circuit breaker check
    const breaker = this.breakers.get(routeKey);
    if (breaker && breaker.openUntil > Date.now()) {
      return new Response(JSON.stringify({ error: 'Circuit open' }), { status: 503 });
    }

    // Retry with backoff
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= config.retries; attempt++) {
      try {
        const targetUrl = url.pathname.replace(routeKey, '') + url.search;
        const response = await fetch(\`\${config.target}\${targetUrl}\`, {
          method: req.method,
          headers: req.headers,
          body: req.body,
          signal: AbortSignal.timeout(config.timeoutMs),
        });

        this.recordSuccess(routeKey);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.recordFailure(routeKey, config.circuitBreaker);
        if (attempt < config.retries) {
          await new Promise(r => setTimeout(r, config.retryBackoffMs * 2 ** attempt));
        }
      }
    }

    return new Response(JSON.stringify({ error: lastError?.message }), { status: 502 });
  }

  private recordFailure(route: string, cbConfig: { threshold: number; resetMs: number }): void {
    const breaker = this.breakers.get(route) ?? { failures: 0, openUntil: 0 };
    breaker.failures++;
    if (breaker.failures >= cbConfig.threshold) {
      breaker.openUntil = Date.now() + cbConfig.resetMs;
    }
    this.breakers.set(route, breaker);
  }

  private recordSuccess(route: string): void {
    this.breakers.delete(route);
  }

  private findRouteKey(path: string): string {
    return [...this.routes.keys()].find(k => path.startsWith(k)) ?? '';
  }
}`
        }
      ],
      useCases: [
        'Outbound API resilience: retries, timeouts, and circuit breaking for all external service calls',
        'Service-to-service routing: A/B routing, header-based routing, environment-specific routing',
        'Rate limiting outbound calls to avoid overwhelming external APIs',
        'mTLS for outbound connections without modifying application code'
      ],
      commonPitfalls: [
        'Ambassador and application timeout misalignment: app times out before ambassador retries finish',
        'Circuit breaker too sensitive: opens on transient errors and blocks healthy traffic',
        'Not logging ambassador decisions: hard to debug "why did this request fail?" without ambassador logs',
        'Single ambassador for all destinations: different services need different resilience configurations'
      ],
      interviewTips: [
        'Subset of sidecar: "Ambassador is a sidecar specifically for outbound network resilience"',
        'Application simplicity: "App calls localhost. Ambassador handles retries, timeouts, circuit breaking, and TLS."',
        'Real-world: "Envoy proxy, HAProxy, and Linkerd proxy are all ambassador-pattern implementations"',
        'Versus library: "Ambassador is language-agnostic config. A library must be reimplemented per language."'
      ],
      relatedConcepts: ['sidecar-pattern', 'circuit-breaker', 'retry-pattern', 'timeout-pattern'],
      difficulty: 'intermediate',
      tags: ['cloud', 'resilience', 'proxy', 'outbound']
    },
    {
      id: 'bulkhead-pattern',
      title: 'Bulkhead Pattern',
      description: 'Isolates critical resources into separate pools so that a failure in one component does not exhaust resources shared by other components. Named after ship bulkheads that contain flooding to one compartment. In software: separate thread pools, connection pools, or process pools per downstream dependency so that a slow or failing dependency does not consume all resources and bring down unrelated functionality.',
      keyPoints: [
        'Resource isolation: each downstream dependency gets its own limited resource pool (threads, connections, memory)',
        'Failure containment: slow/failing service A exhausts its pool but does not affect service B pool',
        'Thread pool isolation: dedicate N threads to calls to service A, M threads to service B — one slow service does not starve others',
        'Connection pool isolation: separate database connection pools per query type or tenant',
        'Process isolation: run critical components in separate processes — crash in one does not kill others',
        'Bulkhead size tuning: too small = unnecessary throttling under normal load; too large = insufficient isolation',
        'Combined with circuit breaker: bulkhead limits concurrent calls, circuit breaker stops calls to failing services'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Bulkhead: Semaphore-Based Resource Isolation',
          code: `// Semaphore for concurrency limiting
class Semaphore {
  private queue: Array<() => void> = [];
  private current = 0;

  constructor(private readonly maxConcurrent: number) {}

  async acquire(): Promise<void> {
    if (this.current < this.maxConcurrent) {
      this.current++;
      return;
    }
    return new Promise((resolve) => this.queue.push(() => { this.current++; resolve(); }));
  }

  release(): void {
    this.current--;
    const next = this.queue.shift();
    if (next) next();
  }
}

// Bulkhead: isolates resource pools per downstream service
class BulkheadManager {
  private readonly bulkheads = new Map<string, Semaphore>();

  constructor(private readonly configs: Record<string, { maxConcurrent: number }>) {
    for (const [name, config] of Object.entries(configs)) {
      this.bulkheads.set(name, new Semaphore(config.maxConcurrent));
    }
  }

  async execute<T>(bulkheadName: string, operation: () => Promise<T>): Promise<T> {
    const semaphore = this.bulkheads.get(bulkheadName);
    if (!semaphore) throw new Error(\`Unknown bulkhead: \${bulkheadName}\`);

    await semaphore.acquire();
    try {
      return await operation();
    } finally {
      semaphore.release();
    }
  }
}

// Usage: isolated resource pools per dependency
const bulkheads = new BulkheadManager({
  'payment-service': { maxConcurrent: 20 },   // Max 20 concurrent payment calls
  'inventory-service': { maxConcurrent: 50 },  // Max 50 concurrent inventory calls
  'email-service': { maxConcurrent: 10 },      // Max 10 concurrent email sends
});

class OrderService {
  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    // Payment service slow? Only 20 threads blocked — inventory and email unaffected
    const payment = await bulkheads.execute('payment-service', () =>
      this.paymentClient.charge(input.amount, input.customerId)
    );

    const reservation = await bulkheads.execute('inventory-service', () =>
      this.inventoryClient.reserve(input.items)
    );

    // Fire-and-forget notification — isolated pool
    bulkheads.execute('email-service', () =>
      this.emailClient.sendConfirmation(input.email, payment.id)
    ).catch(() => {}); // Non-critical

    return this.createOrder(input, payment, reservation);
  }
}`
        }
      ],
      useCases: [
        'Isolating downstream service calls to prevent cascading failures',
        'Multi-tenant systems: per-tenant resource pools to prevent noisy neighbor issues',
        'Database connection pools: separate pools for OLTP queries vs long-running reports',
        'API rate limiting: per-client or per-endpoint concurrency limits'
      ],
      commonPitfalls: [
        'Pool too small: legitimate traffic gets rejected under normal load',
        'Pool too large: insufficient isolation — failing dependency still impacts others',
        'Not shedding load: when the pool is full, requests queue indefinitely — set queue limits and fail fast',
        'Static configuration: optimal pool sizes change with traffic patterns — monitor and tune'
      ],
      interviewTips: [
        'Ship analogy: "Bulkheads in a ship contain flooding to one compartment. In software, they contain failure to one pool."',
        'Versus circuit breaker: "Bulkhead limits concurrency. Circuit breaker stops calls to failing services. They complement each other."',
        'Netflix Hystrix: "Hystrix popularized the bulkhead pattern with per-dependency thread pools in Java microservices"',
        'Resource types: "Thread pools, connection pools, process isolation, memory limits — any shared resource can be bulkheaded"'
      ],
      relatedConcepts: ['circuit-breaker', 'retry-pattern', 'timeout-pattern', 'microservices'],
      difficulty: 'advanced',
      tags: ['cloud', 'resilience', 'isolation', 'fault-tolerance']
    },
    {
      id: 'retry-pattern',
      title: 'Retry Pattern',
      description: 'Automatically retries failed operations with the expectation that transient failures (network glitch, temporary overload, brief service restart) will resolve on subsequent attempts. Retry is the simplest resilience pattern but has critical requirements: the operation MUST be idempotent (safe to repeat), and retries MUST use exponential backoff with jitter to avoid thundering herd.',
      keyPoints: [
        'Idempotency is mandatory: retrying a non-idempotent operation can cause duplicate charges, double-sends, etc.',
        'Exponential backoff: 100ms, 200ms, 400ms, 800ms — gives the failing service time to recover',
        'Jitter: add randomness to backoff — prevents all clients from retrying at the exact same millisecond',
        'Retry budget: limit total retries per time window — do not amplify traffic 3x to a struggling service',
        'Non-retryable errors: 400 Bad Request, 401 Unauthorized, 404 Not Found — do not retry client errors',
        'Retryable errors: 429 Too Many Requests, 500 Internal Server Error, 503 Service Unavailable, network timeouts',
        'Idempotency key: pass a unique key per operation so the server can deduplicate retries'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Retry: Exponential Backoff with Jitter',
          code: `interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrors?: (error: unknown) => boolean;
}

const defaultRetryable = (error: unknown): boolean => {
  if (error instanceof Response) {
    return error.status >= 500 || error.status === 429;
  }
  if (error instanceof TypeError) return true; // Network errors
  return false;
};

async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs, retryableErrors = defaultRetryable } = config;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Do not retry non-retryable errors
      if (!retryableErrors(error)) throw error;

      // Do not retry after last attempt
      if (attempt === maxRetries) break;

      // Exponential backoff with jitter
      const exponentialDelay = baseDelayMs * 2 ** attempt;
      const jitter = Math.random() * exponentialDelay * 0.5; // 0-50% jitter
      const delay = Math.min(exponentialDelay + jitter, maxDelayMs);

      console.warn(\`Retry \${attempt + 1}/\${maxRetries} after \${Math.round(delay)}ms\`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Usage with idempotency key
async function chargeCustomer(customerId: string, amount: number): Promise<ChargeResult> {
  const idempotencyKey = \`charge-\${customerId}-\${amount}-\${Date.now()}\`;

  return withRetry(
    async () => {
      const response = await fetch('https://api.stripe.com/v1/charges', {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey, // Stripe deduplicates by this key
          'Authorization': \`Bearer \${process.env.STRIPE_KEY}\`,
        },
        body: new URLSearchParams({
          amount: String(amount),
          customer: customerId,
          currency: 'usd',
        }),
      });
      if (!response.ok) throw response; // Throw Response for retryable check
      return response.json();
    },
    {
      maxRetries: 3,
      baseDelayMs: 200,
      maxDelayMs: 5000,
    },
  );
}`
        }
      ],
      useCases: [
        'API calls to external services that may experience transient failures',
        'Database operations during brief connection interruptions',
        'Message queue publishing when the broker is temporarily overloaded',
        'File upload operations over unreliable networks'
      ],
      commonPitfalls: [
        'Retrying non-idempotent operations: "charge $10" retried 3 times = $30 charged',
        'No backoff: immediate retries hammer a struggling service and make the problem worse',
        'No jitter: all clients back off identically, creating a thundering herd at the same moment',
        'Retrying client errors (400, 401, 404): these will never succeed on retry — waste of resources'
      ],
      interviewTips: [
        'Idempotency first: "Before adding retries, I ask: is this operation safe to repeat?"',
        'Exponential backoff + jitter: "Prevents thundering herd — each client retries at a slightly different time"',
        'Retry budget: "Limit retries to prevent amplifying traffic to a failing service"',
        'Idempotency key: "Pass a unique key so the server can deduplicate retries"'
      ],
      relatedConcepts: ['circuit-breaker', 'timeout-pattern', 'bulkhead-pattern'],
      difficulty: 'intermediate',
      tags: ['cloud', 'resilience', 'idempotency', 'transient-faults']
    },
    {
      id: 'timeout-pattern',
      title: 'Timeout Pattern',
      description: 'Sets a maximum time limit for an operation to complete. Without timeouts, a slow downstream service can cause request threads to hang indefinitely, exhausting connection pools and cascading failures upstream. Timeouts are the most basic resilience mechanism and should be applied to every external call: HTTP requests, database queries, message queue operations, and file system I/O.',
      keyPoints: [
        'Connect timeout: maximum time to establish a connection (typically 1-5 seconds)',
        'Read/response timeout: maximum time to receive a response after connection is established',
        'Total request timeout: end-to-end limit including connect, send, read, and retries',
        'Cascading timeouts: in a service chain A → B → C, each hop\'s timeout must be shorter than the caller\'s',
        'Request budget: A has 10s total, calls B with 4s timeout, B calls C with 2s timeout — leaves room for retries',
        'AbortController in modern JS: the standard way to implement timeouts with cancelable fetch requests',
        'Database query timeout: prevent long-running queries from consuming connection pool slots'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Timeout: Cascading Timeouts in Service Chain',
          code: `// Timeout utility using AbortController
async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await operation(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new TimeoutError(\`\${label} timed out after \${timeoutMs}ms\`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

class TimeoutError extends Error {
  constructor(message: string) { super(message); this.name = 'TimeoutError'; }
}

// Cascading timeouts: each downstream call has a shorter timeout
// API Gateway (30s) → OrderService (10s) → PaymentService (5s)

class OrderService {
  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    // Total budget: 10s from gateway
    // Payment: 5s
    // Inventory: 3s (parallel with notification)
    // Notification: 2s (non-critical, short timeout)

    const payment = await withTimeout(
      (signal) => this.paymentClient.charge(input.amount, { signal }),
      5000,
      'payment-service',
    );

    const [inventory] = await Promise.allSettled([
      withTimeout(
        (signal) => this.inventoryClient.reserve(input.items, { signal }),
        3000,
        'inventory-service',
      ),
      withTimeout(
        (signal) => this.notificationClient.sendConfirmation(input.email, { signal }),
        2000,
        'notification-service', // Non-critical — failure is OK
      ),
    ]);

    if (inventory.status === 'rejected') {
      // Compensate: refund payment
      await this.paymentClient.refund(payment.id);
      throw inventory.reason;
    }

    return this.buildOrder(input, payment);
  }
}

// Database query timeout
async function queryWithTimeout(pool: Pool, sql: string, params: unknown[], timeoutMs: number) {
  const client = await pool.connect();
  try {
    await client.query(\`SET statement_timeout = \${timeoutMs}\`);
    return await client.query(sql, params);
  } finally {
    await client.query('RESET statement_timeout');
    client.release();
  }
}`
        }
      ],
      useCases: [
        'Every external HTTP call — always set connect and response timeouts',
        'Database queries — prevent long-running queries from exhausting the connection pool',
        'Message queue operations — timeout on publish if the broker is unresponsive',
        'File system I/O — timeout on reads from network-mounted file systems'
      ],
      commonPitfalls: [
        'No timeout at all: a hanging downstream service blocks threads indefinitely',
        'Timeout too generous: 60-second timeout on an API call means 60 seconds of blocked resources per slow request',
        'Cascading timeout mismatch: inner service timeout is longer than outer service timeout — outer times out but inner continues working',
        'Not cleaning up on timeout: fetch aborted but database transaction left open — use AbortSignal + cleanup'
      ],
      interviewTips: [
        'Default zero is dangerous: "Most HTTP clients have no timeout by default — a hung connection blocks forever"',
        'Cascading: "In A → B → C, each hop must have a shorter timeout than its caller, leaving room for retries"',
        'Request budget: "Gateway gives 10s. I spend 5s on payment, 3s on inventory, leaving 2s buffer for processing."',
        'AbortController: "The modern JS standard for cancelable async operations — works with fetch, streams, and custom code"'
      ],
      relatedConcepts: ['retry-pattern', 'circuit-breaker', 'bulkhead-pattern'],
      difficulty: 'intermediate',
      tags: ['cloud', 'resilience', 'timeout', 'cascading']
    },
    {
      id: 'circuit-breaker',
      title: 'Circuit Breaker',
      description: 'Prevents an application from repeatedly trying to execute an operation that is likely to fail. Like an electrical circuit breaker, it "trips" open when failures exceed a threshold, preventing further calls and giving the failing service time to recover. After a cooldown period, it enters a "half-open" state to test if the service has recovered. If the test call succeeds, the circuit closes; if it fails, the circuit opens again.',
      keyPoints: [
        'Three states: Closed (normal operation), Open (fast-fail, no calls), Half-Open (testing recovery)',
        'Closed → Open: when failures exceed the threshold (e.g., 5 failures in 30 seconds)',
        'Open → Half-Open: after a reset timeout, allow one test call through',
        'Half-Open → Closed: if test call succeeds, resume normal operation',
        'Half-Open → Open: if test call fails, wait another reset period',
        'Metrics to track: error rate, response time percentiles, circuit state transitions',
        'Fallback: when circuit is open, return cached data, default response, or graceful degradation',
        'Per-dependency circuit breakers: separate breaker per downstream service — one failing service does not open all circuits'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Circuit Breaker: Full State Machine Implementation',
          code: `type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerConfig {
  failureThreshold: number;  // Failures to trip the circuit
  resetTimeoutMs: number;    // How long to stay open before half-open
  halfOpenMaxCalls: number;  // Max test calls in half-open state
  monitorWindowMs: number;   // Time window for counting failures
}

class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private halfOpenCalls = 0;

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig,
  ) {}

  async execute<T>(operation: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.config.resetTimeoutMs) {
        this.transitionTo('half-open');
      } else {
        if (fallback) return fallback();
        throw new CircuitOpenError(\`Circuit "\${this.name}" is open\`);
      }
    }

    if (this.state === 'half-open' && this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
      if (fallback) return fallback();
      throw new CircuitOpenError(\`Circuit "\${this.name}" half-open limit reached\`);
    }

    try {
      if (this.state === 'half-open') this.halfOpenCalls++;
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback && this.state === 'open') return fallback();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'half-open') {
      this.successes++;
      if (this.successes >= this.config.halfOpenMaxCalls) {
        this.transitionTo('closed');
      }
    }
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.config.failureThreshold) {
      this.transitionTo('open');
    }
  }

  private transitionTo(newState: CircuitState): void {
    console.log(\`Circuit "\${this.name}": \${this.state} → \${newState}\`);
    this.state = newState;
    this.failures = 0;
    this.successes = 0;
    this.halfOpenCalls = 0;
  }

  getState(): CircuitState { return this.state; }
}

class CircuitOpenError extends Error {
  constructor(message: string) { super(message); this.name = 'CircuitOpenError'; }
}

// Usage: per-dependency circuit breakers
const paymentBreaker = new CircuitBreaker('payment', {
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
  halfOpenMaxCalls: 2,
  monitorWindowMs: 60_000,
});

const inventoryBreaker = new CircuitBreaker('inventory', {
  failureThreshold: 10,
  resetTimeoutMs: 15_000,
  halfOpenMaxCalls: 3,
  monitorWindowMs: 60_000,
});

// Payment failing does not affect inventory calls
const payment = await paymentBreaker.execute(
  () => paymentClient.charge(amount),
  () => ({ status: 'pending', message: 'Payment service unavailable, will retry' }),
);`
        }
      ],
      useCases: [
        'Protecting against cascading failures when a downstream service is down',
        'Providing graceful degradation: return cached data when the primary source is unavailable',
        'Preventing resource exhaustion: stop sending requests to a service that cannot handle them',
        'Monitoring: circuit state transitions are a signal that a downstream service has issues'
      ],
      commonPitfalls: [
        'One circuit breaker for all dependencies: payment failure should not open the inventory circuit',
        'Threshold too low: transient errors trip the circuit unnecessarily — tune based on normal error rates',
        'No fallback: when the circuit opens, the user sees a raw error instead of graceful degradation',
        'Not monitoring state transitions: circuit open events are critical alerts — wire them to your monitoring'
      ],
      interviewTips: [
        'State machine: "Closed (normal), Open (fast-fail), Half-Open (testing). Draw the transitions."',
        'Per-dependency: "Each downstream service gets its own circuit breaker — failure isolation"',
        'Fallback: "Circuit open? Return cached data, a default response, or a friendly degradation message"',
        'Real-world: "Netflix Hystrix pioneered this. Modern alternatives: resilience4j, Polly, or custom implementations."'
      ],
      relatedConcepts: ['retry-pattern', 'timeout-pattern', 'bulkhead-pattern', 'microservices'],
      difficulty: 'advanced',
      tags: ['cloud', 'resilience', 'fault-tolerance', 'state-machine'],
      ascii: `
  ┌────────┐  failures >= threshold  ┌────────┐
  │ CLOSED │ ───────────────────────→│  OPEN  │
  │(normal)│                         │(reject)│
  └───┬────┘                         └───┬────┘
      ↑ success                 reset timeout ↓
      │                              ┌────────┐
      └──────────────────────────────│HALF-   │
              test succeeds          │ OPEN   │
                                     └────────┘`
    },
    {
      id: 'health-endpoint-monitoring',
      title: 'Health Endpoint Monitoring',
      description: 'Exposes a dedicated endpoint (/health or /healthz) that reports the health status of a service and its dependencies. Load balancers, orchestrators (Kubernetes), and monitoring systems poll this endpoint to determine whether to route traffic to the instance, restart it, or fire alerts. A good health check goes beyond "process is running" to verify that the service can actually serve requests.',
      keyPoints: [
        'Liveness check: "Is the process alive?" — Kubernetes restarts the pod if this fails',
        'Readiness check: "Can the service handle traffic?" — Kubernetes removes it from load balancing if this fails',
        'Dependency checks: verify database connectivity, cache availability, external API reachability',
        'Shallow vs deep health: shallow checks process status; deep checks verify all dependencies',
        'Aggregated status: overall health is only "healthy" if ALL dependencies pass',
        'Health check must be fast: a slow health check causes false negatives under load — cache dependency statuses',
        'Do NOT include sensitive info in health response: no credentials, no internal IPs in public-facing endpoints'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Health Endpoint: Comprehensive Health Check',
          code: `interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, {
    status: 'pass' | 'warn' | 'fail';
    latencyMs: number;
    message?: string;
  }>;
  uptime: number;
  version: string;
}

class HealthChecker {
  private readonly checks: Array<{ name: string; check: () => Promise<void>; critical: boolean }> = [];

  register(name: string, check: () => Promise<void>, critical = true): void {
    this.checks.push({ name, check, critical });
  }

  async check(): Promise<HealthCheckResult> {
    const results: HealthCheckResult['checks'] = {};
    let overallHealthy = true;
    let degraded = false;

    await Promise.all(this.checks.map(async ({ name, check, critical }) => {
      const start = performance.now();
      try {
        await Promise.race([
          check(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
        ]);
        results[name] = { status: 'pass', latencyMs: performance.now() - start };
      } catch (error) {
        const latencyMs = performance.now() - start;
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (critical) {
          results[name] = { status: 'fail', latencyMs, message };
          overallHealthy = false;
        } else {
          results[name] = { status: 'warn', latencyMs, message };
          degraded = true;
        }
      }
    }));

    return {
      status: overallHealthy ? (degraded ? 'degraded' : 'healthy') : 'unhealthy',
      checks: results,
      uptime: process.uptime(),
      version: process.env.APP_VERSION ?? 'unknown',
    };
  }
}

// Register dependency checks
const health = new HealthChecker();

// Critical: service cannot function without these
health.register('database', async () => {
  await pool.query('SELECT 1');
});

health.register('redis', async () => {
  await redis.ping();
});

// Non-critical: service degrades but can still function
health.register('email-service', async () => {
  const res = await fetch('http://email-service/health', { signal: AbortSignal.timeout(2000) });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
}, false);

health.register('search-index', async () => {
  const res = await fetch('http://elasticsearch:9200/_cluster/health');
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
}, false);

// Expose endpoints
app.get('/health/live', (req, res) => {
  // Liveness: process is running — always 200 unless truly stuck
  res.json({ status: 'alive' });
});

app.get('/health/ready', async (req, res) => {
  // Readiness: can handle traffic — checks all critical dependencies
  const result = await health.check();
  const status = result.status === 'unhealthy' ? 503 : 200;
  res.status(status).json(result);
});`
        }
      ],
      useCases: [
        'Kubernetes liveness and readiness probes for automatic restart and traffic routing',
        'Load balancer health checks to remove unhealthy instances from the pool',
        'Monitoring dashboards showing service and dependency health',
        'Deployment verification: new version passes health check before receiving traffic'
      ],
      commonPitfalls: [
        'Health check that always returns 200: useless — must actually verify dependencies',
        'Slow health check under load: causes false negatives and unnecessary restarts — use cached results',
        'Liveness check that depends on external services: transient DB outage restarts all pods unnecessarily',
        'Exposing sensitive information: do not include connection strings or internal IPs in public health responses'
      ],
      interviewTips: [
        'Liveness vs readiness: "Liveness: is the process alive? (restart if not). Readiness: can it handle traffic? (remove from LB if not)"',
        'Critical vs non-critical: "Database down = unhealthy. Email service down = degraded (still serve requests)."',
        'Fast: "Health checks must respond quickly — cache dependency status, do not run full queries."',
        'Kubernetes: "liveness probes trigger restarts, readiness probes remove from service endpoints — different use cases"'
      ],
      relatedConcepts: ['circuit-breaker', 'microservices', 'blue-green-deployment', 'canary-release'],
      difficulty: 'intermediate',
      tags: ['cloud', 'monitoring', 'health', 'kubernetes']
    },
    {
      id: 'competing-consumers',
      title: 'Competing Consumers',
      description: 'Multiple consumer instances read from the same message queue, competing to process messages. This pattern enables horizontal scaling of message processing: add more consumers to handle higher throughput. The message broker ensures each message is delivered to exactly one consumer (competing), not broadcast to all consumers. Critical considerations: visibility timeout, message deduplication, ordered processing, and consumer group management.',
      keyPoints: [
        'Horizontal scaling: add consumers to increase throughput — each message processed by exactly one consumer',
        'Visibility timeout: after a consumer picks a message, it becomes invisible to others for a set period',
        'If consumer crashes, visibility timeout expires and the message becomes available for another consumer',
        'Message deduplication: at-least-once delivery means duplicates can occur — consumers must be idempotent',
        'Ordered processing: standard queues do not guarantee order; FIFO queues guarantee order within a message group',
        'Dead letter queue (DLQ): messages that fail repeatedly are moved to a DLQ for investigation',
        'Consumer group (Kafka): partitions are assigned to consumers in a group — rebalancing when consumers join/leave'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Competing Consumers: Queue Processing with Idempotency',
          code: `// Consumer: processes messages from a shared queue
class OrderProcessor {
  private readonly processedIds = new Set<string>(); // In production: use database

  constructor(
    private readonly queue: MessageQueue,
    private readonly orderService: OrderService,
  ) {}

  async start(): Promise<void> {
    console.log('Consumer started, polling for messages...');

    while (true) {
      const messages = await this.queue.receiveMessages({
        maxMessages: 10,         // Batch for efficiency
        visibilityTimeoutSec: 30, // 30s to process before message reappears
        waitTimeSec: 20,          // Long polling — efficient, reduces empty polls
      });

      await Promise.all(messages.map(msg => this.processMessage(msg)));
    }
  }

  private async processMessage(message: QueueMessage): Promise<void> {
    const { orderId, action } = JSON.parse(message.body);

    // Idempotency: skip if already processed
    if (this.processedIds.has(message.messageId)) {
      await this.queue.deleteMessage(message.receiptHandle);
      return;
    }

    try {
      switch (action) {
        case 'process_payment':
          await this.orderService.processPayment(orderId);
          break;
        case 'reserve_inventory':
          await this.orderService.reserveInventory(orderId);
          break;
        case 'send_confirmation':
          await this.orderService.sendConfirmation(orderId);
          break;
        default:
          console.warn(\`Unknown action: \${action}\`);
      }

      // Success: delete from queue and mark as processed
      this.processedIds.add(message.messageId);
      await this.queue.deleteMessage(message.receiptHandle);
    } catch (error) {
      console.error(\`Failed to process \${orderId}:\`, error);
      // Do NOT delete — message returns to queue after visibility timeout
      // After max retries (configured on queue), goes to DLQ
    }
  }
}

// Scale by running multiple instances of the same consumer
// Instance 1: picks message A, C, E
// Instance 2: picks message B, D, F
// Each message processed by exactly ONE instance

// Dead Letter Queue handler — investigate and reprocess failures
class DLQProcessor {
  async processDLQ(): Promise<void> {
    const messages = await this.dlq.receiveMessages({ maxMessages: 10 });

    for (const msg of messages) {
      const parsed = JSON.parse(msg.body);
      console.error('DLQ message:', {
        orderId: parsed.orderId,
        action: parsed.action,
        receiveCount: msg.attributes.ApproximateReceiveCount,
        firstReceived: msg.attributes.ApproximateFirstReceiveTimestamp,
      });

      // Option 1: Fix the issue and resubmit to main queue
      // Option 2: Alert ops team for manual investigation
      // Option 3: Move to a permanent failed-messages store

      await this.alertService.notify(
        \`DLQ: Order \${parsed.orderId} failed \${msg.attributes.ApproximateReceiveCount} times\`
      );
    }
  }
}`
        }
      ],
      useCases: [
        'Order processing: multiple workers process orders from a shared queue',
        'Email sending: scale email workers independently of the main application',
        'Data pipeline: parallelize ETL processing across multiple workers',
        'Image/video processing: resource-intensive tasks distributed across many workers'
      ],
      commonPitfalls: [
        'Non-idempotent consumers: duplicate message delivery causes duplicate processing',
        'Visibility timeout too short: consumer is still processing when the message becomes visible again',
        'No DLQ: poison messages (always fail) block the queue indefinitely',
        'Ordered processing assumption: standard queues do not guarantee order — use FIFO if order matters'
      ],
      interviewTips: [
        'Scaling: "Add consumer instances to increase throughput — each message processed by exactly one consumer"',
        'Idempotency: "At-least-once delivery means I must handle duplicate messages — deduplication by message ID"',
        'DLQ: "After max retries, failed messages go to a dead letter queue for investigation — do not lose messages"',
        'Visibility timeout: "If I crash, the message reappears after timeout. If I finish, I delete it explicitly."'
      ],
      relatedConcepts: ['event-driven-architecture', 'retry-pattern', 'bulkhead-pattern'],
      difficulty: 'intermediate',
      tags: ['cloud', 'messaging', 'scaling', 'queue']
    },
    {
      id: 'leader-election',
      title: 'Leader Election',
      description: 'Coordinates action among distributed instances by electing a single leader that is responsible for managing work that must not be performed by multiple instances simultaneously: cron jobs, partition assignment, schema migrations, or singleton tasks. If the leader fails, a new one is elected. Implemented using distributed locks (Redis, ZooKeeper, etcd) with lease-based timeouts and fencing tokens.',
      keyPoints: [
        'Only one leader at a time: prevents duplicate cron jobs, duplicate processing, or conflicting decisions',
        'Lease-based: leader holds a lock with a TTL — if it crashes, the lock expires and another instance can claim leadership',
        'Fencing tokens: monotonically increasing token issued with each lease — prevents split-brain scenarios',
        'Heartbeat: leader must renew the lease before it expires — if it cannot renew, it must stop acting as leader',
        'Implementation: Redis SETNX + TTL, ZooKeeper ephemeral nodes, etcd lease API, Kubernetes Lease objects',
        'Split-brain risk: network partition can cause two instances to believe they are the leader — fencing tokens mitigate this',
        'Kubernetes native: the coordination.k8s.io/v1 Lease resource provides built-in leader election'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Leader Election: Redis-Based with Fencing Tokens',
          code: `class RedisLeaderElection {
  private isLeader = false;
  private fencingToken = 0;
  private renewalInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly redis: RedisClient,
    private readonly lockKey: string,
    private readonly instanceId: string,
    private readonly leaseTtlMs: number,
  ) {}

  async start(onBecomeLeader: () => void, onLoseLeadership: () => void): Promise<void> {
    // Attempt to become leader every leaseTtl/3
    setInterval(async () => {
      if (!this.isLeader) {
        await this.tryAcquire(onBecomeLeader);
      }
    }, this.leaseTtlMs / 3);

    // If already leader, renew the lease
    this.renewalInterval = setInterval(async () => {
      if (this.isLeader) {
        const renewed = await this.tryRenew();
        if (!renewed) {
          this.isLeader = false;
          onLoseLeadership();
        }
      }
    }, this.leaseTtlMs / 3);
  }

  private async tryAcquire(onBecomeLeader: () => void): Promise<boolean> {
    // Atomic: SET if not exists, with TTL
    const result = await this.redis.set(
      this.lockKey,
      JSON.stringify({ instanceId: this.instanceId, token: Date.now() }),
      'PX', this.leaseTtlMs,
      'NX', // Only set if key does not exist
    );

    if (result === 'OK') {
      this.isLeader = true;
      this.fencingToken = Date.now();
      console.log(\`[\${this.instanceId}] Became leader with token \${this.fencingToken}\`);
      onBecomeLeader();
      return true;
    }
    return false;
  }

  private async tryRenew(): Promise<boolean> {
    // Renew only if we still hold the lock (compare instance ID)
    const current = await this.redis.get(this.lockKey);
    if (!current) return false;

    const parsed = JSON.parse(current);
    if (parsed.instanceId !== this.instanceId) return false;

    // Extend the TTL
    await this.redis.pexpire(this.lockKey, this.leaseTtlMs);
    return true;
  }

  async stop(): Promise<void> {
    if (this.renewalInterval) clearInterval(this.renewalInterval);
    if (this.isLeader) {
      // Release lock only if we still hold it
      const current = await this.redis.get(this.lockKey);
      if (current) {
        const parsed = JSON.parse(current);
        if (parsed.instanceId === this.instanceId) {
          await this.redis.del(this.lockKey);
        }
      }
      this.isLeader = false;
    }
  }

  getFencingToken(): number { return this.fencingToken; }
}

// Usage: only the leader runs cron jobs
const election = new RedisLeaderElection(redis, 'app:leader', 'instance-1', 30_000);

await election.start(
  () => {
    console.log('I am the leader — starting cron jobs');
    startDailyReportJob();
    startCleanupJob();
  },
  () => {
    console.log('Lost leadership — stopping cron jobs');
    stopAllCronJobs();
  },
);`
        }
      ],
      useCases: [
        'Cron jobs in clustered environments: only one instance should run scheduled tasks',
        'Partition assignment: leader assigns queue partitions to consumer instances',
        'Schema migration: only one instance should run database migrations on startup',
        'Cache warming: leader pre-populates shared cache, followers read from it'
      ],
      commonPitfalls: [
        'Split-brain: two leaders active simultaneously due to network partition — use fencing tokens',
        'Leader that does not renew: lease expires, another instance becomes leader, but old leader keeps working',
        'Clock skew: TTL-based locks rely on consistent time — NTP drift can cause early/late expiration',
        'Single point of failure: if the coordination service (Redis, ZooKeeper) goes down, no leader can be elected'
      ],
      interviewTips: [
        'Lease-based: "Leader holds a lock with a TTL. If it crashes, the lock expires and another takes over."',
        'Fencing tokens: "Monotonically increasing token prevents split-brain — old leader\'s token is rejected by downstream services"',
        'When needed: "Any singleton task in a distributed system — cron jobs, migrations, partition assignment"',
        'Implementations: "Redis SETNX, ZooKeeper ephemeral nodes, etcd leases, Kubernetes Lease resources"'
      ],
      relatedConcepts: ['competing-consumers', 'microservices', 'sharding-pattern'],
      difficulty: 'expert',
      tags: ['cloud', 'distributed', 'coordination', 'consistency']
    },
    {
      id: 'sharding-pattern',
      title: 'Sharding Pattern',
      description: 'Horizontally partitions data across multiple database instances (shards) to scale beyond the capacity of a single database. Each shard holds a subset of the data, determined by a shard key. Sharding enables near-linear scaling of storage and throughput but introduces significant complexity: shard key selection, cross-shard queries, rebalancing, and hot shard problems.',
      keyPoints: [
        'Shard key: the attribute used to determine which shard holds a record — tenant_id, user_id, geographic region',
        'Hash-based sharding: hash(shard_key) % num_shards — even distribution but makes range queries impossible',
        'Range-based sharding: shard_key ranges (A-M on shard 1, N-Z on shard 2) — enables range queries but risks uneven distribution',
        'Hot shard problem: one shard receives disproportionate traffic (celebrity user, popular product) — monitor and rebalance',
        'Cross-shard queries: joining data across shards is expensive — design the schema so most queries hit a single shard',
        'Rebalancing: adding/removing shards requires migrating data — consistent hashing reduces the migration scope',
        'Shard key is nearly immutable: changing the shard key requires migrating ALL data — choose carefully upfront'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Sharding: Router with Consistent Hashing',
          code: `// Shard router — maps shard key to database instance
class ShardRouter {
  constructor(private readonly shards: Map<number, DatabasePool>) {}

  // Hash-based routing
  getShardForKey(key: string): DatabasePool {
    const hash = this.hashKey(key);
    const shardId = hash % this.shards.size;
    const pool = this.shards.get(shardId);
    if (!pool) throw new Error(\`Shard \${shardId} not found\`);
    return pool;
  }

  // Consistent hashing — minimizes data movement when adding/removing shards
  private ring: Array<{ hash: number; shardId: number }> = [];

  initializeRing(virtualNodesPerShard: number = 150): void {
    this.ring = [];
    for (const [shardId] of this.shards) {
      for (let i = 0; i < virtualNodesPerShard; i++) {
        this.ring.push({
          hash: this.hashKey(\`shard-\${shardId}-vnode-\${i}\`),
          shardId,
        });
      }
    }
    this.ring.sort((a, b) => a.hash - b.hash);
  }

  getShardConsistent(key: string): DatabasePool {
    const hash = this.hashKey(key);
    // Find the first node on the ring with hash >= key hash
    const node = this.ring.find(n => n.hash >= hash) ?? this.ring[0];
    return this.shards.get(node.shardId)!;
  }

  private hashKey(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }
}

// Sharded repository — routes queries to the correct shard
class ShardedUserRepository {
  constructor(private readonly router: ShardRouter) {}

  async findById(userId: string): Promise<User | null> {
    const db = this.router.getShardConsistent(userId);
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0] ?? null;
  }

  async save(user: User): Promise<void> {
    const db = this.router.getShardConsistent(user.id);
    await db.query(
      'INSERT INTO users (id, email, name) VALUES ($1,$2,$3) ON CONFLICT (id) DO UPDATE SET email=$2, name=$3',
      [user.id, user.email, user.name],
    );
  }

  // Cross-shard query — expensive! Query all shards and merge
  async findByEmail(email: string): Promise<User | null> {
    // Email is NOT the shard key, so we must query all shards
    const results = await Promise.all(
      [...this.router.shards.values()].map(db =>
        db.query('SELECT * FROM users WHERE email = $1', [email])
      ),
    );
    for (const result of results) {
      if (result.rows[0]) return result.rows[0];
    }
    return null;
  }
}

// Setup
const shards = new Map<number, DatabasePool>([
  [0, new Pool({ connectionString: 'postgres://shard0:5432/app' })],
  [1, new Pool({ connectionString: 'postgres://shard1:5432/app' })],
  [2, new Pool({ connectionString: 'postgres://shard2:5432/app' })],
]);

const router = new ShardRouter(shards);
router.initializeRing();`
        }
      ],
      useCases: [
        'Multi-tenant SaaS: shard by tenant_id — each tenant data on one shard, no cross-tenant queries',
        'Social networks: shard by user_id — user data and posts on the same shard',
        'Geographic partitioning: shard by region — data locality for compliance and latency',
        'Time-series data: shard by time range — old data on cold storage, recent data on fast storage'
      ],
      commonPitfalls: [
        'Wrong shard key: choosing a key that leads to hot shards or requires frequent cross-shard queries',
        'Cross-shard joins: if common queries span shards, the sharding strategy is wrong',
        'Rebalancing nightmare: adding a shard without consistent hashing moves most of the data',
        'Shard key change: nearly impossible after data is distributed — get it right upfront'
      ],
      interviewTips: [
        'Shard key is the most important decision: "Choose based on query patterns — most queries should hit a single shard"',
        'Consistent hashing: "When adding a shard, only 1/N of data needs to move, not all of it"',
        'Cross-shard queries: "If findByEmail queries all shards, I either need a secondary index or email as a shard key component"',
        'When NOT to shard: "Vertical scaling (bigger machine) is simpler. Shard only when you truly exceed single-node capacity."'
      ],
      relatedConcepts: ['competing-consumers', 'leader-election', 'microservices'],
      difficulty: 'expert',
      tags: ['cloud', 'scaling', 'database', 'partitioning']
    },
    {
      id: 'event-sourcing-cqrs-combined',
      title: 'Event Sourcing + CQRS Combined',
      description: 'The most powerful combination of the two patterns: Event Sourcing provides the write side (append-only event log as the source of truth), while CQRS provides the read side (projections built from the event stream). Write operations append events; read operations query pre-built projections. This combination gives you a complete audit trail, temporal queries, multiple read-optimized views, and the ability to rebuild any view from scratch by replaying events.',
      keyPoints: [
        'Write side: validate command, produce events, append to event store — no read model concerns',
        'Read side: event handlers consume events and update denormalized projections — no write concerns',
        'Projection rebuilding: deploy new read model, replay all events, build the projection from scratch',
        'Event store is the single source of truth — projections are derived, disposable, and rebuildable',
        'Snapshot optimization: periodically snapshot aggregate state to avoid replaying entire event history',
        'Event schema versioning: events are immutable — handle schema changes with upcasters during replay',
        'Eventually consistent: projections lag behind the event store — handle stale reads in the UI'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Event Sourcing + CQRS: Full Pattern',
          code: `// ─── WRITE SIDE: Event Sourcing ──────────────────────

// Command handler: validates, produces events
class CreateAccountHandler {
  constructor(private readonly eventStore: EventStore) {}

  async handle(command: CreateAccountCommand): Promise<string> {
    const accountId = crypto.randomUUID();

    // Business validation
    if (command.initialDeposit < 0) throw new Error('Initial deposit must be non-negative');

    // Produce events (not state mutation)
    const events: DomainEvent[] = [
      {
        type: 'AccountCreated',
        aggregateId: accountId,
        data: {
          customerId: command.customerId,
          accountType: command.accountType,
          initialDeposit: command.initialDeposit,
        },
        timestamp: new Date(),
        version: 1,
      },
    ];

    if (command.initialDeposit > 0) {
      events.push({
        type: 'MoneyDeposited',
        aggregateId: accountId,
        data: { amount: command.initialDeposit, source: 'initial_deposit' },
        timestamp: new Date(),
        version: 2,
      });
    }

    // Append to event store (source of truth)
    await this.eventStore.append(accountId, events);
    return accountId;
  }
}

// ─── READ SIDE: CQRS Projections ────────────────────

// Projection 1: Account summary (for account list page)
class AccountSummaryProjection {
  constructor(private readonly readDb: ReadDatabase) {}

  async onAccountCreated(event: DomainEvent): Promise<void> {
    await this.readDb.query(
      \`INSERT INTO account_summaries (id, customer_id, type, balance, created_at)
       VALUES ($1, $2, $3, $4, $5)\`,
      [event.aggregateId, event.data.customerId, event.data.accountType, 0, event.timestamp],
    );
  }

  async onMoneyDeposited(event: DomainEvent): Promise<void> {
    await this.readDb.query(
      'UPDATE account_summaries SET balance = balance + $1 WHERE id = $2',
      [event.data.amount, event.aggregateId],
    );
  }

  async onMoneyWithdrawn(event: DomainEvent): Promise<void> {
    await this.readDb.query(
      'UPDATE account_summaries SET balance = balance - $1 WHERE id = $2',
      [event.data.amount, event.aggregateId],
    );
  }
}

// Projection 2: Transaction history (for account detail page)
class TransactionHistoryProjection {
  constructor(private readonly readDb: ReadDatabase) {}

  async onMoneyDeposited(event: DomainEvent): Promise<void> {
    await this.readDb.query(
      'INSERT INTO transactions (id, account_id, type, amount, timestamp) VALUES ($1,$2,$3,$4,$5)',
      [crypto.randomUUID(), event.aggregateId, 'deposit', event.data.amount, event.timestamp],
    );
  }

  async onMoneyWithdrawn(event: DomainEvent): Promise<void> {
    await this.readDb.query(
      'INSERT INTO transactions (id, account_id, type, amount, timestamp) VALUES ($1,$2,$3,$4,$5)',
      [crypto.randomUUID(), event.aggregateId, 'withdrawal', event.data.amount, event.timestamp],
    );
  }
}

// Projection rebuilder — replay all events to rebuild a projection from scratch
class ProjectionRebuilder {
  constructor(private readonly eventStore: EventStore) {}

  async rebuild(projection: EventHandler, projectionName: string): Promise<void> {
    console.log(\`Rebuilding projection: \${projectionName}\`);
    await projection.reset(); // Clear existing data

    let processedCount = 0;
    for await (const event of this.eventStore.streamAllEvents()) {
      await projection.handle(event);
      processedCount++;
      if (processedCount % 10000 === 0) {
        console.log(\`  Processed \${processedCount} events...\`);
      }
    }

    console.log(\`Rebuilt \${projectionName}: \${processedCount} events processed\`);
  }
}`
        }
      ],
      useCases: [
        'Financial systems: complete audit trail + fast read views for statements and dashboards',
        'Collaborative tools: event history enables undo/redo, conflict resolution, and activity feeds',
        'Analytics: replay events through new analytical projections without changing the source data',
        'Regulatory compliance: immutable event log satisfies audit requirements'
      ],
      commonPitfalls: [
        'Projection lag: writes are immediate but reads may be stale — handle in the UI with optimistic updates',
        'Event versioning: changing event schemas requires backward-compatible upcasters',
        'Projection rebuild time: replaying millions of events can take hours — have a strategy for zero-downtime rebuilds',
        'Complexity: this is the most complex architectural pattern — only use when the benefits (audit, rebuild, temporal) are required'
      ],
      interviewTips: [
        'Source of truth: "The event store is THE source of truth. Projections are derived views that can be rebuilt."',
        'Rebuild: "Deploy a new projection, replay all events, and the new view is populated — no migration needed."',
        'When to use: "When you need complete audit trails, temporal queries, or multiple independent read models."',
        'When NOT to use: "Simple CRUD with no audit requirements. The complexity cost is significant."'
      ],
      relatedConcepts: ['event-sourcing', 'cqrs-arch', 'domain-events', 'aggregates'],
      difficulty: 'expert',
      tags: ['cloud', 'event-sourcing', 'cqrs', 'projections']
    },
    {
      id: 'blue-green-deployment',
      title: 'Blue-Green Deployment',
      description: 'Maintains two identical production environments — Blue (current live) and Green (new version). Deploy the new version to Green, verify it works, then switch the router to point to Green. If anything goes wrong, switch back to Blue instantly. This eliminates downtime during deployment and provides instant rollback capability. The catch: you need double the infrastructure, and database schema changes require careful coordination.',
      keyPoints: [
        'Two identical environments: Blue is live, Green is staged with the new version',
        'Instant cutover: switch the load balancer from Blue to Green — zero-downtime deployment',
        'Instant rollback: switch the load balancer back to Blue if Green has issues',
        'Database challenge: both environments may share a database — schema changes must be backward-compatible',
        'Cost: double the infrastructure during deployment — trade cost for safety and speed',
        'Verification: run smoke tests and health checks against Green before switching',
        'Session management: active sessions on Blue may be lost during cutover — use external session storage'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Blue-Green: Deployment Orchestrator',
          code: `class BlueGreenDeployment {
  constructor(
    private readonly loadBalancer: LoadBalancerManager,
    private readonly environments: {
      blue: EnvironmentManager;
      green: EnvironmentManager;
    },
    private readonly healthChecker: HealthChecker,
    private readonly notifier: DeploymentNotifier,
  ) {}

  async deploy(newVersion: string): Promise<DeploymentResult> {
    const active = await this.loadBalancer.getActiveEnvironment();
    const inactive = active === 'blue' ? 'green' : 'blue';
    const inactiveEnv = this.environments[inactive];

    console.log(\`Deploying \${newVersion} to \${inactive} (active: \${active})\`);

    try {
      // 1. Deploy new version to inactive environment
      await inactiveEnv.deploy(newVersion);
      console.log(\`Deployed to \${inactive}\`);

      // 2. Wait for instances to be ready
      await inactiveEnv.waitForReady({ timeoutMs: 120_000 });
      console.log(\`\${inactive} instances ready\`);

      // 3. Run smoke tests against inactive environment
      const smokeResult = await this.healthChecker.runSmokeTests(inactiveEnv.getUrl());
      if (!smokeResult.passed) {
        throw new Error(\`Smoke tests failed: \${smokeResult.failures.join(', ')}\`);
      }
      console.log('Smoke tests passed');

      // 4. Switch traffic to inactive (now becomes active)
      await this.loadBalancer.switchTo(inactive);
      console.log(\`Traffic switched to \${inactive}\`);

      // 5. Monitor for errors (wait 5 minutes)
      const monitorResult = await this.monitor(inactiveEnv, 300_000);
      if (!monitorResult.healthy) {
        // ROLLBACK: switch back to previously active environment
        console.error('Errors detected — rolling back');
        await this.loadBalancer.switchTo(active);
        await this.notifier.notifyRollback(newVersion, monitorResult.errors);
        return { success: false, rolledBack: true, errors: monitorResult.errors };
      }

      await this.notifier.notifySuccess(newVersion, inactive);
      return { success: true, environment: inactive };
    } catch (error) {
      // Ensure we are still on the active environment
      await this.loadBalancer.switchTo(active);
      throw error;
    }
  }

  private async monitor(env: EnvironmentManager, durationMs: number) {
    const endTime = Date.now() + durationMs;
    const errors: string[] = [];

    while (Date.now() < endTime) {
      const health = await this.healthChecker.check(env.getUrl());
      if (health.status === 'unhealthy') {
        errors.push(\`Unhealthy at \${new Date().toISOString()}: \${JSON.stringify(health)}\`);
        if (errors.length >= 3) return { healthy: false, errors };
      }
      await new Promise(r => setTimeout(r, 10_000));
    }

    return { healthy: true, errors };
  }
}`
        }
      ],
      useCases: [
        'Zero-downtime deployments for critical production services',
        'Instant rollback capability without redeployment',
        'Pre-production verification: test new version with production-like traffic before going live',
        'Compliance: demonstrate zero-downtime deployment capability for SLA requirements'
      ],
      commonPitfalls: [
        'Database schema changes: both environments share a database — migrations must be backward-compatible',
        'Sticky sessions: sessions on Blue are lost when switching to Green — use external session storage (Redis)',
        'Infrastructure cost: double the servers during deployment — use cloud auto-scaling to mitigate',
        'DNS propagation: if using DNS for switching, propagation delay causes inconsistent routing — use load balancer instead'
      ],
      interviewTips: [
        'Instant rollback: "Switch the load balancer back to Blue — no redeployment needed"',
        'Database challenge: "Schema changes must be backward-compatible — both environments share the database"',
        'Versus canary: "Blue-green is all-or-nothing cutover. Canary is gradual traffic shifting."',
        'Cost: "Double infrastructure during deployment. Cloud makes this cheap — spin up Green, deploy, switch, tear down Blue."'
      ],
      relatedConcepts: ['canary-release', 'strangler-fig-pattern', 'feature-flags', 'health-endpoint-monitoring'],
      difficulty: 'intermediate',
      tags: ['cloud', 'deployment', 'zero-downtime', 'rollback']
    },
    {
      id: 'canary-release',
      title: 'Canary Release',
      description: 'Gradually rolls out a new version to a small subset of users or instances before routing all traffic to it. Start with 1% of traffic to the canary, monitor for errors, then increase to 5%, 10%, 25%, 50%, 100%. If errors spike at any stage, automatically roll back to the previous version. Named after canaries in coal mines — the canary detects problems before they affect everyone.',
      keyPoints: [
        'Gradual rollout: 1% → 5% → 10% → 25% → 50% → 100% — increase only when metrics look good',
        'Automated rollback: if error rate or latency exceeds thresholds, automatically route all traffic back to the stable version',
        'Metrics monitoring: compare canary metrics against baseline — error rate, latency, business metrics',
        'User-based routing: route specific users (beta users, employees) to the canary for early validation',
        'Weight-based routing: load balancer sends N% of traffic to canary instances',
        'Duration at each stage: enough time to detect problems — at least 5-10 minutes per stage',
        'Feature flags as lightweight canary: enable new features for a percentage of users without separate deployment'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Canary Release: Progressive Rollout Controller',
          code: `interface CanaryStage {
  percentage: number;
  durationMinutes: number;
  successCriteria: {
    maxErrorRate: number;       // e.g., 0.01 = 1%
    maxP99LatencyMs: number;    // e.g., 500ms
    minSuccessRate: number;     // e.g., 0.99 = 99%
  };
}

class CanaryReleaseController {
  private readonly stages: CanaryStage[] = [
    { percentage: 1,   durationMinutes: 5,  successCriteria: { maxErrorRate: 0.01, maxP99LatencyMs: 500, minSuccessRate: 0.99 } },
    { percentage: 5,   durationMinutes: 10, successCriteria: { maxErrorRate: 0.01, maxP99LatencyMs: 500, minSuccessRate: 0.99 } },
    { percentage: 25,  durationMinutes: 15, successCriteria: { maxErrorRate: 0.02, maxP99LatencyMs: 600, minSuccessRate: 0.98 } },
    { percentage: 50,  durationMinutes: 15, successCriteria: { maxErrorRate: 0.02, maxP99LatencyMs: 600, minSuccessRate: 0.98 } },
    { percentage: 100, durationMinutes: 0,  successCriteria: { maxErrorRate: 0.05, maxP99LatencyMs: 800, minSuccessRate: 0.95 } },
  ];

  constructor(
    private readonly loadBalancer: LoadBalancerManager,
    private readonly metricsCollector: MetricsCollector,
    private readonly notifier: DeploymentNotifier,
  ) {}

  async rollout(canaryVersion: string): Promise<RolloutResult> {
    for (const stage of this.stages) {
      console.log(\`Canary stage: \${stage.percentage}% traffic to \${canaryVersion}\`);
      await this.loadBalancer.setCanaryWeight(stage.percentage);

      if (stage.durationMinutes === 0) break; // 100% — done

      // Monitor for the stage duration
      const passed = await this.monitorStage(stage);
      if (!passed) {
        console.error(\`Canary failed at \${stage.percentage}% — rolling back\`);
        await this.loadBalancer.setCanaryWeight(0);
        await this.notifier.notifyRollback(canaryVersion, stage.percentage);
        return { success: false, failedAtPercentage: stage.percentage };
      }

      console.log(\`Stage \${stage.percentage}% passed — advancing\`);
    }

    await this.notifier.notifySuccess(canaryVersion);
    return { success: true, finalPercentage: 100 };
  }

  private async monitorStage(stage: CanaryStage): Promise<boolean> {
    const endTime = Date.now() + stage.durationMinutes * 60_000;
    const checkIntervalMs = 30_000; // Check every 30 seconds

    while (Date.now() < endTime) {
      await new Promise(r => setTimeout(r, checkIntervalMs));

      const metrics = await this.metricsCollector.getCanaryMetrics();
      const { successCriteria } = stage;

      if (metrics.errorRate > successCriteria.maxErrorRate) {
        console.error(\`Error rate \${metrics.errorRate} exceeds \${successCriteria.maxErrorRate}\`);
        return false;
      }
      if (metrics.p99LatencyMs > successCriteria.maxP99LatencyMs) {
        console.error(\`P99 latency \${metrics.p99LatencyMs}ms exceeds \${successCriteria.maxP99LatencyMs}ms\`);
        return false;
      }
      if (metrics.successRate < successCriteria.minSuccessRate) {
        console.error(\`Success rate \${metrics.successRate} below \${successCriteria.minSuccessRate}\`);
        return false;
      }
    }

    return true;
  }
}`
        }
      ],
      useCases: [
        'Progressive rollout of new API versions with automated rollback',
        'Testing new algorithms with real traffic before full deployment',
        'Database migration validation with a small percentage of live queries',
        'Regional rollout: deploy to one region first, then expand globally'
      ],
      commonPitfalls: [
        'Too fast: advancing from 1% to 100% in minutes does not give enough time to detect slow-burn issues',
        'Wrong metrics: monitoring only HTTP errors while missing business metric regressions (conversion rate, checkout completion)',
        'No automated rollback: manual intervention is too slow — automate the rollback trigger',
        'Canary too small: 1% of traffic on a low-traffic service may be 2 requests per minute — not statistically significant'
      ],
      interviewTips: [
        'Versus blue-green: "Blue-green is instant 0%→100% cutover. Canary is gradual 1%→5%→25%→100%."',
        'Automated rollback: "If error rate exceeds threshold at any stage, automatically route all traffic back to stable"',
        'Business metrics: "Monitor not just error rates but business KPIs — conversion rate, checkout completion"',
        'Statistical significance: "At low traffic, canary metrics are noisy — wait long enough to get meaningful signal"'
      ],
      relatedConcepts: ['blue-green-deployment', 'feature-flags', 'circuit-breaker', 'health-endpoint-monitoring'],
      difficulty: 'advanced',
      tags: ['cloud', 'deployment', 'progressive', 'rollback']
    },
    {
      id: 'feature-flags',
      title: 'Feature Flags',
      description: 'Runtime configuration that controls whether a feature is enabled or disabled without deploying new code. Feature flags decouple deployment from release: deploy code to production anytime, enable the feature for specific users when ready. Beyond simple on/off toggles, feature flags enable A/B testing, gradual rollouts, kill switches for incidents, and per-user customization. The trade-off: flag debt — unused flags that accumulate and clutter the codebase.',
      keyPoints: [
        'Deploy ≠ Release: code is deployed but the feature is hidden behind a flag — enable when ready',
        'Kill switch: disable a broken feature instantly without deploying — invaluable during incidents',
        'Gradual rollout: enable for 1% of users, increase to 5%, 10%, 50%, 100% — canary without new deployment',
        'A/B testing: show variant A to 50% of users, variant B to 50%, measure which performs better',
        'Per-user targeting: enable for specific users (beta testers), user segments, or geographies',
        'Flag types: release (deploy/release decoupling), experiment (A/B), ops (kill switch), permission (entitlement)',
        'Flag debt: every unused flag is tech debt — review and remove flags after full rollout or experiment completion'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Feature Flags: Typed System with Targeting',
          code: `// Flag definition — typed, with default values
interface FeatureFlags {
  'new-checkout-flow': boolean;
  'ai-recommendations': boolean;
  'dark-mode': boolean;
  'max-upload-size-mb': number;
  'checkout-experiment': 'control' | 'variant-a' | 'variant-b';
}

interface UserContext {
  userId: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  country: string;
  percentile: number; // 0-100, stable per user (hash of userId)
}

interface FlagRule<T> {
  condition: (ctx: UserContext) => boolean;
  value: T;
}

class FeatureFlagService {
  private readonly flags = new Map<string, { default: unknown; rules: FlagRule<unknown>[] }>();

  register<K extends keyof FeatureFlags>(
    flag: K,
    defaultValue: FeatureFlags[K],
    rules: FlagRule<FeatureFlags[K]>[] = [],
  ): void {
    this.flags.set(flag, { default: defaultValue, rules });
  }

  evaluate<K extends keyof FeatureFlags>(flag: K, ctx: UserContext): FeatureFlags[K] {
    const config = this.flags.get(flag);
    if (!config) return undefined as FeatureFlags[K];

    // First matching rule wins
    for (const rule of config.rules) {
      if (rule.condition(ctx)) return rule.value as FeatureFlags[K];
    }

    return config.default as FeatureFlags[K];
  }
}

// Setup
const flags = new FeatureFlagService();

// Release flag: gradual rollout
flags.register('new-checkout-flow', false, [
  { condition: (ctx) => ctx.email.endsWith('@company.com'), value: true }, // Internal users
  { condition: (ctx) => ctx.plan === 'enterprise', value: true },          // Enterprise first
  { condition: (ctx) => ctx.percentile < 25, value: true },               // 25% of remaining users
]);

// Kill switch: ops flag for disabling during incidents
flags.register('ai-recommendations', true, [
  // No rules = always enabled. Add a rule to disable:
  // { condition: () => true, value: false } ← kill switch
]);

// Experiment: A/B test
flags.register('checkout-experiment', 'control', [
  { condition: (ctx) => ctx.percentile < 33, value: 'variant-a' },
  { condition: (ctx) => ctx.percentile < 66, value: 'variant-b' },
  // Remaining 34%: control (default)
]);

// Usage in application code
async function renderCheckout(user: UserContext) {
  const useNewCheckout = flags.evaluate('new-checkout-flow', user);
  const experiment = flags.evaluate('checkout-experiment', user);

  if (useNewCheckout) {
    return renderNewCheckout(experiment);
  }
  return renderLegacyCheckout();
}

// Flag debt cleanup — track when flags were created
// If 'new-checkout-flow' has been 100% for 30 days, remove the flag and the old code path`
        }
      ],
      useCases: [
        'Deploy/release decoupling: deploy daily, enable features when business is ready',
        'Kill switches: disable a feature instantly during incidents without deployment',
        'A/B testing: test variations of a feature with real users and measure outcomes',
        'Gradual rollout: canary releases without infrastructure changes — just flip the flag percentage',
        'Entitlements: enable premium features for specific subscription tiers'
      ],
      commonPitfalls: [
        'Flag debt: never removing old flags — code becomes a maze of conditional branches',
        'Testing: not testing all flag combinations — feature works when enabled but breaks when disabled',
        'Stale flags: a flag set to 100% for months that nobody has cleaned up',
        'Complexity: nested flag conditions create exponential code paths — keep flag logic simple'
      ],
      interviewTips: [
        'Deploy vs release: "I deploy code to production multiple times a day. I release features to users when they are ready."',
        'Kill switch: "In an incident, I disable the broken feature in seconds — no deployment, no rollback."',
        'Flag debt: "Every flag must have an expiry date. If it is 100% enabled for 30 days, remove the flag and the old code."',
        'LaunchDarkly/Unleash: "Managed feature flag services that provide targeting, analytics, and lifecycle management."'
      ],
      relatedConcepts: ['canary-release', 'blue-green-deployment', 'strategy'],
      difficulty: 'intermediate',
      tags: ['cloud', 'deployment', 'ab-testing', 'kill-switch', 'progressive-delivery']
    },
  ],
}
