// @ts-nocheck
import type { Category } from '@/lib/types'

export const realWorldCategory: Category = {
  id: 'real-world',
  title: 'Real-World System Design',
  description: 'Complete end-to-end system designs for interview classics — URL shorteners, social feeds, messaging, ride-sharing, streaming, search, distributed caches, and rate limiters.',
  icon: 'Globe',
  concepts: [
    {
      id: 'url-shortener',
      title: 'URL Shortener (TinyURL / Bitly)',
      description: 'A URL shortener maps a long URL to a short alias (e.g., bit.ly/abc123) and redirects users. The core challenge is generating globally unique short codes at scale while keeping redirect latency under 10ms.',
      keyPoints: [
        'Two approaches to short code generation: (1) hash the URL (MD5/SHA256 → take first 7 chars, handle collisions) or (2) auto-increment counter + base62 encode (no collisions, sequential, requires coordination)',
        'Base62 encoding (a-z, A-Z, 0-9) gives 62^7 = 3.5 trillion unique codes with 7 characters — enough for decades',
        'Counter-based approach needs a distributed counter (Zookeeper, Redis INCR, or pre-allocated ranges per app server) to avoid single point of failure',
        'Hash-based approach can produce collisions — resolve by appending a counter or re-hashing; check DB before writing',
        '301 (permanent) vs 302 (temporary) redirect: 301 is cached by browsers (less load, but you lose analytics); 302 forces every click through your server (enables click tracking)',
        'Read-heavy system: 100:1 read-to-write ratio — reads must be blazing fast, writes can be slightly slower',
        'Cache the top 20% of URLs (Pareto principle) in Redis — cache hit means zero DB lookup on redirect',
        'Analytics: log every redirect event to Kafka, process with Spark/Flink for click counts, geo, referrer, device stats',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Architecture Diagram',
          code: `
  ┌─────────┐    ┌──────────────┐    ┌───────────┐    ┌──────────┐
  │  Client  │───>│   API GW /   │───>│  App      │───>│ Postgres │
  │          │    │   Nginx      │    │  Server   │    │ (writes) │
  └─────────┘    └──────────────┘    └─────┬─────┘    └──────────┘
                                           │
                                     ┌─────▼─────┐
                                     │   Redis    │
                                     │  (cache)   │
                                     └─────┬─────┘
                                           │  miss
                                     ┌─────▼─────┐
                                     │  Postgres  │
                                     │  (reads)   │
                                     └───────────┘

  Write path:
  POST /shorten { url: "https://..." }
    1. Generate short code (counter+base62 or hash)
    2. INSERT INTO urls (short_code, original_url, created_at)
    3. Write-through to Redis cache
    4. Return short URL

  Read path (redirect):
  GET /:shortCode
    1. Check Redis cache → hit → 302 redirect
    2. Cache miss → query Postgres → populate Redis → 302 redirect
    3. Log redirect event to Kafka for analytics`,
        },
        {
          language: 'text',
          label: 'Capacity Estimation',
          code: `
  Assumptions:
  - 100M new URLs/month = ~40 URLs/sec (write)
  - 100:1 read:write ratio = 4,000 redirects/sec (read)
  - Average URL: 500 bytes

  Storage (5 years):
  - 100M * 12 * 5 = 6B URLs
  - 6B * 500 bytes = 3 TB (fits on a single large SSD)

  Short code length:
  - 6B URLs → need at least 7 base62 chars (62^7 = 3.5T > 6B)

  Cache:
  - Top 20% = 1.2B URLs * 500 bytes = 600 GB Redis cluster

  Bandwidth:
  - Write: 40 * 500 bytes = 20 KB/s (negligible)
  - Read: 4,000 * 500 bytes = 2 MB/s (trivial)`,
        },
      ],
      useCases: [
        'Link shortening for social media posts with character limits',
        'Click tracking and analytics for marketing campaigns',
        'Branded short links for companies (e.g., amzn.to, youtu.be)',
        'Deep linking in mobile apps where URL length matters',
      ],
      commonPitfalls: [
        'Using 301 redirects when you need analytics — browsers cache 301s and skip your server entirely',
        'Not handling hash collisions — two different URLs can produce the same 7-char hash prefix',
        'Single-point-of-failure counter — if your counter service dies, no new URLs can be created',
        'Not rate-limiting the create endpoint — abuse can fill your database with spam URLs',
        'Storing analytics in the same database as URLs — analytics writes will overwhelm the URL table',
      ],
      interviewTips: [
        'Start with the API: POST /shorten and GET /:code — this grounds the entire discussion',
        'Discuss both hash and counter approaches, then pick one and justify why',
        'Mention the 301 vs 302 trade-off proactively — it shows depth',
        'Calculate QPS and storage to show the system is feasible on modest hardware',
      ],
      relatedConcepts: ['consistent-hashing', 'cache-aside', 'database-replication'],
      difficulty: 'intermediate',
      tags: ['system-design', 'url-shortener', 'hashing', 'caching'],
      proTip: 'In interviews, the URL shortener is often a warm-up question. The differentiator is depth: discuss analytics pipelines, abuse prevention, and custom alias support to stand out.',
    },
    {
      id: 'twitter-feed',
      title: 'Twitter/X News Feed',
      description: 'Design a social media feed that assembles and ranks posts from followed users in near-real-time. The core challenge is the fanout problem: when a user with 10M followers tweets, how do you deliver that tweet to all followers quickly?',
      keyPoints: [
        'Fanout-on-write (push model): when a user posts, immediately write the tweet to every followers inbox/timeline cache — fast reads, expensive writes for high-follower users',
        'Fanout-on-read (pull model): when a user opens their feed, query all followed users posts and merge — slow reads, cheap writes, works for celebrity accounts',
        'Hybrid approach (Twitter actual): fanout-on-write for normal users, fanout-on-read for celebrities (>500K followers) — the "celebrity problem" solution',
        'Timeline cache: each user has a pre-computed timeline stored in Redis (sorted set by timestamp) — O(1) read latency',
        'Tweet storage: Cassandra or DynamoDB for high-throughput writes, partitioned by user_id',
        'Media storage: images/videos go to S3/object store, tweet stores only the media URL',
        'Feed ranking: chronological base with ML re-ranking (engagement prediction, recency, affinity score)',
        'Social graph: who-follows-whom stored in a graph database or adjacency list in Redis for fast lookups',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Architecture Diagram',
          code: `
  WRITE PATH (posting a tweet):
  ┌────────┐    ┌───────────┐    ┌──────────────┐
  │ Client │───>│ Tweet API │───>│ Tweet Store  │ (Cassandra)
  └────────┘    └─────┬─────┘    └──────────────┘
                      │
                      ▼
               ┌──────────────┐    ┌──────────────┐
               │ Fanout       │───>│ Timeline     │ (Redis sorted sets)
               │ Service      │    │ Cache        │ per-user inbox
               └──────┬───────┘    └──────────────┘
                      │
                      ▼
               ┌──────────────┐
               │ Social Graph │ (who follows whom)
               └──────────────┘

  READ PATH (loading feed):
  ┌────────┐    ┌───────────┐    ┌──────────────┐
  │ Client │───>│ Feed API  │───>│ Timeline     │
  └────────┘    └─────┬─────┘    │ Cache (Redis)│
                      │          └──────────────┘
                      │ celebrity tweets
                      ▼
               ┌──────────────┐
               │ Tweet Store  │ (on-demand merge)
               └──────────────┘

  CELEBRITY PROBLEM:
  - User A (50 followers) posts → fanout to 50 timelines ✓
  - Celebrity (10M followers) posts → fanout to 10M timelines ✗ too slow
  - Solution: skip fanout for celebrities, merge their tweets at read time`,
        },
        {
          language: 'text',
          label: 'Capacity Estimation',
          code: `
  Assumptions:
  - 500M users, 200M DAU
  - Each user follows ~200 accounts
  - 500M tweets/day = ~6,000 tweets/sec
  - Average tweet: 280 chars + metadata = ~1 KB
  - Media: 10% of tweets have images = 50M images/day

  Fanout volume:
  - Average followers: 200
  - 500M tweets * 200 avg followers = 100B timeline writes/day
  - = 1.15M timeline writes/sec (Redis can handle this across a cluster)

  Storage (tweet text, 5 years):
  - 500M * 365 * 5 * 1 KB = 912 TB (Cassandra cluster)

  Timeline cache:
  - 200M DAU * 800 tweets cached * 8 bytes (tweet_id) = 1.28 TB Redis`,
        },
      ],
      useCases: [
        'Social media platforms with follower-based feeds (Twitter, Instagram, Threads)',
        'Activity streams in enterprise tools (Slack channels, GitHub notifications)',
        'Content recommendation feeds with real-time updates',
      ],
      commonPitfalls: [
        'Pure fanout-on-write for all users — a celebrity tweeting would generate billions of writes and lag the system',
        'Pure fanout-on-read for all users — feed load times become unacceptable when following hundreds of accounts',
        'Not separating media storage from tweet storage — storing blobs in the database kills throughput',
        'Ignoring cache invalidation — deleted or edited tweets must be removed from millions of cached timelines',
        'Building a real-time feed without a ranking layer — chronological feeds lose to engagement-ranked feeds in practice',
      ],
      interviewTips: [
        'Always discuss all three fanout strategies and explain why hybrid wins',
        'Define the celebrity threshold explicitly (e.g., >500K followers) to show you have thought about the cutoff',
        'Mention that Twitter actually uses this hybrid approach — it adds credibility',
        'Discuss how timeline cache works: Redis sorted set keyed by user_id, scored by timestamp',
      ],
      relatedConcepts: ['message-queues', 'database-partitioning', 'cache-aside'],
      difficulty: 'advanced',
      tags: ['system-design', 'social-media', 'fanout', 'feed-ranking'],
      proTip: 'The celebrity problem is the central insight. Interviewers want to hear you identify it unprompted and propose the hybrid solution. Practice explaining it in under 60 seconds.',
    },
    {
      id: 'whatsapp-messaging',
      title: 'WhatsApp Messaging System',
      description: 'Design a real-time messaging system supporting 1:1 and group chats with message ordering, delivery receipts, end-to-end encryption, and offline message delivery for 2B+ users.',
      keyPoints: [
        'Message ordering: use Kafka partitioned by conversation_id to guarantee order within a chat; Cassandra for persistent storage with (conversation_id, message_id) as partition/clustering key',
        'WebSocket connections: each user maintains a persistent WebSocket to a chat server; connection registry maps user_id → server_id for routing',
        'Presence service: heartbeat-based (client pings every 30s); store last_seen in Redis with TTL — no explicit offline notification needed',
        'End-to-end encryption: Signal Protocol — each device has a public/private key pair; messages encrypted on sender device, decrypted on receiver; server never sees plaintext',
        'Push notifications: if recipient is offline (no active WebSocket), queue the message and trigger APNs/FCM push notification',
        'Message delivery receipts: single check (delivered to server), double check (delivered to device), blue check (read by recipient) — track via ack messages',
        'Group messaging: fan out to all group members via the chat server; small groups (<256) use direct fanout, large groups use pub/sub',
        'Media handling: client uploads encrypted media to S3, sends the decryption key + S3 URL in the message — server stores only encrypted blobs',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Architecture Diagram',
          code: `
  ┌──────────┐  WebSocket  ┌──────────────┐
  │ Client A │────────────>│  Chat Server │
  └──────────┘             │  (stateful)  │
                           └──────┬───────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼              ▼
             ┌──────────┐ ┌───────────┐  ┌────────────┐
             │  Kafka   │ │ Connection│  │  Presence  │
             │ (ordered │ │ Registry  │  │  Service   │
             │  queue)  │ │ (Redis)   │  │  (Redis)   │
             └────┬─────┘ └───────────┘  └────────────┘
                  │
                  ▼
           ┌────────────┐     ┌──────────────┐
           │ Cassandra  │     │  Push        │
           │ (messages) │     │  Notification│
           └────────────┘     │  (APNs/FCM)  │
                              └──────────────┘

  Message flow (A sends to B):
  1. Client A encrypts message with B's public key
  2. Sends via WebSocket to Chat Server
  3. Chat Server writes to Kafka (partition = conversation_id)
  4. Consumer reads from Kafka, writes to Cassandra
  5. Lookup B's chat server from Connection Registry
  6. If B online: route to B's chat server → WebSocket → Client B
  7. If B offline: store message, send push notification via APNs/FCM
  8. When B comes online: fetch undelivered messages from Cassandra`,
        },
        {
          language: 'text',
          label: 'Capacity Estimation',
          code: `
  Assumptions:
  - 2B users, 500M DAU
  - 40 messages/day per active user
  - Average message: 100 bytes (text) or 200 KB (media)

  Message volume:
  - 500M * 40 = 20B messages/day = 230K messages/sec
  - Text storage: 20B * 100 bytes = 2 TB/day
  - Media: 10% have media = 2B * 200 KB = 400 TB/day (object store)

  Connections:
  - 500M concurrent WebSocket connections
  - At 50K connections per server = 10,000 chat servers

  Kafka:
  - 230K msg/sec across ~1000 partitions
  - Partitioned by conversation_id for ordering guarantee`,
        },
      ],
      useCases: [
        'Consumer messaging apps (WhatsApp, Telegram, Signal)',
        'In-app chat features for marketplaces and support',
        'Real-time collaboration tools with message history',
      ],
      commonPitfalls: [
        'Using HTTP polling instead of WebSockets — adds latency and wastes bandwidth for real-time messaging',
        'Storing messages in a relational database — write throughput cannot keep up at 230K msg/sec; use Cassandra or similar',
        'Not partitioning Kafka by conversation_id — messages within a chat arrive out of order',
        'Implementing E2E encryption on the server side — defeats the purpose; encryption/decryption must happen on client devices only',
        'Sending push notifications for every message in an active conversation — users get spammed; only notify when offline',
      ],
      interviewTips: [
        'Start with the WebSocket connection model — it is the foundation of all real-time messaging',
        'Draw the message flow for both online and offline recipients separately',
        'Explain E2E encryption at a high level (Signal Protocol, key exchange) — you do not need to know the crypto details',
        'Mention that message ordering is guaranteed per-conversation (Kafka partition), not globally',
      ],
      relatedConcepts: ['message-queues', 'websockets', 'pub-sub', 'encryption-at-rest'],
      difficulty: 'advanced',
      tags: ['system-design', 'messaging', 'real-time', 'encryption'],
      proTip: 'WhatsApp runs on just ~50 Erlang servers for their chat backend. The secret is Erlang/BEAM VM which handles millions of lightweight processes per server. Mention this to show you know the real-world implementation.',
    },
    {
      id: 'uber-ride-sharing',
      title: 'Uber Ride-Sharing Platform',
      description: 'Design a ride-sharing system that matches riders with nearby drivers in real-time, handles geospatial queries at scale, implements surge pricing, and tracks driver locations with sub-second updates.',
      keyPoints: [
        'Geospatial indexing: divide the world into cells using geohash (base32 grid), S2 geometry (Google, hierarchical cells on a sphere), or H3 (Uber, hexagonal grid) — enables O(1) lookup of nearby drivers',
        'Driver location updates: drivers send GPS coordinates every 3-4 seconds; store in Redis with geohash as key for fast spatial queries',
        'Matching algorithm: when a ride is requested, find all available drivers within radius R, rank by (distance, ETA, rating, acceptance rate), offer to top candidate with timeout',
        'Surge pricing: divide city into zones; when demand/supply ratio exceeds threshold, apply multiplier; use a sliding window counter to measure demand in each zone',
        'Trip lifecycle: REQUEST → MATCHED → DRIVER_EN_ROUTE → ARRIVED → IN_TRIP → COMPLETED — each state transition is an event in Kafka',
        'ETA calculation: precomputed shortest paths using road graph (OSRM or Google Maps API), adjusted for real-time traffic data',
        'Supply positioning: predict demand using historical patterns + ML, incentivize drivers to move to high-demand areas before surges happen',
        'Payment: calculate fare at trip end (base + distance + time + surge), charge rider, hold payout for driver — two-phase settlement',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Architecture Diagram',
          code: `
  ┌──────────┐         ┌──────────────┐
  │  Rider   │────────>│   API GW     │
  │  App     │         │  (Nginx/Kong)│
  └──────────┘         └──────┬───────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                     ▼
  ┌──────────────┐   ┌──────────────┐    ┌──────────────┐
  │  Ride        │   │  Location    │    │   Pricing    │
  │  Service     │   │  Service     │    │   Service    │
  │ (matching)   │   │ (GPS ingest) │    │   (surge)    │
  └──────┬───────┘   └──────┬───────┘    └──────────────┘
         │                   │
         ▼                   ▼
  ┌──────────────┐   ┌──────────────┐    ┌──────────────┐
  │  Postgres    │   │   Redis      │    │    Kafka     │
  │ (trips,users)│   │ (driver locs)│    │ (events)     │
  └──────────────┘   └──────────────┘    └──────────────┘

  ┌──────────┐  GPS every 3s  ┌──────────────┐
  │  Driver  │───────────────>│  Location    │
  │  App     │                │  Service     │
  └──────────┘                └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │ Redis GeoSet │
                              │ GEOADD city  │
                              │ lng lat id   │
                              └──────────────┘

  Matching flow:
  1. Rider requests ride at (lat, lng)
  2. GEORADIUS query on Redis → nearby available drivers
  3. Rank by ETA (road-distance, not straight-line)
  4. Offer to top driver (15s timeout)
  5. If declined/timeout → offer to next driver
  6. If accepted → create trip, notify rider`,
        },
        {
          language: 'text',
          label: 'Capacity Estimation',
          code: `
  Assumptions:
  - 5M drivers active, 20M riders DAU
  - 15M trips/day = 175 trips/sec
  - Driver location update: every 4 seconds

  Location ingestion:
  - 5M drivers * (1 update / 4 sec) = 1.25M updates/sec
  - Each update: ~50 bytes (driver_id, lat, lng, timestamp)
  - Redis GEOADD handles ~100K ops/sec per shard → need ~15 shards

  Matching queries:
  - 175 GEORADIUS queries/sec (one per ride request)
  - Each query searches ~5km radius → returns ~50-200 drivers
  - Redis GEORADIUS is O(N+log(N)) — sub-millisecond for small result sets

  Storage:
  - Trip records: 15M/day * 1 KB = 15 GB/day = 5.5 TB/year`,
        },
      ],
      useCases: [
        'Ride-sharing platforms (Uber, Lyft, Grab, Ola)',
        'Food delivery with driver/courier tracking (DoorDash, Deliveroo)',
        'Fleet management and logistics with real-time vehicle tracking',
      ],
      commonPitfalls: [
        'Using straight-line distance for matching instead of road distance/ETA — a driver 1km away across a river may be 15 minutes away',
        'Storing driver locations in a relational database — cannot handle 1M+ writes/sec; use Redis GeoSet',
        'Global surge pricing instead of zone-based — causes oscillation where all drivers move to surge zone, supply floods, surge drops, drivers leave, repeat',
        'Not handling the race condition where two riders match the same driver — use optimistic locking or a dispatch queue',
        'Polling for driver location instead of streaming — wastes bandwidth and adds latency',
      ],
      interviewTips: [
        'Lead with the geospatial indexing choice (geohash vs S2 vs H3) and explain trade-offs',
        'Draw the matching flow step-by-step, including the driver offer timeout and retry',
        'Mention Uber uses H3 (hexagonal grid) for spatial indexing — it avoids edge distortion of square grids',
        'Discuss surge pricing as a supply/demand feedback loop, not just a multiplier',
      ],
      relatedConcepts: ['consistent-hashing', 'pub-sub', 'rate-limiting'],
      difficulty: 'advanced',
      tags: ['system-design', 'geospatial', 'real-time', 'matching'],
      proTip: 'Uber open-sourced H3 (their hexagonal hierarchical geospatial indexing system). Hexagons avoid the neighbor-size distortion of square grids — every neighbor is equidistant from the center. This is a great detail to drop in interviews.',
    },
    {
      id: 'netflix-streaming',
      title: 'Netflix Video Streaming',
      description: 'Design a video streaming platform that delivers content to 200M+ users worldwide with adaptive bitrate, a global CDN strategy, a transcoding pipeline, and a recommendation engine.',
      keyPoints: [
        'CDN strategy: Netflix uses Open Connect — custom CDN appliances deployed inside ISPs; content is pre-positioned during off-peak hours, so 95% of traffic never crosses the internet backbone',
        'Adaptive bitrate streaming (ABR): HLS (Apple) or DASH (open standard) — video is chunked into 2-10 second segments at multiple bitrates; client switches quality based on bandwidth',
        'Transcoding pipeline: each video is encoded into ~1,200 versions (different resolutions, bitrates, codecs, audio tracks) using a distributed encoding farm; takes hours per title',
        'Content catalog: metadata service stores title info, artwork, subtitles; served from a highly available cache layer',
        'Recommendation engine: collaborative filtering (users who watched X also watched Y) + content-based (genre, actors, director) + contextual (time of day, device, viewing history)',
        'Playback: client requests manifest file → selects initial bitrate → streams chunks → monitors bandwidth → adjusts quality up/down seamlessly',
        'DRM: Widevine (Android/Chrome), FairPlay (Apple), PlayReady (Windows) — content is encrypted, decryption key delivered securely to authorized clients',
        'Microservices: Netflix runs ~1,000 microservices on AWS; control plane (API, auth, billing) runs in AWS regions; content delivery runs on Open Connect CDN',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Architecture Diagram',
          code: `
  CONTROL PLANE (AWS):
  ┌────────┐    ┌───────────┐    ┌──────────────┐    ┌──────────┐
  │ Client │───>│  API GW   │───>│  Microsvcs   │───>│ Postgres │
  │        │    │ (Zuul)    │    │ (auth, user, │    │ Cassandra│
  └────────┘    └───────────┘    │  billing)    │    │ (NoSQL)  │
                                 └──────────────┘    └──────────┘

  DATA PLANE (Open Connect CDN):
  ┌────────┐    ┌───────────────┐    ┌──────────────┐
  │ Client │───>│  ISP CDN Node │───>│  If miss:    │
  │        │    │  (Open Connect│    │  Origin in   │
  └────────┘    │   Appliance)  │    │  AWS S3      │
                └───────────────┘    └──────────────┘

  TRANSCODING PIPELINE:
  ┌───────────┐    ┌──────────────┐    ┌──────────────┐
  │  Ingest   │───>│  Encoding    │───>│  Quality     │
  │  (upload  │    │  Farm        │    │  Check       │
  │  master)  │    │ (distributed)│    │  (VMAF score)│
  └───────────┘    └──────────────┘    └──────┬───────┘
                                              │
                                       ┌──────▼───────┐
                                       │  CDN Push    │
                                       │  (pre-warm   │
                                       │   to ISPs)   │
                                       └──────────────┘

  PLAYBACK FLOW:
  1. Client requests playback → API returns manifest URL
  2. Client fetches manifest (list of bitrate/resolution options)
  3. Client picks initial quality based on device + bandwidth
  4. Streams 2-10s chunks, monitors throughput
  5. Bitrate adaptation: buffer low → downshift, buffer full → upshift`,
        },
        {
          language: 'text',
          label: 'Capacity Estimation',
          code: `
  Assumptions:
  - 200M subscribers, 100M concurrent during peak
  - Average stream: 5 Mbps (1080p)
  - Average session: 1.5 hours

  Peak bandwidth:
  - 100M * 5 Mbps = 500 Pbps (petabits/sec) — why CDN inside ISPs is mandatory
  - Open Connect serves 95% → only 25 Pbps crosses the backbone

  Storage:
  - 15,000 titles * 1,200 encodings * avg 5 GB = 90 PB total
  - Distributed across ISP CDN nodes (not all content on every node)

  Transcoding:
  - New content: ~100 titles/week
  - Each title: 1,200 encodes * avg 30 min/encode = 600 compute-hours
  - Parallelized across encoding farm → done in ~2-4 hours wall time

  Recommendation:
  - 200M user profiles * feature vectors
  - Model retrained daily on viewing history (petabytes of event data)`,
        },
      ],
      useCases: [
        'Video streaming platforms (Netflix, Disney+, YouTube, Prime Video)',
        'Live streaming with adaptive quality (Twitch, YouTube Live)',
        'Enterprise video delivery for training and communications',
      ],
      commonPitfalls: [
        'Serving video from a central origin — latency and bandwidth costs are astronomical; you MUST use CDN',
        'Single-bitrate encoding — users on slow connections get buffering; users on fast connections get potato quality',
        'Not pre-positioning content at edge nodes — cache misses during peak hours overwhelm the origin',
        'Encoding everything at the same quality — animated content needs fewer bits than live action; use per-title encoding optimization',
        'Building your own CDN before you need to — use Cloudflare/Akamai until you reach Netflix scale',
      ],
      interviewTips: [
        'Separate control plane (AWS) from data plane (CDN) — this is the key architectural insight',
        'Explain adaptive bitrate in terms of the manifest file and chunk-based switching',
        'Mention Open Connect and ISP peering to show you know how Netflix actually works',
        'Discuss the transcoding pipeline as a batch processing system, not real-time',
      ],
      relatedConcepts: ['cdn-caching', 'horizontal-vs-vertical-scaling', 'batch-processing'],
      difficulty: 'advanced',
      tags: ['system-design', 'streaming', 'cdn', 'video'],
      proTip: 'Netflix invented "per-title encoding" — they analyze each title and allocate bitrate based on visual complexity. A cartoon needs fewer bits than an action movie at the same perceptual quality. This saved them 20% bandwidth.',
    },
    {
      id: 'google-search',
      title: 'Google Search Engine',
      description: 'Design a web search engine that crawls billions of pages, builds an inverted index, ranks results using link analysis (PageRank) and relevance scoring, and returns results in under 200ms.',
      keyPoints: [
        'Web crawling: distributed crawler (Googlebot) fetches pages using a URL frontier (priority queue); politeness rules (robots.txt, crawl rate limits per domain); BFS with priority for important domains',
        'Inverted index: maps each word to a list of (document_id, position, frequency) tuples; stored in a distributed sorted structure; the core data structure enabling search',
        'PageRank intuition: a pages importance is determined by how many important pages link to it — iterative algorithm that converges after ~50 iterations on the entire web graph',
        'Query processing pipeline: tokenize → spell correct → expand synonyms → lookup inverted index → intersect posting lists → score (BM25 + PageRank + freshness + personalization) → rank → return top 10',
        'Spell correction: use edit distance (Levenshtein), n-gram overlap, and query log mining ("did you mean") — most users cannot spell technical terms correctly',
        'Index serving: the index is sharded by document (each shard has a subset of all docs) and replicated; a query hits all shards in parallel, results are merged',
        'Freshness: important pages are re-crawled frequently (CNN homepage every few minutes); long-tail pages are crawled weekly or monthly based on change frequency',
        'Snippet generation: extract the most relevant passage from the document that matches the query — done at query time, not at index time',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Architecture Diagram',
          code: `
  INDEXING PIPELINE (offline, batch):
  ┌───────────┐    ┌──────────────┐    ┌──────────────┐
  │  URL      │───>│  Distributed │───>│  Document    │
  │  Frontier │    │  Crawler     │    │  Store       │
  │ (priority │    │  (Googlebot) │    │  (raw HTML)  │
  │  queue)   │    └──────────────┘    └──────┬───────┘
  └───────────┘                               │
                                        ┌─────▼───────┐
                                        │  Parser /   │
                                        │  Tokenizer  │
                                        └─────┬───────┘
                                              │
                                  ┌───────────┴───────────┐
                                  ▼                       ▼
                           ┌──────────────┐       ┌──────────────┐
                           │  Inverted    │       │  PageRank    │
                           │  Index       │       │  (link graph │
                           │  Builder     │       │   analysis)  │
                           └──────────────┘       └──────────────┘

  QUERY SERVING (online, real-time):
  ┌────────┐    ┌───────────┐    ┌──────────────┐
  │ Client │───>│  Query    │───>│  Spell Check │
  └────────┘    │  Frontend │    │  + Synonyms  │
                └───────────┘    └──────┬───────┘
                                        │
                                 ┌──────▼───────┐
                                 │  Index       │
                                 │  Shards      │
                                 │  (parallel   │
                                 │   scatter-   │
                                 │   gather)    │
                                 └──────┬───────┘
                                        │
                                 ┌──────▼───────┐
                                 │  Ranker      │
                                 │  (BM25 +     │
                                 │  PageRank +  │
                                 │  freshness)  │
                                 └──────┬───────┘
                                        │
                                 ┌──────▼───────┐
                                 │  Snippet Gen │
                                 │  + Top 10    │
                                 └──────────────┘`,
        },
        {
          language: 'text',
          label: 'Capacity Estimation',
          code: `
  Assumptions:
  - 100B indexed pages
  - 100K search queries/sec (8.5B queries/day)
  - Average query: 3 words

  Crawling:
  - Re-crawl 1% of web daily = 1B pages/day = 11,500 pages/sec
  - At 500 KB avg page size = 5.75 GB/sec crawl bandwidth

  Inverted index:
  - 100B pages * avg 1,000 unique words = 100T postings
  - Each posting: ~12 bytes (doc_id + position + freq)
  - Raw index: ~1.2 PB (compressed to ~400 TB with variable-byte encoding)

  Index shards:
  - 400 TB / 1 TB per shard = 400 shards (each replicated 3x)

  Query latency budget:
  - Spell check: 5ms
  - Index lookup (parallel across shards): 50ms
  - Scoring and ranking: 30ms
  - Snippet generation: 20ms
  - Network overhead: 20ms
  - Total: ~125ms (under 200ms target)`,
        },
      ],
      useCases: [
        'General web search engines (Google, Bing, DuckDuckGo)',
        'Enterprise search across internal documents and knowledge bases',
        'E-commerce product search with relevance ranking',
      ],
      commonPitfalls: [
        'Crawling without respecting robots.txt — gets you blocked and is unethical',
        'Building a forward index (document → words) instead of an inverted index (word → documents) — forward index requires scanning every document for every query',
        'Not handling duplicate/near-duplicate pages — the web has massive duplication that wastes storage and confuses ranking',
        'Scoring only by keyword match (TF-IDF) without link analysis — keyword stuffing would dominate results',
        'Serial query processing across shards instead of parallel scatter-gather — latency becomes O(N) instead of O(1)',
      ],
      interviewTips: [
        'Split the design into two clear phases: offline indexing pipeline and online query serving',
        'Explain the inverted index with a concrete example: "cat" → [(doc1, pos3, freq2), (doc7, pos1, freq5)]',
        'Describe PageRank intuitively as "voting" — a link from page A to B is a vote, and votes from important pages count more',
        'Mention the scatter-gather pattern for parallel index lookup across shards',
      ],
      relatedConcepts: ['mapreduce', 'distributed-storage', 'inverted-index'],
      difficulty: 'expert',
      tags: ['system-design', 'search', 'indexing', 'ranking'],
      proTip: 'Google no longer uses raw PageRank as a primary signal — they use hundreds of ranking signals including BERT for query understanding. But PageRank is still the canonical interview answer because it demonstrates graph algorithms and iterative computation.',
    },
    {
      id: 'distributed-cache',
      title: 'Distributed Cache (Memcached / Redis Cluster)',
      description: 'Design a distributed caching system that provides sub-millisecond lookups across multiple nodes, handles node failures gracefully, and solves the hot key problem — the backbone of every high-throughput system.',
      keyPoints: [
        'Consistent hashing: maps both keys and servers onto a hash ring; a key is stored on the first server clockwise from its position; adding/removing a server only redistributes ~1/N of keys',
        'Virtual nodes: each physical server gets multiple positions on the hash ring (e.g., 150 vnodes) to ensure even key distribution — without vnodes, servers with adjacent hash positions get disproportionate load',
        'Quorum reads/writes: with replication factor N, require W writes and R reads where R+W>N to guarantee consistency; (W=1, R=N) for fast writes; (W=N, R=1) for fast reads; (W=2, R=2, N=3) for balanced',
        'Hot key problem: a single popular key (e.g., celebrity profile, trending tweet) overwhelms one cache node; solutions: client-side caching, read replicas for hot keys, key splitting (append random suffix to distribute across nodes)',
        'Cache warming: on deployment or node replacement, the new node has an empty cache causing a miss storm; pre-populate from the database or peer nodes before routing traffic',
        'Eviction policies: LRU (most common), LFU (frequency-based), TTL (time-based expiry), random (surprisingly effective for uniform access patterns)',
        'Cache stampede: many clients simultaneously miss the same key and all query the database; solutions: mutex lock (only one client fetches), probabilistic early expiration, stale-while-revalidate',
        'Split-brain: network partition causes two halves of the cache cluster to diverge; use gossip protocol or a coordination service (ZooKeeper) for membership and failure detection',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Architecture Diagram',
          code: `
  CONSISTENT HASH RING:
            Server A (vnode 1)
               ╱
        ──────●──────
       ╱               ╲
  Server C           Server A
  (vnode 2) ●         ● (vnode 2)
       ╲               ╱
        ──────●──────
               ╲
            Server B (vnode 1)

  Key "user:123" hashes to position X on the ring
  → Walk clockwise → first server = primary
  → Next 2 servers = replicas (N=3)

  CLIENT → CACHE CLUSTER:
  ┌────────┐    ┌──────────────────────────┐
  │ Client │───>│  Client-side consistent  │
  │        │    │  hash → pick server      │
  └────────┘    └──────────┬───────────────┘
                           │
              ┌────────────┼────────────────┐
              ▼            ▼                ▼
       ┌──────────┐ ┌──────────┐    ┌──────────┐
       │ Cache    │ │ Cache    │    │ Cache    │
       │ Node A   │ │ Node B   │    │ Node C   │
       │ (primary │ │ (replica │    │ (replica │
       │  + vnodes│ │  + vnodes│    │  + vnodes│
       └──────────┘ └──────────┘    └──────────┘

  HOT KEY MITIGATION:
  Key "trending:tweet:456" is hot
  → Split into: "trending:tweet:456:0", ":1", ":2", ... ":9"
  → Client appends random(0-9) to key
  → 10 different keys → distributed across ~10 different nodes
  → Read: fetch from random suffix, all have same data`,
        },
        {
          language: 'text',
          label: 'Capacity Estimation',
          code: `
  Assumptions:
  - 10M cached objects, average 1 KB each
  - 500K reads/sec, 50K writes/sec
  - Replication factor: 3
  - Target: <1ms p99 read latency

  Memory:
  - 10M * 1 KB = 10 GB per replica
  - With N=3 replication: 30 GB total
  - Per node (5 nodes): 6 GB — easily fits in memory

  Throughput:
  - Redis single node: ~100K ops/sec
  - 500K reads → need 5+ nodes (or 3 nodes with read replicas)
  - 50K writes → need W=2 quorum writes to 2 of 3 replicas

  Consistent hashing rebalance:
  - Add 1 node to 5-node cluster → only ~20% of keys move
  - Without consistent hashing → ~80% of keys would remap (modular hash)

  Virtual nodes:
  - 5 physical * 150 vnodes = 750 points on the ring
  - Standard deviation of load drops from ~50% to ~5% with vnodes`,
        },
      ],
      useCases: [
        'Session storage for stateless web applications',
        'Database query result caching to reduce read load',
        'API response caching for high-traffic endpoints',
        'Leaderboard and counter storage (Redis sorted sets)',
      ],
      commonPitfalls: [
        'Using modular hashing (key % N) — adding or removing a server remaps almost all keys, causing a cache avalanche',
        'No virtual nodes — one server with a bad hash position gets 3x the load of others',
        'Setting R=1, W=1 — no consistency guarantee; a stale replica can serve outdated data indefinitely',
        'Ignoring hot keys — one viral piece of content takes down the entire cache node it lives on',
        'Not implementing cache warming — deploying a new node with an empty cache creates a temporary database overload',
      ],
      interviewTips: [
        'Draw the consistent hash ring and walk through adding/removing a node',
        'Explain the R+W>N quorum formula and how different configurations trade off latency vs consistency',
        'Have a concrete hot key solution ready — key splitting with random suffix is the simplest to explain',
        'Mention that Memcached uses client-side consistent hashing while Redis Cluster uses hash slots (16384 slots)',
      ],
      relatedConcepts: ['consistent-hashing', 'cache-aside', 'cache-stampede', 'replication'],
      difficulty: 'advanced',
      tags: ['system-design', 'caching', 'distributed-systems', 'consistent-hashing'],
      proTip: 'Redis Cluster does NOT use consistent hashing — it uses 16,384 hash slots with a CRC16 hash. This is a deterministic mapping that is simpler to reason about than a ring. Know the difference for interviews.',
    },
    {
      id: 'rate-limiter',
      title: 'Rate Limiter Service',
      description: 'Design a distributed rate limiter that protects APIs from abuse and ensures fair usage — implementing sliding window counters and token buckets in Redis with Lua scripts for atomicity.',
      keyPoints: [
        'Token bucket: bucket holds up to B tokens; tokens added at rate R/sec; each request consumes 1 token; if bucket empty, request rejected — allows bursts up to B, sustained rate R',
        'Sliding window counter: use Redis ZADD to add timestamped entries to a sorted set; ZREMRANGEBYSCORE to remove entries outside the window; ZCARD to count — accurate but uses more memory',
        'Fixed window counter: simple increment in Redis per time window (e.g., per minute); problem: boundary bursts (60 requests at 0:59 + 60 at 1:00 = 120 in 2 seconds)',
        'Sliding window log: store every request timestamp; most accurate but O(N) space per client — impractical at scale',
        'Lua scripts for atomicity: Redis executes Lua atomically (no interleaving); critical for check-and-increment to avoid race conditions between checking the count and incrementing it',
        'Distributed rate limiting: each API server checks the same Redis cluster; use Redis key = "rate:{client_id}:{resource}" with TTL matching the window size',
        'Response headers: include X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset so clients can self-throttle',
        'Multi-tier limiting: combine per-user (100 req/min), per-IP (1000 req/min), and global (50K req/min) limits for defense in depth',
      ],
      codeExamples: [
        {
          language: 'text',
          label: 'Architecture Diagram',
          code: `
  ┌────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
  │ Client │───>│   API GW /   │───>│  Rate Limit  │───>│  API     │
  │        │    │   Nginx      │    │  Middleware   │    │  Server  │
  └────────┘    └──────────────┘    └──────┬───────┘    └──────────┘
                                           │
                                    ┌──────▼───────┐
                                    │    Redis     │
                                    │  (counters)  │
                                    └──────────────┘

  Rate limit decision flow:
  1. Extract client identifier (API key, user_id, IP)
  2. Build Redis key: "rate:{client_id}:{endpoint}"
  3. Execute Lua script atomically:
     a. Remove entries outside sliding window
     b. Count entries in window
     c. If count < limit: add new entry, return ALLOWED
     d. If count >= limit: return REJECTED
  4. Set response headers (Limit, Remaining, Reset)
  5. If REJECTED: return 429 Too Many Requests

  TOKEN BUCKET IN REDIS:
  Key: "bucket:{client_id}"
  Value: { tokens: float, last_refill: timestamp }

  On each request (Lua script):
  1. GET bucket → { tokens, last_refill }
  2. elapsed = now - last_refill
  3. tokens = min(max_tokens, tokens + elapsed * refill_rate)
  4. if tokens >= 1: tokens -= 1, SET bucket, return ALLOW
  5. else: return REJECT with retry_after header`,
        },
        {
          language: 'text',
          label: 'Sliding Window Counter — Redis Lua Script',
          code: `
  -- Sliding window rate limiter using Redis sorted set
  -- KEYS[1] = rate limit key (e.g., "rate:user123:/api/data")
  -- ARGV[1] = window size in milliseconds (e.g., 60000 for 1 minute)
  -- ARGV[2] = max requests allowed in window
  -- ARGV[3] = current timestamp in milliseconds
  -- ARGV[4] = unique request ID (e.g., UUID)

  local key = KEYS[1]
  local window = tonumber(ARGV[1])
  local limit = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local request_id = ARGV[4]

  -- Remove entries outside the sliding window
  redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

  -- Count remaining entries
  local count = redis.call('ZCARD', key)

  if count < limit then
    -- Under limit: add this request and allow
    redis.call('ZADD', key, now, request_id)
    redis.call('PEXPIRE', key, window)
    return { 1, limit - count - 1 }  -- { allowed, remaining }
  else
    -- Over limit: reject
    return { 0, 0 }  -- { rejected, remaining }
  end`,
        },
        {
          language: 'text',
          label: 'Capacity Estimation',
          code: `
  Assumptions:
  - 10M API clients
  - 1% active in any given minute = 100K clients
  - Rate limit: 100 requests/minute per client
  - Sliding window implementation

  Redis memory (sorted set approach):
  - Each entry in sorted set: ~50 bytes (member + score)
  - Max 100 entries per client (at limit)
  - 100K active clients * 100 entries * 50 bytes = 500 MB
  - With overhead: ~1 GB Redis (single node is sufficient)

  Redis throughput:
  - 100K clients * 100 req/min / 60 = ~167K rate-check ops/sec
  - Each check: 1 ZREMRANGEBYSCORE + 1 ZCARD + 1 ZADD = 3 commands
  - But executed as 1 Lua script = 1 op
  - Redis handles 100K+ Lua evals/sec easily

  Latency:
  - Redis Lua eval: <1ms
  - Network to Redis: <1ms (co-located)
  - Total rate limit overhead: <2ms per request`,
        },
      ],
      useCases: [
        'API gateway rate limiting to protect backend services from abuse',
        'Login attempt throttling to prevent brute-force attacks',
        'Webhook delivery rate limiting to respect downstream service capacity',
        'Multi-tenant SaaS API with per-tier rate limits (free: 100/min, pro: 10K/min)',
      ],
      commonPitfalls: [
        'Using fixed window counters — allows 2x burst at window boundaries (59th second + 1st second of next window)',
        'Check-then-increment without atomicity — race condition where concurrent requests all pass the check before any increment',
        'Per-server rate limiting instead of distributed (Redis) — clients bypass limits by hitting different servers',
        'Not including rate limit headers in 429 responses — clients cannot self-regulate without knowing their remaining quota',
        'Using sliding window log (storing every timestamp) for high-throughput APIs — memory grows linearly with request rate',
      ],
      interviewTips: [
        'Compare token bucket vs sliding window: token bucket allows bursts (good for APIs), sliding window is stricter (good for security)',
        'Explain why Lua scripts are critical — Redis is single-threaded but multiple clients can interleave between GET and SET without Lua',
        'Walk through the ZADD + ZREMRANGEBYSCORE + ZCARD pattern step by step',
        'Mention that Cloudflare, Stripe, and GitHub all use sliding window counters in production',
      ],
      relatedConcepts: ['token-bucket', 'api-gateway', 'redis-data-structures'],
      difficulty: 'intermediate',
      tags: ['system-design', 'rate-limiting', 'redis', 'distributed-systems'],
      proTip: 'Stripe uses a sophisticated sliding window algorithm that weights the previous window count. If you are at 80% through the current window, the effective count is 0.2 * previous_window_count + current_window_count. This smooths the boundary problem without the memory cost of per-request timestamps.',
    },
  ],
}
