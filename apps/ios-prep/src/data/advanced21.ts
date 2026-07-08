// Advanced batch 21 — Contacts, EventKit, MessageUI & sharing (mid/senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED21_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED21_FLASHCARDS: Flashcard[] = [
  {
    id: "o1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you read contacts with the Contacts framework?",
    answerHtml: `<p>Over-fetching contact fields is both a perf tax and a privacy smell reviewers look for, so the
      framework makes you declare your keys up front. Through <code>CNContactStore</code>: fetch with a list of
      keys you actually need (<code>CNContactFormatter.descriptorForRequiredKeys</code>, phone, email) and an
      optional predicate. <b>I only request the keys the screen renders — it's faster and it reads as
      privacy-respecting in review.</b></p>`,
    level: "senior",
  },
  {
    id: "o2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's the privacy-friendly way to let a user pick a contact?",
    answerHtml: `<p>Requesting full Contacts access for a one-contact pick is the kind of over-ask that stalls App
      Review and scares users, so prefer the picker instead: <code>CNContactPickerViewController</code> runs
      out-of-process and returns only the contact(s) the user chose. <b>I reach for the picker whenever the feature
      only needs one or a few contacts — no permission dialog, no Contacts usage string required.</b></p>`,
    level: "mid",
  },
  {
    id: "o3",
    category: "security",
    categoryLabel: "Security",
    question: "What does full Contacts access require?",
    answerHtml: `<p>Full access is the highest-friction ask in this whole family of frameworks, so it's reserved for
      apps that genuinely enumerate or search the address book — a runtime <code>requestAccess(for: .contacts)</code>
      call plus an <code>NSContactsUsageDescription</code> string. (Recent iOS also offers a <b>limited</b> tier
      where the user shares only some contacts.) <b>I only request full access when the feature has to search
      across the address book — for a single contact, the picker needs no permission at all.</b> Red flag:
      defaulting to full access "to be safe" — it's the exact over-ask reviewers and privacy-conscious users both
      flag.</p>`,
    level: "senior",
  },
  {
    id: "o4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you create or modify a contact?",
    answerHtml: `<p>Writing to the address book needs the same write access as reading it, so the API funnels every
      change through one auditable request type: build a <code>CNMutableContact</code>, wrap it in a
      <code>CNSaveRequest</code> (add/update/delete), and <code>execute</code> it on the <code>CNContactStore</code>.
      <b>For a single add I skip the permission entirely and use the contact picker or a
      <code>CNContactViewController</code> in editing mode, so the user confirms without granting full
      access.</b></p>`,
    level: "senior",
  },
  {
    id: "o5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What does EventKit cover?",
    answerHtml: `<p>EventKit is the single entry point for both of iOS's personal-schedule stores, but they stay
      separate permission domains because a to-do app has no business reading your calendar and vice versa. You
      query with predicates over date ranges/calendars through an <code>EKEventStore</code>, and create
      <code>EKEvent</code>/<code>EKReminder</code> objects to save. <b>Events and reminders are one API but two
      independent permissions — request only the one your feature actually touches.</b></p>`,
    level: "senior",
  },
  {
    id: "o6",
    category: "security",
    categoryLabel: "Security",
    question: "How did EventKit access change in iOS 17?",
    answerHtml: `<p>Apple split calendar access because "add an event" and "read my whole calendar" are wildly
      different privacy asks, and lumping them together was scaring users into denying both. Use
      <code>requestWriteOnlyAccessToEvents()</code> if you only add events (you can't read the user's calendar —
      more private and easier to grant), or <code>requestFullAccessToEvents()</code> if you must read. Reminders
      use <code>requestFullAccessToReminders()</code>; the old <code>requestAccess(to:)</code> is deprecated.
      <b>I default to write-only for any "add to calendar" feature — it's the least-ask that still ships the
      feature.</b> Red flag: reaching for full access by habit because that's what the old API always granted.</p>`,
    level: "senior",
  },
  {
    id: "o7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's the easiest way to let a user add a calendar event?",
    answerHtml: `<p>Skipping the permission dialog entirely beats requesting the narrowest permission, so hand the
      write off to a system controller: <code>EKEventEditViewController</code> pre-fills an <code>EKEvent</code>,
      presents the system edit UI, and the user reviews and saves. <b>It's the add-an-event equivalent of a
      compose sheet — the user's explicit save is the permission.</b></p>`,
    level: "mid",
  },
  {
    id: "o8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How are reminders modeled?",
    answerHtml: `<p>Modeling to-dos as <code>EKReminder</code> instead of a custom store is what lets your feature
      show up in the system Reminders app for free: they're objects in the same <code>EKEventStore</code>, with a
      title, due date components, priority, and a calendar (reminders list). Save via the store after requesting
      full reminders access. <b>I reach for EKReminder specifically when the to-do needs to appear in the user's
      existing Reminders lists, not for an app-internal task list.</b></p>`,
    level: "mid",
  },
  {
    id: "o9",
    category: "security",
    categoryLabel: "Security",
    question: "Which Info.plist strings do calendar/reminders need?",
    answerHtml: `<p>A mismatched usage string is a common App Review rejection, because the string has to name the
      exact access tier you're calling: <code>NSCalendarsFullAccessUsageDescription</code> /
      <code>NSCalendarsWriteOnlyAccessUsageDescription</code> for events and
      <code>NSRemindersFullAccessUsageDescription</code> for reminders (iOS 17+ naming). <b>Match the string to
      the access level you actually request, and state the purpose in plain language — vague strings get
      rejected.</b></p>`,
    level: "senior",
  },
  {
    id: "o10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you let the user send an email from your app?",
    answerHtml: `<p>Apps can't send mail directly precisely so users can't be spammed on their behalf, so the API is
      shaped as a hand-off to the system compose sheet: check
      <code>MFMailComposeViewController.canSendMail()</code> (a device may have no configured mail account),
      pre-fill recipients/subject/body/attachments, present it, and handle the delegate result. <b>The user taps
      Send — I never send mail silently, and I always guard on canSendMail() first.</b></p>`,
    level: "mid",
  },
  {
    id: "o11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you compose an SMS/iMessage?",
    answerHtml: `<p>Same trust boundary as mail, same shape of fix: <code>MFMessageComposeViewController</code> — check
      <code>canSendText()</code> (the device may lack SMS capability), set recipients/body (and attachments where
      supported), present, handle the result. <b>Like mail, it's a system compose sheet the user must confirm — no
      silent sending, no special permission needed.</b></p>`,
    level: "mid",
  },
  {
    id: "o12",
    category: "security",
    categoryLabel: "Security",
    question: "Why are the compose controllers considered privacy-safe?",
    answerHtml: `<p>Permission systems exist to gate what an app can do to the user's data without their knowledge —
      and these controllers can't do anything without it, so there's nothing to gate. Your app can pre-fill but
      can't send mail/messages programmatically or read what the user typed; only they can tap Send in the system
      UI. <b>No silent action means no permission required — that's the whole reason compose sheets don't need an
      Info.plist entry, unlike reading contacts or calendar.</b> Red flag: assuming any user-data feature needs a
      permission string — it's specifically the app's ability to act *without* confirmation that triggers one.</p>`,
    level: "mid",
  },
  {
    id: "o13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does the system share sheet work (UIKit)?",
    answerHtml: `<p>The share sheet is one controller that fans out to every share extension installed on the
      device, so you hand it typed items and let the system pick presenters: <code>UIActivityViewController</code>
      with <code>activityItems</code> (text, URLs, images, or <code>UIActivityItemSource</code>/
      <code>NSItemProvider</code>). You can set <code>excludedActivityTypes</code>. <b>On iPad you must set the
      popover's <code>sourceView</code>/<code>sourceItem</code> or it crashes at presentation.</b> Red flag:
      testing only on iPhone and shipping the iPad crash — it's a guaranteed anchor point, not optional there.</p>`,
    level: "senior",
  },
  {
    id: "o14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What's the SwiftUI way to share content?",
    answerHtml: `<p>SwiftUI replaces the iPad-popover ceremony of <code>UIActivityViewController</code> with a plain
      view: <code>ShareLink</code> (iOS 16+) is a declarative button that presents the share sheet for any
      <code>Transferable</code> item.</p>
    <div class="code">ShareLink(item: url) { Label("Share", systemImage: "square.and.arrow.up") }</div>
    <p><b>For custom types, conform to Transferable once and it works across share, drag-and-drop, and paste — no
      separate wiring per surface.</b></p>`,
    level: "mid",
  },
  {
    id: "o15",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does your app appear in OTHER apps' share sheets?",
    answerHtml: `<p>Appearing in someone else's share sheet means shipping your own extension process, not hooking
      into theirs: a <b>Share Extension</b> declares the content types it accepts
      (<code>NSExtensionActivationRule</code>). When the user shares a photo/URL/text elsewhere, your extension
      shows up and receives the items via its <code>extensionContext</code>. <b>Keep the extension lightweight and
      hand heavy work back to the main app via an App Group</b> — extensions run under tight memory limits and get
      killed fast.</p>`,
    level: "senior",
  },
  {
    id: "o16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is the Transferable protocol?",
    answerHtml: `<p>Before Transferable, share/drag-and-drop/paste each needed their own bespoke serialization code
      for a custom type — Transferable collapses that into one conformance. Declare a type's representations
      (e.g. a data/file/proxy representation) and it works with <code>ShareLink</code>,
      <code>.draggable</code>/<code>.dropDestination</code>, and the pasteboard. <b>One Transferable conformance
      is one definition powering share, drag-and-drop, and paste — I write it once per model type.</b></p>`,
    level: "senior",
  },
];

export const ADVANCED21_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED21_QUIZ: QuizQuestion[] = [
  {
    id: "oz1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "To let a user pick one contact WITHOUT a permission prompt, use:",
    options: ["CNContactStore.requestAccess", "CNContactPickerViewController", "EKEventStore", "MFMailComposeViewController"],
    answer: 1,
    explanationHtml: `<p>The contact picker returns only the chosen contact and needs no Contacts permission — like
      PhotosPicker for photos. <code>CNContactStore.requestAccess</code> is the tempting-but-wrong pick here: it
      grants full read access to the whole address book for a task that only needed one contact.</p>`,
  },
  {
    id: "oz2",
    category: "security",
    categoryLabel: "Security",
    question: "In iOS 17, an app that only adds calendar events should request:",
    options: ["Full access", "Write-only access to events", "Reminders access", "No API exists"],
    answer: 1,
    explanationHtml: `<p><code>requestWriteOnlyAccessToEvents()</code> lets you add events without reading the
      calendar — more private and easier to grant than full access. "Full access" is the misconception: it's what
      the old, pre-iOS-17 API always granted, so it feels like the safe default, but it over-asks for a feature
      that never reads the user's calendar.</p>`,
  },
  {
    id: "oz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Before presenting MFMailComposeViewController you must:",
    options: ["Request contacts access", "Check canSendMail()", "Set a background mode", "Use ShareLink"],
    answer: 1,
    explanationHtml: `<p>Check <code>canSendMail()</code> (a device may have no mail account configured); the user
      then taps Send — you can't send silently. "Request contacts access" is a distractor from a different
      framework entirely — MessageUI needs no permission at all, since the user, not the app, sends the mail.</p>`,
  },
  {
    id: "oz4",
    category: "security",
    categoryLabel: "Security",
    question: "Why do the mail/message compose controllers need no special permission?",
    options: ["They run in the background", "The user must explicitly tap Send in system UI", "They are encrypted", "They use App Groups"],
    answer: 1,
    explanationHtml: `<p>You can pre-fill but the user confirms in the system sheet — no silent sending — so no
      permission is required. "They run in the background" is the misconception: they don't run in the
      background at all, they're foreground system UI the user must interact with, which is exactly why no
      permission gate is needed.</p>`,
  },
  {
    id: "oz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Presenting UIActivityViewController on iPad requires:",
    options: ["Nothing extra", "Setting the popover sourceView/sourceItem", "A share extension", "Full-screen modal only"],
    answer: 1,
    explanationHtml: `<p>On iPad it's a popover, not a full-screen sheet; you must set the source (anchor) or it
      crashes at presentation. "Nothing extra" is the trap — it's true on iPhone, which is exactly why teams that
      only test on iPhone ship this crash to iPad users.</p>`,
  },
  {
    id: "oz6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "ShareLink can share any item that is:",
    options: ["A String only", "Transferable", "a UIImage only", "Codable"],
    answer: 1,
    explanationHtml: `<p><code>ShareLink</code> works with any <code>Transferable</code> type — the same
      conformance that powers drag-and-drop and paste. String/UIImage/Codable are all too narrow: String and
      UIImage happen to already conform to Transferable, but the actual contract ShareLink requires is
      Transferable, not any specific concrete type — and Codable alone doesn't satisfy it.</p>`,
  },
];

export const ADVANCED21_STUDY: StudySection[] = [
  {
    id: "st-adv-49",
    num: "64",
    title: "64 · Contacts, calendar & reminders",
    html: `<p><b>What it is.</b> Personal-data kits with a privacy-first pattern. <b>Contacts</b>: fetch via
      <code>CNContactStore</code> requesting only needed keys, or use <code>CNContactPickerViewController</code>
      (no permission). <b>EventKit</b>: <code>EKEventStore</code> for events + reminders; iOS 17 split calendar
      access into <b>write-only</b> (add events, can't read) vs <b>full</b> — request the least you need, with the
      matching usage string. <code>EKEventEditViewController</code> lets users add events with minimal
      friction.</p>
    <div class="callout tip"><span class="lbl">Pattern</span> Picker/edit controllers (no permission) &gt;
      write-only access &gt; full access. Match the request to the task and explain it in the purpose
      string.</div>`,
  },
  {
    id: "st-adv-50",
    num: "65",
    title: "65 · Mail, messages & the share sheet",
    html: `<p><b>What it is.</b> Getting content out of your app. <b>MessageUI</b>
      (<code>MFMailComposeViewController</code>/<code>MFMessageComposeViewController</code>) presents system
      compose sheets — check <code>canSendMail()</code>/<code>canSendText()</code>, pre-fill, and let the user
      send (no permission, no silent send). The <b>share sheet</b> is <code>UIActivityViewController</code> (set
      the iPad popover source!) or SwiftUI's <code>ShareLink</code> for any <code>Transferable</code> item.</p>
    <p>To appear in <i>other</i> apps' share sheets, ship a <b>Share Extension</b> declaring the content types it
      accepts. <code>Transferable</code> unifies share, drag-and-drop, and paste with one conformance.</p>
    <div class="callout tip"><span class="lbl">Reuse</span> Model shareable content as <code>Transferable</code>
      once and it works across ShareLink, drag/drop, and the pasteboard.</div>`,
  },
];
