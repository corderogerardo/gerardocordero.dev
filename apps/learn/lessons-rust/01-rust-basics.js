window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-basics",
  title: "Rust Basics",
  emoji: "🔤",
  lang: "rust",
  lessons: [
    {
      id: "variables",
      title: "Variables, mutability & shadowing",
      steps: [
        {
          type: "text",
          md: [
            "## Immutable by default",
            "In Swift you choose between `let` and `var`. In Go you choose between `var` and `:=`. Rust flips the default: **every binding is immutable unless you write `mut`.**",
            "```",
            "let name = \"Mochi\";   // immutable",
            "let mut bookings = 0;  // mutable",
            "bookings += 1;         // fine",
            "```",
            "Try to reassign `name` and you get a compile error, not a warning. That sounds annoying until you notice how many bugs are *\"something reassigned this and I didn't see where\"*.",
            "> **Pitch line:** `let` is the default, so mutability is a decision you make explicitly, at the declaration, in review.",
          ],
        },
        {
          type: "code",
          title: "src/main.rs",
          source: String.raw`fn main() {
    let walker_name = "Mochi";
    let mut bookings = 0;

    bookings += 1;
    bookings += 1;

    // Shadowing: a NEW binding, same name, new type.
    let walker_name = walker_name.len();

    println!("{} bookings for a {} character name", bookings, walker_name);
}`,
          caption: "The second `let walker_name` **shadows** the first. It is not a mutation — it is a new variable that happens to reuse the name, and it may have a different type.",
        },
        {
          type: "quiz",
          q: "What does shadowing (`let x = …; let x = …;`) actually do?",
          choices: [
            "Creates a new binding that hides the old one; the old value is still there until it drops",
            "Mutates the existing binding in place",
            "Frees the old value immediately and reuses its memory",
            "Only works for numbers",
          ],
          answer: 0,
          explain: "Shadowing creates a **new** variable. The previous one still owns its value and is dropped at the end of its scope. That's why you can shadow into a different type — `walker_name` goes from `&str` to `usize` — which a mutation could never do.",
          nudge: "The name is reused. Is the *variable* reused?",
        },
        {
          type: "text",
          md: [
            "## Types are inferred, but they are not optional",
            "Rust infers types the way Swift and Go do — `let n = 5;` gives `i32` — but inference is **local and complete at compile time**. There is no dynamic typing anywhere. When inference can't decide, the compiler asks you to annotate.",
            "The integer types you'll actually use: **`i32`** (the default, signed 32-bit), **`u32`** (unsigned — money in cents, counts), **`u64`** (ids from databases), **`usize`** (indexes and lengths). Floats: `f64`. Text: `char` is a single Unicode scalar (`'a'`), `String` is owned text, `&str` is a borrowed view — that distinction is module 02.",
            "**Red flag:** `as` casts truncate silently. `300u32 as u8` is `44`. In production code, prefer `u32::try_from(x)?` when the value comes from outside your program.",
          ],
        },
        {
          type: "code",
          title: "src/main.rs — the types you'll live in",
          source: String.raw`fn main() {
    let price_cents: u32 = 1800;
    let rating: f64 = 4.8;
    let is_available: bool = true;
    let initial: char = 'M';
    let walker_id: u64 = 42;
    let index: usize = 0;

    println!("{price_cents} {rating} {is_available} {initial} {walker_id} {index}");
}`,
          caption: "`{price_cents}` is inline format-argument capture — since Rust 2021 you can name variables directly inside `println!` instead of repeating them as arguments.",
        },
        {
          type: "exercise",
          title: "Make the booking count mutable",
          prompt: [
            "This program should print `Mochi has 1 bookings`, but it doesn't compile: `bookings` is immutable and `+=` needs `mut`.",
            "Add `mut` where it belongs, then increment `bookings` by one before the `println!`.",
          ],
          starter: String.raw`fn main() {
    let walker_name = "Mochi";
    let bookings = 0;

    // your code here

    println!("{} has {} bookings", walker_name, bookings);
}`,
          solution: String.raw`fn main() {
    let walker_name = "Mochi";
    let mut bookings = 0;
    bookings += 1;

    println!("{} has {} bookings", walker_name, bookings);
}`,
          checks: [
            { re: /let mut bookings=0;/, hint: "`bookings` is reassigned, so the binding needs `mut`: `let mut bookings = 0;`." },
            { re: /bookings\+=1;/, hint: "Increment it with `bookings += 1;` before the `println!`." },
          ],
          success: "Mutability is now an explicit decision at the declaration — exactly where a reviewer can see it.",
        },
      ],
    },
    {
      id: "functions-control",
      title: "Functions & control flow",
      steps: [
        {
          type: "text",
          md: [
            "## The last expression is the return value",
            "A Rust function body is a **block**, and a block evaluates to its last expression — provided that expression has no trailing semicolon. Add a semicolon and you turn the value into `()` (the unit type), which usually produces a type error that confuses beginners.",
            "```",
            "fn double(n: i32) -> i32 {",
            "    n * 2        // value of the block",
            "}",
            "```",
            "`return n * 2;` also works, and is idiomatic for early exits. What you should *not* do is write `return` at the end of every function — in Rust the expression form is the readable default.",
          ],
        },
        {
          type: "code",
          title: "src/main.rs",
          source: String.raw`fn double(n: i32) -> i32 {
    n * 2
}

fn price_label(cents: u32) -> String {
    if cents == 0 {
        return String::from("free");
    }
    format!("{} / 30 min", cents / 100)
}

fn main() {
    println!("{} {}", double(21), price_label(1800));
}`,
          caption: "Two functions, two return styles: the expression form for the happy path, `return` for the early exit. Both are idiomatic.",
        },
        {
          type: "quiz",
          q: "`fn double(n: i32) -> i32 { n * 2; }` — why does this fail to compile?",
          choices: [
            "The trailing `;` makes the block evaluate to `()`, not `i32`",
            "`n * 2` needs parentheses",
            "Functions can't return expressions",
            "`i32` must be written as `Int32`",
          ],
          answer: 0,
          explain: "A semicolon discards the value and makes the block evaluate to `()`. The compiler then reports a type mismatch: expected `i32`, found `()`. Remove the `;` — or add `return`.",
          nudge: "What does a statement with a semicolon evaluate to?",
        },
        {
          type: "text",
          md: [
            "## Control flow is an expression too",
            "`if` is an expression in Rust, so it can produce a value: `let label = if n == 0 { \"free\" } else { \"paid\" };`. Both arms must have the same type.",
            "Loops come in three flavours: **`loop`** (infinite, `break` can return a value), **`while`** (condition), and **`for`** (iterate anything implementing `IntoIterator` — ranges, vectors, maps). You will almost always want `for`.",
            "`0..5` is a range: `0,1,2,3,4`. `0..=5` includes `5`. Ranges are values, so they compose with iterators — that's module 06.",
          ],
        },
        {
          type: "code",
          title: "src/main.rs — control flow",
          source: String.raw`fn main() {
    let slots = 3;
    let status = if slots > 0 { "available" } else { "booked" };

    let mut total = 0;
    for n in 1..=4 {
        total += n;
    }

    let mut attempts = 0;
    let found = loop {
        attempts += 1;
        if attempts == 3 {
            break attempts; // break can carry a value out of loop
        }
    };

    println!("{status} {total} {found}");
}`,
          caption: "`if` produces a value, `for` walks a range, and `loop` + `break value` is Rust's idiomatic retry-with-result construct.",
        },
        {
          type: "exercise",
          title: "Availability as an expression",
          prompt: [
            "Write `is_available(slots: u32) -> bool`. A walker is available when they have at least one open slot.",
            "Use the expression form — the body should be a single comparison, no `if` needed.",
          ],
          starter: String.raw`fn is_available(slots: u32) -> bool {
    // your code here
}

fn main() {
    println!("{}", is_available(3));
}`,
          solution: String.raw`fn is_available(slots: u32) -> bool {
    slots > 0
}`,
          checks: [
            { re: /fn is_available\(slots:u32\)->bool/, hint: "Keep the signature: `fn is_available(slots: u32) -> bool`." },
            { re: /slots>0/, hint: "Return the comparison itself: `slots > 0`." },
          ],
          success: "One expression, no ceremony. That's how most Rust predicates read.",
        },
      ],
    },
    {
      id: "compound-types",
      title: "Tuples & arrays",
      steps: [
        {
          type: "text",
          md: [
            "## Tuples: fixed, heterogeneous, cheap",
            "A tuple groups values of **different** types: `let point = (3, 4);` is `(i32, i32)`. Access with `.0`, `.1` or destructure with `let (x, y) = point;`. Tuples are the idiomatic way to return two things without inventing a struct.",
            "## Arrays: fixed, homogeneous, on the stack",
            "An array has a **compile-time length**: `let scores = [1, 2, 3];` is `[i32; 3]`. Its type includes the length, so `[i32; 3]` and `[i32; 4]` are different types and cannot be assigned to each other.",
            "When you need a growable, heap-allocated sequence, you want **`Vec<T>`** — that's module 06. Arrays are for fixed-size data: a colour's channels, a 4-byte header, a lookup table.",
          ],
        },
        {
          type: "code",
          title: "src/main.rs",
          source: String.raw`fn main() {
    let point = (3, 4);
    let (x, y) = point;
    println!("{x},{y} and {}", point.1);

    let scores = [10, 20, 30];
    let first = scores[0];
    let count = scores.len();

    let zeros = [0u8; 4]; // four zero bytes

    println!("{first} {count} {zeros:?}");
}`,
          caption: "`[0u8; 4]` is array-repeat syntax: four elements of value `0u8`. `{:?}` is the debug formatter — the quick way to print a whole collection.",
        },
        {
          type: "quiz",
          q: "What is the type of `let scores = [10, 20, 30];`?",
          choices: [
            "`[i32; 3]` — an array whose length is part of the type",
            "`Vec<i32>` — a growable vector",
            "`&[i32]` — a slice",
            "`(i32, i32, i32)` — a tuple",
          ],
          answer: 0,
          explain: "An array literal with three elements infers `[i32; 3]`. The length is in the type, which is why arrays can live on the stack with no allocation. `Vec<i32>` requires `vec![10, 20, 30]`.",
          nudge: "The brackets in the type carry a number.",
        },
        {
          type: "text",
          md: [
            "## Destructuring is a pattern, not a syntax trick",
            "`let (x, y) = point;` works because `let` takes a **pattern** on the left. The same pattern language powers `match`, `if let`, and function arguments — module 03 leans on it hard.",
            "This is the first place where Rust's design shows its hand: one pattern system reused everywhere, instead of a special syntax for each construct.",
          ],
        },
        {
          type: "exercise",
          title: "Destructure the coordinates",
          prompt: [
            "Destructure the `point` tuple into `x` and `y` with a single `let`, so the `println!` compiles.",
          ],
          starter: String.raw`fn main() {
    let point = (3, 4);

    // your code here

    println!("{} {}", x, y);
}`,
          solution: String.raw`fn main() {
    let point = (3, 4);

    let (x, y) = point;

    println!("{} {}", x, y);
}`,
          checks: [
            { re: /let\(x,y\)=point;/, hint: "Destructure in one statement: `let (x, y) = point;`." },
          ],
          success: "That same pattern syntax will show up in `match` arms and function signatures.",
        },
      ],
    },
  ],
});
