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

export const searchingCategory: Category = {
  id: 'searching',
  title: 'Searching Algorithms',
  description: 'Search is the foundation of nearly every algorithm. From simple linear scans to the extraordinarily powerful "binary search on the answer" technique, mastering search means mastering how to reduce problem spaces efficiently.',
  icon: '🔍',
  concepts: [
    {
      id: 'linear-search',
      title: 'Linear Search',
      description: 'Linear search scans each element sequentially until the target is found or the array is exhausted. Despite being O(n), it is the correct choice when data is unsorted, small, or when you expect to find the target early. The sentinel optimization eliminates the bounds check from the inner loop, roughly halving the constant factor on modern CPUs.',
      timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Works on unsorted data — no preprocessing required',
        'O(1) best case when the target is the first element',
        'Sentinel optimization: place target at the end, eliminating the i < n check in the loop',
        'For small arrays (n < 20-30), linear search outperforms binary search due to branch prediction',
        'Cache-friendly: sequential memory access pattern',
        'Can be parallelized trivially — split array among threads',
        'Self-organizing search: move found elements toward the front (move-to-front, transpose)',
        'In a linked list, linear search is your only option — O(n) is unavoidable'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Linear Search with Sentinel Optimization',
          code: `function linearSearch(arr: readonly number[], target: number): number {
  // Standard version
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

function linearSearchSentinel(arr: number[], target: number): number {
  const n = arr.length;
  if (n === 0) return -1;

  const last = arr[n - 1];
  arr[n - 1] = target; // Place sentinel

  let i = 0;
  while (arr[i] !== target) i++; // No bounds check needed

  arr[n - 1] = last; // Restore

  if (i < n - 1 || last === target) return i;
  return -1;
}`
        }
      ],
      useCases: [
        'Unsorted data where preprocessing is not justified',
        'Small arrays (n < 30) where simplicity beats asymptotic advantage',
        'Single search on data that will not be searched again',
        'Linked lists where random access is impossible',
        'Finding ALL occurrences (not just first) in a single pass'
      ],
      commonPitfalls: [
        'Using linear search on sorted data when binary search would work',
        'Not considering that for very small n, linear search is faster than binary search',
        'Sentinel optimization mutates the array — not safe for concurrent access or immutable data'
      ],
      interviewTips: [
        'Linear search is rarely the direct question but is often part of brute-force solutions',
        'If you start with linear search, explain that you know it is O(n) and propose optimization',
        'Know when NOT to optimize: if the search is done once on unsorted data, O(n) is optimal',
        'Sentinel technique shows low-level optimization knowledge — mention it in systems interviews'
      ],
      relatedConcepts: ['binary-search', 'hash-table-lookup', 'self-organizing-search'],
      difficulty: 'beginner',
      tags: ['sequential', 'unsorted', 'linear'],
      proTip: 'In performance-critical code, linear search on small arrays often beats binary search and even hash lookups. CPU branch predictors handle sequential scans well, and the entire small array fits in L1 cache. This is why std::find is used for small containers even in C++ standard library implementations.'
    },
    {
      id: 'binary-search',
      title: 'Binary Search',
      description: 'Binary search halves the search space each step by comparing the target with the middle element of a sorted array. It is arguably the most important algorithm in computer science — not just for searching sorted arrays, but as a general technique for any problem with a monotonic predicate. The core idea "if condition holds at mid, search left; otherwise search right" applies far beyond arrays.',
      timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Prerequisite: the search space must have a monotonic property (sorted array is one case)',
        'Classic bug: mid = (lo + hi) / 2 overflows for large lo+hi — use mid = lo + (hi - lo) / 2',
        'Three variants: exact match, lower_bound (first >=), upper_bound (first >)',
        'lower_bound and upper_bound are MORE useful than exact match in practice',
        'Off-by-one errors are the #1 source of bugs — use consistent [lo, hi) or [lo, hi] convention',
        'For rotated sorted arrays: determine which half is sorted, then decide which half to search',
        'Finding peak element: compare mid with mid+1, move toward the larger',
        'log2(10^9) ~ 30 iterations — binary search on massive datasets is nearly instant'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Binary Search: Exact, Lower Bound, Upper Bound',
          code: `// Exact match: returns index of target or -1
function binarySearch(arr: readonly number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return -1;
}

// Lower bound: first index where arr[i] >= target
function lowerBound(arr: readonly number[], target: number): number {
  let lo = 0;
  let hi = arr.length;

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

// Upper bound: first index where arr[i] > target
function upperBound(arr: readonly number[], target: number): number {
  let lo = 0;
  let hi = arr.length;

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] <= target) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

// Search in rotated sorted array
function searchRotated(arr: readonly number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;

    // Left half is sorted
    if (arr[lo] <= arr[mid]) {
      if (arr[lo] <= target && target < arr[mid]) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    } else {
      // Right half is sorted
      if (arr[mid] < target && target <= arr[hi]) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
  }

  return -1;
}`
        }
      ],
      useCases: [
        'Searching sorted arrays, the classic use case',
        'Finding insertion point in a sorted collection',
        'Database index lookups (B-tree internal search)',
        'Binary search on answer (see dedicated concept)',
        'Rotated array search, peak finding, square root calculation',
        'Git bisect: binary search for the commit that introduced a bug'
      ],
      commonPitfalls: [
        'Integer overflow: (lo + hi) / 2 overflows — always use lo + (hi - lo) / 2',
        'Off-by-one: mixing [lo, hi] and [lo, hi) conventions within the same function',
        'Infinite loop: not ensuring lo or hi changes every iteration — verify with 2-element arrays',
        'Returning mid for lower_bound when arr[mid] === target — you need to keep searching left',
        'Forgetting that binary search requires sorted data — obvious but often overlooked in interview stress'
      ],
      interviewTips: [
        'Binary search appears in ~30% of coding interviews — know it COLD',
        'Always clarify: is the array sorted? Can there be duplicates?',
        'Use lower_bound/upper_bound template for duplicate handling — more reliable than exact match',
        'For "search in rotated sorted array": determine which half is sorted, then binary search',
        'For "find peak element": compare mid with mid+1, binary search toward the larger',
        'Test your implementation with: empty array, single element, two elements, target at boundaries'
      ],
      relatedConcepts: ['binary-search-on-answer', 'ternary-search', 'exponential-search', 'interpolation-search'],
      difficulty: 'beginner',
      tags: ['sorted', 'logarithmic', 'divide-and-conquer'],
      proTip: 'The template that eliminates off-by-one errors: use [lo, hi) convention (hi exclusive), loop while lo < hi, set hi = mid (not mid-1) or lo = mid+1. After the loop, lo === hi and points to the answer. This works for both lower_bound and upper_bound — just change the comparison.',
      ascii: `Binary Search on [1, 3, 5, 7, 9, 11], target = 7:

Step 1: lo=0 hi=5  mid=2  arr[2]=5 < 7  -> lo=3
Step 2: lo=3 hi=5  mid=4  arr[4]=9 > 7  -> hi=3
Step 3: lo=3 hi=3  mid=3  arr[3]=7 = 7  -> FOUND at index 3`
    },
    {
      id: 'jump-search',
      title: 'Jump Search',
      description: 'Jump Search works on sorted arrays by jumping ahead by a fixed block size, then doing a linear scan backward when the target is overshot. The optimal block size is sqrt(n), which balances the number of jumps (n/m) with the linear scan length (m), giving O(sqrt(n)) time. It is faster than linear search but slower than binary search — its main advantage is fewer backward jumps, which matters for sequential access storage.',
      timeComplexity: { best: 'O(1)', average: 'O(sqrt(n))', worst: 'O(sqrt(n))' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Optimal block size is sqrt(n) — minimizes max(n/m + m) comparisons',
        'Proof: total comparisons = n/m (jumps) + m (linear scan). Minimize: d/dm(n/m + m) = 0 => m = sqrt(n)',
        'Requires sorted data and supports only forward jumping (no random access needed)',
        'Better than linear search, worse than binary search, but simpler than interpolation search',
        'Useful for systems where backward traversal is expensive (tape storage, some disk patterns)',
        'Can be combined with binary search: jump to the block, then binary search within the block',
        'The block-based approach is conceptually similar to skip lists and B-tree page scanning'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Jump Search',
          code: `function jumpSearch(arr: readonly number[], target: number): number {
  const n = arr.length;
  if (n === 0) return -1;

  const blockSize = Math.floor(Math.sqrt(n));
  let prev = 0;
  let curr = blockSize;

  // Jump forward until we overshoot or reach the end
  while (curr < n && arr[curr] < target) {
    prev = curr;
    curr += blockSize;
  }

  // Linear search in the block [prev, min(curr, n-1)]
  const end = Math.min(curr, n - 1);
  for (let i = prev; i <= end; i++) {
    if (arr[i] === target) return i;
  }

  return -1;
}`
        }
      ],
      useCases: [
        'Sorted data on sequential access media (tape, rotational disk)',
        'When backward traversal is expensive but forward jumps are cheap',
        'Teaching algorithm design: optimizing the trade-off between jump and scan',
        'Systems where binary search random access is too expensive'
      ],
      commonPitfalls: [
        'Using a block size other than sqrt(n) — any other size is suboptimal',
        'Not handling the case where curr exceeds array length',
        'Forgetting that the array must be sorted',
        'Linear scan going backward instead of forward from prev to curr'
      ],
      interviewTips: [
        'Jump search is asked to test whether you can derive sqrt(n) as the optimal block size',
        'Know the proof: minimize n/m + m by taking the derivative and setting to 0',
        'Compare: binary search O(log n), jump search O(sqrt(n)), linear search O(n)',
        'Follow-up: "Can you combine jump and binary search?" — yes, jump to block then binary search in block'
      ],
      relatedConcepts: ['binary-search', 'linear-search', 'interpolation-search'],
      difficulty: 'intermediate',
      tags: ['sorted', 'block-based', 'sublinear'],
      proTip: 'Jump search is a simplified version of the two-level search strategy used in B-trees: jump between pages (blocks), then scan within the page. Understanding this connection helps you reason about database index performance.'
    },
    {
      id: 'interpolation-search',
      title: 'Interpolation Search',
      description: 'Interpolation search improves on binary search by estimating where the target should be based on the value distribution, using linear interpolation: pos = lo + ((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo]). On uniformly distributed data, it achieves O(log log n) — exponentially faster than binary search. However, on adversarial or non-uniform data, it degrades to O(n), making it unsafe without distribution knowledge.',
      timeComplexity: { best: 'O(1)', average: 'O(log log n)', worst: 'O(n)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'O(log log n) average case on UNIFORMLY distributed data — log log(10^9) ~ 5 probes',
        'Linear interpolation: estimate position as if values are evenly spaced',
        'Degrades to O(n) on non-uniform data (e.g., exponential distribution, many duplicates)',
        'Division by zero when arr[lo] === arr[hi] — must handle this edge case',
        'Computed position can fall outside [lo, hi] — clamp it',
        'In practice, rarely used alone — combine with binary search fallback',
        'Conceptually similar to how humans search a dictionary: flip to approximately the right page',
        'Works well for sorted databases with numeric keys and approximately uniform distribution'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Interpolation Search',
          code: `function interpolationSearch(
  arr: readonly number[], target: number
): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    // Avoid division by zero
    if (arr[lo] === arr[hi]) {
      return arr[lo] === target ? lo : -1;
    }

    // Interpolate position
    const pos = lo + Math.floor(
      ((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo])
    );

    if (arr[pos] === target) return pos;
    if (arr[pos] < target) lo = pos + 1;
    else hi = pos - 1;
  }

  return -1;
}`
        }
      ],
      useCases: [
        'Large sorted arrays with approximately uniform value distribution',
        'Database index probing where keys are numeric and uniformly distributed',
        'Phone book lookup — names are not uniform but letters are roughly balanced',
        'When O(log n) is not fast enough and distribution is known to be uniform'
      ],
      commonPitfalls: [
        'Division by zero when arr[lo] === arr[hi] — always check this first',
        'Computed position outside [lo, hi] — clamp or verify range',
        'Assuming uniform distribution without verification — leads to O(n) worst case',
        'Integer overflow in (target - arr[lo]) * (hi - lo) — use large integer types or reorder'
      ],
      interviewTips: [
        'Asked as: "Can you do better than O(log n) on sorted data?" — interpolation search if uniform',
        'Know the log log n analysis: each probe reduces the search space exponentially in the exponent',
        'Compare with binary search: binary always halves, interpolation estimates the position',
        'If asked about worst case: mention that adversarial input makes it O(n), so binary search is safer'
      ],
      relatedConcepts: ['binary-search', 'exponential-search', 'hash-table-lookup'],
      difficulty: 'advanced',
      tags: ['sorted', 'distribution-dependent', 'sublogarithmic'],
      proTip: 'Interpolation search is the idea behind learned indexes (Kraska et al., 2018). A learned index trains a model to predict the position of a key, then does a local search around the prediction. It is interpolation search with a neural network instead of linear interpolation — and it can beat B-trees on read-heavy workloads.'
    },
    {
      id: 'exponential-search',
      title: 'Exponential Search',
      description: 'Exponential search finds the range where the target lies by doubling the index (1, 2, 4, 8, 16, ...) until it overshoots, then performs binary search within that range. It is O(log n) like binary search, but its key advantage is that it works on unbounded/infinite sorted sequences and runs in O(log i) where i is the target position — optimal when the target is near the beginning.',
      timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'O(log i) where i is the position of the target — better than O(log n) when i << n',
        'Two phases: exponential probe (find range) + binary search (find exact position)',
        'Works on unbounded/infinite sorted sequences where n is unknown',
        'The range found is [bound/2, bound], which has at most bound/2 elements',
        'Binary search on this range: O(log(bound/2)) = O(log i) since bound <= 2i',
        'Useful for self-balancing BSTs: if the tree is very unbalanced, skip ahead exponentially',
        'Combined with interpolation search for even better performance on uniform data'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Exponential Search',
          code: `function exponentialSearch(
  arr: readonly number[], target: number
): number {
  const n = arr.length;
  if (n === 0) return -1;
  if (arr[0] === target) return 0;

  // Find range: double the bound until we overshoot
  let bound = 1;
  while (bound < n && arr[bound] < target) {
    bound *= 2;
  }

  // Binary search in [bound/2, min(bound, n-1)]
  let lo = Math.floor(bound / 2);
  let hi = Math.min(bound, n - 1);

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return -1;
}

// Exponential search on infinite/unbounded sorted stream
function searchUnbounded(
  getValue: (index: number) => number, target: number
): number {
  if (getValue(0) === target) return 0;

  let bound = 1;
  while (getValue(bound) < target) {
    bound *= 2;
  }

  let lo = Math.floor(bound / 2);
  let hi = bound;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const val = getValue(mid);
    if (val === target) return mid;
    if (val < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return -1;
}`
        }
      ],
      useCases: [
        'Searching unbounded or infinite sorted sequences',
        'When the target is expected to be near the beginning of a large sorted array',
        'Searching in self-balancing BSTs with varying depths',
        'API pagination: exponentially probe page numbers to find the right range',
        'Log file searching: exponentially probe timestamps to find relevant range'
      ],
      commonPitfalls: [
        'Not handling the arr[0] === target case before entering the doubling loop',
        'Bound overflow: bound *= 2 can overflow — check bound < n before doubling',
        'Off-by-one in the binary search range: should be [bound/2, min(bound, n-1)]',
        'Applying exponential search when simple binary search suffices (i not << n)'
      ],
      interviewTips: [
        'Asked as: "Search in an infinite sorted array" — exponential search is the answer',
        'Know the O(log i) analysis — this is the key differentiator from binary search',
        'Combine with binary search in the second phase — interviewers want to see this',
        'Useful framing: "I do not know the size, so I find the range exponentially then binary search"'
      ],
      relatedConcepts: ['binary-search', 'jump-search', 'interpolation-search'],
      difficulty: 'intermediate',
      tags: ['sorted', 'logarithmic', 'unbounded'],
      proTip: 'Exponential search is how git log --bisect works internally for finding commits in repositories with unknown depth. It is also the strategy behind TCP slow start — exponentially probe bandwidth until congestion is detected, then binary search for the optimal rate.'
    },
    {
      id: 'fibonacci-search',
      title: 'Fibonacci Search',
      description: 'Fibonacci search divides the search space using Fibonacci numbers instead of halving. It compares the target with the element at a Fibonacci-number offset, eliminating roughly one-third or two-thirds of the remaining elements each step. Its key advantage is that it uses only addition and subtraction (no division), and the split ratio (roughly 1:1.618) can be more cache-friendly than binary search on certain memory hierarchies.',
      timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Uses Fibonacci numbers to determine split points: F(k-2) and F(k-1)',
        'No division or multiplication — only addition and subtraction',
        'Split ratio approaches golden ratio (1.618) — slightly uneven compared to binary search 50/50',
        'On average, Fibonacci search does ~4% more comparisons than binary search',
        'Cache advantage: non-power-of-2 splits can avoid cache conflict misses on certain architectures',
        'Historically important for magnetic tape search where seek distance matters',
        'Fibonacci numbers can be precomputed or generated on the fly'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Fibonacci Search',
          code: `function fibonacciSearch(
  arr: readonly number[], target: number
): number {
  const n = arr.length;
  if (n === 0) return -1;

  // Find smallest Fibonacci number >= n
  let fibM2 = 0; // F(k-2)
  let fibM1 = 1; // F(k-1)
  let fib = 1;   // F(k)

  while (fib < n) {
    fibM2 = fibM1;
    fibM1 = fib;
    fib = fibM1 + fibM2;
  }

  let offset = -1;

  while (fib > 1) {
    const i = Math.min(offset + fibM2, n - 1);

    if (arr[i] < target) {
      fib = fibM1;
      fibM1 = fibM2;
      fibM2 = fib - fibM1;
      offset = i;
    } else if (arr[i] > target) {
      fib = fibM2;
      fibM1 = fibM1 - fibM2;
      fibM2 = fib - fibM1;
    } else {
      return i;
    }
  }

  // Check the last remaining element
  if (fibM1 === 1 && offset + 1 < n && arr[offset + 1] === target) {
    return offset + 1;
  }

  return -1;
}`
        }
      ],
      useCases: [
        'Historical: searching on magnetic tape where seek distance matters',
        'Architectures where division is expensive (some embedded processors)',
        'Academic interest: understanding golden-ratio search strategies',
        'Certain cache architectures where non-power-of-2 splits avoid conflict misses'
      ],
      commonPitfalls: [
        'Not clamping the index to n-1 — array out of bounds on the last Fibonacci probe',
        'Incorrect Fibonacci number updates — the three-variable dance is error-prone',
        'Forgetting to check the last remaining element after the main loop',
        'Using Fibonacci search in production when binary search is simpler and essentially identical in performance'
      ],
      interviewTips: [
        'Fibonacci search is rarely asked but demonstrates knowledge of alternative search strategies',
        'Key point: no division required — only addition/subtraction',
        'Compare with binary search: same O(log n), but golden-ratio split vs 50/50 split',
        'If asked "search without division": Fibonacci search is the classic answer'
      ],
      relatedConcepts: ['binary-search', 'golden-section-search', 'ternary-search'],
      difficulty: 'advanced',
      tags: ['sorted', 'logarithmic', 'division-free'],
      proTip: 'Fibonacci search is the discrete cousin of golden section search (used for unimodal optimization). Both use the golden ratio to minimize the maximum number of probes. The golden ratio appears because F(n-1)/F(n) converges to 1/phi, which is the optimal split ratio for minimax search.'
    },
    {
      id: 'ternary-search',
      title: 'Ternary Search',
      description: 'Ternary search finds the maximum or minimum of a unimodal function by dividing the search interval into three parts and eliminating one-third each step. Unlike binary search which requires a monotonic property, ternary search works on functions with a single peak or valley. It is O(log n) but with a larger constant than binary search (log base 3/2 vs log base 2), so it should only be used when the monotonic property needed for binary search does not hold.',
      timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Works on unimodal functions: exactly one peak (or valley)',
        'Splits into 3 parts using m1 = lo + (hi - lo)/3 and m2 = hi - (hi - lo)/3',
        'Each step eliminates 1/3 of the range — log base 3/2 comparisons = 2*log3(n)',
        'Binary search on a derived monotonic property is often faster: 2*log3(n) > log2(n)',
        'For discrete domains: when hi - lo < 3, evaluate all remaining points',
        'For continuous domains: iterate until hi - lo < epsilon',
        'Can be replaced by binary search on the derivative if the derivative is cheap to compute',
        'Used in competitive programming for optimization problems on unimodal functions'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Ternary Search for Maximum of Unimodal Function',
          code: `// Continuous version: find x that maximizes f(x) in [lo, hi]
function ternarySearchMax(
  f: (x: number) => number,
  lo: number,
  hi: number,
  epsilon: number = 1e-9
): number {
  while (hi - lo > epsilon) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;

    if (f(m1) < f(m2)) {
      lo = m1;
    } else {
      hi = m2;
    }
  }
  return (lo + hi) / 2;
}

// Discrete version: find index that maximizes f(i) in [lo, hi]
function ternarySearchDiscrete(
  f: (i: number) => number,
  lo: number,
  hi: number
): number {
  while (hi - lo > 2) {
    const m1 = lo + Math.floor((hi - lo) / 3);
    const m2 = hi - Math.floor((hi - lo) / 3);

    if (f(m1) < f(m2)) {
      lo = m1 + 1;
    } else {
      hi = m2 - 1;
    }
  }

  // Evaluate remaining candidates
  let bestIdx = lo;
  let bestVal = f(lo);
  for (let i = lo + 1; i <= hi; i++) {
    const val = f(i);
    if (val > bestVal) {
      bestVal = val;
      bestIdx = i;
    }
  }
  return bestIdx;
}`
        }
      ],
      useCases: [
        'Finding the maximum or minimum of a unimodal function',
        'Optimization problems where the function has a single peak/valley',
        'Competitive programming: minimize/maximize cost functions',
        'Physics simulations: finding equilibrium points',
        'When binary search cannot be applied because the function is not monotonic'
      ],
      commonPitfalls: [
        'Using ternary search when binary search on a derived property would work — binary search is faster',
        'Applying to non-unimodal functions — ternary search will give wrong results',
        'Discrete version: not handling the base case when hi - lo < 3',
        'Floating-point precision: using == instead of epsilon comparison for convergence'
      ],
      interviewTips: [
        'If asked to find a peak in a bitonic array: binary search (compare mid with mid+1) is simpler',
        'Know when ternary search is needed: true unimodal optimization without a monotonic derivative',
        'Compare: binary search does 1 comparison per step, ternary does 2 but eliminates 1/3 each',
        '2*log3(n) ~ 1.26*log2(n) — ternary search is ~26% slower due to extra comparison per step'
      ],
      relatedConcepts: ['binary-search', 'golden-section-search', 'gradient-descent'],
      difficulty: 'intermediate',
      tags: ['unimodal', 'optimization', 'logarithmic'],
      proTip: 'Almost every ternary search problem can be solved with binary search by finding a monotonic property. If the function has a peak at x*, then f(x) - f(x+1) changes sign at x*. Binary search on this difference is faster and avoids the 2-comparison overhead. Prefer binary search whenever possible.'
    },
    {
      id: 'binary-search-on-answer',
      title: 'Binary Search on Answer',
      description: 'Binary search on the answer is a paradigm where instead of searching a sorted array, you binary search over the space of possible answers. The key insight: if you can efficiently check whether a given value is a valid answer (the "feasibility predicate"), and this predicate is monotonic (all values below some threshold fail, all above pass, or vice versa), then you can binary search on the answer itself. This is one of the most powerful algorithmic techniques and appears in hundreds of problems.',
      timeComplexity: { best: 'O(log(range) * check)', average: 'O(log(range) * check)', worst: 'O(log(range) * check)' },
      spaceComplexity: 'O(1) + check function space',
      keyPoints: [
        'Core pattern: define a monotonic predicate canAchieve(x), binary search on x',
        'The predicate must be monotonic: false...false, true...true (or reversed)',
        'Search space is the range of possible answers, not the input array',
        'Works for: minimize the maximum, maximize the minimum, find threshold',
        'Classic problems: minimum capacity to ship, koko eating bananas, split array largest sum',
        'The check function is often O(n) making total O(n log(range))',
        'Range for integers: [minPossible, maxPossible], binary search the boundary',
        'Range for floats: iterate ~100 times for sufficient precision (2^100 is enough for any range)',
        'Key realization: if you can verify in O(n), you can optimize in O(n log n) via binary search'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Binary Search on Answer: Ship Packages in D Days',
          code: `// Problem: Find minimum ship capacity to ship all packages in D days
// packages[i] = weight of ith package, must ship in order
function shipWithinDays(packages: number[], days: number): number {
  // Binary search on the answer (ship capacity)
  let lo = Math.max(...packages); // Must fit the heaviest package
  let hi = packages.reduce((a, b) => a + b, 0); // Ship everything in 1 day

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (canShip(packages, days, mid)) {
      hi = mid; // Try smaller capacity
    } else {
      lo = mid + 1; // Need more capacity
    }
  }

  return lo;
}

// Feasibility predicate: can we ship with this capacity?
function canShip(
  packages: number[], days: number, capacity: number
): boolean {
  let daysNeeded = 1;
  let currentLoad = 0;

  for (const weight of packages) {
    if (currentLoad + weight > capacity) {
      daysNeeded++;
      currentLoad = 0;
    }
    currentLoad += weight;
  }

  return daysNeeded <= days;
}

// Problem: Koko eating bananas — minimum speed to finish in H hours
function minEatingSpeed(piles: number[], h: number): number {
  let lo = 1;
  let hi = Math.max(...piles);

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const hoursNeeded = piles.reduce(
      (sum, pile) => sum + Math.ceil(pile / mid), 0
    );
    if (hoursNeeded <= h) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  return lo;
}

// Problem: Split array into m parts minimizing the largest sum
function splitArray(nums: number[], m: number): number {
  let lo = Math.max(...nums);
  let hi = nums.reduce((a, b) => a + b, 0);

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (canSplit(nums, m, mid)) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  return lo;
}

function canSplit(
  nums: number[], m: number, maxSum: number
): boolean {
  let parts = 1;
  let currentSum = 0;

  for (const num of nums) {
    if (currentSum + num > maxSum) {
      parts++;
      currentSum = 0;
    }
    currentSum += num;
  }

  return parts <= m;
}`
        }
      ],
      useCases: [
        'Minimize the maximum: ship capacity, painter partition, job scheduling',
        'Maximize the minimum: aggressive cows (place cows to maximize min distance), router placement',
        'Find threshold: minimum speed, minimum time, minimum resources',
        'Kth element problems: kth smallest in matrix, kth smallest pair distance',
        'Any optimization problem where the feasibility check is efficient and monotonic'
      ],
      commonPitfalls: [
        'Non-monotonic predicate: the feasibility function MUST be monotonic for binary search to work',
        'Wrong bounds: lo and hi must bracket the answer — too narrow misses it, too wide wastes iterations',
        'Off-by-one in the predicate: "can we do it with exactly x" vs "can we do it with at most x"',
        'For float answers: not iterating enough times — use a fixed iteration count (100) instead of epsilon',
        'Greedy check function that is incorrect — verify the predicate independently'
      ],
      interviewTips: [
        'This technique appears in ~15% of hard Leetcode problems — learn to recognize the pattern',
        'Signal to look for: "minimize the maximum" or "maximize the minimum"',
        'Always define three things: (1) search space bounds, (2) monotonic predicate, (3) answer extraction',
        'Start by asking: "If I told you the answer was X, could you verify it in O(n)?" If yes, binary search on X',
        'Practice: Koko eating bananas, Split Array Largest Sum, Aggressive Cows, Magnetic Balls'
      ],
      relatedConcepts: ['binary-search', 'greedy-verification', 'parametric-search'],
      difficulty: 'advanced',
      tags: ['binary-search', 'optimization', 'paradigm'],
      proTip: 'The mental model is: separate the "search" from the "check." The binary search navigates the answer space; the predicate function is a completely independent problem. Design and test the predicate function FIRST, then wrap it in binary search. This decomposition makes complex problems surprisingly tractable.'
    }
  ]
}
