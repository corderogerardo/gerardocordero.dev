window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-concurrency-patterns",
  title: "Concurrency Patterns",
  emoji: "⚙️",
  lang: "go",
  lessons: [
    {
      id: "worker-pools",
      title: "Worker pools",
      steps: [
        {
          type: "text",
          md: [
            "## The interview question behind this module",
            "You already know goroutines, channels, `select`, `context`, and `sync.Mutex` from the last module. This one is the **interview follow-up**: the reusable *patterns* built from those primitives. \"How would you bound concurrency?\" \"Fan-out then fan-in?\" \"How do you cancel a pipeline?\" \"How do you find a race?\" This is the material that separates \"I've seen goroutines\" from \"I write concurrent Go.\"",
            "Start with the most common one. PawWalk just finished a busy morning and has **8,000 GPS fixes** to score, or **3,000 booking notifications** to push. The naive move is `for _, job := range jobs { go handle(job) }` — one goroutine per job.",
            "> Goroutines are cheap, but the *work* they do is not. 8,000 goroutines all hammering the database, the notification API, or a rate-limited endpoint at once is **oversubscription**: you exhaust connections, get throttled, and blow memory. You wanted concurrency, not a stampede.",
          ],
        },
        {
          type: "text",
          md: [
            "## The worker-pool shape",
            "A **worker pool** fixes the number of goroutines doing work — say 3 or 10 — no matter how many jobs arrive. The pieces:",
            "- A **`jobs`** channel the producer sends work into.\n- A **fixed set of worker goroutines**, each looping `for j := range jobs` — pulling the next job whenever it's free.\n- A **`results`** channel the workers send finished work into.",
            "The number of workers is your concurrency limit. Three workers means at most three jobs in flight, ever — the other 7,997 fixes wait politely in the channel. That's the whole point: **bounded concurrency**.",
          ],
        },
        {
          type: "code",
          title: "playground/pool.go",
          source: String.raw`package main

import "fmt"

// worker pulls jobs until the jobs channel is closed and drained.
func worker(jobs <-chan int, results chan<- int) {
	for j := range jobs {
		results <- process(j)
	}
}

func process(fix int) int {
	return fix * 2 // pretend this scores a GPS fix
}

func main() {
	jobs := make(chan int, 100)
	results := make(chan int, 100)

	// Start a FIXED pool of 3 workers, no matter how many jobs.
	for w := 0; w < 3; w++ {
		go worker(jobs, results)
	}

	for i := 1; i <= 9; i++ {
		jobs <- i
	}
	close(jobs) // no more work; workers' range loops will end

	for a := 1; a <= 9; a++ {
		fmt.Println(<-results)
	}
}`,
          caption: "Nine jobs, three workers. Each worker's `for j := range jobs` loop grabs the next job the instant it finishes the last one, so the three of them chew through all nine — but never more than three at once. close(jobs) is what lets each range loop end cleanly once the queue drains.",
        },
        {
          type: "text",
          md: [
            "## Why the channels have a buffer here",
            "`make(chan int, 100)` gives `jobs` and `results` a buffer. Without it, the producer would block on every `jobs <- i` until a worker was free, and workers would block on `results <- ...` until `main` read the result — a fragile lock-step.",
            "The receive-only / send-only types are a real safety net too: `worker(jobs <-chan int, results chan<- int)` can *only read* jobs and *only write* results. The compiler stops a worker from ever sending a job back or draining a result — a whole class of bug removed at compile time.",
            "> The **sender closes** `jobs`, never a worker. Close signals \"no more work.\" Every worker's `range` loop then ends after the buffer drains, the workers return, and the pool winds down on its own.",
          ],
        },
        {
          type: "quiz",
          q: "You have 8,000 GPS fixes to score against a database that allows 10 connections. Why prefer a 10-worker pool over `go score(fix)` for each of the 8,000?",
          choices: [
            "The pool bounds concurrency to 10 in-flight jobs; 8,000 goroutines would oversubscribe the database and get throttled or exhaust connections",
            "Goroutines are too expensive to launch 8,000 of them",
            "One goroutine per job would compute the wrong scores",
            "A worker pool runs the jobs faster because goroutines are slower than functions",
          ],
          answer: 0,
          explain: "Launching 8,000 goroutines is cheap — the problem is the work. Ten workers means at most ten jobs hitting the database at once, matching your real resource limit. The remaining jobs wait in the channel. Bounding concurrency to the scarce resource is the entire reason the pattern exists.",
          nudge: "The goroutines are cheap. What is the scarce resource here, and how many jobs should touch it at once?",
        },
        {
          type: "exercise",
          title: "Launch the pool and write the worker loop",
          prompt: [
            "Two spots to fill. First, in `worker`, loop over the `jobs` channel with `for j := range jobs {` and send `process(j)` into `results`.",
            "Second, in `main`, launch a fixed pool of 3 workers with `for w := 0; w < 3; w++ { go worker(jobs, results) }`.",
          ],
          starter: String.raw`package main

import "fmt"

func worker(jobs <-chan int, results chan<- int) {
	// your code here: range over jobs, send process(j) into results
}

func process(fix int) int {
	return fix * 2
}

func main() {
	jobs := make(chan int, 100)
	results := make(chan int, 100)

	// your code here: launch a fixed pool of 3 workers

	for i := 1; i <= 9; i++ {
		jobs <- i
	}
	close(jobs)

	for a := 1; a <= 9; a++ {
		fmt.Println(<-results)
	}
}`,
          solution: String.raw`package main

import "fmt"

func worker(jobs <-chan int, results chan<- int) {
	for j := range jobs {
		results <- process(j)
	}
}

func process(fix int) int {
	return fix * 2
}

func main() {
	jobs := make(chan int, 100)
	results := make(chan int, 100)

	for w := 0; w < 3; w++ {
		go worker(jobs, results)
	}

	for i := 1; i <= 9; i++ {
		jobs <- i
	}
	close(jobs)

	for a := 1; a <= 9; a++ {
		fmt.Println(<-results)
	}
}`,
          checks: [
            { re: /for j:=range jobs\{/, hint: "The worker loops with `for j := range jobs {` — it pulls the next job each time the channel has one." },
            { re: /results<-process\(j\)/, hint: "Send the finished work into results: `results <- process(j)`." },
            { re: /for w:=0;w<3;w\+\+\{/, hint: "Bound concurrency with a counting loop: `for w := 0; w < 3; w++ {` — exactly three workers." },
            { re: /go worker\(jobs,results\)/, hint: "Inside that loop, launch each worker as a goroutine: `go worker(jobs, results)`." },
          ],
          mustNot: [
            { re: /for w:=0;w<9;w\+\+\{/, hint: "Nine would be one worker per job — that defeats the pool. Fix the count at 3 so concurrency stays bounded no matter how many jobs arrive." },
          ],
          success: "That's the worker pool: a fixed number of goroutines each ranging over one jobs channel. Three workers, nine jobs, at most three in flight — bounded concurrency in a dozen lines.",
        },
      ],
    },
    {
      id: "fan-out-in",
      title: "Fan-out / fan-in",
      steps: [
        {
          type: "text",
          md: [
            "## Naming what you just built, and what's missing",
            "The worker pool was already a **fan-out**: several goroutines all reading from *one* input channel, spreading the work across themselves. When three workers `range` over the same `jobs` channel, the Go runtime hands each job to whichever worker is free. That's fan-out — one source, many consumers.",
            "The gap: those workers wrote into a *shared* `results` channel that `main` drained by counting to nine. That works, but it's brittle — `main` had to know the exact number of results. The general pattern gives each producer its *own* output channel and then **merges** them. Merging many channels into one is **fan-in**.",
          ],
        },
        {
          type: "code",
          title: "playground/fanout.go",
          source: String.raw`package main

import "fmt"

// Fan-out: three goroutines, one shared input channel.
func main() {
	fixes := make(chan int)

	for w := 0; w < 3; w++ {
		go func() {
			for f := range fixes {
				fmt.Println("scored", f)
			}
		}()
	}

	for i := 0; i < 9; i++ {
		fixes <- i
	}
	close(fixes)
}`,
          caption: "Fan-out in its purest form: one fixes channel, three goroutines ranging over it. The runtime load-balances — each value goes to exactly one goroutine, whichever is ready. (Go 1.22+ makes the loop variable w safe to capture; on older Go you'd pass it in.)",
        },
        {
          type: "text",
          md: [
            "## Fan-in: merging channels with a WaitGroup",
            "Say three producers each return their *own* `<-chan int` and you want a single stream to read. `merge` starts one goroutine per input that forwards every value to a shared `out` channel. Two problems to solve:",
            "- **When is `out` done?** Only when *every* input has drained. A `sync.WaitGroup` counts the forwarding goroutines; when all have finished, `out` can be closed.",
            "- **Who closes `out`?** A separate goroutine that blocks on `wg.Wait()` and then closes. It can't be any single forwarder (they don't know about the others), and `merge` can't close before returning (the forwarders are still running).",
          ],
        },
        {
          type: "code",
          title: "internal/tracking/merge.go",
          source: String.raw`package tracking

import "sync"

// Fan-in: merge many channels into one.
func merge(cs ...<-chan int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup

	for _, c := range cs {
		wg.Add(1)
		go func(c <-chan int) {
			defer wg.Done()
			for v := range c {
				out <- v
			}
		}(c)
	}

	// One closer goroutine: wait for every forwarder, then close out.
	go func() { wg.Wait(); close(out) }()

	return out
}`,
          caption: "Each input gets a forwarding goroutine (wg.Add(1) before launch, defer wg.Done() inside). The lone closer goroutine blocks on wg.Wait() and closes out exactly once — so a reader can `for v := range merge(a, b, c)` and stop cleanly when all three sources are spent.",
        },
        {
          type: "quiz",
          q: "In the fan-in `merge`, why is `out` closed by a separate `go func() { wg.Wait(); close(out) }()` instead of inside one of the forwarding goroutines?",
          choices: [
            "Only after every forwarder has finished is it safe to close out; wg.Wait() blocks for exactly that, and closing must happen once, not once per source",
            "Goroutines cannot call close(), so it must be delegated",
            "It makes the merge run faster by parallelizing the close",
            "close(out) can only be called from the main goroutine",
          ],
          answer: 0,
          explain: "A single forwarder doesn't know when the others are done, and closing a channel more than once panics. The WaitGroup counts all forwarders; the dedicated closer blocks until the count hits zero, then closes out exactly once. Closing too early would make a still-running forwarder send on a closed channel — also a panic.",
          nudge: "What happens if you close a channel twice, or send on it after it's closed? And how does one forwarder know the others are done?",
        },
        {
          type: "exercise",
          title: "Complete the fan-in merge",
          prompt: [
            "Fill the two gaps. Inside each forwarding goroutine, forward every value from `c` to `out` with `for v := range c { out <- v }`.",
            "Then add the closer goroutine that waits for all forwarders and closes the output: `go func() { wg.Wait(); close(out) }()`.",
          ],
          starter: String.raw`package main

import "sync"

func merge(cs ...<-chan int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup

	for _, c := range cs {
		wg.Add(1)
		go func(c <-chan int) {
			defer wg.Done()
			// your code here: forward every value from c into out
		}(c)
	}

	// your code here: one goroutine that waits, then closes out

	return out
}`,
          solution: String.raw`package main

import "sync"

func merge(cs ...<-chan int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup

	for _, c := range cs {
		wg.Add(1)
		go func(c <-chan int) {
			defer wg.Done()
			for v := range c {
				out <- v
			}
		}(c)
	}

	go func() { wg.Wait(); close(out) }()

	return out
}`,
          checks: [
            { re: /for v:=range c\{/, hint: "Forward each source with `for v := range c {` — loop until that input channel is closed and drained." },
            { re: /out<-v/, hint: "Inside the loop, send the value onward: `out <- v`." },
            { re: /wg\.Wait\(\);close\(out\)/, hint: "The closer goroutine is one line: `go func() { wg.Wait(); close(out) }()` — wait for every forwarder, then close." },
          ],
          mustNot: [
            { re: /close\(c\)/, hint: "Never close an input channel `c` inside merge — the sender owns closing it. You only close `out`, the one merge created." },
          ],
          success: "That's fan-in: N forwarders tracked by a WaitGroup, one closer that shuts out down when they're all spent. Callers just range over the merged channel — no counting, no guessing when it ends.",
        },
      ],
    },
    {
      id: "pipelines",
      title: "Pipelines & cancellation",
      steps: [
        {
          type: "text",
          md: [
            "## Stages that plug together",
            "A **pipeline** is a chain of stages, each a function that *takes* a receive-only channel and *returns* a receive-only channel. Values flow stage to stage, every stage running in its own goroutine, all working concurrently — stage 2 processes item 5 while stage 1 is already fetching item 6.",
            "For PawWalk: **generate** raw GPS fixes, **filter** out the noise (accuracy too low), **score** each into a distance delta. Three stages, three goroutines, one flow. The signature that makes it composable is always the same: `func stage(in <-chan int) <-chan int`.",
          ],
        },
        {
          type: "code",
          title: "internal/tracking/pipeline.go",
          source: String.raw`package tracking

// gen is a source stage: it produces values onto a new channel.
func gen(fixes ...int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for _, f := range fixes {
			out <- f
		}
	}()
	return out
}

// score is a transform stage: in -> out.
func score(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for f := range in {
			out <- f * 2
		}
	}()
	return out
}`,
          caption: "Each stage makes its own out channel, launches a goroutine that fills it, and returns it immediately. defer close(out) means the channel closes the moment the stage's input is drained — which ends the next stage's range loop. The stages are decoupled: score doesn't know or care what feeds it.",
        },
        {
          type: "text",
          md: [
            "## Chaining is just nesting the calls",
            "Because every stage takes a channel and returns a channel, you wire the pipeline by feeding one into the next:",
            "```for s := range score(gen(100, 101, 102)) { fmt.Println(s) }```",
            "`gen` returns a channel, `score` consumes it and returns another, and the `range` drains the end. Reads left-to-right as \"generate, then score.\" Adding a `filter` stage in the middle is `score(filter(gen(...)))` — no other change.",
          ],
        },
        {
          type: "text",
          md: [
            "## The leak, and how context plugs it",
            "Here's the interview trap. A pipeline stage blocks on `out <- v`, waiting for the next stage to receive. What if the consumer **stops early** — the client watching the live walk hangs up after the first fix? Nobody drains `out` anymore. The stage's goroutine is stuck forever on that send. That's a **goroutine leak**: a goroutine that can never finish, holding its stack and its channel until the process dies.",
            "The fix is `context.Context`. Thread a `ctx` through every stage and make the send **race** against cancellation with `select`: either the value goes out, or `ctx.Done()` fires and the stage returns. When the consumer cancels, every upstream stage unblocks and exits.",
            "> The pattern to memorize: `select { case out <- v: case <-ctx.Done(): return }`. A blind `out <- v` is the leak; the `select` with a `ctx.Done()` case is the cure.",
          ],
        },
        {
          type: "code",
          title: "internal/tracking/cancel.go",
          source: String.raw`package tracking

import "context"

// A cancellable stage: forwards fixes, but bails the instant ctx is cancelled.
func filterActive(ctx context.Context, in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for v := range in {
			if v <= 0 {
				continue // drop noisy fixes
			}
			select {
			case out <- v:
			case <-ctx.Done():
				return
			}
		}
	}()
	return out
}`,
          caption: "The send is now inside a select. If the downstream reader is still consuming, `case out <- v` wins and the value flows. If the caller cancels the context, `case <-ctx.Done()` wins, the goroutine returns, defer close(out) runs, and the whole pipeline upstream unwinds. No leak.",
        },
        {
          type: "quiz",
          q: "A pipeline stage does a bare `out <- v`, and the consumer stops reading after the first value. What happens to the stage's goroutine?",
          choices: [
            "It blocks forever on the send with no receiver — a goroutine leak — until the process exits",
            "It panics because the channel has no reader",
            "Go's runtime automatically garbage-collects the blocked goroutine",
            "The send returns immediately and the value is discarded",
          ],
          answer: 0,
          explain: "A send on an unbuffered channel blocks until someone receives. If the consumer walked away, no one ever will, and the goroutine is stuck on that line forever — leaked. The runtime cannot collect a goroutine that's blocked on a channel op; it looks like it might still make progress. Selecting on ctx.Done() gives it an exit.",
          nudge: "An unbuffered send waits for a receiver. What if the receiver is gone for good?",
        },
        {
          type: "exercise",
          title: "Make the send cancellable",
          prompt: [
            "Replace the bare send with a `select` that races the value against cancellation. Add two cases: `case out <- v:` (empty body — the value went out) and `case <-ctx.Done(): return` (the context was cancelled, so leave).",
            "This is the single most-quoted concurrency pattern in Go interviews — write it from memory.",
          ],
          starter: String.raw`package main

import "context"

func filterActive(ctx context.Context, in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for v := range in {
			// your code here: send v, but bail if ctx is cancelled
		}
	}()
	return out
}`,
          solution: String.raw`package main

import "context"

func filterActive(ctx context.Context, in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for v := range in {
			select {
			case out <- v:
			case <-ctx.Done():
				return
			}
		}
	}()
	return out
}`,
          checks: [
            { re: /select\{/, hint: "Open a `select {` — it races the two channel operations and runs whichever is ready first." },
            { re: /case out<-v:/, hint: "First case is the normal path: `case out <- v:` with an empty body — the value flowed downstream." },
            { re: /case<-ctx\.Done\(\):return/, hint: "Second case is the escape hatch: `case <-ctx.Done(): return` — cancelled, so exit the goroutine (defer close(out) still runs)." },
          ],
          mustNot: [
            { re: /for v:=range in\{out<-v\}/, hint: "A bare `out <- v` with no select is exactly the leak — if the consumer stops, this line blocks forever. Wrap it in the select." },
          ],
          success: "That's the cancellation pattern that shows up in every pipeline: send inside a select, with a ctx.Done() case as the exit. Cancel the context and every stage unblocks and returns — no leaked goroutines.",
        },
      ],
    },
    {
      id: "hazards",
      title: "Races, leaks & the -race detector",
      steps: [
        {
          type: "text",
          md: [
            "## The three bugs interviewers ask about",
            "Concurrency bugs are the ones that pass every test on your laptop and corrupt production at 3am. Three come up in every Go interview: **data races**, **goroutine leaks**, and **deadlocks**. You met leaks in the last lesson (a stuck send with no receiver — always give a goroutine a way out). This lesson is races and deadlocks, and the tool that catches them.",
            "A **data race** is two goroutines touching the same memory at the same time with at least one write, and no synchronization. The result is undefined — a lost increment, a torn value, a crash. Worst of all it's *nondeterministic*: it might work a thousand times and fail the thousand-and-first.",
          ],
        },
        {
          type: "code",
          title: "playground/race.go (BROKEN — for demonstration)",
          source: String.raw`package main

import (
	"fmt"
	"sync"
)

func main() {
	count := 0
	var wg sync.WaitGroup

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			count++ // DATA RACE: 1000 goroutines writing one variable
		}()
	}

	wg.Wait()
	fmt.Println(count) // rarely 1000 — increments get lost
}`,
          caption: "count++ is really three steps: read, add one, write back. When 1000 goroutines interleave those steps on the same variable, updates clobber each other, so the total comes out under 1000 — differently each run. Run it with `go run -race race.go` and the detector prints the exact two goroutines and lines that collided.",
        },
        {
          type: "text",
          md: [
            "## The -race detector, and two ways to fix it",
            "**`go run -race`** and **`go test -race`** build an instrumented binary that watches every memory access and reports a race the moment two goroutines collide unsynchronized — with both stack traces. It's the single most valuable tool in concurrent Go. Run your tests with `-race` in CI and races stop reaching production.",
            "Two idiomatic fixes:",
            "- **Share by communicating** — send the values down a channel to *one* goroutine that owns the counter. No shared write, no race. This is Go's preferred style.\n- **Guard with a `sync.Mutex`** — when the state really is shared, wrap every read and write in `mu.Lock()` / `mu.Unlock()` so exactly one goroutine touches it at a time.",
          ],
        },
        {
          type: "code",
          title: "internal/tracking/active.go",
          source: String.raw`package tracking

import "sync"

var (
	mu    sync.Mutex
	count int
)

// addWalk is safe to call from any number of goroutines at once.
func addWalk() {
	mu.Lock()
	defer mu.Unlock()
	count++
}

func activeWalks() int {
	mu.Lock()
	defer mu.Unlock()
	return count
}`,
          caption: "The mutex serializes access: mu.Lock() blocks until this goroutine owns the lock, defer mu.Unlock() releases it on every return path. Now count++ happens one goroutine at a time — the read-add-write can't interleave. Run the same 1000-goroutine test under -race and it's clean, and the total is always 1000.",
        },
        {
          type: "text",
          md: [
            "## Deadlocks: everyone waiting, no one moving",
            "A **deadlock** is the opposite failure: goroutines all blocked waiting on each other, so nothing proceeds. The classic beginner version is a send on an unbuffered channel with no receiver — Go's runtime detects that *all* goroutines are asleep and panics with `fatal error: all goroutines are asleep - deadlock!`.",
            "The mutex has its own deadlock trap: forget to unlock (or take the same lock twice) and every other goroutine waits on `mu.Lock()` forever. That's exactly why the `defer mu.Unlock()` idiom exists — pair it with the `Lock()` on the very next line so the release can't be skipped by an early return or a panic.",
            "> Rule of thumb from the last two modules, now stated plainly: **channels to hand off work, mutex to guard shared state.** Reach for a channel first; reach for a mutex when you have one piece of state several goroutines must share.",
          ],
        },
        {
          type: "quiz",
          q: "`go test` passes every time, but under `go test -race` the counter test fails intermittently. What is `-race` telling you?",
          choices: [
            "Two goroutines access the same variable concurrently with no synchronization — a data race the normal build can't see",
            "Your test is too slow and timing out",
            "The -race flag makes tests fail on purpose to check error handling",
            "There is a compile error only the race build catches",
          ],
          answer: 0,
          explain: "A data race is invisible to a normal build and often to normal test runs — it depends on timing. The -race detector instruments memory accesses so it catches the unsynchronized read/write the instant it happens, with both stack traces. That's why -race belongs in CI: it turns a nondeterministic 3am bug into a deterministic test failure.",
          nudge: "What kind of bug is timing-dependent and invisible to an ordinary build, but a special detector can surface?",
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Catch a race with the -race detector",
          intro: ["See the detector work end to end. Type out the broken counter from this lesson, watch -race flag it, then fix it with the mutex and watch it go green."],
          items: [
            "In a scratch module, save the broken `count++` program from this lesson as `race.go`",
            "Run it plain: `go run race.go` — note the total printed is under 1000, and changes between runs",
            "Now run it instrumented: `go run -race race.go` — read the WARNING: DATA RACE report; it names both goroutines and the exact colliding lines",
            "Add the `sync.Mutex` guard: `mu.Lock()` then `defer mu.Unlock()` around `count++`",
            "Re-run `go run -race race.go` — the warning is gone and the total is 1000 every time",
            "Make it a habit: run your test suite with `go test -race ./...` in CI so races never reach production",
          ],
        },
        {
          type: "exercise",
          title: "Guard the shared counter",
          prompt: [
            "Fill in `addWalk` so it's safe to call from many goroutines at once. Acquire the lock with `mu.Lock()`, schedule its release with `defer mu.Unlock()`, then increment the shared `count`.",
            "Lock, defer unlock, mutate — in that order. This is the last exercise of the module: the mutex idiom that makes shared state race-free.",
          ],
          starter: String.raw`package main

import "sync"

var (
	mu    sync.Mutex
	count int
)

func addWalk() {
	// your code here: lock, defer unlock, then increment count
}`,
          solution: String.raw`package main

import "sync"

var (
	mu    sync.Mutex
	count int
)

func addWalk() {
	mu.Lock()
	defer mu.Unlock()
	count++
}`,
          checks: [
            { re: /mu\.Lock\(\)/, hint: "Acquire the lock first: `mu.Lock()` blocks until this goroutine owns it." },
            { re: /defer mu\.Unlock\(\)/, hint: "Right after locking, `defer mu.Unlock()` so the lock is always released, even on an early return or panic." },
            { re: /count\+\+/, hint: "With the lock held, mutate the shared state: `count++`." },
          ],
          mustNot: [
            { re: /mu\.Lock\(\)mu\.Unlock\(\)/, hint: "Don't unlock immediately without `defer` — you'd release the lock before `count++` runs, reopening the race. Use `mu.Lock()` then `defer mu.Unlock()`." },
          ],
          success: "Lock, defer unlock, mutate — the mutex idiom in three lines. Any number of goroutines can call addWalk() now and count stays exact, race detector clean. That's the concurrency-patterns toolkit: pools, fan-out/in, cancellable pipelines, and race-free shared state.",
        },
      ],
    },
  ],
});
