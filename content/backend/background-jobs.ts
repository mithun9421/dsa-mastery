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

export const backgroundJobsCategory: Category = {
  id: 'background-jobs',
  title: 'Background Jobs',
  description: 'Job queue fundamentals, BullMQ patterns, retry strategies, distributed cron, long-running jobs, prioritization, and the transactional outbox pattern. Moving work out of the request-response cycle is the key to responsive, resilient applications.',
  icon: '⏳',
  concepts: [
    {
      id: 'job-queue-fundamentals',
      title: 'Job Queue Fundamentals',
      description: 'A job queue decouples work from the request-response cycle: the API enqueues a job and returns immediately, a worker picks it up and processes it asynchronously. This pattern is essential for any work that is too slow for a synchronous response (sending emails, processing images, generating reports) or that must survive server restarts (payment processing). The two guarantees that matter: at-least-once delivery (the job will be processed, possibly more than once) and persistence (enqueued jobs survive crashes).',
      keyPoints: [
        'At-least-once delivery: the queue guarantees the job will be delivered to a worker at least once. If the worker crashes mid-processing, the job is re-delivered. This means jobs MUST be idempotent',
        'At-most-once delivery: the job is delivered once. If the worker crashes, it is lost. Only acceptable for non-critical work (analytics events, notifications that can be missed)',
        'Exactly-once is effectively impossible in distributed systems — at-least-once + idempotent jobs is the practical equivalent',
        'Job persistence: jobs are stored in a durable backing store (Redis with AOF, PostgreSQL, RabbitMQ). If the queue system crashes, jobs are not lost',
        'Worker concurrency: a single worker can process multiple jobs concurrently (configurable). More concurrency = higher throughput but more resource usage',
        'Acknowledgment: worker must acknowledge job completion (ack). If no ack within a timeout, the job is re-queued (assumed worker crash)',
        'Dead letter queue (DLQ): jobs that fail repeatedly (exceeded max retries) are moved to a separate queue for investigation. Never silently drop failed jobs',
        'FIFO ordering: most queues provide FIFO within a priority level. But concurrent workers mean jobs may complete out of order',
        'Backpressure: when jobs are produced faster than consumed, the queue grows. Monitor queue depth and scale workers or reject new jobs'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Basic Job Queue with BullMQ',
          code: `import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });

// Producer: enqueue jobs from API handlers
const emailQueue = new Queue('email', { connection });

// API handler — enqueue and return immediately
router.post('/orders', async (req: Request, res: Response) => {
  const order = await orderService.create(req.body);

  // Enqueue email job (processed async by worker)
  await emailQueue.add('order-confirmation', {
    orderId: order.id,
    email: order.customerEmail,
    template: 'order-confirmation',
  }, {
    attempts: 3,        // retry up to 3 times
    backoff: {
      type: 'exponential',
      delay: 1000,       // 1s, 2s, 4s
    },
    removeOnComplete: 1000, // keep last 1000 completed jobs
    removeOnFail: 5000,     // keep last 5000 failed jobs
  });

  res.status(201).json({ data: order });
});

// Consumer: process jobs
const emailWorker = new Worker('email', async (job: Job) => {
  const { orderId, email, template } = job.data;

  // Idempotency check: has this email already been sent?
  const alreadySent = await db.emailLog.findFirst({
    where: { orderId, template },
  });
  if (alreadySent) {
    console.log(\`Email already sent for order \${orderId}, skipping\`);
    return; // idempotent — safe to skip
  }

  // Send email
  await emailService.send({ to: email, template, data: { orderId } });

  // Record that we sent it (for idempotency)
  await db.emailLog.create({ data: { orderId, template, sentAt: new Date() } });
}, {
  connection,
  concurrency: 5, // process 5 emails concurrently
});

emailWorker.on('completed', (job) => {
  console.log(\`Job \${job.id} completed\`);
});

emailWorker.on('failed', (job, err) => {
  console.error(\`Job \${job?.id} failed: \${err.message}\`);
  if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
    // Max retries exceeded — alert or move to DLQ
    Sentry.captureException(err, { tags: { queue: 'email', jobId: job.id } });
  }
});`
        }
      ],
      useCases: [
        'Email/notification sending — decoupled from the API response, retryable',
        'Image/video processing — resize, transcode, generate thumbnails',
        'Report generation — query millions of rows, compile PDF/CSV',
        'Payment processing — charge credit card, handle failures and retries',
        'Data sync — push changes to external systems (CRM, analytics, search index)'
      ],
      commonPitfalls: [
        'Non-idempotent jobs: sending an email twice because the worker crashed after sending but before acknowledging',
        'No dead letter queue: failed jobs disappear silently instead of being investigated',
        'Unbounded queue growth: producers enqueue faster than consumers process. Monitor queue depth and alert',
        'No ack timeout: worker hangs processing a job indefinitely, blocking the queue slot',
        'Storing large payloads in job data: pass IDs and lookup from DB, not full objects (Redis memory limits)'
      ],
      interviewTips: [
        'Explain at-least-once delivery: "The job is guaranteed to be processed, but if the worker crashes mid-processing, it will be re-delivered. This is why jobs must be idempotent"',
        'Draw the flow: API -> enqueue -> queue (persistent) -> worker picks up -> process -> ack. On failure: retry with backoff -> DLQ after max retries',
        'Discuss the trade-off: synchronous = simple, guaranteed response. Async = responsive API, complex error handling, eventual completion',
        'Compare queue backends: Redis-backed (BullMQ, fast), RabbitMQ (AMQP, sophisticated routing), SQS (managed, unlimited scale), PostgreSQL (SKIP LOCKED, no extra infra)'
      ],
      relatedConcepts: ['bullmq-patterns', 'retry-strategies', 'transactional-job-enqueue'],
      difficulty: 'intermediate',
      tags: ['queue', 'async', 'worker', 'at-least-once', 'idempotent'],
      proTip: 'BullMQ jobs are stored in Redis, which defaults to in-memory only. For durability, enable Redis AOF (appendfsync always or everysec) persistence. Without it, a Redis crash loses ALL queued jobs. This is the #1 misconfiguration in production BullMQ deployments.',
      ascii: `Job Queue Flow:
  API Request ─── enqueue ──► Queue (Redis/Postgres/RabbitMQ)
       │                            │
   responds 202               worker picks up
       │                            │
  Client done              process (idempotent)
                                    │
                          ┌─── success ──► ack ──► done
                          │
                          └─── failure ──► retry (backoff)
                                              │
                                  ┌─── under max retries ──► re-enqueue
                                  │
                                  └─── max retries ──► Dead Letter Queue`
    },
    {
      id: 'bullmq-patterns',
      title: 'BullMQ Patterns',
      description: 'BullMQ is the most popular Node.js job queue, built on Redis. Beyond basic enqueue/process, it offers priority queues, delayed jobs (schedule for the future), repeatable jobs (cron), job dependencies (flows), rate limiting, and sandboxed workers. These patterns handle the real-world complexity of production job processing that basic queue semantics do not address.',
      keyPoints: [
        'Priority queues: jobs with higher priority are processed first. Priority is a number (lower = higher priority). Use sparingly — too many priority levels create starvation',
        'Delayed jobs: enqueue a job that is not processed until a specified time. Use for "send reminder in 24 hours" or "retry after 1 hour"',
        'Repeatable jobs: cron-like scheduling. { every: 60000 } for every minute, { pattern: "0 9 * * *" } for daily at 9 AM. BullMQ ensures only one instance of a repeatable job exists',
        'Flows (job dependencies): define parent-child relationships. Children must complete before the parent is processed. Use for multi-step pipelines',
        'Rate limiting: limit how many jobs are processed per time window. { limiter: { max: 10, duration: 1000 } } = max 10 jobs/second. Respects external API rate limits',
        'Sandboxed workers: run job processing in a separate process. Prevents a job from crashing the entire worker (OOM, infinite loop)',
        'Events: BullMQ emits events for job lifecycle (waiting, active, completed, failed, stalled). Use for monitoring and progress tracking',
        'Stalled jobs: if a worker does not send a heartbeat within a timeout (stallInterval), the job is considered stalled and re-queued',
        'Job data should be small — store IDs and references, not full objects. Large job data consumes Redis memory'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Advanced BullMQ Patterns',
          code: `import { Queue, Worker, FlowProducer, QueueEvents } from 'bullmq';

const connection = { host: 'localhost', port: 6379 };

// Priority queue: critical orders processed first
const orderQueue = new Queue('orders', { connection });

await orderQueue.add('process-order', { orderId: '123' }, {
  priority: 1, // highest priority
});
await orderQueue.add('process-order', { orderId: '456' }, {
  priority: 10, // lower priority — processed after priority 1 jobs
});

// Delayed job: send follow-up email in 24 hours
const emailQueue = new Queue('email', { connection });

await emailQueue.add('follow-up', { userId: '123' }, {
  delay: 24 * 60 * 60 * 1000, // 24 hours in ms
});

// Repeatable job: daily report at 9 AM UTC
await emailQueue.add('daily-digest', {}, {
  repeat: { pattern: '0 9 * * *', tz: 'UTC' },
  jobId: 'daily-digest', // prevents duplicate repeatable jobs
});

// Flow: multi-step order processing pipeline
const flowProducer = new FlowProducer({ connection });

await flowProducer.add({
  name: 'complete-order',
  queueName: 'orders',
  data: { orderId: '789' },
  children: [
    {
      name: 'validate-inventory',
      queueName: 'inventory',
      data: { orderId: '789' },
    },
    {
      name: 'charge-payment',
      queueName: 'payments',
      data: { orderId: '789' },
    },
    {
      name: 'send-confirmation',
      queueName: 'email',
      data: { orderId: '789' },
    },
  ],
});
// Parent job runs AFTER all children complete

// Rate-limited worker: respect external API limits
const apiWorker = new Worker('external-api', async (job) => {
  await callExternalApi(job.data);
}, {
  connection,
  concurrency: 1, // one at a time
  limiter: {
    max: 10,
    duration: 1000, // max 10 jobs per second
  },
});

// Progress tracking
const reportWorker = new Worker('reports', async (job) => {
  const items = await db.items.findMany({ where: job.data.filters });
  for (let i = 0; i < items.length; i++) {
    await processItem(items[i]);
    await job.updateProgress(Math.round(((i + 1) / items.length) * 100));
  }
}, { connection });

// Monitor progress from API
const queueEvents = new QueueEvents('reports', { connection });
queueEvents.on('progress', ({ jobId, data }) => {
  console.log(\`Job \${jobId}: \${data}% complete\`);
  // Push to WebSocket for real-time UI updates
});`
        }
      ],
      useCases: [
        'Priority processing: VIP customer orders processed before regular orders',
        'Scheduled tasks: daily reports, weekly cleanup, monthly billing',
        'Multi-step pipelines: order processing (validate -> pay -> ship -> notify)',
        'Rate-limited API calls: bulk SMS sending at 10/sec to respect provider limits',
        'Long-running tasks with progress: report generation, data migration, bulk import'
      ],
      commonPitfalls: [
        'Creating duplicate repeatable jobs: always set a fixed jobId for repeatable jobs, or BullMQ creates a new one every time the code runs',
        'Too many priority levels causing starvation: low-priority jobs never process if high-priority jobs keep arriving. Use at most 3-5 levels',
        'Large job data in Redis: store a reference (orderId), not the full order object. Redis memory is expensive and limited',
        'Not handling stalled jobs: if workers crash without ack, jobs stall. Configure stalledInterval and maxStalledCount',
        'Flow children all in the same queue: if one child queue is backed up, the parent cannot complete. Put independent children in separate queues'
      ],
      interviewTips: [
        'Know BullMQ vs alternatives: BullMQ (Redis, Node.js, full-featured), Celery (Python, Redis/RabbitMQ), Sidekiq (Ruby, Redis)',
        'Explain flows: "Parent job depends on children completing first. If any child fails, the parent is not processed. This models pipelines"',
        'Discuss rate limiting: "Our external API allows 10 req/sec. BullMQ rate limiter ensures workers respect this even with 100 concurrent jobs"',
        'Mention that BullMQ also supports job events and progress — useful for real-time UI updates via WebSocket'
      ],
      relatedConcepts: ['job-queue-fundamentals', 'retry-strategies', 'distributed-cron', 'long-running-jobs'],
      difficulty: 'intermediate',
      tags: ['bullmq', 'redis', 'priority-queue', 'cron', 'flow', 'rate-limiting'],
      proTip: 'BullMQ\'s FlowProducer creates a DAG (directed acyclic graph) of jobs. The parent job does not start until ALL children complete. Use this for checkout flows: validate inventory, reserve stock, charge payment, then "complete order" as the parent. If payment fails, the parent never runs, and you can handle the failure in the child\'s retry/failure handler.'
    },
    {
      id: 'retry-strategies',
      title: 'Retry Strategies',
      description: 'When a job fails, how you retry determines whether you recover gracefully or create a cascading failure. Exponential backoff with jitter is the gold standard: wait longer between each retry (backoff), and add randomness (jitter) so retried jobs do not all hit the failing service at the same time (thundering herd). The dead letter queue catches jobs that exhaust all retries for manual investigation.',
      keyPoints: [
        'Exponential backoff: delay doubles each retry (1s, 2s, 4s, 8s, 16s). Gives the failing dependency time to recover',
        'Jitter: add random noise to the delay. Without jitter, 1000 failed jobs all retry at exactly the same time, re-creating the overload',
        'Full jitter formula: delay = random(0, baseDelay * 2^attempt). Spreads retries evenly across the delay window',
        'Max retries: always cap retries (3-5 for fast jobs, 10+ for important jobs). Without a cap, jobs retry forever consuming resources',
        'Dead letter queue (DLQ): after max retries exhausted, move the job to a separate queue for human investigation. Never silently drop',
        'Retry-ability check: before retrying, check if the error is retryable. 400 Bad Request = do not retry (the input is wrong). 503 Service Unavailable = retry',
        'Idempotency requirement: retries mean the job runs multiple times. It MUST produce the same result on repeated execution',
        'Circuit breaker: if many jobs fail in a row, stop retrying and fail fast. Prevents hammering a dead service',
        'Retry budget: limit total retries across all jobs per time window. Prevents a flood of retries from overwhelming the recovery',
        'Backoff cap: set a maximum delay (e.g., 5 minutes). Without a cap, exponential backoff on attempt 20 waits 12 days'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Retry Strategies with BullMQ',
          code: `import { Queue, Worker, Job } from 'bullmq';

const connection = { host: 'localhost', port: 6379 };

// Exponential backoff with jitter (BullMQ built-in)
const paymentQueue = new Queue('payments', { connection });

await paymentQueue.add('charge', { orderId: '123', amount: 99.99 }, {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000, // base: 2s, then 4s, 8s, 16s, 32s (with jitter)
  },
});

// Custom backoff with retry-ability check
const worker = new Worker('payments', async (job: Job) => {
  try {
    const result = await paymentGateway.charge(job.data);
    return result;
  } catch (err) {
    // Check if error is retryable
    if (isNonRetryable(err)) {
      // Move to DLQ immediately — do not waste retries
      throw new UnrecoverableError(\`Non-retryable: \${(err as Error).message}\`);
    }
    throw err; // BullMQ will retry with backoff
  }
}, {
  connection,
  concurrency: 3,
});

function isNonRetryable(err: unknown): boolean {
  if (err instanceof PaymentError) {
    // 4xx client errors: bad card, insufficient funds, invalid amount
    return err.statusCode >= 400 && err.statusCode < 500;
  }
  return false;
}

// Custom exponential backoff with full jitter
function calculateDelay(attempt: number, baseDelay: number = 1000, maxDelay: number = 300_000): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  // Full jitter: random value between 0 and cappedDelay
  return Math.floor(Math.random() * cappedDelay);
}

// Circuit breaker for job processing
class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private readonly threshold: number;
  private readonly resetTimeout: number;

  constructor(threshold: number = 5, resetTimeoutMs: number = 60_000) {
    this.threshold = threshold;
    this.resetTimeout = resetTimeoutMs;
  }

  isOpen(): boolean {
    if (this.failures >= this.threshold) {
      // Check if reset timeout has passed
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.failures = 0; // reset — allow one attempt (half-open)
        return false;
      }
      return true; // circuit is open — fail fast
    }
    return false;
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
  }

  recordSuccess(): void {
    this.failures = 0;
  }
}

const circuitBreaker = new CircuitBreaker(5, 60_000);

const resilientWorker = new Worker('external-api', async (job: Job) => {
  if (circuitBreaker.isOpen()) {
    throw new Error('Circuit breaker open — failing fast');
  }

  try {
    const result = await callExternalApi(job.data);
    circuitBreaker.recordSuccess();
    return result;
  } catch (err) {
    circuitBreaker.recordFailure();
    throw err;
  }
}, { connection });`
        }
      ],
      useCases: [
        'Payment processing — retry transient failures (network timeout, 503) but not permanent failures (invalid card)',
        'External API integration — APIs go down temporarily, exponential backoff prevents hammering',
        'Email delivery — SMTP servers may be temporarily overloaded',
        'Webhook delivery — recipient servers may be temporarily unavailable'
      ],
      commonPitfalls: [
        'No jitter — 1000 jobs all retry at exactly the same second, re-creating the thundering herd that caused the failure',
        'Retrying non-retryable errors — a 400 Bad Request will never succeed no matter how many times you retry',
        'No max retry cap — jobs retry forever, consuming queue and worker resources',
        'No dead letter queue — failed jobs are lost. You do not know what failed or why',
        'Linear backoff instead of exponential — 1s, 2s, 3s, 4s gives the failing service almost no time to recover'
      ],
      interviewTips: [
        'Draw the exponential backoff curve: 1s, 2s, 4s, 8s, 16s. Explain why exponential is better than linear (gives more recovery time)',
        'Explain jitter: "Without jitter, all retries hit at the same time. Full jitter spreads them: delay = random(0, baseDelay * 2^attempt)"',
        'Discuss the retry-ability matrix: 4xx = do not retry (client error), 5xx = retry (server error), timeout = retry (network issue)',
        'Mention the circuit breaker pattern: after N consecutive failures, stop retrying for M seconds. Prevents cascading failures'
      ],
      relatedConcepts: ['job-queue-fundamentals', 'bullmq-patterns', 'cache-stampede-solutions'],
      difficulty: 'intermediate',
      tags: ['retry', 'exponential-backoff', 'jitter', 'dead-letter-queue', 'circuit-breaker'],
      proTip: 'AWS recommends "equal jitter" for most cases: delay = min(cap, base * 2^attempt) / 2 + random(0, min(cap, base * 2^attempt) / 2). This keeps a guaranteed minimum delay (half of exponential) while still adding randomness. It is a good middle ground between no jitter (correlated retries) and full jitter (possibly very short delays).'
    },
    {
      id: 'distributed-cron',
      title: 'Distributed Cron',
      description: 'Running a cron job on one server is simple. Running it in a distributed system where 5 instances of your service are deployed is not — all 5 will fire the job simultaneously. The "exactly-once scheduling" problem requires coordination: leader election (one instance wins, runs the job), database locking (acquire a lock row before executing), or BullMQ repeatable jobs (Redis ensures single instance). Kubernetes CronJob has its own pitfalls.',
      keyPoints: [
        'The problem: 5 instances, each with the same cron schedule. All 5 fire simultaneously. The job runs 5 times instead of 1',
        'Database lock approach: INSERT INTO cron_locks (job_name, locked_at) ON CONFLICT DO NOTHING. The first instance that inserts wins. Others skip',
        'Advisory lock approach: SELECT pg_try_advisory_lock(hash) — non-blocking, first caller wins, lock released on session end',
        'BullMQ repeatable jobs: BullMQ uses Redis to ensure only one instance of a repeatable job exists, regardless of how many workers are running',
        'Leader election: one instance is elected leader (via Redis, Zookeeper, or etcd). Only the leader runs cron jobs. If the leader dies, a new leader is elected',
        'Kubernetes CronJob: runs as a separate pod on schedule. Simple, but has pitfalls: missed schedules if pod startup is slow, no guarantee of exactly-once',
        'Kubernetes CronJob concurrencyPolicy: Forbid (skip if previous is still running), Replace (kill previous, start new), Allow (run concurrently, usually wrong)',
        'Idempotency is still required: even with "exactly-once" mechanisms, edge cases (network partition, process crash) can cause double execution',
        'Monitor cron execution: log when each cron runs, alert if a cron did not run within its expected window',
        'Dead man\'s switch: external service that expects a ping at regular intervals. If no ping, it alerts. Services: Cronitor, Healthchecks.io'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Distributed Cron with Database Lock and BullMQ',
          code: `import { Queue } from 'bullmq';

const connection = { host: 'localhost', port: 6379 };

// Approach 1: BullMQ repeatable jobs (simplest)
const cronQueue = new Queue('cron', { connection });

// Add repeatable job — BullMQ ensures only one exists
await cronQueue.add('daily-report', {}, {
  repeat: { pattern: '0 9 * * *', tz: 'America/New_York' },
  jobId: 'daily-report', // CRITICAL: prevents duplicates across instances
});

await cronQueue.add('cleanup-expired-sessions', {}, {
  repeat: { every: 3600_000 }, // every hour
  jobId: 'cleanup-sessions',
});

// Approach 2: Database lock (no Redis dependency)
async function runWithCronLock(
  jobName: string,
  fn: () => Promise<void>,
  lockDurationMs: number = 300_000 // 5 minutes
): Promise<boolean> {
  // Try to acquire lock — only one instance succeeds
  const acquired = await prisma.$executeRaw\`
    INSERT INTO cron_locks (job_name, locked_at, expires_at)
    VALUES (\${jobName}, NOW(), NOW() + INTERVAL '\${lockDurationMs} milliseconds')
    ON CONFLICT (job_name)
    DO UPDATE SET locked_at = NOW(), expires_at = NOW() + INTERVAL '\${lockDurationMs} milliseconds'
    WHERE cron_locks.expires_at < NOW()
  \`;

  if (acquired === 0) {
    console.log(\`Cron \${jobName}: another instance holds the lock, skipping\`);
    return false;
  }

  try {
    console.log(\`Cron \${jobName}: acquired lock, executing\`);
    await fn();
    console.log(\`Cron \${jobName}: completed\`);

    // Ping dead man's switch
    await fetch(\`https://hc-ping.com/\${process.env.HEALTHCHECK_UUID}\`).catch(() => {});

    return true;
  } catch (err) {
    console.error(\`Cron \${jobName}: failed\`, err);
    throw err;
  } finally {
    // Release lock
    await prisma.$executeRaw\`
      DELETE FROM cron_locks WHERE job_name = \${jobName}
    \`;
  }
}

// Approach 3: PostgreSQL advisory lock
async function runWithAdvisoryLock(
  lockId: number,
  fn: () => Promise<void>
): Promise<boolean> {
  const [{ acquired }] = await prisma.$queryRaw<[{ acquired: boolean }]>\`
    SELECT pg_try_advisory_lock(\${lockId}) as acquired
  \`;

  if (!acquired) return false;

  try {
    await fn();
    return true;
  } finally {
    await prisma.$queryRaw\`SELECT pg_advisory_unlock(\${lockId})\`;
  }
}

// Usage with node-cron (each instance runs the schedule, but only one executes)
import cron from 'node-cron';

cron.schedule('0 9 * * *', async () => {
  await runWithCronLock('daily-report', async () => {
    await reportService.generateDailyReport();
  });
});`
        }
      ],
      useCases: [
        'Daily report generation — must run exactly once, not 5 times across 5 instances',
        'Data cleanup/archival — delete expired sessions, archive old records',
        'External data sync — pull data from a third-party API on a schedule',
        'Billing/invoicing — monthly invoice generation must not duplicate charges'
      ],
      commonPitfalls: [
        'Multiple instances all running the same cron without coordination — the job runs N times instead of 1',
        'BullMQ repeatable jobs without a fixed jobId — each instance creates a separate repeatable job',
        'Database lock without TTL/expiry — if the lock holder crashes, the lock is never released and the job never runs again',
        'Kubernetes CronJob with startingDeadlineSeconds too low — if the pod takes 30s to start and deadline is 10s, the job is missed',
        'Not monitoring cron execution — a silently failing cron is worse than no cron. Use dead man\'s switch (Healthchecks.io, Cronitor)'
      ],
      interviewTips: [
        'Explain the core problem: "In a distributed system with N replicas, how do you ensure a scheduled job runs exactly once?"',
        'Compare approaches: database lock (simple, no extra infra), BullMQ repeatable (Redis, integrated with job system), leader election (complex, robust)',
        'Discuss Kubernetes CronJob pitfalls: not exactly-once, pods can be slow to start, concurrent runs if previous is slow',
        'Mention dead man\'s switch: external monitoring that expects a ping. If no ping within the window, it alerts. Essential for critical crons'
      ],
      relatedConcepts: ['job-queue-fundamentals', 'bullmq-patterns', 'pessimistic-locking'],
      difficulty: 'advanced',
      tags: ['cron', 'distributed', 'leader-election', 'exactly-once', 'scheduling'],
      proTip: 'Healthchecks.io (open-source, self-hostable) is the simplest dead man\'s switch for cron monitoring. At the end of your cron job, ping https://hc-ping.com/UUID. If the ping does not arrive within the expected window, Healthchecks.io sends an alert. It takes 5 minutes to set up and catches the #1 cron failure: silently not running.'
    },
    {
      id: 'long-running-jobs',
      title: 'Long-Running Jobs',
      description: 'Some jobs take minutes or hours: report generation, data migration, video transcoding, ML model training. These jobs need special handling: progress reporting (users want to know it is working), heartbeat mechanisms (detect stuck/zombie jobs), graceful shutdown (do not lose 4 hours of work on deploy), and partial work checkpointing (resume from where you left off if the worker crashes).',
      keyPoints: [
        'Progress reporting: update job progress (%) as work proceeds. Expose via API or push via WebSocket. Users need feedback for long waits',
        'Heartbeat: worker periodically signals "I am alive" to the queue. If no heartbeat within a timeout, the job is assumed stuck and re-queued',
        'BullMQ stall detection: if a worker does not call job.moveToCompleted or report progress within stalledInterval (default 30s), the job is stalled',
        'Graceful shutdown: on SIGTERM, stop accepting new jobs, let in-progress jobs complete (within a deadline), save state, then exit',
        'Checkpointing: save intermediate state to the database at regular intervals. On restart, resume from the last checkpoint instead of starting over',
        'Timeout: set a maximum duration per job. Kill jobs that exceed it. A stuck job blocking a worker slot forever is worse than a failed job',
        'Batched processing: process large datasets in chunks (1000 records at a time) with checkpointing after each chunk',
        'Separate queue: isolate long-running jobs in their own queue with dedicated workers. Prevents them from blocking fast jobs',
        'Resource limits: set memory and CPU limits on worker processes. Long-running jobs can accumulate memory leaks'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Long-Running Job with Progress, Checkpoint, and Graceful Shutdown',
          code: `import { Queue, Worker, Job } from 'bullmq';

const connection = { host: 'localhost', port: 6379 };
const CHUNK_SIZE = 1000;

interface MigrationState {
  readonly lastProcessedId: string | null;
  readonly processedCount: number;
  readonly totalCount: number;
}

// Long-running data migration with checkpointing
async function migrateUsers(job: Job): Promise<void> {
  // Load checkpoint from previous run (if any)
  let state: MigrationState = job.data.checkpoint || {
    lastProcessedId: null,
    processedCount: 0,
    totalCount: await db.users.count({ where: { migrated: false } }),
  };

  while (true) {
    // Fetch next chunk
    const users = await db.users.findMany({
      where: {
        migrated: false,
        ...(state.lastProcessedId ? { id: { gt: state.lastProcessedId } } : {}),
      },
      orderBy: { id: 'asc' },
      take: CHUNK_SIZE,
    });

    if (users.length === 0) break; // done

    // Process chunk
    for (const user of users) {
      await transformAndMigrate(user);
    }

    // Update state
    state = {
      lastProcessedId: users[users.length - 1].id,
      processedCount: state.processedCount + users.length,
      totalCount: state.totalCount,
    };

    // Report progress
    const progress = Math.round((state.processedCount / state.totalCount) * 100);
    await job.updateProgress(progress);

    // Checkpoint: save state in job data so we can resume on restart
    await job.updateData({ ...job.data, checkpoint: state });

    // Log progress
    console.log(\`Migration progress: \${state.processedCount}/\${state.totalCount} (\${progress}%)\`);
  }
}

// Worker with graceful shutdown
let isShuttingDown = false;

const migrationWorker = new Worker('migration', migrateUsers, {
  connection,
  concurrency: 1, // one migration at a time
  lockDuration: 600_000, // 10 minute lock (re-acquired on progress updates)
  stalledInterval: 120_000, // check for stalled jobs every 2 minutes
});

// Graceful shutdown handler
async function gracefulShutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('Shutting down migration worker...');

  // Stop accepting new jobs
  await migrationWorker.close();

  // In-progress job will be picked up by another worker from its checkpoint
  console.log('Migration worker shut down gracefully');
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// API endpoint: check migration progress
router.get('/admin/migration/status', async (req: Request, res: Response) => {
  const jobs = await migrationQueue.getJobs(['active', 'waiting', 'completed']);
  const activeJob = jobs.find(j => j.data.type === 'user-migration');

  if (!activeJob) {
    return res.json({ status: 'not_running' });
  }

  const progress = await activeJob.progress;
  const state = activeJob.data.checkpoint as MigrationState | undefined;

  res.json({
    status: 'running',
    progress: \`\${progress}%\`,
    processed: state?.processedCount ?? 0,
    total: state?.totalCount ?? 0,
  });
});`
        }
      ],
      useCases: [
        'Data migration — moving millions of rows between schemas or databases',
        'Report generation — querying and aggregating large datasets into PDF/CSV',
        'Video/image processing — transcoding, thumbnail generation for large files',
        'ML model training — hours-long training runs that must survive restarts',
        'Bulk data import — processing uploaded CSV files with millions of rows'
      ],
      commonPitfalls: [
        'No progress reporting — users and operators have no idea if the job is stuck or just slow',
        'No checkpointing — a crash after 4 hours of processing means starting over from scratch',
        'Processing entire dataset in one query — OOM for large datasets. Process in chunks',
        'No timeout — a stuck job blocks a worker slot forever. Set a maximum duration',
        'Sharing queue with fast jobs — a 2-hour migration blocks the worker from processing quick email sends. Use separate queues'
      ],
      interviewTips: [
        'Discuss the checkpoint pattern: "Save state after each chunk. On restart, load checkpoint and resume. Like a video game save point"',
        'Explain graceful shutdown: "SIGTERM -> stop accepting new jobs -> let current chunk complete -> save checkpoint -> exit"',
        'Compare with async API pattern: "The API returns 202 + job ID. Client polls GET /jobs/:id for progress. Job runs in a background worker"',
        'Mention resource isolation: "Long-running jobs get their own worker pool with dedicated memory limits. They cannot starve fast jobs"'
      ],
      relatedConcepts: ['job-queue-fundamentals', 'bullmq-patterns', 'async-apis'],
      difficulty: 'advanced',
      tags: ['long-running', 'checkpoint', 'progress', 'graceful-shutdown', 'migration'],
      proTip: 'BullMQ\'s lockDuration determines how long a worker can hold a job before it is considered stalled. For long-running jobs, set a high lockDuration (600s) AND call job.updateProgress() or job.extendLock() regularly. Each progress update extends the lock. This is how BullMQ distinguishes "still working" from "stuck".'
    },
    {
      id: 'job-prioritization',
      title: 'Job Prioritization',
      description: 'Not all jobs are equally important. A password reset email is more urgent than a weekly digest. A VIP customer\'s order is more important than a free-tier user\'s. Priority queues process high-priority jobs first, but naive prioritization causes starvation: low-priority jobs never run if high-priority jobs keep arriving. Solving this requires aging (priority increases over time) or fair queuing (dedicated capacity per priority level).',
      keyPoints: [
        'Priority queues: jobs have a numeric priority. Lower number = higher priority. Workers pick the highest-priority job first',
        'Starvation: if high-priority jobs arrive continuously, low-priority jobs wait forever. This is the core problem with simple priority queues',
        'Aging: increase a job\'s priority over time. A low-priority job that has waited 1 hour becomes medium-priority. Prevents indefinite starvation',
        'Fair queuing: dedicate worker capacity per priority level. 60% for high, 30% for medium, 10% for low. All levels make progress',
        'Separate queues per priority: instead of one queue with priorities, use queue-high, queue-medium, queue-low with separate workers. Simpler and avoids starvation by design',
        'BullMQ priority: lower number = higher priority (1 is highest). Priority is per-queue, not across queues',
        'SLA-based prioritization: set priority based on SLA deadlines. "Must complete within 5 minutes" = high. "Must complete within 24 hours" = low',
        'Dynamic priority: reprioritize based on context. User waiting on the result = high. Background batch = low. Priority changes based on real-time demand',
        'Monitor per-priority metrics: track queue depth, wait time, and completion rate per priority level. Alert if low-priority starvation is detected'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Priority Queue with Starvation Prevention',
          code: `import { Queue, Worker } from 'bullmq';

const connection = { host: 'localhost', port: 6379 };

// Approach 1: BullMQ native priority
const taskQueue = new Queue('tasks', { connection });

// Priority: 1 = critical, 5 = normal, 10 = background
await taskQueue.add('password-reset', { userId: '123' }, { priority: 1 });
await taskQueue.add('order-confirmation', { orderId: '456' }, { priority: 3 });
await taskQueue.add('weekly-digest', { userId: '789' }, { priority: 10 });

// Approach 2: Separate queues for guaranteed capacity
const criticalQueue = new Queue('tasks:critical', { connection });
const normalQueue = new Queue('tasks:normal', { connection });
const backgroundQueue = new Queue('tasks:background', { connection });

// Dedicated workers per priority — prevents starvation
const criticalWorker = new Worker('tasks:critical', processTask, {
  connection,
  concurrency: 10, // 60% capacity for critical
});

const normalWorker = new Worker('tasks:normal', processTask, {
  connection,
  concurrency: 5, // 30% capacity for normal
});

const backgroundWorker = new Worker('tasks:background', processTask, {
  connection,
  concurrency: 2, // 10% capacity for background
});

// Approach 3: Weighted fair queue (rotate between priorities)
class FairScheduler {
  private readonly queues: { queue: Queue; weight: number }[];
  private roundRobinIndex = 0;

  constructor(queues: { queue: Queue; weight: number }[]) {
    this.queues = queues;
  }

  // Weighted round-robin: check high-priority more often
  async getNextJob(): Promise<Job | null> {
    const expanded: Queue[] = [];
    for (const { queue, weight } of this.queues) {
      for (let i = 0; i < weight; i++) {
        expanded.push(queue);
      }
    }
    // Rotate through weighted list
    for (let i = 0; i < expanded.length; i++) {
      const idx = (this.roundRobinIndex + i) % expanded.length;
      const jobs = await expanded[idx].getJobs(['waiting'], 0, 0);
      if (jobs.length > 0) {
        this.roundRobinIndex = (idx + 1) % expanded.length;
        return jobs[0];
      }
    }
    return null;
  }
}

// Weights: critical checked 6x, normal 3x, background 1x
const scheduler = new FairScheduler([
  { queue: criticalQueue, weight: 6 },
  { queue: normalQueue, weight: 3 },
  { queue: backgroundQueue, weight: 1 },
]);`
        }
      ],
      useCases: [
        'Email sending: password reset (critical) vs marketing newsletter (background)',
        'Multi-tenant SaaS: paid customers (high) vs free tier (low)',
        'E-commerce: order processing during sale events (high) vs catalog indexing (low)',
        'Data pipelines: real-time analytics (high) vs batch reporting (low)'
      ],
      commonPitfalls: [
        'Single priority queue without starvation prevention — low-priority jobs wait forever during peak times',
        'Too many priority levels (1-100) — hard to reason about, similar priorities have no meaningful difference',
        'No per-priority monitoring — you do not notice that background jobs have not run in 3 days',
        'Dynamic priority without bounds — a runaway priority escalation pushes all jobs to "critical"',
        'Ignoring queue depth per priority — 10,000 background jobs waiting means something is wrong, even if they are low priority'
      ],
      interviewTips: [
        'Explain the starvation problem: "If high-priority jobs keep arriving, low-priority jobs never get processed. This is a classic scheduling problem"',
        'Compare solutions: priority queues (simple, starvation risk), separate queues (capacity guarantee, operational complexity), aging (starvation prevention)',
        'Connect to OS scheduling: this is the same problem as CPU scheduling. Linux uses CFS (Completely Fair Scheduler). The concepts translate',
        'Discuss SLA-based prioritization: "The priority should reflect the business impact of delay, not an arbitrary number"'
      ],
      relatedConcepts: ['job-queue-fundamentals', 'bullmq-patterns', 'rate-limiting'],
      difficulty: 'intermediate',
      tags: ['priority', 'queue', 'starvation', 'fair-queuing', 'scheduling'],
      proTip: 'The simplest starvation prevention: separate queues (critical, normal, background) with dedicated workers. The background queue always has workers, even if critical is flooded. No aging logic, no weighted scheduling — just isolated capacity. Use the simple approach first; only add complexity when the simple approach is insufficient.'
    },
    {
      id: 'transactional-job-enqueue',
      title: 'Transactional Job Enqueue',
      description: 'The dual-write problem: you update the database AND enqueue a job. If the database commits but the queue enqueue fails (Redis down), you have inconsistency — data changed but no job was created. If the enqueue succeeds but the database rolls back, you have a ghost job processing nonexistent data. The outbox pattern solves this: write the job to a database table (outbox) in the SAME transaction as the data change. A separate process reads the outbox and enqueues to the job queue.',
      keyPoints: [
        'Dual-write problem: writing to two systems (DB + queue) without a distributed transaction. Either can fail independently, causing inconsistency',
        'Outbox pattern: insert the job into an "outbox" table in the same database transaction as the data change. A poller/CDC reads the outbox and enqueues',
        'Same transaction = atomic: either both the data change AND the outbox row are committed, or neither is. No inconsistency',
        'Outbox poller: a separate process polls the outbox table for new entries, enqueues them to the job queue, then marks them as processed',
        'CDC-based dispatch: use Change Data Capture (Debezium) to watch the outbox table and automatically enqueue new rows. More scalable than polling',
        'At-least-once guarantee: the poller might enqueue a job and crash before marking it processed. On restart, it enqueues again. Jobs MUST be idempotent',
        'Outbox cleanup: delete processed outbox entries after a retention period. They accumulate otherwise',
        'Ordering guarantee: process outbox entries in insertion order for FIFO behavior. Use an auto-increment ID or timestamp',
        'This pattern is also called "transactional messaging" or "reliable messaging"'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Transactional Outbox Pattern',
          code: `import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';

const prisma = new PrismaClient();
const orderQueue = new Queue('orders', { connection: { host: 'localhost', port: 6379 } });

interface OutboxEntry {
  readonly id: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly payload: unknown;
  readonly createdAt: Date;
  readonly processedAt: Date | null;
}

// Step 1: Write data + outbox entry in ONE transaction
async function createOrder(data: CreateOrderDto): Promise<Order> {
  return prisma.$transaction(async (tx) => {
    // Create the order
    const order = await tx.order.create({
      data: {
        customerId: data.customerId,
        items: { create: data.items },
        total: data.total,
        status: 'pending',
      },
    });

    // Write to outbox in the SAME transaction
    await tx.outboxEntry.create({
      data: {
        aggregateType: 'Order',
        aggregateId: order.id,
        eventType: 'order.created',
        payload: {
          orderId: order.id,
          customerId: data.customerId,
          total: data.total,
        },
      },
    });

    return order;
    // If this transaction fails, BOTH the order AND the outbox entry are rolled back
    // If it succeeds, BOTH are committed atomically
  });
}

// Step 2: Outbox poller — reads outbox, enqueues to job queue
async function processOutbox(): Promise<number> {
  const entries = await prisma.outboxEntry.findMany({
    where: { processedAt: null },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  let processed = 0;

  for (const entry of entries) {
    try {
      // Enqueue to the appropriate queue based on event type
      const queueName = eventToQueue(entry.eventType);
      await orderQueue.add(entry.eventType, entry.payload, {
        jobId: entry.id, // idempotency: same outbox entry = same job ID
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });

      // Mark as processed
      await prisma.outboxEntry.update({
        where: { id: entry.id },
        data: { processedAt: new Date() },
      });

      processed++;
    } catch (err) {
      console.error(\`Failed to process outbox entry \${entry.id}\`, err);
      // Will be retried on next poll
    }
  }

  return processed;
}

function eventToQueue(eventType: string): string {
  const mapping: Record<string, string> = {
    'order.created': 'orders',
    'order.paid': 'payments',
    'user.registered': 'email',
  };
  return mapping[eventType] || 'default';
}

// Run poller every 1 second
setInterval(async () => {
  try {
    const count = await processOutbox();
    if (count > 0) console.log(\`Processed \${count} outbox entries\`);
  } catch (err) {
    console.error('Outbox poller error', err);
  }
}, 1000);

// Cleanup: delete processed entries older than 7 days
async function cleanupOutbox(): Promise<void> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const deleted = await prisma.outboxEntry.deleteMany({
    where: { processedAt: { lt: cutoff } },
  });
  console.log(\`Cleaned up \${deleted.count} old outbox entries\`);
}`
        }
      ],
      useCases: [
        'Order processing: create order in DB + enqueue payment processing as one atomic operation',
        'User registration: create user in DB + enqueue welcome email atomically',
        'Event sourcing: persist event + trigger side effects reliably',
        'Microservice communication: publish domain events reliably after state changes'
      ],
      commonPitfalls: [
        'Writing to DB and queue separately (dual-write) — either can fail, causing inconsistency',
        'Outbox poller without idempotency in job queue — same entry enqueued twice = duplicate processing',
        'No outbox cleanup — table grows forever, poller queries get slower',
        'Polling too infrequently — delay between data change and job processing. Use CDC for lower latency',
        'Not handling poison messages — an outbox entry that consistently fails to enqueue blocks the poller. Skip and alert after N failures'
      ],
      interviewTips: [
        'Start with the problem: "We need to update the database AND enqueue a job atomically. But they are different systems with no shared transaction"',
        'Walk through the outbox pattern step by step: write data + outbox row in one DB transaction -> poller reads outbox -> enqueues to job queue -> marks processed',
        'Discuss the trade-off: polling adds latency (up to poll interval). CDC (Debezium) reduces latency to near-real-time but adds infrastructure complexity',
        'Mention that this is a well-known pattern in event-driven architectures: "Transactional Outbox" from the Microservices Patterns book (Chris Richardson)'
      ],
      relatedConcepts: ['job-queue-fundamentals', 'database-transactions', 'distributed-cron'],
      difficulty: 'advanced',
      tags: ['outbox', 'dual-write', 'transactional', 'event-driven', 'reliability'],
      proTip: 'Debezium + Kafka is the production-grade outbox implementation. Debezium reads the PostgreSQL WAL (write-ahead log) and emits change events to Kafka. A consumer reads from Kafka and enqueues to your job queue. Latency is sub-second, and you get the full CDC event stream for free — useful for more than just job dispatch.'
    },
  ],
}
