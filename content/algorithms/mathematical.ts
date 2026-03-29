// @ts-nocheck
// ── Type Definitions (inlined) ──────────────────────────────────────────────
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface ComplexityAnalysis {
  time: string;
  space: string;
  bestCase?: string;
  averageCase?: string;
  worstCase?: string;
}

interface CodeExample {
  title: string;
  code: string;
  language: 'typescript';
  explanation: string;
}

interface Concept {
  id: string;
  name: string;
  difficulty: Difficulty;
  description: string;
  keyPoints: string[];
  codeExamples: CodeExample[];
  complexity: ComplexityAnalysis;
  commonPitfalls: string[];
  interviewTips: string[];
  proTip: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  concepts: Concept[];
}

interface Tab {
  id: string;
  name: string;
  categories: Category[];
}

// ── Mathematical Algorithms ─────────────────────────────────────────────────

export const mathCategory: Category = {
  id: 'mathematical',
  name: 'Mathematical Algorithms',
  description:
    'Number theory, combinatorics, and modular arithmetic form the backbone of competitive programming and many system-level optimizations. Mastering these algorithms lets you reduce brute-force searches to closed-form solutions and handle astronomically large numbers through modular techniques.',
  icon: '∑',
  concepts: [
    // ── 1. GCD / LCM ──────────────────────────────────────────────────────
    {
      id: 'gcd-lcm',
      name: 'GCD & LCM',
      difficulty: 'beginner',
      description:
        'The Greatest Common Divisor and Least Common Multiple are foundational building blocks in number theory. The Euclidean algorithm computes GCD in O(log min(a,b)) via repeated remainders. The Extended Euclidean algorithm also finds coefficients x,y such that ax + by = gcd(a,b), which is essential for modular inverses. Binary GCD (Stein\'s algorithm) avoids division entirely, using only shifts and subtraction — useful on hardware without fast division.',
      keyPoints: [
        'gcd(a, b) = gcd(b, a % b) — Euclidean recursion terminates when b = 0',
        'LCM(a, b) = |a * b| / gcd(a, b) — compute GCD first to avoid overflow',
        'Extended Euclidean: returns [g, x, y] where ax + by = g',
        'Binary GCD uses bit shifts: gcd(even, even)=2*gcd(a/2,b/2), gcd(even, odd)=gcd(a/2,b)',
        'GCD of an array: fold left with pairwise gcd — gcd(a,b,c) = gcd(gcd(a,b),c)',
        'gcd(0, n) = n by convention; handles edge case cleanly',
        'For BigInt support, the same algorithms apply — JS BigInt supports % and >> natively',
      ],
      codeExamples: [
        {
          title: 'Euclidean, Extended Euclidean, Binary GCD, and LCM',
          language: 'typescript',
          code: `function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a) / gcd(a, b) * Math.abs(b); // divide first to avoid overflow
}

// Returns [g, x, y] such that a*x + b*y = g
function extGcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0];
  const [g, x1, y1] = extGcd(b, a % b);
  return [g, y1, x1 - Math.floor(a / b) * y1];
}

// Binary GCD (Stein's) — no modulus, only shifts and subtraction
function binaryGcd(a: number, b: number): number {
  if (a === 0) return b;
  if (b === 0) return a;
  // Find common factor of 2
  let shift = 0;
  while (((a | b) & 1) === 0) { a >>= 1; b >>= 1; shift++; }
  // Remove remaining factors of 2 from a
  while ((a & 1) === 0) a >>= 1;
  do {
    while ((b & 1) === 0) b >>= 1;
    if (a > b) [a, b] = [b, a];
    b -= a;
  } while (b !== 0);
  return a << shift;
}

// Array GCD
function gcdArray(nums: number[]): number {
  return nums.reduce((acc, n) => gcd(acc, n));
}

console.log(gcd(48, 18));          // 6
console.log(lcm(12, 18));          // 36
console.log(extGcd(35, 15));       // [5, 1, -2]  =>  35*1 + 15*(-2) = 5
console.log(binaryGcd(48, 18));    // 6
console.log(gcdArray([12, 18, 24])); // 6`,
          explanation:
            'Four GCD variants: classic Euclidean (iterative), extended (for modular inverse), binary (hardware-friendly), and array fold. LCM divides before multiplying to avoid intermediate overflow.',
        },
      ],
      complexity: {
        time: 'O(log min(a, b))',
        space: 'O(1) iterative, O(log min(a,b)) recursive for extGcd',
        bestCase: 'O(1) when b divides a',
      },
      commonPitfalls: [
        'Computing a*b/gcd can overflow — always divide first: (a/gcd)*b',
        'Forgetting Math.abs — gcd should handle negative inputs',
        'Extended GCD coefficients can be negative — do not assume x,y > 0',
        'Binary GCD shift variable must track common factors of 2 separately',
      ],
      interviewTips: [
        'GCD is the gateway to modular inverse, CRT, and Bezout\'s identity — know extGcd cold',
        'LCM overflow trap is a classic interview gotcha — always mention dividing first',
        'Binary GCD shows systems-level thinking — mention it when discussing embedded constraints',
      ],
      proTip:
        'When GCD appears in a problem with large arrays, think about the fact that gcd(a1..an) stabilizes quickly — once it reaches 1 it stays 1. Early-exit when gcd === 1 can save huge constant factors.',
    },

    // ── 2. Sieve of Eratosthenes ──────────────────────────────────────────
    {
      id: 'sieve-eratosthenes',
      name: 'Sieve of Eratosthenes',
      difficulty: 'intermediate',
      description:
        'The Sieve of Eratosthenes generates all primes up to N in O(N log log N) time, making it the most practical algorithm for bulk prime generation. The segmented sieve extends this to ranges [L, R] without allocating O(N) memory by processing fixed-size blocks. The linear sieve (Euler\'s sieve) ensures each composite is crossed off exactly once, achieving true O(N) and also computing the smallest prime factor (SPF) for every number — enabling O(log N) factorization.',
      keyPoints: [
        'Classic sieve: mark multiples of each prime starting from p² — everything below p² is already handled',
        'Only iterate to √N — all composites ≤ N have a factor ≤ √N',
        'Segmented sieve: generate base primes ≤ √R, then sieve blocks of fixed size (e.g., 2^16)',
        'Linear sieve: each composite marked by its smallest prime factor exactly once — O(N) strict',
        'SPF array enables O(log N) factorization of any number ≤ N',
        'Memory: classic uses N bytes (or N/16 with bitset + odd-only), segmented uses O(√N + block_size)',
        'For ranges [L, R] with R up to 10^12, segmented sieve is the only viable approach',
        'Sieve of Sundaram and Atkin exist but are rarely faster in practice than optimized Eratosthenes',
      ],
      codeExamples: [
        {
          title: 'Classic Sieve, Linear Sieve with SPF, and Segmented Sieve',
          language: 'typescript',
          code: `// Classic Sieve of Eratosthenes
function sieve(n: number): boolean[] {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let p = 2; p * p <= n; p++) {
    if (isPrime[p]) {
      for (let m = p * p; m <= n; m += p) {
        isPrime[m] = false;
      }
    }
  }
  return isPrime;
}

// Linear Sieve (Euler's) — O(N), also builds smallest prime factor
function linearSieve(n: number): { primes: number[]; spf: number[] } {
  const spf = new Array(n + 1).fill(0);
  const primes: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (spf[i] === 0) { // i is prime
      spf[i] = i;
      primes.push(i);
    }
    for (const p of primes) {
      if (p > spf[i] || i * p > n) break;
      spf[i * p] = p;
    }
  }
  return { primes, spf };
}

// Factorize using SPF in O(log n)
function factorize(n: number, spf: number[]): Map<number, number> {
  const factors = new Map<number, number>();
  while (n > 1) {
    const p = spf[n];
    let count = 0;
    while (n % p === 0) { n /= p; count++; }
    factors.set(p, count);
  }
  return factors;
}

// Segmented Sieve for range [lo, hi]
function segmentedSieve(lo: number, hi: number): number[] {
  const limit = Math.floor(Math.sqrt(hi)) + 1;
  const basePrimes: number[] = [];
  const mark = sieve(limit);
  for (let i = 2; i < mark.length; i++) if (mark[i]) basePrimes.push(i);

  const size = hi - lo + 1;
  const seg = new Array(size).fill(true);
  if (lo <= 1) { // mark 0 and 1 as non-prime
    for (let i = 0; i <= Math.min(1, hi) - lo; i++) seg[i] = false;
  }

  for (const p of basePrimes) {
    let start = Math.max(p * p, Math.ceil(lo / p) * p);
    if (start === p) start += p; // don't mark the prime itself
    for (let j = start; j <= hi; j += p) {
      seg[j - lo] = false;
    }
  }

  const result: number[] = [];
  for (let i = 0; i < size; i++) {
    if (seg[i]) result.push(lo + i);
  }
  return result;
}

const { primes, spf } = linearSieve(50);
console.log(primes);               // [2, 3, 5, 7, 11, 13, ...]
console.log(factorize(360, spf));  // Map { 2 => 3, 3 => 2, 5 => 1 }
console.log(segmentedSieve(100, 130));
// [101, 103, 107, 109, 113, 127]`,
          explanation:
            'Three sieve variants: classic for small N, linear for SPF-based factorization, and segmented for large ranges. The linear sieve\'s key invariant is that each composite is marked only by its smallest prime factor, achieved by breaking when p > spf[i].',
        },
      ],
      complexity: {
        time: 'O(N log log N) classic, O(N) linear, O((R-L+1) log log R + √R) segmented',
        space: 'O(N) classic/linear, O(√R + block_size) segmented',
      },
      commonPitfalls: [
        'Starting inner loop at p*2 instead of p*p wastes time on already-marked composites',
        'Segmented sieve: forgetting to handle lo ≤ 1 — index 0 and 1 are not prime',
        'Linear sieve: the break condition "p > spf[i]" is critical — without it you lose the O(N) guarantee',
        'Using boolean[] for huge N wastes memory — use Uint8Array or bitset for N > 10^7',
      ],
      interviewTips: [
        'Classic sieve is expected knowledge — be ready to write it from memory in 2 minutes',
        'Mention the SPF trick when asked about fast factorization — it shows depth beyond basic sieving',
        'Segmented sieve is the answer to "primes in [10^9, 10^9 + 10^6]" — interviewers love this range constraint',
      ],
      proTip:
        'For competitive programming, pre-compute SPF up to 10^7 at program start. This gives you O(log N) factorization for any query — faster than trial division and trivial to implement.',
    },

    // ── 3. Prime Factorization ─────────────────────────────────────────────
    {
      id: 'prime-factorization',
      name: 'Prime Factorization',
      difficulty: 'intermediate',
      description:
        'Every integer > 1 has a unique prime factorization (Fundamental Theorem of Arithmetic). Trial division checks factors up to √N and works well for N up to ~10^12. For larger numbers, Pollard\'s rho algorithm uses cycle detection in a pseudo-random sequence modulo N to find non-trivial factors probabilistically in expected O(N^{1/4}) time. Combined with Miller-Rabin primality testing, Pollard\'s rho can factorize numbers up to 10^18.',
      keyPoints: [
        'Trial division: iterate from 2 to √N, divide out each prime factor completely before moving on',
        'Optimization: check 2 separately, then only odd numbers, or use a 6k±1 wheel',
        'SPF sieve factorization: O(log N) per query after O(N) precomputation — best for many queries ≤ N',
        'Pollard\'s rho: random walk x → (x² + c) mod N, detect cycle with Floyd or Brent, gcd reveals factor',
        'Miller-Rabin: probabilistic primality test, deterministic for N < 3.3×10^24 with specific witness sets',
        'Factorization applications: divisor count, divisor sum, Euler totient, Mobius function',
        'Number of divisors of N = Π(e_i + 1) where N = Π(p_i^e_i)',
      ],
      codeExamples: [
        {
          title: 'Trial Division with 6k±1 Wheel and Pollard\'s Rho',
          language: 'typescript',
          code: `// Trial division with 6k±1 optimization
function trialDivision(n: number): Map<number, number> {
  const factors = new Map<number, number>();
  const addFactor = (p: number) => {
    let count = 0;
    while (n % p === 0) { n /= p; count++; }
    if (count > 0) factors.set(p, count);
  };

  addFactor(2);
  addFactor(3);
  for (let i = 5; i * i <= n; i += 6) {
    addFactor(i);       // 6k - 1
    addFactor(i + 2);   // 6k + 1
  }
  if (n > 1) factors.set(n, 1); // remaining prime
  return factors;
}

// Miller-Rabin primality test (deterministic for n < 3.3e24 with these witnesses)
function millerRabin(n: bigint): boolean {
  if (n < 2n) return false;
  if (n < 4n) return true;
  if (n % 2n === 0n) return false;

  let d = n - 1n;
  let r = 0;
  while (d % 2n === 0n) { d >>= 1n; r++; }

  const witnesses = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  for (const a of witnesses) {
    if (a >= n) continue;
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let composite = true;
    for (let i = 0; i < r - 1; i++) {
      x = x * x % n;
      if (x === n - 1n) { composite = false; break; }
    }
    if (composite) return false;
  }
  return true;
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp & 1n) result = result * base % mod;
    exp >>= 1n;
    base = base * base % mod;
  }
  return result;
}

// Pollard's Rho factorization
function pollardRho(n: bigint): bigint {
  if (n % 2n === 0n) return 2n;
  const abs = (x: bigint) => (x < 0n ? -x : x);

  while (true) {
    let x = BigInt(Math.floor(Math.random() * Number(n - 2n))) + 2n;
    let y = x;
    const c = BigInt(Math.floor(Math.random() * Number(n - 1n))) + 1n;
    let d = 1n;

    while (d === 1n) {
      x = (x * x + c) % n;
      y = (y * y + c) % n;
      y = (y * y + c) % n;
      d = gcdBig(abs(x - y), n);
    }

    if (d !== n) return d;
  }
}

function gcdBig(a: bigint, b: bigint): bigint {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

// Full factorization using Pollard's Rho + Miller-Rabin
function factorizeLarge(n: bigint): Map<bigint, number> {
  const factors = new Map<bigint, number>();
  const queue: bigint[] = [n];

  while (queue.length > 0) {
    let val = queue.pop()!;
    if (val <= 1n) continue;
    if (millerRabin(val)) {
      factors.set(val, (factors.get(val) ?? 0) + 1);
      continue;
    }
    const divisor = pollardRho(val);
    queue.push(divisor);
    queue.push(val / divisor);
  }
  return factors;
}

console.log(trialDivision(360));       // Map { 2=>3, 3=>2, 5=>1 }
console.log(trialDivision(997));       // Map { 997=>1 } (prime)
console.log(factorizeLarge(1000000007n * 998244353n));
// Map { 1000000007n => 1, 998244353n => 1 }`,
          explanation:
            'Trial division with the 6k±1 wheel skips multiples of 2 and 3 automatically. Pollard\'s rho uses Floyd\'s cycle detection in a pseudo-random sequence mod N — when gcd(|x-y|, N) gives a non-trivial factor, we recurse. Miller-Rabin with 12 witnesses is deterministic for all practical ranges.',
        },
      ],
      complexity: {
        time: 'O(√N) trial division, O(N^{1/4}) Pollard\'s rho expected',
        space: 'O(log N) for factor storage',
      },
      commonPitfalls: [
        'Forgetting the remaining factor > 1 after the trial division loop — it is a prime factor',
        'Pollard\'s rho can return N itself — must retry with different c value',
        'Using Number instead of BigInt for N > 2^53 causes silent precision loss',
        'Not dividing out small factors first before running Pollard\'s rho wastes cycles',
      ],
      interviewTips: [
        'Trial division is sufficient for most interviews — know it cold with the 6k±1 optimization',
        'Mentioning Pollard\'s rho demonstrates CP-level knowledge — explain the birthday paradox connection',
        'Divisor count/sum from factorization is a common follow-up — have the formula ready',
      ],
      proTip:
        'For competitive programming: trial-divide by 2, 3 first, then use SPF sieve up to 10^7, and fall back to Pollard\'s rho only for factors > 10^7. This hybrid approach handles virtually any input range.',
    },

    // ── 4. Modular Arithmetic ──────────────────────────────────────────────
    {
      id: 'modular-arithmetic',
      name: 'Modular Arithmetic',
      difficulty: 'intermediate',
      description:
        'Modular arithmetic keeps intermediate results bounded, essential when dealing with combinatorics, hashing, and cryptography. The key insight is that (a op b) mod m = ((a mod m) op (b mod m)) mod m for +, -, and *. Division requires the modular inverse, computed via extended GCD when m is coprime to the divisor, or via Fermat\'s little theorem when m is prime. The Chinese Remainder Theorem reconstructs a number from its remainders modulo pairwise coprime moduli.',
      keyPoints: [
        '(a + b) % m = ((a % m) + (b % m)) % m — works for addition and multiplication',
        'Subtraction: ((a % m) - (b % m) + m) % m — the +m prevents negative results',
        'Division: multiply by modular inverse — a/b mod m = a * b^{-1} mod m',
        'Modular inverse exists iff gcd(b, m) = 1; for prime m: b^{-1} = b^{m-2} mod m (Fermat)',
        'Extended GCD gives inverse for any coprime m: if bx + my = 1, then b^{-1} = x mod m',
        'CRT: given x ≡ r_i (mod m_i) for pairwise coprime m_i, unique solution mod Π(m_i)',
        'Garner\'s algorithm computes CRT iteratively, avoiding BigInt overflow',
        'All CP problems with "answer mod 10^9+7" expect you to use modular arithmetic throughout',
      ],
      codeExamples: [
        {
          title: 'Modular Operations, Inverse, and Chinese Remainder Theorem',
          language: 'typescript',
          code: `const MOD = 1_000_000_007;

// Safe modular operations
function modAdd(a: number, b: number, m = MOD): number {
  return ((a % m) + (b % m)) % m;
}

function modSub(a: number, b: number, m = MOD): number {
  return (((a % m) - (b % m)) + m) % m;
}

function modMul(a: number, b: number, m = MOD): number {
  // For numbers up to ~10^9, a%m * b%m fits in 2^53
  return Number(BigInt(a % m) * BigInt(b % m) % BigInt(m));
}

// Fast power: a^b mod m in O(log b)
function modPow(a: number, b: number, m = MOD): number {
  let result = 1;
  a %= m;
  while (b > 0) {
    if (b & 1) result = modMul(result, a, m);
    a = modMul(a, a, m);
    b >>= 1;
  }
  return result;
}

// Modular inverse via Fermat's little theorem (m must be prime)
function modInverse(a: number, m = MOD): number {
  return modPow(a, m - 2, m);
}

// Modular inverse via Extended GCD (works for any coprime m)
function modInverseExtGcd(a: number, m: number): number {
  function extGcd(a: number, b: number): [number, number, number] {
    if (b === 0) return [a, 1, 0];
    const [g, x1, y1] = extGcd(b, a % b);
    return [g, y1, x1 - Math.floor(a / b) * y1];
  }
  const [g, x] = extGcd(((a % m) + m) % m, m);
  if (g !== 1) throw new Error('Inverse does not exist');
  return ((x % m) + m) % m;
}

// Chinese Remainder Theorem — pairwise coprime moduli
function crt(remainders: number[], moduli: number[]): bigint {
  const n = remainders.length;
  const M = moduli.reduce((acc, m) => acc * BigInt(m), 1n);
  let result = 0n;

  for (let i = 0; i < n; i++) {
    const mi = BigInt(moduli[i]);
    const Mi = M / mi;
    // Find Mi^{-1} mod mi using extGcd
    const inv = modInvBig(Mi, mi);
    result = (result + BigInt(remainders[i]) * Mi % M * inv % M) % M;
  }
  return (result + M) % M;
}

function modInvBig(a: bigint, m: bigint): bigint {
  function extGcd(a: bigint, b: bigint): [bigint, bigint] {
    if (b === 0n) return [1n, 0n];
    const [x1, y1] = extGcd(b, a % b);
    return [y1, x1 - (a / b) * y1];
  }
  const [x] = extGcd(((a % m) + m) % m, m);
  return ((x % m) + m) % m;
}

console.log(modPow(2, 10, MOD));       // 1024
console.log(modInverse(2, MOD));       // 500000004 (2 * 500000004 % MOD = 1)
console.log(modMul(500000004, 2));     // 1

// x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)  =>  x = 23
console.log(crt([2, 3, 2], [3, 5, 7])); // 23n`,
          explanation:
            'Modular add/sub/mul handle intermediate results safely. modPow uses binary exponentiation. Inverse via Fermat (prime mod) or extGcd (any coprime mod). CRT reconstructs a value from multiple modular constraints — essential for multi-prime problems.',
        },
      ],
      complexity: {
        time: 'O(log b) for modPow, O(log m) for inverse, O(k log M) for CRT with k equations',
        space: 'O(1) for modular ops, O(k) for CRT',
      },
      commonPitfalls: [
        'Subtraction without +m can produce negative values — always add m before final mod',
        'Multiplying two 10^9 numbers exceeds 2^53 — use BigInt for intermediate products',
        'Modular inverse does not exist if gcd(a, m) ≠ 1 — check or ensure prime m',
        'Forgetting to take mod at every step causes overflow even if final answer fits',
      ],
      interviewTips: [
        '"Answer mod 10^9+7" is your cue to use modular arithmetic — build a mod toolkit upfront',
        'Know both Fermat and extGcd approaches to inverse — some problems use composite moduli',
        'CRT appears in problems with multiple constraints — recognize the pattern of "remainder conditions"',
      ],
      proTip:
        'Pre-compute a table of factorials and inverse factorials mod p up to your max N at startup. This gives O(1) nCr queries and pays for itself after just 2-3 combination lookups.',
    },

    // ── 5. Fast Power / Binary Exponentiation ─────────────────────────────
    {
      id: 'fast-power',
      name: 'Fast Power & Matrix Exponentiation',
      difficulty: 'intermediate',
      description:
        'Binary exponentiation computes a^n in O(log n) multiplications by squaring the base and processing exponent bits. When the "base" is a matrix, the same technique computes M^n in O(k³ log n) where k is the matrix dimension — this transforms any linear recurrence (Fibonacci, Tribonacci, or custom) into an O(log n) computation. Matrix exponentiation is the canonical technique for computing the N-th term of a linear recurrence when N is astronomically large (up to 10^18).',
      keyPoints: [
        'Binary exponentiation: if bit i of n is set, multiply result by base^(2^i)',
        'Iterative version: square base each step, multiply into result when bit is 1',
        'Matrix multiplication: (AB)_{ij} = Σ A_{ik} * B_{kj} — O(k³) for k×k matrices',
        'Any linear recurrence f(n) = Σ c_i * f(n-i) maps to a companion matrix',
        'Fibonacci: [[1,1],[1,0]]^n gives [F(n+1), F(n); F(n), F(n-1)]',
        'Matrix exponentiation handles recurrences with constant additive terms too — extend the matrix',
        'Modular matrix exponentiation: apply mod after each multiplication to prevent overflow',
        'Applications: Fibonacci in O(log n), counting paths of length n in a graph, linear recurrence sequences',
      ],
      codeExamples: [
        {
          title: 'Binary Exponentiation and Matrix Exponentiation for Linear Recurrences',
          language: 'typescript',
          code: `const MOD = 1_000_000_007;

// Scalar binary exponentiation
function fastPow(base: number, exp: number, mod = MOD): number {
  let result = 1;
  base %= mod;
  while (exp > 0) {
    if (exp & 1) result = Number(BigInt(result) * BigInt(base) % BigInt(mod));
    base = Number(BigInt(base) * BigInt(base) % BigInt(mod));
    exp >>= 1;
  }
  return result;
}

// Matrix type: 2D array
type Matrix = number[][];

function matMul(A: Matrix, B: Matrix, mod = MOD): Matrix {
  const n = A.length;
  const m = B[0].length;
  const k = B.length;
  const C: Matrix = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      let sum = 0n;
      for (let p = 0; p < k; p++) {
        sum += BigInt(A[i][p]) * BigInt(B[p][j]);
      }
      C[i][j] = Number(sum % BigInt(mod));
    }
  }
  return C;
}

function matPow(M: Matrix, exp: number, mod = MOD): Matrix {
  const n = M.length;
  let result: Matrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
  while (exp > 0) {
    if (exp & 1) result = matMul(result, M, mod);
    M = matMul(M, M, mod);
    exp >>= 1;
  }
  return result;
}

// Fibonacci in O(log n) via matrix exponentiation
function fibonacci(n: number): number {
  if (n <= 1) return n;
  const M: Matrix = [[1, 1], [1, 0]];
  const result = matPow(M, n - 1);
  return result[0][0]; // F(n)
}

// General linear recurrence: f(n) = c0*f(n-1) + c1*f(n-2) + ... + c_{k-1}*f(n-k)
function linearRecurrence(
  coeffs: number[],  // [c0, c1, ..., c_{k-1}]
  initial: number[], // [f(0), f(1), ..., f(k-1)]
  n: number,
  mod = MOD
): number {
  const k = coeffs.length;
  if (n < k) return initial[n] % mod;

  // Build companion matrix
  const M: Matrix = Array.from({ length: k }, () => new Array(k).fill(0));
  for (let j = 0; j < k; j++) M[0][j] = coeffs[j] % mod;
  for (let i = 1; i < k; i++) M[i][i - 1] = 1;

  const result = matPow(M, n - k + 1, mod);

  let ans = 0n;
  for (let j = 0; j < k; j++) {
    ans += BigInt(result[0][j]) * BigInt(initial[k - 1 - j] % mod);
  }
  return Number(ans % BigInt(mod));
}

console.log(fibonacci(10));      // 55
console.log(fibonacci(50));      // 12586269025 mod MOD = 586268941

// Tribonacci: f(n) = f(n-1) + f(n-2) + f(n-3), f(0)=0, f(1)=0, f(2)=1
console.log(linearRecurrence([1, 1, 1], [0, 0, 1], 10)); // 81`,
          explanation:
            'Scalar fastPow processes exponent bits right-to-left. Matrix exponentiation generalizes this: the companion matrix encodes the recurrence coefficients, and M^n gives the n-th term. The linearRecurrence function works for any k-th order recurrence — just supply coefficients and initial values.',
        },
      ],
      complexity: {
        time: 'O(log n) scalar, O(k³ log n) matrix for k×k companion matrix',
        space: 'O(k²) for matrix storage',
      },
      commonPitfalls: [
        'Not using BigInt for intermediate matrix multiplication — two 10^9 values multiplied overflow Number',
        'Off-by-one in matrix power: M^(n-1) gives F(n), not M^n — verify base cases',
        'Companion matrix row order matters — wrong layout gives wrong recurrence',
        'Forgetting the identity matrix as the "1" element for matrix exponentiation',
      ],
      interviewTips: [
        'Fibonacci via matrix exponentiation is a classic interview question — derive the matrix on the board',
        'For "compute the N-th term where N ≤ 10^18", matrix exponentiation is almost always the answer',
        'Mention that graph path counting (adjacency matrix to the power n) uses the same technique',
      ],
      proTip:
        'When a DP recurrence has the form dp[i] = linear combination of dp[i-1..i-k] with fixed coefficients, it is a linear recurrence. Converting the DP to matrix exponentiation drops time from O(N*k) to O(k³ log N) — game-changing when N is huge.',
    },

    // ── 6. Combinatorics ───────────────────────────────────────────────────
    {
      id: 'combinatorics',
      name: 'Combinatorics',
      difficulty: 'advanced',
      description:
        'Combinatorics counts arrangements and selections — C(n,k) = n! / (k! * (n-k)!). In modular arithmetic, we pre-compute factorial tables and their modular inverses for O(1) query time. Lucas\' theorem handles C(n,k) mod p when n and k are huge but p is small. The Catalan numbers C_n = C(2n,n)/(n+1) count balanced parentheses, BST shapes, triangulations, and dozens of other structures. Stars and bars, inclusion-exclusion, and the Burnside/Polya counting lemma round out the toolkit.',
      keyPoints: [
        'nCr mod p: precompute fact[] and invFact[] arrays, then nCr = fact[n] * invFact[k] * invFact[n-k]',
        'Inverse factorial: compute invFact[N] = modInverse(fact[N]), then invFact[i] = invFact[i+1] * (i+1)',
        'Lucas theorem: C(n,k) mod p = Π C(n_i, k_i) mod p where n_i, k_i are base-p digits',
        'Catalan number C_n: C(2n,n) - C(2n,n+1) = C(2n,n)/(n+1)',
        'Catalan counts: balanced parentheses, BST shapes, Dyck paths, polygon triangulations, stack-sortable permutations',
        'Stars and bars: distributing n identical items into k bins = C(n+k-1, k-1)',
        'Inclusion-exclusion: |A₁∪...∪Aₙ| = Σ|Aᵢ| - Σ|Aᵢ∩Aⱼ| + ... + (-1)^{n+1}|A₁∩...∩Aₙ|',
        'Derangements: D(n) = n! * Σ(-1)^k/k! for k=0..n — number of permutations with no fixed points',
      ],
      codeExamples: [
        {
          title: 'Factorial Table with Modular nCr, Lucas Theorem, and Catalan Numbers',
          language: 'typescript',
          code: `const MOD = 1_000_000_007;
const MAX_N = 200_001;

// Precompute factorials and inverse factorials
const fact = new Array(MAX_N);
const invFact = new Array(MAX_N);

function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  base %= mod;
  while (exp > 0) {
    if (exp & 1) result = Number(BigInt(result) * BigInt(base) % BigInt(mod));
    base = Number(BigInt(base) * BigInt(base) % BigInt(mod));
    exp >>= 1;
  }
  return result;
}

function precompute(): void {
  fact[0] = 1;
  for (let i = 1; i < MAX_N; i++) {
    fact[i] = Number(BigInt(fact[i - 1]) * BigInt(i) % BigInt(MOD));
  }
  invFact[MAX_N - 1] = modPow(fact[MAX_N - 1], MOD - 2, MOD);
  for (let i = MAX_N - 2; i >= 0; i--) {
    invFact[i] = Number(BigInt(invFact[i + 1]) * BigInt(i + 1) % BigInt(MOD));
  }
}
precompute();

// O(1) nCr mod p
function nCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  return Number(
    BigInt(fact[n]) * BigInt(invFact[r]) % BigInt(MOD)
    * BigInt(invFact[n - r]) % BigInt(MOD)
  );
}

// O(1) nPr mod p
function nPr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  return Number(BigInt(fact[n]) * BigInt(invFact[n - r]) % BigInt(MOD));
}

// Lucas theorem: C(n, k) mod p for small p, potentially huge n and k
function lucasNcr(n: number, k: number, p: number): number {
  if (k === 0) return 1;
  const ni = n % p;
  const ki = k % p;
  if (ki > ni) return 0;
  // Small nCr without precomputation
  let num = 1, den = 1;
  for (let i = 0; i < ki; i++) {
    num = num * (ni - i) % p;
    den = den * (i + 1) % p;
  }
  const denInv = modPow(den, p - 2, p);
  return num * denInv % p * lucasNcr(Math.floor(n / p), Math.floor(k / p), p) % p;
}

// Catalan number C_n
function catalan(n: number): number {
  return Number(
    BigInt(nCr(2 * n, n)) * BigInt(modPow(n + 1, MOD - 2, MOD)) % BigInt(MOD)
  );
}

// Derangements: D(n) = n! * Σ (-1)^k / k!
function derangements(n: number): number {
  let result = 0n;
  for (let k = 0; k <= n; k++) {
    const sign = k % 2 === 0 ? 1n : BigInt(MOD) - 1n;
    result = (result + sign * BigInt(invFact[k])) % BigInt(MOD);
  }
  return Number(result * BigInt(fact[n]) % BigInt(MOD));
}

// Stars and bars: n identical items into k distinct bins
function starsAndBars(n: number, k: number): number {
  return nCr(n + k - 1, k - 1);
}

console.log(nCr(10, 3));          // 120
console.log(nCr(100000, 50000));  // some large mod result
console.log(catalan(5));           // 42
console.log(derangements(5));      // 44
console.log(starsAndBars(5, 3));   // 21
console.log(lucasNcr(1000000000, 500000000, 13)); // C(10^9, 5*10^8) mod 13`,
          explanation:
            'Precomputing fact/invFact in O(N) gives O(1) nCr queries. The inverse factorial chain starts from the top: invFact[N] via Fermat, then invFact[i] = invFact[i+1] * (i+1). Lucas handles huge n,k with small prime p by decomposing into base-p digits. Catalan uses nCr(2n,n)/(n+1). Derangements use the inclusion-exclusion formula.',
        },
      ],
      complexity: {
        time: 'O(N) precomputation, O(1) per nCr query; O(log_p(n)) for Lucas',
        space: 'O(N) for factorial tables',
      },
      commonPitfalls: [
        'Forgetting to handle r > n or r < 0 — nCr should return 0 in these cases',
        'Building invFact top-down instead of using the chain trick — wastes O(N log MOD) on individual modPow calls',
        'Lucas only works for prime p — for composite moduli, use CRT + Lucas or direct computation',
        'Catalan: dividing by (n+1) requires modular inverse, not integer division',
      ],
      interviewTips: [
        'Know the factorial precomputation pattern cold — it appears in nearly every combinatorics problem',
        'Have 3-4 Catalan number interpretations memorized — interviewers love asking "what else does this count?"',
        'Inclusion-exclusion is the key technique for "count things NOT satisfying constraints" problems',
      ],
      proTip:
        'When you see a counting problem and the answer is 1, 1, 2, 5, 14, 42... it is Catalan. When it is 1, 0, 1, 2, 9, 44... it is derangements. Recognizing integer sequences by their first few terms is a superpower in competitive programming — bookmark OEIS.',
    },

    // ── 7. Number Theory ───────────────────────────────────────────────────
    {
      id: 'number-theory',
      name: 'Number Theory',
      difficulty: 'advanced',
      description:
        'Euler\'s totient φ(n) counts integers in [1,n] coprime to n and governs the cycle length of modular exponentiation (a^{φ(n)} ≡ 1 mod n). The Mobius function μ(n) enables inversion of summatory functions via Mobius inversion, and the inclusion-exclusion principle on divisors. Together with multiplicative function theory, these tools unlock efficient computation of GCD sums, coprime pair counting, and divisor-based DP. Understanding these is the difference between brute force and elegant O(N log N) solutions.',
      keyPoints: [
        'Euler totient: φ(n) = n * Π(1 - 1/p) for each prime p | n',
        'φ(p) = p-1 for prime p; φ(p^k) = p^k - p^{k-1}; φ is multiplicative: φ(ab) = φ(a)φ(b) when gcd(a,b)=1',
        'Euler theorem: a^{φ(n)} ≡ 1 (mod n) when gcd(a,n)=1 — generalizes Fermat',
        'Mobius function: μ(1)=1, μ(n)=(-1)^k if n is product of k distinct primes, μ(n)=0 if n has a squared factor',
        'Mobius inversion: if f(n) = Σ_{d|n} g(d), then g(n) = Σ_{d|n} μ(n/d) * f(d)',
        'Inclusion-exclusion via Mobius: count of integers ≤ N coprime to m = Σ_{d|m} μ(d) * ⌊N/d⌋',
        'Sieve-based computation: compute φ or μ for all n ≤ N in O(N log log N)',
        'Sum of gcd: Σ gcd(i,n) for i=1..n = Σ_{d|n} d * φ(n/d) — useful in many CP problems',
      ],
      codeExamples: [
        {
          title: 'Euler Totient Sieve, Mobius Sieve, and Applications',
          language: 'typescript',
          code: `// Euler's Totient for a single number
function phi(n: number): number {
  let result = n;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      while (n % p === 0) n /= p;
      result -= result / p;
    }
  }
  if (n > 1) result -= result / n;
  return result;
}

// Sieve-based Euler Totient for all values up to N
function totientSieve(n: number): number[] {
  const phi = Array.from({ length: n + 1 }, (_, i) => i);
  for (let p = 2; p <= n; p++) {
    if (phi[p] === p) { // p is prime
      for (let m = p; m <= n; m += p) {
        phi[m] -= phi[m] / p;
      }
    }
  }
  return phi;
}

// Mobius function sieve
function mobiusSieve(n: number): number[] {
  const mu = new Array(n + 1).fill(1);
  const isComposite = new Array(n + 1).fill(false);
  const primes: number[] = [];

  mu[0] = 0;
  for (let i = 2; i <= n; i++) {
    if (!isComposite[i]) {
      primes.push(i);
      mu[i] = -1; // prime has one factor
    }
    for (const p of primes) {
      if (i * p > n) break;
      isComposite[i * p] = true;
      if (i % p === 0) {
        mu[i * p] = 0; // squared factor
        break;
      }
      mu[i * p] = -mu[i]; // multiplicative
    }
  }
  return mu;
}

// Count integers in [1, N] coprime to m using Mobius
function countCoprime(N: number, m: number, mu: number[]): number {
  let count = 0;
  // Enumerate divisors of m
  const divisors: number[] = [];
  for (let d = 1; d * d <= m; d++) {
    if (m % d === 0) {
      divisors.push(d);
      if (d !== m / d) divisors.push(m / d);
    }
  }
  for (const d of divisors) {
    if (d <= mu.length - 1) {
      count += mu[d] * Math.floor(N / d);
    }
  }
  return count;
}

// Sum of gcd(i, n) for i = 1 to n
function sumGcd(n: number): number {
  let sum = 0;
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      sum += d * phi(n / d);
      if (d !== n / d) {
        sum += (n / d) * phi(d);
      }
    }
  }
  return sum;
}

const phiArr = totientSieve(20);
console.log(phiArr.slice(1, 13));
// [1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4]

const muArr = mobiusSieve(20);
console.log(muArr.slice(1, 13));
// [1, -1, -1, 0, -1, 1, -1, 0, 0, 1, -1, 0]

console.log(phi(12));         // 4  (1, 5, 7, 11)
console.log(countCoprime(100, 30, mobiusSieve(100))); // integers ≤100 coprime to 30
console.log(sumGcd(12));      // 40`,
          explanation:
            'The totient sieve modifies each multiple of a discovered prime p by the factor (1 - 1/p). The Mobius sieve leverages the linear sieve structure: μ(ip) = 0 when p|i (squared factor), otherwise -μ(i). countCoprime uses Mobius inversion on divisors of m. sumGcd uses the identity Σ gcd(i,n) = Σ_{d|n} d*φ(n/d).',
        },
      ],
      complexity: {
        time: 'O(N log log N) sieve, O(√n) single totient, O(√m) for countCoprime',
        space: 'O(N) for sieves',
      },
      commonPitfalls: [
        'Totient sieve: the division phi[m] / p must be exact (integer) — it always is, but using floating point can cause rounding errors',
        'Mobius sieve: forgetting mu[0] = 0 or mu[1] = 1 corrupts all subsequent values',
        'Euler theorem requires gcd(a,n)=1 — applying it blindly when a shares a factor with n gives wrong results',
        'Confusing φ(n) (count of coprimes) with π(n) (count of primes) — very different functions',
      ],
      interviewTips: [
        'Euler totient appears in problems about "count coprime pairs" and "reduced fractions in [0,1]"',
        'Mobius inversion is the key to efficient GCD-sum and coprime-counting problems — practice the divisor-sum transformation',
        'Know that Σ φ(d) for d|n equals n — this identity is used surprisingly often',
      ],
      proTip:
        'When you need to sum f(gcd(i,j)) over all pairs (i,j) in [1,N]², the standard technique is to swap the sum: fix g = gcd, count pairs with that gcd using Mobius, and sum over g. This reduces O(N²) to O(N log N) or even O(N√N) — the "Mobius inversion on GCD" pattern.',
    },

    // ── 8. Probability & Expected Value ────────────────────────────────────
    {
      id: 'probability-expected-value',
      name: 'Probability & Expected Value in Algorithms',
      difficulty: 'advanced',
      description:
        'Probabilistic reasoning appears in randomized algorithms (QuickSort pivot analysis, skip lists, hash collision analysis), expected-value DP, and competitive programming problems. Linearity of expectation — E[X+Y] = E[X] + E[Y] regardless of dependence — is the single most powerful tool: it lets you decompose complex expectations into simple indicator-variable sums. Expected-value DP extends standard DP by computing E[cost to reach goal] instead of a deterministic optimum.',
      keyPoints: [
        'Linearity of expectation: E[X₁ + X₂ + ... + Xₙ] = E[X₁] + ... + E[Xₙ] — always holds, even for dependent variables',
        'Indicator variables: X_i = 1 if event i occurs, 0 otherwise; E[X_i] = P(event i)',
        'Coupon collector: expected time to collect all n types = n * H(n) = n * Σ(1/k) for k=1..n',
        'Geometric distribution: expected trials until first success = 1/p',
        'Expected-value DP: E[state] = Σ P(transition) * (cost + E[next_state])',
        'Randomized algorithms: QuickSort expected O(n log n) via linearity over comparison indicators',
        'Markov chains: stationary distribution, expected hitting time, absorbing states',
        'Modular expected value: compute numerator and denominator mod p, result = num * modInverse(den)',
      ],
      codeExamples: [
        {
          title: 'Expected Value DP, Coupon Collector, and Modular Probability',
          language: 'typescript',
          code: `const MOD = 998244353; // common mod for probability problems

function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  base %= mod;
  while (exp > 0) {
    if (exp & 1) result = Number(BigInt(result) * BigInt(base) % BigInt(mod));
    base = Number(BigInt(base) * BigInt(base) % BigInt(mod));
    exp >>= 1;
  }
  return result;
}

function modInv(a: number, mod: number): number {
  return modPow(a, mod - 2, mod);
}

function modDiv(a: number, b: number, mod: number): number {
  return Number(BigInt(a) * BigInt(modInv(b, mod)) % BigInt(mod));
}

// Coupon collector: expected coupons to collect all n types
// E = n * (1/1 + 1/2 + ... + 1/n) = n * H(n)
function couponCollector(n: number): number {
  // Return as modular fraction
  let result = 0;
  for (let k = 1; k <= n; k++) {
    // Add n/k mod MOD = n * modInv(k)
    result = (result + Number(BigInt(n) * BigInt(modInv(k, MOD)) % BigInt(MOD))) % MOD;
  }
  return result;
}

// Expected value DP: dice rolls to reach target sum
// From state s, roll 1..6 uniformly; reach s+1..s+6
// E[target] = 0, E[s] = 1 + (1/6) * Σ E[s+i] for i=1..6
function expectedDiceRolls(target: number): number {
  // E[i] = expected rolls from sum i to reach ≥ target
  const E = new Array(target + 7).fill(0);
  // States ≥ target have E = 0 (already done)
  for (let s = target - 1; s >= 0; s--) {
    // E[s] = 1 + (1/6) * Σ_{i=1}^{6} E[s+i]
    let sum = 0;
    for (let i = 1; i <= 6; i++) {
      sum = (sum + E[s + i]) % MOD;
    }
    E[s] = (1 + Number(BigInt(sum) * BigInt(modInv(6, MOD)) % BigInt(MOD))) % MOD;
  }
  return E[0];
}

// Random walk: expected steps to reach N from 0
// At each step: move +1 with prob p, move -1 with prob 1-p
// For p = 0.5 (unbiased): E[steps to reach N from 0] = N^2
// For biased: E = N/(2p-1) when p > 0.5 (absorbing barrier at N)
function randomWalkExpected(N: number, pNum: number, pDen: number): number {
  // p = pNum/pDen in modular arithmetic
  const p = modDiv(pNum, pDen, MOD);
  const q = (MOD + 1 - p) % MOD;

  // Check if p == q (unbiased): E = N^2
  if (p === q) {
    return Number(BigInt(N) * BigInt(N) % BigInt(MOD));
  }

  // Biased: E = N / (p - q) when p > q
  const pMinusQ = (p - q + MOD) % MOD;
  return Number(BigInt(N) * BigInt(modInv(pMinusQ, MOD)) % BigInt(MOD));
}

// Linearity of expectation example:
// Expected number of fixed points in a random permutation of n elements
// E[fixed points] = Σ E[X_i] = Σ P(π(i)=i) = n * (1/n) = 1
function expectedFixedPoints(n: number): number {
  // Always 1, regardless of n — beautiful application of linearity
  return 1;
}

// Expected-value DP: frog on lily pads
// Frog at pad i jumps to pad i+1..i+k uniformly; reach pad n
// E[n] = 0, E[i] = 1 + (1/k) * Σ_{j=1}^{k} E[i+j]
function frogExpected(n: number, k: number): number {
  const E = new Array(n + k + 1).fill(0);
  const invK = modInv(k, MOD);
  let windowSum = 0;

  for (let i = n - 1; i >= 0; i--) {
    // E[i] = 1 + windowSum / k
    // windowSum = E[i+1] + E[i+2] + ... + E[i+k]
    windowSum = (windowSum + E[i + 1]) % MOD;
    if (i + k + 1 <= n + k) {
      windowSum = (windowSum - E[i + k + 1] + MOD) % MOD;
    }
    E[i] = (1 + Number(BigInt(windowSum) * BigInt(invK) % BigInt(MOD))) % MOD;
  }
  return E[0];
}

console.log(couponCollector(10));        // E ≈ 29.29 as mod value
console.log(expectedDiceRolls(10));      // expected rolls to reach sum ≥ 10
console.log(expectedFixedPoints(1000));  // always 1
console.log(frogExpected(10, 3));        // frog: 10 pads, jump 1-3`,
          explanation:
            'Coupon collector sums n/k for k=1..n using modular inverses. Dice DP works backwards: E[s] = 1 + average of E[s+1..s+6]. The frog problem uses a sliding window to maintain the sum efficiently. All computations use modular arithmetic with inverse division, as probability problems often require answers mod a prime.',
        },
      ],
      complexity: {
        time: 'O(N) for most expected-value DPs, O(N) coupon collector',
        space: 'O(N) for DP tables',
      },
      commonPitfalls: [
        'Forgetting that linearity of expectation works even for dependent variables — do not try to compute independence',
        'Expected-value DP: transitions must sum to probability 1 — missing or double-counting transitions corrupts the answer',
        'Modular probability: 1/2 mod p is modInv(2, p), not 0.5 — never use floating point',
        'Absorbing-state Markov chains need careful setup — ensure all states eventually reach the absorbing state',
      ],
      interviewTips: [
        'Linearity of expectation is almost always the key insight — decompose into indicator variables first',
        'Coupon collector and geometric distribution are the two most-tested expected value patterns',
        'Expected-value DP is "just DP" with probabilities as transition weights — frame it that way in interviews',
      ],
      proTip:
        'When a problem says "output the answer as P/Q mod 998244353", it means compute P * Q^{-1} mod 998244353. The mod 998244353 = 119 * 2^23 + 1 is chosen because it is NTT-friendly — if you see it, the problem might also involve polynomial multiplication.',
    },
  ],
};
