window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-deploy-graduation",
  title: "Ship It & Graduation",
  emoji: "🚀",
  lang: "go",
  lessons: [
    {
      id: "building",
      title: "Building for production",
      steps: [
        {
          type: "text",
          md: [
            "## From `go run` to a shippable binary",
            "All course long your inner loop was `go run .` — compile and run in one step, nothing left on disk. To **ship**, you run `go build` instead. It produces a single, self-contained executable: your whole program plus every dependency, statically linked into one file.",
            "That's the payoff Go promised back in module 00. There's no runtime to install on the server, no `node_modules`, no interpreter. You copy one file and run it:",
            "```sh\ngo build -o pawwalk .\n./pawwalk\n```",
            "`-o pawwalk` names the output. Without it, Go names the binary after the folder. That's the artifact you deploy.",
          ],
        },
        {
          type: "text",
          md: [
            "## Building for the machine you deploy to",
            "You develop on a Mac or Windows laptop, but production almost always runs **Linux on x86-64**. Go cross-compiles to any target from any host — no cross-toolchain to install — by setting two environment variables:",
            "```sh\nGOOS=linux GOARCH=amd64 go build -o pawwalk .\n```",
            "- `GOOS` — the operating system: `linux`, `darwin` (macOS), `windows`.\n- `GOARCH` — the CPU: `amd64` (Intel/AMD), `arm64` (Apple Silicon, AWS Graviton, most cloud ARM).",
            "> This is why Go is a joy to deploy: one command on your laptop produces the exact Linux binary the server needs. Compare that to shipping an interpreter plus its dependency tree.",
          ],
        },
        {
          type: "text",
          md: [
            "## Stamping a version into the binary",
            "When a bug report comes in, the first question is *which build is running?* You answer it by baking the version straight into the binary at build time. Declare a package-level variable with a placeholder, and let the linker overwrite it:",
            "```go\nvar version = \"dev\"\n```",
            "The `-ldflags` flag passes options to the linker, and `-X importpath.name=value` sets a string variable during linking:",
            "```sh\ngo build -ldflags \"-X main.version=1.0.0\" -o pawwalk .\n```",
            "Now `./pawwalk` reports `1.0.0` instead of `dev` — no source edit, no rebuild of your logic. CI usually feeds the git tag or commit SHA in here, exactly like the portfolio app stamps its build number.",
          ],
        },
        {
          type: "text",
          md: [
            "## The load balancer's heartbeat: `/healthz`",
            "In production your binary sits behind a **load balancer** or an orchestrator (Kubernetes, ECS, a Cloud Run frontend). It needs a cheap way to ask each instance *are you alive and ready?* — many times a second, forever.",
            "The convention is a tiny **health-check endpoint**, traditionally `/healthz`. It does no real work: no database call, no auth. It just answers `200 OK` the instant the server can respond. If it stops answering, the load balancer stops sending it traffic and (in an orchestrator) the instance gets replaced.",
            "> Keep `/healthz` dependency-free. If it checks the database and the database blips, every instance looks unhealthy at once and the whole service gets pulled out of rotation — an outage you caused yourself.",
          ],
        },
        {
          type: "code",
          title: "cmd/pawwalk/main.go",
          source: String.raw`package main

import (
	"fmt"
	"net/http"
	"os"
)

var version = "dev"

func main() {
	fmt.Println("pawwalk", version)

	http.HandleFunc("/healthz", healthz)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	http.ListenAndServe(":"+port, nil)
}

func healthz(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "ok")
}`,
          caption: "The whole production entry point: print the linker-stamped version, register the health check, read the port from the environment, and serve. `healthz` is the endpoint you'll write next.",
        },
        {
          type: "quiz",
          q: "Why should the `/healthz` handler avoid touching the database?",
          choices: [
            "A brief database blip would make every instance report unhealthy at once, pulling the whole service out of rotation",
            "The database is too slow to ever answer in time",
            "Load balancers cannot make database connections",
            "Health checks are not allowed to import other packages",
          ],
          answer: 0,
          explain: "A liveness check should answer 'is this process up and serving?' — nothing more. If it depends on the database and the database hiccups, all instances fail the check simultaneously and the load balancer removes every one of them, turning a minor blip into a full outage. Deeper 'readiness' checks that do probe dependencies are a separate, more careful concern.",
          nudge: "Think about what happens to ALL your instances at once if the shared thing they all check goes down for a second.",
        },
        {
          type: "exercise",
          title: "Write the liveness endpoint",
          prompt: [
            "Write `healthz`, the handler the load balancer polls. It takes the standard `(w http.ResponseWriter, r *http.Request)`. Inside, send a `200` with `w.WriteHeader(http.StatusOK)`, then write the body `ok` with `fmt.Fprint(w, \"ok\")`.",
          ],
          starter: String.raw`package main

import (
	"fmt"
	"net/http"
)

// your code here`,
          solution: String.raw`package main

import (
	"fmt"
	"net/http"
)

func healthz(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "ok")
}`,
          checks: [
            { re: /func healthz\(w http\.ResponseWriter,r\*http\.Request\)\{/, hint: "Match the standard handler signature exactly: `func healthz(w http.ResponseWriter, r *http.Request) {`." },
            { re: /w\.WriteHeader\(http\.StatusOK\)/, hint: "Send the 200 status first with `w.WriteHeader(http.StatusOK)` — before you write any body." },
            { re: /fmt\.Fprint\(w,"ok"\)/, hint: "Write the tiny body with `fmt.Fprint(w, \"ok\")`. The load balancer only cares that it got a 200." },
          ],
          success: "That's the heartbeat of every production Go service — a handful of lines the load balancer leans on to know you're alive.",
        },
      ],
    },
    {
      id: "docker",
      title: "Containerizing",
      steps: [
        {
          type: "text",
          md: [
            "## Why Go containers are famously tiny",
            "Most platforms deploy your service as a **container image** — a portable bundle of your program and everything it needs to run. For an interpreted language that bundle is huge: you ship the runtime, the package manager, and a whole base OS, often hundreds of megabytes.",
            "Go changes the math. `go build` already produced *one statically-linked binary* that needs nothing else. So the container doesn't need an OS, a runtime, or libraries — just the binary. A PawWalk image can be **a few megabytes**, and it starts in milliseconds.",
            "Small images pull faster, deploy faster, scale up faster under load, and carry almost no packages an attacker could exploit. This is Go's deploy story paying off.",
          ],
        },
        {
          type: "text",
          md: [
            "## The multi-stage Dockerfile",
            "There's a catch: *building* Go needs the full toolchain (hundreds of MB), but *running* the result needs none of it. A **multi-stage build** solves this. You use a fat image to compile, then copy just the binary into a near-empty final image and throw the build stage away.",
            "- **Build stage** — start `FROM golang:1.22`, copy your source, run `go build`. This stage has the whole compiler.\n- **Runtime stage** — start `FROM` a minimal base, `COPY --from=build` only the finished binary, set the entry point. This is the only stage that ships.",
            "The build tools never make it into the final image — they lived in a stage that got discarded.",
          ],
        },
        {
          type: "text",
          md: [
            "## The Dockerfile in full",
            "Here's a production-shaped Dockerfile for the PawWalk binary. Read it top to bottom — each line maps to something you just learned:",
            "```dockerfile\n# ---- build stage ----\nFROM golang:1.22 AS build\nWORKDIR /src\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 GOOS=linux go build -ldflags \"-X main.version=1.0.0\" -o /pawwalk ./cmd/pawwalk\n\n# ---- runtime stage ----\nFROM gcr.io/distroless/static\nCOPY --from=build /pawwalk /pawwalk\nEXPOSE 8080\nENTRYPOINT [\"/pawwalk\"]\n```",
            "`CGO_ENABLED=0` forces a pure-Go static binary with zero C dependencies — the thing that makes the tiny base image possible. Copying `go.mod`/`go.sum` and running `go mod download` *before* the rest of the source lets Docker cache your dependencies, so edits to your code don't re-download the world.",
          ],
        },
        {
          type: "text",
          md: [
            "## `distroless` vs `scratch`",
            "What minimal base should the runtime stage use? Two common choices:",
            "- **`scratch`** — literally empty. Zero bytes of OS. The smallest possible image, but it has no shell, no CA certificates, no `/tmp`. If your app makes outbound HTTPS calls you'd have to add certs yourself.\n- **`gcr.io/distroless/static`** — also has no shell or package manager, but *does* include CA certificates and timezone data. A tiny, safer default for a real service that talks to Stripe or another API over HTTPS.",
            "> Both drop the shell on purpose. No shell means an attacker who breaks in can't `sh` around your container — a real, free security win that Go's static binary makes practical.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Build and run the container",
          intro: ["Save the Dockerfile above next to your module, then take the image for a spin. This is the exact loop a deploy pipeline runs."],
          items: [
            "Build the image: `docker build -t pawwalk .`",
            "Confirm it's tiny: `docker images pawwalk` — the size should be single-digit megabytes",
            "Run it, mapping the port: `docker run -p 8080:8080 pawwalk`",
            "In another terminal, hit the health check: `curl localhost:8080/healthz` — it should print `ok`",
            "Stop the container with Ctrl-C. You just built and ran the same artifact production would.",
          ],
        },
        {
          type: "quiz",
          q: "In the multi-stage Dockerfile, why doesn't the Go compiler end up in the final image?",
          choices: [
            "The runtime stage starts from a fresh minimal base and copies only the built binary out of the build stage, which is then discarded",
            "Docker automatically deletes compilers from every image",
            "`gcr.io/distroless/static` uninstalls Go after the build",
            "The compiler is stored in a separate cloud volume, never in the image",
          ],
          answer: 0,
          explain: "Each `FROM` begins a new stage with its own filesystem. The final stage starts from a minimal base and pulls in only what `COPY --from=build` names — here, just `/pawwalk`. Everything in the build stage, compiler included, is left behind and never shipped.",
          nudge: "Look at what the second `FROM` starts from, and what the single `COPY --from=build` line actually copies.",
        },
        {
          type: "exercise",
          title: "Read the port from the environment",
          prompt: [
            "Containers and platforms tell your app which port to listen on through the `PORT` environment variable. Inside `main`, read it with `port := os.Getenv(\"PORT\")`. Then, if it's empty, default it: `if port == \"\" {` set `port = \"8080\"`. Finally build the listen address with `addr := \":\" + port`.",
          ],
          starter: String.raw`package main

import (
	"net/http"
	"os"
)

func main() {
	// your code here

	http.ListenAndServe(addr, nil)
}`,
          solution: String.raw`package main

import (
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port

	http.ListenAndServe(addr, nil)
}`,
          checks: [
            { re: /port:=os\.Getenv\("PORT"\)/, hint: "Read the environment variable with `port := os.Getenv(\"PORT\")` — `os.Getenv` returns a string, empty if the variable is unset." },
            { re: /if port==""\{/, hint: "Fall back when it's unset: `if port == \"\" {` so the app still runs locally without PORT set." },
            { re: /addr:=":"\+port/, hint: "Build the listen address by prefixing a colon: `addr := \":\" + port` — Go's HTTP server wants `:8080`, not `8080`." },
          ],
          success: "Now the same binary runs on port 8080 locally and whatever port the platform hands it in production — configuration by environment, no rebuild.",
        },
      ],
    },
    {
      id: "graduation",
      title: "Graduation",
      steps: [
        {
          type: "text",
          md: [
            "## Look how far you came",
            "You started this course never having written a line of Go, knowing only that the PawWalk app you built in Part I *asked a server for data*. You are now the person who builds that server.",
            "Retrace the climb:",
            "- **The language** (00–05) — variables and `:=`, slices and maps, structs with methods, interfaces and Go's explicit `error` values, and the goroutines-and-channels model that makes Go *Go*.\n- **The standard-library server** (06–08) — `net/http`, JSON encoding, routing, middleware, and a real database. Go ships a production HTTP server in its standard library; you felt exactly what a request is.\n- **The real PawWalk backend** (09–12) — a proper service layout, config, walkers, JWT **auth**, **bookings** priced in cents, and **tests** that prove it works.\n- **Shipping** (13) — a single cross-compiled binary, a few-megabyte container, a `/healthz` heartbeat, and a deploy you understand end to end.",
          ],
        },
        {
          type: "text",
          md: [
            "## What you can genuinely do now",
            "This wasn't a tour. You can sit down and build a real HTTP service in Go: model the domain with structs and interfaces, expose it over `net/http`, guard it with auth middleware, back it with a database, cover it with `go test`, and ship it in a tiny container behind a health check.",
            "Those are the same bones under Docker, Kubernetes, and a huge share of the APIs running in production today. You now read that code as a native speaker, not a tourist.",
          ],
        },
        {
          type: "text",
          md: [
            "## Where to go next",
            "The service you built is real, but a production system keeps growing. The natural next steps, roughly in order:",
            "- **`context.Context`** — the value threaded through every serious Go server for cancellation, timeouts, and deadlines. Wire it from the request down through your database calls so a client hang-up cancels the work.\n- **Observability** — structured logging with `log/slog`, plus metrics and traces, so you can *see* what production is doing.\n- **Graceful shutdown** — catch the shutdown signal and let in-flight requests finish before the process exits.\n- **gRPC** — when services talk to each other, a typed, high-performance alternative to REST that Go excels at.",
            "And you have a whole monorepo of neighbors to study: the Rails, iOS, and Android PawWalk apps all speak to a backend just like the one you built. Read how they shape the same walkers, bookings, and cents from the other side.",
          ],
        },
        {
          type: "quiz",
          q: "You're extending the PawWalk server so a slow database query is abandoned the moment the client disconnects. Which Go tool is built for exactly that?",
          choices: [
            "context.Context, threaded from the request through your database calls",
            "A second goroutine that polls the connection every second",
            "Setting GOARCH before the query runs",
            "A larger -ldflags version string",
          ],
          answer: 0,
          explain: "`context.Context` carries cancellation and deadlines through a call chain. `*http.Request` already has one via `r.Context()`; pass it into your database calls and the whole operation unwinds the instant the client goes away or a deadline passes. It's the single most important next thing to learn for real Go services.",
          nudge: "It's the value real Go servers thread through every layer to say 'stop, the caller is gone.'",
        },
        {
          type: "text",
          md: [
            "## Congratulations",
            "You set out to learn the other side of the URL, and you built it: a real, tested, deployable Go backend for PawWalk, from zero. That's a genuine, hireable skill — the kind that turns 'I use APIs' into 'I build them.'",
            "Take a lap. Then open the terminal one more time and prove to yourself it all runs.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "You can now…",
          intro: ["Your graduation checklist — every item is a real thing you're now able to do, start to finish, with the PawWalk backend you built."],
          items: [
            "Run the whole service locally: `go run ./cmd/pawwalk` and hit `curl localhost:8080/healthz`",
            "Run the full test suite green: `go test ./...`",
            "Vet and format like a pro before every commit: `go vet ./...` and `go fmt ./...`",
            "Cross-compile the deploy binary: `GOOS=linux GOARCH=amd64 go build -ldflags \"-X main.version=1.0.0\" -o pawwalk ./cmd/pawwalk`",
            "Containerize and run it: `docker build -t pawwalk .` then `docker run -p 8080:8080 pawwalk`",
            "Go read a neighbor: open the Rails, iOS, or Android PawWalk app in this repo and trace one request from the app to a handler you now understand",
            "Celebrate — you're a Go backend developer. 🐹🚀",
          ],
        },
      ],
    },
  ],
});
