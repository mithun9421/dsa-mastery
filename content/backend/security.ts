// @ts-nocheck
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

interface CodeExample {
  language: string
  label: string
  code: string
}

interface Concept {
  id: string
  title: string
  description: string
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

export const backendSecurityCategory: Category = {
  id: 'security',
  title: 'Backend Security',
  description: 'SQL injection, XSS, CSRF, SSRF, mass assignment, rate limiting, security headers, dependency security, and secrets management. The OWASP Top 10 from the perspective of someone who has to actually defend against them.',
  icon: '🛡️',
  concepts: [
    {
      id: 'sql-injection',
      title: 'SQL Injection',
      description: 'SQL injection is the OG web vulnerability — and still in the OWASP Top 10 after 25 years. An attacker injects SQL code through user input that gets concatenated into a query. The fix is parameterized queries (always). The nuance is that ORMs do NOT fully protect you (raw queries exist), second-order injection can bypass input sanitization, and blind SQLi can exfiltrate data without visible error messages.',
      keyPoints: [
        'ALWAYS use parameterized queries (prepared statements): the database treats parameters as data, never as SQL code',
        'String concatenation is the root cause: "SELECT * FROM users WHERE id = " + userId is injectable if userId = "1 OR 1=1"',
        'ORM protection is partial: ORM query builders are safe, but raw queries (prisma.$queryRawUnsafe, sequelize.query) are not',
        'Second-order injection: malicious data stored safely, then used unsafely later in a different query. Input sanitization at storage time is not enough',
        'Blind SQL injection: no visible output, but attacker infers data through timing (SLEEP(5)) or boolean conditions (page loads vs error)',
        'UNION-based injection: attacker appends UNION SELECT to extract data from other tables',
        'Defense in depth: parameterized queries (primary), least privilege DB user (limit damage), WAF rules (detect patterns), input validation (reject suspicious input)',
        'Never build dynamic table or column names from user input — parameterized queries only protect values, not identifiers. Allowlist identifiers',
        'Stored procedures are NOT inherently safe — they can contain dynamic SQL that is injectable',
        'Test with sqlmap or manual payloads: \' OR 1=1 --, \' UNION SELECT null, version() --, \' AND SLEEP(5) --'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'SQL Injection Vulnerable vs Safe Code',
          code: `// VULNERABLE: string concatenation
async function getUserUnsafe(email: string): Promise<User | null> {
  // If email = "' OR 1=1 --", this returns ALL users
  const result = await db.query(
    \`SELECT * FROM users WHERE email = '\${email}'\`
  );
  return result.rows[0];
}

// SAFE: parameterized query (pg library)
async function getUserSafe(email: string): Promise<User | null> {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email] // $1 is always treated as a string value, never SQL
  );
  return result.rows[0];
}

// SAFE: Prisma query builder
async function getUserPrisma(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

// DANGEROUS: Prisma raw query (UNSAFE version)
async function searchUnsafe(term: string) {
  // $queryRawUnsafe does NOT parameterize — injectable!
  return prisma.$queryRawUnsafe(
    \`SELECT * FROM products WHERE name LIKE '%\${term}%'\`
  );
}

// SAFE: Prisma raw query (tagged template)
async function searchSafe(term: string) {
  // $queryRaw with tagged template IS parameterized
  return prisma.$queryRaw\`
    SELECT * FROM products WHERE name LIKE \${\`%\${term}%\`}
  \`;
}

// SAFE: Dynamic column names with allowlist
const ALLOWED_SORT_COLUMNS = ['name', 'created_at', 'price'] as const;
type SortColumn = typeof ALLOWED_SORT_COLUMNS[number];

async function listProducts(sortBy: string, order: 'asc' | 'desc') {
  // Validate column name against allowlist (NOT parameterizable)
  if (!ALLOWED_SORT_COLUMNS.includes(sortBy as SortColumn)) {
    throw new Error('Invalid sort column');
  }
  // Order direction also allowlisted (only 'asc' or 'desc')
  const safeOrder = order === 'desc' ? 'DESC' : 'ASC';

  return prisma.$queryRaw\`
    SELECT id, name, price FROM products
    ORDER BY \${Prisma.raw(sortBy)} \${Prisma.raw(safeOrder)}
  \`;
}`
        }
      ],
      useCases: [
        'Every database-backed application — SQL injection is universally applicable wherever SQL is used',
        'Search features with dynamic filters — common injection point',
        'Admin panels with dynamic reporting queries — often use raw SQL for flexibility',
        'Legacy applications being modernized — old code may use string concatenation'
      ],
      commonPitfalls: [
        'Thinking ORMs make you immune — raw queries, dynamic identifiers, and second-order injection bypass ORM protection',
        'Using string sanitization instead of parameterized queries — sanitization is fragile and encoding-dependent',
        'Dynamic ORDER BY with user input — column names cannot be parameterized, must be allowlisted',
        'LIKE queries with unescaped wildcards: user sends "%" and matches everything. Escape % and _ in LIKE parameters',
        'Stored procedures with dynamic SQL inside — the injection just moves to the procedure'
      ],
      interviewTips: [
        'Explain the mechanics: string concatenation puts user input INTO the SQL syntax. Parameterized queries put it into a data slot',
        'Walk through UNION injection: \' UNION SELECT username, password FROM users -- appends a second query\'s results',
        'Discuss blind SQLi: no visible output, but "SELECT IF(1=1, SLEEP(5), 0)" causes a 5-second delay, leaking one bit of information per request',
        'Defense in depth: parameterized queries (prevent), least privilege DB user (limit blast radius), WAF (detect), monitoring (respond)'
      ],
      relatedConcepts: ['xss-prevention', 'mass-assignment', 'request-validation'],
      difficulty: 'intermediate',
      tags: ['sql-injection', 'security', 'owasp', 'parameterized-queries', 'database'],
      proTip: 'Prisma\'s tagged template literal ($queryRaw`...`) looks like string interpolation but is actually parameterized under the hood. The template tag converts interpolated values into $1, $2 parameters. Prisma.$queryRawUnsafe(string) does NOT do this. The naming convention is your clue: "Unsafe" means "you are responsible for parameterization."'
    },
    {
      id: 'xss-prevention',
      title: 'XSS Prevention',
      description: 'Cross-Site Scripting (XSS) injects malicious JavaScript into web pages viewed by other users. The attacker\'s script runs with the victim\'s session, able to steal cookies, redirect to phishing pages, or modify page content. The fix is context-sensitive output encoding: HTML context needs HTML encoding, JavaScript context needs JS encoding, URL context needs URL encoding. CSP headers provide a second layer of defense.',
      keyPoints: [
        'Stored XSS: malicious script saved to database (comment, profile bio), served to every user who views that content',
        'Reflected XSS: malicious script in URL parameter, reflected back in the page without encoding. Requires victim to click a crafted link',
        'DOM-based XSS: client-side JavaScript reads from URL/DOM and writes to DOM without sanitization. Server never sees the payload',
        'Output encoding must be context-sensitive: HTML entity encoding for HTML body, JS encoding for inline scripts, URL encoding for href attributes',
        'CSP (Content-Security-Policy) header: restrict which scripts can execute. script-src \'self\' blocks all inline scripts and external scripts from other domains',
        'DOMPurify: the standard library for sanitizing HTML. Allows safe tags (b, i, a) while removing dangerous ones (script, onerror)',
        'HttpOnly cookies: JavaScript cannot access HttpOnly cookies, so XSS cannot steal session tokens stored this way',
        'Trusted Types (Chrome): browser-level API that requires sanitization before assigning to dangerous sinks (innerHTML, document.write)',
        'React/Vue/Angular auto-escape by default — but dangerouslySetInnerHTML (React) and v-html (Vue) bypass this protection',
        'Never use eval(), innerHTML with user data, or document.write() with unsanitized input'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'XSS Prevention: CSP Headers + Sanitization',
          code: `import DOMPurify from 'isomorphic-dompurify';
import helmet from 'helmet';
import express from 'express';

const app = express();

// CSP headers via Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // no 'unsafe-inline', no 'unsafe-eval'
      styleSrc: ["'self'", "'unsafe-inline'"], // inline styles often needed
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.example.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"], // prevents clickjacking (replaces X-Frame-Options)
    },
  },
}));

// Sanitize user-generated HTML (e.g., rich text editor output)
function sanitizeUserHtml(dirtyHtml: string): string {
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

// Store sanitized HTML
router.post('/comments', async (req: Request, res: Response) => {
  const sanitizedBody = sanitizeUserHtml(req.body.content);
  const comment = await prisma.comment.create({
    data: {
      content: sanitizedBody,
      userId: req.user.id,
      postId: req.body.postId,
    },
  });
  res.status(201).json({ data: comment });
});

// Context-sensitive encoding for server-rendered pages
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// In server-rendered HTML:
// <p>Comment by: \${escapeHtml(user.name)}</p>
// <a href="/user/\${encodeURIComponent(user.id)}">Profile</a>`
        }
      ],
      useCases: [
        'Any application that displays user-generated content (comments, profiles, messages)',
        'Rich text editors where users can format content (blog posts, wikis, forums)',
        'Search results that reflect the query in the page',
        'Error pages that display request parameters'
      ],
      commonPitfalls: [
        'Using dangerouslySetInnerHTML or v-html without sanitization — bypasses framework auto-escaping',
        'Encoding for the wrong context: HTML encoding in a JavaScript context does not prevent injection',
        'CSP with unsafe-inline — this single directive negates most of CSP\'s XSS protection',
        'Sanitizing input on storage but not on output — what if the sanitization logic had a bug? Encode on output as defense in depth',
        'Thinking React prevents all XSS — href="javascript:alert(1)" and dangerouslySetInnerHTML are still vectors'
      ],
      interviewTips: [
        'Name the three types: stored (persistent), reflected (URL-based), DOM-based (client-only). Explain how each works',
        'Discuss defense layers: output encoding (primary), CSP headers (secondary), HttpOnly cookies (limit damage), DOMPurify (HTML sanitization)',
        'Explain why CSP is powerful: even if XSS exists, script-src \'self\' prevents the injected script from loading external payloads',
        'Mention that modern frameworks (React, Vue, Angular) auto-escape by default, but have escape hatches that developers misuse'
      ],
      relatedConcepts: ['csrf-protection', 'security-headers', 'sql-injection'],
      difficulty: 'intermediate',
      tags: ['xss', 'security', 'csp', 'sanitization', 'owasp'],
      proTip: 'CSP reporting mode (Content-Security-Policy-Report-Only) lets you deploy CSP without blocking anything — violations are reported to your endpoint. Use this to discover what CSP breaks before enforcing it. GitHub and Dropbox used report-only for months before switching to enforcement.'
    },
    {
      id: 'csrf-protection',
      title: 'CSRF Protection',
      description: 'Cross-Site Request Forgery (CSRF) tricks a logged-in user\'s browser into making requests to your application. The browser automatically includes cookies (including session cookies), so the request appears authenticated. The simplest modern defense is SameSite=Strict on cookies — the browser will not send the cookie on cross-origin requests. For older browsers or Lax mode, use CSRF tokens (double submit pattern) or check the Origin header.',
      keyPoints: [
        'The attack: user is logged into bank.com. Attacker\'s page loads <img src="bank.com/transfer?to=attacker&amount=1000">. Browser sends session cookie. Transfer executes',
        'SameSite=Strict: cookie is NEVER sent on cross-site requests. Most effective CSRF protection. Breaks cross-site navigation (links from email do not send cookies)',
        'SameSite=Lax (default in modern browsers): cookie sent on top-level GET navigation (links) but NOT on POST, images, iframes from other sites. Good balance',
        'CSRF token (Synchronizer Token Pattern): server generates random token per session, embeds in forms/meta tag. POST requests include the token. Server validates',
        'Double Submit Cookie: CSRF token in both a cookie AND a request header. Server checks they match. Works without server-side state',
        'Origin/Referer header check: server rejects requests where Origin does not match the expected domain. Simple but relies on browser sending the header',
        'CSRF does NOT affect APIs using Bearer tokens in Authorization header — browsers do not auto-send Authorization headers, only cookies',
        'CSRF tokens must be per-session (or per-request for higher security), cryptographically random, and validated on every state-changing request',
        'GET requests should NEVER have side effects — if they do, CSRF can trigger them via img tags, which bypass SameSite=Lax'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'CSRF Protection with Double Submit Cookie',
          code: `import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Generate CSRF token — store in cookie + return for client to send as header
function generateCsrfToken(req: Request, res: Response): string {
  const token = crypto.randomBytes(32).toString('hex');

  // Set as cookie (httpOnly: false so JS can read it)
  res.cookie('csrf-token', token, {
    httpOnly: false, // JS must read this to put it in a header
    secure: true,
    sameSite: 'lax',
    path: '/',
  });

  return token;
}

// Middleware: validate CSRF on state-changing requests
function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip safe methods (GET, HEAD, OPTIONS)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for Bearer token auth (not cookie-based, not vulnerable to CSRF)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return next();
  }

  // Double submit: compare cookie value with header value
  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      error: 'CSRF validation failed',
      detail: 'Include X-CSRF-Token header matching the csrf-token cookie',
    });
  }

  next();
}

app.use(csrfProtection);

// Client-side: read cookie and include as header
// const csrfToken = document.cookie.match(/csrf-token=([^;]+)/)?.[1];
// fetch('/api/orders', {
//   method: 'POST',
//   headers: { 'X-CSRF-Token': csrfToken },
//   credentials: 'include', // send cookies
//   body: JSON.stringify(data),
// });`
        }
      ],
      useCases: [
        'Traditional server-rendered applications with cookie-based sessions',
        'SPAs using cookie-based authentication (httpOnly session cookie)',
        'Applications that must support older browsers without SameSite cookie support',
        'Banking, e-commerce, and any application where CSRF could trigger financial transactions'
      ],
      commonPitfalls: [
        'Relying only on SameSite=Lax — it allows GET requests to send cookies. If your GET endpoints have side effects, you are still vulnerable',
        'CSRF tokens in GET query params — they end up in browser history, referrer headers, and server logs',
        'Not protecting all state-changing endpoints — one unprotected endpoint is enough for an attacker',
        'Using predictable CSRF tokens — timestamp-based or sequential tokens can be guessed',
        'Forgetting that CORS does not prevent CSRF — CORS is about reading responses, not sending requests. A form POST bypasses CORS entirely'
      ],
      interviewTips: [
        'Explain why cookies are vulnerable: the browser automatically attaches them to every request to the domain, regardless of the request origin',
        'Discuss why Bearer tokens are immune: the Authorization header is not automatically sent, the JavaScript must explicitly add it',
        'Compare SameSite values: Strict (never cross-site), Lax (GET navigation only), None (always, requires Secure flag)',
        'Mention that SameSite=Lax is now the default in Chrome, Firefox, and Edge — CSRF is less common but not eliminated'
      ],
      relatedConcepts: ['xss-prevention', 'session-based-auth', 'security-headers'],
      difficulty: 'intermediate',
      tags: ['csrf', 'security', 'cookies', 'samesite', 'owasp'],
      proTip: 'If your API only uses Bearer token authentication (no cookies), you are immune to CSRF by design. This is one reason why SPA + JWT/OAuth is popular — no cookies sent automatically, no CSRF risk. But the moment you add a session cookie (even just for refresh tokens), CSRF protection becomes necessary.'
    },
    {
      id: 'ssrf',
      title: 'SSRF (Server-Side Request Forgery)',
      description: 'SSRF tricks your server into making HTTP requests to unintended destinations — internal services, cloud metadata endpoints, or local network resources. If your API accepts a URL from the user (webhook URL, image URL, import URL) and your server fetches it, an attacker can make your server fetch http://169.254.169.254/latest/meta-data/ (AWS metadata) and exfiltrate cloud credentials. SSRF is how Capital One was breached in 2019.',
      keyPoints: [
        'The attack: user submits URL, server fetches it. User submits http://169.254.169.254/latest/meta-data/iam/security-credentials/ — server fetches AWS credentials',
        'Cloud metadata endpoint (169.254.169.254) is the #1 SSRF target — exposes IAM credentials, instance info, user data scripts',
        'Block private IP ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16 (link-local/metadata)',
        'DNS rebinding: attacker\'s DNS returns a public IP first (passes validation), then a private IP on subsequent resolution. Defense: resolve DNS and validate IP before fetching',
        'Allowlist is always safer than denylist: if possible, only allow requests to known-good domains',
        'Even after URL validation, follow redirects carefully — the initial URL may be safe but redirect to an internal address',
        'SSRF via other protocols: file://, gopher://, dict:// — validate the URL scheme (only allow http/https)',
        'AWS IMDSv2 (Instance Metadata Service v2) requires a PUT request with a token — significantly harder to exploit via SSRF. Enable IMDSv2 on all EC2 instances',
        'Limit outbound network from your application: use network policies (Kubernetes), security groups (AWS), or a proxy with allowlist'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'SSRF Prevention: URL Validation and IP Blocking',
          code: `import { URL } from 'url';
import dns from 'dns/promises';
import net from 'net';

const BLOCKED_IP_RANGES = [
  { start: '10.0.0.0', end: '10.255.255.255' },      // Private
  { start: '172.16.0.0', end: '172.31.255.255' },     // Private
  { start: '192.168.0.0', end: '192.168.255.255' },   // Private
  { start: '127.0.0.0', end: '127.255.255.255' },     // Loopback
  { start: '169.254.0.0', end: '169.254.255.255' },   // Link-local (AWS metadata!)
  { start: '0.0.0.0', end: '0.255.255.255' },         // Current network
];

function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isBlockedIp(ip: string): boolean {
  if (!net.isIPv4(ip)) return true; // Block non-IPv4 for simplicity
  const ipLong = ipToLong(ip);
  return BLOCKED_IP_RANGES.some(range =>
    ipLong >= ipToLong(range.start) && ipLong <= ipToLong(range.end)
  );
}

async function validateUrl(userUrl: string): Promise<string> {
  // Step 1: Parse and validate scheme
  let parsed: URL;
  try {
    parsed = new URL(userUrl);
  } catch {
    throw new Error('Invalid URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are allowed');
  }

  // Step 2: Resolve DNS and check IP BEFORE fetching
  const addresses = await dns.resolve4(parsed.hostname);
  for (const ip of addresses) {
    if (isBlockedIp(ip)) {
      throw new Error('URL resolves to a blocked IP range');
    }
  }

  return userUrl;
}

// Safe URL fetching
async function safeFetch(userUrl: string): Promise<Response> {
  const validatedUrl = await validateUrl(userUrl);

  const response = await fetch(validatedUrl, {
    redirect: 'manual', // Do NOT follow redirects automatically
    signal: AbortSignal.timeout(10_000), // 10s timeout
  });

  // If redirect, validate the redirect target too
  if ([301, 302, 307, 308].includes(response.status)) {
    const location = response.headers.get('location');
    if (!location) throw new Error('Redirect without location header');
    await validateUrl(location); // Validate redirect target
    return fetch(location, { redirect: 'manual', signal: AbortSignal.timeout(10_000) });
  }

  return response;
}

// Usage: webhook URL registration
router.post('/webhooks', async (req: Request, res: Response) => {
  try {
    await validateUrl(req.body.url);
    const webhook = await prisma.webhook.create({
      data: { url: req.body.url, userId: req.user.id },
    });
    res.status(201).json({ data: webhook });
  } catch (err) {
    res.status(400).json({ error: 'Invalid webhook URL' });
  }
});`
        }
      ],
      useCases: [
        'Webhook registration — validating user-provided callback URLs',
        'URL preview/unfurling — fetching metadata from user-provided links (Slack-style)',
        'Image proxy — downloading and resizing images from external URLs',
        'Import features — fetching data from user-provided API endpoints'
      ],
      commonPitfalls: [
        'Validating the hostname but not resolving DNS — attacker uses a domain that resolves to 169.254.169.254',
        'Denylist without link-local range — blocking 10.x and 192.168.x but forgetting 169.254.x (metadata endpoint)',
        'Following redirects without validating the redirect target — initial URL is safe, redirect goes to internal network',
        'Allowing non-HTTP schemes — file://, gopher:// can access local files or internal services',
        'DNS rebinding: validating on first resolution but the attacker changes DNS before the actual fetch'
      ],
      interviewTips: [
        'Start with the Capital One breach story: SSRF exploited via WAF to access AWS metadata endpoint, leaked 100M+ customer records',
        'Explain the attack chain: user input -> server-side fetch -> internal resource access -> credential exfiltration',
        'Discuss defense layers: URL validation (allowlist/denylist), DNS resolution check, network segmentation, IMDSv2, outbound proxy',
        'Mention DNS rebinding as the advanced attack that bypasses simple hostname validation'
      ],
      relatedConcepts: ['sql-injection', 'security-headers', 'rate-limiting'],
      difficulty: 'advanced',
      tags: ['ssrf', 'security', 'owasp', 'cloud', 'metadata'],
      proTip: 'AWS IMDSv2 is the single most effective defense against SSRF credential theft on AWS. It requires a PUT request with a hop-limit of 1, which cannot be triggered through typical SSRF vectors (fetch/curl follow GET, not PUT). Enable IMDSv2 and disable IMDSv1 on every EC2 instance.'
    },
    {
      id: 'mass-assignment',
      title: 'Mass Assignment',
      description: 'Mass assignment happens when an API blindly maps request body fields to a database model. If the User model has an isAdmin field and the API does user.update(req.body), an attacker adds { isAdmin: true } to their request and escalates privileges. The fix is simple: explicitly allowlist which fields the API accepts. Never bind the raw request body to a database model.',
      keyPoints: [
        'The attack: API does db.user.update(req.body). Attacker sends { name: "Eve", isAdmin: true } — privilege escalation',
        'Allowlist pattern: explicitly pick fields from req.body. Only fields you expect are passed to the database',
        'TypeScript Pick/Omit: type CreateUserInput = Pick<User, "name" | "email"> — type system enforces the allowlist',
        'NestJS ValidationPipe with transform: true + whitelist: true strips unexpected fields automatically',
        'DTOs (Data Transfer Objects): separate types for API input and database models. API input type never has isAdmin',
        'Zod .pick() / .omit(): schema-level allowlisting that validates AND strips in one step',
        'Even with ORMs: Prisma\'s create/update accepts the model type by default, which may include admin fields. Use select or type-safe DTOs',
        'Dangerous with document databases (MongoDB): flexible schemas mean any field in the request becomes a field in the document',
        'Test by sending unexpected fields in requests — if they persist to the database, you have mass assignment vulnerability'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Mass Assignment Prevention',
          code: `import { z } from 'zod';

// Database model has sensitive fields
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  isVerified: boolean;
  passwordHash: string;
}

// VULNERABLE: binding raw request body to update
router.patch('/users/:id', async (req: Request, res: Response) => {
  // Attacker sends { role: "admin", isVerified: true }
  await prisma.user.update({
    where: { id: req.params.id },
    data: req.body, // ALL fields passed to DB — mass assignment!
  });
});

// SAFE: Zod schema defines allowed fields (allowlist)
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  // role, isVerified, passwordHash are intentionally NOT in the schema
});

type UpdateUserInput = z.infer<typeof updateUserSchema>;

router.patch('/users/:id', async (req: Request, res: Response) => {
  // parse() strips unknown fields AND validates
  const data: UpdateUserInput = updateUserSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data, // Only name and email can be updated
  });

  res.json({ data: user });
});

// SAFE: TypeScript Pick for explicit field selection
type AdminUpdateUserInput = Pick<User, 'name' | 'email' | 'role' | 'isVerified'>;

// Only admin endpoints use the broader type
router.patch('/admin/users/:id', requireAdmin, async (req: Request, res: Response) => {
  const adminSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(['admin', 'member', 'viewer']).optional(),
    isVerified: z.boolean().optional(),
  });

  const data = adminSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
  });

  res.json({ data: user });
});`
        }
      ],
      useCases: [
        'Every API that accepts user input for create/update operations',
        'Multi-role applications where different fields are writable by different roles',
        'Applications using flexible schema databases (MongoDB, DynamoDB) where any field can be stored',
        'Legacy applications migrating from framework "magic" (Rails strong_params, Django forms) to explicit APIs'
      ],
      commonPitfalls: [
        'Spreading req.body directly into database operations — the most common vector',
        'Denylist approach (filtering OUT bad fields) instead of allowlist (permitting ONLY good fields) — you miss new sensitive fields added later',
        'Different writable fields per role but using the same DTO — admin and regular user should have different input schemas',
        'Prisma without DTOs: prisma.user.create({ data: req.body }) accepts any field in the User model',
        'GraphQL input types that mirror the database schema — expose internal fields to the API'
      ],
      interviewTips: [
        'Give the classic example: user sends { isAdmin: true } and the API saves it because it binds req.body directly',
        'Explain allowlist vs denylist: allowlist survives schema evolution (new fields are excluded by default), denylist does not',
        'Mention framework solutions: Rails has strong_params, Django has form fields, Express/NestJS uses Zod/class-validator',
        'Connect to the broader principle: never trust external input. The request body is external input — treat it as hostile'
      ],
      relatedConcepts: ['request-validation', 'sql-injection', 'api-keys'],
      difficulty: 'intermediate',
      tags: ['mass-assignment', 'security', 'owasp', 'validation', 'dto'],
      proTip: 'Use Zod\'s .strict() mode to reject objects with unknown keys instead of silently stripping them. This turns silent mass assignment into a loud 422 error, which is much easier to debug and audit.'
    },
    {
      id: 'rate-limiting',
      title: 'Rate Limiting',
      description: 'Rate limiting controls how many requests a client can make in a given time window. It protects against abuse (brute force, scraping, DDoS), ensures fair usage across clients, and prevents resource exhaustion. The implementation choice — per-IP vs per-user, fixed window vs sliding window, fail-open vs fail-closed — depends on your threat model and UX requirements.',
      keyPoints: [
        'Per-IP rate limiting: simple, but shared IPs (corporate NATs, VPNs) affect all users behind them. Good for unauthenticated endpoints',
        'Per-user rate limiting: fair, but requires authentication. Good for API endpoints. Track by user ID or API key',
        'Fixed window: count requests in fixed time slots (e.g., 100/minute). Simple but allows bursts at window boundaries (200 in 2 seconds)',
        'Sliding window: smooth rate limiting using a sliding time window. No boundary bursts. Slightly more complex to implement',
        'Token bucket: allows bursts up to a "bucket size" and refills at a steady rate. Best for APIs that need burst tolerance',
        'Retry-After header: tell the client when they can retry. Reduces hammering from well-behaved clients',
        'Return 429 Too Many Requests with a clear error message including when the limit resets',
        'Distributed rate limiting: centralized counter in Redis. INCR + EXPIRE is the standard pattern. Use MULTI for atomicity',
        'Fail open vs fail closed: if Redis is down, do you allow all requests (fail open) or deny all (fail closed)? Usually fail open to avoid self-imposed outage',
        'Different limits for different endpoints: login (5/min — brute force protection), search (30/min — resource protection), read (100/min — fair use)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Sliding Window Rate Limiter with Redis',
          code: `import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';

const redis = new Redis();

interface RateLimitConfig {
  readonly windowMs: number;     // time window in ms
  readonly maxRequests: number;  // max requests per window
  readonly keyPrefix: string;    // rate limit namespace
  readonly keyFn: (req: Request) => string; // extract identifier
}

async function slidingWindowRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const key = \`\${config.keyPrefix}:\${identifier}\`;

  // Atomic sliding window using sorted set
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart); // Remove expired entries
  pipeline.zadd(key, now.toString(), \`\${now}:\${Math.random()}\`); // Add current request
  pipeline.zcard(key); // Count requests in window
  pipeline.pexpire(key, config.windowMs); // Set TTL

  const results = await pipeline.exec();
  const requestCount = results?.[2]?.[1] as number;
  const allowed = requestCount <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - requestCount);
  const resetAt = now + config.windowMs;

  return { allowed, remaining, resetAt };
}

function rateLimit(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = config.keyFn(req);

    try {
      const result = await slidingWindowRateLimit(identifier, config);

      // Always set rate limit headers (even when allowed)
      res.set('X-RateLimit-Limit', config.maxRequests.toString());
      res.set('X-RateLimit-Remaining', result.remaining.toString());
      res.set('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());

      if (!result.allowed) {
        res.set('Retry-After', Math.ceil(config.windowMs / 1000).toString());
        return res.status(429).json({
          error: 'Too Many Requests',
          detail: \`Rate limit exceeded. Try again in \${Math.ceil(config.windowMs / 1000)} seconds.\`,
          retryAfter: Math.ceil(config.windowMs / 1000),
        });
      }

      next();
    } catch (err) {
      // Fail open: if Redis is down, allow the request
      console.error('Rate limiter error (failing open)', err);
      next();
    }
  };
}

// Apply different limits to different endpoints
app.post('/api/auth/login', rateLimit({
  windowMs: 60_000,
  maxRequests: 5,
  keyPrefix: 'rl:login',
  keyFn: (req) => req.ip || 'unknown',
}));

app.get('/api/search', rateLimit({
  windowMs: 60_000,
  maxRequests: 30,
  keyPrefix: 'rl:search',
  keyFn: (req) => req.user?.id || req.ip || 'unknown',
}));

app.use('/api', rateLimit({
  windowMs: 60_000,
  maxRequests: 100,
  keyPrefix: 'rl:general',
  keyFn: (req) => req.user?.id || req.ip || 'unknown',
}));`
        }
      ],
      useCases: [
        'Login endpoints — prevent brute force attacks (5 attempts/minute)',
        'Public APIs — enforce fair usage per API key (1000 requests/hour)',
        'Search/export endpoints — prevent resource exhaustion from expensive queries',
        'Webhook delivery — throttle outgoing requests to avoid overwhelming recipient servers'
      ],
      commonPitfalls: [
        'Rate limiting only by IP — shared IPs (offices, VPNs) unfairly throttle legitimate users',
        'Fixed window allowing boundary bursts — 100 requests at second 59, 100 more at second 61 = 200 in 2 seconds',
        'Fail closed when Redis is down — rate limiter becomes a self-inflicted DDoS. Fail open by default',
        'Not returning Retry-After header — clients without it retry immediately, making the overload worse',
        'Same rate limit for all endpoints — login should be much stricter than read-only endpoints'
      ],
      interviewTips: [
        'Compare algorithms: fixed window (simple, boundary burst), sliding window (smooth, more complex), token bucket (burst-tolerant, configurable)',
        'Discuss distributed rate limiting: Redis INCR is the standard. Mention the consistency trade-off in Redis Cluster (per-shard counting vs global)',
        'Explain 429 status code, Retry-After header, and X-RateLimit-* headers — the complete rate limiting API contract',
        'Talk about fail-open vs fail-closed: if the rate limiter is down, which is worse — allowing all traffic or blocking all traffic?'
      ],
      relatedConcepts: ['api-keys', 'security-headers', 'error-handling-standards'],
      difficulty: 'intermediate',
      tags: ['rate-limiting', 'security', 'redis', 'throttling', 'abuse-prevention'],
      proTip: 'Stripe uses a combination of token bucket (burst tolerance) and sliding window (smooth limits). Their API returns X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers on every response. Copy this contract exactly — it is the de facto standard for API rate limiting.'
    },
    {
      id: 'security-headers',
      title: 'Security Headers',
      description: 'Security headers are HTTP response headers that instruct browsers to enable security features. They are the simplest, highest-leverage security improvement you can make — a few lines of configuration that prevent entire classes of attacks. HSTS forces HTTPS, CSP prevents XSS, X-Frame-Options prevents clickjacking, and Referrer-Policy controls information leakage. Use the Helmet middleware to set them all at once.',
      keyPoints: [
        'HSTS (Strict-Transport-Security): forces HTTPS for all future requests. max-age=63072000 (2 years), includeSubDomains, preload for browser lists',
        'CSP (Content-Security-Policy): controls which resources (scripts, styles, images) can load. Most powerful header. script-src \'self\' blocks inline scripts and external scripts',
        'X-Frame-Options / CSP frame-ancestors: prevents clickjacking (embedding your site in an iframe). DENY or SAMEORIGIN. CSP frame-ancestors is the modern replacement',
        'X-Content-Type-Options: nosniff — prevents browsers from MIME-sniffing (treating a .txt as text/html and executing scripts)',
        'Referrer-Policy: controls how much URL info is sent in the Referer header. strict-origin-when-cross-origin (default), no-referrer for sensitive pages',
        'Permissions-Policy (formerly Feature-Policy): controls browser features — camera, microphone, geolocation. Deny unless needed',
        'X-XSS-Protection: 0 — paradoxically, this DISABLES the browser XSS filter (which had bypass vulnerabilities). CSP is the proper replacement',
        'Cross-Origin-Opener-Policy (COOP) and Cross-Origin-Embedder-Policy (COEP): enable cross-origin isolation for SharedArrayBuffer and high-resolution timers',
        'Use securityheaders.com to audit your headers — it grades your site and identifies missing headers'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Security Headers with Helmet',
          code: `import helmet from 'helmet';
import express from 'express';

const app = express();

// Helmet sets all security headers with sensible defaults
app.use(helmet({
  // HSTS: force HTTPS for 2 years
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },

  // CSP: strict content loading policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],            // no unsafe-inline, no unsafe-eval
      styleSrc: ["'self'", "'unsafe-inline'"], // inline styles often needed for CSS-in-JS
      imgSrc: ["'self'", "data:", "https://cdn.example.com"],
      connectSrc: ["'self'", "https://api.example.com"],
      fontSrc: ["'self'", "https://fonts.googleapis.com"],
      objectSrc: ["'none'"],            // no plugins (Flash, Java)
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],             // no iframes
      frameAncestors: ["'none'"],       // cannot be embedded (clickjacking protection)
      upgradeInsecureRequests: [],       // auto-upgrade HTTP to HTTPS
    },
  },

  // X-Content-Type-Options: prevent MIME sniffing
  xContentTypeOptions: true, // nosniff (default)

  // Referrer-Policy: limit referrer information
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // Permissions-Policy: disable unnecessary browser features
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // X-XSS-Protection: disable legacy XSS filter (CSP replaces it)
  xXssProtection: false,

  // Cross-Origin policies for isolation
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
}));

// Custom middleware for Permissions-Policy (not yet in Helmet)
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  );
  next();
});`
        }
      ],
      useCases: [
        'Every web application — security headers are baseline hygiene with virtually no downside',
        'Applications handling sensitive data — banking, healthcare, e-commerce',
        'Compliance requirements (PCI-DSS, SOC 2) — security headers are expected controls',
        'Public-facing APIs — HSTS and CORS headers protect API consumers'
      ],
      commonPitfalls: [
        'CSP with unsafe-inline — this directive allows inline scripts, which is exactly what XSS injects. It negates CSP protection',
        'HSTS without testing — once deployed, browsers remember for max-age. If you break HTTPS, users cannot access your site. Start with a short max-age',
        'Missing frame-ancestors — your site can be embedded in an iframe for clickjacking attacks',
        'X-XSS-Protection: 1 — the legacy XSS filter has bypass vulnerabilities. Set to 0 (disable) and use CSP instead',
        'Not testing headers after deployment — use securityheaders.com or Mozilla Observatory to verify'
      ],
      interviewTips: [
        'Name the critical headers: HSTS (HTTPS), CSP (XSS), frame-ancestors (clickjacking), nosniff (MIME), Referrer-Policy (info leakage)',
        'Explain why CSP is the most powerful: it can prevent XSS even if the application has encoding bugs, by blocking inline scripts entirely',
        'Discuss the deployment strategy for HSTS: start with max-age=300, test, increase gradually, add includeSubDomains, then preload',
        'Mention Helmet as the go-to Express middleware and that most frameworks have equivalents'
      ],
      relatedConcepts: ['xss-prevention', 'csrf-protection', 'ssrf'],
      difficulty: 'intermediate',
      tags: ['security-headers', 'hsts', 'csp', 'helmet', 'owasp'],
      proTip: 'Google\'s strict CSP approach: set script-src with nonce-based policy. Each response generates a random nonce, and only <script nonce="random"> tags execute. This is more secure than hash-based CSP and easier to maintain than allowlisting specific script URLs.'
    },
    {
      id: 'dependency-security',
      title: 'Dependency Security',
      description: 'Your application is 10% your code and 90% dependencies. A vulnerability in a transitive dependency you have never heard of can compromise your entire system. Supply chain attacks (malicious packages, typosquatting, account takeover) are the fastest growing attack vector. Automated scanning (npm audit, Snyk, Dependabot) is table stakes — but understanding the results and prioritizing fixes is the real skill.',
      keyPoints: [
        'npm audit: built-in, free, checks against the GitHub Advisory Database. Run npm audit --production to check only production dependencies',
        'Snyk: commercial scanner with better vulnerability database, fix PRs, and container scanning. Free tier available',
        'Dependabot (GitHub) / Renovate: automated PRs to update vulnerable dependencies. Configure auto-merge for patch updates',
        'Lockfile integrity: package-lock.json or yarn.lock pins exact versions. Verify with npm ci (not npm install) in CI to ensure reproducible builds',
        'Typosquatting: attacker publishes "lod4sh" hoping you mistype "lodash". Always verify package names before installing',
        'Supply chain attacks: maintainer account compromised (event-stream incident), malicious postinstall scripts, dependency confusion (internal package name on public registry)',
        'Pin major versions in package.json ("lodash": "^4.17.21" not "*"), and always review what npm install actually installed',
        'SBOM (Software Bill of Materials): a manifest of all dependencies. Required for compliance (US Executive Order 14028)',
        'Transitive dependencies are the hidden risk: your app uses A, A uses B, B has a vulnerability. You might not even know B exists',
        'Audit in CI: fail the build on critical/high vulnerabilities. Warn on medium. Ignore low unless actively exploited'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Dependency Security Automation',
          code: `// .github/workflows/security.yml
// name: Security Audit
// on:
//   push:
//     branches: [main]
//   pull_request:
//   schedule:
//     - cron: '0 6 * * 1'  # Weekly on Monday at 6 AM
//
// jobs:
//   audit:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v4
//       - uses: actions/setup-node@v4
//         with:
//           node-version: 20
//
//       - name: Install dependencies (reproducible)
//         run: npm ci  # Uses lockfile exactly — fails if lockfile is out of date
//
//       - name: Run npm audit
//         run: npm audit --production --audit-level=high
//         # Fails on high/critical, allows moderate/low
//
//       - name: Run Snyk (optional, needs SNYK_TOKEN)
//         uses: snyk/actions/node@master
//         env:
//           SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
//         with:
//           args: --severity-threshold=high

// package.json — pin dependencies, use exact versions for critical packages
// {
//   "dependencies": {
//     "express": "^4.18.2",       // caret: allow minor updates
//     "jsonwebtoken": "9.0.2",    // exact: security-critical, update manually
//     "bcrypt": "5.1.1"           // exact: security-critical
//   },
//   "overrides": {
//     // Force a transitive dependency to a patched version
//     "semver": ">=7.5.3"
//   }
// }

// Pre-commit hook: check for known vulnerable packages
// .husky/pre-commit:
// npm audit --production --audit-level=critical || {
//   echo "Critical vulnerability found. Run 'npm audit' for details."
//   exit 1
// }

// .npmrc — restrict install scripts for untrusted packages
// ignore-scripts=true
// # Then explicitly allow scripts for packages that need them:
// # npm rebuild bcrypt`
        }
      ],
      useCases: [
        'Every project with dependencies — which is every project',
        'CI/CD pipelines — automate scanning as a build step',
        'Compliance-driven organizations (SOC 2, HIPAA, FedRAMP) — SBOM and vulnerability management are requirements',
        'Open source projects — supply chain attacks target popular packages to maximize impact'
      ],
      commonPitfalls: [
        'Running npm install instead of npm ci in CI — npm install can modify the lockfile, npm ci uses it as-is',
        'Ignoring npm audit output because "it is always noisy" — triage and fix critical/high, configure exceptions for accepted risks',
        'Not having a lockfile — without package-lock.json, dependencies can change between installs. Commit your lockfile',
        'Blindly accepting Dependabot PRs — version bumps can introduce breaking changes. Review and test',
        'Using * or latest as version ranges — you get whatever is published, including malicious releases'
      ],
      interviewTips: [
        'Discuss the event-stream incident: a popular npm package was compromised by a new maintainer who added malicious code targeting cryptocurrency wallets',
        'Explain the difference between direct and transitive vulnerabilities: direct (your package.json) vs transitive (dependencies of dependencies)',
        'Mention defense-in-depth: npm audit (detect), lockfile pinning (reproducible), ignore-scripts (prevent postinstall attacks), code review of updates',
        'Talk about SBOM: know what is in your software, required by US government for federal procurement'
      ],
      relatedConcepts: ['secrets-management', 'security-headers', 'rate-limiting'],
      difficulty: 'intermediate',
      tags: ['dependency', 'npm-audit', 'supply-chain', 'snyk', 'sbom', 'security'],
      proTip: 'Set ignore-scripts=true in your .npmrc to prevent all postinstall scripts by default. This blocks the most common supply chain attack vector (malicious code in postinstall). Then explicitly run npm rebuild for packages that genuinely need native compilation (bcrypt, sharp, etc.).'
    },
    {
      id: 'secrets-management',
      title: 'Secrets Management',
      description: 'Secrets (API keys, database passwords, signing keys, encryption keys) are the keys to the kingdom. Hardcoding them in source code is the most common and most dangerous mistake. The solution is a layered approach: environment variables for simple setups, a secrets manager (Vault, AWS Secrets Manager, GCP Secret Manager) for production, automated rotation, and leak detection (GitLeaks, TruffleHog) in CI.',
      keyPoints: [
        'NEVER hardcode secrets in source code — even in a "private" repo. Repos get cloned, forked, and leaked',
        'Environment variables are the minimum: process.env.DATABASE_URL. But they are visible to any process and logged by accident',
        'Secrets managers (Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault): encrypted storage, access control, rotation, audit logging',
        'Secret rotation: automate rotation so no secret is valid for more than N days (90 days common). Rotation without downtime requires supporting multiple active secrets',
        'Validate at startup: check that all required secrets are present and non-empty when the application boots. Fail fast with clear error messages',
        'Never log secrets: sanitize log output to mask secrets. Use structured logging with a redaction layer',
        'Detection: GitLeaks, TruffleHog, git-secrets — scan git history (not just current files) for accidentally committed secrets',
        '.gitignore .env files — but also add a pre-commit hook to catch secrets that slip through',
        'Secret zero problem: the secret to access the secrets manager is itself a secret. Use IAM roles (cloud), Kubernetes service accounts, or OIDC federation',
        'Different secrets per environment: dev, staging, production should have completely separate secrets. A leaked dev secret should not compromise production'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Secrets Management Best Practices',
          code: `import { z } from 'zod';

// Validate ALL required secrets at startup — fail fast
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_PRIVATE_KEY: z.string().min(100), // PEM key is long
  JWT_PUBLIC_KEY: z.string().min(100),
  SESSION_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  SENTRY_DSN: z.string().url().optional(),
});

type Env = z.infer<typeof envSchema>;

function loadConfig(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Missing or invalid environment variables:');
    for (const error of result.error.errors) {
      console.error(\`  \${error.path.join('.')}: \${error.message}\`);
    }
    process.exit(1); // Fail fast — do not start without required secrets
  }
  return result.data;
}

const config = loadConfig();

// Structured logging with secret redaction
const REDACT_PATTERNS = [
  /sk_[a-zA-Z0-9_]+/g,           // Stripe keys
  /ghp_[a-zA-Z0-9]+/g,            // GitHub tokens
  /password["\s:=]+["']?[^"'\s]+/gi, // password fields
];

function redactSecrets(message: string): string {
  let redacted = message;
  for (const pattern of REDACT_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  return redacted;
}

// Never log request bodies that might contain secrets
function safeLog(level: string, message: string, context?: Record<string, unknown>) {
  const safeContext = context
    ? JSON.parse(redactSecrets(JSON.stringify(context)))
    : undefined;
  console[level as 'info' | 'warn' | 'error'](redactSecrets(message), safeContext);
}

// AWS Secrets Manager integration
// import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
//
// async function getSecret(secretName: string): Promise<string> {
//   const client = new SecretsManagerClient({ region: 'us-east-1' });
//   const response = await client.send(
//     new GetSecretValueCommand({ SecretId: secretName })
//   );
//   if (!response.SecretString) throw new Error(\`Secret \${secretName} not found\`);
//   return response.SecretString;
// }`
        }
      ],
      useCases: [
        'Every application — secret management is universal and non-optional',
        'Multi-environment deployments — different secrets for dev, staging, production',
        'Microservice architectures — each service needs its own secrets, managed centrally',
        'Compliance environments — secrets must be rotated, audited, and access-controlled'
      ],
      commonPitfalls: [
        'Committing .env to git — even once. Use git-filter-repo to remove it from history if this happens',
        'Sharing secrets via Slack/email — use a secrets manager or encrypted channel',
        'Same secrets across all environments — dev secret leaked means production is compromised',
        'Not rotating secrets after a team member leaves — they still know the old secrets',
        'Logging full request/response bodies — accidentally logs API keys, tokens, passwords in request headers or bodies'
      ],
      interviewTips: [
        'Explain the hierarchy: hardcoded (worst) -> .env files (better) -> env vars in CI/CD (good) -> secrets manager (best)',
        'Discuss the "secret zero" problem: how does the app authenticate to the secrets manager? IAM roles, Kubernetes SA, OIDC',
        'Mention rotation: secrets have a lifecycle. Automate rotation, support multiple active secrets during transition',
        'Talk about leak detection: GitLeaks in CI, GitHub secret scanning, TruffleHog for deep git history scanning'
      ],
      relatedConcepts: ['password-hashing', 'api-keys', 'dependency-security', 'security-headers'],
      difficulty: 'intermediate',
      tags: ['secrets', 'env-vars', 'vault', 'rotation', 'security'],
      proTip: 'Use 1Password\'s CLI (op) or Doppler to inject secrets into your local development environment. Instead of a .env file (which can be committed), these tools inject environment variables at runtime: op run --env-file=.env.tpl -- npm start. The secret values never touch your filesystem.'
    },
  ],
}
