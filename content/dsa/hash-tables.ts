// @ts-nocheck
import type { Category } from '@/lib/types'

export const hashTablesCategory: Category = {
  id: 'hash-tables',
  title: 'Hash Tables',
  description: 'The most important data structure in practice — from hash function design to collision resolution strategies, consistent hashing for distributed systems, and probabilistic filters. Understanding hash table internals separates those who use them from those who can debug them.',
  icon: '#️⃣',
  concepts: [
    {
      id: 'hash-function-design',
      title: 'Hash Function Design',
      description:
        'A hash function maps arbitrary-size keys to fixed-size integers (indices into a table). A good hash function has three properties: deterministic (same key → same hash), uniform distribution (even spread across buckets), and avalanche effect (small input change → large output change). The choice of hash function affects collision rate, security against adversarial inputs, and performance.',
      timeComplexity: {
        best: 'O(L) where L is key length',
        average: 'O(L)',
        worst: 'O(L)',
      },
      spaceComplexity: 'O(1) — fixed output size',
      keyPoints: [
        'Polynomial rolling hash: h = s[0]*p^(n-1) + s[1]*p^(n-2) + ... + s[n-1]; choose prime p and prime modulus M',
        'djb2: hash = 5381; for each char: hash = hash * 33 + char — simple, fast, decent distribution',
        'FNV-1a: XOR each byte into hash, then multiply by FNV prime — good for short keys',
        'MurmurHash3: fast non-cryptographic hash with excellent avalanche properties — used by many hash tables',
        'Avalanche effect: flipping one input bit should flip ~50% of output bits on average',
        'For hash tables: speed matters more than cryptographic strength — use MurmurHash, xxHash, or wyhash',
        'Modular hashing: h(k) = k mod M; choose M as prime far from power of 2 for better distribution',
        'Multiplicative hashing: h(k) = floor(M * (k * A mod 1)) where A ≈ (sqrt(5)-1)/2 — avoids modulo',
        'Python uses SipHash for string hashing (protection against hash-flooding DoS attacks)',
      ],
      useCases: [
        'Hash table index computation',
        'Rabin-Karp string matching (rolling hash enables O(1) window slide)',
        'Data deduplication (content-addressable storage)',
        'Checksums for data integrity verification',
      ],
      commonPitfalls: [
        'Using modulo with power-of-2 table size: only low bits of hash are used — use prime or multiply-shift',
        'Java\'s String.hashCode() is weak: "Aa" and "BB" have the same hash — known collision pairs exist',
        'Not handling negative hash values: (hash % M) can be negative in some languages — use ((hash % M) + M) % M',
        'Using Math.random() in hash function: hash must be deterministic — same key must always give same hash',
      ],
      interviewTips: [
        'Know at least one hash function by name and how it works (djb2 is simplest)',
        'Understand why table size should be prime (reduces clustering with modular hashing)',
        'Be able to explain the birthday paradox: with n items in m buckets, expect first collision at ~sqrt(m)',
      ],
      relatedConcepts: ['chaining', 'open-addressing', 'bloom-filter', 'consistent-hashing'],
      difficulty: 'intermediate',
      tags: ['hash-function', 'hashing', 'distribution', 'avalanche'],
      proTip:
        'Modern hash tables (Swiss Table in Abseil, hashbrown in Rust) use the hash value twice: high bits for bucket selection, low bits (or separate hash) for SIMD-based probe sequence within a group of 16 entries. This achieves both good distribution and cache-friendly probing in a single hash computation.',
    },
    {
      id: 'chaining',
      title: 'Chaining (Separate Chaining)',
      description:
        'Each hash table bucket points to a linked list (or tree) of entries that hashed to the same index. Lookup traverses the chain at the target bucket. With a good hash function and load factor alpha < 1, expected chain length is alpha, giving O(1) expected lookup. Java HashMap uses chaining with a twist: when a bucket exceeds 8 entries, the chain converts to a Red-Black tree for O(log n) worst-case.',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1 + alpha) where alpha = n/m',
        worst: 'O(n) — all elements in one bucket',
      },
      spaceComplexity: 'O(n + m) — n entries + m buckets',
      keyPoints: [
        'Load factor alpha = n/m where n = entries, m = buckets; keep alpha < 0.75 for good performance',
        'Resize (rehash): when alpha exceeds threshold, double table size and rehash all entries — O(n)',
        'Expected chain length = alpha; with alpha = 0.75, average chain is < 1 entry',
        'Worst case O(n): adversarial inputs can force all keys to same bucket (hash-flooding attack)',
        'Java HashMap: array of linked list nodes; at bucket size > 8, treeify into Red-Black tree',
        'Java HashMap: at bucket size < 6 (after deletion), untreeify back to linked list',
        'Memory overhead: each entry has a next pointer (or tree pointers after treeification)',
        'Cache unfriendly: chains are linked lists → pointer chasing → cache misses',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Hash Table with Separate Chaining',
          code: `class HashTable<K, V> {
  private buckets: [K, V][][];
  private count = 0;
  private capacity: number;
  private readonly loadFactorThreshold = 0.75;

  constructor(initialCapacity = 16) {
    this.capacity = initialCapacity;
    this.buckets = new Array(this.capacity).fill(null).map(() => []);
  }

  private hash(key: K): number {
    const str = String(key);
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33 + str.charCodeAt(i)) >>> 0;
    }
    return hash % this.capacity;
  }

  set(key: K, value: V): void {
    if (this.count / this.capacity >= this.loadFactorThreshold) {
      this.resize();
    }
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket[i] = [key, value]; // immutable tuple replacement
        return;
      }
    }
    bucket.push([key, value]);
    this.count++;
  }

  get(key: K): V | undefined {
    const idx = this.hash(key);
    for (const [k, v] of this.buckets[idx]) {
      if (k === key) return v;
    }
    return undefined;
  }

  delete(key: K): boolean {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    const i = bucket.findIndex(([k]) => k === key);
    if (i === -1) return false;
    bucket.splice(i, 1);
    this.count--;
    return true;
  }

  private resize(): void {
    const oldBuckets = this.buckets;
    this.capacity *= 2;
    this.buckets = new Array(this.capacity).fill(null).map(() => []);
    this.count = 0;
    for (const bucket of oldBuckets) {
      for (const [key, value] of bucket) {
        this.set(key, value);
      }
    }
  }

  get size(): number {
    return this.count;
  }
}`,
        },
      ],
      useCases: [
        'General-purpose key-value storage (most language HashMap/Dictionary implementations)',
        'Symbol tables in compilers and interpreters',
        'Caching (memoization, LRU cache backing store)',
        'Counting frequencies (word count, character frequency)',
      ],
      commonPitfalls: [
        'Not resizing: letting load factor grow past 1.0 makes average lookup O(n)',
        'Hash function with poor distribution: all entries cluster in few buckets despite low load factor',
        'Rehashing during iteration: modifying table during iteration invalidates iterators — ConcurrentModificationException in Java',
        'Using mutable objects as keys: if key changes after insertion, hash changes and entry is "lost"',
      ],
      interviewTips: [
        'Know load factor, why 0.75 is chosen (balances memory waste vs collision rate), and what triggers resize',
        'Java HashMap detail: treeify threshold is 8 — this prevents O(n) worst-case in hash-flooding attacks',
        'Implement a simple hash table from scratch: this is a common interview coding question',
      ],
      relatedConcepts: ['hash-function-design', 'open-addressing', 'hashmap-internals'],
      difficulty: 'intermediate',
      tags: ['chaining', 'hash-table', 'linked-list', 'collision'],
      proTip:
        'Java\'s choice of 0.75 load factor is not arbitrary — it comes from Poisson distribution analysis. At alpha = 0.75, the probability of a bucket having >= 8 entries is about 0.00000006. That is why 8 is the treeification threshold: it should almost never trigger under normal (non-adversarial) conditions.',
    },
    {
      id: 'open-addressing',
      title: 'Open Addressing',
      description:
        'All entries are stored directly in the hash table array — no linked lists. When a collision occurs, the algorithm probes subsequent positions following a deterministic sequence until an empty slot is found. Linear probing is simplest and most cache-friendly, but suffers from primary clustering. Quadratic probing and double hashing reduce clustering at the cost of cache locality. Modern high-performance hash tables (Swiss Table, F14) use open addressing with SIMD.',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1/(1-alpha)) for linear probing',
        worst: 'O(n) — table nearly full',
      },
      spaceComplexity: 'O(n) — no pointer overhead per entry',
      keyPoints: [
        'Linear probing: h(k, i) = (h(k) + i) mod M — simple, cache-friendly, but primary clustering',
        'Primary clustering: long runs of occupied slots form, making subsequent insertions probe further',
        'Quadratic probing: h(k, i) = (h(k) + c1*i + c2*i²) mod M — reduces primary clustering but creates secondary clustering',
        'Double hashing: h(k, i) = (h1(k) + i*h2(k)) mod M — best distribution but worst cache behavior',
        'Load factor MUST stay below 1.0 (typically < 0.7) — performance degrades rapidly as table fills',
        'Deletion is tricky: cannot just remove entry (breaks probe chain) — use tombstones or backward shift',
        'Tombstone: mark deleted slot as "deleted" (not empty) so probing continues through it',
        'Robin Hood hashing: steal from rich (short probe) to give to poor (long probe) — reduces variance',
        'Swiss Table (Google): open addressing + SIMD parallel comparison of 16 entries — state of the art',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Linear Probing Hash Table',
          code: `class LinearProbingHashTable<V> {
  private keys: (string | null | 'DELETED')[];
  private vals: (V | undefined)[];
  private count = 0;
  private capacity: number;

  constructor(capacity = 16) {
    this.capacity = capacity;
    this.keys = new Array(capacity).fill(null);
    this.vals = new Array(capacity);
  }

  private hash(key: string): number {
    let h = 0;
    for (let i = 0; i < key.length; i++) {
      h = (h * 31 + key.charCodeAt(i)) >>> 0;
    }
    return h % this.capacity;
  }

  set(key: string, value: V): void {
    if (this.count >= this.capacity * 0.7) this.resize(this.capacity * 2);

    let idx = this.hash(key);
    while (this.keys[idx] !== null && this.keys[idx] !== 'DELETED') {
      if (this.keys[idx] === key) {
        this.vals[idx] = value;
        return;
      }
      idx = (idx + 1) % this.capacity;
    }
    this.keys[idx] = key;
    this.vals[idx] = value;
    this.count++;
  }

  get(key: string): V | undefined {
    let idx = this.hash(key);
    while (this.keys[idx] !== null) {
      if (this.keys[idx] === key) return this.vals[idx];
      idx = (idx + 1) % this.capacity;
    }
    return undefined;
  }

  delete(key: string): boolean {
    let idx = this.hash(key);
    while (this.keys[idx] !== null) {
      if (this.keys[idx] === key) {
        this.keys[idx] = 'DELETED'; // tombstone
        this.vals[idx] = undefined;
        this.count--;
        return true;
      }
      idx = (idx + 1) % this.capacity;
    }
    return false;
  }

  private resize(newCapacity: number): void {
    const oldKeys = this.keys;
    const oldVals = this.vals;
    this.capacity = newCapacity;
    this.keys = new Array(newCapacity).fill(null);
    this.vals = new Array(newCapacity);
    this.count = 0;
    for (let i = 0; i < oldKeys.length; i++) {
      if (oldKeys[i] !== null && oldKeys[i] !== 'DELETED') {
        this.set(oldKeys[i] as string, oldVals[i]!);
      }
    }
  }
}`,
        },
      ],
      useCases: [
        'High-performance hash tables where cache locality matters',
        'Embedded systems with no dynamic allocation (fixed-size open addressing)',
        'Modern hash table implementations (Swiss Table, Rust hashbrown, Python dict)',
        'When pointer overhead of chaining is unacceptable',
      ],
      commonPitfalls: [
        'Letting load factor exceed 0.7-0.8: probe lengths grow exponentially',
        'Naive deletion (set to null) breaks probe chains: use tombstones or backward-shift deletion',
        'Tombstones accumulate: too many tombstones degrade search — must clean up during resize',
        'Quadratic probing may not visit all slots: table size must be prime, or use triangular numbers',
      ],
      interviewTips: [
        'Know linear probing, its clustering problem, and how Robin Hood hashing fixes it',
        'Explain tombstones: why you need them, and why they degrade performance over time',
        'Compare chaining vs open addressing: chaining is simpler, open addressing is faster (cache)',
      ],
      relatedConcepts: ['chaining', 'robin-hood-hashing', 'cuckoo-hashing'],
      difficulty: 'intermediate',
      tags: ['open-addressing', 'linear-probing', 'hash-table', 'cache'],
      proTip:
        'Python\'s dict uses open addressing with a clever probe sequence that mixes all bits of the hash value, not just low bits. The probe function is: j = (5*j + 1 + (perturb >>= 5)) % size. The perturb variable ensures the full hash is consumed, giving excellent distribution even with power-of-2 table sizes.',
    },
    {
      id: 'robin-hood-hashing',
      title: 'Robin Hood Hashing',
      description:
        'A variant of open addressing where, during insertion, a new entry can "steal" a position from an existing entry that is closer to its home slot (has a shorter probe distance). This "rob from the rich, give to the poor" policy equalizes probe distances across all entries, reducing variance and making worst-case lookup much better. Combined with backward-shift deletion (no tombstones needed), Robin Hood hashing is the basis for Rust\'s default HashMap.',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1) with low variance',
        worst: 'O(log n) expected max probe distance',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Each entry tracks its probe distance (distance from home slot)',
        'Insert: if current entry has shorter probe distance than incumbent, swap and continue inserting the displaced entry',
        'Effect: all entries have similar probe distances — low variance, not just low average',
        'Expected max probe distance: O(log n) vs O(sqrt(n)) for standard linear probing',
        'Deletion: backward-shift — move subsequent entries backward to fill the gap, no tombstones needed',
        'Backward shift is O(1) amortized and keeps the table clean (no tombstone accumulation)',
        'Cache performance: still uses linear probing, so sequential memory access pattern',
        'Rust\'s standard HashMap (hashbrown) is based on Swiss Table, which uses Robin Hood-inspired techniques',
      ],
      useCases: [
        'High-performance hash table implementations',
        'When probe distance variance is unacceptable (real-time systems)',
        'As the basis for modern hash table designs (Swiss Table, hashbrown)',
        'When tombstone accumulation from standard open addressing is a problem',
      ],
      commonPitfalls: [
        'Must track probe distance per entry — adds 1 byte overhead per slot',
        'Backward-shift deletion is more complex than tombstones — but avoids tombstone degradation',
        'Higher constant factor per insert than standard linear probing due to swapping',
        'Does not help with primary clustering — just equalizes its impact',
      ],
      interviewTips: [
        'Robin Hood is a great advanced topic to mention when discussing hash table design',
        'The key insight: by equalizing probe distances, the expected max becomes O(log n) instead of O(sqrt(n))',
        'Know backward-shift deletion: move entries backward until you find one at its home slot or an empty slot',
      ],
      relatedConcepts: ['open-addressing', 'cuckoo-hashing', 'hash-function-design'],
      difficulty: 'advanced',
      tags: ['robin-hood', 'open-addressing', 'probe-distance', 'hash-table'],
      proTip:
        'Robin Hood hashing enables a powerful optimization: since the max probe distance is O(log n), you can store it as metadata and terminate searches early. If your probe distance exceeds the stored maximum, the key is definitely not in the table — no need to probe further. This turns unsuccessful lookups from "probe until empty slot" into "probe at most log n steps".',
    },
    {
      id: 'cuckoo-hashing',
      title: 'Cuckoo Hashing',
      description:
        'A collision resolution scheme using two (or more) hash tables with independent hash functions. Each key has exactly two possible positions — one in each table. Lookup is guaranteed O(1) worst-case: check both positions. Insertion may displace an existing entry (like a cuckoo bird), which then moves to its alternate position, potentially causing a chain of displacements. If the chain is too long, rehash with new functions.',
      timeComplexity: {
        best: 'O(1) — lookup always',
        average: 'O(1) amortized insert',
        worst: 'O(1) lookup guaranteed, O(n) insert during rehash',
      },
      spaceComplexity: 'O(n) — requires load factor < 50% for two tables',
      keyPoints: [
        'Two tables T1, T2 with hash functions h1, h2: key k lives at T1[h1(k)] or T2[h2(k)]',
        'Lookup: check both positions — O(1) worst case, always exactly 2 probes',
        'Insert: try T1[h1(k)]; if occupied, evict incumbent to its alternate table, repeat',
        'Eviction chain: A displaces B, B displaces C, etc.; if cycle detected, rehash with new hash functions',
        'Load factor must be below ~50% for two tables; higher with 3+ tables or buckets of size > 1',
        'Insertion failure rate: with load factor < 50%, probability of rehash is O(1/n²)',
        'Practical variant: bucketized cuckoo hashing — each slot holds 4-8 entries, allowing higher load factor',
        'Used in network hardware (routers, switches) where O(1) worst-case lookup is critical',
      ],
      useCases: [
        'Network hardware: TCAM replacement with guaranteed O(1) lookup',
        'Real-time systems requiring worst-case O(1) lookup',
        'Cuckoo filters: probabilistic membership testing (alternative to Bloom filters)',
        'When worst-case performance matters more than average throughput',
      ],
      commonPitfalls: [
        'Low load factor (< 50%): wastes significant memory compared to other schemes',
        'Eviction cycles: must detect and rehash — infinite loop without cycle detection',
        'Two independent hash functions: if poorly chosen, eviction chains become common',
        'Rehashing is expensive O(n): happens rarely but causes latency spike when it does',
      ],
      interviewTips: [
        'Cuckoo hashing is impressive to mention as a worst-case O(1) lookup scheme',
        'Know the tradeoff: O(1) worst-case lookup, but O(n) amortized insert (due to rare rehashes)',
        'Cuckoo filter is a practical application: supports delete (unlike Bloom filter) with similar space',
      ],
      relatedConcepts: ['open-addressing', 'robin-hood-hashing', 'bloom-filter'],
      difficulty: 'advanced',
      tags: ['cuckoo-hashing', 'worst-case', 'two-tables', 'eviction'],
      proTip:
        'Cuckoo filters (Cuckoo hashing + fingerprints) achieve the same false positive rate as Bloom filters in less space AND support deletion. The key idea: store fingerprints instead of full keys, and use partial-key cuckoo hashing where the alternate position is computed from the fingerprint. This is used in production at companies like Cloudflare for their firewall rules.',
    },
    {
      id: 'consistent-hashing',
      title: 'Consistent Hashing',
      description:
        'A distributed hashing scheme where adding or removing a server only remaps ~K/N keys (K = total keys, N = servers), instead of rehashing everything. Servers and keys are mapped onto a ring (hash space 0 to 2^32-1). Each key is assigned to the first server clockwise on the ring. Virtual nodes (multiple positions per server) ensure even load distribution. Used by Cassandra, DynamoDB, and CDN systems.',
      timeComplexity: {
        best: 'O(log N) — binary search on sorted ring for N servers',
        average: 'O(log N)',
        worst: 'O(log N)',
      },
      spaceComplexity: 'O(N * V) where V = virtual nodes per server',
      keyPoints: [
        'Hash ring: servers and keys are hashed to positions on a circular space [0, 2^32)',
        'Key assignment: a key is served by the next server clockwise on the ring',
        'Adding server: only keys between the new server and its predecessor are remapped — O(K/N) keys',
        'Removing server: only keys that were assigned to the removed server need reassignment',
        'Virtual nodes: each server gets V positions on the ring (e.g., V=150) for even distribution',
        'Without virtual nodes: N servers give highly uneven distribution (variance is high with few points)',
        'With V virtual nodes per server: each server handles approximately K/N keys with low variance',
        'Jump consistent hashing (Google): zero-memory alternative, O(ln N) time, perfect balance — but only for sequential server IDs',
      ],
      useCases: [
        'Distributed caches (Memcached, Redis Cluster)',
        'NoSQL databases (Cassandra, DynamoDB, Riak)',
        'CDN request routing (Cloudflare, Akamai)',
        'Load balancing with sticky sessions',
      ],
      commonPitfalls: [
        'Not using virtual nodes: 3 real servers on a ring gives wildly uneven distribution',
        'Too few virtual nodes: V < 100 still has notable imbalance; V = 150-200 is common in production',
        'Assuming exact K/N redistribution: only approximately K/N keys move — depends on ring positions',
        'Not handling server weights: assign virtual nodes proportional to server capacity',
      ],
      interviewTips: [
        'Consistent hashing is a core system design concept — know it for distributed cache and database questions',
        'Draw the ring: show servers as points, keys as points, assignment = "walk clockwise to next server"',
        'Key insight: adding a server only affects the one range it splits — O(K/N) keys, not O(K)',
        'Virtual nodes explain how even distribution is achieved — critical for production use',
      ],
      relatedConcepts: ['hash-function-design', 'chaining', 'open-addressing'],
      difficulty: 'advanced',
      tags: ['consistent-hashing', 'distributed', 'ring', 'virtual-nodes'],
      proTip:
        'In system design interviews, always mention virtual nodes when discussing consistent hashing. The follow-up question is always "but what about load imbalance?" — and virtual nodes is the answer. Real systems use 100-200 virtual nodes per physical server, with TreeMap (sorted map) for O(log N) lookup of the next server position.',
    },
    {
      id: 'hashmap-internals',
      title: 'HashMap Internals (Java)',
      description:
        'Java\'s HashMap is the most widely studied hash table implementation. It uses separate chaining with an array of buckets, default capacity 16, load factor 0.75, and power-of-2 sizing. Java 8 introduced treeification: when a bucket exceeds 8 entries, the linked list converts to a Red-Black tree, capping worst-case lookup at O(log n). The hash spreading function perturbs the key\'s hashCode to distribute bits more evenly.',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1)',
        worst: 'O(log n) per bucket due to treeification (O(n) pre-Java 8)',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Initial capacity: 16 (must be power of 2); load factor: 0.75',
        'Bucket index: (n-1) & hash — bitwise AND works because n is power of 2',
        'Hash spreading: hash = key.hashCode() ^ (key.hashCode() >>> 16) — mixes high and low bits',
        'Resize at n * loadFactor entries: double capacity, rehash all entries',
        'Treeification: when bucket length > 8 AND table size >= 64, convert LL to Red-Black tree',
        'Untreeification: when bucket length < 6 (after deletion), convert back to linked list',
        'Why 8 for treeify: at load factor 0.75, Poisson probability of 8+ entries in a bucket is 0.00000006',
        'Why power-of-2 size: enables fast modulo via bitwise AND; hash spreading compensates for clustering',
        'ConcurrentHashMap: uses lock striping (Java 8: CAS + synchronized on bucket heads)',
      ],
      useCases: [
        'Understanding how the most common collection type works internally',
        'Debugging performance issues in hash-table-heavy code',
        'System design: explaining hash table tradeoffs with concrete implementation details',
        'Interview preparation: Java HashMap internals are a frequently asked topic',
      ],
      commonPitfalls: [
        'Using unhashable or mutable keys: objects used as keys must have consistent hashCode/equals',
        'Not overriding both hashCode and equals: objects equal by equals() must have same hashCode()',
        'HashMap is not thread-safe: concurrent modification can cause infinite loop in resize (pre-Java 8) or lost updates',
        'Capacity always doubles: if initial capacity is not power of 2, it rounds up to next power of 2',
      ],
      interviewTips: [
        'Know the magic numbers: capacity 16, load factor 0.75, treeify threshold 8, untreeify 6',
        'Explain hash spreading: why (h ^ h>>>16) — without it, only low bits determine bucket, causing clustering',
        'Know Java 8 changes: treeification, ConcurrentHashMap rewrite (lock striping → CAS + synchronized)',
      ],
      relatedConcepts: ['chaining', 'red-black-tree', 'hash-function-design'],
      difficulty: 'intermediate',
      tags: ['hashmap', 'java', 'internals', 'treeification'],
      proTip:
        'The Java HashMap resize is O(n) but preserves relative order of entries in each bucket. Because capacity doubles (power of 2), each entry either stays in the same bucket index or moves to index + oldCapacity. This means no rehashing is needed — just check one bit of the hash to decide. This is why power-of-2 sizing is used despite being theoretically worse for distribution.',
    },
    {
      id: 'hash-collision-attacks',
      title: 'Hash Collision Attacks',
      description:
        'An adversary who knows the hash function can craft inputs that all hash to the same bucket, degrading O(1) lookup to O(n). This was demonstrated against web frameworks (PHP, Java, Python, Ruby) in 2011 by sending POST parameters with colliding keys, causing O(n^2) request processing. Defenses include randomized hashing (SipHash), universal hashing, and treeification.',
      timeComplexity: {
        worst: 'O(n) per lookup under attack — O(n²) for n operations',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Birthday paradox: in a table of m buckets, expect first collision after ~sqrt(m) insertions',
        'Adversarial collision: if hash function is known, an attacker can find O(n) keys with same hash',
        'Hash-flooding DOS: send n colliding keys in HTTP POST → server spends O(n²) time parsing',
        '2011 disclosure: affected PHP, Java, Python, Ruby web frameworks (CVE-2011-4885 and related)',
        'Defense 1: randomized hashing — seed hash function with random value at startup (SipHash in Python, Ruby)',
        'Defense 2: universal hashing — choose hash function randomly from a family with provably low collision probability',
        'Defense 3: treeification — Java 8 converts long chains to RB tree, capping at O(log n)',
        'Defense 4: limit request size / parameter count at the web framework level',
        'SipHash: cryptographically strong PRF used as hash function — slower than MurmurHash but DoS-resistant',
      ],
      useCases: [
        'Understanding why Python randomizes hash seeds between runs (-R flag, default since 3.3)',
        'Designing hash tables that resist adversarial inputs',
        'Web application security: protecting against hash-flooding DoS',
        'Choosing between performance (MurmurHash) and security (SipHash) for hash functions',
      ],
      commonPitfalls: [
        'Assuming hash tables are always O(1): adversarial inputs can make them O(n)',
        'Using deterministic hash functions for user-facing input parsing',
        'Not setting request parameter limits in web frameworks',
        'Assuming treeification alone is sufficient: it caps at O(log n) but still much slower than O(1)',
      ],
      interviewTips: [
        'Mention hash-flooding when asked about hash table worst-case behavior — shows security awareness',
        'Know why Python hash output differs between runs: hash randomization for DoS protection',
        'SipHash provides a good tradeoff: fast enough for hash tables, strong enough to prevent collision attacks',
      ],
      relatedConcepts: ['hash-function-design', 'chaining', 'hashmap-internals'],
      difficulty: 'advanced',
      tags: ['hash-flooding', 'dos', 'siphash', 'security', 'collision'],
      proTip:
        'The hash-flooding attack exploits a fundamental tension: hash functions used in hash tables must be fast (ruling out crypto hashes), but fast hash functions are invertible (allowing collision generation). SipHash threads the needle: it is a PRF (pseudorandom function) with 128-bit key, fast enough for hash tables (~1 cycle/byte), but infeasible to invert without knowing the random key.',
    },
    {
      id: 'bloom-filter',
      title: 'Bloom Filter',
      description:
        'A space-efficient probabilistic data structure that tests set membership. It can have false positives (says "maybe in set" when not) but NEVER false negatives (if it says "not in set", it is definitely not). Uses a bit array of size m and k independent hash functions. Each element is mapped to k bit positions; lookup checks if all k positions are set. Used by databases to avoid unnecessary disk reads.',
      timeComplexity: {
        best: 'O(k) — k hash computations',
        average: 'O(k)',
        worst: 'O(k)',
      },
      spaceComplexity: 'O(m) bits — typically 10 bits per element for 1% false positive rate',
      keyPoints: [
        'Insert: compute k hashes, set those k bit positions to 1',
        'Lookup: compute k hashes, check if ALL k positions are 1; if any is 0, definitely not in set',
        'False positive rate: p ≈ (1 - e^(-kn/m))^k where n = elements, m = bits, k = hash functions',
        'Optimal k = (m/n) * ln(2) ≈ 0.693 * (m/n) — minimizes false positive rate',
        'For 1% false positive rate: need ~10 bits per element with k = 7 hash functions',
        'Cannot delete elements: setting bits to 0 may affect other elements — use counting Bloom filter instead',
        'Counting Bloom filter: each position is a counter instead of a bit — supports delete but uses more space',
        'Used in BigTable, Cassandra, Chrome (malicious URL check), Medium (article recommendations)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Bloom Filter Implementation',
          code: `class BloomFilter {
  private bits: Uint8Array;
  private readonly m: number; // bit array size
  private readonly k: number; // number of hash functions

  constructor(expectedElements: number, falsePositiveRate: number) {
    // Calculate optimal m and k
    this.m = Math.ceil(
      -(expectedElements * Math.log(falsePositiveRate)) / (Math.log(2) ** 2)
    );
    this.k = Math.ceil((this.m / expectedElements) * Math.log(2));
    this.bits = new Uint8Array(Math.ceil(this.m / 8));
  }

  // Simple double-hashing to generate k hash values from 2 base hashes
  private getHashes(item: string): number[] {
    let h1 = 0;
    let h2 = 0;
    for (let i = 0; i < item.length; i++) {
      const c = item.charCodeAt(i);
      h1 = (h1 * 31 + c) >>> 0;
      h2 = (h2 * 37 + c) >>> 0;
    }
    const hashes: number[] = [];
    for (let i = 0; i < this.k; i++) {
      hashes.push(Math.abs((h1 + i * h2) % this.m));
    }
    return hashes;
  }

  private setBit(pos: number): void {
    this.bits[Math.floor(pos / 8)] |= 1 << (pos % 8);
  }

  private getBit(pos: number): boolean {
    return (this.bits[Math.floor(pos / 8)] & (1 << (pos % 8))) !== 0;
  }

  add(item: string): void {
    for (const hash of this.getHashes(item)) {
      this.setBit(hash);
    }
  }

  mightContain(item: string): boolean {
    for (const hash of this.getHashes(item)) {
      if (!this.getBit(hash)) return false;
    }
    return true; // might be false positive
  }

  // Estimated current false positive rate
  get estimatedFPR(): number {
    const setBits = Array.from(this.bits).reduce((sum, byte) => {
      let count = 0;
      let b = byte;
      while (b) { count += b & 1; b >>= 1; }
      return sum + count;
    }, 0);
    return Math.pow(setBits / this.m, this.k);
  }
}`,
        },
      ],
      useCases: [
        'Database: check if key might exist before disk read (BigTable, Cassandra, RocksDB)',
        'Web security: check URL against malicious URL database (Chrome Safe Browsing)',
        'Network: router packet deduplication, CDN cache check',
        'Recommendation systems: filter already-seen content (Medium, Quora)',
      ],
      commonPitfalls: [
        'Using too few bits: false positive rate increases rapidly — always compute m from desired FPR',
        'Forgetting that deletion is impossible: standard Bloom filter is insert-only',
        'Not using double hashing trick: generating k independent hash functions is hard — use h1 + i*h2 instead',
        'Assuming false negative is possible: if mightContain returns false, the element is DEFINITELY not present',
      ],
      interviewTips: [
        'Know the formulas: optimal k = (m/n) * ln(2), bits per element for 1% FPR ≈ 10',
        'In system design: "we use a Bloom filter to avoid unnecessary disk/network reads" is a powerful optimization',
        'Counting Bloom filter for deletion: each bit position becomes a 4-bit counter',
      ],
      relatedConcepts: ['hash-function-design', 'count-min-sketch', 'hyperloglog'],
      difficulty: 'intermediate',
      tags: ['bloom-filter', 'probabilistic', 'set-membership', 'false-positive'],
      proTip:
        'The Bloom filter\'s killer feature in databases is not the space savings — it is avoiding I/O. A single SSD read takes ~100 microseconds. Checking a Bloom filter takes ~1 microsecond. If the filter eliminates 99% of unnecessary reads (1% FPR), you save 99 * 100μs = ~10ms per query. For a database processing thousands of queries per second, this is enormous.',
    },
  ],
}
