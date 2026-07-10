import type { Challenge } from '../challenges'

export const algorithmChallenges: Challenge[] = [
  // ─── Goncy Algorithm Exercises (101–125) ───
  {
    id: 101,
    title: 'Isograma (no repeated letters)',
    category: 'JS ES6+',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Determine if a word is an isogram — a word with no repeated letters.
Case-insensitive, accent-insensitive. Empty string returns true. Multiple words return false.`,
    starterCode: `function isIsogram(word) {
  // Your code here
  return false
}`,
    solution: `function isIsogram(word) {
  const normalized = word.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase()
  if (normalized.includes(' ')) return false
  return new Set(normalized).size === normalized.length
}`,
    explanation: `This is the canonical **uniqueness check**, and the pattern generalizes to any "are all elements distinct?" question: pour the collection into a \`Set\` and compare sizes. A \`Set\` deduplicates on insertion, so \`new Set(str).size === str.length\` is true exactly when nothing repeated. That's O(n) time and O(n) space.

The naive alternative — for each character, scan the rest of the string with \`indexOf\`/\`includes\` — is O(n²). On a single word nobody notices; the interviewer notices, because it's the same mistake that turns a list-dedup into a jank source at scale.

The Unicode step is what makes this version senior: \`normalize('NFD')\` decomposes "é" into "e" + a combining accent (U+0300–U+036F), and the regex strips the combining marks. Without it, "Murciélago" fails the check because \`é\` and \`e\` compare as different code points. Lowercasing must happen too, or "Aa" passes incorrectly.

**Red flag:** comparing characters without normalizing first — accent-insensitive comparison via \`toLowerCase()\` alone doesn't exist; that only handles case. Also watch the order: normalize, strip marks, *then* lowercase and check.

**Say it:** "A Set gives me an O(n) uniqueness check — size versus length — and NFD normalization plus stripping combining marks is how I make it accent-insensitive before comparing."`,
    tests: [
      { it: '"Murciélago" is isogram (accent-insensitive)', run: 'isIsogram("Murciélago")', expected: true },
      { it: '"Dermatoglyphics" is isogram', run: 'isIsogram("Dermatoglyphics")', expected: true },
      { it: '"repetido" is not', run: 'isIsogram("repetido")', expected: false },
      { it: 'case-insensitive: "moOse" is not', run: 'isIsogram("moOse")', expected: false },
      { it: 'empty is isogram', run: 'isIsogram("")', expected: true },
      { it: 'multi-word returns false', run: 'isIsogram("dos palabras")', expected: false },
    ],
    hints: ['NFD normalization strips accents', 'Set eliminates duplicates', 'Compare Set.size to length'],
  },
  {
    id: 102,
    title: 'Letras por números (alphabet index)',
    category: 'JS ES6+',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Replace each letter of a string with its position in the alphabet (A=1, B=2...).
Ignore spaces and non-letters. Strip accents before converting.`,
    starterCode: `function alphabetIndex(text) {
  // Your code here
  return ''
}`,
    solution: `function alphabetIndex(text) {
  const clean = text.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
  return clean
    .toLowerCase()
    .split('')
    .filter(c => c >= 'a' && c <= 'z')
    .map(c => c.charCodeAt(0) - 96)
    .join(' ')
}`,
    explanation: `This is a **character-code mapping** problem — the class of tasks where you convert between characters and numbers (Caesar ciphers, base conversions, hashing). The key fact: \`'a'.charCodeAt(0)\` is 97, so \`code - 96\` maps a–z onto 1–26. Memorize 97 (\`a\`) and 65 (\`A\`); interviewers use them as a fluency check.

The pipeline shape matters as much as the math: **normalize → filter → map → join**. Each stage does one thing, each is O(n), and the whole thing stays O(n) time, O(n) space. Filtering with the range comparison \`c >= 'a' && c <= 'z'\` (strings compare lexicographically) cleanly drops spaces, digits, and symbols after accents have been decomposed — "ñ" becomes "n" via NFD before it reaches the filter, so it converts instead of vanishing.

There's no meaningfully faster approach — the naive and optimal solutions are both linear — so the differentiator here is correctness on dirty input, not complexity.

**Red flag:** filtering *before* stripping accents. In that order "é" is rejected as a non-letter and silently disappears from the output — the classic Unicode-ordering bug. Normalization must be the first stage of the pipeline.

**Say it:** "charCodeAt minus 96 maps lowercase letters onto 1–26; I normalize accents first so filtering only ever sees plain ASCII letters."`,
    tests: [
      { it: '"abc" -> "1 2 3"', run: 'alphabetIndex("abc")', expected: '1 2 3' },
      { it: 'ignores spaces', run: 'alphabetIndex("a b")', expected: '1 2' },
      { it: 'strips accents: "ñu" -> "14 21"', run: 'alphabetIndex("ñu")', expected: '14 21' },
      { it: 'case-insensitive: "Zz" -> "26 26"', run: 'alphabetIndex("Zz")', expected: '26 26' },
      { it: 'drops digits and symbols', run: 'alphabetIndex("a1!")', expected: '1' },
      { it: 'empty string -> empty string', run: 'alphabetIndex("")', expected: '' },
    ],
    hints: ['charCodeAt("a") is 97', 'NFD normalize to strip accents', 'Filter only a-z'],
  },
  {
    id: 103,
    title: 'String ends with (no built-in)',
    category: 'JS ES5',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Given two strings, return true if the first string ends with the second.
Do NOT use String.prototype.endsWith. An empty ending returns true.`,
    starterCode: `function endsWith(str, ending) {
  // Your code here
  return false
}`,
    solution: `function endsWith(str, ending) {
  if (ending.length === 0) return true
  if (ending.length > str.length) return false
  return str.slice(-ending.length) === ending
}`,
    explanation: `"Reimplement a built-in" questions test whether you know the semantics of the method you use daily — and the edge cases the spec had to decide. The pattern: take the suffix of the right length with a **negative slice** and compare. \`str.slice(-n)\` returns the last n characters, so the whole comparison is one line. O(n) time in the ending's length, O(n) space for the slice; the naive loop comparing character-by-character from the end is the same complexity, just more code and more off-by-one surface.

Two guards do the real work. First, if the ending is longer than the string, no suffix can match — return false before slicing. Second, and this is the trap: **\`slice(-0)\` is \`slice(0)\`**, because \`-0 === 0\`. With an empty ending, \`str.slice(-ending.length)\` returns the *whole string*, not the empty string, so the comparison wrongly fails. The native \`endsWith\` returns true for an empty search string; your reimplementation must special-case it.

**Red flag:** skipping the empty-ending guard. It's the exact kind of bug that passes every test you thought of and fails the one the interviewer has ready. Reaching for a regex here is also a miss — escaping the ending correctly is harder than the problem.

**Say it:** "Negative slice gives me the suffix in one line — the guards exist because slice(-0) is slice(0) and an oversized ending can never match."`,
    tests: [
      { it: '"abc" ends with "bc"', run: 'endsWith("abc", "bc")', expected: true },
      { it: '"abc" does not end with "ab"', run: 'endsWith("abc", "ab")', expected: false },
      { it: 'full match', run: 'endsWith("abc", "abc")', expected: true },
      { it: 'empty ending returns true (slice(-0) trap)', run: 'endsWith("abc", "")', expected: true },
      { it: 'ending longer than string', run: 'endsWith("c", "abc")', expected: false },
    ],
    hints: ['String.slice with negative index', 'Check ending length first', 'slice(-0) === slice(0) — guard the empty ending'],
  },
  {
    id: 104,
    title: 'Elementos pares (even-count elements)',
    category: 'JS ES6+',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Given an array, return a new array with only elements that appear an even number of times.
Preserve the original order based on first occurrence. Include each qualifying element once.`,
    starterCode: `function evenOccurrences(arr) {
  // Your code here
  return []
}`,
    solution: `function evenOccurrences(arr) {
  const count = new Map()
  arr.forEach(x => count.set(x, (count.get(x) || 0) + 1))
  return [...new Set(arr)].filter(x => count.get(x) % 2 === 0)
}`,
    explanation: `This is the **frequency-map pattern** — the workhorse behind duplicate counting, anagram grouping, and "find the element that appears k times" questions. One pass builds a histogram (element → count), then a second pass filters by whatever predicate the question asks. Two passes, each O(n): **O(n) time, O(n) space** total.

The naive version puts \`arr.filter(y => y === x).length\` (or \`indexOf\`-style counting) *inside* a loop — an O(n²) hidden in a one-liner that reads innocently. Interviewers plant this problem specifically to see whether you count once up front or re-scan per element.

The second trick is order preservation with deduplication: \`[...new Set(arr)]\` yields each distinct element **in first-occurrence order**, because Sets iterate in insertion order. Filtering that (instead of the raw array) gives you each qualifying element exactly once without a separate "seen" check.

Why \`Map\` and not \`{}\`: a plain object stringifies its keys, so \`count[1]\` and \`count['1']\` are the same bucket, and a value like \`'constructor'\` reads an inherited function instead of \`undefined\` — \`(fn || 0) + 1\` then produces a string, not a count. \`Map\` keys by identity and has no prototype. Reaching for \`{}\` here is the reflex; knowing the two ways it corrupts a histogram is the senior signal. (If you do want an object, \`Object.create(null)\` kills the prototype half of the problem.)

**Red flag:** \`filter\` + \`includes\`/\`indexOf\` inside the callback — O(n²) dressed up as idiomatic code. Also returning duplicates ([2,2] instead of [2]) by filtering the original array instead of the deduplicated one.

**Say it:** "I build a frequency map in one O(n) pass with a Map — object keys would coerce 1 and '1' into one bucket — then filter the Set of the array, which keeps insertion order so I get first-occurrence order and dedup for free."`,
    tests: [
      { it: '[1,2,2,3,3] -> [2,3]', run: 'evenOccurrences([1,2,2,3,3])', expected: [2, 3] },
      { it: '[1,1,2,2,2] -> [1]', run: 'evenOccurrences([1,1,2,2,2])', expected: [1] },
      { it: 'four occurrences count as even', run: 'evenOccurrences([5,5,5,5])', expected: [5] },
      { it: 'single element -> []', run: 'evenOccurrences([7])', expected: [] },
      { it: 'empty array -> []', run: 'evenOccurrences([])', expected: [] },
      { it: 'order follows first occurrence', run: 'evenOccurrences([3,1,1,3,2,2])', expected: [3, 1, 2] },
      { it: 'number 1 and string "1" are different values', run: 'evenOccurrences([1,"1",1])', expected: [1] },
    ],
    hints: ['Count occurrences first — a Map, so 1 and "1" stay distinct', 'Filter by even count', 'Use Set to deduplicate for order'],
  },
  {
    id: 105,
    title: 'Transformador (restructure object)',
    category: 'JS ES6+',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Transform { nombres: ["Ana","Bob"], edades: [25,30] } into
[{ id: 1, nombre: "Ana", edad: 25 }, { id: 2, nombre: "Bob", edad: 30 }]`,
    starterCode: `function transform(data) {
  // Your code here
  return []
}`,
    solution: `function transform(data) {
  return data.nombres.map((nombre, i) => ({
    id: i + 1,
    nombre,
    edad: data.edades[i],
  }))
}`,
    explanation: `This is a **zip** — combining parallel arrays into an array of records by shared index. It's the shape of half of real-world data plumbing: an API returns columnar data, the UI wants rows. The idiom is \`map\` with its second argument (the index) used to reach into the sibling array: \`data.edades[i]\`. One pass, **O(n) time, O(n) space**, and there's no asymptotically better option — the value of this question is idiom fluency, not complexity.

Details interviewers watch for:
- **\`map\` over an imperative loop with \`push\`** — both are O(n), but \`map\` states intent ("same length out as in") and produces the new array without mutation ceremony.
- **Arrow returning an object literal needs parentheses**: \`i => ({ ... })\`. Without them the braces parse as a function body and you silently return \`undefined\` for every element — a syntax trap that has burned everyone once.
- **Shorthand property** \`nombre\` instead of \`nombre: nombre\` — small, but it signals ES6 fluency, which is what this category probes.

Mention the contract question out loud: what if the arrays have different lengths? Here \`edades[i]\` would be \`undefined\`; in production you'd validate or zip to the shorter length.

**Red flag:** forgetting the parentheses around the returned object literal, or building the result with an index-mutating \`for\` loop and \`result[i] =\` when \`map\` is the direct expression of the transformation.

**Say it:** "It's a zip: map over one array and index into the other — with the arrow body wrapped in parentheses so the object literal isn't parsed as a block."`,
    tests: [
      { it: 'transforms two rows', run: 'transform({nombres:["A","B"],edades:[1,2]})', expected: [{ id: 1, nombre: 'A', edad: 1 }, { id: 2, nombre: 'B', edad: 2 }] },
      { it: 'ids start at 1', run: 'transform({nombres:["Ana"],edades:[25]})[0].id', expected: 1 },
      { it: 'pairs by index', run: 'transform({nombres:["Ana","Bob"],edades:[25,30]})[1].edad', expected: 30 },
      { it: 'empty input -> []', run: 'transform({nombres:[],edades:[]})', expected: [] },
      { it: 'result length matches input', run: 'transform({nombres:["a","b","c"],edades:[1,2,3]}).length', expected: 3 },
    ],
    hints: ['map over nombres with index', 'Access edades[i] by same index', 'Arrow returning object literal needs ({ ... })'],
  },
  {
    id: 106,
    title: 'Ceros al final (move zeros)',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Move all zeros in an array to the end while preserving the order of other elements.
Return a new array; do not mutate the input.`,
    starterCode: `function moveZeros(arr) {
  // Your code here
  return arr
}`,
    solution: `function moveZeros(arr) {
  return arr.filter(x => x !== 0).concat(arr.filter(x => x === 0))
}`,
    explanation: `This is a **stable partition**: split elements into two groups by a predicate while preserving relative order within each group. The two-filter idiom — non-zeros concatenated with zeros — expresses that directly. Two passes over the array plus a concat: **O(n) time, O(n) space**, no mutation of the input.

The naive approach interviewers are fishing for is \`splice\` inside a loop: find a zero, remove it, push it to the end. That's O(n²) — every \`splice\` shifts the remaining elements — *and* it mutates the array you're iterating, which skips elements when two zeros are adjacent. It's a two-bug answer.

The in-place alternative worth naming is the **two-pointer write-index** technique from LeetCode's "Move Zeroes": walk the array, write each non-zero at a write pointer, then fill the tail with zeros. That's O(n) time, O(1) extra space — better if mutation is allowed. The filter version trades a little memory for immutability and readability; in React-adjacent code, returning a new array is usually the *requirement*, not a cost.

One strictness note: filter with \`x !== 0\` — a truthiness check like \`filter(Boolean)\` would also evict \`false\`, \`''\`, and \`null\`.

**Red flag:** \`splice\` while iterating — O(n²) plus index-skipping — or a truthiness filter that deletes falsy non-zeros.

**Say it:** "It's a stable partition: two filters and a concat, O(n) and immutable — and if in-place O(1) space were required, I'd switch to a write-pointer sweep."`,
    tests: [
      { it: '[0,1,0,3,12] -> [1,3,12,0,0]', run: 'moveZeros([0,1,0,3,12])', expected: [1, 3, 12, 0, 0] },
      { it: 'all zeros stay', run: 'moveZeros([0,0])', expected: [0, 0] },
      { it: 'no zeros: unchanged order', run: 'moveZeros([1,2,3])', expected: [1, 2, 3] },
      { it: 'empty array', run: 'moveZeros([])', expected: [] },
      { it: 'does not mutate input', run: '(() => { const a = [0, 1]; moveZeros(a); return a[0] })()', expected: 0 },
      { it: 'adjacent zeros handled', run: 'moveZeros([1,0,0,2])', expected: [1, 2, 0, 0] },
    ],
    hints: ['filter non-zeros then concat zeros', 'Two filter passes', 'No splice needed'],
  },
  {
    id: 107,
    title: 'Validar paréntesis (balanced)',
    category: 'JS ES6+',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Given a string of parentheses (){}[], determine if the order is valid (balanced).
Every opening bracket must have a matching closing bracket in the correct order.`,
    starterCode: `function isValidBrackets(str) {
  // Your code here
  return false
}`,
    solution: `function isValidBrackets(str) {
  const pairs = { ')': '(', '}': '{', ']': '[' }
  const stack = []
  for (const c of str) {
    if ('([{'.includes(c)) stack.push(c)
    else if (pairs[c] !== stack.pop()) return false
  }
  return stack.length === 0
}`,
    explanation: `This is *the* introductory **stack** problem, and the pattern matters far beyond brackets: any "most recent open thing must close first" structure — nested tags, expression parsers, editor undo scopes — is LIFO, and a stack is its data structure. Push every opener; on a closer, pop and demand it matches. **O(n) time, O(n) space** worst case (all openers).

Why counting fails: tracking three counters catches \`"(()"\` but not \`"([)]"\` — counts balance while *nesting order* is wrong. Order is exactly what the stack encodes and counters throw away. That's the trap the interviewer sets with the \`"([)]"\` test.

Two ends of the string carry their own bugs:
- **Closer on an empty stack**: \`stack.pop()\` returns \`undefined\`, which fails the \`pairs[c] !== ...\` comparison — so \`"]"\` correctly returns false with no explicit emptiness check. Know *why* that works; it looks accidental otherwise.
- **Leftover openers**: \`"((("\` survives the loop, so the final answer must be \`stack.length === 0\`, not \`true\`.

The \`pairs\` map (closer → opener) keeps the loop to one comparison instead of a three-way conditional.

**Red flag:** returning \`true\` after the loop without checking the stack is empty — unclosed openers pass silently. Counter-based solutions are the deeper miss: they don't model nesting at all.

**Say it:** "Brackets are LIFO, so I push openers and pop on closers — mismatch or a non-empty stack at the end means invalid, all in O(n)."`,
    tests: [
      { it: '"()" is valid', run: 'isValidBrackets("()")', expected: true },
      { it: '"([])" is valid', run: 'isValidBrackets("([])")', expected: true },
      { it: '"([)]" is invalid (order matters)', run: 'isValidBrackets("([)]")', expected: false },
      { it: 'empty string is valid', run: 'isValidBrackets("")', expected: true },
      { it: 'unclosed openers fail', run: 'isValidBrackets("(((")', expected: false },
      { it: 'closer with empty stack fails', run: 'isValidBrackets("]")', expected: false },
    ],
    hints: ['Stack data structure (push/pop)', 'Map closing to opening brackets', 'Stack must be empty at end'],
  },
  {
    id: 108,
    title: 'Encontrar al impar (odd count)',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Given an array of signed 32-bit integers (−2³¹ … 2³¹−1), find the one that
appears an odd number of times. There will always be exactly one such number.

The range is part of the contract: the intended O(1)-space answer relies on JavaScript's
bitwise operators, which coerce to signed 32-bit. Say so in your answer.`,
    starterCode: `function findOdd(arr) {
  // Your code here
  return 0
}`,
    solution: `function findOdd(arr) {
  return arr.reduce((acc, n) => acc ^ n, 0)
}`,
    explanation: `This is the **XOR trick**, the classic "find the single one" bit-manipulation pattern. It works because XOR has three properties: \`n ^ n === 0\` (a value cancels itself), \`n ^ 0 === n\` (zero is the identity), and it's commutative/associative (order doesn't matter). XOR-ing the whole array makes every even-count value cancel out in pairs, leaving only the odd-count survivor. **O(n) time, O(1) space** — a single \`reduce\` with no allocations.

The honest alternatives are worth naming, because they're what most candidates reach for:
- **Frequency map** then find the odd count: O(n) time but O(n) space, two passes. Correct, and *more general* — it works when there are multiple odd-count values.
- **Nested count per element** (\`filter(...).length\` inside a loop): O(n²). The usual trap.

So XOR is the only O(1)-space answer, but it leans hard on the problem's guarantee of *exactly one* odd-count number. If two values appeared an odd number of times, XOR would return their combined bits — garbage. Stating that precondition is what separates "memorized the trick" from "understands it". It also works fine with negative numbers, since XOR operates on two's-complement bit patterns.

The second precondition is the one candidates miss: **JavaScript's bitwise operators coerce both operands to signed 32-bit integers.** \`^\` on anything outside ±2³¹ silently truncates, so \`findOdd\` returns a wrong number rather than throwing — and it can't handle non-integers at all. In a language with real 64-bit ints the trick is unconditional; in JS it carries a range contract. Name that contract, or fall back to the frequency map, which has none.

**Red flag:** using the XOR trick without saying why it works or when it breaks — an interviewer will immediately ask "what if there are two odd ones?" Also the O(n²) count-inside-loop if you skip the trick entirely.

**Say it:** "XOR cancels pairs — n^n is 0 and 0 is the identity — so folding the array leaves the odd-count element in O(n) time and O(1) space. Two preconditions: exactly one odd-count value, and the values fit in signed 32 bits, because that's what JS bitwise operators coerce to."`,
    tests: [
      { it: '[1,1,2] -> 2', run: 'findOdd([1,1,2])', expected: 2 },
      { it: '[4,3,4,3,5] -> 5', run: 'findOdd([4,3,4,3,5])', expected: 5 },
      { it: 'single element is its own answer', run: 'findOdd([7])', expected: 7 },
      { it: 'works with negatives', run: 'findOdd([-1,-1,-2])', expected: -2 },
      { it: 'value appearing 5 times', run: 'findOdd([1,1,1,1,1])', expected: 1 },
      { it: 'pairs across the array cancel', run: 'findOdd([10,20,10,30,20])', expected: 30 },
    ],
    hints: ['XOR (^) cancels pairs', 'n ^ n = 0, n ^ 0 = n', 'reduce with XOR'],
  },
  {
    id: 109,
    title: 'Gira sarbalap (reverse long words)',
    category: 'JS ES6+',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Reverse all words of 5+ letters in a string. Keep shorter words and spaces intact.`,
    starterCode: `function spinWords(str) {
  // Your code here
  return ''
}`,
    solution: `function spinWords(str) {
  return str.split(' ').map(w => w.length >= 5 ? w.split('').reverse().join('') : w).join(' ')
}`,
    explanation: `This is the **split → map → join** pipeline, the standard shape for any per-word (or per-token) string transformation. JavaScript strings are immutable, so "modify some words" really means "tokenize, transform tokens, reassemble". Each stage is O(n) over the total character count, so the whole thing is **O(n) time, O(n) space** — and since immutability forces allocation anyway, there's no cheaper approach to aim for; the question is about clean decomposition.

The idiom worth having at your fingertips is string reversal itself: \`w.split('').reverse().join('')\`, because strings have no \`.reverse()\` of their own. The conditional inside \`map\` — transform if \`length >= 5\`, else pass through unchanged — is the "selective map" pattern: map over *everything*, decide per element, never filter (filtering would drop the short words and lose positions).

Boundary detail: \`split(' ')\` splits on single spaces, which preserves word count for normal sentences; \`''.split(' ')\` gives \`['']\`, and the empty "word" passes through untouched, so the empty string round-trips correctly. If the input could have multiple consecutive spaces, you'd need \`split(/(\\s+)/)\` to preserve the exact whitespace — worth mentioning as a scope boundary.

**Red flag:** \`>\` instead of \`>=\` — the off-by-one that leaves exactly-5-letter words ("world") unreversed. Boundary conditions on "5 or more" phrasing are precisely what the hidden test checks. Also \`split('').reverse().join('')\` breaks on emoji/surrogate pairs — fine here, worth knowing.

**Say it:** "Split, map with a length condition, join — the selective-map pattern — and I use >= 5 because 'five or more' includes five."`,
    tests: [
      { it: '"Hey fellow warriors" -> "Hey wollef sroirraw"', run: 'spinWords("Hey fellow warriors")', expected: 'Hey wollef sroirraw' },
      { it: '"This is a test" stays same', run: 'spinWords("This is a test")', expected: 'This is a test' },
      { it: 'exactly 5 letters reverses (>= boundary)', run: 'spinWords("world")', expected: 'dlrow' },
      { it: 'single long word', run: 'spinWords("Welcome")', expected: 'emocleW' },
      { it: 'empty string', run: 'spinWords("")', expected: '' },
    ],
    hints: ['Split by spaces', 'Map each word', 'Reverse if length >= 5 — not > 5'],
  },
  {
    id: 110,
    title: 'Marquesina (marquee rotation)',
    category: 'JS ES6+',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Create a marquee effect: given a string, return an array with each rotation
where the first letter moves to the end. Example: "abc" -> ["abc","bca","cab"]`,
    starterCode: `function marquee(str) {
  // Your code here
  return []
}`,
    solution: `function marquee(str) {
  return str.split('').map((_, i) => str.slice(i) + str.slice(0, i))
}`,
    explanation: `This is **string rotation**, and the core insight is that a rotation by i is just two slices swapped: \`str.slice(i) + str.slice(0, i)\`. Once you see that, "all rotations" is a map over the indices 0..n-1. No mutation, no character shuffling — each rotation is computed independently from the original string.

Complexity: n rotations, each built from O(n) slices → **O(n²) time and space**, which is optimal because the *output itself* is n strings of length n. When the output is inherently quadratic, say so — it preempts the "can you do better?" question with "not asymptotically; the answer is that big."

The naive alternative interviewers see: repeatedly doing \`s = s.slice(1) + s[0]\` and pushing each step. Also O(n²) and it works, but it's stateful — each rotation depends on the previous one, so an off-by-one anywhere corrupts everything after it. The slice-from-index version is a pure function of \`(str, i)\`: easier to test, trivially parallel, no accumulated error. That's the same argument as derived state over mutated state in UI code.

Note the \`map\` over \`split('')\` is used purely for its index — the \`_\` parameter name signals "value unused" deliberately. \`Array.from({length: str.length}, (_, i) => ...)\` is the equivalent without the throwaway split.

**Red flag:** an off-by-one in the slice boundaries — \`slice(i) + slice(0, i)\` must partition the string exactly; overlapping or gapping the two slices duplicates or drops a character. Test with "abc" by hand before running.

**Say it:** "Each rotation is slice(i) plus slice(0, i) — a pure function of the index — and the O(n²) is irreducible because the output is n strings of length n."`,
    tests: [
      { it: '"abc" -> ["abc","bca","cab"]', run: 'marquee("abc")', expected: ['abc', 'bca', 'cab'] },
      { it: 'length matches input', run: 'marquee("hello").length', expected: 5 },
      { it: 'first rotation is the original', run: 'marquee("hola")[0]', expected: 'hola' },
      { it: 'single char', run: 'marquee("a")', expected: ['a'] },
      { it: 'empty string -> []', run: 'marquee("")', expected: [] },
      { it: 'two chars swap', run: 'marquee("ab")', expected: ['ab', 'ba'] },
    ],
    hints: ['slice(i) + slice(0,i) for each position', 'map over each character index'],
  },
  {
    id: 111,
    title: 'Ordenar emociones (sort emoticons)',
    category: 'JS ES6+',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Sort an array of emotion emoticons in ascending (happy first) or descending (sad first) order.
Order: :D (happiest), :), :|, :(, T_T (saddest). Do not mutate the input array.`,
    starterCode: `function sortEmotions(emotions, order) {
  const rank = { ':D': 0, ':)': 1, ':|': 2, ':(' : 3, 'T_T': 4 }
  // Your code here
  return []
}`,
    solution: `function sortEmotions(emotions, order) {
  const rank = { ':D': 0, ':)': 1, ':|': 2, ':(': 3, 'T_T': 4 }
  return [...emotions].sort((a, b) => order === 'asc' ? rank[a] - rank[b] : rank[b] - rank[a])
}`,
    explanation: `This is **sorting by custom key** — the pattern for any domain where order isn't alphabetical or numeric: priority levels, T-shirt sizes, status pipelines. The move is a **rank lookup table** mapping each value to a number, then a comparator that subtracts ranks. Direction flips by swapping the operands: \`rank[a] - rank[b]\` ascending, \`rank[b] - rank[a]\` descending — no second sort, no \`.reverse()\` needed.

Complexity is the sort's: **O(n log n)** time; the naive "for each rank bucket, filter the array" approach is O(n·k) and rebuilds order by scanning per category — workable for 5 ranks, but it hardcodes the categories into control flow instead of data. The lookup table keeps the ordering *declarative*: add a new emotion, touch one line.

Two JS specifics carry the senior signal:
- **\`sort\` mutates.** \`[...emotions].sort(...)\` copies first. Sorting props or state in place is a real React bug class — mutated props break memoization and re-render assumptions. (ES2023 adds \`toSorted()\` for exactly this.)
- **The comparator contract** is negative/zero/positive, not boolean. \`(a, b) => rank[a] > rank[b]\` returns booleans that coerce to 1/0 — no negative case, so the sort is unstable garbage on some engines.

**Red flag:** sorting the input in place, or a boolean comparator. Both pass casual testing and fail in production — the exact category of bug this question exists to surface.

**Say it:** "I map values to ranks in a lookup table and subtract in the comparator — copying first because sort mutates, and flipping operands for direction instead of reversing."`,
    tests: [
      { it: 'asc sorts happy first', run: 'sortEmotions([":(",":D",":|",":)",":D"], "asc")', expected: [':D', ':D', ':)', ':|', ':('] },
      { it: 'desc sorts sad first', run: 'sortEmotions([":)",":D","T_T"], "desc")', expected: ['T_T', ':)', ':D'] },
      { it: 'empty array', run: 'sortEmotions([], "asc")', expected: [] },
      { it: 'does not mutate input', run: '(() => { const input = [":(", ":D"]; sortEmotions(input, "asc"); return input[0] })()', expected: ':(' },
      { it: 'single element', run: 'sortEmotions([":|"], "desc")', expected: [':|'] },
    ],
    hints: ['Map emoticon to rank number', 'Sort by rank asc or desc', 'Copy array to avoid mutation — sort mutates'],
  },
  {
    id: 112,
    title: 'Contar duplicados (count dupes)',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Count distinct case-insensitive alphanumeric characters that appear more than once in a string.
Non-alphanumeric characters are ignored.`,
    starterCode: `function duplicateCount(str) {
  // Your code here
  return 0
}`,
    solution: `function duplicateCount(str) {
  const lower = str.toLowerCase().replace(/[^a-z0-9]/g, '')
  const count = {}
  for (const c of lower) count[c] = (count[c] || 0) + 1
  return Object.values(count).filter(n => n > 1).length
}`,
    explanation: `Another **frequency-map** problem, with a twist in what gets counted: not occurrences, but *distinct characters whose occurrence count exceeds one*. That distinction — "how many characters repeat" vs "how many repetitions" — is the reading-comprehension trap; "aaa" contributes 1, not 2 or 3.

The shape: normalize (lowercase + strip non-alphanumerics with \`/[^a-z0-9]/g\`), build the histogram in one pass, then count values \`> 1\` via \`Object.values\`. **O(n) time, O(k) space** where k is alphabet size — effectively O(1) space for ASCII input, since the map can't exceed 36 keys.

The naive alternative is the by-now-familiar O(n²): for each character, count its occurrences with a nested scan, plus bookkeeping to avoid double-counting the same character. The histogram does both jobs — counting and dedup — in one structure, because each distinct character is exactly one key.

Normalization order matters less here than in the isogram (lowercase and strip commute), but doing both *before* counting keeps the counting loop dumb, which is the point: push all input-cleaning to the edges, keep the algorithm core trivial. Same principle as validating at the API boundary instead of inside business logic.

**Red flag:** returning total surplus occurrences ("aaa" → 2) instead of distinct repeated characters ("aaa" → 1) — re-read the prompt before coding. Also forgetting case-folding, so "Aa" reports 0.

**Say it:** "One histogram pass after normalizing, then I count keys with a value above one — distinct repeated characters, not repetitions, which is the trap in the wording."`,
    tests: [
      { it: '"aabbc" -> 2 (a,b)', run: 'duplicateCount("aabbc")', expected: 2 },
      { it: '"abcde" -> 0', run: 'duplicateCount("abcde")', expected: 0 },
      { it: 'case insensitive: "Aa" -> 1', run: 'duplicateCount("Aa")', expected: 1 },
      { it: 'triple counts once: "indivisibility" -> 1', run: 'duplicateCount("indivisibility")', expected: 1 },
      { it: 'digits count too: "aA11" -> 2', run: 'duplicateCount("aA11")', expected: 2 },
      { it: 'empty string -> 0', run: 'duplicateCount("")', expected: 0 },
    ],
    hints: ['Lowercase everything', 'Count with object/map', 'Count DISTINCT characters with count > 1'],
  },
  {
    id: 113,
    title: 'Contar lenguajes (count languages)',
    category: 'JS ES6+',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Given an array of developer objects { name, language }, count how many developers
use each language. Return an object { language: count }.`,
    starterCode: `function countLanguages(devs) {
  // Your code here
  return {}
}`,
    solution: `function countLanguages(devs) {
  const counts = Object.create(null)
  devs.forEach(d => { counts[d.language] = (counts[d.language] || 0) + 1 })
  return counts
}`,
    explanation: `This is **group-and-count** — the frequency map applied to a field of objects instead of raw values. It's the in-memory equivalent of SQL's \`GROUP BY language, COUNT(*)\`, and naming that equivalence in an interview lands well because it shows you recognize the operation, not just the code. One pass, **O(n) time, O(k) space** for k distinct languages.

The idiomatic core is \`(counts[key] || 0) + 1\`: initialize-or-increment in one expression. The \`|| 0\` handles the first sighting of a key, where the lookup is \`undefined\` and \`undefined + 1\` would be \`NaN\` — a bug that then silently propagates because \`NaN + 1\` is still \`NaN\`. Modern spelling is \`(counts[key] ?? 0) + 1\`; for counting they're equivalent since 0 is only reachable as a real value if you put it there.

The naive alternative: collect unique languages first, then \`filter().length\` per language — O(n·k), plus two data structures. \`reduce\` into an object is the common one-expression variant; \`forEach\` with a mutation-local accumulator reads just as clearly and the mutation never escapes the function, which is the actual immutability boundary that matters.

The accumulator is \`Object.create(null)\`, not \`{}\`, and that is not pedantry: \`{}\` inherits from \`Object.prototype\`, so a developer whose language is \`"constructor"\` makes \`counts["constructor"]\` return an inherited *function*. It's truthy, \`|| 0\` never fires, and \`fn + 1\` yields a string — the count silently becomes garbage. Any accumulator keyed by untrusted input wants a null prototype. What you return is a dictionary-shaped object: property access and \`Object.keys\` work exactly as before, but it has *no* inherited methods — no \`hasOwnProperty\`, no \`toString\` — which is the whole point, since those are what a key like \`"constructor"\` was colliding with.

Scaling note: for non-string keys or huge cardinality, \`Map\` beats an object entirely — keys keep their type and there's no prototype to dodge. Worth one sentence out loud.

**Red flag:** \`counts[d.language]++\` without initialization — \`undefined++\` is \`NaN\`, and every subsequent increment keeps it \`NaN\`. The \`|| 0\` isn't decoration; it's the algorithm.

**Say it:** "It's GROUP BY COUNT in one pass — initialize-or-increment with (counts[key] ?? 0) + 1, over a null-prototype object so a key like 'constructor' can't inherit a function and poison the count."`,
    tests: [
      { it: 'counts correctly', run: 'countLanguages([{name:"A",language:"JS"},{name:"B",language:"JS"},{name:"C",language:"TS"}])', expected: { JS: 2, TS: 1 } },
      { it: 'empty input -> {}', run: 'countLanguages([])', expected: {} },
      { it: 'single dev', run: 'countLanguages([{name:"A",language:"Rust"}])', expected: { Rust: 1 } },
      { it: 'all same language', run: 'countLanguages([{name:"A",language:"Go"},{name:"B",language:"Go"}]).Go', expected: 2 },
      { it: 'three languages', run: 'Object.keys(countLanguages([{name:"A",language:"JS"},{name:"B",language:"TS"},{name:"C",language:"Go"}])).length', expected: 3 },
      { it: 'a prototype key like "constructor" counts as 1, not a function', run: 'countLanguages([{name:"A",language:"constructor"}]).constructor', expected: 1 },
    ],
    hints: ['forEach over devs', 'Increment count per language', 'Use ||0 for missing keys — undefined++ is NaN', 'Object.create(null) — an inherited "constructor" would break ||0'],
  },
  {
    id: 114,
    title: 'Encontrar al aislado (find outlier)',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Find the one outlier in an array where all numbers are even or all are odd except one.
Return the outlier. The array may contain negative numbers.`,
    starterCode: `function findOutlier(arr) {
  // Your code here
  return 0
}`,
    solution: `function findOutlier(arr) {
  const evens = arr.filter(n => n % 2 === 0)
  const odds = arr.filter(n => n % 2 !== 0)
  return evens.length === 1 ? evens[0] : odds[0]
}`,
    explanation: `This is a **partition-by-predicate** problem: split the array by parity, and whichever side has exactly one element holds the outlier. Two filters and a length check — **O(n) time, O(n) space**, direct and hard to get wrong.

The optimization conversation is what earns points here. You don't need to scan the whole array to know the majority parity: **the first three elements decide it** — at most one of them is the outlier, so at least two share the majority parity. With that, a short-circuiting \`find\` for the minority parity gives O(n) time, O(1) space, with early exit. Offering that refinement *after* the simple version shows judgment: write the clear one, then improve if the interviewer cares.

The actual trap is **negative numbers and \`%\`**. In JavaScript, \`%\` is a remainder that takes the sign of the dividend: \`-3 % 2\` is \`-1\`, not \`1\`. So the check \`n % 2 === 1\` silently misclassifies every negative odd number. The safe forms are \`n % 2 !== 0\` for odd (as here), \`n % 2 === 0\` for even, or \`Math.abs(n) % 2\`. This single operator detail is why the prompt mentions negatives.

**Red flag:** \`n % 2 === 1\` as the odd test — it returns false for -3, and the bug only appears with negative input, i.e., exactly the test case you didn't write. Say the remainder-vs-modulo distinction out loud.

**Say it:** "I partition by parity and return the singleton side — testing odd as n % 2 !== 0, because JS remainder is negative for negative dividends, so === 1 breaks on negatives."`,
    tests: [
      { it: 'odd one out', run: 'findOutlier([2,4,0,100,4,11,2602,36])', expected: 11 },
      { it: 'even one out', run: 'findOutlier([1,3,5,7,9,2])', expected: 2 },
      { it: 'negative outlier', run: 'findOutlier([2,4,-7,8])', expected: -7 },
      { it: 'negative odds majority (n % 2 trap)', run: 'findOutlier([-3,-5,160,-7])', expected: 160 },
      { it: 'minimal 3-element case', run: 'findOutlier([2,4,7])', expected: 7 },
    ],
    hints: ['Filter evens and odds separately', 'The group with 1 element is the outlier', 'n % 2 === 1 fails for negatives — use !== 0'],
  },
  {
    id: 115,
    title: 'LIS (longest increasing subsequence)',
    category: 'JS ES5',
    difficulty: 'hard',
    timeEstimate: '15 min',
    prompt: `Find the length of the longest strictly increasing subsequence in an array of integers.
A subsequence keeps relative order but need not be contiguous. Empty array returns 0.`,
    starterCode: `function lisLength(arr) {
  // Your code here
  return 0
}`,
    solution: `function lisLength(arr) {
  const dp = Array(arr.length).fill(1)
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i]) dp[i] = Math.max(dp[i], dp[j] + 1)
    }
  }
  return Math.max(...dp, 0)
}`,
    explanation: `LIS is the gateway **dynamic programming** problem: the answer for the whole array is built from answers to overlapping subproblems. The formulation is the part to memorize — \`dp[i]\` = *length of the longest increasing subsequence that ends exactly at index i*. Then for each i, look back at every j < i: if \`arr[j] < arr[i]\`, the subsequence ending at j can be extended by \`arr[i]\`, so \`dp[i] = max(dp[i], dp[j] + 1)\`. Every element alone is a subsequence of length 1, hence the \`fill(1)\`. The final answer is the max over all of \`dp\`, **not** \`dp[dp.length - 1]\` — the best subsequence can end anywhere.

Complexity: **O(n²) time, O(n) space**. The brute force — enumerate all 2^n subsequences and check each — is exponential, so the DP is already an enormous win. The known improvement is **O(n log n)**: keep an array of "smallest tail per length" and binary-search where each element lands (patience sorting). Name it even if you don't code it; knowing the better bound exists is the senior tell.

Details that bite: "subsequence" ≠ "subarray" (no contiguity requirement — [10,9,2,5,3,7,101,18] → [2,3,7,101], length 4), "strictly increasing" means \`<\` not \`<=\` (so [7,7,7] → 1), and \`Math.max(...dp, 0)\` covers the empty array, where a bare spread of \`[]\` yields \`-Infinity\`.

**Red flag:** returning \`dp[n-1]\` instead of the max of dp, or confusing subsequence with contiguous subarray — each yields wrong answers on the standard test vector.

**Say it:** "dp[i] is the LIS ending at i; I extend any smaller predecessor and take the global max — O(n²) here, with an O(n log n) patience-sort variant using binary search on tails."`,
    tests: [
      { it: '[10,9,2,5,3,7,101,18] -> 4', run: 'lisLength([10,9,2,5,3,7,101,18])', expected: 4 },
      { it: 'empty -> 0', run: 'lisLength([])', expected: 0 },
      { it: 'all equal -> 1 (strictly increasing)', run: 'lisLength([7,7,7])', expected: 1 },
      { it: 'fully increasing -> length', run: 'lisLength([1,2,3,4])', expected: 4 },
      { it: 'fully decreasing -> 1', run: 'lisLength([5,4,3])', expected: 1 },
      { it: 'best subsequence not at the end', run: 'lisLength([4,10,4,3,8,9])', expected: 3 },
    ],
    hints: ['dp[i] = longest subsequence ENDING at i, init all 1', 'For each i, check all j < i with arr[j] < arr[i]', 'Answer is max of dp, not dp[n-1] — O(n²), patience sort gets O(n log n)'],
  },
  {
    id: 116,
    title: 'Urinales libres (free urinals)',
    category: 'JS ES5',
    difficulty: 'hard',
    timeEstimate: '10 min',
    prompt: `Given a binary string representing occupied (1) and free (0) urinals,
return the maximum number of additional people who can use them.
Rule: at least one urinal gap between users. Return -1 if the input already violates the rule (two adjacent 1s).`,
    starterCode: `function freeUrinals(urinals) {
  // Your code here
  return 0
}`,
    solution: `function freeUrinals(urinals) {
  if (urinals.includes('11')) return -1
  let count = 0
  const arr = urinals.split('')
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === '0' && (i === 0 || arr[i - 1] === '0') && (i === arr.length - 1 || arr[i + 1] === '0')) {
      count++
      arr[i] = '1'
    }
  }
  return count
}`,
    explanation: `This is a **greedy placement** problem (LeetCode's "Can Place Flowers" in disguise): scan left to right, place at the first legal slot, mark it occupied, continue. The greedy choice is provably optimal here — placing as early as possible never blocks more future placements than it enables, because each placement's "shadow" (itself plus one neighbor to the right) is minimal when you take the leftmost legal spot. **O(n) time, O(n) space** for the split array (O(1) if you track only the previous cell).

Three mechanics carry the solution:
- **Validate first.** \`urinals.includes('11')\` rejects already-invalid input in one pass. Validation before computation, always — otherwise you compute a "max additions" for a state that can't exist.
- **Boundary conditions as short-circuits.** \`i === 0 || arr[i-1] === '0'\` treats the wall as a free neighbor. Ends of the array are where the off-by-ones live.
- **Mutate as you place.** Setting \`arr[i] = '1'\` makes each placement visible to the next iteration's neighbor check. Skipping this double-books adjacent zeros — "000" would wrongly report 3 instead of 2. Strings are immutable, hence the \`split('')\` to get a writable array.

The naive alternative — try all subsets of free positions — is exponential; the greedy insight collapses it to one scan. If asked to prove greed works, the exchange argument is the phrase to reach for.

**Red flag:** forgetting to mark placements as occupied, so the scan counts overlapping placements. It's the single most common failure on this problem and "000" exposes it immediately.

**Say it:** "Greedy left-to-right: validate for adjacent ones, place at every slot whose neighbors are free, and mark it occupied so the next check sees it — leftmost placement is provably optimal by an exchange argument."`,
    tests: [
      { it: '"10001" -> 1', run: 'freeUrinals("10001")', expected: 1 },
      { it: '"000" -> 2 (must mark placements)', run: 'freeUrinals("000")', expected: 2 },
      { it: 'invalid "11" -> -1', run: 'freeUrinals("11")', expected: -1 },
      { it: 'single free urinal', run: 'freeUrinals("0")', expected: 1 },
      { it: 'no room: "1010" -> 0', run: 'freeUrinals("1010")', expected: 0 },
      { it: 'long gap: "10000001" -> 2', run: 'freeUrinals("10000001")', expected: 2 },
    ],
    hints: ['Check for adjacent occupied', 'Greedy: place when both neighbors free', 'Mark placed as occupied'],
  },
  {
    id: 117,
    title: 'Carrito (shopping cart function)',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Implement a shopping cart function that takes current cart state and a product
with quantity (positive to add, negative to remove). Return a NEW cart state without mutating the input.
If quantity reaches 0 or below, remove the product. Removing a product not in the cart returns the cart unchanged.`,
    starterCode: `function updateCart(cart, product, quantity) {
  // Your code here
  return [...cart]
}`,
    solution: `function updateCart(cart, product, quantity) {
  const existing = cart.findIndex(p => p.product === product)
  if (existing >= 0) {
    const updated = [...cart]
    const newQty = updated[existing].quantity + quantity
    if (newQty <= 0) return updated.filter((_, i) => i !== existing)
    updated[existing] = { ...updated[existing], quantity: newQty }
    return updated
  }
  return quantity > 0 ? [...cart, { product, quantity }] : cart
}`,
    explanation: `This isn't really an algorithm question — it's an **immutable state-update** question, the exact contract of a Redux reducer or a \`useState\` updater: \`(state, action) → newState\`, never mutating \`state\`. React's change detection is reference equality; mutate the array in place and nothing re-renders. That's the class of problem this pattern is FOR.

The branch structure enumerates the cases explicitly: product exists → compute new quantity → either remove (\`filter\`) or replace; product absent → append if adding, no-op if removing. Each case returns a *new* array, and the updated item is itself a *new object* (\`{ ...item, quantity }\`) — copying the array but mutating the item inside it is the classic shallow-copy bug: the spread copies references, not contents, so \`updated[existing].quantity += n\` would still corrupt the original cart's item.

Complexity: \`findIndex\` + copy = **O(n) time, O(n) space** per update — the floor for immutable array updates, since a new array must be produced. The "naive" alternative here isn't slower, it's *mutating*: \`push\`/\`splice\`/\`item.quantity +=\` are O(1) and wrong for this contract.

Note the ≤ 0 removal handles over-removal gracefully (quantity 1, remove 5 → gone, not negative), and removing a nonexistent product returns \`cart\` unchanged — by reference, which memoized consumers will thank you for.

**Red flag:** \`updated[existing].quantity += quantity\` after a spread — the array is new but the item is shared, so the "immutable" update mutates the caller's state. Spot-check: does every changed object have its own spread?

**Say it:** "It's a reducer: I return a new array and a new item object for the changed row — spreading the array alone copies references, so mutating the nested item would still leak into the original state."`,
    tests: [
      { it: 'adds new product', run: 'updateCart([], "apple", 2)', expected: [{ product: 'apple', quantity: 2 }] },
      { it: 'removes product when qty reaches 0', run: 'updateCart([{product:"a",quantity:1}], "a", -1).length', expected: 0 },
      { it: 'increments existing product', run: 'updateCart([{product:"a",quantity:1}], "a", 2)[0].quantity', expected: 3 },
      { it: 'over-removal clamps to removal', run: 'updateCart([{product:"a",quantity:1}], "a", -5).length', expected: 0 },
      { it: 'removing missing product is a no-op', run: 'updateCart([], "ghost", -1).length', expected: 0 },
      { it: 'does not mutate original cart item', run: '(() => { const c = [{product:"a",quantity:1}]; updateCart(c, "a", 5); return c[0].quantity })()', expected: 1 },
    ],
    hints: ['Find existing product index', 'Calculate new quantity, remove if <= 0', 'New array AND new item object — spread copies references only'],
  },
  {
    id: 118,
    title: 'Palabrador (word overlapping)',
    category: 'JS ES6+',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Given words, find the overlapping segment between the end of one word and the start
of the next to form a new combined word.
Example: ["abc","bcd","cde"] -> "abcde" (bc overlaps, cd overlaps). Words with no overlap just concatenate.`,
    starterCode: `function overlapCombine(words) {
  // Your code here
  return ''
}`,
    solution: `function overlapCombine(words) {
  if (words.length === 0) return ''
  return words.reduce((acc, word) => {
    let overlap = 0
    for (let i = 1; i <= Math.min(acc.length, word.length); i++) {
      if (acc.slice(-i) === word.slice(0, i)) overlap = i
    }
    return acc + word.slice(overlap)
  })
}`,
    explanation: `This is **suffix–prefix matching** plus a **fold**: for each adjacent pair, find the longest suffix of the accumulated string that equals a prefix of the next word, then append only the non-overlapping remainder. \`reduce\` without an initial value seeds the fold with \`words[0]\` — exactly right here, but it *throws* on an empty array, hence the explicit guard.

The overlap search tries every candidate length i and compares \`acc.slice(-i)\` with \`word.slice(0, i)\`, keeping the largest match. Note it must keep scanning to the max — taking the *first* match and breaking would return "a" overlap when "abc" overlap exists. Per pair that's O(m²) in the shorter length (m slice comparisons of length up to m), so the whole thing is roughly **O(n·m²)** — fine for words, and the honest answer when asked. The asymptotically better tool is the **KMP failure function** computed over \`word + '#' + acc\`, which finds the longest suffix-prefix overlap in O(m) — name it, don't code it, unless the interviewer pushes.

Also say the scope boundary: greedy pairwise merging is not the general *shortest superstring* problem (that one is NP-hard and order matters); this question fixes the order, which is what makes it tractable.

**Red flag:** breaking out of the loop on the first matching i — you want the *longest* overlap, so either scan all lengths keeping the max, or scan from the largest length downward and break. Off-by-one in \`slice(-i)\` vs \`slice(0, i)\` is the other classic; check i = full-word-length by hand.

**Say it:** "It's a fold with a suffix-prefix match per step — I keep the longest overlap, not the first, and I'd reach for KMP's failure function if the strings were long enough for O(m²) to matter."`,
    tests: [
      { it: 'combines overlapping', run: 'overlapCombine(["abc","bcd","cde"])', expected: 'abcde' },
      { it: 'no overlap just concatenates', run: 'overlapCombine(["ab","cd"])', expected: 'abcd' },
      { it: 'full overlap collapses', run: 'overlapCombine(["aaa","aaa"])', expected: 'aaa' },
      { it: 'single word unchanged', run: 'overlapCombine(["hello"])', expected: 'hello' },
      { it: 'empty input -> ""', run: 'overlapCombine([])', expected: '' },
      { it: 'longest overlap wins, not first', run: 'overlapCombine(["abab","abab"])', expected: 'abab' },
    ],
    hints: ['reduce with accumulator', 'Find MAX overlap length, not the first match', 'Append non-overlapping suffix'],
  },
  {
    id: 119,
    title: 'Anagramas (anagram check)',
    category: 'JS ES6+',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Determine if two strings are anagrams (same letters, different order).
Case-insensitive. Ignore spaces.`,
    starterCode: `function isAnagram(a, b) {
  // Your code here
  return false
}`,
    solution: `function isAnagram(a, b) {
  const clean = s => s.toLowerCase().replace(/\\s/g, '').split('').sort().join('')
  return clean(a) === clean(b)
}`,
    explanation: `Anagram checking is the textbook **canonicalization** pattern: instead of comparing two things directly, map each to a *canonical form* where equivalent inputs become identical, then compare with \`===\`. Here the canonical form is "lowercased, space-stripped, characters sorted". The same idea powers dedup keys, cache keys, and grouping anagrams into buckets (the follow-up question: use the sorted string as a Map key).

Complexity: the sort dominates — **O(n log n)** time, O(n) space. The O(n) alternative is a **character frequency map**: count characters of \`a\` up, count characters of \`b\` down, verify every count is zero (or compare two histograms). That's asymptotically better and the right answer for the follow-up, but for interview-length strings the sorted-string version is shorter, harder to get wrong, and produces a comparable *value* — which is exactly why it generalizes to grouping. State the trade-off; don't pretend sort is free.

A cheap pre-check worth mentioning: after cleaning, different lengths can never be anagrams — an early \`length\` comparison short-circuits the sort. And note the helper \`clean\` is defined once and applied to both inputs: normalize both sides identically or the comparison is meaningless.

**Red flag:** sorting without normalizing first (case and spaces leak into the comparison), or hand-rolling the frequency compare and forgetting to check for *leftover* counts — a is "aab", b is "abb" passes a naive "every char of a is in b" check.

**Say it:** "I canonicalize both strings — normalize, sort, join — and compare; it's O(n log n), and I'd switch to a character histogram for O(n) or for grouping many words by anagram class."`,
    tests: [
      { it: '"listen" and "silent" are anagrams', run: 'isAnagram("listen", "silent")', expected: true },
      { it: '"hello" and "world" are not', run: 'isAnagram("hello", "world")', expected: false },
      { it: 'case and spaces ignored', run: 'isAnagram("Debit Card", "Bad Credit")', expected: true },
      { it: 'different lengths fail', run: 'isAnagram("aab", "ab")', expected: false },
      { it: 'same letters different counts fail', run: 'isAnagram("aab", "abb")', expected: false },
      { it: 'two empty strings are anagrams', run: 'isAnagram("", "")', expected: true },
    ],
    hints: ['Remove spaces, lowercase', 'Sort characters', 'Compare sorted strings — or a frequency map for O(n)'],
  },
  {
    id: 120,
    title: 'Conteo de caracteres',
    category: 'JS ES5',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Count each character in a string (case-sensitive). Return an object with character counts.`,
    starterCode: `function charCount(str) {
  // Your code here
  return {}
}`,
    solution: `function charCount(str) {
  const count = {}
  for (const c of str) count[c] = (count[c] || 0) + 1
  return count
}`,
    explanation: `This is the **frequency map in its purest form** — the primitive that problems 104, 112, 113, and 125 all build on. If a candidate can't produce this in thirty seconds, every histogram-based question downstream falls over, which is why it gets asked despite being "easy". One pass, **O(n) time, O(k) space** for k distinct characters.

The load-bearing expression is \`count[c] = (count[c] || 0) + 1\` — read it as "current count, defaulting to zero, plus one". The default matters because a missing key reads as \`undefined\`, and \`undefined + 1\` is \`NaN\`. There is no faster approach to discuss — counting requires touching every character once — so the interview signal moves to details:

- **\`for...of\` iterates code points**, not UTF-16 code units like \`str[i]\` indexing does. For emoji and other astral-plane characters, \`charCount('𝒳')\` with \`for...of\` counts one character; index-based loops count two half-surrogates. A one-sentence Unicode remark here is cheap and distinctive.
- **Plain object vs Map**: a plain object inherits prototype keys, so \`count['constructor']\` before assignment isn't \`undefined\` — it's a function, and \`|| 0\` actually saves you here by coercing it. \`Object.create(null)\` or a \`Map\` removes the hazard cleanly; mention it when asked about hostile input.

**Red flag:** \`count[c]++\` with no default — NaN on first sight of each character, and the object ends up all NaN. It's the same initialize-or-increment miss as in group-and-count, and it's the first thing a reviewer greps for.

**Say it:** "One pass with initialize-or-increment — the || 0 default exists because undefined + 1 is NaN, and for...of gives me code points instead of surrogate halves."`,
    tests: [
      { it: 'counts "hello"', run: 'charCount("hello")', expected: { h: 1, e: 1, l: 2, o: 1 } },
      { it: 'empty string -> {}', run: 'charCount("")', expected: {} },
      { it: 'case-sensitive: a and A differ', run: 'charCount("aA")', expected: { a: 1, A: 1 } },
      { it: 'counts spaces too', run: 'charCount("a a")[" "]', expected: 1 },
      { it: 'repeated char', run: 'charCount("aaa").a', expected: 3 },
    ],
    hints: ['Loop over characters', 'Increment in object with || 0 default', 'Case-sensitive'],
  },
  {
    id: 121,
    title: 'Duplicados en array',
    category: 'JS ES5',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Return true if an array has any duplicate elements, false otherwise.`,
    starterCode: `function hasDuplicates(arr) {
  // Your code here
  return false
}`,
    solution: `function hasDuplicates(arr) {
  return new Set(arr).size !== arr.length
}`,
    explanation: `The **Set-size comparison** again (see the isogram), applied to arrays: a \`Set\` collapses duplicates on construction, so if its size differs from the array's length, something repeated. One line, **O(n) time, O(n) space**.

The naive alternatives are the reason this gets asked:
- \`arr.some((x, i) => arr.indexOf(x) !== i)\` — reads clever, is **O(n²)**: \`indexOf\` rescans from the start for every element. The classic hidden-quadratic.
- Sort then scan neighbors — **O(n log n)**, O(1) extra space if you may mutate. This is the right call when memory is the constraint; trade-offs, not absolutes.
- Incremental Set with early exit: insert one element at a time, return true the moment \`has\` hits. Same O(n) worst case, but stops at the *first* duplicate — better when duplicates are common and arrays are huge. The one-liner always processes the whole array.

Semantics worth one sentence in the interview: Sets use **SameValueZero** equality. That means \`1\` and \`'1'\` are different (no coercion — strictness you want), \`NaN\` equals \`NaN\` (unlike \`===\`), and objects compare by *reference* — two structurally identical object literals are not duplicates. For "deep duplicates" you'd canonicalize each element (e.g. stable stringify) first.

**Red flag:** \`indexOf\` inside \`some\`/\`filter\` — O(n²) in one innocent-looking line. If you write the one-liner, be ready to give the early-exit version when asked "what if the array has ten million elements and a dupe at index 2?"

**Say it:** "Set deduplicates on construction, so size versus length answers it in O(n) — with SameValueZero semantics, so no type coercion and objects compare by reference."`,
    tests: [
      { it: '[1,2,3] has no dupes', run: 'hasDuplicates([1,2,3])', expected: false },
      { it: '[1,2,2] has dupes', run: 'hasDuplicates([1,2,2])', expected: true },
      { it: 'empty array has none', run: 'hasDuplicates([])', expected: false },
      { it: 'no coercion: 1 and "1" differ', run: 'hasDuplicates([1, "1"])', expected: false },
      { it: 'string duplicates detected', run: 'hasDuplicates(["a","b","a"])', expected: true },
      { it: 'single element', run: 'hasDuplicates([42])', expected: false },
    ],
    hints: ['Set removes duplicates', 'Compare Set.size to array.length', 'indexOf-in-a-loop is the O(n²) trap'],
  },
  {
    id: 122,
    title: 'Suma de rangos',
    category: 'JS ES5',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Sum all integers within an inclusive range (start to end). Return 0 if start > end.`,
    starterCode: `function rangeSum(start, end) {
  // Your code here
  return 0
}`,
    solution: `function rangeSum(start, end) {
  if (start > end) return 0
  return ((start + end) * (end - start + 1)) / 2
}`,
    explanation: `This question separates candidates who compute from candidates who *derive*. The loop answer — accumulate from start to end — is O(n) and correct. The **arithmetic series formula** — (first + last) × count / 2 — is **O(1)**, and it's the difference between "can write a for loop" and "recognized the math". The Gauss pairing intuition takes one sentence: pair the first and last elements, each pair sums to (start + end), and there are count/2 pairs.

The details that actually get tested:
- **Inclusive count is \`end - start + 1\`**, not \`end - start\`. The fencepost error. rangeSum(1, 5) has five terms, not four.
- **The guard clause** handles the contract's degenerate case (start > end → 0) before the formula runs — otherwise the formula happily returns a negative "sum" for an empty range.
- **Negative bounds just work**: rangeSum(-2, 2) = 0 because the formula is algebra, not iteration. Worth testing out loud to show the formula's domain is wider than the loop's obvious cases.
- The division by 2 is always exact — (start + end) and count can't both be odd — so no floating-point concern for integer inputs.

The O(1)-vs-O(n) distinction sounds academic until the range is 1 to 10⁹ — the loop takes seconds, the formula takes nanoseconds. Constant-time closed forms beat iteration whenever they exist.

**Red flag:** \`end - start\` as the count — off-by-one on the very first test — or looping when the interviewer's follow-up is obviously "now do it for a billion elements".

**Say it:** "Arithmetic series: (first + last) times count over two, with count = end − start + 1 inclusive — O(1) instead of an O(n) loop, and the guard covers the empty range."`,
    tests: [
      { it: '1 to 5 = 15', run: 'rangeSum(1, 5)', expected: 15 },
      { it: 'start > end = 0', run: 'rangeSum(5, 3)', expected: 0 },
      { it: 'single-element range', run: 'rangeSum(3, 3)', expected: 3 },
      { it: 'negative range cancels', run: 'rangeSum(-2, 2)', expected: 0 },
      { it: 'large range (formula, not loop)', run: 'rangeSum(1, 100)', expected: 5050 },
      { it: 'negative-only range', run: 'rangeSum(-3, -1)', expected: -6 },
    ],
    hints: ['Arithmetic series formula', '(first + last) * count / 2', 'Count = end - start + 1 — the +1 is the fencepost'],
  },
  {
    id: 123,
    title: 'Números perdidos (missing numbers)',
    category: 'JS ES5',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Given an array that should contain consecutive numbers from 1 to N but is missing some,
return the missing numbers in order. Empty input returns [].`,
    starterCode: `function findMissing(arr) {
  // Your code here
  return []
}`,
    solution: `function findMissing(arr) {
  if (arr.length === 0) return []
  const have = new Set(arr)
  const max = Math.max(...arr)
  const missing = []
  for (let n = 1; n <= max; n++) {
    if (!have.has(n)) missing.push(n)
  }
  return missing
}`,
    explanation: `This is a **set-difference** problem: expected values (1..N) minus actual values. The pattern shows up everywhere reconciliation happens — missing IDs in a sequence, unsynced records, gap detection. The efficient shape: pour the actual values into a \`Set\` for O(1) membership, then walk the expected range asking \`has\`. **O(n) time, O(n) space.**

The naive version replaces the Set with \`arr.includes(n)\` inside the loop — that's a linear scan per candidate, **O(n²)** total. It's *the* most common hidden-quadratic in JavaScript interviews because \`includes\` reads like a primitive operation. The rule: membership test inside a loop → hash it first. Same fix, every time.

Two guards worth pointing at:
- **\`Math.max(...[])\` is \`-Infinity\`** — spreading an empty array into Math.max returns the identity for max, and the loop bound goes nonsensical. The early return isn't decorative. (For very large arrays, spread also risks blowing the argument limit; \`reduce\` for the max is the robust spelling.)
- Deriving N from \`Math.max(...arr)\` assumes the *last* number isn't missing — that's the stated contract here ("1 to N"), but restating an assumption you're relying on is a senior habit.

The classic variant: exactly *one* missing number can be found with no Set at all — expected sum \`N(N+1)/2\` minus actual sum, O(1) space. Offer it when asked to optimize.

**Red flag:** \`includes\` inside the loop — O(n²) — and skipping the empty-array guard so the function returns garbage on \`[]\` instead of \`[]\`.

**Say it:** "Set difference: hash what I have, walk 1..N with O(1) lookups — and if exactly one number were missing, the arithmetic-sum trick finds it in O(1) space."`,
    tests: [
      { it: '[1,3,4] -> [2]', run: 'findMissing([1,3,4])', expected: [2] },
      { it: '[2,3,4] -> [1]', run: 'findMissing([2,3,4])', expected: [1] },
      { it: 'nothing missing -> []', run: 'findMissing([1,2,3])', expected: [] },
      { it: 'empty input -> [] (Math.max spread trap)', run: 'findMissing([])', expected: [] },
      { it: 'multiple gaps in order', run: 'findMissing([1,5])', expected: [2, 3, 4] },
      { it: 'unsorted input works', run: 'findMissing([4,1,3])', expected: [2] },
    ],
    hints: ['Find max value N', 'Set for O(1) membership — includes in a loop is O(n²)', 'Guard the empty array: Math.max(...[]) is -Infinity'],
  },
  {
    id: 124,
    title: 'Es letra (is single letter)',
    category: 'JS ES5',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Return true if a given string is a single ASCII letter (a-z or A-Z), false for numbers, symbols, or longer strings.`,
    starterCode: `function isLetter(char) {
  // Your code here
  return false
}`,
    solution: `function isLetter(char) {
  return typeof char === 'string' && char.length === 1 && /[a-zA-Z]/.test(char)
}`,
    explanation: `Trivial-looking validation questions test one thing: whether you write predicates that are safe on *hostile* input, not just wrong input. This is **defensive type-checking as a guard chain**, ordered so each check makes the next one safe: \`typeof\` first (so \`.length\` can't throw on \`null\` or a number), length second (so the regex verdict applies to the whole value), character class last. All O(1).

The subtle regex trap is why the length check can't be skipped: **an unanchored \`/[a-zA-Z]/.test(s)\` asks "does s *contain* a letter anywhere"**, so \`"ab"\`, \`"1a"\`, and \`"hello!"\` all pass it. Two correct fixes: check \`length === 1\` separately (as here), or anchor the pattern — \`/^[a-zA-Z]$/\`. Knowing that \`test\` searches rather than matches-whole is a small fact that kills a whole family of validation bugs, including real-world input sanitizers.

Also worth saying: \`typeof char === 'string'\` makes the function total — it returns \`false\` for \`5\`, \`null\`, \`undefined\`, or an object rather than throwing mid-expression. A predicate that can throw isn't a predicate; callers end up wrapping it in try/catch and the type confusion spreads. The && chain's short-circuiting is what makes the ordering enforceable in one expression.

Scope note: the prompt says letter, this checks ASCII. \`"é"\` and \`"ñ"\` return false. If Unicode letters were required, \`/^\\p{L}$/u\` is the modern answer — naming that boundary is better than silently picking one.

**Red flag:** an unanchored regex as the only check — \`isLetter("ab")\` returns true and the validator becomes a rubber stamp. Anchor it or check the length; do one of them consciously.

**Say it:** "Guard chain: type, then length, then character class — because an unanchored regex test only asks 'contains', and the typeof guard makes the predicate total instead of throwable."`,
    tests: [
      { it: '"a" is a letter', run: 'isLetter("a")', expected: true },
      { it: 'uppercase "Z" is a letter', run: 'isLetter("Z")', expected: true },
      { it: '"1" is not', run: 'isLetter("1")', expected: false },
      { it: '"ab" is not (anchoring/length trap)', run: 'isLetter("ab")', expected: false },
      { it: 'empty string is not', run: 'isLetter("")', expected: false },
      { it: 'non-string input returns false, no throw', run: 'isLetter(5)', expected: false },
    ],
    hints: ['Length must be 1 — an unanchored regex matches "ab"', 'Check a-zA-Z regex', 'typeof guard first so nothing throws'],
  },
  {
    id: 125,
    title: 'Palíndromos (rearrange to palindrome)',
    category: 'JS ES6+',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Given a positive number, determine if its digits can be rearranged to form a palindrome
(reads same forwards and backwards).`,
    starterCode: `function canFormPalindrome(n) {
  // Your code here
  return false
}`,
    solution: `function canFormPalindrome(n) {
  const digits = String(n).split('')
  const count = {}
  for (const d of digits) count[d] = (count[d] || 0) + 1
  const odds = Object.values(count).filter(c => c % 2 !== 0)
  return odds.length <= 1
}`,
    explanation: `The trap in this question is doing what it *seems* to ask. You never generate rearrangements — a k-digit number has up to k! permutations, and checking each is factorially explosive. Instead you use the **palindrome counting invariant**: a multiset of characters can form a palindrome iff **at most one character has an odd count**. Even-count characters mirror across the center; the single odd one (if any) sits in the middle. Odd-length palindromes ("121") have exactly one odd count, even-length ones ("1221") have zero — \`odds.length <= 1\` covers both without branching on length.

So the algorithm is: stringify the number, build the by-now-standard **frequency map** (see #120), count odd values. **O(k) time, O(1) space** — digits only have 10 possible values, so the map is bounded. Against the naive permutation search, this is the largest complexity gap in this entire set: O(k) vs O(k!). This problem *is* the lesson that "can it be rearranged into X?" questions are almost always invariant questions, not search questions — same insight class as anagram grouping and "can you make these strings equal by swaps".

A slicker variant for the follow-up: you don't need counts, only their *parity* — toggle each digit in a Set (add if absent, delete if present) and check \`set.size <= 1\` at the end. Same complexity, halves the bookkeeping.

**Red flag:** any attempt to enumerate permutations, even "just a few" — it signals you didn't look for the invariant. Second-tier miss: requiring exactly one odd count, which wrongly rejects even-length palindromes like 1221.

**Say it:** "I never rearrange anything — a digit multiset forms a palindrome iff at most one digit has an odd count, so it's a frequency map and a parity check: O(k) instead of O(k!)."`,
    tests: [
      { it: '1221 can form palindrome (zero odd counts)', run: 'canFormPalindrome(1221)', expected: true },
      { it: '123 cannot', run: 'canFormPalindrome(123)', expected: false },
      { it: 'single digit is a palindrome', run: 'canFormPalindrome(7)', expected: true },
      { it: '10 cannot', run: 'canFormPalindrome(10)', expected: false },
      { it: '121 already unbalanced-center palindrome', run: 'canFormPalindrome(121)', expected: true },
      { it: '112233 -> true (rearranges to 123321)', run: 'canFormPalindrome(112233)', expected: true },
    ],
    hints: ['Count digit frequencies', 'At most ONE odd count allowed — not exactly one', 'Never generate permutations — use the invariant'],
  },
]
