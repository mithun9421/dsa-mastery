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

export const greedyCategory: Category = {
  id: 'greedy',
  title: 'Greedy Algorithms',
  description: 'Greedy algorithms make the locally optimal choice at each step, hoping to find the global optimum. The critical skill is proving correctness — typically via exchange argument or greedy stays ahead. When greedy works, it is elegant and efficient; when it does not, it fails silently with wrong answers.',
  icon: '🎯',
  concepts: [
    {
      id: 'activity-selection',
      title: 'Activity Selection',
      description: 'Given a set of activities with start and finish times, select the maximum number of non-overlapping activities. The greedy strategy is to always pick the activity that finishes earliest. This is provably optimal via the exchange argument: swapping any choice for an earlier-finishing one can never reduce the total count. This is the canonical greedy problem and the foundation for all interval scheduling.',
      timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Sort by finish time, greedily pick the earliest-finishing compatible activity',
        'Correctness proof: exchange argument — replacing any chosen activity with an earlier-finishing one is never worse',
        'The greedy choice property: the globally optimal solution includes the earliest-finishing activity',
        'Optimal substructure: after choosing the first activity, the remaining problem is the same type',
        'Weighted version (weighted job scheduling) requires DP — greedy does not work when activities have different values',
        'This is equivalent to maximum independent set on an interval graph (polynomial, unlike general graphs)',
        'If sorted by start time instead: greedy fails — consider [1,10], [2,3], [4,5]',
        'Extension: minimum number of rooms/machines to schedule ALL activities = interval partitioning'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Activity Selection',
          code: `interface Activity {
  start: number
  finish: number
}

function activitySelection(activities: readonly Activity[]): Activity[] {
  const sorted = [...activities].sort((a, b) => a.finish - b.finish);
  const selected: Activity[] = [];
  let lastFinish = -Infinity;

  for (const act of sorted) {
    if (act.start >= lastFinish) {
      selected.push(act);
      lastFinish = act.finish;
    }
  }

  return selected;
}

// Weighted Job Scheduling (needs DP, greedy fails)
function weightedJobScheduling(
  jobs: Array<{ start: number; finish: number; weight: number }>
): number {
  const sorted = [...jobs].sort((a, b) => a.finish - b.finish);
  const n = sorted.length;
  const dp = new Array(n + 1).fill(0);

  // Binary search for latest non-conflicting job
  function latestNonConflicting(idx: number): number {
    let lo = 0, hi = idx - 1;
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (sorted[mid].finish <= sorted[idx].start) lo = mid + 1;
      else hi = mid - 1;
    }
    return hi;
  }

  for (let i = 0; i < n; i++) {
    const inclWeight = sorted[i].weight + dp[latestNonConflicting(i) + 1];
    dp[i + 1] = Math.max(dp[i], inclWeight);
  }

  return dp[n];
}`
        }
      ],
      useCases: [
        'Meeting room scheduling: maximize number of meetings',
        'CPU task scheduling: maximize jobs completed',
        'Resource allocation: maximize utilization of a single resource',
        'Television programming: maximize shows that can be aired without overlap'
      ],
      commonPitfalls: [
        'Sorting by start time instead of finish time — leads to suboptimal results',
        'Sorting by duration — also wrong; short activities can overlap with many others',
        'Applying greedy to the weighted version — must use DP for weighted job scheduling',
        'Not handling the edge case of activities with the same finish time'
      ],
      interviewTips: [
        'Activity selection is the warmup for interval problems — know it instantly',
        'If activities have weights/values: pivot to DP (weighted job scheduling)',
        '"Maximum number of non-overlapping intervals" = activity selection',
        'The exchange argument proof is important — interviewers may ask why greedy works'
      ],
      relatedConcepts: ['interval-scheduling', 'weighted-job-scheduling', 'interval-partitioning'],
      difficulty: 'beginner',
      tags: ['interval', 'scheduling', 'exchange-argument'],
      proTip: 'The exchange argument is the most common proof technique for greedy algorithms. The structure is always: assume an optimal solution that does not include the greedy choice, then show you can swap in the greedy choice without making the solution worse. Practice this proof pattern — interviewers at top companies ask for correctness arguments.'
    },
    {
      id: 'huffman-coding',
      title: 'Huffman Coding',
      description: 'Huffman coding builds an optimal prefix-free binary code by repeatedly merging the two least-frequent symbols into a single node. The result is a variable-length encoding where frequent characters get shorter codes. It is provably optimal among prefix codes (no codeword is a prefix of another). Huffman coding is the foundation of data compression (used in ZIP, JPEG, MP3 as a final stage).',
      timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Build a min-heap of frequencies, repeatedly extract two smallest, merge, insert back',
        'Prefix-free: no code is a prefix of another — enables unambiguous decoding',
        'Optimal among prefix codes: minimizes weighted path length (sum of freq * code_length)',
        'Proof of optimality: exchange argument — swapping a less-frequent deeper node with a more-frequent shallower node always helps',
        'For n symbols, the Huffman tree has n leaves and n-1 internal nodes',
        'Canonical Huffman coding: assign codes by length then lexicographic order — simplifies encoding/decoding tables',
        'Adaptive Huffman coding: update tree as symbols arrive (used in real-time compression)',
        'Shannon entropy is the theoretical lower bound — Huffman achieves within 1 bit of entropy per symbol'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Huffman Coding: Build Tree and Generate Codes',
          code: `interface HuffmanNode {
  char: string | null
  freq: number
  left: HuffmanNode | null
  right: HuffmanNode | null
}

function buildHuffmanTree(
  frequencies: Map<string, number>
): HuffmanNode | null {
  // Min-heap simulation using sorted array
  const nodes: HuffmanNode[] = [];
  for (const [char, freq] of frequencies) {
    nodes.push({ char, freq, left: null, right: null });
  }

  if (nodes.length === 0) return null;
  if (nodes.length === 1) {
    return { char: null, freq: nodes[0].freq, left: nodes[0], right: null };
  }

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    const parent: HuffmanNode = {
      char: null,
      freq: left.freq + right.freq,
      left,
      right
    };
    nodes.push(parent);
  }

  return nodes[0];
}

function generateCodes(root: HuffmanNode | null): Map<string, string> {
  const codes = new Map<string, string>();

  function traverse(node: HuffmanNode | null, code: string): void {
    if (!node) return;
    if (node.char !== null) {
      codes.set(node.char, code || '0'); // Single character edge case
      return;
    }
    traverse(node.left, code + '0');
    traverse(node.right, code + '1');
  }

  traverse(root, '');
  return codes;
}

function huffmanEncode(text: string): { encoded: string; codes: Map<string, string> } {
  const freq = new Map<string, number>();
  for (const ch of text) freq.set(ch, (freq.get(ch) ?? 0) + 1);

  const tree = buildHuffmanTree(freq);
  const codes = generateCodes(tree);

  const encoded = [...text].map(ch => codes.get(ch)!).join('');
  return { encoded, codes };
}`
        }
      ],
      useCases: [
        'Data compression: ZIP, GZIP, DEFLATE (LZ77 + Huffman)',
        'Image compression: JPEG uses Huffman as the entropy coding stage',
        'Network protocols: HTTP/2 HPACK uses Huffman for header compression',
        'File encoding: when character frequencies are known or can be computed'
      ],
      commonPitfalls: [
        'Single character input: the tree has only one leaf — must assign code "0" explicitly',
        'Using array sort instead of min-heap: O(n^2 log n) instead of O(n log n)',
        'Not producing prefix-free codes: if the tree is malformed, decoding becomes ambiguous',
        'Confusing Huffman with Shannon-Fano: Huffman is optimal, Shannon-Fano is not always'
      ],
      interviewTips: [
        'Know how to build the tree and generate codes — classic greedy problem',
        'The greedy choice: always merge the two smallest frequencies',
        'If asked about compression ratio: Huffman achieves within 1 bit of Shannon entropy per symbol',
        'Follow-up: "What if frequencies change?" — adaptive Huffman or arithmetic coding'
      ],
      relatedConcepts: ['priority-queue', 'prefix-codes', 'entropy', 'compression'],
      difficulty: 'intermediate',
      tags: ['compression', 'tree', 'prefix-code', 'priority-queue'],
      proTip: 'In practice, arithmetic coding achieves better compression than Huffman because it can use fractional bits per symbol. Huffman is limited to integer bit lengths per symbol. However, Huffman is simpler, faster, and patent-free, which is why it remains the standard in formats like DEFLATE (ZIP, GZIP, PNG).'
    },
    {
      id: 'fractional-knapsack',
      title: 'Fractional Knapsack',
      description: 'Unlike 0/1 knapsack, fractional knapsack allows taking fractions of items. The greedy strategy is to sort by value-to-weight ratio and greedily take items with the highest ratio. This is provably optimal because you can always improve a solution by replacing a lower-ratio fraction with a higher-ratio one. The key insight: fractions make the problem smooth and continuous, enabling greedy; the integer constraint in 0/1 makes it NP-hard.',
      timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'Sort by value/weight ratio in descending order',
        'Take as much of each item as possible, starting from highest ratio',
        'Last item may be taken fractionally to fill remaining capacity',
        'Provably optimal: exchange argument on value/weight ratio',
        'O(n) possible with quickselect — find the critical item, take all above, fraction of it',
        'Contrast with 0/1 knapsack: fractional is polynomial, 0/1 is NP-hard',
        'The LP relaxation of 0/1 knapsack IS fractional knapsack — used as an upper bound'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Fractional Knapsack',
          code: `interface Item {
  weight: number
  value: number
}

function fractionalKnapsack(
  items: readonly Item[], capacity: number
): { maxValue: number; fractions: number[] } {
  const indexed = items.map((item, i) => ({
    ...item,
    ratio: item.value / item.weight,
    index: i
  }));

  indexed.sort((a, b) => b.ratio - a.ratio);

  let remaining = capacity;
  let totalValue = 0;
  const fractions = new Array(items.length).fill(0);

  for (const item of indexed) {
    if (remaining <= 0) break;

    const take = Math.min(item.weight, remaining);
    const fraction = take / item.weight;
    fractions[item.index] = fraction;
    totalValue += take * item.ratio;
    remaining -= take;
  }

  return { maxValue: totalValue, fractions };
}`
        }
      ],
      useCases: [
        'Resource allocation where partial use is allowed',
        'Portfolio investment where you can invest any fraction of capital',
        'LP relaxation bound for 0/1 knapsack (branch and bound)',
        'Teaching: illustrating when greedy works vs fails (compare with 0/1 knapsack)'
      ],
      commonPitfalls: [
        'Applying greedy to 0/1 knapsack — greedy does NOT work when items cannot be split',
        'Sorting by value instead of value/weight ratio',
        'Not handling zero-weight items (infinite ratio) — skip or handle explicitly',
        'Forgetting the fractional part: the last item may be partially taken'
      ],
      interviewTips: [
        'Know the contrast: fractional = greedy O(n log n), 0/1 = DP O(nW)',
        'The ratio sort is the key insight — mention it immediately',
        'If asked "why does greedy fail for 0/1?": give a counterexample like items (10,60), (20,100), (30,120) with W=50',
        'Fractional knapsack gives an upper bound for 0/1 knapsack — useful in branch and bound'
      ],
      relatedConcepts: ['knapsack-01', 'lp-relaxation', 'branch-and-bound'],
      difficulty: 'beginner',
      tags: ['knapsack', 'ratio', 'optimization'],
      proTip: 'The fractional knapsack solution is the LP relaxation of the integer knapsack. This means it provides a tight upper bound for branch-and-bound solvers. In operations research, solving the LP relaxation first is standard practice for bounding the optimal integer solution. This connection between greedy and linear programming is deep and practically important.'
    },
    {
      id: 'job-scheduling-deadlines',
      title: 'Job Scheduling with Deadlines',
      description: 'Given n jobs with deadlines and profits, schedule jobs on a single machine (one job per unit time) to maximize profit. Each job takes one unit of time and must be completed by its deadline. The greedy strategy is to sort by profit (descending) and assign each job to the latest available slot before its deadline. Using DSU (Union-Find) for slot finding achieves O(n log n) overall.',
      timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Sort jobs by profit in descending order',
        'For each job, find the latest available time slot <= deadline',
        'Naive approach: scan backward for available slot = O(n^2)',
        'DSU optimization: union filled slots with previous slot, find() gives latest available = O(n alpha(n))',
        'Greedy correctness: taking a higher-profit job is always at least as good as a lower-profit one',
        'At most min(n, max_deadline) jobs can be scheduled',
        'This is a matroid intersection problem — greedy on matroids is always optimal',
        'Extension: jobs with processing times > 1 requires more complex scheduling algorithms'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Job Scheduling with DSU Optimization',
          code: `interface Job {
  id: string
  deadline: number
  profit: number
}

function jobScheduling(jobs: readonly Job[]): {
  maxProfit: number
  scheduled: string[]
} {
  const sorted = [...jobs].sort((a, b) => b.profit - a.profit);
  const maxDeadline = Math.max(...jobs.map(j => j.deadline));

  // DSU for finding available slots
  const parent = Array.from({ length: maxDeadline + 1 }, (_, i) => i);

  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  let totalProfit = 0;
  const scheduled: string[] = [];

  for (const job of sorted) {
    // Find latest available slot <= deadline
    const slot = find(Math.min(job.deadline, maxDeadline));
    if (slot > 0) {
      scheduled.push(job.id);
      totalProfit += job.profit;
      parent[slot] = slot - 1; // Mark slot as used
    }
  }

  return { maxProfit: totalProfit, scheduled };
}`
        }
      ],
      useCases: [
        'Manufacturing: schedule jobs to maximize revenue before deadlines',
        'Project management: prioritize tasks with deadlines',
        'Advertising: schedule highest-value ads in limited slots',
        'Exam preparation: maximize points by studying highest-value topics within time'
      ],
      commonPitfalls: [
        'Sorting by deadline instead of profit — greedy on deadline does not maximize profit',
        'Not using DSU: O(n^2) slot scanning when n is large',
        'Off-by-one: slots are 1-indexed (1 to max_deadline), not 0-indexed',
        'Forgetting that DSU parent of 0 means no slot available'
      ],
      interviewTips: [
        'The DSU optimization is the impressive part — mention it even if you code the naive version',
        'This problem combines sorting + greedy + Union-Find — shows breadth',
        'If asked for proof: exchange argument — swapping a lower-profit job for a higher-profit one never hurts',
        'Variation: "what if jobs have different processing times?" — becomes NP-hard, mention this'
      ],
      relatedConcepts: ['activity-selection', 'dsu', 'matroid', 'scheduling'],
      difficulty: 'intermediate',
      tags: ['scheduling', 'deadline', 'union-find', 'profit-maximization'],
      proTip: 'This problem is a special case of scheduling on a matroid (specifically, a partition matroid). The theorem is: greedy on matroids always gives the optimal solution. Recognizing matroid structure in a problem instantly tells you greedy works and saves you from needing to construct a custom proof.'
    },
    {
      id: 'interval-scheduling',
      title: 'Interval Scheduling and Merging',
      description: 'Interval problems are a family of greedy classics: merging overlapping intervals, finding minimum rooms for all meetings, and removing minimum intervals to eliminate overlaps. Each variant has a specific sorting strategy and greedy rule. These problems appear constantly in real systems (calendar scheduling, resource allocation, network bandwidth) and in interviews.',
      timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      spaceComplexity: 'O(n)',
      keyPoints: [
        'Merge intervals: sort by start, extend current interval or start new one',
        'Minimum rooms (interval partitioning): sort events chronologically, track overlapping count',
        'Maximum non-overlapping (activity selection): sort by end time, greedily pick earliest ending',
        'Minimum removals for non-overlap: n - (max non-overlapping count)',
        'Interval partitioning = minimum graph coloring on interval graph = max concurrent overlap',
        'Sweep line technique: process start/end events in order, track active count',
        'For "insert interval": binary search for position, merge with neighbors',
        'All interval problems start with sorting — the question is by what (start, end, or both)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Interval Problems: Merge, Min Rooms, Min Removals',
          code: `// Merge overlapping intervals
function mergeIntervals(intervals: number[][]): number[][] {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i][0] <= last[1]) {
      last[1] = Math.max(last[1], sorted[i][1]);
    } else {
      merged.push(sorted[i]);
    }
  }

  return merged;
}

// Minimum meeting rooms (interval partitioning)
function minMeetingRooms(intervals: number[][]): number {
  const events: [number, number][] = [];
  for (const [start, end] of intervals) {
    events.push([start, 1]);   // Meeting starts
    events.push([end, -1]);    // Meeting ends
  }
  // Sort by time; if tied, end before start (free room before using one)
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  let maxRooms = 0;
  let current = 0;
  for (const [, delta] of events) {
    current += delta;
    maxRooms = Math.max(maxRooms, current);
  }
  return maxRooms;
}

// Minimum intervals to remove for non-overlapping
function eraseOverlapIntervals(intervals: number[][]): number {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
  let count = 0;
  let lastEnd = -Infinity;

  for (const [start, end] of sorted) {
    if (start >= lastEnd) {
      lastEnd = end;
    } else {
      count++; // Remove this interval
    }
  }

  return count;
}`
        }
      ],
      useCases: [
        'Calendar applications: finding free time slots, detecting conflicts',
        'Resource allocation: rooms, CPUs, network bandwidth',
        'Database: range query optimization, interval indexing',
        'Network: scheduling packet transmissions, bandwidth allocation'
      ],
      commonPitfalls: [
        'Merge intervals: using strict < instead of <= for overlap check (depends on problem definition)',
        'Min rooms: not handling tie-breaking when start and end times coincide',
        'Sorting by wrong criterion: merge by start, max non-overlap by end',
        'Off-by-one: does [1,2] overlap with [2,3]? Depends on whether endpoints are inclusive'
      ],
      interviewTips: [
        'Interval problems are among the most frequently asked — know all three variants',
        '"Merge intervals" is a top-20 Leetcode question',
        '"Meeting rooms II" (min rooms) is a classic: sweep line or min-heap approach',
        'The sweep line technique generalizes to 2D problems (rectangle overlap)',
        'Always clarify: are endpoints inclusive or exclusive? This changes the overlap condition'
      ],
      relatedConcepts: ['activity-selection', 'sweep-line', 'priority-queue'],
      difficulty: 'intermediate',
      tags: ['interval', 'sweep-line', 'merging', 'scheduling'],
      proTip: 'The sweep line technique (processing events sorted by coordinate) is one of the most powerful ideas in computational geometry. It transforms 2D problems into 1D problems processed over time. Beyond intervals, it solves rectangle union area, closest pair of points, and line segment intersection. Master it on intervals first, then apply it to 2D.'
    },
    {
      id: 'gas-station',
      title: 'Gas Station (Circular Greedy)',
      description: 'Given gas stations in a circle with gas[i] fuel available and cost[i] fuel needed to reach the next station, find the starting station that allows completing the circuit (or determine it is impossible). The key insight: if total gas >= total cost, a solution exists, and it starts where the cumulative net fuel is at its minimum. This is a beautiful example of circular greedy reasoning.',
      timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      spaceComplexity: 'O(1)',
      keyPoints: [
        'If total gas < total cost: impossible — not enough fuel overall',
        'If total gas >= total cost: solution always exists and is unique (when net fuel values are distinct)',
        'Key observation: if you run out of fuel going from A to B, no station between A and B works as start',
        'Track cumulative surplus: when it goes negative, reset start to next station',
        'This is equivalent to finding the rotation of a circular array that maximizes the minimum prefix sum',
        'The "reset" strategy works because failing at station B means total net fuel from start to B is negative',
        'Can also be solved by finding the minimum of the prefix sum array and starting right after it',
        'Generalizes to other circular optimization problems'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Gas Station: Greedy O(n)',
          code: `function canCompleteCircuit(gas: number[], cost: number[]): number {
  const n = gas.length;
  let totalSurplus = 0;
  let currentSurplus = 0;
  let start = 0;

  for (let i = 0; i < n; i++) {
    const net = gas[i] - cost[i];
    totalSurplus += net;
    currentSurplus += net;

    if (currentSurplus < 0) {
      // Cannot start from 'start' through 'i'
      // Try starting from i+1
      start = i + 1;
      currentSurplus = 0;
    }
  }

  return totalSurplus >= 0 ? start : -1;
}`
        }
      ],
      useCases: [
        'Route planning for vehicles with fuel constraints',
        'Circular resource allocation problems',
        'Network routing with capacity constraints along a ring topology',
        'Teaching circular greedy reasoning'
      ],
      commonPitfalls: [
        'Brute force O(n^2) when O(n) is possible — always check total surplus first',
        'Not realizing that if you fail at B starting from A, no station between A and B can work either',
        'Handling the wrap-around: the greedy reset approach handles it implicitly',
        'Returning 0 instead of -1 when no solution exists'
      ],
      interviewTips: [
        '"Gas station" is a classic Leetcode medium — know the O(n) solution',
        'Two key insights: (1) total surplus check, (2) reset-start-on-failure',
        'If asked to prove why the reset works: if net fuel from A to B is negative, A+1 to B is also negative (prefix sum argument)',
        'Follow-up: "what if there are multiple valid starts?" — with distinct values, there is at most one'
      ],
      relatedConcepts: ['circular-array', 'prefix-sum', 'kadane'],
      difficulty: 'intermediate',
      tags: ['circular', 'prefix-sum', 'single-pass'],
      proTip: 'The gas station problem is isomorphic to finding the maximum-minimum prefix sum rotation of a circular array. This same structure appears in: minimum cost to cut a circular cake, optimal rotation of a workforce schedule, and circular buffer problems. The "reset on negative" technique is the one-pass solution for all of them.'
    },
    {
      id: 'mst-greedy',
      title: 'MST as Greedy (Cut Property)',
      description: 'Minimum Spanning Tree algorithms (Kruskal and Prim) are greedy because they exploit the cut property: for any cut of the graph, the lightest edge crossing the cut must be in the MST. This property is what makes the greedy choice safe. The generic MST algorithm is: repeatedly find a safe edge (lightest crossing some cut) and add it. Both Kruskal and Prim are specific instantiations of this generic algorithm.',
      timeComplexity: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)' },
      spaceComplexity: 'O(V + E)',
      keyPoints: [
        'Cut property: the lightest edge crossing any cut must be in the MST',
        'Cycle property: the heaviest edge in any cycle cannot be in the MST',
        'Generic MST algorithm: grow a forest, always add the lightest safe edge',
        'Kruskal: global view — sort all edges, add lightest that does not create a cycle',
        'Prim: local view — grow tree from a vertex, add lightest edge leaving the tree',
        'Boruvka: parallel view — each component picks its lightest outgoing edge simultaneously',
        'MST is unique if all edge weights are distinct',
        'Minimum bottleneck spanning tree = MST (the MST minimizes the maximum edge weight too)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Generic MST with Cut Property Demonstration',
          code: `// Demonstrate the cut property
// For any partition of vertices into S and V-S,
// the minimum weight edge between S and V-S is in the MST.

function verifyCutProperty(
  n: number,
  edges: Array<{ from: number; to: number; weight: number }>,
  mstEdges: Set<string>
): boolean {
  // For a random cut, check that the minimum crossing edge is in MST
  const inS = new Set<number>();
  for (let i = 0; i < Math.floor(n / 2); i++) inS.add(i);

  let minCrossing = Infinity;
  let minEdge = '';

  for (const { from, to, weight } of edges) {
    const fromInS = inS.has(from);
    const toInS = inS.has(to);
    if (fromInS !== toInS && weight < minCrossing) {
      minCrossing = weight;
      minEdge = \`\${Math.min(from, to)}-\${Math.max(from, to)}\`;
    }
  }

  return mstEdges.has(minEdge);
}

// Boruvka's Algorithm (parallel-friendly MST)
function boruvka(
  n: number,
  edges: Array<{ from: number; to: number; weight: number }>
): number {
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);

  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x: number, y: number): boolean {
    const px = find(x), py = find(y);
    if (px === py) return false;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
    return true;
  }

  let totalWeight = 0;
  let components = n;

  while (components > 1) {
    // Each component finds its lightest outgoing edge
    const cheapest = new Array(n).fill(-1);

    for (let i = 0; i < edges.length; i++) {
      const { from, to, weight } = edges[i];
      const pf = find(from), pt = find(to);
      if (pf === pt) continue;

      if (cheapest[pf] === -1 || weight < edges[cheapest[pf]].weight) {
        cheapest[pf] = i;
      }
      if (cheapest[pt] === -1 || weight < edges[cheapest[pt]].weight) {
        cheapest[pt] = i;
      }
    }

    for (let i = 0; i < n; i++) {
      if (cheapest[i] !== -1) {
        const { from, to, weight } = edges[cheapest[i]];
        if (union(from, to)) {
          totalWeight += weight;
          components--;
        }
      }
    }
  }

  return totalWeight;
}`
        }
      ],
      useCases: [
        'Network infrastructure design (minimum cost cabling)',
        'Cluster analysis: MST-based hierarchical clustering',
        'Approximate TSP: MST gives a 2-approximation',
        'Image segmentation: MST on pixel similarity graph'
      ],
      commonPitfalls: [
        'Assuming MST is unique when edge weights have ties — multiple MSTs may exist',
        'Confusing cut property with cycle property — cut property adds edges, cycle property removes them',
        'Forgetting that MST requires a connected graph — check connectivity first',
        'Applying MST algorithms to directed graphs — MST is for undirected graphs; directed version is called minimum arborescence'
      ],
      interviewTips: [
        'Know both Kruskal and Prim and when each is better (sparse vs dense)',
        'The cut property is the WHY behind MST greedy correctness',
        'If asked "prove Kruskal is correct": cut property on the cut between components',
        'Boruvka shows up in distributed computing questions — O(E log V) with natural parallelism'
      ],
      relatedConcepts: ['kruskal', 'prim', 'dsu', 'cut-property'],
      difficulty: 'intermediate',
      tags: ['mst', 'cut-property', 'greedy-proof'],
      proTip: 'The minimum bottleneck spanning tree (minimize the heaviest edge) is always an MST. This means the MST simultaneously optimizes both the total weight AND the bottleneck weight. This dual optimality is useful in network design where you care about the weakest link as well as total cost.'
    },
    {
      id: 'greedy-coloring',
      title: 'Greedy Graph Coloring',
      description: 'Greedy graph coloring assigns the smallest available color to each vertex processed in order. It uses at most max_degree + 1 colors (Brook\'s theorem guarantees this is enough for non-complete, non-odd-cycle graphs). While it does not guarantee the minimum number of colors (chromatic number), it is fast and provides a reasonable approximation. Vertex ordering significantly affects the result.',
      timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
      spaceComplexity: 'O(V)',
      keyPoints: [
        'Process vertices in some order, assign smallest color not used by any neighbor',
        'Guarantees at most delta+1 colors where delta = max degree',
        'Brook\'s theorem: chi(G) <= delta unless G is a complete graph or an odd cycle',
        'Vertex ordering matters: largest-first, smallest-last, or random give different results',
        'Optimal coloring (chromatic number) is NP-hard for general graphs',
        'For bipartite graphs: chromatic number is 2 (trivial)',
        'For interval graphs: greedy with "earliest start" order gives optimal coloring',
        'Applications: register allocation, map coloring, frequency assignment'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Greedy Graph Coloring',
          code: `function greedyColoring(
  graph: Map<number, number[]>, n: number
): { colors: number[]; numColors: number } {
  const colors = new Array(n).fill(-1);

  for (let u = 0; u < n; u++) {
    // Find colors used by neighbors
    const neighborColors = new Set<number>();
    for (const v of graph.get(u) ?? []) {
      if (colors[v] !== -1) {
        neighborColors.add(colors[v]);
      }
    }

    // Assign smallest available color
    let color = 0;
    while (neighborColors.has(color)) color++;
    colors[u] = color;
  }

  const numColors = Math.max(...colors) + 1;
  return { colors, numColors };
}

// Welsh-Powell: sort by degree (descending) for better results
function welshPowellColoring(
  graph: Map<number, number[]>, n: number
): { colors: number[]; numColors: number } {
  const degrees = new Array(n).fill(0);
  for (const [u, neighbors] of graph.entries()) {
    degrees[u] = neighbors.length;
  }

  // Process vertices in decreasing degree order
  const order = Array.from({ length: n }, (_, i) => i);
  order.sort((a, b) => degrees[b] - degrees[a]);

  const colors = new Array(n).fill(-1);

  for (const u of order) {
    const neighborColors = new Set<number>();
    for (const v of graph.get(u) ?? []) {
      if (colors[v] !== -1) neighborColors.add(colors[v]);
    }
    let color = 0;
    while (neighborColors.has(color)) color++;
    colors[u] = color;
  }

  const numColors = Math.max(...colors) + 1;
  return { colors, numColors };
}`
        }
      ],
      useCases: [
        'Compiler register allocation: variables = vertices, conflicts = edges, registers = colors',
        'Frequency assignment in wireless networks: avoid interference between nearby transmitters',
        'Exam scheduling: no two exams with common students at the same time',
        'Map coloring: four-color theorem for planar graphs'
      ],
      commonPitfalls: [
        'Assuming greedy gives optimal coloring — it does NOT for general graphs',
        'Not trying different vertex orderings — the order can dramatically affect the number of colors',
        'Confusing chromatic number (NP-hard to compute) with greedy coloring result',
        'Forgetting that bipartite graphs need only 2 colors — check bipartiteness first'
      ],
      interviewTips: [
        'Graph coloring is NP-hard in general — greedy is a heuristic, not optimal',
        'For interval graphs: greedy with right ordering gives optimal coloring',
        'Register allocation is the real-world application most likely to come up in systems interviews',
        'The four-color theorem (any planar graph is 4-colorable) is a famous result — mention it for bonus points'
      ],
      relatedConcepts: ['bipartite-check', 'interval-scheduling', 'chromatic-number'],
      difficulty: 'intermediate',
      tags: ['coloring', 'heuristic', 'approximation'],
      proTip: 'In compiler design, register allocation is graph coloring where the interference graph edges connect simultaneously live variables. When the number of colors (registers) is insufficient, the compiler must "spill" variables to memory. The Chaitin algorithm uses greedy coloring with simplification (remove low-degree nodes) and coalescing (merge non-interfering variables). This is one of the most impactful applications of graph theory in practice.'
    }
  ]
}
