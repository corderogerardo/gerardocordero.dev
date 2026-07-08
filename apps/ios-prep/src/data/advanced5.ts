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
    answerHtml: `<p>Review is organized by consequence, not vocabulary — knowing which of the five buckets a rule
      lives in tells you how it'll be enforced before you ever submit. <b>1. Safety</b> (objectionable content, UGC
      moderation, kids, physical harm), <b>2. Performance</b> (completeness, beta/demo, accurate metadata,
      hardware), <b>3. Business</b> (payments & In-App Purchase, subscriptions, acceptable models), <b>4.
      Design</b> (minimum functionality, spam, sign-in, copycats), and <b>5. Legal</b> (privacy, data, intellectual
      property, local laws).</p>
      <p><b>"I map every review risk to one of five buckets — Safety, Performance, Business, Design, Legal —
      before I submit."</b></p>`,
    level: "senior",
  },
  {
    id: "f2",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What does Guideline 2.1 (App Completeness) require?",
    answerHtml: `<p>Reviewers only get one pass at your build — anything unfinished either fails silently in their
      hands or costs you a full extra review cycle. Submit a <b>final, complete build</b>: no crashes, obvious
      bugs, placeholder text, broken links, or unfinished features. Back-end services must be live during review,
      and if any part is gated behind login you must provide a <b>working demo account</b> (or a demo mode) in App
      Review notes.</p>
      <p>Red flag: saying "we'll finish it after approval" — Apple treats an incomplete submission as grounds for
      rejection, not a promise it tracks.</p>
      <p><b>"I ship App Review a build I'd be comfortable a real user hitting cold, plus a demo account so nothing
      is gated behind a login they can't pass."</b></p>`,
    level: "senior",
  },
  {
    id: "f3",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is Guideline 4.2 (Minimum Functionality)?",
    answerHtml: `<p>Apple curates for apps with lasting value, not marketing collateral — this single guideline
      accounts for a large share of first-submission rejections. Your app must provide a real app experience, not
      just a repackaged website or a thin wrapper. Web content is fine as part of the app, but a pure WebView shell
      of your site will be rejected.</p>
      <p><b>"My app does something a browser tab can't — that's the bar I build to before I ever submit."</b></p>`,
    level: "senior",
  },
  {
    id: "f4",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What does Guideline 3.1.1 (In-App Purchase) require?",
    answerHtml: `<p>3.1.1 protects Apple's platform economics: anything that unlocks value inside the app itself
      has to flow through their commission. Unlocking <b>digital goods/services</b> used in the app must go
      through Apple's In-App Purchase; you generally can't sell those elsewhere or steer users to an external
      purchase inside the app. <b>Physical</b> goods/services use other payment methods (not IAP).</p>
      <p>Red flag: assuming external-link payments are permanently banned — external-link and alternative-payment
      allowances have been expanding via regulation and litigation (reader apps, EU DMA, US link entitlement with a
      commission); check current entitlements for your case rather than defaulting to the old rule.</p>
      <p><b>"Digital unlocks go through IAP, physical goods don't — and I verify current entitlements before
      assuming external payment links are off the table."</b></p>`,
    level: "senior",
  },
  {
    id: "f5",
    category: "appstore",
    categoryLabel: "App Store",
    question: "Why does every permission need a purpose string?",
    answerHtml: `<p>A missing purpose string doesn't just fail review — it crashes the app the instant you request
      that permission, so it's a bug you should catch before Apple does. Guideline 5.1.1 + the OS require a clear
      <b>usage-description string</b> in <code>Info.plist</code> (e.g. <code>NSCameraUsageDescription</code>)
      explaining <i>why</i> you need camera, location, contacts, etc.</p>
      <p>Red flag: writing a generic string like "This app needs your location" — reviewers and users both read
      that as evasive. Name the specific feature it powers, and request access only when you actually need it.</p>
      <p><b>"I request permission exactly when the feature needs it, with a purpose string that says why in plain
      language — never at launch, never vague."</b></p>`,
    level: "senior",
  },
  {
    id: "f6",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is the in-app account deletion requirement?",
    answerHtml: `<p>"Email us to delete your account" is a dark pattern — Guideline 5.1.1(v) closes that loophole by
      requiring deletion to be as easy as sign-up. Any app that lets users <b>create an account</b> must also let
      them <b>initiate account deletion from within the app</b>, and it must actually remove the account and
      associated data.</p>
      <p>Red flag: shipping a "disable account" button instead of real deletion — disabling without removing data
      still fails this guideline, and it's a common rejection for apps with sign-up.</p>
      <p><b>"If a user can create an account in my app, they can delete it and its data in the same number of
      taps."</b></p>`,
    level: "senior",
  },
  {
    id: "f7",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What does Guideline 4.8 (Login Services) require?",
    answerHtml: `<p>4.8 exists so the convenience of social login doesn't become a privacy trade-off users never
      agreed to. If your app offers a <b>third-party or social login</b> (Google, Facebook, etc.) as a primary
      option, you must also offer a <b>privacy-protective equivalent</b> — one that limits data to name and email,
      lets users keep their email private, and doesn't track them without consent. Sign in with Apple satisfies
      this; the guideline now allows other equivalent options too.</p>
      <p><b>"Whatever social login I add, I pair it with a privacy-protective option — Sign in with Apple usually
      gets me that for free."</b></p>`,
    level: "senior",
  },
  {
    id: "f8",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What must apps with user-generated content provide (Guideline 1.2)?",
    answerHtml: `<p>Apple holds you liable for what your users post — UGC apps get pulled for moderation failures,
      not just for the content itself. Four things are required, or you risk removal: a method to <b>filter</b>
      objectionable content, a mechanism to <b>report</b> it (with timely action), the ability to <b>block</b>
      abusive users, and <b>published contact info</b>.</p>
      <p><b>"Filter, report, block, contact — if any one of those is missing, my UGC feature isn't ready to
      ship."</b></p>`,
    level: "senior",
  },
  {
    id: "f9",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What does Guideline 2.3 (Accurate Metadata) cover?",
    answerHtml: `<p>Reviewers test your app against your own claims — the fastest way to get rejected is to
      describe features you haven't built yet. Your name, description, screenshots, preview, and keywords must
      <b>accurately reflect</b> the app: no hidden or undocumented features, no mentioning other platforms, no
      misleading screenshots, correct age rating.</p>
      <p>Red flag: writing an aspirational description for a feature still behind a flag — reviewers will look for
      it and reject when it's missing.</p>
      <p><b>"My store listing describes exactly what ships today, not what I'm planning to ship next
      sprint."</b></p>`,
    level: "senior",
  },
  {
    id: "f10",
    category: "appstore",
    categoryLabel: "App Store",
    question: "When must you show the App Tracking Transparency prompt?",
    answerHtml: `<p>ATT exists because tracking across other companies' apps and sites is exactly the kind of
      invisible data flow users can't consent to just by installing your app. Before <b>tracking</b> the user
      across apps and websites owned by other companies, or accessing the device's advertising identifier (IDFA),
      you must request permission via the ATT prompt
      (<code>ATTrackingManager.requestTrackingAuthorization</code>) and respect the answer.</p>
      <p>Red flag: fingerprinting to route around a "no" — that's a policy violation stacked on top of the
      original ask, not a clever workaround.</p>
      <p><b>"I show ATT before any cross-app tracking or IDFA access, and I respect whatever the user
      answers."</b></p>`,
    level: "senior",
  },
  {
    id: "f11",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is the App Privacy 'nutrition label'?",
    answerHtml: `<p>The label exists so a user can judge your data practices without reading a privacy policy —
      which means it has to match reality, including whatever your third-party SDKs do behind your back. In App
      Store Connect you declare <b>what data your app collects</b>, whether it's linked to the user, and whether
      it's used for tracking, shown on the product page as the privacy label.</p>
      <p><b>"My privacy label reflects the union of what my code collects and what every SDK I bundle collects —
      I audit both, not just my own code."</b></p>`,
    level: "senior",
  },
  {
    id: "f12",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is a privacy manifest and required-reason API?",
    answerHtml: `<p>Apple can't audit every SDK's source, so it shifts the disclosure burden onto declared,
      machine-checkable reasons for APIs that are easy to abuse for fingerprinting. A
      <code>PrivacyInfo.xcprivacy</code> file declares the data types you collect, tracking domains, and the
      <b>approved reason</b> for using certain "required-reason" APIs (e.g. file timestamps, UserDefaults, disk
      space). Apple aggregates manifests from your app and SDKs; missing manifests or undeclared reasons block
      submission.</p>
      <p><b>"Every required-reason API I call has a declared, approved reason in my privacy manifest — and I
      check that my third-party SDKs ship theirs too."</b></p>`,
    level: "senior",
  },
  {
    id: "f13",
    category: "appstore",
    categoryLabel: "App Store",
    question: "How does the review timeline work, and what if you're rejected?",
    answerHtml: `<p>Review timing shapes your release cadence — plan hotfixes around it instead of treating a
      rejection as a dead end. <b>1. Submit</b> and expect a decision within about a day, often faster. <b>2.</b>
      If it's urgent, request <b>expedited review</b>. <b>3.</b> On rejection, read the reason in the <b>Resolution
      Center</b>. <b>4.</b> Reply with context, or <b>appeal</b> to the App Review Board if you believe it's a
      mistake. TestFlight builds get a lighter review for beta testing.</p>
      <p><b>"A rejection is a conversation, not a dead end — I reply in the Resolution Center before I assume I
      need to appeal."</b></p>`,
    level: "senior",
  },
  {
    id: "f14",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is export compliance (encryption) at submission?",
    answerHtml: `<p>Encryption is a regulated export in many jurisdictions — most apps clear this with one flag
      instead of paperwork. Apps that use encryption must declare it. Most apps only use standard HTTPS/TLS, which
      is <b>exempt</b> — set <code>ITSAppUsesNonExemptEncryption</code> to <code>false</code> in
      <code>Info.plist</code> to skip the prompt each upload. If you implement custom/proprietary cryptography you
      may need export documentation.</p>
      <p><b>"Standard HTTPS is exempt, so I set ITSAppUsesNonExemptEncryption to false and skip the prompt on every
      upload — custom crypto is the only case that needs real paperwork."</b></p>`,
    level: "senior",
  },
  {
    id: "f15",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What does a StoreKit 2 purchase flow look like?",
    answerHtml: `<p>StoreKit 2 collapses the old receipt-parsing dance into a handful of async calls — less
      boilerplate means fewer places for entitlement bugs to hide. Load products, call <code>purchase()</code>,
      verify the signed transaction, deliver content, and <code>finish()</code> it.</p>
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
}</div>
    <p><b>"Load, purchase, verify, deliver, finish — that's the whole loop, and I only grant entitlement on
    <code>.verified</code>."</b></p>`,
    level: "senior",
  },
  {
    id: "f16",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What are the IAP product types?",
    answerHtml: `<p>Picking the wrong product type is a business-model bug, not a checkbox — getting it wrong
      means re-architecting entitlements later. <b>Consumable</b> (used up, e.g. coins), <b>non-consumable</b>
      (bought once, e.g. unlock), <b>auto-renewable subscription</b> (recurring access), and <b>non-renewing
      subscription</b> (fixed-term, you manage renewal). Each is configured in App Store Connect and surfaced as a
      <code>Product</code>.</p>
      <p><b>"I pick the product type based on the entitlement's lifecycle, not the price point."</b></p>`,
    level: "senior",
  },
  {
    id: "f17",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What are subscription groups and what do they enable?",
    answerHtml: `<p>Groups exist to stop double-billing — Apple enforces one active tier per group so switching
      plans is a state transition, not two separate purchases. A subscription group holds related auto-renewable
      tiers; a user can have <b>one active subscription per group</b>. Levels within the group define <b>upgrade /
      downgrade / crossgrade</b> behavior and proration.</p>
      <p><b>"I model tiers with ranks inside one group so switching plans is an upgrade, not a second
      subscription."</b></p>`,
    level: "senior",
  },
  {
    id: "f18",
    category: "appstore",
    categoryLabel: "App Store",
    question: "How do you know what a user currently owns?",
    answerHtml: `<p>An entitlement check has to survive refunds, renewals, and purchases made on a different device
      — that's why you read live state instead of trusting a cached flag. Iterate
      <code>Transaction.currentEntitlements</code> — the verified, active purchases and subscriptions right now.
      Also start a long-lived task on <code>Transaction.updates</code> at launch to catch renewals, refunds, and
      purchases made on other devices or via Ask to Buy.</p>
      <p><b>"I treat Transaction.currentEntitlements as the source of truth and keep a Transaction.updates
      listener running from launch, not just after a purchase."</b></p>`,
    level: "senior",
  },
  {
    id: "f19",
    category: "appstore",
    categoryLabel: "App Store",
    question: "How does transaction verification work in StoreKit 2?",
    answerHtml: `<p>On-device verification is what let Apple retire server-side receipt validation for most
      apps — the signature check happens locally, so you don't need a validation server just to gate content.
      StoreKit 2 returns a <code>VerificationResult</code> wrapping a JWS-signed transaction that it checks against
      Apple's certificates <b>on device</b>. You handle <code>.verified</code> vs <code>.unverified</code>.</p>
      <p><b>"I only unlock content for <code>.verified</code> transactions — <code>.unverified</code> is treated as
      untrusted, full stop."</b></p>`,
    level: "senior",
  },
  {
    id: "f20",
    category: "appstore",
    categoryLabel: "App Store",
    question: "When do you need the App Store Server API / Server Notifications V2?",
    answerHtml: `<p>A client-only entitlement check breaks the moment you need cross-device sync or fraud
      resistance — that's what pushes entitlements onto your server. <b>App Store Server Notifications V2</b> push
      lifecycle events (renew, cancel, refund, billing retry) to your backend in near real time, and the <b>App
      Store Server API</b> lets you query/verify transaction and subscription status server-side.</p>
      <p><b>"At scale, the client is no longer the source of truth — Server Notifications V2 pushes lifecycle
      events to my backend and the Server API lets me verify them."</b></p>`,
    level: "architect",
  },
  {
    id: "f21",
    category: "appstore",
    categoryLabel: "App Store",
    question: "How do you test in-app purchases?",
    answerHtml: `<p>Each layer catches a different class of bug, so skipping one leaves a gap in coverage. <b>1.</b>
      A local <b>StoreKit configuration file</b> (<code>.storekit</code>) for fast, offline testing in Xcode (and
      unit tests with StoreKitTest) — it also lets you simulate refunds, renewals, and failures. <b>2.</b> The
      <b>Sandbox</b> environment with sandbox Apple IDs for end-to-end server behavior. <b>3.</b> <b>TestFlight</b>
      for real-world beta.</p>
      <p><b>"I test the failure paths — refunds, renewals, billing retries — locally before I ever touch
      Sandbox."</b></p>`,
    level: "senior",
  },
  {
    id: "f22",
    category: "appstore",
    categoryLabel: "App Store",
    question: "How do you implement Restore Purchases (and is it required)?",
    answerHtml: `<p>Restore Purchases exists for a case StoreKit 2 mostly already solves — reinstalls and new
      devices — but Apple still requires the button. App Review requires non-consumable / subscription apps to
      offer it. In StoreKit 2 entitlements are read directly from <code>Transaction.currentEntitlements</code>, so
      often no separate restore logic is needed; provide a button that calls <code>AppStore.sync()</code> to
      force-refresh from the App Store when the user asks.</p>
      <p><b>"StoreKit 2 reads entitlements live, so my restore button is really just AppStore.sync() forcing a
      refresh — not a separate code path."</b></p>`,
    level: "senior",
  },
  {
    id: "f23",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What offer types can you use to convert and retain?",
    answerHtml: `<p>Different offer types solve different funnel problems — using the wrong one for the moment
      wastes the discount. <b>Introductory offers</b> (free trial / pay-as-you-go / pay-up-front, once per user),
      <b>promotional offers</b> (discounts for existing/lapsed subscribers, signed by your server), and <b>offer
      codes</b> (redeemable codes for acquisition/win-back). Configure in App Store Connect and surface the eligible
      offer in your paywall.</p>
      <p><b>"I match the offer to the funnel stage: intro offers for first-time conversion, promotional offers for
      win-back, codes for acquisition."</b></p>`,
    level: "senior",
  },
  {
    id: "f24",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What are Ask to Buy and Family Sharing for IAP?",
    answerHtml: `<p>A purchase inside a child's account shouldn't complete without a parent's say — which means
      your code has to model a purchase that doesn't resolve immediately. <b>Ask to Buy</b> (Family Sharing /
      Screen Time) makes a child's purchase <b>pending</b> until a parent approves, so handle the
      <code>.pending</code> purchase result and grant later via <code>Transaction.updates</code>. <b>Family
      Sharing</b> can be enabled per product so eligible purchases/subscriptions are shared with the family
      group.</p>
      <p><b>"I handle <code>.pending</code> as a real state, not an edge case — the grant comes later through
      Transaction.updates, not synchronously."</b></p>`,
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
    explanationHtml: `<p>Guideline 4.2 requires lasting value and a real app experience — a pure WebView shell of
      your site doesn't qualify. 2.1 is tempting because it's about a build being "unfinished," but a WebView
      wrapper can be perfectly stable and bug-free; the failure here is architectural, not a bug, which is what
      makes it 4.2.</p>`,
  },
  {
    id: "fz2",
    category: "appstore",
    categoryLabel: "App Store",
    question: "Unlocking digital content used in the app must use:",
    options: ["Any payment processor", "Apple In-App Purchase (Guideline 3.1.1)", "PayPal only", "A web checkout you link to"],
    answer: 1,
    explanationHtml: `<p>Digital goods/services go through IAP. Physical goods use other methods. Linking out to a
      web checkout is the classic workaround that still fails 3.1.1 for digital goods — the external-link
      exception only applies under specific, narrow entitlements/regulations, not by default.</p>`,
  },
  {
    id: "fz3",
    category: "appstore",
    categoryLabel: "App Store",
    question: "An app that lets users create an account must also:",
    options: ["Offer a paid tier", "Let users delete their account in-app", "Require Face ID", "Use SwiftData"],
    answer: 1,
    explanationHtml: `<p>Guideline 5.1.1(v): in-app account creation requires in-app account deletion. Disabling
      the account isn't enough, and neither is directing users to email support — deletion has to be self-service
      and in-app, and it must actually remove the data.</p>`,
  },
  {
    id: "fz4",
    category: "appstore",
    categoryLabel: "App Store",
    question: "If you offer Google/Facebook social login as a primary option, you must also offer:",
    options: ["A phone-number login", "A privacy-protective equivalent (e.g. Sign in with Apple)", "A CAPTCHA", "Two-factor auth"],
    answer: 1,
    explanationHtml: `<p>Guideline 4.8 requires an equivalent option that limits data to name/email, can hide the
      email, and doesn't track without consent. A phone-number login doesn't satisfy 4.8 by itself — the
      requirement is specifically about privacy, not about offering a different auth factor.</p>`,
  },
  {
    id: "fz5",
    category: "appstore",
    categoryLabel: "App Store",
    question: "Before accessing the IDFA / tracking across other companies' apps, you must:",
    options: ["Nothing — it's automatic", "Show the App Tracking Transparency prompt and respect the choice", "Email Apple", "Add a privacy manifest only"],
    answer: 1,
    explanationHtml: `<p>ATT authorization is required before tracking or using the advertising identifier;
      evading it via fingerprinting is a violation. A privacy manifest declares required-reason API usage — it's a
      separate mechanism from ATT and doesn't substitute for the tracking prompt.</p>`,
  },
  {
    id: "fz6",
    category: "appstore",
    categoryLabel: "App Store",
    question: "A login-gated app submitted for review should include:",
    options: ["Nothing special", "A working demo account / demo mode in review notes", "Only screenshots", "A signed NDA"],
    answer: 1,
    explanationHtml: `<p>Guideline 2.1: reviewers need to reach the full experience, so provide a demo account or
      mode and ensure back-end services are live. Screenshots alone don't let a reviewer exercise the app's actual
      logic — they need a path all the way through the login gate.</p>`,
  },
  {
    id: "fz7",
    category: "appstore",
    categoryLabel: "App Store",
    question: "In StoreKit 2, you should grant an entitlement only when the transaction is:",
    options: [".pending", ".verified (passes JWS verification)", ".userCancelled", "any result"],
    answer: 1,
    explanationHtml: `<p>StoreKit 2 returns a <code>VerificationResult</code>; deliver content only for
      <code>.verified</code> transactions, then call <code>finish()</code>. <code>.pending</code> means a purchase
      (e.g. Ask to Buy) hasn't resolved yet — granting entitlement there hands out content for a purchase that
      might still be declined.</p>`,
  },
  {
    id: "fz8",
    category: "appstore",
    categoryLabel: "App Store",
    question: "The reliable source of truth for what a user currently owns on-device is:",
    options: ["A local boolean in UserDefaults", "Transaction.currentEntitlements", "The purchase() return value cached forever", "The receipt file path"],
    answer: 1,
    explanationHtml: `<p>Iterate <code>Transaction.currentEntitlements</code> (and listen to
      <code>Transaction.updates</code>) for active, verified purchases. A cached boolean in UserDefaults survives
      refunds and revocations with a stale "true" — it doesn't reflect live entitlement, which is exactly the bug
      <code>currentEntitlements</code> avoids.</p>`,
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
    <p><b>Say this:</b> "I check my build against these seven guidelines before every submission — most
      rejections are self-inflicted."</p>
    <div class="callout tip"><span class="lbl">Ship-it move</span> Run this list before every submission, test on
      a clean device, and write clear App Review notes (demo creds, what to test). Most rejections are
      self-inflicted and avoidable.</div>`,
  },
  {
    id: "st-adv-16",
    num: "31",
    title: "31 · StoreKit 2 & subscriptions",
    html: `<p><b>What it is.</b> The modern, async purchasing stack — it exists because the old receipt-parsing
      dance pushed validation logic onto the client and made entitlement bugs hard to trust. Load
      <code>Product</code>s, call <code>purchase()</code>, handle the signed <code>VerificationResult</code>,
      deliver content, and <code>finish()</code>. Determine ownership from
      <code>Transaction.currentEntitlements</code> and keep a launch task on <code>Transaction.updates</code> for
      renewals/refunds/cross-device purchases.</p>
    <p><b>Subscriptions</b> live in <b>groups</b> (one active per group; tiers define upgrade/downgrade/proration).
      Drive conversion with intro/promotional offers and offer codes. For scale and fraud-resistance, back it with
      the <b>App Store Server API</b> + <b>Server Notifications V2</b> as the server-side source of truth. Test
      with a local <code>.storekit</code> config, Sandbox, and TestFlight, and remember the required <b>Restore
      Purchases</b> path (<code>AppStore.sync()</code>).</p>
    <p><b>Say this:</b> "I only grant entitlement on a verified transaction, and I read ownership live from
      currentEntitlements instead of trusting a cached flag."</p>`,
  },
  {
    id: "st-adv-17",
    num: "32",
    title: "32 · Privacy & compliance for submission",
    html: `<p><b>What it is.</b> The non-code gate to shipping — compliance failures block a build at upload, not
      just in review, so this is checklist work, not judgment work. Fill the <b>App Privacy</b> label in App Store
      Connect to match what you (and your SDKs) actually collect. Ship a <b>privacy manifest</b>
      (<code>PrivacyInfo.xcprivacy</code>) declaring data types, tracking domains, and approved reasons for
      <b>required-reason APIs</b>; third-party SDKs must be signed and ship manifests too. Gate cross-app tracking
      behind <b>ATT</b>. Provide <b>purpose strings</b> for every permission. Declare <b>export compliance</b>
      (set <code>ITSAppUsesNonExemptEncryption</code> for standard HTTPS).</p>
    <p><b>Say this:</b> "Privacy and compliance are on my release checklist, not an afterthought — my label has to
      match what my own code and every bundled SDK actually collect."</p>
    <div class="callout warn"><span class="lbl">Reality</span> Missing manifests or an inaccurate privacy label
      block the build at upload or in review. Treat privacy/compliance as part of the release checklist, not an
      afterthought.</div>`,
  },
];
