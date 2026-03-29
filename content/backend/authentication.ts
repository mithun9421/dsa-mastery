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

export const authCategory: Category = {
  id: 'authentication',
  title: 'Authentication & Authorization',
  description: 'JWT internals, OAuth 2.0 flows, session management, password hashing, MFA, API keys, and the vulnerabilities that break them all. Authentication is the gate — get it wrong and nothing else matters.',
  icon: '🔐',
  concepts: [
    {
      id: 'jwt-deep-dive',
      title: 'JWT Deep Dive',
      description: 'JSON Web Tokens encode claims as a base64url JSON payload with a cryptographic signature. The "stateless" promise is seductive: no session store, no database lookup per request. But statelessness comes at a cost — you cannot revoke a JWT without re-introducing state. Understanding the header/payload/signature structure, algorithm choices, and claim semantics is essential before you can reason about JWT security.',
      keyPoints: [
        'Structure: base64url(header).base64url(payload).signature — three dot-separated parts',
        'Header contains alg (signing algorithm) and typ (JWT) — the server MUST validate alg against an allowlist',
        'Payload contains claims: iss (issuer), sub (subject/user ID), aud (audience), exp (expiration), iat (issued at), jti (unique ID for revocation)',
        'HS256: symmetric HMAC — same secret signs and verifies. Simple, but every service that verifies needs the secret',
        'RS256: asymmetric RSA — private key signs, public key verifies. Auth server holds private key, services only need the public key',
        'ES256: ECDSA — same asymmetric model as RS256 but with smaller keys and faster verification. Preferred for new systems',
        'JWK (JSON Web Key) endpoint: publish public keys at /.well-known/jwks.json so services can verify without sharing secrets',
        'Stateless JWT means you CANNOT revoke a token before expiry — you need a token blocklist (Redis) or short expiry + refresh tokens',
        'Keep JWTs short-lived (5-15 minutes) and use refresh tokens for session continuity — limits the damage window of a leaked token',
        'JWT payload is NOT encrypted, only signed — anyone can decode and read it. Never put secrets or PII in the payload unless you use JWE',
        'Always validate: signature, exp (not expired), iss (expected issuer), aud (expected audience) — skipping any of these is a vulnerability'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'JWT Signing and Verification with RS256',
          code: `import jwt from 'jsonwebtoken';
import fs from 'fs';

const PRIVATE_KEY = fs.readFileSync('./keys/private.pem', 'utf8');
const PUBLIC_KEY = fs.readFileSync('./keys/public.pem', 'utf8');

interface TokenPayload {
  readonly sub: string;
  readonly email: string;
  readonly roles: readonly string[];
}

function signAccessToken(user: { id: string; email: string; roles: string[] }): string {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    roles: user.roles,
  };

  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '15m',
    issuer: 'auth.example.com',
    audience: 'api.example.com',
    jwtid: crypto.randomUUID(), // unique ID for revocation tracking
  });
}

function verifyAccessToken(token: string): TokenPayload {
  // CRITICAL: specify algorithms allowlist to prevent algorithm confusion
  const decoded = jwt.verify(token, PUBLIC_KEY, {
    algorithms: ['RS256'], // NEVER allow 'none' or HS256 with a public key
    issuer: 'auth.example.com',
    audience: 'api.example.com',
  });
  return decoded as TokenPayload;
}

// Express middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}`
        }
      ],
      useCases: [
        'Stateless authentication in microservice architectures — services verify locally without calling auth service',
        'Single Sign-On (SSO) across multiple applications sharing the same issuer',
        'Mobile app authentication where server-side sessions are impractical',
        'API authentication for third-party integrations'
      ],
      commonPitfalls: [
        'Not specifying algorithms allowlist in verify() — enables algorithm confusion attacks',
        'Using HS256 with a weak secret — use a cryptographically random key of at least 256 bits',
        'Storing sensitive data in JWT payload — it is base64, not encrypted, anyone can read it',
        'Setting expiry too long (hours/days) — leaked tokens are valid for the entire duration with no way to revoke',
        'Not validating iss, aud, and exp claims — a token from a different system or expired token gets accepted'
      ],
      interviewTips: [
        'Draw the header.payload.signature structure and explain what each part contains',
        'Explain HS256 vs RS256: symmetric vs asymmetric, and why RS256 is better for microservices (only auth server needs the private key)',
        'Discuss the revocation problem: JWTs are stateless, so how do you log a user out? Short expiry + refresh tokens + optional blocklist',
        'Know the standard claims (iss, sub, aud, exp, iat, jti) and what each is used for'
      ],
      relatedConcepts: ['jwt-vulnerabilities', 'refresh-token-rotation', 'oauth2-flows', 'session-based-auth'],
      difficulty: 'intermediate',
      tags: ['jwt', 'authentication', 'rs256', 'stateless', 'token'],
      proTip: 'Use jti (JWT ID) claim as a unique identifier per token. Store revoked jti values in Redis with TTL matching the token expiry. This gives you "stateless with an escape hatch" — 99.9% of verifications are local, but you CAN revoke when needed.',
      ascii: `JWT Structure:
  eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature
  |___ header ___|    |___ payload ___|   |_ sig _|

  Header:  { "alg": "RS256", "typ": "JWT" }
  Payload: { "sub": "123", "iss": "auth.example.com", "exp": 1700000000 }
  Signature: RS256(base64url(header) + "." + base64url(payload), privateKey)`
    },
    {
      id: 'jwt-vulnerabilities',
      title: 'JWT Vulnerabilities',
      description: 'JWTs are a minefield of subtle vulnerabilities. The specification is flexible enough to be dangerous: algorithm confusion attacks, key confusion, missing claim validation, and insecure storage have caused real breaches. Every JWT implementation decision is a security decision. Understanding these attacks is not optional — it is the difference between "we use JWTs" and "we use JWTs correctly."',
      keyPoints: [
        'Algorithm "none" attack: attacker sets alg to "none" and removes signature — if server accepts it, authentication is bypassed entirely',
        'Key confusion (RS256 to HS256): server uses RS256 (asymmetric) but attacker sends HS256 token signed with the PUBLIC key — server verifies HS256 using the public key as the HMAC secret, and it passes',
        'Fix for both: ALWAYS hardcode the allowed algorithms in your verify function — jwt.verify(token, key, { algorithms: ["RS256"] })',
        'Missing exp validation: token without expiry is valid forever — always require and validate exp claim',
        'Missing iss/aud validation: a token from one service is accepted by another — always validate issuer and audience',
        'Token storage: localStorage is vulnerable to XSS (any script can read it), httpOnly cookies are vulnerable to CSRF (but mitigated with SameSite)',
        'Recommended: store access token in memory (JavaScript variable), store refresh token in httpOnly + Secure + SameSite=Strict cookie',
        'JWE (encrypted JWT) protects payload confidentiality but adds complexity — use it only when payload contains truly sensitive data',
        'Kid (Key ID) injection: attacker manipulates kid header to point to a file or SQL query — validate kid against a whitelist',
        'JWT libraries have had critical CVEs — keep them updated and use well-maintained libraries (jose, jsonwebtoken)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Secure JWT Verification (Defense Against Common Attacks)',
          code: `import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

// Use JWKS endpoint — keys rotate automatically
const JWKS = createRemoteJWKSet(
  new URL('https://auth.example.com/.well-known/jwks.json')
);

interface VerifiedClaims extends JWTPayload {
  readonly sub: string;
  readonly email: string;
  readonly roles: readonly string[];
}

async function verifyToken(token: string): Promise<VerifiedClaims> {
  const { payload } = await jwtVerify(token, JWKS, {
    // Defense: algorithm allowlist (prevents none + key confusion)
    algorithms: ['RS256', 'ES256'],
    // Defense: issuer validation
    issuer: 'https://auth.example.com',
    // Defense: audience validation
    audience: 'https://api.example.com',
    // Defense: require expiration
    requiredClaims: ['sub', 'exp', 'iss', 'aud'],
    // Defense: clock tolerance for minor skew
    clockTolerance: '30s',
  });

  return payload as VerifiedClaims;
}

// Token storage strategy for SPAs
// Access token: in-memory only (not localStorage!)
// Refresh token: httpOnly cookie
function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,   // JS cannot read it (XSS protection)
    secure: true,     // HTTPS only
    sameSite: 'strict', // CSRF protection
    path: '/api/auth/refresh', // only sent to refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}`
        }
      ],
      useCases: [
        'Security audits of existing JWT implementations — check for these vulnerabilities first',
        'Designing new auth systems — avoid these pitfalls from day one',
        'Penetration testing — these are the first attacks to try against JWT-based auth',
        'Code review checklists for authentication code'
      ],
      commonPitfalls: [
        'Using jwt.decode() instead of jwt.verify() — decode does NOT check the signature',
        'Passing the algorithm from the token header to verify instead of hardcoding — this IS the algorithm confusion attack',
        'Storing tokens in localStorage and thinking "we have no XSS" — one dependency supply chain attack changes that',
        'Not rotating signing keys — if a key is compromised, all tokens are compromised with no way to rotate',
        'Sharing the same signing key across environments (dev/staging/prod) — a dev token works in production'
      ],
      interviewTips: [
        'Walk through the alg:none attack step by step: attacker crafts token, removes signature, sets alg to none, server accepts',
        'Explain key confusion: RS256 uses (private_key, public_key), HS256 uses (secret). If server has public_key and accepts HS256, attacker signs with public_key as HMAC secret',
        'Discuss localStorage vs cookie trade-offs: XSS steals localStorage, CSRF exploits cookies, SameSite=Strict + httpOnly is the best compromise',
        'Mention that Auth0, Okta, and Firebase Auth handle these pitfalls for you — knowing when to use a managed service is also a valid answer'
      ],
      relatedConcepts: ['jwt-deep-dive', 'xss-prevention', 'csrf-protection', 'refresh-token-rotation'],
      difficulty: 'advanced',
      tags: ['jwt', 'security', 'vulnerability', 'xss', 'csrf', 'algorithm-confusion'],
      proTip: 'Run "jwt.io" or "jwt_tool" against your tokens in a security review. jwt_tool can automatically test for alg:none, key confusion, and other attacks. If your verify function does not reject these, you have a critical vulnerability.'
    },
    {
      id: 'oauth2-flows',
      title: 'OAuth 2.0 Flows',
      description: 'OAuth 2.0 is a delegation framework, not an authentication protocol (that is what OpenID Connect adds). It lets a user grant a third-party application limited access to their resources without sharing their credentials. The right flow depends on the client type: authorization code + PKCE for SPAs and mobile, client credentials for machine-to-machine, and device flow for input-constrained devices. The implicit flow is deprecated — stop using it.',
      keyPoints: [
        'Authorization Code + PKCE: the gold standard for SPAs and mobile apps. Client generates code_verifier + code_challenge, exchanges authorization code for tokens with proof of the verifier',
        'PKCE prevents authorization code interception: even if an attacker steals the code, they cannot exchange it without the code_verifier',
        'Client Credentials: machine-to-machine (M2M) communication — no user involved, client authenticates with client_id + client_secret',
        'Device Flow: for TVs, CLIs, IoT — device shows a code, user visits a URL on their phone and enters it. Device polls for the token',
        'Implicit Flow (deprecated): returned tokens directly in URL fragment — vulnerable to token leakage via browser history, referrer headers, and open redirectors',
        'Access tokens are short-lived (minutes) and used to access APIs. Refresh tokens are long-lived and used to get new access tokens',
        'Scopes define what the token can do (read:users, write:orders) — principle of least privilege',
        'State parameter prevents CSRF attacks on the authorization redirect — generate random value, verify it on callback',
        'Redirect URI must be registered and exact-matched — open redirect vulnerabilities here lead to token theft',
        'Always use HTTPS for all OAuth endpoints — tokens in transit are credentials'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Authorization Code + PKCE Flow (SPA)',
          code: `import crypto from 'crypto';

// Step 1: Generate PKCE pair (client-side)
function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge };
}

// Step 2: Build authorization URL
function buildAuthUrl(pkceChallenge: string, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.OAUTH_CLIENT_ID!,
    redirect_uri: 'https://app.example.com/callback',
    scope: 'openid profile email',
    state,                         // CSRF protection
    code_challenge: pkceChallenge, // PKCE
    code_challenge_method: 'S256',
  });
  return \`https://auth.example.com/authorize?\${params}\`;
}

// Step 3: Exchange code for tokens (server-side callback handler)
async function exchangeCode(
  code: string,
  codeVerifier: string
): Promise<{ accessToken: string; refreshToken: string; idToken: string }> {
  const response = await fetch('https://auth.example.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://app.example.com/callback',
      client_id: process.env.OAUTH_CLIENT_ID!,
      code_verifier: codeVerifier, // PKCE proof
    }),
  });

  if (!response.ok) {
    throw new Error(\`Token exchange failed: \${response.status}\`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
  };
}`
        }
      ],
      useCases: [
        'SPAs and mobile apps authenticating users (Authorization Code + PKCE)',
        'Backend services calling other services (Client Credentials)',
        'CLI tools authenticating users (Device Flow)',
        'Third-party integrations (Slack, GitHub, Google) — OAuth is the standard'
      ],
      commonPitfalls: [
        'Using Implicit Flow for SPAs — it is deprecated, use Authorization Code + PKCE instead',
        'Not validating the state parameter on callback — enables CSRF attacks',
        'Wildcard or overly broad redirect_uri matching — enables open redirect token theft',
        'Storing client_secret in a SPA or mobile app — public clients cannot keep secrets, use PKCE instead',
        'Requesting overly broad scopes — violates principle of least privilege, users are less likely to consent'
      ],
      interviewTips: [
        'Know all four flows and when to use each: Authorization Code + PKCE (SPA/mobile), Client Credentials (M2M), Device Flow (TV/CLI), Implicit (deprecated)',
        'Explain PKCE step by step: generate verifier, hash to challenge, send challenge in auth request, prove with verifier in token exchange',
        'Distinguish OAuth 2.0 (authorization/delegation) from OpenID Connect (authentication/identity) — OAuth alone does not tell you WHO the user is',
        'Draw the Authorization Code flow on a whiteboard: client -> auth server -> redirect with code -> client exchanges code for token -> API calls with token'
      ],
      relatedConcepts: ['openid-connect', 'jwt-deep-dive', 'refresh-token-rotation', 'csrf-protection'],
      difficulty: 'advanced',
      tags: ['oauth', 'pkce', 'authorization', 'sso', 'identity'],
      proTip: 'PKCE was originally designed for mobile apps (where you cannot keep a client_secret), but it is now recommended for ALL clients including server-side apps. It adds defense-in-depth even when you have a client_secret, and the cost is a few extra lines of code.'
    },
    {
      id: 'openid-connect',
      title: 'OpenID Connect',
      description: 'OpenID Connect (OIDC) is an identity layer built on top of OAuth 2.0. While OAuth tells you "this token is allowed to do X," OIDC tells you "this token belongs to user Y with email Z." It adds the ID token (a JWT with identity claims), the UserInfo endpoint, and a discovery document. If you need to know WHO the user is (not just what they can do), you need OIDC, not bare OAuth.',
      keyPoints: [
        'ID token is a JWT containing identity claims: sub (unique user ID), email, name, picture, email_verified',
        'Access token is for APIs, ID token is for the client — do NOT send the ID token to APIs, send the access token',
        'UserInfo endpoint (/userinfo) returns additional claims not in the ID token — call it with the access token',
        'Discovery document (.well-known/openid-configuration) describes all endpoints, supported scopes, signing algorithms',
        'Nonce: random value included in the auth request and embedded in the ID token — client verifies it to prevent replay attacks',
        'Standard scopes: openid (required), profile (name, picture), email (email, email_verified), address, phone',
        'PKCE is required for all OIDC flows since FAPI 2.0 — not optional even for confidential clients',
        'at_hash claim in ID token binds the access token to the ID token — prevents token substitution attacks',
        'ID token should be validated: signature, iss, aud, exp, nonce, at_hash — same rigor as any JWT',
        'Most apps should use a managed OIDC provider (Auth0, Okta, Keycloak) rather than implementing the spec'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'OIDC Discovery + ID Token Validation',
          code: `import { createRemoteJWKSet, jwtVerify } from 'jose';

interface OIDCConfig {
  readonly issuer: string;
  readonly authorization_endpoint: string;
  readonly token_endpoint: string;
  readonly userinfo_endpoint: string;
  readonly jwks_uri: string;
}

// Fetch discovery document
async function discoverOIDC(issuer: string): Promise<OIDCConfig> {
  const res = await fetch(\`\${issuer}/.well-known/openid-configuration\`);
  if (!res.ok) throw new Error('OIDC discovery failed');
  return res.json();
}

// Validate ID token
async function validateIdToken(
  idToken: string,
  config: OIDCConfig,
  expectedNonce: string
): Promise<{
  sub: string;
  email: string;
  name: string;
  email_verified: boolean;
}> {
  const JWKS = createRemoteJWKSet(new URL(config.jwks_uri));

  const { payload } = await jwtVerify(idToken, JWKS, {
    algorithms: ['RS256', 'ES256'],
    issuer: config.issuer,
    audience: process.env.OIDC_CLIENT_ID!,
  });

  // Verify nonce to prevent replay attacks
  if (payload.nonce !== expectedNonce) {
    throw new Error('Invalid nonce — possible replay attack');
  }

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    name: payload.name as string,
    email_verified: payload.email_verified as boolean,
  };
}

// Fetch additional user info
async function getUserInfo(
  accessToken: string,
  config: OIDCConfig
): Promise<Record<string, unknown>> {
  const res = await fetch(config.userinfo_endpoint, {
    headers: { Authorization: \`Bearer \${accessToken}\` },
  });
  if (!res.ok) throw new Error('UserInfo request failed');
  return res.json();
}`
        }
      ],
      useCases: [
        'Single Sign-On across multiple applications using a shared identity provider',
        'Social login (Google, Microsoft, Apple Sign In) — all implement OIDC',
        'Enterprise identity federation — employees sign in once, access all internal tools',
        'Any application that needs to know WHO the user is, not just that they have a valid token'
      ],
      commonPitfalls: [
        'Confusing OAuth with OIDC — OAuth is authorization ("what can this token do?"), OIDC is authentication ("who is this user?")',
        'Sending the ID token to APIs instead of the access token — ID token is for the client, access token is for APIs',
        'Not validating the nonce claim — enables replay attacks where an attacker reuses a stolen ID token',
        'Implementing OIDC from scratch instead of using a library — the spec has many edge cases and security requirements',
        'Not checking email_verified before trusting the email claim — users can set unverified emails at some providers'
      ],
      interviewTips: [
        'Clearly distinguish: OAuth 2.0 = authorization framework, OIDC = authentication layer on top of OAuth',
        'Explain the three token types: ID token (identity, for client), access token (API access), refresh token (get new tokens)',
        'Mention the discovery document and how it enables automatic configuration — clients discover endpoints at runtime',
        'Know that "Sign in with Google/Microsoft/Apple" are all OIDC implementations — this is real-world OIDC'
      ],
      relatedConcepts: ['oauth2-flows', 'jwt-deep-dive', 'jwt-vulnerabilities', 'session-based-auth'],
      difficulty: 'advanced',
      tags: ['oidc', 'identity', 'sso', 'id-token', 'authentication'],
      proTip: 'Most OIDC providers support a "login_hint" parameter. Pass the user\'s email to skip the "choose an account" screen and go straight to password entry. Small UX improvement, but users notice.'
    },
    {
      id: 'refresh-token-rotation',
      title: 'Refresh Token Rotation',
      description: 'Refresh token rotation is a security mechanism where each time a refresh token is used, it is invalidated and a new one is issued. This creates a "token family" — a chain of refresh tokens where only the latest is valid. If an old refresh token is reused, it signals compromise: the legitimate user and the attacker both have a token, but they cannot both be the latest. This triggers revocation of the entire family, forcing re-authentication.',
      keyPoints: [
        'Each refresh token is single-use: exchange it for a new access token + new refresh token, then the old refresh token is invalidated',
        'Token family: all refresh tokens descended from the same login form a family. Reuse of any non-latest token = compromise detected',
        'On reuse detection: revoke the ENTIRE token family (all refresh tokens from that login session) — force re-authentication',
        'Sliding expiry: each new refresh token extends the session (e.g., 7 days from now). User stays logged in as long as they are active',
        'Absolute expiry: regardless of activity, the session ends after N days (e.g., 30 days). Forces periodic re-authentication',
        'Combine both: sliding expiry of 7 days, absolute expiry of 30 days — active users stay logged in up to 30 days',
        'Silent refresh in SPAs: use an invisible iframe or background fetch to exchange refresh token before access token expires',
        'Store refresh tokens hashed in the database (like passwords) — if the DB is compromised, raw tokens are not exposed',
        'Refresh token should be bound to the client: include client_id, user_agent, or IP in the token record for additional validation'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Refresh Token Rotation with Reuse Detection',
          code: `import crypto from 'crypto';

interface RefreshTokenRecord {
  readonly tokenHash: string;
  readonly familyId: string;
  readonly userId: string;
  readonly expiresAt: Date;
  readonly absoluteExpiresAt: Date;
  readonly used: boolean;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function rotateRefreshToken(
  oldRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const oldHash = hashToken(oldRefreshToken);
  const record = await db.refreshTokens.findByHash(oldHash);

  if (!record) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // REUSE DETECTION: if this token was already used, compromise detected
  if (record.used) {
    // Revoke the ENTIRE token family — nuke all tokens from this login
    await db.refreshTokens.revokeFamily(record.familyId);
    throw new UnauthorizedError('Refresh token reuse detected — session revoked');
  }

  // Check expiry
  const now = new Date();
  if (record.expiresAt < now || record.absoluteExpiresAt < now) {
    throw new UnauthorizedError('Refresh token expired');
  }

  // Mark old token as used (not deleted — needed for reuse detection)
  await db.refreshTokens.markUsed(oldHash);

  // Issue new tokens
  const newRefreshToken = crypto.randomBytes(32).toString('base64url');
  const newRecord: RefreshTokenRecord = {
    tokenHash: hashToken(newRefreshToken),
    familyId: record.familyId, // same family
    userId: record.userId,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 day sliding
    absoluteExpiresAt: record.absoluteExpiresAt, // inherited from original login
    used: false,
  };

  await db.refreshTokens.create(newRecord);

  const accessToken = signAccessToken(record.userId);
  return { accessToken, refreshToken: newRefreshToken };
}`
        }
      ],
      useCases: [
        'Any application using refresh tokens — rotation should be the default, not an option',
        'SPAs where the refresh token is in an httpOnly cookie — rotation limits damage if cookie is somehow extracted',
        'Mobile apps with long-lived sessions — rotation ensures stolen tokens have a limited window',
        'High-security applications (banking, healthcare) where session compromise must be detectable'
      ],
      commonPitfalls: [
        'Deleting used refresh tokens instead of marking them as used — you lose the ability to detect reuse',
        'Not revoking the entire family on reuse detection — the attacker still has valid tokens in the chain',
        'No absolute expiry — a user who refreshes every 6 days stays logged in forever',
        'Storing raw refresh tokens instead of hashes — a database breach exposes all active sessions',
        'Race condition: legitimate client sends two rapid requests, both try to use the same refresh token — use a short grace period (e.g., 10 seconds) for the old token'
      ],
      interviewTips: [
        'Draw the token family chain: login -> RT1 -> RT2 -> RT3. If attacker stole RT1 and tries to use it after user already used it (now on RT3), RT1 is marked as used -> compromise detected -> revoke entire family',
        'Explain why deletion is wrong: you need the old tokens to exist (marked as used) to detect reuse. If you delete RT1, you cannot detect when the attacker presents it',
        'Discuss sliding vs absolute expiry: sliding keeps active users logged in, absolute prevents indefinite sessions. Combine both.',
        'Compare with session-based auth: refresh token rotation approximates the "rolling session" behavior of server-side sessions'
      ],
      relatedConcepts: ['jwt-deep-dive', 'jwt-vulnerabilities', 'session-based-auth', 'oauth2-flows'],
      difficulty: 'advanced',
      tags: ['refresh-token', 'rotation', 'session', 'security', 'reuse-detection'],
      proTip: 'Auth0 calls this "Refresh Token Rotation" and enables it with a single toggle. If you are building auth yourself, study their implementation docs — they solved every edge case including the race condition where a legitimate client sends concurrent requests with the same token.'
    },
    {
      id: 'session-based-auth',
      title: 'Session-Based Auth',
      description: 'Session-based authentication stores session state server-side (in Redis, a database, or memory) and gives the client an opaque session ID in a cookie. It is the oldest pattern and still the most secure for server-rendered applications. The session store is the single source of truth — you can inspect, modify, and revoke any session instantly. The trade-off is statefulness: every request requires a session store lookup, and scaling requires shared session storage.',
      keyPoints: [
        'Session ID is a cryptographically random string (not sequential, not predictable) — use CSPRNG',
        'Store session data server-side (Redis is the standard choice) — the cookie only contains the session ID',
        'Session fixation attack: attacker sets the session ID before authentication. Defense: regenerate session ID after login',
        'Regenerate session ID on ANY privilege change (login, role change, password change) — prevents session fixation',
        'Idle timeout: expire session after N minutes of inactivity (e.g., 30 min for banking, 24h for social media)',
        'Absolute timeout: expire session after N hours regardless of activity — forces re-authentication',
        'Cookie settings: httpOnly (no JS access), Secure (HTTPS only), SameSite=Lax or Strict (CSRF protection), Path=/',
        'Session store in Redis: use SET with EX (TTL) — expired sessions are automatically cleaned up',
        'For horizontal scaling: all servers must share the session store (Redis cluster) or use sticky sessions (worse)',
        'Logout means: delete session from store + clear cookie — both are required'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Secure Session Management with Redis',
          code: `import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  tls: process.env.NODE_ENV === 'production' ? {} : undefined,
});

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET!, // use a long, random string
  name: '__session', // custom name (not 'connect.sid')
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Login: authenticate + regenerate session
router.post('/login', async (req: Request, res: Response) => {
  const user = await authService.authenticate(req.body.email, req.body.password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  // CRITICAL: regenerate session ID to prevent session fixation
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error' });
    req.session.userId = user.id;
    req.session.roles = user.roles;
    req.session.createdAt = Date.now(); // for absolute timeout
    res.json({ data: { id: user.id, email: user.email } });
  });
});

// Logout: destroy session + clear cookie
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('__session');
    res.status(204).end();
  });
});

// Middleware: check session + enforce absolute timeout
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  // Absolute timeout: 8 hours
  const sessionAge = Date.now() - (req.session.createdAt || 0);
  if (sessionAge > 8 * 60 * 60 * 1000) {
    return req.session.destroy(() => {
      res.status(401).json({ error: 'Session expired' });
    });
  }
  next();
}`
        }
      ],
      useCases: [
        'Server-rendered applications (traditional MVC) where every request goes through the server anyway',
        'Applications requiring instant session revocation (banking, admin dashboards)',
        'When you need to limit concurrent sessions (only 1 active session per user)',
        'Internal tools where the simplicity of session-based auth outweighs the scaling concern'
      ],
      commonPitfalls: [
        'Not regenerating session ID after login — session fixation vulnerability',
        'Using in-memory session store in production — sessions lost on restart, no horizontal scaling',
        'Predictable session IDs — use CSPRNG, not sequential or timestamp-based IDs',
        'Not setting httpOnly on session cookie — any XSS can steal the session',
        'Forgetting to clear both the server-side session AND the cookie on logout — clearing only one leaves the other valid'
      ],
      interviewTips: [
        'Compare session-based vs JWT-based: sessions are stateful (revocable, inspectable, server lookup per request), JWTs are stateless (no lookup, no revocation, no server state)',
        'Discuss session fixation: attacker sets session ID via URL param or cookie injection, user logs in, attacker now has an authenticated session',
        'Explain why Redis is the standard session store: fast reads, automatic TTL expiry, pub/sub for session events, cluster mode for scaling',
        'Know when to choose sessions over JWTs: when you need instant revocation, concurrent session limits, or session inspection'
      ],
      relatedConcepts: ['jwt-deep-dive', 'csrf-protection', 'xss-prevention', 'refresh-token-rotation'],
      difficulty: 'intermediate',
      tags: ['session', 'cookie', 'redis', 'authentication', 'stateful'],
      proTip: 'Express-session sends a Set-Cookie on EVERY response by default (to update the rolling window). If you have a CDN or cache layer, this header prevents caching. Set rolling: false or exclude auth endpoints from your cache.'
    },
    {
      id: 'api-keys',
      title: 'API Keys',
      description: 'API keys identify the calling application (not the user). They are the simplest form of API authentication and are appropriate for server-to-server communication where the key can be stored securely. The critical insight: API keys are long-lived credentials — treat them like passwords. Hash them in storage, make them rotatable, and prefix them so you can detect leaks programmatically.',
      keyPoints: [
        'Generate API keys using CSPRNG (crypto.randomBytes) — never use UUIDs, timestamps, or sequential values',
        'Prefix keys for identification: sk_live_ (secret live), sk_test_ (secret test), pk_live_ (publishable live) — this enables leak detection scanners',
        'Store keys hashed (SHA-256 is sufficient — unlike passwords, API keys have high entropy) — if the DB leaks, raw keys are not exposed',
        'Show the full key exactly ONCE at creation time — after that, only show the last 4 characters',
        'Key rotation: support multiple active keys per account so clients can rotate without downtime — create new key, update config, revoke old key',
        'Rate limit per key, not just per IP — prevents abuse and enables usage tracking per integration',
        'Scoping: keys can have permissions (read-only, write, admin) — support fine-grained scopes',
        'Transmission: always in a header (Authorization: Bearer sk_live_...), never in URL query params — URLs get logged',
        'Expiration: optional but recommended — force rotation by setting a max lifetime (90 days)',
        'Audit log: track which key made which request — essential for debugging and security forensics'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'API Key Generation, Storage, and Verification',
          code: `import crypto from 'crypto';

interface ApiKey {
  readonly id: string;
  readonly keyHash: string;
  readonly prefix: string; // last 4 chars for display
  readonly name: string;
  readonly scopes: readonly string[];
  readonly organizationId: string;
  readonly expiresAt: Date | null;
  readonly createdAt: Date;
}

// Generate: show raw key once, store only hash
function generateApiKey(
  orgId: string,
  name: string,
  scopes: string[]
): { rawKey: string; record: ApiKey } {
  const randomPart = crypto.randomBytes(32).toString('base64url');
  const rawKey = \`sk_live_\${randomPart}\`;

  const record: ApiKey = {
    id: crypto.randomUUID(),
    keyHash: crypto.createHash('sha256').update(rawKey).digest('hex'),
    prefix: rawKey.slice(-4),
    name,
    scopes,
    organizationId: orgId,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    createdAt: new Date(),
  };

  return { rawKey, record }; // rawKey shown once, record stored in DB
}

// Verify: hash the provided key and look it up
async function verifyApiKey(
  rawKey: string
): Promise<{ valid: boolean; key?: ApiKey }> {
  if (!rawKey.startsWith('sk_live_')) {
    return { valid: false };
  }

  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const record = await db.apiKeys.findByHash(keyHash);

  if (!record) return { valid: false };
  if (record.expiresAt && record.expiresAt < new Date()) return { valid: false };

  return { valid: true, key: record };
}

// Middleware
async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer sk_')) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  const { valid, key } = await verifyApiKey(authHeader.slice(7));
  if (!valid || !key) {
    return res.status(401).json({ error: 'Invalid or expired API key' });
  }

  req.apiKey = key;
  next();
}`
        }
      ],
      useCases: [
        'Third-party integrations authenticating against your API',
        'Server-to-server communication between your own services',
        'CLI tools authenticating with backend services',
        'Public APIs with usage tracking and rate limiting per consumer'
      ],
      commonPitfalls: [
        'Storing raw API keys in the database — a breach exposes all keys',
        'Using UUIDs as API keys — they are not cryptographically random in most implementations',
        'Sending keys in URL query params — URLs appear in server logs, browser history, and referrer headers',
        'No rotation mechanism — when a key is compromised, there is no way to replace it without downtime',
        'No prefix convention — you cannot tell a test key from a production key, and leak scanners cannot find them'
      ],
      interviewTips: [
        'Compare API keys vs OAuth tokens: API keys identify the application, OAuth tokens authorize a user. They solve different problems',
        'Explain why SHA-256 (not bcrypt) for key storage: API keys have 256+ bits of entropy, so rainbow tables are not a threat. Bcrypt is for low-entropy passwords',
        'Discuss the Stripe key model: sk_ (secret), pk_ (publishable), test vs live — this is the industry standard',
        'Mention that GitHub scans for exposed API keys (using prefixes) and automatically revokes them — that is why prefixes matter'
      ],
      relatedConcepts: ['password-hashing', 'rate-limiting', 'secrets-management', 'oauth2-flows'],
      difficulty: 'intermediate',
      tags: ['api-key', 'authentication', 'server-to-server', 'rotation', 'hashing'],
      proTip: 'Stripe, GitHub, and AWS all use key prefixes (sk_, ghp_, AKIA). GitHub\'s secret scanning can detect 200+ token patterns and auto-revoke them. If you design your keys with a unique prefix, GitHub will add it to their scanner for free — just file a request.'
    },
    {
      id: 'multi-factor-authentication',
      title: 'Multi-Factor Authentication',
      description: 'MFA requires users to prove their identity with two or more independent factors: something they know (password), something they have (phone/hardware key), or something they are (biometrics). TOTP (Google Authenticator) is the most common second factor, but WebAuthn/FIDO2 (passkeys) is the future — phishing-resistant, user-friendly, and increasingly supported everywhere. SMS OTP is the weakest option and should be a last resort.',
      keyPoints: [
        'TOTP (RFC 6238): shared secret + current time -> 6-digit code that rotates every 30 seconds. Apps: Google Authenticator, Authy, 1Password',
        'HOTP (RFC 4226): same as TOTP but counter-based instead of time-based — less common, counter sync issues',
        'WebAuthn/FIDO2 (passkeys): public-key cryptography, device-bound or synced. Phishing-resistant because the authenticator verifies the origin domain',
        'SMS OTP: weakest factor — vulnerable to SIM swapping, SS7 attacks, and social engineering. Use only as a fallback',
        'Backup codes: generate 8-10 single-use codes at MFA setup time — user stores them offline for recovery if they lose their device',
        'Recovery flow is critical: without a recovery path, users lock themselves out. Balance security (verify identity) with usability (do not make it impossible)',
        'MFA enrollment: show QR code with otpauth:// URI, verify that user can produce a valid code before enabling MFA',
        'Rate limit MFA attempts (max 5 per minute) — brute-forcing a 6-digit code with a 30-second window is feasible without rate limiting',
        'Time drift tolerance: TOTP should accept codes from the current window and adjacent windows (1 before, 1 after = +/-30 seconds)',
        'TOTP shared secret should be stored encrypted at rest (not hashed — you need the secret to verify codes)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'TOTP Setup and Verification',
          code: `import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Step 1: Generate shared secret for user
async function enableMFA(userId: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(userId, 'MyApp', secret);
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  // Generate backup codes (single-use)
  const backupCodes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString('hex') // 8-char hex codes
  );

  // Store encrypted secret + hashed backup codes
  await db.users.update(userId, {
    mfaSecret: encrypt(secret), // encrypt, not hash — we need it to verify
    mfaBackupCodes: backupCodes.map(c =>
      crypto.createHash('sha256').update(c).digest('hex')
    ),
    mfaPending: true, // not active until verified
  });

  return { secret, qrCodeUrl, backupCodes };
}

// Step 2: Verify code to activate MFA
async function verifyAndActivateMFA(
  userId: string,
  code: string
): Promise<boolean> {
  const user = await db.users.findById(userId);
  if (!user?.mfaPending) throw new Error('MFA setup not initiated');

  const secret = decrypt(user.mfaSecret);
  const isValid = authenticator.check(code, secret);

  if (isValid) {
    await db.users.update(userId, { mfaPending: false, mfaEnabled: true });
  }
  return isValid;
}

// Step 3: Verify during login
async function verifyMFA(userId: string, code: string): Promise<boolean> {
  const user = await db.users.findById(userId);
  if (!user?.mfaEnabled) return true; // MFA not enabled

  const secret = decrypt(user.mfaSecret);

  // Try TOTP first
  if (authenticator.check(code, secret)) return true;

  // Try backup code
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const backupIndex = user.mfaBackupCodes.indexOf(codeHash);
  if (backupIndex !== -1) {
    // Consume the backup code (single-use)
    const updatedCodes = [...user.mfaBackupCodes];
    updatedCodes.splice(backupIndex, 1);
    await db.users.update(userId, { mfaBackupCodes: updatedCodes });
    return true;
  }

  return false;
}`
        }
      ],
      useCases: [
        'Any application handling sensitive data (financial, healthcare, personal information)',
        'Admin and superuser accounts — MFA should be REQUIRED, not optional',
        'Compliance requirements (SOC 2, HIPAA, PCI-DSS all require or recommend MFA)',
        'Step-up authentication: require MFA for specific high-risk actions (transfer money, change email, delete account)'
      ],
      commonPitfalls: [
        'Storing TOTP secrets in plaintext — encrypt at rest, the secret IS the second factor',
        'No backup codes — users lose their phone and are permanently locked out',
        'Not rate limiting MFA attempts — 6-digit codes have only 1M possibilities, brute-forceable without limits',
        'Making MFA optional for admin accounts — the highest-privilege accounts need the strongest protection',
        'SMS as the only MFA option — SIM swapping is easy and cheap for targeted attacks'
      ],
      interviewTips: [
        'Explain the three factors: knowledge (password), possession (phone/key), inherence (fingerprint). MFA requires 2+ different factors',
        'Compare TOTP vs WebAuthn: TOTP is phishable (user types code into fake site), WebAuthn is phishing-resistant (authenticator checks the domain)',
        'Discuss the recovery problem: what happens when a user loses their phone? Backup codes, recovery email, or admin-assisted reset',
        'Know that passkeys (WebAuthn) can replace passwords entirely — "passwordless" authentication with just a biometric on your device'
      ],
      relatedConcepts: ['password-hashing', 'session-based-auth', 'jwt-deep-dive', 'oauth2-flows'],
      difficulty: 'advanced',
      tags: ['mfa', 'totp', 'webauthn', 'passkeys', '2fa', 'security'],
      proTip: 'WebAuthn/passkeys synced via iCloud Keychain or Google Password Manager are the end game for consumer auth. They are phishing-resistant, user-friendly (just a fingerprint), and eliminate the "user reuses password" problem entirely. Start planning your migration now.'
    },
    {
      id: 'password-hashing',
      title: 'Password Hashing',
      description: 'Password hashing transforms a password into a fixed-length string that is infeasible to reverse. The key insight: passwords have LOW entropy (humans pick bad passwords), so you need algorithms that are deliberately slow (bcrypt, Argon2id, scrypt) to resist brute-force attacks. MD5, SHA-1, and even SHA-256 are NOT password hashing algorithms — they are fast hash functions designed for data integrity, not password storage.',
      keyPoints: [
        'Argon2id: the winner of the Password Hashing Competition (2015). Memory-hard (resists GPU attacks), time-hard, and parallelism-resistant. Use this for new systems',
        'bcrypt: the old reliable. Cost factor determines slowness (2^cost iterations). Use cost factor 12+ in 2024. Still widely used and battle-tested',
        'scrypt: memory-hard like Argon2. Used by some cryptocurrency systems. Less adoption than Argon2 in web applications',
        'PBKDF2: FIPS-140 compliant, required in some regulated environments. CPU-hard but NOT memory-hard — weaker against GPU attacks',
        'NEVER use MD5, SHA-1, or SHA-256 alone for passwords — these compute in nanoseconds, enabling billions of guesses per second on GPUs',
        'Salt: random bytes prepended to the password before hashing — prevents rainbow table attacks. Modern algorithms (bcrypt, Argon2) generate and embed the salt automatically',
        'Pepper: a secret key mixed into the hash that is NOT stored in the database (stored in environment/HSM). If DB is breached but pepper is not, hashes are even harder to crack',
        'Cost factor should make hashing take ~250ms on your hardware — slow enough to resist brute force, fast enough for login UX',
        'Never compare hashes with === — use constant-time comparison (crypto.timingSafeEqual) to prevent timing attacks',
        'Password migration: when upgrading algorithms, re-hash on next successful login (you have the plaintext password at that moment)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Password Hashing with Argon2id and bcrypt',
          code: `import argon2 from 'argon2';
import bcrypt from 'bcrypt';

// Argon2id — recommended for new systems
async function hashPasswordArgon2(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,    // hybrid: resistant to both side-channel and GPU attacks
    memoryCost: 65536,         // 64 MB
    timeCost: 3,               // 3 iterations
    parallelism: 4,            // 4 threads
  });
  // Output: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
}

async function verifyPasswordArgon2(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

// bcrypt — proven, widely supported
const BCRYPT_ROUNDS = 12; // ~250ms on modern hardware

async function hashPasswordBcrypt(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
  // Output: $2b$12$salt22charsxxxxxxxxhash31chars
}

async function verifyPasswordBcrypt(hash: string, password: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Migration: upgrade legacy hashes on login
async function loginWithMigration(
  email: string,
  password: string
): Promise<User> {
  const user = await db.users.findByEmail(email);
  if (!user) throw new AuthError('Invalid credentials');

  const isValid = await verifyPassword(user.passwordHash, password);
  if (!isValid) throw new AuthError('Invalid credentials');

  // If hash uses old algorithm, upgrade to Argon2id
  if (!user.passwordHash.startsWith('$argon2id$')) {
    const newHash = await hashPasswordArgon2(password);
    await db.users.update(user.id, { passwordHash: newHash });
  }

  return user;
}`
        }
      ],
      useCases: [
        'Any application that stores user passwords — which should be using one of these algorithms',
        'Migration from legacy hashing (MD5, SHA-1) to modern algorithms',
        'Compliance environments requiring FIPS-140 (use PBKDF2) or general best practice (use Argon2id)',
        'Password reset flows — hash the new password the same way'
      ],
      commonPitfalls: [
        'Using SHA-256 or MD5 for passwords — these are fast hashes, not password hashes. GPUs crack billions per second',
        'Using bcrypt with cost factor below 10 — too fast, vulnerable to brute force on modern hardware',
        'Not using a salt — even bcrypt generates one automatically, but custom implementations might skip it',
        'Comparing hashes with === instead of constant-time comparison — leaks timing information',
        'Logging passwords or sending them in error messages — the plaintext should exist only in memory, briefly'
      ],
      interviewTips: [
        'Explain WHY fast hashes are bad for passwords: MD5 can be computed at 10 billion/second on a GPU. bcrypt at cost 12 takes 250ms per attempt',
        'Know the difference: salt (random, stored with hash, prevents rainbow tables) vs pepper (secret, stored separately, adds defense if DB leaks)',
        'Compare the algorithms: Argon2id (best, memory-hard), bcrypt (proven, CPU-hard), PBKDF2 (FIPS, CPU-hard), scrypt (memory-hard, less adoption)',
        'Discuss the cost factor trade-off: higher = more secure but slower login. Target ~250ms. Re-evaluate as hardware gets faster'
      ],
      relatedConcepts: ['multi-factor-authentication', 'api-keys', 'secrets-management', 'sql-injection'],
      difficulty: 'intermediate',
      tags: ['password', 'hashing', 'bcrypt', 'argon2', 'security', 'cryptography'],
      proTip: 'Dropbox pioneered a layered approach: bcrypt(SHA-512(password), salt) + AES-256 encryption with a global pepper. The SHA-512 pre-hash bypasses bcrypt\'s 72-byte input limit, bcrypt provides slow hashing, and AES with a pepper stored in an HSM adds a final layer. This is defense in depth done right.'
    },
  ],
}
