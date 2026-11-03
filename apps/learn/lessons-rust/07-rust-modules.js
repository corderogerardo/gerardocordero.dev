window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-modules",
  title: "Modules, Crates & Testing",
  emoji: "📦",
  lang: "rust",
  lessons: [
    {
      id: "modules",
      title: "Modules & visibility",
      steps: [
        {
          type: "text",
          md: [
            "## Everything is private until you say otherwise",
            "A Rust project is a tree of **modules**. `mod walker;` declares a module; the body lives in `src/walker.rs` or `src/walker/mod.rs`. Items inside are private to that module and its children unless marked `pub`.",
            "Visibility is granular: `pub` (everyone), `pub(crate)` (this crate only), `pub(super)` (the parent module). The default — private — is what makes refactoring safe: if it isn't `pub`, you can change it without looking for callers.",
            "> **Pitch line:** the module tree is the API. If a type isn't reachable from `lib.rs`, it isn't part of your contract.",
          ],
        },
        {
          type: "code",
          title: "src/main.rs + src/walker.rs",
          source: String.raw`// src/main.rs
mod walker;

use walker::Walker;

fn main() {
    let w = Walker::new("Mochi", 1800);
    println!("{}", w.name);
}

// src/walker.rs
pub struct Walker {
    pub name: String,
    price_per_30_min_cents: u32, // private: nobody outside sets it directly
}

impl Walker {
    pub fn new(name: &str, price_per_30_min_cents: u32) -> Self {
        Self { name: name.to_string(), price_per_30_min_cents }
    }

    pub fn price_label(&self) -> String {
        format!("{} / 30 min", self.price_per_30_min_cents / 100)
    }
}`,
          caption: "`price_per_30_min_cents` is private while `name` is public. The constructor is the only way in, so the invariant (price is always valid) can be enforced in one place.",
        },
        {
          type: "quiz",
          q: "A struct field has no `pub`. Who can read it?",
          choices: [
            "Only code in the same module and its descendants",
            "Anyone in the crate",
            "Anyone, because fields default to public",
            "Nobody, not even the module itself",
          ],
          answer: 0,
          explain: "Fields default to private to the module where the struct is defined (and its child modules). Other modules — even in the same crate — cannot touch it without a getter or a `pub` marker.",
          nudge: "Private means module-private, not crate-private.",
        },
        {
          type: "text",
          md: [
            "## The layout convention",
            "```",
            "src/",
            "  main.rs        // or lib.rs",
            "  walker.rs      // mod walker;",
            "  booking.rs     // mod booking;",
            "```",
            "A directory with `mod.rs` is the older style; the modern form is `walker.rs` next to a `walker/` directory for children. Both work — pick one and stay consistent.",
            "Use `use` to shorten paths (`use walker::Walker;`) and `pub use` to **re-export**, which is how a crate presents a curated public API from internal module structure.",
          ],
        },
        {
          type: "exercise",
          title: "Add a public constructor",
          prompt: [
            "`walker::Walker` exists but there's no way to build one from outside the module.",
            "Add an `impl` with `pub fn new(name: &str) -> Walker`.",
          ],
          starter: String.raw`mod walker {
    pub struct Walker {
        pub name: String,
    }

    // your code here
}

fn main() {
    let w = walker::Walker::new("Mochi");
    println!("{}", w.name);
}`,
          solution: String.raw`mod walker {
    pub struct Walker {
        pub name: String,
    }

    impl Walker {
        pub fn new(name: &str) -> Walker {
            Walker { name: name.to_string() }
        }
    }
}

fn main() {
    let w = walker::Walker::new("Mochi");
    println!("{}", w.name);
}`,
          checks: [
            { re: /impl Walker\{/, hint: "Open an `impl Walker { … }` block inside the module." },
            { re: /pub fn new\(name:&str\)->Walker/, hint: "The constructor must be `pub`: `pub fn new(name: &str) -> Walker`." },
            { re: /name\.to_string\(\)/, hint: "`&str` does not become `String` automatically — call `name.to_string()`." },
          ],
          success: "Construction goes through one `pub` function, so the type can't be created in an invalid state from outside.",
        },
      ],
    },
    {
      id: "crates-workspace",
      title: "Crates, workspaces & features",
      steps: [
        {
          type: "text",
          md: [
            "## Crate, package, module — three words people mix up",
            "- **Crate** — a compilation unit. The thing `rustc` compiles.\n- **Package** — a `Cargo.toml` plus its sources. It can produce one library crate and several binary crates.\n- **Module** — a namespace inside a crate (`mod walker;`).",
            "A **workspace** is several packages sharing one `target/` directory and one `Cargo.lock`. This is what you want for a real service: `api/`, `domain/`, `db/` as separate packages, compiled together, with shared dependency versions.",
          ],
        },
        {
          type: "code",
          title: "Cargo.toml (workspace root)",
          source: String.raw`[workspace]
members = ["api", "domain", "db"]
resolver = "2"

[workspace.dependencies]
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["full"] }

# api/Cargo.toml
[package]
name = "pawwalk-api"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { workspace = true }
tokio = { workspace = true }
domain = { path = "../domain" }`,
          caption: "`workspace.dependencies` centralises versions — members opt in with `{ workspace = true }`. One `Cargo.lock`, one `target/`, one place to bump a dependency.",
        },
        {
          type: "quiz",
          q: "What does a workspace actually give you?",
          choices: [
            "One shared lockfile and target directory across several packages",
            "Automatic code sharing between packages",
            "A single binary output",
            "Faster runtime performance",
          ],
          answer: 0,
          explain: "A workspace unifies the build: one `Cargo.lock`, one `target/`, consistent dependency versions. It does **not** share code automatically — packages must depend on each other explicitly with `path = \"../domain\"`.",
          nudge: "Think about the build directory and the lockfile.",
        },
        {
          type: "text",
          md: [
            "## Feature flags: conditional compilation that composes",
            "`features` let a dependency or your own crate compile extra code only when asked:",
            "```",
            "[features]",
            "default = [\"json\"]",
            "json = [\"dep:serde_json\"]",
            "metrics = []",
            "```",
            "Two rules keep this sane: **features must be additive** (enabling one never breaks another), and **`default` should be the safe, common set**. A feature that changes behaviour rather than adding capability is a trap for downstream users.",
          ],
        },
        {
          type: "exercise",
          title: "Which command runs the tests?",
          prompt: [
            "This one is about the toolchain rather than typing code: write the cargo subcommand that compiles and runs every test in the workspace, including doctests.",
            "Put the single command in the function body as a comment-free expression is not possible — instead, type the command as a Rust string literal assigned to `let cmd = \"…\";`.",
          ],
          starter: String.raw`fn main() {
    // Replace the empty string with the cargo subcommand that runs tests.
    let cmd = "";
    println!("{cmd}");
}`,
          solution: String.raw`fn main() {
    let cmd = "cargo test";
    println!("{cmd}");
}`,
          checks: [
            { re: /"cargo test"/, hint: "The subcommand is `cargo test`." },
          ],
          success: "`cargo test` builds the crate in test mode and runs unit tests, integration tests under `tests/`, and doctests in one go.",
        },
      ],
    },
    {
      id: "testing",
      title: "Unit, integration & doctests",
      steps: [
        {
          type: "text",
          md: [
            "## Tests live next to the code",
            "`#[cfg(test)]` marks a module that only compiles for tests. Inside it, `#[test]` marks a function; `cargo test` runs every one it finds.",
            "```",
            "#[cfg(test)]",
            "mod tests {",
            "    use super::*;",
            "    #[test]",
            "    fn adds_two_numbers() {",
            "        assert_eq!(add(2, 3), 5);",
            "    }",
            "}",
            "```",
            "Three assertion macros cover most needs: **`assert!`**, **`assert_eq!`**, and **`assert_ne!`**. A panic is a test failure.",
          ],
        },
        {
          type: "code",
          title: "src/lib.rs + tests/api.rs",
          source: String.raw`// src/lib.rs — unit test, same file as the code
pub fn price_cents(dollars: u32) -> u32 {
    dollars * 100
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn converts_dollars_to_cents() {
        assert_eq!(price_cents(18), 1800);
    }

    #[test]
    #[should_panic]
    fn rejects_negative_impossible_input() {
        let _ = price_cents(0) / 0;
    }
}

// tests/api.rs — integration test: uses the crate as a dependency
use pawwalk_api::price_cents;

#[test]
fn integration_uses_the_public_api() {
    assert_eq!(price_cents(1), 100);
}`,
          caption: "Unit tests see private items via `use super::*`. Integration tests live in `tests/` and can only touch your public API — which is exactly the boundary you want to verify.",
        },
        {
          type: "quiz",
          q: "What is the difference between `#[cfg(test)] mod tests` and a file in `tests/`?",
          choices: [
            "The unit test module sees private items; `tests/` compiles against the public API only",
            "`tests/` runs faster",
            "Unit tests cannot use assertions",
            "There is no difference",
          ],
          answer: 0,
          explain: "The inline module is compiled as part of your crate, so it can reach private functions. Files in `tests/` are separate crates that link your library — they exercise exactly the surface your users get.",
          nudge: "One is inside the crate, the other imports it.",
        },
        {
          type: "text",
          md: [
            "## Doctests are tests too",
            "A fenced code block in a doc comment is compiled and run by `cargo test`:",
            "```",
            "/// Add two numbers.",
            "///",
            "/// ```",
            "/// assert_eq!(pawwalk_api::add(2, 3), 5);",
            "/// ```",
            "pub fn add(a: i32, b: i32) -> i32 { a + b }",
            "```",
            "This is why the standard library's examples never rot: the documentation **is** the test suite.",
          ],
        },
        {
          type: "exercise",
          title: "Write the first test",
          prompt: [
            "Add a test module that verifies `add(2, 3) == 5`.",
            "Mark it `#[cfg(test)]`, import with `use super::*;`, and use `assert_eq!`.",
          ],
          starter: String.raw`pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

// your code here`,
          solution: String.raw`pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds_two_numbers() {
        assert_eq!(add(2, 3), 5);
    }
}`,
          checks: [
            { re: /#\[cfg\(test\)\]/, hint: "Gate the module so it only compiles for tests: `#[cfg(test)]`." },
            { re: /#\[test\]/, hint: "Mark the function with `#[test]`." },
            { re: /assert_eq!\(add\(2,3\),5\)/, hint: "Assert the behaviour: `assert_eq!(add(2, 3), 5);`." },
          ],
          success: "That is the whole testing ceremony: one attribute, one module, one assertion. `cargo test` finds it.",
        },
      ],
    },
  ],
});
