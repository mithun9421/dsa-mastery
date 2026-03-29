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

export const observabilityCategory: Category = {
  id: 'observability',
  title: 'Observability',
  description: 'Structured logging, distributed tracing, metrics, SLIs/SLOs/SLAs, health checks, error tracking, performance profiling, and alerting. The three pillars of observability plus the operational practices that make them useful.',
  icon: '📡',
  concepts: [
    {
      id: 'structured-logging',
      title: 'Structured Logging',
      description: 'Structured logging outputs log entries as machine-parseable data (JSON) instead of human-readable strings. This single change transforms logs from "I hope I can grep for it" to "I can query, filter, aggregate, and alert on any field." Pair structured logs with correlation IDs (trace IDs) and log aggregation (ELK, Loki, Datadog) and you have a queryable record of everything your application does.',
      keyPoints: [
        'JSON logs: each log entry is a JSON object with standardized fields — timestamp, level, message, service, traceId, userId, etc.',
        'Correlation ID (trace ID): a unique ID propagated across all services for a single request. Include it in every log entry for cross-service debugging',
        'Log levels: DEBUG (verbose development info), INFO (normal operations), WARN (unexpected but handled), ERROR (failures requiring attention), FATAL (app cannot continue)',
        'DEBUG in production hurts: it increases log volume 10-100x, raises costs, and can expose sensitive data. Use INFO as the minimum production level',
        'Log aggregation: ship logs to ELK (Elasticsearch + Logstash + Kibana), Grafana Loki, Datadog Logs, or CloudWatch Logs for centralized querying',
        'Sampling: for high-traffic services, log only a percentage of requests at DEBUG level. Always log 100% of errors',
        'Never log secrets: passwords, tokens, credit card numbers, PII. Use a redaction middleware or allowlist loggable fields',
        'Context propagation: attach request context (userId, traceId, requestId) to all logs within a request lifecycle using AsyncLocalStorage (Node.js)',
        'Use a structured logger library: pino (fastest Node.js logger), winston (most popular), bunyan. Never use console.log in production'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Structured Logging with Pino + Request Context',
          code: `import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Request context stored in AsyncLocalStorage
interface RequestContext {
  readonly traceId: string;
  readonly userId?: string;
  readonly method: string;
  readonly path: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

// Base logger
const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }), // "level": "info" instead of "level": 30
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token', 'secret'],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Context-aware logger: automatically includes request context
function getLogger() {
  const ctx = asyncLocalStorage.getStore();
  return ctx ? baseLogger.child({ traceId: ctx.traceId, userId: ctx.userId }) : baseLogger;
}

// Middleware: create request context + log request/response
function requestLogger(req: Request, res: Response, next: NextFunction) {
  const traceId = (req.headers['x-trace-id'] as string) || crypto.randomUUID();
  const context: RequestContext = {
    traceId,
    userId: req.user?.id,
    method: req.method,
    path: req.path,
  };

  // Set trace ID in response header for client debugging
  res.setHeader('X-Trace-Id', traceId);

  const startTime = Date.now();

  asyncLocalStorage.run(context, () => {
    const logger = getLogger();
    logger.info({ method: req.method, path: req.path, query: req.query }, 'Request started');

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logFn = res.statusCode >= 500 ? logger.error.bind(logger) : logger.info.bind(logger);
      logFn({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: duration,
      }, 'Request completed');
    });

    next();
  });
}

app.use(requestLogger);

// Usage in application code
async function processOrder(orderId: string) {
  const logger = getLogger(); // automatically includes traceId and userId
  logger.info({ orderId }, 'Processing order');

  try {
    const order = await db.orders.findById(orderId);
    logger.info({ orderId, total: order.total }, 'Order found');
    // ... process
  } catch (err) {
    logger.error({ orderId, err }, 'Order processing failed');
    throw err;
  }
}`
        }
      ],
      useCases: [
        'Every production application — structured logging is baseline observability',
        'Microservice architectures — correlation IDs tie logs across services for a single request',
        'Debugging production issues — query logs by user ID, error type, or time range',
        'Compliance and auditing — log important business events with structured context'
      ],
      commonPitfalls: [
        'Using console.log in production — no structure, no levels, no redaction, poor performance',
        'Logging at DEBUG level in production — massive volume, high cost, potential PII exposure',
        'Not including correlation/trace IDs — cross-service debugging becomes guesswork',
        'Logging sensitive data — passwords, tokens, and PII in logs are a compliance violation and security risk',
        'Unstructured log messages with string concatenation — impossible to query or aggregate'
      ],
      interviewTips: [
        'Explain why structured (JSON) beats unstructured (text): machine-parseable, queryable, filterable, aggregatable',
        'Discuss the role of correlation IDs: one ID per request, propagated across all services, included in every log entry',
        'Compare log levels and when to use each: DEBUG (dev only), INFO (normal ops), WARN (recoverable issues), ERROR (failures)',
        'Mention AsyncLocalStorage (Node.js) or ThreadLocal (Java) for propagating request context without passing it through every function'
      ],
      relatedConcepts: ['distributed-tracing', 'metrics', 'error-tracking'],
      difficulty: 'intermediate',
      tags: ['logging', 'structured', 'pino', 'correlation-id', 'observability'],
      proTip: 'Pino is 5-10x faster than Winston because it defers JSON serialization to a separate worker thread. In high-throughput services, this matters — synchronous logging can become a bottleneck. Use pino with pino-pretty for development and raw JSON for production.'
    },
    {
      id: 'distributed-tracing',
      title: 'Distributed Tracing',
      description: 'Distributed tracing follows a request as it flows through multiple services, recording timing and metadata at each step. A trace consists of spans: each span represents a unit of work (HTTP call, database query, queue processing). The trace ID ties all spans together. This is the ONLY way to debug latency issues in microservice architectures — logs tell you what happened in each service, traces tell you what happened across services.',
      keyPoints: [
        'Trace: the full journey of a request through all services. Identified by a unique trace ID',
        'Span: a single unit of work within a trace (HTTP request, DB query, cache lookup). Has start time, duration, status, and metadata',
        'Parent-child spans: a span can have child spans. HTTP handler span -> DB query span -> serialization span',
        'Context propagation: trace ID and span ID are passed between services via HTTP headers. W3C TraceContext (traceparent header) is the standard',
        'B3 propagation: Zipkin\'s format (X-B3-TraceId, X-B3-SpanId). Older but still widely used',
        'OpenTelemetry (OTEL): the universal standard for traces, metrics, and logs. SDKs for every language, exporters for every backend',
        'Head-based sampling: decide at trace start whether to record (e.g., 10% of traces). Simple but misses rare errors',
        'Tail-based sampling: decide after the trace completes. Keeps all error traces and slow traces. More expensive but catches what matters',
        'Backends: Jaeger (open-source), Zipkin (open-source), Honeycomb (best analysis UX), Datadog APM, AWS X-Ray',
        'Every service in the call chain must propagate the trace context — one service that drops it breaks the entire trace'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'OpenTelemetry Setup for Express',
          code: `// tracing.ts — initialize BEFORE importing express
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'order-service',
    [ATTR_SERVICE_VERSION]: '1.2.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Auto-instrument: express, http, pg, redis, fetch
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
      '@opentelemetry/instrumentation-redis': { enabled: true },
    }),
  ],
});

sdk.start();
process.on('SIGTERM', () => sdk.shutdown());

// Custom spans for business logic
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('order-service');

async function processOrder(orderId: string): Promise<Order> {
  return tracer.startActiveSpan('processOrder', async (span) => {
    span.setAttribute('order.id', orderId);

    try {
      // Child span: validate order
      const order = await tracer.startActiveSpan('validateOrder', async (validateSpan) => {
        const order = await db.orders.findById(orderId);
        validateSpan.setAttribute('order.total', order.total);
        validateSpan.end();
        return order;
      });

      // Child span: charge payment
      await tracer.startActiveSpan('chargePayment', async (paymentSpan) => {
        paymentSpan.setAttribute('payment.amount', order.total);
        await paymentService.charge(order.paymentMethodId, order.total);
        paymentSpan.end();
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return order;
    } catch (err) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}`
        }
      ],
      useCases: [
        'Microservice architectures — the only way to trace request flow across services',
        'Latency debugging — which service/query is the bottleneck in a 500ms endpoint?',
        'Error propagation — an error in service D causes a 500 in service A, traces show exactly where it started',
        'Dependency mapping — traces reveal which services call which, building a runtime service graph'
      ],
      commonPitfalls: [
        'Not propagating trace context — one service drops the header and the trace is broken',
        'Head-based sampling at 1% — you miss most errors and slow requests. Use tail-based or always sample errors',
        'Instrumenting only HTTP but not database queries — the DB query is often the slow part and it is invisible without DB instrumentation',
        'Too many custom spans — every function as a span creates noise. Span boundaries should be meaningful (I/O, service calls, significant computation)',
        'Not adding business context to spans — order ID, user ID, product count make traces useful for debugging, not just latency charts'
      ],
      interviewTips: [
        'Draw a trace waterfall diagram: Service A (100ms) -> Service B (50ms) -> DB query (30ms). Explain how you identify the bottleneck',
        'Explain W3C TraceContext: traceparent header = version-traceId-spanId-flags. Standard that all OTEL-compatible services understand',
        'Compare head-based vs tail-based sampling: head (decide early, miss rare events), tail (decide late, catch errors/slow, more expensive)',
        'Mention OpenTelemetry as the convergence of OpenTracing and OpenCensus — it is the industry standard now'
      ],
      relatedConcepts: ['structured-logging', 'metrics', 'sli-slo-sla'],
      difficulty: 'advanced',
      tags: ['tracing', 'opentelemetry', 'spans', 'distributed-systems', 'observability'],
      proTip: 'Honeycomb\'s "BubbleUp" feature automatically identifies which attributes correlate with slow or erroring traces. Instead of manually querying "why are 5% of requests slow?", it shows you "slow requests are correlated with region=eu-west and order.items > 50." This is the power of high-cardinality tracing data.'
    },
    {
      id: 'metrics',
      title: 'Metrics',
      description: 'Metrics are numerical measurements of system behavior over time: request rate, error rate, latency percentiles, CPU utilization, queue depth. Unlike logs (individual events) and traces (request journeys), metrics are aggregated and cheap to store, making them ideal for dashboards, alerting, and capacity planning. The RED method (Rate, Errors, Duration) for services and USE method (Utilization, Saturation, Errors) for resources are the standard frameworks.',
      keyPoints: [
        'Counter: monotonically increasing value (total requests, total errors). Only goes up. Use rate() to get per-second values',
        'Gauge: value that goes up and down (current connections, queue depth, temperature). Point-in-time measurement',
        'Histogram: distribution of values (request latency, response size). Stores in buckets, enables percentile calculation (p50, p95, p99)',
        'Summary: similar to histogram but calculates percentiles client-side. Less flexible but more accurate for specific percentiles',
        'RED method for services: Rate (requests/sec), Errors (errors/sec), Duration (latency histogram) — the three signals for any service',
        'USE method for resources: Utilization (% busy), Saturation (queue depth), Errors (error count) — the three signals for any resource (CPU, disk, network)',
        'Prometheus: pull-based metrics collection. Scrapes /metrics endpoint. PromQL for querying. De facto standard for Kubernetes',
        'Grafana: visualization layer. Dashboards for Prometheus, Loki, Jaeger. Alerting via Grafana Alerting or Alertmanager',
        'Labels/tags: key-value pairs on metrics (method="POST", path="/api/orders", status="500"). Enable filtering and grouping',
        'Cardinality warning: high-cardinality labels (user_id, request_id) explode metric storage. Use traces for high-cardinality data, metrics for low-cardinality aggregates'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Prometheus Metrics for Express',
          code: `import promClient from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Enable default metrics (CPU, memory, event loop lag, GC)
promClient.collectDefaultMetrics({ prefix: 'app_' });

// RED metrics: Rate, Errors, Duration
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code'] as const,
});

// Business metrics
const ordersCreated = new promClient.Counter({
  name: 'orders_created_total',
  help: 'Total orders created',
  labelNames: ['payment_method'] as const,
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

// Middleware: record RED metrics for every request
function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  activeConnections.inc();

  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    // Normalize path to prevent cardinality explosion
    // /users/123 -> /users/:id
    const normalizedPath = normalizePath(req.route?.path || req.path);

    const labels = {
      method: req.method,
      path: normalizedPath,
      status_code: res.statusCode.toString(),
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
    activeConnections.dec();
  });

  next();
}

function normalizePath(path: string): string {
  // Replace UUIDs and numeric IDs with :id
  return path
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, ':id')
    .replace(/\\/\\d+/g, '/:id');
}

app.use(metricsMiddleware);

// Metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', promClient.register.contentType);
  res.send(await promClient.register.metrics());
});

// Usage in business logic
async function createOrder(data: CreateOrderDto) {
  const order = await db.orders.create(data);
  ordersCreated.inc({ payment_method: data.paymentMethod });
  return order;
}

// PromQL examples for Grafana dashboards:
// Request rate: rate(http_requests_total[5m])
// Error rate: rate(http_requests_total{status_code=~"5.."}[5m])
// p99 latency: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
// Error ratio: rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])`
        }
      ],
      useCases: [
        'Service health dashboards — RED metrics for every service',
        'Alerting on error rate spikes or latency degradation',
        'Capacity planning — track resource utilization trends over time',
        'SLO tracking — calculate availability and latency against targets'
      ],
      commonPitfalls: [
        'High-cardinality labels: using user_id or request_id as a label creates millions of time series and crashes Prometheus',
        'Not normalizing URL paths: /users/123 and /users/456 create separate time series. Normalize to /users/:id',
        'Averaging latency: average hides outliers. Use percentiles (p50, p95, p99) from histograms instead',
        'No default metrics: CPU, memory, event loop lag, and GC metrics are free with collectDefaultMetrics(). Always enable them',
        'Alerting on metrics without context: "error rate is 5%" is not actionable. Include which endpoint, which dependency, and link to runbook'
      ],
      interviewTips: [
        'Explain the four metric types: counter (total, always up), gauge (current value, up/down), histogram (distribution, percentiles), summary (pre-computed percentiles)',
        'Apply RED to a service: "I would track requests/sec, errors/sec, and p99 latency for every endpoint"',
        'Apply USE to a resource: "For the database, I track connection pool utilization, queue depth (saturation), and query errors"',
        'Discuss why averages are misleading: average latency of 100ms could mean 99% at 10ms and 1% at 9100ms. p99 catches this'
      ],
      relatedConcepts: ['structured-logging', 'distributed-tracing', 'sli-slo-sla', 'alerting'],
      difficulty: 'intermediate',
      tags: ['metrics', 'prometheus', 'grafana', 'red-method', 'use-method', 'observability'],
      proTip: 'Histogram bucket boundaries determine the accuracy of your percentile calculations. If your SLO is "p99 < 500ms" but your buckets are [0.1, 0.5, 1, 5], you cannot distinguish between 200ms and 499ms. Add buckets at your SLO boundary: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5].'
    },
    {
      id: 'sli-slo-sla',
      title: 'SLI / SLO / SLA',
      description: 'SLIs, SLOs, and SLAs are the framework for defining and measuring service reliability. An SLI (Service Level Indicator) is a measurement (p99 latency, availability). An SLO (Service Level Objective) is a target for that measurement (p99 < 200ms, 99.9% availability). An SLA (Service Level Agreement) is a contract with consequences (if below 99.9%, customer gets credits). The critical insight: 99.9% and 99.99% availability are vastly different — 99.9% allows 8.7 hours of downtime per year, 99.99% allows only 52 minutes.',
      keyPoints: [
        'SLI (Service Level Indicator): the metric itself. Examples: availability (successful requests / total requests), latency (p99 response time), error rate',
        'SLO (Service Level Objective): internal target for the SLI. "99.9% of requests complete successfully" or "p99 latency < 200ms over 30 days"',
        'SLA (Service Level Agreement): external contractual commitment. SLO + consequences (credits, refunds). SLA should be less aggressive than SLO',
        'Error budget: 100% - SLO = error budget. 99.9% SLO means 0.1% error budget = 8.7 hours/year of allowed downtime. Spend it on deployments and experiments',
        '99.9% vs 99.99% availability: 99.9% = 8.7 hours downtime/year. 99.99% = 52 minutes/year. 99.999% = 5.2 minutes/year. Each "9" is 10x harder',
        'Measure over a rolling window (30 days) not a calendar month — avoids the "we had a bad January 1st" problem',
        'Burn rate: how fast are you consuming your error budget? High burn rate = things are degraded, low burn rate = things are stable',
        'Multi-window, multi-burn-rate alerting: alert when burning error budget too fast (immediate attention) AND when approaching exhaustion over a longer window',
        'Not everything needs five 9s: a background job queue at 99% is fine. A payment API needs 99.99%. Set SLOs based on user impact',
        'Start with SLIs -> set SLOs -> only commit to SLAs when you have data showing you can meet them'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'SLO Tracking and Error Budget Calculation',
          code: `// SLO definition
interface SLODefinition {
  readonly name: string;
  readonly sli: 'availability' | 'latency_p99' | 'error_rate';
  readonly target: number; // 0.999 for 99.9%
  readonly windowDays: number;
}

const slos: readonly SLODefinition[] = [
  { name: 'API Availability', sli: 'availability', target: 0.999, windowDays: 30 },
  { name: 'API Latency P99', sli: 'latency_p99', target: 0.200, windowDays: 30 }, // 200ms
  { name: 'Payment Success Rate', sli: 'availability', target: 0.9999, windowDays: 30 },
];

// Calculate error budget
function calculateErrorBudget(slo: SLODefinition, currentSli: number) {
  const errorBudgetTotal = 1 - slo.target; // 0.001 for 99.9%
  const errorBudgetConsumed = Math.max(0, slo.target - currentSli); // how much we've used
  const errorBudgetRemaining = Math.max(0, errorBudgetTotal - errorBudgetConsumed);
  const burnPercentage = (errorBudgetConsumed / errorBudgetTotal) * 100;

  const totalMinutes = slo.windowDays * 24 * 60;
  const allowedDowntimeMinutes = totalMinutes * errorBudgetTotal;
  const remainingDowntimeMinutes = totalMinutes * errorBudgetRemaining;

  return {
    target: \`\${(slo.target * 100).toFixed(2)}%\`,
    current: \`\${(currentSli * 100).toFixed(3)}%\`,
    errorBudgetTotal: \`\${(errorBudgetTotal * 100).toFixed(2)}%\`,
    errorBudgetConsumed: \`\${burnPercentage.toFixed(1)}%\`,
    allowedDowntimeMinutes: Math.round(allowedDowntimeMinutes),
    remainingDowntimeMinutes: Math.round(remainingDowntimeMinutes),
    status: burnPercentage > 80 ? 'critical' : burnPercentage > 50 ? 'warning' : 'healthy',
  };
}

// PromQL for SLO alerting (multi-window, multi-burn-rate)
// Fast burn (last 1 hour): consuming budget 14x faster than allowed
// rate(http_requests_total{status_code=~"5.."}[1h])
//   / rate(http_requests_total[1h]) > (14 * 0.001)
//
// Slow burn (last 6 hours): consuming budget 6x faster than allowed
// rate(http_requests_total{status_code=~"5.."}[6h])
//   / rate(http_requests_total[6h]) > (6 * 0.001)
//
// Alert when BOTH fast burn AND slow burn fire — avoids alerting on brief spikes

// Example: 99.9% availability over 30 days
// Total minutes: 30 * 24 * 60 = 43,200 minutes
// Error budget: 0.1% = 43.2 minutes of downtime
// If 1-hour error rate is 14x budget rate: ~3 minutes of budget consumed in 1 hour
//   -> at this rate, entire budget consumed in ~3 hours -> PAGE NOW`
        }
      ],
      useCases: [
        'Defining reliability targets for services — what level of reliability do users actually need?',
        'Error budget-based deployment decisions — if budget is exhausted, freeze deployments until stability improves',
        'Customer-facing SLA contracts — backed by real SLO data, not guesses',
        'Prioritization: spend engineering time on services that are closest to burning their error budget'
      ],
      commonPitfalls: [
        'Setting SLOs at 100% — this is impossible and means zero error budget for deployments, experiments, or maintenance',
        'Confusing SLO with SLA — SLO is your internal target (ambitious), SLA is your external contract (conservative)',
        'Not measuring SLIs before setting SLOs — set targets based on current performance data, not aspirations',
        'Same SLO for everything — not all services are equally critical. Background jobs need lower SLOs than payment APIs',
        'Alerting on every dip below SLO — use error budget burn rate alerting instead. Brief dips are normal'
      ],
      interviewTips: [
        'Define all three clearly: SLI = what you measure, SLO = what you target, SLA = what you promise (with penalties)',
        'Calculate: 99.9% over 30 days = 43.2 minutes of allowed downtime. Know the math',
        'Explain error budgets: "We have 43 minutes of allowed downtime this month. We have used 20 minutes. We have 23 minutes left for deploys and experiments"',
        'Discuss multi-burn-rate alerting: fast burn (page now, things are on fire) vs slow burn (create ticket, investigate trending degradation)'
      ],
      relatedConcepts: ['metrics', 'alerting', 'health-checks', 'error-tracking'],
      difficulty: 'advanced',
      tags: ['sli', 'slo', 'sla', 'reliability', 'error-budget', 'observability'],
      proTip: 'Google\'s SRE book recommends that when error budget is exhausted, the team should: 1) Freeze feature deployments 2) Focus exclusively on reliability improvements 3) Resume features only when error budget is positive again. This creates a natural incentive for reliability — feature velocity directly depends on service stability.'
    },
    {
      id: 'health-checks',
      title: 'Health Checks',
      description: 'Health checks tell orchestration systems (Kubernetes, load balancers, deployment pipelines) whether your application can serve traffic. Liveness probes detect deadlocked processes, readiness probes detect services that are up but not yet ready (warming cache, connecting to DB), and startup probes handle slow-starting applications. Getting these wrong causes cascading failures — a readiness probe that is too strict can remove all instances from the load balancer.',
      keyPoints: [
        'Liveness probe: "Is the process alive?" If it fails, the orchestrator RESTARTS the container. Check: event loop not blocked, process responsive',
        'Readiness probe: "Can this instance serve traffic?" If it fails, the orchestrator removes it from the load balancer. Check: DB connected, cache warm, dependencies reachable',
        'Startup probe: "Has the app finished initializing?" Disables liveness/readiness checks until startup succeeds. For slow-starting apps (large migrations, cache warming)',
        'Liveness should be SIMPLE: return 200 if the process is running. Do NOT check external dependencies — if the DB is down and liveness fails, Kubernetes restarts all pods, making things worse',
        'Readiness should check dependencies: can I connect to the database? Is Redis reachable? Are required config/secrets loaded?',
        'Deep health check (for ops/debugging): comprehensive check of all dependencies with response times. Expose on a separate endpoint, not the probe endpoint',
        'Health check endpoints should NOT require authentication — load balancers and Kubernetes need to call them without tokens',
        'Timeout: set health check timeouts shorter than probe intervals. A 30-second timeout on a 10-second interval means probes pile up',
        'Graceful shutdown: on SIGTERM, stop accepting new connections, finish in-flight requests, then exit. Readiness probe should fail during shutdown'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Health Check Endpoints for Kubernetes',
          code: `import { Request, Response, Router } from 'express';
import Redis from 'ioredis';

const healthRouter = Router();

let isReady = false;
let isShuttingDown = false;

// Liveness: is the process alive? Keep it SIMPLE
healthRouter.get('/healthz', (req: Request, res: Response) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'shutting_down' });
  }
  res.json({ status: 'alive' });
});

// Readiness: can this instance serve traffic?
healthRouter.get('/readyz', async (req: Request, res: Response) => {
  if (isShuttingDown || !isReady) {
    return res.status(503).json({ status: 'not_ready' });
  }

  try {
    // Check critical dependencies
    const checks = await Promise.allSettled([
      checkDatabase(),
      checkRedis(),
    ]);

    const results = {
      database: checks[0].status === 'fulfilled' ? 'ok' : 'failed',
      redis: checks[1].status === 'fulfilled' ? 'ok' : 'failed',
    };

    const allHealthy = Object.values(results).every(v => v === 'ok');
    res.status(allHealthy ? 200 : 503).json({ status: allHealthy ? 'ready' : 'degraded', checks: results });
  } catch {
    res.status(503).json({ status: 'error' });
  }
});

// Deep health check (for ops debugging, NOT for probes)
healthRouter.get('/health/detailed', async (req: Request, res: Response) => {
  const start = Date.now();
  const checks: Record<string, { status: string; latencyMs: number }> = {};

  // Database
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw\`SELECT 1\`;
    checks.database = { status: 'ok', latencyMs: Date.now() - dbStart };
  } catch {
    checks.database = { status: 'failed', latencyMs: Date.now() - dbStart };
  }

  // Redis
  const redisStart = Date.now();
  try {
    await redis.ping();
    checks.redis = { status: 'ok', latencyMs: Date.now() - redisStart };
  } catch {
    checks.redis = { status: 'failed', latencyMs: Date.now() - redisStart };
  }

  res.json({
    status: Object.values(checks).every(c => c.status === 'ok') ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    checks,
    totalLatencyMs: Date.now() - start,
  });
});

async function checkDatabase(): Promise<void> {
  await prisma.$queryRaw\`SELECT 1\`;
}

async function checkRedis(): Promise<void> {
  const result = await redis.ping();
  if (result !== 'PONG') throw new Error('Redis ping failed');
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(\`Received \${signal}, starting graceful shutdown\`);
  isShuttingDown = true; // Readiness probe will fail -> LB removes this instance

  // Wait for in-flight requests to complete (up to 30 seconds)
  await new Promise(resolve => setTimeout(resolve, 30_000));

  // Close connections
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Mark as ready after initialization
async function initialize() {
  await warmCacheOnStartup();
  await runMigrations();
  isReady = true;
  console.log('Application ready');
}

app.use(healthRouter);`
        }
      ],
      useCases: [
        'Kubernetes deployments — liveness, readiness, and startup probes are fundamental to container orchestration',
        'Load balancer health checks — remove unhealthy instances from rotation',
        'Deployment pipelines — verify new version is healthy before routing traffic',
        'Monitoring dashboards — track dependency health over time'
      ],
      commonPitfalls: [
        'Checking external dependencies in liveness probe — if DB is down, Kubernetes restarts ALL pods, creating a cascade failure',
        'Health check timeout longer than interval — probes pile up and the instance appears more unhealthy than it is',
        'No startup probe for slow-starting apps — liveness probe kills the pod before it finishes initializing',
        'Health check requires authentication — load balancers and Kubernetes cannot provide tokens',
        'Not implementing graceful shutdown — in-flight requests are dropped when the pod is killed'
      ],
      interviewTips: [
        'Distinguish the three probes: liveness (restart if dead), readiness (remove from LB if not ready), startup (delay other probes until ready)',
        'Explain why liveness should NOT check dependencies: "If the database is down and liveness restarts all pods, now nothing is running AND the DB is still down"',
        'Discuss graceful shutdown: SIGTERM -> stop accepting new connections -> finish in-flight -> close connections -> exit',
        'Mention that deep health checks (with dependency latencies) are for debugging, not for probes — probes must be fast and stable'
      ],
      relatedConcepts: ['metrics', 'sli-slo-sla', 'alerting'],
      difficulty: 'intermediate',
      tags: ['health-check', 'kubernetes', 'liveness', 'readiness', 'graceful-shutdown'],
      proTip: 'Kubernetes sends SIGTERM, waits terminationGracePeriodSeconds (default 30s), then sends SIGKILL. Your graceful shutdown must complete within that window. Set a preStop hook with a small sleep (5s) to allow the Service to remove the pod from endpoints before your app stops accepting connections — this prevents traffic arriving after you have stopped listening.'
    },
    {
      id: 'error-tracking',
      title: 'Error Tracking',
      description: 'Error tracking tools (Sentry, Bugsnag, Rollbar) go beyond logging by grouping similar errors, tracking error frequency over time, associating errors with releases, and providing rich context (stack traces, breadcrumbs, user info). The key feature is intelligent grouping: 1000 identical TypeErrors from different users become one issue with 1000 occurrences, not 1000 separate alerts.',
      keyPoints: [
        'Error grouping: similar stack traces are grouped into a single "issue." Reduces noise from "same error, different user" scenarios',
        'Release tracking: associate errors with deployment versions. See if a new release introduced errors or fixed them',
        'Source maps: upload source maps so stack traces show original TypeScript/JSX code, not minified JavaScript',
        'Breadcrumbs: automatic log of events leading to the error (user clicks, HTTP requests, console logs). Provides reproduction context',
        'User context: associate errors with user IDs to understand impact ("this error affects 500 users" vs "1 user hit it 500 times")',
        'Alert fatigue management: set alert rules based on frequency, impact, and novelty. New errors get immediate alerts, known errors get periodic digests',
        'Performance monitoring: Sentry also tracks transaction performance (response times), not just errors. Overlaps with APM',
        'Environment separation: different DSNs or environments for dev/staging/production. Do not pollute production error tracking with dev noise',
        'Filter out expected errors: 404s, auth failures, rate limit responses are not bugs. Configure ignore rules',
        'Error budget connection: error tracking frequency feeds into SLO calculations. High error rate = burning error budget'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Sentry Integration for Express',
          code: `import * as Sentry from '@sentry/node';
import express from 'express';

const app = express();

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION || 'unknown',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod

  // Filter out noise
  ignoreErrors: [
    'Request aborted', // Client closed connection
    'ECONNRESET',      // Connection reset
  ],

  beforeSend(event) {
    // Scrub sensitive data
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    return event;
  },
});

// Sentry request handler (must be first middleware)
app.use(Sentry.Handlers.requestHandler());

// Your routes...
app.get('/api/users/:id', async (req, res) => {
  // Set user context for error tracking
  Sentry.setUser({ id: req.user?.id, email: req.user?.email });

  // Add breadcrumb for debugging context
  Sentry.addBreadcrumb({
    category: 'api',
    message: \`Fetching user \${req.params.id}\`,
    level: 'info',
  });

  const user = await userService.findById(req.params.id);
  res.json({ data: user });
});

// Sentry error handler (must be after routes, before custom error handler)
app.use(Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Only report 5xx errors to Sentry (not 4xx client errors)
    const status = (error as any).status || (error as any).statusCode || 500;
    return status >= 500;
  },
}));

// Custom error handler (after Sentry)
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = (err as any).status || 500;
  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : err.message,
    correlationId: req.headers['x-trace-id'],
  });
});

// Manual error capture for caught exceptions
async function processPayment(orderId: string) {
  try {
    await paymentGateway.charge(orderId);
  } catch (err) {
    // Capture but do not crash — handle gracefully
    Sentry.captureException(err, {
      tags: { component: 'payment', orderId },
      extra: { gateway: 'stripe' },
    });
    // Fallback logic...
  }
}`
        }
      ],
      useCases: [
        'Every production application — error tracking is baseline operational awareness',
        'Release management — detect regressions immediately after deployment',
        'Customer support — look up errors by user ID to understand what the customer experienced',
        'SLO monitoring — error frequency feeds into availability SLI calculations'
      ],
      commonPitfalls: [
        'Tracking ALL errors including 4xx — client errors (bad request, not found) are not bugs. Filter them out',
        'Not uploading source maps — stack traces show minified code that is impossible to debug',
        'No environment separation — dev errors mixed with production errors, impossible to filter',
        'Alert on every error — alert fatigue means important errors get ignored. Alert on new errors and error rate spikes',
        'Not scrubbing sensitive data — passwords, tokens, and PII in error reports are a security risk'
      ],
      interviewTips: [
        'Explain the difference between error tracking and logging: error tracking groups, deduplicates, and contextualizes. Logs are raw event streams',
        'Discuss release tracking: "When I deploy v1.2.3, Sentry shows me errors introduced in that release vs pre-existing errors"',
        'Mention source maps and why they matter: minified stack traces are useless for debugging',
        'Talk about alert fatigue: the goal is to be notified of NEW errors and error rate changes, not every individual occurrence'
      ],
      relatedConcepts: ['structured-logging', 'sli-slo-sla', 'alerting', 'distributed-tracing'],
      difficulty: 'intermediate',
      tags: ['error-tracking', 'sentry', 'monitoring', 'debugging', 'observability'],
      proTip: 'Sentry\'s "Discover" feature lets you query error data like a database: "show me all errors grouped by user, where browser=Safari and release=1.2.3, sorted by frequency." This is incredibly powerful for understanding error patterns that simple grouping misses.'
    },
    {
      id: 'performance-profiling',
      title: 'Performance Profiling',
      description: 'Profiling identifies WHERE your application spends time (CPU profiling) and memory (heap profiling). Flame graphs visualize CPU profiles: wide bars are hot functions, tall stacks show deep call chains. For Node.js, clinic.js provides doctor (event loop), flame (CPU), and bubbleprof (async) analysis. Production profiling is possible with low-overhead tools, but always measure the overhead before enabling.',
      keyPoints: [
        'CPU profiling: samples the call stack at regular intervals (e.g., 1000Hz). Identifies which functions consume the most CPU time',
        'Flame graph: visualization of CPU profile. X-axis = time spent (width), Y-axis = call stack depth. Wide bars = hot functions to optimize',
        'Heap profiling (heap snapshot): shows memory allocation by object type and location. Identifies memory leaks and excessive allocation',
        'Async profiling: tracks time spent waiting for I/O (database, HTTP, file system). In Node.js, most "slow" is actually async waiting, not CPU',
        'clinic.js for Node.js: clinic doctor (detect event loop blocking), clinic flame (CPU flame graph), clinic bubbleprof (async operations)',
        'Production profiling: use low-overhead continuous profiling (1% sampling). Tools: Pyroscope, Parca, Datadog Continuous Profiler',
        'Event loop lag: Node.js is single-threaded. If a synchronous operation takes 100ms, ALL requests are delayed by 100ms. Monitor with monitorEventLoopDelay',
        'Memory leak detection: take heap snapshots at intervals, compare object counts. Growing objects = potential leak. Common: event listeners, closures, global caches',
        'V8 --inspect flag: connect Chrome DevTools to a running Node.js process for real-time CPU and memory profiling',
        'Profile in production-like conditions: profiling in development with 10 records misses the N+1 that only appears with 10,000 records'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Performance Monitoring and Profiling Setup',
          code: `import { monitorEventLoopDelay } from 'perf_hooks';
import v8 from 'v8';

// Monitor event loop lag
const eventLoopMonitor = monitorEventLoopDelay({ resolution: 20 });
eventLoopMonitor.enable();

// Expose event loop stats for metrics
function getEventLoopStats() {
  return {
    min: eventLoopMonitor.min / 1e6,       // Convert ns to ms
    max: eventLoopMonitor.max / 1e6,
    mean: eventLoopMonitor.mean / 1e6,
    p99: eventLoopMonitor.percentile(99) / 1e6,
    stddev: eventLoopMonitor.stddev / 1e6,
  };
}

// Prometheus metric for event loop lag
import { Gauge } from 'prom-client';

const eventLoopLag = new Gauge({
  name: 'nodejs_event_loop_lag_p99_ms',
  help: 'Event loop lag p99 in milliseconds',
});

setInterval(() => {
  const stats = getEventLoopStats();
  eventLoopLag.set(stats.p99);
  if (stats.p99 > 100) {
    console.warn('Event loop lag p99 > 100ms', stats);
  }
  eventLoopMonitor.reset();
}, 10_000);

// Heap usage monitoring
const heapUsed = new Gauge({
  name: 'nodejs_heap_used_bytes',
  help: 'V8 heap used in bytes',
});

setInterval(() => {
  const mem = process.memoryUsage();
  heapUsed.set(mem.heapUsed);

  // Alert if heap usage is abnormally high
  const heapStats = v8.getHeapStatistics();
  const usagePercent = (heapStats.used_heap_size / heapStats.heap_size_limit) * 100;
  if (usagePercent > 85) {
    console.error(\`Heap usage at \${usagePercent.toFixed(1)}% — potential memory leak\`);
  }
}, 30_000);

// On-demand heap snapshot (for debugging, NOT in normal production flow)
// Trigger via admin endpoint or signal handler
async function captureHeapSnapshot(): Promise<string> {
  const filename = \`/tmp/heap-\${Date.now()}.heapsnapshot\`;
  v8.writeHeapSnapshot(filename);
  return filename;
}

// Admin endpoint for on-demand profiling
// IMPORTANT: protect with authentication + rate limiting
app.post('/admin/debug/heap-snapshot', requireAdmin, async (req, res) => {
  const filename = await captureHeapSnapshot();
  res.json({ filename, message: 'Download with: kubectl cp pod:/tmp/... ./snapshot.heapsnapshot' });
});

// Command line profiling:
// CPU profile: node --prof app.js (generates v8.log, process with --prof-process)
// Chrome DevTools: node --inspect app.js, open chrome://inspect
// clinic.js: npx clinic doctor -- node app.js
// clinic flame: npx clinic flame -- node app.js`
        }
      ],
      useCases: [
        'Debugging slow API endpoints — is it CPU-bound computation or async I/O waiting?',
        'Memory leak investigation — heap grows over hours/days until OOM kill',
        'Event loop blocking — synchronous operations causing high latency for all requests',
        'Capacity planning — understand CPU and memory requirements before scaling decisions'
      ],
      commonPitfalls: [
        'Profiling only in development — production data volumes reveal different bottlenecks',
        'Assuming slow = CPU bound — in Node.js, slow is usually async I/O (DB queries, HTTP calls). Use async profiling',
        'Leaving profiling enabled in production at full sampling — adds overhead. Use low-frequency sampling (1%)',
        'Not monitoring event loop lag — the single most important Node.js-specific metric, missed by generic APM tools',
        'Taking heap snapshots on production without understanding the cost — it freezes the process for seconds on large heaps'
      ],
      interviewTips: [
        'Explain flame graphs: width = time spent, depth = call stack. "I look for wide bars to find hot functions"',
        'Discuss Node.js specifics: single-threaded, event loop, blocking operations affect ALL requests. Monitor event loop lag',
        'Compare CPU profiling (where is compute time spent?) vs async profiling (where is the app waiting?)',
        'Mention production profiling tools: Pyroscope/Parca for continuous, low-overhead profiling in production'
      ],
      relatedConcepts: ['metrics', 'structured-logging', 'distributed-tracing'],
      difficulty: 'advanced',
      tags: ['profiling', 'flame-graph', 'heap', 'event-loop', 'performance', 'clinic'],
      proTip: 'clinic.js flame generates a flame graph from a Node.js process with a single command: npx clinic flame -- node server.js. Run it under realistic load (using autocannon or k6) to get a production-representative profile. It is the fastest way to find CPU bottlenecks in a Node.js application.'
    },
    {
      id: 'alerting',
      title: 'Alerting',
      description: 'Alerting is the bridge between observability data and human action. Good alerting pages you for symptoms ("error rate is 10x normal") not causes ("disk usage is 80%"). Bad alerting creates alert fatigue — too many alerts, too often, for things that do not matter — until the team ignores alerts entirely and misses the real incident. Multi-window, multi-burn-rate SLO alerting is the gold standard.',
      keyPoints: [
        'Alert on symptoms, not causes: "5xx error rate > 1%" (symptom) is actionable. "CPU > 80%" (cause) might not affect users at all',
        'Severity levels: P1/Critical (page someone NOW, user-facing impact), P2/High (fix within hours, degraded service), P3/Medium (fix this week, no impact yet)',
        'Every alert must have a runbook link: what to check, how to mitigate, who to escalate to. Without a runbook, an alert at 3 AM is just noise',
        'Multi-window, multi-burn-rate alerting: alert when error budget is burning fast over multiple time windows. Catches both sharp spikes and slow degradation',
        'Alert fatigue: if a team gets >5 non-actionable alerts per week, they start ignoring all alerts. Ruthlessly prune false positives',
        'Routing: PagerDuty, Opsgenie, or Grafana OnCall for rotation management. Route by service ownership — the database team gets DB alerts',
        'Deduplication: if an alert fires and is not resolved, do not send it again every minute. Send once, then send a reminder after N minutes of no resolution',
        'Alert on rate of change, not absolute values: "error rate increased 5x in 10 minutes" is more meaningful than "error rate is 2%"',
        'Test your alerts: intentionally inject failures (chaos engineering) to verify that alerts fire, routes correctly, and runbooks are useful',
        'Alert review cadence: monthly review of all alerts. Delete alerts that never fired (over-cautious) or always fired (too sensitive)'
      ],
      codeExamples: [
        {
          language: 'yaml',
          label: 'Prometheus Alerting Rules with SLO Burn Rate',
          code: `# prometheus-alerts.yml
# Multi-window, multi-burn-rate SLO alerting
# Based on Google SRE workbook recommendations

# groups:
#   - name: slo-alerts
#     rules:
#       # Fast burn: 14x error budget consumption rate over 1 hour
#       # If this continues, entire 30-day budget consumed in ~2 hours
#       - alert: HighErrorBudgetBurnFast
#         expr: |
#           (
#             rate(http_requests_total{status_code=~"5.."}[1h])
#             / rate(http_requests_total[1h])
#           ) > (14 * 0.001)
#           and
#           (
#             rate(http_requests_total{status_code=~"5.."}[5m])
#             / rate(http_requests_total[5m])
#           ) > (14 * 0.001)
#         for: 2m
#         labels:
#           severity: critical
#         annotations:
#           summary: "High error rate burning SLO budget fast"
#           description: "Error rate {{ $value | humanizePercentage }} over 1h (14x budget rate)"
#           runbook_url: "https://wiki.internal/runbooks/high-error-rate"
#           dashboard_url: "https://grafana.internal/d/api-overview"
#
#       # Slow burn: 6x error budget consumption rate over 6 hours
#       # Catches gradual degradation that fast burn misses
#       - alert: HighErrorBudgetBurnSlow
#         expr: |
#           (
#             rate(http_requests_total{status_code=~"5.."}[6h])
#             / rate(http_requests_total[6h])
#           ) > (6 * 0.001)
#           and
#           (
#             rate(http_requests_total{status_code=~"5.."}[30m])
#             / rate(http_requests_total[30m])
#           ) > (6 * 0.001)
#         for: 15m
#         labels:
#           severity: warning
#         annotations:
#           summary: "Sustained elevated error rate"
#           description: "Error rate elevated for 6h at 6x budget rate"
#           runbook_url: "https://wiki.internal/runbooks/sustained-errors"
#
#       # Latency: p99 > SLO target
#       - alert: HighLatency
#         expr: |
#           histogram_quantile(0.99,
#             rate(http_request_duration_seconds_bucket[5m])
#           ) > 0.5
#         for: 5m
#         labels:
#           severity: warning
#         annotations:
#           summary: "p99 latency exceeds 500ms SLO"
#           description: "p99 latency is {{ $value | humanizeDuration }}"
#           runbook_url: "https://wiki.internal/runbooks/high-latency"`
        }
      ],
      useCases: [
        'On-call rotation — route alerts to the right person at the right time',
        'SLO enforcement — alert when error budget is being consumed too fast',
        'Incident detection — catch problems before customers report them',
        'Deployment monitoring — alert if a new release increases error rates'
      ],
      commonPitfalls: [
        'Alerting on causes (CPU, disk) instead of symptoms (error rate, latency) — CPU at 90% might be fine if latency is good',
        'No runbook — at 3 AM, an alert without a runbook is useless. The oncall person does not know what to check',
        'Alert on every metric breach — creates alert fatigue. Only alert on things that require human action',
        'Not testing alerts — you discover your alerts do not fire during a real incident. Test with intentional failures',
        'Same severity for everything — if everything is P1/critical, nothing is. Reserve P1 for user-facing impact requiring immediate response'
      ],
      interviewTips: [
        'State the principle: "Alert on symptoms, not causes. Alert on SLO burn rate, not individual metric thresholds"',
        'Explain multi-window burn rate: fast window (1h, 14x) catches sharp spikes, slow window (6h, 6x) catches gradual degradation. Both must fire to alert',
        'Discuss alert fatigue: what it is (too many non-actionable alerts), why it is dangerous (team ignores all alerts), how to fix (prune, adjust thresholds, runbooks)',
        'Mention the oncall experience: routing, escalation, runbooks, post-incident review. Good alerting is part of a larger incident management process'
      ],
      relatedConcepts: ['metrics', 'sli-slo-sla', 'error-tracking', 'structured-logging'],
      difficulty: 'advanced',
      tags: ['alerting', 'pagerduty', 'prometheus', 'slo', 'oncall', 'observability'],
      proTip: 'Rob Ewaschuk\'s "My Philosophy on Alerting" (Google SRE) boils down to: alert on imminent real problems, not hypothetical future problems. If an alert fires and the oncall person says "I cannot do anything about this right now," the alert should not exist. Every alert should be immediately actionable or be deleted.'
    },
  ],
}
