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
    answerHtml: `<p>Apple's declarative charting framework for SwiftUI (iOS 16+). You compose a
      <code>Chart</code> from <b>marks</b> the same way you compose views — describe the data-to-visual mapping
      and it handles axes, scales, legends, and (mostly automatic) accessibility.</p>
    <div class="code">Chart(sales) { item in
  BarMark(x: .value("Month", item.month),
          y: .value("Revenue", item.revenue))
}</div>`,
    level: "mid",
  },
  {
    id: "m2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What mark types does Swift Charts provide?",
    answerHtml: `<p><code>BarMark</code>, <code>LineMark</code>, <code>PointMark</code>, <code>AreaMark</code>,
      <code>RuleMark</code> (reference lines), <code>RectangleMark</code>, and <code>SectorMark</code> (pie/donut,
      iOS 17). You pick the mark for the story — bars for comparison, lines for trends, points for
      correlation.</p>`,
    level: "mid",
  },
  {
    id: "m3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you map data to a mark?",
    answerHtml: `<p>With <code>.value(_:_:)</code> for each channel: <code>x</code>, <code>y</code>, and
      optional encodings. The label is for the axis/legend; the second argument is the datum. Your data just
      needs values that are <b>Plottable</b> (numbers, dates, strings).</p>`,
    level: "mid",
  },
  {
    id: "m4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you show more than two dimensions (grouped/stacked series)?",
    answerHtml: `<p>Add encodings: <code>.foregroundStyle(by: .value("Category", item.category))</code> colors
      and legends by category (and stacks bars), <code>.position(by:)</code> groups them side by side, and
      <code>.symbol(by:)</code> varies point shapes. One mark + a <code>by:</code> encoding renders a whole
      multi-series chart.</p>`,
    level: "senior",
  },
  {
    id: "m5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you customize axes?",
    answerHtml: `<p><code>.chartXAxis { AxisMarks { … } }</code> (and <code>chartYAxis</code>) let you control
      tick positions, grid lines, and labels — e.g. <code>AxisValueLabel(format: .dateTime.month())</code> for
      dates, custom strides, or hiding the axis. <code>.chartXAxisLabel</code> adds an axis title.</p>`,
    level: "senior",
  },
  {
    id: "m6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you control the value range shown?",
    answerHtml: `<p>Set the domain with <code>.chartYScale(domain: 0...100)</code> (or
      <code>chartXScale</code>) so bars start at zero or a line zooms to a band. Without it the framework infers a
      domain from the data, which can mislead (truncated bar axes).</p>`,
    level: "senior",
  },
  {
    id: "m7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you add selection/interaction (iOS 17)?",
    answerHtml: `<p>Bind <code>.chartXSelection(value: $selectedDate)</code> (or
      <code>chartXSelection(value:)</code> with a range) so drag/tap reports the selected x-value; then draw a
      <code>RuleMark</code> + <code>.annotation</code> to show a tooltip. This replaced the old manual
      drag-gesture + <code>chartProxy</code> hit-testing for most cases.</p>`,
    level: "senior",
  },
  {
    id: "m8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you make a chart scrollable (iOS 17)?",
    answerHtml: `<p><code>.chartScrollableAxes(.horizontal)</code> plus
      <code>.chartXVisibleDomain(length:)</code> to set the visible window, and
      <code>.chartScrollPosition(x:)</code> to read/drive it. Great for long time series — show a week, scroll
      through the year — without loading everything into one cramped view.</p>`,
    level: "senior",
  },
  {
    id: "m9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you annotate a specific data point?",
    answerHtml: `<p>Attach <code>.annotation(position:)</code> to a mark to place a label/badge relative to it
      (e.g. the peak value above a bar). Use a <code>RuleMark</code> with an annotation for thresholds/averages.
      Annotations are themselves SwiftUI views.</p>`,
    level: "mid",
  },
  {
    id: "m10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you style line and bar marks?",
    answerHtml: `<p><code>.foregroundStyle(...)</code> for color/gradient, <code>.lineStyle(StrokeStyle(...))</code>
      and <code>.interpolationMethod(.catmullRom)</code> for smooth lines, <code>.symbol(...)</code> for points,
      and corner radius / width on bars. Keep styling meaningful (color encodes data) rather than decorative.</p>`,
    level: "mid",
  },
  {
    id: "m11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How accessible are Swift Charts?",
    answerHtml: `<p>Largely automatic: Swift Charts generates an <b>Audio Graph</b> and VoiceOver descriptions
      from your marks, so users can hear the trend and read values. Improve it with per-mark
      <code>.accessibilityLabel</code>/<code>.accessibilityValue</code> and a chart summary — far less work than
      making a custom Canvas chart accessible.</p>`,
    level: "senior",
  },
  {
    id: "m12",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Can you combine multiple mark types in one chart?",
    answerHtml: `<p>Yes — layer them in the same <code>Chart</code> (e.g. an <code>AreaMark</code> for the band,
      a <code>LineMark</code> for the trend, a <code>PointMark</code> for samples, a <code>RuleMark</code> for the
      average). They share scales/axes, which is exactly how you build rich, composite visualizations.</p>`,
    level: "senior",
  },
  {
    id: "m13",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you keep charts fast with large datasets?",
    answerHtml: `<p>Don't render thousands of marks. <b>Aggregate/downsample</b> to the resolution the chart can
      actually show (bucket by day/week, or LTTB downsampling), precompute off the main actor, and use scrollable
      charts with a bounded visible domain. Too many marks tanks layout and scrolling.</p>`,
    level: "senior",
  },
  {
    id: "m14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you make a pie or donut chart?",
    answerHtml: `<p>Use <code>SectorMark</code> (iOS 17): <code>SectorMark(angle: .value("Count", item.count),
      innerRadius: .ratio(0.6), angularInset: 2)</code> with <code>.foregroundStyle(by:)</code> for the
      categories. <code>innerRadius</code> turns a pie into a donut.</p>`,
    level: "mid",
  },
  {
    id: "m15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you format date/number axis labels?",
    answerHtml: `<p>In <code>AxisMarks</code>, use <code>AxisValueLabel(format: .dateTime.month(.abbreviated))</code>
      for dates or a <code>FloatingPointFormatStyle</code>/<code>.currency</code> for numbers, and set a
      <code>stride</code> (e.g. <code>.month</code>) to control tick density. Formatting belongs on the axis, not
      baked into the data.</p>`,
    level: "mid",
  },
  {
    id: "m16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When should you NOT use Swift Charts?",
    answerHtml: `<p>For non-standard, highly custom visuals (network graphs, bespoke gauges, dense particle-like
      plots) or when you need pixel-level control or extreme element counts — drop to <code>Canvas</code> (or
      Metal). Swift Charts is ideal for standard statistical charts; it's not a general 2D drawing engine.</p>`,
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
      scales, legends, and accessibility.</p>`,
  },
  {
    id: "mz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To color/stack a bar chart by category you use:",
    options: [".foregroundStyle(by: .value(...))", "a for loop of colors", "ZStack", "chartYScale"],
    answer: 0,
    explanationHtml: `<p><code>.foregroundStyle(by:)</code> encodes a category dimension — coloring, legend, and
      stacking come from one modifier.</p>`,
  },
  {
    id: "mz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Bars can mislead if you don't set:",
    options: ["A title", "The y-scale domain (e.g. starting at 0)", "A legend", "Dark mode"],
    answer: 1,
    explanationHtml: `<p>An inferred domain can truncate the axis. Set <code>chartYScale(domain:)</code> so bar
      lengths are comparable.</p>`,
  },
  {
    id: "mz4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "iOS 17 tooltip selection is done with:",
    options: ["A manual DragGesture + chartProxy only", "chartXSelection bound to state", "onTapGesture", "GeometryReader"],
    answer: 1,
    explanationHtml: `<p><code>.chartXSelection(value:)</code> reports the selected x-value; pair it with a
      <code>RuleMark</code> + annotation for the tooltip.</p>`,
  },
  {
    id: "mz5",
    category: "perf",
    categoryLabel: "Performance",
    question: "With a 50k-point time series you should:",
    options: ["Render every point", "Aggregate/downsample to display resolution and scroll a window", "Use AnyView", "Disable the axis"],
    answer: 1,
    explanationHtml: `<p>Thousands of marks tank performance. Bucket/downsample off the main actor and use a
      bounded visible domain with scrollable axes.</p>`,
  },
  {
    id: "mz6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "A donut chart in Swift Charts uses:",
    options: ["BarMark with rotation", "SectorMark with innerRadius", "PointMark", "Canvas only"],
    answer: 1,
    explanationHtml: `<p><code>SectorMark</code> (iOS 17) with an <code>innerRadius</code> ratio produces a
      donut; angle encodes the value.</p>`,
  },
];

export const ADVANCED9_STUDY: StudySection[] = [
  {
    id: "st-adv-25",
    num: "40",
    title: "40 · Swift Charts: marks, encodings & axes",
    html: `<p><b>What it is.</b> Declarative charting for SwiftUI. Compose a <code>Chart</code> from <b>marks</b>
      (<code>BarMark</code>, <code>LineMark</code>, <code>PointMark</code>, <code>AreaMark</code>,
      <code>RuleMark</code>, <code>SectorMark</code>), mapping data with <code>.value(_:_:)</code> on each
      channel. Add dimensions with <code>.foregroundStyle(by:)</code> / <code>.position(by:)</code> /
      <code>.symbol(by:)</code> for multi-series, and layer marks for composite charts.</p>
    <p>Control presentation with <b>axes</b> (<code>chartXAxis</code> + <code>AxisMarks</code>, formatted
      labels), <b>scales</b> (<code>chartYScale(domain:)</code> — start bars at zero!), and styling
      (<code>interpolationMethod</code>, gradients). Accessibility (audio graph + descriptions) is largely
      automatic.</p>
    <div class="callout tip"><span class="lbl">Pick the mark for the message</span> bars compare, lines trend,
      points correlate, area shows volume, sector shows composition.</div>`,
  },
  {
    id: "st-adv-26",
    num: "41",
    title: "41 · Interactive & scrollable charts",
    html: `<p><b>What it is.</b> iOS 17 made charts first-class interactive. Bind
      <code>.chartXSelection(value:)</code> for tap/drag selection and draw a <code>RuleMark</code> +
      <code>.annotation</code> tooltip. Make long series navigable with
      <code>.chartScrollableAxes(.horizontal)</code>, a bounded <code>.chartXVisibleDomain(length:)</code>, and
      <code>.chartScrollPosition(x:)</code>.</p>
    <p>For big data, <b>aggregate before you plot</b> — downsample to display resolution off the main actor — so
      interaction stays smooth. For visuals Swift Charts can't express, fall back to <code>Canvas</code>.</p>
    <div class="callout warn"><span class="lbl">Honesty</span> Mind the y-domain and units; a truncated axis or
      missing baseline turns a correct chart into a misleading one.</div>`,
  },
];
