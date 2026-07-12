# DevOps — message brokers

### Message Broker Fundamentals And Delivery Guarantees
**They ask:** "What's a message broker for, and what delivery guarantees does it actually give you?"

A message broker decouples producers from consumers in time and in failure domain: the producer publishes and moves on without waiting for the consumer to be up, process it, or even exist yet. That buys you resilience a direct HTTP call can't — if the consumer is down or slow, messages queue instead of the producer's request failing or blocking.

The guarantee that actually matters in an interview is delivery semantics, because it's a real trade-off, not a solved problem: **at-most-once** (fire and forget — fast, but a crash mid-delivery loses the message), **at-least-once** (the broker retries until acked — safe, but the consumer *will* see duplicates on retry), and **exactly-once** (the hardest to achieve honestly — usually "effectively-once" via at-least-once delivery plus consumer-side idempotency, like deduping on a message ID). Most production systems pick at-least-once and push the dedup problem to the consumer, because true exactly-once across a network partition is not actually achievable without that cooperation.

```
Producer → [Broker: queue/topic] → Consumer(s)
  at-most-once:  no ack tracking, fastest, can lose messages
  at-least-once: retry until acked, safest, consumer must handle duplicates
```

**Say it:** "A broker decouples producer and consumer so one being down doesn't break the other — the real design decision is delivery semantics, and I default to at-least-once with idempotent consumers rather than chasing exactly-once, because that's the guarantee you can actually deliver honestly."
**Red flag:** Claiming a broker gives "exactly-once" delivery without qualification. Real exactly-once requires consumer-side idempotency working with the broker's at-least-once retries — treating it as a broker feature you get for free is a tell you haven't hit the duplicate-message case in production.

### Message Broker HA Clustering And Performance Testing
**They ask:** "How do you cluster a broker for HA, and how would you load-test it before trusting it in production?"

Clustering a broker (RabbitMQ quorum queues, Kafka replicated partitions) exists so losing one broker node doesn't lose in-flight messages or stop the pipeline. Kafka replicates each partition across brokers with one elected **leader** taking all reads/writes and followers replicating the log — but that durability only holds with `acks=all` and `min.insync.replicas` set above 1; the default `acks` lets a producer move on before a replica confirms, which reopens the data-loss window. RabbitMQ's quorum queues use a Raft-based consensus group so a write is only acked once a majority of replicas have it (classic mirrored queues were removed in RabbitMQ 4.0 — quorum queues are the durable option now). In both cases the pattern is the same one you'd see in any HA datastore: replicate, elect a leader, only acknowledge after a quorum, and forbid split-brain regardless of which broker technology it is.

Load- and disaster-testing a cluster before trusting it means going beyond "does it start": push realistic throughput with a tool like Kafka's own `kafka-producer-perf-test` or NSQ's `bench_writer`/`bench_reader` to find the actual message rate the cluster sustains, then deliberately kill the leader node mid-load to measure real failover time — not the number in the docs. (`nsq_tail` only consumes and prints messages; it doesn't generate load.) That's the senior distinction: a cluster that's "HA" on paper but takes 45 seconds to elect a new leader under load has a very different RTO than the marketing page implies.

**Say it:** "Clustering a broker means replication plus quorum-based acks so no single node loss drops messages — but I don't trust that until I've load-tested throughput and killed the leader mid-run to measure actual failover time, because that number only means something under real load."
**Red flag:** Treating "we run a 3-node cluster" as proof of HA without ever testing a node failure under load. An untested failover path is a hope, not a guarantee — the first real outage is the worst time to discover leader election takes a minute.
