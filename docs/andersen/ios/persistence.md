# iOS — Data Persistence

### Keychain, UserDefaults, .plist, and App Groups
**They ask:** "Keychain, UserDefaults, and .plist — how do you decide which one to use, and how do you share data across an app and its extensions?"

The decision is driven by sensitivity and structure, not habit. `UserDefaults` stores small, non-sensitive key-value settings (feature flags, last-viewed tab) — it's backed by a plist under the hood and is **not encrypted at rest**, so it's the wrong place for anything a user would consider private. `Keychain` is the only one of the three that's encrypted and survives even an app *reinstall* (data outlives the app's sandbox) — it's for credentials, tokens, and biometric-protected secrets. A raw `.plist` is for structured, static, or bundled configuration data you read/write directly with `PropertyListEncoder`/`Decoder`.

```swift
// Keychain write (simplified)
let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: "authToken",
    kSecValueData as String: tokenData
]
SecItemAdd(query as CFDictionary, nil)
```

To share data between an app and its extensions (widget, share sheet, notification service), you need an **App Group** — a shared container ID configured in capabilities — and then use `UserDefaults(suiteName:)` or a shared Keychain access group instead of the standard suite, since each extension is a separate sandboxed process by default.

**Say it:** "UserDefaults is for small, non-sensitive settings and isn't encrypted; Keychain is the only one that's encrypted and survives a reinstall, so tokens go there — and sharing across an app and its extensions needs an App Group container, since each target is sandboxed separately."
**Red flag:** Storing an auth token in UserDefaults "because it's simpler." It's plaintext on disk and readable by anyone with device/backup access — that's exactly what Keychain exists to prevent.

### Core Data stack — context, coordinator, store types, fetching
**They ask:** "Walk through the Core Data stack — what does each piece do, and how do `NSFetchedResultsController` and `@FetchRequest` fit in?"

Core Data's layering exists to separate *what you work with* from *how it's persisted*, so the same object graph can back different storage without changing your model code. The **`NSManagedObjectContext`** is your working scratchpad — an in-memory space where you create, fetch, and mutate `NSManagedObject`s; nothing hits disk until you `save()`. The **`NSPersistentStoreCoordinator`** sits below it, mediating between one or more contexts and the actual **persistent store** — typically SQLite, but also binary or in-memory (the last is common for tests, since it never touches disk).

```swift
let container = NSPersistentContainer(name: "Model")
container.loadPersistentStores { _, error in /* ... */ }
let context = container.viewContext
let user = User(context: context)
do {
    try context.save()
} catch {
    // handle/log the validation, disk, or merge error — never swallow it
    print("save failed: \(error)")
}
```

`NSFetchedResultsController` watches a fetch request against a context and diffs changes for you — insert/delete/move/update callbacks that drive a `UITableView`/`UICollectionView` without you manually re-fetching. `@FetchRequest` is the SwiftUI equivalent: a property wrapper that re-runs the fetch and triggers a view update whenever matching data changes, no delegate boilerplate required.

**Say it:** "The context is my in-memory scratchpad, the persistent store coordinator bridges it to SQLite on disk, and `NSFetchedResultsController` (or `@FetchRequest` in SwiftUI) turns store changes into table/view diffs automatically instead of me re-fetching by hand."
**Red flag:** Calling `save()` after every single field edit. Saves are relatively expensive (they write to disk and notify observers) — batch related changes and save once per logical unit of work.

### Core Data multithreading and migrations
**They ask:** "How do you use Core Data safely across threads, and what happens when your model changes between app versions?"

`NSManagedObjectContext` is **not thread-safe** — you must confine each context to the queue it was created on and only touch its objects there. The standard pattern is two contexts: a `viewContext` (main queue, for UI) and one or more `NSManagedObjectContext(concurrencyType: .privateQueueConcurrencyType)` for background imports/writes, wired as a child of the view context or as a sibling sharing the same persistent store coordinator. You never pass an `NSManagedObject` across contexts directly — you pass its `NSManagedObjectID` and re-fetch with `object(with:)` on the target context.

```swift
container.viewContext.automaticallyMergesChangesFromParent = true   // pick up background saves without a manual notification observer

container.performBackgroundTask { bgContext in
    let obj = Item(context: bgContext)
    do {
        try bgContext.save()   // writes straight to the store; automaticallyMergesChangesFromParent above keeps viewContext's reads fresh
    } catch {
        print("background save failed: \(error)")
    }
}
```

Conflicts between two contexts editing the same row are resolved by a **merge policy** — `NSManagedObjectContext` defaults to `NSErrorMergePolicy`, which just fails the save on a conflict, so setting `NSMergeByPropertyObjectTrumpMergePolicy` is a deliberate choice (the in-memory context's changes win property-by-property over the store's), not the out-of-the-box behavior.

Schema changes need a **migration**. **Lightweight migration** (Core Data infers the mapping — renamed/added/optional attributes) covers most cases and is nearly free to enable. **Heavyweight migration** — restructuring relationships, splitting entities — needs an explicit mapping model and is where performance and correctness bugs actually show up in interviews; test it against a real production-sized store, not an empty one.

**Say it:** "Contexts aren't thread-safe, so I confine each to its own queue — a main `viewContext` for UI and a private background context for writes — and cross the boundary with `NSManagedObjectID`, never the object itself; schema changes lean on lightweight migration until the change is structural enough to need an explicit mapping model."
**Red flag:** Passing an `NSManagedObject` fetched on a background context straight into a UI update on the main thread. That's a cross-thread access violation Core Data won't always crash on immediately — it'll corrupt state intermittently instead.

### Realm vs Core Data
**They ask:** "How does Realm's threading model differ from Core Data's, and when would you actually choose one over the other?"

Both are object-graph persistence layers, but their thread-safety story is inverted. Core Data confines a *context* to one queue and you re-fetch across contexts by ID. Realm objects are **live, thread-confined objects** — a `Realm` instance and everything you read from it is tied to the thread it was opened on, and passing a Realm object to another thread crashes at runtime; you pass a thread-safe reference (`ThreadSafeReference`) or the primary key instead, then re-open the Realm on the target thread.

Realm's model is otherwise simpler day-to-day: no separate "store coordinator," writes are transactional (`realm.write { ... }`) and objects auto-update live in the UI without a fetch-results-controller layer — good for real-time collaborative or frequently-mutated data. Realm also supports `EmbeddedObject` for true parent-owned composition (deleted when the parent is), similar in spirit to Core Data's cascade delete rules but modeled as a distinct type rather than a delete-rule flag.

The trade-off that actually decides it: Core Data is Apple-native, integrates with CloudKit sync and `@FetchRequest` for free, and has no third-party dependency; Realm has a friendlier API and different (often simpler) migrations, at the cost of a bundled binary dependency and its own file format.

**Say it:** "Core Data confines contexts to a queue and you re-fetch by ID across threads; Realm objects are themselves thread-confined and crash if passed across threads directly — you hand off a `ThreadSafeReference` instead. I lean Core Data when I want CloudKit sync and zero third-party dependency, Realm when I want a simpler live-object API."
**Red flag:** Storing a Realm object reference in a closure that runs on a background queue. It'll crash the moment it's accessed off its origin thread — pass a `ThreadSafeReference` or primary key across, not the object.

### NSFileManager, archiving, SQLite, NSCache, and UIDocument
**They ask:** "Beyond Core Data and UserDefaults, what are your other options for persisting data on-device?"

`NSFileManager` is the direct filesystem API — for arbitrary files (images, exports, downloaded PDFs) you organize yourself under `Documents`/`Caches`/`Application Support`, each with different backup and purge semantics (`Caches` isn't backed up and the OS can purge it under disk pressure — the right place for regenerable data). For structured objects you write manually, `Codable` + `JSONEncoder`/`PropertyListEncoder` to a file, or the older `NSCoding`/`NSKeyedArchiver`, serializes an object graph to disk.

`SQLite` directly (or a thin wrapper like GRDB) is the choice when you need real relational queries, joins, or full-text search that Core Data's object-graph model makes awkward — Core Data is actually built *on top of* SQLite by default, so reaching for SQLite directly is trading Core Data's object management for raw query control.

`NSCache` is an in-memory, **not persisted**, key-value cache that's cost/count-limited and automatically evicts entries under memory pressure — unlike a plain `Dictionary`, it's thread-safe and memory-aware, which is why it's the standard choice for an image cache.

`UIDocument` (and `NSDocument` on macOS) wraps file-based persistence with built-in autosaving, conflict resolution via `NSFileCoordinator`/`NSFilePresenter`, and iCloud document sync — the right abstraction when your app's core unit of data *is* a document (a note, a drawing) rather than a database of records.

**Say it:** "For arbitrary files I use `NSFileManager` with `Caches` for regenerable data; for structured objects I reach for `Codable` to disk or SQLite directly when I need real relational queries; `NSCache` handles in-memory eviction-aware caching like images, and `UIDocument` is for when the app's unit of data really is a document with autosave and iCloud conflict handling built in."
**Red flag:** Using a plain `Dictionary` as an image cache. It never evicts under memory pressure and isn't thread-safe — `NSCache` solves both for free.

### UserDefaults Basics
**They ask:** "What is UserDefaults, and what should you *not* store in it?"

`UserDefaults` is a simple key-value store for small pieces of user preference — a theme choice, an "onboarding seen" flag, a last-selected tab. It persists across launches and is trivial to use (`UserDefaults.standard.set(true, forKey: "seenIntro")`). The critical limit: it's **not secure and not for large or sensitive data**. It's stored as an unencrypted plist, so passwords and tokens belong in the **Keychain**, and big or structured data belongs in a database like Core Data or SQLite — dumping a large array into UserDefaults bloats launch time because the whole thing loads into memory.

**Say it:** "UserDefaults is for small non-sensitive preferences like flags and settings — it persists across launches but it's an unencrypted plist, so secrets go in the Keychain and large or structured data goes in Core Data or SQLite."
**Red flag:** Storing an auth token or password in UserDefaults. It's readable on a jailbroken device and in backups — a security issue an interviewer will flag immediately; the Keychain exists exactly for this.
