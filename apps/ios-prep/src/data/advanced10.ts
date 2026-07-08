// Advanced batch 10 — MapKit & location (mid/senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED10_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED10_FLASHCARDS: Flashcard[] = [
  {
    id: "n1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is the modern SwiftUI Map (iOS 17)?",
    answerHtml: `<p>SwiftUI's <code>Map</code> replaced the awkward <code>UIViewRepresentable</code> wrapper around
      <code>MKMapView</code> — you declare map content the same way you declare any other view, via a
      <b>MapContentBuilder</b> closure (markers, annotations, overlays), driven by a camera <code>position</code>
      binding.</p>
    <div class="code">Map(position: $camera) {
  Marker("Home", coordinate: home)
  MapPolyline(coordinates: route).stroke(.blue, lineWidth: 4)
}</div>
    <p><b>"I declare map content the same way I declare any SwiftUI view — no more bridging MKMapView through a
      representable."</b></p>`,
    level: "mid",
  },
  {
    id: "n2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What content can you put on a Map?",
    answerHtml: `<p>Reach for the built-in <code>Marker</code> first — it's a standard system pin that's cheap to
      render at scale and stays visually consistent with the rest of Maps. Drop to a custom <code>Annotation</code>
      (your own SwiftUI view at a coordinate) only when the design needs a bespoke look; overlays
      <code>MapPolyline</code>, <code>MapCircle</code>, <code>MapPolygon</code> draw routes and regions on top.</p>
    <p><b>"I default to Marker for pins and only reach for Annotation when the design needs a custom view — it's
      heavier at scale."</b></p>`,
    level: "mid",
  },
  {
    id: "n3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you control the map camera?",
    answerHtml: `<p>The camera is just state, so you drive it the same way you'd drive any SwiftUI binding — not with an
      imperative "move to" call. Bind a <code>MapCameraPosition</code>: <code>.region(...)</code>,
      <code>.rect(...)</code>, <code>.camera(...)</code> (pitch/heading), <code>.userLocation(fallback:)</code>, or
      <code>.automatic</code> (frame the content). Mutate the binding (often inside <code>withAnimation</code>) to
      move the camera; read changes back via <code>onMapCameraChange</code>.</p>
    <p><b>"I treat the camera as bound state, not an imperative call — that's what lets me animate it and read it
      back."</b></p>`,
    level: "senior",
  },
  {
    id: "n4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you show the user's location on the map?",
    answerHtml: `<p>Location on a map is a privacy feature before it's a UI feature — the blue dot only exists once
      the user has explicitly granted access. Add <code>UserAnnotation()</code> to the map content and a
      <code>MapUserLocationButton</code> (in <code>.mapControls</code>) to recenter, but design for "no permission"
      as the default state, not the edge case: When In Use is enough to grant it.</p>
    <p>Red flag: assuming the dot always appears just because you added <code>UserAnnotation()</code> — denied or
      not-yet-asked users should see a sensible fallback, not a blank map.</p>
    <p><b>"UserAnnotation shows the blue dot, but only after When In Use is granted — I always design for the
      denied state too."</b></p>`,
    level: "mid",
  },
  {
    id: "n5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What map controls and styles are available?",
    answerHtml: `<p>Map chrome is opt-in and composable rather than bundled by default — you assemble exactly the
      controls a screen needs. Add them via <code>.mapControls { }</code>: <code>MapCompass</code>,
      <code>MapScaleView</code>, <code>MapPitchToggle</code>, <code>MapUserLocationButton</code>. Style with
      <code>.mapStyle(.standard / .imagery / .hybrid)</code> (with options like elevation and points of
      interest).</p>
    <p><b>"I only add the map controls a screen actually needs — a nav view wants compass and pitch, a store
      locator usually wants neither."</b></p>`,
    level: "mid",
  },
  {
    id: "n6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is Look Around and how do you show it?",
    answerHtml: `<p>Look Around gives street-level imagery without leaving the app, but coverage isn't guaranteed
      for every coordinate — treat the request as fallible, not a sure thing. Fetch a scene with
      <code>MKLookAroundSceneRequest(coordinate:)</code>, then present <code>LookAroundPreview(scene:)</code> (a
      SwiftUI view) or push a full Look Around viewer.</p>
    <p>Red flag: presenting <code>LookAroundPreview</code> without checking for a nil scene first — coverage gaps
      are common outside major cities.</p>
    <p><b>"I always check for a nil scene before presenting Look Around — coverage isn't universal."</b></p>`,
    level: "senior",
  },
  {
    id: "n7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you search for places?",
    answerHtml: `<p>Place search splits into two APIs by intent — a full query returns results, but live
      suggestions need something fast and cheap enough to fire on every keystroke. <code>MKLocalSearch</code> runs
      a natural-language POI/address query within a region and returns <code>MKMapItem</code>s; for as-you-type
      suggestions use <code>MKLocalSearchCompleter</code> (streams completions you then resolve). Scope the search
      region to keep results relevant and fast.</p>
    <p><b>"I use the completer for live suggestions and MKLocalSearch to resolve the final query — trying to do
      both with one API is the wrong shape."</b></p>`,
    level: "senior",
  },
  {
    id: "n8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you get directions and ETAs?",
    answerHtml: `<p>Turn-by-turn UI is a rendering problem sitting on top of a routing problem — MapKit solves the
      routing and hands you geometry to draw. <code>MKDirections</code> with an <code>MKDirections.Request</code>
      (source, destination, transport type) returns routes with geometry (<code>polyline</code>), distance,
      expected travel time, and step-by-step instructions; draw the route as a <code>MapPolyline</code>.</p>
    <p><b>"MKDirections gives me the route and ETA — I just render the polyline it returns."</b></p>`,
    level: "senior",
  },
  {
    id: "n9",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you convert between addresses and coordinates?",
    answerHtml: `<p>Address↔coordinate conversion is network-backed and rate-limited, so it's a caching problem as
      much as an API call. <b>Geocoding</b> with <code>CLGeocoder</code> goes forward (<code>geocodeAddressString</code>:
      address → coordinate) and reverse (<code>reverseGeocodeLocation</code>: coordinate → placemark/address).</p>
    <p>Red flag: calling <code>CLGeocoder</code> on every keystroke or map pan — debounce calls and cache results,
      or you'll hit the rate limit.</p>
    <p><b>"Geocoding is rate-limited and network-backed, so I debounce and cache — I never fire it on every
      keystroke."</b></p>`,
    level: "mid",
  },
  {
    id: "n10",
    category: "security",
    categoryLabel: "Security",
    question: "How do you request location authorization?",
    answerHtml: `<p>Location is the most scrutinized permission in App Review, so the ask has to match the actual
      need. Create a <code>CLLocationManager</code>, set a delegate, and call
      <code>requestWhenInUseAuthorization()</code> for foreground use or <code>requestAlwaysAuthorization()</code>
      only if background tracking is essential; read the result in
      <code>locationManagerDidChangeAuthorization</code> and handle denied/restricted states explicitly.</p>
    <p>Red flag: defaulting to <code>requestAlwaysAuthorization()</code> "just in case" — Always is a common App
      Review rejection when When In Use would do.</p>
    <p><b>"I request the least access the feature needs — Always only when background tracking is the actual
      feature, not a convenience."</b></p>`,
    level: "senior",
  },
  {
    id: "n11",
    category: "security",
    categoryLabel: "Security",
    question: "What is precise vs approximate location?",
    answerHtml: `<p>Since iOS 14, precision is a user-controlled dial, not a given — your feature has to degrade
      gracefully when it's turned down. The user can grant <b>approximate</b> (~few km) instead of precise
      location; check <code>accuracyAuthorization</code>, and if it's <code>.reducedAccuracy</code> and your
      feature truly needs precision (turn-by-turn), request a <b>temporary</b> full-accuracy boost with
      <code>requestTemporaryFullAccuracyAuthorization(withPurposeKey:)</code> (needs an Info.plist purpose entry).</p>
    <p>Red flag: requesting temporary full accuracy for features that don't need street-level precision (a store
      locator, weather by city) — that's an unnecessary privacy ask; most features should just work with
      approximate.</p>
    <p><b>"I check accuracyAuthorization first and only ask for temporary full accuracy when the feature genuinely
      can't work with approximate location."</b></p>`,
    level: "senior",
  },
  {
    id: "n12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the ways to receive location updates?",
    answerHtml: `<p>The update mode you pick is really a battery-vs-freshness trade-off, and the wrong default is
      the single biggest drain in a location-heavy app. <b>Continuous</b> (<code>startUpdatingLocation</code>) is
      the most accurate and the most expensive; <b>significant-change</b> (cell/Wi-Fi based) is low power and
      works in background; <b>region monitoring</b> (geofences) fires only on enter/exit of a circular region; and
      <b>visits</b> reports arrivals/departures at meaningful places.</p>
    <p><b>"I pick the coarsest update mode that meets the need — continuous only when the feature is actively
      tracking movement in real time."</b></p>`,
    level: "senior",
  },
  {
    id: "n13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What does background location require?",
    answerHtml: `<p>Background location is gated at three layers on purpose — Apple wants it to be a deliberate,
      visible feature, not a silent background process. It needs <b>Always</b> authorization, the Location
      <b>background mode</b> capability, and (for continuous updates) <code>allowsBackgroundLocationUpdates = true</code>;
      iOS shows a status indicator and periodically re-prompts the user to confirm continued Always access.</p>
    <p>Red flag: reaching for continuous background updates by default — use significant-change or region
      monitoring whenever the feature tolerates coarser updates, or you'll drain the battery and draw user
      suspicion.</p>
    <p><b>"Background location is Always plus the background mode capability plus
      allowsBackgroundLocationUpdates — and I default to significant-change or geofences to avoid draining the
      battery."</b></p>`,
    level: "architect",
  },
  {
    id: "n14",
    category: "security",
    categoryLabel: "Security",
    question: "What privacy strings does location need?",
    answerHtml: `<p>Purpose strings aren't boilerplate — they're the justification App Review (and the user) reads
      before granting access, so vague copy is a rejection risk. Populate <code>Info.plist</code>:
      <code>NSLocationWhenInUseUsageDescription</code>, and for background
      <code>NSLocationAlwaysAndWhenInUseUsageDescription</code>, plus
      <code>NSLocationTemporaryUsageDescriptionDictionary</code> for temporary full accuracy.</p>
    <p>Red flag: a generic string like "This app uses your location" — it doesn't justify the specific feature,
      and combined with an unnecessary Always request it's a common App Review rejection.</p>
    <p><b>"Every purpose string names the specific feature that needs location — vague copy plus over-asking for
      Always is the classic rejection combo."</b></p>`,
    level: "senior",
  },
  {
    id: "n15",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is the modern async location API (iOS 17)?",
    answerHtml: `<p>The delegate callback model existed because Swift had no native async story for streams of
      events — <code>AsyncSequence</code> removes that boilerplate entirely. <code>CLLocationUpdate.liveUpdates()</code>
      gives you an <b>AsyncSequence</b> of location updates you consume with <code>for await update in …</code>,
      and it reports conditions like <code>isStationary</code> — no delegate, no manual state juggling.</p>
    <p><b>"For foreground updates I reach for CLLocationUpdate.liveUpdates() first — it's the same data as the
      delegate API without the callback boilerplate."</b></p>`,
    level: "senior",
  },
  {
    id: "n16",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the battery best practices for location?",
    answerHtml: `<p>Location is one of the biggest battery drains in the App Store when misused, so treat every
      location feature as a budget, not a switch you flip on: <b>1.</b> request the lowest accuracy that works
      (<code>desiredAccuracy</code>); <b>2.</b> set a <code>distanceFilter</code> so you're not notified for
      meter-scale noise; <b>3.</b> stop updates the moment the feature doesn't need them; <b>4.</b> prefer
      significant-change or region monitoring over continuous tracking wherever the feature tolerates it;
      <b>5.</b> avoid Always/background authorization unless the feature genuinely runs in the background.</p>
    <p><b>"I treat location accuracy and update frequency as a battery budget — coarsest mode and lowest accuracy
      that still meets the need."</b></p>`,
    level: "senior",
  },
];

export const ADVANCED10_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED10_QUIZ: QuizQuestion[] = [
  {
    id: "nz1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "In the iOS 17 SwiftUI Map, you add pins with:",
    options: ["MKMapView delegate methods", "Marker / Annotation in a MapContentBuilder", "UIView overlays", "a ForEach of buttons"],
    answer: 1,
    explanationHtml: `<p>The iOS 17 <code>Map</code> takes a <code>MapContentBuilder</code> closure — use
      <code>Marker</code> for standard pins and <code>Annotation</code> for custom SwiftUI views. The tempting
      wrong answer, <code>MKMapView</code> delegate methods, is the pre-iOS-17 UIKit-bridging pattern that SwiftUI's
      Map replaced entirely.</p>`,
  },
  {
    id: "nz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "The blue user-location dot appears only when:",
    options: ["Always", "The user has granted location permission", "Wi-Fi is on", "You call MKDirections"],
    answer: 1,
    explanationHtml: `<p><code>UserAnnotation</code> requires location authorization — When In Use is enough, so the
      tempting "Always" answer overstates the requirement. No permission granted, no dot, regardless of Wi-Fi or
      any call to <code>MKDirections</code>.</p>`,
  },
  {
    id: "nz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "As-you-type place suggestions use:",
    options: ["CLGeocoder", "MKLocalSearchCompleter", "MKDirections", "MapPolyline"],
    answer: 1,
    explanationHtml: `<p><code>MKLocalSearchCompleter</code> streams completions as the user types, which you then
      resolve. <code>MKLocalSearch</code> is the tempting wrong answer — it's right for the final query, but it
      runs a full search and is too slow and heavy to call on every keystroke.</p>`,
  },
  {
    id: "nz4",
    category: "security",
    categoryLabel: "Security",
    question: "Since iOS 14, a user may grant location that is:",
    options: ["Always precise", "Approximate (reduced accuracy)", "Server-side only", "Disabled for all apps"],
    answer: 1,
    explanationHtml: `<p>Since iOS 14 the user can grant approximate location instead of precise, so
      "Always precise" is the outdated pre-iOS-14 mental model — the tempting wrong answer. Check
      <code>accuracyAuthorization</code> and request temporary full accuracy only when the feature truly needs
      precision; most features should just handle approximate.</p>`,
  },
  {
    id: "nz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "For low-power background location, prefer:",
    options: ["Continuous startUpdatingLocation", "Significant-change or region monitoring", "A timer polling GPS", "Reverse geocoding in a loop"],
    answer: 1,
    explanationHtml: `<p>Significant-change and region monitoring wake your app only when it matters, at a
      fraction of the battery cost. Continuous <code>startUpdatingLocation</code> is the tempting wrong answer —
      it's the most accurate mode, but also the most expensive, which is the opposite of what the question asks
      for.</p>`,
  },
  {
    id: "nz6",
    category: "security",
    categoryLabel: "Security",
    question: "A common App Review rejection around location is:",
    options: ["Using MapKit at all", "Requesting Always with a vague purpose string when When-In-Use suffices", "Drawing a polyline", "Showing a compass"],
    answer: 1,
    explanationHtml: `<p>Over-asking for Always access with a vague <code>Info.plist</code> purpose string gets
      flagged — request the least access you need and justify it clearly. Using MapKit itself, drawing a
      polyline, or showing a compass are normal, unflagged usage; the rejection is about over-asking for access,
      not about the framework.</p>`,
  },
];

export const ADVANCED10_STUDY: StudySection[] = [
  {
    id: "st-adv-27",
    num: "42",
    title: "42 · MapKit in SwiftUI: maps, markers & search",
    html: `<p><b>Why it matters.</b> Interviewers use MapKit questions to check whether you reach for the
      declarative SwiftUI API or still describe the old UIKit-bridging dance — the iOS 17 <code>Map</code> is the
      answer they want to hear.</p>
    <p><b>What it is.</b> The iOS 17 <code>Map</code> uses a <b>MapContentBuilder</b>: declare
      <code>Marker</code>s, custom <code>Annotation</code>s, and overlays (<code>MapPolyline</code>,
      <code>MapCircle</code>) like views. Drive the view with a <code>MapCameraPosition</code> binding
      (<code>.region</code>, <code>.automatic</code>, <code>.userLocation</code>), add <code>.mapControls</code>
      (compass, scale, user-location button), and pick a <code>.mapStyle</code>.</p>
    <p>Beyond display: <b>MKLocalSearch</b> / <code>MKLocalSearchCompleter</code> for place search, <b>MKDirections</b>
      for routes + ETAs, <b>CLGeocoder</b> for address↔coordinate, and <b>Look Around</b>
      (<code>LookAroundPreview</code>) for street-level imagery.</p>
    <div class="callout tip"><span class="lbl">Marker vs Annotation</span> Use <code>Marker</code> for standard
      pins; reach for <code>Annotation</code> only when you need a custom SwiftUI view (it's heavier at
      scale).</div>
    <p><b>Say this:</b> "I build maps declaratively with MapContentBuilder, drive the camera with a binding, and
      only reach for Look Around or local search when the feature needs it."</p>`,
  },
  {
    id: "st-adv-28",
    num: "43",
    title: "43 · CoreLocation: authorization, accuracy & battery",
    html: `<p><b>Why it matters.</b> Location is the permission interviewers probe hardest — the wrong default
      (Always, continuous updates, vague purpose strings) is a real App Review and battery liability, not just
      trivia.</p>
    <p><b>What it is.</b> <code>CLLocationManager</code> + delegate (or the iOS 17
      <code>CLLocationUpdate.liveUpdates()</code> async sequence). Request <b>When In Use</b> by default and
      <b>Always</b> only if you need background; handle denied/restricted. Respect <b>approximate vs precise</b>
      (iOS 14+) — check <code>accuracyAuthorization</code> and request temporary full accuracy only when truly
      needed.</p>
    <p>Choose the right update mode — continuous, significant-change, region monitoring, or visits — by power
      cost. Background location needs Always + the Location background mode. Provide clear
      <code>Info.plist</code> purpose strings; over-asking is a privacy and App Review problem.</p>
    <div class="callout warn"><span class="lbl">Battery</span> Use the lowest accuracy that works, set a
      <code>distanceFilter</code>, and stop updates when idle — misused location is a top battery drain.</div>
    <p><b>Say this:</b> "I request the least access and the coarsest update mode the feature needs, and I always
      design for denied/approximate as the default state, not the exception."</p>`,
  },
];
