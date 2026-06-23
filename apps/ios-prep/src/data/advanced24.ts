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
    answerHtml: `<p>Just an <b>instant in time</b> (seconds relative to a reference date) — no calendar, no time
      zone, no format. Calendars, components, and formatting are <i>separate</i> concerns layered on top. So you
      never "add a day" by adding 86400 seconds; you ask a <code>Calendar</code>.</p>`,
    level: "mid",
  },
  {
    id: "fo2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "How do you do correct date math?",
    answerHtml: `<p>Through a <code>Calendar</code>: <code>calendar.date(byAdding: .day, value: 1, to: date)</code>
      and <code>calendar.dateComponents([.day], from: a, to: b)</code>. The calendar handles DST, leap years, and
      month lengths — raw second arithmetic gets all of those wrong.</p>`,
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
    answerHtml: `<p>Use <code>FormatStyle</code> / <code>.formatted()</code>:
      <code>date.formatted(.dateTime.year().month().day())</code> — locale-aware and value-based. The old
      <code>DateFormatter</code> still works but is <b>expensive to create</b>; never make one per cell — cache
      and reuse it.</p>`,
    level: "senior",
  },
  {
    id: "fo5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you represent and convert units?",
    answerHtml: `<p><code>Measurement&lt;UnitLength&gt;</code> (and UnitMass, UnitDuration, …) pairs a value with
      a typed unit and converts safely (<code>.converted(to: .miles)</code>). Format with <code>.formatted()</code>
      / <code>MeasurementFormatter</code>, which localizes the unit and number. Don't hand-roll km↔mi math.</p>`,
    level: "mid",
  },
  {
    id: "fo6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you format numbers, currency, and percentages now?",
    answerHtml: `<p>Format styles: <code>n.formatted(.number.precision(.fractionLength(2)))</code>,
      <code>price.formatted(.currency(code: "USD"))</code>, <code>ratio.formatted(.percent)</code>. They're
      locale-aware and replace most <code>NumberFormatter</code> usage (which is still fine, just cache it).</p>`,
    level: "mid",
  },
  {
    id: "fo7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Why does Locale matter so much in formatting?",
    answerHtml: `<p>It drives date order, decimal/grouping separators, currency symbols, units, and translated
      month/day names. Format styles use the current locale automatically — so <b>never hardcode</b> formats like
      "MM/dd/yyyy" or a "$" prefix; let the locale decide, and test with a non-US region.</p>`,
    level: "senior",
  },
  {
    id: "fo8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How should you store/transmit dates?",
    answerHtml: `<p>As an absolute instant in <b>UTC</b>, serialized as <b>ISO 8601</b>
      (<code>Date.ISO8601FormatStyle</code> / <code>.iso8601</code> decoding strategy). Apply the user's
      <code>TimeZone</code> only at <i>display</i> time. Storing localized strings or local-time without an offset
      is a classic bug source.</p>`,
    level: "senior",
  },
  {
    id: "fo9",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What did Swift's native Regex add (5.7)?",
    answerHtml: `<p>A first-class <code>Regex</code> type with <b>literals</b> and strongly-typed captures.</p>
    <div class="code">let re = /(\\d{4})-(\\d{2})-(\\d{2})/
if let m = "2025-03-14".firstMatch(of: re) {
  let (_, y, mo, d) = m.output   // typed captures
}</div>
    <p>Far better than stringly-typed <code>NSRegularExpression</code> for matching and extraction.</p>`,
    level: "senior",
  },
  {
    id: "fo10",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is RegexBuilder?",
    answerHtml: `<p>A declarative DSL for building regexes from readable components
      (<code>OneOrMore(.digit)</code>, <code>Capture { … }</code>, <code>ChoiceOf</code>) with typed output —
      easier to read and maintain than a cryptic pattern string, and it composes. Great for complex parsing.</p>`,
    level: "senior",
  },
  {
    id: "fo11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is Data and a caution with it?",
    answerHtml: `<p><code>Data</code> is a value type wrapping raw bytes (with slicing, base64, hashing). Handy,
      but <code>Data(contentsOf:)</code> loads the <b>entire</b> file into memory — bad for large files. Stream or
      memory-map (<code>.mappedIfSafe</code>) big files instead of materializing them all at once.</p>`,
    level: "senior",
  },
  {
    id: "fo12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you work with the file system?",
    answerHtml: `<p>Use <code>FileManager</code> with <b>URLs</b>, not string paths:
      <code>url(for: .documentDirectory, in: .userDomainMask)</code> to find directories, then append path
      components. URLs carry resource values (size, dates) and are the correct, sandbox-safe API; string paths are
      legacy.</p>`,
    level: "senior",
  },
  {
    id: "fo13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Where should different kinds of files live?",
    answerHtml: `<p><b>Documents</b> = user-created data (backed up to iCloud/iTunes); <b>Caches</b> = regenerable
      data (can be purged under storage pressure, not backed up); <b>tmp</b> = short-lived scratch. Mark large
      regenerable files <code>isExcludedFromBackup</code> — putting big caches in Documents is a common App Review
      / storage complaint.</p>`,
    level: "senior",
  },
  {
    id: "fo14",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is AttributedString?",
    answerHtml: `<p>A Swift <b>value type</b> for rich text with typed attribute scopes (and a SwiftUI scope), so
      <code>Text</code> can render styled runs. It can init from <b>Markdown</b>
      (<code>try AttributedString(markdown: "**bold**")</code>). It's the modern, value-semantics replacement for
      <code>NSAttributedString</code> (still used for some UIKit APIs).</p>`,
    level: "mid",
  },
  {
    id: "fo15",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Beyond JSON, what does Foundation serialization offer?",
    answerHtml: `<p><code>JSONEncoder</code>/<code>Decoder</code> with strategies (key/date/data) is the common
      path, but <code>PropertyListEncoder</code> (plist) suits config/settings, and <code>Codable</code> works
      with both. For interop you can drop to <code>JSONSerialization</code>, but prefer typed
      <code>Codable</code>.</p>`,
    level: "mid",
  },
  {
    id: "fo16",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Which handy format styles are easy to miss?",
    answerHtml: `<p><b>Relative dates</b>: <code>date.formatted(.relative(presentation: .named))</code> →
      "yesterday". <b>Byte counts</b>: <code>bytes.formatted(.byteCount(style: .file))</code> → "1.2 MB".
      <b>Lists</b>: <code>names.formatted(.list(type: .and))</code> → "A, B, and C". All localized, no manual
      string building.</p>`,
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
    explanationHtml: `<p>Only a <code>Calendar</code> handles DST, leap years, and month lengths; raw second
      arithmetic gets edge cases wrong.</p>`,
  },
  {
    id: "foz2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "The modern, locale-aware way to display a date is:",
    options: ["A cached DateFormatter only", "date.formatted(.dateTime...)", "String(describing: date)", "Manual MM/dd/yyyy"],
    answer: 1,
    explanationHtml: `<p><code>.formatted()</code> with a <code>FormatStyle</code> is value-based and
      locale-aware; <code>DateFormatter</code> still works but is expensive to create (cache it).</p>`,
  },
  {
    id: "foz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "You should store/transmit timestamps as:",
    options: ["A localized string", "UTC in ISO 8601, applying time zone only at display", "Local time without offset", "Seconds in the user's calendar"],
    answer: 1,
    explanationHtml: `<p>Store an absolute UTC instant (ISO 8601) and localize on display — local-time strings
      without an offset are a classic bug.</p>`,
  },
  {
    id: "foz4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Hardcoding a date pattern like MM/dd/yyyy or a $ currency prefix is wrong because:",
    options: ["It's slower", "It ignores the user's Locale (order, separators, currency, symbols)", "It crashes", "It needs more memory"],
    answer: 1,
    explanationHtml: `<p>Locale drives date order, separators, and currency. Let format styles localize;
      hardcoded formats break for other regions.</p>`,
  },
  {
    id: "foz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Regenerable cached files should go in:",
    options: ["Documents", "Caches (or tmp), excluded from backup", "the app bundle", "UserDefaults"],
    answer: 1,
    explanationHtml: `<p>Caches is purgeable and not backed up; large regenerable data in Documents inflates
      backups and draws App Review/storage complaints.</p>`,
  },
  {
    id: "foz6",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Swift's native Regex (5.7) advantage over NSRegularExpression is:",
    options: ["It's faster only", "Literals + strongly-typed captures", "It runs on the GPU", "It needs no pattern"],
    answer: 1,
    explanationHtml: `<p>Regex literals and typed captures (plus RegexBuilder) give compile-checked,
      easy-to-extract matching versus stringly-typed NSRegularExpression.</p>`,
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
      breakage) and hardcoding a US date/currency format. Calendars and locales exist to prevent both.</div>`,
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
      "A, B, and C" — localized, no manual string building.</div>`,
  },
];
