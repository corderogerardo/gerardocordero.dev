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
    answerHtml: `<p>A <code>Map</code> view with a <b>MapContentBuilder</b> closure — you declare content
      (markers, annotations, overlays) the way you declare views, instead of the old
      <code>MKMapView</code>-via-representable approach. It also takes a camera <code>position</code> binding.</p>
    <div class="code">Map(position: $camera) {
  Marker("Home", coordinate: home)
  MapPolyline(coordinates: route).stroke(.blue, lineWidth: 4)
}</div>`,
    level: "mid",
  },
  {
    id: "n2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What content can you put on a Map?",
    answerHtml: `<p><code>Marker</code> (a standard balloon pin with label/icon), <code>Annotation</code> (your
      own SwiftUI view at a coordinate), and overlays <code>MapPolyline</code>, <code>MapCircle</code>,
      <code>MapPolygon</code>. Use <code>Marker</code> for simple pins and <code>Annotation</code> when you need a
      custom view.</p>`,
    level: "mid",
  },
  {
    id: "n3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you control the map camera?",
    answerHtml: `<p>Bind a <code>MapCameraPosition</code>: <code>.region(...)</code>, <code>.rect(...)</code>,
      <code>.camera(...)</code> (pitch/heading), <code>.userLocation(fallback:)</code>, or
      <code>.automatic</code> (frame the content). Mutate the binding (often inside <code>withAnimation</code>)
      to move the camera; read changes via <code>onMapCameraChange</code>.</p>`,
    level: "senior",
  },
  {
    id: "n4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you show the user's location on the map?",
    answerHtml: `<p>Add <code>UserAnnotation()</code> to the map content and a
      <code>MapUserLocationButton</code> (in <code>.mapControls</code>) to recenter — but it only shows once the
      user has <b>granted location permission</b> (When In Use is enough). No permission, no blue dot.</p>`,
    level: "mid",
  },
  {
    id: "n5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What map controls and styles are available?",
    answerHtml: `<p>Controls via <code>.mapControls { }</code>: <code>MapCompass</code>,
      <code>MapScaleView</code>, <code>MapPitchToggle</code>, <code>MapUserLocationButton</code>. Style with
      <code>.mapStyle(.standard / .imagery / .hybrid)</code> (with options like elevation and points of
      interest).</p>`,
    level: "mid",
  },
  {
    id: "n6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is Look Around and how do you show it?",
    answerHtml: `<p>Street-level imagery. Fetch a scene with <code>MKLookAroundSceneRequest(coordinate:)</code>,
      then present <code>LookAroundPreview(scene:)</code> (a SwiftUI view) or push a full Look Around viewer. Not
      available everywhere — handle a nil scene gracefully.</p>`,
    level: "senior",
  },
  {
    id: "n7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you search for places?",
    answerHtml: `<p><code>MKLocalSearch</code> runs a natural-language POI/address query within a region and
      returns <code>MKMapItem</code>s. For as-you-type suggestions use <code>MKLocalSearchCompleter</code>
      (delivers completions you then resolve). Scope the search region to get relevant, fast results.</p>`,
    level: "senior",
  },
  {
    id: "n8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you get directions and ETAs?",
    answerHtml: `<p><code>MKDirections</code> with an <code>MKDirections.Request</code> (source, destination,
      transport type) returns routes with geometry (<code>polyline</code>), distance, expected travel time, and
      step-by-step instructions. Draw the route as a <code>MapPolyline</code>.</p>`,
    level: "senior",
  },
  {
    id: "n9",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you convert between addresses and coordinates?",
    answerHtml: `<p><b>Geocoding</b> with <code>CLGeocoder</code>: forward (<code>geocodeAddressString</code>:
      address → coordinate) and reverse (<code>reverseGeocodeLocation</code>: coordinate → placemark/address).
      It's rate-limited and network-backed, so debounce calls and cache results.</p>`,
    level: "mid",
  },
  {
    id: "n10",
    category: "security",
    categoryLabel: "Security",
    question: "How do you request location authorization?",
    answerHtml: `<p>Create a <code>CLLocationManager</code>, set a delegate, and call
      <code>requestWhenInUseAuthorization()</code> (foreground) or <code>requestAlwaysAuthorization()</code>
      (background) — only ask for <b>Always</b> if you truly need it. Read the result in
      <code>locationManagerDidChangeAuthorization</code> and handle denied/restricted states.</p>`,
    level: "senior",
  },
  {
    id: "n11",
    category: "security",
    categoryLabel: "Security",
    question: "What is precise vs approximate location?",
    answerHtml: `<p>Since iOS 14 the user can grant <b>approximate</b> (~few km) instead of precise location.
      Check <code>accuracyAuthorization</code>; if it's <code>.reducedAccuracy</code> and your feature truly
      needs precision (turn-by-turn), request a <b>temporary</b> full-accuracy boost with
      <code>requestTemporaryFullAccuracyAuthorization(withPurposeKey:)</code> (needs an Info.plist purpose entry).
      Most features should work with approximate.</p>`,
    level: "senior",
  },
  {
    id: "n12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the ways to receive location updates?",
    answerHtml: `<p><b>Continuous</b> (<code>startUpdatingLocation</code> — most accurate, most battery),
      <b>significant-change</b> (cell/Wi-Fi based, low power, works in background), <b>region monitoring</b>
      (geofences — enter/exit a circular region), and <b>visits</b> (arrivals/departures at meaningful places).
      Pick the coarsest one that meets the need.</p>`,
    level: "senior",
  },
  {
    id: "n13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What does background location require?",
    answerHtml: `<p><b>Always</b> authorization, the Location <b>background mode</b> capability, and (for
      continuous background updates) <code>allowsBackgroundLocationUpdates = true</code>. iOS shows a status
      indicator and will prompt the user to confirm continued Always access. Use significant-change/regions to
      avoid draining the battery.</p>`,
    level: "architect",
  },
  {
    id: "n14",
    category: "security",
    categoryLabel: "Security",
    question: "What privacy strings does location need?",
    answerHtml: `<p>Purpose strings in <code>Info.plist</code>:
      <code>NSLocationWhenInUseUsageDescription</code>, and for background
      <code>NSLocationAlwaysAndWhenInUseUsageDescription</code>, plus
      <code>NSLocationTemporaryUsageDescriptionDictionary</code> for temporary full accuracy. They must clearly
      justify the use — vague strings (and over-asking for Always) are common App Review rejections.</p>`,
    level: "senior",
  },
  {
    id: "n15",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is the modern async location API (iOS 17)?",
    answerHtml: `<p><code>CLLocationUpdate.liveUpdates()</code> gives an <b>AsyncSequence</b> of location
      updates you consume with <code>for await update in …</code> — no delegate boilerplate, and it reports
      conditions like <code>isStationary</code>. A cleaner alternative to the
      <code>CLLocationManagerDelegate</code> callback model for foreground updates.</p>`,
    level: "senior",
  },
  {
    id: "n16",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the battery best practices for location?",
    answerHtml: `<p>Request the <b>lowest accuracy</b> that works (<code>desiredAccuracy</code>), stop updates
      when you don't need them, prefer significant-change/region monitoring over continuous, set a
      <code>distanceFilter</code>, and avoid Always/background unless essential. Location is one of the biggest
      battery drains if misused.</p>`,
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
    explanationHtml: `<p>The modern <code>Map</code> takes a content builder; use <code>Marker</code> for
      standard pins and <code>Annotation</code> for custom SwiftUI views.</p>`,
  },
  {
    id: "nz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "The blue user-location dot appears only when:",
    options: ["Always", "The user has granted location permission", "Wi-Fi is on", "You call MKDirections"],
    answer: 1,
    explanationHtml: `<p><code>UserAnnotation</code> requires location authorization (When In Use suffices) —
      no permission, no dot.</p>`,
  },
  {
    id: "nz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "As-you-type place suggestions use:",
    options: ["CLGeocoder", "MKLocalSearchCompleter", "MKDirections", "MapPolyline"],
    answer: 1,
    explanationHtml: `<p><code>MKLocalSearchCompleter</code> streams completions; resolve a chosen one (or use
      <code>MKLocalSearch</code> for a full query).</p>`,
  },
  {
    id: "nz4",
    category: "security",
    categoryLabel: "Security",
    question: "Since iOS 14, a user may grant location that is:",
    options: ["Always precise", "Approximate (reduced accuracy)", "Server-side only", "Disabled for all apps"],
    answer: 1,
    explanationHtml: `<p>Check <code>accuracyAuthorization</code>; if reduced and you truly need precision,
      request temporary full accuracy with a purpose key. Most features should handle approximate.</p>`,
  },
  {
    id: "nz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "For low-power background location, prefer:",
    options: ["Continuous startUpdatingLocation", "Significant-change or region monitoring", "A timer polling GPS", "Reverse geocoding in a loop"],
    answer: 1,
    explanationHtml: `<p>Continuous updates drain battery; significant-change and geofencing wake you only when
      it matters.</p>`,
  },
  {
    id: "nz6",
    category: "security",
    categoryLabel: "Security",
    question: "A common App Review rejection around location is:",
    options: ["Using MapKit at all", "Requesting Always with a vague purpose string when When-In-Use suffices", "Drawing a polyline", "Showing a compass"],
    answer: 1,
    explanationHtml: `<p>Over-asking for Always access and vague <code>Info.plist</code> purpose strings get
      flagged. Request the least access you need and justify it clearly.</p>`,
  },
];

export const ADVANCED10_STUDY: StudySection[] = [
  {
    id: "st-adv-27",
    num: "42",
    title: "42 · MapKit in SwiftUI: maps, markers & search",
    html: `<p><b>What it is.</b> The iOS 17 <code>Map</code> uses a <b>MapContentBuilder</b>: declare
      <code>Marker</code>s, custom <code>Annotation</code>s, and overlays (<code>MapPolyline</code>,
      <code>MapCircle</code>) like views. Drive the view with a <code>MapCameraPosition</code> binding
      (<code>.region</code>, <code>.automatic</code>, <code>.userLocation</code>), add <code>.mapControls</code>
      (compass, scale, user-location button), and pick a <code>.mapStyle</code>.</p>
    <p>Beyond display: <b>MKLocalSearch</b> / <code>MKLocalSearchCompleter</code> for place search, <b>MKDirections</b>
      for routes + ETAs, <b>CLGeocoder</b> for address↔coordinate, and <b>Look Around</b>
      (<code>LookAroundPreview</code>) for street-level imagery.</p>
    <div class="callout tip"><span class="lbl">Marker vs Annotation</span> Use <code>Marker</code> for standard
      pins; reach for <code>Annotation</code> only when you need a custom SwiftUI view (it's heavier at
      scale).</div>`,
  },
  {
    id: "st-adv-28",
    num: "43",
    title: "43 · CoreLocation: authorization, accuracy & battery",
    html: `<p><b>What it is.</b> <code>CLLocationManager</code> + delegate (or the iOS 17
      <code>CLLocationUpdate.liveUpdates()</code> async sequence). Request <b>When In Use</b> by default and
      <b>Always</b> only if you need background; handle denied/restricted. Respect <b>approximate vs precise</b>
      (iOS 14+) — check <code>accuracyAuthorization</code> and request temporary full accuracy only when truly
      needed.</p>
    <p>Choose the right update mode — continuous, significant-change, region monitoring, or visits — by power
      cost. Background location needs Always + the Location background mode. Provide clear
      <code>Info.plist</code> purpose strings; over-asking is a privacy and App Review problem.</p>
    <div class="callout warn"><span class="lbl">Battery</span> Use the lowest accuracy that works, set a
      <code>distanceFilter</code>, and stop updates when idle — misused location is a top battery drain.</div>`,
  },
];
