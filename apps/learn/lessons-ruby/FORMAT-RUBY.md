# Ruby addendum to the lesson format

This is a one-page addendum to [`../lessons/FORMAT.md`](../lessons/FORMAT.md) — read
that file first. Everything there (module shape, step types, pedagogy rules, the
validator) applies unchanged to `lessons-ruby/`. This page covers only what's
different when the code is Ruby instead of Swift.

## Every module declares `lang: "ruby"`

The engine highlights and normalizes code per language (`swift` | `python` |
`kotlin` | `ruby`), defaulting to Swift. Every module in `lessons-ruby/` must set
`lang: "ruby"` next to its `id`/`title`/`emoji` so Ruby keywords (`def`, `end`,
`unless`, …) highlight correctly. A single step can override with its own `lang`
if it ever shows another language.

## Good news: `${...}` is not a trap here

All code fields (`source`, `starter`, `solution`) still use `String.raw` backtick
templates, same as Swift. Ruby's string interpolation is `#{...}` — no `$` — so it
does **not** collide with JS template-literal syntax the way Kotlin's `${...}` does.
You don't need the Kotlin course's escape dance. Still, grep each file for a bare
`${` out of habit — a lesson that quotes JS or shell snippets alongside Ruby could
reintroduce the JS-interpolation risk:

```sh
grep -n '\${' lessons-ruby/NN-name.js
```

Any hit should be inside a deliberately-quoted non-Ruby snippet, not accidental.

## THE RUBY TRAP — bare `#` inside checked strings

`normalize()` strips comments with `/#(?!\{)[^\n]*/` — a `#` starts a comment
**unless** it's immediately followed by `{`. That means `#{name}` interpolation
survives normalization intact (good), but any OTHER bare `#` inside a string
literal is invisible to the stripper as a string boundary — it just sees a `#`
that isn't `#{` and eats the rest of the line from there, before your check
regexes ever run. For example `"dog #1"` becomes `"dog ` after stripping — the
`#1` and the closing quote are gone.

Rule: **no bare `#` inside string literals in exercise `starter`/`solution`/checked
code.** Use "number one" or "No. 1" instead of "#1", or rephrase. A `# your code
here` marker in a `starter` is fine — it's a real comment, and it's meant to be
stripped.

## URLs are safe here (opposite of Kotlin)

The Kotlin/Swift normalizer strips `//` line comments, which silently truncates
any `https://...` URL literal in checked code. Ruby's normalizer strips `#`, not
`//` — so URL literals in `solution`/`starter`/`checks` are safe to use as-is in
`lessons-ruby/`. (They're still checked against normalized-whitespace text, so
don't rely on exact spacing around them.)

## Regex checks in `checks`/`mustNot`

Same normalization pipeline as the other courses (see FORMAT.md's "How checking
works"): comments stripped per the rule above, all whitespace collapsed, then
spaces around punctuation removed. Write regexes against that normalized shape.
Ruby-specific points:

- `do |dog|` normalizes to `do|dog|` — escape the pipes in block params:
  `/do\|dog\|/`, not `/do|dog|/` (an unescaped `|` is regex alternation).
- Method-name suffixes are real characters, not decoration: `valid?` and `save!`
  keep their `?`/`!` in the normalized text. `!` needs no escaping, but `?` does:
  `/valid\?/`, not `/valid?/` (bare `?` makes the preceding token optional).
- Escape `#\{` when a check needs to match interpolation literally, e.g. a
  solution containing `"Hello #{name}!"` needs `/"Hello#\{name\}!"/` (remember
  punctuation-adjacent spaces are gone too).
- `def price_label` keeps exactly one space between the two words — the
  normalizer only removes spaces adjacent to punctuation, not between two
  word characters.
- Indentation can never be checked (Ruby's significant-whitespace conventions
  are collapsed away like every other course) — check constructs (`def\s`,
  `attr_accessor:`, `unless`), never layout.

## Checklist steps (`type: "xcode"`)

The step type is still literally the string `"xcode"` — an engine keyword
meaning "a checklist done outside the browser," not literally about Xcode. Set
`label: "Over to the terminal"` on Ruby checklists, same convention as the
Python course.

## Ruby must be real, running Ruby

Every code sample and solution must be real Ruby 3.4+ (Rails 8 where relevant)
that actually runs. Modules 09+ rebuild pieces of the real app at
`apps/pawwalk-api` — when a lesson shows repo code, read the actual file first
and match it verbatim, titling the block with the real path (e.g.
`app/models/booking.rb`). Earlier modules build throwaway snippets under
`playground/` (gitignored).
