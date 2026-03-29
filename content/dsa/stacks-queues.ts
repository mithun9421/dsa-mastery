// @ts-nocheck
import type { Category } from '@/lib/types'

export const stacksQueuesCategory: Category = {
  id: 'stacks-queues',
  title: 'Stacks & Queues',
  description: 'LIFO and FIFO abstractions built on arrays and linked lists — plus the monotonic variants that unlock O(n) solutions to problems that seem to require O(n^2).',
  icon: '📚',
  concepts: [
    {
      id: 'stack-array',
      title: 'Stack (Array-based)',
      description:
        'A LIFO (Last In, First Out) data structure backed by a dynamic array. Push and pop operate on the top (end of array) in O(1). Stacks model function call frames, expression evaluation, and backtracking. The array-based implementation is preferred over linked-list in practice due to cache locality.',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1) amortized',
        worst: 'O(n) — during array resize',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'push(): append to end of array — O(1) amortized (same as dynamic array)',
        'pop(): remove and return last element — O(1)',
        'peek()/top(): read last element without removing — O(1)',
        'Models function call stack: each function call pushes a frame, return pops it',
        'DFS traversal: replace recursion with explicit stack to avoid stack overflow on deep graphs',
        'Expression evaluation: operand stack + operator stack, or convert to postfix first',
        'Parentheses matching: push open brackets, pop and compare on close brackets',
        'Array-based is faster than linked-list-based due to contiguous memory and no per-node allocation',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Stack with Practical Applications',
          code: `class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Valid parentheses
function isValidParentheses(s: string): boolean {
  const stack = new Stack<string>();
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if ('([{'.includes(ch)) {
      stack.push(ch);
    } else {
      if (stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.isEmpty();
}

// Evaluate Reverse Polish Notation (postfix)
function evalRPN(tokens: readonly string[]): number {
  const stack = new Stack<number>();
  for (const token of tokens) {
    if ('+-*/'.includes(token)) {
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        case '/': stack.push(Math.trunc(a / b)); break;
      }
    } else {
      stack.push(Number(token));
    }
  }
  return stack.pop()!;
}`,
        },
      ],
      useCases: [
        'Function call stack simulation (iterative DFS, backtracking)',
        'Expression evaluation (infix to postfix, calculator)',
        'Undo/redo operations (two stacks)',
        'Browser back button (history stack)',
      ],
      commonPitfalls: [
        'Popping from empty stack without checking — always guard with isEmpty()',
        'Using stack when queue is needed (BFS needs queue, not stack)',
        'In expression evaluation: operator precedence ordering — multiply before add',
        'Stack overflow with deep recursion: convert to iterative with explicit stack for graphs with depth > 10K',
      ],
      interviewTips: [
        'If a problem involves nested structures (parentheses, HTML tags, function calls), think stack',
        'Two stacks can implement undo/redo, min-stack (track running minimum), or a queue',
        'When converting recursive DFS to iterative: the explicit stack replaces the call stack exactly',
      ],
      relatedConcepts: ['stack-linked-list', 'monotonic-stack-patterns', 'queue-array'],
      difficulty: 'beginner',
      tags: ['stack', 'lifo', 'array', 'expression-evaluation'],
      proTip:
        'The "min stack" problem (O(1) getMin) has a space-optimized variant: instead of a parallel stack of minimums, store the difference (value - currentMin). When the difference is negative, the current value IS the new minimum. Reconstruct the old minimum from the stored difference on pop.',
    },
    {
      id: 'stack-linked-list',
      title: 'Stack (Linked List-based)',
      description:
        'A stack implementation using a singly linked list where push/pop operate at the head. Each push creates a new node; each pop removes the head. Unlike the array-based stack, there is no capacity limit or resize overhead — every operation is O(1) worst-case, not amortized. Choose this when you need strict O(1) guarantees or when the stack is part of a larger linked structure.',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1)',
        worst: 'O(1) — no amortization, no resize',
      },
      spaceComplexity: 'O(n) — higher constant factor due to per-node allocation',
      keyPoints: [
        'Push = insert at head: O(1) worst-case, no array doubling',
        'Pop = remove head: O(1) worst-case, no shifting',
        'No capacity limit: grows until memory exhaustion',
        'Each node is a heap allocation: more GC pressure than array-based',
        'Persistent/immutable stack: push returns new head, old stack is still valid — enables undo history',
        'Used in functional programming: immutable cons list is naturally a stack',
        'Prefer array-based for performance; prefer linked-list for strict worst-case or immutable semantics',
      ],
      useCases: [
        'Real-time systems requiring strict O(1) worst-case (no amortized resize pauses)',
        'Persistent/immutable stack (functional programming, undo history)',
        'When stack nodes are part of a larger linked structure (intrusive data structures)',
        'Concurrent lock-free stacks (Treiber stack uses CAS on head pointer)',
      ],
      commonPitfalls: [
        'Higher memory overhead: pointer + allocator metadata per node vs zero overhead in array',
        'Cache unfriendly: random heap allocations cause cache misses on traversal',
        'In non-GC languages: memory leak if you pop without freeing the node',
        'Assuming LL stack is "better" because O(1) worst-case — array stack is faster in practice for 99% of use cases',
      ],
      interviewTips: [
        'Know when to use LL stack over array stack: strict O(1), immutable/persistent semantics, or lock-free concurrency',
        'The Treiber stack (lock-free stack using CAS) is a classic concurrent data structure',
        'If asked "implement a stack", use array-based unless the interviewer specifies constraints that favor LL',
      ],
      relatedConcepts: ['stack-array', 'singly-linked-list', 'lru-cache'],
      difficulty: 'beginner',
      tags: ['stack', 'linked-list', 'lifo', 'persistent'],
      proTip:
        'The immutable linked list stack is the foundation of persistent data structures. Every push creates a new head that shares the tail with the old stack — O(1) push with full history. This is how Git commits work: each commit points to its parent, and branches are just different heads.',
    },
    {
      id: 'monotonic-stack-patterns',
      title: 'Monotonic Stack Patterns',
      description:
        'A family of problems solved by maintaining a stack in monotonic (increasing or decreasing) order. The unifying insight: when a new element violates the monotonic property, the popped elements have found their "answer" — the element that broke the property. This resolves "next greater/smaller element" queries in O(n) and is the key to histogram, rain water, and subarray min/max problems.',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n)',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Monotonic decreasing stack → next greater element (pop when current > stack top)',
        'Monotonic increasing stack → next smaller element (pop when current < stack top)',
        'Each element enters stack once, exits once → O(2n) = O(n) total operations',
        'Largest rectangle in histogram: increasing stack; on pop, compute area with height = popped, width = current_idx - new_top - 1',
        'Trapping rain water: for each bar, water = min(maxLeft, maxRight) - height; monotonic stack computes this in one pass',
        'Sum of subarray minimums: for each element, count subarrays where it is the min using left/right boundaries from stack',
        'Stock span: how many consecutive days before today had price ≤ today — monotonic decreasing stack tracks this',
        'Push sentinel value (0 or -Infinity) at end to flush remaining stack elements',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Trapping Rain Water & Sum of Subarray Minimums',
          code: `// Trapping Rain Water — monotonic stack approach
function trap(height: readonly number[]): number {
  const stack: number[] = [];
  let water = 0;

  for (let i = 0; i < height.length; i++) {
    while (stack.length > 0 && height[i] > height[stack[stack.length - 1]]) {
      const bottom = stack.pop()!;
      if (stack.length === 0) break;
      const left = stack[stack.length - 1];
      const width = i - left - 1;
      const bounded = Math.min(height[i], height[left]) - height[bottom];
      water += width * bounded;
    }
    stack.push(i);
  }
  return water;
}

// Sum of Subarray Minimums (LeetCode 907)
// For each element, count subarrays where it is the minimum
function sumSubarrayMins(arr: readonly number[]): number {
  const MOD = 1e9 + 7;
  const n = arr.length;
  const left = new Array(n);  // distance to previous smaller
  const right = new Array(n); // distance to next smaller or equal
  const stack: number[] = [];

  // Previous less element (strictly less)
  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && arr[stack[stack.length - 1]] >= arr[i]) {
      stack.pop();
    }
    left[i] = stack.length === 0 ? i + 1 : i - stack[stack.length - 1];
    stack.push(i);
  }

  stack.length = 0;

  // Next less or equal element
  for (let i = n - 1; i >= 0; i--) {
    while (stack.length > 0 && arr[stack[stack.length - 1]] > arr[i]) {
      stack.pop();
    }
    right[i] = stack.length === 0 ? n - i : stack[stack.length - 1] - i;
    stack.push(i);
  }

  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum = (sum + arr[i] * left[i] * right[i]) % MOD;
  }
  return sum;
}`,
        },
      ],
      useCases: [
        'Next greater/smaller element in array',
        'Largest rectangle in histogram and maximal rectangle in binary matrix',
        'Trapping rain water',
        'Sum of subarray minimums/maximums',
        'Stock span and daily temperatures',
      ],
      commonPitfalls: [
        'Duplicate handling in "sum of subarray minimums": use strictly-less on one side and less-or-equal on other to avoid double counting',
        'Width calculation in histogram: when stack is empty after pop, width extends to index 0 (not to 1)',
        'Rain water: the stack approach computes water layer by layer (horizontal), not bar by bar (vertical)',
        'Forgetting sentinel: remaining elements in stack after loop need processing — add sentinel value to avoid special case',
      ],
      interviewTips: [
        'Monotonic stack is the single most testable "advanced" pattern — practice all five canonical problems',
        'When you see "for each element, nearest larger/smaller", say "monotonic stack" immediately',
        'Histogram → maximal rectangle is a common two-part interview question',
      ],
      relatedConcepts: ['monotonic-stack', 'monotonic-deque', 'stack-array'],
      difficulty: 'intermediate',
      tags: ['monotonic-stack', 'next-greater', 'histogram', 'rain-water'],
      proTip:
        'The "sum of subarray minimums" problem reveals a deep pattern: for each element, compute how many subarrays it dominates (is the min of). The contribution is value * leftCount * rightCount. This same contribution-counting technique works for "sum of subarray ranges", "sum of subarray maximums", and many similar problems.',
    },
    {
      id: 'queue-array',
      title: 'Queue (Array/Circular Buffer)',
      description:
        'A FIFO (First In, First Out) data structure implemented with a circular buffer. Using a fixed-size array with head and tail pointers that wrap around avoids the O(n) cost of shifting elements on dequeue. The modular arithmetic trick (index % capacity) turns a linear array into a ring, achieving O(1) enqueue and dequeue.',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1)',
        worst: 'O(1) for fixed-size, O(n) for resize in dynamic version',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Circular buffer: head and tail indices wrap around using modulo arithmetic',
        'Enqueue: data[tail] = value, tail = (tail + 1) % capacity',
        'Dequeue: value = data[head], head = (head + 1) % capacity',
        'Full vs empty: both have head === tail — disambiguate by tracking count, or keeping one slot empty',
        'Naive array queue with shift() is O(n) per dequeue — circular buffer fixes this',
        'BFS uses a queue: enqueue neighbors, dequeue next node to visit',
        'Java ArrayDeque uses a circular buffer; Python collections.deque uses a doubly-linked list of blocks',
        'For unbounded queue, resize by doubling and copying elements in order when full',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Circular Buffer Queue',
          code: `class CircularQueue<T> {
  private data: (T | undefined)[];
  private head = 0;
  private tail = 0;
  private count = 0;
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.data = new Array(capacity);
  }

  enqueue(value: T): boolean {
    if (this.count === this.capacity) return false; // full
    this.data[this.tail] = value;
    this.tail = (this.tail + 1) % this.capacity;
    this.count++;
    return true;
  }

  dequeue(): T | undefined {
    if (this.count === 0) return undefined;
    const value = this.data[this.head];
    this.data[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return value;
  }

  peek(): T | undefined {
    if (this.count === 0) return undefined;
    return this.data[this.head];
  }

  get size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  isFull(): boolean {
    return this.count === this.capacity;
  }
}`,
        },
      ],
      useCases: [
        'BFS traversal of graphs and trees',
        'Task scheduling (process queue, print queue)',
        'Buffering (keyboard buffer, network packet buffer)',
        'Producer-consumer pattern in concurrent systems',
      ],
      commonPitfalls: [
        'Using Array.shift() as a queue dequeue — O(n) per operation, becomes O(n^2) for BFS',
        'Confusing full and empty conditions when both have head === tail',
        'Forgetting modulo on index increment — causes out-of-bounds access',
        'Not handling wrap-around correctly during resize: must copy in logical order, not physical order',
      ],
      interviewTips: [
        'If implementing BFS and asked about queue efficiency, mention circular buffer vs Array.shift()',
        'Design a circular queue is itself a common interview question (LeetCode 622)',
        'Know the tradeoff: circular buffer has fixed size; for dynamic size, prefer linked list or resize-and-copy',
      ],
      relatedConcepts: ['queue-two-stacks', 'deque-ds', 'bfs'],
      difficulty: 'beginner',
      tags: ['queue', 'fifo', 'circular-buffer', 'bfs'],
      proTip:
        'In JavaScript, Array.shift() is O(n) because V8 reindexes the entire array. For BFS with 10^6 nodes, this makes your "O(V+E)" algorithm actually O(V^2). Use a circular buffer or track a head pointer to keep true O(1) dequeue.',
    },
    {
      id: 'queue-two-stacks',
      title: 'Queue (Two Stacks)',
      description:
        'A queue built from two stacks: one for enqueue (push stack) and one for dequeue (pop stack). When the pop stack is empty, all elements from the push stack are poured into it — reversing the order and giving FIFO behavior. Each element is moved at most once between stacks, so amortized cost is O(1) per operation.',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1) amortized',
        worst: 'O(n) — when transferring between stacks',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Two stacks: pushStack (for enqueue) and popStack (for dequeue)',
        'Enqueue: push onto pushStack — always O(1)',
        'Dequeue: if popStack is empty, pour all of pushStack into popStack (reversing order), then pop',
        'Each element crosses the boundary exactly once → O(n) total for n operations → O(1) amortized per operation',
        'The "pour" operation is O(k) where k is pushStack size, but distributes across k future dequeues',
        'Useful when you only have stack primitives (e.g., implementing queue in a language that only provides stacks)',
        'This is how some functional language queues work (Okasaki\'s amortized queue)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Queue Using Two Stacks',
          code: `class QueueFromStacks<T> {
  private pushStack: T[] = [];
  private popStack: T[] = [];

  enqueue(value: T): void {
    this.pushStack.push(value);
  }

  dequeue(): T | undefined {
    this.transferIfNeeded();
    return this.popStack.pop();
  }

  peek(): T | undefined {
    this.transferIfNeeded();
    return this.popStack[this.popStack.length - 1];
  }

  get size(): number {
    return this.pushStack.length + this.popStack.length;
  }

  isEmpty(): boolean {
    return this.pushStack.length === 0 && this.popStack.length === 0;
  }

  private transferIfNeeded(): void {
    if (this.popStack.length === 0) {
      while (this.pushStack.length > 0) {
        this.popStack.push(this.pushStack.pop()!);
      }
    }
  }
}`,
        },
      ],
      useCases: [
        'Implementing queue when only stack operations are available',
        'Functional programming: persistent queue (Okasaki style)',
        'Interview problem: "implement queue using stacks"',
        'Understanding amortized analysis in a simple setting',
      ],
      commonPitfalls: [
        'Transferring on every dequeue instead of only when popStack is empty — makes it O(n) per dequeue',
        'Forgetting to check popStack first before transferring — might re-pour when unnecessary',
        'Mixing push/pop direction: pushStack.pop() goes to popStack.push() — reversing the order is the point',
      ],
      interviewTips: [
        'This is a very common interview question — know it cold',
        'The amortized analysis: "each element is pushed and popped from each stack exactly once → 4 operations total per element → O(1) amortized"',
        'Follow-up: "can you implement stack using queues?" — yes, but each push is O(n)',
      ],
      relatedConcepts: ['stack-array', 'queue-array', 'deque-ds'],
      difficulty: 'beginner',
      tags: ['queue', 'stack', 'amortized', 'two-stacks'],
      proTip:
        'The amortized analysis for two-stack queue is the simplest example of the "banker\'s method": each element pays for its own transfer at enqueue time (2 coins: one for push to pushStack, one for future transfer). When it is transferred, the pre-paid coin covers the cost.',
    },
    {
      id: 'priority-queue',
      title: 'Priority Queue / Binary Heap',
      description:
        'A data structure where each element has a priority, and the highest-priority element is always extractable in O(log n). Typically implemented as a binary heap — a complete binary tree stored in an array. The heap property (parent <= children for min-heap) is maintained through sift-up on insert and sift-down on extract. Build-heap from an existing array is O(n), not O(n log n), due to the geometric sum of sift-down costs.',
      timeComplexity: {
        best: 'O(1) — peek min/max',
        average: 'O(log n) — insert/extract',
        worst: 'O(log n) — insert/extract',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Array representation: parent = floor((i-1)/2), left child = 2i+1, right child = 2i+2',
        'Insert: add at end (next available leaf), sift up to restore heap property — O(log n)',
        'Extract-min: swap root with last element, remove last, sift down root — O(log n)',
        'Build-heap: sift-down from last non-leaf to root — O(n) due to most nodes being near leaves',
        'O(n) build proof: sum of (n/2^k) * k for k from 0 to log(n) = O(n) — not n * log(n)',
        'Peek: return root element without removing — O(1)',
        'No efficient search: finding an arbitrary element is O(n) — use indexed PQ if you need decrease-key',
        'Not sorted: extracting all elements gives sorted order (heap sort) but the array itself is not sorted',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Min-Heap Priority Queue',
          code: `class MinHeap<T> {
  private heap: T[] = [];

  constructor(private compare: (a: T, b: T) => number = (a, b) => (a as number) - (b as number)) {}

  get size(): number {
    return this.heap.length;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  push(value: T): void {
    this.heap.push(value);
    this.siftUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return min;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.compare(this.heap[i], this.heap[parent]) >= 0) break;
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
      if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }

  // Build heap from array in O(n)
  static fromArray<T>(arr: T[], compare?: (a: T, b: T) => number): MinHeap<T> {
    const heap = new MinHeap<T>(compare);
    heap.heap = [...arr];
    // Sift down from last non-leaf
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      heap.siftDown(i);
    }
    return heap;
  }
}`,
        },
      ],
      useCases: [
        'Dijkstra\'s shortest path: extract nearest unvisited vertex',
        'Prim\'s MST: extract minimum weight edge to new vertex',
        'Merge k sorted lists: min-heap of k list heads',
        'Task scheduling: process highest priority task first',
        'Median maintenance: max-heap for lower half, min-heap for upper half',
      ],
      commonPitfalls: [
        'Index arithmetic: parent = (i-1)/2, NOT i/2 for 0-indexed arrays',
        'Build-heap: must sift DOWN, not sift UP — sifting up gives O(n log n), sifting down gives O(n)',
        'Confusing min-heap with max-heap: Dijkstra needs min-heap, kth largest needs either',
        'Assuming heap is sorted: heap[1] is NOT necessarily the second smallest',
      ],
      interviewTips: [
        'Know the O(n) build-heap proof — it shows understanding beyond API usage',
        'Merge k sorted lists (LeetCode 23) is the canonical priority queue problem',
        'For "kth largest": push all to min-heap of size k; root is the kth largest — O(n log k)',
      ],
      relatedConcepts: ['binary-heap', 'heap-sort', 'indexed-priority-queue', 'fibonacci-heap'],
      difficulty: 'intermediate',
      tags: ['priority-queue', 'heap', 'binary-heap', 'dijkstra'],
      proTip:
        'The O(n) build-heap time is one of the most frequently asked "explain why" questions. The intuition: most nodes are near the bottom of the tree. Half the nodes are leaves (0 work), quarter are one level up (1 swap), etc. The sum 0*n/2 + 1*n/4 + 2*n/8 + ... converges to O(n), not O(n log n).',
    },
    {
      id: 'deque-ds',
      title: 'Deque (Double-ended Queue)',
      description:
        'A data structure supporting O(1) insertion and removal at both ends. Implemented as a circular buffer (Java ArrayDeque) or doubly-linked list of fixed-size blocks (Python collections.deque). Deques generalize both stacks (use one end) and queues (use both ends), and are the building block for the monotonic deque used in sliding window maximum.',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1) amortized',
        worst: 'O(n) — during resize for array-based implementation',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Operations: pushFront, pushBack, popFront, popBack — all O(1)',
        'Array-based (Java ArrayDeque): circular buffer with head/tail pointers, doubles capacity on full',
        'Block-based (Python deque): linked list of fixed-size blocks, O(1) append/pop at both ends, O(n) random access',
        'Java ArrayDeque is faster than LinkedList for both stack and queue usage due to cache locality',
        'Sliding window maximum uses a monotonic deque: front holds max, back removes non-competitive elements',
        'Can be used as both stack (push/pop same end) and queue (push one end, pop other)',
        'C++ std::deque uses a map of fixed-size chunks — gives O(1) random access unlike pure LL',
        'Not suitable for random access: accessing middle element is O(n) in LL-based, O(1) in array-based but with worse constants than plain array',
      ],
      useCases: [
        'Sliding window maximum/minimum (monotonic deque)',
        'Work-stealing scheduler (steal from back of other threads\' deques)',
        'Palindrome checker (compare front and back)',
        'BFS when you need to push to front (0-1 BFS for 0-weight edges)',
      ],
      commonPitfalls: [
        'In JavaScript: no built-in deque; Array.shift()/unshift() are O(n) — implement your own or use circular buffer',
        'Confusing deque with priority queue: deque maintains insertion order, PQ maintains priority order',
        'Using LL-based deque when random access is needed — use array-based instead',
        'Forgetting to handle wrap-around in circular buffer implementation',
      ],
      interviewTips: [
        'If sliding window maximum comes up, explain the monotonic deque approach and why it is O(n)',
        '0-1 BFS uses a deque: push 0-weight edges to front, 1-weight edges to back — avoids Dijkstra overhead',
        'Know that Java ArrayDeque outperforms LinkedList for both stack and queue workloads',
      ],
      relatedConcepts: ['queue-array', 'monotonic-deque', 'sliding-window'],
      difficulty: 'intermediate',
      tags: ['deque', 'double-ended-queue', 'circular-buffer'],
      proTip:
        '0-1 BFS is an underappreciated algorithm: for graphs with only 0 and 1 weight edges, use a deque instead of Dijkstra\'s min-heap. Push 0-weight neighbors to front, 1-weight to back. This gives O(V+E) instead of O(E log V) — a significant speedup on sparse graphs.',
    },
    {
      id: 'monotonic-deque-patterns',
      title: 'Monotonic Deque Patterns',
      description:
        'The sliding window counterpart of monotonic stack. A deque maintains elements in monotonic order within a sliding window, providing O(1) access to the window\'s min or max. When the window slides, expired elements leave from the front and non-competitive elements are removed from the back. The total work is O(n) since each element enters and exits the deque at most once.',
      timeComplexity: {
        best: 'O(n) total',
        average: 'O(1) amortized per operation',
        worst: 'O(n) total',
      },
      spaceComplexity: 'O(k) where k = window size',
      keyPoints: [
        'Maintains window maximum (or minimum) accessible at deque front in O(1)',
        'Back removal: remove elements from back that are less useful than the new element (smaller for max-deque)',
        'Front removal: remove front element if its index is outside the current window',
        'Store indices, not values: needed to check if front element has expired from the window',
        'For max-deque: front is always the maximum in current window; for min-deque: front is minimum',
        'DP optimization: when dp[i] = min/max(dp[j]) + cost for j in [i-k, i-1], monotonic deque makes it O(n) instead of O(nk)',
        'Can track both max and min simultaneously using two deques for "max-min" sliding window problems',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Sliding Window Maximum & DP Optimization',
          code: `// Sliding window maximum — O(n)
function maxSlidingWindow(nums: readonly number[], k: number): number[] {
  const deque: number[] = [];
  const result: number[] = [];

  for (let i = 0; i < nums.length; i++) {
    // Remove expired elements from front
    if (deque.length > 0 && deque[0] <= i - k) {
      deque.shift();
    }
    // Remove smaller elements from back
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }
    deque.push(i);
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }
  return result;
}

// DP optimization: jump game with cost
// dp[i] = min cost to reach index i, can jump from [i-k, i-1]
function minCostJump(cost: readonly number[], k: number): number {
  const n = cost.length;
  const dp = new Array(n).fill(Infinity);
  dp[0] = cost[0];
  const deque: number[] = [0]; // stores indices, front = min dp value

  for (let i = 1; i < n; i++) {
    // Remove expired
    while (deque.length > 0 && deque[0] < i - k) {
      deque.shift();
    }
    dp[i] = dp[deque[0]] + cost[i];
    // Remove non-competitive from back
    while (deque.length > 0 && dp[deque[deque.length - 1]] >= dp[i]) {
      deque.pop();
    }
    deque.push(i);
  }
  return dp[n - 1];
}`,
        },
      ],
      useCases: [
        'Sliding window maximum/minimum queries',
        'DP optimization for bounded-range transitions (O(nk) → O(n))',
        'Constrained subarray problems (max subarray of length between a and b)',
        'Jump game variants with bounded jump distance',
      ],
      commonPitfalls: [
        'Using Array.shift() in JS which is O(n) — use circular buffer for large inputs',
        'Forgetting to check expiry from front BEFORE reading the max/min',
        'DP optimization: the deque tracks dp values, not the cost array — compare dp[deque_back] not cost',
        'Off-by-one: the first complete window is at index k-1, and front element expiry is at i-k (not i-k+1)',
      ],
      interviewTips: [
        'Sliding window maximum is the most-asked deque problem — practice until the index management is automatic',
        'If asked "can you do better than O(n log k)?", the answer is monotonic deque O(n)',
        'The DP optimization pattern is advanced but impressive: "I recognize this DP has a sliding range transition, so I can optimize with a monotonic deque"',
      ],
      relatedConcepts: ['monotonic-stack', 'sliding-window', 'deque-ds', 'dynamic-programming'],
      difficulty: 'advanced',
      tags: ['monotonic-deque', 'sliding-window', 'dp-optimization'],
      proTip:
        'Monotonic deque DP optimization is a competitive programming power move. Whenever your DP recurrence is dp[i] = min/max over dp[i-k..i-1] + something, the brute force is O(nk) but the deque makes it O(n). Look for this pattern in problems involving jumps, partitions, or ranges.',
    },
  ],
}
