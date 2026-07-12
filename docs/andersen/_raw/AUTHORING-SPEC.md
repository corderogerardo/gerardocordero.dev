# Andersen practice-deck authoring spec (read this fully before writing)

You are authoring ONE per-specialization interview flashcard deck for **PawWalk Academy**
(`apps/learn`), rendered at `/practice/<slug>`. Match the EXISTING React deck exactly in
format and voice. The React deck lives at `docs/andersen/react/` — read
`docs/andersen/react/flashcards.md` and `docs/andersen/react/react-1.md` as your reference
before writing a single line.

## Source data

Your raw seed is the Andersen knowledge matrix for your spec, saved at
`docs/andersen/_raw/<slug>.json` (or `.txt`). Each entry is `{category, skill, q, levels}`:
- `category` = the matrix skill-category (becomes a `## Category` heading in the index)
- `skill` = the matrix row (a good `### Theme` grouping)
- `q` = the "should be known" item. For question-style specs this is a real interview
  question; for **topic-style** specs (Go, Node) it is a keyword/topic — YOU phrase it into
  1–2 real senior interview questions.
- `levels` = which Andersen levels (J1..S2) expect it. Preserve these on each card.

## Target size — curate or enrich to hit it

Your prompt gives a TARGET card count. If the matrix has MORE items than the target,
**curate down** to the highest-signal senior questions (drop trivia, merge duplicates,
favor topics a senior is actually grilled on). If it has FEWER, **enrich up**: decompose
each topic into the specific senior follow-up questions an interviewer asks (the React deck
turned a 124-row matrix into 301 cards this way). Quality over hitting the number exactly;
land within ~10%.

## Files you create — all under `docs/andersen/<slug>/`

### 1. Content files: `<topic>.md` (one or more; split by category for sanity)

Each card is one `### ` section. The renderer takes everything from the `###` line to the
next `##`/`###` line as the answer. Format each exactly like the React deck:

```
### ReactDOM and render
**They ask:** "What is ReactDOM and why is it a separate package from React?"

<why-first senior answer, 1–4 short paragraphs. Include a fenced ```lang code block when it
sharpens the point. Explain the WHY and the trade-off, not just the what.>

**Say it:** "<one quotable, senior-sounding sentence the candidate can deliver out loud>"
**Red flag:** <the junior mistake / what a weak answer sounds like>
```

`**Say it:**` is required on every card. `**Red flag:**` on most. Keep answers senior:
why-first framing, trade-offs, a quotable line. This is the "AI interview coach" voice.

### 2. Index: `flashcards.md`

```
# Flashcards — <Title> (Andersen matrix, all levels)

Every matrix row as an interviewer question. Filter by level (J1→S2) and category in the deck.

## <Category>

### <Theme>

- <question> — [answer](<file>.md#<anchor>) {J1, J2, J3}
- <question> — [answer](<file>.md#<anchor>) {M1, M2}
```

Rules (the parser is strict — a mismatch throws at build time):
- Card line: `- ` + question + ` — ` (space, EM DASH `—`, space) + `[answer](FILE#ANCHOR)` +
  optional ` {levels}`. The em dash `—` is literal U+2014, not a hyphen.
- `FILE` = the content filename, no `#` or `)` in it. `ANCHOR` = the slug of the `### heading`.
- `{levels}` = comma-separated from the raw data, e.g. `{J1, J2, J3}`. If omitted, defaults S2.
- `## ` line = category. `### ` line = theme grouping (optional; may repeat the category name).

### ANCHOR must equal this slug of the heading (exact — copy this function):

```js
function githubSlug(text){ return text.toLowerCase().replace(/[^\w\s-]/g,'').replace(/\s/g,'-'); }
```

So `### Memory Model. Garbage Collector` → anchor `memory-model-garbage-collector`.
- Lowercase; strip every char that is not a word char, whitespace, or hyphen; each whitespace
  → one `-`. **Avoid double spaces in headings** (they become `--`). Keep headings ASCII.
- **Headings must be unique within a file** — a duplicate slug resolves to the wrong answer.
  If two cards need the same theme, give them distinct headings (e.g. add the sub-topic).

## Voice checklist (senior-coach)
- WHY before what. Trade-offs named. One quotable `**Say it:**` line per card.
- `**Red flag:**` names the junior tell. Code blocks where they earn their place.
- No fluff, no restating the question. Assume a smart candidate prepping for a senior loop.

## Do NOT
- Do not edit `andersen-decks.ts`, the homepage, or any file outside `docs/andersen/<slug>/`
  (the orchestrator registers your spec). Do not touch other specs' folders.
- Do not invent APIs. If unsure of a detail, keep the answer conceptual and correct rather
  than fabricating specifics.

## Definition of done
- `docs/andersen/<slug>/flashcards.md` + content file(s) exist.
- Card count is within ~10% of target. Every `[answer](file#anchor)` resolves to a real
  `### heading` whose slug matches. Every card has `**They ask:**` and `**Say it:**`.
- Report the final card count and the categories you used.
