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

export const apiDesignBECategory: Category = {
  id: 'api-design',
  title: 'API Design',
  description: 'REST API design principles, versioning strategies, pagination patterns, error handling standards, idempotency, bulk operations, async APIs, and request validation — the backbone of every backend service.',
  icon: '🔌',
  concepts: [
    {
      id: 'rest-api-design',
      title: 'REST API Design',
      description: 'REST API design is about modeling resources with predictable URLs, leveraging HTTP semantics correctly, and creating an API that developers can discover and use without reading every line of docs. The real skill is knowing when to break the rules — not every operation maps cleanly to CRUD, and forcing it creates worse APIs than a well-placed RPC-style endpoint.',
      keyPoints: [
        'Use plural nouns for collections: /users, /orders — never /getUser or /createOrder',
        'Nest resources max 2 levels deep: /users/:id/orders is fine, /users/:id/orders/:oid/items/:iid/variants is not — flatten with filters instead',
        'HTTP verbs have specific semantics: GET (safe, cacheable), POST (create, non-idempotent), PUT (full replace, idempotent), PATCH (partial update, idempotent), DELETE (remove, idempotent)',
        'PUT replaces the ENTIRE resource — omitted fields are set to null/default. PATCH updates only the fields you send. Most APIs want PATCH, not PUT',
        'Use 201 Created for successful POST with Location header pointing to new resource',
        'Use 204 No Content for successful DELETE or PUT/PATCH when you do not return the updated resource',
        'Use 200 OK for GET and for PUT/PATCH when you return the updated resource in the response body',
        'Idempotency matrix: GET (yes), PUT (yes), DELETE (yes), PATCH (yes if applied the same way), POST (no — needs idempotency key)',
        'Use query parameters for filtering, sorting, and pagination: GET /users?status=active&sort=-created_at&page=2',
        'Use sub-resources for relationships: GET /users/:id/orders, POST /users/:id/orders',
        'For actions that do not map to CRUD, use a verb sub-resource: POST /orders/:id/cancel, POST /users/:id/verify-email',
        'Always return consistent envelope: { data, error, meta } — clients should never have to guess the shape'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Express REST Router with Proper HTTP Semantics',
          code: `import { Router, Request, Response } from 'express';

const router = Router();

// GET /users — list with filtering + pagination
router.get('/users', async (req: Request, res: Response) => {
  const { status, sort, page = '1', limit = '20' } = req.query;
  const users = await userService.findAll({
    status: status as string,
    sort: sort as string,
    page: Number(page),
    limit: Math.min(Number(limit), 100), // cap at 100
  });
  res.json({
    data: users.items,
    meta: { total: users.total, page: users.page, limit: users.limit },
  });
});

// POST /users — create, return 201 + Location
router.post('/users', async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  res.status(201)
    .location(\`/api/v1/users/\${user.id}\`)
    .json({ data: user });
});

// PATCH /users/:id — partial update, return updated resource
router.patch('/users/:id', async (req: Request, res: Response) => {
  const user = await userService.update(req.params.id, req.body);
  res.json({ data: user });
});

// DELETE /users/:id — 204 No Content
router.delete('/users/:id', async (req: Request, res: Response) => {
  await userService.delete(req.params.id);
  res.status(204).end();
});

// POST /users/:id/verify-email — action endpoint (RPC-style)
router.post('/users/:id/verify-email', async (req: Request, res: Response) => {
  await userService.sendVerificationEmail(req.params.id);
  res.status(202).json({ data: { message: 'Verification email queued' } });
});`
        }
      ],
      useCases: [
        'Public-facing APIs consumed by third-party developers',
        'Microservice-to-microservice communication where discoverability matters',
        'Mobile app backends where bandwidth and cacheability are critical',
        'Any API where you want to leverage HTTP caching infrastructure (CDNs, proxies)'
      ],
      commonPitfalls: [
        'Using verbs in URLs: /getUser, /deleteOrder — use HTTP methods instead',
        'Deep nesting beyond 2 levels making URLs unmaintainable and routing complex',
        'Using PUT when you mean PATCH — clients accidentally null out fields they did not send',
        'Returning 200 for everything and stuffing errors in the body — HTTP status codes exist for a reason',
        'Inconsistent response shapes across endpoints — one returns { user } another returns { data: { user } }',
        'Not capping pagination limit — a client can request limit=1000000 and OOM your server'
      ],
      interviewTips: [
        'Be ready to design a REST API on a whiteboard: start with resources, then CRUD verbs, then discuss edge cases (bulk, search, async)',
        'Know the difference between PUT and PATCH cold — interviewers love this question',
        'Explain idempotency and why POST is special: if you retry a POST, you might create duplicates',
        'Discuss when REST breaks down: graph-like queries (use GraphQL), real-time updates (use WebSocket/SSE), complex transactions across resources'
      ],
      relatedConcepts: ['api-versioning', 'pagination-deep-dive', 'error-handling-standards', 'idempotency-keys'],
      difficulty: 'intermediate',
      tags: ['rest', 'http', 'api', 'design', 'crud'],
      proTip: 'The best REST APIs are boring. If a developer can guess your endpoint structure after seeing two endpoints, you have succeeded. Consistency beats cleverness every time.'
    },
    {
      id: 'api-versioning',
      title: 'API Versioning Strategies',
      description: 'API versioning is the mechanism that lets you evolve your API without breaking existing clients. The choice of versioning strategy affects URL aesthetics, caching behavior, client complexity, and your ability to sunset old versions. There is no universally correct answer — each strategy has trade-offs that align with different organizational realities.',
      keyPoints: [
        'URI versioning (/v1/users) — most common, most visible, easy to route, but pollutes URLs and makes version bumps feel like a new API',
        'Header versioning (Accept: application/vnd.myapi.v2+json) — clean URLs, but harder to test in browser, less discoverable',
        'Query param versioning (?version=2) — easy to implement, but breaks caching if not careful, feels hacky',
        'Semantic versioning for APIs: MAJOR = breaking change, MINOR = additive, PATCH = bug fix — but in practice most APIs only track MAJOR',
        'Sunset header (RFC 8594): Sunset: Sat, 31 Dec 2025 23:59:59 GMT — tells clients when a version will be removed',
        'Deprecation header: Deprecation: true with Link header pointing to migration guide',
        'Never version internal microservice APIs the same way you version public APIs — use contract testing instead',
        'Most teams should start with URI versioning — it is the simplest to implement, debug, and explain',
        'Create a new version only for breaking changes — additive changes (new fields, new endpoints) do not need a version bump',
        'Run old versions behind a compatibility layer, not as separate deployments — reduces operational burden'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Express API Versioning with Sunset Headers',
          code: `import express, { Request, Response, NextFunction } from 'express';

const app = express();

// Version routing
import v1Router from './routes/v1';
import v2Router from './routes/v2';

// Middleware: add deprecation headers to v1
function deprecateV1(req: Request, res: Response, next: NextFunction) {
  res.set('Deprecation', 'true');
  res.set('Sunset', 'Sat, 31 Dec 2025 23:59:59 GMT');
  res.set('Link', '</docs/migration/v1-to-v2>; rel="deprecation"');
  next();
}

app.use('/api/v1', deprecateV1, v1Router);
app.use('/api/v2', v2Router);

// Header-based versioning alternative
function versionFromHeader(req: Request): number {
  const accept = req.get('Accept') || '';
  const match = accept.match(/application\\/vnd\\.myapi\\.v(\\d+)\\+json/);
  return match ? parseInt(match[1], 10) : 2; // default to latest
}

app.use('/api/users', (req: Request, res: Response, next: NextFunction) => {
  const version = versionFromHeader(req);
  if (version === 1) return v1Router.handle(req, res, next);
  return v2Router.handle(req, res, next);
});`
        }
      ],
      useCases: [
        'Public APIs with external consumers who cannot be forced to upgrade simultaneously',
        'Mobile apps where old versions persist in the wild for months or years',
        'Platform APIs (Stripe, Twilio) where breaking changes would lose customers',
        'Internal APIs with multiple teams consuming at different upgrade cadences'
      ],
      commonPitfalls: [
        'Versioning too eagerly — creating v2, v3, v4 when additive changes would suffice',
        'Not setting sunset dates — v1 lives forever and becomes an unmaintainable zombie',
        'Running each version as a separate deployment — doubles infrastructure cost and diverges quickly',
        'Breaking changes without a version bump — the worst of all worlds',
        'Header versioning without documenting how to test it — developers cannot explore with a browser or curl without reading docs'
      ],
      interviewTips: [
        'Compare URI vs header versioning trade-offs: discoverability vs URL cleanliness',
        'Mention that Stripe uses a date-based versioning approach (API version: 2023-10-16) which pins behavior to a point in time',
        'Explain what constitutes a breaking change: removing a field, changing a field type, changing error format, removing an endpoint',
        'Non-breaking changes: adding a field, adding an endpoint, adding an optional parameter'
      ],
      relatedConcepts: ['rest-api-design', 'error-handling-standards', 'async-apis'],
      difficulty: 'intermediate',
      tags: ['versioning', 'api', 'backward-compatibility', 'sunset'],
      proTip: 'Stripe\'s approach of pinning API behavior to a date (not a version number) is brilliant. Each customer is locked to the behavior at the time they integrated, and upgrades are explicit. This eliminates the "when do we bump to v3?" debate entirely.'
    },
    {
      id: 'pagination-deep-dive',
      title: 'Pagination Deep Dive',
      description: 'Pagination is deceptively complex. Offset pagination is simple but breaks at scale. Cursor-based pagination is consistent but opaque. Keyset pagination is performant but constrains sort order. Understanding the trade-offs is essential because pagination is in every list endpoint you will ever build, and the wrong choice causes real production pain.',
      keyPoints: [
        'Offset pagination (OFFSET + LIMIT): simple, supports "jump to page 5", but OFFSET 100000 scans 100000 rows before discarding them — O(offset + limit)',
        'Cursor-based pagination: encode last seen state as opaque base64 token, decode on server — consistent results even with concurrent inserts/deletes',
        'Keyset pagination (WHERE id > :last_id ORDER BY id LIMIT :n): fastest for sequential access, no offset cost, but requires a unique sortable column',
        'Total count is expensive: COUNT(*) on large tables with filters can take seconds — consider returning hasNextPage boolean instead, or cache the count',
        'Hypermedia links (next, prev, first, last URLs in response) improve API discoverability and decouple client from pagination implementation',
        'For cursor pagination, the cursor should be opaque to clients — base64 encode internal state so you can change the implementation without breaking clients',
        'Keyset pagination only works efficiently when sorting by indexed columns — compound sorts need compound cursors',
        'Offset pagination causes "drift": if items are inserted while paginating, items can be skipped or duplicated across pages',
        'Default limit should be reasonable (20-50), max limit should be capped (100-200) — never let clients request unbounded results'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Keyset Pagination with Cursor Encoding',
          code: `interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly cursor: string | null;
  readonly hasNextPage: boolean;
}

function encodeCursor(id: string, createdAt: Date): string {
  return Buffer.from(JSON.stringify({ id, createdAt: createdAt.toISOString() })).toString('base64url');
}

function decodeCursor(cursor: string): { id: string; createdAt: Date } {
  const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString());
  return { id: parsed.id, createdAt: new Date(parsed.createdAt) };
}

async function listUsers(
  limit: number = 20,
  after?: string
): Promise<PaginatedResult<User>> {
  const safeLimit = Math.min(limit, 100);

  let query = db('users').orderBy('created_at', 'desc').orderBy('id', 'desc').limit(safeLimit + 1);

  if (after) {
    const { id, createdAt } = decodeCursor(after);
    query = query.where(function () {
      this.where('created_at', '<', createdAt)
        .orWhere(function () {
          this.where('created_at', '=', createdAt).andWhere('id', '<', id);
        });
    });
  }

  const rows = await query;
  const hasNextPage = rows.length > safeLimit;
  const data = hasNextPage ? rows.slice(0, safeLimit) : rows;
  const lastItem = data[data.length - 1];

  return {
    data,
    cursor: lastItem ? encodeCursor(lastItem.id, lastItem.created_at) : null,
    hasNextPage,
  };
}`
        }
      ],
      useCases: [
        'Infinite scroll UIs (cursor-based — no page jumps needed)',
        'Admin dashboards with "page 1, 2, 3" navigation (offset — needs page jumps)',
        'High-volume feeds (Twitter timeline, activity log) — keyset pagination is the only viable option',
        'Search results where total count is part of the UX (offset with cached count)'
      ],
      commonPitfalls: [
        'Using OFFSET on tables with millions of rows — performance degrades linearly with offset value',
        'Exposing internal IDs or timestamps directly as cursor values — encode them so you can refactor later',
        'Computing COUNT(*) on every request for large tables — this alone can be slower than the actual query',
        'Not handling the case where cursor points to a deleted record — keyset WHERE clause handles this naturally, but you need to think about it',
        'Allowing unbounded limit parameter — always cap it server-side'
      ],
      interviewTips: [
        'Draw out the SQL for each pagination type and explain the performance characteristics',
        'Explain why offset pagination "drifts" with concurrent writes and how cursor-based avoids this',
        'Mention that cursor-based pagination is what the Relay specification standardizes for GraphQL',
        'If asked about "efficient pagination for millions of rows," keyset is the answer — offset cannot do it'
      ],
      relatedConcepts: ['rest-api-design', 'query-optimization', 'index-deep-dive'],
      difficulty: 'intermediate',
      tags: ['pagination', 'cursor', 'keyset', 'offset', 'performance'],
      proTip: 'Fetch limit + 1 rows and check if you got the extra row to determine hasNextPage — this avoids a separate COUNT query entirely. Slack, Discord, and most high-scale APIs use this trick.',
      ascii: `Offset Pagination:
  Page 1: SELECT ... LIMIT 20 OFFSET 0    -- scans 20 rows
  Page 2: SELECT ... LIMIT 20 OFFSET 20   -- scans 40 rows
  Page 500: SELECT ... LIMIT 20 OFFSET 9980 -- scans 10000 rows (!)

Keyset Pagination:
  Page 1: SELECT ... WHERE true ORDER BY id LIMIT 20
  Page 2: SELECT ... WHERE id > 20 ORDER BY id LIMIT 20
  Page 500: SELECT ... WHERE id > 9980 ORDER BY id LIMIT 20
  (always scans ~20 rows via index seek)`
    },
    {
      id: 'error-handling-standards',
      title: 'Error Handling Standards',
      description: 'Error handling is the contract between your API and every client that consumes it. RFC 7807 (Problem Details for HTTP APIs) standardizes machine-readable error responses. Good error handling means clients can programmatically distinguish between "retry this" and "fix your request" without parsing human-readable strings, while never leaking implementation details that aid attackers.',
      keyPoints: [
        'RFC 7807 (Problem Details) defines a standard error shape: { type, title, status, detail, instance } — adopt it, do not invent your own',
        'HTTP status codes are coarse categories: 4xx = client error (fix your request), 5xx = server error (retry later)',
        'Use specific status codes: 400 (bad request), 401 (not authenticated), 403 (not authorized), 404 (not found), 409 (conflict), 422 (validation error), 429 (rate limited)',
        'Machine-readable error codes (e.g., "INSUFFICIENT_FUNDS", "EMAIL_TAKEN") let clients branch logic without parsing messages',
        'Correlation IDs: generate a unique request ID (UUID), return it in the response, log it server-side — enables cross-team debugging',
        'NEVER leak stack traces, SQL queries, internal paths, or dependency versions in error responses — attackers use these',
        'Validation errors should return field-level detail: { field: "email", code: "INVALID_FORMAT", message: "Must be a valid email" }',
        'Log the full error context server-side (stack trace, request body, user ID) but return only safe information to clients',
        'Use detail for human-readable explanation and type for machine-readable URI identifying the error class'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'RFC 7807 Error Handling Middleware',
          code: `interface ProblemDetail {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly instance: string;
  readonly correlationId: string;
  readonly errors?: readonly FieldError[];
}

interface FieldError {
  readonly field: string;
  readonly code: string;
  readonly message: string;
}

class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly detail: string,
    public readonly fieldErrors?: readonly FieldError[]
  ) {
    super(detail);
  }
}

// Express error middleware
function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const correlationId = req.headers['x-request-id'] as string || crypto.randomUUID();

  // Log full context server-side
  logger.error({
    correlationId,
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    userId: req.user?.id,
  });

  if (err instanceof AppError) {
    const problem: ProblemDetail = {
      type: \`https://api.example.com/errors/\${err.code}\`,
      title: err.code.replace(/_/g, ' ').toLowerCase(),
      status: err.status,
      detail: err.detail,
      instance: req.originalUrl,
      correlationId,
      errors: err.fieldErrors,
    };
    return res.status(err.status).json(problem);
  }

  // Unknown errors — never leak internals
  const problem: ProblemDetail = {
    type: 'https://api.example.com/errors/INTERNAL_ERROR',
    title: 'Internal server error',
    status: 500,
    detail: 'An unexpected error occurred. Please try again later.',
    instance: req.originalUrl,
    correlationId,
  };
  res.status(500).json(problem);
}`
        }
      ],
      useCases: [
        'Any public API — error format is part of your API contract',
        'Microservice architectures where errors propagate across services — correlation IDs are essential',
        'APIs consumed by mobile apps where retry logic depends on error codes',
        'Multi-tenant platforms where error messages must never leak data from other tenants'
      ],
      commonPitfalls: [
        'Returning 200 OK with { success: false } — this breaks HTTP semantics and confuses every client library',
        'Different error shapes from different endpoints — clients cannot write one error handler',
        'Leaking stack traces in production — a goldmine for attackers',
        'Using only status codes without machine-readable error codes — 400 means too many things',
        'Not including a correlation ID — debugging a production issue across services without one is misery'
      ],
      interviewTips: [
        'Mention RFC 7807 by name — it shows you know the standard, not just ad-hoc approaches',
        'Explain the distinction between authentication (401) and authorization (403) — interviewers test this constantly',
        'Discuss why 422 (Unprocessable Entity) is better than 400 for validation errors — it is more specific',
        'Talk about error correlation: request ID in response header, logged server-side, included in error body'
      ],
      relatedConcepts: ['rest-api-design', 'request-validation', 'security-headers'],
      difficulty: 'intermediate',
      tags: ['error-handling', 'rfc-7807', 'api', 'correlation-id', 'security'],
      proTip: 'Stripe returns a request_id with every response (success or error). When a customer reports an issue, support asks for the request ID and can immediately pull the full request/response from logs. This one field saves thousands of hours of debugging per year.'
    },
    {
      id: 'idempotency-keys',
      title: 'Idempotency Keys',
      description: 'Idempotency keys solve the fundamental problem of distributed systems: "did my request succeed, fail, or get lost?" When a client retries a POST request (network timeout, server crash mid-processing), the server must recognize the retry and return the original result instead of processing the request again. Without idempotency keys, retrying a payment creates double charges. With them, retries are safe.',
      keyPoints: [
        'Client generates a UUID and sends it as Idempotency-Key header with POST requests',
        'Server stores the idempotency key + response on first processing — returns stored response on subsequent requests with same key',
        'Idempotency keys have a TTL (typically 24-48 hours) — after that, the same key can create a new request',
        'The server must handle concurrent requests with the same key: use a database lock or atomic upsert to prevent race conditions',
        'GET, PUT, DELETE are already idempotent by HTTP spec — idempotency keys are only needed for POST (and sometimes PATCH)',
        'Store the full response (status code + body), not just a boolean — the client needs the original result',
        'If the first request is still processing when a retry arrives, return 409 Conflict or hold the retry until the first completes',
        'Payment APIs (Stripe, PayPal) made this pattern mainstream — it is now a best practice for any state-changing POST',
        'Idempotency key scope: per-user + per-endpoint, not globally — same key from different users should be independent'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Idempotency Key Middleware with Redis',
          code: `import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis();
const IDEMPOTENCY_TTL = 86400; // 24 hours

interface StoredResponse {
  readonly statusCode: number;
  readonly body: unknown;
}

async function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'POST') return next();

  const key = req.headers['idempotency-key'] as string;
  if (!key) return next(); // optional: require for certain endpoints

  const redisKey = \`idempotency:\${req.user?.id}:\${req.path}:\${key}\`;

  // Try to acquire lock (prevent concurrent duplicate processing)
  const acquired = await redis.set(redisKey + ':lock', 'processing', 'EX', 60, 'NX');
  if (!acquired) {
    return res.status(409).json({
      type: 'https://api.example.com/errors/IDEMPOTENCY_CONFLICT',
      title: 'Request already in progress',
      status: 409,
      detail: 'A request with this idempotency key is currently being processed.',
    });
  }

  // Check for stored response
  const stored = await redis.get(redisKey);
  if (stored) {
    await redis.del(redisKey + ':lock');
    const parsed: StoredResponse = JSON.parse(stored);
    return res.status(parsed.statusCode).json(parsed.body);
  }

  // Intercept res.json to capture the response
  const originalJson = res.json.bind(res);
  res.json = function (body: unknown) {
    const toStore: StoredResponse = { statusCode: res.statusCode, body };
    // Fire and forget — store response + release lock
    redis.setex(redisKey, IDEMPOTENCY_TTL, JSON.stringify(toStore))
      .then(() => redis.del(redisKey + ':lock'));
    return originalJson(body);
  };

  next();
}`
        }
      ],
      useCases: [
        'Payment processing — the canonical use case, preventing double charges on retry',
        'Order creation — retrying a checkout should not create duplicate orders',
        'Email/notification sending — retrying should not send duplicate messages',
        'Any POST endpoint where duplicate processing has business consequences'
      ],
      commonPitfalls: [
        'Not handling concurrent duplicate requests — two requests with same key arrive simultaneously, both process',
        'Storing only success/failure instead of the full response — the client needs the original data',
        'Making idempotency keys global instead of per-user — one user\'s key should not collide with another\'s',
        'No TTL on stored responses — keys accumulate forever consuming storage',
        'Requiring idempotency keys on GET requests — GETs are already idempotent, this just adds friction'
      ],
      interviewTips: [
        'Start by explaining WHY: network timeouts mean clients cannot distinguish "server never got it" from "server processed it but response was lost"',
        'Walk through the sequence diagram: client sends POST with key -> server checks store -> not found -> process + store -> return. On retry: found -> return stored response',
        'Mention that Stripe\'s idempotency key implementation is the gold standard — cite it as a reference',
        'Discuss the race condition: what happens if two identical requests arrive at the exact same millisecond? Answer: atomic lock or database unique constraint'
      ],
      relatedConcepts: ['rest-api-design', 'error-handling-standards', 'distributed-caching-patterns'],
      difficulty: 'advanced',
      tags: ['idempotency', 'distributed-systems', 'retry', 'payment', 'reliability'],
      proTip: 'Stripe allows you to reuse an idempotency key with different parameters and returns a 400 error. This prevents a subtle bug where a client accidentally reuses a key from a previous request and silently gets the wrong response. Always hash the request body along with the key if you want this safety.'
    },
    {
      id: 'bulk-operations',
      title: 'Bulk Operations',
      description: 'Bulk operations let clients create, update, or delete multiple resources in a single request. The design challenge is handling partial failures: should the entire batch fail atomically (transaction), or should each item succeed or fail independently (best-effort with 207 Multi-Status)? The answer depends on whether your consumers can handle partial success gracefully.',
      keyPoints: [
        'Batch endpoint: POST /users/bulk with array body — keep the same validation per item',
        'Transaction mode: all-or-nothing, return 200 or 400 — simpler for clients, but one bad item fails the whole batch',
        'Best-effort mode: each item processed independently, return 207 Multi-Status with per-item results — more flexible but clients must handle partial success',
        '207 Multi-Status response contains an array of results, each with its own status code and data/error',
        'Cap batch size (50-1000 items) — unbounded batches cause timeouts and memory issues',
        'For very large batches (>1000), use async pattern: accept the batch, return 202 + job ID, process in background',
        'Validate the entire batch before processing any item in transaction mode — fail fast with all validation errors',
        'Bulk DELETE: accept array of IDs in request body (not query params — URL length limits)',
        'Consider providing both sync (small batches) and async (large batches) variants'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Bulk Create with 207 Multi-Status',
          code: `interface BulkItemResult<T> {
  readonly index: number;
  readonly status: number;
  readonly data?: T;
  readonly error?: { code: string; message: string };
}

interface BulkResponse<T> {
  readonly results: readonly BulkItemResult<T>[];
  readonly summary: { total: number; succeeded: number; failed: number };
}

async function bulkCreateUsers(
  items: readonly CreateUserDto[]
): Promise<BulkResponse<User>> {
  const results: BulkItemResult<User>[] = [];
  let succeeded = 0;
  let failed = 0;

  // Process each item independently for best-effort semantics
  for (let i = 0; i < items.length; i++) {
    try {
      const validated = createUserSchema.parse(items[i]);
      const user = await userService.create(validated);
      results.push({ index: i, status: 201, data: user });
      succeeded++;
    } catch (err) {
      const message = err instanceof ZodError
        ? err.errors.map(e => e.message).join(', ')
        : 'Internal error';
      results.push({
        index: i,
        status: err instanceof ZodError ? 422 : 500,
        error: { code: 'CREATE_FAILED', message },
      });
      failed++;
    }
  }

  return {
    results,
    summary: { total: items.length, succeeded, failed },
  };
}

// Route handler
router.post('/users/bulk', async (req: Request, res: Response) => {
  const items = req.body.items;
  if (!Array.isArray(items) || items.length > 100) {
    return res.status(400).json({ error: 'items must be an array with max 100 elements' });
  }
  const result = await bulkCreateUsers(items);
  const httpStatus = result.summary.failed === 0 ? 201 : 207;
  res.status(httpStatus).json({ data: result });
});`
        }
      ],
      useCases: [
        'Data import/migration tools that need to create thousands of records',
        'Admin interfaces with multi-select actions (delete selected, update status of selected)',
        'Sync protocols where mobile clients batch up offline changes',
        'ETL pipelines pushing data into your API'
      ],
      commonPitfalls: [
        'No batch size limit — a client sends 100,000 items and your server runs out of memory',
        'Using transaction mode when best-effort would be more useful — one invalid email in a batch of 500 imports fails everything',
        'Not returning per-item results — clients cannot tell which items failed and need to retry the entire batch',
        'Processing bulk requests synchronously when they take >30 seconds — use async pattern for large batches',
        'Forgetting that bulk endpoints need the same authorization checks as individual endpoints'
      ],
      interviewTips: [
        'Discuss the trade-off between atomic (all-or-nothing) and best-effort (partial success) approaches',
        'Mention 207 Multi-Status — most candidates do not know this status code',
        'For very large batches, pivot to async: 202 Accepted + job ID + polling/webhook for status',
        'Explain how bulk operations interact with rate limiting: should a batch of 100 count as 1 request or 100?'
      ],
      relatedConcepts: ['rest-api-design', 'async-apis', 'error-handling-standards', 'background-jobs'],
      difficulty: 'advanced',
      tags: ['bulk', 'batch', '207', 'partial-success', 'api'],
      proTip: 'Shopify\'s bulk operations API uses GraphQL mutations that return a job URL. The job processes asynchronously and produces a JSONL file when complete. This pattern elegantly handles millions of items without timeout or memory concerns.'
    },
    {
      id: 'async-apis',
      title: 'Async APIs',
      description: 'Some operations take too long to complete within a single HTTP request-response cycle. Async APIs accept the request immediately (202 Accepted), process it in the background, and provide a mechanism for clients to get the result. The two main patterns are polling (client checks status) and webhooks (server pushes result). Each has trade-offs in complexity, reliability, and developer experience.',
      keyPoints: [
        '202 Accepted: "I got your request and will process it" — return a Location header pointing to the status endpoint',
        'Polling pattern: client calls GET /jobs/:id periodically — simple, no infrastructure, but wastes bandwidth and adds latency',
        'Webhook pattern: server POSTs result to client\'s callback URL — real-time, efficient, but requires client to run an HTTP server',
        'Job status endpoint returns: pending, processing, completed (with result), failed (with error)',
        'Webhook delivery guarantees: at-least-once delivery, client must be idempotent, server retries with exponential backoff',
        'Webhook signature: HMAC-SHA256 of the payload with a shared secret — client must verify to prevent spoofing',
        'Provide both polling AND webhook — let the client choose based on their architecture',
        'For long-running jobs, include progress percentage and estimated time remaining in the status response',
        'Retry-After header in 202 response tells the client how long to wait before first poll'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Async Job Pattern with Polling + Webhook',
          code: `interface AsyncJob<T = unknown> {
  readonly id: string;
  readonly status: 'pending' | 'processing' | 'completed' | 'failed';
  readonly progress?: number;
  readonly result?: T;
  readonly error?: string;
  readonly createdAt: string;
  readonly completedAt?: string;
  readonly webhookUrl?: string;
}

// Submit async job
router.post('/reports/generate', async (req: Request, res: Response) => {
  const job: AsyncJob = {
    id: crypto.randomUUID(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    webhookUrl: req.body.webhookUrl, // optional
  };

  await jobStore.save(job);
  await jobQueue.add('generate-report', { jobId: job.id, params: req.body });

  res.status(202)
    .header('Location', \`/api/v1/jobs/\${job.id}\`)
    .header('Retry-After', '5')
    .json({ data: { jobId: job.id, status: job.status } });
});

// Poll job status
router.get('/jobs/:id', async (req: Request, res: Response) => {
  const job = await jobStore.findById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  if (job.status === 'completed') {
    return res.json({ data: job });
  }
  if (job.status === 'failed') {
    return res.status(422).json({ data: job });
  }

  // Still processing — tell client when to check back
  res.header('Retry-After', '5').json({ data: job });
});

// Webhook delivery (called by job worker on completion)
async function deliverWebhook(job: AsyncJob): Promise<void> {
  if (!job.webhookUrl) return;

  const payload = JSON.stringify({ event: 'job.completed', data: job });
  const signature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');

  await fetch(job.webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': \`sha256=\${signature}\`,
    },
    body: payload,
  });
}`
        }
      ],
      useCases: [
        'Report generation that queries millions of rows and takes minutes',
        'Video/image processing pipelines (transcoding, thumbnail generation)',
        'Data export (CSV/PDF generation for large datasets)',
        'Third-party API calls that are slow or unreliable (payment processing, identity verification)'
      ],
      commonPitfalls: [
        'Not returning 202 — using 200 and making the client wait 30+ seconds for a response that may timeout',
        'No job status endpoint — clients submit a job and have no way to check progress',
        'Webhook without signature verification — anyone can spoof webhook deliveries',
        'Not retrying failed webhook deliveries — if the client\'s server is temporarily down, the notification is lost forever',
        'Polling without Retry-After — clients poll every 100ms and DDoS your status endpoint'
      ],
      interviewTips: [
        'Compare polling vs webhooks: polling is pull (simple, no infrastructure needed), webhooks are push (real-time, but requires receiving server)',
        'Discuss webhook reliability: at-least-once delivery, idempotent handlers, exponential backoff, dead letter queue for permanently failed deliveries',
        'Mention Server-Sent Events (SSE) as a middle ground: server pushes updates, client does not need an HTTP server, works through firewalls',
        'For system design interviews, async patterns come up in any question involving "process millions of X" or "this takes 5 minutes"'
      ],
      relatedConcepts: ['bulk-operations', 'background-jobs', 'idempotency-keys', 'error-handling-standards'],
      difficulty: 'advanced',
      tags: ['async', 'webhook', 'polling', '202-accepted', 'background-processing'],
      proTip: 'GitHub\'s webhook system includes a "Recent Deliveries" tab where you can see every delivery attempt, the payload, the response, and redeliver manually. Build this for your webhooks too — it transforms webhook debugging from impossible to trivial.'
    },
    {
      id: 'request-validation',
      title: 'Request Validation',
      description: 'Request validation is the first line of defense at your API boundary. Every byte of input from a client is untrusted and must be validated before touching your business logic or database. Schema-based validation (Zod, Joi, class-validator) is the modern approach: define the shape once, get type inference, validation, and documentation. Fail fast, fail clearly, and never trust that the client sent what you expect.',
      keyPoints: [
        'Validate at the edge (middleware/controller), not in the service layer — fail fast before any business logic runs',
        'Schema-based validation: define expected shape, get runtime validation + TypeScript types from the same source of truth',
        'Zod (TypeScript), Joi (JavaScript), class-validator (NestJS) — pick one per project and use it everywhere',
        'Fail fast with ALL validation errors, not just the first one — a form with 5 invalid fields should return 5 errors in one response',
        'Type coercion pitfalls: query params are always strings, JSON numbers can be floats — explicitly coerce/parse',
        'Sanitization is NOT validation: sanitize HTML to prevent XSS, but validate that email matches pattern. Do both, separately',
        'Validate headers, query params, path params, AND body — not just body',
        'Set Content-Type expectations: reject requests without proper Content-Type header for body endpoints',
        'Maximum lengths on all string fields — prevents memory exhaustion attacks (POST a 10GB name field)',
        'Allowlist fields, do not denylist — explicitly define what you accept, ignore everything else'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Zod Validation with Express Middleware',
          code: `import { z, ZodError, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Define schema — single source of truth for types + validation
const createUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

// Generic validation middleware
function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        code: e.code,
        message: e.message,
      }));
      return res.status(422).json({
        type: 'https://api.example.com/errors/VALIDATION_ERROR',
        title: 'Validation failed',
        status: 422,
        detail: \`\${fieldErrors.length} validation error(s)\`,
        errors: fieldErrors,
      });
    }
    req.body = result.data; // Replace with parsed + coerced data
    next();
  };
}

// Query param validation (coerce strings to numbers)
const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  sort: z.enum(['name', 'created_at', '-name', '-created_at']).default('-created_at'),
});

function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }
    req.query = result.data;
    next();
  };
}

router.post('/users', validate(createUserSchema), createUser);
router.get('/users', validateQuery(listUsersQuerySchema), listUsers);`
        }
      ],
      useCases: [
        'Every API endpoint that accepts user input — which is all of them',
        'Webhook receivers validating payloads from third-party services',
        'File upload endpoints validating file type, size, and metadata',
        'GraphQL resolvers validating input types beyond what the schema enforces'
      ],
      commonPitfalls: [
        'Validating in the service layer instead of the controller — business logic runs before catching bad input',
        'Returning only the first validation error — the client has to fix and resubmit repeatedly',
        'Not coercing query params from strings — req.query.page is "2" (string), not 2 (number)',
        'Using denylist instead of allowlist — you block "admin" but miss "superadmin"',
        'Trusting Content-Type header without validating the actual body shape',
        'Not setting max length on string fields — memory exhaustion attack vector'
      ],
      interviewTips: [
        'Explain the difference between validation (is this the right shape?) and sanitization (remove dangerous content)',
        'Mention that TypeScript types disappear at runtime — you NEED runtime validation for external input even in TypeScript',
        'Discuss where validation should live in the architecture: at the API boundary, with Zod/Joi as the single source of truth',
        'Talk about the "parse, don\'t validate" philosophy: schema.parse() returns typed data that your functions can trust'
      ],
      relatedConcepts: ['error-handling-standards', 'rest-api-design', 'sql-injection', 'xss-prevention'],
      difficulty: 'intermediate',
      tags: ['validation', 'zod', 'schema', 'input', 'security'],
      proTip: 'Zod\'s .transform() lets you validate AND transform in one pass: z.string().transform(s => s.trim().toLowerCase()). This means your validated data is also normalized — no more "is the email lowercased?" questions downstream.'
    },
  ],
}
