// @ts-nocheck
import type { Category } from '@/lib/types'

export const linkedListsCategory: Category = {
  id: 'linked-lists',
  title: 'Linked Lists',
  description: 'Node-based linear data structures — from singly linked basics to probabilistic skip lists. Understand when pointer-based structures beat arrays and when they do not.',
  icon: '🔗',
  concepts: [
    {
      id: 'singly-linked-list',
      title: 'Singly Linked List',
      description:
        'A linear sequence of nodes where each node stores a value and a pointer to the next node. Insert-at-head is O(1), but all other operations require traversal. The real cost is not algorithmic — it is cache unfriendliness from non-contiguous heap allocations, making linked lists slower than arrays for most practical workloads despite theoretically better insertion complexity.',
      timeComplexity: {
        best: 'O(1) — insert/delete at head',
        average: 'O(n) — search, insert/delete at arbitrary position',
        worst: 'O(n)',
      },
      spaceComplexity: 'O(n) — each node allocates separately on heap',
      keyPoints: [
        'Node: { value, next } — one pointer per node, minimal overhead',
        'Insert at head: O(1) — create node, point to current head, update head',
        'Insert at tail without tail pointer: O(n) traversal; with tail pointer: O(1)',
        'Delete by value: need reference to PREVIOUS node — cannot delete current node without it (unless copy trick)',
        'The "delete current node" trick: copy next node\'s value into current, then delete next — O(1) but fails for tail',
        'No random access: arr[i] is O(1), but list.get(i) is O(n) — this makes binary search impossible',
        'Each node is a separate heap allocation → cache misses on every traversal step',
        'In GC languages, many small objects create GC pressure; in C/C++, fragmented allocations hurt allocator performance',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Singly Linked List Implementation',
          code: `class ListNode<T> {
  constructor(
    public val: T,
    public next: ListNode<T> | null = null,
  ) {}
}

class SinglyLinkedList<T> {
  private head: ListNode<T> | null = null;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  prepend(val: T): void {
    this.head = new ListNode(val, this.head);
    this._size++;
  }

  append(val: T): void {
    const node = new ListNode(val);
    if (this.head === null) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next !== null) {
        current = current.next;
      }
      current.next = node;
    }
    this._size++;
  }

  deleteFirst(val: T): boolean {
    if (this.head === null) return false;
    if (this.head.val === val) {
      this.head = this.head.next;
      this._size--;
      return true;
    }
    let current = this.head;
    while (current.next !== null) {
      if (current.next.val === val) {
        current.next = current.next.next;
        this._size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  find(val: T): ListNode<T> | null {
    let current = this.head;
    while (current !== null) {
      if (current.val === val) return current;
      current = current.next;
    }
    return null;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.val);
      current = current.next;
    }
    return result;
  }
}`,
        },
      ],
      useCases: [
        'Stack implementation (push/pop at head)',
        'Memory-constrained environments where allocation size is unpredictable',
        'Undo/redo chains where you only traverse linearly',
        'Foundation for more complex structures (hash table chaining, adjacency lists)',
      ],
      commonPitfalls: [
        'Losing reference to head when inserting/deleting — always use a dummy head node for cleaner code',
        'Null pointer exceptions: not checking node.next before accessing node.next.next',
        'Memory leaks in non-GC languages: deleting a node without freeing its memory',
        'Assuming O(1) insert means linked list is "faster" — cache misses dominate real performance',
      ],
      interviewTips: [
        'Always use a dummy/sentinel head node — it eliminates edge cases for head insertion/deletion',
        'Draw pointer diagrams: "before" and "after" each pointer manipulation',
        'Common mistake: updating pointers in wrong order causes you to lose nodes',
      ],
      relatedConcepts: ['doubly-linked-list', 'circular-linked-list', 'common-ll-patterns'],
      difficulty: 'beginner',
      tags: ['linked-list', 'singly', 'linear', 'pointers'],
      proTip:
        'In interviews, always use a dummy head node. It turns every edge case (empty list, single element, delete head) into the general case. Production code at Google and Meta uses sentinel nodes for exactly this reason.',
    },
    {
      id: 'doubly-linked-list',
      title: 'Doubly Linked List',
      description:
        'A linked list where each node has both next and prev pointers, enabling O(1) deletion given a node reference and O(1) operations at both ends. The extra pointer doubles per-node overhead but unlocks bidirectional traversal and is the backbone of LRU caches, where you need to move a node to the front in O(1).',
      timeComplexity: {
        best: 'O(1) — insert/delete at known position',
        average: 'O(n) — search',
        worst: 'O(n)',
      },
      spaceComplexity: 'O(n) — two pointers per node',
      keyPoints: [
        'Node: { value, prev, next } — two pointers per node instead of one',
        'Delete with node reference: O(1) — unlink by updating prev.next and next.prev',
        'Insert before/after known node: O(1) — no traversal needed',
        'Bidirectional traversal: can iterate forward and backward',
        'Sentinel nodes (dummy head + dummy tail) eliminate all null checks and edge cases',
        'Foundation of LRU cache: HashMap<key, node> + DLL. Get = move to front O(1). Evict = remove tail O(1)',
        'Java LinkedList, Python collections.deque, C++ std::list are all doubly linked',
        'Double the pointer overhead of singly linked — 16 bytes per node on 64-bit systems',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Doubly Linked List with Sentinels',
          code: `class DLLNode<T> {
  constructor(
    public val: T,
    public prev: DLLNode<T> | null = null,
    public next: DLLNode<T> | null = null,
  ) {}
}

class DoublyLinkedList<T> {
  private head: DLLNode<T>;
  private tail: DLLNode<T>;
  private _size = 0;

  constructor() {
    // Sentinel nodes — never contain real data
    this.head = new DLLNode(null as T);
    this.tail = new DLLNode(null as T);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get size(): number {
    return this._size;
  }

  // Insert node right after the given node
  private insertAfter(node: DLLNode<T>, newNode: DLLNode<T>): void {
    newNode.prev = node;
    newNode.next = node.next;
    node.next!.prev = newNode;
    node.next = newNode;
    this._size++;
  }

  // Remove a node (O(1) given reference)
  removeNode(node: DLLNode<T>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
    node.prev = null;
    node.next = null;
    this._size--;
  }

  addFirst(val: T): DLLNode<T> {
    const node = new DLLNode(val);
    this.insertAfter(this.head, node);
    return node;
  }

  addLast(val: T): DLLNode<T> {
    const node = new DLLNode(val);
    this.insertAfter(this.tail.prev!, node);
    return node;
  }

  removeFirst(): T | undefined {
    if (this._size === 0) return undefined;
    const node = this.head.next!;
    this.removeNode(node);
    return node.val;
  }

  removeLast(): T | undefined {
    if (this._size === 0) return undefined;
    const node = this.tail.prev!;
    this.removeNode(node);
    return node.val;
  }

  // Move existing node to front (for LRU cache)
  moveToFront(node: DLLNode<T>): void {
    this.removeNode(node);
    this.insertAfter(this.head, node);
    this._size++; // removeNode decremented, but we're just moving
  }
}`,
        },
      ],
      useCases: [
        'LRU cache: O(1) access, O(1) eviction, O(1) promotion',
        'Browser history (back/forward navigation)',
        'Text editor buffer (cursor can move both directions)',
        'Deque implementation with O(1) operations at both ends',
      ],
      commonPitfalls: [
        'Updating pointers in wrong order during insert/delete — draw the four pointer changes',
        'Not using sentinel nodes — leads to 4-6 separate null-check branches',
        'Forgetting to null out removed node\'s prev/next (memory leak in non-GC, dangling reference)',
        'In moveToFront: decrementing size in removeNode then incrementing in insertAfter — track carefully',
      ],
      interviewTips: [
        'LRU cache = DLL + HashMap is one of the most common system design + coding questions',
        'Always use dummy head and tail sentinels — tell the interviewer you are doing this and why',
        'When implementing LRU, the hashmap stores key -> DLL node, so you can go from key to node in O(1)',
      ],
      relatedConcepts: ['singly-linked-list', 'lru-cache', 'deque-ds'],
      difficulty: 'beginner',
      tags: ['linked-list', 'doubly', 'bidirectional', 'lru'],
      proTip:
        'The sentinel node pattern is not just for linked lists — it appears in binary trees (null leaves), graphs (super source/sink), and arrays (padding). The principle is the same: remove edge cases by ensuring boundary elements always exist.',
    },
    {
      id: 'circular-linked-list',
      title: 'Circular Linked List',
      description:
        'A linked list where the last node points back to the first, forming a ring. There is no null terminator — iteration ends when you return to the starting node. The classic application is the Josephus problem (elimination in a circle), and Floyd\'s cycle detection algorithm works on any list with a cycle, not just intentionally circular ones.',
      timeComplexity: {
        best: 'O(1) — insert at head/tail with tail pointer',
        average: 'O(n) — search',
        worst: 'O(n)',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'No null at end: last.next = head (singly circular) or additionally head.prev = last (doubly circular)',
        'Detect end of traversal: stop when current === startNode, not when current === null',
        'With tail pointer only: insert at head = O(1) (new node after tail, update head), insert at tail = O(1)',
        'Floyd\'s cycle detection: slow pointer moves 1 step, fast moves 2 — they meet inside cycle',
        'After meeting, move one pointer to head, advance both by 1 — they meet at cycle start',
        'Josephus problem: N people in circle, eliminate every Kth — O(N) with circular list simulation',
        'Josephus formula: J(n,k) = (J(n-1,k) + k) % n, base J(1,k) = 0 — O(n) without list',
        'Used in round-robin scheduling (OS process scheduling, load balancers)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Floyd\'s Cycle Detection',
          code: `class ListNode<T> {
  constructor(public val: T, public next: ListNode<T> | null = null) {}
}

// Detect if a linked list has a cycle
function hasCycle<T>(head: ListNode<T> | null): boolean {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

// Find the start of the cycle
function detectCycleStart<T>(head: ListNode<T> | null): ListNode<T> | null {
  let slow = head;
  let fast = head;
  // Phase 1: detect meeting point
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) {
      // Phase 2: find cycle start
      let entry = head;
      while (entry !== slow) {
        entry = entry!.next;
        slow = slow!.next;
      }
      return entry;
    }
  }
  return null;
}

// Josephus problem: find last survivor
function josephus(n: number, k: number): number {
  let survivor = 0; // 0-indexed position for n=1
  for (let i = 2; i <= n; i++) {
    survivor = (survivor + k) % i;
  }
  return survivor; // 0-indexed
}`,
        },
      ],
      useCases: [
        'Round-robin scheduling (OS, load balancers, multiplayer game turns)',
        'Cycle detection in linked lists (Floyd\'s tortoise and hare)',
        'Josephus problem and circular elimination games',
        'Circular buffers for streaming data',
      ],
      commonPitfalls: [
        'Infinite loop: forgetting to check current === start causes traversal to never terminate',
        'Floyd\'s: checking fast === null before fast.next (must check both fast and fast.next)',
        'Cycle start proof: people memorize the algorithm without understanding why moving from head works — know the math',
        'Confusing cycle in a list (unintentional) with circular list (intentional): same detection, different semantics',
      ],
      interviewTips: [
        'Floyd\'s algorithm is asked constantly — know both detection and cycle-start finding',
        'Be ready to prove why the cycle start algorithm works: distance from head to cycle start = distance from meeting point to cycle start',
        'Josephus: if N is small, simulate with circular list; if N is large, use the O(n) recurrence',
      ],
      relatedConcepts: ['singly-linked-list', 'common-ll-patterns', 'two-pointers'],
      difficulty: 'intermediate',
      tags: ['circular', 'linked-list', 'cycle-detection', 'josephus'],
      proTip:
        'The Floyd\'s cycle detection proof relies on modular arithmetic: if the cycle length is C and the distance from head to cycle start is L, then slow traveled L + K steps and fast traveled L + K + nC steps. Since fast = 2 * slow, we get L + K = nC, meaning L = nC - K, so starting from head and meeting point converges at the cycle start.',
    },
    {
      id: 'skip-list',
      title: 'Skip List',
      description:
        'A probabilistic data structure that layers multiple sorted linked lists with geometrically decreasing density, achieving expected O(log n) search, insert, and delete. Each element is promoted to higher levels with probability p (typically 1/2). Skip lists are simpler to implement than balanced BSTs and are used in Redis sorted sets (ZSET) and LevelDB/RocksDB memtables.',
      timeComplexity: {
        best: 'O(log n) expected',
        average: 'O(log n) expected',
        worst: 'O(n) — all elements at max level (astronomically unlikely)',
      },
      spaceComplexity: 'O(n) expected — each element appears in 1/(1-p) levels on average',
      keyPoints: [
        'Level 0 contains all elements; level k contains each element with probability p^k',
        'Search: start at top-left, move right while next < target, move down when stuck — like binary search on linked list',
        'Expected number of levels: O(log n) with high probability',
        'Insert: search for position, flip coin for each level (promote while heads), insert at each promoted level',
        'Delete: remove from all levels the element appears in',
        'No rotations needed (unlike AVL/RB trees) — balancing is probabilistic',
        'Redis uses skip lists for sorted sets because they are simpler than balanced trees and support range queries naturally',
        'Concurrent skip lists are easier to implement than concurrent balanced trees (lock-free versions exist)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Skip List Implementation',
          code: `class SkipNode {
  forward: (SkipNode | null)[];
  constructor(
    public key: number,
    public value: string,
    level: number,
  ) {
    this.forward = new Array(level + 1).fill(null);
  }
}

class SkipList {
  private readonly maxLevel: number;
  private readonly p: number;
  private level: number;
  private header: SkipNode;

  constructor(maxLevel = 16, p = 0.5) {
    this.maxLevel = maxLevel;
    this.p = p;
    this.level = 0;
    this.header = new SkipNode(-Infinity, '', maxLevel);
  }

  private randomLevel(): number {
    let lvl = 0;
    while (Math.random() < this.p && lvl < this.maxLevel) {
      lvl++;
    }
    return lvl;
  }

  search(key: number): string | null {
    let current = this.header;
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i]!.key < key) {
        current = current.forward[i]!;
      }
    }
    current = current.forward[0]!;
    if (current !== null && current.key === key) {
      return current.value;
    }
    return null;
  }

  insert(key: number, value: string): void {
    const update: (SkipNode | null)[] = new Array(this.maxLevel + 1).fill(null);
    let current = this.header;

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i]!.key < key) {
        current = current.forward[i]!;
      }
      update[i] = current;
    }

    current = current.forward[0]!;

    if (current !== null && current.key === key) {
      current.value = value; // Update existing
      return;
    }

    const newLevel = this.randomLevel();
    if (newLevel > this.level) {
      for (let i = this.level + 1; i <= newLevel; i++) {
        update[i] = this.header;
      }
      this.level = newLevel;
    }

    const newNode = new SkipNode(key, value, newLevel);
    for (let i = 0; i <= newLevel; i++) {
      newNode.forward[i] = update[i]!.forward[i];
      update[i]!.forward[i] = newNode;
    }
  }

  delete(key: number): boolean {
    const update: (SkipNode | null)[] = new Array(this.maxLevel + 1).fill(null);
    let current = this.header;

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i]!.key < key) {
        current = current.forward[i]!;
      }
      update[i] = current;
    }

    current = current.forward[0]!;
    if (current === null || current.key !== key) return false;

    for (let i = 0; i <= this.level; i++) {
      if (update[i]!.forward[i] !== current) break;
      update[i]!.forward[i] = current.forward[i];
    }

    while (this.level > 0 && this.header.forward[this.level] === null) {
      this.level--;
    }
    return true;
  }
}`,
        },
      ],
      useCases: [
        'Redis sorted sets (ZSET): ordered key-value with range queries',
        'LevelDB/RocksDB memtable: in-memory sorted buffer before flushing to SST files',
        'Concurrent ordered maps: lock-free skip lists (Java ConcurrentSkipListMap)',
        'Priority queues when you also need search/delete by key',
      ],
      commonPitfalls: [
        'Not capping max level: without a cap, pathological random sequences create very tall towers',
        'Using p = 1/2 with too-low maxLevel: for n = 10^6, need maxLevel >= 20',
        'Forgetting to update the "update" array during insert, causing lost pointers',
        'Memory overhead: each level adds a pointer per node — average 2 pointers per node with p=0.5',
      ],
      interviewTips: [
        'Know why Redis chose skip lists over balanced BSTs: simpler implementation, easy range queries, easy to make concurrent',
        'Expected height is O(log n) — the proof uses geometric distribution: expected level of any node is 1/(1-p)',
        'Compare with balanced BST: skip list is simpler but has higher constant factor; BST has deterministic O(log n)',
      ],
      relatedConcepts: ['bst', 'avl-tree', 'red-black-tree', 'singly-linked-list'],
      difficulty: 'advanced',
      tags: ['skip-list', 'probabilistic', 'sorted', 'redis'],
      proTip:
        'Redis author Salvatore Sanfilippo chose skip lists over balanced trees for sorted sets because: (1) they are simpler to implement correctly, (2) range operations (ZRANGEBYSCORE) are natural — just follow level 0 pointers, and (3) the constant factor in O(log n) is small in practice. The theoretical worst case O(n) essentially never happens.',
    },
    {
      id: 'xor-linked-list',
      title: 'XOR Linked List',
      description:
        'A memory-optimized doubly linked list that stores prev XOR next in a single pointer field instead of two separate pointers, halving pointer overhead. Traversal requires knowing the previous node to compute the next: next = stored_xor XOR prev. This trick only works in languages with raw pointer access (C/C++) — garbage-collected languages cannot XOR object references.',
      timeComplexity: {
        best: 'O(1) — insert/delete at ends',
        average: 'O(n) — traversal',
        worst: 'O(n)',
      },
      spaceComplexity: 'O(n) — one pointer per node instead of two',
      keyPoints: [
        'Each node stores: value + (addr(prev) XOR addr(next))',
        'To traverse forward: next_addr = node.xor_ptr XOR prev_addr',
        'To traverse backward: prev_addr = node.xor_ptr XOR next_addr',
        'At boundaries: head\'s XOR = 0 XOR addr(second) = addr(second); tail\'s XOR = addr(second_to_last) XOR 0',
        'Saves one pointer per node (8 bytes on 64-bit) — significant for millions of small nodes',
        'Cannot be implemented in JavaScript, Java, Python, Go — requires raw pointer arithmetic',
        'Debugging is nightmare: no way to inspect prev/next separately without context',
        'Modern CPUs have plenty of memory — the optimization is rarely worth the complexity',
      ],
      useCases: [
        'Embedded systems with extremely constrained memory',
        'Academic exercise in understanding pointer arithmetic and XOR properties',
        'Historical optimization — less relevant with modern memory availability',
      ],
      commonPitfalls: [
        'Attempting in garbage-collected languages — GC needs to trace all pointers, XOR hides them',
        'Losing the previous pointer during traversal — cannot recover without starting over',
        'Cannot point to an arbitrary node from outside the list (HashMap can\'t store XOR context)',
        'Debugging: standard debugger cannot show next/prev without manual XOR computation',
      ],
      interviewTips: [
        'Know the concept and why it works (XOR properties: a XOR a = 0, a XOR 0 = a)',
        'Explain why it cannot work in managed languages — GC cannot trace XOR-encoded pointers',
        'If asked to implement: explain the tradeoff honestly — clever but rarely practical',
      ],
      relatedConcepts: ['doubly-linked-list', 'singly-linked-list'],
      difficulty: 'advanced',
      tags: ['xor', 'linked-list', 'memory-optimization', 'c-only'],
      proTip:
        'XOR linked list is a great example of "clever but impractical." In interviews, demonstrating that you understand WHY it is impractical (GC incompatibility, debugging difficulty, negligible memory savings on modern hardware) is more impressive than implementing it.',
    },
    {
      id: 'common-ll-patterns',
      title: 'Common Linked List Patterns',
      description:
        'A collection of fundamental linked list manipulation techniques that appear repeatedly in coding interviews. These patterns — reverse, detect cycle, find middle, merge sorted, find intersection — form a toolkit that solves 90% of linked list interview problems through composition.',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n) for single-list operations, O(n+m) for two-list operations',
      },
      spaceComplexity: 'O(1) for iterative versions, O(n) for recursive',
      keyPoints: [
        'Reverse iteratively: three pointers (prev, curr, next), reassign curr.next = prev each step',
        'Reverse recursively: base case head.next === null, recursive call returns new head, head.next.next = head',
        'Find middle: slow/fast pointers — slow moves 1, fast moves 2; when fast hits end, slow is at middle',
        'For even-length lists: slow stops at first middle (left-biased) or second middle depending on loop condition',
        'Merge two sorted lists: compare heads, append smaller, advance that pointer — sentinel head simplifies code',
        'Intersection point: compute lengths, advance longer list by difference, then advance together until equal',
        'Alternative intersection: two-pointer swap — when p1 hits end go to head of list2, same for p2; they meet at intersection or both hit null',
        'Remove Nth from end: two pointers, advance first by N, then advance both until first hits end',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Essential Linked List Patterns',
          code: `class ListNode<T> {
  constructor(public val: T, public next: ListNode<T> | null = null) {}
}

// Reverse iteratively — O(1) space
function reverseList<T>(head: ListNode<T> | null): ListNode<T> | null {
  let prev: ListNode<T> | null = null;
  let curr = head;
  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

// Find middle (left-biased for even length)
function findMiddle<T>(head: ListNode<T> | null): ListNode<T> | null {
  let slow = head;
  let fast = head;
  while (fast?.next?.next != null) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  return slow;
}

// Merge two sorted lists
function mergeSorted<T extends number>(
  l1: ListNode<T> | null,
  l2: ListNode<T> | null,
): ListNode<T> | null {
  const dummy = new ListNode(0 as T);
  let tail: ListNode<T> = dummy;
  let a = l1;
  let b = l2;
  while (a !== null && b !== null) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a ?? b;
  return dummy.next;
}

// Find intersection point — two pointer swap
function getIntersectionNode<T>(
  headA: ListNode<T> | null,
  headB: ListNode<T> | null,
): ListNode<T> | null {
  let pA = headA;
  let pB = headB;
  while (pA !== pB) {
    pA = pA === null ? headB : pA.next;
    pB = pB === null ? headA : pB.next;
  }
  return pA;
}

// Remove Nth from end
function removeNthFromEnd<T>(
  head: ListNode<T> | null,
  n: number,
): ListNode<T> | null {
  const dummy = new ListNode(0 as T, head);
  let fast: ListNode<T> | null = dummy;
  let slow: ListNode<T> | null = dummy;
  for (let i = 0; i <= n; i++) {
    fast = fast!.next;
  }
  while (fast !== null) {
    slow = slow!.next;
    fast = fast.next;
  }
  slow!.next = slow!.next!.next;
  return dummy.next;
}`,
        },
      ],
      useCases: [
        'Palindrome check: find middle, reverse second half, compare',
        'Sort linked list: merge sort using find-middle + merge-sorted',
        'Reorder list (L0→Ln→L1→Ln-1...): find middle, reverse second half, interleave',
        'Add two numbers represented as linked lists',
      ],
      commonPitfalls: [
        'Reverse: forgetting to save next before overwriting curr.next — loses the rest of the list',
        'Find middle: off-by-one between left-biased and right-biased middle for even-length lists',
        'Merge: not handling remaining elements after one list is exhausted',
        'Intersection: the two-pointer swap trick only works if both lists eventually converge or both hit null',
      ],
      interviewTips: [
        'These patterns compose: "is palindrome" = find middle + reverse second half + compare',
        'Always use dummy head for merge and delete operations — saves 5+ lines of edge case handling',
        'Practice drawing pointer states on paper — it is the fastest way to verify correctness',
      ],
      relatedConcepts: ['singly-linked-list', 'two-pointers', 'merge-sort'],
      difficulty: 'intermediate',
      tags: ['linked-list', 'patterns', 'reverse', 'merge', 'cycle'],
      proTip:
        'Linked list problems in interviews are not about linked lists — they are about pointer manipulation under constraints. The patterns (reverse, merge, slow-fast) appear in other contexts: array partitioning, tree traversal, and graph algorithms all use the same pointer reasoning.',
    },
    {
      id: 'memory-layout',
      title: 'Linked List Memory Layout',
      description:
        'Understanding why linked lists lose to arrays in practice despite theoretical advantages. Each node is a separate heap allocation, scattered across memory, causing cache misses on every pointer dereference. Modern CPUs are optimized for sequential memory access — a simple array traversal can be 10-100x faster than a linked list traversal due to hardware prefetching and cache line utilization.',
      spaceComplexity: 'O(n) — but with high per-element overhead (pointers + allocation metadata)',
      keyPoints: [
        'Array: elements are contiguous → CPU prefetcher loads next cache lines automatically → ~4ns per element',
        'Linked list: each node is a separate malloc → random memory locations → cache miss per node → ~100ns per element',
        'Cache line is typically 64 bytes: an array of ints gets 16 elements per cache line; a LL node might not share a cache line with any neighbor',
        'Heap allocation overhead: each node has 16-32 bytes of allocator metadata (size, alignment, free-list pointers)',
        'In Java, each node object has 12-16 bytes of object header (class pointer, GC mark, hash) PLUS the actual fields',
        'When linked list wins: O(1) splice (move a sublist from one position to another), O(1) insert/delete at known position',
        'When linked list wins: deque operations (push/pop both ends) without amortized resizing pauses',
        'Unrolled linked list: each node holds an array of B elements — combines cache efficiency with O(1) splice',
      ],
      useCases: [
        'Use arrays when: sequential access, random access, cache performance matters, size is predictable',
        'Use linked lists when: frequent insert/delete at known positions, O(1) splice needed, no random access',
        'Use linked lists when: deque with strict O(1) worst-case (no amortized resize), LRU cache',
        'Use unrolled linked list when: need both cache efficiency and O(1) splice',
      ],
      commonPitfalls: [
        'Choosing linked list for "fast insertion" without measuring — array with memmove is often faster due to cache',
        'Benchmarking insertion at a known position — you still need O(n) to FIND the position in a linked list',
        'Ignoring GC impact: millions of small nodes create GC pressure in Java/Go/Python',
        'Assuming O(1) is always faster than O(n) — constant factors matter enormously at cache boundaries',
      ],
      interviewTips: [
        'Showing awareness of cache effects distinguishes senior engineers from juniors',
        'If asked "when would you use a linked list?", answer with specific scenarios (LRU cache, OS scheduler) not just "O(1) insert"',
        'Know Bjarne Stroustrup\'s talk: linked lists are almost always the wrong choice — arrays win even for insertion-heavy workloads up to ~100K elements',
      ],
      relatedConcepts: ['dynamic-array', 'doubly-linked-list', 'lru-cache'],
      difficulty: 'intermediate',
      tags: ['memory', 'cache', 'performance', 'linked-list', 'array'],
      proTip:
        'Bjarne Stroustrup (creator of C++) demonstrated that std::vector beats std::list for insertion even when you have to shift elements — because linear scan + shift in contiguous memory is faster than pointer chasing to the insertion point. The crossover point where linked lists win is much higher than most people think.',
    },
  ],
}
