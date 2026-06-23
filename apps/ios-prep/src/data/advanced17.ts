// Advanced batch 17 — HealthKit, HomeKit & sensors (senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED17_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED17_FLASHCARDS: Flashcard[] = [
  {
    id: "x1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is HealthKit and how do you access it?",
    answerHtml: `<p>A shared, system-managed health database. You talk to it through a single
      <code>HKHealthStore</code>, after enabling the HealthKit capability. Data is typed
      (<code>HKQuantityType</code>, <code>HKCategoryType</code>, workouts) and access is per-type and
      permission-gated.</p>`,
    level: "senior",
  },
  {
    id: "x2",
    category: "security",
    categoryLabel: "Security",
    question: "What's unusual about HealthKit read authorization?",
    answerHtml: `<p>For privacy, the app <b>cannot tell whether read access was denied</b> — a denied read just
      returns no data, indistinguishable from "the user has none". So never branch on "do I have read
      permission"; design for empty results. Write permission, by contrast, is observable.</p>`,
    level: "senior",
  },
  {
    id: "x3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the main HealthKit data types and units?",
    answerHtml: `<p><b>Quantity</b> types (steps, heart rate, energy — numeric with an <code>HKUnit</code>),
      <b>category</b> types (sleep stages, mindful minutes — enumerated), plus correlations (e.g. blood pressure),
      workouts, and characteristics (DOB, blood type — read-only). Always specify the right
      <code>HKUnit</code> when reading/writing quantities.</p>`,
    level: "senior",
  },
  {
    id: "x4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you read HealthKit data?",
    answerHtml: `<p><code>HKSampleQuery</code> for a one-shot fetch of samples (with predicate + sort), and
      <code>HKStatisticsQuery</code>/<code>HKStatisticsCollectionQuery</code> for aggregates (daily step sums,
      average heart rate) bucketed by interval — let HealthKit do the math rather than summing samples
      yourself.</p>`,
    level: "senior",
  },
  {
    id: "x5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you observe new HealthKit data, including in the background?",
    answerHtml: `<p><code>HKObserverQuery</code> fires when data of a type changes; pair it with
      <code>enableBackgroundDelivery</code> to be woken for updates. Use <code>HKAnchoredObjectQuery</code> to
      fetch only what's new since your last anchor (incremental sync) rather than re-querying everything.</p>`,
    level: "architect",
  },
  {
    id: "x6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you write health data?",
    answerHtml: `<p>Create a sample (e.g. <code>HKQuantitySample</code> with a type, quantity+unit, and date
      range) and <code>save</code> it to the <code>HKHealthStore</code> — requires <b>write</b> (share)
      authorization for that type. Tag samples with metadata/source so they're attributable.</p>`,
    level: "senior",
  },
  {
    id: "x7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How are workouts modeled in HealthKit?",
    answerHtml: `<p>An <code>HKWorkout</code> aggregates duration, energy, distance, and associated samples; you
      build one with <code>HKWorkoutBuilder</code> (and <code>HKWorkoutSession</code> on watchOS for live,
      background-running tracking). Route data (GPS) attaches via <code>HKWorkoutRouteBuilder</code>.</p>`,
    level: "architect",
  },
  {
    id: "x8",
    category: "security",
    categoryLabel: "Security",
    question: "What are HealthKit's privacy rules?",
    answerHtml: `<p>Provide <code>NSHealthShareUsageDescription</code> (read) and
      <code>NSHealthUpdateUsageDescription</code> (write) strings. Health data is highly sensitive: you <b>may
      not</b> use it for advertising or sell it, must disclose use, and should keep it on-device / minimize what
      you collect. Misuse is both a policy and legal risk.</p>`,
    level: "senior",
  },
  {
    id: "x9",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's the HomeKit object model?",
    answerHtml: `<p><code>HMHomeManager</code> → <b>homes</b> → <b>accessories</b> → <b>services</b> (e.g. a
      lightbulb service) → <b>characteristics</b> (power state, brightness). You read/write characteristic values
      and subscribe to their change notifications to control and reflect smart-home devices.</p>`,
    level: "senior",
  },
  {
    id: "x10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What does a HomeKit app require, and how do you control a device?",
    answerHtml: `<p>The HomeKit capability/entitlement plus an <code>NSHomeKitUsageDescription</code> string. To
      control: find the accessory's service, then <code>writeValue</code> on the target characteristic (e.g. set
      brightness) and <code>enableNotification</code> to receive updates. Pairing/setup is handled by HomeKit's
      system UI.</p>`,
    level: "senior",
  },
  {
    id: "x11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does Matter relate to HomeKit?",
    answerHtml: `<p><b>Matter</b> is the cross-ecosystem smart-home standard (works with Apple Home, Google,
      Amazon). On iOS, Matter accessories pair into HomeKit and are controlled through the same
      <code>HMAccessory</code>/characteristic model, so your HomeKit code works with Matter devices too.</p>`,
    level: "architect",
  },
  {
    id: "x12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What does CMMotionManager give you?",
    answerHtml: `<p>Raw and fused motion: <b>accelerometer</b>, <b>gyroscope</b>, <b>magnetometer</b>, and the
      fused <b>device motion</b> (the processed, drift-corrected combination). Set an update interval and start
      updates to a handler/queue. Use a <b>single shared</b> manager — multiple instances conflict.</p>`,
    level: "senior",
  },
  {
    id: "x13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's in CMDeviceMotion and why prefer it?",
    answerHtml: `<p><b>Attitude</b> (roll/pitch/yaw), <b>rotationRate</b>, <b>gravity</b>, and
      <b>userAcceleration</b> (gravity removed). It's sensor-fused, so it's far more stable than raw accelerometer
      data for orientation and motion — use it for tilt controls, AR-ish effects, and step/gesture detection.</p>`,
    level: "senior",
  },
  {
    id: "x14",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What do CMPedometer and CMAltimeter provide?",
    answerHtml: `<p><code>CMPedometer</code> gives step count, distance, pace, and floors — both <b>live</b>
      updates and <b>historical</b> queries (the system logs steps even when your app isn't running).
      <code>CMAltimeter</code> reports <b>relative altitude</b> and barometric pressure (stairs, elevation
      gain).</p>`,
    level: "senior",
  },
  {
    id: "x15",
    category: "security",
    categoryLabel: "Security",
    question: "What about motion activity and its privacy requirement?",
    answerHtml: `<p><code>CMMotionActivityManager</code> classifies movement (stationary, walking, running,
      cycling, automotive) and supports historical queries — efficient, low-power context. It requires the
      <b>Motion &amp; Fitness</b> permission and an <code>NSMotionUsageDescription</code> string.</p>`,
    level: "senior",
  },
  {
    id: "x16",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the sensor best practices?",
    answerHtml: `<p>Choose the <b>lowest update rate</b> that works (high-frequency motion drains battery),
      <b>stop</b> updates when off-screen/idle, deliver to a background queue and hop to main only for UI, and
      <b>check availability</b> (<code>isDeviceMotionAvailable</code>, pedometer/altimeter availability) — not
      every sensor exists on every device.</p>`,
    level: "senior",
  },
];

export const ADVANCED17_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED17_QUIZ: QuizQuestion[] = [
  {
    id: "xz1",
    category: "security",
    categoryLabel: "Security",
    question: "If HealthKit read access is denied, your app:",
    options: ["Gets an error you can detect", "Just sees no data (denial is indistinguishable from no data)", "Crashes", "Is rejected"],
    answer: 1,
    explanationHtml: `<p>For privacy, denied reads are indistinguishable from "no data" — never branch on read
      permission; design for empty results.</p>`,
  },
  {
    id: "xz2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "For a daily step-count total you'd use:",
    options: ["HKSampleQuery and sum manually", "HKStatisticsCollectionQuery (interval aggregates)", "HKObserverQuery", "CMAltimeter"],
    answer: 1,
    explanationHtml: `<p>Statistics (collection) queries bucket and aggregate for you — more efficient and
      correct than summing raw samples.</p>`,
  },
  {
    id: "xz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "To be woken when new health data arrives in the background, use:",
    options: ["A Timer", "HKObserverQuery + enableBackgroundDelivery", "URLSession", "CMPedometer"],
    answer: 1,
    explanationHtml: `<p>An observer query plus background delivery notifies you of changes; pair with an
      anchored query to fetch only what's new.</p>`,
  },
  {
    id: "xz4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "In HomeKit, the on/off state of a bulb is a:",
    options: ["Home", "Accessory", "Characteristic of a service", "Trigger"],
    answer: 2,
    explanationHtml: `<p>Home → accessory → service → <b>characteristic</b>; you read/write the characteristic
      value to control the device.</p>`,
  },
  {
    id: "xz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "For stable device orientation you should read:",
    options: ["Raw accelerometer only", "CMDeviceMotion (sensor-fused attitude/gravity)", "CMPedometer", "The magnetometer alone"],
    answer: 1,
    explanationHtml: `<p>Device motion is fused and drift-corrected — far more stable than raw accelerometer or
      magnetometer for orientation.</p>`,
  },
  {
    id: "xz6",
    category: "security",
    categoryLabel: "Security",
    question: "Motion activity (walking/driving) classification requires:",
    options: ["No permission", "Motion & Fitness permission + NSMotionUsageDescription", "Location Always", "HealthKit"],
    answer: 1,
    explanationHtml: `<p><code>CMMotionActivityManager</code> needs the Motion &amp; Fitness authorization and a
      purpose string in Info.plist.</p>`,
  },
];

export const ADVANCED17_STUDY: StudySection[] = [
  {
    id: "st-adv-41",
    num: "56",
    title: "56 · HealthKit & HomeKit",
    html: `<p><b>HealthKit</b> is a shared, typed health database accessed via <code>HKHealthStore</code>. Read
      with <code>HKSampleQuery</code> (raw) or <code>HKStatistics(Collection)Query</code> (aggregates); observe
      changes with <code>HKObserverQuery</code> + background delivery and sync incrementally with
      <code>HKAnchoredObjectQuery</code>; write <code>HKQuantitySample</code>s with share permission; model
      activity with <code>HKWorkout</code>. Remember: <b>denied reads look like no data</b>, health data is
      extra-sensitive (usage strings, no ads, minimize), and units matter.</p>
    <p><b>HomeKit</b> models smart homes as <code>HMHomeManager</code> → homes → accessories → services →
      characteristics; read/write characteristic values and subscribe to changes (entitlement +
      <code>NSHomeKitUsageDescription</code> required). <b>Matter</b> devices pair into the same model.</p>
    <div class="callout warn"><span class="lbl">Privacy first</span> Both frameworks gate highly personal data —
      request the minimum, explain why, and keep it on-device.</div>`,
  },
  {
    id: "st-adv-42",
    num: "57",
    title: "57 · Motion & sensors (Core Motion)",
    html: `<p><b>What it is.</b> <code>CMMotionManager</code> exposes accelerometer, gyroscope, magnetometer, and
      the fused <b>device motion</b> (attitude, gravity, userAcceleration) — prefer device motion for stable
      orientation. <code>CMPedometer</code> gives live + historical steps/distance/floors (the system logs them
      even when your app is closed), and <code>CMAltimeter</code> gives relative altitude/pressure.
      <code>CMMotionActivityManager</code> classifies movement (walking/driving) cheaply.</p>
    <div class="callout tip"><span class="lbl">Battery</span> Use a single shared manager, the lowest update
      rate that works, stop when idle, deliver to a background queue, and check sensor availability — not every
      device has every sensor. Motion activity needs the Motion &amp; Fitness permission.</div>`,
  },
];
