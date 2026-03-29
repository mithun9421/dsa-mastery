// @ts-nocheck
import type { Category } from '@/lib/types'

export const advancedDSCategory: Category = {
  id: 'advanced-ds',
  title: 'Advanced Data Structures',
  description: 'Specialized structures for caching, probabilistic queries, string manipulation, and theoretical optimality — from LRU caches to HyperLogLog cardinality estimation and van Emde Boas trees.',
  icon: '🧬',
  concepts: [
    {
      id: 'lru-cache',
      title: 'LRU Cache',
      description:
        'A fixed-capacity cache that evicts the Least Recently Used entry when full. Implemented as a HashMap (for O(1) key lookup) combined with a Doubly Linked List (for O(1) access order tracking). On get: move the accessed node to the front of the list. On put: if key exists, update and move to front; if full, evict the tail node. The DLL is needed (not just LL) because eviction requires O(1) deletion of the tail node.',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1)',
        worst: 'O(1) — both get and put',
      },
      spaceComplexity: 'O(capacity)',
      keyPoints: [
        'Two data structures: HashMap<key, DLLNode> + DoublyLinkedList where head = most recent, tail = least recent',
        'Get: look up in hashmap O(1), move node to head O(1), return value',
        'Put (existing key): update value, move to head',
        'Put (new key, not full): create node, add to head, add to hashmap',
        'Put (new key, full): remove tail from DLL and hashmap, then add new node to head',
        'Why DLL not SLL: deleting the tail requires O(1) access to the node before tail — only DLL provides this',
        'Sentinel head and tail nodes eliminate null checks — every real node is between sentinels',
        'Thread-safe variant: lock the entire cache (coarse-grained) or use lock-free DLL + ConcurrentHashMap',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'LRU Cache Implementation',
          code: `class DLLNode {
  constructor(
    public key: number,
    public value: number,
    public prev: DLLNode | null = null,
    public next: DLLNode | null = null,
  ) {}
}

class LRUCache {
  private capacity: number;
  private map: Map<number, DLLNode> = new Map();
  private head: DLLNode; // sentinel — most recent after head
  private tail: DLLNode; // sentinel — least recent before tail

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head = new DLLNode(0, 0);
    this.tail = new DLLNode(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: number): number {
    const node = this.map.get(key);
    if (node === undefined) return -1;
    this.moveToHead(node);
    return node.value;
  }

  put(key: number, value: number): void {
    const existing = this.map.get(key);
    if (existing !== undefined) {
      existing.value = value;
      this.moveToHead(existing);
      return;
    }
    if (this.map.size === this.capacity) {
      this.evict();
    }
    const node = new DLLNode(key, value);
    this.map.set(key, node);
    this.addAfterHead(node);
  }

  private addAfterHead(node: DLLNode): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: DLLNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private moveToHead(node: DLLNode): void {
    this.removeNode(node);
    this.addAfterHead(node);
  }

  private evict(): void {
    const lru = this.tail.prev!;
    this.removeNode(lru);
    this.map.delete(lru.key);
  }
}`,
        },
      ],
      useCases: [
        'Database query cache: evict least-used query results',
        'Web browser cache: keep recently accessed pages in memory',
        'CDN edge caching: cache popular content, evict cold content',
        'Operating system page replacement: approximate LRU for virtual memory',
      ],
      commonPitfalls: [
        'Forgetting to store the KEY in the DLL node: when evicting tail, you need the key to remove from hashmap',
        'Not using sentinel nodes: leads to 6+ null-check branches in add/remove/evict',
        'Put with existing key: must UPDATE the value, not just move to head — easy to forget',
        'Thread safety: the naive implementation is not thread-safe — reads and writes both modify the DLL',
      ],
      interviewTips: [
        'LRU Cache is one of the top-5 most common coding interview questions — implement it in < 10 minutes',
        'Start with "HashMap + Doubly Linked List" and explain WHY doubly (need O(1) eviction of tail)',
        'Use sentinel nodes and tell the interviewer: "sentinels eliminate edge cases for head/tail operations"',
      ],
      relatedConcepts: ['lfu-cache', 'doubly-linked-list', 'hashmap-internals'],
      difficulty: 'intermediate',
      tags: ['lru-cache', 'eviction', 'hashmap', 'doubly-linked-list'],
      proTip:
        'In production, LRU caches are rarely pure LRU. Memcached uses a slab allocator with LRU per slab class. Redis supports multiple eviction policies (LRU, LFU, random, TTL). Real caches also use "scan resistance" — a single sequential scan should not evict all hot entries. The CLOCK algorithm approximates LRU with a circular buffer and "use bit", avoiding the linked list entirely.',
    },
    {
      id: 'lfu-cache',
      title: 'LFU Cache',
      description:
        'A cache that evicts the Least Frequently Used entry, with LRU as tiebreaker among entries with equal frequency. Implementation uses a HashMap<key, node> for O(1) lookup, a HashMap<frequency, DoublyLinkedList> for O(1) access to all entries at a given frequency, and a minFreq variable tracking the current minimum frequency. All operations are O(1).',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1)',
        worst: 'O(1)',
      },
      spaceComplexity: 'O(capacity)',
      keyPoints: [
        'Three structures: keyMap (key→node), freqMap (freq→DLL of nodes at that freq), minFreq counter',
        'Get: increment node\'s frequency, move from old freq list to new freq list, update minFreq if old list is now empty',
        'Put: if exists, update value and increment freq; if full, evict from minFreq list\'s tail (LRU within LFU)',
        'New entries start at frequency 1 — minFreq resets to 1 on new insertion',
        'When frequency list becomes empty, and it was minFreq: minFreq is only accessed on eviction, and new insertions set minFreq = 1, so no explicit update needed (it will be correct by the time eviction is needed)',
        'More complex than LRU but better for some workloads (hot entries are never evicted even after a cold scan)',
        'Can be unfair: an entry accessed 1000 times long ago stays even if newer entries are actively accessed',
        'Practical variant: decaying LFU — multiply all frequencies by a decay factor periodically',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'LFU Cache O(1) Implementation',
          code: `class LFUNode {
  constructor(
    public key: number,
    public value: number,
    public freq: number = 1,
    public prev: LFUNode | null = null,
    public next: LFUNode | null = null,
  ) {}
}

class FreqList {
  head: LFUNode;
  tail: LFUNode;
  size = 0;

  constructor() {
    this.head = new LFUNode(0, 0);
    this.tail = new LFUNode(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  addFirst(node: LFUNode): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
    this.size++;
  }

  remove(node: LFUNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
    this.size--;
  }

  removeLast(): LFUNode {
    const node = this.tail.prev!;
    this.remove(node);
    return node;
  }
}

class LFUCache {
  private keyMap = new Map<number, LFUNode>();
  private freqMap = new Map<number, FreqList>();
  private minFreq = 0;

  constructor(private capacity: number) {}

  private getFreqList(freq: number): FreqList {
    if (!this.freqMap.has(freq)) {
      this.freqMap.set(freq, new FreqList());
    }
    return this.freqMap.get(freq)!;
  }

  private incrementFreq(node: LFUNode): void {
    const oldList = this.getFreqList(node.freq);
    oldList.remove(node);
    if (oldList.size === 0) {
      this.freqMap.delete(node.freq);
      if (this.minFreq === node.freq) this.minFreq++;
    }
    node.freq++;
    this.getFreqList(node.freq).addFirst(node);
  }

  get(key: number): number {
    const node = this.keyMap.get(key);
    if (node === undefined) return -1;
    this.incrementFreq(node);
    return node.value;
  }

  put(key: number, value: number): void {
    if (this.capacity === 0) return;
    const existing = this.keyMap.get(key);
    if (existing !== undefined) {
      existing.value = value;
      this.incrementFreq(existing);
      return;
    }
    if (this.keyMap.size === this.capacity) {
      const evicted = this.getFreqList(this.minFreq).removeLast();
      this.keyMap.delete(evicted.key);
    }
    const node = new LFUNode(key, value);
    this.keyMap.set(key, node);
    this.getFreqList(1).addFirst(node);
    this.minFreq = 1;
  }
}`,
        },
      ],
      useCases: [
        'Database buffer pool: keep frequently queried pages in memory',
        'CDN caching: popular content should survive cold scans',
        'API rate limiting: track request frequency per client',
        'Content recommendation: track and prioritize frequently accessed items',
      ],
      commonPitfalls: [
        'Not handling minFreq correctly: after eviction from freq=1 list and inserting new node, minFreq must be 1',
        'Forgetting to update minFreq when a freq list becomes empty: only matters if that freq was minFreq',
        'Frequency starvation: old high-frequency entries block newer entries — consider decaying frequencies',
        'More complex to implement than LRU — interviewers may accept pseudo-code for the tricky parts',
      ],
      interviewTips: [
        'LFU Cache is a hard-tier LeetCode problem (460) — know the three data structures and how they interact',
        'Start by explaining the data structures: keyMap, freqMap, minFreq — then walk through get/put',
        'The minFreq tracking is the clever part: explain when and how it updates',
      ],
      relatedConcepts: ['lru-cache', 'doubly-linked-list', 'hashmap-internals'],
      difficulty: 'advanced',
      tags: ['lfu-cache', 'eviction', 'frequency', 'cache'],
      proTip:
        'LFU has a well-known weakness: "frequency pollution." If an entry was accessed 10,000 times yesterday but not at all today, it still occupies the cache. Production caches solve this with "windowed LFU" (count only recent accesses) or "TinyLFU" (used by Caffeine, Java\'s best cache library): a probabilistic admission filter that blocks entries unlikely to be accessed frequently.',
    },
    {
      id: 'bloom-filter-advanced',
      title: 'Bloom Filter (Advanced)',
      description:
        'Beyond the basic Bloom filter: optimal parameter selection, counting Bloom filters for deletion support, and practical applications in databases and distributed systems. The false positive rate formula p = (1 - e^(-kn/m))^k determines optimal k = (m/n) * ln(2). At 10 bits per element and k = 7, you get 1% false positive rate — a remarkable space-accuracy tradeoff.',
      timeComplexity: {
        best: 'O(k) per operation',
        average: 'O(k)',
        worst: 'O(k)',
      },
      spaceComplexity: 'O(m) bits',
      keyPoints: [
        'False positive rate: p ≈ (1 - e^(-kn/m))^k',
        'Optimal k = (m/n) * ln(2) ≈ 0.693 * bits_per_element',
        'For 1% FPR: ~9.6 bits/element, k = 7; for 0.1% FPR: ~14.4 bits/element, k = 10',
        'Counting Bloom filter: replace each bit with a 4-bit counter — supports delete but 4x space',
        'Scalable Bloom filter: when FPR exceeds threshold, add a new Bloom filter with tighter parameters',
        'Cuckoo filter: alternative to Bloom filter that supports deletion with same or better space efficiency',
        'BigTable: Bloom filter per SSTable to avoid unnecessary disk reads — reduces I/O by ~99%',
        'Cassandra: Bloom filter on partition keys — check before hitting disk for row existence',
      ],
      useCases: [
        'LSM-tree databases: check if key might be in SSTable before reading from disk',
        'Distributed systems: check set membership without querying remote server',
        'Web crawlers: track already-visited URLs without storing all URLs in memory',
        'CDN: check if content is cached before routing to origin',
      ],
      commonPitfalls: [
        'Choosing k too high: more hash functions means more bit lookups and slower operations',
        'Not sizing m correctly: too few bits → high FPR; use the formula m = -n*ln(p) / (ln(2))^2',
        'Counting Bloom filter overflow: 4-bit counter saturates at 15 — reset or use larger counters',
        'Assuming Bloom filter is always the right choice: for small sets, a hash set may use less memory',
      ],
      interviewTips: [
        'Know the formulas: m = -n*ln(p)/(ln(2))^2, k = (m/n)*ln(2)',
        'In system design: "we use a Bloom filter to avoid disk I/O" is a powerful optimization to mention',
        'Know that standard Bloom filter cannot delete — mention counting BF or cuckoo filter for deletion',
      ],
      relatedConcepts: ['count-min-sketch', 'hyperloglog', 'hash-function-design'],
      difficulty: 'advanced',
      tags: ['bloom-filter', 'probabilistic', 'space-efficient', 'database'],
      proTip:
        'Google\'s LevelDB and Facebook\'s RocksDB use Bloom filters on every SSTable. With ~10 million keys per SSTable and a 1% FPR Bloom filter costing ~12MB, the filter avoids ~99% of unnecessary 4KB disk reads. At SSD latency (~100μs per read), this saves ~1 second per 10,000 queries — the single most impactful optimization in LSM-tree databases.',
    },
    {
      id: 'count-min-sketch',
      title: 'Count-Min Sketch',
      description:
        'A probabilistic data structure for frequency estimation using a 2D array of counters with d hash functions (d rows, w columns). Each element is hashed to one position in each row, and all d counters are incremented. To estimate frequency, take the minimum across all d rows. The estimate is always >= the true count (over-estimates, never under-estimates). Error is bounded by epsilon with probability 1-delta, where w = ceil(e/epsilon) and d = ceil(ln(1/delta)).',
      timeComplexity: {
        best: 'O(d) per operation',
        average: 'O(d)',
        worst: 'O(d)',
      },
      spaceComplexity: 'O(w * d) counters',
      keyPoints: [
        'Grid of counters: d rows (hash functions) x w columns (counter positions)',
        'Update: for each row, hash to position, increment counter',
        'Query: for each row, hash to position, take MINIMUM of all d counters',
        'Always over-estimates: collisions only add, never subtract — estimated_count >= true_count',
        'Error bound: over-estimation <= epsilon * total_count with probability >= 1 - delta',
        'Parameter selection: w = ceil(e / epsilon), d = ceil(ln(1 / delta))',
        'For epsilon = 0.01 (1% error), delta = 0.01 (99% confidence): w ≈ 272, d = 5 → 1360 counters',
        'Comparison with HyperLogLog: CMS estimates frequency, HLL estimates cardinality — different problems',
      ],
      useCases: [
        'Network traffic monitoring: estimate flow sizes for heavy hitter detection',
        'Search engines: approximate term frequency in document streams',
        'Recommendation systems: approximate item popularity for trending detection',
        'DDoS detection: identify IP addresses with abnormally high request counts',
      ],
      commonPitfalls: [
        'CMS only OVER-estimates: if you need exact counts or under-estimates, use a different structure',
        'Width too small: high collision rate → large over-estimation',
        'Using max instead of min for query: min gives the tightest estimate',
        'Not using independent hash functions: correlated hashes increase collision probability',
      ],
      interviewTips: [
        'CMS answers "approximately how many times has this element appeared?" — not "is this element in the set?" (that is Bloom filter)',
        'Know the error guarantees: "overestimates by at most epsilon * N with probability 1 - delta"',
        'In system design, mention CMS for "heavy hitters" or "top-k frequent items" on streaming data',
      ],
      relatedConcepts: ['bloom-filter-advanced', 'hyperloglog', 'hash-function-design'],
      difficulty: 'advanced',
      tags: ['count-min-sketch', 'frequency', 'streaming', 'probabilistic'],
      proTip:
        'Count-Min Sketch + heap = streaming top-k in O(1) per update. Maintain a CMS for frequency estimation and a min-heap of size k for the current top-k. For each element: increment in CMS, if estimated frequency > heap minimum, update the heap. This gives approximate top-k from a stream in O(k) space + CMS space — no need to store all elements.',
    },
    {
      id: 'hyperloglog',
      title: 'HyperLogLog',
      description:
        'A probabilistic data structure for cardinality estimation (count distinct elements) using only O(log log n) bits per register. The core insight: hash each element and count leading zeros — the maximum number of leading zeros across all elements approximates log2(cardinality). With m = 2^p registers, the standard error is 1.04/sqrt(m). Redis implements HLL using 12KB of memory to estimate cardinalities up to 2^64 with ~0.8% error.',
      timeComplexity: {
        best: 'O(1) per add',
        average: 'O(1)',
        worst: 'O(m) for cardinality estimate',
      },
      spaceComplexity: 'O(m) registers, typically 12KB for 16384 registers',
      keyPoints: [
        'Intuition: if you flip a coin and get 10 heads in a row, you probably flipped ~2^10 = 1024 times',
        'Hash element, split hash into p-bit bucket index and remaining bits for leading zero counting',
        'm = 2^p registers, each stores max leading zeros seen — 5 bits per register for HLL',
        'Estimate: harmonic mean of 2^register[i] across all registers, with bias correction constant alpha_m',
        'Standard error: 1.04 / sqrt(m) — with m = 16384 (p=14), error ≈ 0.81%',
        'LogLog → SuperLogLog → HyperLogLog: progression of improvements in bias correction',
        'Redis PFADD/PFCOUNT: 12KB per HLL, estimates cardinalities up to 2^64',
        'HLL union: take max of corresponding registers — enables distributed cardinality estimation',
        'HLL++ (Google): improvements for small and large cardinalities using bias correction table',
      ],
      useCases: [
        'Unique visitor counting (Google Analytics, Cloudflare)',
        'Database query optimization: estimate SELECT COUNT(DISTINCT col) without full scan',
        'Network monitoring: count unique source/destination IPs per flow',
        'Distributed systems: merge HLLs from multiple servers for global cardinality',
      ],
      commonPitfalls: [
        'Small cardinalities: standard HLL has high relative error — HLL++ uses linear counting for small n',
        'Register size: 5 bits per register handles up to 2^32; 6 bits for 2^64 — must match hash size',
        'Union is approximate: max of registers loses some information — error increases slightly',
        'Cannot remove elements: HLL is insert-only, like Bloom filter',
      ],
      interviewTips: [
        'HLL answers "how many DISTINCT elements?" — not frequency (CMS) or membership (Bloom filter)',
        'The leading zeros intuition is the key: "the longest run of heads estimates how many coin flips"',
        'Redis HLL: 12KB to count up to 2^64 unique items with < 1% error — mention this specific number',
      ],
      relatedConcepts: ['bloom-filter-advanced', 'count-min-sketch', 'hash-function-design'],
      difficulty: 'advanced',
      tags: ['hyperloglog', 'cardinality', 'probabilistic', 'redis', 'counting'],
      proTip:
        'HyperLogLog is one of the best examples of the power of probabilistic data structures: 12KB of memory replaces what would otherwise require storing all unique elements (potentially gigabytes). The harmonic mean + bias correction trick reduces the variance dramatically compared to naive max-leading-zeros estimation. This is why every major analytics system (Google Analytics, Presto, Spark) implements HLL natively.',
    },
    {
      id: 'persistent-ds',
      title: 'Persistent Data Structures',
      description:
        'Data structures that preserve previous versions when modified, enabling queries on any historical state. The path copying technique creates O(log n) new nodes per modification while sharing the rest of the tree with the previous version. Persistent segment trees are the most practical variant, enabling "version k" range queries. Fat node method stores all versions in each node (simpler but higher space).',
      timeComplexity: {
        best: 'O(log n) per operation',
        average: 'O(log n)',
        worst: 'O(log n)',
      },
      spaceComplexity: 'O(n + q * log n) for q modifications',
      keyPoints: [
        'Path copying: when modifying a node, create a new copy of that node and all ancestors up to the root',
        'Unchanged subtrees are shared between versions — O(log n) new nodes per modification',
        'Persistent segment tree: each update creates a new root with O(log n) new nodes',
        'Store all roots: root[v] points to version v\'s tree; query(root[v], l, r) gives answer at version v',
        'Fat node method: each node stores list of (version, value) pairs — simpler but O(log v) per access',
        'Functional data structures are naturally persistent: immutable cons lists, functional red-black trees',
        'Applications: version control (each commit is a version), time-travel debugging, online judge with rollback',
        'Cannot use path compression in persistent union-find — use rollback DSU instead',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Persistent Segment Tree',
          code: `class PersistentNode {
  constructor(
    public sum: number,
    public left: PersistentNode | null = null,
    public right: PersistentNode | null = null,
  ) {}
}

class PersistentSegTree {
  private roots: PersistentNode[] = [];
  private n: number;

  constructor(arr: readonly number[]) {
    this.n = arr.length;
    this.roots.push(this.build(arr, 0, this.n - 1));
  }

  private build(arr: readonly number[], lo: number, hi: number): PersistentNode {
    if (lo === hi) return new PersistentNode(arr[lo]);
    const mid = Math.floor((lo + hi) / 2);
    const left = this.build(arr, lo, mid);
    const right = this.build(arr, mid + 1, hi);
    return new PersistentNode(left.sum + right.sum, left, right);
  }

  // Point update: creates new version
  update(version: number, index: number, value: number): number {
    const newRoot = this.updateNode(this.roots[version], 0, this.n - 1, index, value);
    this.roots.push(newRoot);
    return this.roots.length - 1; // new version number
  }

  private updateNode(
    node: PersistentNode, lo: number, hi: number,
    index: number, value: number,
  ): PersistentNode {
    if (lo === hi) return new PersistentNode(value);
    const mid = Math.floor((lo + hi) / 2);
    if (index <= mid) {
      const newLeft = this.updateNode(node.left!, lo, mid, index, value);
      return new PersistentNode(newLeft.sum + node.right!.sum, newLeft, node.right);
    }
    const newRight = this.updateNode(node.right!, mid + 1, hi, index, value);
    return new PersistentNode(node.left!.sum + newRight.sum, node.left, newRight);
  }

  // Range query on specific version
  query(version: number, l: number, r: number): number {
    return this.queryNode(this.roots[version], 0, this.n - 1, l, r);
  }

  private queryNode(
    node: PersistentNode | null, lo: number, hi: number,
    l: number, r: number,
  ): number {
    if (node === null || r < lo || hi < l) return 0;
    if (l <= lo && hi <= r) return node.sum;
    const mid = Math.floor((lo + hi) / 2);
    return this.queryNode(node.left, lo, mid, l, r) +
           this.queryNode(node.right, mid + 1, hi, l, r);
  }
}`,
        },
      ],
      useCases: [
        'Kth smallest in range: persistent segment tree on sorted values, query versions at range endpoints',
        'Version control systems: each commit creates a new version sharing unchanged files',
        'Undo/redo in editors: each edit creates a new version, undo returns to previous',
        'Functional programming: immutable data structures are inherently persistent',
      ],
      commonPitfalls: [
        'Memory: O(q * log n) new nodes for q operations — can be large; use memory pool to reduce allocation overhead',
        'Cannot use persistent union-find with path compression: compression modifies shared nodes',
        'Garbage collection: old versions that are no longer needed should be freed — but reference counting is complex',
        'Not sharing unchanged subtrees: if you copy the entire tree per version, it is O(n) per operation instead of O(log n)',
      ],
      interviewTips: [
        'Persistent segment tree is the canonical example — know the path-copying technique',
        'The key insight: each update only modifies O(log n) nodes on the root-to-leaf path; share everything else',
        'Compare with immutable data in functional programming: same principle, different application',
      ],
      relatedConcepts: ['segment-tree', 'rollback-dsu', 'rope'],
      difficulty: 'expert',
      tags: ['persistent', 'versioning', 'path-copying', 'immutable'],
      proTip:
        'The "kth smallest element in range [l, r]" problem is elegantly solved by persistent segment tree on a value domain. Build version[i] by inserting arr[0..i] into a segment tree over value range [minVal, maxVal]. To find kth smallest in [l, r]: walk down version[r] minus version[l-1], going left if left subtree count >= k, else right. This gives O(log V) per query where V = value range.',
    },
    {
      id: 'rope',
      title: 'Rope',
      description:
        'A balanced binary tree where leaves store string chunks, enabling O(log n) split and concatenate operations on strings. Unlike standard strings where concatenation is O(n) (copy both strings), ropes share structure — concatenation just creates a new root with two subtrees. Used in text editors (VS Code, Xi editor) where frequent insertions/deletions in the middle of large documents would be O(n) with plain strings.',
      timeComplexity: {
        best: 'O(log n) — split, concat',
        average: 'O(log n)',
        worst: 'O(log n) for balanced rope',
      },
      spaceComplexity: 'O(n) — shared structure reduces copy overhead',
      keyPoints: [
        'Internal nodes store: left subtree weight (total characters in left subtree)',
        'Leaves store: actual string chunks (typically 64-512 characters each)',
        'Concatenation: create new root node with left = rope1, right = rope2 — O(1) or O(log n) to rebalance',
        'Split at position k: traverse to find the leaf containing position k, split that leaf, divide the tree',
        'Insert at position k: split at k, concatenate(left, newText, right) — O(log n)',
        'Delete range [i, j]: split at i, split right part at j-i, concatenate first and third parts — O(log n)',
        'Index (get character at position k): traverse using weights — O(log n) vs O(1) for array string',
        'VS Code uses a piece table (related to rope): edits create "pieces" referencing original + add buffers',
      ],
      useCases: [
        'Text editors: frequent insertions/deletions in middle of large documents',
        'Version control diff: rope-like structures for efficient line-based modifications',
        'Rich text formatting: rope nodes can carry metadata (bold, italic) per chunk',
        'Collaborative editing: ropes merge concurrent edits more naturally than plain strings',
      ],
      commonPitfalls: [
        'Single character access is O(log n) not O(1) — worse than plain string for random access',
        'Must rebalance: unbalanced rope degenerates to linked list — use treap or weight-balanced tree',
        'Small strings: rope overhead (node pointers + weights) exceeds the benefit for strings < 1KB',
        'Leaf chunk size matters: too small → too many nodes; too large → wastes space on splits',
      ],
      interviewTips: [
        'Rope is rarely asked as a coding question but appears in system design for "design a text editor"',
        'Know the key operations and their complexities — compare with naive string operations',
        'The implicit treap is a general-purpose rope: supports split, merge, reverse, and range operations on sequences',
      ],
      relatedConcepts: ['treap', 'persistent-ds', 'bst'],
      difficulty: 'expert',
      tags: ['rope', 'text-editor', 'split', 'concatenate', 'string'],
      proTip:
        'VS Code\'s text buffer uses a "piece table" rather than a pure rope. The piece table maintains the original file buffer (never modified) and an "add buffer" (append-only) plus a table of "pieces" — each pointing to a range in either buffer. Edits create new pieces in O(log n) by splitting and inserting into the piece table (a balanced tree). This is simpler than a full rope and avoids copying the original file entirely.',
    },
    {
      id: 'van-emde-boas',
      title: 'Van Emde Boas Tree',
      description:
        'A tree data structure for integer keys from a universe [0, U) that supports insert, delete, search, successor, and predecessor in O(log log U) time. The recursive structure divides the universe into sqrt(U) clusters of size sqrt(U), with a summary structure tracking which clusters are non-empty. The O(log log U) bound comes from halving the bit-length at each recursive level — log₂(log₂(U)) levels total.',
      timeComplexity: {
        best: 'O(1) — min/max',
        average: 'O(log log U)',
        worst: 'O(log log U)',
      },
      spaceComplexity: 'O(U) — one slot per possible key',
      keyPoints: [
        'Universe [0, U) where U is typically a power of 2',
        'Recursive structure: sqrt(U) clusters of size sqrt(U), plus a summary VEB of size sqrt(U)',
        'Insert/Delete: insert into cluster, then update summary — one recursive call per level',
        'Successor: check current cluster first; if not found, use summary to find next non-empty cluster',
        'Predecessor: symmetric to successor',
        'Min and Max stored explicitly: O(1) access, and helps reduce recursion (base case)',
        'Depth of recursion: log₂(log₂(U)) — because bit-length halves each level (U → sqrt(U) → sqrt(sqrt(U)))',
        'Space O(U) is the main drawback — only practical for small universes (U ≤ 2^20 or so)',
        'For large U: use hash-based VEB (x-fast trie, y-fast trie) to reduce space to O(n)',
      ],
      useCases: [
        'Priority queues with integer keys from bounded universe',
        'Network routing: fast successor queries on IP address prefixes',
        'Computational geometry: sweep line algorithms with integer coordinates',
        'Theoretical: proving tight bounds for integer data structure operations',
      ],
      commonPitfalls: [
        'O(U) space: impractical for U > 2^20 — use y-fast trie for large universes',
        'Implementation complexity: the recursive structure with high/low split is error-prone',
        'Only works for integer keys: cannot store arbitrary strings or floating point',
        'The O(log log U) bound is for the universe size U, not the number of stored elements n',
      ],
      interviewTips: [
        'VEB tree is a theoretical topic — know the O(log log U) bound and recursive structure',
        'If asked "how to beat O(log n) for integer keys?", VEB tree or y-fast trie',
        'The key insight: halving the BIT LENGTH (not the number of elements) at each level gives log log U',
      ],
      relatedConcepts: ['binary-heap', 'bst', 'b-tree'],
      difficulty: 'expert',
      tags: ['van-emde-boas', 'integer', 'successor', 'predecessor'],
      proTip:
        'The practical takeaway from VEB trees is not the data structure itself (O(U) space is usually prohibitive) but the proof technique: if you can halve the problem\'s BIT LENGTH at each step instead of halving the number of elements, you get doubly-logarithmic complexity. This same technique appears in x-fast tries (O(log log U) using hashing) and fusion trees (O(log n / log log n) using bit parallelism).',
    },
    {
      id: 'cache-oblivious-ds',
      title: 'Cache-Oblivious Data Structures',
      description:
        'Data structures designed to minimize cache misses without knowing the cache line size B or cache size M. The cache-oblivious model assumes an ideal cache replacement policy (optimal offline) and proves bounds in terms of unknown B and M. The key result: a van Emde Boas layout of a binary tree achieves O(log_B n) cache misses per search — matching the B-tree\'s performance without knowing B.',
      timeComplexity: {
        best: 'Matches cache-aware bounds',
        average: 'O(log_B n) searches, O((n/B) * log_{M/B}(n/B)) sorts',
        worst: 'Same as above with optimal replacement',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Cache-oblivious: no knowledge of B (cache line size) or M (cache size) — algorithm is parameterless',
        'Cache-aware (B-tree): knows B, tunes branching factor to B — optimal but machine-specific',
        'Van Emde Boas layout: store binary tree in array such that subtrees of size sqrt(n) are contiguous',
        'Result: search in vEB-layout BST causes O(log_B n) cache misses — same as B-tree',
        'Cache-oblivious sort (funnel sort): O((n/B) * log_{M/B}(n/B)) I/Os — optimal',
        'Tall cache assumption: M = Omega(B^2) — needed for most cache-oblivious results',
        'Key principle: recursive decomposition into subproblems that fit in cache at SOME level',
        'Practical impact: works well across CPU cache, SSD, and disk hierarchies simultaneously',
      ],
      useCases: [
        'General-purpose search trees that perform well across different cache architectures',
        'External memory algorithms: sorting and searching on data larger than RAM',
        'Portable data structures: no need to tune for specific hardware',
        'Multi-level memory hierarchies: CPU L1/L2/L3 cache, RAM, SSD, disk',
      ],
      commonPitfalls: [
        'Assumes optimal replacement policy: real caches use LRU which is O(log) factor worse in some cases',
        'VEB layout is only for static trees — dynamic insertions require rebuilding or more complex structures',
        'Constant factors are larger than cache-aware structures — B-tree is still faster in practice when B is known',
        'The tall cache assumption (M >= B^2) may not hold for very small caches',
      ],
      interviewTips: [
        'Cache-oblivious is a theoretical concept — rarely asked directly but shows systems understanding',
        'The key insight: "recursive divide means at SOME recursion level, subproblems fit in cache"',
        'Compare with B-tree: B-tree is optimal for ONE cache level; cache-oblivious works across ALL levels',
      ],
      relatedConcepts: ['b-tree', 'van-emde-boas', 'binary-heap'],
      difficulty: 'expert',
      tags: ['cache-oblivious', 'veb-layout', 'memory-hierarchy', 'external-memory'],
      proTip:
        'The practical lesson from cache-oblivious theory: recursive algorithms are inherently cache-friendly. Merge sort is cache-oblivious optimal (O(n/B * log_{M/B}(n/B)) I/Os), while quicksort is not (due to random pivots). This is why merge sort outperforms quicksort on very large datasets that spill to disk — and why external sort algorithms are always merge-based.',
    },
  ],
}
