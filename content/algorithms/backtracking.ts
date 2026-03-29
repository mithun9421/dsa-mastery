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

export const backtrackingCategory: Category = {
  id: 'backtracking',
  title: 'Backtracking',
  description: 'Backtracking builds solutions incrementally, abandoning a candidate as soon as it is determined that it cannot lead to a valid complete solution. It is systematic exhaustive search with pruning. The key skill is defining good pruning conditions that eliminate large portions of the search space early.',
  icon: '🔄',
  concepts: [
    {
      id: 'n-queens',
      title: 'N-Queens',
      description: 'Place N queens on an NxN chessboard such that no two queens threaten each other. This is the canonical backtracking problem: place queens column by column, pruning when a placement conflicts. Constraint propagation (tracking attacked rows, diagonals, and anti-diagonals) reduces the check from O(n) to O(1) per placement. The bit manipulation version achieves the same with even lower constant factors.',
      timeComplexity: { best: 'O(n!)', average: 'O(n!)', worst: 'O(n!)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Place one queen per column — reduces problem to choosing rows',
        'Three constraints: no same row, no same diagonal (r-c), no same anti-diagonal (r+c)',
        'Use sets or bitmasks for O(1) conflict checking',
        'Symmetry pruning: mirror solutions about vertical axis halves the search',
        'For n=8: 92 solutions, 12 unique (after removing rotations and reflections)',
        'Bit manipulation version: use cols, diag, antidiag bitmasks for ultra-fast checking',
        'Constraint propagation prunes branches early — key to practical performance',
        'The problem has no polynomial-time formula for exact count of solutions'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'N-Queens with Set-Based Constraint Tracking',
          code: `function solveNQueens(n: number): number[][] {
  const solutions: number[][] = [];
  const cols = new Set<number>();
  const diags = new Set<number>();     // row - col
  const antiDiags = new Set<number>(); // row + col

  function backtrack(row: number, placement: number[]): void {
    if (row === n) {
      solutions.push([...placement]);
      return;
    }

    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diags.has(row - col) || antiDiags.has(row + col)) {
        continue; // Pruned
      }

      cols.add(col);
      diags.add(row - col);
      antiDiags.add(row + col);
      placement.push(col);

      backtrack(row + 1, placement);

      placement.pop();
      cols.delete(col);
      diags.delete(row - col);
      antiDiags.delete(row + col);
    }
  }

  backtrack(0, []);
  return solutions;
}

// Bit manipulation version (fastest)
function nQueensBit(n: number): number {
  let count = 0;
  const allOnes = (1 << n) - 1;

  function solve(cols: number, diag: number, antiDiag: number): void {
    if (cols === allOnes) { count++; return; }

    // Available positions: bits not attacked
    let available = allOnes & ~(cols | diag | antiDiag);

    while (available) {
      const pos = available & (-available); // Lowest set bit
      available ^= pos;
      solve(
        cols | pos,
        (diag | pos) << 1,
        (antiDiag | pos) >> 1
      );
    }
  }

  solve(0, 0, 0);
  return count;
}`
        }
      ],
      useCases: [
        'Teaching backtracking and constraint satisfaction',
        'Benchmark for search algorithm performance',
        'Constraint satisfaction problems (CSP) in AI',
        'Testing pruning strategies and heuristics'
      ],
      commonPitfalls: [
        'Checking conflicts by scanning all placed queens instead of using sets — O(n) per check vs O(1)',
        'Not undoing state changes when backtracking — corrupts future branches',
        'Forgetting the anti-diagonal constraint — queens can attack along both diagonals',
        'Bit manipulation: not masking with allOnes — bits beyond n cause false positives'
      ],
      interviewTips: [
        'N-Queens is a standard backtracking interview problem — know the set-based solution cold',
        'If asked to print board representations: convert column indices to "....Q...." strings',
        'The bit manipulation version shows low-level optimization skills — mention it',
        'Key insight: one queen per column reduces the search space from 2^(n^2) to n^n to n!',
        'Follow-up: "How many solutions for n=8?" — 92 total, 12 unique'
      ],
      relatedConcepts: ['sudoku-solver', 'graph-coloring', 'constraint-satisfaction'],
      difficulty: 'intermediate',
      tags: ['constraint-satisfaction', 'pruning', 'chess'],
      proTip: 'The bit manipulation N-Queens solution is one of the most elegant pieces of code in computer science. The key insight: shifting the diagonal masks left/right propagates the "attacked" information to the next row without any explicit coordinate calculation. This same bit-parallel technique applies to other constraint propagation problems.'
    },
    {
      id: 'sudoku-solver',
      title: 'Sudoku Solver',
      description: 'Fill a 9x9 grid so every row, column, and 3x3 box contains digits 1-9. The standard approach is backtracking with constraint propagation: for each empty cell, try digits that are valid given current constraints, recurse, and backtrack on failure. Advanced techniques like naked pairs, hidden singles, and arc consistency dramatically reduce the search space.',
      timeComplexity: { best: 'O(1)', average: 'O(9^m)', worst: 'O(9^81)' },
      spaceComplexity: 'O(81)',
      keyPoints: [
        'Three constraints: unique in row, column, and 3x3 box',
        'Use bitmasks for O(1) validity checking: rowMask[r], colMask[c], boxMask[b]',
        'Naked singles: if a cell has only one candidate, fill it immediately (no branching needed)',
        'Hidden singles: if a digit can only go in one cell in a row/col/box, place it',
        'Most-constrained variable (MCV): fill the cell with fewest candidates first',
        'MCV heuristic dramatically reduces branching factor',
        'Box index from (r, c): Math.floor(r/3) * 3 + Math.floor(c/3)',
        'A well-designed solver with constraint propagation solves most puzzles without backtracking'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Sudoku Solver with Bitmask Constraints',
          code: `function solveSudoku(board: number[][]): boolean {
  const rows = new Array(9).fill(0);
  const cols = new Array(9).fill(0);
  const boxes = new Array(9).fill(0);

  // Initialize constraints from existing numbers
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) {
        const bit = 1 << board[r][c];
        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        rows[r] |= bit;
        cols[c] |= bit;
        boxes[b] |= bit;
      }
    }
  }

  function solve(): boolean {
    // Find most constrained empty cell (MCV heuristic)
    let minCandidates = 10;
    let bestR = -1, bestC = -1;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== 0) continue;
        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        const used = rows[r] | cols[c] | boxes[b];
        const candidates = 9 - popcount(used >> 1); // Count available digits
        if (candidates < minCandidates) {
          minCandidates = candidates;
          bestR = r;
          bestC = c;
        }
      }
    }

    if (bestR === -1) return true; // All cells filled
    if (minCandidates === 0) return false; // No valid digit for this cell

    const b = Math.floor(bestR / 3) * 3 + Math.floor(bestC / 3);
    const used = rows[bestR] | cols[bestC] | boxes[b];

    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d;
      if (used & bit) continue; // Digit already used

      board[bestR][bestC] = d;
      rows[bestR] |= bit;
      cols[bestC] |= bit;
      boxes[b] |= bit;

      if (solve()) return true;

      board[bestR][bestC] = 0;
      rows[bestR] ^= bit;
      cols[bestC] ^= bit;
      boxes[b] ^= bit;
    }

    return false;
  }

  return solve();
}

function popcount(x: number): number {
  let count = 0;
  while (x) { x &= x - 1; count++; }
  return count;
}`
        }
      ],
      useCases: [
        'Puzzle solving applications',
        'Teaching constraint satisfaction and backtracking',
        'Benchmark for CSP solver algorithms',
        'Demonstrating the power of heuristics (MCV) in search'
      ],
      commonPitfalls: [
        'Scanning the entire board for empty cells linearly instead of using MCV heuristic',
        'Not resetting state on backtrack — board, row/col/box masks must all be restored',
        'Box index calculation error: floor(r/3)*3 + floor(c/3), not r/3 + c/3',
        'Checking validity by scanning entire row/col/box instead of using bitmasks'
      ],
      interviewTips: [
        'Sudoku solver is a standard backtracking problem — know the bitmask approach',
        'MCV heuristic is the key optimization — mention it even if you use simple scanning',
        'If asked about hard Sudoku puzzles: constraint propagation (naked singles, hidden singles) eliminates most backtracking',
        'Time complexity is technically exponential but with good heuristics, practical solving is instant'
      ],
      relatedConcepts: ['n-queens', 'constraint-satisfaction', 'arc-consistency'],
      difficulty: 'intermediate',
      tags: ['constraint-satisfaction', 'puzzle', 'bitmask'],
      proTip: 'Peter Norvig\'s famous Sudoku solver uses two techniques: constraint propagation (naked singles + hidden singles) and search (backtracking with MCV). The constraint propagation alone solves most newspaper puzzles without any search. This is the same idea behind SAT solvers: propagate unit clauses, then branch.'
    },
    {
      id: 'graph-coloring',
      title: 'Graph Coloring (m-Coloring)',
      description: 'Determine if a graph can be colored with at most m colors such that no two adjacent vertices share a color, and find such a coloring. The backtracking approach tries each color for each vertex, pruning when a conflict is detected. Forward checking (eliminating a neighbor\'s candidate colors immediately) and arc consistency further reduce the search space.',
      timeComplexity: { best: 'O(V)', average: 'O(m^V)', worst: 'O(m^V)' },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'Decision problem: can the graph be colored with m colors? (NP-complete for m >= 3)',
        'Backtracking: assign colors vertex by vertex, backtrack on conflict',
        'Forward checking: when assigning a color to v, remove it from candidates of v\'s neighbors',
        'Ordering heuristic: color the most constrained vertex first (most neighbors already colored)',
        'For m=2: reduces to bipartite check — O(V+E) BFS/DFS',
        'For planar graphs: always 4-colorable (Four Color Theorem)',
        'Chromatic number chi(G): minimum colors needed — NP-hard to compute',
        'Applications: register allocation, scheduling, frequency assignment'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'M-Coloring with Backtracking',
          code: `function graphColoring(
  graph: Map<number, number[]>, n: number, m: number
): number[] | null {
  const colors = new Array(n).fill(0); // 0 = uncolored

  function isSafe(vertex: number, color: number): boolean {
    for (const neighbor of graph.get(vertex) ?? []) {
      if (colors[neighbor] === color) return false;
    }
    return true;
  }

  function solve(vertex: number): boolean {
    if (vertex === n) return true; // All vertices colored

    for (let c = 1; c <= m; c++) {
      if (isSafe(vertex, c)) {
        colors[vertex] = c;
        if (solve(vertex + 1)) return true;
        colors[vertex] = 0; // Backtrack
      }
    }

    return false;
  }

  return solve(0) ? colors : null;
}`
        }
      ],
      useCases: [
        'Register allocation in compilers',
        'Scheduling: assign time slots to exams/tasks',
        'Frequency assignment in wireless networks',
        'Map coloring (geographic, political)'
      ],
      commonPitfalls: [
        'Not checking bipartiteness first when m=2 — O(V+E) vs exponential backtracking',
        'Forgetting to reset color on backtrack',
        'Using a fixed vertex order instead of MCV heuristic — much slower',
        'Assuming greedy coloring is optimal — it is NOT for general graphs'
      ],
      interviewTips: [
        'For m=2, always use BFS 2-coloring instead of backtracking',
        'Graph coloring is NP-complete for m >= 3 — no polynomial solution is known',
        'The practical optimization is MCV (most constrained variable): color the vertex with most colored neighbors first',
        'If asked about real applications: register allocation is the most impactful'
      ],
      relatedConcepts: ['bipartite-check', 'greedy-coloring', 'csp', 'register-allocation'],
      difficulty: 'advanced',
      tags: ['np-complete', 'csp', 'coloring'],
      proTip: 'In practice, graph coloring is solved not by pure backtracking but by SAT reduction. Encode the coloring problem as a Boolean satisfiability instance and feed it to a modern SAT solver (MiniSat, CaDiCaL). SAT solvers have decades of engineering behind their conflict-driven clause learning (CDCL) and can solve instances with thousands of vertices in seconds.'
    },
    {
      id: 'hamiltonian-path',
      title: 'Hamiltonian Path and Circuit',
      description: 'A Hamiltonian path visits every vertex exactly once. A Hamiltonian circuit does so and returns to the start. Unlike Eulerian paths (polynomial), finding Hamiltonian paths is NP-complete — no efficient algorithm is known. Backtracking with pruning is the standard approach. For special cases like knight\'s tour, Warnsdorff\'s heuristic provides near-linear performance.',
      timeComplexity: { best: 'O(V!)', average: 'O(V!)', worst: 'O(V!)' },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'NP-complete: no known polynomial algorithm (unlike Eulerian path)',
        'Backtracking: try extending the current path one vertex at a time',
        'Pruning: if remaining unvisited vertices form disconnected components, backtrack early',
        'Bitmask DP: O(2^n * n^2) — exact solution faster than O(n!) for small n',
        'Warnsdorff heuristic (knight tour): always move to the square with fewest onward moves',
        'Ore theorem: if deg(u) + deg(v) >= n for all non-adjacent u,v, then Hamiltonian cycle exists',
        'Dirac theorem: if minimum degree >= n/2, Hamiltonian cycle exists',
        'No known efficient way to even determine if a Hamiltonian path EXISTS'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Hamiltonian Path with Backtracking',
          code: `function hamiltonianPath(
  graph: Map<number, number[]>, n: number
): number[] | null {
  const visited = new Array(n).fill(false);
  const path: number[] = [];

  function backtrack(v: number): boolean {
    path.push(v);
    visited[v] = true;

    if (path.length === n) return true; // All vertices visited

    for (const neighbor of graph.get(v) ?? []) {
      if (!visited[neighbor]) {
        if (backtrack(neighbor)) return true;
      }
    }

    // Backtrack
    path.pop();
    visited[v] = false;
    return false;
  }

  // Try starting from each vertex
  for (let start = 0; start < n; start++) {
    if (backtrack(start)) return path;
  }

  return null;
}

// Knight's Tour using Warnsdorff's heuristic
function knightsTour(n: number): number[][] {
  const board: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(-1)
  );
  const moves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  function countMoves(r: number, c: number): number {
    let count = 0;
    for (const [dr, dc] of moves) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && board[nr][nc] === -1) {
        count++;
      }
    }
    return count;
  }

  function solve(r: number, c: number, moveNum: number): boolean {
    board[r][c] = moveNum;
    if (moveNum === n * n - 1) return true;

    // Warnsdorff: sort neighbors by number of onward moves (ascending)
    const nextMoves: [number, number, number][] = [];
    for (const [dr, dc] of moves) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && board[nr][nc] === -1) {
        nextMoves.push([nr, nc, countMoves(nr, nc)]);
      }
    }
    nextMoves.sort((a, b) => a[2] - b[2]);

    for (const [nr, nc] of nextMoves) {
      if (solve(nr, nc, moveNum + 1)) return true;
    }

    board[r][c] = -1; // Backtrack
    return false;
  }

  solve(0, 0, 0);
  return board;
}`
        }
      ],
      useCases: [
        'Knight\'s tour puzzle',
        'Traveling salesman problem (Hamiltonian circuit with weights)',
        'Circuit board testing: visit all test points exactly once',
        'Genome assembly: finding paths through overlap graphs'
      ],
      commonPitfalls: [
        'Confusing Hamiltonian (every vertex) with Eulerian (every edge)',
        'Not trying all starting vertices — the path may only exist from certain starts',
        'Forgetting to unmark visited on backtrack',
        'For knight\'s tour: not using Warnsdorff\'s heuristic — pure backtracking is too slow for large n'
      ],
      interviewTips: [
        'Hamiltonian path is NP-complete — always mention this complexity context',
        'Bitmask DP O(2^n * n^2) is better than backtracking O(n!) for exact solutions',
        'If asked about knight\'s tour: Warnsdorff\'s heuristic gives near-linear practical performance',
        'Compare with Eulerian: Euler is polynomial, Hamilton is NP-complete — fundamentally different'
      ],
      relatedConcepts: ['eulerian-path', 'tsp', 'bitmask-dp', 'np-complete'],
      difficulty: 'advanced',
      tags: ['np-complete', 'path', 'exhaustive-search'],
      proTip: 'Warnsdorff\'s rule (always move to the square with fewest onward moves) is a remarkable heuristic. For the knight\'s tour on standard boards (up to 76x76), it finds a solution on the first try with no backtracking. The intuition: visiting constrained squares first prevents painting yourself into a corner. This same heuristic principle (most constrained first) is used in SAT solvers and constraint satisfaction.'
    },
    {
      id: 'permutations',
      title: 'Permutations',
      description: 'Generate all permutations of a collection. The swap-based approach (Heap\'s algorithm) generates permutations in-place with minimal swaps. The used-array approach is more intuitive and handles duplicates easily. The next_permutation algorithm generates the lexicographically next permutation in O(n) without generating all permutations. Avoiding duplicates requires sorting and skipping equal elements at the same recursion level.',
      timeComplexity: { best: 'O(n * n!)', average: 'O(n * n!)', worst: 'O(n * n!)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'n! permutations of n distinct elements',
        'Swap-based: swap element into current position, recurse on remaining',
        'Used-array: maintain which elements are used, build permutation position by position',
        'Duplicates: sort the input, skip element if same as previous and previous was not used at this level',
        'Next permutation: find rightmost ascent, swap with smallest larger element to the right, reverse suffix',
        'Heap\'s algorithm: generates all permutations with minimum swaps (single swap per permutation)',
        'For n > 10: n! > 3.6 million — generating all permutations is expensive',
        'Steinhaus-Johnson-Trotter: generates permutations where consecutive ones differ by a single swap'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Permutations: Standard, With Duplicates, Next Permutation',
          code: `// All permutations (swap-based)
function permute(nums: readonly number[]): number[][] {
  const result: number[][] = [];
  const arr = [...nums];

  function backtrack(start: number): void {
    if (start === arr.length) {
      result.push([...arr]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      backtrack(start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]]; // Swap back
    }
  }

  backtrack(0);
  return result;
}

// Permutations with duplicates (sorted + skip)
function permuteUnique(nums: readonly number[]): number[][] {
  const result: number[][] = [];
  const sorted = [...nums].sort((a, b) => a - b);
  const used = new Array(sorted.length).fill(false);

  function backtrack(current: number[]): void {
    if (current.length === sorted.length) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < sorted.length; i++) {
      if (used[i]) continue;
      // Skip duplicate: same value as previous, and previous not used at this level
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) continue;

      used[i] = true;
      current.push(sorted[i]);
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return result;
}

// Next permutation in-place (O(n))
function nextPermutation(nums: number[]): void {
  const n = nums.length;
  // Step 1: Find rightmost ascent (i where nums[i] < nums[i+1])
  let i = n - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;

  if (i >= 0) {
    // Step 2: Find smallest element > nums[i] to the right
    let j = n - 1;
    while (nums[j] <= nums[i]) j--;
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  // Step 3: Reverse suffix after position i
  let lo = i + 1, hi = n - 1;
  while (lo < hi) {
    [nums[lo], nums[hi]] = [nums[hi], nums[lo]];
    lo++; hi--;
  }
}`
        }
      ],
      useCases: [
        'Generating all arrangements for exhaustive testing',
        'Combinatorial optimization brute force',
        'Password cracking (all possible orderings)',
        'Anagram generation',
        'Ranking and unranking permutations'
      ],
      commonPitfalls: [
        'Swap-based with duplicates: the swap approach does not handle duplicates well — use the used-array approach instead',
        'Duplicate skip condition: must check !used[i-1], not used[i-1] — the logic is subtle',
        'Not sorting before handling duplicates — the skip condition requires sorted input',
        'Next permutation: forgetting to reverse the suffix after swapping — gives wrong order'
      ],
      interviewTips: [
        'Permutations is a top-10 backtracking problem — know all three variants',
        'Next permutation is O(n) and frequently asked — know the three-step algorithm',
        'For duplicates: sort + skip is the standard approach',
        'If asked "generate kth permutation": use factorial number system, O(n^2) without generating all'
      ],
      relatedConcepts: ['subsets', 'combination-sum', 'factorial-number-system'],
      difficulty: 'intermediate',
      tags: ['enumeration', 'combinatorics', 'lexicographic'],
      proTip: 'The next_permutation algorithm is one of the most elegant algorithms in the STL. It generates permutations in lexicographic order and wraps around (the permutation after the largest is the smallest). This means you can iterate through all n! permutations by calling it repeatedly starting from the sorted array. It is also the basis for the factorial number system, which maps integers to permutations.'
    },
    {
      id: 'subsets-power-set',
      title: 'Subsets / Power Set',
      description: 'Generate all 2^n subsets of a set. Three approaches: (1) include/exclude recursion, (2) iterative bitmask enumeration, and (3) cascading (for each new element, copy all existing subsets and add the element). Handling duplicates requires sorting and skipping equal elements at the same recursion level, similar to permutations.',
      timeComplexity: { best: 'O(n * 2^n)', average: 'O(n * 2^n)', worst: 'O(n * 2^n)' },
      spaceComplexity: 'O(n * 2^n)',
      keyPoints: [
        '2^n subsets of a set with n elements',
        'Include/exclude pattern: for each element, either include it or not',
        'Bitmask: iterate from 0 to 2^n-1, bit i indicates element i is included',
        'Cascading: start with {{}}, for each element e, add e to all existing subsets',
        'Duplicates: sort first, skip consecutive equal elements at the same recursion depth',
        'Subsets of size k: combinations C(n,k), use separate backtracking with length constraint',
        'The include/exclude pattern is the foundation for knapsack, partition, and subset sum DP',
        'For n > 20: 2^n > 1 million — enumerate only when necessary'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Subsets: Recursive, Iterative, With Duplicates',
          code: `// Include/exclude recursion
function subsets(nums: readonly number[]): number[][] {
  const result: number[][] = [];

  function backtrack(index: number, current: number[]): void {
    if (index === nums.length) {
      result.push([...current]);
      return;
    }
    // Exclude nums[index]
    backtrack(index + 1, current);
    // Include nums[index]
    current.push(nums[index]);
    backtrack(index + 1, current);
    current.pop();
  }

  backtrack(0, []);
  return result;
}

// Bitmask iteration
function subsetsBitmask(nums: readonly number[]): number[][] {
  const n = nums.length;
  const result: number[][] = [];

  for (let mask = 0; mask < (1 << n); mask++) {
    const subset: number[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(nums[i]);
    }
    result.push(subset);
  }

  return result;
}

// Subsets with duplicates
function subsetsWithDup(nums: readonly number[]): number[][] {
  const sorted = [...nums].sort((a, b) => a - b);
  const result: number[][] = [];

  function backtrack(index: number, current: number[]): void {
    result.push([...current]);

    for (let i = index; i < sorted.length; i++) {
      // Skip duplicates at the same level
      if (i > index && sorted[i] === sorted[i - 1]) continue;
      current.push(sorted[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}`
        }
      ],
      useCases: [
        'Feature subset selection in machine learning',
        'Testing: generating all possible configurations',
        'Combinatorial problems: subset sum, partition',
        'Power set computation in set theory'
      ],
      commonPitfalls: [
        'Not copying the current subset before adding to results — reference vs value',
        'Bitmask approach: 1 << n overflows for n > 30 in JavaScript — use BigInt or recursion',
        'Duplicate handling: forgetting to sort first — the skip condition requires sorted input',
        'Including the same element twice by not advancing the index in recursive calls'
      ],
      interviewTips: [
        'Know all three approaches and when each is appropriate',
        'Bitmask is cleanest for distinct elements; recursive is better for duplicates',
        'If asked for subsets of size exactly k: add a length check, prune when remaining elements are insufficient',
        'The include/exclude pattern is the core recursion tree for many DP problems'
      ],
      relatedConcepts: ['permutations', 'combination-sum', 'knapsack-01', 'bitmask-dp'],
      difficulty: 'beginner',
      tags: ['enumeration', 'combinatorics', 'bitmask'],
      proTip: 'The include/exclude recursion tree IS the decision tree for the 0/1 knapsack problem. Drawing this tree explicitly is the best way to understand why knapsack has 2^n states without DP, and how memoization collapses it. If you truly understand subsets, you understand the structure of exponential search.'
    },
    {
      id: 'combination-sum',
      title: 'Combination Sum',
      description: 'Find all unique combinations of candidates that sum to a target. Three classic variants: (I) unlimited reuse of each number, (II) each number used at most once, (III) exactly k numbers summing to n using 1-9. The key optimization is sorting + early termination: if the current element exceeds the remaining target, skip all larger elements too.',
      timeComplexity: { best: 'O(n^(T/min))', average: 'O(n^(T/min))', worst: 'O(n^(T/min))' },
      spaceComplexity: 'O(T/min)',
      keyPoints: [
        'Combination Sum I: unlimited reuse — start from same index when recursing',
        'Combination Sum II: each used once — start from index+1 and skip duplicates',
        'Combination Sum III: pick k numbers from 1-9 summing to n',
        'Sort candidates to enable early termination: if candidates[i] > remaining, break',
        'Duplicate avoidance (type II): sort + skip same value at same recursion level',
        'Pruning: cut branches where remaining < 0 or remaining < smallest candidate',
        'Target sum variant: assign +/- to each number — reduce to subset sum with offset',
        'Combination vs permutation: combinations are unordered, process elements in order to avoid duplicates'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Combination Sum I, II, III',
          code: `// Type I: Unlimited reuse
function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];
  const sorted = [...candidates].sort((a, b) => a - b);

  function backtrack(start: number, remaining: number, current: number[]): void {
    if (remaining === 0) { result.push([...current]); return; }

    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remaining) break; // Prune
      current.push(sorted[i]);
      backtrack(i, remaining - sorted[i], current); // Same index (reuse)
      current.pop();
    }
  }

  backtrack(0, target, []);
  return result;
}

// Type II: Each number used at most once, with duplicates in input
function combinationSum2(candidates: number[], target: number): number[][] {
  const result: number[][] = [];
  const sorted = [...candidates].sort((a, b) => a - b);

  function backtrack(start: number, remaining: number, current: number[]): void {
    if (remaining === 0) { result.push([...current]); return; }

    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remaining) break;
      if (i > start && sorted[i] === sorted[i - 1]) continue; // Skip dups
      current.push(sorted[i]);
      backtrack(i + 1, remaining - sorted[i], current); // Next index
      current.pop();
    }
  }

  backtrack(0, target, []);
  return result;
}

// Type III: k numbers from 1-9 summing to n
function combinationSum3(k: number, n: number): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, remaining: number, current: number[]): void {
    if (current.length === k && remaining === 0) {
      result.push([...current]);
      return;
    }
    if (current.length >= k || remaining <= 0) return;

    for (let i = start; i <= 9; i++) {
      if (i > remaining) break;
      current.push(i);
      backtrack(i + 1, remaining - i, current);
      current.pop();
    }
  }

  backtrack(1, n, []);
  return result;
}`
        }
      ],
      useCases: [
        'Financial planning: find combinations of investments hitting a target',
        'Game design: enumerate all ways to spend points',
        'Cryptarithmetic and number puzzles',
        'Resource allocation: combinations summing to budget'
      ],
      commonPitfalls: [
        'Type I: using i+1 instead of i — prevents reuse when reuse is allowed',
        'Type II: not sorting or not skipping duplicates at same level — produces duplicate results',
        'Not adding early termination (break when candidate > remaining) — huge performance hit',
        'Forgetting to copy current before pushing to results'
      ],
      interviewTips: [
        'Know all three types — they are frequently asked in interviews',
        'The key distinction is the index passed to recursion: same (reuse) vs next (no reuse)',
        'Sorting + break pruning is essential — mention it explicitly',
        'If asked for count only (not the actual combinations): DP is O(n*target) vs exponential backtracking'
      ],
      relatedConcepts: ['subsets-power-set', 'coin-change', 'knapsack-01'],
      difficulty: 'intermediate',
      tags: ['enumeration', 'pruning', 'target-sum'],
      proTip: 'When the problem asks "count the number of combinations" instead of "list them all," switch from backtracking to DP immediately. Backtracking generates all solutions (exponential output), while DP counts them in polynomial time. The transition from "list all" (backtracking) to "count" (DP) is a fundamental paradigm shift that appears throughout algorithmic problem solving.'
    },
    {
      id: 'word-search',
      title: 'Word Search',
      description: 'Given a 2D grid of characters and a word, determine if the word exists in the grid by following adjacent cells (up/down/left/right) without reusing any cell. This is DFS on a grid with backtracking. For searching multiple words, augment with a Trie to prune branches where no word has the current prefix, transforming the problem from O(words * cells * 4^L) to a single DFS with Trie guidance.',
      timeComplexity: { best: 'O(m * n * 4^L)', average: 'O(m * n * 4^L)', worst: 'O(m * n * 4^L)' },
      spaceComplexity: 'O(L)',
      keyPoints: [
        'DFS from each cell, marking visited cells to avoid reuse',
        'Backtrack by unmarking the cell after exploring all directions',
        'In-place marking: set grid[r][c] to a sentinel (e.g., "#") instead of using a visited array',
        'For multiple words: build a Trie, DFS with Trie guidance, prune when no prefix matches',
        'Trie optimization: remove matched words from Trie to avoid duplicate finds',
        'Early termination: if remaining word length > remaining cells, impossible',
        'Character frequency pruning: if word has a rare starting character, search from the end',
        'Time complexity O(m*n*4^L) where L is word length, m*n is grid size'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Word Search I and II (with Trie)',
          code: `// Word Search I: single word
function wordSearch(board: string[][], word: string): boolean {
  const rows = board.length, cols = board[0].length;

  function dfs(r: number, c: number, idx: number): boolean {
    if (idx === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (board[r][c] !== word[idx]) return false;

    const saved = board[r][c];
    board[r][c] = '#'; // Mark visited

    const found = dfs(r + 1, c, idx + 1) || dfs(r - 1, c, idx + 1) ||
                  dfs(r, c + 1, idx + 1) || dfs(r, c - 1, idx + 1);

    board[r][c] = saved; // Backtrack
    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}

// Word Search II: multiple words with Trie
interface TrieNode {
  children: Map<string, TrieNode>
  word: string | null
}

function findWords(board: string[][], words: string[]): string[] {
  const root: TrieNode = { children: new Map(), word: null };

  // Build trie
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), word: null });
      }
      node = node.children.get(ch)!;
    }
    node.word = word;
  }

  const rows = board.length, cols = board[0].length;
  const result: string[] = [];

  function dfs(r: number, c: number, node: TrieNode): void {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    const ch = board[r][c];
    if (ch === '#' || !node.children.has(ch)) return;

    const child = node.children.get(ch)!;
    if (child.word !== null) {
      result.push(child.word);
      child.word = null; // Avoid duplicates
    }

    board[r][c] = '#';
    dfs(r + 1, c, child);
    dfs(r - 1, c, child);
    dfs(r, c + 1, child);
    dfs(r, c - 1, child);
    board[r][c] = ch;

    // Prune: remove leaf nodes from trie
    if (child.children.size === 0) {
      node.children.delete(ch);
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dfs(r, c, root);
    }
  }

  return result;
}`
        }
      ],
      useCases: [
        'Word puzzle games (Boggle, word search puzzles)',
        'Pattern matching on 2D grids',
        'Maze path finding with constraints',
        'DNA pattern matching on sequence grids'
      ],
      commonPitfalls: [
        'Not restoring the cell after backtracking — corrupts other DFS branches',
        'Using a separate visited array when in-place marking is simpler and faster',
        'Word Search II: not pruning empty Trie branches — causes TLE on large inputs',
        'Not handling the case where the same word appears multiple times in the grid'
      ],
      interviewTips: [
        'Word Search I is a standard medium-level problem — know the in-place marking trick',
        'Word Search II is a hard problem — the Trie optimization is the key',
        'Trie pruning (removing leaf nodes after finding a word) is critical for performance',
        'Frequency analysis: if the first character is rarer than the last, search the reversed word'
      ],
      relatedConcepts: ['dfs', 'trie', 'grid-search', 'backtracking-template'],
      difficulty: 'intermediate',
      tags: ['grid', 'dfs', 'trie', 'string-matching'],
      proTip: 'The "reverse word before searching" optimization is surprisingly effective. If the word starts with a common letter (like "e") but ends with a rare one (like "z"), reversing it means DFS prunes most branches at the first step instead of deep in the recursion. Some competitive programmers always check both directions and pick the one with fewer starting cells.'
    },
    {
      id: 'palindrome-partitioning',
      title: 'Palindrome Partitioning',
      description: 'Partition a string into substrings such that every substring is a palindrome. Two variants: (1) find all possible partitions (backtracking), and (2) find the minimum number of cuts (DP). Precomputing a palindrome lookup table makes both variants efficient. The minimum cuts problem combines palindrome precomputation with a 1D DP.',
      timeComplexity: { best: 'O(n * 2^n)', average: 'O(n * 2^n)', worst: 'O(n * 2^n)' },
      spaceComplexity: 'O(n^2)',
      keyPoints: [
        'All partitions (backtracking): try each prefix, if palindrome, recurse on suffix',
        'Precompute isPalin[i][j]: whether s[i..j] is a palindrome — O(n^2) DP',
        'Minimum cuts (DP): dp[i] = min cuts for s[0..i], update for each palindrome ending at i',
        'Minimum cuts recurrence: if s[j..i] is palindrome, dp[i] = min(dp[i], dp[j-1] + 1)',
        'Manacher-based approach: O(n^2) minimum cuts using palindrome radii',
        'The number of palindrome partitions can be exponential — "aaa...a" has 2^(n-1) partitions',
        'A string of length n has at most n distinct palindromic substrings (Eertree property)',
        'Early cut in backtracking: if remaining suffix has no possible palindrome partition, prune'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Palindrome Partitioning: All Partitions and Min Cuts',
          code: `// All palindrome partitions
function partition(s: string): string[][] {
  const n = s.length;
  // Precompute palindrome table
  const isPalin: boolean[][] = Array.from({ length: n }, () =>
    new Array(n).fill(false)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i; j < n; j++) {
      if (s[i] === s[j] && (j - i <= 2 || isPalin[i + 1][j - 1])) {
        isPalin[i][j] = true;
      }
    }
  }

  const result: string[][] = [];

  function backtrack(start: number, current: string[]): void {
    if (start === n) {
      result.push([...current]);
      return;
    }
    for (let end = start; end < n; end++) {
      if (isPalin[start][end]) {
        current.push(s.substring(start, end + 1));
        backtrack(end + 1, current);
        current.pop();
      }
    }
  }

  backtrack(0, []);
  return result;
}

// Minimum cuts for palindrome partitioning
function minCut(s: string): number {
  const n = s.length;
  const isPalin: boolean[][] = Array.from({ length: n }, () =>
    new Array(n).fill(false)
  );

  for (let i = n - 1; i >= 0; i--) {
    for (let j = i; j < n; j++) {
      if (s[i] === s[j] && (j - i <= 2 || isPalin[i + 1][j - 1])) {
        isPalin[i][j] = true;
      }
    }
  }

  const dp = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (isPalin[0][i]) {
      dp[i] = 0; // Entire prefix is a palindrome
    } else {
      dp[i] = i; // Worst case: cut after every character
      for (let j = 1; j <= i; j++) {
        if (isPalin[j][i]) {
          dp[i] = Math.min(dp[i], dp[j - 1] + 1);
        }
      }
    }
  }

  return dp[n - 1];
}`
        }
      ],
      useCases: [
        'String processing: breaking strings into palindromic components',
        'Compiler design: parsing tokens with palindromic properties',
        'Bioinformatics: palindromic sequences in DNA (restriction enzyme sites)',
        'Text processing and natural language'
      ],
      commonPitfalls: [
        'Not precomputing the palindrome table — checking on the fly is O(n) per check vs O(1)',
        'Palindrome DP fill order: iterate i from n-1 to 0, j from i to n-1',
        'Min cuts: forgetting the special case where s[0..i] is itself a palindrome (0 cuts)',
        'Backtracking: not using substring correctly — off-by-one in end index'
      ],
      interviewTips: [
        'This is a classic backtracking + DP combo problem',
        'Always precompute the palindrome table — it is O(n^2) and saves O(n) per check',
        'Min cuts is a different problem than listing all partitions — know both',
        'Follow-up: "What if you need the actual partition, not just the count?" — backtrack through the DP table'
      ],
      relatedConcepts: ['dp', 'palindrome-detection', 'manacher', 'interval-dp'],
      difficulty: 'intermediate',
      tags: ['palindrome', 'partition', 'precomputation'],
      proTip: 'The palindrome precomputation table isPalin[i][j] is one of the most reusable precomputations in string problems. Once you have it, palindrome partitioning, longest palindromic substring, and counting palindromic substrings all become straightforward. Invest time in getting this precomputation right — it pays dividends across many problems.'
    },
    {
      id: 'backtracking-template',
      title: 'General Backtracking Template',
      description: 'All backtracking problems follow the same template: make a choice, recurse, undo the choice. The three components are: (1) the state space (current partial solution), (2) the choice set (what can be added next), and (3) the constraints (what makes a choice valid). Pruning — eliminating choices early based on constraints — is what separates practical backtracking from brute-force exhaustive search.',
      timeComplexity: { best: 'O(varies)', average: 'O(varies)', worst: 'O(varies)' },
      spaceComplexity: 'O(recursion depth)',
      keyPoints: [
        'Template: choose -> explore -> unchoose (backtrack)',
        'State: the partial solution built so far',
        'Choices: the candidates available at the current decision point',
        'Constraints: conditions that must hold for a valid solution',
        'Pruning: eliminate choices before exploring them — the key to performance',
        'Ordering: try most-constrained choices first (fail-fast)',
        'Symmetry breaking: avoid exploring equivalent branches (e.g., N-Queens symmetry)',
        'Output: either find one solution (return on first success) or enumerate all solutions'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Universal Backtracking Template',
          code: `// Generic backtracking template
function backtrack<T>(
  state: T[],
  choices: T[],
  isComplete: (state: T[]) => boolean,
  isValid: (state: T[], choice: T) => boolean,
  onSolution: (state: T[]) => void,
  getChoices?: (state: T[], allChoices: T[]) => T[]
): void {
  if (isComplete(state)) {
    onSolution(state);
    return;
  }

  const candidates = getChoices
    ? getChoices(state, choices)
    : choices;

  for (const choice of candidates) {
    if (!isValid(state, choice)) continue; // Prune

    state.push(choice);         // Choose
    backtrack(state, choices, isComplete, isValid, onSolution, getChoices);
    state.pop();                // Unchoose (backtrack)
  }
}

// Example: Generate all valid parentheses
function generateParentheses(n: number): string[] {
  const result: string[] = [];

  function backtrack(current: string, open: number, close: number): void {
    if (current.length === 2 * n) {
      result.push(current);
      return;
    }

    // Choice 1: add open paren (if available)
    if (open < n) {
      backtrack(current + '(', open + 1, close);
    }

    // Choice 2: add close paren (if valid)
    if (close < open) {
      backtrack(current + ')', open, close + 1);
    }
  }

  backtrack('', 0, 0);
  return result;
}

// Example: Letter combinations of phone number
function letterCombinations(digits: string): string[] {
  if (digits.length === 0) return [];

  const map: Record<string, string> = {
    '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
    '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
  };

  const result: string[] = [];

  function backtrack(index: number, current: string): void {
    if (index === digits.length) {
      result.push(current);
      return;
    }

    for (const letter of map[digits[index]]) {
      backtrack(index + 1, current + letter);
    }
  }

  backtrack(0, '');
  return result;
}`
        }
      ],
      useCases: [
        'Any problem requiring exhaustive search with constraints',
        'Constraint satisfaction problems (CSP)',
        'Combinatorial optimization when problem size is small',
        'Generating valid configurations (parentheses, schedules, assignments)'
      ],
      commonPitfalls: [
        'Forgetting to undo state changes when backtracking — the #1 backtracking bug',
        'Not pruning effectively — backtracking without pruning is just brute force',
        'Modifying the choices list during iteration — causes missed or duplicate exploration',
        'Not considering ordering heuristics — fail-fast ordering can reduce runtime by orders of magnitude'
      ],
      interviewTips: [
        'Articulate the template clearly: "I will use state/choices/constraints backtracking"',
        'Always discuss pruning — interviewers want to see optimization thinking',
        'For counting problems: consider if DP can replace backtracking (exponential to polynomial)',
        'Common backtracking problems: generate parentheses, phone combinations, letter combinations, IP addresses'
      ],
      relatedConcepts: ['dfs', 'constraint-satisfaction', 'branch-and-bound', 'pruning'],
      difficulty: 'intermediate',
      tags: ['template', 'exhaustive-search', 'pruning'],
      proTip: 'The difference between a 10-second solution and a TLE solution is pruning. Three pruning strategies to always consider: (1) feasibility — can this branch possibly lead to a valid solution? (2) optimality — can this branch possibly lead to a BETTER solution than the current best? (3) symmetry — have I already explored an equivalent branch? In competitive programming, pruning often makes the difference between AC and TLE.'
    }
  ]
}
