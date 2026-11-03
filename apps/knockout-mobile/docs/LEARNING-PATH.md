# Learning path

> Four levels. Each one ends with a **checkpoint** you can only pass by explaining it out loud, and
> a set of questions someone will actually ask in an interview for this role.
> If you cannot answer a checkpoint, you are not done with that level — reread, do not skip.

---

## Level 0 — Get it running (half a day)

Do: `pnpm install` → `supabase start` → `supabase db reset` → build the app on a simulator → take one
knock with the network off → go online → watch it sync.

**Checkpoint.** You can point at the phone and say which of these is true: the knock is in SQLite, it
is in the outbox, it is on the server. Three different facts.

---

## Level 1 — React Native and Expo without hand-waving (1–2 weeks)

Read in this order: Expo Router's file-routing docs → TanStack Query's "Important Defaults" →
React's "You Might Not Need an Effect" → this repo's `apps/portfolio` (it is a working Expo app with
tests).

Do: add a filter to the Leads list. Then add a sixth UI primitive to `src/ui/`.

**Checkpoint.** You can explain why `useEffect` is the wrong tool for fetching, and what
`staleTime` does to a screen that is open all day on a phone with no signal.

**Questions.**
1. What re-renders when a Zustand store changes, and why is that cheaper than Context?
2. Why does this app need a *development build* instead of Expo Go?
3. Where would you put a value that must survive a reload but must not be in the DB?

---

## Level 2 — The sync engine (the core, 2–3 weeks)

Read: `packages/sync-core/src/*.ts` in the order `contract → backoff → policies → outbox → engine`,
then its tests. Then read `ARCHITECTURE.md §3–§5` again — it will read differently now.

Do: break the engine on purpose. Delete the transaction around the knock + outbox write and run the
tests. Remove `next_attempt_at` and see which test fails. Add a new outcome (`callback_requested`)
end to end: contract, policy, migration, DAO, screen.

**Checkpoint.** You can draw the state machine from memory on a whiteboard and name the failure each
transition exists to prevent.

**Questions.**
1. Why an outbox instead of calling the API from the button handler?
2. The server accepted the write but the response never arrived. What happens, and what makes it safe?
3. Two reps edit the same lead offline. Walk me through what each device sees.
4. Why is the cursor a sequence and not a timestamp?
5. When *would* you reach for WatermelonDB or a CRDT?

---

## Level 3 — The backend (2 weeks)

Read: the migrations in order, then `0009_rls.sql`, then `supabase/tests/01_rls.sql`. Then read
Supabase's RLS guide and the PostgREST docs on how policies become `using` clauses.

Do: write a failing pgTAP test first — a member of org A reading org B's knocks — then fix a policy
so it passes. Then write one for `update`.

**Checkpoint.** You can explain why the anon key is safe to ship and the service-role key is not,
without saying "it is a secret".

**Questions.**
1. Where does `auth.uid()` come from, and who signs the JWT?
2. Why is `security definer` needed for `app.is_manager()`, and what is the risk it introduces?
3. Why is scoring a database function instead of a client calculation?
4. What does Realtime actually send, and what should you do when the socket drops?

---

## Level 4 — Everything around the code (ongoing)

Read: `eas.json` and Expo's OTA docs → Sentry's RN setup → the HubSpot CRM v3 objects reference →
`docs/adr/` in this repo.

Do: add one badge to the scoring function and its pgTAP test. Add one HubSpot field to the deal
upsert. Bump the app version and describe the exact release steps you would take, without running
them.

**Checkpoint.** You can explain runtime version vs app version, and why an OTA can never ship a new
native module.

**Questions.**
1. A release crashes only on Android 13. What do you look at first, and what do you need in place to
   find out?
2. HubSpot returns 429. What does the code do, and what does it do if the 429 never stops?
3. How do you roll back an OTA in under five minutes?
4. What is the first thing you check when a rep says "my leads are not syncing"?

---

## Interview drill (30 minutes, alone)

Open `PRODUCT.md §8` and give the five-minute demo *out loud*, with no notes, to a camera. Then
answer these without looking:

1. What is the hardest bug this design prevents?
2. What is the worst thing about this design, and what would you change with a team of five?
3. Which file would you open first if sync broke in production?
4. What did you deliberately not build, and why?

The answers to 1 and 2 are the ones that separate a senior candidate from a fast typist. Answer 2
honestly: every real system has a weak joint, and naming yours is the signal.
