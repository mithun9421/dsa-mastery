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

export const archStylesCategory: Category = {
  id: 'architectural-styles',
  title: 'Architectural Styles',
  description: 'The macro-level structural decisions that define how a system is decomposed, how components communicate, and where data lives. Choosing between monolith, microservices, event-driven, or serverless is not a technology choice — it is a trade-off between team autonomy, operational complexity, consistency guarantees, and deployment velocity.',
  icon: '🏢',
  concepts: [
    {
      id: 'layered-architecture',
      title: 'Layered Architecture',
      description: 'Organizes code into horizontal layers — typically Presentation, Business Logic, and Data Access — where each layer only depends on the layer directly below it. This is the default architecture most developers learn first (MVC, three-tier) and it works well for CRUD-heavy applications. Its weakness is that it couples business logic to the data access layer, making it hard to swap databases or test business rules in isolation.',
      keyPoints: [
        'Strict layering: each layer calls only the layer directly below it — Presentation → Business → Data',
        'Relaxed layering: layers can skip intermediate layers — Presentation calls Data directly for simple reads',
        'Works well for CRUD apps: when the business logic IS the data transformations, layers map naturally',
        'Fails for complex domains: business logic gets scattered across layers or pulled into the data layer',
        'The "smart controller" antipattern: too much logic in the presentation layer because the business layer is anemic',
        'Vertical slicing is the modern alternative: organize by feature (user/, order/, payment/) instead of by layer',
        'N-tier is not the same as layered: N-tier is a deployment topology (client/server/database), layered is a code organization pattern'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Layered Architecture: Traditional Three-Layer',
          code: `// ─── PRESENTATION LAYER ──────────────────────────────
// Handles HTTP, validates request shape, calls business layer
class UserController {
  constructor(private readonly userService: UserService) {}

  async createUser(req: Request, res: Response) {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const user = await this.userService.createUser({ email, name, password });
    res.status(201).json(user);
  }

  async getUser(req: Request, res: Response) {
    const user = await this.userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  }
}

// ─── BUSINESS LAYER ──────────────────────────────────
// Contains business rules, calls data layer
class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async createUser(input: CreateUserInput): Promise<UserDto> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new ConflictError('Email already in use');
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.userRepo.create({
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      passwordHash,
    });
    return this.toDto(user);
  }

  async getUserById(id: string): Promise<UserDto | null> {
    const user = await this.userRepo.findById(id);
    return user ? this.toDto(user) : null;
  }

  private toDto(user: UserEntity): UserDto {
    return { id: user.id, email: user.email, name: user.name };
  }
}

// ─── DATA ACCESS LAYER ───────────────────────────────
// Handles persistence, SQL, ORM — no business logic
class UserRepository {
  constructor(private readonly db: Pool) {}

  async findById(id: string): Promise<UserEntity | null> {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ?? null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    await this.db.query(
      'INSERT INTO users (id, email, name, password_hash) VALUES ($1,$2,$3,$4)',
      [user.id, user.email, user.name, user.passwordHash],
    );
    return user;
  }
}

// Problem: UserService depends on UserRepository (infrastructure).
// Testing business logic requires a real or mocked database.
// Clean Architecture inverts this: business defines the interface.`
        }
      ],
      useCases: [
        'CRUD applications where business logic is straightforward data validation and transformation',
        'Small to medium applications with a single team and simple deployment',
        'Admin panels, internal tools, and backoffice applications',
        'Rapid prototypes where architectural purity is not yet warranted'
      ],
      commonPitfalls: [
        'Business logic leaking into controllers (smart controllers) or into repositories (smart queries)',
        'Anemic business layer that is just pass-through to the data layer — no real rules enforced',
        'Tight coupling to database: business layer depends on ORM entities, not domain objects',
        'Adding layers "just because" — a two-layer app (controller + repo) is fine for simple CRUD'
      ],
      interviewTips: [
        'Acknowledge it as the default and explain its limits: "Works for CRUD, breaks down for complex domains"',
        'Versus clean architecture: "Layered has business → data dependency. Clean inverts it: data implements business interfaces."',
        'Vertical slices: "Instead of Presentation/Business/Data layers, organize by feature: users/, orders/, payments/"',
        'When it is enough: "For an internal admin tool with 10 endpoints and no complex business rules, layered architecture is the right call"'
      ],
      relatedConcepts: ['clean-architecture-overview', 'hexagonal-architecture', 'monolith-vs-microservices'],
      difficulty: 'beginner',
      tags: ['architecture', 'layers', 'crud', 'traditional']
    },
    {
      id: 'event-driven-architecture',
      title: 'Event-Driven Architecture',
      description: 'An architectural style where components communicate by producing and consuming events rather than direct synchronous calls. Producers emit events without knowing who consumes them; consumers react to events without knowing who produced them. This radical decoupling enables independent scaling, deployment, and evolution of components. The trade-off: eventual consistency, harder debugging, and the need for idempotent consumers.',
      keyPoints: [
        'Producers and consumers are decoupled: producer emits events, does not know or care who consumes them',
        'Event types: domain events (business facts), integration events (cross-service), notification events (triggers)',
        'Message broker: Kafka, RabbitMQ, SQS, NATS — the infrastructure that routes events between producers and consumers',
        'Eventual consistency: consumers process events asynchronously — the system is not immediately consistent',
        'Event schema evolution: events must be backward and forward compatible as the schema evolves',
        'Dead letter queue: events that fail processing go to a DLQ for investigation and retry',
        'Idempotent consumers: the same event may be delivered more than once — consumers must handle duplicates gracefully',
        'Event ordering: within a partition/queue, events are ordered; across partitions, no ordering guarantee'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Event-Driven: Producer and Consumer with Schema Evolution',
          code: `// Event schema with versioning for forward/backward compatibility
interface EventEnvelope<T> {
  readonly eventId: string;
  readonly eventType: string;
  readonly version: number;
  readonly timestamp: Date;
  readonly source: string;
  readonly correlationId: string;
  readonly payload: T;
}

// Schema evolution: v1 had 'amount', v2 adds 'currency'
// Backward compatible: v1 consumers ignore 'currency'
// Forward compatible: v2 consumers default currency to 'USD' if missing
interface OrderPlacedV1 {
  orderId: string;
  customerId: string;
  amount: number;
}

interface OrderPlacedV2 extends OrderPlacedV1 {
  currency: string;       // New field — optional for backward compat
  items: Array<{          // New field — optional for backward compat
    productId: string;
    quantity: number;
  }>;
}

// Producer — publishes events without knowing consumers
class OrderService {
  constructor(
    private readonly broker: MessageBroker,
    private readonly orderRepo: OrderRepository,
  ) {}

  async placeOrder(input: PlaceOrderInput): Promise<string> {
    const order = this.createOrder(input);
    await this.orderRepo.save(order);

    // Publish event — producer does not know who listens
    await this.broker.publish<OrderPlacedV2>({
      eventId: crypto.randomUUID(),
      eventType: 'order.placed',
      version: 2,
      timestamp: new Date(),
      source: 'order-service',
      correlationId: order.id,
      payload: {
        orderId: order.id,
        customerId: input.customerId,
        amount: order.total,
        currency: 'USD',
        items: input.items,
      },
    });

    return order.id;
  }

  private createOrder(input: PlaceOrderInput): Order {
    return {} as Order; // simplified
  }
}

// Consumer — idempotent, handles schema versions
class InventoryConsumer {
  private processedEvents = new Set<string>(); // Dedup in production: use DB

  constructor(
    private readonly broker: MessageBroker,
    private readonly inventoryRepo: InventoryRepository,
  ) {
    this.broker.subscribe('order.placed', (event) => this.handleOrderPlaced(event));
  }

  async handleOrderPlaced(event: EventEnvelope<OrderPlacedV1 | OrderPlacedV2>): Promise<void> {
    // Idempotency check — skip if already processed
    if (this.processedEvents.has(event.eventId)) return;

    // Handle both v1 and v2 schemas
    const items = 'items' in event.payload
      ? event.payload.items
      : [{ productId: 'unknown', quantity: 1 }]; // v1 fallback

    for (const item of items) {
      await this.inventoryRepo.reserve(item.productId, item.quantity);
    }

    this.processedEvents.add(event.eventId);
  }
}

// Dead letter handler — events that fail after max retries
class DeadLetterProcessor {
  async handleFailedEvent(event: EventEnvelope<unknown>, error: Error): Promise<void> {
    await this.alertService.notify(\`DLQ: \${event.eventType} failed: \${error.message}\`);
    await this.dlqStore.save({ event, error: error.message, failedAt: new Date() });
  }
}`
        }
      ],
      useCases: [
        'Microservice communication where synchronous calls create tight coupling',
        'Order processing pipelines: order placed → inventory reserved → payment charged → shipment created',
        'Real-time data pipelines: user actions → analytics → personalization → recommendations',
        'IoT systems: sensors emit events, multiple systems consume and react independently',
        'Notification fanout: one event triggers email, push notification, SMS, and analytics simultaneously'
      ],
      commonPitfalls: [
        'Ignoring idempotency: at-least-once delivery means duplicate events WILL happen — handle them',
        'Schema breaking changes: removing or renaming fields breaks existing consumers',
        'Event ordering assumptions: across partitions, events arrive out of order — design for it',
        'Over-engineering: using events for simple request-response flows that would be simpler as HTTP calls',
        'Ghost events: events published but no consumer exists yet — they accumulate and confuse debugging'
      ],
      interviewTips: [
        'Trade-offs: "Decoupling and independent scaling vs eventual consistency and harder debugging"',
        'Idempotency: "Every consumer must handle duplicate events — use event IDs and deduplication tables"',
        'Schema evolution: "Add fields freely (backward compatible). Never remove or rename without a migration plan."',
        'When NOT to use: "If you need synchronous confirmation that an operation completed, events add unnecessary complexity"'
      ],
      relatedConcepts: ['event-sourcing', 'cqrs-arch', 'microservices', 'domain-events'],
      difficulty: 'advanced',
      tags: ['architecture', 'event-driven', 'async', 'decoupling']
    },
    {
      id: 'microservices',
      title: 'Microservices',
      description: 'An architectural style that structures an application as a collection of loosely coupled, independently deployable services, each owning its own data. Microservices are not about size ("micro") — they are about independence: independent development, independent deployment, independent scaling, and independent data ownership. The cost: distributed system complexity, network latency, data consistency challenges, and operational overhead that requires mature DevOps practices.',
      keyPoints: [
        'Decomposition strategies: by business capability (checkout, inventory, shipping), by subdomain (DDD bounded contexts), or by team ownership',
        'Data ownership: each service owns its data — no shared databases. Cross-service queries require API calls or event-driven denormalization.',
        'Service size debate: "micro" is misleading — a service should be big enough to be independently useful, small enough for one team to own',
        'Independent deployment: deploy service A without redeploying B — requires backward-compatible API changes',
        'API gateway: single entry point for clients, routes to appropriate services, handles cross-cutting concerns (auth, rate limiting)',
        'Service discovery: services find each other dynamically (Consul, Kubernetes DNS) instead of hardcoded URLs',
        'Distributed system problems: network failures, partial failures, cascading failures, distributed transactions, eventual consistency'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Microservices: Service Boundaries and Communication',
          code: `// ─── ORDER SERVICE ───────────────────────────────────
// Owns: orders table, order lifecycle
// Communicates with: inventory (events), payment (sync), shipping (events)

class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly paymentClient: PaymentServiceClient, // Sync HTTP call
    private readonly eventBus: EventBus,                   // Async events
  ) {}

  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    const order = new Order(crypto.randomUUID(), input.customerId, input.items);

    // Synchronous call — we need payment confirmation before proceeding
    const payment = await this.paymentClient.authorize({
      amount: order.total,
      customerId: input.customerId,
      idempotencyKey: order.id, // Prevents double-charge on retry
    });

    if (!payment.authorized) {
      throw new Error(\`Payment declined: \${payment.declineReason}\`);
    }

    order.markPaid(payment.transactionId);
    await this.orderRepo.save(order);

    // Async events — fire and forget, other services react
    await this.eventBus.publish('order.placed', {
      orderId: order.id,
      items: order.items,
      shippingAddress: input.address,
    });

    return order;
  }
}

// ─── PAYMENT SERVICE CLIENT ──────────────────────────
// HTTP client with resilience patterns
class PaymentServiceClient {
  constructor(
    private readonly baseUrl: string,
    private readonly circuitBreaker: CircuitBreaker,
  ) {}

  async authorize(input: AuthorizeInput): Promise<AuthorizeResult> {
    return this.circuitBreaker.execute(async () => {
      const response = await fetch(\`\${this.baseUrl}/payments/authorize\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': input.idempotencyKey,
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (!response.ok) {
        throw new Error(\`Payment service error: \${response.status}\`);
      }

      return response.json() as Promise<AuthorizeResult>;
    });
  }
}

// ─── INVENTORY SERVICE (event consumer) ──────────────
// Reacts to order.placed events, reserves stock
class InventoryService {
  constructor(private readonly inventoryRepo: InventoryRepository) {}

  async onOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    for (const item of event.items) {
      const stock = await this.inventoryRepo.findByProductId(item.productId);
      if (!stock || stock.available < item.quantity) {
        // Publish compensation event
        await this.eventBus.publish('inventory.reservation.failed', {
          orderId: event.orderId,
          productId: item.productId,
          reason: 'insufficient_stock',
        });
        return;
      }
      stock.reserve(item.quantity, event.orderId);
      await this.inventoryRepo.save(stock);
    }
    await this.eventBus.publish('inventory.reserved', { orderId: event.orderId });
  }
}`
        }
      ],
      useCases: [
        'Large organizations with multiple teams that need independent deployment and scaling',
        'Systems with components that have very different scaling requirements (100x more reads than writes)',
        'Polyglot environments where different services use different languages or databases',
        'High-availability systems where a failure in one component should not bring down the entire system'
      ],
      commonPitfalls: [
        'Distributed monolith: services that must be deployed together because of tight coupling — worst of both worlds',
        'Shared database: two services reading/writing the same tables — violates data ownership',
        'Too many services too early: operational overhead without organizational need — start with a modular monolith',
        'Synchronous chains: A calls B calls C calls D — fragile, slow, cascading failures',
        'Ignoring data consistency: cross-service transactions are not atomic — you need sagas or eventual consistency'
      ],
      interviewTips: [
        'Trade-offs: "Independent deployment and scaling vs distributed system complexity and eventual consistency"',
        'Decomposition: "By business capability (checkout, inventory), not by technical layer (API, database)"',
        'Data ownership: "Each service owns its data. No shared databases. Cross-service queries use events or API calls."',
        'When NOT to use: "If one team can own the entire system, a modular monolith is simpler and faster to develop"'
      ],
      relatedConcepts: ['monolith-vs-microservices', 'event-driven-architecture', 'circuit-breaker', 'service-mesh'],
      difficulty: 'advanced',
      tags: ['architecture', 'distributed', 'independence', 'scaling'],
      proTip: 'The first rule of microservices: do not start with microservices. Build a well-structured modular monolith. Extract services when you have concrete evidence that a module needs independent deployment or scaling — not because "Netflix does it."'
    },
    {
      id: 'monolith-vs-microservices',
      title: 'Monolith vs Microservices',
      description: 'The great architecture debate — but it is a false dichotomy. The real spectrum is: tangled monolith → modular monolith → macro-services → microservices. The right choice depends on team size, organizational structure, operational maturity, and the complexity of the domain. The modular monolith is the overlooked sweet spot: microservice-like boundaries without distributed system pain.',
      keyPoints: [
        'Monolith-first approach: start with a well-structured monolith, extract services when you have evidence of need',
        'Modular monolith: modules with clean boundaries, separate data stores (schemas), but deployed as one unit',
        'The modular monolith is the middle ground: team autonomy within modules, no distributed system complexity',
        'Strangler Fig migration: gradually replace monolith components with microservices, routing traffic through a facade',
        'Conway\'s Law: system architecture mirrors team communication structure — if you have 3 teams, you will have 3 services (at least)',
        'When microservices are wrong: small team, single deployment target, low operational maturity, no independent scaling needs',
        'When monolith is wrong: 50+ developers stepping on each other, parts need different scaling, independent deployment critical'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Modular Monolith: Clean Module Boundaries',
          code: `// Modular Monolith — deployed as one unit, structured as if it were many services
// Each module: own directory, own "public API", own database schema

// ─── MODULE PUBLIC APIs ─────────────────────────────
// modules/orders/public-api.ts — the ONLY thing other modules can import
export interface OrderModule {
  placeOrder(input: PlaceOrderInput): Promise<{ orderId: string }>;
  getOrder(orderId: string): Promise<OrderDto | null>;
  cancelOrder(orderId: string): Promise<void>;
}

// modules/inventory/public-api.ts
export interface InventoryModule {
  checkStock(productId: string, quantity: number): Promise<boolean>;
  reserveStock(productId: string, quantity: number, orderId: string): Promise<string>;
  releaseReservation(reservationId: string): Promise<void>;
}

// modules/payments/public-api.ts
export interface PaymentModule {
  authorize(customerId: string, amount: number): Promise<{ transactionId: string }>;
  capture(transactionId: string): Promise<void>;
  refund(transactionId: string): Promise<void>;
}

// ─── MODULE INTERNAL IMPLEMENTATION ─────────────────
// modules/orders/internal/ — PRIVATE, other modules cannot import
class OrderModuleImpl implements OrderModule {
  constructor(
    private readonly orderRepo: OrderRepository,  // Own schema: orders.*
    private readonly inventory: InventoryModule,   // Depends on public API only
    private readonly payments: PaymentModule,       // Depends on public API only
    private readonly eventBus: InProcessEventBus,
  ) {}

  async placeOrder(input: PlaceOrderInput): Promise<{ orderId: string }> {
    const available = await this.inventory.checkStock(input.productId, input.quantity);
    if (!available) throw new Error('Out of stock');

    const reservationId = await this.inventory.reserveStock(
      input.productId, input.quantity, input.orderId ?? crypto.randomUUID(),
    );

    try {
      const { transactionId } = await this.payments.authorize(input.customerId, input.amount);
      const order = await this.orderRepo.save({
        id: crypto.randomUUID(),
        customerId: input.customerId,
        items: [{ productId: input.productId, quantity: input.quantity }],
        transactionId,
        reservationId,
        status: 'confirmed',
      });

      await this.eventBus.publish('order.placed', { orderId: order.id });
      return { orderId: order.id };
    } catch (error) {
      await this.inventory.releaseReservation(reservationId);
      throw error;
    }
  }

  async getOrder(orderId: string) { return this.orderRepo.findById(orderId); }
  async cancelOrder(orderId: string) { /* ... */ }
}

// ─── COMPOSITION ROOT ───────────────────────────────
// Wire modules together — this is the ONE place that knows all implementations
function bootstrapModules(db: Pool, eventBus: InProcessEventBus) {
  const inventoryModule = new InventoryModuleImpl(db, eventBus);
  const paymentModule = new PaymentModuleImpl(db, eventBus);
  const orderModule = new OrderModuleImpl(
    new OrderRepository(db),
    inventoryModule,   // Injected by interface, not by import
    paymentModule,
    eventBus,
  );
  return { orderModule, inventoryModule, paymentModule };
}

// When it is time to extract: OrderModule becomes a separate service.
// Change: replace in-process call with HTTP/gRPC client.
// OrderModuleImpl becomes OrderServiceClient that calls the extracted service.
// All other modules are unchanged — they depend on the OrderModule interface.`
        }
      ],
      useCases: [
        'Choosing the right architecture for a new project based on team size and complexity',
        'Migrating from a tangled monolith to a modular structure before extracting services',
        'Evaluating whether the operational cost of microservices is justified for a given organization',
        'Planning a strangler fig migration from monolith to microservices'
      ],
      commonPitfalls: [
        'Starting with microservices for a small team — operational overhead dwarfs development speed',
        'Tangled monolith confused with all monoliths — a well-structured monolith is not the same as spaghetti code',
        'Big-bang rewrite: replacing the monolith all at once instead of incremental strangler fig migration',
        'Extracting services without team boundaries — if one team still owns both services, you just added network latency'
      ],
      interviewTips: [
        'Spectrum: "It is not monolith vs microservices — it is a spectrum: tangled → modular → macro → micro"',
        'Monolith-first: "Start modular monolith, extract when you have concrete evidence (team scaling, independent deployment needs)"',
        'Strangler Fig: "Route new traffic to the new service, keep old traffic on the monolith, migrate gradually"',
        'Conway\'s Law: "Your architecture will mirror your team structure — align service boundaries with team ownership"'
      ],
      relatedConcepts: ['microservices', 'layered-architecture', 'bounded-contexts', 'strangler-fig-pattern'],
      difficulty: 'advanced',
      tags: ['architecture', 'trade-offs', 'modular-monolith', 'migration']
    },
    {
      id: 'serverless-architecture',
      title: 'Serverless Architecture',
      description: 'An execution model where the cloud provider manages server infrastructure, automatically scaling compute in response to events. Functions-as-a-Service (FaaS) — AWS Lambda, Google Cloud Functions, Azure Functions — run code in response to triggers (HTTP, queue messages, scheduled events) and charge per invocation. Serverless eliminates server management but introduces cold starts, execution time limits, stateless constraints, and vendor lock-in.',
      keyPoints: [
        'Event-driven triggers: HTTP request, message queue, file upload, cron schedule, database change',
        'Auto-scaling: from zero to thousands of concurrent invocations automatically — true elastic scaling',
        'Pay-per-use: charged per invocation and execution duration, not for idle servers — cost-effective for variable workloads',
        'Cold starts: first invocation after idle period incurs initialization latency (100ms to several seconds)',
        'Stateless requirement: no local state between invocations — use external stores (DynamoDB, Redis, S3)',
        'Execution limits: maximum execution time (15 minutes on Lambda), memory limits, payload size limits',
        'Vendor lock-in: proprietary trigger integrations, IAM, and deployment models make migration expensive',
        'Observability challenge: distributed traces across many short-lived functions are harder to follow than monolith logs'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Serverless: Lambda Handler Patterns',
          code: `// AWS Lambda handler — stateless, event-triggered

// HTTP trigger (API Gateway)
export const createOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body ?? '{}');

    // Validate input
    const input = orderSchema.parse(body);

    // Business logic — uses external services for state
    const orderId = crypto.randomUUID();
    await dynamodb.put({
      TableName: 'orders',
      Item: { id: orderId, ...input, status: 'pending', createdAt: new Date().toISOString() },
    });

    // Publish to queue for async processing
    await sqs.sendMessage({
      QueueUrl: process.env.ORDER_QUEUE_URL!,
      MessageBody: JSON.stringify({ orderId, ...input }),
      MessageGroupId: input.customerId, // FIFO ordering per customer
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ orderId }),
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid input' }) };
    }
    console.error('Unhandled error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};

// Queue trigger (SQS) — processes orders asynchronously
export const processOrder = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const order = JSON.parse(record.body);
    try {
      // Idempotency check — SQS has at-least-once delivery
      const existing = await dynamodb.get({ TableName: 'orders', Key: { id: order.orderId } });
      if (existing.Item?.status !== 'pending') continue; // Already processed

      // Process the order
      await chargePayment(order);
      await reserveInventory(order);

      // Update status
      await dynamodb.update({
        TableName: 'orders',
        Key: { id: order.orderId },
        UpdateExpression: 'SET #s = :status',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':status': 'confirmed' },
      });
    } catch (error) {
      console.error(\`Failed to process order \${order.orderId}:\`, error);
      // Message goes back to queue for retry (or DLQ after max retries)
      throw error;
    }
  }
};

// Scheduled trigger (CloudWatch Events / EventBridge)
export const dailyReport = async (): Promise<void> => {
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const orders = await queryOrdersByDate(yesterday);
  const report = generateReport(orders);
  await s3.putObject({
    Bucket: 'reports',
    Key: \`daily/\${yesterday}.json\`,
    Body: JSON.stringify(report),
  });
};`
        }
      ],
      useCases: [
        'API endpoints with variable traffic — auto-scales from zero, no idle cost',
        'Event processing pipelines — react to S3 uploads, database changes, queue messages',
        'Scheduled tasks — cron jobs, daily reports, periodic cleanup',
        'Webhooks — receive callbacks from third-party services, process and store',
        'Rapid prototyping — skip infrastructure setup, deploy functions directly'
      ],
      commonPitfalls: [
        'Cold starts in latency-sensitive paths — mitigate with provisioned concurrency or keep-warm pings',
        'Long-running processes: Lambda has a 15-minute limit — use Step Functions or ECS for longer work',
        'Local development gap: simulating serverless locally is imperfect — test in staging early',
        'Cost surprise: high-throughput sustained workloads can be MORE expensive than dedicated servers'
      ],
      interviewTips: [
        'Trade-offs: "Zero infrastructure management vs cold starts, execution limits, and vendor lock-in"',
        'Cost model: "Cheap for sporadic/bursty workloads, expensive for sustained high throughput"',
        'Stateless: "Every invocation starts fresh — use external state stores (DynamoDB, Redis)"',
        'When NOT to use: "Long-running processes, latency-critical paths, or high sustained throughput"'
      ],
      relatedConcepts: ['event-driven-architecture', 'microservices', 'cloud-patterns'],
      difficulty: 'intermediate',
      tags: ['architecture', 'serverless', 'faas', 'cloud-native']
    },
    {
      id: 'cqrs-arch',
      title: 'CQRS (Command Query Responsibility Segregation)',
      description: 'Separates the read model (queries) from the write model (commands), allowing each to be independently optimized, scaled, and evolved. The command side enforces business rules on a normalized data model; the query side serves pre-computed, denormalized views optimized for specific read patterns. CQRS is NOT the same as event sourcing — they are independent patterns that combine well but are not required together.',
      keyPoints: [
        'Command side (writes): validated, normalized, enforces business rules, strong consistency within aggregates',
        'Query side (reads): denormalized, pre-computed, optimized for specific UI views, no business logic',
        'Synchronization: command side publishes events, query side updates its read models — eventual consistency',
        'Independent scaling: read replicas for queries (often 100x more reads), dedicated write primary for commands',
        'NOT event sourcing: you can do CQRS with a single relational database using materialized views',
        'Eventual consistency is the main trade-off: read model may lag behind write model by seconds',
        'When to use: read and write patterns differ dramatically — dashboards with complex aggregations, search, reporting'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'CQRS: Separated Command and Query Stacks',
          code: `// ─── COMMAND SIDE (Writes) ───────────────────────────
// Normalized, validates business rules, returns minimal data

interface PlaceOrderCommand {
  customerId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  shippingAddress: string;
}

class PlaceOrderHandler {
  constructor(
    private readonly orderRepo: OrderWriteRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(command: PlaceOrderCommand): Promise<{ orderId: string }> {
    // Business validation
    if (command.items.length === 0) throw new Error('Order must have items');

    const order = Order.create(command.customerId, command.items, command.shippingAddress);
    await this.orderRepo.save(order);

    // Publish event for read model synchronization
    await this.eventPublisher.publish({
      type: 'OrderPlaced',
      orderId: order.id,
      customerId: command.customerId,
      items: command.items,
      total: order.total,
      createdAt: new Date(),
    });

    return { orderId: order.id }; // Minimal response — no read model data
  }
}

// ─── QUERY SIDE (Reads) ─────────────────────────────
// Denormalized, no business logic, optimized for specific views

// View model — pre-joined, ready to serve without JOINs
interface OrderListItem {
  orderId: string;
  customerName: string;
  itemCount: number;
  total: number;
  status: string;
  createdAt: Date;
}

interface OrderDetail {
  orderId: string;
  customer: { name: string; email: string };
  items: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
  total: number;
  status: string;
  timeline: Array<{ event: string; timestamp: Date }>;
}

class OrderQueryService {
  constructor(private readonly readDb: ReadDatabase) {}

  async getOrderList(customerId: string, page: number, limit: number): Promise<OrderListItem[]> {
    // Single table scan — data already denormalized
    return this.readDb.query(
      'SELECT * FROM order_list_view WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [customerId, limit, (page - 1) * limit],
    );
  }

  async getOrderDetail(orderId: string): Promise<OrderDetail | null> {
    // Pre-computed — no JOINs, no aggregations at query time
    return this.readDb.queryOne(
      'SELECT data FROM order_detail_view WHERE order_id = $1',
      [orderId],
    );
  }

  async getDashboardStats(customerId: string): Promise<DashboardStats> {
    return this.readDb.queryOne(
      'SELECT * FROM customer_dashboard_view WHERE customer_id = $1',
      [customerId],
    );
  }
}

// ─── READ MODEL UPDATER (Projection) ────────────────
// Listens to events, updates denormalized read views
class OrderReadModelUpdater {
  constructor(private readonly readDb: ReadDatabase) {}

  async onOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    // Update list view
    await this.readDb.query(
      \`INSERT INTO order_list_view (order_id, customer_id, customer_name, item_count, total, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6)\`,
      [event.orderId, event.customerId, event.customerName, event.items.length, event.total, event.createdAt],
    );

    // Update detail view (store as JSONB for complex reads)
    await this.readDb.query(
      'INSERT INTO order_detail_view (order_id, data) VALUES ($1, $2)',
      [event.orderId, JSON.stringify(this.buildDetailView(event))],
    );

    // Update dashboard stats
    await this.readDb.query(
      \`INSERT INTO customer_dashboard_view (customer_id, total_orders, total_spent)
       VALUES ($1, 1, $2)
       ON CONFLICT (customer_id) DO UPDATE SET
         total_orders = customer_dashboard_view.total_orders + 1,
         total_spent = customer_dashboard_view.total_spent + $2\`,
      [event.customerId, event.total],
    );
  }

  private buildDetailView(event: OrderPlacedEvent): OrderDetail {
    return {} as OrderDetail; // Build the denormalized view
  }
}`
        }
      ],
      useCases: [
        'Read-heavy applications with complex aggregations (dashboards, reporting, search)',
        'Systems where read and write models need different data shapes',
        'Independent read/write scaling — many more reads than writes',
        'Multiple read views of the same data (list, detail, chart, export)'
      ],
      commonPitfalls: [
        'Assuming CQRS requires event sourcing — a materialized view in PostgreSQL is simple CQRS',
        'Using CQRS for simple CRUD — the overhead of two models is not justified',
        'Not handling stale reads: the UI must account for eventual consistency (optimistic updates, loading indicators)',
        'Read model updater failures: if the projection breaks, reads become stale — monitor and alert'
      ],
      interviewTips: [
        'Clarify immediately: "CQRS is NOT event sourcing. They combine well but are independent patterns."',
        'Simplest CQRS: "A PostgreSQL materialized view — same database, separate read optimization"',
        'When to use: "When read patterns are fundamentally different from write patterns — e.g., dashboard aggregations"',
        'Eventual consistency: "The read model lags the write model by milliseconds to seconds. The UI must handle this."'
      ],
      relatedConcepts: ['event-sourcing', 'event-driven-architecture', 'command', 'repository-pattern'],
      difficulty: 'advanced',
      tags: ['architecture', 'cqrs', 'read-write-separation', 'scaling']
    },
    {
      id: 'event-sourcing',
      title: 'Event Sourcing',
      description: 'Instead of storing the current state of an entity, Event Sourcing stores a complete sequence of state-changing events. The current state is derived by replaying events from the beginning. An order is not a row in a table — it is the sequence: OrderCreated → ItemAdded → ItemAdded → OrderConfirmed → PaymentReceived → OrderShipped. This gives you a complete audit trail, time-travel debugging, and the ability to rebuild any view of the data from the event log.',
      keyPoints: [
        'Append-only event log: events are immutable facts — never updated, never deleted, only appended',
        'Current state via replay: load all events for an aggregate, apply each one in sequence to reconstruct current state',
        'Snapshots for performance: periodically save the aggregate state to avoid replaying thousands of events',
        'Projections: read models built from the event stream — can be rebuilt from scratch by replaying all events',
        'Schema versioning: events in the store have different versions — upcasters transform old events to new schemas',
        'Time-travel debugging: replay events up to any point in time to see what the state was',
        'Event store implementations: EventStoreDB (purpose-built), PostgreSQL with append-only tables, Kafka as an event log',
        'Combined with CQRS: event sourcing for the write side, projections for the read side — the most common pairing'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Event Sourcing: Aggregate Reconstruction from Events',
          code: `// Events — immutable facts, stored forever
type AccountEvent =
  | { type: 'AccountOpened'; accountId: string; customerId: string; initialDeposit: number; timestamp: Date }
  | { type: 'MoneyDeposited'; accountId: string; amount: number; timestamp: Date }
  | { type: 'MoneyWithdrawn'; accountId: string; amount: number; timestamp: Date }
  | { type: 'AccountFrozen'; accountId: string; reason: string; timestamp: Date }
  | { type: 'AccountClosed'; accountId: string; timestamp: Date };

// Aggregate — rebuilt from events, not loaded from a row
class BankAccount {
  private _balance = 0;
  private _status: 'active' | 'frozen' | 'closed' = 'active';
  private _version = 0;
  private _pendingEvents: AccountEvent[] = [];

  private constructor(readonly id: string) {}

  // Reconstruct from event history
  static fromEvents(id: string, events: AccountEvent[]): BankAccount {
    const account = new BankAccount(id);
    for (const event of events) {
      account.apply(event, false); // Apply without recording as pending
    }
    return account;
  }

  // Command: deposit money
  deposit(amount: number): void {
    if (this._status !== 'active') throw new Error('Account is not active');
    if (amount <= 0) throw new Error('Amount must be positive');
    this.apply({
      type: 'MoneyDeposited',
      accountId: this.id,
      amount,
      timestamp: new Date(),
    }, true);
  }

  // Command: withdraw money
  withdraw(amount: number): void {
    if (this._status !== 'active') throw new Error('Account is not active');
    if (amount <= 0) throw new Error('Amount must be positive');
    if (amount > this._balance) throw new Error('Insufficient funds');
    this.apply({
      type: 'MoneyWithdrawn',
      accountId: this.id,
      amount,
      timestamp: new Date(),
    }, true);
  }

  get balance(): number { return this._balance; }
  get status(): string { return this._status; }
  get version(): number { return this._version; }
  get pendingEvents(): ReadonlyArray<AccountEvent> { return this._pendingEvents; }

  clearPendingEvents(): void { this._pendingEvents = []; }

  // Apply an event to update state
  private apply(event: AccountEvent, isNew: boolean): void {
    switch (event.type) {
      case 'AccountOpened':
        this._balance = event.initialDeposit;
        this._status = 'active';
        break;
      case 'MoneyDeposited':
        this._balance += event.amount;
        break;
      case 'MoneyWithdrawn':
        this._balance -= event.amount;
        break;
      case 'AccountFrozen':
        this._status = 'frozen';
        break;
      case 'AccountClosed':
        this._status = 'closed';
        break;
    }
    this._version++;
    if (isNew) this._pendingEvents.push(event);
  }
}

// Event Store — append-only
interface EventStore {
  loadEvents(aggregateId: string): Promise<AccountEvent[]>;
  appendEvents(aggregateId: string, events: AccountEvent[], expectedVersion: number): Promise<void>;
}

// Repository using Event Store
class EventSourcedAccountRepository {
  constructor(
    private readonly eventStore: EventStore,
    private readonly snapshotStore: SnapshotStore,
  ) {}

  async load(id: string): Promise<BankAccount> {
    // Try snapshot first for performance
    const snapshot = await this.snapshotStore.load(id);
    const events = snapshot
      ? await this.eventStore.loadEventsSince(id, snapshot.version)
      : await this.eventStore.loadEvents(id);

    return BankAccount.fromEvents(id, events);
  }

  async save(account: BankAccount): Promise<void> {
    const pending = account.pendingEvents;
    if (pending.length === 0) return;

    // Optimistic concurrency: expectedVersion prevents concurrent writes
    await this.eventStore.appendEvents(
      account.id,
      [...pending],
      account.version - pending.length,
    );

    account.clearPendingEvents();

    // Snapshot every 100 events
    if (account.version % 100 === 0) {
      await this.snapshotStore.save(account.id, account.version, account);
    }
  }
}`
        }
      ],
      useCases: [
        'Financial systems: complete audit trail of every transaction, regulatory compliance',
        'Collaborative editing: reconstruct document state at any point in time',
        'Gaming: replay match events for analysis, anti-cheat detection, spectator mode',
        'Event-driven microservices: event log as the shared source of truth, projections per service',
        'Analytics: replay events through new analytical models without changing the source data'
      ],
      commonPitfalls: [
        'Event schema changes breaking replay: use versioned events with upcasters for backward compatibility',
        'Performance on long event streams: use snapshots — do not replay 10 million events on every load',
        'Querying event-sourced data directly: events are not queryable — use CQRS projections for reads',
        'Deleting events: events are immutable — for GDPR, use crypto-shredding (encrypt per-user, delete the key)'
      ],
      interviewTips: [
        'Audit trail: "Every state change is recorded as an immutable event — you can answer any historical question"',
        'Time travel: "Replay events up to timestamp T to see the exact state at that moment"',
        'Projections: "Events are the source of truth. Read models are derived views — rebuilt by replaying events."',
        'Snapshots: "Performance optimization — save aggregate state periodically to avoid replaying entire history"'
      ],
      relatedConcepts: ['cqrs-arch', 'domain-events', 'event-driven-architecture', 'aggregates'],
      difficulty: 'expert',
      tags: ['architecture', 'event-sourcing', 'audit-trail', 'cqrs']
    },
    {
      id: 'service-mesh',
      title: 'Service Mesh',
      description: 'A dedicated infrastructure layer for managing service-to-service communication in microservices architectures. A service mesh uses sidecar proxies (deployed alongside each service) to handle traffic routing, load balancing, encryption (mTLS), observability, retries, and circuit breaking — without changing application code. Istio and Linkerd are the dominant implementations. The service mesh is the answer to "how do I add cross-cutting concerns to 50 services without modifying each one?"',
      keyPoints: [
        'Sidecar proxy: a lightweight proxy (Envoy, Linkerd-proxy) deployed alongside each service instance',
        'All traffic flows through the sidecar — the service talks to localhost, the proxy handles the rest',
        'mTLS between services: automatic encryption and identity verification without application-level TLS code',
        'Traffic management: canary deployments, traffic splitting, retries, timeouts, circuit breaking — configured via policies',
        'Observability: automatic distributed tracing, metrics, and access logs for every service-to-service call',
        'Control plane (Istiod, Linkerd control plane) manages proxy configuration; data plane (sidecars) handles traffic',
        'Trade-off: added latency per hop (1-5ms), resource overhead per sidecar, and significant operational complexity'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Service Mesh: What Changes (Almost Nothing in Code)',
          code: `// WITHOUT service mesh: application handles all cross-cutting concerns
class OrderServiceClient {
  constructor(
    private readonly baseUrl: string,
    private readonly circuitBreaker: CircuitBreaker,  // App manages
    private readonly retryPolicy: RetryPolicy,        // App manages
    private readonly tlsConfig: TlsConfig,            // App manages
    private readonly tracer: Tracer,                   // App manages
  ) {}

  async getOrder(id: string): Promise<Order> {
    const span = this.tracer.startSpan('getOrder');  // Manual tracing
    try {
      return await this.retryPolicy.execute(() =>     // Manual retry
        this.circuitBreaker.execute(() =>              // Manual circuit breaker
          fetch(\`\${this.baseUrl}/orders/\${id}\`, {
            headers: { 'Authorization': \`Bearer \${this.getToken()}\` },
            agent: this.tlsConfig.agent,              // Manual mTLS
          }).then(r => r.json())
        )
      );
    } finally {
      span.finish();
    }
  }
}

// WITH service mesh: application code is pure business logic
class OrderServiceClient {
  // Just call localhost — the sidecar handles EVERYTHING else
  private readonly baseUrl = 'http://order-service.default.svc.cluster.local';

  async getOrder(id: string): Promise<Order> {
    const response = await fetch(\`\${this.baseUrl}/orders/\${id}\`);
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
    return response.json();
  }
  // mTLS: handled by sidecar
  // Retries: configured in mesh policy
  // Circuit breaking: configured in mesh policy
  // Tracing: automatic via sidecar
  // Metrics: automatic via sidecar
  // Load balancing: handled by sidecar
}

// Mesh configuration (Istio VirtualService YAML, expressed as TS for readability)
const trafficPolicy = {
  connectionPool: {
    tcp: { maxConnections: 100 },
    http: { h2UpgradePolicy: 'DEFAULT', maxRequestsPerConnection: 10 },
  },
  outlierDetection: {
    consecutiveErrors: 5,
    interval: '30s',
    baseEjectionTime: '30s',
    maxEjectionPercent: 50,
  },
  loadBalancer: { simple: 'ROUND_ROBIN' },
  tls: { mode: 'ISTIO_MUTUAL' },  // Auto mTLS
};

// Canary deployment via mesh — no code changes
const canaryRoute = {
  route: [
    { destination: { host: 'order-service', subset: 'stable' }, weight: 90 },
    { destination: { host: 'order-service', subset: 'canary' }, weight: 10 },
  ],
};`
        }
      ],
      useCases: [
        'Microservices with 20+ services that need consistent cross-cutting concerns',
        'Zero-trust networking: mTLS between all services without application-level TLS management',
        'Canary deployments and traffic splitting without modifying service code',
        'Observability: automatic distributed tracing across all services',
        'Policy enforcement: rate limiting, access control, and circuit breaking across the mesh'
      ],
      commonPitfalls: [
        'Adding a mesh to 3 services — the operational overhead is not justified for small deployments',
        'Ignoring the latency: each sidecar hop adds 1-5ms — measure impact on critical paths',
        'Complexity cliff: debugging mesh configuration issues requires deep proxy/networking knowledge',
        'Istio vs Linkerd: Istio has more features but is more complex; Linkerd is simpler but less configurable'
      ],
      interviewTips: [
        'Core value: "Cross-cutting concerns (mTLS, retries, tracing) for all services without changing application code"',
        'Sidecar pattern: "A proxy co-located with each service instance — all traffic flows through the proxy"',
        'When to use: "20+ services, multiple teams, need for consistent security and observability policies"',
        'When NOT to use: "Small number of services where library-based solutions (Polly, resilience4j) are simpler"'
      ],
      relatedConcepts: ['microservices', 'sidecar-pattern', 'circuit-breaker', 'canary-release'],
      difficulty: 'expert',
      tags: ['architecture', 'service-mesh', 'infrastructure', 'observability']
    },
    {
      id: 'micro-frontends',
      title: 'Micro-Frontends',
      description: 'Extends microservice concepts to the frontend: independently developed, deployed, and owned frontend applications composed into a cohesive user experience. Each team owns a vertical slice from UI to backend. Webpack Module Federation, single-spa, and iframe-based approaches enable runtime composition of independently deployed frontend applications. The trade-off: independent deployment vs shared dependency management and consistent UX.',
      keyPoints: [
        'Vertical team ownership: each team owns a complete feature from UI to backend — not "frontend team" and "backend team"',
        'Module Federation (Webpack 5): share code at runtime — one app loads components from another deployed app',
        'Application Shell: a thin container that loads micro-frontends at runtime, handles routing and shared concerns',
        'Independent deployment: team A deploys their frontend without waiting for team B',
        'Shared dependency problem: React version conflicts, CSS clashes, inconsistent design systems',
        'Communication between MFEs: custom events, shared state store, URL routing — minimize coupling',
        'When it is overkill: small team, single product — the coordination overhead exceeds the independence benefit'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Micro-Frontend: Module Federation Pattern',
          code: `// ─── APPLICATION SHELL (Host) ────────────────────────
// Thin container that loads micro-frontends at runtime

// shell/src/App.tsx
const ProductCatalog = React.lazy(() => import('catalog/ProductList'));
const ShoppingCart = React.lazy(() => import('cart/CartWidget'));
const UserProfile = React.lazy(() => import('profile/UserProfile'));

function App() {
  return (
    <div>
      <SharedHeader />
      <React.Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/products/*" element={<ProductCatalog />} />
          <Route path="/cart/*" element={<ShoppingCart />} />
          <Route path="/profile/*" element={<UserProfile />} />
        </Routes>
      </React.Suspense>
      <SharedFooter />
    </div>
  );
}

// shell/webpack.config.ts (Module Federation)
const shellConfig = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        catalog: 'catalog@https://catalog.example.com/remoteEntry.js',
        cart: 'cart@https://cart.example.com/remoteEntry.js',
        profile: 'profile@https://profile.example.com/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};

// ─── MICRO-FRONTEND: CATALOG (Remote) ───────────────
// catalog/webpack.config.ts
const catalogConfig = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'catalog',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductList': './src/components/ProductList',
        './ProductDetail': './src/components/ProductDetail',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};

// ─── CROSS-MFE COMMUNICATION ────────────────────────
// Shared event bus — custom events for MFE communication
class MicroFrontendEventBus {
  static emit<T>(event: string, payload: T): void {
    window.dispatchEvent(new CustomEvent(\`mfe:\${event}\`, { detail: payload }));
  }

  static on<T>(event: string, handler: (payload: T) => void): () => void {
    const listener = (e: Event) => handler((e as CustomEvent<T>).detail);
    window.addEventListener(\`mfe:\${event}\`, listener);
    return () => window.removeEventListener(\`mfe:\${event}\`, listener);
  }
}

// Catalog MFE: publishes when item added to cart
function AddToCartButton({ product }: { product: Product }) {
  const handleClick = () => {
    MicroFrontendEventBus.emit('cart:item-added', {
      productId: product.id,
      name: product.name,
      price: product.price,
    });
  };
  return <button onClick={handleClick}>Add to Cart</button>;
}

// Cart MFE: subscribes to cart events
function CartWidget() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    return MicroFrontendEventBus.on<CartItem>('cart:item-added', (item) => {
      setItems(prev => [...prev, item]);
    });
  }, []);

  return <div>Cart ({items.length} items)</div>;
}`
        }
      ],
      useCases: [
        'Large organizations with 5+ frontend teams that need independent deployment',
        'E-commerce: catalog, cart, checkout, user profile owned by different teams',
        'Gradual migration: embed new React MFEs in an existing Angular or jQuery application',
        'Platform products: different teams build different feature modules (analytics, settings, billing)'
      ],
      commonPitfalls: [
        'Shared dependency version conflicts: two MFEs needing different React versions — use Module Federation singleton sharing',
        'Inconsistent UX: different teams building different-looking components — use a shared design system/component library',
        'Over-communication between MFEs: if MFEs are tightly coupled, you have a distributed monolith frontend',
        'Performance: loading 5 separate bundles with duplicate dependencies — shared module optimization is critical'
      ],
      interviewTips: [
        'Vertical slices: "Each team owns a feature from UI to API — not frontend team vs backend team"',
        'Module Federation: "Webpack 5 feature that loads components from independently deployed applications at runtime"',
        'Communication: "Custom events for loose coupling. If MFEs need tight coordination, the boundary is wrong."',
        'When NOT to use: "One team, one product — micro-frontends add deployment complexity without organizational benefit"'
      ],
      relatedConcepts: ['microservices', 'bff', 'monolith-vs-microservices'],
      difficulty: 'advanced',
      tags: ['architecture', 'frontend', 'micro-frontends', 'module-federation']
    },
    {
      id: 'bff',
      title: 'Backend for Frontend (BFF)',
      description: 'A pattern where each client type (web, mobile, TV, CLI) gets its own dedicated backend service that aggregates and tailors API responses for that specific client\'s needs. Instead of one generic API that every client must adapt to, each BFF shapes the data optimally for its client. Mobile gets compact payloads with minimal fields; web gets richer responses with nested data; TV gets simplified data for big-screen layouts.',
      keyPoints: [
        'One BFF per client type: web-bff, mobile-bff, tv-bff — each tailored to its client\'s data needs',
        'Aggregation: BFF calls multiple backend services and combines responses into one client-optimized payload',
        'Prevents over-fetching (mobile gets 100 fields when it needs 5) and under-fetching (web needs 3 API calls for one page)',
        'Team ownership: the team that builds the client also owns its BFF — aligned incentives',
        'GraphQL as universal BFF: clients query exactly what they need — field-level selection replaces per-client backends',
        'BFF is NOT a general-purpose API gateway — it contains client-specific logic (formatting, aggregation, pagination)',
        'Trade-off: more services to maintain, potential code duplication between BFFs'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'BFF: Mobile vs Web Tailored Responses',
          code: `// ─── MOBILE BFF ─────────────────────────────────────
// Compact payloads, minimal data, optimized for bandwidth

class MobileBFF {
  constructor(
    private readonly userService: UserServiceClient,
    private readonly orderService: OrderServiceClient,
    private readonly productService: ProductServiceClient,
  ) {}

  // Mobile home screen: compact, one API call
  async getHomeScreen(userId: string): Promise<MobileHomeResponse> {
    const [user, recentOrders, recommendations] = await Promise.all([
      this.userService.getUser(userId),
      this.orderService.getRecent(userId, 3),       // Only 3 recent
      this.productService.getRecommendations(userId, 5), // Only 5 recs
    ]);

    return {
      greeting: \`Hi, \${user.firstName}\`,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        status: o.status,
        total: o.total,
        // Mobile: minimal fields, no nested item details
      })),
      recommendations: recommendations.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        thumbnailUrl: p.images[0]?.thumbnail, // Mobile-size image
      })),
    };
  }
}

// ─── WEB BFF ────────────────────────────────────────
// Rich payloads, nested data, optimized for desktop rendering

class WebBFF {
  constructor(
    private readonly userService: UserServiceClient,
    private readonly orderService: OrderServiceClient,
    private readonly productService: ProductServiceClient,
    private readonly reviewService: ReviewServiceClient,
  ) {}

  // Web dashboard: rich, nested, everything for the page in one call
  async getDashboard(userId: string): Promise<WebDashboardResponse> {
    const [user, orders, recommendations, stats] = await Promise.all([
      this.userService.getUserWithPreferences(userId),
      this.orderService.getAll(userId, { page: 1, limit: 10 }),
      this.productService.getRecommendations(userId, 20),
      this.orderService.getStats(userId),
    ]);

    // Enrich orders with product details and reviews
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: await Promise.all(
          order.items.map(async (item) => ({
            ...item,
            product: await this.productService.getProduct(item.productId),
            review: await this.reviewService.getUserReview(userId, item.productId),
          })),
        ),
      })),
    );

    return {
      user: {
        name: user.fullName,
        email: user.email,
        avatar: user.avatarUrl,
        preferences: user.preferences,
        memberSince: user.createdAt,
      },
      orders: enrichedOrders,
      stats: {
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        averageOrderValue: stats.totalSpent / stats.totalOrders,
      },
      recommendations: recommendations.map(p => ({
        ...p,
        images: p.images, // Full resolution for desktop
        rating: p.averageRating,
        reviewCount: p.reviewCount,
      })),
    };
  }
}

// GraphQL as universal BFF alternative — clients query what they need
// const MOBILE_QUERY = gql\`
//   query HomeScreen($userId: ID!) {
//     user(id: $userId) { firstName }
//     recentOrders(userId: $userId, limit: 3) { id status total }
//     recommendations(userId: $userId, limit: 5) { id name price thumbnailUrl }
//   }
// \`;`
        }
      ],
      useCases: [
        'Multi-platform products: web, mobile, TV, CLI each need differently shaped API responses',
        'Preventing over/under-fetching: mobile gets compact data, web gets rich nested data',
        'Team autonomy: frontend teams control their own backend aggregation layer',
        'Migration: BFF wraps legacy APIs, provides clean interface to new frontends',
        'Performance: server-side aggregation reduces client-side API calls (critical for mobile on slow networks)'
      ],
      commonPitfalls: [
        'Generic BFF: one BFF for all clients defeats the purpose — it becomes a monolith API gateway',
        'Business logic in BFF: BFF should aggregate and format, not make business decisions',
        'Code duplication: similar aggregation logic in web-bff and mobile-bff — extract shared logic into libraries',
        'Too many BFFs: one per client type is fine; one per feature per client is too granular'
      ],
      interviewTips: [
        'Problem it solves: "Mobile needs 5 fields, web needs 50. One generic API either over-fetches or under-fetches."',
        'GraphQL alternative: "GraphQL lets each client query exactly what it needs — acts as a universal BFF"',
        'Team alignment: "The team building the iOS app also owns the mobile-bff — they control their own data shaping"',
        'When NOT to use: "Single client type (only web) — a well-designed REST API is sufficient"'
      ],
      relatedConcepts: ['microservices', 'micro-frontends', 'cqrs-arch', 'facade'],
      difficulty: 'intermediate',
      tags: ['architecture', 'bff', 'api-aggregation', 'multi-platform']
    },
  ],
}
