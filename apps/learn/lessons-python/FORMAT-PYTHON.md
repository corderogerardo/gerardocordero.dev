# Python lesson format

Python lessons follow the shared schema in `../lessons/FORMAT.md`. Everything there applies, plus the Python-specific rules below.

## Python-specific rules

1. **Set `lang: "python"` on the MODULE** (next to `id`/`title`) — it switches syntax
   highlighting and exercise-check normalization for every step in the module. A single
   step can override with its own `lang` field (e.g. a Swift-vs-Python comparison block).
2. **Still use `String.raw` for all code fields.** Python f-strings and `\n` escapes
   survive only inside raw templates, same as Swift.
3. **Normalization differences for `lang: "python"`** (affects your check regexes):
   - `#` comments are stripped (so starters can use `# your code here`). Don't put `#`
     inside string literals in *checked* exercises — it would eat the rest of the line.
   - `//` is NOT stripped — it's floor division in Python, safe to use in solutions.
   - Whitespace still collapses, so **indentation cannot be checked**. Write checks that
     verify constructs (`def price_label\(`, `return f"/`), never layout.
4. **The `xcode` step type is the generic "do it in the real world" checklist** (the name
   is kept for engine compatibility). Set `label: "Over to the terminal"` on Python
   checklists so the card reads right.
5. Python code must be real Python 3.12 that runs — when a lesson shows repo code, match
   the file in `apps/backend` and title the block with the real path (e.g. `app/schemas.py`).
   Flask/Django lessons build throwaway projects under `playground/` (gitignored).
