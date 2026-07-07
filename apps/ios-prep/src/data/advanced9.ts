// Advanced batch 9 — Swift Charts & data visualization (mid/senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED9_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED9_FLASHCARDS: Flashcard[] = [
  {
    id: "m1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is Swift Charts?",
    answerHtml: `<p>It replaces hand-rolled Core Graphics/UIView charting with a declarative model, so a chart is
      just another SwiftUI view — same state-driven updates, same composition, same accessibility pipeline,
      instead of a bespoke rendering layer you maintain yourself. Mechanically: you compose a <code>Chart</code>
      from <b>marks</b> the same way you compose views — describe the data-to-visual mapping and it handles axes,
      scales, legends, and (mostly automatic) accessibility.</p>
    <div class="code">Chart(sales) { item in
  BarMark(x: .value("Month", item.month),
          y: .value("Revenue", item.revenue))
}</div>
    <p><b>I use Swift Charts because it gives me standard statistical charts as SwiftUI views, with axes, scales,
      and accessibility handled for free.</b></p>`,
    level: "mid",
  },
  {
    id: "m2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What mark types does Swift Charts provide?",
    answerHtml: `<p>Each mark is a visual grammar for one kind of story, so picking the right one is a
      communication decision, not a styling one. <code>BarMark</code>, <code>LineMark</code>,
      <code>PointMark</code>, <code>AreaMark</code>, <code>RuleMark</code> (reference lines),
      <code>RectangleMark</code>, and <code>SectorMark</code> (pie/donut, iOS 17) cover comparison, trend,
      correlation, volume, thresholds, and composition respectively.</p>
    <p><b>I pick the mark for the message: bars compare, lines trend, points correlate.</b></p>`,
    level: "mid",
  },
  {
    id: "m3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you map data to a mark?",
    answerHtml: `<p>Swift Charts separates "what the axis is called" from "what value drives it," which is what
      lets the same mark work with numbers, dates, or strings interchangeably. You map each channel with
      <code>.value(_:_:)</code> — <code>x</code>, <code>y</code>, and optional encodings — where the label is
      for the axis/legend and the second argument is the datum. Your data just needs values that are
      <b>Plottable</b>.</p>
    <p><b>Any Plottable type — numbers, dates, strings — works with the same <code>.value(_:_:)</code> API.</b></p>`,
    level: "mid",
  },
  {
    id: "m4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you show more than two dimensions (grouped/stacked series)?",
    answerHtml: `<p>You don't add more marks for more dimensions — you add <code>by:</code> encodings to the one
      mark, which keeps the chart declarative instead of hand-looping over categories. <code>.foregroundStyle(by:
      .value("Category", item.category))</code> colors and legends by category (and stacks bars),
      <code>.position(by:)</code> groups them side by side, and <code>.symbol(by:)</code> varies point shapes.</p>
    <p><b>One mark plus a <code>by:</code> encoding renders a whole multi-series chart — no manual color loops.</b></p>`,
    level: "senior",
  },
  {
    id: "m5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you customize axes?",
    answerHtml: `<p>Default axes are a reasonable guess, not a guarantee — you override them when the auto-picked
      ticks or labels don't match the domain (sparse dates, currency, a fixed cadence). <code>.chartXAxis {
      AxisMarks { … } }</code> (and <code>chartYAxis</code>) control tick positions, grid lines, and labels —
      e.g. <code>AxisValueLabel(format: .dateTime.month())</code> for dates, custom strides, or hiding the axis.
      <code>.chartXAxisLabel</code> adds an axis title.</p>
    <p><b>I override <code>chartXAxis</code>/<code>chartYAxis</code> when the inferred ticks don't match how the
      audience reads the data.</b></p>`,
    level: "senior",
  },
  {
    id: "m6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you control the value range shown?",
    answerHtml: `<p>An inferred domain is an honesty problem, not just a cosmetic one — a bar chart that doesn't
      start at zero exaggerates differences and misleads whoever's reading it. Set the domain explicitly with
      <code>.chartYScale(domain: 0...100)</code> (or <code>chartXScale</code>) so bars start at zero or a line
      zooms to a meaningful band.</p>
    <p>Red flag: shipping a bar chart with an auto-inferred, non-zero y-domain — it looks fine in a demo and
      misrepresents the data in front of a stakeholder.</p>
    <p><b>I always set <code>chartYScale(domain:)</code> explicitly on bar charts so the axis can't lie.</b></p>`,
    level: "senior",
  },
  {
    id: "m7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you add selection/interaction (iOS 17)?",
    answerHtml: `<p>iOS 17 turned "read the value under my finger" from a manual hit-testing problem into a
      binding, which cuts out a whole class of gesture-coordinate bugs. Bind <code>.chartXSelection(value:
      $selectedDate)</code> (or <code>chartXSelection(value:)</code> with a range) so drag/tap reports the
      selected x-value; then draw a <code>RuleMark</code> + <code>.annotation</code> to show a tooltip.</p>
    <p>Red flag: reaching for a manual <code>DragGesture</code> + <code>chartProxy</code> hit-test on iOS 17+ —
      that's the pre-selection-API workaround, and it's more code to get the same result.</p>
    <p><b>On iOS 17+ I bind <code>chartXSelection</code> instead of hand-rolling gesture hit-testing.</b></p>`,
    level: "senior",
  },
  {
    id: "m8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you make a chart scrollable (iOS 17)?",
    answerHtml: `<p>A year of daily data crammed into one screen width is unreadable no matter how you scale it
      — the fix is a bounded, navigable window, not more compression. <code>.chartScrollableAxes(.horizontal)</code>
      plus <code>.chartXVisibleDomain(length:)</code> sets the visible window, and
      <code>.chartScrollPosition(x:)</code> reads/drives it.</p>
    <p><b>I show a week and let the user scroll through the year, instead of squeezing a year onto one screen.</b></p>`,
    level: "senior",
  },
  {
    id: "m9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you annotate a specific data point?",
    answerHtml: `<p>Annotations are how you call out the one data point that matters instead of making the reader
      hunt for it across the axis. Attach <code>.annotation(position:)</code> to a mark to place a label/badge
      relative to it (e.g. the peak value above a bar); use a <code>RuleMark</code> with an annotation for
      thresholds/averages. Annotations are themselves SwiftUI views, so anything a view can render, an
      annotation can show.</p>
    <p><b>Annotations are SwiftUI views attached to a mark — I use them to call out the point that matters.</b></p>`,
    level: "mid",
  },
  {
    id: "m10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you style line and bar marks?",
    answerHtml: `<p>Every style modifier should still be carrying information, not decorating — the moment color or
      shape stops encoding data it's just noise on top of the chart. Use <code>.foregroundStyle(...)</code> for
      color/gradient, <code>.lineStyle(StrokeStyle(...))</code> and <code>.interpolationMethod(.catmullRom)</code>
      for smooth lines, <code>.symbol(...)</code> for points, and corner radius/width on bars.</p>
    <p><b>I keep styling meaningful — color encodes data — rather than decorative.</b></p>`,
    level: "mid",
  },
  {
    id: "m11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How accessible are Swift Charts?",
    answerHtml: `<p>Accessibility for a chart is normally a project of its own — Swift Charts ships it for free
      because the framework already knows the data-to-visual mapping you described. It generates an
      <b>Audio Graph</b> and VoiceOver descriptions from your marks, so users can hear the trend and read values.
      Improve it with per-mark <code>.accessibilityLabel</code>/<code>.accessibilityValue</code> and a chart
      summary — far less work than making a custom Canvas chart accessible.</p>
    <p><b>Accessibility is largely automatic — I add per-mark labels and a summary on top of it.</b></p>`,
    level: "senior",
  },
  {
    id: "m12",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Can you combine multiple mark types in one chart?",
    answerHtml: `<p>Yes, and that's the whole point of a shared coordinate system — you're not stitching separate
      charts together, you're layering marks that all read the same scales and axes. E.g. an <code>AreaMark</code>
      for the band, a <code>LineMark</code> for the trend, a <code>PointMark</code> for samples, a
      <code>RuleMark</code> for the average.</p>
    <p><b>Layering marks in one <code>Chart</code> is how I build composite visualizations without juggling
      separate scales.</b></p>`,
    level: "senior",
  },
  {
    id: "m13",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you keep charts fast with large datasets?",
    answerHtml: `<p>Rendering thousands of marks tanks layout and scrolling because you're paying layout cost for
      pixels the screen can't even display — the fix is to match the data volume to the display resolution, not
      to render everything and hope. <b>Aggregate/downsample</b> to what the chart can actually show (bucket by
      day/week, or LTTB downsampling), precompute off the main actor, and use scrollable charts with a bounded
      visible domain.</p>
    <p><b>I downsample to display resolution off the main actor before the chart ever sees the data.</b></p>`,
    level: "senior",
  },
  {
    id: "m14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you make a pie or donut chart?",
    answerHtml: `<p>Composition charts get their own mark rather than being faked from bars, because angle-based
      encoding is a different visual language than length-based encoding. Use <code>SectorMark</code> (iOS 17):
      <code>SectorMark(angle: .value("Count", item.count), innerRadius: .ratio(0.6), angularInset: 2)</code> with
      <code>.foregroundStyle(by:)</code> for the categories. <code>innerRadius</code> turns a pie into a donut.</p>
    <p><b><code>SectorMark</code> with an <code>innerRadius</code> ratio is the whole donut chart.</b></p>`,
    level: "mid",
  },
  {
    id: "m15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you format date/number axis labels?",
    answerHtml: `<p>Formatting belongs on the axis, not baked into the data, because the same underlying values
      might need to render differently depending on zoom level or locale. In <code>AxisMarks</code>, use
      <code>AxisValueLabel(format: .dateTime.month(.abbreviated))</code> for dates or a
      <code>FloatingPointFormatStyle</code>/<code>.currency</code> for numbers, and set a <code>stride</code>
      (e.g. <code>.month</code>) to control tick density.</p>
    <p><b>I format at the axis layer so the underlying data stays raw and reusable.</b></p>`,
    level: "mid",
  },
  {
    id: "m16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When should you NOT use Swift Charts?",
    answerHtml: `<p>Swift Charts is built around a fixed vocabulary of marks and scales — pushing it past that
      vocabulary (network graphs, bespoke gauges, dense particle-like plots) or past its performance envelope
      (extreme element counts, pixel-level control) means fighting the framework instead of using it. Drop to
      <code>Canvas</code> (or Metal) for those cases.</p>
    <p>Red flag: forcing a non-standard visualization into Swift Charts marks — if you're fighting the API more
      than composing it, that's the signal to switch to <code>Canvas</code>.</p>
    <p><b>Swift Charts is for standard statistical charts, not a general 2D drawing engine.</b></p>`,
    level: "senior",
  },
];

export const ADVANCED9_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED9_QUIZ: QuizQuestion[] = [
  {
    id: "mz1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "In Swift Charts, you build a chart from:",
    options: ["UIView subclasses", "Marks (BarMark, LineMark, …) inside a Chart", "Core Graphics calls", "HTML"],
    answer: 1,
    explanationHtml: `<p>You compose marks declaratively inside <code>Chart</code>; the framework handles axes,
      scales, legends, and accessibility. Core Graphics calls are the old imperative way — you'd be reinventing
      layout, scaling, and accessibility that Swift Charts already gives you.</p>`,
  },
  {
    id: "mz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To color/stack a bar chart by category you use:",
    options: [".foregroundStyle(by: .value(...))", "a for loop of colors", "ZStack", "chartYScale"],
    answer: 0,
    explanationHtml: `<p><code>.foregroundStyle(by:)</code> encodes a category dimension — coloring, legend, and
      stacking come from one modifier. A manual for loop of colors is the misconception: it re-implements what the
      encoding already gives you, and it won't automatically produce a matching legend.</p>`,
  },
  {
    id: "mz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Bars can mislead if you don't set:",
    options: ["A title", "The y-scale domain (e.g. starting at 0)", "A legend", "Dark mode"],
    answer: 1,
    explanationHtml: `<p>An inferred domain can truncate the axis, and a truncated bar axis exaggerates
      differences that aren't really that large. A legend or a title doesn't fix that — only setting
      <code>chartYScale(domain:)</code> so bar lengths are comparable does.</p>`,
  },
  {
    id: "mz4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "iOS 17 tooltip selection is done with:",
    options: ["A manual DragGesture + chartProxy only", "chartXSelection bound to state", "onTapGesture", "GeometryReader"],
    answer: 1,
    explanationHtml: `<p><code>.chartXSelection(value:)</code> reports the selected x-value; pair it with a
      <code>RuleMark</code> + annotation for the tooltip. Manual <code>DragGesture</code> + <code>chartProxy</code>
      hit-testing is the pre-iOS-17 workaround — reaching for it now means redoing gesture-to-coordinate math the
      binding already handles.</p>`,
  },
  {
    id: "mz5",
    category: "perf",
    categoryLabel: "Performance",
    question: "With a 50k-point time series you should:",
    options: ["Render every point", "Aggregate/downsample to display resolution and scroll a window", "Use AnyView", "Disable the axis"],
    answer: 1,
    explanationHtml: `<p>Thousands of marks tank layout and scrolling — the screen physically can't show 50k
      distinct points, so rendering them all is wasted work, not extra fidelity. Bucket/downsample off the main
      actor and use a bounded visible domain with scrollable axes.</p>`,
  },
  {
    id: "mz6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "A donut chart in Swift Charts uses:",
    options: ["BarMark with rotation", "SectorMark with innerRadius", "PointMark", "Canvas only"],
    answer: 1,
    explanationHtml: `<p><code>SectorMark</code> (iOS 17) with an <code>innerRadius</code> ratio produces a
      donut; angle encodes the value. Rotating a <code>BarMark</code> isn't a real path — bars encode length, not
      angle, so there's no rotation modifier that turns one into the other.</p>`,
  },
];

export const ADVANCED9_STUDY: StudySection[] = [
  {
    id: "st-adv-25",
    num: "40",
    title: "40 · Swift Charts: marks, encodings & axes",
    html: `<p><b>Why it matters.</b> Charting used to mean either a third-party library or hand-rolled Core
      Graphics/Canvas drawing — both a maintenance burden outside SwiftUI's update and accessibility model. Swift
      Charts makes a chart just another composable SwiftUI view: describe the data-to-visual mapping, get axes,
      scales, legends, and accessibility handled for you.</p>
    <p>Compose a <code>Chart</code> from <b>marks</b> (<code>BarMark</code>, <code>LineMark</code>,
      <code>PointMark</code>, <code>AreaMark</code>, <code>RuleMark</code>, <code>SectorMark</code>), mapping data
      with <code>.value(_:_:)</code> on each channel. Add dimensions with <code>.foregroundStyle(by:)</code> /
      <code>.position(by:)</code> / <code>.symbol(by:)</code> for multi-series, and layer marks for composite
      charts. Control presentation with <b>axes</b> (<code>chartXAxis</code> + <code>AxisMarks</code>, formatted
      labels), <b>scales</b> (<code>chartYScale(domain:)</code> — start bars at zero!), and styling
      (<code>interpolationMethod</code>, gradients). Accessibility (audio graph + descriptions) is largely
      automatic.</p>
    <div class="callout tip"><span class="lbl">Pick the mark for the message</span> bars compare, lines trend,
      points correlate, area shows volume, sector shows composition. Say this: "I pick the mark for the message,
      and I set the y-domain explicitly so bar charts can't mislead."</div>`,
  },
  {
    id: "st-adv-26",
    num: "41",
    title: "41 · Interactive & scrollable charts",
    html: `<p><b>Why it matters.</b> Before iOS 17, "what value is under my finger" meant manual
      <code>DragGesture</code> + <code>chartProxy</code> hit-testing — coordinate math you had to get right
      yourself. iOS 17 turned that into a binding, and turned "show a year of data" into a scrollable, bounded
      window instead of a cramped, unreadable screen.</p>
    <p>Bind <code>.chartXSelection(value:)</code> for tap/drag selection and draw a <code>RuleMark</code> +
      <code>.annotation</code> tooltip. Make long series navigable with
      <code>.chartScrollableAxes(.horizontal)</code>, a bounded <code>.chartXVisibleDomain(length:)</code>, and
      <code>.chartScrollPosition(x:)</code>. For big data, <b>aggregate before you plot</b> — downsample to
      display resolution off the main actor — so interaction stays smooth. For visuals Swift Charts can't
      express, fall back to <code>Canvas</code>.</p>
    <div class="callout warn"><span class="lbl">Honesty</span> Mind the y-domain and units; a truncated axis or
      missing baseline turns a correct chart into a misleading one. Say this: "I downsample off the main actor
      and scroll a bounded window rather than rendering every point."</div>`,
  },
];
