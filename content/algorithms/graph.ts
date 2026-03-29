// @ts-nocheck
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

interface ComplexityAnalysis {
  best?: string
  average?: string
  worst?: string
}

interface CodeExample {
  language: string
  label: string
  code: string
}

interface Concept {
  id: string
  title: string
  description: string
  timeComplexity?: ComplexityAnalysis
  spaceComplexity?: string
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

export const graphCategory: Category = {
  id: 'graph',
  title: 'Graph Algorithms',
  description: 'Graphs model relationships between entities. From social networks to road maps, dependency resolution to circuit design — graph algorithms are the backbone of systems engineering. Master traversal, shortest paths, spanning trees, and connectivity.',
  icon: '🕸️',
  concepts: [
    {
      id: 'bfs',
      title: 'Breadth-First Search (BFS)',
      description: 'BFS explores a graph level by level, visiting all neighbors of a node before moving to the next level. It uses a queue (FIFO) and guarantees the shortest path in unweighted graphs. BFS is the foundation for many graph algorithms including shortest path, bipartite checking, and connected component discovery. The 0-1 BFS variant handles graphs with edge weights 0 and 1 using a deque, running in O(V+E) instead of Dijkstra\'s O(E log V).',
      timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'Uses a queue (FIFO) — guarantees level-by-level exploration',
        'Shortest path in unweighted graphs: the first time BFS reaches a node is the shortest path',
        'Multi-source BFS: start with multiple sources in the queue for simultaneous distance calculation',
        '0-1 BFS: for graphs with 0/1 edge weights, use a deque — push 0-weight edges to front, 1-weight to back',
        'Level tracking: process all nodes at current distance before moving to next distance',
        'BFS tree: the parent pointers form a shortest-path tree from the source',
        'Bipartite check: 2-color during BFS, if a conflict is found the graph is not bipartite',
        'Space O(V): visited array + queue can hold up to O(V) nodes'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'BFS with Level Tracking and Path Reconstruction',
          code: `function bfs(
  graph: Map<number, number[]>, start: number
): { distances: Map<number, number>; parent: Map<number, number> } {
  const distances = new Map<number, number>();
  const parent = new Map<number, number>();
  const queue: number[] = [start];
  distances.set(start, 0);

  while (queue.length > 0) {
    const node = queue.shift()!;
    const dist = distances.get(node)!;

    for (const neighbor of graph.get(node) ?? []) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, dist + 1);
        parent.set(neighbor, node);
        queue.push(neighbor);
      }
    }
  }

  return { distances, parent };
}

// Reconstruct shortest path from start to end
function reconstructPath(
  parent: Map<number, number>, start: number, end: number
): number[] {
  if (!parent.has(end) && start !== end) return [];
  const path: number[] = [];
  let curr = end;
  while (curr !== start) {
    path.push(curr);
    curr = parent.get(curr)!;
  }
  path.push(start);
  return path.reverse();
}

// 0-1 BFS using deque
function bfs01(
  graph: Map<number, [number, number][]>, // [neighbor, weight 0 or 1]
  start: number, n: number
): number[] {
  const dist = new Array(n).fill(Infinity);
  dist[start] = 0;
  const deque: number[] = [start];

  while (deque.length > 0) {
    const u = deque.shift()!;
    for (const [v, w] of graph.get(u) ?? []) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        if (w === 0) deque.unshift(v); // Front
        else deque.push(v);            // Back
      }
    }
  }

  return dist;
}

// Multi-source BFS
function multiSourceBFS(
  graph: Map<number, number[]>, sources: number[]
): Map<number, number> {
  const distances = new Map<number, number>();
  const queue: number[] = [];

  for (const src of sources) {
    distances.set(src, 0);
    queue.push(src);
  }

  while (queue.length > 0) {
    const node = queue.shift()!;
    const dist = distances.get(node)!;
    for (const neighbor of graph.get(node) ?? []) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, dist + 1);
        queue.push(neighbor);
      }
    }
  }

  return distances;
}`
        }
      ],
      useCases: [
        'Shortest path in unweighted graphs',
        'Level-order traversal of trees',
        'Finding connected components',
        'Bipartite checking (2-coloring)',
        'Multi-source distance: nearest facility, rotten oranges problem',
        'Word ladder, maze solving, grid shortest path',
        '0-1 BFS: shortest path when edges have weight 0 or 1'
      ],
      commonPitfalls: [
        'Using a stack instead of a queue — that is DFS, not BFS',
        'Not marking nodes as visited BEFORE adding to queue — causes duplicates and TLE',
        'Using queue.shift() in JavaScript on large queues — O(n) per shift; use a proper queue or index pointer',
        'Forgetting that BFS only gives shortest path in UNWEIGHTED graphs — use Dijkstra for weighted'
      ],
      interviewTips: [
        'BFS appears in ~20% of graph interview questions',
        '"Shortest path in unweighted graph" or "minimum steps" = BFS',
        'Grid problems: treat each cell as a node, 4-directional neighbors as edges',
        'Multi-source BFS: initialize queue with all sources — single BFS handles all distances',
        'If weights are 0 and 1: mention 0-1 BFS with deque — shows depth of knowledge'
      ],
      relatedConcepts: ['dfs', 'dijkstra', 'bipartite-check', 'topological-sort'],
      difficulty: 'beginner',
      tags: ['traversal', 'shortest-path', 'unweighted', 'queue'],
      proTip: 'In JavaScript, Array.shift() is O(n). For BFS on large graphs, use an index pointer instead: let head = 0; while (head < queue.length) { const node = queue[head++]; ... }. This turns your O(V * V) BFS into the correct O(V + E).'
    },
    {
      id: 'dfs',
      title: 'Depth-First Search (DFS)',
      description: 'DFS explores as deep as possible along each branch before backtracking. It uses a stack (explicit or recursion call stack) and is the foundation for cycle detection, topological sorting, strongly connected components, and many tree algorithms. The timestamps (discovery/finish times) and edge classification (tree/back/forward/cross) unlock powerful analysis of graph structure.',
      timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'Uses a stack (explicit or recursion) — explores depth-first',
        'Discovery and finish timestamps enable edge classification',
        'Edge types: tree (new node), back (ancestor = cycle), forward (descendant), cross (no relation)',
        'Back edge exists if and only if the graph has a cycle (in directed graphs)',
        'Pre-order: process node when first discovered; post-order: process when all children done',
        'DFS forest: the collection of DFS trees from all connected components',
        'Iterative DFS: use explicit stack; handles deep graphs without stack overflow',
        'DFS on undirected graphs: only tree and back edges (no forward or cross edges)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'DFS with Edge Classification and Cycle Detection',
          code: `type EdgeType = 'tree' | 'back' | 'forward' | 'cross'

function dfs(graph: Map<number, number[]>, n: number) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Array(n).fill(WHITE);
  const discovery = new Array(n).fill(0);
  const finish = new Array(n).fill(0);
  const parent = new Array(n).fill(-1);
  const edges: Array<{ from: number; to: number; type: EdgeType }> = [];
  let time = 0;
  let hasCycle = false;

  function visit(u: number): void {
    color[u] = GRAY;
    discovery[u] = ++time;

    for (const v of graph.get(u) ?? []) {
      if (color[v] === WHITE) {
        parent[v] = u;
        edges.push({ from: u, to: v, type: 'tree' });
        visit(v);
      } else if (color[v] === GRAY) {
        edges.push({ from: u, to: v, type: 'back' });
        hasCycle = true;
      } else if (discovery[u] < discovery[v]) {
        edges.push({ from: u, to: v, type: 'forward' });
      } else {
        edges.push({ from: u, to: v, type: 'cross' });
      }
    }

    color[u] = BLACK;
    finish[u] = ++time;
  }

  for (let u = 0; u < n; u++) {
    if (color[u] === WHITE) visit(u);
  }

  return { discovery, finish, parent, edges, hasCycle };
}

// Iterative DFS (avoids stack overflow)
function dfsIterative(
  graph: Map<number, number[]>, start: number
): number[] {
  const visited = new Set<number>();
  const stack: number[] = [start];
  const result: number[] = [];

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (visited.has(node)) continue;
    visited.add(node);
    result.push(node);

    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return result;
}`
        }
      ],
      useCases: [
        'Cycle detection in directed and undirected graphs',
        'Topological sort (post-order DFS)',
        'Strongly connected components (Tarjan, Kosaraju)',
        'Maze generation and solving',
        'Finding bridges and articulation points',
        'Tree traversals (pre/in/post-order)',
        'Connected component labeling'
      ],
      commonPitfalls: [
        'Stack overflow on deep graphs — use iterative DFS with explicit stack',
        'Iterative DFS visits nodes in different order than recursive — matters for some algorithms',
        'Not distinguishing GRAY (in-progress) from BLACK (done) — needed for back edge detection',
        'Forgetting to handle disconnected graphs — loop over all nodes, not just one source'
      ],
      interviewTips: [
        'DFS is the most versatile graph tool — know it deeply',
        '"Can this graph have a cycle?" = DFS with back edge detection',
        'Grid problems: DFS for flood fill, island counting, connected regions',
        'When asked for "all paths" or "all permutations": DFS with backtracking',
        'Know the difference: BFS = shortest path, DFS = exhaustive exploration / cycle detection'
      ],
      relatedConcepts: ['bfs', 'topological-sort', 'scc', 'bridges-articulation-points'],
      difficulty: 'beginner',
      tags: ['traversal', 'stack', 'cycle-detection', 'recursive'],
      proTip: 'The DFS timestamp theorem: for any two nodes u and v, exactly one of three relationships holds: [d[u], f[u]] and [d[v], f[v]] are disjoint (no ancestor relation), one contains the other (ancestor-descendant), or they never meet (different components). This single property is the foundation for topological sort, SCC, and many tree algorithms.'
    },
    {
      id: 'dijkstra',
      title: 'Dijkstra\'s Algorithm',
      description: 'Dijkstra\'s algorithm finds the shortest path from a single source to all other vertices in a graph with non-negative edge weights. It works by greedily expanding the nearest unvisited vertex. The key insight: once a vertex is finalized (popped from the priority queue), its shortest distance is guaranteed. Negative edges break this invariant because a later edge could provide a shorter path to an already-finalized vertex.',
      timeComplexity: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)' },
      spaceComplexity: 'O(V + E)',
      keyPoints: [
        'Greedy: always expand the nearest unfinalized vertex — guaranteed optimal for non-negative weights',
        'Priority queue implementation: binary heap O(E log V), Fibonacci heap O(E + V log V)',
        'Lazy deletion: skip nodes popped with distance > known distance (simpler than decrease-key)',
        'DOES NOT WORK with negative edge weights — use Bellman-Ford instead',
        'Adjacency matrix O(V^2) version (no heap): better when E ~ V^2 (dense graphs)',
        'Path reconstruction: track parent of each node, walk back from destination',
        'Multi-destination: run until all targets are popped from the priority queue',
        'Bidirectional Dijkstra: run from both source and target, meet in the middle — ~2x speedup'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Dijkstra with Lazy Deletion and Path Reconstruction',
          code: `interface Edge {
  to: number
  weight: number
}

function dijkstra(
  graph: Map<number, Edge[]>, source: number, n: number
): { dist: number[]; parent: number[] } {
  const dist = new Array(n).fill(Infinity);
  const parent = new Array(n).fill(-1);
  dist[source] = 0;

  // Min-heap: [distance, node]
  // Using sorted insertion for clarity; use a proper heap in production
  const pq: [number, number][] = [[0, source]];

  while (pq.length > 0) {
    // Extract minimum
    let minIdx = 0;
    for (let i = 1; i < pq.length; i++) {
      if (pq[i][0] < pq[minIdx][0]) minIdx = i;
    }
    const [d, u] = pq.splice(minIdx, 1)[0];

    // Lazy deletion: skip if we already found a shorter path
    if (d > dist[u]) continue;

    for (const { to: v, weight: w } of graph.get(u) ?? []) {
      const newDist = dist[u] + w;
      if (newDist < dist[v]) {
        dist[v] = newDist;
        parent[v] = u;
        pq.push([newDist, v]);
      }
    }
  }

  return { dist, parent };
}

// Proper implementation with MinHeap
class MinHeap {
  private heap: [number, number][] = [];

  push(item: [number, number]): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): [number, number] | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  get size(): number { return this.heap.length; }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent][0] <= this.heap[i][0]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private sinkDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
      if (right < n && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}

function dijkstraOptimal(
  graph: Map<number, Edge[]>, source: number, n: number
): number[] {
  const dist = new Array(n).fill(Infinity);
  dist[source] = 0;
  const pq = new MinHeap();
  pq.push([0, source]);

  while (pq.size > 0) {
    const [d, u] = pq.pop()!;
    if (d > dist[u]) continue;

    for (const { to: v, weight: w } of graph.get(u) ?? []) {
      const nd = dist[u] + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        pq.push([nd, v]);
      }
    }
  }

  return dist;
}`
        }
      ],
      useCases: [
        'GPS navigation and routing (road networks have non-negative weights)',
        'Network routing protocols (OSPF uses Dijkstra)',
        'Game AI pathfinding (combined with A* heuristic)',
        'Social network "degrees of separation" with weighted edges',
        'Shortest path in weighted DAGs and general non-negative graphs'
      ],
      commonPitfalls: [
        'Using Dijkstra with negative edges — it produces wrong results silently',
        'Not using lazy deletion — processing the same node multiple times is wasteful',
        'Using adjacency matrix O(V^2) on sparse graphs — use adjacency list + heap instead',
        'Forgetting that the heap may contain stale entries — always check d > dist[u]'
      ],
      interviewTips: [
        'Dijkstra is the most asked shortest-path algorithm',
        'Know why negative weights break it: a finalized node might get a shorter path later',
        'If asked about negative weights: pivot to Bellman-Ford',
        'For grid problems with varying costs: Dijkstra on the grid (each cell is a node)',
        'Know the heap implementation — interviewers may ask about the priority queue details'
      ],
      relatedConcepts: ['bellman-ford', 'a-star', 'bfs', 'floyd-warshall'],
      difficulty: 'intermediate',
      tags: ['shortest-path', 'greedy', 'priority-queue', 'non-negative-weights'],
      proTip: 'In practice, the "lazy deletion" approach (push duplicates, skip stale entries) is almost always better than decrease-key operations. Decrease-key requires an indexed priority queue, which is complex and has worse cache behavior. Google Maps, OSRM, and most routing engines use lazy Dijkstra.'
    },
    {
      id: 'bellman-ford',
      title: 'Bellman-Ford Algorithm',
      description: 'Bellman-Ford finds shortest paths from a single source, handling negative edge weights and detecting negative cycles. It relaxes all edges V-1 times (the maximum shortest path length). If any edge can still be relaxed after V-1 iterations, a negative cycle exists. It is slower than Dijkstra but more general. The SPFA optimization uses a queue to avoid unnecessary relaxations.',
      timeComplexity: { best: 'O(V + E)', average: 'O(V * E)', worst: 'O(V * E)' },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'Handles negative edge weights — Dijkstra cannot',
        'Detects negative cycles: if relaxation succeeds on the Vth iteration',
        'V-1 iterations: longest simple path has at most V-1 edges',
        'SPFA (Shortest Path Faster Algorithm): BFS-like optimization, average case much faster',
        'Distributed routing: basis of RIP (Routing Information Protocol)',
        'Can find the negative cycle itself by tracing back from the relaxed edge',
        'For DAGs, topological sort + single-pass relaxation is O(V + E) — no need for Bellman-Ford',
        'Space efficient: only needs distance and parent arrays'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Bellman-Ford with Negative Cycle Detection',
          code: `interface WeightedEdge {
  from: number
  to: number
  weight: number
}

function bellmanFord(
  edges: WeightedEdge[], n: number, source: number
): { dist: number[]; hasNegativeCycle: boolean; parent: number[] } {
  const dist = new Array(n).fill(Infinity);
  const parent = new Array(n).fill(-1);
  dist[source] = 0;

  // Relax all edges V-1 times
  for (let i = 0; i < n - 1; i++) {
    let updated = false;
    for (const { from, to, weight } of edges) {
      if (dist[from] !== Infinity && dist[from] + weight < dist[to]) {
        dist[to] = dist[from] + weight;
        parent[to] = from;
        updated = true;
      }
    }
    if (!updated) break; // Early exit optimization
  }

  // Check for negative cycles (Vth iteration)
  let hasNegativeCycle = false;
  for (const { from, to, weight } of edges) {
    if (dist[from] !== Infinity && dist[from] + weight < dist[to]) {
      hasNegativeCycle = true;
      break;
    }
  }

  return { dist, hasNegativeCycle, parent };
}

// SPFA: Bellman-Ford with queue optimization
function spfa(
  graph: Map<number, Array<{ to: number; weight: number }>>,
  n: number, source: number
): { dist: number[]; hasNegativeCycle: boolean } {
  const dist = new Array(n).fill(Infinity);
  const inQueue = new Array(n).fill(false);
  const relaxCount = new Array(n).fill(0);
  dist[source] = 0;

  const queue: number[] = [source];
  inQueue[source] = true;

  while (queue.length > 0) {
    const u = queue.shift()!;
    inQueue[u] = false;

    for (const { to: v, weight: w } of graph.get(u) ?? []) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        if (!inQueue[v]) {
          queue.push(v);
          inQueue[v] = true;
          relaxCount[v]++;
          if (relaxCount[v] >= n) {
            return { dist, hasNegativeCycle: true };
          }
        }
      }
    }
  }

  return { dist, hasNegativeCycle: false };
}`
        }
      ],
      useCases: [
        'Graphs with negative edge weights (currency exchange with transaction costs)',
        'Negative cycle detection (arbitrage in currency exchange)',
        'Distributed routing protocols (RIP)',
        'When Dijkstra cannot be used due to negative weights',
        'Constraint satisfaction via shortest paths (difference constraints)'
      ],
      commonPitfalls: [
        'Checking dist[from] !== Infinity — skipping unreachable source edges',
        'Not running the Nth iteration to check for negative cycles',
        'SPFA worst case is still O(V*E) — do not assume it is always fast',
        'Confusing "negative edge" with "negative cycle" — BF handles both but only detects cycles'
      ],
      interviewTips: [
        'If asked "handle negative weights": Bellman-Ford is the answer',
        '"Detect arbitrage opportunity": negative cycle detection with Bellman-Ford on log-transformed weights',
        'Know the V-1 proof: shortest path has at most V-1 edges in a graph without negative cycles',
        'Compare with Dijkstra: BF is O(VE), Dijkstra is O(E log V), but Dijkstra needs non-negative weights'
      ],
      relatedConcepts: ['dijkstra', 'floyd-warshall', 'spfa', 'negative-cycle'],
      difficulty: 'intermediate',
      tags: ['shortest-path', 'negative-weights', 'cycle-detection'],
      proTip: 'The arbitrage detection problem is a classic Bellman-Ford application. Convert exchange rates to logarithms: log(rate). A negative cycle in the log-transformed graph means the product of exchange rates along the cycle exceeds 1 — an arbitrage opportunity. This insight connects graph theory to financial engineering.'
    },
    {
      id: 'floyd-warshall',
      title: 'Floyd-Warshall Algorithm',
      description: 'Floyd-Warshall computes shortest paths between ALL pairs of vertices using dynamic programming. The recurrence is elegant: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]) for each intermediate vertex k. It handles negative edges (but not negative cycles) and runs in O(V^3) time with O(V^2) space. Beyond shortest paths, it computes transitive closure and can detect negative cycles.',
      timeComplexity: { best: 'O(V^3)', average: 'O(V^3)', worst: 'O(V^3)' },
      spaceComplexity: 'O(V^2)',
      keyPoints: [
        'All-pairs shortest path in O(V^3) — simpler than running Dijkstra V times',
        'DP recurrence: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])',
        'k must be the outermost loop — this is the "through vertex k" invariant',
        'Handles negative edges but not negative cycles — detect by checking dist[i][i] < 0',
        'Path reconstruction: maintain next[i][j] matrix, follow next pointers',
        'Transitive closure: use boolean OR instead of min/+',
        'Space optimization: only need the current and previous k layer (but rarely worth it)',
        'Best for dense graphs with small V (V < 500); for sparse graphs, run Dijkstra V times'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Floyd-Warshall with Path Reconstruction',
          code: `function floydWarshall(
  n: number,
  edges: Array<{ from: number; to: number; weight: number }>
): { dist: number[][]; next: number[][] } {
  // Initialize distance matrix
  const dist: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity))
  );
  const next: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(-1)
  );

  // Set direct edges
  for (const { from, to, weight } of edges) {
    if (weight < dist[from][to]) {
      dist[from][to] = weight;
      next[from][to] = to;
    }
  }

  // Floyd-Warshall: k MUST be outermost loop
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
      }
    }
  }

  return { dist, next };
}

function reconstructPath(
  next: number[][], from: number, to: number
): number[] {
  if (next[from][to] === -1) return [];
  const path = [from];
  let curr = from;
  while (curr !== to) {
    curr = next[curr][to];
    path.push(curr);
  }
  return path;
}

// Detect negative cycles
function hasNegativeCycle(dist: number[][]): boolean {
  for (let i = 0; i < dist.length; i++) {
    if (dist[i][i] < 0) return true;
  }
  return false;
}`
        }
      ],
      useCases: [
        'All-pairs shortest paths in small dense graphs',
        'Transitive closure of a relation',
        'Network routing tables where all-to-all distances are needed',
        'Finding diameter of a graph (longest shortest path)',
        'Detecting negative cycles accessible from any vertex'
      ],
      commonPitfalls: [
        'Putting k as an inner loop instead of outermost — BREAKS the algorithm entirely',
        'Not handling Infinity + Infinity overflow — check dist[i][k] !== Infinity before adding',
        'Using Floyd-Warshall on sparse graphs — V times Dijkstra is faster when E << V^2',
        'Forgetting to initialize dist[i][i] = 0 — self-loops should have distance 0'
      ],
      interviewTips: [
        'Floyd-Warshall is asked when "all pairs" of shortest paths are needed',
        'The k-outermost-loop insight is the #1 thing interviewers test',
        'For V < 400-500, Floyd-Warshall is the simplest all-pairs solution',
        'Know the connection: transitive closure is Floyd-Warshall with boolean OR'
      ],
      relatedConcepts: ['dijkstra', 'bellman-ford', 'transitive-closure', 'matrix-multiplication'],
      difficulty: 'intermediate',
      tags: ['all-pairs', 'shortest-path', 'dynamic-programming', 'cubic'],
      proTip: 'Floyd-Warshall is secretly matrix multiplication over the (min, +) semiring. This connection means you can compute all-pairs shortest paths in O(V^3 log V) by repeated matrix squaring. For special graph structures (e.g., low treewidth), even faster algorithms exist based on this algebraic view.'
    },
    {
      id: 'a-star',
      title: 'A* Search',
      description: 'A* is Dijkstra\'s algorithm augmented with a heuristic function h(n) that estimates the remaining cost to the goal. It prioritizes nodes by f(n) = g(n) + h(n), where g(n) is the known cost from start. With an admissible heuristic (never overestimates), A* is optimal and complete. With a consistent heuristic (satisfies triangle inequality), it never re-expands nodes. A* is the gold standard for pathfinding in games, robotics, and navigation.',
      timeComplexity: { best: 'O(E)', average: 'O(E log V)', worst: 'O(E log V)' },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'f(n) = g(n) + h(n): actual cost + estimated remaining cost',
        'Admissible heuristic: h(n) <= actual cost to goal — guarantees optimal solution',
        'Consistent (monotone) heuristic: h(n) <= cost(n,m) + h(m) — never re-expands nodes',
        'Common heuristics: Manhattan distance (grid), Euclidean distance, Chebyshev distance',
        'If h(n) = 0 for all n, A* degrades to Dijkstra',
        'If h(n) = actual cost, A* follows the optimal path directly with no wasted exploration',
        'Weighted A*: f(n) = g(n) + w*h(n) with w > 1 — faster but solution within w * optimal',
        'Tie-breaking: prefer higher g(n) to stay closer to the goal when f-values are equal'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'A* on a Grid with Manhattan Distance Heuristic',
          code: `interface GridCell {
  row: number
  col: number
}

function aStarGrid(
  grid: number[][], // 0 = passable, 1 = wall
  start: GridCell,
  goal: GridCell
): GridCell[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const key = (r: number, c: number) => r * cols + c;

  const heuristic = (r: number, c: number): number =>
    Math.abs(r - goal.row) + Math.abs(c - goal.col); // Manhattan

  const gScore = new Map<number, number>();
  const fScore = new Map<number, number>();
  const cameFrom = new Map<number, number>();

  const startKey = key(start.row, start.col);
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start.row, start.col));

  // Open set as array (use proper heap in production)
  const open: number[] = [startKey];
  const closed = new Set<number>();

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  while (open.length > 0) {
    // Find node with lowest fScore
    let bestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if ((fScore.get(open[i]) ?? Infinity) < (fScore.get(open[bestIdx]) ?? Infinity)) {
        bestIdx = i;
      }
    }
    const current = open.splice(bestIdx, 1)[0];
    const cr = Math.floor(current / cols);
    const cc = current % cols;

    if (cr === goal.row && cc === goal.col) {
      return reconstructAStarPath(cameFrom, current, cols);
    }

    closed.add(current);

    for (const [dr, dc] of dirs) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === 1) continue;

      const neighborKey = key(nr, nc);
      if (closed.has(neighborKey)) continue;

      const tentativeG = (gScore.get(current) ?? Infinity) + 1;

      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + heuristic(nr, nc));
        if (!open.includes(neighborKey)) {
          open.push(neighborKey);
        }
      }
    }
  }

  return []; // No path found
}

function reconstructAStarPath(
  cameFrom: Map<number, number>, current: number, cols: number
): GridCell[] {
  const path: GridCell[] = [];
  let node: number | undefined = current;
  while (node !== undefined) {
    path.push({ row: Math.floor(node / cols), col: node % cols });
    node = cameFrom.get(node);
  }
  return path.reverse();
}`
        }
      ],
      useCases: [
        'Game pathfinding (NPCs navigating maps)',
        'Robot motion planning',
        'GPS navigation (with road network heuristics)',
        'Puzzle solving (15-puzzle, Rubik\'s cube with pattern database heuristics)',
        'Any goal-directed search where a good heuristic is available'
      ],
      commonPitfalls: [
        'Non-admissible heuristic: overestimating cost leads to suboptimal paths',
        'Non-consistent heuristic: causes node re-expansion, slower than Dijkstra',
        'Using Euclidean heuristic on a grid that only allows 4-directional movement — not admissible',
        'Not implementing tie-breaking: many nodes with same f-value causes unnecessary exploration'
      ],
      interviewTips: [
        'A* is asked in system design (navigation), game dev, and advanced algorithm interviews',
        'Know the three heuristic types: admissible, consistent, and the relationship between them',
        'Manhattan distance for 4-directional grids, Chebyshev for 8-directional, Euclidean for continuous',
        'If asked "how to make pathfinding faster": weighted A*, jump point search, or hierarchical A*'
      ],
      relatedConcepts: ['dijkstra', 'bfs', 'greedy-best-first', 'jump-point-search'],
      difficulty: 'advanced',
      tags: ['shortest-path', 'heuristic', 'pathfinding', 'priority-queue'],
      proTip: 'In production game engines, A* on a raw grid is too slow. The standard approach is to precompute a navigation mesh (navmesh) — a triangulated walkable surface — and run A* on the navmesh graph. This reduces the search space by 100-1000x. For even faster pathfinding, use hierarchical A* or precomputed shortest-path databases (contraction hierarchies).'
    },
    {
      id: 'kruskal',
      title: 'Kruskal\'s Algorithm (MST)',
      description: 'Kruskal\'s algorithm finds the Minimum Spanning Tree by sorting all edges by weight and greedily adding the cheapest edge that does not create a cycle. Cycle detection uses a Disjoint Set Union (Union-Find) data structure, making each edge check nearly O(1) amortized. The total time is dominated by the sort: O(E log E). Kruskal\'s is preferred for sparse graphs; Prim\'s is better for dense graphs.',
      timeComplexity: { best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)' },
      spaceComplexity: 'O(V + E)',
      keyPoints: [
        'Sort edges by weight, greedily add cheapest non-cycle-creating edge',
        'Union-Find (DSU) for cycle detection: union by rank + path compression = nearly O(1) per op',
        'Stops after adding V-1 edges (a spanning tree has exactly V-1 edges)',
        'Works well for sparse graphs where E is small relative to V^2',
        'Cut property: the lightest edge crossing any cut must be in the MST',
        'Can compute MST of edge-stream without storing all edges (filter with current MST)',
        'Boruvka algorithm: parallel-friendly MST — each component picks its lightest outgoing edge',
        'MST is unique if all edge weights are distinct'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Kruskal with Union-Find',
          code: `class DSU {
  parent: number[]
  rank: number[]

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const px = this.find(x);
    const py = this.find(y);
    if (px === py) return false; // Already connected

    // Union by rank
    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }
    return true;
  }
}

interface MSTEdge {
  from: number
  to: number
  weight: number
}

function kruskal(n: number, edges: MSTEdge[]): {
  mstEdges: MSTEdge[]
  totalWeight: number
} {
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);
  const dsu = new DSU(n);
  const mstEdges: MSTEdge[] = [];
  let totalWeight = 0;

  for (const edge of sorted) {
    if (dsu.union(edge.from, edge.to)) {
      mstEdges.push(edge);
      totalWeight += edge.weight;
      if (mstEdges.length === n - 1) break;
    }
  }

  return { mstEdges, totalWeight };
}`
        }
      ],
      useCases: [
        'Network design: minimum cost to connect all nodes (cables, roads, pipelines)',
        'Cluster analysis: remove heaviest edges from MST to form clusters',
        'Approximate TSP: MST-based 2-approximation for traveling salesman',
        'Image segmentation: pixel similarity graph MST',
        'Maze generation: random MST creates a spanning tree maze'
      ],
      commonPitfalls: [
        'Forgetting to implement path compression in Union-Find — O(n) per find without it',
        'Not stopping after V-1 edges — processing unnecessary edges',
        'Using adjacency matrix representation — Kruskal needs edge list',
        'Not handling disconnected graphs — MST only exists if the graph is connected'
      ],
      interviewTips: [
        'Know both Kruskal and Prim: Kruskal for sparse, Prim for dense graphs',
        'DSU implementation is a standalone interview question — know it cold',
        'The cut property is the key insight: lightest edge crossing any cut belongs to MST',
        'If asked "minimum cost to connect n cities": MST problem'
      ],
      relatedConcepts: ['prim', 'dsu', 'boruvka', 'cut-property'],
      difficulty: 'intermediate',
      tags: ['mst', 'greedy', 'union-find', 'sorting'],
      proTip: 'Union-Find with path compression + union by rank gives amortized O(alpha(n)) per operation, where alpha is the inverse Ackermann function — effectively O(1) for all practical purposes. This makes Kruskal essentially O(E log E) = O(E log V) since E <= V^2.'
    },
    {
      id: 'prim',
      title: 'Prim\'s Algorithm (MST)',
      description: 'Prim\'s algorithm grows the MST from a single vertex, always adding the cheapest edge that connects a tree vertex to a non-tree vertex. It is essentially Dijkstra\'s algorithm with edge weight instead of path distance. With a binary heap it runs in O(E log V); with a Fibonacci heap, O(E + V log V). Prim\'s is preferred for dense graphs where E ~ V^2.',
      timeComplexity: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)' },
      spaceComplexity: 'O(V + E)',
      keyPoints: [
        'Grows MST from a single source — Dijkstra-like with edge weight as priority',
        'Adjacency matrix version: O(V^2) — better than Kruskal for dense graphs',
        'Binary heap version: O(E log V) — same as Kruskal for sparse graphs',
        'Fibonacci heap version: O(E + V log V) — theoretically optimal for dense graphs',
        'Each vertex is processed exactly once, just like Dijkstra',
        'Does not need edges to be sorted — advantage over Kruskal when sorting is expensive',
        'Naturally works with adjacency list or matrix — more flexible input than Kruskal',
        'For dense graphs (E ~ V^2): O(V^2) matrix version beats Kruskal O(V^2 log V)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Prim\'s Algorithm with Min-Heap',
          code: `function prim(
  graph: Map<number, Array<{ to: number; weight: number }>>,
  n: number
): { mstEdges: Array<{ from: number; to: number; weight: number }>; totalWeight: number } {
  const inMST = new Array(n).fill(false);
  const mstEdges: Array<{ from: number; to: number; weight: number }> = [];
  let totalWeight = 0;

  // Min-heap: [weight, to, from]
  const pq: [number, number, number][] = [[0, 0, -1]];

  while (pq.length > 0 && mstEdges.length < n - 1) {
    // Extract minimum (use proper heap in production)
    let minIdx = 0;
    for (let i = 1; i < pq.length; i++) {
      if (pq[i][0] < pq[minIdx][0]) minIdx = i;
    }
    const [weight, u, from] = pq.splice(minIdx, 1)[0];

    if (inMST[u]) continue;
    inMST[u] = true;

    if (from !== -1) {
      mstEdges.push({ from, to: u, weight });
      totalWeight += weight;
    }

    for (const { to: v, weight: w } of graph.get(u) ?? []) {
      if (!inMST[v]) {
        pq.push([w, v, u]);
      }
    }
  }

  return { mstEdges, totalWeight };
}`
        }
      ],
      useCases: [
        'Dense graph MST: O(V^2) matrix version is optimal',
        'When the graph is given as adjacency matrix (no need to build edge list)',
        'Interactive/online MST: can process edges as they arrive',
        'Same applications as Kruskal: network design, clustering, etc.'
      ],
      commonPitfalls: [
        'Not checking inMST before processing — leads to cycles',
        'Using Prim on sparse graphs when Kruskal would be simpler',
        'Confusing Prim with Dijkstra: Prim uses edge weight, Dijkstra uses path distance',
        'Starting from the wrong node — Prim works from any starting vertex for connected graphs'
      ],
      interviewTips: [
        'Compare Prim vs Kruskal: Prim grows from one vertex, Kruskal merges components',
        'Prim is Dijkstra with "key" = edge weight instead of distance',
        'For "MST of a dense graph": Prim with adjacency matrix O(V^2)',
        'Both produce the same MST (if unique) — the choice is about graph density'
      ],
      relatedConcepts: ['kruskal', 'dijkstra', 'fibonacci-heap', 'mst'],
      difficulty: 'intermediate',
      tags: ['mst', 'greedy', 'priority-queue'],
      proTip: 'The Fibonacci heap makes Prim O(E + V log V), which is the theoretical best for MST with a deterministic algorithm. In practice, the constant factors of Fibonacci heaps are large enough that binary heap Prim (or Kruskal with DSU) is faster for most real-world graph sizes. Fibonacci heaps shine only for extremely dense graphs (E >> V log V).'
    },
    {
      id: 'topological-sort',
      title: 'Topological Sort',
      description: 'Topological sort produces a linear ordering of vertices in a DAG (Directed Acyclic Graph) such that for every edge u -> v, u appears before v. It exists if and only if the graph has no cycles. Two approaches: Kahn\'s algorithm (BFS with in-degree tracking) and DFS-based (reverse post-order). Topological sort is the foundation for dependency resolution, build systems, and scheduling.',
      timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'Only exists for DAGs — if a cycle exists, topological sort is impossible',
        'Kahn algorithm (BFS): start with in-degree 0 nodes, process and reduce neighbors in-degrees',
        'DFS-based: run DFS, output nodes in reverse finish order (post-order reversal)',
        'Kahn also detects cycles: if not all nodes are processed, a cycle exists',
        'Multiple valid orderings may exist — Kahn with a priority queue gives lexicographically smallest',
        'Counting all valid topological orderings is #P-complete (very hard)',
        'Used in: build systems (make, gradle), course scheduling, package dependency resolution',
        'Longest path in a DAG: topological sort + DP in O(V + E)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Both Kahn and DFS Topological Sort',
          code: `// Kahn's Algorithm (BFS-based)
function topologicalSortKahn(
  graph: Map<number, number[]>, n: number
): { order: number[]; hasCycle: boolean } {
  const inDegree = new Array(n).fill(0);

  for (const neighbors of graph.values()) {
    for (const v of neighbors) {
      inDegree[v]++;
    }
  }

  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const order: number[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);

    for (const v of graph.get(u) ?? []) {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    }
  }

  return {
    order,
    hasCycle: order.length !== n
  };
}

// DFS-based Topological Sort
function topologicalSortDFS(
  graph: Map<number, number[]>, n: number
): { order: number[]; hasCycle: boolean } {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Array(n).fill(WHITE);
  const result: number[] = [];
  let hasCycle = false;

  function dfs(u: number): void {
    if (hasCycle) return;
    color[u] = GRAY;

    for (const v of graph.get(u) ?? []) {
      if (color[v] === GRAY) {
        hasCycle = true;
        return;
      }
      if (color[v] === WHITE) {
        dfs(v);
      }
    }

    color[u] = BLACK;
    result.push(u); // Post-order
  }

  for (let i = 0; i < n; i++) {
    if (color[i] === WHITE) dfs(i);
  }

  return { order: result.reverse(), hasCycle };
}`
        }
      ],
      useCases: [
        'Build systems: determine compilation order (make, gradle, webpack)',
        'Course scheduling: prerequisites form a DAG',
        'Package dependency resolution (npm, pip)',
        'Task scheduling with dependencies',
        'Longest path in a DAG (critical path method)',
        'Data pipeline orchestration (Airflow, dbt)'
      ],
      commonPitfalls: [
        'Forgetting to detect cycles — topological sort only exists for DAGs',
        'DFS version: not reversing the result — post-order is reverse topological order',
        'Kahn version: not counting processed nodes to detect cycles',
        'Assuming unique ordering — multiple valid orderings exist in general'
      ],
      interviewTips: [
        '"Course schedule" and "alien dictionary" are classic topological sort problems',
        'Know both algorithms: Kahn is easier to implement and naturally detects cycles',
        'If asked for lexicographically smallest ordering: use Kahn with a min-heap instead of queue',
        'Follow-up: "What if there are cycles?" — cycle detection via Kahn (incomplete processing) or DFS (back edge)'
      ],
      relatedConcepts: ['dfs', 'bfs', 'dag', 'scc', 'cycle-detection'],
      difficulty: 'intermediate',
      tags: ['dag', 'ordering', 'dependency-resolution'],
      proTip: 'In practice, the most common use of topological sort is dependency resolution in build systems. Every time you run npm install, pip install, or gradle build, a topological sort determines the installation/compilation order. Understanding this connection helps you debug circular dependency errors in real projects.'
    },
    {
      id: 'scc',
      title: 'Strongly Connected Components',
      description: 'A Strongly Connected Component (SCC) is a maximal set of vertices where every vertex is reachable from every other vertex. Finding SCCs decomposes a directed graph into a DAG of components (the "condensation"), enabling efficient analysis of cyclic structures. Tarjan\'s one-pass DFS algorithm and Kosaraju\'s two-pass algorithm both run in O(V+E). SCCs appear in compiler optimization, social network analysis, and model checking.',
      timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'SCC: maximal subset where every pair of vertices has a path in both directions',
        'Condensation: replace each SCC with a single node — result is always a DAG',
        'Tarjan: one-pass DFS using discovery time and low-link values, stack of current path',
        'Kosaraju: two passes — first DFS records finish order, second DFS on reversed graph',
        'Tarjan is faster in practice (one DFS pass), Kosaraju is conceptually simpler',
        'Low-link value: smallest discovery time reachable from subtree including back edges',
        'An SCC root: node where low-link === discovery time — pop stack to extract the SCC',
        'Applications: 2-SAT (implication graph SCCs), deadlock detection, web crawl structure'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Tarjan\'s SCC Algorithm',
          code: `function tarjanSCC(
  graph: Map<number, number[]>, n: number
): number[][] {
  const disc = new Array(n).fill(-1);
  const low = new Array(n).fill(-1);
  const onStack = new Array(n).fill(false);
  const stack: number[] = [];
  const sccs: number[][] = [];
  let timer = 0;

  function dfs(u: number): void {
    disc[u] = low[u] = timer++;
    stack.push(u);
    onStack[u] = true;

    for (const v of graph.get(u) ?? []) {
      if (disc[v] === -1) {
        dfs(v);
        low[u] = Math.min(low[u], low[v]);
      } else if (onStack[v]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }

    // u is SCC root: low[u] === disc[u]
    if (low[u] === disc[u]) {
      const scc: number[] = [];
      let v: number;
      do {
        v = stack.pop()!;
        onStack[v] = false;
        scc.push(v);
      } while (v !== u);
      sccs.push(scc);
    }
  }

  for (let i = 0; i < n; i++) {
    if (disc[i] === -1) dfs(i);
  }

  return sccs;
}

// Kosaraju's Algorithm (two-pass)
function kosarajuSCC(
  graph: Map<number, number[]>, n: number
): number[][] {
  // Pass 1: DFS on original graph, record finish order
  const visited = new Array(n).fill(false);
  const finishOrder: number[] = [];

  function dfs1(u: number): void {
    visited[u] = true;
    for (const v of graph.get(u) ?? []) {
      if (!visited[v]) dfs1(v);
    }
    finishOrder.push(u);
  }

  for (let i = 0; i < n; i++) {
    if (!visited[i]) dfs1(i);
  }

  // Build reversed graph
  const reversed = new Map<number, number[]>();
  for (const [u, neighbors] of graph.entries()) {
    for (const v of neighbors) {
      if (!reversed.has(v)) reversed.set(v, []);
      reversed.get(v)!.push(u);
    }
  }

  // Pass 2: DFS on reversed graph in reverse finish order
  visited.fill(false);
  const sccs: number[][] = [];

  function dfs2(u: number, scc: number[]): void {
    visited[u] = true;
    scc.push(u);
    for (const v of reversed.get(u) ?? []) {
      if (!visited[v]) dfs2(v, scc);
    }
  }

  for (let i = finishOrder.length - 1; i >= 0; i--) {
    const u = finishOrder[i];
    if (!visited[u]) {
      const scc: number[] = [];
      dfs2(u, scc);
      sccs.push(scc);
    }
  }

  return sccs;
}`
        }
      ],
      useCases: [
        '2-SAT: solve boolean satisfiability on implication graphs',
        'Deadlock detection in resource allocation graphs',
        'Compiler optimization: identifying loops for optimization',
        'Social network analysis: finding tightly-knit communities',
        'Web structure: the "bow-tie" model of the web uses SCCs'
      ],
      commonPitfalls: [
        'Tarjan: using low[v] instead of disc[v] when v is on stack — both work but have different semantics',
        'Kosaraju: forgetting to reverse the graph for the second pass',
        'Not handling disconnected graphs — must run DFS from all unvisited nodes',
        'Confusing SCC with connected components in undirected graphs — SCC is for directed graphs only'
      ],
      interviewTips: [
        'SCCs are asked in advanced interviews — know at least one algorithm',
        'Tarjan is harder to implement but faster; Kosaraju is easier to explain',
        'If asked about 2-SAT: "build implication graph, find SCCs, check for contradictions"',
        'The condensation DAG is key: once you have SCCs, many problems reduce to DAG problems'
      ],
      relatedConcepts: ['dfs', 'topological-sort', 'bridges-articulation-points', '2-sat'],
      difficulty: 'advanced',
      tags: ['connectivity', 'dfs', 'decomposition'],
      proTip: 'The condensation (DAG of SCCs) is one of the most powerful graph decomposition techniques. Once you compute it, problems like "can vertex u reach vertex v?" become DAG reachability queries, which are much easier. For 2-SAT, the key insight is: if x and NOT x are in the same SCC, the formula is unsatisfiable.'
    },
    {
      id: 'bridges-articulation-points',
      title: 'Bridges and Articulation Points',
      description: 'A bridge is an edge whose removal disconnects the graph. An articulation point is a vertex whose removal disconnects the graph. Tarjan\'s algorithm finds both in O(V+E) using DFS discovery times and low-link values. These are critical for network reliability analysis — bridges and articulation points are single points of failure.',
      timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'Bridge: edge (u,v) where low[v] > disc[u] — no back edge from v subtree reaches above u',
        'Articulation point: vertex u where some child v has low[v] >= disc[u] (or root with 2+ children)',
        'Uses DFS discovery time and low-link values, same framework as Tarjan SCC',
        'Root of DFS tree is an articulation point if and only if it has 2+ children in the DFS tree',
        'Biconnected components: maximal subgraphs with no articulation points',
        'Block-cut tree: tree of biconnected components connected through articulation points',
        'Applications: network reliability, critical infrastructure, fault tolerance'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Find Bridges and Articulation Points',
          code: `function findBridgesAndAPs(
  graph: Map<number, number[]>, n: number
): { bridges: [number, number][]; articulationPoints: Set<number> } {
  const disc = new Array(n).fill(-1);
  const low = new Array(n).fill(-1);
  const parent = new Array(n).fill(-1);
  const bridges: [number, number][] = [];
  const aps = new Set<number>();
  let timer = 0;

  function dfs(u: number): void {
    disc[u] = low[u] = timer++;
    let children = 0;

    for (const v of graph.get(u) ?? []) {
      if (disc[v] === -1) {
        children++;
        parent[v] = u;
        dfs(v);
        low[u] = Math.min(low[u], low[v]);

        // Bridge: no back edge from v's subtree reaches above u
        if (low[v] > disc[u]) {
          bridges.push([u, v]);
        }

        // Articulation point: non-root with child that can't reach above
        if (parent[u] !== -1 && low[v] >= disc[u]) {
          aps.add(u);
        }
      } else if (v !== parent[u]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }

    // Root is AP if it has 2+ DFS tree children
    if (parent[u] === -1 && children > 1) {
      aps.add(u);
    }
  }

  for (let i = 0; i < n; i++) {
    if (disc[i] === -1) dfs(i);
  }

  return { bridges, articulationPoints: aps };
}`
        }
      ],
      useCases: [
        'Network reliability: identifying single points of failure',
        'Infrastructure planning: ensuring redundancy for critical connections',
        'Social network analysis: finding key connectors',
        'Graph decomposition into biconnected components',
        'Fault-tolerant network design'
      ],
      commonPitfalls: [
        'Not handling the root case for articulation points (root needs 2+ DFS children)',
        'Using parent node for low-link update in undirected graphs — must skip the edge to parent',
        'Bridge condition: low[v] > disc[u] (strict), AP condition: low[v] >= disc[u] (non-strict)',
        'Multi-edges: if there are parallel edges between u and v, they are NOT bridges'
      ],
      interviewTips: [
        '"Critical connections in a network" is a Leetcode hard that is exactly bridge finding',
        'Know the intuition: a bridge exists when the only path to a subtree is through that edge',
        'The root special case is a common follow-up question',
        'Biconnected components are a natural extension — mention them to show depth'
      ],
      relatedConcepts: ['scc', 'dfs', 'biconnected-components', 'block-cut-tree'],
      difficulty: 'advanced',
      tags: ['connectivity', 'dfs', 'reliability', 'low-link'],
      proTip: 'In production networks, the block-cut tree (tree of biconnected components) gives you the full picture of redundancy. Each biconnected component is 2-edge-connected internally, and the tree structure shows exactly how removing an articulation point splits the network. This is how network monitoring tools assess topology resilience.'
    },
    {
      id: 'eulerian-path',
      title: 'Eulerian Path and Circuit',
      description: 'An Eulerian path visits every edge exactly once. An Eulerian circuit is an Eulerian path that starts and ends at the same vertex. Hierholzer\'s algorithm finds an Eulerian circuit in O(V+E) by building the circuit incrementally: follow edges until stuck, then splice in unused edges. The existence conditions are elegant: a connected graph has an Eulerian circuit iff every vertex has even degree, and an Eulerian path iff exactly 0 or 2 vertices have odd degree.',
      timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
      spaceComplexity: 'O(V + E)',
      keyPoints: [
        'Eulerian circuit exists iff: connected + all vertices have even degree',
        'Eulerian path exists iff: connected + exactly 0 or 2 vertices have odd degree',
        'For directed graphs: Eulerian circuit iff in-degree = out-degree for all vertices',
        'For directed: Eulerian path iff at most one vertex has out-in=1 and one has in-out=1',
        'Hierholzer algorithm: follow edges until stuck, splice in subtours from visited vertices',
        'Implementation: use edge index tracking to avoid revisiting edges',
        'Not the same as Hamiltonian path (visits every VERTEX once) — Eulerian is about EDGES',
        'Applications: DNA assembly (de Bruijn graphs), Chinese postman problem, circuit routing'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Hierholzer\'s Algorithm for Eulerian Path (Directed)',
          code: `function findEulerianPath(
  graph: Map<number, number[]>, n: number
): number[] {
  // Find start vertex for Eulerian path
  const inDeg = new Array(n).fill(0);
  const outDeg = new Array(n).fill(0);

  for (const [u, neighbors] of graph.entries()) {
    outDeg[u] = neighbors.length;
    for (const v of neighbors) {
      inDeg[v]++;
    }
  }

  let start = 0;
  let startNodes = 0;
  let endNodes = 0;

  for (let i = 0; i < n; i++) {
    if (outDeg[i] - inDeg[i] === 1) {
      start = i;
      startNodes++;
    } else if (inDeg[i] - outDeg[i] === 1) {
      endNodes++;
    } else if (inDeg[i] !== outDeg[i]) {
      return []; // No Eulerian path
    }
  }

  if (startNodes > 1 || endNodes > 1) return [];

  // Hierholzer's algorithm
  const edgeIdx = new Map<number, number>();
  for (const [u] of graph.entries()) {
    edgeIdx.set(u, 0);
  }

  const path: number[] = [];
  const stack: number[] = [start];

  while (stack.length > 0) {
    const u = stack[stack.length - 1];
    const idx = edgeIdx.get(u) ?? 0;
    const neighbors = graph.get(u) ?? [];

    if (idx < neighbors.length) {
      edgeIdx.set(u, idx + 1);
      stack.push(neighbors[idx]);
    } else {
      path.push(stack.pop()!);
    }
  }

  path.reverse();
  return path;
}`
        }
      ],
      useCases: [
        'DNA fragment assembly: Eulerian path in de Bruijn graphs',
        'Chinese postman problem: find minimum weight walk visiting all edges',
        'Circuit board routing: trace all connections without lifting the pen',
        'Network protocol testing: traverse all links exactly once',
        'The original Konigsberg bridge problem that started graph theory'
      ],
      commonPitfalls: [
        'Confusing Eulerian (every edge) with Hamiltonian (every vertex)',
        'Not checking connectivity — conditions require the graph to be connected',
        'Directed vs undirected conditions are different — know both',
        'Hierholzer: not using edge index tracking — revisiting edges produces wrong result'
      ],
      interviewTips: [
        '"Reconstruct itinerary" (Leetcode 332) is a classic Eulerian path problem',
        'Know the degree conditions cold — they are quick to check and prove existence',
        'If asked for Hamiltonian path, it is NP-complete — there is no efficient algorithm',
        'Mention de Bruijn sequences/graphs as an application — shows breadth of knowledge'
      ],
      relatedConcepts: ['hamiltonian-path', 'dfs', 'de-bruijn-graph', 'chinese-postman'],
      difficulty: 'advanced',
      tags: ['path', 'circuit', 'edge-traversal', 'degree'],
      proTip: 'De Bruijn sequences (sequences containing every possible k-length substring over an alphabet) are constructed by finding Eulerian circuits in de Bruijn graphs. This connection between combinatorics and graph theory is used in DNA sequencing (shotgun assembly) and in generating test patterns for digital circuits.'
    },
    {
      id: 'bipartite-check',
      title: 'Bipartite Check',
      description: 'A graph is bipartite if its vertices can be colored with two colors such that no two adjacent vertices share the same color. Equivalently, a graph is bipartite iff it contains no odd-length cycles. BFS or DFS 2-coloring checks bipartiteness in O(V+E). Bipartite graphs are the foundation for matching algorithms, scheduling problems, and many optimization problems.',
      timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'Bipartite iff no odd-length cycle exists',
        '2-coloring: BFS/DFS, assign alternating colors, detect conflict',
        'All trees are bipartite (no cycles at all)',
        'All even-length cycle graphs are bipartite',
        'Bipartite graph enables maximum matching (Hungarian algorithm, Hopcroft-Karp)',
        'Konig theorem: in bipartite graphs, max matching = min vertex cover',
        'Applications: job assignment, stable matching, network flow',
        'Can handle disconnected graphs: check each component independently'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Bipartite Check via BFS 2-Coloring',
          code: `function isBipartite(graph: Map<number, number[]>, n: number): boolean {
  const color = new Array(n).fill(-1);

  for (let start = 0; start < n; start++) {
    if (color[start] !== -1) continue;

    // BFS 2-coloring
    const queue: number[] = [start];
    color[start] = 0;

    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const v of graph.get(u) ?? []) {
        if (color[v] === -1) {
          color[v] = 1 - color[u]; // Alternate color
          queue.push(v);
        } else if (color[v] === color[u]) {
          return false; // Odd cycle found
        }
      }
    }
  }

  return true;
}`
        }
      ],
      useCases: [
        'Job assignment: workers on one side, jobs on the other',
        'Course scheduling: students vs time slots',
        'Network flow modeling: bipartite matching',
        'Detecting impossible coloring constraints',
        'Graph problems that become easier when graph is bipartite'
      ],
      commonPitfalls: [
        'Not handling disconnected graphs — must check all components',
        'Confusing vertex coloring (2-color) with edge coloring',
        'Assuming directed graphs are bipartite — bipartiteness is typically for undirected graphs'
      ],
      interviewTips: [
        '"Is graph bipartite?" is a common BFS/DFS interview question',
        'Key insight: try 2-coloring with BFS, any conflict means not bipartite',
        'If asked "can we split students into two groups with no conflicts": bipartite check',
        'Know Konig theorem: max matching = min vertex cover in bipartite graphs'
      ],
      relatedConcepts: ['bfs', 'dfs', 'graph-coloring', 'maximum-matching'],
      difficulty: 'intermediate',
      tags: ['coloring', 'bipartite', 'bfs', 'dfs'],
      proTip: 'Many graph problems have polynomial-time solutions on bipartite graphs but are NP-hard on general graphs. Maximum independent set, minimum vertex cover, and graph coloring are all examples. Always check if your graph is bipartite first — it might unlock a much simpler algorithm.'
    }
  ]
}
