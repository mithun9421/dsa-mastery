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

export const dpCategory: Category = {
  id: 'dynamic-programming',
  title: 'Dynamic Programming',
  description: 'Dynamic programming is the art of solving complex problems by breaking them into overlapping subproblems. The key insight: if you can define the answer to a problem in terms of answers to smaller versions of itself, and subproblems overlap, DP transforms exponential brute-force into polynomial time.',
  icon: '🧩',
  concepts: [
    {
      id: 'memoization',
      title: 'Memoization (Top-Down DP)',
      description: 'Memoization is the top-down approach to DP: write the recursive solution naturally, then cache the results of subproblems to avoid redundant computation. It computes only the subproblems that are actually needed (lazy evaluation), making it ideal when the subproblem space is sparse. The trade-off is recursion stack overhead and potential stack overflow for deep recursion.',
      timeComplexity: { best: 'O(subproblems * cost_per)', average: 'O(subproblems * cost_per)', worst: 'O(subproblems * cost_per)' },
      spaceComplexity: 'O(subproblems + recursion depth)',
      keyPoints: [
        'Write recursive solution first, then add cache — the most natural DP approach',
        'Only computes needed subproblems — efficient when the state space is sparse',
        'Uses recursion stack: risk of stack overflow for deep recursion (Python ~1000, JS ~10000)',
        'Cache key must uniquely identify the subproblem state',
        'In TypeScript/JS, use Map for cache (supports any key type) or array for integer states',
        'Decorator pattern: wrap any function with memoization without modifying its logic',
        'When to prefer over tabulation: sparse subproblems, complex state transitions, natural recursive structure',
        'When to avoid: when all subproblems are needed, deep recursion, or tight memory constraints'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Memoization Patterns',
          code: `// Generic memoize decorator
function memoize<Args extends unknown[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R {
  const cache = new Map<string, R>();
  return (...args: Args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Fibonacci with memoization
function fibMemo(n: number, memo = new Map<number, number>()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

// 2D memoization: Unique Paths in Grid
function uniquePaths(m: number, n: number): number {
  const memo = new Map<string, number>();

  function dp(r: number, c: number): number {
    if (r === m - 1 && c === n - 1) return 1;
    if (r >= m || c >= n) return 0;

    const key = \`\${r},\${c}\`;
    if (memo.has(key)) return memo.get(key)!;

    const result = dp(r + 1, c) + dp(r, c + 1);
    memo.set(key, result);
    return result;
  }

  return dp(0, 0);
}`
        }
      ],
      useCases: [
        'When the recursive structure is natural and easy to reason about',
        'Sparse subproblem spaces where many states are never visited',
        'Rapid prototyping: convert brute-force to DP by adding memoization',
        'Tree DP and graph DP where subproblem relationships are recursive'
      ],
      commonPitfalls: [
        'Using mutable objects as cache keys — must serialize or use immutable keys',
        'Not considering stack overflow for deep recursion — convert to tabulation if needed',
        'Cache key collisions: ensure the key uniquely identifies the state',
        'Forgetting to memoize all paths — every recursive call must check the cache'
      ],
      interviewTips: [
        'Start with brute-force recursion, identify overlapping subproblems, add memo',
        'This is the fastest way to solve DP problems in interviews — optimize later if needed',
        'Interviewers often accept memoized solutions — tabulation is an optimization step',
        'Draw the recursion tree to identify overlapping subproblems visually'
      ],
      relatedConcepts: ['tabulation', 'recursion', 'fibonacci'],
      difficulty: 'beginner',
      tags: ['top-down', 'recursion', 'caching'],
      proTip: 'In interviews, always start with memoization. It is easier to get right because it follows the recursive structure of the problem. You can optimize to tabulation after getting the correct answer. Many interviewers explicitly prefer this approach because it shows clear thinking.'
    },
    {
      id: 'tabulation',
      title: 'Tabulation (Bottom-Up DP)',
      description: 'Tabulation builds the solution iteratively from the smallest subproblems up. It fills a table (usually an array) in a specific order so that when you compute dp[i], all its dependencies dp[j] (j < i) are already computed. It avoids recursion overhead, is easier to optimize for space (rolling arrays), and is generally faster due to sequential memory access. The challenge is determining the correct fill order.',
      timeComplexity: { best: 'O(subproblems * cost_per)', average: 'O(subproblems * cost_per)', worst: 'O(subproblems * cost_per)' },
      spaceComplexity: 'O(subproblems), reducible with rolling array',
      keyPoints: [
        'Iterative: no recursion stack, no stack overflow risk',
        'Computes ALL subproblems — less efficient than memo when many states are unreachable',
        'Sequential memory access: cache-friendly, faster in practice than memoization',
        'Space optimization via rolling array: if dp[i] only depends on dp[i-1] (or dp[i-1] and dp[i-2]), use O(1) space',
        'Fill order must respect dependencies: compute smaller subproblems first',
        'State definition: clearly define what dp[i] (or dp[i][j]) represents',
        'Recurrence relation: express dp[i] in terms of previously computed states',
        'Base cases: initialize the table with known values before filling'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Tabulation with Space Optimization',
          code: `// Fibonacci: O(n) time, O(1) space
function fibTab(n: number): number {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

// Unique Paths: 2D -> 1D space optimization
function uniquePathsTab(m: number, n: number): number {
  // Full 2D table
  // const dp = Array.from({ length: m }, () => new Array(n).fill(1));
  // for (let i = 1; i < m; i++)
  //   for (let j = 1; j < n; j++)
  //     dp[i][j] = dp[i-1][j] + dp[i][j-1];
  // return dp[m-1][n-1];

  // Optimized: single row, O(n) space
  const dp = new Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[j] += dp[j - 1]; // dp[j] already has value from row above
    }
  }
  return dp[n - 1];
}

// DP template
function dpTemplate(input: number[]): number {
  const n = input.length;
  // 1. Define state: dp[i] = answer for input[0..i-1]
  const dp = new Array(n + 1).fill(0);

  // 2. Base case
  dp[0] = 0; // or whatever the base case is

  // 3. Fill table (respecting dependency order)
  for (let i = 1; i <= n; i++) {
    dp[i] = Math.max(
      dp[i - 1],                    // skip current
      dp[i - 1] + input[i - 1]     // take current (example)
    );
  }

  // 4. Answer
  return dp[n];
}`
        }
      ],
      useCases: [
        'When all subproblems need to be computed (dense state space)',
        'When recursion depth would cause stack overflow',
        'Performance-critical code: sequential access is cache-friendly',
        'When space optimization via rolling array is needed',
        'Production code: iterative is generally preferred over recursive'
      ],
      commonPitfalls: [
        'Wrong fill order: computing dp[i] before its dependencies are ready',
        'Off-by-one in table dimensions: dp should have n+1 entries for 1-indexed problems',
        'Space optimization breaking reconstruction: if you reduce to O(1) space, you lose the path',
        'Forgetting base cases: uninitialized dp entries lead to wrong results'
      ],
      interviewTips: [
        'After solving with memoization, offer to convert to tabulation for optimization',
        'Rolling array optimization impresses interviewers — mention it even if you do not implement it',
        'State definition is the hardest part: "dp[i] represents X for the first i elements"',
        'Draw the DP table on paper before coding — helps catch dependency order issues'
      ],
      relatedConcepts: ['memoization', 'rolling-array', 'space-optimization'],
      difficulty: 'beginner',
      tags: ['bottom-up', 'iterative', 'table'],
      proTip: 'The rolling array trick works whenever dp[i] depends only on dp[i-1] (or a fixed number of previous rows). For 2D DP tables where dp[i][j] depends on dp[i-1][j] and dp[i][j-1], you can reduce from O(mn) to O(n) space by keeping only the current row and updating in-place.'
    },
    {
      id: 'knapsack-01',
      title: '0/1 Knapsack',
      description: 'Given items with weights and values, find the maximum value subset that fits in a knapsack of capacity W. Each item can be taken or left (0 or 1 — no fractions). The recurrence is: dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i]). This is the canonical DP problem and the template for many variants including subset sum, partition equal subset, and target sum.',
      timeComplexity: { best: 'O(n * W)', average: 'O(n * W)', worst: 'O(n * W)' },
      spaceComplexity: 'O(W) with rolling array',
      keyPoints: [
        'State: dp[i][w] = max value using first i items with capacity w',
        'Recurrence: take item i (if it fits) or skip it',
        'Space optimization: single 1D array, iterate w from RIGHT to LEFT (to avoid using current row values)',
        'Reconstruction: track which items were selected by backtracking through the table',
        'Pseudo-polynomial: O(nW) is polynomial in n and W, but W could be exponential in input size',
        'Variants: exact weight (must fill exactly W), bounded (limited copies), multiple constraints',
        'Subset sum is a special case: values = weights, target = W/2',
        'NP-hard in general but tractable for small W due to pseudo-polynomial time'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: '0/1 Knapsack with Space Optimization and Reconstruction',
          code: `function knapsack01(
  weights: number[], values: number[], capacity: number
): { maxValue: number; selectedItems: number[] } {
  const n = weights.length;

  // Full 2D table for reconstruction
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]; // Skip item i
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1] // Take item i
        );
      }
    }
  }

  // Reconstruct selected items
  const selected: number[] = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(i - 1);
      w -= weights[i - 1];
    }
  }

  return { maxValue: dp[n][capacity], selectedItems: selected.reverse() };
}

// Space-optimized version (no reconstruction)
function knapsack01Optimized(
  weights: number[], values: number[], capacity: number
): number {
  const dp = new Array(capacity + 1).fill(0);

  for (let i = 0; i < weights.length; i++) {
    // RIGHT to LEFT: ensures each item is used at most once
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }

  return dp[capacity];
}`
        }
      ],
      useCases: [
        'Resource allocation with budget constraints',
        'Portfolio optimization (select investments with limited capital)',
        'Cargo loading with weight limits',
        'Subset sum and partition problems (special cases)',
        'Feature selection in machine learning (maximize accuracy within complexity budget)'
      ],
      commonPitfalls: [
        'Space optimization: iterating LEFT to RIGHT allows using an item multiple times (unbounded knapsack)',
        'Off-by-one: dp array should be (n+1) x (W+1), items are 1-indexed in the table',
        'Large W: if W is very large (10^9), knapsack is intractable — consider meet-in-the-middle',
        'Confusing 0/1 knapsack with unbounded knapsack — the iteration direction matters'
      ],
      interviewTips: [
        'Knapsack is THE most common DP problem family — know all variants',
        '"Partition equal subset sum" = knapsack with target W/2',
        '"Target sum with +/-" = knapsack with offset (shift all values to non-negative)',
        'Always mention the space optimization from O(nW) to O(W) — shows depth',
        'If W is too large: mention meet-in-the-middle O(2^(n/2)) approach'
      ],
      relatedConcepts: ['unbounded-knapsack', 'subset-sum', 'coin-change', 'partition-problem'],
      difficulty: 'intermediate',
      tags: ['knapsack', 'optimization', 'subset'],
      proTip: 'The direction of the inner loop is the single most important detail in knapsack DP. Right-to-left = 0/1 knapsack (each item once). Left-to-right = unbounded knapsack (unlimited copies). This one change transforms the problem entirely. Draw a small example to convince yourself why.'
    },
    {
      id: 'unbounded-knapsack',
      title: 'Unbounded Knapsack',
      description: 'Like 0/1 knapsack, but each item can be used unlimited times. The key change: iterate the weight from LEFT to RIGHT (instead of right to left), allowing the same item to contribute multiple times. Coin change is the most common variant. The recurrence is: dp[w] = max(dp[w], dp[w-weight[i]] + value[i]) with left-to-right processing.',
      timeComplexity: { best: 'O(n * W)', average: 'O(n * W)', worst: 'O(n * W)' },
      spaceComplexity: 'O(W)',
      keyPoints: [
        'Same as 0/1 knapsack but items can be reused',
        'Key difference: iterate weight LEFT to RIGHT — allows multiple uses of same item',
        'Coin change (min coins) is the classic unbounded knapsack variant',
        'Coin change (count ways) is a related but different problem (order matters vs not)',
        'Rod cutting is unbounded knapsack: cut lengths are "items," rod length is "capacity"',
        'Can be solved with 1D array directly — no need for 2D table',
        'Complete search with pruning can sometimes beat DP for very large W with few items'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Unbounded Knapsack and Coin Change Variants',
          code: `// Unbounded Knapsack: maximize value with unlimited items
function unboundedKnapsack(
  weights: number[], values: number[], capacity: number
): number {
  const dp = new Array(capacity + 1).fill(0);

  for (let i = 0; i < weights.length; i++) {
    // LEFT to RIGHT: allows reusing item i
    for (let w = weights[i]; w <= capacity; w++) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }

  return dp[capacity];
}

// Coin Change: minimum coins to make amount
function coinChangeMin(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (const coin of coins) {
    for (let a = coin; a <= amount; a++) {
      dp[a] = Math.min(dp[a], dp[a - coin] + 1);
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

// Coin Change: count number of ways (combinations, not permutations)
function coinChangeWays(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;

  // Outer loop on coins = combinations (each coin considered once)
  for (const coin of coins) {
    for (let a = coin; a <= amount; a++) {
      dp[a] += dp[a - coin];
    }
  }

  return dp[amount];
}

// Count permutations (order matters)
function coinChangePermutations(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;

  // Outer loop on amount = permutations
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (a >= coin) dp[a] += dp[a - coin];
    }
  }

  return dp[amount];
}`
        }
      ],
      useCases: [
        'Coin change: minimum coins or count ways',
        'Rod cutting: maximize revenue from cutting a rod',
        'Ribbon cutting: maximize number of pieces',
        'Resource allocation with unlimited supply',
        'Integer partition problems'
      ],
      commonPitfalls: [
        'Wrong loop order for "count combinations" vs "count permutations" — outer coins vs outer amount',
        'Forgetting dp[0] = 1 for counting problems — base case is one way to make amount 0',
        'Using right-to-left iteration — that gives 0/1 knapsack, not unbounded',
        'Not handling the "impossible" case: return -1 when dp[amount] stays at Infinity'
      ],
      interviewTips: [
        'Coin change is one of the most frequently asked DP questions',
        'Know both variants: min coins AND count ways — they have different recurrences',
        'The "combinations vs permutations" loop order trick is a common follow-up',
        'Rod cutting = unbounded knapsack — recognize the mapping'
      ],
      relatedConcepts: ['knapsack-01', 'coin-change', 'rod-cutting', 'integer-partition'],
      difficulty: 'intermediate',
      tags: ['knapsack', 'unlimited', 'coin-change'],
      proTip: 'The difference between counting combinations and permutations in coin change comes down to loop nesting. Coins-outer counts combinations (each set counted once). Amount-outer counts permutations (1+2 and 2+1 are different). This is a subtle but critical distinction that trips up even experienced developers.'
    },
    {
      id: 'lcs',
      title: 'Longest Common Subsequence',
      description: 'LCS finds the longest subsequence common to two sequences. It is the foundation for diff utilities, version control, and DNA sequence alignment. The DP recurrence: if characters match, dp[i][j] = dp[i-1][j-1] + 1; otherwise, dp[i][j] = max(dp[i-1][j], dp[i][j-1]). Space can be optimized to O(min(m,n)). LCS is closely related to edit distance — edit distance = m + n - 2*LCS.',
      timeComplexity: { best: 'O(m * n)', average: 'O(m * n)', worst: 'O(m * n)' },
      spaceComplexity: 'O(min(m, n)) with optimization',
      keyPoints: [
        'Subsequence (not substring): elements need not be contiguous',
        'Recurrence: match => diagonal+1, no match => max(left, top)',
        'Space optimization: two rows or single row with careful tracking',
        'Print LCS: backtrack through the DP table from dp[m][n]',
        'Relationship: edit_distance = m + n - 2 * LCS_length',
        'LCS of 3+ strings: extend to 3D DP, O(n^3) — rarely practical',
        'Hunt-Szymanski algorithm: O(r log n) where r = number of matching pairs — faster when alphabet is small',
        'diff and patch utilities (git diff) are based on LCS computation'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'LCS with Reconstruction',
          code: `function lcs(a: string, b: string): { length: number; subsequence: string } {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Reconstruct
  let i = m, j = n;
  const result: string[] = [];
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.push(a[i - 1]);
      i--; j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return { length: dp[m][n], subsequence: result.reverse().join('') };
}

// Space-optimized LCS (length only)
function lcsLength(a: string, b: string): number {
  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;
  const m = longer.length, n = shorter.length;

  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (longer[i - 1] === shorter[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
    curr.fill(0);
  }

  return prev[n];
}`
        }
      ],
      useCases: [
        'Diff utilities: git diff, file comparison tools',
        'DNA/protein sequence alignment (bioinformatics)',
        'Spell checking and autocorrect',
        'Version control: merging and conflict detection',
        'Plagiarism detection'
      ],
      commonPitfalls: [
        'Confusing subsequence with substring — substring is contiguous, subsequence is not',
        'Off-by-one: dp table is (m+1) x (n+1), strings are 0-indexed but dp is 1-indexed',
        'Space optimization loses reconstruction ability — keep full table if you need the actual LCS',
        'Not swapping to use the shorter string as the column dimension for space optimization'
      ],
      interviewTips: [
        'LCS is a top-10 DP problem — know it cold with reconstruction',
        '"Minimum operations to make two strings equal" = edit distance, related to LCS',
        'If asked for longest common substring (contiguous): reset to 0 instead of taking max',
        'Know the relationship: edit_distance(a,b) = len(a) + len(b) - 2 * LCS(a,b)'
      ],
      relatedConcepts: ['edit-distance', 'lis', 'longest-common-substring', 'diff'],
      difficulty: 'intermediate',
      tags: ['string', 'subsequence', '2d-dp'],
      proTip: 'LCS can be computed in O(n log n) when the alphabet is small by reducing it to LIS (Longest Increasing Subsequence). Map characters of string A to their positions in string B, then find the LIS. This is the algorithm behind the Unix diff utility and is significantly faster for large files with small alphabets.'
    },
    {
      id: 'lis',
      title: 'Longest Increasing Subsequence',
      description: 'LIS finds the longest strictly increasing subsequence. The O(n^2) DP solution is straightforward, but the O(n log n) patience sorting algorithm is the key insight: maintain an array of the smallest tail elements for increasing subsequences of each length, using binary search for insertion. LIS connects to many problems: box stacking, longest chain, and Russian doll envelopes.',
      timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'O(n^2) DP: dp[i] = length of LIS ending at index i',
        'O(n log n) patience sorting: maintain tails array, binary search for position',
        'tails[i] = smallest tail element of all increasing subsequences of length i+1',
        'Binary search: find first tails[j] >= arr[i], replace it (or extend if arr[i] > all)',
        'The tails array length is the LIS length, but it is NOT the actual LIS',
        'To reconstruct the actual LIS: track predecessors during patience sorting',
        'Variants: non-decreasing (use upper_bound), strictly increasing (use lower_bound)',
        'LIS connects to LCS: LIS of array A = LCS(A, sorted(A)) when elements are distinct'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'LIS O(n log n) with Reconstruction',
          code: `function lis(arr: readonly number[]): { length: number; subsequence: number[] } {
  const n = arr.length;
  if (n === 0) return { length: 0, subsequence: [] };

  const tails: number[] = [];    // tails[i] = smallest tail of LIS of length i+1
  const indices: number[] = [];   // indices[i] = index of tails[i] in arr
  const parent: number[] = new Array(n).fill(-1);

  for (let i = 0; i < n; i++) {
    // Binary search: first index in tails >= arr[i]
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (tails[mid] < arr[i]) lo = mid + 1;
      else hi = mid;
    }

    tails[lo] = arr[i];
    indices[lo] = i;

    // Track predecessor for reconstruction
    if (lo > 0) parent[i] = indices[lo - 1];
  }

  // Reconstruct LIS
  const lisLength = tails.length;
  const result: number[] = [];
  let idx = indices[lisLength - 1];
  while (idx !== -1) {
    result.push(arr[idx]);
    idx = parent[idx];
  }

  return { length: lisLength, subsequence: result.reverse() };
}

// O(n^2) version (simpler, useful for small n)
function lisQuadratic(arr: readonly number[]): number {
  const n = arr.length;
  const dp = new Array(n).fill(1);

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  return Math.max(...dp, 0);
}`
        }
      ],
      useCases: [
        'Finding longest chain of nested objects (Russian doll envelopes)',
        'Patience sorting card game (the origin of the algorithm)',
        'Optimal scheduling: longest chain of non-overlapping intervals',
        'Box stacking: 2D or 3D LIS variant',
        'Longest non-decreasing subsequence (change to <= in binary search)'
      ],
      commonPitfalls: [
        'The tails array is NOT the LIS — it holds smallest tail elements, not the actual subsequence',
        'Using upper_bound vs lower_bound matters: strictly increasing = lower_bound, non-decreasing = upper_bound',
        'Off-by-one in binary search: use [0, tails.length) range, not [0, tails.length-1]',
        'Reconstruction requires extra tracking — many candidates forget this step'
      ],
      interviewTips: [
        'LIS appears frequently — know both O(n^2) and O(n log n) solutions',
        '"Russian doll envelopes" = sort by one dimension, LIS on the other',
        'If asked for longest non-decreasing: subtle change in the binary search comparison',
        'Patience sorting analogy helps explain the algorithm clearly to interviewers',
        'The O(n log n) solution is often the expected complexity for "hard" LIS problems'
      ],
      relatedConcepts: ['lcs', 'patience-sorting', 'binary-search', 'russian-doll-envelopes'],
      difficulty: 'intermediate',
      tags: ['subsequence', 'binary-search', 'patience-sorting'],
      proTip: 'Patience sorting gets its name from the card game Patience (Solitaire). Each pile has cards in decreasing order; you place each new card on the leftmost pile where it fits (binary search). The number of piles = LIS length. This is not just an analogy — it is literally how the algorithm works, and understanding the card game makes the algorithm intuitive.'
    },
    {
      id: 'edit-distance',
      title: 'Edit Distance (Levenshtein)',
      description: 'Edit distance measures the minimum number of insertions, deletions, and substitutions to transform one string into another. The DP table dp[i][j] represents the edit distance between the first i characters of string A and the first j characters of string B. Edit distance is foundational in spell checking, DNA alignment, and fuzzy string matching. Related to LCS: edit_distance(a,b) = m + n - 2*LCS(a,b) when only insert/delete are allowed.',
      timeComplexity: { best: 'O(m * n)', average: 'O(m * n)', worst: 'O(m * n)' },
      spaceComplexity: 'O(min(m, n))',
      keyPoints: [
        'Three operations: insert, delete, substitute (each costs 1 in standard Levenshtein)',
        'Recurrence: match => diagonal, mismatch => 1 + min(diagonal, left, top)',
        'Base cases: dp[i][0] = i (delete all), dp[0][j] = j (insert all)',
        'Space optimization: O(min(m,n)) using two rows',
        'Print edits: backtrack through the DP table',
        'Bounded edit distance: if you only care whether distance <= k, can be done in O(nk)',
        'Weighted edit distance: different costs for insert/delete/substitute',
        'Damerau-Levenshtein adds transposition (swap adjacent characters) as a fourth operation'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Edit Distance with Operation Reconstruction',
          code: `function editDistance(
  a: string, b: string
): { distance: number; operations: string[] } {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // Match
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j - 1], // Substitute
          dp[i - 1][j],     // Delete from a
          dp[i][j - 1]      // Insert into a
        );
      }
    }
  }

  // Reconstruct operations
  const ops: string[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      i--; j--; // Match
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.push(\`Substitute '\${a[i - 1]}' with '\${b[j - 1]}' at position \${i - 1}\`);
      i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.push(\`Delete '\${a[i - 1]}' at position \${i - 1}\`);
      i--;
    } else {
      ops.push(\`Insert '\${b[j - 1]}' at position \${i}\`);
      j--;
    }
  }

  return { distance: dp[m][n], operations: ops.reverse() };
}`
        }
      ],
      useCases: [
        'Spell checking and autocorrect',
        'DNA sequence alignment (bioinformatics)',
        'Fuzzy string matching and search',
        'Version control: computing diffs',
        'Natural language processing: measuring string similarity'
      ],
      commonPitfalls: [
        'Base case initialization: dp[i][0] = i, dp[0][j] = j — not all zeros',
        'Confusing which operation corresponds to which direction in the table',
        'Using edit distance when Hamming distance suffices (same-length strings, substitution only)',
        'Not considering bounded edit distance when only approximate matching is needed'
      ],
      interviewTips: [
        'Edit distance is a top-5 DP interview problem — know it with reconstruction',
        'If only insert/delete allowed: edit_distance = m + n - 2 * LCS',
        'Follow-up: "Can you do it in O(nk) time?" — bounded edit distance with band optimization',
        'Variant: "one edit distance" — check if exactly one operation transforms a to b (O(n), no DP needed)'
      ],
      relatedConcepts: ['lcs', 'wildcard-matching', 'regex-matching', 'hamming-distance'],
      difficulty: 'intermediate',
      tags: ['string', '2d-dp', 'distance'],
      proTip: 'For spell checking in production, you do not compute edit distance against every word in the dictionary. Instead, use a BK-tree (Burkhard-Keller tree) that organizes the dictionary by edit distance, allowing you to prune the search space dramatically. Combined with a trie for prefix matching, this is how modern spell checkers achieve real-time performance.'
    },
    {
      id: 'coin-change',
      title: 'Coin Change',
      description: 'Two classic variants: (1) minimum number of coins to make an amount, and (2) count the number of ways to make the amount. These map to unbounded knapsack with different objective functions. The subtle distinction between counting combinations (outer loop on coins) vs permutations (outer loop on amount) is crucial and frequently tested.',
      timeComplexity: { best: 'O(n * amount)', average: 'O(n * amount)', worst: 'O(n * amount)' },
      spaceComplexity: 'O(amount)',
      keyPoints: [
        'Min coins: dp[a] = min coins to make amount a; dp[a] = min(dp[a], dp[a-coin] + 1)',
        'Count ways (combinations): outer loop on coins, inner on amount',
        'Count ways (permutations): outer loop on amount, inner on coins',
        'Base case: dp[0] = 0 for min coins, dp[0] = 1 for count ways',
        'Impossible case: dp[amount] remains Infinity — return -1',
        'Greedy does NOT work for arbitrary coin systems — only for canonical systems (most real currencies)',
        'Frobenius number: largest amount that CANNOT be made with coins a, b (where gcd(a,b)=1) is ab-a-b',
        'This is the unbounded knapsack — each coin can be used unlimited times'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'All Coin Change Variants',
          code: `// Minimum coins to make amount
function minCoins(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (const coin of coins) {
    for (let a = coin; a <= amount; a++) {
      dp[a] = Math.min(dp[a], dp[a - coin] + 1);
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

// Count combinations (unordered ways)
function countCombinations(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const coin of coins) {
    for (let a = coin; a <= amount; a++) {
      dp[a] += dp[a - coin];
    }
  }
  return dp[amount];
}

// Count permutations (ordered ways)
function countPermutations(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (a >= coin) dp[a] += dp[a - coin];
    }
  }
  return dp[amount];
}`
        }
      ],
      useCases: [
        'Currency denomination problems',
        'Making change in vending machines',
        'Resource allocation with fixed-size units',
        'Integer composition and partition counting'
      ],
      commonPitfalls: [
        'Using greedy for non-canonical coin systems (e.g., {1, 3, 4} for amount 6: greedy gives 4+1+1 but optimal is 3+3)',
        'Wrong loop order for combinations vs permutations',
        'Not initializing dp[0] = 1 for counting problems',
        'Returning 0 instead of -1 when the amount is not achievable'
      ],
      interviewTips: [
        'Know both variants cold — this is one of the most common DP problems',
        'The greedy approach only works for "canonical" coin systems — always mention this caveat',
        'If asked for the actual coins used: track the last coin used at each amount and reconstruct',
        'Follow-up: "What if each coin can only be used once?" — that is the 0/1 knapsack variant'
      ],
      relatedConcepts: ['unbounded-knapsack', 'knapsack-01', 'rod-cutting'],
      difficulty: 'intermediate',
      tags: ['coin-change', 'counting', 'unbounded'],
      proTip: 'Most real-world coin systems (1, 5, 10, 25) are "canonical" — the greedy algorithm (always pick the largest coin) gives the optimal result. A coin system is canonical iff the greedy algorithm produces optimal results for all amounts. Testing whether a system is canonical can be done in polynomial time, but the proof is non-trivial.'
    },
    {
      id: 'matrix-chain',
      title: 'Matrix Chain Multiplication',
      description: 'Given a chain of matrices to multiply, find the optimal parenthesization that minimizes the total number of scalar multiplications. This is the canonical interval DP problem: dp[i][j] = minimum cost to multiply matrices i through j. The recurrence splits at every possible position k: dp[i][j] = min over k of (dp[i][k] + dp[k+1][j] + cost of combining). This pattern appears in many problems beyond matrix multiplication.',
      timeComplexity: { best: 'O(n^3)', average: 'O(n^3)', worst: 'O(n^3)' },
      spaceComplexity: 'O(n^2)',
      keyPoints: [
        'Interval DP: dp[i][j] represents optimal solution for the range [i, j]',
        'Split point k: try every possible split and take the minimum',
        'Cost of combining: dimensions[i] * dimensions[k+1] * dimensions[j+1]',
        'Fill order: by increasing interval length (length 1, then 2, then 3, ...)',
        'Parenthesization reconstruction: track the split point for each interval',
        'The same pattern applies to: optimal BST, burst balloons, polygon triangulation',
        'Hu-Shing algorithm solves this in O(n log n) but is rarely asked',
        'The number of parenthesizations is the Catalan number C(n-1) — exponential without DP'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Matrix Chain with Parenthesization Reconstruction',
          code: `function matrixChain(
  dims: number[] // dims[i] x dims[i+1] = dimensions of matrix i
): { minCost: number; parenthesization: string } {
  const n = dims.length - 1; // number of matrices
  const dp: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0)
  );
  const split: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0)
  );

  // Fill by increasing chain length
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;

      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] +
          dims[i] * dims[k + 1] * dims[j + 1];
        if (cost < dp[i][j]) {
          dp[i][j] = cost;
          split[i][j] = k;
        }
      }
    }
  }

  function buildParens(i: number, j: number): string {
    if (i === j) return \`M\${i}\`;
    return \`(\${buildParens(i, split[i][j])} x \${buildParens(split[i][j] + 1, j)})\`;
  }

  return {
    minCost: dp[0][n - 1],
    parenthesization: buildParens(0, n - 1)
  };
}`
        }
      ],
      useCases: [
        'Optimizing matrix multiplication order in scientific computing',
        'SQL query optimization: join ordering in database query planners',
        'Interval DP template for many optimization problems',
        'Polygon triangulation with minimum cost',
        'Optimal binary search tree construction'
      ],
      commonPitfalls: [
        'Wrong fill order: must process shorter intervals before longer ones',
        'Off-by-one in dimensions: n matrices need n+1 dimension values',
        'Not initializing diagonal to 0 (single matrix has 0 multiplication cost)',
        'Confusing the split point k with matrix indices — k splits between matrix k and k+1'
      ],
      interviewTips: [
        'Matrix chain itself is rare in interviews, but the interval DP pattern is common',
        '"Burst Balloons" (Leetcode 312) uses the same pattern',
        'Key: recognize when a problem has "split the range" structure = interval DP',
        'The fill-by-length approach is the standard way to implement interval DP'
      ],
      relatedConcepts: ['burst-balloons', 'optimal-bst', 'interval-dp', 'palindrome-partitioning'],
      difficulty: 'advanced',
      tags: ['interval-dp', 'optimization', 'cubic'],
      proTip: 'The interval DP pattern is one of the most reusable patterns in competitive programming. Anytime you see a problem where you need to "optimally split a sequence" — whether it is matrices, balloons, stones, or palindromes — think interval DP. The recurrence is always: dp[i][j] = optimize over k of (dp[i][k] + dp[k+1][j] + combine cost).'
    },
    {
      id: 'stock-problems',
      title: 'Stock Buy/Sell Problems (State Machine DP)',
      description: 'The stock problem family (Buy/Sell I through VI) is best understood through state machine DP. Define states based on what you are "holding" (stock or cash) and what constraints apply (number of transactions, cooldown, fee). Transitions between states model buy/sell/rest actions. This state machine framework generalizes to any constrained optimization where decisions depend on current state.',
      timeComplexity: { best: 'O(n)', average: 'O(n * k)', worst: 'O(n * k)' },
      spaceComplexity: 'O(k) or O(1) for unlimited transactions',
      keyPoints: [
        'State machine: at each day, you are in one of several states (holding, not holding, cooldown)',
        'Stock I (1 transaction): track min price, max profit = price - min_so_far',
        'Stock II (unlimited): sum all positive differences (greedy) or DP with 2 states',
        'Stock III (2 transactions): 4 states — buy1, sell1, buy2, sell2',
        'Stock IV (k transactions): generalize to 2k states or dp[k][n]',
        'With cooldown: add a "rest" state after selling, cannot buy immediately',
        'With transaction fee: subtract fee from profit when selling',
        'For k >= n/2, reduce to unlimited case (cannot do more than n/2 transactions anyway)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Stock Problems: State Machine Approach',
          code: `// Stock I: At most 1 transaction
function maxProfitI(prices: number[]): number {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }
  return maxProfit;
}

// Stock II: Unlimited transactions
function maxProfitII(prices: number[]): number {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      profit += prices[i] - prices[i - 1];
    }
  }
  return profit;
}

// Stock III: At most 2 transactions
function maxProfitIII(prices: number[]): number {
  let buy1 = -Infinity, sell1 = 0;
  let buy2 = -Infinity, sell2 = 0;

  for (const price of prices) {
    buy1 = Math.max(buy1, -price);         // First buy
    sell1 = Math.max(sell1, buy1 + price);  // First sell
    buy2 = Math.max(buy2, sell1 - price);   // Second buy
    sell2 = Math.max(sell2, buy2 + price);  // Second sell
  }

  return sell2;
}

// Stock IV: At most k transactions
function maxProfitIV(k: number, prices: number[]): number {
  const n = prices.length;
  if (k >= Math.floor(n / 2)) return maxProfitII(prices);

  const buy = new Array(k + 1).fill(-Infinity);
  const sell = new Array(k + 1).fill(0);

  for (const price of prices) {
    for (let t = 1; t <= k; t++) {
      buy[t] = Math.max(buy[t], sell[t - 1] - price);
      sell[t] = Math.max(sell[t], buy[t] + price);
    }
  }

  return sell[k];
}

// With cooldown (must wait 1 day after selling)
function maxProfitCooldown(prices: number[]): number {
  let held = -Infinity;   // Holding stock
  let sold = 0;            // Just sold (cooldown next day)
  let rest = 0;            // Not holding, can buy

  for (const price of prices) {
    const prevHeld = held;
    held = Math.max(held, rest - price);    // Buy or hold
    rest = Math.max(rest, sold);             // Rest or exit cooldown
    sold = prevHeld + price;                 // Sell
  }

  return Math.max(sold, rest);
}

// With transaction fee
function maxProfitFee(prices: number[], fee: number): number {
  let cash = 0;           // Not holding
  let hold = -Infinity;   // Holding stock

  for (const price of prices) {
    cash = Math.max(cash, hold + price - fee);
    hold = Math.max(hold, cash - price);
  }

  return cash;
}`
        }
      ],
      useCases: [
        'Financial modeling: optimal trading strategies',
        'Resource allocation with constrained transactions',
        'Any sequential decision problem with state constraints',
        'Teaching state machine DP as a general framework'
      ],
      commonPitfalls: [
        'Stock III: updating variables in wrong order — use temporary variables or update carefully',
        'Stock IV: not handling the k >= n/2 case — leads to TLE with large k',
        'Cooldown: confusing state transitions — draw the state machine diagram',
        'Initializing buy states to 0 instead of -Infinity — you have not bought yet'
      ],
      interviewTips: [
        'The state machine framework solves ALL stock problems — learn the pattern once',
        'Draw the state diagram: states are circles, transitions are arrows with conditions',
        'Stock I is O(n) one-pass — know this as a warm-up, then generalize',
        'If asked "with at most k transactions and cooldown": combine the patterns',
        'These problems test whether you can model constraints as state transitions'
      ],
      relatedConcepts: ['state-machine', 'greedy', 'sliding-window'],
      difficulty: 'intermediate',
      tags: ['state-machine', 'optimization', 'sequential'],
      proTip: 'The state machine DP framework extends far beyond stock problems. Any problem where you make sequential decisions with constraints on what you can do next (cooldown, capacity limits, mode switching) can be modeled this way. Define your states, draw the transition diagram, and the recurrence writes itself.'
    },
    {
      id: 'digit-dp',
      title: 'Digit DP',
      description: 'Digit DP counts numbers in a range [L, R] that satisfy some property by processing digits from most significant to least significant. The key state is "tight": whether the digits chosen so far match the upper bound exactly (if tight, the next digit is constrained). This technique handles problems like "count numbers from 1 to N with no repeated digits" or "count numbers whose digit sum is prime."',
      timeComplexity: { best: 'O(D * states)', average: 'O(D * states)', worst: 'O(D * states)' },
      spaceComplexity: 'O(D * states)',
      keyPoints: [
        'Process digits from MSB to LSB, tracking "tight" constraint',
        'Tight = true: current prefix matches N exactly, next digit limited to N digit or less',
        'Tight = false: we already placed a smaller digit, remaining digits can be 0-9',
        'Leading zeros: track whether we have placed a non-zero digit yet',
        'Range [L, R] = f(R) - f(L-1) where f(N) = count of valid numbers in [0, N]',
        'Common states: position, tight, leading_zero, digit_sum, digit_mask (for uniqueness)',
        'D = number of digits ~ 18 for 64-bit, states depend on the property being tracked',
        'Template: recursive with memoization on (position, tight, ...extra_state)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Digit DP: Count Numbers with Unique Digits in [1, N]',
          code: `function countUniqueDigitNumbers(n: number): number {
  if (n <= 0) return 0;
  const digits = String(n).split('').map(Number);
  const len = digits.length;
  const memo = new Map<string, number>();

  function dp(
    pos: number,     // Current digit position
    tight: boolean,  // Are we still bounded by N?
    mask: number,    // Bitmask of used digits
    started: boolean // Have we placed a non-zero digit?
  ): number {
    if (pos === len) return started ? 1 : 0;

    const key = \`\${pos},\${tight ? 1 : 0},\${mask},\${started ? 1 : 0}\`;
    if (memo.has(key)) return memo.get(key)!;

    const limit = tight ? digits[pos] : 9;
    let count = 0;

    for (let d = 0; d <= limit; d++) {
      if (started && (mask & (1 << d))) continue; // Digit already used

      const newStarted = started || d > 0;
      const newMask = newStarted ? mask | (1 << d) : 0;
      const newTight = tight && d === limit;

      count += dp(pos + 1, newTight, newMask, newStarted);
    }

    memo.set(key, count);
    return count;
  }

  return dp(0, true, 0, false);
}

// Digit DP Template for range [L, R]
function countInRange(l: number, r: number): number {
  return countUniqueDigitNumbers(r) - countUniqueDigitNumbers(l - 1);
}`
        }
      ],
      useCases: [
        'Count numbers with specific digit properties (unique digits, digit sum, divisibility)',
        'Count numbers without certain digit patterns (no 4, no 13)',
        'Competitive programming: problems on ranges of numbers with digit constraints',
        'Number-theoretic problems where brute force is too slow'
      ],
      commonPitfalls: [
        'Forgetting the leading zeros case — numbers like 007 should be treated as 7',
        'Not using the range decomposition f(R) - f(L-1)',
        'Cache key not including all state dimensions — leads to wrong memoization',
        'Tight flag handling: only the first digit that differs from N releases the tight constraint'
      ],
      interviewTips: [
        'Digit DP appears in competitive programming more than coding interviews',
        'If asked "count numbers from 1 to N with property X": think digit DP',
        'The template is always the same: recursive with (pos, tight, ...state)',
        'Practice: count numbers with no repeated digits, digit sum equals K, divisible by M'
      ],
      relatedConcepts: ['bitmask-dp', 'memoization', 'combinatorics'],
      difficulty: 'advanced',
      tags: ['digit', 'counting', 'range-query'],
      proTip: 'The digit DP template is remarkably stable across problems — only the state and transition logic change. Once you have a working template, solving new digit DP problems becomes a matter of defining the right state. Keep a tested template ready for competitive programming.'
    },
    {
      id: 'bitmask-dp',
      title: 'Bitmask DP',
      description: 'Bitmask DP uses a bitmask to represent subsets of a set of elements, enabling DP over subsets. The classic example is TSP (Traveling Salesman Problem): dp[mask][i] = minimum cost to visit the cities in mask, ending at city i. With n elements, there are 2^n possible masks, making this O(2^n * n) or O(2^n * n^2). Bitmask DP is the standard approach for problems with n <= 20 that require tracking which elements have been used.',
      timeComplexity: { best: 'O(2^n * n)', average: 'O(2^n * n^2)', worst: 'O(2^n * n^2)' },
      spaceComplexity: 'O(2^n * n)',
      keyPoints: [
        'Bitmask represents a subset: bit i is set if element i is included',
        'Common operations: check bit (mask & (1<<i)), set bit (mask | (1<<i)), clear bit (mask & ~(1<<i))',
        'TSP: dp[mask][i] = min cost to visit cities in mask, ending at i; O(2^n * n^2)',
        'Subset enumeration: for (let sub = mask; sub > 0; sub = (sub - 1) & mask)',
        'SOS DP (Sum Over Subsets): compute f(mask) = sum of g(sub) for all sub of mask in O(3^n) or O(2^n * n)',
        'Profile DP: bitmask represents state of a row/column in grid problems',
        'Practical limit: n <= 20-23 for bitmask DP due to exponential space/time',
        'Can combine with other DP dimensions: dp[mask][pos][other_state]'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'TSP with Bitmask DP',
          code: `function tsp(dist: number[][]): number {
  const n = dist.length;
  const ALL = (1 << n) - 1;
  const dp: number[][] = Array.from({ length: 1 << n }, () =>
    new Array(n).fill(Infinity)
  );

  dp[1][0] = 0; // Start at city 0, only city 0 visited

  for (let mask = 1; mask <= ALL; mask++) {
    for (let last = 0; last < n; last++) {
      if (dp[mask][last] === Infinity) continue;
      if (!(mask & (1 << last))) continue; // last must be in mask

      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue; // Already visited

        const newMask = mask | (1 << next);
        dp[newMask][next] = Math.min(
          dp[newMask][next],
          dp[mask][last] + dist[last][next]
        );
      }
    }
  }

  // Return to starting city
  let minCost = Infinity;
  for (let last = 0; last < n; last++) {
    if (dp[ALL][last] + dist[last][0] < minCost) {
      minCost = dp[ALL][last] + dist[last][0];
    }
  }

  return minCost;
}

// Subset enumeration: iterate all subsets of a mask
function enumerateSubsets(mask: number): number[] {
  const subsets: number[] = [0]; // Empty set is always a subset
  for (let sub = mask; sub > 0; sub = (sub - 1) & mask) {
    subsets.push(sub);
  }
  return subsets;
}

// SOS DP: for each mask, compute sum of f[sub] for all sub of mask
function sosDP(f: number[], n: number): number[] {
  const dp = [...f];
  for (let i = 0; i < n; i++) {
    for (let mask = 0; mask < (1 << n); mask++) {
      if (mask & (1 << i)) {
        dp[mask] += dp[mask ^ (1 << i)];
      }
    }
  }
  return dp;
}`
        }
      ],
      useCases: [
        'Traveling Salesman Problem (TSP) for small n',
        'Assignment problems: match n workers to n jobs optimally',
        'Set cover: find minimum sets that cover all elements',
        'Hamilton path/cycle in small graphs',
        'Game state representation for board games with few positions'
      ],
      commonPitfalls: [
        'n > 20: bitmask DP becomes intractable — 2^20 = 1M is the practical limit',
        'Not checking that the current state (mask, last) is reachable before transitioning',
        'Wrong subset enumeration: (sub - 1) & mask misses the empty set — handle separately',
        'Integer overflow: 1 << 31 in JavaScript gives negative number — use 1 << n with n < 31'
      ],
      interviewTips: [
        'TSP is the classic bitmask DP problem — know the O(2^n * n^2) solution',
        'If n <= 20 and you need to track "which elements are used": think bitmask DP',
        'Subset enumeration trick: for (sub = mask; sub > 0; sub = (sub-1) & mask)',
        'If asked about TSP complexity: brute force O(n!), bitmask DP O(2^n * n^2), both exponential but DP is much faster'
      ],
      relatedConcepts: ['digit-dp', 'tsp', 'hamiltonian-path', 'set-cover'],
      difficulty: 'advanced',
      tags: ['bitmask', 'subset', 'exponential', 'state-compression'],
      proTip: 'The SOS (Sum Over Subsets) DP technique computes f(S) = sum over all subsets T of S of g(T) in O(2^n * n) instead of O(3^n). It works by including one new element at a time. This is the bitmask equivalent of prefix sums and appears in competitive programming problems involving subset convolution and Mobius inversion.'
    },
    {
      id: 'tree-dp',
      title: 'Tree DP',
      description: 'Tree DP computes optimal values on tree structures by processing nodes in post-order (children before parent). Each node computes its answer from its children\'s answers. The re-rooting technique extends this: compute the answer for one root, then efficiently re-root to every other node in O(n) total. Tree DP handles problems like tree diameter, maximum independent set, and longest path.',
      timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n * k)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Process bottom-up: compute children first, then parent (post-order DFS)',
        'State at node v depends only on states of v\'s children',
        'Re-rooting: compute answer for root, then transfer to children in O(1) each',
        'Tree diameter: for each node, track two longest paths to leaves; diameter = max of their sum',
        'Maximum independent set: dp[v][0] = v not selected, dp[v][1] = v selected',
        'Subtree DP: dp[v] = answer for the subtree rooted at v',
        'Path DP: track longest/shortest path passing through each node',
        'Tree DP is fundamentally easier than graph DP because trees have no cycles'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Tree DP: Diameter and Maximum Independent Set',
          code: `// Tree Diameter (longest path)
function treeDiameter(adj: number[][]): number {
  const n = adj.length;
  let diameter = 0;

  function dfs(node: number, parent: number): number {
    let max1 = 0, max2 = 0; // Two longest paths from node to leaves

    for (const child of adj[node]) {
      if (child === parent) continue;
      const childDepth = dfs(child, node) + 1;

      if (childDepth > max1) {
        max2 = max1;
        max1 = childDepth;
      } else if (childDepth > max2) {
        max2 = childDepth;
      }
    }

    diameter = Math.max(diameter, max1 + max2);
    return max1;
  }

  dfs(0, -1);
  return diameter;
}

// Maximum Independent Set on Tree
function maxIndependentSet(adj: number[][], values: number[]): number {
  const n = adj.length;
  // dp[v][0] = max value not including v
  // dp[v][1] = max value including v
  const dp: number[][] = Array.from({ length: n }, () => [0, 0]);

  function dfs(node: number, parent: number): void {
    dp[node][1] = values[node];

    for (const child of adj[node]) {
      if (child === parent) continue;
      dfs(child, node);
      dp[node][0] += Math.max(dp[child][0], dp[child][1]);
      dp[node][1] += dp[child][0]; // Cannot include adjacent nodes
    }
  }

  dfs(0, -1);
  return Math.max(dp[0][0], dp[0][1]);
}

// Re-rooting technique: compute answer for every node as root
function rerootDP(adj: number[][]): number[] {
  const n = adj.length;
  const down = new Array(n).fill(0);  // Subtree depth
  const up = new Array(n).fill(0);    // Path going up through parent
  const answer = new Array(n).fill(0);

  // Pass 1: compute subtree answers (bottom-up)
  function dfs1(node: number, parent: number): void {
    for (const child of adj[node]) {
      if (child === parent) continue;
      dfs1(child, node);
      down[node] = Math.max(down[node], down[child] + 1);
    }
  }

  // Pass 2: re-root (top-down)
  function dfs2(node: number, parent: number): void {
    // Find two longest down-paths from node's children
    let max1 = 0, max2 = 0, maxChild = -1;
    for (const child of adj[node]) {
      if (child === parent) continue;
      if (down[child] + 1 > max1) {
        max2 = max1;
        max1 = down[child] + 1;
        maxChild = child;
      } else if (down[child] + 1 > max2) {
        max2 = down[child] + 1;
      }
    }

    for (const child of adj[node]) {
      if (child === parent) continue;
      // up[child] = 1 + max(up[node], best down-path not through child)
      const bestDown = (child === maxChild) ? max2 : max1;
      up[child] = 1 + Math.max(up[node], bestDown);
      dfs2(child, node);
    }

    answer[node] = Math.max(down[node], up[node]);
  }

  dfs1(0, -1);
  dfs2(0, -1);
  return answer;
}`
        }
      ],
      useCases: [
        'Tree diameter and center finding',
        'Maximum/minimum independent set on trees',
        'Optimal facility placement on tree networks',
        'Subtree queries: size, sum, max depth',
        'Re-rooting: compute answer for every possible root efficiently'
      ],
      commonPitfalls: [
        'Not handling the parent check in DFS — causes infinite recursion on undirected trees',
        'Processing top-down instead of bottom-up — children must be computed first',
        'Re-rooting: not handling the "exclude current child" case when computing parent contribution',
        'Forgetting that tree DP assumes exactly n-1 edges — verify the input is a tree'
      ],
      interviewTips: [
        'Tree diameter is a common interview problem — know the DFS approach cold',
        '"House Robber III" (rob non-adjacent nodes in a tree) = max independent set on tree',
        'Re-rooting is an advanced technique that impresses interviewers',
        'Always start by defining what dp[node] represents — the state definition drives everything'
      ],
      relatedConcepts: ['dfs', 'post-order-traversal', 'subtree-queries', 'lca'],
      difficulty: 'advanced',
      tags: ['tree', 'post-order', 'rerooting'],
      proTip: 'The re-rooting technique is one of the most elegant ideas in tree algorithms. The insight: if you know the answer for the root, you can compute the answer for any child by "subtracting" the child subtree contribution and "adding" the rest of the tree. This turns O(n^2) (DFS from every node) into O(n) (two passes). It is the tree equivalent of prefix/suffix decomposition.'
    }
  ]
}
