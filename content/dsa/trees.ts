// @ts-nocheck
import type { Category } from '@/lib/types'

export const treesCategory: Category = {
  id: 'trees',
  title: 'Trees',
  description: 'Hierarchical data structures from basic binary trees to self-balancing BSTs, segment trees, and specialized structures for string, spatial, and compression problems.',
  icon: '🌳',
  concepts: [
    {
      id: 'binary-tree',
      title: 'Binary Tree',
      description:
        'A hierarchical structure where each node has at most two children. The four traversal orders (pre/in/post/level) each reveal different structural information. Iterative traversals using an explicit stack avoid stack overflow on deep trees, and Morris traversal achieves O(1) space by temporarily threading the tree using null right pointers.',
      timeComplexity: {
        best: 'O(n) — all traversals visit every node',
        average: 'O(n)',
        worst: 'O(n)',
      },
      spaceComplexity: 'O(h) for recursive/stack traversals, O(1) for Morris traversal',
      keyPoints: [
        'Pre-order (root, left, right): used for serialization, copying trees, prefix expression',
        'In-order (left, root, right): produces sorted output for BST, used to validate BST property',
        'Post-order (left, right, root): used for deletion (delete children before parent), expression evaluation',
        'Level-order (BFS): uses queue, gives nodes level by level — used for "right side view", "zigzag traversal"',
        'Iterative in-order: push all left children, pop and process, move to right — simulates recursion with stack',
        'Morris in-order: find in-order predecessor, thread right pointer to current, traverse without stack',
        'Morris traversal modifies tree temporarily (restores it) — O(1) space but not thread-safe',
        'Height of tree with n nodes: O(log n) balanced, O(n) worst case (degenerate/linked-list shape)',
        'Number of structurally unique BSTs with n nodes: Catalan number C(n) = (2n)! / ((n+1)! * n!)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Iterative Traversals & Morris Traversal',
          code: `class TreeNode<T> {
  constructor(
    public val: T,
    public left: TreeNode<T> | null = null,
    public right: TreeNode<T> | null = null,
  ) {}
}

// Iterative in-order traversal
function inorderIterative<T>(root: TreeNode<T> | null): T[] {
  const result: T[] = [];
  const stack: TreeNode<T>[] = [];
  let current = root;

  while (current !== null || stack.length > 0) {
    while (current !== null) {
      stack.push(current);
      current = current.left;
    }
    current = stack.pop()!;
    result.push(current.val);
    current = current.right;
  }
  return result;
}

// Morris in-order traversal — O(1) space
function morrisInorder<T>(root: TreeNode<T> | null): T[] {
  const result: T[] = [];
  let current = root;

  while (current !== null) {
    if (current.left === null) {
      result.push(current.val);
      current = current.right;
    } else {
      // Find in-order predecessor
      let predecessor = current.left;
      while (predecessor.right !== null && predecessor.right !== current) {
        predecessor = predecessor.right;
      }
      if (predecessor.right === null) {
        // Thread: point predecessor's right to current
        predecessor.right = current;
        current = current.left;
      } else {
        // Unthread: restore tree structure
        predecessor.right = null;
        result.push(current.val);
        current = current.right;
      }
    }
  }
  return result;
}

// Iterative pre-order
function preorderIterative<T>(root: TreeNode<T> | null): T[] {
  if (root === null) return [];
  const result: T[] = [];
  const stack: TreeNode<T>[] = [root];
  while (stack.length > 0) {
    const node = stack.pop()!;
    result.push(node.val);
    if (node.right) stack.push(node.right); // Right first so left is processed first
    if (node.left) stack.push(node.left);
  }
  return result;
}`,
        },
      ],
      useCases: [
        'Expression trees (arithmetic, boolean expressions)',
        'File system hierarchy',
        'DOM tree in web browsers',
        'Decision trees in ML',
      ],
      commonPitfalls: [
        'Iterative pre-order: push right BEFORE left onto stack, so left is popped first',
        'Morris traversal: forgetting to restore the thread (unlink predecessor.right) corrupts the tree',
        'Confusing height (edges from root to deepest leaf) with depth (edges from root to a specific node)',
        'Recursive traversal on deep trees (>10K depth) causes stack overflow — use iterative',
      ],
      interviewTips: [
        'Know all three iterative traversals — some interviewers specifically forbid recursion',
        'Morris traversal is an advanced topic; mentioning it shows depth even if not implementing it',
        'For "serialize/deserialize binary tree": pre-order with null markers is the simplest approach',
      ],
      relatedConcepts: ['bst', 'avl-tree', 'segment-tree', 'trie'],
      difficulty: 'beginner',
      tags: ['binary-tree', 'traversal', 'dfs', 'bfs'],
      proTip:
        'Morris traversal is the only way to do in-order traversal in O(1) space without a stack. The trick is using the null right pointers of in-order predecessors as temporary threads back to the current node. It is rarely used in production (modifying the tree is unsafe in concurrent systems) but demonstrates mastery in interviews.',
    },
    {
      id: 'bst',
      title: 'Binary Search Tree',
      description:
        'A binary tree where every left descendant is strictly less than the node, and every right descendant is strictly greater. This invariant enables O(h) search, insert, and delete — but h is O(n) in the worst case (sorted insertion creates a linked list). This worst-case motivates self-balancing trees (AVL, Red-Black).',
      timeComplexity: {
        best: 'O(log n) — balanced tree',
        average: 'O(log n) — random insertion order',
        worst: 'O(n) — degenerate tree (sorted insertion)',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Invariant: left subtree values < node value < right subtree values (for all nodes, not just children)',
        'Search: compare with root, go left if smaller, right if larger — binary search on a tree',
        'Insert: search for position, insert as leaf — O(h)',
        'Delete: 3 cases — leaf (remove), one child (bypass), two children (replace with in-order successor/predecessor)',
        'In-order traversal produces sorted output — this is the key property',
        'Average height with random insertions: O(log n) — but NOT guaranteed without balancing',
        'Sorted insertion creates a linked list: 1→2→3→4 becomes a right-skewed chain with height n',
        'Validate BST: in-order traversal must be strictly increasing, OR recursive with min/max bounds',
        'kth smallest: in-order traversal to kth element, or augment nodes with subtree size for O(h)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'BST Operations',
          code: `class BSTNode {
  constructor(
    public val: number,
    public left: BSTNode | null = null,
    public right: BSTNode | null = null,
  ) {}
}

function search(root: BSTNode | null, target: number): BSTNode | null {
  if (root === null || root.val === target) return root;
  return target < root.val ? search(root.left, target) : search(root.right, target);
}

function insert(root: BSTNode | null, val: number): BSTNode {
  if (root === null) return new BSTNode(val);
  if (val < root.val) {
    return new BSTNode(root.val, insert(root.left, val), root.right);
  }
  if (val > root.val) {
    return new BSTNode(root.val, root.left, insert(root.right, val));
  }
  return root; // duplicate, no change
}

function findMin(node: BSTNode): BSTNode {
  let current = node;
  while (current.left !== null) current = current.left;
  return current;
}

function deleteNode(root: BSTNode | null, val: number): BSTNode | null {
  if (root === null) return null;
  if (val < root.val) {
    return new BSTNode(root.val, deleteNode(root.left, val), root.right);
  }
  if (val > root.val) {
    return new BSTNode(root.val, root.left, deleteNode(root.right, val));
  }
  // Found the node to delete
  if (root.left === null) return root.right;
  if (root.right === null) return root.left;
  // Two children: replace with in-order successor
  const successor = findMin(root.right);
  return new BSTNode(successor.val, root.left, deleteNode(root.right, successor.val));
}

// Validate BST
function isValidBST(
  root: BSTNode | null,
  min = -Infinity,
  max = Infinity,
): boolean {
  if (root === null) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) && isValidBST(root.right, root.val, max);
}`,
        },
      ],
      useCases: [
        'Sorted data storage with dynamic insertions/deletions',
        'Range queries (find all elements between lo and hi)',
        'In-order successor/predecessor queries',
        'Foundation for self-balancing trees (AVL, Red-Black)',
      ],
      commonPitfalls: [
        'Validating BST by only checking immediate children: [5, 1, 6, null, null, 3, 7] has 3 in right subtree of 5',
        'Delete with two children: must find in-order successor (smallest in right subtree), not just any right child',
        'Assuming BST is balanced: without self-balancing, sorted insertions create O(n) height',
        'Forgetting to handle duplicates: decide policy (left subtree, right subtree, or reject) and be consistent',
      ],
      interviewTips: [
        'BST validation with min/max bounds is cleaner than in-order traversal validation',
        'Delete is the hardest operation — practice the three cases until automatic',
        'If asked "why not just use BST?", explain the degenerate case and motivate balanced trees',
      ],
      relatedConcepts: ['avl-tree', 'red-black-tree', 'binary-tree', 'treap'],
      difficulty: 'beginner',
      tags: ['bst', 'binary-search', 'sorted', 'tree'],
      proTip:
        'The immutable BST insert (returning a new tree with shared structure) is the basis of persistent data structures. Each insert creates O(log n) new nodes while sharing the rest of the tree with the previous version — enabling O(log n) versioning.',
    },
    {
      id: 'avl-tree',
      title: 'AVL Tree',
      description:
        'A self-balancing BST where the height difference (balance factor) between left and right subtrees of every node is at most 1. When insertion or deletion violates this invariant, rotations restore balance. AVL trees guarantee O(log n) height — specifically, h < 1.44 * log2(n) — making them slightly more balanced (and thus faster for lookups) than Red-Black trees, but with more rotations on modification.',
      timeComplexity: {
        best: 'O(log n)',
        average: 'O(log n)',
        worst: 'O(log n) — guaranteed by balance invariant',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Balance factor = height(left) - height(right), must be in {-1, 0, 1} for every node',
        'Four rotation cases: Left-Left (right rotate), Right-Right (left rotate), Left-Right (left then right), Right-Left (right then left)',
        'Single rotation fixes LL and RR; double rotation fixes LR and RL',
        'Height guarantee: AVL tree height h satisfies h < 1.44 * log2(n + 2)',
        'More strictly balanced than Red-Black: AVL height ≈ 1.44 log n vs RB height ≈ 2 log n',
        'More rotations on insert/delete than Red-Black: AVL may rotate up to O(log n) on delete, RB rotates at most 3',
        'Use AVL when reads >> writes (database indices with rare updates), use Red-Black when writes are frequent',
        'Fibonacci trees are the worst-case AVL trees: minimal nodes for a given height',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'AVL Tree with Rotations',
          code: `class AVLNode {
  height = 1;
  constructor(
    public val: number,
    public left: AVLNode | null = null,
    public right: AVLNode | null = null,
  ) {}
}

function getHeight(node: AVLNode | null): number {
  return node === null ? 0 : node.height;
}

function getBalance(node: AVLNode | null): number {
  return node === null ? 0 : getHeight(node.left) - getHeight(node.right);
}

function updateHeight(node: AVLNode): void {
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

function rotateRight(y: AVLNode): AVLNode {
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function rotateLeft(x: AVLNode): AVLNode {
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

function insertAVL(node: AVLNode | null, val: number): AVLNode {
  if (node === null) return new AVLNode(val);

  if (val < node.val) node.left = insertAVL(node.left, val);
  else if (val > node.val) node.right = insertAVL(node.right, val);
  else return node; // duplicate

  updateHeight(node);
  const balance = getBalance(node);

  // Left-Left
  if (balance > 1 && val < node.left!.val) return rotateRight(node);
  // Right-Right
  if (balance < -1 && val > node.right!.val) return rotateLeft(node);
  // Left-Right
  if (balance > 1 && val > node.left!.val) {
    node.left = rotateLeft(node.left!);
    return rotateRight(node);
  }
  // Right-Left
  if (balance < -1 && val < node.right!.val) {
    node.right = rotateRight(node.right!);
    return rotateLeft(node);
  }

  return node;
}`,
        },
      ],
      useCases: [
        'Database indices where reads vastly outnumber writes',
        'In-memory dictionaries with guaranteed O(log n) lookup',
        'When worst-case performance matters more than average throughput',
        'Educational: understanding self-balancing tree principles',
      ],
      commonPitfalls: [
        'Forgetting to update height after rotation — stale heights break future balance calculations',
        'Confusing LL/RR with LR/RL: LL means inserted into left child\'s LEFT subtree',
        'Applying single rotation for LR case — must do double rotation (left on child, right on node)',
        'Not handling delete rebalancing: delete can cause O(log n) rotations (unlike insert which causes at most 2)',
      ],
      interviewTips: [
        'Draw the four rotation cases — visual understanding is essential',
        'Know the AVL vs Red-Black tradeoff: AVL is more balanced (faster reads), RB has fewer rotations (faster writes)',
        'If asked "why not AVL everywhere?", explain that RB trees have O(1) amortized rotations on insert',
      ],
      relatedConcepts: ['bst', 'red-black-tree', 'splay-tree', 'treap'],
      difficulty: 'advanced',
      tags: ['avl', 'balanced-tree', 'rotation', 'self-balancing'],
      proTip:
        'The height bound 1.44 * log2(n) comes from Fibonacci trees — the sparsest possible AVL trees. At height h, the minimum AVL tree has F(h+2) - 1 nodes (Fibonacci numbers). Since Fibonacci grows as φ^h (golden ratio), inverting gives h ≈ 1.44 * log2(n). This is why AVL trees are more balanced than Red-Black trees (which allow height up to 2 * log2(n)).',
    },
    {
      id: 'red-black-tree',
      title: 'Red-Black Tree',
      description:
        'A self-balancing BST that maintains balance through node coloring (red or black) and five invariants. The key guarantee: no root-to-leaf path is more than twice as long as any other, bounding height to 2 * log2(n). Red-Black trees are the standard behind Java TreeMap, C++ std::map, and Linux CFS scheduler because they offer O(log n) operations with fewer rotations than AVL on modifications.',
      timeComplexity: {
        best: 'O(log n)',
        average: 'O(log n)',
        worst: 'O(log n)',
      },
      spaceComplexity: 'O(n) — one extra bit per node for color',
      keyPoints: [
        'Five properties: (1) every node is red or black, (2) root is black, (3) leaves (NIL) are black, (4) red node has black children, (5) all root-to-leaf paths have same black count',
        'Height bound: h <= 2 * log2(n + 1) — less strict than AVL\'s 1.44 * log2(n)',
        'Insert: add as red leaf, fix violations with recoloring and at most 2 rotations',
        'Delete: more complex — may need recoloring and at most 3 rotations',
        'Amortized O(1) rotations per insert (though O(log n) recolorings)',
        'Why 2*log(n): property 5 ensures at least half the nodes on any path are black; property 4 limits red nodes',
        'Left-leaning Red-Black tree (LLRB): simplified variant that maps to 2-3 trees, fewer cases to handle',
        'Java TreeMap, C++ std::map/std::set, Linux CFS scheduler all use Red-Black trees',
      ],
      useCases: [
        'Standard library sorted map/set implementations (Java, C++, .NET)',
        'When insertion and deletion are frequent (fewer rotations than AVL)',
        'Linux kernel: CFS scheduler uses RB tree for task scheduling by virtual runtime',
        'Database indices when write performance matters as much as read performance',
      ],
      commonPitfalls: [
        'Implementing from scratch in an interview: usually not expected — focus on properties and tradeoffs',
        'Confusing with AVL: RB allows height up to 2x optimal, AVL is stricter',
        'Forgetting property 5 (equal black depth) is the key structural property — the others serve to enforce it',
        'Uncle color matters during insert fix: red uncle → recolor, black uncle → rotate',
      ],
      interviewTips: [
        'You are almost never asked to implement RB tree — know the 5 properties and how they guarantee O(log n)',
        'The key comparison: AVL has faster lookups (lower height), RB has faster modifications (fewer rotations)',
        'Know that Java TreeMap is RB, Java HashMap treeifies collisions into RB trees at bucket size 8',
        'If asked "why not AVL for std::map?", answer: RB has O(1) amortized structural changes per insert',
      ],
      relatedConcepts: ['avl-tree', 'bst', 'b-tree', 'splay-tree'],
      difficulty: 'advanced',
      tags: ['red-black', 'balanced-tree', 'self-balancing'],
      proTip:
        'Red-Black trees are isomorphic to 2-3-4 trees (or 2-3 trees for left-leaning variant). A red node is "fused" with its black parent to form a 3-node or 4-node. Understanding this correspondence makes the rotation/recoloring rules intuitive rather than arbitrary.',
    },
    {
      id: 'b-tree',
      title: 'B-Tree / B+ Tree',
      description:
        'A self-balancing tree optimized for systems that read/write large blocks of data (disk, SSD). Each node holds multiple keys and children, with a branching factor B that minimizes disk I/O by keeping tree height low. B+ trees extend this by storing all data in leaves and linking leaves for efficient range scans. Every modern database (PostgreSQL, MySQL InnoDB, SQLite) uses B+ trees for indexing.',
      timeComplexity: {
        best: 'O(log_B n)',
        average: 'O(log_B n)',
        worst: 'O(log_B n) — typically 3-4 levels for billions of records',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'B-tree of order m: each node has at most m children and m-1 keys; at least ceil(m/2) children (except root)',
        'All leaves at same depth — perfectly balanced',
        'Node size typically matches disk page size (4KB or 8KB) — one I/O per node access',
        'With B = 1000 and 3 levels: 10^9 records accessible in 3 disk reads',
        'B+ tree: internal nodes only store keys (routing), all data in leaves, leaves linked as doubly-linked list',
        'B+ leaf linking enables efficient range scans: find start, follow pointers',
        'Insert: if node full, split into two and push middle key up; may cascade to root (root split increases height)',
        'Delete: if node underflows, borrow from sibling or merge; may cascade to root (root merge decreases height)',
        'PostgreSQL, MySQL InnoDB, SQLite, MongoDB — all use B+ trees for their primary index structure',
      ],
      useCases: [
        'Database indexing (primary and secondary indices)',
        'File system metadata (NTFS, HFS+, ext4 uses extent trees)',
        'Key-value stores (LevelDB, RocksDB use LSM trees, but B-trees are the alternative)',
        'Any system where data resides on disk and minimizing I/O is critical',
      ],
      commonPitfalls: [
        'Confusing B-tree with binary tree: B-tree has branching factor B >> 2',
        'Confusing B-tree with B+ tree: in B-tree data is in all nodes; in B+ tree data is only in leaves',
        'Choosing B too small loses the I/O advantage; too large wastes space within nodes',
        'Forgetting that B-tree operations are measured in disk I/Os, not comparisons',
      ],
      interviewTips: [
        'System design interviews: "how does a database index work?" → B+ tree',
        'Know why B+ tree > B-tree for databases: internal nodes hold more keys (no data), better range scans',
        'Calculate: with 4KB pages and 8-byte keys, branching factor ≈ 500, so 500^3 ≈ 125 million records in 3 levels',
        'LSM tree vs B-tree is a common comparison: LSM is better for write-heavy, B-tree for read-heavy',
      ],
      relatedConcepts: ['bst', 'red-black-tree', 'avl-tree'],
      difficulty: 'advanced',
      tags: ['b-tree', 'b-plus-tree', 'database', 'disk-io', 'indexing'],
      proTip:
        'The reason databases use B+ trees instead of hash indexes for primary keys: B+ trees support range queries (WHERE price > 10 AND price < 100) by scanning linked leaves, while hash indexes only support exact match. The 3-level B+ tree for a billion rows means every lookup is 3 SSD reads ≈ 300 microseconds.',
    },
    {
      id: 'segment-tree',
      title: 'Segment Tree',
      description:
        'A binary tree where each node represents a range of the original array and stores an aggregate value (sum, min, max, GCD). Supports both range queries and point/range updates in O(log n). Lazy propagation defers range updates to children, keeping updates O(log n) instead of O(n). The go-to structure when you need both queries and updates on ranges.',
      timeComplexity: {
        best: 'O(log n) per query/update',
        average: 'O(log n)',
        worst: 'O(n) build, O(log n) per operation',
      },
      spaceComplexity: 'O(4n) — array size for segment tree is 4x input',
      keyPoints: [
        'Build: recursively divide array, each node stores aggregate of its range — O(n)',
        'Point update: update leaf, propagate change up to root — O(log n)',
        'Range query: decompose [l, r] into O(log n) pre-computed segments — O(log n)',
        'Lazy propagation: store pending updates in nodes, push down only when children are accessed',
        'With lazy propagation: range updates in O(log n), not O(n)',
        'Array representation: node i has children 2i and 2i+1, parent floor(i/2) — use 1-indexed',
        'Size 4n is safe upper bound for array (some sources say 2*2^ceil(log2(n)))',
        'Persistent segment tree: create new nodes on update path, share unchanged subtrees — O(log n) per version',
        'Merge sort tree: each node stores sorted subarray — O(n log n) space, O(log² n) count-in-range queries',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Segment Tree with Lazy Propagation',
          code: `class SegmentTree {
  private tree: number[];
  private lazy: number[];
  private n: number;

  constructor(arr: readonly number[]) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(0);
    this.lazy = new Array(4 * this.n).fill(0);
    this.build(arr, 1, 0, this.n - 1);
  }

  private build(arr: readonly number[], node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = arr[start];
      return;
    }
    const mid = Math.floor((start + end) / 2);
    this.build(arr, 2 * node, start, mid);
    this.build(arr, 2 * node + 1, mid + 1, end);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  private pushDown(node: number, start: number, end: number): void {
    if (this.lazy[node] !== 0) {
      const mid = Math.floor((start + end) / 2);
      this.applyLazy(2 * node, start, mid, this.lazy[node]);
      this.applyLazy(2 * node + 1, mid + 1, end, this.lazy[node]);
      this.lazy[node] = 0;
    }
  }

  private applyLazy(node: number, start: number, end: number, val: number): void {
    this.tree[node] += val * (end - start + 1);
    this.lazy[node] += val;
  }

  // Range update: add val to all elements in [l, r]
  updateRange(l: number, r: number, val: number): void {
    this.updateHelper(1, 0, this.n - 1, l, r, val);
  }

  private updateHelper(
    node: number, start: number, end: number,
    l: number, r: number, val: number,
  ): void {
    if (r < start || end < l) return;
    if (l <= start && end <= r) {
      this.applyLazy(node, start, end, val);
      return;
    }
    this.pushDown(node, start, end);
    const mid = Math.floor((start + end) / 2);
    this.updateHelper(2 * node, start, mid, l, r, val);
    this.updateHelper(2 * node + 1, mid + 1, end, l, r, val);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  // Range sum query [l, r]
  query(l: number, r: number): number {
    return this.queryHelper(1, 0, this.n - 1, l, r);
  }

  private queryHelper(
    node: number, start: number, end: number,
    l: number, r: number,
  ): number {
    if (r < start || end < l) return 0;
    if (l <= start && end <= r) return this.tree[node];
    this.pushDown(node, start, end);
    const mid = Math.floor((start + end) / 2);
    return (
      this.queryHelper(2 * node, start, mid, l, r) +
      this.queryHelper(2 * node + 1, mid + 1, end, l, r)
    );
  }
}`,
        },
      ],
      useCases: [
        'Range sum/min/max queries with point or range updates',
        'Count of elements in range satisfying a condition (merge sort tree variant)',
        'Interval scheduling and rectangle union area',
        'Competitive programming: most range-query-with-update problems',
      ],
      commonPitfalls: [
        'Array size: use 4*n, not 2*n — the tree can have up to 4n nodes',
        'Lazy propagation: must push down BEFORE accessing children in both query and update',
        'Off-by-one: segment tree is typically 1-indexed (node 1 is root, children are 2i and 2i+1)',
        'Forgetting to merge correctly: sum uses +, min uses Math.min, max uses Math.max — do not mix',
      ],
      interviewTips: [
        'Segment tree is the answer whenever you see "range query + updates" in the problem',
        'Know when to use segment tree vs Fenwick tree: segment tree is more general but 2-4x more code',
        'Lazy propagation is the advanced follow-up: "what if the update is also a range?"',
      ],
      relatedConcepts: ['fenwick-tree', 'sparse-table', 'prefix-sum'],
      difficulty: 'advanced',
      tags: ['segment-tree', 'range-query', 'lazy-propagation'],
      proTip:
        'Persistent segment tree enables "query the array as it was at version k" in O(log n) time and O(n + q log n) space. Each update creates O(log n) new nodes while sharing the rest. This is the foundation for online algorithms that need to undo/redo operations or answer historical queries.',
    },
    {
      id: 'fenwick-tree',
      title: 'Fenwick Tree (Binary Indexed Tree)',
      description:
        'A compact array-based structure that supports prefix sum queries and point updates in O(log n), using a clever bit manipulation trick: i & (-i) extracts the lowest set bit, which determines how many elements each position is responsible for. Fenwick trees use half the memory of segment trees and have smaller constant factors, making them the preferred choice when segment tree\'s generality is not needed.',
      timeComplexity: {
        best: 'O(log n) per query/update',
        average: 'O(log n)',
        worst: 'O(log n)',
      },
      spaceComplexity: 'O(n) — exactly n+1 array elements',
      keyPoints: [
        'bit[i] stores sum of elements in range determined by lowest set bit of i',
        'lowbit(i) = i & (-i) — extracts lowest set bit, determines range length',
        'Prefix sum query: add bit[i], then i -= lowbit(i), repeat until i = 0 — O(log n)',
        'Point update: add delta to bit[i], then i += lowbit(i), repeat until i > n — O(log n)',
        'Range sum: prefixSum(r) - prefixSum(l-1)',
        '1-indexed: position 0 is unused; this simplifies the bit trick',
        'Range update + point query: use difference array interpretation',
        'Range update + range query: use two BITs',
        '2D Fenwick tree: nested BIT for 2D prefix sums with updates — O(log n * log m)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Fenwick Tree Implementation',
          code: `class FenwickTree {
  private bit: number[];
  private n: number;

  constructor(n: number) {
    this.n = n;
    this.bit = new Array(n + 1).fill(0);
  }

  // Build from array in O(n)
  static fromArray(arr: readonly number[]): FenwickTree {
    const ft = new FenwickTree(arr.length);
    for (let i = 0; i < arr.length; i++) {
      ft.bit[i + 1] = arr[i];
    }
    for (let i = 1; i <= ft.n; i++) {
      const parent = i + (i & -i);
      if (parent <= ft.n) {
        ft.bit[parent] += ft.bit[i];
      }
    }
    return ft;
  }

  // Add delta to position i (1-indexed)
  update(i: number, delta: number): void {
    for (; i <= this.n; i += i & -i) {
      this.bit[i] += delta;
    }
  }

  // Prefix sum [1, i]
  prefixSum(i: number): number {
    let sum = 0;
    for (; i > 0; i -= i & -i) {
      sum += this.bit[i];
    }
    return sum;
  }

  // Range sum [l, r] (1-indexed)
  rangeSum(l: number, r: number): number {
    return this.prefixSum(r) - this.prefixSum(l - 1);
  }

  // Find smallest i such that prefixSum(i) >= target — O(log n)
  // Works only for non-negative values
  lowerBound(target: number): number {
    let pos = 0;
    let sum = 0;
    for (let pw = 1 << Math.floor(Math.log2(this.n)); pw > 0; pw >>= 1) {
      if (pos + pw <= this.n && sum + this.bit[pos + pw] < target) {
        pos += pw;
        sum += this.bit[pos];
      }
    }
    return pos + 1;
  }
}`,
        },
      ],
      useCases: [
        'Prefix sum queries with point updates (simpler than segment tree)',
        'Counting inversions in an array (BIT as rank structure)',
        '2D prefix sum with updates (nested BIT)',
        'Order statistics: kth smallest element with updates',
      ],
      commonPitfalls: [
        'Using 0-indexed: BIT MUST be 1-indexed — i & (-i) gives 0 for i=0, causing infinite loop',
        'Forgetting to convert from 0-indexed input to 1-indexed BIT positions',
        'Range update: a single BIT gives point query only; need two BITs for range query after range update',
        'The build from array is O(n) using the cascade method, NOT O(n log n) via n update() calls',
      ],
      interviewTips: [
        'BIT is simpler to code than segment tree — if the problem only needs prefix sum + point update, use BIT',
        'Counting inversions: for each element, count how many previously seen elements are greater — BIT makes this O(n log n)',
        'Know the bit trick: i & (-i) extracts lowest set bit — draw the binary representations to explain',
      ],
      relatedConcepts: ['segment-tree', 'prefix-sum', 'sparse-table'],
      difficulty: 'advanced',
      tags: ['fenwick-tree', 'bit', 'prefix-sum', 'point-update'],
      proTip:
        'Fenwick tree\'s lowerBound (finding smallest index with prefix sum >= target) runs in O(log n) by walking down the implicit binary tree. This enables O(log n) order statistics: "find the kth smallest element" with dynamic insertions — the same operation that requires an augmented BST or segment tree.',
    },
    {
      id: 'splay-tree',
      title: 'Splay Tree',
      description:
        'A self-balancing BST that moves every accessed node to the root via a sequence of rotations called splaying. No balance information is stored — the tree self-organizes based on access patterns. Amortized O(log n) per operation, and frequently accessed elements migrate to the root, giving O(1) access in practice for skewed access patterns (working set property).',
      timeComplexity: {
        best: 'O(1) — recently accessed element',
        average: 'O(log n) amortized',
        worst: 'O(n) per single operation (but amortized O(log n) over sequence)',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Splay operation: move accessed node to root using zig (single rotation), zig-zig (two same-direction), zig-zag (two opposite-direction)',
        'Zig-zig is the key insight: unlike naive "rotate to root", zig-zig rotates grandparent first, then parent — this balances the tree',
        'Working set property: accessing element costs O(log w) where w = number of distinct elements accessed since last access of this element',
        'Sequential access property: accessing n elements in sorted order takes O(n) total',
        'No per-node balance metadata (unlike AVL height, RB color) — simpler node structure',
        'Split and merge are natural: splay the split key, detach subtrees — enables efficient range operations',
        'Used in caches and garbage collectors where recent access patterns predict future access',
        'A single operation can take O(n) — amortized O(log n) only holds over a SEQUENCE of operations',
      ],
      useCases: [
        'Cache-like access patterns where recently used items are accessed again soon',
        'Network routing tables (accessing popular routes frequently)',
        'Garbage collectors with generational assumptions',
        'When access pattern locality is exploitable and you want self-tuning behavior',
      ],
      commonPitfalls: [
        'Using rotate-to-root instead of proper splay: naive rotation does not give amortized O(log n)',
        'Assuming O(log n) worst-case: splay trees only guarantee amortized bounds, not per-operation',
        'Not splaying on find (only splay on insert): the self-balancing relies on splaying every access',
        'Thread safety: splaying on read mutates the tree — needs locking even for reads',
      ],
      interviewTips: [
        'Know the three splay cases (zig, zig-zig, zig-zag) and why zig-zig rotates grandparent first',
        'The amortized analysis uses a potential function based on subtree sizes — hard to prove but know the result',
        'Practical comparison: splay is simpler than AVL/RB but modifies tree on every read',
      ],
      relatedConcepts: ['bst', 'avl-tree', 'red-black-tree', 'treap'],
      difficulty: 'expert',
      tags: ['splay-tree', 'self-adjusting', 'amortized', 'cache'],
      proTip:
        'Splay trees are the only BST variant with the dynamic optimality conjecture — they may be within a constant factor of the optimal BST for ANY access sequence. This is unproven but widely believed, and no other BST has this property.',
    },
    {
      id: 'treap',
      title: 'Treap',
      description:
        'A randomized BST that combines tree + heap properties: BST ordering on keys and heap ordering on random priorities. Each node is assigned a random priority at insertion; the tree maintains BST order by key and max-heap order by priority. This gives expected O(log n) height with high probability, without rotations — instead using split/merge operations that are simpler than AVL/RB rotations.',
      timeComplexity: {
        best: 'O(log n) expected',
        average: 'O(log n) expected',
        worst: 'O(n) — astronomically unlikely with random priorities',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Each node: (key, priority, left, right) where priority is random',
        'BST property on keys: left.key < node.key < right.key',
        'Heap property on priorities: node.priority > children.priority (max-heap)',
        'Expected height: O(log n) — same as random BST (random priorities simulate random insertion order)',
        'Split(key): divide treap into two treaps — one with all keys < key, one with all keys >= key',
        'Merge(left, right): combine two treaps where all keys in left < all keys in right',
        'Insert = split at key + create single node + merge three parts',
        'Delete = split at key + merge left and right parts',
        'Implicit treap: use array indices as implicit keys — enables O(log n) array operations (insert, delete, reverse)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Treap with Split/Merge',
          code: `class TreapNode {
  constructor(
    public key: number,
    public priority: number = Math.random(),
    public left: TreapNode | null = null,
    public right: TreapNode | null = null,
    public size: number = 1,
  ) {}
}

function getSize(node: TreapNode | null): number {
  return node === null ? 0 : node.size;
}

function updateSize(node: TreapNode | null): void {
  if (node !== null) {
    node.size = 1 + getSize(node.left) + getSize(node.right);
  }
}

// Split treap into (< key) and (>= key)
function split(
  node: TreapNode | null,
  key: number,
): [TreapNode | null, TreapNode | null] {
  if (node === null) return [null, null];
  if (key <= node.key) {
    const [left, right] = split(node.left, key);
    node.left = right;
    updateSize(node);
    return [left, node];
  }
  const [left, right] = split(node.right, key);
  node.right = left;
  updateSize(node);
  return [node, right];
}

// Merge two treaps (all keys in left < all keys in right)
function merge(
  left: TreapNode | null,
  right: TreapNode | null,
): TreapNode | null {
  if (left === null) return right;
  if (right === null) return left;
  if (left.priority > right.priority) {
    left.right = merge(left.right, right);
    updateSize(left);
    return left;
  }
  right.left = merge(left, right.left);
  updateSize(right);
  return right;
}

function insert(root: TreapNode | null, key: number): TreapNode {
  const [left, right] = split(root, key);
  const node = new TreapNode(key);
  return merge(merge(left, node), right)!;
}

function remove(root: TreapNode | null, key: number): TreapNode | null {
  const [left, midRight] = split(root, key);
  const [mid, right] = split(midRight, key + 1);
  // mid contains the node with key (if it exists) — discard it
  return merge(left, right);
}`,
        },
      ],
      useCases: [
        'Competitive programming: simpler to implement than AVL/RB for balanced BST',
        'Implicit treap: array with O(log n) insert/delete/reverse at arbitrary positions',
        'Randomized balancing without rotations or recoloring',
        'When you need split/merge operations (interval problems, order statistics)',
      ],
      commonPitfalls: [
        'Split/merge must maintain both BST and heap properties simultaneously',
        'Forgetting to update subtree sizes after split/merge — breaks order statistics queries',
        'Using non-random priorities defeats the purpose — must be truly random',
        'The remove operation splits at key and key+1 — subtle for non-integer keys',
      ],
      interviewTips: [
        'Treap is rarely asked in standard interviews but common in competitive programming',
        'The implicit treap is powerful: it gives you a "rope" — an array with O(log n) splice/reverse',
        'Know the connection: treap with random priorities has the same structure distribution as a random BST',
      ],
      relatedConcepts: ['bst', 'binary-heap', 'skip-list', 'rope'],
      difficulty: 'expert',
      tags: ['treap', 'randomized', 'split-merge', 'balanced-tree'],
      proTip:
        'The implicit treap is one of the most versatile competitive programming tools. By treating array indices as implicit keys (computed from subtree sizes), you get O(log n) operations for: insert/delete at any position, reverse a subarray, apply lazy operations to ranges — essentially a segment tree that also supports structural modifications.',
    },
    {
      id: 'kd-tree',
      title: 'KD-Tree',
      description:
        'A binary tree that partitions k-dimensional space by alternating the splitting dimension at each level. At depth d, the tree splits on dimension (d % k). This creates a spatial hierarchy enabling efficient nearest-neighbor search, range queries, and spatial joins. Construction is O(n log n) and nearest-neighbor is O(log n) expected, but O(n) worst case for adversarial distributions.',
      timeComplexity: {
        best: 'O(log n) per query',
        average: 'O(log n) expected for nearest neighbor',
        worst: 'O(n) for adversarial point distributions',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Build: choose median along splitting dimension, recurse on left/right halves — O(n log n)',
        'Split dimension cycles: depth 0 splits on x, depth 1 on y, depth 2 on z, etc.',
        'Nearest neighbor: traverse tree, prune branches where closest point in region is farther than current best',
        'Pruning relies on computing distance to the splitting hyperplane — if closer, explore other branch too',
        'Range search: find all points within a bounding box — O(n^(1-1/k) + output)',
        'Works well for low dimensions (k < 20); degrades to linear scan for high dimensions (curse of dimensionality)',
        'For high dimensions: use approximate methods (LSH, random projections) instead',
        'Not efficient for dynamic insertions — rebalancing is expensive; use R-tree for dynamic spatial data',
      ],
      useCases: [
        'Nearest neighbor search in 2D/3D (computational geometry, game physics)',
        'K-nearest neighbors (KNN) in machine learning for small k and low dimensions',
        'Ray tracing and collision detection in 3D graphics',
        'Geographic information systems (finding nearest restaurant, hospital)',
      ],
      commonPitfalls: [
        'High dimensions (k > 20): KD-tree degenerates — use approximate nearest neighbor instead',
        'Not choosing median for split: unbalanced splits create deep trees',
        'Nearest neighbor: must check other branch if distance to splitting plane < current best distance',
        'Dynamic insertions without rebalancing: tree becomes unbalanced, losing O(log n) guarantees',
      ],
      interviewTips: [
        'KD-tree is a common topic in ML interviews for KNN implementation',
        'Explain the pruning in nearest neighbor: "if the splitting plane is farther than my best candidate, skip that subtree"',
        'Know the curse of dimensionality: in high dimensions, distances become uniform, making spatial partitioning useless',
      ],
      relatedConcepts: ['bst', 'binary-tree', 'b-tree'],
      difficulty: 'advanced',
      tags: ['kd-tree', 'spatial', 'nearest-neighbor', 'multidimensional'],
      proTip:
        'The curse of dimensionality is quantifiable: in d dimensions, the ratio of the volume of a hypersphere to the volume of its bounding hypercube approaches 0 as d increases. This means that in high dimensions, almost all points are "near the boundary" and equidistant from each other, making spatial partitioning useless. That is why KD-trees fail above ~20 dimensions.',
    },
    {
      id: 'trie-tree',
      title: 'Trie (Prefix Tree)',
      description:
        'A tree where each path from root to a marked node represents a string. Each edge corresponds to a character, and common prefixes share the same path. Insert and search are O(L) where L is the string length — independent of the number of strings stored. Tries are the backbone of autocomplete, spell checkers, and IP routing tables.',
      timeComplexity: {
        best: 'O(L) — L is string length',
        average: 'O(L)',
        worst: 'O(L)',
      },
      spaceComplexity: 'O(ALPHABET_SIZE * L * N) — can be large for sparse tries',
      keyPoints: [
        'Each node has up to ALPHABET_SIZE children (26 for lowercase English, 128 for ASCII)',
        'Insert: traverse/create nodes for each character, mark last node as end-of-word',
        'Search: traverse nodes for each character, check end-of-word mark at last node',
        'Prefix search: same as search but do not require end-of-word — just check if path exists',
        'Space optimization: use HashMap<char, TrieNode> instead of array[26] for sparse alphabets',
        'Compressed trie (radix tree): merge single-child chains into single edge with multi-char label',
        'Time complexity independent of number of stored strings — only depends on query string length',
        'Delete is tricky: must not delete nodes that are prefixes of other words',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Trie Implementation',
          code: `class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd = false;
}

class Trie {
  private root = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    const node = this.findNode(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix: string): boolean {
    return this.findNode(prefix) !== null;
  }

  // Find all words with given prefix
  autocomplete(prefix: string, limit = 10): string[] {
    const node = this.findNode(prefix);
    if (node === null) return [];
    const results: string[] = [];
    this.dfs(node, prefix, results, limit);
    return results;
  }

  private findNode(prefix: string): TrieNode | null {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch)!;
    }
    return node;
  }

  private dfs(node: TrieNode, path: string, results: string[], limit: number): void {
    if (results.length >= limit) return;
    if (node.isEnd) results.push(path);
    for (const [ch, child] of node.children) {
      this.dfs(child, path + ch, results, limit);
    }
  }
}`,
        },
      ],
      useCases: [
        'Autocomplete and typeahead suggestions',
        'Spell checker (find words within edit distance)',
        'IP routing table (longest prefix match)',
        'Word games (Boggle, Scrabble — check if prefix leads to valid word)',
      ],
      commonPitfalls: [
        'Memory: array[26] per node wastes space for sparse tries — use Map for large alphabets',
        'Delete: removing a word must not corrupt other words that share the prefix',
        'Forgetting isEnd check in search: prefix existing does not mean the word exists',
        'String concatenation in autocomplete DFS: use character array and backtrack instead for O(L) per word',
      ],
      interviewTips: [
        'Trie + DFS = autocomplete — this is one of the most common system design sub-problems',
        'If asked "implement a dictionary", trie is often the expected answer',
        'Know the space tradeoff: trie uses more memory than hashset but supports prefix queries',
      ],
      relatedConcepts: ['standard-trie', 'compressed-trie', 'suffix-trie'],
      difficulty: 'intermediate',
      tags: ['trie', 'prefix-tree', 'string', 'autocomplete'],
      proTip:
        'For interview autocomplete design: use a trie for prefix matching, but rank results by frequency. Store a frequency count at each end-of-word node, and during DFS collect into a min-heap of size k. This gives top-k results in O(prefix_length + n_matches * log k).',
    },
    {
      id: 'huffman-tree',
      title: 'Huffman Tree',
      description:
        'A binary tree constructed from character frequencies that produces an optimal prefix-free code — no codeword is a prefix of another, enabling unambiguous decoding. Characters with higher frequency get shorter codes. The construction uses a greedy algorithm with a min-heap: repeatedly merge the two lowest-frequency nodes. The resulting code achieves entropy-optimal compression for known character frequencies.',
      timeComplexity: {
        best: 'O(n log n) construction',
        average: 'O(n log n)',
        worst: 'O(n log n)',
      },
      spaceComplexity: 'O(n) for the tree, O(L) for encoded output',
      keyPoints: [
        'Prefix-free code: no codeword is a prefix of another — left edge = 0, right edge = 1',
        'Greedy construction: always merge two smallest frequency nodes — provably optimal',
        'More frequent characters get shorter codes, less frequent get longer — like Morse code',
        'Expected code length approaches Shannon entropy: H = -sum(p_i * log2(p_i))',
        'Requires frequency table to be sent with compressed data (overhead for small files)',
        'Used in DEFLATE (zip, gzip, PNG), JPEG, MP3 as part of the compression pipeline',
        'Adaptive Huffman: builds tree dynamically as data streams, no need to pre-scan frequencies',
        'Canonical Huffman: assigns codes based on code lengths only — simpler to transmit and decode',
      ],
      useCases: [
        'File compression (part of DEFLATE algorithm in zip/gzip)',
        'Image compression (JPEG uses Huffman after DCT and quantization)',
        'Network protocol compression',
        'Educational: understanding information theory and entropy',
      ],
      commonPitfalls: [
        'Huffman is optimal only for integer-bit codes — arithmetic coding can achieve fractional bits per symbol',
        'Overhead of transmitting the codebook: for small files, the codebook may be larger than the savings',
        'Assuming Huffman alone is sufficient: real compressors combine LZ77/LZ78 with Huffman',
        'Not using canonical Huffman: standard Huffman codes are not unique, complicating decoder implementation',
      ],
      interviewTips: [
        'Know the greedy construction: min-heap, merge two smallest, repeat — O(n log n)',
        'Explain why it is optimal: proof by exchange argument — swapping codes of unequal frequency nodes increases cost',
        'Connection to entropy: Huffman code length ≈ Shannon entropy when symbol probabilities are powers of 1/2',
      ],
      relatedConcepts: ['binary-heap', 'binary-tree', 'standard-trie'],
      difficulty: 'intermediate',
      tags: ['huffman', 'compression', 'greedy', 'prefix-code', 'entropy'],
      proTip:
        'Huffman coding achieves exactly Shannon entropy when all symbol probabilities are powers of 2 (1/2, 1/4, 1/8...). For non-power-of-2 probabilities, it wastes up to 1 bit per symbol compared to the theoretical optimum. Arithmetic coding eliminates this waste by encoding the entire message as a single fraction — which is why modern compressors (zstd, brotli) prefer ANS/arithmetic coding over Huffman.',
    },
    {
      id: 'tree-dp',
      title: 'Tree DP',
      description:
        'Dynamic programming on tree structures where the DP state for a node depends on its subtree. The general pattern is: solve for each subtree bottom-up (post-order), combine children results at the parent. Re-rooting technique extends this to compute the answer for every possible root in O(n) total by leveraging the relationship between parent and child answers.',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n) for standard tree DP, O(n * k) for some variants',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Base pattern: dp[node] = f(dp[child1], dp[child2], ..., node.val) — compute bottom-up via DFS',
        'Post-order traversal: process all children before the node itself',
        'Diameter: dp[v] = longest path through v = depth(leftChild) + depth(rightChild); global answer = max over all v',
        'Max path sum: dp[v] = max(v.val, v.val + max(dp[left], dp[right])); track global max including both sides',
        'Re-rooting: first DFS computes dp[root], second DFS pushes answer from parent to child',
        'Re-rooting enables: "what if every node were the root?" — used for sum of distances, tree centroid',
        'Subtree problems: count nodes, sum values, check properties — all solved by bottom-up tree DP',
        'State transitions: at each node, either take or skip (knapsack on tree), or choose best child (greedy on tree)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Tree Diameter & Re-rooting',
          code: `// Tree Diameter — longest path between any two nodes
function treeDiameter(adj: readonly number[][]): number {
  let diameter = 0;

  function dfs(node: number, parent: number): number {
    let maxDepth1 = 0; // deepest branch
    let maxDepth2 = 0; // second deepest branch

    for (const neighbor of adj[node]) {
      if (neighbor === parent) continue;
      const childDepth = dfs(neighbor, node) + 1;
      if (childDepth > maxDepth1) {
        maxDepth2 = maxDepth1;
        maxDepth1 = childDepth;
      } else if (childDepth > maxDepth2) {
        maxDepth2 = childDepth;
      }
    }
    diameter = Math.max(diameter, maxDepth1 + maxDepth2);
    return maxDepth1;
  }

  dfs(0, -1);
  return diameter;
}

// Sum of Distances in Tree (LeetCode 834) — re-rooting technique
function sumOfDistancesInTree(n: number, edges: readonly number[][]): number[] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const count = new Array(n).fill(1); // subtree size
  const result = new Array(n).fill(0);

  // DFS 1: compute subtree sizes and result[0]
  function dfs1(node: number, parent: number): void {
    for (const child of adj[node]) {
      if (child === parent) continue;
      dfs1(child, node);
      count[node] += count[child];
      result[0] += count[child]; // each child subtree node contributes 1 more edge
    }
  }

  // DFS 2: re-root from parent to child
  function dfs2(node: number, parent: number): void {
    for (const child of adj[node]) {
      if (child === parent) continue;
      // Moving root from node to child:
      // child's subtree gets 1 closer (count[child] nodes)
      // rest of tree gets 1 farther (n - count[child] nodes)
      result[child] = result[node] - count[child] + (n - count[child]);
      dfs2(child, node);
    }
  }

  dfs1(0, -1);
  dfs2(0, -1);
  return result;
}`,
        },
      ],
      useCases: [
        'Tree diameter, center, and centroid finding',
        'Maximum/minimum path sum in tree',
        'Sum of distances from every node to all other nodes',
        'Independent set on tree (max weight set with no adjacent nodes)',
      ],
      commonPitfalls: [
        'Processing parent as child in DFS: always pass parent parameter and skip it',
        'Tree diameter: forgetting to track both top-2 depths at each node — need two deepest branches',
        'Re-rooting: the formula result[child] = result[parent] +/- adjustment must account for ALL nodes, not just subtree',
        'Max path sum: global maximum might not pass through root — must track global max separately from return value',
      ],
      interviewTips: [
        'Tree diameter is a classic: DFS computing depth, tracking max(depth1 + depth2) across all nodes',
        'Re-rooting is advanced: if asked "compute X for every node as root", explain the two-DFS approach',
        'Max path sum (LeetCode 124) is one of the most common hard tree problems — practice it',
      ],
      relatedConcepts: ['binary-tree', 'bst', 'dynamic-programming'],
      difficulty: 'advanced',
      tags: ['tree-dp', 'dynamic-programming', 'rerooting', 'diameter'],
      proTip:
        'The re-rooting technique is one of the most powerful tree DP patterns. The key insight: when you move the root from parent to child, count[child] nodes get 1 unit closer and (n - count[child]) nodes get 1 unit farther. This lets you compute the answer for all n roots in O(n) instead of O(n^2).',
    },
  ],
}
