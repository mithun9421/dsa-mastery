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

export const cleanArchCategory: Category = {
  id: 'clean-architecture',
  title: 'Clean Architecture',
  description: 'Architecture patterns that keep business logic independent of frameworks, databases, and delivery mechanisms. Clean Architecture, Hexagonal Architecture, and Onion Architecture are all expressions of the same dependency rule: source code dependencies must point inward, toward higher-level policies.',
  icon: '🏛️',
  concepts: [
    {
      id: 'clean-architecture-overview',
      title: 'Clean Architecture Overview',
      description: 'Clean Architecture organizes code into concentric layers with a strict dependency rule: dependencies only point inward. The innermost layer contains enterprise business rules (entities), surrounded by application business rules (use cases), then interface adapters (controllers, presenters, gateways), and finally frameworks and drivers (database, web framework, UI). The key insight: the business logic layer has zero dependencies on anything external — it defines interfaces that outer layers implement.',
      keyPoints: [
        'Dependency Rule: source code dependencies must point inward. Inner layers know nothing about outer layers.',
        'Entities (innermost): pure business logic and rules — no framework imports, no database code, no HTTP',
        'Use Cases: application-specific business rules — orchestrate entities to fulfill a specific use case',
        'Interface Adapters: convert data between use case format and external format (controllers, presenters, DTOs)',
        'Frameworks & Drivers (outermost): database drivers, web frameworks, UI libraries — details that can be swapped',
        'Data flows across boundaries via DTOs — never pass entity objects directly to controllers or database layers',
        'The domain does not depend on the database; the database depends on the domain (via repository interfaces)',
        'Independent of frameworks: the architecture does not depend on the existence of any library. Frameworks are tools, not the architecture'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Clean Architecture: Layer Structure',
          code: `// ─── LAYER 1: ENTITIES (innermost) ─────────────────
// Pure business logic — no imports from any framework or infrastructure
// File: domain/entities/order.ts

interface OrderItem {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
}

interface Order {
  readonly id: string;
  readonly customerId: string;
  readonly items: ReadonlyArray<OrderItem>;
  readonly status: 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  readonly createdAt: Date;
}

// Business rule: pure function, no dependencies
function calculateOrderTotal(items: ReadonlyArray<OrderItem>): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

function canCancelOrder(order: Order): boolean {
  return order.status === 'draft' || order.status === 'confirmed';
}

// ─── LAYER 2: USE CASES ────────────────────────────
// Application-specific rules — depends on entities and PORT interfaces
// File: application/use-cases/place-order.ts

// PORT: interface defined in application layer, implemented in infrastructure
interface OrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
}

interface PaymentService {
  charge(customerId: string, amount: number): Promise<{ transactionId: string }>;
}

interface OrderConfirmationSender {
  send(order: Order, customerEmail: string): Promise<void>;
}

// Input DTO — data the use case needs
interface PlaceOrderInput {
  customerId: string;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
}

// Output DTO — data the use case returns
interface PlaceOrderOutput {
  orderId: string;
  total: number;
  transactionId: string;
}

class PlaceOrderUseCase {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly payments: PaymentService,
    private readonly notifications: OrderConfirmationSender,
  ) {}

  async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
    const order: Order = {
      id: crypto.randomUUID(),
      customerId: input.customerId,
      items: input.items,
      status: 'confirmed',
      createdAt: new Date(),
    };

    const total = calculateOrderTotal(order.items);
    const { transactionId } = await this.payments.charge(input.customerId, total);
    const saved = await this.orderRepo.save(order);
    // Fire-and-forget notification — non-critical
    this.notifications.send(saved, 'customer@email.com').catch(() => {});

    return { orderId: saved.id, total, transactionId };
  }
}

// ─── LAYER 3: INTERFACE ADAPTERS ───────────────────
// Controllers, presenters, gateways — translate between use cases and frameworks
// File: adapters/controllers/order-controller.ts

class OrderController {
  constructor(private readonly placeOrder: PlaceOrderUseCase) {}

  async handlePlaceOrder(req: HttpRequest): Promise<HttpResponse> {
    const input: PlaceOrderInput = {
      customerId: req.body.customerId,
      items: req.body.items,
    };
    const result = await this.placeOrder.execute(input);
    return { status: 201, body: result };
  }
}

// ─── LAYER 4: FRAMEWORKS & DRIVERS (outermost) ────
// File: infrastructure/persistence/postgres-order-repo.ts
class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly pool: any) {}
  async save(order: Order): Promise<Order> {
    await this.pool.query('INSERT INTO orders ...', [order.id, order.customerId]);
    return order;
  }
  async findById(id: string): Promise<Order | null> {
    const row = await this.pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return row ? this.toDomain(row) : null;
  }
  private toDomain(row: any): Order { return row; }
}`
        }
      ],
      useCases: [
        'Applications with complex business logic that must survive framework migrations',
        'Regulated industries where business rules must be testable in isolation',
        'Long-lived products where the database or web framework may change over the product lifetime',
        'Teams that need clear boundaries between domain experts and infrastructure specialists'
      ],
      commonPitfalls: [
        'Applying Clean Architecture to a CRUD app — the layers add overhead without proportional benefit',
        'Entities that import from frameworks — the innermost layer must be pure',
        'Use cases that return entity objects directly to controllers — use DTOs at boundaries',
        'Over-engineering: not every project needs four layers — sometimes two (domain + infrastructure) is enough'
      ],
      interviewTips: [
        'Draw the concentric circles and the dependency arrows pointing inward — visual explanation is powerful',
        'Key insight: "The business logic does not know whether it is in a web app, a CLI, or a test. It defines interfaces; outer layers implement them."',
        'Contrast with traditional layered architecture: "In layered arch, business depends on data layer. In clean arch, data layer depends on business."',
        'When NOT to use: "For a simple CRUD API with no complex business rules, clean arch is over-engineering"'
      ],
      relatedConcepts: ['hexagonal-architecture', 'onion-architecture', 'dependency-inversion-principle', 'repository-pattern'],
      difficulty: 'advanced',
      tags: ['clean-architecture', 'dependency-rule', 'layers'],
      ascii: `
┌──────────────────────────────────────────┐
│         Frameworks & Drivers             │
│  ┌────────────────────────────────────┐  │
│  │       Interface Adapters           │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │       Use Cases              │  │  │
│  │  │  ┌────────────────────────┐  │  │  │
│  │  │  │      Entities          │  │  │  │
│  │  │  │   (Business Rules)     │  │  │  │
│  │  │  └────────────────────────┘  │  │  │
│  │  └──────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
       Dependencies point INWARD →`
    },
    {
      id: 'hexagonal-architecture',
      title: 'Hexagonal Architecture (Ports and Adapters)',
      description: 'Hexagonal Architecture (coined by Alistair Cockburn) organizes application code around a central domain core connected to the outside world through ports (interfaces) and adapters (implementations). Driving ports are how the outside world talks to the application (e.g., REST controller, CLI, message consumer). Driven ports are how the application talks to the outside world (e.g., database, email service, payment gateway). The hexagon (domain + ports) is the testable, framework-independent core.',
      keyPoints: [
        'Driving ports (primary): interfaces the outside world uses to drive the application — HTTP controller, message consumer, CLI',
        'Driven ports (secondary): interfaces the application uses to interact with the outside world — repository, email sender, cache',
        'Adapters implement ports: REST adapter implements the driving port, PostgreSQL adapter implements the driven port',
        'The hexagon contains the domain logic and port definitions — completely framework-agnostic',
        'Swappable adapters: replace PostgreSQL with DynamoDB by writing a new adapter — domain unchanged',
        'Testing: replace driven adapters with in-memory test doubles — fast, isolated tests',
        'Same domain, multiple driving adapters: REST API + GraphQL + CLI can all drive the same use cases'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Hexagonal Architecture: Ports and Adapters',
          code: `// ─── THE HEXAGON (Domain + Ports) ──────────────────

// DRIVEN PORT: what the domain needs from the outside world
interface ArticleRepository {
  save(article: Article): Promise<Article>;
  findBySlug(slug: string): Promise<Article | null>;
  findAll(opts: { page: number; limit: number }): Promise<Article[]>;
}

interface SlugGenerator {
  generate(title: string): string;
}

// DRIVING PORT: what the outside world can do with the domain
interface ArticleService {
  createArticle(input: CreateArticleInput): Promise<Article>;
  getArticle(slug: string): Promise<Article>;
  listArticles(page: number, limit: number): Promise<Article[]>;
}

// Domain implementation of the driving port
class ArticleServiceImpl implements ArticleService {
  constructor(
    private readonly repo: ArticleRepository,   // driven port
    private readonly slugger: SlugGenerator,     // driven port
  ) {}

  async createArticle(input: CreateArticleInput): Promise<Article> {
    const slug = this.slugger.generate(input.title);
    const existing = await this.repo.findBySlug(slug);
    if (existing) throw new Error(\`Article with slug "\${slug}" already exists\`);
    const article: Article = {
      id: crypto.randomUUID(),
      title: input.title,
      slug,
      body: input.body,
      authorId: input.authorId,
      publishedAt: null,
      createdAt: new Date(),
    };
    return this.repo.save(article);
  }

  async getArticle(slug: string): Promise<Article> {
    const article = await this.repo.findBySlug(slug);
    if (!article) throw new Error('Article not found');
    return article;
  }

  async listArticles(page: number, limit: number): Promise<Article[]> {
    return this.repo.findAll({ page, limit });
  }
}

// ─── DRIVING ADAPTERS (outside → hexagon) ──────────

// REST adapter
class ExpressArticleController {
  constructor(private readonly service: ArticleService) {}

  async create(req: Request, res: Response) {
    const article = await this.service.createArticle(req.body);
    res.status(201).json(article);
  }

  async get(req: Request, res: Response) {
    const article = await this.service.getArticle(req.params.slug);
    res.json(article);
  }
}

// CLI adapter — same hexagon, different entry point
class CLIArticleAdapter {
  constructor(private readonly service: ArticleService) {}

  async importFromMarkdown(filePath: string, authorId: string) {
    const content = await readFile(filePath, 'utf-8');
    const { title, body } = parseMarkdown(content);
    return this.service.createArticle({ title, body, authorId });
  }
}

// ─── DRIVEN ADAPTERS (hexagon → outside) ───────────

// PostgreSQL adapter
class PostgresArticleRepository implements ArticleRepository {
  constructor(private readonly db: Pool) {}
  async save(article: Article) { /* SQL INSERT */ return article; }
  async findBySlug(slug: string) { /* SQL SELECT */ return null; }
  async findAll(opts: { page: number; limit: number }) { return []; }
}

// In-memory adapter for testing
class InMemoryArticleRepository implements ArticleRepository {
  private articles: Article[] = [];
  async save(article: Article) { this.articles.push(article); return article; }
  async findBySlug(slug: string) { return this.articles.find(a => a.slug === slug) ?? null; }
  async findAll({ page, limit }: { page: number; limit: number }) {
    return this.articles.slice((page - 1) * limit, page * limit);
  }
}`
        }
      ],
      useCases: [
        'Applications that need multiple entry points: REST API, GraphQL, CLI, message queue consumers',
        'Vendor-agnostic design: swap database, email provider, or payment gateway without domain changes',
        'Testability-first: domain logic tested with in-memory adapters, no Docker/database needed',
        'Gradual migration: add new adapters without changing existing ones'
      ],
      commonPitfalls: [
        'Port interfaces that mirror one specific adapter — the port should be adapter-agnostic',
        'Leaking adapter details into the hexagon: domain code that knows about HTTP status codes or SQL',
        'Too many ports for a simple app — if you have one adapter per port, the abstraction earns nothing',
        'Confusing driving and driven: driving is "outside triggers inside", driven is "inside calls outside"'
      ],
      interviewTips: [
        'Driving vs driven: "REST controller drives the hexagon (driving adapter). Database is driven by the hexagon (driven adapter)."',
        'Testability: "I can test the entire domain with zero infrastructure — just in-memory driven adapters"',
        'Multiple frontends: "REST, GraphQL, and CLI all drive the same ArticleService — no duplication"',
        'Versus Clean Architecture: "Same dependency rule, different vocabulary. Hexagonal focuses on ports/adapters, Clean focuses on layers."'
      ],
      relatedConcepts: ['clean-architecture-overview', 'onion-architecture', 'adapter', 'dependency-inversion-principle'],
      difficulty: 'advanced',
      tags: ['clean-architecture', 'ports-and-adapters', 'hexagonal'],
      ascii: `
          Driving Adapters
          (REST, CLI, MQ)
               │
               ▼
        ┌─── PORTS ───┐
        │             │
        │   DOMAIN    │
        │   (Core)    │
        │             │
        └─── PORTS ───┘
               │
               ▼
          Driven Adapters
        (DB, Email, Cache)`
    },
    {
      id: 'onion-architecture',
      title: 'Onion Architecture',
      description: 'Onion Architecture (coined by Jeffrey Palermo) is structurally similar to Clean Architecture and Hexagonal Architecture but emphasizes concentric layers with the domain model at the absolute center. The key insight: all coupling is toward the center, and infrastructure concerns live at the outermost ring. The difference from Clean Architecture is mostly terminological — Onion uses "Domain Model", "Domain Services", "Application Services", "Infrastructure" as its layer names.',
      keyPoints: [
        'Domain Model (center): entities, value objects, domain events — zero external dependencies',
        'Domain Services: business logic that does not belong to a single entity — still no infrastructure imports',
        'Application Services: orchestrate domain to fulfill use cases — define port interfaces here',
        'Infrastructure (outermost): database, file system, HTTP clients, message queues — implements port interfaces',
        'All dependencies point inward toward the domain model — never outward',
        'The domain model is completely independent of any infrastructure framework',
        'Very similar to Clean Architecture and Hexagonal — the concepts are isomorphic, the vocabulary differs'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Onion Architecture: Layer Dependency Flow',
          code: `// ─── CENTER: Domain Model ──────────────────────────
// domain/model/money.ts
class Money {
  constructor(
    readonly amount: number,
    readonly currency: string,
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.amount * factor), this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}

// domain/model/invoice.ts
interface InvoiceLine {
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: Money;
}

interface Invoice {
  readonly id: string;
  readonly customerId: string;
  readonly lines: ReadonlyArray<InvoiceLine>;
  readonly status: 'draft' | 'sent' | 'paid' | 'overdue';
  readonly issuedAt: Date | null;
}

// ─── RING 2: Domain Services ───────────────────────
// domain/services/invoice-calculator.ts
function calculateInvoiceTotal(invoice: Invoice): Money {
  return invoice.lines.reduce(
    (sum, line) => sum.add(line.unitPrice.multiply(line.quantity)),
    new Money(0, invoice.lines[0]?.unitPrice.currency ?? 'USD'),
  );
}

function canSendInvoice(invoice: Invoice): boolean {
  return invoice.status === 'draft' && invoice.lines.length > 0;
}

// ─── RING 3: Application Services ──────────────────
// application/ports.ts — interfaces for infrastructure
interface InvoiceRepository {
  save(invoice: Invoice): Promise<Invoice>;
  findById(id: string): Promise<Invoice | null>;
}

interface PdfGenerator {
  generate(invoice: Invoice, total: Money): Promise<Buffer>;
}

// application/send-invoice.ts
class SendInvoiceUseCase {
  constructor(
    private readonly invoiceRepo: InvoiceRepository,
    private readonly pdfGen: PdfGenerator,
    private readonly emailSender: EmailSender,
  ) {}

  async execute(invoiceId: string): Promise<void> {
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    if (!canSendInvoice(invoice)) throw new Error('Invoice cannot be sent');

    const total = calculateInvoiceTotal(invoice);
    const pdf = await this.pdfGen.generate(invoice, total);

    await this.emailSender.send({
      to: invoice.customerId,
      subject: \`Invoice \${invoice.id}\`,
      attachments: [{ filename: 'invoice.pdf', content: pdf }],
    });

    const sent: Invoice = { ...invoice, status: 'sent', issuedAt: new Date() };
    await this.invoiceRepo.save(sent);
  }
}

// ─── OUTERMOST RING: Infrastructure ────────────────
// infrastructure/persistence/prisma-invoice-repo.ts
class PrismaInvoiceRepository implements InvoiceRepository {
  async save(invoice: Invoice) { /* Prisma upsert */ return invoice; }
  async findById(id: string) { /* Prisma findUnique */ return null; }
}`
        }
      ],
      useCases: [
        'Domain-heavy applications where business rules are the primary source of complexity',
        'Financial systems where domain model purity is non-negotiable (calculations must be testable without infrastructure)',
        'Teams that want clear architectural boundaries documented by the directory structure',
        'Applications that need to support multiple infrastructure backends (multi-tenant with different databases)'
      ],
      commonPitfalls: [
        'Treating it as fundamentally different from Clean/Hexagonal — the concepts are isomorphic',
        'Domain model that imports infrastructure types (ORM decorators, HTTP types)',
        'Application services that grow to contain domain logic — keep domain rules in entities and domain services',
        'Infrastructure-free purity taken too far — sometimes pragmatic trade-offs are warranted'
      ],
      interviewTips: [
        'Acknowledge the similarity: "Onion, Clean, and Hexagonal share the same dependency rule — dependencies point inward"',
        'Vocabulary mapping: "Onion Domain Model = Clean Entities = Hexagonal Core"',
        'Why choose Onion: "It emphasizes the domain model as the literal center — good for DDD-heavy projects"',
        'When NOT to use: "Simple CRUD with no complex domain logic — the layers add overhead without value"'
      ],
      relatedConcepts: ['clean-architecture-overview', 'hexagonal-architecture', 'domain-events', 'value-objects'],
      difficulty: 'advanced',
      tags: ['clean-architecture', 'onion', 'domain-model']
    },
    {
      id: 'entities-domain-objects',
      title: 'Entities (Domain Objects)',
      description: 'In Clean Architecture, entities encapsulate enterprise-wide business rules — the purest business logic that exists independent of any application. They have no framework dependencies, no database imports, no HTTP awareness. Entities are reusable across multiple applications in the same enterprise. They contain business rules, validation, and invariants — but zero infrastructure concerns.',
      keyPoints: [
        'Pure business logic: entities enforce business rules, invariants, and domain constraints',
        'Framework-independent: no ORM decorators, no validation library annotations, no serialization concerns',
        'Identity: entities are identified by an ID, not by their attribute values (unlike value objects)',
        'Lifecycle: entities are created, modified, and deleted — they have a persistent identity over time',
        'Aggregates (DDD): a cluster of entities and value objects treated as a single unit for data changes',
        'Rich vs Anemic: rich entities contain behavior (methods); anemic entities are just data bags (antipattern in DDD)',
        'Entities enforce their own invariants: a Money entity rejects negative amounts, an Order rejects empty item lists'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Rich Entity with Business Rules',
          code: `// Entity: enforces its own invariants, contains business logic
class BankAccount {
  private _balance: Money;
  private _transactions: Transaction[] = [];
  private _status: 'active' | 'frozen' | 'closed';

  constructor(
    readonly id: string,
    readonly ownerId: string,
    initialBalance: Money,
    private readonly dailyLimit: Money,
  ) {
    if (initialBalance.amount < 0) {
      throw new Error('Initial balance cannot be negative');
    }
    this._balance = initialBalance;
    this._status = 'active';
  }

  get balance(): Money { return this._balance; }
  get status(): string { return this._status; }

  deposit(amount: Money): Transaction {
    this.ensureActive();
    if (amount.amount <= 0) throw new Error('Deposit amount must be positive');

    this._balance = this._balance.add(amount);
    const tx = this.recordTransaction('deposit', amount);
    return tx;
  }

  withdraw(amount: Money): Transaction {
    this.ensureActive();
    if (amount.amount <= 0) throw new Error('Withdrawal amount must be positive');
    if (amount.amount > this._balance.amount) throw new Error('Insufficient funds');
    if (this.todaysWithdrawals().add(amount).amount > this.dailyLimit.amount) {
      throw new Error('Daily withdrawal limit exceeded');
    }

    this._balance = new Money(
      this._balance.amount - amount.amount,
      this._balance.currency,
    );
    return this.recordTransaction('withdrawal', amount);
  }

  freeze(): void {
    if (this._status === 'closed') throw new Error('Cannot freeze a closed account');
    this._status = 'frozen';
  }

  close(): void {
    if (this._balance.amount !== 0) throw new Error('Balance must be zero to close');
    this._status = 'closed';
  }

  // NO framework imports, NO database calls, NO HTTP
  // Pure business logic — testable with zero infrastructure

  private ensureActive(): void {
    if (this._status !== 'active') {
      throw new Error(\`Account is \${this._status}\`);
    }
  }

  private todaysWithdrawals(): Money {
    const today = new Date().toDateString();
    return this._transactions
      .filter(t => t.type === 'withdrawal' && t.date.toDateString() === today)
      .reduce((sum, t) => sum.add(t.amount), new Money(0, this._balance.currency));
  }

  private recordTransaction(type: 'deposit' | 'withdrawal', amount: Money): Transaction {
    const tx: Transaction = { id: crypto.randomUUID(), type, amount, date: new Date() };
    this._transactions.push(tx);
    return tx;
  }
}`
        }
      ],
      useCases: [
        'Financial calculations — money, interest, fees with strict invariants',
        'E-commerce — order lifecycle, cart rules, pricing logic',
        'Healthcare — patient records, medication interactions, dosage rules',
        'Booking systems — availability, conflict detection, cancellation rules',
        'Any domain where business rules are the primary source of complexity'
      ],
      commonPitfalls: [
        'Anemic entities: data bags with getters/setters but no behavior — logic scattered in services',
        'ORM entity conflated with domain entity: TypeORM/Prisma models are NOT domain entities',
        'Entities that depend on infrastructure: importing HTTP clients, ORMs, or SDKs',
        'God entities: one entity with 50 methods — decompose into smaller entities and value objects'
      ],
      interviewTips: [
        'Rich vs anemic model: "An anemic Order is a data bag. A rich Order rejects invalid state transitions."',
        'Purity test: "Can I test this entity with zero mocks and zero infrastructure? If yes, it is properly isolated."',
        'Framework separation: "The ORM model is a persistence concern. The domain entity is a business concern. They are different objects."',
        'Invariant enforcement: "A BankAccount should never have a negative balance — the entity enforces this, not the caller."'
      ],
      relatedConcepts: ['value-objects', 'aggregates', 'repository-pattern', 'clean-architecture-overview'],
      difficulty: 'intermediate',
      tags: ['clean-architecture', 'ddd', 'domain-model', 'rich-model']
    },
    {
      id: 'use-cases',
      title: 'Use Cases (Application Services)',
      description: 'Use Cases are the application-specific business rules. They orchestrate entities and infrastructure ports to fulfill a specific application need. Each use case is a single operation: PlaceOrder, CancelSubscription, GenerateReport. They define the INPUT (what they need), OUTPUT (what they return), and PORT interfaces (what infrastructure they require). Use cases are the "application layer" — they coordinate but do not contain core business logic.',
      keyPoints: [
        'One use case per operation: PlaceOrderUseCase, not OrderService with 20 methods',
        'Orchestrator, not implementor: coordinates entities and ports, does not contain domain logic itself',
        'Defines input/output DTOs: typed contracts for what comes in and what goes out',
        'Defines port interfaces: declares what infrastructure capabilities it needs (repository, gateway, sender)',
        'Independent of delivery mechanism: the same use case works for REST, GraphQL, CLI, or message consumer',
        'Transaction boundary: the use case defines where the transaction starts and commits/rolls back',
        'Testable in isolation: inject mock ports, test orchestration logic without infrastructure'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Use Case: Single-Purpose Application Service',
          code: `// Input DTO — what the use case needs
interface CancelSubscriptionInput {
  subscriptionId: string;
  reason: string;
  requestedBy: string;  // User ID requesting cancellation
}

// Output DTO — what the use case returns
interface CancelSubscriptionOutput {
  subscriptionId: string;
  cancelledAt: Date;
  refundAmount: number;
  refundStatus: 'processed' | 'pending' | 'none';
}

// Port interfaces — what infrastructure the use case requires
interface SubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  save(sub: Subscription): Promise<Subscription>;
}

interface RefundService {
  calculateProRatedRefund(sub: Subscription, cancelDate: Date): number;
  processRefund(customerId: string, amount: number): Promise<{ status: string }>;
}

interface CancellationNotifier {
  notifyCustomer(email: string, details: CancelSubscriptionOutput): Promise<void>;
  notifyBilling(subscriptionId: string): Promise<void>;
}

// Use case — orchestrates the cancellation workflow
class CancelSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly refundService: RefundService,
    private readonly notifier: CancellationNotifier,
  ) {}

  async execute(input: CancelSubscriptionInput): Promise<CancelSubscriptionOutput> {
    // 1. Load and validate
    const sub = await this.subscriptionRepo.findById(input.subscriptionId);
    if (!sub) throw new Error('Subscription not found');
    if (sub.status === 'cancelled') throw new Error('Already cancelled');
    if (sub.customerId !== input.requestedBy && !isAdmin(input.requestedBy)) {
      throw new Error('Not authorized to cancel this subscription');
    }

    // 2. Business logic (delegated to domain/entities where possible)
    const cancelDate = new Date();
    const refundAmount = this.refundService.calculateProRatedRefund(sub, cancelDate);

    // 3. Process refund
    let refundStatus: 'processed' | 'pending' | 'none' = 'none';
    if (refundAmount > 0) {
      const result = await this.refundService.processRefund(sub.customerId, refundAmount);
      refundStatus = result.status === 'success' ? 'processed' : 'pending';
    }

    // 4. Update state
    const cancelled: Subscription = {
      ...sub,
      status: 'cancelled',
      cancelledAt: cancelDate,
      cancellationReason: input.reason,
    };
    await this.subscriptionRepo.save(cancelled);

    // 5. Notify
    const output: CancelSubscriptionOutput = {
      subscriptionId: sub.id,
      cancelledAt: cancelDate,
      refundAmount,
      refundStatus,
    };
    await this.notifier.notifyCustomer(sub.customerEmail, output);
    await this.notifier.notifyBilling(sub.id);

    return output;
  }
}

function isAdmin(userId: string): boolean { return false; } // simplified`
        }
      ],
      useCases: [
        'Each user-facing operation as its own use case class — clear, focused, testable',
        'CQRS command handlers — each command maps to one use case',
        'Workflow orchestration — multi-step business processes with error handling and compensation',
        'Feature toggles — wrap use case invocation with feature flag checks in the controller, not in the use case'
      ],
      commonPitfalls: [
        'Fat services: OrderService with create/update/delete/list/export/import — split into individual use cases',
        'Use cases that contain domain logic — move rules into entities, use cases only orchestrate',
        'Use cases that know about HTTP (status codes, headers) — that belongs in the controller/adapter',
        'Not defining clear input/output DTOs — raw objects flowing across boundaries create implicit coupling'
      ],
      interviewTips: [
        'One use case = one operation: "PlaceOrderUseCase, not OrderService.placeOrder()"',
        'Orchestration: "The use case coordinates entities and ports. It does not implement business rules."',
        'Testability: "I inject mock ports and test the full workflow in milliseconds — no database, no HTTP"',
        'CQRS alignment: "Each use case naturally maps to a CQRS command or query handler"'
      ],
      relatedConcepts: ['entities-domain-objects', 'clean-architecture-overview', 'command', 'unit-of-work'],
      difficulty: 'intermediate',
      tags: ['clean-architecture', 'application-layer', 'orchestration']
    },
    {
      id: 'di-in-clean-architecture',
      title: 'Dependency Injection in Clean Architecture',
      description: 'Dependency Injection is the mechanism that makes Clean Architecture work. The domain layer defines interfaces (ports); the infrastructure layer implements them (adapters); and the composition root wires them together. Without DI, the dependency rule cannot be enforced — the domain would need to import infrastructure code. DI can be manual (constructor injection) or automated (IoC container like InversifyJS or tsyringe).',
      keyPoints: [
        'Constructor injection: pass dependencies through the constructor — simple, explicit, type-safe',
        'Composition root: the one place in the app that knows about ALL concrete types and wires them together',
        'The composition root lives at the outermost layer (main.ts, app bootstrap) — it is infrastructure',
        'IoC containers automate wiring: register interfaces → implementations, container resolves at runtime',
        'Manual DI vs container DI: manual is simpler for small apps; containers help with large dependency graphs',
        'Scoped lifetimes: singleton (one instance), request-scoped (one per HTTP request), transient (new each time)',
        'Service Locator antipattern: globally accessible container that hides dependencies — prefer constructor injection'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Manual DI: Composition Root',
          code: `// composition-root.ts — the ONE place that knows about all concrete types

// Infrastructure implementations
import { Pool } from 'pg';
import { PostgresUserRepository } from './infrastructure/postgres-user-repo';
import { PostgresOrderRepository } from './infrastructure/postgres-order-repo';
import { StripePaymentGateway } from './infrastructure/stripe-payment';
import { SendGridEmailSender } from './infrastructure/sendgrid-email';

// Use cases (depend only on interfaces)
import { PlaceOrderUseCase } from './application/place-order';
import { CancelOrderUseCase } from './application/cancel-order';
import { GetOrderUseCase } from './application/get-order';

// Controllers (depend on use cases)
import { OrderController } from './adapters/order-controller';

export function createApp() {
  // 1. Create infrastructure
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // 2. Create repositories (driven adapters)
  const userRepo = new PostgresUserRepository(pool);
  const orderRepo = new PostgresOrderRepository(pool);
  const payments = new StripePaymentGateway(process.env.STRIPE_KEY!);
  const emailSender = new SendGridEmailSender(process.env.SENDGRID_KEY!);

  // 3. Create use cases (inject dependencies)
  const placeOrder = new PlaceOrderUseCase(orderRepo, userRepo, payments, emailSender);
  const cancelOrder = new CancelOrderUseCase(orderRepo, payments);
  const getOrder = new GetOrderUseCase(orderRepo);

  // 4. Create controllers (inject use cases)
  const orderController = new OrderController(placeOrder, cancelOrder, getOrder);

  // 5. Wire to Express (or any framework)
  const app = express();
  app.post('/orders', (req, res) => orderController.create(req, res));
  app.delete('/orders/:id', (req, res) => orderController.cancel(req, res));
  app.get('/orders/:id', (req, res) => orderController.get(req, res));

  return app;
}

// For tests — same structure, different implementations
export function createTestApp() {
  const userRepo = new InMemoryUserRepository();
  const orderRepo = new InMemoryOrderRepository();
  const payments = new FakePaymentGateway();
  const emailSender = new FakeEmailSender();

  const placeOrder = new PlaceOrderUseCase(orderRepo, userRepo, payments, emailSender);
  return { placeOrder, userRepo, orderRepo, payments, emailSender };
}`
        }
      ],
      useCases: [
        'Wiring Clean Architecture layers together at the application entry point',
        'Environment-specific wiring: production uses real services, tests use fakes, dev uses local stubs',
        'Scoped dependencies: per-request database connections, per-request user context',
        'Plugin architectures: register implementations at the composition root, resolve at runtime'
      ],
      commonPitfalls: [
        'Service Locator: `Container.resolve(UserRepository)` anywhere in the code hides dependencies',
        'DI container as a global variable: defeats the purpose — inject the container only at the composition root',
        'Over-abstracting: not every function parameter needs an interface — abstract at boundaries, not everywhere',
        'Circular dependencies: A depends on B depends on A — restructure by extracting a shared interface'
      ],
      interviewTips: [
        'Manual DI is DIP: "Constructor injection IS dependency inversion — containers are optional automation"',
        'Composition root: "One file, one function, wires everything — the only place that imports concrete types"',
        'Testing: "Swap the composition root wiring to inject fakes — same use case, no infrastructure"',
        'Container vs manual: "For <20 services, manual wiring is clearer. For 50+, a container reduces boilerplate."'
      ],
      relatedConcepts: ['dependency-inversion-principle', 'clean-architecture-overview', 'abstract-factory'],
      difficulty: 'intermediate',
      tags: ['clean-architecture', 'dependency-injection', 'composition-root']
    },
    {
      id: 'testing-clean-architecture',
      title: 'Testing Clean Architecture',
      description: 'Clean Architecture is designed for testability. Each layer has a clear testing strategy: entities are tested with pure unit tests (no mocks), use cases are tested with mock ports (fast, isolated), adapters are tested with integration tests (real infrastructure), and the full system is tested with E2E tests. The test pyramid maps naturally to the architecture layers.',
      keyPoints: [
        'Entity tests: pure unit tests — no mocks, no infrastructure. Test business rules with plain values.',
        'Use case tests: mock port interfaces — verify orchestration logic without real database/network',
        'Adapter tests: integration tests — verify that PostgresUserRepository actually talks to PostgreSQL correctly',
        'E2E tests: full system tests — HTTP request through controller → use case → adapter → database',
        'Test pyramid: many entity tests (fast), medium use case tests, few adapter tests, minimal E2E tests',
        'Fake vs mock: fakes (InMemoryRepository) maintain state and can be asserted on; mocks verify calls',
        'The entire domain can be tested in milliseconds — no Docker, no database, no network'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Testing Each Layer of Clean Architecture',
          code: `// ─── ENTITY TESTS: Pure unit tests ─────────────────
describe('BankAccount', () => {
  it('rejects withdrawal exceeding balance', () => {
    const account = new BankAccount('acc-1', 'user-1', new Money(100, 'USD'), new Money(500, 'USD'));

    expect(() => account.withdraw(new Money(150, 'USD')))
      .toThrow('Insufficient funds');
  });

  it('tracks transactions after deposit', () => {
    const account = new BankAccount('acc-1', 'user-1', new Money(0, 'USD'), new Money(500, 'USD'));
    account.deposit(new Money(250, 'USD'));

    expect(account.balance).toEqual(new Money(250, 'USD'));
  });

  // No mocks. No setup. No teardown. Pure logic.
});

// ─── USE CASE TESTS: Mock ports ────────────────────
describe('CancelSubscriptionUseCase', () => {
  const mockSubRepo: SubscriptionRepository = {
    findById: async (id) => ({
      id,
      customerId: 'user-1',
      customerEmail: 'user@test.com',
      status: 'active',
      plan: 'pro',
      startDate: new Date('2024-01-01'),
    } as Subscription),
    save: async (sub) => sub,
  };

  const mockRefund: RefundService = {
    calculateProRatedRefund: () => 25.00,
    processRefund: async () => ({ status: 'success' }),
  };

  const mockNotifier: CancellationNotifier = {
    notifyCustomer: async () => {},
    notifyBilling: async () => {},
  };

  it('processes cancellation with pro-rated refund', async () => {
    const useCase = new CancelSubscriptionUseCase(mockSubRepo, mockRefund, mockNotifier);
    const result = await useCase.execute({
      subscriptionId: 'sub-1',
      reason: 'Too expensive',
      requestedBy: 'user-1',
    });

    expect(result.refundAmount).toBe(25.00);
    expect(result.refundStatus).toBe('processed');
  });

  it('rejects cancellation of already-cancelled subscription', async () => {
    const cancelledRepo = {
      ...mockSubRepo,
      findById: async () => ({ status: 'cancelled' } as Subscription),
    };
    const useCase = new CancelSubscriptionUseCase(cancelledRepo, mockRefund, mockNotifier);

    await expect(useCase.execute({
      subscriptionId: 'sub-1',
      reason: 'n/a',
      requestedBy: 'user-1',
    })).rejects.toThrow('Already cancelled');
  });
});

// ─── ADAPTER TESTS: Integration tests ─────────────
describe('PostgresSubscriptionRepository', () => {
  let pool: Pool;
  let repo: PostgresSubscriptionRepository;

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    repo = new PostgresSubscriptionRepository(pool);
    await pool.query('DELETE FROM subscriptions');
  });

  afterAll(() => pool.end());

  it('round-trips a subscription through save and findById', async () => {
    const sub: Subscription = { id: 'sub-test', customerId: 'u-1', status: 'active' } as Subscription;
    await repo.save(sub);
    const found = await repo.findById('sub-test');
    expect(found?.id).toBe('sub-test');
    expect(found?.status).toBe('active');
  });
});`
        }
      ],
      useCases: [
        'Building a comprehensive test suite that covers each architectural layer appropriately',
        'Achieving fast feedback loops — entity and use case tests run in milliseconds',
        'Catching integration issues — adapter tests verify real database queries',
        'Confidence in refactoring — change infrastructure without retesting domain logic'
      ],
      commonPitfalls: [
        'Testing entities through use cases — entity tests should be direct, not through orchestration',
        'Mocking everything: in adapter tests, DO use real infrastructure — that is the point of integration tests',
        'Too many E2E tests: they are slow and fragile — keep them minimal for critical paths',
        'Fakes that do not match real behavior: InMemoryRepository that skips constraints the real DB enforces'
      ],
      interviewTips: [
        'Map test types to layers: "Entities → unit, Use cases → unit with mocks, Adapters → integration, Full → E2E"',
        'Speed: "I can run 500 domain tests in 2 seconds because they are pure — no setup, no teardown"',
        'Confidence: "Integration tests catch the bugs mocks miss — does this SQL actually work?"',
        'Test pyramid: "Many fast entity tests, fewer use case tests, few adapter tests, minimal E2E tests"'
      ],
      relatedConcepts: ['clean-architecture-overview', 'use-cases', 'repository-pattern', 'dependency-inversion-principle'],
      difficulty: 'intermediate',
      tags: ['clean-architecture', 'testing', 'test-pyramid']
    },
    {
      id: 'clean-architecture-in-practice',
      title: 'Clean Architecture in Practice',
      description: 'Clean Architecture theory is clean. Reality is messy. This concept covers the practical decisions: where to draw the framework boundary, when Clean Architecture is overkill, how to apply it incrementally, and the modular monolith as a pragmatic middle ground. The goal is not architectural purity — it is sustainable velocity. Use the minimum architecture that keeps your codebase maintainable at its current scale.',
      keyPoints: [
        'Start simple, add layers as complexity grows: a 200-line service does not need four concentric layers',
        'Framework boundary placement: keep business logic in framework-agnostic code, wrap framework-specific code in adapters',
        'Modular monolith: Clean Architecture within a monolith — modules with clear boundaries, not microservices overhead',
        'When it is overkill: simple CRUD with no complex business rules — the architecture layers add ceremony without value',
        'Incremental adoption: start with the domain model, add use cases when orchestration grows complex, add adapters when you need swappability',
        'File structure that matches the architecture: domain/, application/, adapters/, infrastructure/ directories',
        'Pragmatic violations: sometimes the entity can import a utility library — purity is a spectrum, not a binary'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Pragmatic Clean Architecture: Directory Structure',
          code: `// Real-world directory structure for a modular monolith

// src/
// ├── modules/
// │   ├── orders/
// │   │   ├── domain/
// │   │   │   ├── order.ts            # Entity + business rules
// │   │   │   ├── order-item.ts       # Value object
// │   │   │   └── order-policies.ts   # Domain services
// │   │   ├── application/
// │   │   │   ├── place-order.ts      # Use case
// │   │   │   ├── cancel-order.ts     # Use case
// │   │   │   └── ports.ts            # Repository + service interfaces
// │   │   ├── infrastructure/
// │   │   │   ├── postgres-order-repo.ts
// │   │   │   └── stripe-payment.ts
// │   │   └── adapters/
// │   │       ├── order-controller.ts  # REST adapter
// │   │       └── order-consumer.ts    # Message queue adapter
// │   ├── users/
// │   │   ├── domain/
// │   │   ├── application/
// │   │   ├── infrastructure/
// │   │   └── adapters/
// │   └── notifications/
// │       ├── domain/
// │       ├── application/
// │       └── infrastructure/
// ├── shared/
// │   ├── domain/           # Shared value objects (Money, Email)
// │   └── infrastructure/   # Shared infra (database pool, logger)
// └── main.ts               # Composition root

// PRAGMATIC: not every module needs all four directories
// Small modules might just have domain/ and infrastructure/
// The structure grows with the module's complexity

// modules/notifications/
// ├── domain/
// │   └── notification.ts    # Simple — just domain model
// └── infrastructure/
//     └── sendgrid-sender.ts # Simple — just one adapter
// No application/ directory — simple enough without use case classes`
        }
      ],
      useCases: [
        'Deciding the right level of architectural investment for a given project',
        'Migrating a tangled codebase incrementally toward cleaner boundaries',
        'Designing a modular monolith that can be decomposed into microservices later',
        'Setting up a project structure that matches the architectural boundaries'
      ],
      commonPitfalls: [
        'Big bang adoption: rewriting the entire app to match Clean Architecture at once — migrate incrementally',
        'Architecture astronauting: layers, abstractions, and patterns for a TODO app',
        'Purity over productivity: refusing to import a utility library in the domain because it is not "pure"',
        'Not adapting the architecture to the team: a solo developer does not need the same structure as a 20-person team'
      ],
      interviewTips: [
        'Pragmatism: "I use Clean Architecture where it earns its keep — complex domains with multiple delivery mechanisms"',
        'Modular monolith: "Modules with clean boundaries inside a monolith — microservice benefits without the operational cost"',
        'Incremental: "Start with domain + infrastructure. Add application layer when orchestration grows. Add adapters when swappability is needed."',
        'Team size matters: "For a team of 2, manual DI and simple directories. For 20 engineers, modules with strict boundaries."'
      ],
      relatedConcepts: ['clean-architecture-overview', 'hexagonal-architecture', 'monolith-vs-microservices', 'bounded-contexts'],
      difficulty: 'advanced',
      tags: ['clean-architecture', 'pragmatism', 'modular-monolith', 'trade-offs'],
      proTip: 'The best architecture is the minimum architecture that keeps your team productive at the current scale. Over-architect and you drown in abstraction. Under-architect and you drown in spaghetti. The answer is always "it depends" — and what it depends on is complexity, team size, and expected lifetime.'
    },
  ],
}
