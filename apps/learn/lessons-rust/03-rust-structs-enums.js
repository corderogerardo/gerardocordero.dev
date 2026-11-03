window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-structs-enums",
  title: "Structs, Enums & Pattern Matching",
  emoji: "🧱",
  lang: "rust",
  lessons: [
    {
      id: "structs-impl",
      title: "Structs & impl blocks",
      steps: [
        {
          type: "text",
          md: [
            "## Data and behaviour, separated but named",
            "A `struct` declares fields. An `impl` block attaches functions to it. There are no classes and no inheritance — this is the whole mechanism, and it scales further than it sounds.",
            "Two kinds of function live in an `impl`:",
            "- **Methods** take `self`, `&self`, or `&mut self` as the first parameter: `fn price_label(&self) -> String`.\n- **Associated functions** take no `self` and are called with `::`: `Walker::new(...)`, the idiomatic constructor.",
            "`&self` borrows, so calling a method does not move the value. That's what lets you call ten methods in a row.",
          ],
        },
        {
          type: "code",
          title: "src/walker.rs",
          source: String.raw`#[derive(Debug, Clone, PartialEq)]
pub struct Walker {
    pub name: String,
    pub price_per_30_min_cents: u32,
}

impl Walker {
    // Associated function — the constructor convention.
    pub fn new(name: impl Into<String>, price_per_30_min_cents: u32) -> Self {
        Self { name: name.into(), price_per_30_min_cents }
    }

    // Method — borrows, never consumes.
    pub fn price_label(&self) -> String {
        format!("{} / 30 min", self.price_per_30_min_cents / 100)
    }

    pub fn raise_price(&mut self, cents: u32) {
        self.price_per_30_min_cents += cents;
    }
}`,
          caption: "`impl Into<String>` accepts both `&str` and `String` at the call site — a small ergonomic trick you'll see across the ecosystem. `Self` means the type being implemented.",
        },
        {
          type: "quiz",
          q: "What is the difference between `fn new(...) -> Self` and `fn price_label(&self) -> String`?",
          choices: [
            "`new` is an associated function called as `Walker::new`; `price_label` is a method called on a value",
            "`new` is a constructor enforced by the compiler; `price_label` is a normal method",
            "`new` is private; `price_label` is public",
            "There is no difference — both are methods",
          ],
          answer: 0,
          explain: "The presence of a `self` parameter is what makes something a *method* (called `value.method()`). Without it, it's an **associated function**, called with `Type::function()`. `new` is a convention, not a keyword.",
          nudge: "Look at the first parameter.",
        },
        {
          type: "text",
          md: [
            "## Derives are the boring superpower",
            "`#[derive(Debug, Clone, PartialEq)]` generates those trait implementations for you. In a real service you'll almost always want:",
            "- **`Debug`** — so `{:?}` works and errors are readable.\n- **`Clone`** — when the value is genuinely cheap to duplicate or you need it in two places.\n- **`PartialEq`** — so tests can `assert_eq!`.",
            "Serde's `Serialize`/`Deserialize` join that list the moment the type crosses an HTTP or database boundary — that's module 10.",
          ],
        },
        {
          type: "quiz",
          q: "A method takes `&mut self`. What is true?",
          choices: [
            "It may mutate the value, and the caller must have a mutable binding",
            "It consumes the value, so the caller loses it",
            "It copies the value first",
            "It can only be called once per program",
          ],
          answer: 0,
          explain: "`&mut self` is an exclusive borrow: the method may write, and the caller's binding must be `mut`. It does **not** consume the value — that would be `self`.",
          nudge: "Borrowed, not consumed — and writes are allowed.",
        },
        {
          type: "exercise",
          title: "Add the price label method",
          prompt: [
            "Give `Walker` a `price_label(&self) -> String` method returning text like `18 / 30 min`.",
            "Use `format!` and `self.price_per_30_min_cents / 100`.",
          ],
          starter: String.raw`pub struct Walker {
    pub price_per_30_min_cents: u32,
}

impl Walker {
    // your code here
}

fn main() {
    let w = Walker { price_per_30_min_cents: 1800 };
    println!("{}", w.price_label());
}`,
          solution: String.raw`pub struct Walker {
    pub price_per_30_min_cents: u32,
}

impl Walker {
    pub fn price_label(&self) -> String {
        format!("{} / 30 min", self.price_per_30_min_cents / 100)
    }
}

fn main() {
    let w = Walker { price_per_30_min_cents: 1800 };
    println!("{}", w.price_label());
}`,
          checks: [
            { re: /fn price_label\(&self\)->String/, hint: "The method signature is `fn price_label(&self) -> String`." },
            { re: /self\.price_per_30_min_cents\/100/, hint: "Read the field through `self` and divide by 100." },
            { re: /format!/, hint: "`format!` builds the `String`." },
          ],
          success: "Data in the struct, behaviour in the impl. That split is what keeps Rust code readable as it grows.",
        },
      ],
    },
    {
      id: "enums-match",
      title: "Enums & match",
      steps: [
        {
          type: "text",
          md: [
            "## Enums here are nothing like enums elsewhere",
            "In most languages an enum is a set of named integers. In Rust an enum is a **sum type**: each variant can carry its own data.",
            "```",
            "enum Booking {",
            "    Pending,",
            "    Confirmed { at: String },",
            "    Cancelled(String),   // reason",
            "}",
            "```",
            "This single feature replaces a lot of what other languages do with inheritance, `instanceof` chains, and nullable fields. A value is exactly one variant, and the compiler knows which data exists in each.",
            "> **Pitch line:** if your API has a status field plus three optional payload fields that are only valid for some statuses, that's an enum begging to exist.",
          ],
        },
        {
          type: "code",
          title: "src/booking.rs",
          source: String.raw`#[derive(Debug)]
pub enum Booking {
    Pending,
    Confirmed { walker: String },
    Cancelled(String),
}

pub fn describe(b: &Booking) -> String {
    match b {
        Booking::Pending => String::from("waiting for a walker"),
        Booking::Confirmed { walker } => format!("confirmed with {walker}"),
        Booking::Cancelled(reason) => format!("cancelled: {reason}"),
    }
}`,
          caption: "`match` destructures each variant and binds its data: `{ walker }` pulls a named field, `(reason)` pulls the tuple payload. No casts, no `instanceof`.",
        },
        {
          type: "quiz",
          q: "You add `Booking::Completed` to the enum. What happens to the existing `match`?",
          choices: [
            "It fails to compile: non-exhaustive patterns, and the compiler names the missing variant",
            "It compiles and silently does nothing for the new variant",
            "It panics at runtime on the new variant",
            "It falls through to the first arm",
          ],
          answer: 0,
          explain: "`match` must be **exhaustive**. Adding a variant breaks every `match` that doesn't handle it — at compile time, at every call site. That's the feature: the compiler hands you the complete list of places to update.",
          nudge: "Rust will not let you forget a case.",
        },
        {
          type: "text",
          md: [
            "## `match` is an expression with guards and bindings",
            "Arms can have guards (`n if n > 0 =>`), range patterns (`1..=5 =>`), and nested patterns (`Some(Ok(v)) =>`). Because it's an expression, `match` produces a value and every arm must have the same type.",
            "**Avoid `_ =>` in domain code.** A catch-all silently absorbs future variants and destroys the exhaustiveness benefit you just paid for. Use it for genuinely open sets (characters, raw input), not for your own enums.",
          ],
        },
        {
          type: "exercise",
          title: "Label every status",
          prompt: [
            "Implement `label` for the three-variant enum. Each variant maps to a lowercase string: `pending`, `confirmed`, `cancelled`.",
            "Use `match`. Every arm must be covered — no `_` catch-all.",
          ],
          starter: String.raw`pub enum BookingStatus {
    Pending,
    Confirmed,
    Cancelled,
}

pub fn label(status: &BookingStatus) -> &'static str {
    // your code here
}`,
          solution: String.raw`pub enum BookingStatus {
    Pending,
    Confirmed,
    Cancelled,
}

pub fn label(status: &BookingStatus) -> &'static str {
    match status {
        BookingStatus::Pending => "pending",
        BookingStatus::Confirmed => "confirmed",
        BookingStatus::Cancelled => "cancelled",
    }
}`,
          checks: [
            { re: /match status\{/, hint: "`match` on the value: `match status {`." },
            { re: /BookingStatus::Confirmed=>"confirmed"/, hint: "Name the variant fully and map it: `BookingStatus::Confirmed => \"confirmed\"`." },
            { re: /BookingStatus::Cancelled=>"cancelled"/, hint: "The third arm: `BookingStatus::Cancelled => \"cancelled\"`." },
          ],
          mustNot: [
            { re: /_=>/, hint: "No catch-all. The whole point is that the compiler lists the variants for you." },
          ],
          success: "Exhaustive match, no default arm. Add a variant tomorrow and the compiler will point at this function.",
        },
      ],
    },
    {
      id: "option-result",
      title: "Option & Result",
      steps: [
        {
          type: "text",
          md: [
            "## Null, but you can't forget it",
            "`Option<T>` is an enum: `Some(T)` or `None`. There is no null anywhere in Rust, so an absence is always visible in the type.",
            "`Result<T, E>` is the same idea for failure: `Ok(T)` or `Err(E)`. Together these two enums replace null, exceptions, and sentinel return values — one mechanism, checked by the same exhaustiveness rule you just used.",
            "`if let` and `while let` are the shorthand for \"I only care about one variant\":",
            "```",
            "if let Some(walker) = walkers.first() {",
            "    println!(\"{}\", walker.name);",
            "}",
            "```",
          ],
        },
        {
          type: "code",
          title: "src/lookup.rs",
          source: String.raw`pub fn find_walker(id: u64, ids: &[u64]) -> Option<usize> {
    ids.iter().position(|candidate| *candidate == id)
}

pub fn parse_price(raw: &str) -> Result<u32, std::num::ParseIntError> {
    raw.trim().parse::<u32>()
}

fn main() {
    let ids = [10, 20, 30];

    if let Some(index) = find_walker(20, &ids) {
        println!("found at {index}");
    }

    match parse_price("1800") {
        Ok(cents) => println!("{cents}"),
        Err(err) => println!("bad input: {err}"),
    }
}`,
          caption: "`position` returns `Option<usize>` because the value may not exist. `parse` returns `Result` because the input may not be a number. Neither can be ignored: the value you want is inside.",
        },
        {
          type: "quiz",
          q: "What does `Option<usize>` communicate that `usize` with a sentinel like `-1` cannot?",
          choices: [
            "That absence is a real case the caller must handle, enforced by the compiler",
            "That the value is stored on the heap",
            "That the value can be null at runtime",
            "Nothing — it's equivalent",
          ],
          answer: 0,
          explain: "With a sentinel, forgetting to check is a silent bug. With `Option`, forgetting is a compile error, and the type documents the possibility at every call site. There is no null pointer to dereference.",
          nudge: "Who enforces the check?",
        },
        {
          type: "text",
          md: [
            "## Combinators instead of pyramids",
            "You don't have to `match` every time. `Option` and `Result` carry methods that compose: `map`, `and_then`, `unwrap_or`, `unwrap_or_else`, `ok_or`, `filter`.",
            "```",
            "let cents = parse_price(raw).ok()?;          // Option<u32>",
            "let label = cents.map(|c| c / 100).unwrap_or(0);",
            "```",
            "The rule of thumb: **`match` when the branches differ in behaviour; combinators when you're transforming a value.** Nested matches are usually a missing combinator.",
          ],
        },
        {
          type: "exercise",
          title: "Find the walker",
          prompt: [
            "Implement `find_walker`: return the **index** of `id` inside `ids`, or `None` if it isn't there.",
            "Use `iter().position(...)` — no manual loop needed.",
          ],
          starter: String.raw`pub fn find_walker(id: u64, ids: &[u64]) -> Option<usize> {
    // your code here
}

fn main() {
    println!("{:?}", find_walker(20, &[10, 20, 30]));
}`,
          solution: String.raw`pub fn find_walker(id: u64, ids: &[u64]) -> Option<usize> {
    ids.iter().position(|candidate| *candidate == id)
}

fn main() {
    println!("{:?}", find_walker(20, &[10, 20, 30]));
}`,
          checks: [
            { re: /fn find_walker\(id:u64,ids:&\[u64\]\)->Option<usize>/, hint: "Keep the signature: it returns `Option<usize>`, because the id may not be present." },
            { re: /\.position\(/, hint: "`position` on an iterator gives you exactly this: the index of the first match." },
            { re: /==id|\*candidate==id/, hint: "Compare the element with `id` — remember `iter()` yields references." },
          ],
          success: "Returning `Option` instead of `-1` means the caller cannot silently treat a missing walker as index zero.",
        },
      ],
    },
  ],
});
