// Advanced batch 8 — Accessibility deep-dive (mid/senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED8_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED8_FLASHCARDS: Flashcard[] = [
  {
    id: "k1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are the core VoiceOver properties of an accessible element?",
    answerHtml: `<p><b>Label</b> (what it is — concise noun), <b>value</b> (its current state, e.g. a slider's
      number), <b>hint</b> (what happens on activate — optional), and <b>traits</b> (button, header, selected…).
      Set them with <code>.accessibilityLabel</code>, <code>.accessibilityValue</code>,
      <code>.accessibilityHint</code>, <code>.accessibilityAddTraits</code>. Don't put the control type in the
      label — the trait says "button".</p>`,
    level: "mid",
  },
  {
    id: "k2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you group or hide elements for VoiceOver?",
    answerHtml: `<p>Combine a composite view into one element with
      <code>.accessibilityElement(children: .combine)</code> (or <code>.ignore</code> + a custom label), and hide
      purely decorative views with <code>.accessibilityHidden(true)</code>. Good grouping turns a noisy row of
      sub-views into a single, meaningful swipe stop.</p>`,
    level: "senior",
  },
  {
    id: "k3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you expose extra actions to VoiceOver?",
    answerHtml: `<p><code>.accessibilityAction(named:)</code> adds named custom actions a user reaches via the
      rotor (e.g. "Delete", "Pin" on a list row) without needing swipe gestures they can't perform. It surfaces
      hidden gestures (swipe-to-delete) to assistive tech.</p>`,
    level: "senior",
  },
  {
    id: "k4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is an accessibility rotor?",
    answerHtml: `<p>A VoiceOver navigation mode that jumps between items of a kind — headings, links, or your
      <b>custom rotor</b> (<code>.accessibilityRotor("Unread") { … }</code>) that lets users skip straight to,
      say, unread messages. Rotors make long screens navigable instead of swiping through everything.</p>`,
    level: "senior",
  },
  {
    id: "k5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you move VoiceOver focus programmatically?",
    answerHtml: `<p>With <code>@AccessibilityFocusState</code> bound to a view via
      <code>.accessibilityFocused($flag)</code>; setting the state moves VoiceOver focus there (e.g. focus an
      error message after a failed submit). It's the accessibility analog of <code>@FocusState</code> for the
      keyboard.</p>`,
    level: "senior",
  },
  {
    id: "k6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you properly support Dynamic Type?",
    answerHtml: `<p>Use <b>semantic fonts</b> (<code>.body</code>, <code>.headline</code>) so text scales with
      the user's setting; size custom values with <code>@ScaledMetric</code>; avoid fixed-height frames that clip
      large text (let it wrap/grow); and test at the largest accessibility sizes. For very large sizes, consider
      reflowing layout (e.g. HStack → VStack via <code>dynamicTypeSize</code>).</p>`,
    level: "mid",
  },
  {
    id: "k7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Why do accessibility traits like .isHeader matter?",
    answerHtml: `<p>Traits tell assistive tech how to treat an element. <code>.isHeader</code> lets VoiceOver
      users jump between sections via the Headings rotor; <code>.isButton</code>/<code>.isSelected</code>/
      <code>.updatesFrequently</code> communicate role and state. Marking section titles as headers is one of the
      highest-value, lowest-effort accessibility wins.</p>`,
    level: "senior",
  },
  {
    id: "k8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does accessibilityRepresentation do?",
    answerHtml: `<p>It lets a fully custom control <b>borrow the accessibility</b> of a standard one:
      <code>.accessibilityRepresentation { Slider(...) }</code> tells assistive tech "treat my custom dial as this
      slider", so you get correct traits, value, and adjustable behavior for free instead of hand-rolling
      them.</p>`,
    level: "architect",
  },
  {
    id: "k9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you respect Reduce Motion?",
    answerHtml: `<p>Read <code>@Environment(\\.accessibilityReduceMotion)</code> and swap big motion (parallax,
      large transitions, autoplay) for a cross-fade or no animation when it's on. Motion can trigger nausea/
      vestibular issues, and App Review/HIG expect you to honor the setting.</p>`,
    level: "senior",
  },
  {
    id: "k10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Which other accessibility settings should UI react to?",
    answerHtml: `<p><b>Reduce Transparency</b> (use solid backgrounds instead of blur),
      <b>Increase Contrast</b> (stronger borders/colors), <b>Differentiate Without Color</b> (add shapes/labels,
      not just color to convey state), and <b>Bold Text</b>. All are readable via <code>@Environment</code> values
      (e.g. <code>accessibilityReduceTransparency</code>, <code>colorSchemeContrast</code>).</p>`,
    level: "senior",
  },
  {
    id: "k11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are the rules on color and contrast?",
    answerHtml: `<p>Never rely on <b>color alone</b> to convey meaning (add text, icons, or shapes — e.g. for
      error/success). Maintain sufficient text contrast (WCAG targets ~4.5:1 for body text, ~3:1 for large), and
      verify in both light and dark mode and with Increase Contrast on. The Accessibility Inspector flags
      contrast issues.</p>`,
    level: "senior",
  },
  {
    id: "k12",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What's the minimum touch-target size?",
    answerHtml: `<p>About <b>44×44 points</b> (Apple HIG). Small tap areas fail motor-accessibility and frustrate
      everyone; expand hit areas with padding or <code>contentShape</code>, and don't pack interactive elements
      too densely.</p>`,
    level: "mid",
  },
  {
    id: "k13",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you handle images and decorative content?",
    answerHtml: `<p>Give <b>meaningful</b> images an <code>accessibilityLabel</code> describing the content/intent
      (not "image"); mark <b>decorative</b> images as hidden (<code>Image(decorative:)</code> or
      <code>.accessibilityHidden(true)</code>) so VoiceOver skips them. Icon-only buttons especially need a label
      — otherwise they read as nothing.</p>`,
    level: "mid",
  },
  {
    id: "k14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you make a chart accessible?",
    answerHtml: `<p>Provide an <b>Audio Graph</b>: describe the data with
      <code>AXChartDescriptor</code> (axes + data series) so VoiceOver users can hear the trend and read values,
      and give the chart a summary label. Swift Charts integrates accessibility, but custom charts need explicit
      descriptors — data visualizations are otherwise invisible to VoiceOver.</p>`,
    level: "architect",
  },
  {
    id: "k15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What drives Voice Control, and how do you tune it?",
    answerHtml: `<p>Voice Control lets users say "tap <i>label</i>". It uses your accessibility <b>label</b>, so
      clear labels make controls speakable. Add alternates with
      <code>.accessibilityInputLabels(["Send", "Submit"])</code> when the visible label differs from what users
      would say. Good labels serve VoiceOver and Voice Control at once.</p>`,
    level: "senior",
  },
  {
    id: "k16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What should you check for Switch Control and navigation order?",
    answerHtml: `<p>Switch Control steps through elements sequentially, so a <b>logical order</b> and proper
      grouping matter even more. Use <code>.accessibilitySortPriority</code> to fix out-of-order reading, group
      related controls, and ensure every interactive element is reachable and actionable without gestures.</p>`,
    level: "senior",
  },
  {
    id: "k17",
    category: "test",
    categoryLabel: "Testing",
    question: "What tools verify accessibility?",
    answerHtml: `<p>The <b>Accessibility Inspector</b> (inspect labels/traits, run an <b>Audit</b> that flags
      missing labels, low contrast, small targets, clipped text) and Xcode's <b>Accessibility preview</b>. Also
      just turn <b>VoiceOver</b> on and use the app one-handed with your eyes closed — nothing replaces real
      usage.</p>`,
    level: "senior",
  },
  {
    id: "k18",
    category: "test",
    categoryLabel: "Testing",
    question: "accessibilityIdentifier vs accessibilityLabel in UI tests?",
    answerHtml: `<p><b>Label</b> is user-facing text VoiceOver reads and can be localized/changed.
      <b>Identifier</b> (<code>.accessibilityIdentifier</code>) is a stable, non-localized hook for XCUITest that
      VoiceOver ignores. Query UI tests by identifier so tests don't break when copy or locale changes — and so
      you never weaken real accessibility labels to satisfy a test.</p>`,
    level: "senior",
  },
];

export const ADVANCED8_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED8_QUIZ: QuizQuestion[] = [
  {
    id: "kz1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "An icon-only button with no accessibilityLabel reads to VoiceOver as:",
    options: ["Its SF Symbol name", "Essentially nothing usable", "The screen title", "Button"],
    answer: 1,
    explanationHtml: `<p>Without a label there's no meaningful text — icon-only controls must set
      <code>.accessibilityLabel</code>. The trait (button) conveys the type; the label conveys the purpose.</p>`,
  },
  {
    id: "kz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Marking section titles with the .isHeader trait primarily helps users:",
    options: ["See bigger text", "Jump between sections via the Headings rotor", "Get haptics", "Skip the app"],
    answer: 1,
    explanationHtml: `<p>Headers enable the VoiceOver Headings rotor — a high-value, low-effort way to make long
      screens navigable.</p>`,
  },
  {
    id: "kz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To support Dynamic Type, you should mainly:",
    options: ["Hard-code point sizes", "Use semantic fonts and avoid clipping frames", "Disable scaling", "Only support the default size"],
    answer: 1,
    explanationHtml: `<p>Semantic fonts scale automatically; size custom metrics with <code>@ScaledMetric</code>
      and let text grow/wrap instead of clipping.</p>`,
  },
  {
    id: "kz4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Conveying success/error with color only is a problem because:",
    options: ["It's slower to render", "It fails color-blind users / Differentiate Without Color", "It breaks dark mode", "It needs more memory"],
    answer: 1,
    explanationHtml: `<p>Never rely on color alone — add text, icons, or shape so meaning survives color-vision
      differences and the Differentiate Without Color setting.</p>`,
  },
  {
    id: "kz5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "The minimum recommended touch-target size is about:",
    options: ["20×20 pt", "44×44 pt", "10×10 pt", "100×100 pt"],
    answer: 1,
    explanationHtml: `<p>~44×44 points (HIG). Expand small controls with padding or
      <code>contentShape</code>.</p>`,
  },
  {
    id: "kz6",
    category: "test",
    categoryLabel: "Testing",
    question: "In XCUITest you should query elements by:",
    options: ["accessibilityLabel (localized)", "accessibilityIdentifier (stable, non-localized)", "frame coordinates", "view tag"],
    answer: 1,
    explanationHtml: `<p>Identifiers are stable test hooks VoiceOver ignores; querying by label breaks on copy
      or locale changes and tempts you to weaken real labels.</p>`,
  },
];

export const ADVANCED8_STUDY: StudySection[] = [
  {
    id: "st-adv-23",
    num: "38",
    title: "38 · Accessibility: VoiceOver, traits & navigation",
    html: `<p><b>What it is.</b> Making the app usable with VoiceOver. Give each element a concise <b>label</b>,
      a <b>value</b> for state, optional <b>hint</b>, and the right <b>traits</b> (<code>.isButton</code>,
      <code>.isHeader</code>, <code>.isSelected</code>). <b>Group</b> composite views
      (<code>accessibilityElement(children: .combine)</code>) and <b>hide</b> decoration so each swipe stop is
      meaningful.</p>
    <p>Go further with <b>custom actions</b> (surface swipe gestures), <b>rotors</b> (jump to headings/links/your
      custom category), programmatic focus (<code>@AccessibilityFocusState</code>), and
      <code>accessibilityRepresentation</code> to give custom controls standard semantics. Clear labels also power
      <b>Voice Control</b> ("tap <i>label</i>") and a logical order serves <b>Switch Control</b>.</p>
    <div class="callout tip"><span class="lbl">Highest-value wins</span> Label icon-only buttons, mark section
      titles as headers, and group rows. Then turn VoiceOver on and actually use the app.</div>`,
  },
  {
    id: "st-adv-24",
    num: "39",
    title: "39 · Inclusive design: Dynamic Type, motion, color & testing",
    html: `<p><b>What it is.</b> The settings beyond VoiceOver. Support <b>Dynamic Type</b> (semantic fonts,
      <code>@ScaledMetric</code>, no clipping, reflow at huge sizes). Honor <b>Reduce Motion</b>
      (<code>@Environment(\\.accessibilityReduceMotion)</code> → cross-fade instead of parallax), <b>Reduce
      Transparency</b>, <b>Increase Contrast</b>, and <b>Differentiate Without Color</b>. Keep text contrast
      adequate (~4.5:1 body) and touch targets ~44pt. Make charts accessible with <b>Audio Graphs</b>
      (<code>AXChartDescriptor</code>).</p>
    <p><b>Test</b> with the <b>Accessibility Inspector</b> and its <b>Audit</b> (flags missing labels, low
      contrast, small targets, clipped text), the SwiftUI accessibility preview, and real VoiceOver use. In UI
      tests, query by <b>accessibilityIdentifier</b>, not by label.</p>
    <div class="callout warn"><span class="lbl">Why it's not optional</span> Accessibility is a legal/enterprise
      requirement and an App Review consideration — and the same work (labels, scaling, contrast) makes the app
      better for everyone.</div>`,
  },
];
