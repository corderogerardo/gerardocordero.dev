// Advanced batch 22 — CloudKit & iCloud sync (senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED22_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED22_FLASHCARDS: Flashcard[] = [
  {
    id: "i1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is CloudKit?",
    answerHtml: `<p>CloudKit exists to delete an entire category of work: you never provision a server, write
      auth, or pay for storage on data that's really the user's own. Your app gets a <code>CKContainer</code>
      tied to the signed-in <b>iCloud</b> account, and you store typed <code>CKRecord</code>s against it — the
      trade-off is you're locked to the Apple ecosystem. <b>"I reach for CloudKit when the data is per-user and
      I want zero backend ops in exchange for staying Apple-only."</b></p>`,
    level: "senior",
  },
  {
    id: "i2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the three CloudKit database scopes?",
    answerHtml: `<p>The three scopes exist to answer one question up front — who owns this data and who pays
      for storing it. <b>Public</b> is shared app-wide data billed against your server quota, <b>private</b> is
      this user's data living in their own iCloud (their quota, not yours), and <b>shared</b> is another user's
      record they've explicitly granted you access to. <b>"I pick the scope by ownership: public for app-wide
      data, private for the user's own, shared for collaboration."</b></p>`,
    level: "senior",
  },
  {
    id: "i3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is a CKRecord?",
    answerHtml: `<p>A <code>CKRecord</code> is CloudKit's answer to "no server means no rigid schema" — it's a
      dynamically-typed row identified by <code>recordType</code> and a unique <code>recordID</code>, holding
      key-value fields (strings, numbers, dates, locations, and <code>CKAsset</code> for large files/images).
      Relationships between records are modeled with <code>CKRecord.Reference</code>, not foreign keys.
      <b>"CKRecord is a schema-flexible dictionary with typed fields — references stand in for foreign
      keys."</b></p>`,
    level: "senior",
  },
  {
    id: "i4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you query and fetch CloudKit data?",
    answerHtml: `<p>CloudKit splits "find records I don't know the ID of" from "fetch records I do" into two
      APIs, because search against someone else's server needs guardrails. <code>CKQuery</code>
      (recordType + <code>NSPredicate</code> + sort) handles search, while fetch operations target specific
      records/zones directly. Results paginate via cursors, and a field is only queryable if it's indexed in
      the schema. <b>Red flag: assuming any field can be filtered on — unindexed fields throw at query time, so
      design your queryable fields up front.</b></p>`,
    level: "senior",
  },
  {
    id: "i5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you get notified when CloudKit data changes?",
    answerHtml: `<p>Polling would burn battery and quota on every device checking "did anything change?" — so
      CloudKit inverts the model: you register a <b>subscription</b> (<code>CKQuerySubscription</code> or
      <code>CKDatabaseSubscription</code>) and it pushes to you. A <b>silent push</b> arrives when matching data
      changes, and your app responds by fetching the delta. <b>"I use CloudKit subscriptions plus silent push so
      devices sync on change, not on a timer."</b> <b>Red flag: reaching for a repeating Timer to poll for
      changes</b> — that's the exact cost a subscription is designed to remove.</p>`,
    level: "senior",
  },
  {
    id: "i6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you sync changes incrementally?",
    answerHtml: `<p>Refetching every record on every sync doesn't scale past a handful of records, so CloudKit
      tracks state server-side: <code>CKFetchRecordZoneChangesOperation</code> returns only what changed since
      your last <b>server change token</b>, which you persist and pass back next time. Combined with custom
      <b>record zones</b> (the unit change tracking is scoped to), this gives true delta sync instead of a full
      refetch. <b>"I persist the server change token per zone and only fetch what changed since it."</b></p>`,
    level: "architect",
  },
  {
    id: "i7",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What does CKSyncEngine (iOS 17) provide?",
    answerHtml: `<p>Hand-rolling change tokens, batching, retries, and conflict surfacing is the same
      boilerplate every CloudKit sync layer ends up writing, so Apple extracted it into a state machine:
      <b>CKSyncEngine</b> manages all of that for you, and you implement delegate callbacks to send local
      changes and apply remote ones. <b>"CKSyncEngine is the sync-layer boilerplate CloudKit apps used to
      hand-roll, now built in."</b></p>`,
    level: "architect",
  },
  {
    id: "i8",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you handle CloudKit save conflicts?",
    answerHtml: `<p>Concurrent multi-device edits are the normal case for synced data, not an edge case, so
      CloudKit surfaces the conflict instead of silently picking a winner: a save fails with
      <code>serverRecordChanged</code>, and the error carries the server, client, and ancestor records. You
      <b>merge</b> the fields per your own policy (last-write-wins, field-level merge) and retry the save.
      <b>"I treat serverRecordChanged as expected, not exceptional, and always design a merge policy up
      front."</b> Red flag: retrying the save blind (no merge) just clobbers the server record you conflicted
      with.</p>`,
    level: "architect",
  },
  {
    id: "i9",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does CloudKit sharing/collaboration work?",
    answerHtml: `<p>Sharing works without your backend brokering access at all: wrap a record (and its
      hierarchy) in a <code>CKShare</code>, present the system sharing UI (<code>UICloudSharingController</code>),
      and CloudKit handles the invite. Invited users access it through their own <b>shared</b> database with a
      permission (read / read-write). <b>"CKShare plus UICloudSharingController gets collaboration for free,
      without a server brokering access."</b></p>`,
    level: "architect",
  },
  {
    id: "i10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Why use custom record zones?",
    answerHtml: `<p>The default zone is fine for a toy app, but it lacks two things real sync needs: atomic
      multi-record saves and per-zone change tracking. Custom zones (in the private DB) provide both — <b>atomic</b>
      batch saves, <b>change tracking</b> (what delta sync is built on), and the ability to share a zone's
      hierarchy wholesale. <b>"Any serious CloudKit sync layer uses custom zones, not the default zone."</b></p>`,
    level: "architect",
  },
  {
    id: "i11",
    category: "security",
    categoryLabel: "Security",
    question: "How does authentication work with CloudKit?",
    answerHtml: `<p>CloudKit auth is a non-event by design: it uses the device's <b>iCloud account</b>, so you
      write no login code and never see the user's Apple ID or password. The one thing you must handle is
      <code>accountStatus</code> — the user may be signed out or have iCloud disabled — and degrade gracefully
      rather than assuming access. <b>"I check accountStatus and degrade gracefully instead of assuming the
      user is signed into iCloud."</b></p>`,
    level: "senior",
  },
  {
    id: "i12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are CloudKit's limits and how do you respect them?",
    answerHtml: `<p>CloudKit enforces request-rate limits and batch-size caps because it's a shared multi-tenant
      service, not your own database. <b>Batch</b> with the operation APIs instead of one request per record, and
      on a throttling error honor <code>CKErrorRetryAfter</code> and back off rather than retrying immediately.
      Keep assets reasonable, and remember the private DB consumes the <i>user's</i> iCloud quota, not yours.
      <b>Red flag: firing one save operation per record in a loop</b> — that's what trips the rate limiter first.
      <b>"I batch through the operation APIs and back off on CKErrorRetryAfter."</b></p>`,
    level: "senior",
  },
  {
    id: "i13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is NSUbiquitousKeyValueStore?",
    answerHtml: `<p>For small settings, standing up a CloudKit schema is overkill — <code>NSUbiquitousKeyValueStore</code>
      is the lighter tool: iCloud's <b>key-value</b> store, like <code>UserDefaults</code> but synced across the
      user's devices, capped at ~1 MB total. Good fit for preferences/settings/last-read position; not for large
      or structured data, where CloudKit is the right tool. Listen for external-change notifications to react
      when another device updates a value. <b>"For a few small settings I reach for
      NSUbiquitousKeyValueStore, not a full CloudKit schema."</b></p>`,
    level: "mid",
  },
  {
    id: "i14",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does iCloud Documents storage work?",
    answerHtml: `<p>Document-based apps need file-level sync, not record-level sync, so iCloud gives them a
      different mechanism: files placed in your app's <b>ubiquity container</b> sync across devices, and
      <code>UIDocument</code> plus file coordination/presenters handle concurrent access and conflicts. The
      system uploads/downloads in the background — you're responsible for surfacing download state and
      resolving version conflicts, not for the transfer itself. <b>"iCloud Documents syncs files via the
      ubiquity container; UIDocument plus file coordination is what keeps concurrent access safe."</b></p>`,
    level: "senior",
  },
  {
    id: "i15",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do Core Data / SwiftData sync via CloudKit?",
    answerHtml: `<p>This is the closest thing to free cross-device sync: Core Data uses
      <code>NSPersistentCloudKitContainer</code>, SwiftData enables CloudKit on its <code>ModelContainer</code>,
      and the store <b>automatically mirrors</b> to a private CloudKit database with no sync code of your own.
      The cost is a schema constraint — <b>every attribute optional or with a default</b>, relationships
      optional, and <b>no unique constraints</b> — because CloudKit's schema-flexible records can't enforce
      what your local store can. <b>Red flag: keeping a unique constraint on an entity you plan to mirror</b> —
      it'll fail CloudKit sync setup outright, not just at merge time. <b>"Automatic mirroring is close to free,
      but the model has to give up unique constraints and required attributes first."</b></p>`,
    level: "architect",
  },
  {
    id: "i16",
    category: "arch",
    categoryLabel: "Architecture",
    question: "When should you choose CloudKit over your own backend?",
    answerHtml: `<p>This is a build-vs-buy call, and the deciding factor is platform reach and control, not
      developer convenience. <b>CloudKit</b> wins when your data is per-user and you want zero server cost/ops
      plus strong privacy, and being Apple-only is acceptable. <b>Your own backend</b> wins once you need
      cross-platform (Android/web), complex server-side queries or business logic, full-text search, or control
      over data residency. <b>"I default to CloudKit for Apple-only, per-user data — I reach for my own backend
      the moment cross-platform or server-side logic enters the picture."</b></p>`,
    level: "architect",
  },
];

export const ADVANCED22_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED22_QUIZ: QuizQuestion[] = [
  {
    id: "iz1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "A user's own private CloudKit data is stored:",
    options: ["On Apple's shared servers at your cost", "In their iCloud, against their storage quota", "On your backend", "Only on device"],
    answer: 1,
    explanationHtml: `<p>The private database lives in the user's own iCloud and counts against their quota.
      "On Apple's shared servers at your cost" is the misconception behind picking "public" here — that scope is
      for app-wide data billed to your server quota, not this user's own records.</p>`,
  },
  {
    id: "iz2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "To learn that CloudKit data changed without polling, use:",
    options: ["A repeating Timer", "A CKSubscription (silent push) + delta fetch", "URLSession", "NSUbiquitousKeyValueStore"],
    answer: 1,
    explanationHtml: `<p>Subscriptions trigger a silent push on change; you then fetch the delta using change
      tokens. A repeating Timer is the tempting wrong answer — it "works" but burns battery and quota polling for
      changes that may not have happened, exactly what subscriptions exist to avoid.</p>`,
  },
  {
    id: "iz3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Efficient incremental CloudKit sync relies on:",
    options: ["Refetching all records each time", "Server change tokens + custom record zones", "A bigger cache", "NSPredicate only"],
    answer: 1,
    explanationHtml: `<p>Change tokens return only what changed; custom zones provide the change tracking and
      atomic batches that make delta sync work (CKSyncEngine wraps this). "A bigger cache" is a common instinct
      but doesn't solve the actual problem — you still don't know what changed server-side without a token.</p>`,
  },
  {
    id: "iz4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "A CloudKit save failing with serverRecordChanged means you should:",
    options: ["Give up", "Merge with the server record and retry", "Delete the record", "Switch databases"],
    answer: 1,
    explanationHtml: `<p>It's a conflict, not a failure — the error carries server/client/ancestor records so you
      can merge per your policy and retry the save. "Give up" or "delete the record" both treat expected
      concurrent-edit behavior as an unrecoverable error.</p>`,
  },
  {
    id: "iz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "For Core Data/SwiftData CloudKit mirroring, the model must have:",
    options: ["Unique constraints on every entity", "All attributes optional or with defaults, and no unique constraints", "Only string fields", "A custom server"],
    answer: 1,
    explanationHtml: `<p><code>NSPersistentCloudKitContainer</code> requires CloudKit-compatible models:
      optional/default attributes, optional relationships, and no unique constraints. "Unique constraints on
      every entity" is backwards — CloudKit's flexible records can't enforce uniqueness, so the constraint has
      to go, not get added.</p>`,
  },
  {
    id: "iz6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Syncing a handful of small preferences across devices is best done with:",
    options: ["A full CloudKit schema", "NSUbiquitousKeyValueStore", "A file in Documents", "Keychain"],
    answer: 1,
    explanationHtml: `<p>The iCloud key-value store syncs small (~1 MB) preference data across devices with
      minimal code. "A full CloudKit schema" is the over-engineered answer here — CloudKit is for
      structured/larger data, not a handful of settings.</p>`,
  },
];

export const ADVANCED22_STUDY: StudySection[] = [
  {
    id: "st-adv-51",
    num: "66",
    title: "66 · CloudKit: records, databases & sync",
    html: `<p><b>Why it exists.</b> CloudKit trades server ownership for platform lock-in: you get Apple's
      iCloud-backed backend — a <code>CKContainer</code> with <b>public</b>, <b>private</b> (the user's quota),
      and <b>shared</b> databases — with zero infra to run, in exchange for staying Apple-only. Store
      <code>CKRecord</code>s (fields, references, <code>CKAsset</code>s), query with <code>CKQuery</code>, and
      get change notifications via <b>subscriptions</b> (silent push) instead of polling. For real sync, use
      custom <b>record zones</b> + <b>server change tokens</b> for deltas, handle
      <code>serverRecordChanged</code> conflicts explicitly, and consider <b>CKSyncEngine</b> (iOS 17) to manage
      tokens/retries/conflicts for you. <b>CKShare</b> enables collaboration without a server brokering
      access.</p>
    <div class="callout warn"><span class="lbl">Realities</span> Auth is the iCloud account (check
      <code>accountStatus</code>, no login code); respect rate limits (batch + <code>CKErrorRetryAfter</code>);
      and not every field is queryable unless indexed. <b>Say this:</b> "CloudKit removes the backend for
      per-user data, at the cost of being Apple-only."</div>`,
  },
  {
    id: "st-adv-52",
    num: "67",
    title: "67 · iCloud key-value, documents & local-store sync",
    html: `<p><b>Why it exists.</b> Not every sync problem needs a full CloudKit schema, so Apple offers lighter
      options sized to the data. <b>NSUbiquitousKeyValueStore</b> syncs small (~1 MB) preferences across a
      user's devices like a cloud <code>UserDefaults</code>. <b>iCloud Documents</b> (a ubiquity container +
      <code>UIDocument</code> with file coordination) syncs files for document-based apps. And the biggest
      convenience: <b>Core Data</b> (<code>NSPersistentCloudKitContainer</code>) / <b>SwiftData</b> can
      <b>mirror your local store to a private CloudKit database automatically</b> — provided the model gives up
      unique constraints and required attributes to become CloudKit-compatible.</p>
    <div class="callout tip"><span class="lbl">Choose by data</span> Small prefs → key-value store; files →
      iCloud Documents; your app's model with near-free sync → Core Data/SwiftData + CloudKit; bespoke/large or
      collaborative → raw CloudKit. <b>Say this:</b> "I size the sync tool to the data — key-value for
      settings, mirroring for the local model, raw CloudKit only when I need real control."</div>`,
  },
];
