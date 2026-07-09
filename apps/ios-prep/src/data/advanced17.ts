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
    answerHtml: `<p>HealthKit exists so health data has one trusted, permission-gated home shared across apps —
      that's why Apple centralizes it instead of letting every app keep its own silo. You talk to it through a
      single <code>HKHealthStore</code>, after enabling the HealthKit capability. Data is typed
      (<code>HKQuantityType</code>, <code>HKCategoryType</code>, workouts) and access is per-type and
      permission-gated.</p>
    <p><b>I access HealthKit through a single HKHealthStore instance and treat every read as permission-gated
      by type.</b></p>`,
    level: "senior",
  },
  {
    id: "x2",
    category: "security",
    categoryLabel: "Security",
    question: "What's unusual about HealthKit read authorization?",
    answerHtml: `<p>Apple hides denied-read state from apps to protect privacy — otherwise an app could probe
      which health categories a user is quietly withholding. Mechanically: a denied read just returns no data,
      indistinguishable from "the user has none". Write permission, by contrast, is observable.</p>
    <p>Red flag: writing code that branches on "do I have read permission" — that state isn't exposed for
      reads. Design for empty results instead.</p>
    <p><b>I never gate UI on HealthKit read authorization — an empty result could mean "no permission" or "no
      data," and I design for both the same way.</b></p>`,
    level: "senior",
  },
  {
    id: "x3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the main HealthKit data types and units?",
    answerHtml: `<p>HealthKit standardizes data into typed categories so every app and write source agrees on
      meaning — that's what makes health data from different sources actually mergeable. <b>Quantity</b> types
      (steps, heart rate, energy — numeric with an <code>HKUnit</code>), <b>category</b> types (sleep stages,
      mindful minutes — enumerated), plus correlations (e.g. blood pressure), workouts, and characteristics
      (DOB, blood type — read-only).</p>
    <p><b>I always specify the right HKUnit when reading or writing quantities — a wrong unit silently
      corrupts the value, it doesn't throw.</b></p>`,
    level: "senior",
  },
  {
    id: "x4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you read HealthKit data?",
    answerHtml: `<p>Summing raw samples yourself is slow and error-prone — duplicate samples from multiple
      sources, unit mismatches — which is why HealthKit gives you server-side aggregation instead.
      <code>HKSampleQuery</code> is for a one-shot fetch of samples (with predicate + sort);
      <code>HKStatisticsQuery</code>/<code>HKStatisticsCollectionQuery</code> compute aggregates (daily step
      sums, average heart rate) bucketed by interval.</p>
    <p>Red flag: fetching every sample and summing it in app code. For aggregates, let HealthKit do the math
      with a statistics query.</p>
    <p><b>I reach for a statistics query for any aggregate, and reserve sample queries for the raw list a user
      actually needs to see.</b></p>`,
    level: "senior",
  },
  {
    id: "x5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you observe new HealthKit data, including in the background?",
    answerHtml: `<p>Health data changes outside your app's lifecycle — other apps write to the store, the
      Watch logs steps — so you need a push mechanism, not polling. <code>HKObserverQuery</code> fires when
      data of a type changes; pair it with <code>enableBackgroundDelivery</code> to be woken for updates.</p>
    <p><b>I use HKAnchoredObjectQuery to fetch only what's new since my last anchor — re-querying everything
      on every wake is the mistake that kills battery.</b></p>`,
    level: "architect",
  },
  {
    id: "x6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you write health data?",
    answerHtml: `<p>Writing straight to the shared HealthKit store — instead of your own database — means every
      other authorized app and the user's Health dashboard sees the same data, so provenance matters. Create a
      sample (e.g. <code>HKQuantitySample</code> with a type, quantity+unit, and date range) and
      <code>save</code> it to the <code>HKHealthStore</code> — requires <b>write</b> (share) authorization for
      that type.</p>
    <p><b>I tag every sample with metadata and a source so it's attributable when multiple apps write to the
      same type.</b></p>`,
    level: "senior",
  },
  {
    id: "x7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How are workouts modeled in HealthKit?",
    answerHtml: `<p>A workout needs a start/end, live state, and background-execution guarantees a plain
      sample can't give you, so it's modeled as its own aggregate object rather than a bag of samples. An
      <code>HKWorkout</code> aggregates duration, energy, distance, and associated samples; you build one with
      <code>HKWorkoutBuilder</code>. Route data (GPS) attaches via <code>HKWorkoutRouteBuilder</code>.</p>
    <p><b>On watchOS I use HKWorkoutSession specifically because it's what keeps the app alive in the
      background during a live workout.</b></p>`,
    level: "architect",
  },
  {
    id: "x8",
    category: "security",
    categoryLabel: "Security",
    question: "What are HealthKit's privacy rules?",
    answerHtml: `<p>Health data carries real-world consequences — insurance discrimination, employer
      profiling — so Apple treats it as its own trust tier with its own rules, not just another permission.
      Provide <code>NSHealthShareUsageDescription</code> (read) and <code>NSHealthUpdateUsageDescription</code>
      (write) strings.</p>
    <p>Red flag: treating health data like analytics data. You <b>may not</b> use it for advertising or sell
      it, must disclose use, and should keep it on-device / minimize what you collect.</p>
    <p><b>I design HealthKit features around "collect the minimum, disclose clearly, never monetize" — misuse
      here is both a policy rejection and a legal risk.</b></p>`,
    level: "senior",
  },
  {
    id: "x9",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's the HomeKit object model?",
    answerHtml: `<p>HomeKit models a home as a hierarchy so an app can address "the state of one bulb" without
      knowing anything about the rest of the home. <code>HMHomeManager</code> → <b>homes</b> → <b>accessories</b>
      → <b>services</b> (e.g. a lightbulb service) → <b>characteristics</b> (power state, brightness).</p>
    <p><b>I read/write characteristic values directly and subscribe to their change notifications to keep my
      UI in sync with the real device state.</b></p>`,
    level: "senior",
  },
  {
    id: "x10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What does a HomeKit app require, and how do you control a device?",
    answerHtml: `<p>HomeKit hides pairing and network discovery behind its own system UI — letting every app
      roll its own Bluetooth/Wi-Fi pairing flow would be a security and UX disaster. An app needs the HomeKit
      capability/entitlement plus an <code>NSHomeKitUsageDescription</code> string.</p>
    <p><b>To control a device: find the accessory's service, then writeValue on the target characteristic
      (e.g. set brightness) and enableNotification to receive updates.</b></p>`,
    level: "senior",
  },
  {
    id: "x11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does Matter relate to HomeKit?",
    answerHtml: `<p>Matter exists so smart-home vendors don't have to build a separate integration for every
      ecosystem — it's the cross-ecosystem standard (works with Apple Home, Google, Amazon). On iOS, Matter
      accessories pair into HomeKit and are controlled through the same <code>HMAccessory</code>/characteristic
      model.</p>
    <p><b>I don't write Matter-specific code on iOS — once a Matter device is paired, it's just another
      HMAccessory.</b></p>`,
    level: "architect",
  },
  {
    id: "x12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What does CMMotionManager give you?",
    answerHtml: `<p>Core Motion separates raw sensor readings from the fused result because raw
      accelerometer/gyro data is noisy and drifts — most orientation and motion features actually want the
      corrected version. <code>CMMotionManager</code> gives you <b>accelerometer</b>, <b>gyroscope</b>,
      <b>magnetometer</b>, and the fused <b>device motion</b> (the processed, drift-corrected combination). Set
      an update interval and start updates to a handler/queue.</p>
    <p>Red flag: creating a CMMotionManager per view controller. Use a <b>single shared</b> instance — multiple
      instances conflict over the same hardware.</p>
    <p><b>I keep one shared CMMotionManager for the whole app and hand out its data, rather than letting each
      screen own its own instance.</b></p>`,
    level: "senior",
  },
  {
    id: "x13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's in CMDeviceMotion and why prefer it?",
    answerHtml: `<p>Raw accelerometer data mixes gravity, device rotation, and real motion together, so anything
      built directly on it — tilt controls, step detection — inherits that noise. <code>CMDeviceMotion</code>
      gives you <b>attitude</b> (roll/pitch/yaw), <b>rotationRate</b>, <b>gravity</b>, and
      <b>userAcceleration</b> (gravity removed), all sensor-fused.</p>
    <p><b>I default to CMDeviceMotion over raw accelerometer for orientation and motion work — it's far more
      stable for tilt controls, AR-ish effects, and step/gesture detection.</b></p>`,
    level: "senior",
  },
  {
    id: "x14",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What do CMPedometer and CMAltimeter provide?",
    answerHtml: `<p>The system logs steps continuously at the OS level, independent of whether your app is
      running, so <code>CMPedometer</code> can answer historical questions ("how many steps yesterday") without
      your app ever having been open. It gives step count, distance, pace, and floors — both <b>live</b>
      updates and <b>historical</b> queries. <code>CMAltimeter</code> reports <b>relative altitude</b> and
      barometric pressure (stairs, elevation gain).</p>
    <p><b>For a fitness feature I reach for CMPedometer's historical query first — I don't need to have been
      running in the background to answer "how many steps today."</b></p>`,
    level: "senior",
  },
  {
    id: "x15",
    category: "security",
    categoryLabel: "Security",
    question: "What about motion activity and its privacy requirement?",
    answerHtml: `<p>Classifying "walking vs. driving" reveals a lot about a user's life, so Apple gates it
      behind its own permission rather than folding it into Location. <code>CMMotionActivityManager</code>
      classifies movement (stationary, walking, running, cycling, automotive) and supports historical queries —
      efficient, low-power context.</p>
    <p>Red flag: assuming Location or HealthKit permission covers this — it requires its own <b>Motion &amp;
      Fitness</b> permission and an <code>NSMotionUsageDescription</code> string.</p>
    <p><b>I request Motion &amp; Fitness explicitly and never assume Location or HealthKit access carries over
      to activity classification.</b></p>`,
    level: "senior",
  },
  {
    id: "x16",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the sensor best practices?",
    answerHtml: `<p>Sensors are one of the fastest ways to drain a battery and stall the main thread, so treat
      every subscription as a cost, not a freebie:</p>
    <ul>
      <li>1. <b>Rate</b> — choose the lowest update rate that actually satisfies the feature; high-frequency
        motion drains battery.</li>
      <li>2. <b>Lifecycle</b> — stop updates the moment you're off-screen or idle.</li>
      <li>3. <b>Threading</b> — deliver to a background queue and hop to main only for UI.</li>
      <li>4. <b>Availability</b> — check <code>isDeviceMotionAvailable</code>, pedometer/altimeter
        availability; not every sensor exists on every device.</li>
    </ul>
    <p><b>I treat every sensor subscription like a resource with a lifecycle — start late, stop early, check
      availability first.</b></p>`,
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
    explanationHtml: `<p>For privacy, denied reads are indistinguishable from "no data" — there's no error to
      catch. The tempting wrong answer assumes read authorization behaves like write authorization, which is
      observable; reads aren't. Design for empty results instead.</p>`,
  },
  {
    id: "xz2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "For a daily step-count total you'd use:",
    options: ["HKSampleQuery and sum manually", "HKStatisticsCollectionQuery (interval aggregates)", "HKObserverQuery", "CMAltimeter"],
    answer: 1,
    explanationHtml: `<p>Statistics (collection) queries bucket and aggregate for you server-side — more
      efficient and correct than summing raw samples. Summing manually (the tempting option) breaks with
      duplicate samples from multiple sources and forces you to reimplement interval bucketing yourself.</p>`,
  },
  {
    id: "xz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "To be woken when new health data arrives in the background, use:",
    options: ["A Timer", "HKObserverQuery + enableBackgroundDelivery", "URLSession", "CMPedometer"],
    answer: 1,
    explanationHtml: `<p>An observer query plus background delivery is a push mechanism — it wakes you only
      when data actually changes. A Timer (the tempting option) polls on a schedule regardless of whether
      anything changed, wasting battery. Pair the observer with an anchored query to fetch only what's new.</p>`,
  },
  {
    id: "xz4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "In HomeKit, the on/off state of a bulb is a:",
    options: ["Home", "Accessory", "Characteristic of a service", "Trigger"],
    answer: 2,
    explanationHtml: `<p>Home → accessory → service → <b>characteristic</b>; you read/write the characteristic
      value to control the device. "Accessory" (the tempting wrong answer) is the whole physical device — the
      on/off state lives one level deeper, on a specific characteristic of one of its services.</p>`,
  },
  {
    id: "xz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "For stable device orientation you should read:",
    options: ["Raw accelerometer only", "CMDeviceMotion (sensor-fused attitude/gravity)", "CMPedometer", "The magnetometer alone"],
    answer: 1,
    explanationHtml: `<p>Device motion is fused and drift-corrected — far more stable than raw accelerometer or
      magnetometer for orientation. Raw accelerometer alone (the tempting option) mixes in gravity and device
      rotation, so it drifts and jitters without the sensor fusion CMDeviceMotion already does for you.</p>`,
  },
  {
    id: "xz6",
    category: "security",
    categoryLabel: "Security",
    question: "Motion activity (walking/driving) classification requires:",
    options: ["No permission", "Motion & Fitness permission + NSMotionUsageDescription", "Location Always", "HealthKit"],
    answer: 1,
    explanationHtml: `<p><code>CMMotionActivityManager</code> needs its own Motion &amp; Fitness authorization
      and a purpose string in Info.plist — it's a separate permission, not one you get for free from Location
      or HealthKit access, even though motion activity feels adjacent to both.</p>`,
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
      request the minimum, explain why, and keep it on-device.</div>
    <p><b>Say this:</b> "I treat HealthKit reads as permission-agnostic — an empty result could mean denied or
      just no data, so I never branch on read authorization."</p>`,
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
      device has every sensor. Motion activity needs the Motion &amp; Fitness permission.</div>
    <p><b>Say this:</b> "I treat every sensor subscription as a resource with a lifecycle — lowest rate that
      works, stop when idle, and I default to CMDeviceMotion over raw accelerometer for anything orientation
      related."</p>`,
  },
];
