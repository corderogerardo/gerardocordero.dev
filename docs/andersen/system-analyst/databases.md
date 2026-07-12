# Databases — data modeling, SQL/NoSQL, warehousing

### Databases and DBMS
**They ask:** "What is a database, and what does a DBMS actually add on top of just storing files?"

A database is a structured, persistent collection of data; a DBMS (Database Management System) is the software layer that manages it — and the reason you don't just write to flat files is everything a DBMS provides on top: concurrent access without corruption, transactional guarantees (ACID), query languages, indexing for fast lookup, backup/recovery, and access control. The distinction matters in a spec because "store the data" and "store the data with transactional integrity under concurrent writes" are very different requirements, and only the second one actually needs a real DBMS's guarantees called out explicitly.

**Say it:** "The DBMS is what buys you ACID guarantees and concurrent-access safety on top of raw storage — when a requirement says 'the system shall not lose an order if two requests hit at once,' that's really a transactional-integrity requirement, and naming it that way is what tells a developer which guarantee actually matters."
**Red flag:** Writing a data-persistence requirement with no mention of concurrency or transactional behavior, then being surprised when two simultaneous writes produce a race condition. That's exactly the gap ACID guarantees exist to close — but only if the requirement asks for them.

### Database types by data model
**They ask:** "What types of databases exist by data model, and when does each fit?"

Relational (tables, rows, foreign keys, SQL — strong consistency and well-suited to structured data with clear relationships) is still the default for transactional business data. Non-relational/NoSQL splits further: document stores (MongoDB — flexible, nested JSON-like records, good for evolving schemas), key-value (Redis — extreme read/write speed for simple lookups, caching), column-family (Cassandra — write-heavy, wide-scale analytical workloads), and graph (Neo4j — relationships *are* the data, ideal for social networks or recommendation engines). Hierarchical and network models are largely historical (legacy mainframe/IMS systems) but still show up in some enterprise migrations.

**Say it:** "I pick the data model off the actual access pattern — relational when relationships and consistency matter and the schema's stable, document when the schema genuinely varies record to record, graph when the relationships themselves are the query, not a side detail."
**Red flag:** Defaulting to relational for every requirement regardless of the data's actual shape. A deeply nested, schema-varying product catalog forced into rigid relational tables usually means either a sprawling join structure or a lot of unused nullable columns.

### Table relationship types
**They ask:** "What types of relationships exist between tables in a relational model, and how do you implement each?"

One-to-one (rare — usually a sign two tables could be merged, or a deliberate split for security/performance reasons, e.g. separating sensitive fields into their own table), one-to-many (the common case — one customer, many orders — implemented with a foreign key on the "many" side pointing back to the "one"), and many-to-many (a product can be in many orders, an order has many products — implemented via a junction/associative table holding both foreign keys, since neither table can hold a variable-length list of the other's IDs directly in a normalized model).

```sql
CREATE TABLE order_items (
  order_id   INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  quantity   INT NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
```

**Say it:** "Many-to-many always needs a junction table in a normalized model — I've seen the mistake where someone tries to store a comma-separated list of IDs in one column instead, which breaks every relational guarantee (referential integrity, indexing, querying) the database was supposed to provide."
**Red flag:** Storing a many-to-many relationship as a delimited string in a single column instead of a junction table. It looks like it works until you need to query, index, or enforce referential integrity on it.

### DBMS functions
**They ask:** "What functions does a DBMS provide beyond just storing and retrieving data?"

External-memory data management (efficiently storing data larger than fits in RAM, with disk-based indexing), in-memory/buffer management (caching hot data for speed), change logging/write-ahead logging (the mechanism that makes crash recovery and rollback possible — every change is logged before it's applied), backup and restore, and support for a query/data-manipulation language. The write-ahead log specifically is worth knowing by name — it's the mechanism underneath both crash recovery and, in many systems, replication.

**Say it:** "The write-ahead log is the unglamorous function that makes both crash recovery and replication possible — every change is durably logged before it's applied, which is what lets a DBMS replay to a consistent state after a crash instead of just losing whatever was mid-write."
**Red flag:** Describing a DBMS purely as "where the data lives," with no mention of logging, recovery, or concurrency control. Those are exactly the functions that separate a real DBMS from a file on disk.

### Data Warehouse vs. operational database
**They ask:** "What's a data warehouse, and how is it different from the operational database an application runs on?"

An operational (OLTP) database is optimized for many small, fast reads and writes from the live application — normalized, indexed for point lookups. A data warehouse is optimized for OLAP — large, complex analytical queries across historical data, often denormalized (star/snowflake schema) specifically because joins across many normalized tables are slow at analytical scale. Running heavy analytical queries directly against the operational database is a real anti-pattern — it competes for the same resources the live application needs and can degrade production performance, which is exactly why the warehouse exists as a separate system fed by ETL.

**Say it:** "Running a heavyweight analytics query against the production OLTP database isn't a shortcut, it's a production-performance risk — that's the actual reason the warehouse exists as a separate, denormalized system, not just organizational preference."
**Red flag:** Proposing to run analytical reporting directly against the live transactional database "to keep it simple." That's precisely the resource contention a data warehouse exists to eliminate.

### Data Warehouse vs. Data Lake
**They ask:** "What's the difference between a Data Warehouse and a Data Lake?"

A Data Warehouse stores structured, already-modeled data (schema-on-write — the shape is defined before data goes in) — optimized for known, repeated business queries. A Data Lake stores raw data in its native format — structured, semi-structured, and unstructured together (schema-on-read — the shape is applied when you query it, not when you store it) — optimized for exploratory analysis, machine learning, and cases where you don't yet know every question you'll want to ask. The trade-off: a warehouse gives fast, reliable answers to known questions; a lake gives flexibility for unknown future questions at the cost of needing more work (and more discipline to avoid becoming an unusable "data swamp") at query time.

**Say it:** "Schema-on-write versus schema-on-read is the real distinction — a warehouse commits to the shape of the data upfront for fast known-query performance, a lake defers that decision so it can hold data for questions nobody's asked yet."
**Red flag:** Recommending a data lake for a reporting need with a small, fixed set of known business questions. That's paying the flexibility cost of schema-on-read for a use case that never needed it.

### ETL — Extract, Transform, Load
**They ask:** "What is ETL, and why does the 'Transform' step matter as much as it does?"

Extract pulls data from one or more source systems; Load puts it into the destination (warehouse/lake); Transform — the step that does the actual work — cleans, deduplicates, reshapes, and applies business rules so the data is trustworthy and query-ready by the time it lands. Skipping or under-specifying Transform is where "garbage in, garbage out" actually happens: a dashboard built on unvalidated, untransformed data produces confidently wrong numbers, and it's very hard to trace the error back once it's several reporting layers downstream.

**Say it:** "Transform is where data quality actually gets decided — a dashboard built on a pipeline that skipped deduplication or validation doesn't fail loudly, it just quietly produces a wrong number nobody catches until someone acts on it."
**Red flag:** Specifying an ETL pipeline's requirement as just "load the data into the warehouse" with no transformation/validation rules stated. That's the step where data quality gets decided, and leaving it unspecified means it gets decided by accident.

### Database normalization
**They ask:** "What is database normalization, and what problem does it actually solve?"

Normalization organizes a relational schema to eliminate data redundancy and the update anomalies redundancy causes — if a customer's address is duplicated across every one of their orders, updating it means finding and fixing every duplicate, and missing one leaves inconsistent data with no way to tell which copy is "right." The normal forms (1NF: atomic values, no repeating groups; 2NF: no partial dependency on a composite key; 3NF: no transitive dependency on non-key columns) progressively remove these redundancies. The trade-off: a fully normalized schema needs more joins to reconstruct a full record, which is exactly why analytical/warehouse schemas deliberately denormalize for read speed.

**Say it:** "Normalization's real payoff is eliminating update anomalies, not just tidiness — duplicated data that can silently drift out of sync is the actual bug it prevents, and I only trade that away deliberately, for read performance in an analytical schema, not by accident in a transactional one."
**Red flag:** Treating denormalization anywhere in a schema as automatically wrong. It's the right, deliberate trade-off in a read-heavy analytical/warehouse context — the mistake is denormalizing an OLTP schema by accident and inheriting the update-anomaly risk without meaning to.

### Constraints — PK, FK, and beyond
**They ask:** "What database constraint types exist, and what does each one actually enforce?"

Primary Key (PK) uniquely identifies each row and can't be null — the table's identity. Foreign Key (FK) enforces referential integrity — a row can't reference a parent that doesn't exist, and (depending on cascade rules) deleting a parent can cascade, restrict, or null out the child. `UNIQUE` enforces no-duplicates on a non-key column. `NOT NULL` enforces a field must have a value. `CHECK` enforces an arbitrary business rule at the database level (`price >= 0`). The senior point: constraints are the last line of defense — enforcing a rule at the DB level catches violations even from a buggy application path or a direct data-fix script that skipped the app's validation layer entirely.

```sql
CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id),
  total       NUMERIC CHECK (total >= 0)
);
```

**Say it:** "Constraints are the last line of defense — a CHECK constraint on price catches a bad value even from a buggy background job or a one-off data-fix script that bypassed the application's own validation."
**Red flag:** Relying only on application-layer validation for a business rule ("price can never be negative") with no database-level constraint backing it up. Any code path that bypasses the app — a script, a migration, a second service writing to the same table — bypasses the rule too.

### Building data queries and analyzing arrays of data
**They ask:** "What SQL/query experience should an analyst have, beyond writing a basic SELECT?"

Beyond `SELECT`/`WHERE` basics: joins (inner vs. left/right/outer — knowing which rows survive each), aggregation (`GROUP BY`, `HAVING`, `COUNT`/`SUM`/`AVG`), and enough comfort reading a query plan to sanity-check whether a "the report is slow" complaint traces to a missing index or a genuinely large dataset. The practical use case for an analyst specifically: pulling your own evidence to validate a requirement or investigate a discrepancy directly, instead of always waiting on a developer to run a query for you — that independence is a real seniority marker.

```sql
SELECT c.name, COUNT(o.id) AS order_count, SUM(o.total) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= '2026-01-01'
GROUP BY c.name
HAVING COUNT(o.id) > 5
ORDER BY revenue DESC;
```

**Say it:** "Being able to pull my own query to validate a requirement or investigate a discrepancy — instead of waiting on a developer every time — is a real independence signal, and it's the SQL skill I actually lean on day to day, not writing complex joins from memory."
**Red flag:** Claiming SQL fluency but being unable to explain the difference between an inner and a left join, or what a `GROUP BY` without the right columns in `SELECT` actually does. That gap shows up fast in a live query-writing exercise.

### Choosing a database type by data shape
**They ask:** "How do you decide between SQL and NoSQL — or which NoSQL flavor — for a given system, with an example?"

The decision runs on data shape and access pattern, not "NoSQL scales better" as a blanket claim. A financial ledger needs strong consistency and well-defined relationships — relational, full stop. A product catalog where different categories have wildly different attribute sets fits a document store better than forcing every product into the same rigid table with dozens of nullable columns. A session cache needs sub-millisecond key lookups with no query complexity — Redis, not a full relational DB. A social graph where "who's connected to whom, how" *is* the query — a graph database. The interview signal is reasoning from the access pattern to the choice, not reciting "SQL is for structured data, NoSQL is for unstructured."

**Say it:** "I reason from the access pattern, not a blanket rule — a financial ledger needs relational consistency, a session cache needs Redis's raw key-lookup speed, and a social graph needs a graph database because the relationships themselves are the query, not a side detail."
**Red flag:** Answering "SQL versus NoSQL" with "NoSQL scales better" as the entire justification. That's a half-true generalization that ignores the actual access-pattern reasoning an interviewer is testing for.
