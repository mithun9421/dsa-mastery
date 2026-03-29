// @ts-nocheck
import type { Category } from '@/lib/types'

export const apiDesignCategory: Category = {
  id: 'api-design',
  title: 'API Design',
  description: 'REST, GraphQL, gRPC, WebSockets, and beyond — designing APIs that are correct, performant, and evolvable at scale.',
  icon: 'Plug',
  concepts: [
    {
      id: 'rest-principles',
      title: 'REST Principles',
      description: 'REST is an architectural style defined by six constraints, not just "use HTTP verbs with JSON." Most "REST APIs" violate at least half the constraints. Understanding the Richardson Maturity Model helps you assess how RESTful an API actually is.',
      keyPoints: [
        'Client-Server: separation of concerns — UI and data storage evolve independently',
        'Stateless: every request contains all information needed — no server-side session state',
        'Cacheable: responses must declare cacheability — reduces load, improves latency',
        'Uniform Interface: resources identified by URIs, manipulation through representations, self-descriptive messages, HATEOAS',
        'Layered System: client cannot tell if connected to end server or intermediary (LB, CDN, proxy)',
        'Code on Demand (optional): server can extend client functionality by transferring executable code (JavaScript)',
        'Richardson Maturity Model: Level 0 (RPC over HTTP), Level 1 (resources), Level 2 (HTTP verbs + status codes), Level 3 (HATEOAS)',
        'Most APIs are Level 2 — Level 3 (HATEOAS) is rare in practice but important to know',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'REST API with Richardson Level 3 (HATEOAS)',
          code: `// Level 2: Resources + HTTP Verbs + Status Codes
// GET /api/orders/123
const level2Response = {
  id: '123',
  userId: 'user-456',
  status: 'pending',
  items: [{ productId: 'prod-1', quantity: 2, price: 29.99 }],
  total: 59.98,
  createdAt: '2024-01-15T10:30:00Z',
}

// Level 3: HATEOAS — includes links to available actions
const level3Response = {
  id: '123',
  userId: 'user-456',
  status: 'pending',
  items: [{ productId: 'prod-1', quantity: 2, price: 29.99 }],
  total: 59.98,
  createdAt: '2024-01-15T10:30:00Z',
  _links: {
    self: { href: '/api/orders/123', method: 'GET' },
    cancel: { href: '/api/orders/123/cancel', method: 'POST' },
    pay: { href: '/api/orders/123/pay', method: 'POST' },
    items: { href: '/api/orders/123/items', method: 'GET' },
    // Links change based on state:
    // If status=shipped, cancel link disappears
    // If status=paid, pay link disappears
  },
}

// Express implementation
import type { Request, Response } from 'express'

async function getOrder(req: Request, res: Response): Promise<void> {
  const order = await orderRepository.findById(req.params.id)

  if (!order) {
    res.status(404).json({
      error: 'Order not found',
      code: 'ORDER_NOT_FOUND',
    })
    return
  }

  // Build HATEOAS links based on current state
  const links: Record<string, { href: string; method: string }> = {
    self: { href: \`/api/orders/\${order.id}\`, method: 'GET' },
  }

  if (order.status === 'pending') {
    links.cancel = { href: \`/api/orders/\${order.id}/cancel\`, method: 'POST' }
    links.pay = { href: \`/api/orders/\${order.id}/pay\`, method: 'POST' }
  }

  if (order.status === 'paid') {
    links.track = { href: \`/api/orders/\${order.id}/tracking\`, method: 'GET' }
  }

  res.status(200).json({ ...order, _links: links })
}`,
        },
      ],
      ascii: `
  Richardson Maturity Model:

  Level 0: The Swamp of POX
  POST /api → { "action": "getOrder", "id": 123 }
  (Everything is a POST to one endpoint)

  Level 1: Resources
  POST /api/orders/123 → { "action": "get" }
  (Individual URIs, but verbs in body)

  Level 2: HTTP Verbs
  GET    /api/orders/123
  POST   /api/orders
  PUT    /api/orders/123
  DELETE /api/orders/123
  (Correct verbs + status codes) ← MOST APIs STOP HERE

  Level 3: HATEOAS
  GET /api/orders/123 → { ..., _links: { pay: {...}, cancel: {...} } }
  (Hypermedia controls — client discovers actions from response)`,
      useCases: [
        'Public APIs: REST Level 2 is the industry standard for external-facing APIs',
        'Internal microservice communication: REST is fine but gRPC may be more efficient',
        'CRUD-heavy applications: REST maps naturally to database operations',
      ],
      commonPitfalls: [
        'Using POST for everything: this is RPC over HTTP, not REST',
        'Verbs in URLs: POST /api/createOrder instead of POST /api/orders',
        'Not using status codes: returning 200 with { "error": "not found" } instead of 404',
        'Claiming your API is RESTful when it is Level 0 or 1 — most APIs are Level 2 at best',
      ],
      interviewTips: [
        'Name all six constraints — most candidates can only name 2-3',
        'Mention the Richardson Maturity Model and where most APIs fall (Level 2)',
        'Discuss HATEOAS as a concept even if you note it is rarely implemented in practice',
      ],
      relatedConcepts: ['rest-best-practices', 'graphql', 'grpc', 'api-versioning'],
      difficulty: 'intermediate',
      tags: ['api', 'rest', 'architecture'],
      proTip: 'GitHub API v3 is one of the best real-world REST API examples — it follows Level 2 closely and includes HATEOAS-style link headers. Study it for naming conventions, pagination, error format, and rate limiting headers.',
    },
    {
      id: 'rest-best-practices',
      title: 'REST Best Practices',
      description: 'Production REST API design goes beyond knowing the verbs. Resource naming, idempotency, error handling, and status code semantics determine whether your API is a joy or a nightmare to integrate with.',
      keyPoints: [
        'Resource naming: plural nouns (/users, /orders), hierarchical (/users/123/orders), no verbs in URL',
        'HTTP verb semantics: GET (read, cacheable), POST (create, not idempotent), PUT (full replace, idempotent), PATCH (partial update), DELETE (remove, idempotent)',
        'Idempotency: GET, PUT, DELETE are idempotent by definition — POST is not (use Idempotency-Key header for safety)',
        'Status codes: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 409 (Conflict), 422 (Unprocessable), 429 (Too Many), 500 (Server Error)',
        'Never return 200 for errors: "200 OK { error: true }" is an antipattern — use proper status codes',
        'Error response format: consistent error body with code, message, and optional details/validation errors',
        'Content negotiation: Accept header for response format, Content-Type for request body',
        'ETag/If-None-Match: conditional requests for caching and optimistic concurrency control',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Production REST API Design',
          code: `import express from 'express'
import type { Request, Response } from 'express'

const app = express()

// Consistent error response format
interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

function errorResponse(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: Record<string, string[]>
): void {
  const body: ApiError = { code, message }
  if (details) body.details = details
  res.status(status).json(body)
}

// GET /api/users/:id — Read (cacheable)
app.get('/api/users/:id', async (req: Request, res: Response) => {
  const user = await userRepository.findById(req.params.id)

  if (!user) {
    return errorResponse(res, 404, 'USER_NOT_FOUND', 'User not found')
  }

  // ETag for conditional requests
  const etag = \`"\${user.updatedAt.getTime()}"\`
  res.set('ETag', etag)

  if (req.headers['if-none-match'] === etag) {
    res.status(304).end() // Not Modified — use cached version
    return
  }

  res.status(200).json(user)
})

// POST /api/users — Create (not idempotent without Idempotency-Key)
app.post('/api/users', async (req: Request, res: Response) => {
  // Idempotency key for safe retries
  const idempotencyKey = req.headers['idempotency-key'] as string
  if (idempotencyKey) {
    const existing = await idempotencyStore.get(idempotencyKey)
    if (existing) {
      res.status(200).json(existing) // Return cached response
      return
    }
  }

  const validation = userSchema.safeParse(req.body)
  if (!validation.success) {
    return errorResponse(res, 422, 'VALIDATION_ERROR', 'Invalid input', {
      email: ['Must be a valid email'],
      age: ['Must be between 0 and 150'],
    })
  }

  const user = await userRepository.create(validation.data)

  if (idempotencyKey) {
    await idempotencyStore.set(idempotencyKey, user, 86400) // Cache for 24h
  }

  res.status(201)
    .set('Location', \`/api/users/\${user.id}\`)
    .json(user)
})

// PUT /api/users/:id — Full replace (idempotent)
app.put('/api/users/:id', async (req: Request, res: Response) => {
  // Optimistic concurrency with If-Match
  const ifMatch = req.headers['if-match'] as string
  const existing = await userRepository.findById(req.params.id)

  if (!existing) {
    return errorResponse(res, 404, 'USER_NOT_FOUND', 'User not found')
  }

  if (ifMatch && ifMatch !== \`"\${existing.updatedAt.getTime()}"\`) {
    return errorResponse(res, 409, 'CONFLICT', 'Resource has been modified')
  }

  const updated = await userRepository.replace(req.params.id, req.body)
  res.status(200).json(updated)
})

// DELETE /api/users/:id — Remove (idempotent)
app.delete('/api/users/:id', async (req: Request, res: Response) => {
  await userRepository.delete(req.params.id)
  res.status(204).end() // No content — success even if already deleted
})`,
        },
      ],
      useCases: [
        'Public-facing APIs: consistency and predictability are critical for third-party developers',
        'Mobile app backends: proper status codes drive UI behavior (show login on 401, show error on 500)',
        'Microservice APIs: internal APIs benefit from the same discipline — especially error format consistency',
      ],
      commonPitfalls: [
        '200 for everything: clients cannot distinguish success from failure without parsing the body',
        'PUT for partial updates: PUT means full replacement — use PATCH for partial updates',
        'POST without Location header: clients cannot find the created resource without it',
        'Inconsistent error format: different endpoints returning errors in different shapes',
        'Not supporting Idempotency-Key: retries create duplicate resources',
      ],
      interviewTips: [
        'Know which verbs are idempotent (GET, PUT, DELETE) and which are not (POST, PATCH)',
        'Discuss the Idempotency-Key header pattern — shows you think about real-world reliability',
        'Mention ETag/If-Match for optimistic concurrency — it is the REST alternative to database locks',
      ],
      relatedConcepts: ['rest-principles', 'api-versioning', 'api-security', 'pagination'],
      difficulty: 'intermediate',
      tags: ['api', 'rest', 'best-practices'],
      proTip: 'Stripe\'s API is the gold standard for REST API design. Study their idempotency keys, expanding responses, list pagination, and error codes. Every design decision they made was battle-tested by millions of API integrations.',
    },
    {
      id: 'graphql',
      title: 'GraphQL',
      description: 'GraphQL lets clients request exactly the data they need in a single request. It solves REST\'s over-fetching and under-fetching problems but introduces its own challenges: N+1 queries, schema complexity, and caching difficulty.',
      keyPoints: [
        'Type system/schema: strongly typed schema defines all available data — serves as API documentation and contract',
        'Query: read data with exact field selection — no over-fetching',
        'Mutation: write data with typed input and return types',
        'Subscription: real-time data via WebSocket — server pushes updates when data changes',
        'N+1 problem: nested resolvers trigger individual DB queries per item — DataLoader batches them',
        'DataLoader: batches and caches DB lookups within a single request — essential for performance',
        'Persisted queries: pre-register queries by hash — prevents arbitrary query execution, reduces payload size',
        'Schema federation (Apollo): split schema across microservices, compose into a single graph — supergraph pattern',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'GraphQL with DataLoader for N+1 Prevention',
          code: `import { ApolloServer } from '@apollo/server'
import DataLoader from 'dataloader'

// Schema
const typeDefs = \`
  type User {
    id: ID!
    name: String!
    email: String!
    orders: [Order!]!
    orderCount: Int!
  }

  type Order {
    id: ID!
    total: Float!
    status: OrderStatus!
    items: [OrderItem!]!
    user: User!
  }

  type OrderItem {
    productId: String!
    name: String!
    quantity: Int!
    price: Float!
  }

  enum OrderStatus {
    PENDING
    PAID
    SHIPPED
    DELIVERED
  }

  type Query {
    user(id: ID!): User
    orders(userId: ID!, first: Int = 10, after: String): OrderConnection!
  }

  type OrderConnection {
    edges: [OrderEdge!]!
    pageInfo: PageInfo!
  }

  type OrderEdge {
    cursor: String!
    node: Order!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
  }

  input CreateOrderInput {
    userId: ID!
    items: [OrderItemInput!]!
  }

  input OrderItemInput {
    productId: String!
    quantity: Int!
  }
\`

// DataLoaders — batch DB queries to prevent N+1
function createLoaders() {
  return {
    userLoader: new DataLoader<string, User>(async (ids) => {
      // ONE query for all users instead of N queries
      const users = await db.query(
        'SELECT * FROM users WHERE id = ANY($1)',
        [ids]
      )
      const userMap = new Map(users.rows.map((u) => [u.id, u]))
      return ids.map((id) => userMap.get(id) ?? new Error(\`User \${id} not found\`))
    }),

    ordersByUserLoader: new DataLoader<string, Order[]>(async (userIds) => {
      const orders = await db.query(
        'SELECT * FROM orders WHERE user_id = ANY($1) ORDER BY created_at DESC',
        [userIds]
      )
      const grouped = new Map<string, Order[]>()
      for (const order of orders.rows) {
        const existing = grouped.get(order.user_id) ?? []
        existing.push(order)
        grouped.set(order.user_id, existing)
      }
      return userIds.map((id) => grouped.get(id) ?? [])
    }),
  }
}

// Resolvers
const resolvers = {
  Query: {
    user: (_: unknown, { id }: { id: string }, ctx: Context) =>
      ctx.loaders.userLoader.load(id),
  },
  User: {
    orders: (parent: User, _: unknown, ctx: Context) =>
      ctx.loaders.ordersByUserLoader.load(parent.id),
    orderCount: async (parent: User, _: unknown, ctx: Context) => {
      const orders = await ctx.loaders.ordersByUserLoader.load(parent.id)
      return orders.length
    },
  },
  Order: {
    user: (parent: Order, _: unknown, ctx: Context) =>
      ctx.loaders.userLoader.load(parent.userId),
  },
}`,
        },
      ],
      useCases: [
        'Mobile apps: request exactly the fields needed — save bandwidth and reduce payload size',
        'Dashboard UIs: one query fetches data from multiple related entities (users, orders, metrics)',
        'Microservice composition: Apollo Federation composes multiple service schemas into one graph',
        'Rapid prototyping: frontend team can build UI without waiting for backend to add endpoints',
      ],
      commonPitfalls: [
        'Not using DataLoader: N+1 queries in GraphQL are the #1 performance issue — every nested resolver fires a query',
        'Allowing unbounded depth: deeply nested queries can DDoS your server — use query depth limiting',
        'No query complexity analysis: a single query can request millions of records — use cost analysis middleware',
        'Caching difficulty: unlike REST (URL-based caching), GraphQL queries are POST bodies — need response-level or field-level caching',
        'Over-engineering: if your API is simple CRUD with few clients, REST is simpler and sufficient',
      ],
      interviewTips: [
        'Explain the N+1 problem and DataLoader as the solution — this is the most important GraphQL concept',
        'Discuss when NOT to use GraphQL: simple APIs, few clients, heavy caching needs',
        'Mention Apollo Federation for microservice architectures — it is the standard GraphQL scaling pattern',
      ],
      relatedConcepts: ['rest-principles', 'grpc', 'api-gateway'],
      difficulty: 'intermediate',
      tags: ['api', 'graphql', 'frontend'],
      proTip: 'Persisted queries + automatic persisted queries (APQ) solve both security and performance: clients send a hash instead of the full query string. The server looks up the query by hash. This prevents arbitrary query injection and reduces payload size by 90%+. Apollo Client supports APQ out of the box.',
    },
    {
      id: 'grpc',
      title: 'gRPC',
      description: 'gRPC is a high-performance RPC framework using Protocol Buffers for serialization and HTTP/2 for transport. It is 5-10x faster than REST+JSON for microservice communication and supports four streaming modes.',
      keyPoints: [
        'Protocol Buffers (protobuf): strongly typed, binary serialization — 3-10x smaller than JSON, 20-100x faster parsing',
        'HTTP/2 multiplexing: multiple RPCs over a single TCP connection — no head-of-line blocking',
        'Four streaming modes: unary (request/response), server streaming, client streaming, bidirectional streaming',
        'Interceptors: middleware for gRPC — logging, auth, metrics, tracing (like Express middleware)',
        'Deadlines and cancellation: built-in timeout propagation across services — prevents cascading waits',
        'Code generation: .proto file generates client and server stubs in any language — type-safe by construction',
        'gRPC-Web: browser support via a proxy (Envoy) — not all features supported in browser',
        'vs REST: gRPC for internal service-to-service; REST for external-facing APIs (better tooling, browser support)',
      ],
      codeExamples: [
        {
          language: 'protobuf',
          label: 'gRPC Service Definition',
          code: `syntax = "proto3";

package orders;

service OrderService {
  // Unary: simple request/response
  rpc GetOrder(GetOrderRequest) returns (Order);

  // Server streaming: stream order updates
  rpc WatchOrder(WatchOrderRequest) returns (stream OrderUpdate);

  // Client streaming: batch create items
  rpc BatchCreateItems(stream CreateItemRequest) returns (BatchCreateResponse);

  // Bidirectional streaming: real-time chat
  rpc LiveOrderUpdates(stream OrderAction) returns (stream OrderUpdate);
}

message GetOrderRequest {
  string order_id = 1;
}

message Order {
  string id = 1;
  string user_id = 2;
  OrderStatus status = 3;
  repeated OrderItem items = 4;
  double total = 5;
  google.protobuf.Timestamp created_at = 6;
}

enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_PAID = 2;
  ORDER_STATUS_SHIPPED = 3;
}

message OrderItem {
  string product_id = 1;
  string name = 2;
  int32 quantity = 3;
  double price = 4;
}`,
        },
        {
          language: 'typescript',
          label: 'gRPC Client with Deadline',
          code: `import * as grpc from '@grpc/grpc-js'
import { OrderServiceClient } from './generated/orders_grpc_pb'
import { GetOrderRequest } from './generated/orders_pb'

const client = new OrderServiceClient(
  'order-service:50051',
  grpc.credentials.createInsecure()
)

async function getOrder(orderId: string): Promise<Order> {
  return new Promise((resolve, reject) => {
    const request = new GetOrderRequest()
    request.setOrderId(orderId)

    // Deadline: fail fast after 5 seconds
    const deadline = new Date()
    deadline.setSeconds(deadline.getSeconds() + 5)

    const metadata = new grpc.Metadata()
    metadata.set('authorization', \`Bearer \${token}\`)

    client.getOrder(
      request,
      metadata,
      { deadline },
      (error, response) => {
        if (error) {
          if (error.code === grpc.status.DEADLINE_EXCEEDED) {
            reject(new Error('Order service timed out'))
          } else {
            reject(error)
          }
          return
        }
        resolve(response!.toObject())
      }
    )
  })
}`,
        },
      ],
      useCases: [
        'Microservice communication: 5-10x faster than REST+JSON, type-safe contracts',
        'Real-time systems: bidirectional streaming for live data (stock prices, game state)',
        'Polyglot systems: generate clients for any language from one .proto file',
        'Mobile backends: smaller payloads save bandwidth on cellular networks',
      ],
      commonPitfalls: [
        'Using gRPC for external APIs: poor browser support, no curl debugging — use REST externally',
        'Not setting deadlines: without deadlines, a slow downstream service hangs your entire request chain',
        'Breaking proto backward compatibility: removing or reordering fields breaks existing clients — use field deprecation',
        'Not using streaming when appropriate: polling a unary endpoint when server streaming is natural',
      ],
      interviewTips: [
        'Explain HTTP/2 multiplexing as the performance advantage over REST/HTTP/1.1',
        'Name all 4 streaming modes and give a use case for each',
        'Discuss the gRPC vs REST decision: gRPC for internal, REST for external',
        'Mention deadline propagation as a built-in resilience feature',
      ],
      relatedConcepts: ['rest-principles', 'websockets', 'api-gateway'],
      difficulty: 'intermediate',
      tags: ['api', 'grpc', 'microservices', 'performance'],
      proTip: 'gRPC reflection allows tools to inspect your service at runtime without the .proto file. Enable it in development for debugging with tools like grpcurl and Postman. In production, combine gRPC with a service mesh (Istio) for automatic mTLS, load balancing, and circuit breaking.',
    },
    {
      id: 'websockets',
      title: 'WebSockets',
      description: 'WebSockets provide full-duplex, persistent communication over a single TCP connection. They are essential for real-time features but introduce complexity around scaling, reconnection, and state management that HTTP does not have.',
      keyPoints: [
        'Full-duplex: both client and server can send messages at any time — unlike HTTP request/response',
        'Persistent connection: single TCP connection stays open — no overhead of repeated handshakes',
        'Heartbeat/ping-pong: keep-alive mechanism to detect dead connections — both sides must implement',
        'Reconnection logic: exponential backoff with jitter — clients must handle disconnection gracefully',
        'Scaling challenge: sticky sessions or pub/sub fanout — WebSocket connections are stateful',
        'Scaling with pub/sub: each server subscribes to Redis Pub/Sub — messages fan out to all connected clients',
        'Socket.io vs raw WS: Socket.io adds automatic reconnection, room/namespace support, fallback to polling — heavier but more convenient',
        'Message framing: WebSocket has built-in message framing — no need to delimiter-parse like raw TCP',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Scalable WebSocket Server with Redis Pub/Sub',
          code: `import { WebSocketServer, WebSocket } from 'ws'
import Redis from 'ioredis'
import http from 'http'

const server = http.createServer()
const wss = new WebSocketServer({ server })

// Redis for cross-server message distribution
const redisSub = new Redis(process.env.REDIS_URL!)
const redisPub = new Redis(process.env.REDIS_URL!)

// Track connections by room
const rooms = new Map<string, Set<WebSocket>>()

// Handle new WebSocket connections
wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
  const userId = authenticateFromHeaders(req.headers)

  // Heartbeat — detect dead connections
  let isAlive = true
  ws.on('pong', () => { isAlive = true })

  const heartbeatInterval = setInterval(() => {
    if (!isAlive) {
      ws.terminate()
      return
    }
    isAlive = false
    ws.ping()
  }, 30000)

  ws.on('message', async (raw: Buffer) => {
    const message = JSON.parse(raw.toString())

    switch (message.type) {
      case 'join':
        joinRoom(message.room, ws)
        break
      case 'leave':
        leaveRoom(message.room, ws)
        break
      case 'broadcast':
        // Publish to Redis — all servers receive and broadcast to their clients
        await redisPub.publish(
          \`room:\${message.room}\`,
          JSON.stringify({
            from: userId,
            data: message.data,
            timestamp: Date.now(),
          })
        )
        break
    }
  })

  ws.on('close', () => {
    clearInterval(heartbeatInterval)
    removeFromAllRooms(ws)
  })
})

// Subscribe to Redis for cross-server broadcasting
redisSub.psubscribe('room:*')
redisSub.on('pmessage', (_pattern: string, channel: string, message: string) => {
  const room = channel.replace('room:', '')
  const clients = rooms.get(room)
  if (!clients) return

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  }
})

function joinRoom(room: string, ws: WebSocket): void {
  const clients = rooms.get(room) ?? new Set()
  clients.add(ws)
  rooms.set(room, clients)
}

function leaveRoom(room: string, ws: WebSocket): void {
  rooms.get(room)?.delete(ws)
}

function removeFromAllRooms(ws: WebSocket): void {
  for (const [, clients] of rooms) {
    clients.delete(ws)
  }
}

server.listen(8080)`,
        },
      ],
      ascii: `
  Scaling WebSockets with Redis Pub/Sub:

  Client A ──→ ┌──────────┐           ┌──────────┐ ←── Client C
  Client B ──→ │ Server 1 │──Redis──→ │ Server 2 │ ←── Client D
               └──────────┘  Pub/Sub  └──────────┘

  1. Client A sends message to room "chat-123"
  2. Server 1 publishes to Redis channel "room:chat-123"
  3. Server 2 receives from Redis subscription
  4. Server 2 broadcasts to Client C and D (in same room)

  Without Redis: Clients C and D never receive the message
  because they are on a different server.`,
      useCases: [
        'Chat applications: real-time message delivery between users',
        'Live dashboards: push metric updates to connected dashboards',
        'Collaborative editing: real-time document synchronization (Google Docs)',
        'Gaming: real-time game state synchronization between players',
        'Financial: live stock price tickers, order book updates',
      ],
      commonPitfalls: [
        'Not implementing heartbeat: dead connections leak memory and file descriptors',
        'Not handling reconnection: network blips disconnect clients — exponential backoff with jitter is essential',
        'Sticky sessions without pub/sub: only clients connected to the same server can communicate',
        'Not authenticating the initial handshake: WebSocket connections can be hijacked without auth',
        'Blocking the event loop: heavy processing in message handlers blocks ALL connections on that server',
      ],
      interviewTips: [
        'Discuss the scaling challenge: stateful connections require sticky sessions or pub/sub fanout',
        'Mention Redis Pub/Sub or Kafka for cross-server message distribution',
        'Compare with SSE: WebSocket is bidirectional, SSE is server-to-client only but simpler',
      ],
      relatedConcepts: ['server-sent-events', 'grpc', 'api-gateway'],
      difficulty: 'intermediate',
      tags: ['api', 'real-time', 'networking'],
      proTip: 'Socket.io is the pragmatic choice for most applications — it handles reconnection, room management, and transparent fallback to long-polling. Raw WebSocket is better for high-performance use cases where you need minimal overhead (game servers, financial data). Bun.serve() WebSocket is the fastest Node-compatible WebSocket server available.',
    },
    {
      id: 'server-sent-events',
      title: 'Server-Sent Events (SSE)',
      description: 'SSE provides a simple, one-way server-to-client push mechanism over HTTP. It is dramatically simpler than WebSockets for use cases that only need server push, with built-in reconnection and the same caching/compression as HTTP.',
      keyPoints: [
        'One-way: server pushes to client only — client uses regular HTTP for sending data back',
        'Built-in reconnection: browser EventSource API reconnects automatically with Last-Event-ID header',
        'Simpler than WebSocket: uses regular HTTP, works through proxies and CDNs, no special protocol',
        'EventSource API: native browser API — no library needed',
        'Text-based: messages are UTF-8 text — no binary support (use WebSocket for binary)',
        'Automatic compression: works with standard HTTP gzip/brotli compression',
        'Connection limit: browsers limit to 6 HTTP connections per domain — SSE uses one of them',
        'HTTP/2 solves the connection limit: multiplexed connections share one TCP connection',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'SSE Server and Client',
          code: `// Server — Express SSE endpoint
import type { Request, Response } from 'express'

app.get('/api/events/:userId', (req: Request, res: Response) => {
  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable Nginx buffering
  })

  // Reconnection — check Last-Event-ID
  const lastEventId = req.headers['last-event-id']
  if (lastEventId) {
    // Send missed events since lastEventId
    replayEventsSince(lastEventId, res)
  }

  // Send events
  function sendEvent(event: string, data: unknown, id?: string): void {
    if (id) res.write(\`id: \${id}\\n\`)
    res.write(\`event: \${event}\\n\`)
    res.write(\`data: \${JSON.stringify(data)}\\n\\n\`)
  }

  // Set retry interval (ms) for client reconnection
  res.write('retry: 5000\\n\\n')

  // Keep alive — prevent proxy/LB timeout
  const keepAlive = setInterval(() => {
    res.write(': keepalive\\n\\n') // Comment line — ignored by client
  }, 15000)

  // Subscribe to user events
  const unsubscribe = eventBus.subscribe(
    \`user:\${req.params.userId}\`,
    (event) => {
      sendEvent(event.type, event.data, event.id)
    }
  )

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(keepAlive)
    unsubscribe()
  })
})

// Client — Browser EventSource API
// const eventSource = new EventSource('/api/events/user-123')
//
// eventSource.addEventListener('order.updated', (event) => {
//   const data = JSON.parse(event.data)
//   updateOrderUI(data)
// })
//
// eventSource.addEventListener('notification', (event) => {
//   const data = JSON.parse(event.data)
//   showNotification(data.message)
// })
//
// eventSource.onerror = () => {
//   // Browser automatically reconnects with Last-Event-ID
//   console.log('SSE connection lost, reconnecting...')
// }`,
        },
      ],
      useCases: [
        'Live notifications: push notifications to connected users without polling',
        'Progress updates: long-running task progress (file upload, data processing)',
        'Live feeds: news feeds, social media timelines, stock tickers',
        'AI streaming: LLM token-by-token streaming (ChatGPT-style responses)',
      ],
      commonPitfalls: [
        'Using SSE when you need bidirectional communication: use WebSocket instead',
        'Not disabling Nginx/proxy buffering: X-Accel-Buffering: no is required for Nginx',
        'Not sending keepalive comments: load balancers close idle connections after 60-120 seconds',
        'Ignoring the 6-connection limit on HTTP/1.1: SSE uses a persistent connection per endpoint',
      ],
      interviewTips: [
        'Compare SSE vs WebSocket: SSE is simpler for server-push-only use cases',
        'Mention built-in reconnection as a major advantage over WebSocket (which requires manual reconnection)',
        'Note that ChatGPT uses SSE for streaming responses — a very relevant modern use case',
      ],
      relatedConcepts: ['websockets', 'rest-principles', 'api-gateway'],
      difficulty: 'beginner',
      tags: ['api', 'real-time', 'streaming'],
      proTip: 'The OpenAI API uses SSE for streaming completions (stream: true). The response is a text/event-stream with data: JSON chunks. This is why SSE has seen a massive resurgence — it is the standard for LLM token streaming because it is simpler than WebSocket and works through any HTTP infrastructure.',
    },
    {
      id: 'api-versioning',
      title: 'API Versioning',
      description: 'API versioning is how you evolve your API without breaking existing clients. The strategy you choose (URI, header, content negotiation) affects routing complexity, caching behavior, and developer experience.',
      keyPoints: [
        'URI versioning: /api/v1/users — most common, easiest to understand, cached naturally by CDNs',
        'Header versioning: X-API-Version: 2 or Api-Version: 2 — cleaner URLs but harder to test in browser',
        'Content negotiation: Accept: application/vnd.myapi.v2+json — most RESTful but most complex',
        'Semantic versioning for breaking changes: major version = breaking change, minor = additive, patch = fix',
        'What is a breaking change: removing fields, changing types, renaming fields, changing semantics',
        'What is NOT breaking: adding optional fields, adding new endpoints, adding new enum values (with care)',
        'Sunset header: Sunset: Sat, 01 Jan 2025 00:00:00 GMT — tells clients when a version will be deprecated',
        'Support multiple versions simultaneously: typically support N-1 and N, deprecate N-2',
      ],
      useCases: [
        'Public APIs: clients cannot be forced to upgrade immediately — must maintain backward compatibility',
        'Mobile apps: old app versions in the wild cannot be updated — API must support them',
        'Internal APIs: less strict — can coordinate upgrades, but still benefit from versioning',
      ],
      commonPitfalls: [
        'Not versioning at all: first breaking change breaks all clients simultaneously',
        'Too many versions: maintaining 5+ versions is expensive — deprecate aggressively',
        'Version in body: { "version": 2, ... } — cannot be routed at the gateway level',
        'Breaking changes without version bump: clients suddenly get different data shapes',
      ],
      interviewTips: [
        'URI versioning is the most pragmatic answer — mention it first, then discuss alternatives',
        'Define what constitutes a breaking change — removing/renaming fields, changing types',
        'Mention the Sunset header for graceful deprecation',
      ],
      relatedConcepts: ['rest-best-practices', 'api-gateway', 'graphql'],
      difficulty: 'beginner',
      tags: ['api', 'versioning', 'best-practices'],
      proTip: 'Stripe versions by date (2024-01-15) rather than incrementing numbers. Each API key is pinned to a version, and Stripe maintains years of backward compatibility. This approach removes the "when do we bump to v3?" debate and makes each change independently addressable.',
    },
    {
      id: 'api-gateway',
      title: 'API Gateway',
      description: 'An API gateway is the single entry point for all client requests. It handles cross-cutting concerns (auth, rate limiting, routing) so individual services do not have to. The choice between API gateway and service mesh determines where these concerns live.',
      keyPoints: [
        'Authentication/authorization: validate tokens, API keys, mTLS at the gateway — services trust the gateway',
        'Rate limiting: enforce per-client or per-API-key limits before requests reach backend services',
        'Request routing: route /api/users to user-service, /api/orders to order-service',
        'Request/response transformation: add/remove headers, transform payloads, aggregate responses',
        'Service mesh vs API gateway: gateway handles north-south traffic (external → internal), mesh handles east-west (service → service)',
        'Popular gateways: Kong (Lua/OpenResty), AWS API Gateway (managed), Envoy (data plane), NGINX, Traefik',
        'BFF pattern (Backend For Frontend): one gateway per client type (web, mobile, IoT) with tailored response shapes',
        'Circuit breaking at gateway: reject requests to failing services before they pile up',
      ],
      codeExamples: [
        {
          language: 'yaml',
          label: 'Kong API Gateway Configuration',
          code: `# Kong declarative config
_format_version: "3.0"

services:
  - name: user-service
    url: http://user-service:3001
    routes:
      - name: user-routes
        paths:
          - /api/users
        strip_path: false

  - name: order-service
    url: http://order-service:3002
    routes:
      - name: order-routes
        paths:
          - /api/orders
        strip_path: false

plugins:
  # Global rate limiting
  - name: rate-limiting
    config:
      minute: 100
      policy: redis
      redis_host: redis
      redis_port: 6379

  # JWT authentication
  - name: jwt
    config:
      claims_to_verify:
        - exp

  # Request size limiting
  - name: request-size-limiting
    config:
      allowed_payload_size: 10  # MB

  # CORS
  - name: cors
    config:
      origins:
        - "https://app.example.com"
      methods:
        - GET
        - POST
        - PUT
        - DELETE
      headers:
        - Authorization
        - Content-Type
      max_age: 3600

  # Prometheus metrics
  - name: prometheus`,
        },
      ],
      ascii: `
  Clients (Web, Mobile, IoT)
         │
         ▼
  ┌──────────────────┐
  │   API Gateway    │
  │                  │
  │  • Auth (JWT)    │
  │  • Rate Limit    │
  │  • Routing       │
  │  • CORS          │
  │  • Logging       │
  │  • Circuit Break │
  └────────┬─────────┘
           │
     ┌─────┼──────┬──────────┐
     ▼     ▼      ▼          ▼
  ┌─────┐┌─────┐┌─────┐ ┌─────┐
  │User ││Order││Pay  │ │Notif│
  │ Svc ││ Svc ││ Svc │ │ Svc │
  └─────┘└─────┘└─────┘ └─────┘

  North-South: Gateway handles (client ↔ services)
  East-West: Service mesh handles (service ↔ service)`,
      useCases: [
        'Microservice architectures: single entry point for all external traffic',
        'Multi-tenant SaaS: per-tenant rate limiting and authentication at the gateway',
        'BFF: mobile gateway returns compact responses, web gateway returns richer data',
        'API monetization: track usage per API key for billing',
      ],
      commonPitfalls: [
        'Gateway as a monolith: putting business logic in the gateway defeats the purpose',
        'Single point of failure: gateway must be highly available — run multiple instances behind a load balancer',
        'Too many transformations: complex payload transformations at the gateway become hard to debug',
        'Not caching at the gateway: missed opportunity — cache common responses for GET requests',
      ],
      interviewTips: [
        'List the cross-cutting concerns a gateway handles: auth, rate limiting, routing, CORS, logging',
        'Distinguish API gateway from service mesh — gateway for external, mesh for internal',
        'Mention the BFF pattern as an advanced gateway strategy',
      ],
      relatedConcepts: ['rate-limiting', 'api-security', 'rest-best-practices', 'api-versioning'],
      difficulty: 'intermediate',
      tags: ['api', 'infrastructure', 'microservices'],
      proTip: 'AWS API Gateway + Lambda is the simplest gateway for serverless architectures — zero infrastructure to manage. For Kubernetes, use Envoy-based gateways (Istio ingress, Emissary/Ambassador) because they integrate with the service mesh for unified observability. Kong is the best choice for platform-agnostic deployments.',
    },
    {
      id: 'pagination',
      title: 'Pagination',
      description: 'Pagination is how you return large datasets in manageable chunks. The choice between offset and cursor pagination determines performance at scale, consistency during mutations, and API complexity.',
      keyPoints: [
        'Offset pagination: LIMIT 20 OFFSET 40 — simple, supports "jump to page 5", but slow on large tables (DB must skip N rows)',
        'Cursor-based pagination: WHERE id > :last_id LIMIT 20 — fast regardless of position, consistent during mutations',
        'Keyset pagination: cursor-based using indexed columns — O(log n) regardless of offset position',
        'Opaque cursor: base64-encode the cursor value — clients cannot manipulate it, you can change the encoding later',
        'Total count problem: SELECT COUNT(*) on large tables is slow — consider approximate counts or omit total',
        'Relay-style pagination: edges + pageInfo + cursors — standard for GraphQL, adopted by many REST APIs',
        'Forward and backward: cursor + first (forward) or cursor + last (backward) — support both for UI flexibility',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Cursor-Based Pagination',
          code: `import { Pool } from 'pg'

const db = new Pool({ connectionString: process.env.DATABASE_URL })

interface PaginationParams {
  first?: number    // Forward: return first N after cursor
  after?: string    // Forward cursor
  last?: number     // Backward: return last N before cursor
  before?: string   // Backward cursor
}

interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string | null
  endCursor: string | null
}

interface Connection<T> {
  edges: Array<{ cursor: string; node: T }>
  pageInfo: PageInfo
  totalCount?: number  // Optional — expensive on large tables
}

// Cursor encoding: base64(JSON({ id, createdAt }))
function encodeCursor(id: string, createdAt: Date): string {
  return Buffer.from(
    JSON.stringify({ id, createdAt: createdAt.toISOString() })
  ).toString('base64url')
}

function decodeCursor(cursor: string): { id: string; createdAt: string } {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString())
}

async function paginateOrders(
  userId: string,
  params: PaginationParams
): Promise<Connection<Order>> {
  const limit = params.first ?? params.last ?? 20
  const isForward = !params.last

  let query = 'SELECT * FROM orders WHERE user_id = $1'
  const queryParams: unknown[] = [userId]
  let paramIndex = 2

  if (params.after) {
    const cursor = decodeCursor(params.after)
    query += \` AND (created_at, id) < ($\${paramIndex}, $\${paramIndex + 1})\`
    queryParams.push(cursor.createdAt, cursor.id)
    paramIndex += 2
  }

  if (params.before) {
    const cursor = decodeCursor(params.before)
    query += \` AND (created_at, id) > ($\${paramIndex}, $\${paramIndex + 1})\`
    queryParams.push(cursor.createdAt, cursor.id)
    paramIndex += 2
  }

  // Fetch one extra to check if there are more
  query += \` ORDER BY created_at \${isForward ? 'DESC' : 'ASC'}, id \${isForward ? 'DESC' : 'ASC'}\`
  query += \` LIMIT $\${paramIndex}\`
  queryParams.push(limit + 1)

  const result = await db.query(query, queryParams)
  let rows = result.rows

  const hasMore = rows.length > limit
  if (hasMore) rows = rows.slice(0, limit)
  if (!isForward) rows.reverse()

  const edges = rows.map((row) => ({
    cursor: encodeCursor(row.id, row.created_at),
    node: row,
  }))

  return {
    edges,
    pageInfo: {
      hasNextPage: isForward ? hasMore : !!params.before,
      hasPreviousPage: isForward ? !!params.after : hasMore,
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges[edges.length - 1]?.cursor ?? null,
    },
  }
}`,
        },
      ],
      useCases: [
        'Offset: admin dashboards where "jump to page N" is required and dataset is moderate',
        'Cursor: infinite scroll feeds, real-time data, any endpoint that might paginate millions of rows',
        'Keyset: time-series queries, audit logs, any table with a natural ordering column + index',
      ],
      commonPitfalls: [
        'Offset on large tables: OFFSET 1000000 still reads and discards 1M rows — O(n) performance',
        'Offset with concurrent mutations: inserting/deleting rows between pages causes items to be skipped or duplicated',
        'Exposing raw IDs as cursors: clients hardcode cursor format and break when you change it — use opaque cursors',
        'Computing COUNT(*) on every request: slow on large tables — use estimated counts or cache the total',
      ],
      interviewTips: [
        'Explain why offset is O(n) and cursor is O(log n) with the right index',
        'Discuss the consistency problem: offset pagination during mutations causes skipped/duplicated items',
        'Mention the "fetch N+1" trick to determine hasNextPage without a separate count query',
      ],
      relatedConcepts: ['rest-best-practices', 'graphql', 'database-indexing'],
      difficulty: 'intermediate',
      tags: ['api', 'performance', 'databases'],
      proTip: 'For the total count problem on PostgreSQL: use pg_class.reltuples for an approximate count (updated by ANALYZE, off by <1%). For exact counts on filtered queries, maintain a counter in a separate table updated via triggers or application logic. Never do SELECT COUNT(*) on every paginated request.',
    },
    {
      id: 'api-security',
      title: 'API Security',
      description: 'API security is not just "add a token." It encompasses OAuth 2.0 flows, JWT validation, API key management, mTLS for service-to-service auth, and the OWASP API Security Top 10. Getting it wrong means data breaches.',
      keyPoints: [
        'OAuth 2.0 Authorization Code flow: for web apps — redirect to auth server, get code, exchange for token',
        'OAuth 2.0 Client Credentials flow: for service-to-service — no user involved, machine-to-machine auth',
        'OAuth 2.0 Device flow: for IoT/TV — display code, user authenticates on phone/laptop',
        'JWT validation: verify signature (RS256 with public key), check exp, check iss and aud claims',
        'API keys: for identifying the calling application (not the user) — rate limiting, usage tracking, billing',
        'mTLS: both client and server present certificates — strongest service-to-service authentication',
        'OWASP API Top 10: BOLA (#1), broken auth (#2), excessive data exposure (#3) — know the top threats',
        'Never trust the client: validate all input, check authorization on every request, rate limit aggressively',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'JWT Validation and OAuth 2.0',
          code: `import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import type { Request, Response, NextFunction } from 'express'

// JWKS client — fetches public keys from auth server
const jwks = jwksClient({
  jwksUri: 'https://auth.example.com/.well-known/jwks.json',
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
})

function getSigningKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    jwks.getSigningKey(kid, (err, key) => {
      if (err) return reject(err)
      resolve(key!.getPublicKey())
    })
  })
}

interface TokenPayload {
  sub: string            // User ID
  iss: string            // Issuer
  aud: string | string[] // Audience
  exp: number            // Expiration
  scope: string          // Scopes/permissions
}

// JWT validation middleware
async function authenticate(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ code: 'MISSING_TOKEN', message: 'Bearer token required' })
    return
  }

  const token = authHeader.slice(7)

  try {
    // Decode header to get kid (key ID)
    const decoded = jwt.decode(token, { complete: true })
    if (!decoded?.header.kid) {
      throw new Error('Missing kid in token header')
    }

    // Fetch public key and verify
    const publicKey = await getSigningKey(decoded.header.kid)
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: 'https://auth.example.com',
      audience: 'https://api.example.com',
    }) as TokenPayload

    req.user = {
      id: payload.sub,
      scopes: payload.scope.split(' '),
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ code: 'TOKEN_EXPIRED', message: 'Token has expired' })
    } else {
      res.status(401).json({ code: 'INVALID_TOKEN', message: 'Token validation failed' })
    }
  }
}

// Authorization middleware — check scopes
function requireScope(scope: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user?.scopes.includes(scope)) {
      res.status(403).json({
        code: 'INSUFFICIENT_SCOPE',
        message: \`Required scope: \${scope}\`,
      })
      return
    }
    next()
  }
}

// BOLA prevention — always check resource ownership
async function getOrder(req: Request, res: Response): Promise<void> {
  const order = await orderRepository.findById(req.params.id)

  if (!order) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Order not found' })
    return
  }

  // CRITICAL: Check that the authenticated user owns this resource
  // BOLA (Broken Object Level Authorization) is OWASP API #1
  if (order.userId !== req.user!.id && !req.user!.scopes.includes('admin')) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied' })
    return
  }

  res.status(200).json(order)
}`,
        },
      ],
      useCases: [
        'Authorization Code: web apps with user login (most common OAuth flow)',
        'Client Credentials: backend services calling other services',
        'Device flow: smart TV apps, CLI tools that cannot open a browser directly',
        'API keys: third-party developer access, usage metering, rate limiting per client',
        'mTLS: service mesh authentication, zero-trust network architecture',
      ],
      commonPitfalls: [
        'BOLA (Broken Object Level Authorization): checking auth but not checking if the user owns the resource — OWASP API #1 vulnerability',
        'Storing JWT secret in code: use JWKS (public key infrastructure) — the secret should never be in your codebase',
        'No token expiration: JWTs without exp claim live forever — use short-lived access tokens (15 min)',
        'API keys as sole authentication: API keys identify the application, not the user — combine with OAuth for user auth',
        'Not validating iss and aud claims: a JWT from another service can be replayed against yours',
      ],
      interviewTips: [
        'Name the OAuth 2.0 flows and when each is used — this is frequently asked',
        'Discuss JWT validation steps: signature, exp, iss, aud — shows you understand the verification chain',
        'Mention BOLA as the #1 API vulnerability and how to prevent it (resource ownership checks)',
        'Discuss mTLS for service-to-service — shows knowledge beyond user-facing auth',
      ],
      relatedConcepts: ['api-gateway', 'rest-best-practices', 'rate-limiting'],
      difficulty: 'advanced',
      tags: ['api', 'security', 'authentication'],
      proTip: 'Never implement your own OAuth server. Use Auth0, Clerk, AWS Cognito, or Keycloak. These handle token signing, key rotation, PKCE, device flow, MFA, and social login. Rolling your own auth is the fastest path to a security incident.',
    },
  ],
}
