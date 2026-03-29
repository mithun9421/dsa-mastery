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

export const sortingCategory: Category = {
  id: 'sorting',
  title: 'Sorting Algorithms',
  description: 'From quadratic classics to linearithmic workhorses and linear-time distribution sorts. Understanding sorting deeply means understanding trade-offs: stability, adaptivity, cache behavior, and constant factors.',
  icon: '📊',
  concepts: [
    {
      id: 'bubble-sort',
      title: 'Bubble Sort',
      description: 'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The key insight is that after each pass, the largest unsorted element "bubbles up" to its correct position. While nearly useless in production, the optimized version with an early-exit flag is a useful teaching tool and can outperform more complex algorithms on nearly-sorted data.',
      timeComplexity: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Stable sort: equal elements maintain their relative order',
        'Optimized version tracks whether any swap occurred; if not, array is sorted and we exit early',
        'Best case O(n) only with the early-exit optimization on already-sorted input',
        'Adaptive: performance improves on partially sorted data',
        'Each pass guarantees the next-largest element is in its final position',
        'Number of swaps equals the number of inversions in the array',
        'Cocktail shaker sort (bidirectional bubble sort) handles "turtles" — small values near the end',
        'In practice, insertion sort is strictly better for the same use cases'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Optimized Bubble Sort with Early Exit',
          code: `function bubbleSort(arr: readonly number[]): number[] {
  const result = [...arr];
  const n = result.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // Already sorted
  }
  return result;
}`
        }
      ],
      useCases: [
        'Teaching sorting fundamentals and algorithm analysis',
        'Detecting whether an array is already sorted in O(n)',
        'When simplicity of implementation matters more than performance',
        'Embedded systems with extreme memory constraints and tiny datasets'
      ],
      commonPitfalls: [
        'Forgetting the early-exit optimization, making best case O(n^2) instead of O(n)',
        'Not reducing the inner loop bound by i — the last i elements are already sorted',
        'Using bubble sort when insertion sort would be simpler and faster for the same scenario'
      ],
      interviewTips: [
        'Interviewers rarely ask you to implement bubble sort, but they may ask you to compare it with insertion sort',
        'Know that bubble sort does O(n^2) swaps in worst case vs insertion sort O(n^2) shifts — swaps are more expensive',
        'If asked to "sort with minimum swaps," bubble sort is NOT the answer — selection sort minimizes swaps at O(n)',
        'Can be asked as: "How would you check if an array is sorted?" — one pass of bubble sort without any swap'
      ],
      relatedConcepts: ['insertion-sort', 'selection-sort', 'cocktail-shaker-sort'],
      difficulty: 'beginner',
      tags: ['comparison', 'stable', 'in-place', 'adaptive', 'quadratic'],
      proTip: 'The number of swaps in bubble sort equals the inversion count of the array. This makes it useful for measuring "how unsorted" data is, which is actually a meaningful metric in some domains like bioinformatics.'
    },
    {
      id: 'selection-sort',
      title: 'Selection Sort',
      description: 'Selection Sort divides the array into a sorted prefix and an unsorted suffix. Each iteration finds the minimum element from the unsorted portion and swaps it into position. Its defining property is that it makes exactly O(n) swaps — the minimum possible for a comparison-based in-place sort. This makes it useful when write operations are expensive (e.g., flash memory, EEPROM).',
      timeComplexity: { best: 'O(n^2)', average: 'O(n^2)', worst: 'O(n^2)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'NOT stable by default: swapping can change relative order of equal elements',
        'Exactly n-1 swaps in all cases — optimal for minimizing writes',
        'NOT adaptive: always O(n^2) comparisons regardless of input order',
        'Simple to implement and reason about — good mental model for selection-based algorithms',
        'Can be made stable by using insertion instead of swap (but then it becomes insertion sort)',
        'Outperforms bubble sort due to fewer swap operations despite same comparison count',
        'Double selection sort: find both min and max each pass, reducing passes by half',
        'Cache-friendly sequential access pattern during the scan phase'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Selection Sort',
          code: `function selectionSort(arr: readonly number[]): number[] {
  const result = [...arr];
  const n = result.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (result[j] < result[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [result[i], result[minIdx]] = [result[minIdx], result[i]];
    }
  }
  return result;
}`
        }
      ],
      useCases: [
        'Sorting small arrays where simplicity is preferred',
        'Environments where write/swap cost dominates (flash memory, EEPROM)',
        'When you need a predictable number of writes regardless of input',
        'Teaching algorithm analysis — good example of non-adaptive sort'
      ],
      commonPitfalls: [
        'Assuming selection sort is stable — it is NOT (the swap can reorder equal elements)',
        'Not checking if minIdx === i before swapping — unnecessary write',
        'Thinking O(n) swaps means O(n) time — the comparisons are still O(n^2)'
      ],
      interviewTips: [
        'Know the key differentiator: minimum number of swaps (O(n))',
        'Compare with insertion sort: selection always does n^2 comparisons, insertion is adaptive',
        'Asked sometimes as: "Sort with minimum number of swaps" — selection sort or cycle sort',
        'Cycle sort is the true minimum-write sort (O(n) writes for distinct elements) — mention it if asked'
      ],
      relatedConcepts: ['bubble-sort', 'insertion-sort', 'heap-sort', 'cycle-sort'],
      difficulty: 'beginner',
      tags: ['comparison', 'unstable', 'in-place', 'non-adaptive', 'quadratic'],
      proTip: 'If write cost is your bottleneck, cycle sort achieves the theoretical minimum number of writes for in-place sorting. Selection sort is the "good enough" version that is simpler to implement.'
    },
    {
      id: 'insertion-sort',
      title: 'Insertion Sort',
      description: 'Insertion Sort builds the sorted array one element at a time by picking each element and inserting it into its correct position among the already-sorted prefix. It is the algorithm you naturally use when sorting a hand of playing cards. Its key strength is adaptivity: on nearly-sorted data it runs in O(n) time, making it the algorithm of choice for small or almost-sorted inputs. This is why production sorts like TimSort and Introsort use insertion sort as a subroutine.',
      timeComplexity: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Stable sort: equal elements maintain their relative order',
        'Adaptive: O(n) on nearly-sorted input, O(n + d) where d is the number of inversions',
        'Online algorithm: can sort data as it arrives (streaming)',
        'Excellent for small arrays (n < 20-50) due to low overhead and cache efficiency',
        'Used as the base case in TimSort (run size 32-64) and Introsort',
        'Binary insertion sort reduces comparisons to O(n log n) but shifts remain O(n^2)',
        'Shell sort is a generalization that allows long-distance swaps before finishing with insertion sort',
        'Shift operations (memmove) are faster than swaps in practice due to CPU pipeline behavior'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Insertion Sort with Shift Optimization',
          code: `function insertionSort(arr: readonly number[]): number[] {
  const result = [...arr];
  const n = result.length;
  for (let i = 1; i < n; i++) {
    const key = result[i];
    let j = i - 1;
    // Shift elements instead of swapping — fewer writes
    while (j >= 0 && result[j] > key) {
      result[j + 1] = result[j];
      j--;
    }
    result[j + 1] = key;
  }
  return result;
}`
        }
      ],
      useCases: [
        'Small arrays (n < 50) where overhead of complex sorts is not justified',
        'Nearly sorted data — insertion sort is O(n + d) where d is inversions',
        'Online sorting: data arrives one element at a time',
        'Base case subroutine for TimSort, Introsort, and other hybrid sorts',
        'Maintaining a sorted collection with infrequent insertions'
      ],
      commonPitfalls: [
        'Using swap instead of shift — shifts are approximately 3x faster in practice',
        'Not considering insertion sort for small subarrays in divide-and-conquer sorts',
        'Forgetting that binary insertion sort still has O(n^2) shifts — it only saves comparisons'
      ],
      interviewTips: [
        'Insertion sort is the most commonly asked "simple sort" — know it cold',
        'Key question: "When is insertion sort better than merge sort?" Answer: small n, nearly sorted, or as a hybrid base case',
        'If asked about sorting a linked list with O(1) space, insertion sort is a strong candidate',
        'Know the connection: insertion sort inversions = bubble sort swaps',
        'Follow-up: "Can you improve insertion sort?" leads to Shell sort discussion'
      ],
      relatedConcepts: ['bubble-sort', 'shell-sort', 'tim-sort', 'binary-insertion-sort'],
      difficulty: 'beginner',
      tags: ['comparison', 'stable', 'in-place', 'adaptive', 'online', 'quadratic'],
      proTip: 'In production, insertion sort with a sentinel (placing the minimum at index 0) eliminates the j >= 0 bounds check from the inner loop. This micro-optimization matters when insertion sort runs millions of times as a TimSort subroutine.'
    },
    {
      id: 'merge-sort',
      title: 'Merge Sort',
      description: 'Merge Sort is the quintessential divide-and-conquer sort: split the array in half, recursively sort both halves, then merge them. It guarantees O(n log n) in all cases and is stable, making it the default choice for sorting linked lists and for external sorting (data too large for memory). The merge step is the heart of the algorithm and appears in many other contexts: merge k sorted lists, external sort, inversion counting.',
      timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Stable sort with guaranteed O(n log n) — no pathological inputs',
        'Top-down (recursive) vs bottom-up (iterative): bottom-up avoids recursion overhead',
        'O(n) auxiliary space for arrays — can be done in-place but loses simplicity and constant factors',
        'Natural merge sort detects existing runs, bridging to TimSort',
        'K-way merge extends to merging k sorted streams in O(n log k) with a min-heap',
        'External sorting: split file into chunks that fit in memory, sort each, k-way merge',
        'Merge step can count inversions: if left[i] > right[j], there are mid-i inversions',
        'Parallelizes well: the two recursive calls are independent'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Complete Merge Sort Implementation',
          code: `function mergeSort(arr: readonly number[]): number[] {
  if (arr.length <= 1) return [...arr];

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    // <= preserves stability
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  // One of these will be empty
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);

  return result;
}

// Bottom-up merge sort (iterative, avoids recursion stack)
function mergeSortBottomUp(arr: readonly number[]): number[] {
  const result = [...arr];
  const n = result.length;
  const aux = new Array<number>(n);

  for (let width = 1; width < n; width *= 2) {
    for (let start = 0; start < n; start += 2 * width) {
      const mid = Math.min(start + width, n);
      const end = Math.min(start + 2 * width, n);
      mergeInPlace(result, aux, start, mid, end);
    }
  }
  return result;
}

function mergeInPlace(
  arr: number[], aux: number[],
  start: number, mid: number, end: number
): void {
  for (let k = start; k < end; k++) aux[k] = arr[k];

  let i = start, j = mid;
  for (let k = start; k < end; k++) {
    if (i >= mid) arr[k] = aux[j++];
    else if (j >= end) arr[k] = aux[i++];
    else if (aux[i] <= aux[j]) arr[k] = aux[i++];
    else arr[k] = aux[j++];
  }
}`
        }
      ],
      useCases: [
        'Sorting linked lists — O(1) extra space since you can relink nodes',
        'External sorting: data too large for RAM (database sort-merge joins)',
        'When guaranteed O(n log n) worst case is required',
        'Counting inversions in an array',
        'Merging k sorted streams (event logs, database cursors)',
        'Stable sort requirement on large datasets'
      ],
      commonPitfalls: [
        'Using < instead of <= in the merge comparison breaks stability',
        'Allocating new arrays in every merge call — reuse a single auxiliary buffer',
        'Forgetting the base case or using arr.length < 2 vs <= 1 inconsistently',
        'Not considering bottom-up for iterative contexts (embedded, no recursion stack)'
      ],
      interviewTips: [
        'Merge sort is a top interview algorithm — know both recursive and iterative versions',
        '"Count inversions in an array" is a classic merge sort application — modify merge to count',
        '"Sort a linked list in O(n log n)" — merge sort is the intended answer (not quicksort)',
        'K-way merge: use a min-heap of size k, pop min, push next from same stream',
        'Follow-up: "Can you sort in O(n log n) with O(1) space?" leads to heap sort or block merge sort'
      ],
      relatedConcepts: ['quick-sort', 'tim-sort', 'external-sort', 'k-way-merge'],
      difficulty: 'intermediate',
      tags: ['comparison', 'stable', 'divide-and-conquer', 'linearithmic', 'not-in-place'],
      proTip: 'In practice, always allocate the auxiliary array once and pass it through the recursion. Creating new arrays at each level is the #1 reason merge sort benchmarks poorly against quicksort in naive implementations.'
    },
    {
      id: 'quick-sort',
      title: 'Quick Sort',
      description: 'Quick Sort picks a pivot, partitions the array so elements less than the pivot come before it and elements greater come after, then recursively sorts both sides. Despite O(n^2) worst case, its average O(n log n) with excellent cache locality and low constant factors make it the fastest comparison sort in practice. Modern implementations use 3-way partitioning (Dutch National Flag) for arrays with duplicates and fall back to heap sort if recursion depth exceeds 2*log(n) (introsort).',
      timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n^2)' },
      spaceComplexity: 'O(log n)',
      keyPoints: [
        'NOT stable: partitioning can rearrange equal elements',
        'In-place with O(log n) stack space (tail-call optimization on the larger partition)',
        'Lomuto partition: simpler but more swaps; Hoare partition: fewer swaps, slightly tricky',
        '3-way partition (Dutch National Flag): handles many duplicates in O(n) — critical for real data',
        'Median-of-3 pivot selection avoids O(n^2) on sorted/reverse-sorted input',
        'Random pivot gives O(n log n) expected time regardless of input distribution',
        'Introsort: quicksort + heapsort fallback + insertion sort for small partitions = std::sort in C++',
        'Cache-friendly sequential access makes it 2-3x faster than merge sort on arrays in practice',
        'Tail call optimization: recurse on the smaller partition, iterate on the larger to keep stack O(log n)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Quick Sort with 3-Way Partition (Dutch National Flag)',
          code: `function quickSort(arr: readonly number[]): number[] {
  const result = [...arr];
  quickSortHelper(result, 0, result.length - 1);
  return result;
}

function quickSortHelper(arr: number[], lo: number, hi: number): void {
  if (lo >= hi) return;

  // 3-way partition (Dutch National Flag)
  // After: arr[lo..lt-1] < pivot, arr[lt..gt] === pivot, arr[gt+1..hi] > pivot
  const pivot = arr[lo + Math.floor(Math.random() * (hi - lo + 1))];
  let lt = lo, i = lo, gt = hi;

  while (i <= gt) {
    if (arr[i] < pivot) {
      [arr[lt], arr[i]] = [arr[i], arr[lt]];
      lt++;
      i++;
    } else if (arr[i] > pivot) {
      [arr[i], arr[gt]] = [arr[gt], arr[i]];
      gt--;
    } else {
      i++;
    }
  }

  quickSortHelper(arr, lo, lt - 1);
  quickSortHelper(arr, gt + 1, hi);
}

// Hoare partition (fewer swaps, used in production)
function hoarePartition(arr: number[], lo: number, hi: number): number {
  const pivot = arr[lo + Math.floor((hi - lo) / 2)];
  let i = lo - 1;
  let j = hi + 1;

  while (true) {
    do { i++; } while (arr[i] < pivot);
    do { j--; } while (arr[j] > pivot);
    if (i >= j) return j;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}`
        }
      ],
      useCases: [
        'General-purpose sorting when average-case performance matters most',
        'Sorting primitive arrays where stability is not required',
        'QuickSelect (kth smallest) — partition-based O(n) average selection',
        'As the backbone of introsort (C++ std::sort, Rust sort_unstable)',
        'In-memory sorting where cache behavior dominates performance'
      ],
      commonPitfalls: [
        'Using first/last element as pivot on sorted input — O(n^2) worst case',
        'Forgetting 3-way partition for arrays with many duplicates — degrades to O(n^2)',
        'Stack overflow on pathological input without tail-call optimization or depth limit',
        'Off-by-one errors in Hoare partition — the returned index is NOT the pivot position',
        'Assuming quicksort is stable — it is NOT, use merge sort if stability is needed'
      ],
      interviewTips: [
        'Know both Lomuto and Hoare partitioning — Lomuto is easier to code, Hoare is faster',
        '"Find kth largest element" — use QuickSelect, not full sort',
        'If asked about worst case, explain introsort: quicksort with heapsort fallback',
        'Dutch National Flag Problem is a standalone interview question AND the 3-way partition',
        'Follow-up: "How do real languages sort?" leads to introsort and TimSort discussion'
      ],
      relatedConcepts: ['merge-sort', 'heap-sort', 'tim-sort', 'quick-select', 'dutch-national-flag'],
      difficulty: 'intermediate',
      tags: ['comparison', 'unstable', 'in-place', 'divide-and-conquer', 'linearithmic'],
      proTip: 'The reason quicksort beats merge sort in practice despite worse theoretical guarantees is cache behavior. Quicksort works on a contiguous subarray (spatial locality), while merge sort bounces between the input and auxiliary arrays. On modern CPUs, a cache miss costs 100+ cycles — this dominates the comparison count.'
    },
    {
      id: 'heap-sort',
      title: 'Heap Sort',
      description: 'Heap Sort builds a max-heap from the array, then repeatedly extracts the maximum to build the sorted result from right to left. It guarantees O(n log n) worst case with O(1) auxiliary space — the only comparison sort with both properties. However, its poor cache locality (heap operations jump around the array) makes it slower than quicksort in practice, which is why it is used as a fallback in introsort rather than as the primary sort.',
      timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'NOT stable: heap operations destroy relative order of equal elements',
        'In-place with O(1) auxiliary space and guaranteed O(n log n)',
        'Build-heap (heapify) runs in O(n), not O(n log n) — the math is subtle (sum of heights)',
        'Poor cache locality: parent-child jumps (i -> 2i+1) cause cache misses on large arrays',
        'Used as introsort fallback when quicksort recursion depth exceeds 2*log(n)',
        'Bottom-up heapify (Floyd) is 2x faster than top-down insertion for building the heap',
        'The heap property: parent >= children (max-heap) or parent <= children (min-heap)',
        'Binary heap in array: children of i are at 2i+1 and 2i+2, parent of i is at floor((i-1)/2)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Complete Heap Sort',
          code: `function heapSort(arr: readonly number[]): number[] {
  const result = [...arr];
  const n = result.length;

  // Build max-heap (bottom-up, O(n))
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(result, i, n);
  }

  // Extract max repeatedly
  for (let end = n - 1; end > 0; end--) {
    [result[0], result[end]] = [result[end], result[0]];
    siftDown(result, 0, end);
  }

  return result;
}

function siftDown(arr: number[], i: number, size: number): void {
  while (true) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < size && arr[left] > arr[largest]) largest = left;
    if (right < size && arr[right] > arr[largest]) largest = right;

    if (largest === i) break;
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    i = largest;
  }
}`
        }
      ],
      useCases: [
        'When guaranteed O(n log n) AND O(1) space are both required',
        'Introsort fallback to prevent quicksort O(n^2) worst case',
        'Priority queue operations (not full sort, but the underlying data structure)',
        'Finding k largest/smallest elements — build heap of size k, O(n log k)',
        'Embedded systems with strict memory constraints'
      ],
      commonPitfalls: [
        'Starting build-heap from index n/2 instead of n/2-1 — off by one',
        'Confusing sift-up (used in insertion) with sift-down (used in heapify and extraction)',
        'Thinking build-heap is O(n log n) — it is O(n), the proof uses the sum of geometric series',
        'Not realizing heap sort is typically 2-5x slower than quicksort due to cache misses'
      ],
      interviewTips: [
        'Heap sort itself is rarely asked, but heap operations are extremely common',
        '"Find kth largest in an array" — min-heap of size k is O(n log k)',
        'Know why build-heap is O(n): most nodes are near the bottom and sift down a short distance',
        'If asked "sort with O(1) space and O(n log n) guaranteed" — heap sort is the answer',
        'Compare: heap sort has better worst-case than quicksort, but quicksort wins on average by 2-3x'
      ],
      relatedConcepts: ['quick-sort', 'priority-queue', 'selection-sort', 'introsort'],
      difficulty: 'intermediate',
      tags: ['comparison', 'unstable', 'in-place', 'linearithmic'],
      proTip: 'Build-heap is O(n) because most of the work happens at the bottom of the tree where nodes barely move. The sum is n/4*1 + n/8*2 + n/16*3 + ... which converges to O(n). This is one of the most common "gotcha" complexity questions in interviews.'
    },
    {
      id: 'counting-sort',
      title: 'Counting Sort',
      description: 'Counting Sort works by counting occurrences of each value, then computing prefix sums to determine each element\'s final position. It runs in O(n + k) where k is the range of input values. The key prerequisite is that you must know the range of possible values, and k must be reasonable relative to n. It is the backbone of radix sort and is the simplest stable linear-time sort.',
      timeComplexity: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n + k)' },
      spaceComplexity: 'O(n + k)',
      keyPoints: [
        'NOT a comparison sort — breaks the O(n log n) comparison-based lower bound',
        'Stable: elements with the same key maintain their relative order (when scanning right to left)',
        'Requires knowing the range of values [min, max] in advance',
        'Practical only when k = O(n) — if k >> n, use comparison sort instead',
        'Handles negative numbers by offsetting: index = value - min',
        'Prefix sum technique: count[i] = count[i] + count[i-1] gives final positions',
        'Foundation for radix sort: counting sort is used as the stable subroutine per digit',
        'Can sort objects by key, not just integers — use the key to index, preserve the full object'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Counting Sort (handles negatives, stable)',
          code: `function countingSort(arr: readonly number[]): number[] {
  if (arr.length <= 1) return [...arr];

  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min + 1;

  const count = new Array<number>(range).fill(0);
  const output = new Array<number>(arr.length);

  // Count occurrences
  for (const val of arr) {
    count[val - min]++;
  }

  // Prefix sums: count[i] now holds the position after the last occurrence
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }

  // Build output in reverse for stability
  for (let i = arr.length - 1; i >= 0; i--) {
    const idx = arr[i] - min;
    output[count[idx] - 1] = arr[i];
    count[idx]--;
  }

  return output;
}`
        }
      ],
      useCases: [
        'Sorting integers with a known, bounded range (ages, scores, characters)',
        'As a subroutine in radix sort',
        'Histogram computation',
        'When stability is needed and values are small integers',
        'Sorting characters in a string (range is 256 for ASCII)'
      ],
      commonPitfalls: [
        'Forgetting to handle negative numbers — offset by min value',
        'Forward scan instead of reverse scan in the output phase destroys stability',
        'Not considering that k >> n makes this worse than comparison sort',
        'Allocating count array of size max instead of max-min+1 — wasteful for offset ranges'
      ],
      interviewTips: [
        '"Sort an array where values are in range [0, k]" — counting sort in O(n + k)',
        'Know why stability matters: it is required for radix sort to work correctly',
        'If asked "sort in O(n)" — clarify constraints; counting sort needs bounded range',
        'Prefix sum technique appears in many problems beyond sorting (range queries, parallel algorithms)'
      ],
      relatedConcepts: ['radix-sort', 'bucket-sort', 'prefix-sum'],
      difficulty: 'intermediate',
      tags: ['non-comparison', 'stable', 'linear', 'integer-sort'],
      proTip: 'The prefix sum trick in counting sort is far more valuable than the sort itself. The same technique powers parallel prefix scan (GPU computing), range update queries, and the foundation of many database indexing operations.'
    },
    {
      id: 'radix-sort',
      title: 'Radix Sort',
      description: 'Radix Sort sorts numbers digit by digit, using a stable sort (typically counting sort) as a subroutine. LSD (Least Significant Digit) processes from the rightmost digit to the left, while MSD (Most Significant Digit) processes left to right and can short-circuit. It runs in O(d * (n + b)) where d is the number of digits and b is the base. By choosing b = n, we get O(n) for fixed-length keys — truly linear sorting.',
      timeComplexity: { best: 'O(d * (n + b))', average: 'O(d * (n + b))', worst: 'O(d * (n + b))' },
      spaceComplexity: 'O(n + b)',
      keyPoints: [
        'LSD radix sort: process least significant digit first, stable sort at each level, simple and elegant',
        'MSD radix sort: process most significant digit first, recursive, can short-circuit on unique prefixes',
        'Choosing base b: larger base = fewer passes but more memory; b = n gives O(n) total',
        'For 32-bit integers with base 256: only 4 passes of counting sort = extremely fast',
        'Can sort strings: MSD radix sort is essentially trie construction',
        'Sorting floats: IEEE 754 trick — flip sign bit and conditionally flip mantissa/exponent',
        'Stability of the inner sort is CRITICAL — unstable inner sort breaks radix sort completely',
        'In practice, radix sort with base 256 beats comparison sorts for n > 256 on integer arrays'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'LSD Radix Sort (base 10)',
          code: `function radixSort(arr: readonly number[]): number[] {
  if (arr.length <= 1) return [...arr];

  // Handle negatives: separate, sort positives and abs(negatives), combine
  const negatives = arr.filter(x => x < 0).map(x => -x);
  const positives = arr.filter(x => x >= 0);

  const sortedPos = radixSortPositive([...positives]);
  const sortedNeg = radixSortPositive([...negatives]);

  // Negatives: reverse and negate back
  return [...sortedNeg.reverse().map(x => -x), ...sortedPos];
}

function radixSortPositive(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const max = Math.max(...arr);
  const output = new Array<number>(arr.length);

  // Process each digit position
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const count = new Array<number>(10).fill(0);

    for (const val of arr) {
      const digit = Math.floor(val / exp) % 10;
      count[digit]++;
    }

    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    // Reverse scan for stability
    for (let i = arr.length - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
    }

    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
    }
  }

  return arr;
}`
        }
      ],
      useCases: [
        'Sorting large arrays of fixed-size integers (IDs, hashes, IP addresses)',
        'Database integer column sorting',
        'Sorting strings of fixed length (MSD radix sort)',
        'Suffix array construction (SA-IS uses radix sort)',
        'When n > 256 and data is 32/64-bit integers — faster than comparison sorts'
      ],
      commonPitfalls: [
        'Using an unstable sort as the inner sort — completely breaks correctness',
        'Not handling negative numbers — need to separate or use sign-flip trick',
        'Choosing base 10 in production — base 256 (byte-level) is 2.5x faster',
        'Assuming radix sort is always better — for small n or large keys, comparison sort wins'
      ],
      interviewTips: [
        'Know LSD vs MSD: LSD is simpler and non-recursive; MSD handles variable-length strings',
        'If asked "sort n integers in O(n)" — radix sort with base n gives O(n) for bounded integers',
        'Follow-up: "What about floats?" — IEEE 754 bit trick makes floats sortable as integers',
        'The theoretical lower bound O(n log n) only applies to comparison sorts — radix sort is not a comparison sort'
      ],
      relatedConcepts: ['counting-sort', 'bucket-sort', 'msd-radix-sort'],
      difficulty: 'intermediate',
      tags: ['non-comparison', 'stable', 'linear', 'integer-sort'],
      proTip: 'In high-performance computing, radix sort with base 256 (byte at a time) on 32-bit integers requires exactly 4 passes and crushes std::sort. The trick is to fuse the counting and scattering phases and use prefetch hints for the scatter writes to mitigate cache misses.'
    },
    {
      id: 'bucket-sort',
      title: 'Bucket Sort',
      description: 'Bucket Sort distributes elements into a number of buckets, sorts each bucket individually (often with insertion sort), then concatenates the results. It achieves O(n) expected time when input is uniformly distributed because each bucket gets O(1) elements on average. The key insight is that distributing data reduces the problem size for each sub-sort, and the distribution step is O(n).',
      timeComplexity: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n^2)' },
      spaceComplexity: 'O(n + k)',
      keyPoints: [
        'Expected O(n) only when input is uniformly distributed across the range',
        'Worst case O(n^2) when all elements land in one bucket',
        'Number of buckets k: typically k = n for uniform data; adjust based on distribution',
        'Use insertion sort per bucket — buckets are small and nearly sorted',
        'Generalization: if you know the distribution, map elements to buckets accordingly',
        'Can sort floating-point numbers in [0, 1) trivially: bucket index = floor(n * value)',
        'Stable if the per-bucket sort is stable and elements are appended in order',
        'Not useful when distribution is unknown or highly skewed'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Bucket Sort for [0, 1) floats',
          code: `function bucketSort(arr: readonly number[]): number[] {
  const n = arr.length;
  if (n <= 1) return [...arr];

  const buckets: number[][] = Array.from({ length: n }, () => []);

  // Distribute into buckets
  for (const val of arr) {
    const idx = Math.min(Math.floor(val * n), n - 1);
    buckets[idx].push(val);
  }

  // Sort each bucket with insertion sort
  for (const bucket of buckets) {
    insertionSortInPlace(bucket);
  }

  // Concatenate
  return buckets.flat();
}

function insertionSortInPlace(arr: number[]): void {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
}`
        }
      ],
      useCases: [
        'Sorting uniformly distributed floating-point numbers',
        'Hash-based distribution sorting',
        'When input distribution is known and approximately uniform',
        'Histogram-based sorting with known ranges',
        'Sorting geographic coordinates into grid cells'
      ],
      commonPitfalls: [
        'Assuming O(n) without verifying the distribution is approximately uniform',
        'Too few buckets: degrade toward insertion sort on the whole array',
        'Too many buckets: waste memory with empty buckets',
        'Not handling edge case where value equals the max — bucket index goes out of bounds'
      ],
      interviewTips: [
        'Bucket sort is the answer when "input is uniformly distributed in [0, 1)"',
        'Know the analysis: with n buckets and n uniform elements, expected bucket size is O(1)',
        'Compare with counting sort: counting sort needs integer values, bucket sort handles floats',
        'If asked "sort in O(n)" — ask about the distribution; if uniform, bucket sort works'
      ],
      relatedConcepts: ['counting-sort', 'radix-sort', 'insertion-sort'],
      difficulty: 'intermediate',
      tags: ['non-comparison', 'stable', 'linear', 'distribution-sort'],
      proTip: 'The real-world application of bucket sort thinking is not sorting arrays — it is database query optimization. Hash joins and hash aggregations are essentially bucket sort: distribute rows into buckets by hash, process each bucket independently. Understanding bucket sort deeply helps you reason about database performance.'
    },
    {
      id: 'tim-sort',
      title: 'TimSort',
      description: 'TimSort is the hybrid sorting algorithm used by Python (list.sort), Java (Arrays.sort for objects), Android, and Swift. Invented by Tim Peters in 2002, it combines merge sort with insertion sort and exploits existing order in real-world data. It detects "runs" (ascending or descending sequences), extends short runs with insertion sort to a minimum length (typically 32-64), then merges runs using a sophisticated merge strategy that maintains a balanced merge tree.',
      timeComplexity: { best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Adaptive: O(n) on already-sorted data, detects and exploits existing runs',
        'Stable: critical for multi-key sorting (sort by last name, then by first name)',
        'Minimum run length (minrun): typically 32-64, chosen so merge tree is balanced',
        'Descending runs are reversed to become ascending — free optimization',
        'Galloping mode: when one run consistently "wins" during merge, switch to exponential search',
        'Merge strategy maintains invariant: len[i-2] > len[i-1] + len[i] (balanced merge tree)',
        'Real-world data is rarely random — TimSort exploits this where quicksort cannot',
        'The 2015 bug: Java and Android TimSort had a bug in the merge invariant — fixed with a stronger invariant'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Simplified TimSort Core Concepts',
          code: `const MIN_RUN = 32;

function timSort(arr: readonly number[]): number[] {
  const result = [...arr];
  const n = result.length;

  // Step 1: Sort small runs with insertion sort
  for (let start = 0; start < n; start += MIN_RUN) {
    const end = Math.min(start + MIN_RUN - 1, n - 1);
    insertionSortRange(result, start, end);
  }

  // Step 2: Merge runs, doubling the merge size each pass
  for (let size = MIN_RUN; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = Math.min(left + size - 1, n - 1);
      const right = Math.min(left + 2 * size - 1, n - 1);
      if (mid < right) {
        mergeRuns(result, left, mid, right);
      }
    }
  }

  return result;
}

function insertionSortRange(
  arr: number[], start: number, end: number
): void {
  for (let i = start + 1; i <= end; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= start && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
}

function mergeRuns(
  arr: number[], lo: number, mid: number, hi: number
): void {
  const left = arr.slice(lo, mid + 1);
  const right = arr.slice(mid + 1, hi + 1);
  let i = 0, j = 0, k = lo;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      arr[k++] = left[i++];
    } else {
      arr[k++] = right[j++];
    }
  }

  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
}`
        }
      ],
      useCases: [
        'General-purpose stable sorting (Python, Java, Swift standard libraries)',
        'Sorting data that is often partially sorted (database results, time series)',
        'When stability is required (multi-key sorting)',
        'UI sorting: users often re-sort by a different column — data retains previous order'
      ],
      commonPitfalls: [
        'Implementing TimSort from scratch when your language already provides it',
        'Not understanding that TimSort is designed for real-world data, not random data',
        'Forgetting that the galloping mode can be a pessimization on random data — it adds overhead',
        'The original merge invariant was too weak — ensure the stronger 4-element invariant'
      ],
      interviewTips: [
        'Know that Python sort() and Java Arrays.sort(Object[]) use TimSort',
        'Asked as: "How would you sort data that is mostly sorted?" — TimSort or adaptive sort',
        'Key insight: real data has structure (runs). TimSort exploits this; quicksort ignores it',
        'Follow-up: "Why not just use quicksort?" — stability, adaptivity, worst-case guarantee',
        'Know minrun calculation: choose 32-64 such that n/minrun is a power of 2 or slightly less'
      ],
      relatedConcepts: ['merge-sort', 'insertion-sort', 'adaptive-sort', 'galloping-mode'],
      difficulty: 'advanced',
      tags: ['comparison', 'stable', 'adaptive', 'hybrid', 'linearithmic'],
      proTip: 'The galloping mode is what makes TimSort truly fast on structured data. When one run dominates during merge (winning 7+ consecutive comparisons), TimSort switches from linear merge to exponential search. This makes merging a nearly-sorted array into a sorted array O(n) instead of O(n log n).'
    },
    {
      id: 'shell-sort',
      title: 'Shell Sort',
      description: 'Shell Sort is a generalization of insertion sort that allows elements to move long distances in early passes by comparing elements separated by a "gap." The gap decreases over subsequent passes until it reaches 1, at which point it becomes a standard insertion sort on a nearly-sorted array. The choice of gap sequence dramatically affects performance — from O(n^2) with Shell\'s original sequence to O(n^(4/3)) with Sedgewick\'s sequence.',
      timeComplexity: { best: 'O(n log n)', average: 'O(n^(4/3))', worst: 'O(n^(3/2))' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'NOT stable: long-distance comparisons can change relative order of equal elements',
        'Gap sequence determines performance: Shell (n/2), Knuth (3^k-1)/2, Sedgewick, Ciura',
        'Ciura sequence [1, 4, 10, 23, 57, 132, 301, 701] is empirically the best known',
        'With Sedgewick sequence: O(n^(4/3)) worst case — better than quadratic sorts',
        'The final gap-1 pass is insertion sort, but the array is nearly sorted from previous passes',
        'No known gap sequence achieves O(n log n) — the optimal sequence is an open problem',
        'In-place and simple to implement — good for embedded systems',
        'Outperforms insertion sort significantly for medium-sized arrays (100-10000 elements)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Shell Sort with Knuth Gap Sequence',
          code: `function shellSort(arr: readonly number[]): number[] {
  const result = [...arr];
  const n = result.length;

  // Knuth sequence: 1, 4, 13, 40, 121, ...
  // h = 3*h + 1, use largest h < n/3
  let gap = 1;
  while (gap < Math.floor(n / 3)) {
    gap = 3 * gap + 1;
  }

  while (gap >= 1) {
    // Gap insertion sort
    for (let i = gap; i < n; i++) {
      const key = result[i];
      let j = i;
      while (j >= gap && result[j - gap] > key) {
        result[j] = result[j - gap];
        j -= gap;
      }
      result[j] = key;
    }
    gap = Math.floor(gap / 3);
  }

  return result;
}`
        }
      ],
      useCases: [
        'Embedded systems where simplicity and O(1) space matter',
        'Medium-sized arrays (100-10000) where the overhead of merge/quick sort is not justified',
        'When insertion sort is too slow but you cannot afford O(n) auxiliary space',
        'Historical significance and educational value'
      ],
      commonPitfalls: [
        'Using Shell original sequence (n/2, n/4, ...) — it is O(n^2) in the worst case',
        'Not starting gap calculation correctly — gap must be < n',
        'Assuming Shell sort is stable — it is NOT',
        'Over-engineering gap sequences — Ciura or Knuth sequences are sufficient in practice'
      ],
      interviewTips: [
        'Shell sort is rarely asked directly but appears in "improve insertion sort" discussions',
        'Know that the optimal gap sequence is an open problem in computer science',
        'Key insight: h-sorting an array preserves the h\'-sorted property for any h\' < h',
        'If asked about sub-quadratic in-place sorting without recursion: Shell sort'
      ],
      relatedConcepts: ['insertion-sort', 'comb-sort', 'gap-sequence'],
      difficulty: 'intermediate',
      tags: ['comparison', 'unstable', 'in-place', 'adaptive'],
      proTip: 'Shell sort is the go-to in embedded systems (kernel code, uBoot, embedded Linux) because it is in-place, non-recursive, and faster than insertion sort. The Linux kernel historically used Shell sort for small internal sorts where linking to libc qsort was not desirable.'
    }
  ]
}
