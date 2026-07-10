window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-goroutines-channels",
  title: "Goroutines & Channels",
  emoji: "🔀",
  lang: "go",
  lessons: [
    {
      id: "goroutines",
      title: "Goroutines",
      steps: [
        {
          type: "text",
          md: [
            "## The reason Go runs servers",
            "A PawWalk server is never doing one thing. While it answers the walker-list request for one phone, it is also streaming GPS fixes to a client watching a live walk, charging a card, and accepting a brand-new booking — all at the same instant. A backend's whole job is **many things at once**.",
            "Go's answer is the **goroutine**: a function that runs concurrently with everything else. You launch one by putting the word `go` in front of a call. That's the entire syntax.",
            "> A goroutine is not an OS thread. Go multiplexes thousands of them onto a handful of real threads, so starting one costs about 2 KB of stack. Spinning up 10,000 goroutines is normal; spinning up 10,000 threads would melt the machine.",
          ],
        },
        {
          type: "code",
          title: "playground/goroutines.go",
          source: String.raw`package main

import "fmt"

func track(walkID string) {
	fmt.Println("tracking", walkID)
}

func main() {
	go track("walk-1")
	go track("walk-2")
	go track("walk-3")
	fmt.Println("all launched")
}`,
          caption: "Three goroutines launched instantly. main does not wait for track() to finish — it fires each one off and keeps going. (Run this and you may see NONE of the tracking lines — read on for why.)",
        },
        {
          type: "text",
          md: [
            "## The main goroutine is special",
            "`func main` runs in its own goroutine — the **main goroutine**. Here is the rule that surprises everyone once: **when `main` returns, the whole program exits immediately**, killing every other goroutine still running, finished or not.",
            "In the last snippet, `main` launched three goroutines and then reached the end. The program exited before `track` got a chance to print. The goroutines were real — they just got cut off. You almost never want to `go` something and hope it finishes in time. You need to **wait**.",
          ],
        },
        {
          type: "text",
          md: [
            "## Waiting with a WaitGroup",
            "`sync.WaitGroup` is a counter that lets `main` block until a batch of goroutines is done. Three calls:",
            "- **`wg.Add(1)`** before you launch — \"one more goroutine to wait for.\"\n- **`wg.Done()`** inside the goroutine when it finishes — \"this one is done\" (decrements the counter). Idiomatically `defer wg.Done()` at the top, so it fires no matter how the function returns.\n- **`wg.Wait()`** in `main` — blocks until the counter hits zero.",
          ],
        },
        {
          type: "code",
          title: "playground/waitgroup.go",
          source: String.raw`package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	walks := []string{"walk-1", "walk-2", "walk-3"}

	for _, id := range walks {
		wg.Add(1)
		go func() {
			defer wg.Done()
			fmt.Println("tracking", id)
		}()
	}

	wg.Wait()
	fmt.Println("all walks tracked")
}`,
          caption: "Now main blocks at wg.Wait() until all three goroutines call wg.Done(). This prints all three tracking lines, then the summary — every time.",
        },
        {
          type: "text",
          md: [
            "## The loop-variable gotcha (and why Go 1.22 fixed it)",
            "That `range` loop hides Go's most famous historical bug. Before **Go 1.22**, the loop variable `id` was a *single* variable reused across every iteration. All three goroutines captured the *same* `id`, and by the time they ran, the loop had raced ahead — so you'd often see `walk-3` printed three times.",
            "In **Go 1.22 and later, each iteration gets a fresh `id`**, so the code above is correct as written. The catch nobody mentions: the new semantics are gated on the **`go` directive in your `go.mod`**, not on the toolchain you compile with. A module declaring `go 1.21` keeps the old shared-variable behaviour even when built with a Go 1.25 toolchain. You'll also still see the old fix in tutorials and older codebases: pass the value as an argument, `go func(id string) { ... }(id)`, which copies it per goroutine.",
            "> Know both. Plain capture is safe only when `go.mod` declares `go 1.22` or higher. On an older module directive — whatever toolchain you build with — copy the loop variable in, or you'll ship a heisenbug.",
          ],
        },
        {
          type: "quiz",
          q: "You launch three goroutines from `main` and then `main` returns right away, without a WaitGroup. What happens?",
          choices: [
            "The program exits immediately and the goroutines may never finish",
            "Go automatically waits for every goroutine before exiting",
            "The program panics because goroutines outlived main",
            "The goroutines keep running in the background after the program exits",
          ],
          answer: 0,
          explain: "When the main goroutine returns, the process exits and takes every other goroutine down with it — finished or not. That's exactly why you need something like sync.WaitGroup to make main wait.",
          nudge: "Think about which goroutine controls the lifetime of the whole program.",
        },
        {
          type: "exercise",
          title: "Track a walk in a goroutine",
          prompt: [
            "Inside `main`, register one goroutine with the WaitGroup and launch it. Call `wg.Add(1)`, then start `go func() { ... }()` whose body first `defer wg.Done()` and then prints `tracking walk`.",
            "The `wg.Wait()` line is already there — you just need the three lines above it.",
          ],
          starter: String.raw`package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	// your code here
	wg.Wait()
}`,
          solution: String.raw`package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		fmt.Println("tracking walk")
	}()
	wg.Wait()
}`,
          checks: [
            { re: /wg\.Add\(1\)/, hint: "Register the goroutine before launching it: `wg.Add(1)`." },
            { re: /go func\(\)\{/, hint: "Launch an anonymous goroutine with `go func() { ... }()` — note the `()` at the end that calls it." },
            { re: /defer wg\.Done\(\)/, hint: "As the first line inside the goroutine, `defer wg.Done()` so the counter drops no matter how it returns." },
          ],
          mustNot: [
            { re: /wg\.Add\(3\)/, hint: "You're launching a single goroutine here, so add 1, not 3." },
          ],
          success: "That's the goroutine + WaitGroup pattern you'll use everywhere: Add before launch, defer Done inside, Wait to block main.",
        },
      ],
    },
    {
      id: "channels",
      title: "Channels",
      steps: [
        {
          type: "text",
          md: [
            "## Passing values between goroutines",
            "Goroutines run concurrently — but they need to hand results back. A walker-search goroutine finds three matches; how does it deliver them to `main`? The Go answer is a **channel**: a typed pipe that connects goroutines. One goroutine sends a value in, another receives it out.",
            "Go's guiding proverb: **\"Don't communicate by sharing memory; share memory by communicating.\"** Instead of two goroutines poking at the same variable behind a lock, one *sends* the value down a channel to the other. The channel handles the hand-off safely.",
          ],
        },
        {
          type: "text",
          md: [
            "## Make, send, receive",
            "A channel has a type — a `chan int` only ever carries `int` values, checked at compile time. Three operations:",
            "- **`ch := make(chan int)`** — create a channel of `int`.\n- **`ch <- v`** — *send* `v` into the channel. The arrow points *into* `ch`.\n- **`v := <-ch`** — *receive* the next value out of `ch`. The arrow points *out of* `ch`.",
            "> Read the arrow like a direction of flow. `ch <- v` moves `v` toward `ch` (in). `<-ch` pulls a value away from `ch` (out).",
          ],
        },
        {
          type: "code",
          title: "playground/channel.go",
          source: String.raw`package main

import "fmt"

func main() {
	ch := make(chan int)

	go func() {
		ch <- 30 // send the price in cents-per-minute
	}()

	price := <-ch // receive it in main
	fmt.Println("price:", price)
}`,
          caption: "The goroutine sends 30 into ch; main receives it into price. On an unbuffered channel the send blocks until main is ready to receive — the two goroutines rendezvous. That blocking is also the synchronization: no WaitGroup needed here.",
        },
        {
          type: "text",
          md: [
            "## Buffered channels",
            "The channel above is **unbuffered**: a send blocks until someone receives. Give it a buffer and sends only block when the buffer is full — handy for queuing GPS fixes without making the sender wait on each one.",
            "`make(chan int, 3)` holds up to three values. The producer can drop in three fixes and keep walking; the consumer drains them at its own pace.",
          ],
        },
        {
          type: "code",
          title: "playground/buffered.go",
          source: String.raw`package main

import "fmt"

func main() {
	fixes := make(chan int, 3) // buffer of 3 GPS fixes

	fixes <- 100
	fixes <- 101
	fixes <- 102 // none of these block; the buffer has room
	close(fixes)

	for f := range fixes {
		fmt.Println("fix:", f)
	}
}`,
          caption: "Three sends fit in the buffer without a receiver waiting. close(fixes) signals no more values are coming, which lets `for f := range fixes` loop over what's buffered and then stop cleanly.",
        },
        {
          type: "text",
          md: [
            "## Directions and closing",
            "A function can declare which *way* it uses a channel, and the compiler enforces it:",
            "- **`chan<- int`** — send-only. The function may only put values in.\n- **`<-chan int`** — receive-only. The function may only take values out.",
            "This is a real safety net: a `producer(out chan<- int)` physically cannot accidentally read from the pipe. And **`close(ch)`** marks a channel finished — receivers can still drain buffered values, and `v, ok := <-ch` sets `ok` to `false` once it's empty and closed. Rule of thumb: **the sender closes, never the receiver.**",
          ],
        },
        {
          type: "quiz",
          q: "What does the expression `price := <-ch` do?",
          choices: [
            "Receives the next value out of the channel `ch` and stores it in `price`",
            "Sends `price` into the channel `ch`",
            "Creates a new channel named `price`",
            "Closes the channel `ch` and returns its length",
          ],
          answer: 0,
          explain: "The arrow points away from ch, so the value flows out of the channel into price. `ch <- price` (arrow toward ch) would be the send. Direction of the arrow tells you which operation it is.",
          nudge: "Which way is the `<-` arrow pointing relative to `ch`?",
        },
        {
          type: "exercise",
          title: "Send a price down a channel",
          prompt: [
            "Inside `main`, create a channel of `int` named `ch` with `make`. Launch a goroutine that sends `30` on it, then receive the value into `v` and print it.",
            "You'll write three lines: the `make`, the send inside the goroutine, and the receive into `v`.",
          ],
          starter: String.raw`package main

import "fmt"

func main() {
	// your code here: make ch, send 30 from a goroutine, receive into v
	fmt.Println(v)
}`,
          solution: String.raw`package main

import "fmt"

func main() {
	ch := make(chan int)
	go func() {
		ch <- 30
	}()
	v := <-ch
	fmt.Println(v)
}`,
          checks: [
            { re: /ch:=make\(chan int\)/, hint: "Create the channel with `ch := make(chan int)` — a pipe that carries ints." },
            { re: /ch<-30/, hint: "Send into the channel with the arrow pointing at it: `ch <- 30`." },
            { re: /v:=<-ch/, hint: "Receive out of the channel with the arrow pointing away: `v := <-ch`." },
          ],
          mustNot: [
            { re: /30<-ch/, hint: "The send is `ch <- 30` (value flows toward ch), not the other way around." },
          ],
          success: "You just passed a value between two goroutines with zero shared memory — the channel did the hand-off and the synchronization at once.",
        },
      ],
    },
    {
      id: "select-sync",
      title: "select, context & mutex",
      steps: [
        {
          type: "text",
          md: [
            "## Waiting on several channels at once",
            "A live-tracking handler waits on more than one thing: a new GPS fix on one channel, *or* a signal that the walk ended on another, *or* a timeout so it never hangs forever. **`select`** is a `switch` for channel operations — it blocks until one of its `case`s can proceed, then runs that one.",
            "If several cases are ready, `select` picks one at random. A `default` case (optional) runs immediately when nothing else is ready, so you can poll without blocking.",
          ],
        },
        {
          type: "code",
          title: "internal/tracking/stream.go",
          source: String.raw`package tracking

import "fmt"

func stream(fixes <-chan int, done <-chan bool) {
	for {
		select {
		case f := <-fixes:
			fmt.Println("new fix:", f)
		case <-done:
			fmt.Println("walk ended")
			return
		}
	}
}`,
          caption: "The loop blocks in select until EITHER a fix arrives or done fires. On done it returns, ending the goroutine. This is the heart of a live-tracking connection: react to whichever event happens next.",
        },
        {
          type: "text",
          md: [
            "## context: cancellation and timeouts",
            "What cuts a request off when the client hangs up, or a slow database call runs too long? In Go the answer is **`context.Context`** — a value threaded through a request that carries a cancellation signal. Every `net/http` handler receives one, and every function that might block should accept one as its first argument, by convention named `ctx`.",
            "The key channel is **`ctx.Done()`**: it's closed when the context is cancelled or its deadline passes. You `select` on it. `context.WithTimeout` gives you a context that cancels itself after a duration.",
          ],
        },
        {
          type: "code",
          title: "internal/tracking/wait.go",
          source: String.raw`package tracking

import (
	"context"
	"fmt"
	"time"
)

func waitForFix(ctx context.Context, fixes <-chan int) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	select {
	case f := <-fixes:
		fmt.Println("got fix:", f)
	case <-ctx.Done():
		fmt.Println("gave up:", ctx.Err())
	}
}`,
          caption: "select races a real fix against ctx.Done(). If no fix arrives within 5 seconds the context times out, ctx.Done() fires, and the function bails instead of hanging forever. Always defer cancel() to release the timer.",
        },
        {
          type: "text",
          md: [
            "## Mutex: guarding shared state",
            "Channels are the preferred way to coordinate, but sometimes you genuinely have one piece of shared state — say an in-memory count of active walks — that several goroutines update. Reading and writing it from multiple goroutines at once is a **data race**: undefined behavior Go's `-race` detector will flag.",
            "A **`sync.Mutex`** is a lock that ensures one goroutine at a time touches the state. `mu.Lock()` acquires it; `mu.Unlock()` releases it. The idiom is `mu.Lock()` then immediately `defer mu.Unlock()`, so the lock is always released when the function returns — even on an early return or panic.",
          ],
        },
        {
          type: "code",
          title: "internal/tracking/counter.go",
          source: String.raw`package tracking

import "sync"

type ActiveWalks struct {
	mu    sync.Mutex
	count int
}

func (a *ActiveWalks) Start() {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.count++
}

func (a *ActiveWalks) Count() int {
	a.mu.Lock()
	defer a.mu.Unlock()
	return a.count
}`,
          caption: "Both methods lock before touching count and defer the unlock. Now any number of goroutines can call Start() concurrently and the count stays correct — the mutex serializes access to that one field.",
        },
        {
          type: "quiz",
          q: "Why is `defer mu.Unlock()` written immediately after `mu.Lock()`?",
          choices: [
            "It guarantees the lock is released when the function returns, even on an early return or panic",
            "It unlocks the mutex before the protected code runs",
            "It makes the lock faster by deferring the work",
            "It is required syntax — a Lock without a deferred Unlock won't compile",
          ],
          answer: 0,
          explain: "defer schedules the Unlock to run as the function exits, by any path. That means you can't forget to unlock and you won't leave the mutex held after an early return or panic — a deadlock waiting to happen otherwise.",
          nudge: "Think about every way a function can return, including ones you didn't plan for.",
        },
        {
          type: "exercise",
          title: "select on two channels",
          prompt: [
            "Inside `main`, finish the `select`. Add two cases: one that receives a value into `v` from `ch` and prints it, and one that receives from `done`.",
            "Write `select { ... }` with `case v := <-ch:` and `case <-done:`. The channels and the sending goroutine are already set up.",
          ],
          starter: String.raw`package main

import "fmt"

func main() {
	ch := make(chan int)
	done := make(chan bool)
	go func() {
		ch <- 1
	}()
	// your code here: select on ch and done
}`,
          solution: String.raw`package main

import "fmt"

func main() {
	ch := make(chan int)
	done := make(chan bool)
	go func() {
		ch <- 1
	}()
	select {
	case v := <-ch:
		fmt.Println(v)
	case <-done:
		fmt.Println("done")
	}
}`,
          checks: [
            { re: /select\{/, hint: "Open the block with `select {` — a switch over channel operations." },
            { re: /case v:=<-ch:/, hint: "First case receives a value: `case v := <-ch:`." },
            { re: /case<-done:/, hint: "Second case just receives the signal: `case <-done:` (no variable needed)." },
          ],
          mustNot: [
            { re: /switch\{/, hint: "Use `select`, not `switch` — `select` is the one that waits on channels." },
          ],
          success: "That's a live-tracking loop in miniature: select blocks until either a fix arrives or the walk ends, then handles whichever came first.",
        },
      ],
    },
  ],
});
