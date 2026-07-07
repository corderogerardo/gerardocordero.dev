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
    answerHtml: `<p>VoiceOver can't see your UI — it only announces what you explicitly hand it, so every element
      needs four pieces of metadata or it reads as silence. <b>Label</b> is the concise noun for what it is,
      <b>value</b> is its current state (e.g. a slider's number), <b>hint</b> is what happens on activate
      (optional), and <b>traits</b> say its role (button, header, selected…). Set them with
      <code>.accessibilityLabel</code>, <code>.accessibilityValue</code>, <code>.accessibilityHint</code>,
      <code>.accessibilityAddTraits</code>.</p>
      <p>Red flag: baking the control type into the label ("Delete button") — the trait already says "button",
      so VoiceOver announces it twice. <b>I give every element a label, value, hint, and trait, and let the trait
      carry the role so the label stays just the content.</b></p>`,
    level: "mid",
  },
  {
    id: "k2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you group or hide elements for VoiceOver?",
    answerHtml: `<p>A composite view exposed to VoiceOver one sub-view at a time turns a single swipe into five
      meaningless stops — grouping is how you control what the user actually hears. Combine it into one element
      with <code>.accessibilityElement(children: .combine)</code> (or <code>.ignore</code> plus a custom label),
      and hide purely decorative views with <code>.accessibilityHidden(true)</code>.</p>
      <p><b>I treat VoiceOver navigation as its own information architecture — I group and hide until each swipe
      stop is one meaningful unit, not a debug view of my view hierarchy.</b></p>`,
    level: "senior",
  },
  {
    id: "k3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you expose extra actions to VoiceOver?",
    answerHtml: `<p>Swipe-to-delete and other custom gestures are invisible to someone who can't perform them —
      <code>.accessibilityAction(named:)</code> is how you surface that hidden functionality as a reachable
      action. It adds a named action (e.g. "Delete", "Pin" on a list row) that a VoiceOver user reaches through
      the rotor instead of a gesture.</p>
      <p><b>Any gesture I ship, I also ship as an accessibility action — swipe-to-delete becomes a rotor action,
      not a dead end for VoiceOver users.</b></p>`,
    level: "senior",
  },
  {
    id: "k4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is an accessibility rotor?",
    answerHtml: `<p>Swiping through every element on a long screen doesn't scale — rotors give VoiceOver users a
      way to jump between items of a kind instead. It's a navigation mode for headings, links, or your own
      <b>custom rotor</b> (<code>.accessibilityRotor("Unread") { … }</code>) that lets someone skip straight to,
      say, unread messages.</p>
      <p><b>I treat rotors as the VoiceOver equivalent of a table of contents — they're what makes a long screen
      navigable instead of a one-item-at-a-time slog.</b></p>`,
    level: "senior",
  },
  {
    id: "k5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you move VoiceOver focus programmatically?",
    answerHtml: `<p>A sighted user's eye jumps straight to a new error message; a VoiceOver user's focus doesn't
      move unless you move it — that's what <code>@AccessibilityFocusState</code> is for. Bind it to a view with
      <code>.accessibilityFocused($flag)</code>; setting the state moves VoiceOver focus there, e.g. onto an
      error message right after a failed submit.</p>
      <p><b>Whenever I show new content async — an error, a toast, a validation message — I move accessibility
      focus to it explicitly, otherwise VoiceOver users never learn it happened.</b></p>`,
    level: "senior",
  },
  {
    id: "k6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you properly support Dynamic Type?",
    answerHtml: `<p>Users who need larger text aren't an edge case — Dynamic Type is an OS-wide setting a
      meaningful slice of your users run at, and clipped or truncated UI at those sizes is a shipped bug, not a
      nice-to-have. Use <b>semantic fonts</b> (<code>.body</code>, <code>.headline</code>) so text scales with
      the user's setting; size custom values with <code>@ScaledMetric</code>; avoid fixed-height frames that clip
      large text (let it wrap/grow); and test at the largest accessibility sizes. For very large sizes, consider
      reflowing layout (e.g. HStack → VStack via <code>dynamicTypeSize</code>).</p>
      <p>Red flag: hard-coding point sizes and calling it done at the default size — that's the one size you're
      guaranteed a real user won't be running. <b>I build with semantic fonts and scaled metrics from the start,
      then test at the largest accessibility sizes, not just the default.</b></p>`,
    level: "mid",
  },
  {
    id: "k7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Why do accessibility traits like .isHeader matter?",
    answerHtml: `<p>Traits are how assistive tech decides what to do with an element, not just how it looks to a
      sighted user — get them wrong and VoiceOver either misreads the role or the user can't navigate at all.
      <code>.isHeader</code> lets VoiceOver users jump between sections via the Headings rotor;
      <code>.isButton</code>/<code>.isSelected</code>/<code>.updatesFrequently</code> communicate role and
      state.</p>
      <p><b>Marking section titles as headers is one of the highest-value, lowest-effort accessibility wins I
      ship — it turns a long screen into something navigable in seconds.</b></p>`,
    level: "senior",
  },
  {
    id: "k8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does accessibilityRepresentation do?",
    answerHtml: `<p>Hand-rolling accessibility for a fully custom control means reimplementing traits, value, and
      adjustable behavior yourself — and getting it subtly wrong in ways that are hard to test.
      <code>accessibilityRepresentation</code> lets it <b>borrow the accessibility</b> of a standard one instead:
      <code>.accessibilityRepresentation { Slider(...) }</code> tells assistive tech "treat my custom dial as this
      slider", so you get correct traits, value, and adjustable behavior for free.</p>
      <p><b>For any custom control that mirrors a standard one's behavior, I give it that standard control's
      accessibility representation instead of reinventing traits by hand.</b></p>`,
    level: "architect",
  },
  {
    id: "k9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you respect Reduce Motion?",
    answerHtml: `<p>Motion isn't just aesthetic for every user — parallax and large transitions can trigger
      nausea or vestibular symptoms, and App Review/HIG expect you to honor the setting rather than treat it as
      optional polish. Read <code>@Environment(\\.accessibilityReduceMotion)</code> and swap big motion (parallax,
      large transitions, autoplay) for a cross-fade or no animation when it's on.</p>
      <p><b>Every non-trivial animation I ship has a reduced-motion fallback, because for some users that motion
      isn't delightful, it's harmful.</b></p>`,
    level: "senior",
  },
  {
    id: "k10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Which other accessibility settings should UI react to?",
    answerHtml: `<p>Sighted users tune iOS to their own visual needs constantly, and UI that ignores those
      settings looks broken to exactly the people who turned them on. <b>Reduce Transparency</b> (use solid
      backgrounds instead of blur), <b>Increase Contrast</b> (stronger borders/colors), <b>Differentiate Without
      Color</b> (add shapes/labels, not just color to convey state), and <b>Bold Text</b> are all readable via
      <code>@Environment</code> values (e.g. <code>accessibilityReduceTransparency</code>,
      <code>colorSchemeContrast</code>).</p>
      <p><b>I treat these settings as first-class states to design for, not edge cases — if a user turned one on,
      my UI should visibly respect it.</b></p>`,
    level: "senior",
  },
  {
    id: "k11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are the rules on color and contrast?",
    answerHtml: `<p>Color-blind and low-vision users can't rely on a color difference the way a design mock
      assumes — treating color as the only signal locks them out of the meaning entirely. Never rely on
      <b>color alone</b> to convey meaning (add text, icons, or shapes — e.g. for error/success). Maintain
      sufficient text contrast (WCAG targets ~4.5:1 for body text, ~3:1 for large), and verify in both light and
      dark mode and with Increase Contrast on. The Accessibility Inspector flags contrast issues.</p>
      <p><b>Every state I convey with color also gets a second signal — icon, text, or shape — so the UI still
      communicates with color vision or Differentiate Without Color turned off.</b></p>`,
    level: "senior",
  },
  {
    id: "k12",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What's the minimum touch-target size?",
    answerHtml: `<p>A tap target that's technically clickable but too small to hit reliably is a
      motor-accessibility failure and an everyday annoyance for anyone with imprecise input — the fix costs
      nothing once you know the number. About <b>44×44 points</b> (Apple HIG) is the minimum; expand hit areas
      with padding or <code>contentShape</code>, and don't pack interactive elements too densely.</p>
      <p><b>44×44 is the floor I design every tappable element to, even icon buttons that look fine smaller — the
      visual size and the hit-target size don't have to match.</b></p>`,
    level: "mid",
  },
  {
    id: "k13",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you handle images and decorative content?",
    answerHtml: `<p>An image with no label is either silence or noise to VoiceOver — say nothing and you hide
      content, say "image" and you add clutter, so the fix is to be deliberate about which images carry meaning.
      Give <b>meaningful</b> images an <code>accessibilityLabel</code> describing the content/intent (not
      "image"); mark <b>decorative</b> images as hidden (<code>Image(decorative:)</code> or
      <code>.accessibilityHidden(true)</code>) so VoiceOver skips them.</p>
      <p>Red flag: shipping an icon-only button with no label — it reads as nothing usable, not as its function.
      <b>Every image I ship is either meaningfully labeled or explicitly marked decorative — there's no unlabeled
      middle ground.</b></p>`,
    level: "mid",
  },
  {
    id: "k14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you make a chart accessible?",
    answerHtml: `<p>A chart is pure pixels to VoiceOver — without extra work, a trend that's obvious at a glance
      to a sighted user is completely invisible to someone using the screen reader. Provide an <b>Audio Graph</b>:
      describe the data with <code>AXChartDescriptor</code> (axes + data series) so VoiceOver users can hear the
      trend and read values, and give the chart a summary label. Swift Charts integrates accessibility, but custom
      charts need explicit descriptors.</p>
      <p><b>Any data visualization I ship gets an Audio Graph descriptor — a chart that only a sighted user can
      read isn't done.</b></p>`,
    level: "architect",
  },
  {
    id: "k15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What drives Voice Control, and how do you tune it?",
    answerHtml: `<p>Voice Control lets users navigate by speaking your UI's own words back at it, so the label you
      set for VoiceOver doubles as the vocabulary Voice Control listens for — get the label wrong and the control
      becomes unreachable by voice, not just unclear by ear. It uses your accessibility <b>label</b>, so clear
      labels make controls speakable. Add alternates with <code>.accessibilityInputLabels(["Send", "Submit"])</code>
      when the visible label differs from what users would say.</p>
      <p><b>I write labels once and let them serve VoiceOver and Voice Control together — that's two
      accessibility features from one piece of metadata.</b></p>`,
    level: "senior",
  },
  {
    id: "k16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What should you check for Switch Control and navigation order?",
    answerHtml: `<p>Switch Control users step through every element one at a time in a fixed sequence — an
      illogical reading order isn't a minor annoyance for them, it's the entire navigation model working against
      them. Use <code>.accessibilitySortPriority</code> to fix out-of-order reading, group related controls, and
      ensure every interactive element is reachable and actionable without gestures.</p>
      <p><b>I check reading order for Switch Control the same way I'd check tab order on the web — sequential
      navigation only works if the sequence makes sense.</b></p>`,
    level: "senior",
  },
  {
    id: "k17",
    category: "test",
    categoryLabel: "Testing",
    question: "What tools verify accessibility?",
    answerHtml: `<p>Manual VoiceOver testing catches what automated checks can't, but running the Accessibility
      Inspector's Audit first catches the cheap, obvious misses before you burn time on a manual pass. The
      <b>Accessibility Inspector</b> lets you inspect labels/traits and run an <b>Audit</b> that flags missing
      labels, low contrast, small targets, and clipped text; Xcode's <b>Accessibility preview</b> helps too.</p>
      <p><b>I run the Audit first to catch the obvious misses, then turn VoiceOver on and use the app one-handed
      with my eyes closed — nothing replaces real usage.</b></p>`,
    level: "senior",
  },
  {
    id: "k18",
    category: "test",
    categoryLabel: "Testing",
    question: "accessibilityIdentifier vs accessibilityLabel in UI tests?",
    answerHtml: `<p>Two properties look similar but serve opposite audiences — confusing them either breaks
      your tests on every copy change or tempts you to compromise real accessibility to make tests pass.
      <b>Label</b> is user-facing text VoiceOver reads and can be localized/changed. <b>Identifier</b>
      (<code>.accessibilityIdentifier</code>) is a stable, non-localized hook for XCUITest that VoiceOver
      ignores.</p>
      <p>Red flag: querying UI tests by label — it breaks the moment copy or locale changes, and pressures you to
      weaken real accessibility labels just to keep a test green. <b>I query UI tests by identifier and keep
      labels free to say whatever best serves VoiceOver users.</b></p>`,
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
    explanationHtml: `<p>Without a label there's no meaningful text to announce — icon-only controls must set
      <code>.accessibilityLabel</code>. It's tempting to assume the SF Symbol's internal name gets announced
      automatically, but VoiceOver doesn't read symbol names — the trait (button) conveys the type; the label
      conveys the purpose.</p>`,
  },
  {
    id: "kz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Marking section titles with the .isHeader trait primarily helps users:",
    options: ["See bigger text", "Jump between sections via the Headings rotor", "Get haptics", "Skip the app"],
    answer: 1,
    explanationHtml: `<p>Headers enable the VoiceOver Headings rotor — a high-value, low-effort way to make long
      screens navigable. It's not a visual trait: "See bigger text" describes Dynamic Type, a completely
      different setting, and <code>.isHeader</code> changes nothing about font size on its own.</p>`,
  },
  {
    id: "kz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To support Dynamic Type, you should mainly:",
    options: ["Hard-code point sizes", "Use semantic fonts and avoid clipping frames", "Disable scaling", "Only support the default size"],
    answer: 1,
    explanationHtml: `<p>Semantic fonts scale automatically; size custom metrics with <code>@ScaledMetric</code>
      and let text grow/wrap instead of clipping. Hard-coding point sizes is the tempting shortcut that looks
      fine at the default size and breaks the moment a real user has a larger text setting on.</p>`,
  },
  {
    id: "kz4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Conveying success/error with color only is a problem because:",
    options: ["It's slower to render", "It fails color-blind users / Differentiate Without Color", "It breaks dark mode", "It needs more memory"],
    answer: 1,
    explanationHtml: `<p>Never rely on color alone — add text, icons, or shape so meaning survives color-vision
      differences and the Differentiate Without Color setting. It's not a rendering-cost or dark-mode issue:
      color-blind and low-vision users can be looking at a perfectly rendered screen and still miss the signal
      entirely.</p>`,
  },
  {
    id: "kz5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "The minimum recommended touch-target size is about:",
    options: ["20×20 pt", "44×44 pt", "10×10 pt", "100×100 pt"],
    answer: 1,
    explanationHtml: `<p>~44×44 points (HIG). 20×20 or 10×10 look fine visually but are too small to hit
      reliably — that's the motor-accessibility failure this rule exists to prevent; 100×100 is overkill that
      wastes screen space without adding real value. Expand small controls with padding or
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
    html: `<p>VoiceOver users navigate by swipe and by ear, not by sight — a screen that isn't explicitly
      described reads as silence or as noise, no matter how polished it looks visually. <b>What it is.</b> Making
      the app usable with VoiceOver: give each element a concise <b>label</b>, a <b>value</b> for state, optional
      <b>hint</b>, and the right <b>traits</b> (<code>.isButton</code>, <code>.isHeader</code>,
      <code>.isSelected</code>). <b>Group</b> composite views (<code>accessibilityElement(children: .combine)</code>)
      and <b>hide</b> decoration so each swipe stop is meaningful.</p>
    <p>Go further with <b>custom actions</b> (surface swipe gestures), <b>rotors</b> (jump to headings/links/your
      custom category), programmatic focus (<code>@AccessibilityFocusState</code>), and
      <code>accessibilityRepresentation</code> to give custom controls standard semantics. Clear labels also power
      <b>Voice Control</b> ("tap <i>label</i>") and a logical order serves <b>Switch Control</b>.</p>
    <div class="callout tip"><span class="lbl">Highest-value wins</span> Label icon-only buttons, mark section
      titles as headers, and group rows. Then turn VoiceOver on and actually use the app. <b>Say this: "I treat
      VoiceOver navigation as its own information architecture, not an afterthought on top of the visual
      one."</b></div>`,
  },
  {
    id: "st-adv-24",
    num: "39",
    title: "39 · Inclusive design: Dynamic Type, motion, color & testing",
    html: `<p>Accessibility settings beyond VoiceOver exist because "usable" means different things to different
      users — one person needs bigger text, another needs less motion, another needs contrast that survives
      their vision. <b>What it is.</b> Support <b>Dynamic Type</b> (semantic fonts, <code>@ScaledMetric</code>, no
      clipping, reflow at huge sizes). Honor <b>Reduce Motion</b>
      (<code>@Environment(\\.accessibilityReduceMotion)</code> → cross-fade instead of parallax), <b>Reduce
      Transparency</b>, <b>Increase Contrast</b>, and <b>Differentiate Without Color</b>. Keep text contrast
      adequate (~4.5:1 body) and touch targets ~44pt. Make charts accessible with <b>Audio Graphs</b>
      (<code>AXChartDescriptor</code>).</p>
    <p><b>Test</b> with the <b>Accessibility Inspector</b> and its <b>Audit</b> (flags missing labels, low
      contrast, small targets, clipped text), the SwiftUI accessibility preview, and real VoiceOver use. In UI
      tests, query by <b>accessibilityIdentifier</b>, not by label.</p>
    <div class="callout warn"><span class="lbl">Why it's not optional</span> Accessibility is a legal/enterprise
      requirement and an App Review consideration — and the same work (labels, scaling, contrast) makes the app
      better for everyone. <b>Say this: "Accessibility settings aren't edge cases — they're the settings some of
      my users always have on."</b></div>`,
  },
];
