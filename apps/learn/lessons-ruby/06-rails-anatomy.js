window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rails-anatomy",
  title: "Rails Anatomy",
  emoji: "🚂",
  lang: "ruby",
  lessons: [
    {
      id: "rails-new",
      title: "rails new",
      steps: [
        {
          type: "text",
          md: [
            "## The Rack app you don't have to write",
            "Last module you hand-rolled a Rack app: a `call(env)` method, an array of `[status, headers, body]`, and a router you wrote yourself with `if`/`elsif` matching on `env[\"PATH_INFO\"]`. It worked, but it was maybe 30 lines of plumbing before you'd written a single line of PawWalk logic — and every new route meant more `elsif`s.",
            "**Rails is that same Rack app, already built, with the plumbing done for you.** Routing, database access, HTML rendering, JSON rendering — all wired up, all following one convention, so you almost never write wiring code again. This module builds one small full-stack Rails app, `dogpark`, so you see every piece of that machine at least once before the course goes API-only for the real PawWalk backend.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Generate the app",
          intro: [
            "Everything in this module happens in `playground/dogpark/` (gitignored — you're never touching a real app):",
          ],
          items: [
            "`cd apps/learn/playground`",
            "`rails new dogpark` — full-stack Rails, SQLite by default, takes a minute the first time",
            "`cd dogpark`",
            "`bin/rails s` — starts the dev server on port 3000",
            "Open [http://localhost:3000](http://localhost:3000) — you should see Rails' welcome page",
          ],
        },
        {
          type: "text",
          md: [
            "## The folder tour",
            "`rails new` sprays out dozens of files. Most of them you'll never touch by hand. A handful map directly onto things you already know:",
            "- **`Gemfile`** — same idea as module 04's `Gemfile`: your dependency list, locked by `Gemfile.lock`, installed with `bundle install`. Rails just pre-fills it with `rails`, `sqlite3`, `puma`, and a few others.\n- **`config.ru`** — go open it. It's a real, tiny Rack app: `run Rails.application`. **The entire multi-thousand-file Rails framework is, at its core, one Rack app** — the same `call(env)` contract you wrote by hand in module 05, just with a mountain of functionality behind that one call.\n- **`app/models/`** — Ruby classes that talk to the database (the `M` in MVC).\n- **`app/controllers/`** — Ruby classes with action methods that handle a request (the `C`).\n- **`app/views/`** — templates that render HTML (the `V`).\n- **`config/routes.rb`** — one file mapping URLs to controller actions, replacing every `elsif` you wrote by hand in module 05.\n- **`db/`** — migrations (versioned database changes) and the SQLite file itself.",
          ],
        },
        {
          type: "code",
          title: "dogpark/config.ru",
          source: String.raw`# This file is used by Rack-based servers to start the application.

require_relative "config/environment"

run Rails.application
Rails.application.load_server`,
          caption: "This is the real file Rails generates. Compare it to your module-05 `config.ru` — same `run` call, same Rack contract. `Rails.application` is just a much bigger object that responds to `call(env)`.",
        },
        {
          type: "text",
          md: [
            "## Convention over configuration",
            "Here's the deal Rails makes with you: put things in the right place, name them the right way, and Rails wires them together with **zero configuration**. A model called `Walker` automatically maps to a database table called `walkers`. A controller called `WalkersController` automatically renders templates from `app/views/walkers/`. You didn't hand-wire any of that — you just followed the naming convention, and Rails inferred the rest.",
            "This is the opposite instinct from the hand-rolled Rack app, where every wire was one you soldered yourself. Rails trades a little bit of \"magic\" (things happening because of a name, not an explicit line of code) for a huge amount of code you never write. The rest of this module is about learning what that magic actually does, so it stops feeling like magic.",
          ],
        },
        {
          type: "quiz",
          q: "You open dogpark's `config.ru` and see `run Rails.application`. What does that tell you about Rails, given what you built in module 05?",
          choices: [
            "Rails itself is a Rack app underneath — `Rails.application` responds to `call(env)` just like your hand-rolled app did, only with routing, models, and views already built on top",
            "`config.ru` is a leftover file Rails doesn't actually use — real routing happens somewhere else entirely",
            "Rails replaces Rack completely; `config.ru` is just there for backwards compatibility with old servers",
            "This only applies to API-only Rails apps, not full-stack ones like dogpark",
          ],
          answer: 0,
          explain: "Every Rails app, full-stack or API-only, is fundamentally a Rack app. `Rails.application` is the object that implements `call(env)` — Rails just builds a router, a stack of models/views/controllers, and a lot of middleware on top of that one entry point.",
          nudge: "You wrote a `call(env)` method by hand last module. `config.ru` calls `run` on something — what's the simplest explanation for what that something has to be?",
        },
      ],
    },
    {
      id: "mvc-in-one-picture",
      title: "MVC in One Picture",
      steps: [
        {
          type: "text",
          md: [
            "## One request, four stops",
            "Every request into dogpark takes the same trip, in the same order:",
            "1. **Browser** sends `GET /walkers` to the dev server.\n2. **`config/routes.rb`** matches the URL to a controller action — `walkers#index`.\n3. **Controller action** runs Ruby code, usually asking a **model** to fetch rows from the database.\n4. **View** takes whatever the controller loaded and renders it into HTML.\n5. That HTML travels back to the browser as the **response**.",
            "That's MVC: **M**odel talks to the database, **V**iew renders HTML, **C**ontroller sits in the middle and coordinates the two. Every folder from the tour maps onto one letter: `app/models` is M, `app/views` is V, `app/controllers` is C. `config/routes.rb` isn't a letter of MVC — it's the map that decides which controller action even runs.",
          ],
        },
        {
          type: "code",
          title: "the request lifecycle",
          source: String.raw`browser
  -> config/routes.rb        (which controller#action?)
  -> app/controllers/*.rb    (the "C" - coordinates the request)
  -> app/models/*.rb         (the "M" - talks to the database)
  -> app/views/**/*.erb      (the "V" - renders HTML)
  -> response back to browser`,
          caption: "Same shape every single time, for every route in every Rails app you'll ever open — including the real `apps/pawwalk-api` later in this course, minus the view step once it's API-only.",
        },
        {
          type: "text",
          md: [
            "## Compare: your module-05 Rack app, in one file",
            "Remember what this same trip looked like when you built it yourself? One `call(env)` method, string-matching `env[\"PATH_INFO\"]` with a chain of `elsif`s, hand-building an HTML string by concatenating Ruby strings, and manually setting `Content-Type` in a headers hash. It worked for one or two routes and got worse with every route you added — no separation between \"figure out what was asked\" and \"build the database query\" and \"produce the HTML.\"",
            "Rails' whole pitch is separating those three concerns into three kinds of files (models, views, controllers) plus one router — so adding route number twelve is exactly as easy as adding route number two.",
          ],
        },
        {
          type: "quiz",
          q: "A `GET /walkers` request comes in. Put these MVC stops in the order Rails actually visits them.",
          choices: [
            "routes.rb decides the controller#action -> the controller asks the model for data -> the view renders HTML -> response goes back",
            "The view renders first, then the controller decides which model to use, then routes.rb checks if that was allowed",
            "The model runs first and builds its own HTML, then hands it to the controller, then routes.rb logs the request",
            "All four run at the same time, in parallel, and Rails merges the results",
          ],
          answer: 0,
          explain: "Routing always happens first — nothing else can run until Rails knows which controller action owns this request. The controller then pulls data via the model, and only at the very end does a view turn that data into HTML.",
          nudge: "Which file has to be consulted before Rails even knows WHICH controller method to call?",
        },
      ],
    },
    {
      id: "scaffold-a-walker",
      title: "Scaffold a Walker",
      steps: [
        {
          type: "text",
          md: [
            "## The scaffold generator",
            "Rails ships a generator that builds a complete model + controller + views + migration + route in one command, matching the exact shape you'd build by hand for a simple resource. It's a teaching tool as much as a shortcut here — run it once, read everything it created, and you've seen every piece Rails expects a resource to have.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Generate and migrate the Walker resource",
          intro: ["Still inside `dogpark/`:"],
          items: [
            "`bin/rails g scaffold Walker name:string city:string price_per_30_min_cents:integer`",
            "`bin/rails db:migrate`",
            "`bin/rails s` (if it's not already running)",
            "Open [http://localhost:3000/walkers](http://localhost:3000/walkers) and use the **New walker** link to create one",
          ],
        },
        {
          type: "code",
          title: "real output of the scaffold command",
          source: String.raw`      invoke  active_record
      create    db/migrate/20260703160546_create_walkers.rb
      create    app/models/walker.rb
      invoke    test_unit
      create      test/models/walker_test.rb
      create      test/fixtures/walkers.yml
      invoke  resource_route
       route    resources :walkers
      invoke  scaffold_controller
      create    app/controllers/walkers_controller.rb
      invoke    erb
      create      app/views/walkers
      create      app/views/walkers/index.html.erb
      create      app/views/walkers/edit.html.erb
      create      app/views/walkers/show.html.erb
      create      app/views/walkers/new.html.erb
      create      app/views/walkers/_form.html.erb
      create      app/views/walkers/_walker.html.erb
      invoke    resource_route
      invoke    test_unit
      create      test/controllers/walkers_controller_test.rb
      invoke    helper
      create      app/helpers/walkers_helper.rb
      invoke      test_unit
      invoke    jbuilder
      create      app/views/walkers/index.json.jbuilder
      create      app/views/walkers/show.json.jbuilder
      create      app/views/walkers/_walker.json.jbuilder`,
          caption: "That's every MVC piece from one command: a migration, a model, a controller with 7 actions (next lesson), 5 HTML view templates plus 3 JSON `.jbuilder` templates, a route, and generated tests. Trimmed to the create/invoke lines you'd actually read.",
        },
        {
          type: "code",
          title: "dogpark/db/migrate/..._create_walkers.rb",
          source: String.raw`class CreateWalkers < ActiveRecord::Migration[8.1]
  def change
    create_table :walkers do |t|
      t.string :name
      t.string :city
      t.integer :price_per_30_min_cents

      t.timestamps
    end
  end
end`,
          caption: "A migration is a versioned, reversible instruction for changing the database schema. `t.timestamps` is free — it adds `created_at` and `updated_at` columns Rails maintains for you automatically.",
        },
        {
          type: "code",
          title: "dogpark/app/models/walker.rb",
          source: String.raw`class Walker < ApplicationRecord
end`,
          caption: "That's the WHOLE file. An empty class inheriting from `ApplicationRecord` already knows how to save, find, update, and destroy rows — because `name`, `city`, and `price_per_30_min_cents` exist as real columns, ActiveRecord infers everything else. Module 07 goes deep on how.",
        },
        {
          type: "text",
          md: [
            "## What the controller got — 7 actions for free",
            "`app/controllers/walkers_controller.rb` came out with exactly 7 methods: `index`, `show`, `new`, `create`, `edit`, `update`, `destroy`. That's not a coincidence — it's the standard set of operations for any resource in a RESTful app (list, view-one, show-a-form, save-a-new-one, show-an-edit-form, save-an-edit, delete). Next lesson's routes table names each one.",
          ],
        },
        {
          type: "quiz",
          q: "You ran the scaffold command once and got a migration, a model, a controller, six view templates, and a route — all before writing a line of code yourself. What made that possible?",
          choices: [
            "Rails' scaffold generator reads the `name:string city:string ...` arguments and builds every conventional MVC file a simple resource needs, following the same naming conventions you'd have to hand-write anyway",
            "Rails scanned your database and reverse-engineered a `walkers` table that already existed",
            "The scaffold command only works for the very first model in a new app — later models need everything written by hand",
            "It's a copy-paste template with the word \"Walker\" swapped in from a generic example file",
          ],
          answer: 0,
          explain: "The generator takes the model name and column list, then writes every file convention-over-configuration says a resource needs — migration, model, controller with 7 actions, views, and a route. It's ordinary code generation, not magic, and it works for the 50th model exactly the same as the 1st.",
          nudge: "Look at the column names you typed on the command line — where else did those same names show up in the generated files?",
        },
        {
          type: "exercise",
          title: "Name the missing piece",
          prompt: [
            "Given the scaffold output above, a `Booking` resource with the same shape would need a model class definition. Write it: `class Booking` inheriting from `ApplicationRecord`, then `end`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`class Booking < ApplicationRecord
end`,
          checks: [
            { re: /class Booking<ApplicationRecord/, hint: "Inherit from ApplicationRecord: `class Booking < ApplicationRecord`." },
            { re: /end/, hint: "Close the class with `end`." },
          ],
          success: "Same empty-but-powerful shape as Walker — every column on the `bookings` table becomes an attribute automatically, no code required.",
        },
      ],
    },
    {
      id: "routes",
      title: "Routes",
      steps: [
        {
          type: "text",
          md: [
            "## resources :walkers = 7 routes, one line",
            "Open `config/routes.rb` and you'll find exactly one line the scaffold added: `resources :walkers`. That single line generates all 7 RESTful routes — the same 7 actions the controller got. You never write `get \"/walkers\"`, `post \"/walkers\"`, and five more lines by hand; `resources` is that whole table, compressed to one word.",
          ],
        },
        {
          type: "code",
          title: "real output of `bin/rails routes -g walkers`",
          source: String.raw`     Prefix Verb   URI Pattern                 Controller#Action
    walkers GET    /walkers(.:format)          walkers#index
            POST   /walkers(.:format)          walkers#create
 new_walker GET    /walkers/new(.:format)      walkers#new
edit_walker GET    /walkers/:id/edit(.:format) walkers#edit
     walker GET    /walkers/:id(.:format)      walkers#show
            PATCH  /walkers/:id(.:format)      walkers#update
            PUT    /walkers/:id(.:format)      walkers#update
            DELETE /walkers/:id(.:format)      walkers#destroy`,
          caption: "`-g walkers` filters the full routes table to just this resource. `PATCH` and `PUT` both point at `update` — Rails accepts either verb for an edit. Notice there's no separate route for JSON; the same URL serves HTML or JSON depending on what the client asks for (`.json` or an `Accept` header).",
        },
        {
          type: "text",
          md: [
            "## Path helpers — never hand-type a URL",
            "That **Prefix** column (`walkers`, `new_walker`, `edit_walker`, `walker`) isn't decoration — Rails turns each prefix into a Ruby method that builds the matching path: `walkers_path` returns `\"/walkers\"`, `walker_path(1)` returns `\"/walkers/1\"`, `new_walker_path` returns `\"/walkers/new\"`. You'll use these constantly in views and controllers (`redirect_to walkers_path`) instead of ever writing a URL as a raw string — if the route ever changes, every helper call updates automatically.",
          ],
        },
        {
          type: "text",
          md: [
            "## root, and only:/except:",
            "`root \"walkers#index\"` in `routes.rb` sets what `GET /` itself shows — without it, hitting `/` just shows Rails' generic welcome page forever. And `resources` doesn't have to mean all 7 routes: `only:` and `except:` narrow it down, which matters a lot once an API only needs some of the 7 (a booking, for instance, is rarely edited in place — you cancel and recreate it instead).",
          ],
        },
        {
          type: "code",
          title: "dogpark/config/routes.rb — narrowing a resource",
          source: String.raw`Rails.application.routes.draw do
  resources :walkers
  root "walkers#index"
end`,
          caption: "Setting `root` means the welcome page is gone the moment you reload `http://localhost:3000` — you'll land straight on the walkers index instead.",
        },
        {
          type: "quiz",
          q: "The real PawWalk backend will need `resources :bookings` but a booking is created and cancelled, never edited in place via a form. Which route declaration fits that?",
          choices: [
            "`resources :bookings, only: %i[index show create]` — just the 3 actions a booking actually needs, no `new`/`edit`/`update`/`destroy` routes generated at all",
            "`resources :bookings` — always generate all 7, unused ones simply won't be called",
            "`resources :bookings, except: [:index]` — remove only the listing action",
            "You can't restrict which routes `resources` generates — that requires writing each route by hand",
          ],
          answer: 0,
          explain: "`only:` (or `except:`) trims `resources` down to exactly the actions a resource needs — index/show/create here, since bookings are listed, viewed, and created, but never edited via a web form. Fewer routes means fewer controller actions to write and fewer ways to misuse the API.",
          nudge: "The lesson named the two keywords that narrow `resources` down from all 7. Which one lets you name just the 3 you want to KEEP?",
        },
        {
          type: "exercise",
          title: "Restrict a resource",
          prompt: [
            "Write a single `resources :bookings, only: %i[index show create]` line — foreshadowing the exact shape the real PawWalk backend will use for bookings.",
          ],
          starter: String.raw`Rails.application.routes.draw do
  # your code here
end`,
          solution: String.raw`Rails.application.routes.draw do
  resources :bookings, only: %i[index show create]
end`,
          checks: [
            { re: /resources:bookings,only:%i\[index show create\]/, hint: "Match the exact shape: `resources :bookings, only: %i[index show create]`." },
          ],
          mustNot: [
            { re: /except/, hint: "Use `only:`, not `except:` — you're naming the routes to KEEP, not remove." },
          ],
          success: "This is the exact line the PawWalk API will use for bookings once module 11 gets there — index, show, and create, nothing else.",
        },
      ],
    },
    {
      id: "rails-console",
      title: "rails console",
      steps: [
        {
          type: "text",
          md: [
            "## bin/rails console — a REPL wired into your whole app",
            "`irb` gives you a plain Ruby REPL. `bin/rails console` gives you the SAME REPL, but with your entire app already loaded — every model class, every gem, the whole database connection. It's the fastest way to poke at data without opening the browser or writing a script.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Open the console",
          intro: ["Still inside `dogpark/`:"],
          items: [
            "`bin/rails console`",
            "Type `Walker.create!(name: \"Priya\", city: \"Austin\", price_per_30_min_cents: 2400)` and press enter",
            "Type `Walker.all` and press enter",
            "Type `exit` when you're done",
          ],
        },
        {
          type: "code",
          title: "real bin/rails console session",
          source: String.raw`Loading development environment (Rails 8.1.3)
dogpark(dev)> Walker.create!(name: "Priya", city: "Austin", price_per_30_min_cents: 2400)
#<Walker:0x000000010ad7ca20
 id: 1,
 city: "Austin",
 created_at: "2026-07-03 16:06:47.861926000 +0000",
 name: "Priya",
 price_per_30_min_cents: 2400,
 updated_at: "2026-07-03 16:06:47.861926000 +0000">
dogpark(dev)> Walker.create!(name: "Ben", city: "Denver", price_per_30_min_cents: 2000)
#<Walker:0x000000010b370508
 id: 2,
 city: "Denver",
 created_at: "2026-07-03 16:06:47.866129000 +0000",
 name: "Ben",
 price_per_30_min_cents: 2000,
 updated_at: "2026-07-03 16:06:47.866129000 +0000">
dogpark(dev)> Walker.all
[#<Walker:0x000000010b1358d8 id: 1, name: "Priya", city: "Austin", ...>,
 #<Walker:0x000000010b135798 id: 2, name: "Ben", city: "Denver", ...>]
dogpark(dev)> Walker.find_by(city: "Austin")
#<Walker:0x000000010b134258
 id: 1,
 city: "Austin",
 created_at: "2026-07-03 16:06:47.861926000 +0000",
 name: "Priya",
 price_per_30_min_cents: 2400,
 updated_at: "2026-07-03 16:06:47.861926000 +0000">`,
          caption: "The prompt itself, `dogpark(dev)>`, names your app and environment — Rails 8's console shows you exactly what you're connected to. `Walker.all` output trimmed with `...` for readability; every attribute is really there.",
        },
        {
          type: "text",
          md: [
            "## The methods you just used, for free",
            "`.create!`, `.all`, `.find`, `.find_by`, `.update!`, `.destroy` — every one of these came from writing **zero lines of code** in `Walker`. They exist purely because `class Walker < ApplicationRecord`. `.create!` builds a row and saves it (raising if invalid — remember the `!` convention from module 04). `.all` returns every row. `.find(id)` looks up by primary key and raises if missing. `.find_by(city: \"Austin\")` returns the first match or `nil`. `.update!` changes columns and saves. `.destroy` deletes the row. Module 07 goes deep on where all of this actually comes from.",
          ],
        },
        {
          type: "quiz",
          q: "`Walker` is one empty class: `class Walker < ApplicationRecord; end`. Yet `Walker.find_by(city: \"Austin\")` works immediately in the console. Why?",
          choices: [
            "Inheriting from `ApplicationRecord` gives every model a full set of database methods for free, driven by the columns that already exist on its table",
            "The scaffold generator secretly wrote a `find_by` method into `walker.rb` that isn't shown in the file",
            "`find_by` only works inside `bin/rails console`, never in real controller code",
            "You have to call `Walker.enable_queries!` once before any finder methods work",
          ],
          answer: 0,
          explain: "ActiveRecord (the `M` in MVC) inspects the table's columns and gives every subclass of `ApplicationRecord` a full set of finder, save, and delete methods automatically — no per-model code needed. This is convention over configuration applied to the database layer specifically.",
          nudge: "You looked at the entire contents of `walker.rb` two lessons ago. How many lines of custom code were in it?",
        },
        {
          type: "exercise",
          title: "Capstone: create and look up a Walker",
          prompt: [
            "Write the two lines you'd type into `bin/rails console`: create a Walker named `\"Sam\"` in `\"Boston\"` at `1800` cents with `Walker.create!`, then look them up again with `Walker.find_by(city: \"Boston\")`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`Walker.create!(name: "Sam", city: "Boston", price_per_30_min_cents: 1800)
Walker.find_by(city: "Boston")`,
          checks: [
            { re: /Walker\.create!\(name:"Sam",city:"Boston",price_per_30_min_cents:1800\)/, hint: "Match the create call exactly: `Walker.create!(name: \"Sam\", city: \"Boston\", price_per_30_min_cents: 1800)`." },
            { re: /Walker\.find_by\(city:"Boston"\)/, hint: "Look it back up: `Walker.find_by(city: \"Boston\")`." },
          ],
          success: "Every method there — create!, find_by — is free from ApplicationRecord. Module 07 opens the hood on exactly how.",
        },
      ],
    },
  ],
});
