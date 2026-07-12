# Python — message brokers (Kafka, RabbitMQ)

### Message brokers vs. calling HTTP directly
**They ask:** "What is a Message Broker? What is a Publisher, a Consumer, a Topic? What are the pros and cons versus using HTTP?"

A message broker is a middleman that decouples the service producing work (the **publisher**) from the service doing it (the **consumer**) — the publisher writes a message to a **topic**/queue and moves on, with no idea who (if anyone yet) will process it or when. That decoupling is the entire value proposition versus a direct HTTP call. **Pros over HTTP**: the publisher doesn't block waiting for the consumer to be available or fast (async by nature); if the consumer is temporarily down, messages queue up instead of failing outright; you can add more consumers to scale throughput without the publisher knowing or caring; one message can fan out to multiple independent consumers. **Cons**: it adds an infrastructure dependency and operational complexity, introduces eventual (not immediate) processing, and debugging a multi-hop async flow is harder than tracing a synchronous call stack. The rule of thumb: HTTP for "I need an answer now," a broker for "this needs to happen, but not necessarily this millisecond, and I don't want a slow/down consumer to block me."

**Say it:** "A broker trades HTTP's immediate response for decoupling — the publisher doesn't need the consumer to be up, fast, or singular, at the cost of eventual rather than immediate processing and a harder-to-trace async flow."
**Red flag:** Reaching for a message broker for a request that genuinely needs a synchronous answer (a login check). That reintroduces the coupling a broker is meant to remove, just with more latency and infrastructure.

### Message queues and the Pub-Sub pattern
**They ask:** "What is a Message Queue? What is the Pub-Sub mechanism, and how does push compare to pull for consuming messages?"

A message queue holds messages in order (typically FIFO, though not always guaranteed depending on the broker) until a consumer is ready to process them — the queue is the buffer that absorbs the timing mismatch between "when work arrives" and "when it gets processed." **Pub-Sub** builds on that idea for one-to-many delivery: a publisher sends to a topic without knowing the subscribers, and every active subscriber gets a copy — different from a plain queue, where typically one consumer takes each message (competing consumers, for load distribution) rather than every consumer getting every message. On delivery mechanics: **push** brokers send messages to consumers as they arrive (lower latency, but risks overwhelming a slow consumer unless there's flow control); **pull** has consumers actively request the next batch when ready (self-paced, naturally handles a slow consumer, but adds polling latency and overhead if pulls happen too infrequently or too often). Kafka is fundamentally pull-based; RabbitMQ supports both, with prefetch limits acting as a middle ground.

**Say it:** "Pub-Sub is one-to-many broadcast to every subscriber, a plain queue is typically one-to-one competing-consumer delivery for load distribution — and push gives lower latency at the risk of overwhelming a slow consumer, where pull is self-paced but adds polling overhead."
**Red flag:** Assuming a "queue" always means only one consumer ever gets each message. That's true for the classic work-queue pattern, but Pub-Sub topics deliberately deliver to every subscriber — conflating the two misdiagnoses which pattern you actually need.

### Kafka fundamentals: topics, partitions, producers, consumers
**They ask:** "What is a Topic in Kafka? What is a Partition? What are Producer and Consumer?"

A Kafka **topic** is a named, append-only log of messages. What makes Kafka scale is that a topic is split into **partitions** — independent, ordered sub-logs distributed across brokers — so a topic's total throughput isn't limited by a single log's write speed, and different partitions can be consumed in parallel. Kafka guarantees ordering *within* a partition, not across the whole topic, which is the detail that trips people up: if strict ordering matters for a given entity (all events for one user, say), you need every event for that entity to land in the *same* partition, which is what a partition key does. A **producer** writes messages to a topic (optionally specifying a key, which determines the partition via hashing); a **consumer** reads them, tracking its own position (offset) in each partition it's assigned.

```python
from kafka import KafkaProducer
producer = KafkaProducer(bootstrap_servers="localhost:9092")
producer.send("orders", key=b"user-42", value=b'{"amount": 100}')
# key ensures all events for user-42 land in the same partition, preserving order
```

**Say it:** "Kafka only guarantees ordering within a partition, not across a topic — so if an entity's events need to stay ordered, the partition key has to route all of them to the same partition, or that guarantee silently doesn't apply."
**Red flag:** Assuming Kafka guarantees global ordering across a topic just because it's a log. It's ordered per-partition — cross-partition ordering isn't a thing Kafka provides.

### Kafka consumer groups and offsets
**They ask:** "What is a Consumer Group in Kafka? What is an offset, and how is it used?"

An **offset** is a monotonically increasing position marker within a partition — Kafka doesn't delete a message when it's read (unlike a traditional queue), it just retains the log for a configured period, and each consumer tracks its own offset to know what it's already processed. A **consumer group** is a set of consumers that share the work of a topic's partitions among themselves — Kafka assigns each partition to exactly one consumer *within* a group, so adding more consumers (up to the partition count) increases parallel throughput, while each *separate* consumer group gets its own independent full copy of the stream, unaffected by other groups' progress. This is what makes Kafka good for both work-queue-style load distribution (one group, many consumers) and Pub-Sub-style fan-out (multiple independent groups each reading the whole topic).

**Say it:** "Offsets are per-partition position markers a consumer tracks itself, and a consumer group splits a topic's partitions among its members for parallelism — while separate groups each get an independent full read of the stream, which is how one topic serves both load-balanced processing and fan-out simultaneously."
**Red flag:** Adding more consumers to a group than the topic has partitions expecting more throughput. Extra consumers beyond the partition count sit idle — parallelism in a consumer group is capped by partition count.

### Kafka high availability and failure recovery
**They ask:** "What mechanisms provide high availability and reliability in Kafka? How does Kafka handle failures and recovery?"

Each partition is replicated across multiple brokers — one **leader** handles all reads/writes for that partition, and **follower** replicas continuously copy the leader's log. If the leader broker fails, Kafka (via its controller, coordinated through the cluster metadata layer) promotes an in-sync follower to leader, and producers/consumers transparently reconnect to the new leader — this is the mechanism that makes Kafka tolerant of individual broker failures without data loss, as long as at least one in-sync replica survives. Producers can tune their durability guarantee via `acks`: `acks=0` (fire and forget, fastest, can silently lose messages), `acks=1` (wait for the leader only, can lose data if the leader fails before followers replicate), `acks=all` (wait for all in-sync replicas, strongest durability, higher latency) — the classic durability/latency trade-off, explicit and tunable per producer.

**Say it:** "Partition replication with leader/follower failover is what survives a broker going down, and `acks` is the explicit durability knob — acks=all is the only setting that guarantees a committed message survives a leader failure."
**Red flag:** Using `acks=0` or `acks=1` for data where losing a message is unacceptable (financial events, order confirmations) without realizing that's the exact trade-off being made for lower latency.

### RabbitMQ: exchanges and queues
**They ask:** "What is an Exchange in RabbitMQ? What is a Queue? What is Topic routing, and how are binding keys specified?"

RabbitMQ's routing model is more explicit than Kafka's: a publisher never sends directly to a **queue** — it sends to an **exchange**, and the exchange's type decides which queue(s) get a copy, based on a **binding** between exchange and queue and a **routing key** on the message. `direct` exchanges route on an exact routing-key match; `fanout` ignores the routing key entirely and broadcasts to every bound queue (RabbitMQ's Pub-Sub equivalent); `topic` exchanges match routing keys against wildcard patterns (`orders.*.created` binding matches a message routed as `orders.eu.created`), giving flexible selective fan-out without a fixed set of direct bindings. The queue itself is where messages actually sit until a consumer acknowledges them — this exchange/queue split is what lets RabbitMQ support complex routing topologies (one message reaching several different queues based on content) that a simpler topic-based system handles less flexibly.

```python
channel.exchange_declare(exchange="orders", exchange_type="topic")
channel.queue_bind(exchange="orders", queue="eu_orders", routing_key="orders.eu.*")
channel.basic_publish(exchange="orders", routing_key="orders.eu.created", body=b"...")
```

**Say it:** "RabbitMQ decouples routing from storage — the exchange decides where a message goes based on its type and the binding's routing key, the queue is just where it lands until consumed — which is what makes flexible topologies like topic-based selective fan-out possible."
**Red flag:** Publishing directly "to a queue" in RabbitMQ terminology. Structurally, you always publish to an exchange; the default (nameless) exchange with a routing key equal to the queue name just makes it *look* like a direct queue send.

### RabbitMQ dead-letter queues and prefetch
**They ask:** "What is Dead Letter Exchange (DLX) and Dead Letter Queue (DLQ) in RabbitMQ? What is Prefetch Count and what is it used for?"

A message becomes "dead" when it's rejected without requeue, expires (TTL), or exceeds a queue's max length — a **DLX** is a regular exchange you configure a queue to route dead messages to instead of silently dropping them, and the **DLQ** is just the queue bound to that exchange where they land, giving you a place to inspect, alert on, or manually reprocess messages that failed to process normally rather than losing them. **Prefetch count** controls flow: it's the maximum number of unacknowledged messages RabbitMQ will deliver to a consumer before waiting for acks — without a prefetch limit, a fast broker can flood a slow consumer with its entire backlog at once, exhausting the consumer's memory; setting it to a small number (often 1 for slow, heavy-processing consumers) makes RabbitMQ deliver one at a time, wait for the ack, then deliver the next — natural backpressure.

```python
channel.basic_qos(prefetch_count=1)   # don't push more work than one consumer can hold
```

**Say it:** "DLX/DLQ turns silent message loss into an inspectable failure path, and prefetch count is the backpressure knob that stops a fast broker from flooding a slow consumer's memory with unacknowledged messages."
**Red flag:** Leaving prefetch count unset (unlimited) on a consumer that does slow, heavy processing per message. The broker will happily hand it its entire backlog at once, and a crash mid-processing means redelivering a huge unacknowledged batch.

### Broker durability and error handling
**They ask:** "What does Broker Durability mean? What error handling strategies are commonly used with message brokers?"

Durability is about surviving a broker restart or crash without losing data — it applies at multiple levels that all have to be configured correctly together: the queue/exchange itself needs to be declared durable (survives a restart), individual messages need to be marked persistent (written to disk, not just memory), and — for RabbitMQ specifically — a message published without waiting for a broker acknowledgment (publisher confirms) could be lost between "sent" and "actually written," so even a durable queue doesn't guarantee delivery without that confirmation. Common error-handling strategies: **retry with backoff** for transient failures (a downstream service briefly unavailable); **dead-lettering** after N retries so a permanently-failing message doesn't loop forever and block the queue; **idempotent consumers** so a message redelivered after a crash (acknowledged late, or not at all before the crash) doesn't cause a duplicate side effect — since most brokers guarantee *at-least-once* delivery, not exactly-once, by default.

**Say it:** "Durability needs the queue, the message, and the publish acknowledgment all configured together, or you have a false sense of safety — and because most brokers are at-least-once by default, idempotent consumers are what actually prevent duplicate side effects on redelivery, not just retry logic alone."
**Red flag:** Assuming a "durable queue" alone guarantees no message loss. Without persistent messages and publisher confirms, a durable queue can still lose a message that never made it to disk before a crash.
