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

export const bitCategory: Category = {
  id: 'bit-manipulation',
  title: 'Bit Manipulation',
  description: 'Bit manipulation operates directly on the binary representation of numbers. It enables O(1) operations that would otherwise require loops, compact state representation via bitmasks, and elegant solutions to problems that seem unrelated to binary. Mastering bits means mastering the language your CPU actually speaks.',
  icon: '🔢',
  concepts: [
    {
      id: 'bitwise-basics',
      title: 'Bitwise Basics',
      description: 'The six bitwise operators (AND, OR, XOR, NOT, left shift, right shift) operate on individual bits of integers. Understanding these operators is prerequisite to all bit manipulation. Key subtleties include operator precedence (bitwise ops have LOWER precedence than comparison operators in most languages), signed vs unsigned right shift, and the behavior of JavaScript\'s 32-bit integer coercion for bitwise operations.',
      timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'AND (&): both bits 1 => 1. Used to mask/extract bits, check if bit is set',
        'OR (|): either bit 1 => 1. Used to set bits, combine flags',
        'XOR (^): bits differ => 1. Used to toggle bits, find differences, swap without temp',
        'NOT (~): flip all bits. ~n = -(n+1) in two\'s complement',
        'Left shift (<<): multiply by 2^k. 1 << k = 2^k',
        'Right shift (>>): arithmetic shift, preserves sign. (>>>): logical shift, fills with 0',
        'PRECEDENCE TRAP: (a & b == c) parses as (a & (b == c)) — always parenthesize bitwise ops',
        'JavaScript coerces numbers to 32-bit signed integers for bitwise ops — 1 << 31 is negative'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Bitwise Operations Reference',
          code: `// AND: mask and check
const isOdd = (n: number): boolean => (n & 1) === 1;
const clearLowerBits = (n: number, k: number): number => n & (~0 << k);

// OR: set bits
const setBit = (n: number, k: number): number => n | (1 << k);
const ensureOdd = (n: number): number => n | 1;

// XOR: toggle and find differences
const toggleBit = (n: number, k: number): number => n ^ (1 << k);
const swapWithoutTemp = (a: number, b: number): [number, number] => {
  a ^= b; b ^= a; a ^= b;
  return [a, b];
};

// NOT: complement
const flipBits = (n: number): number => ~n; // -(n+1) in two's complement

// Shifts
const multiplyBy8 = (n: number): number => n << 3;
const divideBy4 = (n: number): number => n >> 2; // Arithmetic (preserves sign)
const unsignedShift = (n: number): number => n >>> 1; // Logical (fills with 0)

// Common bit checks
const isBitSet = (n: number, k: number): boolean => (n & (1 << k)) !== 0;
const clearBit = (n: number, k: number): number => n & ~(1 << k);

// PRECEDENCE WARNING
// WRONG: if (flags & MASK == EXPECTED) — parses as flags & (MASK == EXPECTED)
// RIGHT: if ((flags & MASK) === EXPECTED)`
        }
      ],
      useCases: [
        'Flag manipulation in configuration and permissions',
        'Low-level hardware and driver programming',
        'Network protocols: parsing packet headers, subnet masks',
        'Graphics: color channel manipulation (RGBA)',
        'Embedded systems: register manipulation'
      ],
      commonPitfalls: [
        'Operator precedence: & has lower precedence than == — ALWAYS use parentheses',
        'JavaScript 32-bit coercion: bitwise ops convert to 32-bit signed int, losing precision for large numbers',
        '1 << 31 is -2147483648 in JavaScript (32-bit signed overflow)',
        'Signed right shift (>>) propagates the sign bit; logical shift (>>>) fills with 0',
        'NOT: ~0 is -1, not 0 — two\'s complement representation'
      ],
      interviewTips: [
        'Bitwise basics appear in many interview problems — know all six operators cold',
        'The precedence trap is a REAL interview gotcha — parenthesize every bitwise comparison',
        'Know the difference between >> and >>> — asked in JavaScript/TypeScript interviews',
        'Quick check: n & 1 for odd/even is faster than n % 2 and works for negatives in some languages'
      ],
      relatedConcepts: ['xor-properties', 'twos-complement', 'common-tricks'],
      difficulty: 'beginner',
      tags: ['fundamentals', 'operators', 'binary'],
      proTip: 'In JavaScript/TypeScript, ALL bitwise operations convert operands to 32-bit signed integers. This means 2^31 (2147483648) becomes -2147483648, and any number larger than 2^32 loses its upper bits. If you need to work with larger bitmasks (e.g., n > 31), use BigInt: (1n << 40n). This is a common source of bugs in competitive programming with JavaScript.'
    },
    {
      id: 'common-tricks',
      title: 'Common Bit Tricks',
      description: 'A handful of bit manipulation patterns solve a surprisingly wide range of problems. The most important: n & (n-1) removes the lowest set bit (used in Brian Kernighan popcount and power-of-two check), n & (-n) isolates the lowest set bit (used in Fenwick trees and subset enumeration), and n | (n-1) sets all bits below the lowest set bit. These patterns are the building blocks of all advanced bit manipulation.',
      timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'n & (n-1): remove lowest set bit — turns 101100 into 101000',
        'n & (-n): isolate lowest set bit — turns 101100 into 000100',
        'n | (n-1): set all bits below lowest set bit — turns 101100 into 101111',
        'Check bit k: (n >> k) & 1 or (n & (1 << k)) !== 0',
        'Set bit k: n | (1 << k)',
        'Clear bit k: n & ~(1 << k)',
        'Toggle bit k: n ^ (1 << k)',
        'Isolate rightmost 0: ~n & (n+1)',
        'These are the foundation of Fenwick tree operations and subset enumeration'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Essential Bit Tricks',
          code: `// Remove lowest set bit: n & (n-1)
// 12 (1100) -> 8 (1000)
function removeLowestSetBit(n: number): number {
  return n & (n - 1);
}

// Isolate lowest set bit: n & (-n)
// 12 (1100) -> 4 (0100)
function lowestSetBit(n: number): number {
  return n & (-n);
}

// Check if exactly one bit is set (power of 2)
function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

// Count trailing zeros (position of lowest set bit)
function trailingZeros(n: number): number {
  if (n === 0) return 32;
  let count = 0;
  let x = n;
  while ((x & 1) === 0) { x >>= 1; count++; }
  return count;
}

// Next power of 2 >= n
function nextPowerOf2(n: number): number {
  if (n <= 1) return 1;
  let x = n - 1;
  x |= x >> 1;
  x |= x >> 2;
  x |= x >> 4;
  x |= x >> 8;
  x |= x >> 16;
  return x + 1;
}

// Extract bits [lo, hi] inclusive (0-indexed from right)
function extractBits(n: number, lo: number, hi: number): number {
  const mask = ((1 << (hi - lo + 1)) - 1) << lo;
  return (n & mask) >> lo;
}

// Iterate all set bits
function forEachSetBit(n: number, callback: (bit: number) => void): void {
  let x = n;
  while (x !== 0) {
    const lowest = x & (-x);
    callback(Math.log2(lowest));
    x &= x - 1; // Remove lowest set bit
  }
}`
        }
      ],
      useCases: [
        'Fenwick tree (BIT): uses n & (-n) for index manipulation',
        'Subset enumeration: iterate subsets using n & (n-1) pattern',
        'Power of two checks: memory allocation, hash table sizing',
        'Counting set bits efficiently (Brian Kernighan\'s method)',
        'Low-level optimization in performance-critical code'
      ],
      commonPitfalls: [
        'n & (n-1) on 0 gives 0 — handle the zero case explicitly for power-of-two check',
        'n & (-n) on 0 gives 0 — lowest set bit is undefined for 0',
        'Signed integer issues: -n in two\'s complement depends on the integer width',
        'Using Math.log2 to find bit position: floating-point imprecision for large values'
      ],
      interviewTips: [
        'n & (n-1) is THE most important bit trick — it appears in 5+ common interview problems',
        '"Is n a power of 2?" = n > 0 && (n & (n-1)) === 0 — know this instantly',
        'Isolate lowest set bit (n & -n) appears in Fenwick trees — mention the connection',
        'If asked "count set bits": Brian Kernighan method uses n & (n-1) repeatedly'
      ],
      relatedConcepts: ['counting-bits', 'power-of-two', 'fenwick-tree', 'xor-properties'],
      difficulty: 'beginner',
      tags: ['tricks', 'patterns', 'optimization'],
      proTip: 'The trick n & (n-1) works because subtracting 1 from a binary number flips the lowest set bit and all bits below it. So n and n-1 differ in exactly those bits, and AND-ing them clears the lowest set bit. This same principle explains why n & (-n) isolates it: in two\'s complement, -n = ~n + 1, which flips everything above the lowest set bit.'
    },
    {
      id: 'xor-properties',
      title: 'XOR Properties and Applications',
      description: 'XOR has three magical properties: self-inverse (a ^ a = 0), identity (a ^ 0 = a), and commutativity/associativity. These properties enable finding the single non-repeating element in O(n) time and O(1) space, finding TWO non-repeating elements with one pass of XOR + bit partitioning, and swapping variables without a temporary. XOR is also the foundation of parity checks, error detection, and cryptographic stream ciphers.',
      timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'a ^ a = 0 (self-inverse): XOR-ing a number with itself cancels out',
        'a ^ 0 = a (identity): XOR with 0 preserves the value',
        'Commutative and associative: order does not matter',
        'Single non-repeating: XOR all elements, pairs cancel, lone element remains',
        'Two non-repeating: XOR all to get x^y, find a differing bit, partition into two groups',
        'Swap: a ^= b; b ^= a; a ^= b — works because (a^b)^b = a',
        'XOR prefix: like prefix sum but with XOR — enables range XOR queries in O(1)',
        'Missing number: XOR all numbers 0..n with array elements — missing one remains'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'XOR Applications',
          code: `// Find single non-repeating element (all others appear twice)
function singleNumber(nums: readonly number[]): number {
  let result = 0;
  for (const n of nums) result ^= n;
  return result;
}

// Find TWO non-repeating elements (all others appear twice)
function twoSingleNumbers(nums: readonly number[]): [number, number] {
  // Step 1: XOR all — get xorAll = a ^ b
  let xorAll = 0;
  for (const n of nums) xorAll ^= n;

  // Step 2: Find any bit where a and b differ
  const diffBit = xorAll & (-xorAll); // Lowest set bit of a^b

  // Step 3: Partition into two groups by that bit
  let group1 = 0, group2 = 0;
  for (const n of nums) {
    if (n & diffBit) group1 ^= n;
    else group2 ^= n;
  }

  return [group1, group2];
}

// Find missing number in [0, n]
function missingNumber(nums: readonly number[]): number {
  let xor = nums.length; // Start with n
  for (let i = 0; i < nums.length; i++) {
    xor ^= i ^ nums[i];
  }
  return xor;
}

// Single number appearing once, all others THREE times
function singleNumberII(nums: readonly number[]): number {
  // Bit counting approach: for each bit position, count 1s mod 3
  let result = 0;
  for (let bit = 0; bit < 32; bit++) {
    let sum = 0;
    for (const n of nums) {
      sum += (n >> bit) & 1;
    }
    if (sum % 3 !== 0) {
      result |= (1 << bit);
    }
  }
  // Handle sign bit for negative numbers
  return result | 0; // Convert to signed 32-bit
}

// XOR prefix for range queries
function xorRange(nums: readonly number[], l: number, r: number): number {
  // Precompute prefix XOR
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] ^ nums[i];
  }
  return prefix[r + 1] ^ prefix[l];
}`
        }
      ],
      useCases: [
        'Finding unique elements in arrays with duplicates',
        'Missing number detection',
        'Error detection: parity bits, checksums',
        'Cryptography: XOR is the core of stream ciphers (one-time pad)',
        'Gray code generation: consecutive codes differ by one XOR bit'
      ],
      commonPitfalls: [
        'XOR swap on the same variable: a ^= a gives 0, not a — the swap trick fails when a and b are the same reference',
        'Single number with three occurrences: XOR alone does not work — need bit counting mod 3',
        'Assuming XOR always works: it requires exactly 2 occurrences of duplicates for the pair-cancel property',
        'Sign extension: XOR on signed integers can produce unexpected results for the sign bit'
      ],
      interviewTips: [
        '"Find the number appearing once" is the #1 XOR interview question',
        'Two non-repeating elements: the partition trick using the differing bit is the key insight',
        'Missing number: XOR approach is O(n) time O(1) space, vs formula n*(n+1)/2 which can overflow',
        'If elements appear 3 times except one: bit counting mod 3, not XOR'
      ],
      relatedConcepts: ['bitwise-basics', 'common-tricks', 'gray-code'],
      difficulty: 'intermediate',
      tags: ['xor', 'unique-element', 'cancellation'],
      proTip: 'The two-single-numbers problem is one of the most elegant bit manipulation solutions. The insight that a^b has a set bit exactly where a and b differ allows you to split all numbers into two groups — each containing exactly one unique number. This "partition by a distinguishing bit" technique appears in many divide-and-conquer bit problems.'
    },
    {
      id: 'counting-bits',
      title: 'Counting Bits (Popcount)',
      description: 'Counting the number of set bits (popcount, Hamming weight) in a binary number is one of the most fundamental bit operations. Brian Kernighan\'s method runs in O(k) where k is the number of set bits. Lookup tables provide O(1) amortized. Modern CPUs have a hardware POPCNT instruction. Counting bits for all numbers 0..n can be done in O(n) using DP: dp[i] = dp[i >> 1] + (i & 1).',
      timeComplexity: { best: 'O(1)', average: 'O(k)', worst: 'O(log n)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Brian Kernighan: repeatedly do n = n & (n-1), count iterations until n = 0',
        'Kernighan runs in O(k) where k = number of set bits, not O(32)',
        'Lookup table: precompute popcount for all 8-bit or 16-bit values',
        'Hardware POPCNT: single CPU instruction, O(1) — available in modern x86, ARM',
        'DP for range: dp[i] = dp[i >> 1] + (i & 1) gives popcount for all 0..n in O(n)',
        'Parallel bit counting: divide-and-conquer on 32-bit integer in O(log 32) = O(5) operations',
        'Hamming distance = popcount(a ^ b) — count bits where a and b differ',
        'Applications: set cardinality in bitmask, Hamming distance, population count in databases'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Popcount Methods',
          code: `// Brian Kernighan's method: O(number of set bits)
function popcount(n: number): number {
  let count = 0;
  let x = n;
  while (x !== 0) {
    x &= x - 1; // Remove lowest set bit
    count++;
  }
  return count;
}

// Parallel bit count (constant time for 32-bit)
function popcountParallel(n: number): number {
  let x = n;
  x = x - ((x >> 1) & 0x55555555);            // Count pairs
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333); // Count nibbles
  x = (x + (x >> 4)) & 0x0f0f0f0f;            // Count bytes
  return (x * 0x01010101) >> 24;                // Sum bytes
}

// Count bits for all numbers 0..n (DP)
function countBitsRange(n: number): number[] {
  const dp = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    dp[i] = dp[i >> 1] + (i & 1);
  }
  return dp;
}

// Hamming distance
function hammingDistance(a: number, b: number): number {
  return popcount(a ^ b);
}

// Total Hamming distance between all pairs
function totalHammingDistance(nums: readonly number[]): number {
  let total = 0;
  for (let bit = 0; bit < 32; bit++) {
    let ones = 0;
    for (const n of nums) {
      if (n & (1 << bit)) ones++;
    }
    const zeros = nums.length - ones;
    total += ones * zeros; // Each 1-0 pair contributes 1
  }
  return total;
}`
        }
      ],
      useCases: [
        'Hamming distance computation (error correction codes)',
        'Bitmask set cardinality',
        'Database bitmap index population count',
        'Cryptography: bit distribution analysis',
        'Genetics: comparing DNA sequences bit by bit'
      ],
      commonPitfalls: [
        'Naive loop counting all 32 bits when Kernighan is O(k) — unnecessary work for sparse bits',
        'Parallel popcount: the magic constants depend on integer width — 32-bit vs 64-bit differs',
        'JavaScript signed integers: popcount of negative numbers requires handling sign bit',
        'DP formula dp[i >> 1] + (i & 1) works because i >> 1 removes the last bit and i & 1 tells what it was'
      ],
      interviewTips: [
        '"Count number of 1 bits" is a classic easy problem — know Kernighan\'s method',
        '"Counting bits" for 0..n: the DP recurrence dp[i] = dp[i >> 1] + (i & 1) is elegant',
        '"Hamming distance" = popcount(a ^ b) — combine two concepts',
        '"Total Hamming distance" of all pairs: count 1s and 0s per bit position, multiply'
      ],
      relatedConcepts: ['common-tricks', 'hamming-distance', 'xor-properties'],
      difficulty: 'beginner',
      tags: ['popcount', 'hamming', 'counting'],
      proTip: 'The parallel bit counting method (divide and conquer on bits) is how the hardware POPCNT instruction works internally. The expression x * 0x01010101 >> 24 at the end is a clever trick: multiplying by 0x01010101 sums the four bytes into the top byte, then shifting right by 24 extracts it. This is single-cycle on modern CPUs and the fastest possible software popcount.'
    },
    {
      id: 'power-of-two',
      title: 'Power of Two',
      description: 'A number is a power of two if and only if it has exactly one set bit in its binary representation. The check n > 0 && (n & (n-1)) === 0 is the canonical O(1) test. Finding the next power of two involves setting all bits below the highest bit and adding 1. Powers of two are special in computing because they correspond to clean binary boundaries, making them fundamental to memory alignment, hash table sizing, and divide-and-conquer algorithms.',
      timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'n & (n-1) === 0 and n > 0: exactly one bit set = power of two',
        'Why it works: n-1 flips the single set bit and all bits below, AND clears everything',
        'Next power of two: set all bits below MSB, then add 1',
        'Previous power of two: isolate highest set bit — equivalent to 1 << floor(log2(n))',
        'Powers of two are special for modular arithmetic: n % (2^k) = n & (2^k - 1)',
        'Alignment: (n + (align-1)) & ~(align-1) rounds up to next multiple of align (when align is power of 2)',
        'Hash table capacity: keep as power of two so modular indexing becomes a fast AND mask',
        '2^k in binary is a 1 followed by k zeros: 1, 10, 100, 1000, ...'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Power of Two Operations',
          code: `function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

function nextPowerOfTwo(n: number): number {
  if (n <= 1) return 1;
  let x = n - 1;
  x |= x >> 1;
  x |= x >> 2;
  x |= x >> 4;
  x |= x >> 8;
  x |= x >> 16;
  return x + 1;
}

function prevPowerOfTwo(n: number): number {
  if (n <= 0) return 0;
  let x = n;
  x |= x >> 1;
  x |= x >> 2;
  x |= x >> 4;
  x |= x >> 8;
  x |= x >> 16;
  return (x + 1) >> 1;
}

// Fast modulo for power of 2: n % m where m is power of 2
function fastMod(n: number, powerOf2: number): number {
  return n & (powerOf2 - 1);
}

// Align to power of 2 boundary
function alignUp(n: number, alignment: number): number {
  return (n + alignment - 1) & ~(alignment - 1);
}`
        }
      ],
      useCases: [
        'Hash table sizing: capacities should be powers of two for fast modulo',
        'Memory alignment: align addresses to cache line or page boundaries',
        'Binary tree sizing: complete binary trees have 2^k - 1 nodes',
        'FFT: requires input size to be a power of two (or pad to next one)',
        'Network: subnet masks are contiguous 1 bits = (2^k - 1) << offset'
      ],
      commonPitfalls: [
        'Forgetting n > 0: 0 satisfies (n & (n-1)) === 0 but is NOT a power of two',
        'Next power of two overflow: for n close to 2^31, the result overflows 32-bit int',
        'Alignment: the formula only works when alignment is a power of two',
        'Using Math.log2 for the check: floating-point imprecision gives wrong results for large numbers'
      ],
      interviewTips: [
        '"Is n a power of 2?" is a classic one-liner — know it instantly',
        'The n & (n-1) trick is the most frequently tested bit manipulation concept',
        'If asked "next power of 2": the cascade-OR approach is O(1) — impressive to explain',
        'Connect to hash tables: "Why are hash table sizes powers of 2?" — fast modulo via AND mask'
      ],
      relatedConcepts: ['common-tricks', 'counting-bits', 'hash-table'],
      difficulty: 'beginner',
      tags: ['power-of-two', 'alignment', 'hash-table'],
      proTip: 'Java HashMap, C++ unordered_map, and most production hash tables use power-of-two capacity. The reason: hash % capacity becomes hash & (capacity - 1), which is a single AND instruction instead of an expensive division. When the hash function is good, this is safe. When it is bad, the lower bits are biased — which is why Java rehashes the key with a "spreading" function before masking.'
    },
    {
      id: 'bit-dp',
      title: 'Bit DP and SOS DP',
      description: 'Bitmask DP uses an integer bitmask to represent a subset of elements, enabling DP over all 2^n subsets. The classic application is TSP in O(2^n * n^2). SOS (Sum Over Subsets) DP computes for each mask the sum of values over all its subsets in O(2^n * n) instead of the naive O(3^n). These techniques are the standard approach for problems with n <= 20 that require tracking set membership.',
      timeComplexity: { best: 'O(2^n * n)', average: 'O(2^n * n^2)', worst: 'O(2^n * n^2)' },
      spaceComplexity: 'O(2^n)',
      keyPoints: [
        'Bitmask state: bit i set means element i is in the current subset',
        'TSP: dp[mask][last] = min cost visiting cities in mask, ending at last',
        'Assignment problem: dp[mask] = min cost assigning first popcount(mask) workers to jobs in mask',
        'Subset enumeration: for (sub = mask; sub > 0; sub = (sub-1) & mask) enumerates all subsets of mask',
        'SOS DP: dp[mask] = sum of f[sub] for all sub subset of mask, in O(2^n * n)',
        'SOS technique: for each bit position, include contributions from masks with that bit unset',
        'Practical limit: n <= 20-23 (2^20 ~ 1M, 2^23 ~ 8M states)',
        'Profile DP: bitmask represents state of a grid row for tile placement problems'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Bitmask DP and SOS DP',
          code: `// Assignment problem: assign n workers to n jobs minimally
function assignmentProblem(cost: number[][]): number {
  const n = cost.length;
  const dp = new Array(1 << n).fill(Infinity);
  dp[0] = 0;

  for (let mask = 0; mask < (1 << n); mask++) {
    const worker = popcount(mask); // How many workers assigned so far
    if (worker >= n) continue;

    for (let job = 0; job < n; job++) {
      if (mask & (1 << job)) continue; // Job already assigned
      const newMask = mask | (1 << job);
      dp[newMask] = Math.min(dp[newMask], dp[mask] + cost[worker][job]);
    }
  }

  return dp[(1 << n) - 1];
}

function popcount(x: number): number {
  let count = 0;
  while (x) { x &= x - 1; count++; }
  return count;
}

// SOS DP: for each mask, sum f[sub] over all subsets sub of mask
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
}

// Enumerate all subsets of a bitmask
function enumerateSubsets(mask: number): number[] {
  const result: number[] = [];
  for (let sub = mask; sub > 0; sub = (sub - 1) & mask) {
    result.push(sub);
  }
  result.push(0); // Empty subset
  return result;
}

// Minimum vertex cover using bitmask DP
function minVertexCover(
  adj: boolean[][], n: number
): number {
  let minSize = n;

  for (let mask = 0; mask < (1 << n); mask++) {
    // Check if mask is a valid vertex cover
    let valid = true;
    for (let u = 0; u < n && valid; u++) {
      for (let v = u + 1; v < n && valid; v++) {
        if (adj[u][v] && !(mask & (1 << u)) && !(mask & (1 << v))) {
          valid = false;
        }
      }
    }
    if (valid) {
      minSize = Math.min(minSize, popcount(mask));
    }
  }

  return minSize;
}`
        }
      ],
      useCases: [
        'Traveling Salesman Problem (TSP) for small n',
        'Worker-job assignment (Hungarian alternative for small n)',
        'Set cover and vertex cover for small n',
        'Hamilton path in small graphs',
        'Competitive programming problems with n <= 20'
      ],
      commonPitfalls: [
        'n > 23: 2^23 * 23 ~ 200M operations — too slow for most time limits',
        'Subset enumeration: (sub-1) & mask will not produce 0 — add 0 explicitly or handle loop end',
        'SOS DP: processing bits in the wrong order — must iterate bit position in outer loop',
        'JavaScript: 1 << 31 is negative — use (1 << 31) >>> 0 for unsigned or avoid n > 30'
      ],
      interviewTips: [
        'Bitmask DP is the answer when n <= 20 and you need to track "which elements are used"',
        'TSP: dp[mask][last] in O(2^n * n^2) — know this template cold',
        'SOS DP: O(2^n * n) for subset-sum queries — mention it for bonus points in competitive interviews',
        'The subset enumeration loop for (sub = mask; sub > 0; sub = (sub-1) & mask) is a classic idiom'
      ],
      relatedConcepts: ['bitmask-dp', 'tsp', 'assignment-problem', 'subset-enumeration'],
      difficulty: 'advanced',
      tags: ['dp', 'bitmask', 'subset', 'exponential'],
      proTip: 'SOS DP is the bitmask analog of prefix sums. Just as prefix sums allow O(1) range sum queries after O(n) preprocessing, SOS DP allows O(1) subset-sum queries after O(2^n * n) preprocessing. The technique: for each bit position i, accumulate values from masks with bit i unset into masks with bit i set. This "include one more dimension at a time" approach is exactly how multi-dimensional prefix sums work.'
    },
    {
      id: 'gray-code',
      title: 'Gray Code',
      description: 'Gray code is a binary numeral system where consecutive numbers differ by exactly one bit. The n-bit Gray code sequence has 2^n values covering all n-bit numbers. Generation is elegant: Gray(n) = n ^ (n >> 1). The key property (single-bit transitions) makes Gray code essential in rotary encoders, error reduction in A/D converters, and as a building block for Karnaugh maps.',
      timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Consecutive codes differ by exactly one bit',
        'Binary to Gray: gray = n ^ (n >> 1)',
        'Gray to binary: iteratively XOR shifted versions of gray code',
        'n-bit Gray code has 2^n unique values forming a Hamiltonian cycle on the hypercube',
        'Reflected construction: G(n) = [0 prepended to G(n-1)] ++ [1 prepended to reverse of G(n-1)]',
        'Applications: rotary encoders (at most 1 bit error at boundaries), Karnaugh maps, channel coding',
        'Gray code ordering minimizes bit transitions — useful for low-power circuits',
        'Connection to Towers of Hanoi: nth Gray code change tells which disk to move'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Gray Code Generation and Conversion',
          code: `// Binary to Gray code
function toGray(n: number): number {
  return n ^ (n >> 1);
}

// Gray code to binary
function fromGray(gray: number): number {
  let n = gray;
  let mask = n >> 1;
  while (mask > 0) {
    n ^= mask;
    mask >>= 1;
  }
  return n;
}

// Generate n-bit Gray code sequence
function grayCodeSequence(n: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < (1 << n); i++) {
    result.push(toGray(i));
  }
  return result;
}

// Reflected construction (recursive)
function grayCodeReflected(n: number): number[] {
  if (n === 0) return [0];
  const prev = grayCodeReflected(n - 1);
  const bit = 1 << (n - 1);
  return [...prev, ...prev.slice().reverse().map(x => x | bit)];
}`
        }
      ],
      useCases: [
        'Rotary encoders: at most 1-bit error during mechanical transitions',
        'Analog-to-digital converters: minimize errors at quantization boundaries',
        'Karnaugh maps: adjacent cells differ by one variable',
        'Low-power circuit design: minimize switching activity',
        'Towers of Hanoi solution encoding'
      ],
      commonPitfalls: [
        'Gray to binary: must iterate through all bit positions, not just XOR once',
        'Assuming Gray code is unique — there are multiple valid Gray code sequences for n bits',
        'Forgetting that Gray code sequence is cyclic: the last and first codes also differ by one bit'
      ],
      interviewTips: [
        '"Generate Gray code" is a Leetcode medium — know the n ^ (n >> 1) formula',
        'The reflected construction explains WHY the formula works — be prepared to explain it',
        'If asked for applications: rotary encoders and Karnaugh maps are the standard answers',
        'Connection to Towers of Hanoi is an interesting follow-up for algorithmic interviews'
      ],
      relatedConcepts: ['xor-properties', 'hamiltonian-cycle', 'hypercube'],
      difficulty: 'intermediate',
      tags: ['encoding', 'single-bit-change', 'sequence'],
      proTip: 'The Gray code to Towers of Hanoi connection is delightful: the position of the single changed bit in consecutive Gray codes tells you which disk to move. If Gray(n) ^ Gray(n+1) = 2^k, move disk k. The move direction alternates by disk number. This gives a non-recursive, bit-based solution to Towers of Hanoi that generates moves in O(1) per move.'
    },
    {
      id: 'bit-hacks-arithmetic',
      title: 'Bit Hacks for Arithmetic',
      description: 'Bit manipulation can replace common arithmetic operations with branchless, constant-time alternatives. Computing absolute value, min, max, and sign without conditional branches avoids pipeline stalls on modern CPUs. While compilers often generate these automatically, understanding them reveals how hardware works and helps in embedded systems and SIMD programming where branches are expensive.',
      timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Absolute value: (n ^ (n >> 31)) - (n >> 31) — uses sign bit as mask',
        'Min without branch: a + ((b - a) & ((b - a) >> 31)) — exploits sign bit',
        'Max without branch: b - ((b - a) & ((b - a) >> 31))',
        'Sign function: (n >> 31) | ((-n) >>> 31) — returns -1, 0, or 1',
        'Conditional negate: (n ^ mask) - mask where mask = condition ? -1 : 0',
        'Multiply by 2^k: n << k. Divide by 2^k: n >> k (arithmetic) or n >>> k (logical)',
        'Round up to multiple of k (power of 2): (n + k - 1) & ~(k - 1)',
        'These are branchless: no conditional jumps, predictable execution time'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Branchless Arithmetic',
          code: `// Absolute value without branching
function absNoBranch(n: number): number {
  const mask = n >> 31; // -1 if negative, 0 if non-negative
  return (n ^ mask) - mask;
}

// Min without branching
function minNoBranch(a: number, b: number): number {
  const diff = b - a;
  return a + (diff & (diff >> 31));
}

// Max without branching
function maxNoBranch(a: number, b: number): number {
  const diff = b - a;
  return b - (diff & (diff >> 31));
}

// Sign: returns -1, 0, or 1
function sign(n: number): number {
  return (n >> 31) | ((-n) >>> 31);
}

// Conditional set: if condition, return a; else return b
function conditionalSelect(
  condition: boolean, a: number, b: number
): number {
  const mask = condition ? -1 : 0; // Branchless in practice
  return (a & mask) | (b & ~mask);
}

// Average without overflow: (a + b) / 2 but avoiding overflow
function averageNoOverflow(a: number, b: number): number {
  return (a & b) + ((a ^ b) >> 1);
}`
        }
      ],
      useCases: [
        'SIMD programming: branchless operations for parallel data processing',
        'Embedded systems: avoiding branch misprediction on simple processors',
        'GPU shaders: branches are expensive on GPUs, branchless is preferred',
        'Real-time systems: predictable execution time without branch-dependent variation',
        'Compiler optimization: understanding what the compiler generates'
      ],
      commonPitfalls: [
        'Overflow: b - a can overflow for large values — only safe when |a - b| fits in int',
        'Sign of zero: -0 in IEEE 754 has sign bit set but equals +0',
        'Modern compilers often generate branchless code from if/else — hand-optimization may not help',
        'Readability: bit hacks are harder to understand — prefer simple code unless performance is proven bottleneck'
      ],
      interviewTips: [
        'These tricks are rarely asked directly but show deep low-level understanding',
        'If asked "implement abs without if": the sign mask trick is the answer',
        'The overflow-safe average formula (a & b) + ((a ^ b) >> 1) is a classic trick',
        'In real interviews, prioritize readability over cleverness unless specifically asked for branchless'
      ],
      relatedConcepts: ['bitwise-basics', 'twos-complement', 'simd'],
      difficulty: 'advanced',
      tags: ['branchless', 'arithmetic', 'optimization'],
      proTip: 'The overflow-safe average formula (a & b) + ((a ^ b) >> 1) is how you fix the classic binary search overflow bug. Instead of mid = (lo + hi) / 2 (which overflows), you can use mid = (lo & hi) + ((lo ^ hi) >> 1). The a & b computes the "carry" (bits that are 1 in both), and (a ^ b) >> 1 is the "average of the differing bits." This was used to fix a 20-year-old bug in Java\'s binary search.'
    },
    {
      id: 'twos-complement',
      title: 'Two\'s Complement',
      description: 'Two\'s complement is the standard representation for signed integers in virtually all modern computers. The key insight: negating a number is done by flipping all bits and adding 1 (-n = ~n + 1). This representation makes addition and subtraction work identically for signed and unsigned numbers. Understanding two\'s complement is essential for: knowing why INT_MIN has no positive counterpart, why -1 is all 1s, and why n & (-n) isolates the lowest set bit.',
      timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Negation: -n = ~n + 1 (flip bits and add 1)',
        '-1 = all 1s (0xFFFFFFFF for 32-bit)',
        'Range for k bits: [-2^(k-1), 2^(k-1)-1] — asymmetric! One more negative than positive',
        'INT_MIN (-2^31) has no positive counterpart — abs(INT_MIN) overflows',
        'The sign bit is the MSB: 1 = negative, 0 = non-negative',
        'n & (-n) works because -n = ~n + 1, which flips all bits above the lowest set bit',
        'Overflow: adding two positive numbers can give negative (and vice versa)',
        'JavaScript bitwise ops use 32-bit signed two\'s complement'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Two\'s Complement Exploration',
          code: `// Negate via two's complement
function negate(n: number): number {
  return (~n + 1) | 0; // |0 coerces to 32-bit signed
}

// Check for overflow in addition
function addOverflows(a: number, b: number): boolean {
  const sum = (a + b) | 0;
  // Overflow if: same signs in, different sign out
  return ((a ^ sum) & (b ^ sum)) < 0;
}

// INT_MIN edge case
const INT_MIN = -(2 ** 31);    // -2147483648
const INT_MAX = 2 ** 31 - 1;   //  2147483647
// abs(INT_MIN) overflows! |INT_MIN| = INT_MAX + 1

// Why n & (-n) isolates lowest set bit:
// n    = ...1000  (some number ending in 1 followed by zeros)
// ~n   = ...0111  (flip all bits)
// ~n+1 = ...1000  (add 1 carries through the trailing 1s)
// -n   = ~n + 1
// n & -n gives: 000...1000 (only the lowest set bit)

// Reverse bits of a 32-bit integer
function reverseBits(n: number): number {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    result = (result << 1) | (n & 1);
    n >>>= 1; // Unsigned shift to avoid sign extension
  }
  return result >>> 0; // Convert to unsigned
}`
        }
      ],
      useCases: [
        'Understanding integer overflow behavior',
        'Low-level systems programming',
        'Bit manipulation correctness (why bit tricks work)',
        'Security: integer overflow vulnerabilities'
      ],
      commonPitfalls: [
        'abs(INT_MIN) overflows — special-case this in absolute value implementations',
        '-(-n) is not always n: -INT_MIN = INT_MIN in 32-bit two\'s complement',
        'Mixing signed and unsigned operations: comparison of signed -1 with unsigned 0xFFFFFFFF',
        'JavaScript >> is arithmetic (preserves sign), >>> is logical (fills with 0) — critical distinction'
      ],
      interviewTips: [
        'Know the range: 32-bit signed is [-2^31, 2^31-1], one more negative value',
        '"Reverse bits of an integer": use >>> for unsigned right shift in JavaScript',
        'INT_MIN edge case comes up in: reverse integer, string-to-integer, divide two integers',
        'If asked "why is -(-2^31) still negative?": two\'s complement asymmetry — there is no +2^31 in 32 bits'
      ],
      relatedConcepts: ['bitwise-basics', 'bit-hacks-arithmetic', 'integer-overflow'],
      difficulty: 'intermediate',
      tags: ['signed-integer', 'representation', 'overflow'],
      proTip: 'The asymmetry of two\'s complement (one more negative than positive) is the source of many subtle bugs. The "reverse integer" problem, "divide two integers" problem, and "string to integer" problem all have INT_MIN edge cases that trip up candidates. When solving integer problems in interviews, always ask yourself: "What happens with INT_MIN?" and "What happens with negative numbers?" before coding.'
    },
    {
      id: 'bitset-applications',
      title: 'Bitset Applications',
      description: 'A bitset is a dense boolean array packed into integers, where each bit represents a boolean flag. Bitset operations (AND, OR, XOR) on machine words process 32 or 64 booleans in a single CPU instruction, giving a ~32-64x speedup over boolean arrays. Bitsets are used in: graph adjacency matrices (bitwise AND for common neighbors), database bitmap indices, Bloom filters, and competitive programming for O(n^2/64) algorithms.',
      timeComplexity: { best: 'O(n/w)', average: 'O(n/w)', worst: 'O(n/w)' },
      spaceComplexity: 'O(n/w)',
      keyPoints: [
        'w = word size (32 or 64 bits): bitset operations process w elements per instruction',
        'Intersection: AND, Union: OR, Symmetric difference: XOR, Complement: NOT',
        'Cardinality: sum of popcount over all words',
        'Dense boolean storage: 8x memory savings over boolean array (1 bit vs 1 byte)',
        'Graph algorithms: represent adjacency as bitset, AND for common neighbors in O(n/w)',
        'Subset check: (a & b) === a means a is subset of b',
        'Bloom filter: probabilistic set membership using multiple hash functions into a bitset',
        'In competitive programming: bitset can reduce O(n^3) matrix multiplication to O(n^3/w)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Bitset Implementation',
          code: `class Bitset {
  private words: Uint32Array;
  private size: number;

  constructor(size: number) {
    this.size = size;
    this.words = new Uint32Array(Math.ceil(size / 32));
  }

  set(i: number): void {
    this.words[i >> 5] |= (1 << (i & 31));
  }

  clear(i: number): void {
    this.words[i >> 5] &= ~(1 << (i & 31));
  }

  get(i: number): boolean {
    return (this.words[i >> 5] & (1 << (i & 31))) !== 0;
  }

  // Bitwise AND (intersection) — O(n/32)
  and(other: Bitset): Bitset {
    const result = new Bitset(this.size);
    for (let i = 0; i < this.words.length; i++) {
      result.words[i] = this.words[i] & other.words[i];
    }
    return result;
  }

  // Bitwise OR (union) — O(n/32)
  or(other: Bitset): Bitset {
    const result = new Bitset(this.size);
    for (let i = 0; i < this.words.length; i++) {
      result.words[i] = this.words[i] | other.words[i];
    }
    return result;
  }

  // Count set bits — O(n/32)
  popcount(): number {
    let count = 0;
    for (let i = 0; i < this.words.length; i++) {
      let x = this.words[i];
      while (x) { x &= x - 1; count++; }
    }
    return count;
  }

  // Check if this is a subset of other
  isSubsetOf(other: Bitset): boolean {
    for (let i = 0; i < this.words.length; i++) {
      if ((this.words[i] & other.words[i]) !== this.words[i]) {
        return false;
      }
    }
    return true;
  }
}

// Common neighbors in graph using bitset adjacency
function commonNeighborsBitset(
  adj: Bitset[], u: number, v: number
): number {
  return adj[u].and(adj[v]).popcount();
}`
        }
      ],
      useCases: [
        'Graph algorithms: adjacency bitset for fast common neighbor queries',
        'Database bitmap indices: fast filtering on categorical columns',
        'Bloom filters: probabilistic set membership testing',
        'Competitive programming: O(n^2/w) optimizations',
        'Permission systems: role-based access as bit flags'
      ],
      commonPitfalls: [
        'Word boundary: i >> 5 for the word index, i & 31 for the bit position within the word',
        'Not handling the last partial word (when size is not a multiple of 32)',
        'Bitset size mismatch: AND/OR on bitsets of different sizes needs padding or bounds checking',
        'JavaScript TypedArrays are the right choice — regular arrays waste memory and are slower for bitwise ops'
      ],
      interviewTips: [
        'Bitsets rarely appear as interview problems directly but show up in system design',
        'Bloom filter is the most commonly asked bitset application in system design interviews',
        'If asked "optimize set operations": bitset gives 32-64x speedup over hash sets for dense sets',
        'Permission flags are a simple bitset application that comes up in backend interviews'
      ],
      relatedConcepts: ['bitmask-dp', 'bloom-filter', 'adjacency-matrix'],
      difficulty: 'intermediate',
      tags: ['bitset', 'dense-boolean', 'optimization'],
      proTip: 'In competitive programming, the C++ bitset<N> class is a secret weapon. It implements all bitwise operations on N-bit arrays using machine words, giving O(N/64) per operation. This can turn O(n^3) algorithms into O(n^3/64) — fast enough to pass time limits that would TLE otherwise. Classic example: transitive closure of a graph in O(n^3/64) using bitset adjacency rows.'
    }
  ]
}
