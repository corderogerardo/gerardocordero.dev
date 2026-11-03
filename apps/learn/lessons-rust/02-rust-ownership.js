window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-ownership",
  title: "Ownership & Borrowing",
  emoji: "🔑",
  lang: "rust",
  lessons: [
    {
      id: "ownership-rules",
      title: "The three rules",
      steps: [
        {
          type: "text",
          md: [
            "## Everything you'll fight, in three sentences",
            "1. **Every value has exactly one owner.**\n2. **There can only be one owner at a time.**\n3. **When the owner goes out of scope, the value is dropped.**",
            "That's the whole system. Everything else — moves, borrows, lifetimes — is a consequence.",
            "When you assign a heap-owning value to another binding, ownership **moves**. The old binding is not \"still pointing at it\"; it is now invalid, and the compiler will reject any later use. This is not a warning. It is an error.",
            "> **Why it matters:** use-after-free is impossible because \"use after move\" doesn't compile. Double-free is impossible because only one owner ever drops the value.",
          ],
        },
        {
          type: "code",
          title: "src/main.rs",
          source: String.raw`fn main() {
    let walker = String::from("Mochi");
    let owner = walker;          // ownership moved

    // println!("{walker}");     // ← compile error: borrow of moved value

    println!("{owner}");
} // owner drops here; the heap buffer is freed exactly once`,
          caption: "Uncomment the `println!` and the compiler tells you `value borrowed here after move`. That message is the borrow checker doing its job.",
        },
        {
          type: "quiz",
          q: "After `let owner = walker;`, what is the state of `walker`?",
          choices: [
            "It is moved-from: the binding still exists but using it is a compile error",
            "It is `nil`",
            "It is an empty string",
            "It still owns the data, and `owner` is a copy",
          ],
          answer: 0,
          explain: "The binding is not deleted from the source; it becomes **moved-from**. The compiler tracks that the value is no longer there and rejects any use. There is no null and no runtime check.",
          nudge: "Rust has no null, and `String` is not `Copy`.",
        },
        {
          type: "text",
          md: [
            "## `Clone` costs, `Copy` doesn't",
            "Types that live entirely on the stack and have no destructor — integers, floats, bools, chars, and tuples/arrays of those — implement **`Copy`**. Assigning them copies the bits, and the original stays usable.",
            "Everything else (anything owning heap memory: `String`, `Vec<T>`, `HashMap`) is only **`Clone`**: you must call `.clone()` explicitly, and you pay for the allocation. That's deliberate — Rust refuses to make an expensive copy look free.",
            "**Red flag:** a `.clone()` sprinkled to satisfy the compiler is usually a missing borrow or a missing ownership decision. It's fine at the edges of a request; it's a smell in a hot loop.",
          ],
        },
        {
          type: "quiz",
          q: "Which of these is `Copy`?",
          choices: [
            "`(i32, bool)`",
            "`String`",
            "`Vec<u8>`",
            "`HashMap<String, u32>`",
          ],
          answer: 0,
          explain: "A tuple of `Copy` types is itself `Copy`, so assigning it duplicates the value and both bindings stay usable. The other three own heap memory and implement `Clone`, not `Copy`.",
          nudge: "Which one can be duplicated by copying a handful of bytes with no allocation?",
        },
        {
          type: "exercise",
          title: "Fix the use-after-move",
          prompt: [
            "This program won't compile: `walker` is moved into `copy`, then used again.",
            "Fix it by cloning, so both bindings are valid and both are printed.",
          ],
          starter: String.raw`fn main() {
    let walker = String::from("Mochi");
    let copy = walker;

    println!("{} {}", copy, walker);
}`,
          solution: String.raw`fn main() {
    let walker = String::from("Mochi");
    let copy = walker.clone();

    println!("{} {}", copy, walker);
}`,
          checks: [
            { re: /walker\.clone\(\)/, hint: "Clone the value instead of moving it: `walker.clone()`." },
            { re: /let copy=walker\.clone\(\);/, hint: "The declaration becomes `let copy = walker.clone();`." },
            { re: /println!\([^)]*walker/, hint: "Keep printing `walker` after the clone — that's what proves it is still owned." },
          ],
          success: "Two owners, two allocations. Explicit is the point: Rust never hides an allocation behind an assignment.",
        },
      ],
    },
    {
      id: "borrowing",
      title: "Borrowing & references",
      steps: [
        {
          type: "text",
          md: [
            "## Move only when you mean it",
            "Passing ownership on every call would make Rust unusable — every function would consume your data. The fix is **borrowing**: hand out a reference instead of the value.",
            "- **`&T`** — a shared (read-only) borrow. Many can exist at once.\n- **`&mut T`** — an exclusive (read-write) borrow. **At most one** at a time, and nothing else may read it meanwhile.",
            "That single rule — *aliasing XOR mutation* — is what eliminates data races. A data race needs two writers, or a writer and a reader, at the same time. Rust forbids exactly that shape, statically.",
            "> **The line to remember:** many readers, or one writer. Never both.",
          ],
        },
        {
          type: "code",
          title: "src/main.rs",
          source: String.raw`fn describe(walker: &str) -> String {
    format!("walker: {walker}")
}

fn rename(name: &mut String) {
    name.push_str(" (verified)");
}

fn main() {
    let walker = String::from("Mochi");
    let a = describe(&walker);   // shared borrow
    let b = describe(&walker);   // another one — fine

    let mut owned = walker.clone();
    rename(&mut owned);          // exclusive borrow ends at the call

    println!("{a} | {b} | {owned}");
}`,
          caption: "`describe` borrows immutably; `rename` borrows mutably. The mutable borrow ends the moment the call returns, so the later `println!` is legal.",
        },
        {
          type: "quiz",
          q: "How many `&mut` borrows of the same value can be alive at once?",
          choices: [
            "Exactly one",
            "As many as you like, as long as you don't read through them",
            "Two, one per thread",
            "Unlimited in single-threaded code",
          ],
          answer: 0,
          explain: "One exclusive borrow, period. That's what makes `&mut` safe to hand to another thread: if only one mutable reference can exist, no two threads can be writing through different pointers to the same data.",
          nudge: "The rule is *aliasing XOR mutation* — no exceptions.",
        },
        {
          type: "text",
          md: [
            "## The borrow ends where it's last used",
            "Older Rust required a borrow to end at the closing brace. Since **non-lexical lifetimes** (2018), a borrow ends at its **last use**, which is why this compiles:",
            "```",
            "let mut v = vec![1, 2, 3];",
            "let first = &v[0];",
            "println!(\"{first}\");   // last use of the borrow",
            "v.push(4);              // mutable borrow — legal",
            "```",
            "This is the single most useful ergonomic change Rust has shipped: the checker reasons about *what you actually do*, not about braces.",
          ],
        },
        {
          type: "exercise",
          title: "Borrow instead of take",
          prompt: [
            "`greeting` takes a `String` by value, which means callers lose their string. Change it to accept a **borrowed** `&str` so the caller keeps ownership.",
            "Keep the body working — `format!` works the same with a `&str`.",
          ],
          starter: String.raw`fn greeting(name: String) -> String {
    format!("Hello, {}", name)
}

fn main() {
    let name = String::from("Mochi");
    println!("{}", greeting(&name));
    println!("{}", name);
}`,
          solution: String.raw`fn greeting(name: &str) -> String {
    format!("Hello, {}", name)
}

fn main() {
    let name = String::from("Mochi");
    println!("{}", greeting(&name));
    println!("{}", name);
}`,
          checks: [
            { re: /fn greeting\(name:&str\)->String/, hint: "The parameter becomes `name: &str` — borrow, don't take ownership." },
            { re: /format!\("Hello,\{\}",name\)/, hint: "The body doesn't change: `format!(\"Hello, {}\", name)` works for `&str` too." },
          ],
          mustNot: [
            { re: /name:String/, hint: "Taking `String` by value moves it out of the caller. Use `&str`." },
          ],
          success: "Accepting `&str` instead of `String` is the single most common Rust API review comment. Now you write it by reflex.",
        },
      ],
    },
    {
      id: "slices-strings",
      title: "String vs &str, and slices",
      steps: [
        {
          type: "text",
          md: [
            "## Two string types, one job each",
            "- **`String`** — owned, growable, heap-allocated. UTF-8. You own it, you can mutate it.\n- **`&str`** — a borrowed view into string data someone else owns. A `&str` is a pointer plus a length; copying it is free.",
            "So: **function parameters take `&str`; structs that own text store `String`.** A `&str` parameter accepts both `&String` and string literals, which is why it's the flexible choice.",
            "## Slices are the same idea for any sequence",
            "`&v[1..3]` is a **slice** — a borrowed view into part of a `Vec`, array, or string. It's a pointer plus a length stored on the stack; no copy of the elements.",
          ],
        },
        {
          type: "code",
          title: "src/main.rs",
          source: String.raw`fn first_word(s: &str) -> &str {
    match s.find(' ') {
        Some(i) => &s[..i],
        None => s,
    }
}

fn main() {
    let owned = String::from("Mochi walks dogs");
    let literal = "Rex runs fast";

    let scores = [10, 20, 30, 40];
    let middle = &scores[1..3];

    println!("{} | {} | {:?}", first_word(&owned), first_word(literal), middle);
}`,
          caption: "`first_word` returns a slice of its input — no allocation, no copy. The returned `&str` borrows from `s`, so the compiler ties its lifetime to the input.",
        },
        {
          type: "quiz",
          q: "Why is `fn first_word(s: &str) -> &str` allowed to return a borrow of `s`?",
          choices: [
            "Elision: with one input lifetime, the output is tied to it automatically",
            "Because `&str` is `Copy`",
            "Because the string literal is static",
            "It isn't — you must always write an explicit lifetime",
          ],
          answer: 0,
          explain: "Lifetime **elision** covers this exact case: one input reference and one output reference means the output borrows from the input. You only write lifetimes when there is genuine ambiguity (multiple inputs, or a struct holding a reference).",
          nudge: "One input reference, one output reference. The compiler can infer the link.",
        },
        {
          type: "text",
          md: [
            "## Non-UTF-8 boundaries are a runtime check",
            "Rust strings are UTF-8, so slicing by **byte index** panics if you split in the middle of a multi-byte character: `&\"á\"[0..1]` panics. For user-facing text, iterate characters or use `char_indices()`.",
            "**Production habit:** `&str` for input, `String` for storage, and `Cow<'_, str>` when a function sometimes needs to allocate and sometimes doesn't. If you see `to_string()` in a hot path, ask whether a `&str` would do.",
          ],
        },
        {
          type: "exercise",
          title: "Return a slice, not an allocation",
          prompt: [
            "Implement `first_word(s: &str) -> &str`: the text before the first space, or the whole string if there is no space.",
            "Use `split_whitespace()` (or `split`) — and return a **slice**. Don't allocate a `String`.",
          ],
          starter: String.raw`fn first_word(s: &str) -> &str {
    // your code here
}

fn main() {
    println!("{}", first_word("Mochi walks dogs"));
}`,
          solution: String.raw`fn first_word(s: &str) -> &str {
    s.split_whitespace().next().unwrap_or("")
}`,
          checks: [
            { re: /fn first_word\(s:&str\)->&str/, hint: "Keep the signature: `fn first_word(s: &str) -> &str`." },
            { re: /s\.split/, hint: "Split the input: `s.split_whitespace()` or `s.split(' ')`." },
            { re: /unwrap_or\(""\)|unwrap\(\)/, hint: "Turn the `Option<&str>` into a `&str` with `unwrap_or(\"\")` (or `unwrap()`)." },
          ],
          mustNot: [
            { re: /to_string\(\)/, hint: "That allocates. Return the slice instead — `&str` is free to copy." },
          ],
          success: "Returning `&str` instead of `String` is the difference between an allocation per call and none. This is the shape you want in a parser.",
        },
      ],
    },
  ],
});
