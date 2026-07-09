// Advanced batch 24 — Foundation essentials (mid/senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED24_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED24_FLASHCARDS: Flashcard[] = [
  {
    id: "fo1",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What does a Date actually represent?",
    answerHtml: `<p>Treating <code>Date</code> as anything more than a raw instant is where date bugs come from —
      it's just an <b>instant in time</b> (seconds relative to a reference date), with no calendar, no time
      zone, and no format baked in. Calendars, components, and formatting are <i>separate</i> concerns layered on
      top, so you never "add a day" by adding 86400 seconds; you ask a <code>Calendar</code>.</p>
      <p>Red flag: doing date math with raw seconds — DST and leap days break it silently. <b>"Date is a naked
      instant — I always route math and display through Calendar and FormatStyle, never raw arithmetic."</b></p>`,
    level: "mid",
  },
  {
    id: "fo2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "How do you do correct date math?",
    answerHtml: `<p>Raw second arithmetic gets DST, leap years, and month lengths wrong, so correct date math always
      goes through a <code>Calendar</code>: <code>calendar.date(byAdding: .day, value: 1, to: date)</code>
      and <code>calendar.dateComponents([.day], from: a, to: b)</code> let the calendar own those rules instead of
      you re-deriving them.</p>
      <p><b>"I never add seconds to a Date for calendar math — Calendar.date(byAdding:) handles DST and leap
      years for me."</b></p>`,
    level: "senior",
  },
  {
    id: "fo3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is DateComponents for?",
    answerHtml: `<p>A calendar-aware bag of fields (year, month, day, hour, weekday…). Use it to <b>build</b> a
      date from parts (<code>calendar.date(from:)</code>), <b>extract</b> parts, or express a duration to add. It
      decouples "what 3pm next Tuesday means" from any absolute instant.</p>`,
    level: "mid",
  },
  {
    id: "fo4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's the modern way to format a Date, and the old pitfall?",
    answerHtml: `<p>The modern path is <code>FormatStyle</code> / <code>.formatted()</code> —
      <code>date.formatted(.dateTime.year().month().day())</code> — because it's locale-aware and value-based, so
      you're not hand-rolling format strings. The old <code>DateFormatter</code> still works but is
      <b>expensive to create</b>.</p>
      <p>Red flag: instantiating a <code>DateFormatter</code> inside a cell/row render — that's a per-frame
      allocation cost in a list. Cache and reuse it (or use <code>.formatted()</code>, which sidesteps the
      problem). <b>"I default to FormatStyle for new code and only reach for a cached DateFormatter when I need
      finer control."</b></p>`,
    level: "senior",
  },
  {
    id: "fo5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you represent and convert units?",
    answerHtml: `<p>Hand-rolled unit math is a bug waiting to happen the moment someone mixes units, so
      <code>Measurement&lt;UnitLength&gt;</code> (and UnitMass, UnitDuration, …) pairs a value with a typed unit
      and converts safely (<code>.converted(to: .miles)</code>) instead. Format with <code>.formatted()</code> /
      <code>MeasurementFormatter</code>, which localizes both the unit and the number.</p>
      <p><b>"I represent quantities as Measurement so the type system stops me from mixing km and miles by
      accident."</b></p>`,
    level: "mid",
  },
  {
    id: "fo6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you format numbers, currency, and percentages now?",
    answerHtml: `<p>Locale-aware formatting matters more than the API surface: format styles —
      <code>n.formatted(.number.precision(.fractionLength(2)))</code>,
      <code>price.formatted(.currency(code: "USD"))</code>, <code>ratio.formatted(.percent)</code> — replace most
      <code>NumberFormatter</code> usage (which is still fine, just cache it) with value-based calls that pick up
      the current locale automatically.</p>
      <p><b>"I reach for FormatStyle first for numbers/currency/percent — it's locale-correct by default."</b></p>`,
    level: "mid",
  },
  {
    id: "fo7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Why does Locale matter so much in formatting?",
    answerHtml: `<p>Locale is what stands between "works on my US test device" and "wrong for most of your users"
      — it drives date order, decimal/grouping separators, currency symbols, units, and translated month/day
      names. Format styles pick up the current locale automatically, so hardcoding "MM/dd/yyyy" or a "$" prefix
      silently breaks for other regions.</p>
      <p>Red flag: shipping only US-formatted dates/currency and never testing another region. <b>"I never
      hardcode a date or currency format — I let FormatStyle read the locale, and I test with a non-US
      region."</b></p>`,
    level: "senior",
  },
  {
    id: "fo8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How should you store/transmit dates?",
    answerHtml: `<p>Store an absolute instant in <b>UTC</b>, serialized as <b>ISO 8601</b>
      (<code>Date.ISO8601FormatStyle</code> / <code>.iso8601</code> decoding strategy), and apply the user's
      <code>TimeZone</code> only at <i>display</i> time — so the stored value never depends on where it was
      written or read.</p>
      <p>Red flag: storing localized strings or local time without an offset — that's unrecoverable once the
      user changes time zone. <b>"I store timestamps as UTC ISO 8601 and only localize at display time."</b></p>`,
    level: "senior",
  },
  {
    id: "fo9",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What did Swift's native Regex add (5.7)?",
    answerHtml: `<p>It moves regex from a stringly-typed runtime risk to a compile-checked one: a first-class
      <code>Regex</code> type with <b>literals</b> and strongly-typed captures.</p>
    <div class="code">let re = /(\\d{4})-(\\d{2})-(\\d{2})/
if let m = "2025-03-14".firstMatch(of: re) {
  let (_, y, mo, d) = m.output   // typed captures
}</div>
    <p><b>"Swift Regex gives me typed captures at compile time — with NSRegularExpression I only find a typo'd
      group index at runtime."</b></p>`,
    level: "senior",
  },
  {
    id: "fo10",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is RegexBuilder?",
    answerHtml: `<p>Complex regex patterns are unmaintainable as one cryptic string, so RegexBuilder is a
      declarative DSL for composing them from readable components (<code>OneOrMore(.digit)</code>,
      <code>Capture { … }</code>, <code>ChoiceOf</code>) with typed output — each piece is reviewable and
      composable on its own.</p>
      <p><b>"For anything past a trivial pattern I reach for RegexBuilder — a wall of regex syntax doesn't
      survive code review."</b></p>`,
    level: "senior",
  },
  {
    id: "fo11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is Data and a caution with it?",
    answerHtml: `<p><code>Data</code> is a value type wrapping raw bytes (with slicing, base64, hashing), but
      <code>Data(contentsOf:)</code> loads the <b>entire</b> file into memory — fine for a small JSON payload,
      a memory spike or crash for a large video or archive.</p>
      <p>Red flag: calling <code>Data(contentsOf:)</code> on a file whose size you haven't bounded. Stream or
      memory-map (<code>.mappedIfSafe</code>) big files instead. <b>"I don't load a file into Data unless I know
      its size is bounded — otherwise I stream or memory-map it."</b></p>`,
    level: "senior",
  },
  {
    id: "fo12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you work with the file system?",
    answerHtml: `<p>String paths are legacy and unsafe under the sandbox, so file system work goes through
      <code>FileManager</code> with <b>URLs</b>: <code>url(for: .documentDirectory, in: .userDomainMask)</code>
      to find directories, then append path components. URLs also carry resource values (size, dates) that a
      raw path string can't.</p>
      <p><b>"I never hardcode a path string — FileManager URLs are the sandbox-safe way to locate app
      directories."</b></p>`,
    level: "senior",
  },
  {
    id: "fo13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Where should different kinds of files live?",
    answerHtml: `<p>Where a file lives determines whether it inflates the user's iCloud backup and whether App
      Review flags it: <b>Documents</b> = user-created data (backed up to iCloud/iTunes); <b>Caches</b> =
      regenerable data (can be purged under storage pressure, not backed up); <b>tmp</b> = short-lived scratch.</p>
      <p>Red flag: putting big regenerable caches in Documents — that's a common App Review / storage complaint.
      Mark large regenerable files <code>isExcludedFromBackup</code>. <b>"I put regenerable data in Caches, not
      Documents, so it doesn't bloat the user's backup."</b></p>`,
    level: "senior",
  },
  {
    id: "fo14",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is AttributedString?",
    answerHtml: `<p>It brings value semantics to rich text — a Swift <b>value type</b> with typed attribute scopes
      (and a SwiftUI scope), so <code>Text</code> can render styled runs without the reference-type aliasing bugs
      <code>NSAttributedString</code> is prone to. It can init from <b>Markdown</b>
      (<code>try AttributedString(markdown: "**bold**")</code>).</p>
      <p><b>"For new rich-text code I use AttributedString — value semantics, and I still drop to
      NSAttributedString only where a UIKit API demands it."</b></p>`,
    level: "mid",
  },
  {
    id: "fo15",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Beyond JSON, what does Foundation serialization offer?",
    answerHtml: `<p><code>Codable</code> is the format-agnostic contract, so the same model type can serialize to
      more than JSON: <code>JSONEncoder</code>/<code>Decoder</code> with strategies (key/date/data) is the common
      path, but <code>PropertyListEncoder</code> (plist) suits config/settings, and both go through the same
      <code>Codable</code> conformance.</p>
      <p><b>"I model with Codable once and pick the encoder — JSON for the network, plist for local config —
      rather than hand-writing serialization per format."</b></p>`,
    level: "mid",
  },
  {
    id: "fo16",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Which handy format styles are easy to miss?",
    answerHtml: `<p>These are the ones that save you from hand-rolling localized strings you'd otherwise get wrong:
      <b>relative dates</b> — <code>date.formatted(.relative(presentation: .named))</code> → "yesterday";
      <b>byte counts</b> — <code>bytes.formatted(.byteCount(style: .file))</code> → "1.2 MB"; <b>lists</b> —
      <code>names.formatted(.list(type: .and))</code> → "A, B, and C".</p>
      <p><b>"Before I string-concatenate a list or byte count by hand, I check whether a FormatStyle already
      does it — usually one does."</b></p>`,
    level: "mid",
  },
];

export const ADVANCED24_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED24_QUIZ: QuizQuestion[] = [
  {
    id: "foz1",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "To add one day to a Date you should:",
    options: ["Add 86400 seconds", "Use Calendar.date(byAdding: .day, value: 1, to:)", "Add 24*3600 as a Double", "Reformat the string"],
    answer: 1,
    explanationHtml: `<p>Only a <code>Calendar</code> handles DST, leap years, and month lengths. Adding 86400
      seconds looks correct and works most days of the year — that's exactly why it's a trap: it silently gives
      the wrong result on DST-transition days.</p>`,
  },
  {
    id: "foz2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "The modern, locale-aware way to display a date is:",
    options: ["A cached DateFormatter only", "date.formatted(.dateTime...)", "String(describing: date)", "Manual MM/dd/yyyy"],
    answer: 1,
    explanationHtml: `<p><code>.formatted()</code> with a <code>FormatStyle</code> is value-based and
      locale-aware. A cached <code>DateFormatter</code> can also be correct, but it's easy to forget the
      "cached" part — a fresh <code>DateFormatter</code> per call is a real perf cost in a list.</p>`,
  },
  {
    id: "foz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "You should store/transmit timestamps as:",
    options: ["A localized string", "UTC in ISO 8601, applying time zone only at display", "Local time without offset", "Seconds in the user's calendar"],
    answer: 1,
    explanationHtml: `<p>Store an absolute UTC instant (ISO 8601) and localize on display. Local time without an
      offset looks fine in dev because the device and the data share a time zone — the bug only shows up once a
      user or server is in a different zone.</p>`,
  },
  {
    id: "foz4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Hardcoding a date pattern like MM/dd/yyyy or a $ currency prefix is wrong because:",
    options: ["It's slower", "It ignores the user's Locale (order, separators, currency, symbols)", "It crashes", "It needs more memory"],
    answer: 1,
    explanationHtml: `<p>Locale drives date order, separators, and currency — not performance or memory, which is
      why "slower" or "crashes" are the wrong instinct. Let format styles localize; hardcoded formats look fine
      on a US test device and break for other regions.</p>`,
  },
  {
    id: "foz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Regenerable cached files should go in:",
    options: ["Documents", "Caches (or tmp), excluded from backup", "the app bundle", "UserDefaults"],
    answer: 1,
    explanationHtml: `<p>Caches is purgeable and not backed up. Documents feels like the "safe" default but is
      backed up to iCloud/iTunes — large regenerable data there inflates the user's backup and draws App
      Review/storage complaints.</p>`,
  },
  {
    id: "foz6",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Swift's native Regex (5.7) advantage over NSRegularExpression is:",
    options: ["It's faster only", "Literals + strongly-typed captures", "It runs on the GPU", "It needs no pattern"],
    answer: 1,
    explanationHtml: `<p>Regex literals and typed captures (plus RegexBuilder) give compile-checked,
      easy-to-extract matching versus stringly-typed NSRegularExpression. It may run faster in some cases, but
      that's a side effect, not the point — the real win is catching capture-group mistakes at compile time.</p>`,
  },
];

export const ADVANCED24_STUDY: StudySection[] = [
  {
    id: "st-adv-55",
    num: "70",
    title: "70 · Dates, numbers & formatting done right",
    html: `<p><b>What it is.</b> A <code>Date</code> is just an instant — calendars, components, and formatting
      are separate. Do date math with a <b>Calendar</b> (<code>date(byAdding:)</code>,
      <code>dateComponents(_:from:to:)</code>), build dates from <code>DateComponents</code>, and store/transmit
      in <b>UTC ISO 8601</b>, applying <code>TimeZone</code> only at display. Format with <b>FormatStyle</b> /
      <code>.formatted()</code> for dates, numbers, currency, and percentages — all <b>locale-aware</b>, so never
      hardcode formats. Use <code>Measurement</code> for typed units and conversions.</p>
    <div class="callout warn"><span class="lbl">Two classic bugs</span> Adding raw seconds for "a day" (DST/leap
      breakage) and hardcoding a US date/currency format. Calendars and locales exist to prevent both.</div>
    <p>In an interview, say: <b>"I treat Date as a bare instant — all calendar math goes through Calendar, all
      display goes through FormatStyle, so locale and DST are never my problem to solve by hand."</b></p>`,
  },
  {
    id: "st-adv-56",
    num: "71",
    title: "71 · Regex, files & text",
    html: `<p><b>What it is.</b> The rest of the Foundation toolbox. Swift's native <b>Regex</b> (literals +
      typed captures) and <b>RegexBuilder</b> replace <code>NSRegularExpression</code> for matching/extraction.
      Work with the file system via <b>FileManager + URLs</b> (not string paths), choosing <b>Documents</b>
      (user data, backed up), <b>Caches</b> (purgeable), or <b>tmp</b> — and mark big regenerable files
      excluded-from-backup. <code>Data</code> wraps bytes (don't load huge files whole — map/stream).
      <b>AttributedString</b> is the value-type rich text (init from Markdown).</p>
    <div class="callout tip"><span class="lbl">Don't miss</span> Relative (<code>.relative</code>), byte-count
      (<code>.byteCount</code>), and list (<code>.list</code>) format styles handle "yesterday", "1.2 MB", and
      "A, B, and C" — localized, no manual string building.</div>
    <p>In an interview, say: <b>"File location is a product decision, not just storage — Documents for what the
      user made, Caches for what I can regenerate, and I keep that boundary strict so backups don't bloat."</b></p>`,
  },
];
