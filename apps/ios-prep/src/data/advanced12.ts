// Advanced batch 12 — Push notifications end-to-end (senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED12_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED12_FLASHCARDS: Flashcard[] = [
  {
    id: "s1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Local vs remote notifications — what's the difference?",
    answerHtml: `<p><b>Local</b> notifications are scheduled on-device (<code>UNNotificationRequest</code> with a
      time/calendar/location trigger) — no server. <b>Remote (push)</b> notifications come from your server via
      <b>APNs</b> to a device token. Both are presented through <code>UNUserNotificationCenter</code> and need the
      user's permission.</p>`,
    level: "senior",
  },
  {
    id: "s2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you request notification permission?",
    answerHtml: `<p><code>UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound,
      .badge])</code> — ask in context (not at first launch) and handle denial gracefully. <b>Provisional</b>
      authorization (<code>.provisional</code>) lets you deliver quietly to Notification Center with no prompt, so
      users can opt in after seeing value.</p>`,
    level: "senior",
  },
  {
    id: "s3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does a device get registered for push?",
    answerHtml: `<p>Call <code>UIApplication.shared.registerForRemoteNotifications()</code> (after permission).
      The system returns a <b>device token</b> in
      <code>didRegisterForRemoteNotificationsWithDeviceToken</code>; you send that token to your server, which
      uses it as the address to push to. Tokens can change — re-upload on each launch.</p>`,
    level: "senior",
  },
  {
    id: "s4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does your server authenticate to APNs?",
    answerHtml: `<p>Prefer <b>token-based</b> auth: a <code>.p8</code> key + key ID + team ID, used to sign a
      short-lived JWT sent with each push over APNs's HTTP/2 endpoint. (The older alternative is per-app TLS
      certificates.) Token auth is simpler, doesn't expire yearly, and one key works across your apps.</p>`,
    level: "architect",
  },
  {
    id: "s5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's in a push payload?",
    answerHtml: `<p>An <code>aps</code> dictionary plus your custom keys.</p>
    <div class="code">{
  "aps": {
    "alert": { "title": "New message", "body": "Hi!" },
    "sound": "default",
    "badge": 3,
    "thread-id": "chat-42",
    "category": "MESSAGE",
    "interruption-level": "time-sensitive"
  },
  "conversationId": "42"
}</div>
    <p><code>category</code> drives action buttons; custom keys carry data for deep linking.</p>`,
    level: "senior",
  },
  {
    id: "s6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you add action buttons to a notification?",
    answerHtml: `<p>Register a <code>UNNotificationCategory</code> with <code>UNNotificationAction</code>s
      (identifiers, titles, options like <code>.destructive</code>/<code>.foreground</code>), and set the
      payload's <code>category</code> to that identifier. Handle the chosen action in
      <code>didReceive response</code> via the action's identifier (e.g. "Reply", "Mark as read").</p>`,
    level: "senior",
  },
  {
    id: "s7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is a Notification Service Extension?",
    answerHtml: `<p>An extension that intercepts a push (when the payload sets <code>mutable-content: 1</code>)
      <i>before</i> it's shown, giving you ~30s to <b>modify</b> it — decrypt the body, download and attach media,
      or change the title. If you run out of time the system shows the original payload. Great for rich, secure
      notifications.</p>`,
    level: "architect",
  },
  {
    id: "s8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is a Notification Content Extension?",
    answerHtml: `<p>An extension that provides a <b>custom UI</b> for the expanded (long-press / pull-down)
      notification — your own SwiftUI/UIKit view instead of the default look, optionally interactive. Use it for
      previews, media, or quick actions richer than buttons alone.</p>`,
    level: "senior",
  },
  {
    id: "s9",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is a silent (background) push?",
    answerHtml: `<p>A push with <code>content-available: 1</code> and no alert — it wakes the app briefly to
      fetch/sync data (<code>didReceiveRemoteNotification</code>). It's <b>best-effort</b>: the system throttles
      and may delay or drop them based on battery/usage, so never rely on silent push for guaranteed or
      time-critical delivery.</p>`,
    level: "senior",
  },
  {
    id: "s10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you handle taps and foreground presentation?",
    answerHtml: `<p>Implement <code>UNUserNotificationCenterDelegate</code>: <code>willPresent</code> decides how
      a notification shows while the app is <b>foreground</b> (return <code>.banner</code>/<code>.list</code>/
      <code>.sound</code>), and <code>didReceive response</code> handles a <b>tap or action</b> — route to the
      right screen using the payload (deep link).</p>`,
    level: "senior",
  },
  {
    id: "s11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are interruption levels?",
    answerHtml: `<p>How insistent a notification is: <b>passive</b> (no sound, doesn't light the screen),
      <b>active</b> (default), <b>time-sensitive</b> (breaks through Focus, needs an entitlement/justification),
      and <b>critical</b> (bypasses mute/Focus — special entitlement). Plus a <b>relevance score</b> to rank in
      the stack. Use time-sensitive sparingly and honestly.</p>`,
    level: "senior",
  },
  {
    id: "s12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are critical alerts?",
    answerHtml: `<p>Notifications that <b>ignore mute and Focus</b> and play a sound even on silent — for safety/
      health/security (e.g. medical, home alarms). They require a special <b>Apple-granted entitlement</b> with
      justification; you can't ship them casually. Misuse is an App Review rejection.</p>`,
    level: "architect",
  },
  {
    id: "s13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Why use provisional authorization?",
    answerHtml: `<p>It lets you send notifications <b>without showing the permission prompt</b> — they arrive
      quietly in Notification Center (no sound/banner). The user can then promote them to prominent delivery or
      turn them off from the notification itself. It boosts opt-in by proving value before asking.</p>`,
    level: "senior",
  },
  {
    id: "s14",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How should you manage the app badge?",
    answerHtml: `<p>Set it explicitly with <code>UNUserNotificationCenter.current().setBadgeCount(_:)</code>
      (async, iOS 16+) rather than the deprecated <code>applicationIconBadgeNumber</code>. The push payload can
      also set <code>badge</code>. Keep the source of truth on the server (unread count) so the badge stays
      consistent across devices.</p>`,
    level: "mid",
  },
  {
    id: "s15",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do pushes drive Live Activities?",
    answerHtml: `<p>An active Live Activity has a <b>push token</b>; your server sends ActivityKit pushes
      (<code>liveactivity</code> push type) to update its <code>ContentState</code>. iOS 17.2+ adds <b>push to
      start</b> — a registered token lets the server <i>begin</i> a Live Activity remotely (e.g. a match kicks
      off) without the app launching.</p>`,
    level: "architect",
  },
  {
    id: "s16",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you test and debug push delivery?",
    answerHtml: `<p>The simulator can trigger a push by dragging a <code>.apns</code> JSON file onto it (or via
      <code>simctl push</code>). For real delivery, send to the <b>sandbox</b> APNs endpoint for dev builds and
      <b>production</b> for App Store/TestFlight (a token is environment-specific). If pushes vanish, check
      permission status, the right environment, a valid token, and APNs response codes.</p>`,
    level: "senior",
  },
];

export const ADVANCED12_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED12_QUIZ: QuizQuestion[] = [
  {
    id: "sz1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "The device token for remote push is delivered to your app in:",
    options: ["viewDidLoad", "didRegisterForRemoteNotificationsWithDeviceToken", "applicationDidBecomeActive", "the push payload"],
    answer: 1,
    explanationHtml: `<p>After <code>registerForRemoteNotifications()</code>, the system calls
      <code>didRegisterForRemoteNotificationsWithDeviceToken</code>; send that token to your server.</p>`,
  },
  {
    id: "sz2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "The preferred way for a server to authenticate to APNs is:",
    options: ["Username/password", "Token-based auth with a .p8 key (signed JWT)", "An API key in the URL", "OAuth with Google"],
    answer: 1,
    explanationHtml: `<p>Token-based auth (.p8 + key ID + team ID, signing a short-lived JWT) is simpler than
      certificates and doesn't expire yearly.</p>`,
  },
  {
    id: "sz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "To modify or decrypt a push before it's shown (e.g. attach media), use:",
    options: ["A content extension", "A Notification Service Extension with mutable-content: 1", "A silent push", "willPresent"],
    answer: 1,
    explanationHtml: `<p>The service extension runs when <code>mutable-content: 1</code> is set, giving ~30s to
      alter the payload before display.</p>`,
  },
  {
    id: "sz4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "A push with content-available: 1 and no alert is:",
    options: ["A guaranteed background wake", "A best-effort silent push the system may throttle", "A critical alert", "Invalid"],
    answer: 1,
    explanationHtml: `<p>Silent pushes wake the app to sync but are throttled/best-effort — never rely on them
      for guaranteed or time-critical delivery.</p>`,
  },
  {
    id: "sz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "An interruption level that breaks through Focus requires:",
    options: ["Nothing special", "time-sensitive (with justification) — or critical with an Apple entitlement", "A louder sound file", "A content extension"],
    answer: 1,
    explanationHtml: `<p>Time-sensitive can pierce Focus (use honestly); critical alerts bypass mute/Focus and
      need a special Apple-granted entitlement.</p>`,
  },
  {
    id: "sz6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "A dev build's push token works against:",
    options: ["Production APNs", "The sandbox APNs environment", "Either, interchangeably", "No APNs"],
    answer: 1,
    explanationHtml: `<p>Tokens are environment-specific: sandbox APNs for development builds, production for
      App Store/TestFlight. Mixing them is a common 'pushes not arriving' cause.</p>`,
  },
];

export const ADVANCED12_STUDY: StudySection[] = [
  {
    id: "st-adv-31",
    num: "46",
    title: "46 · Push notifications: registration, payloads & APNs",
    html: `<p><b>What it is.</b> The end-to-end path. Ask permission with
      <code>UNUserNotificationCenter.requestAuthorization</code> (in context; consider <b>provisional</b>), then
      <code>registerForRemoteNotifications()</code> to get a <b>device token</b> in the app delegate and send it
      to your server. Your server authenticates to <b>APNs</b> (token-based <code>.p8</code> JWT preferred) and
      POSTs a JSON payload over HTTP/2.</p>
    <p>The payload's <code>aps</code> dictionary carries <code>alert</code>, <code>sound</code>,
      <code>badge</code>, <code>category</code> (for actions), <code>thread-id</code>, and
      <code>interruption-level</code>; custom keys carry data for deep links. Remember tokens are
      <b>environment-specific</b> (sandbox vs production).</p>
    <div class="callout warn"><span class="lbl">Debug checklist</span> permission granted? right APNs
      environment? valid current token? APNs response code? Most "no notifications" bugs are one of these.</div>`,
  },
  {
    id: "st-adv-32",
    num: "47",
    title: "47 · Rich, actionable & background notifications",
    html: `<p><b>What it is.</b> Going beyond a plain banner. <b>Actions</b>: register
      <code>UNNotificationCategory</code> + <code>UNNotificationAction</code> and handle them in
      <code>didReceive response</code>. <b>Rich</b>: a <b>Notification Service Extension</b>
      (<code>mutable-content</code>) decrypts/attaches media in ~30s; a <b>Content Extension</b> supplies custom
      expanded UI. <b>Background</b>: silent pushes (<code>content-available</code>) wake the app to sync
      (best-effort, throttled).</p>
    <p>Control prominence with <b>interruption levels</b> (passive → active → time-sensitive → critical) and
      relevance score; reserve critical alerts for the rare entitlement-gated cases. Pushes can also <b>update
      and even start</b> Live Activities (push-to-start, iOS 17.2+).</p>
    <div class="callout tip"><span class="lbl">Handle the tap</span> Always route a notification tap to the right
      screen via the payload — landing users on the home screen wastes the notification.</div>`,
  },
];
