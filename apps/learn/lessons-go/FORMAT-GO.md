# Go addendum to the lesson format

This is a one-page addendum to [`../lessons/FORMAT.md`](../lessons/FORMAT.md) — read
that file first. Everything there (module shape, step types, pedagogy rules, the
validator) applies unchanged to `lessons-go/`. This page covers only what's
different when the code is Go instead of Swift.

## Every module declares `lang: "go"`

The engine highlights and normalizes code per language (`swift` | `python` |
`kotlin` | `ruby` | `go`), defaulting to Swift. Every module in `lessons-go/` must
set `lang: "go"` next to its `id`/`title`/`emoji` so Go keywords (`func`, `range`,
`chan`, `defer`, …) highlight correctly. A single step can override with its own
`lang` if it ever shows another language.

## THE GO TRAP — raw-string backticks collide with `String.raw`

All code fields (`source`, `starter`, `solution`) use `String.raw` **backtick**
templates. Go's raw string literals *also* use backticks (`` `...` ``), and its
struct tags live inside them (`` `json:"name"` ``). A backtick anywhere in a code
field **terminates the JS template literal** and breaks the file silently.

Rule: **never put a Go raw-string literal (backtick) inside a code field.** Use
double-quoted strings instead. Two consequences:

- Multi-line raw strings → use `"line one\n" + "line two"` or a normal `"..."`
  with `\n`. `String.raw` keeps the `\n` literal in the source, which is what you
  want for a Go double-quoted string.
- **Struct tags** (`` `json:"email"` ``) can't be shown in a *checked* exercise.
  Show them in a read-only `code` step authored as a plain fenced block in a
  `text` step's `md` (which is a normal string array, not `String.raw`), or omit
  the tag from the typed portion and mention it in prose. Never ask the learner to
  type a backtick — the editor is fine with it, but you can't express the
  `solution` in a `String.raw` field to validate against.

Grep every file you write for a stray backtick inside a `String.raw` block:

```sh
grep -n '`' lessons-go/NN-name.js   # every hit must be a String.raw delimiter, never inside Go code
```

## Normalization is C-style (same as Swift/Kotlin)

`normalize()` for `lang: "go"` strips `//` line comments and `/* */` block
comments, collapses whitespace, then drops spaces around punctuation. So
`func PriceLabel(cents int) string {` becomes
`func PriceLabel(cents int)string{`. Write check regexes against that shape:

- No spaces around `(`, `)`, `{`, `}`, `,`, `:`, `=`. Between two word characters
  exactly one space survives: `func PriceLabel`, `var name`, `type Walker struct`.
- `:=` normalizes to `:=` with no surrounding spaces: `name:=` → check `/name:="/`.
- Escape regex metacharacters that appear in Go: `\(`, `\)`, `\{`, `\}`, `\[`,
  `\]`, `\.`, `\*`, `\+`, `\?`, `\|`.
- A pointer star and multiply are literal `*`; escape them: `/\*Walker/`.

## URLs in checked code get eaten by `//`

Go's normalizer strips `//` line comments — exactly like Swift/Kotlin — so a
`"https://..."` literal inside a *checked* `solution`/`starter`/`checks` is
truncated at the `//`. Keep URL literals out of checked exercises; show them in
read-only `code` or `text` steps instead. (A `// your code here` marker in a
`starter` is fine — it's meant to be stripped.)

## Regex checks in `checks`/`mustNot`

Same pipeline as every course. Go-specific points:

- `err != nil` normalizes to `err!=nil` — check `/err!=nil/`, not `/err\s*!=\s*nil/`.
- `func (w Walker) PriceLabel()` → `func(w Walker)PriceLabel()` — the receiver's
  parens collapse: check `/func\(w Walker\)PriceLabel\(\)/`.
- Method/type names keep their case: `PriceLabel`, `Walker`. Go's exported vs
  unexported convention (capital = exported) is meaningful — check the exact case.
- `map[string]int` → `map[string]int` (brackets have no inner spaces): check
  `/map\[string\]int/`.
- Indentation can never be checked (gofmt tabs collapse like every other course) —
  check constructs (`func\s`, `type\s`, `struct\{`, `range`), never layout.
- Prefer 2–4 short checks with specific teaching hints over one giant regex.

## Checklist steps (`type: "xcode"`)

The step type is still literally the string `"xcode"` — an engine keyword meaning
"a checklist done outside the browser," not literally about Xcode. Set
`label: "Over to the terminal"` on Go checklists, same convention as the Python
and Ruby courses.

## Go must be real, running Go

Every code sample and solution must be real Go 1.22+ that compiles and `go vet`s
clean. The course rebuilds a Go PawWalk backend from zero; early modules build
throwaway snippets (a `playground/` module), later modules assemble a real service
layout. When a lesson shows a repo-style file, title the block with its path (e.g.
`internal/walker/handler.go`) so the mental model of a real project builds up.
