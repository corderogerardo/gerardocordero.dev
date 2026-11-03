window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-traits-generics",
  title: "Traits, Generics & Dispatch",
  emoji: "🧩",
  lang: "rust",
  lessons: [
    {
      id: "traits",
      title: "Traits",
      steps: [
        {
          type: "text",
          md: [
            "## Interfaces, minus the inheritance",
            "A **trait** describes behaviour a type can provide. It's the closest thing Rust has to an interface, but there's no class hierarchy and no `extends` — a type implements traits independently, and you can implement a trait you own on a type you didn't write.",
            "```",
            "pub trait Priced {",
            "    fn price_cents(&self) -> u32;",
            "    fn price_label(&self) -> String {",
            "        format!(\"{} / 30 min\", self.price_cents() / 100)",
            "    }",
            "}",
            "```",
            "`price_label` has a **default implementation** built on `price_cents`. Implement the required method and you get the derived one for free — and any type can override it.",
            "> **Pitch line:** a trait is a contract plus default behaviour, and the compiler checks the contract at every call site.",
          ],
        },
        {
          type: "code",
          title: "src/pricing.rs",
          source: String.raw`pub trait Priced {
    fn price_cents(&self) -> u32;

    fn price_label(&self) -> String {
        format!("{} / 30 min", self.price_cents() / 100)
    }
}

pub struct Walker {
    pub price_per_30_min_cents: u32,
}

pub struct Boarding {
    pub nightly_cents: u32,
}

impl Priced for Walker {
    fn price_cents(&self) -> u32 {
        self.price_per_30_min_cents
    }
}

impl Priced for Boarding {
    fn price_cents(&self) -> u32 {
        self.nightly_cents
    }

    fn price_label(&self) -> String {
        format!("{} / night", self.nightly_cents / 100)
    }
}`,
          caption: "`Walker` uses the default `price_label`; `Boarding` overrides it. Both satisfy the same contract, so callers can treat them uniformly.",
        },
        {
          type: "quiz",
          q: "A trait method has a default implementation. What does an implementing type have to do?",
          choices: [
            "Only implement the methods without defaults — or override any default it wants",
            "Implement every method including the defaults",
            "Nothing at all",
            "Declare the default explicitly with `default fn`",
          ],
          answer: 0,
          explain: "Defaults are optional overrides. You must provide the required methods (no body); any method with a body is inherited unless you replace it.",
          nudge: "Defaults are there precisely so you don't have to repeat them.",
        },
        {
          type: "text",
          md: [
            "## Coherence: one implementation per type",
            "Rust enforces **coherence**: for a given trait and type, there is exactly one implementation, and it must live either in your crate or with your type. This is what makes method resolution predictable — the compiler never has to guess between two candidate impls.",
            "The practical consequence: you can add `impl std::fmt::Display for Walker` in your crate, but you cannot add it for `String`, because both the trait and the type are foreign. That's the **orphan rule**, and it exists to keep downstream code from changing meaning when a dependency updates.",
          ],
        },
        {
          type: "exercise",
          title: "Implement the contract",
          prompt: [
            "`Priced` is defined and `Walker` exists but doesn't implement it. Add the impl so `Walker` satisfies the contract.",
            "Only `price_cents` is required — let `price_label` come from the default.",
          ],
          starter: String.raw`pub trait Priced {
    fn price_cents(&self) -> u32;

    fn price_label(&self) -> String {
        format!("{} / 30 min", self.price_cents() / 100)
    }
}

pub struct Walker {
    pub price_per_30_min_cents: u32,
}

// your code here`,
          solution: String.raw`pub trait Priced {
    fn price_cents(&self) -> u32;

    fn price_label(&self) -> String {
        format!("{} / 30 min", self.price_cents() / 100)
    }
}

pub struct Walker {
    pub price_per_30_min_cents: u32,
}

impl Priced for Walker {
    fn price_cents(&self) -> u32 {
        self.price_per_30_min_cents
    }
}`,
          checks: [
            { re: /impl Priced for Walker\{/, hint: "The impl header is `impl Priced for Walker {`." },
            { re: /fn price_cents\(&self\)->u32/, hint: "Implement the required method with its exact signature." },
            { re: /self\.price_per_30_min_cents/, hint: "Return the field: `self.price_per_30_min_cents`." },
          ],
          success: "One required method, one inherited default. That's the trait system in miniature.",
        },
      ],
    },
    {
      id: "generics-bounds",
      title: "Generics & trait bounds",
      steps: [
        {
          type: "text",
          md: [
            "## Generics are monomorphised, not boxed",
            "A generic function is compiled once **per concrete type** it's used with. `largest::<i32>` and `largest::<f64>` produce two specialised functions — no boxing, no dynamic dispatch, no runtime cost versus writing them by hand.",
            "That's why the bound matters: to call `>` on `T`, the compiler needs to know `T` supports comparison. The bound **`T: PartialOrd`** is that knowledge, and it's checked when the function is instantiated.",
            "```",
            "fn largest<T: PartialOrd + Copy>(items: &[T]) -> T",
            "```",
            "Read the bound as a requirement list: *\"give me any `T` that can be ordered and copied\"*.",
          ],
        },
        {
          type: "code",
          title: "src/generics.rs",
          source: String.raw`use std::fmt::Display;

pub fn largest<T: PartialOrd + Copy>(items: &[T]) -> T {
    let mut max = items[0];
    for &item in items {
        if item > max {
            max = item;
        }
    }
    max
}

pub fn print_pair<A: Display, B: Display>(left: A, right: B) {
    println!("{left} / {right}");
}

fn main() {
    println!("{}", largest(&[3, 9, 4]));
    println!("{}", largest(&[3.5, 9.1, 4.2]));
    print_pair("Mochi", 1800);
}`,
          caption: "One `largest`, used with `i32` and `f64`. The compiler generates a specialised copy for each — this is zero-cost abstraction in practice.",
        },
        {
          type: "quiz",
          q: "Why does `largest<T>` require `T: PartialOrd`?",
          choices: [
            "Because the body uses `>`, and the compiler must know `T` supports it",
            "Because all generics require a bound",
            "To make the function allocate less",
            "So the type can be printed",
          ],
          answer: 0,
          explain: "Without the bound, the body `item > max` is not known to be valid for an arbitrary `T`. The bound tells the compiler which capabilities are available inside the function — and the caller gets a clear error when their type doesn't qualify.",
          nudge: "Look at what the body does to `T`.",
        },
        {
          type: "text",
          md: [
            "## `impl Trait` in argument and return position",
            "Two shorthand forms you'll see everywhere in modern Rust:",
            "- **Argument position:** `fn log(value: impl Display)` is sugar for a generic parameter with a bound. Each call site gets its own monomorphised copy.\n- **Return position:** `fn walkers() -> impl Iterator<Item = Walker>` means \"some concrete type that implements this trait, which I'm not naming\". The caller can use it but can't depend on the concrete type.",
            "Return-position `impl Trait` is how libraries hand you iterators without leaking their internal types — and it keeps the door open to change them later.",
          ],
        },
        {
          type: "exercise",
          title: "Write the generic max",
          prompt: [
            "Implement `largest` for any `T` that can be compared and copied.",
            "Start from the first element, walk the slice, and keep the biggest.",
          ],
          starter: String.raw`pub fn largest<T: PartialOrd + Copy>(items: &[T]) -> T {
    // your code here
}

fn main() {
    println!("{}", largest(&[3, 9, 4]));
}`,
          solution: String.raw`pub fn largest<T: PartialOrd + Copy>(items: &[T]) -> T {
    let mut max = items[0];
    for &item in items {
        if item > max {
            max = item;
        }
    }
    max
}

fn main() {
    println!("{}", largest(&[3, 9, 4]));
}`,
          checks: [
            { re: /fn largest<T:PartialOrd\+Copy>\(items:&\[T\]\)->T/, hint: "Keep the generic signature with both bounds: `T: PartialOrd + Copy`." },
            { re: /let mut max=items\[0\]/, hint: "Seed the maximum with the first element: `let mut max = items[0];`." },
            { re: /item>max/, hint: "Compare each element with the current maximum." },
          ],
          success: "This is the canonical generic exercise — and it's `std::cmp::max_by`'s job in real code. Knowing what it expands to is the point.",
        },
      ],
    },
    {
      id: "dyn-impl-trait",
      title: "Static vs dynamic dispatch",
      steps: [
        {
          type: "text",
          md: [
            "## Two ways to be polymorphic",
            "- **Generics** (`T: Trait`) — *static dispatch*. The concrete type is known at compile time, the call is inlined or direct. Fastest, but the code is duplicated per type and the type must be known.\n- **Trait objects** (`Box<dyn Trait>`, `&dyn Trait`) — *dynamic dispatch*. The concrete type is erased behind a pointer plus a vtable. One copy of the code, a pointer indirection per call, and you can mix types in one collection.",
            "The rule: **use generics by default; reach for `dyn` when you need a heterogeneous collection or a runtime-chosen implementation.**",
            "> **Pitch line:** `dyn` is not \"slow\" — it's a vtable hop. Use it when the alternative is a giant `match` over variants or a duplicated code path per type.",
          ],
        },
        {
          type: "code",
          title: "src/dispatch.rs",
          source: String.raw`pub trait Priced {
    fn price_cents(&self) -> u32;
}

pub struct Walker { pub price_per_30_min_cents: u32 }
pub struct Boarding { pub nightly_cents: u32 }

impl Priced for Walker {
    fn price_cents(&self) -> u32 { self.price_per_30_min_cents }
}

impl Priced for Boarding {
    fn price_cents(&self) -> u32 { self.nightly_cents }
}

// Heterogeneous: a Walker and a Boarding in the same Vec.
pub fn total(items: &[Box<dyn Priced>]) -> u32 {
    items.iter().map(|item| item.price_cents()).sum()
}

fn main() {
    let items: Vec<Box<dyn Priced>> = vec![
        Box::new(Walker { price_per_30_min_cents: 1800 }),
        Box::new(Boarding { nightly_cents: 4500 }),
    ];
    println!("{}", total(&items));
}`,
          caption: "`Vec<Box<dyn Priced>>` holds two different concrete types behind one trait. A generic `Vec<T>` could never do that — `T` is one type.",
        },
        {
          type: "quiz",
          q: "When do you actually need `Box<dyn Trait>` instead of a generic?",
          choices: [
            "When you must store different concrete types in the same collection or decide the type at runtime",
            "Whenever the trait has more than two methods",
            "Whenever performance matters",
            "Always — generics are slower",
          ],
          answer: 0,
          explain: "A generic parameter is a single concrete type per instantiation, so a `Vec<T>` is homogeneous. A trait object erases the type, letting one collection hold many implementations — at the cost of a vtable lookup.",
          nudge: "What can a single `T` not be?",
        },
        {
          type: "text",
          md: [
            "## Object safety",
            "Not every trait can become `dyn Trait`. A trait is **object safe** when its methods don't return `Self`, don't have generic parameters, and don't require `Self: Sized`. That's why `Iterator` itself isn't used as `dyn Iterator` — you write `Box<dyn Iterator<Item = T>>` with the associated type pinned.",
            "**Production note:** prefer an enum when the set of variants is closed and known (your own domain), and `dyn` when the set is open (plugins, user-supplied handlers). An enum gives exhaustive matching; `dyn` gives extensibility.",
          ],
        },
        {
          type: "exercise",
          title: "Total a heterogeneous bill",
          prompt: [
            "Implement `total` so it sums the price of every boxed item.",
            "Use an iterator: `map` to `price_cents()` and `sum()`.",
          ],
          starter: String.raw`pub trait Priced {
    fn price_cents(&self) -> u32;
}

pub fn total(items: &[Box<dyn Priced>]) -> u32 {
    // your code here
}`,
          solution: String.raw`pub trait Priced {
    fn price_cents(&self) -> u32;
}

pub fn total(items: &[Box<dyn Priced>]) -> u32 {
    items.iter().map(|item| item.price_cents()).sum()
}`,
          checks: [
            { re: /items\.iter\(\)\.map\(/, hint: "Walk the slice and map each boxed item: `items.iter().map(...)`." },
            { re: /price_cents\(\)/, hint: "Call the trait method on each item." },
            { re: /\.sum\(\)/, hint: "Reduce with `.sum()` — `u32` implements `Sum`." },
          ],
          success: "That's the shape of a polymorphic calculation in Rust: erase the type at the boundary, dispatch through the trait, reduce.",
        },
      ],
    },
  ],
});
