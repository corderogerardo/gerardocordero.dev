# Node / TypeScript addendum to the lesson format

One-page addendum to [`../lessons/FORMAT.md`](../lessons/FORMAT.md) — read that first.
Everything there (module shape, step types, pedagogy rules, the validator) applies
unchanged to `lessons-node/`. This page covers only what's different when the code is
TypeScript/JavaScript for a Node/NestJS backend.

## Every module declares `lang: "ts"`

The engine highlights and normalizes code per language. Every module in `lessons-node/`
must set `lang: "ts"` next to its `id`/`title`/`emoji` so TS keywords (`const`, `async`,
`interface`, `@Injectable`, …) highlight correctly. A single step may override with its
own `lang`.

## THE TS TRAP — template-literal backticks collide with `String.raw`

All code fields (`source`, `starter`, `solution`) are authored as `String.raw` **backtick**
templates. TypeScript's own **template literals** also use backticks
(`` `Hello ${name}` ``). A backtick anywhere in a code field **terminates the JS template
literal** and breaks the file silently — the exact same trap as Go's raw strings.

Rule: **never put a TS template literal (backtick) inside a code field.**

- In a checked `solution`/`starter`/`checks`, build strings with double quotes and `+`:
  `"Hello " + name` instead of `` `Hello ${name}` ``. `String.raw` keeps `\n` literal, so
  `"line one\n" + "line two"` works for multi-line output.
- Need to *show* real template-literal syntax? Put it in a read-only `code` step's `source`
  is still impossible (same backtick problem) — instead show it as a fenced block inside a
  `text` step's `md` (a normal string array, not `String.raw`): `` "```ts\nconst s = `Hi ${x}`\n```" ``.
  Never ask the learner to type a backtick in a checked exercise.

Grep every file before finishing — every backtick must be a `String.raw` delimiter:

```sh
grep -n '`' lessons-node/NN-name.js   # each hit is a String.raw block boundary, never inside TS code
```

## Normalization is C-style (same as Swift/Kotlin/Go)

`normalize()` for `lang: "ts"` strips `//` line comments and `/* */` block comments,
collapses whitespace, then drops spaces around punctuation. So
`async findOne(id: number): Promise<Walker> {` becomes
`async findOne(id:number):Promise<Walker>{`. Write check regexes against that shape:

- No spaces around `(`, `)`, `{`, `}`, `,`, `:`, `=`, `=>`, `<`, `>`. Between two word
  characters exactly one space survives: `async findOne`, `class WalkersService`.
- Escape regex metacharacters that appear in TS: `\(`, `\)`, `\{`, `\}`, `\[`, `\]`, `\.`,
  `\?`, `\*`, `\+`, `\|`, `\$`. An arrow function normalizes `=> {` to `=>{` — check `/=>\{/`.
- Decorators keep their `@`: `@Injectable()` → `@Injectable()`; check `/@Injectable\(\)/`.
- A generic like `Promise<Walker>` → `Promise<Walker>` (no inner spaces): check
  `/Promise<Walker>/`.
- Prefer 2–4 short checks with specific teaching hints over one giant regex.

## URLs in checked code get eaten by `//`

The normalizer strips `//` line comments, so a `"https://..."` literal inside a *checked*
`solution`/`starter`/`checks` is truncated at the `//`. Keep URL literals out of checked
exercises; show them in read-only `text`/`code` steps. (A `// your code here` marker in a
`starter` is fine — it's meant to be stripped.)

## Code must be real, running TypeScript

Every sample and solution must be real TS that compiles under NestJS 11 / Node 24 LTS and
matches how the PawWalk backend is built (`apps/pawwalk-api` is the Rails analog; this
course builds the Node/Nest equivalent). Early modules use throwaway snippets; later
modules assemble a real service layout. When a lesson shows a repo-style file, title the
block with its path (e.g. `src/walkers/walkers.service.ts`).
