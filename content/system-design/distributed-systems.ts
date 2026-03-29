// @ts-nocheck
import type { Category } from '@/lib/types'

export const distributedCategory: Category = {
  id: 'distributed-systems',
  title: 'Distributed Systems',
  description: 'Consensus, coordination, and consistency — the fundamental challenges of building reliable systems across multiple machines.',
  icon: 'GitBranch',
  concepts: [
    {
      id: 'consensus-algorithms',
      title: 'Consensus Algorithms',
      description: 'Consensus is the problem of getting multiple nodes to agree on a single value. It is provably impossible to solve perfectly (FLP impossibility), yet practical systems (Raft, Paxos) work by relaxing assumptions. Understanding consensus is understanding the limits of distributed systems.',
      keyPoints: [
        'Paxos: the original consensus algorithm — prepare/promise/accept/accepted phases — correct but notoriously hard to understand and implement',
        'Raft: designed to be understandable — leader election + log replication — used by etcd, Consul, CockroachDB',
        'Raft leader election: nodes start as followers, random election timeout triggers candidate state, majority vote wins',
        'Raft log replication: leader appends to its log, replicates to followers, commits when majority acknowledge',
        'FLP impossibility: in an asynchronous system with even one faulty process, consensus is impossible to guarantee in finite time',
        'Practical implication of FLP: real systems use timeouts (partial synchrony) to make progress — sacrificing theoretical guarantee for practical liveness',
        'Byzantine fault tolerance (BFT): consensus despite malicious nodes — needed for blockchain, not typical distributed systems',
        'Quorum: majority of nodes (N/2 + 1) must agree — with 5 nodes, can tolerate 2 failures',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Raft Consensus — Leader Election and Log Replication',
          code: `
  LEADER ELECTION (Raft):
  ═══════════════════════
  Initial state: all nodes are followers

  Node A: election timeout fires (random 150-300ms)
  Node A → Candidate (term 1)
  Node A → [B, C, D, E]: RequestVote(term=1, lastLog=0)

  Node B: grants vote (hasn't voted in term 1)  ✓
  Node C: grants vote                            ✓
  Node D: grants vote (3/5 = majority)           ✓ → A becomes LEADER
  Node E: (slow, vote arrives late)

  LOG REPLICATION (Raft):
  ═══════════════════════
  Client → Leader A: "SET x=5"

  1. Leader appends to its log:  [index=1, term=1, SET x=5]

  2. Leader → [B,C,D,E]: AppendEntries(entries=[SET x=5])

  3. Followers append and ACK:
     B: ACK ✓
     C: ACK ✓
     D: ACK ✓  (3/5 followers = majority)
     E: (slow)

  4. Leader commits index 1 (majority confirmed)
  5. Leader → Client: "OK, x=5 committed"
  6. Leader → Followers: "commit index 1" (next heartbeat)

  NODE FAILURE:
  ═════════════
  If Leader A dies:
  1. Followers stop receiving heartbeats
  2. Random election timeout fires on Node B
  3. Node B becomes candidate, requests votes
  4. New leader elected from remaining nodes
  5. Clients redirect to new leader`,
        },
      ],
      ascii: `
  Raft State Machine:

  ┌──────────┐  election timeout  ┌───────────┐
  │ Follower │───────────────────→│ Candidate │
  │          │←───────────────────│           │
  └──────────┘  discovers leader  └─────┬─────┘
       ▲          or higher term        │
       │                                │ receives majority
       │                                │ of votes
       │         ┌──────────┐           │
       └─────────│  Leader  │←──────────┘
     discovers   │          │
     higher term └──────────┘
                  Sends heartbeats
                  to all followers`,
      useCases: [
        'etcd: Raft-based KV store used by Kubernetes for cluster state',
        'Consul: Raft-based service discovery and configuration',
        'CockroachDB: Raft per range for distributed SQL consensus',
        'ZooKeeper: ZAB protocol (Paxos variant) for distributed coordination',
      ],
      commonPitfalls: [
        'Implementing consensus from scratch: use etcd or Consul — consensus is deceptively hard to get right',
        'Even number of nodes: 4 nodes has the same fault tolerance as 3 (both tolerate 1 failure) — always use odd numbers',
        'Split brain: network partition can create two leaders — Raft prevents this with term numbers and majority requirement',
        'Confusing consensus with broadcast: consensus is about agreement, not just dissemination',
      ],
      interviewTips: [
        'Explain Raft over Paxos — it is simpler and equally correct, and used in more modern systems',
        'Draw the leader election flow and log replication — visual explanations are much clearer',
        'Mention FLP impossibility and how practical systems work around it with timeouts',
        'State that you would use etcd/Consul rather than implementing consensus yourself',
      ],
      relatedConcepts: ['leader-election', 'distributed-locking', 'cap-theorem'],
      difficulty: 'expert',
      tags: ['distributed-systems', 'consensus', 'theory'],
      proTip: 'The Raft paper (In Search of an Understandable Consensus Algorithm) is one of the most accessible papers in distributed systems. Read it — it was specifically designed to be understandable, unlike the Paxos paper. The raft.github.io visualization makes the algorithm click in 5 minutes.',
    },
    {
      id: 'leader-election',
      title: 'Leader Election',
      description: 'Leader election selects one node from a group to coordinate work. The elected leader handles writes, assigns tasks, or makes decisions on behalf of the group. The challenge is ensuring exactly one leader even during network partitions.',
      keyPoints: [
        'Bully algorithm: highest-ID node wins — simple but O(n^2) messages and does not handle partitions well',
        'Ring-based: nodes arranged in a logical ring, election token circulates — used in some LAN protocols',
        'Raft leader election: random election timeouts prevent split votes, majority required — production standard',
        'ZooKeeper ephemeral nodes: each candidate creates an ephemeral sequential znode, lowest sequence number wins',
        'etcd lease-based: acquire a lease (TTL-based lock), leader renews lease periodically, others watch for expiry',
        'Fencing tokens: monotonically increasing token given to each leader — prevents stale leaders from acting',
        'Split brain prevention: fencing tokens + majority quorum ensure at most one active leader',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Leader Election with Redis (Simplified)',
          code: `import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

class LeaderElection {
  private readonly nodeId: string
  private readonly key: string
  private readonly ttlSeconds: number
  private renewInterval: NodeJS.Timeout | null = null
  private isLeader = false

  constructor(
    nodeId: string,
    electionKey: string,
    ttlSeconds: number = 30
  ) {
    this.nodeId = nodeId
    this.key = \`leader:\${electionKey}\`
    this.ttlSeconds = ttlSeconds
  }

  async tryBecomeLeader(): Promise<boolean> {
    // Attempt to acquire leadership with NX (only if not exists)
    const acquired = await redis.set(
      this.key,
      this.nodeId,
      'EX', this.ttlSeconds,
      'NX'
    )

    if (acquired) {
      this.isLeader = true
      this.startRenewing()
      console.log(\`Node \${this.nodeId} is now the leader\`)
      return true
    }

    // Check if we are already the leader (re-election after restart)
    const currentLeader = await redis.get(this.key)
    if (currentLeader === this.nodeId) {
      this.isLeader = true
      this.startRenewing()
      return true
    }

    return false
  }

  private startRenewing(): void {
    // Renew lease at half the TTL interval
    this.renewInterval = setInterval(async () => {
      // Only renew if we are still the leader
      const script = \`
        if redis.call('get', KEYS[1]) == ARGV[1] then
          return redis.call('expire', KEYS[1], ARGV[2])
        else
          return 0
        end
      \`
      const renewed = await redis.eval(script, 1, this.key, this.nodeId, this.ttlSeconds)
      if (!renewed) {
        this.isLeader = false
        this.stopRenewing()
        console.log(\`Node \${this.nodeId} lost leadership\`)
        // Trigger re-election
        this.tryBecomeLeader()
      }
    }, (this.ttlSeconds / 2) * 1000)
  }

  private stopRenewing(): void {
    if (this.renewInterval) {
      clearInterval(this.renewInterval)
      this.renewInterval = null
    }
  }

  async resign(): Promise<void> {
    this.stopRenewing()
    // Only delete if we are the current leader
    const script = \`
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end
    \`
    await redis.eval(script, 1, this.key, this.nodeId)
    this.isLeader = false
  }

  getIsLeader(): boolean {
    return this.isLeader
  }
}

// Usage
const election = new LeaderElection('node-1', 'scheduler')
await election.tryBecomeLeader()

if (election.getIsLeader()) {
  // Only the leader runs scheduled jobs
  startScheduler()
}`,
        },
      ],
      useCases: [
        'Scheduler: only one node runs cron jobs to prevent duplicate execution',
        'Database primary: elect one node for writes, others serve reads',
        'Kafka partition leader: each partition has exactly one leader broker',
        'Distributed lock manager: the leader coordinates lock grants',
      ],
      commonPitfalls: [
        'No fencing token: a stale leader (slow GC pause) comes back and acts as leader alongside the new one',
        'Relying on wall clock: clock skew can cause lease expiry at different times — use logical clocks or consensus',
        'Redis SETNX for leader election: works for simple cases but is not as robust as etcd/ZooKeeper (see Redlock controversy)',
        'Not testing leader failover: the first time failover runs should not be in production',
      ],
      interviewTips: [
        'Mention fencing tokens as the solution to the "zombie leader" problem',
        'Recommend etcd or ZooKeeper for production leader election over hand-rolled Redis solutions',
        'Discuss why you need leader election: single writer, job scheduler, coordinator',
      ],
      relatedConcepts: ['consensus-algorithms', 'distributed-locking', 'cap-theorem'],
      difficulty: 'advanced',
      tags: ['distributed-systems', 'coordination', 'reliability'],
      proTip: 'Kubernetes uses etcd for leader election (the controller-manager, scheduler). If you are already running Kubernetes, you can use the built-in leader election API (coordination.k8s.io/v1 Lease) instead of deploying a separate etcd or ZooKeeper cluster.',
    },
    {
      id: 'distributed-locking',
      title: 'Distributed Locking',
      description: 'A distributed lock ensures that only one process across multiple machines can access a shared resource at a time. The problem is harder than it sounds: clocks skew, processes pause, and networks partition. Getting this wrong means data corruption.',
      keyPoints: [
        'Redis SETNX: SET key value NX EX timeout — simple but fundamentally unsafe without fencing tokens',
        'Redlock (Martin Kleppmann controversy): acquires lock on majority of Redis nodes — Martin Kleppmann argued it is not safe due to clock assumptions',
        'ZooKeeper/Chubby: create ephemeral sequential znode, watch previous node — correct but higher latency',
        'etcd: lease-based locks with TTL — correct consensus-based locking',
        'Fencing tokens: monotonically increasing token — resource rejects operations with older tokens',
        'Problem: lock holder pauses (GC, I/O) past lock expiry, another acquires lock, both act as holders',
        'Solution: fencing tokens on the resource side — resource enforces the token, not just the lock holder',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Distributed Lock with Fencing Token',
          code: `import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

interface LockResult {
  acquired: boolean
  fencingToken: number
  release: () => Promise<boolean>
}

// Distributed lock with fencing token
async function acquireLock(
  resource: string,
  ttlMs: number = 30000
): Promise<LockResult> {
  const lockKey = \`lock:\${resource}\`
  const tokenKey = \`fence:\${resource}\`
  const lockId = crypto.randomUUID()

  // Atomic: acquire lock + increment fencing token
  const script = \`
    local acquired = redis.call('SET', KEYS[1], ARGV[1], 'NX', 'PX', ARGV[2])
    if acquired then
      local token = redis.call('INCR', KEYS[2])
      return token
    else
      return -1
    end
  \`

  const result = await redis.eval(script, 2, lockKey, tokenKey, lockId, ttlMs) as number

  if (result === -1) {
    return { acquired: false, fencingToken: -1, release: async () => false }
  }

  const fencingToken = result

  const release = async (): Promise<boolean> => {
    // Only release if we still hold the lock (same lockId)
    const releaseScript = \`
      if redis.call('GET', KEYS[1]) == ARGV[1] then
        return redis.call('DEL', KEYS[1])
      else
        return 0
      end
    \`
    const released = await redis.eval(releaseScript, 1, lockKey, lockId) as number
    return released === 1
  }

  return { acquired: true, fencingToken, release }
}

// Resource that validates fencing tokens
class FencedResource {
  private lastAcceptedToken = 0

  async processWithFencing(
    fencingToken: number,
    operation: () => Promise<void>
  ): Promise<void> {
    // Reject operations from stale lock holders
    if (fencingToken <= this.lastAcceptedToken) {
      throw new Error(
        \`Stale fencing token: \${fencingToken} <= \${this.lastAcceptedToken}\`
      )
    }

    this.lastAcceptedToken = fencingToken
    await operation()
  }
}

// Usage
const lock = await acquireLock('payment:order-123', 10000)

if (lock.acquired) {
  try {
    await fencedPaymentService.processWithFencing(
      lock.fencingToken,
      () => chargePayment('order-123', 99.99)
    )
  } finally {
    await lock.release()
  }
}`,
        },
      ],
      ascii: `
  The Distributed Lock Problem:

  Time ─────────────────────────────────────────→

  Client A: [acquire lock]──[GC pause...]──[writes data]
                                                ↑ STALE!
  Client B:        [acquire lock]──[writes data]
                                        ↑ VALID

  Both clients think they hold the lock.
  Client A's write OVERWRITES Client B's.

  Solution: Fencing Tokens
  ─────────────────────────
  Client A: token=33 ──[GC pause...]──[writes with token=33]
                                              ↑ REJECTED! token < 34
  Client B: token=34 ──[writes with token=34]
                               ↑ ACCEPTED

  Resource rejects token=33 because it already saw token=34.`,
      useCases: [
        'Preventing double-processing: only one worker processes a payment or order at a time',
        'Leader election: lock holder is the leader, others are followers',
        'Database migrations: only one instance runs migrations at deploy time',
        'Exclusive resource access: only one service writes to a file, external API, or shared resource',
      ],
      commonPitfalls: [
        'Redis SETNX without fencing: GC pauses can cause two holders — use fencing tokens on the resource side',
        'DELETE without checking owner: another process acquired the lock, you delete their lock — use Lua script to check value before deleting',
        'TTL too short: lock expires during processing, another acquires it — set TTL with generous margin',
        'TTL too long: if lock holder crashes, resource is locked for the full TTL — use heartbeat renewal',
        'Redlock: controversial — Martin Kleppmann showed it relies on clock accuracy; use etcd/ZooKeeper for correctness-critical locks',
      ],
      interviewTips: [
        'Draw the fencing token diagram — it immediately shows you understand the core problem',
        'Mention the Kleppmann vs Antirez (Redis author) debate about Redlock — shows deep knowledge',
        'Recommend etcd/ZooKeeper for correctness-critical locks, Redis SETNX for best-effort locks',
      ],
      relatedConcepts: ['consensus-algorithms', 'leader-election', 'two-phase-commit'],
      difficulty: 'advanced',
      tags: ['distributed-systems', 'coordination', 'reliability'],
      proTip: 'Martin Kleppmann\'s blog post "How to do distributed locking" is essential reading. His key insight: the lock is not the authority — the resource being protected must validate the fencing token. If the resource cannot check fencing tokens, your distributed lock is fundamentally unsafe regardless of how it is implemented.',
    },
    {
      id: 'vector-clocks',
      title: 'Vector Clocks',
      description: 'Vector clocks track causality in distributed systems. Unlike wall clocks (which can skew), vector clocks tell you definitively whether one event happened before another or whether two events are concurrent (conflicting). This is how eventually consistent systems detect conflicts.',
      keyPoints: [
        'Causality tracking: vector clock captures the "happens-before" relation between events across nodes',
        'Each node maintains a vector of counters: [A:2, B:3, C:1] means A has seen 2 of its own events, 3 from B, 1 from C',
        'On local event: increment own counter',
        'On send: attach current vector clock to message',
        'On receive: merge vector clocks (take max of each counter), then increment own counter',
        'Comparing: V1 < V2 if all counters in V1 are <= V2 and at least one is strictly less (V1 happened before V2)',
        'Concurrent: neither V1 < V2 nor V2 < V1 — conflict that needs resolution',
        'Amazon Dynamo: used version vectors (similar to vector clocks) for conflict detection in shopping cart',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Vector Clock Implementation',
          code: `type VectorClock = Record<string, number>

function increment(clock: VectorClock, nodeId: string): VectorClock {
  return { ...clock, [nodeId]: (clock[nodeId] ?? 0) + 1 }
}

function merge(a: VectorClock, b: VectorClock): VectorClock {
  const merged: VectorClock = { ...a }
  for (const [node, count] of Object.entries(b)) {
    merged[node] = Math.max(merged[node] ?? 0, count)
  }
  return merged
}

type Ordering = 'before' | 'after' | 'concurrent' | 'equal'

function compare(a: VectorClock, b: VectorClock): Ordering {
  const allNodes = new Set([...Object.keys(a), ...Object.keys(b)])
  let aBeforeB = false
  let bBeforeA = false

  for (const node of allNodes) {
    const aCount = a[node] ?? 0
    const bCount = b[node] ?? 0

    if (aCount < bCount) aBeforeB = true
    if (aCount > bCount) bBeforeA = true
  }

  if (aBeforeB && !bBeforeA) return 'before'   // a happened before b
  if (bBeforeA && !aBeforeB) return 'after'     // a happened after b
  if (!aBeforeB && !bBeforeA) return 'equal'    // same clock
  return 'concurrent'                            // conflict!
}

// Example: detecting conflicting writes
interface VersionedValue<T> {
  value: T
  clock: VectorClock
}

class EventuallyConsistentStore<T> {
  private data = new Map<string, VersionedValue<T>[]>()
  private readonly nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  write(key: string, value: T, clientClock: VectorClock): VectorClock {
    const newClock = increment(
      merge(clientClock, this.getLatestClock(key)),
      this.nodeId
    )

    const existing = this.data.get(key) ?? []

    // Remove versions that are superseded by this write
    const surviving = existing.filter(
      (v) => compare(v.clock, newClock) === 'concurrent'
    )

    surviving.push({ value, clock: newClock })
    this.data.set(key, surviving)

    return newClock
  }

  read(key: string): VersionedValue<T>[] {
    // Return ALL concurrent versions — client must resolve conflict
    return this.data.get(key) ?? []
  }

  private getLatestClock(key: string): VectorClock {
    const versions = this.data.get(key) ?? []
    let merged: VectorClock = {}
    for (const v of versions) {
      merged = merge(merged, v.clock)
    }
    return merged
  }
}

// Usage: Amazon Dynamo-style shopping cart
const store = new EventuallyConsistentStore<string[]>('node-1')

// User adds item on device A
const clock1 = store.write('cart:user-123', ['item-A'], {})
// User adds item on device B (concurrent, before sync)
const clock2 = store.write('cart:user-123', ['item-B'], {})

// Read returns BOTH versions — application must merge
const versions = store.read('cart:user-123')
// versions = [{ value: ['item-A'], clock: ... }, { value: ['item-B'], clock: ... }]
// Application merges: ['item-A', 'item-B'] (union)`,
        },
      ],
      ascii: `
  Node A         Node B         Node C
  [A:0,B:0,C:0] [A:0,B:0,C:0] [A:0,B:0,C:0]
       │              │              │
  write x=1           │              │
  [A:1,B:0,C:0]      │              │
       │──── send ───→│              │
       │         merge+inc           │
       │         [A:1,B:1,C:0]      │
       │              │              │
       │              │         write z=3
       │              │         [A:0,B:0,C:1]
       │              │              │
       │              │←─── send ───│
       │         merge+inc           │
       │         [A:1,B:2,C:1]      │

  Compare [A:1,B:0,C:0] vs [A:0,B:0,C:1]:
  A: 1 > 0 (a wins)
  B: 0 = 0 (tie)
  C: 0 < 1 (b wins)
  Result: CONCURRENT → conflict!`,
      useCases: [
        'Amazon Dynamo: conflict detection for shopping cart (union merge)',
        'Riak: version vectors for all keys — clients resolve concurrent writes',
        'CRDTs: some CRDT implementations use vector clocks for causality tracking',
        'Distributed databases: detecting write-write conflicts in multi-master replication',
      ],
      commonPitfalls: [
        'Clock growing unboundedly: vector clock size grows with the number of nodes — use pruning or version vectors',
        'Confusing vector clocks with Lamport timestamps: Lamport timestamps cannot detect concurrency — vector clocks can',
        'Not providing a merge function: application must resolve concurrent versions — you cannot just pick one randomly',
      ],
      interviewTips: [
        'Explain the three operations: increment, merge, compare',
        'Show how to detect concurrent events (neither is before the other)',
        'Use the Amazon shopping cart example — it is concrete and memorable',
        'Contrast with Lamport timestamps: Lamport tells you ordering but not concurrency',
      ],
      relatedConcepts: ['eventual-consistency-patterns', 'cap-theorem', 'consensus-algorithms'],
      difficulty: 'expert',
      tags: ['distributed-systems', 'consistency', 'theory'],
      proTip: 'In practice, many systems use Hybrid Logical Clocks (HLC) instead of vector clocks. HLC combines physical time with a logical counter, giving you causality tracking without the unbounded growth of vector clocks. CockroachDB and YugabyteDB both use HLC.',
    },
    {
      id: 'gossip-protocol',
      title: 'Gossip Protocol',
      description: 'Gossip protocols disseminate information through a cluster by having each node periodically share state with random peers — like how rumors spread in a social network. They provide eventual consistency with O(log n) convergence and high fault tolerance.',
      keyPoints: [
        'Epidemic dissemination: each node periodically picks a random peer and exchanges state',
        'Convergence time: O(log n) rounds for information to reach all n nodes — very fast',
        'Failure detection: if a node does not respond to gossip, it is marked as suspected, then dead',
        'SWIM protocol: Scalable Weakly-consistent Infection-style Membership — used by Consul, Serf',
        'Anti-entropy: nodes periodically compare full state and reconcile differences — slower but guarantees convergence',
        'Rumor mongering: nodes spread new updates aggressively, stop when enough peers have it — faster for hot updates',
        'Cassandra: uses gossip for cluster membership, schema changes, and token ring information',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Simplified Gossip Protocol',
          code: `interface NodeState {
  nodeId: string
  data: Record<string, { value: unknown; version: number }>
  heartbeat: number
  status: 'alive' | 'suspect' | 'dead'
}

class GossipNode {
  private readonly nodeId: string
  private state: NodeState
  private peers = new Map<string, NodeState>()
  private gossipInterval: NodeJS.Timeout | null = null

  constructor(nodeId: string) {
    this.nodeId = nodeId
    this.state = {
      nodeId,
      data: {},
      heartbeat: 0,
      status: 'alive',
    }
  }

  // Set a value — will be gossiped to all peers
  setValue(key: string, value: unknown): void {
    const existing = this.state.data[key]
    this.state.data[key] = {
      value,
      version: (existing?.version ?? 0) + 1,
    }
  }

  // Start periodic gossip
  start(intervalMs: number = 1000): void {
    this.gossipInterval = setInterval(() => {
      this.state.heartbeat++
      this.gossipWithRandomPeer()
      this.detectFailures()
    }, intervalMs)
  }

  private gossipWithRandomPeer(): void {
    const alivePeers = Array.from(this.peers.values())
      .filter((p) => p.status !== 'dead')
    if (alivePeers.length === 0) return

    // Pick random peer
    const target = alivePeers[Math.floor(Math.random() * alivePeers.length)]

    // Send our state, receive theirs (simulated)
    this.mergeState(target)
  }

  // Merge remote state — keep higher version values
  mergeState(remote: NodeState): void {
    // Update peer info
    this.peers.set(remote.nodeId, { ...remote, status: 'alive' })

    // Merge data — keep higher version
    for (const [key, remoteEntry] of Object.entries(remote.data)) {
      const localEntry = this.state.data[key]
      if (!localEntry || remoteEntry.version > localEntry.version) {
        this.state.data[key] = { ...remoteEntry }
      }
    }
  }

  // Failure detection — mark nodes with stale heartbeats
  private detectFailures(): void {
    for (const [peerId, peerState] of this.peers) {
      const heartbeatAge = this.state.heartbeat - peerState.heartbeat
      if (heartbeatAge > 10 && peerState.status === 'alive') {
        this.peers.set(peerId, { ...peerState, status: 'suspect' })
      }
      if (heartbeatAge > 30 && peerState.status === 'suspect') {
        this.peers.set(peerId, { ...peerState, status: 'dead' })
      }
    }
  }

  stop(): void {
    if (this.gossipInterval) clearInterval(this.gossipInterval)
  }
}`,
        },
      ],
      useCases: [
        'Cassandra: cluster membership, schema propagation, token ring discovery',
        'Consul/Serf: membership management, failure detection via SWIM',
        'Redis Cluster: node discovery and health monitoring via gossip',
        'Blockchain: block and transaction propagation in peer-to-peer networks',
      ],
      commonPitfalls: [
        'Gossip overhead: in large clusters (1000+ nodes), gossip traffic can consume significant bandwidth',
        'Convergence delay: O(log n) rounds means updates take seconds to propagate — not suitable for strong consistency',
        'False positive failure detection: network blip marks a healthy node as dead — use suspicion mechanism (SWIM)',
      ],
      interviewTips: [
        'Mention O(log n) convergence — it is surprisingly fast for epidemic dissemination',
        'Discuss the trade-off: eventual consistency and high availability, not strong consistency',
        'Give Cassandra as the canonical example of gossip in production',
      ],
      relatedConcepts: ['eventual-consistency-patterns', 'consensus-algorithms', 'service-discovery'],
      difficulty: 'advanced',
      tags: ['distributed-systems', 'networking', 'membership'],
    },
    {
      id: 'two-phase-commit',
      title: 'Two-Phase Commit (2PC)',
      description: '2PC is a protocol for atomic transactions across multiple databases or services. Phase 1: coordinator asks participants to prepare. Phase 2: coordinator tells all to commit or abort. It is correct but blocking: a coordinator failure can leave participants stuck.',
      keyPoints: [
        'Phase 1 (Prepare): coordinator sends "prepare" to all participants — each responds "yes" (can commit) or "no" (must abort)',
        'Phase 2 (Commit/Abort): if all voted "yes," coordinator sends "commit"; if any voted "no," sends "abort"',
        'Coordinator failure: if coordinator crashes between phase 1 and 2, participants are stuck holding locks — blocking protocol',
        'WAL on coordinator: coordinator writes its decision to WAL before sending phase 2 messages — recoverable after crash',
        'In doubt: if a participant does not receive phase 2, it cannot decide on its own — must wait for coordinator recovery',
        'Performance: holds locks during both phases — high latency for distributed transactions',
        'Used by: XA transactions, databases with distributed transaction support',
      ],
      codeExamples: [
        {
          language: 'text',
          label: '2PC Protocol Flow',
          code: `
  SUCCESS CASE:
  ═════════════
  Coordinator          Participant A       Participant B
       │                    │                    │
       │── PREPARE ────────→│                    │
       │── PREPARE ─────────│───────────────────→│
       │                    │                    │
       │←── YES ────────────│                    │
       │←── YES ────────────│────────────────────│
       │                    │                    │
       │ (write COMMIT to WAL)                   │
       │                    │                    │
       │── COMMIT ─────────→│                    │
       │── COMMIT ──────────│───────────────────→│
       │                    │                    │
       │←── ACK ────────────│                    │
       │←── ACK ────────────│────────────────────│
       ✓ Transaction committed on all participants

  FAILURE CASE:
  ═════════════
  Coordinator          Participant A       Participant B
       │                    │                    │
       │── PREPARE ────────→│                    │
       │── PREPARE ─────────│───────────────────→│
       │                    │                    │
       │←── YES ────────────│                    │
       │←── NO ─────────────│────────────────────│
       │                    │                    │
       │ (write ABORT to WAL)                    │
       │                    │                    │
       │── ABORT ──────────→│                    │
       │── ABORT ───────────│───────────────────→│
       ✓ Transaction aborted on all participants

  COORDINATOR CRASH (the dangerous case):
  ═══════════════════════════════════════
  Coordinator          Participant A       Participant B
       │                    │                    │
       │── PREPARE ────────→│                    │
       │── PREPARE ─────────│───────────────────→│
       │                    │                    │
       │←── YES ────────────│                    │
       │←── YES ────────────│────────────────────│
       │                    │                    │
       ✗ CRASH!             │                    │
                            │                    │
                       STUCK: voted YES,    STUCK: voted YES,
                       holding locks,       holding locks,
                       cannot commit or     cannot commit or
                       abort alone          abort alone`,
        },
      ],
      useCases: [
        'XA transactions: JDBC XA for transactions across multiple databases',
        'Distributed SQL: CockroachDB uses an optimized 2PC internally (parallel commits)',
        'Legacy systems: cross-database transactions where eventual consistency is not acceptable',
      ],
      commonPitfalls: [
        'Coordinator SPOF: if coordinator crashes between prepare and commit, participants are blocked with locks held',
        'Long lock duration: locks held during both phases — other transactions wait, causing throughput collapse',
        'Network partition: participant that voted YES but cannot reach coordinator must wait indefinitely',
        'Using 2PC across services: prohibitively slow for microservice transactions — use saga pattern instead',
      ],
      interviewTips: [
        'Explain both the success and failure (coordinator crash) scenarios',
        'Note that 2PC is blocking — contrast with the saga pattern which is non-blocking',
        'Mention that modern distributed databases (CockroachDB) optimize 2PC to reduce latency',
        'State that for microservices, saga > 2PC due to the blocking problem',
      ],
      relatedConcepts: ['three-phase-commit', 'saga-pattern', 'consensus-algorithms'],
      difficulty: 'advanced',
      tags: ['distributed-systems', 'transactions', 'theory'],
    },
    {
      id: 'three-phase-commit',
      title: 'Three-Phase Commit (3PC)',
      description: '3PC adds a "pre-commit" phase between prepare and commit to make the protocol non-blocking. In theory, this solves the coordinator crash problem. In practice, it is not used because it still fails under network partitions and is more complex.',
      keyPoints: [
        'Adds pre-commit phase: coordinator sends "pre-commit" after all vote YES, before final "commit"',
        'Non-blocking: if coordinator crashes after pre-commit, participants know the decision was to commit (they all voted YES)',
        'Still has issues: network partition can cause some participants to pre-commit while others abort — inconsistency',
        'Why not used in practice: the partition problem makes it no better than 2PC for real networks, and it is more complex',
        'Paxos/Raft are the real solution: consensus protocols handle coordinator failure correctly',
      ],
      useCases: [
        'Academic interest: understanding the evolution from 2PC to consensus protocols',
        'Historical context: 3PC showed that non-blocking atomic commit needs consensus',
      ],
      commonPitfalls: [
        'Implementing 3PC for production: Paxos or Raft-based systems are strictly better',
        'Assuming 3PC solves all 2PC problems: it solves blocking but not partition-induced inconsistency',
      ],
      interviewTips: [
        'Mention 3PC as an attempt to solve the 2PC blocking problem',
        'Explain why it is not used: network partitions still cause issues',
        'Pivot to consensus algorithms (Raft) as the correct modern solution',
      ],
      relatedConcepts: ['two-phase-commit', 'consensus-algorithms', 'saga-pattern'],
      difficulty: 'expert',
      tags: ['distributed-systems', 'transactions', 'theory'],
    },
    {
      id: 'eventual-consistency-patterns',
      title: 'Eventual Consistency Patterns',
      description: 'When you choose availability over consistency (AP in CAP), you need strategies to handle concurrent updates and conflicts. CRDTs, last-write-wins, and custom merge functions are the tools for building correct eventually consistent systems.',
      keyPoints: [
        'CRDTs (Conflict-free Replicated Data Types): data structures that automatically merge without conflicts — mathematically guaranteed convergence',
        'G-Counter (grow-only counter): each node has its own counter, total = sum of all node counters — no conflicts possible',
        'PN-Counter (positive-negative): two G-Counters (one for increments, one for decrements) — supports both add and subtract',
        'LWW-Register (Last Writer Wins): each write has a timestamp, highest timestamp wins — simple but loses concurrent updates',
        'OR-Set (Observed-Remove Set): tracks add/remove operations with unique tags — supports concurrent add and remove',
        'Merge functions: application-specific logic to combine concurrent writes (e.g., union of shopping cart items)',
        'Operational Transforms: concurrent text editing (Google Docs) — transforms operations based on concurrent edits',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'CRDT Implementations',
          code: `// G-Counter: grow-only counter (no conflicts possible)
class GCounter {
  private counts: Record<string, number> = {}

  constructor(private readonly nodeId: string) {}

  increment(amount: number = 1): void {
    this.counts[this.nodeId] = (this.counts[this.nodeId] ?? 0) + amount
  }

  value(): number {
    return Object.values(this.counts).reduce((sum, c) => sum + c, 0)
  }

  merge(other: GCounter): GCounter {
    const merged = new GCounter(this.nodeId)
    const allNodes = new Set([
      ...Object.keys(this.counts),
      ...Object.keys(other.counts),
    ])
    for (const node of allNodes) {
      merged.counts[node] = Math.max(
        this.counts[node] ?? 0,
        other.counts[node] ?? 0
      )
    }
    return merged
  }
}

// LWW-Register: last writer wins (timestamp-based)
class LWWRegister<T> {
  private value_: T | null = null
  private timestamp_ = 0

  set(value: T, timestamp: number = Date.now()): void {
    if (timestamp > this.timestamp_) {
      this.value_ = value
      this.timestamp_ = timestamp
    }
  }

  get(): T | null {
    return this.value_
  }

  merge(other: LWWRegister<T>): LWWRegister<T> {
    const merged = new LWWRegister<T>()
    if (this.timestamp_ >= other.timestamp_) {
      merged.value_ = this.value_
      merged.timestamp_ = this.timestamp_
    } else {
      merged.value_ = other.value_
      merged.timestamp_ = other.timestamp_
    }
    return merged
  }
}

// OR-Set: add and remove without conflicts
class ORSet<T> {
  // Each element is tagged with a unique ID when added
  private elements = new Map<string, { value: T; tag: string }>()
  private tombstones = new Set<string>()

  add(value: T): void {
    const tag = crypto.randomUUID()
    this.elements.set(tag, { value, tag })
  }

  remove(value: T): void {
    for (const [tag, entry] of this.elements) {
      if (entry.value === value) {
        this.tombstones.add(tag)
        this.elements.delete(tag)
      }
    }
  }

  values(): T[] {
    return [...new Set(
      Array.from(this.elements.values()).map((e) => e.value)
    )]
  }

  merge(other: ORSet<T>): ORSet<T> {
    const merged = new ORSet<T>()
    merged.tombstones = new Set([...this.tombstones, ...other.tombstones])

    // Keep elements that are not tombstoned
    for (const [tag, entry] of this.elements) {
      if (!merged.tombstones.has(tag)) {
        merged.elements.set(tag, entry)
      }
    }
    for (const [tag, entry] of other.elements) {
      if (!merged.tombstones.has(tag)) {
        merged.elements.set(tag, entry)
      }
    }
    return merged
  }
}`,
        },
      ],
      useCases: [
        'G-Counter: distributed page view counters, like counts across data centers',
        'LWW-Register: user profile updates in multi-master replication',
        'OR-Set: shopping cart items, shared document tags, collaborative lists',
        'CRDTs in general: any system where multiple replicas accept writes independently (offline-first apps, multi-region)',
      ],
      commonPitfalls: [
        'LWW with clock skew: if clocks are not synchronized, "last" is ambiguous — use hybrid logical clocks',
        'Growing CRDTs without garbage collection: tombstones accumulate forever in OR-Set — need periodic GC',
        'Assuming all data can be a CRDT: some business logic has inherent conflicts that CRDTs cannot resolve automatically',
      ],
      interviewTips: [
        'Explain CRDTs as "data structures that can be merged without coordination"',
        'Give the G-Counter as the simplest example: each node counts locally, total is the sum',
        'Discuss LWW trade-offs: simple but loses data on concurrent writes — sometimes acceptable, sometimes not',
        'Mention that Redis CRDTs (Redis Enterprise) offer this out of the box for global replication',
      ],
      relatedConcepts: ['cap-theorem', 'base-properties', 'vector-clocks', 'database-replication'],
      difficulty: 'expert',
      tags: ['distributed-systems', 'consistency', 'crdt'],
      proTip: 'Figma uses CRDTs for real-time collaborative design editing. They found that CRDTs eliminate the need for a central coordination server, enabling true peer-to-peer collaboration. Their blog post on "How Figma\'s multiplayer technology works" is an excellent real-world CRDT case study.',
    },
    {
      id: 'distributed-tracing',
      title: 'Distributed Tracing',
      description: 'Distributed tracing follows a request as it flows through multiple services. A trace is a tree of spans, where each span represents one unit of work. Without tracing, debugging a 500 error in a microservice architecture means grepping logs across 20 services.',
      keyPoints: [
        'Trace ID: unique identifier for the entire request flow — propagated across all services',
        'Span ID: unique identifier for a single operation within a trace — parent-child relationships form a tree',
        'W3C TraceContext header: traceparent: 00-<trace-id>-<span-id>-<flags> — standard propagation format',
        'Context propagation: pass trace context through HTTP headers, gRPC metadata, Kafka message headers',
        'Jaeger: Uber\'s open-source tracing system — stores traces, provides UI for analysis',
        'Zipkin: Twitter\'s open-source tracing — simpler than Jaeger, good for smaller deployments',
        'OpenTelemetry (OTEL): vendor-neutral observability framework — traces, metrics, and logs in one SDK',
        'Sampling: tracing every request is expensive — sample 1-10% in production, 100% for errors',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'OpenTelemetry Tracing Setup',
          code: `import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg'
import { trace, SpanStatusCode } from '@opentelemetry/api'

// Initialize OTEL SDK
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://jaeger:4318/v1/traces',
  }),
  instrumentations: [
    new HttpInstrumentation(),     // Auto-instrument HTTP client/server
    new ExpressInstrumentation(),  // Auto-instrument Express routes
    new PgInstrumentation(),       // Auto-instrument PostgreSQL queries
  ],
})

sdk.start()

// Manual span creation for business logic
const tracer = trace.getTracer('order-service')

async function processOrder(orderId: string): Promise<void> {
  // Create a custom span
  return tracer.startActiveSpan('processOrder', async (span) => {
    span.setAttribute('order.id', orderId)

    try {
      // Child span: validate order
      await tracer.startActiveSpan('validateOrder', async (validateSpan) => {
        const isValid = await validateOrder(orderId)
        validateSpan.setAttribute('order.valid', isValid)
        validateSpan.end()
      })

      // Child span: charge payment
      await tracer.startActiveSpan('chargePayment', async (paymentSpan) => {
        const paymentId = await chargePayment(orderId)
        paymentSpan.setAttribute('payment.id', paymentId)
        paymentSpan.end()
      })

      span.setStatus({ code: SpanStatusCode.OK })
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      span.recordException(error as Error)
      throw error
    } finally {
      span.end()
    }
  })
}`,
        },
      ],
      ascii: `
  Trace ID: abc123 (entire request flow)

  ┌─────────────────────────────────────────────────────┐
  │ Span: API Gateway (span-1)                    150ms │
  │  ┌──────────────────────────────────────────────┐   │
  │  │ Span: Order Service (span-2)           120ms │   │
  │  │  ┌─────────────────────┐                     │   │
  │  │  │ Span: Validate  15ms│                     │   │
  │  │  └─────────────────────┘                     │   │
  │  │  ┌──────────────────────────────┐            │   │
  │  │  │ Span: Payment Service   80ms │            │   │
  │  │  │  ┌─────────────────────┐     │            │   │
  │  │  │  │ Span: DB Query  5ms │     │            │   │
  │  │  │  └─────────────────────┘     │            │   │
  │  │  └──────────────────────────────┘            │   │
  │  │  ┌──────────────────┐                        │   │
  │  │  │ Span: Notify 10ms│                        │   │
  │  │  └──────────────────┘                        │   │
  │  └──────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────┘`,
      useCases: [
        'Debugging latency: find the slowest span in a request — identify the bottleneck service',
        'Error investigation: trace a 500 error from the API gateway to the failing internal service',
        'Dependency mapping: visualize which services talk to which — automatically generated from traces',
        'SLA monitoring: measure end-to-end latency percentiles (p50, p95, p99) across the full request path',
      ],
      commonPitfalls: [
        'Not propagating context: if one service does not propagate the trace header, the trace breaks',
        'Tracing everything: 100% sampling on high-traffic services generates terabytes of trace data — use head/tail sampling',
        'Missing database spans: auto-instrumentation for DB clients is essential — manual-only tracing misses the biggest latency sources',
        'Not correlating traces with logs: use trace_id in structured logs for unified observability',
      ],
      interviewTips: [
        'Explain trace ID and span ID propagation — the core mechanism',
        'Mention OpenTelemetry as the modern standard (replacing Jaeger/Zipkin-specific SDKs)',
        'Discuss sampling strategies: head sampling (decide at start) vs tail sampling (decide after trace completes)',
      ],
      relatedConcepts: ['service-discovery', 'api-gateway', 'circuit-breaker'],
      difficulty: 'intermediate',
      tags: ['distributed-systems', 'observability', 'debugging'],
      proTip: 'Tail-based sampling (offered by OTEL Collector) is far more useful than head-based: it captures 100% of error traces and slow traces, while sampling normal traces at 1-5%. This means you never miss debugging data for problems, while keeping costs low for normal traffic.',
    },
    {
      id: 'service-discovery',
      title: 'Service Discovery',
      description: 'Service discovery is how services find each other in a dynamic environment where instances are created and destroyed constantly. Without it, you are hardcoding IP addresses — which breaks the moment an instance moves or scales.',
      keyPoints: [
        'Client-side discovery: client queries a registry (Eureka) and load-balances itself — more control, more client complexity',
        'Server-side discovery: client sends to a known endpoint (LB/proxy), which routes to a healthy instance — simpler client',
        'DNS-based: services register DNS records, clients resolve hostname — simplest but TTL caching causes staleness',
        'Consul: HashiCorp service mesh — HTTP API + DNS interface, health checking, key-value store',
        'Eureka + Ribbon (Netflix): client-side discovery — Eureka is the registry, Ribbon is the client-side LB (Spring Cloud)',
        'Kubernetes service discovery: built-in — kube-dns resolves service names, kube-proxy routes traffic',
        'Health checking: services must report health — unhealthy instances removed from discovery',
        'Sidecar pattern: service mesh proxy (Envoy) handles discovery transparently — application code unchanged',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Service Discovery with Consul',
          code: `import Consul from 'consul'

const consul = new Consul({ host: process.env.CONSUL_HOST ?? 'localhost' })

const SERVICE_ID = \`order-service-\${process.env.HOSTNAME}\`

// Register this service instance
async function registerService(): Promise<void> {
  await consul.agent.service.register({
    id: SERVICE_ID,
    name: 'order-service',
    address: process.env.POD_IP ?? '127.0.0.1',
    port: 3000,
    tags: ['v2', 'production'],
    check: {
      http: \`http://\${process.env.POD_IP}:3000/health\`,
      interval: '10s',
      timeout: '5s',
      deregistercriticalserviceafter: '30s',
    },
  })

  // Deregister on shutdown
  process.on('SIGTERM', async () => {
    await consul.agent.service.deregister(SERVICE_ID)
    process.exit(0)
  })
}

// Discover healthy instances of a service
async function discoverService(
  serviceName: string
): Promise<Array<{ address: string; port: number }>> {
  const result = await consul.health.service({
    service: serviceName,
    passing: true, // Only healthy instances
  })

  return result.map((entry: { Service: { Address: string; Port: number } }) => ({
    address: entry.Service.Address,
    port: entry.Service.Port,
  }))
}

// Client-side load balancing
let roundRobinIndex = 0

async function callService(
  serviceName: string,
  path: string
): Promise<unknown> {
  const instances = await discoverService(serviceName)
  if (instances.length === 0) {
    throw new Error(\`No healthy instances of \${serviceName}\`)
  }

  // Round-robin selection
  const instance = instances[roundRobinIndex % instances.length]
  roundRobinIndex++

  const response = await fetch(
    \`http://\${instance.address}:\${instance.port}\${path}\`
  )
  return response.json()
}

// Usage
await registerService()
const userData = await callService('user-service', '/api/users/123')`,
        },
      ],
      ascii: `
  CLIENT-SIDE DISCOVERY:          SERVER-SIDE DISCOVERY:
  ┌────────┐                      ┌────────┐
  │ Client │                      │ Client │
  └───┬────┘                      └───┬────┘
      │ 1. Query registry              │ 1. Request to LB
      ▼                                ▼
  ┌──────────┐                    ┌──────────┐
  │ Registry │                    │Load      │
  │ (Eureka) │                    │Balancer  │ 2. Query registry
  └──────────┘                    └───┬──────┘    internally
      │ 2. Get instances               │
      ▼                                ▼
  3. Client picks one             3. LB routes to instance
  ┌───┐ ┌───┐ ┌───┐              ┌───┐ ┌───┐ ┌───┐
  │S1 │ │S2 │ │S3 │              │S1 │ │S2 │ │S3 │
  └───┘ └───┘ └───┘              └───┘ └───┘ └───┘

  Kubernetes: DNS-based + kube-proxy
  curl http://order-service.default.svc.cluster.local:3000
  (kube-dns resolves, kube-proxy routes to healthy pod)`,
      useCases: [
        'Microservice architectures: services discover each other dynamically as instances scale',
        'Kubernetes: built-in service discovery via DNS — no external registry needed',
        'Multi-cloud/hybrid: Consul connects services across clouds and on-prem',
        'Blue-green deployments: shift traffic by updating service registrations',
      ],
      commonPitfalls: [
        'Hardcoding IP addresses: instances change IPs when they restart — always use service names',
        'DNS TTL caching: client caches stale DNS records — use low TTL (5-30s) or client-side registry',
        'No health checking: dead instances stay in the registry and receive traffic',
        'Registry as SPOF: if Consul/Eureka goes down, no service can discover another — run clustered',
      ],
      interviewTips: [
        'Distinguish client-side vs server-side discovery and when each is appropriate',
        'Mention Kubernetes service discovery as the simplest answer for containerized systems',
        'Discuss health checking as essential — discovery without health checking routes traffic to dead services',
      ],
      relatedConcepts: ['load-balancing', 'api-gateway', 'distributed-tracing'],
      difficulty: 'intermediate',
      tags: ['distributed-systems', 'infrastructure', 'microservices'],
      proTip: 'In Kubernetes, you get three levels of service discovery for free: (1) cluster DNS (service-name.namespace), (2) environment variables (SERVICE_HOST, SERVICE_PORT), (3) headless services for direct pod addressing. Before adding Consul or Eureka to a K8s cluster, check if built-in discovery is sufficient — it usually is.',
    },
  ],
}
