// @ts-nocheck
import type { Category } from '@/lib/types'

export const databasesCategory: Category = {
  id: 'databases',
  title: 'Databases',
  description: 'Deep dive into database internals — ACID guarantees, indexing strategies, replication, sharding, and choosing the right database for the job.',
  icon: 'Database',
  concepts: [
    {
      id: 'acid-properties',
      title: 'ACID Properties',
      description: 'ACID is the contract that relational databases make with you. Understanding the implementation details — WAL, undo logs, isolation levels, fsync — is what separates a senior engineer from someone who just read the Wikipedia page.',
      keyPoints: [
        'Atomicity: all-or-nothing — implemented via Write-Ahead Log (WAL) and undo logs for rollback',
        'Consistency: every transaction moves the DB from one valid state to another — enforced by constraints (FK, CHECK, UNIQUE)',
        'Isolation: concurrent transactions don\'t interfere — implemented via locks (2PL) or MVCC',
        'Durability: committed data survives crashes — implemented via fsync to disk and WAL',
        'WAL (Write-Ahead Log): write the change to the log BEFORE writing to data pages — crash recovery replays the log',
        'Group commit: batch multiple transaction WAL entries into a single fsync — huge performance win (10x throughput)',
        'Undo log: stores old values for rollback — also used for MVCC read consistency',
      ],
      codeExamples: [
        {
          language: 'sql',
          label: 'ACID in Practice — Transaction with Constraints',
          code: `-- Atomicity: both operations succeed or both fail
BEGIN;

UPDATE accounts SET balance = balance - 100.00
WHERE id = 'sender_123'
AND balance >= 100.00;  -- Consistency: prevent negative balance

UPDATE accounts SET balance = balance + 100.00
WHERE id = 'receiver_456';

-- If either UPDATE fails, ROLLBACK undoes everything
COMMIT;  -- Durability: after COMMIT returns, data is on disk

-- WAL sequence for this transaction:
-- 1. WAL: BEGIN txn_789
-- 2. WAL: UPDATE accounts SET balance=900 WHERE id='sender_123' (old=1000)
-- 3. WAL: UPDATE accounts SET balance=600 WHERE id='receiver_456' (old=500)
-- 4. WAL: COMMIT txn_789
-- 5. fsync WAL to disk
-- 6. Return "COMMIT" to client
-- 7. (Later) Write dirty pages to data files (checkpoint)`,
        },
      ],
      useCases: [
        'Financial transactions: bank transfers, payment processing (cannot lose money)',
        'Inventory management: decrement stock atomically with order creation',
        'User registration: create user + send welcome email in a reliable way (though email is a separate concern)',
      ],
      commonPitfalls: [
        'Assuming ACID means "safe" without understanding isolation levels — default READ COMMITTED allows non-repeatable reads',
        'Disabling fsync for performance and losing data on crash — PostgreSQL fsync=off is for benchmarking only',
        'Long-running transactions holding locks — blocks other transactions, causes deadlocks',
        'Not understanding that ACID only applies within a single database — cross-database needs distributed transactions or sagas',
      ],
      interviewTips: [
        'Explain each letter with implementation details, not just definitions',
        'Mention WAL specifically — it shows you understand how durability actually works',
        'Discuss the performance cost of ACID: synchronous fsync, locking overhead, constraint checks',
      ],
      relatedConcepts: ['isolation-levels-deep-dive', 'write-ahead-log', 'base-properties'],
      difficulty: 'intermediate',
      tags: ['databases', 'transactions', 'fundamentals'],
      proTip: 'PostgreSQL\'s MVCC means readers never block writers and writers never block readers. This is why Postgres can handle high-concurrency OLTP — it achieves isolation without read locks by keeping multiple versions of each row.',
    },
    {
      id: 'isolation-levels-deep-dive',
      title: 'Isolation Levels Deep Dive',
      description: 'Isolation levels are a spectrum of trade-offs between correctness and performance. Most production bugs from concurrent transactions come from using the wrong isolation level — usually because the developer assumed SERIALIZABLE when the DB defaults to READ COMMITTED.',
      keyPoints: [
        'READ UNCOMMITTED: see uncommitted changes from other transactions (dirty reads) — almost never used',
        'READ COMMITTED (Postgres default): only see committed data, but same query can return different results within a transaction (non-repeatable read)',
        'REPEATABLE READ (MySQL default): snapshot at transaction start, no non-repeatable reads, but phantom reads possible in standard SQL (Postgres actually prevents phantoms at this level)',
        'SERIALIZABLE: transactions behave as if executed one at a time — prevents all anomalies but highest lock contention',
        'Dirty read: reading data that another transaction has written but not committed',
        'Non-repeatable read: reading the same row twice in a transaction and getting different values',
        'Phantom read: a range query returns different rows the second time because another transaction inserted/deleted',
        'Write skew: two transactions read the same data, make decisions based on it, and write conflicting results (only SERIALIZABLE prevents this)',
        'Lost update: two transactions read-modify-write the same row, one update is lost',
      ],
      codeExamples: [
        {
          language: 'sql',
          label: 'Isolation Level Anomalies',
          code: `-- WRITE SKEW EXAMPLE (not prevented by REPEATABLE READ)
-- Rule: at least one doctor must be on call

-- Transaction A:                    -- Transaction B:
BEGIN;                               BEGIN;
SET TRANSACTION ISOLATION LEVEL      SET TRANSACTION ISOLATION LEVEL
  REPEATABLE READ;                     REPEATABLE READ;

SELECT count(*) FROM doctors         SELECT count(*) FROM doctors
WHERE on_call = true;                WHERE on_call = true;
-- Returns 2                         -- Returns 2

UPDATE doctors SET on_call = false   UPDATE doctors SET on_call = false
WHERE id = 'alice';                  WHERE id = 'bob';
-- Still 1 on call (bob)             -- Still 1 on call (alice)

COMMIT;                              COMMIT;
-- RESULT: 0 doctors on call! Constraint violated.
-- Fix: use SERIALIZABLE or explicit SELECT ... FOR UPDATE

-- CORRECT: Prevent write skew with FOR UPDATE
BEGIN;
SELECT count(*) FROM doctors
WHERE on_call = true
FOR UPDATE;  -- Lock the rows
-- Now Transaction B blocks until A commits
UPDATE doctors SET on_call = false WHERE id = 'alice';
COMMIT;`,
        },
      ],
      ascii: `
  Isolation Level    | Dirty | Non-Repeatable | Phantom | Write
                     | Read  | Read           | Read    | Skew
  ───────────────────┼───────┼────────────────┼─────────┼──────
  READ UNCOMMITTED   |  Yes  |     Yes        |   Yes   |  Yes
  READ COMMITTED     |  No   |     Yes        |   Yes   |  Yes
  REPEATABLE READ    |  No   |     No         |  Yes*   |  Yes
  SERIALIZABLE       |  No   |     No         |   No    |  No

  * Postgres REPEATABLE READ actually prevents phantom reads
    (uses Serializable Snapshot Isolation internally)`,
      useCases: [
        'READ COMMITTED: most web applications — good default, minimal lock contention',
        'REPEATABLE READ: reporting queries that need consistent snapshots, financial calculations',
        'SERIALIZABLE: booking systems, inventory, anything where write skew causes business logic errors',
      ],
      commonPitfalls: [
        'Assuming your DB is SERIALIZABLE by default — Postgres defaults to READ COMMITTED, MySQL to REPEATABLE READ',
        'Using SERIALIZABLE everywhere "to be safe" — massive performance hit from serialization failures and retries',
        'Not retrying serialization failures: SERIALIZABLE can abort your transaction with a 40001 error — you MUST retry',
        'Testing with single-user and not catching concurrency bugs that only appear under load',
      ],
      interviewTips: [
        'Draw the anomaly prevention table from memory — it is a classic interview question',
        'Use the write skew example (doctors on call) — it is the most practical and memorable',
        'Mention that Postgres REPEATABLE READ is actually closer to SERIALIZABLE than the SQL standard requires',
      ],
      relatedConcepts: ['acid-properties', 'database-indexing', 'distributed-locking'],
      difficulty: 'advanced',
      tags: ['databases', 'transactions', 'concurrency'],
      proTip: 'CockroachDB defaults to SERIALIZABLE isolation with minimal performance penalty using timestamp ordering. If you need true serializability at scale, it is the easiest path — no need to carefully reason about which isolation level is "good enough" for each query.',
    },
    {
      id: 'base-properties',
      title: 'BASE Properties',
      description: 'BASE (Basically Available, Soft state, Eventually consistent) is the consistency model of NoSQL and distributed systems. It is not the opposite of ACID — it is a different set of trade-offs for systems where availability and partition tolerance matter more than immediate consistency.',
      keyPoints: [
        'Basically Available: the system guarantees availability (responds to every request) even during failures — may return stale data',
        'Soft State: the state of the system may change over time even without new input — replicas are converging',
        'Eventually Consistent: given enough time without new writes, all replicas converge to the same value',
        'Not "worse than ACID" — it is a conscious trade-off for availability and partition tolerance',
        'Eventual consistency window: the time between a write and all replicas reflecting it (typically milliseconds to seconds)',
        'Read-your-writes consistency: a common strengthening — you always see your own writes immediately',
        'Monotonic reads: another strengthening — once you see a value, you never see an older one',
      ],
      useCases: [
        'Social media feeds: eventual consistency is fine — showing a post 2 seconds late is acceptable',
        'Shopping cart: Amazon\'s Dynamo paper — always available for writes, merge conflicts later',
        'DNS: the classic eventually consistent system — TTL-based propagation',
        'CDN cache invalidation: edge nodes converge to new content eventually',
      ],
      commonPitfalls: [
        'Treating eventual consistency as "anything goes" — you still need conflict resolution strategies',
        'Not defining your consistency window SLA — "eventually" is not good enough for production',
        'Using BASE where ACID is needed: financial transactions, inventory counts need strong consistency',
        'Not implementing read-your-writes: users updating their profile and not seeing the change is a terrible UX',
      ],
      interviewTips: [
        'Discuss BASE in context of the CAP theorem — BASE is the AP side of the spectrum',
        'Give concrete examples of when eventual consistency is acceptable vs when it is not',
        'Mention that many "NoSQL" databases now offer tunable consistency (Cassandra, DynamoDB)',
      ],
      relatedConcepts: ['cap-theorem', 'acid-properties', 'eventual-consistency-patterns', 'database-replication'],
      difficulty: 'intermediate',
      tags: ['databases', 'distributed-systems', 'consistency'],
      proTip: 'DynamoDB lets you choose per-request: eventually consistent reads (cheaper, faster) or strongly consistent reads (costs 2x, guaranteed latest). This per-operation granularity is the future — not a global database-wide choice.',
    },
    {
      id: 'cap-theorem',
      title: 'CAP Theorem',
      description: 'The CAP theorem states that a distributed data store can provide at most two of three guarantees: Consistency, Availability, and Partition tolerance. Since network partitions are inevitable, the real choice is between C and A during a partition.',
      keyPoints: [
        'Consistency (C): every read receives the most recent write or an error',
        'Availability (A): every request receives a response (not an error), without guarantee of most recent write',
        'Partition Tolerance (P): the system continues to operate despite network partitions between nodes',
        'Partition tolerance is NOT optional — networks fail. The real choice is CP or AP during a partition',
        'CP systems: during partition, reject writes/reads to maintain consistency (ZooKeeper, etcd, HBase, MongoDB default)',
        'AP systems: during partition, accept writes and reconcile later (Cassandra, DynamoDB, CouchDB)',
        'PACELC extension: during Partition choose A or C; Else (normal operation) choose Latency or Consistency',
        'CAP applies to distributed systems only — a single-node Postgres is CA (no partition possible)',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'CAP Theorem Decision Framework',
          code: `
  Network Partition Occurs
          │
          ├── Need consistency? ──> CP
          │   • Reject requests from partitioned nodes
          │   • Return errors until partition heals
          │   • Examples: ZooKeeper, etcd, HBase
          │   • Use for: leader election, config,
          │     distributed locks, financial data
          │
          └── Need availability? ──> AP
              • Accept all requests, reconcile later
              • May return stale data
              • Examples: Cassandra, DynamoDB, CouchDB
              • Use for: shopping carts, social feeds,
                session stores, DNS

  PACELC Extension:
  ┌─────────────┬────────────────┬─────────────────┐
  │  System     │  Partition     │  Else (normal)  │
  ├─────────────┼────────────────┼─────────────────┤
  │  Dynamo     │  AP            │  EL (low lat)   │
  │  Cassandra  │  AP            │  EL (tunable)   │
  │  MongoDB    │  CP            │  EC (consistent)│
  │  PNUTS      │  CP            │  EL (low lat)   │
  │  Spanner    │  CP            │  EC (TrueTime)  │
  └─────────────┴────────────────┴─────────────────┘`,
        },
      ],
      useCases: [
        'CP: distributed locks (ZooKeeper), configuration management (etcd), financial ledgers',
        'AP: user sessions, shopping carts, social media timelines, DNS',
        'Choosing between CP and AP is a per-use-case decision, not a per-database decision',
      ],
      commonPitfalls: [
        'Saying "I choose CA" — you cannot sacrifice partition tolerance in a distributed system',
        'Treating CAP as binary — real systems are on a spectrum and can make different choices for different operations',
        'Confusing CAP consistency with ACID consistency — they are different concepts',
        'Not mentioning PACELC — interviewers know about it and it shows deeper understanding',
      ],
      interviewTips: [
        'State clearly that P is mandatory, so the real choice is between C and A during a partition',
        'Give real-world examples for both CP and AP — ZooKeeper for CP, Cassandra for AP',
        'Mention PACELC to show you understand the trade-offs during normal operation too',
        'Discuss that modern databases (CockroachDB, YugabyteDB) try to minimize the trade-off with clever algorithms',
      ],
      relatedConcepts: ['base-properties', 'acid-properties', 'consensus-algorithms', 'eventual-consistency-patterns'],
      difficulty: 'intermediate',
      tags: ['databases', 'distributed-systems', 'theory'],
      proTip: 'Google Spanner claims to be "effectively CA" by using TrueTime (GPS + atomic clocks) to keep clock skew under 7ms, making partitions so rare and short that they never trigger the CAP trade-off in practice. The rest of us mortals still have to choose.',
    },
    {
      id: 'database-indexing',
      title: 'Database Indexing',
      description: 'Indexes are the single most impactful performance optimization in databases. Understanding B+Tree internals, composite index column order, and covering indexes is the difference between a 50ms query and a 50-second query.',
      keyPoints: [
        'B+Tree: balanced tree where all values are in leaf nodes, leaves are linked — supports range queries efficiently',
        'Clustered index: the table data is physically ordered by this index (one per table) — in Postgres, the primary key is NOT automatically clustered',
        'Non-clustered index: separate structure pointing to the table data — multiple per table',
        'Composite index column order matters: (country, city, name) supports WHERE country=X AND city=Y but NOT WHERE city=Y alone (leftmost prefix rule)',
        'Covering index: includes all columns the query needs — no need to visit the actual table (index-only scan)',
        'Partial index: indexes a subset of rows (WHERE active = true) — smaller, faster, less write overhead',
        'Expression index: index on a computed expression (LOWER(email)) — essential for case-insensitive lookups',
        'Write amplification: every index adds overhead to INSERT/UPDATE/DELETE — do not over-index',
        'Index bloat: deleted rows leave dead entries — REINDEX or pg_repack to reclaim space',
      ],
      codeExamples: [
        {
          language: 'sql',
          label: 'Index Types and Strategies',
          code: `-- Composite index — column order matters!
-- Supports: WHERE country = 'US' AND city = 'NYC'
-- Supports: WHERE country = 'US' (leftmost prefix)
-- Does NOT efficiently support: WHERE city = 'NYC' alone
CREATE INDEX idx_location ON users (country, city, name);

-- Covering index — includes all needed columns
-- Query can be answered entirely from the index (index-only scan)
CREATE INDEX idx_orders_covering ON orders (user_id, status)
INCLUDE (total_amount, created_at);
-- SELECT total_amount, created_at FROM orders
-- WHERE user_id = 123 AND status = 'completed'
-- ^ Index-only scan — never touches the table heap

-- Partial index — only index active users (much smaller)
CREATE INDEX idx_active_users ON users (email)
WHERE deleted_at IS NULL;
-- If 90% of users are soft-deleted, this index is 10x smaller

-- Expression index — case-insensitive email lookup
CREATE INDEX idx_email_lower ON users (LOWER(email));
-- SELECT * FROM users WHERE LOWER(email) = 'user@example.com'

-- GIN index for JSONB — search inside JSON documents
CREATE INDEX idx_metadata ON events USING gin (metadata jsonb_path_ops);
-- SELECT * FROM events WHERE metadata @> '{"type": "click"}'

-- BRIN index for time-series — tiny index for naturally ordered data
CREATE INDEX idx_created ON events USING brin (created_at);
-- Best when data is inserted in roughly chronological order`,
        },
      ],
      ascii: `
  B+Tree Index (simplified):
                    [50]
                   /    \\
              [20,30]   [70,80]
             /  |  \\    /  |  \\
          [10] [25] [35] [60] [75] [90]
            │    │    │    │    │    │
            ▼    ▼    ▼    ▼    ▼    ▼
          Leaf nodes (linked list for range scans)
          ◄──────────────────────────────►

  Key insight: leaf nodes are linked,
  so range queries (WHERE id BETWEEN 25 AND 75)
  find the start and scan sequentially.`,
      useCases: [
        'B+Tree: 99% of indexes — equality and range queries on any column',
        'Hash index: exact equality lookups only (no range) — rarely used explicitly',
        'GIN: full-text search, JSONB containment queries, array intersection',
        'GiST: geographic data (PostGIS), full-text search ranking',
        'BRIN: time-series data, append-only tables with natural ordering',
      ],
      commonPitfalls: [
        'Creating indexes on every column: each index costs write performance and storage',
        'Wrong composite index order: (status, created_at) vs (created_at, status) have very different query plans',
        'Not using EXPLAIN ANALYZE: guessing which index is used instead of verifying the query plan',
        'Indexing low-cardinality columns (boolean, enum with 3 values): the optimizer often does a sequential scan anyway',
        'Forgetting to analyze after bulk loads: stale statistics lead the planner to choose bad plans',
      ],
      interviewTips: [
        'Draw a B+Tree and explain the linked leaf nodes — shows you understand range query optimization',
        'Discuss the leftmost prefix rule for composite indexes — very commonly asked',
        'Mention covering indexes as a way to eliminate table lookups entirely',
        'Talk about write amplification trade-offs — too many indexes hurt write-heavy workloads',
      ],
      relatedConcepts: ['query-optimization', 'database-sharding', 'write-ahead-log'],
      difficulty: 'intermediate',
      tags: ['databases', 'performance', 'indexing'],
      proTip: 'Run EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) on your slow queries. The "Buffers: shared hit" vs "shared read" ratio tells you if your working set fits in memory. If most reads are "shared read" (disk), you need more RAM or better indexes, not more CPU.',
    },
    {
      id: 'query-optimization',
      title: 'Query Optimization',
      description: 'The query optimizer is the most complex component of a database. Understanding EXPLAIN ANALYZE output, join algorithms, and the planner\'s cost model lets you write queries that are orders of magnitude faster — without changing the schema.',
      keyPoints: [
        'EXPLAIN ANALYZE: shows the actual execution plan with real timings — always use ANALYZE, not just EXPLAIN',
        'Sequential Scan: reads every row in the table — fine for small tables, disastrous for large ones',
        'Index Scan: traverses the B+Tree to find matching rows — O(log n) for point queries',
        'Bitmap Index Scan: builds a bitmap of matching pages, then fetches them — good for medium selectivity',
        'Nested Loop Join: for each row in outer table, scan inner table — O(n*m), but fast with an index on inner',
        'Hash Join: build hash table from smaller table, probe with larger — O(n+m), best for large equi-joins',
        'Merge Join: both inputs sorted, merge them — O(n*log(n) + m*log(m)), great when inputs are already sorted',
        'Statistics: the planner uses row counts, value distribution (histograms), and correlation to estimate costs',
        'ANALYZE: updates table statistics — run after bulk changes; autovacuum does this periodically',
      ],
      codeExamples: [
        {
          language: 'sql',
          label: 'EXPLAIN ANALYZE — Reading Query Plans',
          code: `-- BAD: No index, sequential scan on 10M rows
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders
WHERE user_id = 12345 AND status = 'pending';

-- Seq Scan on orders  (cost=0.00..289473.00 rows=5 width=120)
--   (actual time=1523.456..2847.891 rows=3 loops=1)
--   Filter: ((user_id = 12345) AND (status = 'pending'))
--   Rows Removed by Filter: 9999997
--   Buffers: shared read=164474
-- Planning Time: 0.085 ms
-- Execution Time: 2847.934 ms    <-- 2.8 SECONDS

-- FIX: Add composite index
CREATE INDEX idx_orders_user_status ON orders (user_id, status);

-- GOOD: Index scan, reads only matching rows
-- Index Scan using idx_orders_user_status on orders
--   (cost=0.56..8.58 rows=5 width=120)
--   (actual time=0.025..0.031 rows=3 loops=1)
--   Index Cond: ((user_id = 12345) AND (status = 'pending'))
--   Buffers: shared hit=4
-- Planning Time: 0.092 ms
-- Execution Time: 0.048 ms       <-- 0.05 MILLISECONDS (56000x faster)

-- JOIN ALGORITHMS comparison:
-- Nested Loop: good when inner table has index, outer is small
-- Hash Join: good for large tables with equality conditions
-- Merge Join: good when both inputs are pre-sorted (index order)

-- Force planner hints (last resort):
SET enable_seqscan = off;  -- Discourage seq scans for debugging
-- WARNING: Never leave this in production!`,
        },
      ],
      useCases: [
        'Slow query investigation: EXPLAIN ANALYZE is the starting point for every performance investigation',
        'Index design: understanding the query plan tells you which indexes are needed',
        'Join optimization: knowing join algorithms helps you structure queries and indexes',
        'Bulk operation tuning: large batch imports, data migrations, reporting queries',
      ],
      commonPitfalls: [
        'Using EXPLAIN without ANALYZE: estimates can be wildly wrong, actual timings reveal the truth',
        'Optimizing queries based on gut feeling instead of the query plan',
        'SELECT *: fetching all columns prevents index-only scans and wastes I/O',
        'Correlated subqueries instead of joins: the subquery executes once per outer row (N+1 at the SQL level)',
        'Not running ANALYZE after large data changes: stale statistics = wrong query plans',
      ],
      interviewTips: [
        'Show you can read EXPLAIN ANALYZE output — cost, actual time, rows, buffers',
        'Explain the three join algorithms and when each is optimal',
        'Mention that the optimizer makes mistakes and how to address it (ANALYZE, query hints, plan pinning)',
      ],
      relatedConcepts: ['database-indexing', 'connection-pooling', 'database-sharding'],
      difficulty: 'advanced',
      tags: ['databases', 'performance', 'sql'],
      proTip: 'pg_stat_statements is the single most valuable extension for query optimization. It tracks execution statistics for every unique query — total time, calls, mean time, rows. Sort by total_time to find the queries consuming the most database resources.',
    },
    {
      id: 'database-sharding',
      title: 'Database Sharding',
      description: 'Sharding horizontally partitions data across multiple database instances. It is the nuclear option for database scaling — immensely powerful but adds enormous complexity. Most systems should exhaust vertical scaling, read replicas, and caching before sharding.',
      keyPoints: [
        'Range-based sharding: partition by a range of shard key values (user_id 1-1M on shard1, 1M-2M on shard2) — simple but creates hotspots',
        'Hash-based sharding: hash(shard_key) % num_shards — even distribution but range queries require scatter-gather',
        'Directory-based sharding: a lookup table maps each shard key to its shard — flexible but the directory is a single point of failure',
        'Cross-shard queries: JOINs across shards are expensive or impossible — data model must be designed around the shard key',
        'Distributed transactions: 2PC across shards is slow and complex — prefer eventual consistency or saga pattern',
        'Hotspot mitigation: add salt/prefix to shard key, or use consistent hashing to rebalance',
        'Resharding: adding/removing shards requires data migration — consistent hashing minimizes data movement',
        'Shard key selection is the most critical decision: it determines query locality and data distribution',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Hash-Based Sharding Router',
          code: `import crypto from 'crypto'
import { Pool } from 'pg'

interface ShardConfig {
  id: number
  connectionString: string
}

class ShardRouter {
  private readonly pools: Map<number, Pool>
  private readonly shardCount: number

  constructor(shards: ShardConfig[]) {
    this.shardCount = shards.length
    this.pools = new Map(
      shards.map((shard) => [
        shard.id,
        new Pool({ connectionString: shard.connectionString, max: 20 }),
      ])
    )
  }

  getShardId(shardKey: string): number {
    const hash = crypto
      .createHash('md5')
      .update(shardKey)
      .digest('hex')
    // Use first 8 hex chars for numeric hash
    return parseInt(hash.substring(0, 8), 16) % this.shardCount
  }

  getPool(shardKey: string): Pool {
    const shardId = this.getShardId(shardKey)
    const pool = this.pools.get(shardId)
    if (!pool) throw new Error(\`Shard \${shardId} not found\`)
    return pool
  }

  // Single-shard query (fast)
  async queryUser(userId: string): Promise<unknown> {
    const pool = this.getPool(userId)
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    )
    return result.rows[0]
  }

  // Cross-shard query (scatter-gather — slow)
  async searchUsers(name: string): Promise<unknown[]> {
    const results = await Promise.all(
      Array.from(this.pools.values()).map((pool) =>
        pool.query('SELECT * FROM users WHERE name ILIKE $1', [\`%\${name}%\`])
      )
    )
    return results.flatMap((r) => r.rows)
  }
}`,
        },
      ],
      ascii: `
  Application Layer
       │
  ┌────▼────┐
  │  Shard  │  hash(user_id) % 4
  │  Router │
  └────┬────┘
       │
  ┌────┼────────┬────────┐
  ▼    ▼        ▼        ▼
┌────┐┌────┐ ┌────┐ ┌────┐
│ S0 ││ S1 │ │ S2 │ │ S3 │
│0-24││25-49│ │50-74│ │75-99│ ← hash ranges
└────┘└────┘ └────┘ └────┘

Cross-shard JOIN:
  App sends query to ALL shards
  Merges results in application layer
  Slow — avoid by co-locating related data`,
      useCases: [
        'Multi-tenant SaaS: shard by tenant_id — all tenant data on one shard, no cross-shard queries',
        'Social networks: shard by user_id — user data and their content on the same shard',
        'Time-series at extreme scale: shard by time range (month/year) — old shards become read-only',
        'When a single PostgreSQL instance cannot handle the write throughput (typically >50K writes/sec)',
      ],
      commonPitfalls: [
        'Sharding before you need it: vertical scaling + read replicas + caching can handle most workloads',
        'Wrong shard key: sharding by a frequently-joined column different from primary queries creates scatter-gather everywhere',
        'Hotspots: sharding by date creates a hot shard (today\'s partition gets all writes)',
        'Not planning for resharding: adding a shard should not require rewriting the entire application',
        'Ignoring operational complexity: backups, migrations, monitoring now multiply by shard count',
      ],
      interviewTips: [
        'Start with "I would exhaust other options first" — vertical scaling, read replicas, caching',
        'Discuss shard key selection as the most critical decision and explain your criteria',
        'Mention consistent hashing for minimizing data movement during resharding',
        'Acknowledge the complexity cost — cross-shard queries, distributed transactions, operational overhead',
      ],
      relatedConcepts: ['database-replication', 'database-indexing', 'consistent-hashing'],
      difficulty: 'advanced',
      tags: ['databases', 'scalability', 'sharding'],
      proTip: 'Vitess (used by YouTube, Slack, Square) adds sharding to MySQL transparently. Citus does the same for PostgreSQL. These let you shard without rewriting your application — the proxy layer handles routing, cross-shard queries, and resharding. Always prefer these over hand-rolling sharding logic.',
    },
    {
      id: 'database-replication',
      title: 'Database Replication',
      description: 'Replication copies data from one database server to others. It provides read scalability (distribute reads across replicas), high availability (promote replica if primary fails), and geographic distribution. The devil is in the replication lag.',
      keyPoints: [
        'Synchronous replication: primary waits for replica to confirm write — zero data loss but higher write latency',
        'Asynchronous replication: primary does not wait for replica — lower latency but potential data loss on primary failure',
        'Semi-synchronous: primary waits for at least one replica to confirm — compromise between safety and performance',
        'Replication lag: time between a write on primary and it appearing on replica — milliseconds to seconds normally, minutes under load',
        'Read replicas: offload read traffic from the primary — reads may be stale by replication lag',
        'Failover: promote a replica to primary when the primary fails — automated (RDS) or manual (pg_promote)',
        'GTID (Global Transaction ID): uniquely identifies each transaction — simplifies replication topology changes',
        'Binlog (MySQL): binary log of all changes — replicas replay the binlog to stay in sync',
        'WAL shipping (Postgres): stream the Write-Ahead Log to replicas — replicas replay WAL records',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Read/Write Splitting with Replication Awareness',
          code: `import { Pool } from 'pg'

interface ReplicationConfig {
  primary: string    // read-write
  replicas: string[] // read-only
}

class ReplicationAwarePool {
  private readonly primaryPool: Pool
  private readonly replicaPools: Pool[]
  private roundRobinIndex = 0

  constructor(config: ReplicationConfig) {
    this.primaryPool = new Pool({
      connectionString: config.primary,
      max: 20,
    })
    this.replicaPools = config.replicas.map(
      (connStr) => new Pool({ connectionString: connStr, max: 20 })
    )
  }

  // Writes always go to primary
  async write(query: string, params: unknown[]): Promise<unknown> {
    return this.primaryPool.query(query, params)
  }

  // Reads go to replicas (round-robin)
  async read(query: string, params: unknown[]): Promise<unknown> {
    if (this.replicaPools.length === 0) {
      return this.primaryPool.query(query, params)
    }
    const pool = this.replicaPools[
      this.roundRobinIndex % this.replicaPools.length
    ]
    this.roundRobinIndex++
    return pool.query(query, params)
  }

  // Read-after-write: use primary to avoid replication lag
  async readFromPrimary(query: string, params: unknown[]): Promise<unknown> {
    return this.primaryPool.query(query, params)
  }
}

// Usage
const db = new ReplicationAwarePool({
  primary: 'postgresql://primary:5432/app',
  replicas: [
    'postgresql://replica1:5432/app',
    'postgresql://replica2:5432/app',
  ],
})

// User updates their profile (write to primary)
await db.write(
  'UPDATE users SET name = $1 WHERE id = $2',
  ['Alice', userId]
)

// Immediately show updated profile (read from primary to avoid lag)
const user = await db.readFromPrimary(
  'SELECT * FROM users WHERE id = $1',
  [userId]
)

// Dashboard analytics (can be slightly stale — read from replica)
const stats = await db.read(
  'SELECT count(*) FROM orders WHERE created_at > $1',
  [yesterday]
)`,
        },
      ],
      useCases: [
        'Read-heavy workloads: offload 80% of reads to replicas, primary handles writes only',
        'High availability: automated failover when primary crashes (RDS Multi-AZ, Patroni for self-managed Postgres)',
        'Reporting: run heavy analytical queries against a dedicated replica without impacting OLTP',
        'Geographic distribution: place read replicas close to users in different regions',
      ],
      commonPitfalls: [
        'Read-after-write hitting a stale replica: user saves data, refreshes page, sees old data',
        'Not monitoring replication lag: a replica falling hours behind is worse than having no replica',
        'Failover without testing: automated failover that has never been tested will fail when you need it most',
        'Too many replicas: each replica adds write overhead to the primary (it must ship WAL to each one)',
      ],
      interviewTips: [
        'Discuss the read-after-write problem and how to solve it (read from primary after writes, or use GTID-based routing)',
        'Explain sync vs async trade-offs — durability vs latency',
        'Mention monitoring replication lag as a key operational metric',
      ],
      relatedConcepts: ['acid-properties', 'write-ahead-log', 'database-sharding', 'cap-theorem'],
      difficulty: 'intermediate',
      tags: ['databases', 'replication', 'high-availability'],
      proTip: 'PostgreSQL\'s streaming replication + pg_stat_replication view gives you real-time replication lag monitoring. Set up alerts when replay_lag exceeds your SLA (e.g., > 1 second). AWS RDS exposes this as the ReplicaLag CloudWatch metric.',
    },
    {
      id: 'sql-vs-nosql',
      title: 'SQL vs NoSQL',
      description: 'This is not a religious debate — it is an engineering decision based on data model, query patterns, consistency requirements, and scale. Most production systems use both (polyglot persistence). The question is which to use for each specific workload.',
      keyPoints: [
        'Not a binary choice: most companies use 3-5 different databases for different use cases (polyglot persistence)',
        'SQL (relational): structured data, complex queries, JOINs, ACID transactions — PostgreSQL, MySQL',
        'Document (MongoDB, DynamoDB): flexible schema, nested objects, good for varying structures',
        'Key-Value (Redis, DynamoDB): fastest reads, cache, session store, simple lookups by key',
        'Wide-Column (Cassandra, ScyllaDB): high write throughput, time-series, distributed across regions',
        'Graph (Neo4j, Neptune): relationships are first-class, social networks, recommendation engines',
        'OLTP vs OLAP: transactional workloads (many small operations) vs analytical (few large scans)',
        'Schema flexibility: "schemaless" is misleading — the schema moves to application code, which is harder to enforce',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Decision Framework: Which Database for Which Workload',
          code: `
  ┌──────────────────────────────────────────────────────────┐
  │                    Decision Tree                          │
  ├──────────────────────────────────────────────────────────┤
  │                                                          │
  │  Need ACID transactions + complex JOINs?                 │
  │  ├── YES → PostgreSQL (or MySQL)                         │
  │  │                                                       │
  │  Need sub-millisecond reads by key?                      │
  │  ├── YES → Redis (cache) or DynamoDB (persistent)        │
  │  │                                                       │
  │  Need flexible schema + nested documents?                │
  │  ├── YES → MongoDB or DynamoDB                           │
  │  │                                                       │
  │  Need massive write throughput across regions?            │
  │  ├── YES → Cassandra or ScyllaDB                         │
  │  │                                                       │
  │  Need to traverse relationships (friends-of-friends)?    │
  │  ├── YES → Neo4j or Amazon Neptune                       │
  │  │                                                       │
  │  Need full-text search + faceting?                       │
  │  ├── YES → Elasticsearch or OpenSearch                   │
  │  │                                                       │
  │  Need time-series with retention policies?               │
  │  ├── YES → TimescaleDB (SQL) or InfluxDB                 │
  │  │                                                       │
  │  Not sure / early stage?                                 │
  │  └── PostgreSQL (it does 80% of everything well)         │
  └──────────────────────────────────────────────────────────┘

  Real-world polyglot example (e-commerce):
  • PostgreSQL: orders, users, inventory (ACID)
  • Redis: sessions, cache, rate limiting
  • Elasticsearch: product search, faceted navigation
  • Cassandra: clickstream analytics, activity logs
  • S3: product images, invoices (object storage)`,
        },
      ],
      useCases: [
        'PostgreSQL: 80% of use cases — start here unless you have a specific reason not to',
        'MongoDB: content management, product catalogs with varying attributes, rapid prototyping',
        'Redis: caching, session storage, leaderboards, real-time counters, pub/sub',
        'Cassandra: IoT sensor data, time-series at massive scale, write-heavy workloads with AP requirements',
        'Neo4j: social networks, recommendation engines, fraud detection, knowledge graphs',
      ],
      commonPitfalls: [
        'Choosing NoSQL because "it scales better" without understanding that Postgres scales to billions of rows with proper indexing',
        'Using MongoDB for data that needs transactions and JOINs — then reinventing them badly in application code',
        'Using a single database for everything — analytics queries on the OLTP database will kill performance',
        '"Schemaless" is not a feature — it is a liability. Schema validation moves to application code where it is harder to enforce',
      ],
      interviewTips: [
        'Show that you think about data model and query patterns first, then choose the database',
        'Mention polyglot persistence — using the right database for each workload',
        'Default to PostgreSQL and justify deviations — it shows pragmatism over hype',
        'Discuss OLTP vs OLAP as a key axis of the decision',
      ],
      relatedConcepts: ['acid-properties', 'base-properties', 'cap-theorem', 'database-indexing'],
      difficulty: 'intermediate',
      tags: ['databases', 'architecture', 'decision-making'],
      proTip: 'PostgreSQL with extensions can replace 3-4 specialized databases: pg_trgm for full-text search, TimescaleDB for time-series, PostGIS for geospatial, and AGE for graph queries. Before adding another database to your stack, check if Postgres can do it.',
    },
    {
      id: 'write-ahead-log',
      title: 'Write-Ahead Log (WAL)',
      description: 'The WAL is the foundation of database reliability. Every change is written to a sequential log BEFORE modifying data pages. This simple invariant enables crash recovery, replication, and change data capture — all from the same mechanism.',
      keyPoints: [
        'WAL invariant: write the log record to disk BEFORE writing the data page — guarantees recoverability',
        'Crash recovery: on startup, replay WAL from the last checkpoint to restore committed transactions and undo uncommitted ones',
        'Sequential writes: WAL is append-only, sequential — much faster than random writes to data pages',
        'Checkpointing: periodically flush dirty pages to disk and advance the recovery start point — without this, WAL grows forever',
        'Logical replication: WAL decoded into logical changes (INSERT/UPDATE/DELETE) — can replicate to different schemas or databases',
        'Physical replication: raw WAL bytes shipped to replica — exact binary copy, used for streaming replication',
        'WAL-based CDC (Change Data Capture): read the WAL to stream changes to external systems (Debezium, pgoutput)',
        'WAL level: minimal (crash recovery only), replica (+ physical replication), logical (+ logical replication + CDC)',
      ],
      useCases: [
        'Crash recovery: the primary reason WAL exists — recover to a consistent state after power loss or crash',
        'Streaming replication: ship WAL to standby servers for high availability',
        'Point-in-time recovery (PITR): replay WAL to a specific timestamp — recover from accidental DELETE',
        'Change data capture: Debezium reads the WAL to stream changes to Kafka for downstream systems',
      ],
      commonPitfalls: [
        'Not monitoring WAL growth: if archiving or replication falls behind, WAL fills the disk and the database stops',
        'Checkpoint too infrequent: crash recovery takes too long because there is too much WAL to replay',
        'Checkpoint too frequent: excessive I/O from flushing dirty pages to disk',
        'Setting wal_level=minimal in production: prevents replication and PITR — use at least replica',
      ],
      interviewTips: [
        'Explain the WAL invariant (log before data) and why it guarantees durability',
        'Discuss how WAL enables both crash recovery and replication from the same mechanism',
        'Mention CDC as a modern use case — Debezium + Kafka is a standard pattern for event-driven architectures',
      ],
      relatedConcepts: ['acid-properties', 'database-replication', 'database-indexing'],
      difficulty: 'advanced',
      tags: ['databases', 'internals', 'reliability'],
      proTip: 'WAL-based CDC with Debezium is replacing dual-write patterns everywhere. Instead of writing to both the database and Kafka (which has consistency issues), write to the database only and let Debezium read the WAL. This is the Outbox Pattern implemented at the database level.',
    },
    {
      id: 'connection-pooling',
      title: 'Connection Pooling',
      description: 'Every database connection consumes RAM (~10MB in PostgreSQL), a process slot, and a file descriptor. Without connection pooling, a burst of traffic creates thousands of connections, exhausting database resources. PgBouncer is the standard solution.',
      keyPoints: [
        'Connection overhead: each Postgres connection is a separate OS process (~10MB RAM) — 1000 connections = 10GB RAM just for connections',
        'PgBouncer modes: session (1:1 mapping, most compatible), transaction (reuse between transactions, most efficient), statement (reuse between statements, most restrictive)',
        'Pool sizing formula: connections = (core_count * 2) + effective_spindle_count — for SSD, ~(cores * 2) + 1',
        'Fewer connections is often faster: a pool of 20 connections outperforms 200 direct connections due to reduced context switching',
        'Application-level pooling: most ORMs have built-in pools (max: 20 is a good default per app instance)',
        'PgBouncer in front of Postgres: sits between app and DB, multiplexes hundreds of app connections to a small DB pool',
        'pgpool-II: alternative that also does load balancing and replication — heavier than PgBouncer',
        'Connection timeout: set a reasonable connect timeout (5s) and idle timeout (10min) to prevent connection leaks',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Connection Pool Configuration',
          code: `import { Pool } from 'pg'

// Application-level pool — one per app instance
const pool = new Pool({
  host: process.env.DB_HOST,           // PgBouncer address, not direct DB
  port: 6432,                           // PgBouncer port (not 5432)
  database: 'myapp',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Pool settings
  max: 20,                              // Max connections in pool
  idleTimeoutMillis: 30_000,            // Close idle connections after 30s
  connectionTimeoutMillis: 5_000,       // Fail fast if can't connect in 5s
  allowExitOnIdle: true,                // Let process exit when pool is idle
})

// Monitor pool health
pool.on('error', (err) => {
  console.error('Unexpected pool error', err)
})

// Check pool stats periodically
setInterval(() => {
  console.log({
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  })
}, 60_000)

// Always release connections back to the pool
async function getUser(userId: string): Promise<unknown> {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    )
    return result.rows[0]
  } finally {
    client.release()  // CRITICAL: always release, even on error
  }
}

// Or use pool.query() which handles acquire/release automatically
async function getUserSimple(userId: string): Promise<unknown> {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  )
  return result.rows[0]
}`,
        },
      ],
      useCases: [
        'Any production PostgreSQL deployment — PgBouncer is effectively mandatory',
        'Serverless functions (Lambda): connection pooling is CRITICAL because each invocation opens a new connection',
        'Microservices: 20 services * 10 connections each = 200 DB connections — need PgBouncer to multiplex',
        'Connection leak prevention: idle timeout and max connections prevent resource exhaustion',
      ],
      commonPitfalls: [
        'Not using a pooler at all: 500 direct connections to Postgres will bring it to its knees',
        'Pool too large: 200 connections per app instance * 10 instances = 2000 DB connections — this kills Postgres',
        'Not releasing connections: a connection leak slowly exhausts the pool, then all queries time out waiting',
        'Using PgBouncer transaction mode with prepared statements: they do not work together — use session mode or disable prepared statements',
        'Setting max_connections=1000 on Postgres instead of using a pooler: each connection costs 10MB RAM and causes context switching overhead',
      ],
      interviewTips: [
        'Mention the connection overhead (10MB per connection) — shows you understand the resource cost',
        'Discuss PgBouncer transaction mode as the most efficient — reuses connections between transactions',
        'The pool sizing formula shows you understand that more connections is not better',
      ],
      relatedConcepts: ['database-replication', 'query-optimization', 'database-indexing'],
      difficulty: 'intermediate',
      tags: ['databases', 'performance', 'operations'],
      proTip: 'AWS RDS Proxy is a managed PgBouncer alternative that handles connection pooling, failover, and IAM authentication. For Lambda + RDS, it is the standard solution to the connection explosion problem. It adds ~1ms latency but saves you from managing PgBouncer yourself.',
    },
    {
      id: 'time-series-databases',
      title: 'Time-Series Databases',
      description: 'Time-series data (metrics, IoT, events) has unique characteristics: append-heavy writes, time-range queries, and natural partitioning by time. Specialized databases exploit these patterns for 10-100x better performance than general-purpose databases.',
      keyPoints: [
        'Time-ordered data: writes are almost always in chronological order — exploited for write optimization',
        'Partitioning by time: automatic chunking by time range (hour/day/week) — old chunks can be dropped or compressed',
        'Retention policies: automatically delete or downsample data older than N days — essential for controlling storage growth',
        'Compression: time-series data compresses 10-20x due to regular patterns (gorilla encoding, delta-of-delta, XOR)',
        'TimescaleDB: PostgreSQL extension — full SQL, automatic time-based partitioning (hypertables), continuous aggregates',
        'InfluxDB: purpose-built, Flux query language, built-in retention policies, good for metrics and IoT',
        'Prometheus: pull-based metrics collection, PromQL, designed for monitoring/alerting, not long-term storage',
        'Downsampling: aggregate high-resolution data into lower resolution over time (1s -> 1min -> 1hour)',
      ],
      codeExamples: [
        {
          language: 'sql',
          label: 'TimescaleDB — Hypertable with Retention and Continuous Aggregates',
          code: `-- Create a hypertable (auto-partitioned by time)
CREATE TABLE metrics (
  time        TIMESTAMPTZ NOT NULL,
  device_id   TEXT        NOT NULL,
  temperature DOUBLE PRECISION,
  humidity    DOUBLE PRECISION
);

SELECT create_hypertable('metrics', 'time',
  chunk_time_interval => INTERVAL '1 day'
);

-- Automatic retention: drop data older than 30 days
SELECT add_retention_policy('metrics', INTERVAL '30 days');

-- Continuous aggregate: pre-computed hourly rollups
CREATE MATERIALIZED VIEW metrics_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', time) AS hour,
  device_id,
  AVG(temperature)  AS avg_temp,
  MAX(temperature)  AS max_temp,
  MIN(temperature)  AS min_temp,
  COUNT(*)          AS sample_count
FROM metrics
GROUP BY hour, device_id;

-- Auto-refresh the aggregate
SELECT add_continuous_aggregate_policy('metrics_hourly',
  start_offset => INTERVAL '3 hours',
  end_offset   => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour'
);

-- Query: last 24 hours with 5-minute buckets
SELECT
  time_bucket('5 minutes', time) AS bucket,
  device_id,
  AVG(temperature) AS avg_temp
FROM metrics
WHERE time > NOW() - INTERVAL '24 hours'
  AND device_id = 'sensor-42'
GROUP BY bucket, device_id
ORDER BY bucket;`,
        },
      ],
      useCases: [
        'Infrastructure monitoring: CPU, memory, disk, network metrics (Prometheus + Grafana)',
        'IoT sensor data: temperature, humidity, pressure from thousands of devices',
        'Financial market data: tick data, OHLCV candles, order book snapshots',
        'Application metrics: request latency, error rates, throughput (custom business metrics)',
      ],
      commonPitfalls: [
        'Using a general-purpose database for time-series: Postgres without TimescaleDB chokes on millions of rows per day',
        'No retention policy: time-series data grows forever — you WILL run out of disk',
        'Too-high cardinality: unique tags/labels per time series (Prometheus calls this cardinality explosion)',
        'Not downsampling: keeping 1-second resolution data for 5 years is wasteful — hourly aggregates suffice for old data',
      ],
      interviewTips: [
        'Explain why general-purpose databases struggle with time-series workloads (append-heavy, range-scan queries)',
        'Discuss retention policies and downsampling as essential operational concerns',
        'Mention TimescaleDB if the interviewer is a Postgres shop — it is the easiest migration path',
      ],
      relatedConcepts: ['database-indexing', 'database-sharding', 'write-ahead-log'],
      difficulty: 'intermediate',
      tags: ['databases', 'monitoring', 'iot', 'time-series'],
      proTip: 'For Kubernetes monitoring, the Prometheus + Thanos stack is the production standard. Prometheus handles short-term storage (2 weeks), Thanos provides long-term storage in S3 with global querying across clusters. This separation keeps Prometheus lean while giving you years of retention.',
    },
  ],
}
