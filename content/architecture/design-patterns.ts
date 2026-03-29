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

export const designPatternsCategory: Category = {
  id: 'design-patterns',
  title: 'Design Patterns',
  description: 'All 23 Gang of Four patterns plus modern additions. Not textbook definitions — real trade-offs, TypeScript implementations, and when each pattern earns its complexity versus when it is cargo-culted overhead.',
  icon: '🧩',
  concepts: [
    // ─── CREATIONAL ───────────────────────────────────────────────
    {
      id: 'singleton',
      title: 'Singleton',
      description: 'Ensures a class has exactly one instance and provides a global point of access to it. In JavaScript/TypeScript, the module system itself is a singleton mechanism — every ES module is evaluated once and cached. The traditional class-based Singleton is rarely needed, but the concept appears everywhere: database connection pools, configuration objects, logger instances, and in-memory caches. The real debate is not "how to implement it" but "should you."',
      keyPoints: [
        'ES modules are inherently singletons — `export const db = new Database()` is evaluated once and cached across all importers',
        'Class-based Singleton uses a private constructor and a static `getInstance()` method',
        'Thread safety is not an issue in single-threaded JavaScript, but it matters in Node.js worker threads or when shared state is accessed across async boundaries',
        'Singletons create hidden coupling — every consumer depends on global state, making unit testing painful',
        'Dependency injection eliminates most legitimate Singleton use cases by letting the container manage lifecycle',
        'In multi-instance environments (serverless, horizontal scaling), a "Singleton" is only single within one process — use Redis or a database for true global state',
        'The module-as-singleton pattern is fine for stateless utilities; it becomes problematic for stateful objects that tests need to reset'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Classic Singleton with Lazy Initialization',
          code: `class DatabasePool {
  private static instance: DatabasePool | null = null;
  private connections: Connection[] = [];

  private constructor(private readonly config: DbConfig) {
    // Private constructor prevents direct instantiation
  }

  static getInstance(config?: DbConfig): DatabasePool {
    if (!DatabasePool.instance) {
      if (!config) throw new Error('Config required for first initialization');
      DatabasePool.instance = new DatabasePool(config);
    }
    return DatabasePool.instance;
  }

  // For testing: allow resetting the singleton
  static resetInstance(): void {
    DatabasePool.instance?.connections.forEach(c => c.close());
    DatabasePool.instance = null;
  }

  async getConnection(): Promise<Connection> {
    // Pool logic here
  }
}`
        },
        {
          language: 'typescript',
          label: 'Module-Level Singleton (Preferred in TS)',
          code: `// db.ts — this IS the singleton. No class ceremony needed.
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});

// Every file that imports from db.ts gets the same pool instance
export const query = (text: string, params?: unknown[]) =>
  pool.query(text, params);

export const getClient = () => pool.connect();

// For graceful shutdown
export const close = () => pool.end();`
        }
      ],
      useCases: [
        'Database connection pools — you want exactly one pool per process',
        'Application configuration loaded once at startup',
        'In-memory caches shared across request handlers',
        'Logger instances (though DI is usually better)',
        'Service registries in plugin architectures'
      ],
      commonPitfalls: [
        'Making everything a Singleton because "there should only be one" — this conflates lifecycle management with the pattern',
        'Not providing a reset mechanism, making tests order-dependent and flaky',
        'Assuming Singleton means "globally unique" in distributed systems — it is per-process only',
        'Using Singleton to avoid passing dependencies, creating hidden coupling that makes refactoring painful',
        'Lazy initialization race conditions in async contexts — two concurrent calls to getInstance() before the first resolves'
      ],
      interviewTips: [
        'Lead with "ES modules are singletons" — shows you understand the platform, not just the GoF book',
        'Discuss the testing problem: Singletons carry state between tests, breaking isolation',
        'Mention DI as the preferred alternative: same "one instance" guarantee without the global coupling',
        'If asked about thread safety, clarify that JS is single-threaded but async initialization can race'
      ],
      relatedConcepts: ['factory-method', 'dependency-inversion-principle', 'repository-pattern'],
      difficulty: 'intermediate',
      tags: ['creational', 'gof', 'anti-pattern-risk'],
      proTip: 'If you are reaching for Singleton, ask yourself: "Am I managing lifecycle or avoiding dependency injection?" If it is the latter, use DI instead. If it is the former, the module system already does it for you.'
    },
    {
      id: 'factory-method',
      title: 'Factory Method',
      description: 'Defines an interface for creating an object but lets subclasses (or implementations) decide which class to instantiate. Factory Method decouples the client code from the concrete classes it needs to create. In TypeScript, this often manifests as a function that returns different implementations based on configuration, environment, or input — not necessarily as a class hierarchy.',
      keyPoints: [
        'Decouples object creation from usage — the consumer asks for "a thing that does X" without knowing the concrete type',
        'Enables open/closed principle: add new product types without modifying existing factory consumers',
        'In TypeScript, a simple factory function often replaces the full class-based GoF pattern',
        'Plugin architectures rely heavily on factory methods: register a creator function, invoke it by key',
        'Constructors cannot return a different type; factory methods can return any subtype of the declared return type',
        'Static factory methods (like `Array.from()`, `Promise.resolve()`) are a language-level application of this pattern',
        'When combined with a registry/map, becomes a flexible plugin system without subclassing'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Factory Method with Registry Pattern',
          code: `// Define the product interface
interface PaymentProcessor {
  charge(amount: number, currency: string): Promise<ChargeResult>;
  refund(chargeId: string): Promise<RefundResult>;
}

// Concrete implementations
class StripeProcessor implements PaymentProcessor {
  async charge(amount: number, currency: string) {
    // Stripe-specific API call
    return { id: 'ch_stripe_xxx', status: 'succeeded' as const };
  }
  async refund(chargeId: string) {
    return { id: 'rf_stripe_xxx', status: 'refunded' as const };
  }
}

class PayPalProcessor implements PaymentProcessor {
  async charge(amount: number, currency: string) {
    return { id: 'PAY-xxx', status: 'succeeded' as const };
  }
  async refund(chargeId: string) {
    return { id: 'REF-xxx', status: 'refunded' as const };
  }
}

// Factory with registry — open for extension without modification
type ProcessorFactory = () => PaymentProcessor;

const registry = new Map<string, ProcessorFactory>([
  ['stripe', () => new StripeProcessor()],
  ['paypal', () => new PayPalProcessor()],
]);

// Register new processors without touching existing code
function registerProcessor(name: string, factory: ProcessorFactory) {
  registry.set(name, factory);
}

function createProcessor(name: string): PaymentProcessor {
  const factory = registry.get(name);
  if (!factory) {
    throw new Error(\`Unknown payment processor: \${name}. Available: \${[...registry.keys()].join(', ')}\`);
  }
  return factory();
}

// Usage — consumer never imports concrete classes
const processor = createProcessor(config.paymentProvider);
await processor.charge(2999, 'usd');`
        }
      ],
      useCases: [
        'Payment gateways — switch between Stripe, PayPal, Braintree without changing business logic',
        'Database drivers — create the right adapter based on DATABASE_TYPE env var',
        'Notification systems — produce email, SMS, or push notification senders from a single factory',
        'Plugin architectures — third-party code registers factories that the core invokes',
        'Test doubles — factory returns mocks in test environment, real implementations in production'
      ],
      commonPitfalls: [
        'Over-engineering: if you only ever have one implementation, a factory is premature abstraction',
        'Putting business logic in the factory — it should only create, not configure or orchestrate',
        'Not making the factory easily discoverable — callers should know what keys/types are available',
        'Creating a factory that returns `any` instead of a typed interface, losing the whole point'
      ],
      interviewTips: [
        'Distinguish Factory Method (subclass decides) from Abstract Factory (family of related objects) from Simple Factory (just a function)',
        'Show you know when NOT to use it: "If there is only one implementation now and no planned extension, a direct constructor is fine"',
        'Mention real-world examples: React.createElement, document.createElement, Array.from',
        'Discuss how DI containers are essentially sophisticated factory registries'
      ],
      relatedConcepts: ['abstract-factory', 'singleton', 'open-closed-principle', 'strategy'],
      difficulty: 'intermediate',
      tags: ['creational', 'gof', 'plugin-architecture']
    },
    {
      id: 'abstract-factory',
      title: 'Abstract Factory',
      description: 'Provides an interface for creating families of related or dependent objects without specifying their concrete classes. Where Factory Method creates one product, Abstract Factory creates a suite of products that work together. The classic example is UI toolkit theming — you need buttons, inputs, and modals that all share the same visual language. In modern TypeScript, dependency injection containers often serve as abstract factories.',
      keyPoints: [
        'Creates families of related objects that must be used together — not individual objects in isolation',
        'Enforces consistency: you cannot accidentally mix a Material button with a Bootstrap modal',
        'Each concrete factory produces a complete set of compatible products',
        'Adding a new product to the family requires changing all factory implementations — this is the trade-off',
        'DI containers (InversifyJS, tsyringe) are abstract factories: they resolve families of dependencies based on configuration',
        'In React, theme providers and context are a functional equivalent of Abstract Factory',
        'The pattern shines when the "family" constraint is real; it is overhead when products are independent'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Abstract Factory for UI Components',
          code: `// Product interfaces — what the family produces
interface Button {
  render(): string;
  onClick(handler: () => void): void;
}
interface TextInput {
  render(): string;
  getValue(): string;
}
interface Modal {
  render(): string;
  open(): void;
  close(): void;
}

// Abstract factory interface
interface UIFactory {
  createButton(label: string): Button;
  createTextInput(placeholder: string): TextInput;
  createModal(title: string, content: string): Modal;
}

// Concrete factory: Material Design family
class MaterialUIFactory implements UIFactory {
  createButton(label: string): Button {
    return {
      render: () => \`<button class="mdc-button">\${label}</button>\`,
      onClick: (handler) => { /* Material ripple + handler */ },
    };
  }
  createTextInput(placeholder: string): TextInput {
    return {
      render: () => \`<div class="mdc-text-field"><input placeholder="\${placeholder}"/></div>\`,
      getValue: () => '',
    };
  }
  createModal(title: string, content: string): Modal {
    return {
      render: () => \`<div class="mdc-dialog"><h2>\${title}</h2><p>\${content}</p></div>\`,
      open: () => { /* Material dialog open animation */ },
      close: () => { /* Material dialog close animation */ },
    };
  }
}

// Consumer code — depends only on the abstract factory
function buildLoginForm(factory: UIFactory) {
  const emailInput = factory.createTextInput('Enter email');
  const passwordInput = factory.createTextInput('Enter password');
  const submitButton = factory.createButton('Sign In');
  const errorModal = factory.createModal('Error', 'Invalid credentials');
  // All components guaranteed to be from the same design system
  return { emailInput, passwordInput, submitButton, errorModal };
}

// Switch entire UI family by swapping the factory
const ui = buildLoginForm(new MaterialUIFactory());`
        }
      ],
      useCases: [
        'UI theming systems — produce consistent component families per theme',
        'Cross-platform code — factory per platform (iOS, Android, Web) producing native widgets',
        'Database abstraction — factory produces Connection, Query, Transaction objects that work together',
        'Cloud provider abstraction — factory per provider (AWS, GCP, Azure) for storage, compute, messaging',
        'Testing — swap entire dependency family with test doubles via a TestFactory'
      ],
      commonPitfalls: [
        'Using Abstract Factory when products are independent — if a Button does not need to match a Modal, use separate Factory Methods',
        'Explosion of classes: each new product type requires changes to every concrete factory',
        'Confusing with Factory Method — Abstract Factory creates families, Factory Method creates one type',
        'Making the factory too granular — if you have 20 product types in one factory, decompose into smaller families'
      ],
      interviewTips: [
        'Clearly distinguish from Factory Method: "Factory Method is about one product with multiple implementations; Abstract Factory is about families of products that must be consistent"',
        'Mention the trade-off: adding a new product to the family is expensive (modify all factories), but adding a new family is cheap (new factory class)',
        'Real-world: React context providers, Angular modules, and DI containers are all abstract factories in spirit',
        'If asked "when would you NOT use this?" — when the products in the family are truly independent and can be mixed freely'
      ],
      relatedConcepts: ['factory-method', 'builder', 'bridge', 'dependency-inversion-principle'],
      difficulty: 'advanced',
      tags: ['creational', 'gof', 'family-consistency']
    },
    {
      id: 'builder',
      title: 'Builder',
      description: 'Separates the construction of a complex object from its representation, allowing the same construction process to create different representations. Builder shines when an object has many optional parameters, conditional configuration, or must be constructed in steps. The fluent interface variant (method chaining) is ubiquitous in TypeScript — think Prisma queries, Zod schemas, and test data factories.',
      keyPoints: [
        'Eliminates "telescoping constructor" antipattern — constructors with 10+ parameters in a specific order',
        'Fluent interface (method chaining via `return this`) makes the API discoverable and readable',
        'Separates required from optional fields — required in constructor, optional via builder methods',
        'The `build()` method is where validation happens — reject invalid combinations at construction time, not at usage time',
        'Director (optional) encapsulates common build sequences for reuse',
        'Immutable builders create a new builder instance on each method call — safer but more allocations',
        'TypeScript generics can make builders type-safe: track which required fields have been set via phantom types'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Fluent Builder with Validation',
          code: `interface HttpRequest {
  readonly method: string;
  readonly url: string;
  readonly headers: ReadonlyMap<string, string>;
  readonly body: string | null;
  readonly timeout: number;
  readonly retries: number;
}

class HttpRequestBuilder {
  private _method = 'GET';
  private _url = '';
  private _headers = new Map<string, string>();
  private _body: string | null = null;
  private _timeout = 30_000;
  private _retries = 0;

  url(url: string): this {
    this._url = url;
    return this;
  }

  method(method: string): this {
    this._method = method.toUpperCase();
    return this;
  }

  header(key: string, value: string): this {
    this._headers.set(key, value);
    return this;
  }

  jsonBody(data: unknown): this {
    this._body = JSON.stringify(data);
    this._headers.set('Content-Type', 'application/json');
    return this;
  }

  timeout(ms: number): this {
    this._timeout = ms;
    return this;
  }

  retries(count: number): this {
    this._retries = count;
    return this;
  }

  build(): HttpRequest {
    if (!this._url) throw new Error('URL is required');
    if (this._body && this._method === 'GET') {
      throw new Error('GET requests cannot have a body');
    }
    return Object.freeze({
      method: this._method,
      url: this._url,
      headers: new Map(this._headers),
      body: this._body,
      timeout: this._timeout,
      retries: this._retries,
    });
  }
}

// Usage — reads like English
const request = new HttpRequestBuilder()
  .url('https://api.example.com/users')
  .method('POST')
  .header('Authorization', 'Bearer token')
  .jsonBody({ name: 'Alice', role: 'admin' })
  .timeout(5000)
  .retries(3)
  .build();`
        },
        {
          language: 'typescript',
          label: 'Test Data Builder (Arrange phase in tests)',
          code: `interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: 'admin' | 'member' | 'guest';
  readonly verified: boolean;
  readonly createdAt: Date;
}

class UserBuilder {
  private data: User = {
    id: crypto.randomUUID(),
    email: 'test@example.com',
    name: 'Test User',
    role: 'member',
    verified: true,
    createdAt: new Date('2024-01-01'),
  };

  withEmail(email: string): this { return this.with('email', email); }
  withRole(role: User['role']): this { return this.with('role', role); }
  unverified(): this { return this.with('verified', false); }
  admin(): this { return this.with('role', 'admin'); }

  private with<K extends keyof User>(key: K, value: User[K]): this {
    this.data = { ...this.data, [key]: value };
    return this;
  }

  build(): User { return { ...this.data }; }
}

// In tests — expressive, minimal setup
const admin = new UserBuilder().admin().build();
const unverifiedUser = new UserBuilder().unverified().withEmail('new@test.com').build();`
        }
      ],
      useCases: [
        'HTTP client request construction — method, headers, body, timeout, retries',
        'ORM query building — Prisma, Knex, TypeORM query builders',
        'Test data factories — construct test entities with sensible defaults and targeted overrides',
        'Configuration objects — complex config with validation at build time',
        'Email/notification construction — recipients, subject, body, attachments, scheduling'
      ],
      commonPitfalls: [
        'Not validating in build() — the whole point is to catch invalid state at construction, not at usage',
        'Mutable builders shared across call sites — one caller mutates the builder state that another depends on',
        'Over-building: if the object has 3 fields, use a plain constructor or object literal instead',
        'Returning `this` with incorrect type in subclasses — use polymorphic `this` type in TypeScript'
      ],
      interviewTips: [
        'Mention real-world builders you use daily: Prisma, Zod, supertest, URLSearchParams',
        'Explain when Builder beats an options object: when construction is multi-step, has validation, or has conditional logic',
        'Discuss immutable vs mutable builders — immutable is safer for reuse, mutable is simpler',
        'The Director is optional and rarely used in modern code — most builders are used inline'
      ],
      relatedConcepts: ['abstract-factory', 'prototype', 'composite'],
      difficulty: 'intermediate',
      tags: ['creational', 'gof', 'fluent-interface']
    },
    {
      id: 'prototype',
      title: 'Prototype',
      description: 'Creates new objects by cloning an existing instance (the prototype) rather than constructing from scratch. JavaScript is literally built on prototypal inheritance — `Object.create()`, the prototype chain, and `structuredClone()` are all manifestations. The pattern is essential when object creation is expensive, when you need deep copies of complex object graphs, or when you want to create variations of a template object.',
      keyPoints: [
        'JavaScript prototype chain is a language-level implementation of this pattern',
        'Deep clone vs shallow clone is the critical decision — `{...obj}` and `Object.assign` are shallow',
        '`structuredClone()` (modern JS) handles deep cloning of most types including nested objects, arrays, Maps, Sets, Dates, and ArrayBuffers',
        '`structuredClone()` cannot clone functions, DOM nodes, Error objects, or objects with symbols',
        'Useful for "template" objects: clone a default configuration and override specific fields',
        'In game development: prototype enemy/item templates, clone and customize per instance',
        'Combined with Registry: store named prototypes, clone by key instead of constructing from scratch'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Prototype Registry with Deep Clone',
          code: `interface Cloneable<T> {
  clone(): T;
}

interface DocumentTemplate extends Cloneable<DocumentTemplate> {
  readonly title: string;
  readonly sections: ReadonlyArray<{ heading: string; content: string }>;
  readonly metadata: Readonly<{ author: string; tags: string[] }>;
}

function createDocumentTemplate(
  title: string,
  sections: { heading: string; content: string }[],
  metadata: { author: string; tags: string[] }
): DocumentTemplate {
  return {
    title,
    sections,
    metadata,
    clone() {
      // structuredClone handles deep nesting
      const cloned = structuredClone({ title, sections, metadata });
      return createDocumentTemplate(cloned.title, cloned.sections, cloned.metadata);
    },
  };
}

// Prototype registry — store templates, clone on demand
class TemplateRegistry {
  private readonly templates = new Map<string, DocumentTemplate>();

  register(key: string, template: DocumentTemplate): void {
    this.templates.set(key, template);
  }

  create(key: string): DocumentTemplate {
    const proto = this.templates.get(key);
    if (!proto) throw new Error(\`Template "\${key}" not found\`);
    return proto.clone();
  }
}

// Usage
const registry = new TemplateRegistry();
registry.register('blog-post', createDocumentTemplate(
  'Untitled Post',
  [{ heading: 'Introduction', content: '' }, { heading: 'Conclusion', content: '' }],
  { author: '', tags: ['draft'] }
));

const myPost = registry.create('blog-post');
// myPost is a deep clone — mutating it does not affect the template`
        }
      ],
      useCases: [
        'Document template systems — clone and customize a base template',
        'Game entity spawning — clone enemy/item prototypes with per-instance variation',
        'Configuration presets — clone a preset and override specific values',
        'Undo/redo systems — snapshot (clone) state before mutations, restore by cloning back',
        'Testing — create prototype fixtures, clone per test to ensure isolation'
      ],
      commonPitfalls: [
        'Shallow copy when deep copy is needed — nested objects still share references',
        'Assuming structuredClone handles everything — it cannot clone functions, class instances lose their prototype chain',
        'Not considering performance: deep cloning large object graphs is expensive — benchmark before assuming it is "free"',
        'Forgetting to update clone logic when adding new fields — clone becomes stale'
      ],
      interviewTips: [
        'Connect to JavaScript fundamentals: "JS is a prototype-based language — Object.create() IS the Prototype pattern"',
        'Discuss shallow vs deep clone trade-offs and when each is appropriate',
        'Mention structuredClone as the modern standard, and its limitations',
        'Contrast with Builder: Prototype clones an existing object, Builder constructs from scratch step by step'
      ],
      relatedConcepts: ['builder', 'memento', 'factory-method'],
      difficulty: 'intermediate',
      tags: ['creational', 'gof', 'cloning', 'javascript-native']
    },

    // ─── STRUCTURAL ──────────────────────────────────────────────
    {
      id: 'adapter',
      title: 'Adapter',
      description: 'Converts the interface of a class into another interface that clients expect. Adapter lets classes work together that could not otherwise because of incompatible interfaces. This is one of the most practically useful patterns — every time you wrap a third-party library to match your internal interfaces, you are writing an adapter. It is the glue code pattern.',
      keyPoints: [
        'Two flavors: object adapter (composition — wraps the adaptee) and class adapter (inheritance — extends the adaptee)',
        'Object adapter is preferred in TypeScript — composition over inheritance, and TS does not support multiple inheritance',
        'Adapters belong at system boundaries: wrapping external APIs, third-party SDKs, legacy code',
        'Two-way adapters translate in both directions — useful when two systems need to communicate bidirectionally',
        'The adapter should be thin — translate, not add business logic. Business logic belongs in the domain layer',
        'When you have many adaptees with similar but not identical interfaces, consider combining with Strategy',
        'Anti-corruption layer in DDD is essentially a collection of adapters'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Adapter: Unifying Multiple Email Providers',
          code: `// Your internal interface
interface EmailService {
  send(to: string, subject: string, html: string): Promise<{ messageId: string }>;
}

// Third-party SDK with different interface
interface SendGridClient {
  sendMail(msg: {
    to: { email: string };
    subject: string;
    content: { type: string; value: string }[];
  }): Promise<{ headers: { 'x-message-id': string } }>;
}

// Another third-party with yet another interface
interface MailgunClient {
  messages: {
    create(domain: string, params: {
      to: string[];
      subject: string;
      html: string;
    }): Promise<{ id: string }>;
  };
}

// Adapters — thin translation layers
class SendGridAdapter implements EmailService {
  constructor(private readonly client: SendGridClient) {}

  async send(to: string, subject: string, html: string) {
    const result = await this.client.sendMail({
      to: { email: to },
      subject,
      content: [{ type: 'text/html', value: html }],
    });
    return { messageId: result.headers['x-message-id'] };
  }
}

class MailgunAdapter implements EmailService {
  constructor(
    private readonly client: MailgunClient,
    private readonly domain: string,
  ) {}

  async send(to: string, subject: string, html: string) {
    const result = await this.client.messages.create(this.domain, {
      to: [to],
      subject,
      html,
    });
    return { messageId: result.id };
  }
}

// Consumer code works with any email service — no vendor lock-in
async function sendWelcomeEmail(service: EmailService, userEmail: string) {
  await service.send(userEmail, 'Welcome!', '<h1>Welcome aboard</h1>');
}`
        }
      ],
      useCases: [
        'Wrapping third-party APIs (payment gateways, email providers, cloud services) behind your own interface',
        'Legacy system integration — adapt old interfaces to new codebases without rewriting',
        'API versioning — adapter between v1 and v2 response shapes',
        'Testing — adapt real services to test interfaces for mock injection',
        'Cross-platform — adapt platform-specific APIs (browser vs Node) to a common interface'
      ],
      commonPitfalls: [
        'Putting business logic in the adapter — it should only translate, not make decisions',
        'Creating adapters prematurely — if you only ever use one email provider, direct usage is simpler',
        'Not handling error translation — the adaptee throws provider-specific errors that need mapping to your error types',
        'Adapters that leak the adaptee abstraction — your interface should not mirror the third-party shape'
      ],
      interviewTips: [
        'The Adapter pattern is one of the most common in real systems — have a concrete example from your experience',
        'Distinguish from Facade: Adapter changes interface of ONE existing object; Facade simplifies interface of an entire SUBSYSTEM',
        'Mention anti-corruption layer from DDD — it is an architectural-scale application of Adapter',
        'Discuss when Adapter becomes Facade: when wrapping multiple methods of a complex API into a simpler one'
      ],
      relatedConcepts: ['facade', 'bridge', 'decorator', 'proxy'],
      difficulty: 'intermediate',
      tags: ['structural', 'gof', 'integration', 'anti-corruption-layer']
    },
    {
      id: 'bridge',
      title: 'Bridge',
      description: 'Decouples an abstraction from its implementation so that the two can vary independently. The classic problem: if you have N abstractions and M implementations, inheritance gives you N*M subclasses. Bridge reduces this to N+M by composing an abstraction with an implementation via a reference. Think of it as "strategy for the whole object" rather than just one algorithm.',
      keyPoints: [
        'Prevents subclass explosion: without Bridge, adding a new dimension (e.g., new platform AND new feature) requires N*M classes',
        'Abstraction holds a reference to the implementor — composition, not inheritance',
        'Both sides can be extended independently: new abstractions without touching implementations, and vice versa',
        'Platform-specific code is the canonical use case: same high-level API, different implementations per OS/browser/device',
        'Differs from Adapter: Adapter makes existing incompatible interfaces work together (after the fact); Bridge is designed up front to separate dimensions of variation',
        'In TypeScript, interface + constructor injection often achieves Bridge without the ceremony'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Bridge: Notification System x Delivery Channel',
          code: `// Implementation dimension: HOW to deliver
interface MessageChannel {
  send(recipient: string, title: string, body: string): Promise<void>;
}

class EmailChannel implements MessageChannel {
  async send(recipient: string, title: string, body: string) {
    console.log(\`EMAIL to \${recipient}: [\${title}] \${body}\`);
  }
}

class SMSChannel implements MessageChannel {
  async send(recipient: string, title: string, body: string) {
    console.log(\`SMS to \${recipient}: \${body.slice(0, 160)}\`);
  }
}

class SlackChannel implements MessageChannel {
  async send(recipient: string, title: string, body: string) {
    console.log(\`SLACK #\${recipient}: *\${title}* \${body}\`);
  }
}

// Abstraction dimension: WHAT to send
abstract class Notification {
  constructor(protected readonly channel: MessageChannel) {}
  abstract notify(recipient: string): Promise<void>;
}

class UrgentNotification extends Notification {
  constructor(channel: MessageChannel, private readonly message: string) {
    super(channel);
  }
  async notify(recipient: string) {
    await this.channel.send(recipient, 'URGENT', \`⚠️ \${this.message}\`);
    await this.channel.send(recipient, 'URGENT REMINDER', \`Follow up: \${this.message}\`);
  }
}

class PromotionalNotification extends Notification {
  constructor(channel: MessageChannel, private readonly offer: string) {
    super(channel);
  }
  async notify(recipient: string) {
    await this.channel.send(recipient, 'Special Offer', this.offer);
  }
}

// N abstractions + M implementations instead of N*M subclasses
const urgentEmail = new UrgentNotification(new EmailChannel(), 'Server is down');
const promoSlack = new PromotionalNotification(new SlackChannel(), '50% off!');`
        }
      ],
      useCases: [
        'Cross-platform UI: same component API, different rendering backends (DOM, Canvas, native)',
        'Notification systems: notification types x delivery channels',
        'Database operations: query types (CRUD) x database engines (Postgres, Mongo, SQLite)',
        'File storage: storage operations x providers (local, S3, GCS)',
        'Rendering engines: shapes x rendering APIs (SVG, Canvas, WebGL)'
      ],
      commonPitfalls: [
        'Over-engineering: if you only have one dimension of variation, this is unnecessary complexity',
        'Confusing with Strategy: Strategy swaps one algorithm; Bridge separates two entire hierarchies',
        'Making the implementation interface too broad — keep it minimal (ISP)',
        'Tight coupling between abstraction and implementation despite the bridge — the abstraction should not assume implementation details'
      ],
      interviewTips: [
        'The key insight: "two independent dimensions of variation" — if you only see one, you don\'t need Bridge',
        'Draw the N*M explosion diagram vs N+M — makes the value immediately clear',
        'Real-world: JDBC is a Bridge — Java SQL API (abstraction) x database drivers (implementation)',
        'Distinguish from Adapter: Bridge is designed up front, Adapter is retrofitted'
      ],
      relatedConcepts: ['adapter', 'abstract-factory', 'strategy'],
      difficulty: 'advanced',
      tags: ['structural', 'gof', 'two-dimensions'],
      proTip: 'If you catch yourself making a class hierarchy like PlatformAFeatureX, PlatformAFeatureY, PlatformBFeatureX... stop. You have two dimensions of variation and need a Bridge.'
    },
    {
      id: 'composite',
      title: 'Composite',
      description: 'Composes objects into tree structures to represent part-whole hierarchies. Composite lets clients treat individual objects and compositions of objects uniformly. File systems, UI component trees, org charts, and menu structures are all composites. The power is recursive operations — calculate total size, render all children, search the tree — all with a single interface.',
      keyPoints: [
        'Uniform treatment: both leaf and composite nodes implement the same interface',
        'Recursive structure: a composite contains children that can themselves be composites',
        'Operations on a composite propagate to all children — "calculate total" sums all descendants',
        'The DOM is a Composite: Element and Text both implement Node; appendChild works uniformly',
        'React component tree is a Composite: components can contain other components or raw elements',
        'Be careful with operations that only make sense on one type — adding children to a leaf should either throw or be impossible at the type level',
        'TypeScript discriminated unions can represent the leaf/composite distinction at the type level'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Composite: File System with Recursive Size Calculation',
          code: `interface FileSystemEntry {
  readonly name: string;
  size(): number;
  display(indent?: number): string;
}

class File implements FileSystemEntry {
  constructor(
    readonly name: string,
    private readonly bytes: number,
  ) {}

  size(): number { return this.bytes; }

  display(indent = 0): string {
    return \`\${'  '.repeat(indent)}\${this.name} (\${this.bytes} bytes)\`;
  }
}

class Directory implements FileSystemEntry {
  private readonly children: FileSystemEntry[] = [];

  constructor(readonly name: string) {}

  add(entry: FileSystemEntry): this {
    this.children.push(entry);
    return this;
  }

  // Recursive — works regardless of nesting depth
  size(): number {
    return this.children.reduce((total, child) => total + child.size(), 0);
  }

  display(indent = 0): string {
    const prefix = '  '.repeat(indent);
    const header = \`\${prefix}\${this.name}/ (\${this.size()} bytes)\`;
    const childLines = this.children.map(c => c.display(indent + 1));
    return [header, ...childLines].join('\\n');
  }

  find(predicate: (entry: FileSystemEntry) => boolean): FileSystemEntry[] {
    const results: FileSystemEntry[] = [];
    for (const child of this.children) {
      if (predicate(child)) results.push(child);
      if (child instanceof Directory) results.push(...child.find(predicate));
    }
    return results;
  }
}

// Usage
const root = new Directory('src')
  .add(new File('index.ts', 150))
  .add(new Directory('utils')
    .add(new File('math.ts', 300))
    .add(new File('string.ts', 200)))
  .add(new Directory('components')
    .add(new File('Button.tsx', 400))
    .add(new File('Modal.tsx', 600)));

console.log(root.display());
console.log('Total:', root.size()); // 1650 bytes
console.log('Large files:', root.find(e => e.size() > 350));`
        }
      ],
      useCases: [
        'File system representation — files and directories with recursive operations',
        'UI component trees — layout containers that hold other containers or leaf widgets',
        'Menu systems — menu items that can be submenus containing more items',
        'Organization charts — employees and teams containing sub-teams',
        'Expression trees — AST nodes where operators contain sub-expressions'
      ],
      commonPitfalls: [
        'Operations that only apply to composites (add/remove children) exposed on the leaf interface — breaks ISP',
        'Infinite recursion if a composite accidentally contains itself — guard against cycles',
        'Not considering the performance cost of deep recursive operations on large trees',
        'Overusing Composite for flat lists — if nesting is never more than 1 level, a simple array is enough'
      ],
      interviewTips: [
        'The DOM is the best example — "every Node can contain child Nodes, and operations like textContent recurse the tree"',
        'Discuss the type safety trade-off: do you put add() on the base interface (convenient but leaf.add() is meaningless) or only on composite (safe but caller must know the type)?',
        'Mention React component tree as a modern Composite — components compose into trees uniformly',
        'Performance gotcha: recursive size/count on a deep tree can be expensive — consider caching or lazy evaluation'
      ],
      relatedConcepts: ['decorator', 'iterator', 'visitor', 'chain-of-responsibility'],
      difficulty: 'intermediate',
      tags: ['structural', 'gof', 'tree-structure', 'recursive']
    },
    {
      id: 'decorator',
      title: 'Decorator',
      description: 'Attaches additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality. In JavaScript/TypeScript, this pattern is everywhere: Express/Koa middleware, higher-order functions, and the TC39 decorators proposal. The core idea is wrapping: each decorator wraps the previous one, forming a chain.',
      keyPoints: [
        'Each decorator implements the same interface as the component it wraps — transparent to clients',
        'Decorators are composed at runtime, not compile time — more flexible than static inheritance',
        'Middleware chains (Express, Koa, Redux) are behavioral decorators: each wraps the next handler',
        'Higher-order functions are functional decorators: `withRetry(withLogging(fetchData))`',
        'TC39 decorators (`@decorator` syntax) formalize this for classes and methods',
        'Order matters: `withAuth(withLogging(handler))` checks auth first, logs second',
        'Performance overhead: each decorator adds a function call to the chain — measure for hot paths'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Decorator: Composable Data Fetcher Enhancements',
          code: `// Base interface
interface DataFetcher<T> {
  fetch(url: string): Promise<T>;
}

// Concrete implementation
class HttpFetcher<T> implements DataFetcher<T> {
  async fetch(url: string): Promise<T> {
    const res = await globalThis.fetch(url);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json() as Promise<T>;
  }
}

// Decorator: adds caching
class CachingFetcher<T> implements DataFetcher<T> {
  private cache = new Map<string, { data: T; expiry: number }>();

  constructor(
    private readonly inner: DataFetcher<T>,
    private readonly ttlMs: number,
  ) {}

  async fetch(url: string): Promise<T> {
    const cached = this.cache.get(url);
    if (cached && cached.expiry > Date.now()) return cached.data;
    const data = await this.inner.fetch(url);
    this.cache.set(url, { data, expiry: Date.now() + this.ttlMs });
    return data;
  }
}

// Decorator: adds retry with exponential backoff
class RetryFetcher<T> implements DataFetcher<T> {
  constructor(
    private readonly inner: DataFetcher<T>,
    private readonly maxRetries: number,
  ) {}

  async fetch(url: string): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.inner.fetch(url);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, 2 ** attempt * 100));
        }
      }
    }
    throw lastError;
  }
}

// Decorator: adds logging
class LoggingFetcher<T> implements DataFetcher<T> {
  constructor(private readonly inner: DataFetcher<T>) {}

  async fetch(url: string): Promise<T> {
    const start = performance.now();
    try {
      const data = await this.inner.fetch(url);
      console.log(\`FETCH \${url} — \${(performance.now() - start).toFixed(0)}ms\`);
      return data;
    } catch (err) {
      console.error(\`FETCH FAILED \${url} — \${(performance.now() - start).toFixed(0)}ms\`);
      throw err;
    }
  }
}

// Compose decorators — order is inside-out
const fetcher = new LoggingFetcher(
  new CachingFetcher(
    new RetryFetcher(
      new HttpFetcher(),
      3
    ),
    60_000
  )
);
// Flow: Log → check Cache → Retry(fetch) → return`
        }
      ],
      useCases: [
        'HTTP middleware — authentication, logging, rate limiting, compression as stackable layers',
        'Data fetching — add caching, retry, timeout, logging without modifying the base fetcher',
        'Stream processing — add encryption, compression, buffering to I/O streams',
        'UI components — add tooltip, loading state, error boundary wrappers',
        'Validation — compose validators: required → minLength → email'
      ],
      commonPitfalls: [
        'Decorator order bugs — the outermost decorator runs first, which is often counterintuitive',
        'Too many small decorators making debugging painful — the stack trace shows a deep chain of wrappers',
        'Identity confusion: `decoratedObj === originalObj` is false — equality checks and instanceof break',
        'Not forwarding all interface methods — the decorator must delegate EVERY method, not just the ones it enhances'
      ],
      interviewTips: [
        'Connect to middleware: "Express middleware is the Decorator pattern — each use() wraps the next handler"',
        'Higher-order functions are functional decorators — same idea without classes',
        'Versus inheritance: Decorator composes behavior at runtime; inheritance fixes it at compile time',
        'Real-world composition: `withAuth(withCache(withMetrics(baseHandler)))` — explain the execution order'
      ],
      relatedConcepts: ['adapter', 'proxy', 'composite', 'chain-of-responsibility', 'strategy'],
      difficulty: 'intermediate',
      tags: ['structural', 'gof', 'middleware', 'composition']
    },
    {
      id: 'facade',
      title: 'Facade',
      description: 'Provides a unified, simplified interface to a set of interfaces in a subsystem. Facade defines a higher-level interface that makes the subsystem easier to use. Unlike Adapter (which changes one interface), Facade orchestrates multiple subsystem components behind a single entry point. SDKs, API clients, and "service" classes that coordinate multiple lower-level operations are all facades.',
      keyPoints: [
        'Facade does not add new functionality — it simplifies access to existing functionality',
        'Multiple facades for different audiences: admin facade vs user facade vs internal facade',
        'Does NOT hide the subsystem — clients can still use subsystem classes directly if they need finer control',
        'Reduces coupling: clients depend on the facade, not on 10 subsystem classes directly',
        'SDK libraries are facades: the AWS SDK facade wraps HTTP calls, signing, retry, and serialization',
        'The "service layer" in web apps is often a facade over repositories, validators, and event emitters',
        'Anti-pattern risk: a facade that grows to 50+ methods is no longer simplifying anything — decompose it'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Facade: Order Processing System',
          code: `// Complex subsystem components
class InventoryService {
  async checkStock(productId: string, quantity: number): Promise<boolean> { return true; }
  async reserve(productId: string, quantity: number): Promise<string> { return 'reservation-id'; }
  async release(reservationId: string): Promise<void> {}
}

class PaymentService {
  async authorize(amount: number, paymentMethod: string): Promise<string> { return 'auth-id'; }
  async capture(authId: string): Promise<string> { return 'charge-id'; }
  async void(authId: string): Promise<void> {}
}

class ShippingService {
  async calculateRate(address: Address, weight: number): Promise<number> { return 9.99; }
  async createLabel(orderId: string, address: Address): Promise<string> { return 'label-url'; }
}

class NotificationService {
  async sendOrderConfirmation(email: string, orderId: string): Promise<void> {}
  async sendShippingUpdate(email: string, trackingUrl: string): Promise<void> {}
}

// Facade — one method orchestrates the entire workflow
class OrderFacade {
  constructor(
    private readonly inventory: InventoryService,
    private readonly payment: PaymentService,
    private readonly shipping: ShippingService,
    private readonly notifications: NotificationService,
  ) {}

  async placeOrder(order: OrderRequest): Promise<OrderResult> {
    // 1. Check stock
    const inStock = await this.inventory.checkStock(order.productId, order.quantity);
    if (!inStock) return { success: false, error: 'Out of stock' };

    // 2. Reserve inventory
    const reservationId = await this.inventory.reserve(order.productId, order.quantity);

    try {
      // 3. Authorize payment
      const authId = await this.payment.authorize(order.total, order.paymentMethod);

      // 4. Capture payment
      const chargeId = await this.payment.capture(authId);

      // 5. Create shipping label
      const labelUrl = await this.shipping.createLabel(order.id, order.address);

      // 6. Notify customer
      await this.notifications.sendOrderConfirmation(order.email, order.id);

      return { success: true, chargeId, labelUrl };
    } catch (error) {
      // Compensate on failure
      await this.inventory.release(reservationId);
      return { success: false, error: 'Order processing failed' };
    }
  }
}`
        }
      ],
      useCases: [
        'Order processing — coordinate inventory, payment, shipping, notifications',
        'User onboarding — create account, send verification, set up defaults, trigger welcome email',
        'SDK client libraries — wrap HTTP, auth, retry, serialization behind clean methods',
        'Database migration runner — coordinate schema changes, data migration, validation, rollback',
        'Deployment pipeline — orchestrate build, test, deploy, health check, rollback steps'
      ],
      commonPitfalls: [
        'God facade with 50+ methods — at that point it is not simplifying, it is just another large interface',
        'Adding business logic to the facade — it should orchestrate, not decide',
        'Not providing access to subsystem components — sometimes clients need fine-grained control',
        'Confusing Facade with Adapter: Adapter changes one interface, Facade simplifies a subsystem'
      ],
      interviewTips: [
        'Every SDK you use is a facade — use that as your example',
        'Distinguish from Adapter: "Adapter wraps ONE component to change its interface; Facade wraps MANY components to simplify the whole subsystem"',
        'Discuss when a facade becomes too big — decompose into domain-specific facades (UserFacade, OrderFacade)',
        'The service layer in MVC/clean architecture is essentially a set of facades over the domain'
      ],
      relatedConcepts: ['adapter', 'mediator', 'abstract-factory'],
      difficulty: 'beginner',
      tags: ['structural', 'gof', 'simplification']
    },
    {
      id: 'flyweight',
      title: 'Flyweight',
      description: 'Uses sharing to support large numbers of fine-grained objects efficiently. Flyweight separates intrinsic state (shared, immutable) from extrinsic state (unique per instance, passed in from outside). When you have thousands or millions of similar objects, Flyweight dramatically reduces memory by sharing the common parts. String interning, font glyph caching, and game entity pooling are classic applications.',
      keyPoints: [
        'Split state into intrinsic (shared, stored in flyweight) and extrinsic (unique, passed by client)',
        'Flyweight factory ensures sharing: same intrinsic key returns the same flyweight instance',
        'Intrinsic state MUST be immutable — if shared state mutates, all clients see the change',
        'JavaScript string interning is a language-level flyweight: identical string literals share memory',
        'React.memo and useMemo are caching patterns inspired by the same principle',
        'Worth the complexity only when object count is massive (thousands+) — premature optimization otherwise',
        'The flyweight pool is essentially a cache with identity semantics'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Flyweight: Game Particle System',
          code: `// Intrinsic state — shared between all particles of the same type
interface ParticleType {
  readonly sprite: string;     // sprite image path
  readonly color: string;      // base color
  readonly maxLife: number;    // maximum lifetime in ms
  readonly blendMode: string;  // rendering blend mode
}

// Flyweight factory — ensures sharing
class ParticleTypePool {
  private readonly types = new Map<string, ParticleType>();

  getType(sprite: string, color: string, maxLife: number, blendMode: string): ParticleType {
    const key = \`\${sprite}|\${color}|\${maxLife}|\${blendMode}\`;
    if (!this.types.has(key)) {
      this.types.set(key, Object.freeze({ sprite, color, maxLife, blendMode }));
    }
    return this.types.get(key)!;
  }

  get poolSize(): number { return this.types.size; }
}

// Extrinsic state — unique per particle instance
interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  type: ParticleType;  // reference to shared flyweight
}

class ParticleSystem {
  private readonly pool = new ParticleTypePool();
  private particles: Particle[] = [];

  emit(count: number, x: number, y: number) {
    // 10,000 particles but only a handful of ParticleType objects
    const fireType = this.pool.getType('fire.png', '#ff4400', 2000, 'additive');
    const smokeType = this.pool.getType('smoke.png', '#888888', 5000, 'normal');

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + Math.random() * 10,
        y: y + Math.random() * 10,
        velocityX: (Math.random() - 0.5) * 100,
        velocityY: -Math.random() * 200,
        life: 0,
        type: Math.random() > 0.7 ? smokeType : fireType,
      });
    }
  }

  // With 100K particles: instead of 100K full objects,
  // we have 100K lightweight objects pointing to ~5 shared type definitions
}`
        }
      ],
      useCases: [
        'Game engines — particle systems, tile maps, entity pooling where millions of objects share properties',
        'Text rendering — font glyphs shared across all instances of a character',
        'Document editors — character formatting (font, size, color) shared across identical runs',
        'Map rendering — thousands of markers sharing the same icon/style definitions',
        'Connection pooling — shared connection config, per-use state (current query, transaction)'
      ],
      commonPitfalls: [
        'Premature use — adding flyweight complexity for 50 objects wastes more engineer time than memory',
        'Mutable intrinsic state — breaks all shared instances simultaneously',
        'Wrong state split — putting extrinsic data into the flyweight or intrinsic data into the client',
        'Flyweight pool that never evicts — can itself become a memory leak if types are unbounded'
      ],
      interviewTips: [
        'The key question to ask: "How many objects?" — if the answer is not "thousands or more", Flyweight is overkill',
        'String interning is the simplest example: `"hello" === "hello"` reuses the same memory in JS engines',
        'Distinguish intrinsic (shared, immutable) from extrinsic (per-instance, mutable) — this is the core of the pattern',
        'Modern relevance: React.memo, CSS classes (shared style, unique element), database connection pools'
      ],
      relatedConcepts: ['composite', 'singleton', 'prototype'],
      difficulty: 'advanced',
      tags: ['structural', 'gof', 'memory-optimization', 'sharing']
    },
    {
      id: 'proxy',
      title: 'Proxy',
      description: 'Provides a surrogate or placeholder for another object to control access to it. Proxy types include virtual (lazy initialization), protection (access control), remote (network calls), caching, and logging. In JavaScript, the ES6 `Proxy` object lets you intercept and redefine fundamental operations on any object — making it trivially easy to implement transparent proxies for validation, access control, and aspect-oriented programming.',
      keyPoints: [
        'Same interface as the real subject — clients cannot tell they are using a proxy',
        'Virtual Proxy: defers expensive initialization until first use (lazy loading)',
        'Protection Proxy: checks permissions before delegating to the real object',
        'Caching Proxy: stores results of expensive operations for reuse',
        'Logging Proxy: records all method calls for debugging or auditing',
        'ES6 Proxy and Reflect: intercept get/set/apply/construct/has/deleteProperty and more',
        'Vue 3 reactivity, MobX observables, and Immer all use ES6 Proxy under the hood'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'ES6 Proxy: Validation, Logging, and Access Control',
          code: `// Generic proxy factory for access logging
function withAccessLog<T extends object>(target: T, label: string): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      console.log(\`[READ] \${label}.\${String(prop)}\`);
      return Reflect.get(obj, prop, receiver);
    },
    set(obj, prop, value, receiver) {
      console.log(\`[WRITE] \${label}.\${String(prop)} = \${JSON.stringify(value)}\`);
      return Reflect.set(obj, prop, value, receiver);
    },
  });
}

// Validation proxy — enforce invariants at the boundary
function withValidation<T extends Record<string, unknown>>(
  target: T,
  validators: Partial<Record<keyof T, (value: unknown) => boolean>>,
): T {
  return new Proxy(target, {
    set(obj, prop, value, receiver) {
      const validator = validators[prop as keyof T];
      if (validator && !validator(value)) {
        throw new Error(\`Validation failed for \${String(prop)}: \${JSON.stringify(value)}\`);
      }
      return Reflect.set(obj, prop, value, receiver);
    },
  });
}

// Virtual (lazy) proxy — defer heavy initialization
function lazyInit<T extends object>(factory: () => T): T {
  let instance: T | null = null;
  return new Proxy({} as T, {
    get(_, prop, receiver) {
      if (!instance) instance = factory();
      return Reflect.get(instance, prop, receiver);
    },
  });
}

// Usage
interface User { name: string; age: number; email: string }

const user = withValidation<User>(
  { name: 'Alice', age: 30, email: 'alice@test.com' },
  {
    age: (v) => typeof v === 'number' && v >= 0 && v <= 150,
    email: (v) => typeof v === 'string' && v.includes('@'),
  }
);

user.age = 25;        // OK
// user.age = -5;     // throws: Validation failed for age`
        }
      ],
      useCases: [
        'Lazy initialization — defer creating expensive objects (database connections, large data structures) until first access',
        'Access control — check user roles/permissions before allowing operations',
        'Caching/memoization — intercept method calls, return cached results for repeated inputs',
        'Reactive systems — Vue 3, MobX use Proxy to detect property access and trigger reactivity',
        'API rate limiting — proxy wraps API client, enforces call frequency limits'
      ],
      commonPitfalls: [
        'Proxy trap does not forward all operations — use Reflect to properly delegate and maintain prototype chain',
        'Performance: ES6 Proxy adds overhead per property access — avoid on hot paths (tight loops, rendering)',
        'Identity: `proxy !== target` — equality checks and Map/Set keys break when mixing proxied and unproxied references',
        'Not handling all traps: missing has/deleteProperty/ownKeys traps can cause surprising behavior with `in` operator or Object.keys()'
      ],
      interviewTips: [
        'ES6 Proxy is the modern way — class-based proxy is rarely needed in JS/TS',
        'Know the Proxy trap list: get, set, apply, construct, has, deleteProperty, ownKeys, getPrototypeOf',
        'Distinguish from Decorator: Decorator adds behavior, Proxy controls access. Decorator is visible, Proxy is transparent',
        'Real-world: "Vue 3 reactivity is built on ES6 Proxy — every reactive() call wraps the object in a Proxy"'
      ],
      relatedConcepts: ['decorator', 'adapter', 'facade', 'flyweight'],
      difficulty: 'intermediate',
      tags: ['structural', 'gof', 'es6-proxy', 'aop']
    },

    // ─── BEHAVIORAL ──────────────────────────────────────────────
    {
      id: 'chain-of-responsibility',
      title: 'Chain of Responsibility',
      description: 'Passes a request along a chain of handlers. Each handler decides either to process the request or to pass it along to the next handler in the chain. Express/Koa middleware, DOM event bubbling, and error handling cascades are all Chain of Responsibility. The key design decision is whether a handler breaks the chain (stops processing) or always passes through (like logging middleware).',
      keyPoints: [
        'Each handler has a reference to the next handler — linked list structure',
        'Handler either processes the request and stops, or delegates to the next handler',
        'Middleware pattern (Express, Koa) is Chain of Responsibility: each `app.use()` adds a handler that calls `next()`',
        'DOM event propagation: event bubbles up from target to document, each element can handle or pass through',
        'Decouples sender from receivers — the sender does not know which handler will process the request',
        'Two flavors: break on first match (exception handling) vs always continue (logging/metrics)',
        'Order of handlers matters — authentication before authorization before business logic'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Chain of Responsibility: Request Validation Pipeline',
          code: `type Request = {
  headers: Record<string, string>;
  body: unknown;
  user?: { id: string; roles: string[] };
};

type Response = { status: number; body: unknown };
type NextFn = () => Promise<Response>;
type Middleware = (req: Request, next: NextFn) => Promise<Response>;

// Authentication handler
const authenticate: Middleware = async (req, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return { status: 401, body: { error: 'No token provided' } };

  try {
    req.user = await verifyToken(token); // mutates request — adds user context
    return next(); // pass to next handler
  } catch {
    return { status: 401, body: { error: 'Invalid token' } };
  }
};

// Authorization handler
const requireRole = (role: string): Middleware => async (req, next) => {
  if (!req.user?.roles.includes(role)) {
    return { status: 403, body: { error: \`Requires role: \${role}\` } };
  }
  return next();
};

// Rate limiting handler
const rateLimit = (maxPerMinute: number): Middleware => {
  const counts = new Map<string, { count: number; resetAt: number }>();

  return async (req, next) => {
    const key = req.user?.id ?? req.headers['x-forwarded-for'] ?? 'anonymous';
    const now = Date.now();
    const entry = counts.get(key);

    if (entry && entry.resetAt > now && entry.count >= maxPerMinute) {
      return { status: 429, body: { error: 'Rate limit exceeded' } };
    }
    if (!entry || entry.resetAt <= now) {
      counts.set(key, { count: 1, resetAt: now + 60_000 });
    } else {
      entry.count++;
    }
    return next();
  };
};

// Compose chain
function compose(...middlewares: Middleware[]): Middleware {
  return (req, finalHandler) => {
    let index = -1;
    const dispatch = (i: number): Promise<Response> => {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      const fn = i === middlewares.length ? finalHandler : () => middlewares[i](req, () => dispatch(i + 1));
      return fn();
    };
    return dispatch(0);
  };
}

// Usage
const pipeline = compose(
  authenticate,
  rateLimit(100),
  requireRole('admin'),
);`
        }
      ],
      useCases: [
        'HTTP middleware stacks — auth, rate limiting, logging, CORS, compression, error handling',
        'Event processing pipelines — each handler enriches, filters, or transforms events',
        'Approval workflows — request escalates through approvers until someone has authority',
        'Error handling — try specific handlers first, fall back to generic ones',
        'Input validation — chain validators, stop at first failure'
      ],
      commonPitfalls: [
        'Forgetting to call next() — the request silently dies in the chain',
        'Calling next() multiple times — can cause duplicate processing and subtle bugs',
        'No handler matches — request falls off the chain without a response; always have a terminal handler',
        'Deep chains become hard to debug — add logging middleware to trace the flow'
      ],
      interviewTips: [
        'Express middleware IS this pattern — use it as your go-to example',
        'Discuss the "break vs continue" design decision: validation chains break on failure, logging chains always continue',
        'Connect to DOM events: event bubbling is Chain of Responsibility from target up to document',
        'Composition function: show you can compose middleware programmatically, not just linearly'
      ],
      relatedConcepts: ['decorator', 'command', 'mediator', 'strategy'],
      difficulty: 'intermediate',
      tags: ['behavioral', 'gof', 'middleware', 'pipeline']
    },
    {
      id: 'command',
      title: 'Command',
      description: 'Encapsulates a request as an object, thereby letting you parameterize clients with different requests, queue or log requests, and support undo/redo operations. Every Redux action is a command. Every API request payload is a command. Every menu item click that triggers an operation is a command. The pattern turns imperative operations into first-class data that can be stored, replayed, batched, and reversed.',
      keyPoints: [
        'Turns method calls into objects — operations become data that can be stored, queued, or transmitted',
        'Undo/redo: each command stores enough state to reverse itself; maintain a command history stack',
        'Macro commands: composite pattern applied to commands — execute a sequence as one unit',
        'Redux actions are commands: `{ type: "ADD_TODO", payload: { text: "..." } }` — serializable, replayable',
        'Command queue: decouple production of commands from execution — BullMQ, SQS patterns',
        'Decouples invoker (button, API endpoint) from receiver (the object that does the work)',
        'Commands can be serialized and sent over the network — CQRS command bus'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Command: Undo/Redo System for Text Editor',
          code: `interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

class InsertTextCommand implements Command {
  readonly description: string;

  constructor(
    private readonly doc: TextDocument,
    private readonly position: number,
    private readonly text: string,
  ) {
    this.description = \`Insert "\${text}" at \${position}\`;
  }

  execute(): void {
    this.doc.insert(this.position, this.text);
  }

  undo(): void {
    this.doc.delete(this.position, this.text.length);
  }
}

class DeleteTextCommand implements Command {
  readonly description: string;
  private deletedText = '';

  constructor(
    private readonly doc: TextDocument,
    private readonly position: number,
    private readonly length: number,
  ) {
    this.description = \`Delete \${length} chars at \${position}\`;
  }

  execute(): void {
    this.deletedText = this.doc.getText(this.position, this.length);
    this.doc.delete(this.position, this.length);
  }

  undo(): void {
    this.doc.insert(this.position, this.deletedText);
  }
}

// Command history manages undo/redo stacks
class CommandHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // New action clears redo history
  }

  undo(): void {
    const command = this.undoStack.pop();
    if (!command) return;
    command.undo();
    this.redoStack.push(command);
  }

  redo(): void {
    const command = this.redoStack.pop();
    if (!command) return;
    command.execute();
    this.undoStack.push(command);
  }

  getHistory(): string[] {
    return this.undoStack.map(c => c.description);
  }
}

// Usage
const history = new CommandHistory();
history.execute(new InsertTextCommand(doc, 0, 'Hello '));
history.execute(new InsertTextCommand(doc, 6, 'World'));
// doc: "Hello World"
history.undo();
// doc: "Hello "
history.redo();
// doc: "Hello World"`
        }
      ],
      useCases: [
        'Undo/redo systems — text editors, drawing tools, spreadsheets',
        'Job queues — serialize commands, process asynchronously (BullMQ, SQS)',
        'Transaction logging — record all operations for replay, audit, or debugging',
        'Macro recording — batch multiple commands into a single "macro" command',
        'Redux/Flux — actions as commands dispatched to a store'
      ],
      commonPitfalls: [
        'Undo that does not perfectly reverse execute — leads to state corruption over many operations',
        'Commands that capture references to mutable objects — the object might change between execute and undo',
        'Not clearing the redo stack when new commands are executed — leads to branching history',
        'Over-engineering: simple operations (toggle a boolean) do not need a full Command infrastructure'
      ],
      interviewTips: [
        'Redux actions are the most relatable example for web developers',
        'Undo/redo is the killer feature — "How would you implement Ctrl+Z?" is a Command pattern question',
        'Discuss serialization: commands as plain objects can be stored in a database, sent over websockets, replayed for debugging',
        'Connect to CQRS: the "C" in CQRS represents Command objects'
      ],
      relatedConcepts: ['memento', 'chain-of-responsibility', 'strategy', 'observer', 'cqrs'],
      difficulty: 'intermediate',
      tags: ['behavioral', 'gof', 'undo-redo', 'redux']
    },
    {
      id: 'iterator',
      title: 'Iterator',
      description: 'Provides a way to access the elements of an aggregate object sequentially without exposing its underlying representation. In JavaScript, this pattern is built into the language: `Symbol.iterator`, `for...of`, spread operator, destructuring, `Array.from()`, and generators are all part of the iteration protocol. The GoF pattern is interesting historically, but the real mastery is understanding JavaScript iteration protocols and generators.',
      keyPoints: [
        'JavaScript iteration protocol: any object with `[Symbol.iterator]()` returning `{ next(): { value, done } }` is iterable',
        'for...of, spread (...), Array.from(), and destructuring all consume iterables',
        'Generators (function*) are the easiest way to create custom iterators — yield values lazily',
        'External iterator: client controls iteration (calling next() explicitly); Internal iterator: collection controls iteration (forEach, map)',
        'Lazy evaluation: generators produce values on demand, not all at once — crucial for large/infinite sequences',
        'Async iteration: `Symbol.asyncIterator` and `for await...of` for streams, paginated APIs, real-time data',
        'Composable: chain generators like Unix pipes — filter, map, take, flatMap without materializing intermediate arrays'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Custom Iterables and Generator Composition',
          code: `// Custom iterable: paginated API client
async function* fetchAllPages<T>(
  fetchPage: (cursor?: string) => Promise<{ data: T[]; nextCursor?: string }>,
): AsyncGenerator<T> {
  let cursor: string | undefined;
  do {
    const page = await fetchPage(cursor);
    for (const item of page.data) {
      yield item; // Lazy — only fetches next page when consumer asks
    }
    cursor = page.nextCursor;
  } while (cursor);
}

// Generator composition — chain operations without intermediate arrays
function* filter<T>(iterable: Iterable<T>, predicate: (item: T) => boolean): Generator<T> {
  for (const item of iterable) {
    if (predicate(item)) yield item;
  }
}

function* map<T, U>(iterable: Iterable<T>, transform: (item: T) => U): Generator<U> {
  for (const item of iterable) {
    yield transform(item);
  }
}

function* take<T>(iterable: Iterable<T>, count: number): Generator<T> {
  let taken = 0;
  for (const item of iterable) {
    if (taken >= count) return;
    yield item;
    taken++;
  }
}

// Usage — processes millions of rows without loading all into memory
const users = fetchAllPages<User>((cursor) =>
  api.get('/users', { params: { cursor, limit: 100 } })
);

// Compose: fetch -> filter -> transform -> take first 10
// Only fetches as many pages as needed to find 10 active admins
for await (const admin of take(
  map(
    filter(users, u => u.active && u.role === 'admin'),
    u => ({ id: u.id, email: u.email }),
  ),
  10
)) {
  console.log(admin);
}`
        }
      ],
      useCases: [
        'Paginated API consumption — fetch pages lazily as the consumer iterates',
        'Large file processing — read line by line without loading entire file into memory',
        'Tree/graph traversal — yield nodes in BFS/DFS order via generators',
        'Infinite sequences — Fibonacci, random numbers, event streams',
        'Stream processing — compose filter/map/take operations on real-time data'
      ],
      commonPitfalls: [
        'Materializing the entire iterable with [...generator] when you only need a few items — defeats lazy evaluation',
        'Forgetting that generators are stateful and single-use — iterating twice requires creating a new generator',
        'Not handling generator cleanup: if the consumer breaks early, use try/finally in the generator to release resources',
        'Mixing sync and async iterables — for...of only works with sync, for await...of for async'
      ],
      interviewTips: [
        'Show you understand the protocol: `{ [Symbol.iterator](): { next(): { value: T, done: boolean } } }`',
        'Generators for tree traversal: "I would use a generator to yield nodes in DFS order — clean, lazy, composable"',
        'Discuss lazy evaluation: "This processes a 10GB file in constant memory because we yield one line at a time"',
        'Async generators for paginated APIs: "for await...of abstracts away pagination entirely"'
      ],
      relatedConcepts: ['composite', 'visitor', 'observer'],
      difficulty: 'intermediate',
      tags: ['behavioral', 'gof', 'generator', 'lazy-evaluation', 'javascript-native']
    },
    {
      id: 'mediator',
      title: 'Mediator',
      description: 'Defines an object that encapsulates how a set of objects interact. Mediator promotes loose coupling by keeping objects from referring to each other explicitly, and lets you vary their interaction independently. The chatroom analogy: participants send messages to the room (mediator), not to each other directly. In modern systems, event buses, message brokers, and React state management (context, Redux store) serve as mediators.',
      keyPoints: [
        'Reduces N-to-N relationships to N-to-1: each colleague talks only to the mediator',
        'Centralizes complex coordination logic — easier to understand in one place vs scattered across N objects',
        'Trade-off: reduces coupling between colleagues but the mediator can become a god object',
        'Event bus is a generic mediator: publish/subscribe without colleagues knowing each other',
        'Redux store is a mediator: components dispatch actions to the store, not to each other',
        'Differs from Observer: Observer is one-to-many notification; Mediator is many-to-many coordination with logic',
        'Socket.io rooms are mediators: participants send to the room, the room broadcasts to others'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Mediator: Typed Event Bus',
          code: `// Type-safe event bus — colleagues communicate through events, not direct references
type EventMap = {
  'user:created': { userId: string; email: string };
  'user:deleted': { userId: string };
  'order:placed': { orderId: string; userId: string; total: number };
  'order:shipped': { orderId: string; trackingNumber: string };
  'notification:send': { to: string; message: string };
};

type EventHandler<T> = (payload: T) => void | Promise<void>;

class EventBus {
  private handlers = new Map<string, Set<EventHandler<unknown>>>();

  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    const handlerSet = this.handlers.get(event)!;
    handlerSet.add(handler as EventHandler<unknown>);

    // Return unsubscribe function
    return () => handlerSet.delete(handler as EventHandler<unknown>);
  }

  async emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): Promise<void> {
    const handlerSet = this.handlers.get(event);
    if (!handlerSet) return;
    await Promise.all(
      [...handlerSet].map(handler => handler(payload))
    );
  }
}

// Colleagues — each only knows about the event bus, not each other
class UserService {
  constructor(private readonly bus: EventBus) {}

  async createUser(email: string) {
    const userId = crypto.randomUUID();
    // ... save to database
    await this.bus.emit('user:created', { userId, email });
  }
}

class NotificationService {
  constructor(bus: EventBus) {
    // React to events from other services
    bus.on('user:created', async ({ email }) => {
      await this.sendWelcomeEmail(email);
    });
    bus.on('order:shipped', async ({ orderId, trackingNumber }) => {
      await this.bus.emit('notification:send', {
        to: 'customer',
        message: \`Order \${orderId} shipped: \${trackingNumber}\`,
      });
    });
  }
  private bus: EventBus;
  private async sendWelcomeEmail(email: string) { /* ... */ }
}

class AnalyticsService {
  constructor(bus: EventBus) {
    bus.on('user:created', ({ userId }) => this.track('signup', { userId }));
    bus.on('order:placed', ({ total }) => this.track('purchase', { total }));
  }
  private track(event: string, data: Record<string, unknown>) { /* ... */ }
}`
        }
      ],
      useCases: [
        'UI component coordination — form fields, wizards, dashboards with interdependent widgets',
        'Microservice event bus — services communicate through events, not direct HTTP calls',
        'Chat systems — messages go through the room (mediator), not peer-to-peer',
        'Air traffic control — planes communicate with tower, not with each other',
        'Game systems — game objects interact through a game engine mediator'
      ],
      commonPitfalls: [
        'God mediator — too much logic centralized becomes harder to maintain than the original N-to-N coupling',
        'Event spaghetti — too many loosely typed events make it hard to trace data flow',
        'Missing error handling: if one handler throws, should others still execute? Define the contract',
        'Memory leaks: forgetting to unsubscribe handlers when colleagues are destroyed'
      ],
      interviewTips: [
        'Redux as mediator: "Components dispatch to the store, subscribe to the store — never talk directly to each other"',
        'Versus Observer: "Observer is one publisher, many subscribers. Mediator coordinates many-to-many interactions with logic"',
        'Versus Event Bus: "An event bus IS a generic mediator — no coordination logic, just message routing"',
        'Discuss the god mediator problem: "The mediator can grow unbounded — decompose by domain when this happens"'
      ],
      relatedConcepts: ['observer', 'facade', 'command', 'event-bus'],
      difficulty: 'intermediate',
      tags: ['behavioral', 'gof', 'decoupling', 'event-driven']
    },
    {
      id: 'memento',
      title: 'Memento',
      description: 'Captures and externalizes an object\'s internal state without violating encapsulation, so that the object can be restored to that state later. Memento enables undo, snapshots, time-travel debugging, and save/load systems. Combined with Command pattern, it forms the backbone of undo/redo in every editor. Redux DevTools time-travel is essentially Memento at scale.',
      keyPoints: [
        'Three roles: Originator (creates mementos), Memento (stores state), Caretaker (manages mementos)',
        'Memento should be opaque to the Caretaker — it stores it but cannot inspect or modify the state',
        'Serialization (JSON.stringify) creates portable mementos that can be persisted to disk or sent over the network',
        'Deep clone is critical — shallow copies share references, defeating the purpose of snapshots',
        'Memory trade-off: each memento stores a full copy of state; for large states, consider incremental snapshots or deltas',
        'Redux DevTools time-travel: every dispatched action creates a state memento that you can jump to',
        'Combined with Command: Command stores what to do/undo; Memento stores the full state to restore if needed'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Memento: Editor State with Snapshots',
          code: `// Memento — opaque state container
interface EditorMemento {
  readonly timestamp: number;
  readonly label: string;
  // State is private — only the originator can read it
  readonly _state: string; // serialized state
}

// Originator — creates and restores from mementos
class TextEditor {
  private content = '';
  private cursorPosition = 0;
  private selection: { start: number; end: number } | null = null;

  type(text: string): void {
    this.content =
      this.content.slice(0, this.cursorPosition) +
      text +
      this.content.slice(this.cursorPosition);
    this.cursorPosition += text.length;
    this.selection = null;
  }

  delete(count: number): void {
    const start = Math.max(0, this.cursorPosition - count);
    this.content = this.content.slice(0, start) + this.content.slice(this.cursorPosition);
    this.cursorPosition = start;
  }

  save(label: string): EditorMemento {
    return {
      timestamp: Date.now(),
      label,
      _state: JSON.stringify({
        content: this.content,
        cursorPosition: this.cursorPosition,
        selection: this.selection,
      }),
    };
  }

  restore(memento: EditorMemento): void {
    const state = JSON.parse(memento._state);
    this.content = state.content;
    this.cursorPosition = state.cursorPosition;
    this.selection = state.selection;
  }

  getContent(): string { return this.content; }
}

// Caretaker — manages memento history
class EditorHistory {
  private mementos: EditorMemento[] = [];
  private currentIndex = -1;

  push(memento: EditorMemento): void {
    // Discard any "future" mementos when new state is saved
    this.mementos = this.mementos.slice(0, this.currentIndex + 1);
    this.mementos.push(memento);
    this.currentIndex++;
  }

  undo(): EditorMemento | undefined {
    if (this.currentIndex <= 0) return undefined;
    return this.mementos[--this.currentIndex];
  }

  redo(): EditorMemento | undefined {
    if (this.currentIndex >= this.mementos.length - 1) return undefined;
    return this.mementos[++this.currentIndex];
  }

  getSnapshots(): Array<{ label: string; timestamp: number }> {
    return this.mementos.map(m => ({ label: m.label, timestamp: m.timestamp }));
  }
}

// Usage
const editor = new TextEditor();
const history = new EditorHistory();

history.push(editor.save('Initial'));
editor.type('Hello World');
history.push(editor.save('Typed greeting'));
editor.delete(5);
history.push(editor.save('Deleted World'));

// Time travel
const snapshot = history.undo();
if (snapshot) editor.restore(snapshot); // Back to "Hello World"`
        }
      ],
      useCases: [
        'Undo/redo in editors — save state before each operation, restore on undo',
        'Game save/load — serialize game state to disk, restore on load',
        'Transaction rollback — save state before transaction, restore on failure',
        'Time-travel debugging — Redux DevTools, record every state transition',
        'Form draft saving — periodically save form state, restore on page reload'
      ],
      commonPitfalls: [
        'Shallow copies — memento shares references with the original, mutations in one affect both',
        'Memory bloat — storing full state on every change for large objects; use delta/incremental snapshots',
        'Serialization failures — not all state is serializable (functions, DOM refs, circular references)',
        'Caretaker inspecting memento state — breaks encapsulation and couples caretaker to originator internals'
      ],
      interviewTips: [
        'Redux time-travel debugging is the best modern example of Memento',
        'Discuss the memory trade-off: "Full snapshots vs incremental deltas depends on state size and change frequency"',
        'Combined with Command: "Command is WHAT happened, Memento is the FULL STATE at that point"',
        'Serialization: "structuredClone for in-memory snapshots, JSON.stringify for persistence"'
      ],
      relatedConcepts: ['command', 'prototype', 'iterator'],
      difficulty: 'intermediate',
      tags: ['behavioral', 'gof', 'undo-redo', 'snapshot']
    },
    {
      id: 'observer',
      title: 'Observer',
      description: 'Defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically. This is perhaps the most widely used pattern in modern frontend development: DOM events, React state, Vue reactivity, RxJS, Node.js EventEmitter, and WebSocket handlers are all Observer implementations. The pattern is so fundamental it is practically invisible.',
      keyPoints: [
        'One-to-many: one subject, many observers. Subject maintains a list and notifies all on change',
        'Push model: subject sends the new state to observers. Pull model: subject notifies, observers query for what they need',
        'DOM addEventListener is the browser\'s Observer implementation',
        'Node.js EventEmitter: on/emit/off — the standard server-side Observer',
        'React useState + useEffect: component re-renders (observes) when state changes',
        'RxJS Observables: Observer pattern + functional composition + async streams',
        'Memory leaks: the #1 problem — observers that are never removed keep the subject reference alive'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Type-Safe Observable with Subscription Management',
          code: `type Listener<T> = (value: T) => void;
type Unsubscribe = () => void;

class Observable<T> {
  private listeners = new Set<Listener<T>>();
  private _value: T;

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T { return this._value; }

  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    // Immediately notify with current value
    listener(this._value);
    // Return cleanup function — prevents memory leaks
    return () => this.listeners.delete(listener);
  }

  set(newValue: T): void {
    if (Object.is(this._value, newValue)) return; // Skip if unchanged
    this._value = newValue;
    // Notify all observers
    for (const listener of this.listeners) {
      listener(newValue);
    }
  }

  update(updater: (current: T) => T): void {
    this.set(updater(this._value));
  }

  // Derived observable — recomputes when source changes
  derive<U>(transform: (value: T) => U): Observable<U> {
    const derived = new Observable(transform(this._value));
    this.subscribe(value => derived.set(transform(value)));
    return derived;
  }
}

// Usage
const count = new Observable(0);
const doubled = count.derive(n => n * 2);
const label = count.derive(n => \`Count: \${n}\`);

const unsub1 = doubled.subscribe(v => console.log('Doubled:', v));
const unsub2 = label.subscribe(v => console.log('Label:', v));

count.set(5);
// Output: "Doubled: 10", "Label: Count: 5"

// Cleanup — CRITICAL to prevent memory leaks
unsub1();
unsub2();`
        }
      ],
      useCases: [
        'UI reactivity — React, Vue, Svelte state management systems',
        'Event systems — DOM events, Node.js EventEmitter, custom event buses',
        'Real-time updates — WebSocket message handlers, Server-Sent Events',
        'Data binding — form inputs bound to model objects, spreadsheet cell dependencies',
        'Pub/sub messaging — decoupled communication between application modules'
      ],
      commonPitfalls: [
        'Memory leaks — the single biggest issue: listeners added but never removed when component unmounts',
        'Notification storms — one change triggers observers that trigger other observers (cascading updates)',
        'Stale closures — observer callback captures old values from its closure scope',
        'Order dependency — observers execute in subscription order, but code should not depend on this'
      ],
      interviewTips: [
        'Every frontend framework implements Observer: React (useState/useEffect), Vue (reactive), Svelte (stores)',
        'The returned unsubscribe function is the modern pattern — avoids managing listener references manually',
        'Discuss push vs pull: "React is pull (component re-renders and reads new state); EventEmitter is push (data in the callback)"',
        'RxJS takes Observer further: "Observables are observers with operators — map, filter, debounce, merge"'
      ],
      relatedConcepts: ['mediator', 'command', 'strategy', 'state', 'event-bus'],
      difficulty: 'intermediate',
      tags: ['behavioral', 'gof', 'reactive', 'event-driven', 'javascript-native']
    },
    {
      id: 'state',
      title: 'State',
      description: 'Allows an object to alter its behavior when its internal state changes. The object will appear to change its class. State pattern replaces complex conditional logic (if/else chains or switch statements on a status field) with polymorphic state objects. Each state encapsulates the behavior for that state and handles transitions to other states. Finite state machines, workflow engines, and UI component states all use this pattern.',
      keyPoints: [
        'Each state is its own class/object implementing a common interface — eliminates conditional branches',
        'State transitions are explicit: each state knows which states it can transition to and under what conditions',
        'Context (the object with changing behavior) delegates to the current state object',
        'Versus if/else chains: State pattern is better when you have many states, complex transitions, or states added over time',
        'Finite State Machines (FSMs): formalize the states, events, and transitions — XState is the popular TS library',
        'Guard conditions: transitions can have preconditions that must be met before the transition fires',
        'State pattern is overkill for 2-3 simple states — a boolean or enum with a switch is fine there'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'State: Order Lifecycle State Machine',
          code: `interface OrderState {
  readonly name: string;
  confirm(order: Order): void;
  ship(order: Order): void;
  deliver(order: Order): void;
  cancel(order: Order): void;
}

class Order {
  private state: OrderState;

  constructor(
    readonly id: string,
    readonly items: ReadonlyArray<{ productId: string; quantity: number }>,
  ) {
    this.state = new PendingState();
  }

  // State transition — called by state objects
  transitionTo(state: OrderState): void {
    console.log(\`Order \${this.id}: \${this.state.name} → \${state.name}\`);
    this.state = state;
  }

  // Delegate to current state
  confirm(): void { this.state.confirm(this); }
  ship(): void { this.state.ship(this); }
  deliver(): void { this.state.deliver(this); }
  cancel(): void { this.state.cancel(this); }
  getStatus(): string { return this.state.name; }
}

class PendingState implements OrderState {
  readonly name = 'pending';
  confirm(order: Order): void { order.transitionTo(new ConfirmedState()); }
  ship(): void { throw new Error('Cannot ship a pending order — confirm first'); }
  deliver(): void { throw new Error('Cannot deliver a pending order'); }
  cancel(order: Order): void { order.transitionTo(new CancelledState()); }
}

class ConfirmedState implements OrderState {
  readonly name = 'confirmed';
  confirm(): void { throw new Error('Order already confirmed'); }
  ship(order: Order): void { order.transitionTo(new ShippedState()); }
  deliver(): void { throw new Error('Cannot deliver — not shipped yet'); }
  cancel(order: Order): void { order.transitionTo(new CancelledState()); }
}

class ShippedState implements OrderState {
  readonly name = 'shipped';
  confirm(): void { throw new Error('Cannot confirm — already shipped'); }
  ship(): void { throw new Error('Already shipped'); }
  deliver(order: Order): void { order.transitionTo(new DeliveredState()); }
  cancel(): void { throw new Error('Cannot cancel — already shipped'); }
}

class DeliveredState implements OrderState {
  readonly name = 'delivered';
  confirm(): void { throw new Error('Order completed'); }
  ship(): void { throw new Error('Order completed'); }
  deliver(): void { throw new Error('Already delivered'); }
  cancel(): void { throw new Error('Cannot cancel — already delivered'); }
}

class CancelledState implements OrderState {
  readonly name = 'cancelled';
  confirm(): void { throw new Error('Order cancelled'); }
  ship(): void { throw new Error('Order cancelled'); }
  deliver(): void { throw new Error('Order cancelled'); }
  cancel(): void { throw new Error('Already cancelled'); }
}

// Usage
const order = new Order('ORD-001', [{ productId: 'P1', quantity: 2 }]);
order.confirm();  // pending → confirmed
order.ship();     // confirmed → shipped
order.deliver();  // shipped → delivered
// order.cancel() // throws: Cannot cancel — already delivered`
        }
      ],
      useCases: [
        'Order lifecycle — pending, confirmed, shipped, delivered, cancelled with strict transition rules',
        'UI component states — loading, error, success, empty with different rendering per state',
        'Connection management — disconnected, connecting, connected, reconnecting',
        'Document workflow — draft, review, approved, published, archived',
        'Game entity AI — idle, patrolling, chasing, attacking, fleeing'
      ],
      commonPitfalls: [
        'State classes that know about each other — creates tight coupling; use the context as mediator',
        'Missing error handling for invalid transitions — every state must handle every event, even if just to reject it',
        'Too many states: if you have 20+ states with complex transitions, use a proper FSM library like XState',
        'Mixing state logic with side effects — keep state transitions pure, trigger side effects in the context'
      ],
      interviewTips: [
        'Lead with the problem: "Instead of a switch on `order.status` in every method, each state IS its own object with behavior"',
        'Compare with XState: "XState formalizes this with a state machine definition — states, events, transitions, guards"',
        'Discuss when it is overkill: "For a simple loading/error/success trio, a discriminated union is cleaner than three state classes"',
        'The real value is in invalid transition handling: "The ShippedState makes it impossible to confirm an already-shipped order"'
      ],
      relatedConcepts: ['strategy', 'command', 'memento', 'observer'],
      difficulty: 'intermediate',
      tags: ['behavioral', 'gof', 'state-machine', 'fsm']
    },
    {
      id: 'strategy',
      title: 'Strategy',
      description: 'Defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it. In JavaScript, first-class functions ARE strategies: `Array.sort(compareFn)`, `Array.filter(predicate)`, `router.use(handler)`. The GoF version with classes and interfaces is still useful for complex strategies with multiple methods, but the functional version is the day-to-day reality.',
      keyPoints: [
        'First-class functions in JavaScript make the class-based GoF version unnecessary for simple cases',
        'Array.sort(), Array.filter(), event handlers, middleware — all accept strategy functions',
        'Use classes/interfaces when the strategy has multiple methods or needs to be configured with state',
        'Strategy is selected at runtime — unlike Template Method where the algorithm skeleton is fixed at compile time',
        'Context does not care which strategy it uses — just that it implements the interface',
        'Strategies can be swapped at runtime: change sorting algorithm, switch compression codec, etc.',
        'Combined with Factory: factory creates the right strategy based on configuration'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Strategy: Pricing Rules Engine',
          code: `// Strategy interface — complex enough to warrant a full interface
interface PricingStrategy {
  calculateDiscount(subtotal: number, customer: Customer): number;
  description: string;
}

interface Customer {
  tier: 'regular' | 'silver' | 'gold' | 'platinum';
  totalPurchases: number;
  memberSince: Date;
}

// Concrete strategies
const regularPricing: PricingStrategy = {
  description: 'Standard pricing — no discount',
  calculateDiscount: () => 0,
};

const percentageDiscount = (percent: number): PricingStrategy => ({
  description: \`\${percent}% discount\`,
  calculateDiscount: (subtotal) => subtotal * (percent / 100),
});

const tieredPricing: PricingStrategy = {
  description: 'Tier-based discount',
  calculateDiscount: (subtotal, customer) => {
    const rates: Record<Customer['tier'], number> = {
      regular: 0, silver: 0.05, gold: 0.10, platinum: 0.15,
    };
    return subtotal * (rates[customer.tier] ?? 0);
  },
};

const loyaltyPricing: PricingStrategy = {
  description: 'Loyalty-based discount',
  calculateDiscount: (subtotal, customer) => {
    const years = (Date.now() - customer.memberSince.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const loyaltyRate = Math.min(years * 0.02, 0.20); // 2% per year, max 20%
    return subtotal * loyaltyRate;
  },
};

// Composite strategy — best of multiple strategies
const bestDiscount = (...strategies: PricingStrategy[]): PricingStrategy => ({
  description: \`Best of: \${strategies.map(s => s.description).join(', ')}\`,
  calculateDiscount: (subtotal, customer) =>
    Math.max(...strategies.map(s => s.calculateDiscount(subtotal, customer))),
});

// Context
class PricingEngine {
  constructor(private strategy: PricingStrategy) {}

  setStrategy(strategy: PricingStrategy): void {
    this.strategy = strategy;
  }

  calculateTotal(subtotal: number, customer: Customer): number {
    const discount = this.strategy.calculateDiscount(subtotal, customer);
    return Math.max(0, subtotal - discount);
  }
}

// Usage — swap strategies at runtime
const engine = new PricingEngine(bestDiscount(tieredPricing, loyaltyPricing));
const total = engine.calculateTotal(100, { tier: 'gold', totalPurchases: 5000, memberSince: new Date('2020-01-01') });`
        }
      ],
      useCases: [
        'Pricing/discount engines — different pricing rules per customer segment or promotion',
        'Sorting algorithms — swap comparison functions at runtime',
        'Compression — choose algorithm (gzip, brotli, zstd) based on content type',
        'Validation — different validation strategies for different form types',
        'Authentication — local, OAuth, SAML, JWT strategies (Passport.js is entirely strategy-based)'
      ],
      commonPitfalls: [
        'Over-engineering: `[1,2,3].sort((a,b) => a-b)` IS the Strategy pattern — you do not need a SortStrategy class for this',
        'Strategy explosion: if you have 50 strategies, you may need a higher-level organizing pattern (rules engine)',
        'Strategy with side effects — strategies should be pure functions when possible, making them testable and composable',
        'Not providing a default strategy — callers must always set one; provide a sensible default'
      ],
      interviewTips: [
        'Every callback function in JavaScript is a strategy — Array.sort, Array.filter, event handlers',
        'Versus Template Method: "Strategy swaps the entire algorithm; Template Method swaps steps within a fixed skeleton"',
        'Versus State: "State changes behavior based on internal state transitions; Strategy is selected externally by the client"',
        'Passport.js is the canonical Node.js example: `passport.use(new GoogleStrategy(...))`'
      ],
      relatedConcepts: ['template-method', 'state', 'factory-method', 'command'],
      difficulty: 'beginner',
      tags: ['behavioral', 'gof', 'functional', 'interchangeable']
    },
    {
      id: 'template-method',
      title: 'Template Method',
      description: 'Defines the skeleton of an algorithm in a base class, letting subclasses override specific steps without changing the algorithm\'s structure. This is the "Hollywood Principle" — don\'t call us, we\'ll call you. The base class controls the workflow; subclasses fill in the blanks. React class component lifecycle (componentDidMount, render, componentWillUnmount) was a Template Method. Express route handlers follow the same idea.',
      keyPoints: [
        'Algorithm skeleton is fixed in the base class — the sequence of steps does not change',
        'Hook methods: optional steps that subclasses CAN override (with default behavior)',
        'Abstract methods: required steps that subclasses MUST implement',
        'Hollywood Principle: framework calls your code, not the other way around',
        'React class lifecycle was Template Method: mount → render → update → unmount with overridable steps',
        'Versus Strategy: Template Method uses inheritance to vary steps; Strategy uses composition to vary the whole algorithm',
        'In functional style: higher-order function that takes step functions as parameters (closer to Strategy)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Template Method: Data Processing Pipeline',
          code: `abstract class DataProcessor<TRaw, TParsed, TResult> {
  // Template method — defines the algorithm skeleton
  async process(source: string): Promise<TResult> {
    const raw = await this.fetch(source);          // Step 1: fetch data
    const validated = this.validate(raw);           // Step 2: validate
    const parsed = this.parse(validated);            // Step 3: parse
    const transformed = this.transform(parsed);      // Step 4: transform
    await this.onComplete(transformed);              // Hook: optional post-processing
    return transformed;
  }

  // Abstract methods — subclasses MUST implement
  protected abstract fetch(source: string): Promise<TRaw>;
  protected abstract parse(raw: TRaw): TParsed;
  protected abstract transform(parsed: TParsed): TResult;

  // Concrete method with default — subclasses CAN override
  protected validate(raw: TRaw): TRaw {
    return raw; // Default: no validation
  }

  // Hook — default no-op, override for side effects
  protected async onComplete(_result: TResult): Promise<void> {}
}

// Concrete: CSV file processor
class CSVProcessor extends DataProcessor<string, string[][], Record<string, string>[]> {
  protected async fetch(source: string): Promise<string> {
    const response = await globalThis.fetch(source);
    return response.text();
  }

  protected validate(raw: string): string {
    if (!raw.trim()) throw new Error('Empty CSV');
    return raw;
  }

  protected parse(raw: string): string[][] {
    return raw.split('\\n').map(line => line.split(','));
  }

  protected transform(parsed: string[][]): Record<string, string>[] {
    const [headers, ...rows] = parsed;
    return rows.map(row =>
      Object.fromEntries(headers.map((h, i) => [h.trim(), row[i]?.trim() ?? '']))
    );
  }

  protected async onComplete(result: Record<string, string>[]): Promise<void> {
    console.log(\`Processed \${result.length} rows\`);
  }
}

// Concrete: JSON API processor
class JSONAPIProcessor extends DataProcessor<unknown, { items: unknown[] }, unknown[]> {
  protected async fetch(source: string): Promise<unknown> {
    const response = await globalThis.fetch(source);
    return response.json();
  }

  protected parse(raw: unknown): { items: unknown[] } {
    if (!raw || typeof raw !== 'object' || !('items' in raw)) {
      throw new Error('Expected { items: [] }');
    }
    return raw as { items: unknown[] };
  }

  protected transform(parsed: { items: unknown[] }): unknown[] {
    return parsed.items;
  }
}

// Usage — same algorithm, different implementations
const csvData = await new CSVProcessor().process('https://data.example.com/users.csv');
const apiData = await new JSONAPIProcessor().process('https://api.example.com/users');`
        }
      ],
      useCases: [
        'Data processing pipelines — fetch, validate, parse, transform with varying implementations per source',
        'Framework lifecycle hooks — React class components, Express middleware, test frameworks (beforeEach/afterEach)',
        'Code generation — same generation steps, different outputs (HTML, PDF, Markdown)',
        'Build systems — clean, compile, test, package with overridable steps per language/platform',
        'Authentication flows — same ceremony (redirect, callback, token exchange), different providers'
      ],
      commonPitfalls: [
        'Too many abstract methods — subclasses become complex; prefer sensible defaults (hooks) over forced implementations',
        'Fragile base class: changing the template method breaks all subclasses — test the base class thoroughly',
        'Deep inheritance hierarchies — more than 2 levels of Template Method becomes hard to follow',
        'Not documenting which methods are hooks vs abstract — subclass authors need a clear contract'
      ],
      interviewTips: [
        'Versus Strategy: "Template Method is inheritance-based (fixed skeleton, override steps); Strategy is composition-based (swap entire algorithm)"',
        'Hollywood Principle: "Your subclass provides the steps; the base class decides when to call them"',
        'Modern alternatives: "In functional TypeScript, higher-order functions achieve the same result without inheritance"',
        'Framework hooks are all Template Methods: "React lifecycle, Express middleware, Jest beforeEach"'
      ],
      relatedConcepts: ['strategy', 'factory-method', 'hook'],
      difficulty: 'intermediate',
      tags: ['behavioral', 'gof', 'inheritance', 'hollywood-principle']
    },
    {
      id: 'visitor',
      title: 'Visitor',
      description: 'Lets you define a new operation on an object structure without changing the classes of the elements on which it operates. Visitor uses double dispatch: the element accepts a visitor, then calls the visitor\'s method for its specific type. AST transformations, compiler passes, and serialization systems all use Visitor. In TypeScript, discriminated unions with switch statements often replace the need for the full GoF visitor.',
      keyPoints: [
        'Double dispatch: element.accept(visitor) calls visitor.visitConcreteElement(this) — selects method by both types',
        'Add new operations (visitors) without modifying element classes — but adding new element types requires updating all visitors',
        'Ideal when element hierarchy is stable but operations change frequently',
        'AST processing: parser produces the tree (stable), but analyzers/transformers/formatters (operations) are added over time',
        'TypeScript discriminated unions + switch/exhaustive check is often simpler than full GoF Visitor for small hierarchies',
        'The accept() method in each element is boilerplate — this is the pattern\'s main ergonomic cost',
        'Related to Interpreter: Visitor traverses an existing structure, Interpreter evaluates/executes it'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Visitor: AST Processing with Type-Safe Visitors',
          code: `// AST nodes — stable hierarchy
type Expr =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'binary'; op: '+' | '-' | '*' | '/'; left: Expr; right: Expr }
  | { type: 'unary'; op: '-' | '!'; operand: Expr }
  | { type: 'call'; callee: string; args: Expr[] };

// Visitor using discriminated union + exhaustive switch (TypeScript-idiomatic)
function visit<T>(expr: Expr, visitor: ExprVisitor<T>): T {
  switch (expr.type) {
    case 'number': return visitor.visitNumber(expr);
    case 'string': return visitor.visitString(expr);
    case 'binary': return visitor.visitBinary(expr);
    case 'unary': return visitor.visitUnary(expr);
    case 'call': return visitor.visitCall(expr);
  }
}

interface ExprVisitor<T> {
  visitNumber(expr: Extract<Expr, { type: 'number' }>): T;
  visitString(expr: Extract<Expr, { type: 'string' }>): T;
  visitBinary(expr: Extract<Expr, { type: 'binary' }>): T;
  visitUnary(expr: Extract<Expr, { type: 'unary' }>): T;
  visitCall(expr: Extract<Expr, { type: 'call' }>): T;
}

// Visitor 1: Pretty printer
const printer: ExprVisitor<string> = {
  visitNumber: (e) => String(e.value),
  visitString: (e) => \`"\${e.value}"\`,
  visitBinary: (e) => \`(\${visit(e.left, printer)} \${e.op} \${visit(e.right, printer)})\`,
  visitUnary: (e) => \`(\${e.op}\${visit(e.operand, printer)})\`,
  visitCall: (e) => \`\${e.callee}(\${e.args.map(a => visit(a, printer)).join(', ')})\`,
};

// Visitor 2: Evaluator
const evaluator: ExprVisitor<number> = {
  visitNumber: (e) => e.value,
  visitString: (e) => parseFloat(e.value) || 0,
  visitBinary: (e) => {
    const l = visit(e.left, evaluator);
    const r = visit(e.right, evaluator);
    switch (e.op) {
      case '+': return l + r;
      case '-': return l - r;
      case '*': return l * r;
      case '/': return r === 0 ? 0 : l / r;
    }
  },
  visitUnary: (e) => {
    const val = visit(e.operand, evaluator);
    return e.op === '-' ? -val : val === 0 ? 1 : 0;
  },
  visitCall: () => { throw new Error('Function calls not supported in evaluator'); },
};

// Usage — same AST, different operations
const ast: Expr = {
  type: 'binary', op: '+',
  left: { type: 'number', value: 3 },
  right: { type: 'binary', op: '*', left: { type: 'number', value: 4 }, right: { type: 'number', value: 5 } },
};

console.log(visit(ast, printer));    // "(3 + (4 * 5))"
console.log(visit(ast, evaluator));  // 23`
        }
      ],
      useCases: [
        'AST processing — parsing, type checking, optimization, code generation passes',
        'Serialization — different formats (JSON, XML, binary) for the same object graph',
        'Report generation — different views (summary, detail, CSV) of the same data structure',
        'Static analysis — lint rules, complexity metrics, dead code detection',
        'Document conversion — same document tree rendered as HTML, PDF, Markdown'
      ],
      commonPitfalls: [
        'Using Visitor when the element hierarchy changes frequently — every new element type requires updating all visitors',
        'Boilerplate accept() method in GoF version — TypeScript discriminated unions eliminate this',
        'Visitors that accumulate state are hard to test — prefer returning values over mutating visitor state',
        'Breaking encapsulation: visitors that reach into element internals instead of using public interface'
      ],
      interviewTips: [
        'Know when NOT to use: "If element types change often, Visitor is wrong — use Strategy or simple polymorphism"',
        'TypeScript-idiomatic: "Discriminated unions + exhaustive switch replaces GoF double dispatch in most TS code"',
        'The expression problem: "Adding new types is hard with Visitor; adding new operations is hard with polymorphism — pick your trade-off"',
        'Real-world: Babel/TypeScript compiler, ESLint rules, Prettier formatters all use Visitor over AST nodes'
      ],
      relatedConcepts: ['iterator', 'composite', 'interpreter', 'strategy'],
      difficulty: 'advanced',
      tags: ['behavioral', 'gof', 'double-dispatch', 'ast']
    },
    {
      id: 'interpreter',
      title: 'Interpreter',
      description: 'Defines a grammatical representation for a language and provides an interpreter to deal with this grammar. Interpreter is niche — you use it when you have a domain-specific language (DSL) that needs evaluation: filter expressions, calculation formulas, routing rules, template languages. For anything complex, use a proper parser generator (PEG.js, Chevrotain). Interpreter shines for simple, well-defined grammars.',
      keyPoints: [
        'Expression tree: each grammar rule is a class/function that evaluates itself',
        'Terminal expressions: literal values, variables. Non-terminal expressions: operations that combine terminals',
        'Context object holds variable bindings and shared state during evaluation',
        'For simple grammars (< 20 rules), hand-written Interpreter is fine; beyond that, use parser generators',
        'Regular expressions are interpreted by a built-in Interpreter in the JS engine',
        'Template literals in JS are a simple Interpreter: evaluate expressions embedded in strings',
        'SQL WHERE clauses, spreadsheet formulas, and cron expressions are all interpreted DSLs'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Interpreter: Rule Engine for Data Filtering',
          code: `// Grammar for filtering expressions
type FilterExpr =
  | { type: 'equals'; field: string; value: unknown }
  | { type: 'gt'; field: string; value: number }
  | { type: 'lt'; field: string; value: number }
  | { type: 'contains'; field: string; value: string }
  | { type: 'and'; left: FilterExpr; right: FilterExpr }
  | { type: 'or'; left: FilterExpr; right: FilterExpr }
  | { type: 'not'; expr: FilterExpr };

// Interpreter — evaluates filter expressions against data
function evaluate(expr: FilterExpr, data: Record<string, unknown>): boolean {
  switch (expr.type) {
    case 'equals':
      return data[expr.field] === expr.value;
    case 'gt':
      return (data[expr.field] as number) > expr.value;
    case 'lt':
      return (data[expr.field] as number) < expr.value;
    case 'contains':
      return String(data[expr.field] ?? '').includes(expr.value);
    case 'and':
      return evaluate(expr.left, data) && evaluate(expr.right, data);
    case 'or':
      return evaluate(expr.left, data) || evaluate(expr.right, data);
    case 'not':
      return !evaluate(expr.expr, data);
  }
}

// DSL builder for ergonomic construction
const field = (name: string) => ({
  equals: (value: unknown): FilterExpr => ({ type: 'equals', field: name, value }),
  gt: (value: number): FilterExpr => ({ type: 'gt', field: name, value }),
  lt: (value: number): FilterExpr => ({ type: 'lt', field: name, value }),
  contains: (value: string): FilterExpr => ({ type: 'contains', field: name, value }),
});
const and = (left: FilterExpr, right: FilterExpr): FilterExpr => ({ type: 'and', left, right });
const or = (left: FilterExpr, right: FilterExpr): FilterExpr => ({ type: 'or', left, right });
const not = (expr: FilterExpr): FilterExpr => ({ type: 'not', expr });

// Usage — readable DSL
const filter = and(
  field('age').gt(18),
  or(
    field('role').equals('admin'),
    field('name').contains('Smith')
  )
);

const users = [
  { name: 'Alice Smith', age: 25, role: 'member' },
  { name: 'Bob Jones', age: 30, role: 'admin' },
  { name: 'Charlie Brown', age: 15, role: 'admin' },
];

const results = users.filter(user => evaluate(filter, user));
// [{ name: 'Alice Smith', ... }, { name: 'Bob Jones', ... }]`
        }
      ],
      useCases: [
        'Rule engines — configurable business rules evaluated at runtime',
        'Query builders — construct and evaluate filter/search expressions',
        'Template engines — evaluate embedded expressions in templates',
        'Math expression evaluators — spreadsheet formulas, calculator apps',
        'Routing rules — match URL patterns or request attributes against configurable rules'
      ],
      commonPitfalls: [
        'Using Interpreter for complex grammars — performance and maintainability degrade; use a parser generator',
        'Not handling malformed expressions — every DSL needs error reporting',
        'Deeply nested expressions can stack overflow — consider iterative evaluation or tail-call optimization',
        'Security: if expressions come from user input, they can be exploited (injection) — sandbox evaluation'
      ],
      interviewTips: [
        'Know when NOT to use: "For anything beyond ~20 grammar rules, use PEG.js, Chevrotain, or ANTLR"',
        'Connect to Visitor: "Interpreter evaluates the tree; Visitor also operates on trees but for multiple operations"',
        'Real-world DSLs: SQL WHERE, CSS selectors, regex, cron expressions, Grafana query language',
        'Security angle: "User-defined expressions need sandboxing — never eval() user input"'
      ],
      relatedConcepts: ['visitor', 'composite', 'strategy'],
      difficulty: 'advanced',
      tags: ['behavioral', 'gof', 'dsl', 'expression-tree']
    },

    // ─── MODERN PATTERNS ─────────────────────────────────────────
    {
      id: 'repository-pattern',
      title: 'Repository Pattern',
      description: 'Mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects. Repository makes the domain layer ignorant of persistence details — whether data lives in PostgreSQL, MongoDB, a REST API, or an in-memory map. This is NOT "just wrapping the ORM" — it is about giving the domain layer a clean, persistence-agnostic interface to work with.',
      keyPoints: [
        'Collection-like interface: find, findById, create, update, delete — looks like an in-memory collection',
        'One repository per aggregate (DDD term) — not one per table',
        'The domain layer depends on the repository interface; the infrastructure layer implements it',
        'Testability: swap the real repository with an in-memory implementation for unit tests',
        'Not just wrapping the ORM: the repository translates between domain models and persistence models',
        'Specification pattern can be used for complex queries without leaking SQL/ORM details',
        'Common mistake: repositories that return ORM entities instead of domain objects — this leaks the abstraction'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Repository: Domain-Driven with In-Memory Test Double',
          code: `// Domain model — no ORM decorators, no database concerns
interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: 'admin' | 'member';
  readonly createdAt: Date;
}

// Repository interface — the domain depends on THIS, not on any ORM
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: { role?: string; search?: string }): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

// Production implementation — uses a real database
class PostgresUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    return row ? this.toDomain(row) : null;
  }

  async findAll(filters?: { role?: string; search?: string }): Promise<User[]> {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params: unknown[] = [];
    if (filters?.role) { params.push(filters.role); query += \` AND role = $\${params.length}\`; }
    if (filters?.search) { params.push(\`%\${filters.search}%\`); query += \` AND name ILIKE $\${params.length}\`; }
    const rows = await this.db.query(query, params);
    return rows.map(this.toDomain);
  }

  async save(user: User): Promise<User> {
    await this.db.query(
      'INSERT INTO users (id, email, name, role, created_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET email=$2, name=$3, role=$4',
      [user.id, user.email, user.name, user.role, user.createdAt]
    );
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
  }

  private toDomain(row: DatabaseRow): User {
    return { id: row.id, email: row.email, name: row.name, role: row.role, createdAt: new Date(row.created_at) };
  }
}

// Test double — same interface, in-memory
class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async findById(id: string) { return this.users.get(id) ?? null; }
  async findByEmail(email: string) { return [...this.users.values()].find(u => u.email === email) ?? null; }
  async findAll(filters?: { role?: string }) {
    let result = [...this.users.values()];
    if (filters?.role) result = result.filter(u => u.role === filters.role);
    return result;
  }
  async save(user: User) { this.users.set(user.id, user); return user; }
  async delete(id: string) { this.users.delete(id); }
}

// Use case — works with either implementation
class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(email: string, name: string): Promise<User> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new Error('Email already taken');
    const user: User = { id: crypto.randomUUID(), email, name, role: 'member', createdAt: new Date() };
    return this.userRepo.save(user);
  }
}`
        }
      ],
      useCases: [
        'Domain-driven design — clean separation between domain logic and persistence',
        'Multi-database support — swap PostgreSQL for DynamoDB without changing business logic',
        'Testing — in-memory repositories make domain logic unit tests fast and isolated',
        'API-backed "repositories" — fetch domain objects from external services with the same interface',
        'Caching layer — CachingRepository decorator wraps real repository with a cache'
      ],
      commonPitfalls: [
        'Repository that returns ORM entities — leaks persistence details into the domain',
        'One repository per table instead of per aggregate — fragmenting the domain model',
        'Repositories with 30+ query methods — use Specification pattern for complex queries',
        '"Just wrapping the ORM" — if the repository interface mirrors the ORM API, it adds complexity without value'
      ],
      interviewTips: [
        'Emphasize testability: "Swap the database with an in-memory map for fast, isolated unit tests"',
        'Domain vs persistence model: "The repository translates between the two — column names, types, relations"',
        'Distinguish from DAO: "DAO is table-centric, Repository is aggregate-centric"',
        'The real value: "Business logic never imports database code — the dependency points inward"'
      ],
      relatedConcepts: ['unit-of-work', 'specification-pattern', 'dependency-inversion-principle', 'adapter'],
      difficulty: 'intermediate',
      tags: ['modern', 'ddd', 'clean-architecture', 'testing']
    },
    {
      id: 'unit-of-work',
      title: 'Unit of Work',
      description: 'Maintains a list of objects affected by a business transaction and coordinates the writing out of changes and the resolution of concurrency problems. Unit of Work groups multiple repository operations into a single transaction — either all succeed or all roll back. It is the transactional boundary pattern, ensuring data consistency across multiple aggregates. ORMs like TypeORM, Prisma, and Hibernate implement this internally.',
      keyPoints: [
        'Groups multiple operations into a single transaction — atomic commit or rollback',
        'Tracks which objects are new, modified, or deleted during the business operation',
        'The "flush" or "commit" at the end sends all changes to the database in one batch',
        'ORMs implement this internally: Hibernate Session, Entity Framework DbContext, TypeORM EntityManager',
        'In clean architecture, the use case layer controls the Unit of Work boundary',
        'Prevents partial writes: if step 3 of 5 fails, steps 1-2 are rolled back',
        'Combined with Repository: repositories register changes, Unit of Work commits them'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Unit of Work: Transaction Coordinator',
          code: `interface UnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  // Repository access scoped to this transaction
  users: UserRepository;
  orders: OrderRepository;
}

class PostgresUnitOfWork implements UnitOfWork {
  private client: PoolClient | null = null;
  private _users: UserRepository | null = null;
  private _orders: OrderRepository | null = null;

  constructor(private readonly pool: Pool) {}

  async begin(): Promise<void> {
    this.client = await this.pool.connect();
    await this.client.query('BEGIN');
    // Repositories scoped to this transaction's client
    this._users = new PostgresUserRepository(this.client);
    this._orders = new PostgresOrderRepository(this.client);
  }

  get users(): UserRepository {
    if (!this._users) throw new Error('Call begin() first');
    return this._users;
  }

  get orders(): OrderRepository {
    if (!this._orders) throw new Error('Call begin() first');
    return this._orders;
  }

  async commit(): Promise<void> {
    if (!this.client) throw new Error('No active transaction');
    await this.client.query('COMMIT');
    this.client.release();
    this.client = null;
  }

  async rollback(): Promise<void> {
    if (!this.client) throw new Error('No active transaction');
    await this.client.query('ROLLBACK');
    this.client.release();
    this.client = null;
  }
}

// Use case — controls the transaction boundary
class PlaceOrderUseCase {
  constructor(private readonly createUoW: () => UnitOfWork) {}

  async execute(userId: string, items: OrderItem[]): Promise<Order> {
    const uow = this.createUoW();
    await uow.begin();
    try {
      const user = await uow.users.findById(userId);
      if (!user) throw new Error('User not found');

      const order: Order = {
        id: crypto.randomUUID(),
        userId,
        items,
        total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'pending',
        createdAt: new Date(),
      };
      await uow.orders.save(order);

      // Update user's order count — same transaction
      await uow.users.save({ ...user, orderCount: user.orderCount + 1 });

      await uow.commit(); // All or nothing
      return order;
    } catch (error) {
      await uow.rollback();
      throw error;
    }
  }
}`
        }
      ],
      useCases: [
        'Multi-table transactions — create order + update inventory + charge payment atomically',
        'Batch operations — import 1000 records in one transaction, roll back if any fail',
        'Saga compensation — track changes for rollback in distributed workflows',
        'Event sourcing — append events and update projections in the same transaction',
        'Data migration — transform and write data atomically across tables'
      ],
      commonPitfalls: [
        'Not calling rollback on error — leaked transactions lock database rows indefinitely',
        'Unit of Work that spans too many operations — long transactions reduce concurrency',
        'Forgetting to release the database connection — pool exhaustion under load',
        'Mixing repositories from different UoW instances — operations end up in different transactions'
      ],
      interviewTips: [
        'Most ORMs do this for you: "Prisma.$transaction(), TypeORM EntityManager, Hibernate Session"',
        'Explain why: "Without UoW, a failed step leaves the database in an inconsistent state"',
        'Scope: "The use case defines the transaction boundary — not the repository, not the controller"',
        'Distributed systems: "UoW works within one database; for cross-service consistency, you need sagas"'
      ],
      relatedConcepts: ['repository-pattern', 'command', 'sagas', 'facade'],
      difficulty: 'advanced',
      tags: ['modern', 'ddd', 'transaction', 'clean-architecture']
    },
    {
      id: 'specification-pattern',
      title: 'Specification Pattern',
      description: 'Encapsulates business rules as first-class objects that can be combined using boolean logic (AND, OR, NOT). Specifications are composable predicates — each one answers a yes/no question about a domain object. They replace scattered if-conditions with named, testable, reusable rule objects. In TypeScript, this often manifests as composable predicate functions.',
      keyPoints: [
        'Each specification encapsulates one business rule as an object with an `isSatisfiedBy(candidate)` method',
        'Composite: specifications combine with AND, OR, NOT to build complex rules from simple ones',
        'Named rules: `new EligibleForPromotion()` is clearer than `if (user.age > 18 && user.orders > 5 && ...)`',
        'Testable in isolation: test each rule independently, then test compositions',
        'Can be used for filtering (query), validation, and selection',
        'In databases: specifications can be translated to SQL WHERE clauses for server-side filtering',
        'Functional alternative: composable predicate functions with and/or/not combinators'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Specification: Composable Business Rules',
          code: `// Specification interface
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

// Base class with composition logic
abstract class ComposableSpec<T> implements Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

  and(other: Specification<T>): Specification<T> {
    return spec<T>(c => this.isSatisfiedBy(c) && other.isSatisfiedBy(c));
  }
  or(other: Specification<T>): Specification<T> {
    return spec<T>(c => this.isSatisfiedBy(c) || other.isSatisfiedBy(c));
  }
  not(): Specification<T> {
    return spec<T>(c => !this.isSatisfiedBy(c));
  }
}

// Factory for inline specifications
function spec<T>(predicate: (c: T) => boolean): Specification<T> {
  return new (class extends ComposableSpec<T> {
    isSatisfiedBy(candidate: T) { return predicate(candidate); }
  })();
}

// Domain-specific specifications
interface Customer {
  age: number;
  totalOrders: number;
  totalSpent: number;
  accountAge: number; // months
  isVerified: boolean;
}

const isAdult = spec<Customer>(c => c.age >= 18);
const isVerified = spec<Customer>(c => c.isVerified);
const isHighValue = spec<Customer>(c => c.totalSpent > 10_000);
const isLoyal = spec<Customer>(c => c.accountAge > 24);
const hasMinOrders = (min: number) => spec<Customer>(c => c.totalOrders >= min);

// Compose complex rules from simple ones
const eligibleForPremium = isAdult
  .and(isVerified)
  .and(isHighValue.or(isLoyal.and(hasMinOrders(50))));

const eligibleForPromotion = isVerified
  .and(hasMinOrders(3))
  .and(isHighValue.not()); // Exclude already high-value customers

// Usage
const customers: Customer[] = [
  { age: 30, totalOrders: 100, totalSpent: 15000, accountAge: 36, isVerified: true },
  { age: 25, totalOrders: 5, totalSpent: 500, accountAge: 6, isVerified: true },
];

const premiumEligible = customers.filter(c => eligibleForPremium.isSatisfiedBy(c));
const promoEligible = customers.filter(c => eligibleForPromotion.isSatisfiedBy(c));`
        }
      ],
      useCases: [
        'Eligibility rules — loan approval, promotion eligibility, feature flags',
        'Product filtering — complex e-commerce filters (price AND category AND rating)',
        'Authorization — role + resource + action specifications composed per endpoint',
        'Validation — compose validators as specifications',
        'Query building — translate specifications to database WHERE clauses'
      ],
      commonPitfalls: [
        'Over-engineering simple conditions — `if (age > 18)` does not need a specification',
        'Specifications that depend on external services (database, API) — keep them pure predicates',
        'Not naming specifications well — the name IS the documentation: `isEligibleForRefund` not `spec1`',
        'Translating to SQL: not all specification logic maps cleanly to SQL — some rules can only run in application code'
      ],
      interviewTips: [
        'Emphasize composability: "Simple rules combined with AND/OR/NOT to express complex business logic"',
        'Versus scattered if-conditions: "Named, testable, reusable rules instead of duplicated conditionals"',
        'Functional equivalent: "In TypeScript, composable predicate functions achieve the same thing with less ceremony"',
        'DDD context: "Specifications represent domain rules — they belong in the domain layer, not in repositories"'
      ],
      relatedConcepts: ['repository-pattern', 'strategy', 'chain-of-responsibility', 'interpreter'],
      difficulty: 'advanced',
      tags: ['modern', 'ddd', 'business-rules', 'composable']
    },
    {
      id: 'cqrs-pattern',
      title: 'CQRS (Command Query Responsibility Segregation)',
      description: 'Separates the read model (queries) from the write model (commands), allowing each to be optimized independently. CQRS is NOT event sourcing — it is simply using different models for reads and writes. You can do CQRS with a single SQL database by having denormalized views for reads and a normalized schema for writes. It scales reads and writes independently and simplifies each side.',
      keyPoints: [
        'Command side: normalized data model, validation, business rules, consistency guarantees',
        'Query side: denormalized data model optimized for specific read patterns — no joins, pre-computed',
        'Does NOT require event sourcing — you can sync read and write models via database triggers, CDC, or direct writes',
        'Does NOT require separate databases — a read-optimized view or materialized view in the same DB counts',
        'Eventual consistency between command and query sides is the main trade-off',
        'Commands mutate state and return nothing (or just an ID); Queries return data and mutate nothing',
        'Scales independently: read replicas for queries, write-optimized primary for commands'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'CQRS: Separate Read/Write Models',
          code: `// ─── Command Side (Writes) ─────────────────────────
interface CreateOrderCommand {
  userId: string;
  items: Array<{ productId: string; quantity: number }>;
}

interface CommandHandler<TCommand> {
  execute(command: TCommand): Promise<string>; // Returns aggregate ID
}

class CreateOrderHandler implements CommandHandler<CreateOrderCommand> {
  constructor(
    private readonly orderRepo: OrderWriteRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async execute(command: CreateOrderCommand): Promise<string> {
    // Validate stock
    for (const item of command.items) {
      const available = await this.inventoryService.checkStock(item.productId, item.quantity);
      if (!available) throw new Error(\`Insufficient stock for \${item.productId}\`);
    }

    // Create order in normalized write model
    const order = {
      id: crypto.randomUUID(),
      userId: command.userId,
      items: command.items,
      status: 'pending' as const,
      createdAt: new Date(),
    };
    await this.orderRepo.save(order);

    // Sync to read model (could also be async via events)
    await this.readModelSync.syncOrder(order);

    return order.id;
  }

  private readModelSync: ReadModelSynchronizer = {} as ReadModelSynchronizer;
}

// ─── Query Side (Reads) ─────────────────────────────
// Denormalized read model — pre-joined, ready to serve
interface OrderListView {
  orderId: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

interface OrderDetailView {
  orderId: string;
  customer: { name: string; email: string };
  items: Array<{ productName: string; quantity: number; unitPrice: number; total: number }>;
  totalAmount: number;
  status: string;
  timeline: Array<{ event: string; timestamp: Date }>;
}

interface OrderQueryService {
  getOrderList(userId: string, page: number, limit: number): Promise<OrderListView[]>;
  getOrderDetail(orderId: string): Promise<OrderDetailView | null>;
  getOrderStats(userId: string): Promise<{ totalOrders: number; totalSpent: number }>;
}

// Read model implementation — simple, fast, no joins
class PostgresOrderQueryService implements OrderQueryService {
  constructor(private readonly readDb: ReadDatabase) {}

  async getOrderList(userId: string, page: number, limit: number): Promise<OrderListView[]> {
    // Single table read — data is already denormalized
    return this.readDb.query(
      'SELECT * FROM order_list_view WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, (page - 1) * limit]
    );
  }

  async getOrderDetail(orderId: string): Promise<OrderDetailView | null> {
    return this.readDb.query('SELECT * FROM order_detail_view WHERE order_id = $1', [orderId]);
  }

  async getOrderStats(userId: string) {
    return this.readDb.query('SELECT * FROM order_stats_view WHERE user_id = $1', [userId]);
  }
}`
        }
      ],
      useCases: [
        'Read-heavy applications — dashboards, reporting, search where read patterns differ vastly from write patterns',
        'Performance optimization — denormalize reads for speed, keep writes normalized for consistency',
        'Complex domains — write model reflects business rules, read model reflects UI needs',
        'Scaling — separate read replicas from write primary, scale each independently',
        'Multi-view systems — same data served as list, detail, chart, export with different denormalized views'
      ],
      commonPitfalls: [
        'Assuming CQRS requires event sourcing — it does not; they are independent patterns that combine well',
        'Using CQRS for simple CRUD — the overhead of two models is not worth it for basic apps',
        'Ignoring eventual consistency — read model may lag behind write model; handle stale data in the UI',
        'Command handlers that return full read models — commands should return minimal data (ID); queries handle reads'
      ],
      interviewTips: [
        'Immediately clarify: "CQRS is NOT event sourcing — they are separate patterns that work well together"',
        'Simplest CQRS: "Materialized views in PostgreSQL — same database, different read/write optimizations"',
        'When to use: "When your read patterns are fundamentally different from your write patterns"',
        'When NOT to use: "Simple CRUD where reads and writes use the same model — CQRS just adds complexity"'
      ],
      relatedConcepts: ['event-sourcing', 'repository-pattern', 'command', 'event-bus'],
      difficulty: 'advanced',
      tags: ['modern', 'architecture', 'scalability', 'read-write-separation']
    },
    {
      id: 'event-bus',
      title: 'Event Bus / Mediator',
      description: 'An in-process messaging system that decouples publishers from subscribers via a central hub. Publishers emit typed events; subscribers register handlers for specific event types. The event bus does not contain business logic (unlike a full Mediator) — it just routes messages. This is the backbone of modular monolith architectures where modules communicate without direct imports.',
      keyPoints: [
        'Decouples modules: publisher does not import or know about subscribers',
        'Typed events in TypeScript prevent typos and enable autocomplete for event names and payloads',
        'Synchronous vs asynchronous: sync bus blocks until all handlers complete; async bus fires and forgets',
        'In-process only: for cross-service messaging, use a message broker (RabbitMQ, Kafka, SQS)',
        'Domain events vs integration events: domain events are in-process (bus); integration events cross service boundaries (broker)',
        'Memory leak risk: handlers that are never unsubscribed keep references alive',
        'Error isolation: one failing handler should not prevent other handlers from executing'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Type-Safe Event Bus with Error Isolation',
          code: `// Define event map — single source of truth for all events
interface AppEvents {
  'user:registered': { userId: string; email: string; plan: string };
  'user:upgraded': { userId: string; fromPlan: string; toPlan: string };
  'order:completed': { orderId: string; userId: string; total: number };
  'payment:failed': { orderId: string; reason: string };
}

type EventHandler<T> = (payload: T) => void | Promise<void>;

class TypedEventBus<TEvents extends Record<string, unknown>> {
  private handlers = new Map<string, Set<EventHandler<unknown>>>();
  private errorHandler: (event: string, error: unknown) => void = console.error;

  onError(handler: (event: string, error: unknown) => void): void {
    this.errorHandler = handler;
  }

  on<K extends keyof TEvents & string>(
    event: K,
    handler: EventHandler<TEvents[K]>,
  ): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler as EventHandler<unknown>);
    return () => this.handlers.get(event)?.delete(handler as EventHandler<unknown>);
  }

  async emit<K extends keyof TEvents & string>(
    event: K,
    payload: TEvents[K],
  ): Promise<void> {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    // Error isolation — one failing handler does not block others
    const results = await Promise.allSettled(
      [...handlers].map(handler => handler(payload))
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        this.errorHandler(event, result.reason);
      }
    }
  }
}

// Usage
const bus = new TypedEventBus<AppEvents>();

// Module A: User management — publishes events
class UserModule {
  constructor(private readonly bus: TypedEventBus<AppEvents>) {}

  async registerUser(email: string) {
    const userId = crypto.randomUUID();
    // ... save user
    await this.bus.emit('user:registered', { userId, email, plan: 'free' });
  }
}

// Module B: Email — subscribes to events
class EmailModule {
  constructor(bus: TypedEventBus<AppEvents>) {
    bus.on('user:registered', async ({ email }) => {
      await sendWelcomeEmail(email);
    });
  }
}

// Module C: Analytics — subscribes to events
class AnalyticsModule {
  constructor(bus: TypedEventBus<AppEvents>) {
    bus.on('user:registered', ({ userId, plan }) => trackSignup(userId, plan));
    bus.on('order:completed', ({ total }) => trackRevenue(total));
  }
}`
        }
      ],
      useCases: [
        'Modular monolith — modules communicate via events without direct imports',
        'Cross-cutting concerns — logging, analytics, metrics subscribe to all relevant events',
        'Workflow triggers — one event triggers multiple independent reactions',
        'Plugin systems — plugins subscribe to core events without modifying core code',
        'UI state coordination — components react to events without prop drilling'
      ],
      commonPitfalls: [
        'Event spaghetti — too many untyped events make the system impossible to trace',
        'Circular events — handler A emits event that triggers handler B which emits event that triggers handler A',
        'Error swallowing — one handler fails silently and the system enters an inconsistent state',
        'Memory leaks — handlers registered in constructors but never cleaned up when the module is destroyed'
      ],
      interviewTips: [
        'Type the event map: "A single interface defines all events and their payloads — TypeScript catches typos and missing fields"',
        'Versus message broker: "Event bus is in-process (same Node.js instance); message broker is cross-process (RabbitMQ, Kafka)"',
        'Error isolation: "Promise.allSettled ensures one failing handler does not prevent others from executing"',
        'Modular monolith: "Events let modules stay decoupled; when you extract a module to a microservice, replace the event bus with a message broker"'
      ],
      relatedConcepts: ['mediator', 'observer', 'cqrs-pattern', 'command'],
      difficulty: 'intermediate',
      tags: ['modern', 'decoupling', 'modular-monolith', 'event-driven']
    },
  ],
}
