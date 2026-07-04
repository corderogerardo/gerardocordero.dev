window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "postgres-at-scale",
  title: "Postgres at Scale",
  emoji: "🐘",
  lang: "python",
  lessons: [
    {
      id: "reading-explain",
      title: "Reading EXPLAIN",
      steps: [
        {
          type: "text",
          md: [
            "## Ask Postgres what it's actually doing",
            "`EXPLAIN` shows the **query plan** Postgres picked for a query, without running it — just the plan and its cost estimate. `EXPLAIN ANALYZE` actually runs the query and adds real numbers: actual time, actual rows returned, how many times each step ran. When a query feels slow, this is the first thing to reach for, before touching any code.",
            "The two scan types you'll see constantly: a **sequential scan** (`Seq Scan`) reads every row in the table, in order, checking each one against the filter. An **index scan** (`Index Scan`) uses a B-tree to jump straight to the matching rows without touching the rest of the table. On a table with a handful of rows, a seq scan is fine — even faster, since there's no index to consult. On a table with a million bookings, a seq scan to find one walker's rows means reading all million.",
          ],
        },
        {
          type: "text",
          md: [
            "## Cost estimate vs actual — two different things",
            "`cost=0.00..458.00` is Postgres's **guess**, in arbitrary cost units, before running anything — the planner's estimate of how expensive this step is, based on table statistics. `rows=8420` next to it is also a guess: how many rows the planner expects this step to return.",
            "`actual time=0.031..4.912 rows=1 loops=1` is what really happened when `ANALYZE` ran the query: the step took 4.912ms, returned 1 row, ran once. When the estimate and the actual rows are wildly different — planner guessed 8420, got 1 — that's a signal the table's statistics are stale (fixed with `ANALYZE tablename`, no relation to `EXPLAIN ANALYZE`) or the query shape is fighting the planner.",
            "> A seq scan isn't automatically bad. On a table with a few hundred rows, or a query that legitimately needs most of the table anyway, a seq scan can beat an index scan — index scans still cost a random-access read per matching row. The problem is a seq scan on a **large** table for a query that only wants a handful of rows.",
          ],
        },
        {
          type: "code",
          title: "EXPLAIN ANALYZE — before an index exists",
          source: String.raw`EXPLAIN ANALYZE
SELECT * FROM bookings WHERE walker_id = 42;

                          QUERY PLAN
--------------------------------------------------------------
Seq Scan on bookings  (cost=0.00..458.00 rows=812 width=96)
                      (actual time=0.031..4.912 rows=812 loops=1)
  Filter: (walker_id = 42)
  Rows Removed by Filter: 199188
Planning Time: 0.084 ms
Execution Time: 5.021 ms`,
          caption: "200,000 rows in `bookings`, and this query only wants 812 of them — but a seq scan still reads all 200,000, throwing away 199,188 after checking each one (`Rows Removed by Filter`). That's the shape of query an index fixes.",
        },
        {
          type: "quiz",
          q: "You run EXPLAIN ANALYZE on a query against a 5-row lookup table (like a list of service categories) and see a Seq Scan. What does that signal?",
          choices: [
            "Nothing to worry about — on a tiny table, a seq scan is often the planner's best choice, and adding an index wouldn't meaningfully speed it up",
            "The table is badly designed and needs an index immediately",
            "Postgres is broken and failed to use an available index",
            "The query is definitely going to time out in production",
          ],
          answer: 0,
          explain: "A seq scan is only a problem when the table is large enough that reading every row costs real time. On 5 rows, reading all of them is a handful of memory reads either way — an index would add maintenance overhead for zero practical gain. The `bookings` example is different because 200,000 rows is large enough that skipping the other 199,188 actually matters.",
          nudge: "Think about how many rows a seq scan has to touch here — does reading all of them cost anything meaningful?",
        },
      ],
    },
    {
      id: "indexes-earn-keep",
      title: "Indexes that earn their keep",
      steps: [
        {
          type: "text",
          md: [
            "## The B-tree, and why column order matters",
            "Postgres's default index type is a **B-tree** — a sorted, balanced tree that lets it jump to a matching value in roughly logarithmic time instead of scanning every row. Reach for one whenever a column shows up often in a `WHERE`, a `JOIN`, or an `ORDER BY` on a table big enough that a seq scan hurts.",
            "A **composite index** covers more than one column, and column order is not cosmetic — it follows the **leftmost-prefix rule**. An index on `(walker_id, status)` can serve a query that filters on `walker_id` alone, or on `walker_id AND status` together, because both start by narrowing on the leftmost column first. It can NOT efficiently serve a query that filters on `status` alone — that's like using a phone book sorted by last name to look someone up by first name only. Rule of thumb: put the column used for **equality** (`walker_id = 42`) before the column used for a **range or sort** (`status`, `created_at`).",
          ],
        },
        {
          type: "text",
          md: [
            "## Indexes are not free",
            "Every index Postgres has to update on every `INSERT`, `UPDATE`, or `DELETE` to the indexed columns — more indexes means slower writes, plus the index itself takes disk space. That's the tradeoff: don't index a column just because it exists. Index the columns your actual slow queries filter or sort on, and check `EXPLAIN` to confirm the index is even getting picked before assuming it helped.",
            "A **partial index** narrows the index to only the rows a hot query cares about, via a `WHERE` clause on the index itself. Bookings accumulate a `completed` and `cancelled` status forever, but the dashboard only ever queries `status = 'active'` — indexing all rows wastes space on statuses nobody filters on. `CREATE INDEX ... WHERE status = 'active'` builds an index covering only the active rows, smaller and faster to maintain than a full index.",
          ],
        },
        {
          type: "code",
          title: "Composite + partial indexes, SQL and SQLAlchemy",
          source: String.raw`-- Composite: walker_id (equality) before status (range/filter)
CREATE INDEX ix_bookings_walker_status
    ON bookings (walker_id, status);

-- Partial: only index the rows the dashboard actually queries
CREATE INDEX ix_bookings_active
    ON bookings (walker_id)
    WHERE status = 'active';`,
          caption: "SQLAlchemy mirrors both directly.",
        },
        {
          type: "code",
          title: "app/models.py — Index() on a model",
          source: String.raw`from sqlalchemy import Index
from sqlalchemy.orm import Mapped, mapped_column


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    walker_id: Mapped[int] = mapped_column()
    status: Mapped[str] = mapped_column()

    __table_args__ = (
        Index("ix_bookings_walker_status", "walker_id", "status"),
    )`,
          caption: "`Index(name, *columns)` in `__table_args__` — column order in the call is the column order in the index, so `walker_id` first still matters here.",
        },
        {
          type: "exercise",
          title: "Index a hot two-column lookup",
          prompt: [
            "The `Walk` model gets queried by `walker_id` and `started_at` together (a walker's walks in order). Add an `__table_args__` tuple with an `Index()` named `\"ix_walks_walker_started\"` on `walker_id` and `started_at`, in that order.",
          ],
          starter: String.raw`from sqlalchemy import Index
from sqlalchemy.orm import Mapped, mapped_column


class Walk(Base):
    __tablename__ = "walks"

    id: Mapped[int] = mapped_column(primary_key=True)
    walker_id: Mapped[int] = mapped_column()
    started_at: Mapped[str] = mapped_column()

    # your code here`,
          solution: String.raw`from sqlalchemy import Index
from sqlalchemy.orm import Mapped, mapped_column


class Walk(Base):
    __tablename__ = "walks"

    id: Mapped[int] = mapped_column(primary_key=True)
    walker_id: Mapped[int] = mapped_column()
    started_at: Mapped[str] = mapped_column()

    __table_args__ = (
        Index("ix_walks_walker_started", "walker_id", "started_at"),
    )`,
          checks: [
            { re: /__table_args__=\(/, hint: "Declare `__table_args__ = ( … )` as a tuple on the model." },
            { re: /Index\("ix_walks_walker_started","walker_id","started_at"\)/, hint: "Call `Index(\"ix_walks_walker_started\", \"walker_id\", \"started_at\")` — name first, then columns in equality-before-range order." },
          ],
          mustNot: [
            { re: /Index\("ix_walks_walker_started","started_at","walker_id"\)/, hint: "Column order matters — `walker_id` (the equality filter) goes first, `started_at` (the sort/range column) second." },
          ],
          success: "That composite index now serves lookups filtered on walker_id alone, or on walker_id plus a started_at range — both follow the leftmost-prefix rule.",
        },
        {
          type: "quiz",
          q: "Why does column order matter in a composite index on (walker_id, status)?",
          choices: [
            "The index can efficiently serve queries filtering on walker_id alone or on walker_id AND status, but not on status alone — a composite index only helps when the query uses a leftmost prefix of its columns",
            "Column order is purely cosmetic — Postgres reorders columns internally to whatever's fastest",
            "It only matters for indexes with three or more columns, never for two",
            "The second column is always ignored by the query planner regardless of order",
          ],
          answer: 0,
          explain: "A B-tree composite index is sorted by the first column, then the second within each value of the first — so it's only useful for lookups that start from that leftmost column. A query filtering on status alone gets no help from an index sorted primarily by walker_id.",
          nudge: "Think of a phone book sorted by (last name, first name) — can you look someone up efficiently by first name alone?",
        },
      ],
    },
    {
      id: "orm-n-plus-one",
      title: "The ORM N+1, at the query layer",
      steps: [
        {
          type: "text",
          md: [
            "## The same N+1 you saw in Ruby — now in SQLAlchemy",
            "If you've taken the Ruby course, this will feel familiar: fetch a list of walkers, then loop over them accessing `walker.bookings` — and each access fires its own query. Ten walkers means one query to fetch the walkers, plus ten more to fetch each one's bookings. That's **N+1 queries** for what should be two.",
            "It happens because a relationship like `Walker.bookings` is **lazy** by default — SQLAlchemy doesn't fetch related rows until your code actually touches the attribute, and by then the original query has already finished. Async SQLAlchemy makes this worse: touching a lazy relationship outside an active session context raises `MissingGreenlet` instead of quietly running an extra query (you met this in module 32) — so the N+1 either silently costs you N extra round trips, or crashes outright.",
          ],
        },
        {
          type: "text",
          md: [
            "## Fixing it: ask for the relationship up front",
            "`selectinload(Walker.bookings)` tells SQLAlchemy: after fetching the walkers, immediately run ONE more query that grabs every matching booking in a single `WHERE walker_id IN (...)`. Two queries total, no matter how many walkers. You can confirm this by passing `echo=True` to `create_async_engine` (or `create_engine`) — it logs every SQL statement SQLAlchemy runs, so you can literally count them and watch the N+1 disappear.",
            "The fix is a query-time decision, not a schema change: add `.options(selectinload(...))` onto the `select()` statement wherever you're about to loop over a relationship, right where the N+1 would otherwise happen.",
          ],
        },
        {
          type: "code",
          title: "app/routers/walkers.py — selectinload prevents the N+1",
          source: String.raw`from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models import Walker


async def list_walkers_with_bookings(session) -> list[Walker]:
    stmt = select(Walker).options(selectinload(Walker.bookings))
    result = await session.execute(stmt)
    walkers = result.scalars().all()
    # walker.bookings is already loaded here — no extra query per walker
    return list(walkers)`,
          caption: "Two queries run total: one for `walkers`, one `SELECT ... WHERE walker_id IN (...)` covering every walker's bookings at once. Without `.options(...)`, that second query would instead fire once per walker the moment `walker.bookings` is touched.",
        },
        {
          type: "exercise",
          title: "Add selectinload to the walkers query",
          prompt: [
            "Add `.options(selectinload(Walker.bookings))` onto the `select(Walker)` statement so the caller can loop over each walker's `bookings` without triggering a query per walker.",
          ],
          starter: String.raw`from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models import Walker


async def list_walkers_with_bookings(session) -> list[Walker]:
    stmt = select(Walker)  # your code here
    result = await session.execute(stmt)
    return list(result.scalars().all())`,
          solution: String.raw`from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models import Walker


async def list_walkers_with_bookings(session) -> list[Walker]:
    stmt = select(Walker).options(selectinload(Walker.bookings))
    result = await session.execute(stmt)
    return list(result.scalars().all())`,
          checks: [
            { re: /stmt=select\(Walker\)\.options\(selectinload\(Walker\.bookings\)\)/, hint: "Chain the eager-load directly onto the statement you execute: `stmt = select(Walker).options(selectinload(Walker.bookings))` — attaching it to a throwaway variable leaves the real query with its N+1." },
          ],
          success: "One extra query now loads every walker's bookings up front — loop over walker.bookings all you want, no per-row query fires.",
        },
        {
          type: "quiz",
          q: "You're loading walkers and for each one, rendering ONE related field: their single most-recent booking joined via a one-to-one style lookup. Another dev suggests joinedload instead of selectinload here — what's the actual tradeoff?",
          choices: [
            "joinedload fetches everything in one query via a SQL JOIN (no round trip, but duplicates the walker's columns once per related row); selectinload always uses two queries (a small second round trip, but no duplicated data and it composes cleanly with LIMIT/OFFSET on the parent)",
            "There's no difference — both strategies always run exactly the same SQL",
            "joinedload is strictly worse in every case and should never be used",
            "selectinload only works for one-to-one relationships, never one-to-many",
          ],
          answer: 0,
          explain: "joinedload's single JOIN avoids a round trip but repeats every walker column for each matched row — fine for a true one-to-one, wasteful for a one-to-many with many rows per parent. selectinload's second query has network round-trip cost but no duplication, and doesn't fight a LIMIT on the outer query the way a JOIN can. Neither is universally better — it's a one-round-trip-with-duplication vs two-round-trips-without tradeoff.",
          nudge: "One SQL JOIN vs two separate SELECTs — what does a JOIN do to the walker's own columns when a walker has many matching rows on the other side?",
        },
      ],
    },
    {
      id: "zero-downtime-alembic",
      title: "Zero-downtime migrations with Alembic",
      steps: [
        {
          type: "text",
          md: [
            "## A migration can lock the table it's changing",
            "You met Alembic's basic idea back in module 25. At scale, HOW you write a migration matters as much as what it does. Adding a column with `NOT NULL` and a default to a large existing table sounds harmless — but Postgres historically had to rewrite every existing row to backfill the default, holding a lock on the whole table for the duration. On a bookings table with millions of rows, that's minutes of the table being unreadable and unwritable — a real outage, not a hypothetical one.",
            "(Modern Postgres optimizes a **constant** default to be metadata-only and fast — but a computed or non-constant default, or an older Postgres version, still triggers the full rewrite. Treat 'add NOT NULL + default to a big table' as dangerous by default rather than betting on which case you're in.)",
          ],
        },
        {
          type: "text",
          md: [
            "## The safe multi-step pattern",
            "Split one risky migration into several boring ones, deployed one at a time:",
            "1. Add the column as **nullable**, no default — this is fast, metadata-only, no rewrite.\n2. **Backfill** existing rows in batches (`UPDATE ... WHERE id BETWEEN ... LIMIT ...` in a loop), not one giant `UPDATE` — a single massive update still locks for its whole duration.\n3. Once every row has a value, THEN add the `NOT NULL` constraint in its own migration.",
            "**Expand-contract** is the same idea applied to renames: add the new column, write to both old and new for a while, backfill, switch reads to the new column, THEN drop the old one — never rename in place, which breaks any code still deployed against the old name mid-rollout. The one rule that covers both patterns: never ship a migration that drops or renames a column in the same deploy that stops using it. A rolling deploy means old and new code run side by side for a few minutes — old code hitting a column that's already gone is a guaranteed error.",
          ],
        },
        {
          type: "code",
          title: "alembic/versions/xxxx_add_walker_bio.py — nullable-first step",
          source: String.raw`"""add bio column to walkers, nullable first"""
from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4"
down_revision = "9f8e7d6c"


def upgrade() -> None:
    op.add_column(
        "walkers",
        sa.Column("bio", sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("walkers", "bio")`,
          caption: "Nullable, no default — Postgres just updates the table's metadata to say this column exists and every existing row's value is NULL. No row-by-row rewrite, no long lock. A later migration backfills, and only once that's done does a THIRD migration add `NOT NULL`.",
        },
        {
          type: "exercise",
          title: "Add the column nullable-first",
          prompt: [
            "Inside `upgrade()`, call `op.add_column(\"walkers\", sa.Column(\"phone\", sa.String(), nullable=True))` — a nullable column, no default, safe on a large table.",
          ],
          starter: String.raw`from alembic import op
import sqlalchemy as sa

revision = "b2c3d4e5"
down_revision = "a1b2c3d4"


def upgrade() -> None:
    # your code here
    pass


def downgrade() -> None:
    op.drop_column("walkers", "phone")`,
          solution: String.raw`from alembic import op
import sqlalchemy as sa

revision = "b2c3d4e5"
down_revision = "a1b2c3d4"


def upgrade() -> None:
    op.add_column("walkers", sa.Column("phone", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("walkers", "phone")`,
          checks: [
            { re: /op\.add_column\("walkers",sa\.Column\("phone",sa\.String\(\),nullable=True\)\)/, hint: "Call `op.add_column(\"walkers\", sa.Column(\"phone\", sa.String(), nullable=True))` — table name, then the new column spec." },
            { re: /nullable=True/, hint: "The column must be `nullable=True` — that's what keeps this migration a fast, metadata-only change on a big table." },
          ],
          success: "Fast and safe: this migration only updates table metadata. A follow-up migration backfills phone numbers in batches, and only a third migration would flip it to NOT NULL.",
        },
        {
          type: "quiz",
          q: "Why add a new column as nullable first on a large table, instead of nullable=False with a default in one step?",
          choices: [
            "A nullable column with no default is a fast, metadata-only change; forcing NOT NULL with a non-constant default (or on an older Postgres) can require rewriting every existing row, locking the whole table for the duration",
            "Postgres doesn't support adding NOT NULL columns to tables that already have rows, under any circumstances",
            "It's purely a style convention with no performance difference either way",
            "Nullable columns take up less disk space permanently, forever, than non-nullable ones",
          ],
          answer: 0,
          explain: "The risk is the rewrite, not a hard limitation — a big table plus a full rewrite means a long table-wide lock, which on a production bookings table means user-facing downtime. Splitting into nullable-add, batched-backfill, then constrain-to-NOT-NULL keeps every individual step fast.",
          nudge: "What does Postgres have to do to every existing row to satisfy NOT NULL immediately — and how long does a lock on a huge table take to clear?",
        },
      ],
    },
  ],
});
