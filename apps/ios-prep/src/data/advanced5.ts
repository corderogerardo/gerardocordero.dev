// Advanced batch 5 — App Store Review Guidelines & StoreKit (senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED5_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED5_FLASHCARDS: Flashcard[] = [
  {
    id: "f1",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What are the five sections of the App Store Review Guidelines?",
    answerHtml: `<p><b>1. Safety</b> (objectionable content, UGC moderation, kids, physical harm), <b>2.
      Performance</b> (completeness, beta/demo, accurate metadata, hardware), <b>3. Business</b> (payments &
      In-App Purchase, subscriptions, acceptable models), <b>4. Design</b> (minimum functionality, spam,
      sign-in, copycats), and <b>5. Legal</b> (privacy, data, intellectual property, local laws). Knowing which
      section a rule lives in helps you anticipate review.</p>`,
    level: "senior",
  },
  {
    id: "f2",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What does Guideline 2.1 (App Completeness) require?",
    answerHtml: `<p>Submit a <b>final, complete build</b> — no crashes, obvious bugs, placeholder text, broken
      links, or unfinished features. Back-end services must be live during review, and if any part is gated
      behind login you must provide a <b>working demo account</b> (or a demo mode) in App Review notes. "We'll
      finish it after approval" gets rejected.</p>`,
    level: "senior",
  },
  {
    id: "f3",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is Guideline 4.2 (Minimum Functionality)?",
    answerHtml: `<p>Your app must provide <b>lasting value</b> and a real app experience — not just a repackaged
      website, a marketing brochure, or a thin wrapper. Web content is fine as part of the app, but a pure
      WebView shell of your site will be rejected. This catches a large share of first-submission rejections.</p>`,
    level: "senior",
  },
  {
    id: "f4",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What does Guideline 3.1.1 (In-App Purchase) require?",
    answerHtml: `<p>Unlocking <b>digital goods/services</b> used in the app must go through Apple's In-App
      Purchase. You generally can't sell those elsewhere or, traditionally, steer users to an external purchase
      inside the app. <b>Physical</b> goods/services use other payment methods (not IAP). Note: external-link /
      alternative-payment allowances have been expanding via regulation and litigation (e.g. reader apps, EU DMA,
      US link entitlement with a commission) — check current entitlements for your case.</p>`,
    level: "senior",
  },
  {
    id: "f5",
    category: "appstore",
    categoryLabel: "App Store",
    question: "Why does every permission need a purpose string?",
    answerHtml: `<p>Guideline 5.1.1 + the OS require a clear <b>usage-description string</b> in
      <code>Info.plist</code> (e.g. <code>NSCameraUsageDescription</code>) explaining <i>why</i> you need
      camera, location, contacts, etc. Missing or vague strings cause both a runtime crash on first request and a
      review rejection. Request access only when you actually need it.</p>`,
    level: "senior",
  },
  {
    id: "f6",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is the in-app account deletion requirement?",
    answerHtml: `<p>Guideline 5.1.1(v): any app that lets users <b>create an account</b> must also let them
      <b>initiate account deletion from within the app</b> (not just disable it, and not "email us to delete").
      It must remove the account and associated data. This is strictly enforced — a common rejection for apps
      with sign-up.</p>`,
    level: "senior",
  },
  {
    id: "f7",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What does Guideline 4.8 (Login Services) require?",
    answerHtml: `<p>If your app offers a <b>third-party or social login</b> (Google, Facebook, etc.) as a
      primary option, you must also offer a <b>privacy-protective equivalent</b> — one that limits data to name
      and email, lets users keep their email private, and doesn't track them without consent. Sign in with Apple
      satisfies this; the guideline now allows other equivalent options too.</p>`,
    level: "senior",
  },
  {
    id: "f8",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What must apps with user-generated content provide (Guideline 1.2)?",
    answerHtml: `<p>Four things, or risk removal: a method to <b>filter</b> objectionable content, a mechanism to
      <b>report</b> it (with timely action), the ability to <b>block</b> abusive users, and <b>published contact
      info</b>. UGC and social features get extra scrutiny precisely because of moderation obligations.</p>`,
    level: "senior",
  },
  {
    id: "f9",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What does Guideline 2.3 (Accurate Metadata) cover?",
    answerHtml: `<p>Your name, description, screenshots, preview, and keywords must <b>accurately reflect</b> the
      app — no hidden or undocumented features, no mentioning other platforms, no misleading screenshots, correct
      age rating. Reviewers test against your metadata, so over-promising in the description invites
      rejection.</p>`,
    level: "senior",
  },
  {
    id: "f10",
    category: "appstore",
    categoryLabel: "App Store",
    question: "When must you show the App Tracking Transparency prompt?",
    answerHtml: `<p>Before <b>tracking</b> the user across apps and websites owned by other companies, or
      accessing the device's advertising identifier (IDFA), you must request permission via the ATT prompt
      (<code>ATTrackingManager.requestTrackingAuthorization</code>) and respect the answer. Tracking without it,
      or fingerprinting to evade it, is a rejection (and policy violation).</p>`,
    level: "senior",
  },
  {
    id: "f11",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is the App Privacy 'nutrition label'?",
    answerHtml: `<p>In App Store Connect you declare <b>what data your app collects</b>, whether it's linked to
      the user, and whether it's used for tracking — shown on the product page as the privacy label. It must match
      your actual behavior <i>and</i> the behavior of any third-party SDKs you bundle. Inaccurate labels are a
      compliance issue.</p>`,
    level: "senior",
  },
  {
    id: "f12",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is a privacy manifest and required-reason API?",
    answerHtml: `<p>A <code>PrivacyInfo.xcprivacy</code> file declaring the data types you collect, tracking
      domains, and the <b>approved reason</b> for using certain "required-reason" APIs (e.g. file timestamps,
      UserDefaults, disk space). Apple aggregates manifests from your app and SDKs; missing manifests or
      undeclared reasons block submission. Popular third-party SDKs must also be signed and ship a manifest.</p>`,
    level: "senior",
  },
  {
    id: "f13",
    category: "appstore",
    categoryLabel: "App Store",
    question: "How does the review timeline work, and what if you're rejected?",
    answerHtml: `<p>Most reviews complete within about a day (often faster). You can request <b>expedited
      review</b> for urgent fixes/critical bugs. Rejections come with a reason in the <b>Resolution Center</b>;
      you can reply, provide context, or <b>appeal</b> to the App Review Board if you believe it's a mistake.
      TestFlight builds get a lighter review for beta testing.</p>`,
    level: "senior",
  },
  {
    id: "f14",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is export compliance (encryption) at submission?",
    answerHtml: `<p>Apps that use encryption must declare it. Most apps only use standard HTTPS/TLS, which is
      <b>exempt</b> — set <code>ITSAppUsesNonExemptEncryption</code> to <code>false</code> in
      <code>Info.plist</code> to skip the prompt each upload. If you implement custom/proprietary cryptography you
      may need export documentation.</p>`,
    level: "senior",
  },
  {
    id: "f15",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What does a StoreKit 2 purchase flow look like?",
    answerHtml: `<p>Modern, async, and far less boilerplate than StoreKit 1. Load products, call
      <code>purchase()</code>, verify the signed transaction, deliver content, and <code>finish()</code> it.</p>
    <div class="code">let products = try await Product.products(for: ["pro.monthly"])
let result = try await products[0].purchase()
switch result {
case .success(let verification):
  if case .verified(let txn) = verification {
    // grant entitlement
    await txn.finish()
  }
case .userCancelled, .pending: break
@unknown default: break
}</div>`,
    level: "senior",
  },
  {
    id: "f16",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What are the IAP product types?",
    answerHtml: `<p><b>Consumable</b> (used up, e.g. coins), <b>non-consumable</b> (bought once, e.g. unlock),
      <b>auto-renewable subscription</b> (recurring access), and <b>non-renewing subscription</b> (fixed-term,
      you manage renewal). Each is configured in App Store Connect and surfaced as a <code>Product</code>.</p>`,
    level: "senior",
  },
  {
    id: "f17",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What are subscription groups and what do they enable?",
    answerHtml: `<p>A subscription group holds related auto-renewable tiers; a user can have <b>one active
      subscription per group</b>. Levels within the group define <b>upgrade / downgrade / crossgrade</b> behavior
      and proration. Use ranks to model Bronze/Silver/Gold so switching tiers is handled correctly.</p>`,
    level: "senior",
  },
  {
    id: "f18",
    category: "appstore",
    categoryLabel: "App Store",
    question: "How do you know what a user currently owns?",
    answerHtml: `<p>Iterate <code>Transaction.currentEntitlements</code> — the verified, active purchases and
      subscriptions right now (the source of truth on-device). Also start a long-lived task on
      <code>Transaction.updates</code> at launch to catch renewals, refunds, and purchases made on other devices
      or via Ask to Buy.</p>`,
    level: "senior",
  },
  {
    id: "f19",
    category: "appstore",
    categoryLabel: "App Store",
    question: "How does transaction verification work in StoreKit 2?",
    answerHtml: `<p>StoreKit 2 returns a <code>VerificationResult</code> wrapping a JWS-signed transaction that
      it checks against Apple's certificates <b>on device</b>. You handle <code>.verified</code> vs
      <code>.unverified</code> — only grant entitlements for verified transactions. This removes most of the old
      receipt-parsing dance.</p>`,
    level: "senior",
  },
  {
    id: "f20",
    category: "appstore",
    categoryLabel: "App Store",
    question: "When do you need the App Store Server API / Server Notifications V2?",
    answerHtml: `<p>For a server-backed entitlement system at scale. <b>App Store Server Notifications V2</b>
      push lifecycle events (renew, cancel, refund, billing retry) to your backend in near real time, and the
      <b>App Store Server API</b> lets you query/verify transaction and subscription status server-side. Together
      they're the reliable source of truth for cross-device, fraud-resistant entitlements.</p>`,
    level: "architect",
  },
  {
    id: "f21",
    category: "appstore",
    categoryLabel: "App Store",
    question: "How do you test in-app purchases?",
    answerHtml: `<p>Three layers: a local <b>StoreKit configuration file</b> (<code>.storekit</code>) for fast,
      offline testing in Xcode (and unit tests with StoreKitTest), the <b>Sandbox</b> environment with sandbox
      Apple IDs for end-to-end server behavior, and <b>TestFlight</b> for real-world beta. Local config also lets
      you simulate refunds, renewals, and failures.</p>`,
    level: "senior",
  },
  {
    id: "f22",
    category: "appstore",
    categoryLabel: "App Store",
    question: "How do you implement Restore Purchases (and is it required)?",
    answerHtml: `<p>App Review requires non-consumable / subscription apps to offer <b>Restore Purchases</b>. In
      StoreKit 2 entitlements are read directly from <code>Transaction.currentEntitlements</code>, so often no
      separate restore is needed; provide a button that calls <code>AppStore.sync()</code> to force-refresh from
      the App Store when the user asks.</p>`,
    level: "senior",
  },
  {
    id: "f23",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What offer types can you use to convert and retain?",
    answerHtml: `<p><b>Introductory offers</b> (free trial / pay-as-you-go / pay-up-front, once per user),
      <b>promotional offers</b> (discounts for existing/lapsed subscribers, signed by your server), and <b>offer
      codes</b> (redeemable codes for acquisition/win-back). Configure in App Store Connect and surface the
      eligible offer in your paywall.</p>`,
    level: "senior",
  },
  {
    id: "f24",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What are Ask to Buy and Family Sharing for IAP?",
    answerHtml: `<p><b>Ask to Buy</b> (Family Sharing / Screen Time) makes a child's purchase <b>pending</b>
      until a parent approves — so handle the <code>.pending</code> purchase result and grant later via
      <code>Transaction.updates</code>. <b>Family Sharing</b> can be enabled per product so eligible
      purchases/subscriptions are shared with the family group.</p>`,
    level: "senior",
  },
];

export const ADVANCED5_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED5_QUIZ: QuizQuestion[] = [
  {
    id: "fz1",
    category: "appstore",
    categoryLabel: "App Store",
    question: "An app that is essentially a wrapper around your website is rejected under:",
    options: ["2.1 App Completeness", "4.2 Minimum Functionality", "3.1.1 In-App Purchase", "2.3 Accurate Metadata"],
    answer: 1,
    explanationHtml: `<p>Guideline 4.2 requires lasting value and a real app experience — a pure WebView shell
      of your site doesn't qualify.</p>`,
  },
  {
    id: "fz2",
    category: "appstore",
    categoryLabel: "App Store",
    question: "Unlocking digital content used in the app must use:",
    options: ["Any payment processor", "Apple In-App Purchase (Guideline 3.1.1)", "PayPal only", "A web checkout you link to"],
    answer: 1,
    explanationHtml: `<p>Digital goods/services go through IAP. Physical goods use other methods. External-link
      allowances exist only under specific entitlements/regulations.</p>`,
  },
  {
    id: "fz3",
    category: "appstore",
    categoryLabel: "App Store",
    question: "An app that lets users create an account must also:",
    options: ["Offer a paid tier", "Let users delete their account in-app", "Require Face ID", "Use SwiftData"],
    answer: 1,
    explanationHtml: `<p>Guideline 5.1.1(v): in-app account creation requires in-app account deletion (not
      email-us-to-delete).</p>`,
  },
  {
    id: "fz4",
    category: "appstore",
    categoryLabel: "App Store",
    question: "If you offer Google/Facebook social login as a primary option, you must also offer:",
    options: ["A phone-number login", "A privacy-protective equivalent (e.g. Sign in with Apple)", "A CAPTCHA", "Two-factor auth"],
    answer: 1,
    explanationHtml: `<p>Guideline 4.8 requires an equivalent option that limits data to name/email, can hide the
      email, and doesn't track without consent.</p>`,
  },
  {
    id: "fz5",
    category: "appstore",
    categoryLabel: "App Store",
    question: "Before accessing the IDFA / tracking across other companies' apps, you must:",
    options: ["Nothing — it's automatic", "Show the App Tracking Transparency prompt and respect the choice", "Email Apple", "Add a privacy manifest only"],
    answer: 1,
    explanationHtml: `<p>ATT authorization is required before tracking or using the advertising identifier;
      evading it via fingerprinting is a violation.</p>`,
  },
  {
    id: "fz6",
    category: "appstore",
    categoryLabel: "App Store",
    question: "A login-gated app submitted for review should include:",
    options: ["Nothing special", "A working demo account / demo mode in review notes", "Only screenshots", "A signed NDA"],
    answer: 1,
    explanationHtml: `<p>Guideline 2.1: reviewers need to reach the full experience, so provide a demo account or
      mode and ensure back-end services are live.</p>`,
  },
  {
    id: "fz7",
    category: "appstore",
    categoryLabel: "App Store",
    question: "In StoreKit 2, you should grant an entitlement only when the transaction is:",
    options: [".pending", ".verified (passes JWS verification)", ".userCancelled", "any result"],
    answer: 1,
    explanationHtml: `<p>StoreKit 2 returns a <code>VerificationResult</code>; deliver content only for
      <code>.verified</code> transactions, then call <code>finish()</code>.</p>`,
  },
  {
    id: "fz8",
    category: "appstore",
    categoryLabel: "App Store",
    question: "The reliable source of truth for what a user currently owns on-device is:",
    options: ["A local boolean in UserDefaults", "Transaction.currentEntitlements", "The purchase() return value cached forever", "The receipt file path"],
    answer: 1,
    explanationHtml: `<p>Iterate <code>Transaction.currentEntitlements</code> (and listen to
      <code>Transaction.updates</code>) for active, verified purchases — don't persist a naive unlocked flag.</p>`,
  },
];

export const ADVANCED5_STUDY: StudySection[] = [
  {
    id: "st-adv-15",
    num: "30",
    title: "30 · App Store Review Guidelines — the five pillars & common rejections",
    html: `<p><b>What it is.</b> The rules every release is judged against, in five sections: <b>Safety</b>,
      <b>Performance</b>, <b>Business</b>, <b>Design</b>, <b>Legal</b>. The rejections you'll actually hit:</p>
    <ul>
      <li><b>2.1 Completeness</b> — no crashes/placeholders; provide a demo account; back-end live.</li>
      <li><b>4.2 Minimum functionality</b> — a real app, not a website wrapper.</li>
      <li><b>3.1.1 In-App Purchase</b> — digital goods via IAP (watch evolving external-link rules).</li>
      <li><b>5.1.1</b> — purpose strings for every permission, and <b>in-app account deletion</b> (5.1.1(v)).</li>
      <li><b>4.8</b> — a privacy-protective login option alongside social sign-in.</li>
      <li><b>1.2</b> — UGC needs filtering, reporting, blocking, and a contact.</li>
      <li><b>2.3</b> — accurate metadata/screenshots.</li>
    </ul>
    <div class="callout tip"><span class="lbl">Ship-it move</span> Run this list before every submission, test on
      a clean device, and write clear App Review notes (demo creds, what to test). Most rejections are
      self-inflicted and avoidable.</div>`,
  },
  {
    id: "st-adv-16",
    num: "31",
    title: "31 · StoreKit 2 & subscriptions",
    html: `<p><b>What it is.</b> The modern, async purchasing stack. Load <code>Product</code>s, call
      <code>purchase()</code>, handle the signed <code>VerificationResult</code>, deliver content, and
      <code>finish()</code>. Determine ownership from <code>Transaction.currentEntitlements</code> and keep a
      launch task on <code>Transaction.updates</code> for renewals/refunds/cross-device purchases.</p>
    <p><b>Subscriptions</b> live in <b>groups</b> (one active per group; tiers define upgrade/downgrade/proration).
      Drive conversion with intro/promotional offers and offer codes. For scale and fraud-resistance, back it with
      the <b>App Store Server API</b> + <b>Server Notifications V2</b> as the server-side source of truth. Test
      with a local <code>.storekit</code> config, Sandbox, and TestFlight, and remember the required <b>Restore
      Purchases</b> path (<code>AppStore.sync()</code>).</p>`,
  },
  {
    id: "st-adv-17",
    num: "32",
    title: "32 · Privacy & compliance for submission",
    html: `<p><b>What it is.</b> The non-code gate to shipping. Fill the <b>App Privacy</b> label in App Store
      Connect to match what you (and your SDKs) actually collect. Ship a <b>privacy manifest</b>
      (<code>PrivacyInfo.xcprivacy</code>) declaring data types, tracking domains, and approved reasons for
      <b>required-reason APIs</b>; third-party SDKs must be signed and ship manifests too. Gate cross-app tracking
      behind <b>ATT</b>. Provide <b>purpose strings</b> for every permission. Declare <b>export compliance</b>
      (set <code>ITSAppUsesNonExemptEncryption</code> for standard HTTPS).</p>
    <div class="callout warn"><span class="lbl">Reality</span> Missing manifests or an inaccurate privacy label
      block the build at upload or in review. Treat privacy/compliance as part of the release checklist, not an
      afterthought.</div>`,
  },
];
