# Work History — Gerardo Esteban Cordero Angulo

> Reconstructed from **git history across 118 repositories** (~87 with commits by me) the active `gerardocordero.dev` monorepo. Reverse chronological — most recent first. Every feature, fix, and project below traces back to real commit history, not memory.

## Identities used across commits


| Period      | Email(s)                                                 |
| ----------- | -------------------------------------------------------- |
| 2016 – 2026 | `cordero.gerard@gmail.com`                               |
| 2019 – 2020 | `me@gerardocordero.dev`                                  |
| 2018 – 2019 | `gcordero@solera.pe`                                     |
| 2021 – 2022 | `gcordero@crnova.com`, `gcordero@novacompcr.com`         |
| 2023 – 2026 | `gerardo.cordero@truenorth.co`, GitHub `cordero-gerardo` |


---

## Summary


| #   | Company / setting                         | Span                          | Stack                                                                                                   | ~my commits          |
| --- | ----------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------- |
| 1   | **TrueNorth — Valt Network**              | Mar 2023 – May 2026 (current) | React Native / Expo, TypeScript, React Query, Twilio Conversations, PSPDFKit, Amplify, Electron desktop | ~530 on 6 products   |
| 2   | **NovaComp**                              | Mar 2021 – Oct 2022           | React Native, Expo, TypeScript, Amplify/AWS, Stripe, OneSignal, Material UI                             | ~715 across 18 repos |
| 3   | **Solera Mobile**                         | Jul 2018 – Apr 2019           | Angular 5–8, GTM/Analytics, SCSS, AngularJS                                                             | ~313 across 7 repos  |
| 4   | **BitsKingdom**                           | Mar 2018 – Apr 2020           | Meteor, React Native, Expo, Stripe, Twilio SMS                                                          | ~840 across 12 repos |
| 5   | **OINO (freelance)**                      | Aug 2019 – Apr 2020           | Meteor, React, Blaze, Stripe, Mailgun                                                                   | ~206 across 5 repos  |
| 6   | **No Office Location — OKRs (freelance)** | Dec 2019 – Feb 2020           | Rails API + Angular 9                                                                                   | ~68 across 3 repos   |
| 7   | **Personal &amp; learning**               | 2016 – 2026                   | Portfolio (React → Expo RN), Meteor, TypeScript, Flutter, courses                                       | ~450                 |


---

# 1. TrueNorth — Valt Network (Mar 2023 – May 2026) · current role

Mobile + web engineer on the **Valt professional network** platform (mobile app, web platform, and desktop add-ons). Started on the greenfield Valt mobile app and grew into owning large swaths of the mobile product: chats, network feed, discover, orgs/workspaces, auth, and payments-adjacent experiences.

### Products

- **Valt mobile app** (`valt-mobile` → deprecated → `valt-sites-mobile`) — React Native, **~480 commits**
- **Valt web platform** (`valt-platform`) — 8 commits (docs, universal links, seed work)
- **Dulce desktop app** (`dulce`) — Electron/desktop, Zoom Companion add-on, **25 commits** (May 2026)
- **PSPDFKit Expo demo** (`pspdpfkit-expo`) — portal PoC (Apr 2024)

---

## Valt mobile app — `valt-sites-mobile` (+ former `valt-mobile`)

**2023-03 → 2026-04 · React Native / Expo, TypeScript, React Query, Twilio, AWS Amplify**

### Phase 1 — Greenfield app foundation (valt-mobile, 2023)

- **Connect experience with QR**: built the Scan screen — evaluated `react-native-vision-camera` and shipped with `react-native-camera-kit` after solving Android camera issues (kotlin minSdk, Reanimated v2 downgrade, bridging docs); added first-time scan modal with a zustand store.
- **Firebase Dynamic Links**: full iOS setup (Podfile extra config, AppDelegate, `GoogleServices-info`, bundle id) + Android AASA/linking; built `useGetDeepLink`/`useGetDeepLinkURL` hooks that navigate from links and survive app foreground/background — with unit tests and a fix for non-existent routes on Android.
- **Custom QR component** (variants + tests) and a **carousel component** (react-native-reanimated-carousel, render-prop driven, unit-tested).
- **Design-system primitives**: custom `Button` (primary/secondary/neutral/destructive themes on Pressable), `Text` (Inter → Roboto font centralization), `Tag`, `CustomIcon` — all with unit tests.
- **Camera permissions UX**: `useCameraPermission` handling iOS + Android, foreground/background re-check hooks, black-screen-on-Android bug fixed.
- **Profile module**: profile navigator, edit-profile card-by-card, basic information form (React Hook Form + multiselect Interests), linked organizations, `AvatarHandler` component, app/test icons for iOS + Android.
- **API layer early**: MSW mocks with React Query for signup/validate-email, request timeouts so the app never hangs, Create Account flow (with mocks before backend existed).
- **Account management**: close account flow, security storage for credentials, share-link messages, universal link + QR routing.

### Phase 2 — The platform app (valt-sites-mobile, 2023-10 → 2026-04)

**Chats / Messaging (Twilio Conversations) — the big ownership area:**

- Migrated the app onto **Twilio Conversations**: singleton Twilio provider, create conversations with connections, chat rooms, private chat + group conversation creation, "backTo" fixes in group navigation.
- **Attachments**: upload/download files in Twilio chat conversations; preview attachments with participants list; media ""content service unavailable"" error handling; camera pick.
- **Reactions in messages** (emojis) with improved UX; **unread counters** per conversation, sort by last message, mark-all-as-read, badge on header icons.
- **Real-time**: live unread updates, message counters, sync fixes ("Remove pagination because it was affecting other conversations by not displaying current sent message"), crash-on-release fix related to chats, push notification → navigate to the chat screen, cleaned the Twilio client lifecycle (conversationClient-null fix after conversation creation).
- **Optimistic updates** for messages and a big refactor/cleanup pass.

**Network feed / social:**

- Posts with **metadata entities**, link behavior on URLs in content, replies-to-comments (view more/hide replies), post as Organization, delete posts.
- **Report / block / hide module** with bottom-sheet examples (edit report, delete), "sensitive content" display, report abuse from a post or user, account deletion initiation.
- Feed/explore Home, explore members, member connect button.

**Discover / global directory:**

- Groups, events, job openings, articles, and opportunities with one shared `useSearchFilter` implementation; search loading spinner to kill flicker; menu filters without re-renders (removed useState churn); network-update item cards.
- **Universal navigation**: deal, groups, tests, chats; linked-org inner screens.

**Organizations &amp; workspaces:**

- Create workspaces, org profile (banner crop + optimistic upload, interests), invite member/team, revoke pending invitations, update member title/role, set primary + detach org, **change ownership of organization**, linked organizations, hide Form Builder from create-workspace flow.

**User profile:**

- Interests with **optimistic updates** incl. row counts, about/tagline, US state list, location screens, avatar camera upload, banner crop via `useImageProcessing` hook, name save with keyboard open, apple/avatar refresh timing.

**Auth &amp; security:**

- **Google Sign-In** (button refactor), email signup flows with validation, session token checks (logout on invalid/expired), biometric login with `react-native-keychain` (FaceID/TouchID), global search + deviceType on sign-in, XLA/USM ext-query migration, credentials via External Connected Apps for Salesforce login.

**PSPDFKit (documents/cases):**

- Demo PSPDFKit portal, load statements from backend and display in viewer, toolbar improvements, asset formats, patched package to disable warning alerts, viewer doc assets.

**Platform polish:**

- Version manager that clears stale caches when a new backend version deploys; `React Query` refetch on window focus; **TypeScript cleanup campaigns** ("fix as any and any typescript issues — no more lint errors", "Fix typescript types for Valt"); releases **1.0.41 → 1.0.44** with TestFlight/Play management; holdings screen fix (formattedDate default).

### Interview takeaways — Valt

- Owned the mobile chat experience end-to-end: rearchitected onto Twilio Conversations with optimistic updates, attachments, reactions, and real-time unread state — raising reliability (crash fixes) while shipping UX polish.
- Repeatedly reworked caches/state with React Query to eliminate flicker and stale data (menu filters, search, profile interests) — a systemic performance/UX pass, not one-off fixes.
- Pulled multiple products from greenfield to App Store/Play releases (valt-mobile phase 1, valt-sites-mobile releases, dulce desktop).

---

---

## Ambroxan — `ambroxan` (Nov 2025 – Feb 2026, personal)

Greenfield Expo monorepo (app + `shared/ui` package) with **Supabase backend**:

- Authentication backend (sign up, login, forgot password; verified on web), **Supabase products feature**, Button/slot primitives + UI docs, Expo config, monorepo setup, Tailwind.

---

## My Survivor — `my-survivor` (Apr 2026, personal)

Game prototype: initial commit, game files, **player movements**, sample scene.

---

## Valt web platform — `valt-platform` (2023 – 2026)

- Form Builder docs (V.0.1), FormBuilder JSONs for new orgs, mobile External Client App docs, valid US phone seeds, **universal links setup for portal**, URL Rewriter conversion.

---

# 2. NovaComp — NovaBank products (Mar 2021 – Oct 2022)

Mobile lead/engineer across a family of startup apps (Instatoolz, SwimSpot, GymBuddy, Hotspotter, NovaExpediente) on AWS Amplify + React Native/Expo, plus shared "core app" foundations. **~715 commits** across 18 repos.

### Products

- **Instatoolz** — app (127), web admin (2), Amplify FE (7) — tool/equipment rental marketplace
- **NovaExpediente** (119) — corporate employee app
- **SwimSpot** — apps (121), Amplify backend (68), splashspot backend lambdas (30), client site (3)
- **GymBuddy** — app (87), web (20), admin (1)
- **Hotspotter** — app (59), webpanel (4), admin (1)
- **Core apps** — `core_app` (32), `core_fe` (17), `core_app_tailwind` (14)
- **Expediente** seed (1)

---

## Instatoolz — rental marketplace (app + backend)

**2021-03 → 2022-10 · React Native (Expo → bare), TypeScript, Amplify/AWS AppSync, Stripe, PayPal**

- **Buy/Rent with Stripe**: payment methods (add card, list cards, set default), charge via AppSync mutations + `charge` lambda, rent days calculation, order creation UI, price formatting for US market, validate cards before renting.
- **PayPal checkout** PoC (locked to Expo at first).
- **Reviews &amp; ratings**: rate items by checking reviews, sort/1-decimal rating, filter items by block/hide/report state.
- **Nearby items** (GPS + tools availability filtering), search screen item-selection sync fix, account-edit bug fix, release signing for Android (`gradle` configs, APK sign), **iOS Archive/TestFlight + App Store Connect configs**, App Center build setup (after eject), callstack leak cleanup ("clean some functions to avoid the callstack leaks and js thread block").
- **Amplify backend**: auth, GraphQL API, custom resolver `findTools`/`findItems`, notifications ARNs, iOS push notifications.

### Interview takeaway — Instatoolz

- Full payments pipeline: MVP Stripe (cards, charges, defaults) through PayPal PoC to production App Store/Play releases — including the release-infra work (eject, signing, App Center) that unblocked shipping.

---

## NovaExpediente — corporate employee app

**2022-04 → 2022-10 · Expo / React Native, TypeScript, React Query v4, IdentityServer, OneSignal**

- **Login via Identity Server** (token check on every request, token expiry on app close/open/kill); React Query v4 + offline mode.
- **Vacations**: days-available fetch, request modal with error/fail states, history, validations, friendly "Bienvenido/s" home.
- **Activities + Calendar** (with dots), **News** feed + detail, Nova services, profile + avatar update (ImagePicker), notifications center, settings.
- **OneSignal push** with tags by `userExternalId` + `ubicadoEn` client tag (prod tag bug fixed), register device on login.
- **i18next ES/EN** with language selector; complaints/harassment reporting ("Cargar Denuncias", harassment WIP); animated bottom tab menu; EAS local build + deploy configs (e2e configs, husky).
- Multiple release PRs merged for Actividades, Disable Notifications, preview images, internacionalización.

### Interview takeaway — NovaExpediente

- Took a greenfield Expo app from identity server integration to company-wide release, with push-tag infrastructure (OneSignal) across app lifecycle events and dual-language content.

---

## SwimSpot — spots &amp; events app (app + webpanel + backend)

**2021-05 → 2022-03 · React Native, Expo, TypeScript, AWS Amplify, Stripe, Mapbox/Google Places**

- App: **Stripe subscriptions** (SetupIntent confirmations, enable/disable, activity indicator), **report/block module** with reason modal + routes, notifications iOS+Android, map markers with category icons + Google Places autocomplete, search by address (OR filters), 2-step verification UI, splash + Reanimated modals (Reanimated2 Android config), SplashScreen/AppName/categories updated.
- Webpanel backend (`swimspot-webpanel-be`, 68 commits): Amplify GraphQL + **lambdas** (Stripe subscriptions, payment intent, post-confirmation → create Stripe customer, findSpots by GPS/radius, verify + set rating from reviews, enable/disable, invites &amp; events notifications, images to S3); login + React Table pagination; **TypeScript migration**.
- `splashspot` backend: image upload lambda (PUT/body parsing fixes, image URLs in responses); client site for splashspotinc.

### Interview takeaway — SwimSpot

- Serverless full-stack ownership: designed the GraphQL schema + resolver/lambda layer (Stripe, geolocation search, ratings) and wired the app's payments to it — the classic "am I frontend-only?" counterexample.

---

## GymBuddy — gym finder (app + web)

**2021-05 → 2022-07 · React Native, Expo, Amplify, Stripe, AdMob**

- Near-me gyms via `findUser` lambda, Buddies search + infinite-bubble fix, calendar + custom header, **subscriptions** (lambdas for list/update prices, payment intent secret, cancel subscription in settings, React Query key for clientSecret), in-app purchases (iOS), **AdMob banner**, Sign in with Apple + Google/Facebook OAuth, notifications, TestFlight/iOS release + App Center, Android Play Store permission fixes.

---

## Hotspotter — location-based business/chat app

**2021-05 → 2022-08 · React Native, Expo, Amplify, Google Places**

- Block/hide/report posts + chats with **sensitive content** display, Google Places autocomplete, business profile (photos, previews, delete photo, PP/TC), post confirmation flow, chat receiver, like/unlike/favorite, filters for chats and posts, In-App Purchase, user-vs-business onboarding, crash-on-Android fix (business profile), App Center + release builds (several PRs: fixes-places-block, mapsAndRating, cardDetailsForm-gerardo).

---

## Core app foundations — `core_app` / `core_fe` / `core_app_tailwind`

**2021-05 → 2021-08 · shared starter for all NovaBank apps**

- Amplify auth hooks (login/signup/forgot/code-verification), Redux boilerplate, Yup schemas + regex-based validation utils, FormInputMask/SnackBar/FormInput components, React Query + Reanimated config, GPS hook, Google Places/map screen, dashboard + navigation, Material UI Data Grid, **TypeScript migration** (incl. Tailwind variant) with husky/prettier/lint gates.

---

# 3. Solera Mobile (Jul 2018 – Apr 2019)

Frontend engineer for Solera Mobile (Peru) on consumer banking/fintech web apps — Angular 5–8, SCSS, Google Analytics/GTM. **~313 commits** across 7 repos. Also ran technical interviews (kept candidate coding repos from this period on the backup drive).

### Products

- **Financiera Super Garantía** (110) — consumer-loan charge web app
- **Telefónica Phoenix** (74) — Movistar Móvil landing
- **Financiera Home Banking** (52) — online banking (CTS, credentials)
- **PAD landing CMS** (58) — PAD program landing
- **Solera DevUX** (15) — design-system showcase site
- **Solera Jobs** (3) + **Tarjeta OH server** (1)

---

## Super Garantía — consumer loan charge flow (`financiera-supergarantia-web`)

- Built the **charge module** (first step, mobile-first) → **success/confirmation screens** with animation → full desktop responsiveness.
- **SMS OTP** charge verification (restore OTP, test-message numbers), terms &amp; conditions updates for production, analytics events, 404 page, favicon, base-route configs per environment (dev/QA/certification/production, `<base>/supergarantia/` handling) — production-ready release ceremony managed via branches `testing`/`develop`.

### Interview takeaway — Super Garantía

- Owned a full payment-flow UI (data entry → OTP → confirmation) across mobile/desktop and every environment — knowing *where* the deploy ceremony breaks is as valuable as the feature itself (this is what made me careful with env configs: `base href`, analytics, seed numbers).

---

## Telefónica Phoenix — Movistar Perú landing (`telefonica-phoenix-web`)

- New landing redesign: plans, "Button more info" per Marvel design, plan cards, **Google Tag Manager analytics** (products, data layer), contract-terms modals, SMS flow updates, **Google Maps restricted to Peru**, validation error copy, form rendering, sliders, Safari/zoom/scroll fixes.

---

## Home Banking — `financiera-homebanking-web`

- **CTS module**: "Mi CTS", retire/cancel CTS with a friendly **Word/Docx/Doc export of the statement**; send statement by email; account opening (Apertura CTS).
- **Credential recovery** ("Genera y Recupera" — fix messages, logout issues), error tracking + analytics data-layer with userID, environment service-URL config per branch (dev/QA/certification/master), file-upload validation (png/jpg/pdf, 3 MB), firefox/IE CSS fixes, QA build ceremonies.

---

## PAD landing CMS — `pad-landing-cms-web`

- Angular 7 landing with **content sections** (programs, principles, "eres una empresa") — responsive home for mobile and desktop, scrollable menus with iOS scroll-over-menu fixes, deployment rounds.

---

## Solera DevUX — `solera-devux-web`

- **DevUX v1.0.0**: login + **Login with Google**, dashboard template, public folder structure, date bug fix.

---

# 4. BitsKingdom (Mar 2018 – Apr 2020)

Freelance/remote full-stack engineer (Meteor-based shop). Built a portfolio of Meteor apps — realtime marketplaces, admin platforms, SMS/telephony systems, RN apps. **~840 commits** across 12 repos.

### Products

- **SpotAt** (121) — saver/requester geolocation marketplace
- **Drivvo** — app (142) + Expo demo (81) — car-maintenance/request app
- **White Media Admin** (166) — gaming/casino sites admin + migration tooling
- **Bee** (96) — task-management SaaS
- **Abbejor** (76) — ride/request backend + RN app
- **Roeku** (83) — school SMS platform (Twilio)
- **BDTicker** (33) — case-management tool
- **ZetaPulse BE** (21) — push-campaign service
- **Celebrities, Restto, ProfileResume** (10/5/6) — admin/demo starts

---

## SpotAt — on-demand "spots" marketplace (`spot-at`)

**2018-03 → 2018-06 · Meteor, MongoDB, Stripe, geolocation, Pushwoosh**

- Requester creates a spot; **savers get notified within X distance** (5-mile filter, pins), foreground/background location tracking saved every minute, distance measurement saver↔spot.
- **PIN verification**: generated pins + verify buttons at arrival time, retry windows (15 min after ongoing), cron messages, auto-negative rating when requester misses the spot.
- **Payments**: Stripe in sandbox → production (transactions processed and charged), cancellation charges (fee to company, 50%/75% splits), grace-time cancellations, invoice PDFs for requesters (Android download), saver bank-account data for payouts.
- **Admin payouts**: payouts dashboard, stats, weekly/monthly/custom reports (SSR), pay-all / pay-selected spotters, bank transaction IDs.
- Edge cases handled: markers on cancel/complete, timezones, contact visibility only after arrival time, recent-places errors, address mandatory.

### Interview takeaway — SpotAt

- Real-time marketplace mechanics: geolocation loops, verification PINs, and a **money-moving payout admin** — the kind of full-cycle (pay-in AND pay-out) e-commerce experience interviewers love.

---

## Drivvo — vehicle-service request app (`drivvoapp` + `drivvodemoexpo`)

**2019-06 → 2020-02 · React Native, Redux/redux-observables, redux-persist (+ encryptor), Stripe, Google Maps**

- Full client app: request flow (service request → travel request → ongoing → rating), **Stripe card token + customer creation**, payment methods list/"add payment" (calendar picker swap for Android), payments with country currency.
- Rewards pocket, favorite drivers + details, history + history detail, quote + "pay now" components, cash-payment + cancel flows (client restarts request).
- Auth/profile: register w/ country list, forgot password via backend API, profile photo (camera/gallery with permissions), side menus, terms &amp; conditions, onboarding menu-builder.
- Engineering: redux-observables for data fetching, **redux-persist with redux-encryptor** for secure token storage, log out cleanup, iOS builds for App Center, Android minSdk 20 tests, build 5 releases.
- Demo app (Expo): **design-system from Figma**, components + Jest snapshot tests (tracking UI breakage), **Detox e2e**, code-coverage + ESLint setup.

### Interview takeaway — Drivvo

- Shipped a consumer app in two tracks — production RN (payments, GPS, secure storage) and a parallel Expo demo with snapshot/e2e test discipline — an unusual level of QA structure for a freelance gig.

---

## White Media Admin — casino/gaming sites admin (`whitemediaadmin`)

**2019-04 → 2020-04 · Meteor, Mongo, WordPress interop, child_process tooling**

- Full admin CRUD platform: sites, pages, articles, categories, providers, **casinos, games** (flash detection), dashboard cards, login/forgot responsive, publications/methods, sessions for WordPress auth.
- **Site migration tooling**: migrations view + steps, mongorestore via child_process, zip/tar.gz handling, per-site logs, DDP rate limiter on db steps, game/casino/provider cleanup on reset, media upload resilience (promise races, max call stack fixes).

### Interview takeaway — White Media Admin

- Wrote infrastructure-style tooling inside a web admin (DB migration orchestration via child processes + logging) — proof that I do backend/ops work, not just screens.

---

## Bee — task-management SaaS (`bee`)

**2019-05 → 2019-06 · Meteor**

- Works/statuses with priority ordering on dashboard, tasks with filters (client-view restrictions), **team management**: invite users with roles, `teamAdmin` role for REST APIs, disable users, last-login-vs-invitation-sent display, choose-team gate.
- Mentions (highlighted), summernote work descriptions, archived-works removal, outsourced-worker rules (can't assign across works), work search by org/client name, activity timeline "completed by user", onboarding, email templates, notification-center avatar fixes.

---

## Abbejor — ride/request backend + app (`abbejor`)

**2019-07 → 2019-12 · Meteor REST API + React Native**

- Backend: custom users API (register with coordinates, update location, photo upload w/ old-photo removal), nearest-users radius queries (GET→POST), Google geocode + directions endpoints, services/meta-services by country, Stripe customer/card/token endpoints + charging on finish, requests lifecycle (accept → in-progress → finish/abort, abort reasons, driver-who-cancelled), ratings, history endpoints, SMTP/Mailgun/Jenkins-var email setup, CORS.
- App: side menu, request flows with redux state, origins/destinations, Google Maps iOS/Android, payments UI + card scanning (disabled on iOS), power-user flows (finish/ongoing), service fill from backend.

---

## Roeku — school SMS platform (`roeku-project`)

**2018-04 → 2018-05 · Meteor + Twilio**

- **Twilio number bag** (per-school unique numbers, friendly names, cron updates on school enable/disable), **credits system** (per-SMS-segment decrement, replies discount credits, savings/webhook sender+receiver), **promo codes** (150-credit extra codes), CSV student import w/ fixes, absences tracker, groups + multi-group students, message counter (per-160 segmentation), motivational push messages, email templates (teacher/school separation), superadmin stats.

---

## ZetaPulse BE — push campaign service (`zetapulsebe`)

**2019-04 → 2019-07 · Node.js backend**

- Daily/weekly **caps per notification campaigns**, `lastNotificationDate` duration checks, queries for statistics + campaign params, migration scoping fixes (referenced-scope bug), safe scope usage, build/test pipeline tweaks.

---

# 5. OINO — freelance (Aug 2019 – Apr 2020)

Freelance full-stack (Meteor stack) for startup clients — a trucking marketplace and a language-learning app, plus supporting sites. **~206 commits** across 5 repos.

### Products

- **LogiTabs** (103) — truck loads/matching marketplace (ES/EN)
- **Startuy** (61) — work/projects platform (provider + admin)
- **MaMaLingua** (31) + admin (5) + website (6) — language-learning platform

---

## LogiTabs — trucking marketplace (`logitabs`)

**2019-08 → 2020-04 · Meteor, Stripe, Mailgun, i18n ES/EN**

- Full signup funnel: role/package selection (broker/carrier/shipper), MX states/cities/zips, documents upload + admin review/reject flow, verification emails, forgot username/password via Mailgun, i18n.
- **Loads &amp; trucks**: posting with search (DH-O), separate posting/search tables, trucks-by-client, repost with 24h expiry, sounds/alarm toggles.
- **Notifications**: chron-based expiry notifications (5-min cron), renew notifications, display center, broker/carrier role split, buttons by role + report user.
- Payments: Stripe integration (fallback keys, 400-error fix), invoices, billing info, terms &amp; conditions; C-TPAT + credit-card fields.

---

## Startuy — work/projects platform (`startuy`)

**2019-09 → 2019-10 · Meteor, React + Blaze hybrid**

- Provider onboarding: register company (tokenized invite links), approve-companies workflow, provider/admin dashboards, post-project + find-works, skills/portfolio uploads via admin, terms &amp; privacy, project-detail modal, navbar/menu/footer component split, React Router inside Meteor (routes, fibers/linking fixes), API for login flows, tests.

---

## MaMaLingua — language learning (`mamalingua`, `mamalingua-admin`, `mamalingua-website`)

**2019-10 → 2020-04 · Meteor (web+mobile), Pushwoosh**

- Meteor web app with **mobile (Android) wrapper**: splash/icons, login/forgot password via accounts packages, country selection + auto-register, welcome component.
- **Admin area**: login for support users, menus (web+mobile responsive sub-menus), category images, content + dropdown + logout; admin-only app variant + Gruntfile/server folders; website connecting to admin. Push notifications with Pushwoosh; DDP package tests; PoC iterations.

---

# 6. No Office Location — OKRs (freelance, Dec 2019 – Feb 2020)

Full-stack OKR product: **Rails API + Angular 9 frontend/web**. **~68 commits** across 3 repos (`okrs-backend`, `okrs-frontend`, `okrs-web`).

- Backend (Rails): user model w/ bcrypt (has_secure_password), register + login endpoints, **JWT auth** (jsonwebtoken config, Heroku JWT fixes), **email confirmation** (URL generation + confirmation method fixed), email templates/config for prod, CORS, env-based DB config, Heroku deploy + PR-driven workflow.
- Frontend (Angular 9): lazily-loaded modules (login/signup/forgot-password), error messages surfaced from backend, route fixes, route guard to dashboard, logo/menu, production build output folder fix.
- Web (Angular): login module + router-outlet bootstrap, Netlify deployment testing.

---

# 7. Personal &amp; learning (2016 – 2026)

## gerardocordero.dev — portfolio &amp; apps (Aug 2020 – today)

**React CRA → PWA → Expo React Native monorepo. ~200+ commits (through Jul 2026).**

- Portfolio v1: landing, resumé/education/experience, styled-components → Tailwind, PWA + react-lazy, i18n, service worker.
- **Learning-by-teaching content**: TypeScript series (discriminated unions, ReturnType/infer, Zod transforms, promises/async), practice LeetCode/CodeWars exercises.
- Current monorepo (this repo): **Expo portfolio app with a Study engine** (SM-2 flashcards, daily streak), interview-prep study sites (iOS, Kotlin, Next.js, NestJS, React Native, Rails — each a Next.js 16 static export with flashcards/quiz/practice), PawWalk Academy lessons platform, Rails 8 API + Swift/Compose reference apps, CI/CD + EAS workflows, Maestro e2e flows.

## Earlier learning &amp; experiments (2016 – 2023)

- **Meteor Specialization capstone** (2016): first real project — Meteor site with contact form (SendGrid), about page, appointment booking.
- **TypeScript + React** projects (2019): `ReactTypeScriptProject`, `redux-observable-project`,(Ruby-on-Rails weekend), `gatsby-blog`, `meteor-guide-transition`, `first_flutter`, `lime`, `micard`.
- **Interview tests**: HackerRank solutions (2021), coding tests, React.js login/dashboard challenge (2023: forked + fixed yarn workspaces, React Hook Form + yup + Tailwind), iOS course apps (SwiftUI, 2022–23).

---

## Key numbers (for interviews)

- **~3,100 commits** authored across ~65 unique projects in 10 years (2016 – 2026).
- **4 companies** (Solera, NovaComp, TrueNorth/Valt) + **2 freelance clients** (OINO, OKRs/No Office Location) + long remote contract (BitsKingdom).
- Stacks spanned: **Meteor/Blaze/React, React Native/Expo, Angular 5–9, Rails, Node, TypeScript, AWS Amplify, Stripe, Twilio, PSPDFKit, Electron**, and now **Expo + Supabase + EAS**.
- Payment-adjacent experience in almost every job: Stripe charges/subscriptions/customers at BitsKingdom + NovaComp; SMS-OTP + cards at Solera; Twilio messaging + PSPDFKit documents at Valt.

