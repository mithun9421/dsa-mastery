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

export const dddCategory: Category = {
  id: 'domain-driven-design',
  title: 'Domain-Driven Design',
  description: 'Strategic and tactical patterns for modeling complex business domains in software. DDD is not about code patterns — it is about aligning software structure with business reality. The strategic patterns (bounded contexts, ubiquitous language, context mapping) matter far more than the tactical ones (entities, value objects, repositories), but most teams learn them in reverse order.',
  icon: '🗺️',
  concepts: [
    {
      id: 'bounded-contexts',
      title: 'Bounded Contexts',
      description: 'A Bounded Context is an explicit boundary within which a domain model is defined and applicable. The same real-world concept (e.g., "Customer") means different things in different contexts: in Sales, a Customer has leads and pipeline stages; in Billing, a Customer has invoices and payment methods; in Support, a Customer has tickets and SLA tiers. Forcing one universal Customer model creates a bloated, coupled monster. Bounded Contexts give each team its own model.',
      keyPoints: [
        'One model does NOT fit all: "Customer" in Sales, Billing, and Support have different attributes and behaviors',
        'Each Bounded Context owns its data — no shared database between contexts (in the ideal case)',
        'Context Map: the diagram showing how bounded contexts relate to each other',
        'Relationship patterns: Conformist (adopt their model), Anti-Corruption Layer (translate), Open Host Service (published API), Published Language (shared schema)',
        'Team ownership: ideally one team owns one bounded context — Conway\'s Law in action',
        'Communication between contexts via integration events, API calls, or shared messages — never shared databases',
        'Bounded Context is the #1 strategic pattern in DDD — get this wrong and tactical patterns will not save you'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Same Concept, Different Bounded Contexts',
          code: `// ─── SALES CONTEXT ──────────────────────────────────
// "Customer" in Sales = lead with pipeline information
namespace SalesContext {
  interface Customer {
    readonly id: string;
    readonly name: string;
    readonly company: string;
    readonly pipelineStage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed';
    readonly estimatedDealValue: number;
    readonly assignedRep: string;
    readonly lastContactedAt: Date;
  }

  function qualifyLead(customer: Customer): Customer {
    if (customer.pipelineStage !== 'lead') throw new Error('Can only qualify leads');
    return { ...customer, pipelineStage: 'qualified' };
  }
}

// ─── BILLING CONTEXT ────────────────────────────────
// "Customer" in Billing = account with payment information
namespace BillingContext {
  interface Customer {
    readonly accountId: string;
    readonly billingEmail: string;
    readonly paymentMethodId: string;
    readonly plan: 'free' | 'pro' | 'enterprise';
    readonly billingCycleDay: number;
    readonly outstandingBalance: number;
  }

  function chargeCustomer(customer: Customer, amount: number): Invoice {
    if (!customer.paymentMethodId) throw new Error('No payment method');
    return {
      id: crypto.randomUUID(),
      accountId: customer.accountId,
      amount,
      status: 'pending',
      issuedAt: new Date(),
    };
  }
}

// ─── SUPPORT CONTEXT ────────────────────────────────
// "Customer" in Support = contact with support tier info
namespace SupportContext {
  interface Customer {
    readonly contactId: string;
    readonly displayName: string;
    readonly email: string;
    readonly tier: 'basic' | 'priority' | 'dedicated';
    readonly slaResponseHours: number;
    readonly openTicketCount: number;
  }

  function canOpenTicket(customer: Customer): boolean {
    const limits: Record<string, number> = { basic: 3, priority: 10, dedicated: Infinity };
    return customer.openTicketCount < (limits[customer.tier] ?? 3);
  }
}

// ─── CONTEXT MAP: Integration between contexts ─────
// When a sale closes, Billing creates an account
// Anti-corruption layer translates Sales.Customer → Billing.Customer

class SalesToBillingACL {
  translateCustomer(salesCustomer: SalesContext.Customer): BillingContext.Customer {
    return {
      accountId: salesCustomer.id, // Same entity, different identity name
      billingEmail: '', // Must be fetched separately or set during onboarding
      paymentMethodId: '', // Not known in Sales context
      plan: this.inferPlan(salesCustomer.estimatedDealValue),
      billingCycleDay: 1,
      outstandingBalance: 0,
    };
  }

  private inferPlan(dealValue: number): 'free' | 'pro' | 'enterprise' {
    if (dealValue > 10000) return 'enterprise';
    if (dealValue > 1000) return 'pro';
    return 'free';
  }
}`
        }
      ],
      useCases: [
        'Large organizations where multiple teams work on the same "domain" but with different concerns',
        'Microservice decomposition — each bounded context is a candidate for a microservice',
        'Preventing model bloat — "Customer" with 50 fields serving 5 teams is a maintenance nightmare',
        'Legacy modernization — strangler fig pattern replaces bounded contexts one at a time'
      ],
      commonPitfalls: [
        'Shared database between contexts — creates hidden coupling; each context should own its data',
        'Universal model: one Customer class used everywhere — bloated, tightly coupled, hard to change',
        'Ignoring Conway\'s Law: context boundaries that do not match team boundaries create friction',
        'Too granular: creating a bounded context for every entity — contexts are coarse-grained business capabilities'
      ],
      interviewTips: [
        'Lead with the problem: "The word Customer means different things to Sales, Billing, and Support teams"',
        'Context Map: know the relationship patterns — Conformist, Anti-Corruption Layer, Open Host Service',
        'Conway\'s Law: "Team structure and bounded context boundaries should align"',
        'Microservices connection: "Each bounded context is a natural microservice candidate — but not the other way around"'
      ],
      relatedConcepts: ['ubiquitous-language', 'anti-corruption-layer', 'aggregates', 'monolith-vs-microservices'],
      difficulty: 'advanced',
      tags: ['ddd', 'strategic', 'context-mapping', 'team-boundaries']
    },
    {
      id: 'ubiquitous-language',
      title: 'Ubiquitous Language',
      description: 'A shared language between developers and domain experts that is used consistently in conversations, documentation, and code. If domain experts say "policy" but the code says "contract", every conversation requires mental translation — leading to bugs where the code does not match what the business intended. Ubiquitous Language eliminates this translation gap by using the exact same terms everywhere.',
      keyPoints: [
        'The code MUST use the same vocabulary as the domain experts — class names, method names, variable names',
        'Each bounded context has its own ubiquitous language — "Account" means something different in Banking vs Marketing',
        'Refactor code when language evolves — if the business renames "Order" to "Requisition", the code changes too',
        'Event Storming: a workshop technique for discovering the ubiquitous language with domain experts',
        'Language gaps are bug factories: if a developer interprets "shipment" differently than logistics, the code will be wrong',
        'Glossary: maintain a living glossary of domain terms per bounded context',
        'Domain expert collaboration is not optional — DDD without domain experts is just code architecture'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Ubiquitous Language: Code Matches Domain',
          code: `// BAD: Developer jargon that domain experts would not recognize
class DataProcessor {
  handleItem(payload: Record<string, unknown>) {
    if (payload.flag === 'active') {
      this.repo.upsertRecord(payload);
      this.queue.push({ type: 'ITEM_UPDATED', data: payload });
    }
  }
}

// GOOD: Ubiquitous language — domain expert reads this and nods
class ClaimAdjudicator {
  adjudicateClaim(claim: InsuranceClaim): AdjudicationResult {
    if (claim.isEligibleForAutoApproval()) {
      return this.autoApproveClaim(claim);
    }
    return this.escalateToManualReview(claim);
  }

  private autoApproveClaim(claim: InsuranceClaim): AdjudicationResult {
    const approvedClaim = claim.approve(new Date());
    return {
      claimId: approvedClaim.id,
      decision: 'approved',
      approvedAmount: approvedClaim.calculatePayout(),
      adjudicatedAt: new Date(),
    };
  }

  private escalateToManualReview(claim: InsuranceClaim): AdjudicationResult {
    return {
      claimId: claim.id,
      decision: 'pending_review',
      approvedAmount: 0,
      adjudicatedAt: new Date(),
      reviewReason: claim.requiresManualReviewBecause(),
    };
  }
}

// Domain expert reads this code and says:
// "Yes, claim adjudication auto-approves eligible claims
//  and escalates the rest to manual review. That is exactly
//  how our process works."
// THAT is the ubiquitous language working.

// Event Storming outputs become domain events in code:
interface DomainEvents {
  'ClaimSubmitted': { claimId: string; policyHolderId: string; amount: number };
  'ClaimAdjudicated': { claimId: string; decision: 'approved' | 'denied' | 'pending_review' };
  'PayoutIssued': { claimId: string; amount: number; recipientId: string };
  'ClaimAppealed': { claimId: string; appealReason: string };
  // Every event name is a term from the domain expert's vocabulary
}`
        }
      ],
      useCases: [
        'Aligning code vocabulary with business vocabulary to prevent miscommunication',
        'Event Storming workshops to discover domain events, commands, and aggregates',
        'Code review: verifying that class and method names match domain terminology',
        'Onboarding new developers: the code itself teaches the domain because it uses real business terms'
      ],
      commonPitfalls: [
        'Using technical jargon (DataProcessor, Handler, Manager) instead of domain terms (ClaimAdjudicator, PolicyUnderwriter)',
        'Different language per bounded context is EXPECTED — do not force one language across all contexts',
        'Not evolving the language: domain experts change terminology but the code stays stale',
        'DDD without domain experts: just applying patterns without understanding the domain'
      ],
      interviewTips: [
        'The test: "Can a domain expert read this class name and understand what it does?"',
        'Event Storming: "A workshop where developers and domain experts discover the domain model together using sticky notes"',
        'Bounded context link: "Each context has its own ubiquitous language — Account means different things in different contexts"',
        'Code is documentation: "If the code uses the right language, it becomes the living specification of the domain"'
      ],
      relatedConcepts: ['bounded-contexts', 'domain-events', 'aggregates'],
      difficulty: 'intermediate',
      tags: ['ddd', 'strategic', 'communication', 'naming']
    },
    {
      id: 'aggregates',
      title: 'Aggregates',
      description: 'An Aggregate is a cluster of domain objects (entities and value objects) treated as a single unit for data changes. Every aggregate has a root entity (the Aggregate Root) that is the only entry point for modifications. External objects can only reference the aggregate by its root ID — never hold references to inner entities. Aggregates define consistency boundaries: changes within one aggregate are transactionally consistent; changes across aggregates are eventually consistent.',
      keyPoints: [
        'Aggregate Root: the single entity through which all modifications flow — the gatekeeper of invariants',
        'Consistency boundary: all changes within one aggregate are atomic (single transaction)',
        'Cross-aggregate references: by ID only — never hold direct object references to another aggregate\'s internals',
        'Eventually consistent between aggregates: Aggregate A emits a domain event, Aggregate B reacts asynchronously',
        'Keep aggregates small: large aggregates create contention (multiple users modifying the same aggregate)',
        'One aggregate per repository: the repository loads and saves the entire aggregate, not individual inner entities',
        'Invariant enforcement: the aggregate root ensures all business rules are satisfied before allowing state changes'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Aggregate: Order with Line Items',
          code: `// Aggregate Root: Order
// Inner entities: OrderItem (cannot be accessed directly from outside)
// Value Objects: Money, Address

class Order {
  private _items: OrderItem[] = [];
  private _status: OrderStatus = 'draft';
  private readonly domainEvents: DomainEvent[] = [];

  constructor(
    readonly id: string,
    readonly customerId: string,  // Reference to Customer aggregate BY ID ONLY
    private _shippingAddress: Address,
  ) {}

  // ─── Public interface (through the aggregate root only) ───

  addItem(productId: string, quantity: number, unitPrice: Money): void {
    this.ensureStatus('draft');
    const existing = this._items.find(i => i.productId === productId);
    if (existing) {
      existing.increaseQuantity(quantity);
    } else {
      this._items.push(new OrderItem(productId, quantity, unitPrice));
    }
  }

  removeItem(productId: string): void {
    this.ensureStatus('draft');
    this._items = this._items.filter(i => i.productId !== productId);
  }

  confirm(): void {
    this.ensureStatus('draft');
    if (this._items.length === 0) throw new Error('Cannot confirm empty order');
    this._status = 'confirmed';
    // Domain event — other aggregates react asynchronously
    this.domainEvents.push({
      type: 'OrderConfirmed',
      payload: {
        orderId: this.id,
        customerId: this.customerId,
        total: this.total.amount,
        itemCount: this._items.length,
      },
      occurredAt: new Date(),
    });
  }

  ship(trackingNumber: string): void {
    this.ensureStatus('confirmed');
    this._status = 'shipped';
    this.domainEvents.push({
      type: 'OrderShipped',
      payload: { orderId: this.id, trackingNumber },
      occurredAt: new Date(),
    });
  }

  get total(): Money {
    return this._items.reduce(
      (sum, item) => sum.add(item.lineTotal),
      new Money(0, 'USD'),
    );
  }

  get items(): ReadonlyArray<Readonly<OrderItem>> { return this._items; }
  get status(): OrderStatus { return this._status; }
  get shippingAddress(): Address { return this._shippingAddress; }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  private ensureStatus(expected: OrderStatus): void {
    if (this._status !== expected) {
      throw new Error(\`Order is \${this._status}, expected \${expected}\`);
    }
  }
}

// Inner entity — NOT accessible from outside the aggregate
class OrderItem {
  constructor(
    readonly productId: string,
    private _quantity: number,
    readonly unitPrice: Money,
  ) {
    if (_quantity <= 0) throw new Error('Quantity must be positive');
  }

  get quantity(): number { return this._quantity; }
  get lineTotal(): Money { return this.unitPrice.multiply(this._quantity); }

  increaseQuantity(amount: number): void {
    if (amount <= 0) throw new Error('Amount must be positive');
    this._quantity += amount;
  }
}

// Repository loads/saves the ENTIRE aggregate
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  // No findOrderItemById — items are accessed through the Order aggregate
}`
        }
      ],
      useCases: [
        'E-commerce: Order (root) with OrderItems (inner) as a single transactional unit',
        'Banking: Account (root) with Transactions (inner) ensuring balance never goes negative',
        'Project management: Project (root) with Tasks (inner) with capacity limits',
        'Inventory: Warehouse (root) with StockItems (inner) with quantity invariants'
      ],
      commonPitfalls: [
        'Too-large aggregates: loading 10,000 order items on every order operation — keep aggregates small',
        'Direct references between aggregates: Order holding a Customer object instead of customerId',
        'Shared mutable state: two aggregates in the same transaction — use eventual consistency instead',
        'Anemic aggregates: aggregate root with only getters/setters, no behavior or invariant enforcement'
      ],
      interviewTips: [
        'Consistency boundary: "Within one aggregate: immediate consistency. Between aggregates: eventual consistency."',
        'Reference by ID: "Order stores customerId, not a Customer object. This decouples the aggregates."',
        'Size matters: "A large aggregate means lock contention. Keep aggregates small and use events for cross-aggregate coordination."',
        'Domain events: "When an Order is confirmed, it emits an OrderConfirmed event. Inventory reacts asynchronously."'
      ],
      relatedConcepts: ['domain-events', 'value-objects', 'entities-ddd', 'repository-ddd', 'unit-of-work'],
      difficulty: 'advanced',
      tags: ['ddd', 'tactical', 'consistency-boundary', 'aggregate-root']
    },
    {
      id: 'domain-events',
      title: 'Domain Events',
      description: 'A Domain Event represents something that happened in the domain that domain experts care about. Domain events are named in past tense using the ubiquitous language: OrderPlaced, PaymentReceived, ShipmentDelivered. They are the primary mechanism for communication between aggregates (within the same bounded context) and between bounded contexts (as integration events). Domain events are immutable facts — they record what happened, never what should happen.',
      keyPoints: [
        'Past tense naming: OrderPlaced (not PlaceOrder — that is a command), PaymentReceived, UserRegistered',
        'Immutable: events are facts — they cannot be changed or retracted, only compensated by new events',
        'Domain event vs integration event: domain events are internal (same context); integration events cross context boundaries',
        'Event Storming: workshop technique for discovering domain events before writing any code',
        'Aggregates publish domain events after state changes — collected during the operation, dispatched after persistence',
        'Eventual consistency driver: aggregate A publishes, aggregate B subscribes and reacts asynchronously',
        'Events carry the data needed by subscribers — but not the entire aggregate state (that would couple them)'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Domain Events: Publication and Handling',
          code: `// Domain event definitions — immutable, past-tense, carries relevant data
interface OrderPlaced {
  readonly type: 'OrderPlaced';
  readonly orderId: string;
  readonly customerId: string;
  readonly items: ReadonlyArray<{ productId: string; quantity: number }>;
  readonly totalAmount: number;
  readonly occurredAt: Date;
}

interface PaymentReceived {
  readonly type: 'PaymentReceived';
  readonly orderId: string;
  readonly paymentId: string;
  readonly amount: number;
  readonly method: 'card' | 'bank_transfer' | 'wallet';
  readonly occurredAt: Date;
}

interface OrderShipped {
  readonly type: 'OrderShipped';
  readonly orderId: string;
  readonly trackingNumber: string;
  readonly carrier: string;
  readonly estimatedDelivery: Date;
  readonly occurredAt: Date;
}

type OrderDomainEvent = OrderPlaced | PaymentReceived | OrderShipped;

// Aggregate collects events, use case dispatches them after save
class PlaceOrderUseCase {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(input: PlaceOrderInput): Promise<string> {
    const order = new Order(crypto.randomUUID(), input.customerId, input.shippingAddress);
    for (const item of input.items) {
      order.addItem(item.productId, item.quantity, new Money(item.unitPrice, 'USD'));
    }
    order.confirm();

    // 1. Save the aggregate
    await this.orderRepo.save(order);

    // 2. Dispatch domain events AFTER successful save
    const events = order.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }

    return order.id;
  }
}

// Event handlers — other aggregates/services react asynchronously
class InventoryEventHandler {
  constructor(private readonly inventoryRepo: InventoryRepository) {}

  async onOrderPlaced(event: OrderPlaced): Promise<void> {
    for (const item of event.items) {
      const inventory = await this.inventoryRepo.findByProductId(item.productId);
      if (!inventory) throw new Error(\`Unknown product: \${item.productId}\`);
      inventory.reserve(item.quantity, event.orderId);
      await this.inventoryRepo.save(inventory);
    }
  }
}

class NotificationEventHandler {
  async onOrderPlaced(event: OrderPlaced): Promise<void> {
    await this.emailService.send({
      to: event.customerId,
      template: 'order-confirmation',
      data: { orderId: event.orderId, total: event.totalAmount },
    });
  }

  async onOrderShipped(event: OrderShipped): Promise<void> {
    await this.emailService.send({
      to: event.orderId, // Would resolve customer email
      template: 'shipping-notification',
      data: { trackingNumber: event.trackingNumber, eta: event.estimatedDelivery },
    });
  }

  constructor(private readonly emailService: EmailService) {}
}`
        }
      ],
      useCases: [
        'Cross-aggregate communication: Order confirms → Inventory reserves stock → Notification sends email',
        'Audit trails: events are the complete history of what happened in the domain',
        'Event Sourcing: reconstruct aggregate state by replaying events from the beginning',
        'Cross-context integration: domain events become integration events when published to a message broker',
        'Analytics: subscribe to domain events to build read-optimized projections'
      ],
      commonPitfalls: [
        'Dispatching events before persistence: if the save fails, the event was published but the state was not changed',
        'Events carrying too much data: including the entire aggregate state couples subscribers to the publisher',
        'Events carrying too little data: subscribers need to call back to the publisher for more info — defeats decoupling',
        'Not distinguishing domain events from integration events: domain events are internal, integration events cross boundaries'
      ],
      interviewTips: [
        'Past tense: "Domain events are facts — OrderPlaced, not PlaceOrder (that is a command)"',
        'After save: "Publish events AFTER successful persistence — never before"',
        'Eventual consistency: "Aggregate A and B are eventually consistent through domain events"',
        'Event Sourcing connection: "If you store domain events as the source of truth, you get Event Sourcing"'
      ],
      relatedConcepts: ['aggregates', 'event-bus', 'event-sourcing', 'bounded-contexts', 'sagas'],
      difficulty: 'advanced',
      tags: ['ddd', 'tactical', 'events', 'decoupling']
    },
    {
      id: 'value-objects',
      title: 'Value Objects',
      description: 'A Value Object is an immutable object that is defined entirely by its attribute values, not by an identity. Two Money objects with the same amount and currency are equal — there is no "this $10 vs that $10." Value Objects encapsulate domain concepts that would otherwise be primitive obsession: using `string` for email, `number` for money, `{lat, lng}` for coordinates. They carry validation and behavior that primitives cannot.',
      keyPoints: [
        'No identity: equality is based on attribute values, not on an ID field',
        'Immutable: once created, a Value Object never changes — operations return new instances',
        'Self-validating: a Money object rejects negative amounts at construction, so invalid Money cannot exist',
        'Replaces primitive obsession: Email instead of string, Money instead of number, DateRange instead of two Dates',
        'Side-effect free: all operations return new Value Objects without modifying existing ones',
        'Examples: Money (amount + currency), Email (validated format), Address (street + city + zip), DateRange (start + end)',
        'In TypeScript: readonly properties, constructor validation, factory methods that return Result types'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Value Objects: Money, Email, DateRange',
          code: `// Value Object: Money — amount + currency, immutable, validated
class Money {
  readonly amount: number;
  readonly currency: string;

  constructor(amount: number, currency: string) {
    if (!Number.isFinite(amount)) throw new Error('Amount must be finite');
    if (amount < 0) throw new Error('Amount cannot be negative');
    if (!currency || currency.length !== 3) throw new Error('Currency must be 3-letter ISO code');
    this.amount = Math.round(amount * 100) / 100; // Round to cents
    this.currency = currency.toUpperCase();
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount > other.amount;
  }

  toString(): string { return \`\${this.currency} \${this.amount.toFixed(2)}\`; }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(\`Currency mismatch: \${this.currency} vs \${other.currency}\`);
    }
  }
}

// Value Object: Email — validated, normalized
class Email {
  readonly value: string;

  constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(normalized)) {
      throw new Error(\`Invalid email: \${value}\`);
    }
    this.value = normalized;
  }

  get domain(): string { return this.value.split('@')[1]; }
  equals(other: Email): boolean { return this.value === other.value; }
  toString(): string { return this.value; }
}

// Value Object: DateRange — validated pair of dates
class DateRange {
  constructor(
    readonly start: Date,
    readonly end: Date,
  ) {
    if (end <= start) throw new Error('End must be after start');
  }

  get durationMs(): number { return this.end.getTime() - this.start.getTime(); }
  get durationDays(): number { return this.durationMs / (1000 * 60 * 60 * 24); }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  overlaps(other: DateRange): boolean {
    return this.start < other.end && this.end > other.start;
  }

  equals(other: DateRange): boolean {
    return this.start.getTime() === other.start.getTime()
        && this.end.getTime() === other.end.getTime();
  }
}

// Usage — primitives replaced with expressive, validated types
const price = new Money(29.99, 'USD');
const tax = price.multiply(0.08);  // Returns new Money
const total = price.add(tax);      // Returns new Money
// price is still 29.99 — immutable

const email = new Email('  User@Example.COM  ');
console.log(email.value);  // "user@example.com" — normalized
console.log(email.domain); // "example.com"

const booking = new DateRange(new Date('2024-03-01'), new Date('2024-03-07'));
console.log(booking.durationDays); // 6`
        }
      ],
      useCases: [
        'Money: financial calculations with currency safety — never mix USD and EUR',
        'Email: validated format, normalized (lowercase, trimmed) — invalid emails cannot exist',
        'Address: street + city + state + zip with formatting and validation',
        'Coordinates: latitude/longitude pair with distance calculations',
        'DateRange: booking periods, subscriptions, campaigns with overlap detection'
      ],
      commonPitfalls: [
        'Primitive obsession: using `number` for money, `string` for email — no validation, no behavior',
        'Mutable value objects: value objects that allow mutation break equality guarantees',
        'Over-valuing: wrapping every primitive in a value object — use judgment (a boolean does not need a class)',
        'Equality by reference instead of by value: `money1 === money2` checks reference, not amount + currency'
      ],
      interviewTips: [
        'Primitive obsession: "Using string for email means I can pass any garbage. With an Email value object, invalid emails cannot exist."',
        'Immutability: "money.add(other) returns a NEW Money — the original is unchanged. No hidden side effects."',
        'Equality: "Two Money objects with amount=10 and currency=USD are equal. There is no identity — no this-$10 vs that-$10."',
        'When NOT to use: "A simple boolean flag does not need a value object. Use them for domain concepts with validation or behavior."'
      ],
      relatedConcepts: ['entities-ddd', 'aggregates', 'domain-events'],
      difficulty: 'intermediate',
      tags: ['ddd', 'tactical', 'immutable', 'primitive-obsession']
    },
    {
      id: 'entities-ddd',
      title: 'Entities',
      description: 'In DDD, an Entity is a domain object defined by its identity, not by its attribute values. Two Users with the same name and email are DIFFERENT entities if they have different IDs. Entities have a lifecycle — they are created, modified, and eventually archived or deleted. The key distinction from Value Objects: entities are equal by ID, value objects are equal by attributes.',
      keyPoints: [
        'Identity: entities are uniquely identified by an ID (UUID, sequence, natural key)',
        'Lifecycle: entities change over time — created, updated, state transitions, eventually retired',
        'Equality by ID: two entities with the same ID are the same entity, regardless of attribute differences',
        'Mutable (in a controlled way): entities can change state, but only through well-defined operations',
        'Rich entities contain behavior: not just data + getters, but methods that enforce business rules',
        'Identity generation: UUID for distributed systems, sequence for centralized databases, natural key when appropriate',
        'Entity vs Value Object: if two objects with the same attributes are interchangeable, it is a Value Object. If they need distinct tracking, it is an Entity.'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Entity: User with Identity and Lifecycle',
          code: `class User {
  private _email: Email;
  private _name: string;
  private _status: 'active' | 'suspended' | 'deactivated';
  private _role: 'member' | 'admin';
  private _lastLoginAt: Date | null = null;

  constructor(
    readonly id: string,        // Identity — immutable, defines the entity
    email: Email,
    name: string,
  ) {
    this._email = email;
    this._name = name;
    this._status = 'active';
    this._role = 'member';
  }

  get email(): Email { return this._email; }
  get name(): string { return this._name; }
  get status(): string { return this._status; }
  get role(): string { return this._role; }

  // Behavior — not just setters, but operations with business rules
  changeEmail(newEmail: Email): void {
    if (this._status === 'deactivated') throw new Error('Cannot change email of deactivated user');
    this._email = newEmail;
  }

  promote(): void {
    if (this._status !== 'active') throw new Error('Only active users can be promoted');
    this._role = 'admin';
  }

  suspend(reason: string): void {
    if (this._status === 'deactivated') throw new Error('Cannot suspend deactivated user');
    this._status = 'suspended';
  }

  reactivate(): void {
    if (this._status !== 'suspended') throw new Error('Only suspended users can be reactivated');
    this._status = 'active';
  }

  recordLogin(): void {
    this._lastLoginAt = new Date();
  }

  // Equality by ID — not by attributes
  equals(other: User): boolean {
    return this.id === other.id;
  }
}

// Two users with the same attributes are NOT equal unless same ID
const alice1 = new User('user-1', new Email('alice@test.com'), 'Alice');
const alice2 = new User('user-2', new Email('alice@test.com'), 'Alice');
console.log(alice1.equals(alice2)); // false — different identity

const sameAlice = new User('user-1', new Email('changed@test.com'), 'Alice Smith');
console.log(alice1.equals(sameAlice)); // true — same identity, different attributes`
        }
      ],
      useCases: [
        'Users, accounts, orders — objects with persistent identity and a lifecycle',
        'Products in a catalog — same name does not mean same product',
        'Vehicles, equipment, assets — tracked by serial number (identity) across their lifecycle',
        'Anything that needs to be distinguished even when all attributes are identical'
      ],
      commonPitfalls: [
        'Anemic entities: just data + getters/setters with no behavior — logic scattered in services',
        'Using entity when a value object suffices: if identity does not matter, it is a value object',
        'Exposing internal state: public setters that bypass business rules',
        'Identity generation in the wrong layer: database auto-increment leaks infrastructure into the domain'
      ],
      interviewTips: [
        'Identity vs attributes: "Two users named Alice are different people — they have different IDs"',
        'Versus Value Objects: "Money has no identity — any $10 is interchangeable. A User has identity — this user is unique."',
        'Rich model: "Entities contain behavior: user.suspend() enforces rules, not userService.suspendUser(userId)"',
        'UUID vs sequence: "UUID for distributed ID generation, sequence for centralized databases with no coordination"'
      ],
      relatedConcepts: ['value-objects', 'aggregates', 'repository-ddd', 'entities-domain-objects'],
      difficulty: 'intermediate',
      tags: ['ddd', 'tactical', 'identity', 'lifecycle']
    },
    {
      id: 'domain-services',
      title: 'Domain Services',
      description: 'A Domain Service encapsulates business logic that does not naturally belong to any single entity or value object. If an operation involves multiple aggregates or requires domain knowledge that is not specific to one entity, it belongs in a domain service. Domain Services are stateless, named using the ubiquitous language, and contain ONLY domain logic — no infrastructure, no persistence, no HTTP.',
      keyPoints: [
        'Stateless: domain services do not hold state — they receive inputs and return results',
        'Domain logic only: no database calls, no HTTP, no file system — pure business rules',
        'Named in domain language: TransferService, PricingPolicy, FraudDetectionService — not DataProcessor',
        'Use when logic does not belong to a single entity: cross-aggregate rules, complex calculations, policy enforcement',
        'Not a dumping ground: if the logic clearly belongs in an entity, put it there — domain services are for the exceptions',
        'Different from Application Service: domain services contain business rules, application services orchestrate workflow',
        'Takes entities/value objects as parameters, returns entities/value objects — pure domain operation'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Domain Service: Transfer Between Accounts',
          code: `// Domain Service — business logic that spans two aggregates
// Stateless, no infrastructure dependencies, pure domain rules

class MoneyTransferService {
  transfer(
    source: BankAccount,
    destination: BankAccount,
    amount: Money,
  ): TransferResult {
    // Business rule: cannot transfer between same account
    if (source.id === destination.id) {
      throw new Error('Cannot transfer to the same account');
    }

    // Business rule: source must have sufficient funds
    // (BankAccount.withdraw already checks this, but the service
    //  coordinates the two-aggregate operation)
    const withdrawal = source.withdraw(amount);
    const deposit = destination.deposit(amount);

    return {
      sourceTransaction: withdrawal,
      destinationTransaction: deposit,
      transferredAmount: amount,
      completedAt: new Date(),
    };
  }
}

// Another Domain Service: Pricing Policy
class DiscountPricingService {
  calculateFinalPrice(
    product: Product,
    customer: Customer,
    appliedCoupons: Coupon[],
  ): Money {
    let price = product.basePrice;

    // Tier-based discount
    const tierDiscount = this.tierDiscount(customer.tier);
    price = price.multiply(1 - tierDiscount);

    // Best coupon discount (not stackable)
    const bestCoupon = this.bestApplicableCoupon(appliedCoupons, product);
    if (bestCoupon) {
      const couponDiscount = bestCoupon.calculateDiscount(price);
      price = price.subtract(couponDiscount);
    }

    // Business rule: price floor — never below cost
    if (price.amount < product.costPrice.amount) {
      return product.costPrice;
    }

    return price;
  }

  private tierDiscount(tier: string): number {
    const discounts: Record<string, number> = {
      bronze: 0, silver: 0.05, gold: 0.10, platinum: 0.15
    };
    return discounts[tier] ?? 0;
  }

  private bestApplicableCoupon(coupons: Coupon[], product: Product): Coupon | null {
    return coupons
      .filter(c => c.isApplicableTo(product) && !c.isExpired())
      .sort((a, b) => b.discountPercent - a.discountPercent)[0] ?? null;
  }
}

// Key distinction:
// - Entity method: account.withdraw(amount) — logic on ONE aggregate
// - Domain Service: transferService.transfer(from, to, amount) — logic spanning TWO aggregates
// - Application Service: TransferUseCase.execute() — orchestrates persistence + events + notification`
        }
      ],
      useCases: [
        'Money transfers between accounts — involves two aggregates',
        'Pricing calculations involving product, customer, and coupons — multi-entity logic',
        'Fraud detection — analyzing patterns across multiple entities and historical data',
        'Matching algorithms — matching drivers to riders, products to queries',
        'Complex validation — rules spanning multiple aggregates'
      ],
      commonPitfalls: [
        'Domain service as a dumping ground: logic that belongs in an entity gets put in a service — leads to anemic model',
        'Infrastructure in domain services: database calls, HTTP requests — that belongs in application services',
        'Stateful domain services: holding state between calls — domain services should be stateless',
        'Confusing domain service with application service: domain = business rules, application = workflow orchestration'
      ],
      interviewTips: [
        'When to use: "When business logic spans multiple aggregates or does not belong to any single entity"',
        'Versus entity method: "account.withdraw() is entity behavior. transfer(from, to, amount) is domain service — it coordinates two aggregates"',
        'Versus application service: "Domain service: business rules. Application service: orchestration (save, notify, publish events)"',
        'Stateless: "Domain services are pure functions that take domain objects in and return domain objects out"'
      ],
      relatedConcepts: ['application-services', 'aggregates', 'value-objects', 'use-cases'],
      difficulty: 'advanced',
      tags: ['ddd', 'tactical', 'business-rules', 'stateless']
    },
    {
      id: 'application-services',
      title: 'Application Services',
      description: 'Application Services orchestrate the execution of a use case by coordinating domain objects, repositories, and external services. They do NOT contain business logic — that belongs in entities and domain services. Application services are thin: load aggregates, call domain methods, save aggregates, publish events. They define the transaction boundary and handle cross-cutting concerns like authorization and logging.',
      keyPoints: [
        'Orchestration, not implementation: call domain methods, coordinate persistence, dispatch events',
        'Transaction boundary: the application service defines where the transaction starts and ends',
        'Input/Output DTOs: translate between external representation and domain objects',
        'Authorization: check permissions before delegating to domain logic',
        'No domain logic: if you are writing `if (order.status === ...)` in an application service, it belongs in the entity',
        'One application service per use case: TransferMoneyService, not AccountService with 20 methods',
        'Maps to the application layer in Clean Architecture'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Application Service vs Domain Service',
          code: `// APPLICATION SERVICE — orchestrates the workflow
class TransferMoneyUseCase {
  constructor(
    private readonly accountRepo: AccountRepository,     // infrastructure
    private readonly transferService: MoneyTransferService, // domain service
    private readonly eventBus: EventBus,                 // infrastructure
    private readonly authService: AuthorizationService,  // infrastructure
  ) {}

  async execute(input: TransferInput): Promise<TransferOutput> {
    // 1. Authorization (cross-cutting)
    await this.authService.ensureCanTransfer(input.requestedBy, input.sourceAccountId);

    // 2. Load aggregates
    const source = await this.accountRepo.findById(input.sourceAccountId);
    const destination = await this.accountRepo.findById(input.destinationAccountId);
    if (!source || !destination) throw new Error('Account not found');

    // 3. Execute domain logic (delegated to domain service)
    const result = this.transferService.transfer(
      source,
      destination,
      new Money(input.amount, input.currency),
    );

    // 4. Persist changes
    await this.accountRepo.save(source);
    await this.accountRepo.save(destination);

    // 5. Publish domain events
    await this.eventBus.publish({
      type: 'MoneyTransferred',
      sourceAccountId: source.id,
      destinationAccountId: destination.id,
      amount: input.amount,
      currency: input.currency,
      occurredAt: result.completedAt,
    });

    // 6. Return DTO (not domain objects)
    return {
      transferId: crypto.randomUUID(),
      sourceBalance: source.balance.amount,
      destinationBalance: destination.balance.amount,
      transferredAmount: input.amount,
      completedAt: result.completedAt,
    };
  }
}

// Notice: the application service has ZERO business logic
// - MoneyTransferService handles the domain rules
// - BankAccount handles individual account rules
// - The application service just coordinates`
        }
      ],
      useCases: [
        'Every use case in the application — the primary entry point for domain operations',
        'CQRS command handlers — each command maps to one application service method',
        'Workflow coordination — load, validate, execute, save, notify in sequence',
        'Transaction management — begin/commit/rollback around domain operations'
      ],
      commonPitfalls: [
        'Fat application services: business logic in the orchestration layer — move it to entities or domain services',
        'Returning domain objects: expose DTOs at the boundary, not entities',
        'Missing authorization: application services are the right place for permission checks',
        'Catch-all services: UserApplicationService with 30 methods — one service per use case'
      ],
      interviewTips: [
        'Thin layer: "Application services are 10-20 lines: load, delegate, save, publish. No business logic."',
        'Versus domain service: "Domain service: business rules. Application service: load aggregates, call domain service, save, publish events."',
        'Transaction boundary: "The application service decides what is atomic — one save or many saves in one transaction."',
        'DTO mapping: "The application service translates between the API world (DTOs) and the domain world (entities)"'
      ],
      relatedConcepts: ['domain-services', 'use-cases', 'aggregates', 'unit-of-work'],
      difficulty: 'intermediate',
      tags: ['ddd', 'tactical', 'orchestration', 'application-layer']
    },
    {
      id: 'repository-ddd',
      title: 'Repositories',
      description: 'In DDD, a Repository provides a collection-like interface for accessing and persisting aggregates. There is one repository per aggregate — NOT one per table. The repository encapsulates the data access technology (SQL, ORM, API, file system) behind an interface that the domain layer defines. Repositories deal in aggregate roots only — inner entities and value objects are loaded and saved as part of the aggregate.',
      keyPoints: [
        'One repository per aggregate root — not one per database table',
        'Collection-like interface: add, findById, findAll, remove — feels like an in-memory collection',
        'The domain layer defines the repository interface; the infrastructure layer implements it',
        'Loads and saves the ENTIRE aggregate — not individual inner entities',
        'Specification pattern for complex queries: pass a specification object instead of adding a method per query',
        'Repository is NOT a DAO: DAO is table-centric, Repository is aggregate-centric',
        'Persistence ignorance: the domain does not know whether data is in PostgreSQL, MongoDB, or a file'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'DDD Repository: Aggregate-Centric',
          code: `// Repository interface — defined in the DOMAIN layer
interface OrderRepository {
  // Find operations — return domain aggregates, not database rows
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  findPending(): Promise<Order[]>;

  // Persistence — saves the ENTIRE aggregate (order + items + events)
  save(order: Order): Promise<void>;

  // Remove
  delete(id: string): Promise<void>;

  // For complex queries, use specification pattern
  findMatching(spec: OrderSpecification): Promise<Order[]>;
}

// Specification for flexible queries without bloating the repository interface
interface OrderSpecification {
  toSQL(): { where: string; params: unknown[] };
}

class RecentOrdersForCustomer implements OrderSpecification {
  constructor(
    private readonly customerId: string,
    private readonly since: Date,
  ) {}

  toSQL() {
    return {
      where: 'customer_id = $1 AND created_at > $2',
      params: [this.customerId, this.since],
    };
  }
}

// Infrastructure implementation — maps between domain and persistence
class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Order | null> {
    // Load order row + all item rows in one query (or two)
    const orderRow = await this.pool.query(
      'SELECT * FROM orders WHERE id = $1', [id]
    );
    if (!orderRow.rows[0]) return null;

    const itemRows = await this.pool.query(
      'SELECT * FROM order_items WHERE order_id = $1', [id]
    );

    // Reconstruct the ENTIRE aggregate from persistence
    return this.toDomain(orderRow.rows[0], itemRows.rows);
  }

  async save(order: Order): Promise<void> {
    // Save the entire aggregate in a transaction
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        \`INSERT INTO orders (id, customer_id, status, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET status = $3\`,
        [order.id, order.customerId, order.status, order.createdAt]
      );

      // Replace all items (simple strategy)
      await client.query('DELETE FROM order_items WHERE order_id = $1', [order.id]);
      for (const item of order.items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1,$2,$3,$4)',
          [order.id, item.productId, item.quantity, item.unitPrice.amount]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM orders WHERE id = $1', [id]);
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const rows = await this.pool.query(
      'SELECT * FROM orders WHERE customer_id = $1', [customerId]
    );
    return Promise.all(rows.rows.map(r => this.findById(r.id).then(o => o!)));
  }

  async findPending(): Promise<Order[]> {
    return this.findMatching({
      toSQL: () => ({ where: "status = 'pending'", params: [] }),
    });
  }

  async findMatching(spec: OrderSpecification): Promise<Order[]> {
    const { where, params } = spec.toSQL();
    const rows = await this.pool.query(\`SELECT * FROM orders WHERE \${where}\`, params);
    return Promise.all(rows.rows.map(r => this.findById(r.id).then(o => o!)));
  }

  private toDomain(row: any, items: any[]): Order {
    // Reconstruct domain aggregate from database rows
    const order = new Order(row.id, row.customer_id, row.shipping_address);
    for (const item of items) {
      order.addItem(item.product_id, item.quantity, new Money(item.unit_price, 'USD'));
    }
    return order;
  }
}`
        }
      ],
      useCases: [
        'Persisting and loading domain aggregates — the primary DDD persistence mechanism',
        'Testing: in-memory repository implementations for fast, isolated domain tests',
        'Database migration: swap repository implementation without changing domain logic',
        'Multi-storage: some aggregates in PostgreSQL, others in MongoDB — different repositories, same domain'
      ],
      commonPitfalls: [
        'One repository per table: repositories are per AGGREGATE, not per table',
        'Returning database rows: repositories must return domain objects, not raw rows or ORM entities',
        'Repository interface defined in infrastructure layer: it must be defined in the DOMAIN layer',
        'Loading partial aggregates: repositories load the COMPLETE aggregate — partial loads break invariants'
      ],
      interviewTips: [
        'Per aggregate: "One OrderRepository loads the entire Order with its items — not separate OrderItemRepository"',
        'Domain-defined: "The domain layer defines the interface; infrastructure implements it. Dependency inversion."',
        'Versus DAO: "DAO is table-centric (UserDAO for users table). Repository is aggregate-centric (OrderRepository for Order aggregate with items)."',
        'Specification pattern: "Instead of adding 20 findByX methods, use a Specification object for flexible queries"'
      ],
      relatedConcepts: ['aggregates', 'specification-pattern', 'repository-pattern', 'unit-of-work'],
      difficulty: 'intermediate',
      tags: ['ddd', 'tactical', 'persistence', 'aggregate']
    },
    {
      id: 'anti-corruption-layer',
      title: 'Anti-Corruption Layer',
      description: 'An Anti-Corruption Layer (ACL) is a translation layer that sits between your bounded context and an external system (legacy code, third-party API, another team\'s service) whose model does not match yours. The ACL prevents the external model from "corrupting" your domain model by translating concepts at the boundary. Without an ACL, your clean domain model gets polluted with fields, naming conventions, and invariants from external systems.',
      keyPoints: [
        'Translation boundary: converts between external model and your domain model at the edge',
        'Protects your domain from external model pollution — your classes stay clean regardless of what the external system looks like',
        'Implemented as adapters: ExternalSystemAdapter translates the external interface to your domain interface',
        'Two-way translation: incoming data from external → domain model; outgoing data from domain → external format',
        'Context Map pattern: ACL is one of several relationship types between bounded contexts',
        'Legacy system integration: wrap the legacy API in an ACL so your new code never touches legacy data structures',
        'Third-party API wrappers: your Stripe adapter is an ACL — it translates Stripe models to your domain models'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Anti-Corruption Layer: Legacy System Translation',
          code: `// Legacy system returns data in its own format
interface LegacyCustomerRecord {
  CUST_ID: string;          // Legacy naming
  CUST_NM: string;
  CUST_EMAIL_ADDR: string;
  CUST_STAT_CD: '1' | '2' | '3';  // 1=active, 2=inactive, 3=deleted
  ACCT_BAL_AMT: string;     // Amount as string with leading zeros
  LST_UPDT_TS: string;      // Timestamp as 'YYYYMMDDHHMMSS'
}

// Your clean domain model
interface Customer {
  readonly id: string;
  readonly name: string;
  readonly email: Email;
  readonly status: 'active' | 'inactive' | 'deleted';
  readonly accountBalance: Money;
  readonly lastUpdatedAt: Date;
}

// Anti-Corruption Layer — translates between legacy and domain
class LegacyCustomerACL {
  toDomain(record: LegacyCustomerRecord): Customer {
    return {
      id: record.CUST_ID,
      name: record.CUST_NM.trim(),
      email: new Email(record.CUST_EMAIL_ADDR.trim()),
      status: this.translateStatus(record.CUST_STAT_CD),
      accountBalance: this.parseBalance(record.ACCT_BAL_AMT),
      lastUpdatedAt: this.parseTimestamp(record.LST_UPDT_TS),
    };
  }

  toLegacy(customer: Customer): LegacyCustomerRecord {
    return {
      CUST_ID: customer.id,
      CUST_NM: customer.name,
      CUST_EMAIL_ADDR: customer.email.value,
      CUST_STAT_CD: this.reverseStatus(customer.status),
      ACCT_BAL_AMT: customer.accountBalance.amount.toFixed(2).padStart(12, '0'),
      LST_UPDT_TS: this.formatTimestamp(customer.lastUpdatedAt),
    };
  }

  private translateStatus(code: string): Customer['status'] {
    const map: Record<string, Customer['status']> = { '1': 'active', '2': 'inactive', '3': 'deleted' };
    return map[code] ?? 'inactive';
  }

  private reverseStatus(status: Customer['status']): '1' | '2' | '3' {
    const map: Record<string, '1' | '2' | '3'> = { active: '1', inactive: '2', deleted: '3' };
    return map[status] ?? '2';
  }

  private parseBalance(raw: string): Money {
    return new Money(parseFloat(raw), 'USD');
  }

  private parseTimestamp(raw: string): Date {
    // YYYYMMDDHHMMSS → Date
    const y = raw.slice(0, 4), m = raw.slice(4, 6), d = raw.slice(6, 8);
    const h = raw.slice(8, 10), min = raw.slice(10, 12), s = raw.slice(12, 14);
    return new Date(\`\${y}-\${m}-\${d}T\${h}:\${min}:\${s}Z\`);
  }

  private formatTimestamp(date: Date): string {
    return date.toISOString().replace(/[-T:Z.]/g, '').slice(0, 14);
  }
}

// Repository that uses the ACL to work with legacy system
class LegacyCustomerRepository implements CustomerRepository {
  constructor(
    private readonly legacyApi: LegacySystemClient,
    private readonly acl: LegacyCustomerACL,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const record = await this.legacyApi.getCustomer(id);
    return record ? this.acl.toDomain(record) : null;
  }

  async save(customer: Customer): Promise<void> {
    const record = this.acl.toLegacy(customer);
    await this.legacyApi.updateCustomer(record);
  }
}`
        }
      ],
      useCases: [
        'Legacy system integration — translate COBOL/mainframe data formats to modern domain models',
        'Third-party API wrappers — Stripe, Twilio, SendGrid SDKs wrapped in your domain interface',
        'Cross-team integration — another team\'s API returns data in their model, you translate to yours',
        'Database migration — old schema translated to new domain model during gradual migration'
      ],
      commonPitfalls: [
        'Skipping the ACL: using external models directly in your domain — one API change breaks your entire system',
        'ACL that is too smart: adding business logic in the translation layer — keep it pure translation',
        'Incomplete translation: missing fields, edge cases, or error conditions not handled',
        'Not testing the ACL: translation logic is subtle — unit test every mapping path'
      ],
      interviewTips: [
        'Every API wrapper is an ACL: "Your Stripe adapter translates Stripe models to domain models — that is an ACL"',
        'Protection: "Without an ACL, renaming a field in the legacy system cascades through your entire codebase"',
        'Context Map: "ACL is one relationship type in a Context Map — used when you control your side but not theirs"',
        'Versus Adapter: "Adapter changes one interface. ACL translates an entire model — concepts, naming, types, formats."'
      ],
      relatedConcepts: ['bounded-contexts', 'adapter', 'hexagonal-architecture', 'repository-ddd'],
      difficulty: 'advanced',
      tags: ['ddd', 'strategic', 'integration', 'translation']
    },
    {
      id: 'sagas',
      title: 'Sagas (Process Managers)',
      description: 'A Saga coordinates a long-running business process that spans multiple aggregates or services. Since each aggregate has its own transactional boundary, operations that span aggregates cannot be wrapped in a single database transaction. Instead, a Saga orchestrates a sequence of local transactions with compensating actions for rollback. If step 3 fails, the Saga runs compensations for steps 2 and 1 to restore consistency.',
      keyPoints: [
        'Long-running process: minutes, hours, or days — not a single database transaction',
        'Compensating transactions: instead of rollback, execute compensating actions to undo previous steps',
        'Two styles: Choreography (event-driven, decentralized) and Orchestration (central coordinator)',
        'Choreography: each service publishes events, next service reacts — no central coordinator',
        'Orchestration: a Saga Orchestrator tells each service what to do and tracks progress',
        'State machine: the saga has states and transitions — pending, in-progress, compensating, completed, failed',
        'Idempotent steps: each step and compensation must be idempotent — retries should not cause duplicate effects'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Saga: Orchestrated Order Fulfillment',
          code: `// Saga Orchestrator — coordinates the multi-step process

interface SagaStep<TInput, TOutput> {
  name: string;
  execute(input: TInput): Promise<TOutput>;
  compensate(input: TInput, output: TOutput): Promise<void>;
}

class SagaOrchestrator<TContext extends Record<string, unknown>> {
  private executedSteps: Array<{
    step: SagaStep<unknown, unknown>;
    input: unknown;
    output: unknown;
  }> = [];

  async run(steps: SagaStep<any, any>[], context: TContext): Promise<TContext> {
    for (const step of steps) {
      try {
        console.log(\`Executing: \${step.name}\`);
        const output = await step.execute(context);
        this.executedSteps.push({ step, input: context, output });
        Object.assign(context, output);
      } catch (error) {
        console.error(\`Failed at: \${step.name}. Starting compensation...\`);
        await this.compensate();
        throw new SagaFailedError(step.name, error);
      }
    }
    return context;
  }

  private async compensate(): Promise<void> {
    // Compensate in reverse order
    for (const { step, input, output } of [...this.executedSteps].reverse()) {
      try {
        console.log(\`Compensating: \${step.name}\`);
        await step.compensate(input, output);
      } catch (compensationError) {
        // Log and continue — compensation must be best-effort
        console.error(\`Compensation failed for \${step.name}:\`, compensationError);
      }
    }
  }
}

// Concrete steps for Order Fulfillment saga
const reserveInventory: SagaStep<OrderContext, { reservationId: string }> = {
  name: 'Reserve Inventory',
  async execute(ctx) {
    const reservationId = await inventoryService.reserve(ctx.orderId, ctx.items);
    return { reservationId };
  },
  async compensate(ctx, output) {
    await inventoryService.releaseReservation(output.reservationId);
  },
};

const chargePayment: SagaStep<OrderContext, { paymentId: string }> = {
  name: 'Charge Payment',
  async execute(ctx) {
    const paymentId = await paymentService.charge(ctx.customerId, ctx.total);
    return { paymentId };
  },
  async compensate(ctx, output) {
    await paymentService.refund(output.paymentId);
  },
};

const createShipment: SagaStep<OrderContext, { shipmentId: string }> = {
  name: 'Create Shipment',
  async execute(ctx) {
    const shipmentId = await shippingService.createShipment(ctx.orderId, ctx.address);
    return { shipmentId };
  },
  async compensate(ctx, output) {
    await shippingService.cancelShipment(output.shipmentId);
  },
};

// Run the saga
const saga = new SagaOrchestrator<OrderContext>();
try {
  await saga.run(
    [reserveInventory, chargePayment, createShipment],
    { orderId: 'ord-1', customerId: 'cus-1', items: [...], total: 99.99, address: '...' }
  );
  // All steps succeeded
} catch (error) {
  // Saga failed and compensated
  // error.failedStep tells you which step failed
}`
        }
      ],
      useCases: [
        'Order fulfillment: reserve inventory → charge payment → create shipment (compensate if any fails)',
        'User registration: create account → setup billing → send welcome email',
        'Travel booking: book flight → book hotel → book car (cancel earlier bookings if later ones fail)',
        'Approval workflows: submit → manager review → director review → execute',
        'Insurance claims: submit → assess → approve → pay — with compensations at each step'
      ],
      commonPitfalls: [
        'Non-idempotent steps: if a step is retried, it must not create duplicate effects',
        'Compensation that cannot succeed: some actions are not compensatable (email sent cannot be unsent) — plan for this',
        'Missing compensation steps: forgot to compensate a step → permanent inconsistency',
        'Choreography spaghetti: too many services reacting to events with no central coordination → use orchestration'
      ],
      interviewTips: [
        'Versus distributed transactions: "Sagas use compensating actions instead of 2-phase commit — more resilient, eventually consistent"',
        'Choreography vs orchestration: "Choreography is event-driven (decentralized), orchestration uses a central coordinator"',
        'Idempotency: "Every step must be idempotent — retrying reserve-inventory should not double-reserve"',
        'Real-world: "Every multi-step e-commerce checkout is a saga — reserve stock, charge card, create shipment, with rollback on failure"'
      ],
      relatedConcepts: ['domain-events', 'aggregates', 'event-bus', 'command'],
      difficulty: 'expert',
      tags: ['ddd', 'tactical', 'distributed', 'eventual-consistency', 'compensation']
    },
  ],
}
