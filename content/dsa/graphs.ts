// @ts-nocheck
import type { Category } from '@/lib/types'

export const graphsCategory: Category = {
  id: 'graphs',
  title: 'Graphs',
  description: 'Representations, properties, and structural algorithms for graphs — from topological sort and strongly connected components to maximum flow, matching, and planarity. The algorithms that power compilers, networks, and logistics.',
  icon: '🕸️',
  concepts: [
    {
      id: 'graph-representations',
      title: 'Graph Representations',
      description:
        'The three primary ways to store a graph in memory — adjacency matrix, adjacency list, and edge list — each optimized for different operations. The choice determines the complexity of common operations: edge existence check is O(1) with a matrix but O(degree) with a list; iterating all neighbors is O(V) with a matrix but O(degree) with a list. Most algorithms use adjacency lists because real-world graphs are sparse (E << V^2).',
      timeComplexity: {
        best: 'O(1) — edge check in adjacency matrix',
        average: 'Depends on representation and operation',
        worst: 'O(V^2) space for adjacency matrix',
      },
      spaceComplexity: 'Matrix: O(V^2), List: O(V+E), Edge list: O(E)',
      keyPoints: [
        'Adjacency matrix: V*V boolean/weight array; O(1) edge check; O(V^2) space regardless of edge count',
        'Adjacency list: array of lists; space O(V+E); iterate neighbors O(degree); edge check O(degree)',
        'Edge list: array of (u, v, w) tuples; space O(E); useful for Kruskal and Bellman-Ford',
        'Sparse graph (E ≈ V): adjacency list saves O(V^2 - V) space over matrix',
        'Dense graph (E ≈ V^2): adjacency matrix is competitive and simpler for matrix-based algorithms',
        'Incidence matrix: V*E matrix, rarely used in practice but appears in theory (Kirchhoff)',
        'Weighted graph: adjacency list stores (neighbor, weight) pairs; matrix stores weights (0 or infinity for no edge)',
        'Directed graph: adjacency list for u contains v if edge u→v exists; matrix is asymmetric',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Graph Representations',
          code: `// Adjacency List (most common)
class GraphAdjList {
  private adj: Map<number, [number, number][]> = new Map(); // node -> [(neighbor, weight)]

  addEdge(u: number, v: number, weight = 1, directed = false): void {
    if (!this.adj.has(u)) this.adj.set(u, []);
    this.adj.get(u)!.push([v, weight]);
    if (!directed) {
      if (!this.adj.has(v)) this.adj.set(v, []);
      this.adj.get(v)!.push([u, weight]);
    }
  }

  neighbors(u: number): [number, number][] {
    return this.adj.get(u) ?? [];
  }
}

// Adjacency Matrix (for dense graphs)
class GraphMatrix {
  private matrix: number[][];

  constructor(private n: number) {
    this.matrix = Array.from({ length: n }, () => new Array(n).fill(Infinity));
    for (let i = 0; i < n; i++) this.matrix[i][i] = 0;
  }

  addEdge(u: number, v: number, weight = 1, directed = false): void {
    this.matrix[u][v] = weight;
    if (!directed) this.matrix[v][u] = weight;
  }

  hasEdge(u: number, v: number): boolean {
    return this.matrix[u][v] !== Infinity;
  }

  getWeight(u: number, v: number): number {
    return this.matrix[u][v];
  }
}

// Edge List (for Kruskal, Bellman-Ford)
interface Edge {
  u: number;
  v: number;
  weight: number;
}

function bellmanFord(edges: readonly Edge[], n: number, source: number): number[] {
  const dist = new Array(n).fill(Infinity);
  dist[source] = 0;
  for (let i = 0; i < n - 1; i++) {
    for (const { u, v, weight } of edges) {
      if (dist[u] !== Infinity && dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
      }
    }
  }
  return dist;
}`,
        },
      ],
      useCases: [
        'Social networks: adjacency list (sparse, billions of nodes, average 200 friends)',
        'Dense graphs / Floyd-Warshall: adjacency matrix (all-pairs shortest paths)',
        'Edge-centric algorithms: edge list (Kruskal MST, Bellman-Ford)',
        'Bipartite matching: adjacency list with capacity tracking',
      ],
      commonPitfalls: [
        'Using adjacency matrix for sparse graph: wastes O(V^2) space when O(V) would suffice',
        'Forgetting to add reverse edge for undirected graphs in adjacency list',
        'Self-loops: adjacency matrix diagonal may need special handling',
        'Parallel edges: adjacency list allows them, matrix overwrites — clarify graph constraints',
      ],
      interviewTips: [
        'Default to adjacency list unless the problem specifically benefits from matrix (Floyd-Warshall, dense graph)',
        'Know time/space tradeoffs for each representation — this is asked directly in interviews',
        'For weighted graphs, adjacency list stores (neighbor, weight) pairs — not just neighbor',
      ],
      relatedConcepts: ['graph-properties', 'topological-sort', 'strongly-connected-components'],
      difficulty: 'beginner',
      tags: ['graph', 'adjacency-matrix', 'adjacency-list', 'edge-list'],
      proTip:
        'In system design, graph representation choice matters enormously at scale. Facebook stores social graph as adjacency lists in TAO (distributed graph store), not as a matrix, because the graph is extremely sparse: 2 billion users * 200 average friends = 400 billion edges, but a matrix would need 4 * 10^18 entries.',
    },
    {
      id: 'graph-properties',
      title: 'Graph Properties',
      description:
        'Fundamental properties that classify graphs and determine which algorithms apply. Directed vs undirected affects path semantics. Weighted vs unweighted determines shortest-path algorithm choice. DAG (directed acyclic graph) enables topological sort. Bipartite enables efficient matching. Connected components determine graph structure. Knowing these properties is the first step in solving any graph problem.',
      spaceComplexity: 'N/A — properties of the graph, not a data structure',
      keyPoints: [
        'Directed: edges have direction (u→v ≠ v→u); undirected: edges are symmetric',
        'Weighted: edges have costs; unweighted: all edges have unit cost',
        'DAG: directed graph with no cycles; enables topological sort, shortest paths in O(V+E)',
        'Bipartite: vertices can be 2-colored such that no adjacent vertices share a color; checked via BFS/DFS',
        'Connected: every vertex reachable from every other (undirected); strongly connected (directed)',
        'Complete graph K_n: every pair of vertices connected; E = n*(n-1)/2 for undirected',
        'Planar: can be drawn on a plane without edge crossings; E ≤ 3V - 6 (Euler\'s formula)',
        'Sparse: E = O(V); Dense: E = O(V^2); most real-world graphs are sparse',
        'Tree: connected acyclic undirected graph with exactly V-1 edges',
      ],
      useCases: [
        'Algorithm selection: BFS for unweighted shortest path, Dijkstra for weighted, topological sort for DAG',
        'Bipartite check: job matching, course scheduling, 2-coloring problems',
        'Connectivity: finding articulation points, bridges, connected components',
        'DAG detection: cycle detection determines if topological ordering is possible',
      ],
      commonPitfalls: [
        'Applying Dijkstra to negative-weight graphs: use Bellman-Ford instead',
        'Assuming undirected graph is a DAG: undirected connected graph with V-1 edges is a tree, V+ edges has cycles',
        'Confusing connected (undirected) with strongly connected (directed)',
        'Forgetting that a tree is a special case of a graph: connected, acyclic, V-1 edges',
      ],
      interviewTips: [
        'First question for any graph problem: "directed or undirected? weighted or unweighted? cyclic or acyclic?"',
        'Know the algorithm selection table: unweighted→BFS, non-negative weights→Dijkstra, negative weights→Bellman-Ford, DAG→topological relaxation',
        'Bipartite check: BFS with 2-coloring — if adjacent vertices have same color, not bipartite',
      ],
      relatedConcepts: ['graph-representations', 'topological-sort', 'bipartite-graph'],
      difficulty: 'beginner',
      tags: ['graph', 'properties', 'directed', 'weighted', 'bipartite', 'dag'],
      proTip:
        'The single most important graph property to identify is whether the graph is a DAG. If it is, you get topological sort for free, which unlocks linear-time shortest paths (relax edges in topological order) and many DP formulations. If asked "shortest path in a DAG", the answer is NOT Dijkstra — it is topological sort + relax in O(V+E).',
    },
    {
      id: 'topological-sort',
      title: 'Topological Sort',
      description:
        'A linear ordering of vertices in a DAG such that for every directed edge u→v, u appears before v. Two approaches: Kahn\'s algorithm (BFS-based, iteratively removes vertices with in-degree 0) and DFS-based (reverse post-order). Topological sort is the backbone of dependency resolution — build systems, course scheduling, and task ordering all reduce to it.',
      timeComplexity: {
        best: 'O(V + E)',
        average: 'O(V + E)',
        worst: 'O(V + E)',
      },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'Only works on DAGs: if cycle exists, topological ordering is impossible',
        'Kahn\'s (BFS): compute in-degrees, enqueue vertices with in-degree 0, dequeue and reduce neighbors\' in-degrees',
        'Kahn\'s simultaneously detects cycles: if output has fewer than V vertices, a cycle exists',
        'DFS-based: run DFS, add vertex to result AFTER all descendants are processed (reverse post-order)',
        'DFS-based detects cycles: if you visit a vertex that is currently on the stack (gray in 3-color DFS)',
        'Multiple valid orderings exist unless the DAG is a total order (single path)',
        'All valid orderings: backtracking (enumerate by choosing among all 0-in-degree vertices at each step)',
        'Longest path in DAG: negate weights and run shortest path in topological order, or DP directly',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Kahn\'s Algorithm and DFS Topological Sort',
          code: `// Kahn's Algorithm (BFS-based)
function kahnTopSort(n: number, edges: readonly [number, number][]): number[] | null {
  const adj: number[][] = Array.from({ length: n }, () => []);
  const inDegree = new Array(n).fill(0);

  for (const [u, v] of edges) {
    adj[u].push(v);
    inDegree[v]++;
  }

  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const result: number[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    result.push(u);
    for (const v of adj[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    }
  }

  return result.length === n ? result : null; // null if cycle detected
}

// DFS-based Topological Sort
function dfsTopSort(n: number, edges: readonly [number, number][]): number[] | null {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) adj[u].push(v);

  const result: number[] = [];
  const state = new Array(n).fill(0); // 0=white, 1=gray, 2=black

  function dfs(u: number): boolean {
    state[u] = 1; // gray = in progress
    for (const v of adj[u]) {
      if (state[v] === 1) return false; // back edge = cycle
      if (state[v] === 0 && !dfs(v)) return false;
    }
    state[u] = 2; // black = done
    result.push(u);
    return true;
  }

  for (let i = 0; i < n; i++) {
    if (state[i] === 0 && !dfs(i)) return null;
  }

  return result.reverse();
}`,
        },
      ],
      useCases: [
        'Build systems: compile dependencies in correct order (Make, Gradle, Webpack)',
        'Course scheduling: prerequisites form a DAG, topological order gives a valid schedule',
        'Task scheduling with dependencies: project management (Gantt charts)',
        'Package managers: resolve dependency order (npm, pip, apt)',
      ],
      commonPitfalls: [
        'Not checking for cycles: topological sort only works on DAGs — always verify or detect',
        'Using Array.shift() in Kahn\'s: O(n) per dequeue — use proper queue or pointer',
        'DFS-based: forgetting to REVERSE the post-order to get topological order',
        'Assuming unique ordering: multiple valid orderings exist — specify "any valid ordering" or "lexicographically smallest"',
      ],
      interviewTips: [
        'Know both approaches: Kahn\'s is intuitive (remove leaves), DFS is more concise',
        'Kahn\'s is better for "detect cycles + topological sort" in one pass',
        'If asked for "all valid orderings", use backtracking: at each step, choose any vertex with in-degree 0',
      ],
      relatedConcepts: ['graph-properties', 'strongly-connected-components', 'dfs-bfs'],
      difficulty: 'intermediate',
      tags: ['topological-sort', 'dag', 'dependency', 'kahn'],
      proTip:
        'When a problem says "find a valid ordering given constraints", translate constraints into edges and run topological sort. If the problem says "find the lexicographically smallest ordering", use Kahn\'s with a min-heap instead of a regular queue — this gives the smallest valid topological order.',
    },
    {
      id: 'strongly-connected-components',
      title: 'Strongly Connected Components',
      description:
        'In a directed graph, a strongly connected component (SCC) is a maximal set of vertices where every vertex is reachable from every other vertex in the set. Tarjan\'s algorithm uses DFS with a stack and "low-link" values to find all SCCs in O(V+E). Kosaraju\'s algorithm runs two DFS passes: one to compute finish order, one on the transposed graph. The condensation of SCCs forms a DAG, enabling topological reasoning on the simplified structure.',
      timeComplexity: {
        best: 'O(V + E)',
        average: 'O(V + E)',
        worst: 'O(V + E)',
      },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'SCC: maximal set where every vertex can reach every other vertex via directed paths',
        'Tarjan\'s: DFS with discovery time (disc) and low-link value (low); SCC root: disc[v] == low[v]',
        'Low-link: lowest discovery time reachable from v through DFS tree + back edges',
        'Tarjan\'s stack: pop all vertices down to the SCC root when found — they form one SCC',
        'Kosaraju\'s: (1) DFS to compute finish order, (2) transpose graph, (3) DFS in reverse finish order — each DFS tree = one SCC',
        'Condensation DAG: collapse each SCC to a single vertex — resulting graph is a DAG',
        'Applications: compiler optimization (strongly connected = mutual recursion), web graph analysis, 2-SAT',
        '2-SAT: build implication graph, find SCCs — satisfiable iff no variable and its negation are in same SCC',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Tarjan\'s SCC Algorithm',
          code: `function tarjanSCC(n: number, adj: readonly number[][]): number[][] {
  const disc = new Array(n).fill(-1);
  const low = new Array(n).fill(-1);
  const onStack = new Array(n).fill(false);
  const stack: number[] = [];
  const result: number[][] = [];
  let timer = 0;

  function dfs(u: number): void {
    disc[u] = low[u] = timer++;
    stack.push(u);
    onStack[u] = true;

    for (const v of adj[u]) {
      if (disc[v] === -1) {
        dfs(v);
        low[u] = Math.min(low[u], low[v]);
      } else if (onStack[v]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }

    // If u is root of an SCC
    if (disc[u] === low[u]) {
      const component: number[] = [];
      let w: number;
      do {
        w = stack.pop()!;
        onStack[w] = false;
        component.push(w);
      } while (w !== u);
      result.push(component);
    }
  }

  for (let i = 0; i < n; i++) {
    if (disc[i] === -1) dfs(i);
  }

  return result;
}`,
        },
      ],
      useCases: [
        '2-SAT satisfiability checking',
        'Web graph analysis: finding communities/clusters',
        'Compiler optimization: identifying mutually recursive functions',
        'Simplifying directed graphs by condensing SCCs into a DAG',
      ],
      commonPitfalls: [
        'Tarjan\'s: updating low-link with disc[v] (not low[v]) for vertices on stack — both variants exist but they differ subtly',
        'Tarjan\'s: using low[v] for cross edges to vertices on stack vs disc[v] — the "on stack" check is critical',
        'Kosaraju\'s: forgetting to transpose the graph for the second DFS pass',
        'Not recognizing that condensation is a DAG — enables topological sort on the component graph',
      ],
      interviewTips: [
        'Tarjan\'s is more commonly asked because it runs in a single DFS pass',
        'Know the low-link invariant: low[u] = min(disc[u], disc[w] for w reachable from u on stack)',
        'If asked about 2-SAT: "build implication graph, find SCCs with Tarjan\'s, check x and !x not in same SCC"',
      ],
      relatedConcepts: ['topological-sort', 'graph-properties', 'graph-representations'],
      difficulty: 'advanced',
      tags: ['scc', 'tarjan', 'kosaraju', 'condensation'],
      proTip:
        'The condensation DAG is a powerful abstraction. After finding SCCs, collapse each to a single node. The resulting DAG enables topological sort, and properties of the original graph can be computed on the smaller DAG. For example, "minimum number of edges to add to make the graph strongly connected" = max(number of sources, number of sinks) in the condensation DAG.',
    },
    {
      id: 'bipartite-graph',
      title: 'Bipartite Graph',
      description:
        'A graph whose vertices can be partitioned into two disjoint sets such that every edge connects a vertex in one set to a vertex in the other. Equivalently, a graph is bipartite iff it contains no odd-length cycles. Testing bipartiteness is done via BFS 2-coloring in O(V+E). Konig\'s theorem connects maximum matching and minimum vertex cover in bipartite graphs, and Hopcroft-Karp finds maximum matching in O(E*sqrt(V)).',
      timeComplexity: {
        best: 'O(V + E) — bipartite check',
        average: 'O(E * sqrt(V)) — Hopcroft-Karp maximum matching',
        worst: 'O(V * E) — naive augmenting path matching',
      },
      spaceComplexity: 'O(V + E)',
      keyPoints: [
        'Bipartite check: BFS from any vertex, alternating colors; fail if adjacent vertices have same color',
        'No odd cycles: bipartite iff every cycle has even length',
        'Konig\'s theorem: in bipartite graph, max matching = min vertex cover (NOT true in general graphs)',
        'Maximum matching: augmenting path algorithm — find a path from unmatched left to unmatched right alternating matched/unmatched edges',
        'Hopcroft-Karp: find maximal set of shortest augmenting paths per BFS phase — O(E * sqrt(V))',
        'Hungarian algorithm: optimal assignment in weighted bipartite graph — O(V^3)',
        'Hall\'s theorem: perfect matching from A to B exists iff for every subset S of A, |N(S)| >= |S|',
        'Applications: job assignment, stable matching, course allocation, two-coloring problems',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Bipartite Check & Maximum Matching',
          code: `// Bipartite check via BFS 2-coloring
function isBipartite(n: number, adj: readonly number[][]): boolean {
  const color = new Array(n).fill(-1);
  for (let start = 0; start < n; start++) {
    if (color[start] !== -1) continue;
    color[start] = 0;
    const queue = [start];
    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const v of adj[u]) {
        if (color[v] === -1) {
          color[v] = 1 - color[u];
          queue.push(v);
        } else if (color[v] === color[u]) {
          return false;
        }
      }
    }
  }
  return true;
}

// Maximum bipartite matching (Hungarian/augmenting path)
function maxMatching(n: number, m: number, adj: readonly number[][]): number {
  // n = left vertices (0..n-1), m = right vertices (0..m-1)
  // adj[u] = list of right vertices u can match with
  const matchL = new Array(n).fill(-1);
  const matchR = new Array(m).fill(-1);

  function dfs(u: number, visited: boolean[]): boolean {
    for (const v of adj[u]) {
      if (visited[v]) continue;
      visited[v] = true;
      if (matchR[v] === -1 || dfs(matchR[v], visited)) {
        matchL[u] = v;
        matchR[v] = u;
        return true;
      }
    }
    return false;
  }

  let matching = 0;
  for (let u = 0; u < n; u++) {
    const visited = new Array(m).fill(false);
    if (dfs(u, visited)) matching++;
  }
  return matching;
}`,
        },
      ],
      useCases: [
        'Job assignment: workers to tasks with compatibility constraints',
        'Stable matching: Gale-Shapley algorithm for college admissions',
        'Graph coloring: bipartite graphs are 2-colorable',
        'Network flow: bipartite matching reduces to max flow',
      ],
      commonPitfalls: [
        'BFS coloring: must handle disconnected graphs — run BFS from each unvisited vertex',
        'Augmenting path: must alternate between matched and unmatched edges',
        'Assuming Konig\'s theorem works for general graphs: it is specific to bipartite graphs',
        'Hopcroft-Karp: the BFS phase finds shortest augmenting paths, DFS phase augments along them — must do both',
      ],
      interviewTips: [
        'Bipartite check is a common graph problem: BFS with 2-coloring is the cleanest approach',
        'Know Konig\'s theorem for system design: it connects matching (resource allocation) with covering (minimum guards)',
        'Maximum matching is often asked as a follow-up to bipartite check',
      ],
      relatedConcepts: ['graph-properties', 'maximum-flow', 'matching'],
      difficulty: 'intermediate',
      tags: ['bipartite', '2-coloring', 'matching', 'konig'],
      proTip:
        'Many problems that do not look like bipartite matching are actually bipartite matching in disguise. "Maximum number of non-overlapping intervals" is a matching problem. "Minimum number of lines to cover all points in a matrix" is Konig\'s theorem. When you see "assign X to Y with constraints", try modeling as bipartite matching.',
    },
    {
      id: 'maximum-flow',
      title: 'Maximum Flow',
      description:
        'Given a directed graph with edge capacities, find the maximum flow from source s to sink t. Ford-Fulkerson repeatedly finds augmenting paths (s to t with residual capacity > 0) and pushes flow. Edmonds-Karp (BFS for shortest augmenting path) runs in O(VE^2). Dinic\'s algorithm uses blocking flows on level graphs for O(V^2*E). The max-flow min-cut theorem states that maximum flow equals the capacity of the minimum cut separating s and t.',
      timeComplexity: {
        best: 'O(VE) — Dinic on unit-capacity graphs',
        average: 'O(VE^2) — Edmonds-Karp',
        worst: 'O(V^2 * E) — Dinic\'s algorithm',
      },
      spaceComplexity: 'O(V + E)',
      keyPoints: [
        'Residual graph: for each edge (u,v) with capacity c and flow f, residual capacity = c-f forward, f backward',
        'Augmenting path: path from s to t in residual graph with all edges having positive residual capacity',
        'Ford-Fulkerson: find any augmenting path (DFS), push bottleneck flow — may not terminate for irrational capacities',
        'Edmonds-Karp: use BFS for shortest augmenting path — guarantees O(VE^2) and always terminates',
        'Dinic\'s: build level graph (BFS), find blocking flow (DFS with pruning), repeat — O(V^2*E)',
        'Max-flow min-cut theorem: max flow = min cut = minimum total capacity of edges whose removal disconnects s from t',
        'Bipartite matching reduces to max flow: source → left vertices → right vertices → sink, all capacity 1',
        'Applications: network routing, image segmentation, project selection, baseball elimination',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Dinic\'s Max Flow Algorithm',
          code: `class MaxFlow {
  private adj: number[][]; // adjacency list of edge indices
  private to: number[] = [];
  private cap: number[] = [];
  private level: number[];
  private iter: number[];
  private n: number;

  constructor(n: number) {
    this.n = n;
    this.adj = Array.from({ length: n }, () => []);
    this.level = new Array(n);
    this.iter = new Array(n);
  }

  addEdge(from: number, to: number, capacity: number): void {
    this.adj[from].push(this.to.length);
    this.to.push(to);
    this.cap.push(capacity);
    this.adj[to].push(this.to.length);
    this.to.push(from);
    this.cap.push(0); // reverse edge with 0 capacity
  }

  private bfs(s: number): boolean {
    this.level.fill(-1);
    this.level[s] = 0;
    const queue = [s];
    let head = 0;
    while (head < queue.length) {
      const v = queue[head++];
      for (const eid of this.adj[v]) {
        if (this.cap[eid] > 0 && this.level[this.to[eid]] === -1) {
          this.level[this.to[eid]] = this.level[v] + 1;
          queue.push(this.to[eid]);
        }
      }
    }
    return this.level[this.n - 1] !== -1;
  }

  private dfs(v: number, t: number, pushed: number): number {
    if (v === t) return pushed;
    for (; this.iter[v] < this.adj[v].length; this.iter[v]++) {
      const eid = this.adj[v][this.iter[v]];
      const u = this.to[eid];
      if (this.cap[eid] > 0 && this.level[u] === this.level[v] + 1) {
        const flow = this.dfs(u, t, Math.min(pushed, this.cap[eid]));
        if (flow > 0) {
          this.cap[eid] -= flow;
          this.cap[eid ^ 1] += flow; // reverse edge
          return flow;
        }
      }
    }
    return 0;
  }

  maxflow(s: number, t: number): number {
    let flow = 0;
    while (this.bfs(s)) {
      this.iter.fill(0);
      let pushed: number;
      while ((pushed = this.dfs(s, t, Infinity)) > 0) {
        flow += pushed;
      }
    }
    return flow;
  }
}`,
        },
      ],
      useCases: [
        'Network bandwidth optimization',
        'Bipartite matching (reduction to max flow)',
        'Image segmentation (min-cut on pixel graph)',
        'Project selection with dependencies and profits',
      ],
      commonPitfalls: [
        'Ford-Fulkerson with DFS may not terminate for irrational capacities — use Edmonds-Karp (BFS)',
        'Forgetting reverse edges in residual graph: every edge needs a reverse edge with 0 initial capacity',
        'Edge indexing: reverse edge of edge i is at index i^1 (XOR with 1) — requires adding edges in pairs',
        'Min-cut finding: after max flow, vertices reachable from s in residual graph form the s-side of min-cut',
      ],
      interviewTips: [
        'Know the max-flow min-cut theorem — it connects flow optimization with graph separation',
        'Bipartite matching as max flow is a common reduction to explain',
        'Dinic\'s is preferred over Edmonds-Karp for implementation: O(V^2*E) vs O(VE^2)',
      ],
      relatedConcepts: ['bipartite-graph', 'minimum-cut', 'graph-representations'],
      difficulty: 'expert',
      tags: ['max-flow', 'min-cut', 'dinic', 'ford-fulkerson', 'network-flow'],
      proTip:
        'The eid ^ 1 trick for accessing reverse edges is the critical implementation detail of max flow. When you add edge (u, v, cap), you also add reverse edge (v, u, 0) immediately after. Since they are consecutive in the edge array, XORing the index with 1 toggles between forward and reverse. This is why edges must be added in pairs.',
    },
    {
      id: 'minimum-cut',
      title: 'Minimum Cut',
      description:
        'A cut is a partition of vertices into two sets S and T such that s is in S and t is in T. The capacity of the cut is the sum of capacities of edges from S to T. The max-flow min-cut theorem proves that the minimum cut capacity equals the maximum flow. Global minimum cut (not restricted to specific s and t) can be found by Karger\'s randomized algorithm in O(V^2) or Stoer-Wagner in O(VE + V^2 log V).',
      timeComplexity: {
        best: 'O(V^2) — Karger\'s (randomized, high-probability)',
        average: 'O(V^2 * E) — via max-flow (Dinic\'s)',
        worst: 'O(V^2 * E)',
      },
      spaceComplexity: 'O(V + E)',
      keyPoints: [
        'ST min-cut: run max flow from s to t; vertices reachable from s in residual graph form S-side',
        'Max-flow min-cut theorem: value of max flow = capacity of min cut — fundamental duality',
        'Cut edges: edges from S to T with full capacity (flow = capacity) in the max-flow solution',
        'Global min cut: minimum over all possible (s,t) pairs — does not require specifying s and t',
        'Karger\'s algorithm: randomly contract edges, probability of finding min cut is >= 1/C(n,2)',
        'Run Karger\'s O(n^2 log n) times for high probability: total O(n^4 log n), or use Karger-Stein for O(n^2 log^3 n)',
        'Stoer-Wagner: deterministic global min cut in O(VE + V^2 log V) — practical for undirected graphs',
        'Applications: network reliability (smallest failure to disconnect), image segmentation',
      ],
      useCases: [
        'Network reliability: finding the minimum number of links whose failure disconnects the network',
        'Image segmentation: min-cut on pixel adjacency graph (foreground vs background)',
        'Clustering: finding natural partitions in data (normalized cuts)',
        'Circuit design: minimizing wire cuts between partitions',
      ],
      commonPitfalls: [
        'Confusing min-cut with minimum edge cut (unweighted) — min-cut considers edge capacities/weights',
        'Finding the actual cut (not just the value): must trace reachable vertices from s in residual graph after max flow',
        'Karger\'s is for undirected graphs — directed min-cut is fundamentally different',
        'Global min cut is NOT the same as min ST-cut for arbitrary s,t — global considers all pairs',
      ],
      interviewTips: [
        'Max-flow min-cut theorem is one of the most important results in combinatorial optimization — know it',
        'For system design: "what is the minimum number of servers whose failure disconnects the network?" is min-cut',
        'Karger\'s algorithm is a beautiful application of randomization — know the probability analysis',
      ],
      relatedConcepts: ['maximum-flow', 'graph-properties', 'bipartite-graph'],
      difficulty: 'expert',
      tags: ['min-cut', 'max-flow', 'karger', 'network-reliability'],
      proTip:
        'Image segmentation via graph cuts is one of the most successful applications of min-cut in practice. Model pixels as vertices, adjacent pixels as edges with capacity proportional to similarity, add source (foreground) and sink (background) connections based on user input, then run min-cut. The cut separates foreground from background optimally. This technique powers the "intelligent scissors" and "GrabCut" tools in image editors.',
    },
    {
      id: 'matching',
      title: 'Matching',
      description:
        'A matching is a set of edges with no shared vertices. Maximum matching finds the largest such set. In bipartite graphs, augmenting path algorithms and Hopcroft-Karp give efficient solutions. In general graphs, Edmonds\' Blossom algorithm handles odd cycles by "shrinking" them. The Hungarian algorithm finds minimum-weight perfect matching in O(V^3) for weighted bipartite graphs.',
      timeComplexity: {
        best: 'O(E * sqrt(V)) — Hopcroft-Karp for bipartite',
        average: 'O(V^3) — Hungarian for weighted bipartite',
        worst: 'O(V^3) — Blossom for general graphs',
      },
      spaceComplexity: 'O(V + E)',
      keyPoints: [
        'Matching: set of edges with no common vertices; maximum matching has the most edges',
        'Perfect matching: every vertex is matched (only if |V| is even and matching exists)',
        'Augmenting path: path from unmatched vertex to unmatched vertex alternating unmatched/matched edges',
        'Berge\'s theorem: matching is maximum iff no augmenting path exists',
        'Bipartite: Hopcroft-Karp finds maximum matching in O(E*sqrt(V)) using BFS + DFS phases',
        'Weighted bipartite: Hungarian algorithm finds min-cost perfect matching in O(V^3)',
        'General graphs: Edmonds\' Blossom algorithm shrinks odd cycles (blossoms) to handle non-bipartite cases',
        'Applications: job assignment, stable marriage (Gale-Shapley), organ donor matching',
      ],
      useCases: [
        'Job/resource assignment: assign workers to tasks maximizing total assignments',
        'Stable matching: Gale-Shapley for college admissions, medical residency matching (NRMP)',
        'Scheduling: pairing events to time slots without conflicts',
        'Network design: pairing up communication endpoints',
      ],
      commonPitfalls: [
        'Bipartite matching algorithms do not work for general graphs: odd cycles need blossom shrinking',
        'Hungarian algorithm is for WEIGHTED matching, not just max cardinality — different problems',
        'Augmenting path must alternate correctly: unmatched → matched → unmatched → matched → ... → unmatched',
        'Gale-Shapley gives proposer-optimal matching: the proposing side gets their best possible stable match',
      ],
      interviewTips: [
        'Know bipartite matching via augmenting paths — this is the most commonly asked matching algorithm',
        'Hungarian algorithm is relevant for assignment problems: "assign n workers to n jobs minimizing cost"',
        'Stable matching (Gale-Shapley) is a common interview topic: know it runs in O(n^2) and is proposer-optimal',
      ],
      relatedConcepts: ['bipartite-graph', 'maximum-flow', 'graph-properties'],
      difficulty: 'expert',
      tags: ['matching', 'hungarian', 'blossom', 'augmenting-path'],
      proTip:
        'The National Resident Matching Program (NRMP) — which matches medical students to residency programs in the US — uses a variant of Gale-Shapley. It processes ~40,000 applicants annually. Understanding that this real-world system is literally a bipartite matching algorithm makes the abstract theory concrete and interview-ready.',
    },
    {
      id: 'euler-path-circuit',
      title: 'Euler Path/Circuit',
      description:
        'An Euler path visits every EDGE exactly once. An Euler circuit is an Euler path that starts and ends at the same vertex. Existence conditions are simple: a circuit exists iff every vertex has even degree (undirected) or equal in-degree and out-degree (directed). Hierholzer\'s algorithm constructs the Euler circuit in O(E) by building cycles and merging them.',
      timeComplexity: {
        best: 'O(E)',
        average: 'O(E)',
        worst: 'O(E)',
      },
      spaceComplexity: 'O(V + E)',
      keyPoints: [
        'Euler CIRCUIT (undirected): exists iff every vertex has even degree and graph is connected',
        'Euler PATH (undirected): exists iff exactly 0 or 2 vertices have odd degree',
        'Euler CIRCUIT (directed): exists iff every vertex has equal in-degree and out-degree',
        'Euler PATH (directed): exists iff at most one vertex has out-deg = in-deg + 1 (start) and at most one has in-deg = out-deg + 1 (end)',
        'Hierholzer\'s algorithm: start at any vertex, follow edges (removing them), when stuck you have found a cycle; repeat from any vertex on the cycle that still has unused edges',
        'Implementation: use a stack for DFS, append to result when backtracking — produces reverse order',
        'Euler vs Hamiltonian: Euler visits every EDGE once; Hamiltonian visits every VERTEX once',
        'Hamiltonian path is NP-complete; Euler path is O(E) — very different complexity despite similar names',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Hierholzer\'s Algorithm for Euler Circuit',
          code: `// Euler circuit for directed graph
function eulerCircuit(n: number, edges: [number, number][]): number[] | null {
  // Build adjacency list with edge tracking
  const adj: number[][] = Array.from({ length: n }, () => []);
  const inDeg = new Array(n).fill(0);
  const outDeg = new Array(n).fill(0);

  for (const [u, v] of edges) {
    adj[u].push(v);
    outDeg[u]++;
    inDeg[v]++;
  }

  // Check Euler circuit condition
  for (let i = 0; i < n; i++) {
    if (inDeg[i] !== outDeg[i]) return null;
  }

  // Hierholzer's algorithm
  const result: number[] = [];
  const stack: number[] = [0];
  // Track next unused edge for each vertex
  const edgePtr = new Array(n).fill(0);

  while (stack.length > 0) {
    const v = stack[stack.length - 1];
    if (edgePtr[v] < adj[v].length) {
      const next = adj[v][edgePtr[v]++];
      stack.push(next);
    } else {
      result.push(stack.pop()!);
    }
  }

  result.reverse();

  // Verify all edges used
  if (result.length !== edges.length + 1) return null;
  return result;
}`,
        },
      ],
      useCases: [
        'Route planning: mail delivery route that traverses every street exactly once',
        'DNA fragment assembly: de Bruijn graph Euler path reconstructs the sequence',
        'Network testing: visit every connection exactly once',
        'Chinese postman problem: find minimum weight walk that visits every edge (extends Euler circuit)',
      ],
      commonPitfalls: [
        'Confusing Euler (edges) with Hamiltonian (vertices): completely different problems and complexities',
        'Forgetting connectivity check: degree conditions are necessary but not sufficient — graph must be connected',
        'Hierholzer\'s: must track which edges are used to avoid revisiting — use edge pointer per vertex',
        'Directed vs undirected: degree conditions differ — in-degree/out-degree vs even/odd degree',
      ],
      interviewTips: [
        'Know the existence conditions cold — they are the most-asked part',
        'If asked "can we visit every edge exactly once?", immediately check degree conditions',
        'The "reconstruct itinerary" problem (LeetCode 332) is Euler path on a directed graph',
      ],
      relatedConcepts: ['graph-properties', 'topological-sort', 'graph-representations'],
      difficulty: 'intermediate',
      tags: ['euler', 'circuit', 'path', 'hierholzer', 'degree'],
      proTip:
        'The "reconstruct itinerary" problem (LeetCode 332) is a direct application of Hierholzer\'s algorithm on a directed multigraph. The trick: sort neighbors lexicographically and use Hierholzer\'s with the smallest-first DFS. The post-order reversal gives the lexicographically smallest Euler path. This problem appears frequently in Google interviews.',
    },
    {
      id: 'planarity',
      title: 'Planarity',
      description:
        'A graph is planar if it can be drawn on a plane without edge crossings. Kuratowski\'s theorem provides a characterization: a graph is planar iff it contains no subdivision of K5 (complete graph on 5 vertices) or K3,3 (complete bipartite graph on 3+3 vertices). Euler\'s formula for planar graphs (V - E + F = 2) gives the bound E <= 3V - 6, which is useful for ruling out planarity quickly.',
      spaceComplexity: 'O(V + E)',
      keyPoints: [
        'Kuratowski\'s theorem: G is planar iff it has no subgraph that is a subdivision of K5 or K3,3',
        'Wagner\'s theorem: equivalent using graph minors instead of subdivisions',
        'Euler\'s formula for connected planar graphs: V - E + F = 2 (F = number of faces including outer)',
        'Consequence: E <= 3V - 6 for simple planar graphs (no multi-edges, no self-loops)',
        'For bipartite planar graphs: E <= 2V - 4',
        'K5 has 5 vertices and 10 edges; since 10 > 3*5 - 6 = 9, K5 is not planar',
        'K3,3 has 6 vertices and 9 edges; since 9 <= 3*6 - 6 = 12, the edge bound alone does NOT rule it out — must check Kuratowski',
        'Planarity testing can be done in O(V) time (Boyer-Myrvold or Hopcroft-Tarjan algorithm)',
        'Four-color theorem: every planar graph is 4-colorable — proven by computer in 1976',
      ],
      useCases: [
        'Circuit board design: planar layout avoids wire crossings',
        'Network visualization: planar embedding for clear graph drawing',
        'Map coloring: every map is a planar graph — four-color theorem guarantees 4 colors suffice',
        'Proving lower bounds: non-planar graphs require more resources for certain embeddings',
      ],
      commonPitfalls: [
        'E <= 3V - 6 is necessary but NOT sufficient for planarity (K3,3 passes this test but is not planar)',
        'Confusing subdivision with minor: Kuratowski uses subdivisions, Wagner uses minors — equivalent but different operations',
        'Planarity testing is O(V) but the algorithms are complex — rarely implemented from scratch',
        'Dual graph: every planar graph has a dual (faces become vertices), but this concept is tricky with disconnected graphs',
      ],
      interviewTips: [
        'Know Euler\'s formula V - E + F = 2 and the corollary E <= 3V - 6',
        'Quick non-planarity test: if E > 3V - 6, definitely not planar',
        'K5 and K3,3 are the two "forbidden" graphs — any non-planar graph contains one as a subdivision',
      ],
      relatedConcepts: ['graph-properties', 'graph-representations'],
      difficulty: 'expert',
      tags: ['planarity', 'kuratowski', 'euler-formula', 'graph-coloring'],
      proTip:
        'Euler\'s formula V - E + F = 2 is remarkably useful beyond planarity. It proves that any convex polyhedron satisfies this equation (vertices, edges, faces). It also proves that there are exactly 5 Platonic solids. In algorithm design, it gives a quick O(1) test: if E > 3V - 6, the graph is definitely not planar — no need for the O(V) planarity testing algorithm.',
    },
  ],
}
