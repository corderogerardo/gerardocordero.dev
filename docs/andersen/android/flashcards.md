# Flashcards — Android (Andersen matrix)

Every matrix row as an interviewer question. Filter by level and category in the deck.

## Android Core

### Junior Foundations

- What is `R`? — [answer](android-core.md#the-r-class--generated-resource-ids) {J1, J2, J3}
- What is an `Intent`, what's the difference between explicit and implicit, and how do you pass data with one? — [answer](android-core.md#what-is-an-intent--explicit-vs-implicit-and-passing-data) {J1, J2, J3}
- What is a `Bundle`, and how do you work with it? — [answer](android-core.md#what-is-a-bundle-and-how-do-you-work-with-it) {J1, J2, J3}
- What is `SharedPreferences`, and when do you use it? — [answer](android-core.md#sharedpreferences--simple-key-value-persistence) {J1, J2, J3}
- What is an `Activity`? — [answer](android-core.md#what-is-an-activity-and-why-does-android-need-it) {J1, J2, J3}
- What is a `Fragment`, and why would you use one instead of just another Activity? — [answer](android-core.md#what-is-a-fragment-and-why-use-one-instead-of-an-activity) {J1, J2, J3}
- What are the basic view containers/layouts in Android? — [answer](android-core.md#basic-view-containers--linearlayout-relativelayout-and-framelayout) {J1, J2, J3}
- How do you keep track of what a user types into an `EditText`? — [answer](android-core.md#edittext-and-textwatcher--tracking-input-changes) {J1, J2, J3}
- What are RecyclerView's basic components, and what types of `LayoutManager` are there? — [answer](android-core.md#recyclerview-components-and-layoutmanager-types) {J1, J2, J3}
- Why can't you touch a View from a background thread? — [answer](android-core.md#main-thread-and-why-view-access-must-happen-there) {J1, J2, J3}

### Android Core

- What is `Context`, and what's the difference between Application context and Activity context? — [answer](android-core.md#context--what-it-is-and-the-two-flavors)
- What are `dp`, `sp`, and `px`, and why does Android need two of the three? — [answer](android-core.md#dp-sp-and-px--density-independent-sizing)
- What is the `res` folder for, and how does Android decide which qualified variant to apply? — [answer](android-core.md#the-res-folder-and-resource-qualifier-resolution)
- What does the Manifest consist of, and how do conflicts get resolved when multiple manifests merge? — [answer](android-core.md#the-manifest-file-and-merging)
- Walk me through the Activity lifecycle methods and their order. — [answer](android-core.md#activity-lifecycle-methods)
- Walk me through a Fragment's lifecycle. — [answer](android-core.md#fragment-lifecycle)
- How do you add fragments — static and dynamic — and what's the difference between `add` and `replace`? — [answer](android-core.md#adding-fragments-static-vs-dynamic-add-vs-replace)
- What's the essence of `startActivityForResult`, and how does the modern Activity Result API replace it, including for Fragments? — [answer](android-core.md#startactivityforresult-and-the-activity-result-api)
- What are Task and back stack, and how do launch modes like `singleTop` and `clearTop` change the behavior? — [answer](android-core.md#task-and-back-stack-launch-modes-and-flags)
- What's the difference between Application context and Activity context, and how do two Activity contexts differ from each other? — [answer](android-core.md#application-vs-activity-context-and-two-activity-contexts)
- Is `commit` synchronous or asynchronous, what's `commitAllowingStateLoss` for, and what's `FragmentFactory`? — [answer](android-core.md#fragment-transactions-commit-commitallowingstateloss-and-fragmentfactory)
- What actually happens when I rotate the screen? — [answer](android-core.md#what-happens-on-screen-rotation)
- How do you save data across a configuration change without a full reload? — [answer](android-core.md#saving-and-restoring-ui-state)
- Why is it not recommended to handle configuration changes yourself? — [answer](android-core.md#why-not-to-handle-configuration-changes-yourself)
- What happens when a user returns to a system-killed app? Is the Activity stack restored? — [answer](android-core.md#process-death-vs-configuration-change)
- What is a Service, and what execution thread does it run on? Why was AsyncTask deprecated? — [answer](android-core.md#service-intentservice-and-why-asynctask-was-removed)
- What's WorkManager for, how do you set constraints on a task, how often can it run, and what does it use internally on different Android versions? — [answer](android-core.md#workmanager--constraints-periodicity-and-what-it-uses-under-the-hood)
- How do Handler and Looper work, and what is HandlerThread? — [answer](android-core.md#handler-looper-and-handlerthread)
- How do you start a Service in Android 8+ (Oreo), what is a foreground service, and what do the `START_STICKY`/`START_NOT_STICKY`/`START_REDELIVER_INTENT` flags mean? — [answer](android-core.md#foreground-services-and-service-start-types)
- What are the ways to transfer data from a Service to the UI, and how do `startService` and `bindService` differ? — [answer](android-core.md#passing-data-between-a-service-and-the-ui)
- How is RecyclerView better than the old ListView, and why does ViewHolder matter for memory? — [answer](android-core.md#recyclerview-and-viewholder)
- What's the core idea of ConstraintLayout, and what are baseline, guideline, and chain for? — [answer](android-core.md#constraintlayout-essentials)
- What is a View's lifecycle, what's the difference between `invalidate()` and `requestLayout()`, and what shouldn't you do in `onDraw`? — [answer](android-core.md#view-lifecycle-invalidate-vs-requestlayout-and-custom-view-drawing)
- Walk through the measure/layout/draw passes for different layouts, and what are the types of MeasureSpec? — [answer](android-core.md#measure-layout-draw-pass-and-measurespec)
- What was Jetpack Compose created for? — [answer](android-core.md#jetpack-compose--why-it-exists)
- What's the difference between local and global broadcasts, in which lifecycle methods do you register/unregister a receiver, and why are many system broadcasts restricted from manifest declaration? — [answer](android-core.md#broadcast-receivers--local-vs-global-registration-lifecycle-and-manifest-restrictions)
- What are Content Providers for, and when is writing a custom one actually mandatory? — [answer](android-core.md#content-providers--when-you-actually-need-one)
- What is an ANR, and how do you fight it? — [answer](android-core.md#anr--what-causes-it-and-how-to-avoid-it)
- What's an APK, what's an App Bundle, and what does ProGuard/R8 do — why do you need to retest thoroughly after enabling it? — [answer](android-core.md#apkapp-bundle-proguardr8-and-signing)
- How does Doze Mode work, and what does it affect? What is App Standby for? — [answer](android-core.md#doze-mode-app-standby-and-background-restrictions)
- What's the difference between ART and Dalvik, and between JIT and AOT compilation? — [answer](android-core.md#art-vs-dalvik-and-jit-vs-aot)
- What are process priorities in Android, and what is Zygote? — [answer](android-core.md#process-priorities-and-the-zygote)
- What's the difference between `buildType` and `productFlavor`, and between the `implementation` and `api` dependency configurations? — [answer](android-core.md#gradle-essentials-buildtype-vs-productflavor-implementation-vs-api)

## Kotlin

### Junior Foundations

- How do default parameters work in Kotlin, for both methods and constructors? — [answer](kotlin.md#named-and-default-arguments) {J1, J2, J3}
- What are extension functions, and how do you call one from Java? — [answer](kotlin.md#extension-functions) {J1, J2, J3}
- What's the syntax for a Kotlin lambda, and what's 'trailing lambda syntax' for? — [answer](kotlin.md#lambda-expressions-and-trailing-lambda-syntax) {J1, J2, J3}
- How do you check a type at runtime in Kotlin, and what's the difference between `as` and `as?`? — [answer](kotlin.md#type-checks-and-casts--is-and-as) {J1, J2, J3}
- Why does Kotlin divide collections into mutable and immutable, and what's the difference? — [answer](kotlin.md#mutable-vs-immutable-collections) {J1, J2, J3}
- What does the `suspend` keyword actually do? — [answer](kotlin.md#what-is-a-suspend-function) {J1, J2, J3}

### Kotlin

- How does null safety work in Kotlin, and what's the Elvis operator for? — [answer](kotlin.md#null-safety-and-the-elvis-operator)
- What's different about class inheritance in Kotlin compared to Java? — [answer](kotlin.md#kotlin-class-inheritance-vs-java)
- How do access modifiers differ between Java and Kotlin? — [answer](kotlin.md#kotlin-access-modifiers-vs-java)
- How does `when` differ from a Java switch-case? — [answer](kotlin.md#when-vs-switch-case)
- What's the difference between a Kotlin `data class` and a Java POJO? — [answer](kotlin.md#data-class-vs-pojo)
- How do exceptions differ between Java and Kotlin? — [answer](kotlin.md#kotlin-exceptions-vs-java)
- Can Kotlin and Java call each other, and what breaks at the boundary? — [answer](kotlin.md#kotlin-java-interop)
- How do Kotlin constructors differ from Java's? — [answer](kotlin.md#kotlin-constructors)
- What are properties and backing fields in Kotlin, and how do they differ from Java fields? — [answer](kotlin.md#properties-and-backing-fields)
- What's the difference between `var`, `val`, and why do we also need `const`? — [answer](kotlin.md#var-val-and-const)
- Why do we need the `Unit` and `Any` types? — [answer](kotlin.md#unit-and-any-types)
- What are Kotlin's scope functions, and how do you pick between `let`, `run`, `with`, `apply`, and `also`? — [answer](kotlin.md#scope-functions-let-run-with-apply-also)
- What are higher-order functions, and why do they matter in Kotlin? — [answer](kotlin.md#higher-order-functions-and-function-types)
- What is a companion object, and how is it different from Java statics? — [answer](kotlin.md#companion-objects)
- What's the difference between `lateinit` and `lazy`, and how do you check if `lateinit` is initialized? — [answer](kotlin.md#lateinit-vs-lazy)
- What are SAM conversions, and what's the `fun interface` keyword for? — [answer](kotlin.md#sam-conversions-and-fun-interfaces)
- Why do we need coroutines? Why not just use regular threads? — [answer](kotlin.md#why-coroutines-instead-of-threads)
- What are the ways to start a coroutine, and how do `launch`, `async`, and `runBlocking` differ? — [answer](kotlin.md#coroutine-builders-launch-async-runblocking)
- What are coroutine dispatchers, and how do you switch between them? — [answer](kotlin.md#coroutine-dispatchers-and-switching-context)
- What is a `CoroutineScope`, and why is `GlobalScope` discouraged? — [answer](kotlin.md#structured-concurrency-coroutinescope-and-globalscope)
- How do you catch an error thrown inside a coroutine? — [answer](kotlin.md#coroutine-exception-handling)
- What is a `Job`? What's `Deferred` for, and how do you run two requests in parallel? — [answer](kotlin.md#job-deferred-and-running-requests-in-parallel)
- What is a `sealed class`, and why would you reach for one? — [answer](kotlin.md#sealed-classes)
- What does `inline` do, why does `reified` only work in inline functions, and what are `noinline`/`crossinline` for? — [answer](kotlin.md#inline-functions-reified-types-noinline-and-crossinline)
- What are delegates in Kotlin, and what does the `lazy` delegate actually do? — [answer](kotlin.md#delegated-properties)
- What is a `Sequence`, and what's the advantage over a regular collection operation chain? — [answer](kotlin.md#sequence-vs-collection)

## Architecture

### MVVM, MVP, MVI, Clean

- What is architecture, and why is it needed? Give an example. — [answer](architecture.md#why-architecture-patterns-exist) {J2, J3, M1}
- How does MVVM work? What are its strengths and weaknesses? — [answer](architecture.md#mvvm--how-it-works-strengths-and-weaknesses) {M1, M2}
- What is LiveData for, and what are Architecture Components' basic building blocks? — [answer](architecture.md#livedata-and-aac-components) {M1, M2}
- How does MVP work? What are its strengths and weaknesses? — [answer](architecture.md#mvp--how-it-works-strengths-and-weaknesses) {M1, M2}
- Why did Uncle Bob come up with Clean Architecture, and what are its layers? — [answer](architecture.md#clean-architecture--origins-and-layers) {M1, M2, M3}
- What's the difference between MVVM and MVP? — [answer](architecture.md#mvvm-vs-mvp) {M2, M3}
- How does MVI work — what are State, Actions/Intents, SideEffect, and Store? — [answer](architecture.md#mvi--state-actions-sideeffect-store) {M3, S1, S2}
- What is the Repository pattern? How do you organize data caching with it? — [answer](architecture.md#repository-pattern-and-data-caching) {S1, S2}
- How do you keep weak cohesion between Clean Architecture layers, and what's the difference between DTO and Entity, and between Interactor and UseCase? — [answer](architecture.md#clean-architecture--modularity-dto-vs-entity-interactor-vs-usecase) {S1, S2}

## Technologies

### Junior Foundations

- What DI libraries do you know, and how would you pick between them? — [answer](technologies.md#di-libraries-on-android--dagger2-hilt-and-koin-at-a-glance) {J1, J2, J3}
- What is JSON, and why is it the default data format for Android network calls? — [answer](technologies.md#what-is-json-and-why-does-android-use-it-for-apis) {J1, J2, J3}
- What is a database, and what's the difference between a primary key and a foreign key? — [answer](technologies.md#what-is-a-database-and-primary-key-vs-foreign-key) {J1, J2, J3}
- How do you download an image from the network, and why not just do it by hand? — [answer](technologies.md#downloading-an-image-over-the-network) {J1, J2, J3}

### Dependency Injection

- What is Dependency Injection? How do you implement it, and why is it needed? — [answer](technologies.md#dependency-injection--why-and-how) {J2, J3, M1}
- What is the purpose of the `@Provides` annotation? What is a module and a component, and what can't be injected without a module? — [answer](technologies.md#dagger2--modules-components-and-provides) {M2, M3}
- What is Scope? What is the default if none is defined? What is Qualifier for? What's the difference between Subcomponent and Component dependencies? — [answer](technologies.md#dagger2--scopes-and-qualifiers) {M2, M3}
- What is a Koin module? What's the difference between `single` and `factory`? What happens if Koin can't find a dependency? — [answer](technologies.md#koin--modules-single-vs-factory) {M2, M3}
- What's the difference between Dagger2 and Hilt? What are `@AssistedInject`/`@AssistedFactory` for? — [answer](technologies.md#dagger2-vs-hilt-and-assisted-injection) {S1, S2}

### Networking

- How do you create and send GET and POST requests via Retrofit? — [answer](technologies.md#retrofit-basics--building-getpost-requests) {J1, J2, J3}
- What is an interceptor? What's the difference between Application interceptors and Network interceptors? — [answer](technologies.md#okhttp-interceptors--application-vs-network) {M3, S1, S2}
- How do you add a header in Retrofit, and how do you add a file to a POST body? — [answer](technologies.md#retrofit--custom-headers-and-multipart-uploads) {M3, S1, S2}
- What is SSL pinning and how do you add a certificate? What is protobuf and its advantage? SOAP vs REST? — [answer](technologies.md#network-security-and-data-formats--ssl-pinning-protobuf-rest-vs-soap) {M3, S1, S2}

### Database

- What is Room, and how do you work with it? What do `@Dao` and `@Entity` do, and is database migration possible? — [answer](technologies.md#room--entities-daos-and-migrations) {M2, M3, S1}
- Can you monitor data changes in Room? How do you select from multiple tables? Are operations allowed on the main thread? — [answer](technologies.md#room--observing-data-multi-table-queries-threading) {S2}
- What are normal forms? How do you implement a many-to-many relationship? What types of JOIN exist? — [answer](technologies.md#sql-design--normalization-joins-many-to-many) {M2, M3, S1, S2}

### Images Loading

- Which image-loading library have you used, and what's the difference between UniversalImageLoader, Picasso, Glide, and Fresco? — [answer](technologies.md#image-loading-libraries--picasso-glide-fresco) {M1, M2, M3, S1}
- What's the difference between RGB_565 and ARGB_8888? Does Android support WebP, and what's its advantage? How do you resize a Bitmap? — [answer](technologies.md#bitmap-memory--config-webp-and-resizing) {S2}

## Concurrency Deep Dive

### Flow

- What's the difference between cold and hot observables/flows? — [answer](concurrency.md#cold-vs-hot-streams--flow-and-rxjava) {M2, M3, S1}
- What are the alternatives to LiveData, and how do StateFlow and SharedFlow differ from it? — [answer](concurrency.md#stateflow-and-sharedflow-vs-livedata) {S1, S2}
- What's the relationship between Flow's `flatMapLatest`/`flatMapConcat`/`flatMapMerge` and RxJava's `flatMap`, `concatMap`, `switchMap`? — [answer](concurrency.md#flow-operators-vs-rxjavas-flatmap-family) {M2, M3, S1}

### RxJava

- What's the difference between `subscribeOn` and `observeOn`? What happens if you call either multiple times in a chain? — [answer](concurrency.md#rxjava-schedulers--subscribeon-vs-observeon) {J3, M1, M2, M3, S1}
- What types of Subject exist? What is a Relay, and how does it differ from a Subject? — [answer](concurrency.md#rxjava-subjects-and-relays) {S2}
- Where does backpressure come from? What is Flowable, and what strategies exist for handling it? — [answer](concurrency.md#rxjava-backpressure-and-flowable) {S2}
- What's the relationship between Observer, Subscriber, Disposable, and Subscription — do you always need to unsubscribe, and what goes wrong if you don't? — [answer](concurrency.md#rxjava-disposables-and-memory) {M2, M3, S1}
- When would you choose coroutines over RxJava, or vice versa, on a real project? — [answer](concurrency.md#coroutines-vs-rxjava--choosing-a-concurrency-model) {S1, S2}

## JVM

### Junior Foundations

- What is `equals()` for, and how does it differ from `==`? — [answer](jvm.md#equals-vs-reference-equality-in-java) {J1, J2, J3}
- What are `equals()` and `hashCode()` for, and why do you need to override them together? — [answer](jvm.md#equals-and-hashcode--the-contract) {J1, J2, J3}
- What methods does every Java `Object` have, and what are they for? — [answer](jvm.md#object-class--core-methods) {J1, J2, J3}
- What is an `Enum`, and why use one instead of constants? — [answer](jvm.md#enums--what-theyre-for) {J1, J2, J3}
- What's the difference between an abstract class and an interface? — [answer](jvm.md#abstract-classes-vs-interfaces) {J1, J2, J3}
- What types of exceptions are there in Java? — [answer](jvm.md#java-exception-hierarchy--error-exception-and-runtimeexception) {J1, J2, J3}
- Where can `final` be used, and what does it do in each case? — [answer](jvm.md#the-final-keyword) {J1, J2, J3}
- Where can `static` be used, and how does it affect behavior? — [answer](jvm.md#the-static-keyword) {J1, J2, J3}

### Memory

- Why is Stack needed at all — why not put everything in the Heap? — [answer](jvm.md#jvm-memory-layout--stack-vs-heap) {M2, M3, S1}
- What is GC and its basic algorithm? What are root objects, and how does GC decide to promote an object from Young to Old generation? — [answer](jvm.md#garbage-collection--algorithm-references-and-generations) {J3, M1, S2}

### Collections

- How does HashMap work internally — buckets, collisions, and what happens on `put()`? What is `loadFactor` and what does it affect? Can key or value be null? — [answer](jvm.md#hashmap-internals--buckets-collisions-and-loadfactor) {J1, J2, J3, M1, M2, M3, S1, S2}
- What's the difference between Array and ArrayList? What is ArrayList built on, and what happens when you add an element in the middle? How is LinkedList different? — [answer](jvm.md#arraylist-vs-linkedlist-vs-array) {J1, J2, J3, S1, S2}
- What are `NavigableSet`/`NavigableMap` for? What algorithm keeps a tree normalized? What is `WeakHashMap`? — [answer](jvm.md#tree-based-collections-and-weakhashmap) {S1, S2}

### Concurrency

- How does `synchronized` work, what's the difference from `Lock`, and what causes a deadlock vs a race condition? — [answer](jvm.md#thread-synchronization--synchronized-locks-and-deadlocks) {M1, M2, M3, S1}
- How does `Atomic` work, and is it better or worse than `volatile`? Why do we need Executors? What's the difference between `CopyOnWriteArrayList`/`ConcurrentHashMap` and `Collections.synchronizedList`/`synchronizedMap`? — [answer](jvm.md#javautilconcurrent--atomics-executors-and-concurrent-collections) {S2}

## Testing

### Unit Testing

- Why do you need unit tests? What is Mockito, and what is a mock object? — [answer](testing.md#unit-testing-basics--why-mockito-and-mock-objects) {M1, M2}
- How do you create a mock of a class or interface? What does the method of a mocked class return by default, and how do you specify a return value? What are `verify` and `ArgumentCaptor` for? — [answer](testing.md#mockito--stubbing-verify-and-argumentcaptor) {M3, S1, S2}
- How do you mock a final, static, or abstract class? — [answer](testing.md#mocking-final-static-and-abstract-classes) {S2}
- What are the differences between Mock, Stub, and Spy? — [answer](testing.md#mock-vs-stub-vs-spy) {S2}

### UI Testing

- What's the difference between Unit tests and UI tests? How do you use Robolectric and Espresso, in principle? — [answer](testing.md#unit-tests-vs-ui-tests--espresso-and-robolectric) {M2, M3, S1}
- What are Espresso Matchers? What is UIAutomator for, and how is it different from Espresso? — [answer](testing.md#espresso-matchers-and-uiautomator) {S2}
