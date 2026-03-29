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

export const solidCategory: Category = {
  id: 'solid-principles',
  title: 'SOLID Principles',
  description: 'The five principles that guide object-oriented design toward maintainable, extensible systems. Not as commandments to follow blindly, but as trade-off tools — know when each principle earns its weight and when rigid adherence creates more complexity than it prevents.',
  icon: '🧱',
  concepts: [
    {
      id: 'single-responsibility-principle',
      title: 'Single Responsibility Principle (SRP)',
      description: 'A class should have only one reason to change. "Reason to change" means "axis of change driven by a different stakeholder or business concern." SRP is NOT "a class should do one thing" — it is about grouping together things that change for the same reason and separating things that change for different reasons. The real skill is identifying what constitutes a "responsibility" in your specific domain.',
      keyPoints: [
        '"Responsibility" means "a reason to change" — driven by a specific stakeholder or business concern, not by counting methods',
        'God class antipattern: one class that handles authentication, validation, persistence, and email — four different axes of change',
        'SRP applies at every level: functions, classes, modules, services — not just classes',
        'Signs of SRP violation: class has methods used by different teams, class changes for unrelated feature requests, class has "and" in its name (UserManagerAndNotifier)',
        'Module cohesion: things that change together should live together. SRP is about maximizing cohesion, not minimizing class size',
        'Over-applying SRP creates "ravioli code" — hundreds of tiny classes that are hard to navigate and understand as a whole',
        'Test smell: when testing one method requires mocking dependencies used by completely unrelated methods in the same class'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'SRP Violation: God Class',
          code: `// VIOLATION: This class changes when:
// 1. User validation rules change (business)
// 2. Database schema changes (infrastructure)
// 3. Email template changes (communications)
// 4. Logging format changes (operations)
class UserService {
  async createUser(data: CreateUserDto) {
    // Validation logic — business rules
    if (!data.email.includes('@')) throw new Error('Invalid email');
    if (data.password.length < 8) throw new Error('Password too short');

    // Persistence logic — infrastructure
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await db.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [data.email, hashedPassword]
    );

    // Notification logic — communications
    await sendgrid.send({
      to: data.email,
      subject: 'Welcome!',
      html: \`<h1>Welcome \${data.email}</h1>\`,
    });

    // Logging logic — operations
    console.log(\`[USER_CREATED] \${user.id} at \${new Date().toISOString()}\`);

    return user;
  }
}`
        },
        {
          language: 'typescript',
          label: 'SRP Applied: Separated Concerns',
          code: `// Each class has ONE reason to change

// Changes when: validation rules change
class UserValidator {
  validate(data: CreateUserDto): void {
    if (!data.email.match(/^[^@]+@[^@]+\\.[^@]+$/)) {
      throw new ValidationError('Invalid email format');
    }
    if (data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
  }
}

// Changes when: persistence strategy changes
class UserRepository {
  async save(user: User): Promise<User> {
    const row = await this.db.query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [user.id, user.email, user.passwordHash]
    );
    return this.toDomain(row);
  }
}

// Changes when: notification channels or templates change
class UserNotificationService {
  async sendWelcome(user: User): Promise<void> {
    await this.emailSender.send({
      to: user.email,
      template: 'welcome',
      data: { name: user.name },
    });
  }
}

// Orchestrator — thin, delegates to specialists
class CreateUserUseCase {
  constructor(
    private readonly validator: UserValidator,
    private readonly repo: UserRepository,
    private readonly notifications: UserNotificationService,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(data: CreateUserDto): Promise<User> {
    this.validator.validate(data);
    const passwordHash = await this.hasher.hash(data.password);
    const user: User = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      passwordHash,
      createdAt: new Date(),
    };
    const saved = await this.repo.save(user);
    await this.notifications.sendWelcome(saved);
    return saved;
  }
}`
        }
      ],
      useCases: [
        'Identifying when a "service" class has grown to handle multiple unrelated concerns',
        'Deciding how to split a monolithic module into cohesive submodules',
        'Code review: detecting classes that change for multiple unrelated reasons',
        'Microservice decomposition: each service owns one business capability'
      ],
      commonPitfalls: [
        'Interpreting SRP as "one method per class" — it is about cohesion around a reason to change, not class size',
        'Over-splitting: creating UserEmailValidator, UserPasswordValidator, UserNameValidator when they all change together',
        'Confusing SRP with separation of concerns — SRP is about change axes, not about layering',
        'Not recognizing that the orchestrator/use-case class is its own valid responsibility'
      ],
      interviewTips: [
        'Define "responsibility" precisely: "one reason to change, driven by one stakeholder or business concern"',
        'Give a concrete violation example from real code — god service classes are universally relatable',
        'Discuss the over-application risk: "too many tiny classes creates navigation overhead and ravioli code"',
        'Connect to microservices: "SRP at the service level means each service owns one business capability"'
      ],
      relatedConcepts: ['open-closed-principle', 'facade', 'mediator', 'clean-architecture-overview'],
      difficulty: 'intermediate',
      tags: ['solid', 'cohesion', 'separation-of-concerns']
    },
    {
      id: 'open-closed-principle',
      title: 'Open/Closed Principle (OCP)',
      description: 'Software entities should be open for extension but closed for modification. You should be able to add new behavior without changing existing, tested code. The key mechanism is abstraction — define a contract (interface), then add new implementations without touching the consumers. Strategy pattern, plugin architectures, and middleware systems all embody OCP. But beware: premature abstraction in the name of OCP creates unnecessary complexity.',
      keyPoints: [
        'Open for extension: new behavior can be added (new classes, new strategy implementations, new plugins)',
        'Closed for modification: existing code does not change when new behavior is added',
        'Achieved through abstractions: interfaces, abstract classes, higher-order functions, plugin registries',
        'Strategy pattern is the canonical OCP implementation: add new algorithms without touching the context',
        'The switch/if-else antipattern: adding a new type requires modifying every switch statement — violates OCP',
        'Premature OCP is over-engineering: if you have only one implementation and no planned extension, an interface is overhead',
        'The "rule of three": wait until you have three concrete implementations before abstracting — otherwise you are guessing at the right interface'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'OCP Violation: Switch Statement Magnet',
          code: `// VIOLATION: Adding a new notification type requires modifying this function
function sendNotification(type: string, recipient: string, message: string) {
  switch (type) {
    case 'email':
      // Email logic
      break;
    case 'sms':
      // SMS logic
      break;
    case 'push':
      // Push notification logic
      break;
    // Every new type: modify this switch, modify tests, risk breaking existing types
    default:
      throw new Error(\`Unknown type: \${type}\`);
  }
}`
        },
        {
          language: 'typescript',
          label: 'OCP Applied: Strategy + Registry',
          code: `// CLOSED for modification: this interface and consumer never change
interface NotificationChannel {
  send(recipient: string, message: string): Promise<void>;
  supports(type: string): boolean;
}

// OPEN for extension: add new channels without modifying existing code
class EmailChannel implements NotificationChannel {
  supports(type: string) { return type === 'email'; }
  async send(recipient: string, message: string) {
    await this.mailer.send({ to: recipient, body: message });
  }
  constructor(private readonly mailer: Mailer) {}
}

class SMSChannel implements NotificationChannel {
  supports(type: string) { return type === 'sms'; }
  async send(recipient: string, message: string) {
    await this.twilioClient.messages.create({ to: recipient, body: message });
  }
  constructor(private readonly twilioClient: TwilioClient) {}
}

// New channel: zero changes to existing code
class SlackChannel implements NotificationChannel {
  supports(type: string) { return type === 'slack'; }
  async send(recipient: string, message: string) {
    await this.slack.postMessage({ channel: recipient, text: message });
  }
  constructor(private readonly slack: SlackClient) {}
}

// Consumer — closed for modification
class NotificationService {
  constructor(private readonly channels: NotificationChannel[]) {}

  async send(type: string, recipient: string, message: string): Promise<void> {
    const channel = this.channels.find(c => c.supports(type));
    if (!channel) throw new Error(\`No channel for type: \${type}\`);
    await channel.send(recipient, message);
  }
}

// Registration — add new channels at the composition root
const service = new NotificationService([
  new EmailChannel(mailer),
  new SMSChannel(twilioClient),
  new SlackChannel(slackClient),
  // Add WhatsApp, Discord, etc. — zero changes to NotificationService
]);`
        }
      ],
      useCases: [
        'Plugin systems — core is closed, plugins extend without modifying core code',
        'Payment gateways — add new payment providers without changing checkout logic',
        'Middleware stacks — add new middleware without modifying the pipeline',
        'Report generators — add new report formats without changing report logic',
        'Validation rules — add new validators without modifying the validation engine'
      ],
      commonPitfalls: [
        'Premature abstraction: creating interfaces for things that will only ever have one implementation',
        'Interface explosion: every function gets an interface "just in case" — YAGNI violation',
        'The wrong abstraction: guessing at the extension point before having concrete evidence of need',
        'Not recognizing that OCP has a cost: more interfaces, more files, more indirection to navigate'
      ],
      interviewTips: [
        'Show the progression: "First I noticed the switch statement growing with every feature. Then I extracted an interface."',
        'Mention the rule of three: "I wait for three implementations before creating an abstraction"',
        'Strategy + Factory is the most common OCP mechanism — know it cold',
        'Discuss the trade-off: "Every abstraction is a bet on what will change. Wrong bets create unnecessary complexity."'
      ],
      relatedConcepts: ['strategy', 'factory-method', 'decorator', 'single-responsibility-principle'],
      difficulty: 'intermediate',
      tags: ['solid', 'abstraction', 'extensibility'],
      proTip: 'The best signal for OCP is not "I might need another implementation someday" but "I already have two implementations and the switch statement is growing." Abstract from evidence, not speculation.'
    },
    {
      id: 'liskov-substitution-principle',
      title: 'Liskov Substitution Principle (LSP)',
      description: 'Objects of a supertype should be replaceable with objects of a subtype without altering the correctness of the program. LSP goes beyond interface compliance — subtypes must honor the behavioral contract: preconditions, postconditions, invariants, and exception guarantees. The classic violation is the Rectangle-Square paradox: a Square IS-A Rectangle mathematically, but if the Rectangle contract allows independent width/height mutation, Square breaks it.',
      keyPoints: [
        'Not just "implements the interface" — the subtype must honor the behavioral contract of the parent',
        'Preconditions: a subtype cannot strengthen preconditions (cannot require MORE from callers)',
        'Postconditions: a subtype cannot weaken postconditions (must guarantee at LEAST as much)',
        'Invariants: a subtype must maintain all invariants of the parent',
        'Covariance: return types can be more specific (narrower) in subtypes',
        'Contravariance: parameter types can be more general (wider) in subtypes — though TS does not enforce this',
        'Rectangle-Square: Square cannot independently set width/height, violating Rectangle contract that allows it',
        'Throwing unexpected exceptions is an LSP violation — if the parent never throws, subtypes should not either'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'LSP Violation: The Rectangle-Square Problem',
          code: `class Rectangle {
  constructor(protected _width: number, protected _height: number) {}

  setWidth(w: number): void { this._width = w; }
  setHeight(h: number): void { this._height = h; }
  area(): number { return this._width * this._height; }
}

class Square extends Rectangle {
  constructor(size: number) { super(size, size); }

  // LSP VIOLATION: strengthens precondition — callers of Rectangle
  // expect setWidth and setHeight to be independent
  setWidth(w: number): void {
    this._width = w;
    this._height = w; // Unexpected side effect!
  }

  setHeight(h: number): void {
    this._width = h;
    this._height = h; // Unexpected side effect!
  }
}

// This function works with Rectangle but BREAKS with Square
function resizeAndVerify(rect: Rectangle) {
  rect.setWidth(5);
  rect.setHeight(10);
  // For a Rectangle, area should be 50
  // For a Square, area is 100 — setHeight changed width too!
  console.assert(rect.area() === 50, \`Expected 50, got \${rect.area()}\`);
}`
        },
        {
          language: 'typescript',
          label: 'LSP Correct: Composition Over Inheritance',
          code: `// Solution: model the actual relationship — Shape as the common abstraction
interface Shape {
  area(): number;
  perimeter(): number;
}

// Rectangle and Square are independent implementations, not parent-child
class Rectangle implements Shape {
  constructor(
    readonly width: number,
    readonly height: number,
  ) {}

  area(): number { return this.width * this.height; }
  perimeter(): number { return 2 * (this.width + this.height); }

  withWidth(w: number): Rectangle { return new Rectangle(w, this.height); }
  withHeight(h: number): Rectangle { return new Rectangle(this.width, h); }
}

class Square implements Shape {
  constructor(readonly side: number) {}

  area(): number { return this.side * this.side; }
  perimeter(): number { return 4 * this.side; }

  withSide(s: number): Square { return new Square(s); }
}

// LSP-safe: any Shape can be used where Shape is expected
function printShapeInfo(shape: Shape): void {
  console.log(\`Area: \${shape.area()}, Perimeter: \${shape.perimeter()}\`);
  // No assumptions about mutation — works for all shapes
}

// Another LSP example: read-only interfaces preserve substitutability
interface ReadonlyRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
}

interface WritableRepository<T> extends ReadonlyRepository<T> {
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// CachedRepository is a valid substitute for ReadonlyRepository
// because it honors the contract: findById always returns T | null
class CachedRepository<T> implements ReadonlyRepository<T> {
  private cache = new Map<string, T>();

  constructor(private readonly inner: ReadonlyRepository<T>) {}

  async findById(id: string): Promise<T | null> {
    if (this.cache.has(id)) return this.cache.get(id)!;
    const result = await this.inner.findById(id);
    if (result) this.cache.set(id, result);
    return result;
  }

  async findAll(): Promise<T[]> {
    return this.inner.findAll(); // Caching findAll is more complex
  }
}`
        }
      ],
      useCases: [
        'Validating class hierarchies: does this subclass truly honor the parent contract?',
        'Designing interfaces that support substitution without surprise',
        'Choosing composition over inheritance when IS-A relationship breaks behavior',
        'API versioning: new API version must be backward-compatible (LSP at the API level)'
      ],
      commonPitfalls: [
        'Checking only interface compliance and ignoring behavioral contracts — "it compiles" is not "it works"',
        'Subtypes that throw exceptions the parent never throws — callers do not expect them',
        'Subtypes that silently ignore method calls (no-op override) — violates postcondition guarantees',
        'Inheritance hierarchies based on real-world IS-A that do not hold in code (Square IS-A Rectangle fails in code)'
      ],
      interviewTips: [
        'Lead with the Rectangle-Square example — it is the canonical LSP discussion',
        'Explain behavioral subtyping: "It is not enough to implement the interface — you must honor the contract"',
        'Preconditions/postconditions: "Subtypes cannot demand more, cannot deliver less"',
        'Practical test: "Can I swap this subclass in everywhere the parent is used without any code change or behavior change?"'
      ],
      relatedConcepts: ['interface-segregation-principle', 'open-closed-principle', 'adapter', 'strategy'],
      difficulty: 'advanced',
      tags: ['solid', 'behavioral-subtyping', 'contracts'],
      proTip: 'When tempted to override a method with a no-op or throw, stop. That is LSP screaming at you. The class hierarchy is wrong — use composition instead.'
    },
    {
      id: 'interface-segregation-principle',
      title: 'Interface Segregation Principle (ISP)',
      description: 'No client should be forced to depend on methods it does not use. Split fat interfaces into smaller, role-specific interfaces so that implementing classes only need to satisfy the methods relevant to them. In TypeScript, duck typing makes ISP especially important — interfaces document what each consumer actually needs, preventing accidental coupling to methods the consumer never calls.',
      keyPoints: [
        'Fat interface antipattern: one interface with 20 methods forces implementers to provide methods they do not need',
        'Role interfaces: instead of one UserService interface, have UserReader, UserWriter, UserDeleter — clients pick what they need',
        'TypeScript structural typing: interfaces serve as documentation — "this function needs an object with these specific capabilities"',
        'ISP reduces coupling: a function that takes `{ findById(id: string): Promise<User> }` can accept any object with that method',
        'ISP reduces the blast radius of change: modifying a write method does not affect read-only consumers',
        'Composition of interfaces: `interface UserService extends UserReader, UserWriter, UserDeleter {}` combines role interfaces',
        'In React: small prop interfaces per component, not one giant AppProps shared by everything'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'ISP Violation: Fat Interface',
          code: `// VIOLATION: Every consumer depends on ALL methods, even if they use one
interface UserService {
  findById(id: string): Promise<User | null>;
  findAll(filters?: UserFilters): Promise<User[]>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
  sendVerificationEmail(id: string): Promise<void>;
  resetPassword(id: string): Promise<string>;
  uploadAvatar(id: string, file: Buffer): Promise<string>;
  getActivityLog(id: string): Promise<ActivityEntry[]>;
  exportToCSV(): Promise<string>;
}

// This function only reads users, but it depends on the entire interface
// including password reset, avatar upload, CSV export...
async function getUserProfile(
  service: UserService, // Forced to depend on 10 methods to use 1
  userId: string,
) {
  return service.findById(userId);
}`
        },
        {
          language: 'typescript',
          label: 'ISP Applied: Role Interfaces',
          code: `// Segregated interfaces — each consumer depends only on what it needs

interface UserReader {
  findById(id: string): Promise<User | null>;
  findAll(filters?: UserFilters): Promise<User[]>;
}

interface UserWriter {
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
}

interface UserDeleter {
  delete(id: string): Promise<void>;
}

interface UserAuthService {
  sendVerificationEmail(id: string): Promise<void>;
  resetPassword(id: string): Promise<string>;
}

interface UserMediaService {
  uploadAvatar(id: string, file: Buffer): Promise<string>;
}

interface UserExporter {
  exportToCSV(): Promise<string>;
}

// Consumers depend on exactly what they need — nothing more
async function getUserProfile(
  reader: UserReader, // Only needs read capability
  userId: string,
): Promise<User | null> {
  return reader.findById(userId);
}

async function adminDeleteUser(
  reader: UserReader,
  deleter: UserDeleter,
  userId: string,
): Promise<void> {
  const user = await reader.findById(userId);
  if (!user) throw new Error('User not found');
  await deleter.delete(userId);
}

// Full implementation satisfies all interfaces
class UserServiceImpl implements UserReader, UserWriter, UserDeleter, UserAuthService {
  async findById(id: string) { /* ... */ return null; }
  async findAll() { return []; }
  async create(data: CreateUserDto) { /* ... */ return {} as User; }
  async update(id: string, data: UpdateUserDto) { return {} as User; }
  async delete(id: string) { /* ... */ }
  async sendVerificationEmail(id: string) { /* ... */ }
  async resetPassword(id: string) { return 'new-token'; }
}

// In tests: mock only the interface you need
const mockReader: UserReader = {
  findById: async () => ({ id: '1', email: 'test@test.com', name: 'Test' } as User),
  findAll: async () => [],
};
// No need to mock delete, resetPassword, uploadAvatar, etc.`
        }
      ],
      useCases: [
        'Reducing mock complexity in tests — only mock the methods the function actually uses',
        'API design — expose role-based API clients (ReadOnlyClient, AdminClient)',
        'React components — small, focused prop interfaces instead of one shared mega-interface',
        'Microservice interfaces — each consumer gets a client interface for just the endpoints it calls',
        'Plugin contracts — plugins implement only the hooks they care about, not a full lifecycle interface'
      ],
      commonPitfalls: [
        'Over-segregation: creating one interface per method defeats the purpose — group by cohesive role',
        'Not composing interfaces back together when a class legitimately implements multiple roles',
        'Applying ISP to internal implementation details — ISP is about public contracts, not private methods',
        'Ignoring TypeScript structural typing: you can pass any compatible object without explicitly implementing the interface'
      ],
      interviewTips: [
        'Testing angle: "With segregated interfaces, my test only needs to mock 2 methods instead of 15"',
        'TypeScript structural typing: "I do not even need an explicit class — any object with the right shape satisfies the interface"',
        'Versus SRP: "SRP is about implementation cohesion; ISP is about consumer-facing contracts"',
        'Real-world: "Node.js Readable, Writable, Duplex, Transform streams are ISP — not one giant Stream interface"'
      ],
      relatedConcepts: ['single-responsibility-principle', 'dependency-inversion-principle', 'adapter', 'decorator'],
      difficulty: 'intermediate',
      tags: ['solid', 'interfaces', 'coupling']
    },
    {
      id: 'dependency-inversion-principle',
      title: 'Dependency Inversion Principle (DIP)',
      description: 'High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions. This is THE principle that enables clean architecture — the domain layer defines interfaces, and the infrastructure layer implements them. Dependencies point inward (toward the domain), never outward (toward frameworks and databases).',
      keyPoints: [
        'Without DIP: business logic imports database code, email SDK, file system — tightly coupled to infrastructure',
        'With DIP: business logic defines interfaces (UserRepository, EmailSender), infrastructure implements them',
        'Dependency direction is inverted: instead of domain depending on database, database depends on domain interfaces',
        'Constructor injection is the simplest DI mechanism: pass dependencies through the constructor',
        'DI containers (InversifyJS, tsyringe) automate wiring but are optional — manual DI works fine for most apps',
        'Service Locator is the anti-pattern alternative: globally accessible registry that hides dependencies',
        'DIP enables testing: inject mock implementations of infrastructure interfaces for fast, isolated unit tests'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'DIP Violation: Direct Infrastructure Dependency',
          code: `// VIOLATION: High-level use case directly depends on low-level infrastructure
import { Pool } from 'pg';                    // Database driver
import * as sgMail from '@sendgrid/mail';      // Email SDK
import Stripe from 'stripe';                    // Payment SDK

class OrderService {
  private db = new Pool({ connectionString: process.env.DATABASE_URL });
  private stripe = new Stripe(process.env.STRIPE_KEY!);

  async placeOrder(userId: string, items: CartItem[]): Promise<Order> {
    // Directly coupled to PostgreSQL
    const user = await this.db.query('SELECT * FROM users WHERE id = $1', [userId]);

    // Directly coupled to Stripe
    const charge = await this.stripe.charges.create({
      amount: calculateTotal(items),
      currency: 'usd',
      customer: user.rows[0].stripe_id,
    });

    // Directly coupled to SendGrid
    await sgMail.send({
      to: user.rows[0].email,
      subject: 'Order Confirmed',
      text: \`Your order has been placed. Charge: \${charge.id}\`,
    });

    // Cannot test without real PostgreSQL, real Stripe, real SendGrid
    return {} as Order;
  }
}`
        },
        {
          language: 'typescript',
          label: 'DIP Applied: Depend on Abstractions',
          code: `// Domain layer defines the abstractions — no infrastructure imports
interface UserRepository {
  findById(id: string): Promise<User | null>;
}

interface PaymentGateway {
  charge(customerId: string, amount: number, currency: string): Promise<{ chargeId: string }>;
}

interface EmailSender {
  send(to: string, subject: string, body: string): Promise<void>;
}

// High-level use case depends ONLY on abstractions
class PlaceOrderUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly payments: PaymentGateway,
    private readonly emails: EmailSender,
  ) {}

  async execute(userId: string, items: CartItem[]): Promise<Order> {
    const user = await this.users.findById(userId);
    if (!user) throw new Error('User not found');

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const { chargeId } = await this.payments.charge(user.paymentCustomerId, total, 'usd');

    const order: Order = {
      id: crypto.randomUUID(),
      userId,
      items,
      total,
      chargeId,
      status: 'confirmed',
      createdAt: new Date(),
    };

    await this.emails.send(user.email, 'Order Confirmed', \`Charge: \${chargeId}\`);
    return order;
  }
}

// Infrastructure layer implements the abstractions
class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}
  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? this.toDomain(result.rows[0]) : null;
  }
  private toDomain(row: any): User { return row as User; }
}

class StripePaymentGateway implements PaymentGateway {
  constructor(private readonly stripe: Stripe) {}
  async charge(customerId: string, amount: number, currency: string) {
    const charge = await this.stripe.charges.create({ amount, currency, customer: customerId });
    return { chargeId: charge.id };
  }
}

// Composition root — wire everything together
const useCase = new PlaceOrderUseCase(
  new PostgresUserRepository(pool),
  new StripePaymentGateway(stripe),
  new SendGridEmailSender(sgMail),
);

// Testing — inject test doubles, no real infrastructure needed
const testUseCase = new PlaceOrderUseCase(
  { findById: async () => ({ id: '1', email: 'a@b.com', paymentCustomerId: 'cus_1' } as User) },
  { charge: async () => ({ chargeId: 'ch_test' }) },
  { send: async () => {} },
);`
        }
      ],
      useCases: [
        'Clean architecture — domain layer has zero infrastructure imports',
        'Testing — swap real implementations with in-memory or mock implementations',
        'Multi-environment — same business logic, different infrastructure per environment (local, staging, production)',
        'Vendor migration — swap Stripe for Adyen by implementing a new PaymentGateway, zero business logic changes',
        'Modular monolith — modules depend on each other through interfaces, not concrete classes'
      ],
      commonPitfalls: [
        'Service Locator antipattern: `Container.get(UserRepository)` hides dependencies — prefer constructor injection',
        'Interface mirroring: if the interface perfectly matches one implementation (IStripeGateway), the abstraction is wrong',
        'Too many abstractions: not every function call needs an interface — abstract at system boundaries, not between private methods',
        'DI container over-reliance: complex container configuration for simple apps — manual DI is fine for small/medium projects'
      ],
      interviewTips: [
        'Draw the dependency arrow: "Without DIP, domain → database. With DIP, domain ← database implements domain interface"',
        'Testing is the killer argument: "I can test the order flow in 50ms with in-memory doubles instead of 5s with a real database"',
        'Composition root: "Wire dependencies at the application entry point — the one place that knows about all concrete types"',
        'Versus DI container: "Constructor injection is DIP. Containers automate the wiring but are not the principle itself."'
      ],
      relatedConcepts: ['clean-architecture-overview', 'repository-pattern', 'adapter', 'factory-method'],
      difficulty: 'intermediate',
      tags: ['solid', 'abstraction', 'dependency-injection', 'clean-architecture']
    },
    {
      id: 'solid-breaks-down',
      title: 'When SOLID Breaks Down',
      description: 'SOLID principles are tools, not laws. Blindly applying them creates over-engineered systems with unnecessary abstractions, interface explosion, and indirection that makes code harder to understand, not easier. Understanding when to violate SOLID is as important as understanding the principles themselves. Functional programming, microservices, rapid prototyping, and small teams each have contexts where SOLID dogmatism hurts more than it helps.',
      keyPoints: [
        'YAGNI vs SOLID: creating an interface for something that will only ever have one implementation is premature abstraction',
        'Functional programming: pure functions with immutable data achieve the same goals without classes or interfaces',
        'Microservices already enforce SRP at the service boundary — applying SRP rigorously within a microservice can over-fragment',
        'Prototyping: in throwaway code, SOLID adds design time without proportional benefit',
        'Small codebases: a 500-line Express app does not need interfaces, repositories, and use case classes',
        'Interface bloat: 15 single-method interfaces with 15 implementations is harder to navigate than one well-structured class',
        'SOLID is about managing complexity — if the code is simple, there is no complexity to manage'
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Over-Engineered SOLID vs Pragmatic Code',
          code: `// OVER-ENGINEERED: SOLID applied dogmatically to a simple operation

interface TemperatureConverter {
  convert(value: number): number;
}
interface TemperatureConverterFactory {
  create(from: string, to: string): TemperatureConverter;
}
class CelsiusToFahrenheit implements TemperatureConverter {
  convert(celsius: number): number { return celsius * 9/5 + 32; }
}
class FahrenheitToCelsius implements TemperatureConverter {
  convert(fahrenheit: number): number { return (fahrenheit - 32) * 5/9; }
}
class ConverterFactory implements TemperatureConverterFactory {
  create(from: string, to: string): TemperatureConverter {
    if (from === 'C' && to === 'F') return new CelsiusToFahrenheit();
    if (from === 'F' && to === 'C') return new FahrenheitToCelsius();
    throw new Error(\`Unsupported: \${from} to \${to}\`);
  }
}
// 30+ lines, 4 types, 3 files... for temperature conversion

// ─────────────────────────────────────────────

// PRAGMATIC: just write the functions
const toFahrenheit = (c: number): number => c * 9/5 + 32;
const toCelsius = (f: number): number => (f - 32) * 5/9;
// 2 lines. Done. If you need a third conversion, add a third function.`
        },
        {
          language: 'typescript',
          label: 'Functional Approach: SOLID Goals Without SOLID Ceremony',
          code: `// Functional programming achieves SOLID's goals differently:

// SRP: pure functions naturally have one responsibility
const validateAge = (age: number): boolean => age >= 0 && age <= 150;
const formatCurrency = (cents: number): string => \`$\${(cents / 100).toFixed(2)}\`;

// OCP: higher-order functions are naturally extensible
const withRetry = <T>(fn: () => Promise<T>, retries: number): (() => Promise<T>) =>
  async () => {
    for (let i = 0; i <= retries; i++) {
      try { return await fn(); } catch (e) { if (i === retries) throw e; }
    }
    throw new Error('Unreachable');
  };

// DIP: functions accept dependencies as parameters — no classes needed
const createUser = async (
  saveUser: (user: User) => Promise<User>,
  sendEmail: (to: string, subject: string) => Promise<void>,
  userData: CreateUserInput,
): Promise<User> => {
  const user = await saveUser({ ...userData, id: crypto.randomUUID(), createdAt: new Date() } as User);
  await sendEmail(user.email, 'Welcome!');
  return user;
};

// ISP: TypeScript Pick<> extracts exactly the interface you need
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;
const displayUser = (user: UserSummary): string => \`\${user.name} <\${user.email}>\`;

// No interfaces, no abstract classes, no factories
// Same separation, same testability, less ceremony`
        }
      ],
      useCases: [
        'Deciding when a codebase is too simple for SOLID abstractions',
        'Choosing functional patterns over OOP patterns for the same guarantees',
        'Evaluating whether an abstraction earns its complexity in a specific context',
        'Code review: pushing back on unnecessary interfaces with "what is the second implementation?"'
      ],
      commonPitfalls: [
        'Using "SOLID breaks down" as an excuse for spaghetti code — the principles still matter, just not dogmatically',
        'Swinging to the other extreme: no abstractions at all, even when the code is genuinely complex',
        'Premature optimization of developer experience: "less code" is not always "better code"',
        'Confusing "small codebase now" with "small codebase forever" — know when to introduce abstractions as complexity grows'
      ],
      interviewTips: [
        'Show maturity: "I apply SOLID principles when they reduce complexity, not when they add it"',
        'Concrete threshold: "I introduce an interface when I have or foresee two concrete implementations — not one"',
        'Context-dependent: "In a microservice with 500 lines, I skip abstractions. In a monolith with 50k lines, I use them heavily."',
        'Functional alternative: "Pure functions with dependency parameters achieve the same goals as SOLID classes with less ceremony"'
      ],
      relatedConcepts: ['single-responsibility-principle', 'open-closed-principle', 'dependency-inversion-principle'],
      difficulty: 'expert',
      tags: ['solid', 'pragmatism', 'trade-offs', 'functional-programming'],
      proTip: 'The mark of a senior engineer is not knowing the SOLID principles — it is knowing when NOT to apply them. Every abstraction has a cost. The question is not "does this follow SOLID?" but "does this abstraction earn its keep in this codebase at this stage?"'
    },
  ],
}
