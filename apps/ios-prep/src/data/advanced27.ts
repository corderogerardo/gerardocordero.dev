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
    answerHtml: `<p>Ship to global markets and you pay this cost exactly once or once per locale — which is why
      the split matters. <b>Internationalization (i18n)</b> is the engineering work that makes an app
      <i>localizable</i> — externalizing strings, locale-aware formatting, flexible layouts, RTL support. It's a
      one-time architecture investment. <b>Localization (l10n)</b> is the per-language <i>translation/adaptation</i>
      layered on top — you redo it for every new market.</p>
      <p><b>"I i18n once so the app can be localized cheaply, then localize per market — conflating the two means
      re-engineering every time you add a language."</b></p>`,
    level: "mid",
  },
  {
    id: "in2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are String Catalogs?",
    answerHtml: `<p>Manual <code>Localizable.strings</code>/<code>.stringsdict</code> upkeep drifts out of sync
      with code the moment a string changes, silently — that's the maintenance problem String Catalogs remove.
      <code>.xcstrings</code> files (Xcode 15+) <b>auto-extract</b> localizable strings from your code at build
      time, show translation state per language, and handle plurals/variations in one editor.</p>
      <p><b>"String Catalogs auto-extract at build time and track per-language translation state, so a string
      can never silently drift out of sync with the code — that's why they're the default for new apps."</b></p>`,
    level: "senior",
  },
  {
    id: "in3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does SwiftUI localize text by default?",
    answerHtml: `<p>Localization is opt-out, not opt-in, so every string a developer types gets translation
      coverage by default — that's a deliberate design choice to prevent forgotten strings. A string literal
      passed to <code>Text("Hello")</code> is a <code>LocalizedStringKey</code> — SwiftUI looks it up in your
      catalog automatically. In non-View code use <code>String(localized: "Hello")</code>. Pass a runtime/non-
      localized string via <code>Text(verbatim:)</code> to opt out.</p>
      <p>Red flag: passing user-generated or already-formatted content (a username, a URL) through the default
      <code>Text(_:)</code> path — it can get mangled by catalog lookup. Use <code>Text(verbatim:)</code> for
      anything that isn't meant to be translated.</p>
      <p><b>"Text literals localize by default via LocalizedStringKey — I reach for Text(verbatim:) explicitly
      for anything that shouldn't go through catalog lookup, like usernames or URLs."</b></p>`,
    level: "mid",
  },
  {
    id: "in4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What's the legacy localization mechanism?",
    answerHtml: `<p>Most codebases you'll actually work in weren't started this year, so knowing the legacy path
      matters more than knowing the new one alone. <code>NSLocalizedString("key", comment:)</code> looks up
      <code>Localizable.strings</code> files in per-language <code>.lproj</code> folders. Still valid and common
      in existing apps; String Catalogs can import/replace them. Either way, a <b>comment</b> gives translators
      context.</p>
      <p><b>"NSLocalizedString + Localizable.strings is the legacy mechanism — I'd migrate it into a String
      Catalog opportunistically rather than block on a big-bang rewrite."</b></p>`,
    level: "mid",
  },
  {
    id: "in5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you handle plurals correctly?",
    answerHtml: `<p>Hand-built plurals bake in English grammar (one/many) into code that must also serve languages
      with zero/one/few/many rules — so the fix is structural, not a string tweak. Use a <b>plural variation</b>
      (String Catalog plural, or <code>.stringsdict</code>) keyed on the count so each language supplies its own
      correct form. SwiftUI's inflection and <code>^[\\(count) item](inflect: true)</code> style markup can also
      adapt automatically.</p>
      <p>Red flag: "1 item(s)" or a hardcoded English plural suffix — it's wrong for every language with more
      than two plural categories, and untestable without a linguist.</p>
      <p><b>"I never hand-build plurals — I key a plural variation on the count so each language supplies its
      own zero/one/few/many form."</b></p>`,
    level: "senior",
  },
  {
    id: "in6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Why use positional format specifiers?",
    answerHtml: `<p>Word order changes between languages, so a fixed-order format string forces the translator
      to either mistranslate or ask engineering for a code change — a positional format avoids the round trip.
      Use <code>%1$@</code>, <code>%2$d</code> (positional) rather than bare <code>%@</code>/<code>%d</code>.
      The translation can then place argument 2 before argument 1 without touching code.</p>
      <p>Red flag: shipping bare <code>%@ %@</code> and assuming translators will "just deal with it" — some
      languages genuinely can't produce a correct sentence in that fixed order.</p>
      <p><b>"Any format string with more than one argument gets positional specifiers, %1$@/%2$d, so translators
      can reorder without a code change."</b></p>`,
    level: "senior",
  },
  {
    id: "in7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Why must you avoid concatenating localized fragments?",
    answerHtml: `<p>Concatenation bakes English grammar into the sentence's structure, so no translation string
      can fix word order or agreement after the fact — the sentence itself needs to be one translatable unit.
      <code>"You have " + count + " messages"</code> can't translate correctly, because grammar, word order, and
      agreement differ per language. Use a <b>single format string</b> with placeholders (and plural variants)
      instead.</p>
      <p>Red flag: building sentences from concatenated fragments "for reuse" — it looks DRY in English and is
      untranslatable in most other languages.</p>
      <p><b>"I never concatenate translated fragments — the whole sentence is one format string, so grammar and
      word order stay correct per locale."</b></p>`,
    level: "senior",
  },
  {
    id: "in8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How should dates/numbers/currency be localized?",
    answerHtml: `<p>Hardcoded formats are a US-centric assumption baked into code, and they read as flat wrong to
      most of the world's users — so this is locale data, not a display tweak. Use locale-aware
      <b>FormatStyle</b>/<code>.formatted()</code> (or cached formatters) — never hardcode "MM/dd/yyyy" or a "$"
      prefix. Date order, decimal/grouping separators, and currency symbols all follow the user's locale
      automatically. (See the Foundation essentials topic.)</p>
      <p>Red flag: string-interpolating a "$" or manually building "MM/dd/yyyy" — it's wrong for most locales and
      breaks silently when the app ships internationally.</p>
      <p><b>"Dates, numbers, and currency always go through FormatStyle so they follow the user's locale — I
      never hand-format them."</b></p>`,
    level: "senior",
  },
  {
    id: "in9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does right-to-left (RTL) support require?",
    answerHtml: `<p>RTL isn't a translation, it's a layout-direction flip — so the fix lives in how you describe
      alignment, not in strings. Use <b>leading/trailing</b> (not left/right) for alignment, padding, and
      constraints so the UI <b>mirrors</b> automatically for Arabic/Hebrew. SwiftUI/Auto Layout flip layout by
      <code>layoutDirection</code>; mirror directional images (<code>.flipsForRightToLeftLayoutDirection</code>),
      but don't mirror inherently-directional content like media playback controls.</p>
      <p>Red flag: hardcoding left/right constraints "because it's simpler" — it silently breaks on the first RTL
      locale, and mirroring a play/pause icon that shouldn't flip is just as wrong.</p>
      <p><b>"I build with leading/trailing, never left/right, so RTL mirroring is automatic — and I explicitly
      exempt directional content like media controls from mirroring."</b></p>`,
    level: "senior",
  },
  {
    id: "in10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Region vs language in Locale — what's the difference?",
    answerHtml: `<p>A <code>Locale</code> carries two independent signals, and conflating them mis-formats data for
      real users — an English-speaking expat with a French region setting is a normal, common case, not an edge
      case. The <b>language</b> drives translated UI text; the <b>region</b> drives formatting (date order,
      units, currency, first day of week). Format by region, translate by language — don't conflate the two.</p>
      <p>Red flag: assuming language implies region (e.g. "English" means US date format) — plenty of users read
      English UI while expecting their own region's date/currency conventions.</p>
      <p><b>"Language and region are independent in Locale — I translate strings by language and format dates/
      currency by region, and I never assume one implies the other."</b></p>`,
    level: "senior",
  },
  {
    id: "in11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you localize non-string resources?",
    answerHtml: `<p>Text baked into an image is invisible to your string catalog and translation pipeline, so it
      needs its own per-locale asset instead. Provide per-language variants in <code>.lproj</code> folders (or
      localized entries in asset catalogs) — localized images, audio, or even different layouts. Keep most images
      text-free so they don't need localizing at all; localize only assets that carry language or culturally
      specific content.</p>
      <p><b>"I keep images text-free wherever possible — the ones that must carry text or cultural content get
      per-locale variants in the asset catalog, same as strings."</b></p>`,
    level: "mid",
  },
  {
    id: "in12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do translators get and return strings?",
    answerHtml: `<p>Translators work outside Xcode, often through a vendor's tooling, so the handoff needs an
      industry-standard interchange format rather than a proprietary file. Xcode's <b>Export Localizations</b>
      produces an <code>.xcloc</code> (containing <b>XLIFF</b>) per language; <b>Import Localizations</b> brings
      the translated work back in. With String Catalogs much of this round trip is built into the editor, but
      XLIFF export remains the standard handoff to external translation vendors.</p>
      <p><b>"XLIFF via Export/Import Localizations is the standard vendor handoff — String Catalogs make the
      in-house loop faster but don't replace it for external translation teams."</b></p>`,
    level: "senior",
  },
  {
    id: "in13",
    category: "test",
    categoryLabel: "Testing",
    question: "What is pseudolocalization and why use it?",
    answerHtml: `<p>Real translations don't land until late, so waiting for them to catch layout bugs means finding
      out at the worst possible time — pseudolocalization catches the same bugs on day one. Running the app with
      an artificial locale that <b>lengthens and accents</b> strings (e.g. "[Ŝéttîngŝ……]") surfaces
      <b>hardcoded</b> (non-localized) strings, truncation, and clipping <i>before</i> real translations arrive.
      Xcode's scheme has a pseudolanguage option to test this in previews/runtime.</p>
      <p><b>"I run pseudolocalization early — it catches hardcoded strings and layout clipping before a single
      real translation exists, instead of after."</b></p>`,
    level: "senior",
  },
  {
    id: "in14",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What about App Store localization?",
    answerHtml: `<p>A fully localized app behind an English-only store listing still loses non-English users before
      they ever open it — discoverability is part of internationalization, not separate from it. Localize your
      <b>App Store presence</b> per locale in App Store Connect: name, subtitle, description, keywords, and
      screenshots. Localized metadata measurably improves discoverability and conversion in non-English
      markets.</p>
      <p>Red flag: treating in-app localization as "done" while shipping an English-only store listing — that
      leaves conversion on the table in every market you just localized for.</p>
      <p><b>"Localization doesn't stop at the app binary — I localize the App Store listing itself, because
      that's the first thing a non-English user sees."</b></p>`,
    level: "mid",
  },
  {
    id: "in15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Why do translator comments matter?",
    answerHtml: `<p>Translators don't see your UI, only the string in isolation — an ambiguous key like "Open" (a
      verb? a state?) forces a guess, and a wrong guess ships as a bug in a language you can't proofread. A
      <b>comment</b> (the <code>comment:</code> in <code>String(localized:)</code> / the String Catalog comment
      field) gives context — where it appears, what it means — so translators pick the right word and gender/
      number.</p>
      <p>Red flag: shipping ambiguous keys with no comment "because it's obvious in English" — obviousness in
      English is exactly what doesn't transfer.</p>
      <p><b>"I annotate any non-obvious string with a comment — translators only see the string in isolation, not
      the screen it's on."</b></p>`,
    level: "mid",
  },
  {
    id: "in16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do localization and Dynamic Type interact in layout?",
    answerHtml: `<p>Two axes of text expansion compound — a longer translation plus a larger Dynamic Type size can
      overflow a layout that was fine in English at the default size, so the layout has to survive both at once.
      Translations can be far longer (German often +30%), so layouts must <b>flex</b>: allow wrapping/growth,
      avoid fixed widths/heights and truncation, and test at the largest text size in the longest language.
      Fixed-size buttons/labels are the usual breakage.</p>
      <p>Red flag: testing layout only in English at the default text size — that's the one configuration
      guaranteed not to expose the bug.</p>
      <p><b>"I test the longest language at the largest Dynamic Type size together — that combination is what
      actually breaks fixed-size layouts, not either one alone."</b></p>`,
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
      automatically; use <code>Text(verbatim:)</code> to opt out. "Always shown verbatim" is the tempting wrong
      answer for anyone coming from UIKit's more manual <code>NSLocalizedString</code> flow — SwiftUI made this
      implicit.</p>`,
  },
  {
    id: "inz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "The modern, auto-extracting localization format is:",
    options: ["Localizable.strings only", "String Catalogs (.xcstrings)", "a plist", "JSON"],
    answer: 1,
    explanationHtml: `<p>String Catalogs extract strings at build time and manage translations/plurals in one
      editor — the default for new apps. "Localizable.strings only" is the outdated answer: it still works, but
      it requires manual key upkeep that .xcstrings automates away.</p>`,
  },
  {
    id: "inz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "A sentence like You have 3 messages is best implemented with:",
    options: ["String concatenation", "A single format string with a plural variation", "Three separate strings", "A switch on count in the view"],
    answer: 1,
    explanationHtml: `<p>Plural rules vary by language; use one format string with a plural variation
      (catalog/.stringsdict) keyed on the count — never concatenate or hand-pluralize. A switch on count in the
      view is the same mistake in disguise: it hardcodes English's two-way plural split into Swift instead of
      into a string, and still can't express languages with more plural categories.</p>`,
  },
  {
    id: "inz4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Format strings with two arguments should use:",
    options: ["%@ and %d in fixed order", "Positional specifiers %1$@ / %2$d", "String addition", "No arguments"],
    answer: 1,
    explanationHtml: `<p>Positional specifiers let translations reorder arguments to match each language's word
      order. Fixed-order <code>%@</code>/<code>%d</code> looks fine in English because English word order is the
      one the developer wrote the string in — the bug only surfaces once a translator needs the reverse order.</p>`,
  },
  {
    id: "inz5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "For correct right-to-left mirroring you should use:",
    options: ["left/right constraints", "leading/trailing", "fixed x offsets", "absolute frames"],
    answer: 1,
    explanationHtml: `<p>Leading/trailing flip automatically by layout direction, so the UI mirrors for
      RTL languages; left/right do not. Fixed x offsets and absolute frames fail the same way — they encode a
      physical direction instead of a logical one, so nothing about them can respond to
      <code>layoutDirection</code>.</p>`,
  },
  {
    id: "inz6",
    category: "test",
    categoryLabel: "Testing",
    question: "Pseudolocalization helps you catch, before real translations:",
    options: ["Memory leaks", "Hardcoded strings and truncation/clipping", "Network errors", "Retain cycles"],
    answer: 1,
    explanationHtml: `<p>Lengthened, accented pseudo-strings reveal non-localized text and layouts that clip or
      truncate under longer translations — the whole point is catching these before real translations exist,
      not after a translator files the bug.</p>`,
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
      placeholders + a plural rule — not pieces glued together in code.</div>
    <p><i>Say this:</i> <b>"I treat every user-facing sentence as one translatable unit with placeholders and a
      plural rule — never fragments I concatenate in code."</b></p>`,
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
      RTL locale surfaces almost every layout bug before users do.</div>
    <p><i>Say this:</i> <b>"I test the longest language, the largest Dynamic Type size, and an RTL locale together
      — that combination catches almost every layout bug before a translator or user finds it."</b></p>`,
  },
];
