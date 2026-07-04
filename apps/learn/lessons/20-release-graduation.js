// Module 20 — Shipping & Graduation (final iOS module). See FORMAT.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "release-graduation",
  title: "Shipping & Graduation",
  emoji: "🚀",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "signing-and-app-store",
      title: "Signing & the App Store",
      steps: [
        {
          type: "text",
          md: [
            "## Three things, tied together",
            "Every build of PawWalk that runs on a real device — a teammate's phone, a TestFlight tester's, an App Store customer's — is **code-signed**. Signing proves the binary came from you and hasn't been tampered with, and it's built from three pieces that all have to agree:",
            "- **An App ID** — the app's identity (`com.pawwalk.app`), registered once with Apple.\n- **A certificate** — proves *who you are* (a developer or your team), issued by Apple and tied to a private key only you hold.\n- **A provisioning profile** — ties the App ID and certificate together with *where it's allowed to run*: specific registered devices for a development profile, or \"anywhere, via App Store distribution\" for an App Store profile.",
            "Xcode can manage all three for you (**automatic signing**, the default, and what PawWalk uses) or you can pick certificates and profiles yourself (**manual signing**) — teams with stricter release processes often want that control. Either way, the profile is the thing that answers \"is this exact binary, from this exact team, allowed to run on this exact device or distribution channel?\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Archive → App Store Connect",
            "Shipping a build is: **Product ▸ Archive** in Xcode (a Release-configuration build, not the Debug one you run every day), then **Distribute App ▸ App Store Connect ▸ Upload** from the Organizer window that opens. Xcode re-signs the archive with your App Store distribution certificate and profile, uploads it, and App Store Connect processes it — usually a few minutes — before it's attached to a version and ready for TestFlight or review.",
            "`xcodebuild` can do the same thing from the command line — useful once this becomes a CI step instead of a manual click. The `-exportOptionsPlist` argument is where you tell it *how* to sign and where to send the result.",
          ],
        },
        {
          type: "code",
          title: "ExportOptions.plist + archive command",
          source: String.raw`<!-- ExportOptions.plist — tells xcodebuild HOW to export an archive -->
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store-connect</string>
    <key>destination</key>
    <string>upload</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>teamID</key>
    <string>ABCDE12345</string>
</dict>
</plist>`,
          caption: String.raw`# archive, then export + upload using that plist
xcodebuild archive \
  -project PawWalk.xcodeproj -scheme PawWalk \
  -configuration Release -archivePath build/PawWalk.xcarchive

xcodebuild -exportArchive \
  -archivePath build/PawWalk.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/export`,
        },
        {
          type: "xcode",
          title: "Over in Xcode",
          intro: [
            "This part is account-gated (needs an Apple Developer Program membership and access to the PawWalk App Store Connect record), so it's a checklist instead of an exercise — skip it if you don't have that access yet:",
          ],
          items: [
            "Select **Any iOS Device (arm64)** as the run destination (archiving needs a device destination, not a simulator).",
            "**Product ▸ Archive.** Xcode builds a Release archive and opens the Organizer when it's done.",
            "In the Organizer, select the archive and click **Distribute App ▸ App Store Connect ▸ Upload**.",
            "Leave **Automatically manage signing** checked unless your team has a reason to sign manually.",
            "Wait for App Store Connect to finish processing the build (an email arrives, or refresh the TestFlight tab) — that's the same build you'll attach to a TestFlight group or a release in the next lesson.",
          ],
        },
        {
          type: "quiz",
          q: "What does a provisioning profile actually tie together?",
          choices: [
            "Just your Apple ID and password",
            "An App ID, a certificate (who you are), and where the app is allowed to run — specific devices, or App Store distribution",
            "The app's version number and build number",
            "Your Xcode project's bundle identifier and its display name",
          ],
          answer: 1,
          explain: "App ID + certificate + allowed destinations (devices, or \"App Store\") is exactly what a provisioning profile bundles — it's the piece that makes signing mean something more specific than just \"Apple trusts this developer.\"",
          nudge: "Signing needs to answer three questions at once: which app, signed by whom, allowed to run where?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "testflight-and-phased-release",
      title: "TestFlight & phased release",
      steps: [
        {
          type: "text",
          md: [
            "## TestFlight: internal vs. external",
            "Once a build finishes processing in App Store Connect, **TestFlight** is how it reaches real devices before the public App Store does. **Internal testing** is your own team (up to 100 people with a role on your App Store Connect record) — a build appears for them within minutes, no review needed. **External testing** is up to 10,000 testers outside your team, invited by email or a public link — the *first* build you send externally goes through a light **Beta App Review** (usually faster than a full App Store review), and most builds after that don't need re-review.",
            "PawWalk's own flow: engineers get builds via internal testing constantly; a small group of real dog walkers and owners test via an external group before anything reaches the store.",
          ],
        },
        {
          type: "text",
          md: [
            "## Phased release: a seatbelt for the whole App Store",
            "**Phased release** is a separate, App Store-wide setting (not a TestFlight thing) for when a *reviewed, approved* update actually reaches every customer. Instead of every user with automatic updates on getting the new version the instant it's approved, phased release rolls it out over **7 days** in increasing steps — roughly 1%, 2%, 5%, 10%, 20%, 50%, then 100% of eligible users. Anyone can still find and manually download the new version early from the App Store page; phased release only controls the automatic-update rollout.",
            "The whole point: if version 2.4.0 has a bug that only shows up in production, a phased release means it hits a **small slice** of users on day one instead of everyone at once — giving you time to notice (via crash reports, next lesson) and **pause** the rollout for up to 30 days before it reaches the rest.",
          ],
        },
        {
          type: "code",
          title: "App Store Connect — version release settings",
          source: String.raw`Version 2.4.0 — Release settings
  Release type:       Manual release
  Phased release:      ON
    Day 1 →   1% of eligible users
    Day 2 →   2%
    Day 3 →   5%
    Day 4 →  10%
    Day 5 →  20%
    Day 6 →  50%
    Day 7 → 100%
  Pause rollout:       available anytime, up to 30 days
  Manual download:     always available to 100% of users, regardless of phase`,
          caption: "Manual release (vs. automatic) means the phased clock only starts once you click Release in App Store Connect after approval — giving you control over exactly when day 1 begins.",
        },
        {
          type: "quiz",
          q: "Why pick a phased release instead of releasing to 100% of users immediately?",
          choices: [
            "It makes App Review approve the build faster",
            "It limits how many users a bad build can reach on day one — a real-world bug surfaces while it still only affects a small slice, and you can pause before it spreads",
            "It's required by Apple for every app update",
            "It automatically fixes crashes found after release",
          ],
          answer: 1,
          explain: "A phased release is a blast-radius control: 1% of users hitting an unexpected bug is a bad day; 100% of users hitting it on day one is an incident. The pause option (up to 30 days) turns \"we shipped a bug\" into \"we caught it while it was still small.\"",
          nudge: "Think about what's different for your users between a bug reaching 1% of them vs. 100% of them, on the same day.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "crash-triage-production",
      title: "Crash triage in production",
      steps: [
        {
          type: "text",
          md: [
            "## Where crashes actually show up",
            "Two places surface real-world crashes without asking users to do anything: **Xcode Organizer's Crashes tab** pulls crash reports Apple collects from devices (opted in to share analytics) and tries to auto-symbolicate them; **MetricKit** (module 19) delivers the same kind of data straight to your app via `MXDiagnosticPayload`, roughly once a day, from whatever devices PawWalk is actually installed on.",
            "A raw crash report is nearly useless on its own — it's a list of memory addresses, not function names. **Symbolication** is the process of turning those addresses back into `PawWalkKit/LiveTracker.swift:142` and the function that was running, using a **dSYM** (debug symbol file) that Xcode produces alongside every Release build. The dSYM has to be the *exact* one matching the build that crashed — mismatch the version and the addresses point at nothing useful. Xcode Organizer generally symbolicates automatically if it can find the matching dSYM; if not, you attach it by hand.",
          ],
        },
        {
          type: "text",
          md: [
            "## Triage by impact, not by noise",
            "A crash report inbox is noisy: one crash that hit 4,000 sessions on the newest iOS version matters far more than fifty distinct one-off crashes each hit once on an ancient device nobody uses anymore. Triage by **user impact** — how many sessions or users it affects, and on what OS/device mix — not by however the list happens to be sorted. Fix the crash affecting the most people first, even if it looks less dramatic in the stack trace than a rarer one.",
          ],
        },
        {
          type: "code",
          title: "Symbolicated crash + MetricKit diagnostic subscriber",
          source: String.raw`// A symbolicated crash — addresses resolved to real names + lines,
// thanks to the matching dSYM for this exact build.
Thread 0 Crashed:
0   PawWalk    0x0000000104a1f2c0 LiveTracker.distanceMeters(_:) + 128
1   PawWalk    0x0000000104a1e900 LiveTracker.addFix(_:) + 64
2   PawWalk    0x0000000104a15110 RouteMapView.body.getter + 220

// MetricKit crash diagnostics — delivered on-device, roughly daily,
// no symbolication needed client-side (App Store Connect does it for you).
import MetricKit

final class CrashReporter: NSObject, MXMetricManagerSubscriber {
    static let shared = CrashReporter()

    func start() {
        MXMetricManager.shared.add(self)
    }

    func didReceive(_ payloads: [MXDiagnosticPayload]) {
        for payload in payloads {
            for crash in payload.crashDiagnostics ?? [] {
                print("Crash: \(crash.exceptionType ?? -1) in \(crash.applicationVersion)")
            }
        }
    }
}`,
          caption: "`crashDiagnostics` is one of several diagnostic arrays on a payload (alongside hang and disk-write diagnostics) — each entry carries a call-stack tree plus the OS version and app version it happened on, exactly what impact-based triage needs.",
        },
        {
          type: "exercise",
          title: "Subscribe to crash diagnostics",
          prompt: [
            "Write `didReceive(_ payloads: [MXDiagnosticPayload])` on `CrashReporter`: loop over `payloads`, and for each one print its `crashDiagnostics` (fall back to an empty array with `?? []` since it's optional).",
          ],
          starter: String.raw`final class CrashReporter: NSObject, MXMetricManagerSubscriber {
    func didReceive(_ payloads: [MXDiagnosticPayload]) {
        // your code here
    }
}`,
          solution: String.raw`final class CrashReporter: NSObject, MXMetricManagerSubscriber {
    func didReceive(_ payloads: [MXDiagnosticPayload]) {
        for payload in payloads {
            print(payload.crashDiagnostics ?? [])
        }
    }
}`,
          checks: [
            { re: /func didReceive\(_ payloads:\[MXDiagnosticPayload\]\)\{/, hint: "Keep the exact signature: `func didReceive(_ payloads: [MXDiagnosticPayload]) { … }` — that's the method MetricKit calls." },
            { re: /for payload in payloads\{/, hint: "Loop over `payloads` with a `for payload in payloads { … }` loop." },
            { re: /print\(payload\.crashDiagnostics\?\?\[\]\)/, hint: "Print it: `print(payload.crashDiagnostics ?? [])` — the property is optional, so fall back to an empty array. Assigning it to an unused variable doesn't count." },
          ],
          success: "That's the real subscriber shape: MetricKit calls `didReceive` with a batch of payloads, and each payload's `crashDiagnostics` is where the actual crash data lives.",
        },
        {
          type: "quiz",
          q: "What is a dSYM for, specifically?",
          choices: [
            "It's the app icon used for TestFlight builds",
            "It maps raw memory addresses in a crash report back to your real function names and line numbers — and it must match the exact build that crashed",
            "It's a certificate used to sign the app for the App Store",
            "It's a config file that controls phased release percentages",
          ],
          answer: 1,
          explain: "Symbolication is exactly this translation — addresses to `LiveTracker.distanceMeters(_:) + 128` — and it only works if the dSYM you use was produced by the *same* build that generated the crash. A dSYM from a different version symbolicates to nonsense or nothing.",
          nudge: "Without the dSYM, a crash report is a list of hex addresses — what does the dSYM turn those into?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "graduation-system-design",
      title: "Graduation & the system-design interview",
      steps: [
        {
          type: "text",
          md: [
            "## From `let name = \"Mochi\"` to a shipped app",
            "Module 1 started with a single constant. Twenty modules later, PawWalk is a real product: SwiftUI screens built on a design system, `Codable` networking with bearer-token auth, an offline-first sync engine, a live GPS tracker drawing routes on a `Canvas`, widgets and Live Activities, push notifications, an AI assistant, a test suite, a profiling habit — and now a release process with signing, TestFlight, phased rollouts, and crash triage behind it. That's not a toy app anymore. That's the shape of a real one.",
            "The senior modules (13–19) added the parts that don't show up in a demo but define whether an app survives contact with real users: structured concurrency instead of callback soup, a module boundary that keeps the codebase from calcifying, a test suite that catches regressions before your users do, and the profiling instinct to measure instead of guess.",
          ],
        },
        {
          type: "text",
          md: [
            "## A primer: the mobile system-design interview",
            "Senior mobile interviews often include a system-design round — *\"design an offline-first feed,\"* *\"design a photo-upload pipeline,\"* *\"design live location sharing.\"* These aren't backend system design questions wearing a mobile costume; they're asking whether you can reason about a **client** that's slow, offline, low-battery, and low-memory by default. You've already built the patterns that answer them:",
            "- **Repository + sync engine** (module 14) — a single source of truth backed by local storage, reconciled with the server in the background, so the UI never blocks on the network.\n- **Pagination** (module 9's booking list) — never load everything; load a page, load more on scroll.\n- **Caching** (module 19) — compute once, store the result, invalidate deliberately instead of recomputing on every redraw.\n- **Background work** (module 18) — defer non-essential work off the critical path (launch, first frame, a user's tap) into a background task.\n- **Idempotency** — module 14's sync engine again: retrying a failed \"create booking\" sync must not create the booking twice. The pattern is a client-generated ID the server can deduplicate on, so a retry after a dropped connection is safe.",
            "A strong answer to \"design an offline-first feed\" is basically: local cache as source of truth (14) → paginated fetches merged in (9) → background refresh (18) → idempotent writes so retries are safe (14) → and profiling in mind from the start so a thousand-item feed doesn't recompute derived state on every scroll (19). You're not learning a new skill for that interview — you're describing PawWalk.",
          ],
        },
        {
          type: "code",
          title: "The shape of the answer, sketched",
          source: String.raw`// "Design an offline-first feed" — the pieces you already own:

// 1. Repository: one source of truth, local-first
final class FeedRepository {
    private(set) var items: [FeedItem] = []       // from local storage — module 14
    func refresh() async { /* fetch, merge, save locally */ }
}

// 2. Pagination: never load it all at once — module 9
func loadNextPage(after cursor: String?) async -> Page<FeedItem> { /* … */ }

// 3. Idempotent writes: a client ID lets the server dedupe a retried request — module 14
struct CreatePostRequest: Codable {
    let clientRequestID: String   // same ID on every retry of the same logical write
    let text: String
}

// 4. Background refresh, off the critical path — module 18
func scheduleBackgroundRefresh() { /* BGTaskScheduler, same idea as push module */ }

// 5. Cache derived state instead of recomputing per redraw — module 19
private let unreadCount: Int   // computed once when items last changed, not in body`,
          caption: "Every numbered comment names the exact module that taught it. That's the interview: naming the pattern, and knowing *why* each one exists because you've felt the bug it prevents.",
        },
        {
          type: "quiz",
          q: "A interviewer asks you to design a photo-upload pipeline for a mobile app that must survive flaky connections. Which combination of patterns from this course applies most directly?",
          choices: [
            "A bigger server and a faster database — the client just needs a progress bar",
            "Idempotent writes (so a retried upload doesn't create duplicates), background work (so the upload survives the user leaving the screen), and a local-first queue (so a dropped connection doesn't lose the photo)",
            "SwiftUI animations, so the upload feels fast even if it isn't",
            "A bigger Wi-Fi icon in the UI so users know when they're offline",
          ],
          answer: 1,
          explain: "The client-side patterns are the ones actually being tested: idempotency so retries are safe (module 14), background tasks so an upload isn't tied to a foregrounded screen (module 18), and a local queue so a photo taken offline isn't lost the moment the connection drops (module 14 again). Server capacity is a real concern too, but it's not what a *mobile* system-design round is probing.",
          nudge: "The interviewer picked \"mobile\" system design on purpose — which patterns live on the client, not the server?",
        },
        {
          type: "quiz",
          q: "Final quiz of the whole iOS track. Which of these is now part of a PawWalk-scale iOS app, start to finish?",
          choices: [
            "Just SwiftUI screens — everything else is optional polish",
            "SwiftUI + a design system, Codable networking with auth, offline-first sync, live GPS tracking, widgets and push, structured concurrency, a test suite, profiling habits, and a signed, phased, monitored release process",
            "Only the backend matters; the iOS app is a thin wrapper",
            "A single massive view controller with all the logic inline",
          ],
          answer: 1,
          explain: "That's the whole arc, module by module — and it's also, not coincidentally, the honest list of what \"production-ready mobile app\" means anywhere you'll work next. Congratulations on finishing the track. 🎓🐾",
          nudge: "Look back at the module list — what's actually shipped once you count everything from module 1 through this one?",
        },
      ],
    },
  ],
});
