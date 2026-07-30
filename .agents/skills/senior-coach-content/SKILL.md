---
name: senior-coach-content
description: Authoring voice for ALL interview-prep and learning content in this repo (prep-kit apps, apps/learn lessons, portfolio study cards). Use whenever writing, generating, reviewing, or editing flashcards, quiz questions, practice prompts, pitches, study guides, or lessons. Encodes the "AI interview coach" style — senior framing, red flags, quotable pitches — so content teaches HOW to sound senior, not just what is true.
---

# Senior Coach Content Voice

Content in this repo has one job beyond being correct: it must teach the reader
to **answer like a senior engineer in a live interview**. A technically-correct
answer that sounds junior is a failed card. Every piece of content applies the
patterns below.

## The seven patterns

1. **Lead with the why, then the how.** Open every answer with the architectural
   impact or business consequence in one sentence, then the mechanics.
   - ❌ "Functional components use hooks; class components use lifecycle methods."
   - ✅ "Functional components replaced class components because they cut
     boilerplate and make logic reusable through hooks — which simplifies testing
     and maintenance. Mechanically: hooks replace constructor + lifecycle methods."

2. **Sharp role distinctions, not feature lists.** When two tools are commonly
   confused, state each one's *role* in one line before comparing features.
   - ✅ "Context is a dependency-injection tool, not a state manager — every
     consumer re-renders on any provider change. Zustand/Redux live outside the
     React tree and use pub-sub: selectors subscribe components to slices, so
     only affected components re-render."

3. **Quotable line.** Every flashcard/answer ends (or opens) with one sentence
   the reader can say verbatim in an interview.
   - ✅ "I use Context for low-frequency updates like theme or locale; for
     high-frequency state I use Zustand or Redux so components subscribe to
     specific slices via selectors."

4. **Red flags.** Where a common answer would hurt the candidate, name it
   explicitly with a `Red flag:` callout and say what to say instead.
   - ✅ "Red flag: saying you'd debug the release build first — ProGuard/R8
     obfuscation makes those stack traces unreadable. Start with a debug build +
     Logcat; reach for mapping files only if the crash is release-only."

5. **Numbered frameworks for process questions.** Debugging, migration, system
   design, incident response: always a numbered sequence (isolate → prove →
   fix), never a bag of tips. Frameworks are what make delivery sound systematic.
   - ✅ "1. Isolate: JS thread or UI thread? 2. Prove it: React DevTools profiler
     for re-renders, native profiler for frame drops. 3. Fix the specific
     bottleneck." (JS lag = unresponsive to taps while native animations run;
     UI lag = jank/choppy scroll while taps still register.)

6. **Trade-off pitch (3 beats) for design choices.** When defending a choice
   against a skeptic: (a) acknowledge the real cost, (b) name the concrete cost
   of the alternative — especially silent data loss / bad UX, (c) reframe the
   choice as an investment. Add the long-term-scale concern (e.g. tombstone GC
   for CRDTs) — mentioning lifecycle costs is a seniority signal.

7. **Reframe the problem up a level.** Senior answers shift the question:
   "how do I hide the wait" → "how do I remove the wait" (prefetch on the
   previous screen); "how do I review this PR" → "how do I help them ship it"
   (partnership over policing); optimistic updates are for *mutations*, staged/
   progressive loading is for *initial loads* — never mix the two.

## Style rules

- Technical vocabulary in the answer itself; analogies allowed only as a clearly
  marked aside ("informally: …") — never as the primary explanation. Coaches
  flag brain/body-style analogies as too informal for real interviews.
- People/leadership scenarios: acknowledge what works first, tie feedback to a
  benefit *for them*, offer to share the load ("let's do this together so
  tomorrow you don't have to redo it"). Never "calm down."
- Facts only — no invented benchmarks or version claims. If unsure, verify.

## Where each pattern lands per surface

**prep-kit apps** (`apps/*-prep`, types in `packages/prep-kit/src/types.ts`,
content is HTML strings):
- `Flashcard.answerHtml`: why-first opening → mechanics → **bold quotable line**.
  Add a `Red flag:` paragraph when a common wrong answer exists.
- `QuizQuestion.explanationHtml`: don't just justify the right option — say why
  the tempting wrong option is a misconception (that's where red flags live).
- `Prompt.reveal` (practice): structure reveals as the numbered framework
  (e.g. "Approach" = the framework, "Solution" = applied); design prompts end
  with the 3-beat trade-off pitch.
- `Pitch`: already the 3-beat shape — `scriptHtml` is the verbatim pitch,
  `tipsHtml` carries red flags + the seniority signal to drop.

**apps/learn lessons** (JS lesson files, validate with `node tools/validate.mjs`):
teach why-first; where a concept is interview-relevant, add a short "In an
interview, say:" note with the quotable line.

**portfolio study cards** (`apps/portfolio/src/study/content/*.ts`): plain data
with the `rich.tsx` markup (`` `code` ``, `**bold**`, `- ` bullets — **never
HTML**). Quotable line goes in `**bold**`; red flags as a `- ` bullet prefixed
`Red flag:`. Ids stay globally unique (`<subject>-<category>-N`).

## Review checklist (run on any content diff)

For each card/question/section touched: does it (1) open with why, (2) contain a
quotable line, (3) name the red flag if one exists, (4) use a numbered framework
if it's a process question, (5) avoid analogy-as-answer? If a design topic:
is the 3-beat pitch + long-term cost present?
