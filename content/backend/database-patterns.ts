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

export const dbPatternsCategory: Category = {
  id: 'database-patterns',
  title: 'Database Patterns',
  description: 'N+1 queries, index internals, transaction isolation, locking strategies, migrations, CQRS, and soft deletes. The patterns that separate "it works in dev" from "it survives production traffic."',
  icon: '🗄️',
  concepts: [
    {
      id: 'n-plus-one-problem',
      title: 'N+1 Problem',
      description: 'The N+1 problem is the most common performance killer in database-backed applications. You execute 1 query to fetch N parent records, then N additional queries to fetch related data for each parent. A page showing 50 blog posts with authors makes 51 queries instead of 2. The fix depends on your stack: JOIN, eager loading, or batching (DataLoader). The hard part is detecting it — in development with 5 records, it is invisible.',
      keyPoints: [
        'Pattern: SELECT posts (1 query) -> for each post, SELECT author WHERE id = post.author_id (N queries) = N+1 total',
        'Fix with JOIN: SELECT posts JOIN authors ON posts.author_id = authors.id — 1 query, all data',
        'Fix with eager loading: ORM-level solution (Prisma: include, Sequelize: include, Django: select_related/prefetch_related)',
        'Fix with DataLoader (GraphQL): batch individual lookups into a single WHERE id IN (...) query per tick of the event loop',
        'Detection: enable query logging in development, use Django Debug Toolbar, Prisma query events, or pg_stat_statements in PostgreSQL',
        'EXPLAIN ANALYZE shows the actual execution — if you see "Nested Loop" with "Index Scan" repeated N times, you have N+1',
        'Even with indexes, N+1 is slow: 50 indexed lookups have 50 round trips to the database, each with network latency',
        'GraphQL is especially susceptible: each resolver fetches independently, creating N+1 patterns naturally. DataLoader is the standard fix',
        'Prisma: use findMany with include, not a loop of findUnique — Prisma does NOT auto-batch by default'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'N+1 Problem and Solutions with Prisma',
          code: `// BAD: N+1 — 1 query for posts + N queries for authors
async function getPostsWithAuthorsBAD() {
  const posts = await prisma.post.findMany(); // 1 query
  const result = [];
  for (const post of posts) {
    const author = await prisma.user.findUnique({
      where: { id: post.authorId }, // N queries!
    });
    result.push({ ...post, author });
  }
  return result;
}

// GOOD: Eager loading — 2 queries total (posts + authors IN (...))
async function getPostsWithAuthorsGOOD() {
  return prisma.post.findMany({
    include: { author: true }, // Prisma generates: SELECT users WHERE id IN (...)
  });
}

// GOOD: DataLoader for GraphQL resolvers
import DataLoader from 'dataloader';

function createUserLoader() {
  return new DataLoader<string, User>(async (userIds) => {
    // One query: SELECT * FROM users WHERE id IN ($1, $2, ...)
    const users = await prisma.user.findMany({
      where: { id: { in: [...userIds] } },
    });
    // DataLoader requires results in the same order as keys
    const userMap = new Map(users.map(u => [u.id, u]));
    return userIds.map(id => userMap.get(id) ?? new Error(\`User \${id} not found\`));
  });
}

// GraphQL resolver
const resolvers = {
  Post: {
    author: (post: Post, _args: unknown, ctx: { userLoader: DataLoader<string, User> }) => {
      return ctx.userLoader.load(post.authorId); // Batched automatically!
    },
  },
};`
        }
      ],
      useCases: [
        'Any list page that displays related data (posts with authors, orders with products)',
        'GraphQL APIs where resolvers fetch data independently',
        'Report generation that aggregates data from multiple tables',
        'API endpoints with include/expand parameters (e.g., GET /orders?include=items,customer)'
      ],
      commonPitfalls: [
        'Not detecting N+1 because dev databases have few records — always log queries in development',
        'Using ORM lazy loading as default — it silently creates N+1 patterns everywhere',
        'Fixing N+1 with a JOIN when a simpler WHERE IN would work — JOINs can over-fetch and create cartesian products',
        'DataLoader only batches within a single tick — if you await inside a loop, batching does not help',
        'Eagerly loading everything "just in case" — over-fetching wastes memory and bandwidth. Load what you need'
      ],
      interviewTips: [
        'Explain with concrete numbers: "50 posts with authors = 51 queries with N+1, 2 queries with eager loading"',
        'Know multiple solutions: JOIN (SQL-level), eager loading (ORM-level), DataLoader (application-level batching)',
        'Mention that DataLoader was created by Facebook specifically to solve N+1 in GraphQL',
        'Discuss detection: query logging, ORM debugging tools, pg_stat_statements for PostgreSQL'
      ],
      relatedConcepts: ['query-optimization', 'orm-pitfalls', 'index-deep-dive'],
      difficulty: 'intermediate',
      tags: ['n+1', 'performance', 'orm', 'query', 'dataloader'],
      proTip: 'Prisma\'s query engine does NOT batch by default. If you call prisma.user.findUnique in a loop, you get N separate queries. Use findMany with WHERE IN, or use the @prisma/client extension for DataLoader-style batching.',
      ascii: `N+1 Problem:
  Query 1: SELECT * FROM posts LIMIT 50           -- 1 query
  Query 2: SELECT * FROM users WHERE id = 1        -- +1
  Query 3: SELECT * FROM users WHERE id = 2        -- +1
  ...                                               -- ...
  Query 51: SELECT * FROM users WHERE id = 50      -- +1
  Total: 51 queries                                 -- N+1!

Fix (eager load):
  Query 1: SELECT * FROM posts LIMIT 50
  Query 2: SELECT * FROM users WHERE id IN (1,2,...,50)
  Total: 2 queries`
    },
    {
      id: 'query-optimization',
      title: 'Query Optimization',
      description: 'Query optimization starts with EXPLAIN ANALYZE — the tool that shows you what the database ACTUALLY does, not what you think it does. Understanding the output (sequential scan vs index scan, nested loop vs hash join, row estimates vs actual rows) is the single most valuable database skill. Slow queries are rarely fixed by adding more hardware — they are fixed by understanding the query plan.',
      keyPoints: [
        'EXPLAIN ANALYZE: shows the query plan WITH actual execution times and row counts — always use ANALYZE, not just EXPLAIN',
        'Sequential Scan: reads every row in the table. Fine for small tables or when you need >10-15% of rows. Terrible for selective queries on large tables',
        'Index Scan: uses an index to find specific rows. The planner chooses this when the query is selective enough and an appropriate index exists',
        'The planner decides based on statistics: table size, column cardinality, data distribution. Run ANALYZE after large data changes to update statistics',
        'Row estimation errors: if EXPLAIN shows "rows=1" but actual is "rows=100000", the planner chose a bad plan. Run ANALYZE or check for skewed data',
        'Nested Loop join: O(n*m) but great when the inner side is indexed and the outer side is small',
        'Hash Join: builds a hash table from the smaller relation, probes with the larger. Best for equi-joins on large tables',
        'Merge Join: requires both sides sorted (or indexed). Best when both sides are large and already sorted',
        'Parallel query: PostgreSQL can parallelize sequential scans, aggregations, and joins. Check max_parallel_workers_per_gather',
        'The most common optimization: add the right index. The second most common: rewrite the query to be sargable (use indexed columns without wrapping them in functions)'
      ],
      codeExamples: [
        {
          language: 'sql',
          label: 'EXPLAIN ANALYZE Reading Guide',
          code: `-- Always use EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) for real investigations
EXPLAIN (ANALYZE, BUFFERS) SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.status = 'active'
  AND u.created_at > '2024-01-01'
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 20;

-- Reading the output (bottom-up):
-- Sort (actual time=45.2..45.3 rows=20)         <- final sort for ORDER BY
--   -> HashAggregate (actual time=44.1..44.8 rows=150)  <- GROUP BY aggregation
--     -> Hash Left Join (actual time=12.3..38.5 rows=5000) <- JOIN
--       -> Index Scan on users_status_created_idx (actual time=0.05..2.1 rows=150) <- filtered users
--       -> Hash (actual time=8.2..8.2 rows=50000) <- hash table of orders
--         -> Seq Scan on orders (actual time=0.01..5.1 rows=50000) <- full table scan

-- Key metrics to check:
-- 1. Actual rows vs estimated rows (big difference = stale statistics)
-- 2. Seq Scan on large tables with WHERE clause = missing index
-- 3. Buffers: shared hit vs shared read (hit = from cache, read = from disk)

-- Non-sargable (cannot use index):
SELECT * FROM users WHERE LOWER(email) = 'test@example.com';
-- Fix: CREATE INDEX idx_users_email_lower ON users (LOWER(email));

-- Sargable (uses index directly):
SELECT * FROM users WHERE email = 'test@example.com';`
        }
      ],
      useCases: [
        'Investigating slow API endpoints — the database query is almost always the bottleneck',
        'Capacity planning — understanding query performance characteristics as data grows',
        'Index selection — EXPLAIN tells you which index to create (or remove)',
        'Debugging production performance regressions after data changes or PostgreSQL upgrades'
      ],
      commonPitfalls: [
        'Using EXPLAIN without ANALYZE — you see the estimated plan, not what actually happened',
        'Adding indexes without checking if they are used — unused indexes slow down writes for zero read benefit',
        'Wrapping indexed columns in functions (WHERE LOWER(email) = ...) — this prevents index usage unless you have a functional index',
        'Not running ANALYZE after large data loads — the planner uses stale statistics and picks bad plans',
        'Premature optimization: adding 10 indexes "just in case" — each index slows writes and uses disk space'
      ],
      interviewTips: [
        'Walk through reading an EXPLAIN ANALYZE output: identify the scan type, join type, and where time is spent',
        'Know when sequential scan is appropriate: small tables, or when you are fetching >10-15% of rows',
        'Explain sargable vs non-sargable predicates: WHERE created_at > X is sargable, WHERE YEAR(created_at) = 2024 is not',
        'Discuss the statistics problem: row estimation errors cause the planner to choose wrong join strategies'
      ],
      relatedConcepts: ['index-deep-dive', 'n-plus-one-problem', 'database-transactions'],
      difficulty: 'advanced',
      tags: ['explain', 'query-plan', 'optimization', 'postgresql', 'performance'],
      proTip: 'PostgreSQL\'s auto_explain extension logs the EXPLAIN output of slow queries automatically. Set auto_explain.log_min_duration = 100 to log any query taking >100ms. This is the fastest way to find slow queries in production without adding application-level monitoring.'
    },
    {
      id: 'index-deep-dive',
      title: 'Index Deep Dive',
      description: 'An index is a data structure that trades write performance and disk space for read performance. B-Tree is the default and handles 90% of cases. But knowing WHEN to use GIN (full-text, JSONB, arrays), GiST (geometric, range types), BRIN (large sorted tables), hash (equality-only), and partial indexes (sparse conditions) is what separates competent from expert database usage.',
      keyPoints: [
        'B-Tree: the default index type. Handles equality (=), range (<, >, BETWEEN), ORDER BY, and prefix LIKE ("abc%"). Use for most columns',
        'Hash Index: equality only (=), no range queries. Slightly faster and smaller than B-Tree for pure equality. PostgreSQL made them crash-safe in v10',
        'GIN (Generalized Inverted Index): for full-text search (tsvector), JSONB containment (@>), array containment (@>), and trigram similarity. Slower to update, faster to query',
        'GiST (Generalized Search Tree): for geometric types (point, box), range types (int4range, tsrange), and full-text search (alternative to GIN, faster updates but slower queries)',
        'BRIN (Block Range Index): for large tables where data is physically sorted (e.g., time-series with created_at). Tiny index size, works by storing min/max per block range',
        'Partial Index: index only rows matching a condition (WHERE status = "active"). Much smaller than a full index, faster to scan and update',
        'Composite Index: (a, b, c) — used for queries on (a), (a, b), or (a, b, c). NOT used for (b, c) alone. Column order matters',
        'Covering Index (INCLUDE): includes extra columns in the index leaf pages for index-only scans — avoids a heap fetch',
        'Unique Index: enforces uniqueness as a constraint. Partial unique index: unique WHERE condition (e.g., unique email WHERE deleted_at IS NULL)',
        'Index maintenance: REINDEX periodically for bloated indexes, monitor with pg_stat_user_indexes to find unused indexes'
      ],
      codeExamples: [
        {
          language: 'sql',
          label: 'Index Types and When to Use Each',
          code: `-- B-Tree: default, handles equality + range + ordering
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_orders_created ON orders (created_at DESC);

-- Composite index: column order matters!
-- Supports: WHERE status = X, WHERE status = X AND created_at > Y
-- Does NOT support: WHERE created_at > Y alone (first column must be in query)
CREATE INDEX idx_users_status_created ON users (status, created_at DESC);

-- Partial index: only index active users (much smaller)
CREATE INDEX idx_users_active_email ON users (email)
WHERE status = 'active';

-- Covering index: include name for index-only scan
CREATE INDEX idx_users_email_covering ON users (email) INCLUDE (name, avatar_url);

-- GIN: JSONB containment queries
CREATE INDEX idx_products_metadata ON products USING GIN (metadata);
-- Query: SELECT * FROM products WHERE metadata @> '{"color": "red"}';

-- GIN: full-text search
CREATE INDEX idx_posts_search ON posts USING GIN (to_tsvector('english', title || ' ' || body));
-- Query: SELECT * FROM posts WHERE to_tsvector('english', title || ' ' || body) @@ to_tsquery('database & optimization');

-- GIN: array containment
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);
-- Query: SELECT * FROM posts WHERE tags @> ARRAY['typescript', 'backend'];

-- BRIN: time-series data (physically sorted by created_at)
CREATE INDEX idx_events_created_brin ON events USING BRIN (created_at);
-- Tiny index: ~1 page per 128 table pages. Perfect for append-only tables.

-- GiST: range types (e.g., reservation date ranges)
CREATE INDEX idx_reservations_dates ON reservations USING GIST (daterange(check_in, check_out));
-- Query: SELECT * FROM reservations WHERE daterange(check_in, check_out) && daterange('2024-06-01', '2024-06-07');

-- Partial unique index: unique email only for non-deleted users
CREATE UNIQUE INDEX idx_users_email_unique ON users (email)
WHERE deleted_at IS NULL;

-- Find unused indexes
SELECT schemaname, indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND indexrelname NOT LIKE '%pkey%'
ORDER BY pg_relation_size(indexrelid) DESC;`
        }
      ],
      useCases: [
        'B-Tree: 90% of your indexes — email lookup, date range queries, pagination',
        'GIN: full-text search, JSONB queries, array membership, tag-based filtering',
        'GiST: geospatial queries ("find restaurants within 5km"), overlapping date ranges',
        'BRIN: time-series data, IoT event logs, any append-only table sorted by time',
        'Partial: indexing only active/recent records in a table with mostly inactive data'
      ],
      commonPitfalls: [
        'Creating composite index (a, b) and expecting it to help queries filtering only on (b) — leftmost prefix rule',
        'Over-indexing: every index slows down INSERT/UPDATE/DELETE and uses disk space. Only index what queries actually need',
        'Not using partial indexes when 90% of rows match one status — a full index is 10x larger than needed',
        'Using B-Tree for JSONB containment queries — use GIN instead',
        'BRIN on randomly ordered data — BRIN only works when data is physically clustered by the indexed column'
      ],
      interviewTips: [
        'Know B-Tree internals at a high level: balanced tree, O(log n) lookup, leaf pages are linked for range scans',
        'Explain the composite index prefix rule: (a, b, c) serves queries on (a), (a, b), (a, b, c), but NOT (b) or (c) alone',
        'Compare GIN vs GiST for full-text search: GIN is faster to query but slower to update (good for read-heavy). GiST is faster to update but slower to query (good for write-heavy)',
        'Discuss covering indexes and index-only scans: the database reads everything it needs from the index without touching the table heap'
      ],
      relatedConcepts: ['query-optimization', 'n-plus-one-problem', 'database-transactions'],
      difficulty: 'advanced',
      tags: ['index', 'b-tree', 'gin', 'gist', 'brin', 'postgresql', 'performance'],
      proTip: 'BRIN indexes are criminally underused. For a time-series table with 100M rows, a B-Tree on created_at might be 2GB. A BRIN index on the same column is ~100KB. If your data is append-only (events, logs, metrics), BRIN is almost always the right choice.'
    },
    {
      id: 'orm-pitfalls',
      title: 'ORM Pitfalls',
      description: 'ORMs (Prisma, TypeORM, Sequelize, Django ORM, SQLAlchemy) are productivity multipliers until they become performance traps. The abstraction leaks in predictable ways: SELECT *, lazy loading N+1, invisible transactions, and query patterns that bypass indexes. The fix is not "abandon ORMs" — it is knowing when the ORM is generating bad SQL and having the skill to drop to raw queries for that 5% of cases.',
      keyPoints: [
        'SELECT * by default: ORMs fetch all columns even when you need 2 — explicitly select fields for list endpoints and joins',
        'Lazy loading is the default N+1 factory: accessing post.author triggers a query. Switch to eager loading for known relationships',
        'Transaction management: some ORMs auto-commit, some auto-wrap in transactions. Know your ORM\'s default behavior',
        'Query logging: ALWAYS enable in development. console.log the generated SQL. You will be surprised',
        'Raw SQL escape hatch: every ORM supports raw queries. Use them for complex reports, CTEs, window functions, and performance-critical paths',
        'ORM-generated queries can bypass indexes: user.find({ where: { LOWER(email): value } }) may not use the email index',
        'Migration pitfalls: ORM auto-generated migrations can create incorrect indexes or miss edge cases. Always review the generated SQL',
        'Serialization: returning ORM entities directly can expose internal fields (passwords, soft-delete flags). Use DTOs/select',
        'Connection pooling: ORMs manage pools, but misconfiguration (too many connections, no timeout) causes production outages'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'ORM Pitfalls and Fixes with Prisma',
          code: `// PITFALL 1: SELECT * — fetching everything
// BAD: returns all 30 columns including large text fields
const users = await prisma.user.findMany();

// GOOD: select only what the API response needs
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true, avatarUrl: true },
});

// PITFALL 2: N+1 with lazy access pattern
// BAD: each iteration triggers a separate query
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } });
  // N+1!
}

// GOOD: eager load in one query
const posts = await prisma.post.findMany({
  include: { author: { select: { id: true, name: true } } },
});

// PITFALL 3: Complex queries that ORMs generate poorly
// BAD: trying to express a CTE or window function through the ORM
// GOOD: use raw SQL for complex analytics
const topUsers = await prisma.$queryRaw\`
  WITH user_stats AS (
    SELECT user_id, COUNT(*) as post_count,
           ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
    FROM posts
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY user_id
  )
  SELECT u.id, u.name, us.post_count, us.rank
  FROM user_stats us
  JOIN users u ON u.id = us.user_id
  WHERE us.rank <= 10
\`;

// PITFALL 4: Not logging queries in development
// Enable Prisma query logging
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
  ],
});
prisma.$on('query', (e) => {
  if (e.duration > 100) { // Log slow queries (>100ms)
    console.warn(\`Slow query (\${e.duration}ms): \${e.query}\`);
  }
});`
        }
      ],
      useCases: [
        'Every project using an ORM — these pitfalls are universal across all ORMs',
        'Performance audits — log queries and check for N+1, SELECT *, missing indexes',
        'Complex reporting features — this is where ORMs break down and raw SQL shines',
        'High-traffic endpoints — ORM overhead (object hydration, lazy loading) adds up at scale'
      ],
      commonPitfalls: [
        'Returning ORM entities directly as API responses — exposing internal fields or triggering lazy loads during serialization',
        'Trusting ORM migrations without reviewing the generated SQL — they can create redundant indexes or miss constraints',
        'Not setting connection pool limits — ORM opens new connections until the database runs out',
        'Using ORM for everything including complex analytics — some queries are 10x faster as raw SQL',
        'Disabling query logging in development — you cannot optimize what you cannot see'
      ],
      interviewTips: [
        'Acknowledge ORMs are useful (productivity, type safety, migrations) while showing you understand the cost',
        'Know when to drop to raw SQL: CTEs, window functions, complex aggregations, bulk operations',
        'Discuss the "80/20 rule": ORMs handle 80% of queries well. Know SQL for the 20% they handle poorly',
        'Mention that Django ORM\'s .only() and .defer() are equivalent to Prisma\'s select — control what fields are fetched'
      ],
      relatedConcepts: ['n-plus-one-problem', 'query-optimization', 'database-transactions'],
      difficulty: 'intermediate',
      tags: ['orm', 'prisma', 'performance', 'sql', 'n+1'],
      proTip: 'Prisma\'s $queryRaw uses tagged template literals for safe parameterization. The query prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}` is NOT vulnerable to SQL injection — Prisma parameterizes it. But prisma.$queryRawUnsafe(string) IS vulnerable. Know the difference.'
    },
    {
      id: 'database-transactions',
      title: 'Database Transactions',
      description: 'A transaction groups multiple operations into an atomic unit: either all succeed (commit) or all fail (rollback). Beyond basic atomicity, understanding isolation levels is critical — they determine what concurrent transactions can see. Read Committed is the default in PostgreSQL and correct for most applications, but Serializable prevents all anomalies at the cost of rollbacks under contention. Savepoints let you partially rollback within a transaction without aborting the whole thing.',
      keyPoints: [
        'ACID: Atomicity (all or nothing), Consistency (valid state to valid state), Isolation (concurrent transactions do not interfere), Durability (committed = permanent)',
        'Read Uncommitted: sees uncommitted changes from other transactions (dirty reads). Almost never used',
        'Read Committed (PostgreSQL default): sees only committed data. Each statement sees a fresh snapshot. Prevents dirty reads',
        'Repeatable Read: snapshot at transaction start. Same query returns same results throughout the transaction. Prevents non-repeatable reads',
        'Serializable: transactions execute as if serial (one at a time). Prevents all anomalies but requires retry logic on serialization failures',
        'Savepoints: create checkpoints within a transaction. SAVEPOINT sp1; ... ROLLBACK TO sp1; continues the transaction without aborting',
        'Optimistic locking: no locks acquired. Read a version number, do work, check version at write time. If changed, retry. Best for low-contention',
        'Pessimistic locking: SELECT FOR UPDATE locks rows for the transaction duration. Other transactions wait (or skip with SKIP LOCKED). Best for high-contention',
        'Deadlock: transaction A locks row 1, waits for row 2. Transaction B locks row 2, waits for row 1. Database detects and aborts one. Always lock in consistent order',
        'Keep transactions short: hold locks for the minimum time. Never do HTTP calls or slow operations inside a transaction'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Transaction Patterns with Prisma and Raw SQL',
          code: `// Prisma interactive transaction
async function transferFunds(fromId: string, toId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    // Pessimistic lock: prevents concurrent modifications
    const [from] = await tx.$queryRaw<Account[]>\`
      SELECT * FROM accounts WHERE id = \${fromId} FOR UPDATE
    \`;
    const [to] = await tx.$queryRaw<Account[]>\`
      SELECT * FROM accounts WHERE id = \${toId} FOR UPDATE
    \`;

    if (from.balance < amount) {
      throw new Error('Insufficient funds');
    }

    await tx.account.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },
    });
    await tx.account.update({
      where: { id: toId },
      data: { balance: { increment: amount } },
    });

    // Create audit record within the same transaction
    await tx.transfer.create({
      data: { fromAccountId: fromId, toAccountId: toId, amount },
    });
  }, {
    isolationLevel: 'Serializable', // strongest isolation
    timeout: 5000, // abort if transaction takes >5s
  });
}

// Optimistic locking pattern
async function updateProductStock(
  productId: string,
  quantityDelta: number,
  expectedVersion: number
): Promise<Product> {
  const updated = await prisma.product.updateMany({
    where: {
      id: productId,
      version: expectedVersion, // compare-and-swap
    },
    data: {
      stock: { increment: quantityDelta },
      version: { increment: 1 },
    },
  });

  if (updated.count === 0) {
    throw new ConflictError('Product was modified by another transaction. Please retry.');
  }

  return prisma.product.findUniqueOrThrow({ where: { id: productId } });
}

// Retry wrapper for optimistic locking
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof ConflictError && attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.random() * 100 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}`
        }
      ],
      useCases: [
        'Financial operations (transfers, payments) — atomicity is non-negotiable',
        'Inventory management — prevent overselling with locking',
        'User registration — create user + create default settings + send welcome email as one atomic operation',
        'Any operation that modifies multiple tables and must be all-or-nothing'
      ],
      commonPitfalls: [
        'Doing HTTP calls inside a transaction — the external call is slow and you hold locks the entire time',
        'Not handling deadlocks — always implement retry logic for Serializable or pessimistic locking',
        'Using Serializable everywhere "for safety" — it causes frequent rollbacks under contention. Use it only when needed',
        'Forgetting that ORMs may auto-commit — each Prisma operation is its own transaction unless you use $transaction',
        'Long-running transactions holding locks for minutes — other transactions queue up and the application appears frozen'
      ],
      interviewTips: [
        'Know all four isolation levels and what anomalies each prevents: dirty read, non-repeatable read, phantom read, serialization anomaly',
        'Explain optimistic vs pessimistic locking with concrete examples: optimistic for shopping cart (low contention), pessimistic for bank transfer (high contention)',
        'Draw a deadlock scenario and explain how databases detect and resolve them',
        'Discuss the MVCC model in PostgreSQL: readers do not block writers, writers do not block readers — each transaction sees a snapshot'
      ],
      relatedConcepts: ['optimistic-locking', 'pessimistic-locking', 'query-optimization'],
      difficulty: 'advanced',
      tags: ['transaction', 'acid', 'isolation', 'locking', 'deadlock', 'postgresql'],
      proTip: 'PostgreSQL\'s Serializable Snapshot Isolation (SSI) is not row-level locking — it is a smarter mechanism that detects serialization anomalies and aborts one transaction. This means Serializable in PostgreSQL is much more concurrent than "true" serial execution. But you MUST implement retry logic.'
    },
    {
      id: 'optimistic-locking',
      title: 'Optimistic Locking',
      description: 'Optimistic locking assumes conflicts are rare. Instead of locking rows, you read a version number (or timestamp), do your work, and at write time check that the version has not changed. If it has, someone else modified the row — you retry. This pattern avoids holding database locks, making it ideal for low-contention scenarios like shopping carts, content editing, and configuration updates.',
      keyPoints: [
        'Add a version column (integer or timestamp) to the table — increment it on every update',
        'Read: fetch the row including its version. Write: UPDATE ... WHERE id = X AND version = Y. If 0 rows updated, conflict detected',
        'Compare-and-swap (CAS): the atomic check-and-update in one SQL statement is the core mechanism',
        'Retry loop: on conflict, re-read the latest data, re-apply the change, retry. Limit retries (3-5) to prevent infinite loops',
        'No database locks held: other transactions proceed without waiting. Best for read-heavy, low-write-contention workloads',
        'Lost Update problem: two users edit the same document, last write wins. Optimistic locking detects this and forces a retry',
        'For HTTP APIs: include the version in the ETag header. Client sends If-Match: "v5", server checks. 412 Precondition Failed on mismatch',
        'Prisma: use updateMany with version in the where clause — if count is 0, conflict occurred',
        'Timestamp-based: use updated_at instead of an integer version. Simpler but vulnerable to clock skew in distributed systems'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Optimistic Locking with ETag Headers',
          code: `// Database model has a 'version' column (integer, default 1)

// GET /products/:id — return version as ETag
router.get('/products/:id', async (req: Request, res: Response) => {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: req.params.id },
  });
  res.set('ETag', \`"\${product.version}"\`);
  res.json({ data: product });
});

// PATCH /products/:id — require If-Match header
router.patch('/products/:id', async (req: Request, res: Response) => {
  const ifMatch = req.headers['if-match'];
  if (!ifMatch) {
    return res.status(428).json({ error: 'If-Match header required' });
  }

  const expectedVersion = parseInt(ifMatch.replace(/"/g, ''), 10);

  // Atomic compare-and-swap
  const updated = await prisma.product.updateMany({
    where: {
      id: req.params.id,
      version: expectedVersion,
    },
    data: {
      ...req.body,
      version: { increment: 1 },
    },
  });

  if (updated.count === 0) {
    // Could be: wrong version (conflict) or not found
    const exists = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!exists) return res.status(404).json({ error: 'Not found' });

    return res.status(409).json({
      error: 'Conflict',
      detail: 'Resource was modified by another request. Re-fetch and retry.',
      currentVersion: exists.version,
    });
  }

  const product = await prisma.product.findUniqueOrThrow({ where: { id: req.params.id } });
  res.set('ETag', \`"\${product.version}"\`);
  res.json({ data: product });
});`
        }
      ],
      useCases: [
        'Shopping cart updates — multiple tabs open, low risk of true conflict',
        'CMS content editing — two editors working on different sections of the same document',
        'Configuration management — admin updates settings, rare concurrent modification',
        'Any CRUD API where concurrent writes are possible but unlikely'
      ],
      commonPitfalls: [
        'Forgetting to increment the version — the optimistic lock never triggers',
        'Not implementing retry logic — a single conflict crashes the operation instead of retrying',
        'Using timestamps for versioning in distributed systems — clock skew can cause false positives or missed conflicts',
        'Infinite retry loops — always cap retries and return an error after max attempts',
        'Not returning the current version on conflict — the client has to make an extra request to re-fetch'
      ],
      interviewTips: [
        'Compare with pessimistic locking: optimistic = no locks, detect conflict at write time, retry. Pessimistic = lock at read time, prevent conflict',
        'Explain when each is better: optimistic for low contention (most web apps), pessimistic for high contention (financial transactions)',
        'Mention HTTP 412 Precondition Failed and ETag/If-Match as the HTTP-level implementation of optimistic locking',
        'Know that JPA/Hibernate has @Version annotation, Django has F() expressions, Prisma uses updateMany with version filter'
      ],
      relatedConcepts: ['pessimistic-locking', 'database-transactions', 'rest-api-design'],
      difficulty: 'intermediate',
      tags: ['optimistic-locking', 'version', 'concurrency', 'cas', 'etag'],
      proTip: 'For REST APIs, the ETag + If-Match pattern gives you optimistic locking "for free" using standard HTTP headers. Clients that support ETags get conflict detection automatically, and clients that ignore them get last-write-wins behavior. Progressive enhancement at the protocol level.'
    },
    {
      id: 'pessimistic-locking',
      title: 'Pessimistic Locking',
      description: 'Pessimistic locking acquires a database lock BEFORE modifying data, preventing other transactions from reading or writing the locked rows until the lock is released. SELECT FOR UPDATE is the primary mechanism. It guarantees no concurrent modification but reduces throughput because transactions wait. The killer feature is SKIP LOCKED — it turns pessimistic locking into an efficient job queue by skipping already-locked rows.',
      keyPoints: [
        'SELECT FOR UPDATE: locks the selected rows. Other transactions trying to SELECT FOR UPDATE the same rows will WAIT',
        'SELECT FOR UPDATE NOWAIT: immediately fails with an error if the row is already locked — no waiting, fast failure',
        'SELECT FOR UPDATE SKIP LOCKED: skips rows that are already locked by another transaction — perfect for job queues!',
        'Lock escalation: in PostgreSQL, row-level locks do not escalate to table-level locks. MySQL InnoDB can escalate under pressure',
        'Advisory locks: application-defined locks (pg_advisory_lock) — not tied to specific rows, useful for named mutex patterns',
        'Lock ordering: always acquire locks in a consistent order (e.g., by ID ascending) to prevent deadlocks',
        'Lock duration: locks are held until COMMIT or ROLLBACK — keep transactions short!',
        'FOR NO KEY UPDATE: weaker lock that allows concurrent inserts of rows referencing the locked row (foreign key operations)',
        'FOR SHARE: shared lock — multiple transactions can hold it simultaneously, but none can UPDATE. Use for consistent reads'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Pessimistic Locking Patterns',
          code: `// Pattern 1: Bank transfer with pessimistic locking
async function transferFunds(fromId: string, toId: string, amount: number) {
  // Lock in consistent order (by ID) to prevent deadlocks
  const [firstId, secondId] = fromId < toId ? [fromId, toId] : [toId, fromId];

  return prisma.$transaction(async (tx) => {
    // Acquire locks in deterministic order
    await tx.$queryRaw\`SELECT 1 FROM accounts WHERE id = \${firstId} FOR UPDATE\`;
    await tx.$queryRaw\`SELECT 1 FROM accounts WHERE id = \${secondId} FOR UPDATE\`;

    const from = await tx.account.findUniqueOrThrow({ where: { id: fromId } });
    if (from.balance < amount) throw new Error('Insufficient funds');

    await tx.account.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },
    });
    await tx.account.update({
      where: { id: toId },
      data: { balance: { increment: amount } },
    });
  });
}

// Pattern 2: Job queue with SKIP LOCKED
async function claimNextJob(): Promise<Job | null> {
  const jobs = await prisma.$queryRaw<Job[]>\`
    UPDATE jobs
    SET status = 'processing', claimed_at = NOW(), worker_id = \${workerId}
    WHERE id = (
      SELECT id FROM jobs
      WHERE status = 'pending'
      ORDER BY priority DESC, created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *
  \`;
  return jobs[0] ?? null;
}

// Pattern 3: Advisory lock for distributed mutex
async function withAdvisoryLock<T>(
  lockKey: string,
  fn: () => Promise<T>
): Promise<T> {
  const lockId = hashStringToInt(lockKey); // deterministic int from string

  // Try to acquire (non-blocking)
  const [{ acquired }] = await prisma.$queryRaw<[{ acquired: boolean }]>\`
    SELECT pg_try_advisory_lock(\${lockId}) as acquired
  \`;

  if (!acquired) {
    throw new Error('Could not acquire lock — another process holds it');
  }

  try {
    return await fn();
  } finally {
    await prisma.$queryRaw\`SELECT pg_advisory_unlock(\${lockId})\`;
  }
}`
        }
      ],
      useCases: [
        'Financial transactions where concurrent modification is dangerous and common',
        'Job queues using SKIP LOCKED — simple, reliable, no external dependencies (Redis/RabbitMQ)',
        'Inventory reservation where overselling has real costs',
        'Distributed mutex using advisory locks — e.g., only one instance runs a migration'
      ],
      commonPitfalls: [
        'Acquiring locks in inconsistent order — deadlocks. Always lock by a deterministic ordering (e.g., sort by ID)',
        'Long-running transactions with FOR UPDATE — other transactions queue up and the application freezes',
        'Not using SKIP LOCKED for queue patterns — workers wait for each other instead of processing independent items',
        'Forgetting that locks are released on COMMIT/ROLLBACK — an error without rollback can leave locks hanging',
        'Using advisory locks without cleanup in error paths — the lock persists for the session duration'
      ],
      interviewTips: [
        'Explain SKIP LOCKED and why it makes PostgreSQL a viable job queue: workers grab unlocked rows, skip locked ones, no waiting',
        'Draw a deadlock scenario with two transactions and explain how consistent lock ordering prevents it',
        'Compare FOR UPDATE (exclusive) vs FOR SHARE (shared) — FOR SHARE allows concurrent reads, FOR UPDATE blocks everything',
        'Discuss when pessimistic locking is better than optimistic: high contention, where retries are expensive or undesirable'
      ],
      relatedConcepts: ['optimistic-locking', 'database-transactions', 'background-jobs'],
      difficulty: 'advanced',
      tags: ['pessimistic-locking', 'select-for-update', 'skip-locked', 'advisory-lock', 'deadlock'],
      proTip: 'PostgreSQL with SKIP LOCKED is a legitimate job queue for moderate scale (thousands of jobs/second). It is transactional (job claim and processing are atomic), requires no extra infrastructure, and supports priority queues. Only move to Redis/RabbitMQ when you need higher throughput or cross-database distribution.'
    },
    {
      id: 'database-migrations',
      title: 'Database Migrations',
      description: 'Database migrations are version-controlled changes to your schema. They allow your schema to evolve alongside your application code. The critical skill is zero-downtime migrations — the expand-contract pattern that lets you change a column type, rename a table, or add a NOT NULL constraint without taking your application offline. This is the difference between "we deploy during maintenance windows" and "we deploy 50 times a day."',
      keyPoints: [
        'Migrations are ordered, immutable scripts: each migration runs once, in order. Never modify a migration that has been applied to production',
        'Tools: Prisma Migrate, Flyway, Liquibase, Alembic (Python), ActiveRecord migrations (Ruby), Knex migrations (Node)',
        'Backward compatibility: the migration must work with BOTH the old and new application versions during deployment',
        'Zero-downtime rename: 1) Add new column, 2) Write to both old and new, 3) Backfill new from old, 4) Switch reads to new, 5) Stop writing to old, 6) Drop old column',
        'Adding NOT NULL constraint: 1) Add column as nullable, 2) Backfill existing rows, 3) Add NOT NULL constraint with ALTER TABLE ... SET NOT NULL',
        'Large table migrations: ALTER TABLE on a 100M row table locks it. Use pt-online-schema-change (MySQL) or pg_repack (PostgreSQL) for lock-free changes',
        'Data migrations vs schema migrations: schema changes the structure, data populates or transforms values. Keep them separate when possible',
        'Always test migrations on a production-sized dataset — a migration that takes 100ms on dev data can take 2 hours on production',
        'Rollback strategy: write a down migration for every up migration, OR use the expand-contract pattern where rollback is just not completing the contract phase'
      ],
      codeExamples: [
        {
          language: 'sql',
          label: 'Zero-Downtime Column Rename (Expand-Contract)',
          code: `-- Phase 1: EXPAND — add new column alongside old one
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Phase 2: DUAL-WRITE — application writes to both columns
-- (deploy application code that writes to both 'name' and 'full_name')

-- Phase 3: BACKFILL — copy existing data
UPDATE users SET full_name = name WHERE full_name IS NULL;
-- For large tables, do this in batches:
-- UPDATE users SET full_name = name WHERE full_name IS NULL AND id BETWEEN 1 AND 10000;
-- UPDATE users SET full_name = name WHERE full_name IS NULL AND id BETWEEN 10001 AND 20000;

-- Phase 4: SWITCH READS — application reads from new column
-- (deploy application code that reads from 'full_name')

-- Phase 5: CONTRACT — remove old column
ALTER TABLE users DROP COLUMN name;

-- Adding NOT NULL to an existing column (zero-downtime)
-- Step 1: Add constraint as NOT VALID (does not scan existing rows)
ALTER TABLE users ADD CONSTRAINT users_full_name_not_null
  CHECK (full_name IS NOT NULL) NOT VALID;

-- Step 2: Validate existing rows (non-blocking in PostgreSQL 12+)
ALTER TABLE users VALIDATE CONSTRAINT users_full_name_not_null;

-- Step 3: Optionally convert to column-level NOT NULL
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE users DROP CONSTRAINT users_full_name_not_null;`
        }
      ],
      useCases: [
        'Every application with a database — migrations are fundamental to schema evolution',
        'Continuous deployment pipelines — migrations run automatically before new code deploys',
        'Multi-service architectures — shared database schema changes must be backward compatible',
        'Compliance environments — migration history provides an audit trail of schema changes'
      ],
      commonPitfalls: [
        'Modifying a migration after it has been applied to any environment — creates divergence between environments',
        'Running ALTER TABLE on large tables without testing — a 30-second lock on a 100M row table causes a production outage',
        'Not writing backward-compatible migrations — old application version crashes when deployment is in progress',
        'Skipping the backfill step in expand-contract — new column is NULL for all existing rows',
        'Running data migrations in the same transaction as schema migrations — transaction holds locks while processing millions of rows'
      ],
      interviewTips: [
        'Walk through the expand-contract pattern step by step for renaming a column without downtime',
        'Explain why you cannot just ALTER TABLE RENAME COLUMN in a zero-downtime deployment — old application code references the old name',
        'Discuss how to handle large table migrations: batched updates, online schema change tools, CREATE INDEX CONCURRENTLY',
        'Mention that Prisma Migrate, Flyway, and Alembic all track applied migrations in a metadata table — they know which migrations have run'
      ],
      relatedConcepts: ['database-transactions', 'cqrs-db-level', 'soft-delete'],
      difficulty: 'advanced',
      tags: ['migration', 'zero-downtime', 'expand-contract', 'schema', 'deployment'],
      proTip: 'In PostgreSQL, CREATE INDEX is blocking by default — it locks the table for the entire build time. Always use CREATE INDEX CONCURRENTLY for production tables. It takes longer and uses more resources, but it does not block reads or writes.'
    },
    {
      id: 'cqrs-db-level',
      title: 'CQRS at DB Level',
      description: 'Command Query Responsibility Segregation (CQRS) at the database level means using separate models for reads and writes. The write model is normalized (3NF, no redundancy, enforces constraints). The read model is denormalized (materialized views, pre-joined tables, optimized for specific queries). This is not about separate databases (though it can be) — it is about recognizing that the optimal structure for writing data is different from the optimal structure for reading it.',
      keyPoints: [
        'Write model: normalized tables with foreign keys, constraints, and indexes optimized for writes',
        'Read model: denormalized views or materialized views optimized for specific query patterns',
        'Materialized view: a cached query result stored as a table. REFRESH MATERIALIZED VIEW to update. CONCURRENTLY for non-blocking refresh',
        'Views vs Materialized Views: views re-execute the query every time (always fresh). Materialized views are cached (stale until refreshed)',
        'Event sourcing + CQRS: write model is an append-only event log. Read models (projections) are built by replaying events into denormalized tables',
        'Staleness trade-off: read model is eventually consistent with the write model. Acceptable for dashboards, search, analytics. Not acceptable for financial balances',
        'Update strategies: periodic refresh (every N minutes), on-demand refresh (on write), CDC-based refresh (triggered by database change events)',
        'Database triggers can update read models synchronously — but this couples writes to read model updates and slows down writes',
        'For most applications, a materialized view with periodic refresh is the right starting point — it is simple and effective'
      ],
      codeExamples: [
        {
          language: 'sql',
          label: 'CQRS with Materialized Views',
          code: `-- Write model: normalized tables
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL
);

-- Read model: materialized view for dashboard
CREATE MATERIALIZED VIEW user_order_summary AS
SELECT
  u.id AS user_id,
  u.name,
  u.email,
  COUNT(o.id) AS total_orders,
  COALESCE(SUM(o.total_amount), 0) AS lifetime_value,
  MAX(o.created_at) AS last_order_at,
  CASE
    WHEN MAX(o.created_at) > NOW() - INTERVAL '30 days' THEN 'active'
    WHEN MAX(o.created_at) > NOW() - INTERVAL '90 days' THEN 'at_risk'
    ELSE 'churned'
  END AS customer_status
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'completed'
GROUP BY u.id, u.name, u.email;

-- Index the read model for fast lookups
CREATE UNIQUE INDEX idx_user_order_summary_id ON user_order_summary (user_id);
CREATE INDEX idx_user_order_summary_status ON user_order_summary (customer_status);

-- Refresh (non-blocking — requires UNIQUE index)
REFRESH MATERIALIZED VIEW CONCURRENTLY user_order_summary;

-- Schedule refresh with pg_cron (PostgreSQL extension)
-- SELECT cron.schedule('refresh-user-summary', '*/5 * * * *',
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY user_order_summary');`
        }
      ],
      useCases: [
        'Dashboards and analytics — pre-compute expensive aggregations instead of running them on every request',
        'Search results with complex filters — denormalized search table is faster than multi-table joins',
        'Leaderboards and rankings — materialized view with pre-computed scores',
        'Reporting APIs that need sub-second response times on complex queries'
      ],
      commonPitfalls: [
        'Using CQRS when a simple index would suffice — CQRS adds complexity, use it only when reads and writes have genuinely different optimal structures',
        'Not refreshing materialized views frequently enough — stale data confuses users',
        'Refreshing materialized views synchronously on every write — this negates the performance benefit',
        'Forgetting CONCURRENTLY in REFRESH — without it, the materialized view is locked during refresh and reads block',
        'Not indexing the materialized view — a materialized view without indexes is just a slow table'
      ],
      interviewTips: [
        'Explain CQRS with a concrete example: write-normalized orders table, read-denormalized user dashboard view',
        'Discuss the consistency trade-off: read model is eventually consistent. This is fine for analytics, not for account balance',
        'Compare approaches: materialized views (simplest), application-level denormalization (more control), event sourcing + projections (most flexible, most complex)',
        'Mention that you do not need event sourcing to do CQRS — a materialized view over normalized tables is already CQRS'
      ],
      relatedConcepts: ['query-optimization', 'database-transactions', 'cache-invalidation-strategies'],
      difficulty: 'advanced',
      tags: ['cqrs', 'materialized-view', 'denormalization', 'read-model', 'performance'],
      proTip: 'PostgreSQL materialized views with REFRESH CONCURRENTLY require a unique index but allow reads during refresh. Schedule refreshes with pg_cron (every 5 minutes for dashboards, every hour for analytics). This handles 90% of CQRS use cases without event sourcing complexity.'
    },
    {
      id: 'soft-delete',
      title: 'Soft Delete',
      description: 'Soft delete marks records as deleted (deleted_at timestamp) instead of removing them from the database. It enables undo, audit trails, and data recovery. But it comes with hidden complexity: every query must filter out deleted records, unique constraints become partial, and data accumulates forever. The alternative — hard delete with an audit log — is simpler and often better. Choose deliberately, not by default.',
      keyPoints: [
        'Implementation: add deleted_at TIMESTAMPTZ column (NULL = active, timestamp = deleted). Prefer timestamp over boolean for audit trail',
        'Every query on the table must include WHERE deleted_at IS NULL — miss one and you show "deleted" data to users',
        'ORM middleware: Prisma middleware, Django managers, Sequelize paranoid mode — auto-filter deleted records on all queries',
        'Unique constraints break: two users with the same email, one deleted. Fix: partial unique index WHERE deleted_at IS NULL',
        'Foreign key complexity: deleting a parent with soft delete leaves children referencing a "deleted" record. CASCADE does not trigger on soft delete',
        'Data accumulation: soft-deleted records grow forever. Implement an archival strategy: move to archive table after N days, then hard delete',
        'Hard delete + audit log alternative: actually DELETE the row, but first write a copy to an audit/history table. Simpler queries, no filter pollution',
        'Partial index for performance: CREATE INDEX idx_users_active ON users (email) WHERE deleted_at IS NULL — index only active rows',
        'GDPR/data retention: soft delete does NOT satisfy "right to erasure" — you must eventually hard delete personal data'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Soft Delete with Prisma Middleware',
          code: `// Prisma middleware for automatic soft delete filtering
prisma.$use(async (params, next) => {
  // Intercept findMany, findFirst, count — add deleted_at filter
  if (['findMany', 'findFirst', 'findFirstOrThrow', 'count'].includes(params.action)) {
    if (!params.args) params.args = {};
    if (!params.args.where) params.args.where = {};
    if (params.args.where.deleted_at === undefined) {
      params.args.where.deleted_at = null; // only active records
    }
  }

  // Intercept delete — convert to soft delete
  if (params.action === 'delete') {
    params.action = 'update';
    params.args.data = { deleted_at: new Date() };
  }
  if (params.action === 'deleteMany') {
    params.action = 'updateMany';
    if (!params.args) params.args = {};
    params.args.data = { deleted_at: new Date() };
  }

  return next(params);
});

// Hard delete + audit log alternative (often simpler)
async function deleteUserWithAudit(userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

    // Write to audit log first
    await tx.auditLog.create({
      data: {
        entityType: 'user',
        entityId: userId,
        action: 'DELETE',
        previousData: user as unknown as Prisma.JsonObject,
        performedBy: getCurrentUserId(),
      },
    });

    // Actually delete — clean, simple, no filter pollution
    await tx.user.delete({ where: { id: userId } });
  });
}

// Partial unique index in migration
// CREATE UNIQUE INDEX idx_users_email_active
//   ON users (email) WHERE deleted_at IS NULL;`
        }
      ],
      useCases: [
        'Applications requiring undo functionality — user accidentally deletes something, admin restores it',
        'Compliance requiring data retention — financial records that must be kept for 7 years',
        'Multi-tenant applications where "deleting" a tenant means deactivating, not destroying data',
        'Content management systems where "trash" and "restore" are core features'
      ],
      commonPitfalls: [
        'Forgetting to filter deleted records in ONE query — data leak that shows "deleted" items to users',
        'Unique constraint on email without partial index — cannot re-create a user with the same email after soft delete',
        'Never archiving soft-deleted records — table grows forever, queries slow down, storage costs increase',
        'Treating soft delete as GDPR compliant — it is not. "Right to erasure" requires actual deletion of personal data',
        'Foreign key cascades not triggered — soft deleting a parent leaves orphaned children that reference a "deleted" record'
      ],
      interviewTips: [
        'Present both options: soft delete (deleted_at) and hard delete + audit log. Explain when each is appropriate',
        'Discuss the hidden cost: every query, every index, every unique constraint must account for the deleted_at column',
        'Mention partial indexes as the solution to unique constraint issues with soft delete',
        'Know that GDPR right to erasure requires eventual hard deletion — soft delete alone is not compliant'
      ],
      relatedConcepts: ['database-migrations', 'database-transactions', 'index-deep-dive'],
      difficulty: 'intermediate',
      tags: ['soft-delete', 'audit', 'deletion', 'gdpr', 'data-retention'],
      proTip: 'If you choose soft delete, use Prisma middleware or Django\'s custom manager to make WHERE deleted_at IS NULL automatic. But seriously consider hard delete + audit log instead — it is simpler, queries are cleaner, and the audit table naturally stores the historical record without polluting your main tables.'
    },
  ],
}
