// @ts-nocheck
import type { Category } from '@/lib/types'

export const heapsCategory: Category = {
  id: 'heaps',
  title: 'Heaps',
  description: 'Priority-based data structures from the ubiquitous binary heap to Fibonacci heaps that power optimal graph algorithms. Understand the implementation details that make heap operations efficient.',
  icon: '⛰️',
  concepts: [
    {
      id: 'binary-heap',
      title: 'Binary Heap',
      description:
        'A complete binary tree stored in an array where every parent satisfies the heap property with respect to its children (parent <= children for min-heap). The array representation avoids pointer overhead — parent and children are computed via index arithmetic. Completeness ensures the tree has height exactly floor(log2 n), and the array has no gaps.',
      timeComplexity: {
        best: 'O(1) — peek',
        average: 'O(log n) — insert/extract',
        worst: 'O(log n)',
      },
      spaceComplexity: 'O(n) — no pointer overhead',
      keyPoints: [
        '0-indexed: parent = floor((i-1)/2), left = 2i+1, right = 2i+2',
        '1-indexed: parent = floor(i/2), left = 2i, right = 2i+1 — slightly cleaner arithmetic',
        'Complete binary tree: all levels full except last, which fills left to right',
        'Insert: place at end (maintains completeness), sift up to restore heap property',
        'Extract-min: swap root with last, remove last, sift down root to restore heap property',
        'Sift-up: compare with parent, swap if violating — O(log n) comparisons',
        'Sift-down: compare with smaller child, swap if violating — O(log n) comparisons',
        'Build-heap bottom-up: sift-down from last internal node to root — O(n) provably',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Binary Heap Core Operations',
          code: `class BinaryHeap {
  private heap: number[] = [];

  // Build heap from array in O(n)
  static heapify(arr: number[]): BinaryHeap {
    const h = new BinaryHeap();
    h.heap = [...arr];
    // Start from last non-leaf and sift down
    for (let i = Math.floor(h.heap.length / 2) - 1; i >= 0; i--) {
      h.siftDown(i);
    }
    return h;
  }

  insert(val: number): void {
    this.heap.push(val);
    this.siftUp(this.heap.length - 1);
  }

  extractMin(): number | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return min;
  }

  peekMin(): number | undefined {
    return this.heap[0];
  }

  get size(): number {
    return this.heap.length;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[i] >= this.heap[parent]) break;
      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}`,
        },
      ],
      useCases: [
        'Priority queue implementation (default in most languages)',
        'Heap sort: build heap + extract n times',
        'Selection algorithms: kth smallest/largest',
        'Graph algorithms: Dijkstra, Prim (with indexed PQ variant)',
      ],
      commonPitfalls: [
        'Off-by-one in parent/child formulas between 0-indexed and 1-indexed',
        'Sift-down must compare with BOTH children and swap with the smaller one (min-heap)',
        'Extract swaps root with LAST element, not first — swapping with first loses heap structure',
        'Build-heap must use sift-DOWN from last internal node, not sift-UP from root',
      ],
      interviewTips: [
        'Be able to derive the index formulas from scratch — do not just memorize them',
        'Know why build-heap is O(n): the sum n/4*1 + n/8*2 + n/16*3 + ... converges to O(n)',
        'Heap is NOT sorted: the second smallest element is one of the root\'s children, but heap[1] is not necessarily the second smallest',
      ],
      relatedConcepts: ['min-max-heap', 'heap-sort', 'priority-queue', 'indexed-priority-queue'],
      difficulty: 'intermediate',
      tags: ['binary-heap', 'complete-tree', 'array', 'priority'],
      proTip:
        'The array representation of a heap is not just convenient — it is essential for performance. Pointer-based heaps exist (Fibonacci, binomial) but they have worse cache behavior. Binary heaps in arrays achieve better constant factors because the entire structure is in contiguous memory with zero pointer overhead.',
    },
    {
      id: 'min-max-heap',
      title: 'Min Heap vs Max Heap',
      description:
        'Min-heap guarantees the smallest element at the root; max-heap guarantees the largest. The choice depends on what you need to extract first. For "kth largest", maintain a min-heap of size k — the root is always the kth largest seen so far. For "kth smallest", maintain a max-heap of size k. The median maintenance trick uses both: a max-heap for the lower half and a min-heap for the upper half.',
      timeComplexity: {
        best: 'O(1) — peek min or max',
        average: 'O(log n) — insert/extract',
        worst: 'O(log n)',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Min-heap: parent <= children; root is minimum; extract-min in O(log n)',
        'Max-heap: parent >= children; root is maximum; extract-max in O(log n)',
        'Convert min-heap to max-heap: negate all values, or flip comparison operator',
        'Kth largest: min-heap of size k; after processing all elements, root = kth largest — O(n log k)',
        'Kth smallest: max-heap of size k; root = kth smallest — O(n log k)',
        'Median maintenance: maxHeap (lower half) + minHeap (upper half); balance sizes within 1',
        'If sizes equal: median = (maxHeap.top + minHeap.top) / 2',
        'If sizes differ: median = top of larger heap',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Median Maintenance with Two Heaps',
          code: `// Simplified heap with custom comparator
class Heap {
  private data: number[] = [];
  constructor(private compare: (a: number, b: number) => number) {}

  push(val: number): void {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.compare(this.data[i], this.data[parent]) >= 0) break;
      [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
      i = parent;
    }
  }

  pop(): number {
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        let best = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < this.data.length && this.compare(this.data[l], this.data[best]) < 0) best = l;
        if (r < this.data.length && this.compare(this.data[r], this.data[best]) < 0) best = r;
        if (best === i) break;
        [this.data[i], this.data[best]] = [this.data[best], this.data[i]];
        i = best;
      }
    }
    return top;
  }

  peek(): number { return this.data[0]; }
  get size(): number { return this.data.length; }
}

class MedianFinder {
  private maxHeap = new Heap((a, b) => b - a); // lower half, max at top
  private minHeap = new Heap((a, b) => a - b); // upper half, min at top

  addNum(num: number): void {
    // Always add to maxHeap first, then balance
    this.maxHeap.push(num);
    // Ensure max of lower <= min of upper
    this.minHeap.push(this.maxHeap.pop());
    // Balance sizes: maxHeap can have at most 1 more element
    if (this.minHeap.size > this.maxHeap.size) {
      this.maxHeap.push(this.minHeap.pop());
    }
  }

  findMedian(): number {
    if (this.maxHeap.size > this.minHeap.size) {
      return this.maxHeap.peek();
    }
    return (this.maxHeap.peek() + this.minHeap.peek()) / 2;
  }
}`,
        },
      ],
      useCases: [
        'Running median of a data stream',
        'Kth largest/smallest element in stream',
        'Merge k sorted lists (min-heap of k elements)',
        'Top-k frequent elements (min-heap of size k by frequency)',
      ],
      commonPitfalls: [
        'Kth largest: use min-heap (not max-heap) of size k — root is the kth largest because k-1 elements are larger',
        'Median: always push to one heap first, then rebalance — never compare and push directly',
        'Forgetting to rebalance: heaps must differ in size by at most 1 for median to be correct',
        'In languages without max-heap (Python), negate values to simulate max-heap',
      ],
      interviewTips: [
        'Median finder is a top-tier interview question — practice the two-heap approach until automatic',
        'For kth largest in stream: "I maintain a min-heap of size k; when a new element is larger than root, pop root and push new"',
        'The two-heap median trick generalizes: for pth percentile, adjust the size ratio between heaps',
      ],
      relatedConcepts: ['binary-heap', 'priority-queue', 'heap-sort'],
      difficulty: 'intermediate',
      tags: ['min-heap', 'max-heap', 'median', 'kth-element'],
      proTip:
        'The two-heap median trick is actually a special case of order statistics on a stream. For the pth percentile, maintain the lower heap at size ceil(p * n) and upper heap at size floor((1-p) * n). The median case is p = 0.5. This generalizes to any quantile.',
    },
    {
      id: 'heap-sort',
      title: 'Heap Sort',
      description:
        'A comparison-based sort that builds a max-heap from the array, then repeatedly extracts the maximum and places it at the end. Guaranteed O(n log n) worst-case with O(1) extra space (in-place). Despite optimal theoretical complexity, heap sort is slower than quicksort in practice due to poor cache behavior — sift-down accesses widely separated array indices.',
      timeComplexity: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n) — guaranteed, unlike quicksort',
      },
      spaceComplexity: 'O(1) — in-place',
      keyPoints: [
        'Phase 1: build max-heap in O(n) using bottom-up heapify',
        'Phase 2: repeatedly swap root (maximum) with last unsorted element, shrink heap, sift-down root',
        'After n-1 extractions, array is sorted in ascending order',
        'Not stable: equal elements may change relative order during sift-down',
        'In-place: uses O(1) extra memory (unlike merge sort\'s O(n))',
        'Worst-case O(n log n) guaranteed (unlike quicksort\'s O(n²))',
        'Poor cache performance: sift-down jumps between parent and children at widely spaced indices',
        'Quicksort is 2-3x faster in practice despite same theoretical complexity — cache locality dominates',
      ],
      useCases: [
        'When guaranteed O(n log n) worst-case is needed (security-critical: no timing attacks)',
        'When O(1) extra space is required (embedded systems)',
        'Partial sorting: find top-k elements in O(n + k log n)',
        'Introsort uses heap sort as fallback when quicksort degenerates (std::sort in C++)',
      ],
      commonPitfalls: [
        'Using min-heap for ascending sort requires O(n) extra space — must use max-heap for in-place',
        'Forgetting to reduce heap size after each extraction — the "sorted" portion grows from the end',
        'Heap sort is not stable — if stability matters, use merge sort or Timsort',
        'Build-heap must be bottom-up (sift-down), not top-down (sift-up) — different O(n) vs O(n log n)',
      ],
      interviewTips: [
        'Know why heap sort loses to quicksort in practice: cache locality (quicksort accesses sequential elements)',
        'Introsort = quicksort that switches to heap sort when recursion depth exceeds 2*log(n) — best of both worlds',
        'Heap sort is O(1) space and O(n log n) worst-case — unique combination among comparison sorts',
      ],
      relatedConcepts: ['binary-heap', 'priority-queue', 'quick-sort', 'merge-sort'],
      difficulty: 'intermediate',
      tags: ['heap-sort', 'sorting', 'in-place', 'comparison-sort'],
      proTip:
        'Heap sort\'s cache problem is quantifiable: on a 32-byte cache line holding 8 integers, sift-down from a node at index i jumps to 2i+1, which for large arrays is far away in memory. Each sift-down step is essentially a cache miss. Quicksort\'s partition scans sequentially, achieving ~4 cache lines per cache miss. This is why C++ std::sort uses introsort (quicksort + heap sort fallback) rather than pure heap sort.',
    },
    {
      id: 'pq-applications',
      title: 'Priority Queue Applications',
      description:
        'Priority queues (min-heaps and max-heaps) are the workhorse data structure for greedy algorithms and graph algorithms. Dijkstra uses a min-heap to always explore the nearest unvisited vertex. Prim uses a min-heap to select the cheapest edge. Merge k sorted lists uses a min-heap to find the global minimum across k heads. Median maintenance uses two heaps to partition elements.',
      timeComplexity: {
        best: 'O(log n) per operation',
        average: 'O(log n)',
        worst: 'Depends on application — see individual algorithms',
      },
      spaceComplexity: 'O(n) or O(k) depending on application',
      keyPoints: [
        'Dijkstra: min-heap of (distance, vertex); extract-min gives next vertex to relax — O((V+E) log V)',
        'Prim: min-heap of (weight, vertex); extract-min gives cheapest edge to add — O((V+E) log V)',
        'Merge k sorted lists: min-heap of (value, listIndex, elementIndex); pop and push next from same list — O(N log k)',
        'Task scheduler: max-heap by frequency; greedily schedule most frequent task to minimize idle time',
        'Median maintenance: max-heap (lower) + min-heap (upper), rebalance on each insert — O(log n) per insert, O(1) median',
        'Top-k elements: min-heap of size k; iterate through n elements, pop and push when new element is larger — O(n log k)',
        'Huffman coding: min-heap of (frequency, node); merge two smallest — O(n log n)',
        'Running top-k: for streaming data, min-heap of size k keeps only the k largest seen',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Merge K Sorted Lists',
          code: `interface ListNode {
  val: number;
  next: ListNode | null;
}

// Using a simple min-heap (in practice, use a proper heap class)
function mergeKLists(lists: (ListNode | null)[]): ListNode | null {
  // Min-heap entries: [value, listIndex]
  const heap: [number, number][] = [];

  const push = (entry: [number, number]) => {
    heap.push(entry);
    let i = heap.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (heap[p][0] <= heap[i][0]) break;
      [heap[i], heap[p]] = [heap[p], heap[i]];
      i = p;
    }
  };

  const pop = (): [number, number] => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      while (true) {
        let s = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < heap.length && heap[l][0] < heap[s][0]) s = l;
        if (r < heap.length && heap[r][0] < heap[s][0]) s = r;
        if (s === i) break;
        [heap[i], heap[s]] = [heap[s], heap[i]];
        i = s;
      }
    }
    return top;
  };

  // Store current pointers
  const current: (ListNode | null)[] = [...lists];

  // Initialize heap with head of each non-null list
  for (let i = 0; i < lists.length; i++) {
    if (lists[i] !== null) {
      push([lists[i]!.val, i]);
    }
  }

  const dummy: ListNode = { val: 0, next: null };
  let tail = dummy;

  while (heap.length > 0) {
    const [val, listIdx] = pop();
    tail.next = { val, next: null };
    tail = tail.next;
    current[listIdx] = current[listIdx]!.next;
    if (current[listIdx] !== null) {
      push([current[listIdx]!.val, listIdx]);
    }
  }

  return dummy.next;
}`,
        },
      ],
      useCases: [
        'Shortest path: Dijkstra, A*',
        'Minimum spanning tree: Prim',
        'Merge k sorted sequences (database merge, external sort)',
        'Scheduling: job scheduling with priorities, CPU task scheduling',
      ],
      commonPitfalls: [
        'Dijkstra with negative edges: min-heap Dijkstra fails — use Bellman-Ford instead',
        'Merge k lists: pushing all N elements at once into heap is O(N log N); using k-size heap is O(N log k)',
        'Lazy deletion in Dijkstra: popping a vertex that is already finalized — must skip it',
        'Not using decrease-key (indexed PQ) for Dijkstra: without it, heap can grow to O(E) entries',
      ],
      interviewTips: [
        'Merge k sorted lists is one of the most common heap problems — know the O(N log k) approach',
        'For Dijkstra in interviews: most people use lazy deletion (push duplicates, skip stale entries) instead of indexed PQ',
        'When asked "process elements by priority", the answer is almost always a heap/priority queue',
      ],
      relatedConcepts: ['binary-heap', 'indexed-priority-queue', 'fibonacci-heap'],
      difficulty: 'intermediate',
      tags: ['priority-queue', 'dijkstra', 'merge-k', 'scheduling'],
      proTip:
        'Lazy deletion in Dijkstra\'s algorithm is simpler than using an indexed priority queue, and works well in practice: push (newDist, vertex) even if vertex is already in the heap. When popping, skip if vertex is already finalized. The heap may grow to O(E) entries, but the total work is still O(E log E) = O(E log V), same as with indexed PQ.',
    },
    {
      id: 'fibonacci-heap',
      title: 'Fibonacci Heap',
      description:
        'A lazy, consolidation-based heap that achieves amortized O(1) for insert and decrease-key, and O(log n) for extract-min. The key insight is deferring work: insertions just add nodes to a root list, and consolidation (merging trees of equal degree) only happens during extract-min. This makes Dijkstra O(E + V log V) — theoretically optimal for dense graphs. In practice, the constant factors and pointer overhead make Fibonacci heaps slower than binary heaps for most inputs.',
      timeComplexity: {
        best: 'O(1) amortized — insert, decrease-key, union',
        average: 'O(log n) amortized — extract-min',
        worst: 'O(n) per single extract-min (amortized O(log n))',
      },
      spaceComplexity: 'O(n) — significant pointer overhead per node',
      keyPoints: [
        'Collection of heap-ordered trees (not necessarily binary) stored in a circular doubly-linked root list',
        'Insert: add new single-node tree to root list — O(1)',
        'Find-min: maintained as a pointer to the minimum root — O(1)',
        'Union (merge two heaps): concatenate root lists — O(1)',
        'Extract-min: remove min, add its children to root list, THEN consolidate (merge trees of equal degree)',
        'Decrease-key: cut node from parent, add to root list; if parent loses second child, cascading cut',
        'Cascading cut: if a non-root node loses two children, cut it from its parent too — maintains degree bounds',
        'Degree bound: max degree of any node is O(log n) — proven via Fibonacci numbers (hence the name)',
        'Dijkstra with Fibonacci heap: O(V log V + E) vs O((V+E) log V) with binary heap — better for dense graphs',
      ],
      useCases: [
        'Dijkstra on dense graphs: E ≈ V² makes Fibonacci heap\'s O(E + V log V) significantly better than binary heap\'s O(E log V)',
        'Prim\'s MST on dense graphs: same improvement as Dijkstra',
        'Theoretical computer science: proving tight bounds for graph algorithms',
        'In practice: rarely used due to large constants; Pairing heaps are a simpler alternative with similar amortized bounds',
      ],
      commonPitfalls: [
        'Implementing in an interview: extremely complex — know the theory, not the code',
        'Assuming Fibonacci heap is always faster: binary heap wins for sparse graphs (E ≈ V) due to lower constants',
        'Forgetting cascading cuts: without them, the degree bound breaks and extract-min becomes O(n)',
        'The O(1) decrease-key is amortized, not worst-case — a single decrease-key can trigger a cascade',
      ],
      interviewTips: [
        'You will never be asked to implement a Fibonacci heap — know what it is and when it matters',
        'Know the Dijkstra complexity comparison: binary heap O((V+E)log V) vs Fibonacci O(E + V log V)',
        'Dense graph: E ≈ V², so binary heap Dijkstra is O(V² log V), Fibonacci is O(V² + V log V) ≈ O(V²)',
        'In practice, most implementations use binary heap with lazy deletion',
      ],
      relatedConcepts: ['binary-heap', 'binomial-heap', 'indexed-priority-queue'],
      difficulty: 'expert',
      tags: ['fibonacci-heap', 'amortized', 'decrease-key', 'dijkstra'],
      proTip:
        'The Fibonacci heap exists primarily to prove that Dijkstra can run in O(E + V log V). In practice, no mainstream language standard library uses Fibonacci heaps — the pointer overhead (parent, child, left, right sibling, mark bit, degree) makes each node ~48 bytes vs ~4 bytes for a binary heap entry. Pairing heaps achieve similar amortized bounds with much simpler implementation.',
    },
    {
      id: 'binomial-heap',
      title: 'Binomial Heap',
      description:
        'A collection of binomial trees satisfying the heap property, where each binomial tree of order k has exactly 2^k nodes. The key advantage over binary heaps is O(log n) union (merge two heaps), which binary heaps cannot do efficiently. Binomial heaps are the theoretical stepping stone to Fibonacci heaps and appear in some priority queue library implementations.',
      timeComplexity: {
        best: 'O(1) — find-min with lazy pointer',
        average: 'O(log n) — insert, extract-min, union',
        worst: 'O(log n)',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Binomial tree B_k: has 2^k nodes, height k, root has k children (B_0, B_1, ..., B_{k-1})',
        'Heap is a list of binomial trees with distinct orders — like binary representation of n',
        'Union: merge tree lists, combine trees of same order (like binary addition with carry)',
        'Insert: create B_0 tree, union with heap — O(log n) worst case, O(1) amortized',
        'Extract-min: find min among roots, remove that tree, make its children a new heap, union with remaining',
        'Decrease-key: sift up within the binomial tree — O(log n)',
        'At most ceil(log2(n)) + 1 trees in the heap — one per bit in binary representation of n',
        'The name "binomial" comes from: B_k has C(k, d) nodes at depth d (binomial coefficients)',
      ],
      useCases: [
        'Mergeable priority queues: when you need to union two heaps frequently',
        'Theoretical foundation for understanding Fibonacci heaps',
        'Priority queue libraries in some languages',
        'When O(log n) guaranteed merge is needed and Fibonacci heap is too complex',
      ],
      commonPitfalls: [
        'Confusing binomial tree order with height: B_k has order k AND height k, but 2^k nodes',
        'Union requires merging trees of same order in correct direction — like binary addition',
        'Extract-min: children of removed root must be reversed to form a valid binomial heap',
        'The constant factor is higher than binary heap for single-heap operations',
      ],
      interviewTips: [
        'Binomial heaps are rarely asked directly — know they exist and support O(log n) merge',
        'The binary number analogy: n = 13 = 1101₂ means the heap has trees B_3, B_2, B_0',
        'Understand the progression: binary heap → binomial heap → Fibonacci heap, each adding capabilities',
      ],
      relatedConcepts: ['binary-heap', 'fibonacci-heap', 'priority-queue'],
      difficulty: 'expert',
      tags: ['binomial-heap', 'mergeable', 'binomial-tree'],
      proTip:
        'The binary number analogy makes binomial heaps intuitive: inserting an element is like adding 1 to a binary number. If the ones place is empty (no B_0), just add B_0. If occupied, combine (carry) and check the next position. This is why n insertions take O(n) total — just like incrementing a binary counter n times.',
    },
    {
      id: 'indexed-priority-queue',
      title: 'Indexed Priority Queue',
      description:
        'A priority queue that supports O(log n) decrease-key (and increase-key) by maintaining a position map: for each element, track its current index in the heap array. When Dijkstra needs to update a vertex\'s distance, the indexed PQ directly accesses and fixes the heap position without searching. This avoids the O(E) extra entries that lazy deletion creates in a standard heap.',
      timeComplexity: {
        best: 'O(1) — peek, contains',
        average: 'O(log n) — insert, extract, decrease-key',
        worst: 'O(log n)',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Three arrays: heap[] (positions → keys), pos[] (keys → positions), values[] (keys → priorities)',
        'decrease-key: update values[key], look up pos[key], sift up from that position — O(log n)',
        'increase-key: same but sift down — O(log n)',
        'contains(key): check if pos[key] is valid — O(1)',
        'Every swap in the heap must update BOTH heap[] and pos[] — the invariant that makes it work',
        'Dijkstra with indexed PQ: at most V entries in heap (not E), decrease-key instead of duplicate pushes',
        'Total Dijkstra complexity: O(V * extract-min + E * decrease-key) = O((V+E) log V)',
        'Without indexed PQ, Dijkstra pushes duplicates: heap grows to O(E), total O(E log E) ≈ O(E log V)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Indexed Min Priority Queue',
          code: `class IndexedMinPQ {
  private heap: number[];     // heap[i] = key at position i
  private pos: number[];      // pos[key] = position in heap (-1 if absent)
  private values: number[];   // values[key] = priority
  private n = 0;
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.heap = new Array(capacity);
    this.pos = new Array(capacity).fill(-1);
    this.values = new Array(capacity);
  }

  isEmpty(): boolean { return this.n === 0; }
  contains(key: number): boolean { return this.pos[key] !== -1; }

  insert(key: number, priority: number): void {
    this.values[key] = priority;
    this.heap[this.n] = key;
    this.pos[key] = this.n;
    this.n++;
    this.swim(this.pos[key]);
  }

  extractMin(): number {
    const minKey = this.heap[0];
    this.n--;
    this.swap(0, this.n);
    this.pos[minKey] = -1;
    this.sink(0);
    return minKey;
  }

  decreaseKey(key: number, newPriority: number): void {
    this.values[key] = newPriority;
    this.swim(this.pos[key]);
  }

  peekMinKey(): number { return this.heap[0]; }
  peekMinValue(): number { return this.values[this.heap[0]]; }

  private swim(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.values[this.heap[i]] >= this.values[this.heap[parent]]) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  private sink(i: number): void {
    while (2 * i + 1 < this.n) {
      let j = 2 * i + 1;
      if (j + 1 < this.n && this.values[this.heap[j + 1]] < this.values[this.heap[j]]) j++;
      if (this.values[this.heap[i]] <= this.values[this.heap[j]]) break;
      this.swap(i, j);
      i = j;
    }
  }

  private swap(i: number, j: number): void {
    this.pos[this.heap[i]] = j;
    this.pos[this.heap[j]] = i;
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}`,
        },
      ],
      useCases: [
        'Dijkstra\'s algorithm with proper decrease-key',
        'Prim\'s MST algorithm',
        'A* search algorithm',
        'Any algorithm that needs to update priorities of existing elements',
      ],
      commonPitfalls: [
        'Forgetting to update pos[] on every swap — breaks the key→position mapping',
        'Using decrease-key on a key not in the heap — must check contains() first',
        'The capacity must be known upfront (keys are used as array indices)',
        'More complex than lazy deletion but uses O(V) heap entries instead of O(E)',
      ],
      interviewTips: [
        'Most interviewers accept lazy deletion Dijkstra — indexed PQ is bonus points',
        'Know that indexed PQ is what makes Dijkstra truly O((V+E) log V) instead of O(E log E)',
        'In practice, lazy deletion is simpler and often faster due to lower constant factors',
      ],
      relatedConcepts: ['binary-heap', 'fibonacci-heap', 'priority-queue'],
      difficulty: 'advanced',
      tags: ['indexed-pq', 'decrease-key', 'dijkstra', 'prim'],
      proTip:
        'In competitive programming, lazy deletion (push duplicates, skip stale pops) is almost always preferred over indexed PQ because it is simpler and the extra O(E) entries rarely matter. In production systems, indexed PQ is preferred because the heap stays at O(V) entries, which matters when V is millions and the heap must fit in L2 cache.',
    },
  ],
}
