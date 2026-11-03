window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-collections",
  title: "Collections, Iterators & Closures",
  emoji: "📚",
  lang: "rust",
  lessons: [
    {
      id: "collections",
      title: "Vec & HashMap",
      steps: [
        {
          type: "text",
          md: [
            "## The two you'll use daily",
            "- **`Vec<T>`** — growable array on the heap. `push`, `pop`, `len`, indexing, iteration. This is the default sequence.\n- **`HashMap<K, V>`** — hash map from `std::collections`. Note the import: the standard library does not put it in the prelude, unlike `Vec`.",
            "Indexing (`v[0]`) **panics** out of bounds. Prefer `.get(0)`, which returns `Option<&T>` — the same \"absence is in the type\" rule from module 03.",
            "`HashMap` has one API you must know: **`entry`**. It gives you a slot you can fill or update in a single lookup, which is how counters are written idiomatically.",
          ],
        },
        {
          type: "code",
          title: "src/counts.rs",
          source: String.raw`use std::collections::HashMap;

pub fn count_words(text: &str) -> HashMap<String, u32> {
    let mut counts = HashMap::new();

    for word in text.split_whitespace() {
        *counts.entry(word.to_string()).or_insert(0) += 1;
    }

    counts
}

pub fn describe(v: &[u32]) -> String {
    let first = v.get(0).copied().unwrap_or(0);
    format!("{} items, first {first}", v.len())
}

fn main() {
    let counts = count_words("mochi rex mochi");
    println!("{:?}", counts);
    println!("{}", describe(&[10, 20]));
}`,
          caption: "`entry(...).or_insert(0)` returns `&mut u32` — the `*` dereferences it so `+= 1` writes into the map. One hash lookup, not two.",
        },
        {
          type: "quiz",
          q: "What does `counts.entry(word).or_insert(0)` return?",
          choices: [
            "A mutable reference to the value for that key, inserted as 0 if it was absent",
            "A copy of the value",
            "`Option<&u32>`",
            "`()` — it only inserts",
          ],
          answer: 0,
          explain: "It returns `&mut V`, so you can read or write through it. The `*` in `*counts.entry(..).or_insert(0) += 1` is what lets `+=` mutate the stored value.",
          nudge: "You need to be able to write to it.",
        },
        {
          type: "text",
          md: [
            "## Choosing the collection",
            "- Need an ordered sequence with fast append and index? **`Vec`**.\n- Need lookup by key? **`HashMap`** (unordered).\n- Need keys in sorted order? **`BTreeMap`**.\n- Need a set? **`HashSet`** / **`BTreeSet`**.\n- Need a queue? **`VecDeque`**.",
            "**Production note:** don't reach for a linked list. `std::collections::LinkedList` exists and is almost never the right answer — cache locality makes `Vec` faster for the overwhelming majority of workloads.",
          ],
        },
        {
          type: "exercise",
          title: "Count the words",
          prompt: [
            "Implement `count_words` so it returns how many times each whitespace-separated word appears.",
            "Use `split_whitespace()` and the `entry` API — one lookup per word.",
          ],
          starter: String.raw`use std::collections::HashMap;

pub fn count_words(text: &str) -> HashMap<String, u32> {
    // your code here
}`,
          solution: String.raw`use std::collections::HashMap;

pub fn count_words(text: &str) -> HashMap<String, u32> {
    let mut counts = HashMap::new();

    for word in text.split_whitespace() {
        *counts.entry(word.to_string()).or_insert(0) += 1;
    }

    counts
}`,
          checks: [
            { re: /let mut counts=HashMap::new\(\)/, hint: "Create the map first: `let mut counts = HashMap::new();`." },
            { re: /\.entry\(/, hint: "Use the entry API: `counts.entry(...)`." },
            { re: /or_insert\(0\)\+=1/, hint: "Increment through the entry: `*counts.entry(..).or_insert(0) += 1;`." },
          ],
          success: "The entry API is the single most useful HashMap pattern. Two lookups became one.",
        },
      ],
    },
    {
      id: "iterators",
      title: "Iterator chains",
      steps: [
        {
          type: "text",
          md: [
            "## Iterators are lazy and free",
            "An iterator chain does **nothing** until a consumer runs it. `iter().map(f).filter(g)` merely builds a value describing the work; `.collect()`, `.sum()`, `.count()`, or a `for` loop actually executes it.",
            "That laziness is why chains compile down to a plain loop — no intermediate `Vec` per step, no allocation per stage. Zero-cost abstraction is not a slogan here; it's the optimizer consuming the state machine.",
            "Three starting points, and the difference matters:",
            "- **`iter()`** → yields `&T`.\n- **`iter_mut()`** → yields `&mut T`.\n- **`into_iter()`** → yields `T`, consuming the collection.",
          ],
        },
        {
          type: "code",
          title: "src/scores.rs",
          source: String.raw`pub fn top_scores(scores: &[u32], threshold: u32) -> Vec<u32> {
    let mut top: Vec<u32> = scores
        .iter()
        .copied()
        .filter(|score| *score >= threshold)
        .collect();

    top.sort_unstable();
    top.reverse();
    top
}

pub fn total_len(names: &[String]) -> usize {
    names.iter().map(|name| name.len()).sum()
}

fn main() {
    println!("{:?}", top_scores(&[10, 80, 30, 95], 50));
    println!("{}", total_len(&[String::from("mochi"), String::from("rex")]));
}`,
          caption: "`copied()` turns `&u32` into `u32` so the rest of the chain owns plain values. `sort_unstable` is the faster sort when equal elements are interchangeable.",
        },
        {
          type: "quiz",
          q: "`scores.iter().map(|s| s + 1)` — when does the addition run?",
          choices: [
            "When a consumer such as `collect`, `sum`, or a `for` loop drives the iterator",
            "Immediately, once per element",
            "Never — `map` only works with `Vec`",
            "At compile time",
          ],
          answer: 0,
          explain: "`map` returns a lazy adapter. Nothing executes until a consumer pulls values through it. Building the chain is free; the work happens once, fused into a single pass.",
          nudge: "Iterators are lazy.",
        },
        {
          type: "text",
          md: [
            "## The adapters worth memorising",
            "- **Transform:** `map`, `flat_map`, `enumerate`, `zip`.\n- **Select:** `filter`, `filter_map`, `take`, `skip`, `take_while`.\n- **Reduce:** `fold`, `sum`, `count`, `min`, `max`, `collect`.\n- **Peek:** `any`, `all`, `find`, `position`.",
            "`filter_map` is the one people forget: it filters and maps in a single step, which is exactly what you want when the transform returns `Option`.",
          ],
        },
        {
          type: "exercise",
          title: "Filter and collect",
          prompt: [
            "Implement `top_scores`: keep every score at or above `threshold`, returned as a new `Vec`.",
            "Use `iter()`, `copied()`, `filter(...)` and `collect()` — no manual loop.",
          ],
          starter: String.raw`pub fn top_scores(scores: &[u32], threshold: u32) -> Vec<u32> {
    // your code here
}`,
          solution: String.raw`pub fn top_scores(scores: &[u32], threshold: u32) -> Vec<u32> {
    scores
        .iter()
        .copied()
        .filter(|score| *score >= threshold)
        .collect()
}`,
          checks: [
            { re: /\.copied\(\)|\.cloned\(\)/, hint: "`iter()` yields `&u32`; `copied()` turns each into a `u32`." },
            { re: /\.filter\(/, hint: "Keep the matching scores with `.filter(...)`." },
            { re: /\.collect\(\)/, hint: "Collect the chain into the `Vec`." },
          ],
          success: "One chain, one pass, no intermediate allocation. That is idiomatic Rust.",
        },
      ],
    },
    {
      id: "closures",
      title: "Closures & Fn traits",
      steps: [
        {
          type: "text",
          md: [
            "## Closures capture, functions don't",
            "A closure is an anonymous function that can **capture** variables from its environment. `|x| x + offset` remembers `offset` without you passing it in.",
            "Rust infers the closure's type once, from first use — which is why you can't call the same closure with an `i32` and then a `&str`.",
            "Three traits describe how a closure captures, and they're the vocabulary of every API that takes a callback:",
            "- **`Fn`** — borrows immutably; callable many times concurrently.\n- **`FnMut`** — borrows mutably; callable many times, one at a time.\n- **`FnOnce`** — takes ownership; callable exactly once.",
          ],
        },
        {
          type: "code",
          title: "src/apply.rs",
          source: String.raw`pub fn apply_all(values: &[u32], transform: impl Fn(u32) -> u32) -> Vec<u32> {
    values.iter().map(|value| transform(*value)).collect()
}

pub fn retry<F: FnMut() -> bool>(mut attempt: F, max: usize) -> bool {
    for _ in 0..max {
        if attempt() {
            return true;
        }
    }
    false
}

fn main() {
    let bump = 10;
    let bumped = apply_all(&[1, 2, 3], |value| value + bump);
    println!("{bumped:?}");

    let mut count = 0;
    let ok = retry(|| {
        count += 1;
        count == 2
    }, 3);
    println!("{ok} after {count} tries");
}`,
          caption: "`apply_all` takes `impl Fn` because it only reads. `retry` takes `FnMut` because the closure mutates `count` each call.",
        },
        {
          type: "quiz",
          q: "A closure mutates a captured variable. Which trait bound must the API accept?",
          choices: [
            "`FnMut`",
            "`Fn`",
            "`FnOnce` only",
            "No bound — closures are dynamically typed",
          ],
          answer: 0,
          explain: "Mutating a captured variable requires a mutable borrow of the environment, which is what `FnMut` describes. `Fn` would forbid the mutation; `FnOnce` would consume the closure after one call.",
          nudge: "Borrow *mutably*, called repeatedly.",
        },
        {
          type: "text",
          md: [
            "## `move` closes over ownership",
            "By default a closure borrows. Add **`move`** and it takes ownership of what it uses — required when the closure outlives the current scope, notably when spawning a thread or an async task:",
            "```",
            "let name = String::from(\"Mochi\");",
            "let handle = std::thread::spawn(move || println!(\"{name}\"));",
            "```",
            "Without `move`, the thread could outlive `name`. The compiler insists you prove otherwise. You'll meet this again in module 08.",
          ],
        },
        {
          type: "exercise",
          title: "Apply a transform to every value",
          prompt: [
            "Implement `apply_all`: apply the closure to each value and collect the results.",
            "Use `iter()`, `map(...)` and `collect()`.",
          ],
          starter: String.raw`pub fn apply_all(values: &[u32], transform: impl Fn(u32) -> u32) -> Vec<u32> {
    // your code here
}`,
          solution: String.raw`pub fn apply_all(values: &[u32], transform: impl Fn(u32) -> u32) -> Vec<u32> {
    values.iter().map(|value| transform(*value)).collect()
}`,
          checks: [
            { re: /values\.iter\(\)\.map\(/, hint: "Walk the slice and map it: `values.iter().map(...)`." },
            { re: /transform\(\*value\)|transform\(\*v\)|transform\(\*item\)/, hint: "Dereference the item before calling the closure: `transform(*value)`." },
            { re: /\.collect\(\)/, hint: "Collect into the `Vec`." },
          ],
          success: "`impl Fn` in the signature, a deref at the call site. That's the callback shape you'll write for the rest of the course.",
        },
      ],
    },
  ],
});
