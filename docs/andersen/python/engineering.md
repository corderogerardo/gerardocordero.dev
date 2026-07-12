# Python — engineering practices (SOLID, architecture, testing)

### SOLID, all five principles
**They ask:** "What is SOLID? Walk through each principle."

SOLID names five principles for keeping object-oriented code changeable without cascading rewrites — the shared thread is *isolating the reason a class changes* so one change doesn't ripple into unrelated code. **S**ingle Responsibility: a class should have one reason to change — a class that both validates orders and sends emails has two reasons to change, and a change to one risks breaking the other. **O**pen/Closed: open for extension, closed for modification — add new behavior via new code (subclassing, composition), not by editing working code and risking regressions in it. **L**iskov Substitution: a subclass must be usable anywhere its parent is, without breaking the caller's expectations — a `Square` that overrides `Rectangle.set_width` to also change height violates this, because code trusting `Rectangle`'s contract breaks. **I**nterface Segregation: don't force a class to implement methods it doesn't need — many small, focused interfaces beat one fat one. **D**ependency Inversion: depend on abstractions, not concrete implementations — a class needing a database shouldn't construct `PostgresConnection` itself, it should accept an injected interface, so the concrete implementation can be swapped (or mocked in tests) without touching the class.

```python
# Dependency Inversion: depends on an abstraction, not a concrete DB class
class OrderService:
    def __init__(self, repo: OrderRepository):  # protocol/interface, not PostgresOrderRepo
        self.repo = repo
```

**Say it:** "Each SOLID principle is really about isolating the *reason* a class changes, so one change doesn't force edits across unrelated code — Dependency Inversion is the one that pays off most immediately, because it's what makes a class testable in isolation."
**Red flag:** Reciting the five letters without a concrete example of the bug each one prevents. Interviewers are listening for whether you've felt the pain SOLID solves, not whether you memorized the acronym.

### When it's right to deviate from SOLID
**They ask:** "When does it make sense to deviate from the SOLID principles?"

SOLID is a tool for managing change, not a moral rule — applying it to code that genuinely won't change (a one-off script, a prototype you'll throw away, a small internal tool with one consumer) adds abstraction layers that cost more in complexity than they ever pay back in flexibility. The senior signal is recognizing that premature abstraction — building an interface with exactly one implementation "in case we need another later" — is its own anti-pattern (sometimes called speculative generality), and it's a real cost: more files to navigate, more indirection to trace through when debugging, for a flexibility need that may never materialize. The right time to introduce an abstraction is usually when you're about to write the *second* concrete implementation, not preemptively for a hypothetical first one.

**Say it:** "SOLID earns its cost on code that changes and has multiple consumers — for a throwaway script or a class with exactly one implementation and no evidence a second is coming, the abstraction is often pure overhead I'd rather not carry."
**Red flag:** Adding an interface for a class with a single, unlikely-to-change implementation "for testability" or "just in case." That's YAGNI territory — the abstraction should earn its place when the second real need shows up.

### DRY, KISS, YAGNI, and DRY's real exceptions
**They ask:** "Explain the DRY, KISS, and YAGNI principles. What are the exceptions to DRY?"

**DRY** (Don't Repeat Yourself) says every piece of knowledge should have one canonical representation in the system — the goal isn't literally "no duplicate lines," it's avoiding two places that encode the *same business rule* and can silently drift out of sync when one gets updated and the other doesn't. **KISS** (Keep It Simple) favors the simplest design that solves the actual problem over a cleverer one that solves problems you don't have yet. **YAGNI** (You Aren't Gonna Need It) says don't build a capability speculatively for a future requirement that hasn't materialized — the same instinct that argues against premature SOLID abstraction. DRY's real exception: two pieces of code that look identical *today* but represent genuinely different business concepts (a `User` validation rule and a `Vendor` validation rule that happen to both check "email is non-empty" right now) shouldn't be merged into one shared function just because they're currently identical — merging them couples two concepts that may need to diverge later, and "premature DRY" (forcing an abstraction over accidental, not essential, duplication) is its own anti-pattern.

**Say it:** "DRY is about not duplicating a single source of truth for a business rule — not about eliminating every line that looks similar; two pieces of code that are accidentally identical today but represent different concepts should stay separate, or you've coupled things that need to diverge."
**Red flag:** Merging two functions into one shared helper just because their current implementation is identical, without checking whether they represent the same underlying concept. That's premature DRY, and it bites the moment one of them needs to change and the other can't.

### Microservices vs. monolith
**They ask:** "What is microservice architecture? Compare microservices and monolithic architecture — pros and cons of each."

A monolith deploys the whole application as one unit sharing one process, one codebase, one database (usually) — simple to develop, test, and deploy early on, since there's no network boundary between components and a single transaction can span the whole operation with real ACID guarantees. Microservices split the application into independently deployable services, each owning its own data, communicating over the network (HTTP, gRPC, message brokers) — the payoff is independent scaling (scale only the hot service), independent deployment (ship one service without redeploying everything), and technology/team autonomy (each service can pick its own stack, own team can own its lifecycle). The cost is real and often underestimated: distributed systems problems that don't exist in a monolith — network calls can fail or be slow where a function call couldn't, cross-service transactions lose single-database ACID and need sagas or eventual consistency, and operational complexity (service discovery, distributed tracing, more deploy pipelines) grows substantially. The senior framing: microservices solve an *organizational* scaling problem (many teams stepping on each other in one codebase) as much as a technical one — adopting them without that organizational pain is often paying distributed-systems cost for no matching benefit.

**Say it:** "Microservices trade a monolith's simplicity and free ACID transactions for independent scaling and deployment — but that trade only pays off once team/deploy coordination in a monolith is the actual bottleneck, not by default."
**Red flag:** Recommending microservices for a small team or early-stage product "for scalability" without naming the specific coordination or scaling pain that a monolith is actually causing today. That's cargo-culting an architecture, not solving a problem you have.

### Hexagonal architecture and ports/adapters
**They ask:** "What is hexagonal architecture, or port-adapter architecture?"

Hexagonal architecture puts business logic (the "core") at the center, completely isolated from any specific technology — it defines **ports**, interfaces describing what the core needs (a `PaymentGateway` port, a `UserRepository` port), and technology-specific **adapters** implement those ports (a `StripePaymentAdapter`, a `PostgresUserRepository`). The core never imports a concrete adapter directly — it only knows about the port interface, which is Dependency Inversion applied architecture-wide rather than class-by-class. The payoff: swapping Postgres for MongoDB, or a REST API for a CLI driving the same business logic, means writing a new adapter, not touching the core — and the core is trivially unit-testable with fake/in-memory adapters instead of a real database or payment gateway.

```python
class PaymentGateway(Protocol):
    def charge(self, amount: int) -> bool: ...

class OrderService:            # core — knows only the port
    def __init__(self, gateway: PaymentGateway): ...

class StripeAdapter:           # adapter — implements the port
    def charge(self, amount: int) -> bool: ...
```

**Say it:** "Hexagonal architecture is Dependency Inversion at the architecture level — the core depends only on ports, adapters implement them, so swapping a database or an external API means writing a new adapter, not touching business logic."
**Red flag:** Letting an ORM model or a specific vendor's SDK type leak into the core business logic. That's exactly the coupling hexagonal architecture exists to prevent — the core should only ever see its own domain types and port interfaces.

### CQRS
**They ask:** "Can you explain CQRS, and what are its advantages and disadvantages?"

CQRS (Command Query Responsibility Segregation) splits the model used to *write* data (commands — validate, apply business rules, mutate state) from the model used to *read* it (queries — often a denormalized, read-optimized shape), instead of one model trying to serve both well. The advantage: reads and writes can scale, be optimized, and even be stored independently — a write model enforcing strict invariants in a normalized relational schema, paired with a read model that's a denormalized, pre-joined view (or even a separate database entirely) tuned for the exact queries the UI needs, no JOINs required at read time. The disadvantage is real complexity: the read model has to be kept in sync with the write model (often asynchronously, via events), which reintroduces the eventual-consistency problem — a client can write, then immediately read stale data from the read model until sync catches up, which the UI has to be designed to tolerate.

**Say it:** "CQRS separates the write model, optimized for enforcing invariants, from the read model, optimized for the queries the UI actually needs — the cost is keeping them in sync, which usually means accepting eventual consistency between a write and its visibility in reads."
**Red flag:** Adopting CQRS for a simple CRUD app with no meaningfully different read/write scaling or shape needs. It's real architectural complexity that only pays for itself when reads and writes genuinely have different scaling or modeling requirements.

### Event sourcing vs. event bus
**They ask:** "What is Event Sourcing? What is an event bus?"

**Event sourcing** stores every change to an entity as an immutable, append-only sequence of events (`OrderCreated`, `ItemAdded`, `OrderShipped`) rather than storing just the entity's current state — the current state is derived by replaying events, not stored as the source of truth. The payoff: a complete audit trail for free, the ability to reconstruct state as of any point in time, and the ability to add new read models later by replaying history through a new projection. The cost: replaying a long event stream to get current state is expensive without periodic snapshots, and querying "current state" efficiently generally needs a separate read-optimized projection anyway — event sourcing pairs naturally with CQRS for exactly that reason. An **event bus** is a simpler, more common pattern: just a mechanism (in-process or via a broker) for publishing domain events so other parts of the system can react — it doesn't imply events are the *source of truth*, just a decoupled notification mechanism layered on top of normal state storage.

**Say it:** "Event sourcing makes the event log itself the source of truth and derives state by replay — an event bus is just a decoupled notification mechanism on top of normal storage; conflating the two means overselling event sourcing's complexity where you only needed simple pub/sub."
**Red flag:** Calling any use of domain events "event sourcing." Publishing an event when something happens is an event bus / pub-sub pattern — event sourcing specifically means the events *are* the persisted source of truth, not a side notification.

### Testing fundamentals: assert, AAA, and why test
**They ask:** "Why is software testing necessary? What does the assert keyword do in Python? What is the Arrange-Act-Assert pattern?"

Testing exists to catch regressions before a human (or worse, a production incident) does, and to make refactoring safe — without tests, "does this change break anything" can only be answered by manual verification or hope, which doesn't scale as a codebase grows. Python's `assert` statement checks a condition and raises `AssertionError` (with an optional message) if it's false — the primitive every test framework is built on, though bare `assert` in production code is discouraged since it's stripped out entirely when Python runs with `-O` optimizations. **Arrange-Act-Assert** is the standard structure for a readable test: **Arrange** sets up the state and inputs the test needs, **Act** performs the one operation under test, **Assert** checks the outcome — keeping these visually separate (even with blank lines) makes a test's intent obvious at a glance instead of interleaving setup and verification.

```python
def test_discount_applies_to_orders_over_100():
    order = Order(items=[Item(price=150)])   # Arrange
    order.apply_discount()                    # Act
    assert order.total == 135                 # Assert (10% off 150)
```

**Say it:** "AAA isn't a formatting preference — separating setup, action, and verification is what makes a test's intent readable at a glance instead of a wall of interleaved logic, and that readability is what makes tests worth maintaining."
**Red flag:** Relying on bare `assert` statements for validation in production code paths, not just tests. They silently vanish under `python -O`, so any check that must always run needs an explicit `if ...: raise`.

### Mocking: mock, patch, and patch.object
**They ask:** "What is a mock? What are unittest.mock.patch and unittest.mock.patch.object used for?"

A **mock** is a stand-in object that replaces a real dependency in a test, letting you isolate the code under test from things that are slow, non-deterministic, or have side effects — a real HTTP call, a real database, the current time. It records how it was called (arguments, call count) so you can assert on interactions, and you configure its return value or side effect (an exception) to test how your code handles specific scenarios without needing the real thing to actually produce them. `unittest.mock.patch` temporarily replaces an object at a given import path for the duration of a test (as a decorator or context manager), automatically restoring the original afterward — you patch the path *where the name is looked up*, not where it's defined, which is the single most common mocking bug. `patch.object` does the same thing but targets an attribute on a specific object/class you already have a reference to, rather than a string import path — useful when you want type-checked, refactor-safe patching instead of a string that silently breaks if the module moves.

```python
from unittest.mock import patch

# patch where `requests` is looked UP (in the module under test), not where it's defined
@patch("myapp.service.requests.get")
def test_fetch_user(mock_get):
    mock_get.return_value.json.return_value = {"id": 1}
    assert fetch_user(1)["id"] == 1
```

**Say it:** "Mocking isolates the code under test from slow or non-deterministic dependencies — and the mistake that breaks patches most often is patching where a name is *defined* instead of where it's *imported and looked up* in the module actually under test."
**Red flag:** Patching the wrong import path and getting a test that passes even though the real code path was never actually mocked (the original still runs). Always patch at the point of use, not the point of definition.

### Fixtures and fixture scope
**They ask:** "What is a fixture? How do you create a fixture initialized once for all tests instead of once per test? How do you run code before or after each test?"

A fixture is reusable setup (and teardown) code a test depends on — a database connection, a test client, sample data — declared once and injected into any test that needs it, instead of every test hand-rolling its own setup. In pytest, a fixture's `scope` controls how often it's recreated: the default `function` scope creates a fresh instance for every test (safest — no state leaks between tests); `module` or `session` scope creates it once and reuses it across many tests (faster for genuinely expensive setup like spinning up a test database container, but risks one test's side effects leaking into another if the fixture is mutable state). Code to run before/after *every* test without an explicit fixture argument uses `autouse=True`; `unittest`'s equivalent is `setUp`/`tearDown` methods run automatically around each test method.

```python
@pytest.fixture(scope="session")
def db_connection():
    conn = create_test_db()
    yield conn          # provided to tests
    conn.close()         # teardown after the session

@pytest.fixture(autouse=True)
def reset_state():
    yield
    clear_cache()        # runs after every test automatically
```

**Say it:** "Fixture scope is a trade-off between test isolation and setup cost — function scope is safest by default, and I only widen it to module or session scope for genuinely expensive setup, accepting the risk of state leaking across tests that share it."
**Red flag:** Using `session`-scoped fixtures for mutable state that tests modify. One test's leftover state silently becomes the next test's starting condition, producing order-dependent test failures that are miserable to debug.

### Parametrized tests
**They ask:** "How can you parameterize tests?"

Parametrization runs the same test logic against multiple input/expected-output pairs without copy-pasting the test function for each case — `@pytest.mark.parametrize` takes a list of argument tuples and pytest generates one test instance per tuple, each reported individually (so a failure on one input doesn't hide whether the others passed). It's the direct fix for the "should I write ten nearly-identical test functions" question — one parametrized test covers the same ground with far less duplication, and each case shows up as its own pass/fail in the test report.

```python
@pytest.mark.parametrize("input_val, expected", [
    (0, "zero"), (1, "one"), (-1, "negative"), (100, "positive"),
])
def test_classify(input_val, expected):
    assert classify(input_val) == expected
```

**Say it:** "Parametrize turns a table of input/expected pairs into individually reported test cases — it's the fix for near-duplicate test functions that differ only in their data."
**Red flag:** Writing a `for` loop inside a single test function to iterate over cases instead of parametrizing. A failure inside that loop stops at the first failing case and reports as one generic failure, hiding whether the other cases would have passed too.

### TDD's steps
**They ask:** "TDD: what are the steps it consists of?"

Test-Driven Development is Red-Green-Refactor, repeated in a tight loop. **Red**: write a test for behavior that doesn't exist yet — it fails, because the code doesn't exist, and that failure is itself a check that the test can actually detect the absence of the feature (a test that passes before you've written the code is a test that can't catch a real regression either). **Green**: write the minimum code to make that test pass — not the most elegant solution, just enough to turn the test green, resisting the urge to build more than the current test demands. **Refactor**: now that behavior is locked in by a passing test, clean up the implementation (and the test) with the safety net of the test catching any regression the cleanup introduces. The discipline's real value isn't "tests before code" as a ritual — it's that writing the test first forces you to design the interface from the caller's perspective before you've committed to an implementation.

**Say it:** "TDD's value isn't writing tests first as a ritual — it's that designing the test first forces you to think about the interface from the caller's perspective before you've committed to an implementation, and Red-Green-Refactor gives you a regression safety net for the cleanup step."
**Red flag:** Writing the implementation first, then a test that just confirms what the code already does. That test can't catch a design mistake, since the interface was never designed from the test's perspective — it's documentation, not a TDD safety net.

### Unit, integration, and end-to-end testing
**They ask:** "What is unit testing? What is integration testing, and how does it differ? What is end-to-end testing?"

The three sit on a pyramid trading speed/isolation for realism/confidence. **Unit tests** exercise one function or class in isolation, with all its dependencies mocked/faked — fast (milliseconds), pinpoint the exact failure location, and should make up the bulk of a test suite. **Integration tests** exercise multiple real components together — a service talking to a real (often test-instance) database, verifying the pieces actually work together correctly, not just each in isolation; slower than unit tests, but they catch the class of bug unit tests structurally can't (a query that's syntactically valid but wrong against the real schema). **End-to-end tests** drive the whole system through its real external interface (an HTTP API, a browser) exactly as a user or client would, verifying the full stack works together — highest confidence, slowest, most brittle (a UI change can break an e2e test unrelated to the logic it was meant to verify), so they're kept sparse, covering only critical user journeys.

**Say it:** "Each layer of the pyramid trades speed for realism — unit tests are fast and pinpoint failures, integration tests catch what unit tests structurally can't by using real components together, and e2e tests are the most expensive so I reserve them for the critical paths, not exhaustive coverage."
**Red flag:** An inverted pyramid — mostly e2e tests, few unit tests. The suite becomes slow, flaky, and a failure tells you almost nothing about where the bug actually is.

### Testing code that touches the database, and mutation testing
**They ask:** "How do you write tests for a module that interacts with the database — unit tests, integration tests, or both? What is mutation testing, and when should you use it?"

Both, for different guarantees, is the honest answer. Pure business logic that happens to be near database code (validation, calculation) should still be unit-tested with the database dependency mocked/faked — fast feedback, no test infra needed. But the actual query correctness — does this ORM call, this raw SQL, this transaction boundary do what you think against a real schema — can only be verified by an integration test against a real (or realistic, e.g. an ephemeral test-container) database instance; a mock can't catch a typo'd column name or a JOIN that's semantically wrong but syntactically fine. **Mutation testing** goes a level deeper than either: it automatically introduces small deliberate bugs ("mutants" — flip a `<` to `<=`, change a `+` to `-`) into your code and reruns the test suite against each mutant, and any mutant that *doesn't* cause a test failure reveals a gap — code your tests exercise but don't actually verify the behavior of. It's expensive to run (every mutant re-runs the whole suite) so it's used selectively, on critical logic, not as a routine CI gate.

**Say it:** "Business logic near the database gets unit-tested with the DB mocked for speed, but query correctness itself needs an integration test against a real schema — no mock catches a JOIN that's syntactically valid but semantically wrong. Mutation testing is the tool for when I need to know my tests actually assert on behavior, not just execute the code path."
**Red flag:** Claiming high line coverage means the database logic is well-tested. Coverage only proves the code *ran* during tests, not that the test actually asserted the right thing happened — which is exactly the gap mutation testing is designed to expose.

### pytest vs. unittest
**They ask:** "What are the differences between unittest and pytest? What is a plugin in pytest?"

`unittest` is Python's built-in, xUnit-style framework — tests are methods on a `TestCase` subclass, assertions go through specific methods (`assertEqual`, `assertTrue`), and setup/teardown use `setUp`/`tearDown`. `pytest` is a third-party framework that's become the de facto standard because it removes ceremony: tests are plain functions (no subclassing required), you use Python's own `assert` and pytest rewrites it to give a rich failure diff automatically, fixtures replace `setUp`/`tearDown` with a more composable dependency-injection style, and `@pytest.mark.parametrize` has no clean unittest equivalent. Both can run `unittest`-style tests, since pytest is designed to be largely backward-compatible as a test runner. A **pytest plugin** extends the framework — pytest's architecture is built around hook points (collection, fixtures, reporting) that a plugin can hook into, which is how the ecosystem provides things like `pytest-cov` (coverage), `pytest-mock`, `pytest-asyncio` (testing async code), and `pytest-xdist` (parallel test execution) without any of them being part of pytest core.

**Say it:** "pytest wins on less ceremony — plain-function tests, plain assert with rich diffs, and composable fixtures instead of setUp/tearDown — and its plugin architecture is why things like async test support and parallel execution are drop-in instead of built into core."
**Red flag:** Writing new tests as `unittest.TestCase` subclasses in a pytest-based project "because that's the standard library way." That gives up parametrize, fixture composition, and plain-assert diffing for no real benefit in a codebase already running pytest.

### Test coverage
**They ask:** "What is 'test coverage'?"

Test coverage is the percentage of your code that's actually executed while the test suite runs, most often measured per line (line coverage) or per branch (branch coverage — did both sides of every `if` get exercised, not just one). It's a diagnostic for *finding untested code*, not a proof of correctness — a line can execute during a test without that test actually asserting anything meaningful about its behavior, which is why 100% coverage doesn't mean bug-free (mutation testing exists precisely to catch that gap). In Python, `pytest-cov` (built on `coverage.py`) is the standard tool, run as `pytest --cov=mypackage`.

```bash
pytest --cov=mypackage --cov-report=term-missing
# shows % covered per file, and which specific line numbers were never executed
```

**Say it:** "Coverage tells me what code my tests never touch, which is useful for finding gaps — but it's not a quality metric on its own, since a line can run during a test without the test asserting anything about it. I treat a coverage drop as a signal to investigate, not the goal itself."
**Red flag:** Chasing 100% coverage as an end goal — it drives people to write tests that execute code without meaningfully asserting on it, just to move the number, which is worse than no test at all because it creates false confidence.

### Why use a virtual environment
**They ask:** "Why is a virtual environment (`venv`) necessary, and what problem does it solve?"

Without one, every Python project on a machine shares the same global set of installed packages — so two projects needing different versions of the same library (or Python itself) directly conflict, and installing a new project's dependencies can silently break an unrelated one. A virtual environment is an isolated, self-contained copy of the Python interpreter plus its own `site-packages` directory, so `pip install` inside it only affects that project. The standard-library way is `python -m venv .venv`, activated per shell session; the project's dependencies then get pinned in `requirements.txt` so anyone (or CI) can recreate the exact same environment.

```bash
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**Say it:** "A virtual environment isolates a project's dependencies from every other project and from the system Python, so `pip install` here can't silently break something else — I always create one per project rather than installing into the global interpreter."
**Red flag:** Running `pip install` without an active virtual environment "just this once" — it pollutes the global interpreter and is exactly how "works on my machine" dependency conflicts start.

### pip and requirements.txt
**They ask:** "What is pip, and what is `requirements.txt` used for?"

`pip` is Python's standard package installer — it fetches packages (and their own dependencies) from PyPI (the Python Package Index) and installs them into whatever environment is currently active. `requirements.txt` is the conventional way to capture a project's dependency snapshot: `pip freeze > requirements.txt` records every installed package and its exact version, and `pip install -r requirements.txt` reinstalls that same set elsewhere — a teammate's machine, a CI runner, a production container. Pinning exact versions (`requests==2.31.0` rather than just `requests`) gets "it worked in dev" most of the way to working in prod too, but it's a compatible snapshot, not a guaranteed identical environment — the same pinned versions can still resolve to different wheels/builds across OS, architecture, or Python version, and `pip freeze` doesn't capture a fully resolved, hash-verified dependency graph the way a lockfile does. For that stronger reproducibility guarantee, a lockfile tool (`pip-tools`, `poetry`, `uv`) with hash pinning is the better story.

```bash
pip install requests            # install one package
pip freeze > requirements.txt    # snapshot everything currently installed
pip install -r requirements.txt  # recreate that exact environment elsewhere
```

**Say it:** "pip installs from PyPI into whatever environment is active, and `requirements.txt` is how I get a compatible dependency snapshot across machines — I pin exact versions so CI and production install close to what I tested against, not just 'whatever's newest today,' but if I need a guaranteed identical, hash-verified environment I reach for a lockfile tool instead of just `pip freeze`."
**Red flag:** Committing a `requirements.txt` with unpinned versions (`requests` instead of `requests==2.31.0`) on an application (not a library) — a new install six months later can silently pull a breaking major version.

### What PEP 8 is
**They ask:** "What is PEP 8?"

PEP 8 is Python's official style guide — a PEP (Python Enhancement Proposal) that documents the naming, formatting, and layout conventions the language's own standard library follows, so that Python code across different teams and projects reads consistently. It covers things like 4-space indentation (never tabs), `snake_case` for functions and variables, `PascalCase` for classes, a line-length limit (PEP 8 itself recommends 79 characters for code and 72 for comments/docstrings — 88 is Black's default, not a PEP 8 number), and two blank lines between top-level definitions. It's a convention, not enforced by the interpreter — nothing stops non-compliant code from running — which is exactly why linters and formatters exist to enforce it automatically instead of relying on manual review.

```python
# PEP 8
def calculate_total(items):        # snake_case function name
    return sum(i.price for i in items)

class OrderProcessor:               # PascalCase class name
    MAX_ITEMS = 100                  # UPPER_CASE constant
```

**Say it:** "PEP 8 is the Python style guide — snake_case for functions and variables, PascalCase for classes, 4-space indentation — and since the interpreter doesn't enforce any of it, I let a formatter and linter apply it automatically rather than relying on manual review in code review."
**Red flag:** Treating PEP 8 as optional bikeshedding not worth automating — inconsistent style across a codebase adds real friction to every code review; the fix is a pre-commit formatter, not more vigilance.

### Linters vs. formatters
**They ask:** "What is a linter? What is a formatter, and how is it different from a linter?"

Both exist to take style and correctness enforcement off code review, but they catch different classes of problems. A **linter** (e.g. `ruff`, `flake8`, `pylint`) *analyzes* code and reports problems — unused imports, undefined names, overly complex functions, PEP 8 violations — without changing anything; a human (or CI) still has to fix what it flags. A **formatter** (e.g. `black`, `ruff format`) *rewrites* code into a consistent style automatically — quote style, line breaks, indentation — with no judgment calls left to the developer, which ends "tabs vs. spaces"-style arguments entirely since the tool just decides. Many teams run both: the formatter for automatic style, the linter for things a mechanical rewrite can't fix (like an unused variable).

```bash
ruff check .      # linter: reports problems, doesn't change files
black .            # formatter: rewrites files into a consistent style
```

**Say it:** "A linter reports problems without fixing them — unused imports, style violations — and a formatter rewrites the code into a consistent style automatically with no decisions left for the developer. I run both in CI so style is never a code-review discussion."
**Red flag:** Debating formatting choices (tabs vs. spaces, quote style) in code review instead of just running a formatter — that's exactly the class of problem formatters exist to remove from human judgment.

### Docstrings
**They ask:** "What can docstrings be used for?"

A docstring is a string literal as the first statement in a module, class, or function, documenting what it does — unlike a `#` comment, it's stored as the object's `__doc__` attribute at runtime, which is what powers `help(my_function)` and IDE tooltips. Beyond documentation, tools build on that: `doctest` can extract and run example code embedded in a docstring as actual tests, and documentation generators (Sphinx, `mkdocs`) parse docstrings to build API reference pages automatically, so writing one doc comment feeds both the IDE and the published docs.

```python
def divide(a, b):
    """Divide a by b.

    Raises ZeroDivisionError if b is 0.
    """
    return a / b

divide.__doc__   # "Divide a by b.\n\n    Raises ZeroDivisionError if b is 0.\n    "
help(divide)       # prints the docstring
```

**Say it:** "A docstring isn't just a comment — it's stored on the function as `__doc__`, so it's what `help()` and IDE tooltips show, and documentation tools like Sphinx generate API references directly from it, which is why I write one on every public function, not just the tricky ones."
**Red flag:** Writing a docstring that just repeats the function name in words ("Gets the user") instead of documenting behavior that isn't obvious from the signature — parameters with non-obvious meaning, exceptions raised, return value shape.

### Code smells
**They ask:** "What is a code smell?"

A code smell is a surface-level symptom in code that suggests a deeper design problem, without necessarily being a bug — the code works, but the smell is a signal that maintaining or extending it will get harder over time. Common examples: a function that's grown to do five unrelated things (long method), a class with too many responsibilities (god object), duplicated logic in several places, deeply nested conditionals, or a long parameter list. Smells are a prompt to refactor, not an automatic failure — recognizing them early is cheaper than discovering the underlying design problem after it's caused a production bug.

```python
# smell: long parameter list + duplicated validation logic
def create_user(name, email, age, address, phone, country, is_admin, is_verified):
    ...
```

**Say it:** "A code smell is a symptom, not a bug — the code runs fine today, but something about its shape (a god object, duplicated logic, a long parameter list) signals it'll be expensive to change later, so I treat it as a prompt to refactor before it compounds."
**Red flag:** Conflating "code smell" with "bug" in an interview — a smell is about maintainability risk, not incorrect behavior; code with no smells can still have bugs, and smelly code can still work correctly.

### Code review
**They ask:** "What is code review, and what's it actually for?"

Code review is having at least one other person read a change before it merges — its value is catching what the author can't see because they're too close to their own code: logic errors, missed edge cases, a pattern that doesn't match the rest of the codebase, or a simpler approach they didn't consider. It's also how a team spreads knowledge of the codebase and enforces consistency without every rule living in someone's head. The useful distinction junior engineers often miss: review is about the code, not the person — phrasing feedback as a question or suggestion ("what happens if `items` is empty here?") keeps it collaborative rather than adversarial.

**Say it:** "Code review exists because the author is too close to their own change to see everything — a second reviewer catches missed edge cases, spreads codebase knowledge across the team, and keeps style and patterns consistent without relying on everyone remembering every convention."
**Red flag:** Treating review comments as personal criticism, or on the flip side, writing review feedback as blunt commands instead of questions — either one turns a collaborative process adversarial and slows the team down.

### Technical debt
**They ask:** "What is technical debt, and how do you avoid it piling up?"

Technical debt is the implied future cost of a shortcut taken now to ship faster — like financial debt, it's sometimes a reasonable deliberate trade (ship an MVP with a known-hacky piece to hit a deadline, fix it later) and sometimes it's accidental (nobody chose it, it just accumulated from time pressure or not knowing better). The problem isn't debt existing — it's debt nobody tracks, which compounds silently until every change to that area takes longer than it should. Managing it means naming it explicitly (a `TODO` with context, a tracked ticket) so it's a visible, prioritizable decision instead of invisible drag, and paying it down incrementally rather than only during a dedicated "rewrite" that rarely gets scheduled.

**Say it:** "Technical debt is a deliberate or accidental shortcut with a future cost — the risk isn't taking it on, it's taking it on silently. I flag it explicitly, with a ticket or a `TODO` that explains the shortcut and the fix, so it's a visible trade-off the team chose, not a surprise six months later."
**Red flag:** Treating "we'll fix it later" as a plan without writing it down anywhere — undocumented debt is indistinguishable from a design decision nobody remembers making, and it never gets prioritized because no one can see it.

### The logging module and log levels
**They ask:** "Why is the `logging` module needed in Python? What levels of logging does it offer?"

`print()` isn't a debugging strategy for anything beyond a throwaway script — it can't be turned off without deleting the call, has no severity, and doesn't record where or when it happened. The standard-library `logging` module solves all three: it has severity **levels** so you can filter what's shown without touching call sites, it can route output to multiple destinations (console, file, a log aggregator) at once, and — given an explicit `format`/`datefmt` — it can timestamp and tag each entry with its source (the default `basicConfig()` format has no timestamp; you opt into one explicitly). The levels, low to high severity: `DEBUG` (detailed diagnostic info), `INFO` (confirmation things are working as expected), `WARNING` (something unexpected, but not breaking), `ERROR` (a real failure), `CRITICAL` (the program may not be able to continue). Setting a logger's level to `WARNING` silences `DEBUG`/`INFO` calls without deleting them — they're still in the code, just filtered.

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

key, user_id, err = "session:42", 7, "card declined"

logger.debug("cache miss for key=%s", key)      # filtered out at INFO level
logger.info("user %s logged in", user_id)         # shown, with timestamp
logger.error("payment failed: %s", err)            # shown, with timestamp
```

**Say it:** "Logging gives me severity levels I can filter without touching call sites, unlike `print`, plus a timestamp and source on every entry — I default to `INFO` in production and reserve `DEBUG` for local troubleshooting, so turning up verbosity is a config change, not a code change."
**Red flag:** Leaving `print()` statements in for debugging production issues — they can't be filtered, disabled, or routed anywhere, and someone has to remember to delete them (or doesn't).

### Debugging basics
**They ask:** "What is debugging? What methods can you use to debug a problem, including in production?"

Debugging is the process of finding *why* code doesn't behave as expected — locating the gap between what you expected to happen and what actually happened, then narrowing it down to a specific line or assumption. Locally, the tools are `print`/logging statements, and `pdb` (Python's built-in interactive debugger — `breakpoint()` drops you into a REPL at that exact line, letting you inspect variables and step through execution), or an IDE's visual debugger with breakpoints. In production, you generally can't attach a debugger to a live process, so the toolkit shifts to: structured logs (searchable, with enough context to reconstruct what happened), error-tracking tools (Sentry and similar, which capture the full stack trace and surrounding state automatically), and metrics/dashboards to spot *when* and *how often* something goes wrong before diving into a specific instance.

```python
def process(items):
    total = 0
    for i in items:
        breakpoint()      # drops into pdb here — inspect `i`, `total`, step with `n`/`c`
        total += i.value
    return total
```

**Say it:** "Debugging is narrowing the gap between expected and actual behavior — locally I reach for `breakpoint()` and the interactive debugger to inspect state directly; in production, where I can't attach a debugger to a live process, it's structured logging and an error tracker like Sentry that reconstruct what happened after the fact."
**Red flag:** Debugging a production issue by adding a `print()` and redeploying, one guess at a time — that's slow and disruptive; production debugging leans on the logs and error-tracking data that were already being captured before the bug happened, not on adding new instrumentation reactively.
