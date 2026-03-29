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

export const stringCategory: Category = {
  id: 'string-algorithms',
  title: 'String Algorithms',
  description: 'Strings are the most ubiquitous data type. From pattern matching (KMP, Rabin-Karp) to suffix structures (suffix array, suffix tree) to palindrome detection (Manacher), string algorithms power search engines, bioinformatics, compilers, and text editors.',
  icon: '📝',
  concepts: [
    {
      id: 'kmp',
      title: 'KMP (Knuth-Morris-Pratt)',
      description: 'KMP achieves O(n+m) pattern matching by precomputing a failure function (also called partial match table or prefix function) that tells how far to shift the pattern when a mismatch occurs. The key insight: when a mismatch happens at pattern position j, the failure function tells the longest proper prefix of pattern[0..j-1] that is also a suffix, so you can skip ahead instead of restarting from scratch. This avoids the backtracking that makes naive search O(nm).',
      timeComplexity: { best: 'O(n + m)', average: 'O(n + m)', worst: 'O(n + m)' },
      spaceComplexity: 'O(m)',
      keyPoints: [
        'Failure function lps[i]: length of longest proper prefix of pattern[0..i] that is also a suffix',
        'On mismatch at position j: shift pattern so that lps[j-1] characters are already matched',
        'Never backtrack in the text — the text pointer only moves forward',
        'Failure function construction is itself a self-matching application of KMP',
        'The failure function is equivalent to the Z-function (they can be derived from each other)',
        'KMP automaton: convert to DFA for even faster matching (used in compilers)',
        'Works for single pattern matching; for multiple patterns, use Aho-Corasick',
        'Total character comparisons: at most 2n (each text position is compared at most twice)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'KMP: Failure Function and Search',
          code: `function buildFailureFunction(pattern: string): number[] {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  let len = 0; // Length of previous longest prefix suffix
  let i = 1;

  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else if (len > 0) {
      len = lps[len - 1]; // Fall back, do NOT increment i
    } else {
      lps[i] = 0;
      i++;
    }
  }

  return lps;
}

function kmpSearch(text: string, pattern: string): number[] {
  const n = text.length, m = pattern.length;
  if (m === 0) return [];
  if (m > n) return [];

  const lps = buildFailureFunction(pattern);
  const matches: number[] = [];
  let i = 0; // Text pointer
  let j = 0; // Pattern pointer

  while (i < n) {
    if (text[i] === pattern[j]) {
      i++;
      j++;
      if (j === m) {
        matches.push(i - j);
        j = lps[j - 1]; // Continue searching for more matches
      }
    } else if (j > 0) {
      j = lps[j - 1]; // Shift pattern using failure function
    } else {
      i++;
    }
  }

  return matches;
}`
        }
      ],
      useCases: [
        'Text editors: find/replace functionality',
        'Compiler lexical analysis: token matching',
        'Bioinformatics: DNA/protein pattern matching',
        'Network intrusion detection: pattern matching on packet data'
      ],
      commonPitfalls: [
        'Failure function: incrementing i when len > 0 and mismatch — should NOT increment i, only reduce len',
        'Off-by-one: lps is 0-indexed, lps[0] is always 0',
        'Confusing the failure function with the number of matches — lps[i] is a prefix-suffix length',
        'Not continuing search after finding a match (j = lps[j-1]) if all occurrences are needed'
      ],
      interviewTips: [
        'KMP is the standard efficient pattern matching algorithm — know it cold',
        'The failure function is harder than the search — practice building it separately',
        'If asked "find all occurrences of pattern in text in O(n+m)": KMP',
        'Know the intuition: "on mismatch, we have already matched some prefix that is also a suffix — reuse it"'
      ],
      relatedConcepts: ['z-algorithm', 'rabin-karp', 'aho-corasick', 'string-matching'],
      difficulty: 'intermediate',
      tags: ['pattern-matching', 'prefix-function', 'linear'],
      proTip: 'The KMP failure function has applications beyond string matching. It can compute the shortest period of a string: the shortest period of s[0..i] has length i+1-lps[i]. It also determines if a string is a rotation of another: s is a rotation of t iff s appears in t+t, which KMP checks in O(n).'
    },
    {
      id: 'rabin-karp',
      title: 'Rabin-Karp',
      description: 'Rabin-Karp uses a rolling hash to check pattern matches in O(1) amortized time per position. Compute the hash of the pattern and the first window of text, then slide the window by updating the hash incrementally. On hash match, verify with character-by-character comparison to handle collisions. The power of Rabin-Karp is multi-pattern search: compute hashes for all patterns, then check each text window against the set.',
      timeComplexity: { best: 'O(n + m)', average: 'O(n + m)', worst: 'O(n * m)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Rolling hash: remove leftmost character, add rightmost, all in O(1)',
        'Polynomial hash: hash(s) = sum(s[i] * base^(m-1-i)) mod prime',
        'Collision handling: on hash match, verify characters to avoid false positives',
        'Multi-pattern: hash all patterns, store in a set, check each window hash against the set',
        'Double hashing: use two different hash functions to reduce collision probability',
        'Birthday paradox: collision probability is ~n^2 / prime, so choose a large prime',
        'Rolling hash update: new_hash = (old_hash - s[i] * base^(m-1)) * base + s[i+m]',
        'Worst case O(nm) when all windows match the hash (many collisions) — use a large prime'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Rabin-Karp with Rolling Hash',
          code: `function rabinKarp(text: string, pattern: string): number[] {
  const n = text.length, m = pattern.length;
  if (m > n) return [];

  const BASE = 31;
  const MOD = 1_000_000_007;
  const matches: number[] = [];

  // Compute base^(m-1) mod MOD
  let basePow = 1;
  for (let i = 0; i < m - 1; i++) {
    basePow = (basePow * BASE) % MOD;
  }

  // Compute pattern hash
  let patternHash = 0;
  for (let i = 0; i < m; i++) {
    patternHash = (patternHash * BASE + pattern.charCodeAt(i)) % MOD;
  }

  // Compute initial window hash
  let windowHash = 0;
  for (let i = 0; i < m; i++) {
    windowHash = (windowHash * BASE + text.charCodeAt(i)) % MOD;
  }

  // Slide window
  for (let i = 0; i <= n - m; i++) {
    if (windowHash === patternHash) {
      // Verify to handle collisions
      if (text.substring(i, i + m) === pattern) {
        matches.push(i);
      }
    }

    // Update hash for next window
    if (i < n - m) {
      windowHash = (
        (windowHash - text.charCodeAt(i) * basePow % MOD + MOD) * BASE +
        text.charCodeAt(i + m)
      ) % MOD;
    }
  }

  return matches;
}

// Multi-pattern Rabin-Karp
function multiPatternSearch(
  text: string, patterns: string[]
): Map<string, number[]> {
  const result = new Map<string, number[]>();
  const byLength = new Map<number, string[]>();

  for (const p of patterns) {
    result.set(p, []);
    const arr = byLength.get(p.length) ?? [];
    arr.push(p);
    byLength.set(p.length, arr);
  }

  const BASE = 31, MOD = 1_000_000_007;

  for (const [len, pats] of byLength) {
    const patHashes = new Map<number, string[]>();
    for (const p of pats) {
      let h = 0;
      for (let i = 0; i < len; i++) {
        h = (h * BASE + p.charCodeAt(i)) % MOD;
      }
      const arr = patHashes.get(h) ?? [];
      arr.push(p);
      patHashes.set(h, arr);
    }

    let basePow = 1;
    for (let i = 0; i < len - 1; i++) basePow = (basePow * BASE) % MOD;

    let wh = 0;
    for (let i = 0; i < len && i < text.length; i++) {
      wh = (wh * BASE + text.charCodeAt(i)) % MOD;
    }

    for (let i = 0; i <= text.length - len; i++) {
      const candidates = patHashes.get(wh);
      if (candidates) {
        const window = text.substring(i, i + len);
        for (const p of candidates) {
          if (window === p) result.get(p)!.push(i);
        }
      }
      if (i < text.length - len) {
        wh = ((wh - text.charCodeAt(i) * basePow % MOD + MOD) * BASE +
          text.charCodeAt(i + len)) % MOD;
      }
    }
  }

  return result;
}`
        }
      ],
      useCases: [
        'Plagiarism detection: find common substrings across documents',
        'Multi-pattern search: search for many patterns simultaneously',
        'Longest repeated substring (binary search + rolling hash)',
        'Fingerprinting: document similarity using hash-based shingling'
      ],
      commonPitfalls: [
        'Negative modular arithmetic: (hash - val) can go negative — add MOD before taking modulo',
        'Integer overflow: base^(m-1) can overflow — always mod at each step',
        'Not verifying hash matches: false positives cause incorrect results',
        'Using a small prime: increases collision probability — use 10^9 + 7 or larger'
      ],
      interviewTips: [
        'Rabin-Karp is asked when multiple pattern search or rolling hash is needed',
        'The rolling hash concept is more important than the full algorithm — it appears in many problems',
        'Know the collision handling: hash match => character-by-character verify',
        'If asked about the worst case: mention double hashing to reduce collision probability'
      ],
      relatedConcepts: ['kmp', 'string-hashing', 'rolling-hash', 'aho-corasick'],
      difficulty: 'intermediate',
      tags: ['hashing', 'rolling-hash', 'pattern-matching'],
      proTip: 'Rolling hash is far more useful than just Rabin-Karp. It enables O(1) substring comparison (compare hashes instead of characters), which powers: longest repeated substring in O(n log n), longest common substring of two strings in O(n log n), and string period finding. Master rolling hash as a primitive, not just as part of Rabin-Karp.'
    },
    {
      id: 'z-algorithm',
      title: 'Z-Algorithm',
      description: 'The Z-algorithm computes the Z-array where Z[i] is the length of the longest substring starting at position i that matches a prefix of the string. It runs in O(n) using a "Z-box" window optimization. For pattern matching, concatenate pattern + "$" + text and compute the Z-array; positions where Z[i] = pattern_length are matches. The Z-algorithm is often simpler to implement correctly than KMP.',
      timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Z[i] = length of longest substring starting at i that matches a prefix of the string',
        'Z[0] is undefined (or defined as 0 or n by convention)',
        'Z-box [l, r]: the rightmost interval where s[l..r] matches a prefix of s',
        'Pattern matching: compute Z-array of pattern + "$" + text, find Z[i] == m',
        'The "$" separator prevents matching across the boundary',
        'Z-algorithm and KMP failure function are equivalent: one can be derived from the other',
        'Z-array is more intuitive than the failure function for many people',
        'Applications: period finding, string matching, counting occurrences'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Z-Algorithm and Pattern Matching',
          code: `function zFunction(s: string): number[] {
  const n = s.length;
  const z = new Array(n).fill(0);
  let l = 0, r = 0;

  for (let i = 1; i < n; i++) {
    if (i < r) {
      z[i] = Math.min(r - i, z[i - l]);
    }
    // Extend as far as possible
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      z[i]++;
    }
    // Update Z-box
    if (i + z[i] > r) {
      l = i;
      r = i + z[i];
    }
  }

  return z;
}

function zSearch(text: string, pattern: string): number[] {
  const combined = pattern + '$' + text;
  const z = zFunction(combined);
  const m = pattern.length;
  const matches: number[] = [];

  for (let i = m + 1; i < combined.length; i++) {
    if (z[i] === m) {
      matches.push(i - m - 1); // Position in original text
    }
  }

  return matches;
}`
        }
      ],
      useCases: [
        'Pattern matching (alternative to KMP)',
        'Finding all periods of a string',
        'String compression: find shortest repeating unit',
        'Computing the failure function from Z-array and vice versa'
      ],
      commonPitfalls: [
        'Starting the loop from i=1, not i=0 — Z[0] is special',
        'Not updating the Z-box (l, r) when extending past r',
        'Forgetting the separator character in pattern matching — allows false matches',
        'Using a separator character that appears in the pattern or text'
      ],
      interviewTips: [
        'Z-algorithm is equivalent to KMP in power — use whichever you are more comfortable with',
        'Many programmers find the Z-array more intuitive than the failure function',
        'Pattern matching via Z-array: pattern + "$" + text, find Z[i] == m',
        'If asked about string periods: the shortest period has length i where Z[i] + i == n'
      ],
      relatedConcepts: ['kmp', 'string-matching', 'prefix-function'],
      difficulty: 'intermediate',
      tags: ['prefix-matching', 'z-box', 'linear'],
      proTip: 'Competitive programmers often prefer the Z-algorithm over KMP because the Z-array has a more direct interpretation: Z[i] tells you how much of the string starting at i matches the beginning. The KMP failure function requires thinking about "longest prefix that is also a suffix," which is less intuitive. Both compute equivalent information in O(n).'
    },
    {
      id: 'manacher',
      title: 'Manacher\'s Algorithm',
      description: 'Manacher\'s algorithm finds all maximal palindromic substrings in O(n) time — a dramatic improvement over the O(n^2) expand-around-center approach. It maintains a "palindrome radius" array and exploits the mirror property: if position i is within a known palindrome centered at c, the palindrome at i mirrors the palindrome at 2c-i. The unified even/odd trick (inserting sentinel characters) simplifies the implementation.',
      timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Computes palindrome radius at every center in O(n)',
        'Mirror property: P[i] >= min(P[mirror], R - i) where mirror = 2*C - i',
        'Center C and right boundary R: track the palindrome extending farthest right',
        'Even/odd unification: transform "abc" to "#a#b#c#" so all palindromes have odd length',
        'P[i] in the transformed string gives the radius; actual palindrome length = P[i]',
        'Longest palindromic substring: find max P[i], the center is at (i - P[i]) / 2 in original',
        'Can also count total number of palindromic substrings in O(n)',
        'Center expansion is O(n^2) in worst case (e.g., "aaa...a"); Manacher handles this in O(n)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Manacher\'s Algorithm',
          code: `function manacher(s: string): {
  longestPalindrome: string
  radii: number[]
} {
  // Transform: "abc" -> "^#a#b#c#$"
  const t = '^#' + s.split('').join('#') + '#$';
  const n = t.length;
  const p = new Array(n).fill(0);

  let center = 0, right = 0;

  for (let i = 1; i < n - 1; i++) {
    const mirror = 2 * center - i;

    if (i < right) {
      p[i] = Math.min(right - i, p[mirror]);
    }

    // Expand around center i
    while (t[i + p[i] + 1] === t[i - p[i] - 1]) {
      p[i]++;
    }

    // Update center and right boundary
    if (i + p[i] > right) {
      center = i;
      right = i + p[i];
    }
  }

  // Find longest palindrome
  let maxLen = 0, maxCenter = 0;
  for (let i = 1; i < n - 1; i++) {
    if (p[i] > maxLen) {
      maxLen = p[i];
      maxCenter = i;
    }
  }

  // Convert back to original string position
  const start = Math.floor((maxCenter - maxLen) / 2);
  return {
    longestPalindrome: s.substring(start, start + maxLen),
    radii: p
  };
}

// Count palindromic substrings using Manacher
function countPalindromicSubstrings(s: string): number {
  const t = '^#' + s.split('').join('#') + '#$';
  const n = t.length;
  const p = new Array(n).fill(0);
  let c = 0, r = 0;

  for (let i = 1; i < n - 1; i++) {
    if (i < r) p[i] = Math.min(r - i, p[2 * c - i]);
    while (t[i + p[i] + 1] === t[i - p[i] - 1]) p[i]++;
    if (i + p[i] > r) { c = i; r = i + p[i]; }
  }

  let count = 0;
  for (let i = 1; i < n - 1; i++) {
    // Each p[i] at a '#' position contributes even-length palindromes
    // Each p[i] at a letter position contributes odd-length palindromes
    count += Math.ceil(p[i] / 2);
  }

  return count;
}`
        }
      ],
      useCases: [
        'Longest palindromic substring (the classic Leetcode problem)',
        'Counting palindromic substrings',
        'Palindrome partitioning (precomputing palindrome ranges)',
        'Bioinformatics: palindromic DNA sequences (restriction enzyme recognition sites)'
      ],
      commonPitfalls: [
        'Not adding sentinel characters (^ and $) at boundaries — causes out-of-bounds expansion',
        'Confusing radius in transformed string with length in original — P[i] IS the length in original',
        'Not updating center/right when extending past right boundary',
        'Transform indexing: position i in transformed maps to (i-2)/2 in original (0-indexed after ^#)'
      ],
      interviewTips: [
        'Manacher is rarely required in interviews, but "longest palindromic substring" is very common',
        'The O(n^2) expand-around-center approach is usually sufficient for interviews',
        'Mention Manacher to show you know the optimal solution exists, even if you implement O(n^2)',
        'The mirror property is the key insight — explain it with a diagram'
      ],
      relatedConcepts: ['palindrome-partitioning', 'expand-around-center', 'longest-palindromic-substring'],
      difficulty: 'advanced',
      tags: ['palindrome', 'linear', 'mirror-property'],
      proTip: 'The transformed string trick (inserting # between characters) is brilliant because it unifies even and odd palindromes into a single case. Without it, you need separate logic for "aba" (odd, centered at b) and "abba" (even, centered between b and b). With the transform, both become odd-length palindromes centered at a character in the transformed string.'
    },
    {
      id: 'aho-corasick',
      title: 'Aho-Corasick',
      description: 'Aho-Corasick is the multi-pattern string matching algorithm. It builds a trie of all patterns, augments it with failure links (the KMP failure function generalized to tries), and processes the text in a single pass. It finds all occurrences of all patterns in O(n + m + z) time where n is text length, m is total pattern length, and z is the number of matches. It is the foundation of antivirus scanners, intrusion detection systems, and the Unix fgrep command.',
      timeComplexity: { best: 'O(n + m + z)', average: 'O(n + m + z)', worst: 'O(n + m + z)' },
      spaceComplexity: 'O(m * alphabet_size)',
      keyPoints: [
        'Build trie from all patterns, add failure links (BFS from root)',
        'Failure link: longest proper suffix of the path label that is also a prefix in the trie',
        'Output link (dictionary suffix link): follows failure links to find all patterns ending at current position',
        'Process text character by character, following trie edges and failure links',
        'Generalization of KMP: KMP is Aho-Corasick with a single pattern (trie is a chain)',
        'Goto function: trie edges for matching characters',
        'Failure function: where to go on mismatch (like KMP failure function)',
        'Total construction time: O(m * alphabet) or O(m) with careful implementation'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Aho-Corasick Multi-Pattern Matching',
          code: `class AhoCorasick {
  private goto: Map<string, number>[] = [new Map()];
  private fail: number[] = [0];
  private output: string[][] = [[]];

  addPattern(pattern: string): void {
    let state = 0;
    for (const ch of pattern) {
      if (!this.goto[state].has(ch)) {
        const next = this.goto.length;
        this.goto.push(new Map());
        this.fail.push(0);
        this.output.push([]);
        this.goto[state].set(ch, next);
      }
      state = this.goto[state].get(ch)!;
    }
    this.output[state].push(pattern);
  }

  build(): void {
    const queue: number[] = [];

    // Initialize: children of root have fail = 0
    for (const [, next] of this.goto[0]) {
      this.fail[next] = 0;
      queue.push(next);
    }

    // BFS to build failure links
    while (queue.length > 0) {
      const u = queue.shift()!;

      for (const [ch, v] of this.goto[u]) {
        queue.push(v);

        let f = this.fail[u];
        while (f !== 0 && !this.goto[f].has(ch)) {
          f = this.fail[f];
        }
        this.fail[v] = this.goto[f].get(ch) ?? 0;
        if (this.fail[v] === v) this.fail[v] = 0;

        // Merge output
        this.output[v] = [
          ...this.output[v],
          ...this.output[this.fail[v]]
        ];
      }
    }
  }

  search(text: string): Array<{ position: number; pattern: string }> {
    const results: Array<{ position: number; pattern: string }> = [];
    let state = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      while (state !== 0 && !this.goto[state].has(ch)) {
        state = this.fail[state];
      }
      state = this.goto[state].get(ch) ?? 0;

      for (const pattern of this.output[state]) {
        results.push({
          position: i - pattern.length + 1,
          pattern
        });
      }
    }

    return results;
  }
}

// Usage
function multiPatternMatch(
  text: string, patterns: string[]
): Array<{ position: number; pattern: string }> {
  const ac = new AhoCorasick();
  for (const p of patterns) ac.addPattern(p);
  ac.build();
  return ac.search(text);
}`
        }
      ],
      useCases: [
        'Antivirus scanning: match file content against thousands of malware signatures',
        'Network intrusion detection (Snort, Suricata)',
        'DNA sequence analysis: match against a database of known gene patterns',
        'Content filtering: block multiple banned words/phrases in a single pass',
        'fgrep: search for multiple fixed strings simultaneously'
      ],
      commonPitfalls: [
        'Self-loops: failure link of a state could point to itself — must check and handle',
        'Missing output link merge: must union the output of the failure state with the current state',
        'Not using BFS for failure link construction — DFS gives wrong results',
        'Large alphabet: Map-based goto is more memory-efficient than array-based for large alphabets'
      ],
      interviewTips: [
        'Aho-Corasick is rarely asked as a coding problem, but knowing it shows depth',
        'If asked "search for multiple patterns in a text efficiently": Aho-Corasick is the answer',
        'Key insight: failure links are KMP generalized to tries — mention this connection',
        'The construction is O(m) and search is O(n + z) — truly optimal for multi-pattern matching'
      ],
      relatedConcepts: ['kmp', 'trie', 'multi-pattern-matching', 'finite-automaton'],
      difficulty: 'advanced',
      tags: ['multi-pattern', 'trie', 'failure-links', 'automaton'],
      proTip: 'Aho-Corasick is the algorithm inside every production antivirus engine. ClamAV, Snort, and Suricata all use variants of it. The key engineering challenge is not the algorithm itself but the memory layout: modern implementations use double-array trie representation to achieve cache-friendly operation on patterns sets with millions of entries.'
    },
    {
      id: 'suffix-array',
      title: 'Suffix Array',
      description: 'A suffix array is a sorted array of all suffixes of a string, represented by their starting indices. It provides the same information as a suffix tree but uses less memory (O(n) integers vs O(n) nodes with pointers). Construction ranges from O(n log^2 n) with radix sort to O(n) with SA-IS. Combined with the LCP array, suffix arrays solve most string problems that suffix trees can.',
      timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log^2 n)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'SA[i] = starting index of the i-th smallest suffix in lexicographic order',
        'O(n log^2 n) construction: sort by first 1 char, then 2, 4, 8... using rank pairs',
        'O(n log n) with radix sort for the rank-pair comparison',
        'O(n) construction: SA-IS (Suffix Array by Induced Sorting) — the fastest known',
        'Binary search on suffix array: find any pattern in O(m log n) where m is pattern length',
        'With LCP array: O(m + log n) pattern matching',
        'Suffix array is essentially a compressed suffix tree — same power, less memory',
        'Applications: longest repeated substring, number of distinct substrings, string compression'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Suffix Array Construction O(n log^2 n)',
          code: `function buildSuffixArray(s: string): number[] {
  const n = s.length;
  let sa = Array.from({ length: n }, (_, i) => i);
  let rank = new Array(n);
  let tmp = new Array(n);

  // Initial rank: character codes
  for (let i = 0; i < n; i++) rank[i] = s.charCodeAt(i);

  for (let k = 1; k < n; k *= 2) {
    // Sort by (rank[i], rank[i+k]) pair
    const getKey = (i: number): [number, number] => [
      rank[i],
      i + k < n ? rank[i + k] : -1
    ];

    sa.sort((a, b) => {
      const ka = getKey(a), kb = getKey(b);
      return ka[0] !== kb[0] ? ka[0] - kb[0] : ka[1] - kb[1];
    });

    // Recompute ranks
    tmp[sa[0]] = 0;
    for (let i = 1; i < n; i++) {
      const prev = getKey(sa[i - 1]);
      const curr = getKey(sa[i]);
      tmp[sa[i]] = tmp[sa[i - 1]] +
        (prev[0] !== curr[0] || prev[1] !== curr[1] ? 1 : 0);
    }
    [rank, tmp] = [tmp, rank];

    // Early termination: all ranks are unique
    if (rank[sa[n - 1]] === n - 1) break;
  }

  return sa;
}

// Binary search on suffix array for pattern matching
function searchSuffixArray(
  s: string, sa: number[], pattern: string
): number[] {
  const n = s.length, m = pattern.length;

  // Find lower bound
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const suffix = s.substring(sa[mid], Math.min(sa[mid] + m, n));
    if (suffix < pattern) lo = mid + 1;
    else hi = mid;
  }
  const left = lo;

  // Find upper bound
  hi = n;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const suffix = s.substring(sa[mid], Math.min(sa[mid] + m, n));
    if (suffix <= pattern) lo = mid + 1;
    else hi = mid;
  }

  const matches: number[] = [];
  for (let i = left; i < lo; i++) {
    matches.push(sa[i]);
  }
  return matches.sort((a, b) => a - b);
}`
        }
      ],
      useCases: [
        'Full-text search indexing',
        'Bioinformatics: genome sequence search and comparison',
        'Data compression (BWT is derived from suffix array)',
        'Longest repeated substring, longest common substring'
      ],
      commonPitfalls: [
        'Not handling the sentinel/termination character — needed for some algorithms',
        'Off-by-one in rank access: rank[i+k] must check bounds',
        'Using string comparison during construction instead of rank comparison — O(n^2 log n) instead of O(n log^2 n)',
        'Not early-terminating when all ranks are unique — wastes iterations'
      ],
      interviewTips: [
        'Suffix arrays are rarely asked in standard interviews but appear in competitive programming',
        'Know the O(n log^2 n) construction — it is implementable in an interview',
        'Pattern matching with suffix array: two binary searches for lower and upper bound',
        'The LCP array combined with suffix array is extremely powerful — mention it'
      ],
      relatedConcepts: ['suffix-array-lcp', 'suffix-tree', 'bwt', 'string-hashing'],
      difficulty: 'advanced',
      tags: ['suffix', 'sorting', 'indexing'],
      proTip: 'The Burrows-Wheeler Transform (BWT) used in bzip2 compression is essentially a rotated view of the suffix array. The BWT of s is the last column of the sorted rotation matrix, which is exactly s[SA[i] - 1] for each i. Understanding this connection between suffix arrays, BWT, and data compression reveals why suffix arrays are fundamental to both search and compression.'
    },
    {
      id: 'suffix-array-lcp',
      title: 'Suffix Array + LCP Array',
      description: 'The LCP (Longest Common Prefix) array stores the length of the longest common prefix between consecutive suffixes in the sorted suffix array. LCP[i] = lcp(SA[i-1], SA[i]). Kasai\'s algorithm constructs it in O(n) using the suffix array. Together, SA + LCP solve: longest repeated substring (max LCP), number of distinct substrings (n*(n+1)/2 - sum(LCP)), and longest common substring of two strings.',
      timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'LCP[i] = length of longest common prefix between suffix SA[i-1] and SA[i]',
        'Kasai\'s algorithm: process suffixes in text order, exploit LCP[rank[i]] >= LCP[rank[i-1]] - 1',
        'Longest repeated substring: max value in LCP array',
        'Number of distinct substrings: n*(n+1)/2 - sum(LCP)',
        'Longest common substring of two strings: concatenate with separator, find max LCP crossing the boundary',
        'Range minimum query on LCP: lcp of any two suffixes = min(LCP[rank[i]+1 .. rank[j]])',
        'SA + LCP + RMQ = O(1) lcp queries after O(n) preprocessing',
        'Equivalent to suffix tree in power — suffix tree can be built from SA + LCP in O(n)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Kasai\'s LCP Array Construction',
          code: `function buildLCP(s: string, sa: number[]): number[] {
  const n = s.length;
  const rank = new Array(n);
  for (let i = 0; i < n; i++) rank[sa[i]] = i;

  const lcp = new Array(n).fill(0);
  let h = 0;

  for (let i = 0; i < n; i++) {
    if (rank[i] > 0) {
      const j = sa[rank[i] - 1]; // Previous suffix in sorted order
      while (i + h < n && j + h < n && s[i + h] === s[j + h]) {
        h++;
      }
      lcp[rank[i]] = h;
      if (h > 0) h--; // Key insight: lcp can decrease by at most 1
    }
  }

  return lcp;
}

// Longest repeated substring
function longestRepeatedSubstring(s: string): string {
  const sa = buildSuffixArray(s);
  const lcp = buildLCP(s, sa);

  let maxLcp = 0, maxIdx = 0;
  for (let i = 1; i < s.length; i++) {
    if (lcp[i] > maxLcp) {
      maxLcp = lcp[i];
      maxIdx = sa[i];
    }
  }

  return s.substring(maxIdx, maxIdx + maxLcp);
}

// Number of distinct substrings
function countDistinctSubstrings(s: string): number {
  const n = s.length;
  const sa = buildSuffixArray(s);
  const lcp = buildLCP(s, sa);

  // Total substrings: n*(n+1)/2, minus LCP duplicates
  let total = (n * (n + 1)) / 2;
  for (let i = 1; i < n; i++) {
    total -= lcp[i];
  }

  return total;
}

// Need buildSuffixArray from the suffix-array concept
function buildSuffixArray(s: string): number[] {
  const n = s.length;
  let sa = Array.from({ length: n }, (_, i) => i);
  let rank = new Array(n);
  let tmp = new Array(n);
  for (let i = 0; i < n; i++) rank[i] = s.charCodeAt(i);

  for (let k = 1; k < n; k *= 2) {
    const getKey = (i: number): [number, number] => [
      rank[i], i + k < n ? rank[i + k] : -1
    ];
    sa.sort((a, b) => {
      const ka = getKey(a), kb = getKey(b);
      return ka[0] !== kb[0] ? ka[0] - kb[0] : ka[1] - kb[1];
    });
    tmp[sa[0]] = 0;
    for (let i = 1; i < n; i++) {
      const prev = getKey(sa[i - 1]), curr = getKey(sa[i]);
      tmp[sa[i]] = tmp[sa[i - 1]] +
        (prev[0] !== curr[0] || prev[1] !== curr[1] ? 1 : 0);
    }
    [rank, tmp] = [tmp, rank];
    if (rank[sa[n - 1]] === n - 1) break;
  }
  return sa;
}`
        }
      ],
      useCases: [
        'Longest repeated substring in a text',
        'Counting distinct substrings',
        'Longest common substring between two or more strings',
        'Full-text indexing with LCP-based search acceleration'
      ],
      commonPitfalls: [
        'Kasai: forgetting the h-- step — the LCP value decreases by at most 1 each iteration',
        'LCP[0] is undefined (no previous suffix) — handle this edge case',
        'Not using the inverse suffix array (rank) in Kasai\'s — it processes in text order, not SA order',
        'Longest common substring: must check that the two suffixes come from different original strings'
      ],
      interviewTips: [
        'SA + LCP is the "power combo" for string problems — know both',
        '"Longest repeated substring": max LCP value',
        '"Number of distinct substrings": n(n+1)/2 - sum(LCP)',
        'Kasai\'s algorithm is elegant — the h-- insight is the key to O(n) construction'
      ],
      relatedConcepts: ['suffix-array', 'suffix-tree', 'rmq', 'lcp'],
      difficulty: 'advanced',
      tags: ['suffix', 'lcp', 'string-analysis'],
      proTip: 'The formula "distinct substrings = n(n+1)/2 - sum(LCP)" is one of the most beautiful results in stringology. Each suffix of length k contributes k substrings, but LCP[i] of them were already counted by the previous suffix. Subtracting gives exactly the new substrings each suffix introduces. This elegance is why suffix arrays are the preferred data structure for competitive programming string problems.'
    },
    {
      id: 'suffix-tree',
      title: 'Suffix Tree',
      description: 'A suffix tree is a compressed trie of all suffixes of a string, built in O(n) using Ukkonen\'s algorithm. Every internal node represents a branching point, every leaf represents a suffix, and edges are labeled with substrings. Suffix trees solve many string problems in optimal time: pattern matching O(m), longest repeated substring O(n), longest common substring O(n+m). In practice, suffix arrays + LCP often replace suffix trees due to lower memory usage.',
      timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      spaceComplexity: 'O(n * alphabet_size)',
      keyPoints: [
        'Compressed trie: paths with single branches are collapsed into single edges',
        'n leaves (one per suffix), at most n-1 internal nodes',
        'Ukkonen construction: O(n) online algorithm, processes one character at a time',
        'Three Ukkonen rules: (1) extend existing leaf, (2) branch at internal node, (3) do nothing (already present)',
        'Active point (node, edge, length): tracks where the next extension starts',
        'Suffix links: shortcut from one internal node to another, enabling amortized O(1) per extension',
        'Pattern matching: follow the pattern down the tree, O(m) time',
        'In practice, suffix arrays + LCP use 3-5x less memory and are preferred'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Suffix Tree (Conceptual Structure)',
          code: `// Suffix tree is complex to implement fully; here is the conceptual structure
// and pattern matching on a simplified version

interface SuffixTreeNode {
  children: Map<string, SuffixTreeEdge>
  suffixLink: SuffixTreeNode | null
  start: number    // Start of suffix (for leaves)
  isLeaf: boolean
}

interface SuffixTreeEdge {
  label: string     // Edge label (substring)
  target: SuffixTreeNode
}

// Pattern matching on suffix tree: O(m)
function searchSuffixTree(
  root: SuffixTreeNode, pattern: string
): boolean {
  let node = root;
  let i = 0;

  while (i < pattern.length) {
    const ch = pattern[i];
    const edge = node.children.get(ch);
    if (!edge) return false;

    // Match characters along the edge
    let j = 0;
    while (j < edge.label.length && i < pattern.length) {
      if (edge.label[j] !== pattern[i]) return false;
      j++;
      i++;
    }

    if (j < edge.label.length) {
      // Pattern ended in the middle of an edge — it is a match
      return true;
    }

    node = edge.target;
  }

  return true; // All characters matched
}

// Count occurrences: count leaves in the subtree after matching
function countOccurrences(node: SuffixTreeNode): number {
  if (node.isLeaf) return 1;
  let count = 0;
  for (const [, edge] of node.children) {
    count += countOccurrences(edge.target);
  }
  return count;
}`
        }
      ],
      useCases: [
        'Bioinformatics: genome sequence analysis and comparison',
        'Text indexing: building search indices for large texts',
        'Longest common substring of multiple strings',
        'Approximate string matching and fuzzy search'
      ],
      commonPitfalls: [
        'Memory usage: suffix trees use 10-20x more memory than the original string',
        'Ukkonen implementation is notoriously tricky — off-by-one errors are common',
        'Not adding a unique terminal character ($) — required for correctness',
        'Using suffix tree when suffix array + LCP would be more practical'
      ],
      interviewTips: [
        'You will rarely be asked to implement Ukkonen in an interview',
        'Know what a suffix tree IS and what problems it solves — that is sufficient',
        'If asked to choose: suffix array + LCP is more practical and easier to implement',
        'Key fact: suffix tree solves pattern matching in O(m) with O(n) preprocessing'
      ],
      relatedConcepts: ['suffix-array', 'trie', 'ukkonen', 'suffix-array-lcp'],
      difficulty: 'expert',
      tags: ['suffix', 'tree', 'compressed-trie'],
      proTip: 'In modern competitive programming and production systems, suffix arrays with LCP have almost entirely replaced suffix trees. The reason is practical: suffix arrays use 4n-8n bytes (just integer arrays), while suffix trees use 20n-40n bytes (nodes, pointers, edge labels). With the LCP array and sparse table for RMQ, suffix arrays match suffix trees in theoretical power while being much more cache-friendly.'
    },
    {
      id: 'boyer-moore',
      title: 'Boyer-Moore',
      description: 'Boyer-Moore is the fastest string matching algorithm in practice for long patterns and large alphabets. It scans the pattern from RIGHT to LEFT, using two heuristics to skip large portions of the text: the bad character rule (on mismatch, shift so the mismatched character in the text aligns with its last occurrence in the pattern) and the good suffix rule (on mismatch, shift so the matched suffix aligns with another occurrence or prefix).',
      timeComplexity: { best: 'O(n/m)', average: 'O(n/m)', worst: 'O(n * m)' },
      spaceComplexity: 'O(m + alphabet_size)',
      keyPoints: [
        'Best case O(n/m): skips m characters at a time when mismatches occur early',
        'Bad character rule: shift pattern so mismatched text char aligns with its last occurrence in pattern',
        'Good suffix rule: shift so the matched suffix aligns with another occurrence of that suffix in the pattern',
        'Right-to-left scanning: compare pattern from the end, enabling larger skips',
        'Sublinear in practice: for long patterns and large alphabets, reads only ~n/m characters',
        'Galil rule: after a full match, skip the known matching prefix on the next comparison',
        'Worst case O(nm): repeating characters like searching "aaa" in "aaaaaa" — but rare in practice',
        'Used in: grep, text editors, most production string search implementations'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Boyer-Moore (Bad Character Heuristic)',
          code: `function boyerMoore(text: string, pattern: string): number[] {
  const n = text.length, m = pattern.length;
  if (m > n) return [];

  // Bad character table: last occurrence of each character in pattern
  const badChar = new Map<string, number>();
  for (let i = 0; i < m; i++) {
    badChar.set(pattern[i], i);
  }

  const matches: number[] = [];
  let shift = 0;

  while (shift <= n - m) {
    let j = m - 1;

    // Match from right to left
    while (j >= 0 && pattern[j] === text[shift + j]) {
      j--;
    }

    if (j < 0) {
      matches.push(shift);
      // Shift by pattern length or bad char of next text character
      shift += (shift + m < n)
        ? m - (badChar.get(text[shift + m]) ?? -1)
        : 1;
    } else {
      // Bad character shift
      const badCharShift = j - (badChar.get(text[shift + j]) ?? -1);
      shift += Math.max(1, badCharShift);
    }
  }

  return matches;
}`
        }
      ],
      useCases: [
        'Text editors: search/replace (Vim, Emacs, VS Code)',
        'grep and other command-line search tools',
        'Large-file search: when patterns are long and alphabet is large',
        'DNA sequence search: works well with 4-character alphabet for longer patterns'
      ],
      commonPitfalls: [
        'Only implementing bad character rule without good suffix — misses some optimizations',
        'Negative shift: bad character rule can give negative shift — always take max(1, shift)',
        'Not handling pattern longer than text',
        'Using Boyer-Moore for very short patterns — KMP or even naive search is simpler and similar speed'
      ],
      interviewTips: [
        'Boyer-Moore is rarely asked for full implementation in interviews',
        'Know the concept: right-to-left scanning enables skipping — O(n/m) best case',
        'If asked "how does grep work?": Boyer-Moore (or a variant like Horspool)',
        'The bad character rule alone (simplified Boyer-Moore-Horspool) is a common simplification'
      ],
      relatedConcepts: ['kmp', 'rabin-karp', 'horspool', 'string-matching'],
      difficulty: 'advanced',
      tags: ['pattern-matching', 'right-to-left', 'skip-heuristic'],
      proTip: 'The reason Boyer-Moore is faster in practice than KMP despite worse worst-case complexity is that real-world text has high entropy (varied characters). The bad character rule skips ~m characters per mismatch when the mismatched character does not appear in the pattern, which happens frequently. For English text with long patterns, Boyer-Moore reads roughly n/m characters total — genuinely sublinear.'
    },
    {
      id: 'trie',
      title: 'Trie (Prefix Tree)',
      description: 'A trie is a tree where each node represents a character and paths from root to marked nodes form words. Insert, search, and prefix queries all run in O(L) where L is the word length, independent of the dictionary size. Tries are the standard data structure for autocomplete, spell checking, and IP routing tables. Memory optimization via compressed tries (Patricia/radix trie) collapses single-child chains.',
      timeComplexity: { best: 'O(L)', average: 'O(L)', worst: 'O(L)' },
      spaceComplexity: 'O(total characters * alphabet_size)',
      keyPoints: [
        'Each node has up to alphabet_size children (26 for lowercase English)',
        'Insert/search/startsWith all O(L) where L is the key length',
        'isEnd flag marks nodes where a complete word ends',
        'Prefix queries: navigate to the prefix node, all descendants are matching words',
        'Memory: each node stores alphabet_size pointers — can be expensive for large alphabets',
        'Compressed trie (radix trie): merge single-child chains into single edges with substrings',
        'Patricia trie: radix trie using bit positions — used in IP routing (longest prefix match)',
        'Alternatives: hash map of prefixes is simpler but does not support prefix enumeration'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Trie with Insert, Search, Prefix, and Delete',
          code: `class TrieNode {
  children = new Map<string, TrieNode>();
  isEnd = false;
  count = 0; // Number of words passing through this node
}

class Trie {
  root = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch)!;
      node.count++;
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

  // Count words with given prefix
  countPrefix(prefix: string): number {
    const node = this.findNode(prefix);
    return node?.count ?? 0;
  }

  // Autocomplete: find all words with prefix
  autocomplete(prefix: string, limit: number = 10): string[] {
    const node = this.findNode(prefix);
    if (!node) return [];

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

  private dfs(
    node: TrieNode, current: string,
    results: string[], limit: number
  ): void {
    if (results.length >= limit) return;
    if (node.isEnd) results.push(current);

    for (const [ch, child] of node.children) {
      this.dfs(child, current + ch, results, limit);
    }
  }
}`
        }
      ],
      useCases: [
        'Autocomplete and typeahead search',
        'Spell checking: find words within edit distance',
        'IP routing: longest prefix match (Patricia trie)',
        'Word games: Boggle, Scrabble word validation',
        'Contact search: phone number prefix matching'
      ],
      commonPitfalls: [
        'Memory usage: 26 pointers per node adds up fast for large dictionaries',
        'Not distinguishing "word exists" from "prefix exists" — need the isEnd flag',
        'Using array[26] instead of Map: wastes memory when most children are null',
        'Delete operation is tricky: must not delete nodes that are prefixes of other words'
      ],
      interviewTips: [
        'Trie is a top-15 interview data structure — know insert, search, and startsWith',
        '"Design autocomplete" is a classic system design + coding problem',
        '"Word Search II" (Leetcode 212) combines trie with DFS backtracking',
        'If asked about memory optimization: mention compressed/radix trie or ternary search trie'
      ],
      relatedConcepts: ['aho-corasick', 'suffix-tree', 'radix-trie', 'word-search'],
      difficulty: 'intermediate',
      tags: ['prefix', 'tree', 'dictionary', 'autocomplete'],
      proTip: 'For production autocomplete systems, a trie alone is insufficient. You need: (1) a trie for prefix lookup, (2) frequency/popularity scores on each word node, and (3) a top-k retrieval mechanism (min-heap of size k during DFS). The system design interview "design search autocomplete" expects all three components.'
    },
    {
      id: 'string-hashing',
      title: 'String Hashing',
      description: 'Polynomial rolling hash maps strings to integers: hash(s) = sum(s[i] * base^i) mod prime. With prefix hash arrays, any substring hash can be computed in O(1). Double hashing (two independent hash functions) reduces collision probability to ~1/prime^2. String hashing enables O(1) substring comparison, O(n log n) longest repeated substring, and is the foundation of Rabin-Karp.',
      timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Polynomial hash: h(s) = s[0]*b^(n-1) + s[1]*b^(n-2) + ... + s[n-1] mod p',
        'Common parameters: base = 31 or 37 (prime close to alphabet size), mod = 10^9+7 or 10^9+9',
        'Prefix hashes: precompute prefix[i] = hash(s[0..i-1]) for O(1) substring hash',
        'Substring hash: hash(s[l..r]) = (prefix[r+1] - prefix[l] * base^(r-l+1)) mod p',
        'Double hashing: use two different (base, mod) pairs — collision probability ~1/p^2',
        'Birthday paradox: with n substrings and prime p, collision probability ~n^2/(2p)',
        'For n = 10^5 and single hash: expect collisions. Double hash effectively eliminates them',
        'Applications: substring comparison O(1), longest repeated substring O(n log n), palindrome checking O(1)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'String Hashing with O(1) Substring Hash',
          code: `class StringHash {
  private prefix: number[];
  private power: number[];
  private mod: number;
  private base: number;

  constructor(s: string, base = 31, mod = 1_000_000_007) {
    this.base = base;
    this.mod = mod;
    const n = s.length;
    this.prefix = new Array(n + 1).fill(0);
    this.power = new Array(n + 1).fill(1);

    for (let i = 0; i < n; i++) {
      this.prefix[i + 1] = (this.prefix[i] * base + s.charCodeAt(i)) % mod;
      this.power[i + 1] = (this.power[i] * base) % mod;
    }
  }

  // Hash of s[l..r] (inclusive, 0-indexed)
  getHash(l: number, r: number): number {
    const raw = (
      this.prefix[r + 1] -
      this.prefix[l] * this.power[r - l + 1] % this.mod +
      this.mod * 2 // Ensure non-negative
    ) % this.mod;
    return raw;
  }

  // Check if s[l1..r1] === s[l2..r2] in O(1)
  equal(l1: number, r1: number, l2: number, r2: number): boolean {
    if (r1 - l1 !== r2 - l2) return false;
    return this.getHash(l1, r1) === this.getHash(l2, r2);
  }
}

// Double hashing for reduced collision probability
class DoubleHash {
  private h1: StringHash;
  private h2: StringHash;

  constructor(s: string) {
    this.h1 = new StringHash(s, 31, 1_000_000_007);
    this.h2 = new StringHash(s, 37, 1_000_000_009);
  }

  getHash(l: number, r: number): string {
    return \`\${this.h1.getHash(l, r)},\${this.h2.getHash(l, r)}\`;
  }

  equal(l1: number, r1: number, l2: number, r2: number): boolean {
    return this.h1.equal(l1, r1, l2, r2) && this.h2.equal(l1, r1, l2, r2);
  }
}

// Longest repeated substring using binary search + hashing
function longestRepeatedSubstringHash(s: string): string {
  const n = s.length;
  const hash = new DoubleHash(s);

  function hasRepeat(len: number): number {
    const seen = new Map<string, number>();
    for (let i = 0; i <= n - len; i++) {
      const h = hash.getHash(i, i + len - 1);
      if (seen.has(h)) {
        // Verify to be safe
        if (s.substring(i, i + len) === s.substring(seen.get(h)!, seen.get(h)! + len)) {
          return i;
        }
      }
      seen.set(h, i);
    }
    return -1;
  }

  let lo = 0, hi = n - 1, bestStart = 0, bestLen = 0;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const pos = hasRepeat(mid);
    if (pos !== -1) {
      bestStart = pos;
      bestLen = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return s.substring(bestStart, bestStart + bestLen);
}`
        }
      ],
      useCases: [
        'O(1) substring comparison (after O(n) preprocessing)',
        'Rabin-Karp pattern matching',
        'Longest repeated/common substring via binary search + hashing',
        'Palindrome checking in O(1) per query',
        'Document fingerprinting and plagiarism detection'
      ],
      commonPitfalls: [
        'Negative modular arithmetic: hash difference can go negative — add mod before taking modulo',
        'Single hash collisions: for competitive programming, ALWAYS use double hashing',
        'Integer overflow: intermediate products can exceed 2^53 in JavaScript — use BigInt or careful modding',
        'Choosing base = 256 and mod = 2^32: too many collisions due to the power-of-2 modulus'
      ],
      interviewTips: [
        'String hashing is a tool, not usually asked directly — but it enables many O(1) tricks',
        'If asked "compare substrings in O(1)": prefix hash array',
        'Longest repeated substring: binary search on length + hashing = O(n log n)',
        'Always mention collision risk and double hashing — shows robustness awareness'
      ],
      relatedConcepts: ['rabin-karp', 'rolling-hash', 'suffix-array', 'polynomial-hash'],
      difficulty: 'intermediate',
      tags: ['hashing', 'substring', 'comparison'],
      proTip: 'In competitive programming, the anti-hash test (deliberately crafting inputs that cause collisions) is a known strategy. The defense is double hashing with two large primes. An even stronger defense is to randomize the base at runtime: choose base randomly from [2, mod-1] at the start of the program. This makes it impossible for the test setter to craft collision inputs because they cannot predict your base.'
    }
  ]
}
