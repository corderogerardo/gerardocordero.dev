# Flashcards — Python (Andersen matrix)

Every matrix row as an interviewer question. Filter by level and category in the deck.

## Python Core

### Python Core

- What is a decorator? Why do you need a decorator if you can consistently describe the logic in a function without using a decorator? — [answer](python-core.md#why-a-decorator-instead-of-calling-a-wrapper-function)
- What are Python's built-in decorators like @staticmethod, @classmethod and @property? — [answer](python-core.md#built-in-decorators-staticmethod-classmethod-property)
- What is functools.wraps? What is the return type of the decorator function? — [answer](python-core.md#functoolswraps)
- How to implement a decorator to cache function results? — [answer](python-core.md#caching-a-functions-results-with-a-decorator)
- How to write a parameterizable decorator? — [answer](python-core.md#parameterized-decorators)
- Can a class act as a decorator? How to decorate a class method? — [answer](python-core.md#decorating-a-class-or-a-method)
- Is it possible to write an asynchronous decorator? — [answer](python-core.md#async-decorators)
- What is a generator? What is yield? Why do you need a generator? — [answer](python-core.md#generators-and-yield)
- What is StopIteration? Why are the magic methods __iter__ and __next__ necessary? — [answer](python-core.md#the-iterator-protocol-and-stopiteration)
- How to implement a generator using a class? — [answer](python-core.md#building-a-generator-with-a-class)
- Why does the send method exist in the generator? Why does a generator have a throw method? What is GeneratorExit? — [answer](python-core.md#send-throw-and-close-on-a-generator)
- How to implement an asynchronous generator using a class? — [answer](python-core.md#async-generators)
- What is a context manager? Why is it needed? Give an example. — [answer](python-core.md#context-managers-why-__enter__-and-__exit__-exist)
- If an exception occurs during the execution of the context manager, will the code that should be executed when the context manager exits be executed? What additional parameters are passed to __exit__? How to suppress an exception if it occurs? — [answer](python-core.md#exceptions-inside-a-context-managers-block)
- Examples of context managers from contextlib. — [answer](python-core.md#contextlib-helpers)
- What keywords are used to call the asynchronous context manager? How to implement an asynchronous context manager using a class? — [answer](python-core.md#async-context-managers)
- What are magic (double underscore, dunder) methods? What is a Python Data Model? — [answer](python-core.md#what-dunder-methods-are-and-why-python-leans-on-them)
- Why is the __len__ magic method necessary? How does the __call__ magic method work and what is it used for? — [answer](python-core.md#__len__-and-__call__)
- The difference between the __str__ and __repr__ magic methods. — [answer](python-core.md#__str__-vs-__repr__)
- Which magic method must be declared to overload the operator==? Magic methods for comparing objects (__eq__, __ne__, __lt__, __le__, __gt__, __ge__) and how are they related to the comparison protocol? — [answer](python-core.md#the-comparison-protocol)
- Why are the magic methods __iter__ and __next__ necessary? — [answer](python-core.md#__iter__-and-__next__-on-your-own-class)
- Why is the __contains__ magic method necessary? — [answer](python-core.md#__contains__-and-membership-testing)
- How are the magic methods __getattribute__ and __getitem__ different? — [answer](python-core.md#__getattr__-__getattribute__-and-__getitem__)
- Why is the __new__ magic method necessary? — [answer](python-core.md#__new__-vs-__init__)
- Why is the __init_subclass__ magic method needed? How to use __set_name__ magic method in descriptors? — [answer](python-core.md#__init_subclass__-and-__set_name__)
- What is property? What other descriptor exists besides getter and setter? — [answer](python-core.md#descriptors--what-property-is-built-on)
- What is Garbage Collector? What is the keyword for instantly marking an object for deletion? — [answer](python-core.md#garbage-collection-and-reference-counting)
- What is Memory Leak? What are the ways to determine the memory leak? — [answer](python-core.md#detecting-and-avoiding-memory-leaks-in-python)
- Does Python have multiple inheritance? What is MRO? What class do all other classes in Python inherit from? — [answer](python-core.md#multiple-inheritance-and-mro)
- What is Mixin? Description of the diamond problem. How does super() behave with multiple inheritance? — [answer](python-core.md#mixins-and-the-diamond-problem)

## Python Types

### Python Types

- What are the main sets that types are divided into in Python? Which of the proposed collections falls under mutable, which under immutable? — [answer](python-types.md#pythons-type-system-at-a-glance)
- What is None? What's the difference between x == 'string' and x is 'string'? Which is correct? — [answer](python-types.md#none-is-vs--and-interning)
- Is float a class that inherits from int? Is bool a class that inherits from int? How does the unary ~ operator work on int and bool? — [answer](python-types.md#int-bool-and-float-relationships)
- How are Exception and BaseException different? The try/except/else/finally construct — which parts are required? How to declare your own Exception? — [answer](python-types.md#exceptions-hierarchy-and-tryexceptelsefinally)
- What is ExceptionGroup for (Python 3.11)? How to call a caught Exception, obliterating its previous traceback? — [answer](python-types.md#exceptiongroup-and-chained-exceptions)
- What is the difference between bytes and bytearray types? How to convert str to bytes and bytes back to str? When to use bytearray instead of regular bytes? — [answer](python-types.md#bytes-vs-bytearray-and-encoding)
- Give examples of data structures in Python. Why is the dict data structure necessary? Name the main methods for working with list and dict. — [answer](python-types.md#collections-overview-list-dict-set-tuple)
- What keys will be in the dict as a result of {1: 'a', True: 'b', 1.0: 'c'}? Does the insertion order store the dict data structure? Is it possible to make any object the key of a dict? — [answer](python-types.md#dict-internals-hashing-equal-keys-and-insertion-order)
- What methods exist in the set data structure to perform operations between two sets? What is a frozenset and how is it different from a regular set? — [answer](python-types.md#set-operations-and-frozenset)
- What is comprehension? What data structures can be created through comprehension? How do you write a comprehension with two or more nesting levels? Are there asynchronous comprehensions? — [answer](python-types.md#comprehensions)
- What is the difference between shallow copy and deep copy in the context of collections in Python? — [answer](python-types.md#shallow-copy-vs-deep-copy)
- What is tuple unpacking? Can a tuple be a key in a dict? Are there any exceptions to this rule? — [answer](python-types.md#tuple-unpacking-and-tuples-as-dict-keys)
- Why is the Decimal type needed if there is a float type? What will decimal.Decimal(0.3) != decimal.Decimal('0.3') return and why? — [answer](python-types.md#decimal-vs-float)
- What is Enum? Why are Enums good? Which operator should be used to compare with Enum elements — == or is? — [answer](python-types.md#enum--why-and-comparisons)
- What is data class? Does the sequence of default values matter in a dataclass? Why? Why is __post_init__ needed in dataclass? — [answer](python-types.md#dataclass--what-it-gives-you)
- What is type annotation (type hinting)? What is typing.Optional? What is typing.Union, and how can you annotate without it in newer Python? — [answer](python-types.md#typing-basics-annotations-optional-union)
- What is typing.Callable? What's the difference between typing and collections.abc for typing purposes? Why is typing.Protocol needed? What is typing.Generic and typing.TypeVar? — [answer](python-types.md#typing-deep-cuts-callable-protocol-typevar-generic)
- What is typing.Literal? How to use typing.NewType and how does it differ from other types? What is typing.overload? What is typing.final? — [answer](python-types.md#typingliteral-newtype-overload-and-final)
- What is invariance, covariance and contravariance in the context of Python type annotations? — [answer](python-types.md#variance-covariance-contravariance-invariance)
- Do annotations impose any restrictions on runtime? How to use assert_never in type checking? — [answer](python-types.md#do-type-hints-affect-runtime-and-assert_never)
