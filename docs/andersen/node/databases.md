# Databases

### SQL data types
**They ask:** "What data type choices actually matter for a schema, and where do people get them wrong?"

The interview-relevant traps aren't the obvious types (`INT`, `VARCHAR`) — they're precision-losing defaults. Money stored as `FLOAT`/`DOUBLE` silently loses precision from binary floating-point rounding; it belongs in `DECIMAL(p,s)` (exact fixed-point) or, in some systems, integer cents. `VARCHAR` without a sane length limit invites unbounded input; `TEXT` is right for genuinely unbounded content. Timestamps need an explicit decision between "store in UTC, convert on display" versus a naive local time that breaks the moment users span timezones — and the type choice matters here: a plain `TIMESTAMP` (`timestamp without time zone`) stores whatever clock value you give it with no timezone attached, it is *not* UTC by default, so "store in UTC" is a convention you enforce at the application layer, not a guarantee the column gives you. `TIMESTAMPTZ` is the type that actually carries timezone-aware semantics, and those semantics are engine-specific (in Postgres it normalizes to UTC on write and converts to the session timezone on read) — check your specific database's docs rather than assuming behavior transfers across engines.

```sql
price DECIMAL(10, 2) NOT NULL,  -- exact, not FLOAT
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

**Say it:** "I default money to `DECIMAL`, never `FLOAT`, because binary floating point can't represent most decimal fractions exactly — and I store all timestamps in UTC, converting only at the display layer."
**Red flag:** Storing currency as `FLOAT`/`DOUBLE`. It's a textbook accounting bug — `0.1 + 0.2` rounding errors accumulate into real discrepancies at scale.

### Normalization
**They ask:** "Explain normalization — what problem does it solve, and when do you deliberately break it?"

Normalization organizes a schema to eliminate redundant data, which removes the update anomalies redundancy causes — if a customer's address is stored in five order rows and it changes, you either update five rows correctly or you get an inconsistent database. 1NF eliminates repeating groups/multi-valued columns, 2NF eliminates partial dependency on part of a composite key, 3NF eliminates transitive dependency on non-key columns. The trade-off: fully normalized schemas need more joins to reassemble data, which costs read performance — so *denormalization* (duplicating some data deliberately) is a legitimate, deliberate choice for read-heavy paths, not a mistake, as long as you also own the write-side complexity of keeping the duplicate in sync.

**Say it:** "Normalization removes update anomalies by eliminating redundancy, but every join it adds costs read performance — denormalizing a specific hot read path is a legitimate trade-off, not sloppiness, as long as I own keeping the duplicate consistent."
**Red flag:** Treating "fully normalized" as an unconditional goal. A reporting table or a read-heavy API endpoint often benefits from deliberate, documented denormalization.

### Primary, foreign, and composite keys
**They ask:** "Walk through primary, foreign, and composite keys and how they enforce data integrity."

A **primary key** uniquely identifies each row and is what other tables reference — it's implicitly `NOT NULL` and unique, usually backed by an index automatically. A **foreign key** references another table's primary key, and the database *enforces* that the referenced row actually exists — inserting a foreign key value with no matching parent row fails at the database level, not just in application code. A **composite key** is a primary (or unique) key made of multiple columns together, common in join tables representing a many-to-many relationship, where the pair of foreign keys together is the natural unique identifier.

```sql
CREATE TABLE order_items (
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  PRIMARY KEY (order_id, product_id) -- composite key
);
```

**Say it:** "A foreign key is a database-enforced guarantee that a referenced row exists — I rely on that instead of application-level checks, because a DB constraint can't be bypassed by a bug in one code path while another forgets to validate."
**Red flag:** Enforcing referential integrity only in application code, with no actual `FOREIGN KEY` constraint. Any direct DB write, migration script, or future code path that skips the check can silently corrupt the relationship.

### Indexing strategy
**They ask:** "How do you decide what to index, and what's the cost of over-indexing?"

An index turns a linear table scan into a fast lookup (typically a B-tree) for the columns it covers — the win applies to `WHERE`, `JOIN`, and `ORDER BY` columns that filter/sort large tables. The cost is real and often underweighted: every index slows down every `INSERT`/`UPDATE`/`DELETE` on that table (the index has to be maintained too) and consumes storage — so indexing every column "just in case" trades write throughput for reads you may never make. A composite index's column order matters: it can serve queries filtering on a *prefix* of its columns, not just the exact combination.

```sql
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
-- serves queries filtering on customer_id alone, or customer_id + status — not status alone
```

**Say it:** "I index based on actual query patterns from `EXPLAIN`, not guesswork, because every index is a write-time cost too — and for composite indexes, column order determines which query shapes it can actually serve."
**Red flag:** Adding an index to every column "for safety." That degrades write performance across the board for indexes that may never be used by the query planner.

### One-to-one, one-to-many, many-to-many relationships
**They ask:** "Model the three relationship types and how each is represented in SQL."

**One-to-one**: a foreign key with a `UNIQUE` constraint on the child (or shared primary key) — e.g. a `user` and a `user_profile` split for optional/rarely-accessed fields. **One-to-many**: a plain foreign key on the "many" side — one `customer` has many `orders`, so `orders.customer_id` references `customers.id`. **Many-to-many**: no direct foreign key can represent it — you need a **join table** holding a foreign key to each side (often with its own composite primary key), like `order_items` linking `orders` and `products`.

```sql
-- many-to-many: students <-> courses
CREATE TABLE enrollments (
  student_id INT REFERENCES students(id),
  course_id INT REFERENCES courses(id),
  PRIMARY KEY (student_id, course_id)
);
```

**Say it:** "One-to-many is a foreign key on the 'many' side; many-to-many always needs a join table, because a relational foreign key can only point to exactly one row, not a set."
**Red flag:** Modeling a many-to-many relationship as a comma-separated list of IDs in one column. It breaks referential integrity, indexing, and every query that needs to join on the relationship.

### JOIN strategies
**They ask:** "Explain INNER, LEFT, and how the query planner actually executes a join."

`INNER JOIN` returns only rows with a match on both sides; `LEFT JOIN` returns every row from the left table, with `NULL`s filling in for unmatched right-side columns — the choice usually maps directly to a business question ("orders with a customer" vs "all customers, even ones with zero orders"). Under the hood, the planner picks between a few physical strategies based on table sizes and available indexes: **nested loop** (fine for a small outer table matched against an indexed inner table), **hash join** (builds a hash table from the smaller side, good for large unindexed joins), and **merge join** (for data already sorted on the join key). You don't choose the physical strategy directly — you influence it by having the right indexes and up-to-date statistics for the planner to reason from.

```sql
EXPLAIN ANALYZE SELECT * FROM orders o LEFT JOIN customers c ON o.customer_id = c.id;
```

**Say it:** "LEFT JOIN keeps unmatched left rows with NULLs, INNER JOIN drops them — and I read `EXPLAIN` to see which physical join strategy the planner picked, since that tells me whether an index is actually being used."
**Red flag:** Using `LEFT JOIN` everywhere by default "to be safe." It's semantically different from `INNER JOIN` and can silently include unwanted NULL rows, plus it's often a slower plan when an inner join was actually the correct intent.

### Constraints: NOT NULL, UNIQUE, CHECK, FK
**They ask:** "Why push validation into database constraints instead of only application code?"

Constraints are the database's last line of defense — they hold no matter which code path writes the data: a migration script, a bulk import, a different service, or a bug that skips application validation. `NOT NULL` rejects missing required data, `UNIQUE` prevents duplicate values (email, username), `CHECK` enforces arbitrary boolean conditions (`price >= 0`), and `FOREIGN KEY` enforces referential integrity. The senior framing: application-level validation is for good UX (fast, specific error messages) — database constraints are for correctness *guarantees* that survive every future caller, known or not.

```sql
ALTER TABLE products ADD CONSTRAINT price_positive CHECK (price >= 0);
```

**Say it:** "Application validation is for UX — fast, specific errors — but database constraints are the guarantee that survives every future caller, including ones I haven't written yet, like a migration script or a different service touching the same table."
**Red flag:** Relying solely on application-layer validation for data integrity rules that matter (uniqueness, non-negativity, referential integrity). Any direct DB access or bug in a different service bypasses it entirely.

### Cascade behavior on delete/update
**They ask:** "What are `ON DELETE CASCADE`/`SET NULL`/`RESTRICT`, and how do you choose between them?"

They define what happens to child rows when a referenced parent row is deleted (or its key updated). `RESTRICT` (often the default) blocks the delete if child rows still reference it — the safest default, forcing an explicit decision. `CASCADE` deletes the child rows too — appropriate when the child has no meaning without the parent (e.g. deleting a user deletes their sessions). `SET NULL` nullifies the foreign key on children instead of deleting them — appropriate when the child should survive independently (e.g. deleting a category shouldn't delete the products in it, just orphan their category reference).

```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,   -- sessions die with the user
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL -- product survives
```

**Say it:** "I pick cascade behavior based on whether the child has independent meaning without the parent — cascade for dependent data like sessions, `SET NULL` for data that should survive, `RESTRICT` as the safe default when I'm not sure."
**Red flag:** Defaulting every foreign key to `ON DELETE CASCADE` without thinking through the blast radius. A single user delete can silently cascade-delete far more data than intended if the dependency chain is deep.

### Migration tools and workflow
**They ask:** "How do schema migrations work, and what makes a migration workflow safe in a team?"

A migration is a versioned, incremental script that transforms the schema from one known state to the next — the tool (Knex, TypeORM, Prisma Migrate, Rails' ActiveRecord migrations) tracks which migrations have already run against a given database, so the same set applies deterministically across dev, CI, staging, and production. Safety in a team comes from a few disciplines: migrations are committed to version control alongside the code that depends on the new schema, every migration that changes data (not just structure) should be idempotent or guarded, and every migration needs a tested rollback (`down`) — or, for zero-downtime deploys, an *additive-first* strategy that never drops a column the currently-running old code still reads.

```js
exports.up = (knex) => knex.schema.alterTable('users', t => t.string('phone').nullable());
exports.down = (knex) => knex.schema.alterTable('users', t => t.dropColumn('phone'));
```

**Say it:** "Migrations are versioned and tracked so the same schema transformation applies deterministically everywhere — for zero-downtime deploys I go additive-first, since dropping a column the old running code still reads breaks the deploy mid-rollout."
**Red flag:** Editing an already-applied migration file directly instead of writing a new one. Anyone who already ran the old version now has a schema that silently diverges from what the migration history claims.

### Writing a safe rollback migration
**They ask:** "What makes a migration's rollback actually safe to run in production?"

A rollback (`down`) needs to be the true inverse of `up`, but the trap is destructive operations: rolling back a migration that *dropped* a column can't restore the data that was in it — dropping data is not reversible by definition, only the schema shape is. The safer production pattern for anything risky (dropping a column, changing a type) is to split it across multiple deploys: first stop writing to the old column, deploy, verify, *then* drop it in a later migration — so a rollback at any single step never needs to un-delete data.

```sql
-- step 1 (this deploy): stop using old_col, dual-write if needed
-- step 2 (next deploy, after verifying): DROP COLUMN old_col
```

**Say it:** "A rollback can undo schema shape, never lost data — so for anything destructive I split it across deploys: stop using the column first, verify, then drop it later, so no single rollback ever needs to resurrect deleted data."
**Red flag:** Treating `down` as a guaranteed safety net for a migration that drops a column or table. If data was already deleted, running `down` recreates the empty structure, not the data.

### Document vs key-value vs column vs graph databases
**They ask:** "Walk through the major NoSQL database families and what each is actually good at."

**Key-value** (Redis, DynamoDB in simple mode): O(1) lookup by key, no query language over the value — the right fit for caching, sessions, feature flags. **Document** (MongoDB): stores flexible, nested JSON-like documents, queryable on any field — fits data with a naturally hierarchical, per-record-varying shape (product catalogs, content management). **Wide-column** (Cassandra, HBase): optimized for massive write throughput and horizontal scale, built around column families/tables with a sparse, variable set of columns per row (not every row needs the same columns) and a partition-oriented data model that determines how rows are distributed across nodes — used for time-series and logging at extreme scale. **Graph** (Neo4j): stores nodes and edges, optimized for traversing *relationships* — the right fit when the query is fundamentally about connections (social graphs, recommendation, fraud-ring detection), which relational multi-joins do poorly at depth.

**Say it:** "Each NoSQL family optimizes for a specific access pattern, not 'more scalable SQL' — key-value for O(1) lookups, document for flexible nested records, wide-column for massive write throughput, graph for deep relationship traversal — the choice follows the dominant query shape."
**Red flag:** Choosing MongoDB "because it's more scalable" without the data actually having a flexible or hierarchical shape. If the data is genuinely relational with strong consistency needs, SQL usually models it better and NoSQL adds complexity for no real gain.

### When to reach for NoSQL over SQL
**They ask:** "Give a real decision framework for SQL vs NoSQL, not just buzzwords."

The honest framing: SQL is the default, NoSQL is the exception you justify. Reach for NoSQL when the data genuinely has a variable, per-record schema (not just "we don't want to write migrations"), when the access pattern is overwhelmingly simple key lookups at extreme scale where relational joins would be the bottleneck, or when eventual consistency is genuinely acceptable for the business case and buys you horizontal write scale a single relational primary can't match. Reach for SQL when you need strong consistency, ACID transactions across multiple entities, and complex relational queries — which is most business-domain data (orders, payments, inventory).

**Say it:** "SQL is my default because most business data is relational and needs transactional consistency — I reach for NoSQL when the schema is genuinely variable or the access pattern needs horizontal write scale that outgrows what a relational primary can do, not because migrations feel like friction."
**Red flag:** Picking NoSQL primarily to avoid writing schema migrations. That's optimizing for short-term convenience while giving up constraints and transactional guarantees the domain data actually needs.

### MongoDB schema design
**They ask:** "How does schema design in MongoDB differ from relational normalization — embed or reference?"

MongoDB's core design decision is **embed vs. reference**, and it inverts relational instinct: because documents can nest arbitrarily, data accessed together should often be *embedded* in one document to avoid a join-equivalent lookup — a blog post can embed its comments if they're always read together and rarely need independent querying. **Reference** (storing an ID and doing a separate lookup, `$lookup` for a join-like operation) is right when the referenced data is large, frequently updated independently, or shared across many parent documents (embedding would duplicate it everywhere it's updated).

```js
// embed: read together, bounded size
{ _id: 1, title: "Post", comments: [{ text: "nice" }, { text: "great" }] }
// reference: large, independently updated, shared
{ _id: 1, title: "Post", authorId: ObjectId("...") }
```

**Say it:** "MongoDB schema design is embed-vs-reference, not normalize-vs-denormalize — I embed what's read together and bounded in size, and reference anything large, independently updated, or shared across many parents to avoid duplicated writes."
**Red flag:** Embedding an unbounded, ever-growing array (like all comments on a viral post) inside a single document. MongoDB documents have a size limit, and an unbounded embed eventually hits it — that data should be referenced instead.

### ORM vs query builder vs raw SQL
**They ask:** "How do you choose between an ORM, a query builder, and raw SQL?"

An **ORM** (TypeORM, Prisma, Sequelize) maps rows to objects and abstracts SQL almost entirely — fastest for standard CRUD, but its abstraction can hide inefficient generated queries (classically the N+1 problem) and makes genuinely complex queries awkward to express. A **query builder** (Knex) gives a programmatic, composable API that maps closer to actual SQL — less magic, easier to reason about the generated query, still safe from injection via parameterization. **Raw SQL** is the escape hatch for a query too complex or performance-critical to trust to either abstraction — full control, at the cost of losing type-safety and portability across databases.

**Say it:** "I default to the ORM for standard CRUD because it's fastest to write and type-safe, drop to the query builder when I need explicit control over the generated query, and go raw SQL for the handful of genuinely complex or performance-critical queries where the abstraction would fight me."
**Red flag:** Insisting on 100% ORM or 100% raw SQL as a blanket rule. Real codebases mix all three deliberately based on each query's complexity and performance sensitivity.

### The N+1 query problem
**They ask:** "What is the N+1 query problem, and how do you fix it?"

It happens when code fetches a list of N parent records, then loops over them issuing one additional query per record to fetch related data — 1 query becomes 1 + N queries, which scales linearly with result size and can turn a fast endpoint into a slow one purely from round-trip overhead as the list grows. The fix is batching the related fetch into one query: `JOIN` if using SQL directly, or an ORM's eager-loading/`include` feature, which issues one additional query with a `WHERE id IN (...)` instead of N separate ones.

```js
// N+1: one query per order
const orders = await Order.findAll();
for (const o of orders) o.items = await OrderItem.findAll({ where: { orderId: o.id } });

// fixed: eager load, one extra query total
const orders2 = await Order.findAll({ include: OrderItem });
```

**Say it:** "N+1 turns into a query per row in a loop, so it scales linearly with result size and often hides in an ORM's convenient-looking lazy loading — I catch it with query logging or an APM's query count per request, then fix it with eager loading or a single `WHERE IN` batch."
**Red flag:** Fetching related data inside a `.map()`/`for` loop over a parent list. Even if each individual query is fast, the *count* of queries scaling with list size is the actual bug.

### Connection pooling
**They ask:** "Why does a Node app need a connection pool instead of opening a connection per request?"

Opening a new database connection is expensive — TCP handshake, auth, sometimes TLS negotiation — expensive enough that doing it per-request would dominate request latency and quickly exhaust the database's max-connections limit under load. A connection pool opens a fixed number of connections up front and hands them out to queries as needed, returning them to the pool when done, so the cost of connection setup is paid once, not per request. Sizing the pool matters: too small and requests queue waiting for a free connection; too large and you can exceed what the database server itself can handle across all app instances combined.

```js
const pool = new Pool({ max: 20, idleTimeoutMillis: 30000 }); // reused across requests
```

**Say it:** "Connection setup cost is paid once per pooled connection, not per request — I size the pool against the database's actual max-connections limit divided across all running app instances, not against a single instance's guess."
**Red flag:** Setting pool `max` per instance without accounting for how many instances run concurrently. Ten instances at `max: 100` each can hit a database's global connection ceiling and start rejecting connections from everyone.

### Read replicas and replication lag
**They ask:** "How do read replicas scale reads, and what problem does replication lag cause?"

A read replica is a copy of the primary database kept in sync via replication, letting you route read-heavy traffic away from the primary (which still handles all writes) — this scales read throughput horizontally without the write-consistency complexity of sharding. The catch is **replication lag**: replication is typically asynchronous, so a replica can be milliseconds to seconds behind the primary. If a user writes data and immediately reads it back from a replica before that write has propagated, they can see stale data — a real, user-visible bug class ("I just saved my profile and it reverted!").

```js
await db.primary.query('UPDATE users SET name = $1 WHERE id = $2', [name, id]);
const user = await db.replica.query('SELECT * FROM users WHERE id = $1', [id]); // may be stale
```

**Say it:** "Read replicas scale reads but lag behind the primary asynchronously — for a read that must reflect a write the same user just made, I read from the primary or from the same connection that did the write, not blindly from a replica."
**Red flag:** Routing every read to a replica indiscriminately, including a read-after-write on the same request. That's the exact scenario where replication lag becomes a visible, reproducible bug.

### SQL triggers
**They ask:** "What are database triggers for, and what's the trade-off of using them?"

A trigger is a procedure the database runs automatically in response to an `INSERT`/`UPDATE`/`DELETE` on a table — used for things that must happen atomically with the write and can't risk being skipped, like maintaining an audit log, enforcing a complex invariant a `CHECK` constraint can't express, or updating a denormalized aggregate column. The trade-off is that triggers are invisible in application code — logic lives in the database, hidden from anyone reading the app's codebase, which makes debugging and onboarding harder; most teams reserve them for genuinely cross-cutting integrity concerns rather than business logic.

```sql
CREATE TRIGGER update_timestamp BEFORE UPDATE ON users
FOR EACH ROW SET NEW.updated_at = NOW();
```

**Say it:** "Triggers guarantee something happens atomically with a write no matter which code path performs it, but that guarantee comes at the cost of hiding logic from anyone reading the application code — I reserve them for integrity/audit concerns, not business rules that belong in the app layer."
**Red flag:** Implementing core business logic (pricing, notifications) as a trigger. It becomes invisible to the application team and a surprise the next time someone debugs unexpected behavior with no idea where it's coming from.

### Transactions and ACID
**They ask:** "Explain ACID and why transactions matter for multi-step writes."

A transaction groups multiple operations so they succeed or fail as one unit — critical for anything where a partial write would leave data inconsistent (debit one account, credit another; if only the debit commits, money vanishes). **Atomicity**: all operations commit or none do. **Consistency**: a transaction moves the database from one valid state to another, respecting constraints. **Isolation**: concurrent transactions don't see each other's uncommitted intermediate state. **Durability**: once committed, the change survives a crash.

```js
await db.transaction(async (trx) => {
  await trx('accounts').where({ id: fromId }).decrement('balance', amount);
  await trx('accounts').where({ id: toId }).increment('balance', amount);
}); // both succeed or both roll back
```

**Say it:** "ACID is the guarantee that a multi-step write either fully happens or fully doesn't — I wrap any operation touching more than one row or table where a partial write would be inconsistent, like a funds transfer, in a transaction."
**Red flag:** Performing a multi-step financial or inventory update as separate, unwrapped queries. A crash or error between steps leaves the data in a half-updated, inconsistent state with no way to know it happened.

### Transaction isolation levels
**They ask:** "What are the SQL isolation levels, and what anomaly does each one prevent?"

From weakest to strongest, per the SQL standard: **Read Uncommitted** allows dirty reads (seeing another transaction's uncommitted changes) — rarely used, and note this is engine-specific: **Postgres has no true Read Uncommitted, it silently treats it as Read Committed**, while MySQL/InnoDB does implement real dirty reads at that level. **Read Committed** (the default in Postgres) prevents dirty reads but allows non-repeatable reads (re-reading the same row within a transaction can return different values if another transaction committed a change in between). **Repeatable Read** prevents that too — in Postgres specifically, Repeatable Read is implemented as a snapshot taken at transaction start, which as a side effect also prevents phantom reads in the standard sense (a repeated range query sees a consistent snapshot, not new rows), stronger than the SQL standard technically requires at that level; other engines' Repeatable Read can still allow phantoms. **Serializable** is the strongest — transactions behave as if executed one at a time, preventing all anomalies, at the cost of more lock contention or serialization failures the app must retry.

**Say it:** "Each level up trades more consistency guarantees for more contention — I default to Read Committed for typical CRUD, and only reach for Serializable when a specific operation truly can't tolerate concurrent-transaction anomalies. And I don't assume isolation-level behavior transfers across engines — Postgres's Read Uncommitted is really Read Committed, and its Repeatable Read is snapshot-based and already phantom-safe, which isn't true everywhere."
**Red flag:** Reaching for `Serializable` everywhere "to be safe" without measuring the throughput cost. Under real concurrency it causes more transaction retries/aborts than most applications actually need to handle correctness.

### Deadlocks
**They ask:** "What causes a database deadlock, and how do you prevent one?"

A deadlock happens when two transactions each hold a lock the other needs — transaction A locks row 1 and waits for row 2, while transaction B locks row 2 and waits for row 1, and neither can proceed. The database detects this cycle and forcibly aborts one transaction (the "deadlock victim") so the other can continue. The reliable prevention strategy is **consistent lock ordering**: if every transaction that touches both row 1 and row 2 always locks them in the same order (e.g. always lowest ID first), the circular-wait condition can't form. The application also needs to handle the aborted transaction by retrying it.

```js
// consistent ordering prevents the deadlock
const [first, second] = [fromId, toId].sort((a, b) => a - b);
await lock(first); await lock(second);
```

**Say it:** "Deadlocks come from two transactions locking the same rows in opposite order — I prevent them with consistent lock ordering across every code path, and I still wrap the transaction in a retry, because the database will abort one side even with ordering discipline under high enough contention."
**Red flag:** Handling a deadlock by just adding a longer timeout instead of fixing the lock ordering. A longer timeout delays the symptom under load without addressing the actual circular-wait cause.
