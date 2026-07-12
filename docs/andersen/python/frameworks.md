# Python — web frameworks (Django/DRF, Flask, FastAPI, SQLAlchemy)

### WSGI vs ASGI and what the *SGI server actually does
**They ask:** "What interface does the WSGI standard describe? What about ASGI? How are the web server, WSGI server, and web framework related?"

WSGI (PEP 3333) is a synchronous calling convention: a single `application(environ, start_response)` callable that a WSGI server (Gunicorn, uWSGI) invokes once per request, blocking that worker until the framework returns a response. It has no concept of anything happening after the response starts — no WebSockets, no long-lived connections. ASGI is the async successor: an `async def application(scope, receive, send)` callable that can `await` and keep a connection open, which is what makes WebSockets, Server-Sent Events, and HTTP/2 streaming possible from a Python framework (FastAPI, Django with Channels).

The three-layer relationship: the **web server** (nginx) terminates TLS and serves static files efficiently; the **WSGI/ASGI server** (Gunicorn, Uvicorn) is a bridge that speaks HTTP on one side and the WSGI/ASGI Python calling convention on the other; the **framework** (Django, Flask, FastAPI) is the Python code that implements that callable.

**Say it:** "WSGI is a synchronous request/response callable with no concept of a connection that outlives the response, which is exactly what ASGI adds — the model FastAPI and Django Channels need for WebSockets and streaming."
**Red flag:** Saying "ASGI is just async WSGI" without naming the concrete capability gap — WSGI structurally can't represent a long-lived bidirectional connection, no matter how you rewrite the handler.

### Routing and the web framework's core job
**They ask:** "What are the main tasks of a web framework? What is routing?"

A web framework's job, stripped to essentials, is turning an HTTP request into a Python function call and a response back into HTTP bytes — everything else (ORM, templating, forms, auth) is convenience built on top of that core loop. Routing is the piece that maps a URL pattern + HTTP method to the handler that should run it, usually via a table or decorator (`@app.route("/users/<id>")`, Django's `urlpatterns`). The senior point: routing is a lookup structure, and how it's implemented (regex, trie, decorator registration order) affects both correctness (ambiguous route matches) and startup performance for apps with thousands of routes.

**Say it:** "Routing is the dispatch table from URL + method to handler — the framework's real job underneath ORM and templating is just request-in, function-call, response-out."
**Red flag:** Describing a framework purely by its features (ORM, admin panel) without naming the request/response dispatch loop that's actually the framework's core contract.

### MVC vs Django's MTV
**They ask:** "What is MVC? For Django, compare it with MTV."

MVC splits an app into Model (data + business rules), View (presentation), and Controller (request handling that ties them together). Django uses the same separation but different names because its "View" is actually the *Controller* in MVC terms — it's the Python function/class that receives the request and decides what to do — while what Django calls a "Template" is MVC's *View* (the presentation layer), and Django's "Model" matches MVC's Model directly. So Django is MVC with the Controller and View labels effectively swapped, which trips people who assume `views.py` means presentation logic.

**Say it:** "Django's MTV is MVC with different labels: Django's View is MVC's Controller, and Django's Template is MVC's View — the model layer is the only name that lines up directly."
**Red flag:** Assuming Django's `views.py` holds presentation/HTML logic because it's called "View." It holds request-handling logic — the Controller role — while templates hold the actual presentation.

### Middleware
**They ask:** "What is Middleware in a web framework?"

Middleware is code that wraps every request/response in a pipeline, sitting between the server and your handler (or between handlers), so cross-cutting concerns — auth checks, logging, CORS headers, gzip compression, CSRF validation — run once, centrally, instead of being duplicated in every view. Each layer can inspect/modify the request on the way in, call the next layer, then inspect/modify the response on the way out, forming a chain of responsibility. Django's `MIDDLEWARE` list and Flask's `before_request`/`after_request` hooks are both this same pattern with different syntax.

```python
# Flask-style middleware via hooks
@app.before_request
def check_auth():
    if not request.headers.get("Authorization"):
        abort(401)
```

**Say it:** "Middleware is a request/response pipeline for cross-cutting concerns — auth, logging, compression — so I don't duplicate that logic in every single view."
**Red flag:** Putting authentication or logging logic inside individual view functions "for now." That's the exact duplication middleware exists to eliminate, and it silently diverges as views multiply.

### CSRF protection
**They ask:** "What is CSRF protection and how is it implemented in web frameworks?"

CSRF (Cross-Site Request Forgery) exploits the fact that a browser automatically attaches cookies (including session cookies) to *any* request to a site, even one triggered by a malicious page the user has open in another tab — so an attacker's page can silently submit a form to your app, and the browser helpfully includes your session cookie, making it look like a legitimate authenticated request. The defense is a token the attacker's page can't know: the server embeds a random CSRF token in forms (Django's `{% csrf_token %}`) or issues it as a double-submit cookie, and rejects any state-changing request that doesn't echo it back. It only matters for cookie-based session auth — token-based auth in an `Authorization` header isn't automatically attached by the browser, so it's naturally CSRF-resistant (though still needs its own protections against token theft).

**Say it:** "CSRF works because browsers auto-attach cookies to any request regardless of origin — the fix is a token the attacker's page can't guess, which is why it's a cookie-session concern and largely a non-issue for header-based auth."
**Red flag:** Disabling CSRF protection globally to "fix" a form submission error instead of understanding why the token wasn't sent — that removes a real security control for what's usually a frontend wiring bug.

### Django: models, views, templates, and manage.py
**They ask:** "What is a model, a template? How do urls.py and views.py differ? What is manage.py for?"

A **model** is a Python class mapped to a database table (Django's ORM layer) — fields become columns, instances become rows. A **template** is the presentation layer, HTML with Django's template language for interpolation and control flow, deliberately kept logic-light to enforce separation of concerns. `urls.py` is the routing table (URL pattern → view); `views.py` holds the actual request-handling functions/classes those patterns point to — so `urls.py` answers "which code runs" and `views.py` *is* that code. `manage.py` is Django's CLI entry point for admin tasks that aren't part of the running app itself: `runserver`, `migrate`, `makemigrations`, `createsuperuser`, `shell`.

**Say it:** "Models are the data layer, templates are presentation, urls.py is the routing table, and views.py is what it routes to — manage.py is the operational CLI for everything that happens outside a request, like migrations."
**Red flag:** Putting business logic or query construction directly in templates. Templates should stay declarative; anything with real logic belongs in the view or a model method.

### DRF serializers
**They ask:** "What is DRF? What is a Serializer?"

Django REST Framework is Django's toolkit for building HTTP APIs on top of the same models/views/urls foundation, adding the pieces a JSON API needs that HTML views don't: content negotiation, browsable API docs, and — the core one — **serializers**. A serializer does two jobs symmetric to each other: it converts complex data (a model instance, a queryset) into JSON-safe primitive types for a response, and it validates + converts incoming JSON back into Python/model data for a request, the same role `forms.Form` plays for HTML forms but API-shaped. `ModelSerializer` auto-generates fields from a model, the way `ModelForm` does.

```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "created_at"]
```

**Say it:** "A serializer is the symmetric translator between Python/model objects and JSON — validating and deserializing on the way in, and shaping the output on the way out — which is what makes DRF a real API framework instead of just Django returning HttpResponse strings."
**Red flag:** Hand-rolling JSON construction (`{"id": u.id, ...}`) in a view instead of a serializer. That duplicates validation and shaping logic across every endpoint that touches the model.

### Django signals
**They ask:** "What is the signature of a Signal in Django? What are Django Channels, and why does a View need a dispatch method?"

A **signal** lets decoupled code react to an event elsewhere in the app without the sender knowing who's listening — Django fires built-ins like `post_save`, `pre_delete` after model operations, and a receiver function subscribes with a signature of `receiver(sender, instance, created, **kwargs)` for `post_save`. It's useful for cross-cutting side effects (send a welcome email when a `User` is created) but overuse makes control flow hard to trace, since "what runs when I save this model" is no longer visible at the call site. **Django Channels** extends Django to handle WebSockets and other long-lived, async protocols via ASGI, since vanilla Django's request cycle is WSGI-only. The `dispatch` method on class-based views is the entry point that routes an incoming request to the right HTTP-method handler (`get`, `post`, etc.) — it's the mechanism, not a convenience, that makes `class MyView(View)` work at all.

**Say it:** "Signals decouple side effects from the code that triggers them, but that indirection has a cost — I reach for them for genuinely cross-cutting concerns, not as a substitute for an explicit method call in the same request flow."
**Red flag:** Chaining several signal handlers to implement what's really one sequential business operation. That scatters a single logical flow across files with no visible call order — a plain method call is more debuggable.

### Django ORM: QuerySet laziness
**They ask:** "What is a QuerySet? When does the query actually get sent to the database?"

A `QuerySet` is lazy — building one (`User.objects.filter(active=True)`) doesn't touch the database at all; it just accumulates a description of the query. The SQL only fires when the QuerySet is *evaluated*: iterating it, calling `len()`/`list()`/`bool()` on it, slicing with a step, or calling a method that forces a result (`.get()`, `.count()`, `.exists()`). This laziness is what makes chained filtering ergonomic (`User.objects.filter(a=1).filter(b=2).exclude(c=3)` is one query, not three) but it's also the source of the classic bug where a QuerySet gets evaluated once for a debug `print()` and then re-evaluated (re-querying) when actually used later.

```python
qs = User.objects.filter(active=True)   # no query yet
print(qs.query)                          # still no query — inspects SQL only
users = list(qs)                         # query fires here
```

**Say it:** "QuerySets are lazy — they describe a query, not run one — so I can build up filters cheaply, but I have to be deliberate about when I force evaluation, or I end up re-querying the same data twice."
**Red flag:** Calling `list()` or iterating a QuerySet multiple times in one view "for convenience" without caching it. Each evaluation is a fresh round-trip to the database.

### select_related and prefetch_related
**They ask:** "What are select_related and prefetch_related in Django ORM? How does select_related behave with no arguments?"

Both exist to solve the N+1 query problem, but for different relationship shapes. `select_related` follows **forward** foreign-key / one-to-one relationships using a SQL `JOIN`, pulling the related row into the same query — one round trip total. `prefetch_related` handles **reverse** foreign keys and many-to-many relationships, where a JOIN would multiply rows; it instead issues a *second* query for the related objects and stitches them together in Python. Called with no field arguments, `select_related()` follows *every* single-valued relationship it can discover — convenient, but it can silently balloon the JOIN and column count on a wide model graph, so specifying fields explicitly is the senior default.

```python
# N+1: one query per order for .customer
orders = Order.objects.all()
for o in orders: print(o.customer.name)

# One JOIN query
orders = Order.objects.select_related("customer")
```

**Say it:** "select_related JOINs forward relationships in one query, prefetch_related runs a second query for reverse/M2M relationships and joins them in Python — mixing them up either multiplies rows or misses the N+1 fix entirely."
**Red flag:** Using `select_related` on a reverse foreign key or a many-to-many field. It doesn't apply there — the correct fix is `prefetch_related`, and using the wrong one either errors or silently does nothing useful.

### Django ORM transactions and F() expressions
**They ask:** "How do you work with transactions in Django ORM? How do you use F() expressions and what do they buy you?"

Django wraps a block in a transaction with `transaction.atomic()` (as a context manager or decorator) — everything inside commits together or rolls back together on an unhandled exception, which is essential for multi-step writes like "create an order, then decrement stock." `F()` expressions let you reference a database column's *current* value inside a query instead of pulling it into Python first — `F("stock") - 1` becomes part of the SQL `UPDATE`, computed atomically by the database itself.

```python
from django.db.models import F
from django.db import transaction

with transaction.atomic():
    Product.objects.filter(id=pid).update(stock=F("stock") - 1)
    Order.objects.create(product_id=pid)
```

The reason `F()` matters under concurrency: `product.stock -= 1; product.save()` reads stock into Python, decrements, then writes — a classic read-modify-write race if two requests do it simultaneously. `F()` avoids the round trip entirely, so the decrement happens as one atomic SQL statement.

**Say it:** "`F()` pushes the read-modify-write into the database as one atomic statement, avoiding the race condition you get from pulling a value into Python, decrementing, and saving it back."
**Red flag:** `obj.field -= 1; obj.save()` on a value multiple requests can touch concurrently. That's a lost-update race — `F()` or `select_for_update()` inside `atomic()` are the fixes.

### Flask: routes, view functions, and request context
**They ask:** "What are routes in Flask? What is a view function? What are request context variables?"

A route in Flask is a URL pattern registered with `@app.route("/path")`, mapping it to a **view function** — a plain Python function that returns the response (a string, a tuple, a `Response` object, or JSON via `jsonify`). Flask's distinctive piece is **context locals**: `request`, `session`, and `g` look like plain global objects in your code, but they're actually thread-local (or more precisely, context-local under async) proxies that resolve to the *current* request's data — Flask pushes a new request context before each request and pops it after, so `request` inside one handler never sees another request's data even though it reads like a shared global.

```python
@app.route("/users/<int:user_id>")
def get_user(user_id):
    token = request.headers.get("Authorization")   # request-context local
    return jsonify({"id": user_id})
```

**Say it:** "`request` and `g` look like globals but they're context-local proxies Flask swaps per request — that's what lets simple-looking global-style code stay safe under concurrent requests."
**Red flag:** Trying to access `request` outside of an active request context (e.g. in a background thread started from a view). It raises a `RuntimeError` — you have to explicitly pass the data you need into that context, or use `copy_current_request_context`.

### Flask Blueprints and extensions
**They ask:** "What is a Flask Blueprint? How do you manage sessions, handle forms with Flask-WTF, and add caching with Flask-Caching?"

A **Blueprint** is Flask's answer to organizing a growing app: a self-contained set of routes, templates, and static files that gets registered onto the main app with a URL prefix, so a `users` Blueprint and an `orders` Blueprint stay independently testable and don't collide on route names. Beyond that, Flask deliberately ships minimal and leans on an extension ecosystem for everything else: **sessions** are Flask's own signed-cookie session by default (`session["user_id"] = u.id`), swappable for server-side storage via `Flask-Session`; **Flask-WTF** wraps WTForms for CSRF-protected form handling and validation; **Flask-Caching** adds a `@cache.cached(timeout=60)` decorator backed by Redis/memcached/simple in-memory.

**Say it:** "Flask stays a microframework on purpose — Blueprints give you modular route organization, and everything else (forms, caching, login) is an opt-in extension, so you only pay for what you use."
**Red flag:** Comparing Flask unfavorably to Django for "missing" an ORM or admin panel. That's Flask's design choice, not a gap — it's meant to be composed with the pieces you actually need.

### Why FastAPI, and Pydantic's role
**They ask:** "What are the advantages of FastAPI over other frameworks? What is Pydantic and how does FastAPI use it?"

FastAPI's pitch is deriving three things from one source of truth — a Python type-annotated function signature: automatic request **validation**, automatic **OpenAPI/Swagger docs**, and editor **autocomplete** — without the boilerplate of hand-writing a schema separately from the code. It's built on Starlette (ASGI, so native async) and **Pydantic** for the validation layer: you declare a `BaseModel` with typed fields, and FastAPI validates the incoming JSON against it before your handler even runs, converting to real Python types (`str` → `datetime`, etc.) and returning a structured 422 error automatically on mismatch.

```python
from pydantic import BaseModel
from fastapi import FastAPI

class Item(BaseModel):
    name: str
    price: float

app = FastAPI()

@app.post("/items")
async def create_item(item: Item):   # validated before this runs
    return item
```

**Say it:** "FastAPI derives validation, docs, and type-checking from one Pydantic-typed function signature, so the schema and the code can't drift apart the way hand-maintained docs do in other frameworks."
**Red flag:** Manually validating request bodies with `if` statements in a FastAPI handler. That throws away the entire point — declare the shape as a Pydantic model and let the framework validate before your code runs.

### FastAPI dependency injection
**They ask:** "What is dependency injection in FastAPI, and how do you use it?"

FastAPI's `Depends()` lets a handler declare what it needs — a DB session, the current authenticated user, a pagination object — as a function parameter, and FastAPI resolves and injects it automatically before the handler runs. The dependency itself is just a callable (often a generator, for setup/teardown): the code before `yield` runs before the handler, the code after runs as cleanup after the response, which is the idiomatic pattern for "open a DB session, yield it, close it" without every handler repeating that boilerplate.

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/{id}")
async def get_user(id: int, db: Session = Depends(get_db)):
    return db.query(User).get(id)
```

Dependencies compose (a dependency can itself depend on other `Depends()`), which is how auth checks, DB sessions, and pagination all layer cleanly without a handler manually orchestrating each one.

**Say it:** "`Depends()` lets a handler declare what it needs instead of constructing it — the resolve-then-cleanup lifecycle for things like DB sessions lives in one place instead of being copy-pasted into every route."
**Red flag:** Manually opening and closing a DB session inside every handler instead of centralizing it in a `Depends()` generator. That's the exact duplication dependency injection exists to remove, and it's easy to forget the `close()` in one of them.

### FastAPI background tasks and lifespan events
**They ask:** "What are Background Tasks in FastAPI? What are Lifespan Events?"

`BackgroundTasks` let a handler return a response immediately while scheduling work to run *after* the response is sent — sending a confirmation email after a signup, without making the client wait for SMTP. It's in-process and fire-and-forget, appropriate for cheap, non-critical work; anything that needs retries, persistence across a crash, or to survive a server restart belongs in a real task queue (Celery, RQ), not `BackgroundTasks`. **Lifespan events** (the modern replacement for `@app.on_event("startup"/"shutdown")`) are an async context manager that runs setup before the app starts serving and teardown after it stops — the right place to open a DB connection pool or an HTTP client session once, instead of per-request.

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db_pool = await create_pool()   # startup
    yield
    await app.state.db_pool.close()           # shutdown

app = FastAPI(lifespan=lifespan)
```

**Say it:** "Background tasks are for cheap fire-and-forget work after the response is sent; anything that needs retry guarantees goes to a real task queue — and lifespan events are where I set up and tear down process-wide resources like connection pools exactly once."
**Red flag:** Using `BackgroundTasks` for anything that must not silently fail — like charging a payment. If the process crashes mid-task there's no retry, no record it was even attempted; that needs a durable queue.

### SQLAlchemy: engine, session, and Core vs. ORM
**They ask:** "What is an SQLAlchemy engine and how do you create it? What is a session? Into what two main modules is SQLAlchemy divided?"

The **engine** is the entry point that manages the actual DB connection pool and knows how to speak to a specific database via its dialect+driver (`create_engine("postgresql+psycopg2://...")`); you typically create exactly one per application. A **session** is the ORM's unit-of-work: it tracks objects you've loaded or created, batches the SQL for them, and flushes/commits as one transaction — you get a session from a `sessionmaker` bound to the engine, one per request/unit of work, not one global session. SQLAlchemy is split into two layers: **Core**, the lower-level SQL expression language and schema/connection toolkit (works without any ORM), and the **ORM**, built on top of Core, which maps Python classes to tables and gives you the session/unit-of-work pattern. You can use Core alone for raw performance-critical queries while still using the ORM elsewhere.

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("postgresql+psycopg2://user:pass@host/db")
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()
```

**Say it:** "The engine owns the connection pool, the session is the ORM's unit-of-work over one transaction's worth of objects, and Core is the SQL layer the ORM is built on — I can drop to Core directly when I need raw query control."
**Red flag:** Creating a new `engine` per request. The engine and its pool are meant to be long-lived and shared; recreating it defeats connection pooling entirely.

### SQLAlchemy relationship loading and N+1
**They ask:** "What does the lazy parameter do on a relationship? What are the relationship loading techniques and how do you eager-load to avoid N+1?"

The `lazy` parameter on `relationship()` controls *when* related rows are fetched, and it's the direct SQLAlchemy analog of Django's select_related/prefetch_related trade-off. `lazy="select"` (the default) fetches related rows on first attribute access — one extra query per parent object accessed, the classic N+1. `joined` does a SQL `JOIN` in the original query (like `select_related`). `subquery`/`selectin` issue one *additional* query for all related rows at once (like `prefetch_related`), avoiding both the N+1 and a row-multiplying JOIN. You can also override the default per-query with `.options(joinedload(...))` / `.options(selectinload(...))` instead of baking the strategy into the model.

```python
from sqlalchemy.orm import selectinload
orders = session.query(Order).options(selectinload(Order.items)).all()
# one query for orders + one query for all their items — not N+1
```

**Say it:** "`lazy` sets the default fetch strategy, but I override it per query with `joinedload` or `selectinload` — joined for one-to-one/forward relationships, selectin when a JOIN would multiply rows, exactly to head off N+1."
**Red flag:** Accessing a lazy relationship attribute inside a loop over many parent objects without eager loading. That's one query per iteration — invisible in dev with a small dataset, brutal in production.

### SQLAlchemy async mode
**They ask:** "How do you use SQLAlchemy in asynchronous mode? What drivers does it need, and what changes when moving from sync to async?"

Async SQLAlchemy needs an async-capable driver — `asyncpg` for PostgreSQL, `aiomysql` for MySQL — instead of the sync ones (`psycopg2`), specified in the connection URL's dialect (`postgresql+asyncpg://...`). You then use `create_async_engine` and `AsyncSession` instead of their sync counterparts, and every operation that hits the database needs `await` in front of it. The biggest behavioral gotcha moving from sync to async: **lazy-loading relationships no longer works implicitly** — accessing an unloaded relationship attribute outside an `await` context raises an error instead of quietly issuing a sync query, so you must eager-load (`selectinload`) everything you'll need up front.

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

engine = create_async_engine("postgresql+asyncpg://user:pass@host/db")
async with AsyncSession(engine) as session:
    result = await session.execute(select(User).options(selectinload(User.orders)))
```

**Say it:** "Async SQLAlchemy needs an async driver like asyncpg and `await` on every DB call, and the real migration trap is that implicit lazy loading stops working — you have to eager-load relationships explicitly instead of relying on attribute access to fetch them on demand."
**Red flag:** Porting a sync codebase to async SQLAlchemy without auditing every lazy-loaded relationship access. Those calls now raise at runtime instead of quietly working, often in code paths tests don't cover.

### SQLAlchemy upsert and transactions
**They ask:** "How do you implement upsert in SQLAlchemy? How do you work with transactions?"

"Upsert" (insert, or update if a conflicting key already exists) isn't a portable ORM-level operation — SQLAlchemy exposes it via the dialect-specific `INSERT ... ON CONFLICT` construct (`from sqlalchemy.dialects.postgresql import insert`), because different databases have genuinely different conflict-resolution syntax (`ON CONFLICT` in Postgres/SQLite vs. `ON DUPLICATE KEY UPDATE` in MySQL). Transactions in the ORM are session-scoped: work inside a session is implicitly in a transaction until you `commit()` (persist) or `rollback()` (discard); the `session.begin()` context manager makes that boundary explicit and handles rollback automatically on an unhandled exception.

```python
from sqlalchemy.dialects.postgresql import insert

stmt = insert(User).values(email="a@b.com", name="A")
stmt = stmt.on_conflict_do_update(index_elements=["email"], set_={"name": "A"})
with session.begin():
    session.execute(stmt)   # commits on success, rolls back on exception
```

**Say it:** "Upsert goes through the dialect-specific `ON CONFLICT` construct because the SQL itself isn't portable across databases, and `session.begin()` gives me an explicit transaction boundary that rolls back automatically instead of relying on manual try/except around commit."
**Red flag:** Simulating upsert as "SELECT, then INSERT or UPDATE based on what I found" from application code. That's a race condition under concurrent writes — two requests can both see "no row" and both try to insert, exactly what the database's native `ON CONFLICT` is built to handle atomically.
