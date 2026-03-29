// @ts-nocheck
import type { Category } from '@/lib/types'

export const disjointSetCategory: Category = {
  id: 'disjoint-set',
  title: 'Disjoint Set (Union-Find)',
  description: 'The near-O(1) data structure for dynamic connectivity — from basic union-find to weighted variants and rollback-capable versions. The backbone of Kruskal\'s MST, dynamic graph connectivity, and offline LCA.',
  icon: '🔀',
  concepts: [
    {
      id: 'union-find-basics',
      title: 'Union-Find Basics',
      description:
        'A data structure that maintains a collection of disjoint sets with near-constant-time union and find operations. Find determines which set an element belongs to (returns the root representative). Union merges two sets. With both path compression and union by rank, the amortized cost per operation is O(alpha(n)) — the inverse Ackermann function, which is effectively O(1) for all practical input sizes (alpha(n) <= 5 for n < 2^65536).',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(alpha(n)) amortized ≈ O(1)',
        worst: 'O(log n) per find without path compression',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Each element has a parent pointer; roots are their own parent (parent[x] = x)',
        'Find(x): follow parent pointers to root — the root is the set representative',
        'Union(x, y): find roots of x and y, make one root point to the other',
        'Path compression: during find, make every visited node point directly to root — flattens the tree',
        'Union by rank: always attach the shorter tree under the taller tree — keeps height low',
        'Union by size: alternative to rank — track subtree sizes, attach smaller to larger',
        'With both optimizations: amortized O(alpha(n)) per operation — inverse Ackermann function',
        'alpha(n) <= 5 for n < 2^65536 — effectively O(1) for any practical input',
        'Cannot efficiently split sets (undo unions) without rollback variant',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Union-Find with Path Compression and Union by Rank',
          code: `class UnionFind {
  private parent: number[];
  private rank: number[];
  private _components: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this._components = n;
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false; // already in same set

    // Union by rank
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    this._components--;
    return true;
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  get components(): number {
    return this._components;
  }
}`,
        },
      ],
      useCases: [
        'Kruskal\'s MST: sort edges by weight, union vertices, skip if already connected',
        'Dynamic connectivity: "are nodes A and B connected?" as edges are added',
        'Number of connected components in undirected graph',
        'Image processing: connected component labeling',
      ],
      commonPitfalls: [
        'Not implementing path compression: find becomes O(n) worst case (linked list tree)',
        'Not implementing union by rank/size: tree can degenerate to linear chain',
        'Forgetting that rank is an upper bound on height, NOT the actual height (path compression changes actual height)',
        'Using union-find for directed graphs: union-find assumes undirected connectivity',
      ],
      interviewTips: [
        'Union-Find is one of the most frequently asked data structures — know it cold',
        'Always implement with BOTH path compression AND union by rank',
        'If asked "how to detect cycle while adding edges", union-find: if find(u) == find(v), adding edge creates cycle',
      ],
      relatedConcepts: ['path-compression-variants', 'union-by-rank-vs-size', 'weighted-uf', 'dsu-applications'],
      difficulty: 'intermediate',
      tags: ['union-find', 'disjoint-set', 'connectivity', 'path-compression'],
      proTip:
        'The inverse Ackermann function alpha(n) grows so slowly that it is essentially constant: alpha(1) = 0, alpha(2) = 1, alpha(4) = 2, alpha(16) = 3, alpha(65536) = 4, alpha(2^65536) = 5. You will never encounter an input where alpha(n) > 5. For all practical purposes, union-find is O(1) per operation.',
    },
    {
      id: 'path-compression-variants',
      title: 'Path Compression Variants',
      description:
        'Three strategies for flattening the tree during find: full path compression (all nodes point to root), path splitting (each node points to its grandparent), and path halving (every other node points to its grandparent). All three achieve the same amortized O(alpha(n)) bound, but they differ in implementation simplicity and constant factors.',
      timeComplexity: {
        best: 'O(1) — when parent is already root',
        average: 'O(alpha(n)) amortized for all variants',
        worst: 'O(log n) single-pass, amortized O(alpha(n)) over sequence',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Full compression: two passes — first find root, then make all nodes on path point to root',
        'Recursive full compression: parent[x] = find(parent[x]) — single line, elegant, but uses stack space',
        'Path splitting: single pass — each node points to its grandparent: parent[x] = parent[parent[x]]',
        'Path halving: single pass — every other node points to its grandparent',
        'All three achieve amortized O(alpha(n)) with union by rank',
        'Path splitting/halving are iterative (no recursion) — better for very deep trees (no stack overflow)',
        'Full compression does more work per find but flattens the tree more aggressively',
        'In practice, the performance difference between the three is negligible — choose the simplest',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Three Path Compression Variants',
          code: `// Full path compression (recursive)
function findFull(parent: number[], x: number): number {
  if (parent[x] !== x) {
    parent[x] = findFull(parent, parent[x]);
  }
  return parent[x];
}

// Path splitting (iterative)
function findSplitting(parent: number[], x: number): number {
  while (parent[x] !== x) {
    const next = parent[x];
    parent[x] = parent[next]; // point to grandparent
    x = next;
  }
  return x;
}

// Path halving (iterative)
function findHalving(parent: number[], x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]]; // point to grandparent
    x = parent[x];
  }
  return x;
}`,
        },
      ],
      useCases: [
        'Path splitting/halving: when recursion depth is a concern (very large trees)',
        'Full compression: when reads are much more frequent than unions (maximizes tree flatness)',
        'Any variant works for standard union-find — the choice is mostly stylistic',
      ],
      commonPitfalls: [
        'Recursive full compression can stack overflow for very deep trees (pre-compression) — use iterative variant',
        'Path splitting mutates parent[x] during traversal — be careful not to read stale values in concurrent settings',
        'All variants invalidate the "rank" as actual height — rank becomes an upper bound only',
      ],
      interviewTips: [
        'Full recursive compression is the most common in interviews — it is one line: parent[x] = find(parent[x])',
        'If asked about stack overflow concerns, mention path halving as an iterative alternative',
        'The amortized bound is the same for all three — do not over-optimize',
      ],
      relatedConcepts: ['union-find-basics', 'union-by-rank-vs-size', 'rollback-dsu'],
      difficulty: 'intermediate',
      tags: ['path-compression', 'path-splitting', 'path-halving', 'union-find'],
      proTip:
        'In competitive programming, the one-liner recursive path compression (parent[x] = find(parent[x])) is universally used because it is fast to type and correct. In production code, the iterative path halving variant is preferred because it avoids stack overflow and has no recursion overhead. Both give the same O(alpha(n)) amortized complexity.',
    },
    {
      id: 'union-by-rank-vs-size',
      title: 'Union by Rank vs Union by Size',
      description:
        'Two strategies for choosing which tree becomes the subtree during union. Union by rank attaches the shorter tree (by rank, an upper bound on height) under the taller one. Union by size attaches the tree with fewer elements under the larger one. Both achieve O(log n) worst-case height and O(alpha(n)) amortized with path compression. Size is slightly simpler (no rank bookkeeping) and provides the actual component size, which is often useful.',
      timeComplexity: {
        average: 'O(alpha(n)) amortized for both',
        worst: 'O(log n) per find without path compression',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Union by rank: track rank[root]; attach lower-rank root under higher-rank; increment rank on tie',
        'Rank is an upper bound on height: path compression may reduce actual height below rank',
        'Union by size: track size[root]; attach smaller tree under larger tree; add sizes on union',
        'Size provides useful information: "how many elements in this component?" — rank does not',
        'Both guarantee tree height O(log n) without path compression',
        'With path compression, both give amortized O(alpha(n))',
        'In practice: union by size is slightly simpler and provides component size for free',
        'Weighted quick-union: another name for union by size/rank without path compression',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Union by Size with Component Size Tracking',
          code: `class UnionFindBySize {
  private parent: number[];
  private size: number[];
  private _components: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this._components = n;
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    // Attach smaller tree under larger
    if (this.size[rootX] < this.size[rootY]) {
      this.parent[rootX] = rootY;
      this.size[rootY] += this.size[rootX];
    } else {
      this.parent[rootY] = rootX;
      this.size[rootX] += this.size[rootY];
    }
    this._components--;
    return true;
  }

  getSize(x: number): number {
    return this.size[this.find(x)];
  }

  get components(): number {
    return this._components;
  }
}`,
        },
      ],
      useCases: [
        'When component size is needed: "how large is the connected component containing x?"',
        'Kruskal\'s MST: both rank and size work equally well',
        'Social network: "how many people are in this group?" — union by size provides this for free',
      ],
      commonPitfalls: [
        'Updating size of wrong root: must update the NEW root\'s size, not the old one',
        'Using rank as actual height after path compression: rank is an upper bound only',
        'Forgetting to check if roots are same before union: would double the size incorrectly',
      ],
      interviewTips: [
        'Union by size is slightly easier to implement and provides component size — use it by default',
        'Both give the same asymptotic complexity — do not overthink the choice',
        'If asked "how to find the largest connected component", union by size tracks this naturally',
      ],
      relatedConcepts: ['union-find-basics', 'path-compression-variants', 'weighted-uf'],
      difficulty: 'intermediate',
      tags: ['union-by-rank', 'union-by-size', 'disjoint-set'],
      proTip:
        'A useful technique: maintain a reference to the maximum component size. After each union, update the max: max = Math.max(max, size[newRoot]). This gives O(1) "largest connected component" queries without scanning all components.',
    },
    {
      id: 'weighted-uf',
      title: 'Weighted Union-Find',
      description:
        'An extension of union-find that tracks additional state per component (or relative relationships between elements). Beyond component size, you can track: sum of elements, minimum/maximum, or relative weights between connected elements. The classic application is "potentials" — maintaining the weight relationship a[x] - a[root(x)] = potential[x], enabling queries like "what is a[x] - a[y]?" when x and y are in the same component.',
      timeComplexity: {
        average: 'O(alpha(n)) amortized per operation',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Each component tracks aggregate state: sum, min, max, count, or arbitrary monoid',
        'On union: merge aggregate states — sum adds, min takes minimum, etc.',
        'Potential/weight DSU: weight[x] = a[x] - a[parent[x]], tracking relative differences',
        'Query: a[x] - a[y] = weight_to_root(x) - weight_to_root(y) when x and y are in same set',
        'Path compression must update weights: when flattening, accumulate weight from node to new root',
        'Union with weight: if we know a[x] - a[y] = w, then weight[root(y)] = weight_to_root(x) - weight_to_root(y) + w',
        'Applications: puzzle constraints ("x is 3 more than y"), physics (potential energy differences)',
        'Related to offline algorithms where relative relationships are established incrementally',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Weighted Union-Find (Potential DSU)',
          code: `class WeightedUnionFind {
  private parent: number[];
  private rank: number[];
  private weight: number[]; // weight[x] = potential(x) - potential(parent[x])

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.weight = new Array(n).fill(0);
  }

  // Returns [root, weightToRoot] where weightToRoot = potential(x) - potential(root)
  find(x: number): [number, number] {
    if (this.parent[x] === x) return [x, 0];
    const [root, parentWeight] = this.find(this.parent[x]);
    this.weight[x] += parentWeight; // accumulate weight through path
    this.parent[x] = root; // path compression
    return [root, this.weight[x]];
  }

  // Union with constraint: potential(x) - potential(y) = w
  union(x: number, y: number, w: number): boolean {
    const [rootX, wx] = this.find(x); // wx = potential(x) - potential(rootX)
    const [rootY, wy] = this.find(y); // wy = potential(y) - potential(rootY)
    if (rootX === rootY) {
      // Check consistency: potential(x) - potential(y) should equal w
      return wx - wy === w;
    }

    // weight[rootY] = potential(rootY) - potential(rootX)
    // potential(x) - potential(y) = w
    // wx - wy + potential(rootX) - potential(rootY) is involved...
    // Simplify: weight of rootY relative to rootX
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
      this.weight[rootX] = wy - wx + w; // negate direction
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
      this.weight[rootY] = wx - wy - w;
    } else {
      this.parent[rootY] = rootX;
      this.weight[rootY] = wx - wy - w;
      this.rank[rootX]++;
    }
    return true;
  }

  // Query: potential(x) - potential(y), returns null if different sets
  diff(x: number, y: number): number | null {
    const [rootX, wx] = this.find(x);
    const [rootY, wy] = this.find(y);
    if (rootX !== rootY) return null;
    return wx - wy;
  }
}`,
        },
      ],
      useCases: [
        'Constraint satisfaction: "x is 3 more than y" — check consistency and query differences',
        'Currency exchange: track exchange rates between currencies connected by known rates',
        'Physics: potential energy relationships between connected points',
        'Puzzle solving: Kakuro, Numberlink with additive constraints',
      ],
      commonPitfalls: [
        'Path compression must accumulate weights — forgetting this gives wrong answers',
        'Weight direction: weight[x] = potential(x) - potential(parent(x)) vs the inverse — be consistent',
        'Union weight calculation: must account for both nodes\' weights to their roots',
        'Floating point: use integer weights where possible to avoid precision issues',
      ],
      interviewTips: [
        'Weighted UF appears in "evaluate division" (LeetCode 399) — currency exchange rate graph',
        'The key insight: union-find tracks connectivity, weighted UF also tracks relative values',
        'If asked about constraint propagation with equality constraints, think weighted UF',
      ],
      relatedConcepts: ['union-find-basics', 'union-by-rank-vs-size', 'dsu-applications'],
      difficulty: 'advanced',
      tags: ['weighted-union-find', 'potential', 'constraints', 'relative-weight'],
      proTip:
        'LeetCode 399 "Evaluate Division" is the canonical weighted union-find problem: given equations a/b = k, find a/c. Model as weighted UF where weight[x] = value(x) / value(root(x)). Query a/c = weight_to_root(a) / weight_to_root(c). This elegantly handles transitive relationships that BFS/DFS would need to recompute.',
    },
    {
      id: 'dsu-applications',
      title: 'DSU Applications',
      description:
        'Union-Find is a building block for many algorithms: Kruskal\'s MST (sort edges, union endpoints), cycle detection (if endpoints already connected, edge creates cycle), dynamic connectivity (online edge additions with connectivity queries), offline LCA (process queries in DFS order), and "number of islands" (union adjacent land cells). Recognizing when a problem reduces to connectivity queries is the key skill.',
      timeComplexity: {
        average: 'O(E * alpha(V)) for Kruskal, O(alpha(n)) per query for connectivity',
      },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'Kruskal\'s MST: sort edges by weight O(E log E), iterate and union O(E * alpha(V)) — total O(E log E)',
        'Cycle detection: before adding edge (u,v), check if find(u) == find(v) — if yes, cycle exists',
        'Number of islands: for each land cell, union with adjacent land cells — components = islands',
        'Dynamic connectivity (online): process edge additions and connectivity queries in real-time',
        'Offline LCA: Tarjan\'s offline algorithm processes queries during DFS using union-find',
        'Account merge: union accounts sharing an email, then group all emails by component',
        'Redundant connection: find the edge that creates a cycle in an undirected graph — first edge where find(u) == find(v)',
        'Making a connected graph: minimum edges to add = number of components - 1',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Kruskal MST & Number of Islands',
          code: `// Kruskal's MST
interface Edge { u: number; v: number; weight: number }

function kruskalMST(n: number, edges: Edge[]): { cost: number; mstEdges: Edge[] } {
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);
  const uf = new UnionFindBySize(n);
  const mstEdges: Edge[] = [];
  let cost = 0;

  for (const edge of sorted) {
    if (uf.union(edge.u, edge.v)) {
      mstEdges.push(edge);
      cost += edge.weight;
      if (mstEdges.length === n - 1) break;
    }
  }

  return { cost, mstEdges };
}

// Number of Islands using Union-Find
function numIslands(grid: readonly string[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const uf = new UnionFindBySize(rows * cols);
  let waterCount = 0;

  const idx = (r: number, c: number) => r * cols + c;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '0') {
        waterCount++;
        continue;
      }
      // Union with right and down neighbors (avoid double-counting)
      if (c + 1 < cols && grid[r][c + 1] === '1') {
        uf.union(idx(r, c), idx(r, c + 1));
      }
      if (r + 1 < rows && grid[r + 1][c] === '1') {
        uf.union(idx(r, c), idx(r + 1, c));
      }
    }
  }

  return uf.components - waterCount;
}

// Class for reference (from earlier concept)
class UnionFindBySize {
  private parent: number[];
  private size: number[];
  components: number;
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this.components = n;
  }
  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(x: number, y: number): boolean {
    const rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;
    if (this.size[rx] < this.size[ry]) { this.parent[rx] = ry; this.size[ry] += this.size[rx]; }
    else { this.parent[ry] = rx; this.size[rx] += this.size[ry]; }
    this.components--;
    return true;
  }
}`,
        },
      ],
      useCases: [
        'Kruskal\'s Minimum Spanning Tree',
        'Cycle detection in undirected graphs',
        'Number of connected components / islands',
        'Account merge, friend circles, network connectivity',
      ],
      commonPitfalls: [
        'Number of islands: water cells inflate the component count — subtract them or initialize only land cells',
        'Kruskal\'s: must sort edges first — forgetting sort gives wrong MST',
        'Redundant connection: must process edges in ORDER — the first cycle-creating edge is the answer',
        'Directed graphs: standard UF tracks undirected connectivity — for directed, use different approach',
      ],
      interviewTips: [
        'When asked "detect cycle in undirected graph", immediately offer union-find as O(E * alpha(V)) solution',
        'Number of islands with UF is an alternative to DFS — mention both approaches',
        'Account merge is a very common real-world UF application — practiced at Google',
      ],
      relatedConcepts: ['union-find-basics', 'weighted-uf', 'rollback-dsu'],
      difficulty: 'intermediate',
      tags: ['kruskal', 'cycle-detection', 'islands', 'connectivity'],
      proTip:
        'The "number of islands" problem reveals an underappreciated UF advantage over DFS: UF naturally handles dynamic updates. If cells flip between land and water, UF can process each change in O(alpha(n)) by union/split, while DFS would need to re-traverse. For streaming grid updates, UF is the right tool.',
    },
    {
      id: 'rollback-dsu',
      title: 'Rollback DSU',
      description:
        'A union-find variant that supports undo operations by NOT using path compression (which is irreversible) and instead recording every union operation on a stack. To undo, pop the stack and restore the parent and rank values. Each operation is O(log n) instead of O(alpha(n)), but you gain the ability to "travel back in time." Combined with divide-and-conquer on queries, this solves offline dynamic connectivity.',
      timeComplexity: {
        best: 'O(log n) per operation',
        average: 'O(log n)',
        worst: 'O(log n) — no path compression, so bound is log n not alpha(n)',
      },
      spaceComplexity: 'O(n + q) where q = number of operations to potentially undo',
      keyPoints: [
        'No path compression: must NOT flatten trees, because compression is irreversible',
        'Union by rank: still used, provides O(log n) guarantee',
        'Save stack: before each union, push (root, old_rank, root2, old_rank2) onto undo stack',
        'Rollback: pop stack, restore parent and rank to previous values',
        'Each save/rollback is O(1); the union/find operations are O(log n)',
        'Enables "snapshot" semantics: save state, perform operations, rollback to snapshot',
        'Offline dynamic connectivity: divide time into segments, assign edges to segments, recurse with rollback',
        'Segment tree + rollback DSU: for offline queries, process edges that span a time segment, recurse on children, rollback',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Rollback Union-Find',
          code: `class RollbackUnionFind {
  private parent: number[];
  private rank: number[];
  private history: Array<{ node: number; oldParent: number; oldRank: number }> = [];
  private _components: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this._components = n;
  }

  // Find WITHOUT path compression — O(log n)
  find(x: number): number {
    while (this.parent[x] !== x) x = this.parent[x];
    return x;
  }

  // Union with history recording
  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) {
      // Record no-op for consistent rollback counting
      this.history.push({ node: -1, oldParent: -1, oldRank: -1 });
      return false;
    }

    // Always attach smaller rank under larger
    if (this.rank[rootX] < this.rank[rootY]) {
      this.history.push({ node: rootX, oldParent: rootX, oldRank: this.rank[rootX] });
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.history.push({ node: rootY, oldParent: rootY, oldRank: this.rank[rootY] });
      this.parent[rootY] = rootX;
    } else {
      this.history.push({ node: rootY, oldParent: rootY, oldRank: this.rank[rootX] });
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    this._components--;
    return true;
  }

  // Save current state (returns checkpoint)
  save(): number {
    return this.history.length;
  }

  // Rollback to checkpoint
  rollback(checkpoint: number): void {
    while (this.history.length > checkpoint) {
      const { node, oldParent, oldRank } = this.history.pop()!;
      if (node === -1) continue; // no-op union
      this.parent[node] = oldParent;
      this.rank[node] = oldRank;
      this._components++;
    }
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  get components(): number {
    return this._components;
  }
}`,
        },
      ],
      useCases: [
        'Offline dynamic connectivity: edges are added and removed, queries ask about connectivity at specific times',
        'Divide and conquer on queries: process operations in segments, recurse with rollback',
        'Competitive programming: problems requiring "undo" on union-find operations',
        'Temporal graph analysis: connectivity at different points in time',
      ],
      commonPitfalls: [
        'Using path compression: makes rollback impossible because compressed paths cannot be restored',
        'Not recording no-op unions: rollback count becomes inconsistent if no-ops are skipped',
        'O(log n) per find instead of O(alpha(n)): acceptable tradeoff for undo capability',
        'Rank restoration: must save and restore rank of the ROOT that was modified, not the merged root',
      ],
      interviewTips: [
        'Rollback DSU is an advanced competitive programming topic — rarely asked in standard interviews',
        'If asked "can you undo a union-find operation?", explain the path compression tradeoff',
        'The segment tree + rollback DSU combo for offline dynamic connectivity is an expert-level technique',
      ],
      relatedConcepts: ['union-find-basics', 'path-compression-variants', 'segment-tree'],
      difficulty: 'expert',
      tags: ['rollback', 'undo', 'dynamic-connectivity', 'offline'],
      proTip:
        'Offline dynamic connectivity (edges added and removed, queries at specific times) is solved by segment tree on time + rollback DSU. Each edge exists during a time interval [l, r); add this interval to the segment tree. Process the segment tree with DFS: at each node, union all edges in that node, recurse on children, then rollback. This solves the problem in O((N+Q) * log T * log N) where T = number of time steps.',
    },
  ],
}
