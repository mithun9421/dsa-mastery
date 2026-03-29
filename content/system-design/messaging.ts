// @ts-nocheck
import type { Category } from '@/lib/types'

export const messagingCategory: Category = {
  id: 'messaging',
  title: 'Messaging & Event Systems',
  description: 'Message queues, event streaming, and asynchronous communication patterns — from Kafka internals to saga orchestration.',
  icon: 'MessageSquare',
  concepts: [
    {
      id: 'message-queue-vs-event-streaming',
      title: 'Message Queue vs Event Streaming',
      description: 'Message queues (RabbitMQ) and event streaming platforms (Kafka) solve different problems despite both moving messages between services. Queues are about task distribution; streams are about event history. Choosing wrong costs you a rewrite.',
      keyPoints: [
        'Message Queue (RabbitMQ): message is consumed by ONE consumer, then deleted — task distribution semantics',
        'Event Streaming (Kafka): message is appended to a log, retained for days/weeks, consumed by MANY consumers independently',
        'Queue: push-based delivery, broker pushes to consumers — low latency for individual messages',
        'Stream: pull-based consumption, consumers poll at their own pace — higher throughput, consumer controls rate',
        'Queue: no replay — once consumed and acknowledged, the message is gone',
        'Stream: full replay — new consumers can read from the beginning of the log',
        'Consumer groups (Kafka): multiple consumers in a group share partitions — horizontal scaling of consumption',
        'Competing consumers (RabbitMQ): multiple consumers on one queue — round-robin task distribution',
        'Retention: queues delete on ACK; streams retain based on time or size policy',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Queue vs Stream Mental Model',
          code: `
  MESSAGE QUEUE (RabbitMQ):           EVENT STREAM (Kafka):
  ┌─────────────────────┐             ┌─────────────────────────┐
  │  Producer            │             │  Producer                │
  └────────┬────────────┘             └────────┬──────────────┘
           │                                    │
           ▼                                    ▼
  ┌─────────────────────┐             ┌─────────────────────────┐
  │  Exchange → Queue    │             │  Topic (Partition Log)   │
  │  [msg1][msg2][msg3]  │             │  [0][1][2][3][4][5]...  │
  │  ← consumed, deleted │             │  ← retained for days    │
  └────────┬────────────┘             └───┬─────────┬──────────┘
           │                               │         │
           ▼                               ▼         ▼
  ┌─────────────────┐             ┌──────────┐ ┌──────────┐
  │  Consumer (1 of N)│           │ Group A   │ │ Group B  │
  │  gets each msg once│          │ offset=3  │ │ offset=1 │
  └─────────────────┘             └──────────┘ └──────────┘

  Queue: "Process this task"        Stream: "This event happened"
  Queue: Delete after ACK           Stream: Keep for replay
  Queue: One consumer per msg       Stream: Many groups, each reads all`,
        },
      ],
      useCases: [
        'Queue (RabbitMQ): background job processing, email sending, image resizing, order processing',
        'Stream (Kafka): event sourcing, activity feeds, log aggregation, CDC pipelines, real-time analytics',
        'Queue: when you need routing logic (topic exchange, header-based routing)',
        'Stream: when multiple downstream systems need the same events independently',
      ],
      commonPitfalls: [
        'Using Kafka as a task queue: it works but you lose per-message routing, priority, and delayed delivery',
        'Using RabbitMQ for event sourcing: no replay means new services cannot catch up on history',
        'Not understanding retention: Kafka messages are NOT deleted on consumption — they expire by policy',
        'Assuming Kafka guarantees ordering globally: ordering is per-partition only',
      ],
      interviewTips: [
        'Frame the choice as "task distribution vs event log" — not "RabbitMQ vs Kafka"',
        'Mention that many systems use both: Kafka for events, RabbitMQ for tasks',
        'Discuss consumer groups and partition assignment as the scaling model for Kafka',
      ],
      relatedConcepts: ['kafka-internals', 'rabbitmq', 'event-driven-architecture', 'pub-sub-patterns'],
      difficulty: 'intermediate',
      tags: ['messaging', 'architecture', 'async'],
      proTip: 'LinkedIn built Kafka because RabbitMQ could not handle their event volume (trillions of messages/day). But most companies are not LinkedIn. If your throughput is under 100K msgs/sec and you need routing flexibility, RabbitMQ is simpler to operate and equally reliable.',
    },
    {
      id: 'kafka-internals',
      title: 'Kafka Internals',
      description: 'Kafka is a distributed commit log. Understanding topics, partitions, offsets, the ISR (In-Sync Replicas) mechanism, and consumer group rebalancing is essential for building reliable event-driven systems at scale.',
      keyPoints: [
        'Topic: a named feed of messages — analogous to a database table',
        'Partition: an ordered, immutable sequence of messages within a topic — the unit of parallelism',
        'Offset: a sequential ID for each message within a partition — consumers track their position by offset',
        'Producer acks: acks=0 (fire-and-forget), acks=1 (leader acknowledged), acks=all (all ISR replicas acknowledged)',
        'Idempotent producer: enable.idempotence=true — deduplicates retries using sequence numbers, prevents duplicates',
        'Consumer group: consumers in the same group share partitions — each partition is consumed by exactly one consumer in the group',
        'Rebalance: when consumers join/leave a group, partitions are redistributed — causes brief pause in consumption',
        'Log compaction: retains only the latest value for each key — useful for changelogs and state snapshots',
        'ISR (In-Sync Replicas): replicas that are caught up with the leader — acks=all waits for all ISR members',
        'Leader election: when a partition leader fails, a new leader is elected from the ISR',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Kafka Producer and Consumer with KafkaJS',
          code: `import { Kafka, Partitioners, logLevel } from 'kafkajs'

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: ['kafka-1:9092', 'kafka-2:9092', 'kafka-3:9092'],
  logLevel: logLevel.WARN,
})

// Producer with idempotence and acks=all
const producer = kafka.producer({
  idempotent: true,                          // Prevents duplicate messages on retry
  maxInFlightRequests: 5,                    // Required <= 5 for idempotent
  createPartitioner: Partitioners.DefaultPartitioner,
})

async function publishOrderEvent(order: {
  orderId: string
  userId: string
  status: string
  total: number
}): Promise<void> {
  await producer.send({
    topic: 'order-events',
    acks: -1,                                // acks=all — wait for all ISR replicas
    messages: [{
      key: order.orderId,                    // Same key = same partition = ordering
      value: JSON.stringify(order),
      headers: {
        'event-type': order.status,
        'timestamp': String(Date.now()),
      },
    }],
  })
}

// Consumer with group and manual offset commit
const consumer = kafka.consumer({
  groupId: 'payment-processor',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  maxBytesPerPartition: 1048576,             // 1MB per partition per fetch
})

async function startConsumer(): Promise<void> {
  await consumer.connect()
  await consumer.subscribe({
    topic: 'order-events',
    fromBeginning: false,                     // Start from latest offset
  })

  await consumer.run({
    autoCommit: false,                        // Manual offset management
    eachMessage: async ({ topic, partition, message }) => {
      const order = JSON.parse(message.value!.toString())
      const eventType = message.headers?.['event-type']?.toString()

      try {
        await processOrder(order, eventType)

        // Commit offset AFTER successful processing
        await consumer.commitOffsets([{
          topic,
          partition,
          offset: String(Number(message.offset) + 1),
        }])
      } catch (error) {
        // Don't commit — message will be redelivered
        console.error('Processing failed, will retry:', error)
      }
    },
  })
}`,
        },
      ],
      ascii: `
  Topic: order-events (3 partitions, replication factor 3)

  Partition 0:  [0][1][2][3][4][5] → Leader: Broker 1, ISR: {1,2,3}
  Partition 1:  [0][1][2][3]       → Leader: Broker 2, ISR: {2,3,1}
  Partition 2:  [0][1][2][3][4]    → Leader: Broker 3, ISR: {3,1,2}

  Producer (key = orderId):
    hash("order-123") % 3 = Partition 1
    All events for order-123 go to same partition → ordering guaranteed

  Consumer Group "payment-processor" (3 consumers):
    Consumer A ← Partition 0
    Consumer B ← Partition 1
    Consumer C ← Partition 2
    (each partition assigned to exactly one consumer in group)

  Consumer Group "analytics" (2 consumers):
    Consumer X ← Partition 0, Partition 1
    Consumer Y ← Partition 2
    (independent offsets — reads same data independently)`,
      useCases: [
        'Event sourcing: every state change is an event in a Kafka topic — full audit trail with replay',
        'CDC (Change Data Capture): Debezium reads DB WAL, publishes to Kafka — downstream systems consume',
        'Log aggregation: application logs → Kafka → Elasticsearch/S3',
        'Real-time analytics: clickstream events → Kafka → Flink/ksqlDB → dashboards',
      ],
      commonPitfalls: [
        'Too few partitions: limits consumer parallelism — you cannot have more consumers than partitions in a group',
        'Too many partitions: increases leader election time, memory overhead, and end-to-end latency',
        'Not using message keys: without a key, messages round-robin across partitions — no ordering guarantee',
        'Auto-commit with slow processing: offset committed before processing finishes — message lost if consumer crashes',
        'Consumer group rebalance storms: too many consumers joining/leaving rapidly causes continuous rebalancing',
      ],
      interviewTips: [
        'Draw the partition/offset model — it is the core abstraction',
        'Explain why ordering is per-partition, not per-topic',
        'Discuss acks=all + idempotent producer as the reliable production configuration',
        'Mention ISR and how it relates to availability during broker failures',
      ],
      relatedConcepts: ['kafka-delivery-guarantees', 'message-queue-vs-event-streaming', 'event-driven-architecture'],
      difficulty: 'advanced',
      tags: ['messaging', 'kafka', 'distributed-systems'],
      proTip: 'The number of partitions is the upper bound on consumer parallelism within a group. A common formula: partitions = max(expected_throughput / consumer_throughput, target_consumer_count). Start with 6-12 partitions for most topics — you can increase later but never decrease.',
    },
    {
      id: 'kafka-delivery-guarantees',
      title: 'Kafka Delivery Guarantees',
      description: 'Kafka supports at-most-once, at-least-once, and exactly-once delivery semantics. Understanding which guarantee you actually need — and the performance cost of each — prevents both data loss and the over-engineering of systems that can tolerate duplicates.',
      keyPoints: [
        'At-most-once: commit offset before processing — if processing fails, message is skipped (lost)',
        'At-least-once: commit offset after processing — if commit fails, message is reprocessed (duplicate)',
        'Exactly-once: idempotent producer + transactional API — atomically write to multiple partitions and commit offsets',
        'Idempotent producer: assigns sequence numbers to messages — broker deduplicates retries within a session',
        'Transactional API: atomic writes across partitions + offset commits — read-process-write in one transaction',
        'Consumer offset management: auto-commit (at-most-once risk) vs manual commit (at-least-once default)',
        'Idempotent consumers: design consumers to handle duplicates safely — often cheaper than exactly-once infrastructure',
        'Exactly-once has a throughput cost: ~20% lower throughput due to transaction coordination overhead',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Delivery Guarantee Configurations',
          code: `import { Kafka } from 'kafkajs'

const kafka = new Kafka({ brokers: ['kafka:9092'], clientId: 'my-app' })

// AT-MOST-ONCE: Fast but may lose messages
// Offset committed before processing
const atMostOnceConsumer = kafka.consumer({ groupId: 'fast-group' })
await atMostOnceConsumer.run({
  autoCommit: true,              // Commits offset on receive
  autoCommitInterval: 1000,
  eachMessage: async ({ message }) => {
    // If this crashes, message is already committed — lost
    await processMessage(message)
  },
})

// AT-LEAST-ONCE: Safe but may produce duplicates
// Offset committed after processing
const atLeastOnceConsumer = kafka.consumer({ groupId: 'safe-group' })
await atLeastOnceConsumer.run({
  autoCommit: false,
  eachMessage: async ({ topic, partition, message }) => {
    await processMessage(message) // Process first
    await atLeastOnceConsumer.commitOffsets([{
      topic, partition,
      offset: String(Number(message.offset) + 1),
    }])
    // If crash between process and commit, message redelivered
    // Consumer must be idempotent!
  },
})

// EXACTLY-ONCE: Strongest guarantee, highest cost
// Transactional producer + consumer offsets in same transaction
const txProducer = kafka.producer({
  idempotent: true,
  transactionalId: 'order-processor-tx', // Enables transactions
  maxInFlightRequests: 5,
})

await txProducer.connect()

async function processExactlyOnce(
  inputTopic: string,
  outputTopic: string,
  message: { key: string; value: string }
): Promise<void> {
  const transaction = await txProducer.transaction()
  try {
    // Transform and produce to output topic
    const result = transform(message)
    await transaction.send({
      topic: outputTopic,
      messages: [{ key: result.key, value: result.value }],
    })

    // Commit consumer offset in same transaction
    await transaction.sendOffsets({
      consumerGroupId: 'exactly-once-group',
      topics: [{
        topic: inputTopic,
        partitions: [{ partition: 0, offset: message.offset }],
      }],
    })

    await transaction.commit()
  } catch (error) {
    await transaction.abort()
    throw error
  }
}`,
        },
      ],
      ascii: `
  AT-MOST-ONCE:        AT-LEAST-ONCE:       EXACTLY-ONCE:
  ┌──────────┐         ┌──────────┐         ┌──────────┐
  │ Receive  │         │ Receive  │         │ Receive  │
  ├──────────┤         ├──────────┤         ├──────────┤
  │ Commit ✓ │ ←first  │ Process  │ ←first  │ BEGIN TX │
  ├──────────┤         ├──────────┤         ├──────────┤
  │ Process  │ ←then   │ Commit ✓ │ ←then   │ Process  │
  └──────────┘         └──────────┘         │ Produce  │
                                             │ Commit   │
  If process fails:    If commit fails:      │ COMMIT TX│
  message LOST         message REPLAYED      └──────────┘
                                             Atomic: all or nothing`,
      useCases: [
        'At-most-once: metrics, logs, non-critical analytics — losing a data point is fine',
        'At-least-once: most production workloads — design idempotent consumers to handle duplicates',
        'Exactly-once: financial transactions, inventory updates, billing — where duplicates cause real money problems',
      ],
      commonPitfalls: [
        'Assuming Kafka is exactly-once by default: default is at-least-once with auto-commit (actually at-most-once risk)',
        'Implementing exactly-once without understanding the cost: 20% throughput reduction, more complex error handling',
        'Not making consumers idempotent when using at-least-once: duplicates silently corrupt data',
        'Using exactly-once for everything: most systems work fine with at-least-once + idempotent consumers',
      ],
      interviewTips: [
        'Know all three guarantees and the commit timing that produces each',
        'Emphasize that at-least-once + idempotent consumers is the pragmatic default for most systems',
        'Explain the transactional API for exactly-once: atomic produce + offset commit',
        'Mention that exactly-once only works within Kafka — external side effects need idempotency keys',
      ],
      relatedConcepts: ['kafka-internals', 'outbox-pattern', 'saga-pattern'],
      difficulty: 'advanced',
      tags: ['messaging', 'kafka', 'reliability'],
      proTip: 'Exactly-once in Kafka only guarantees exactly-once within the Kafka ecosystem (produce + commit atomically). If your consumer writes to an external database, you still need idempotency. The pattern: store the Kafka offset alongside the result in the same DB transaction — on replay, check if the offset was already processed.',
    },
    {
      id: 'rabbitmq',
      title: 'RabbitMQ',
      description: 'RabbitMQ is an AMQP message broker with sophisticated routing via exchanges. It excels at task distribution, request-reply patterns, and scenarios requiring flexible routing logic that Kafka does not natively support.',
      keyPoints: [
        'Exchange types: direct (exact routing key match), fanout (broadcast to all bound queues), topic (pattern matching with * and #), headers (match on message headers)',
        'Dead Letter Exchange (DLX): messages that fail processing are routed to a DLX for inspection/retry',
        'Message TTL: per-message or per-queue time-to-live — expired messages go to DLX if configured',
        'Priority queues: messages with higher priority are consumed first — useful for SLA-tiered processing',
        'Publisher confirms: broker acknowledges receipt of each message — prevents silent message loss',
        'Consumer acknowledgment: manual ACK after processing ensures at-least-once delivery',
        'Prefetch count: limits unacknowledged messages per consumer — prevents one slow consumer from hogging all messages',
        'Quorum queues: Raft-based replicated queues — replacement for classic mirrored queues, better durability',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'RabbitMQ with Exchange Routing and DLX',
          code: `import amqp from 'amqplib'

async function setupRabbitMQ(): Promise<void> {
  const conn = await amqp.connect(process.env.RABBITMQ_URL!)
  const channel = await conn.createChannel()

  // Dead Letter Exchange for failed messages
  await channel.assertExchange('dlx', 'fanout', { durable: true })
  await channel.assertQueue('dead-letters', {
    durable: true,
    arguments: { 'x-message-ttl': 86400000 }, // 24hr retention
  })
  await channel.bindQueue('dead-letters', 'dlx', '')

  // Main exchange with topic routing
  await channel.assertExchange('orders', 'topic', { durable: true })

  // Queue with DLX and retry limit
  await channel.assertQueue('order-processing', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'dlx',      // Failed msgs go here
      'x-dead-letter-routing-key': 'order.failed',
      'x-message-ttl': 300000,               // 5min TTL
    },
  })

  // Bind: order.created and order.updated go to processing queue
  await channel.bindQueue('order-processing', 'orders', 'order.created')
  await channel.bindQueue('order-processing', 'orders', 'order.updated')

  // Priority queue for VIP orders
  await channel.assertQueue('vip-orders', {
    durable: true,
    arguments: {
      'x-max-priority': 10,
      'x-dead-letter-exchange': 'dlx',
    },
  })

  // Publisher with confirms
  await channel.confirmSelect()

  function publishOrder(routingKey: string, order: unknown, priority = 0): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const published = channel.publish(
        'orders',
        routingKey,
        Buffer.from(JSON.stringify(order)),
        {
          persistent: true,       // Survive broker restart
          priority,
          messageId: crypto.randomUUID(),
          timestamp: Date.now(),
          contentType: 'application/json',
        }
      )
      if (published) {
        channel.waitForConfirms().then(() => resolve(true)).catch(reject)
      } else {
        reject(new Error('Channel buffer full'))
      }
    })
  }

  // Consumer with manual ACK and prefetch
  await channel.prefetch(10)  // Process 10 messages at a time

  await channel.consume('order-processing', async (msg) => {
    if (!msg) return
    const retryCount = (msg.properties.headers?.['x-retry-count'] ?? 0) as number

    try {
      const order = JSON.parse(msg.content.toString())
      await processOrder(order)
      channel.ack(msg)
    } catch (error) {
      if (retryCount < 3) {
        // Retry with incremented count
        channel.publish('orders', msg.fields.routingKey, msg.content, {
          ...msg.properties,
          headers: { ...msg.properties.headers, 'x-retry-count': retryCount + 1 },
        })
        channel.ack(msg)  // ACK original to prevent DLX
      } else {
        channel.nack(msg, false, false) // Send to DLX after 3 retries
      }
    }
  })
}`,
        },
      ],
      ascii: `
  Producer
     │
     ▼
  ┌──────────┐     Routing Key: "order.created"
  │ Exchange │─────────────┐
  │ (topic)  │             │
  └──────────┘             │
     │                     │
     │ "order.*"           │ "order.created"
     ▼                     ▼
  ┌──────────┐      ┌──────────┐
  │ Analytics│      │Processing│──── fail 3x ──→ ┌─────┐
  │  Queue   │      │  Queue   │                  │ DLX │
  └──────────┘      └──────────┘                  └─────┘
     │                  │                            │
     ▼                  ▼                            ▼
  [Consumer]      [Consumer x3]              [Dead Letter Queue]
  (fan-out)       (competing)                 (inspect/retry)`,
      useCases: [
        'Task queues: background job processing with retry logic and DLX for poison messages',
        'Request-reply: RPC over messaging with correlation IDs and reply-to queues',
        'Routing: complex message routing based on content, headers, or patterns',
        'Priority processing: VIP customer orders processed before standard orders',
      ],
      commonPitfalls: [
        'Not enabling publisher confirms: messages silently lost if broker crashes between receive and persist',
        'Auto-ACK mode: message acknowledged on delivery, not after processing — data loss on consumer crash',
        'Prefetch too high: one slow consumer hoards messages while others sit idle',
        'Mirrored queues in production: deprecated in favor of quorum queues — use quorum queues for durability',
      ],
      interviewTips: [
        'Explain exchange types and when each is used — direct for point-to-point, fanout for broadcast, topic for pattern routing',
        'Discuss DLX as the standard pattern for handling poison messages',
        'Compare with Kafka: RabbitMQ for routing flexibility and task distribution, Kafka for event streaming and replay',
      ],
      relatedConcepts: ['message-queue-vs-event-streaming', 'dead-letter-queue', 'saga-pattern'],
      difficulty: 'intermediate',
      tags: ['messaging', 'rabbitmq', 'async'],
      proTip: 'RabbitMQ quorum queues (Raft-based) replaced mirrored queues in RabbitMQ 3.8+. They provide stronger durability guarantees, faster failover, and poison message handling built-in. Always use quorum queues for production workloads — classic mirrored queues are deprecated.',
    },
    {
      id: 'event-driven-architecture',
      title: 'Event-Driven Architecture',
      description: 'Event-driven architecture decouples services through asynchronous events instead of synchronous API calls. The distinction between event notification, event-carried state transfer, and event sourcing determines how tightly or loosely your services are coupled.',
      keyPoints: [
        'Event notification: "Order #123 was created" — minimal data, consumer must query source for details (most decoupled)',
        'Event-carried state transfer: "Order #123 created: {userId, items, total}" — full data in event, consumer is self-sufficient (no callbacks)',
        'Event sourcing: state is derived by replaying events — the event log IS the source of truth, not a derived projection',
        'Choreography: services react to events independently — no central coordinator, emergent behavior',
        'Orchestration: a central coordinator (saga orchestrator) tells services what to do — explicit control flow',
        'Choreography vs orchestration: choreography is more decoupled but harder to debug; orchestration is easier to reason about but creates a central bottleneck',
        'CQRS (Command Query Responsibility Segregation): separate write model (commands) from read model (queries) — often paired with event sourcing',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Event-Carried State Transfer',
          code: `// Event types — carry enough state for consumers to act independently
interface OrderCreatedEvent {
  type: 'order.created'
  timestamp: string
  data: {
    orderId: string
    userId: string
    items: Array<{ productId: string; quantity: number; price: number }>
    totalAmount: number
    shippingAddress: {
      street: string
      city: string
      country: string
      zip: string
    }
  }
}

interface OrderPaidEvent {
  type: 'order.paid'
  timestamp: string
  data: {
    orderId: string
    paymentId: string
    amount: number
    method: 'card' | 'paypal' | 'crypto'
  }
}

type OrderEvent = OrderCreatedEvent | OrderPaidEvent

// CHOREOGRAPHY: Services react independently to events
// No central coordinator — each service subscribes to what it needs

// Inventory Service — reacts to order.created
async function handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
  for (const item of event.data.items) {
    await reserveInventory(item.productId, item.quantity)
  }
}

// Shipping Service — reacts to order.paid
async function handleOrderPaid(event: OrderPaidEvent): Promise<void> {
  await createShipment(event.data.orderId)
}

// Notification Service — reacts to both
async function handleOrderEvent(event: OrderEvent): Promise<void> {
  switch (event.type) {
    case 'order.created':
      await sendEmail(event.data.userId, 'Order confirmed', event.data)
      break
    case 'order.paid':
      await sendEmail(
        await getUserForOrder(event.data.orderId),
        'Payment received',
        event.data
      )
      break
  }
}`,
        },
      ],
      ascii: `
  CHOREOGRAPHY:                     ORCHESTRATION:
  ┌─────────┐  order.created       ┌──────────────┐
  │  Order  │─────────────────┐    │  Saga        │
  │ Service │                 │    │ Orchestrator │
  └─────────┘                 │    └──────┬───────┘
                              │           │
  Events published to bus:    │    Commands sent directly:
       │     │     │          │       │     │     │
       ▼     ▼     ▼          │       ▼     ▼     ▼
  ┌─────┐ ┌─────┐ ┌─────┐    │  ┌─────┐ ┌─────┐ ┌─────┐
  │Inv. │ │Ship.│ │Notif│    │  │Inv. │ │Ship.│ │Notif│
  └─────┘ └─────┘ └─────┘    │  └─────┘ └─────┘ └─────┘
  Each decides               │  Orchestrator decides
  independently              │  the order of operations`,
      useCases: [
        'Microservice communication: replacing synchronous REST calls with async events',
        'Order processing: order created → inventory reserved → payment charged → shipment created',
        'Audit logging: every event is a fact that happened — natural audit trail',
        'Real-time dashboards: events flow to analytics service for live metrics',
      ],
      commonPitfalls: [
        'Event notification without enough data: consumer must call back to source — creates runtime coupling',
        'Too much choreography: debugging a failure across 10 services reacting to events is a nightmare',
        'Not versioning events: changing event schema breaks all consumers — use schema registry',
        'Circular event chains: Service A emits event, B reacts and emits another, A reacts again — infinite loop',
      ],
      interviewTips: [
        'Distinguish the three event patterns (notification, state transfer, sourcing) — most candidates only know one',
        'Discuss choreography vs orchestration trade-offs — there is no universally better answer',
        'Mention CQRS as a companion pattern to event sourcing',
      ],
      relatedConcepts: ['outbox-pattern', 'saga-pattern', 'kafka-internals', 'pub-sub-patterns'],
      difficulty: 'advanced',
      tags: ['messaging', 'architecture', 'microservices'],
      proTip: 'Martin Fowler recommends starting with orchestration (explicit, debuggable) and moving to choreography only when the coupling becomes a problem. Most teams that start with choreography end up building an orchestrator anyway when debugging distributed failures becomes untenable.',
    },
    {
      id: 'outbox-pattern',
      title: 'Outbox Pattern',
      description: 'The outbox pattern solves the dual-write problem: how do you atomically update a database AND publish an event? Answer: write both to the database in the same transaction, then a separate process publishes events from the outbox table.',
      keyPoints: [
        'Dual-write problem: writing to DB and Kafka independently — if one fails, the system is inconsistent',
        'Solution: write the event to an "outbox" table in the SAME database transaction as the business data',
        'Polling publisher: a background process polls the outbox table for unpublished events and sends them to Kafka',
        'CDC publisher: Debezium reads the outbox table changes from the WAL — no polling, lower latency',
        'At-least-once delivery: the publisher may send the same event twice — consumers must be idempotent',
        'Ordering: events for the same aggregate (same partition key) maintain order within the outbox',
        'Cleanup: delete or mark outbox rows as published after successful send — prevent table bloat',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Outbox Pattern with Transactional Write',
          code: `import { Pool } from 'pg'
import { Kafka } from 'kafkajs'

const db = new Pool({ connectionString: process.env.DATABASE_URL })
const kafka = new Kafka({ brokers: ['kafka:9092'], clientId: 'outbox' })

// Step 1: Business logic + outbox write in ONE transaction
async function createOrder(order: {
  userId: string
  items: Array<{ productId: string; quantity: number }>
  total: number
}): Promise<string> {
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    // Business data
    const result = await client.query(
      \`INSERT INTO orders (user_id, items, total, status)
       VALUES ($1, $2, $3, 'created') RETURNING id\`,
      [order.userId, JSON.stringify(order.items), order.total]
    )
    const orderId = result.rows[0].id

    // Outbox event — SAME transaction
    await client.query(
      \`INSERT INTO outbox (aggregate_type, aggregate_id, event_type, payload)
       VALUES ('Order', $1, 'order.created', $2)\`,
      [orderId, JSON.stringify({
        orderId,
        userId: order.userId,
        items: order.items,
        total: order.total,
      })]
    )

    await client.query('COMMIT')
    return orderId
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Step 2: Polling publisher — reads outbox, publishes to Kafka
async function outboxPublisher(): Promise<void> {
  const producer = kafka.producer({ idempotent: true })
  await producer.connect()

  async function pollAndPublish(): Promise<void> {
    const client = await db.connect()
    try {
      await client.query('BEGIN')

      // Lock and fetch unpublished events
      const { rows } = await client.query(
        \`SELECT * FROM outbox
         WHERE published_at IS NULL
         ORDER BY created_at
         LIMIT 100
         FOR UPDATE SKIP LOCKED\`
      )

      if (rows.length === 0) {
        await client.query('COMMIT')
        return
      }

      // Publish to Kafka
      await producer.send({
        topic: 'domain-events',
        messages: rows.map((row) => ({
          key: row.aggregate_id,
          value: JSON.stringify({
            type: row.event_type,
            aggregateType: row.aggregate_type,
            aggregateId: row.aggregate_id,
            payload: row.payload,
            timestamp: row.created_at,
          }),
        })),
      })

      // Mark as published
      const ids = rows.map((r) => r.id)
      await client.query(
        \`UPDATE outbox SET published_at = NOW()
         WHERE id = ANY($1)\`,
        [ids]
      )

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Outbox publish failed:', error)
    } finally {
      client.release()
    }
  }

  // Poll every 500ms
  setInterval(pollAndPublish, 500)
}`,
        },
      ],
      ascii: `
  ┌──────────────────────────────────────────┐
  │           Database Transaction            │
  │                                          │
  │  ┌──────────────┐  ┌──────────────────┐  │
  │  │ orders table │  │  outbox table    │  │
  │  │ INSERT order │  │  INSERT event    │  │
  │  └──────────────┘  └──────────────────┘  │
  │                                          │
  │          COMMIT (atomic)                 │
  └──────────────────────────────────────────┘
                    │
                    ▼
            ┌──────────────┐
            │   Publisher  │ (polling or CDC)
            │   Process    │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │    Kafka     │
            │   Topic      │
            └──────────────┘`,
      useCases: [
        'Any service that needs to update state AND notify other services reliably',
        'Order service: create order + publish order.created event atomically',
        'User registration: create user + publish user.registered event',
        'Payment processing: update payment status + publish payment.completed event',
      ],
      commonPitfalls: [
        'Publishing to Kafka inside the DB transaction: if Kafka is slow, your transaction holds locks too long',
        'Not handling publisher failures: if the publisher crashes, events pile up — monitor outbox table size',
        'Outbox table growing forever: clean up published events with a scheduled job or retention policy',
        'Not ordering by created_at: events can be published out of order if the publisher does not sort',
      ],
      interviewTips: [
        'Explain the dual-write problem first — then present the outbox as the solution',
        'Mention both polling and CDC (Debezium) as publisher strategies — CDC is lower latency',
        'Discuss that Debezium + Kafka Connect is the production-standard implementation of CDC-based outbox',
      ],
      relatedConcepts: ['event-driven-architecture', 'saga-pattern', 'kafka-internals', 'write-ahead-log'],
      difficulty: 'advanced',
      tags: ['messaging', 'patterns', 'reliability'],
      proTip: 'Debezium has a dedicated Outbox Event Router that reads the outbox table via CDC and publishes to Kafka with configurable topic routing. This eliminates the need for a custom polling publisher and gives sub-second latency. It is the production standard at companies like WePay and Zalando.',
    },
    {
      id: 'saga-pattern',
      title: 'Saga Pattern',
      description: 'Sagas manage distributed transactions across multiple services WITHOUT two-phase commit. Each step has a compensating action that undoes it on failure. The choice between choreography and orchestration sagas determines your debugging and maintenance experience.',
      keyPoints: [
        'Distributed transactions without 2PC: each service commits locally, compensations undo on failure',
        'Choreography saga: services listen for events and react — no coordinator, highly decoupled',
        'Orchestration saga: a central orchestrator sends commands to each service in sequence — explicit control flow',
        'Compensating transaction: the "undo" for a completed step — e.g., refund payment if shipping fails',
        'Not all steps are compensatable: sending an email cannot be undone — use semantic compensation (send a correction email)',
        'Saga execution coordinator (SEC): the orchestrator tracks saga state and handles failures',
        'Isolation problem: sagas do not provide ACID isolation — intermediate states are visible to other transactions',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Orchestration Saga for Order Processing',
          code: `// Saga step definition
interface SagaStep<T> {
  name: string
  execute: (context: T) => Promise<void>
  compensate: (context: T) => Promise<void>
}

// Generic saga orchestrator
class SagaOrchestrator<T> {
  private readonly completedSteps: SagaStep<T>[] = []

  constructor(private readonly steps: SagaStep<T>[]) {}

  async execute(context: T): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.execute(context)
        this.completedSteps.push(step)
      } catch (error) {
        console.error(\`Saga step "\${step.name}" failed:\`, error)
        await this.compensate(context)
        throw new Error(\`Saga failed at step "\${step.name}"\`)
      }
    }
  }

  private async compensate(context: T): Promise<void> {
    // Compensate in reverse order
    for (const step of [...this.completedSteps].reverse()) {
      try {
        console.log(\`Compensating step: \${step.name}\`)
        await step.compensate(context)
      } catch (error) {
        // Compensation failure is critical — alert ops
        console.error(
          \`CRITICAL: Compensation failed for "\${step.name}":\`, error
        )
        // Log for manual intervention
        await logCompensationFailure(step.name, context, error)
      }
    }
  }
}

// Order processing saga
interface OrderContext {
  orderId: string
  userId: string
  items: Array<{ productId: string; quantity: number; price: number }>
  totalAmount: number
  paymentId?: string
  shipmentId?: string
}

const orderSaga = new SagaOrchestrator<OrderContext>([
  {
    name: 'Reserve Inventory',
    execute: async (ctx) => {
      await inventoryService.reserve(ctx.orderId, ctx.items)
    },
    compensate: async (ctx) => {
      await inventoryService.release(ctx.orderId, ctx.items)
    },
  },
  {
    name: 'Process Payment',
    execute: async (ctx) => {
      const payment = await paymentService.charge(ctx.userId, ctx.totalAmount)
      ctx.paymentId = payment.id
    },
    compensate: async (ctx) => {
      if (ctx.paymentId) {
        await paymentService.refund(ctx.paymentId)
      }
    },
  },
  {
    name: 'Create Shipment',
    execute: async (ctx) => {
      const shipment = await shippingService.create(ctx.orderId, ctx.items)
      ctx.shipmentId = shipment.id
    },
    compensate: async (ctx) => {
      if (ctx.shipmentId) {
        await shippingService.cancel(ctx.shipmentId)
      }
    },
  },
  {
    name: 'Send Confirmation',
    execute: async (ctx) => {
      await notificationService.sendOrderConfirmation(ctx.userId, ctx.orderId)
    },
    compensate: async (ctx) => {
      await notificationService.sendOrderCancellation(ctx.userId, ctx.orderId)
    },
  },
])

// Execute saga
await orderSaga.execute({
  orderId: 'order-123',
  userId: 'user-456',
  items: [{ productId: 'prod-1', quantity: 2, price: 29.99 }],
  totalAmount: 59.98,
})`,
        },
      ],
      ascii: `
  Order Saga (Orchestration):

  ┌───────────┐
  │Orchestrator│
  └─────┬─────┘
        │
        │ 1. Reserve Inventory
        ├──────────────────────────→ Inventory ✓
        │
        │ 2. Process Payment
        ├──────────────────────────→ Payment ✓
        │
        │ 3. Create Shipment
        ├──────────────────────────→ Shipping ✗ FAIL
        │
        │ COMPENSATE (reverse order):
        │ 2c. Refund Payment
        ├──────────────────────────→ Payment (refund) ✓
        │
        │ 1c. Release Inventory
        ├──────────────────────────→ Inventory (release) ✓
        │
        │ Result: All changes rolled back
        ▼`,
      useCases: [
        'E-commerce order processing: inventory → payment → shipping → notification',
        'Travel booking: flight → hotel → car rental — cancel all if any fails',
        'Account creation: create user → setup billing → provision resources',
        'Any multi-service workflow that needs atomic-like behavior without 2PC',
      ],
      commonPitfalls: [
        'Compensation failure: what if the refund API is also down? Need manual intervention + dead letter queue',
        'Not making steps idempotent: compensation or retry may execute the same step twice',
        'Visible intermediate states: other requests can see partially-completed saga state — design for this',
        'Too many saga steps: a 15-step saga is a sign your service boundaries are wrong',
      ],
      interviewTips: [
        'Draw the saga flow with compensations — visual explanation is much clearer',
        'Discuss the isolation problem: sagas provide atomicity and durability but NOT isolation',
        'Mention that choreography sagas become hard to debug at scale — orchestration is easier to reason about',
        'Note that compensation failure is the hardest part — needs alerting and manual resolution process',
      ],
      relatedConcepts: ['outbox-pattern', 'event-driven-architecture', 'dead-letter-queue'],
      difficulty: 'advanced',
      tags: ['messaging', 'patterns', 'distributed-transactions'],
      proTip: 'Temporal.io (from Uber) and AWS Step Functions are production-grade saga orchestrators. They handle retry, compensation, timeouts, and state persistence out of the box. Before building a custom saga orchestrator, evaluate these — they solve years of battle-tested edge cases you will otherwise discover in production.',
    },
    {
      id: 'dead-letter-queue',
      title: 'Dead Letter Queue',
      description: 'A Dead Letter Queue (DLQ) captures messages that cannot be processed after repeated attempts. Without a DLQ, poison messages block queue consumption or are silently dropped. DLQs are your safety net for message processing failures.',
      keyPoints: [
        'Poison message: a message that always fails processing — bad format, missing dependency, bug in handler',
        'Retry exhaustion: after N retries, message moves to DLQ instead of being retried forever',
        'DLQ monitoring: alert when DLQ grows — it means something is broken in your processing pipeline',
        'Replay from DLQ: after fixing the bug, replay DLQ messages back to the original queue',
        'DLQ per source queue: each queue should have its own DLQ to isolate failures',
        'Include failure metadata: original queue, error message, retry count, timestamp — essential for debugging',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'DLQ Processing with Retry and Replay',
          code: `import { Kafka } from 'kafkajs'

const kafka = new Kafka({ brokers: ['kafka:9092'], clientId: 'dlq-manager' })

interface DLQMessage {
  originalTopic: string
  originalPartition: number
  originalOffset: string
  key: string | null
  value: string
  error: string
  retryCount: number
  failedAt: string
}

// Consumer with DLQ routing
async function consumeWithDLQ(
  topic: string,
  groupId: string,
  handler: (message: unknown) => Promise<void>,
  maxRetries: number = 3
): Promise<void> {
  const consumer = kafka.consumer({ groupId })
  const producer = kafka.producer()
  await consumer.connect()
  await producer.connect()
  await consumer.subscribe({ topic })

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic: t, partition, message }) => {
      const retryCount = parseInt(
        message.headers?.['x-retry-count']?.toString() ?? '0'
      )

      try {
        const parsed = JSON.parse(message.value!.toString())
        await handler(parsed)

        await consumer.commitOffsets([{
          topic: t, partition,
          offset: String(Number(message.offset) + 1),
        }])
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        if (retryCount < maxRetries) {
          // Retry: republish with incremented retry count
          await producer.send({
            topic: t,
            messages: [{
              key: message.key,
              value: message.value,
              headers: {
                ...message.headers,
                'x-retry-count': String(retryCount + 1),
                'x-last-error': errorMessage,
              },
            }],
          })
        } else {
          // DLQ: max retries exceeded
          const dlqMessage: DLQMessage = {
            originalTopic: t,
            originalPartition: partition,
            originalOffset: message.offset,
            key: message.key?.toString() ?? null,
            value: message.value!.toString(),
            error: errorMessage,
            retryCount,
            failedAt: new Date().toISOString(),
          }

          await producer.send({
            topic: \`\${t}.dlq\`,
            messages: [{
              key: message.key,
              value: JSON.stringify(dlqMessage),
            }],
          })
        }

        await consumer.commitOffsets([{
          topic: t, partition,
          offset: String(Number(message.offset) + 1),
        }])
      }
    },
  })
}

// Replay DLQ messages back to original topic
async function replayDLQ(dlqTopic: string, count?: number): Promise<number> {
  const producer = kafka.producer()
  const consumer = kafka.consumer({ groupId: \`\${dlqTopic}-replay\` })
  await producer.connect()
  await consumer.connect()
  await consumer.subscribe({ topic: dlqTopic, fromBeginning: true })

  let replayed = 0

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (count !== undefined && replayed >= count) return

      const dlqMsg: DLQMessage = JSON.parse(message.value!.toString())

      await producer.send({
        topic: dlqMsg.originalTopic,
        messages: [{
          key: dlqMsg.key,
          value: dlqMsg.value,
          headers: { 'x-retry-count': '0', 'x-replayed-from': 'dlq' },
        }],
      })

      replayed++
    },
  })

  return replayed
}`,
        },
      ],
      useCases: [
        'Any message consumer: capture processing failures instead of retrying forever or dropping',
        'Order processing: orders that fail due to inventory issues go to DLQ for manual review',
        'Data pipeline: malformed records go to DLQ, pipeline continues processing valid records',
        'Email sending: emails that fail to send after retries go to DLQ for ops investigation',
      ],
      commonPitfalls: [
        'No DLQ at all: poison messages block the queue or are silently dropped — both are terrible',
        'Not monitoring DLQ: messages pile up silently — set up alerts on DLQ message count',
        'No replay mechanism: you have to manually re-publish messages — automate this',
        'DLQ without metadata: cannot debug why messages failed without error details, timestamps, retry counts',
      ],
      interviewTips: [
        'Mention DLQ as an essential production pattern — not optional',
        'Discuss the retry → DLQ → fix → replay workflow',
        'Include DLQ monitoring in your system design — it shows operational maturity',
      ],
      relatedConcepts: ['rabbitmq', 'kafka-internals', 'saga-pattern', 'backpressure-in-messaging'],
      difficulty: 'intermediate',
      tags: ['messaging', 'reliability', 'operations'],
      proTip: 'AWS SQS has native DLQ support with configurable maxReceiveCount. When a message fails N times, SQS automatically moves it to the configured DLQ. For Kafka, you must implement DLQ routing yourself — but it is straightforward: catch exceptions, produce to topic.dlq, commit offset.',
    },
    {
      id: 'backpressure-in-messaging',
      title: 'Backpressure in Messaging',
      description: 'When consumers cannot keep up with producers, messages pile up. Backpressure mechanisms signal producers to slow down or shed load before the system collapses. In messaging systems, consumer lag is the primary backpressure indicator.',
      keyPoints: [
        'Consumer lag: the difference between the latest offset and the consumer offset — primary Kafka health metric',
        'Bounded queues: limit queue size — when full, producers block or messages are rejected',
        'Consumer-driven flow control: consumer pulls at its own pace (Kafka) vs broker pushes (RabbitMQ prefetch)',
        'RabbitMQ prefetch: channel.prefetch(N) limits unacknowledged messages — natural backpressure',
        'Kafka consumer lag monitoring: expose via JMX/Prometheus, alert when lag exceeds SLA',
        'Auto-scaling consumers: use lag metric to trigger horizontal scaling of consumer instances',
        'Producer rate limiting: if consumer lag is high, slow down production to prevent unbounded growth',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Consumer Lag Monitoring and Auto-scaling Signal',
          code: `import { Kafka } from 'kafkajs'

const kafka = new Kafka({ brokers: ['kafka:9092'], clientId: 'lag-monitor' })
const admin = kafka.admin()

interface PartitionLag {
  topic: string
  partition: number
  currentOffset: string
  consumerOffset: string
  lag: number
}

async function getConsumerLag(groupId: string): Promise<PartitionLag[]> {
  await admin.connect()

  const description = await admin.describeGroups([groupId])
  const group = description.groups[0]

  const offsets = await admin.fetchOffsets({ groupId })
  const lags: PartitionLag[] = []

  for (const topicOffsets of offsets) {
    const topicMetadata = await admin.fetchTopicOffsets(topicOffsets.topic)

    for (const partition of topicOffsets.partitions) {
      const latestOffset = topicMetadata.find(
        (p) => p.partition === partition.partition
      )
      if (latestOffset) {
        const lag = Number(latestOffset.offset) - Number(partition.offset)
        lags.push({
          topic: topicOffsets.topic,
          partition: partition.partition,
          currentOffset: latestOffset.offset,
          consumerOffset: partition.offset,
          lag,
        })
      }
    }
  }

  await admin.disconnect()
  return lags
}

// Monitoring loop with alerting
async function monitorLag(
  groupId: string,
  warningThreshold: number,
  criticalThreshold: number
): Promise<void> {
  const lags = await getConsumerLag(groupId)
  const totalLag = lags.reduce((sum, l) => sum + l.lag, 0)

  // Expose as Prometheus metric
  consumerLagGauge.set({ group: groupId }, totalLag)

  if (totalLag > criticalThreshold) {
    await alertOps(\`CRITICAL: Consumer group \${groupId} lag is \${totalLag}\`)
    // Signal auto-scaler to add consumers
    await requestScaleUp(groupId)
  } else if (totalLag > warningThreshold) {
    console.warn(\`Consumer group \${groupId} lag: \${totalLag}\`)
  }
}`,
        },
      ],
      useCases: [
        'Kafka consumer lag alerting: page ops when lag exceeds SLA (e.g., > 10 minutes behind)',
        'Auto-scaling: use consumer lag as the scaling metric for Kubernetes HPA',
        'Producer throttling: slow down ingestion when processing cannot keep up',
        'Queue depth monitoring: RabbitMQ management API exposes queue depth as a backpressure signal',
      ],
      commonPitfalls: [
        'Not monitoring consumer lag at all: the system silently falls behind until data is hours stale',
        'Scaling consumers beyond partition count: extra consumers sit idle — scale partitions first',
        'Alert fatigue: setting lag thresholds too tight causes constant alerts — tune to actual SLAs',
      ],
      interviewTips: [
        'Consumer lag is THE metric for Kafka health — mention it prominently',
        'Discuss auto-scaling consumers based on lag as a production pattern',
        'Connect backpressure to capacity planning: if lag grows continuously, you need more consumers or partitions',
      ],
      relatedConcepts: ['kafka-internals', 'dead-letter-queue', 'message-queue-vs-event-streaming'],
      difficulty: 'intermediate',
      tags: ['messaging', 'monitoring', 'scalability'],
    },
    {
      id: 'pub-sub-patterns',
      title: 'Pub/Sub Patterns',
      description: 'Publish/Subscribe decouples producers from consumers through a message broker. Publishers do not know who subscribes; subscribers do not know who publishes. The devil is in the delivery guarantees — at-least-once requires idempotent consumers, exactly-once requires deduplication.',
      keyPoints: [
        'Fan-out: one message delivered to ALL subscribers — every subscriber gets every message',
        'At-least-once delivery: broker ensures delivery but may deliver duplicates — most common guarantee',
        'Idempotent consumers: design to handle duplicate messages safely — use deduplication ID or idempotent operations',
        'Exactly-once with deduplication: store message ID, reject duplicates — shifts complexity to consumer',
        'Topic-based: subscribers subscribe to named topics (Kafka, SNS, Google Pub/Sub)',
        'Content-based: subscribers define filters on message content (RabbitMQ headers exchange, SNS filter policies)',
        'Ordering: pub/sub typically does NOT guarantee global ordering — order within a partition/key only',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Idempotent Consumer with Deduplication',
          code: `import Redis from 'ioredis'
import { Kafka } from 'kafkajs'

const redis = new Redis(process.env.REDIS_URL!)

// Idempotent consumer — handles duplicate deliveries safely
async function processWithDeduplication(
  messageId: string,
  handler: () => Promise<void>
): Promise<boolean> {
  // Check if already processed (using Redis SET NX for atomicity)
  const deduplicationKey = \`processed:\${messageId}\`
  const isNew = await redis.set(deduplicationKey, '1', 'EX', 86400, 'NX')

  if (!isNew) {
    // Already processed — skip (idempotent)
    return false
  }

  try {
    await handler()
    return true
  } catch (error) {
    // Processing failed — remove dedup key so it can be retried
    await redis.del(deduplicationKey)
    throw error
  }
}

// Fan-out with idempotent processing
const kafka = new Kafka({ brokers: ['kafka:9092'], clientId: 'subscriber' })
const consumer = kafka.consumer({ groupId: 'notification-service' })

await consumer.subscribe({ topic: 'user-events' })

await consumer.run({
  eachMessage: async ({ message }) => {
    const messageId = message.headers?.['message-id']?.toString()
      ?? \`\${message.topic}-\${message.partition}-\${message.offset}\`

    const processed = await processWithDeduplication(messageId, async () => {
      const event = JSON.parse(message.value!.toString())

      switch (event.type) {
        case 'user.registered':
          await sendWelcomeEmail(event.data.email)
          break
        case 'user.subscribed':
          await activateSubscription(event.data.userId, event.data.plan)
          break
      }
    })

    if (!processed) {
      console.log(\`Duplicate message \${messageId} — skipped\`)
    }
  },
})`,
        },
      ],
      useCases: [
        'Microservice event distribution: one service publishes, many services consume independently',
        'Notification fan-out: user action triggers email, push notification, analytics, and audit log',
        'Real-time features: WebSocket server subscribes to events for live updates',
        'Cross-service data sync: changes in one service propagated to dependent services',
      ],
      commonPitfalls: [
        'Assuming exactly-once delivery: most pub/sub systems provide at-least-once — you MUST handle duplicates',
        'Not using message IDs: without a stable ID, you cannot deduplicate',
        'Subscriber ordering assumptions: messages may arrive out of order across partitions',
        'Using Redis Pub/Sub for durable messaging: if subscriber is offline, messages are lost — use Streams instead',
      ],
      interviewTips: [
        'Emphasize idempotent consumers as the standard production pattern',
        'Discuss fan-out as the distinguishing characteristic of pub/sub vs point-to-point queues',
        'Mention that Google Cloud Pub/Sub and AWS SNS+SQS are the managed cloud implementations',
      ],
      relatedConcepts: ['event-driven-architecture', 'kafka-internals', 'rabbitmq', 'message-queue-vs-event-streaming'],
      difficulty: 'intermediate',
      tags: ['messaging', 'patterns', 'pub-sub'],
      proTip: 'The SNS + SQS fanout pattern on AWS is the most common pub/sub implementation in the cloud: SNS topic fans out to multiple SQS queues (one per subscriber). Each SQS queue gets its own DLQ, retry policy, and consumption rate. This decouples subscribers completely while giving each one independent scaling and error handling.',
    },
  ],
}
