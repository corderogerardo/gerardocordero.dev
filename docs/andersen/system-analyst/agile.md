# Agile & delivery ecosystem — Scrum, Kanban, QA, UX, DevOps

### Agile methodologies overview
**They ask:** "What Agile software development methodologies do you know, and how do they differ at a high level?"

Agile is the umbrella value system (iterative delivery, customer collaboration, responding to change over following a plan); Scrum, Kanban, XP, and Lean are concrete frameworks that implement it differently. Scrum organizes work into fixed-length sprints with defined roles and ceremonies — it fits work that benefits from a regular planning/review cadence. Kanban is continuous-flow with no fixed iterations — it fits support/maintenance work where priorities shift faster than a sprint boundary. XP adds engineering practices (pair programming, TDD, continuous integration) on top of an iterative cadence. Knowing the distinction matters because picking the wrong one for the work shape creates friction the team blames on "Agile" generally.

**Say it:** "Agile is the value system; Scrum, Kanban, and XP are frameworks that implement it differently — I pick based on the work's shape, sprint cadence for planned feature work, continuous flow for support, not by default."
**Red flag:** Using "Agile" and "Scrum" interchangeably. Scrum is one framework under the Agile umbrella; conflating them signals shallow familiarity with the alternatives.

### Scrum roles, artifacts, and events
**They ask:** "Walk me through Scrum's roles, artifacts, and events, and why each one exists."

Every Scrum element exists to solve a specific coordination problem. Roles: Product Owner owns the backlog and priority (one voice for "what matters"), Scrum Master removes impediments and protects the process (not a project manager), the Dev Team self-organizes to deliver. Artifacts: the Product Backlog is the single ranked source of future work, the Sprint Backlog is the current commitment, the Increment is the shippable output. Events: Sprint Planning sets the commitment, Daily Scrum surfaces blockers fast, Sprint Review demos to stakeholders and gathers feedback, Retrospective improves the process itself.

**Say it:** "Every Scrum artifact and event solves a specific coordination problem — the Daily Scrum exists to surface blockers within 24 hours, not as a status report, and the Retrospective is the one ceremony dedicated to improving how the team works, not what it builds."
**Red flag:** Running the Daily Scrum as a status update to the Scrum Master. It's a peer sync for the dev team to re-plan the next 24 hours, not a reporting ritual.

### Scrum team metrics
**They ask:** "What metrics would you track to evaluate a Scrum team's performance?"

Velocity (story points completed per sprint) is the headline metric, but it's only useful for that team's own forward planning — comparing velocity *across* teams is a classic anti-pattern since point scales aren't standardized. Burndown/burnup charts show whether a sprint or release is tracking to plan in real time. Sprint predictability (committed vs. completed) flags estimation or scope-creep problems. Cycle time and a healthy Retrospective action-item completion rate round out the picture — the second one measures whether the team is actually improving, not just shipping.

**Say it:** "Velocity is for one team's own planning, never for cross-team comparison — the metric I actually watch for team health is whether Retrospective action items get followed through, because that's the signal continuous improvement is real, not theater."
**Red flag:** Ranking teams against each other by velocity. Point scales are team-relative by design; comparing them across teams incentivizes point inflation, not real improvement.

### Kanban board and WIP limits
**They ask:** "What is a Kanban board, and what do WIP limits actually enforce?"

A Kanban board visualizes the flow of work through stages (To Do → In Progress → Review → Done); the WIP (work-in-progress) limit caps how many items can sit in a given column at once. The point of the limit isn't bureaucracy — it forces the team to finish work before starting new work, which surfaces bottlenecks immediately (a column hitting its cap is a visible signal to swarm and unblock it) instead of letting everyone start ten things and finish none.

**Say it:** "A WIP limit's job is forcing 'finish before start' — when a column hits its cap, that's a visible bottleneck signal to swarm, not a rule to work around by raising the limit."
**Red flag:** Raising the WIP limit the moment a column gets congested instead of treating congestion as the signal it's designed to surface. That defeats the entire mechanism.

### Kanban vs. Scrum — when each fits
**They ask:** "When would you recommend Kanban over Scrum for a project?"

Kanban fits when priorities shift faster than a sprint boundary can absorb — support/maintenance queues, ops work, or any stream where "what's most urgent" changes daily and a fixed two-week commitment would just get constantly re-planned anyway. Scrum fits planned feature work where a regular cadence of planning, review, and retrospective adds real value. The advantage of Kanban is flexibility and continuous delivery without ceremony overhead; the disadvantage is it gives up the forecasting predictability a sprint commitment provides, and a team without WIP discipline can drift into an unmanaged queue.

**Say it:** "I reach for Kanban when priority genuinely shifts faster than a sprint boundary — a support queue — and Scrum when planned feature work benefits from a regular cadence; using Kanban for planned work usually means the team wanted to skip commitment, not that flow suited the work."
**Red flag:** Recommending Kanban because "the team doesn't like committing to a sprint." That's avoiding accountability, not a genuine flow-based reason to change frameworks.

### Scaled Agile — SAFe, LeSS, Nexus
**They ask:** "What are SAFe, LeSS, and Nexus, and how do they differ from standard Scrum?"

These frameworks exist because Scrum was designed for one team, and coordinating multiple Scrum teams on one product needs an explicit mechanism for cross-team dependency and integration — without one, teams silently block each other. SAFe (Scaled Agile Framework) adds a layered structure (team, program, portfolio) with Program Increment planning across many teams — heavyweight, and it fits large enterprises. LeSS (Large-Scale Scrum) stays deliberately minimal — one Product Backlog, one Product Owner, extending vanilla Scrum rather than adding new layers. Nexus sits between them — a lightweight layer (a Nexus Integration Team) coordinating 3–9 Scrum teams sharing one backlog and integrating continuously.

**Say it:** "All three solve the same problem — cross-team dependencies Scrum wasn't designed for — SAFe adds the most structure for large enterprises, LeSS stays closest to vanilla Scrum, Nexus is the lightweight middle ground for a handful of coordinated teams."
**Red flag:** Recommending SAFe for a 15-person product with two teams. That's enterprise-scale process overhead for a problem two teams can solve with a shared backlog and a weekly sync.

### The QA role and core artifacts
**They ask:** "What's a QA's role on a project, and what artifacts does the analyst hand off to them or receive from them?"

QA's job is validating that what got built matches what was specified and catching what the spec itself missed — which means the analyst's requirements are QA's primary input, and a badly written requirement produces an untestable test case downstream. Core artifacts: test plans/test cases derived from acceptance criteria, and bug reports flowing back. The tighter the requirement (unambiguous, atomic, with acceptance criteria — the same qualities that make it well-verified), the less back-and-forth QA needs to write a correct test case.

**Say it:** "A vague requirement doesn't just risk a wrong build — it produces an untestable test case, so the same 'unambiguous, testable, atomic' bar I hold requirements to is what makes QA's job possible downstream."
**Red flag:** Treating QA as a phase that starts after development, disconnected from requirements. Involving QA at requirements review time catches ambiguity before it becomes a defect.

### Testing type classification
**They ask:** "Give a classification of testing types an analyst should be conversant in."

By level: unit (single function/component), integration (components talking to each other), system (the whole application), acceptance (does it meet the business requirement — often where the analyst is most directly involved). By approach: functional (does it do what it should) versus non-functional (performance, security, usability — testing the NFRs the analyst elicited). By automation: manual versus automated. Knowing where UAT (User Acceptance Testing) sits — the last gate before the client signs off, run against the analyst's own acceptance criteria — is the piece most relevant to the SA role specifically.

**Say it:** "The level I care most about as an analyst is acceptance and UAT — it's tested directly against my acceptance criteria, so a gap there usually traces back to a gap in how I wrote the requirement."
**Red flag:** Listing testing types without connecting any of them back to how they relate to requirements quality. That's trivia recall, not working knowledge of the handoff.

### Defect classification and writing bug reports
**They ask:** "How do you classify a defect, and what makes a bug report actually actionable?"

Defects classify by severity (how badly it breaks the system — crash vs. cosmetic) and priority (how urgently it needs fixing — which isn't always the same axis; a cosmetic bug on the checkout button can outrank a severe bug in a rarely used admin screen). A useful bug report has reproducible steps, expected vs. actual behavior, environment, and evidence (screenshot/log) — without steps to reproduce, a developer is debugging blind and the ticket bounces back with "can't reproduce."

**Say it:** "Severity and priority are different axes — a cosmetic bug on the checkout flow can outrank a severe bug in an admin screen nobody uses — and a bug report without reproduction steps just bounces back unactioned."
**Red flag:** Filing a bug report as "it doesn't work" with no repro steps or expected/actual behavior. That guarantees a round trip before anyone can even start investigating.

### UX vs. UI — and the designer's role
**They ask:** "What's the difference between UX and UI, and how does the analyst work with the designer?"

UX (user experience) is the whole journey — is the flow logical, does it solve the user's actual problem, how does it feel to use; UI (user interface) is the visual and interactive layer that flow is expressed through — color, typography, component states. An analyst can ship a beautiful UI on top of a broken UX and the product still fails. The designer owns turning requirements and personas into wireframes and high-fidelity mockups; the analyst's job is feeding them a clear problem (personas, journeys, acceptance criteria) and reviewing the output against the *requirement*, not personal taste.

**Say it:** "UX is whether the flow solves the problem; UI is what that flow looks like — a gorgeous UI on a broken UX still fails the user, so I review designer output against the requirement and the persona, not my own taste."
**Red flag:** Giving design feedback as personal preference ("I'd make this button blue") instead of tying it back to a requirement, persona need, or usability concern. That's not actionable, and it's not the analyst's lane.

### Collaborating with design — color, Figma, and specs
**They ask:** "At a senior level, what does hands-on collaboration with a designer look like?"

Beyond reviewing output, senior analysts get comfortable enough in the tooling (Figma) to leave inline comments, check states the designer might have missed (empty states, error states, loading states — the states a requirement often forgets to call out), and understand basic color/accessibility principles (contrast ratios, color-blind-safe palettes) well enough to flag an accessibility NFR before it reaches QA. This isn't doing the designer's job — it's closing the gap between "here's a requirement" and "here's a testable, complete design."

**Say it:** "I comment directly in Figma on missing states — empty, error, loading — because those are exactly the states a requirement tends to skip, and catching them there is cheaper than catching them in QA."
**Red flag:** Reviewing only the "happy path" screen a designer shares and missing that error/empty/loading states were never designed at all.

### DevOps goals and CI/CD/CD
**They ask:** "What does DevOps aim to achieve, and what's the actual difference between Continuous Integration, Delivery, and Deployment?"

DevOps closes the gap between building software and running it reliably — its goal is fast, safe, frequent releases instead of large, risky ones. The three C's build on each other: Continuous Integration merges code into a shared branch frequently with automated build/test on every merge, catching integration bugs early. Continuous Delivery takes that further — every change is automatically built, tested, and packaged into a release-ready state, but a human still triggers the actual release. Continuous Deployment removes that last gate — every change that passes the pipeline ships to production automatically.

**Say it:** "CI catches integration bugs on every merge, Continuous Delivery gets every change release-ready with a human still pulling the trigger, Continuous Deployment removes that last gate entirely — the difference is exactly where the human checkpoint sits."
**Red flag:** Using "Continuous Delivery" and "Continuous Deployment" interchangeably. The distinction — whether a human approves the final release step — is the entire point of naming them separately.

### Gitflow and CI tooling
**They ask:** "What's the Gitflow branching model, and what do tools like Jenkins or TeamCity actually do?"

Gitflow structures branches by purpose and lifecycle: `main` holds production-ready code, `develop` is the integration branch, `feature/*` branches isolate work-in-progress, `release/*` branches stabilize a version before it ships, and `hotfix/*` branches patch production directly. It exists to keep production stable while multiple features are in flight simultaneously. CI servers (Jenkins, TeamCity, TFS/Azure DevOps) are the automation that runs the build/test/deploy pipeline every time code lands on a watched branch — without one, "continuous" integration is just a branching convention with no enforcement behind it.

**Say it:** "Gitflow's branch structure is what keeps production stable with multiple features in flight; the CI server is what actually enforces it — without Jenkins or TeamCity running the pipeline on every merge, Gitflow is just a naming convention."
**Red flag:** Describing Gitflow without mentioning what happens on merge — the branching model alone doesn't buy safety; the automated pipeline behind it does.

### Business Intelligence — purpose and tools
**They ask:** "What is a BI system used for, and what tools live in that space?"

A BI system turns raw operational data into decisions — dashboards, reports, and ad-hoc analysis that let a business user answer "how are we doing" without writing a query. It sits downstream of the data warehouse, consuming cleaned, modeled data rather than raw transactional tables. Common tools: Power BI, Tableau, Looker for visualization; the underlying data pipeline (ETL, warehouse) is a prerequisite BI depends on, not a substitute for it.

**Say it:** "BI turns warehouse data into a decision a business user can act on without writing SQL — the tool is downstream of the pipeline, so a broken ETL feed shows up as a wrong number on a dashboard, not a BI bug."
**Red flag:** Debugging a "wrong" dashboard number by looking only at the BI tool's config. The bug is more often upstream, in the ETL transformation or the warehouse model feeding it.

### ETL and Data Mining in a BI context
**They ask:** "What is ETL, and how does data mining differ from standard BI reporting?"

ETL (Extract, Transform, Load) is the pipeline that pulls data from operational source systems, cleans and reshapes it into a reporting-friendly model, and loads it into a warehouse — it's the plumbing every BI dashboard depends on but never shows. Data mining is a different activity from standard reporting: reporting answers questions you already know to ask ("what were last month's sales"); mining looks for patterns and correlations you didn't know to look for (which customer segments correlate with churn) — it's exploratory and often feeds predictive models, not a fixed dashboard.

**Say it:** "Reporting answers questions you already know to ask; data mining finds the pattern you didn't know to look for — and both depend on the same ETL plumbing underneath, which is why a broken pipeline breaks both silently."
**Red flag:** Conflating a dashboard report with data mining. A scheduled sales report is standard BI; finding an unexpected churn correlation in the same data is mining — different goal, different technique.

### The full Dashboard-creation cycle
**They ask:** "Walk through the full cycle of creating a Dashboard, from requirement to delivery."

The cycle starts before any chart gets built: 1) elicit the actual business question the dashboard needs to answer (not "show me the data" — a specific decision it should inform); 2) identify and validate the source data, including data quality issues that will silently produce a wrong number; 3) define the metrics and their exact calculation (two stakeholders' definitions of "active user" often disagree — this is where that gets resolved); 4) design the visualization for the audience (an exec wants one number and a trend, an analyst wants to drill down); 5) build, validate against a manual calculation, and get sign-off before wide rollout.

**Say it:** "Before any chart gets built, I resolve the metric definition — two stakeholders' idea of 'active user' rarely match — because a dashboard that's visually polished but built on an ambiguous metric just produces a confidently wrong number."
**Red flag:** Starting a dashboard project by asking "what fields do you want on it" instead of "what decision does this need to inform." That skips the step that actually prevents building the wrong thing beautifully.

### Domains where AI/ML, Big Data, IoT, Blockchain, and AR/VR actually apply
**They ask:** "Where do AI/ML, Big Data, IoT, Blockchain, and AR/VR each fit in real projects, versus being buzzwords bolted onto a spec?"

Each earns its place when it solves a problem the alternative can't: AI/ML fits prediction or pattern-recognition problems too complex for hand-written rules (fraud detection, recommendation, demand forecasting) — not "if we call it AI it sounds impressive." Big Data tooling (distributed processing, streaming) earns its complexity only past a genuine volume/velocity threshold a normal database can't handle. IoT connects physical sensors/devices to software, common in logistics, healthcare monitoring, and smart facilities. Blockchain solves trust between mutually distrustful parties with no central authority — most enterprise use cases already have a trusted central party, so a normal database usually beats it. AR/VR fits training simulation, remote assistance, and immersive retail/real-estate visualization.

**Say it:** "Every one of these technologies earns its place by solving a problem the simpler alternative genuinely can't — most projects that reach for blockchain, for instance, already have a trusted central party, which is exactly the problem blockchain exists to remove."
**Red flag:** Proposing blockchain, AI, or AR for a requirement without first stating what constraint of the simpler approach it's actually solving. That's technology-first thinking, and it's exactly what a senior review will push back on.
