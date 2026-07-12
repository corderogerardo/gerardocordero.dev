# Go — databases, message brokers, and caching

### database/sql and connection pooling
**They ask:** "How does Go's `database/sql` manage connections, and what happens if you don't tune the pool?"

`database/sql` isn't a driver — it's a connection-pooling abstraction that a driver (`pgx`, `mysql`) plugs into. Left untuned, its defaults are unlimited max open connections, which under load lets a Go service silently open far more DB connections than the database can handle, exhausting the DB's own connection limit and starving every other service sharing it.

```go
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(25)
db.SetConnMaxLifetime(5 * time.Minute) // rotate connections past a load balancer
```

`SetConnMaxLifetime` matters specifically behind a proxy or load balancer that can silently drop long-lived connections — without it you accumulate dead connections in the pool that fail on first use.

**Say it:** "`database/sql` is a connection pool, not a driver, and its default of unlimited open connections will happily exhaust the database under load — I always set `MaxOpenConns` and a `ConnMaxLifetime` to avoid stale connections behind a proxy."
**Red flag:** Never calling `SetMaxOpenConns`. In production that's an unbounded resource that scales with traffic instead of a deliberate, tested limit.

### the N+1 query problem
**They ask:** "What is the N+1 query problem, and how would you fix it in a Go service?"

It happens when you fetch a list (1 query), then loop over it issuing a separate query per item (N queries) to get related data — a pattern that's easy to write and invisible in a small test dataset, but turns into hundreds of round trips in production. The fix is always the same shape: batch the related fetch into one query using `WHERE id IN (...)` or a JOIN, then assemble the result in memory.

```go
// N+1: one query per order
for _, order := range orders {
    items, _ := db.Query("SELECT * FROM items WHERE order_id = ?", order.ID)
}

// fixed: one batched query — database/sql binds one arg per placeholder,
// so a slice doesn't expand into IN (?); build one placeholder per id instead
ids := orderIDs(orders)
placeholders := strings.Repeat("?,", len(ids))
placeholders = placeholders[:len(placeholders)-1]
args := make([]any, len(ids))
for i, id := range ids { args[i] = id }
rows, _ := db.Query("SELECT * FROM items WHERE order_id IN ("+placeholders+")", args...)
// then group rows by order_id in Go
// Postgres alternative: WHERE order_id = ANY($1) with pq.Array(ids)
```

**Say it:** "N+1 is a query-per-loop-iteration bug that's invisible with 5 test rows and crushing with 5,000 — I fix it by batching the related fetch into one `IN (...)` query and grouping the results in application code."
**Red flag:** Missing N+1 in code review because the test fixture only has one or two rows. Always ask "what does this query pattern look like at 10,000 rows," not what it looks like in the unit test.

### indexes: how they help and when they hurt
**They ask:** "How do database indexes actually speed up a query, and what's the cost you're trading for it?"

An index is a separate, sorted data structure (typically a B-tree) pointing back to table rows, so the database can locate matching rows in roughly O(log n) instead of scanning every row (O(n)). The trade-off is on the write path: every `INSERT`/`UPDATE`/`DELETE` has to update every index on that table too, so more indexes mean slower writes and more storage.

The senior nuance interviewers probe: an index only helps if the query actually uses it — a `WHERE` clause wrapped in a function (`WHERE LOWER(email) = ?`) usually can't use a plain index on `email`, and a composite index only helps queries that filter on its *leftmost* columns in order.

```sql
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at);
-- helps: WHERE user_id = ?  AND created_at > ?
-- does NOT help: WHERE created_at > ?  alone
```

**Say it:** "Indexes trade write cost and storage for O(log n) reads via a B-tree — and a composite index only serves queries that filter its leftmost columns first, so column order in the index has to match the actual query pattern."
**Red flag:** Adding an index to "make it faster" without checking `EXPLAIN`. An unused index still costs every write and gives zero read benefit — verify the planner actually picks it up.

### transactions and isolation levels
**They ask:** "What do ACID transactions guarantee, and how do you use them correctly from Go's `database/sql`?"

A transaction groups multiple statements so they commit atomically — all or nothing — which matters whenever an operation spans more than one write that must stay consistent (debit one account, credit another). `database/sql` models this with `Tx`, and the critical discipline is that every code path must end in either `Commit` or `Rollback`, or the connection stays checked out of the pool forever.

```go
tx, err := db.BeginTx(ctx, nil)
if err != nil { return err }
defer tx.Rollback() // no-op if Commit already succeeded

if _, err := tx.ExecContext(ctx, "UPDATE accounts SET balance = balance - ? WHERE id = ?", amt, from); err != nil {
    return err
}
if _, err := tx.ExecContext(ctx, "UPDATE accounts SET balance = balance + ? WHERE id = ?", amt, to); err != nil {
    return err
}
return tx.Commit()
```

Isolation level controls what concurrent transactions can see of each other's uncommitted or in-flight changes — `READ COMMITTED` (Postgres's default) prevents dirty reads but still allows non-repeatable reads and phantom reads; `SERIALIZABLE` prevents all of it at the cost of more aborts under contention.

**Say it:** "I always `defer tx.Rollback()` right after `BeginTx` — it's a no-op after a successful `Commit`, but it guarantees the connection gets released on every early-return error path instead of leaking out of the pool."
**Red flag:** Forgetting `Rollback` on an error path. The transaction (and its connection) stays open until it times out, quietly draining the pool under load.

### distributed transactions and the saga pattern
**They ask:** "How do you keep data consistent across a write that spans two microservices, when you can't use one database transaction?"

A single ACID transaction only works within one database; once a "transaction" spans two services with their own datastores, you can't get atomicity for free. The two accepted patterns: **two-phase commit** (a coordinator asks every participant to prepare, then commits/aborts all together) — rarely used because it blocks and doesn't tolerate partition well — and the **saga pattern**, which breaks the operation into a sequence of local transactions, each with a defined *compensating action* to undo it if a later step fails.

```
1. Reserve inventory (local tx)
2. Charge payment (local tx)
   → if this fails: run compensation — release inventory reservation
3. Confirm order (local tx)
```

The trade-off to name explicitly: sagas give you eventual consistency, not atomicity — there's a window where the system is in a partially-completed state, and every step needs a correct, idempotent compensating action.

**Say it:** "Cross-service consistency uses sagas — a chain of local transactions each with a compensating action — because two-phase commit doesn't tolerate partitions well; the cost is eventual, not immediate, consistency, so every compensation has to be idempotent."
**Red flag:** Proposing a distributed lock or 2PC across microservices as the default answer. It's the textbook option but rarely the practical one — sagas are what production systems actually run.

### sharding strategies
**They ask:** "How do you shard a dataset that's outgrown a single database instance, and what's the hardest part to get right?"

Sharding splits data horizontally across multiple database instances by a shard key, so each instance holds a subset of rows and the system scales writes past what one machine can do. The hardest part isn't the mechanics — it's picking a shard key that distributes load evenly *and* keeps together the data your queries actually join on, since cross-shard joins and transactions are expensive or impossible.

Common strategies: **hash-based** (hash the key, mod by shard count) gives even distribution but makes range queries scatter across every shard; **range-based** (shard by ID or date ranges) keeps ranges together but risks hot shards if traffic isn't evenly distributed across the range; **directory-based** (a lookup table maps key → shard) is flexible but adds a lookup hop and a single point of failure if not replicated.

**Say it:** "The shard key choice is the whole design — hash-based spreads load evenly but kills range queries, range-based keeps related data together but risks hot shards, and directory-based is flexible at the cost of an extra lookup — I pick based on the dominant query pattern, not gut feel."
**Red flag:** Sharding before establishing you actually need it. Sharding trades away cross-shard joins and transactions permanently — reach for read replicas and indexing first; shard only once vertical scaling and replicas are genuinely maxed out.

### replication and replication lag
**They ask:** "How does leader-follower replication work, and what does 'eventual consistency' cost you in a Go service reading from a replica?"

A leader accepts writes and streams its write-ahead log to one or more followers, which replay it to stay in sync — followers exist to scale reads and provide failover, not to accept writes directly. The practical cost senior engineers must design around is **replication lag**: a follower can be milliseconds to seconds behind the leader, so a read immediately following a write on a different connection can return stale data.

```go
// classic read-your-own-writes bug:
db.Exec("INSERT INTO orders ...")       // hits the leader
order, _ := replica.Query("SELECT ...") // hits a lagging follower — might miss the row
```

The fix is architectural, not a retry loop: route read-after-write paths to the leader (or a synchronous replica), and only send read-tolerant traffic (dashboards, analytics, "eventually visible" data) to asynchronous followers.

**Say it:** "Followers replay the leader's write-ahead log asynchronously, so lag is inherent — I route read-your-own-writes paths to the leader and reserve followers for read traffic that can tolerate a few seconds of staleness."
**Red flag:** Load-balancing every read across leader and followers uniformly. That silently breaks read-your-own-writes for any user action that reads back what it just wrote.

### graph databases (Neo4j)
**They ask:** "What kind of problem makes a graph database like Neo4j the right choice over a relational schema?"

A relational database models relationships as foreign keys resolved through joins, which gets expensive fast when the *query itself* is about the relationship structure — "friends of friends within 3 hops," recommendation paths, fraud rings. Neo4j stores relationships as first-class, indexed pointers, so traversing a multi-hop relationship is a pointer walk instead of a chain of joins that gets slower with every extra hop.

The trade-off: you give up the mature tooling, ubiquity, and simple aggregate-query performance of relational stores for a query language (Cypher) and mental model built specifically around traversal.

**Say it:** "I reach for a graph database when the query is fundamentally about relationship depth or path-finding — friends-of-friends, fraud rings, recommendation graphs — because that's a pointer walk in Neo4j and a chain of increasingly expensive joins in a relational store."
**Red flag:** Reaching for Neo4j because the data "has relationships." Almost all data has relationships; the signal is deep multi-hop traversal queries, not the mere existence of foreign keys.

### Cassandra and tunable consistency
**They ask:** "What's Cassandra's data model, and what does 'tunable consistency' actually mean when you're calling it from Go?"

Cassandra is a wide-column store built for write-heavy, horizontally-scaled workloads with no single leader — every node can accept writes, and data is partitioned and replicated across the cluster by a partition key you choose up front (which also fixes your query patterns, since Cassandra doesn't support arbitrary joins or ad hoc `WHERE` clauses well). "Tunable consistency" means you choose, per query, how many replicas must acknowledge a read or write (`ONE`, `QUORUM`, `ALL`) — trading latency against consistency on a request-by-request basis rather than a fixed database-wide setting.

```go
// gocql: choose consistency per query
q := session.Query(`INSERT INTO events (id, ts, payload) VALUES (?, ?, ?)`, id, ts, payload)
q.Consistency(gocql.Quorum)
```

**Say it:** "Cassandra has no single leader and no real joins — you design the partition key around your query patterns up front, and tunable consistency lets me trade latency for durability per query with `ONE` vs `QUORUM` vs `ALL`."
**Red flag:** Modeling Cassandra tables the way you'd model a relational schema, then discovering you can't do the join you need. In Cassandra, you design tables around queries, not queries around tables.

### DynamoDB partition key and single-table design
**They ask:** "Why does DynamoDB schema design look so different from a relational schema, and what is 'single-table design'?"

DynamoDB scales by partitioning data across nodes by partition key, and its performance guarantees only hold if traffic is spread evenly across partitions and queries hit a known key — there's no query planner rescuing an inefficient access pattern the way a relational DB's optimizer might. **Single-table design** is the resulting idiom: instead of one DynamoDB table per entity type (users, orders, items) requiring app-side joins, you model multiple entity types in one table using composite keys, so a single query can fetch a parent and its related items in one round trip.

```
PK              SK              (attributes...)
USER#123        PROFILE         name, email
USER#123        ORDER#456       total, status
USER#123        ORDER#789       total, status
```

A query for `PK = USER#123` returns the profile and all orders in one call — the "join" happened at write time, by co-locating related items under a shared partition key.

**Say it:** "Single-table design pre-computes the join by co-locating related entities under one partition key, because DynamoDB has no query-time join — the trade-off is you design the table around your access patterns up front, not around normalized entities."
**Red flag:** Modeling DynamoDB with one table per entity, relational-style, then fanning out N queries to assemble one page. That's the N+1 problem reborn in a system that charges per read.

### Kafka partitions and consumer groups
**They ask:** "How does Kafka guarantee ordering, and how do consumer groups let you scale processing?"

Kafka only guarantees message order *within a single partition*, not across a topic — so ordering-sensitive data (all events for one user) needs a partition key that routes related messages to the same partition consistently. A consumer group lets multiple consumer instances split a topic's partitions among themselves, each instance owning a disjoint subset — that's how you scale throughput horizontally while keeping per-partition order intact.

```go
// segmentio/kafka-go — key determines partition, preserving per-key order
w.WriteMessages(ctx, kafka.Message{
    Key:   []byte(userID),
    Value: payload,
})
```

The senior gotcha: you can't have more active consumers in a group than partitions — extra consumers sit idle — so partition count is a scaling ceiling decided at topic-creation time.

**Say it:** "Order is guaranteed per-partition only, so I key messages by whatever needs strict ordering — a user ID, an account ID — and partition count is the hard ceiling on how many consumers in a group can do work in parallel."
**Red flag:** Assuming Kafka guarantees global topic-wide ordering. It doesn't — cross-partition ordering isn't guaranteed, which is exactly why the partition key choice matters so much.

### Kafka delivery guarantees
**They ask:** "What's the difference between at-least-once and exactly-once delivery in Kafka, and which do most Go consumers actually implement?"

At-least-once means a message might be delivered more than once (after a consumer crash before it commits its offset, the broker redelivers) but never silently dropped; exactly-once needs transactional producers/consumers coordinating offset commits with output writes atomically, which is real but has real overhead and narrower applicability (mainly Kafka-to-Kafka pipelines). Most production Go consumers run at-least-once and get exactly-once *effective* behavior by making the downstream write idempotent instead.

```go
// idempotent write: upsert keyed by the message's unique id, safe to reprocess
_, err := db.Exec(`INSERT INTO processed_events (id, payload) VALUES (?, ?)
                    ON CONFLICT (id) DO NOTHING`, event.ID, event.Payload)
```

**Say it:** "I default to at-least-once delivery and buy exactly-once *behavior* by making the consumer's write idempotent — an upsert keyed by message ID — rather than reaching for Kafka's transactional exactly-once semantics, which mainly pay off Kafka-to-Kafka."
**Red flag:** Assuming "we use Kafka" means messages are never duplicated. Without an idempotent consumer, a redelivery after a crash-before-commit will double-process — that's the default failure mode, not an edge case.

### RabbitMQ exchanges and routing
**They ask:** "How does RabbitMQ route a message from producer to queue, and how does that differ conceptually from Kafka?"

RabbitMQ decouples the producer from the queue via an **exchange**, which routes each published message to zero or more bound queues based on a routing rule — a *direct* exchange matches an exact routing key, a *topic* exchange matches wildcard patterns, a *fanout* exchange ignores the key and broadcasts to every bound queue. This is a fundamentally different model from Kafka: RabbitMQ is a smart broker doing per-message routing decisions, while Kafka is a dumb, ordered, replayable log that consumers read at their own offset.

```go
ch.ExchangeDeclare("orders", "topic", true, false, false, false, nil)
ch.QueueBind(q.Name, "order.created.*", "orders", false, nil)
```

The practical consequence: RabbitMQ suits complex routing and work-queue/task-distribution patterns; Kafka suits high-throughput event streaming where consumers need to replay history.

**Say it:** "RabbitMQ routes each message once via exchange rules to specific queues — it's a smart broker for task distribution; Kafka is a replayable, ordered log consumers read at their own pace — I pick based on whether I need routing logic or replay."
**Red flag:** Using RabbitMQ where you actually need replay (a new consumer needs the last 24 hours of events). Once a RabbitMQ queue delivers and acks a message, it's gone — that's a Kafka use case, not a RabbitMQ one.

### Kafka vs RabbitMQ
**They ask:** "Kafka or RabbitMQ — how do you actually decide?"

The decision hinges on two questions: does a consumer ever need to *replay* history, and is the primary need high-throughput streaming or flexible task routing? Kafka retains messages for a configured period (or forever) and lets multiple independent consumer groups replay the same log at their own pace — ideal for event sourcing, analytics pipelines, and audit trails. RabbitMQ is optimized for low-latency task distribution with rich routing (priority queues, dead-letter queues, per-message TTL) but a message is gone once acknowledged.

```
Need replay / multiple independent readers of history → Kafka
Need complex routing / work-queue semantics / per-message priority → RabbitMQ
```

**Say it:** "The deciding question is replay: if a new consumer needs to read historical events, that's Kafka's log model; if it's task distribution with routing logic and once-and-done delivery, that's RabbitMQ's broker model."
**Red flag:** Picking Kafka by default because "it scales better." RabbitMQ scales fine for its use case — the real differentiator is the log-vs-broker model, not raw throughput.

### NATS and JetStream
**They ask:** "What makes NATS different from Kafka/RabbitMQ, and what does JetStream add?"

Core NATS is a minimal, extremely low-latency pub-sub system with no message persistence by default — if no subscriber is listening, the message is simply gone. That's a deliberate trade-off for simplicity and speed, and it fits fire-and-forget patterns like service discovery pings or ephemeral notifications where losing a message under a subscriber outage is acceptable. **JetStream** is NATS's opt-in persistence layer bolted on top, adding at-least-once delivery, replay, and durable consumers — closing the gap with Kafka while keeping NATS's operational simplicity.

```go
nc, _ := nats.Connect(nats.DefaultURL)
nc.Publish("orders.created", payload) // core NATS: fire-and-forget, no persistence

js, _ := nc.JetStream()
js.Publish("orders.created", payload) // JetStream: persisted, replayable
```

**Say it:** "Core NATS is fire-and-forget pub-sub with no persistence — dead simple and fast — and JetStream adds the durability and replay you'd otherwise reach for Kafka to get, at lower operational overhead."
**Red flag:** Using core NATS (no JetStream) for anything that can't tolerate silent message loss. Without JetStream, a message published with no active subscriber simply disappears.

### Amazon SQS
**They ask:** "Standard vs FIFO SQS queues — what do you trade for ordering guarantees, and what's a visibility timeout?"

A **standard** queue gives at-least-once delivery with no ordering guarantee and near-unlimited throughput; a **FIFO** queue guarantees exactly-once processing and strict ordering *within a message group*, at meaningfully lower throughput. Most workloads default to standard and make consumers idempotent, reaching for FIFO only when strict order genuinely matters (e.g., sequential state transitions for one entity).

A **visibility timeout** is how SQS avoids double-processing without a broker keeping active per-consumer state: when a consumer receives a message, SQS hides it from other consumers for that duration rather than deleting it — the consumer must explicitly delete it after successful processing, or it reappears for redelivery once the timeout expires.

```go
// after successful processing:
sqsClient.DeleteMessage(ctx, &sqs.DeleteMessageInput{
    QueueUrl:      queueURL,
    ReceiptHandle: msg.ReceiptHandle,
})
```

**Say it:** "Standard SQS trades ordering for throughput and needs idempotent consumers; FIFO trades throughput for per-group ordering — either way, the visibility timeout is what prevents double-delivery, and forgetting to delete the message after processing is what causes silent reprocessing."
**Red flag:** Setting the visibility timeout shorter than the actual processing time. The message becomes visible again mid-processing, and a second consumer picks it up — a self-inflicted duplicate-processing bug.

### caching principles: cache-aside, write-through, TTL
**They ask:** "Walk through the common caching strategies and where each one's failure mode bites."

**Cache-aside** (lazy loading): the app checks the cache first, and on a miss reads from the DB and populates the cache — simple and the most common pattern, but every cold key is a full-latency DB hit, and there's a window where cache and DB can disagree if a write isn't also invalidating the cache. **Write-through**: writes go to the cache and DB together (or cache first, then synced), so reads are always warm — at the cost of write latency now including the cache round trip. **TTL** (time-to-live) bounds staleness for any strategy that doesn't proactively invalidate — the trade-off is picking a TTL short enough to bound staleness but long enough to actually reduce DB load.

```go
func GetUser(ctx context.Context, id string) (*User, error) {
    if u, ok := cache.Get(ctx, "user:"+id); ok {
        return u, nil
    }
    u, err := db.FindByID(ctx, id)
    if err != nil { return nil, err }
    cache.Set(ctx, "user:"+id, u, 5*time.Minute)
    return u, nil
}
```

**Say it:** "Cache-aside is the default — read-through-cache-on-miss — and I pair it with a TTL bounding staleness, plus explicit invalidation on writes to that key so I'm not relying on TTL alone to catch every update."
**Red flag:** Updating the DB on a write but forgetting to invalidate the corresponding cache key. The cache now serves stale data until TTL expiry — for a long TTL, that's a correctness bug users notice.

### Redis
**They ask:** "What makes Redis more than 'a cache,' and what data structures actually earn that reputation?"

Redis is an in-memory data structure server — strings are the simple case, but sorted sets, hashes, lists, and sets let you push real logic into the store instead of round-tripping data to compute it in application code. A sorted set (`ZADD`/`ZRANGE`) gives you an O(log n) leaderboard or rate limiter for free; `EXPIRE` on any key gives TTL-based expiry without app-side cron jobs; pub-sub gives lightweight fan-out messaging.

```go
rdb.ZAdd(ctx, "leaderboard", redis.Z{Score: 1500, Member: "user:42"})
rank, _ := rdb.ZRevRank(ctx, "leaderboard", "user:42").Result() // O(log n)
```

Redis is single-threaded for command execution (per shard), which is exactly what makes individual operations atomic without explicit locking — but also means one slow command (a large `KEYS *` scan) blocks everything else on that instance.

**Say it:** "Redis earns 'more than a cache' from its data structures — sorted sets for leaderboards and rate limiting, TTL on any key, pub-sub for fan-out — and its single-threaded execution model is what makes each command atomic for free, at the cost of one slow command blocking the instance."
**Red flag:** Running `KEYS *` in production. It's O(n) and blocks the single-threaded event loop for every other client — use `SCAN` for iteration instead.

### Memcached vs Redis
**They ask:** "When would you actually pick Memcached over Redis?"

Memcached is a simpler, multi-threaded, pure key-value cache with no persistence and no rich data structures — its architecture (threaded, sharded by client-side consistent hashing) can outperform Redis specifically for large, simple key-value workloads with many small gets, because there's no single-threaded bottleneck. Redis wins whenever you need anything beyond plain get/set: persistence, pub-sub, sorted sets, atomic multi-step operations, or replication built into the server itself.

The honest modern answer: most new projects default to Redis because its feature surface covers Memcached's use case plus more, and the operational simplicity of running one system instead of choosing between two rarely loses to Memcached's narrower throughput edge.

**Say it:** "Memcached's multi-threaded, no-frills design can out-throughput Redis on pure large-scale get/set workloads, but Redis's data structures, persistence, and pub-sub cover Memcached's use case and more — I default to Redis unless a specific throughput benchmark says otherwise."
**Red flag:** Choosing Memcached "because it's simpler" without a throughput number backing it up. Simplicity that costs you persistence and richer operations should be a measured trade-off, not a default.

### MongoDB and the document model
**They ask:** "When does a document store like MongoDB actually beat a relational schema, and what do you give up?"

MongoDB's win is when your data's natural shape is a self-contained, nested document that's usually read and written as a whole — a product with variable attributes, a user profile with a flexible settings blob — because you avoid the join entirely by embedding related data in one document. You give up relational integrity guarantees (foreign keys, cross-document transactions were historically weak, though modern MongoDB supports multi-document transactions with a real cost) and schema enforcement — the flexibility that helps you ship fast can also let inconsistent document shapes accumulate without discipline.

```go
type Product struct {
    ID         primitive.ObjectID `bson:"_id"`
    Name       string             `bson:"name"`
    Attributes map[string]string  `bson:"attributes"` // variable shape, no schema migration needed
}
```

**Say it:** "I reach for MongoDB when the natural unit of read/write is a self-contained, variably-shaped document — I embed instead of join — and I'm explicit that I'm trading relational integrity guarantees for that flexibility, not getting it for free."
**Red flag:** Modeling MongoDB with the same normalized, heavily-referenced structure you'd use in Postgres. That gives up the document model's main advantage (embedding) while still lacking real join performance.

### ClickHouse and columnar OLAP
**They ask:** "Why is ClickHouse dramatically faster than Postgres for analytics queries over the same data volume?"

Relational databases like Postgres store data **row-oriented** — a full row together on disk — which is efficient for reading/writing whole records (OLTP: fetch this one order) but wasteful for analytics queries that scan millions of rows but touch only 2-3 columns, since you read every column of every row anyway. ClickHouse stores data **column-oriented** — each column contiguous on disk — so an aggregate query (`SUM(revenue) GROUP BY region`) reads only the columns it needs, and similar values compress far better sitting next to each other.

The trade-off: columnar storage makes single-row lookups and frequent small updates comparatively expensive — ClickHouse is built for high-volume inserts and heavy aggregate reads, not transactional row-level updates.

**Say it:** "Columnar storage means an aggregate query only reads the columns it touches instead of every column of every row — that's the entire reason ClickHouse crushes Postgres on analytics at scale, and exactly why it's the wrong choice for transactional, row-level workloads."
**Red flag:** Proposing ClickHouse as a general-purpose application database. It's an OLAP engine — point lookups, single-row updates, and transactional workloads are not its strength.

### Elasticsearch and the inverted index
**They ask:** "How does Elasticsearch make full-text search fast, and when do you actually need it over a SQL `LIKE`?"

A SQL `LIKE '%term%'` can't use a standard B-tree index (the leading wildcard defeats it), so it degenerates to a full table scan — fine at small scale, unusable at real volume. Elasticsearch builds an **inverted index**: for every term, a list of which documents contain it, so a search for a word is a direct lookup instead of a scan. It also tokenizes, stems, and scores relevance (ranking, not just matching), which SQL text search doesn't do natively.

```go
// full scan, no real index usage:
db.Query("SELECT * FROM articles WHERE body LIKE '%golang concurrency%'")

// Elasticsearch: inverted-index lookup + relevance scoring
es.Search("articles", `{"query": {"match": {"body": "golang concurrency"}}}`)
```

**Say it:** "The inverted index turns 'find documents containing this term' into a direct lookup instead of a scan, and Elasticsearch adds tokenization and relevance scoring on top — I reach for it once search needs ranking or scale that `LIKE '%term%'` can't provide."
**Red flag:** Standing up an Elasticsearch cluster for a search box on a few thousand rows. Postgres full-text search (`tsvector`) covers that scale without a second system to operate and keep in sync.

### idempotent message consumers
**They ask:** "Why does almost every messaging system in practice deliver at-least-once, and how do you make a Go consumer safe under redelivery?"

Exactly-once delivery across a network is provably hard (you can't atomically "process the message and ack it" as one step without a shared transaction) so every mainstream broker defaults to at-least-once: it's always safe to redeliver a message the consumer didn't clearly finish processing. The correctness burden shifts to the consumer being **idempotent** — processing the same message twice produces the same result as processing it once.

```go
// dedupe + work in ONE transaction — commit only after the work succeeds,
// so a crash between "mark processed" and "do the work" can't drop it
tx, err := db.Begin()
if err != nil { return err }
defer tx.Rollback() // no-op after Commit

_, err = tx.Exec(`INSERT INTO processed_messages (message_id) VALUES (?)`, msg.ID)
if isDuplicateKeyErr(err) {
    return nil // already processed, skip safely
}
// ... do the actual work using tx, not db

return tx.Commit()
```

**Say it:** "At-least-once is the achievable guarantee, not exactly-once, so I make the consumer idempotent — dedupe and the DB side effect commit in one transaction, so a crash mid-processing rolls back instead of silently marking work done that never happened. For side effects outside the DB (an email, an API call) I reach for an outbox or an idempotency key at that boundary instead."
**Red flag:** Marking a message processed before the work finishes. A crash between the two silently drops the work on redelivery — the dedup record and the work must commit together, or not at all.
