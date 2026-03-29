// @ts-nocheck
import type { Category } from '@/lib/types'

export const arraysCategory: Category = {
  id: 'arrays',
  title: 'Arrays & Array Techniques',
  description: 'The foundational data structure — from dynamic resizing internals to advanced query structures built on contiguous memory.',
  icon: '📊',
  concepts: [
    {
      id: 'dynamic-array',
      title: 'Dynamic Array',
      description:
        'A resizable array that doubles its capacity when full, achieving O(1) amortized insertion. The doubling strategy (2x growth factor) balances wasted space against copy frequency — 1.5x wastes less memory but copies more often, while 3x wastes more memory for marginal amortization improvement. Internally, ArrayList (Java), Vec (Rust), and std::vector (C++) all use this strategy with slight variations in growth factor and initial capacity.',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1) amortized',
        worst: 'O(n) — during resize',
      },
      spaceComplexity: 'O(n) — up to 2x actual elements due to over-allocation',
      keyPoints: [
        'Amortized O(1) append: sum of all copies across n insertions is n + n/2 + n/4 + ... ≈ 2n, so average cost per insert is O(1)',
        'Growth factor of 2x means at most 50% wasted space; 1.5x reduces waste to ~33% but increases copy frequency',
        'Shrinking: most implementations do NOT auto-shrink — you must call trimToSize() or shrink_to_fit() explicitly',
        'Cache-friendly: contiguous memory layout means sequential access triggers hardware prefetching',
        'Random access O(1) via pointer arithmetic: base_addr + index * element_size',
        'Insertion/deletion at arbitrary index is O(n) due to shifting — use linked list if frequent mid-insertions needed',
        'Java ArrayList starts at capacity 10; Rust Vec starts at 0 and allocates on first push',
        'In languages with GC (Java, Go), old backing arrays become garbage after resize — can cause GC pressure with large arrays',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Dynamic Array Implementation',
          code: `class DynamicArray<T> {
  private data: (T | undefined)[];
  private count: number;
  private capacity: number;

  constructor(initialCapacity = 4) {
    this.capacity = initialCapacity;
    this.data = new Array(this.capacity);
    this.count = 0;
  }

  push(value: T): void {
    if (this.count === this.capacity) {
      this.resize(this.capacity * 2);
    }
    this.data[this.count] = value;
    this.count++;
  }

  pop(): T | undefined {
    if (this.count === 0) return undefined;
    this.count--;
    const value = this.data[this.count];
    this.data[this.count] = undefined;
    // Shrink if 25% full to avoid thrashing at 50%
    if (this.count > 0 && this.count === Math.floor(this.capacity / 4)) {
      this.resize(Math.floor(this.capacity / 2));
    }
    return value;
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      throw new RangeError(\`Index \${index} out of bounds [0, \${this.count})\`);
    }
    return this.data[index];
  }

  get size(): number {
    return this.count;
  }

  private resize(newCapacity: number): void {
    const newData = new Array(newCapacity);
    for (let i = 0; i < this.count; i++) {
      newData[i] = this.data[i];
    }
    this.data = newData;
    this.capacity = newCapacity;
  }
}`,
        },
      ],
      useCases: [
        'Default collection type when you need indexed access and append',
        'Stack implementation (push/pop from end)',
        'Buffer for streaming data before batch processing',
        'Building results of unknown size (filter, map operations)',
      ],
      commonPitfalls: [
        'Shrinking at 50% capacity causes thrashing if alternating push/pop — shrink at 25% instead',
        'Forgetting that insert-at-index is O(n), not O(1) — profile before assuming "array is fast"',
        'In Java, ArrayList<Integer> boxes every int — use int[] or IntStream for performance-critical code',
        'Pre-allocating too large wastes memory; too small causes repeated resizing during bulk inserts — use ensureCapacity()',
      ],
      interviewTips: [
        'Know the amortized analysis proof: aggregate method (total cost / n operations) or banker\'s method (charge 3 coins per insert)',
        'Be ready to explain why 2x is chosen over 1.5x or 3x — it is a space/time tradeoff',
        'If asked "implement a vector", remember to handle shrinking and bounds checking',
      ],
      relatedConcepts: ['prefix-sum', 'sliding-window', 'two-pointers', 'binary-heap'],
      difficulty: 'beginner',
      tags: ['array', 'amortized', 'resizing', 'contiguous-memory'],
      proTip:
        'In production, the real performance difference between dynamic arrays and linked lists is not algorithmic complexity — it is cache locality. A dynamic array with O(n) mid-insert often beats a linked list with O(1) insert because sequential memory access is 10-100x faster than pointer chasing on modern CPUs.',
    },
    {
      id: 'prefix-sum',
      title: 'Prefix Sum',
      description:
        'A preprocessing technique that builds a cumulative sum array, enabling O(1) range sum queries after O(n) setup. The core insight is that sum(l, r) = prefix[r+1] - prefix[l]. Extends to 2D for submatrix sum queries using inclusion-exclusion, and pairs with the difference array for efficient range updates.',
      timeComplexity: {
        best: 'O(1) per query',
        average: 'O(1) per query',
        worst: 'O(n) build + O(1) per query',
      },
      spaceComplexity: 'O(n) for 1D, O(n*m) for 2D',
      keyPoints: [
        'prefix[i] = sum of elements from index 0 to i-1; prefix[0] = 0 as sentinel',
        'Range sum query: sum(l, r) = prefix[r+1] - prefix[l] — the off-by-one is the #1 bug source',
        '2D prefix sum uses inclusion-exclusion: sum(r1,c1,r2,c2) = P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]',
        'Works with any associative operation that has an inverse: sum (subtract), XOR (XOR), but NOT min/max (use sparse table)',
        'Difference array is the inverse: if D[i] = A[i] - A[i-1], then prefix sum of D recovers A',
        'Can detect if subarray sum equals k: store prefix sums in hashmap, check if (currentPrefix - k) exists',
        'Immutable — once built, the source array cannot change (use Fenwick tree for dynamic updates)',
        'Modular arithmetic works: prefix sum mod M for "subarray sum divisible by k" problems',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: '1D and 2D Prefix Sum',
          code: `// 1D Prefix Sum
function buildPrefixSum(arr: readonly number[]): number[] {
  const prefix = new Array(arr.length + 1).fill(0);
  for (let i = 0; i < arr.length; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
  }
  return prefix;
}

function rangeSum(prefix: readonly number[], l: number, r: number): number {
  return prefix[r + 1] - prefix[l]; // sum of arr[l..r] inclusive
}

// 2D Prefix Sum
function build2DPrefix(matrix: readonly (readonly number[])[]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const prefix: number[][] = Array.from({ length: rows + 1 }, () =>
    new Array(cols + 1).fill(0)
  );
  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      prefix[i][j] =
        matrix[i - 1][j - 1] +
        prefix[i - 1][j] +
        prefix[i][j - 1] -
        prefix[i - 1][j - 1];
    }
  }
  return prefix;
}

function submatrixSum(
  prefix: readonly (readonly number[])[],
  r1: number, c1: number,
  r2: number, c2: number
): number {
  return (
    prefix[r2 + 1][c2 + 1] -
    prefix[r1][c2 + 1] -
    prefix[r2 + 1][c1] +
    prefix[r1][c1]
  );
}`,
        },
      ],
      useCases: [
        'Range sum queries on static arrays (financial running totals, image processing)',
        'Subarray sum equals k (hashmap + prefix sum)',
        'Number of subarrays with sum divisible by k',
        '2D region queries in image processing and game maps',
      ],
      commonPitfalls: [
        'Off-by-one: prefix array has length n+1, and sum(l,r) = prefix[r+1] - prefix[l], NOT prefix[r] - prefix[l-1]',
        'Integer overflow on large arrays — use BigInt or modular arithmetic when sum can exceed 2^53',
        'Forgetting the sentinel prefix[0] = 0, which handles queries starting at index 0',
        '2D inclusion-exclusion: easy to mix up which corners to add and subtract',
      ],
      interviewTips: [
        'When you see "subarray sum" in a problem, immediately think prefix sum + hashmap',
        'Draw the prefix array on paper — visual off-by-one debugging is much faster',
        'For "number of subarrays with sum k": hashmap of prefix_sum -> count, check (current - k)',
      ],
      relatedConcepts: ['difference-array', 'fenwick-tree', 'sparse-table', 'segment-tree'],
      difficulty: 'beginner',
      tags: ['prefix-sum', 'range-query', 'preprocessing', 'cumulative'],
      proTip:
        'The prefix sum + hashmap pattern solves an entire family of problems: subarray sum equals k, longest subarray with sum k, count subarrays divisible by k. The trick is always the same — store prefix[i] in a map and look up (prefix[i] - target).',
    },
    {
      id: 'difference-array',
      title: 'Difference Array',
      description:
        'The inverse of prefix sum — stores differences between consecutive elements so that range updates become O(1). To add value v to range [l, r], just set diff[l] += v and diff[r+1] -= v. After all updates, compute the prefix sum of diff to get the final array. Essential for batch range update problems.',
      timeComplexity: {
        best: 'O(1) per update',
        average: 'O(1) per update',
        worst: 'O(n) to reconstruct array',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'diff[i] = arr[i] - arr[i-1] for i > 0, diff[0] = arr[0]',
        'Range update [l, r] by v: diff[l] += v, diff[r+1] -= v — two operations regardless of range size',
        'Reconstruct original: arr[i] = sum(diff[0..i]) — prefix sum of difference array',
        'Multiple range updates then single reconstruction is O(q + n) vs naive O(q * n)',
        'Works in 2D: apply to rows, then apply to columns (or vice versa)',
        'Cannot answer point queries between updates without reconstruction',
        'Combines with prefix sum: difference array of prefix sum = original array',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Difference Array with Range Updates',
          code: `function applyRangeUpdates(
  length: number,
  updates: readonly { l: number; r: number; val: number }[]
): number[] {
  const diff = new Array(length + 1).fill(0);

  for (const { l, r, val } of updates) {
    diff[l] += val;
    if (r + 1 < length) {
      diff[r + 1] -= val;
    }
  }

  // Reconstruct via prefix sum
  const result = new Array(length);
  result[0] = diff[0];
  for (let i = 1; i < length; i++) {
    result[i] = result[i - 1] + diff[i];
  }
  return result;
}

// Example: array of size 5, add 3 to [1,3], add 2 to [2,4]
const result = applyRangeUpdates(5, [
  { l: 1, r: 3, val: 3 },
  { l: 2, r: 4, val: 2 },
]);
// result: [0, 3, 5, 5, 2]`,
        },
      ],
      useCases: [
        'Batch range increment operations (corporate action on stock prices, bus passenger counts)',
        'Sweep line problems with interval additions',
        'Flight booking / hotel reservation overlap counting',
        'Applying multiple salary raises to employee ranges',
      ],
      commonPitfalls: [
        'Forgetting diff[r+1] -= v (or bounds check when r+1 == n)',
        'Trying to read values between updates without reconstruction — must prefix-sum first',
        'Off-by-one when converting between 0-indexed and 1-indexed ranges',
      ],
      interviewTips: [
        'When you see "apply Q range updates then output final array", difference array is the tool',
        'Recognize that it is the dual of prefix sum — understand both directions',
        'For 2D range updates, apply difference array technique along each dimension independently',
      ],
      relatedConcepts: ['prefix-sum', 'fenwick-tree', 'segment-tree'],
      difficulty: 'intermediate',
      tags: ['difference-array', 'range-update', 'sweep-line'],
      proTip:
        'The difference array pattern appears in disguise in many sweep line problems. Whenever you are adding intervals and want the aggregate, think: "increment at start, decrement after end, prefix sum to read."',
    },
    {
      id: 'suffix-array',
      title: 'Suffix Array',
      description:
        'A sorted array of all suffixes of a string, represented as starting indices. Combined with the LCP (Longest Common Prefix) array, it provides a space-efficient alternative to suffix trees for string algorithms. Construction can be done in O(n log n) with prefix doubling or O(n) with SA-IS/DC3.',
      timeComplexity: {
        best: 'O(n) construction (SA-IS)',
        average: 'O(n log n) construction (prefix doubling)',
        worst: 'O(n log² n) with naive comparison sort',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Stores starting indices of sorted suffixes, NOT the suffixes themselves — O(n) space vs O(n²)',
        'Pattern search via binary search on suffix array: O(m log n) for pattern of length m',
        'LCP array: lcp[i] = length of longest common prefix between sa[i] and sa[i-1]',
        'Kasai\'s algorithm builds LCP array in O(n) from suffix array',
        'SA-IS (Suffix Array Induced Sorting) constructs in O(n) time — used in practice (libdivsufsort)',
        'Replaces suffix tree for most applications with better cache performance and less memory',
        'Applications: longest repeated substring, number of distinct substrings, string matching',
      ],
      useCases: [
        'Bioinformatics: DNA sequence matching and repeated motif finding',
        'Data compression: BWT (Burrows-Wheeler Transform) relies on suffix arrays',
        'Plagiarism detection: longest common substring between documents',
        'Full-text search indexing',
      ],
      commonPitfalls: [
        'Naive O(n² log n) construction by sorting all suffixes is too slow for n > 10⁵',
        'Forgetting sentinel character (must be smaller than all other characters)',
        'LCP array is between consecutive SA entries, not arbitrary pairs',
      ],
      interviewTips: [
        'Know the O(n log n) prefix doubling approach — sort by first 1 char, then 2, 4, 8...',
        'Number of distinct substrings = n(n+1)/2 - sum(LCP array)',
        'Longest repeated substring = max(LCP array)',
      ],
      relatedConcepts: ['standard-trie', 'suffix-trie', 'suffix-array-lcp'],
      difficulty: 'advanced',
      tags: ['suffix-array', 'string', 'sorting', 'lcp'],
      proTip:
        'In competitive programming, the O(n log² n) construction (sort by rank pairs with radix sort) is usually fast enough and much simpler to implement than SA-IS. Only reach for linear construction when n > 10⁶.',
    },
    {
      id: 'sliding-window',
      title: 'Sliding Window',
      description:
        'A technique that maintains a window (subarray) over a sequence, sliding it forward by adding/removing elements at the boundaries. Fixed-size windows slide by one step; variable-size windows expand/shrink based on a constraint. The key insight is avoiding redundant recomputation by incrementally updating the window state.',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n)',
      },
      spaceComplexity: 'O(1) to O(k) depending on window state tracking',
      keyPoints: [
        'Fixed window: size k, slide right by adding arr[r] and removing arr[r-k] each step',
        'Variable window: expand right while valid, shrink left when invalid — both pointers only move forward',
        'Each element is added once and removed at most once → O(n) total, not O(n*k)',
        'The constraint must be monotonic: if window [l,r] is invalid, [l,r+1] is also invalid (for shrink to work)',
        'Combine with hashmap for "longest substring with at most k distinct characters"',
        'Combine with monotonic deque for "sliding window maximum/minimum"',
        'Two pointers is a special case of variable sliding window',
        'Cannot use when the condition is not monotonic (e.g., "exactly k distinct" — use "at most k" minus "at most k-1")',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Fixed and Variable Sliding Window',
          code: `// Fixed window: max sum of subarray of size k
function maxSumFixedWindow(arr: readonly number[], k: number): number {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}

// Variable window: smallest subarray with sum >= target
function minSubarrayLen(target: number, nums: readonly number[]): number {
  let left = 0;
  let windowSum = 0;
  let minLen = Infinity;
  for (let right = 0; right < nums.length; right++) {
    windowSum += nums[right];
    while (windowSum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      windowSum -= nums[left];
      left++;
    }
  }
  return minLen === Infinity ? 0 : minLen;
}

// Longest substring with at most k distinct characters
function longestKDistinct(s: string, k: number): number {
  const freq = new Map<string, number>();
  let left = 0;
  let maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    freq.set(s[right], (freq.get(s[right]) ?? 0) + 1);
    while (freq.size > k) {
      const leftChar = s[left];
      const count = freq.get(leftChar)! - 1;
      if (count === 0) freq.delete(leftChar);
      else freq.set(leftChar, count);
      left++;
    }
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
        },
      ],
      useCases: [
        'Maximum/minimum sum subarray of fixed size',
        'Longest substring without repeating characters',
        'Smallest subarray with sum >= target',
        'Count subarrays with at most k distinct elements',
      ],
      commonPitfalls: [
        'Using sliding window when constraint is not monotonic — "exactly k" needs the "at most k" minus "at most k-1" trick',
        'Forgetting to update window state (hashmap, count) when shrinking from the left',
        'Off-by-one in fixed window: the first valid window ends at index k-1, not k',
        'Not handling empty array or k > array.length edge cases',
      ],
      interviewTips: [
        'If brute force is O(n²) or O(n*k) and involves contiguous subarrays, sliding window likely applies',
        'Always clarify if elements are positive-only — negative numbers break sum-based window shrinking',
        'For "exactly k" problems, explain the two-pass "atMost(k) - atMost(k-1)" technique',
      ],
      relatedConcepts: ['two-pointers', 'monotonic-deque', 'prefix-sum'],
      difficulty: 'intermediate',
      tags: ['sliding-window', 'two-pointers', 'subarray', 'substring'],
      proTip:
        'The "exactly k" → "at most k minus at most k-1" transformation is one of the most powerful tricks in competitive programming. It converts a hard problem into two easy sliding window passes.',
    },
    {
      id: 'two-pointers',
      title: 'Two Pointers',
      description:
        'A technique using two indices that traverse a data structure (usually a sorted array) from opposite ends or in the same direction. The sorted order provides a monotonic property that allows pruning the search space from O(n²) to O(n). The same-direction variant overlaps with sliding window.',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n)',
      },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Opposite-direction: left=0, right=n-1, converge based on comparison (requires sorted input)',
        'Same-direction: slow/fast pointers, one trailing the other (linked list cycle, removing duplicates)',
        'Sorted array two-sum: if sum < target move left++, if sum > target move right-- (binary search in 1D)',
        'Three-sum reduces to two-sum: fix one element, two-pointer on remainder → O(n²) vs O(n³)',
        'Partitioning (Dutch National Flag): three pointers for 3-way partition in single pass',
        'Merge step of merge sort is a two-pointer algorithm',
        'Works on strings: palindrome check, container with most water, trapping rain water',
        'The key invariant: all skipped pairs are provably non-optimal — you must prove this for correctness',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Two Pointers Patterns',
          code: `// Two-sum on sorted array
function twoSum(nums: readonly number[], target: number): [number, number] | null {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return null;
}

// Three-sum = fix one + two-pointer
function threeSum(nums: number[]): number[][] {
  const sorted = [...nums].sort((a, b) => a - b);
  const result: number[][] = [];
  for (let i = 0; i < sorted.length - 2; i++) {
    if (i > 0 && sorted[i] === sorted[i - 1]) continue; // skip duplicates
    let left = i + 1;
    let right = sorted.length - 1;
    while (left < right) {
      const sum = sorted[i] + sorted[left] + sorted[right];
      if (sum === 0) {
        result.push([sorted[i], sorted[left], sorted[right]]);
        while (left < right && sorted[left] === sorted[left + 1]) left++;
        while (left < right && sorted[right] === sorted[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return result;
}

// Remove duplicates from sorted array (same-direction)
function removeDuplicates(nums: number[]): number {
  if (nums.length === 0) return 0;
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1;
}`,
        },
      ],
      useCases: [
        'Two-sum / three-sum / four-sum on sorted arrays',
        'Container with most water, trapping rain water',
        'Merging sorted arrays, intersection of sorted arrays',
        'Palindrome verification and partitioning',
      ],
      commonPitfalls: [
        'Applying two pointers on unsorted array — must sort first or use hashmap instead',
        'Not handling duplicate skipping in three-sum, producing duplicate triplets',
        'Confusing same-direction (sliding window) with opposite-direction (binary search reduction)',
        'Infinite loop when not advancing at least one pointer each iteration',
      ],
      interviewTips: [
        'Always ask: "Is the array sorted?" — if not, consider sorting O(n log n) + two pointers O(n)',
        'For three-sum, explain the duplicate skipping logic clearly — interviewers check this',
        'Two pointers + binary search = O(n log n) alternative when two pointers alone does not work',
      ],
      relatedConcepts: ['sliding-window', 'binary-search', 'merge-sort'],
      difficulty: 'beginner',
      tags: ['two-pointers', 'sorted-array', 'optimization'],
      proTip:
        'Two pointers works because sorted order creates a monotonic relationship between pointer positions and the objective function. If you cannot identify this monotonicity, two pointers is the wrong tool.',
    },
    {
      id: 'sparse-table',
      title: 'Sparse Table',
      description:
        'A static data structure that answers range minimum/maximum queries in O(1) after O(n log n) preprocessing. It works by precomputing answers for all power-of-two length ranges. The O(1) query relies on overlapping subranges being valid for idempotent operations (min, max, GCD) — non-idempotent operations like sum require O(log n) query with disjoint ranges.',
      timeComplexity: {
        best: 'O(1) per query (idempotent)',
        average: 'O(1) per query',
        worst: 'O(n log n) build',
      },
      spaceComplexity: 'O(n log n)',
      keyPoints: [
        'table[k][i] = answer for range [i, i + 2^k - 1]',
        'Build: table[0][i] = arr[i]; table[k][i] = op(table[k-1][i], table[k-1][i + 2^(k-1)])',
        'Query for idempotent op: k = floor(log2(r-l+1)), answer = op(table[k][l], table[k][r-2^k+1])',
        'Overlap is OK for min/max/GCD because min(x,x) = x — but sum(x,x) = 2x, so sum needs non-overlapping decomposition',
        'For sum, use O(log n) query by decomposing range into non-overlapping power-of-two blocks',
        'No updates supported — if you need updates, use segment tree or Fenwick tree',
        'Precompute floor(log2(i)) for all i to avoid recomputing during queries',
        'Practically faster than segment tree for static RMQ due to cache-friendly access and no recursion',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Sparse Table for Range Minimum Query',
          code: `class SparseTable {
  private readonly table: number[][];
  private readonly log: number[];

  constructor(arr: readonly number[]) {
    const n = arr.length;
    const maxLog = Math.floor(Math.log2(n)) + 1;

    // Precompute logarithms
    this.log = new Array(n + 1).fill(0);
    for (let i = 2; i <= n; i++) {
      this.log[i] = this.log[Math.floor(i / 2)] + 1;
    }

    // Build sparse table
    this.table = Array.from({ length: maxLog }, () => new Array(n));
    for (let i = 0; i < n; i++) {
      this.table[0][i] = arr[i];
    }
    for (let k = 1; k < maxLog; k++) {
      for (let i = 0; i + (1 << k) - 1 < n; i++) {
        this.table[k][i] = Math.min(
          this.table[k - 1][i],
          this.table[k - 1][i + (1 << (k - 1))]
        );
      }
    }
  }

  // O(1) range minimum query
  query(l: number, r: number): number {
    const k = this.log[r - l + 1];
    return Math.min(this.table[k][l], this.table[k][r - (1 << k) + 1]);
  }
}`,
        },
      ],
      useCases: [
        'Static range minimum/maximum queries (no updates)',
        'LCA (Lowest Common Ancestor) via Euler tour + RMQ reduction',
        'Finding minimum in sliding window (when window is query-based, not streaming)',
        'GCD queries over static array ranges',
      ],
      commonPitfalls: [
        'Using sparse table for sum — overlapping ranges double-count; use Fenwick tree instead',
        'Forgetting that it is static — any update invalidates the entire table',
        'Off-by-one in table bounds: range [i, i + 2^k - 1] has 2^k elements, not 2^k + 1',
        'Not precomputing log values leads to floating-point precision bugs with Math.log2()',
      ],
      interviewTips: [
        'Sparse table is the go-to for "static array, many min/max queries, no updates"',
        'Know the connection: LCA reduces to RMQ on Euler tour, which sparse table solves in O(1)',
        'Compare with segment tree: sparse table has O(1) query but no updates; segment tree has O(log n) query but supports updates',
      ],
      relatedConcepts: ['segment-tree', 'fenwick-tree', 'binary-heap'],
      difficulty: 'advanced',
      tags: ['sparse-table', 'rmq', 'range-query', 'static'],
      proTip:
        'The real power of sparse table is in the LCA reduction. Once you know that LCA = RMQ on Euler tour depths, and sparse table gives O(1) RMQ, you get O(1) LCA queries — which unlocks O(1) distance queries on trees.',
    },
    {
      id: 'monotonic-stack',
      title: 'Monotonic Stack',
      description:
        'A stack that maintains elements in monotonically increasing or decreasing order. When a new element violates the monotonic property, elements are popped until the property is restored. Each element is pushed and popped at most once, giving O(n) total. The canonical application is "next greater element" — for each element, find the first larger element to its right.',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n) — each element pushed and popped at most once',
      },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Monotonic decreasing stack: pops when new element is greater → finds "next greater element"',
        'Monotonic increasing stack: pops when new element is smaller → finds "next smaller element"',
        'Each element enters and leaves the stack exactly once → O(n) amortized over all operations',
        'The popped element\'s "answer" is the current element that caused the pop',
        'Traverse left-to-right for "next greater to the right", right-to-left for "next greater to the left"',
        'Largest rectangle in histogram: use monotonic increasing stack, pop computes max area for popped height',
        'Stock span: for each day, how many consecutive days had price <= today — monotonic decreasing stack',
        'Can store indices instead of values to compute distances (e.g., "days until warmer temperature")',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Next Greater Element & Largest Rectangle',
          code: `// Next Greater Element for each index
function nextGreaterElement(arr: readonly number[]): number[] {
  const result = new Array(arr.length).fill(-1);
  const stack: number[] = []; // stores indices

  for (let i = 0; i < arr.length; i++) {
    while (stack.length > 0 && arr[stack[stack.length - 1]] < arr[i]) {
      const idx = stack.pop()!;
      result[idx] = arr[i];
    }
    stack.push(i);
  }
  return result;
}

// Largest Rectangle in Histogram
function largestRectangleArea(heights: readonly number[]): number {
  const stack: number[] = []; // monotonic increasing (by height)
  let maxArea = 0;

  for (let i = 0; i <= heights.length; i++) {
    const currentHeight = i === heights.length ? 0 : heights[i];
    while (stack.length > 0 && heights[stack[stack.length - 1]] > currentHeight) {
      const height = heights[stack.pop()!];
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      maxArea = Math.max(maxArea, height * width);
    }
    stack.push(i);
  }
  return maxArea;
}`,
        },
      ],
      useCases: [
        'Next greater/smaller element (left or right)',
        'Largest rectangle in histogram',
        'Maximal rectangle in binary matrix (histogram per row)',
        'Trapping rain water (alternative to two-pointer)',
        'Stock span problem, daily temperatures',
      ],
      commonPitfalls: [
        'Choosing wrong monotonicity: decreasing for "next greater", increasing for "next smaller"',
        'Forgetting to process remaining stack elements after loop (they have no answer → use sentinel or default)',
        'In histogram problem: width calculation when stack is empty means the bar extends to index 0',
        'Storing values instead of indices when you need distance information',
      ],
      interviewTips: [
        'When you see "for each element, find the nearest larger/smaller", immediately think monotonic stack',
        'The histogram problem is a classic follow-up — know how width is calculated on pop',
        'Practice the "push sentinel 0 at end" trick to avoid post-loop stack processing',
      ],
      relatedConcepts: ['monotonic-deque', 'stack-array', 'dynamic-array'],
      difficulty: 'intermediate',
      tags: ['monotonic-stack', 'stack', 'next-greater', 'histogram'],
      proTip:
        'The largest rectangle in histogram is the single most important monotonic stack problem. If you master it, you can solve maximal rectangle in matrix (apply histogram to each row), trapping rain water, and sum of subarray minimums — they all reduce to the same stack pop logic.',
    },
    {
      id: 'monotonic-deque',
      title: 'Monotonic Queue (Deque)',
      description:
        'A double-ended queue that maintains elements in monotonic order, enabling O(1) access to the current window\'s maximum or minimum. As the window slides, elements violating monotonicity are removed from the back, and expired elements are removed from the front. Total work across n elements is O(n) since each element enters and leaves the deque at most once.',
      timeComplexity: {
        best: 'O(n) total for n elements',
        average: 'O(1) amortized per operation',
        worst: 'O(n) total',
      },
      spaceComplexity: 'O(k) where k is window size',
      keyPoints: [
        'Front of deque holds the current window maximum (or minimum) — O(1) access',
        'Add new element: pop from back while back element is less useful (smaller for max-deque)',
        'Remove expired: pop from front if front index is outside current window',
        'Store indices, not values — needed to detect when front element has left the window',
        'Each element is added once and removed once → O(n) amortized across all operations',
        'Strictly more powerful than monotonic stack: deque handles sliding window, stack handles one-directional scan',
        'Can be used for DP optimization: when DP transition looks at min/max over a range of previous states',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Sliding Window Maximum',
          code: `function maxSlidingWindow(nums: readonly number[], k: number): number[] {
  const deque: number[] = []; // stores indices, front = max
  const result: number[] = [];

  for (let i = 0; i < nums.length; i++) {
    // Remove elements outside window from front
    while (deque.length > 0 && deque[0] <= i - k) {
      deque.shift();
    }
    // Remove smaller elements from back (they'll never be the max)
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }
    deque.push(i);
    // Window is fully formed starting at index k-1
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }
  return result;
}

// Example: nums = [1,3,-1,-3,5,3,6,7], k = 3
// Output: [3,3,5,5,6,7]`,
        },
      ],
      useCases: [
        'Sliding window maximum/minimum in O(n)',
        'DP optimization: min/max over sliding range of states',
        'Jump game variants with bounded jump distance',
        'Constrained subarray problems (max sum subarray of length between a and b)',
      ],
      commonPitfalls: [
        'Using shift() which is O(n) in JS arrays — use a proper deque implementation or circular buffer for large n',
        'Forgetting to remove expired front elements before reading the maximum',
        'Removing from wrong end: expired elements from front, non-competitive elements from back',
        'Off-by-one on when the first valid window is formed (index k-1, not k)',
      ],
      interviewTips: [
        'Sliding window maximum is the #1 deque problem — know it cold',
        'If asked about time complexity, explain: each element enters and leaves deque at most once → O(n) total',
        'Compare with heap approach: heap gives O(n log k), deque gives O(n) — explain why deque is better',
      ],
      relatedConcepts: ['monotonic-stack', 'sliding-window', 'deque-ds'],
      difficulty: 'intermediate',
      tags: ['monotonic-deque', 'deque', 'sliding-window', 'max-queue'],
      proTip:
        'In JavaScript, Array.shift() is O(n) because it reindexes all elements. For competitive programming this is fine for n ≤ 10⁵, but in production use a circular buffer or track a front pointer instead.',
    },
    {
      id: 'matrix-techniques',
      title: 'Matrix',
      description:
        'A 2D array with specialized traversal and search patterns. Matrix problems are fundamentally about mapping between 1D array thinking and 2D coordinates, and recognizing when row/column sorted properties enable binary search. Key operations include spiral traversal, in-place rotation, and searching in row-sorted or fully-sorted matrices.',
      timeComplexity: {
        best: 'O(n*m) traversal',
        average: 'O(n + m) for sorted matrix search',
        worst: 'O(n*m)',
      },
      spaceComplexity: 'O(1) for in-place operations, O(n*m) for auxiliary matrix',
      keyPoints: [
        'Rotation 90° clockwise = transpose + reverse each row; counterclockwise = transpose + reverse each column',
        'Spiral traversal: maintain four boundaries (top, bottom, left, right), shrink after each direction',
        'Search in row-sorted + col-sorted matrix: start from top-right or bottom-left, O(n+m)',
        'Search in fully sorted matrix (row-major): binary search treating as 1D, index = row * cols + col',
        'Diagonal traversal: elements on same diagonal have constant (row - col) or (row + col)',
        'Setting row/col to zero: use first row and first col as markers to avoid O(n*m) extra space',
        'Matrix multiplication is O(n³) naive, O(n^2.37) Strassen — rarely needed in interviews but know it exists',
        'For DP on matrix: often need only previous row → O(m) space instead of O(n*m)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Matrix Operations',
          code: `// Rotate 90° clockwise in-place
function rotate(matrix: number[][]): void {
  const n = matrix.length;
  // Transpose
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  // Reverse each row
  for (const row of matrix) {
    row.reverse();
  }
}

// Search in row-sorted, column-sorted matrix — O(n + m)
function searchMatrix(matrix: readonly (readonly number[])[], target: number): boolean {
  let row = 0;
  let col = matrix[0].length - 1;
  while (row < matrix.length && col >= 0) {
    if (matrix[row][col] === target) return true;
    if (matrix[row][col] > target) col--;
    else row++;
  }
  return false;
}

// Spiral order traversal
function spiralOrder(matrix: readonly (readonly number[])[]): number[] {
  const result: number[] = [];
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) result.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) result.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) result.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) result.push(matrix[r][left]);
      left++;
    }
  }
  return result;
}`,
        },
      ],
      useCases: [
        'Image rotation and transformation',
        'Searching in sorted 2D data (spreadsheets, game boards)',
        'Game of Life, flood fill, island counting (DFS/BFS on grid)',
        'Dynamic programming on grids (minimum path sum, unique paths)',
      ],
      commonPitfalls: [
        'Rotation: transposing and then reversing rows gives 90° CW, not CCW — verify direction',
        'Spiral: forgetting the "if top <= bottom" and "if left <= right" guards causes duplicate elements',
        'Sorted matrix search: using binary search when matrix is only row-sorted (not fully sorted) misses elements',
        'Off-by-one in boundary conditions: rows go 0..n-1, cols go 0..m-1',
      ],
      interviewTips: [
        'For rotation, "transpose then reverse" is much cleaner than the 4-way swap cycle approach',
        'Know both matrix search variants: fully sorted (binary search O(log(n*m))) vs row+col sorted (staircase O(n+m))',
        'Spiral traversal is pure boundary management — draw it out before coding',
      ],
      relatedConcepts: ['prefix-sum', 'dynamic-array', 'bfs-dfs'],
      difficulty: 'intermediate',
      tags: ['matrix', '2d-array', 'traversal', 'rotation', 'search'],
      proTip:
        'The "set matrix zeroes" problem reveals a common space optimization pattern: use the data structure itself (first row/column) as storage for metadata, trading clean code for O(1) space. This pattern appears in many in-place matrix problems.',
    },
    {
      id: 'kadanes-algorithm',
      title: "Kadane's Algorithm",
      description:
        'A dynamic programming algorithm that finds the maximum sum contiguous subarray in O(n) time. The core insight: at each position, either extend the current subarray or start a new one — whichever gives a larger sum. This local decision produces the global optimum because a negative running sum can never improve a future subarray.',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n)',
      },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'DP recurrence: maxEndingHere[i] = max(arr[i], maxEndingHere[i-1] + arr[i])',
        'If maxEndingHere becomes negative, reset to 0 (or current element) — negative prefix never helps',
        'Track both maxEndingHere (current subarray) and maxSoFar (global best)',
        'All-negative array: return the least negative element (handle as edge case or let DP handle naturally)',
        'To find the actual subarray (not just sum): track start/end indices, update start when resetting',
        'Circular variant: max(normal Kadane, totalSum - minSubarraySum)',
        '2D variant (max sum submatrix): fix two rows, compress columns, apply 1D Kadane → O(n²m)',
        'Does NOT work for "max product subarray" — need to track both max and min (negative * negative = positive)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: "Kadane's Algorithm Variants",
          code: `// Standard Kadane's — returns max subarray sum
function maxSubarraySum(nums: readonly number[]): number {
  let maxEndingHere = nums[0];
  let maxSoFar = nums[0];
  for (let i = 1; i < nums.length; i++) {
    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }
  return maxSoFar;
}

// With subarray indices
function maxSubarrayWithIndices(
  nums: readonly number[]
): { sum: number; start: number; end: number } {
  let maxEndingHere = nums[0];
  let maxSoFar = nums[0];
  let start = 0, end = 0, tempStart = 0;

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > maxEndingHere + nums[i]) {
      maxEndingHere = nums[i];
      tempStart = i;
    } else {
      maxEndingHere += nums[i];
    }
    if (maxEndingHere > maxSoFar) {
      maxSoFar = maxEndingHere;
      start = tempStart;
      end = i;
    }
  }
  return { sum: maxSoFar, start, end };
}

// Circular variant
function maxCircularSubarraySum(nums: readonly number[]): number {
  const totalSum = nums.reduce((a, b) => a + b, 0);
  const normalMax = maxSubarraySum(nums);
  // Min subarray = invert signs, run Kadane's
  const invertedMax = maxSubarraySum(nums.map(x => -x));
  const circularMax = totalSum + invertedMax; // total - minSubarray
  // Edge case: all negative → circularMax = 0, use normalMax
  return circularMax === 0 ? normalMax : Math.max(normalMax, circularMax);
}`,
        },
      ],
      useCases: [
        'Maximum profit from stock trades (single transaction variant)',
        'Signal processing: finding strongest contiguous signal',
        'Maximum sum submatrix in 2D (combined with column compression)',
        'Circular buffer maximum sum',
      ],
      commonPitfalls: [
        'All-negative array: initializing maxSoFar to 0 returns 0 instead of least-negative element',
        'Circular variant: when all elements are negative, circularMax = 0 which is wrong — must check',
        'Max product subarray needs different approach: track both max and min at each step',
        'Forgetting to initialize with nums[0] (not 0 or -Infinity depending on variant)',
      ],
      interviewTips: [
        'Start by explaining the DP insight: "at each index, I either extend or start fresh"',
        'If asked for the subarray itself (not just sum), track indices during the scan',
        'Know the circular variant — it is a common follow-up',
      ],
      relatedConcepts: ['prefix-sum', 'sliding-window', 'dynamic-programming'],
      difficulty: 'beginner',
      tags: ['kadane', 'dynamic-programming', 'maximum-subarray', 'greedy'],
      proTip:
        'Kadane\'s algorithm is actually greedy, not DP — the "reset when negative" rule is a greedy choice that happens to be optimal. Understanding this helps you recognize similar patterns: if accumulating past work hurts, discard it.',
    },
  ],
}
