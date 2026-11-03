window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-welcome",
  title: "Welcome to Rust",
  emoji: "🦀",
  lang: "rust",
  lessons: [
    {
      id: "why-rust",
      title: "Why Rust",
      steps: [
        {
          type: "text",
          md: [
            "## The language that refuses to let you ship a data race",
            "In the Go course you built the PawWalk server. Go made concurrency *easy* — `go func()` and you're done. Rust makes concurrency **safe at compile time**: the same code that would race in another language simply does not build here.",
            "That's the pitch, and it's real. Rust gives you **C++-level performance with no garbage collector**, because memory is freed deterministically the moment its owner goes out of scope. No GC pauses. No `malloc`/`free` to get wrong. The compiler proves the lifetime for you.",
            "> **The one-sentence pitch:** Rust makes whole classes of bugs — use-after-free, double-free, data races, iterator invalidation — *compile errors* instead of 3 a.m. production incidents.",
          ],
        },
        {
          type: "text",
          md: [
            "## Where it actually runs",
            "- **Cloud infrastructure** — AWS Firecracker (the microVM behind Lambda), Cloudflare Workers' runtime pieces, and much of the Linux kernel's new code.\n- **Databases and proxies** — TiKV, Materialize, Linkerd, Deno's core.\n- **CLIs** — ripgrep, fd, bat, uv, ruff. If a tool replaced something you used daily in the last five years, there's a decent chance it's Rust.\n- **Product backends** — Discord, Dropbox, and Shopify run Rust services in production at very large scale.",
            "The reason is always one of three: **speed**, **memory**, or **correctness under concurrency**. Usually all three.",
          ],
        },
        {
          type: "code",
          title: "src/main.rs — a taste of what's coming",
          source: String.raw`#[derive(Debug)]
struct Walker {
    name: String,
    price_per_30_min_cents: u32,
}

impl Walker {
    fn price_label(&self) -> String {
        format!("{} / 30 min", self.price_per_30_min_cents / 100)
    }
}

fn main() {
    let walker = Walker {
        name: String::from("Mochi"),
        price_per_30_min_cents: 1800,
    };
    println!("{}: {}", walker.name, walker.price_label());
}`,
          caption: "`impl` blocks attach behaviour to a type, `&self` borrows it instead of copying it, and `format!` builds a `String` without touching memory you don't own. Every line here is explained by module 03.",
        },
        {
          type: "quiz",
          q: "Rust has no garbage collector. How does it free memory?",
          choices: [
            "Deterministically, when the owner of the value goes out of scope",
            "A background thread sweeps it periodically",
            "Every allocation is freed at program exit",
            "The operating system reclaims it when the process idles",
          ],
          answer: 0,
          explain: "Rust uses **ownership** plus **drop**: when the variable that owns a heap allocation leaves scope, the value is dropped and its memory freed, right there, deterministically. No runtime, no pauses, no manual `free`.",
          nudge: "Think about what happens at the closing brace of a function.",
        },
        {
          type: "text",
          md: [
            "## The cost, stated honestly",
            "The borrow checker will reject code that would work in other languages — and that's the point, but it *is* friction at first. You will fight it in module 02. Then something clicks and you stop fighting it, because the errors are the compiler telling you where your data flow was ambiguous.",
            "A useful mental model: **Rust makes you design ownership before you write logic.** In dynamic languages you design the logic and discover ownership at runtime. One order produces a data race; the other produces a compile error.",
            "**Red flag:** if you reach for `clone()` to silence the compiler, stop. That's the Rust equivalent of `.unwrap()` in production: it compiles, it runs, and it hides the design question you haven't answered.",
          ],
        },
        {
          type: "quiz",
          q: "Which of these does Rust catch at COMPILE time that Go catches at runtime or not at all?",
          choices: [
            "Two threads mutating the same data without synchronisation",
            "A misspelled function name",
            "A type mismatch in an argument",
            "A missing return statement",
          ],
          answer: 0,
          explain: "Go and Rust both catch typos, type mismatches, and missing returns at compile time. Data races are different: Go's race detector finds them **at runtime**, and only on the paths you actually exercised. Rust's `Send`/`Sync` rules reject the program at compile time, on every path, whether or not you wrote a test for it.",
          nudge: "Three of these are ordinary static checks almost every typed language does. One of them is Rust's whole reason to exist.",
        },
      ],
    },
    {
      id: "toolchain",
      title: "Cargo & the toolchain",
      steps: [
        {
          type: "text",
          md: [
            "## One tool to rule the build",
            "Go shipped `go build`, `go test`, and `go mod` in one binary, and that was a revolution. Rust does the same with **cargo**, but goes further: cargo is also the **package registry client**, the **workspace manager**, the **test runner**, and the thing that runs your linters.",
            "The four commands you'll type forever:",
            "- **`cargo new pawwalk-api`** — scaffold a binary crate (`--lib` for a library).\n- **`cargo run`** — compile and execute.\n- **`cargo test`** — build and run every `#[test]`, including doctests.\n- **`cargo clippy`** — the linter. It is not optional in a real project; treat its warnings as review comments.",
            "Two more worth memorising: **`cargo fmt`** (formatting is not a debate in Rust — one canonical style) and **`cargo build --release`** (optimised build; debug builds are deliberately slow and checked).",
          ],
        },
        {
          type: "code",
          title: "Cargo.toml + src/main.rs",
          source: String.raw`# Cargo.toml
[package]
name = "pawwalk-api"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"

# src/main.rs
fn main() {
    println!("PawWalk API starting…");
}`,
          caption: "`Cargo.toml` is the manifest: package metadata plus dependencies. `edition = \"2021\"` selects the language edition (like a language version), not the compiler version.",
        },
        {
          type: "text",
          md: [
            "## `result` and `Option` are not exceptions",
            "Before you write a single function, internalise this: **Rust has no exceptions.** Anything that can fail returns `Result<T, E>`, and anything that can be absent returns `Option<T>`. The compiler forces you to handle both — you cannot *forget* to check, because the value you want is wrapped inside.",
            "```",
            "let n: Option<u32> = Some(3);",
            "let r: Result<u32, String> = Ok(3);",
            "```",
            "This is why Rust code has no `try` block around half its body. The failure path is in the type, visible at every call site.",
          ],
        },
        {
          type: "quiz",
          q: "A function returns `Result<Walker, DbError>`. What must the caller do?",
          choices: [
            "Handle it — with `match`, `?`, `unwrap`, or an explicit conversion — before using the `Walker`",
            "Nothing: errors propagate automatically like exceptions",
            "Catch it in a `try { } catch { }` block",
            "Declare `throws` on the calling function",
          ],
          answer: 0,
          explain: "`Result` is an ordinary enum value. The `Walker` is *inside* it; you cannot touch it without going through `match`, `if let`, `?`, or `unwrap`. The compiler guarantees you made a deliberate choice about the error.",
          nudge: "The value you want is wrapped. Can you reach it without opening the wrapper?",
        },
        {
          type: "exercise",
          title: "Your first real function",
          prompt: [
            "PawWalk stores prices in **cents** so it never does floating-point money. Write `price_label` so it takes `cents: u32` and returns a `String` like `18.00 / 30 min`.",
            "Use `format!` (the macro that builds a `String`) and integer division. Don't worry about the cents decimals yet — `cents / 100` is enough for this one.",
          ],
          starter: String.raw`fn price_label(cents: u32) -> String {
    // your code here
}

fn main() {
    println!("{}", price_label(1800));
}`,
          solution: String.raw`fn price_label(cents: u32) -> String {
    format!("{} / 30 min", cents / 100)
}

fn main() {
    println!("{}", price_label(1800));
}`,
          checks: [
            { re: /fn price_label\(cents:u32\)->String/, hint: "The signature matters: `fn price_label(cents: u32) -> String`." },
            { re: /format!/, hint: "Build the result with `format!(\"{} / 30 min\", …)` — `println!` would print instead of returning." },
            { re: /cents\/100/, hint: "Divide the cents by 100 to get whole dollars." },
          ],
          mustNot: [
            { re: /fn price_label\([^)]*\)->String\{[^}]*price_label/, hint: "Don't call `price_label` from inside itself — implement it." },
          ],
          success: "That's the real price helper shape. Every PawWalk service in this course does its money maths in integers for exactly this reason.",
        },
      ],
    },
  ],
});
