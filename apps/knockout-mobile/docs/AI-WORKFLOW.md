# AI-first development workflow (and how it was verified)

> The job asks for "demonstrated experience utilizing AI coding tools effectively with a disciplined
> approach to validating generated code before deployment". This file is the answer: what the agent
> was allowed to do, what it was not, and what evidence exists that the output works.

---

## 1. The principle

An AI agent is a fast, confident, frequently wrong collaborator. It is excellent at volume and
recall, and unreliable about three things: whether the requirement was actually met, whether an API
exists, and whether the tests it wrote assert anything. The workflow is designed around exactly
those three weaknesses.

**The human owns:** the product decision, the acceptance criteria, and the final "ship it".
**The agent owns:** exploration, scaffolding, draft implementation, draft tests, documentation.
**Nobody owns:** the right to claim something works without a command that shows it.

---

## 2. The harness

### a. A written spec per unit, before code

Every unit starts as `S#` in `odd/tasks/knockout.md`: a scope, acceptance criteria, and the exact
command that proves it. If an agent is asked to "add sync", it will invent a sync layer that suits
the prompt. If it is asked to satisfy `S4` — with its named policies, caps, and test command — it
cannot wander.

### b. Bounded task units with declared edit surfaces

Delegated units receive an allow-list of paths. A worker that needs a file outside its surface stops
and reports rather than editing. This is the mechanism that stops an agent from "fixing" the
portfolio app while building a new one — a real failure mode, not a theoretical one.

### c. Disjoint units only, in parallel

Two units run concurrently only when their file sets do not intersect (`supabase/` vs
`packages/sync-core/`). Same-file parallelism produces conflicting writes and "modified since read"
errors; the time saved is paid back twice.

### d. Verification per unit, not per session

Each unit ends with its own command (Vitest, jest, pgTAP, `pnpm typecheck`) run by whoever wrote it.
The end of a feature is not the first time anything is executed.

### e. A separate verifier for high-risk units

Units that touch security (RLS, tokens), data loss (outbox, transactions), or released artefacts get
an independent read-only check against the spec before they are accepted. The author's own tests are
insufficient evidence for the things you cannot debug later.

### f. Read-back reconciliation

At the end, every doc is read against the code. A path that does not exist in a plan is a broken
promise to the next reader, and it is exactly the kind of error an agent makes silently.

---

## 3. What the agent is never trusted with

| Never delegated to an agent without review | Because |
| --- | --- |
| RLS policies | A permissive policy returns 200 and looks correct. |
| Migration ordering | Applied migrations are append-only history; a reorder hides data loss. |
| Secret handling | A committed token is permanent once pushed. |
| "Does this API exist?" | LLMs hallucinate library APIs confidently; check the docs. |
| Claims of passing tests | Only the command output counts. |
| Commit authorship | No AI attribution; commits are conventional and reviewed. |

---

## 4. The loop, concretely

```
spec (S#)  ──▶ agent drafts  ──▶ author runs its own command  ──▶ evidence in the log
    ▲                                        │
    └──────────── correction (bounded) ◀──────┘ if it fails
```

A failed check gets **one** correction batch, then re-check only the blockers. A loop that retries
until green teaches the agent nothing and hides the real defect: a missing or wrong spec.

---

## 5. Evidence trail

| What | Where |
| --- | --- |
| Requirements and acceptance | `odd/tasks/knockout.md` → `## Specs` |
| What was done, in order, and why | same file → `## Log` |
| Each unit's command and result | same file → `## Log`, one entry per unit |
| Design reasoning with alternatives | `docs/adr/0004`–`0008` |
| Test inventory by layer | `ARCHITECTURE.md §8`, `PLAN.md` |

An interviewer can read the log and see a plan, a correction, and a verified result — which is a
much stronger signal than a polished repository with no history.

---

## 6. The honest limits

- **Not every layer is automated.** Store submission, HubSpot against a real portal, and background
  geofencing need accounts, credentials, and a physical device. Those steps are documented and marked
  as *not run*, not quietly implied to work.
- **Maestro needs a simulator** with a development build. Its flows are committed and the command is
  documented; "not run here" is stated where true.
- **The agent wrote most of the code.** The defensible claim is not "I typed every line"; it is
  "every line has a spec, a test, and a reason, and I can explain any of them". Be ready to be asked
  exactly that.
