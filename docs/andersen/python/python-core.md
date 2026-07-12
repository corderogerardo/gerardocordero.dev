# Python — core language (data model, decorators, generators, memory)

### Why a decorator instead of calling a wrapper function
**They ask:** "What is a decorator? Why do you need a decorator if you can consistently describe the logic in a function without using a decorator?"

A decorator is just a higher-order function applied at *definition time* instead of call time: `@log` above `def f` is sugar for `f = log(f)`. The reason it exists isn't power — you could always wrap a call manually — it's that decoration keeps cross-cutting concerns (logging, timing, auth, retries, caching) out of the function body and applies them declaratively, once, at the definition site, instead of every caller remembering to wrap the call.

```python
def log(fn):
    def wrapper(*args, **kwargs):
        print(f"calling {fn.__name__}")
        return fn(*args, **kwargs)
    return wrapper

@log
def add(a, b):
    return a + b
```

**Say it:** "A decorator is a higher-order function invoked at def time — `@log` is `f = log(f)` — and I reach for it to keep cross-cutting concerns like logging or auth out of every call site."
**Red flag:** Describing a decorator as "special syntax." It's plain functions and closures; the `@` is sugar, nothing magic happens at the interpreter level.

### Built-in decorators: staticmethod, classmethod, property
**They ask:** "What are Python's built-in decorators like @staticmethod, @classmethod and @property?"

These three change what a method receives as its first argument, and the distinction is about *what the method needs to know*. `@staticmethod` needs neither the instance nor the class — it's a plain function namespaced on the class for organization. `@classmethod` receives the class (`cls`) instead of the instance, which is why it's the idiomatic way to write alternate constructors. `@property` turns a method into an attribute-like read (and optionally write) — it lets you compute a value lazily while keeping the caller's syntax as if it were a plain field.

```python
class User:
    def __init__(self, name):
        self.name = name

    @classmethod
    def from_dict(cls, data):
        return cls(data["name"])

    @staticmethod
    def is_valid_name(name):
        return bool(name.strip())

    @property
    def display_name(self):
        return self.name.title()
```

**Say it:** "I pick `staticmethod` when the method doesn't touch instance or class state, `classmethod` when it needs the class — usually for alternate constructors — and `property` when I want computed state to read like a plain attribute."
**Red flag:** Using `@staticmethod` for something that actually needs `cls` (e.g. an alternate constructor) — it silently breaks subclassing because it can't return the subclass type.

### functools.wraps
**They ask:** "What is functools.wraps? What is the return type of the decorator function?"

A decorator's inner function replaces the original in the namespace, and without care it also replaces the original's identity — `__name__`, `__doc__`, `__module__`, and the signature all become the wrapper's. That breaks introspection, debugging, and any tooling that reads a function's metadata (docs generators, some ORMs, `help()`). `functools.wraps` copies that metadata from the wrapped function onto the wrapper.

```python
from functools import wraps

def log(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper
```

A decorator function itself just returns a callable — normally the wrapper function object, but nothing enforces that; it can return any callable, including a class instance with `__call__`.

**Say it:** "I always wrap a decorator's inner function with `functools.wraps` — otherwise `help()`, tracebacks, and doc tooling see the wrapper's identity instead of the original function's."
**Red flag:** Shipping a decorator without `wraps` — `fn.__name__` becomes `"wrapper"` everywhere, which silently breaks anything that introspects the function.

### Caching a function's results with a decorator
**They ask:** "How to implement a decorator to cache function results?"

Memoization trades memory for time: if a function is pure (same input → same output, no side effects) and gets called repeatedly with the same arguments, caching the result avoids recomputation. Python ships this as `functools.lru_cache` (or `functools.cache` for an unbounded version) rather than making you hand-roll a dict-based wrapper — reach for the stdlib first.

```python
from functools import lru_cache

@lru_cache(maxsize=256)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```

Hand-rolling one is instructive for interviews: keep a dict keyed by `(args, frozenset(kwargs.items()))` and return the cached value on a hit. The senior detail is knowing the failure modes — unhashable arguments break the key, and an unbounded cache on a long-lived process is a memory leak, which is exactly why `lru_cache` takes a `maxsize`.

**Say it:** "For pure functions I reach for `functools.lru_cache` before hand-rolling a memoizing decorator — it's tested, thread-safe for the GIL-bound case, and bounded by `maxsize` so it can't leak."
**Red flag:** An unbounded hand-rolled cache (`maxsize=None` without thinking about it, or a plain dict) on a function called with unbounded input — that's a slow memory leak in a long-running process.

### Parameterized decorators
**They ask:** "How to write a parameterizable decorator?"

`@retry(times=3)` needs three levels of nesting, not two, because the decorator itself must first be *called* with its arguments before it receives the function. The outer function takes the decorator's own arguments and returns the actual decorator, which takes the function and returns the wrapper.

```python
def retry(times=3):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return fn(*args, **kwargs)
                except Exception:
                    if attempt == times - 1:
                        raise
        return wrapper
    return decorator

@retry(times=5)
def flaky_call(): ...
```

**Say it:** "A parameterized decorator is three nested functions — the outer one captures the decorator's own arguments in a closure and returns the actual `(fn) -> wrapper` decorator."
**Red flag:** Forgetting the extra call — `@retry` without `()` passes the function itself as `times`, which fails at call time with a confusing error far from the real bug.

### Decorating a class or a method
**They ask:** "Can a class act as a decorator? How to decorate a class method?"

Any object with `__call__` can be a decorator, so a class works if its `__call__` takes the function and returns a callable — that's a natural fit when the decorator needs to hold configurable state across calls (a counter, a cache instance) instead of relying on a closure. Class-based decorators are also easier to subclass and test in isolation than nested closures.

```python
import functools

class CountCalls:
    def __init__(self, fn):
        self.fn = fn
        self.count = 0
        functools.update_wrapper(self, fn)   # keep __name__, __doc__, __wrapped__

    def __call__(self, *args, **kwargs):
        self.count += 1
        return self.fn(*args, **kwargs)
```

Note the `functools.update_wrapper(self, fn)`: a class-based decorator *replaces* the function with an instance, so without it the wrapped callable loses `__name__`/`__doc__` and tools like `help()` and `inspect` see `CountCalls`, not the original — the same reason you reach for `functools.wraps` in the closure form.

Decorating a method inside a class body works the same as a function — `@staticmethod`/`@classmethod`/`@property` are the built-in examples — but a custom decorator on a method receives `self` as its first positional argument through `*args`, same as any other call.

**Say it:** "A decorator just needs to be callable — a class with `__call__` is a legitimate decorator, and it's often cleaner than a closure when the decorator needs to carry its own state."
**Red flag:** Building a class-based decorator that isn't itself reusable across multiple decorated functions — if it stores per-function state on `self`, every function decorated with the same instance shares that state by accident.

### Async decorators
**They ask:** "Is it possible to write an asynchronous decorator?"

Yes, but the wrapper must itself be a coroutine function that awaits the wrapped coroutine — you can't just wrap a sync function around an async one, because calling an `async def` returns a coroutine object rather than running it; forgetting to `await` inside the wrapper silently produces an un-awaited coroutine warning instead of running the logic.

```python
def async_log(fn):
    @wraps(fn)
    async def wrapper(*args, **kwargs):
        print(f"calling {fn.__name__}")
        return await fn(*args, **kwargs)
    return wrapper

@async_log
async def fetch_user(user_id): ...
```

**Say it:** "An async decorator's wrapper has to be `async def` and `await` the wrapped coroutine — a sync wrapper around an async function just returns an unawaited coroutine object instead of running it."
**Red flag:** Writing a sync wrapper for an `async def` function — it "works" without erroring, but the coroutine never actually executes, which is a classic silent-failure bug.

### Generators and yield
**They ask:** "What is a generator? What is yield? Why do you need a generator?"

A generator is a function that produces a sequence of values lazily instead of building the whole sequence in memory up front — calling a generator function doesn't run the body, it returns a generator object, and each `next()` call resumes execution until the next `yield` and pauses there. `yield` is what makes a function a generator: it suspends execution and hands a value to the caller, preserving all local state for the next resume.

```python
def read_large_file(path):
    with open(path) as f:
        for line in f:
            yield line.strip()
```

The payoff is memory: `read_large_file` never holds the whole file in RAM, unlike returning a list. That's the core trade-off senior interviewers are probing for — laziness and O(1) memory versus a list's O(n) memory but random access and reuse.

**Say it:** "A generator trades a list's memory footprint for laziness — it computes one value per `next()` instead of materializing the whole sequence, which matters for large or unbounded data."
**Red flag:** Reaching for a list comprehension to "process a huge file" — that loads everything into memory; a generator or generator expression processes it one item at a time.

### The iterator protocol and StopIteration
**They ask:** "What is StopIteration? Why are the magic methods __iter__ and __next__ necessary?"

Iteration in Python is a protocol, not a special case: any object with `__iter__` (returning an iterator) and `__next__` (returning the next value or raising `StopIteration`) works in a `for` loop, unpacking, `list()`, and everywhere else Python iterates. `for` loops catch `StopIteration` for you — it's the normal, expected signal that the sequence is exhausted, not an error condition to avoid.

```python
class Countdown:
    def __init__(self, start):
        self.current = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1
```

A generator object automatically implements both methods — that's why `def f(): yield x` is the easy way to get an iterator without writing this class by hand.

**Say it:** "Iteration is a protocol — `__iter__` returns an iterator, `__next__` returns the next value or raises `StopIteration` — and generators are the ergonomic way to get both for free instead of writing the class."
**Red flag:** Catching `StopIteration` deep inside a generator's body without re-raising as something else — since PEP 479, an unhandled `StopIteration` propagating out of a generator's frame is converted to a `RuntimeError`, precisely to stop it from silently terminating an enclosing loop.

### Building a generator with a class
**They ask:** "How to implement a generator using a class?"

You don't need `yield` to build something generator-*like* — implement `__iter__` returning `self` and `__next__` computing the next value lazily, same as any iterator. The difference from a `yield`-based generator function is boilerplate: the class version has to manage its own position/state as instance attributes explicitly, where `yield` lets the interpreter suspend and resume local variables for you.

```python
class Fibonacci:
    def __init__(self, limit):
        self.limit = limit
        self.a, self.b = 0, 1
    def __iter__(self):
        return self
    def __next__(self):
        if self.a > self.limit:
            raise StopIteration
        value = self.a
        self.a, self.b = self.b, self.a + self.b
        return value
```

**Say it:** "A class-based generator is the iterator protocol written by hand — `__iter__` returns self, `__next__` computes lazily — I use `yield` instead whenever I don't need the extra control a class gives me."
**Red flag:** Building a class-based iterator when a simple generator function would do — it's more code to maintain state that `yield` tracks for free.

### send, throw, and close on a generator
**They ask:** "Why does the send method exist in the generator? Why does a generator have a throw method? What is GeneratorExit?"

Generators aren't just one-way producers — `send(value)` resumes the generator and makes `value` the result of the `yield` expression that paused it, which turns a generator into a two-way coroutine-like channel (this is the mechanism `asyncio`'s coroutines were originally built on, pre-`async`/`await`). `throw(exc)` raises an exception *inside* the generator at the paused `yield`, letting the caller inject error handling into the generator's control flow. `close()` raises `GeneratorExit` at the suspend point so the generator can run cleanup (often via `finally`) before it's discarded — garbage collection calls `close()` automatically.

```python
def echo():
    while True:
        received = yield
        print(f"got {received}")

gen = echo()
next(gen)          # prime it to the first yield
gen.send("hello")  # prints "got hello"
```

**Say it:** "`send` resumes a generator and delivers a value into its paused `yield` expression, `throw` injects an exception at that point, and `close` raises `GeneratorExit` so the generator can clean up before it's discarded."
**Red flag:** Calling `send()` on a fresh, un-primed generator — it must be advanced to its first `yield` with `next()` first, or `send` raises `TypeError`.

### Async generators
**They ask:** "How to implement an asynchronous generator using a class?"

An async generator combines `yield` with `await` — `async def` containing `yield` produces an object iterated with `async for` instead of `for`, and each step can await I/O before yielding the next value. It's the natural fit for streaming data from an async source (paginated API, DB cursor) without buffering the whole result set.

```python
async def stream_users(db):
    async for row in db.cursor("SELECT * FROM users"):
        yield row

async def main():
    async for user in stream_users(db):
        process(user)
```

Building the class-based equivalent means implementing `__aiter__` (returning self) and `__anext__` (an `async def` returning the next value or raising `StopAsyncIteration`) — the async mirror of `__iter__`/`__next__`/`StopIteration`.

**Say it:** "An async generator is `async def` plus `yield` — iterated with `async for` — so I can stream and await I/O per item instead of blocking to build the whole collection first."
**Red flag:** Using a plain `for` loop over an async generator — it raises `TypeError`; the async iteration protocol needs `async for`.

### Context managers: why __enter__ and __exit__ exist
**They ask:** "What is a context manager? Why is it needed? Give an example."

A context manager guarantees a cleanup step runs, even if the code in between raises — that's the whole point over a manual open/close pair, where an exception between them skips the close. `with` calls `__enter__` on entry (its return value is what `as x` binds) and guarantees `__exit__` runs on the way out, exception or not.

```python
class Timer:
    def __enter__(self):
        self.start = time.monotonic()
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"took {time.monotonic() - self.start:.3f}s")

with Timer():
    do_work()
```

File handles, DB connections, and locks are the canonical examples — anywhere "acquire, do work, always release" is the shape.

**Say it:** "A context manager guarantees `__exit__` runs whether or not the block raised — that's the difference from a manual open/close, where an exception in between leaks the resource."
**Red flag:** Manually calling `.close()` after a block instead of using `with` — any exception before that line leaks the file handle, connection, or lock.

### Exceptions inside a context manager's block
**They ask:** "If an exception occurs during the execution of the context manager, will the code that should be executed when the context manager exits be executed? What additional parameters are passed to __exit__? How to suppress an exception if it occurs?"

Yes — `__exit__` always runs, exception or not; that's the guarantee `with` exists to provide. When an exception occurred, Python passes it into `__exit__` as three arguments: `exc_type`, `exc_val`, `exc_tb`. Returning a truthy value from `__exit__` tells Python the exception was handled and suppresses it from propagating further — returning `None`/falsy (the default if you don't return anything) lets it continue to propagate after `__exit__` finishes its cleanup.

```python
class SuppressValueError:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        return exc_type is ValueError  # True = swallow it
```

**Say it:** "`__exit__` always runs and receives the exception info as `(exc_type, exc_val, exc_tb)`; returning truthy from it suppresses the exception, which is why an accidental `return True` in `__exit__` silently swallows real bugs."
**Red flag:** A context manager whose `__exit__` returns `True` unconditionally "for safety" — it swallows every exception raised in the block, including ones that should crash loudly.

### contextlib helpers
**They ask:** "Examples of context managers from contextlib."

Writing a full class with `__enter__`/`__exit__` is overkill for a simple case, so `contextlib` gives you the common shapes without the boilerplate. `@contextmanager` turns a generator function into a context manager — code before `yield` is `__enter__`, code after (typically in `finally`) is `__exit__`. `contextlib.suppress(ExceptionType)` swallows a specific exception type declaratively instead of a bare `try/except: pass`. `ExitStack` manages a dynamic number of context managers (e.g. opening a variable list of files) that all need to close together.

```python
from contextlib import contextmanager

@contextmanager
def timer():
    start = time.monotonic()
    try:
        yield
    finally:
        print(f"took {time.monotonic() - start:.3f}s")
```

**Say it:** "For a one-off context manager I reach for `@contextmanager` over a full class — the code before `yield` is enter, the `finally` after it is exit, with far less boilerplate."
**Red flag:** Hand-writing a class-based context manager for a simple acquire/release pair — `@contextmanager` does it in five lines and is easier to read.

### Async context managers
**They ask:** "What keywords are used to call the asynchronous context manager? How to implement an asynchronous context manager using a class?"

`async with` pairs with a class implementing `__aenter__` and `__aexit__` as coroutines — the async mirror of `__enter__`/`__exit__`, needed whenever acquiring or releasing the resource itself requires awaiting I/O (an async DB connection, an aiohttp session).

```python
class AsyncConnection:
    async def __aenter__(self):
        self.conn = await connect()
        return self.conn
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.conn.close()

async def main():
    async with AsyncConnection() as conn:
        await conn.query(...)
```

`contextlib.asynccontextmanager` is the async equivalent of `@contextmanager` for the generator-function shortcut.

**Say it:** "`async with` needs `__aenter__`/`__aexit__` as coroutines — I reach for that whenever acquiring or releasing the resource itself does I/O, like an async DB connection."
**Red flag:** Using plain `with` on an object that only implements `__aenter__`/`__aexit__` — it raises `AttributeError` because sync `with` looks for `__enter__`/`__exit__`.

### What dunder methods are and why Python leans on them
**They ask:** "What are magic (double underscore, dunder) methods? What is a Python Data Model?"

Python's data model is the set of dunder methods that let a class opt into the language's built-in protocols — `len(x)` calls `x.__len__()`, `x + y` calls `x.__add__(y)`, `x[i]` calls `x.__getitem__(i)`. The reason this beats named methods like `.length()` is uniformity: any object implementing the right dunders works with `len()`, `for`, `+`, `[]`, `in`, and every other piece of syntax the language and its stdlib already know how to use — you get free interoperability with the whole ecosystem instead of everyone inventing their own method names.

```python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
```

**Say it:** "Dunder methods are how a class opts into Python's built-in protocols — implement `__len__` or `__add__` and your object works with `len()` or `+` the same as a built-in type, for free."
**Red flag:** Writing `.get_length()` on a custom collection instead of `__len__` — it works, but it opts out of every piece of code (built-in or third-party) that expects `len(x)` to work.

### __len__ and __call__
**They ask:** "Why is the __len__ magic method necessary? How does the __call__ magic method work and what is it used for?"

`__len__` is what makes `len(obj)` and truthiness testing (`if obj:`) work for a custom collection — without it, `len()` raises `TypeError`, and an object without `__len__` or `__bool__` is always truthy regardless of "emptiness." `__call__` makes an *instance* callable like a function — `obj()` invokes `obj.__call__()`. That's the mechanism behind class-based decorators, memoizing objects, and any "callable with state" — it lets you hand out something that behaves like a function but carries configuration or accumulated state.

```python
class Multiplier:
    def __init__(self, factor):
        self.factor = factor
    def __call__(self, x):
        return x * self.factor

double = Multiplier(2)
double(5)  # 10
```

**Say it:** "`__len__` wires an object into `len()` and empty-collection truthiness checks; `__call__` makes an instance invokable like a function, which is how class-based decorators and stateful callables work."
**Red flag:** Relying on `if obj:` for "is this empty" without `__len__`/`__bool__` defined — a custom object with neither is always truthy, so the check silently does nothing useful.

### __str__ vs __repr__
**They ask:** "The difference between the __str__ and __repr__ magic methods."

`__repr__` targets *developers* — it should be unambiguous, ideally something you could paste back into Python to recreate the object, and it's what shows up in a REPL or inside a `list`/`dict` repr. `__str__` targets *end users* — a readable string for `print()` and `str()`. If you only define one, define `__repr__`: Python falls back to it for `str()` when `__str__` is missing, but not the other way around.

```python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point(x={self.x}, y={self.y})"
    def __str__(self):
        return f"({self.x}, {self.y})"
```

**Say it:** "`__repr__` is for developers and debugging — unambiguous, ideally re-creatable — `__str__` is for end users; if I only write one, it's `__repr__`, since `str()` falls back to it."
**Red flag:** Defining `__str__` only and leaving `__repr__` as the default `<Point object at 0x...>` — debugging sessions and logs lose all useful information.

### The comparison protocol
**They ask:** "Which magic method must be declared to overload the operator==? Magic methods for comparing objects (__eq__, __ne__, __lt__, __le__, __gt__, __ge__) and how are they related to the comparison protocol?"

`==` calls `__eq__`, and each other comparison operator maps to its own dunder (`<` → `__lt__`, `<=` → `__le__`, etc.) — there's no automatic derivation between them by default, so a class needs each comparison it wants to support explicitly. Writing all six by hand for anything beyond `__eq__` and one ordering method is repetitive, which is why `functools.total_ordering` exists: define `__eq__` and one of `__lt__`/`__le__`/`__gt__`/`__ge__`, and it derives the rest.

```python
from functools import total_ordering

@total_ordering
class Version:
    def __init__(self, num): self.num = num
    def __eq__(self, other): return self.num == other.num
    def __lt__(self, other): return self.num < other.num
```

Defining `__eq__` without `__hash__` makes instances unhashable by default (Python sets `__hash__` to `None`), which matters the moment you try to put one in a `set` or use it as a `dict` key.

**Say it:** "Each comparison operator maps to its own dunder with no automatic relationship between them, so I use `functools.total_ordering` to derive the rest from `__eq__` plus one ordering method instead of writing all six."
**Red flag:** Defining `__eq__` and then being surprised the object can't go in a `set` — Python disables `__hash__` automatically once you override `__eq__`, unless you define `__hash__` yourself.

### __iter__ and __next__ on your own class
**They ask:** "Why are the magic methods __iter__ and __next__ necessary?"

`__iter__` is what makes `for x in obj` and `iter(obj)` work — it must return an iterator (an object with `__next__`). `__next__` is what produces each value and raises `StopIteration` when exhausted. Separating them (rather than one dunder doing both) is what allows an object to be *iterable multiple times* — a container's `__iter__` returns a fresh iterator each call, while the iterator itself is single-use and consumed as you go.

```python
class Fibonacci:
    def __init__(self, limit):
        self.limit = limit
    def __iter__(self):
        a, b = 0, 1
        while a <= self.limit:
            yield a
            a, b = b, a + b
```

**Say it:** "Splitting `__iter__` from `__next__` is what lets a container be iterated more than once — `__iter__` hands back a fresh iterator each time, while the iterator itself is single-use."
**Red flag:** Making a container's `__iter__` return `self` when the container itself tracks position — that breaks nested or repeated iteration, since two `for` loops over the same object share one cursor.

### __contains__ and membership testing
**They ask:** "Why is the __contains__ magic method necessary?"

`in` calls `__contains__` if it's defined; without it, Python falls back to iterating the whole object and comparing each item, which is O(n). Defining `__contains__` explicitly matters when you can do the check faster — a set-backed lookup, a database `EXISTS` query, a range check — instead of paying for a linear scan every time `in` is used.

```python
class IPRange:
    def __init__(self, start, end):
        self.start, self.end = start, end
    def __contains__(self, ip):
        return self.start <= ip <= self.end
```

**Say it:** "Without `__contains__`, `in` falls back to a linear scan via `__iter__`; I define it explicitly whenever the object can answer membership faster than iterating everything."
**Red flag:** Relying on the default iteration-based `in` for a large custom collection where a O(1) or O(log n) check is possible — it's a silent performance cliff nobody notices until the collection grows.

### __getattr__, __getattribute__, and __getitem__
**They ask:** "How are the magic methods __getattribute__ and __getitem__ different?"

`__getattribute__` intercepts *every* attribute access (`obj.x`) unconditionally and is rarely overridden directly because it's easy to break (you must call `super().__getattribute__` or recurse infinitely). `__getattr__` is the safer, common hook — it's only called when normal attribute lookup *fails*, making it the right tool for lazy attributes, proxies, or friendly `AttributeError` messages. `__getitem__` is unrelated to attribute access entirely — it powers `obj[key]` subscripting, independent of dot access.

```python
class LazyConfig:
    def __getattr__(self, name):
        value = load_from_disk(name)   # only runs on missing attrs
        setattr(self, name, value)
        return value
```

**Say it:** "`__getattribute__` intercepts every `obj.x`, `__getattr__` only fires when normal lookup fails — so `__getattr__` is what I reach for, for lazy attributes or proxies, since it's much harder to break."
**Red flag:** Overriding `__getattribute__` without calling `object.__getattribute__(self, name)` inside it — every attribute access, including your own internal ones, recurses infinitely.

### __new__ vs __init__
**They ask:** "Why is the __new__ magic method necessary?"

`__new__` is the actual constructor — it *creates* the instance (typically via `object.__new__`) and returns it; `__init__` then *initializes* the already-created instance and returns nothing. You only override `__new__` when you need to control instance creation itself: singletons, immutable types (subclassing `int`/`str`/`tuple`, since their value is fixed at creation, before `__init__` could set it), or metaclass-level tricks.

```python
class Singleton:
    _instance = None
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

**Say it:** "`__new__` creates the instance, `__init__` initializes it — I only touch `__new__` for singletons or subclassing immutable built-ins, where the value has to be fixed before `__init__` would even run."
**Red flag:** Overriding `__init__` to try to control whether an instance gets created at all — by the time `__init__` runs, the object already exists; that decision belongs in `__new__`.

### __init_subclass__ and __set_name__
**They ask:** "Why is the __init_subclass__ magic method needed? How to use __set_name__ magic method in descriptors?"

`__init_subclass__` is a hook that runs automatically whenever a class is *subclassed* — it lets a base class validate or register subclasses (e.g. a plugin system that auto-registers every subclass) without needing a metaclass, which is the lighter-weight tool for the common case. `__set_name__` is called once, at class-body execution time, on a descriptor — it tells the descriptor the attribute name it was assigned to, which is what lets a reusable descriptor know which instance attribute to store its value under without the caller passing the name explicitly.

```python
class Field:
    def __set_name__(self, owner, name):
        self.name = f"_{name}"
    def __get__(self, obj, objtype=None):
        return getattr(obj, self.name, None)
    def __set__(self, obj, value):
        setattr(obj, self.name, value)
```

**Say it:** "`__init_subclass__` hooks subclass creation without a metaclass — good for plugin registration — and `__set_name__` tells a descriptor its own attribute name at class-definition time, so it doesn't have to be passed in manually."
**Red flag:** Reaching for a full metaclass to validate or register subclasses — `__init_subclass__` does the same job with far less ceremony for the common case.

### Descriptors — what property is built on
**They ask:** "What is property? What other descriptor exists besides getter and setter?"

`@property` is the friendly surface over the descriptor protocol: any object implementing `__get__` (and optionally `__set__`/`__delete__`) on a class attribute is a descriptor, and Python calls those methods instead of doing plain attribute lookup. `property` is a *data descriptor* (defines both `__get__` and `__set__`) built into the language for the common single-attribute case; a custom descriptor class is what you reach for when the same get/set logic needs to be reused across many attributes or classes — the descriptor is written once and attached to multiple attributes.

```python
class PositiveNumber:
    def __set_name__(self, owner, name):
        self.name = "_" + name
    def __get__(self, obj, objtype=None):
        return getattr(obj, self.name)
    def __set__(self, obj, value):
        if value < 0:
            raise ValueError("must be positive")
        setattr(obj, self.name, value)

class Account:
    balance = PositiveNumber()
```

**Say it:** "`property` is a built-in data descriptor for one attribute at a time; when the same validation or computed-attribute logic needs to be reused across several attributes or classes, I write a descriptor once instead of repeating property boilerplate."
**Red flag:** Copy-pasting the same `@property` getter/setter pair across five classes — that repetition is exactly what a reusable descriptor class is for.

### Garbage collection and reference counting
**They ask:** "What is Garbage Collector? What is the keyword for instantly marking an object for deletion?"

CPython's primary memory management is reference counting: every object tracks how many references point to it, and it's freed the instant that count hits zero — this is why memory in CPython is usually reclaimed immediately and deterministically, unlike a tracing GC that runs periodically. Reference counting alone can't collect *cycles* (two objects referencing each other, neither reachable from outside) — that's what the separate cyclic garbage collector (in the `gc` module) does: it periodically scans for and collects unreachable reference cycles. `del x` doesn't necessarily delete the object — it removes *that name's* reference; the object is only freed once its reference count reaches zero.

```python
import gc
gc.collect()  # force a cyclic-collection pass
```

**Say it:** "CPython frees an object the instant its refcount hits zero — that's why memory is usually reclaimed immediately — but reference cycles need the separate cyclic collector in `gc`, since neither object's count ever reaches zero on its own."
**Red flag:** Saying `del x` "deletes the object" — it removes one reference; the object is only freed once its refcount reaches zero, which might be immediately or might be never, if something else still holds it.

### Detecting and avoiding memory leaks in Python
**They ask:** "What is Memory Leak? What are the ways to determine the memory leak?"

A memory leak in Python isn't the C/C++ kind (forgetting to free) — it's objects staying *reachable* longer than intended, so the refcounting collector can never free them: an ever-growing module-level cache with no eviction, a listener/callback registered but never unregistered, or reference cycles involving objects with `__del__` (which the cyclic collector historically struggled to break safely). You diagnose it by watching process RSS over time and, when it's growing, using `tracemalloc` to snapshot allocations and diff two snapshots to see which call sites are accumulating objects; `objgraph` is useful for visualizing what's holding a reference to a suspect object.

```python
import tracemalloc
tracemalloc.start()
# ... run workload ...
snapshot = tracemalloc.take_snapshot()
for stat in snapshot.statistics("lineno")[:10]:
    print(stat)
```

**Say it:** "A Python leak is usually reachability, not a forgotten free — an unbounded cache or a callback that's never unregistered — so I diagnose it with `tracemalloc` snapshots diffed over time, not by looking for a missing `free()`."
**Red flag:** Reaching for `gc.collect()` as the fix for a suspected leak — if the objects are still reachable (the actual leak), forcing a collection cycle does nothing; you have to find and break the reference, not force a GC pass.

### Multiple inheritance and MRO
**They ask:** "Does Python have multiple inheritance? What is MRO? What class do all other classes in Python inherit from?"

Python supports multiple inheritance directly, and every class ultimately inherits from `object`. The Method Resolution Order (MRO) is the deterministic sequence Python walks to find an attribute or method when multiple base classes could provide it — computed with the C3 linearization algorithm, which guarantees a consistent, monotonic order (a subclass always precedes its parents, and a class's relative order among its own bases is preserved). `ClassName.__mro__` (or `ClassName.mro()`) shows the actual order; `ClassName.__bases__` shows only the direct parents.

```python
class A: pass
class B(A): pass
class C(A): pass
class D(B, C): pass

print(D.__mro__)  # D -> B -> C -> A -> object
```

**Say it:** "Multiple inheritance in Python resolves through the MRO, computed with C3 linearization — `D.__mro__` shows the exact lookup order, and it's what makes `super()` predictable even in diamond hierarchies."
**Red flag:** Assuming Python resolves multiple inheritance depth-first, left-to-right like some older languages — C3 linearization is different specifically to avoid inconsistent orderings; check `__mro__` rather than guessing.

### Mixins and the diamond problem
**They ask:** "What is Mixin? Description of the diamond problem. How does super() behave with multiple inheritance?"

A mixin is a class designed to be combined via multiple inheritance to add one specific capability (serialization, logging, comparison helpers) without being usable standalone — it's composition dressed as inheritance, and it only works cleanly because of the MRO. The diamond problem — `D(B, C)` where both `B` and `C` inherit from `A` — is resolved by the MRO ensuring `A` is visited exactly once, after both `B` and `C`, rather than being processed twice or ambiguously. `super()` in a multiple-inheritance chain doesn't mean "my direct parent" — it means "the next class in the MRO," which is why cooperative multiple inheritance requires every class in the chain to call `super().__init__(...)` (even when it looks like there's nothing to call), or a mixin further down the chain gets silently skipped.

```python
class Base:
    def __init__(self): print("Base"); 
class LoggingMixin:
    def __init__(self):
        super().__init__()
        print("LoggingMixin")
class Service(LoggingMixin, Base):
    def __init__(self):
        super().__init__()
        print("Service")
```

**Say it:** "`super()` means 'the next class in the MRO,' not 'my parent' — that's what makes the diamond problem resolvable, but it also means every class in a cooperative multiple-inheritance chain must call `super().__init__()` or the next mixin in line gets silently skipped."
**Red flag:** Calling `Base.__init__(self)` directly instead of `super().__init__()` in a mixin — it bypasses the MRO and can run a base class's initializer twice, or skip a sibling mixin entirely.
