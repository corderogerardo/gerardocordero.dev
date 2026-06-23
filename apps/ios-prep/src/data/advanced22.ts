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
    answerHtml: `<p>Apple's hosted backend tied to the user's <b>iCloud</b> account. Your app gets a
      <code>CKContainer</code> with generous free storage, and you store typed records — no servers to run, no
      auth code to write (it uses the signed-in Apple ID). Apple-ecosystem only.</p>`,
    level: "senior",
  },
  {
    id: "i2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the three CloudKit database scopes?",
    answerHtml: `<p><b>Public</b> (shared by all users of the app — server-quota-backed), <b>private</b> (this
      user's data, in their iCloud, counts against <i>their</i> storage), and <b>shared</b> (records another user
      shared with them). Choose the scope per data's ownership and visibility.</p>`,
    level: "senior",
  },
  {
    id: "i3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is a CKRecord?",
    answerHtml: `<p>A schema-flexible record with a <code>recordType</code>, a unique <code>recordID</code>, and
      key-value fields (strings, numbers, dates, references, locations, and <code>CKAsset</code> for large
      files/images). References (<code>CKRecord.Reference</code>) model relationships between records.</p>`,
    level: "senior",
  },
  {
    id: "i4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you query and fetch CloudKit data?",
    answerHtml: `<p><code>CKQuery</code> (recordType + <code>NSPredicate</code> + sort) for searches, and fetch
      operations for specific records/zones. Note CloudKit query limitations (not every field is queryable unless
      indexed in the schema), and results are paginated via cursors.</p>`,
    level: "senior",
  },
  {
    id: "i5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you get notified when CloudKit data changes?",
    answerHtml: `<p>Register a <b>subscription</b> (<code>CKQuerySubscription</code> or
      <code>CKDatabaseSubscription</code>); CloudKit sends a <b>silent push</b> when matching data changes, and
      your app fetches the delta. This is how you keep devices in sync without polling.</p>`,
    level: "senior",
  },
  {
    id: "i6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you sync changes incrementally?",
    answerHtml: `<p>Use change tokens: <code>CKFetchRecordZoneChangesOperation</code> returns only what changed
      since your last <b>server change token</b>, which you persist and pass next time. Combined with custom
      <b>record zones</b>, this gives efficient delta sync instead of refetching everything.</p>`,
    level: "architect",
  },
  {
    id: "i7",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What does CKSyncEngine (iOS 17) provide?",
    answerHtml: `<p>A higher-level sync state machine that manages change tokens, batching, retries, and
      conflict surfacing for you — you implement delegate callbacks to send local changes and apply remote ones.
      It removes most of the boilerplate of hand-rolling a CloudKit sync layer.</p>`,
    level: "architect",
  },
  {
    id: "i8",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you handle CloudKit save conflicts?",
    answerHtml: `<p>A save can fail with <code>serverRecordChanged</code> — the error carries the server,
      client, and ancestor records. You <b>merge</b> the fields per your policy (last-write-wins, field-level
      merge) and retry the save. Always design a conflict strategy; concurrent multi-device edits are
      normal.</p>`,
    level: "architect",
  },
  {
    id: "i9",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does CloudKit sharing/collaboration work?",
    answerHtml: `<p>Wrap a record (and its hierarchy) in a <code>CKShare</code> and present the system sharing UI
      (<code>UICloudSharingController</code>); invited users access it through their <b>shared</b> database with a
      permission (read / read-write). It's how you build real-time collaborative documents on CloudKit.</p>`,
    level: "architect",
  },
  {
    id: "i10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Why use custom record zones?",
    answerHtml: `<p>Custom zones (in the private DB) enable <b>atomic</b> multi-record saves, per-zone <b>change
      tracking</b> (the basis of delta sync), and sharing of a zone's hierarchy. The default zone lacks change
      tracking and atomic batches, so serious sync uses custom zones.</p>`,
    level: "architect",
  },
  {
    id: "i11",
    category: "security",
    categoryLabel: "Security",
    question: "How does authentication work with CloudKit?",
    answerHtml: `<p>It uses the device's <b>iCloud account</b> — you write no login code and never see the user's
      Apple ID/password. Check <code>accountStatus</code> (the user may be signed out or have iCloud disabled) and
      degrade gracefully. The private DB is end-to-end the user's own iCloud storage.</p>`,
    level: "senior",
  },
  {
    id: "i12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are CloudKit's limits and how do you respect them?",
    answerHtml: `<p>There are request rate limits and batch-size caps. <b>Batch</b> with the operation APIs (not
      one request per record), and on a throttling error honor <code>CKErrorRetryAfter</code> and back off. Keep
      assets reasonable, and remember the private DB consumes the <i>user's</i> iCloud quota.</p>`,
    level: "senior",
  },
  {
    id: "i13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is NSUbiquitousKeyValueStore?",
    answerHtml: `<p>iCloud's <b>key-value</b> store — like <code>UserDefaults</code> but synced across the user's
      devices (small data only, ~1 MB total). Great for syncing preferences/settings/last-read position; not for
      large or structured data (use CloudKit for that). Listen for external-change notifications.</p>`,
    level: "mid",
  },
  {
    id: "i14",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does iCloud Documents storage work?",
    answerHtml: `<p>Files placed in your app's <b>ubiquity container</b> sync across devices; document-based apps
      use <code>UIDocument</code> + file coordination/presenters to handle concurrent access and conflicts. The
      system uploads/downloads in the background; you handle download state and version conflicts.</p>`,
    level: "senior",
  },
  {
    id: "i15",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do Core Data / SwiftData sync via CloudKit?",
    answerHtml: `<p>Core Data uses <code>NSPersistentCloudKitContainer</code>; SwiftData enables CloudKit on its
      <code>ModelContainer</code>. The store <b>automatically mirrors</b> to a private CloudKit database — but the
      model must be CloudKit-compatible: <b>every attribute optional or with a default</b>, relationships
      optional, and <b>no unique constraints</b>. Almost-free cross-device sync for your local model.</p>`,
    level: "architect",
  },
  {
    id: "i16",
    category: "arch",
    categoryLabel: "Architecture",
    question: "When should you choose CloudKit over your own backend?",
    answerHtml: `<p><b>CloudKit</b> when your data is per-user and you want zero server cost/ops, strong privacy,
      and Apple-only is fine. <b>Your own backend</b> when you need cross-platform (Android/web), complex server
      queries/business logic, full-text search, or control over data residency. It's a per-app trade-off, not a
      default.</p>`,
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
    explanationHtml: `<p>The private database lives in the user's iCloud and counts against their quota; the
      public database is backed by your app's server quota.</p>`,
  },
  {
    id: "iz2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "To learn that CloudKit data changed without polling, use:",
    options: ["A repeating Timer", "A CKSubscription (silent push) + delta fetch", "URLSession", "NSUbiquitousKeyValueStore"],
    answer: 1,
    explanationHtml: `<p>Subscriptions trigger a silent push on change; you then fetch the delta using change
      tokens.</p>`,
  },
  {
    id: "iz3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Efficient incremental CloudKit sync relies on:",
    options: ["Refetching all records each time", "Server change tokens + custom record zones", "A bigger cache", "NSPredicate only"],
    answer: 1,
    explanationHtml: `<p>Change tokens return only what changed; custom zones provide the change tracking and
      atomic batches that make delta sync work (CKSyncEngine wraps this).</p>`,
  },
  {
    id: "iz4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "A CloudKit save failing with serverRecordChanged means you should:",
    options: ["Give up", "Merge with the server record and retry", "Delete the record", "Switch databases"],
    answer: 1,
    explanationHtml: `<p>It's a conflict; the error carries server/client/ancestor records — merge per your
      policy and retry the save.</p>`,
  },
  {
    id: "iz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "For Core Data/SwiftData CloudKit mirroring, the model must have:",
    options: ["Unique constraints on every entity", "All attributes optional or with defaults, and no unique constraints", "Only string fields", "A custom server"],
    answer: 1,
    explanationHtml: `<p><code>NSPersistentCloudKitContainer</code> requires CloudKit-compatible models:
      optional/default attributes, optional relationships, and no unique constraints.</p>`,
  },
  {
    id: "iz6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Syncing a handful of small preferences across devices is best done with:",
    options: ["A full CloudKit schema", "NSUbiquitousKeyValueStore", "A file in Documents", "Keychain"],
    answer: 1,
    explanationHtml: `<p>The iCloud key-value store syncs small (~1 MB) preference data across devices with
      minimal code; CloudKit is for structured/larger data.</p>`,
  },
];

export const ADVANCED22_STUDY: StudySection[] = [
  {
    id: "st-adv-51",
    num: "66",
    title: "66 · CloudKit: records, databases & sync",
    html: `<p><b>What it is.</b> Apple's iCloud-backed backend — a <code>CKContainer</code> with <b>public</b>,
      <b>private</b> (the user's quota), and <b>shared</b> databases. Store <code>CKRecord</code>s (fields,
      references, <code>CKAsset</code>s), query with <code>CKQuery</code>, and get change notifications via
      <b>subscriptions</b> (silent push). For real sync, use custom <b>record zones</b> + <b>server change
      tokens</b> for deltas, handle <code>serverRecordChanged</code> conflicts, and consider <b>CKSyncEngine</b>
      (iOS 17) to manage tokens/retries/conflicts. <b>CKShare</b> enables collaboration.</p>
    <div class="callout warn"><span class="lbl">Realities</span> Auth is the iCloud account (check
      <code>accountStatus</code>, no login code); respect rate limits (batch + <code>CKErrorRetryAfter</code>);
      and not every field is queryable unless indexed.</div>`,
  },
  {
    id: "st-adv-52",
    num: "67",
    title: "67 · iCloud key-value, documents & local-store sync",
    html: `<p><b>What it is.</b> Lighter iCloud options. <b>NSUbiquitousKeyValueStore</b> syncs small (~1 MB)
      preferences across a user's devices like a cloud <code>UserDefaults</code>. <b>iCloud Documents</b> (a
      ubiquity container + <code>UIDocument</code> with file coordination) sync files for document-based apps.
      And the big convenience: <b>Core Data</b> (<code>NSPersistentCloudKitContainer</code>) / <b>SwiftData</b>
      can <b>mirror your local store to a private CloudKit database automatically</b> — provided the model is
      CloudKit-compatible (optional/default attributes, no unique constraints).</p>
    <div class="callout tip"><span class="lbl">Choose by data</span> Small prefs → key-value store; files →
      iCloud Documents; your app's model with near-free sync → Core Data/SwiftData + CloudKit; bespoke/large or
      collaborative → raw CloudKit.</div>`,
  },
];
