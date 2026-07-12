# Python — NoSQL (Redis, MongoDB, DynamoDB)

### NoSQL vs. SQL, and BASE vs. ACID
**They ask:** "What is NoSQL? What does BASE mean, and how does it compare to ACID?"

NoSQL is an umbrella term for databases that drop the relational model's fixed schema and (often) its strict ACID guarantees in exchange for horizontal scalability and flexible data shapes — it's not one technology but several families (document, key-value, wide-column, graph) solving different problems. **BASE** — Basically Available, Soft state, Eventually consistent — names the trade-off many distributed NoSQL systems make deliberately: instead of ACID's strict consistency (every read sees the latest committed write), they accept that a read might briefly return stale data in exchange for staying available and fast even when parts of the system are partitioned or under load. The senior framing is that BASE isn't "worse than ACID," it's a different point on the CAP-theorem trade-off, chosen because for some workloads (a social feed's like count) eventual consistency is an acceptable cost for the availability and scale it buys.

**Say it:** "BASE trades ACID's strict consistency for availability and scale under partition — it's the right choice when brief staleness is acceptable, and the wrong one when it isn't, like a bank balance."
**Red flag:** Picking a NoSQL database "because it scales" for data that actually needs strong consistency (financial balances, inventory counts) without checking what consistency model it actually offers.

### Redis data types and using it as a cache
**They ask:** "What is Redis used for? What are its main data types? How do you use it as a cache, and how do keys work?"

Redis is an in-memory key-value store, which is what makes it fast enough for caching, session storage, rate limiting, and pub/sub — everything lives in RAM, with disk persistence as a safety net rather than the primary access path. Its value isn't just "string in, string out": it has native **data structures** — strings, lists, hashes (like a nested dict), sets, sorted sets (ranked by score, ideal for leaderboards), and streams — so operations that would need application-level logic on top of a plain key-value store (atomically incrementing a counter, ranking by score) are single Redis commands. Keys are just strings, conventionally namespaced with colons (`user:1234:profile`) to keep related data organized and enable pattern-based operations, though `KEYS pattern` is discouraged in production since it scans the whole keyspace — `SCAN` is the cursor-based, non-blocking alternative.

```python
import redis
r = redis.Redis()
r.setex("user:42:session", 3600, "token123")   # cache with 1h TTL
r.zadd("leaderboard", {"alice": 1500, "bob": 1200})
r.zrevrange("leaderboard", 0, 2)                # top 3, sorted-set native
```

**Say it:** "Redis's edge over a plain cache isn't just speed — it's that ranking, counting, and set operations are native commands instead of application logic layered on top of get/set."
**Red flag:** Using `KEYS pattern` in a production hot path. It's O(n) over the entire keyspace and blocks the single-threaded server while it runs — `SCAN` iterates without that blocking cost.

### Redis persistence and key expiry
**They ask:** "How does Redis ensure data persistence, given it's in-memory? How do you configure key expiry?"

Redis offers two persistence mechanisms, and the choice trades durability against performance/recovery-time. **RDB** (snapshotting) periodically dumps the entire dataset to disk — fast to restore from and compact, but you lose everything written since the last snapshot on a crash. **AOF** (append-only file) logs every write operation as it happens — much more durable (configurable to fsync every write, every second, or let the OS decide) but the file is larger and replay-on-restart is slower. Production setups commonly run both. **Key expiry** (`EXPIRE key seconds`, or `SETEX` combining set+expire in one atomic call) is how Redis implements TTL-based cache eviction — Redis lazily checks expiry on access and also actively sweeps expired keys in the background, so memory isn't held by dead keys indefinitely even if they're never read again.

```python
r.set("session:abc", "data")
r.expire("session:abc", 1800)   # or r.setex(..., 1800, ...) atomically
```

**Say it:** "RDB snapshots are fast to restore but lose everything since the last snapshot; AOF logs every write for much better durability at the cost of file size and slower restarts — I run both when the data actually matters if Redis restarts."
**Red flag:** Treating Redis as a durable primary datastore with no persistence configured at all. Without RDB or AOF, a restart silently loses everything in memory.

### Redis pub/sub
**They ask:** "What is publish and subscribe in Redis?"

Pub/sub is a messaging pattern where **publishers** send messages to a named channel without knowing who's listening, and **subscribers** receive every message published to channels they've subscribed to, without knowing who sent them — it decouples producers from consumers entirely. Redis's implementation is deliberately simple and **fire-and-forget**: there's no message persistence, no delivery guarantee, no replay — if no subscriber is listening when a message is published, it's gone forever. That makes it a good fit for ephemeral real-time notifications (live chat presence, cache-invalidation broadcasts to multiple app instances) and a bad fit for anything that needs guaranteed delivery, ordering across restarts, or replay — that's what a real message broker (Kafka, RabbitMQ) is for.

```python
# subscriber
pubsub = r.pubsub()
pubsub.subscribe("notifications")
for message in pubsub.listen():
    print(message["data"])

# publisher (any other process)
r.publish("notifications", "user 42 logged in")
```

**Say it:** "Redis pub/sub is fire-and-forget with zero delivery guarantee — great for ephemeral broadcasts like cache invalidation across instances, wrong for anything that needs a message to survive if nobody's listening yet."
**Red flag:** Relying on Redis pub/sub for anything that must not be lost — order events, payment confirmations. There's no persistence or redelivery; a real broker with acknowledgment and queuing is the correct tool.

### Redis atomicity, transactions, and Lua scripts
**They ask:** "How does Redis ensure the atomicity of operations? What are transactions in Redis, and what are Lua scripts used for?"

Redis is single-threaded for command execution, which means any *single* command is inherently atomic — no other command can interleave mid-execution, which is why compound operations like `INCR` (read-modify-write in one command) are race-free without any explicit locking. For **multiple** commands that need to run as a unit, `MULTI`/`EXEC` queues commands and executes them together without another client's commands interleaving — but it's not a full ACID transaction: there's no rollback on a runtime error partway through (a malformed command is caught at queue time, not execution time). For actual conditional, multi-step atomic logic (check a value, then act on it), **Lua scripts** (`EVAL`) are the real answer — the whole script runs as one atomic unit on the server, since Redis's single-threaded model guarantees no other command can run in the middle of it.

```python
# atomic check-and-set via Lua, no round trip / race between check and act
script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end"
r.eval(script, 1, "lock:resource", "my-token")
```

**Say it:** "Single commands are atomic for free because Redis is single-threaded; MULTI/EXEC batches commands without interleaving but doesn't roll back on a runtime error, so for real conditional atomic logic I reach for a Lua script, which runs as one uninterruptible unit."
**Red flag:** Assuming `MULTI`/`EXEC` behaves like a SQL transaction with rollback on error. It doesn't — a command that fails at runtime inside the block doesn't undo the ones that already succeeded.

### MongoDB: documents, collections, and BSON
**They ask:** "What is a collection in MongoDB? What is a document? What is BSON?"

A **document** is MongoDB's basic unit of storage — a JSON-like structure of key-value pairs, but crucially *schemaless*: two documents in the same collection can have entirely different fields, which is the core trade MongoDB makes versus a relational table (flexibility to evolve the shape of your data without a migration, at the cost of the database no longer enforcing that shape for you). A **collection** is the grouping of documents, roughly analogous to a table but without a table's schema enforcement. **BSON** (Binary JSON) is the actual on-disk/wire format — a binary-encoded superset of JSON that adds types JSON lacks natively (dates, binary data, a dedicated `ObjectId` type for document IDs) and is faster to parse and more compact than text JSON, which is why MongoDB stores and transmits BSON even though the API looks JSON-shaped.

```python
db.users.insert_one({"name": "Ann", "tags": ["vip"], "signup": datetime.now()})
db.users.find({"tags": "vip"})
```

**Say it:** "Documents are schemaless JSON-like records grouped into collections without table-level schema enforcement — BSON is the binary wire format underneath that adds real types like dates and ObjectId that plain JSON doesn't have."
**Red flag:** Calling MongoDB "schema-less" as if that means "no schema design needed." The schema still exists implicitly in your application code and query patterns — MongoDB just doesn't enforce or validate it for you by default.

### MongoDB update operators and upsert
**They ask:** "How do you use $inc, $set, $unset in MongoDB? What does the upsert parameter do in db.collection.update?"

MongoDB's update operators are how you modify specific fields of a document without rewriting the whole thing: `$set` overwrites a field's value (or adds it if absent), `$unset` removes a field entirely, `$inc` atomically increments a numeric field by a delta — all in one round trip, avoiding the read-modify-write race you'd get from fetching a document, changing it in application code, and writing it back. `upsert: True` on an update means "update the matching document if one exists, otherwise insert a new one from the query filter plus the update" — a single atomic operation for the common "create or update" pattern, avoiding the same race you'd get from a separate find-then-insert-or-update in application code.

```python
db.counters.update_one(
    {"_id": "page_views"},
    {"$inc": {"count": 1}},
    upsert=True   # creates the counter doc on first call, increments after
)
```

**Say it:** "$inc, $set, and $unset are atomic single-round-trip field mutations, and upsert=True folds create-or-update into one atomic operation — both avoid the classic read-modify-write race you'd get doing the same logic in application code."
**Red flag:** Reading a document into Python, mutating a field, and writing the whole document back to increment a counter. Under concurrent writers that's a lost-update race — `$inc` does it atomically server-side instead.

### DynamoDB keys: partition key and sort key
**They ask:** "What are tables, items, and attributes in DynamoDB? How do you use primary keys and composite keys?"

DynamoDB's vocabulary maps to the relational world loosely: a **table** holds **items** (rows), each item is a set of **attributes** (columns) — but unlike a relational table, items in the same table don't need the same attributes. The **partition key** is the mandatory part of every primary key — DynamoDB hashes it to decide which physical partition stores the item, so it's the single most important modeling decision: a well-distributed partition key spreads load evenly, a poorly chosen one (e.g. a status field with 3 values) creates a **hot partition** that throttles under load regardless of how much total capacity the table has. A **composite key** adds a **sort key** alongside the partition key, letting multiple items share a partition key and be queried together, ordered by sort key — the standard pattern for "all orders for this customer" (`customer_id` as partition key, `order_date` as sort key).

**Say it:** "The partition key decides physical data distribution, so its cardinality and access pattern determine whether the table scales evenly or hits a hot partition — that's the single most important DynamoDB modeling decision, made up front, since it's expensive to change later."
**Red flag:** Choosing a low-cardinality partition key (like a status enum) because it "matches the query pattern." That concentrates all that data's traffic onto a handful of partitions, throttling regardless of overall provisioned capacity.

### DynamoDB capacity: RCU/WCU and provisioned vs. on-demand
**They ask:** "What are read and write capacity units in DynamoDB? How do provisioned vs. on-demand capacity settings affect performance and cost?"

A **Read Capacity Unit (RCU)** and **Write Capacity Unit (WCU)** are DynamoDB's throughput currency — one RCU covers one strongly consistent read (or two eventually consistent reads) per second of up to 4KB, one WCU covers one write per second of up to 1KB; larger items consume proportionally more units. **Provisioned** capacity means you pre-declare RCU/WCU (optionally with auto-scaling within bounds) and pay for that reserved throughput whether you use it or not — predictable cost, but requests beyond provisioned capacity get throttled. **On-demand** capacity scales automatically to whatever traffic arrives with no pre-provisioning, at a higher per-request price — the trade is paying more per operation to never have to capacity-plan or risk throttling on a traffic spike. The senior call: predictable, steady traffic favors provisioned (cheaper at scale); spiky or unpredictable traffic favors on-demand (avoids both throttling and over-provisioning waste).

**Say it:** "Provisioned capacity is cheaper for steady, predictable load but throttles past what you've reserved; on-demand costs more per request but absorbs spikes with no capacity planning — the choice is a bet on how predictable the traffic actually is."
**Red flag:** Defaulting to provisioned capacity for a genuinely spiky, unpredictable workload "to save money." Under-provisioning throttles real traffic, and over-provisioning to cover the spikes wastes exactly the money you were trying to save.

### DynamoDB: Query vs. Scan
**They ask:** "What are the differences between Query and Scan operations in DynamoDB?"

`Query` is efficient by design: it requires a partition key (optionally narrowed by a sort key condition or filter), and DynamoDB uses that to go directly to the relevant partition, reading only the items that match — cost and latency scale with the *result set*, not the table size. `Scan` reads **every item in the entire table**, then optionally filters afterward — cost scales with the *table size* regardless of how selective the filter is, since you pay for every item read before filtering. This makes `Scan` a red flag at any real scale: it's fine for a one-off admin script against a small table, but a `Scan` in a hot request path against a large table is a latency and cost problem waiting to happen as the table grows. The fix when you need to filter on a non-key attribute regularly is a **Global Secondary Index (GSI)**, which lets you `Query` efficiently on that attribute instead.

**Say it:** "Query goes straight to the relevant partition and costs scale with the result set; Scan reads the whole table and costs scale with table size regardless of the filter — if I need to query by a non-key attribute often, that's a signal I need a GSI, not a Scan."
**Red flag:** Using `Scan` with a `FilterExpression` in a production request path. You're still paying to read every item in the table before the filter drops most of them — that cost only gets worse as the table grows.

### DynamoDB Streams, DAX, and TTL
**They ask:** "How do you use Streams and Lambda for event handling in DynamoDB? What is DAX for? How do you manage TTL for items?"

**DynamoDB Streams** captures an ordered, time-stamped log of every item-level change (insert/update/delete) in a table for a rolling 24-hour window — attaching a Lambda trigger to a stream is the standard pattern for reacting to data changes in near-real-time (fan out a notification, update a search index, replicate to another system) without polling the table. **DAX** (DynamoDB Accelerator) is an in-memory caching layer that sits in front of DynamoDB and is API-compatible with the DynamoDB SDK — it cuts read latency from single-digit milliseconds to microseconds for read-heavy, repeat-access workloads, at the cost of eventual consistency for cached reads (same trade-off as any cache). **TTL** lets you mark an attribute as an expiration timestamp; DynamoDB automatically deletes expired items in the background at no extra write cost — the standard way to auto-expire session data or temporary records without a scheduled cleanup job.

**Say it:** "Streams plus Lambda gives me event-driven reactions to data changes without polling, DAX is a read-through cache for latency-sensitive repeat reads at the cost of eventual consistency, and TTL auto-expires items server-side instead of needing a cleanup job."
**Red flag:** Reaching for DAX to fix a write-latency or write-throughput problem. It's a read cache — it does nothing for write-heavy workloads, which need capacity/partition-key tuning instead.
