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

## Concurrency / Parallelism

### GIL

- What does the abbreviation GIL stand for? What is it? — [answer](concurrency.md#what-the-gil-is-and-why-cpython-has-one) {J2, J3, M2}
- Is the GIL a limitation of the Python language in general, or a specific interpreter (CPython)? — [answer](concurrency.md#is-the-gil-a-language-limitation-or-a-cpython-detail) {J2, J3, M2}
- Does the GIL have its power at the level of threads? At the process level? — [answer](concurrency.md#gil-scope-threads-vs-processes) {M1, M3, S1}
- Can the GIL slow down the execution of a program? — [answer](concurrency.md#when-the-gil-costs-you-and-when-it-doesnt) {M1, M3, S1}
- Is it possible to temporarily disable the GIL? — [answer](concurrency.md#disabling-the-gil) {M1, M3, S1}
- Pros and cons of GIL — [answer](concurrency.md#pros-and-cons-of-the-gil) {S2}
- Is the GIL applied at the asyncio level? Is it possible to have a deadlock situation if GIL is present? — [answer](concurrency.md#gil-deadlocks-and-asyncio) {S2}

### asyncio, threading, multiprocessing

- How does asyncio achieve concurrency without threads? What is a coroutine and what does await actually do? — [answer](concurrency.md#asyncio-the-event-loop-and-coroutines) {S1, S2}
- How do you decide between threading, multiprocessing, and asyncio for a concurrency problem? — [answer](concurrency.md#choosing-threading-multiprocessing-or-asyncio) {S1, S2}
- Given the GIL, can you still get race conditions with threading in Python? How do you fix them? — [answer](concurrency.md#race-conditions-and-locking-with-threads) {S1, S2}

## Web Frameworks

### Web Frameworks Common

- What interface does the WSGI standard describe? ASGI? How are the web server, wsgi server and web framework related? — [answer](frameworks.md#wsgi-vs-asgi-and-what-the-sgi-server-actually-does) {M1, M2, S2}
- What are the main tasks of the web framework? What is routing in the context of a web framework? — [answer](frameworks.md#routing-and-the-web-frameworks-core-job) {J1, J2, J3}
- What is MVC? For Django - compare with MTV — [answer](frameworks.md#mvc-vs-djangos-mtv) {M1, M2}
- What is Middleware? — [answer](frameworks.md#middleware) {M1, M2}
- What is CSRF protection and how is it implemented in web frameworks? — [answer](frameworks.md#csrf-protection) {M1, M2}

### Django / DRF

- What is a template? What is a model? How are urls.py and views.py files different in Django? What is manage.py for? — [answer](frameworks.md#django-models-views-templates-and-managepy) {J1, J2, J3}
- What is DRF? What is a Serializer? — [answer](frameworks.md#drf-serializers) {J2, J3, M1, M2, M3, S1}
- What is the signature of Signal? What are Django Channels? Why is the dispatch method needed on a View in Django? — [answer](frameworks.md#django-signals) {M1, M2, M3, S1}
- What is a QuerySet in Django ORM? When does the sending and execution of a query to the database occur? — [answer](frameworks.md#django-orm-queryset-laziness) {J1, J2, J3, M1, M2, M3, S1}
- What are select_related and prefetch_related in Django ORM? How does select_related behave when called with an empty list of arguments? — [answer](frameworks.md#select_related-and-prefetch_related) {M1, M2, M3, S1}
- How do you work with transactions in Django ORM? How do you use F() expressions and what advantages does it provide? — [answer](frameworks.md#django-orm-transactions-and-f-expressions) {S2}

### Flask

- What are routes in Flask and how are they defined? What are request context variables? What is a "view function"? — [answer](frameworks.md#flask-routes-view-functions-and-request-context) {J2, J3}
- What is Flask Blueprint and what is it used for? How do you manage sessions, handle forms with Flask-WTF, and set up caching with Flask-Caching? — [answer](frameworks.md#flask-blueprints-and-extensions) {M1, M2, M3, S1}

### FastAPI

- What are the advantages of FastAPI over other web development frameworks? What is Pydantic and how is it used in FastAPI? — [answer](frameworks.md#why-fastapi-and-pydantics-role) {J2, J3}
- What is dependency injection in FastAPI and how to use it? — [answer](frameworks.md#fastapi-dependency-injection) {M1, M2, M3, S1, S2}
- What are Background Tasks in FastAPI? What is Lifespan Events in Fastapi? — [answer](frameworks.md#fastapi-background-tasks-and-lifespan-events) {S2}

### SQLAlchemy

- What is a session in SQLAlchemy? What is an "SQLAlchemy engine"? Into what two main modules is the SQLAlchemy library divided? — [answer](frameworks.md#sqlalchemy-engine-session-and-core-vs-orm) {J2, J3}
- What does the lazy parameter in Relationship do in SQLAlchemy? What are the relationship loading techniques and how do you implement "eager loading"? — [answer](frameworks.md#sqlalchemy-relationship-loading-and-n1) {M1, M2, M3, S1, S2}
- How to use SQLAlchemy in asynchronous mode? What drivers are used for synchronous and asynchronous operation? — [answer](frameworks.md#sqlalchemy-async-mode) {M1, M2, M3, S1}
- How do you implement "upsert" (update or insert) in SQLAlchemy? How do you work with transactions in SQLAlchemy? — [answer](frameworks.md#sqlalchemy-upsert-and-transactions) {M1, M2, M3, S1, S2}

## Database

### Relational

- What is SELECT ... JOIN? What types of JOIN exist? — [answer](databases.md#join-types-and-when-each-one-is-correct) {J2, J3, M1, M2}
- What is SELECT ... GROUP BY? What is the purpose of using the COUNT() function in SQL? — [answer](databases.md#group-by-having-and-the-aggregation-order-of-operations) {J2, J3, M1, M2}
- What is normalization? First 3 NF (normal form) — [answer](databases.md#normalization-and-normal-forms) {M3, S1, S2}
- Why is the EXPLAIN command needed? How is it different from the EXPLAIN ANALYZE command? — [answer](databases.md#explain-vs-explain-analyze) {M3, S1, S2}
- What is a view in a database? What are materialized views and how do they differ from regular views? — [answer](databases.md#views-vs-materialized-views) {M3, S1, S2}
- What do "ON DELETE CASCADE" and "ON DELETE SET NULL" mean? In which situations should they be used? — [answer](databases.md#on-delete-cascade-vs-on-delete-set-null) {M3, S1, S2}
- What is jsonb in PostgreSQL? How can you search jsonb fields in PostgreSQL? — [answer](databases.md#jsonb-in-postgresql) {J2, J3, M1, M2, M3, S1, S2}

### Indexes

- What is data indexing? Pros and cons of data indexing — [answer](databases.md#what-indexing-is-and-its-trade-offs) {J3, M1, M2, M3}
- How are indexes implemented internally? What is the default index type when creating (in PostgreSQL)? — [answer](databases.md#how-b-tree-indexes-actually-work) {S1, S2}
- What is compound index? What is the difference between a compound index for two columns and two single indexes? — [answer](databases.md#compound-indexes-vs-single-column-indexes) {S1, S2}
- If indexes are such a powerful tool, why not create indexes for all columns in a table? In what cases is it irrelevant to use indexes? — [answer](databases.md#when-indexing-is-the-wrong-call) {S1, S2}
- What is a Hash Index? What is a UNIQUE index? What is a functional index and what can it be useful for? — [answer](databases.md#hash-indexes-unique-indexes-and-functional-indexes) {S1, S2}

### Transactions. Isolation Levels. Record Locking. ACID

- What is a database transaction? What features should a transaction have according to the ACID acronym? — [answer](databases.md#acid) {J3, M1, M2, M3}
- What are the levels of transactions? What phenomena can arise when using different transaction levels? — [answer](databases.md#isolation-levels-and-the-phenomena-they-trade-off) {S1, S2}
- What is table locking? What is row-level locking? What is a deadlock? What strategies are in place to prevent deadlocks? — [answer](databases.md#row-level-and-table-level-locking-and-deadlocks) {S1, S2}

### Replication / Sharding

- What is replication? What is partitioning? What is sharding? How do horizontal scaling and vertical scaling differ? — [answer](databases.md#replication-vs-partitioning-vs-sharding) {J3, M1, M2, M3}
- What is Master-Slave Replication? What is Multi-Master replication and what are its features? What is a failover? — [answer](databases.md#master-slave-vs-multi-master-replication-and-failover) {S1, S2}
- What requirements can be applied to the key by which partitioning takes place? What are the main problems with sharding? — [answer](databases.md#sharding-key-requirements-and-problems) {S1, S2}

### Caching

- What is caching? Why is caching necessary? Is it possible to organize caching without an additional system, such as Redis or memcached? — [answer](databases.md#caching-and-cache-invalidation) {J3, M1, M2, M3}
- What is cold cache and warm cache? Is there caching at the HTTP protocol level? — [answer](databases.md#cold-vs-warm-cache-and-http-level-caching) {S1, S2}

## NoSQL

### NoSQL Common

- What is NoSQL? What does the acronym BASE mean? — [answer](nosql.md#nosql-vs-sql-and-base-vs-acid) {J2, J3, M1, M2, M3, S1, S2}

### Redis

- What is Redis and for what purposes is it commonly used? What are the main data types supported by Redis? How to use Redis as a cache? — [answer](nosql.md#redis-data-types-and-using-it-as-a-cache) {J2, J3, M1, M2}
- How does Redis ensure data persistence? How to configure key fading in Redis? — [answer](nosql.md#redis-persistence-and-key-expiry) {M3, S1}
- What is publish and subscribe in Redis? — [answer](nosql.md#redis-pubsub) {M3, S1}
- How does Redis ensure the atomicity of operations? What are transactions in Redis? What are LUA scripts in the context of Redis? — [answer](nosql.md#redis-atomicity-transactions-and-lua-scripts) {M3, S1, S2}

### Mongodb

- What is a collection in MongoDB? What is a document in MongoDB? What is BSON in MongoDB? — [answer](nosql.md#mongodb-documents-collections-and-bson) {J2, J3, M1}
- How to use $inc, $set, $unset statements in MongoDB? What is the parameter for upsert in db.collection.update? — [answer](nosql.md#mongodb-update-operators-and-upsert) {M2, M3, S1, S2}

### DynamoDB

- What are tables, items, and attributes in the context of DynamoDB? How to use keys in DynamoDB (primary key, composite key)? — [answer](nosql.md#dynamodb-keys-partition-key-and-sort-key) {J2, J3, M1, M2, M3}
- What are read and write capacity units in DynamoDB? How do different capacity settings (provisioned vs. on-demand) affect performance and cost? — [answer](nosql.md#dynamodb-capacity-rcuwcu-and-provisioned-vs-on-demand) {M1, M2, M3, S1, S2}
- What are the differences between Query and Scan operations in DynamoDB? — [answer](nosql.md#dynamodb-query-vs-scan) {M1, M2, M3}
- How to use Stream and Lambda for event handling in DynamoDB? How to use DynamoDB Accelerator (DAX)? How to manage Time To Live (TTL) for items? — [answer](nosql.md#dynamodb-streams-dax-and-ttl) {S1, S2}

## Message Brokers

### Common Message Brokers

- What is Message Broker? What is Publisher? What is Consumer? What is a Topic? Pros and cons of using Message Brokers versus HTTP protocol — [answer](brokers.md#message-brokers-vs-calling-http-directly) {J2, J3, M1, M2}
- What is Message Queue? What is the Pub-Sub mechanism? Comparison of Push- and Pull-based approaches in MQ — [answer](brokers.md#message-queues-and-the-pub-sub-pattern) {J2, J3, M1, M2, M3, S1, S2}

### Kafka

- What are Producer and Consumer in the context of Kafka? What is Topic in Kafka? What is Partition in Kafka? — [answer](brokers.md#kafka-fundamentals-topics-partitions-producers-consumers) {J2, J3, M1}
- What is a Consumer Group in the context of Kafka? What is offset in Kafka and how is it used? — [answer](brokers.md#kafka-consumer-groups-and-offsets) {J2, J3, M1, M2, M3, S1, S2}
- What mechanisms provide high availability and reliability in Kafka? How does Kafka handle failures and recovery from them? — [answer](brokers.md#kafka-high-availability-and-failure-recovery) {M2, M3, S1, S2}

### Rabbitmq

- What is Exchange in RabbitMQ? What is a Queue in RabbitMQ? What is Topic in RabbitMQ and how are binding keys specified? — [answer](brokers.md#rabbitmq-exchanges-and-queues) {J2, J3, M1}
- What is Lazy Queue in RabbitMQ? What is Dead Letter Exchange (DLX) and Dead Letter Queue (DLQ)? What is Prefetch Count and what is it used for? — [answer](brokers.md#rabbitmq-dead-letter-queues-and-prefetch) {M2, M3, S1}
- What does Broker Durability mean? What error handling strategies are commonly used with Message Brokers? — [answer](brokers.md#broker-durability-and-error-handling) {M3, S1, S2}

## Software Engineering Practices

### Architecture knowledge

- OOP Principles (3+1). What is SOLID? (general definition). SOLID: Understanding S, O, I principles. Understanding each of the principles. — [answer](engineering.md#solid-all-five-principles) {J1, J2, J3, M1, M2, M3, S1, S2}
- When does it make sense to deviate from the SOLID principles? — [answer](engineering.md#when-its-right-to-deviate-from-solid) {S2}
- DRY principle. KISS principle. YAGNI principle. Exceptions to the DRY principle. — [answer](engineering.md#dry-kiss-yagni-and-drys-real-exceptions) {J1, J2, J3, M1, M2, M3, S1}
- What is microservice architecture? Comparison of microservice and monolithic architecture, pros and cons of each — [answer](engineering.md#microservices-vs-monolith) {M1, M2, M3, S1, S2}
- What is hexagonal architecture or port adapter? — [answer](engineering.md#hexagonal-architecture-and-portsadapters) {S2}
- Can you explain the principle of CQRS and what are its advantages and disadvantages? — [answer](engineering.md#cqrs) {S2}
- What is Event Sourcing? Event bus — [answer](engineering.md#event-sourcing-vs-event-bus) {M1, M2, M3, S1}

### Testing

- Why is software testing necessary? What does the assert keyword mean in Python? What is the principle of Arrange-Act-Assert? — [answer](engineering.md#testing-fundamentals-assert-aaa-and-why-test) {J2, J3, M1}
- What is mock? What are unittest.mock.patch and unittest.mock.patch.object used for? — [answer](engineering.md#mocking-mock-patch-and-patchobject) {J2, J3, M2, M3}
- What is fixture? How to create a fixture that will be initialized once for all tests, and how to run code before/after each test? — [answer](engineering.md#fixtures-and-fixture-scope) {J2, J3, S1, S2}
- How can you parameterize tests? — [answer](engineering.md#parametrized-tests) {M2, M3}
- TDD: understanding the steps it consists of — [answer](engineering.md#tdds-steps) {M2, M3}
- What is unit testing? What is integration testing? What is end-to-end testing? How do they differ? — [answer](engineering.md#unit-integration-and-end-to-end-testing) {J2, J3, M1, M2, M3}
- How can I write tests for a module that interacts with the database? What is mutation testing? — [answer](engineering.md#testing-code-that-touches-the-database-and-mutation-testing) {S1, S2}
- Differences between unittest and pytest? What is a plugin in pytest? — [answer](engineering.md#pytest-vs-unittest) {M2, M3, S1, S2}
