# Technologies (DI, Networking, Room, Images)

### Dependency Injection — Why and How
**They ask:** "What is Dependency Injection? How do you implement it, and why is it needed?"

DI's job is to stop a class from constructing its own collaborators, because a class that builds its own dependencies (`val api = Retrofit.Builder()...build()` inside a Repository) can't be tested without the real network stack, and can't be swapped for a fake or a different implementation without editing that class's source. Instead, dependencies are handed in from outside — via constructor, field, or method — so the class only declares what it needs and never how to build it.

```kotlin
class UserRepository(private val api: UserApi, private val dao: UserDao)  // constructor injection
```

You can do this by hand ("manual DI" — a factory or a container object wiring everything at app start), which is fine for small apps, or with a framework (Dagger2, Hilt, Koin) that generates or resolves the wiring for you as the graph grows past what's comfortable to wire by hand.

**Say it:** "DI's actual payoff isn't 'less boilerplate,' it's testability — a class that receives its dependencies instead of building them can be tested with fakes and swapped without touching its source; a framework just automates the wiring once that graph gets big."
**Red flag:** Calling DI "just for testing." It's also what makes swapping implementations (a fake repository for a demo build, a different image loader) a one-line change at the composition root instead of a hunt through the codebase.

### Dagger2 — Modules, Components, and @Provides
**They ask:** "What is the purpose of the `@Provides` annotation? What is a module and a component, and what can't be injected without a module?"

A **Component** is Dagger's interface to the generated dependency graph — the thing you call `.inject(this)` on, or that produces an object. A **Module** is where you tell Dagger *how* to build a type it can't construct itself — anything without an `@Inject` constructor: an interface, a third-party class you don't own (`Retrofit`, `OkHttpClient`), or a type that needs configuration logic beyond just calling its constructor.

```kotlin
@Module
class NetworkModule {
    @Provides
    fun provideOkHttp(): OkHttpClient = OkHttpClient.Builder().build()
}

@Component(modules = [NetworkModule::class])
interface AppComponent { fun inject(activity: MainActivity) }
```

Dagger can inject any class with an `@Inject`-annotated constructor automatically — no module needed. What genuinely *can't* be injected without a module: interfaces (Dagger can't instantiate an abstraction), and classes from libraries you don't control, since you can't add `@Inject` to their constructor.

**Say it:** "A Component is the compiled entry point to the graph, a Module is where I teach Dagger to build anything it can't construct on its own — an interface or a third-party class — which is exactly the category that can't be injected without one."
**Red flag:** Writing a `@Module` with a `@Provides` method for a class that already has an `@Inject` constructor. That's redundant — Dagger already knows how to build it; modules exist for the cases it can't.

### Dagger2 — Scopes and Qualifiers
**They ask:** "What is Scope? What is the default if none is defined? What is Qualifier for? What's the difference between Subcomponent and Component dependencies?"

A **Scope** annotation (`@Singleton`, or a custom `@ActivityScope`) ties an instance's lifetime to its Component's lifetime — one instance is created and reused for the life of that Component, instead of a fresh one on every injection. With *no* scope annotation, Dagger creates a brand-new instance on every single injection point — unscoped is the default, and it's easy to assume "singleton" when it isn't.

A **Qualifier** (`@Named` or a custom annotation) disambiguates when two bindings exist for the *same type* — Dagger can't tell two `OkHttpClient` instances apart by type alone if you need one configured for auth and one plain, so a qualifier annotation is the tiebreaker.

```kotlin
@Qualifier annotation class AuthClient

@Provides @AuthClient
fun provideAuthClient(): OkHttpClient = OkHttpClient.Builder().addInterceptor(authInterceptor).build()
```

**Subcomponent** shares its parent Component's entire graph and adds scoped bindings on top (a login flow's `@LoginScope` subcomponent can see everything `@Singleton` provides, plus its own). **Component dependencies** is a stricter alternative: the dependent Component only sees what the parent *explicitly exposes* through its interface — it doesn't inherit the whole graph, which is more decoupled but requires manually re-exposing anything the child needs.

**Say it:** "No scope annotation means a fresh instance on every injection — that's the default people get wrong — Qualifier disambiguates same-typed bindings, and Subcomponent inherits the whole parent graph while Component dependencies only sees what's explicitly exposed, which is the more decoupled but more manual option."
**Red flag:** Assuming an unscoped `@Provides` binding behaves like a singleton because it's declared once in a module. Without a scope annotation, Dagger constructs it fresh at every injection site, module declaration notwithstanding.

### Koin — Modules, single vs factory
**They ask:** "What is a Koin module? What's the difference between `single` and `factory`? What happens if Koin can't find a dependency?"

Koin trades Dagger's compile-time-generated graph for a runtime service locator — a `module { }` block declares bindings with plain Kotlin DSL instead of annotation processing, which is why Koin has effectively zero build-time codegen cost but resolves dependencies at runtime instead of compile time.

```kotlin
val appModule = module {
    single<UserRepository> { UserRepositoryImpl(get(), get()) }   // one instance, reused
    factory { UserDetailViewModel(get()) }                          // new instance every get()
}
```

`single` creates one instance and reuses it for the container's lifetime — the Koin equivalent of a Dagger `@Singleton` scope. `factory` creates a fresh instance on every resolution — for state that must never be shared, like most ViewModels. Because resolution happens at runtime, a missing binding isn't a compile error like a missing Dagger provider — it's a runtime `NoBeanDefFoundException` thrown when `get()` is actually called, which is the core trade-off against Dagger's compile-time safety.

**Say it:** "`single` reuses one instance, `factory` creates a new one per resolution — and because Koin resolves at runtime with no codegen, a missing binding is a runtime crash on `get()`, not a compile error, which is the real trade-off against Dagger's compile-time graph."
**Red flag:** Recommending Koin as strictly "simpler than Dagger" without mentioning the runtime-vs-compile-time safety trade-off. That's the actual engineering decision, not a matter of taste.

### Dagger2 vs Hilt, and Assisted Injection
**They ask:** "What's the difference between Dagger2 and Hilt? What are `@AssistedInject`/`@AssistedFactory` for?"

Hilt is built on top of Dagger — it doesn't replace Dagger's underlying graph, it standardizes the Android-specific wiring that every Dagger-on-Android project used to hand-roll: predefined Components scoped to Android classes (`ApplicationComponent`, `ActivityComponent`, `ViewModelComponent`), automatic component lifecycle tied to Android lifecycle, and `@AndroidEntryPoint`/`@HiltViewModel` to skip writing `Component.Builder` boilerplate per app. The cost is less flexibility over the Component hierarchy — Hilt's predefined components cover the common cases, and stepping outside them is more friction than plain Dagger.

`@AssistedInject`/`@AssistedFactory` solve a specific gap: a class that needs *both* Dagger-provided dependencies *and* a runtime value only known at the call site (a `postId` passed to a detail ViewModel) — plain constructor injection can't mix "resolved from the graph" and "passed by the caller" in one constructor without this.

```kotlin
class DetailViewModel @AssistedInject constructor(
    private val repo: PostRepository,      // from the graph
    @Assisted private val postId: String,  // from the caller
) : ViewModel() {
    @AssistedFactory interface Factory { fun create(postId: String): DetailViewModel }
}
```

**Say it:** "Hilt is Dagger with the Android-specific component boilerplate standardized — predefined, lifecycle-tied components instead of hand-rolled ones — and `@AssistedInject` is for the case Hilt/Dagger alone can't handle: mixing graph-resolved dependencies with a runtime-only value in the same constructor."
**Red flag:** Treating Hilt and Dagger as unrelated alternatives to pick between. Hilt is Dagger underneath — the real decision is "hand-roll the Android wiring" vs. "let Hilt standardize it," not "Dagger vs. some other DI engine."

### Retrofit Basics — Building GET/POST Requests
**They ask:** "How do you create and send GET and POST requests via Retrofit?"

Retrofit's whole model is turning an HTTP API into a typed Kotlin interface — you declare the shape of the call, and Retrofit generates the implementation that actually performs it over OkHttp, so call sites never touch raw request-building or JSON parsing directly.

```kotlin
interface UserApi {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") id: String): User

    @POST("users")
    suspend fun createUser(@Body user: NewUser): User
}

val api = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .addConverterFactory(GsonConverterFactory.create())
    .build()
    .create(UserApi::class.java)
```

`@GET`/`@POST` (plus `@PUT`, `@DELETE`, …) map to HTTP verbs; `@Path` substitutes into the URL template, `@Query` appends query params, `@Body` serializes the argument as the request body via whatever converter factory is registered (Gson, Moshi, kotlinx.serialization). Marking the interface method `suspend` is what lets Retrofit return the result directly instead of requiring a `Call<T>` + callback.

**Say it:** "Retrofit turns an HTTP API into a typed interface — the annotations describe the request shape, the converter factory handles serialization, and `suspend` is what gets me a direct return value instead of a `Call` and a callback."
**Red flag:** Still writing `Call<T>` + `enqueue { onResponse/onFailure }` in new code instead of a `suspend` function. That's the pre-coroutines pattern — it works, but it's not what a current codebase should look like.

### OkHttp Interceptors — Application vs Network
**They ask:** "What is an interceptor? What's the difference between Application interceptors and Network interceptors?"

An interceptor is a hook into OkHttp's request/response pipeline that can inspect, modify, retry, or short-circuit a call — the standard place for cross-cutting concerns like auth headers, logging, or caching, instead of repeating that logic at every call site.

```kotlin
val authInterceptor = Interceptor { chain ->
    val request = chain.request().newBuilder()
        .addHeader("Authorization", "Bearer ${tokenStore.token}")
        .build()
    chain.proceed(request)
}
val client = OkHttpClient.Builder().addInterceptor(authInterceptor).build()
```

The distinction that matters: `addInterceptor` (Application interceptor) runs once per call, sees the request/response exactly as your app sent/received it, and won't see redirects or retries OkHttp performs internally — the right place for auth headers or app-level logging. `addNetworkInterceptor` runs closer to the wire, sees each individual network call including redirects and retries, has access to the actual connection, and can observe things like cache headers that a proxy/CDN would see — the right place for low-level diagnostics or caching logic that needs to see what's actually on the wire.

**Say it:** "Application interceptors see one call as your app made it — right place for auth headers; network interceptors see every individual network round-trip including redirects and retries — right place for wire-level concerns like caching. Picking the wrong one is a subtle, hard-to-find bug when redirects are involved."
**Red flag:** Adding auth headers via a network interceptor. If OkHttp retries or redirects internally, the header logic runs multiple times per logical call in ways that are harder to reason about — application interceptors are the correct layer for that concern.

### Retrofit — Custom Headers and Multipart Uploads
**They ask:** "How do you add a header in Retrofit, and how do you add a file to a POST body?"

A header can be static per-endpoint via `@Header`/`@Headers` on the method, or dynamic (computed per-request, like an auth token) via an interceptor — the interceptor approach is preferred for anything that applies to *every* call, since annotating every method individually doesn't scale and is easy to forget on a new endpoint.

```kotlin
interface ApiService {
    @Headers("Cache-Control: no-cache")
    @GET("feed")
    suspend fun getFeed(): Feed

    @Multipart
    @POST("upload")
    suspend fun uploadFile(@Part file: MultipartBody.Part, @Part("caption") caption: RequestBody): UploadResult
}

val part = MultipartBody.Part.createFormData("file", file.name, file.asRequestBody("image/*".toMediaType()))
```

File upload needs `@Multipart` on the method and `@Part` on the file parameter, wrapping the file in a `MultipartBody.Part` with the correct media type — a plain `@Body` won't produce multipart form data, which is what most file-upload endpoints actually expect.

**Say it:** "Per-endpoint static headers use `@Header`/`@Headers`; anything applying to every call belongs in an interceptor instead of repeated annotations — and file upload needs `@Multipart` plus a `MultipartBody.Part` with the right media type, not a plain `@Body`."
**Red flag:** Trying to upload a file via `@Body` with a raw `File` or byte array. Without `@Multipart` and the correct `Part` wrapping, most backends won't parse it as the form-data upload they're expecting.

### Network Security and Data Formats — SSL Pinning, Protobuf, REST vs SOAP
**They ask:** "What is SSL pinning and how do you add a certificate? What is protobuf and its advantage? SOAP vs REST?"

SSL/certificate pinning exists because standard TLS trusts *any* certificate signed by a trusted CA — which protects against a passive eavesdropper but not a compromised or coerced CA, or a MITM proxy with a device-installed root cert (common in corporate networks or malware). Pinning hardcodes the expected certificate's public key hash in the app, so the app rejects a connection even to a certificate that's technically valid by CA trust but doesn't match the pin.

```xml
<!-- res/xml/network_security_config.xml -->
<pin-set expiration="2027-01-01">
    <pin digest="SHA-256">base64EncodedPublicKeyHash=</pin>
</pin-set>
```

Protobuf is a binary serialization format defined by a `.proto` schema, compiled into typed classes — its advantage over JSON is size and parse speed (binary, no field-name repetition per record) plus a schema contract enforced at compile time on both client and server, at the cost of losing human-readable payloads for debugging.

REST is resource-oriented over plain HTTP verbs with (typically) JSON bodies — simple, cacheable, widely tooled. SOAP is a stricter, XML-based protocol with a formal contract (WSDL), built-in error handling standards, and transport independence — heavier, but historically favored in enterprise/finance integrations that need that formal contract and standardized fault handling.

**Say it:** "Pinning defends against a compromised or coerced CA, not just a passive eavesdropper — standard TLS alone can't catch that. Protobuf trades human-readability for size and parse speed with a compile-time schema contract, and SOAP's formal WSDL contract is why it persists in enterprise integrations REST doesn't naturally cover."
**Red flag:** Describing SSL pinning as protecting against "man-in-the-middle attacks" without qualifying which kind. Standard TLS already stops a generic MITM with an untrusted cert — pinning specifically closes the gap left by a trusted-but-wrong certificate.

### Room — Entities, DAOs, and Migrations
**They ask:** "What is Room, and how do you work with it? What do `@Dao` and `@Entity` do, and is database migration possible?"

Room is a compile-time-verified wrapper over SQLite: you declare tables as `@Entity` classes and queries as `@Dao` interface methods, and Room generates the SQLite-backed implementation, checking your `@Query` SQL against the actual schema *at compile time* — a typo'd column name fails the build instead of crashing at runtime, which raw SQLite/Cursor code can't give you.

```kotlin
@Entity(tableName = "users")
data class UserEntity(@PrimaryKey val id: String, val name: String)

@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getUser(id: String): UserEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(user: UserEntity)
}
```

Migration is not just possible, it's mandatory the moment you ship a schema change to real users — Room throws `IllegalStateException` on version mismatch unless you either supply a `Migration` (hand-written `ALTER TABLE`/`CREATE TABLE` SQL between two versions) or explicitly opt into `fallbackToDestructiveMigration()`, which wipes the local database instead of migrating it — acceptable for pure cache data, never for anything the user can't afford to lose.

**Say it:** "Room's real value over raw SQLite is compile-time-checked queries — a bad column name fails the build, not a production crash — and migrations are mandatory once real users have data; `fallbackToDestructiveMigration` is a deliberate 'this is just cache' decision, not a default."
**Red flag:** Reaching for `fallbackToDestructiveMigration()` to silence a schema-mismatch crash during development and shipping it that way. That wipes every user's local data on the next version bump if the schema ever changes again after release.

### Room — Observing Data, Multi-Table Queries, Threading
**They ask:** "Can you monitor data changes in Room? How do you select from multiple tables? Are operations allowed on the main thread?"

Room DAOs can return `Flow<T>` (or `LiveData<T>`) instead of a one-shot suspend result — Room wires that to SQLite's own change-tracking, so the Flow automatically re-emits whenever the underlying table changes, without you polling or manually invalidating a cache.

```kotlin
@Query("SELECT * FROM users WHERE isActive = 1")
fun observeActiveUsers(): Flow<List<UserEntity>>   // re-emits on any write to `users`
```

Multi-table reads use a `@Query` with a SQL `JOIN`, mapped either to a relation-annotated data class (`@Relation`) for one-to-many/many-to-many shapes, or a plain projection DTO for a flat joined result — Room validates the mapping at compile time either way.

Room deliberately throws by default if you run a query on the main thread — not a suggestion, a hard `IllegalStateException` — because SQLite I/O is exactly the kind of blocking work that causes ANRs. All Room methods should be `suspend` or return `Flow`/`LiveData`, letting Room's own executor handle the threading; `allowMainThreadQueries()` exists but is meant for tests, not production code.

**Say it:** "A Room DAO returning Flow re-emits automatically on any write to that table via SQLite's own change tracking — no manual polling — and Room enforces off-main-thread execution by default because unguarded DB I/O is a textbook ANR source."
**Red flag:** Calling `allowMainThreadQueries()` to make a crash go away instead of making the call `suspend`. That's disabling the exact safety check that stops a blocking DB call from freezing the UI thread.

### SQL Design — Normalization, Joins, Many-to-Many
**They ask:** "What are normal forms? How do you implement a many-to-many relationship? What types of JOIN exist?"

Normalization is about eliminating redundant data by splitting tables so each fact is stored once — 1NF removes repeating groups (no comma-separated lists in a column), 2NF removes partial dependency on a composite key, 3NF removes transitive dependency (a non-key column depending on another non-key column instead of the primary key). The payoff is update integrity: a fact stored in one place can't go stale in one copy while another copy still has the old value.

A many-to-many relationship (users ↔ groups) can't be expressed with a foreign key on either side — it needs a **junction table** holding pairs of foreign keys, each pair representing one association.

```kotlin
@Entity(primaryKeys = ["userId", "groupId"])
data class UserGroupCrossRef(val userId: String, val groupId: String)
```

JOIN types differ in which unmatched rows survive: `INNER JOIN` keeps only rows with a match on both sides; `LEFT JOIN` keeps every row from the left table, filling unmatched right-side columns with null; `RIGHT JOIN` is the mirror (rare in SQLite specifically, which historically lacked it); `FULL OUTER JOIN` keeps unmatched rows from both sides.

**Say it:** "Normalization's real point is update integrity — one fact stored once so it can't drift out of sync with a duplicate — many-to-many needs a junction table since neither side can hold the foreign key alone, and the JOIN types differ purely in which unmatched rows they keep."
**Red flag:** Trying to model many-to-many with a single foreign key column on one of the two entities. That can only express one-to-many — a genuine many-to-many needs the separate junction/cross-reference table.

### Image Loading Libraries — Picasso, Glide, Fresco
**They ask:** "Which image-loading library have you used, and what's the difference between UniversalImageLoader, Picasso, Glide, and Fresco?"

All of them solve the same core problem — load a remote image without blocking the main thread, cache it, and avoid `OutOfMemoryError` from full-resolution bitmaps in a small ImageView — but they differ in scope and defaults. **UniversalImageLoader** is effectively legacy/unmaintained at this point and shouldn't be a new project's choice.

**Picasso** (Square) is the simplest API and smallest footprint, with a two-line call for the common case, but has fewer built-in features (no native GIF support, simpler caching controls). **Glide** (Google-backed, used inside many Google apps) adds lifecycle-awareness (ties loads to an Activity/Fragment automatically to cancel on destroy), more aggressive and configurable caching (memory + disk, with resource-vs-bitmap pooling), and native GIF/video-frame support — the more common default choice in production apps today. **Fresco** (Meta) is the heaviest-weight option, built around its own `SimpleDraweeView` and a specialized memory management strategy (including moving bitmaps to native/ashmem memory pre-KitKat), which mattered most on very low-memory devices or apps rendering large image-heavy feeds — less commonly the default now that Glide's memory handling has improved.

```kotlin
Glide.with(context).load(url).placeholder(R.drawable.loading).into(imageView)
```

**Say it:** "They all solve async load plus memory-safe caching — Picasso wins on simplicity, Glide wins on lifecycle-awareness and configurability and is the common default now, Fresco's specialized memory management mattered most for very low-memory devices or huge image feeds."
**Red flag:** Loading a full-resolution bitmap directly into a small thumbnail ImageView without any of these libraries "to avoid the dependency." That's the exact `OutOfMemoryError` these libraries exist to prevent through automatic downsampling.

### Bitmap Memory — Config, WebP, and Resizing
**They ask:** "What's the difference between RGB_565 and ARGB_8888? Does Android support WebP, and what's its advantage? How do you resize a Bitmap?"

`Bitmap.Config` controls bytes-per-pixel, which directly controls memory footprint: `ARGB_8888` uses 4 bytes per pixel (8 bits each for alpha, red, green, blue) — full color fidelity and alpha transparency, the default and generally correct choice. `RGB_565` uses 2 bytes per pixel (5 bits red, 6 green, 5 blue, no alpha) — half the memory, but visible banding on gradients and no transparency support; it's a deliberate trade-off for memory-constrained cases (a huge grid of opaque thumbnails), not a default.

WebP is supported natively and is Android's Google-backed answer to JPEG/PNG: lossy WebP typically beats JPEG at equivalent visual quality with a smaller file size, and lossless/alpha WebP beats PNG similarly — the advantage is real bandwidth and storage savings at the same perceived quality.

Resizing correctly means never decoding at full resolution just to downscale in memory afterward — `BitmapFactory.Options.inSampleSize` (via `inJustDecodeBounds` to read dimensions first, then compute a power-of-two sample size) decodes directly at a smaller size, avoiding the full-resolution allocation entirely.

```kotlin
val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
BitmapFactory.decodeFile(path, options)                 // reads dimensions only, no bitmap allocated
options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight)
options.inJustDecodeBounds = false
val bitmap = BitmapFactory.decodeFile(path, options)      // now decodes at the smaller size
```

**Say it:** "ARGB_8888 vs RGB_565 is a direct memory-vs-fidelity trade-off — half the bytes per pixel but no alpha and visible banding — and correct resizing means decoding at the target size via `inSampleSize`, never decoding full-resolution just to downscale afterward in memory."
**Red flag:** Calling `Bitmap.createScaledBitmap()` on a full-resolution decode to shrink it for a thumbnail. That still allocates the full-size bitmap first — the memory spike already happened before the resize.
