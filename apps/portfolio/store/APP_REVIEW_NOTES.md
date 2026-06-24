# App Review Notes — Gerardo Cordero (dev.gerardocordero.portfolio)

Reusable answers for App Store Connect → **App Review Information → Notes**, and for
**Resolution Center** replies. Resolves Guideline 2.1 (Information Needed) metadata
rejections. Keep this updated as the app changes.

## App Store Connect field settings

- **Sign-In required:** OFF (no account in the app).
- **Demo account:** leave blank — not applicable.
- **Contact:** Gerardo Cordero · +584129156498 · cordero.gerard@gmail.com
- **Notes:** paste the block below.
- **Attachment (Resolution Center reply):** the physical-device screen recording (`.mov`).

---

## Reviewer reply / Notes block (copy-paste)

Hello, and thank you for the review.

**About the app**
"Gerardo Cordero" is my personal portfolio / résumé app — an interactive CV for me as
a software engineer. It presents my professional background across six tabs: Status
(overview), Ask (search my portfolio), Log (work experience), Fleet (projects I've
shipped), Tree (education), and Comms (contact links). It is a read-only informational
app: there are no accounts, no purchases, and no user-generated content.

1. Screen recording — A screen recording captured on a physical iPhone is attached to
   this reply. It begins by launching the app and walks through every tab and the Ask
   search feature.

2. Purpose & value — The app is a digital portfolio that lets recruiters, hiring
   managers, and collaborators explore my experience, projects, and skills in a fast,
   native interface, and contact me directly. The problem it solves: replacing a static
   PDF résumé or web page with an interactive, offline-capable app that showcases my
   mobile-development work. Intended audience: people evaluating me for software-
   engineering roles or contract work.

3. How to access / review the main features — No login or credentials are required; all
   features are open on launch.
   - Launch → "Status" tab shows the overview.
   - "Ask" tab: type a question (e.g. "real-time chat" or "React Native performance").
     The app searches my portfolio content on-device and returns a grounded answer with
     sources. Tapping a source navigates to the relevant section.
   - "Log", "Fleet", "Tree": scroll to read experience, projects, and education.
   - "Comms": tap a channel to open Mail (email), Phone, or external links (GitHub,
     LinkedIn, X) in the system browser.

4. External services / tools used — The app's content and the "Ask" search run entirely
   on-device and offline. There is no backend server, no authentication service, no
   payment processor, and no third-party AI or data API in the iOS app.
   - Expo / EAS Updates (u.expo.dev) — used only to deliver over-the-air JavaScript
     updates to this same app; it does not change the app's purpose or fetch external
     content.
   - Outbound links only: tapping a contact item opens the system Mail, Phone, or
     browser to my GitHub, LinkedIn, X, personal website, and App Store pages. No user
     data is collected or transmitted.
   - Built with Expo / React Native.

5. Regional differences — None. The app functions identically in all regions and
   contains the same content worldwide. The content is in English. There is no
   geo-restricted functionality.

6. Regulated industry — Not applicable. This is a personal portfolio app. It does not
   operate in any regulated industry (no finance, health, gambling, etc.) and provides
   no regulated services.

Additional notes:
- The app requests no permissions — no location, camera, microphone, contacts, photos,
  or tracking.
- No account system, so account registration / login / deletion flows do not apply.
- No in-app purchases or subscriptions.
- No user-generated content.

Thank you — happy to provide anything else you need.
Gerardo Cordero · cordero.gerard@gmail.com

---

## Physical-device screen-recording checklist (Apple requires a real device)

1. Open the installed build on your iPhone (TestFlight or dev build).
2. Control Center → Screen Recording. Wait ~3s, then launch the app.
3. Walk through: Status → Ask (type "real-time chat", let results render, tap a source)
   → Log → Fleet → Tree → Comms (tap the email card to show Mail open). ~30–60s.
4. Stop, AirDrop the `.mov` to your Mac, attach it to the Resolution Center reply.

## Screenshots note (Guideline 2.3.3 — verify before re-submitting)

App Store screenshots must show the app actually in use — not the splash/launch screen
or title art. Use real captures of Status, Fleet (projects), and Ask. Replace any
splash-only screenshots.
