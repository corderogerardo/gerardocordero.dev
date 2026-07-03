window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "ruby-welcome",
  title: "Welcome to Ruby",
  emoji: "👋",
  lang: "ruby",
  lessons: [
    {
      id: "why-ruby-rails",
      title: "Why Ruby & Rails",
      steps: [
        {
          type: "text",
          md: [
            "## A language designed for happiness",
            "Ruby was created in the mid-1990s by Yukihiro \"Matz\" Matsumoto, a Japanese programmer who was blunt about his goal: he wanted a language optimized for **programmer happiness**, not raw machine efficiency. Every design choice — no semicolons to forget, methods named `empty?` and `save!`, blocks that read like English — traces back to that one sentence.",
            "You've written JS/TS, some Python, some Swift. Ruby will feel the most *readable* of all of them on day one. Look at this and guess what it does before you've learned a single keyword:",
            "```\n3.times { puts \"walkies!\" }\n```",
            "That's real, runnable Ruby. \"3, times, do this.\" No `for (let i = 0; i < 3; i++)` ceremony. That readability is the whole pitch.",
          ],
        },
        {
          type: "text",
          md: [
            "## Rails: convention over configuration",
            "Ruby is the language. **Rails** is a web framework written in Ruby, and its founding idea is *convention over configuration*: instead of you deciding where models go, how routes map to code, and how the database talks to your objects, Rails already decided — and if you follow the convention, it all just works with almost no setup.",
            "That's a deliberate trade against something like Flask or Express, where you wire every piece by hand. Rails bets that 90% of web apps have the same shape, so it hands you that shape for free and only asks you to fill in what's actually unique to *your* app.",
            "Rails is also **battle-tested at serious scale** — GitHub, Shopify, and Stripe all built (or still run) core parts of their business on Rails. \"Convention over configuration\" isn't a toy-project shortcut; it holds up under real traffic.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why this course: you're building PawWalk's real backend",
            "This isn't a syntax tour that ends in a quiz. Starting at module 09, you build **PawWalk's actual production backend** at `apps/pawwalk-api` — the dog-walking marketplace: walkers, bookings, prices stored in cents, live GPS tracking while a walk is in progress. Real models, real endpoints, real tests. By the final module you deploy it for real, with Kamal.",
            "Every earlier module exists to make that build feel inevitable instead of magical — by the time you write `class Booking < ApplicationRecord`, you'll already know exactly what every piece of that line means.",
          ],
        },
        {
          type: "text",
          md: [
            "## The course map",
            "- **Modules 00–04 — pure Ruby.** Variables, strings, collections, blocks, classes, error handling — the language itself, no web framework yet.\n- **Modules 05–08 — how the web (and Rails) actually work.** Rack, the anatomy of a Rails app, ActiveRecord, REST controllers.\n- **Modules 09–15 — build & deploy PawWalk.** Auth, bookings, payments and background jobs, live tracking, testing, and shipping to production with Kamal.",
            "Each stage only exists to unlock the next one — by module 09 nothing in the real backend will look unfamiliar.",
          ],
        },
        {
          type: "text",
          md: [
            "## How this course actually works",
            "Every lesson mixes three kinds of steps: **text** you read, **code** samples you study (real, runnable Ruby — never pseudocode), and **exercises** where you type real code yourself and it gets checked instantly. Reading about `#{}` interpolation is not the same as typing it once with your own hands — the exercises are where it actually sticks.",
            "> There's no video, no slides. Read, then type. That's the whole format, for all sixteen modules.",
          ],
        },
        {
          type: "quiz",
          q: "What's the core idea behind Rails's \"convention over configuration\"?",
          choices: [
            "Rails already decided the common defaults (file layout, routing, DB mapping), so you only configure what's actually unique to your app",
            "Rails has no configuration options at all — everything is hardcoded",
            "You must configure every route and model by hand, same as Flask or Express",
            "It means Rails only works if you follow a strict naming convention with no exceptions ever allowed",
          ],
          answer: 0,
          explain: "Convention over configuration means Rails ships sane defaults for the 90% case — model/table naming, routing, folder structure — so you write almost no boilerplate and reserve configuration for what's genuinely special about your app.",
          nudge: "Think about what Rails is betting on: that most web apps share the same shape. What does it do with that bet?",
        },
      ],
    },
    {
      id: "set-up-your-machine",
      title: "Set up your machine",
      steps: [
        {
          type: "text",
          md: [
            "## Don't touch the system Ruby",
            "Your Mac already has a `ruby` command — try `ruby -v` in a terminal right now. That's **Apple's system Ruby**, and it's ancient (macOS has shipped Ruby 2.6 for years, while Ruby is at 3.4 today). It exists only so some old macOS internals keep working. Never `gem install` into it, never rely on it for real work — you're about to install a modern, separate Ruby that takes over for everything you actually run.",
          ],
        },
        {
          type: "text",
          md: [
            "## What a version manager is",
            "A **version manager** lets your machine hold multiple versions of a language side by side and switch between them per-project, instead of being stuck with whatever your OS shipped. You'll use **mise** — one tool that manages Ruby, Node, Python, and more, all with the same commands. If you've used `nvm` or `pyenv` before, mise is the same idea, just language-agnostic.",
            "Once mise installs Ruby 3.4 and sets it as your global default, plain `ruby` and `gem` commands in any new terminal use it automatically — no `source` incantations, no manually exporting `PATH`.",
          ],
        },
        {
          type: "text",
          md: [
            "## Gems and Rails",
            "A **gem** is Ruby's word for a package — the same idea as an npm package or a Python wheel. `gem install` fetches one from RubyGems.org (Ruby's npm/PyPI equivalent) and makes it available on your machine. **Rails itself ships as a gem** — installing it is one `gem install rails` away, and it pulls in every other gem it depends on automatically.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Install Ruby, mise, and Rails",
          intro: ["Time to get a real, modern Ruby running. Every step below happens in your terminal, not the browser."],
          items: [
            "`brew install mise`",
            "Add `eval \"$(mise activate zsh)\"` to `~/.zshrc`, then open a fresh terminal",
            "`mise use -g ruby@3.4` — installs Ruby 3.4.x and makes it your global default",
            "`gem install rails` — installs Rails 8.1",
            "Verify: `ruby -v` shows 3.4.x, `rails -v` shows 8.1.x",
          ],
        },
        {
          type: "text",
          md: [
            "## Why this matters before you type a line of Ruby",
            "Everything from here on assumes that fresh `ruby -v` and `rails -v` output. If a later module's code sample doesn't behave the way the lesson says, the very first thing to check is which Ruby is actually running — `which ruby` should point inside mise's install, never `/usr/bin/ruby`.",
          ],
        },
        {
          type: "quiz",
          q: "You run `gem install rails`. What does that command actually do?",
          choices: [
            "Downloads the Rails gem (and every gem it depends on) from RubyGems.org and installs it for the active Ruby",
            "Downloads the Ruby language itself",
            "Only installs Rails's documentation, not the framework",
            "Nothing — Rails is bundled inside Ruby already",
          ],
          answer: 0,
          explain: "`gem` is RubyGems, Ruby's package manager. `gem install rails` fetches the Rails package (and its dependencies) from RubyGems.org and installs it for whichever Ruby is currently active — which is why installing mise's Ruby 3.4 first matters.",
          nudge: "What's a \"gem\" in Ruby — and where does `gem install` actually fetch one from?",
        },
      ],
    },
    {
      id: "hello-ruby",
      title: "Hello, Ruby",
      steps: [
        {
          type: "text",
          md: [
            "## irb: type a line, see an answer",
            "Open a terminal and type `irb` — Interactive Ruby, a REPL you already have thanks to mise. Every line you type runs immediately and prints its result:",
            "```\n$ irb\nirb(main):001> 2 + 2\n=> 4\n```",
            "Keep an `irb` tab open through this whole course. When you're not sure what something does, don't guess — try it.",
          ],
        },
        {
          type: "text",
          md: [
            "## A first taste of interpolation",
            "Ruby builds strings with `#{}` — drop any expression inside a double-quoted string and it's evaluated and inserted:",
            "```\nname = \"Mochi\"\nputs \"Hello, #{name}!\"   # Hello, Mochi!\n```",
            "That's just a teaser — module 01 goes deep on exactly how this works and where it can trip you up. For now, just notice: no special prefix, no backslash, just `#{...}` inside quotes.",
          ],
        },
        {
          type: "code",
          title: "playground/hello.rb",
          source: String.raw`name = "Mochi"
puts "Hello, #{name}!"`,
          caption: "Run it with `ruby hello.rb` — no compile step, no project file. Ruby reads the file top to bottom and runs it.",
        },
        {
          type: "text",
          md: [
            "## Running a real file",
            "`irb` is for quick one-liners. Anything you want to save and re-run goes in a `.rb` file, run with `ruby <filename>`:",
            "```\n$ ruby hello.rb\nHello, Mochi!\n```",
            "That's the entire ceremony — one command, no build step.",
          ],
        },
        {
          type: "text",
          md: [
            "## A taste of Ruby's expressiveness",
            "One more sample, and this one's just for the \"whoa\" — don't worry about *how* it works yet, blocks get a full module later:",
            "```\n3.times { puts \"walkies!\" }\n```",
            "```\nwalkies!\nwalkies!\nwalkies!\n```",
            "`3` is a number, `.times` is a method on it, and `{ ... }` is a little chunk of code handed to that method to run three times. You'll spend real time on this shape soon — for now, just enjoy how little punctuation it takes.",
          ],
        },
        {
          type: "exercise",
          title: "Greet and repeat",
          prompt: [
            "Declare a local variable `name` set to `\"PawWalk\"`. Print an interpolated greeting reading exactly `Hello, PawWalk!` using `puts` and `#{}`. Then use `3.times` with a block to print `walkies!` three times.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`name = "PawWalk"
puts "Hello, #{name}!"
3.times { puts "walkies!" }`,
          checks: [
            { re: /name="PawWalk"/, hint: "Assign the string directly, no keyword: `name = \"PawWalk\"`." },
            { re: /puts"Hello,#\{name\}!"/, hint: "Interpolate inside double quotes: `puts \"Hello, #{name}!\"`." },
            { re: /3\.times\{puts"walkies!"\}/, hint: "Call `.times` on `3` with a block: `3.times { puts \"walkies!\" }`." },
          ],
          success: "irb to poke around, a `.rb` file to save your work, `#{}` to interpolate, and `3.times { ... }` to hint at how much Ruby can say in one line — that's your very first contact with the language.",
        },
      ],
    },
  ],
});
