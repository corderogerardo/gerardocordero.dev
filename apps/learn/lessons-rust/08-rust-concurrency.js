window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-concurrency",
  title: "Threads, Channels & Async",
  emoji: "⚡",
  lang: "rust",
  lessons: [
    {
      id: "threads",
      title: "Threads, Arc & Mutex",
      steps: [
        {
          type: "text",
          md: [
            "## Fearless concurrency, literally",
            "`std::thread::spawn` starts an OS thread. The closure must be `move` (it takes ownership of what it uses) and its return value must be `Send` — safe to move across threads.",
            "Sharing mutable state across threads requires exactly two pieces:",
            "- **`Arc<T>`** — atomically reference-counted pointer, so several threads can own a share.\n- **`Mutex<T>`** (or `RwLock`) — runtime locking, so only one thread mutates at a time.",
            "`Arc<Mutex<T>>` is the canonical combination. It costs an atomic increment and a lock; the compiler guarantees you can't forget either.",
          ],
        },
        {
          type: "code",
          title: "src/parallel.rs",
          source: String.raw`use std::sync::{Arc, Mutex};
use std::thread;

pub fn sum_parallel(values: Vec<u32>) -> u32 {
    let total = Arc::new(Mutex::new(0u32));
    let mut handles = Vec::new();

    for value in values {
        let total = Arc::clone(&total); // one extra owner, not a deep copy
        handles.push(thread::spawn(move || {
            let mut guard = total.lock().unwrap();
            *guard += value;
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }

    let result = *total.lock().unwrap();
    result
}`,
          caption: "`Arc::clone` bumps a counter; the data is not copied. `lock()` returns a guard that releases the mutex when it drops — including on panic, so the lock never leaks.",
        },
        {
          type: "quiz",
          q: "Why `Arc` and not `Rc`, when sharing across threads?",
          choices: [
            "`Rc` is not `Send`; its reference count is non-atomic and would race",
            "`Arc` is faster in single-threaded code",
            "`Rc` cannot hold a `Mutex`",
            "They are equivalent; `Arc` is just newer",
          ],
          answer: 0,
          explain: "`Rc` updates its count with plain integer arithmetic. Two threads doing that concurrently corrupt the count. `Arc` uses atomics, and the compiler refuses to send an `Rc` to another thread at all.",
          nudge: "What happens to a non-atomic counter under two writers?",
        },
        {
          type: "text",
          md: [
            "## Deadlocks are still your problem",
            "Rust prevents data races, not deadlocks. `Mutex` is not reentrant: locking twice in the same thread hangs. Keep critical sections short, and don't call foreign code while holding a guard.",
            "**Production note:** prefer message passing (next lesson) for most designs. Shared mutable state behind a mutex is correct but tends to serialize throughput — the contention becomes your bottleneck.",
          ],
        },
        {
          type: "exercise",
          title: "Sum across threads",
          prompt: [
            "Implement `sum_parallel` so each value is added on its own thread, then join them all and return the total.",
            "Use `Arc::new(Mutex::new(0u32))`, `Arc::clone`, `thread::spawn` and `join`.",
          ],
          starter: String.raw`use std::sync::{Arc, Mutex};
use std::thread;

pub fn sum_parallel(values: Vec<u32>) -> u32 {
    // your code here
}`,
          solution: String.raw`use std::sync::{Arc, Mutex};
use std::thread;

pub fn sum_parallel(values: Vec<u32>) -> u32 {
    let total = Arc::new(Mutex::new(0u32));
    let mut handles = Vec::new();

    for value in values {
        let total = Arc::clone(&total);
        handles.push(thread::spawn(move || {
            let mut guard = total.lock().unwrap();
            *guard += value;
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }

    let result = *total.lock().unwrap();
    result
}`,
          checks: [
            { re: /Arc::new\(Mutex::new\(/, hint: "Create the shared cell: `Arc::new(Mutex::new(0u32))`." },
            { re: /Arc::clone\(&total\)/, hint: "Clone the Arc inside the loop so each thread owns a share: `Arc::clone(&total)`." },
            { re: /thread::spawn\(move\|\|/, hint: "Each unit of work runs in `thread::spawn(move || …)`." },
            { re: /\.lock\(\)\.unwrap\(\)/, hint: "Lock before writing: `total.lock().unwrap()`." },
          ],
          success: "Shared mutable state, compiled and provably race-free. This is the pattern, verbatim, that other languages make you reason about at runtime.",
        },
      ],
    },
    {
      id: "channels",
      title: "Message passing",
      steps: [
        {
          type: "text",
          md: [
            "## Don't share memory; send messages",
            "`std::sync::mpsc` is a **multi-producer, single-consumer** channel. A thread owns its data, computes a result, and sends it. Nobody locks anything.",
            "```",
            "let (tx, rx) = mpsc::channel();",
            "thread::spawn(move || tx.send(42).unwrap());",
            "let value = rx.recv().unwrap();",
            "```",
            "The channel closes when every sender drops — which is what makes `rx.iter()` terminate naturally instead of spinning forever.",
            "> **Pitch line:** ownership makes message passing the *default* concurrency style in Rust, because sending a value transfers it. The type system enforces the handoff.",
          ],
        },
        {
          type: "code",
          title: "src/channel.rs",
          source: String.raw`use std::sync::mpsc;
use std::thread;

pub fn sum_with_channel(values: Vec<u32>) -> u32 {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        for value in values {
            tx.send(value).unwrap();
        }
    });

    // rx.iter() ends when the sender is dropped.
    rx.iter().sum()
}

fn main() {
    println!("{}", sum_with_channel(vec![10, 20, 30]));
}`,
          caption: "The producer owns the `Vec`, the consumer owns the channel receiver, and the sum happens on the consuming thread. No mutex in sight.",
        },
        {
          type: "quiz",
          q: "When does `rx.iter()` stop yielding?",
          choices: [
            "When every sender has been dropped and the channel is empty",
            "After one value",
            "When the program exits",
            "It never stops — you must break manually",
          ],
          answer: 0,
          explain: "The channel closes once all senders drop. `iter()` then returns `None` and the loop ends. That's why `tx` must move into the spawning thread — so it drops when that thread finishes.",
          nudge: "Ownership decides when the channel closes.",
        },
        {
          type: "text",
          md: [
            "## Bounded channels and backpressure",
            "`mpsc::channel()` is **unbounded** — a fast producer can exhaust memory. `mpsc::sync_channel(n)` is bounded: `send` blocks when the buffer is full, which is real backpressure rather than a slow crash.",
            "For async code, the equivalents come from `tokio::sync::{mpsc, oneshot, broadcast, watch}`. `oneshot` is for a single reply (a request/response shape), `watch` for the latest value only, `broadcast` for fan-out.",
          ],
        },
        {
          type: "exercise",
          title: "Pipe the values through a channel",
          prompt: [
            "Implement `sum_with_channel`: send every value from a spawned thread, then sum what arrives.",
            "Create the channel with `mpsc::channel()`, send with `tx.send(value).unwrap()`, and finish with `rx.iter().sum()`.",
          ],
          starter: String.raw`use std::sync::mpsc;
use std::thread;

pub fn sum_with_channel(values: Vec<u32>) -> u32 {
    // your code here
}`,
          solution: String.raw`use std::sync::mpsc;
use std::thread;

pub fn sum_with_channel(values: Vec<u32>) -> u32 {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        for value in values {
            tx.send(value).unwrap();
        }
    });

    rx.iter().sum()
}`,
          checks: [
            { re: /mpsc::channel\(\)/, hint: "Open the channel: `let (tx, rx) = mpsc::channel();`." },
            { re: /tx\.send\(value\)/, hint: "Send each value from the producer thread." },
            { re: /rx\.iter\(\)\.sum\(\)/, hint: "Sum on the consumer side: `rx.iter().sum()`." },
          ],
          success: "One owner per value, no lock, and the loop ends by itself when the producer drops `tx`.",
        },
      ],
    },
    {
      id: "async-tokio",
      title: "async/await with tokio",
      steps: [
        {
          type: "text",
          md: [
            "## Threads are expensive; tasks are cheap",
            "An OS thread costs megabytes of stack and a syscall. An async **task** is a state machine on the heap — you can have hundreds of thousands. That's why an HTTP server built on async handles far more concurrent connections than one thread per request.",
            "`async fn` returns a **future**: a value representing work that hasn't happened yet. Nothing runs until something **awaits** or **polls** it. `tokio` is the runtime that polls.",
            "```",
            "#[tokio::main]",
            "async fn main() {",
            "    let value = fetch().await;",
            "}",
            "```",
            "The `#[tokio::main]` attribute rewrites your `main` into a synchronous function that starts the runtime and blocks on the future.",
          ],
        },
        {
          type: "code",
          title: "src/main.rs",
          source: String.raw`use tokio::time::{sleep, Duration};

pub async fn delayed(value: u32) -> u32 {
    sleep(Duration::from_millis(10)).await;
    value
}

pub async fn fetch_both() -> (u32, u32) {
    // tokio::join! polls both concurrently on one task.
    tokio::join!(delayed(1), delayed(2))
}

#[tokio::main]
async fn main() {
    let (a, b) = fetch_both().await;
    println!("{a} {b}");
}`,
          caption: "`join!` runs both futures concurrently without spawning tasks — perfect for independent I/O. Sequential `.await` calls would take twice as long.",
        },
        {
          type: "quiz",
          q: "What does calling an `async fn` actually do?",
          choices: [
            "Returns a future immediately; the body runs only when awaited or polled",
            "Runs the body on a new thread",
            "Runs the body synchronously and returns the value",
            "Nothing — async functions cannot be called",
          ],
          answer: 0,
          explain: "Async functions are lazy: the call builds a future. Without the `.await`, the future is dropped and the body never runs. That's why forgetting `.await` produces an unused-future warning.",
          nudge: "Nothing happens until someone polls it.",
        },
        {
          type: "text",
          md: [
            "## Never block the runtime",
            "A single tokio worker thread multiplexes many tasks. If one task blocks — `std::thread::sleep`, a synchronous file read, a CPU-heavy loop — every task on that worker stalls.",
            "Escape hatches: **`tokio::task::spawn_blocking`** for blocking I/O, **`tokio::spawn`** for CPU work you want off the reactor, and async-aware libraries (`sqlx`, `reqwest`) instead of their blocking twins.",
            "**Red flag:** `std::thread::sleep` inside an async fn. It compiles, it passes tests, and it silently destroys throughput under load.",
          ],
        },
        {
          type: "exercise",
          title: "Await the delay",
          prompt: [
            "Implement `delayed`: sleep for 10 milliseconds, then return the value.",
            "Use `tokio::time::sleep(Duration::from_millis(10)).await`.",
          ],
          starter: String.raw`use tokio::time::{sleep, Duration};

pub async fn delayed(value: u32) -> u32 {
    // your code here
}`,
          solution: String.raw`use tokio::time::{sleep, Duration};

pub async fn delayed(value: u32) -> u32 {
    sleep(Duration::from_millis(10)).await;
    value
}`,
          checks: [
            { re: /async fn delayed\(value:u32\)->u32/, hint: "Keep the async signature: `pub async fn delayed(value: u32) -> u32`." },
            { re: /sleep\(Duration::from_millis\(10\)\)\.await/, hint: "Await the sleep: `sleep(Duration::from_millis(10)).await`." },
            { re: /\.await;value\}/, hint: "Return the value as the last expression — no semicolon." },
          ],
          success: "That `.await` is the whole difference between a blocking call and a cooperative one.",
        },
      ],
    },
  ],
});
