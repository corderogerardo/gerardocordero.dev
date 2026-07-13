# Python — types, collections & typing

### Python's type system at a glance
**They ask:** "What are the main sets that types are divided into in Python? Which of the proposed collections falls under mutable, which under immutable?"

The split senior interviewers actually care about is mutable vs. immutable, because it determines what you can safely use as a dict key or set member, and whether passing an object around risks aliasing bugs. Immutable: `int`, `float`, `bool`, `complex`, `str`, `bytes`, `tuple`, `frozenset`, `NoneType`. Mutable: `list`, `dict`, `set`, `bytearray`. Immutability isn't just a style preference — it's what makes an object hashable (by default), which is a prerequisite for dict keys and set membership.

```python
d = {(1, 2): "point"}   # tuple key: fine, tuples are immutable
d = {[1, 2]: "point"}   # TypeError: list keys aren't hashable
```

**Say it:** "The mutable/immutable split is the one that actually matters day to day — it decides what's hashable enough to be a dict key or set member, and where I need to worry about aliasing instead of copying."
**Red flag:** Treating `tuple` as "just an immutable list" without noting it can still hold mutable elements — `([1, 2],)` is a valid tuple, but it's unhashable because the list inside it is — so a tuple's hashability actually depends on what it contains.

### None, is vs ==, and interning
**They ask:** "What is None? What's the difference between x == 'string' and x is 'string'? Which is correct?"

`None` is the singleton instance of `NoneType` — there's exactly one, ever, in a running interpreter, which is why identity (`is`) rather than equality (`==`) is the correct check: `x is None`, not `x == None`. The reason `is` is preferred isn't just style — a class could override `__eq__` to make `obj == None` return something unexpected, but `is` always compares identity and can never be fooled that way. The same logic doesn't hold for strings: `x is "string"` is unreliable because CPython *may* intern short string literals (reuse the same object) as an implementation detail, not a language guarantee — two equal strings aren't guaranteed to be the same object, so `==` is the correct check for value equality of strings.

```python
x = None
if x is None: ...       # correct
if x == None: ...       # works but can be fooled by __eq__ overrides

a = "hello"; b = "hello"
a is b   # True in CPython today, but not guaranteed — use ==
```

**Say it:** "`is` checks identity and `None` has exactly one instance, so `x is None` is correct and can't be fooled by an overridden `__eq__`; for strings I always use `==` because interning is a CPython implementation detail, not a guarantee."
**Red flag:** Using `is` to compare two strings for equality "because it's faster" — it relies on interning behavior that isn't part of the language spec and breaks for longer or dynamically-built strings.

### int, bool, and float relationships
**They ask:** "Is float a class that inherits from int? Is bool a class that inherits from int? How does the unary ~ operator work on int and bool?"

`bool` is a subclass of `int` — `True == 1` and `False == 0` are both `True`, and you can use booleans anywhere an int is expected (`sum([True, True, False])` is `2`). This is a historical design choice (Python added `bool` in 2.3, after `int` already stood in for booleans) that still shows up in interview traps like `isinstance(True, int)` being `True`. `float` is *not* a subclass of `int` — they're siblings, both implementing the numeric protocol but distinct types, so `isinstance(1.0, int)` is `False`. The unary `~` operator is bitwise NOT on `int` — it computes `-(x + 1)`. Applying it directly to a `bool` (`~True`) is deprecated as of Python 3.12 and becomes an error in 3.16, because "bitwise-invert a truth value" is rarely what anyone means; if you want the bitwise inversion, convert first (`~int(True)`), and if you want logical negation, use `not True`.

```python
isinstance(True, int)   # True — bool IS an int subclass
isinstance(1.0, int)    # False — float and int are siblings
~5                      # -6  ( -(5+1) )
~int(True)               # -2 — bitwise inversion, be explicit about the int() coercion
not True                 # False — logical negation, what `~True` is usually mistaken for
```

**Say it:** "`bool` is an `int` subclass — `True` and `1` are interchangeable in arithmetic — but `float` is a sibling type to `int`, not a subclass, which is the trap in `isinstance` checks."
**Red flag:** Assuming `isinstance(x, int)` excludes booleans — it doesn't, since `bool` IS-A `int`; if you need to exclude booleans specifically, check `type(x) is int` or add an explicit `not isinstance(x, bool)`.

### Exceptions: hierarchy and try/except/else/finally
**They ask:** "How are Exception and BaseException different? The try/except/else/finally construct — which parts are required? How to declare your own Exception?"

`BaseException` is the true root, and it includes things you almost never want to catch broadly — `SystemExit`, `KeyboardInterrupt`, `GeneratorExit` — because catching them breaks Ctrl-C and clean process shutdown. `Exception` is the subclass that covers everything you should normally catch; `except Exception` (not bare `except:`) is the idiomatic "catch broadly but not too broadly." Only `try` and one of `except`/`finally` are required; `else` runs only if no exception occurred, and is where code that should *not* be covered by the `except` block belongs (so a bug in that code doesn't get mistakenly caught as the exception you were guarding against).

```python
class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        super().__init__(f"balance {balance} < requested {amount}")
        self.balance = balance

try:
    withdraw(100)
except InsufficientFundsError as e:
    log.warning(e)
else:
    confirm()
finally:
    release_lock()
```

**Say it:** "I catch `Exception`, never bare `except:` or `BaseException` — a bare except also swallows `KeyboardInterrupt` and `SystemExit`, which breaks clean shutdown."
**Red flag:** A bare `except:` "to be safe" — it silently swallows Ctrl-C, `SystemExit`, and typos that raise `NameError`, turning real bugs into silent no-ops.

### ExceptionGroup and chained exceptions
**They ask:** "What is ExceptionGroup for (Python 3.11)? How to call a caught Exception, obliterating its previous traceback?"

`ExceptionGroup` (3.11+) exists because some operations — `asyncio.TaskGroup`, concurrent batch operations — can fail with *multiple, independent* exceptions at once, and a single `try/except` can only carry one. `ExceptionGroup` bundles them, and the matching `except*` syntax lets you handle each exception type in the group separately. Separately: re-raising a caught exception as a new one normally chains them (`During handling of the above exception, another exception occurred`) via `__context__` — using `raise NewError() from None` explicitly suppresses that chaining when the original traceback is noise, not useful context.

```python
try:
    async with asyncio.TaskGroup() as tg:
        tg.create_task(fetch(a))
        tg.create_task(fetch(b))
except* ValueError as eg:
    for exc in eg.exceptions:
        log.error(exc)
```

**Say it:** "`ExceptionGroup` and `except*` exist because concurrent operations can fail with more than one independent exception at once, which a single `try/except` can't represent — I use `raise ... from None` only when the original traceback is genuinely noise, not to hide a bug."
**Red flag:** Reaching for `raise ... from None` reflexively on every re-raise — that erases traceback context that's usually exactly what you need to debug the real failure.

### bytes vs bytearray, and encoding
**They ask:** "What is the difference between bytes and bytearray types? How to convert str to bytes and bytes back to str? When to use bytearray instead of regular bytes?"

`bytes` is immutable, `bytearray` is its mutable counterpart — same underlying data (a sequence of integers 0-255), different mutability guarantees. You reach for `bytearray` when you're building up binary data incrementally (streaming a network response, assembling a buffer) and want to mutate in place instead of allocating a new `bytes` object on every append. Converting between `str` and `bytes` always goes through an explicit encoding — Python 3 refuses to guess, unlike Python 2's implicit coercion, which is a deliberate design choice to prevent silent mojibake.

```python
s = "café"
b = s.encode("utf-8")     # str -> bytes
s2 = b.decode("utf-8")    # bytes -> str

buf = bytearray()
buf.extend(b"chunk1")
buf.extend(b"chunk2")     # mutate in place, no reallocation per chunk
```

**Say it:** "`bytes` is immutable and `bytearray` is mutable — I reach for `bytearray` when I'm assembling binary data incrementally, so I'm not reallocating on every append."
**Red flag:** Building up a large binary payload by repeatedly concatenating `bytes` objects (`b += chunk`) in a loop — each concatenation allocates a new object; `bytearray.extend()` or a list joined at the end avoids the quadratic cost.

### Collections overview: list, dict, set, tuple
**They ask:** "Give examples of data structures in Python. Why is the dict data structure necessary? Name the main methods for working with list and dict."

The four built-in collections map to four different access patterns senior candidates should reason about, not just recite: `list` for ordered, mutable, index-accessed sequences; `dict` for O(1) average key-based lookup — necessary anywhere you need "look this up by name" faster than scanning a list; `set` for O(1) average membership testing and set algebra (union, intersection) without duplicates; `tuple` for fixed, immutable, hashable groupings (safe as dict keys, safe to pass without risk of the callee mutating it).

```python
nums = [3, 1, 2]; nums.sort(); nums.append(4)
counts = {}; counts.setdefault("a", 0); counts["a"] += 1
seen = set(); seen.add(1); seen.discard(1)
```

**Say it:** "I pick the collection by access pattern, not habit — `dict` for key lookup, `set` for membership and dedup, `tuple` when the value needs to be immutable and hashable, `list` for everything else ordered."
**Red flag:** Using `x in some_list` for a membership check that runs in a hot loop — that's O(n) per check; converting to a `set` once up front makes it O(1).

### dict internals: hashing, equal keys, and insertion order
**They ask:** "What keys will be in the dict as a result of {1: 'a', True: 'b', 1.0: 'c'}? Does the insertion order store the dict data structure? Is it possible to make any object the key of a dict?"

`{1: "a", True: "b", 1.0: "c"}` ends up with a single key, `1`, mapped to `"c"` — because `1 == True == 1.0` and they all hash equal, each subsequent assignment overwrites the same dict slot rather than adding a new one. Since Python 3.7, dicts guarantee insertion order as a language feature (not just a CPython implementation detail) — iterating a dict yields keys in the order they were first inserted. Any *hashable* object can be a dict key — meaning it implements `__hash__` and that hash never changes over the object's lifetime; that's why mutable types (`list`, `dict`, `set`) are excluded by default, and why overriding `__eq__` without `__hash__` makes a class unhashable.

```python
d = {1: "a", True: "b", 1.0: "c"}
d  # {1: "c"}  — one key, last write wins
```

**Say it:** "`1`, `True`, and `1.0` hash equal and compare equal, so they collapse to one dict key — last write wins; dicts have guaranteed insertion order since 3.7, which used to be a CPython implementation detail and is now part of the language spec."
**Red flag:** Assuming dict key uniqueness is about object identity — it's about `__eq__` and `__hash__`, which is exactly why `1` and `True` collide even though they're different objects.

### set operations and frozenset
**They ask:** "What methods exist in the set data structure to perform operations between two sets? What is a frozenset and how is it different from a regular set?"

`set` supports the full algebra you'd expect from math: `|`/`union`, `&`/`intersection`, `-`/`difference`, `^`/`symmetric_difference`, plus in-place variants (`update`, `intersection_update`). `frozenset` is set's immutable counterpart — same operations for reading, no mutation methods — which matters because it makes a frozenset hashable and therefore usable as a dict key or a member of another set, something a mutable `set` can never be.

```python
a, b = {1, 2, 3}, {2, 3, 4}
a & b   # {2, 3}
a | b   # {1, 2, 3, 4}
a - b   # {1}

groups = {frozenset({1, 2}): "pair"}   # frozenset as a dict key
```

**Say it:** "`frozenset` exists specifically to be hashable — a plain `set` can never be a dict key or a member of another set, because it's mutable; `frozenset` gives up mutation for exactly that capability."
**Red flag:** Trying to put a `set` inside another `set` or use it as a dict key — it raises `TypeError: unhashable type`; the fix is `frozenset`, not giving up on the design.

### Comprehensions
**They ask:** "What is comprehension? What data structures can be created through comprehension? Is it possible to write a comprehension of 2+ levels of nesting? Are there asynchronous comprehensions?"

A comprehension is a compact, declarative way to build a collection from an iterable — list, dict, set, and generator (with `()` instead of `[]`, producing a lazy iterator rather than materializing the collection) all have their own syntax. Nested comprehensions work but readability drops fast past two levels — a flattening double loop is the common case that's still readable; beyond that, a plain loop with intermediate names usually reads better than a comprehension trying to do too much. Async comprehensions (`[x async for x in aiter]`) exist for iterating an async generator or `async for`-compatible source inside a comprehension, and can combine with `await` inside the expression.

```python
squares = [x**2 for x in range(10) if x % 2 == 0]
flat = [x for row in matrix for x in row]          # 2-level flatten
lookup = {k: v for k, v in pairs}
lazy = (x**2 for x in range(10**9))                 # generator expr — no memory blowup

results = [x async for x in async_source()]
```

**Say it:** "Comprehensions are for the shape 'transform/filter this iterable into a new collection' — the moment it needs more than a filter and a transform, or nests past two levels, I switch to a loop for readability."
**Red flag:** A triple-nested comprehension with multiple conditions crammed into one line — it's technically valid but unreadable; that's a loop pretending to save characters.

### Shallow copy vs deep copy
**They ask:** "What is the difference between shallow copy and deep copy in the context of collections in Python?"

A shallow copy (`list(x)`, `x.copy()`, `copy.copy(x)`) creates a new outer container but keeps references to the *same* nested objects — mutating a nested list inside the copy also mutates it in the original, because both point to the same inner object. `copy.deepcopy(x)` recursively copies every nested object too, so the copy is fully independent — at the cost of more time and memory, and it needs every nested object to be copyable (custom `__deepcopy__` for anything special, like an open file handle that can't be duplicated).

```python
import copy
original = {"nums": [1, 2, 3]}
shallow = original.copy()
shallow["nums"].append(4)
original["nums"]   # [1, 2, 3, 4] — the nested list is shared!

deep = copy.deepcopy(original)
deep["nums"].append(5)
original["nums"]   # unaffected
```

**Say it:** "A shallow copy duplicates the outer container but shares nested objects, so mutating something nested leaks back into the original — `deepcopy` is what I reach for when the copy genuinely needs to be independent all the way down."
**Red flag:** Using `dict.copy()` or `list.copy()` on a structure with nested mutable objects and assuming full isolation — that's exactly the bug shallow copy doesn't protect against.

### Tuple unpacking and tuples as dict keys
**They ask:** "What is tuple unpacking? Can a tuple be a key in a dict? Are there any exceptions to this rule?"

Tuple unpacking destructures a sequence into named variables in one statement, including a starred catch-all for "the rest": `a, *rest, b = [1, 2, 3, 4]` gives `a=1, rest=[2, 3], b=4`. A tuple *can* be a dict key precisely because tuples are immutable and hashable by default — but only if every element inside it is also hashable; a tuple containing a `list` (`(1, [2, 3])`) is unhashable, because hashability requires everything nested to be hashable too.

```python
point = (3, 4)
d = {point: "origin-ish"}          # fine — tuple of ints

bad = (1, [2, 3])
d2 = {bad: "x"}                    # TypeError: unhashable type: 'list'
```

**Say it:** "A tuple's hashability — and therefore whether it can be a dict key — isn't automatic; it depends recursively on every element inside being hashable too, so a tuple holding a list still can't be a key."
**Red flag:** Assuming "tuple" always means "safe as a dict key" — it's only safe if nothing nested inside it is mutable.

### Decimal vs float
**They ask:** "Why is the Decimal type needed if there is a float type? What will decimal.Decimal(0.3) != decimal.Decimal('0.3') return and why?"

`float` uses binary floating-point, which can't represent most decimal fractions exactly — `0.1 + 0.2 != 0.3` is the classic symptom. `Decimal` uses base-10 arithmetic, which represents decimal values exactly, and that precision is why it's the correct choice anywhere money or exact decimal math matters — financial calculations, invoicing, anything audited. The gotcha: `Decimal(0.3)` first constructs from the already-imprecise *float* `0.3` (inheriting its binary rounding error), while `Decimal("0.3")` constructs from the *string* and is exact — so those two are genuinely different values, and the `!=` comparison is `True`.

```python
from decimal import Decimal
Decimal(0.3)     # Decimal('0.299999999999999988897769753748...')
Decimal("0.3")   # Decimal('0.3') — exact
Decimal(0.3) != Decimal("0.3")   # True
```

**Say it:** "I always construct `Decimal` from a string, not a float — `Decimal(0.3)` inherits float's binary rounding error before `Decimal` even gets involved, while `Decimal('0.3')` is exact."
**Red flag:** Using `float` for money math "because it's simpler" — accumulated rounding error compounds across many operations and shows up as cents-level discrepancies that are hard to trace back.

### Enum — why, and comparisons
**They ask:** "What is Enum? Why are Enums good? Which operator should be used to compare with Enum elements — == or is?"

`Enum` replaces a set of loose module-level constants or magic strings with a proper type — it gives you a closed, named set of values, IDE autocomplete, and a type checker can flag a typo'd or out-of-range value at analysis time instead of failing at runtime. Enum members are singletons (each member is created exactly once), so `is` works for comparison — but `==` is still the idiomatic, safer choice because it also works correctly against `IntEnum`/`Flag` members compared to their raw values, where `is` could behave unexpectedly.

```python
from enum import Enum

class Status(Enum):
    PENDING = "pending"
    ACTIVE = "active"
    CLOSED = "closed"

if order.status == Status.ACTIVE: ...
```

**Say it:** "Enum turns a pile of magic strings into a closed, named, type-checked set of values — I compare with `==`, not `is`, even though members are singletons, because it's consistent with `IntEnum`/`Flag` comparisons too."
**Red flag:** Using bare strings ("pending", "active") scattered through a codebase instead of an `Enum` — a typo in one of those strings is a silent bug a type checker can't catch; an `Enum` member typo is a `NameError` at write time.

### dataclass — what it gives you
**They ask:** "What is data class? Does the sequence of default values matter in a dataclass? Why? Why is __post_init__ needed in dataclass?"

`@dataclass` generates the boilerplate you'd otherwise hand-write for a plain data-holding class — `__init__`, `__repr__`, `__eq__` — from type-annotated class attributes, so the class stays declarative. Field ordering rules mirror function parameter rules because the generated `__init__` is a real function signature: any field with a default must come after all fields without one, or you get a `TypeError` at class definition time, not at instantiation. `__post_init__` is the hook for logic that has to run after the generated `__init__` assigns fields — validation, or computing a derived field from the ones just set.

```python
from dataclasses import dataclass, field

@dataclass
class Order:
    id: int
    items: list = field(default_factory=list)   # mutable default needs field()
    total: float = 0.0

    def __post_init__(self):
        if self.total < 0:
            raise ValueError("total can't be negative")
```

**Say it:** "`@dataclass` generates `__init__`/`__repr__`/`__eq__` from annotated fields, and its field-ordering rule is the same as any function signature — defaults have to come last; `__post_init__` is where I put validation that needs to run after those fields are set."
**Red flag:** Writing `items: list = []` as a dataclass field default — like any Python default argument, that list is shared across every instance; `field(default_factory=list)` creates a fresh one per instance.

### Typing basics: annotations, Optional, Union
**They ask:** "What is type annotation (type hinting)? What is typing.Optional? What is typing.Union, and how can you annotate without it in newer Python?"

Type hints are optional, structural documentation checked by a separate tool (mypy, pyright) — they carry zero runtime enforcement on their own, which is the detail interviewers probe for. `Optional[X]` is shorthand for `Union[X, None]` — "this can be X or absent." `Union[X, Y]` means "one of several types is acceptable"; Python 3.10+ lets you write that as `X | Y` directly, without importing `typing.Union` at all.

```python
def find_user(user_id: int) -> Optional[User]: ...
def find_user(user_id: int) -> User | None: ...   # 3.10+, equivalent
def parse(value: int | str) -> float: ...
```

**Say it:** "Type hints are checked by an external tool, not the interpreter — nothing stops you from passing the wrong type at runtime; `X | Y` in 3.10+ replaced most everyday uses of `typing.Union`."
**Red flag:** Assuming a type hint enforces anything at runtime — `def f(x: int)` happily accepts a string; validation still has to be explicit (an `assert`, a Pydantic model) if it needs to be enforced.

### typing deep cuts: Callable, Protocol, TypeVar, Generic
**They ask:** "What is typing.Callable? What's the difference between typing and collections.abc for typing purposes? Why is typing.Protocol needed? What is typing.Generic and typing.TypeVar?"

`Callable[[int, str], bool]` types a function value itself — its parameter types and return type — for when a function is passed as an argument (a callback, a key function). `typing.Protocol` is structural typing ("duck typing" made explicit): a class satisfies a Protocol by having the right methods/attributes, with no inheritance required — which is the correct tool when you want to accept "anything with a `.read()` method" without forcing every caller through a shared base class. `TypeVar` plus `Generic` is how you write a class or function that's generic over a type — a container that works with any element type `T` while still letting the type checker track *which* `T` for a given instance.

```python
from typing import Protocol, TypeVar, Generic

class Readable(Protocol):
    def read(self) -> bytes: ...

T = TypeVar("T")
class Stack(Generic[T]):
    def push(self, item: T) -> None: ...
    def pop(self) -> T: ...
```

Modern code increasingly imports the abstract base classes (`Sequence`, `Mapping`, `Iterable`) from `collections.abc` rather than `typing` — since 3.9 those support subscripting (`list[int]` instead of `typing.List[int]`) directly, making the separate `typing` generic aliases mostly legacy.

**Say it:** "`Protocol` gives me structural typing — I can accept 'anything with a `.read()`' without a shared base class — and since 3.9 I import container types from `collections.abc`, not `typing`, since they support subscripting natively now."
**Red flag:** Reaching for an ABC (`abc.ABC` + inheritance) to express "must have this method" when a `Protocol` would let callers satisfy the interface structurally, without being forced into an inheritance hierarchy they don't otherwise need.

### typing.Literal, NewType, overload, and final
**They ask:** "What is typing.Literal? How to use typing.NewType and how does it differ from other types? What is typing.overload? What is typing.final?"

`Literal["GET", "POST"]` narrows a type to specific *values*, not just a type — useful for a parameter that only accepts a fixed set of strings, which a type checker can then validate at every call site. `NewType` creates a distinct type for the checker (`UserId = NewType("UserId", int)`) that's still an `int` at runtime — it exists purely to stop you from accidentally passing a raw `int` where a `UserId` was meant, without any runtime cost. `@overload` documents multiple valid call signatures for a function whose behavior actually branches by argument type (the real implementation is a single un-decorated function beneath the overload stubs). `@final` marks a class or method as not meant to be subclassed/overridden — enforced by the type checker, not the runtime.

```python
from typing import Literal, NewType

Method = Literal["GET", "POST", "DELETE"]
UserId = NewType("UserId", int)

def fetch(method: Method) -> None: ...
def get_user(uid: UserId) -> User: ...
```

**Say it:** "`Literal` narrows to specific values, `NewType` creates a distinct type-checker identity over a primitive with zero runtime cost — both catch mistakes at analysis time that would otherwise only show up as a runtime bug."
**Red flag:** Using a plain `str` parameter for something that only ever accepts three specific values — `Literal` catches a typo'd fourth value at type-check time instead of at runtime.

### Variance: covariance, contravariance, invariance
**They ask:** "What is invariance, covariance and contravariance in the context of Python type annotations?"

These describe whether a generic type's subtyping relationship follows, reverses, or ignores its type parameter's subtyping. Covariant (`TypeVar("T", covariant=True)`) means if `Dog` is a subtype of `Animal`, `Container[Dog]` is a subtype of `Container[Animal]` — safe for read-only/producer types. Contravariant means the relationship reverses — safe for write-only/consumer types (a function accepting `Animal` can be used where one accepting `Dog` is expected). Invariant (the default) means no such relationship holds at all — `list[Dog]` is *not* a subtype of `list[Animal]`, because a mutable container could have an `Animal` (not a `Dog`) inserted into it through the "wider" reference, breaking the `Dog` guarantee elsewhere.

```python
from typing import TypeVar

T_co = TypeVar("T_co", covariant=True)      # read-only producers
T_contra = TypeVar("T_contra", contravariant=True)  # write-only consumers
```

**Say it:** "Mutable generic containers are invariant by default because allowing covariance would let you insert the wrong subtype through a widened reference — `list[Dog]` isn't a `list[Animal]` for exactly that reason; read-only producers can safely be covariant."
**Red flag:** Assuming `list[Dog]` should type-check as a `list[Animal]` "because Dog is an Animal" — that's the exact unsoundness invariance exists to prevent for mutable containers.

### Do type hints affect runtime, and assert_never
**They ask:** "Do annotations impose any restrictions on runtime? How to use assert_never in type checking?"

By default, no — type hints are erased at runtime in the sense that nothing checks them automatically; they're read by tools like mypy/pyright statically, and by libraries like Pydantic/FastAPI that explicitly choose to validate against them at runtime as a deliberate design choice, not a language guarantee. `typing.assert_never` is a static-analysis helper for exhaustiveness checking: placed in the `else` branch of a chain that's supposed to cover every case of a `Literal` or `Enum`, the type checker flags an error if a new case is added to the type but the branch that handles it wasn't — turning a missed case into a type-check-time failure instead of a silent runtime gap.

```python
from typing import Literal, assert_never

def handle(status: Literal["pending", "active", "closed"]) -> str:
    if status == "pending": return "waiting"
    if status == "active": return "go"
    if status == "closed": return "done"
    assert_never(status)   # type checker errors if a case is missing above
```

**Say it:** "Type hints don't enforce anything at runtime by default — that's a deliberate choice by libraries like Pydantic, not the language — and I use `assert_never` in exhaustive `Literal`/`Enum` branches so adding a new case without handling it fails at type-check time, not in production."
**Red flag:** Treating a passing mypy run as proof the code can't raise a `TypeError` at runtime — hints are unenforced unless something explicit (Pydantic, an `assert`, manual validation) checks them where untyped input enters the system.

### Static vs. dynamic typing
**They ask:** "What is the difference between static and dynamic typing?"

The distinction matters because it changes *when* a type error surfaces — before the program runs, or while it's running. In a statically typed language (Java, C++), the compiler checks types at compile time, before a single line executes. Python is dynamically typed: a variable is just a name bound to an object, and the object carries its own type — nothing checks that a function's argument is the "right" type until that line actually runs. That's why `def add(a, b): return a + b` happily accepts ints, strings, or lists at call time — the error, if any, shows up on the `+` at runtime, not before. Type hints (`a: int`) don't change this — they're optional, unenforced by the interpreter, and only checked by an external tool like mypy.

```python
def add(a, b):
    return a + b

add(1, 2)        # 3
add("a", "b")     # "ab" — no type error, Python doesn't care until it runs
```

**Say it:** "Python is dynamically typed — types live on the object, not the variable, and nothing is checked until the line actually executes, which is why type hints are a static-analysis aid, not a runtime guarantee."
**Red flag:** Saying Python "has no types" — it's strongly and dynamically typed: `"1" + 1` still raises a `TypeError`, it just raises it at runtime instead of compile time.

### Truthiness — what counts as falsy
**They ask:** "What does 'truthiness' mean in Python, and what values are falsy?"

Truthiness matters because Python lets you write `if some_list:` instead of `if len(some_list) > 0:`, and getting the falsy set wrong is a real source of bugs — especially `if x:` silently treating `0` or `""` the same as "missing." Every object has a truth value, used implicitly in `if`/`while`/`and`/`or`. Falsy: `None`, `False`, `0`, `0.0`, empty sequences and collections (`""`, `[]`, `()`, `{}`, `set()`), and any object whose `__bool__` returns `False` — or, if it defines no `__bool__`, whose `__len__` returns `0`. These two contracts aren't interchangeable: `__bool__` must return an actual `bool`, so a custom `__bool__` that returns `0` instead of `False` raises `TypeError`; `__len__` returning `0` is the one that's valid and makes the object falsy by proxy. Everything else is truthy, including nonempty strings like `"0"` and `"False"`.

```python
if []: print("truthy")      # skipped — empty list is falsy
if [0]: print("truthy")      # printed — nonempty list, even with a falsy element
if "0": print("truthy")      # printed — nonempty string is truthy regardless of content
```

**Say it:** "Falsy in Python is None, False, zero, and anything empty — an empty list, string, or dict — everything else, including the string `'0'`, is truthy, so I write `if not items:` instead of comparing length to zero."
**Red flag:** Using `if x == None:` or `if len(x) == 0:` out of habit from another language — idiomatic Python leans on truthiness (`if x is None:`, `if not x:`) instead.

### Slicing lists and strings
**They ask:** "How does slicing work in Python, and what does `list[::-1]` do?"

Slicing exists because indexing one element at a time is tedious — `seq[start:stop:step]` pulls a sub-sequence in one expression, and it works identically on any sequence type: `list`, `tuple`, `str`. `start` is inclusive, `stop` is exclusive, and any of the three can be omitted to mean "from the beginning," "to the end," or "step of 1." A negative `step` walks backward, which is why `seq[::-1]` reverses a sequence — no explicit loop needed. Slicing never raises `IndexError` for out-of-range bounds (unlike single-index access) — it just clips to what's available, which makes it forgiving but occasionally hides a bug where you expected an error.

```python
s = "hello world"
s[0:5]      # "hello"
s[6:]       # "world"
s[:5]       # "hello"
s[::-1]     # "dlrow olleh" — reversed
s[100:200]  # "" — out of range, no error, just empty
```

**Say it:** "Slicing takes `start:stop:step` on any sequence, `stop` is exclusive, and a negative step walks backward — which is why `[::-1]` is the idiomatic one-liner to reverse a list or string without writing a loop."
**Red flag:** Forgetting `stop` is exclusive and off-by-one on a slice boundary — `s[0:5]` is 5 characters (indices 0–4), not 6.

### f-strings
**They ask:** "What are f-strings and why use them over `.format()` or `%`-formatting?"

f-strings exist to make string interpolation read like the output it produces, instead of a template with separate arguments to keep in sync. Prefixing a string literal with `f` lets you embed any expression directly inside `{}`, evaluated at the point the string is built — including function calls, attribute access, and format specs (`{price:.2f}`). They're also often faster than `.format()` or `%`-formatting, since the interpolation is compiled in rather than resolved by parsing a separate format string at runtime.

```python
name, price = "widget", 9.5
f"{name}: ${price:.2f}"     # "widget: $9.50"
f"{2 + 2}"                   # "4" — any expression works
```

**Say it:** "f-strings put the expression right where it's used instead of a separate positional or keyword argument list, which is both more readable and often faster than `.format()` since the interpolation is compiled in rather than parsed at runtime."
**Red flag:** Still reaching for `%`-formatting or string concatenation with `+` in new code — f-strings have been the idiomatic choice since Python 3.6 and handle format specs and nested expressions more cleanly.

### The walrus operator
**They ask:** "What is the walrus operator `:=` and what is it for?"

The walrus operator exists to collapse "compute a value, then check it" into one expression, avoiding a wasted duplicate call. `:=` assigns to a name *and* evaluates to that value in the same expression — most commonly inside an `if` or `while` condition, or a comprehension, where you'd otherwise have to compute something twice (once to check it, once to use it) or split it across two lines.

```python
# without walrus: n gets computed twice, or split across two lines
if (n := len(data)) > 10:
    print(f"too long: {n} items")

# useful in comprehensions too — avoids calling expensive() twice
results = [y for x in data if (y := expensive(x)) is not None]
```

**Say it:** "The walrus operator assigns and returns a value in the same expression, so I use it to avoid computing something twice inside a condition or comprehension — most often `if (n := len(x)) > threshold:`."
**Red flag:** Overusing `:=` to cram assignments into places that hurt readability — it's for avoiding a genuine duplicate computation, not for shortening every two-line block into one.

### What type() returns
**They ask:** "What does the `type()` function return in Python, and how is it different from `isinstance()`?"

`type(obj)` returns the exact class object an instance was constructed from — useful for introspection, debugging, and the rare case where you need exact-type matching rather than "is this a kind of X." `isinstance(obj, cls)` is the one you want for almost everything else, because it also returns `True` for subclasses, respecting polymorphism — `isinstance(True, int)` is `True` since `bool` subclasses `int`, but `type(True) is int` is `False`. `type()` with three arguments is also how classes are created dynamically at runtime (`type(name, bases, dict)`), which is what a metaclass hooks into.

```python
type(5)                  # <class 'int'>
type(True) is int        # False — exact type, bool != int
isinstance(True, int)    # True — respects the subclass relationship
```

**Say it:** "`type()` gives the exact class and `isinstance()` respects subclassing — I default to `isinstance()` for type checks in application code, and reach for `type()` only when I genuinely need an exact match, not a 'kind of' match."
**Red flag:** Writing `if type(x) == list:` for a type check — it breaks polymorphism by rejecting valid subclasses that `isinstance(x, list)` would correctly accept.

### Rounding floats
**They ask:** "How do you round a float to a certain number of decimal places, and why can the result look surprising?"

`round(number, ndigits)` is the built-in for rounding, but the "surprising" part interviewers are fishing for is that floats are binary approximations of decimal numbers, so `round(2.675, 2)` gives `2.67`, not `2.68` — `2.675` isn't exactly representable in binary floating point, it's stored as something microscopically less than `2.675`. Python's `round()` also uses "round half to even" (banker's rounding) for tie-breaking, so `round(0.5)` is `0` and `round(1.5)` is `2` — not the "always round .5 up" behavior some languages default to. For money or anywhere exactness matters, `Decimal` avoids the binary-representation error, but only when it's constructed from a decimal string or an integer — `Decimal("2.675")`, not `Decimal(2.675)`, which first builds the imprecise float and inherits its rounding error before `Decimal` ever sees it. Even built correctly, `Decimal` doesn't skip rounding altogether — it rounds according to whatever rounding context (`ROUND_HALF_EVEN` by default, configurable) it's set to.

```python
round(3.14159, 2)   # 3.14
round(2.675, 2)      # 2.67 — not 2.68, due to float representation
round(0.5), round(1.5)   # (0, 2) — round-half-to-even
```

**Say it:** "`round()` handles the common case, but I know it uses round-half-to-even and that float imprecision can make a rounding result look 'off' by a cent — for money specifically I reach for `Decimal` instead of float."
**Red flag:** Being surprised in an interview that `round(2.675, 2) != 2.68` and not being able to explain why — it's binary floating-point representation, not a bug in `round()`.

### Useful str methods
**They ask:** "Give some examples of methods of the `str` class."

String methods matter because `str` is immutable — every one of these returns a *new* string rather than modifying in place, which trips people up if they expect `s.upper()` to change `s`. The high-frequency ones: `.split()`/`.join()` for converting between string and list, `.strip()` for trimming whitespace, `.replace()` for substitution, `.upper()`/`.lower()` for case, `.startswith()`/`.endswith()` for prefix/suffix checks, and `.find()`/`.index()` for locating a substring (the difference being `.find()` returns `-1` on no match, `.index()` raises `ValueError`).

```python
"a,b,c".split(",")        # ["a", "b", "c"]
"-".join(["a", "b", "c"])  # "a-b-c"
"  hi  ".strip()           # "hi"
"hello".replace("l", "L")  # "heLLo"
"hello".find("z")          # -1
"hello".index("z")         # raises ValueError
```

**Say it:** "str methods always return a new string since str is immutable, and the pair I reach for constantly is split/join for converting between a string and a list — `','.join(parts)` is the idiomatic reverse of `.split(',')`."
**Red flag:** Writing `s.strip()` and expecting `s` itself to change — every str method returns a new object; you have to reassign (`s = s.strip()`) to keep the result.

### Declaring empty collections
**They ask:** "How do you declare an empty list, dict, set, and tuple?"

The distinction that catches people is that `{}` is an empty **dict**, not an empty set — there's no empty-set literal, so `set()` is the only way to get one. Everything else has an obvious literal, though the function form works too and is sometimes preferred for readability.

```python
empty_list = []       # or list()
empty_dict = {}        # or dict() — NOT set()!
empty_set = set()      # {} is a dict, so this is the only way
empty_tuple = ()       # or tuple()
```

**Say it:** "`{}` is an empty dict, not an empty set — there's no set literal for empty, so `set()` is the only way to create one, which is a common gotcha coming from other languages."
**Red flag:** Writing `{}` expecting an empty set and being confused later when `type(x)` says `dict`.

### Removing items from a list or dict
**They ask:** "How do you remove an element from a list or a dictionary?"

Python gives you a few different removal tools depending on whether you know the index/key, the value, or just want the last item — picking the right one avoids an unnecessary linear scan. For a list: `del lst[i]` removes by index, `lst.remove(value)` removes the first matching value (raises `ValueError` if absent), and `lst.pop(i)` removes by index *and returns* the removed value (defaults to the last item). For a dict: `del d[key]` removes by key (raises `KeyError` if absent), and `d.pop(key, default)` removes and returns the value, with an optional default to avoid the exception.

```python
lst = [1, 2, 3]
lst.remove(2)      # [1, 3] — by value
del lst[0]          # [3] — by index
d = {"a": 1, "b": 2}
d.pop("a")           # 1, d is now {"b": 2}
d.pop("z", None)     # None — no KeyError, thanks to the default
```

**Say it:** "For a list I pick `remove()` when I have the value, `pop(i)`/`del` when I have the index; for a dict, `pop(key, default)` is my default because it avoids a `KeyError` for a missing key without an extra `if key in d` check."
**Red flag:** Calling `.remove(value)` on a list inside a `for` loop that's iterating that same list — mutating a list while iterating it skips elements; iterate over a copy (`list[:]`) or build a new list instead.

### Incrementing a variable in Python
**They ask:** "How do you increment or decrement an `int` variable in Python?"

Python has no `++`/`--` operators — that's a deliberate omission, not a missing feature, because `++x` would be ambiguous with unary `+` applied twice and adds a way to write off-by-one bugs. The idiomatic form is `x += 1` (shorthand for `x = x + 1`), which works because `+=` calls `__iadd__` if defined, falling back to `__add__` — for an immutable `int` it always rebinds `x` to a new object rather than mutating in place, since ints can't be mutated.

```python
x = 5
x += 1   # 6 — the idiomatic way
x -= 1   # 5
# x++ and ++x are both syntax errors in Python
```

**Say it:** "Python doesn't have `++`/`--` — that's intentional, it removes a class of pre/post-increment ambiguity bugs — the idiom is `x += 1`, which for an int rebinds the name since ints are immutable, it doesn't mutate in place."
**Red flag:** Writing `x++` in an interview out of muscle memory from C/Java/JS — it's a syntax error in Python.

### isinstance with multiple types
**They ask:** "How do you use `isinstance()` to check against multiple types?"

Passing a tuple of types as the second argument checks "is this an instance of *any* of these" in one call, which is both more readable and avoids the classic bug of chaining `or` with the wrong operand.

```python
isinstance(5, (int, float))         # True
isinstance("x", (int, float))        # False
isinstance(5, int) or isinstance(5, float)   # same result, more verbose
```

**Say it:** "`isinstance()` takes a tuple of types for an 'any of these' check — `isinstance(x, (int, float))` — which is cleaner and less error-prone than chaining multiple `isinstance` calls with `or`."
**Red flag:** Writing `isinstance(x, int) or float` — that doesn't do what it looks like; `or float` evaluates to the (always truthy) `float` class itself, so the condition is always `True`.

### strip, rstrip, and lstrip
**They ask:** "What is the difference between the `str.strip()`, `str.rstrip()`, and `str.lstrip()` methods?"

All three remove characters from the ends of a string, not the middle — the difference is direction. `.strip()` removes from both ends, `.lstrip()` only the left/start, `.rstrip()` only the right/end. By default all three strip whitespace, but each accepts an argument naming a set of characters to strip instead — not a substring to remove, but a *set* of characters, stripped as long as they keep matching from that end.

```python
"  hi  ".strip()       # "hi"
"  hi  ".lstrip()       # "hi  "
"  hi  ".rstrip()       # "  hi"
"xxhixx".strip("x")      # "hi" — strips the *characters* 'x', from both ends
```

**Say it:** "strip removes from both ends, lstrip only the left, rstrip only the right — and the optional argument is a set of characters to strip, not a substring, which is the part that trips people up."
**Red flag:** Expecting `"xyhixy".strip("xy")` to remove the substring `"xy"` — it strips any characters in `{'x','y'}` from each end until it hits one that isn't in the set, which can strip more (or less) than the literal substring.

### Bitwise operators on booleans
**They ask:** "How do the `|` and `&` operators work with `bool` values in Python?"

`|` and `&` are the bitwise OR/AND operators, but because `bool` is a subclass of `int` (`True == 1`, `False == 0`), they also work correctly as logical OR/AND on booleans — `True & False` is `False`, `True | False` is `True`. The reason they exist alongside `and`/`or` and matter in real code: `|` and `&` don't short-circuit (both sides always evaluate) and, unlike `and`/`or`, they're overridable via `__and__`/`__or__` — which is exactly why pandas/numpy boolean masking uses `&`/`|` instead of `and`/`or` (`and`/`or` can't be overloaded to work element-wise on an array).

```python
True & False    # False
True | False     # True
mask = (df["age"] > 18) & (df["active"] == True)   # pandas: must use &, not `and`
```

**Say it:** "`&`/`|` are bitwise operators that happen to work as logical AND/OR on bools because `bool` subclasses `int` — the practical reason to know them is they don't short-circuit and they're overloadable, which is why pandas/numpy masking requires `&`/`|` instead of `and`/`or`."
**Red flag:** Using `and`/`or` for element-wise boolean masking on a pandas Series or numpy array — it raises `ValueError: The truth value of an array is ambiguous`, because `and`/`or` can't be overloaded per-element the way `&`/`|` can.

### Type conversion between int, float, and str
**They ask:** "How do you convert between `int`, `float`, and `str` in Python?"

Python does almost no *implicit* type conversion between these — `"5" + 5` raises `TypeError` rather than silently coercing — so explicit conversion via the type's constructor is the normal path: `int()`, `float()`, `str()`. Each has failure modes worth knowing: `int("5.5")` raises `ValueError` (it won't parse a decimal string directly — go through `float` first, or truncate explicitly), and `int(5.9)` truncates toward zero rather than rounding (`int(5.9) == 5`, not `6`).

```python
int("42")        # 42
int("5.5")        # ValueError — go through float first
int(float("5.5"))  # 5 — truncates, doesn't round
str(42)            # "42"
float("3.14")       # 3.14
```

**Say it:** "Python doesn't implicitly coerce between str, int, and float — you convert explicitly with the constructor — and the gotcha to know is `int()` truncates rather than rounds, and won't parse a decimal string directly, so `int("5.5")` fails but `int(float("5.5"))` works."
**Red flag:** Expecting `int(5.9)` to round to `6` — it truncates toward zero, giving `5`; use `round()` if you actually want rounding.
