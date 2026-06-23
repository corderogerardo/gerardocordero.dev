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
    answerHtml: `<p>Through <code>CNContactStore</code>: fetch with a list of <b>keys you actually need</b>
      (<code>CNContactFormatter.descriptorForRequiredKeys</code>, phone, email) and an optional predicate.
      Requesting only the keys you use is both faster and more privacy-respecting.</p>`,
    level: "senior",
  },
  {
    id: "o2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's the privacy-friendly way to let a user pick a contact?",
    answerHtml: `<p><code>CNContactPickerViewController</code> — the system contact picker runs out-of-process and
      returns only the contact(s) the user chose, so you need <b>no Contacts permission at all</b>. Prefer it over
      requesting full access when you just need one contact.</p>`,
    level: "mid",
  },
  {
    id: "o3",
    category: "security",
    categoryLabel: "Security",
    question: "What does full Contacts access require?",
    answerHtml: `<p>A runtime <code>requestAccess(for: .contacts)</code> and an
      <code>NSContactsUsageDescription</code> string. (Recent iOS also offers a <b>limited</b> access tier where
      the user shares only some contacts.) Only request full access if you must enumerate/search the address
      book; otherwise use the picker.</p>`,
    level: "senior",
  },
  {
    id: "o4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you create or modify a contact?",
    answerHtml: `<p>Build a <code>CNMutableContact</code>, wrap it in a <code>CNSaveRequest</code>
      (add/update/delete), and <code>execute</code> it on the <code>CNContactStore</code> — which needs write
      access. For a single add, the contact picker or a <code>CNContactViewController</code> in editing mode lets
      the user confirm without granting full access.</p>`,
    level: "senior",
  },
  {
    id: "o5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What does EventKit cover?",
    answerHtml: `<p>Calendar <b>events</b> and <b>reminders</b>, both through an <code>EKEventStore</code>. You
      query with predicates over date ranges/calendars, and create <code>EKEvent</code>/<code>EKReminder</code>
      objects to save. Events and reminders are separate permission domains.</p>`,
    level: "senior",
  },
  {
    id: "o6",
    category: "security",
    categoryLabel: "Security",
    question: "How did EventKit access change in iOS 17?",
    answerHtml: `<p>Calendar access split into <b>full</b> vs <b>write-only</b>: use
      <code>requestWriteOnlyAccessToEvents()</code> if you only add events (you can't read the user's calendar —
      more private and easier to grant), or <code>requestFullAccessToEvents()</code> if you must read.
      Reminders use <code>requestFullAccessToReminders()</code>. The old <code>requestAccess(to:)</code> is
      deprecated.</p>`,
    level: "senior",
  },
  {
    id: "o7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's the easiest way to let a user add a calendar event?",
    answerHtml: `<p><code>EKEventEditViewController</code>: pre-fill an <code>EKEvent</code>, present the system
      edit UI, and the user reviews and saves. It's the add-an-event equivalent of a compose sheet — minimal
      permission friction since the user explicitly confirms.</p>`,
    level: "mid",
  },
  {
    id: "o8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How are reminders modeled?",
    answerHtml: `<p>As <code>EKReminder</code> objects in the same <code>EKEventStore</code>, with a title, due
      date components, priority, and a calendar (reminders list). Save via the store after requesting full
      reminders access. Useful for to-do features that integrate with the system Reminders app.</p>`,
    level: "mid",
  },
  {
    id: "o9",
    category: "security",
    categoryLabel: "Security",
    question: "Which Info.plist strings do calendar/reminders need?",
    answerHtml: `<p><code>NSCalendarsFullAccessUsageDescription</code> /
      <code>NSCalendarsWriteOnlyAccessUsageDescription</code> for events and
      <code>NSRemindersFullAccessUsageDescription</code> for reminders (iOS 17+ naming). Match the string to the
      access level you request, and explain the purpose clearly.</p>`,
    level: "senior",
  },
  {
    id: "o10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you let the user send an email from your app?",
    answerHtml: `<p><code>MFMailComposeViewController</code> (MessageUI): check
      <code>MFMailComposeViewController.canSendMail()</code>, pre-fill recipients/subject/body/attachments, present
      it, and handle the delegate result. The <b>user</b> taps Send — you never send silently.</p>`,
    level: "mid",
  },
  {
    id: "o11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you compose an SMS/iMessage?",
    answerHtml: `<p><code>MFMessageComposeViewController</code>: check <code>canSendText()</code>, set
      recipients/body (and attachments where supported), present, handle the result. Like mail, it's a system
      compose sheet the user must confirm — no silent sending.</p>`,
    level: "mid",
  },
  {
    id: "o12",
    category: "security",
    categoryLabel: "Security",
    question: "Why are the compose controllers considered privacy-safe?",
    answerHtml: `<p>Because the <b>user</b> must explicitly tap Send in the system UI — your app can pre-fill but
      can't send mail/messages programmatically or read what they typed. That design means they need <b>no special
      permission</b>, unlike reading contacts/calendar.</p>`,
    level: "mid",
  },
  {
    id: "o13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does the system share sheet work (UIKit)?",
    answerHtml: `<p><code>UIActivityViewController</code> with <code>activityItems</code> (text, URLs, images,
      or <code>UIActivityItemSource</code>/<code>NSItemProvider</code>). You can set
      <code>excludedActivityTypes</code>, and on iPad you <b>must</b> set the popover's <code>sourceView</code>/
      <code>sourceItem</code> or it crashes.</p>`,
    level: "senior",
  },
  {
    id: "o14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What's the SwiftUI way to share content?",
    answerHtml: `<p><code>ShareLink</code> (iOS 16+): a declarative button that presents the share sheet for any
      <code>Transferable</code> item.</p>
    <div class="code">ShareLink(item: url) { Label("Share", systemImage: "square.and.arrow.up") }</div>
    <p>For custom types, conform to <code>Transferable</code> and it just works across share, drag, and
      paste.</p>`,
    level: "mid",
  },
  {
    id: "o15",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does your app appear in OTHER apps' share sheets?",
    answerHtml: `<p>Ship a <b>Share Extension</b>: an app extension declaring the content types it accepts
      (<code>NSExtensionActivationRule</code>). When the user shares a photo/URL/text elsewhere, your extension
      shows up and receives the items via its <code>extensionContext</code>. Keep it lightweight; do heavy work in
      the app via an App Group.</p>`,
    level: "senior",
  },
  {
    id: "o16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is the Transferable protocol?",
    answerHtml: `<p>A unified model for moving typed data across <b>share, drag-and-drop, and copy/paste</b>.
      Conform a type (declare its representations, e.g. a data/file/proxy representation) and it works with
      <code>ShareLink</code>, <code>.draggable</code>/<code>.dropDestination</code>, and the pasteboard — one
      definition, many transfer surfaces.</p>`,
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
    explanationHtml: `<p>The contact picker returns only the chosen contact and needs no Contacts permission —
      like PhotosPicker for photos.</p>`,
  },
  {
    id: "oz2",
    category: "security",
    categoryLabel: "Security",
    question: "In iOS 17, an app that only adds calendar events should request:",
    options: ["Full access", "Write-only access to events", "Reminders access", "No API exists"],
    answer: 1,
    explanationHtml: `<p><code>requestWriteOnlyAccessToEvents()</code> lets you add events without reading the
      calendar — more private and easier to grant than full access.</p>`,
  },
  {
    id: "oz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Before presenting MFMailComposeViewController you must:",
    options: ["Request contacts access", "Check canSendMail()", "Set a background mode", "Use ShareLink"],
    answer: 1,
    explanationHtml: `<p>Check <code>canSendMail()</code> (a device may have no mail account); the user then
      taps Send — you can't send silently.</p>`,
  },
  {
    id: "oz4",
    category: "security",
    categoryLabel: "Security",
    question: "Why do the mail/message compose controllers need no special permission?",
    options: ["They run in the background", "The user must explicitly tap Send in system UI", "They are encrypted", "They use App Groups"],
    answer: 1,
    explanationHtml: `<p>You can pre-fill but the user confirms in the system sheet — no silent sending — so no
      permission is required.</p>`,
  },
  {
    id: "oz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Presenting UIActivityViewController on iPad requires:",
    options: ["Nothing extra", "Setting the popover sourceView/sourceItem", "A share extension", "Full-screen modal only"],
    answer: 1,
    explanationHtml: `<p>On iPad it's a popover; you must set the source (anchor) or it crashes at
      presentation.</p>`,
  },
  {
    id: "oz6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "ShareLink can share any item that is:",
    options: ["A String only", "Transferable", "a UIImage only", "Codable"],
    answer: 1,
    explanationHtml: `<p><code>ShareLink</code> works with any <code>Transferable</code> type — the same
      conformance that powers drag-and-drop and paste.</p>`,
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
