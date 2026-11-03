# Knockout — product definition

> Field-sales software for door-to-door home-improvement canvassers. Works with no signal.
> Turns a shift of knocking into points, and points into a leaderboard.

---

## 1. Why this product exists

The target role is a senior React Native engineer on the in-house mobile team of a national
renovation contractor (roofing, windows, siding). That company's field teams knock on doors to
generate leads; their mobile app is how the lead stops living on a paper slip.

Knockout is that app, built from scratch. It was chosen because it forces every requirement of the
role to show up in real code:

| Requirement in the job description | Where Knockout proves it |
| --- | --- |
| Offline-first persistence, local caching, background sync, conflict resolution, retry/backoff | `packages/sync-core` + the SQLite outbox + the Sync screen |
| Expo, EAS, expo-router, expo-updates | `apps/knockout-mobile` (`app.config.ts`, `eas.json`, `app/`) |
| Supabase: Postgres, RLS, Realtime | `supabase/migrations/*`, pgTAP isolation tests, live leaderboard |
| HubSpot CRM integration | `supabase/functions/hubspot-sync` + the CRM outbox |
| Location, geofencing, QR, push | map screen, `expo-location` geofence, `expo-camera` QR, `expo-notifications` |
| Testing across unit / component / e2e | Vitest, jest-expo + RNTL, Maestro, pgTAP |
| Release health, crash monitoring | Sentry wrapper, sync telemetry, release runbook |
| AI-first development habits | `AI-WORKFLOW.md` — the harness, the guardrails, and how output was verified |

A to-do app or a pokédex would demonstrate the same libraries with none of the domain
credibility. This one can be described in an interview in one sentence and then defended for
forty minutes.

---

## 2. Who uses it

**Marcus — canvasser (the main user).**
22, works neighbourhoods on commission, phone in one hand, door-hanger in the other. Half the
streets he works have one bar of signal. He is paid per appointment he sets. He does not care about
databases; he cares that the app never loses a lead and that his numbers are visible.

**Dana — team lead.**
Runs eight canvassers. Needs to know by 4pm who is producing, who is sitting on leads, and which
properties are already burned (do-not-contact). She does not use the app to knock; she watches the
board and reassigns.

**Priya — ops/CRM admin.**
Owns the HubSpot portal. Leads must land in HubSpot as contacts and deals, exactly once, with the
rep and the property attached. She is the person who notices duplicates.

Non-user, but the reason the app exists: **the homeowner** — who must never be knocked twice after
asking not to be.

---

## 3. The problem, concretely

1. A canvasser knocks 60–120 doors in a shift. The useful signal is 2–8 conversations.
2. Basements, rural roads, and metal-sided houses kill connectivity for tens of minutes at a time.
3. A record lost is a lead lost, and the rep is paid on the lead.
4. Two reps can knock the same property in the same week. One rep can be reassigned mid-week.
5. Ops needs the data in the CRM, not in a spreadsheet someone retypes on Monday.
6. Nobody wants to do this job for long unless it feels like a game they are winning.

Knockout answers each one: local-first writes, an outbox that survives restarts, deterministic
conflict policies, a CRM outbox, and a scoreboard.

---

## 4. What a shift looks like

1. **Sign in.** Session is restored from secure storage even with no network.
2. **Start shift.** The app asks for location permission (foreground first, background later,
   opt-in with an explanation). Today's territory is drawn on the map.
3. **Walk the territory.** Inside the polygon the header shows *In zone*. Outside it, *Out of zone*
   — a nudge, never a block.
4. **Knock.** One tap: *No answer*, *Not interested*, *Conversation*, *Do not contact*, or
   *Appointment set*. Saved instantly to SQLite; the sync pill shows *Queued*.
5. **Set on a conversation.** The lead sheet opens: name, phone, email, one photo of the property,
   optional QR from the door hanger, appointment date. Photo stays a local file until sync.
6. **Any signal, anywhere.** The outbox drains in order. Failures back off. A conflict is shown on
   the Sync screen instead of silently overwriting someone's work.
7. **End shift.** XP and streak are recomputed by the server from raw knocks. The board updates
   on the phone of everyone on the team, live.

That is the entire product. Everything else is detail.

---

## 5. Screens

| Screen | Route | Job to be done | Offline behaviour |
| --- | --- | --- | --- |
| Sign in | `app/(auth)/sign-in.tsx` | Get in, restore session | Session restore works with no network |
| Shift | `app/(tabs)/index.tsx` | Start/end shift, see streak, XP, quick knock | Fully local |
| Map | `app/(tabs)/map.tsx` | Know where I am inside the territory, tap a property | Cached properties + last GPS fix |
| Knock sheet | `app/knock/[propertyId].tsx` | Record the outcome in one tap | Local write + outbox |
| Leads | `app/(tabs)/leads.tsx` | Find a lead, see what is unsynced | Local query only |
| Lead detail | `app/lead/[id].tsx` | Timeline, call/directions, schedule, edit | Local query + queued edits |
| Board | `app/(tabs)/board.tsx` | See my rank, badges, team board | Last cached board, marked stale |
| Settings | `app/(tabs)/settings.tsx` | Account, permissions, sync diagnostics, offline simulator | Fully local |

The **Sync screen** is a deliberate product surface, not a debug page. It is what turns "offline
first" from a claim into something a user, a support agent, and an interviewer can all see.

---

## 6. The game layer

Points are earned per outcome. They are **computed on the server** from raw knock rows; the client
never uploads a score (see ADR-0008).

| Outcome | XP | Notes |
| --- | --- | --- |
| No answer | 1 | Volume matters; not every door pays |
| Not interested | 2 | It still cost effort |
| Conversation | 5 | The real currency of the job |
| Appointment set | 25 | The thing the rep is paid for |
| Same-day appointment | +10 | Bonus for closing the loop on the spot |
| Do not contact | 0 | Never rewarded |

**Streak**: consecutive *shift days* with at least 20 knocks and one closed shift. Multiplier is
`1 + 0.1 × min(streak, 5)` — capped at 1.5× so a hot streak cannot run away with the leaderboard.

**Badges** (six, deliberately few): *First Set*, *Ten Sets*, *Five-Day Streak*, *Century* (100
knocks in a day), *Ghostbuster* (three conversations in a row after ten no-answers), *Closer*
(three sets in one day).

**Leaderboard**: daily and weekly, per team, over Supabase Realtime. Ties break by sets, then
conversations, then knocks. A manager sees the whole org; a rep sees their team.

The game is not decoration. Commission-based door-knocking has brutal attrition, and visible
competitive progress is one of the few levers a field team actually responds to. It is also the
most demo-friendly part of the app, which matters when the app is a portfolio piece.

---

## 7. Domain vocabulary (use these words in code)

| Term | Meaning |
| --- | --- |
| **Knock** | One visit to one property with one outcome. The atomic event. |
| **Outcome** | `no_answer`, `not_interested`, `conversation`, `dnc`, `set`. |
| **Set** | An appointment booked on the spot. The paid unit. |
| **Lead** | A property plus a person the company may sell to. Created by a `set` or by ops. |
| **Property** | A physical address with coordinates. Unique per address within an org. |
| **Territory** | A polygon of properties assigned to a team for a date range. |
| **DNC** | Do-not-contact. Property-level, org-scoped, permanent until lifted by a manager. |
| **Shift** | A worked block: `started_at`, optional `ended_at`, owning rep and territory. |
| **Rep** | A canvasser. `member` with role `rep`. |
| **Team lead** | `member` with role `manager`; sees the org/team aggregate. |
| **Outbox** | The ordered queue of local mutations waiting to reach the server. |
| **Mutation** | One intended server change, carrying an idempotency key. |
| **Cursor** | The server watermark the client uses to pull only what changed. |
| **Quarantine** | Mutations that failed terminally and need a human decision. |

Avoid: *visit* (means a scheduled sales appointment, not a knock), *customer* (a lead is not a
customer yet), *sync error* (say which of retryable / terminal / conflict it is).

---

## 8. Five-minute demo script (this is also the acceptance test)

1. Airplane mode **on**. Show the header pill: *Offline*.
2. Start a shift, tap *Knock* three times with different outcomes.
3. Close the app from the app switcher. Reopen. The knocks are still there and still queued.
4. Open Sync: three pending mutations, attempt counts, no errors.
5. Airplane mode **off**. Watch the queue drain in order, each row turning green.
6. Open the Board on a second device signed in as a teammate: the rank moved within a second.
7. In the Lead tab, show the HubSpot id on a lead that came from a previous sync, then in the
   HubSpot sandbox show exactly one contact and one deal for it.

Step 7 is the one that proves the CRM story. It needs a sandbox token; without one, the
`FakeHubSpot` adapter runs the same code path and the demo stays honest (see `GLOSSARY.md`,
*FakeHubSpot*).

---

## 9. Explicitly out of scope

| Not built | Why |
| --- | --- |
| Real payments / commissions | Not a mobile engineering problem, and it drags in compliance. |
| A production HubSpot portal | Requires credentials we must not commit; adapter + fake cover the contract. |
| App Store / Play submission | Documented runbook instead; submitting needs accounts and review time. |
| Web app / admin console | The role is mobile; a web console is a different hire. |
| Real-time chat between reps | Realtime is already proven by the leaderboard. |
| Full i18n | UI is English because the users are US field reps. |

---

## 10. Definition of done

- [ ] One full shift can be completed on a device with no network and reconciled afterwards.
- [ ] Restarting the app mid-queue loses nothing and duplicates nothing.
- [ ] A conflict is surfaced, resolvable, and never silently destroys the other rep's data.
- [ ] Postgres refuses cross-org reads and writes (proved by pgTAP).
- [ ] Rank cannot be forged from the client (proved by ignoring a forged field).
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm architecture:check` are green.
- [ ] A junior can read `PLAN.md` top to bottom and reproduce each step.
