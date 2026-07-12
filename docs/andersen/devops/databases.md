# DevOps — DBMS & operations

### Relational Vs NoSQL And The CAP Theorem
**They ask:** "When do you actually reach for NoSQL over a relational DB, and what does CAP theorem have to do with that choice?"

The real decision driver isn't "SQL vs no SQL," it's what invariant you're willing to give up under a network partition. CAP theorem says a distributed data store can only guarantee two of three: **consistency** (every read sees the latest write), **availability** (every request gets a response), and **partition tolerance** (the system keeps working when nodes can't talk to each other). Partition tolerance isn't optional in any real distributed system, so the actual choice in practice is **CP vs AP** — during a partition, do you refuse requests to stay consistent, or serve possibly-stale data to stay available?

Relational DBs (Postgres, MySQL) default CP-leaning with strong consistency and enforce a fixed schema with joins and ACID transactions — the right fit for money, inventory, anything where a stale read is worse than a slow one. NoSQL stores trade schema rigidity for horizontal scale and often lean AP (Cassandra, DynamoDB) for high write throughput across regions, or document flexibility (MongoDB) when the shape of the data varies per record and you don't want a migration for every new field.

```
CP: refuse to answer during a partition rather than risk a stale read (banking ledger)
AP: keep answering during a partition, accept eventual consistency (shopping cart, social feed)
```

**Say it:** "The real question isn't SQL vs NoSQL, it's CP vs AP — do I refuse to answer during a partition to stay consistent, or keep serving and reconcile later — and that answer, not schema preference, is what should pick the database."
**Red flag:** Picking MongoDB "because it's more scalable" without naming what consistency guarantee is being traded away. Every NoSQL choice is trading *something* — ACID transactions, join support, or strong consistency — for that scale; not knowing which one is the tell.

### Database Clustering, Replication And Split-Brain
**They ask:** "How does a database stay available through a node failure, and what's the failure mode you have to design against?"

Replication is the mechanism: a primary takes writes and streams its write-ahead log to one or more replicas, which serve reads and stand ready to be promoted if the primary dies. The design axis that actually matters is **synchronous vs asynchronous** replication — synchronous means a write isn't acked to the client until a replica confirms it too (zero data loss on failover, higher write latency); asynchronous acks immediately and ships the log after (faster writes, but a crash right after an ack can lose the last few transactions that never made it to a replica).

The failure mode to design against is the same split-brain problem as any HA cluster: if a network partition isolates the primary from its replicas, and the replicas independently promote one of themselves, you now have two primaries diverging — writes on each side that the other doesn't know about, and no automatic way to merge them without picking a loser. Postgres/MySQL clusters solve this with a consensus-based coordinator (Patroni + etcd, or a fencing mechanism) that requires a *quorum* to agree before promoting a new primary, so an isolated minority can never self-promote.

**Say it:** "Replication is how a DB survives a node failure, but the failure that actually bites you is split-brain during a partition — I want quorum-based promotion, not 'whichever replica notices the primary is gone first,' because the latter is exactly how you end up with two primaries diverging."
**Red flag:** Describing failover as "the replica just takes over" without mentioning what stops a *partitioned-but-alive* primary from also thinking it's still primary. That's the split-brain gap — failover logic that doesn't require quorum can promote a second primary while the first is still happily accepting writes.

### Database Indexes, Permissions And Query Tracing
**They ask:** "A query is slow in production — walk me through how you'd diagnose it, and how do indexes actually help?"

1. **Reproduce and trace**: run `EXPLAIN ANALYZE` (Postgres) or the equivalent execution plan to see what the planner actually did — sequential scan vs index scan, estimated vs actual row counts, and where the time went. Don't guess; the plan tells you.
2. **Check for a missing or unused index**: a sequential scan on a large table filtered by a column with no index is the classic culprit — the DB has to read every row instead of jumping straight to matches. An index turns an O(n) scan into an O(log n) lookup by maintaining a sorted structure (typically a B-tree) alongside the table.
3. **Weigh the write cost**: every index speeds reads but slows writes, because each insert/update/delete has to update the index too — so indexing every column "just in case" is a real anti-pattern, not a free win.
4. **Check constraints and permissions last**: a `FOREIGN KEY` or `UNIQUE` constraint enforces an invariant at the DB layer (cheaper and safer than app-layer checks that race under concurrency); permissions (`GRANT SELECT ON ... TO role`) should follow least-privilege — an app's service account gets exactly the verbs it needs, not blanket admin.

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;
-- Seq Scan on orders (cost=... rows=...) → missing index
CREATE INDEX idx_orders_customer ON orders(customer_id);
-- re-run: Index Scan using idx_orders_customer → fixed
```

**Say it:** "I trace with `EXPLAIN ANALYZE` before touching anything — a slow query is usually a sequential scan that an index would turn into a lookup, but I weigh that against write cost, because an index on every column just moves the slowness from reads to writes."
**Red flag:** Adding an index the moment a query is slow without running the execution plan first. Sometimes the real problem is a bad join order or a `SELECT *` pulling unneeded columns — an index doesn't fix a query that's fundamentally reading more than it needs to.
