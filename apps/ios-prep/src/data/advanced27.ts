// Advanced batch 27 — Internationalization & localization (mid/senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED27_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED27_FLASHCARDS: Flashcard[] = [
  {
    id: "in1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Internationalization vs localization?",
    answerHtml: `<p><b>Internationalization (i18n)</b> is the engineering work that makes an app <i>localizable</i>
      — externalizing strings, using locale-aware formatting, flexible layouts, RTL support. <b>Localization
      (l10n)</b> is the per-language <i>translation/adaptation</i> on top. You i18n once; you localize per
      locale.</p>`,
    level: "mid",
  },
  {
    id: "in2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are String Catalogs?",
    answerHtml: `<p><code>.xcstrings</code> files (Xcode 15+) that <b>auto-extract</b> localizable strings from
      your code at build time, show translation state per language, and handle plurals/variations in one place —
      replacing manual <code>Localizable.strings</code>/<code>.stringsdict</code> upkeep. The modern default for
      new apps.</p>`,
    level: "senior",
  },
  {
    id: "in3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does SwiftUI localize text by default?",
    answerHtml: `<p>A string literal passed to <code>Text("Hello")</code> is a
      <code>LocalizedStringKey</code> — SwiftUI looks it up in your catalog automatically. In non-View code use
      <code>String(localized: "Hello")</code>. Pass a runtime/non-localized string via
      <code>Text(verbatim:)</code> to opt out.</p>`,
    level: "mid",
  },
  {
    id: "in4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What's the legacy localization mechanism?",
    answerHtml: `<p><code>NSLocalizedString("key", comment:)</code> looking up <code>Localizable.strings</code>
      files in per-language <code>.lproj</code> folders. Still valid and common in existing apps; String Catalogs
      can import/replace them. Either way, a <b>comment</b> gives translators context.</p>`,
    level: "mid",
  },
  {
    id: "in5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you handle plurals correctly?",
    answerHtml: `<p>Never build "1 item(s)" by hand — languages have multiple plural rules (zero/one/few/many).
      Use a <b>plural variation</b> (String Catalog plural, or <code>.stringsdict</code>) keyed on the count so
      each language supplies the right form. SwiftUI's inflection and <code>^[\\(count) item](inflect: true)</code>
      style markup can also adapt automatically.</p>`,
    level: "senior",
  },
  {
    id: "in6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Why use positional format specifiers?",
    answerHtml: `<p>Word order changes between languages, so a format with two args must let translators
      <b>reorder</b> them: use <code>%1$@</code>, <code>%2$d</code> (positional) rather than bare
      <code>%@</code>/<code>%d</code>. The translation can then place argument 2 before argument 1 without code
      changes.</p>`,
    level: "senior",
  },
  {
    id: "in7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Why must you avoid concatenating localized fragments?",
    answerHtml: `<p>Grammar, word order, and agreement differ per language, so
      <code>"You have " + count + " messages"</code> can't translate correctly. Use a <b>single format string</b>
      with placeholders (and plural variants) so the whole sentence is one translatable unit.</p>`,
    level: "senior",
  },
  {
    id: "in8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How should dates/numbers/currency be localized?",
    answerHtml: `<p>With locale-aware <b>FormatStyle</b>/<code>.formatted()</code> (or cached formatters) — never
      hardcode "MM/dd/yyyy" or a "$" prefix. Date order, decimal/grouping separators, and currency symbols all
      follow the user's locale automatically. (See the Foundation essentials topic.)</p>`,
    level: "senior",
  },
  {
    id: "in9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does right-to-left (RTL) support require?",
    answerHtml: `<p>Use <b>leading/trailing</b> (not left/right) for alignment, padding, and constraints so the
      UI <b>mirrors</b> automatically for Arabic/Hebrew. SwiftUI/Auto Layout flip layout by
      <code>layoutDirection</code>; mirror directional images
      (<code>.flipsForRightToLeftLayoutDirection</code>), but don't mirror inherently-directional content like
      media controls.</p>`,
    level: "senior",
  },
  {
    id: "in10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Region vs language in Locale — what's the difference?",
    answerHtml: `<p>A <code>Locale</code> carries both: the <b>language</b> drives translated UI text, while the
      <b>region</b> drives formatting (date order, units, currency, first day of week). A user can read English
      but use a French region — so format by region and translate by language; don't conflate them.</p>`,
    level: "senior",
  },
  {
    id: "in11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you localize non-string resources?",
    answerHtml: `<p>Provide per-language variants in <code>.lproj</code> folders (or localized entries in asset
      catalogs) — localized images, audio, or even different layouts. Keep most images text-free so they don't
      need localizing; localize only assets that contain language or culturally-specific content.</p>`,
    level: "mid",
  },
  {
    id: "in12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do translators get and return strings?",
    answerHtml: `<p>Xcode's <b>Export Localizations</b> produces an <code>.xcloc</code> (containing industry-
      standard <b>XLIFF</b>) per language for translators; <b>Import Localizations</b> brings their work back. With
      String Catalogs much of this is built into the editor, but XLIFF export is the standard handoff to external
      translation vendors.</p>`,
    level: "senior",
  },
  {
    id: "in13",
    category: "test",
    categoryLabel: "Testing",
    question: "What is pseudolocalization and why use it?",
    answerHtml: `<p>Running the app with an artificial locale that <b>lengthens and accents</b> strings (e.g.
      "[Ŝéttîngŝ……]"). It surfaces <b>hardcoded</b> (non-localized) strings, truncation, and clipping <i>before</i>
      real translations arrive. Xcode's scheme has a pseudolanguage option to test this in previews/runtime.</p>`,
    level: "senior",
  },
  {
    id: "in14",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What about App Store localization?",
    answerHtml: `<p>Beyond the app, localize your <b>App Store presence</b> per locale in App Store Connect: name,
      subtitle, description, keywords, and screenshots. Localized metadata significantly improves discoverability
      and conversion in non-English markets — it's part of shipping internationally, not an afterthought.</p>`,
    level: "mid",
  },
  {
    id: "in15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Why do translator comments matter?",
    answerHtml: `<p>A bare key like "Open" is ambiguous (a verb? a state?). A <b>comment</b> (the
      <code>comment:</code> in <code>String(localized:)</code> / the String Catalog comment field) gives context —
      where it appears, what it means — so translators choose the right word and gender/number. Always annotate
      non-obvious strings.</p>`,
    level: "mid",
  },
  {
    id: "in16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do localization and Dynamic Type interact in layout?",
    answerHtml: `<p>Translations can be far longer (German often +30%) and combine with large Dynamic Type sizes,
      so layouts must <b>flex</b>: allow wrapping/growth, avoid fixed widths/heights and truncation, and test at
      the largest text size in the longest language. Fixed-size buttons/labels are the usual breakage.</p>`,
    level: "senior",
  },
];

export const ADVANCED27_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED27_QUIZ: QuizQuestion[] = [
  {
    id: "inz1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "In SwiftUI, a string literal passed to Text(...) is:",
    options: ["Always shown verbatim", "A LocalizedStringKey looked up for translation", "An error", "Only English"],
    answer: 1,
    explanationHtml: `<p>String literals to <code>Text</code> are <code>LocalizedStringKey</code>s and localize
      automatically; use <code>Text(verbatim:)</code> to opt out.</p>`,
  },
  {
    id: "inz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "The modern, auto-extracting localization format is:",
    options: ["Localizable.strings only", "String Catalogs (.xcstrings)", "a plist", "JSON"],
    answer: 1,
    explanationHtml: `<p>String Catalogs extract strings at build time and manage translations/plurals in one
      editor — the default for new apps.</p>`,
  },
  {
    id: "inz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "A sentence like You have 3 messages is best implemented with:",
    options: ["String concatenation", "A single format string with a plural variation", "Three separate strings", "A switch on count in the view"],
    answer: 1,
    explanationHtml: `<p>Plural rules vary by language; use one format string with a plural variation
      (catalog/.stringsdict) keyed on the count — never concatenate or hand-pluralize.</p>`,
  },
  {
    id: "inz4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Format strings with two arguments should use:",
    options: ["%@ and %d in fixed order", "Positional specifiers %1$@ / %2$d", "String addition", "No arguments"],
    answer: 1,
    explanationHtml: `<p>Positional specifiers let translations reorder arguments to match each language's word
      order.</p>`,
  },
  {
    id: "inz5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "For correct right-to-left mirroring you should use:",
    options: ["left/right constraints", "leading/trailing", "fixed x offsets", "absolute frames"],
    answer: 1,
    explanationHtml: `<p>Leading/trailing flip automatically by layout direction, so the UI mirrors for
      RTL languages; left/right do not.</p>`,
  },
  {
    id: "inz6",
    category: "test",
    categoryLabel: "Testing",
    question: "Pseudolocalization helps you catch, before real translations:",
    options: ["Memory leaks", "Hardcoded strings and truncation/clipping", "Network errors", "Retain cycles"],
    answer: 1,
    explanationHtml: `<p>Lengthened, accented pseudo-strings reveal non-localized text and layouts that clip or
      truncate under longer translations.</p>`,
  },
];

export const ADVANCED27_STUDY: StudySection[] = [
  {
    id: "st-adv-61",
    num: "76",
    title: "76 · Internationalization: making the app localizable",
    html: `<p><b>What it is.</b> The engineering that lets an app be translated. Externalize strings —
      <code>Text("…")</code> (a <code>LocalizedStringKey</code>) and <code>String(localized:)</code> feeding a
      <b>String Catalog</b> (<code>.xcstrings</code>, auto-extracted) — with <b>comments</b> for translators.
      Handle <b>plurals</b> via variations (never concatenate "1 item(s)"), use <b>positional</b> format
      specifiers (<code>%1$@</code>) and <b>full format strings</b> (not concatenated fragments), and format
      dates/numbers/currency with locale-aware <b>FormatStyle</b>.</p>
    <div class="callout warn"><span class="lbl">Rule</span> A localizable string is a whole sentence with
      placeholders + a plural rule — not pieces glued together in code.</div>`,
  },
  {
    id: "st-adv-62",
    num: "77",
    title: "77 · Localization workflow & RTL",
    html: `<p><b>What it is.</b> Shipping in many languages. Distinguish <b>language</b> (translated UI) from
      <b>region</b> (formatting) in <code>Locale</code>. Support <b>RTL</b> by using leading/trailing (auto-mirror)
      and flipping directional images. Hand off to translators via <b>Export/Import Localizations</b> (XLIFF /
      <code>.xcloc</code>), or work in the String Catalog editor. Test early with <b>pseudolocalization</b> to
      catch hardcoded strings and truncation, and remember translations + Dynamic Type need <b>flexible
      layouts</b>. Don't forget localized <b>App Store metadata</b>.</p>
    <div class="callout tip"><span class="lbl">Test matrix</span> Longest language × largest Dynamic Type × an
      RTL locale surfaces almost every layout bug before users do.</div>`,
  },
];
