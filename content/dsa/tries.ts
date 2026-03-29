// @ts-nocheck
import type { Category } from '@/lib/types'

export const triesCategory: Category = {
  id: 'tries',
  title: 'Tries & String Structures',
  description: 'Specialized tree structures for string operations — from standard tries for prefix search to suffix arrays for genomics and Aho-Corasick for multi-pattern matching. These structures turn O(n*m) string problems into O(n+m).',
  icon: '🔤',
  concepts: [
    {
      id: 'standard-trie',
      title: 'Standard Trie',
      description:
        'A tree where each edge represents a character and each root-to-node path represents a prefix. Common prefixes share the same path, making prefix-based operations O(L) where L is the query string length — independent of the number of stored strings. The tradeoff is memory: each node may have up to ALPHABET_SIZE children, most of which are null for sparse alphabets.',
      timeComplexity: {
        best: 'O(L) per operation',
        average: 'O(L)',
        worst: 'O(L)',
      },
      spaceComplexity: 'O(ALPHABET * L * N) worst case',
      keyPoints: [
        'Each node has up to ALPHABET_SIZE children (26 for lowercase, 128 for ASCII, 256 for bytes)',
        'Insert/Search/Delete: traverse one node per character in the string — O(L)',
        'Prefix search: find the node at end of prefix, then DFS to enumerate all words below',
        'isEndOfWord flag marks which nodes correspond to complete stored strings',
        'Array children: O(1) per character lookup but wastes space for sparse alphabets',
        'Map children: O(1) amortized but higher constant factor — better for Unicode or large alphabets',
        'Count words with prefix: store count at each node (increment on insert, traverse to prefix node)',
        'Wildcard search (e.g., "c.t"): DFS with branching on wildcard positions — still efficient',
      ],
      useCases: [
        'Autocomplete and typeahead search',
        'Spell checking and correction',
        'IP routing tables (longest prefix matching)',
        'Phone directory / contact search',
      ],
      commonPitfalls: [
        'Not marking end-of-word: "app" stored but "ap" falsely found because prefix exists',
        'Memory blow-up with array children: 26 pointers per node * millions of nodes = gigabytes',
        'Delete operation: must not delete nodes that are prefixes of other words — check isEnd and children count',
        'Assuming O(1) per operation: it is O(L) where L is key length — not O(1)',
      ],
      interviewTips: [
        'Trie is the expected data structure for "implement autocomplete" questions',
        'Know both array and Map implementations — discuss tradeoffs when asked',
        'Design search autocomplete system (LeetCode 642) combines trie with ranking',
      ],
      relatedConcepts: ['compressed-trie', 'suffix-trie', 'aho-corasick', 'trie-applications'],
      difficulty: 'intermediate',
      tags: ['trie', 'prefix-tree', 'string', 'search'],
      proTip:
        'For interview autocomplete design: store frequency at each end-of-word node, DFS to collect all words under the prefix, return top-k by frequency using a min-heap. For production: precompute top-k per prefix node (trade space for latency). Google\'s autocomplete caches precomputed suggestions per prefix for sub-millisecond response.',
    },
    {
      id: 'compressed-trie',
      title: 'Compressed Trie (Patricia / Radix Tree)',
      description:
        'A space-optimized trie that merges single-child chains into single edges labeled with multi-character strings. If a standard trie has a path a→b→c with no branching, the compressed trie stores a single edge "abc". This reduces the number of nodes from O(ALPHABET * L * N) to O(N) where N is the number of stored strings. Used in the Linux kernel for IP routing and in databases for string indices.',
      timeComplexity: {
        best: 'O(L) per operation',
        average: 'O(L)',
        worst: 'O(L)',
      },
      spaceComplexity: 'O(N * L) — proportional to total string length, not alphabet size * nodes',
      keyPoints: [
        'Edge labels are substrings, not single characters — compact representation',
        'Number of nodes is O(N) for N stored strings (at most 2N-1 nodes)',
        'Insert may split an existing edge: if new key diverges mid-edge, split the edge and create a branch',
        'Patricia tree: a specific compressed trie where edges store bit positions for branching (used in networking)',
        'Radix tree: general term for compressed trie; Linux kernel uses it for page cache and IP routing',
        'More cache-friendly than standard trie: fewer nodes means fewer pointer dereferences',
        'Adaptive radix tree (ART): hybridizes node sizes (4, 16, 48, 256 children) based on density',
        'HAT-trie: combines radix tree internal nodes with hash table leaf nodes for cache efficiency',
      ],
      useCases: [
        'Linux kernel: radix tree for page cache (page frame → struct page lookup)',
        'IP routing: longest prefix match on binary representation of IP addresses',
        'Database string indices (ART used in HyPer/Umbra databases)',
        'Version control: storing file paths efficiently in repository indices',
      ],
      commonPitfalls: [
        'Edge splitting on insert: must handle correctly when new key diverges mid-edge label',
        'String comparison on edges: edge labels are substrings, not single characters — use substring comparison',
        'Delete may require edge merging: if a node becomes single-child after deletion, merge with parent',
        'More complex implementation than standard trie for marginal space savings on small datasets',
      ],
      interviewTips: [
        'Mention compressed trie when asked "how to reduce trie memory usage"',
        'Know that radix tree is used in Linux kernel — shows systems knowledge',
        'The space savings: O(N) nodes instead of O(sum of string lengths) — significant for long strings with shared prefixes',
      ],
      relatedConcepts: ['standard-trie', 'suffix-trie', 'trie-applications'],
      difficulty: 'advanced',
      tags: ['compressed-trie', 'patricia', 'radix-tree', 'space-optimization'],
      proTip:
        'The Adaptive Radix Tree (ART) is the state of the art for in-memory string indexing. It dynamically chooses node type based on child count: Node4 (array of 4), Node16 (SIMD-searchable array of 16), Node48 (256-entry index array mapping to 48 slots), Node256 (direct array). This achieves the compactness of compressed tries with the lookup speed of array-indexed tries.',
    },
    {
      id: 'suffix-trie',
      title: 'Suffix Trie',
      description:
        'A trie of all suffixes of a string, enabling O(m) pattern matching where m is the pattern length. For a string of length n, it contains n suffixes and thus O(n^2) nodes in the worst case — prohibitively expensive for long strings. The suffix TREE (Ukkonen\'s algorithm) compresses this to O(n) space and O(n) construction, but suffix ARRAYS with LCP are preferred in practice due to simpler implementation and better cache behavior.',
      timeComplexity: {
        best: 'O(m) — pattern search where m = pattern length',
        average: 'O(m)',
        worst: 'O(n^2) construction for suffix trie, O(n) for suffix tree',
      },
      spaceComplexity: 'O(n^2) for suffix trie, O(n) for suffix tree',
      keyPoints: [
        'Contains all suffixes of string s: s[0..n-1], s[1..n-1], ..., s[n-1..n-1]',
        'Pattern search: follow pattern characters from root — if you reach the end, pattern exists as substring',
        'Count occurrences: count leaves reachable from the node where pattern ends',
        'Longest repeated substring: deepest internal node (longest path with branching)',
        'Longest common substring of two strings: build generalized suffix trie/tree, find deepest node with leaves from both strings',
        'Suffix trie is O(n^2) space — impractical for n > 10^4',
        'Suffix tree (Ukkonen\'s): compressed suffix trie, O(n) space, O(n) construction — but complex to implement',
        'In practice, suffix arrays + LCP array replace suffix trees: same power, simpler code, better cache',
      ],
      useCases: [
        'Bioinformatics: DNA pattern matching and motif finding',
        'Text indexing: search engine substring matching',
        'Data compression: LZ77/LZ78 use suffix structures for finding repeated patterns',
        'Plagiarism detection: finding common substrings between documents',
      ],
      commonPitfalls: [
        'Building the full suffix trie for large strings: O(n^2) space blows up quickly',
        'Not adding sentinel character ($): without it, some suffixes become prefixes of others',
        'Confusing suffix trie (O(n^2)) with suffix tree (O(n)) with suffix array (O(n))',
        'Ukkonen\'s algorithm is notoriously hard to implement correctly — suffix arrays are simpler',
      ],
      interviewTips: [
        'Know the concept and applications — you likely will not implement Ukkonen\'s in an interview',
        'When asked about substring search preprocessing, mention suffix array as the practical choice',
        'The LCS (longest common substring) via generalized suffix tree/array is a classic problem',
      ],
      relatedConcepts: ['suffix-array-lcp', 'standard-trie', 'compressed-trie'],
      difficulty: 'advanced',
      tags: ['suffix-trie', 'suffix-tree', 'pattern-matching', 'substring'],
      proTip:
        'In competitive programming, suffix arrays have almost entirely replaced suffix trees. The reason: SA-IS builds a suffix array in O(n) with ~50 lines of code, while Ukkonen\'s suffix tree construction is ~200 lines and extremely error-prone. Kasai\'s LCP array construction adds another ~10 lines. Together they solve all problems that suffix trees solve.',
    },
    {
      id: 'suffix-array-lcp',
      title: 'Suffix Array + LCP Array',
      description:
        'A suffix array is the sorted order of all suffixes, stored as an array of starting indices. Combined with the LCP (Longest Common Prefix) array — which stores the LCP between consecutive suffixes in sorted order — it provides a practical, space-efficient alternative to suffix trees. Construction is O(n log n) with prefix doubling or O(n) with SA-IS. Kasai\'s algorithm builds the LCP array in O(n) from the suffix array.',
      timeComplexity: {
        best: 'O(n) construction (SA-IS)',
        average: 'O(n log n) construction (prefix doubling)',
        worst: 'O(n log n)',
      },
      spaceComplexity: 'O(n) — integer arrays only',
      keyPoints: [
        'Suffix array: SA[i] = starting index of the i-th smallest suffix',
        'Build O(n log n): sort by first 1 char, then 2, 4, 8... using rank pairs as sort keys',
        'Build O(n): SA-IS (Suffix Array Induced Sorting) — divide suffixes into S-type and L-type, recurse',
        'LCP array: LCP[i] = length of longest common prefix between SA[i] and SA[i-1]',
        'Kasai\'s algorithm: build LCP in O(n) using the observation that LCP[rank[i]] >= LCP[rank[i-1]] - 1',
        'Pattern search: binary search on suffix array — O(m log n) for pattern of length m',
        'Number of distinct substrings = n*(n+1)/2 - sum(LCP)',
        'Longest repeated substring = max(LCP)',
        'Longest common substring of two strings: concatenate with separator, build SA+LCP, find max LCP between suffixes from different strings',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Suffix Array O(n log^2 n) + Kasai LCP',
          code: `function buildSuffixArray(s: string): number[] {
  const n = s.length;
  // Initial ranking by single character
  let rank = Array.from(s, ch => ch.charCodeAt(0));
  let sa = Array.from({ length: n }, (_, i) => i);
  let tmp = new Array(n);

  for (let gap = 1; gap < n; gap *= 2) {
    const cmp = (a: number, b: number): number => {
      if (rank[a] !== rank[b]) return rank[a] - rank[b];
      const ra = a + gap < n ? rank[a + gap] : -1;
      const rb = b + gap < n ? rank[b + gap] : -1;
      return ra - rb;
    };

    sa.sort(cmp);

    tmp[sa[0]] = 0;
    for (let i = 1; i < n; i++) {
      tmp[sa[i]] = tmp[sa[i - 1]] + (cmp(sa[i - 1], sa[i]) < 0 ? 1 : 0);
    }
    rank = [...tmp];

    if (rank[sa[n - 1]] === n - 1) break; // all ranks unique
  }

  return sa;
}

function buildLCPArray(s: string, sa: readonly number[]): number[] {
  const n = s.length;
  const rank = new Array(n);
  for (let i = 0; i < n; i++) rank[sa[i]] = i;

  const lcp = new Array(n).fill(0);
  let k = 0;
  for (let i = 0; i < n; i++) {
    if (rank[i] === 0) { k = 0; continue; }
    const j = sa[rank[i] - 1];
    while (i + k < n && j + k < n && s[i + k] === s[j + k]) k++;
    lcp[rank[i]] = k;
    if (k > 0) k--;
  }
  return lcp;
}

// Number of distinct substrings
function countDistinctSubstrings(s: string): number {
  const n = s.length;
  const sa = buildSuffixArray(s);
  const lcp = buildLCPArray(s, sa);
  const total = n * (n + 1) / 2;
  const duplicates = lcp.reduce((sum, val) => sum + val, 0);
  return total - duplicates;
}`,
        },
      ],
      useCases: [
        'String matching: O(m log n) pattern search after O(n log n) preprocessing',
        'Bioinformatics: genome sequence analysis, repeat finding',
        'Data compression: BWT (Burrows-Wheeler Transform) uses suffix arrays',
        'Competitive programming: substring counting, LCS, and pattern problems',
      ],
      commonPitfalls: [
        'O(n log^2 n) from using comparison sort: can improve to O(n log n) with radix sort on rank pairs',
        'Kasai\'s algorithm: the key insight is k-- not k=0 when starting from a new suffix — preserves work',
        'Binary search for pattern: must compare full pattern with suffix prefix, not just first character',
        'Sentinel character must be lexicographically smaller than all other characters',
      ],
      interviewTips: [
        'The O(n log^2 n) suffix array is implementable in an interview — practice the rank-pair sorting approach',
        'Know the LCP applications: distinct substrings = n(n+1)/2 - sum(LCP), longest repeated = max(LCP)',
        'For "longest common substring of two strings": concatenate with separator, SA + LCP, filter by origin',
      ],
      relatedConcepts: ['suffix-trie', 'standard-trie', 'compressed-trie'],
      difficulty: 'advanced',
      tags: ['suffix-array', 'lcp', 'string', 'pattern-matching'],
      proTip:
        'The suffix array + LCP + sparse table combination is incredibly powerful: after O(n log n) build, you can answer "LCP of any two suffixes" in O(1). The LCP of suffixes starting at positions i and j is the range minimum of the LCP array between rank[i] and rank[j]. This enables O(1) string comparison (compare by LCP then next character) — useful for advanced string algorithms.',
    },
    {
      id: 'ternary-search-tree',
      title: 'Ternary Search Tree',
      description:
        'A trie variant where each node has three children: left (characters less than), middle (characters equal to, continue matching), and right (characters greater than). This provides the prefix-search capabilities of a trie with much better space efficiency for sparse alphabets. Each node stores a single character, making the structure similar to a BST on characters at each trie level.',
      timeComplexity: {
        best: 'O(L) per operation — L is key length',
        average: 'O(L + log n)',
        worst: 'O(L * n) — degenerate tree',
      },
      spaceComplexity: 'O(n * L) — three pointers per node',
      keyPoints: [
        'Three children per node: left (char < node.char), middle (char == node.char, advance to next char), right (char > node.char)',
        'Space efficient: only 3 pointers per node vs 26-256 per trie node',
        'Supports all trie operations: insert, search, prefix search, near-neighbor search',
        'Near-miss search: find all strings within edit distance d — natural recursive decomposition',
        'Insertion order matters: balanced TST comes from inserting median character first at each level',
        'Faster than hash table for prefix operations, slower for exact match',
        'Used in spell checkers: near-miss search finds suggestions within 1-2 edit distance',
        'Sedgewick\'s analysis: TSTs are competitive with hash tables for string keys and superior for prefix queries',
      ],
      useCases: [
        'Spell checker with suggestions (near-miss search)',
        'Autocomplete with prefix matching',
        'Dictionary with memory constraints (embedded systems)',
        'When alphabet is large (Unicode) and standard trie wastes too much space',
      ],
      commonPitfalls: [
        'Unbalanced insertion: sorted input creates a degenerate tree — randomize or use median insertion',
        'Confusing middle child (character match, advance in key) with left/right (BST on current character)',
        'Search must advance key position ONLY on middle child traversal, not on left/right',
        'More complex to implement correctly than standard trie — the three-way branching adds cases',
      ],
      interviewTips: [
        'TST is a niche topic — mentioning it shows depth of knowledge about string data structures',
        'Compare with trie: TST uses less memory for sparse alphabets, trie is faster for dense alphabets',
        'The near-miss search capability is the killer feature: "find all words within edit distance k"',
      ],
      relatedConcepts: ['standard-trie', 'compressed-trie', 'bst'],
      difficulty: 'advanced',
      tags: ['ternary-search-tree', 'tst', 'string', 'prefix'],
      proTip:
        'TSTs combine the best of tries and BSTs: they support prefix operations (like tries) while using BST-like branching that adapts to the actual character distribution (unlike tries that always allocate for the full alphabet). Sedgewick\'s experiments show TSTs are within 2x of hash table performance for exact match while also supporting prefix, wildcard, and near-neighbor queries that hash tables cannot.',
    },
    {
      id: 'aho-corasick',
      title: 'Aho-Corasick',
      description:
        'A multi-pattern matching automaton built on a trie with failure links. Given a set of pattern strings, Aho-Corasick preprocesses them into a trie augmented with failure links (similar to KMP failure function but for multiple patterns simultaneously). Then, any text string can be scanned in a single O(n + m + z) pass to find all occurrences of all patterns, where n = text length, m = total pattern length, z = number of matches.',
      timeComplexity: {
        best: 'O(n + m + z)',
        average: 'O(n + m + z)',
        worst: 'O(n + m + z) — z = number of output matches',
      },
      spaceComplexity: 'O(m * ALPHABET_SIZE) for the automaton',
      keyPoints: [
        'Build phase: construct trie from all patterns — O(m) where m = sum of pattern lengths',
        'Failure links: when a character does not match, follow failure link to longest proper suffix that is also a prefix in the trie',
        'Output links: chain of pattern-end nodes reachable via failure links — needed to report all matching patterns',
        'Search phase: scan text character by character, following transitions and failure links — O(n + z)',
        'Processes ALL patterns simultaneously in a single scan of the text',
        'Equivalent to building a DFA from multiple patterns — each state is a trie node',
        'Used in antivirus scanners, intrusion detection systems, and DNA sequence analysis',
        'Dictionary links (output links): at each node, maintain link to nearest ancestor that is an end-of-pattern',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Aho-Corasick Multi-Pattern Matching',
          code: `class AhoCorasick {
  private goto: Map<string, number>[] = [new Map()];
  private fail: number[] = [0];
  private output: number[][] = [[]]; // pattern indices
  private stateCount = 1;

  constructor(patterns: readonly string[]) {
    // Build trie (goto function)
    for (let pid = 0; pid < patterns.length; pid++) {
      let state = 0;
      for (const ch of patterns[pid]) {
        if (!this.goto[state].has(ch)) {
          const newState = this.stateCount++;
          this.goto.push(new Map());
          this.fail.push(0);
          this.output.push([]);
          this.goto[state].set(ch, newState);
        }
        state = this.goto[state].get(ch)!;
      }
      this.output[state].push(pid);
    }

    // Build failure links (BFS)
    const queue: number[] = [];
    for (const [ch, s] of this.goto[0]) {
      this.fail[s] = 0;
      queue.push(s);
    }

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
        // Merge output from failure state
        this.output[v] = [...this.output[v], ...this.output[this.fail[v]]];
      }
    }
  }

  search(text: string): Array<{ position: number; patternIndex: number }> {
    const results: Array<{ position: number; patternIndex: number }> = [];
    let state = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      while (state !== 0 && !this.goto[state].has(ch)) {
        state = this.fail[state];
      }
      state = this.goto[state].get(ch) ?? 0;

      for (const pid of this.output[state]) {
        results.push({ position: i, patternIndex: pid });
      }
    }

    return results;
  }
}`,
        },
      ],
      useCases: [
        'Antivirus: scanning files for thousands of malware signatures simultaneously',
        'Intrusion detection: matching network packets against attack patterns',
        'DNA analysis: finding multiple gene sequences in a genome',
        'Content filtering: detecting prohibited words/phrases in text',
      ],
      commonPitfalls: [
        'Not merging output from failure state: misses patterns that are suffixes of other patterns',
        'Failure link from root must stay at root (not follow to itself) — handle root transitions specially',
        'Output can be large: z (number of matches) can be O(n * number_of_patterns) in pathological cases',
        'Building automaton is O(m * ALPHABET_SIZE) if using array transitions; use maps for large alphabets',
      ],
      interviewTips: [
        'Aho-Corasick is the answer to "search for multiple patterns in text simultaneously"',
        'Relate to KMP: KMP handles one pattern with failure function; AC extends this to a trie of patterns',
        'The failure link is the AC equivalent of the KMP failure function — same concept, tree structure',
      ],
      relatedConcepts: ['standard-trie', 'suffix-trie', 'kmp-algorithm'],
      difficulty: 'expert',
      tags: ['aho-corasick', 'multi-pattern', 'automaton', 'failure-links'],
      proTip:
        'Aho-Corasick is the foundation of the Unix fgrep command (fixed-string grep). When you run grep -F with multiple patterns, the implementation builds an AC automaton and scans the input in a single pass. This is why grep -F with 1000 patterns is nearly as fast as grep -F with 1 pattern — the automaton processes all patterns simultaneously.',
    },
    {
      id: 'trie-applications',
      title: 'Trie Applications',
      description:
        'Tries unlock a family of string problems that hash tables cannot solve efficiently: prefix queries, lexicographic ordering, longest prefix match, and XOR optimization. Understanding when to reach for a trie instead of a hash set — and which trie variant to use — is the key skill. The XOR trie for maximum/minimum XOR pair is a particularly clever application that appears in competitive programming.',
      timeComplexity: {
        best: 'O(L) per operation',
        average: 'O(L)',
        worst: 'O(L * N) for some aggregation queries',
      },
      spaceComplexity: 'Varies by application',
      keyPoints: [
        'Autocomplete: trie + DFS from prefix node + ranking (frequency, recency, personalization)',
        'Spell check: trie + edit distance BFS/DFS — find all words within edit distance k from query',
        'Longest prefix match: traverse trie along input, track last complete-word node — used in IP routing',
        'XOR trie: store numbers as binary strings (MSB to LSB), for each query find path maximizing XOR',
        'XOR maximum pair: insert all numbers into binary trie, for each number greedily choose opposite bit at each level',
        'Word search in grid (Boggle): trie of dictionary + DFS on grid — prune branches where no trie prefix matches',
        'Stream processing: trie can incrementally add/query as data arrives, unlike suffix array which needs full input',
        'IP routing: longest prefix match on binary trie of IP prefixes determines forwarding table entry',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'XOR Trie for Maximum XOR Pair',
          code: `// Find maximum XOR of any two numbers in the array
class XORTrie {
  private root: [XORTrie | null, XORTrie | null] = [null, null]; // [0-child, 1-child]

  insert(num: number): void {
    let node: [XORTrie | null, XORTrie | null] = this.root;
    for (let bit = 30; bit >= 0; bit--) {
      const b = (num >> bit) & 1;
      if (node[b] === null) {
        node[b] = new XORTrie();
      }
      node = node[b]!.root;
    }
  }

  // Find number in trie that maximizes XOR with given num
  findMaxXOR(num: number): number {
    let node: [XORTrie | null, XORTrie | null] = this.root;
    let result = 0;
    for (let bit = 30; bit >= 0; bit--) {
      const b = (num >> bit) & 1;
      const preferred = 1 - b; // opposite bit maximizes XOR
      if (node[preferred] !== null) {
        result |= 1 << bit;
        node = node[preferred]!.root;
      } else if (node[b] !== null) {
        node = node[b]!.root;
      } else {
        break;
      }
    }
    return result;
  }
}

function findMaximumXOR(nums: readonly number[]): number {
  const trie = new XORTrie();
  let maxXor = 0;
  trie.insert(nums[0]);
  for (let i = 1; i < nums.length; i++) {
    maxXor = Math.max(maxXor, trie.findMaxXOR(nums[i]));
    trie.insert(nums[i]);
  }
  return maxXor;
}`,
        },
      ],
      useCases: [
        'Search engine autocomplete with ranking',
        'Network routing: longest prefix match for IP forwarding',
        'Competitive programming: maximum XOR pair, XOR queries on arrays',
        'Word games: Boggle solver, crossword helper, Scrabble move generation',
      ],
      commonPitfalls: [
        'XOR trie: must process bits from MSB to LSB (bit 30 down to 0 for 31-bit integers)',
        'Boggle/word search: must mark visited cells during DFS and unmark on backtrack',
        'Autocomplete ranking: returning all matches is too slow — use top-k with precomputed hot lists',
        'IP longest prefix match: must handle default route (0.0.0.0/0) as fallback',
      ],
      interviewTips: [
        'When asked "find maximum XOR pair in array", immediately think binary trie',
        'Boggle solver with trie is a classic Google interview question',
        'Know that trie advantages over hash table: prefix queries, ordered iteration, longest prefix match',
      ],
      relatedConcepts: ['standard-trie', 'compressed-trie', 'aho-corasick'],
      difficulty: 'intermediate',
      tags: ['trie-applications', 'xor-trie', 'autocomplete', 'longest-prefix'],
      proTip:
        'The XOR trie is the string algorithm community\'s secret weapon for bit manipulation problems. Any problem involving "maximize/minimize XOR" can likely be solved with a binary trie. The pattern: insert numbers as 31-bit binary strings, then for each query greedily choose the opposite bit at each level. This converts an O(n^2) brute force into O(n * 31) = O(n).',
    },
  ],
}
